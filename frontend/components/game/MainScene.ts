import { Scene, GameObjects, Physics } from 'phaser';
import * as Phaser from 'phaser';
import { EventBus } from './EventBus';
import { HOUSES, DOOR_TO_HOUSE } from '../../data/houseContent';
import { VirtualInput } from './VirtualInput';

/** background.png is 1536x1024; world bounds match it 1:1. */
const WORLD_W = 1536;
const WORLD_H = 1024;

/**
 * A 64x64 patch of background.png containing nothing but grass, found by
 * scanning the image. Stretched over the side houses in stage 1 so the center
 * house is the only building on the island.
 */
const GRASS_SRC = { x: 932, y: 536, size: 64 };

/**
 * Where the grass stops, per 64px column band, measured off background.png
 * with a water test (blue > red + 25) that ignores the wooden dock.
 *
 * The coastline is diagonal — y 576 at the left edge, y 750 in the middle,
 * y 569 at the right — so a single flat blocker along the bottom fences only
 * the middle and the player strolls into the sea at both ends.
 */
const SHORE_BAND = 64;
const SHORE = [
  576, 576, 580, 801, 819, 894, 897, 815,
  750, 748, 747, 745, 748, 749, 741, 734,
  735, 718, 692, 690, 669, 574, 573, 569,
];

/**
 * The hop. This world is top-down with no gravity, so a jump has no axis to
 * travel along — it is a lift of the drawn sprite only.
 *
 * Arcade physics writes a sprite's position back from its body every frame, so
 * a lift applied to the body-owning sprite is erased on the spot, and nudging
 * the body offset moves the body instead of the picture. Hence two objects:
 * `player` owns the body and is invisible, `avatar` is what you see and is what
 * gets lifted. Collisions keep working against the ground plane mid-air — you
 * cannot hop over a house, or out into the sea.
 */
const HOP_MS = 420;
const HOP_PEAK = 26;
/** Body offset, fixed. The hop never touches it. */
const BODY_OFFSET = { x: 78, y: 120 };

type HouseSpec = {
  /** Door zone name, also the key into DOOR_TO_HOUSE. */
  door: string;
  /** Rect covering the whole building, measured off background.png. */
  cover: { x: number; y: number; w: number; h: number } | null;
  /** Solid body over the building footprint. */
  body: { x: number; y: number; w: number; h: number };
  /** Walk-up-into-it trigger, sitting on the doorstep. */
  doorZone: { x: number; y: number; w: number; h: number };
  /** Sign anchor, above the roof. */
  sign: { x: number; y: number };
  /** Where the player reappears after leaving the interior. */
  spawn: { x: number; y: number };
};

const HOUSE_SPECS: HouseSpec[] = [
  {
    door: 'left_house',
    cover: { x: 130, y: 122, w: 275, h: 232 },
    body: { x: 266, y: 250, w: 250, h: 190 },
    doorZone: { x: 300, y: 366, w: 70, h: 44 },
    sign: { x: 266, y: 104 },
    spawn: { x: 300, y: 430 },
  },
  {
    door: 'gym',
    cover: null,
    body: { x: 768, y: 210, w: 388, h: 290 },
    doorZone: { x: 785, y: 372, w: 96, h: 44 },
    sign: { x: 768, y: 36 },
    spawn: { x: 785, y: 440 },
  },
  {
    door: 'right_house',
    cover: { x: 1078, y: 124, w: 335, h: 230 },
    body: { x: 1245, y: 252, w: 310, h: 186 },
    doorZone: { x: 1258, y: 366, w: 70, h: 44 },
    sign: { x: 1245, y: 106 },
    spawn: { x: 1258, y: 430 },
  },
];

type ArcadePairCallback = Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;

export class MainScene extends Scene {
  player!: Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  bg!: GameObjects.Image;
  /** Grass patches hiding the side houses while stage === 1. */
  houseCovers: GameObjects.TileSprite[] = [];
  /** Signs for the side houses, revealed with them. */
  hiddenSigns: GameObjects.Text[] = [];
  /** Bodies for the side houses, disabled while they are hidden. */
  hiddenBodies: Physics.Arcade.Sprite[] = [];
  blockers!: Physics.Arcade.StaticGroup;
  doorZones!: Physics.Arcade.StaticGroup;

  stage = 1;
  isTransitioning = false;
  spawnAt?: string;

  /** time.now the current hop started, or -1 when the trainer is on the ground. */
  private hopStart = -1;
  /** Ground marker under the trainer's feet — the only cue that a hop happened. */
  private shadow!: GameObjects.Ellipse;
  /** What you actually see. Carries the walk cycles and takes the hop's lift. */
  private avatar!: GameObjects.Sprite;

  private onSetStage = (newStage: number) => this.applyStage(newStage);

