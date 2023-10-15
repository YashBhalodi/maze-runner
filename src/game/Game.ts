import { Scene } from "three";
import MazeRenderer from "./MazeRenderer";
import Player from "./Player";

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
  player: Player;

  constructor(scene: Scene) {
    this.currentLevel = parseInt(localStorage.getItem("level") ?? "1") ?? 1;
    const size = getMazeSizeForLevel(this.currentLevel);
    this.maze = new MazeRenderer(size, size);
    this.scene = scene;
    this.isMazeRendered = false;
    this.player = new Player(this.maze, this.scene);
  }

  update() {
    if (!this.isMazeRendered) {
      this.maze.drawNextCell(this.scene, () => {
        this.isMazeRendered = true;
      });
      return;
    }

    if (!this.player.isReady) {
      this.player.init();
    }

    if (this.player.isAtExit) {
      this.goToNextLevel();
    }
  }

  incrementLevel() {
    this.currentLevel++;
    localStorage.setItem("level", this.currentLevel.toString());
  }

  redrawMaze() {
    this.maze.cleanup(this.scene);

    const nextSize = getMazeSizeForLevel(this.currentLevel);
    this.maze = new MazeRenderer(nextSize, nextSize);

    this.isMazeRendered = false;
  }

  goToNextLevel() {
    this.incrementLevel();
    this.redrawMaze();
    this.player.reset();
    this.player = new Player(this.maze, this.scene);
  }
}

export default Game;
