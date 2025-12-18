// perfil.js - COMPLETE WORKING VERSION
// Full profile management with all features

document.addEventListener('DOMContentLoaded', function () {
    console.log('🔧 Profile page initializing...');

    // Check authentication
    if (!window.AuthService || !window.AuthService.isLoggedIn()) {
        console.warn('⚠️ User not logged in, redirecting...');
        window.location.href = '/login/';
        return;
    }

    initProfile();
});

async function initProfile() {
    console.log('✅ Initializing profile...');
    await loadUserProfile();
    await loadStreakData();
    setupEventListeners();
    setupAvatarUpload();
    console.log('✅ Profile initialized successfully');
}

// ================================
// AVATAR UPLOAD SETUP
// ================================
function setupAvatarUpload() {
    let fileInput = document.getElementById('avatarInput');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'avatarInput';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }

    const avatarContainer = document.querySelector('.avatar-container');
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');

    if (avatarContainer) {
        avatarContainer.addEventListener('click', function () {
            fileInput.click();
        });
    }

    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            fileInput.click();
        });
    }

    fileInput.addEventListener('change', handleAvatarUpload);

    console.log('✅ Avatar upload initialized');
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona una imagen válida', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('La imagen debe ser menor a 5MB', 'error');
        return;
    }

    try {
        const avatarContainer = document.querySelector('.avatar-container i');
        const originalClass = avatarContainer.className;
        avatarContainer.className = 'fas fa-spinner fa-spin';

        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64Image = e.target.result;

            const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: window.AuthService.getAuthHeaders(),
                body: JSON.stringify({
                    profile: {
                        avatar: base64Image
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                updateAvatarDisplay(base64Image);
                showNotification('Foto de perfil actualizada', 'success');
            } else {
                throw new Error('Error al guardar la imagen');
            }

            avatarContainer.className = originalClass;
        };

        reader.onerror = function () {
            avatarContainer.className = originalClass;
            throw new Error('Error al leer la imagen');
        };

        reader.readAsDataURL(file);

    } catch (error) {
        console.error('Error uploading avatar:', error);
        showNotification('Error al subir la imagen', 'error');
    }
}

function updateAvatarDisplay(base64Image) {
    const avatarContainer = document.querySelector('.avatar-container');
    if (avatarContainer) {
        avatarContainer.innerHTML = `
            <img src="${base64Image}" alt="Avatar" style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            ">
            <button class="change-avatar-btn" title="Cambiar foto">
                <i class="fas fa-camera"></i>
            </button>
        `;

        const changeBtn = avatarContainer.querySelector('.change-avatar-btn');
        if (changeBtn) {
            changeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                document.getElementById('avatarInput').click();
            });
        }
    }
}

// ================================
// LOAD USER PROFILE
// ================================
async function loadUserProfile() {
    try {
        const user = window.AuthService.getCurrentUser();

        if (!user) {
            throw new Error('No user data');
        }

        console.log('📥 Loading user data:', user.username);

        // Basic info
        document.getElementById('userName').textContent = user.username || 'Usuario';
        document.getElementById('userEmail').textContent = user.email || '';
        document.getElementById('userLevel').textContent = user.profile?.level || 'A1';

        // Load avatar
        if (user.profile?.avatar) {
            updateAvatarDisplay(user.profile.avatar);
        }

        // Profile form removed by user request
        /*
        if (user.profile) {
            // document.getElementById('firstName').value = user.profile.firstName || '';
            // document.getElementById('lastName').value = user.profile.lastName || '';
            // document.getElementById('bio').value = user.profile.bio || '';
            // document.getElementById('levelSelect').value = user.profile.level || 'A1';
            // updateCharCount();
        }
        */

        // Preferences
        if (user.preferences) {
            document.getElementById('darkModePref').checked = user.preferences.darkMode || false;
            document.getElementById('notificationsPref').checked = user.preferences.notifications !== false;
            document.getElementById('soundPref').checked = user.preferences.sound !== false;
            document.getElementById('languagePref').value = user.preferences.language || 'es';
            document.getElementById('fontSizePref').value = user.preferences.fontSize || 'medium';
            document.getElementById('dailyGoalPref').value = user.preferences.dailyGoal || 30;

            applyPreferences(user.preferences);
        }

        console.log('✅ User profile loaded');
    } catch (error) {
        console.error('❌ Error loading profile:', error);
        showNotification('Error al cargar el perfil', 'error');
    }
}

