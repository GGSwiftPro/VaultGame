import { Application } from "pixi.js";
import AssetLoader from "./AssetLoader";
import TreasureVault from "../scenes/TreasureVault";

export interface SceneUtils {
  assetLoader: AssetLoader;
}

export default class App extends Application {
  private game: TreasureVault;

  constructor() {
    super({
      view: document.querySelector("#app") as HTMLCanvasElement,
      autoDensity: true,
      resizeTo: window,
      powerPreference: "high-performance",
      backgroundColor: 0x23272a,
    });

    const sceneUtils = {
      assetLoader: new AssetLoader(),
    };

    this.game = new TreasureVault(sceneUtils);
  }

  async begin() {
    this.stage.addChild(this.game);

    await this.game.load();

    this.game.start();

    window.addEventListener("resize", this.onResize);

    this.ticker.add((delta) => this.game.update(delta));
  }

  private onResize = (ev: UIEvent) => {
    const target = ev.target as Window;
    this.game.onResize?.(target.innerWidth, target.innerHeight);
  };
}
