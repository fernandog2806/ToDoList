/* --- CONFIGURACIÓN E INTERFAZ: Referencias a los elementos del DOM --- */
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime');
const taskList = document.getElementById('taskList');
const deleteBtn = document.getElementById('deleteBtn');
const selectAll = document.getElementById('selectAll');
const selectAllContainer = document.getElementById('select-all-container');
const addBtn = document.getElementById('addBtn');
const taskPriority = document.getElementById('taskPriority');

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
let currentFilter = hoyISO;

/* --- CONTROLADOR DE TAREAS: Lógica para añadir y procesar nuevas actividades --- */
function handleAddTask() {
    const prioridadElegida = taskPriority.value;

    if (taskInput.value.trim() !== "" && taskDate.value !== "") {
        tasks.push({
            id: Date.now().toString(),
            text: taskInput.value.trim(),
            date: taskDate.value,
            time: taskTime.value || null,
            completed: false,
            priority: prioridadElegida
        });

        saveAndRender();

        taskInput.value = "";
        taskTime.value = "";
    } else if (taskDate.value === "") {
        alert("¡Primero elige una fecha!");
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
        selectAll.checked = filtered.length > 0 && filtered.every(t => t.completed);
    }

    // Si no hay tareas para el día seleccionado, mostramos un mensaje informativo
    if (filtered.length === 0) {
        taskList.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 20px; font-size: 14px;">✨ No hay tareas agendadas para este día.</p>`;
    } else {
        taskList.innerHTML = filtered.map((t) => `
            <div class="task-box priority-${t.priority}">
                <div class="task-main-info">
                    <input type="checkbox" class="task-check"
                        data-id="${t.id}" 
                        ${t.completed ? 'checked' : ''} 
                        onchange="toggleCheck('${t.id}')">
                    <div class="task-info">
                        <span class="task-text ${t.completed ? 'completed' : ''}">${t.text}</span>
                        <div class="task-meta">
                            ${t.time ? `<small>⏰ ${t.time} hs</small>` : ''} 
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    deleteBtn.classList.toggle('hidden', filtered.length === 0);
    renderCarousel();
}

/* --- PERSISTENCIA Y SINCRONIZACIÓN: Manejo de LocalStorage y estados de completado --- */
window.toggleCheck = function (id) {
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
    radio.addEventListener('click', () => {
        const nuevaPrioridad = radio.value;
        
        // Filtra tareas completadas del día que estás viendo
        const marcadas = tasks.filter(t => t.completed && t.date === currentFilter);

        if (marcadas.length > 0) {
            marcadas.forEach(t => t.priority = nuevaPrioridad);
            saveAndRender();
        }
    });
});

// Seleccionar todos (afecta solo al día que estás viendo)
selectAll?.addEventListener('change', () => {
    const isChecked = selectAll.checked;
    tasks.forEach(t => {
        if (t.date === currentFilter) {
            t.completed = isChecked;
        }
    });
    saveAndRender();
});

deleteBtn?.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveAndRender();
});

window.scrollCarousel = (direction) => {
    document.getElementById('calendar-carousel').scrollBy({ left: direction * 120, behavior: 'smooth' });
};

/* --- ARRANQUE DE LA APLICACIÓN --- */
renderTasks();
setTimeout(scrollToActive, 500);
