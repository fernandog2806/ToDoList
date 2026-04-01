// --- 1. ELEMENTOS DEL DOM ---
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime');
const taskList = document.getElementById('taskList');
const deleteBtn = document.getElementById('deleteBtn');
const selectAll = document.getElementById('selectAll');
const selectAllContainer = document.getElementById('select-all-container');
const addBtn = document.getElementById('addBtn');

// --- 2. ESTADO INICIAL ---
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

const hoy = new Date();
const hoyISO = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
taskDate.value = hoyISO;
let currentFilter = hoyISO;

// --- 3. LÓGICA DE AGREGAR TAREAS ---
function handleAddTask() {
    // Lee el color seleccionado arriba para la nueva tarea
    const prioridadElegida = document.querySelector('input[name="priority"]:checked')?.value || 'green';

    if (taskInput.value.trim() !== "" && taskDate.value !== "") {
        tasks.push({
            id: Date.now().toString(),
            text: taskInput.value.trim(),
            date: taskDate.value,
            time: taskTime.value || null,
            completed: false, // Usamos esto para el "Check" de selección
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

// --- 4. RENDERIZADO DE TAREAS ---
function renderTasks() {
    let filtered = currentFilter ? tasks.filter(t => t.date === currentFilter) : tasks;

    // Ordenar por hora
    filtered.sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return -1;
        if (!b.time) return 1;
        return a.time.localeCompare(b.time);
    });

    if (selectAllContainer) {
        selectAllContainer.classList.toggle('hidden', filtered.length === 0);
        // El "Seleccionar todos" se marca solo si todos los visibles están marcados
        selectAll.checked = filtered.length > 0 && filtered.every(t => t.completed);
    }

    // Renderizamos la lista sin los 3 botones internos, ahora se controla desde arriba
    taskList.innerHTML = filtered.map((t) => `
        <div class="task-box priority-${t.priority}">
            <div class="task-main-info">
                <input type="checkbox" class="task-check" 
                    data-id="${t.id}" 
                    ${t.completed ? 'checked' : ''} 
                    onchange="toggleCheck('${t.id}')">
                <div class="task-info">
                    <span class="task-text">${t.text}</span>
                    <div class="task-meta">
                        ${t.time ? `<small>⏰ ${t.time} hs</small>` : ''} 
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    deleteBtn.classList.toggle('hidden', filtered.length === 0);
    renderCarousel();
}

// --- 5. FUNCIONES DE ACCIÓN ---

// Cambiar estado del Checkbox en la memoria
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

// --- 6. CARRUSEL (EDITADO Y COMPLETO) ---
function renderCarousel() {
    const carousel = document.getElementById('calendar-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';

    for (let i = -5; i < 25; i++) {
        let date = new Date();
        date.setDate(hoy.getDate() + i);

        // Formateo de fecha para ID y comparación
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const dateISO = `${y}-${m}-${d}`;
        const dayMonthStr = `${d}/${m}`;

        // Variables de estado
        const hasTask = tasks.some(t => t.date === dateISO);
        const isToday = dateISO === hoyISO;

        const card = document.createElement('div');

        // ASIGNACIÓN DE CLASES (Aquí está la lógica del punto 'today')
        card.className = `day-card 
            ${hasTask ? 'has-task' : ''} 
            ${currentFilter === dateISO ? 'selected' : ''} 
            ${isToday ? 'today' : ''}`.replace(/\s+/g, ' ').trim();

        // IDs para el scroll automático
        if (isToday) card.id = "today-card";
        if (currentFilter === dateISO) card.id = "active-card";

        // Contenido de la tarjeta
        card.innerHTML = `
            ${isToday ? '<span class="today-label">(HOY)</span>' : ''}
            <span class="day-number">${dayMonthStr}</span>
        `;

        // Evento de clic
        card.onclick = () => {
            currentFilter = dateISO;
            saveAndRender();
            setTimeout(scrollToActive, 100);
        };

        carousel.appendChild(card);
    }
}


function scrollToActive() {
    const target = document.getElementById('active-card') || document.getElementById('today-card');
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// --- 7. EVENTOS DE UTILIDAD ---

// MAGIA: Al tocar una pastilla de arriba, pinta todas las tareas marcadas del día
document.querySelectorAll('input[name="priority"]').forEach(radio => {
    radio.addEventListener('click', () => {
        const nuevoColor = radio.value;
        // Filtramos solo las tareas que tienen el check y son del día actual
        const marcadas = tasks.filter(t => t.completed && t.date === currentFilter);

        if (marcadas.length > 0) {
            marcadas.forEach(t => t.priority = nuevoColor);
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

// Borrar solo las seleccionadas
deleteBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completed);
    saveAndRender();
});

window.scrollCarousel = (dir) => {
    document.getElementById('calendar-carousel').scrollBy({ left: dir * 120, behavior: 'smooth' });
};

// --- INICIO ---
renderTasks();
setTimeout(scrollToActive, 500);
