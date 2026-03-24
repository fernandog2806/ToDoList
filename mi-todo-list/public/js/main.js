// --- 1. ELEMENTOS DEL DOM ---
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime');
const taskList = document.getElementById('taskList');
const deleteBtn = document.getElementById('deleteBtn');
const selectAll = document.getElementById('selectAll');
const selectAllContainer = document.getElementById('select-all-container');
const showAllBtn = document.getElementById('showAllBtn');
const addBtn = document.getElementById('addBtn');

// --- 2. ESTADO INICIAL ---
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let currentFilter = "";

// --- 3. LÓGICA DE AGREGAR TAREAS ---
function handleAddTask() {
    if (taskInput.value.trim() !== "" && taskDate.value !== "") {
        tasks.push({
            id: Date.now().toString(),
            text: taskInput.value.trim(),
            date: taskDate.value,
            time: taskTime.value || null,
            completed: false
        });
        saveAndRender();
        taskInput.value = "";
        taskTime.value = "";
    } else if (taskDate.value === "") {
        alert("¡Primero elige una fecha!");
    }
}

if (addBtn) addBtn.addEventListener('click', handleAddTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddTask();
});

// --- 4. RENDERIZADO DE TAREAS ---
function renderTasks() {
    const filtered = currentFilter ? tasks.filter(t => t.date === currentFilter) : tasks;
    if (selectAllContainer) {
        selectAllContainer.classList.toggle('hidden', filtered.length === 0);
        selectAll.checked = false;
    }
    taskList.innerHTML = filtered.map((t) => `
        <div class="task-box">
            <input type="checkbox" class="task-check" data-id="${t.id}">
            <div class="task-info">
                <span class="task-text">${t.text}</span>
                <div class="task-meta">
                    ${t.time ? `<small>⏰ ${t.time} hs</small>` : ''} 
                </div>
            </div>
        </div>
    `).join('');
    deleteBtn.classList.toggle('hidden', filtered.length === 0);
    renderCarousel();
}

// --- 5. RENDERIZADO DEL CARRUSEL (CON AUTO-SCROLL AL CENTRO) ---
function renderCarousel() {
    const carousel = document.getElementById('calendar-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';

    const now = new Date();
    const todayISO = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    for (let i = -5; i < 25; i++) {
        let date = new Date();
        date.setDate(now.getDate() + i);
        const y = date.getFullYear(), m = (date.getMonth() + 1).toString().padStart(2, '0'), d = date.getDate().toString().padStart(2, '0');
        const dateISO = `${y}-${m}-${d}`;
        const dayMonthStr = `${d}/${m}`;
        const hasTask = tasks.some(t => t.date === dateISO);
        const isToday = dateISO === todayISO;

        const card = document.createElement('div');
        card.className = `day-card ${hasTask ? 'has-task' : ''} ${currentFilter === dateISO ? 'selected' : ''}`;

        // ASIGNACIÓN DE IDS PARA EL SCROLL
        if (isToday) card.id = "today-card";
        if (currentFilter === dateISO) card.id = "active-card";

        card.innerHTML = `
            ${isToday ? '<span class="today-label">(Hoy)</span>' : ''}
            <span class="day-number">${dayMonthStr}</span>
        `;

        card.onclick = () => {
            currentFilter = dateISO;
            saveAndRender();
            // Ejecutamos el scroll después de renderizar el cambio
            setTimeout(scrollToActive, 100);
        };
        carousel.appendChild(card);
    }
}

// --- 6. FUNCIÓN DE SCROLL UNIFICADA ---
function scrollToActive() {
    // Intentamos centrar el seleccionado, si no hay (vista "Todas"), centramos "Hoy"
    const target = document.getElementById('active-card') || document.getElementById('today-card');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// --- RESTO DE UTILIDADES ---
deleteBtn.addEventListener('click', () => {
    const checks = document.querySelectorAll('.task-check:checked');
    if (checks.length === 0) return;
    const idsToRemove = Array.from(checks).map(c => c.dataset.id);
    tasks = tasks.filter(t => !idsToRemove.includes(t.id));
    saveAndRender();
});

if (selectAll) {
    selectAll.addEventListener('change', () => {
        document.querySelectorAll('.task-check').forEach(cb => cb.checked = selectAll.checked);
    });
}

window.scrollCarousel = (dir) => {
    document.getElementById('calendar-carousel').scrollBy({ left: dir * 120, behavior: 'smooth' });
};

if (showAllBtn) {
    showAllBtn.onclick = () => {
        currentFilter = "";
        saveAndRender();
        setTimeout(scrollToActive, 100); // Vuelve al centro (Hoy)
    };
}

function saveAndRender() {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
}

// AL CARGAR: Renderiza y centra el día de hoy
renderTasks();
setTimeout(scrollToActive, 500);
