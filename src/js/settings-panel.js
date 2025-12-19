// ========================================
// SETTINGS PANEL - Overlay and Controls
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const settingsTab = document.getElementById('settingsTab');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');

    const notificationsToggle = document.getElementById('notificationsToggle');
    const languageSelect = document.querySelector('.setting-select');

    // --- Open/Close Logic ---
    if (settingsTab && settingsOverlay) {
        settingsTab.addEventListener('click', (e) => {
            e.preventDefault();
            settingsOverlay.classList.add('active');
        });
    }

    if (closeSettingsBtn && settingsOverlay) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsOverlay.classList.remove('active');
        });
    }

    // Close on click outside
    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', (e) => {
            if (e.target === settingsOverlay) {
                settingsOverlay.classList.remove('active');
            }
        });
    }

    // --- Notifications Logic ---
    if (notificationsToggle) {
        // Load saved state
        const savedNotifs = localStorage.getItem('notifications');
        if (savedNotifs === 'disabled') {
            notificationsToggle.checked = false;
        } else {
            notificationsToggle.checked = true; // Default enabled
        }

        // Save on change
        notificationsToggle.addEventListener('change', () => {
            if (notificationsToggle.checked) {
                localStorage.setItem('notifications', 'enabled');
                console.log('🔔 Notifications enabled');
            } else {
                localStorage.setItem('notifications', 'disabled');
                console.log('🔕 Notifications disabled');
            }
        });
    }

    // --- Language Logic ---
    if (languageSelect) {
        // Load saved language
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            languageSelect.value = savedLang;
        }

        // Save on change
        languageSelect.addEventListener('change', () => {
            const lang = languageSelect.value;
            localStorage.setItem('language', lang);
            console.log(`🌐 Language set to: ${lang}`);
            // Here you would trigger a translation function or reload
            // location.reload(); // Optional: reload to apply language
        });
    }

    // --- Reset Logic (Custom Styled Modal) ---
    if (resetSettingsBtn) {
        // Create custom confirm modal
        const confirmOverlay = document.createElement('div');
        confirmOverlay.className = 'custom-confirm-overlay';
        confirmOverlay.innerHTML = `
            <div class="custom-confirm-modal">
                <h3>Restaurar Valores</h3>
                <p>¿Estás seguro de que quieres restaurar todos los ajustes a sus valores predeterminados?</p>
                <div class="custom-confirm-buttons">
                    <button class="btn-confirm-cancel">Cancelar</button>
                    <button class="btn-confirm-ok">Restaurar</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmOverlay);

        const cancelBtn = confirmOverlay.querySelector('.btn-confirm-cancel');
        const okBtn = confirmOverlay.querySelector('.btn-confirm-ok');

        resetSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            confirmOverlay.classList.add('active');
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            confirmOverlay.classList.remove('active');
        });

        // Click outside to close
        confirmOverlay.addEventListener('click', (e) => {
            if (e.target === confirmOverlay) {
                confirmOverlay.classList.remove('active');
            }
        });

        // OK button - perform reset
        okBtn.addEventListener('click', () => {
            // Clear settings from localStorage
            localStorage.removeItem('darkMode');
            localStorage.removeItem('notifications');
            localStorage.removeItem('language');

            // Reset UI
            document.documentElement.classList.remove('dark-mode');
            if (document.getElementById('darkModeToggle')) {
                document.getElementById('darkModeToggle').checked = false;
            }
            if (notificationsToggle) notificationsToggle.checked = true;
            if (languageSelect) languageSelect.value = 'es';

            // Close both modals
            if (settingsOverlay) settingsOverlay.classList.remove('active');
            confirmOverlay.classList.remove('active');

            console.log('🔄 Settings reset to default');

            // Optional: Show a success toast if available
            if (window.toastSuccess) {
                window.toastSuccess('Ajustes restaurados correctamente');
            }
        });
    }

    console.log('⚙️ Settings Panel loaded');
});
