// ========================================
// AI Tools Hub - JavaScript Functions
// ========================================

// ========= Language Management =========
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'ar';
        this.init();
    }

    init() {
        this.applyLanguage(this.currentLang);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
        this.applyLanguage(this.currentLang);
        localStorage.setItem('language', this.currentLang);
    }

    applyLanguage(lang) {
        const html = document.documentElement;
        const body = document.body;

        // Set direction and language
        if (lang === 'ar') {
            html.setAttribute('lang', 'ar');
            html.setAttribute('dir', 'rtl');
            body.setAttribute('dir', 'rtl');
        } else {
            html.setAttribute('lang', 'en');
            html.setAttribute('dir', 'ltr');
            body.setAttribute('dir', 'ltr');
        }

        // Update all elements with data-ar and data-en attributes
        const elements = document.querySelectorAll('[data-ar][data-en]');
        elements.forEach(element => {
            const text = lang === 'ar' ? element.getAttribute('data-ar') : element.getAttribute('data-en');
            if (text) {
                element.textContent = text;
            }
        });

        // Smooth transition
        body.style.opacity = '0.95';
        setTimeout(() => {
            body.style.opacity = '1';
        }, 100);
    }
}

// ========= Mobile Menu =========
class MobileMenu {
    constructor() {
        this.menuBtn = document.getElementById('mobileMenuBtn');
        this.navMenu = document.getElementById('navMenu');
        this.init();
    }

    init() {
        if (this.menuBtn && this.navMenu) {
            this.menuBtn.addEventListener('click', () => this.toggle());
            
            // Close menu when clicking on a link
            const menuLinks = this.navMenu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => this.close());
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navMenu.contains(e.target) && !this.menuBtn.contains(e.target)) {
                    this.close();
                }
            });
        }
    }

    toggle() {
        this.navMenu.classList.toggle('active');
        this.animateButton();
    }

    close() {
        this.navMenu.classList.remove('active');
    }

    animateButton() {
        const spans = this.menuBtn.querySelectorAll('span');
        if (this.navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
}

// ========= Scroll Effects =========
class ScrollEffects {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.scrollTopBtn = document.getElementById('scrollTop');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        
        if (this.scrollTopBtn) {
            this.scrollTopBtn.addEventListener('click', () => this.scrollToTop());
        }
    }

    handleScroll() {
        // Navbar scroll effect
        if (this.navbar) {
            if (window.scrollY > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }

        // Scroll to top button
        if (this.scrollTopBtn) {
            if (window.scrollY > 500) {
                this.scrollTopBtn.classList.add('visible');
            } else {
                this.scrollTopBtn.classList.remove('visible');
            }
        }

        // Reveal animations on scroll
        this.revealOnScroll();
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    revealOnScroll() {
        const elements = document.querySelectorAll('.tool-card, .model-card, .resource-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
}

// ========= Smooth Scrolling =========
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                // Skip if href is just "#"
                if (href === '#' || href === '') return;
                
                e.preventDefault();
                
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ========= Contact Form Handler =========
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Get current language
        const currentLang = document.documentElement.getAttribute('lang');
        
        // Success message
        const successMessage = currentLang === 'ar' 
            ? 'شكراً لك! تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.' 
            : 'Thank you! Your message has been sent successfully. We will contact you soon.';
        
        // Show success message
        this.showNotification(successMessage, 'success');
        
        // Reset form
        this.form.reset();
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '1rem 1.5rem',
            background: type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            zIndex: '10000',
            animation: 'slideInRight 0.5s ease',
            maxWidth: '400px'
        });
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }
}

// ========= Animation Utilities =========
class AnimationUtils {
    constructor() {
        this.init();
    }

    init() {
        // Add CSS for notifications
        this.addNotificationStyles();
        
        // Initial reveal for elements in viewport
        this.initialReveal();
        
        // Add hover effects to cards
        this.addCardEffects();
    }

    addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    initialReveal() {
        const elements = document.querySelectorAll('.tool-card, .model-card, .resource-card');
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
    }

    addCardEffects() {
        const cards = document.querySelectorAll('.tool-card, .model-card, .resource-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transition = 'all 0.3s ease';
            });
        });
    }
}

// ========= Parallax Effect =========
class ParallaxEffect {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-particles');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
}

// ========= Statistics Counter =========
class StatsCounter {
    constructor() {
        this.stats = document.querySelectorAll('.stat h3');
        this.hasAnimated = false;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.checkPosition());
    }

    checkPosition() {
        if (this.hasAnimated) return;

        const statsSection = document.querySelector('.hero-stats');
        if (!statsSection) return;

        const rect = statsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight - 100) {
            this.animateCounters();
            this.hasAnimated = true;
        }
    }

    animateCounters() {
        this.stats.forEach(stat => {
            const target = parseInt(stat.textContent);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.ceil(current) + '+';
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target + '+';
                }
            };

            updateCounter();
        });
    }
}

// ========= Active Navigation Link =========
class ActiveNavigation {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.updateActiveLink());
    }

    updateActiveLink() {
        let current = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
}

// ========= Search Functionality (Optional Enhancement) =========
class SearchTools {
    constructor() {
        this.searchInput = document.getElementById('searchTools');
        if (this.searchInput) {
            this.init();
        }
    }

    init() {
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const toolCards = document.querySelectorAll('.tool-card');

        toolCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// ========= Loading Animation =========
class PageLoader {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s ease';
                document.body.style.opacity = '1';
            }, 100);
        });
    }
}

// ========= Keyboard Shortcuts =========
class KeyboardShortcuts {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Toggle language
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const langToggle = document.getElementById('langToggle');
                if (langToggle) langToggle.click();
            }

            // Escape: Close mobile menu
            if (e.key === 'Escape') {
                const navMenu = document.getElementById('navMenu');
                if (navMenu) navMenu.classList.remove('active');
            }
        });
    }
}

// ========= Initialize All Components =========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new LanguageManager();
    new MobileMenu();
    new ScrollEffects();
    new SmoothScroll();
    new ContactForm();
    new AnimationUtils();
    new ParallaxEffect();
    new StatsCounter();
    new ActiveNavigation();
    new SearchTools();
    new PageLoader();
    new KeyboardShortcuts();

    // Log initialization
    console.log('%c🚀 AI Tools Hub Initialized Successfully!', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    console.log('%c💡 Press Ctrl/Cmd + K to toggle language', 'color: #8b5cf6; font-size: 12px;');
});

// ========= Performance Optimization =========
// Lazy load images if needed
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ========= Service Worker Registration (PWA Support - Optional) =========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable PWA support
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(err => console.log('SW registration failed:', err));
    });
}

// ========= Export for external use =========
window.AIToolsHub = {
    version: '1.0.0',
    language: () => document.documentElement.getAttribute('lang'),
    scrollToSection: (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
};