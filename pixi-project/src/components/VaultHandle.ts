import { Graphics } from "pixi.js";
import {
  VAULT_CONFIG,
  VAULT_COLORS,
  VAULT_SETTINGS,
} from "../constants/TreasureVault";

export class VaultHandle extends Graphics {
  constructor() {
    super();
    this.draw();
    this.setupInteraction();
  }

  private draw() {
    const { handleRadius, spokeLength, spokeWidth, numSpokes, shadowOffset } =
      VAULT_CONFIG;
    const { handle, handleHighlight, shadow } = VAULT_COLORS;
    const { SHADOW_ALPHA, HIGHLIGHT_ALPHA } = VAULT_SETTINGS;

    // Draw shadow first (offset slightly)
    this.beginFill(shadow, SHADOW_ALPHA);
    this.drawCircle(shadowOffset, shadowOffset, 15);

    // Shadow spokes
    this.lineStyle(spokeWidth, shadow, SHADOW_ALPHA);
    for (let i = 0; i < numSpokes; i++) {
      const angle = (i * Math.PI * 2) / numSpokes;
      const x = Math.cos(angle) * spokeLength + shadowOffset;
      const y = Math.sin(angle) * spokeLength + shadowOffset;

      this.moveTo(shadowOffset, shadowOffset);
      this.lineTo(x, y);

      // Shadow grips at the end of spokes
      this.lineStyle(0);
      this.beginFill(shadow, SHADOW_ALPHA).drawCircle(x, y, 6);
    }

    // Shadow outer ring
    this.lineStyle(4, shadow, SHADOW_ALPHA);
    this.drawCircle(shadowOffset, shadowOffset, handleRadius);

    // Now draw the actual handle on top
    // Handle center hub
    this.beginFill(handle).drawCircle(0, 0, 15);

    // Handle spokes (ship wheel style)
    this.lineStyle(spokeWidth, handle);
    for (let i = 0; i < numSpokes; i++) {
      const angle = (i * Math.PI * 2) / numSpokes;
      const x = Math.cos(angle) * spokeLength;
      const y = Math.sin(angle) * spokeLength;

      this.moveTo(0, 0);
      this.lineTo(x, y);

      // Handle grips at the end of spokes
      this.lineStyle(0);
      this.beginFill(handle).drawCircle(x, y, 6);
    }

    // Outer ring connecting the spokes
    this.lineStyle(4, handle);
    this.drawCircle(0, 0, handleRadius);

    // Add highlight for more depth
    this.lineStyle(2, handleHighlight, HIGHLIGHT_ALPHA);
    this.drawCircle(0, 0, handleRadius - 2);
  }

  private setupInteraction() {
    this.interactive = true;
    this.cursor = "pointer";
  }

  public setGrabbing(isGrabbing: boolean) {
    this.cursor = isGrabbing ? "grabbing" : "pointer";
  }
}
