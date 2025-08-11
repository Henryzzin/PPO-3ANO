const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const createBtn = document.getElementById('createInventory');
const inventoryList = document.getElementById('inventoryList');
const mainTitle = document.querySelector('.main-content h1');
const deleteInventoryBtn = document.getElementById('deleteInventory');
const items = document.querySelector('.items');
const createProduct = document.querySelector('.createProduct');
const createProductButton = document.getElementById('createProductButton');
const dialogCreateProduct = document.getElementById('dialogCreateProduct');
const saveProductButton = document.getElementById('saveProduct');
const dialogEditProduct = document.getElementById('dialogEditProduct');
const updateProductButton = document.getElementById('updateProduct');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productQuantity = document.getElementById('productQuantity');
const editProductName = document.getElementById('editProductName');
const editProductPrice = document.getElementById('editProductPrice');
const editProductQuantity = document.getElementById('editProductQuantity');

let selectedProductId = null;
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

      inventoryList.innerHTML = '';
      inventarios.forEach((inventario, idx) => {
        const a = document.createElement('a');
        a.href = "#";
        a.classList.add('inventory');
        a.textContent = inventario.nome + " >";
        a.dataset.id = inventario.id;
        inventoryList.appendChild(a);

        // Se for o primeiro inventário, já seleciona e mostra os produtos
        if (idx === 0) {
          mainTitle.textContent = inventario.nome;
          deleteInventoryBtn.style.opacity = "1";
          deleteInventoryBtn.style.visibility = "visible";
          selectedInventoryId = inventario.id;
          a.classList.add('selected'); // opcional: destaque visual
          renderProducts(selectedInventoryId);
        }
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

async function resetInventory() {
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
      resetInventory();
      renderProducts(null); // Limpa a lista de produtos
    }
  } catch (error) {
    console.error("Falha ao criar inventário.", error);
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

deleteInventoryBtn.addEventListener('click', async () => {
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
      body: JSON.stringify({ idInventario: Number(selectedInventoryId) }),
    });

    if (!response.ok) {
      throw new Error("Erro ao deletar inventário.");
    } else {
      // Remove da lista e limpa seleção
      mainTitle.textContent = "";
      deleteInventoryBtn.style.opacity = "0";
      deleteInventoryBtn.style.visibility = "hidden";
      selectedInventoryId = null;
      // Recarrega a lista
      resetInventory();
      renderProducts(null); // Limpa a lista de produtos
    }
  } catch (error) {
    console.error("Falha ao deletar inventário.", error);
  }
});

items.addEventListener('click', async (e) => {
  if (e.target.classList.contains('deleteProduct') || e.target.id === 'deleteProductImage') {
    // Se o clique foi na imagem, suba para o botão
    const btn = e.target.classList.contains('deleteProduct') ? e.target : e.target.closest('.deleteProduct');
    if (!selectedInventoryId) {
      alert("Selecione um inventário para excluir.");
      return;
    }
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const response = await fetch("/deleteProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idProduto: Number(btn.dataset.id) }),
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar produto.");
      } else {
        // Atualiza a lista de produtos
        await renderProducts(selectedInventoryId);
        clearProductInputs(); // Limpa os campos de entrada do produto       
      }
    } catch (error) {
      console.error("Falha ao deletar produto.", error);
    }
  }
});

// Função para renderizar produtos
async function renderProducts(inventoryId) {
  items.innerHTML = `
    <div class="createProduct">
      <button id="createProductButton">+</button>
    </div>
  `;
  try {
    const response = await fetch(`/produtos/${inventoryId}`);
    const data = await response.json();
    if (response.ok) {
      data.produtos.forEach((product) => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('products');
        productDiv.innerHTML = `
          <p class="productInfo"><strong>Nome:</strong> ${product.nome}</p>
          <p class="productInfo"><strong>Preço:</strong> R$ ${product.preco.toFixed(2)}</p>
          <p class="productInfo"><strong>Quantidade:</strong> ${product.quantidade}</p>
          <div class="productActions">
            <button class="editProduct" data-id="${product.id}"><img src="ImgEditPdct.png" alt="Editar Produto" id="editProductImage"></button>
            <button class="deleteProduct" data-id="${product.id}"><img src="ImgDeleteInv.png" alt="Deletar Produto" id="deleteProductImage"></button>
          </div>
          `;
        items.appendChild(productDiv);
      });
    } else {
      console.error("Erro ao carregar produtos:", data.error);
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }

  // Reatribui o evento do botão de criar produto SEM duplicar
  document.getElementById('createProductButton').onclick = openProductDialog;
}

function clearProductInputs() {
  productName.value = "";
  productPrice.value = "";
  productQuantity.value = "";
  editProductName.value = "";
  editProductPrice.value = "";
  editProductQuantity.value = "";
}

// Função para abrir o dialog de produto
function openProductDialog() {
  dialogCreateProduct.style.display = "block";
  // Remove event listeners antigos antes de adicionar um novo
  saveProductButton.onclick = async () => {
    dialogCreateProduct.style.display = "none";
    try {
      const nome = productName.value;
      const preco = parseFloat(productPrice.value);
      const quantidade = parseInt(productQuantity.value);

      if (!nome || isNaN(preco) || preco < 0 || isNaN(quantidade) || quantidade < 0) {
        alert("Preencha todos os campos corretamente!");
        return;
      } 

      const response = await fetch("/createProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          idInventario: Number(selectedInventoryId), 
          nome, 
          preco, 
          quantidade
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar produto.");
      } else {
        // Atualiza a lista de itens
        await renderProducts(selectedInventoryId);
      }
    } catch (error) {
      console.error("Falha ao criar produto.", error);
    }
    clearProductInputs();
  };
}

// Evento de clique no inventário
inventoryList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('inventory')) {
    mainTitle.textContent = e.target.textContent.replace(" >", "");
    deleteInventoryBtn.style.opacity = "1";
    deleteInventoryBtn.style.visibility = "visible"
    selectedInventoryId = e.target.dataset.id;
    await renderProducts(selectedInventoryId);
  }
});
// Evento global para fechar o dialog ao clicar fora dele
// window.onclick = function(event) {
//   if(event.target === createProduct) return;

//   if (event.target !== dialogCreateProduct) {
//     dialogCreateProduct.style.display = "none";  ARRUMAR ISSO
//     dialogEditProduct.style.display = "none";
//     clearProductInputs();
//   }
// }

dialogEditProduct.addEventListener('click', (e) => {
  selectedProductId = e.target.classList.contains('editProduct') || e.target.id === 'editProductImage';
  if (e.target === dialogEditProduct) {
    dialogEditProduct.style.display = "block";
    clearProductInputs();
  }
});

updateProductButton.addEventListener('click', async () => {
  dialogEditProduct.style.display="hidden";
  try{
    const editName = editProductName.value;
    const editPrice = parseFloat(editProductPrice.value);
    const editQuantity = parseInt(editProductQuantity.value);

    const response = await fetch("/editProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        idProduto: Number(idProduto), 
        editName, 
        editPrice, 
        editQuantity
      }),
    });
    if(!response.ok){
      throw new Error ("Erro ao editar produto.");
    } else {
      clearProductInputs();
      renderProducts();
      selectedProductId = null;
    }
  } catch (error) {
    console.error("Falha ao editar produto.", error);
  }
});