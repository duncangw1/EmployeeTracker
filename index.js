// Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");
const consoleTable = require("console.table");
const dotEnv = require("dotenv").config();

// Connection to DB
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.PASSWORD,
  database: "empTrack_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected as ID: " + connection.threadId);
  //   runPrompt();
});
