let mysql = require('mysql');
let inquirer = require('inquirer');
require('console.table');

// initialize connection
let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazondb',
    insecureAuth: true
});

// test connection
connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log("Successfully connecting to mysql");

    menuOptions();
});

function menuOptions() {
    const choices = [
        {
            option: 'View Products for Sale',
            action: function () {
                viewProductsForSale();
            }
        },
        {
            option: 'View Low Inventory',
            action: function () {
                viewLowInventory();
            }
        },
        {
            option: 'Add to Inventory',
            action: function () {
                addInventory();
            }
        },
        {
            option: 'Add New Product',
            action: function () {
                addProduct();
            }
        },
        {
            option: 'Quit',
            action: function () {
                process.exit();
            }
        }
    ];

    var options = [];
    choices.forEach(choice => {
        options.push(choice.option);
    })

    inquirer.prompt([{
        type: 'rawlist',
        name: 'theme',
        message: 'Please select the item no.',
        choices: options
    }]).then(function (val) {
        choices.forEach(choice => {
            if (choice.option == val.theme) {
                choice.action();
                //process.exit();
            }
        })
    });
}

function viewProductsForSale() {
    let query = 'SELECT * FROM products';
    connection.query(query, function (err, res) {
        if (err) {
            console.error('Select error: ' + query + ' ' + err.stack);
            process.exit();
        }

        // show the products
        console.table(res);

        menuOptions();
    });
}

function viewLowInventory() {
    let query = 'SELECT * FROM products WHERE stock_quantity < 5';
    connection.query(query, function (err, res) {
        if (err) {
            console.error('Select error: ' + query + ' ' + err.stack);
            process.exit();
        }

        // show the products
        console.table(res);

        menuOptions();
    });
}

function addInventory() {
    let query = 'SELECT * FROM products';
    connection.query(query, function (err, res) {
        if (err) {
            console.error('Select error: ' + query + ' ' + err.stack);
            process.exit();
        }

        // show the products
        console.table(res);

        var questions = [
            {
                type: 'input',
                name: 'itemNo',
                message: "What item no do you want to add to your inventory?"
            },
            {
                type: 'input',
                name: 'inventoryAdded',
                message: "How many do you want to add?"
            }
        ];

        inquirer.prompt(questions).then(answers => {
            let query = 'UPDATE products SET stock_quantity = stock_quantity + ' + answers.inventoryAdded +
                ' WHERE item_id = ' + answers.itemNo;
            connection.query(query, function (err, res) {
                if (err) {
                    console.error('Select error: ' + query + ' ' + err.stack);
                    process.exit();
                }

                viewProductsForSale();
            });
        });
    });
}

function addProduct() {
    let query = 'SELECT * FROM products';
    connection.query(query, function (err, res) {
        if (err) {
            console.error('Select error: ' + query + ' ' + err.stack);
            process.exit();
        }

        // show the products
        console.table(res);

        var questions = [
            {
                type: 'input',
                name: 'productName',
                message: "What is the name of the product?"
            },
            {
                type: 'input',
                name: 'departmentName',
                message: "What is the name of the department?"
            },
            {
                type: 'input',
                name: 'price',
                message: "What is the price of the product?"
            },
            {
                type: 'input',
                name: 'stockQuantity',
                message: "What is the quantity of the product in store?"
            }
        ];

        inquirer.prompt(questions).then(answers => {
            let query = 'INSERT products (product_name, department_name, price, stock_quantity) VALUES (\'' +
                answers.productName + '\',\'' +
                answers.departmentName + '\',' + answers.price + ',' +
                answers.stockQuantity + ')';

            connection.query(query, function (err, res) {
                if (err) {
                    console.error('Select error: ' + query + ' ' + err.stack);
                    process.exit();
                }

                viewProductsForSale();
            });
        });
    });
}