import camera from './camera';
import light from './light'
import background from '../objects/background'

class Scene {
  constructor() {
    this.instance = null
    this.currentScore = null
  }
  init() {
    this.instance = new THREE.Scene();
    const renderer = this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true, // 抗？锯齿
      preserveDrawingBuffer: true, // 缓冲区
    })

    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap;

    this.camera = camera
    this.light = light;
    this.camera.init();
    this.light.init();

    this.axesHelper = new THREE.AxesHelper(100)

    this.instance.add(this.axesHelper);
    this.instance.add(this.camera.instance);
    for (let lightType in this.light.instances) {
      this.instance.add(this.light.instances[lightType])
    }

    this.background = background
    this.background.init()
    this.background.instance.position.z = -84;
    this.camera.instance.add(this.background.instance);
  }

  addScore(scoreInstance) {
    if (this.currentScore) {
      this.camera.instance.remove(this.currentScore);
    }
    this.currentScore = scoreInstance;
    this.camera.instance.add(scoreInstance);
    scoreInstance.position.x = -20
    scoreInstance.position.y = 40
  }

  render() {
    this.renderer.render(this.instance, this.camera.instance)
  }

  updateCameraPosition(position) {
    this.camera.updatePosition(position);
    this.light.updatePosition(position)
  }

  reset() {
    this.camera.reset();
    this.light.reset();
  }
}

export default new Scene()