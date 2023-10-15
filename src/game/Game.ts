import { Scene } from "three";
import MazeRenderer from "./MazeRenderer";

interface Record {
  level: number;
  time: number;
  score: number;
}

function getMazeSizeForLevel(level: number) {
  return Math.max(3, level);
}

class Game {
  maze: MazeRenderer;
  currentLevel: number;
  scene: Scene;

  isMazeRendered: boolean;

  constructor(scene: Scene) {
    this.currentLevel = parseInt(localStorage.getItem("level") ?? "1") ?? 1;
    const size = getMazeSizeForLevel(this.currentLevel);
    this.maze = new MazeRenderer(size, size);
    this.scene = scene;
    this.isMazeRendered = false;
  }

  update() {
    if (!this.isMazeRendered) {
      this.maze.drawNextCell(this.scene, () => {
        this.isMazeRendered = true;
      });
      return;
    }
  }

  goToNextLevel() {
    this.currentLevel++;
    localStorage.setItem("level", this.currentLevel.toString());
    const nextSize = getMazeSizeForLevel(this.currentLevel);
    this.maze.cleanup(this.scene);
    this.maze = new MazeRenderer(nextSize, nextSize);
    this.isMazeRendered = false;
  }
}

export default Game;
