import Phaser from 'phaser'
import vocabContent from '../content/vocab_grade3.json'
import grammarContent from '../content/grammar_grade3.json'
import readingContent from '../content/reading_passages.json'
import { createRoundedCard, setCardSelected, createPillButton } from '../core/ui'
import { InputManager, InputAction } from '../core/input'
import { getProgress, getPlayerProfile } from '../core/storage'
import { SceneKeys } from './SceneKeys'

interface MenuItem {
  id: string
  title: string
  subtitle: string
  description: string
  accent: number
  scene: string
  totalLessons: number
}

interface ModuleSelectData {
  languageId?: string
}

const menuItems: MenuItem[] = [
  {
    id: vocabContent.moduleId,
    title: 'Vocabulary Adventure',
    subtitle: 'Parts of Speech',
    description: 'Nouns • Verbs • Adjectives • Adverbs',
    accent: 0xffbd8a,
    scene: SceneKeys.Vocabulary,
    totalLessons: vocabContent.questions.length,
  },
  {
    id: grammarContent.moduleId,
    title: 'Grammar Quest',
    subtitle: 'Sentences & Agreement',
    description: 'SVA • Verb tense • Pronouns',
    accent: 0xbdaaff,
    scene: SceneKeys.Grammar,
    totalLessons: grammarContent.questions.length,
  },
  {
    id: 'reading-challenge',
    title: 'Reading Challenge',
    subtitle: 'Short Passages',
    description: 'Context clues • Comprehension check',
    accent: 0x93d684,
    scene: SceneKeys.Reading,
    totalLessons: readingContent.passages.length,
  },
]

export class ModuleSelectScene extends Phaser.Scene {
  private cards: Phaser.GameObjects.Container[] = []

  private selectedIndex = 0

  private inputManager?: InputManager

  private languageId = 'english'

  constructor() {
    super(SceneKeys.ModuleSelect)
  }

  init(data: ModuleSelectData): void {
    if (data?.languageId) {
      this.languageId = data.languageId
    } else {
      this.languageId = getPlayerProfile()?.preferredLanguage ?? 'english'
    }
  }

  create(): void {
    const { width, height } = this.scale
    this.add
      .rectangle(width / 2, height / 2, width, height, 0xfef5ea, 1)
      .setStrokeStyle(2, 0xf4d7b4, 1)

    this.add
      .text(width / 2, 30, 'Choose what to practice', {
        fontFamily: 'Playfair Display, serif',
        fontSize: '28px',
        color: '#2b1600',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, 70, `Language preview: ${this.languageId}`, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        color: '#5f3b15',
      })
      .setOrigin(0.5)

    const spacing = 210
    const startX = width / 2 - spacing
    this.cards = menuItems.map((item, index) => {
      const progress = getProgress(item.id)
      const description = `${item.description}\n${progress.levelsCompleted}/${item.totalLessons} rounds • ★ ${progress.stars}`
      const card = createRoundedCard(this, startX + spacing * index, height / 2 + 30, {
        width: 180,
        height: 230,
        title: item.title,
        subtitle: item.subtitle,
        description,
        accent: item.accent,
      })
      card.setData('menu-item', item)
      card.on('pointerdown', () => this.launchItem(index))
      card.on('pointerover', () => this.setSelectedIndex(index))
      return card
    })

    this.setSelectedIndex(0)

    const settingsButton = createPillButton(this, width / 2, height - 40, {
      text: 'Profile & Settings',
      width: 220,
      color: 0xffffff,
    })
    settingsButton.on('pointerdown', () => this.scene.start(SceneKeys.Settings))

    this.inputManager = new InputManager(this)
    this.inputManager.on('action', this.handleAction, this)
  }

  private handleAction(action: InputAction): void {
    switch (action) {
      case 'left':
      case 'up':
        this.setSelectedIndex((this.selectedIndex - 1 + this.cards.length) % this.cards.length)
        break
      case 'right':
      case 'down':
        this.setSelectedIndex((this.selectedIndex + 1) % this.cards.length)
        break
      case 'confirm':
        this.launchItem(this.selectedIndex)
        break
      case 'back':
        this.scene.start(SceneKeys.Launcher)
        break
      default:
        break
    }
  }

  private setSelectedIndex(index: number): void {
    this.selectedIndex = index
    this.cards.forEach((card, idx) => setCardSelected(card, idx === index))
  }

  private launchItem(index: number): void {
    const item = this.cards[index].getData('menu-item') as MenuItem
    if (!item) return
    this.scene.start(item.scene, {
      moduleId: item.id,
      languageId: this.languageId,
    })
  }
}
