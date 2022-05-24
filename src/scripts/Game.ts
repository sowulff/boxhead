import * as PIXI from 'pixi.js';
import Player from './player/Player';
import Wall from './entities/Wall';
import Zombie from './enemies/Zombie';
import { RandomEvenPos } from './utils/RandomCol';
import { Spritesheet } from 'pixi.js';

export default class Game {
  constructor(
    app: PIXI.Application,
    loader: PIXI.Loader,
    element: HTMLElement
  ) {
    this.#app = app;
    this.loader = loader;
    element.appendChild(this.#app.view);
  }
  loader: PIXI.Loader;
  players: Player[] = [];
  enemies: Zombie[] = [];
  walls: Wall[] = [];
  #width = 640;
  #height = 480;
  #res = 32;
  #app;

  setup() {
    this.players.push(
      new Player(
        1,
        this.#app,
        this.loader.resources['player'].spritesheet!.animations
      )
    );

    this.players[0].draw();

    for (let index = 0; index < 100; index++) {
      this.walls.push(new Wall(index, this.#app));
    }

    for (let index = 0; index < 10; index++) {
      this.enemies.push(
        new Zombie(
          index,
          this.#app,
          this.walls,
          this.loader.resources['skeleton'].spritesheet!.animations
        )
      );
    }

    this.#start();
  }

  #Loop(dt: number) {
    const entities = [...this.players, ...this.enemies];

    entities.forEach((entity) => {
      entity.update(dt, this.players);
    });

    [...entities, ...this.walls].forEach((entity) => {
      entity.draw();
    });
  }

  #start() {
    this.#app.ticker.add((dt) => this.#Loop(dt));
  }
}
