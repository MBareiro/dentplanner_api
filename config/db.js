const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config(); // Load environment variables from .env file

const config = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const pool = mysql.createPool(config);

module.exports = pool;
