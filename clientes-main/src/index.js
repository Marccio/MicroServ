const express = require('express');
const app = express();
app.use(express.json());
const axios = require("axios");
const clientes = {};
contador = 0;

const funcoes = {
    ClienteClassificado: (cliente) => {
        clientes[cliente.contador] = cliente;

        axios.post("http://localhost:10000/eventos", {
            tipo: "ClienteCriado",
            dados: {
                contador,
                nome,
                endereco,
                idade,
                status,
                qtd
            },
        });
    },

    CompraIngresso: (dados) => {
        clientes[dados.id].qtd = dados.qtd
    }
}

app.get('/clientes', (req, res) => {
    res.send(clientes);
});

app.post('/clientes', async(req, res) => {
    contador++;
    const {
        nome,
        endereco,
        idade
    } = req.body;
    clientes[contador] = {
        contador,
        nome,
        endereco,
        idade,
        status = "aguardando",
        qtd = 0
    }
    await axios.post("http://localhost:10000/eventos", {
        tipo: "ClienteClassificar",
        dados: {
            contador,
            nome,
            endereco,
            idade,
            status = "aguardando",
            qtd = 0
        },
    });
    res.status(201).send(clientes[contador]);
});

app.delete('/clientes/:id', (req, res) => {
    const idDeletar = req.params.id;
    delete clientes[idDeletar]

    axios.post("http://localhost:10000/eventos", {
        tipo: "ClienteDeletado",
        dados: idDeletar
    });
    res.send(clientes);
})

app.put('/clientes/:id', async(req, res) => {
    const id = req.params.id
    const {
        nome,
        endereco,
        idade
    } = req.body;
    const clienteVelho = clientes[id]
    clientes[id] = {
        contador: id,
        nome: nome != null ? nome : clienteVelho.nome,
        endereco: endereco != null ? endereco : clienteVelho.endereco,
        idade: idade != null ? idade : clienteVelho.idade,
        status = "aguardando",
        qtd: clienteVelho.qtd
    }
    clienteNovo = clientes[id]

    await axios.post("http://localhost:10000/eventos", {
        tipo: "ClienteClassificar",
        dados: {
            contador: clienteNovo.contador,
            nome: clienteNovo.nome,
            endereco: clienteNovo.endereco,
            idade: clienteNovo.idade,
            status: clienteNovo.status,
            qtd: clienteNovo.qtd
        },
    });
    res.status(201).send(clientes[id]);
});

app.post('/eventos', (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) {}
    res.status(200).send({ msg: "ok" });
});

app.listen(4000, () => {
    console.log('Clientes. Porta 4000');
});