// Admin JS Content
let articlesData = [];
let productsData = [];
let categoriesData = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Load config from localStorage
    document.getElementById('ghOwner').value = localStorage.getItem('ghOwner') || '';
    document.getElementById('ghRepo').value = localStorage.getItem('ghRepo') || '';
    document.getElementById('ghToken').value = localStorage.getItem('ghToken') || '';
    document.getElementById('ghBranch').value = localStorage.getItem('ghBranch') || 'main';

    // Save config on input
    ['ghOwner', 'ghRepo', 'ghToken', 'ghBranch'].forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            localStorage.setItem(id, e.target.value);
        });
    });

    // Tab logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
        });
    });

    // Load initial JSON data
    await loadInitialData();

    // Setup forms
    document.getElementById('formArticle').addEventListener('submit', saveArticle);
    document.getElementById('formProduct').addEventListener('submit', saveProduct);
    document.getElementById('formCategory').addEventListener('submit', saveCategory);

    // Setup Publish Button
    document.getElementById('btnPublish').addEventListener('click', publishToGitHub);
});

async function loadInitialData() {
    try {
        const artRes = await fetch('data/articles.json?' + new Date().getTime());
        articlesData = await artRes.json();
    } catch (e) {
        console.warn("Could not load articles.json, starting empty.");
        articlesData = [];
    }

    try {
        const prodRes = await fetch('data/products.json?' + new Date().getTime());
        productsData = await prodRes.json();
    } catch (e) {
        console.warn("Could not load products.json, starting empty.");
        productsData = [];
    }

    try {
        const catRes = await fetch('data/categories.json?' + new Date().getTime());
        categoriesData = await catRes.json();
    } catch (e) {
        console.warn("Could not load categories.json, starting empty.");
        categoriesData = [];
    }
    
    populateCategoryDropdowns();
    renderArticles();
    renderProducts();
    renderCategories();
}

