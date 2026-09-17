import { Scene } from 'phaser';

/** Loading screen stays up at least this long so the percentage is readable. */
const MIN_DISPLAY_MS = 1400;

export class PreloaderScene extends Scene {
  private startedAt = 0;

  constructor() {
    super('PreloaderScene');
  }

  preload() {
    const { width, height } = this.cameras.main;
    this.startedAt = this.time.now;

    this.add.rectangle(0, 0, width, height, 0x05070d).setOrigin(0, 0);

    const title = this.add
      .text(width / 2, height / 2 - 90, 'IEEE', {
        fontFamily: 'monospace',
        fontSize: '42px',
        color: '#38bdf8',
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(width / 2, height / 2 - 46, 'LOADING WORLD', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#94a3b8',
      })
      .setOrigin(0.5);

    const barX = width / 2 - 160;
    const barY = height / 2;
    const box = this.add.graphics();
    box.fillStyle(0x0f172a, 1).fillRect(barX, barY, 320, 26);
    box.lineStyle(2, 0x1e293b, 1).strokeRect(barX, barY, 320, 26);

    const bar = this.add.graphics();

    const percent = this.add
      .text(width / 2, barY + 52, '0%', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      percent.setText(`${Math.floor(value * 100)}%`);
      bar.clear();
      bar.fillStyle(0x38bdf8, 1).fillRect(barX + 3, barY + 3, 314 * value, 20);
    });

    this.load.on('complete', () => {
      percent.setText('100%');
      // Assets cache fast on repeat visits; hold the bar so 0→100 is legible.
      const elapsed = this.time.now - this.startedAt;
      this.time.delayedCall(Math.max(0, MIN_DISPLAY_MS - elapsed), () => {
        [title, subtitle, box, bar, percent].forEach((o) => o.destroy());
        this.scene.start('MainScene');
      });
    });

    this.load.image('background', '/background.png');
    this.load.image('interior_bg', '/gym_interior.png');
    this.load.spritesheet('trainer', '/trainer.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
  }
}
