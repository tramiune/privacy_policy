// ====== Firebase Analytics Placeholder Setup ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyPlaceholderKeyHere12345",
  authDomain: "affiliate-site.firebaseapp.com",
  projectId: "affiliate-site",
  storageBucket: "affiliate-site.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
let analytics;
try {
    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized");
} catch(e) {
    console.warn("Could not initialize Firebase. Check config.", e);
}

// ====== Utility Tracking Function ======
function trackEvent(eventName, params = {}) {
    if (analytics) {
        try { logEvent(analytics, eventName, params); } catch (e) { console.error("Firebase event error:", e); }
    }
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
    console.log(`Tracked Event: ${eventName}`, params);
}

// ====== Data Fetching & Dynamic Rendering ======
function loadArticles() {
    try {
        const articles = window.DATA_ARTICLES || [];
        
        // Render on Home Page (limit to 3 for trending)
        const homeContainer = document.getElementById('home-articles-container');
        if (homeContainer) {
            homeContainer.innerHTML = '';
            articles.slice(0, 3).forEach(article => {
                homeContainer.innerHTML += `
                    <a href="${article.url}?id=${article.id}" class="card">
                        <img src="${article.image}" alt="${article.category}">
                        <div class="card-body">
                            <h3>${article.title}</h3>
                            <p>${article.description}</p>
                        </div>
                    </a>
                `;
            });
        }

        // Render on Category Page (all articles)
        const categoryContainer = document.getElementById('category-articles-container');
        if (categoryContainer) {
            categoryContainer.innerHTML = '';
            articles.forEach(article => {
                categoryContainer.innerHTML += `
                    <div class="article-card">
                        <img src="${article.image}" alt="${article.category}">
                        <div class="article-info">
                            <span class="badge">${article.badge}</span>
                            <h2><a href="${article.url}?id=${article.id}">${article.title}</a></h2>
                            <p>${article.description}</p>
                            <a href="${article.url}?id=${article.id}" class="read-more">Đọc toàn bộ bài viết &rarr;</a>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

function loadProducts() {
    const articleContainer = document.getElementById('article-products-container');
    if (!articleContainer) return;

    try {
        const products = window.DATA_PRODUCTS || [];
        
        articleContainer.innerHTML = '';
        products.forEach(product => {
            const prosHtml = product.pros.map(p => `<li>${p}</li>`).join('');
            const consHtml = product.cons.map(c => `<li>${c}</li>`).join('');
            const vouchersHtml = product.vouchers.map(v => `<span class="voucher-tag">${v}</span>`).join('');
            const badgeHtml = product.discountBadge ? `<div class="discount-badge">${product.discountBadge}</div>` : '';

            articleContainer.innerHTML += `
                <div class="product-block" id="${product.id}">
                    <h2 class="product-title">${product.title}</h2>
                    <div class="product-content">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.trackingId}">
                            ${badgeHtml}
                        </div>
                        <div class="product-details">
                            <div class="rating">${product.rating} <span class="sold-count">(${product.soldCount})</span></div>
                            <p class="product-desc">${product.desc}</p>
                            
                            <div class="pros-cons">
                                <div class="pros">
                                    <strong>✅ Ưu điểm:</strong>
                                    <ul>${prosHtml}</ul>
                                </div>
                                <div class="cons">
                                    <strong>❌ Nhược điểm:</strong>
                                    <ul>${consHtml}</ul>
                                </div>
                            </div>

                            <div class="price-section">
                                <div class="original-price">Giá gốc: <del>${product.originalPrice}</del></div>
                                <div class="discounted-price">🔥 Giá sau mã: <span>${product.discountedPrice}</span></div>
                                <div class="urgency-text">⏳ ${product.urgencyText}</div>
                            </div>

                            <div class="voucher-box">
                                <div class="voucher-title">🎟️ Mã giảm giá hôm nay:</div>
                                <div class="voucher-codes">
                                    ${vouchersHtml}
                                </div>
                            </div>
                            
                            <a href="${product.link}" class="btn btn-shopee affiliate-link btn-pulse" data-product="${product.trackingId}">Xem giá Shopee 🔥</a>
                        </div>
                    </div>
                </div>
            `;
        });

        // Re-attach affiliate event listeners to new dynamic buttons
        attachAffiliateListeners();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// ====== Event Tracking Implementations ======
function handleAffiliateClick(e) {
    if(this.getAttribute('href') === '#') {
        e.preventDefault(); 
        alert("Đang chuyển hướng sang Shopee...");
    }
    const productName = this.getAttribute('data-product') || 'Unknown Product';
    trackEvent('click_affiliate', {
        product_name: productName,
        page_path: window.location.pathname
    });
}

function attachAffiliateListeners() {
    const affiliateLinks = document.querySelectorAll('.affiliate-link');
    affiliateLinks.forEach(link => {
        link.removeEventListener('click', handleAffiliateClick);
        link.addEventListener('click', handleAffiliateClick);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // 1. Fetch JSON data conditionally based on page containers
    loadArticles();
    loadProducts();

    // 2. Track Affiliate Button Clicks for static buttons (like the Sticky CTA)
    attachAffiliateListeners();

    // 3. Track Time on Page (30 seconds)
    const TIME_LIMIT = 30000;
    setTimeout(() => {
        trackEvent('time_on_page', {
            duration_seconds: 30,
            page_path: window.location.pathname
        });
    }, TIME_LIMIT);

    // 4. Track Scroll Depth (50%, 90%)
    let scroll50Tracked = false;
    let scroll90Tracked = false;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

        if (scrollPercent >= 50 && !scroll50Tracked) {
            scroll50Tracked = true;
            trackEvent('scroll_depth', {
                percentage: 50,
                page_path: window.location.pathname
            });
        }

        if (scrollPercent >= 90 && !scroll90Tracked) {
            scroll90Tracked = true;
            trackEvent('scroll_depth', {
                percentage: 90,
                page_path: window.location.pathname
            });
        }
    });

    // ====== Sticky Mobile Content Logic ======
    const stickyCta = document.getElementById('stickyCta');
    const footer = document.querySelector('.footer');
    
    if (stickyCta && footer) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                stickyCta.style.transform = 'translateY(100%)';
            } else {
                stickyCta.style.transform = 'translateY(0)';
            }
        }, {
            threshold: 0.1
        });

        observer.observe(footer);
        stickyCta.style.transition = 'transform 0.3s ease';
    }
});
