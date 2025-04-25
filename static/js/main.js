document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const cvForm = document.getElementById('cv-form');
    const formTabs = document.querySelectorAll('.nav-link');
    const nextButtons = document.querySelectorAll('.next-tab');
    const prevButtons = document.querySelectorAll('.prev-tab');
    const skillsContainer = document.getElementById('skills-container');
    const addSkillBtn = document.getElementById('add-skill');
    const skillInput = document.getElementById('habilidad-tecnica');
    const skillsHiddenInput = document.getElementById('habilidades');
    const addEducationBtn = document.getElementById('add-education');
    const educationContainer = document.getElementById('education-container');
    const addExperienceBtn = document.getElementById('add-experience');
    const experienceContainer = document.getElementById('experience-container');
    const addLanguageBtn = document.getElementById('add-language');
    const languagesContainer = document.getElementById('languages-container');
    const exampleBtns = document.querySelectorAll('.example-btn');
    const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    const exampleContent = document.getElementById('example-content');
    const downloadModal = new bootstrap.Modal(document.getElementById('downloadModal'));
    const downloadLink = document.getElementById('download-link');
    const cvPreview = document.getElementById('cv-preview');
    
    // Cargar colores predeterminados
    loadColors();
    
    // Inicializar contadores para elementos dinámicos
    let educationCount = 1;
    let experienceCount = 1;
    let languageCount = 1;
    let skills = [];
    
    // Navegación entre pestañas
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const activeTab = document.querySelector('.tab-pane.active');
            const activeTabId = activeTab.getAttribute('id');
            const nextTabId = getNextTabId(activeTabId);
            
            // Validar campos obligatorios antes de avanzar
            if (activeTabId === 'personal' && !validatePersonalTab()) {
                return;
            }
            
            // Activar la siguiente pestaña
            const nextTab = bootstrap.Tab.getOrCreateInstance(document.querySelector(`[data-bs-target="#${nextTabId}"]`));
            nextTab.show();
            
            // Actualizar vista previa
            updatePreview();
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const activeTab = document.querySelector('.tab-pane.active');
            const activeTabId = activeTab.getAttribute('id');
            const prevTabId = getPrevTabId(activeTabId);
            
            // Activar la pestaña anterior
            const prevTab = bootstrap.Tab.getOrCreateInstance(document.querySelector(`[data-bs-target="#${prevTabId}"]`));
            prevTab.show();
        });
    });
    
    // Función para obtener el ID de la siguiente pestaña
    function getNextTabId(currentTabId) {
        const tabIds = ['personal', 'education', 'experience', 'skills', 'design'];
        const currentIndex = tabIds.indexOf(currentTabId);
        return tabIds[currentIndex + 1];
    }
    
    // Función para obtener el ID de la pestaña anterior
    function getPrevTabId(currentTabId) {
        const tabIds = ['personal', 'education', 'experience', 'skills', 'design'];
        const currentIndex = tabIds.indexOf(currentTabId);
        return tabIds[currentIndex - 1];
    }
    
    // Validación de la pestaña de datos personales
    function validatePersonalTab() {
        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const telefono = document.getElementById('telefono');
        const linkedin = document.getElementById('linkedin');
        const sitioWeb = document.getElementById('sitio_web');
        let isValid = true;
        
        // Validar campos obligatorios
        if (!nombre.value.trim()) {
            nombre.classList.add('is-invalid');
            isValid = false;
        } else {
            nombre.classList.remove('is-invalid');
        }
        
        if (!email.value.trim()) {
            email.classList.add('is-invalid');
            isValid = false;
        } else if (!validateEmail(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        } else {
            email.classList.remove('is-invalid');
        }
        
        if (!telefono.value.trim()) {
            telefono.classList.add('is-invalid');
            isValid = false;
        } else if (!validatePhone(telefono.value)) {
            telefono.classList.add('is-invalid');
            isValid = false;
        } else {
            telefono.classList.remove('is-invalid');
        }
        
        // Validar URLs opcionales
        if (linkedin.value.trim() && !validateUrl(linkedin.value)) {
            linkedin.classList.add('is-invalid');
            isValid = false;
        } else {
            linkedin.classList.remove('is-invalid');
        }
        
        if (sitioWeb.value.trim() && !validateUrl(sitioWeb.value)) {
            sitioWeb.classList.add('is-invalid');
            isValid = false;
        } else {
            sitioWeb.classList.remove('is-invalid');
        }
        
        return isValid;
    }
    
    // Funciones de validación
    function validateEmail(email) {
        const regex = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }
    
    function validatePhone(phone) {
        const regex = /^[\d\s\+\-\(\)]{8,15}$/;
        return regex.test(phone);
    }
    
    function validateUrl(url) {
        const regex = /^https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))+/;
        return regex.test(url);
    }
    
    // Gestión de habilidades
    addSkillBtn.addEventListener('click', function() {
        addSkill();
    });
    
    skillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    
    function addSkill() {
        const skillText = skillInput.value.trim();
        if (skillText && !skills.includes(skillText)) {
            skills.push(skillText);
            updateSkillsDisplay();
            skillInput.value = '';
            updateSkillsHiddenInput();
            // Actualizar la vista previa inmediatamente
            updatePreview();
        }
    }
    
    function updateSkillsDisplay() {
        skillsContainer.innerHTML = '';
        skills.forEach((skill, index) => {
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.innerHTML = `${skill} <span class="remove-skill" data-index="${index}">×</span>`;
            skillsContainer.appendChild(skillTag);
        });
        
        // Añadir eventos para eliminar habilidades
        document.querySelectorAll('.remove-skill').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                skills.splice(index, 1);
                updateSkillsDisplay();
                updateSkillsHiddenInput();
                updatePreview();
            });
        });
    }
    
    function updateSkillsHiddenInput() {
        skillsHiddenInput.value = JSON.stringify(skills);
    }
    
    // Gestión de educación
    addEducationBtn.addEventListener('click', function() {
        const newEducation = document.createElement('div');
        newEducation.className = 'education-entry card mb-3 p-3';
        newEducation.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Título/Grado</label>
                    <input type="text" class="form-control" name="educacion[${educationCount}][titulo]">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Institución</label>
                    <input type="text" class="form-control" name="educacion[${educationCount}][institucion]">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Fecha Inicio</label>
                    <input type="month" class="form-control" name="educacion[${educationCount}][fecha_inicio]">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Fecha Fin</label>
                    <input type="month" class="form-control" name="educacion[${educationCount}][fecha_fin]">
                </div>
                <div class="col-12">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control" name="educacion[${educationCount}][descripcion]" rows="2"></textarea>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-entry mt-2 align-self-end">Eliminar</button>
        `;
        educationContainer.appendChild(newEducation);
        educationCount++;
        
        // Añadir evento para eliminar educación
        newEducation.querySelector('.remove-entry').addEventListener('click', function() {
            newEducation.remove();
            updatePreview();
        });
        
        // Añadir eventos para actualizar vista previa en tiempo real
        newEducation.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updatePreview);
            // Disparar evento input para actualizar la vista previa inmediatamente
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        // Actualizar la vista previa
        updatePreview();
        
        // Configurar el nuevo checkbox de trabajo actual
        setupTrabajoActualCheckboxes();
    });
    
    // Añadir eventos para eliminar entradas de educación existentes
    document.querySelectorAll('#education-container .remove-entry').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.education-entry').remove();
            updatePreview();
        });
    });
    
    // Gestión de experiencia
    addExperienceBtn.addEventListener('click', function() {
        const newExperience = document.createElement('div');
        newExperience.className = 'experience-entry card mb-3 p-3';
        newExperience.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Puesto</label>
                    <input type="text" class="form-control" name="experiencia[${experienceCount}][puesto]">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Empresa</label>
                    <input type="text" class="form-control" name="experiencia[${experienceCount}][empresa]">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Fecha Inicio</label>
                    <input type="month" class="form-control" name="experiencia[${experienceCount}][fecha_inicio]">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Fecha Fin</label>
                    <input type="month" class="form-control" name="experiencia[${experienceCount}][fecha_fin]">
                    <div class="form-check mt-2">
                        <input class="form-check-input trabajo-actual" type="checkbox" id="trabajo_actual_${experienceCount}">
                        <label class="form-check-label" for="trabajo_actual_${experienceCount}">Trabajo Actual</label>
                    </div>
                </div>
                <div class="col-12">
                    <label class="form-label">Descripción</label>
                    <div class="input-group">
                        <textarea class="form-control" name="experiencia[${experienceCount}][descripcion]" rows="3"></textarea>
                        <button class="btn btn-outline-secondary example-btn" type="button" data-field="experiencia_descripcion"><i class="bi bi-question-circle"></i></button>
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-entry mt-2 align-self-end">Eliminar</button>
        `;
        experienceContainer.appendChild(newExperience);
        experienceCount++;
        
        // Añadir evento para eliminar experiencia
        newExperience.querySelector('.remove-entry').addEventListener('click', function() {
            newExperience.remove();
            updatePreview();
        });
        
        // Añadir eventos para actualizar vista previa en tiempo real
        newExperience.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updatePreview);
            // Disparar evento input para actualizar la vista previa inmediatamente
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        // Añadir evento para el checkbox de trabajo actual
        const trabajoActualCheckbox = newExperience.querySelector('.trabajo-actual');
        const fechaFinInput = newExperience.querySelector('input[name$="[fecha_fin]"]');
        
        trabajoActualCheckbox.addEventListener('change', function() {
            if (this.checked) {
                fechaFinInput.value = '';
                fechaFinInput.disabled = true;
                fechaFinInput.setAttribute('data-trabajo-actual', 'true');
            } else {
                fechaFinInput.disabled = false;
                fechaFinInput.removeAttribute('data-trabajo-actual');
            }
            updatePreview();
        });
        
        // Añadir evento para el botón de ejemplo
        newExperience.querySelector('.example-btn').addEventListener('click', function() {
            const field = this.getAttribute('data-field');
            fetch(`/ejemplos/${field}`)
                .then(response => response.json())
                .then(data => {
                    if (data.example) {
                        exampleContent.innerHTML = `<p>${data.example}</p>`;
                        exampleModal.show();
                    }
                })
                .catch(error => console.error('Error al cargar ejemplo:', error));
        });
        
        // Actualizar la vista previa
        updatePreview();
        
        // Configurar el nuevo checkbox de trabajo actual
        setupTrabajoActualCheckboxes();
    });
    
    // Añadir eventos para eliminar entradas de experiencia existentes
    document.querySelectorAll('#experience-container .remove-entry').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.experience-entry').remove();
            updatePreview();
        });
    });
    
    // Configurar eventos para los checkboxes de trabajo actual existentes
    function setupTrabajoActualCheckboxes() {
        document.querySelectorAll('.trabajo-actual').forEach((checkbox, index) => {
            const fechaFinInput = document.querySelector(`input[name="experiencia[${index}][fecha_fin]"]`);
            if (fechaFinInput) {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        fechaFinInput.value = '';
                        fechaFinInput.disabled = true;
                        fechaFinInput.setAttribute('data-trabajo-actual', 'true');
                    } else {
                        fechaFinInput.disabled = false;
                        fechaFinInput.removeAttribute('data-trabajo-actual');
                    }
                    updatePreview();
                });
                
                // Establecer estado inicial si el checkbox ya está marcado
                if (checkbox.checked) {
                    fechaFinInput.value = '';
                    fechaFinInput.disabled = true;
                    fechaFinInput.setAttribute('data-trabajo-actual', 'true');
                }
            }
        });
    }
    
    // Inicializar los checkboxes de trabajo actual
    setupTrabajoActualCheckboxes();
    
    // Gestión de idiomas
    addLanguageBtn.addEventListener('click', function() {
        const newLanguage = document.createElement('div');
        newLanguage.className = 'language-entry row g-2 mb-2';
        newLanguage.innerHTML = `
            <div class="col-md-6">
                <input type="text" class="form-control" name="idiomas[${languageCount}][idioma]" placeholder="Idioma">
            </div>
            <div class="col-md-5">
                <select class="form-select" name="idiomas[${languageCount}][nivel]">
                    <option value="">Nivel</option>
                    <option value="Nativo">Nativo</option>
                    <option value="Fluido">Fluido</option>
                    <option value="Avanzado">Avanzado</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Básico">Básico</option>
                </select>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-outline-danger remove-language">×</button>
            </div>
        `;
        languagesContainer.appendChild(newLanguage);
        languageCount++;
        
        // Añadir evento para eliminar idioma
        newLanguage.querySelector('.remove-language').addEventListener('click', function() {
            newLanguage.remove();
            updatePreview();
        });
        
        // Añadir eventos para actualizar vista previa en tiempo real
        newLanguage.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', updatePreview);
            input.addEventListener('change', updatePreview);
            // Disparar evento input para actualizar la vista previa inmediatamente
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        // Actualizar la vista previa
        updatePreview();
        
        // Configurar el nuevo checkbox de trabajo actual
        setupTrabajoActualCheckboxes();
    });
    
    // Añadir eventos para eliminar idiomas existentes
    document.querySelectorAll('#languages-container .remove-language').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.language-entry').remove();
            updatePreview();
        });
    });
    
    // Cargar ejemplos
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.getAttribute('data-field');
            fetch(`/ejemplos/${field}`)
                .then(response => response.json())
                .then(data => {
                    if (data.example) {
                        exampleContent.innerHTML = `<p>${data.example}</p>`;
                        exampleModal.show();
                    }
                })
                .catch(error => console.error('Error al cargar ejemplo:', error));
        });
    });
    
    // Cargar colores
    function loadColors() {
        fetch('/colores')
            .then(response => response.json())
            .then(data => {
                const colorOptions = document.getElementById('color-options');
                data.forEach(color => {
                    const colorOption = document.createElement('div');
                    colorOption.className = 'color-option';
                    colorOption.style.backgroundColor = color.hex;
                    colorOption.setAttribute('data-color', color.hex);
                    colorOption.setAttribute('title', color.name);
                    colorOptions.appendChild(colorOption);
                    
                    // Seleccionar el primer color por defecto
                    if (colorOptions.children.length === 1) {
                        colorOption.classList.add('selected');
                        document.getElementById('color_principal').value = color.hex;
                    }
                });
                
                // Añadir eventos para seleccionar color
                document.querySelectorAll('.color-option').forEach(option => {
                    option.addEventListener('click', function() {
                        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');
                        document.getElementById('color_principal').value = this.getAttribute('data-color');
                        updatePreview();
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar colores:', error);
                // Cargar colores por defecto si falla la petición
                const defaultColors = [
                    { name: 'Azul Oscuro', hex: '#2c3e50' },
                    { name: 'Azul', hex: '#3498db' },
                    { name: 'Verde', hex: '#2ecc71' },
                    { name: 'Morado', hex: '#9b59b6' },
                    { name: 'Rojo', hex: '#e74c3c' },
                    { name: 'Naranja', hex: '#e67e22' },
                    { name: 'Gris', hex: '#7f8c8d' },
                    { name: 'Negro', hex: '#2d3436' }
                ];
                
                const colorOptions = document.getElementById('color-options');
                defaultColors.forEach(color => {
                    const colorOption = document.createElement('div');
                    colorOption.className = 'color-option';
                    colorOption.style.backgroundColor = color.hex;
                    colorOption.setAttribute('data-color', color.hex);
                    colorOption.setAttribute('title', color.name);
                    colorOptions.appendChild(colorOption);
                    
                    // Seleccionar el primer color por defecto
                    if (colorOptions.children.length === 1) {
                        colorOption.classList.add('selected');
                        document.getElementById('color_principal').value = color.hex;
                    }
                });
                
                // Añadir eventos para seleccionar color
                document.querySelectorAll('.color-option').forEach(option => {
                    option.addEventListener('click', function() {
                        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');
                        document.getElementById('color_principal').value = this.getAttribute('data-color');
                        updatePreview();
                    });
                });
            });
    }
    
    // Actualizar vista previa del CV
    function updatePreview() {
        // Obtener datos del formulario
        const formData = new FormData(cvForm);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            // Manejar arrays (educación, experiencia, idiomas)
            if (key.includes('[')) {
                const mainKey = key.split('[')[0];
                const subKey = key.split('[')[1].split(']')[0];
                const fieldKey = key.split('][')[1]?.replace(']', '') || '';
                
                if (!data[mainKey]) {
                    data[mainKey] = [];
                }
                
                const index = parseInt(subKey);
                
                if (!data[mainKey][index]) {
                    data[mainKey][index] = {};
                }
                
                data[mainKey][index][fieldKey] = value;
            } else {
                data[key] = value;
            }
        }
        
        // Añadir habilidades
        data.habilidades = skills;
        
        // Verificar checkboxes de trabajo actual
        document.querySelectorAll('.trabajo-actual').forEach((checkbox, index) => {
            const fechaFinInput = document.querySelector(`input[name="experiencia[${index}][fecha_fin]"]`);
            if (fechaFinInput && checkbox.checked) {
                if (data.experiencia && data.experiencia[index]) {
                    data.experiencia[index].fecha_fin = 'Presente';
                }
            }
        });
        
        // Limpiar arrays vacíos
        ['educacion', 'experiencia', 'idiomas'].forEach(key => {
            if (data[key]) {
                data[key] = data[key].filter(item => {
                    return Object.values(item).some(val => val.trim() !== '');
                });
            }
        });

        
        // Generar HTML de vista previa
        let previewHTML = `
            <div class="cv-preview-content">
                <div class="cv-preview-header">
                    <div class="cv-preview-name">${data.nombre || 'Nombre Completo'}</div>
                    <div class="cv-preview-title">${data.profesion || 'Profesión'}</div>
                    <div class="cv-preview-contact">
                        ${data.email ? `${data.email} | ` : ''}
                        ${data.telefono ? `${data.telefono} | ` : ''}
                        ${data.direccion ? data.direccion : ''}
                    </div>
                    <div class="cv-preview-links">
                        ${data.linkedin ? `LinkedIn: ${data.linkedin}<br>` : ''}
                        ${data.sitio_web ? `Web: ${data.sitio_web}` : ''}
                    </div>
                </div>
        `;
        
        // Resumen
        if (data.resumen) {
            previewHTML += `
                <div class="cv-preview-section">
                    <div class="cv-preview-section-title">Resumen Profesional</div>
                    <div class="cv-preview-item-description">${data.resumen}</div>
                </div>
            `;
        }
        
        // Experiencia
        if (data.experiencia && data.experiencia.length > 0) {
            previewHTML += `
                <div class="cv-preview-section">
                    <div class="cv-preview-section-title">Experiencia Laboral</div>
            `;
            
            data.experiencia.forEach(exp => {
                const fechaInicio = exp.fecha_inicio ? formatDate(exp.fecha_inicio) : '';
                let fechaFin = exp.fecha_fin ? formatDate(exp.fecha_fin) : '';
                
                // Verificar si es trabajo actual
                const index = data.experiencia.indexOf(exp);
                const trabajoActualCheckbox = document.querySelector(`#trabajo_actual_${index}`);
                if (trabajoActualCheckbox && trabajoActualCheckbox.checked) {
                    fechaFin = 'Presente';
                }
                
                previewHTML += `
                    <div class="cv-preview-item">
                        <div class="cv-preview-item-title">${exp.puesto || 'Puesto'}</div>
                        <div class="cv-preview-item-subtitle">${exp.empresa || 'Empresa'}</div>
                        <div class="cv-preview-item-date">${fechaInicio} - ${fechaFin}</div>
                        <div class="cv-preview-item-description">${exp.descripcion || ''}</div>
                    </div>
                `;
            });
            
            previewHTML += `</div>`;
        }
        
        // Educación
        if (data.educacion && data.educacion.length > 0) {
            previewHTML += `
                <div class="cv-preview-section">
                    <div class="cv-preview-section-title">Educación</div>
            `;
            
            data.educacion.forEach(edu => {
                const fechaInicio = edu.fecha_inicio ? formatDate(edu.fecha_inicio) : '';
                const fechaFin = edu.fecha_fin ? formatDate(edu.fecha_fin) : '';
                
                previewHTML += `
                    <div class="cv-preview-item">
                        <div class="cv-preview-item-title">${edu.titulo || 'Título'}</div>
                        <div class="cv-preview-item-subtitle">${edu.institucion || 'Institución'}</div>
                        <div class="cv-preview-item-date">${fechaInicio} - ${fechaFin}</div>
                        <div class="cv-preview-item-description">${edu.descripcion || ''}</div>
                    </div>
                `;
            });
            
            previewHTML += `</div>`;
        }
        
        // Habilidades
        if (data.habilidades && data.habilidades.length > 0) {
            previewHTML += `
                <div class="cv-preview-section">
                    <div class="cv-preview-section-title">Habilidades</div>
                    <div class="cv-preview-item-description">${data.habilidades.join(', ')}</div>
                </div>
            `;
        }
        
        // Idiomas
        if (data.idiomas && data.idiomas.length > 0) {
            previewHTML += `
                <div class="cv-preview-section">
                    <div class="cv-preview-section-title">Idiomas</div>
            `;
            
            data.idiomas.forEach(idioma => {
                if (idioma.idioma && idioma.nivel) {
                    previewHTML += `
                        <div class="cv-preview-item">
                            <span class="cv-preview-item-title">${idioma.idioma}</span>: 
                            <span class="cv-preview-item-subtitle">${idioma.nivel}</span>
                        </div>
                    `;
                }
            });
            
            previewHTML += `</div>`;
        }
        
        previewHTML += `</div>`;
        
        // Actualizar vista previa
        cvPreview.innerHTML = previewHTML;
        
        // Aplicar color principal si está en la pestaña de diseño
        if (document.querySelector('#design.active')) {
            const colorPrincipal = document.getElementById('color_principal').value;
            document.querySelectorAll('.cv-preview-section-title').forEach(el => {
                el.style.borderBottomColor = colorPrincipal;
                el.style.color = colorPrincipal;
            });
        }
    }
    
    // Formatear fecha (YYYY-MM a MM/YYYY)
    function formatDate(dateString) {
        if (!dateString) return '';
        const [year, month] = dateString.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    // Envío del formulario
    cvForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar formulario
        if (!validatePersonalTab()) {
            // Mostrar pestaña con errores
            const personalTab = bootstrap.Tab.getOrCreateInstance(document.querySelector('#personal-tab'));
            personalTab.show();
            return;
        }
        
        // Preparar datos para enviar
        const formData = new FormData(cvForm);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            // Manejar arrays (educación, experiencia, idiomas)
            if (key.includes('[')) {
                const mainKey = key.split('[')[0];
                const subKey = key.split('[')[1].split(']')[0];
                const fieldKey = key.split('][')[1]?.replace(']', '') || '';
                
                if (!data[mainKey]) {
                    data[mainKey] = [];
                }
                
                // Asegurarse de que el índice sea un número para crear un array correcto
                const index = parseInt(subKey);
                
                // Inicializar el array con elementos vacíos si es necesario
                while (data[mainKey].length <= index) {
                    data[mainKey].push({});
                }
                
                data[mainKey][index][fieldKey] = value;
            } else {
                data[key] = value;
            }
        }
        
        // Añadir habilidades (asegurarse de que sea un array válido)
        data.habilidades = Array.isArray(skills) ? skills : [];
        
        // Limpiar arrays vacíos
        ['educacion', 'experiencia', 'idiomas'].forEach(key => {
            if (data[key]) {
                // Asegurarse de que sea un array antes de filtrar
                if (Array.isArray(data[key])) {
                    data[key] = data[key].filter(item => {
                        return item && typeof item === 'object' && Object.values(item).some(val => val && val.trim && val.trim() !== '');
                    });
                } else {
                    // Si no es un array, inicializarlo como array vacío
                    data[key] = [];
                }
            }
        });
        
        // Mostrar indicador de carga
        document.getElementById('generate-cv').disabled = true;
        document.getElementById('generate-cv').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generando...';
        
        // Enviar datos al servidor
        fetch('/generar-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            // Restaurar botón
            document.getElementById('generate-cv').disabled = false;
            document.getElementById('generate-cv').innerHTML = 'Generar CV';
            
            if (result.errors) {
                // Mostrar errores
                alert('Error: ' + result.errors.join('\n'));
            } else if (result.success) {
                // Mostrar modal de descarga
                downloadLink.href = result.pdf_url;
                downloadModal.show();
            } else {
                // Si no hay errores específicos ni éxito, mostrar mensaje genérico
                alert('No se pudo generar el CV. Por favor, verifica los datos e intenta nuevamente.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ha ocurrido un error al generar el CV: ' + error.message);
            
            // Restaurar botón
            document.getElementById('generate-cv').disabled = false;
            document.getElementById('generate-cv').innerHTML = 'Generar CV';
        });
    });
    
    // Añadir eventos para actualizar vista previa en tiempo real
    function setupRealTimePreview() {
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', updatePreview);
        });
        
        // Actualizar cuando se cambia la plantilla
        document.querySelectorAll('input[name="plantilla"]').forEach(radio => {
            radio.addEventListener('change', updatePreview);
        });
        
        // Actualizar cuando se cambia el color
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', updatePreview);
        });
    }
    
    // Inicializar eventos de actualización en tiempo real
    setupRealTimePreview();
    
    // Inicializar vista previa
    updatePreview();
});