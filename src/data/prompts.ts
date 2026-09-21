import { PromptItem } from '../types';

export const PROMPTS: PromptItem[] = [
  // EASY: Shapes & Basic Numbers
  {
    id: 'circle',
    english: 'Circle',
    emoji: '⭕',
    category: 'shape',
    difficulty: 'easy',
    hint: 'Draw a round wheel-like shape in the air!'
  },
  {
    id: 'triangle',
    english: 'Triangle',
    emoji: '🔺',
    category: 'shape',
    difficulty: 'easy',
    hint: 'Draw a 3-sided shape with pointed corners!'
  },
  {
    id: 'square',
    english: 'Square',
    emoji: '🔲',
    category: 'shape',
    difficulty: 'easy',
    hint: 'Draw a box with 4 equal sides!'
  },
  {
    id: 'star',
    english: 'Star',
    emoji: '⭐',
    category: 'shape',
    difficulty: 'easy',
    hint: 'Draw a shining 5-point star in the air!'
  },
  {
    id: 'heart',
    english: 'Heart',
    emoji: '❤️',
    category: 'shape',
    difficulty: 'easy',
    hint: 'Draw a lovely heart shape!'
  },
  {
    id: 'num_1',
    english: 'Number 1',
    emoji: '1️⃣',
    category: 'number',
    difficulty: 'easy',
    hint: 'Draw a single straight vertical line down!'
  },
  {
    id: 'num_7',
    english: 'Number 7',
    emoji: '7️⃣',
    category: 'number',
    difficulty: 'easy',
    hint: 'Draw a top horizontal stroke, then a diagonal line down!'
  },
  {
    id: 'num_8',
    english: 'Number 8',
    emoji: '8️⃣',
    category: 'number',
    difficulty: 'easy',
    hint: 'Draw two stacked circles or an infinity loop!'
  },

  // MEDIUM: Everyday Objects, Nature, Alphabet
  {
    id: 'sun',
    english: 'Sun',
    emoji: '☀️',
    category: 'nature',
    difficulty: 'medium',
    hint: 'Draw a circle with radiating rays of light!'
  },
  {
    id: 'tree',
    english: 'Tree',
    emoji: '🌳',
    category: 'nature',
    difficulty: 'medium',
    hint: 'Draw a trunk at the bottom and a leafy cloud on top!'
  },
  {
    id: 'cloud',
    english: 'Cloud',
    emoji: '☁️',
    category: 'nature',
    difficulty: 'medium',
    hint: 'Draw fluffy, floating curved bumps in the sky!'
  },
  {
    id: 'house',
    english: 'House',
    emoji: '🏠',
    category: 'object',
    difficulty: 'medium',
    hint: 'Draw a square base and a triangular roof!'
  },
  {
    id: 'smile',
    english: 'Smiley Face',
    emoji: '😊',
    category: 'object',
    difficulty: 'medium',
    hint: 'Draw a circle with two eyes and a cheerful smile!'
  },
  {
    id: 'apple',
    english: 'Apple',
    emoji: '🍎',
    category: 'object',
    difficulty: 'medium',
    hint: 'Draw a round apple with a tiny leaf on top!'
  },
  {
    id: 'car',
    english: 'Car',
    emoji: '🚗',
    category: 'vehicle',
    difficulty: 'medium',
    hint: 'Draw a car body outline with two round wheels below!'
  },
  {
    id: 'flower',
    english: 'Flower',
    emoji: '🌸',
    category: 'nature',
    difficulty: 'medium',
    hint: 'Draw a round center surrounded by gentle petals!'
  },
  {
    id: 'letter_a',
    english: 'Letter A',
    emoji: '🅰️',
    category: 'alphabet',
    difficulty: 'medium',
    hint: 'Draw two diagonal lines meeting at top with a crossbar!'
  },
  {
    id: 'letter_b',
    english: 'Letter B',
    emoji: '🅱️',
    category: 'alphabet',
    difficulty: 'medium',
    hint: 'Draw a vertical line with two rounded loops on right!'
  },

  // HARD: Complex Doodles & Animals
  {
    id: 'cat',
    english: 'Cat',
    emoji: '🐱',
    category: 'animal',
    difficulty: 'hard',
    hint: 'Draw a round face with two sharp triangular ears and whiskers!'
  },
  {
    id: 'fish',
    english: 'Fish',
    emoji: '🐟',
    category: 'animal',
    difficulty: 'hard',
    hint: 'Draw an oval body tapering to a triangular tail fin!'
  },
  {
    id: 'umbrella',
    english: 'Umbrella',
    emoji: '☂️',
    category: 'object',
    difficulty: 'hard',
    hint: 'Draw a domed canopy with a hooked handle below!'
  },
  {
    id: 'clock',
    english: 'Clock',
    emoji: '⏰',
    category: 'object',
    difficulty: 'hard',
    hint: 'Draw a round dial with two clock hands in center!'
  }
];