// ================= ARTICLES =================
function renderArticles() {
    const tbody = document.querySelector('#tableArticles tbody');
    tbody.innerHTML = '';
    articlesData.forEach((art, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${art.id}</td>
                <td><img src="${art.image}" width="60" alt=""></td>
                <td><strong>${art.title}</strong><br><small>${art.description.substring(0, 50)}...</small></td>
                <td><span class="badge">${art.category}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="moveArticle(${index}, -1)">▲</button>
                    <button class="btn btn-secondary btn-sm" onclick="moveArticle(${index}, 1)">▼</button>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editArticle(${index})">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteArticle(${index})">Xóa</button>
                </td>
            </tr>
        `;
    });
}

function moveArticle(index, dir) {
    if (index + dir < 0 || index + dir >= articlesData.length) return;
    const temp = articlesData[index];
    articlesData[index] = articlesData[index + dir];
    articlesData[index + dir] = temp;
    renderArticles();
}

function editArticle(index) {
    const art = articlesData[index];
    document.getElementById('artIndex').value = index;
    document.getElementById('artId').value = art.id || '';
    document.getElementById('artTitle').value = art.title || '';
    document.getElementById('artDesc').value = art.description || '';
    document.getElementById('artCategory').value = art.category || '';
    document.getElementById('artBadge').value = art.badge || '';
    document.getElementById('artUrl').value = art.url || 'article.html';
    document.getElementById('artImage').value = art.image || '';
    
    // Check the corresponding products
    document.querySelectorAll('input[name="artProducts"]').forEach(cb => cb.checked = false);
    if (art.productIds && Array.isArray(art.productIds)) {
        art.productIds.forEach(pid => {
            const cb = document.querySelector(`input[name="artProducts"][value="${pid}"]`);
            if (cb) cb.checked = true;
        });
    }
    
    document.getElementById('modalArticleTitle').innerText = 'Sửa Bài Viết';
    document.getElementById('modalArticle').classList.add('active');
}

function openArticleModal() {
    document.getElementById('formArticle').reset();
    document.getElementById('artIndex').value = '';
    
    // Clear product checkboxes
    document.querySelectorAll('input[name="artProducts"]').forEach(cb => cb.checked = false);
    
    document.getElementById('modalArticleTitle').innerText = 'Thêm Bài Viết';
    document.getElementById('modalArticle').classList.add('active');
}

function saveArticle(e) {
    e.preventDefault();
    const index = document.getElementById('artIndex').value;
    
    // Get checked productIds
    const productIds = Array.from(document.querySelectorAll('input[name="artProducts"]:checked')).map(cb => cb.value);

    const art = {
        id: document.getElementById('artId').value,
        title: document.getElementById('artTitle').value,
        description: document.getElementById('artDesc').value,
        category: document.getElementById('artCategory').value,
        badge: document.getElementById('artBadge').value,
        url: document.getElementById('artUrl').value,
        image: document.getElementById('artImage').value,
        productIds: productIds
    };

    if (index === '') {
        articlesData.push(art);
    } else {
        articlesData[index] = art;
    }
    closeModal('modalArticle');
    renderArticles();
}

function deleteArticle(index) {
    if (confirm('Bạn chắc chắn muốn xóa bài viết này?')) {
        articlesData.splice(index, 1);
        renderArticles();
    }
}

// ================= PRODUCTS =================
function renderProducts() {
    const tbody = document.querySelector('#tableProducts tbody');
    tbody.innerHTML = '';
    productsData.forEach((prod, index) => {
        let img = prod.image || (prod.media && prod.media.length > 0 ? prod.media[0].thumb : '');
        tbody.innerHTML += `
            <tr>
                <td>${prod.id}</td>
                <td><img src="${img}" width="60" alt=""></td>
                <td><strong>${prod.title}</strong><br><small>${prod.trackingId}</small>&nbsp;<span class="badge" style="background:#17a2b8;">${prod.category || 'N/A'}</span></td>
                <td><del>${prod.originalPrice}</del><br><span style="color:#ee4d2d; font-weight:bold;">${prod.discountedPrice}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="moveProduct(${index}, -1)">▲</button>
                    <button class="btn btn-secondary btn-sm" onclick="moveProduct(${index}, 1)">▼</button>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editProduct(${index})">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">Xóa</button>
                </td>
            </tr>
        `;
    });
    populateProductCheckboxes();
}

function populateProductCheckboxes() {
    const container = document.getElementById('artProductCheckboxes');
    if (!container) return;
    
    container.innerHTML = productsData.map(p => `
        <label style="display: block; font-weight: normal; margin-bottom: 5px; cursor: pointer;">
            <input type="checkbox" name="artProducts" value="${p.id}"> 
            [${p.id}] ${p.title.substring(0, 50)}...
        </label>
    `).join('');
}

function moveProduct(index, dir) {
    if (index + dir < 0 || index + dir >= productsData.length) return;
    const temp = productsData[index];
    productsData[index] = productsData[index + dir];
    productsData[index + dir] = temp;
    renderProducts();
}

function openProductModal() {
    document.getElementById('formProduct').reset();
    document.getElementById('prodIndex').value = '';
    document.getElementById('prodMedia').value = '[]';
    document.getElementById('modalProductTitle').innerText = 'Thêm Sản Phẩm';
    document.getElementById('modalProduct').classList.add('active');
}

function editProduct(index) {
    const prod = productsData[index];
    document.getElementById('prodIndex').value = index;
    document.getElementById('prodId').value = prod.id || '';
    document.getElementById('prodCategory').value = prod.category || '';
    document.getElementById('prodTrackingId').value = prod.trackingId || '';
    document.getElementById('prodTitle').value = prod.title || '';
    document.getElementById('prodDesc').value = prod.desc || '';
    document.getElementById('prodRating').value = prod.rating || '';
    document.getElementById('prodSoldCount').value = prod.soldCount || '';
    document.getElementById('prodOriginalPrice').value = prod.originalPrice || '';
    document.getElementById('prodDiscountedPrice').value = prod.discountedPrice || '';
    document.getElementById('prodUrgencyText').value = prod.urgencyText || '';
    document.getElementById('prodLink').value = prod.link || '';
    document.getElementById('prodDiscountBadge').value = prod.discountBadge || '';
    
    document.getElementById('prodImage').value = prod.image || '';
    document.getElementById('prodMedia').value = JSON.stringify(prod.media || [], null, 2);

    document.getElementById('prodPros').value = (prod.pros || []).join('\n');
    document.getElementById('prodCons').value = (prod.cons || []).join('\n');
    document.getElementById('prodVouchers').value = (prod.vouchers || []).join('\n');

    document.getElementById('modalProductTitle').innerText = 'Sửa Sản Phẩm';
    document.getElementById('modalProduct').classList.add('active');
}

function saveProduct(e) {
    e.preventDefault();
    const index = document.getElementById('prodIndex').value;
    
    let media = [];
    try {
        media = JSON.parse(document.getElementById('prodMedia').value || '[]');
    } catch(err) {
        alert("JSON Mảng Media không hợp lệ!");
        return;
    }

    const prod = {
        id: document.getElementById('prodId').value,
        category: document.getElementById('prodCategory').value,
        trackingId: document.getElementById('prodTrackingId').value,
        title: document.getElementById('prodTitle').value,
        desc: document.getElementById('prodDesc').value,
        rating: document.getElementById('prodRating').value,
        soldCount: document.getElementById('prodSoldCount').value,
        pros: document.getElementById('prodPros').value.split('\n').filter(x => x.trim() !== ''),
        cons: document.getElementById('prodCons').value.split('\n').filter(x => x.trim() !== ''),
        originalPrice: document.getElementById('prodOriginalPrice').value,
        discountedPrice: document.getElementById('prodDiscountedPrice').value,
        urgencyText: document.getElementById('prodUrgencyText').value,
        vouchers: document.getElementById('prodVouchers').value.split('\n').filter(x => x.trim() !== ''),
        link: document.getElementById('prodLink').value,
        media: media,
        image: document.getElementById('prodImage').value,
        discountBadge: document.getElementById('prodDiscountBadge').value
    };

    if (index === '') {
        productsData.push(prod);
    } else {
        productsData[index] = prod;
    }
    closeModal('modalProduct');
    renderProducts();
}

function deleteProduct(index) {
    if (confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
        productsData.splice(index, 1);
        renderProducts();
    }
}

// ================= CATEGORIES =================
function renderCategories() {
    const tbody = document.querySelector('#tableCategories tbody');
    tbody.innerHTML = '';
    categoriesData.forEach((cat, index) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${cat.name}</strong></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editCategory(${index})">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory(${index})">Xóa</button>
                </td>
            </tr>
        `;
    });
    populateCategoryDropdowns();
}

