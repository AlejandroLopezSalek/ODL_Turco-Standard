// ========================================
// LESSON EDITOR - Visual Editor for Creating Beautiful Lessons
// ========================================

class LessonEditor {
    constructor(editorId) {
        this.editor = document.getElementById(editorId);
        if (!this.editor) return;

        this.editor.contentEditable = true;
        this.editor.classList.add('editor-content');
        this.savedRange = null; // Store selection for modal operations
        this.setupToolbar();
        this.setupTableBuilder();
    }

    setupToolbar() {
        // Create Carousel Container
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'editor-carousel-container';

        // Toolbar serves as the grid
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar editor-grid';
        toolbar.innerHTML = `
            <!-- Text Formatting -->
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-command="bold" title="Negrita">
                    <i class="fas fa-bold"></i>
                </button>
                <button type="button" class="toolbar-btn" data-command="italic" title="Cursiva">
                    <i class="fas fa-italic"></i>
                </button>
                <button type="button" class="toolbar-btn" data-command="underline" title="Subrayado">
                    <i class="fas fa-underline"></i>
                </button>
            </div>

            <!-- Headings -->
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-command="h2" title="Título Grande">
                    <i class="fas fa-heading"></i> H2
                </button>
                <button type="button" class="toolbar-btn" data-command="h3" title="Título Mediano">
                    <i class="fas fa-heading"></i> H3
                </button>
            </div>

            <!-- Lists -->
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="Lista">
                    <i class="fas fa-list-ul"></i>
                </button>
                <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="Lista Numerada">
                    <i class="fas fa-list-ol"></i>
                </button>
            </div>

            <!-- Components -->
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-action="table" title="Insertar Tabla">
                    <i class="fas fa-table"></i> Tabla
                </button>
                <button type="button" class="toolbar-btn" data-action="highlight" title="Caja de Resaltado">
                    <i class="fas fa-highlighter"></i> Resaltar
                </button>
                <button type="button" class="toolbar-btn" data-action="tip" title="Consejo">
                    <i class="fas fa-lightbulb"></i> Tip
                </button>
                <button type="button" class="toolbar-btn" data-action="example" title="Ejemplo">
                    <i class="fas fa-code"></i> Ejemplo
                </button>
            </div>
        `;

        // Add Indicators
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        // We have 4 groups
        indicators.innerHTML = `
            <button class="carousel-indicator active" aria-label="Grupo 1"></button>
            <button class="carousel-indicator" aria-label="Grupo 2"></button>
            <button class="carousel-indicator" aria-label="Grupo 3"></button>
            <button class="carousel-indicator" aria-label="Grupo 4"></button>
        `;

        carouselContainer.appendChild(toolbar);
        carouselContainer.appendChild(indicators);

        this.editor.parentNode.insertBefore(carouselContainer, this.editor);

        // Add event listeners
        toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                const action = btn.dataset.action;

                if (command) {
                    this.execCommand(command);
                } else if (action) {
                    this.insertComponent(action);
                }
            });
        });

        // Setup component deletion (for mobile/click)
        this.setupComponentControls();
    }

    setupComponentControls() {
        // Create floating delete button
        this.deleteBtn = document.createElement('button');
        this.deleteBtn.className = 'component-delete-btn';
        this.deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
        this.deleteBtn.style.display = 'none';
        document.body.appendChild(this.deleteBtn);

        let activeComponent = null;

        // Handle clicks on editor
        this.editor.addEventListener('click', (e) => {
            const component = e.target.closest('.highlight-box, .tip-box, .example-box, .lesson-table');

            if (component) {
                activeComponent = component;
                this.showDeleteButton(component);
            } else {
                this.hideDeleteButton();
                activeComponent = null;
            }
        });

        // Handle delete action
        this.deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (activeComponent) {
                activeComponent.remove();
                this.hideDeleteButton();
                activeComponent = null;
            }
        });

        // Hide on scroll or resize
        window.addEventListener('scroll', () => this.hideDeleteButton(), true);
        window.addEventListener('resize', () => this.hideDeleteButton());
    }

    showDeleteButton(element) {
        const rect = element.getBoundingClientRect();
        this.deleteBtn.style.display = 'flex';
        this.deleteBtn.style.top = `${rect.top - 40}px`;
        this.deleteBtn.style.left = `${rect.left}px`;
    }

    hideDeleteButton() {
        this.deleteBtn.style.display = 'none';
    }

    execCommand(command) {
        if (command === 'h2' || command === 'h3') {
            document.execCommand('formatBlock', false, command);
        } else {
            document.execCommand(command, false, null);
        }
        this.editor.focus();
    }

    insertComponent(type) {
        this.editor.focus(); // Ensure editor has focus first

        let selection = window.getSelection();
        if (selection.rangeCount === 0) {
            // If still no range, create one at the end
            const range = document.createRange();
            range.selectNodeContents(this.editor);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        const range = selection.getRangeAt(0);

        let component;
        switch (type) {
            case 'table':
                this.showTableBuilder();
                return;
            case 'highlight':
                component = this.createHighlightBox();
                break;
            case 'tip':
                component = this.createTipBox();
                break;
            case 'example':
                component = this.createExampleBox();
                break;
        }

        if (component) {
            range.deleteContents();
            range.insertNode(component);

            // Move cursor after component
            range.setStartAfter(component);
            range.setEndAfter(component);
            selection.removeAllRanges();
            selection.addRange(range);

            this.editor.focus();
        }
    }

    createHighlightBox() {
        const div = document.createElement('div');
        div.className = 'highlight-box';
        div.innerHTML = `
            <strong>Punto Importante:</strong>
            <p>Escribe aquí el contenido destacado...</p>
        `;
        return div;
    }

    createTipBox() {
        const div = document.createElement('div');
        div.className = 'tip-box';
        div.innerHTML = `
            <div>
                <strong>Consejo:</strong>
                <p>Escribe aquí tu consejo útil...</p>
            </div>
        `;
        return div;
    }

    createExampleBox() {
        const div = document.createElement('div');
        div.className = 'example-box';
        div.innerHTML = `
            <strong>Ejemplo:</strong>
            <p>Ben <code>okula</code> gidiyorum - Yo voy <code>a la escuela</code></p>
        `;
        return div;
    }

    setupTableBuilder() {
        const modal = document.createElement('div');
        modal.className = 'table-builder-modal';
        modal.id = 'tableBuilderModal';
        modal.innerHTML = `
            <div class="table-builder-content">
                <h3><i class="fas fa-table"></i> Crear Tabla</h3>
                <div class="table-size-inputs">
                    <div>
                        <label>Filas:</label>
                        <input type="number" id="tableRows" min="2" max="15" value="3">
                    </div>
                    <div>
                        <label>Columnas:</label>
                        <input type="number" id="tableCols" min="2" max="15" value="2">
                    </div>
                </div>
                <div class="table-preview" id="tablePreview"></div>
                <div class="modal-actions">
                    <button class="btn-primary" id="insertTableBtn">
                        <i class="fas fa-check"></i> Insertar Tabla
                    </button>
                    <button class="btn-cancel" id="cancelTableBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Event listeners
        const rowsInput = modal.querySelector('#tableRows');
        const colsInput = modal.querySelector('#tableCols');
        const preview = modal.querySelector('#tablePreview');

        const updatePreview = () => {
            let rows = parseInt(rowsInput.value) || 2;
            let cols = parseInt(colsInput.value) || 2;

            // Immediate visual feedback/clamping
            if (rows > 15) { rowsInput.value = 15; rows = 15; }
            if (cols > 15) { colsInput.value = 15; cols = 15; }

            preview.innerHTML = this.generateTableHTML(rows, cols, true);
        };

        rowsInput.addEventListener('input', updatePreview);
        colsInput.addEventListener('input', updatePreview);

        modal.querySelector('#insertTableBtn').addEventListener('click', () => {
            let rows = parseInt(rowsInput.value) || 2;
            let cols = parseInt(colsInput.value) || 2;

            // Enforce limits
            if (rows > 15) rows = 15;
            if (cols > 15) cols = 15;

            // Get data from preview inputs
            const tableData = this.getTableData(rows, cols);
            this.insertTable(tableData);
            this.closeTableBuilder();
        });

        modal.querySelector('#cancelTableBtn').addEventListener('click', () => {
            this.closeTableBuilder();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeTableBuilder();
            }
        });
    }

    showTableBuilder() {
        // Save current selection before opening modal
        this.editor.focus();
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            this.savedRange = selection.getRangeAt(0).cloneRange();
        } else {
            // Create fallback range at end
            this.savedRange = document.createRange();
            this.savedRange.selectNodeContents(this.editor);
            this.savedRange.collapse(false);
        }

        const modal = document.getElementById('tableBuilderModal');
        modal.classList.add('active');

        // Initialize preview
        const preview = modal.querySelector('#tablePreview');
        preview.innerHTML = this.generateTableHTML(3, 2, true);
    }

    closeTableBuilder() {
        const modal = document.getElementById('tableBuilderModal');
        modal.classList.remove('active');
    }

    generateTableHTML(rows, cols, editable = false) {
        // Validate inputs to prevent RangeError
        rows = parseInt(rows) || 2;
        cols = parseInt(cols) || 2;
        if (rows < 1) rows = 1;
        if (cols < 1) cols = 1;
        if (rows > 15) rows = 15; // Safety limit
        if (cols > 15) cols = 15; // Safety limit

        let html = '<table class="lesson-table"><thead><tr>';

        // Headers
        for (let c = 0; c < cols; c++) {
            if (editable) {
                html += `<th><input type="text" placeholder="Encabezado ${c + 1}" data-row="0" data-col="${c}"></th>`;
            } else {
                html += `<th>Encabezado ${c + 1}</th>`;
            }
        }
        html += '</tr></thead><tbody>';

        // Body rows
        for (let r = 1; r < rows; r++) {
            html += '<tr>';
            for (let c = 0; c < cols; c++) {
                if (editable) {
                    html += `<td><input type="text" placeholder="Dato" data-row="${r}" data-col="${c}"></td>`;
                } else {
                    html += `<td>Dato</td>`;
                }
            }
            html += '</tr>';
        }

        html += '</tbody></table>';
        return html;
    }

    getTableData(rows, cols) {
        const modal = document.getElementById('tableBuilderModal');
        const inputs = modal.querySelectorAll('input[data-row]');
        const data = [];

        for (let r = 0; r < rows; r++) {
            data[r] = [];
            for (let c = 0; c < cols; c++) {
                const input = modal.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
                data[r][c] = input ? input.value || `Dato ${r},${c}` : '';
            }
        }

        return data;
    }

    insertTable(data) {
        const rows = data.length;
        const cols = data[0].length;

        let html = '<table class="lesson-table"><thead><tr>';

        // Headers
        for (let c = 0; c < cols; c++) {
            html += `<th>${data[0][c]}</th>`;
        }
        html += '</tr></thead><tbody>';

        // Body
        for (let r = 1; r < rows; r++) {
            html += '<tr>';
            for (let c = 0; c < cols; c++) {
                html += `<td>${data[r][c]}</td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table><p><br></p>';

        // Restore selection and insert
        this.editor.focus();
        const selection = window.getSelection();
        selection.removeAllRanges();

        if (this.savedRange) {
            selection.addRange(this.savedRange);
        } else {
            // Fallback if somehow lost
            const range = document.createRange();
            range.selectNodeContents(this.editor);
            range.collapse(false);
            selection.addRange(range);
        }

        // Insert using execCommand for better undo history support, 
        // but ensure we have the right focus.
        // If execCommand fails, we can fallback to insertHTML
        if (!document.execCommand('insertHTML', false, html)) {
            const range = selection.getRangeAt(0);
            const fragment = range.createContextualFragment(html);
            range.deleteContents();
            range.insertNode(fragment);
            range.collapse(false);
        }
    }

    getContent() {
        return this.editor.innerHTML;
    }

    setContent(html) {
        this.editor.innerHTML = html;
    }

    clear() {
        this.editor.innerHTML = '';
    }
}

// Make globally available
window.LessonEditor = LessonEditor;

console.log('✅ Lesson Editor loaded');
