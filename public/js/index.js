const socket = io();
        const form = document.getElementById('cadastroForm');

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            // Envia os dados para o servidor via Socket.IO
            socket.emit('novo-cadastro', { nome, email, senha });

            // Opcionalmente, você pode limpar o formulário ou exibir uma mensagem
            form.reset();
            // Redireciona após o envio
            window.location.href = './confirmacao.html';
        });