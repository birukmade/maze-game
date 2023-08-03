import { World, Engine, Runner, Render, Bodies } from "matter-js";

const HEIGHT = 600;
const WIDTH = 600;
const BORDER_WALL_THICKNESS = 20;
const MAZE_WALL_THICKNESS = 5;
const CELLS = 15;
//total space for drawing cells = total width - space taken by bordewr walls on each side
const CELL_WIDTH = (WIDTH - BORDER_WALL_THICKNESS * 2) / CELLS;
const CELL_HEIGHT = (HEIGHT - BORDER_WALL_THICKNESS * 2) / CELLS;

const engine = Engine.create();
const { world } = engine;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: WIDTH,
    height: HEIGHT,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

//border walls
const walls: Matter.Body[] = [
  Bodies.rectangle(
    BORDER_WALL_THICKNESS / 2,
    HEIGHT / 2,
    BORDER_WALL_THICKNESS,
    HEIGHT,
    {
      isStatic: true,
    }
  ),
  Bodies.rectangle(
    WIDTH - BORDER_WALL_THICKNESS / 2,
    HEIGHT / 2,
    BORDER_WALL_THICKNESS,
    HEIGHT,
    { isStatic: true }
  ),
  Bodies.rectangle(
    WIDTH / 2,
    BORDER_WALL_THICKNESS / 2,
    WIDTH,
    BORDER_WALL_THICKNESS,
    {
      isStatic: true,
    }
  ),
  Bodies.rectangle(
    WIDTH / 2,
    HEIGHT - BORDER_WALL_THICKNESS / 2,
    WIDTH,
    BORDER_WALL_THICKNESS,
    { isStatic: true }
  ),
];

World.add(world, walls);

//Maze generation
const grid: boolean[][] = Array(CELLS)
  .fill(null)
  .map(() => Array(3).fill(false));

const horizontals: boolean[][] = Array(CELLS - 1)
  .fill(null)
  .map(() => Array(CELLS).fill(false));

const verticals: boolean[][] = Array(CELLS - 1)
  .fill(null)
  .map(() => Array(CELLS).fill(false));

//select a random cell from the grid
const row: number = Math.floor(Math.random() * CELLS);
const col: number = Math.floor(Math.random() * CELLS);

const shuffle = <T>(arr: T[][]): T[][] => {
  let pointer = arr.length;
  while (pointer > 0) {
    const index = Math.floor(Math.random() * arr.length);
    pointer--;
    const temp = arr[pointer];
    arr[pointer] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const generteShuffledNeighbors = (
  row: number,
  col: number
): (string | number)[][] => {
  return shuffle([
    [row - 1, col, "up"], // top neighbor
    [row + 1, col, "down"], // bottom neighbor
    [row, col - 1, "left"], //left neighbor
    [row, col + 1, "right"], // right neighbor
  ]);
};

const stepThroughCell = (row: number, col: number) => {
  //check if the cell is not visited before
  if (!grid[row][col]) {
    grid[row][col] = true;

    //generate list of all neighboors for the cell with a random direction order
    const neighbors = generteShuffledNeighbors(row, col);

    //iterate through all neighbors and visit them
    for (const neighbor of neighbors) {
      const [nextRow, nextColumn, direction] = neighbor;

      //filter out of bound neighbors
      if (
        (nextRow as number) < 0 ||
        (nextRow as number) >= CELLS ||
        (nextColumn as number) < 0 ||
        (nextColumn as number) >= CELLS
      ) {
        continue;
      }
      //check if this neighbour was visited before
      if (grid[nextRow as number][nextColumn as number]) {
        continue;
      }

      //remove either a horizontal or a vertical wall based on the directon of the selected neighbor
      if ((direction as string) === "left") {
        verticals[col - 1][row] = true;
      } else if ((direction as string) === "right") {
        verticals[col][row] = true;
      } else if ((direction as string) === "up") {
        horizontals[row - 1][col] = true;
      } else if ((direction as string) === "down") {
        horizontals[row][col] = true;
      }

      //visit the selected neighbor
      stepThroughCell(nextRow as number, nextColumn as number);
    }
  }
};

const drawHorizontalLines = (horizontalLines: boolean[][]): void => {
  horizontalLines.forEach((row, rowIndex) => {
    row.forEach((isOpen, colIndex) => {
      console.log(isOpen);
      if (!isOpen) {
        const wall = Bodies.rectangle(
          BORDER_WALL_THICKNESS + colIndex * CELL_WIDTH + CELL_WIDTH / 2,
          BORDER_WALL_THICKNESS + rowIndex * CELL_HEIGHT + CELL_HEIGHT,
          CELL_WIDTH,
          MAZE_WALL_THICKNESS,
          {
            isStatic: true,
          }
        );

        World.add(world, wall);
      }
    });
  });
};

const drowVerticalLines = (verticalLines: boolean[][]): void => {
  verticalLines.forEach((row, rowIndex) => {
    row.forEach((isOpen, colIndex) => {
      if (!isOpen) {
        const wall = Bodies.rectangle(
          BORDER_WALL_THICKNESS + rowIndex * CELL_WIDTH + CELL_WIDTH,
          BORDER_WALL_THICKNESS + colIndex * CELL_HEIGHT + CELL_HEIGHT / 2,
          MAZE_WALL_THICKNESS,
          CELL_HEIGHT,
          {
            isStatic: true,
          }
        );

        World.add(world, wall);
      }
    });
  });
};

const drawGoalObject = (
  width: number,
  height: number,
  borderWallThickness: number,
  cellWidth: number,
  cellHeight: number
) => {
  const goal = Bodies.rectangle(
    width - borderWallThickness - cellWidth / 2,
    height - borderWallThickness - cellHeight / 2,
    cellWidth * 0.6,
    cellHeight * 0.6,
    { isStatic: true }
  );

  World.add(world, goal);
};

stepThroughCell(row, col);
//draw a wall for each vertical and horizontal walls
drawHorizontalLines(horizontals);
drowVerticalLines(verticals);

//draw goal object
drawGoalObject(WIDTH, HEIGHT, BORDER_WALL_THICKNESS, CELL_WIDTH, CELL_HEIGHT);
