/* --- CONFIGURACIÓN E INTERFAZ: Referencias a los elementos del DOM --- */
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime');
const taskList = document.getElementById('taskList');
const deleteBtn = document.getElementById('deleteBtn');
const selectAll = document.getElementById('selectAll');
const selectAllContainer = document.getElementById('select-all-container');
const addBtn = document.getElementById('addBtn');
const applyChangesBtn = document.getElementById('applyChangesBtn');
const moveTaskDate = document.getElementById('moveTaskDate');

/* --- ESTADO Y FECHAS: Inicialización de datos y configuración de calendario --- */
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
const hoy = new Date();

const getISODate = (date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const hoyISO = getISODate(hoy);
taskDate.value = hoyISO;
const taskPriority = document.getElementById('taskPriority'); // Mover aquí para asegurar que el DOM esté cargado

// Inicializamos el input de mover como deshabilitado
// La referencia a moveTaskTime debe estar después de que el DOM se haya actualizado
// por eso la obtenemos aquí y no al principio
const moveTaskTime = document.getElementById('moveTaskTime');

if (moveTaskDate) moveTaskDate.disabled = true; // Habilitar/deshabilitar después de obtener la referencia
if (moveTaskTime) moveTaskTime.disabled = true;

let currentFilter = hoyISO;

/* --- CONTROLADOR DE TAREAS: Lógica para añadir y procesar nuevas actividades --- */
function handleAddTask() {
    const prioridadElegida = taskPriority.value;
    const dateVal = taskDate.value;

    // Validamos que la fecha sea completa (10 caracteres: YYYY-MM-DD) y el año sea razonable
    const year = dateVal ? parseInt(dateVal.split('-')[0]) : 0;

    if (taskInput.value.trim() !== "" && dateVal.length === 10 && year >= 2000) {
        tasks.push({
            id: Date.now().toString(),
            text: taskInput.value.trim(),
            date: dateVal,
            time: taskTime.value || null,
            completed: false,
            selected: false,
            priority: prioridadElegida
        });

        saveAndRender();

        taskInput.value = "";
        taskTime.value = "";
    }
}

addBtn?.addEventListener('click', handleAddTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAddTask(); });

/* --- RENDERIZADO DE INTERFAZ: Generación dinámica del listado de tareas --- */
function renderTasks() {
    let filtered = currentFilter ? tasks.filter(t => t.date === currentFilter) : tasks;

    filtered.sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return -1;
        if (!b.time) return 1;
        return a.time.localeCompare(b.time);
    });

    if (selectAllContainer) {
        selectAllContainer.classList.toggle('hidden', filtered.length === 0);
        selectAll.checked = filtered.length > 0 && filtered.every(t => t.selected);
    }

    // Si no hay tareas para el día seleccionado, mostramos un mensaje informativo
    if (filtered.length === 0) {
        taskList.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 20px; font-size: 14px;">✨ No hay tareas agendadas para este día.</p>`;
    } else {
        taskList.innerHTML = filtered.map((t) => `
            <div class="task-box grid-row priority-${t.priority}">
                <div class="col-sel">
                    <input type="checkbox" class="task-check"
                        data-id="${t.id}" 
                        ${t.selected ? 'checked' : ''} 
                        onchange="toggleSelect('${t.id}')">
                </div>
                <div class="col-msg task-info">
                    <span class="task-text ${t.completed ? 'completed' : ''}">${t.text}</span>
                    <div class="task-meta ${t.completed ? 'completed' : ''}">${t.time ? `<small>⏰ ${t.time} hs</small>` : ''}</div>
                </div>
                <div class="col-done">
                    <button class="done-btn ${t.completed ? 'is-completed' : ''}" onclick="toggleDone('${t.id}')">
                        ${t.completed ? '✅' : '✔️'}
                    </button>
                </div>
                <div class="col-edit">
                    <button class="edit-btn" onclick="editTask('${t.id}')">✏️</button>
                </div>
            </div>
        `).join('');
    }

    deleteBtn.classList.toggle('hidden', filtered.length === 0);

    // Habilitar/Deshabilitar el input de "Mover" si hay tareas seleccionadas
    if (moveTaskDate) {
        const tieneTareasSeleccionadas = filtered.some(t => t.selected);
        moveTaskDate.disabled = !tieneTareasSeleccionadas;
    }
    if (moveTaskTime) {
        const tieneTareasSeleccionadas = filtered.some(t => t.selected);
        moveTaskTime.disabled = !tieneTareasSeleccionadas;
    }

    if (applyChangesBtn) {
        const tieneTareasSeleccionadas = filtered.some(t => t.selected);
        applyChangesBtn.disabled = !tieneTareasSeleccionadas;
    }

    renderCarousel();
}

/* --- PERSISTENCIA Y SINCRONIZACIÓN: Manejo de LocalStorage y estados de completado --- */
window.editTask = function (id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nuevoTexto = prompt("Editar descripción:", task.text);
    if (nuevoTexto === null) return; // Si cancela, no sigue

    if (nuevoTexto.trim() !== "") {
        task.text = nuevoTexto.trim();
        saveAndRender();
    }
};

