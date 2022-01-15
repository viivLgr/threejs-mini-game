import GamePage from '../pages/game-page'
import GameOverPage from '../pages/game-over-page'
import StartPage from '../pages/start-page'

class GameView {
  constructor() {

  }

  initGamePage(callbacks) {
    this.gamePage = new GamePage(callbacks)
    this.gamePage.init();
  }

  initStartPage(callbacks) {
    this.startPage = new StartPage(callbacks)
    this.startPage.init({
      camera: this.gamePage.scene.camera.instance
    })
  }

  initGameOverPage(callbacks) {
    this.gameOverPage = new GameOverPage(callbacks)
    this.gameOverPage.init({
      scene: this.gamePage.scene.instance,
      camera: this.gamePage.scene.camera.instance,
    })
  }

  showGameOverPage() {
    this.gamePage.hide()
    this.gameOverPage.show()
  }

  showGamePage() {
    this.gameOverPage.hide()
    this.startPage.hide();
    this.gamePage.restart();
    this.gamePage.show()
  }

  restartGame() {
    this.gamePage.restart()
  }

}


// 单例工厂
export default new GameView()