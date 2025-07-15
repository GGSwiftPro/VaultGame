import { Graphics } from "pixi.js";
import { VAULT_CONFIG, VAULT_COLORS } from "../constants/TreasureVault";

export class VaultDoor extends Graphics {
  constructor() {
    super();
    this.draw();
  }

  private draw() {
    const { radius } = VAULT_CONFIG;
    const {
      vaultDoor,
      vaultRing,
      bolt,
      boltHighlight,
      center,
      centerHighlight,
    } = VAULT_COLORS;

    // Main vault door circle
    this.beginFill(vaultDoor).drawCircle(0, 0, radius);

    // Outer ring
    this.lineStyle(8, vaultRing).drawCircle(0, 0, radius - 4);

    // Inner details - bolts around the edge (9 bolts for 9 numbers)
    this.lineStyle(0);
    for (let i = 0; i < VAULT_CONFIG.numPositions; i++) {
      const angle = (i * Math.PI * 2) / VAULT_CONFIG.numPositions - Math.PI / 2;
      const x = Math.cos(angle) * (radius - 25);
      const y = Math.sin(angle) * (radius - 25);

      this.beginFill(bolt).drawCircle(x, y, 8);
      this.beginFill(boltHighlight).drawCircle(x, y, 5);
    }

    // Center circle for handle
    this.beginFill(center).drawCircle(0, 0, 60);
    this.beginFill(centerHighlight).drawCircle(0, 0, 55);
  }
}
