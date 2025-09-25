const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const createBtn = document.getElementById('createInventory');
const inventoryList = document.getElementById('inventoryList');
const mainTitle = document.getElementById('inventoryTitle');
const deleteInventoryBtn = document.getElementById('deleteInventory');
const items = document.querySelector('.items');
const overlay = document.querySelector('.overlay');
const createProduct = document.querySelector('.createProduct');
const createProductButton = document.getElementById('createProductButton');
const dialogCreateProduct = document.getElementById('dialogCreateProduct');
const saveProductButton = document.getElementById('saveProduct');
const dialogEditProduct = document.getElementById('dialogEditProduct');
const dialogCreateInventory = document.getElementById('dialogCreateInventory');
const updateProductButton = document.getElementById('updateProduct');
const saveInventoryButton = document.getElementById('saveInventory');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productQuantity = document.getElementById('productQuantity');
const editProductName = document.getElementById('editProductName');
const editProductPrice = document.getElementById('editProductPrice');
const editProductQuantity = document.getElementById('editProductQuantity');
const inventoryNameInput = document.getElementById('inventoryName');
const noPriceCheckbox = document.getElementById('noPriceCheckbox');
const closeDialogButtons = document.querySelectorAll('.btn-close');

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
      
      if (inventarios.length === 0) {
        // Se não há inventários, mostra mensagem e limpa a área de produtos
        mainTitle.textContent = "Nenhum inventário encontrado. Crie seu primeiro inventário!";
        deleteInventoryBtn.style.opacity = "0";
        deleteInventoryBtn.style.visibility = "hidden";
        selectedInventoryId = null;
        renderProducts(null); // Limpa a área e não mostra botão de criar produto
      } else {
        // Se há inventários, lista eles mas não seleciona automaticamente
        inventarios.forEach((inventario) => {
          const a = document.createElement('a');
          a.href = "#";
          a.classList.add('inventory');
          a.textContent = inventario.nome + " >";
          a.dataset.id = inventario.id;
          inventoryList.appendChild(a);
        });
        
        // Não seleciona automaticamente, deixa o usuário escolher
        mainTitle.textContent = "Selecione um inventário";
        deleteInventoryBtn.style.opacity = "0";
        deleteInventoryBtn.style.visibility = "hidden";
        selectedInventoryId = null;
        renderProducts(null); // Não mostra botão de criar produto até selecionar inventário
      }
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
createBtn.addEventListener('click', () => {
  dialogCreateInventory.style.display = "block";
  overlay.classList.add("show");
  document.body.classList.add("modal-open");
  inventoryNameInput.focus();
});

// Salvar inventário
saveInventoryButton.addEventListener('click', async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
      alert("Usuário não autenticado!");
      return;
  }

  const invName = inventoryNameInput.value.trim();
  if (!invName) {
    alert("Digite um nome para o inventário!");
    return;
  }

  const semPreco = noPriceCheckbox.checked;

  try {
    const response = await fetch("/inventario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        nome: invName, 
        idUsuario: usuario.id,
        semPreco: semPreco
      }),
    });

    if(!response.ok) {
      throw new Error("Erro ao criar inventário.")
    } else {
      dialogCreateInventory.style.display = "none";
      overlay.classList.remove("show");
      document.body.classList.remove("modal-open");
      inventoryNameInput.value = "";
      
      await resetInventory();
      renderProducts(null); // Limpa a lista de produtos
      
      // Seleciona o novo inventário criado (último da lista)
      const inventoryElements = document.querySelectorAll('.inventory');
      if (inventoryElements.length > 0) {
        const lastInventory = inventoryElements[inventoryElements.length - 1];
        lastInventory.click(); // Simula clique para selecionar
      }
    }
  } catch (error) {
    console.error("Falha ao criar inventário.", error);
    alert("Erro ao criar inventário!");
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
      await resetInventory();
      
      const inventoryElements = document.querySelectorAll('.inventory');
      
      if (inventoryElements.length > 0) {
        const firstInventory = inventoryElements[0];
        firstInventory.classList.add('selected');
        
        mainTitle.textContent = firstInventory.textContent.replace(" >", "");
        selectedInventoryId = firstInventory.dataset.id;
        
        await renderProducts(selectedInventoryId);
        
        deleteInventoryBtn.style.opacity = "1";
        deleteInventoryBtn.style.visibility = "visible";
      } else {
        mainTitle.textContent = "Nenhum inventário selecionado";
        deleteInventoryBtn.style.opacity = "0";
        deleteInventoryBtn.style.visibility = "hidden";
        selectedInventoryId = null;
        renderProducts(null);
      }
    }
  } catch (error) {
    console.error("Falha ao deletar inventário.", error);
  }
});

