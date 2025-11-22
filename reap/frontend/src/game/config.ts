import Phaser from 'phaser'
import { LauncherScene } from './scenes/LauncherScene'
import { ModuleSelectScene } from './scenes/ModuleSelectScene'
import { GameVocabularyScene } from './scenes/GameVocabularyScene'
import { GameGrammarScene } from './scenes/GameGrammarScene'
import { ReadingChallengeScene } from './scenes/ReadingChallengeScene'
import { SettingsScene } from './scenes/SettingsScene'

export const GAME_WIDTH = 640
export const GAME_HEIGHT = 480

export const createGameConfig = (
  parent: HTMLElement,
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent,
  backgroundColor: '#fef9f1',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [
    LauncherScene,
    ModuleSelectScene,
    GameVocabularyScene,
    GameGrammarScene,
    ReadingChallengeScene,
    SettingsScene,
  ],
})
