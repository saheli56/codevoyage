import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ScamshieldInterceptor.web.ts
// and on native platforms to ScamshieldInterceptor.ts
import ScamshieldInterceptorModule from './ScamshieldInterceptorModule';

const emitter = new EventEmitter(ScamshieldInterceptorModule ?? NativeModulesProxy.ScamshieldInterceptor);

export type SmsEvent = {
  sender: string;
  body: string;
};

export type NotificationEvent = {
  packageName: string;
  title: string;
  text: string;
};

export function addSmsListener(listener: (event: SmsEvent) => void): Subscription {
  return emitter.addListener<SmsEvent>('onSmsReceived', listener);
}

export function addNotificationListener(listener: (event: NotificationEvent) => void): Subscription {
  return emitter.addListener<NotificationEvent>('onNotificationReceived', listener);
}

export async function isNotificationListenerEnabled(): Promise<boolean> {
  if (ScamshieldInterceptorModule.isNotificationListenerEnabled) {
    return await ScamshieldInterceptorModule.isNotificationListenerEnabled();
  }
  return false;
}

export async function openNotificationListenerSettings(): Promise<void> {
  if (ScamshieldInterceptorModule.openNotificationListenerSettings) {
    await ScamshieldInterceptorModule.openNotificationListenerSettings();
  }
}

export default ScamshieldInterceptorModule;
