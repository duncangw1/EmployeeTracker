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
          addEmp();
          break;

        case "Update Employee Role":
          updateEmpRole();
          break;

        case "View All Roles":
          viewAllRoles();
          break;

        case "Add Role":
          addRole();
          break;

        case "View All Departments":
          viewAllDep();
          break;

        case "Add Department":
          addDep();
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
function addEmp() {
  inquirer
    .prompt([
      {
        name: "newFirstName",
        type: "input",
        message: "What is the employee's first name?",
      },
      {
        name: "newLastName",
        type: "input",
        message: "What is the employee's last name?",
      },
      {
        name: "newChooseRoleId",
        type: "input",
        message: "What is the employee's role id number?",
      },
      {
        name: "newChooseManagerId",
        type: "input",
        message: "What is the manager's id number? (Type 'null' if n/a)",
      },
    ])
    .then((answer) => {
      if (answer.newChooseManagerId === "null") {
        let query = "INSERT INTO employee SET ?";
        connection.query(
          query,
          {
            first_name: answer.newFirstName,
            last_name: answer.newLastName,
            role_id: answer.newChooseRoleId,
            manager_id: null,
          },
          (err, res) => {
            if (err) {
              console.log("Try again with a valid role id and manager id");
              addEmp();
            } else {
              console.log("Successfully added new employee to the database!");
              runPrompt();
            }
          }
        );
      } else {
        let query = "INSERT INTO employee SET ?";
        connection.query(
          query,
          {
            first_name: answer.newFirstName,
            last_name: answer.newLastName,
            role_id: answer.newChooseRoleId,
            manager_id: answer.newChooseManagerId,
          },
          (err, res) => {
            if (err) {
              console.log("Try again with a valid role id and manager id");
              addEmp();
            } else {
              console.log("Successfully added new employee to the database!");
              runPrompt();
            }
          }
        );
      }
    });
}

// Function to update employee role
function updateEmpRole() {
  let query1 =
    "SELECT employee.last_name, employee.role_id, role.id, role.title FROM employee INNER JOIN role ON employee.role_id = role.id";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "chooseEmp",
          type: "list",
          message: "Choose an employee to update their role (by last name):",
          choices: function () {
            let empArray = [];
            for (let i = 0; i < res.length; i++) {
              empArray.push(res[i].last_name);
            }
            return empArray;
          },
        },
        {
          name: "chooseRole",
          type: "list",
          message: "Choose a role to update to:",
          choices: function () {
            let roleArray = [];
            for (let i = 0; i < res.length; i++) {
              roleArray.push(res[i].id + ": " + res[i].title);
            }
            return roleArray;
          },
        },
      ])
      .then((answer) => {
        let roleId = answer.chooseRole.charAt(0);
        let query2 = "UPDATE employee SET ? WHERE ?";
        connection.query(
          query2,
          [{ role_id: roleId }, { last_name: answer.chooseEmp }],
          (err, res) => {
            if (err) throw err;
            console.log("Successfully updated employee's role!");
            runPrompt();
          }
        );
      });
  });
}

// Function to view all roles
function viewAllRoles() {
  let query = "SELECT id AS role_id, title, salary, department_id FROM role";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    runPrompt();
  });
}

// Function to add role
function addRole() {
  let query1 = "SELECT * FROM department";
  connection.query(query1, (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "newRole",
          type: "input",
          message: "Enter the name for the new role:",
        },
        {
          name: "newSalary",
          type: "input",
          message: "Enter the salary for the new role (numbers only):",
        },
        {
          name: "depList",
          type: "list",
          choices: function () {
            let depArray = [];
            for (let i = 0; i < res.length; i++) {
              depArray.push(res[i].department);
            }
            return depArray;
          },
        },
      ])
      .then((answer) => {
        let depId;
        for (let j = 0; j < res.length; j++) {
          if (res[j].department == answer.depList) {
            depId = res[j].id;
          }
        }
        let query2 = "INSERT INTO role SET ?";
        connection.query(
          query2,
          {
            title: answer.newRole,
            salary: answer.newSalary,
            department_id: depId,
          },
          (err, res) => {
            if (err) throw err;
            console.log("Successfully added new role to the database!");
            runPrompt();
          }
        );
      });
  });
}

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
function addDep() {
  inquirer
    .prompt([
      {
        name: "newDep",
        type: "input",
        message: "Enter the new department name:",
      },
    ])
    .then((answer) => {
      let query = "INSERT INTO department SET ?";
      connection.query(query, { department: answer.newDep }, (err, res) => {
        if (err) throw err;
        console.log("Successfully added new department!");
        runPrompt();
      });
    });
}
