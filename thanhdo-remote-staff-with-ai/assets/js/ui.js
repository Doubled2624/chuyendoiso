// assets/js/ui.js
// Toàn bộ UI: navbar, views, export CSV, chấm công GPS, AI tab ...

// ---------- NAVBAR & USER MENU ----------

function navLinks() {
  const me = Auth.me();
  if (!me) return '';

  const links = [
    { href: '#/dashboard', label: 'Bảng điều khiển' },
    ...(me.role === Roles.ADMIN ? [{ href: '#/employees', label: 'Nhân viên' }] : []),
    { href: '#/tasks', label: 'Công việc' },
    { href: '#/attendance', label: 'Chấm công' },
    ...(me.role === Roles.ADMIN
      ? [
          { href: '#/payroll', label: 'Tính lương' },
          { href: '#/ai', label: 'AI (Admin)' },
          { href: '#/devices', label: 'Thiết bị' },
          { href: '#/admin', label: 'Quản trị' }
        ]
      : [])
  ];

  const cur = location.hash || '#/login';
  return links
    .map(
      l =>
        `<a href="${l.href}" class="${cur === l.href ? 'active' : ''}">${l.label}</a>`
    )
    .join('');
}

function renderNavbar() {
  const me = Auth.me();
  const nav = document.getElementById('navbar');
  if (!nav) return;
  if (!me) {
    nav.innerHTML = '';
    return;
  }
  nav.innerHTML = navLinks();
}

// ---------- USER MENU (NÚT GỌN) ----------

function userMenuHTML() {
  const me = Auth.me();
  if (!me) {
    return `<button class="btn primary" onclick="location.hash='#/login'">Đăng nhập</button>`;
  }
  const initial = (me.name || 'TD').trim().charAt(0).toUpperCase();
  const roleLabel =
    me.role === Roles.ADMIN ? 'Quản trị hệ thống' : 'Nhân viên';

  return `
    <div class="user-menu-trigger" onclick="toggleUserMenuPanel(event)">
      <div class="user-avatar-pill">${initial}</div>
      <div class="user-menu-text">
        <div class="user-menu-name">${me.name}</div>
        <div class="user-menu-role">${roleLabel}</div>
      </div>
      <span class="user-menu-chevron">▾</span>
    </div>

    <div id="userMenuPanel" class="user-menu-panel hidden" onclick="event.stopPropagation()">
      <div class="user-menu-header">
        <div class="user-menu-header-text">
          <strong>${me.name}</strong><br/>
          <small>${me.email}</small>
        </div>
      </div>
      <button class="user-menu-item" onclick="toggleTheme()">Đổi giao diện</button>
      <button class="user-menu-item" onclick="location.hash='#/profile'">Hồ sơ</button>
      <button class="user-menu-item danger" onclick="doLogout()">Đăng xuất</button>
    </div>
  `;
}

function mountUserMenu() {
  const wrap = document.getElementById('userMenuWrap');
  const box = document.getElementById('userMenu');
  if (!wrap || !box) return;

  const me = Auth.me();
  if (!me) {
    wrap.classList.add('hidden');
    box.innerHTML = '';
    return;
  }

  wrap.classList.remove('hidden');
  box.innerHTML = userMenuHTML();
}

// giữ nguyên doLogout
function doLogout() {
  Auth.logout();
  location.hash = '#/login';
  render();
}

// toggle dropdown
function toggleUserMenuPanel(ev) {
  ev.stopPropagation();
  const panel = document.getElementById('userMenuPanel');
  if (!panel) return;
  panel.classList.toggle('hidden');
}

// đóng khi click ra ngoài
window.addEventListener('click', () => {
  const panel = document.getElementById('userMenuPanel');
  if (panel) panel.classList.add('hidden');
});



// ---------- CSV & JSON HELPERS ----------

