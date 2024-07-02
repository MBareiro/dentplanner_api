const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { createToken } = require("../utils/create_token");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userRows] = await pool.query(
      `
      SELECT u.*, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `,
      [email]
    );
    const user = userRows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const [loginRows] = await pool.query(
      "SELECT * FROM logins WHERE user_id = ?",
      [user.id]
    );
    const login = loginRows[0];

    if (!login) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, login.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    res.json({
      success: "Login successful",
      token: createToken(user),
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Verificar si el correo electrónico existe en la base de datos
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Correo electrónico no encontrado." });
    }

    const user = rows[0];

    // Generar token único y establecer fecha de vencimiento
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Actualizar en la base de datos (aquí deberías almacenar el token y la fecha de vencimiento)
    await pool.query(
      "UPDATE logins SET reset_password_token = ?, reset_password_expiration = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE user_id = ?",
      [resetToken, user.id]
    );
    console.log(resetToken);
    res.json({
      message: "Se ha generado el token para restablecer su contraseña.",
      token: resetToken,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { new_password } = req.body;
  console.log(token);
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    // Verificar si el token es válido y no ha expirado
    const [rows] = await pool.query(
      "SELECT * FROM logins WHERE user_id = ? AND reset_password_token = ?",
      [decoded.id, token]
    );
    console.log(rows);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Actualizar la contraseña en la base de datos
    await pool.query(
      "UPDATE logins SET password = ?, reset_password_token = NULL, reset_password_expiration = NULL WHERE id = ?",
      [hashedPassword, decoded.id]
    );

    res.json({ message: "Contraseña restablecida con éxito." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al procesar la solicitud." });
  }
};

const changePassword = async (req, res) => {
  const id = req.params.id;
  const { old_password, new_password, confirm_password } = req.body;

  if (new_password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const [results] = await pool.query(
      "SELECT * FROM logins WHERE user_id = ?",
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const login = results[0];
    const passwordMatch = await bcrypt.compare(old_password, login.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE logins SET password = ? WHERE user_id = ?", [
      hashedPassword,
      id,
    ]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { 
  login,
  forgotPassword,
  resetPassword,
  changePassword 
};
