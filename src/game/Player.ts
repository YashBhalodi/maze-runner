import {
  BoxGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  PointLight,
  Scene,
  Vector3,
} from "three";
import { CellType } from "./Maze";
import MazeRenderer from "./MazeRenderer";

class Player {
  isReady: boolean;
  maze: MazeRenderer;
  scene: Scene;

  constructor(maze: MazeRenderer, scene: Scene) {
    this.isReady = false;
    this.maze = maze;
    this.scene = scene;
  }

  init() {
    this.placePlayerAtEntry();
    this.isReady = true;
  }

  renderPlayer(position: Vector3) {
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
    player.position.set(position.x, position.y, 0);
    this.scene.add(player);
  }

  placePlayerAtEntry() {
    const entryPosition = this.maze.getCellByType(CellType.ENTRY)[0].position;
    this.renderPlayer(new Vector3(entryPosition.x, entryPosition.y, 0));
  }
}

export default Player;
