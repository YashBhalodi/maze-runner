import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Scene,
  Vector3,
} from "three";
import Maze, { Cell, CellType, DIRECTION } from "./Maze";

const floorColor = {
  [CellType.ENTRY]: new Color("#e17569"),
  [CellType.EXIT]: new Color("#88f5c8"),
  [CellType.NORMAL]: new Color("gray"),
};

class MazeRenderer {
  width: number;
  height: number;

  wallSize: number;

  maze: Maze;
  mazeData: Cell[];
  mazeObject: Group;
  entryCellObject: Group;
  exitCellObject: Group;
  private animatedCellIndex: number;

  constructor(width?: number, height?: number, wallSize?: number) {
    this.width = width ?? 10;
    this.height = height ?? 10;

    this.maze = new Maze(this.width, this.height);
    this.mazeData = this.maze.getGridData();
    this.mazeObject = new Group();

    this.entryCellObject = new Group();
    this.exitCellObject = new Group();

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
    floorWall.position.x = 0;
    floorWall.position.y = -this.wallSize / 2;

    floorWall.rotateX(Math.PI / 2);
    return floorWall;
  }

  getCellByType(type: CellType) {
    return this.mazeData.filter((cell) => cell.type === type);
  }

  getCellWalls(cell: Cell) {
    const cellWalls = new Group();

    const halfWallSize = this.wallSize / 2;

    const origin = new Vector3(cell.position.x, cell.position.y, 0);

    if (cell.walls[DIRECTION.LEFT]) {
      const leftPosition = new Vector3(-halfWallSize, 0, 0);
      const wallLeft = this.getWall(leftPosition);
      wallLeft.rotation.y = Math.PI / 2;
      cellWalls.add(wallLeft);
    }

    if (cell.walls[DIRECTION.RIGHT]) {
      const rightPosition = new Vector3(halfWallSize, 0, 0);
      const wallRight = this.getWall(rightPosition);
      wallRight.rotation.y = Math.PI / 2;
      cellWalls.add(wallRight);
    }

    if (cell.walls[DIRECTION.UP]) {
      const topPosition = new Vector3(0, 0, -halfWallSize);
      const wallTop = this.getWall(topPosition);
      cellWalls.add(wallTop);
    }

    if (cell.walls[DIRECTION.BOTTOM]) {
      const bottomPosition = new Vector3(0, 0, halfWallSize);
      const wallBottom = this.getWall(bottomPosition);
      cellWalls.add(wallBottom);
    }

    cellWalls.add(this.getFloor(cell.type, origin));

    cellWalls.position.set(
      origin.x + halfWallSize,
      halfWallSize,
      origin.y + halfWallSize
    );

    if (cell.type === CellType.ENTRY) {
      this.entryCellObject = cellWalls;
    }
    if (cell.type === CellType.EXIT) {
      this.exitCellObject = cellWalls;
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
