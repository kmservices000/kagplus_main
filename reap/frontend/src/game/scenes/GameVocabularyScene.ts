import Phaser from 'phaser'
import vocabContent from '../content/vocab_grade3.json'
import { InputManager, InputAction } from '../core/input'
import { setProgress } from '../core/storage'
import { createPillButton } from '../core/ui'
import { SceneKeys } from './SceneKeys'

interface VocabularySceneData {
  moduleId?: string
  languageId?: string
}

interface QuestionItem {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  concept: string
  context: string
}

export class GameVocabularyScene extends Phaser.Scene {
  private questionIndex = 0

  private selectedOptionIndex = 0

  private optionContainers: Phaser.GameObjects.Container[] = []

  private questionText!: Phaser.GameObjects.Text

  private progressText!: Phaser.GameObjects.Text

  private feedbackText!: Phaser.GameObjects.Text

  private isLocked = false

  private score = 0

  private moduleId = vocabContent.moduleId

  private inputManager?: InputManager

  private questions: QuestionItem[] = vocabContent.questions as QuestionItem[]

  constructor() {
    super(SceneKeys.Vocabulary)
  }

  init(data: VocabularySceneData): void {
    if (data?.moduleId) {
      this.moduleId = data.moduleId
    }
  }

  create(): void {
    const { width } = this.scale
    this.add.rectangle(width / 2, this.scale.height / 2, width, this.scale.height, 0xfdf4e8, 1)

    this.add
      .text(width / 2, 20, vocabContent.title, {
        fontFamily: 'Playfair Display, serif',
        fontSize: '28px',
        color: '#2b1600',
      })
      .setOrigin(0.5)

    this.progressText = this.add
      .text(width - 20, 20, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#5f3b15',
      })
      .setOrigin(1, 0)

    this.questionText = this.add
      .text(width / 2, 90, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '22px',
        color: '#2b1600',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5)

    this.feedbackText = this.add
      .text(width / 2, 150, '', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#5f3b15',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5)

    this.buildOptionCards()
    this.showQuestion()

    const backButton = createPillButton(this, width / 2, this.scale.height - 30, {
      text: 'Back to menu',
      width: 180,
      color: 0xffffff,
    })
    backButton.on('pointerdown', () => this.scene.start(SceneKeys.ModuleSelect))

    this.inputManager = new InputManager(this)
    this.inputManager.on('action', this.handleAction, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.inputManager?.destroy())
  }

