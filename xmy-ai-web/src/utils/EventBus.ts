type Callback<T = unknown> = (data: T) => void

class EventBus<T = unknown> {
  events: Record<string, Callback<T>[]> = {};

  on(event: string, callback: Callback<T>) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  off(event: string, callback: Callback<T>) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: T) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
}

export const eventBus = new EventBus();

export const EVENT_Iframe_Evaler_Preapred = "EVENT_Iframe_Evaler_Preapred";
