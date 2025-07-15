export interface CombinationStep {
  steps: number;
  direction: "clockwise" | "counterclockwise";
}

export interface VaultConfig {
  radius: number;
  handleRadius: number;
  spokeLength: number;
  spokeWidth: number;
  numSpokes: number;
  numPositions: number;
  shadowOffset: number;
}

export interface VaultColors {
  background: number;
  lightGradient: number;
  vaultDoor: number;
  vaultRing: number;
  bolt: number;
  boltHighlight: number;
  center: number;
  centerHighlight: number;
  handle: number;
  handleHighlight: number;
  shadow: number;
  indicator: number;
  text: number;
  gold: number;
  goldHighlight: number;
  shine: number;
}
