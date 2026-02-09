/* eslint-disable no-restricted-globals */

// Ye file import karegi Workbox libraries ko
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();

// ✅ 1. Build ke time saari files (CSS, JS) ki list yaha aa jayegi automatically
precacheAndRoute(self.__WB_MANIFEST);

// ✅ 2. App Shell Logic (SPA Navigation)
// Offline hone par bhi index.html load karega
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    } 
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// ✅ 3. Image Caching
// Images ko cache me store karega taki wo offline dikh sake
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'), 
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// ✅ 4. Update Listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});