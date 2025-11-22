import Phaser from 'phaser'
import readingContent from '../content/reading_passages.json'
import { InputManager, InputAction } from '../core/input'
import { setProgress } from '../core/storage'
import { createPillButton } from '../core/ui'
import { SceneKeys } from './SceneKeys'

interface ReadingPassage {
  id: string
  title: string
  text: string
  question: string
  options: string[]
  answerIndex: number
}

const passages = readingContent.passages as ReadingPassage[]

export class ReadingChallengeScene extends Phaser.Scene {
  private passageIndex = 0

  private selectedOptionIndex = 0

  private isLocked = false

  private inputManager?: InputManager

  private questionText!: Phaser.GameObjects.Text

  private passageText!: Phaser.GameObjects.Text

  private optionTexts: Phaser.GameObjects.Text[] = []

  private optionBackgrounds: Phaser.GameObjects.Rectangle[] = []

  private feedbackText!: Phaser.GameObjects.Text

  private progressText!: Phaser.GameObjects.Text

  private score = 0

  private readonly moduleId = 'reading-challenge'

  constructor() {
    super(SceneKeys.Reading)
  }

  create(): void {
    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, width, height, 0xe7f5ff, 1)

    this.add
      .text(width / 2, 18, 'Reading Challenge', {
        fontFamily: 'Playfair Display, serif',
        fontSize: '28px',
        color: '#13406a',
      })
      .setOrigin(0.5, 0)

    this.progressText = this.add
      .text(width - 20, 20, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#13406a',
      })
      .setOrigin(1, 0)

    const passageBox = this.add.rectangle(width / 2, 120, width * 0.92, 140, 0xffffff, 1)
    passageBox.setStrokeStyle(2, 0x13406a, 0.2)

    this.passageText = this.add
      .text(width / 2 - width * 0.46 + 12, 50, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px',
        color: '#13406a',
        wordWrap: { width: width * 0.92 - 24 },
      })
      .setOrigin(0, 0)

    this.questionText = this.add
      .text(width / 2, 220, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '20px',
        color: '#0c2a42',
        align: 'center',
        wordWrap: { width: width * 0.82 },
      })
      .setOrigin(0.5)

    const startY = 280
    const spacing = 55
    for (let i = 0; i < 4; i += 1) {
      const bg = this.add
        .rectangle(width / 2, startY + spacing * i, width * 0.82, 48, 0xffffff, 1)
        .setStrokeStyle(2, 0x13406a, 0.2)
        .setInteractive({ useHandCursor: true })
      bg.on('pointerdown', () => this.selectOption(i))
      const text = this.add
        .text(width / 2, startY + spacing * i, '', {
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          color: '#0c2a42',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
      text.on('pointerdown', () => this.selectOption(i))
      this.optionBackgrounds.push(bg)
      this.optionTexts.push(text)
    }

    this.feedbackText = this.add
      .text(width / 2, height - 90, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#13406a',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5)

    const backButton = createPillButton(this, width / 2, height - 35, {
      text: 'Back to menu',
      width: 180,
      color: 0xffffff,
    })
    backButton.on('pointerdown', () => this.scene.start(SceneKeys.ModuleSelect))

    this.showPassage()

    this.inputManager = new InputManager(this)
    this.inputManager.on('action', this.handleAction, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.inputManager?.destroy())
  }

  private handleAction(action: InputAction): void {
    if (this.isLocked && action === 'confirm') {
      this.nextPassage()
      return
    }

    switch (action) {
      case 'up':
        this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.currentPassage().options.length) % this.currentPassage().options.length
        this.updateHighlight()
        break
      case 'down':
        this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.currentPassage().options.length
        this.updateHighlight()
        break
      case 'confirm':
        if (!this.isLocked) this.reveal()
        break
      case 'back':
        this.scene.start(SceneKeys.ModuleSelect)
        break
      default:
        break
    }
  }

  private selectOption(index: number): void {
    if (!this.optionBackgrounds[index].visible) return
    this.selectedOptionIndex = index
    this.updateHighlight()
    if (!this.isLocked) {
      this.reveal()
    }
  }

  private currentPassage(): ReadingPassage {
    return passages[this.passageIndex]
  }

  private showPassage(): void {
    const passage = this.currentPassage()
    this.progressText.setText(`Card ${this.passageIndex + 1}/${passages.length}`)
    this.passageText.setText(`${passage.title}\n${passage.text}`)
    this.questionText.setText(passage.question)
    passage.options.forEach((option, idx) => {
      this.optionTexts[idx].setText(option)
      this.optionBackgrounds[idx].setVisible(true)
    })
    for (let idx = passage.options.length; idx < this.optionTexts.length; idx += 1) {
      this.optionTexts[idx].setText('')
      this.optionBackgrounds[idx].setVisible(false)
    }
    this.feedbackText.setText('Use text evidence to support your answer.')
    this.selectedOptionIndex = 0
    this.isLocked = false
    this.updateHighlight()
  }

  private updateHighlight(): void {
    this.optionBackgrounds.forEach((bg, idx) => {
      if (!bg.visible) return
      const selected = idx === this.selectedOptionIndex
      bg.setFillStyle(selected ? 0xd6f0ff : 0xffffff, selected ? 1 : 0.95)
      bg.setStrokeStyle(2, selected ? 0x0f6ab4 : 0x13406a, selected ? 0.9 : 0.2)
      this.optionTexts[idx].setColor(selected ? '#0a335a' : '#0c2a42')
    })
  }

  private reveal(): void {
    const passage = this.currentPassage()
    const isCorrect = this.selectedOptionIndex === passage.answerIndex
    if (isCorrect) {
      this.score += 1
      this.feedbackText.setText('Reading check passed!')
    } else {
      this.feedbackText.setText(`Answer: ${passage.options[passage.answerIndex]}`)
    }
    this.isLocked = true
    this.optionBackgrounds.forEach((bg, idx) => {
      if (!bg.visible) return
      if (idx === passage.answerIndex) {
        bg.setFillStyle(0xc6f6d5, 1)
        this.optionTexts[idx].setColor('#0f5132')
      } else if (idx === this.selectedOptionIndex) {
        bg.setFillStyle(0xffd4d4, 1)
        this.optionTexts[idx].setColor('#842029')
      } else {
        bg.setFillStyle(0xffffff, 0.5)
        this.optionTexts[idx].setColor('#0c2a42')
      }
    })
  }

  private nextPassage(): void {
    this.passageIndex += 1
    if (this.passageIndex >= passages.length) {
      this.finish()
      return
    }
    this.optionTexts.forEach((text) => text.setColor('#0c2a42'))
    this.showPassage()
  }

  private finish(): void {
    const stars = Math.min(3, Math.round((this.score / passages.length) * 3))
    setProgress(this.moduleId, {
      stars,
      levelsCompleted: passages.length,
    })
    this.passageText.setText('Reading practice complete!')
    this.questionText.setText('Great job using clues from the passage.')
    this.feedbackText.setText(`Score: ${this.score}/${passages.length}. Press Enter to return.`)
    this.optionBackgrounds.forEach((bg) => bg.setVisible(false))
    this.optionTexts.forEach((text) => text.setVisible(false))
    this.progressText.setText('Finished')
    this.inputManager?.removeAllListeners()
    this.inputManager?.on('action', (action) => {
      if (action === 'confirm' || action === 'back') {
        this.scene.start(SceneKeys.ModuleSelect)
      }
    })
  }
}
