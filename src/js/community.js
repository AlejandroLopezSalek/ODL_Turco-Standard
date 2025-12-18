// ========================================
// COMMUNITY LESSONS - BOOKS AND LESSONS DISPLAY
// ========================================

let currentLevel = 'all';

// Books data structure
const booksData = {
    'A1': [
        {
            title: 'İstanbul A1 Ders Kitabı',
            url: '/A1.pdf',
            size: '~8 MB',
            pages: '104',
            description: 'Libro oficial de texto para nivel A1'
        }
    ],
    'A2': [
        {
            title: 'A2 Türkçe Kitabı',
            url: '/A2.pdf',
            size: '~10 MB',
            pages: '120',
            description: 'Libro de texto para nivel A2'
        }
    ],
    'B1': [
        {
            title: 'B1 Ders Kitabı',
            url: '/B1.pdf',
            size: '~12 MB',
            pages: '150',
            description: 'Libro de texto para nivel B1'
        }
    ],
    'B2': [
        {
            title: 'B2 Ders Kitabı',
            url: '/B2.pdf',
            size: '~14 MB',
            pages: '160',
            description: 'Libro de texto para nivel B2'
        }
    ],
    'C1': [
        {
            title: 'C1 Ders Kitabı',
            url: '/C1.pdf',
            size: '~15 MB',
            pages: '180',
            description: 'Libro de texto para nivel C1'
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // Safety check for Service
    if (window.ContributionService) {
        loadLessons();
        loadBooks();
    } else {
        // Retry once after short delay if script order was off
        setTimeout(() => {
            if (window.ContributionService) {
                loadLessons();
                loadBooks();
            } else {
                console.error('ContributionService not available');
            }
        }, 500);
    }

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentLevel = e.target.dataset.level;

            // Reset search when changing level
            const searchInput = document.getElementById('communitySearch');
            if (searchInput) searchInput.value = '';

            // Update contribute button
            updateContributeButton();

            loadLessons();
            loadBooks();
        });
    });

    // Search functionality
    const searchInput = document.getElementById('communitySearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterContent(e.target.value);
        });
    }
});

function filterContent(searchTerm = '') {
    searchTerm = searchTerm.toLowerCase();
    loadBooks(searchTerm);
    loadLessons(searchTerm);
}

function loadBooks(searchTerm = '') {
    const booksSection = document.getElementById('booksSection');
    const booksGrid = document.getElementById('booksGrid');

    // Only show books if a specific level is selected
    if (currentLevel === 'all') {
        booksSection.style.display = 'none';
        return;
    }

    let levelBooks = booksData[currentLevel] || [];

    // Filter by search term
    if (searchTerm) {
        levelBooks = levelBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.description.toLowerCase().includes(searchTerm)
        );
    }

    if (levelBooks.length === 0) {
        booksSection.style.display = 'none';
        return;
    }

    booksSection.style.display = 'block';
    booksGrid.innerHTML = '';

    levelBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';

        const cardContent = document.createElement('div');
        cardContent.className = 'book-card-content';

        const icon = document.createElement('div');
        icon.className = 'book-icon';
        icon.innerHTML = '<i class="fas fa-file-pdf"></i>';

        const info = document.createElement('div');
        info.className = 'book-info';

        const title = document.createElement('h3');
        title.className = 'book-title';
        title.textContent = book.title;

        const description = document.createElement('p');
        description.className = 'book-description';
        description.textContent = book.description;

        const meta = document.createElement('div');
        meta.className = 'book-meta';

        const pagesSpan = document.createElement('span');
        pagesSpan.innerHTML = `<i class="fas fa-file-alt"></i> ${book.pages} páginas`;

        const sizeSpan = document.createElement('span');
        sizeSpan.innerHTML = `<i class="fas fa-hdd"></i> ${book.size}`;

        meta.appendChild(pagesSpan);
        meta.appendChild(sizeSpan);

        info.appendChild(title);
        info.appendChild(description);
        info.appendChild(meta);

        cardContent.appendChild(icon);
        cardContent.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'book-actions';

        const viewBtn = document.createElement('a');
        viewBtn.href = book.url;
        viewBtn.target = '_blank';
        viewBtn.className = 'book-btn btn-view';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i> Ver PDF';

        const downloadBtn = document.createElement('a');
        downloadBtn.href = book.url;
        downloadBtn.download = '';
        downloadBtn.className = 'book-btn btn-download';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar';

        actions.appendChild(viewBtn);
        actions.appendChild(downloadBtn);

        card.appendChild(cardContent);
        card.appendChild(actions);

        booksGrid.appendChild(card);
    });
}

