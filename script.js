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
        // Toggle menu when clicking the hamburger button
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        
        // Close menu when clicking on any navigation link
        const navLinkItems = navLinks.querySelectorAll('a');
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                // Close the mobile menu
                navLinks.classList.remove('mobile-active');
                // Change icon back to hamburger
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
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
                // Faster animation: reduced from 2000ms to 1200ms
                animateValue(entry.target, 0, target, 1200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 }); // Lower threshold for earlier trigger
    
    stats.forEach(stat => observer.observe(stat));
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing function for smoother animation
        const easedProgress = easeOutExpo(progress);
        const value = Math.floor(easedProgress * (end - start) + start);
        element.textContent = value + '+';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Easing function for exponential ease-out (faster start, slower end)
function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// Load Tools from JSON
async function loadToolsFromJSON() {
    try {
        // Add timestamp to prevent caching (cache-busting)
        const timestamp = new Date().getTime();
        const response = await fetch(`data/tools.json?v=${timestamp}`, {
            cache: 'no-store', // Prevent browser caching
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const data = await response.json();
        
        // Render tools for each section
        renderOnlineTools(data.online);
        renderDesktopTools(data.desktop);
        renderMobileTools(data.mobile);
        renderExtensions(data.extensions);
        
        // Update statistics
        updateStats(data);
        
    } catch (error) {
        console.error('Failed to load tools:', error);
        // Keep existing hardcoded tools if JSON fails to load
    }
}

function renderOnlineTools(tools) {
    const grid = document.getElementById('onlineToolsGrid');
    if (!tools || tools.length === 0) return;
    
    // Clear existing tools
    grid.innerHTML = '';
    
    tools.forEach(tool => {
        const card = createToolCard(tool);
        grid.appendChild(card);
    });
}

function renderDesktopTools(tools) {
    const grid = document.getElementById('desktopGrid');
    if (!tools || tools.length === 0 || !grid) return;
    
    grid.innerHTML = '';
    tools.forEach(tool => {
        const card = createToolCard(tool, 'desktop');
        grid.appendChild(card);
    });
}

function renderMobileTools(tools) {
    const grid = document.getElementById('mobileGrid');
    if (!tools || tools.length === 0 || !grid) return;
    
    grid.innerHTML = '';
    tools.forEach(tool => {
        const card = createToolCard(tool, 'mobile');
        grid.appendChild(card);
    });
}

function renderExtensions(tools) {
    const grid = document.getElementById('extensionsGrid');
    if (!tools || tools.length === 0 || !grid) return;
    
    grid.innerHTML = '';
    tools.forEach(tool => {
        const card = createToolCard(tool, 'extension');
        grid.appendChild(card);
    });
}

function createToolCard(tool, type = 'online') {
    const card = document.createElement('div');
    card.className = 'tool-card';
    if (tool.category) {
        card.setAttribute('data-category', tool.category);
    }
    
    // Tool Header
    const header = document.createElement('div');
    header.className = 'tool-header';
    
    const icon = document.createElement('div');
    icon.className = 'tool-icon';
    icon.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    icon.innerHTML = `<i class="${tool.iconClass || 'fas fa-tools'}"></i>`;
    header.appendChild(icon);
    
    // Badge (optional)
    if (tool.badge) {
        const badge = document.createElement('span');
        badge.className = `tool-badge ${tool.badge}`;
        badge.textContent = tool.badge;
        badge.setAttribute('data-en', tool.badge);
        badge.setAttribute('data-ar', getBadgeArabic(tool.badge));
        header.appendChild(badge);
    }
    
    card.appendChild(header);
    
    // Tool Name
    const name = document.createElement('h3');
    name.className = 'tool-name';
    name.textContent = tool.name;
    card.appendChild(name);
    
    // Tool Description
    const desc = document.createElement('p');
    desc.className = 'tool-description';
    desc.textContent = currentLang === 'en' ? tool.descriptionEn : tool.descriptionAr;
    desc.setAttribute('data-en', tool.descriptionEn);
    desc.setAttribute('data-ar', tool.descriptionAr);
    card.appendChild(desc);
    
    // Features
    if (tool.featuresEn && tool.featuresEn.length > 0) {
        const features = document.createElement('div');
        features.className = 'tool-features';
        
        tool.featuresEn.forEach((feature, index) => {
            const tag = document.createElement('span');
            tag.className = 'feature-tag';
            tag.textContent = currentLang === 'en' ? feature : (tool.featuresAr[index] || feature);
            tag.setAttribute('data-en', feature);
            tag.setAttribute('data-ar', tool.featuresAr[index] || feature);
            features.appendChild(tag);
        });
        
        card.appendChild(features);
    }
    
    // Platforms (for desktop/mobile)
    if (type !== 'online' && tool.platforms && tool.platforms.length > 0) {
        const platforms = document.createElement('div');
        platforms.className = 'tool-platforms';
        
        tool.platforms.forEach(platform => {
            const platformIcon = document.createElement('i');
            platformIcon.className = getPlatformIcon(platform);
            platforms.appendChild(platformIcon);
        });
        
        card.appendChild(platforms);
    }
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'tool-footer';
    
    const pricing = document.createElement('div');
    pricing.className = 'tool-pricing';
    pricing.innerHTML = `<i class="fas fa-tag"></i><span data-en="${getPricingLabel(tool.pricing)}" data-ar="${getPricingLabelAr(tool.pricing)}">${getPricingLabel(tool.pricing)}</span>`;
    footer.appendChild(pricing);
    
    const link = document.createElement('a');
    link.href = tool.url;
    link.target = '_blank';
    link.className = 'tool-link';
    link.innerHTML = '<span data-en="Visit" data-ar="زيارة">Visit</span> <i class="fas fa-arrow-right"></i>';
    footer.appendChild(link);
    
    card.appendChild(footer);
    
    return card;
}

function getBadgeArabic(badge) {
    const badges = {
        'popular': 'شائع',
        'new': 'جديد',
        'premium': 'مميز',
        'trending': 'رائج'
    };
    return badges[badge?.toLowerCase()] || badge;
}

function getPlatformIcon(platform) {
    const icons = {
        'windows': 'fab fa-windows',
        'mac': 'fab fa-apple',
        'linux': 'fab fa-linux',
        'android': 'fab fa-android',
        'ios': 'fab fa-apple'
    };
    return icons[platform] || 'fas fa-desktop';
}

function getPricingLabel(pricing) {
    const labels = {
        'free': 'Free',
        'freemium': 'Free + Paid',
        'paid': 'Paid'
    };
    return labels[pricing] || pricing;
}

function getPricingLabelAr(pricing) {
    const labels = {
        'free': 'مجاني',
        'freemium': 'مجاني + مدفوع',
        'paid': 'مدفوع'
    };
    return labels[pricing] || pricing;
}

function updateStats(data) {
    const onlineCount = data.online?.length || 0;
    const desktopCount = data.desktop?.length || 0;
    const mobileCount = data.mobile?.length || 0;
    const extensionsCount = data.extensions?.length || 0;
    
    // Update stat numbers if elements exist
    const stats = document.querySelectorAll('.stat-number');
    if (stats[0]) stats[0].setAttribute('data-count', onlineCount);
    if (stats[1]) stats[1].setAttribute('data-count', desktopCount);
    if (stats[2]) stats[2].setAttribute('data-count', mobileCount);
    if (stats[3]) stats[3].setAttribute('data-count', extensionsCount);
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
    // Load tools from JSON first
    loadToolsFromJSON();
    
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