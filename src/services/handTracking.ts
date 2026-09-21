import { HandGesture, HandFrameROI } from '../types';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface EstimatedFace {
  centerX: number;
  centerY: number;
  eyeLeft: { x: number; y: number };
  eyeRight: { x: number; y: number };
  nose: { x: number; y: number };
  scale: number;
  faceMeshLandmarks?: Array<{ x: number; y: number; z: number }>;
}

export interface TrackedHand {
  landmarks: HandLandmark[];
  indexTip: { x: number; y: number };
  thumbTip: { x: number; y: number };
  middleTip: { x: number; y: number };
  ringTip: { x: number; y: number };
  pinkyTip: { x: number; y: number };
  wrist: { x: number; y: number };
  palmCenter: { x: number; y: number };
  gesture: HandGesture;
  depthScale: number; // 0.5 to 2.5
  pinchDistance: number;
  isRightHand: boolean;
  isIndexPointing: boolean;
  isPinching: boolean;
  isOpenPalm: boolean;
  isThumbsUp: boolean;
  isRockSign: boolean;
  isPeaceSign: boolean;
  isFist: boolean;
  velocity: { vx: number; vy: number };
}

export interface TrackingResult {
  hands: TrackedHand[];
  primaryHand: TrackedHand | null;
  secondaryHand: TrackedHand | null;
  estimatedFace: EstimatedFace | null;
  handFrameROI: HandFrameROI | null;
}


// MediaPipe 21 Hand Connections for glowing skeleton rendering
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17]
];

// Landmark Constants
const WRIST = 0;
const THUMB_CMC = 1;
const THUMB_MCP = 2;
const THUMB_IP = 3;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_DIP = 7;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_PIP = 10;
const MIDDLE_DIP = 11;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_PIP = 14;
const RING_DIP = 15;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_PIP = 18;
const PINKY_DIP = 19;
const PINKY_TIP = 20;

export class HandTracker {
  // Advanced One-Euro Filter parameters for jitter-free, ultra-low-latency tracking
  // Min cutoff frequency (Hz) - lower means smoother at slow speeds
  private readonly MIN_CUTOFF = 1.2;
  // Speed coefficient - higher means lower latency during fast movements
  private readonly BETA = 0.025;
  // Derivative cutoff frequency (Hz)
  private readonly D_CUTOFF = 1.0;

  // Landmark smoothing state across up to 2 hands, 21 landmarks, x/y/z coordinates
  private filterState: Array<{
    landmarks: Array<{
      x: number; y: number; z: number;
      dx: number; dy: number; dz: number;
    }>;
    lastTime: number;
    wristHistory: Array<{ x: number; y: number; z: number; time: number }>;
  }> = [];

  // Gesture temporal stabilization buffer (prevents flickering)
  private gestureHistory: HandGesture[] = [];
  private readonly GESTURE_HISTORY_SIZE = 3;

  // Face estimation cache from hand positions
  private cachedFace: EstimatedFace | null = null;
  private lastFaceTime: number = 0;

  // HandFrame FX ROI state (Director's Viewfinder)
  private lastROI: HandFrameROI | null = null;

  /**
   * One Euro Filter smoothing function for a single coordinate
   */
  private filterCoord(
    val: number,
    prevVal: number,
    prevD: number,
    dt: number,
    minCutoff: number = this.MIN_CUTOFF,
    beta: number = this.BETA,
    dCutoff: number = this.D_CUTOFF
  ): { filtered: number; dFiltered: number } {
    // 1. Calculate discrete derivative (speed)
    const rawD = (val - prevVal) / dt;
    // 2. Smooth derivative
    const alphaD = this.getAlpha(dt, dCutoff);
    const dFiltered = alphaD * rawD + (1.0 - alphaD) * prevD;
    // 3. Adaptive cutoff based on smoothed speed
    const cutoff = minCutoff + beta * Math.abs(dFiltered);
    // 4. Smooth value
    const alpha = this.getAlpha(dt, cutoff);
    const filtered = alpha * val + (1.0 - alpha) * prevVal;
    return { filtered, dFiltered };
  }

