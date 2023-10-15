import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  Vector3,
} from "three";
import Maze, { Cell, CellType } from "./Maze";

const floorColor = {
  [CellType.ENTRY]: new Color("#e17569"),
  [CellType.EXIT]: new Color("#88f5c8"),
  [CellType.NORMAL]: new Color("gray"),
};

class MazeRenderer {
  width: number;
  height: number;

  wallSize: number;

  mazeData: Cell[];
  mazeObject: Group;
  private animatedCellIndex: number;

  constructor(width?: number, height?: number, wallSize?: number) {
    this.width = width ?? 10;
    this.height = height ?? 10;

    this.mazeData = new Maze(this.width, this.height).getGridData();
    this.mazeObject = new Group();

    this.wallSize = wallSize ?? 1;

    this.animatedCellIndex = 0;
  }

  getWall(position: Vector3) {
    const wallGeometry = new BoxGeometry(this.wallSize, this.wallSize, 0.05);
    const wallMaterial = new MeshStandardMaterial({ color: "white" });

    const wall = new Mesh(wallGeometry, wallMaterial);
    wall.castShadow = true;
    wall.receiveShadow = true;

    wall.position.set(position.x, position.y, position.z);
    return wall;
  }

  getFloor(type: CellType, origin: Vector3) {
    const floorWall = this.getWall(origin);

    floorWall.material.color = floorColor[type];
    floorWall.position.x = floorWall.position.x + this.wallSize / 2;
    floorWall.position.y = floorWall.position.y - this.wallSize / 2;
    floorWall.position.z = floorWall.position.z - this.wallSize / 2;

    floorWall.rotateX(Math.PI / 2);
    return floorWall;
  }

  getCellByType(type: CellType) {
    return this.mazeData.filter((cell) => cell.type === type);
  }

  getCellWalls(cell: Cell) {
    const cellWalls = new Group();

    const origin = new Vector3(
      cell.position.x,
      this.wallSize / 2,
      cell.position.y + 1
    );

    if (cell.walls.left) {
      const leftPosition = new Vector3(0, 0, -this.wallSize / 2);
      const cellWallPosition = leftPosition.add(origin);
      const wallLeft = this.getWall(cellWallPosition);
      wallLeft.rotation.y = Math.PI / 2;
      cellWalls.add(wallLeft);
    }

    if (cell.walls.right) {
      const rightPosition = new Vector3(1, 0, -this.wallSize / 2);
      const cellWallPosition = rightPosition.add(origin);
      const wallRight = this.getWall(cellWallPosition);
      wallRight.rotation.y = Math.PI / 2;
      cellWalls.add(wallRight);
    }

    if (cell.walls.up) {
      const topPosition = new Vector3(this.wallSize / 2, 0, -1);
      const cellWallPosition = topPosition.add(origin);
      const wallTop = this.getWall(cellWallPosition);
      cellWalls.add(wallTop);
    }

    if (cell.walls.bottom) {
      const bottomPosition = new Vector3(this.wallSize / 2, 0, 0);
      const cellWallPosition = bottomPosition.add(origin);
      const wallBottom = this.getWall(cellWallPosition);
      cellWalls.add(wallBottom);
    }

    cellWalls.add(this.getFloor(cell.type, origin));

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

  drawNextCell(scene: Scene, onComplete?: Function) {
    if (this.animatedCellIndex >= this.mazeData.length) {
      onComplete?.();
      return;
    }

    const cell = this.mazeData[this.animatedCellIndex];
    this.renderCell(cell);
    this.animatedCellIndex++;
    scene.add(this.mazeObject);
  }

  cleanup(scene: Scene) {
    scene.remove(this.mazeObject);
  }
}

export default MazeRenderer;