  constructor() {
    super('MainScene');
  }

  init(data: { spawnAt?: string }) {
    this.spawnAt = data.spawnAt;
    this.isTransitioning = false;
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setDepth(0);

    this.buildGrassTexture();

    this.blockers = this.physics.add.staticGroup();
    this.doorZones = this.physics.add.staticGroup();
    this.houseCovers = [];
    this.hiddenSigns = [];
    this.hiddenBodies = [];

    // Water ring: one body per column band so the diagonal coast is fenced.
    SHORE.forEach((landY, i) => {
      const h = WORLD_H - landY;
      this.addBody(i * SHORE_BAND + SHORE_BAND / 2, landY + h / 2, SHORE_BAND, h);
    });

    for (const spec of HOUSE_SPECS) {
      const body = this.addBody(spec.body.x, spec.body.y, spec.body.w, spec.body.h);

      const door = this.doorZones.create(
        spec.doorZone.x,
        spec.doorZone.y,
        undefined
      ) as Physics.Arcade.Sprite;
      door.setSize(spec.doorZone.w, spec.doorZone.h).setVisible(false);
      door.name = spec.door;

      const house = HOUSES[DOOR_TO_HOUSE[spec.door]];
      const sign = this.add
        .text(spec.sign.x, spec.sign.y, house.sign, {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: house.signColor,
          backgroundColor: '#0b1220cc',
          padding: { x: 10, y: 6 },
        })
        .setOrigin(0.5)
        .setDepth(4);

      if (spec.cover) {
        // tileSprite, not a stretched image: a 64px sample blown up to 275x232
        // reads as a pale rectangle. Tiling keeps the grass at native scale.
        const cover = this.add
          .tileSprite(spec.cover.x, spec.cover.y, spec.cover.w, spec.cover.h, 'grassPatch')
          .setOrigin(0, 0)
          .setDepth(1);
        this.houseCovers.push(cover);
        this.hiddenSigns.push(sign);
        this.hiddenBodies.push(body);
      }
    }

    const spawn =
      HOUSE_SPECS.find((s) => s.door === this.spawnAt)?.spawn ?? { x: 380, y: 750 };

    // Depth 4: over the ground, under the player at 5, so the trainer always
    // draws on top of their own shadow.
    this.shadow = this.add.ellipse(spawn.x, spawn.y, 30, 11, 0x000000, 0.35).setDepth(4);

    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'trainer');
    this.player.setScale(0.35).setDepth(5);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(100, 100);
    this.player.setOffset(BODY_OFFSET.x, BODY_OFFSET.y);
    this.hopStart = -1;

    // The body sprite is never drawn; the avatar is. See the HOP_MS comment for
    // why the picture cannot live on the object that owns the body.
    this.player.setVisible(false);
    this.avatar = this.add.sprite(spawn.x, spawn.y, 'trainer').setScale(0.35).setDepth(5);

    this.physics.add.collider(this.player, this.blockers);
    this.physics.add.overlap(
      this.player,
      this.doorZones,
      this.handleDoorOverlap as ArcadePairCallback,
      undefined,
      this
    );

