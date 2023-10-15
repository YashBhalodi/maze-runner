import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  Vector3,
} from "three";
import Maze, { Cell } from "./Maze";

class MazeRenderer {
  width: number;
  height: number;
  elevation: number;
  mazeData: Cell[];
  mazeObject: Group;
  private animatedCellIndex: number;

  constructor(width?: number, height?: number, elevation?: number) {
    this.width = width ?? 10;
    this.height = height ?? 10;
    this.elevation = elevation ?? 0.5;
    this.mazeData = new Maze(this.width, this.height).getGridData();
    this.mazeObject = new Group();

    this.animatedCellIndex = 0;
  }

  getWall(position: Vector3) {
    const wallGeometry = new BoxGeometry(1, 1, 1);
    const wallMaterial = new MeshStandardMaterial({ color: "white" });
    const wallWidth = 1;
    const wallHeight = 1;
    const wallDepth = 0.05;

    const wall = new Mesh(wallGeometry, wallMaterial);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.scale.set(wallWidth, wallHeight, wallDepth);
    wall.position.set(position.x, position.y, position.z);
    return wall;
  }

  getCellWalls(cell: Cell) {
    const cellWalls = new Group();

    const origin = new Vector3(
      cell.position.x,
      this.elevation,
      cell.position.y
    );

    if (cell.walls.left) {
      const leftPosition = new Vector3(0, 0, -this.elevation);
      const cellWallPosition = leftPosition.add(origin);
      const wallLeft = this.getWall(cellWallPosition);
      wallLeft.rotation.y = Math.PI / 2;
      cellWalls.add(wallLeft);
    }

    if (cell.walls.right) {
      const rightPosition = new Vector3(1, 0, -this.elevation);
      const cellWallPosition = rightPosition.add(origin);
      const wallRight = this.getWall(cellWallPosition);
      wallRight.rotation.y = Math.PI / 2;
      cellWalls.add(wallRight);
    }

    if (cell.walls.up) {
      const topPosition = new Vector3(this.elevation, 0, -1);
      const cellWallPosition = topPosition.add(origin);
      const wallTop = this.getWall(cellWallPosition);
      cellWalls.add(wallTop);
    }

    if (cell.walls.bottom) {
      const bottomPosition = new Vector3(this.elevation, 0, 0);
      const cellWallPosition = bottomPosition.add(origin);
      const wallBottom = this.getWall(cellWallPosition);
      cellWalls.add(wallBottom);
    }

    return cellWalls;
  }

  renderCell(cell: Cell) {
    this.mazeObject.add(this.getCellWalls(cell));
  }

  draw(scene: Scene) {
    for (let i = 0; i < this.mazeData.length; i++) {
      const cell = this.mazeData[i];
      this.renderCell(cell);
    }

    scene.add(this.mazeObject);
  }

  drawNextCell(scene: Scene) {
    if (this.animatedCellIndex >= this.mazeData.length) return;

    const cell = this.mazeData[this.animatedCellIndex];
    this.renderCell(cell);
    this.animatedCellIndex++;
    scene.add(this.mazeObject);
  }
}

export default MazeRenderer;
