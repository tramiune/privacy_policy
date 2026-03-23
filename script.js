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
    // 1. Log to Firebase
    if (analytics) {
        try {
            logEvent(analytics, eventName, params);
        } catch (e) {
            console.error("Firebase event error:", e);
        }
    }
    
    // 2. Log to Google Analytics (gtag)
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }

    console.log(`Tracked Event: ${eventName}`, params);
}

// ====== Event Tracking Implementations ======
document.addEventListener('DOMContentLoaded', () => {

    // 1. Track Affiliate Button Clicks
    const affiliateLinks = document.querySelectorAll('.affiliate-link');
    affiliateLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Note: Prevent default for demo only if href is '#'
            if(link.getAttribute('href') === '#') {
                e.preventDefault(); 
                alert("Đang chuyển hướng sang Shopee...");
            }
            
            const productName = link.getAttribute('data-product') || 'Unknown Product';
            trackEvent('click_affiliate', {
                product_name: productName,
                page_path: window.location.pathname
            });
        });
    });

    // 2. Track Time on Page (30 seconds)
    const TIME_LIMIT = 30000;
    setTimeout(() => {
        trackEvent('time_on_page', {
            duration_seconds: 30,
            page_path: window.location.pathname
        });
    }, TIME_LIMIT);

    // 3. Track Scroll Depth (50%, 90%)
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
    // Optional: Hide sticky CTA when reaching the footer to avoid overlap
    const stickyCta = document.getElementById('stickyCta');
    const footer = document.querySelector('.footer');
    
    if (stickyCta && footer) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // If footer is visible, hide sticky CTA or make it static
                stickyCta.style.transform = 'translateY(100%)';
            } else {
                stickyCta.style.transform = 'translateY(0)';
            }
        }, {
            threshold: 0.1
        });

        observer.observe(footer);
        
        // Add transition style dynamically
        stickyCta.style.transition = 'transform 0.3s ease';
    }
});
