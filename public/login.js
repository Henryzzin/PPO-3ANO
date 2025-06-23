const form = document.getElementById("form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = "inventario.html";
        } else {
            alert(data.error || "Erro ao conectar.");
        }
    } catch (error) {
        alert("Erro ao conectar ao servidor.");
    }
});