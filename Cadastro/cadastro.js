const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmSenha = document.getElementById("conf_senha");


form.addEventListener("submit", (event) => {
        event.preventDefault();
        if(senha===confirmSenha){
                alert("Cadastrado com sucesso!")
        } else {
                alert("As senhas não coincidem!");
        }
})

class Usuario {
        constructor(email, senha){
                this.email = email;
                this.senha = senha;
        }
}

export const usuario = new Usuario();