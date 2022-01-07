class Ground{
  constructor() {

  }
  init() {
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.ShadowMaterial({
      transparent: true,
      color: 0x000000,
      opacity: 0.3
    })

    this.instance = new THREE.Mesh(groundGeometry, material);
    this.instance.receiveShadow = true;
    this.instance.rotation.x = -Math.PI / 2
    this.instance.position.y = -16 / 3.2;
  }

  updatePosition(position) {
    this.instance.position.x = position.x
    this.instance.position.z = position.z
  }
}

export default new Ground()