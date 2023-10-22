import { Scene } from "three";
import MazeRenderer from "./MazeRenderer";
import Player from "./Player";
import GameRecorder from "./GameRecorder";

function getMazeSizeForLevel(level: number) {
  return Math.max(3, level);
}

class Game {
  maze: MazeRenderer;
  currentLevel: number;
  scene: Scene;

  isMazeRendered: boolean;
  player: Player;
  private gameRecorder: GameRecorder;

  constructor(scene: Scene) {
    this.currentLevel = parseInt(localStorage.getItem("level") ?? "1") ?? 1;
    const size = getMazeSizeForLevel(this.currentLevel);
    this.maze = new MazeRenderer(size, size);
    this.scene = scene;
    this.isMazeRendered = false;
    this.gameRecorder = new GameRecorder(this.currentLevel);
    this.player = new Player(this.maze, this.scene, this.gameRecorder);
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
      this.gameRecorder.endLevel();
      this.gameRecorder.saveRecord();
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
    this.gameRecorder = new GameRecorder(this.currentLevel);
    this.player = new Player(this.maze, this.scene, this.gameRecorder);
  }
}

export default Game;
