// Get DOM elements
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

// Initialize todos array in localStorage if it doesn't exist
if (!localStorage.getItem('todos')) {
    localStorage.setItem('todos', JSON.stringify([]));
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    updateDate();
    initializeSortable();
});

function updateDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('currentDate').textContent = 
        new Date().toLocaleDateString('en-US', options);
}

// Function to save todos to localStorage
function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Function to render todos
function renderTodos(todos) {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-content">
                <div class="todo-text">${todo.text}</div>
                <div class="todo-meta">
                    ${todo.dueDate ? `<span class="due-date">📅 ${new Date(todo.dueDate).toLocaleDateString()}</span>` : ''}
                    <span class="category">📁 ${todo.category}</span>
                    <span class="priority">🔔 ${todo.priority}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button onclick="editTodo(${todo.id})" class="edit-btn">Edit</button>
                <button onclick="deleteTodo(${todo.id})" class="delete-btn">Delete</button>
            </div>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
        todoList.appendChild(li);
    });
}

// Function to add a new todo
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: document.getElementById('priority').value,
            category: document.getElementById('category').value,
            dueDate: document.getElementById('dueDate').value,
            createdAt: new Date().toISOString()
        };

        const todos = getTodos();
        todos.push(todo);
        saveTodos(todos);
        input.value = '';
        loadTodos();
    }
}

// Function to toggle todo completion
function toggleTodo(id) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === parseInt(id));
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos(todos);
        loadTodos();
    }
}

// Function to delete a todo
function deleteTodo(id) {
    const todos = getTodos();
    const newTodos = todos.filter(todo => todo.id !== parseInt(id));
    saveTodos(newTodos);
    loadTodos();
}

// Function to edit a todo
function editTodo(id) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === parseInt(id));
    if (!todo) return;

    const newText = prompt('Edit task:', todo.text);
    if (newText && newText.trim()) {
        todo.text = newText.trim();
        saveTodos(todos);
        loadTodos();
    }
}

// Function to set todo priority
function setPriority(id, priority) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === parseInt(id));
    if (todo) {
        todo.priority = priority;
        saveTodos(todos);
        loadTodos();
    }
}

// Function to set todo due date
function setDueDate(id, date) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === parseInt(id));
    if (todo) {
        todo.dueDate = date;
        saveTodos(todos);
        loadTodos();
    }
}

// Function to set todo category
function setCategory(id, category) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === parseInt(id));
    if (todo) {
        todo.category = category;
        saveTodos(todos);
        loadTodos();
    }
}

// Function to search todos
function searchTodos(query) {
    const todos = getTodos();
    return todos.filter(todo => 
        todo.text.toLowerCase().includes(query.toLowerCase())
    );
}

// Function to filter todos
function filterTodos() {
    const searchText = document.querySelector('.search-input').value.toLowerCase();
    const priorityFilter = document.querySelector('.filter-priority').value;
    const categoryFilter = document.querySelector('.filter-category').value;
    
    const todos = getTodos();
    const filtered = todos.filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(searchText);
        const matchesPriority = !priorityFilter || todo.priority === priorityFilter;
        const matchesCategory = !categoryFilter || todo.category === categoryFilter;
        return matchesSearch && matchesPriority && matchesCategory;
    });
    
    renderTodos(filtered);
}

// Helper functions

function getTodos() {
    return JSON.parse(localStorage.getItem('todos')) || [];
}

function loadTodos() {
    const todos = getTodos();
    renderTodos(todos);
}

function initializeSortable() {
    new Sortable(document.getElementById('todoList'), {
        animation: 150,
        onEnd: function() {
            const todos = [];
            document.querySelectorAll('.todo-item').forEach(item => {
                const id = parseInt(item.dataset.id);
                const todo = getTodos().find(t => t.id === id);
                if (todo) todos.push(todo);
            });
            saveTodos(todos);
        }
    });
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Add event listener for Enter key
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize search and filters
document.querySelector('.search-bar').addEventListener('input', filterTodos);
document.querySelector('.priority-select').addEventListener('change', filterTodos);
document.querySelector('.category-select').addEventListener('change', filterTodos);

// Add notification functionality
function checkDueDate() {
    const todos = getTodos();
    const today = new Date();
    
    todos.forEach(todo => {
        if (todo.dueDate) {
            const dueDate = new Date(todo.dueDate);
            if (dueDate.toDateString() === today.toDateString()) {
                notifyUser(todo);
            }
        }
    });
}

function notifyUser(todo) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Todo Due Today", {
            body: todo.text,
            icon: "/favicon.ico"
        });
    }
}

// Check for due tasks every hour
setInterval(checkDueDate, 3600000); 
setInterval(checkDueDate, 3600000); 