function toCSV(rows) {
  return rows
    .map(r =>
      r
        .map(v => {
          const s = (v ?? '').toString();
          if (/[",\n]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
          return s;
        })
        .join(',')
    )
    .join('\n');
}

function downloadCSV(file, rows) {
  const csv = toCSV(rows);
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.endsWith('.csv') ? file : file + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportUsersCSV() {
  const users = DB.users();
  const header = ['Họ tên', 'Email', 'Vai trò', 'Phòng ban', 'Trạng thái'];
  const rows = users.map(u => [
    u.name,
    u.email,
    u.role === Roles.ADMIN ? 'Quản trị' : 'Nhân viên',
    u.dept || '',
    u.active ? 'Hoạt động' : 'Khoá'
  ]);
  downloadCSV('users', [header, ...rows]);
}

function exportTasksCSV() {
  const users = DB.users();
  const tasks = DB.tasks();
  const header = [
    'Tiêu đề',
    'Mô tả',
    'Người nhận',
    'Phòng ban',
    'Hạn',
    'Trạng thái'
  ];
  const rows = tasks.map(t => {
    const u = users.find(x => x.id === t.assignedTo);
    return [
      t.title,
      t.desc || '',
      u?.name || '',
      u?.dept || '',
      t.due ? new Date(t.due).toLocaleDateString() : '',
      t.status
    ];
  });
  downloadCSV('tasks', [header, ...rows]);
}

function exportAttendanceCSV() {
  const users = DB.users();
  const att = DB.attendance();
  const header = [
    'Nhân viên',
    'Phòng ban',
    'Ngày',
    'Check-in',
    'Check-out',
    'Lat',
    'Lng'
  ];
  const rows = att.map(a => {
    const u = users.find(x => x.id === a.userId);
    return [
      u?.name || '',
      u?.dept || '',
      new Date(a.date).toLocaleDateString(),
      a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '',
      a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '',
      a.lat ?? '',
      a.lng ?? ''
    ];
  });
  downloadCSV('attendance', [header, ...rows]);
}

function exportAllJSON() {
  exportJSON('thanhdo_backup', {
    users: DB.users(),
    tasks: DB.tasks(),
    attendance: DB.attendance(),
    payrollRuns: DB.payrollRuns()
  });
}

// ---------- FORM HANDLERS ----------

function onLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login_email').value.trim();
  const pass = document.getElementById('login_password').value;
  const res = Auth.login(email, pass);
  if (!res.ok) {
    alert(res.msg);
    return false;
  }
  location.hash = '#/dashboard';
  render();
  return false;
}

// Nhân viên
function onCreateUser(e) {
  e.preventDefault();
  const list = DB.users();
  const u = {
    id: 'u_' + Date.now(),
    name: document.getElementById('u_name').value.trim(),
    email: document.getElementById('u_email').value.trim(),
    role: document.getElementById('u_role').value,
    dept: document.getElementById('u_dept').value,
    password: document.getElementById('u_pass').value,
    active: true
  };

  if (list.some(x => x.email === u.email)) {
    alert('Email đã tồn tại');
    return false;
  }

  list.push(u);
  DB.saveUsers(list);
  alert('Đã tạo tài khoản');
  location.reload();
}

function openEditUser(id) {
  const user = DB.users().find(x => x.id === id);
  if (!user) return;

  const name = prompt('Tên mới:', user.name);
  if (name === null) return;

  const dept = prompt('Phòng ban:', user.dept || '');
  if (dept === null) return;

  const pass = prompt('Mật khẩu mới (bỏ trống nếu giữ nguyên):', '');

  const list = DB.users().map(u =>
    u.id === id
      ? {
          ...u,
          name: name || u.name,
          dept: dept || u.dept,
          password: pass || u.password
        }
      : u
  );

  DB.saveUsers(list);
  alert('Đã cập nhật');
  location.reload();
}

function toggleActive(id) {
  const list = DB.users().map(u =>
    u.id === id ? { ...u, active: !u.active } : u
  );
  DB.saveUsers(list);
  location.reload();
}

// Công việc
function onCreateTask(e) {
  e.preventDefault();

  const t = {
    id: 't_' + Date.now(),
    title: document.getElementById('t_title').value.trim(),
    desc: document.getElementById('t_desc').value.trim(),
    assignedTo: document.getElementById('t_assignee').value,
    status: 'todo',
    due: new Date(document.getElementById('t_due').value).toISOString()
  };

  const list = DB.tasks();
  list.push(t);
  DB.saveTasks(list);

  alert('Đã tạo công việc');
  location.reload();
}

function updateTaskStatus(id, status) {
  const list = DB.tasks().map(t =>
    t.id === id ? { ...t, status } : t
  );
  DB.saveTasks(list);
}

function editTask(id) {
  const t = DB.tasks().find(x => x.id === id);
  if (!t) return;

  const tt = prompt('Tiêu đề:', t.title);
  if (tt === null) return;

  const dd = prompt('Mô tả:', t.desc || '');
  const due = prompt(
    'Hạn (YYYY-MM-DD):',
    t.due ? t.due.slice(0, 10) : ''
  );

  const list = DB.tasks().map(x =>
    x.id === id
      ? {
          ...x,
          title: tt,
          desc: dd,
          due: due ? new Date(due).toISOString() : null
        }
      : x
  );
  DB.saveTasks(list);
  location.reload();
}

function deleteTask(id) {
  if (!confirm('Xoá công việc?')) return;
  DB.saveTasks(DB.tasks().filter(t => t.id !== id));
  location.reload();
}

// ---------- CHẤM CÔNG GPS ----------

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator))
      return reject(new Error('Trình duyệt không hỗ trợ GPS'));
    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