  private getAlpha(dt: number, cutoff: number): number {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  public processResults(results: { 
    multiHandLandmarks?: HandLandmark[][], 
    multiHandedness?: Array<{ label: string }> 
  }): TrackingResult {
    const hands: TrackedHand[] = [];
    const now = Date.now();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const rawLandmarks = results.multiHandLandmarks[i];
        if (!rawLandmarks || rawLandmarks.length < 21) continue;

        const isRight = results.multiHandedness && results.multiHandedness[i] 
          ? results.multiHandedness[i].label === 'Right' 
          : i === 0;

        // Ensure filter state exists for this hand index
        if (!this.filterState[i]) {
          this.filterState[i] = {
            landmarks: rawLandmarks.map(lm => ({
              x: 1.0 - lm.x, // mirror X coordinate
              y: lm.y,
              z: lm.z || 0,
              dx: 0,
              dy: 0,
              dz: 0
            })),
            lastTime: now,
            wristHistory: []
          };
        }

        const handState = this.filterState[i];
        const dt = Math.max(0.001, Math.min(0.1, (now - handState.lastTime) / 1000));
        handState.lastTime = now;

        // Apply 3D One-Euro Filter across all 21 hand landmarks
        const smoothedLandmarks: HandLandmark[] = [];
        for (let j = 0; j < 21; j++) {
          const raw = rawLandmarks[j];
          const prev = handState.landmarks[j];
          const rawMirroredX = 1.0 - raw.x;

          const resX = this.filterCoord(rawMirroredX, prev.x, prev.dx, dt);
          const resY = this.filterCoord(raw.y, prev.y, prev.dy, dt);
          const resZ = this.filterCoord(raw.z || 0, prev.z, prev.dz, dt);

          prev.x = resX.filtered;
          prev.dx = resX.dFiltered;
          prev.y = resY.filtered;
          prev.dy = resY.dFiltered;
          prev.z = resZ.filtered;
          prev.dz = resZ.dFiltered;

          // Keep in standard MediaPipe orientation for biomechanical calculations (unmirrored X)
          smoothedLandmarks.push({
            x: 1.0 - prev.x,
            y: prev.y,
            z: prev.z
          });
        }

        const depthScale = this.calculateDepthScale(smoothedLandmarks);
        const pinchDistance = this.calculateDistance(smoothedLandmarks[THUMB_TIP], smoothedLandmarks[INDEX_TIP]);

        // Calculate continuous 2D/3D velocity of wrist and index tip
        const currentWristX = handState.landmarks[WRIST].x;
        const currentWristY = handState.landmarks[WRIST].y;
        handState.wristHistory.push({ x: currentWristX, y: currentWristY, z: handState.landmarks[WRIST].z, time: now });
        if (handState.wristHistory.length > 6) {
          handState.wristHistory.shift();
        }

        let vx = 0;
        let vy = 0;
        if (handState.wristHistory.length >= 2) {
          const oldest = handState.wristHistory[0];
          const newest = handState.wristHistory[handState.wristHistory.length - 1];
          const historyDt = (newest.time - oldest.time) / 1000;
          if (historyDt > 0.01) {
            vx = (newest.x - oldest.x) / historyDt;
            vy = (newest.y - oldest.y) / historyDt;
          }
        }

        const rawAnalysis = this.analyzeGestures(smoothedLandmarks, vx);
        let stableGesture = rawAnalysis.gesture;

        // Apply temporal majority-vote stabilization for primary hand
        if (i === 0) {
          this.gestureHistory.push(rawAnalysis.gesture);
          if (this.gestureHistory.length > this.GESTURE_HISTORY_SIZE) {
            this.gestureHistory.shift();
          }

          // Count occurrences in history
          const counts: { [g: string]: number } = {};
          this.gestureHistory.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
          let bestG = stableGesture;
          let bestCount = 0;
          for (const g in counts) {
            if (counts[g] > bestCount) {
              bestCount = counts[g];
              bestG = g as HandGesture;
            }
          }
          if (bestCount >= 2) {
            stableGesture = bestG;
          }
        }

        // Smoothed all 5 fingertips, wrist, and palm center coordinates
        const indexTipPt = { x: handState.landmarks[INDEX_TIP].x, y: handState.landmarks[INDEX_TIP].y };
        const thumbTipPt = { x: handState.landmarks[THUMB_TIP].x, y: handState.landmarks[THUMB_TIP].y };
        const middleTipPt = { x: handState.landmarks[MIDDLE_TIP].x, y: handState.landmarks[MIDDLE_TIP].y };
        const ringTipPt = { x: handState.landmarks[RING_TIP].x, y: handState.landmarks[RING_TIP].y };
        const pinkyTipPt = { x: handState.landmarks[PINKY_TIP].x, y: handState.landmarks[PINKY_TIP].y };
        const wristPt = { x: handState.landmarks[WRIST].x, y: handState.landmarks[WRIST].y };
        const palmCenterPt = {
          x: (handState.landmarks[WRIST].x + handState.landmarks[MIDDLE_MCP].x) * 0.5,
          y: (handState.landmarks[WRIST].y + handState.landmarks[MIDDLE_MCP].y) * 0.5
        };

        hands.push({
          landmarks: smoothedLandmarks,
          indexTip: indexTipPt,
          thumbTip: thumbTipPt,
          middleTip: middleTipPt,
          ringTip: ringTipPt,
          pinkyTip: pinkyTipPt,
          wrist: wristPt,
          palmCenter: palmCenterPt,
          gesture: stableGesture,
          depthScale,
          pinchDistance,
          isRightHand: isRight,
          isIndexPointing: stableGesture === 'drawing' || rawAnalysis.isIndexPointing,
          isPinching: stableGesture === 'pinch' || rawAnalysis.isPinching,
          isOpenPalm: stableGesture === 'erasing' || rawAnalysis.isOpenPalm,
          isThumbsUp: stableGesture === 'thumbs_up' || rawAnalysis.isThumbsUp,
          isRockSign: stableGesture === 'rock_style' || rawAnalysis.isRockSign,
          isPeaceSign: stableGesture === 'color_picker' || rawAnalysis.isPeaceSign,
          isFist: stableGesture === 'fist' || rawAnalysis.isFist,
          velocity: { vx, vy }
        });
      }
    } else {
      this.filterState = [];
      this.gestureHistory = [];
    }

