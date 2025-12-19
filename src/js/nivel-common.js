// =====================================================
// UNIVERSAL NIVEL JAVASCRIPT - WORKS FOR ALL LEVELS
// Auto-detects level from URL (A1, A2, B1, B2, C1)
// =====================================================

// Detect current level from URL
function getCurrentLevel() {
    const path = window.location.pathname;
    const match = path.match(/Nivel([ABC][12])/i);
    if (match) {
        return match[1].toUpperCase(); // Returns 'A1', 'A2', 'B1', 'B2', or 'C1'
    }
    return 'A1'; // Default fallback
}

const CURRENT_LEVEL = getCurrentLevel();
const LEVEL_LOWER = CURRENT_LEVEL.toLowerCase();

// Almacenar las explicaciones globalmente una vez cargadas
let explanationsCache = null;

// Función para obtener las explicaciones del archivo JSON (o caché)
async function getExplanations() {
    if (explanationsCache) {
        return explanationsCache;
    }

    try {
        const response = await fetch(`/data/${LEVEL_LOWER}_lessons.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        explanationsCache = data;
        return data;
    } catch (error) {
        console.error(`Error al cargar las lecciones de ${CURRENT_LEVEL}:`, error);
        const modal = document.getElementById('explanationModal');
        if (modal) {
            document.getElementById('modalTitle').textContent = "Error de Carga";
            modal.style.display = 'none';
        }
    }
}

// Función para cerrar el modal - GLOBAL para sobrescribir gramatica.js
window.closeModal = function () {
    console.log('✅ closeModal() from nivel-common.js');
    const modal = document.getElementById('explanationModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.style.setProperty('display', 'none', 'important');
        console.log('✅ Modal closed');
        setTimeout(() => {
            const modalContent = document.getElementById('modalContent');
            if (modalContent) modalContent.innerHTML = '';
        }, 100);
    }
};

// Función para abrir explicaciones
async function openExplanation(topic) {
    const modal = document.getElementById('explanationModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');

    const explanations = await getExplanations();

    if (explanations && explanations[topic]) {
        title.textContent = explanations[topic].title;
        content.innerHTML = explanations[topic].content;

        modal.classList.add('active');
        modal.style.display = 'flex';

        // Inject Edit Button AFTER modal is displayed
        requestAnimationFrame(() => {
            let editBtn = document.getElementById('modalEditBtn');
            if (!editBtn) {
                editBtn = document.createElement('a');
                editBtn.id = 'modalEditBtn';
                editBtn.className = 'btn btn-outline-secondary btn-sm';
                editBtn.style.marginLeft = 'auto';
                editBtn.style.marginRight = '10px';
                editBtn.style.display = 'flex';
                editBtn.style.alignItems = 'center';
                editBtn.style.gap = '5px';
                editBtn.style.textDecoration = 'none';
                editBtn.style.cursor = 'pointer';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';

                // Insert before close button
                const closeBtn = document.getElementById('closeModalBtn');
                const header = document.querySelector('.modal-header');
                if (header && closeBtn) {
                    header.insertBefore(editBtn, closeBtn);
                }
            }

            // Update to use Inline Editor
            editBtn.href = '#';
            editBtn.onclick = (e) => {
                e.preventDefault();
                // Check Auth before opening editor
                if (window.AuthService && !window.AuthService.isLoggedIn()) {
                    if (window.toastWarning) {
                        window.toastWarning("Debes registrarte o iniciar sesión para corregir esta lección", "Acceso Restringido");
                    } else {
                        alert("Debes registrarte o iniciar sesión para corregir esta lección");
                    }
                    return;
                }
                openInlineEditor(topic);
            };
        });
    } else {
        title.textContent = "Error";
        content.innerHTML = "<p>Contenido no encontrado para este tema.</p>";
        modal.style.display = 'flex';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Define closeModal AQUÍ para sobrescribir gramatica.js que se carga antes
    window.closeModal = function () {
        console.log('✅ closeModal() from nivel-common.js');
        const modal = document.getElementById('explanationModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            modal.style.setProperty('display', 'none', 'important');
            console.log('✅ Modal closed');
            setTimeout(() => {
                const modalContent = document.getElementById('modalContent');
                if (modalContent) modalContent.innerHTML = '';
            }, 100);
        }
    };

    const panel = document.getElementById('topicsPanel');
    const panelToggle = document.getElementById('panelToggle');
    const searchInput = document.getElementById('topicSearch');
    const grammarCards = document.querySelectorAll('.grammar-card');

    // Toggle panel
    if (panelToggle && panel) {
        panelToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            panel.classList.toggle('collapsed');
        });

        const panelHeader = document.querySelector('.panel-header');
        if (panelHeader) {
            panelHeader.addEventListener('click', function (e) {
                // Prevent toggle if clicking search box or toggle button (handled above)
                if (e.target.closest('.search-box') || e.target.closest('.panel-toggle')) return;
                panel.classList.toggle('collapsed');
            });
        }
    }

    // Búsqueda que filtra las tarjetas de gramática
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm === '') {
                grammarCards.forEach(card => {
                    card.style.display = '';
                });
            } else {
                grammarCards.forEach(card => {
                    const title = card.querySelector('h3').textContent.toLowerCase();
                    const description = card.querySelector('.card-description').textContent.toLowerCase();

                    if (title.includes(searchTerm) || description.includes(searchTerm)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }

    // Agregar event listeners a los botones de explicación
    const explanationButtons = document.querySelectorAll('.explanation-btn');
    explanationButtons.forEach(button => {
        button.addEventListener('click', function () {
            const topic = this.getAttribute('data-topic');
            if (topic) {
                openExplanation(topic);
            }
        });
    });

    // Agregar event listener al botón de cerrar modal (usando delegación)
    const modal = document.getElementById('explanationModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            console.log('Modal clicked:', e.target);

            // Close if clicking the X button, its icon, or anywhere inside the button
            const closeBtn = e.target.closest('#closeModalBtn') || e.target.closest('.close-modal');
            const isCloseIcon = e.target.classList.contains('fa-times');

            if (closeBtn || isCloseIcon || e.target.id === 'closeModalBtn' || e.target.classList.contains('close-modal')) {
                console.log('Close button clicked!');
                e.preventDefault();
                e.stopPropagation();
                closeModal();
                return;
            }

            // Close if clicking outside modal content
            if (e.target.id === 'explanationModal') {
                console.log('Clicked outside modal');
                closeModal();
            }
        });
    }

    // Also add direct listener as backup
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            console.log('Direct close button click');
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }

    // Initialize Inline Editor
    if (typeof LessonEditor !== 'undefined') {
        window.inlineLessonEditor = new LessonEditor('inlineLessonContentEditor');
    }

    // Cancel Edit Button
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function (e) {
            e.preventDefault();
            closeInlineEditor();
        });
    }

    // Handle Inline Submit
    const inlineForm = document.getElementById('inlineLessonForm');
    if (inlineForm) {
        inlineForm.addEventListener('submit', handleInlineSubmit);
    }
});

// ==========================================
// INLINE EDITOR FUNCTIONS
// ==========================================

function openInlineEditor(topic) {
    // Get lesson data from cache
    getExplanations().then(explanations => {
        if (!explanations || !explanations[topic]) {
            if (window.toastError) window.toastError('Error al cargar la lección', 'Error');
            else alert('Error al cargar la lección');
            return;
        }

        const lesson = explanations[topic];

        // Populate Form
        const titleInput = document.getElementById('inlineLessonTitle');
        const idInput = document.getElementById('inlineLessonId');
        const descInput = document.getElementById('inlineLessonDescription');

        if (titleInput) titleInput.value = lesson.title;
        if (idInput) idInput.value = topic;
        if (descInput) descInput.value = ''; // Description might not exist in JSON

        if (window.inlineLessonEditor) {
            window.inlineLessonEditor.setContent(lesson.content || '');
        }

        // Show Editor, Hide Content
        const editorContainer = document.getElementById('inlineEditorContainer');
        const cardsContainer = document.querySelector('.grammar-cards-container, .grammar-cards');
        const topicsPanel = document.getElementById('topicsPanel');
        const modal = document.getElementById('explanationModal');

        if (editorContainer) editorContainer.style.display = 'block';
        if (cardsContainer) cardsContainer.style.display = 'none';
        if (topicsPanel) topicsPanel.style.display = 'none';
        if (modal) modal.style.display = 'none';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function closeInlineEditor() {
    const editorContainer = document.getElementById('inlineEditorContainer');
    const cardsContainer = document.querySelector('.grammar-cards-container, .grammar-cards');
    const topicsPanel = document.getElementById('topicsPanel');

    if (editorContainer) editorContainer.style.display = 'none';
    if (cardsContainer) cardsContainer.style.display = '';
    if (topicsPanel) topicsPanel.style.display = '';
}

async function handleInlineSubmit(e) {
    e.preventDefault();

    const content = window.inlineLessonEditor ? window.inlineLessonEditor.getContent() : '';

    if (!content || content.trim() === '') {
        if (window.toastWarning) window.toastWarning('Por favor añade contenido a la lección', 'Campo Requerido');
        else alert('Por favor añade contenido a la lección');
        return;
    }

    const lessonData = {
        lessonTitle: document.getElementById('inlineLessonTitle').value,
        level: CURRENT_LEVEL,
        description: document.getElementById('inlineLessonDescription').value,
        newContent: content,
        lessonId: document.getElementById('inlineLessonId').value,
        source: 'nivel-edit' // Mark as nivel-specific edit
    };

    try {
        // Use ContributionService if available
        if (window.ContributionService) {
            await window.ContributionService.submitLessonEdit(lessonData);

            // Show success message
            if (window.ToastSystem) {
                window.ToastSystem.success('¡Propuesta de edición enviada! Gracias por contribuir.', 'Enviado');
            } else {
                alert('¡Propuesta de edición enviada!');
            }

            closeInlineEditor();
        } else {
            console.error('ContributionService not found');
            if (window.toastError) window.toastError('Servicio de contribución no disponible', 'Error Sistema');
            else alert('Error: Servicio de contribución no disponible');
        }
    } catch (error) {
        console.error('Error submitting edit:', error);
        if (window.toastError) window.toastError('Error al enviar la edición. Intenta de nuevo.', 'Error');
        else alert('Error al enviar la edición');
    }
}