    this.registerAnimations();

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      }) as MainScene['wasd'];
    }

    this.applyStage(this.stage);

    EventBus.on('set-stage', this.onSetStage);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.removeListener('set-stage', this.onSetStage);
    });

    EventBus.emit('current-scene-ready', this);
  }

  /** Copy the clean grass sample once, then reuse it for every cover. */  private buildGrassTexture() {
    if (this.textures.exists('grassPatch')) return;

    const source = this.textures.get('background').getSourceImage();
    const canvas = this.textures.createCanvas('grassPatch', GRASS_SRC.size, GRASS_SRC.size);
    if (!canvas || !source) return;

    canvas
      .getContext()
      .drawImage(
        source as CanvasImageSource,
        GRASS_SRC.x,
        GRASS_SRC.y,
        GRASS_SRC.size,
        GRASS_SRC.size,
        0,
        0,
        GRASS_SRC.size,
        GRASS_SRC.size
      );
    canvas.refresh();
  }

  private addBody(x: number, y: number, w: number, h: number) {
    const body = this.blockers.create(x, y, undefined) as Physics.Arcade.Sprite;
    body.setSize(w, h).setVisible(false);
    return body;
  }

  private applyStage(newStage: number) {
    this.stage = newStage;
    const townOpen = newStage >= 2;

    this.houseCovers.forEach((c) => c.setVisible(!townOpen));
    this.hiddenSigns.forEach((s) => s.setVisible(townOpen));
    this.hiddenBodies.forEach((b) => {
      if (b.body) b.body.enable = townOpen;
    });

    if (townOpen) this.isTransitioning = false;
  }

  private registerAnimations() {
    const rows: Array<[string, number]> = [
      ['walk-down', 0],
      ['walk-right', 4],
      ['walk-left', 8],
      ['walk-up', 12],
    ];

    for (const [key, start] of rows) {
      if (this.anims.exists(key)) continue;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers('trainer', { start, end: start + 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  handleDoorOverlap(_player: Physics.Arcade.Sprite, door: Physics.Arcade.Sprite) {
    if (this.isTransitioning) return;
    const upPressed = (this.cursors && this.cursors.up.isDown) || (this.wasd && this.wasd.W.isDown) || VirtualInput.up || VirtualInput.action;
    if (!upPressed) return;

    const houseId = DOOR_TO_HOUSE[door.name];
    if (!houseId) return;

    // Stage 1: the center house is the only way forward, and entering it
    // unlocks the town. The side houses are not there yet.
    if (this.stage === 1) {
      if (door.name !== 'gym') return;
      this.isTransitioning = true;
      EventBus.emit('enter-gym');
      // Swap under cover of the shut iris: just inside IRIS_MS (1200) in page.tsx.
      this.time.delayedCall(900, () => {
        this.scene.start('InteriorScene', { house: houseId, door: door.name });
      });
      return;
    }

    this.isTransitioning = true;
    this.scene.start('InteriorScene', { house: houseId, door: door.name });
  }

  update() {
    if (!this.player) return;

    // SPACE or Button B only starts a hop from the ground: holding it does not float, and
    // there is no second jump in the air. Indoors SPACE reads an exhibit, which
    // is why the hop lives in this scene alone.
    const hopRequested =
      (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.space)) ||
      VirtualInput.consumeHop();

    if (this.hopStart < 0 && hopRequested) {
      this.hopStart = this.time.now;
    }

    const leftDown = (this.cursors && this.cursors.left.isDown) || (this.wasd && this.wasd.A.isDown) || VirtualInput.left;
    const rightDown = (this.cursors && this.cursors.right.isDown) || (this.wasd && this.wasd.D.isDown) || VirtualInput.right;
    const upDown = (this.cursors && this.cursors.up.isDown) || (this.wasd && this.wasd.W.isDown) || VirtualInput.up;
    const downDown = (this.cursors && this.cursors.down.isDown) || (this.wasd && this.wasd.S.isDown) || VirtualInput.down;

    const speed = 250;
    this.player.setVelocity(0);

    let moving = false;

    if (leftDown) {
      this.player.setVelocityX(-speed);
      this.avatar.anims.play('walk-left', true);
      moving = true;
    } else if (rightDown) {
      this.player.setVelocityX(speed);
      this.avatar.anims.play('walk-right', true);
      moving = true;
    }

    if (upDown) {
      this.player.setVelocityY(-speed);
      this.avatar.anims.play('walk-up', true);
      moving = true;
    } else if (downDown) {
      this.player.setVelocityY(speed);
      this.avatar.anims.play('walk-down', true);
      moving = true;
    }

    if (!moving) {
      this.avatar.anims.stop();
      const current = this.avatar.anims.currentAnim;
      if (current) this.avatar.setFrame(current.frames[0].frame.name);
    }

    // After the movement block: the shadow has to land where physics actually
    // left the trainer this frame, not where input asked them to go.
    this.applyHop();
  }

  /**
   * Advance the hop and redraw it. Velocity is untouched, so walking and
   * hopping compose — you keep your speed and direction through the arc.
   */
  private applyHop() {
    let lift = 0;

    if (this.hopStart >= 0) {
      const t = (this.time.now - this.hopStart) / HOP_MS;
      if (t >= 1) this.hopStart = -1;
      // A sine arc rises and falls evenly — no gravity to make it asymmetric.
      else lift = Math.sin(Math.PI * t) * HOP_PEAK;
    }

    // The avatar is drawn `lift` above the body. Position it after the movement
    // block so it tracks where physics actually left the trainer this frame.
    this.avatar.setPosition(this.player.x, this.player.y - lift);

    // The body's bottom edge is the ground line, so the shadow stays on the
    // feet — it must not follow the avatar up.
    const feetY = this.player.body ? this.player.body.bottom - 6 : this.player.y;
    this.shadow.setPosition(this.player.x, feetY);

    // Smaller and fainter with height: the only depth cue a flat world has.
    const shrink = 1 - (lift / HOP_PEAK) * 0.45;
    this.shadow.setScale(shrink).setAlpha(0.35 * shrink);

    // Hold one frame in the air — a walk cycle mid-hop reads as running on
    // nothing. Resume unconditionally on landing, or a standing hop leaves the
    // animation paused and the next walk never animates.
    if (lift > 0) this.avatar.anims.pause();
    else this.avatar.anims.resume();
  }
}