    // Estimate face center dynamically
    const estimatedFace = this.estimateFacePosition(hands, now);

    // Calculate HandFrame ROI (Director's Viewfinder box between hands)
    let handFrameROI: HandFrameROI | null = null;
    if (hands.length >= 2) {
      const h0 = hands[0];
      const h1 = hands[1];
      const pts = [
        h0.indexTip, h0.thumbTip,
        h1.indexTip, h1.thumbTip
      ];
      let minX = Math.min(...pts.map(p => p.x));
      let maxX = Math.max(...pts.map(p => p.x));
      let minY = Math.min(...pts.map(p => p.y));
      let maxY = Math.max(...pts.map(p => p.y));

      // Padding for cinematic framing
      const padX = Math.max(0.02, (maxX - minX) * 0.08);
      const padY = Math.max(0.02, (maxY - minY) * 0.08);
      minX = Math.max(0.01, minX - padX);
      maxX = Math.min(0.99, maxX + padX);
      minY = Math.max(0.01, minY - padY);
      maxY = Math.min(0.99, maxY + padY);

      const targetROI: HandFrameROI = {
        x: minX,
        y: minY,
        width: Math.max(0.08, maxX - minX),
        height: Math.max(0.08, maxY - minY),
        isActive: true,
        leftHandPoint: h0.indexTip,
        rightHandPoint: h1.indexTip
      };

      if (this.lastROI && this.lastROI.isActive) {
        const a = 0.35;
        this.lastROI = {
          x: this.lastROI.x + a * (targetROI.x - this.lastROI.x),
          y: this.lastROI.y + a * (targetROI.y - this.lastROI.y),
          width: this.lastROI.width + a * (targetROI.width - this.lastROI.width),
          height: this.lastROI.height + a * (targetROI.height - this.lastROI.height),
          isActive: true,
          leftHandPoint: targetROI.leftHandPoint,
          rightHandPoint: targetROI.rightHandPoint
        };
      } else {
        this.lastROI = targetROI;
      }
      handFrameROI = this.lastROI;
    } else if (hands.length === 1) {
      const h0 = hands[0];
      const dx = Math.abs(h0.indexTip.x - h0.thumbTip.x);
      const dy = Math.abs(h0.indexTip.y - h0.thumbTip.y);
      if (dx > 0.08 || dy > 0.08) {
        let minX = Math.min(h0.indexTip.x, h0.thumbTip.x);
        let maxX = Math.max(h0.indexTip.x, h0.thumbTip.x);
        let minY = Math.min(h0.indexTip.y, h0.thumbTip.y);
        let maxY = Math.max(h0.indexTip.y, h0.thumbTip.y);

        const padX = (maxX - minX) * 0.1;
        const padY = (maxY - minY) * 0.1;
        minX = Math.max(0.01, minX - padX);
        maxX = Math.min(0.99, maxX + padX);
        minY = Math.max(0.01, minY - padY);
        maxY = Math.min(0.99, maxY + padY);

        const targetROI: HandFrameROI = {
          x: minX,
          y: minY,
          width: Math.max(0.08, maxX - minX),
          height: Math.max(0.08, maxY - minY),
          isActive: true,
          leftHandPoint: h0.thumbTip,
          rightHandPoint: h0.indexTip
        };

        if (this.lastROI && this.lastROI.isActive) {
          const a = 0.35;
          this.lastROI = {
            x: this.lastROI.x + a * (targetROI.x - this.lastROI.x),
            y: this.lastROI.y + a * (targetROI.y - this.lastROI.y),
            width: this.lastROI.width + a * (targetROI.width - this.lastROI.width),
            height: this.lastROI.height + a * (targetROI.height - this.lastROI.height),
            isActive: true,
            leftHandPoint: targetROI.leftHandPoint,
            rightHandPoint: targetROI.rightHandPoint
          };
        } else {
          this.lastROI = targetROI;
        }
        handFrameROI = this.lastROI;
      } else {
        this.lastROI = null;
      }
    } else {
      this.lastROI = null;
    }

