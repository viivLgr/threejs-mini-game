import sceneConf from '../../confs/scene-conf';

export default class GameOverPage {
  constructor(callbacks) {
    this.callbacks = callbacks;
  }

  init(options) {
    this.initGameCanvas(options)
  }

  initGameCanvas(options) {
    const aspect = window.innerHeight / window.innerWidth

    const left = (window.innerWidth - 200) / 2
    const top = (window.innerHeight - 100) / 2
    const width = 200
    const height = 100

    this.region = [ left, left + width, top, top + height ]

    this.camera = options.camera;
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.texture = new THREE.Texture(this.canvas); // 纹理
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide
    })
    this.geometry = new THREE.PlaneGeometry(sceneConf.frustumSize * 2, aspect * sceneConf.frustumSize * 2)
    this.obj = new THREE.Mesh(this.geometry, this.material);
    this.obj.position.z = 20

    this.context = this.canvas.getContext('2d');
    this.context.fillStyle = '#333'
    this.context.fillRect(left, top, width, height);

    this.context.fillStyle = '#eee'
    this.context.font = '20px Georga'
    this.context.fillText('Game Over', left + 50, top + 55);

    this.texture.needsUpdate = true;
    this.obj.visible = false;
    this.camera.add(this.obj);
  }

  onTouchEnd = (e) => {
    const pageX = e.changedTouches[0].pageX
    const pageY = e.changedTouches[0].pageY
    if (pageX > this.region[0] && pageX < this.region[1] && pageY > this.region[2] && pageY < this.region[3]) {
      this.callbacks.gameRestart();
    }
  }

  bindTouchEvent() {
    canvas.addEventListener('touchend', this.onTouchEnd)
  }

  removeTouchEvent() {
    canvas.removeEventListener('touchend', this.onTouchEnd);
  }

  show() {
    this.obj.visible = true
    this.bindTouchEvent();
  }
  hide() {
    this.obj.visible = false
    this.removeTouchEvent()
  }
}