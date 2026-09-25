// Sabitler ve Durum Yönetimi
const STORAGE_KEY = "hedefim_todo_tasks";

let tasks = [];
let editingTaskId = null;
let currentFilter = "all"; // "all" | "active" | "completed"

// DOM Elemanları
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const inputError = document.getElementById("input-error");
const inputErrorText = document.getElementById("input-error-text");
const clearAllBtn = document.getElementById("clear-all-btn");

// İstatistik ve Sayaç Elemanları
const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");
const progressBarFill = document.getElementById("progress-bar-fill");

const countAll = document.getElementById("count-all");
const countActive = document.getElementById("count-active");
const countCompleted = document.getElementById("count-completed");

const filterButtons = document.querySelectorAll(".filter-btn");

// LocalStorage İşlemleri
function loadTasksFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        tasks = parsed;
      }
    }
  } catch (err) {
    console.error("LocalStorage verisi okunurken hata oluştu:", err);
    tasks = [];
  }
}

function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("LocalStorage verisi kaydedilirken hata oluştu:", err);
  }
}

// Görev ekleme fonksiyonu
function addTask(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    showError("Lütfen bir görev veya hedef yazın.");
    return;
  }

  hideError();

  const newTask = {
    id: Date.now().toString(),
    text: trimmedText,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  taskInput.value = "";
  
  saveTasksToStorage();
  updateUI();
}

// Görev tamamlanma durumunu değiştirme
function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasksToStorage();
  updateUI();
}

// Düzenleme modunu başlatma
function startEdit(id) {
  editingTaskId = id;
  renderTasks();

  const editInput = document.getElementById(`edit-input-${id}`);
  if (editInput) {
    editInput.focus();
    editInput.select();
  }
}

// Düzenlemeyi kaydetme
function saveEdit(id, newText) {
  const trimmed = newText.trim();
  const editInput = document.getElementById(`edit-input-${id}`);

  if (!trimmed) {
    if (editInput) {
      editInput.classList.add("has-error");
      editInput.placeholder = "Görev metni boş bırakılamaz...";
      editInput.focus();
    }
    return;
  }

  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, text: trimmed };
    }
    return task;
  });

  editingTaskId = null;
  saveTasksToStorage();
  updateUI();
}

// Düzenlemeyi iptal etme
function cancelEdit() {
  editingTaskId = null;
  renderTasks();
}

// Tekil görev silme fonksiyonu
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  if (editingTaskId === id) {
    editingTaskId = null;
  }

  saveTasksToStorage();
  updateUI();
}

// Tüm görevleri temizleme
function clearAllTasks() {
  if (tasks.length === 0) return;

  const confirmed = window.confirm("Listedeki tüm görevleri silmek istediğinize emin misiniz?");
  if (confirmed) {
    tasks = [];
    editingTaskId = null;
    saveTasksToStorage();
    updateUI();
  }
}

// Filtre değiştirme
function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((btn) => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  renderTasks();
}

// Hata mesajı gösterme
function showError(message) {
  if (!inputError) return;
  inputErrorText.textContent = message;
  inputError.classList.add("active");
  taskInput.classList.add("has-error");
  taskInput.focus();
}

// Hata mesajını gizleme
function hideError() {
  if (!inputError) return;
  inputErrorText.textContent = "";
  inputError.classList.remove("active");
  taskInput.classList.remove("has-error");
}

// İstatistikleri ve Sayaçları Güncelleme
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  if (statTotal) statTotal.textContent = total;
  if (statCompleted) statCompleted.textContent = completed;
  if (statPending) statPending.textContent = pending;

  if (countAll) countAll.textContent = total;
  if (countActive) countActive.textContent = pending;
  if (countCompleted) countCompleted.textContent = completed;

  if (clearAllBtn) {
    clearAllBtn.disabled = total === 0;
  }

  if (progressBarFill) {
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressBarFill.style.width = `${percentage}%`;
  }
}

