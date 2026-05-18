const NOTIF_STORAGE_KEY = 'mp-expiry-notified';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const checkExpiryNotifications = (inventoryItems, userId) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const notified = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '{}');
  let changed = false;

  (inventoryItems || [])
    .filter(i => i.userId === userId && i.expiryDate)
    .forEach(item => {
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const daysLeft = Math.round((expiry - today) / (1000 * 60 * 60 * 24));

      if (daysLeft >= 0 && daysLeft <= 3) {
        const key = `${item.id}-${todayStr}`;
        if (!notified[key]) {
          const title = daysLeft === 0
            ? `⚠️ "${item.name}" expires TODAY`
            : `⏰ "${item.name}" expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;

          new Notification(title, {
            body: `${item.quantity} unit${item.quantity !== 1 ? 's' : ''} in stock — check your inventory.`,
            icon: '/pwa-192x192.png',
            tag: `expiry-${item.id}`,
          });

          notified[key] = true;
          changed = true;
        }
      }
    });

  if (changed) localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notified));
};
