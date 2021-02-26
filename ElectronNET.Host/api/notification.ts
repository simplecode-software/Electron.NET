import { Notification, nativeImage } from 'electron';
const notifications: Electron.Notification[] = [];
let electronSocket;

export = (socket: SocketIO.Socket) => {
    electronSocket = socket;
    socket.on('createNotification', (options) => {
        if (options.icon.startsWith('data:image/png;base64')) {
            options.icon = nativeImage.createFromDataURL(options.icon);
        }

        const notification = new Notification(options);
        let haveEvent = false;

        if (options.showID) {
            haveEvent = true;
            notification.on('show', () => {
                electronSocket.emit('NotificationEventShow', options.showID);
            });
        }

        if (options.clickID) {
            haveEvent = true;
            notification.on('click', () => {
                electronSocket.emit('NotificationEventClick', options.clickID);
            });
        }

        if (options.closeID) {
            haveEvent = true;
            notification.on('close', () => {
                electronSocket.emit('NotificationEventClose', options.closeID);
            });
        }

        if (options.replyID) {
            haveEvent = true;
            notification.on('reply', (event, value) => {
                electronSocket.emit('NotificationEventReply', [options.replyID, value]);
            });
        }

        if (options.actionID) {
            haveEvent = true;
            notification.on('action', (event, value) => {
                electronSocket.emit('NotificationEventAction', [options.actionID, value]);
            });
        }

        if (haveEvent) {
            notifications.push(notification);
        }

        notification.show();
    });

    socket.on('notificationIsSupported', () => {
        const isSupported = Notification.isSupported;
        electronSocket.emit('notificationIsSupportedComplete', isSupported);
    });
};