  private buildOptionCards(): void {
    const { width } = this.scale
    const startY = 220
    const spacing = 60
    const maxOptions = Math.max(...this.questions.map((q) => q.options.length))
    this.optionContainers = Array.from({ length: maxOptions }).map((_, index) => {
      const container = this.add.container(width / 2, startY + spacing * index)
      const background = this.add
        .rectangle(0, 0, width * 0.82, 50, 0xffffff, 0.95)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0x2b1600, 0.3)
        .setName('option-bg')
      const label = this.add
        .text(0, 0, '', {
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          color: '#2b1600',
        })
        .setOrigin(0.5)
        .setName('option-label')
      container.add([background, label])
      container.setData('index', index)
      container.setSize(width * 0.82, 50)
      container.setInteractive(new Phaser.Geom.Rectangle(-width * 0.82 * 0.5, -25, width * 0.82, 50), Phaser.Geom.Rectangle.Contains)
      container.on('pointerdown', () => {
        this.selectedOptionIndex = index
        this.updateOptionState()
        if (!this.isLocked) {
          this.revealAnswer()
        }
      })
      container.on('pointerover', () => {
        if (!this.isLocked) {
          this.selectedOptionIndex = index
          this.updateOptionState()
        }
      })
      return container
    })
  }

  private handleAction(action: InputAction): void {
    if (this.isLocked && action === 'confirm') {
      this.nextQuestion()
      return
    }

    switch (action) {
      case 'up':
        this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.currentQuestion().options.length) % this.currentQuestion().options.length
        this.updateOptionState()
        break
      case 'down':
        this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.currentQuestion().options.length
        this.updateOptionState()
        break
      case 'confirm':
        if (!this.isLocked) {
          this.revealAnswer()
        }
        break
      case 'back':
        this.scene.start(SceneKeys.ModuleSelect)
        break
      default:
        break
    }
  }

  private currentQuestion(): QuestionItem {
    return this.questions[this.questionIndex]
  }

  private showQuestion(): void {
    const question = this.currentQuestion()
    this.questionText.setText(question.prompt)
    this.progressText.setText(`Item ${this.questionIndex + 1}/${this.questions.length}`)
    this.feedbackText.setText(question.context)
    this.selectedOptionIndex = 0
    this.isLocked = false
    this.optionContainers.forEach((container, index) => {
      const bg = container.getByName('option-bg') as Phaser.GameObjects.Rectangle
      const label = container.getByName('option-label') as Phaser.GameObjects.Text
      if (index < question.options.length) {
        label.setText(question.options[index])
        bg.setVisible(true)
        label.setVisible(true)
      } else {
        bg.setVisible(false)
        label.setVisible(false)
      }
    })
    this.updateOptionState()
  }

  private updateOptionState(): void {
    this.optionContainers.forEach((container, index) => {
      const bg = container.getByName('option-bg') as Phaser.GameObjects.Rectangle
      if (!bg.visible) return
      const isSelected = index === this.selectedOptionIndex
      bg.setFillStyle(isSelected ? 0xfff2d8 : 0xffffff, isSelected ? 1 : 0.9)
      bg.setStrokeStyle(2, isSelected ? 0xff7d18 : 0x2b1600, isSelected ? 0.9 : 0.3)
    })
  }

  private revealAnswer(): void {
    const question = this.currentQuestion()
    const isCorrect = this.selectedOptionIndex === question.answerIndex
    if (isCorrect) {
      this.score += 1
      this.feedbackText.setText(`Great! ${question.concept}`)
    } else {
      const correctText = question.options[question.answerIndex]
      this.feedbackText.setText(`Oops! ${question.concept}\nAnswer: ${correctText}`)
    }
    this.isLocked = true
    this.optionContainers.forEach((container, index) => {
      const bg = container.getByName('option-bg') as Phaser.GameObjects.Rectangle
      const label = container.getByName('option-label') as Phaser.GameObjects.Text
      if (!bg.visible) return
      if (index === question.answerIndex) {
        bg.setFillStyle(0xc6f6d5, 1)
        label.setColor('#0f5132')
      } else if (index === this.selectedOptionIndex) {
        bg.setFillStyle(0xffd4d4, 1)
        label.setColor('#842029')
      } else {
        bg.setFillStyle(0xffffff, 0.8)
        label.setColor('#2b1600')
      }
    })
  }

  private nextQuestion(): void {
    if (!this.isLocked) return
    this.optionContainers.forEach((container) => {
      const label = container.getByName('option-label') as Phaser.GameObjects.Text
      label.setColor('#2b1600')
    })
    this.questionIndex += 1
    if (this.questionIndex >= this.questions.length) {
      this.endGame()
    } else {
      this.showQuestion()
    }
  }

  private endGame(): void {
    const stars = Math.min(3, Math.round((this.score / this.questions.length) * 3))
    setProgress(this.moduleId, {
      stars,
      levelsCompleted: this.questions.length,
    })
    this.questionText.setText('Vocabulary adventure complete!')
    this.feedbackText.setText(`You answered ${this.score} of ${this.questions.length} items correctly. Press Enter to return.`)
    this.progressText.setText('Finished')
    this.isLocked = false
    this.inputManager?.removeAllListeners()
    this.inputManager?.on('action', (action) => {
      if (action === 'confirm' || action === 'back') {
        this.scene.start(SceneKeys.ModuleSelect)
      }
    })
  }
}
