let adminUser = JSON.parse(localStorage.getItem('luxury_user'));
let allProducts = [];
let allOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!adminUser || adminUser.role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }
    document.getElementById('adminName').innerText = adminUser.name;
    loadDashboardData();
});

function adminLogout() {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('luxury_user');
    window.location.href = '../index.html';
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    document.getElementById(`tab-${tabId}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

async function loadDashboardData() {
    try {
        // Fetch Products
        const prodRes = await fetch('/api/products');
        allProducts = await prodRes.json();

        // Fetch Orders
        const orderRes = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${adminUser.token}` }
        });
        allOrders = await orderRes.json();

        renderDashboardStats();
        renderProductsTable();
        renderOrdersTable();
    } catch (err) {
        console.error(err);
        alert('Failed to load admin data');
    }
}

function renderDashboardStats() {
    const totalRev = allOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    document.getElementById('totalRevenue').innerText = `₹${totalRev.toLocaleString()}`;
    document.getElementById('totalOrders').innerText = allOrders.length;
    document.getElementById('totalProducts').innerText = allProducts.length;
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    let html = '';
    allProducts.forEach(p => {
        const img = p.images[0] || 'https://via.placeholder.com/50';
        html += `
      <tr>
        <td><img src="${img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
        <td>${p.name}</td>
        <td style="text-transform: capitalize">${p.category}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick='openEditModal(${JSON.stringify(p)})'>Edit</button>
          <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-left: 0.5rem;" onclick="deleteProduct('${p._id}')">Delete</button>
        </td>
      </tr>
    `;
    });
    tbody.innerHTML = html;
}

function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    let html = '';
    allOrders.forEach(o => {
        const date = new Date(o.createdAt).toLocaleDateString();
        html += `
      <tr>
        <td>${o._id.substring(o._id.length - 8)}</td>
        <td>${o.user ? o.user.name : 'Guest'}</td>
        <td>${date}</td>
        <td>₹${o.totalAmount}</td>
        <td>
          <select class="form-control" style="padding: 0.3rem; margin:0;" onchange="updateOrderStatus('${o._id}', this.value)">
            <option value="processing" ${o.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${o.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${o.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
        <td>
          <button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">View</button>
        </td>
      </tr>
    `;
    });
    tbody.innerHTML = html;
}

// Product Management
function openProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('modalTitle').innerText = 'Add Product';
    document.getElementById('productModal').style.display = 'flex';
}

function openEditModal(product) {
    document.getElementById('prodId').value = product._id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCat').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodStock').value = product.stock;
    document.getElementById('prodDesc').value = product.description;
    document.getElementById('prodSizes').value = product.sizes ? product.sizes.join(',') : '';

    document.getElementById('modalTitle').innerText = 'Edit Product';
    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;

    const formData = new FormData();
    formData.append('name', document.getElementById('prodName').value);
    formData.append('category', document.getElementById('prodCat').value);
    formData.append('price', document.getElementById('prodPrice').value);
    formData.append('countInStock', document.getElementById('prodStock').value);
    formData.append('stock', document.getElementById('prodStock').value); // Fallback for update
    formData.append('description', document.getElementById('prodDesc').value);
    formData.append('sizes', document.getElementById('prodSizes').value);

    const imageFiles = document.getElementById('prodImages').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/products/${id}` : '/api/products';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${adminUser.token}` },
            body: formData
        });

        if (res.ok) {
            closeProductModal();
            loadDashboardData();
        } else {
            const error = await res.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to save product');
    }
});

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminUser.token}` }
            });
            if (res.ok) {
                loadDashboardData();
            } else {
                alert('Failed to delete product');
            }
        } catch (err) {
            console.error(err);
        }
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminUser.token}`
            },
            body: JSON.stringify({ orderStatus: status })
        });

        if (!res.ok) {
            alert('Failed to update order status');
            loadDashboardData(); // Revert select
        }
    } catch (err) {
        console.error(err);
        alert('Failed to update order status');
    }
}
