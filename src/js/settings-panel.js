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

    // --- Reset Logic ---
    // --- Reset Logic (Custom Modal) ---
    // --- Reset Logic (Custom Modal) ---
    const customConfirmModal = document.getElementById('customConfirmModal');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    if (resetSettingsBtn && customConfirmModal) {
        console.log('✅ Custom Modal logic initialized');

        // Show modal
        resetSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Safety
            console.log('🔘 Reset button clicked');
            customConfirmModal.classList.add('active');
        });

        // Hide modal on Cancel
        if (cancelResetBtn) {
            cancelResetBtn.addEventListener('click', () => {
                customConfirmModal.classList.remove('active');
            });
        }

        // Hide modal on background click
        customConfirmModal.addEventListener('click', (e) => {
            if (e.target === customConfirmModal) {
                customConfirmModal.classList.remove('active');
            }
        });

        // Confirm logic
        if (confirmResetBtn) {
            confirmResetBtn.addEventListener('click', () => {
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

                // Close panel AND modal
                if (settingsOverlay) settingsOverlay.classList.remove('active');
                customConfirmModal.classList.remove('active');

                console.log('🔄 Settings reset to default');

                // Optional: Show a success toast if available
                if (window.toastSuccess) {
                    window.toastSuccess('Ajustes restaurados correctamente');
                }
            });
        }
    } else {
        console.error('❌ Could not find reset button or custom modal element');
    }

    console.log('⚙️ Settings Panel loaded');
});
