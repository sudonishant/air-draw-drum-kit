# 🌟 Air Draw & AI Vision
### Touchless Gesture-Based Air Drawing & Real-Time AI Recognition System
**PM Shri School Student Visit — College Tech Orientation Program**

---

## 📖 1. Overview

**Air Draw & AI Vision** is an interactive computer vision application built for school and college tech orientation programs. It empowers students to write and draw in thin air using natural hand gestures captured by a standard webcam. An intelligent AI classification engine identifies drawn doodles, letters, numbers, and geometric shapes in real-time, accompanied by voice feedback, sound effects, celebration animations, and personalized digital certificates.

---

## ✨ 2. All 20 Features

### 🎨 Category A: Drawing & Interaction Features
1. **Multi-Color Air Pen**:
   - Raise a **Peace Sign (✌️)** to cycle through neon colors mid-air, or choose from the neon palette (Cyan, Green, Pink, Yellow, Violet, White, Rainbow).
2. **Magic Eraser Gesture**:
   - Hold an **Open Palm (🖐️)** for 1 second to instantly clear the canvas with a magic sound effect.
3. **Depth-Based Brush Sizing**:
   - Distance from camera dynamically adjusts stroke width (closer hand = thicker line, farther hand = finer line).
4. **Two-Hand Mode**:
   - Independent dual-hand tracking allowing two students to draw together or one student to sketch with both hands.
5. **Air Signature Certificate**:
   - Real air signature drawn by the student is captured and embedded directly into a certificate of excellence.

### 🏆 Category B: Game & Competition Features
6. **AI vs Human Guessing Race**:
   - 30-second countdown timer where students race against the clock to sketch target prompts for maximum points.
7. **Difficulty Levels**:
   - Easy (Shapes, Digits), Medium (Objects, Letters), Hard (Animals, Complex Items).
8. **Team Battle Mode**:
   - Team Alpha vs Team Beta turn-based competition with round management (1 to 5) and live scoring.
9. **Emoji Challenge**:
   - Target emojis (⭐, 🐱, 🚗, 🏠, etc.) displayed on screen with a real-time similarity matching gauge.
10. **Mystery Word (Pictionary)**:
    - Secret prompt visible only to the active sketcher with a peek toggle so the audience can guess freely.

### 🔊 Category C: Sensory & Fun Features
11. **Voice Feedback (Speech Synthesis)**:
    - Encouraging spoken remarks upon correct recognition (*"Awesome! It's a Cat! Great job!"*).
12. **Sound Effects**:
    - Synthesized Web Audio API effects: air swoosh on stroke, chime on recognition, and applause fanfare.
13. **Celebration Animation**:
    - Full-screen confetti fireworks burst across the display upon successful AI detection.
14. **Arcade Background Music**:
    - Playful synthesizer arcade beat that syncs with drawing pace (with volume/mute toggle).

### 📚 Category D: Smart & Educational Features
15. **Alphabet / Number Learn Mode**:
    - Semi-transparent dashed ghost templates for tracing letters (A-Z) and numbers (0-9) in the air.
16. **Pronunciation Audio**:
    - Hear phonetic spoken audio for letters and numbers.
17. **Drawing History Gallery**:
    - Auto-saves all completed drawings to a slide-out drawer with timestamps and one-click PNG downloads.
18. **Digital Certificate Generator**:
    - Generates high-res printable certificates featuring student name, school name, score, and their embedded air signature.

### 🚀 Category E: Bonus 'Wow' Features
19. **AR-Style Floating Drawing Effect**:
    - Electric glowing neon lines and laser targeting reticles overlaying the live mirrored camera stream.
20. **Live Projector Leaderboard**:
    - Projector-optimized fullscreen scoreboard featuring Top 3 Gold/Silver/Bronze podiums and school filter.

---

## ✋ 3. Hand Gestures Quick Reference

| Gesture | Hand Pose | Action |
|---|---|---|
| ☝️ **Index Finger** | Point index up, curl others | **Air Pen**: Draw smooth lines in air |
| ✌️ **Peace Sign** | Index and middle extended | **Color Switch**: Cycle pen colors |
| 🖐️ **Open Palm** | All 5 fingers extended | **Magic Eraser**: Wipe canvas clean |
| ✊ **Closed Fist** | All fingers curled | **AI Check**: Trigger AI recognition |
| 📏 **Distance (Depth)** | Move hand closer/farther | **Thickness**: Control stroke width |
| 👐 **Two Hands** | Both hands in camera frame | **Dual Artist**: Two simultaneous pens |

---

## 🚀 4. How to Run

### Quick Start:
```bash
# 1. Navigate to project folder:
cd /home/nee/Documents/antigravity/excited-borg

# 2. Run launcher:
./run.sh
```

Or manually:
```bash
npm run dev -- --host
```
Open **`http://localhost:5173`** in Google Chrome, Brave, or Edge.
