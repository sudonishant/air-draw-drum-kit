import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stroke, Point, HandGesture, HandTrackingState, BrushStyle, VirtualAirButton, ArFilterType, HandFrameROI, GameMode } from '../types';
import { handTracker, HAND_CONNECTIONS } from '../services/handTracking';
import { soundService } from '../services/audioService';
import { speechService } from '../services/speechService';
import { BrushRenderer } from '../services/brushStyles';
import { ArFilterRenderer, AR_FILTERS } from '../services/arFilterRenderer';
import { HandFrameFXService } from '../services/handFrameFX';
import { virtualDrums } from '../services/virtualDrumKit';
import { fingerGun } from '../services/fingerGunDetector';
import { 
  Zap, 
  Video, 
  Eye, 
  Hand, 
  Sparkles,
  Camera
} from 'lucide-react';



export type PenMode = 'always_draw' | 'smart_gesture' | 'pinch_draw';

interface CameraCanvasProps {
  currentColor: string;
  isRainbow: boolean;
  brushSize: number;
  brushStyle: BrushStyle;
  onBrushStyleChange: (style: BrushStyle) => void;
  arFilter: ArFilterType;
  onArFilterChange: (filter: ArFilterType) => void;
  useDepthSizing: boolean;
  twoHandMode: boolean;
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  onGestureDetected?: (gesture: HandGesture) => void;
  onColorCycle: () => void;
  onClearCanvas: () => void;
  onTriggerCheck: () => void;
  onUndo: () => void;
  onNextMode?: () => void;
  onNextWord?: () => void;
  ghostTemplate?: { path: string; label: string } | null;
  currentMode?: GameMode;
}

const thisRoundBox = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