// Dedicated distinct word bank for Mystery Word (Pictionary Mode)
export const MYSTERY_WORDS: PromptItem[] = [
  { id: 'guitar', english: 'Acoustic Guitar', emoji: '🎸', category: 'object', difficulty: 'medium', hint: 'Musical instrument with strings, long neck, and curved body' },
  { id: 'rocket', english: 'Space Rocket', emoji: '🚀', category: 'vehicle', difficulty: 'hard', hint: 'Pointed spacecraft blasting off with fiery exhaust' },
  { id: 'pizza', english: 'Pizza Slice', emoji: '🍕', category: 'object', difficulty: 'easy', hint: 'Triangular cheesy slice with round toppings' },
  { id: 'butterfly', english: 'Fluttering Butterfly', emoji: '🦋', category: 'animal', difficulty: 'hard', hint: 'Two symmetrical colorful wings with antennae' },
  { id: 'airplane', english: 'Jet Airplane', emoji: '✈️', category: 'vehicle', difficulty: 'medium', hint: 'Long fuselage with two large wings and tail fin' },
  { id: 'diamond', english: 'Sparkling Diamond', emoji: '💎', category: 'object', difficulty: 'easy', hint: 'Faceted precious gem with angled polygonal edges' },
  { id: 'crown', english: 'Royal Crown', emoji: '👑', category: 'object', difficulty: 'medium', hint: 'Golden majestic headpiece with 3 or 5 peaks' },
  { id: 'icecream', english: 'Ice Cream Cone', emoji: '🍦', category: 'object', difficulty: 'easy', hint: 'Triangular waffle cone topped with swirled scoops' },
  { id: 'boat', english: 'Ocean Sailboat', emoji: '⛵', category: 'vehicle', difficulty: 'medium', hint: 'Curved boat hull with tall triangular sail' },
  { id: 'lightbulb', english: 'Idea Light Bulb', emoji: '💡', category: 'object', difficulty: 'medium', hint: 'Round glowing glass bulb with screw base' },
  { id: 'camera', english: 'Digital Camera', emoji: '📷', category: 'object', difficulty: 'medium', hint: 'Rectangular body with circular lens and flash' },
  { id: 'sunflower', english: 'Golden Sunflower', emoji: '🌻', category: 'nature', difficulty: 'medium', hint: 'Big dark center disc with radiating yellow petals' },
  { id: 'elephant', english: 'Giant Elephant', emoji: '🐘', category: 'animal', difficulty: 'hard', hint: 'Large body with floppy ears and long curved trunk' },
  { id: 'anchor', english: 'Ship Anchor', emoji: '똚', category: 'object', difficulty: 'medium', hint: 'Heavy iron crossbar with curved bottom flukes' },
  { id: 'volcano', english: 'Smoking Volcano', emoji: '🌋', category: 'nature', difficulty: 'hard', hint: 'Cone-shaped mountain spewing fire and ash' },
  { id: 'helicopter', english: 'Rescue Helicopter', emoji: '🚁', category: 'vehicle', difficulty: 'hard', hint: 'Cabin with spinning top rotor blades and tail propeller' }
];