items.addEventListener('click', async (e) => {
  if (e.target.classList.contains('deleteProduct') || e.target.classList.contains('deleteProductImage')) {
    // Se o clique foi na imagem, suba para o botão
    const btn = e.target.classList.contains('delete-product') ? e.target : e.target.closest('.delete-product');
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
  // Adiciona funcionalidade para editar produto
  if (e.target.classList.contains('editProduct') || e.target.classList.contains('editProductImage')) {
    const btn = e.target.classList.contains('editProduct') ? e.target : e.target.closest('.editProduct');
    const idProduto = btn.dataset.id;
    // Buscar dados do produto na lista renderizada
    const productDiv = btn.closest('.products');
    const nome = productDiv.querySelector('.productInfo:nth-child(1)').textContent.replace('Nome:', '').trim();
    const preco = productDiv.querySelector('.productInfo:nth-child(2)').textContent.replace('Preço:', '').replace('R$', '').trim();
    const quantidade = productDiv.querySelector('.productInfo:nth-child(3)').textContent.replace('Quantidade:', '').trim();

    editProductName.value = nome;
    editProductPrice.value = preco;
    editProductQuantity.value = quantidade;
    window.idProduto = idProduto; // para uso no update
    dialogEditProduct.style.display = "block";
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.classList.add("darkBackground");
  }
});

// Função para renderizar produtos
async function renderProducts(inventoryId) {
  // Se não há inventário selecionado, limpa a área e não mostra o botão
  if (!inventoryId) {
    items.innerHTML = '';
    return;
  }
  
  // Se há inventário selecionado, mostra o botão de criar produto
  items.innerHTML = `
    <div class="create-product-card">
      <button id="createProductButton" class="create-product-btn" aria-label="Adicionar novo produto" title="Adicionar produto">
        <i class="bi bi-plus"></i>
      </button>
    </div>
  `;
  
  try {
    const response = await fetch(`/produtos/${inventoryId}`);
    const data = await response.json();
    if (response.ok) {
      const inventario = data.inventario;
      const semPreco = inventario?.semPreco || false;
      
      data.produtos.forEach((product) => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('products');
        productDiv.innerHTML = `
          <div class="productContent">
            <p class="productInfo"><span class="product-name-label">Nome:</span> ${product.nome}</p>
            <p class="productInfo"><strong>Preço:</strong> R$ ${product.preco.toFixed(2)}</p>
            <p class="productInfo"><strong>Quantidade:</strong> ${product.quantidade}</p>
          </div>
          <div class="productActions">
            <button class="editProduct" data-id="${product.id}"><img src="ImgEditPdct.png" alt="Editar Produto" class="editProductImage"></button>
            <button class="deleteProduct" data-id="${product.id}"><img src="ImgDeleteInv.png" alt="Deletar Produto" class="deleteProductImage"></button>
          </div>
        `;
        
        productDiv.innerHTML = productHTML;
        items.appendChild(productDiv);
      });
      
      // Atualiza os modais de produto baseado na configuração
      updateProductModalsForInventory(semPreco);
      
    } else {
      console.error("Erro ao carregar produtos:", data.error);
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }

  // Reatribui o evento do botão de criar produto SEM duplicar
  document.getElementById('createProductButton').onclick = openProductDialog;
}

// Função para atualizar os modais baseado na configuração do inventário
function updateProductModalsForInventory(semPreco) {
  // Elementos de preço nos modais
  const productPriceContainer = document.getElementById('productPrice')?.closest('.col-md-6');
  const editProductPriceContainer = document.getElementById('editProductPrice')?.closest('.col-md-6');
  
  if (semPreco) {
    // Esconder campos de preço
    if (productPriceContainer) productPriceContainer.style.display = 'none';
    if (editProductPriceContainer) editProductPriceContainer.style.display = 'none';
    
    // Remover required dos campos de preço
    if (productPrice) productPrice.removeAttribute('required');
    if (editProductPrice) editProductPrice.removeAttribute('required');
  } else {
    // Mostrar campos de preço
    if (productPriceContainer) productPriceContainer.style.display = 'block';
    if (editProductPriceContainer) editProductPriceContainer.style.display = 'block';
    
    // Adicionar required aos campos de preço
    if (productPrice) productPrice.setAttribute('required', '');
    if (editProductPrice) editProductPrice.setAttribute('required', '');
  }
}

function clearProductInputs() {
  productName.value = "";
  productPrice.value = "";
  productQuantity.value = "";
  editProductName.value = "";
  editProductPrice.value = "";
  editProductQuantity.value = "";
  inventoryNameInput.value = "";
  noPriceCheckbox.checked = false;
}

// Função para abrir o dialog de produto
function openProductDialog() {
  dialogCreateProduct.style.display = "block";
  const overlay = document.querySelector('.overlay');
  if (overlay) overlay.classList.add("darkBackground");
  // Remove event listeners antigos antes de adicionar um novo
  saveProductButton.onclick = async () => {
    dialogCreateProduct.style.display = "none";
    overlay.classList.remove("show");
    document.body.classList.remove("modal-open");
    try {
      const nome = productName.value;
      const quantidade = parseInt(productQuantity.value);
      
      // Verifica se o preço deve ser usado ou se é um inventário sem preço
      const precoValue = productPrice.value;
      const preco = precoValue && precoValue.trim() !== '' ? parseFloat(precoValue) : 0;

      if (!nome || isNaN(quantidade) || quantidade < 0) {
        alert("Preencha todos os campos corretamente!");
        return;
      }
      
      // Só valida preço se o campo estiver visível e obrigatório
      if (productPrice.hasAttribute('required') && (isNaN(preco) || preco < 0)) {
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

closeDialogButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.id === 'closeDialogCreateProduct') {
      dialogCreateProduct.style.display = "none";
    } else if (button.id === 'closeDialogEditProduct') {
      dialogEditProduct.style.display = "none";
    } else if (button.id === 'closeDialogCreateInventory') {
      dialogCreateInventory.style.display = "none";
    }
  clearProductInputs();
  const overlay = document.querySelector('.overlay');
  if (overlay) overlay.classList.remove("darkBackground");
  selectedProductId = null; 
  });
});

