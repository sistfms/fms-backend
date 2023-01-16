export const addFees = async(req, res) => {
  const conn = req.mysql.promise();
  const { amount, batchId, name, lastDate } = req.body;
  try {
    let [newFees] = await conn.query(
      `INSERT INTO fees (amount, batchId, name, lastDate) VALUES (?, ?, ?, ?)`,
      [amount, batchId, name, lastDate]
    );
    res.json({
      feesId: newFees.insertId,
      amount: amount,
      batchId: batchId,
      name: name,
      lastDate: lastDate
    });
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
}

export const getFeeDetails = async(req, res) => {
  const conn = req.mysql.promise();
  const feeId = req.params.id;
  try {
    let [feeDetails] = await conn.query(
      `SELECT d.name as department_name, t.* FROM 
      (SELECT bf.*, b.name as batch_name, b.department_id FROM batch_fees bf INNER JOIN batches b ON bf.batch_id = b.id WHERE bf.id = ?) t 
      INNER JOIN departments d ON t.department_id = d.id;`
      , [feeId]);
    if (feeDetails.length == 0) {
      res.status(404).json({
        status: 404,
        message: "Fee not found"
      });
      return;
    }
    res.json(feeDetails[0]);
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
}

// @PATH /fees/:id/report
// @desc Get fee report
// @access Private
// @method GET
export const getFeeReport = async(req, res) => {
  const fee_id = req.params.id;
  const conn = req.mysql.promise();
  try {
    let [fees] = await conn.query('SELECT * FROM batch_fees WHERE id = ?', [fee_id]);
    if (fees.length == 0) {
      res.status(404).json({
        status: 404,
        message: "Fee not found"
      });
      return;
    }
    fees = fees[0];
    let [feePayments] = await conn.query(`SELECT u.name, p.* FROM (SELECT fp.id as payment_id, fp.status as payment_status, fp.payment_date, fp.payment_method, fp.collected_by , s.id as student_id, s.roll_number, s.user_id  FROM fee_payments fp INNER JOIN students s ON fp.student_id = s.id WHERE batch_fee_id = ? AND fp.status ='paid') as p INNER JOIN users u ON p.user_id = u.id;`, [fee_id]);
    let [students] = await conn.query(`SELECT u.name, s.* FROM students s LEFT JOIN users u ON u.id = s.user_id WHERE s.batch_id = ?;`, [fees.batch_id]);
    let feeReport = [];
    for (let i = 0, len = students.length; i < len; i++) {
      let student = students[i];
      let feePayment = feePayments.find((feePayment) => feePayment.student_id == student.id);
      if (feePayment) {
        feeReport.push({
          student: student,
          feePayment: feePayment
        });
      } else {
        feeReport.push({
          student: student,
          feePayment: null
        });
      }
    }
    res.json(feeReport);
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
}