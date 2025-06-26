// Dados dos produtos
let products = JSON.parse(localStorage.getItem('catalogProducts')) || [];

// Elementos do DOM
const addProductForm = document.getElementById('add-product-form');
const productNameInput = document.getElementById('product-name');
const productCodeInput = document.getElementById('product-code');
const productPriceInput = document.getElementById('product-price');
const productOldPriceInput = document.getElementById('product-old-price');
const productCategorySelect = document.getElementById('product-category');
const productStockInput = document.getElementById('product-stock');
const productDescriptionInput = document.getElementById('product-description');
const productImageInput = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');
const adminProductsContainer = document.getElementById('admin-products-container');
const cancelBtn = document.getElementById('cancel-btn');
const showingElement = document.getElementById('showing');
const totalElement = document.getElementById('total');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    setupEventListeners();
});

// Renderizar lista de produtos
function renderProducts() {
    adminProductsContainer.innerHTML = '';
    
    if (products.length === 0) {
        adminProductsContainer.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>Nenhum produto cadastrado</p>
            </div>
        `;
        showingElement.textContent = '0';
        totalElement.textContent = '0';
        return;
    }
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'admin-product-card';
        productElement.innerHTML = `
            <div class="delete-product" data-id="${product.id}">
                <i class="fas fa-trash"></i>
            </div>
            <img src="${product.image}" alt="${product.name}" class="admin-product-image">
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p>Código: ${product.code}</p>
                <p>Categoria: ${getCategoryName(product.category)}</p>
                ${product.oldPrice ? `
                    <p class="product-price-admin">
                        R$ ${product.price.toFixed(2)} 
                        <small style="text-decoration: line-through; color: #999; margin-left: 5px;">
                            R$ ${product.oldPrice.toFixed(2)}
                        </small>
                    </p>
                ` : `
                    <p class="product-price-admin">R$ ${product.price.toFixed(2)}</p>
                `}
                ${product.stock ? `<p>Estoque: ${product.stock}</p>` : ''}
            </div>
        `;
        adminProductsContainer.appendChild(productElement);
    });
    
    showingElement.textContent = products.length;
    totalElement.textContent = products.length;
    
    // Adicionar eventos aos botões de deletar
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Preview de imagem
    productImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                document.querySelector('.file-name').textContent = file.name;
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Adicionar produto
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
    
    // Cancelar
    cancelBtn.addEventListener('click', resetForm);
}

// Adicionar produto
function addProduct() {
    const name = productNameInput.value.trim();
    const code = productCodeInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const oldPrice = parseFloat(productOldPriceInput.value) || null;
    const category = productCategorySelect.value;
    const stock = parseInt(productStockInput.value) || 0;
    const description = productDescriptionInput.value.trim();
    const imageFile = productImageInput.files[0];
    
    if (!name || !code || isNaN(price) || !category || !imageFile) {
        showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const newProduct = {
            id: Date.now(),
            name,
            code,
            price,
            oldPrice,
            category,
            stock,
            description,
            image: e.target.result
        };
        
        products.push(newProduct);
        localStorage.setItem('catalogProducts', JSON.stringify(products));
        
        renderProducts();
        resetForm();
        showNotification('Produto adicionado com sucesso!');
    };
    
    reader.readAsDataURL(imageFile);
}

// Deletar produto
function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    products = products.filter(p => p.id !== parseInt(productId));
    localStorage.setItem('catalogProducts', JSON.stringify(products));
    renderProducts();
    showNotification('Produto excluído com sucesso!');
}

// Resetar formulário
function resetForm() {
    addProductForm.reset();
    imagePreview.innerHTML = '<span>Pré-visualização da imagem aparecerá aqui</span>';
    document.querySelector('.file-name').textContent = 'Nenhum arquivo selecionado';
}

// Obter nome da categoria
function getCategoryName(category) {
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

// Mostrar notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Estilo dinâmico para notificações
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .no-products {
        text-align: center;
        padding: 40px 0;
        color: var(--text-light);
        grid-column: 1 / -1;
    }
    
    .no-products i {
        font-size: 50px;
        margin-bottom: 15px;
        color: var(--border-color);
    }
`;
document.head.appendChild(notificationStyle);