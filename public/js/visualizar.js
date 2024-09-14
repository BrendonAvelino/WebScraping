const socket = io();
const listaUsuarios = document.getElementById('listaUsuarios');

 // Solicita ao servidor para limpar os dados quando a página é carregada
 window.addEventListener('load', () => {
    socket.emit('limpar-dados');
});

// Recebe a lista de usuários e atualiza a página
socket.on('atualizar-usuarios', (usuarios) => {
    listaUsuarios.innerHTML = '';
    usuarios.forEach(usuario => {
        const li = document.createElement('li');
        li.textContent = `Nome: ${usuario.nome}, Email: ${usuario.email}, Senha: ${usuario.senha}`;
        listaUsuarios.appendChild(li);
    });
});