// assets/js/data.js
// Mô phỏng CSDL phía client bằng localStorage

const DB = (() => {
  const K_USERS = 'td_users';
  const K_TASKS = 'td_tasks';
  const K_ATT = 'td_attendance';
  const K_PAYROLL_SETTINGS = 'td_payroll_settings';
  const K_PAYROLL_RUNS = 'td_payroll_runs';

  function load(key, def) {
    return Storage.loadJSON(key, def);
  }

  function save(key, value) {
    Storage.saveJSON(key, value);
  }

  return {
    // ===== Users =====
    users() {
      return load(K_USERS, []);
    },
    saveUsers(list) {
      save(K_USERS, list);
    },

    // ===== Tasks =====
    tasks() {
      return load(K_TASKS, []);
    },
    saveTasks(list) {
      save(K_TASKS, list);
    },

    // ===== Attendance =====
    attendance() {
      return load(K_ATT, []);
    },
    saveAttendance(list) {
      save(K_ATT, list);
    },

    // ===== Payroll =====
    payrollSettings() {
      return load(K_PAYROLL_SETTINGS, {});
    },
    savePayrollSettings(v) {
      save(K_PAYROLL_SETTINGS, v);
    },

    payrollRuns() {
      return load(K_PAYROLL_RUNS, []);
    },
    savePayrollRuns(v) {
      save(K_PAYROLL_RUNS, v);
    },

    // ===== Seed dữ liệu mẫu =====
    initSeed() {
      const users = this.users();
      if (!users.length) {
        const admin = {
          id: 'u_admin',
          name: 'Quản trị hệ thống',
          email: 'admin@thanhdo.local',
          password: 'admin123',
          role: Roles.ADMIN,
          dept: 'Nhân sự',
          active: true
        };

        const nvA = {
          id: 'u_a',
          name: 'Nhân viên A',
          email: 'a@thanhdo.local',
          password: '123456',
          role: Roles.EMPLOYEE,
          dept: 'Kỹ thuật',
          active: true
        };

        const nvB = {
          id: 'u_b',
          name: 'Nhân viên B',
          email: 'b@thanhdo.local',
          password: '123456',
          role: Roles.EMPLOYEE,
          dept: 'Kinh doanh',
          active: true
        };

        this.saveUsers([admin, nvA, nvB]);
      }

      if (!this.tasks().length) {
        this.saveTasks([]);
      }

      if (!this.attendance().length) {
        this.saveAttendance([]);
      }

      if (!Object.keys(this.payrollSettings() || {}).length) {
        this.savePayrollSettings({
          defaultBaseSalary: 10000000,
          workHoursPerDay: 8,
          otMultiplier: 1.5
        });
      }

      if (!this.payrollRuns().length) {
        this.savePayrollRuns([]);
      }
    }
  };
})();
