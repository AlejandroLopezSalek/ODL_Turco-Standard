// ========================================
// GENERAL.JS - FINAL VERSION (MODIFICADO para document.documentElement)
// Global utilities with proper initialization order
// ========================================

// Global namespace to avoid conflicts
window.AppUtils = window.AppUtils || {};

// ========================================
// DARK MODE SYSTEM
// ========================================
window.AppUtils.DarkMode = {
    init() {
        // Apply saved theme immediately (before DOM is fully ready)
        const savedTheme = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Aplica el tema inicial al <html> inmediatamente, USANDO document.documentElement
        if (savedTheme === 'enabled' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }

        // Sincroniza la configuración de toggle una vez que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }

        // Listeners for system preference and storage remain
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Solo cambia si el usuario no tiene una preferencia guardada (null)
            if (!localStorage.getItem('darkMode')) {
                e.matches ? this.enable() : this.disable();
            }
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'darkMode') {
                // Siempre obedece el cambio de almacenamiento para sincronizar entre pestañas
                e.newValue === 'enabled' ? this.enable() : this.disable();
            }
        });
    },

    setupToggle() {
        const toggles = document.querySelectorAll('#darkModeToggle, #darkModePref');
        toggles.forEach(toggle => {
            if (toggle) {
                // Usa document.documentElement para verificar el estado
                toggle.checked = document.documentElement.classList.contains('dark-mode');
                toggle.addEventListener('change', () => {
                    toggle.checked ? this.enable() : this.disable();
                });
            }
        });
    },

    enable() {
        // Usa document.documentElement
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        this.updateToggleState(true);
    },

    disable() {
        // Usa document.documentElement
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        this.updateToggleState(false);
    },

    updateToggleState(isEnabled) {
        document.querySelectorAll('#darkModeToggle, #darkModePref').forEach(toggle => {
            if (toggle) {
                toggle.checked = isEnabled;
            }
        });
    }
};

// ========================================
// BUTTON RIPPLE/CLICK EFFECTS
// ========================================
window.AppUtils.ButtonEffects = {
    init() {
        // Selecciona todos los elementos clicables, PERO EXCLUYE el que tiene id="settingsTab"
        const clickableElements = document.querySelectorAll(
            '.btn:not(#settingsTab):not(#closeSettings), .tab:not(#settingsTab), .level-card, .resource-link, .explanation-btn, .close-modal'
        );

        // Listeners directos en los elementos
        clickableElements.forEach(element => {
            element.addEventListener('click', (e) => {
                this.addClickEffect(element, e);
            }, { passive: true });
        });
    },

    addClickEffect(element, event) {
        // Asegura que el contenedor esté listo para el ripple
        if (element.style.position !== 'relative') {
            element.style.position = 'relative';
        }
        if (element.style.overflow !== 'hidden') {
            element.style.overflow = 'hidden';
        }

        // 1. Create the ripple element
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        // 2. Aplicar estilos inline al ripple para que no ocupe espacio
        ripple.style.position = 'absolute';
        ripple.style.pointerEvents = 'none';

        element.appendChild(ripple);

        // 3. Position the ripple
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - (size / 2);
        const y = event.clientY - rect.top - (size / 2);

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        // 4. Trigger animation
        ripple.classList.add('active');

        // 5. Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 400);
    }
};