// ================================
// LOAD STREAK DATA
// ================================
async function loadStreakData() {
    try {
        console.log('📊 Loading streak data...');

        /*
        // MOCK STREAK DATA FOR TEST MODE
        if (window.AuthService && window.AuthService.isLoggedIn() && window.AuthService.getCurrentUser().username === 'TestUser') {
            console.log('🚧 Test Mode: Returning mock streak data');
            displayStreak({
                current: 5,
                longest: 12,
                totalDays: 45,
                lastActivity: new Date().toISOString()
            });
            return;
        }
        */

        const updateResponse = await fetch(`${window.APP_CONFIG.API_BASE_URL}/auth/update-streak`, {
            method: 'POST',
            headers: window.AuthService.getAuthHeaders()
        });

        let streakData;
        if (updateResponse.ok) {
            const data = await updateResponse.json();
            streakData = data.streak;
        } else {
            const getResponse = await fetch(`${window.APP_CONFIG.API_BASE_URL}/auth/streak`, {
                headers: window.AuthService.getAuthHeaders()
            });

            if (getResponse.ok) {
                const data = await getResponse.json();
                streakData = data.streak;
            } else {
                streakData = {
                    current: 0,
                    longest: 0,
                    totalDays: 0,
                    lastActivity: null
                };
            }
        }

        displayStreak(streakData);
        console.log('✅ Streak data loaded:', streakData);
    } catch (error) {
        console.error('❌ Error loading streak:', error);
        displayStreak({
            current: 0,
            longest: 0,
            totalDays: 0,
            lastActivity: null
        });
    }
}

function displayStreak(streakData) {
    const currentStreakEl = document.getElementById('currentStreak');
    if (currentStreakEl) {
        currentStreakEl.textContent = streakData.current || 0;
    }

    const longestStreakEl = document.getElementById('longestStreak');
    if (longestStreakEl) {
        longestStreakEl.textContent = streakData.longest || 0;
    }

    const totalDaysEl = document.getElementById('totalDays');
    if (totalDaysEl) {
        totalDaysEl.textContent = streakData.totalDays || 0;
    }

    const lastActivityEl = document.getElementById('lastActivity');
    if (lastActivityEl && streakData.lastActivity) {
        const lastDate = new Date(streakData.lastActivity);
        const today = new Date();
        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            lastActivityEl.textContent = 'Hoy';
        } else if (diffDays === 1) {
            lastActivityEl.textContent = 'Ayer';
        } else {
            lastActivityEl.textContent = `Hace ${diffDays} días`;
        }
    } else if (lastActivityEl) {
        lastActivityEl.textContent = 'Hoy';
    }

    const messageEl = document.getElementById('streakMessage');
    if (messageEl) {
        const current = streakData.current || 0;
        const longest = streakData.longest || 0;

        let message = '';
        let icon = '🔥';

        if (current === 0) {
            message = '¡Empieza tu racha hoy! Cada día cuenta.';
            icon = '✨';
        } else if (current === 1) {
            message = '¡Comenzaste una nueva racha! Sigue así mañana.';
            icon = '🎉';
        } else if (current >= 7 && current < 30) {
            message = `¡Una semana completa! Llevas ${current} días seguidos.`;
            icon = '⭐';
        } else if (current >= 30 && current < 100) {
            message = `¡UN MES! ${current} días consecutivos. ¡Eres imparable!`;
            icon = '🏆';
        } else if (current >= 100) {
            message = `¡INCREÍBLE! ${current} días. Eres una leyenda del aprendizaje!`;
            icon = '💎';
        } else {
            message = `¡Vas muy bien! ${current} días seguidos.`;
            if (longest > current) {
                message += ` Tu récord es ${longest} días.`;
            }
        }

        messageEl.innerHTML = `${icon} ${message}`;
    }
}

// ================================
// EVENT LISTENERS
// ================================
function setupEventListeners() {
    console.log('🔗 Setting up event listeners...');

    // Preferences - Modified to check if elements exist
    const savePrefBtn = document.getElementById('savePreferencesBtn');
    if (savePrefBtn) {
        savePrefBtn.addEventListener('click', handlePreferencesSave);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('✅ Logout button connected');
    }

    // Change password
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', openChangePasswordModal);
        console.log('✅ Change password button connected');
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModePref');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function () {
            if (window.AppUtils && window.AppUtils.DarkMode) {
                if (this.checked) {
                    window.AppUtils.DarkMode.enable();
                } else {
                    window.AppUtils.DarkMode.disable();
                }
            } else {
                // Fallback
                if (this.checked) {
                    document.documentElement.classList.add('dark-mode');
                    localStorage.setItem('darkMode', 'enabled');
                } else {
                    document.documentElement.classList.remove('dark-mode');
                    localStorage.setItem('darkMode', 'disabled');
                }
            }
        });
    }

    console.log('✅ Event listeners set up');
}

// ================================
// CHARACTER COUNT
// ================================
// function updateCharCount() - REMOVED

// function handleProfileSubmit(e) - REMOVED

