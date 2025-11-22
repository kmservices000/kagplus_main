import Phaser from 'phaser'
import grammarContent from '../content/grammar_grade3.json'
import readingContent from '../content/reading_passages.json'
import { InputManager, InputAction } from '../core/input'
import { setProgress } from '../core/storage'
import { createPillButton } from '../core/ui'
import { SceneKeys } from './SceneKeys'

interface GrammarSceneData {
  moduleId?: string
}

interface GrammarQuestion {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  hint: string
  passageId?: string
}

interface ReadingPassage {
  id: string
  title: string
  text: string
  question: string
  options: string[]
  answerIndex: number
}

const passages = readingContent.passages as ReadingPassage[]

const findPassage = (id?: string): ReadingPassage | undefined => passages.find((item) => item.id === id)

export class GameGrammarScene extends Phaser.Scene {
  private questionIndex = 0

  private selectedOptionIndex = 0

  private isLocked = false

  private questionText!: Phaser.GameObjects.Text

  private contextText!: Phaser.GameObjects.Text

  private optionTexts: Phaser.GameObjects.Text[] = []

  private optionBackgrounds: Phaser.GameObjects.Rectangle[] = []

  private progressText!: Phaser.GameObjects.Text

  private feedbackText!: Phaser.GameObjects.Text

  private score = 0

  private moduleId = grammarContent.moduleId

  private inputManager?: InputManager

  private questions: GrammarQuestion[] = grammarContent.questions as GrammarQuestion[]

  constructor() {
    super(SceneKeys.Grammar)
  }

  init(data: GrammarSceneData): void {
    if (data?.moduleId) {
      this.moduleId = data.moduleId
    }
  }

  create(): void {
    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, width, height, 0xf3ecff, 1)

    this.add
      .text(width / 2, 18, grammarContent.title, {
        fontFamily: 'Playfair Display, serif',
        fontSize: '28px',
        color: '#35175a',
      })
      .setOrigin(0.5, 0)

    this.progressText = this.add
      .text(width - 18, 18, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#4d2c88',
      })
      .setOrigin(1, 0)

    const passageBox = this.add.rectangle(width / 2, 120, width * 0.9, 120, 0xffffff, 0.9)
    passageBox.setStrokeStyle(2, 0x4d2c88, 0.3)

    this.contextText = this.add
      .text(width / 2 - width * 0.45 + 12, 60, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#4a3c6a',
        wordWrap: { width: width * 0.9 - 24 },
      })
      .setOrigin(0, 0)

    this.questionText = this.add
      .text(width / 2, 210, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '22px',
        color: '#2b1600',
        align: 'center',
        wordWrap: { width: width * 0.85 },
      })
      .setOrigin(0.5)

    const startY = 270
    const spacing = 55
    for (let i = 0; i < 4; i += 1) {
      const bg = this.add
        .rectangle(width / 2, startY + spacing * i, width * 0.82, 48, 0xffffff, 1)
        .setStrokeStyle(2, 0x35175a, 0.2)
        .setInteractive({ useHandCursor: true })
      bg.on('pointerdown', () => this.selectOption(i))
      const text = this.add
        .text(width / 2, startY + spacing * i, '', {
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          color: '#2b1600',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
      text.on('pointerdown', () => this.selectOption(i))
      this.optionBackgrounds.push(bg)
      this.optionTexts.push(text)
    }

    this.feedbackText = this.add
      .text(width / 2, height - 90, grammarContent.description, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#4a3c6a',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5)

    const backButton = createPillButton(this, width / 2, height - 35, {
      text: 'Back to menu',
      width: 190,
      color: 0xffffff,
    })
    backButton.on('pointerdown', () => this.scene.start(SceneKeys.ModuleSelect))

    this.showQuestion()

    this.inputManager = new InputManager(this)
    this.inputManager.on('action', this.handleAction, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.inputManager?.destroy())
  }

  private handleAction(action: InputAction): void {
    if (this.isLocked && action === 'confirm') {
      this.nextQuestion()
      return
    }

    switch (action) {
      case 'up':
        this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.currentQuestion().options.length) % this.currentQuestion().options.length
        this.updateOptionHighlights()
        break
      case 'down':
        this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.currentQuestion().options.length
        this.updateOptionHighlights()
        break
      case 'confirm':
        if (!this.isLocked) {
          this.reveal()
        }
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
    this.updateOptionHighlights()
    if (!this.isLocked) {
      this.reveal()
    }
  }

  private currentQuestion(): GrammarQuestion {
    return this.questions[this.questionIndex]
  }

  private showQuestion(): void {
    const question = this.currentQuestion()
    this.progressText.setText(`Item ${this.questionIndex + 1}/${this.questions.length}`)
    this.questionText.setText(question.prompt)
    const passage = findPassage(question.passageId)
    if (passage) {
      this.contextText.setText(`${passage.title}\n${passage.text}`)
    } else {
      this.contextText.setText('Use your grammar clues!')
    }
    question.options.forEach((option, idx) => {
      this.optionTexts[idx].setText(option)
      this.optionBackgrounds[idx].setVisible(true)
    })
    for (let idx = question.options.length; idx < this.optionTexts.length; idx += 1) {
      this.optionTexts[idx].setText('')
      this.optionBackgrounds[idx].setVisible(false)
    }
    this.feedbackText.setText(question.hint)
    this.selectedOptionIndex = 0
    this.isLocked = false
    this.updateOptionHighlights()
  }

  private updateOptionHighlights(): void {
    this.optionBackgrounds.forEach((bg, idx) => {
      if (!bg.visible) return
      const selected = idx === this.selectedOptionIndex
      bg.setFillStyle(selected ? 0xe1d4ff : 0xffffff, selected ? 1 : 0.95)
      bg.setStrokeStyle(2, selected ? 0x7c4dff : 0x35175a, selected ? 0.9 : 0.2)
      this.optionTexts[idx].setColor(selected ? '#251041' : '#2b1600')
    })
  }

  private reveal(): void {
    const question = this.currentQuestion()
    const isCorrect = this.selectedOptionIndex === question.answerIndex
    if (isCorrect) {
      this.score += 1
      this.feedbackText.setText('Correct! Keep the pattern going.')
    } else {
      this.feedbackText.setText(`Answer: ${question.options[question.answerIndex]}`)
    }
    this.isLocked = true
    this.optionBackgrounds.forEach((bg, idx) => {
      if (!bg.visible) return
      if (idx === question.answerIndex) {
        bg.setFillStyle(0xc6f6d5, 1)
        this.optionTexts[idx].setColor('#0f5132')
      } else if (idx === this.selectedOptionIndex) {
        bg.setFillStyle(0xffd4d4, 1)
        this.optionTexts[idx].setColor('#842029')
      } else {
        bg.setFillStyle(0xffffff, 0.4)
        this.optionTexts[idx].setColor('#2b1600')
      }
    })
  }

  private nextQuestion(): void {
    this.questionIndex += 1
    if (this.questionIndex >= this.questions.length) {
      this.finish()
      return
    }
    this.optionTexts.forEach((text) => text.setColor('#2b1600'))
    this.showQuestion()
  }

  private finish(): void {
    const stars = Math.min(3, Math.round((this.score / this.questions.length) * 3))
    setProgress(this.moduleId, {
      stars,
      levelsCompleted: this.questions.length,
    })
    this.questionText.setText('Grammar Quest complete!')
    this.contextText.setText('Nice work conquering tenses and agreement!')
    this.feedbackText.setText(`Score: ${this.score}/${this.questions.length}. Press Enter to return.`)
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
