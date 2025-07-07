import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

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

    if(usuarioExistente){
        return res.status(400).json({error: "Este email já está sendo utilizado"});
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
            include: { inventarios: true}
        });

        if(usuarioExistente && usuarioExistente.senha === senha){
            return res.status(200).json({ 
                message: "Usuário conectado com sucesso!", 
                usuario: usuarioExistente
            })
        } 

        res.status(500).json({ error: "Email ou senha inválidos." });
    } catch (error){
        console.error(error);
        res.status(500).json({error: "Erro ao se conectar."})
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

app.post('/inventario', async (req: Request, res: any) => {
    const idUsuario = req.body.idUsuario;
    const nome = req.body.nome;

    try {
        const inventarios = await prisma.inventario.findMany({
            where: {idUsuarioFK: parseInt(idUsuario)}
        });
        res.status(200).json({ inventarios });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro no carregamento dos inventários."})
    }
})

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
















const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