// Görev listesini DOM'a render etme
function renderTasks() {
  taskList.innerHTML = "";

  // Filtreye göre görevleri ayıkla
  let filteredTasks = tasks;
  if (currentFilter === "active") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  // Boş durum kontrolü
  if (filteredTasks.length === 0) {
    const emptyEl = document.createElement("li");
    emptyEl.className = "empty-state";

    let emptyMessage = "Henüz eklenmiş bir görev bulunmuyor.";
    if (currentFilter === "active" && tasks.length > 0) {
      emptyMessage = "Aktif görev bulunmuyor. Tüm görevlerinizi tamamladınız.";
    } else if (currentFilter === "completed" && tasks.length > 0) {
      emptyMessage = "Henüz tamamlanmış bir görev bulunmuyor.";
    }

    emptyEl.innerHTML = `
      <div class="empty-state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p class="empty-state-text">${emptyMessage}</p>
    `;
    taskList.appendChild(emptyEl);
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.dataset.id = task.id;

    if (editingTaskId === task.id) {
      // Satır içi düzenleme formu
      const editWrap = document.createElement("div");
      editWrap.className = "task-edit-wrap";

      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.id = `edit-input-${task.id}`;
      editInput.className = "task-edit-input";
      editInput.value = task.text;
      editInput.maxLength = 200;

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "btn-icon btn-save";
      saveBtn.title = "Kaydet (Enter)";
      saveBtn.setAttribute("aria-label", "Kaydet");
      saveBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn-icon btn-cancel";
      cancelBtn.title = "İptal (Esc)";
      cancelBtn.setAttribute("aria-label", "İptal");
      cancelBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;

      saveBtn.addEventListener("click", () => saveEdit(task.id, editInput.value));
      cancelBtn.addEventListener("click", () => cancelEdit());

      editInput.addEventListener("input", () => {
        editInput.classList.remove("has-error");
      });

      editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveEdit(task.id, editInput.value);
        } else if (e.key === "Escape") {
          cancelEdit();
        }
      });

      editWrap.appendChild(editInput);
      editWrap.appendChild(saveBtn);
      editWrap.appendChild(cancelBtn);
      li.appendChild(editWrap);
    } else {
      // Checkbox
      const label = document.createElement("label");
      label.className = "task-checkbox-label";
      label.setAttribute("aria-label", `${task.text} görevini tamamlandı olarak işaretle`);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox-input";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const customBox = document.createElement("span");
      customBox.className = "custom-checkbox";
      customBox.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      label.appendChild(checkbox);
      label.appendChild(customBox);

      // Görev Metni
      const content = document.createElement("span");
      content.className = "task-content";
      content.textContent = task.text;

      // Aksiyon Butonları
      const actions = document.createElement("div");
      actions.className = "task-actions";

      // Düzenle Butonu
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-icon btn-edit";
      editBtn.title = "Görevi Düzenle";
      editBtn.setAttribute("aria-label", "Düzenle");
      editBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
      `;
      editBtn.addEventListener("click", () => startEdit(task.id));

      // Sil Butonu
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn-icon btn-delete";
      deleteBtn.title = "Görevi Sil";
      deleteBtn.setAttribute("aria-label", "Sil");
      deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(label);
      li.appendChild(content);
      li.appendChild(actions);
    }

    taskList.appendChild(li);
  });
}

// UI Genel Güncellemesi
function updateUI() {
  updateStats();
  renderTasks();
}

// Olay Dinleyicileri
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(taskInput.value);
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    addTask(taskInput.value);
  }
});

taskInput.addEventListener("input", () => {
  if (inputError.classList.contains("active")) {
    hideError();
  }
});

if (clearAllBtn) {
  clearAllBtn.addEventListener("click", clearAllTasks);
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setFilter(btn.dataset.filter);
  });
});

// Başlangıç: Verileri yükle ve arayüzü çiz
loadTasksFromStorage();
updateUI();
