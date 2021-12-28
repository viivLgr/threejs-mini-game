import sceneConf from '../../confs/scene-conf'
class Background{
  constructor() {

  }
  init() {
    const background = new THREE.PlaneGeometry(sceneConf.frustumSize * 2, window.innerHeight / window.innerWidth * sceneConf.frustumSize * 2)
    const material = new THREE.MeshBasicMaterial({
      color: 0xd7dbe6,
      opacity: 1,
      transparent: true
    })

    this.instance = new THREE.Mesh(background, material);
  }
}

export default new Background()