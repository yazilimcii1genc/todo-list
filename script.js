// Görev listesi durumu
let tasks = [];
let editingTaskId = null;

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

// Görev tamamlanma durumunu değiştirme
function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  renderTasks();
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
  if (!trimmed) {
    return;
  }

  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, text: trimmed };
    }
    return task;
  });

  editingTaskId = null;
  renderTasks();
}

// Düzenlemeyi iptal etme
function cancelEdit() {
  editingTaskId = null;
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
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.dataset.id = task.id;

    if (editingTaskId === task.id) {
      // Düzenleme durumu
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
      saveBtn.title = "Kaydet";
      saveBtn.setAttribute("aria-label", "Kaydet");
      saveBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn-icon btn-cancel";
      cancelBtn.title = "İptal";
      cancelBtn.setAttribute("aria-label", "İptal");
      cancelBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;

      saveBtn.addEventListener("click", () => saveEdit(task.id, editInput.value));
      cancelBtn.addEventListener("click", () => cancelEdit());

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
      // Normal görünüm: Checkbox
      const label = document.createElement("label");
      label.className = "task-checkbox-label";
      label.setAttribute("aria-label", `${task.text} görevini tamamla`);

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

      // Metin
      const content = document.createElement("span");
      content.className = "task-content";
      content.textContent = task.text;

      // İşlem butonları
      const actions = document.createElement("div");
      actions.className = "task-actions";

      // Düzenle butonu
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

      actions.appendChild(editBtn);

      li.appendChild(label);
      li.appendChild(content);
      li.appendChild(actions);
    }

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
