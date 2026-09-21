export interface GhostTemplate {
  id: string;
  label: string;
  category: 'alphabet' | 'number' | 'shape';
  path: string; // SVG path normalized for 1280x720 canvas
}

export const GHOST_TEMPLATES: GhostTemplate[] = [
  // Numbers
  {
    id: '1',
    label: 'Number 1',
    category: 'number',
    path: 'M 640 180 L 640 540'
  },
  {
    id: '7',
    label: 'Number 7',
    category: 'number',
    path: 'M 520 200 L 760 200 L 580 540'
  },
  {
    id: '8',
    label: 'Number 8',
    category: 'number',
    path: 'M 640 200 C 560 200 560 360 640 360 C 720 360 720 200 640 200 Z M 640 360 C 540 360 540 540 640 540 C 740 540 740 360 640 360 Z'
  },
  // Letters
  {
    id: 'A',
    label: 'Letter A',
    category: 'alphabet',
    path: 'M 640 180 L 500 540 M 640 180 L 780 540 M 550 400 L 730 400'
  },
  {
    id: 'B',
    label: 'Letter B',
    category: 'alphabet',
    path: 'M 540 180 L 540 540 M 540 180 C 740 180 740 360 540 360 C 760 360 760 540 540 540'
  },
  {
    id: 'C',
    label: 'Letter C',
    category: 'alphabet',
    path: 'M 740 220 C 540 180 500 540 740 500'
  },
  // Shapes
  {
    id: 'circle',
    label: 'Circle',
    category: 'shape',
    path: 'M 640 180 C 760 180 840 260 840 360 C 840 460 760 540 640 540 C 520 540 440 460 440 360 C 440 260 520 180 640 180 Z'
  },
  {
    id: 'star',
    label: 'Star',
    category: 'shape',
    path: 'M 640 160 L 675 280 L 795 280 L 700 355 L 735 475 L 640 405 L 545 475 L 580 355 L 485 280 L 605 280 Z'
  },
  {
    id: 'heart',
    label: 'Heart',
    category: 'shape',
    path: 'M 640 250 C 640 180 500 180 500 280 C 500 420 640 520 640 540 C 640 520 780 420 780 280 C 780 180 640 180 640 250 Z'
  }
];
