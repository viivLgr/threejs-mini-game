import sceneConf from '../../confs/scene-conf';
import { customAnimation } from '../../libs/animation'

class Camera {
  constructor() {
    this.instance = null
  }

  init() {
    const aspect = window.innerHeight / window.innerWidth;
    this.instance = new THREE.OrthographicCamera(-sceneConf.frustumSize, sceneConf.frustumSize, sceneConf.frustumSize * aspect, -sceneConf.frustumSize * aspect, -100, 85)
    // this.instance.position.set(0, 0, 10)
    this.instance.position.set(-10, 10, 10)
    this.target = new THREE.Vector3(0, 0, 0)
    this.instance.lookAt(this.target);
  }

  updatePosition(position) {
    customAnimation.to(0.5, this.instance.position, {
      x: position.x - 10,
      y: position.y + 10,
      z: position.z + 10
    })

    customAnimation.to(0.5, this.target.position, {
      x: position.x,
      y: position.y,
      z: position.z
    })
  }

  reset() {
    this.instance.position.set(-10, 10, 10)
    this.target = new THREE.Vector3(0, 0, 0)
  }

}

export default new Camera()