// Dedicated distinct word bank for Team Battle (Alpha vs Beta Showdown)
export const TEAM_BATTLE_PROMPTS: PromptItem[] = [
  { id: 'trophy', english: 'Champion Trophy', emoji: '🏆', category: 'object', difficulty: 'medium', hint: 'Golden cup with two arched handles on a square pedestal' },
  { id: 'fire', english: 'Blazing Campfire', emoji: '🔥', category: 'nature', difficulty: 'easy', hint: 'Dancing orange and red flames over crossed firewood logs' },
  { id: 'shield', english: 'Knight Shield', emoji: '🛡️', category: 'object', difficulty: 'medium', hint: 'Curved crest armor emblem defending the team' },
  { id: 'medal', english: 'Gold Champion Medal', emoji: '🥇', category: 'object', difficulty: 'easy', hint: 'Hanging ribbon with circular gold medallion' },
  { id: 'flag', english: 'Victory Flag', emoji: '🚩', category: 'object', difficulty: 'easy', hint: 'Tall vertical flagpole with triangular fluttering banner' },
  { id: 'robot', english: 'AI Robot Guardian', emoji: '🤖', category: 'object', difficulty: 'hard', hint: 'Square metallic head with antenna and glowing eyes' },
  { id: 'bell', english: 'Academy Bell', emoji: '🔔', category: 'object', difficulty: 'easy', hint: 'Curved golden bell with ringing clapper' },
  { id: 'book', english: 'Science Textbook', emoji: '📖', category: 'object', difficulty: 'medium', hint: 'Two wide open pages bound together at center' },
  { id: 'microscope', english: 'Lab Microscope', emoji: '🔬', category: 'object', difficulty: 'hard', hint: 'Scientific optical device with eyepiece, stage, and base' },
  { id: 'telescope', english: 'Sky Telescope', emoji: '🔭', category: 'object', difficulty: 'medium', hint: 'Long optical cylinder on tripod observing the stars' },
  { id: 'compass', english: 'Navigator Compass', emoji: '🧭', category: 'object', difficulty: 'medium', hint: 'Circular dial with red needle pointing North' },
  { id: 'sword', english: 'Laser Sword', emoji: '⚔️', category: 'object', difficulty: 'easy', hint: 'Two crossed blades symbolizing epic battle' },
  { id: 'bicycle', english: 'Speed Bicycle', emoji: '🚲', category: 'vehicle', difficulty: 'hard', hint: 'Two circular wheels connected by triangular frame and handlebars' },
  { id: 'football', english: 'Sports Football', emoji: '⚽', category: 'object', difficulty: 'easy', hint: 'Round sports ball with pentagonal leather patches' },
  { id: 'planet', english: 'Ringed Saturn', emoji: '🪐', category: 'nature', difficulty: 'medium', hint: 'Round celestial sphere encircled by angled cosmic rings' },
  { id: 'lightning', english: 'Thunder Bolt', emoji: '⚡', category: 'nature', difficulty: 'easy', hint: 'Sharp zigzag electrical bolt striking from sky' }
];

export const SCHOOL_LIST = [
  'PM Shri Model Senior School',
  'PM Shri Central Academy No. 1',
  'PM Shri Global Science College',
  'PM Shri Tech Innovation Campus',
  'PM Shri Excellence High School'
];

export const EMOJI_CHALLENGES = [
  { emoji: '⭐', name: 'Star' },
  { emoji: '❤️', name: 'Heart' },
  { emoji: '☀️', name: 'Sun' },
  { emoji: '🏠', name: 'House' },
  { emoji: '🐱', name: 'Cat' },
  { emoji: '🚗', name: 'Car' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🌸', name: 'Flower' },
  { emoji: '☂️', name: 'Umbrella' },
  { emoji: '🐟', name: 'Fish' }
];
