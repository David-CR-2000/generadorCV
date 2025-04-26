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
    const pdfTemplate = document.getElementById('pdf-template');
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
            showExample(field);
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
            showExample(field);
        });
    });
    
    // Mostrar ejemplo (usando los datos locales)
    function showExample(field) {
        if (fieldExamples[field]) {
            exampleContent.innerHTML = `<p>${fieldExamples[field]}</p>`;
            exampleModal.show();
        } else {
            console.error('Ejemplo no encontrado para el campo:', field);
        }
    }
    
    // Cargar colores
    function loadColors() {
        try {
            const colorOptions = document.getElementById('color-options');
            colorOptions.innerHTML = '';
            
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
        } catch (error) {
            console.error('Error al cargar colores:', error);
        }
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
                    return Object.values(item).some(val => val.trim && val.trim() !== '');
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
                        ${data.email ? `${data.email}${data.telefono ? ' | ' : ''}` : ''}
                        ${data.telefono ? `${data.telefono}${data.direccion ? ' | ' : ''}` : ''}
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
        if (dateString === 'Presente') return 'Presente';
        
        const [year, month] = dateString.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    // Generar HTML completo para el PDF
    function generatePdfHtml(data) {
        // Obtener color principal o usar uno predeterminado
        const colorPrincipal = data.color_principal || '#2c3e50';
        
        // Crear HTML para el CV
        let html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CV - ${data.nombre || 'Sin nombre'}</title>
            <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body { 
                font-family: 'Roboto', Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                color: #333;
                font-size: 12pt;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            h1 { 
                color: ${colorPrincipal}; 
                font-size: 24pt;
                margin-bottom: 5px;
            }
            h2 { 
                color: ${colorPrincipal}; 
                font-size: 18pt;
                margin-top: 5px;
                margin-bottom: 15px;
            }
            h3 { 
                color: ${colorPrincipal}; 
                font-size: 16pt;
                margin-bottom: 10px;
            }
            .header { 
                margin-bottom: 30px;
                border-bottom: 2px solid ${colorPrincipal};
                padding-bottom: 20px;
            }
            .section { 
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            .section-title { 
                border-bottom: 1px solid ${colorPrincipal};
                padding-bottom: 5px;
                margin-bottom: 15px;
                font-weight: bold;
                color: ${colorPrincipal};
                font-size: 14pt;
            }
            .job-item, .education-item { 
                margin-bottom: 20px;
                page-break-inside: avoid;
            }
            .job-title, .education-title { 
                font-weight: bold;
                font-size: 13pt;
            }
            .job-company, .education-institution { 
                font-style: italic;
                font-size: 12pt;
            }
            .job-dates, .education-dates { 
                color: #666; 
                font-size: 11pt;
                margin-bottom: 5px;
            }
            .contact-info { 
                margin-bottom: 15px;
                font-size: 11pt;
            }
            .skills-list { 
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 10px;
            }
            .skill-item {
                background-color: ${colorPrincipal};
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 11pt;
                display: inline-block;
                margin-right: 5px;
                margin-bottom: 5px;
            }
            p {
                margin-top: 5px;
                margin-bottom: 5px;
            }
            ul {
                margin-top: 5px;
                padding-left: 20px;
            }
            li {
                margin-bottom: 3px;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <h1>${data.nombre || 'Sin nombre'}</h1>
                ${data.profesion ? `<h2>${data.profesion}</h2>` : ''}
                <div class="contact-info">
                ${data.email ? `<div>Email: ${data.email}</div>` : ''}
                ${data.telefono ? `<div>Teléfono: ${data.telefono}</div>` : ''}
                ${data.direccion ? `<div>Dirección: ${data.direccion}</div>` : ''}
                ${data.linkedin ? `<div>LinkedIn: ${data.linkedin}</div>` : ''}
                ${data.sitio_web ? `<div>Web: ${data.sitio_web}</div>` : ''}
                </div>
            </div>`;

        // Resumen profesional
        if (data.resumen) {
            html += `
            <div class="section">
                <h3 class="section-title">RESUMEN PROFESIONAL</h3>
                <p>${data.resumen}</p>
            </div>`;
        }

        // Experiencia laboral
        if (data.experiencia && data.experiencia.length > 0) {
            html += `
            <div class="section">
                <h3 class="section-title">EXPERIENCIA LABORAL</h3>`;
            
            data.experiencia.forEach(exp => {
                if (!exp.puesto && !exp.empresa) return;
                
                const puesto = exp.puesto || 'Puesto no especificado';
                const empresa = exp.empresa || 'Empresa no especificada';
                
                let fechas = '';
                if (exp.fecha_inicio) {
                    fechas += formatDate(exp.fecha_inicio);
                }
                if (exp.fecha_fin) {
                    fechas += ` - ${formatDate(exp.fecha_fin)}`;
                } else if (exp.fecha_inicio) {
                    fechas += ' - Presente';
                }
                
                // Formatear la descripción para preservar saltos de línea
                let descripcion = '';
                if (exp.descripcion) {
                    descripcion = exp.descripcion
                        .replace(/\n/g, '<br>')
                        .replace(/• /g, '<li>')
                        .replace(/\n/g, '</li>')
                        .replace(/<br><li>/g, '<li>');
                    
                    if (descripcion.includes('<li>')) {
                        descripcion = `<ul>${descripcion}</li></ul>`;
                    } else {
                        descripcion = `<p>${descripcion}</p>`;
                    }
                }
                
                html += `
                <div class="job-item">
                    <div class="job-title">${puesto}</div>
                    <div class="job-company">${empresa}</div>
                    ${fechas ? `<div class="job-dates">${fechas}</div>` : ''}
                    ${descripcion}
                </div>`;
            });
            
            html += `</div>`;
        }

        // Educación
        if (data.educacion && data.educacion.length > 0) {
            html += `
            <div class="section">
                <h3 class="section-title">EDUCACIÓN</h3>`;
            
            data.educacion.forEach(edu => {
                if (!edu.titulo && !edu.institucion) return;
                
                const titulo = edu.titulo || 'Título no especificado';
                const institucion = edu.institucion || 'Institución no especificada';
                
                let fechas = '';
                if (edu.fecha_inicio) {
                    fechas += formatDate(edu.fecha_inicio);
                }
                if (edu.fecha_fin) {
                    fechas += ` - ${formatDate(edu.fecha_fin)}`;
                }
                
                // Formatear la descripción para preservar saltos de línea
                let descripcion = '';
                if (edu.descripcion) {
                    descripcion = `<p>${edu.descripcion.replace(/\n/g, '<br>')}</p>`;
                }
                
                html += `
                <div class="education-item">
                    <div class="education-title">${titulo}</div>
                    <div class="education-institution">${institucion}</div>
                    ${fechas ? `<div class="education-dates">${fechas}</div>` : ''}
                    ${descripcion}
                </div>`;
            });
            
            html += `</div>`;
        }

        // Habilidades
        if (data.habilidades && data.habilidades.length > 0) {
            html += `
            <div class="section">
                <h3 class="section-title">HABILIDADES</h3>
                <div class="skills-list">`;
            
            data.habilidades.forEach(skill => {
                html += `<span class="skill-item">${skill}</span>`;
            });
            
            html += `</div>
            </div>`;
        }

        // Idiomas
        if (data.idiomas && data.idiomas.length > 0) {
            html += `
            <div class="section">
                <h3 class="section-title">IDIOMAS</h3>
                <ul>`;
            
            data.idiomas.forEach(idioma => {
                if (idioma.idioma && idioma.nivel) {
                    html += `<li><strong>${idioma.idioma}:</strong> ${idioma.nivel}</li>`;
                }
            });
            
            html += `</ul>
            </div>`;
        }

        html += `
            </div>
        </body>
        </html>`;

        return html;
    }

    // Función para obtener los datos del formulario
    function getFormData() {
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
                    return Object.values(item).some(val => val.trim && val.trim() !== '');
                });
            }
        });
        
        return data;
    }

    // Función para generar PDF
    let isGeneratingPdf = false; // Flag para controlar la generación del PDF
    
    function generatePdf() {
        // Evitar múltiples generaciones simultáneas
        if (isGeneratingPdf) {
            return;
        }

        try {
            // Validar formulario primero
            if (!validateForm()) {
                return;
            }
            
            isGeneratingPdf = true; // Activar flag
            
            // Mostrar mensaje de carga en la interfaz principal
            showLoadingMessage('Generando PDF, por favor espere...');
            
            // Obtener los datos del formulario
            const formData = getFormData();
            const htmlContent = generatePdfHtml(formData);
            
            // Crear una ventana emergente invisible donde generaremos el PDF
            const popupWindow = window.open('', '_blank', 'width=1,height=1,left=-1000,top=-1000');
            
            if (!popupWindow) {
                hideLoadingMessage();
                showErrorMessage('Por favor permite ventanas emergentes para generar el PDF.');
                isGeneratingPdf = false; // Restaurar flag
                return;
            }
            
            // Escribir el contenido HTML completo en la ventana emergente
            popupWindow.document.open();
            popupWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Generando PDF</title>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            width: 210mm;
                            margin: 0;
                            padding: 0;
                            background-color: white;
                        }
                    </style>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                </head>
                <body>
                    <div id="pdf-content">${htmlContent}</div>
                    
                    <script>
                        function generatePDFInPopup() {
                            const element = document.getElementById('pdf-content');
                            const filename = 'CV-${formData.nombre ? formData.nombre.replace(/"/g, '\\"') : 'SinNombre'}.pdf';
                            
                            const options = {
                                margin: [10, 10, 10, 10],
                                filename: filename,
                                image: { type: 'jpeg', quality: 0.98 },
                                html2canvas: { 
                                    scale: 2,
                                    useCORS: true,
                                    allowTaint: true,
                                    logging: false,
                                    letterRendering: true
                                },
                                jsPDF: { 
                                    unit: 'mm', 
                                    format: 'a4', 
                                    orientation: 'portrait',
                                    compress: true
                                }
                            };
                            
                            html2pdf().from(element).set(options).save().then(() => {
                                window.opener.postMessage('pdf-generated', '*');
                                setTimeout(() => window.close(), 500);
                            }).catch(error => {
                                console.error('Error al generar PDF:', error);
                                window.opener.postMessage('pdf-error', '*');
                                setTimeout(() => window.close(), 500);
                            });
                        }
                        
                        window.onload = generatePDFInPopup;
                    </script>
                </body>
                </html>
            `);
            popupWindow.document.close();
            
            // Configurar listener para recibir mensajes de la ventana emergente
            const messageListener = function(event) {
                if (event.data === 'pdf-generated') {
                    // PDF generado con éxito
                    hideLoadingMessage();
                    showSuccessMessage('¡CV generado con éxito!');
                    
                    // Mostrar modal de descarga
                    const downloadModal = new bootstrap.Modal(document.getElementById('downloadModal'));
                    downloadModal.show();
                    
                    // Limpiar listener
                    window.removeEventListener('message', messageListener);
                    
                    // Intentar cerrar la ventana emergente
                    try {
                        if (!popupWindow.closed) {
                            popupWindow.close();
                        }
                    } catch (e) {
                        console.error('Error al cerrar ventana:', e);
                    }
                } else if (event.data === 'pdf-error') {
                    hideLoadingMessage();
                    showErrorMessage('Hubo un problema al generar el PDF. Por favor, inténtalo de nuevo.');
                    
                    // Limpiar listener
                    window.removeEventListener('message', messageListener);
                    
                    // Intentar cerrar la ventana emergente
                    try {
                        if (!popupWindow.closed) {
                            popupWindow.close();
                        }
                    } catch (e) {
                        console.error('Error al cerrar ventana:', e);
                    }
                }
            };
            
            // Añadir listener para mensajes
            window.addEventListener('message', messageListener);
            
        } catch (error) {
            console.error('Error al generar el PDF:', error);
            hideLoadingMessage();
            showErrorMessage('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    }

    // Funciones para mostrar mensajes
    function showLoadingMessage(message) {
        // Crear un elemento para el mensaje de carga si no existe
        let loadingDiv = document.getElementById('loading-message');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-message';
            loadingDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 9999;
                text-align: center;
            `;
            document.body.appendChild(loadingDiv);
        }
        loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <div class="mt-2">${message}</div>
        `;
        loadingDiv.style.display = 'block';
    }

    function hideLoadingMessage() {
        const loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    function showErrorMessage(message) {
        // Crear toast para mostrar el error
        const toastDiv = document.createElement('div');
        toastDiv.className = 'toast align-items-center text-white bg-danger border-0';
        toastDiv.setAttribute('role', 'alert');
        toastDiv.setAttribute('aria-live', 'assertive');
        toastDiv.setAttribute('aria-atomic', 'true');
        toastDiv.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Añadir el toast al contenedor
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        toastContainer.appendChild(toastDiv);
        
        // Mostrar el toast
        const toast = new bootstrap.Toast(toastDiv);
        toast.show();
        
        // Eliminar el toast después de ocultarse
        toastDiv.addEventListener('hidden.bs.toast', function () {
            toastDiv.remove();
        });
    }

    function showSuccessMessage(message) {
        // Crear toast para mostrar el éxito
        const toastDiv = document.createElement('div');
        toastDiv.className = 'toast align-items-center text-white bg-success border-0';
        toastDiv.setAttribute('role', 'alert');
        toastDiv.setAttribute('aria-live', 'assertive');
        toastDiv.setAttribute('aria-atomic', 'true');
        toastDiv.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Añadir el toast al contenedor
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        toastContainer.appendChild(toastDiv);
        
        // Mostrar el toast
        const toast = new bootstrap.Toast(toastDiv);
        toast.show();
        
        // Eliminar el toast después de ocultarse
        toastDiv.addEventListener('hidden.bs.toast', function () {
            toastDiv.remove();
        });
    }

    function validateForm() {
        // Validar campos obligatorios
        const requiredFields = ['nombre', 'email', 'telefono'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });

        // Validar email
        const email = document.getElementById('email');
        if (email.value.trim() && !validateEmail(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        }

        // Validar teléfono
        const telefono = document.getElementById('telefono');
        if (telefono.value.trim() && !validatePhone(telefono.value)) {
            telefono.classList.add('is-invalid');
            isValid = false;
        }

        // Validar URLs opcionales
        const linkedin = document.getElementById('linkedin');
        if (linkedin.value.trim() && !validateUrl(linkedin.value)) {
            linkedin.classList.add('is-invalid');
            isValid = false;
        }

        const sitioWeb = document.getElementById('sitio_web');
        if (sitioWeb.value.trim() && !validateUrl(sitioWeb.value)) {
            sitioWeb.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            showErrorMessage('Por favor, corrige los campos marcados en rojo.');
        }

        return isValid;
    }

    // ...existing code...

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

    // Eventos de envío del formulario
    document.getElementById('generate-cv').addEventListener('click', function() {
        generatePdf();
    });

    // Inicializar vista previa
    updatePreview();
});