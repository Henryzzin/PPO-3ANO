import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { ServerResponse } from "http";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

app.post('/cadastro', async (req: Request, res: any) => {
    const { email, senha } = req.body;

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
    });

    if (usuarioExistente) {
        return res.status(400).json({ error: "Este email já está sendo utilizado" });
    }

    try {
        const novoUsuario = await prisma.usuario.create({
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

app.post('/login', async (req: Request, res: any) => {
    const { email, senha } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email é obrigatório." });
    } else if (!senha) {
        return res.status(400).json({ error: "Senha é obrigatória." });
    }

    try {
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email },
            include: { inventarios: true }
        });

        if (usuarioExistente && usuarioExistente.senha === senha) {
            return res.status(200).json({
                message: "Usuário conectado com sucesso!",
                usuario: usuarioExistente
            })
        }

        res.status(500).json({ error: "Email ou senha inválidos." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao se conectar." })
    }
})


app.post('/inventario', async (req: Request, res: any) => {
    const { nome, idUsuario } = req.body;

    try {
        const novoInventario = await prisma.inventario.create({
            data: {
                nome,
                idUsuarioFK: idUsuario
            }
        });
        res.status(201).json({ message: "Inventário criado com sucesso!", inventario: novoInventario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar inventário." });
    }
})

app.get('/inventarios/:idUsuario', async (req: any, res: any) => {
    const idUsuario = parseInt(req.params.idUsuario);
    if (isNaN(idUsuario)) {
        return res.status(400).json({ error: "ID de usuário inválido." });
    }
    try {
        const inventarios = await prisma.inventario.findMany({
            where: { idUsuarioFK: idUsuario }
        });
        res.status(200).json({ inventarios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar inventários." });
    }
});

app.post('/deleteInventario', async (req: Request, res: Response) => {
    const id = req.body.idInventario;

    try {
        await prisma.inventario.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: "Inventário excluído com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir inventário." });
    }
});

app.post('/listaInventario', async (req: Request, res: Response) => {
    try {
        const invList = await prisma.inventario.findMany();
        res.status(200).json({ invList })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao encontrar inventários." })
    }
});

app.post('/nomeInventario', async (req: Request, res: any) => {
    const { idInventario, novoNome } = req.body;
    const id = Number(idInventario);

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID do inventário inválido." });
    }

    try {
        await prisma.inventario.update({
            where: { id },
            data: { nome: novoNome }
        });
        res.status(200).json({ message: "Nome do inventário alterado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao trocar o nome do inventário." });
    }
});

app.post('/createItem', async (req: Request, res: any) => {
    const { idInventario, nome } = req.body;

    if (!idInventario || !nome) {
        return res.status(400).json({ error: "ID do inventário e nome do item são obrigatórios." });
    }

    try {
        const novoItem = await prisma.produto.create({
            data: {
                nome,
                preco,
                quantidade: 0,
                idInventarioFK: parseInt(idInventario)
            }
        });
        res.status(201).json({ message: "Item criado com sucesso!", item: novoItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar item." });
    }
});















const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

