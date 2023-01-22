import sendEmail from '../config/mail.js';
import { getCustomJwtToken, verifyAndDecodeToken } from '../utils/generateToken.js';
import { hashPassword } from '../utils/passwordUtils.js';

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
    let [student] = await conn.query(`SELECT * FROM students WHERE id = ?`, [req.params.id]);
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

export const getStudentByUserId = async (req, res) => {
  const conn = req.mysql.promise();
  const { user_id } = req.body;
  try {
    const query = `
    SELECT s.id, u.id as user_id, u.name, u.email, s.roll_number, s.batch_id, b.name as batch_name, s.phone_number, s.gender, s.status, b.department_id
    FROM students s
    INNER JOIN batches b ON b.id = s.batch_id
    INNER JOIN users u ON s.user_id = u.id
    WHERE u.role = 'STUDENT' AND u.id = ?;
  `;
    let [student] = await conn.query(query, [user_id]);
    if(student.length === 0) {
      return res.status(404).send({
        status: 404,
        message: "Student not found"
      });
    }
    student = student[0];
    const [departmentName] = await conn.query(`SELECT name FROM departments WHERE id = ?`, [student.department_id]);
    student.department_name = departmentName[0].name;
    res.json(student);
  } catch (err) {
    res.status(500).send({
      status: 500,
      message: "Server Error"
    });
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

    const url = `${process.env.CLIENT_URL}/activate?token=${token}`;
    const message = `
      <h1>SIST FMS</h1>
      <h3>Please Complete Your Account Activation</h3>
      <p>Hi ${name},</p>
      <p>Welcone to SIST, your new roll number is ${roll_number}.</p>
      <p>Click <a href="${url}" target="_blank">here</a> or the link giveb below to activate your account.</p>
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

// @PATH /api/students/getStudentByToken?token=token
export const getStudentByToken = async (req, res) => {
  let conn;
  const token = req.query.token;
  
  if(!token) {
    return res.status(400).send({
      status: "400",
      message: "Invalid token"
    });
  }

  try {
    conn = await req.mysql.promise().getConnection();
    let decoded;
    
    try {
      decoded = await verifyAndDecodeToken(token);
    } catch (err) {
      console.log("err", err)
      return res.status(400).send({
        status: "400",
        message: "Invalid token"
      });
    }

    if(decoded.role !== 'STUDENT' || !decoded.user_id || !decoded.student_id) {
      res.status(400).json({
        status: "400",
        message: "Invalid token"
      });
      res.end();
      return
    }
    req.params.id = decoded.student_id;

    const { user_id, student_id, role } = decoded;

    const query = `
      SELECT s.id, u.id as user_id, u.name, u.email, s.roll_number, s.batch_id, b.name as batch_name, s.phone_number, s.gender, s.status
      FROM students s
      INNER JOIN batches b ON b.id = s.batch_id
      INNER JOIN users u ON s.user_id = u.id
      WHERE u.role = 'STUDENT' AND u.id = ? AND s.id = ?;
    `;

    let [student] = await conn.query(query, [user_id, student_id]);
    
    if(student.length === 0) {
      return res.status(404).send({
        status: "404",
        message: "Student not found"
      });
    }

    student = student[0];
    res.json(student);
    
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "500",
      message: "Server Error"
    });
  }finally {
    conn.release();
  }

}

export const activateStudent = async (req, res) => {
  let conn;
  const { password, token } = req.body;
  if(!token) {
    return res.status(400).send({
      status: "400",
      message: "Invalid token"
    });
  }
  if (!password) {
    return res.status(400).send({
      status: "400",
      message: "Password is required"
    });
  }
  try {
    conn = await req.mysql.promise().getConnection();
    let decoded;
    try {
      decoded = await verifyAndDecodeToken(token);
    } catch (err) {
      return res.status(400).send({
        status: "400",
        message: "Invalid token"
      });
    }

    if(decoded.role !== 'STUDENT' || !decoded.user_id || !decoded.student_id) {
      return res.status(400).send({
        status: "400",
        message: "Invalid token"
      });
    }

    const { user_id, student_id, role } = decoded;
    // check if student exists and if it is in invited status
    const [student] = await conn.query(`SELECT * FROM students WHERE id = ? AND status = ?`, [student_id, 'INVITED']);
    if(student.length === 0) {
      return res.status(400).send({
        status: "400",
        message: "Invalid token"
      });
    }

    await conn.beginTransaction();
    const hashedPassword = await hashPassword(password);
    await conn.query(`UPDATE users SET password = ?, status = ?, email_verified = ? WHERE id = ?`, [hashedPassword, 'ACTIVE' , '1', user_id]);
    await conn.query(`UPDATE students SET status = ? WHERE id = ?`, ['ACTIVE', student_id]);
    await conn.commit();
    res.json({
      status: "200",
      message: "Student activated successfully"
    });
  
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: "500",
      message: "Server Error"
    });
  }finally {
    conn.release();
  }

}



