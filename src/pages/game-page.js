import { scene } from '../scene/index'
import Cuboid from '../block/cuboid'
import Cylinder from '../block/cylinder'
import ground from '../objects/ground';
import bottle from '../objects/bottle';
import ScoreText from '../view3d/scoreText';
import blockConf from '../../confs/block-conf';
import gameConf from '../../confs/game-conf';
import utils from '../utils/index';
import bottleConf from '../../confs/bottle-conf';
import audioManager from '../modules/audio-manager';
import tailSystem from '../objects/tail';
import { stopAllAnimation } from '../../libs/animation';

const HIT_NEXT_BLOCK_CENTER = 1;
const HIT_CURRENT_BLOCK = 2;
const GAME_OVER_NEXT_BLOCK_BACK = 3;
const GAME_OVER_CURRENT_BLOCK_BACK = 4;
const GAME_OVER_NEXT_BLOCK_FRONT = 5;
const GAME_OVER_BOTH = 6;
const HIT_NEXT_BLOCK_NORMAL = 7;

export default class GamePage {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.targetPosition = {}
    this.checkingHit = false;
    this.score = 0;
    this.combo = 0;
    this.now = Date.now()
    this.lastFrameTime = Date.now();
  }

  init() {
    this.scene = scene;
    this.ground = ground;
    this.bottle = bottle;
    this.tailSystem = tailSystem;
    this.scoreText = new ScoreText()
    this.scene.init()
    this.ground.init()
    this.bottle.init()
    this.tailSystem.init(this.scene.instance, this.bottle);
    this.scoreText.init({
      fillStyle: 0x666699 
    })
    this.addInitBlock()
    this.addGround()
    this.addBottle()
    this.addScore();
    this.bindTouchEvent()
    this.render()
  }

  addScore() {
    this.scene.addScore(this.scoreText.instance);
  }

  updateScore(score) {
    this.scoreText.updateScore(score)
  }

  bindTouchEvent() {
    canvas.addEventListener('touchstart', this.touchStartCallback)
    canvas.addEventListener('touchend', this.touchEndCallback)
  }

  removeTouchEvent() {
    canvas.removeEventListener('touchstart', this.touchStartCallback)
    canvas.removeEventListener('touchend', this.touchEndCallback)
  }

  touchStartCallback = (event) => {
    this.touchStartTime = Date.now();
    this.bottle.shrink();
    this.currentBlock.shrink()
    audioManager.shrink.play();
  }

  touchEndCallback = (event) => {
    this.touchEndTime = Date.now();
    const duration = this.touchEndTime - this.touchStartTime;
    this.currentBlock.rebound();
    this.bottle.rotate()
    this.bottle.jump(duration)
    const initY = (1 - this.currentBlock.instance.scale.y) * blockConf.height;
    this.hit = this.getHitStatus(this.bottle, this.currentBlock, this.nextBlock, initY);
    this.checkingHit = true
    // this.bottle.stop();

    audioManager.shrink.stop();
    audioManager.shrink_end.stop();
  }

  getHitStatus(bottle, currentBlock, nextBlock, initY) {
    const vy = parseFloat(bottle.velocity.vy)
    const vx = parseFloat(bottle.velocity.vx)
    const gravity = parseFloat(gameConf.gravity)
    let flyingTime = vy / gravity * 2.0
    initY = initY || +bottle.obj.position.y.toFixed(2)

    var destinationY = blockConf.height / 2

    let time = +((-vy + Math.sqrt(Math.pow(vy, 2) - 2 * gravity * destinationY)) / -gravity).toFixed(2)

    if (!time) { return 0 }

    flyingTime -= time;
    flyingTime = +flyingTime.toFixed(2)

    const destination = []
    const bottlePosition = new THREE.Vector2(bottle.obj.position.x, bottle.obj.position.z)
    const translate = new THREE.Vector2(this.axis.x, this.axis.z).setLength(vx * flyingTime)
    bottlePosition.add(translate)
    bottle.destination = [+bottlePosition.x.toFixed(2), +bottlePosition.y.toFixed(2)]
    destination.push(+bottlePosition.x.toFixed(2))
    destination.push(+bottlePosition.y.toFixed(2))

    const bodyWidth = 1.8141 * bottleConf.headRadius;
    let result1, result2;
    if (nextBlock) {
      const nextDiff = Math.pow(destination[0] - nextBlock.instance.position.x, 2) + Math.pow(destination[1] - nextBlock.instance.position.z, 2)
      const nextPolygon = nextBlock.getVertices()
      if (utils.pointInPolygon(destination, nextPolygon)) {
        if (Math.abs(nextDiff) < 5) {
          result1 = HIT_NEXT_BLOCK_CENTER
        } else  {
          result1 = HIT_NEXT_BLOCK_NORMAL
        }
      } else if (utils.pointInPolygon([destination[0] - bodyWidth / 2, destination[1]], nextPolygon) || utils.pointInPolygon([destination[0], destination[1] + bodyWidth / 2], nextPolygon)) { // x 前 z 左
        result1 = GAME_OVER_NEXT_BLOCK_BACK
      } else if (utils.pointInPolygon([destination[0] + bodyWidth / 2, destination[1]], nextPolygon) || utils.pointInPolygon([destination[0], destination[1] - bodyWidth / 2], nextPolygon)) {// x 后 z 右
        result1 = GAME_OVER_NEXT_BLOCK_FRONT
      }
    }

    if (currentBlock) {
      const currentPolygon = currentBlock.getVertices();
      if (utils.pointInPolygon(destination, currentPolygon)) {
        result2 = HIT_CURRENT_BLOCK;
      } else if (utils.pointInPolygon([destination[0] - bodyWidth / 2, destination[1]], currentPolygon) || utils.pointInPolygon([destination[0], destination[1] + bodyWidth / 2], currentPolygon)) {
        if (result1) {
          result2 = GAME_OVER_BOTH;
        } else {
          result2 = GAME_OVER_CURRENT_BLOCK_BACK
        }
      }
    }

    return result1 || result2 || 0
  }

  checkBottleHit() {
    if (this.bottle.obj.position.y <= blockConf.height / 2 && this.bottle.status === 'jump' && this.bottle.flyingTime >= 0.3) {
      this.checkingHit = true
      if (this.hit === HIT_NEXT_BLOCK_CENTER || this.hit == HIT_NEXT_BLOCK_NORMAL || this.hit === HIT_CURRENT_BLOCK) {
        this.bottle.stop()
        this.bottle.obj.position.y = blockConf.height / 2
        this.bottle.obj.position.x = this.bottle.destination[0]
        this.bottle.obj.position.z = this.bottle.destination[1]
        if (this.hit === HIT_NEXT_BLOCK_CENTER || this.hit == HIT_NEXT_BLOCK_NORMAL) {
          if (this.hit === HIT_NEXT_BLOCK_CENTER) {
            this.combo++;
            audioManager['combo' + (this.combo <= 8 ? this.combo : '8')].play();
            const addScore = 2 * this.combo
            this.score += addScore;
            this.bottle.showAddScore(addScore);
            this.updateScore(this.score);
          } else if (this.hit === HIT_NEXT_BLOCK_NORMAL) {
            audioManager.success.play()
            this.combo = 0;
            this.bottle.showAddScore(1);
            this.updateScore(++this.score);
          }
          this.updateNextBlock()
        }
      } else { // game over
        this.combo = 0;
        this.removeTouchEvent();

        if (this.hit === GAME_OVER_NEXT_BLOCK_BACK || this.hit === GAME_OVER_CURRENT_BLOCK_BACK) {
          stopAllAnimation();
          this.bottle.stop();
          this.bottle.forerake();
          audioManager.fall_from_block.play()
          this.bottle.obj.position.y = blockConf.height / 2;
          setTimeout(_ => {
            this.callbacks.showGameOverPage();
          }, 2000)
        } else if (this.hit === GAME_OVER_NEXT_BLOCK_FRONT) {
          stopAllAnimation();
          this.bottle.stop();
          this.bottle.hypsokinesis();
          audioManager.fall_from_block.play()
          this.bottle.obj.position.y = blockConf.height / 2;
          setTimeout(_ => {
            this.callbacks.showGameOverPage();
          }, 2000)
        } else {
          audioManager.fall.play()
          this.callbacks.showGameOverPage();
        }

        this.checkingHit = false
      }
      this.bottle.scatterParticles();
    }
  }

  updateNextBlock() {
    const seed = Math.round(Math.random())
    const type = seed ? 'cubold' : 'cylinder';
    const direction = Math.round(Math.random()); // 0 -> x 1 -> z
    const width = Math.round(Math.random() * 12) + 8
    const distance = Math.round(Math.random() * 20) + 20
    this.currentBlock = this.nextBlock;
    const targetPosition = this.targetPosition = {}

    if (direction === 0) { // x
      targetPosition.x = this.currentBlock.instance.position.x + distance
      targetPosition.y = this.currentBlock.instance.position.y
      targetPosition.z = this.currentBlock.instance.position.z
    } else { // z
      targetPosition.x = this.currentBlock.instance.position.x
      targetPosition.y = this.currentBlock.instance.position.y
      targetPosition.z = this.currentBlock.instance.position.z - distance
    }
    this.setDirection(direction)
    if (type === 'cuboid') {
      this.nextBlock = new Cuboid(targetPosition.x, targetPosition.y, targetPosition.z, width)
    }
    if (type === 'cylinder') {
      this.nextBlock = new Cylinder(targetPosition.x, targetPosition.y, targetPosition.z, width)
    }
    this.scene.instance.add(this.nextBlock.instance);
    const cameraTargetPosition = {
      x: (this.currentBlock.instance.position.x + this.nextBlock.instance.position.x) / 2,
      y: (this.currentBlock.instance.position.y + this.nextBlock.instance.position.y) / 2,
      z: (this.currentBlock.instance.position.z + this.nextBlock.instance.position.z) / 2,
    }
    this.scene.updateCameraPosition(cameraTargetPosition)
    this.ground.updatePosition(cameraTargetPosition)
  }

  setDirection(direction) {
    const currentPosition = {
      x: this.bottle.obj.position.x,
      z: this.bottle.obj.position.z
    }
    this.axis = new THREE.Vector3(this.targetPosition.x - currentPosition.x, 0, this.targetPosition.z - currentPosition.z);
    this.axis.normalize()
    this.bottle.setDirection(direction, this.axis);
  }

  render() {
    this.now = Date.now();
    const tickTime = this.now - this.lastFrameTime;
    this.scene.render();

    if (this.currentBlock) {
      this.currentBlock.update()
    }

    if (this.bottle) {
      this.bottle.update()
    }

    if (this.checkingHit) {
      this.checkBottleHit()
    }
    if (this.visible) {
      this.scene.render();
    }

    if (this.tailSystem) {
      this.tailSystem.update(tickTime);
    }
    this.lastFrameTime = Date.now();
    requestAnimationFrame(this.render.bind(this))
  }

  addInitBlock() {
    const cuboid = new Cuboid(-15, 0, 0)
    const cylinder = new Cylinder(23, 0, 0)

    this.currentBlock = cuboid;
    this.nextBlock = cylinder;

    this.targetPosition = {
      x: 23,
      y: 0,
      z: 0
    }
    const initPosition = 0
    this.scene.instance.add(cuboid.instance)
    this.scene.instance.add(cylinder.instance)

    this.setDirection(initPosition)
  }

  addGround() {
    this.scene.instance.add(this.ground.instance);
  }

  addBottle() {
    this.scene.instance.add(this.bottle.obj);
    this.bottle.showup();
    // setTimeout(_ => {
    //   this.bottle.rotate();
    // }, 1000)
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  restart() {
    this.score = 0;
    this.updateScore(this.score);
    this.deleteObjectsFromScene();
    this.scene.reset();
    this.bottle.reset();
    this.addInitBlock();
    this.addGround();
    this.addBottle();
    this.bindTouchEvent();
  }

  deleteObjectsFromScene() {
    let obj = this.scene.instance.getObjectByName('block');
    while (obj) {
      this.scene.instance.remove(obj)
      if (obj.geometry) {
        obj.geometry.dispose()
      }
      if (obj.material) {
        obj.material.dispose()
      }
      obj = this.scene.instance.getObjectByName('block');
    }

    this.scene.instance.remove(this.bottle.obj);
    this.scene.instance.remove(this.ground.instance);
  }

}