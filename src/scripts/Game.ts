import * as PIXI from 'pixi.js';
import Player from './player/Player';
import Wall from './entities/Wall';
import Zombie from './enemies/Zombie';
import Matter from 'matter-js';
import type GameMap from '../types/GameMap';

export default class Game {
  constructor(loader: PIXI.Loader, element: HTMLElement) {
    this.#app = new PIXI.Application({
      backgroundColor: 0xfafafa,
      width: this.#width,
      height: this.#height,
    });
    this.#app.screen.width = this.#width;
    this.#app.screen.height = this.#height;
    this.loader = loader;
    this.#element = element;
  }
  #element;
  loader: PIXI.Loader;
  physicsEngine = Matter.Engine.create();
  players: Player[] = [];
  enemies: Zombie[] = [];
  walls: Wall[] = [];
  #width = 640;
  #height = 480;
  #app;

  setup(map: GameMap) {
    this.#element.appendChild(this.#app.view);
    this.#createBounds();
    this.#setupMap(map);
    this.players.push(
      new Player(
        1,
        this.#app,
        this.loader.resources['player'].spritesheet!.animations,
        this.physicsEngine.world
      )
    );

    this.players[0].draw();

    for (let index = 0; index < 10; index++) {
      this.enemies.push(
        new Zombie(
          index,
          this.#app,
          this.walls,
          this.loader.resources['skeleton'].spritesheet!.animations,
          this.physicsEngine.world
        )
      );
    }

    this.#start();
  }

  #Loop(dt: number) {
    const entities = [...this.players, ...this.enemies];

    for (const entity of entities) {
      entity.update(dt, this.players);
    }

    [...entities, ...this.walls].forEach((entity) => {
      entity.draw();
    });

    Matter.Engine.update(this.physicsEngine, dt);
  }

  #start() {
    this.#app.ticker.add((dt) => this.#Loop(dt));
  }

  #createBounds() {
    const top = Matter.Bodies.rectangle(this.#width / 2, -16, this.#width, 8, {
      isStatic: true,
    });

    const left = Matter.Bodies.rectangle(
      -16,
      this.#height / 2,
      8,
      this.#height,
      {
        isStatic: true,
      }
    );
    const right = Matter.Bodies.rectangle(
      this.#width,
      this.#height / 2,
      32,
      this.#height,
      {
        isStatic: true,
      }
    );
    const bottom = Matter.Bodies.rectangle(
      this.#width / 2,
      this.#height,
      this.#width,
      32,
      {
        isStatic: true,
      }
    );

    Matter.Composite.add(this.physicsEngine.world, top);
    Matter.Composite.add(this.physicsEngine.world, bottom);
    Matter.Composite.add(this.physicsEngine.world, right);
    Matter.Composite.add(this.physicsEngine.world, left);
  }

  #setupMap(gameMap: GameMap) {
    const WALL = 'x';

    const mapArr = gameMap.map.map((row) => row.split(''));
    let count = 0;
    mapArr.forEach((row, y) =>
      row.forEach((col, x) => {
        if (col === WALL)
          this.walls.push(
            new Wall(
              count++,
              this.#app,
              this.physicsEngine.world,
              PIXI.Sprite.from(this.loader.resources['wall'].texture!),
              x,
              y
            )
          );
      })
    );
    console.log(mapArr);
  }
}
