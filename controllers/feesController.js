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