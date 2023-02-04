import Razorpay from "razorpay";
import crypto from "crypto";
import { v4 as uuidV4 } from "uuid";
import moment from "moment";

export const cashEntry = async (req, res) => {
  const { student_id, fee_id, collected_by} = req.body;
  if (!student_id || !fee_id || !collected_by) {
    return res.status(400).send({
      status: "400",
      message: "Invalid request"
    });
  }

  let conn;
  try {
    conn = await req.mysql.promise();
    // Find existing fee payment
    let [feePayment] = await conn.query(`SELECT * FROM fee_payments WHERE batch_fee_id = ? AND student_id = ?;`, [fee_id, student_id]);
    if (feePayment.length > 0 && feePayment[0].status === 'captured') {
      return res.status(400).send({
        status: "400",
        message: "Fee already paid"
      });
    }

    const payment_date = moment().format("YYYY-MM-DD");
    if (feePayment.length > 0) {
      await conn.query(`UPDATE fee_payments SET collected_by = ?, status = ?, payment_method = ?, payment_date = ? WHERE id = ?;`, [collected_by, 'captured', 'cash' ,feePayment[0].id, payment_date]);
      return res.status(200).send({
        status: "200",
        message: "Fee payment updated"
      });
    }else{
      let [feeDetails] = await conn.query(`SELECT * FROM batch_fees WHERE id = ?;`, [fee_id]);
      if (feeDetails.length === 0) {
        return res.status(404).send({
          status: "404",
          message: "Fee not found"
        });
      }
      feeDetails = feeDetails[0];
      // generate Unique ID
      // If fee payment does not exist, create it
      await conn.query(`INSERT INTO fee_payments (batch_fee_id, amount, student_id, collected_by, status, payment_method, razorpay_order_id, razorpay_payment_id, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`, [fee_id , feeDetails.amount, student_id, collected_by, 'captured', 'cash', "", "", payment_date]);
      return res.status(200).send({
        status: "200",
        message: "Fee payment created"
      });
    }

    res.send(400, {
      status: "400",
      message: "Invalid request"
    })

  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "500",
      message: "Server Error"
    });
  }
};

export const getFeePaymentDetails = async(req, res) => {
  const { user_id, batch_fee_id } = req.body;
  if (!user_id || !batch_fee_id) {
    return res.status(400).send({
      status: "400",
      message: "Invalid request"
    });
  }
  let conn;
  try {
    conn = await req.mysql.promise();
    const studentQuery = `SELECT s.id, u.id as user_id, u.name, u.email, s.roll_number, s.batch_id, b.name as batch_name, s.phone_number, s.gender, s.status, b.department_id
    FROM students s
    INNER JOIN batches b ON b.id = s.batch_id
    INNER JOIN users u ON s.user_id = u.id
    WHERE u.role = 'STUDENT' AND u.id = ?;`;
    let [student_details] = await conn.query(studentQuery, [user_id]);
    let [feeDetails] = await conn.query(`SELECT * FROM batch_fees WHERE id = ?;`, [batch_fee_id]);
    if (student_details.length === 0 || feeDetails.length === 0) {
      return res.status(400).send({
        status: "400",
        message: "Invalid request"
      });
    }
    let [feePayment] = await conn.query(`SELECT * FROM fee_payments WHERE batch_fee_id = ? AND student_id = ?;`, [batch_fee_id, student_details[0].id]);
    let hasFeePaymentEntry = feePayment.length > 0 ? true : false;
    let isPaid = hasFeePaymentEntry && feePayment[0].status == 'captured' ? true : false;
    res.json({
      student_details: student_details[0],
      fee_details: feeDetails[0],
      payment_details: feePayment.length > 0 ? feePayment[0] : null,
      hasPaymentEntry: hasFeePaymentEntry,
      isPaid: isPaid
    })

  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }

};

export const getOrderId = async (req, res) => {
  const { user_id, batch_fee_id } = req.body;
  if (!user_id || !batch_fee_id) {
    return res.status(400).send({
      status: "400",
      message: "Invalid request"
    });
  }
  let conn;
  try {
    conn = await req.mysql.promise();
   
    let [student_details] = await conn.query(`SELECT * FROM students WHERE user_id = ?;`, [user_id]);
    if (student_details.length === 0) {
      return res.status(400).send({
        status: "400",
        message: "Invalid request"
      });
    }

    let [feeDetails] = await conn.query(`SELECT * FROM batch_fees WHERE id = ?;`, [batch_fee_id]);
    if (feeDetails.length === 0) {
      return res.status(400).send({
        status: "400",
        message: "Invalid request"
      });
    }
    feeDetails = feeDetails[0];

    let [feePayment] = await conn.query(`SELECT * FROM fee_payments WHERE batch_fee_id = ? AND student_id = ?;`, [batch_fee_id, student_details[0].id]);
    if (feePayment.length > 0 && feePayment[0].razorpay_order_id) {
      return res.status(200).send(feePayment[0]);
    }
   
    const options = {
      amount: feeDetails.amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_" + "bf_" + batch_fee_id + "_s_" + student_details[0].id,
    }
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_TEST_KEY_ID,
      key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
    });
    const order = await razorpayInstance.orders.create(options);
    
    if (feePayment.length === 0) 
      conn.query(`INSERT INTO fee_payments (student_id, batch_fee_id, amount, razorpay_order_id) VALUES (?, ?, ?, ?);`, [student_details[0].id, batch_fee_id, feeDetails.amount, order.id]);
    else if (feePayment.length > 0 && feePayment[0].razorpay_order_id === null)
      conn.query(`UPDATE fee_payments SET razorpay_order_id = ? WHERE id = ?;`, [order.id, feePayment[0].id]);
    
    let [paymentDetails] = await conn.query(`SELECT * FROM fee_payments WHERE batch_fee_id = ? AND student_id = ?;`, [batch_fee_id, student_details[0].id]);
    res.status(200).send(paymentDetails[0]);
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
};

export const updateStatusHook = async (req, res) => {
  console.log("Request received from Razorpay");
  res.status(200).send("OK");
  console.log("Response sent to Razorpay");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(payload);
  const computedSignature = hmac.digest("hex");

  if (signature === computedSignature) {
    const payment = req.body.payload.payment.entity;
    let conn;
    try {
      conn = await req.mysql.promise();
      let acquirer_data = payment.acquirer_data;
      if(acquirer_data){
        acquirer_data = JSON.stringify(acquirer_data);
        console.log(acquirer_data);
        await conn.query(`UPDATE fee_payments SET razorpay_payment_id = ?, status = ?, acquirer_data = ?, payment_method = 'online', payment_date = NOW() WHERE razorpay_order_id = ?;`, [payment.id, payment.status, acquirer_data, payment.order_id]);
      }else{
        console.log("No acquirer data");
        await conn.query(`UPDATE fee_payments SET razorpay_payment_id = ?, status = ?, payment_method = 'online', payment_date = NOW() WHERE razorpay_order_id = ?;`, [payment.id, payment.status, payment.order_id]);
      }
    } catch (err) {
      console.log(err);
    } 
  } else {
    console.log("Invalid signature");
  }
}

export const getAllPaymentsByOrderId = async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) {
    return res.status(400).send({
      status: "400",
      message: "Invalid request"
    });
  }

  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_TEST_KEY_ID,
    key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
  });

  try {
    const payments = await razorpayInstance.orders.fetchPayments(order_id);
    res.status(200).send(payments);
  } catch (err) {
    res.status(500).send({
      status: "500",
      message: "Server Error"
    });
    console.log(err);
  }
}