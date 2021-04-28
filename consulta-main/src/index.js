const express = require("express");
const app = express();
app.use(express.json());
const axios = require("axios");
const baseConsulta = {};
const funcoes = {

    ClienteCriado: (cliente) => {
        baseConsulta[cliente.contador] = cliente;
    },

    ClienteDeletado: (id) => {
        delete baseConsulta[id]
        axios.post("http://localhost:10000/eventos", {
            tipo: "CascataDelClienteIngresso",
            dados: { id: id }
        });
    },

    IngressoCriado: (ingresso) => {
        const ingressos =
            baseConsulta[ingresso.clienteId]["ingressos"] || [];
        ingressos.push(ingresso);
        baseConsulta[ingresso.clienteId]["ingressos"] =
            ingressos;

        baseConsulta[ingresso.clienteId].qtd = ingressos.length

        axios.post("http://localhost:10000/eventos", {
            tipo: "CompraIngresso",
            dados: {
                id: ingresso.clienteId,
                qtd: ingressos.length
            }
        });
    },

    IngressoDeletado: (id) => {
        const length = baseConsulta[id]["ingressos"].length
        delete baseConsulta[id]["ingressos"].splice(length - 1, 1)
        baseConsulta[id].qtd = baseConsulta[id]["ingressos"].length

        axios.post("http://localhost:10000/eventos", {
            tipo: "CompraIngresso",
            dados: {
                id: id,
                qtd: baseConsulta[id]["ingressos"].length
            }
        });
    }
};

app.get("/clientes", (req, res) => {
    res.status(200).send(baseConsulta);
});

app.post("/eventos", (req, res) => {
    try {
        funcoes[req.body.tipo](req.body.dados);
    } catch (err) {}
    res.status(200).send(baseConsulta);
});

app.listen(6000, async() => {
    console.log("Consultas. Porta 6000");
    const resp = await axios.get("http://localhost:10000/eventos");
    resp.data.forEach((valor, indice, colecao) => {
        try {
            funcoes[valor.tipo](valor.dados);
        } catch (er) {}
    });
});