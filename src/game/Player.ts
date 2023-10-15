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

enum DIRECTION {
  LEFT,
  RIGHT,
  UP,
  BOTTOM,
}

const directionVectorMap = {
  [DIRECTION.LEFT]: new Vector3(0, 0, 1),
  [DIRECTION.RIGHT]: new Vector3(0, 0, -1),
  [DIRECTION.BOTTOM]: new Vector3(1, 0, 0),
  [DIRECTION.UP]: new Vector3(-1, 0, 0),
};

class Player {
  isReady: boolean;
  maze: MazeRenderer;
  scene: Scene;
  playerObject: Mesh;

  constructor(maze: MazeRenderer, scene: Scene) {
    this.isReady = false;
    this.maze = maze;
    this.scene = scene;
    this.playerObject = this.renderPlayer();
  }

  init() {
    this.placePlayerAtEntry();
    this.isReady = true;
    this.initKeyBinding();
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

  movePlayer(direction: DIRECTION) {
    const directionVector = directionVectorMap[direction];
    this.playerObject.translateOnAxis(directionVector, 1);
  }

  placePlayerAtEntry() {
    const playerPosition = new Vector3();
    this.maze.entryCellObject.getWorldPosition(playerPosition);
    this.setPlayerPosition(playerPosition);
    this.scene.add(this.playerObject);
  }
}

export default Player;
