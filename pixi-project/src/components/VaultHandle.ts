import { Sprite } from "pixi.js";

export class VaultHandle extends Sprite {
  constructor() {
    super(Sprite.from("provided-assets/assets/handle.png").texture);
    this.anchor.set(0.5);
    this.scale.set(0.23);
    this.interactive = true;
    this.cursor = "pointer";
  }

  public setGrabbing(isGrabbing: boolean) {
    this.cursor = isGrabbing ? "grabbing" : "pointer";
  }
}
