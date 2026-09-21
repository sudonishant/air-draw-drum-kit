export type GameMode =
  | 'free_draw'
  | 'virtual_drums'   // In-Air Acoustic & 808 Virtual Drum Kit
  | 'finger_gun'      // Real-Time Finger Gun Detector with Laser Bullets
  | 'ai_race'
  | 'emoji_challenge'
  | 'learn_mode'
  | 'team_battle'
  | 'mystery_word'
  | 'air_signature'
  | 'leaderboard';


export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type LearnCategory = 'alphabet' | 'numbers' | 'shapes' | 'animals';

export type HandGesture = 
  | 'drawing'       // 1 finger up (index)
  | 'erasing'       // open palm (all 5 fingers extended)
  | 'color_picker'  // 2 fingers (peace sign) -> changes color
  | 'fist'          // all fingers closed -> triggers AI check
  | 'pinch'         // thumb & index close -> brush size / click
  | 'thumbs_up'     // thumbs up -> next word / next challenge
  | 'rock_style'    // rock on / 3 fingers -> changes brush style
  | 'swipe_mode'    // fast horizontal wave -> switches game mode
  | 'idle';         // hand detected but neutral


export type BrushStyle = 
  | 'laser_glow'    // Electric neon glow with bright core
  | 'fire_flame'    // Burning fiery ember trail
  | 'magic_stars'   // Sparkling stardust glitter particles
  | 'rainbow_trail' // Chromatic shifting rainbow ribbon
  | 'calligraphy'   // Dynamic angle/speed chiseled ribbon
  | 'plasma_bolt'   // Crackling lightning plasma
  | 'smoke_cloud';  // Ethereal soft airbrush smoke

export type ArFilterType = 
  | 'none'          // Raw clean camera
  | 'thermal'       // HandFrame FX: Scientific Thermal Vision Heatmap
  | 'invert'        // HandFrame FX: Futuristic Negative / Color Invert
  | 'monochrome'    // HandFrame FX: High-Contrast Noir Black & White
  | 'edge_depth'    // HandFrame FX: Holographic Silhouette Edge Detection
  | 'pixelate'      // HandFrame FX: 8-Bit Retro Mosaic Pixelation
  | 'sepia'         // HandFrame FX: Vintage Cinematic Golden Sepia
  | 'cyberpunk'     // Sci-Fi Cyberpunk Neon HUD & Visor
  | 'angel_halo'    // Celestial Golden Angel Halo & Floating Wings
  | 'anime_aura'    // Super Saiyan Dragon Ball Aura & Lightning
  | 'kawaii_cat'    // Kawaii Anime Kitty Ears, Whiskers & Blush
  | 'retro_glitch'; // Viral 80s Synthwave VHS Glitch & Scanlines

export interface HandFrameROI {
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  leftHandPoint?: { x: number; y: number };
  rightHandPoint?: { x: number; y: number };
}


export interface Point {
  x: number;
  y: number;
  timestamp: number;
  velocity?: number;
  size?: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  style: BrushStyle;
  isRainbow?: boolean;
}

export interface VirtualAirButton {
  id: string;
  label: string;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  active?: boolean;
}


export interface RecognitionResult {
  label: string;
  category: 'shape' | 'object' | 'alphabet' | 'number';
  confidence: number;
  funFact?: string;
  alternatives?: Array<{
    label: string;
    confidence: number;
  }>;
}

export interface GalleryItem {
  id: string;
  dataUrl: string;
  label: string;
  date: string;
  score?: number;
  mode: GameMode;
}

export interface CertificateData {
  studentName: string;
  schoolName: string;
  title: string;
  date: string;
  score: number;
  accuracy: number;
  signatureImage: string; // Base64 data URL
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  school: string;
  score: number;
  mode: string;
  time: string;
}

export interface PromptItem {
  id: string;
  english: string;
  emoji: string;
  category: 'shape' | 'object' | 'animal' | 'nature' | 'vehicle' | 'alphabet' | 'number';
  difficulty: DifficultyLevel;
  hint: string;
}

export interface HandTrackingState {
  isDetected: boolean;
  gesture: HandGesture;
  position: { x: number; y: number } | null;
  depthScale: number; // 1.0 = normal, larger = closer
  handCount: number;
  secondaryPosition?: { x: number; y: number } | null;
  secondaryGesture?: HandGesture;
}
