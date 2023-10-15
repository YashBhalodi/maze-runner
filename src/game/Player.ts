import {
  BoxGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  PointLight,
  Scene,
  Vector3,
} from "three";

import MazeRenderer from "./MazeRenderer";
import { DIRECTION, Position } from "./Maze";

const directionVectorMap = {
  [DIRECTION.LEFT]: new Vector3(0, 0, 1),
  [DIRECTION.RIGHT]: new Vector3(0, 0, -1),
  [DIRECTION.BOTTOM]: new Vector3(1, 0, 0),
  [DIRECTION.UP]: new Vector3(-1, 0, 0),
};

const wallDirectionMap = {
  [DIRECTION.BOTTOM]: DIRECTION.RIGHT,
  [DIRECTION.LEFT]: DIRECTION.BOTTOM,
  [DIRECTION.UP]: DIRECTION.LEFT,
  [DIRECTION.RIGHT]: DIRECTION.UP,
};

class Player {
  isReady: boolean;
  maze: MazeRenderer;
  scene: Scene;
  playerObject: Mesh;
  mazePosition: Position;
  isAtExit: boolean;

  constructor(maze: MazeRenderer, scene: Scene) {
    this.isReady = false;
    this.maze = maze;
    this.scene = scene;
    this.playerObject = this.renderPlayer();
    this.mazePosition = { x: 0, y: 0 };
    this.isAtExit = false;
  }

  init() {
    this.placePlayerAtEntry();
    this.isReady = true;
    this.initKeyBinding();
  }

  reset() {
    this.isReady = false;
    this.scene.remove(this.playerObject);
    this.clearKeyBinding();
    this.isAtExit = false;
    this.mazePosition = { x: 0, y: 0 };
  }

  initKeyBinding() {
    document.addEventListener("keydown", (e) => this.handleKeyDownEvent(e));
  }

  clearKeyBinding() {
    document.removeEventListener("keydown", (e) => this.handleKeyDownEvent(e));
  }

  handleKeyDownEvent(e: KeyboardEvent) {
    switch (e.code) {
      case "ArrowRight":
        this.movePlayer(DIRECTION.RIGHT);
        break;
      case "ArrowLeft":
        this.movePlayer(DIRECTION.LEFT);
        break;
      case "ArrowUp":
        this.movePlayer(DIRECTION.UP);
        break;
      case "ArrowDown":
        this.movePlayer(DIRECTION.BOTTOM);
        break;
      default:
        break;
    }
  }

  renderPlayer() {
    const playerGeometry = new BoxGeometry(0.5, 0.5, 0.5);
    const playerMaterial = new MeshLambertMaterial({
      color: "red",
      emissive: new Color("red"),
    });
    const playerPointLight = new PointLight("red", 2, 2, 4);
    const player = new Mesh(playerGeometry, playerMaterial);
    player.add(playerPointLight);

    player.castShadow = true;
    player.receiveShadow = true;

    return player;
  }

  setPlayerPosition(position: Vector3) {
    this.playerObject.position.set(position.x, position.y, position.z);
  }

  updatePlayerMazePosition(direction: DIRECTION) {
    const directionDiff = { x: 0, y: 0 };
    switch (direction) {
      case DIRECTION.LEFT:
        directionDiff.y = 1;
        break;
      case DIRECTION.RIGHT:
        directionDiff.y = -1;
        break;
      case DIRECTION.BOTTOM:
        directionDiff.x = 1;
        break;
      case DIRECTION.UP:
        directionDiff.x = -1;
        break;
    }
    const result = {
      x: this.mazePosition.x + directionDiff.x,
      y: this.mazePosition.y + directionDiff.y,
    };
    this.mazePosition = result;
  }

  getIsPlayerBlocked(direction: DIRECTION) {
    const wallDirection = wallDirectionMap[direction]; //TODO: this is shitty hack. Fix it.
    const mazeGrid = this.maze.mazeData;
    const playerPosition = this.mazePosition;

    const currentCell = mazeGrid.find(
      (cell) =>
        cell.position.x === playerPosition.x &&
        cell.position.y === playerPosition.y
    );

    return currentCell?.walls[wallDirection];
  }

  movePlayer(direction: DIRECTION) {
    if (this.getIsPlayerBlocked(direction)) {
      return;
    }

    const directionVector = directionVectorMap[direction];
    this.updatePlayerMazePosition(direction);
    this.playerObject.translateOnAxis(directionVector, 1);

    this.updateIsPlayerAtExit();
  }

  updateIsPlayerAtExit() {
    if (
      this.mazePosition.x === this.maze.maze.getExitPosition().x &&
      this.mazePosition.y === this.maze.maze.getExitPosition().y
    ) {
      this.isAtExit = true;
    } else {
      this.isAtExit = false;
    }
  }

  placePlayerAtEntry() {
    const playerPosition = new Vector3();
    this.mazePosition = this.maze.maze.getEntryPosition();
    this.maze.entryCellObject.getWorldPosition(playerPosition);
    this.setPlayerPosition(playerPosition);
    this.scene.add(this.playerObject);
  }
}

export default Player;
