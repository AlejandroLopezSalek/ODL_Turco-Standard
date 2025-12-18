// ========================================
// ADMIN CONTRIBUTIONS - Admin Dashboard Handler
// ========================================

let currentFilter = 'all';
let currentRequestId = null;
let confirmAction = null;

document.addEventListener('DOMContentLoaded', () => {
    // Only run on admin dashboard
    if (!document.getElementById('adminDashboard')) return;

    // Check admin access
    if (!window.ContributionService || !window.ContributionService.isAdmin()) {
        showToast('Acceso denegado. Solo administradores pueden acceder a esta página.', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        return;
    }

    initAdminDashboard();
});

function initAdminDashboard() {
    // Load stats and requests
    loadStats();
    loadRequests();

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            const customTarget = e.currentTarget;
            customTarget.classList.add('active');
            currentFilter = customTarget.dataset.filter;
            loadRequests();
        });
    });

    // Modal buttons
    document.getElementById('approveBtn')?.addEventListener('click', () => handleApprove(currentRequestId));
    document.getElementById('rejectBtn')?.addEventListener('click', () => handleReject(currentRequestId));
}

// ========================================
// LOAD DATA
// ========================================

async function loadStats() {
    try {
        const stats = await window.ContributionService.getStats();

        document.getElementById('statPending').textContent = stats.pending;
        document.getElementById('statApproved').textContent = stats.approved;
        document.getElementById('statRejected').textContent = stats.rejected;
        document.getElementById('statTotal').textContent = stats.total;

        document.getElementById('badgeAll').textContent = stats.pending;
        document.getElementById('badgeLessons').textContent = stats.lessonEdits;
        document.getElementById('badgeBooks').textContent = stats.bookUploads;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRequests() {
    const container = document.getElementById('requestsList');

    try {
        let requests = await window.ContributionService.getPendingRequests();

        // Apply filter
        if (currentFilter !== 'all') {
            requests = requests.filter(req => req.type === currentFilter);
        }

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>¡Todo al día!</h3>
                    <p>No hay solicitudes pendientes de revisión</p>
                </div>
            `;
            return;
        }

        container.innerHTML = requests.map(request => `
            <div class="request-card" data-id="${request.id}">
                <div class="request-header">
                    <div class="request-type">
                        <i class="fas ${request.type === 'lesson_edit' ? 'fa-book-open' : 'fa-file-pdf'}"></i>
                        <span>${request.type === 'lesson_edit' ? 'Edición de Lección' : 'Libro Compartido'}</span>
                    </div>
                    <span class="request-date">${formatDate(request.submittedAt)}</span>
                </div>
                
                <h3>${request.title}</h3>
                <p class="request-description">${truncate(request.description, 150)}</p>
                
                <div class="request-meta">
                    <span><i class="fas fa-user"></i> ${request.submittedBy?.username || 'Usuario Desconocido'}</span>
                    ${request.data.level ? `<span><i class="fas fa-layer-group"></i> ${request.data.level}</span>` : ''}
                </div>
                
                <div class="request-actions">
                    <button class="btn-view" onclick="viewRequest('${request._id}')">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                    <button class="btn-approve-quick" onclick="handleApprove('${request._id}')">
                        <i class="fas fa-check"></i> Aprobar
                    </button>
                    <button class="btn-reject-quick" onclick="handleReject('${request._id}')">
                        <i class="fas fa-times"></i> Rechazar
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading requests:', error);
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las solicitudes</p>
            </div>
        `;
    }
}

function handleDelete(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta solicitud permanentemente?')) {
        window.ContributionService.deleteRequest(id)
            .then(() => {
                showToast('Solicitud eliminada', 'success');
                loadStats();
                loadRequests();
            })
            .catch(err => {
                console.error(err);
                showToast('Error al eliminar', 'error');
            });
    }
}

// ========================================
// VIEW REQUEST DETAILS
// ========================================

async function viewRequest(id) {
    const request = await window.ContributionService.getRequestById(id);
    if (!request) return;

    currentRequestId = id;

    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = request.title;

    if (request.type === 'lesson_edit') {
        modalBody.innerHTML = `
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Información General</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Nivel:</strong>
                        <span>${request.data.level}</span>
                    </div>
                    <div class="detail-item">
                        <strong>ID de Lección:</strong>
                        <span>${request.data.lessonId || 'Nueva lección'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Enviado por:</strong>
                        <span>${request.submittedBy?.username || 'Usuario Desconocido'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Fecha:</strong>
                        <span>${formatDate(request.submittedAt)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-align-left"></i> Descripción</h3>
                <p>${request.description}</p>
            </div>
            
            <div class="detail-section">
                <div class="section-header-actions">
                    <h3><i class="fas fa-file-alt"></i> Contenido</h3>
                    <button class="btn-edit-content" id="toggleEditBtn" onclick="toggleAdminEditor()">
                        <i class="fas fa-edit"></i> Editar Contenido
                    </button>
                </div>
                
                <!-- View Mode -->
                <div id="contentPreview" class="content-preview">
                    ${request.data.newContent || '<p>Sin contenido</p>'}
                </div>
                
                <!-- Edit Mode -->
                <div id="adminEditorContainer" style="display: none;">
                    <div id="adminEditor"></div>
                </div>
            </div>
        `;

        // Initialize editor but keep hidden
        if (typeof LessonEditor !== 'undefined') {
            window.adminEditorInstance = new LessonEditor('adminEditor');
            window.adminEditorInstance.setContent(request.data.newContent || '');
        } else {
            console.error('LessonEditor class not defined');
            document.getElementById('adminEditorContainer').innerHTML = '<p class="error">Editor no disponible</p>';
        }

    } else {
        modalBody.innerHTML = `
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Información del Libro</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Autor:</strong>
                        <span>${request.data.author}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Nivel:</strong>
                        <span>${request.data.level}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Categoría:</strong>
                        <span>${request.data.category}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Idioma:</strong>
                        <span>${request.data.language}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Formato:</strong>
                        <span>${request.data.format}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Tamaño:</strong>
                        <span>${request.data.fileSize}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-align-left"></i> Descripción</h3>
                <p>${request.description}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-link"></i> Enlace al Archivo</h3>
                <a href="${request.data.fileUrl}" target="_blank" class="file-link">
                    <i class="fas fa-external-link-alt"></i> ${request.data.fileUrl}
                </a>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-user"></i> Enviado por</h3>
                <p>${request.submittedBy?.username || 'Usuario Desconocido'} (${request.submittedBy?.email || 'Sin email'})</p>
            </div>
        `;
    }

    document.getElementById('requestModal').style.display = 'flex';
}

// ========================================
// HANDLE APPROVE/REJECT
// ========================================

function handleApprove(id) {
    currentRequestId = id;
    confirmAction = 'approve';

    document.getElementById('confirmTitle').textContent = 'Confirmar Aprobación';
    document.getElementById('confirmMessage').textContent = '¿Estás seguro de que quieres aprobar esta solicitud?';
    document.getElementById('reasonGroup').style.display = 'none';

    document.getElementById('confirmModal').style.display = 'flex';
}

function handleReject(id) {
    currentRequestId = id;
    confirmAction = 'reject';

    document.getElementById('confirmTitle').textContent = 'Confirmar Rechazo';
    document.getElementById('confirmMessage').textContent = '¿Estás seguro de que quieres rechazar esta solicitud?';
    document.getElementById('reasonGroup').style.display = 'block';

    document.getElementById('confirmModal').style.display = 'flex';
}

// Confirm button handler
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('confirmBtn')?.addEventListener('click', () => {
        if (confirmAction === 'approve') {
            approveRequest();
        } else if (confirmAction === 'reject') {
            rejectRequest();
        }
    });
});

async function approveRequest() {
    try {
        // Get edited content if in editor mode
        let finalContent = null;
        if (window.adminEditorInstance) {
            const editorContainer = document.getElementById('adminEditorContainer');
            if (editorContainer && editorContainer.style.display !== 'none') {
                finalContent = window.adminEditorInstance.getContent();
            }
        }

        await window.ContributionService.approveRequest(currentRequestId, finalContent);
        showToast('Solicitud aprobada correctamente', 'success');
        closeConfirmModal();
        closeModal();
        loadStats();
        loadRequests();
    } catch (error) {
        console.error('Error approving request:', error);
        showToast('Error al aprobar la solicitud', 'error');
    }
}

async function rejectRequest() {
    try {
        const reason = document.getElementById('rejectionReason').value;
        await window.ContributionService.rejectRequest(currentRequestId, reason);
        showToast('Solicitud rechazada', 'info');
        closeConfirmModal();
        closeModal();
        loadStats();
        loadRequests();
    } catch (error) {
        console.error('Error rejecting request:', error);
        showToast('Error al rechazar la solicitud', 'error');
    }
}

// ========================================
// MODAL CONTROLS
// ========================================

const modal = document.getElementById('requestModal');
if (modal) modal.style.display = 'none';
currentRequestId = null;
if (window.adminEditorInstance) {
    window.adminEditorInstance = null;
}


window.closeModal = function () {
    const modal = document.getElementById('requestModal');
    if (modal) modal.style.display = 'none';
    currentRequestId = null;
    // Clear editor to prevent conflicts
    const editorContainer = document.getElementById('adminEditorContainer');
    if (editorContainer) {
        editorContainer.style.display = 'none';
        document.getElementById('contentPreview').style.display = 'block';
        document.getElementById('toggleEditBtn').innerHTML = '<i class="fas fa-edit"></i> Editar Contenido';
    }
};

window.closeConfirmModal = function () {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
    const reasonInput = document.getElementById('rejectionReason');
    if (reasonInput) reasonInput.value = '';
};

function toggleAdminEditor() {
    const preview = document.getElementById('contentPreview');
    const editor = document.getElementById('adminEditorContainer');
    const btn = document.getElementById('toggleEditBtn');

    if (editor.style.display === 'none') {
        preview.style.display = 'none';
        editor.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye"></i> Ver Vista Previa';
    } else {
        preview.style.display = 'block';
        editor.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-edit"></i> Editar Contenido';
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

function showToast(message, type = 'info') {
    if (window.ToastSystem) {
        window.ToastSystem.show({ message, type });
    } else if (window.ToastManager) {
        window.ToastManager.show(message, type);
    } else {
        // Custom simple toast fallback instead of alert
        const div = document.createElement('div');
        div.className = `toast toast-${type}`;
        div.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#333;color:white;padding:15px;border-radius:8px;z-index:10000;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}

console.log('✅ Admin Contributions loaded');
