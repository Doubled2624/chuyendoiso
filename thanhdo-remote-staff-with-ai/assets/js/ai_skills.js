// assets/js/ai_skills.js
// Chuẩn hóa dữ liệu hệ thống để AI phân tích chính xác

const AISkills = (() => {

  // Tóm tắt nhanh số liệu công việc
  function summarizeTasks(tasks) {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "done").length;
    const inprogress = tasks.filter(t => t.status === "inprogress").length;
    const todo = tasks.filter(t => t.status === "todo").length;

    // Tìm deadline gần nhất
    const upcoming = tasks
      .filter(t => t.due)
      .sort((a, b) => new Date(a.due) - new Date(b.due))
      .slice(0, 3)
      .map(t => ({
        id: t.id,
        title: t.title,
        assignedTo: t.assignedTo,
        due: t.due
      }));

    return { total, done, inprogress, todo, upcoming };
  }

  // Tóm tắt chấm công
  function summarizeAttendance(att) {
    const total = att.length;
    const today = new Date().toISOString().slice(0, 10);

    const todayEntries = att.filter(e => e.date === today).length;

    return { total, todayEntries };
  }

  // Tóm tắt lương
  function summarizePayroll(payrollData) {
    if (!payrollData) return {};

    let sum = 0;
    payrollData.forEach(p => {
      sum += p.total || 0;
    });

    return {
      count: payrollData.length,
      totalPaid: sum
    };
  }

  // Snapshot tổng hợp dữ liệu cho AI
  function buildSnapshot() {
    const users = DB.users();
    const tasks = DB.tasks();
    const att = DB.attendance();
    const payroll = Payroll.calc ? Payroll.calc() : [];

    return {
      timestamp: new Date().toISOString(),

      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        dept: u.dept,
        role: u.role,
        active: u.active
      })),

      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        desc: t.desc,
        assignedTo: t.assignedTo,
        status: t.status,
        due: t.due
      })),

      attendance: att.map(a => ({
        id: a.id,
        userId: a.userId,
        date: a.date,
        checkIn: a.checkIn,
        checkOut: a.checkOut,
        lat: a.lat,
        lng: a.lng
      })),

      payroll: payroll.map(p => ({
        userId: p.userId,
        name: p.name,
        baseSalary: p.baseSalary,
        days: p.days,
        hours: p.hours,
        hoursOT: p.hoursOT,
        total: p.total
      })),

      taskSummary: summarizeTasks(tasks),
      attendanceSummary: summarizeAttendance(att),
      payrollSummary: summarizePayroll(payroll)
    };
  }

  return {
    buildSnapshot
  };
})();
