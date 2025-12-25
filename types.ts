export enum AppStep {
  SPLASH = 'SPLASH',
  CAMERA = 'CAMERA',
  RESULT = 'RESULT',
}

export enum FilterType {
  NONE = 'NONE',
  FUTURE_EXPLORER = 'FUTURE_EXPLORER',
  CONSTELLATION = 'CONSTELLATION',
  ORBIT_AURA = 'ORBIT_AURA',
  TICKET = 'TICKET',
}

export enum CollageMode {
  SINGLE = 'SINGLE',         // 1 Photo
  GRID_2X2 = 'GRID_2X2',     // 4 Photos (Square-ish)
  STRIP_3 = 'STRIP_3',       // 3 Photos (Vertical Strip)
  STRIP_4 = 'STRIP_4',       // 4 Photos (Classic Booth Strip)
  GRID_2X3 = 'GRID_2X3',     // 6 Photos (Landscape Grid)
  GRID_3X3 = 'GRID_3X3',     // 9 Photos (Dense Grid)
}

export type TimerDuration = 3 | 5 | 10;

export enum FrameType {
  NONE = 'NONE',
  COCKPIT = 'COCKPIT',
  MAGAZINE = 'MAGAZINE'
}

export interface Sticker {
  id: number;
  type: string; // Emoji char or image identifier
  x: number;
  y: number;
  scale: number;
}

export interface GameItem {
  type: 'MAJOR' | 'CAMPUS' | 'QUOTE';
  text: string;
  icon?: string;
}

export const GAME_ITEMS: GameItem[] = [
  { type: 'MAJOR', text: 'Teknik Informatika' },
  { type: 'MAJOR', text: 'Kedokteran' },
  { type: 'MAJOR', text: 'Psikologi' },
  { type: 'MAJOR', text: 'Ilmu Komunikasi' },
  { type: 'MAJOR', text: 'Desain Komunikasi Visual' },
  { type: 'CAMPUS', text: 'Universitas Indonesia' },
  { type: 'CAMPUS', text: 'ITB' },
  { type: 'CAMPUS', text: 'UGM' },
  { type: 'QUOTE', text: 'Masa depan cerah menanti!' },
  { type: 'QUOTE', text: 'Rejeki anak sholeh' },
  { type: 'QUOTE', text: 'Lulus SNBT 2025!' },
  { type: 'QUOTE', text: 'Semangat Pejuang Kampus!' },
];
