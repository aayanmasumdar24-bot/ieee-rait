import { Scene, Physics } from 'phaser';
import * as Phaser from 'phaser';
import { EventBus } from './EventBus';
import { HOUSES, type HouseId } from '../../data/houseContent';
import { VirtualInput } from './VirtualInput';

/** gym_interior.png is 1024x1024; the room is drawn 1:1. */
const ROOM = 1024;

/**
 * The tiled border in gym_interior.png leaves a wood floor of x 205-815,
 * y 345-830. These four bodies fence it in from outside.
 */
const WALLS = [
  { x: ROOM / 2, y: 175, w: ROOM, h: 350 },
  { x: 107, y: ROOM / 2, w: 215, h: ROOM },
  { x: 925, y: ROOM / 2, w: 240, h: ROOM },
  { x: ROOM / 2, y: 930, w: ROOM, h: 190 },
];

/** Furniture the player used to walk straight through. Measured off the art. */
const FURNITURE = [
  { x: 256, y: 400, w: 98, h: 120 }, // cabinet
  { x: 512, y: 408, w: 225, h: 115 }, // desk
  { x: 746, y: 400, w: 137, h: 120 }, // bookshelf (below the back wall)
  { x: 728, y: 668, w: 167, h: 135 }, // side table
  { x: 773, y: 795, w: 77, h: 100 }, // barrel
];

/** The open door on the left wall, and the spot the player lands on. */
const EXIT = { x: 250, y: 600, w: 100, h: 200 };
const ENTRY = { x: 320, y: 600 };

/**
 * Walking in with UP held would otherwise fire JustDown on the freshly created
 * key and pop an exhibit open the instant the room loads.
 */
const INPUT_SETTLE_MS = 350;

type ArcadePairCallback = Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;

export class InteriorScene extends Scene {
  player!: Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  blockers!: Physics.Arcade.StaticGroup;
  zones!: Physics.Arcade.StaticGroup;

  /** Which house's content this room is showing. */
  house: HouseId = 'join';
  /** Overworld door to spawn at on the way out. */
  door = 'gym';

  /** Zone the player is standing in this frame, set by the overlap callback. */
  private activeZone: string | null = null;
  private prompt!: Phaser.GameObjects.Text;
  private isLeaving = false;
  /** True while the React reader is open, so the room ignores input. */
  private isReading = false;
  private readyAt = 0;

  private onExhibitClosed = () => {
    this.isReading = false;
    this.readyAt = this.time.now + INPUT_SETTLE_MS;
  };

  constructor() {
    super('InteriorScene');
  }

  init(data: { house?: HouseId; door?: string }) {
    this.house = data.house ?? 'join';
    this.door = data.door ?? 'gym';
    this.activeZone = null;
    this.isLeaving = false;
    this.isReading = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, ROOM, ROOM);
    this.add.image(ROOM / 2, ROOM / 2, 'interior_bg').setDisplaySize(ROOM, ROOM).setDepth(0);

    // All three houses share one room texture. A wash in the house's accent
    // plus its name over the door is enough to tell them apart on sight.
    const house = HOUSES[this.house];
    const accent = Phaser.Display.Color.HexStringToColor(house.signColor).color;
    this.add.rectangle(ROOM / 2, ROOM / 2, ROOM, ROOM, accent, 0.14).setDepth(1);
    this.add
      .text(ROOM / 2, 262, house.sign, {
        fontFamily: 'monospace',
        fontStyle: 'bold',
        fontSize: '30px',
        color: house.signColor,
        backgroundColor: '#0b1220cc',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.blockers = this.physics.add.staticGroup();
    for (const w of [...WALLS, ...FURNITURE]) {
      const wall = this.blockers.create(w.x, w.y, undefined) as Physics.Arcade.Sprite;
      wall.setSize(w.w, w.h).setVisible(false);
    }

    this.zones = this.physics.add.staticGroup();
    this.addZone(EXIT.x, EXIT.y, EXIT.w, EXIT.h, 'exit');

    // One interact zone per exhibit. The zone is the floor you stand on; the
    // caption goes on the furniture above it, clear of the walking lane.
    for (const exhibit of HOUSES[this.house].exhibits) {
      this.addZone(exhibit.x, exhibit.y, exhibit.w, exhibit.h, exhibit.id);
      this.add
        .text(exhibit.x, exhibit.labelY, exhibit.label, {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#f8fafc',
          backgroundColor: '#0b1220cc',
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(6);
    }

    this.player = this.physics.add.sprite(ENTRY.x, ENTRY.y, 'trainer');
    this.player.setScale(0.5).setDepth(5);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(80, 80);
    this.player.setOffset(88, 120);
    this.player.setFrame(4);

    this.physics.add.collider(this.player, this.blockers);
    this.physics.add.overlap(
      this.player,
      this.zones,
      this.handleZoneOverlap as ArcadePairCallback,
      undefined,
      this
    );

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setBounds(0, 0, ROOM, ROOM);
    this.applyCoverZoom();
    this.scale.on('resize', this.applyCoverZoom, this);

    this.prompt = this.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#0b1220',
        backgroundColor: '#f8fafc',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5, 1)
      .setDepth(6)
      .setVisible(false);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      }) as InteriorScene['wasd'];
    }

