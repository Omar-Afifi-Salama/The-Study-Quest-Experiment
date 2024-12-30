    document.addEventListener('DOMContentLoaded', () => {
        loadGameData(); // Load user data FIRST!
        gameData.updateNavbar(); // Update navbar with loaded data

        const shopItemsContainer = document.getElementById('shop-items');
        const createItemPopup = document.getElementById('create-item-popup');
        const editItemPopup = document.getElementById('edit-item-popup');
        const openCreatePopupButton = document.getElementById('open-create-popup');
        const closeCreatePopupButton = document.getElementById('close-create-popup');
        const closeEditPopupButton = document.getElementById('close-edit-popup');
        const createItemForm = document.getElementById('item-form');
        const editItemForm = document.getElementById('edit-item-form');
        const deleteItemButton = document.getElementById('delete-item-button');

        let items = JSON.parse(localStorage.getItem('shopItems')) || [];
        let editingItemId = null;

        function renderItems() {
            if (!shopItemsContainer) return; // Check if container exists
            shopItemsContainer.innerHTML = '';
            items.forEach(item => {
                shopItemsContainer.appendChild(createItemElement(item));
            });
        }

        function createItemElement(item) {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('shop-item');
            itemDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>Time: ${item.time} minutes</p>
                <p>Energy Level: ${item.energy}</p>
                <p>Cost: ${item.coinCost.toLocaleString()} Coins, $${item.cashCost.toLocaleString()}</p>
                <button class="purchase" data-item-id="${item.id}">Purchase</button>
                <button class="edit" data-item-id="${item.id}">Edit</button>
            `;
            return itemDiv;
        }

        function generateItemId() {
            return crypto.randomUUID();
        }

        function handleCreateItem(event) {
            event.preventDefault();

            const itemName = document.getElementById('item-name').value;
            const time = parseInt(document.getElementById('time').value);
            const energy = parseInt(document.getElementById('energy').value);

            if (!itemName || isNaN(time) || isNaN(energy) || time < 1 || energy < 1 || energy > 10) {
                alert("Please fill in all fields correctly.");
                return;
            }

            const newItem = {
                id: editingItemId || generateItemId(),
                name: itemName,
                time: time,
                energy: energy,
                coinCost: Math.ceil(time * (energy / 2) * 0.05), // Divided by 5
                cashCost: Math.round(time * energy * (50 + Math.random() * 10)), // Between $50 and $75 per XP
            };

            if (editingItemId) {
                items = items.map(item => item.id === editingItemId ? newItem : item);
                editingItemId = null;
            } else {
                items.push(newItem);
            }

            localStorage.setItem('shopItems', JSON.stringify(items));
            renderItems();
            if(createItemForm){
                createItemForm.reset();
            }
            if(createItemPopup){
                createItemPopup.style.display = 'none';
            }
        }

        function handleEditItem(event) {
            event.preventDefault();
            const itemId = document.getElementById('edit-item-id').value;
            const itemName = document.getElementById('edit-item-name').value;
            const time = parseInt(document.getElementById('edit-time').value);
            const energy = parseInt(document.getElementById('edit-energy').value);

            if (!itemName || isNaN(time) || isNaN(energy) || time < 1 || energy < 1 || energy > 10) {
                alert("Please fill in all fields correctly.");
                return;
            }

            const updatedItem = {
                id: itemId,
                name: itemName,
                time: time,
                energy: energy,
                coinCost: Math.ceil(time * (energy / 2) * 0.4),
                cashCost: Math.round(time * energy * (2700 + Math.random() * 600)) / 100 // Corrected calculation
            };
            items = items.map(item => item.id === itemId ? updatedItem : item);
            localStorage.setItem('shopItems', JSON.stringify(items));
            renderItems();
            if(editItemPopup){
                editItemPopup.style.display = 'none';
            }
        }

        function handleDeleteItem() {
            const itemId = document.getElementById('edit-item-id').value;
            items = items.filter(item => item.id !== itemId);
            localStorage.setItem('shopItems', JSON.stringify(items));
            renderItems();
            if(editItemPopup){
                editItemPopup.style.display = 'none';
            }
        }

        function handleShopItemClick(event) {
            const itemId = event.target.dataset.itemId;
            if (!itemId) return;

            if (event.target.classList.contains('purchase')) {
                const item = items.find(item => item.id === itemId);
                if (item) {
                    purchaseItem(item.name, item.coinCost, item.cashCost);
                }
            } else if (event.target.classList.contains('edit')) {
                const item = items.find(item => item.id === itemId);
                if (item) {
                    if(document.getElementById('edit-item-id')){
                        document.getElementById('edit-item-id').value = item.id;
                    }
                    if(document.getElementById('edit-item-name')){
                        document.getElementById('edit-item-name').value = item.name;
                    }
                    if(document.getElementById('edit-time')){
                        document.getElementById('edit-time').value = item.time;
                    }
                    if(document.getElementById('edit-energy')){
                        document.getElementById('edit-energy').value = item.energy;
                    }
                    editingItemId = item.id;
                    if(editItemPopup){
                        editItemPopup.style.display = 'block';
                    }
                }
            } else if (event.target.classList.contains('delete')) {
                const confirmDelete = confirm("Are you sure you want to delete this item?");
                if (confirmDelete) {
                    const itemId = event.target.dataset.itemId;
                    items = items.filter(item => item.id !== itemId);
                    localStorage.setItem('shopItems', JSON.stringify(items));
                    renderItems();
                if(editItemPopup){
                    editItemPopup.style.display = 'none';
                }
                }
            }
        }

        if(openCreatePopupButton){
            openCreatePopupButton.addEventListener('click', () => {
                if(createItemPopup){
                    createItemPopup.style.display = 'block';
                }
                if(createItemForm){
                    createItemForm.reset();
                }
                editingItemId = null;
            });
        }

        if(closeCreatePopupButton){
            closeCreatePopupButton.addEventListener('click', () => {
                if(createItemPopup){
                    createItemPopup.style.display = 'none';
                }
            });
        }

        if(closeEditPopupButton){
            closeEditPopupButton.addEventListener('click', () => {
                if(editItemPopup){
                    editItemPopup.style.display = 'none';
                }
            });
        }

        if(createItemForm){
            createItemForm.addEventListener('submit', handleCreateItem);
        }
        if(editItemForm){
            editItemForm.addEventListener('submit', handleEditItem);
        }
        if(deleteItemButton){
            deleteItemButton.addEventListener('click', handleDeleteItem);
        }
        if(shopItemsContainer){
            shopItemsContainer.addEventListener('click', handleShopItemClick);
        }
        renderItems();
    });

    function purchaseItem(name, coinCost, cashCost){
        if(gameData.coins >= coinCost && gameData.cash >= cashCost){
            gameData.coins -= coinCost;
            gameData.cash -= cashCost;
            gameData.updateNavbar();
            alert(`You have purchased ${name}`);
        }
        else{
            alert("You do not have enough funds to purchase this item.");
        }
    }