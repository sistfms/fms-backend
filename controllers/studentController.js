import sendEmail from '../config/mail.js';
import { getCustomJwtToken } from '../utils/generateToken.js';

export const getAllStudents = async (req, res) => {
  const conn = req.mysql.promise();
  try {
    const query = `
      SELECT s.id, u.id as user_id, u.name, u.email, s.roll_number, s.batch_id, b.name as batch_name, s.phone_number, s.gender, s.status
      FROM students s
      INNER JOIN batches b ON b.id = s.batch_id
      INNER JOIN users u ON s.user_id = u.id
      WHERE u.role = 'STUDENT';
    `;
    let [students] = await conn.query(query);
    res.json(students);
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
};

export const getStudentById = async (req, res) => {
  const conn = req.mysql.promise();
  try {
    let [student] = await conn.query(`SELECT * FROM students WHERE studentId = ?`, [req.params.id]);
    if(student.length === 0) {
      res.status(404).send("Student not found");
    } else {
      student = student[0];
      res.json(student);
    }
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
};
// @PATH /api/students
// @METHOD POST
// @DESC Create a new student
export const addStudent = async (req, res) => {
  let conn;
  try {
    conn = await req.mysql.promise().getConnection();
    await conn.beginTransaction();
    const { name, email, batch_id, gender, phone_number } = req.body;

    // Check if user already exists
    let [user] = await conn.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if(user.length > 0) {
     return res.status(400).send({
        status: "400",
        message: "User already exists"
     });
    }

    // Create user
    let [result] = await conn.query(`INSERT INTO users (name, email, role, email_verified) VALUES (?, ?, ?, ?)`, [name, email, 'STUDENT', 0]);
    const user_id = result.insertId;

    // Build roll number
    let [total_students] = await conn.query(`SELECT COUNT(*) as count FROM students WHERE batch_id = ?`, [batch_id]);
    total_students = total_students[0].count;
    
    let [batch] = await conn.query(`SELECT * FROM batches WHERE id = ?`, [batch_id]);
    batch = batch[0];

    let roll_number = batch.name;
    if (total_students < 10) {
      roll_number += '0' + (Number(total_students) + 1);
    } else {
      roll_number += (Number(total_students) + 1);
    }

    // Create student
    [result] = await conn.query(`INSERT INTO students (user_id, roll_number, batch_id, gender, phone_number, status) VALUES (?, ?, ?, ?, ?, ?)`, [user_id, roll_number, batch_id, gender, phone_number, 'INVITED']);
    const student_id = result.insertId;
    // Send email
    const token = getCustomJwtToken({ user_id, student_id, role: 'STUDENT' }, '24h');

    const url = `${process.env.CLIENT_URL}/students/activate?token=${token}`;
    const message = `
      <h1>Please Complete Your Account Activation</h1>
      <p>Click the link below to activate your account</p>
      <a href="${url}" target="_blank">${url}</a>
    `;
    sendEmail({
      to: email,
      subject: "Complete your account activation",
      content: message
    });

    conn.commit();
    res.json({
      status: "200",
      message: "Student added successfully"
    });
    
  } catch (err) {
    await conn.rollback();
    res.status(500).send("Server Error");
    console.log(err);
  }
};
