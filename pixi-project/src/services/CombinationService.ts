import { CombinationStep } from "../types/TreasureVault";
import { VAULT_SETTINGS } from "../constants/TreasureVault";

export class CombinationService {
  private secretCombination: CombinationStep[] = [];
  private enteredCombination: CombinationStep[] = [];
  private combinationStep = 0;

  constructor() {
    this.generateSecretCombination();
  }

  public generateSecretCombination(): void {
    this.secretCombination = [];
    for (let i = 0; i < VAULT_SETTINGS.COMBINATION_STEPS; i++) {
      const steps = Math.floor(Math.random() * 9) + 1;
      const direction = Math.random() < 0.5 ? "clockwise" : "counterclockwise";
      this.secretCombination.push({ steps, direction });
    }

    console.log("Secret combination (3 steps):", this.secretCombination);
    console.log(
      "Instructions: Each step is [positions, direction]. Example: 2 clockwise, 7 counterclockwise, 5 clockwise"
    );
    console.log(
      "Each number = how many positions to rotate (1-9). Complete all 3 steps to unlock the vault."
    );
  }

  public addStep(step: CombinationStep): boolean {
    this.enteredCombination.push(step);

    console.log(
      `Step ${this.combinationStep + 1}: ${step.steps} positions ${step.direction}, Combination: ${JSON.stringify(
        this.enteredCombination
      )}`
    );

    this.combinationStep++;

    return this.enteredCombination.length === VAULT_SETTINGS.COMBINATION_STEPS;
  }

  public validateCombination(): boolean {
    return this.enteredCombination.every(
      (step, index) =>
        step.steps === this.secretCombination[index].steps &&
        step.direction === this.secretCombination[index].direction
    );
  }

  public reset(): void {
    this.enteredCombination = [];
    this.combinationStep = 0;
    this.generateSecretCombination();
  }

  public getCurrentStep(): number {
    return this.combinationStep;
  }

  public getSecretCombination(): CombinationStep[] {
    return [...this.secretCombination];
  }

  public getEnteredCombination(): CombinationStep[] {
    return [...this.enteredCombination];
  }
}