const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmSenha = document.getElementById("conf_senha");
const form = document.getElementById("form");

if (senha!=confirmSenha){
        alert("As senhas não coincidem.");
}

form.addEventListener("submit", (event) => {
        event.preventDefault();
        alert("Cadastrado com sucesso!")
})