// Global Cart State
let cart = JSON.parse(localStorage.getItem('luxury_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('luxury_user')) || null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateAuthUI();
});

// Update Cart Count in Navigation
function updateCartCount() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartIcon = document.querySelector('a[href="cart.html"]');
    if (cartIcon) {
        if (totalItems > 0) {
            cartIcon.innerHTML = `<i class="fas fa-shopping-bag"></i> <span style="font-size:0.8rem; background:var(--gold); color:var(--charcoal); border-radius:50%; padding:2px 6px; position:absolute; top:-5px; right:-10px;">${totalItems}</span>`;
            cartIcon.style.position = 'relative';
        } else {
            cartIcon.innerHTML = `<i class="fas fa-shopping-bag"></i>`;
        }
    }
}

// Add Item to Cart
function addToCart(product, quantity = 1, size = null) {
    const existingItem = cart.find(item => item.product === product._id && item.size === size);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            quantity,
            size
        });
    }

    localStorage.setItem('luxury_cart', JSON.stringify(cart));
    updateCartCount();
    // Show notification
    alert(`${product.name} added to cart.`);
}

// Remove from Cart
function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.product === productId && item.size === size));
    localStorage.setItem('luxury_cart', JSON.stringify(cart));
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

// Update UI based on auth state
function updateAuthUI() {
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        if (currentUser) {
            userBtn.href = 'dashboard.html';
            userBtn.innerHTML = '<i class="fas fa-user-check" style="color:var(--gold)"></i>';
        } else {
            userBtn.href = 'login.html';
            userBtn.innerHTML = '<i class="far fa-user"></i>';
        }
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
        console.error('Logout error:', err);
    }
    localStorage.removeItem('luxury_user');
    currentUser = null;
    window.location.href = 'index.html';
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileMenu && overlay) {
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        // Prevent body scroll when menu is open
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }
}
