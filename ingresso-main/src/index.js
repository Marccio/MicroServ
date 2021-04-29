const express = require('express');
const app = express();
app.use(express.json());
const axios = require('axios');

const ingressosPorClienteId = {};
const {
    v4: uuidv4
} = require('uuid');

const funcoes = {
    CascataDelClienteIngresso: (dados) => {
        console.log("Cliente possuia ingressos quando apagado.")
        delete ingressosPorClienteId[dados.id];
    }
};

app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (erro) {}
    res.status(200).send({ msg: "ok" });
});

app.post('/clientes/:id/ingressos', async(req, res) => {
    const idIngr = uuidv4();
    const {
        descricao
    } = req.body;
    const ingressosDoCliente =
        ingressosPorClienteId[req.params.id] || [];
    ingressosDoCliente.push({
        id: idIngr,
        descricao,
        clienteId: req.params.id
    });
    ingressosPorClienteId[req.params.id] =
        ingressosDoCliente;
    await axios.post('http://localhost:10000/eventos', {
        tipo: "IngressoCriado",
        dados: {
            id: idIngr,
            descricao,
            clienteId: req.params.id
        }
    })
    res.status(201).send(ingressosDoCliente);
});

app.get('/clientes/:id/ingressos', (req, res) => {
    res.send(ingressosPorClienteId[req.params.id] || []);

});

app.get('/ingressos', (req, res) => {
    res.send(ingressosPorClienteId || []);
});

app.delete('/clientes/:id/ingressos', (req, res) => {
    const idDeletar = req.params.id;
    const length = ingressosPorClienteId[req.params.id].length
    ingressosPorClienteId[req.params.id].splice(length - 1, 1)
    axios.post("http://localhost:10000/eventos", {
        tipo: "IngressoDeletado",
        dados: idDeletar
    });
    res.send(ingressosPorClienteId[req.params.id] || []);
});

app.listen(5000, (() => {
    console.log('Ingressos. Porta 5000');
}));