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

// Ponemos la fecha de hoy por defecto en el input al abrir la página
const hoy = new Date();
const hoyISO = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
taskDate.value = hoyISO;
let currentFilter = hoyISO; // Empezamos viendo las tareas de hoy

// --- 3. LÓGICA DE AGREGAR TAREAS ---
function handleAddTask() {
    if (taskInput.value.trim() !== "" && taskDate.value !== "") {
        tasks.push({
            id: Date.now().toString(),
            text: taskInput.value.trim(),
            date: taskDate.value,
            time: taskTime.value || null,
            completed: false,
            priority: 'white'
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

    // Ordenar: primero las que no tienen hora, luego por hora
    filtered.sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return -1;
        if (!b.time) return 1;
        return a.time.localeCompare(b.time);
    });

    if (selectAllContainer) {
        selectAllContainer.classList.toggle('hidden', filtered.length === 0);
        selectAll.checked = false;
    }

    taskList.innerHTML = filtered.map((t) => `
        <div class="task-box priority-${t.priority}">
            <div class="task-main-info">
                <input type="checkbox" class="task-check" data-id="${t.id}" ${t.completed ? 'checked' : ''}>
                <div class="task-info">
                    <span class="task-text">${t.text}</span>
                    <div class="task-meta">
                        ${t.time ? `<small>⏰ ${t.time} hs</small>` : ''} 
                    </div>
                </div>
            </div>
            
            <div class="priority-btns">
                <div class="p-btn white-p" onclick="cambiarPrioridad('${t.id}', 'white')"></div>
                <div class="p-btn orange-p" onclick="cambiarPrioridad('${t.id}', 'orange')"></div>
                <div class="p-btn red-p" onclick="cambiarPrioridad('${t.id}', 'red')"></div>
            </div>
        </div>
    `).join('');

    deleteBtn.classList.toggle('hidden', filtered.length === 0);
    renderCarousel();
}

// --- 5. FUNCIONES DE ACCIÓN ---
window.cambiarPrioridad = function (id, nuevoColor) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
        tasks[index].priority = nuevoColor;
        saveAndRender();
    }
};

function saveAndRender() {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
}

// --- 6. CARRUSEL ---
function renderCarousel() {
    const carousel = document.getElementById('calendar-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';

    for (let i = -5; i < 25; i++) {
        let date = new Date();
        date.setDate(hoy.getDate() + i);
        const y = date.getFullYear(), m = (date.getMonth() + 1).toString().padStart(2, '0'), d = date.getDate().toString().padStart(2, '0');
        const dateISO = `${y}-${m}-${d}`;
        const dayMonthStr = `${d}/${m}`;
        const hasTask = tasks.some(t => t.date === dateISO);
        const isToday = dateISO === hoyISO;

        const card = document.createElement('div');
        card.className = `day-card ${hasTask ? 'has-task' : ''} ${currentFilter === dateISO ? 'selected' : ''}`;
        if (isToday) card.id = "today-card";
        if (currentFilter === dateISO) card.id = "active-card";

        card.innerHTML = `
            ${isToday ? '<span class="today-label">(Hoy)</span>' : ''}
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
    const target = document.getElementById('active-card') || document.getElementById('today-card');
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// --- 7. EVENTOS DE UTILIDAD ---
deleteBtn.addEventListener('click', () => {
    const checks = document.querySelectorAll('.task-check:checked');
    const idsToRemove = Array.from(checks).map(c => c.dataset.id);
    tasks = tasks.filter(t => !idsToRemove.includes(t.id));
    saveAndRender();
});

selectAll?.addEventListener('change', () => {
    document.querySelectorAll('.task-check').forEach(cb => cb.checked = selectAll.checked);
});

window.scrollCarousel = (dir) => {
    document.getElementById('calendar-carousel').scrollBy({ left: dir * 120, behavior: 'smooth' });
};

// --- INICIO ---
renderTasks();
setTimeout(scrollToActive, 500);
