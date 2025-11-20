// assets/js/auth.js

const Roles = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

const SESSION_KEY = 'td_session';

const Auth = {
  me() {
    const sess = Storage.loadJSON(SESSION_KEY, null);
    if (!sess || !sess.userId) return null;
    const users = DB.users();
    return users.find(u => u.id === sess.userId) || null;
  },

  login(email, password) {
    const users = DB.users();
    const u = users.find(
      x =>
        x.email === email.trim() &&
        x.password === password &&
        x.active !== false
    );

    if (!u) {
      return {
        ok: false,
        msg: 'Sai email hoặc mật khẩu, hoặc tài khoản đã bị khoá.'
      };
    }

    Storage.saveJSON(SESSION_KEY, { userId: u.id });

    if (window.Device) {
      try {
        Device.ping(u);
      } catch (e) {
        console.warn('Device ping error:', e);
      }
    }

    return { ok: true, user: u };
  },

  logout() {
    Storage.remove(SESSION_KEY);
  },

  require(role) {
    const me = this.me();
    if (!me) return false;
    if (!role) return true;
    return me.role === role;
  }
};