// ================================
// SAVE PREFERENCES
// ================================
async function handlePreferencesSave() {
    console.log('⚙️ Saving preferences...');

    const btn = document.getElementById('savePreferencesBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        const preferencesData = {
            preferences: {
                darkMode: document.getElementById('darkModePref').checked,
                notifications: document.getElementById('notificationsPref').checked,
                sound: document.getElementById('soundPref').checked,
                language: document.getElementById('languagePref').value,
                fontSize: document.getElementById('fontSizePref').value,
                dailyGoal: parseInt(document.getElementById('dailyGoalPref').value)
            }
        };

        const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: window.AuthService.getAuthHeaders(),
            body: JSON.stringify(preferencesData)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            applyPreferences(preferencesData.preferences);
            showNotification('Preferencias guardadas correctamente', 'success');
            console.log('✅ Preferences saved successfully');
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar');
        }
    } catch (error) {
        console.error('❌ Error saving preferences:', error);
        showNotification(error.message || 'Error al guardar preferencias', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// ================================
// APPLY PREFERENCES
// ================================
function applyPreferences(preferences) {
    console.log('🎨 Applying preferences...', preferences);

    // Dark mode
    if (preferences.darkMode) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }

    // Font size
    if (preferences.fontSize) {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        document.documentElement.style.fontSize = sizes[preferences.fontSize];
    }

    // Save to localStorage
    localStorage.setItem('notifications', preferences.notifications);
    localStorage.setItem('sound', preferences.sound);
    localStorage.setItem('language', preferences.language);
    localStorage.setItem('dailyGoal', preferences.dailyGoal);

    console.log('✅ Preferences applied');
}

// ================================
// LOGOUT HANDLER
// ================================
async function handleLogout() {
    console.log('🚪 Logout requested');

    if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        console.log('⏸️ Logout cancelled by user');
        return;
    }

    try {
        console.log('🔄 Processing logout...');

        if (window.AuthService && typeof window.AuthService.logout === 'function') {
            await window.AuthService.logout();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            sessionStorage.clear();
        }

        console.log('✅ Logout successful');
        showNotification('Sesión cerrada correctamente', 'success');

        setTimeout(() => {
            window.location.href = '/';
        }, 1000);

    } catch (error) {
        console.error('❌ Error during logout:', error);
        localStorage.clear();
        sessionStorage.clear();
        showNotification('Error al cerrar sesión, pero se cerró de todas formas', 'warning');

        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    }
}

// ================================
// CHANGE PASSWORD MODAL
// ================================
function openChangePasswordModal() {
    console.log('🔐 Opening change password modal...');

    // Create modal if it doesn't exist
    let modal = document.getElementById('changePasswordModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'changePasswordModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Cambiar Contraseña</h3>
                    <button class="close-modal" onclick="closeChangePasswordModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="changePasswordForm" class="profile-form">
                        <div class="form-group">
                            <label for="currentPassword">
                                <i class="fas fa-lock"></i>
                                Contraseña Actual
                            </label>
                            <input 
                                type="password" 
                                id="currentPassword" 
                                required
                                placeholder="Ingresa tu contraseña actual"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="newPassword">
                                <i class="fas fa-key"></i>
                                Nueva Contraseña
                            </label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                required
                                minlength="8"
                                placeholder="Mínimo 8 caracteres"
                            >
                            <small style="color: #666; display: block; margin-top: 5px;">
                                Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
                            </small>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirmPassword">
                                <i class="fas fa-check"></i>
                                Confirmar Nueva Contraseña
                            </label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                required
                                placeholder="Confirma tu nueva contraseña"
                            >
                        </div>
                        
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button type="submit" class="btn btn-primary" style="flex: 1;">
                                <i class="fas fa-check"></i>
                                Cambiar Contraseña
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="closeChangePasswordModal()">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add form submit handler
        const form = document.getElementById('changePasswordForm');
        form.addEventListener('submit', handleChangePassword);
    }

    modal.style.display = 'flex';
}

window.closeChangePasswordModal = function () {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('changePasswordForm');
        if (form) form.reset();
    }
};

async function handleChangePassword(e) {
    e.preventDefault();
    console.log('🔐 Changing password...');

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validations
    if (newPassword !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
        return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        showNotification('La contraseña debe incluir mayúsculas, minúsculas y números', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cambiando...';

    try {
        const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: window.AuthService.getAuthHeaders(),
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (response.ok) {
            showNotification('Contraseña cambiada correctamente', 'success');
            closeChangePasswordModal();
            console.log('✅ Password changed successfully');
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Error al cambiar la contraseña');
        }
    } catch (error) {
        console.error('❌ Error changing password:', error);
        showNotification(error.message || 'Error al cambiar la contraseña', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ================================
// NOTIFICATION SYSTEM
// ================================
function showNotification(message, type = 'info') {
    // Intentar usar el sistema de toast global si existe
    if (window.ToastSystem) {
        if (type === 'error') window.ToastSystem.error(message);
        else if (type === 'success') window.ToastSystem.success(message);
        else if (type === 'warning') window.ToastSystem.warning(message);
        else window.ToastSystem.info(message);
        return;
    }

    // Fallback a las funciones globales si existen
    const globalMethod = `toast${type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (window[globalMethod]) {
        window[globalMethod](message);
        return;
    }

    // Último recurso: alert
    alert(message);
}

console.log('✅ Profile script loaded successfully');