import { NativeModule, requireNativeModule } from 'expo';

declare class ScamshieldInterceptorModule extends NativeModule<{}> {}

export default requireNativeModule<ScamshieldInterceptorModule>('ScamshieldInterceptor');
