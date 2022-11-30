export const getAllBatches = async (req, res) => {
    const conn = req.mysql.promise();
    try {
        let [batches] = await conn.query(`SELECT * FROM batches`);
        res.json(batches);
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}

export const createBatch = async (req, res) => {
    const conn = req.mysql.promise();
    const { year, department, endYear } = req.body;
    
    if(!year || !department){
        return res.status(400).json({message: "Please enter all fields"});
    }


    let name = department + " "  +year;

    try {
        let [result] = await conn.query(`INSERT INTO batches (name, year, department, endYear, status) VALUES (?, ?, ?, ?, ?)`, [name, year, department, endYear, "deactivated"]);
        let insertId = result.insertId;
        console.log("BatchResult", result);
        res.status(201).json({
            batchId: insertId,
            name: name,
            year: year,
            endYear: endYear,
            status: "deactivated",
            department: department
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
        let [batch] = await conn.query(`SELECT * FROM batches WHERE batchId = ?`, [batchId]);
        if(batch.length > 0){
            res.json(batch[0]);
        }else{
            res.status(404).json({message: "Batch not found"});
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
        let [batch] = await conn.query(`SELECT * FROM batches WHERE batchId = ?`, [batchId]);
        if(batch.length > 0){
            let [result] = await conn.query(`UPDATE batches SET status = ? WHERE batchId = ?`, ["activated", batchId]);
            res.json({message: "Batch activated successfully"});
        }else{
            res.status(404).json({message: "Batch not found"});
        }
    }catch(err){
        res.status(500).send("Server Error");
        console.log(err);
    }
}
