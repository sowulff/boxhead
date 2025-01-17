import Entity from '../entities/Entity';
import * as PIXI from 'pixi.js';
import { Dict } from '@pixi/utils';
import { Vector } from 'p5js-vector-standalone';
import Player from '../player/Player';
import Astar from './Astar';
import { RandomEvenPos } from '../utils/RandomCol';
import Matter from 'matter-js';

export default class Zombie extends Entity {
  constructor(
    id: number,
    app: PIXI.Application,
    obstacles: Entity[],
    animations: Dict<PIXI.Texture<PIXI.Resource>[]>,
    physicsComposite: Matter.World
  ) {
    super(id, physicsComposite);
    this.animations = animations;
    this.sprite = new PIXI.AnimatedSprite(this.animations['idle_right']);
    this.sprite.loop = false;
    this.sprite.animationSpeed = 0.2;
    this.sprite.height = this.size.height;
    this.sprite.width = this.size.width;

    app.stage.addChild(this.sprite!);
    this.windowHeight = app.screen.height;
    this.windowWidth = app.screen.width;

    const pos = RandomEvenPos(this.windowWidth, this.windowHeight, 32);
    Matter.Body.setPosition(this.body, Matter.Vector.create(pos.x, pos.y));

    this.lastx = this.position.x >= this.windowWidth * 0.5 ? -1 : 0;
    this.#pathFinder = new Astar(32, obstacles, app);
  }

  #pathFinder: Astar;

  vel = new Vector(0);
  sprite: PIXI.AnimatedSprite;
  animations: Dict<PIXI.Texture<PIXI.Resource>[]>;
  windowHeight: number;
  windowWidth: number;
  hitpoints = 100;
  damage = 10;
  maxSpeed = 2;
  walking = false;
  nextPos = new Vector(0);
  count = 0;
  lastx: number;

  update(dt: number, players: Player[]) {
    const newVec = this.#pathFinder.getPath(
      this.body.position,
      players[0].body.position
    );

    if (newVec.y < 0) {
      if (!this.sprite.playing) {
        this.sprite.textures =
          this.animations['run_' + (this.lastx < 0 ? 'left' : 'right')];
        this.sprite.play();
      }
    } else if (newVec.y > 0) {
      if (!this.sprite.playing) {
        this.sprite.textures =
          this.animations['run_' + (this.lastx < 0 ? 'left' : 'right')];
        this.sprite.play();
      }
    }
    if (newVec.x < 0) {
      this.lastx = newVec.x;
      if (!this.sprite.playing) {
        this.sprite.textures = this.animations['run_left'];
        this.sprite.play();
      }
    } else if (newVec.x > 0) {
      this.lastx = newVec.x;
      if (!this.sprite.playing) {
        this.sprite.textures = this.animations['run_right'];
        this.sprite.play();
      }
    }

    if (newVec.magSq() === 0) {
      if (!this.sprite.playing) {
        this.sprite.textures =
          this.animations['idle_' + (this.lastx < 0 ? 'left' : 'right')];
        this.sprite.play();
        //this.sprite.filters = [new PIXI.filters.BlurFilter()];
      }
    }

    this.vel.set(newVec.mult(dt));
    const force = Matter.Vector.create(this.vel.x, this.vel.y);
    Matter.Body.applyForce(this.body, this.body.position, force);
  }

  draw() {
    this.sprite.position.set(this.body.position.x, this.body.position.y);
  }
}
