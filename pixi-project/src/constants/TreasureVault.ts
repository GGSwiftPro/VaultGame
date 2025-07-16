import { VaultConfig, VaultColors } from "../types/TreasureVault";

export const VAULT_CONFIG: VaultConfig = {
  radius: 200,
  handleRadius: 45,
  spokeLength: 35,
  spokeWidth: 8,
  numSpokes: 6,
  numPositions: 6,
  shadowOffset: 3,
};

export const VAULT_COLORS: VaultColors = {
  background: 0x2a4d3a,
  lightGradient: 0x3a5d4a,
  vaultDoor: 0x4a5d6a,
  vaultRing: 0x2a3d4a,
  bolt: 0x1a2d3a,
  boltHighlight: 0x3a4d5a,
  center: 0x3a4d5a,
  centerHighlight: 0x2a3d4a,
  handle: 0xcd7f32,
  handleHighlight: 0xffdf7f,
  shadow: 0x000000,
  indicator: 0xff6b6b,
  text: 0xffffff,
  gold: 0xffd700,
  goldHighlight: 0xffff99,
  shine: 0xffff00,
};

export const VAULT_SETTINGS = {
  COMBINATION_STEPS: 3,
  AUTO_CLOSE_DELAY: 5000,
  POSITION_ANGLE: (2 * Math.PI) / VAULT_CONFIG.numPositions,
  NUMBER_RADIUS: 250,
  INDICATOR_RADIUS: 220,
  ARROW_SIZE: 15,
  TREASURE_BARS: 8,
  SHINE_RAYS: 12,
  SHADOW_ALPHA: 0.3,
  HIGHLIGHT_ALPHA: 0.8,
  LIGHT_GRADIENT_ALPHA: 0.3,
  GOLD_HIGHLIGHT_ALPHA: 0.7,
  SHINE_ALPHA: 0.6,
} as const;
