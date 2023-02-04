export const getStats = async (req, res) => {
  try{
    let conn = await req.mysql.promise();
    let [activeStudents] = await conn.query(`SELECT COUNT(*) AS active_students FROM students WHERE status = 'ACTIVE';`);
    let [inactiveStudents] = await conn.query(`SELECT COUNT(*) AS inactive_students FROM students WHERE status != 'ACTIVE';`);
    let [totalDepartments] = await conn.query(`SELECT COUNT(*) AS total_departments FROM departments;`);
    let [totalBatches] = await conn.query(`SELECT COUNT(*) AS total_batches FROM batches;`);
    let [totalPayments] = await conn.query(`SELECT SUM(amount) AS total_payment FROM fee_payments WHERE status = 'captured';`);
    let [totalCashPayments] = await conn.query(`SELECT COALESCE (SUM(amount), 0) AS total_cash_payment FROM fee_payments WHERE status = 'captured' AND payment_method = 'cash';`);
    let [totalOnlinePayments] = await conn.query(`SELECT COALESCE(SUM(amount), 0) AS total_online_payment FROM fee_payments WHERE status = 'captured' AND payment_method = 'online';`);

    res.json({
      active_students: activeStudents[0].active_students,
      inactive_students: inactiveStudents[0].inactive_students,
      total_departments: totalDepartments[0].total_departments,
      total_batches: totalBatches[0].total_batches,
      total_payment: totalPayments[0].total_payment,
      total_cash_payment: totalCashPayments[0].total_cash_payment,
      total_online_payment: totalOnlinePayments[0].total_online_payment
    });
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
}