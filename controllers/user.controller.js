const bcrypt = require("bcrypt");
const pool = require("../config/db");

const getUsers = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT u.*, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
    `);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query(`
      SELECT u.*, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [id]);
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await pool.query("DELETE FROM logins WHERE user_id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createUser = async (req, res) => {
  const { first_name, last_name, email, password, role_id } = req.body;
/*   const password = generateRandomPassword();
 */  const hashedPassword = await bcrypt.hash(password, 10);

  const sqlUser = `
    INSERT INTO users (first_name, last_name, email, role_id)
    VALUES (?, ?, ?, ?)
  `;
  const valuesUser = [
    first_name,
    last_name,
    email,
    role_id,
  ];

  try {
    const [resultUser] = await pool.query(sqlUser, valuesUser);

    const sqlLogin = `
      INSERT INTO logins (user_id, password)
      VALUES (?, ?)
    `;
    const valuesLogin = [
      resultUser.insertId,
      hashedPassword,
    ];

    await pool.query(sqlLogin, valuesLogin);    

    res.json({
      message: "User created successfully",
      id: resultUser.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Duplicate entry for email" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

const updateUserById = async (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, email, role_id } = req.body;

  const sql = `
    UPDATE users 
    SET first_name = ?, last_name = ?, email = ?, role_id = ?
    WHERE id = ?
  `;
  const values = [first_name, last_name, email, role_id, id];

  try {
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getUsers,
  getUserById,
  deleteUserById,
  createUser,
  updateUserById,
};