async function doCheckin() {
  const me = Auth.me();
  if (!me) return alert('Hãy đăng nhập');

  let coords = null;
  try {
    coords = await getPosition();
  } catch (e) {
    if (!confirm('Không lấy được GPS. Vẫn check-in?')) return;
  }

  const list = DB.attendance();
  const today = new Date().toISOString().slice(0, 10);

  let row = list.find(a => a.userId === me.id && a.date === today);

  if (row && row.checkIn) {
    alert('Hôm nay đã check-in rồi');
    return;
  }

  if (!row) {
    row = {
      id: 'att_' + Date.now(),
      userId: me.id,
      date: today,
      checkIn: new Date().toISOString(),
      checkOut: null,
      lat: coords?.lat,
      lng: coords?.lng
    };
    list.push(row);
  } else {
    row.checkIn = new Date().toISOString();
    if (coords) {
      row.lat = coords.lat;
      row.lng = coords.lng;
    }
  }

  DB.saveAttendance(list);
  alert('Đã check-in');
  render();
}

async function doCheckout() {
  const me = Auth.me();
  if (!me) return alert('Hãy đăng nhập');

  let coords = null;
  try {
    coords = await getPosition();
  } catch {}

  const list = DB.attendance();
  const today = new Date().toISOString().slice(0, 10);
  let row = list.find(a => a.userId === me.id && a.date === today);

  if (!row || !row.checkIn) {
    alert('Bạn chưa check-in hôm nay');
    return;
  }

  if (row.checkOut) {
    alert('Bạn đã check-out rồi');
    return;
  }

  row.checkOut = new Date().toISOString();
  if (coords) {
    row.lat = coords.lat;
    row.lng = coords.lng;
  }

  DB.saveAttendance(list);
  alert('Đã check-out');
  render();
}

// ---------- TABLE TASKS DÙNG LẠI ----------

function tableTasks(me, deptFilter) {
  const users = DB.users();
  let tasks =
    me.role === Roles.ADMIN
      ? DB.tasks()
      : DB.tasks().filter(t => t.assignedTo === me.id);

  if (deptFilter && deptFilter !== 'Tất cả') {
    tasks = tasks.filter(t => {
      const u = users.find(x => x.id === t.assignedTo);
      return u && u.dept === deptFilter;
    });
  }

  if (!tasks.length) return `<div class="help">Chưa có công việc.</div>`;

  return `
    <table class="table mt-2">
      <thead>
        <tr>
          <th>Công việc</th>
          <th>Người nhận</th>
          <th>Phòng ban</th>
          <th>Hạn</th>
          <th>Trạng thái</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${tasks
          .sort((a, b) => a.status.localeCompare(b.status))
          .map(t => {
            const u = users.find(x => x.id === t.assignedTo);
            return `
              <tr>
                <td>${t.title}<br/><small class="help">${t.desc || ''}</small></td>
                <td>${u?.name || '?'}</td>
                <td>${u?.dept || ''}</td>
                <td>${
                  t.due ? new Date(t.due).toLocaleDateString() : '-'
                }</td>
                <td>
                  <select class="input" onchange="updateTaskStatus('${
                    t.id
                  }', this.value)">
                    ${['todo', 'inprogress', 'done']
                      .map(
                        s =>
                          `<option value="${s}" ${
                            t.status === s ? 'selected' : ''
                          }>${s}</option>`
                      )
                      .join('')}
                  </select>
                </td>
                <td class="flex">
                  ${
                    me.role === Roles.ADMIN
                      ? `<button class="btn" onclick="editTask('${t.id}')">Sửa</button>
                         <button class="btn warn" onclick="deleteTask('${t.id}')">Xoá</button>`
                      : ''
                  }
                </td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