// Evento de clique no inventário
inventoryList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('inventory')) {
    // Remove a classe 'selected' de todos os inventários
    document.querySelectorAll('.inventory').forEach(inv => {
      inv.classList.remove('selected');
    });
    
    // Adiciona a classe 'selected' ao inventário clicado
    e.target.classList.add('selected');
    
    mainTitle.textContent = e.target.textContent.replace(" >", "");
    deleteInventoryBtn.style.opacity = "1";
    deleteInventoryBtn.style.visibility = "visible"
    selectedInventoryId = e.target.dataset.id;
    await renderProducts(selectedInventoryId);
  }
});

dialogEditProduct.addEventListener('click', (e) => {
  selectedProductId = e.target.classList.contains('editProduct') || e.target.classList.contains('editProductImage');
  if (e.target === dialogEditProduct) {
    dialogEditProduct.style.display = "block";
    clearProductInputs();
  }
});

updateProductButton.addEventListener('click', async () => {
  dialogEditProduct.style.display = "none";
  const overlay = document.querySelector('.overlay');
  if (overlay) overlay.classList.remove("darkBackground");
  try {
    const editName = editProductName.value;
    const editQuantity = parseInt(editProductQuantity.value);
    const idProduct = window.idProduto;

    const response = await fetch("/editProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        idProduct: Number(idProduct), 
        editName, 
        editPrice, 
        editQuantity
      }),
    });
    if (!response.ok) {
      throw new Error("Erro ao editar produto.");
    } else {
      dialogEditProduct.style.display = "none";
      overlay.classList.remove("show");
      document.body.classList.remove("modal-open");
      clearProductInputs();
      await renderProducts(selectedInventoryId);
      await renderProducts(selectedInventoryId);
      selectedProductId = null;
    }
  } catch (error) {
    console.error("Falha ao editar produto.", error);
  }
});

// Event listeners para botões de cancelar
document.getElementById('cancelCreateProduct')?.addEventListener('click', () => {
  dialogCreateProduct.style.display = "none";
  overlay.classList.remove("show");
  document.body.classList.remove("modal-open");
  clearProductInputs();
});

document.getElementById('cancelEditProduct')?.addEventListener('click', () => {
  dialogEditProduct.style.display = "none";
  overlay.classList.remove("show");
  document.body.classList.remove("modal-open");
  clearProductInputs();
  selectedProductId = null;
});

document.getElementById('cancelCreateInventory')?.addEventListener('click', () => {
  dialogCreateInventory.style.display = "none";
  overlay.classList.remove("show");
  document.body.classList.remove("modal-open");
  clearProductInputs();
});

// Fechar modais ao clicar no overlay
overlay.addEventListener('click', () => {
  dialogCreateProduct.style.display = "none";
  dialogEditProduct.style.display = "none";
  dialogCreateInventory.style.display = "none";
  overlay.classList.remove("show");
  document.body.classList.remove("modal-open");
  clearProductInputs();
  selectedProductId = null;
});

// Responsividade para sidebar em mobile
if (window.innerWidth <= 768) {
  sidebar.classList.add('collapsed');
  
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
  });
}