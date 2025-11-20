// assets/js/device.js

const Device = (() => {
  const KEY = 'td_devices';

  function all() {
    return Storage.loadJSON(KEY, []);
  }

  function save(list) {
    Storage.saveJSON(KEY, list);
  }

  function getDeviceId() {
    let id = Storage.get('td_device_id');
    if (!id) {
      id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      Storage.set('td_device_id', id);
    }
    return id;
  }

  function detectFingerprint() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    let os = 'Unknown';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Unknown';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';

    return { ua, platform, os, deviceType, browser };
  }

  function ping(user) {
    if (!user) return;
    const list = all();
    const id = getDeviceId();
    const nowIso = new Date().toISOString();
    const fp = detectFingerprint();

    let row = list.find(d => d.id === id);
    if (!row) {
      row = {
        id,
        userId: user.id,
        firstSeen: nowIso,
        lastSeen: nowIso,
        status: 'online',
        ...fp
      };
      list.push(row);
    } else {
      row.userId = user.id;
      row.lastSeen = nowIso;
      row.status = 'online';
      Object.assign(row, fp);
    }
    save(list);
  }

  function markOfflineOlderThan(timeoutMs) {
    const list = all();
    const now = Date.now();
    let changed = false;
    list.forEach(d => {
      if (!d.lastSeen) return;
      const t = new Date(d.lastSeen).getTime();
      if (now - t > timeoutMs && d.status !== 'offline') {
        d.status = 'offline';
        changed = true;
      }
    });
    if (changed) save(list);
  }

  function byUser() {
    const map = {};
    all().forEach(d => {
      if (!map[d.userId]) map[d.userId] = [];
      map[d.userId].push(d);
    });
    return map;
  }

  return { all, save, ping, markOfflineOlderThan, byUser, getDeviceId };
})();
