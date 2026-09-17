import type { Scene } from 'phaser';
import type { HouseId } from '../../data/houseContent';

/**
 * Every channel the Phaser scenes and React shell talk over, with its payload.
 * Listing them here is what lets `on`/`emit` be typed instead of `any[]`, so a
 * renamed event or a changed payload fails the build rather than the game.
 */
export type GameEvents = {
  'set-stage': [stage: number];
  'enter-gym': [];
  'enter-house': [house: HouseId];
  'open-exhibit': [reading: { house: HouseId; exhibit: string }];
  /** React closed the reader, so the room may take input again. */
  'exhibit-closed': [];
  'close-menu': [];
  'current-scene-ready': [scene: Scene];
};

type EventName = keyof GameEvents;
type Handler<E extends EventName> = (...args: GameEvents[E]) => void;

/**
 * Handlers are stored opaquely because a per-event handler type cannot be
 * indexed by a generic E without collapsing to `never`. The public methods
 * carry the real types, so call sites are still checked against GameEvents.
 */
class SimpleEventBus {
  private events = new Map<EventName, unknown[]>();

  on<E extends EventName>(event: E, handler: Handler<E>) {
    const handlers = this.events.get(event);
    if (handlers) handlers.push(handler);
    else this.events.set(event, [handler]);
  }

  emit<E extends EventName>(event: E, ...args: GameEvents[E]) {
    this.events.get(event)?.forEach((handler) => (handler as Handler<E>)(...args));
  }

  removeListener<E extends EventName>(event: E, handler?: Handler<E>) {
    const handlers = this.events.get(event);
    if (!handlers) return;
    if (handler) {
      this.events.set(
        event,
        handlers.filter((h) => h !== handler)
      );
    } else {
      this.events.delete(event);
    }
  }
}

export const EventBus = new SimpleEventBus();
