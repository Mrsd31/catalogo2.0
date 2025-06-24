document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const loginModal = document.getElementById('loginModal');
    const adminPanel = document.getElementById('adminPanel');
    const storeFront = document.getElementById('storeFront');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminAccessBtn = document.getElementById('adminAccessBtn');
    const productForm = document.getElementById('productForm');
    const productsContainer = document.getElementById('productsContainer');
    const productsGrid = document.getElementById('productsGrid');
    const categories = document.querySelectorAll('.categories a');
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.getElementById('cartSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.querySelector('.close-sidebar');
    const cartItems = document.getElementById('cartItems');
    const cartCounter = document.getElementById('cartCounter');
    const cartTotal = document.getElementById('cartTotal');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const productImages = document.getElementById('productImages');
    const imagePreview = document.getElementById('imagePreview');

    // Credenciais do Admin
    const ADMIN_CREDENTIALS = {
        email: 'admin@example.com',
        password: 'admin123'
    };

    // Dados da loja
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Verificar se o admin já está logado
    checkAdminLogin();

    // Event Listeners
    adminAccessBtn.addEventListener('click', showLoginModal);
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    productForm.addEventListener('submit', addProduct);
    productImages.addEventListener('change', previewImages);
    categories.forEach(category => category.addEventListener('click', filterProducts));
    cartIcon.addEventListener('click', toggleCart);
    closeSidebar.addEventListener('click', toggleCart);
    sidebarOverlay.addEventListener('click', toggleCart);
    clearCartBtn.addEventListener('click', clearCart);
    checkoutBtn.addEventListener('click', checkout);

    // Inicializar a loja
    renderAdminProducts();
    renderStoreProducts();

    // Funções
    function checkAdminLogin() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        if (isLoggedIn) {
            adminPanel.style.display = 'block';
            storeFront.style.display = 'none';
        } else {
            adminPanel.style.display = 'none';
            storeFront.style.display = 'block';
        }
    }

    function showLoginModal() {
        loginModal.style.display = 'flex';
    }

    function hideLoginModal() {
        loginModal.style.display = 'none';
    }

    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            adminPanel.style.display = 'block';
            storeFront.style.display = 'none';
            hideLoginModal();
            loginForm.reset();
        } else {
            alert('Credenciais incorretas!');
        }
    }

    function handleLogout() {
        localStorage.removeItem('adminLoggedIn');
        adminPanel.style.display = 'none';
        storeFront.style.display = 'block';
    }

    function previewImages() {
        imagePreview.innerHTML = '';
        const files = productImages.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;

            const reader = new FileReader();
            reader.onload = function(e) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-image';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                
                const removeBtn = document.createElement('span');
                removeBtn.innerHTML = '&times;';
                removeBtn.className = 'remove-image';
                removeBtn.addEventListener('click', function() {
                    imgContainer.remove();
                    // Criar nova FileList sem a imagem removida (simplificado)
                });
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                imagePreview.appendChild(imgContainer);
            };
            reader.readAsDataURL(file);
        }
    }

    function addProduct(e) {
        e.preventDefault();
        
        const category = document.getElementById('productCategory').value;
        const code = document.getElementById('productCode').value.trim();
        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const files = productImages.files;

        // Validação
        if (!category || !code || !name || isNaN(price) || price <= 0 || files.length === 0) {
            alert('Preencha todos os campos corretamente!');
            return;
        }

        // Processar imagens
        const images = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;

            const reader = new FileReader();
            reader.onload = function(e) {
                images.push(e.target.result);

                // Quando todas as imagens estiverem processadas
                if (images.length === files.length) {
                    const newProduct = {
                        id: Date.now().toString(),
                        category,
                        code,
                        name,
                        price,
                        images
                    };

                    products.push(newProduct);
                    saveProducts();
                    renderAdminProducts();
                    renderStoreProducts();
                    productForm.reset();
                    imagePreview.innerHTML = '';
                    alert('Produto adicionado com sucesso!');
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function renderAdminProducts() {
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">Nenhum produto cadastrado.</p>';
            return;
        }

        products.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'product-card';
            productEl.innerHTML = `
                <div class="product-images">
                    ${product.images.map(img => `<img src="${img}" alt="${product.name}">`).join('')}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-meta">
                        <span>Código: ${product.code}</span>
                        <span>Categoria: ${product.category}</span>
                    </div>
                    <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                    <div class="product-actions">
                        <button class="btn danger-btn remove-product" data-id="${product.id}">Remover</button>
                    </div>
                </div>
            `;

            productsContainer.appendChild(productEl);
        });

        // Adicionar eventos de remoção
        document.querySelectorAll('.remove-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeProduct(productId);
            });
        });
    }

    function removeProduct(id) {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            products = products.filter(product => product.id !== id);
            saveProducts();
            renderAdminProducts();
            renderStoreProducts();
            updateCart();
        }
    }

    function renderStoreProducts(category = 'all') {
        productsGrid.innerHTML = '';

        const filteredProducts = category === 'all' 
            ? products 
            : products.filter(product => product.category === category);

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<p class="no-products">Nenhum produto encontrado nesta categoria.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'store-product';
            productEl.innerHTML = `
                <img src="${product.images[0]}" alt="${product.name}">
                <div class="store-product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">R$ ${product.price.toFixed(2)}</p>
                    <button class="add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
                </div>
            `;

            productsGrid.appendChild(productEl);
        });

        // Adicionar eventos ao carrinho
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId);
            });
        });
    }

    function filterProducts(e) {
        e.preventDefault();
        const category = this.getAttribute('data-category');

        // Atualizar categoria ativa
        categories.forEach(cat => cat.classList.remove('active'));
        this.classList.add('active');

        // Filtrar produtos
        renderStoreProducts(category);
    }

    function addToCart(productId) {
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId,
                quantity: 1
            });
        }

        saveCart();
        updateCart();
        toggleCart();
    }

    function updateCart() {
        // Atualizar contador
        cartCounter.textContent = cart.reduce((total, item) => total + item.quantity, 0);

        // Atualizar itens do carrinho
        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio.</p>';
            cartTotal.textContent = 'R$ 0,00';
            return;
        }

        let total = 0;

        cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return;

            total += product.price * item.quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-img">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${product.name}</h4>
                    <p class="cart-item-price">R$ ${product.price.toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <button class="quantity-btn decrease" data-id="${product.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${product.id}">
                        <button class="quantity-btn increase" data-id="${product.id}">+</button>
                        <button class="remove-item" data-id="${product.id}">Remover</button>
                    </div>
                </div>
            `;

            cartItems.appendChild(cartItem);
        });

        // Atualizar total
        cartTotal.textContent = `R$ ${total.toFixed(2)}`;

        // Adicionar eventos aos controles de quantidade
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateCartItem(productId, -1);
            });
        });

        document.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateCartItem(productId, 1);
            });
        });

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.getAttribute('data-id');
                const newQuantity = parseInt(this.value);

                if (isNaN(newQuantity) || newQuantity < 1) {
                    this.value = 1;
                    return;
                }

                updateCartItem(productId, 0, newQuantity);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
    }

    function updateCartItem(productId, change, newQuantity = null) {
        const item = cart.find(item => item.productId === productId);
        if (!item) return;

        if (newQuantity !== null) {
            item.quantity = newQuantity;
        } else {
            item.quantity += change;
        }

        if (item.quantity < 1) {
            item.quantity = 1;
        }

        saveCart();
        updateCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.productId !== productId);
        saveCart();
        updateCart();
    }

    function clearCart() {
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            cart = [];
            saveCart();
            updateCart();
        }
    }

    function toggleCart() {
        cartSidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
    }

    function checkout() {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        const phoneNumber = '5511999999999'; // Substitua pelo seu número
        let message = '📦 *Pedido da Loja* 📦\n\n';
        message += 'Itens do pedido:\n\n';

        let total = 0;
        cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return;

            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            message += `➡️ *${product.name}*\n`;
            message += `💰 Preço unitário: R$ ${product.price.toFixed(2)}\n`;
            message += `✖️ Quantidade: ${item.quantity}\n`;
            message += `🔢 Código: ${product.code}\n`;
            message += `💲 Total: R$ ${itemTotal.toFixed(2)}\n\n`;
        });

        message += `*TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    }

    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
});