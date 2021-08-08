import { logger } from '@/utils/logger';

type EmitterEventListener = () => void;

export class Emitter<T extends string> {
  protected readonly listeners: Map<T, Set<EmitterEventListener>> = new Map();

  public on(event: T, listener: EmitterEventListener): void {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      this.listeners.set(event, new Set([listener]));
    } else {
      listeners.add(listener);
    }
  }

  public off(event: T, listener: EmitterEventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  public emit(event: T): void {
    logger.debug(`Emitted event "${event}"`);
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener());
    }
  }
}
