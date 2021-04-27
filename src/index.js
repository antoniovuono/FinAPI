const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

//Array simulando um banco de dados 
const custumers = [];

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

app.get("/statement", (request, response) => {
	
	const { cpf } = request.headers;

	const customer = custumers.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return response.status(400).json({ error: "Customer not found ! "});
    }

	return response.json(customer.statement);

});


app.listen(3333);