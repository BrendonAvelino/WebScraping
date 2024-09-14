const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs'); // Módulo para manipulação de arquivos

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;

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

server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
