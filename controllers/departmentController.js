// @PATH    /departments
// @METHOD  GET
// @DESC    Get all departments
export const getAllDepartments = async (req, res) => {
    const conn = req.mysql.promise();
    try {
        let [departments] = await conn.query(`SELECT * FROM departments`);
        res.json(departments);
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}

// @PATH    /departments
// @METHOD  POST
// @DESC    Create a new department
export const createDepartment = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Department Name is required." });
  }

  const conn = req.mysql.promise();
  try {
    let [result] = await conn.query(
      `INSERT INTO departments (name) VALUES (?)`,
      [name]
    );
    let insertId = result.insertId;
    res.status(201).json({
      status: 201,
      message: "Department created successfully.",
      department: {
        id: insertId,
        name: name,
      }
    });
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
}

// @PATH    /departments/:id
// @METHOD  GET
// @DESC    Get a department by ID
export const getDepartmentById = async (req, res) => {
  const departmentId = req.params.id;
  if (!departmentId) {
    return res.status(400).json({ message: "Department ID is required." });
  }
  const conn = req.mysql.promise();
  try {
    let [department] = await conn.query(
      `SELECT * FROM departments WHERE id = ?`,
      [departmentId]
    );
    if (department.length > 0) {
      res.json(department[0]);
    } else {
      res.status(404).json({ 
        status: 404,
        message: "Department not found" 
      });
    }
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
}
