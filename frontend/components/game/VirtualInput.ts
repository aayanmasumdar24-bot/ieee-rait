/**
 * Shared input state bridging touch/pointer controls in React
 * to Phaser's update loop across scenes.
 */

export interface VirtualInputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  actionJustPressed: boolean;
  hop: boolean;
  hopJustPressed: boolean;
}

class VirtualInputManager implements VirtualInputState {
  up = false;
  down = false;
  left = false;
  right = false;
  action = false;
  actionJustPressed = false;
  hop = false;
  hopJustPressed = false;

  setKey(key: 'up' | 'down' | 'left' | 'right', pressed: boolean) {
    this[key] = pressed;
  }

  pressAction() {
    this.action = true;
    this.actionJustPressed = true;
  }

  releaseAction() {
    this.action = false;
  }

  pressHop() {
    this.hop = true;
    this.hopJustPressed = true;
  }

  releaseHop() {
    this.hop = false;
  }

  consumeAction(): boolean {
    const val = this.actionJustPressed;
    this.actionJustPressed = false;
    return val;
  }

  consumeHop(): boolean {
    const val = this.hopJustPressed;
    this.hopJustPressed = false;
    return val;
  }

  reset() {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.action = false;
    this.actionJustPressed = false;
    this.hop = false;
    this.hopJustPressed = false;
  }
}

export const VirtualInput = new VirtualInputManager();
