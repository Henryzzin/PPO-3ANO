const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const createBtn = document.getElementById('createInventory');
const inventoryList = document.getElementById('inventoryList');
const mainTitle = document.querySelector('.main-content h1');
const deleteBtn = document.getElementById('deleteInventory');
const items = document.querySelector('.items');
const createProductButton = document.getElementById('createProductButton');
const dialogCreateProduct = document.getElementById('dialogCreateProduct');
const saveProductButton = document.getElementById('saveProduct');

let inventoryCount = 0;
let selectedInventoryId = null;

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
        a.dataset.id = inventario.id;
        inventoryList.appendChild(a); //----------------------------------------------------------------------------------------------------
      });
    } else {
      console.error("Erro ao carregar inventários:", data.error);
    }
  } catch (error) {
    console.error("Erro ao conectar ao servidor:", error);
  }
});

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

  const invName = prompt("Digite o nome do novo inventário:");
  if (!invName) return;

  try {
    const response = await fetch("/inventario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome: invName, idUsuario: usuario.id }),
    });

    if(!response.ok) {
      throw new Error("Erro ao criar inventário.")
    } else {
      // Recarrega a lista de inventários
      const res = await fetch(`/inventarios/${usuario.id}`);
      const data = await res.json();
      inventoryList.innerHTML = '';
      data.inventarios.forEach((inventario) => {
        const a = document.createElement('a');
        a.href = "#";
        a.classList.add('inventory');
        a.textContent = inventario.nome + " >";
        a.dataset.id = inventario.id;
        inventoryList.appendChild(a);
      });
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
    selectedInventoryId = e.target.dataset.id;
  }
});

inventoryList.addEventListener('dblclick', async (e) => {
  if (e.target.classList.contains('inventory')) {
    const link = e.target;
    const currentText = link.textContent.replace(" >", "");
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.classList.add('editable');
    link.replaceWith(input);
    input.focus();

    input.addEventListener('blur', async () => {
      const newName = input.value || currentText;
      const newLink = document.createElement('a');
      newLink.href = "#";
      newLink.classList.add('inventory');
      newLink.textContent = newName + ' >';
      input.replaceWith(newLink);

      try{
        await fetch("/nomeInventario", {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          },
          body: JSON.stringify({ idInventario: Number(link.dataset.id), novoNome: newName }),
        });
      } catch (error) {
        console.error("Falha ao trocar o nome do inventário.", error);
      }
    });

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        input.blur();
      }
    });

  }
});

deleteBtn.addEventListener('click', async () => {
  if (!selectedInventoryId) {
    alert("Selecione um inventário para excluir.");
    return;
  }
  if (!confirm("Tem certeza que deseja excluir este inventário?")) return;

  try {
    const response = await fetch("/deleteInventario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idInventario: selectedInventoryId }),
    });

    if (!response.ok) {
      throw new Error("Erro ao deletar inventário.");
    } else {
      // Remove da lista e limpa seleção
      mainTitle.textContent = "";
      deleteBtn.style.opacity = "0";
      deleteBtn.style.visibility = "hidden";
      selectedInventoryId = null;
      // Recarrega a lista
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const res = await fetch(`/inventarios/${usuario.id}`);
      const data = await res.json();
      inventoryList.innerHTML = '';
      data.inventarios.forEach((inventario) => {
        const a = document.createElement('a');
        a.href = "#";
        a.classList.add('inventory');
        a.textContent = inventario.nome + " >";
        a.dataset.id = inventario.id;
        inventoryList.appendChild(a);
      });
    }
  } catch (error) {
    console.error("Falha ao deletar inventário.", error);
  }
});

createProductButton.addEventListener('click', async() => {
  dialogCreateProduct.style.display = "block";
  saveProductButton.addEventListener('click', () => {
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const productQuantity = document.getElementById('productQuantity');
    dialogCreateProduct.style.display = "none";
  });

  try{
    const response = await fetch("/createProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        idInventario: selectedInventoryId, 
        productName: productName.value, 
        productPrice: productPrice.value, 
        productQuantity: productQuantity.value   
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar produto.");
    } else {
      // Atualiza a lista de itens
      const product = await response.json();
      const productDiv = document.createElement('div');
      productDiv.classList.add('products');
      productDiv.textContent = product.nome; // Supondo que o product tenha um campo 'nome'
      items.appendChild(productDiv);
    }
  } catch (error) {
    console.error("Falha ao criar produto.", error);
  }
  productName.value = "";
  productPrice.value = "";
  productQuantity.value = "";
});