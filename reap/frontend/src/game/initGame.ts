import Phaser from 'phaser'
import { createGameConfig } from './config'

let activeGame: Phaser.Game | null = null

/**
 * Bootstraps the Phaser game inside the React-controlled container.
 */
export const initGame = (container: HTMLElement): Phaser.Game => {
  if (activeGame) {
    activeGame.destroy(true)
    activeGame = null
  }
  const config = createGameConfig(container)
  activeGame = new Phaser.Game(config)
  return activeGame
}

export const destroyGame = (): void => {
  if (activeGame) {
    activeGame.destroy(true)
    activeGame = null
  }
}
