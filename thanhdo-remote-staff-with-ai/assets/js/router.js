// assets/js/router.js
// Router đơn giản điều khiển SPA bằng hash (#/...)
// Tự động render UI + load lịch sử chat AI khi vào tab AI

function routeName() {
  const hash = location.hash || '#/login';
  const clean = hash.split('?')[0];
  return clean;
}

function render() {
  const main = document.getElementById('app');
  const me = Auth.me();
  const hash = routeName();

  let html = '';

  switch (hash) {
    case '#/login':
      html = View.login();
      break;

    case '#/dashboard':
      html = me ? View.dashboard() : View.login();
      break;

    case '#/employees':
      html = me ? View.employees() : View.login();
      break;

    case '#/tasks':
      html = me ? View.tasks() : View.login();
      break;

    case '#/attendance':
      html = me ? View.attendance() : View.login();
      break;

    case '#/payroll':
      html = me ? View.payroll() : View.login();
      break;

    case '#/devices':
      html = me ? View.devices() : View.login();
      break;

    case '#/admin':
      html = me ? View.admin() : View.login();
      break;

    case '#/profile':
      html = me ? View.profile() : View.login();
      break;

    case '#/ai':
      html = me ? View.ai() : View.login();
      break;

    default:
      html = View.dashboard ? View.dashboard() : '';
  }

  // Gắn HTML vào màn hình
  main.innerHTML = html;

  // Render navbar + user menu
  renderNavbar();
  mountUserMenu();

  // Nếu đang ở tab AI → load lịch sử chat
  if (hash === '#/ai') {
    if (typeof renderChatLog === "function") {
      renderChatLog();     // hiện bong bóng chat
    }
    if (typeof showAIThinking === "function") {
      showAIThinking(false); // tắt hiệu ứng typing lúc bắt đầu
    }
  }
}

function onHashChange() {
  render();
}

// Khởi tạo router
const Router = {
  init() {
    window.addEventListener('hashchange', onHashChange);
    render();
  }
};
