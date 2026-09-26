package expo.modules.scamshieldinterceptor

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (message in messages) {
                val sender = message.displayOriginatingAddress ?: ""
                val body = message.displayMessageBody ?: ""
                
                val localIntent = Intent("scamshield.intent.action.SMS_RECEIVED")
                localIntent.putExtra("sender", sender)
                localIntent.putExtra("body", body)
                localIntent.setPackage(context.packageName)
                context.sendBroadcast(localIntent)
            }
        }
    }
}
