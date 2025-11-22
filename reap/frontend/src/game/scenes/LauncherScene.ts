import Phaser from 'phaser'
import { learnerLanguages } from '../../data/languages'
import { createPillButton, setPillActive } from '../core/ui'
import { InputManager, InputAction } from '../core/input'
import { getPlayerProfile, PlayerProfile, setPlayerProfile } from '../core/storage'
import { SceneKeys } from './SceneKeys'

export class LauncherScene extends Phaser.Scene {
  private languagePills: Phaser.GameObjects.Container[] = []

  private selectedLanguageIndex = 0

  private languageText!: Phaser.GameObjects.Text

  private inputManager?: InputManager

  private profile: PlayerProfile | null = null

  constructor() {
    super(SceneKeys.Launcher)
  }

  preload(): void {
    this.load.image('launcher-bg', '/reap_background.png')
  }

  create(): void {
    const { width, height } = this.scale
    const background = this.add.image(width / 2, height / 2, 'launcher-bg')
    background.setDisplaySize(width, height)
    background.setAlpha(0.9)

    this.add
      .rectangle(width / 2, height / 2, width * 0.9, height * 0.9, 0x000000, 0.15)
      .setStrokeStyle(2, 0xffffff, 0.2)

    this.profile = getPlayerProfile()

    this.add
      .text(width / 2, 30, 'Remote Education: Access & Progress', {
        fontFamily: 'Inter, sans-serif',
        color: '#fff',
        fontSize: '16px',
        letterSpacing: 3,
      })
      .setOrigin(0.5, 0)

    this.add
      .text(width / 2, 60, 'Welcome back,', {
        fontFamily: 'Playfair Display, serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)

    this.add
      .text(width / 2, 102, this.profile?.name ?? 'Learner', {
        fontFamily: 'Playfair Display, serif',
        fontSize: '48px',
        color: '#ff9b3e',
      })
      .setOrigin(0.5, 0)

    this.add
      .text(width / 2, 160, 'Ready to study and play?', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '18px',
        color: '#fff',
      })
      .setOrigin(0.5)

    this.buildLanguageSelector()
    this.buildLoginButtons()

    this.inputManager = new InputManager(this)
    this.inputManager.on('action', this.handleAction, this)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.inputManager?.destroy()
    })
  }

  private buildLanguageSelector(): void {
    const { width } = this.scale
    const label = this.add.text(width / 2, 210, 'Choose a language', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#fff',
      letterSpacing: 3,
    })
    label.setOrigin(0.5)

    const startX = width / 2 - 180
    const startY = 250
    this.languagePills = learnerLanguages.map((lang, index) => {
      const pill = createPillButton(this, startX + index * 90, startY, {
        text: lang.label,
        width: 110,
      })
      pill.on('pointerdown', () => this.selectLanguage(index))
      return pill
    })

    this.languageText = this.add.text(width / 2, startY + 60, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#fff',
    })
    this.languageText.setOrigin(0.5)

    const storedLanguageId = this.profile?.preferredLanguage
    const storedIndex = storedLanguageId
      ? learnerLanguages.findIndex((lang) => lang.id === storedLanguageId)
      : 0
    this.selectedLanguageIndex = storedIndex >= 0 ? storedIndex : 0
    this.updateLanguageState()
  }

  private buildLoginButtons(): void {
    const { width, height } = this.scale
    const teacher = createPillButton(this, width / 2 - 90, height - 80, {
      text: 'Teacher Login',
      width: 160,
      color: 0xffffff,
    })
    teacher.on('pointerdown', () => this.showToast('Teacher dashboard syncs once online.'))

    const student = createPillButton(this, width / 2 + 90, height - 80, {
      text: 'Student Login',
      width: 160,
      color: 0xff7d18,
    })
    student.on('pointerdown', () => {
      this.scene.start(SceneKeys.ModuleSelect, {
        languageId: learnerLanguages[this.selectedLanguageIndex].id,
      })
    })
  }

  private selectLanguage(index: number): void {
    this.selectedLanguageIndex = index
    this.updateLanguageState()
  }

  private updateLanguageState(): void {
    this.languagePills.forEach((pill, index) => setPillActive(pill, index === this.selectedLanguageIndex))
    const selected = learnerLanguages[this.selectedLanguageIndex]
    this.languageText.setText(`Currently previewing: ${selected.label}`)
    const profile: PlayerProfile = {
      name: this.profile?.name ?? 'Kayla',
      grade: this.profile?.grade ?? '6',
      section: this.profile?.section ?? 'A',
      preferredLanguage: selected.id,
    }
    setPlayerProfile(profile)
    this.profile = profile
  }

  private handleAction(action: InputAction): void {
    switch (action) {
      case 'left':
      case 'up':
        this.rollLanguage(-1)
        break
      case 'right':
      case 'down':
        this.rollLanguage(1)
        break
      case 'confirm':
        this.scene.start(SceneKeys.ModuleSelect, {
          languageId: learnerLanguages[this.selectedLanguageIndex].id,
        })
        break
      case 'back':
        this.showToast('Use Teacher Login or Student Login to continue.')
        break
      default:
        break
    }
  }

  private rollLanguage(delta: number): void {
    const total = this.languagePills.length
    this.selectedLanguageIndex = (this.selectedLanguageIndex + delta + total) % total
    this.updateLanguageState()
  }

  private showToast(message: string): void {
    const toast = this.add.text(this.scale.width / 2, this.scale.height - 30, message, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 12, y: 6 },
    })
    toast.setOrigin(0.5)
    this.time.delayedCall(2000, () => toast.destroy())
  }
}
