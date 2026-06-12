import { Injectable } from '@angular/core';
import * as amplitude from '@amplitude/analytics-browser';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private initialized = false;

  constructor() { }

  initialize(apiKey: string) {
    amplitude.init(apiKey, undefined, {
      defaultTracking: true,
      flushQueueSize: 50,
      flushIntervalMillis: 1000
    });
    this.initialized = true;
  }

  track(eventName: string, properties?: any, time?: number) {
    if (!this.initialized) return;
    const eventOptions: any = {};
    if (time) {
      eventOptions.time = time;
    }
    amplitude.track(eventName, properties, eventOptions);
  }

  identify(userId: string, userProperties?: any) {
    if (!this.initialized) return;
    amplitude.setUserId(userId);
    if (userProperties) {
      const identifyEvent = new amplitude.Identify();
      for (const [key, value] of Object.entries(userProperties)) {
        identifyEvent.set(key, value as any);
      }
      amplitude.identify(identifyEvent);
    }
  }

  flush() {
    if (!this.initialized) return;
    amplitude.flush();
  }

  reset() {
    if (!this.initialized) return;
    amplitude.reset();
  }
}
