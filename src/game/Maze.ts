enum WallState {
  LEFT = 1,
  RIGHT = 2,
  UP = 4,
  BOTTOM = 8,
}

export enum DIRECTION {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  UP = "UP",
  BOTTOM = "BOTTOM",
}

export interface Position {
  x: number;
  y: number;
}

export interface Walls {
  [DIRECTION.LEFT]: boolean;
  [DIRECTION.RIGHT]: boolean;
  [DIRECTION.UP]: boolean;
  [DIRECTION.BOTTOM]: boolean;
}

export enum CellType {
  ENTRY = "ENTRY",
  EXIT = "EXIT",
  NORMAL = "NORMAL",
}

export interface Cell {
  position: Position;
  walls: Walls;
  type: CellType;
}

export interface Neighbor {
  position: Position;
  sharedWall: WallState;
}

function oppositeWall(wall: WallState) {
  switch (wall) {
    case WallState.LEFT:
      return WallState.RIGHT;
    case WallState.RIGHT:
      return WallState.LEFT;
    case WallState.UP:
      return WallState.BOTTOM;
    case WallState.BOTTOM:
      return WallState.UP;
  }
}

class Maze {
  private width: number;
  private height: number;
  private walls: number[][];
  private entry: Position;
  private exit: Position;

  constructor(
    width?: number,
    height?: number,
    entry?: Position,
    exit?: Position
  ) {
    this.width = width ?? 10;
    this.height = height ?? 10;
    this.entry = entry ?? this.getRandomEntryPosition();
    this.exit = exit ?? this.getRandomExitPosition();
    this.walls = [];

    this.generateGrid();
    this.generateMaze();
    this.punchEntryAndExit();
  }

  private generateGrid() {
    const initialWallState =
      WallState.LEFT | WallState.RIGHT | WallState.UP | WallState.BOTTOM;
    for (let i = 0; i < this.height; i++) {
      this.walls.push([]);
      for (let j = 0; j < this.width; j++) {
        this.walls[i].push(initialWallState);
      }
    }
  }

  private generateMaze() {
    const visited: boolean[][] = [];

    for (let i = 0; i < this.height; i++) {
      visited.push([]);
      for (let j = 0; j < this.width; j++) {
        visited[i].push(false);
      }
    }

    const stack: Position[] = [];
    let current: Position = { x: 0, y: 0 };
    visited[current.x][current.y] = true;

    while (true) {
      const neighbors = this.getUnvisitedNeighbors(current, visited);
      if (neighbors.length > 0) {
        const neighbor =
          neighbors[Math.floor(Math.random() * neighbors.length)];

        stack.push(current);

        const neighborPosition = neighbor.position;
        this.removeSharedWall(current, neighbor);

        current = neighborPosition;
        visited[current.x][current.y] = true;
      } else if (stack.length > 0) {
        let item = stack.pop();
        current = item ?? { x: 0, y: 0 };
      } else {
        break;
      }
    }
  }

  private getUnvisitedNeighbors(current: Position, visited: boolean[][]) {
    const neighbors: Neighbor[] = [];
    const x = current.x;
    const y = current.y;

    if (x > 0 && !visited[x - 1][y]) {
      neighbors.push({
        position: { x: x - 1, y: y },
        sharedWall: WallState.LEFT,
      });
    }
    if (x < this.height - 1 && !visited[x + 1][y]) {
      neighbors.push({
        position: { x: x + 1, y: y },
        sharedWall: WallState.RIGHT,
      });
    }
    if (y > 0 && !visited[x][y - 1]) {
      neighbors.push({
        position: { x: x, y: y - 1 },
        sharedWall: WallState.UP,
      });
    }
    if (y < this.width - 1 && !visited[x][y + 1]) {
      neighbors.push({
        position: { x: x, y: y + 1 },
        sharedWall: WallState.BOTTOM,
      });
    }

    return neighbors;
  }

  private removeSharedWall(current: Position, neighbor: Neighbor) {
    const x = current.x;
    const y = current.y;
    const nx = neighbor.position.x;
    const ny = neighbor.position.y;
    const sharedWall = neighbor.sharedWall;

    this.walls[x][y] = this.walls[x][y] & ~sharedWall;
    this.walls[nx][ny] = this.walls[nx][ny] & ~oppositeWall(sharedWall);
  }

  private getMazeEdgeWall(position: Position) {
    const x = position.x;
    const y = position.y;
    if (x === 0) {
      return WallState.LEFT;
    } else if (x === this.height - 1) {
      return WallState.RIGHT;
    } else if (y === 0) {
      return WallState.UP;
    } else if (y === this.width - 1) {
      return WallState.BOTTOM;
    } else {
      return 0;
    }
  }

  private punchEntryAndExit() {
    this.walls[this.entry.x][this.entry.y] =
      this.walls[this.entry.x][this.entry.y] &
      ~this.getMazeEdgeWall(this.entry);
    this.walls[this.exit.x][this.exit.y] =
      this.walls[this.exit.x][this.exit.y] & ~this.getMazeEdgeWall(this.exit);
  }

  private getCellType(cell: Position) {
    if (this.isPositionEqual(cell, this.entry)) {
      return CellType.ENTRY;
    } else if (this.isPositionEqual(cell, this.exit)) {
      return CellType.EXIT;
    } else {
      return CellType.NORMAL;
    }
  }

  private getRandomEdgePosition() {
    const edge = Math.floor(Math.random() * 4);
    const position = { x: 0, y: 0 };

    switch (edge) {
      case 0:
        position.x = 0;
        position.y = Math.floor(Math.random() * this.height);
        break;
      case 1:
        position.x = this.height - 1;
        position.y = Math.floor(Math.random() * this.height);
        break;
      case 2:
        position.x = Math.floor(Math.random() * this.width);
        position.y = 0;
        break;
      case 3:
        position.x = Math.floor(Math.random() * this.width);
        position.y = this.width - 1;
        break;
    }

    return position;
  }

  private getRandomEntryPosition() {
    return this.getRandomEdgePosition();
  }

  private getRandomExitPosition(): Position {
    const exit = this.getRandomEdgePosition();
    if (
      this.isPositionEqual(exit, this.entry) ||
      this.isPositionSameOnEdge(exit, this.entry)
    ) {
      return this.getRandomExitPosition();
    } else {
      return exit;
    }
  }

  getGridData() {
    const gridData: Cell[] = [];
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        gridData.push({
          position: {
            x: i,
            y: j,
          },
          walls: {
            [DIRECTION.LEFT]: (this.walls[i][j] & WallState.LEFT) !== 0,
            [DIRECTION.RIGHT]: (this.walls[i][j] & WallState.RIGHT) !== 0,
            [DIRECTION.UP]: (this.walls[i][j] & WallState.UP) !== 0,
            [DIRECTION.BOTTOM]: (this.walls[i][j] & WallState.BOTTOM) !== 0,
          },
          type: this.getCellType({ x: i, y: j }),
        });
      }
    }
    return gridData;
  }

  getEntryPosition() {
    return this.entry;
  }

  getExitPosition() {
    return this.exit;
  }

  isPositionEqual(a: Position, b: Position) {
    return a.x === b.x && a.y === b.y;
  }

  isPositionSameOnEdge(a: Position, b: Position) {
    const aEdge = this.getMazeEdgeWall(a);
    const bEdge = this.getMazeEdgeWall(b);
    return aEdge === bEdge;
  }
}

export default Maze;
