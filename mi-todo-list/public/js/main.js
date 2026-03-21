// --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
// Referenciamos los elementos del HTML mediante sus IDs para manipular la interfaz.
const taskInput = document.getElementById('taskInput')
const taskList = document.getElementById('taskList')
const deleteBtn = document.getElementById('deleteBtn')
const selectAll = document.getElementById('selectAll');
const selectAllContainer = document.getElementById('select-all-container');

// --- 2. ESTADO INICIAL DE LA APLICACIÓN ---
// Sincronizamos el array de tareas con el almacenamiento local (LocalStorage).
// Si no hay datos previos, inicializamos con un array vacío [].
let task = JSON.parse(localStorage.getItem('myTask')) || [];
renderTask();

// --- 3. REGISTRO DEL EVENTO PARA NUEVAS TAREAS ---
// Registramos el evento de teclado 'keypress' en el input. 
// Al detectar la tecla 'Enter', procesamos el texto y lo añadimos al estado.
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim() !== "") {
        task.push({ text: taskInput.value, completed: false })
        saveAndRender();
        taskInput.value = "";
    }
});

// --- 4. FUNCIÓN DE RENDERIZADO DINÁMICO ---
// Esta función se encarga de transformar los datos lógicos en elementos visuales (HTML).
function renderTask() {
    taskList.innerHTML = task.map((t, index) => `
        <div class="task-box">
            <input type="checkbox" class="task-check" data-index="${index}">
            <span class="task-text">${t.text}</span>
        </div>
    `).join('');
    
    if (selectAllContainer) {
        selectAllContainer.classList.toggle('hidden', task.length === 0);
        selectAll.checked = false;
    }

    
    if (deleteBtn) {
        deleteBtn.classList.toggle('hidden', task.length === 0);
    }

}

// --- 5. REGISTRO DE LA LÓGICA DE BORRADO ---
// Registramos el evento 'click' para gestionar la eliminación masiva de tareas.
// Filtramos el array basándonos en los checkboxes seleccionados por el usuario.
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
        
        const checks = document.querySelectorAll('.task-check:checked');
        const indicesToRemove = Array.from(checks).map(c => parseInt(c.dataset.index));
        
        task = task.filter((_, i) => !indicesToRemove.includes(i));
        saveAndRender(); 
    });

}

// --- 6. PERSISTENCIA DE DATOS ---
// Gestionamos el guardado de la información en el disco local y actualizamos la UI.
function saveAndRender() {
    localStorage.setItem('myTask', JSON.stringify(task));
    renderTask();
}

// --- 7. REGISTRO DEL CONTROLADOR MAESTRO ---
// Registramos el evento 'change' para sincronizar el estado de selección global
// con todos los elementos individuales de la lista.
if (selectAll) {
    selectAll.addEventListener('change', () => {
        const checkBoxes = document.querySelectorAll('.task-check');
        checkBoxes.forEach(cb => {
            cb.checked = selectAll.checked;
        });
    })
}
