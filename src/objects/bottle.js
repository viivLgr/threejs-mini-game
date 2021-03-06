import { 
  customAnimation,
  TweenAnimation,
} from '../../libs/animation';
import bottleConf from '../../confs/bottle-conf'
import blockConf from '../../confs/block-conf'
import gameConf from '../../confs/game-conf';
import audioManager from '../modules/audio-manager';
import ScoreText from '../view3d/scoreText';

class Bottle {
  constructor() {
    this.direction = 0; // x 轴
    this.axis = null; // 轴
    this.status = 'stop'; // 按压状态
    this.velocity = {
      vx: 0, // 水平方向速度
      vy: 0 //竖直方向速度
    }
    this.scale = 1;
    this.lastFrameTime = Date.now()
    this.flyingTime = 0;
  }

  init() {
    this.obj = new THREE.Object3D();
    this.obj.name = 'bottle'

    const { initPosition } = bottleConf;
    const { x, y, z } = initPosition;
    this.obj.position.set(x, y + 30, z)

    const { specularMaterial, bottomMaterial, middleMaterial } = this.loadTexture();

    this.bottle = new THREE.Object3D()
    this.human = new THREE.Object3D();

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

    this.human.add(this.head);
    this.human.add(this.body);
      
    this.bottle.add(this.human);
    this.bottle.position.y = 2.2
    this.obj.add(this.bottle)

    this.particles = []
    const whiteParticleMaterial = new THREE.MeshBasicMaterial({
      map: this.loader.load('res/images/white.png'),
      alphaTest: 0.5
    })
    const greenParticleMaterial = new THREE.MeshBasicMaterial({
      map: this.loader.load('res/images/green.png'),
      alphaTest: 0.5
    })

    const particleGeometry = new THREE.PlaneGeometry(2, 2);
    for (let i = 0; i < 15; i++) {
      const particle = new THREE.Mesh(particleGeometry, whiteParticleMaterial);
      particle.rotation.x = -Math.PI / 4;
      particle.rotation.y = -Math.PI / 5;
      particle.rotation.z = -Math.PI / 5;
      this.particles.push(particle)
      this.obj.add(particle);
    }
    for (let i = 0; i < 5; i++) {
      const particle = new THREE.Mesh(particleGeometry, greenParticleMaterial);
      particle.rotation.x = -Math.PI / 4;
      particle.rotation.y = -Math.PI / 5;
      particle.rotation.z = -Math.PI / 5;
      this.particles.push(particle)
      this.obj.add(particle);
    }


    this.scoreText = new ScoreText()
    this.scoreText.init({
      fillStyle: 0x252525,
    })
    this.scoreText.instance.visible = false;
    this.scoreText.instance.rotation.y = -Math.PI / 4;
    this.scoreText.instance.scale.set(0.5, 0.5, 0.5);
    this.obj.add(this.scoreText.instance);
  }

  showAddScore(score) {
    const value = '+' + score;
    this.scoreText.updateScore(value);
    this.scoreText.instance.visible = true;
    this.scoreText.instance.position.y = 3;
    this.scoreText.instance.material.opacity = 1;

    customAnimation.to(0.7, this.scoreText.instance.position, {
      y: blockConf.height + 6
    })

    TweenAnimation(this.scoreText.instance.material.opacity, 0, 0.7, null, (to, isEnd) =>{
      this.scoreText.instance.material.opacity = to;
      if (isEnd) {
        this.scoreText.instance.visible = false;
      }
    })

  }

