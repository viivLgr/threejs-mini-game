import Base from './base'

export default class Cylinder extends Base {
  constructor(x, y, z, width) {
    super('cylinder');

    const size = width || this.width
    const geometry = new THREE.CylinderGeometry(size / 2, size / 2, this.height, 120)
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
    })

    this.instance = new THREE.Mesh(geometry, material);
    this.instance.receiveShadow = true; // 可接受阴影
    this.instance.name = 'block'

    this.x = x;
    this.y = y;
    this.z = z;
    this.instance.castShadow = true; // 也可投射阴影
    this.instance.position.x = this.x;
    this.instance.position.y = this.y;
    this.instance.position.z = this.z;
  }
}