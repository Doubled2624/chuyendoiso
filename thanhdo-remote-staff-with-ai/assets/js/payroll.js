// assets/js/payroll.js
// Tính lương cơ bản từ chấm công

const Payroll = (() => {
  function diffHours(startIso, endIso) {
    if (!startIso || !endIso) return 0;
    const s = new Date(startIso).getTime();
    const e = new Date(endIso).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return 0;
    return (e - s) / (1000 * 60 * 60);
  }

  function compute(fromDate, toDate) {
    const settings = DB.payrollSettings();
    const baseSalary = settings.defaultBaseSalary || 10000000;
    const workHoursPerDay = settings.workHoursPerDay || 8;
    const otMul = settings.otMultiplier || 1.5;

    const users = DB.users().filter(u => u.role === Roles.EMPLOYEE);
    const att = DB.attendance();

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const rows = users.map(u => {
      const logs = att.filter(a => {
        if (a.userId !== u.id) return false;
        const d = new Date(a.date);
        return d >= from && d <= to;
      });

      let totalHours = 0;
      logs.forEach(a => {
        totalHours += diffHours(a.checkIn, a.checkOut);
      });

      const days = logs.length;
      const normalHours = Math.min(totalHours, days * workHoursPerDay);
      const otHours = Math.max(0, totalHours - normalHours);

      const perHour = baseSalary / (22 * workHoursPerDay);
      const payNormal = normalHours * perHour;
      const payOT = otHours * perHour * otMul;
      const total = Math.round(payNormal + payOT);

      return {
        userId: u.id,
        name: u.name,
        dept: u.dept,
        days,
        totalHours: +totalHours.toFixed(2),
        normalHours: +normalHours.toFixed(2),
        otHours: +otHours.toFixed(2),
        totalSalary: total
      };
    });

    return { rows, baseSalary, workHoursPerDay, otMul };
  }

  return { compute };
})();
