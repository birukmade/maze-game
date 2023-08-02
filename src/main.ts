import { World, Engine, Runner, Render, Bodies } from "matter-js";

const HEIGHT = 600;
const WIDTH = 600;
const WALL_THICKNESS = 20;

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
  Bodies.rectangle(WALL_THICKNESS / 2, HEIGHT / 2, WALL_THICKNESS, HEIGHT, {
    isStatic: true,
  }),
  Bodies.rectangle(
    WIDTH - WALL_THICKNESS / 2,
    HEIGHT / 2,
    WALL_THICKNESS,
    HEIGHT,
    { isStatic: true }
  ),
  Bodies.rectangle(WIDTH / 2, WALL_THICKNESS / 2, WIDTH, WALL_THICKNESS, {
    isStatic: true,
  }),
  Bodies.rectangle(
    WIDTH / 2,
    HEIGHT - WALL_THICKNESS / 2,
    WIDTH,
    WALL_THICKNESS,
    { isStatic: true }
  ),
];

World.add(world, walls);
