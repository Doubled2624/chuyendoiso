// assets/js/app.js

function startDeviceHeartbeat() {
  const me = Auth.me();
  if (me && window.Device) {
    Device.ping(me);
    Device.markOfflineOlderThan(2 * 60 * 1000);
  }
  setInterval(() => {
    const u = Auth.me();
    if (u && window.Device) {
      Device.ping(u);
      Device.markOfflineOlderThan(2 * 60 * 1000);
    }
  }, 30000);
}

window.addEventListener('load', () => {
  Router.init();
  if (typeof initFloatingAIWidget === 'function') {
    initFloatingAIWidget();
  }
});

