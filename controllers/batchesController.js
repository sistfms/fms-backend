export const getAllBatches = async (req, res) => {
    const conn = req.mysql.promise();
    try {
        let [batches] = await conn.query(`SELECT b.*, d.name as department_name FROM batches b INNER JOIN departments d ON b.department_id = d.id;`);
        res.json(batches);
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}

export const createBatch = async (req, res) => {
    const { name, start_year, end_year, department_id } = req.body;
    
    if(!start_year || !department_id || !end_year || !name){
        return res.status(400).json({message: "Please enter all fields"});
    }
    
    const conn = req.mysql.promise();
    try {

        // Check if department id exists
        let [department] = await conn.query(`SELECT * FROM departments WHERE id = ?`, [department_id]);
        if(department.length == 0){
            return res.status(400).json({
                status: 400,
                message: "Department not found"
            });
        }

        // Check if batch already exists
        let [batch] = await conn.query(`SELECT * FROM batches WHERE start_year = ? AND end_year = ? AND department_id = ?`, [start_year, end_year, department_id]);
        if(batch.length > 0){
            return res.status(400).json({
                status: 400,
                message: "Batch already exists"
            });
        }

        let [result] = await conn.query(`INSERT INTO batches (name, start_year, end_year, department_id) VALUES (?, ?, ?, ?)`, [name, start_year, end_year, department_id]);
        let insertId = result.insertId;
        res.status(201).json({
            status: 201,
            message: "Batch created successfully",
            batch: {
                id: insertId,
                name: name,
                start_year: start_year,
                end_year: end_year,
                department_id: department_id,
                department_name: department[0].name
            }
        });
        
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}

export const getBatchById = async (req, res) => {
    const conn = req.mysql.promise();
    const batchId = req.params.id;
    try {
        let [batch] = await conn.query(`SELECT b.*, d.name as department_name FROM batches b INNER JOIN departments d ON b.department_id = d.id WHERE b.id = ?;`, [batchId]);
        if(batch.length > 0){
            res.json(batch[0]);
        }else{
            res.status(404).json({
                status: 404,
                message: "Batch not found"
            });
        }
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}

export const activateBatch = async (req, res) => {
    const conn = req.mysql.promise();
    const batchId = req.params.id;
    try {
        let [batch] = await conn.query(`SELECT * FROM batches WHERE id = ?`, [batchId]);
        if(batch.length > 0){
            let [result] = await conn.query(`UPDATE batches SET status = ? WHERE id = ?`, ["ACTIVE", batchId]);
            res.json({
                status: 200,
                message: "Batch activated successfully"
            });
        }else{
            res.status(404).json({message: "Batch not found"});
        }
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}

// student Batch Integrations
export const getStudentsByBatchId = async (req, res) => {
    const conn = req.mysql.promise();
    const batchId = req.params.id;
    try {
        let [students] = await conn.query(`SELECT u.name, u.email, s.* FROM students s INNER JOIN users u ON u.id = s.user_id WHERE s.batch_id = ?;`, [batchId]);
        res.json(students);
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}

// Batch Fees Integrations
export const getFeesByBatchId = async (req, res) => {
    const conn = req.mysql.promise();
    const batchId = req.params.id;
    try {
        let [fees] = await conn.query(`SELECT * FROM batch_fees WHERE batch_id = ?`, [batchId]);
        res.json(fees);
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}

// @PATH /api/batches/:id/fees
// @desc Add new batch fees
// @access Private
// @method POST
export const createBatchFee = async (req, res) => {
    const conn = req.mysql.promise();
    const batchId = req.params.id;
    const { name, amount, due_date } = req.body;
    try {
        let [batch] = await conn.query(`SELECT * FROM batches WHERE id = ?`, [batchId]);
        if(batch.length > 0 && batch[0].status == "ACTIVE"){
            let [result] = await conn.query(`INSERT INTO batch_fees (name, amount, due_date, batch_id) VALUES (?, ?, ?, ?)`, [name, amount, due_date, batchId]);
            let insertId = result.insertId;
            res.status(201).json({
                status: 201,
                message: "Batch fee created successfully",
                batch_fee: {
                    id: insertId,
                    name: name,
                    amount: amount,
                    due_date: due_date,
                    batch_id: batchId
                }
            });
        }else{
            if (batch.length == 0) {
                res.status(404).json({
                    status: 404,
                    message: "Batch not found"
                });
            }else{
                res.status(400).json({
                    status: 400,
                    message: "Batch is not active"
                });
            }
        }
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}