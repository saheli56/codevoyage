package expo.modules.scamshieldinterceptor

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ScamshieldInterceptorModule : Module() {
  private var receiver: BroadcastReceiver? = null

  override fun definition() = ModuleDefinition {
    Name("ScamshieldInterceptor")

    Events("onSmsReceived", "onNotificationReceived")

    OnCreate {
      val reactContext = appContext.reactContext ?: return@OnCreate
      
      receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
          when (intent.action) {
            "scamshield.intent.action.SMS_RECEIVED" -> {
              sendEvent("onSmsReceived", mapOf(
                "sender" to intent.getStringExtra("sender"),
                "body" to intent.getStringExtra("body")
              ))
            }
            "scamshield.intent.action.NOTIFICATION_RECEIVED" -> {
              sendEvent("onNotificationReceived", mapOf(
                "packageName" to intent.getStringExtra("packageName"),
                "title" to intent.getStringExtra("title"),
                "text" to intent.getStringExtra("text")
              ))
            }
          }
        }
      }

      val filter = IntentFilter().apply {
        addAction("scamshield.intent.action.SMS_RECEIVED")
        addAction("scamshield.intent.action.NOTIFICATION_RECEIVED")
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        reactContext.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
      } else {
        reactContext.registerReceiver(receiver, filter)
      }
    }

    OnDestroy {
      val reactContext = appContext.reactContext ?: return@OnDestroy
      receiver?.let {
        reactContext.unregisterReceiver(it)
        receiver = null
      }
    }

    AsyncFunction("isNotificationListenerEnabled") { ->
      val reactContext = appContext.reactContext ?: return@AsyncFunction false
      val enabledListeners = android.provider.Settings.Secure.getString(
        reactContext.contentResolver,
        "enabled_notification_listeners"
      )
      enabledListeners?.contains(reactContext.packageName) == true
    }

    AsyncFunction("openNotificationListenerSettings") { ->
      val reactContext = appContext.reactContext ?: return@AsyncFunction
      val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactContext.startActivity(intent)
    }
  }
}
