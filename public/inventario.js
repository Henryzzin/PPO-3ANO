document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`/inventarios/${usuario.id}`);
    const data = await response.json();

    if (response.ok) {
      const inventarios = data.inventarios;

      inventarios.forEach((inventario) => {
        const a = document.createElement('a');
        a.href = "#";
        a.classList.add('inventory');
        a.textContent = inventario.nome + " >";
        inventoryList.appendChild(a);
      });
    } else {
      console.error("Erro ao carregar inventários:", data.error);
    }
  } catch (error) {
    console.error("Erro ao conectar ao servidor:", error);
  }
});

const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const createBtn = document.getElementById('createInventory');
const inventoryList = document.getElementById('inventoryList');
const mainTitle = document.querySelector('.main-content h1');
const deleteBtn = document.getElementById('deleteInventory');

let inventoryCount = 0;

// Retrátil
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  sidebar.classList.toggle('expanded');
});

// Criar novo inventário
createBtn.addEventListener('click', async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario")); // Recupera o usuário do localStorage

    if (!usuario) {
        alert("Usuário não autenticado!");
        return;
    }

  inventoryCount++;

  const invName = `Inventário ${inventoryCount} >`;
  const a = document.createElement('a');
  a.href = "#";
  a.classList.add('inventory');
  a.textContent = invName;
  inventoryList.appendChild(a);

  try {
    const response = await fetch("/inventario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome: invName, idUsuario: usuario }),
    });

    if(!response.ok) {
      throw new Error("Erro ao criar inventário.")
    }
  } catch (error) {
    console.error("Falha ao criar inventário.", error);
  }
});

// Mudar título ou editar nome
inventoryList.addEventListener('click', (e) => {
  if (e.target.classList.contains('inventory')) {
    mainTitle.textContent = e.target.textContent.replace(" >", "");
    deleteBtn.style.opacity = "1";
    deleteBtn.style.visibility = "visible"
  }
});

inventoryList.addEventListener('dblclick', (e) => {
  if (e.target.classList.contains('inventory')) {
    const link = e.target;
    const currentText = link.textContent.replace(" >", "");
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.classList.add('editable');
    link.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
      const newName = input.value || currentText;
      const newLink = document.createElement('a');
      newLink.href = "#";
      newLink.classList.add('inventory');
      newLink.textContent = newName + ' >';
      input.replaceWith(newLink);
    });

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        input.blur();
      }
    });
  }
});

deleteBtn.addEventListener('click', () => {

});