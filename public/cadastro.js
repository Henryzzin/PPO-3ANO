const form = document.getElementById("form");

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
            window.location.href = "login.html";
        } else {
            alert(data.error || "Erro ao cadastrar.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar ao servidor.");
    }
});
