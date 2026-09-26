import { NativeModule, requireNativeModule } from 'expo';
import { ScamshieldInterceptorEvents } from './ScamshieldInterceptor.types';

declare class ScamshieldInterceptorModule extends NativeModule<ScamshieldInterceptorEvents> {
  isNotificationListenerEnabled(): Promise<boolean>;
  openNotificationListenerSettings(): Promise<void>;
}

let nativeModule: ScamshieldInterceptorModule | null = null;
try {
  nativeModule = requireNativeModule<ScamshieldInterceptorModule>('ScamshieldInterceptor');
} catch {
  // Native module is not linked in Expo Go; fallback gracefully
  nativeModule = null;
}

export default nativeModule;


