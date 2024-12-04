import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ProxyAgent from 'proxy-agent';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

// Lista de proxies para rotação
const proxies = [
    'http://123.123.123.123:8080',
    'http://234.234.234.234:8080',
    'http://345.345.345.345:8080'
];

// Função para obter um proxy aleatório
function getRandomProxy() {
    return proxies[Math.floor(Math.random() * proxies.length)];
}

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para interpretar JSON
app.use(express.json());



let usuarios = [];

// Função para gravar dados em um arquivo
function gravarEmArquivo(usuarios) {
    const caminhoArquivo = path.join(__dirname, 'cadastros.txt');
    const conteudo = usuarios.map(usuario => `Nome: ${usuario.nome}, Email: ${usuario.email}, Senha: ${usuario.senha}`).join('\n');
    fs.writeFile(caminhoArquivo, conteudo, (err) => {
        if (err) {
            console.error('Erro ao gravar arquivo:', err);
        } else {
            console.log('Dados gravados com sucesso no arquivo:', caminhoArquivo);
        }
    });
}

// Configuração do Socket.IO
io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    // Evento para receber dados do cliente e emitir para todos os clientes
    socket.on('novo-cadastro', (dados) => {
        usuarios.push(dados);
        gravarEmArquivo(usuarios); // Grava os dados em um arquivo
        io.emit('atualizar-usuarios', usuarios); // Envia a lista atualizada para todos os clientes
    });

    // Evento para limpar dados
    socket.on('limpar-dados', () => {
        usuarios = [];
        fs.unlink(path.join(__dirname, 'cadastros.txt'), (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Erro ao deletar arquivo:', err);
            }
        });
        io.emit('atualizar-usuarios', usuarios); // Envia a lista vazia para todos os clientes
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Endpoint para chamadas externas usando proxy
app.get('/api', async (req, res) => {
    const proxyUrl = getRandomProxy(); // Seleciona um proxy aleatório
    console.log(`Usando proxy: ${proxyUrl}`);

    try {
        const agent = new ProxyAgent(proxyUrl);
        const response = await fetch('https://example.com', { agent });
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error('Erro na requisição externa:', error);
        res.status(500).send('Erro ao buscar dados externos.');
    }
});

// Iniciar o servidor
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
