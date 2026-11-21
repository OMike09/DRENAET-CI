'use strict';
// Le service worker ne reçoit et n'affiche jamais le texte privé des alertes.
self.addEventListener('push',event=>{event.waitUntil(self.registration.showNotification('DRENAET CI',{body:'Une nouvelle alerte est disponible. Connectez-vous pour la consulter.',tag:'drenaet-ci-alerte',icon:undefined,data:{url:'/?notifications=1'}}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.openWindow('/?notifications=1'))});
