const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmSenha = document.getElementById("conf_senha");
const buttonSubmit = document.getElementById("submit")
const form = document.getElementById("form");

buttonSubmit.addEventListener("submit", (event) => {
        event.preventDefault();
        if(senha===confirmSenha){
                alert("Cadastrado com sucesso!")
        } else {
                alert("As senhas não coincidem!");
        }
        window.open(url, '/Inventário/inventario.html')
})

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirmSenha = document.getElementById("conf_senha").value;

    if (senha !== confirmSenha) {
        alert("As senhas não coincidem!");
        return;
    }

    try {
        const response = await fetch("/cadastro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = "/Inventário/inventario.html";
        } else {
            alert(data.error || "Erro ao cadastrar.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar ao servidor.");
    }
});

// class Usuario {
//         constructor(email, senha){
//                 this.email = email;
//                 this.senha = senha;
//         }
// }

// export const usuario = new Usuario();