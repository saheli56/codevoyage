export type SmsEvent = {
  sender: string;
  body: string;
};

export type NotificationEvent = {
  packageName: string;
  title: string;
  text: string;
};

export type ScamshieldInterceptorEvents = {
  onSmsReceived(event: SmsEvent): void;
  onNotificationReceived(event: NotificationEvent): void;
};

