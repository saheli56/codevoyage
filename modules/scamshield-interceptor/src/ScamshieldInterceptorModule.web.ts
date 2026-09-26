import { registerWebModule, NativeModule } from 'expo';
import { ScamshieldInterceptorEvents } from './ScamshieldInterceptor.types';

class ScamshieldInterceptorModule extends NativeModule<ScamshieldInterceptorEvents> {
  async isNotificationListenerEnabled(): Promise<boolean> {
    return false;
  }
  async openNotificationListenerSettings(): Promise<void> {}
}

export default registerWebModule(ScamshieldInterceptorModule, 'ScamshieldInterceptor');

