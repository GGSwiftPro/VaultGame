import {
  Container,
  Graphics,
  Text,
  FederatedPointerEvent,
  Rectangle,
  Sprite,
} from "pixi.js";
import { sound } from "@pixi/sound";
import { SceneUtils } from "../core/App";
import { centerObjects } from "../utils/misc";
import gsap from "gsap";
import { VaultDoor } from "../components/VaultDoor";
import { VaultHandle } from "../components/VaultHandle";
import { TreasureAnimation } from "../components/TreasureAnimation";
import { CombinationService } from "../services/CombinationService";
import { CombinationStep } from "../types/TreasureVault";
import {
  VAULT_CONFIG,
  VAULT_COLORS,
  VAULT_SETTINGS,
} from "../constants/TreasureVault";

export default class TreasureVault extends Container {
  name = "TreasureVault";

  private vaultDoor!: VaultDoor;
  private vaultHandle!: VaultHandle;
  private vaultHandleShadow!: Sprite;
  private vaultContainer!: Container;
  private vaultBackground!: Sprite;
  private vaultDoorSprite!: Sprite;

  private numberLabels: Text[] = [];
  private positionIndicator!: Graphics;
  private combinationService!: CombinationService;
  private currentRotation = 0;
  private targetRotation = 0;
  private currentStepRotation = 0;
  private attemptCount = 0;
  private attemptCounterText!: Text;
  private _wrongCodeText?: Text;

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    const { background, text } = VAULT_COLORS;

    const bg = new Graphics()
      .beginFill(background)
      .drawRect(0, 0, window.innerWidth, window.innerHeight);

    const loadingText = new Text("Loading Treasure Vault...", {
      fontFamily: "Arial",
      fontSize: 32,
      fill: 0x000000,
    });

    centerObjects(loadingText);
    this.addChild(bg, loadingText);

