// Language Management
let currentLang = 'en';

const translations = {
    en: {},
    ar: {}
};

// Initialize Language Toggle
function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    const langText = document.getElementById('langText');
    
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        updateLanguage();
        langText.textContent = currentLang === 'en' ? 'العربية' : 'English';
    });
}

// Update Language
function updateLanguage() {
    const html = document.documentElement;
    
    if (currentLang === 'ar') {
        html.setAttribute('lang', 'ar');
        html.setAttribute('dir', 'rtl');
    } else {
        html.setAttribute('lang', 'en');
        html.setAttribute('dir', 'ltr');
    }
    
    // Update all elements with data attributes
    const elements = document.querySelectorAll('[data-en], [data-ar]');
    elements.forEach(element => {
        const key = currentLang === 'en' ? 'data-en' : 'data-ar';
        if (element.hasAttribute(key)) {
            element.textContent = element.getAttribute(key);
        }
    });
    
    // Update placeholders
    const placeholders = document.querySelectorAll('[data-placeholder-en], [data-placeholder-ar]');
    placeholders.forEach(element => {
        const key = currentLang === 'en' ? 'data-placeholder-en' : 'data-placeholder-ar';
        if (element.hasAttribute(key)) {
            element.placeholder = element.getAttribute(key);
        }
    });
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
            const toolDesc = card.querySelector('.tool-description').textContent.toLowerCase();
            const features = Array.from(card.querySelectorAll('.feature-tag'))
                .map(tag => tag.textContent.toLowerCase())
                .join(' ');
            
            if (toolName.includes(searchTerm) || 
                toolDesc.includes(searchTerm) || 
                features.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Category Filter
function initCategoryFilter() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get category
            const category = button.getAttribute('data-category');
            
            // Filter tools
            const toolCards = document.querySelectorAll('#onlineToolsGrid .tool-card');
            
            toolCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Scroll to Top
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth Scroll for Navigation
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
}

// Animate Statistics on Scroll
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + '+';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Add hover effect to tool cards - Optimized with CSS
function initCardEffects() {
    // Hover effects are now handled purely by CSS for better performance
    // This function is kept for potential future enhancements
}

// Loading Animation - Removed to improve initial page load speed
function showLoadingAnimation() {
    // Loading animation removed for faster perceived performance
    // Cards now appear immediately with smooth fade-in
}

// Intersection Observer for Fade-in Animation - Optimized
function initFadeInAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered animation only for visible elements
                setTimeout(() => {
                    entry.target.classList.add('fade-in-visible');
                }, index * 30); // Reduced delay from 100ms to 30ms
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.05,  // Reduced threshold for earlier triggering
        rootMargin: '50px' // Start animation before element is fully visible
    });
    
    // Add initial class and observe elements
    const elements = document.querySelectorAll('.tool-card, .stat-card');
    elements.forEach((element) => {
        element.classList.add('fade-in-hidden');
        observer.observe(element);
    });
}

// Track External Links
function trackExternalLinks() {
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    
    externalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const toolName = link.closest('.tool-card')?.querySelector('.tool-name')?.textContent;
            console.log(`User clicked on: ${toolName || 'Unknown Tool'}`);
            // Here you can add analytics tracking
        });
    });
}

// Dark Mode Toggle (Future Enhancement)
function initDarkMode() {
    // Already in dark mode by default
    // This function can be extended to add light mode option
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (prefersDarkScheme.matches) {
        document.body.classList.add('dark-mode');
    }
}

// Local Storage for User Preferences
function saveLanguagePreference() {
    localStorage.setItem('preferredLanguage', currentLang);
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang !== currentLang) {
        currentLang = savedLang;
        updateLanguage();
        document.getElementById('langText').textContent = 
            currentLang === 'en' ? 'العربية' : 'English';
    }
}

// Keyboard Navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Press '/' to focus search
        if (e.key === '/' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Press 'Escape' to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput === document.activeElement) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
            }
        }
    });
}

// Copy to Clipboard (for future share functionality)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Add tool rating functionality (future enhancement)
function initToolRating() {
    // Placeholder for rating system
    // Can be extended to allow users to rate tools
}

// Initialize all features when DOM is ready - Optimized
document.addEventListener('DOMContentLoaded', () => {
    // Critical initializations first
    loadLanguagePreference();
    initLanguageToggle();
    initSearch();
    initCategoryFilter();
    
    // Save language preference when changed
    document.getElementById('langToggle').addEventListener('click', saveLanguagePreference);
    
    // Defer non-critical initializations using requestIdleCallback or setTimeout
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initScrollToTop();
            initSmoothScroll();
            initMobileMenu();
            animateStats();
            initCardEffects();
            trackExternalLinks();
            initDarkMode();
            initKeyboardNavigation();
        });
        
        // Fade-in animation with slight delay to ensure smooth rendering
        requestIdleCallback(() => {
            initFadeInAnimation();
        });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            initScrollToTop();
            initSmoothScroll();
            initMobileMenu();
            animateStats();
            initCardEffects();
            trackExternalLinks();
            initDarkMode();
            initKeyboardNavigation();
            initFadeInAnimation();
        }, 100);
    }
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Adjust layout if needed
        console.log('Window resized');
    }, 250);
});

// Service Worker for PWA (future enhancement)
if ('serviceWorker' in navigator) {
    // Can be enabled for PWA functionality
    // navigator.serviceWorker.register('/sw.js');
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateLanguage,
        animateValue,
        copyToClipboard
    };
}