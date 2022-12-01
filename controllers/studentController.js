export const getAllStudents = async (req, res) => {
  const conn = req.mysql.promise();
  try {
    let [students] = await conn.query(`SELECT * FROM students`);
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

export const addStudent = async (req, res) => {
  const conn = req.mysql.promise();
  const { name, rollNumber, email, batchId } = req.body;
  try {
    let [newStudent] = await conn.query( 
      `INSERT INTO students (name, rollNumber, batchId, email) VALUES (?, ?, ?, ?)`, 
      [name, rollNumber, batchId, email]
    );
    res.json({
      studentId: newStudent.insertId,
      name: name,
      rollNumber: rollNumber,
      batchId: batchId,
      email: email
    });
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
};
