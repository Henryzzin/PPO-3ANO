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
createBtn.addEventListener('click', () => {
  inventoryCount++;
  const name = `Inventário ${inventoryCount} >`;
  const a = document.createElement('a');
  a.href = "#";
  a.classList.add('inventory');
  a.textContent = name;
  inventoryList.appendChild(a);
});

// Deletar inventário
deleteBtn.addEventListener('click', () => {

});

// Mudar título ou editar nome
inventoryList.addEventListener('click', (e) => {
  if (e.target.classList.contains('inventory')) {
    mainTitle.textContent = e.target.textContent.replace(" >", "");
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