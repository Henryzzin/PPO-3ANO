const express = require("express");
const path = require('path'); 
const app = express();
const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient();
const cors = require('cors');

app.use(express.static(path.join(__dirname, 'Cadastro'))); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Cadastro', 'cadastro.html')); 
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//-------------------------------------------------------------------------------------------------------------------//

app.post('/cadastro', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Salva o usuário no banco de dados
        const novoUsuario = await prismaClient.usuario.create({
            data: {
                email,
                senha,
            },
        });
        res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: novoUsuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao cadastrar o usuário." });
    }
});