// ---------- VIEW DEFINITIONS ----------

const View = {
  login() {
    return `
      <div class="login-wrap">
        <div class="card">
          <h2 class="login-title">Đăng nhập hệ thống</h2>
          <form class="form" onsubmit="return onLogin(event)">
            <div>
              <label class="label">Email</label>
              <input class="input" type="email" id="login_email" required />
            </div>
            <div>
              <label class="label">Mật khẩu</label>
              <input class="input" type="password" id="login_password" required />
            </div>
            <div class="help">Tài khoản mẫu: admin@thanhdo.local / 123456</div>
            <div class="actions">
              <button class="btn primary" type="submit">Đăng nhập</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  dashboard() {
    const me = Auth.me();
    const tasks = DB.tasks();
    const myTasks =
      me.role === Roles.ADMIN
        ? tasks
        : tasks.filter(t => t.assignedTo === me.id);
    const att = DB.attendance();
    const today = new Date().toISOString().slice(0, 10);
    const attToday = att.find(a => a.userId === me.id && a.date === today);

    return `
      <div class="grid">
        <div class="col-8">
          <div class="card">
            <h3>Xin chào, ${me.name}</h3>
            <div class="row mt-3">
              <div class="kpi">
                <div>
                  <div class="help">Công việc của tôi</div>
                  <strong>${myTasks.length}</strong>
                </div>
                <a class="btn" href="#/tasks">Xem</a>
              </div>
              <div class="kpi">
                <div>
                  <div class="help">Tổng nhân viên</div>
                  <strong>${DB.users().length}</strong>
                </div>
                ${
                  me.role === Roles.ADMIN
                    ? `<a class="btn" href="#/employees">Quản lý</a>`
                    : ''
                }
              </div>
            </div>
          </div>
        </div>

        <div class="col-4">
          <div class="card">
            <h3>Chấm công hôm nay</h3>
            ${
              attToday
                ? `
                <div class="stack mt-2">
                  <div>Check-in: <span class="badge ok">${new Date(
                    attToday.checkIn
                  ).toLocaleTimeString()}</span></div>
                  <div>Check-out: <span class="badge ${
                    attToday.checkOut ? 'ok' : 'warn'
                  }">${attToday.checkOut
                    ? new Date(attToday.checkOut).toLocaleTimeString()
                    : 'Chưa'}</span></div>
                  ${
                    !attToday.checkOut
                      ? `<button class="btn" onclick="doCheckout()">Check-out</button>`
                      : ''
                  }
                </div>
              `
                : `
                <div class="stack">
                  <div class="help">Bạn chưa check-in hôm nay.</div>
                  <button class="btn primary" onclick="doCheckin()">Check-in (ghi GPS)</button>
                </div>
              `
            }
          </div>
        </div>

        <div class="col-12">
          <div class="card">
            <h3>Công việc gần đây</h3>
            ${tableTasks(me)}
          </div>
        </div>
      </div>
    `;
  },

  employees() {
    const me = Auth.me();
    if (me.role !== Roles.ADMIN) return View.denied();

    const users = DB.users();
    const departments = ['Tất cả', 'Kỹ thuật', 'Kinh doanh', 'Nhân sự'];
    const curDept = window._deptFilter || 'Tất cả';

    const filtered =
      curDept === 'Tất cả'
        ? users
        : users.filter(u => u.dept === curDept);

    return `
      <div class="grid">
        <div class="col-8">
          <div class="card">
            <div class="flex-between">
              <h3>Danh sách nhân viên</h3>
              <div class="toolbar">
                <select class="input" onchange="window._deptFilter = this.value; render();">
                  ${departments
                    .map(
                      d =>
                        `<option ${
                          d === curDept ? 'selected' : ''
                        }>${d}</option>`
                    )
                    .join('')}
                </select>
                <button class="btn" onclick="exportUsersCSV()">Xuất CSV</button>
              </div>
            </div>

            <table class="table mt-2">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Phòng ban</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${filtered
                  .map(
                    u => `
                    <tr>
                      <td>${u.name}</td>
                      <td>${u.email}</td>
                      <td>${u.role === Roles.ADMIN ? 'Quản trị' : 'Nhân viên'}</td>
                      <td>${u.dept || ''}</td>
                      <td>${
                        u.active
                          ? '<span class="badge ok">Hoạt động</span>'
                          : '<span class="badge warn">Khoá</span>'
                      }</td>
                      <td>
                        <button class="btn" onclick="openEditUser('${
                          u.id
                        }')">Sửa</button>
                        <button class="btn warn" onclick="toggleActive('${
                          u.id
                        }')">${u.active ? 'Khoá' : 'Mở'}</button>
                      </td>
                    </tr>
                  `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="col-4">
          <div class="card">
            <h3>Thêm nhân viên</h3>
            <form class="form" onsubmit="return onCreateUser(event)">
              <div><label class="label">Họ tên</label><input id="u_name" class="input" required></div>
              <div><label class="label">Email</label><input id="u_email" class="input" type="email" required></div>
              <div><label class="label">Vai trò</label>
                <select id="u_role" class="input">
                  <option value="employee">Nhân viên</option>
                  <option value="admin">Quản trị</option>
                </select>
              </div>
              <div><label class="label">Phòng ban</label>
                <select id="u_dept" class="input">
                  <option>Kỹ thuật</option>
                  <option>Kinh doanh</option>
                  <option>Nhân sự</option>
                </select>
              </div>
              <div><label class="label">Mật khẩu</label><input id="u_pass" class="input" value="123456"></div>
              <div class="actions"><button class="btn primary">Tạo</button></div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  tasks() {
    const me = Auth.me();
    const users = DB.users();
    const depts = ['Tất cả', 'Kỹ thuật', 'Kinh doanh', 'Nhân sự'];
    const curDept = window._deptTask || 'Tất cả';

    return `
      <div class="grid">
        <div class="col-8">
          <div class="card">
            <div class="flex-between">
              <h3>Danh sách công việc</h3>
              <div class="toolbar">
                <select class="input" onchange="window._deptTask = this.value; render();">
                  ${depts
                    .map(
                      d =>
                        `<option ${
                          d === curDept ? 'selected' : ''
                        }>${d}</option>`
                    )
                    .join('')}
                </select>
                <button class="btn" onclick="exportTasksCSV()">Xuất CSV</button>
              </div>
            </div>
            ${tableTasks(me, curDept)}
          </div>
        </div>

        <div class="col-4">
          <div class="card">
            <h3>${
              me.role === Roles.ADMIN ? 'Giao việc mới' : 'Tạo việc cá nhân'
            }</h3>
            <form class="form" onsubmit="return onCreateTask(event)">
              <div><label class="label">Tiêu đề</label><input id="t_title" class="input" required></div>
              <div><label class="label">Mô tả</label><textarea id="t_desc" class="input" rows="3"></textarea></div>
              <div class="row">
                <div><label class="label">Hạn</label><input id="t_due" type="date" class="input" required></div>
                <div><label class="label">Giao cho</label>
                  ${
                    me.role === Roles.ADMIN
                      ? `<select id="t_assignee" class="input">
                          ${users
                            .filter(x => x.active)
                            .map(
                              u =>
                                `<option value="${u.id}">${u.name} — ${u.dept}</option>`
                            )
                            .join('')}
                        </select>`
                      : `<input class="input" disabled value="${me.name}"><input type="hidden" id="t_assignee" value="${me.id}">`
                  }
                </div>
              </div>
              <div class="actions"><button class="btn primary">Lưu</button></div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  attendance() {
    const me = Auth.me();
    const users = DB.users();
    const depts = ['Tất cả', 'Kỹ thuật', 'Kinh doanh', 'Nhân sự'];
    const curDept = window._deptAtt || 'Tất cả';

    const att = DB.attendance();
    const all =
      me.role === Roles.ADMIN ? att : att.filter(a => a.userId === me.id);

    const rows =
      curDept === 'Tất cả'
        ? all
        : all.filter(a => {
            const u = users.find(x => x.id === a.userId);
            return u && u.dept === curDept;
          });

    return `
      <div class="card">
        <div class="flex-between">
          <h3>Chấm công</h3>
          <div class="toolbar">
            <select class="input" onchange="window._deptAtt = this.value; render();">
              ${depts
                .map(
                  d =>
                    `<option ${
                      d === curDept ? 'selected' : ''
                    }>${d}</option>`
                )
                .join('')}
            </select>
            <button class="btn" onclick="doCheckin()">Check-in</button>
            <button class="btn" onclick="doCheckout()">Check-out</button>
            <button class="btn" onclick="exportAttendanceCSV()">Xuất CSV</button>
            <button class="btn" onclick="exportJSON('attendance', DB.attendance())">Xuất JSON</button>
          </div>
        </div>

        <table class="table mt-2">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th>Ngày</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Tọa độ</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(a => {
                const u = users.find(x => x.id === a.userId);
                const pos = a.lat
                  ? `${a.lat.toFixed(5)}, ${a.lng.toFixed(
                      5
                    )} <a target="_blank" href="https://maps.google.com/?q=${a.lat},${a.lng}">Map</a>`
                  : '-';
                return `
                  <tr>
                    <td>${u?.name || '?'}</td>
                    <td>${u?.dept || ''}</td>
                    <td>${new Date(a.date).toLocaleDateString()}</td>
                    <td>${a.checkIn
                      ? new Date(a.checkIn).toLocaleTimeString()
                      : '-'}</td>
                    <td>${a.checkOut
                      ? new Date(a.checkOut).toLocaleTimeString()
                      : '-'}</td>
                    <td>${pos}</td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  payroll() {
    const me = Auth.me();
    if (me.role !== Roles.ADMIN) return View.denied();

    // ví dụ tính lương cho cả tháng hiện tại
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const result = Payroll.compute(from, to);

    return `
      <div class="card">
        <h3>Tính lương (demo theo chấm công tháng hiện tại)</h3>
        <div class="help">
          Lương cơ bản mặc định: ${result.baseSalary.toLocaleString()} đ —
          Giờ công/ngày: ${result.workHoursPerDay} —
          Hệ số OT: ${result.otMul}
        </div>
        <table class="table mt-2">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th>Ngày công</th>
              <th>Giờ làm</th>
              <th>Giờ OT</th>
              <th>Tổng lương (ước tính)</th>
            </tr>
          </thead>
          <tbody>
            ${result.rows
              .map(
                r => `
              <tr>
                <td>${r.name}</td>
                <td>${r.dept || ''}</td>
                <td>${r.days}</td>
                <td>${r.totalHours}</td>
                <td>${r.otHours}</td>
                <td>${r.totalSalary.toLocaleString()} đ</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  devices() {
    const me = Auth.me();
    if (me.role !== Roles.ADMIN) return View.denied();

    const users = DB.users();
    const list = Device.all().sort((a, b) =>
      (b.lastSeen || '').localeCompare(a.lastSeen || '')
    );

    return `
      <div class="card">
        <h3>Thiết bị nhân viên</h3>
        <table class="table mt-2">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Thiết bị</th>
              <th>Hệ điều hành</th>
              <th>Trình duyệt</th>
              <th>Trạng thái</th>
              <th>Lần hoạt động cuối</th>
            </tr>
          </thead>
          <tbody>
            ${
              list.length
                ? list
                    .map(d => {
                      const u = users.find(x => x.id === d.userId);
                      return `
                        <tr>
                          <td>${u?.name || '?'}</td>
                          <td>${d.deviceType}</td>
                          <td>${d.os}</td>
                          <td>${d.browser}</td>
                          <td>${
                            d.status === 'online'
                              ? '<span class="badge ok">Online</span>'
                              : '<span class="badge warn">Offline</span>'
                          }</td>
                          <td>${new Date(d.lastSeen).toLocaleString()}</td>
                        </tr>
                      `;
                    })
                    .join('')
                : `<tr><td colspan="6" class="help">Chưa có thiết bị nào.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;
  },

    // Trong object View
// Trong object View
ai() {
  const me = Auth.me();
  if (!me || me.role !== Roles.ADMIN) return View.denied();

  const conf = AI.getConf ? AI.getConf() : { baseUrl: 'http://127.0.0.1:11434', model: 'llama3.2' };

  return `
    <div class="card chatbox ai-card-full">
      <div class="ai-header">
        <div>
          <h3>🤖 Trợ lý AI Thành Đô</h3>
          <div class="help">Hỏi về KPI, nhân viên, chấm công, tính lương...</div>
        </div>
        <button type="button" class="btn ghost ai-settings-btn" onclick="toggleAIConfigPanel(event)" title="Cấu hình AI">
          ⚙
        </button>
      </div>

      <div id="chatlog" class="chatlog"></div>

      <!-- Typing indicator -->
      <div id="ai_thinking" class="ai-thinking hidden">
        <div class="ai-thinking-avatar">🤖</div>
        <div class="ai-thinking-text">
          Trợ lý AI đang suy nghĩ
          <span class="ai-thinking-dots">
            <span></span><span></span><span></span>
          </span>
        </div>
      </div>

      <form class="form ai-form" onsubmit="return onSendAI(event)">
        <div class="ai-input-wrap">
          <textarea id="ai_input" class="input ai-input" rows="2" placeholder="Nhập câu hỏi của bạn..."></textarea>
          <div class="ai-input-toolbar">
            <div class="ai-quick">
              <button type="button" class="btn" onclick="return quickAsk('Phân tích KPI theo phòng ban tuần này và gợi ý 3 việc ưu tiên.')">Phân tích hệ thống</button>
              <button type="button" class="btn" onclick="return quickAsk('Nhân viên nào có chấm công bất thường 7 ngày gần đây?')">Chấm công</button>
              <button type="button" class="btn" onclick="return quickAsk('Tóm tắt tình hình công việc và deadline sắp tới.')">Công việc</button>
              <button type="button" class="btn" onclick="return quickAsk('Tóm tắt bảng lương tháng này, nêu các trường hợp bất thường.')">KPI</button>
            </div>
            <div class="ai-actions">
              <button type="button" class="btn" onclick="exportAILog()">⬇ Xuất log</button>
              <button type="button" class="btn warn" onclick="clearAIChat()">🧹 Xoá hội thoại</button>
              <button class="btn primary" type="submit">💬 Gửi</button>
            </div>
          </div>
        </div>
      </form>

      <div id="ai_config_panel" class="ai-config-panel hidden" onclick="event.stopPropagation()">
        <h4>Cấu hình AI</h4>
        <div class="form">
          <div>
            <label class="label">Ollama URL</label>
            <input id="ai_base" class="input" value="${conf.baseUrl || ''}" placeholder="http://127.0.0.1:11434" />
          </div>
          <div>
            <label class="label">Model</label>
            <input id="ai_model" class="input" value="${conf.model || ''}" placeholder="llama3.2" />
          </div>
          <div class="actions row" style="justify-content:flex-end;margin-top:6px;">
            <button type="button" class="btn ghost" onclick="toggleAIConfigPanel(event)">Đóng</button>
            <button type="button" class="btn primary" onclick="saveAIConfFromPanel(event)">Lưu</button>
          </div>
        </div>
      </div>
    </div>`;
},



  admin() {
    const me = Auth.me();
    if (me.role !== Roles.ADMIN) return View.denied();

    const users = DB.users();
    const tasks = DB.tasks();
    const att = DB.attendance();

    return `
      <div class="card">
        <h3>Quản trị hệ thống</h3>
        <div class="row">
          <div class="kpi">
            <div>
              <div class="help">Tổng tài khoản</div>
              <strong>${users.length}</strong>
            </div>
          </div>
          <div class="kpi">
            <div>
              <div class="help">Tổng công việc</div>
              <strong>${tasks.length}</strong>
            </div>
          </div>
          <div class="kpi">
            <div>
              <div class="help">Bản ghi chấm công</div>
              <strong>${att.length}</strong>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <div class="help">Sao lưu / khôi phục dữ liệu</div>
          <button class="btn" onclick="exportAllJSON()">⬇ Sao lưu JSON</button>
        </div>
      </div>
    `;
  },

  profile() {
    const me = Auth.me();
    return `
      <div class="card">
        <h3>Hồ sơ cá nhân</h3>
        <form class="form">
          <div>
            <label class="label">Họ tên</label>
            <input class="input" value="${me.name}" disabled>
          </div>
          <div>
            <label class="label">Email</label>
            <input class="input" value="${me.email}" disabled>
          </div>
          <div>
            <label class="label">Vai trò</label>
            <input class="input" value="${
              me.role === Roles.ADMIN ? 'Quản trị' : 'Nhân viên'
            }" disabled>
          </div>
        </form>
      </div>
    `;
  },

  denied() {
    return `
      <div class="card">
        <h3>⛔ Không có quyền truy cập</h3>
        <p class="help">Bạn cần quyền Quản trị để xem mục này.</p>
      </div>
    `;
  }
};
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  localStorage.setItem("td_theme", next);
}