    this.readyAt = this.time.now + INPUT_SETTLE_MS;
    EventBus.on('exhibit-closed', this.onExhibitClosed);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.removeListener('exhibit-closed', this.onExhibitClosed);
      this.scale.off('resize', this.applyCoverZoom, this);
    });

    EventBus.emit('enter-house', this.house);
    EventBus.emit('current-scene-ready', this);
  }

  /**
   * ROOM is square, the viewport rarely is. Zooming by the larger of the two
   * ratios fills the canvas; at 1.2 flat, a wide window shows a black band
   * where the camera bounds run out.
   */
  private applyCoverZoom() {
    const { width, height } = this.scale.gameSize;
    this.cameras.main.setZoom(Math.max(width / ROOM, height / ROOM, 1.2));
  }

  private addZone(x: number, y: number, w: number, h: number, name: string) {
    const zone = this.zones.create(x, y, undefined) as Physics.Arcade.Sprite;
    zone.setSize(w, h).setVisible(false);
    zone.name = name;
    return zone;
  }

  handleZoneOverlap(_player: Physics.Arcade.Sprite, zone: Physics.Arcade.Sprite) {
    this.activeZone = zone.name;
  }

  private leave() {
    if (this.isLeaving) return;
    this.isLeaving = true;
    EventBus.emit('close-menu');
    this.scene.start('MainScene', { spawnAt: this.door });
  }

  update() {
    if (!this.player) return;

    // Reader open: freeze, or the player walks on behind the dialog.
    if (this.isReading) {
      this.player.setVelocity(0);
      this.player.anims.stop();
      this.prompt.setVisible(false);
      this.activeZone = null;
      return;
    }

    const upDown = (this.cursors && this.cursors.up.isDown) || (this.wasd && this.wasd.W.isDown) || VirtualInput.up;
    const downDown = (this.cursors && this.cursors.down.isDown) || (this.wasd && this.wasd.S.isDown) || VirtualInput.down;
    const leftDown = (this.cursors && this.cursors.left.isDown) || (this.wasd && this.wasd.A.isDown) || VirtualInput.left;
    const rightDown = (this.cursors && this.cursors.right.isDown) || (this.wasd && this.wasd.D.isDown) || VirtualInput.right;

    const actionTriggered = VirtualInput.consumeAction();
    const interact =
      this.time.now >= this.readyAt &&
      ((this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.space)) ||
        (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
        (this.wasd && Phaser.Input.Keyboard.JustDown(this.wasd.W)) ||
        actionTriggered);

    if (this.activeZone === 'exit') {
      this.showPrompt('LEFT or TAP A to step outside');
      if (leftDown || actionTriggered) {
        this.leave();
        return;
      }
    } else if (this.activeZone) {
      this.showPrompt('UP, SPACE or TAP A to read');
      if (interact) {
        this.isReading = true;
        EventBus.emit('open-exhibit', { house: this.house, exhibit: this.activeZone });
      }
    } else {
      this.prompt.setVisible(false);
    }

    const speed = 250;
    this.player.setVelocity(0);
    let moving = false;

    if (leftDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('walk-left', true);
      moving = true;
    } else if (rightDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('walk-right', true);
      moving = true;
    }

    if (upDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('walk-up', true);
      moving = true;
    } else if (downDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('walk-down', true);
      moving = true;
    }

    if (!moving) {
      this.player.anims.stop();
      const current = this.player.anims.currentAnim;
      if (current) this.player.setFrame(current.frames[0].frame.name);
    }

    // Physics refills this next frame; clearing here makes "left the zone" work.
    this.activeZone = null;
  }

  private showPrompt(text: string) {
    this.prompt
      .setText(text)
      .setPosition(this.player.x, this.player.y - 60)
      .setVisible(true);
  }
}
