const { request, response } = require('express');
const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

//Array simulando um banco de dados 
const custumers = [];

//Middleware
function verifyIfExistsAccountCPF(request, response, next) {

    const { cpf } = request.headers;

	const customer = custumers.find((customer) => customer.cpf === cpf);

    //Validation: if customer exists

    if(!customer) {
        return response.status(400).json({ error: "Customer not found ! "});
    }

    request.customer = customer;

    return next();
    
}

//Function get balance:

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0)

    return balance;
}

// Create account method
app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    //Validation: if CPF already exists:

    const customerAlreadyExists = custumers.some((customer) => customer.cpf === cpf);

    if(customerAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!"});
    }

    custumers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();
});

// List extract
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
	
    const { customer } = request;

	return response.json(customer.statement);

});

//Deposit:
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
    
});

//Withdral

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {

        const { amount } = request.body;
        const { customer } = request;

        const balance = getBalance(customer.statement);

        if(balance < amount) {
            return response.status(400).json({ error: "Insufficient fund!"});
        }

        const statementOperation = {
            amount,
            created_at: new Date(),
            type: "debito"
        };

        customer.statement.push(statementOperation);

        return response.status(201).send();

});




app.listen(3333);