async function loadLessons(searchTerm = '') {
    const container = document.getElementById('lessonsList');
    let lessons = await window.ContributionService.getPublishedLessons();

    // Filter by level
    if (currentLevel !== 'all') {
        lessons = lessons.filter(l => l.level === currentLevel);
    }

    // Filter by search term
    if (searchTerm) {
        lessons = lessons.filter(l =>
            l.title.toLowerCase().includes(searchTerm) ||
            l.description.toLowerCase().includes(searchTerm) ||
            l.author.toLowerCase().includes(searchTerm)
        );
    }

    // Sort by date (newest first)
    lessons.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    if (lessons.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-book-open"></i>
            <p>No hay lecciones encontradas</p>
        `;
        container.innerHTML = '';
        container.appendChild(emptyState);
        return;
    }

    container.innerHTML = '';

    lessons.forEach(lesson => {
        const card = document.createElement('div');
        card.className = 'contribution-card published';
        card.style.position = 'relative';

        // Header with Type and Status
        const header = document.createElement('div');
        header.className = 'contribution-header';
        header.innerHTML = `
            <div class="contribution-type">
                <i class="fas fa-book-open"></i>
                <span>Lección ${lesson.level}</span>
            </div>
            <span class="contribution-status status-published">
                Publicada
            </span>
        `;

        const title = document.createElement('h3');
        title.textContent = lesson.title;

        const description = document.createElement('p');
        description.textContent = lesson.description;

        const meta = document.createElement('div');
        meta.className = 'contribution-meta';
        meta.innerHTML = `
            <span><i class="fas fa-user"></i> ${lesson.author}</span>
            <span><i class="fas fa-calendar"></i> ${formatDate(lesson.publishedAt)}</span>
        `;

        // Actions Container
        const actions = document.createElement('div');
        actions.className = 'lesson-actions';
        actions.style.cssText = 'display:flex;gap:10px;margin-top:15px;flex-wrap:wrap;';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn-view-lesson';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i> Ver Lección';
        viewBtn.onclick = () => viewLesson(lesson.id);

        const editBtn = document.createElement('button');
        editBtn.className = 'lesson-edit-btn';
        editBtn.onclick = () => editPublishedLesson(lesson.id);
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Sugerir Edición';

        actions.appendChild(viewBtn);
        actions.appendChild(editBtn);

        // Add Delete Button if Admin
        if (window.ContributionService && window.ContributionService.isAdmin()) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'lesson-delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
            deleteBtn.title = 'Eliminar Lección';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteLesson(lesson.id);
            };
            actions.appendChild(deleteBtn);
        }

        card.appendChild(header);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(meta);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

async function viewLesson(id) {
    const lesson = await window.ContributionService.getLessonById(id);
    if (!lesson) return;

    document.getElementById('lessonTitle').textContent = lesson.title;

    const lessonBody = document.getElementById('lessonBody');
    lessonBody.innerHTML = `
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Información</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Nivel:</strong>
                    <span>${lesson.level}</span>
                </div>
                <div class="detail-item">
                    <strong>Autor:</strong>
                    <span>${lesson.author}</span>
                </div>
                <div class="detail-item">
                    <strong>Fecha:</strong>
                    <span>${formatDate(lesson.publishedAt)}</span>
                </div>
            </div>
        </div>
        <div class="detail-section">
            <h3><i class="fas fa-book"></i> Contenido</h3>
            <div class="lesson-content">
                ${lesson.content}
            </div>
        </div>
    `;

    document.getElementById('lessonModal').style.display = 'flex';
}

function closeLessonModal() {
    document.getElementById('lessonModal').style.display = 'none';
}

function editPublishedLesson(id) {
    window.location.href = `/Contribute/?editLesson=${id}`;
}

// Custom Delete Modal Logic
let lessonToDeleteId = null;

function deleteLesson(id) {
    lessonToDeleteId = id;
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.style.display = 'flex';
        // Setup confirm button
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.onclick = confirmDeleteLesson;
    } else {
        // Fallback if modal missing
        if (confirm('¿Confirmar eliminación?')) {
            performDelete(id);
        }
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.style.display = 'none';
    lessonToDeleteId = null;
}

async function confirmDeleteLesson() {
    if (!lessonToDeleteId) return;
    performDelete(lessonToDeleteId);
    closeDeleteModal();
}

async function performDelete(id) {
    try {
        await window.ContributionService.deleteContribution(id);
        if (window.toastSuccess) {
            window.toastSuccess('Lección eliminada correctamente', 'Éxito', 3000);
        } else {
            alert('Lección eliminada');
        }
        // Reload
        setTimeout(() => loadLessons(document.getElementById('communitySearch')?.value || ''), 500);
    } catch (e) {
        if (window.toastError) {
            window.toastError('Error al eliminar: ' + e.message, 'Error', 4000);
        } else {
            alert('Error al eliminar: ' + e.message);
        }
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function updateContributeButton() {
    const contributeBtn = document.getElementById('communityCreateBtn');
    if (!contributeBtn) return;

    if (currentLevel === 'all') {
        // No level selected, just go to contribute page
        contributeBtn.href = '/Contribute/';
    } else {
        // Pass the selected level as a parameter
        contributeBtn.href = `/Contribute/?level=${currentLevel}`;
    }
}

console.log('✅ Community Lessons JS loaded');