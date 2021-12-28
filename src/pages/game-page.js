import { scene } from '../scene/index'
import Cuboid from '../block/cuboid'
import Cylinder from '../block/cylinder'
import ground from '../objects/ground';
import bottle from '../objects/bottle';


export default class GamePage {
  constructor(callbacks) {
    this.callbacks = callbacks;
  }

  init() {
    this.scene = scene;
    this.ground = ground;
    this.bottle = bottle;
    this.scene.init()
    this.ground.init()
    this.bottle.init()
    this.addInitBlock()
    this.addGround()
    this.addBottle()

    this.bindTouchEvent()
    this.render()
  }

  bindTouchEvent() {
    console.log('bindTouchEvent')
    canvas.addEventListener('touchstart', this.touchStartCallback)
    canvas.addEventListener('touchend', this.touchEndCallback)
  }

  removeTouchEvent() {
    canvas.removeEventListener('touchstart', this.touchStartCallback)
    canvas.removeEventListener('touchend', this.toushEndCallback)
  }

  touchStartCallback(event) {
    console.log('touch start')
  }

  touchEndCallback(event) {
    console.log('touch end')
  }

  render() {
    this.scene.render();

    if (this.bottle) {
      this.bottle.update()
    }

    requestAnimationFrame(this.render.bind(this))
  }
  addInitBlock() {
    const cuboid = new Cuboid(-15, 0, 0)
    const cylinder = new Cylinder(23, 0, 0)

    this.scene.instance.add(cuboid.instance)
    this.scene.instance.add(cylinder.instance)
  }

  addGround() {
    this.scene.instance.add(this.ground.instance);
  }

  addBottle() {
    this.scene.instance.add(this.bottle.obj);
    this.bottle.showup();
  }

}