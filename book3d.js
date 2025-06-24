// No início do arquivo, adicione:
let produtos3D = [];

// Modifique a função updateBook:
function updateBook() {
  // Carrega os produtos atualizados
  const dados = localStorage.getItem('catalogoNaldo');
  produtos3D = dados ? JSON.parse(dados).produtos : [];

  // Limpa a cena
  while(bookScene.children.length > 3) {
    bookScene.remove(bookScene.children[3]);
  }

  // Restante do código de criação do livro...

  // Atualiza o indicador de páginas
  totalPages = Math.max(1, Math.ceil(produtos3D.length / productsPerPage));
  document.getElementById('page-indicator').textContent = `Página ${currentPage + 1} de ${totalPages}`;

  // Adiciona os produtos
  if (produtos3D.length > 0) {
    const startIdx = currentPage * productsPerPage;
    const endIdx = Math.min(startIdx + productsPerPage, produtos3D.length);
    
    produtos3D.slice(startIdx, endIdx).forEach((produto, idx) => {
      // Código para adicionar cada produto na cena 3D
      const texture = new THREE.TextureLoader().load(produto.imagem);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const geometry = new THREE.PlaneGeometry(0.8, 0.8);
      const productMesh = new THREE.Mesh(geometry, material);
      
      // Posicionamento
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      productMesh.position.set(-1.2 + col * 0.8, 1.5 - row * 1.0, 0.26);
      
      bookScene.add(productMesh);
    });
  }
}