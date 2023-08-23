import Matter, {
  World,
  Engine,
  Runner,
  Render,
  Bodies,
  Body,
  Events,
} from "matter-js";

const HEIGHT = window.innerHeight - 10; // full height of the viewport minus half of the border wall thickness
const WIDTH = window.innerWidth - 10; // full width of the viewport minus half of the border wall thickeness
const BORDER_WALL_THICKNESS = 20;
const MAZE_WALL_THICKNESS = 5;
const HORIZONTAL_CELLS = 10;
const VERTICAL_CELLS = 7;
//total space for drawing cells = total width - space taken by bordewr walls on each side
const CELL_WIDTH = (WIDTH - BORDER_WALL_THICKNESS * 2) / HORIZONTAL_CELLS;
const CELL_HEIGHT = (HEIGHT - BORDER_WALL_THICKNESS * 2) / VERTICAL_CELLS;

const engine = Engine.create();
engine.gravity.y = 0;
const { world } = engine;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
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
      render: {
        fillStyle: "grey",
      },
    }
  ),
  Bodies.rectangle(
    WIDTH - BORDER_WALL_THICKNESS / 2,
    HEIGHT / 2,
    BORDER_WALL_THICKNESS,
    HEIGHT,
    {
      isStatic: true,
      render: {
        fillStyle: "grey",
      },
    }
  ),
  Bodies.rectangle(
    WIDTH / 2,
    BORDER_WALL_THICKNESS / 2,
    WIDTH,
    BORDER_WALL_THICKNESS,
    {
      isStatic: true,
      render: {
        fillStyle: "grey",
      },
    }
  ),
  Bodies.rectangle(
    WIDTH / 2,
    HEIGHT - BORDER_WALL_THICKNESS / 2,
    WIDTH,
    BORDER_WALL_THICKNESS,
    {
      isStatic: true,
      render: {
        fillStyle: "grey",
      },
    }
  ),
];

World.add(world, walls);

//Maze generation
const grid: boolean[][] = Array(VERTICAL_CELLS)
  .fill(null)
  .map(() => Array(HORIZONTAL_CELLS).fill(false));

const horizontals: boolean[][] = Array(VERTICAL_CELLS - 1)
  .fill(null)
  .map(() => Array(HORIZONTAL_CELLS).fill(false));

const verticals: boolean[][] = Array(HORIZONTAL_CELLS - 1)
  .fill(null)
  .map(() => Array(VERTICAL_CELLS).fill(false));

//select a random cell from the grid
const row: number = Math.floor(Math.random() * VERTICAL_CELLS);
const col: number = Math.floor(Math.random() * HORIZONTAL_CELLS);

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
        (nextRow as number) >= VERTICAL_CELLS ||
        (nextColumn as number) < 0 ||
        (nextColumn as number) >= HORIZONTAL_CELLS
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
      if (!isOpen) {
        const wall = Bodies.rectangle(
          BORDER_WALL_THICKNESS + colIndex * CELL_WIDTH + CELL_WIDTH / 2,
          BORDER_WALL_THICKNESS + rowIndex * CELL_HEIGHT + CELL_HEIGHT,
          CELL_WIDTH,
          MAZE_WALL_THICKNESS,
          {
            label: "maze wall",
            isStatic: true,
            render: {
              fillStyle: "red",
            },
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
            label: "maze wall",
            isStatic: true,
            render: {
              fillStyle: "red",
            },
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
    {
      isStatic: true,
      label: "goal object",
      render: {
        fillStyle: "green",
      },
    }
  );

  World.add(world, goal);
};

const drawPlayerObject = (
  borderWallThickness: number,
  cellWidth: number,
  cellHeight: number
): Matter.Body => {
  const playerObject = Bodies.circle(
    borderWallThickness + cellHeight / 2,
    borderWallThickness + cellHeight / 2,
    cellWidth > cellHeight ? cellHeight / 4 : cellWidth / 4,
    {
      label: "player object",
      render: {
        fillStyle: "yellow",
      },
    }
  );

  World.add(world, playerObject);
  return playerObject;
};

stepThroughCell(row, col);
//draw a wall for each vertical and horizontal walls
drawHorizontalLines(horizontals);
drowVerticalLines(verticals);

//draw goal object
drawGoalObject(WIDTH, HEIGHT, BORDER_WALL_THICKNESS, CELL_WIDTH, CELL_HEIGHT);

//draw player controlled object
const playerObject = drawPlayerObject(
  BORDER_WALL_THICKNESS,
  CELL_WIDTH,
  CELL_HEIGHT
);

//add keybord event listners
document.addEventListener("keydown", (event) => {
  const { x, y } = playerObject.velocity;
  if (event.code === "KeyW") {
    Body.setVelocity(playerObject, { x, y: y - 5 });
  }
  if (event.code === "KeyA") {
    Body.setVelocity(playerObject, { x: x - 5, y });
  }
  if (event.code === "KeyS") {
    Body.setVelocity(playerObject, { x, y: y + 5 });
  }
  if (event.code === "KeyD") {
    Body.setVelocity(playerObject, { x: x + 5, y });
  }
});

//detect a win
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const lables: string[] = ["goal object", "player object"];
    if (
      lables.includes(collision.bodyA.label) &&
      lables.includes(collision.bodyB.label)
    ) {
      engine.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "maze wall") Body.setStatic(body, false);
      });

      document.querySelector(".winner")?.classList.remove("hidden");
      document
        .querySelector("#play-again")
        ?.addEventListener("click", () => window.location.reload());
    }
  });
});
