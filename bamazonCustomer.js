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
    //console.log("Successfully connecting to mysql");

    loadProducts();
});

function loadProducts() {
    let query = 'SELECT * FROM products';
    connection.query(query, function (err, res) {
        if (err) {
            console.error('Select error: ' + query + ' ' + err.stack);
            process.exit();
        }

        // show the products
        console.table(res);

        // prompt customer for product
        promptCustomerForItem(res);

        //process.exit();
    });
}

function promptCustomerForItem(inventory) {
    inquirer.prompt([{
        type: 'input',
        name: 'id',
        message: 'What is the ID of the item you would like to purchase? (Enter q to exit)',
    }]).then(function (val) {
        if (val.id == 'q') {
            process.exit();
        }

        let choiceId = parseInt(val.id);
        let product = checkInventory(choiceId, inventory);
        if (product) {
            promptCustomerForQuantity(product);
        } else {
            console.log('That item is not in our inventory');
            loadProducts();
        }
    });
}

function checkInventory(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id === choiceId) {
            return inventory[i];
        }
    }

    return null;
}

function promptCustomerForQuantity(product) {
    inquirer.prompt([{
        type: 'input',
        name: 'quantity',
        message: 'How many units of the product you would like to buy?',
    }]).then(function (val) {
        console.log('quantity: ' + val.quantity);

        let quantity = parseInt(val.quantity);
        if (quantity > product.stock_quantity) {
            console.log('Insufficient quantity!');
            loadProducts();
        } else {
            makePurchase(product, quantity);

            //process.exit();
        }
    })
}

function makePurchase(product, quantity) {
    connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?',
        [quantity, product.item_id],
        function (err, res) {
            if (err) {
                console.error('Update error: ' + err.stack);
                process.exit();
            }

            console.log('You bought: ' + quantity);
            console.log('Your total cost: ' + quantity * product.price);
            loadProducts();
        }
    )
}

