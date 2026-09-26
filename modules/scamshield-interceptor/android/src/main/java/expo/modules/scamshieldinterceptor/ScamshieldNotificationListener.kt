package expo.modules.scamshieldinterceptor

import android.content.Intent
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class ScamshieldNotificationListener : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        sbn?.let {
            val packageName = it.packageName
            val extras = it.notification.extras
            val title = extras.getString("android.title") ?: ""
            val text = extras.getCharSequence("android.text")?.toString() ?: ""

            val localIntent = Intent("scamshield.intent.action.NOTIFICATION_RECEIVED")
            localIntent.putExtra("packageName", packageName)
            localIntent.putExtra("title", title)
            localIntent.putExtra("text", text)
            localIntent.setPackage(this.packageName)
            this.sendBroadcast(localIntent)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
    }
}