function openCategoryModal() {
    document.getElementById('formCategory').reset();
    document.getElementById('catIndex').value = '';
    document.getElementById('modalCategoryTitle').innerText = 'Thêm Danh Mục';
    document.getElementById('modalCategory').classList.add('active');
}

function editCategory(index) {
    const cat = categoriesData[index];
    document.getElementById('catIndex').value = index;
    document.getElementById('catName').value = cat.name || '';
    
    document.getElementById('modalCategoryTitle').innerText = 'Sửa Danh Mục';
    document.getElementById('modalCategory').classList.add('active');
}

function saveCategory(e) {
    e.preventDefault();
    const index = document.getElementById('catIndex').value;
    const cat = {
        name: document.getElementById('catName').value
    };

    if (index === '') {
        categoriesData.push(cat);
    } else {
        categoriesData[index] = cat;
    }
    closeModal('modalCategory');
    renderCategories();
}

function deleteCategory(index) {
    if (confirm('Bạn chắc chắn muốn xóa danh mục này?')) {
        categoriesData.splice(index, 1);
        renderCategories();
    }
}

function populateCategoryDropdowns() {
    const artCat = document.getElementById('artCategory');
    const prodCat = document.getElementById('prodCategory');
    
    let optionsHtml = '<option value="">-- Chọn Danh Mục --</option>';
    categoriesData.forEach(c => {
        optionsHtml += `<option value="${c.name}">${c.name}</option>`;
    });
    
    if (artCat) {
        const val = artCat.value;
        artCat.innerHTML = optionsHtml;
        artCat.value = val; // Restore selected value
    }
    if (prodCat) {
        const val = prodCat.value;
        prodCat.innerHTML = optionsHtml;
        prodCat.value = val; // Restore selected value
    }
}

// ================= UTILS =================
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ================= GITHUB PUBLISH =================
async function publishToGitHub() {
    const owner = document.getElementById('ghOwner').value.trim();
    const repo = document.getElementById('ghRepo').value.trim();
    const token = document.getElementById('ghToken').value.trim();
    const branch = document.getElementById('ghBranch').value.trim();

    // Ensure it saves even if copy-pasted directly before hitting Publish
    localStorage.setItem('ghOwner', owner);
    localStorage.setItem('ghRepo', repo);
    localStorage.setItem('ghToken', token);
    localStorage.setItem('ghBranch', branch);

    if (!owner || !repo || !token) {
        alert("Vui lòng nhập đầy đủ Owner, Repo, Branch và Token!");
        return;
    }

    if (!confirm('Hành động này sẽ ghi đè dữ liệu trực tiếp lên kho lưu trữ GitHub. Bạn có chắc chắn?')) return;

    showLoading(true);

    try {
        await updateGithubFile(owner, repo, branch, token, 'data/categories.json', JSON.stringify(categoriesData, null, 2));
        await updateGithubFile(owner, repo, branch, token, 'data/articles.json', JSON.stringify(articlesData, null, 2));
        await updateGithubFile(owner, repo, branch, token, 'data/products.json', JSON.stringify(productsData, null, 2));
        alert("Push thành công lên GitHub!");
    } catch (error) {
        console.error(error);
        alert(`Lỗi khi push: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function updateGithubFile(owner, repo, branch, token, filePath, content) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    
    // 1. Lấy SHA hiện tại của file
    let fileSha = null;
    const getRes = await fetch(apiUrl, {
        headers: { 'Authorization': `token ${token}` }
    });

    if (getRes.ok) {
        const fileData = await getRes.json();
        fileSha = fileData.sha;
    } else if (getRes.status !== 404) {
        throw new Error(`Không thể lấy thông tin file ${filePath}. Status: ${getRes.status}`);
    }

    // 2. Put file với content mới
    // Phải encode Unicode cẩn thận sang base64 (btoa không chịu unicode char directly)
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    const body = {
        message: `Update ${filePath} from Admin Panel`,
        content: base64Content,
        branch: branch
    };
    
    if (fileSha) {
        body.sha = fileSha; // Cần thiết để ghi đè (update)
    }

    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!putRes.ok) {
        const errorData = await putRes.json();
        throw new Error(`Lỗi cập nhật ${filePath}: ${errorData.message}`);
    }
}

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}
