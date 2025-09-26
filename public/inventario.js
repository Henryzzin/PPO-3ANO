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
const closeDialogButtons = document.querySelectorAll('.closeDialog');
const logo = document.getElementById('logo');
const dialogProfile = document.getElementById('dialogProfile');
const logoutButton = document.getElementById('logoutButton');
const profileEmail = document.getElementById('profileEmail');
const profileInventoryCount = document.getElementById('profileInventoryCount');
const profileProductCount = document.getElementById('profileProductCount');
const profileNameDisplay = document.getElementById('profileNameDisplay');
const profileNameInput = document.getElementById('profileNameInput');
const editNameButton = document.getElementById('editNameButton');
const saveNameButton = document.getElementById('saveNameButton');
const nameDisplayContainer = document.querySelector('.name-display-container');
const nameEditContainer = document.querySelector('.name-edit-container');

let selectedProductId = null;
let selectedInventoryId = null;

document.addEventListener("DOMContentLoaded", async () => {
  console.log('DOM carregado, verificando usuário...');
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  console.log('Usuário no localStorage:', usuario);

  if (!usuario) {
    console.log('Usuário não encontrado, redirecionando para login');
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
  // Adiciona funcionalidade para editar produto
  if (e.target.classList.contains('editProduct') || e.target.classList.contains('editProductImage')) {
    const btn = e.target.classList.contains('editProduct') ? e.target : e.target.closest('.editProduct');
    const idProduto = btn.dataset.id;
    
    console.log('Abrindo modal de edição para produto ID:', idProduto);
    
    // Buscar dados do produto na lista renderizada
    const productDiv = btn.closest('.products');
    const productInfos = productDiv.querySelectorAll('.productInfo');
    
    if (productInfos.length === 0) {
      alert('Erro ao carregar dados do produto');
      return;
    }
    
    const nome = productInfos[0].textContent.replace('Nome:', '').trim();
    
    // Verificar se há campo de preço (pode não ter se for inventário sem preço)
    let preco = '';
    let quantidade = '';
    
    if (productInfos.length === 3) {
      // Tem preço
      const precoText = productInfos[1].textContent.replace('Preço:', '').replace('R$', '').replace(',', '.').trim();
      preco = parseFloat(precoText) || 0;
      quantidade = productInfos[2].textContent.replace('Quantidade:', '').trim();
    } else if (productInfos.length === 2) {
      // Não tem preço
      quantidade = productInfos[1].textContent.replace('Quantidade:', '').trim();
      preco = 0;
    }

    // Preencher campos do modal
    editProductName.value = nome;
    editProductPrice.value = preco;
    editProductQuantity.value = quantidade;
    window.idProduto = idProduto;
    
    console.log('Dados carregados:', { nome, preco, quantidade });
    
    // Abrir modal
    dialogEditProduct.style.display = "block";
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.classList.add("darkBackground");
  }
});

// Função para renderizar produtos
async function renderProducts(inventoryId) {
  console.log('renderProducts chamada com inventoryId:', inventoryId);
  
  // Se não há inventário selecionado, limpa a área e não mostra o botão
  if (!inventoryId) {
    console.log('Nenhum inventário selecionado, limpando área');
    items.innerHTML = '';
    return;
  }
  
  console.log('Inventário selecionado, renderizando produtos...');
  
  // Se há inventário selecionado, mostra o botão de criar produto
  items.innerHTML = `
    <div class="products create-product-card">
      <div class="productContent create-product-content">
        <button id="createProductButton" class="create-product-btn" aria-label="Adicionar novo produto" title="Adicionar produto">
          <i class="bi bi-plus-lg"></i>
          <span>Adicionar Produto</span>
        </button>
      </div>
    </div>
  `;
  
  try {
    console.log('Fazendo requisição para:', `/produtos/${inventoryId}`);
    const response = await fetch(`/produtos/${inventoryId}`);
    const data = await response.json();
    console.log('Resposta da API:', data);
    if (response.ok) {
      const inventario = data.inventario;
      const semPreco = inventario?.semPreco || false;
      
      data.produtos.forEach((product) => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('products');
        
        const productHTML = `
          <div class="productContent">
            <p class="productInfo"><span class="product-name-label">Nome:</span> ${product.nome}</p>
            ${semPreco ? '' : `<p class="productInfo"><strong>Preço:</strong> R$ ${product.preco.toFixed(2)}</p>`}
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
  document.getElementById('createProductButton').onclick = async () => {
    await openProductDialog();
  };
}

// Função para atualizar os modais baseado na configuração do inventário
function updateProductModalsForInventory(semPreco) {
  console.log('Atualizando modais para semPreco:', semPreco);
  
  // Elementos de preço nos modais (grupos completos com label e input)
  const productPriceGroup = document.getElementById('productPriceGroup');
  const editProductPriceGroup = document.getElementById('editProductPriceGroup');
  const productPriceField = document.getElementById('productPrice');
  const editProductPriceField = document.getElementById('editProductPrice');
  
  if (semPreco) {
    // Esconder grupos de preço completos (label + input)
    if (productPriceGroup) {
      productPriceGroup.style.display = 'none';
    }
    if (editProductPriceGroup) {
      editProductPriceGroup.style.display = 'none';
    }
    
    // Remover required dos campos
    if (productPriceField) {
      productPriceField.removeAttribute('required');
    }
    if (editProductPriceField) {
      editProductPriceField.removeAttribute('required');
    }
    
    console.log('Grupos de preço escondidos e required removido');
  } else {
    // Mostrar grupos de preço completos
    if (productPriceGroup) {
      productPriceGroup.style.display = 'flex';
    }
    if (editProductPriceGroup) {
      editProductPriceGroup.style.display = 'flex';
    }
    
    // Adicionar required aos campos
    if (productPriceField) {
      productPriceField.setAttribute('required', '');
    }
    if (editProductPriceField) {
      editProductPriceField.setAttribute('required', '');
    }
    
    console.log('Grupos de preço mostrados e required adicionado');
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

// Função para verificar configurações de preço do inventário atual
async function checkInventoryPriceSettings() {
  if (!selectedInventoryId) {
    console.log('Nenhum inventário selecionado');
    return;
  }
  
  try {
    const response = await fetch(`/produtos/${selectedInventoryId}`);
    const data = await response.json();
    
    if (response.ok) {
      const inventario = data.inventario;
      const semPreco = inventario?.semPreco || false;
      console.log('Configuração do inventário atual - semPreco:', semPreco);
      updateProductModalsForInventory(semPreco);
    }
  } catch (error) {
    console.error('Erro ao verificar configurações do inventário:', error);
  }
}

// Função para abrir o dialog de produto
async function openProductDialog() {
  // Verificar se o inventário atual é sem preço
  await checkInventoryPriceSettings();
  
  dialogCreateProduct.style.display = "block";
  const overlay = document.querySelector('.overlay');
  if (overlay) overlay.classList.add("darkBackground");
  // Remove event listeners antigos antes de adicionar um novo
  saveProductButton.onclick = async () => {
    dialogCreateProduct.style.display = "none";
    overlay.classList.remove("darkBackground");
    document.body.classList.remove("modal-open");
    try {
      const nome = productName.value;
      const quantidade = parseInt(productQuantity.value);
      
      // Verifica se o preço deve ser usado ou se é um inventário sem preço
      const precoValue = productPrice.value;
      const preco = precoValue && precoValue.trim() !== '' ? parseFloat(precoValue) : 0;

      if (!nome) {
        alert("Por favor, preencha o nome do produto!");
        return;
      }
      
      if (isNaN(quantidade) || quantidade < 0) {
        alert("Por favor, insira uma quantidade válida!");
        return;
      }
      
      // Só valida preço se o campo estiver visível e obrigatório
      if (productPrice.hasAttribute('required') && productPrice.style.display !== 'none') {
        if (isNaN(preco) || preco < 0) {
          alert("Por favor, insira um preço válido!");
          return;
        }
      }
      
      console.log('Criando produto:', { nome, quantidade, preco, semPreco: !productPrice.hasAttribute('required') }); 

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
      overlay.classList.remove("darkBackground");
    } else if (button.id === 'closeDialogEditProduct') {
      dialogEditProduct.style.display = "none";
      overlay.classList.remove("darkBackground");
    } else if (button.id === 'closeDialogCreateInventory') {
      dialogCreateInventory.style.display = "none";
      overlay.classList.remove("show");
      document.body.classList.remove("modal-open");
    } else if (button.id === 'closeDialogProfile') {
      dialogProfile.style.display = 'none';
      overlay.classList.remove("darkBackground");
    }
    clearProductInputs();
    selectedProductId = null; 
  });
});

// Evento de clique no inventário
inventoryList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('inventory')) {
    console.log('Inventário clicado:', e.target.textContent);
    console.log('ID do inventário:', e.target.dataset.id);
    
    // Remove a classe 'selected' de todos os inventários
    document.querySelectorAll('.inventory').forEach(inv => {
      inv.classList.remove('selected');
    });
    
    // Adiciona a classe 'selected' ao inventário clicado
    e.target.classList.add('selected');
    
    if (mainTitle) {
      mainTitle.textContent = e.target.textContent.replace(" >", "");
    } else {
      console.error('Elemento mainTitle não encontrado!');
    }
    
    deleteInventoryBtn.style.opacity = "1";
    deleteInventoryBtn.style.visibility = "visible"
    selectedInventoryId = e.target.dataset.id;
    
    console.log('Chamando renderProducts com ID:', selectedInventoryId);
    await renderProducts(selectedInventoryId);
  }
});

// Event listener removido - lógica incorreta

updateProductButton.addEventListener('click', async () => {
  try {
    const editName = editProductName.value.trim();
    const editQuantity = parseInt(editProductQuantity.value);
    const editPrice = parseFloat(editProductPrice.value) || 0;
    const idProduct = window.idProduto;

    // Validação dos campos
    if (!editName) {
      alert("Por favor, preencha o nome do produto.");
      return;
    }
    
    if (isNaN(editQuantity) || editQuantity < 0) {
      alert("Por favor, insira uma quantidade válida.");
      return;
    }
    
    // Só valida preço se o campo estiver visível e obrigatório
    if (editProductPrice.hasAttribute('required') && (isNaN(editPrice) || editPrice < 0)) {
      alert("Por favor, insira um preço válido.");
      return;
    }

    if (!idProduct) {
      alert("Erro: ID do produto não encontrado.");
      return;
    }

    console.log('Atualizando produto:', { idProduct, editName, editPrice, editQuantity });

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
    }

    // Fechar modal e limpar
    dialogEditProduct.style.display = "none";
    overlay.classList.remove("darkBackground");
    clearProductInputs();
    
    // Atualizar lista de produtos
    await renderProducts(selectedInventoryId);
    selectedProductId = null;
    
    console.log('Produto atualizado com sucesso');

  } catch (error) {
    console.error("Falha ao editar produto.", error);
    alert("Erro ao salvar as alterações do produto.");
  }
});

// Event listeners removidos - botões não existem no HTML

// Fechar modais ao clicar no overlay
overlay.addEventListener('click', () => {
  dialogCreateProduct.style.display = "none";
  dialogEditProduct.style.display = "none";
  dialogCreateInventory.style.display = "none";
  overlay.classList.remove("show");
  overlay.classList.remove("darkBackground");
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

// Event listeners para modal de perfil
logo.addEventListener('click', async () => {
  console.log('Logo clicada');
  console.log('dialogProfile:', dialogProfile);
  console.log('overlay:', overlay);
  
  await loadProfileData();
  
  if (dialogProfile) {
    dialogProfile.style.display = 'block';
  } else {
    console.error('dialogProfile não encontrado');
  }
  
  if (overlay) {
    overlay.classList.add('darkBackground');
  } else {
    console.error('overlay não encontrado');
  }
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
});

editNameButton.addEventListener('click', () => {
  const currentName = profileNameDisplay.textContent;
  if (currentName === 'Clique no lápis para adicionar nome') {
    profileNameInput.value = '';
  } else {
    profileNameInput.value = currentName;
  }
  nameDisplayContainer.style.display = 'none';
  nameEditContainer.style.display = 'flex';
  profileNameInput.focus();
});

profileNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    nameDisplayContainer.style.display = 'flex';
    nameEditContainer.style.display = 'none';
  } else if (e.key === 'Enter') {
    saveNameButton.click();
  }
});

// Event listener para salvar o nome
saveNameButton.addEventListener('click', async () => {
  const nome = profileNameInput.value.trim();
  
  if (!nome) {
    alert('Por favor, insira um nome válido.');
    return;
  }
  
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }
  
  try {
    const response = await fetch(`/perfil/${usuario.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome })
    });
    
    if (!response.ok) {
      const data = await response.json();
      alert('Erro ao atualizar nome: ' + (data.error || 'Erro desconhecido'));
      return;
    }
    
    const data = await response.json();
    
    // Atualizar localStorage com novo nome
    usuario.nome = data.usuario.nome;
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    // Atualizar display e voltar ao modo visualização
    profileNameDisplay.textContent = data.usuario.nome;
    nameDisplayContainer.style.display = 'flex';
    nameEditContainer.style.display = 'none';
    
    alert('Nome atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar nome:', error);
    alert('Erro de conexão. Tente novamente.');
  }
});

// Função para carregar dados do perfil
async function loadProfileData() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`/perfil/${usuario.id}`);
    const data = await response.json();

    if (response.ok) {
      profileNameDisplay.textContent = data.usuario.nome || 'Clique no lápis para adicionar nome';
      profileEmail.textContent = data.usuario.email;
      profileInventoryCount.textContent = data.estatisticas.inventarios;
      profileProductCount.textContent = data.estatisticas.produtos;
    } else {
      console.error('Erro ao carregar perfil:', data.error);
      profileNameDisplay.textContent = usuario.nome || 'Clique no lápis para adicionar nome';
      profileEmail.textContent = usuario.email || '-';
      profileInventoryCount.textContent = '0';
      profileProductCount.textContent = '0';
    }
  } catch (error) {
    console.error('Erro ao buscar dados do perfil:', error);
    profileNameDisplay.textContent = usuario.nome || 'Clique no lápis para adicionar nome';
    profileEmail.textContent = usuario.email || '-';
    profileInventoryCount.textContent = '0';
    profileProductCount.textContent = '0';
  }
}