export const CameraCanvas: React.FC<CameraCanvasProps> = ({
  currentColor,
  isRainbow,
  brushSize,
  brushStyle,
  onBrushStyleChange,
  arFilter,
  onArFilterChange,
  useDepthSizing,
  twoHandMode,
  strokes,
  onStrokesChange,
  onGestureDetected,
  onColorCycle,
  onClearCanvas,
  onTriggerCheck,
  onUndo,
  onNextMode,
  onNextWord,
  ghostTemplate,
  currentMode = 'free_draw'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);


  // States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [penMode, setPenMode] = useState<PenMode>('always_draw');
  const [videoOpacity, setVideoOpacity] = useState<'high' | 'medium' | 'cinema'>('high');
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showAirButtons, setShowAirButtons] = useState<boolean>(true);

  // Internal resolution synchronized with container size for 1:1 stretched responsiveness
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });

  // Gesture Action Toast Notification
  const [gestureToast, setGestureToast] = useState<{ text: string; icon: string; color: string } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showGestureNotification = (text: string, icon: string, color: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setGestureToast({ text, icon, color });
    toastTimeoutRef.current = window.setTimeout(() => {
      setGestureToast(null);
    }, 1800);
  };

  // In-Air Hover Button Click State
  const hoveredButtonIdRef = useRef<string | null>(null);
  const hoverStartTimeRef = useRef<number>(0);
  const hoverProgressRef = useRef<number>(0);

  // Mouse / Touch drawing state
  const isMouseDownRef = useRef<boolean>(false);
  const mousePointsRef = useRef<Point[]>([]);

  // Hand tracking state
  const [trackingState, setTrackingState] = useState<HandTrackingState>({
    isDetected: false,
    gesture: 'idle',
    position: null,
    depthScale: 1.0,
    handCount: 0
  });

  const [activePointsCount, setActivePointsCount] = useState<number>(0);
  const currentStrokeRef = useRef<Point[]>([]);
  const secondaryStrokeRef = useRef<Point[]>([]);
  const lastGestureRef = useRef<HandGesture>('idle');
  const gestureDebounceTimers = useRef<{ [key: string]: number }>({});
  const rainbowHueRef = useRef<number>(0);

  // Dynamic canvas resize observer to fill container without stretch distortion
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 100) {
          const w = Math.round(rect.width);
          const h = Math.round(rect.height);
          setCanvasDims({ width: w, height: h });
          if (canvasRef.current) {
            canvasRef.current.width = w;
            canvasRef.current.height = h;
          }
          if (hudCanvasRef.current) {
            hudCanvasRef.current.width = w;
            hudCanvasRef.current.height = h;
          }
        }
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Synchronized refs to avoid stale closures in camera callbacks and animation loops
  const arFilterRef = useRef<ArFilterType>(arFilter);
  arFilterRef.current = arFilter;
  const brushStyleRef = useRef<BrushStyle>(brushStyle);
  brushStyleRef.current = brushStyle;
  const currentColorRef = useRef<string>(currentColor);
  currentColorRef.current = currentColor;
  const isRainbowRef = useRef<boolean>(isRainbow);
  isRainbowRef.current = isRainbow;
  const brushSizeRef = useRef<number>(brushSize);
  brushSizeRef.current = brushSize;
  const useDepthSizingRef = useRef<boolean>(useDepthSizing);
  useDepthSizingRef.current = useDepthSizing;
  const penModeRef = useRef<PenMode>(penMode);
  penModeRef.current = penMode;
  const showSkeletonRef = useRef<boolean>(showSkeleton);
  showSkeletonRef.current = showSkeleton;
  const showAirButtonsRef = useRef<boolean>(showAirButtons);
  showAirButtonsRef.current = showAirButtons;
  const latestTrackingRef = useRef<any>(null);

  const [isLensMode, setIsLensMode] = useState<boolean>(true);
  const isLensModeRef = useRef<boolean>(true);
  isLensModeRef.current = isLensMode;

  const currentModeRef = useRef<GameMode>(currentMode);
  currentModeRef.current = currentMode;

  const isDrumMode = currentMode === 'virtual_drums';
  const isGunMode = currentMode === 'finger_gun';
  const isDrawMode = !isDrumMode && !isGunMode;

  // Clear in-flight strokes immediately if user switches away from drawing modes
  useEffect(() => {
    if (isDrumMode || isGunMode) {
      currentStrokeRef.current = [];
      secondaryStrokeRef.current = [];
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [currentMode, isDrumMode, isGunMode]);


  // Brush Styles list for cycle
  const BRUSH_STYLES: Array<{ id: BrushStyle; label: string; icon: string }> = [
    { id: 'laser_glow', label: 'Laser Glow', icon: '⚡' },
    { id: 'fire_flame', label: 'Fire Flame', icon: '🔥' },
    { id: 'magic_stars', label: 'Magic Stars', icon: '✨' },
    { id: 'rainbow_trail', label: 'Rainbow Trail', icon: '🌈' },
    { id: 'calligraphy', label: 'Calligraphy', icon: '✒️' },
    { id: 'plasma_bolt', label: 'Plasma Bolt', icon: '⚡' },
    { id: 'smoke_cloud', label: 'Smoke Cloud', icon: '💨' }
  ];

  const handleCycleStyle = useCallback(() => {
    const current = brushStyleRef.current;
    const currentIndex = BRUSH_STYLES.findIndex(s => s.id === current);
    const next = BRUSH_STYLES[(currentIndex + 1) % BRUSH_STYLES.length];
    brushStyleRef.current = next.id;
    onBrushStyleChange(next.id);
    soundService.playColorSwitch();
    speechService.speak(`Brush style: ${next.label}`, true);
    showGestureNotification(`Style: ${next.label}`, next.icon, '#eab308');
  }, [onBrushStyleChange]);

  const handleCycleFilter = useCallback(() => {
    const current = arFilterRef.current;
    const currentIndex = AR_FILTERS.findIndex(f => f.id === current);
    const next = AR_FILTERS[(currentIndex + 1) % AR_FILTERS.length];
    arFilterRef.current = next.id;
    onArFilterChange(next.id);
    soundService.playColorSwitch();
    speechService.speak(`Filter: ${next.name}`, true);
    showGestureNotification(`Filter: ${next.name}`, next.icon, next.color);
  }, [onArFilterChange]);

  // Virtual In-Air Floating Buttons definitions
  const virtualButtons: VirtualAirButton[] = [
    { id: 'clear', label: 'CLEAR', icon: '🗑️', x: 24, y: 80, width: 115, height: 46, color: '#f43f5e' },
    { id: 'check', label: 'AI CHECK', icon: '🤖', x: 24, y: 135, width: 115, height: 46, color: '#38bdf8' },
    { id: 'filter', label: 'FILTER', icon: '✨', x: 24, y: 190, width: 115, height: 46, color: '#facc15' },
    { id: 'lens', label: isLensMode ? 'ROI LENS' : 'FULL SCRN', icon: '📸', x: 24, y: 245, width: 115, height: 46, color: '#06b6d4' },
    { id: 'style', label: 'STYLE', icon: '🎨', x: 24, y: 300, width: 115, height: 46, color: '#eab308' },
    { id: 'color', label: 'COLOR', icon: '🌈', x: 24, y: 355, width: 115, height: 46, color: '#10b981' },
    { id: 'undo', label: 'UNDO', icon: '↩️', x: 24, y: 410, width: 115, height: 46, color: '#a855f7' },
    { id: 'next', label: 'MODE ➔', icon: '🎮', x: 24, y: 465, width: 115, height: 46, color: '#ec4899' }
  ];


  const getRainbowColor = useCallback(() => {
    rainbowHueRef.current = (rainbowHueRef.current + 5) % 360;
    return `hsl(${rainbowHueRef.current}, 100%, 55%)`;
  }, []);

  // Initialize Camera & MediaPipe Hands
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cameraInstance: any = null;
    let handsInstance: any = null;
    let faceMeshInstance: any = null;
    let isCancelled = false;

    const setupTracking = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Camera API is not supported on this browser.');
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 }, 
            facingMode: 'user',
            frameRate: { ideal: 60 }
          },
          audio: false
        });

        if (isCancelled) return;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }

        // 1. Initialize MediaPipe Hands (from Google AI Edge)
        const HandsClass = (window as any).Hands;
        if (HandsClass) {
          handsInstance = new HandsClass({
            locateFile: (file: string) => `/mediapipe/${file}`
          });

          handsInstance.setOptions({
            maxNumHands: twoHandMode ? 2 : 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.55,
            minTrackingConfidence: 0.55
          });

          handsInstance.onResults((results: any) => {
            if (isCancelled) return;
            handleHandResults(results);
          });
        }

        // 2. Initialize MediaPipe FaceMesh (from Google AI Edge)
        const FaceMeshClass = (window as any).FaceMesh;
        if (FaceMeshClass) {
          try {
            faceMeshInstance = new FaceMeshClass({
              locateFile: (file: string) => `/mediapipe/${file}`
            });

            faceMeshInstance.setOptions({
              maxNumFaces: 1,
              refineLandmarks: true,
              minDetectionConfidence: 0.45,
              minTrackingConfidence: 0.45
            });

            faceMeshInstance.onResults((faceResults: any) => {
              if (isCancelled) return;
              if (faceResults.multiFaceLandmarks) {
                handTracker.setFaceMeshResults(faceResults.multiFaceLandmarks);
              }
            });
          } catch (e) {
            console.warn('MediaPipe FaceMesh init fallback:', e);
          }
        }

        // 3. Camera Pipelining across Hands & FaceMesh
        const CameraClass = (window as any).Camera;
        let frameCount = 0;
        if (CameraClass && videoRef.current) {
          cameraInstance = new CameraClass(videoRef.current, {
            onFrame: async () => {
              if (!videoRef.current) return;
              frameCount++;
              // Send every frame to Hands for maximum 60fps drawing responsiveness
              if (handsInstance) {
                await handsInstance.send({ image: videoRef.current });
              }
              // Send alternate frames to FaceMesh to maintain 60 FPS without GPU contention
              if (faceMeshInstance && frameCount % 2 === 0) {
                await faceMeshInstance.send({ image: videoRef.current });
              }
            },
            width: 1280,
            height: 720
          });
          cameraInstance.start();
        }
      } catch (err: any) {
        console.error('Camera Init Error:', err);
        setCameraError('Please allow camera permissions in your browser to enable air gestures.');
      }
    };

    setupTracking();

    return () => {
      isCancelled = true;
      if (cameraInstance) {
        try { cameraInstance.stop(); } catch {}
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [twoHandMode]);

  // Dedicated continuous 60 FPS renderer for AR Filters, glowing hand skeletons, and in-air UI
  const drawHUD = useCallback((hudCtx: CanvasRenderingContext2D, width: number, height: number) => {
    hudCtx.clearRect(0, 0, width, height);

    const activeFilter = arFilterRef.current;
    const tracking = latestTrackingRef.current;
    const hands: any[] = tracking ? tracking.hands : [];
    const face = tracking?.estimatedFace || handTracker.getLatestEstimatedFace();

    // 0. Render Active Viral AR Filter or HandFrame FX continuously at 60 FPS
    if (activeFilter && activeFilter !== 'none') {
      if (HandFrameFXService.isHandFrameFilter(activeFilter) && videoRef.current) {
        let pixelROI: HandFrameROI | null = null;
        if (tracking?.handFrameROI) {
          const rawROI = tracking.handFrameROI;
          pixelROI = {
            x: rawROI.x * width,
            y: rawROI.y * height,
            width: rawROI.width * width,
            height: rawROI.height * height,
            isActive: rawROI.isActive,
            leftHandPoint: rawROI.leftHandPoint ? { x: rawROI.leftHandPoint.x * width, y: rawROI.leftHandPoint.y * height } : undefined,
            rightHandPoint: rawROI.rightHandPoint ? { x: rawROI.rightHandPoint.x * width, y: rawROI.rightHandPoint.y * height } : undefined
          };
        }
        HandFrameFXService.renderHandFrameFX(
          hudCtx,
          videoRef.current,
          activeFilter,
          width,
          height,
          pixelROI,
          isLensModeRef.current
        );
        HandFrameFXService.renderDirectorViewfinder(
          hudCtx,
          pixelROI,
          activeFilter,
          hands,
          isLensModeRef.current
        );
      } else {
        ArFilterRenderer.render(hudCtx, activeFilter, width, height, hands, face);
      }
    } else if (tracking?.handFrameROI && tracking.handFrameROI.isActive) {
      // Even when activeFilter is none, if user frames with hands, show subtle director viewfinder
      const rawROI = tracking.handFrameROI;
      const pixelROI: HandFrameROI = {
        x: rawROI.x * width,
        y: rawROI.y * height,
        width: rawROI.width * width,
        height: rawROI.height * height,
        isActive: rawROI.isActive,
        leftHandPoint: rawROI.leftHandPoint ? { x: rawROI.leftHandPoint.x * width, y: rawROI.leftHandPoint.y * height } : undefined,
        rightHandPoint: rawROI.rightHandPoint ? { x: rawROI.rightHandPoint.x * width, y: rawROI.rightHandPoint.y * height } : undefined
      };
      HandFrameFXService.renderDirectorViewfinder(
        hudCtx,
        pixelROI,
        'thermal',
        hands,
        isLensModeRef.current
      );
    }

    // 1. Virtual Drum Kit Mode (आभासी ड्रम किट)
    if (currentModeRef.current === 'virtual_drums') {
      virtualDrums.update(hands, width, height);
      virtualDrums.render(hudCtx, width, height, hands);
    }

    // 2. Finger Gun Detector Mode (Real-Time 👉💥 Hand Gesture Recognition)
    if (currentModeRef.current === 'finger_gun') {
      fingerGun.update(hands, width, height);
      fingerGun.render(hudCtx, width, height, hands);
    }

    // 3. Draw In-Air Floating Virtual Buttons
    if (showAirButtonsRef.current) {
      virtualButtons.forEach(btn => {
        const isHovered = hoveredButtonIdRef.current === btn.id;

        hudCtx.save();
        hudCtx.fillStyle = isHovered ? `${btn.color}33` : 'rgba(15, 23, 42, 0.75)';
        hudCtx.strokeStyle = isHovered ? '#ffffff' : `${btn.color}99`;
        hudCtx.lineWidth = isHovered ? 3 : 1.5;
        hudCtx.shadowColor = btn.color;
        hudCtx.shadowBlur = isHovered ? 20 : 8;

        thisRoundBox(hudCtx, btn.x, btn.y, btn.width, btn.height, 14);
        hudCtx.fill();
        hudCtx.stroke();

        hudCtx.shadowBlur = 0;
        hudCtx.fillStyle = '#ffffff';
        hudCtx.font = 'bold 13px Outfit, sans-serif';
        hudCtx.textAlign = 'center';
        hudCtx.fillText(`${btn.icon} ${btn.label}`, btn.x + btn.width / 2, btn.y + btn.height / 2 + 5);

        if (isHovered) {
          const progress = hoverProgressRef.current;
          hudCtx.strokeStyle = '#ffffff';
          hudCtx.lineWidth = 4;
          hudCtx.beginPath();
          hudCtx.arc(btn.x + btn.width - 15, btn.y + 15, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
          hudCtx.stroke();
        }

        hudCtx.restore();
      });
    }

    // 2. Draw Glowing Futuristic Hand Skeleton & Sparkler Reticle
    if (hands.length > 0 && showSkeletonRef.current) {
      hands.forEach((hand: any, handIdx: number) => {
        const lm = hand.landmarks;
        const handColor = handIdx === 0 ? '#06b6d4' : '#ec4899';

        hudCtx.save();
        hudCtx.strokeStyle = `${handColor}99`;
        hudCtx.lineWidth = 3;
        hudCtx.shadowColor = handColor;
        hudCtx.shadowBlur = 10;

        HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
          const p1 = lm[startIdx];
          const p2 = lm[endIdx];
          if (!p1 || !p2) return;

          const x1 = (1.0 - p1.x) * width;
          const y1 = p1.y * height;
          const x2 = (1.0 - p2.x) * width;
          const y2 = p2.y * height;

          hudCtx.beginPath();
          hudCtx.moveTo(x1, y1);
          hudCtx.lineTo(x2, y2);
          hudCtx.stroke();
        });

        lm.forEach((pt: any, jIdx: number) => {
          const px = (1.0 - pt.x) * width;
          const py = pt.y * height;

          hudCtx.beginPath();
          hudCtx.arc(px, py, jIdx === 8 ? 8 : 4, 0, Math.PI * 2);
          hudCtx.fillStyle = jIdx === 8 ? '#ffffff' : handColor;
          hudCtx.shadowBlur = jIdx === 8 ? 20 : 8;
          hudCtx.fill();
        });

        // In Virtual Drums or Finger Gun mode, do not show air drawing pen reticles or pen text labels
        const activeMode = currentModeRef.current;
        const isDrawingMode = activeMode !== 'virtual_drums' && activeMode !== 'finger_gun';

        if (isDrawingMode) {
          // Air Pen Tip Reticle
          const tipX = hand.indexTip.x * width;
          const tipY = hand.indexTip.y * height;
          const isOverVirtualButton = showAirButtonsRef.current && tipX < 155;

          const currentPenMode = penModeRef.current;
          const isDrawingActive = !isOverVirtualButton && (
            currentPenMode === 'always_draw' || 
            (currentPenMode === 'smart_gesture' && hand.gesture === 'drawing') ||
            (currentPenMode === 'pinch_draw' && hand.isPinching)
          );

          hudCtx.save();
          hudCtx.translate(tipX, tipY);

          if (isDrawingActive) {
            hudCtx.strokeStyle = currentColorRef.current;
            hudCtx.lineWidth = 3;
            hudCtx.shadowColor = currentColorRef.current;
            hudCtx.shadowBlur = 18;

            hudCtx.beginPath();
            hudCtx.arc(0, 0, 16, 0, Math.PI * 2);
            hudCtx.stroke();

            hudCtx.fillStyle = '#ffffff';
            hudCtx.beginPath();
            hudCtx.arc(0, 0, 6, 0, Math.PI * 2);
            hudCtx.fill();

            // Reticle Crosshairs
            hudCtx.beginPath();
            hudCtx.moveTo(-22, 0); hudCtx.lineTo(-10, 0);
            hudCtx.moveTo(10, 0);  hudCtx.lineTo(22, 0);
            hudCtx.moveTo(0, -22); hudCtx.lineTo(0, -10);
            hudCtx.moveTo(0, 10);  hudCtx.lineTo(0, 22);
            hudCtx.stroke();
          } else {
            hudCtx.strokeStyle = '#38bdf8';
            hudCtx.lineWidth = 2;
            hudCtx.beginPath();
            hudCtx.arc(0, 0, 12, 0, Math.PI * 2);
            hudCtx.stroke();

            hudCtx.fillStyle = '#38bdf8';
            hudCtx.beginPath();
            hudCtx.arc(0, 0, 4, 0, Math.PI * 2);
            hudCtx.fill();
          }
          hudCtx.restore();

          // Action Gesture Floating Badge beside index fingertip
          hudCtx.save();
          if (isDrawingActive) {
            hudCtx.font = 'bold 12px Outfit, sans-serif';
            hudCtx.fillStyle = '#ffffff';
            hudCtx.shadowColor = currentColorRef.current;
            hudCtx.shadowBlur = 10;
            hudCtx.fillText(`✍️ AIR PEN [${brushStyleRef.current.toUpperCase()}]`, tipX + 22, tipY - 8);
          } else {
            hudCtx.font = 'bold 13px Outfit, sans-serif';
            hudCtx.fillStyle = '#38bdf8';

            let gestureLabel = '☝️ HOVER (Ready)';
            if (isOverVirtualButton) gestureLabel = '👆 AIR HOVER SELECT';
            else if (hand.isThumbsUp || hand.gesture === 'thumbs_up') gestureLabel = '👍 THUMBS UP (Next)';
            else if (hand.isRockSign || hand.gesture === 'rock_style') gestureLabel = '🤟 ROCK ON (Style)';
            else if (hand.isOpenPalm || hand.gesture === 'erasing') gestureLabel = '🖐️ MAGIC ERASER';
            else if (hand.isPeaceSign || hand.gesture === 'color_picker') gestureLabel = '✌️ COLOR CHANGE';
            else if (hand.isFist || hand.gesture === 'fist') gestureLabel = '✊ AI RECOGNIZE';

            hudCtx.fillText(gestureLabel, tipX + 20, tipY - 8);
          }
          hudCtx.restore();
        }
        hudCtx.restore();
      });
    }
  }, []);

  // Continuous 60 FPS animation loop for AR Filters & HUD elements
  useEffect(() => {
    let animId: number;
    const loop = () => {
      const hud = hudCanvasRef.current;
      if (hud) {
        const hudCtx = hud.getContext('2d');
        if (hudCtx && hud.width > 0 && hud.height > 0) {
          drawHUD(hudCtx, hud.width, hud.height);
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [drawHUD]);

  // Handle Hand Results, In-Air Hover Buttons & Tracking State
  const handleHandResults = (results: any) => {
    const tracking = handTracker.processResults(results);
    latestTrackingRef.current = tracking;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    if (!tracking.primaryHand) {
      if (currentStrokeRef.current.length > 1) {
        commitStroke(
          currentStrokeRef.current, 
          isRainbowRef.current ? getRainbowColor() : currentColorRef.current, 
          brushSizeRef.current, 
          brushStyleRef.current
        );
        currentStrokeRef.current = [];
      }
      setTrackingState({
        isDetected: false,
        gesture: 'idle',
        position: null,
        depthScale: 1.0,
        handCount: 0
      });
      hoveredButtonIdRef.current = null;
      return;
    }

    const primary = tracking.primaryHand;
    const gesture = primary.gesture;
    const posX = primary.indexTip.x * width;
    const posY = primary.indexTip.y * height;

    const calculatedWidth = useDepthSizingRef.current 
      ? Math.max(4, Math.min(32, brushSizeRef.current * primary.depthScale))
      : brushSizeRef.current;

    setTrackingState({
      isDetected: true,
      gesture,
      position: { x: posX, y: posY },
      depthScale: primary.depthScale,
      handCount: tracking.hands.length
    });

    if (onGestureDetected) onGestureDetected(gesture);

    // In-Air Virtual Buttons Hover
    if (showAirButtonsRef.current) {
      const hoveredBtn = virtualButtons.find(b => 
        posX >= b.x && posX <= b.x + b.width &&
        posY >= b.y && posY <= b.y + b.height
      );

      if (hoveredBtn) {
        if (currentStrokeRef.current.length > 1) {
          commitStroke(
            currentStrokeRef.current, 
            isRainbowRef.current ? getRainbowColor() : currentColorRef.current, 
            calculatedWidth, 
            brushStyleRef.current
          );
          currentStrokeRef.current = [];
        }

        if (hoveredButtonIdRef.current !== hoveredBtn.id) {
          hoveredButtonIdRef.current = hoveredBtn.id;
          hoverStartTimeRef.current = Date.now();
          hoverProgressRef.current = 0;
        } else {
          const elapsed = Date.now() - hoverStartTimeRef.current;
          hoverProgressRef.current = Math.min(1.0, elapsed / 450);

          if (elapsed > 450 || primary.isPinching) {
            triggerAirButtonAction(hoveredBtn.id);
            hoverStartTimeRef.current = Date.now() + 1000;
            hoverProgressRef.current = 0;
          }
        }
        return;
      } else {
        hoveredButtonIdRef.current = null;
        hoverProgressRef.current = 0;
      }
    }

    const now = Date.now();

    // FULL GESTURE CONTROLLER (All changes controllable via air gestures!)
    const activeMode = currentModeRef.current;
    const isDrawingMode = activeMode !== 'virtual_drums' && activeMode !== 'finger_gun';

    // 1. Thumbs Up (👍) -> Next Word / Challenge / Round (Only in drawing & game modes)
    if (isDrawingMode && (primary.isThumbsUp || gesture === 'thumbs_up')) {
      const lastTrigger = gestureDebounceTimers.current['thumbs_up'] || 0;
      if (now - lastTrigger > 1000) {
        gestureDebounceTimers.current['thumbs_up'] = now;
        soundService.playChime();
        speechService.speak('Next prompt loaded!', true);
        if (onNextWord) onNextWord();
        showGestureNotification('Next Word / Challenge Activated!', '👍', '#eab308');
      }
    }

    // 2. Rock Sign (🤟) -> Cycle Brush Styles (Only in drawing modes!)
    if (isDrawingMode && (primary.isRockSign || gesture === 'rock_style')) {
      const lastTrigger = gestureDebounceTimers.current['rock_style'] || 0;
      if (now - lastTrigger > 800) {
        gestureDebounceTimers.current['rock_style'] = now;
        handleCycleStyle();
      }
    }

    // 3. Horizontal Fast Swipe (👉 / 👈) -> Switch Game Mode (Global - available anywhere)
    if (gesture === 'swipe_mode') {
      const lastTrigger = gestureDebounceTimers.current['swipe_mode'] || 0;
      if (now - lastTrigger > 1100) {
        gestureDebounceTimers.current['swipe_mode'] = now;
        soundService.playColorSwitch();
        speechService.speak('Game mode changed!', true);
        if (onNextMode) {
          onNextMode();
          showGestureNotification('Game Mode Switched via Air Swipe!', '🎮', '#ec4899');
        }
      }
    }

    // 4. Open Palm (🖐️) -> Magic Eraser / Clear Canvas (Only in drawing modes!)
    if (isDrawingMode && (primary.isOpenPalm || gesture === 'erasing')) {
      const lastTrigger = gestureDebounceTimers.current['erasing'] || 0;
      if (now - lastTrigger > 900) {
        gestureDebounceTimers.current['erasing'] = now;
        soundService.playClearSound();
        speechService.speak('Canvas cleared!', true);
        onClearCanvas();
        currentStrokeRef.current = [];
        showGestureNotification('Canvas Cleared via Open Palm!', '🖐️', '#f43f5e');
      }
    }

    // 5. Peace Sign (✌️) -> Change Color (Only in drawing modes!)
    if (isDrawingMode && (primary.isPeaceSign || gesture === 'color_picker')) {
      const lastTrigger = gestureDebounceTimers.current['color_picker'] || 0;
      if (now - lastTrigger > 700) {
        gestureDebounceTimers.current['color_picker'] = now;
        soundService.playColorSwitch();
        onColorCycle();
        speechService.speak('Drawing color switched!', true);
        showGestureNotification('Color Changed via Peace Sign!', '✌️', '#10b981');
      }
    }

    // 6. Closed Fist (✊) -> Trigger AI Recognition (Only in drawing modes!)
    if (isDrawingMode && (primary.isFist || gesture === 'fist')) {
      const lastTrigger = gestureDebounceTimers.current['fist'] || 0;
      if (now - lastTrigger > 1200) {
        gestureDebounceTimers.current['fist'] = now;
        soundService.playSwoosh();
        speechService.speak('AI analyzing your drawing!', true);
        onTriggerCheck();
        showGestureNotification('AI Recognition Triggered via Fist!', '✊', '#38bdf8');
      }
    }

    // 7. Pinch Thumb & Index (🤏) -> Switch Filter On-The-Fly (HandFrame FX Gesture in Drawing modes)
    if (isDrawingMode && primary.isPinching && penModeRef.current !== 'pinch_draw') {
      const lastTrigger = gestureDebounceTimers.current['pinch_filter'] || 0;
      if (now - lastTrigger > 800) {
        gestureDebounceTimers.current['pinch_filter'] = now;
        handleCycleFilter();
      }
    }

    // Drawing Execution: do not draw during special action gestures to avoid accidental scribbles
    const isSpecialActionGesture = 
      primary.isThumbsUp || 
      primary.isRockSign || 
      primary.isOpenPalm ||
      primary.isPeaceSign ||
      primary.isFist ||
      (primary.isPinching && penModeRef.current !== 'pinch_draw') ||
      gesture === 'thumbs_up' ||
      gesture === 'rock_style' ||
      gesture === 'erasing' || 
      gesture === 'fist' || 
      gesture === 'color_picker';


    const isMusicOrGun = currentModeRef.current === 'virtual_drums' || currentModeRef.current === 'finger_gun';

    const shouldDraw = !isMusicOrGun && !isSpecialActionGesture && (
      penModeRef.current === 'always_draw' || 
      (penModeRef.current === 'smart_gesture' && (gesture === 'drawing' || primary.isIndexPointing)) ||
      (penModeRef.current === 'pinch_draw' && primary.isPinching)
    );


    if (shouldDraw) {
      currentStrokeRef.current.push({ x: posX, y: posY, timestamp: Date.now() });
      setActivePointsCount(currentStrokeRef.current.length);
      if (currentStrokeRef.current.length % 5 === 0) {
        soundService.playSwoosh();
      }
      renderActiveDrawing();
    } else {
      if (currentStrokeRef.current.length > 1) {
        commitStroke(
          currentStrokeRef.current, 
          isRainbowRef.current ? getRainbowColor() : currentColorRef.current, 
          calculatedWidth,
          brushStyleRef.current
        );
        currentStrokeRef.current = [];
        setActivePointsCount(0);
      }
    }

    // Two Hand Drawing Mode (Only in drawing modes)
    if (!isMusicOrGun && twoHandMode && tracking.secondaryHand) {
      const sec = tracking.secondaryHand;
      const secX = sec.indexTip.x * width;
      const secY = sec.indexTip.y * height;
      if (sec.gesture === 'drawing' || penModeRef.current === 'always_draw') {
        secondaryStrokeRef.current.push({ x: secX, y: secY, timestamp: Date.now() });
        renderActiveDrawing();
      } else if (secondaryStrokeRef.current.length > 1) {
        commitStroke(secondaryStrokeRef.current, '#ec4899', calculatedWidth, 'plasma_bolt');
        secondaryStrokeRef.current = [];
      }
    }

    lastGestureRef.current = gesture;
  };


  const triggerAirButtonAction = (btnId: string) => {
    soundService.playColorSwitch();
    switch (btnId) {
      case 'clear':
        soundService.playClearSound();
        onClearCanvas();
        showGestureNotification('Cleared Canvas!', '🗑️', '#f43f5e');
        break;
      case 'check':
        onTriggerCheck();
        showGestureNotification('AI Analyzing Drawing...', '🤖', '#38bdf8');
        break;
      case 'filter':
        handleCycleFilter();
        break;
      case 'lens':
        setIsLensMode(prev => {
          const next = !prev;
          isLensModeRef.current = next;
          soundService.playColorSwitch();
          showGestureNotification(next ? 'Lens Box Mode' : 'Full Screen Mode', '📸', '#06b6d4');
          speechService.speak(next ? 'HandFrame Lens Box' : 'Full Screen Filter', true);
          return next;
        });
        break;
      case 'style':
        handleCycleStyle();
        break;
      case 'color':
        onColorCycle();
        showGestureNotification('Color Changed!', '🌈', '#10b981');
        break;
      case 'undo':
        onUndo();
        showGestureNotification('Undid Last Stroke!', '↩️', '#a855f7');
        break;
      case 'next':
        if (onNextMode) {
          onNextMode();
          showGestureNotification('Switched Game Mode!', '🎮', '#ec4899');
        }
        break;
    }
  };

  const commitStroke = (points: Point[], color: string, width: number, style: BrushStyle) => {
    if (points.length < 2) return;
    const newStroke: Stroke = {
      points: [...points],
      color,
      width,
      style,
      isRainbow
    };
    onStrokesChange([...strokes, newStroke]);
  };

  const renderActiveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (ghostTemplate) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([14, 14]);
      try {
        const p = new Path2D(ghostTemplate.path);
        ctx.stroke(p);
      } catch {}
      ctx.restore();
    }

    [...strokes].forEach(stroke => {
      BrushRenderer.renderStroke(ctx, stroke.points, stroke.color, stroke.width, stroke.style);
    });

    if (currentStrokeRef.current.length > 1) {
      const activeColor = isRainbow ? getRainbowColor() : currentColor;
      BrushRenderer.renderStroke(ctx, currentStrokeRef.current, activeColor, brushSize, brushStyle);
    }

    if (mousePointsRef.current.length > 1) {
      const activeColor = isRainbow ? getRainbowColor() : currentColor;
      BrushRenderer.renderStroke(ctx, mousePointsRef.current, activeColor, brushSize, brushStyle);
    }

    if (twoHandMode && secondaryStrokeRef.current.length > 1) {
      BrushRenderer.renderStroke(ctx, secondaryStrokeRef.current, '#ec4899', brushSize, 'plasma_bolt');
    }
  };

  const thisRoundBox = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = canvasDims.width / rect.width;
    const scaleY = canvasDims.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (showAirButtons) {
      const btn = virtualButtons.find(b => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height);
      if (btn) {
        triggerAirButtonAction(btn.id);
        return;
      }
    }

    isMouseDownRef.current = true;
    mousePointsRef.current = [{ x, y, timestamp: Date.now() }];
    renderActiveDrawing();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = canvasDims.width / rect.width;
    const scaleY = canvasDims.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    mousePointsRef.current.push({ x, y, timestamp: Date.now() });
    if (mousePointsRef.current.length % 5 === 0) {
      soundService.playSwoosh();
    }
    renderActiveDrawing();
  };

  const handlePointerUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    if (mousePointsRef.current.length > 1) {
      commitStroke(mousePointsRef.current, isRainbow ? getRainbowColor() : currentColor, brushSize, brushStyle);
    }
    mousePointsRef.current = [];
    renderActiveDrawing();
  };

  useEffect(() => {
    renderActiveDrawing();
  }, [strokes, ghostTemplate, brushStyle]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl touch-none cursor-crosshair group select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none" />

      {/* Video Feed: Scaled to 100% full stretched aspect ratio */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-fill -scale-x-100 filter contrast-105 brightness-105 transition-opacity duration-300 ${
          videoOpacity === 'high' 
            ? 'opacity-90' 
            : videoOpacity === 'medium' 
            ? 'opacity-60' 
            : 'opacity-20'
        }`}
        playsInline
        muted
      />

      {/* Drawing Strokes Canvas: Matches container 1:1 */}
      <canvas
        ref={canvasRef}
        width={canvasDims.width}
        height={canvasDims.height}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Futuristic HUD Canvas (Air buttons, skeletons, sparklers, AR filters): Matches container 1:1 */}
      <canvas
        ref={hudCanvasRef}
        width={canvasDims.width}
        height={canvasDims.height}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* Gesture Action Toast Notification in Center of Screen */}
      {gestureToast && (
        <div className="absolute top-20 z-40 px-6 py-2.5 rounded-2xl bg-slate-900/95 border-2 shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200"
          style={{ borderColor: gestureToast.color }}
        >
          <span className="text-2xl">{gestureToast.icon}</span>
          <span className="text-sm font-black text-white font-mono tracking-wide">
            {gestureToast.text}
          </span>
        </div>
      )}

      {/* Top Floating Live Status Banner */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#131722]/90 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span className="text-[11px] font-bold tracking-wide text-white uppercase font-mono">
              {cameraActive ? '60 FPS ACTIVE' : 'CAMERA OFF'}
            </span>
          </div>
          <div className="h-3.5 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Hand:</span>
            <span className={`font-bold font-mono text-[11px] ${trackingState.isDetected ? 'text-cyan-400' : 'text-amber-400'}`}>
              {trackingState.isDetected ? `DETECTED (${trackingState.handCount})` : 'Show hand to camera'}
            </span>
          </div>
        </div>

        {/* Current Brush Style Display - Only in Drawing Modes */}
        {isDrawMode && (
          <div className="flex items-center gap-2 bg-[#131722]/90 backdrop-blur-md border border-amber-500/40 px-3.5 py-1.5 rounded-xl shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">
              {brushStyle.toUpperCase().replace('_', ' ')}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleCycleStyle(); }}
              className="ml-1.5 px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/30"
            >
              🤟 Style
            </button>
          </div>
        )}

        {/* Pen Mode Switcher - Only in Drawing Modes */}
        {isDrawMode && (
          <div className="flex items-center gap-1 bg-[#131722]/90 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-lg">
            <button
              onClick={(e) => { e.stopPropagation(); setPenMode('always_draw'); }}
              title="Continuous drawing wherever index finger moves"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                penMode === 'always_draw' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Continuous
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setPenMode('smart_gesture'); }}
              title="Draws only when pointing index finger up"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                penMode === 'smart_gesture' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Smart Gesture
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setPenMode('pinch_draw'); }}
              title="Pinch thumb and index to draw"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                penMode === 'pinch_draw' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pinch
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2.5 pointer-events-auto">
        {/* Subtle gesture reminder */}
        {isDrawMode ? (
          <div className="flex items-center gap-2 bg-[#0c1017]/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs text-slate-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">☝️ Point to Draw</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400">🖐️ Palm to Erase</span>
            <span className="text-white/20">•</span>
            <span className="text-amber-300">🤏 Pinch for Filter</span>
          </div>
        ) : isDrumMode ? (
          <div className="flex items-center gap-2 bg-[#0c1017]/80 backdrop-blur-md border border-amber-500/20 px-3 py-1 rounded-full text-xs text-slate-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300">🥁 Air Drumsticks Active</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400">Strike Pads with Fingertips</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#0c1017]/80 backdrop-blur-md border border-rose-500/20 px-3 py-1 rounded-full text-xs text-slate-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="font-semibold text-rose-300">👉 Finger Gun Ready</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400">Drop Thumb to Fire Laser</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-[#131722]/90 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-xl shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLensMode(prev => {
                const next = !prev;
                isLensModeRef.current = next;
                showGestureNotification(next ? 'HandFrame: Lens Box' : 'HandFrame: Full Screen', '📸', '#06b6d4');
                speechService.speak(next ? 'HandFrame Lens Box' : 'Full Screen Filter', true);
                return next;
              });
            }}
            title="Toggle between HandFrame Lens Box and Fullscreen Filter"
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              isLensMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isLensMode ? 'Lens Box' : 'Full Scrn'}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setShowAirButtons(!showAirButtons); }}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              showAirButtons ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Air Menu</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setShowSkeleton(!showSkeleton); }}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              showSkeleton ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Skeleton</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setVideoOpacity(prev => prev === 'high' ? 'medium' : prev === 'medium' ? 'cinema' : 'high');
            }}
            className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 flex items-center gap-1 transition"
          >
            <Video className="w-3.5 h-3.5 text-amber-400" />
            <span>{videoOpacity === 'high' ? 'Video High' : videoOpacity === 'medium' ? 'Video Mid' : 'Video Dark'}</span>
          </button>
        </div>
      </div>

      {/* Camera Error Modal */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-40 p-6 text-center">
          <div className="p-6 bg-slate-900 border border-red-500/60 rounded-3xl max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-red-400 mb-2">Camera Access Required</h3>
            <p className="text-sm text-slate-300 mb-4">{cameraError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
            >
              Retry Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
