import Base from './base'
import blockConf from '../../confs/block-conf';
import utils from '../utils/index';

export default class Cuboid extends Base {
  constructor(x, y, z, width) {
    super('cuboid');
    this.loader = new THREE.TextureLoader();

    const nameSeed = Math.floor(Math.random() * 2);
    let name;
    switch(nameSeed) {
      case 0: 
        name = 'color';
        break;
      case 1: 
        name = 'well';
        break;
      default:;
    }
    
    const size = width || this.width
    if (name === 'color') {
      const seed = Math.floor(Math.random() * 6);
      let currentColor;
      switch (seed) {
        case 0: 
          currentColor = blockConf.colors.orange;
          break;
        case 1: 
          currentColor = blockConf.colors.orangeDark;
          break;
        case 2: 
          currentColor = blockConf.colors.purple;
          break;
        case 3: 
          currentColor = blockConf.colors.green;
          break;
        case 4: 
          currentColor = blockConf.colors.blue;
          break;
        case 5: 
          currentColor = blockConf.colors.yellow;
          break;
        default:;
      }
      const innerMaterial = new THREE.MeshLambertMaterial({ color: blockConf.colors.white })
      const outerMaterial = new THREE.MeshLambertMaterial({ color: currentColor })
      
      const innerHeight = 3;
      const outerHeight = (blockConf.height - innerHeight) / 2
      const innerGeomatry = new THREE.BoxGeometry(size, innerHeight, size);
      const outerGeomatry = new THREE.BoxGeometry(size, outerHeight, size);

      const totalMesh = new THREE.Object3D()
      const topMesh = new THREE.Mesh(outerGeomatry, outerMaterial);
      topMesh.position.y = (innerHeight + outerHeight) / 2
      topMesh.receiveShadow = true
      topMesh.castShadow = true;
      const middleMesh = new THREE.Mesh(innerGeomatry, innerMaterial);
      middleMesh.receiveShadow = true
      middleMesh.castShadow = true;
      const bottomMesh = new THREE.Mesh(outerGeomatry, outerMaterial);
      bottomMesh.position.y = -(innerHeight + outerHeight) / 2
      bottomMesh.receiveShadow = true
      bottomMesh.castShadow = true;

      totalMesh.add(topMesh)
      totalMesh.add(middleMesh)
      totalMesh.add(bottomMesh)

      this.instance = totalMesh
    } else if (name === 'well') {
      const geometry = new THREE.BoxGeometry(size, this.height, size)
      const material = new THREE.MeshLambertMaterial({
        map: this.loader.load('res/images/well.png'),
      })
      utils.mapUv(280, 428, geometry, 1, 0, 0, 280, 148); // front
      utils.mapUv(280, 428, geometry, 2, 0, 148, 280, 428); // top
      utils.mapUv(280, 428, geometry, 4, 0, 0, 280, 148, true); // right

      this.instance = new THREE.Mesh(geometry, material);
    }
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