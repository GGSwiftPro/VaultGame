import { Container, Graphics } from "pixi.js";
import gsap from "gsap";
import { VAULT_COLORS, VAULT_SETTINGS } from "../constants/TreasureVault";

export class TreasureAnimation extends Container {
  private goldContainer!: Container;
  private shineEffect!: Graphics;

  constructor() {
    super();
    this.name = "treasure";
    this.alpha = 0;
    this.create();
  }

  private create(): void {
    this.goldContainer = this.createGoldBars();
    this.shineEffect = this.createShineEffect();

    this.addChild(this.goldContainer);
    this.addChild(this.shineEffect);
  }

  private createGoldBars(): Container {
    const goldContainer = new Container();
    const { gold, goldHighlight } = VAULT_COLORS;
    const { TREASURE_BARS, GOLD_HIGHLIGHT_ALPHA } = VAULT_SETTINGS;

    for (let i = 0; i < TREASURE_BARS; i++) {
      const goldBar = new Graphics();

      // Gold bar shape
      goldBar.beginFill(gold);
      goldBar.drawRect(-20, -8, 40, 16);
      goldBar.endFill();

      // Add highlight
      goldBar.beginFill(goldHighlight, GOLD_HIGHLIGHT_ALPHA);
      goldBar.drawRect(-18, -6, 36, 4);
      goldBar.endFill();

      // Position bars in a pile
      const angle = (i * Math.PI * 2) / TREASURE_BARS;
      const radius = 30 + Math.random() * 20;
      goldBar.x = Math.cos(angle) * radius;
      goldBar.y = Math.sin(angle) * radius;
      goldBar.rotation = angle + Math.random() * 0.5;

      goldContainer.addChild(goldBar);
    }

    return goldContainer;
  }

  private createShineEffect(): Graphics {
    const shine = new Graphics();
    const { shine: shineColor } = VAULT_COLORS;
    const { SHINE_RAYS, SHINE_ALPHA } = VAULT_SETTINGS;

    for (let i = 0; i < SHINE_RAYS; i++) {
      const angle = (i * Math.PI * 2) / SHINE_RAYS;
      const x1 = Math.cos(angle) * 20;
      const y1 = Math.sin(angle) * 20;
      const x2 = Math.cos(angle) * 80;
      const y2 = Math.sin(angle) * 80;

      shine.lineStyle(3, shineColor, SHINE_ALPHA);
      shine.moveTo(x1, y1);
      shine.lineTo(x2, y2);
    }

    return shine;
  }

  public reveal(): void {
    // Animate treasure reveal
    gsap.to(this, {
      duration: 1,
      alpha: 1,
      ease: "power2.out",
      delay: 0.5,
    });

    // Animate shine effect
    gsap.to(this.shineEffect, {
      duration: 2,
      rotation: Math.PI * 2,
      repeat: -1,
      ease: "none",
    });
  }

  public destroy(): void {
    // Kill any running GSAP animations
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.shineEffect);

    // Kill animations on gold bars
    if (this.goldContainer?.children) {
      this.goldContainer.children.forEach((child) => {
        gsap.killTweensOf(child);
      });
    }

    super.destroy({ children: true });
  }
}
