import Phaser from 'phaser'

type DisplayObject = Phaser.GameObjects.GameObject

export interface CardConfig {
  width: number
  height: number
  title: string
  subtitle?: string
  accent?: number
  description?: string
}

export interface PillButtonConfig {
  width?: number
  paddingX?: number
  color?: number
  text: string
}

const createText = (scene: Phaser.Scene, text: string, fontSize: number, color = '#2b1600') =>
  scene.add.text(0, 0, text, {
    fontFamily: 'Inter, sans-serif',
    fontSize: `${fontSize}px`,
    color,
    align: 'center',
    wordWrap: { width: 360 },
  })

export const createRoundedCard = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  config: CardConfig,
): Phaser.GameObjects.Container => {
  const accent = config.accent ?? 0xffd19b
  const background = scene.add
    .rectangle(0, 0, config.width, config.height, accent, 0.35)
    .setOrigin(0.5)
    .setStrokeStyle(2, 0x6c3e16, 0.4)
    .setName('card-bg')

  const title = createText(scene, config.title, 26).setOrigin(0.5, 0.5)
  title.setName('card-title')
  title.setY(-config.height * 0.18)

  const items: DisplayObject[] = [background, title]

  if (config.subtitle) {
    const subtitle = createText(scene, config.subtitle, 16, '#5f3b15').setOrigin(0.5)
    subtitle.setName('card-subtitle')
    subtitle.setY(-config.height * 0.02)
    items.push(subtitle)
  }

  if (config.description) {
    const body = createText(scene, config.description, 14, '#4b371f').setOrigin(0.5)
    body.setY(config.height * 0.22)
    body.setName('card-description')
    items.push(body)
  }

  const container = scene.add.container(x, y, items)
  container.setSize(config.width, config.height)
  container.setData('accent', accent)
  container.setInteractive(
    new Phaser.Geom.Rectangle(-config.width / 2, -config.height / 2, config.width, config.height),
    Phaser.Geom.Rectangle.Contains,
  )

  return container
}

export const setCardSelected = (container: Phaser.GameObjects.Container, isSelected: boolean): void => {
  const bg = container.getByName('card-bg') as Phaser.GameObjects.Rectangle | undefined
  if (!bg) return
  const accent = (container.getData('accent') as number) ?? 0xffd19b
  bg.setFillStyle(isSelected ? accent : accent, isSelected ? 0.65 : 0.25)
  bg.setStrokeStyle(isSelected ? 3 : 2, isSelected ? 0xff7d18 : 0x6c3e16, isSelected ? 0.9 : 0.4)
}

export const createPillButton = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  config: PillButtonConfig,
): Phaser.GameObjects.Container => {
  const width = config.width ?? 180
  const paddingX = config.paddingX ?? 20
  const color = config.color ?? 0xff7d18
  const background = scene.add
    .rectangle(0, 0, width, 42, color, 1)
    .setOrigin(0.5)
    .setStrokeStyle(2, 0x1f140a, 0.65)
  background.setName('pill-bg')
  const label = scene.add
    .text(0, 0, config.text, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#1f140a',
    })
    .setOrigin(0.5)

  const container = scene.add.container(x, y, [background, label])
  container.setSize(width, 42)
  container.setData('paddingX', paddingX)
  container.setInteractive(
    new Phaser.Geom.Rectangle(-width / 2, -21, width, 42),
    Phaser.Geom.Rectangle.Contains,
  )

  container.setData('accent', color)

  container.on('pointerover', () => {
    background.setFillStyle(color, 0.8)
  })

  container.on('pointerout', () => {
    background.setFillStyle(color, 1)
  })

  return container
}

export const setPillActive = (pill: Phaser.GameObjects.Container, active: boolean): void => {
  const bg = pill.getByName('pill-bg') as Phaser.GameObjects.Rectangle | undefined
  const accent = (pill.getData('accent') as number) ?? 0xff7d18
  if (!bg) return
  bg.setFillStyle(active ? accent : 0xffffff, active ? 1 : 0.35)
  bg.setStrokeStyle(2, active ? accent : 0x1f140a, 0.7)
}