    await this.utils.assetLoader.loadAssets();
  }

  async start() {
    this.attemptCount = 0;
    this.removeChildren();
    this.createVaultBackground();
    this.createVaultSafe();
    this.combinationService = new CombinationService();

    if (!sound.exists("vault_unlock")) {
      sound.add("vault_unlock", "sounds/vault_unlock.mp3");
    }
    if (!sound.exists("wrong_code")) {
      sound.add("wrong_code", "sounds/wrong_code.mp3");
    }
    if (!sound.exists("button_press")) {
      sound.add("button_press", "sounds/button_press.mp3");
    }
  }

  private createVaultBackground() {
    const bg = Sprite.from("provided-assets/preview/vault.jpg");
    this.addChild(bg);
    this.vaultBackground = bg;
    this.resizeVaultBgSprite();
  }

  // Helper to scale and center the background image to "cover" the screen
  private resizeVaultBgSprite() {
  if (!this.vaultBackground) return;
  const bg = this.vaultBackground;

  bg.width = window.innerWidth;
  bg.height = window.innerHeight;
  bg.x = (window.innerWidth - bg.width) / 2;
  bg.y = (window.innerHeight - bg.height) / 2;
}

  private createVaultSafe() {
    this.vaultContainer = new Container();

    this.vaultDoor = new VaultDoor();
    // Add vault door sprite (between background and handle)
    const vaultDoorSprite = Sprite.from("provided-assets/assets/door.png");
    vaultDoorSprite.anchor.set(0.5);
    vaultDoorSprite.scale.x = 0.23;
    vaultDoorSprite.scale.y = 0.27; // Stretch vertically to match background
    vaultDoorSprite.x = 10;
    vaultDoorSprite.y = -15;
    this.vaultDoorSprite = vaultDoorSprite;

    // Add handle shadow sprite (below handle)
    const vaultHandleShadow = Sprite.from("provided-assets/assets/handleShadow.png");
    vaultHandleShadow.anchor.set(0.5);
    vaultHandleShadow.scale.set(0.23);
    vaultHandleShadow.x = this.vaultHandle?.x + 5 || 0;
    vaultHandleShadow.y = this.vaultHandle?.y + 5 || 0;
    this.vaultHandleShadow = vaultHandleShadow;

    this.vaultHandle = new VaultHandle();
    this.createControlButtons();

    this.createNumberLabels();
    this.createPositionIndicator();
    this.createAttemptCounter();

    this.vaultContainer.x = window.innerWidth / 2;
    this.vaultContainer.y = window.innerHeight / 2;

    this.vaultContainer.addChild(this.vaultDoorSprite);
    this.vaultContainer.addChild(this.vaultHandleShadow);
    this.vaultContainer.addChild(this.vaultHandle);
    this.vaultHandle.x = -10;
    this.vaultHandle.y = -10;
    this.vaultHandleShadow.x = this.vaultHandle.x + 10;
    this.vaultHandleShadow.y = this.vaultHandle.y + 10;
    this.numberLabels.forEach((label) => this.vaultContainer.addChild(label));
    this.vaultContainer.addChild(this.positionIndicator);
    this.addChild(this.vaultContainer, this.attemptCounterText);
  }

  private createNumberLabels() {
    const numbers = [1, 2, 3, 4, 5, 6];
    const { NUMBER_RADIUS } = VAULT_SETTINGS;
    const { text } = VAULT_COLORS;

    for (let i = 0; i < numbers.length; i++) {
      // Evenly distribute numbers, no offset
      const angle = (i * Math.PI * 2) / VAULT_CONFIG.numPositions - Math.PI / 2;
      const x = Math.cos(angle) * NUMBER_RADIUS;
      const y = Math.sin(angle) * NUMBER_RADIUS;

      const label = new Text(numbers[i].toString(), {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0x000000,
        fontWeight: "bold",
      });

      label.anchor.set(0.5);
      label.x = x;
      label.y = y;

      this.numberLabels.push(label);
    }
  }

  private createPositionIndicator() {
    this.positionIndicator = new Graphics();
    this.updatePositionIndicator();
  }

  private createAttemptCounter() {
    const { text } = VAULT_COLORS;

    this.attemptCounterText = new Text(`Attempts: ${this.attemptCount}`, {
      fontFamily: "Arial",
      fontSize: 20,
      fill: 0x000000,
      fontWeight: "bold",
    });

    this.attemptCounterText.x = 20;
    this.attemptCounterText.y = 20;
  }

  private updatePositionIndicator() {
    const { INDICATOR_RADIUS, ARROW_SIZE } = VAULT_SETTINGS;
    const { indicator } = VAULT_COLORS;

    this.positionIndicator.clear();

    const angle = this.currentRotation - Math.PI / 2;
    const x = Math.cos(angle) * INDICATOR_RADIUS;
    const y = Math.sin(angle) * INDICATOR_RADIUS;

    this.positionIndicator.beginFill(indicator);
    this.positionIndicator.moveTo(x, y);
    this.positionIndicator.lineTo(
      x - ARROW_SIZE * Math.cos(angle + Math.PI / 6),
      y - ARROW_SIZE * Math.sin(angle + Math.PI / 6)
    );
    this.positionIndicator.lineTo(
      x - ARROW_SIZE * Math.cos(angle - Math.PI / 6),
      y - ARROW_SIZE * Math.sin(angle - Math.PI / 6)
    );
    this.positionIndicator.lineTo(x, y);
    this.positionIndicator.endFill();

    this.positionIndicator.beginFill(indicator);
    this.positionIndicator.drawCircle(0, 0, 3);
    this.positionIndicator.endFill();
  }

  private createControlButtons() {
    const buttonLabels = [
      { label: "⟲ Left", action: () => { sound.play("button_press"); this.rotateBy(-1); } },
      { label: "Enter Number", action: () => { sound.play("button_press"); this.enterNumber(); } },
      { label: "Right ⟳", action: () => { sound.play("button_press"); this.rotateBy(1); } },
    ];

    const buttons: Text[] = [];
    const { text } = VAULT_COLORS;
    const BUTTON_WIDTH = 160;
    const BUTTON_HEIGHT = 40;
    const BUTTON_MARGIN = 16;
    const BUTTON_FONT_SIZE = 22;

    buttonLabels.forEach((btn, i) => {
      const btnGfx = new Graphics();
      btnGfx.beginFill(0x23272a, 0.9);
      btnGfx.drawRoundedRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, 12);
      btnGfx.endFill();

      const btnText = new Text(btn.label, {
        fontFamily: "Arial",
        fontSize: BUTTON_FONT_SIZE,
        fill: 0x000000,
        fontWeight: "bold",
      });
      btnText.anchor.set(0.5);
      btnText.x = BUTTON_WIDTH / 2;
      btnText.y = BUTTON_HEIGHT / 2;
      btnGfx.addChild(btnText);

      btnGfx.interactive = true;
      (btnGfx as any).buttonMode = true;
      btnGfx.on("pointertap", btn.action);

      btnGfx.x = -BUTTON_WIDTH * 1.5 + i * (BUTTON_WIDTH + BUTTON_MARGIN);
      btnGfx.y = 320;

      this.vaultContainer.addChild(btnGfx);
      buttons.push(btnText);
    });
  }

  private rotateBy(direction: -1 | 1) {
    const { POSITION_ANGLE } = VAULT_SETTINGS;
    this.targetRotation += POSITION_ANGLE * direction;
    gsap.to(this, {
      duration: 0.25,
      currentRotation: this.targetRotation,
      ease: "power2.out",
      onUpdate: () => {
        this.vaultHandle.rotation = this.currentRotation;
this.vaultHandleShadow.rotation = this.currentRotation;
        this.updatePositionIndicator();
      },
    });
  }

  private enterNumber() {
    const { POSITION_ANGLE } = VAULT_SETTINGS;
    const rotationDiff = this.targetRotation - this.currentStepRotation;
    const positions = Math.round(Math.abs(rotationDiff) / POSITION_ANGLE);
    const direction = rotationDiff > 0 ? "clockwise" : "counterclockwise";
    if (positions > 0) {
      this.checkCombinationStep(positions, direction);
      this.currentStepRotation = this.targetRotation;
    }
  }

  private checkCombinationStep(
    steps: number,
    direction: "clockwise" | "counterclockwise"
  ) {
    const step: CombinationStep = { steps, direction };
    const isComplete = this.combinationService.addStep(step);

    this.currentStepRotation = this.targetRotation;

    if (isComplete) {
      this.validateCombination();
    }
  }

  private validateCombination() {
    const isCorrect = this.combinationService.validateCombination();

    if (isCorrect) {
      console.log("Combination correct! Unlocking vault...");
      this.unlockVault();
    } else {
      this.showWrongCodeFeedback();
      this.attemptCount++;
      this.updateAttemptCounter();
      this.resetCombination();
    }
  }

  private unlockVault() {
    console.log("Vault unlocked!");

    sound.play("vault_unlock");

    this.vaultHandle.interactive = false;

    // No vault door fade-out animation on correct code
    this.createTreasureReveal();
  }

  private createTreasureReveal() {
    // Remove vaultContainer and show vaultOpen.jpg as background
    if (this.vaultContainer.parent) {
      this.vaultContainer.parent.removeChild(this.vaultContainer);
    }
    const openBg = Sprite.from("provided-assets/preview/vaultOpen.jpg");
    openBg.width = window.innerWidth;
    openBg.height = window.innerHeight;
    openBg.x = 0;
    openBg.y = 0;
    this.addChild(openBg);
    // After 2 seconds, restart the game for replay
    setTimeout(() => {
      this.removeChild(openBg);
      this.start();
    }, 2000); // 2 seconds before restarting
  }

  private closeVault() {
    console.log("Vault closing...");

    gsap.to(this.vaultContainer, {
      duration: 1,
      alpha: 0,
      scale: 0.8,
      ease: "power2.in",
      onComplete: () => {
        this.resetGame();
      },
    });
  }

  private updateAttemptCounter() {
    this.attemptCounterText.text = `Attempts: ${this.attemptCount}`;
  }

  private resetGame() {
    this.vaultContainer.alpha = 1;
    this.vaultContainer.scale.set(this._vaultScale);
    this.vaultDoor.alpha = 1;

    const treasureContainer = this.vaultContainer.getChildByName("treasure");
    if (treasureContainer && treasureContainer instanceof TreasureAnimation) {
      treasureContainer.destroy();
      this.vaultContainer.removeChild(treasureContainer);
    }

    this.vaultHandle.interactive = true;

    this.resetCombination();
  }

  private resetCombination() {
    this.combinationService.reset();

    gsap.to(this.vaultHandle, {
      duration: 1,
      rotation: "+=720",
      ease: "power2.out",
    });

    this.targetRotation = 0;
    this.currentStepRotation = 0;
    gsap.to(this, {
      duration: 0.5,
      currentRotation: 0,
      ease: "power2.out",
      delay: 1,
      onUpdate: () => {
        this.vaultHandle.rotation = this.currentRotation;
this.vaultHandleShadow.rotation = this.currentRotation;
        this.updatePositionIndicator();
      },
      onComplete: () => {
        this.hideWrongCodeFeedback();
      },
    });
  }

  private showWrongCodeFeedback() {
    sound.play("wrong_code");
    if (!this.vaultBackground) return;
    gsap.fromTo(
      this.vaultBackground,
      { alpha: 1 },
      {
        alpha: 0.6,
        duration: 0.15,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.vaultBackground.alpha = 1;
        },
      }
    );

    if (!this._wrongCodeText) {
      const msg = new Text("Wrong Code!", {
        fontFamily: "Arial",
        fontSize: 56,
        fill: 0xff4444,
        fontWeight: "bold",
        stroke: 0xffffff,
        strokeThickness: 6,
      });
      msg.anchor.set(0.5);
      msg.x = window.innerWidth / 2;
      msg.y = window.innerHeight / 2;
      msg.name = "wrongCodeText";
      this._wrongCodeText = msg;
    }
    if (!this.children.includes(this._wrongCodeText)) {
      this.addChild(this._wrongCodeText);
    }
  }

  private hideWrongCodeFeedback() {
    setTimeout(() => {
      if (this.vaultBackground) {
        this.vaultBackground.alpha = 1;
      }
      if (this._wrongCodeText && this.children.includes(this._wrongCodeText)) {
        this.removeChild(this._wrongCodeText);
      }
    }, 500);
  }

  update(delta: number) {
    void delta;
  }

  private _vaultScale: number = 1;

  onResize(width: number, height: number) {
    // Update background image size to cover the screen
    this.resizeVaultBgSprite();

    // Define margins and the base size for vault scaling
    const MARGIN = 40;
    const vaultBaseSize = 1000; // Adjust this value to control the vault's size

    const scale = Math.min(
      (width - MARGIN) / vaultBaseSize,
      (height - MARGIN) / vaultBaseSize,
      1
    );
    this._vaultScale = scale;

    if (this.vaultContainer) {
      this.vaultContainer.x = width / 2;
      this.vaultContainer.y = height / 2;
      this.vaultContainer.scale.set(scale);
    }

    if (this.attemptCounterText) {
      this.attemptCounterText.x = 20;
      this.attemptCounterText.y = 20;
    }

    if (this._wrongCodeText && this.children.includes(this._wrongCodeText)) {
      this._wrongCodeText.x = width / 2;
      this._wrongCodeText.y = height / 2;
    }
  }
}