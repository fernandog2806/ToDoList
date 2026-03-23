// --- ELEMENTOS DEL DOM ---
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskTime = document.getElementById('taskTime'); // Nuevo
const taskList = document.getElementById('taskList');
const deleteBtn = document.getElementById('deleteBtn');
const selectAll = document.getElementById('selectAll');
const selectAllContainer = document.getElementById('select-all-container');
const showAllBtn = document.getElementById('showAllBtn');

// --- ESTADO ---
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let currentFilter = ""; 

// --- AL INICIAR ---
renderTasks();

// --- EVENTO: AGREGAR TAREA ---
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim() !== "" && taskDate.value !== "") {
        tasks.push({
            id: Date.now().toString(), // ID como string para evitar errores
            text: taskInput.value.trim(),
            date: taskDate.value,
            time: taskTime.value || null, // Guarda la hora o null si está vacío
            completed: false
        });
        saveAndRender();
        
        // Limpiar inputs
        taskInput.value = "";
        taskTime.value = ""; 
    } else if (e.key === 'Enter' && taskDate.value === "") {
        alert("¡Primero elige una fecha!");
    }
});

// --- FUNCIÓN: RENDERIZAR TAREAS ---
function renderTasks() {
    // Filtrar por fecha si hay un filtro activo
    const filtered = currentFilter ? tasks.filter(t => t.date === currentFilter) : tasks;

    // Control del checkbox maestro
    if (selectAllContainer) {
        selectAllContainer.classList.toggle('hidden', filtered.length === 0);
        selectAll.checked = false;
    }

    // Dibujar lista
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
    renderCarousel(); // Actualiza colores en el carrusel
}

// --- FUNCIÓN: RENDERIZAR CARRUSEL (Día/Mes) ---
function renderCarousel() {
    const carousel = document.getElementById('calendar-carousel');
    if (!carousel) return;
    carousel.innerHTML = '';
    const today = new Date();

    for (let i = -5; i < 25; i++) {
        let date = new Date();
        date.setDate(today.getDate() + i);
        
        const dateISO = date.toISOString().split('T')[0];
        const dayNum = date.getDate();
        const monthNum = date.getMonth() + 1;
        
        // Formato 00/00
        const dayMonthStr = `${dayNum < 10 ? '0' + dayNum : dayNum}/${monthNum < 10 ? '0' + monthNum : monthNum}`;

        const hasTask = tasks.some(t => t.date === dateISO);

        const card = document.createElement('div');
        card.className = `day-card ${hasTask ? 'has-task' : ''} ${currentFilter === dateISO ? 'selected' : ''}`;
        card.innerHTML = `<span class="day-number">${dayMonthStr}</span>`;
        
        card.onclick = () => {
            currentFilter = dateISO;
            saveAndRender();
        };
        carousel.appendChild(card);
    }
}

// --- LÓGICA DE BORRADO ---
deleteBtn.addEventListener('click', () => {
    const checks = document.querySelectorAll('.task-check:checked');
    if (checks.length === 0) return;

    const idsToRemove = Array.from(checks).map(c => c.dataset.id);
    tasks = tasks.filter(t => !idsToRemove.includes(t.id));

    saveAndRender();
});

// --- SELECCIONAR TODO ---
if (selectAll) {
    selectAll.addEventListener('change', () => {
        document.querySelectorAll('.task-check').forEach(cb => cb.checked = selectAll.checked);
    });
}

// --- UTILIDADES ---
window.scrollCarousel = (dir) => {
    document.getElementById('calendar-carousel').scrollBy({ left: dir * 120, behavior: 'smooth' });
};

showAllBtn.onclick = () => {
    currentFilter = "";
    saveAndRender();
};

function saveAndRender() {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
}
