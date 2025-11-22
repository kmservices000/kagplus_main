import Phaser from 'phaser'
import { learnerLanguages } from '../../data/languages'
import { InputManager, InputAction } from '../core/input'
import { getPlayerProfile, PlayerProfile, setPlayerProfile } from '../core/storage'
import { SceneKeys } from './SceneKeys'

const gradeLevels = ['4', '5', '6', '7', '8']

export class SettingsScene extends Phaser.Scene {
  private profile: PlayerProfile = {
    name: 'Kayla',
    grade: '6',
    section: 'A',
    preferredLanguage: learnerLanguages[0].id,
  }

  private languageIndex = 0

  private gradeIndex = 2

  private languageText!: Phaser.GameObjects.Text

  private gradeText!: Phaser.GameObjects.Text

  private inputManager?: InputManager

  constructor() {
    super(SceneKeys.Settings)
  }

  create(): void {
    const storedProfile = getPlayerProfile()
    if (storedProfile) {
      this.profile = storedProfile
      const storedLanguageIndex = learnerLanguages.findIndex((lang) => lang.id === storedProfile.preferredLanguage)
      this.languageIndex = storedLanguageIndex >= 0 ? storedLanguageIndex : 0
      const storedGradeIndex = gradeLevels.findIndex((grade) => grade === storedProfile.grade)
      this.gradeIndex = storedGradeIndex >= 0 ? storedGradeIndex : 2
    }

    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, width, height, 0xfffbef, 1)

    this.add
      .text(width / 2, 30, 'Profile & Settings', {
        fontFamily: 'Playfair Display, serif',
        fontSize: '30px',
        color: '#2b1600',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 70, 'No internet needed — data saves locally on this device.', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#5f3b15',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2 - 150, 140, 'Student name', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#5f3b15',
      })
      .setOrigin(0, 0.5)

    this.add
      .text(width / 2 - 150, 180, this.profile.name, {
        fontFamily: 'Playfair Display, serif',
        fontSize: '32px',
        color: '#ff7d18',
      })
      .setOrigin(0, 0.5)

    this.add
      .text(width / 2 - 150, 240, 'Preferred language', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#5f3b15',
      })
      .setOrigin(0, 0.5)

    this.languageText = this.add
      .text(width / 2 - 150, 280, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '28px',
        color: '#2b1600',
      })
      .setOrigin(0, 0.5)

    this.add
      .text(width / 2 - 150, 340, 'Grade level', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#5f3b15',
      })
      .setOrigin(0, 0.5)

    this.gradeText = this.add
      .text(width / 2 - 150, 380, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '28px',
        color: '#2b1600',
      })
      .setOrigin(0, 0.5)

    this.updateLanguageDisplay()
    this.updateGradeDisplay()

    this.add
      .text(
        width / 2,
        height - 100,
        'Use ↑ ↓ to change language, ← → to switch grade.\nPress Enter to save & return.',
        {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          color: '#5f3b15',
          align: 'center',
        },
      )
      .setOrigin(0.5)

    this.inputManager = new InputManager(this)
    this.inputManager.on('action', this.handleAction, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.inputManager?.destroy())
  }

  private handleAction(action: InputAction): void {
    switch (action) {
      case 'up':
        this.languageIndex = (this.languageIndex - 1 + learnerLanguages.length) % learnerLanguages.length
        this.updateLanguageDisplay()
        break
      case 'down':
        this.languageIndex = (this.languageIndex + 1) % learnerLanguages.length
        this.updateLanguageDisplay()
        break
      case 'left':
        this.gradeIndex = (this.gradeIndex - 1 + gradeLevels.length) % gradeLevels.length
        this.updateGradeDisplay()
        break
      case 'right':
        this.gradeIndex = (this.gradeIndex + 1) % gradeLevels.length
        this.updateGradeDisplay()
        break
      case 'confirm':
      case 'back':
        this.persistProfile()
        this.scene.start(SceneKeys.ModuleSelect, {
          languageId: this.profile.preferredLanguage,
        })
        break
      default:
        break
    }
  }

  private updateLanguageDisplay(): void {
    const language = learnerLanguages[this.languageIndex]
    this.languageText.setText(language.label)
    this.profile = {
      ...this.profile,
      preferredLanguage: language.id,
    }
  }

  private updateGradeDisplay(): void {
    const grade = gradeLevels[this.gradeIndex]
    this.gradeText.setText(`Grade ${grade}`)
    this.profile = {
      ...this.profile,
      grade,
    }
  }

  private persistProfile(): void {
    setPlayerProfile(this.profile)
  }
}
