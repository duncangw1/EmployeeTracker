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
  runPrompt();
});

// Function to start inquirer prompt
function runPrompt() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees By Department",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department",
        "Quit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View All Employees":
          viewAllEmp();
          break;

        case "View All Employees By Department":
          viewAllEmpByDep();
          break;

        case "Add Employee":
          // addEmp();
          break;

        case "Update Employee Role":
          // updateEmpRole();
          break;

        case "View All Roles":
          viewAllRoles();
          break;

        case "Add Role":
          // addRole();
          break;

        case "View All Departments":
          viewAllDep();
          break;

        case "Add Department":
          // addDep();
          break;

        case "Quit":
          console.log("Goodbye!");
          connection.end();
      }
    });
}

// Function to view all employees
function viewAllEmp() {
  let query =
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department, role.salary, CONCAT(emp.first_name, ' ', emp.last_name) AS manager FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id LEFT JOIN employee emp ON employee.manager_id = emp.id;";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    runPrompt();
  });
}

// Function to view all employees by department
function viewAllEmpByDep() {
  inquirer
    .prompt({
      name: "department",
      type: "list",
      message: "Which department would you like to see employees for?",
      choices: ["Sales", "Engineering", "Finance", "Legal"],
    })
    .then((answer) => {
      let query =
        "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE ? ORDER BY employee.id;";
      connection.query(query, { department: answer.department }, (err, res) => {
        if (err) throw err;
        console.log("\n");
        console.table(res);
        runPrompt();
      });
    });
}

// Function to add employee

// Function to update employee role

// Function to view all roles
function viewAllRoles() {
  let query = "SELECT title, salary, department_id FROM role";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    runPrompt();
  });
}

// Function to add role

// Function to view all departments
function viewAllDep() {
  let query = "SELECT * FROM department";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    runPrompt();
  });
}

// Function to add department
