import sceneConf from "../../confs/scene-conf";

export default class StartPage {
  constructor(callbacks) {
    this.callbacks = callbacks;

  }

  init(options) {
    this.initStartPageCanvas(options);
    this.bindEventListener();
    console.log('start-page init');
  }

  initStartPageCanvas(options) {
    const aspect = window.innerHeight / window.innerWidth;
    this.region = [
      (window.innerWidth - 200) / 2,
      (window.innerWidth - 200) / 2 + 200,
      (window.innerHeight - 100) / 2 + 200,
      (window.innerHeight - 100) / 2 + 285,
    ]
    this.camera = options.camera;
    this.canvas = document.createElement('canvas')
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.texture = new THREE.Texture(this.canvas);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true
    })
    this.geometry = new THREE.PlaneGeometry(sceneConf.frustumSize * 2, aspect * sceneConf.frustumSize * 2);
    this.obj = new THREE.Mesh(this.geometry, this.material)
    this.obj.position.z = 60;
    this.context = this.canvas.getContext('2d');
    this.context.fillStyle = 'rgba(0,0,0,0.3)';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const titleImage = wx.createImage()
    titleImage.src = 'res/images/title.png';
    titleImage.onload = () => {
      this.context.drawImage(titleImage, (this.canvas.width - 200) / 2, 150, 200, 55)
      this.texture.needsUpdate = true
    }

    const startImage = wx.createImage()
    startImage.src = 'res/images/play.png'
    startImage.onload = () => {
      console.log('startimage loaded')
      this.context.drawImage(startImage, (this.canvas.width - 200) / 2, (this.canvas.height - 100) / 2 + 200, 200, 85)
      this.texture.needsUpdate = true
    }

    this.texture.needsUpdate = true
    this.camera.add(this.obj);
  }

  touchEndCallback = (e) => {
    const pageX = e.changedTouches[0].pageX
    const pageY = e.changedTouches[0].pageY
    console.log('start page on touch end', pageX, pageY)
    if (pageX > this.region[0] && pageX < this.region[1] && pageY > this.region[2] && pageY < this.region[3]) {
      console.log('start page on touch end 111')
      this.callbacks.gameRestart();
    }
  }

  bindEventListener() {
    canvas.addEventListener('touchend', this.touchEndCallback)
  }

  removeEventListener() {
    canvas.removeEventListener('touchend', this.touchEndCallback)
  }

  hide() {
    this.obj.visible = false
    this.removeEventListener()
  }
}
