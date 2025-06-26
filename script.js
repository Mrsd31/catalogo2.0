// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se estamos na página admin ou na loja
    const isAdminPage = window.location.pathname.includes('admin.html');

    // Sistema de produtos
    class ProductSystem {
        constructor() {
            this.products = JSON.parse(localStorage.getItem('products')) || [];
            this.cart = JSON.parse(localStorage.getItem('cart')) || [];
            this.adminPassword = "admin123"; // Senha padrão - altere para a senha que desejar
            this.init();
        }

        init() {
            if (!isAdminPage) {
                this.renderProducts();
                this.setupCart();
            } else {
                this.checkAdminAccess();
            }
        }

        // ADMIN ACCESS CONTROL
        checkAdminAccess() {
            const storedPassword = localStorage.getItem('adminPassword');
            const isAuthenticated = storedPassword === this.adminPassword;
            
            if (!isAuthenticated) {
                const password = prompt("Digite a senha de administrador:");
                if (password === this.adminPassword) {
                    localStorage.setItem('adminPassword', this.adminPassword);
                    this.setupAdmin();
                } else {
                    alert("Senha incorreta. Redirecionando para a loja.");
                    window.location.href = "index.html";
                }
            } else {
                this.setupAdmin();
            }
        }

        // ADMIN FUNCTIONS
        setupAdmin() {
            // Carrega os produtos na página admin
            this.renderAdminProducts();

            // Configura o formulário de adicionar produto
            const addProductForm = document.getElementById('add-product-form');
            if (addProductForm) {
                addProductForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.addProduct();
                });

                // Preview da imagem
                const imageInput = document.getElementById('product-image');
                if (imageInput) {
                    imageInput.addEventListener('change', (e) => {
                        this.previewImage(e.target);
                    });
                }

                // Botão cancelar
                const cancelBtn = document.getElementById('cancel-btn');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        addProductForm.reset();
                        document.getElementById('image-preview').innerHTML = '<span>Pré-visualização da imagem aparecerá aqui</span>';
                        document.querySelector('.file-name').textContent = 'Nenhum arquivo selecionado';
                    });
                }
            }

            // Configura a busca na página admin
            const searchBox = document.querySelector('.admin-card .search-box input');
            if (searchBox) {
                searchBox.addEventListener('input', (e) => {
                    this.searchProducts(e.target.value);
                });
            }
        }

        previewImage(input) {
            const preview = document.getElementById('image-preview');
            const fileName = document.querySelector('.file-name');
            
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Pré-visualização da imagem">`;
                }
                
                reader.readAsDataURL(input.files[0]);
                fileName.textContent = input.files[0].name;
            }
        }

        addProduct() {
            const name = document.getElementById('product-name').value;
            const code = document.getElementById('product-code').value;
            const price = parseFloat(document.getElementById('product-price').value);
            const oldPrice = parseFloat(document.getElementById('product-old-price').value) || 0;
            const category = document.getElementById('product-category').value;
            const stock = parseInt(document.getElementById('product-stock').value) || 0;
            const description = document.getElementById('product-description').value;
            const imageInput = document.getElementById('product-image');
            
            if (!name || !code || !price || !imageInput.files[0]) {
                this.showNotification('Preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            // Converter imagem para base64
            const reader = new FileReader();
            reader.onload = (e) => {
                const newProduct = {
                    id: Date.now().toString(),
                    name,
                    code,
                    price,
                    oldPrice: oldPrice > price ? oldPrice : 0,
                    category,
                    stock,
                    description,
                    image: e.target.result,
                    createdAt: new Date().toISOString()
                };
                
                this.products.unshift(newProduct);
                this.saveProducts();
                this.renderAdminProducts();
                document.getElementById('add-product-form').reset();
                document.getElementById('image-preview').innerHTML = '<span>Pré-visualização da imagem aparecerá aqui</span>';
                document.querySelector('.file-name').textContent = 'Nenhum arquivo selecionado';
                this.showNotification('Produto adicionado com sucesso!');
            };
            reader.readAsDataURL(imageInput.files[0]);
        }

        searchProducts(query) {
            const filtered = this.products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) || 
                product.code.toLowerCase().includes(query.toLowerCase())
            );
            this.renderAdminProducts(filtered);
        }

        renderAdminProducts(productsToRender = null) {
            const container = document.getElementById('admin-products-container');
            if (!container) return;
            
            const products = productsToRender || this.products;
            
            container.innerHTML = products.map(product => `
                <div class="admin-product-card" data-id="${product.id}">
                    <div class="delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </div>
                    <img src="${product.image}" alt="${product.name}" class="admin-product-image">
                    <div class="admin-product-info">
                        <h3>${product.name}</h3>
                        <p>Código: ${product.code}</p>
                        <p>Categoria: ${this.getCategoryName(product.category)}</p>
                        <p class="product-price-admin">R$ ${product.price.toFixed(2)}</p>
                        ${product.oldPrice > 0 ? `<p class="product-old-price">De: R$ ${product.oldPrice.toFixed(2)}</p>` : ''}
                        <p>Estoque: ${product.stock}</p>
                    </div>
                </div>
            `).join('');
            
            // Atualiza contagem de produtos
            document.getElementById('showing').textContent = products.length;
            document.getElementById('total').textContent = this.products.length;
            
            // Adiciona eventos de deletar
            document.querySelectorAll('.delete-product').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    this.deleteProduct(id);
                });
            });
        }

        deleteProduct(id) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                this.products = this.products.filter(product => product.id !== id);
                this.saveProducts();
                this.renderAdminProducts();
                this.showNotification('Produto excluído com sucesso!');
            }
        }

        getCategoryName(category) {
            const categories = {
                'papelaria': 'Papelaria',
                'eletronicos': 'Eletrônicos',
                'cosmeticos': 'Cosméticos',
                'livros': 'Livros',
                'roupas': 'Roupas',
                'alimentos': 'Alimentos',
                'brinquedos': 'Brinquedos',
                'casa-jardim': 'Casa e Jardim'
            };
            return categories[category] || category;
        }

        // STORE FUNCTIONS
        renderProducts(filterCategory = 'todos') {
            const container = document.getElementById('products-container');
            if (!container) return;
            
            let filteredProducts = this.products;
            
            if (filterCategory !== 'todos') {
                filteredProducts = this.products.filter(product => product.category === filterCategory);
            }
            
            container.innerHTML = filteredProducts.map(product => `
                <div class="product-card" data-category="${product.category}">
                    ${product.oldPrice > product.price ? `<div class="product-badge">Oferta</div>` : ''}
                    <div class="product-image-container">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-code">Código: ${product.code}</p>
                        <div class="product-price-container">
                            ${product.oldPrice > product.price ? 
                                `<span class="product-old-price">R$ ${product.oldPrice.toFixed(2)}</span>` : ''}
                            <span class="product-price">R$ ${product.price.toFixed(2)}</span>
                        </div>
                        <button class="add-to-cart" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Adicionar
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Adiciona eventos aos botões de adicionar ao carrinho
            document.querySelectorAll('.add-to-cart').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    this.addToCart(id);
                    e.stopPropagation(); // Impede eventos de outros elementos
                });
            });
        }

        // CART FUNCTIONS
        setupCart() {
            // Filtro de categorias
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const category = btn.getAttribute('data-category');
                    this.renderProducts(category);
                });
            });
            
            // Ícone do carrinho
            const cartIcon = document.getElementById('cart-icon');
            if (cartIcon) {
                cartIcon.addEventListener('click', () => {
                    this.toggleCartModal();
                });
            }
            
            // Fechar modal do carrinho
            const closeCart = document.querySelector('.close-cart');
            if (closeCart) {
                closeCart.addEventListener('click', () => {
                    this.toggleCartModal(false);
                });
            }
            
            // Botão finalizar pedido
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => {
                    this.checkout();
                });
            }
            
            // Atualiza contador do carrinho
            this.updateCartCount();
        }

        addToCart(productId) {
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                console.error('Produto não encontrado:', productId);
                return;
            }
            
            const existingItem = this.cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({
                    ...product,
                    quantity: 1
                });
            }
            
            this.saveCart();
            this.updateCartCount();
            this.showNotification(`${product.name} adicionado ao carrinho!`);
            
            // Se o carrinho estiver aberto, atualiza
            if (document.getElementById('cart-modal')?.style.display === 'block') {
                this.renderCartItems();
            }
        }

        toggleCartModal(show = null) {
            const modal = document.getElementById('cart-modal');
            if (!modal) return;
            
            if (show === null) {
                show = modal.style.display !== 'block';
            }
            
            modal.style.display = show ? 'block' : 'none';
            
            if (show) {
                this.renderCartItems();
            }
        }

        renderCartItems() {
            const container = document.getElementById('cart-items');
            if (!container) return;
            
            if (this.cart.length === 0) {
                container.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Seu carrinho está vazio</p>
                    </div>
                `;
                this.updateCartTotals();
                return;
            }
            
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${item.name}</h3>
                        <p class="cart-item-code">Código: ${item.code}</p>
                        <p class="cart-item-price">R$ ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <div class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            `).join('');
            
            // Adiciona eventos aos botões de quantidade e remover
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    this.updateCartItemQuantity(id, -1);
                    e.stopPropagation();
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    this.updateCartItemQuantity(id, 1);
                    e.stopPropagation();
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    this.removeFromCart(id);
                    e.stopPropagation();
                });
            });
            
            this.updateCartTotals();
        }

        updateCartItemQuantity(productId, change) {
            const item = this.cart.find(item => item.id === productId);
            if (!item) return;
            
            item.quantity += change;
            
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(item => item.id !== productId);
            }
            
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
        }

        removeFromCart(productId) {
            this.cart = this.cart.filter(item => item.id !== productId);
            this.saveCart();
            this.updateCartCount();
            this.renderCartItems();
            this.showNotification('Item removido do carrinho');
        }

        updateCartTotals() {
            const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discount = this.cart.reduce((sum, item) => {
                return sum + (item.oldPrice > item.price ? (item.oldPrice - item.price) * item.quantity : 0);
            }, 0);
            const total = subtotal - discount;
            
            if (document.getElementById('cart-subtotal')) {
                document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2);
                document.getElementById('cart-discount').textContent = discount.toFixed(2);
                document.getElementById('cart-total').textContent = total.toFixed(2);
            }
        }

        checkout() {
            if (this.cart.length === 0) {
                this.showNotification('Seu carrinho está vazio', 'error');
                return;
            }
            
            // Formata os itens para mensagem do WhatsApp
            const itemsText = this.cart.map(item => 
                `*${item.name}* (${item.code})\n` +
                `Quantidade: ${item.quantity}\n` +
                `Preço unitário: R$ ${item.price.toFixed(2)}\n` +
                `Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n`
            ).join('\n');
            
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const message = `Olá, gostaria de fazer um pedido:\n\n${itemsText}\n*Total: R$ ${total.toFixed(2)}*`;
            
            // Codifica a mensagem para URL
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
            
            // Abre no WhatsApp
            window.open(whatsappUrl, '_blank');
        }

        // UTILITY FUNCTIONS
        saveProducts() {
            localStorage.setItem('products', JSON.stringify(this.products));
        }

        saveCart() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        }

        updateCartCount() {
            const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = count;
                cartCount.style.display = count > 0 ? 'flex' : 'none';
            }
        }

        showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                ${message}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }
    }

    // Inicializa o sistema
    const productSystem = new ProductSystem();
});