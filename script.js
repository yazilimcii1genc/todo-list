// Görev listesi durumu
let tasks = [];

// DOM Elemanları
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const inputError = document.getElementById("input-error");

// Görev ekleme fonksiyonu
function addTask(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    showError("Lütfen boş bir görev bırakmayın.");
    return;
  }

  hideError();

  const newTask = {
    id: Date.now().toString(),
    text: trimmedText,
    completed: false
  };

  tasks.push(newTask);
  taskInput.value = "";
  renderTasks();
}

// Hata mesajı gösterme
function showError(message) {
  if (!inputError) return;
  inputError.textContent = message;
  inputError.classList.add("active");
  taskInput.focus();
}

// Hata mesajını gizleme
function hideError() {
  if (!inputError) return;
  inputError.textContent = "";
  inputError.classList.remove("active");
}

// Görevleri ekrana basma
function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const emptyEl = document.createElement("li");
    emptyEl.className = "empty-state";
    emptyEl.innerHTML = `
      <div class="empty-state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p class="empty-state-text">Henüz eklenmiş bir görev bulunmuyor.</p>
    `;
    taskList.appendChild(emptyEl);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;

    const content = document.createElement("span");
    content.className = "task-content";
    content.textContent = task.text;

    li.appendChild(content);
    taskList.appendChild(li);
  });
}

// Olay Dinleyicileri
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(taskInput.value);
});

taskInput.addEventListener("input", () => {
  if (inputError.classList.contains("active")) {
    hideError();
  }
});

// İlk çalıştırma
renderTasks();