  resetParticles() {
    if (this.gatherTimer) {
      clearTimeout(this.gatherTimer);
    }
    this.gatherTimer = null;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      particle.gathering = false;
      particle.scattering = false;
      particle.visible = false;
    }
  }

  scatterParticles() { // 
    for (let i = 0; i < 10; i++) {
      const particle = this.particles[i];
      particle.scattering = true;
      particle.gathering = false;
      this._scatterParticle(particle);
    }
  }

  _scatterParticle(particle) {
    const minDistance = bottleConf.bodywidth / 2;
    const maxDistance = 2;
    const x = (minDistance + Math.random() * (maxDistance - minDistance)) * (1 - 2 * Math.random());
    const z = (minDistance + Math.random() * (maxDistance - minDistance)) * (1 - 2 * Math.random());

    particle.scale.set(1, 1, 1);
    particle.visible = false;
    particle.position.x = x;
    particle.position.y = -0.5;
    particle.position.z = z;

    setTimeout(((particle) => {
      return () => {
        if (!particle.scattering) return
        particle.visible = true;
        const duration = 0.3 + Math.random() * 0.2;
        customAnimation.to(duration, particle.scale, {
          x: 0.2,
          y: 0.2,
          z: 0.2,
        })
        customAnimation.to(duration, particle.position, {
          x: 2 * x,
          y: 2 + Math.random() * 2.5,
          z: 2 * z,
        }, null, null, () => {
          particle.scattering = false;
          particle.visible = false;
        })
      }
    })(particle), Math.random() * 500);
  }

  gatherParticles() { // 聚集粒子
    for (let i = 10; i < 20; i++) {
      this.particles[i].gathering = true;
      this.particles[i].scattering = false;
      this._gatherParticle(this.particles[i])
    }

    this.gatherTimer = setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        this.particles[i].gathering = true;
        this.particles[i].scattering = false;
        this._gatherParticle(this.particles[i])
      }
    }, 500 + 1000 * Math.random());
  }

  _gatherParticle(particle) {
    const minDistance = 1;
    const maxDistance = 8;
    particle.scale.set(1, 1, 1);
    particle.visible = false;
    const x = Math.random() > 0.5 ? 1 : -1;
    const z =  Math.random() > 0.5 ? 1 : -1;
    particle.position.x = (minDistance + (maxDistance - minDistance) * Math.random()) * x; 
    particle.position.y = minDistance + (maxDistance - minDistance) * Math.random();
    particle.position.z = (minDistance + (maxDistance - minDistance) * Math.random()) * z;

    setTimeout(((particle) => {
      return () => {
        if (!particle.gathering) return
        particle.visible = true;
        const duration = 0.5 + Math.random() * 0.4;
        customAnimation.to(duration, particle.scale, {
          x: 0.8 + Math.random(),
          y: 0.8 + Math.random(),
          z: 0.8 + Math.random(),
        })
        customAnimation.to(duration, particle.position, {
          x: Math.random() * x,
          y: Math.random() * 2.5,
          z: Math.random() * z,
        }, null, null, () => {
          if (particle.gathering) {
            this._gatherParticle(particle)
          }
        })
      }
    })(particle), Math.random() * 500);
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
    if (this.status === 'shrink') { // 收缩
      this._shrink()
    } else if (this.status === 'jump') { // 
      const tickTime = Date.now() - this.lastFrameTime;
      this._jump(tickTime)
    }
    this.head.rotation.y += 0.06;
    this.lastFrameTime = Date.now()
  }

  showup() {
    audioManager.init.play();
    customAnimation.to(0.6, this.obj.position, {
      x: bottleConf.initPosition.x,
      y: bottleConf.initPosition.y + blockConf.height / 2,
      z: bottleConf.initPosition.z,
    }, 'Bounce.easeOut')
  }

  setDirection(direction, axis) {
    this.direction = direction
    this.axis = axis
  }

  _shrink() {
    const MIN_SCALE = 0.55
    const HORIZON_DELTA_SCALE = 0.007
    const DELTA_SCALE = 0.005
    const HEAD_DELTA = 0.03

    this.scale -= DELTA_SCALE;
    this.scale = Math.max(MIN_SCALE, this.scale);
    if (this.scale <= MIN_SCALE) return;

    this.body.scale.y = this.scale;
    this.body.scale.x += HORIZON_DELTA_SCALE
    this.body.scale.z += HORIZON_DELTA_SCALE
    this.head.position.y -= HEAD_DELTA; 

    const bottleDeltaY = HEAD_DELTA / 2
    const deltaY = blockConf.height * DELTA_SCALE / 2;
    this.obj.position.y -= bottleDeltaY + deltaY * 2;
  }

  shrink() {
    this.status = 'shrink';
    this.gatherParticles();
  }

  _jump(tickTime) {
    const t = tickTime / 1000;
    const translateH = this.velocity.vx * t
    const translateY = this.velocity.vy * t - 0.5 * gameConf.gravity * t * t - gameConf.gravity * this.flyingTime * t;
    this.obj.translateY(translateY)
    this.obj.translateOnAxis(this.axis, translateH)

    this.flyingTime = this.flyingTime + t;
  }

  jump(duration) {
    this.velocity.vx = Math.min(duration / 6, 400)
    this.velocity.vx = +this.velocity.vx.toFixed(2);
    this.velocity.vy = Math.min(150 + duration / 20, 400)
    this.velocity.vy = +this.velocity.vy.toFixed(2);
    this.status = 'jump'
    this.resetParticles();
  }

  stop() {
    this.scale = 1;
    this.status = 'stop';
    this.flyingTime = 0
    this.velocity = {
      vx: 0, // 水平方向速度
      vy: 0 //竖直方向速度
    }
  }

  rotate() {
    const scale = 1.4;
    this.human.rotation.x = this.human.rotation.z = 0;
    if (this.direction === 0) { // x
      customAnimation.to(0.14, this.human.rotation, { z: this.human.rotation.z - Math.PI })
      customAnimation.to(0.18, this.human.rotation, { z: this.human.rotation.z - 2 * Math.PI}, 'Linear', 0.14)

      customAnimation.to(0.1, this.head.position, { 
        y: this.head.position.y + 0.9 * scale,
        x: this.head.position.x + 0.45 * scale
      })
      customAnimation.to(0.1, this.head.position, { 
        y: this.head.position.y - 0.9 * scale,
        x: this.head.position.x - 0.45 * scale
      }, 'Linear', 0.1)
      customAnimation.to(0.15, this.head.position, { 
        y: 7.56,
        x: 0
      }, 'Linear', 0.25)

      customAnimation.to(0.1, this.body.scale, { 
        y: Math.max(scale, 1),
        x: Math.max(Math.min(1 / scale, 1), 0.7),
        z: Math.max(Math.min(1 / scale, 1), 0.7)
      })
      customAnimation.to(0.1, this.body.scale, { 
        y: Math.min(0.9 / scale, 0.7),
        x: Math.max(scale, 1.2),
        z: Math.max(scale, 1.2)
      }, 'Linear', 0.1)
      customAnimation.to(0.3, this.body.scale, { 
        y: 1,
        x: 1,
        z: 1
      }, 'Linear', 0.2)
    } else if (this.direction === 1) {
      customAnimation.to(0.14, this.human.rotation, { x: this.human.rotation.x - Math.PI })
      customAnimation.to(0.18, this.human.rotation, { x: this.human.rotation.x - 2 * Math.PI }, '', 0.14)

      customAnimation.to(0.1, this.head.position, { y: this.head.position.y + 0.9 * scale, z: this.head.position.z - 0.45 * scale })
      customAnimation.to(0.1, this.head.position, { z: this.head.position.z + 0.45 * scale, y: this.head.position.y - 0.9 * scale },  '', 0.1)
      customAnimation.to(0.15, this.head.position, { y: 7.56, z: 0 }, '', 0.25)

      customAnimation.to(0.05, this.body.scale, { y: Math.max(scale, 1), x: Math.max(Math.min(1 / scale, 1), 0.7), z: Math.max(Math.min(1 / scale, 1), 0.7) })
      customAnimation.to(0.05, this.body.scale, { y: Math.min(0.9 / scale, 0.7), x: Math.max(scale, 1.2), z: Math.max(scale, 1.2) }, '', 0.1)

      customAnimation.to(0.2, this.body.scale, { y: 1, x: 1, z: 1 }, '', 0.2)
    }
  }

  reset() {
    this.stop();
    this.obj.rotation.x = 0;
    this.obj.rotation.z = 0;
    this.obj.position.set(bottleConf.initPosition.x, bottleConf.initPosition.y + 30, 0);
  }

  forerake() { // 前倾
    this.status = 'forerake';
    setTimeout(_ => {
      if (this.direction === 0) {
        customAnimation.to(1, this.obj.rotation, {
          z: -Math.PI / 2
        })
      } else {
        customAnimation.to(1, this.obj.rotation, {
          x: -Math.PI / 2
        })
      }

      customAnimation.to(0.4, this.obj.position, {
        y: -blockConf.height / 2 + 1.2
      }, null, 250);

    }, 200)
  }

  hypsokinesis() { // 向后倒
    this.status = 'hypsokinesis';
    setTimeout(_ => {
      if (this.direction === 0) {
        customAnimation.to(0.8, this.obj.rotation, {
          z: Math.PI / 2
        })
      } else {
        customAnimation.to(1, this.obj.rotation, {
          x: Math.PI / 2
        })
      }

      setTimeout(() => {
        customAnimation.to(0.4, this.obj.position, {
          y: -blockConf.height / 2 + 1.2
        });
        customAnimation.to(0.2, this.head.position, {
          x: 1.125
        });
        customAnimation.to(0.2, this.head.position, {
          x: 0
        }, null, 0.2)
      }, 350)
    }, 200)
  }

  straight () {
    this.status = 'straight'
    setTimeout( () => {
      customAnimation.to(0.4, this.obj.position, {
        y: -blockConf.height / 2 + 1.2
      }, 'Linear')
    })
  }


}

export default new Bottle()