// ========================================
// SETTINGS PANEL - FINAL FIX
// ========================================
window.AppUtils.Settings = {
    initialized: false,

    init() {
        // Prevent double initialization
        if (this.initialized) {
            console.log('[Settings] Already initialized, skipping');
            return;
        }

        console.log('[Settings] Initializing...');

        // Use a small delay to ensure DOM is ready
        setTimeout(() => {
            const settingsTab = document.getElementById('settingsTab');
            const overlay = document.getElementById('settingsOverlay');
            const closeBtn = document.getElementById('closeSettings');

            console.log('[Settings] Elements found:', {
                settingsTab: !!settingsTab,
                overlay: !!overlay,
                closeBtn: !!closeBtn
            });

            if (!settingsTab || !overlay) {
                console.warn('[Settings] Required elements not found');
                return;
            }

            // Remove any existing listeners
            const newSettingsTab = settingsTab.cloneNode(true);
            settingsTab.parentNode.replaceChild(newSettingsTab, settingsTab);

            // Add click handler
            newSettingsTab.addEventListener('click', (e) => {
                console.log('[Settings] Button clicked');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.open(overlay);
            }, { capture: true });

            // Close button
            if (closeBtn) {
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

                newCloseBtn.addEventListener('click', (e) => {
                    console.log('[Settings] Close button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    this.close(overlay);
                });
            }

            // Overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    console.log('[Settings] Overlay clicked');
                    this.close(overlay);
                }
            });

            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && overlay.classList.contains('active')) {
                    console.log('[Settings] Escape pressed');
                    this.close(overlay);
                }
            });

            this.initialized = true;
            console.log('[Settings] ✅ Initialized successfully');
        }, 100);
    },

    open(overlay) {
        console.log('[Settings] Opening panel');
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    },

    close(overlay) {
        console.log('[Settings] Closing panel');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
};

// ========================================
// TAB ACTIVE STATE
// ========================================
window.AppUtils.Tabs = {
    init() {
        const tabs = document.querySelectorAll('.tab:not(#settingsTab)');
        const currentPath = window.location.pathname;

        tabs.forEach(tab => {
            const tabPath = tab.getAttribute('href');

            // Remove 'active' from all tabs first
            tab.classList.remove('active');

            // Handle index.html vs /
            if (currentPath === '/' || currentPath.endsWith('index.html')) {
                if (tabPath === 'index.html' || tabPath === '/') {
                    tab.classList.add('active');
                }
            }
            // Handle other pages
            else if (tabPath && currentPath.includes(tabPath)) {
                tab.classList.add('active');
            }
        });
    }
};

// ========================================
// ACCESSIBILITY & PREFERENCES
// ========================================
window.AppUtils.Accessibility = {
    init() {
        this.applySavedPreferences();
        this.setupPreferenceListeners();
    },

    applySavedPreferences() {
        // Font Size
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            this.updateFontSize(savedFontSize);
        }

        // Reduced Motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    },

    setupPreferenceListeners() {
        const fontSizeSelect = document.getElementById('fontSizePref');
        if (fontSizeSelect) {
            fontSizeSelect.value = localStorage.getItem('fontSize') || 'medium';
            fontSizeSelect.addEventListener('change', (e) => {
                this.updateFontSize(e.target.value);
            });
        }
    },

    updateFontSize(size) {
        const sizes = { small: '14px', medium: '16px', large: '18px' };
        document.documentElement.style.fontSize = sizes[size] || '16px';
        localStorage.setItem('fontSize', size);
    }
};

// ========================================
// GENERIC UTILITIES
// ========================================
window.AppUtils.Utils = {
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ========================================
// INITIALIZATION
// ========================================
window.AppUtils.init = function () {
    console.log('🔧 Initializing AppUtils...');

    // 1. Initialize dark mode FIRST (before DOM ready). 
    // La detección inicial se hizo en el <head>, aquí solo se inicia el sistema completo.
    this.DarkMode.init();

    // 2. Initialize other systems when DOM is ready
    const initOtherSystems = () => {
        console.log('📋 DOM Ready, initializing systems...');
        this.Tabs.init();
        this.Accessibility.init();
        this.ButtonEffects.init();

        // Settings LAST with extra delay
        setTimeout(() => {
            this.Settings.init();
        }, 200);

        console.log('✅ Global utilities initialized successfully');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOtherSystems);
    } else {
        initOtherSystems();
    }
};

// ========================================
// AUTO-INITIALIZE
// ========================================
(function () {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.AppUtils.init(), 50);
        });
    } else {
        setTimeout(() => window.AppUtils.init(), 50);
    }
})();

console.log('📦 general.js loaded');