import { customAnimation } from '../../libs/animation';
import bottleConf from '../../confs/bottle-conf'
import blockConf from '../../confs/block-conf'

class Bottle {
  constructor() {
  }

  init() {
    this.obj = new THREE.Object3D();
    this.obj.name = 'bottle'

    const { initPosition } = bottleConf;
    const { x, y, z } = initPosition;
    this.obj.position.set(x, y + 30, z)

    const { specularMaterial, bottomMaterial, middleMaterial } = this.loadTexture();

    this.bottle = new THREE.Object3D()

    const headRadius = bottleConf.headRadius;
    this.head = new THREE.Mesh(
      new THREE.OctahedronGeometry(headRadius),
      bottomMaterial,
    )
    this.head.castShadow = true;

    const bottom = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.62857 * headRadius, // 上半平面园的半径
        0.907143 * headRadius, // 下半平面园的半径
        1.91423 * headRadius, // 高度
        20, // 圆精度 多边形模拟圆
      ),
      bottomMaterial,
    )
    bottom.castShadow = true;

    
    const middle = new THREE.Mesh(
      new THREE.CylinderGeometry(
        headRadius / 1.4,
        headRadius / 1.44 * 0.88,
        headRadius * 1.2,
        20
      ),
      middleMaterial
    )
    middle.castShadow = true
    middle.position.y = 1.3857 * headRadius

    const topGeometry = new THREE.SphereGeometry(headRadius / 1.4, 20, 20)
    topGeometry.scale(1, 0.54, 1)
    const top = new THREE.Mesh(topGeometry, specularMaterial)
    top.castShadow = true
    top.position.y = 1.8143 * headRadius

    this.body = new THREE.Object3D()
    this.body.add(bottom)
    this.body.add(middle)
    this.body.add(top)

    this.head.position.y = 3.57143 * headRadius
    // this.head.position.x = 0
    // this.head.position.z = 0;

    this.bottle.add(this.head);
    this.bottle.add(this.body);

    this.bottle.position.y = 2.2
    this.obj.add(this.bottle)
  }

  loadTexture() {
    this.loader = new THREE.TextureLoader();

    const specularTexture = this.loader.load('/game/res/images/head.png');
    const bottomTexture = this.loader.load('/game/res/images/bottom.png');
    const middleTexture = this.loader.load('/game/res/images/middle.png');
    const specularMaterial = new THREE.MeshBasicMaterial({
      map: specularTexture
    })
    const bottomMaterial = new THREE.MeshBasicMaterial({
      map: bottomTexture
    })
    const middleMaterial = new THREE.MeshBasicMaterial({
      map: middleTexture
    })

    return { specularMaterial, bottomMaterial, middleMaterial };
  }

  update() {
    this.head.rotation.y += 0.06;
  }

  showup() {
    customAnimation.to(0.8, this.obj.position, {
      x: bottleConf.initPosition.x,
      y: bottleConf.initPosition.y + blockConf.height / 2,
      z: bottleConf.initPosition.z,
    }, 'BounceEaseOut')
  }
}

export default new Bottle()