window.toggleSelect = function (id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.selected = !task.selected;
        saveAndRender();
    }
};

window.toggleDone = function (id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveAndRender();
    }
};

function saveAndRender() {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
}

/* --- CALENDARIO DINÁMICO: Generación y navegación del carrusel de fechas --- */
function renderCarousel() {
    const carousel = document.getElementById('calendar-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';

    // Genera un rango de 30 días (5 pasados, 25 futuros)
    for (let i = -5; i < 25; i++) {
        let date = new Date();
        date.setDate(hoy.getDate() + i);

        const dateISO = getISODate(date);
        const dayMonthStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        const hasTask = tasks.some(t => t.date === dateISO);
        const isToday = dateISO === hoyISO;
        const isSelected = currentFilter === dateISO;

        const card = document.createElement('div');

        card.className = `day-card ${hasTask ? 'has-task' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`;

        if (isToday) card.id = "today-card";
        if (isSelected) card.id = "active-card";

        card.innerHTML = `
            ${isToday ? '<span class="today-label">(HOY)</span>' : ''}
            <span class="day-number">${dayMonthStr}</span>
        `;

        card.onclick = () => {
            currentFilter = dateISO;
            saveAndRender();
            setTimeout(scrollToActive, 100);
        };

        carousel.appendChild(card);
    }
}

function scrollToActive() {
    // Centra el calendario en el día activo
    const target = document.getElementById('active-card') || document.getElementById('today-card');
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

/* --- 7. UTILIDADES Y EVENTOS GLOBALES --- */

// "Magia": Al tocar un botón de prioridad, cambia la importancia de las tareas marcadas del día
document.querySelectorAll('input[name="priority"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const nuevaPrioridad = radio.value;
        
        // Ahora afecta a las tareas SELECCIONADAS con el checkbox
        const seleccionadas = tasks.filter(t => t.selected && t.date === currentFilter);

        if (seleccionadas.length > 0) {
            seleccionadas.forEach(t => t.priority = nuevaPrioridad);
            saveAndRender();
        }
    });
});

// Seleccionar todos (afecta solo al día que estás viendo)
selectAll?.addEventListener('change', () => {
    const isChecked = selectAll.checked;
    tasks.forEach(t => {
        if (t.date === currentFilter) {
            t.selected = isChecked;
        }
    });
    saveAndRender();
});

deleteBtn?.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.selected);
    saveAndRender();
});

/* --- REPROGRAMACIÓN: Mover tareas marcadas a otra fecha --- */
function handleMoveTasks() {
    const newDate = moveTaskDate.value;
    if (!newDate) return;

    // Verificamos que la fecha tenga el formato completo YYYY-MM-DD (10 caracteres)
    // y que el año no sea un error de escritura (ej: 0002)
    const year = parseInt(newDate.split('-')[0]);
    if (newDate.length < 10 || year < 2000) {
        return; // No hace nada si el año no es válido o está incompleto
    }

    const tasksToMove = tasks.filter(t => t.selected && t.date === currentFilter);

    if (tasksToMove.length > 0) {
        tasksToMove.forEach(t => {
            t.date = newDate;
            t.selected = false;
        });

        currentFilter = newDate;
        moveTaskDate.value = "";
        saveAndRender();
        setTimeout(scrollToActive, 100);
    }
}

/* --- CAMBIO DE HORA: Modificar hora de tareas marcadas --- */
function handleMoveTime() {
    const newTime = moveTaskTime.value;
    const tasksToMove = tasks.filter(t => t.selected && t.date === currentFilter);

    if (tasksToMove.length > 0) {
        tasksToMove.forEach(t => t.time = newTime || null);
        moveTaskTime.value = "";
        saveAndRender();
    }
}

// Botón unificado para aplicar ambos cambios (ideal para móviles)
applyChangesBtn?.addEventListener('click', () => {
    const newDate = moveTaskDate.value;
    const newTime = moveTaskTime.value;

    // Si no hay nada escrito en ninguno de los dos, no hacemos nada
    if (!newDate && !newTime) return;

    const tasksToMove = tasks.filter(t => t.selected && t.date === currentFilter);

    if (tasksToMove.length > 0) {
        tasksToMove.forEach(t => {
            // Si pusiste fecha, la cambiamos
            if (newDate && newDate.length === 10) {
                t.date = newDate;
            }
            // Si pusiste hora (o la borraste), la cambiamos
            if (newTime !== "") {
                t.time = newTime || null;
            }
            t.selected = false; // Desmarcamos tras mover
        });

        if (newDate) currentFilter = newDate;
        
        moveTaskDate.value = "";
        moveTaskTime.value = "";
        saveAndRender();
        if (newDate) setTimeout(scrollToActive, 100);
    }
});

window.scrollCarousel = (direction) => {
    document.getElementById('calendar-carousel').scrollBy({ left: direction * 120, behavior: 'smooth' });
};


/* --- ARRANQUE DE LA APLICACIÓN --- */
renderTasks();
setTimeout(scrollToActive, 500);
