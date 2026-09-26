import { registerWebModule, NativeModule } from 'expo';

class ScamshieldInterceptorModule extends NativeModule<{}> {}

export default registerWebModule(ScamshieldInterceptorModule, 'ScamshieldInterceptorModule');
