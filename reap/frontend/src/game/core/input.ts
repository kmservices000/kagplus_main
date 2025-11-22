import Phaser from 'phaser'

export type InputAction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back'

const keyMap: Array<[number, InputAction]> = [
  [Phaser.Input.Keyboard.KeyCodes.UP, 'up'],
  [Phaser.Input.Keyboard.KeyCodes.DOWN, 'down'],
  [Phaser.Input.Keyboard.KeyCodes.LEFT, 'left'],
  [Phaser.Input.Keyboard.KeyCodes.RIGHT, 'right'],
  [Phaser.Input.Keyboard.KeyCodes.ENTER, 'confirm'],
  [Phaser.Input.Keyboard.KeyCodes.SPACE, 'confirm'],
  [Phaser.Input.Keyboard.KeyCodes.ESC, 'back'],
  [Phaser.Input.Keyboard.KeyCodes.BACKSPACE, 'back'],
]

const padButtonMap: Record<number, InputAction> = {
  0: 'confirm', // A
  1: 'back', // B
  2: 'confirm',
  3: 'back',
  9: 'confirm', // start
  8: 'back', // select
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
}

export class InputManager extends Phaser.Events.EventEmitter {
  private keys: Phaser.Input.Keyboard.Key[] = []

  constructor(private scene: Phaser.Scene) {
    super()
    this.registerKeyboard()
    if (scene.input.gamepad) {
      scene.input.gamepad.on('down', this.handlePadDown, this)
    }
    scene.events.once(Phaser.Scenes.Events.DESTROY, this.destroy, this)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this)
  }

  private registerKeyboard(): void {
    if (!this.scene.input.keyboard) return
    keyMap.forEach(([keyCode, action]) => {
      const key = this.scene.input.keyboard!.addKey(keyCode)
      key.on('down', () => this.emitAction(action))
      this.keys.push(key)
    })
  }

  private handlePadDown(_: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button, value: number): void {
    if (value === 0) return
    const action = padButtonMap[button.index]
    if (action) {
      this.emitAction(action)
    }
  }

  private emitAction(action: InputAction): void {
    this.emit('action', action)
  }

  destroy(): void {
    this.keys.forEach((key) => {
      key?.destroy()
    })
    this.keys = []
    if (this.scene.input.gamepad) {
      this.scene.input.gamepad.off('down', this.handlePadDown, this)
    }
    this.removeAllListeners()
  }
}