    return {
      hands,
      primaryHand: hands[0] || null,
      secondaryHand: hands[1] || null,
      estimatedFace,
      handFrameROI
    };
  }


  private realFaceLandmarks: Array<{ x: number; y: number; z: number }> | null = null;
  private realFaceTime: number = 0;

  public setFaceMeshResults(multiFaceLandmarks: any[]) {
    if (multiFaceLandmarks && multiFaceLandmarks.length > 0 && multiFaceLandmarks[0].length >= 468) {
      this.realFaceLandmarks = multiFaceLandmarks[0];
      this.realFaceTime = Date.now();
    }
  }

  public getLatestEstimatedFace(): EstimatedFace {
    return this.estimateFacePosition([], Date.now());
  }

  /**
   * Estimates or extracts exact face location based on real MediaPipe FaceMesh (468 landmarks)
   * with fallback to hand ergonomics
   */
  private estimateFacePosition(hands: TrackedHand[], now: number): EstimatedFace {
    if (this.realFaceLandmarks && (now - this.realFaceTime) < 1500) {
      const fl = this.realFaceLandmarks;
      const noseTip = { x: 1.0 - fl[1].x, y: fl[1].y };
      const eyeLeft = { x: 1.0 - fl[33].x, y: fl[33].y };
      const eyeRight = { x: 1.0 - fl[263].x, y: fl[263].y };
      const forehead = { x: 1.0 - fl[10].x, y: fl[10].y };
      const chin = { x: 1.0 - fl[152].x, y: fl[152].y };

      const centerX = (eyeLeft.x + eyeRight.x) * 0.5;
      const centerY = (forehead.y + chin.y) * 0.5;
      const faceHeight = Math.abs(chin.y - forehead.y);
      const faceScale = Math.max(0.6, Math.min(2.5, faceHeight * 4.5));

      return {
        centerX,
        centerY,
        eyeLeft,
        eyeRight,
        nose: noseTip,
        scale: faceScale,
        faceMeshLandmarks: fl
      };
    }

    let faceX = 0.5;
    let faceY = 0.28;
    let faceScale = 1.0;

    if (hands.length > 0) {
      const primary = hands[0];
      faceScale = primary.depthScale;

      const wrist = primary.wrist;
      faceX = 0.5 * 0.7 + (1.0 - wrist.x) * 0.3;
      faceY = Math.max(0.18, Math.min(0.38, wrist.y - 0.22));

      this.cachedFace = {
        centerX: faceX,
        centerY: faceY,
        eyeLeft: { x: faceX - 0.045 * faceScale, y: faceY - 0.015 },
        eyeRight: { x: faceX + 0.045 * faceScale, y: faceY - 0.015 },
        nose: { x: faceX, y: faceY + 0.035 * faceScale },
        scale: faceScale
      };
      this.lastFaceTime = now;
      return this.cachedFace;
    }

    return {
      centerX: 0.5,
      centerY: 0.28,
      eyeLeft: { x: 0.455, y: 0.265 },
      eyeRight: { x: 0.545, y: 0.265 },
      nose: { x: 0.5, y: 0.315 },
      scale: 1.0
    };
  }

  private calculateDepthScale(lm: HandLandmark[]): number {
    const dx = lm[WRIST].x - lm[MIDDLE_MCP].x;
    const dy = lm[WRIST].y - lm[MIDDLE_MCP].y;
    const handSpan = Math.hypot(dx, dy);
    return Math.max(0.6, Math.min(2.4, (handSpan - 0.08) * 7));
  }

  private calculateDistance(p1: HandLandmark, p2: HandLandmark): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  /**
   * Biometric joint-ratio distance check:
   * Compares tip distance from knuckle (MCP) against PIP distance from knuckle.
   * In an extended finger, tip is extended all the way out (> 1.22x pipToMcp).
   * In a curled finger (fist/pinch), tip folds back to palm (< 0.9x pipToMcp).
   * This is mathematically rotation-invariant and robust to hand tilts.
   */
  private isFingerExtended(lm: HandLandmark[], tipIdx: number, pipIdx: number, mcpIdx: number): boolean {
    const tipToWrist = this.calculateDistance(lm[tipIdx], lm[WRIST]);
    const pipToWrist = this.calculateDistance(lm[pipIdx], lm[WRIST]);
    const tipToMcp = this.calculateDistance(lm[tipIdx], lm[mcpIdx]);
    const pipToMcp = this.calculateDistance(lm[pipIdx], lm[mcpIdx]);

    return tipToWrist > pipToWrist * 1.05 && tipToMcp > pipToMcp * 1.22;
  }

  private analyzeGestures(lm: HandLandmark[], vx: number): {
    gesture: HandGesture;
    isIndexPointing: boolean;
    isPinching: boolean;
    isOpenPalm: boolean;
    isThumbsUp: boolean;
    isRockSign: boolean;
    isPeaceSign: boolean;
    isFist: boolean;
  } {
    // Distance-based extension checks for all four fingers
    const isIndexExtended = this.isFingerExtended(lm, INDEX_TIP, INDEX_PIP, INDEX_MCP);
    const isMiddleExtended = this.isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP, MIDDLE_MCP);
    const isRingExtended = this.isFingerExtended(lm, RING_TIP, RING_PIP, RING_MCP);
    const isPinkyExtended = this.isFingerExtended(lm, PINKY_TIP, PINKY_PIP, PINKY_MCP);

    const thumbTipDist = this.calculateDistance(lm[THUMB_TIP], lm[WRIST]);
    const thumbMcpDist = this.calculateDistance(lm[THUMB_MCP], lm[WRIST]);
    const isThumbSpread = thumbTipDist > thumbMcpDist * 1.2;

    // 1. Check Thumbs Up (Thumb tip pointing vertically upwards, 4 fingers curled)
    const isThumbUpgraded = 
      lm[THUMB_TIP].y < lm[THUMB_IP].y - 0.015 &&
      lm[THUMB_IP].y < lm[THUMB_MCP].y + 0.04 &&
      lm[THUMB_TIP].y < lm[INDEX_MCP].y;
    const isThumbsUp = isThumbUpgraded && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;

    if (isThumbsUp) {
      return { 
        gesture: 'thumbs_up', 
        isIndexPointing: false, 
        isPinching: false, 
        isOpenPalm: false, 
        isThumbsUp: true, 
        isRockSign: false,
        isPeaceSign: false,
        isFist: false
      };
    }

    // 2. Check Rock On (🤟 / 🤘) (Index & Pinky extended, Middle & Ring curled)
    const isRockSign = isIndexExtended && isPinkyExtended && !isMiddleExtended && !isRingExtended;
    if (isRockSign) {
      return { 
        gesture: 'rock_style', 
        isIndexPointing: false, 
        isPinching: false, 
        isOpenPalm: false, 
        isThumbsUp: false, 
        isRockSign: true,
        isPeaceSign: false,
        isFist: false
      };
    }

    // 3. Fast horizontal swipe to change mode
    if (Math.abs(vx) > 1.3 && (isIndexExtended || isMiddleExtended || isPinkyExtended)) {
      return {
        gesture: 'swipe_mode',
        isIndexPointing: false,
        isPinching: false,
        isOpenPalm: false,
        isThumbsUp: false,
        isRockSign: false,
        isPeaceSign: false,
        isFist: false
      };
    }

    // 4. Pinch distance check (Index Tip to Thumb Tip)
    const pinchDist = this.calculateDistance(lm[THUMB_TIP], lm[INDEX_TIP]);
    const isPinching = pinchDist < 0.055;

    // 5. Open Palm (🖐️ all 4 fingers extended and thumb spread) -> Magic Eraser / Clear Canvas
    const isOpenPalm = isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && isThumbSpread;
    if (isOpenPalm) {
      return { 
        gesture: 'erasing', 
        isIndexPointing: false, 
        isPinching: false, 
        isOpenPalm: true, 
        isThumbsUp: false, 
        isRockSign: false,
        isPeaceSign: false,
        isFist: false
      };
    }

    // 6. Peace Sign (✌️ Index and Middle extended, Ring and Pinky curled) -> Change Color
    const isPeaceSign = isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended;
    if (isPeaceSign) {
      return { 
        gesture: 'color_picker', 
        isIndexPointing: false, 
        isPinching: false, 
        isOpenPalm: false, 
        isThumbsUp: false, 
        isRockSign: false,
        isPeaceSign: true,
        isFist: false
      };
    }

    // 7. Closed Fist (✊ all 4 fingers curled, not thumbs up) -> AI Recognition
    const isFist = !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && !isThumbsUp;
    if (isFist) {
      return { 
        gesture: 'fist', 
        isIndexPointing: false, 
        isPinching: false, 
        isOpenPalm: false, 
        isThumbsUp: false, 
        isRockSign: false,
        isPeaceSign: false,
        isFist: true
      };
    }

    // 8. Pinching gesture
    if (isPinching) {
      return { 
        gesture: 'pinch', 
        isIndexPointing: false, 
        isPinching: true, 
        isOpenPalm: false, 
        isThumbsUp: false, 
        isRockSign: false,
        isPeaceSign: false,
        isFist: false
      };
    }

    // 9. Index Pointing / Air Pen (☝️)
    if (isIndexExtended && !isMiddleExtended && !isRingExtended) {
      return { 
        gesture: 'drawing', 
        isIndexPointing: true, 
        isPinching: false, 
        isOpenPalm: false, 
        isThumbsUp: false, 
        isRockSign: false,
        isPeaceSign: false,
        isFist: false
      };
    }

    return { 
      gesture: 'idle', 
      isIndexPointing: false, 
      isPinching: false, 
      isOpenPalm: false, 
      isThumbsUp: false, 
      isRockSign: false,
      isPeaceSign: false,
      isFist: false
    };
  }
}

export const handTracker = new HandTracker();
