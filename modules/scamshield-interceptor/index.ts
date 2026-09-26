import { EventEmitter, type EventSubscription } from 'expo-modules-core';
import ScamshieldInterceptorModule from './src/ScamshieldInterceptorModule';
import { SmsEvent, NotificationEvent, ScamshieldInterceptorEvents } from './src/ScamshieldInterceptor.types';

export * from './src/ScamshieldInterceptor.types';

const dummySubscription: EventSubscription = {
  remove: () => {},
};

const emitter = ScamshieldInterceptorModule
  ? new EventEmitter<ScamshieldInterceptorEvents>(ScamshieldInterceptorModule)
  : null;

export function addSmsListener(listener: (event: SmsEvent) => void): EventSubscription {
  if (!emitter) return dummySubscription;
  return emitter.addListener('onSmsReceived', listener);
}

export function addNotificationListener(listener: (event: NotificationEvent) => void): EventSubscription {
  if (!emitter) return dummySubscription;
  return emitter.addListener('onNotificationReceived', listener);
}

export async function isNotificationListenerEnabled(): Promise<boolean> {
  if (ScamshieldInterceptorModule?.isNotificationListenerEnabled) {
    return await ScamshieldInterceptorModule.isNotificationListenerEnabled();
  }
  return false;
}

export async function openNotificationListenerSettings(): Promise<void> {
  if (ScamshieldInterceptorModule?.openNotificationListenerSettings) {
    await ScamshieldInterceptorModule.openNotificationListenerSettings();
  }
}

export default ScamshieldInterceptorModule;


