import camera from './camera';
import light from './light'
import background from '../objects/background'
import { canvas } from '../../libs/weapp-adapter';

class Scene {
  constructor() {
    this.instance = null
  }
  init() {
    this.instance = new THREE.Scene;
    const renderer = this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antilias: true, // 抗？锯齿
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

  render() {
    this.renderer.render(this.instance, this.camera.instance)
    // requestAnimationFrame(this.render.bind(this));
  }
}

export default new Scene()