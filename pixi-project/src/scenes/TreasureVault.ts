import {
  Container,
  Graphics,
  Text,
  FederatedPointerEvent,
  Rectangle,
} from "pixi.js";
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
  private vaultContainer!: Container;
  private vaultBackground!: Graphics;
  private vaultLightGradient!: Graphics;
  private numberLabels: Text[] = [];
  private positionIndicator!: Graphics;
  private combinationService!: CombinationService;
  private currentRotation = 0;
  private targetRotation = 0;
  private isDragging = false;
  private lastMouseAngle = 0;
  private currentStepRotation = 0;
  private attemptCount = 0;
  private attemptCounterText!: Text;

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
      fill: text,
    });

    centerObjects(loadingText);
    this.addChild(bg, loadingText);

    await this.utils.assetLoader.loadAssets();
  }

  async start() {
    this.removeChildren();
    this.createVaultBackground();
    this.createVaultSafe();
    this.combinationService = new CombinationService();
  }

  private createVaultBackground() {
    const { background, lightGradient } = VAULT_COLORS;
    const { LIGHT_GRADIENT_ALPHA } = VAULT_SETTINGS;

    // Create vault room background
    const bg = new Graphics()
      .beginFill(background)
      .drawRect(0, 0, window.innerWidth, window.innerHeight);

    // Add some ambient lighting effect
    const gradient = new Graphics()
      .beginFill(lightGradient, LIGHT_GRADIENT_ALPHA)
      .drawCircle(window.innerWidth / 2, window.innerHeight / 2, 400);

    this.addChild(bg, gradient);

    // Store references for resize
    this.vaultBackground = bg;
    this.vaultLightGradient = gradient;
  }

  private createVaultSafe() {
    this.vaultContainer = new Container();

    // Create vault door
    this.vaultDoor = new VaultDoor();

    // Create vault handle
    this.vaultHandle = new VaultHandle();
    this.setupHandleEvents();

    // Create number labels around the vault
    this.createNumberLabels();

    // Create position indicator
    this.createPositionIndicator();

    // Create attempt counter
    this.createAttemptCounter();

    // Position vault components
    this.vaultContainer.x = window.innerWidth / 2;
    this.vaultContainer.y = window.innerHeight / 2;

    this.vaultContainer.addChild(this.vaultDoor, this.vaultHandle);
    this.numberLabels.forEach((label) => this.vaultContainer.addChild(label));
    this.vaultContainer.addChild(this.positionIndicator);
    this.addChild(this.vaultContainer, this.attemptCounterText);
  }

  private setupHandleEvents() {
    this.vaultHandle.on("pointerdown", this.onHandlePointerDown.bind(this));
    this.vaultHandle.on("pointermove", this.onHandlePointerMove.bind(this));
    this.vaultHandle.on("pointerup", this.onHandlePointerUp.bind(this));
    this.vaultHandle.on("pointerupoutside", this.onHandlePointerUp.bind(this));
  }

  private createNumberLabels() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const { NUMBER_RADIUS } = VAULT_SETTINGS;
    const { text } = VAULT_COLORS;

    for (let i = 0; i < numbers.length; i++) {
      const angle = (i * Math.PI * 2) / VAULT_CONFIG.numPositions - Math.PI / 2;
      const x = Math.cos(angle) * NUMBER_RADIUS;
      const y = Math.sin(angle) * NUMBER_RADIUS;

      const label = new Text(numbers[i].toString(), {
        fontFamily: "Arial",
        fontSize: 24,
        fill: text,
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
      fill: text,
      fontWeight: "bold",
    });

    this.attemptCounterText.x = 20;
    this.attemptCounterText.y = 20;
  }

  private updatePositionIndicator() {
    const { INDICATOR_RADIUS, ARROW_SIZE } = VAULT_SETTINGS;
    const { indicator } = VAULT_COLORS;

    this.positionIndicator.clear();

    // Draw indicator arrow pointing to current position
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

    // Also draw a small circle at the center
    this.positionIndicator.beginFill(indicator);
    this.positionIndicator.drawCircle(0, 0, 3);
    this.positionIndicator.endFill();
  }

  private onHandlePointerDown(event: FederatedPointerEvent) {
    this.isDragging = true;
    this.lastMouseAngle = this.getMouseAngle(event);
    this.vaultHandle.setGrabbing(true);
  }

  private onHandlePointerMove(event: FederatedPointerEvent) {
    if (!this.isDragging) return;

    const currentMouseAngle = this.getMouseAngle(event);
    const angleDifference = currentMouseAngle - this.lastMouseAngle;

    // Normalize angle difference to handle wrapping
    let normalizedDiff = angleDifference;
    if (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
    if (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;

    this.targetRotation += normalizedDiff;
    this.rotateHandle(this.targetRotation);

    this.lastMouseAngle = currentMouseAngle;
  }

  private onHandlePointerUp() {
    this.isDragging = false;
    this.vaultHandle.setGrabbing(false);

    // Calculate rotation difference from start of current step
    const rotationDiff = this.targetRotation - this.currentStepRotation;
    const { POSITION_ANGLE } = VAULT_SETTINGS;
    const positions = Math.round(Math.abs(rotationDiff) / POSITION_ANGLE);
    const direction = rotationDiff > 0 ? "clockwise" : "counterclockwise";

    if (positions > 0) {
      // Snap to exact position
      const exactRotation =
        this.currentStepRotation +
        positions * POSITION_ANGLE * (direction === "clockwise" ? 1 : -1);
      this.targetRotation = exactRotation;

      // Animate to snapped position
      gsap.to(this, {
        duration: 0.2,
        currentRotation: this.targetRotation,
        ease: "power2.out",
        onUpdate: () => {
          this.vaultHandle.rotation = this.currentRotation;
          this.updatePositionIndicator();
        },
        onComplete: () => {
          this.checkCombinationStep(positions, direction);
        },
      });
    }
  }

  private getMouseAngle(event: FederatedPointerEvent): number {
    if (!this.vaultHandle.parent) {
      return 0; // Fallback if parent is not available
    }

    const rect: Rectangle = this.vaultHandle.parent.getBounds();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    const mouseX = event.global.x;
    const mouseY = event.global.y;

    return Math.atan2(mouseY - centerY, mouseX - centerX);
  }

  private rotateHandle(rotation: number) {
    this.currentRotation = rotation;
    this.vaultHandle.rotation = rotation;
    this.updatePositionIndicator();
  }

  private checkCombinationStep(
    steps: number,
    direction: "clockwise" | "counterclockwise"
  ) {
    // Add step to combination service
    const step: CombinationStep = { steps, direction };
    const isComplete = this.combinationService.addStep(step);

    // Update current step rotation for next input
    this.currentStepRotation = this.targetRotation;

    // Check if we've completed all steps
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
      console.log("Combination incorrect. Resetting...");
      this.attemptCount++;
      this.updateAttemptCounter();
      this.resetCombination();
    }
  }

  private unlockVault() {
    console.log("Vault unlocked!");

    // Disable interaction
    this.vaultHandle.interactive = false;

    // Animate vault door opening
    gsap.to(this.vaultDoor, {
      duration: 1,
      alpha: 0.3,
      ease: "power2.out",
    });

    // Create treasure reveal animation
    this.createTreasureReveal();
  }

  private createTreasureReveal() {
    const treasureAnimation = new TreasureAnimation();
    this.vaultContainer.addChild(treasureAnimation);

    // Start the reveal animation
    treasureAnimation.reveal();

    // Auto-close after 5 seconds
    setTimeout(() => {
      this.closeVault();
    }, VAULT_SETTINGS.AUTO_CLOSE_DELAY);
  }

  private closeVault() {
    console.log("Vault closing...");

    // Fade out the entire vault
    gsap.to(this.vaultContainer, {
      duration: 1,
      alpha: 0,
      scale: 0.8,
      ease: "power2.in",
      onComplete: () => {
        // Reset the game
        this.resetGame();
      },
    });
  }

  private updateAttemptCounter() {
    this.attemptCounterText.text = `Attempts: ${this.attemptCount}`;
  }

  private resetGame() {
    // Reset vault appearance
    this.vaultContainer.alpha = 1;
    this.vaultContainer.scale.set(1);
    this.vaultDoor.alpha = 1;

    // Remove treasure if it exists
    const treasureContainer = this.vaultContainer.getChildByName("treasure");
    if (treasureContainer && treasureContainer instanceof TreasureAnimation) {
      treasureContainer.destroy();
      this.vaultContainer.removeChild(treasureContainer);
    }

    // Re-enable interaction
    this.vaultHandle.interactive = true;

    // Reset combination
    this.resetCombination();
  }

  private resetCombination() {
    this.combinationService.reset();

    // Add "spins like crazy" effect for wrong combination
    gsap.to(this.vaultHandle, {
      duration: 1,
      rotation: "+=720", // 2 full rotations
      ease: "power2.out",
    });

    // Reset handle to starting position
    this.targetRotation = 0;
    this.currentStepRotation = 0;
    gsap.to(this, {
      duration: 0.5,
      currentRotation: 0,
      ease: "power2.out",
      delay: 1,
      onUpdate: () => {
        this.vaultHandle.rotation = this.currentRotation;
        this.updatePositionIndicator();
      },
    });
  }

  update(delta: number) {
    // This game is primarily event-driven, so no continuous updates are needed
    // All animations are handled by GSAP
    // Delta time is available if future features need frame-based updates
    void delta; // Explicitly mark as intentionally unused
  }

  onResize(width: number, height: number) {
    const { background, lightGradient } = VAULT_COLORS;
    const { LIGHT_GRADIENT_ALPHA } = VAULT_SETTINGS;

    // Update background size
    if (this.vaultBackground) {
      this.vaultBackground.clear();
      this.vaultBackground.beginFill(background);
      this.vaultBackground.drawRect(0, 0, width, height);
    }

    // Update light gradient position
    if (this.vaultLightGradient) {
      this.vaultLightGradient.clear();
      this.vaultLightGradient.beginFill(lightGradient, LIGHT_GRADIENT_ALPHA);
      this.vaultLightGradient.drawCircle(width / 2, height / 2, 400);
    }

    // Update vault container position
    if (this.vaultContainer) {
      this.vaultContainer.x = width / 2;
      this.vaultContainer.y = height / 2;
    }

    // Update attempt counter position
    if (this.attemptCounterText) {
      this.attemptCounterText.x = 20;
      this.attemptCounterText.y = 20;
    }
  }
}
