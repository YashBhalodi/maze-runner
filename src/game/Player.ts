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

  placePlayerAtEntry() {
    const playerPosition = new Vector3();
    this.maze.entryCellObject.getWorldPosition(playerPosition);
    this.setPlayerPosition(playerPosition);
    this.scene.add(this.playerObject);
  }
}

export default Player;
