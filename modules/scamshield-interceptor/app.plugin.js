const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withScamshieldInterceptor(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];

    if (!app.receiver) app.receiver = [];
    if (!app.service) app.service = [];

    // Add SMS Receiver
    app.receiver.push({
      $: {
        'android:name': 'expo.modules.scamshieldinterceptor.SmsReceiver',
        'android:exported': 'true',
        'android:permission': 'android.permission.BROADCAST_SMS',
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'android.provider.Telephony.SMS_RECEIVED' } }],
        },
      ],
    });

    // Add Notification Listener Service
    app.service.push({
      $: {
        'android:name': 'expo.modules.scamshieldinterceptor.ScamshieldNotificationListener',
        'android:label': 'ScamShield Interceptor',
        'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
        'android:exported': 'true',
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'android.service.notification.NotificationListenerService' } }],
        },
      ],
    });

    return config;
  });
};
