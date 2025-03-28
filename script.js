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
    updateProgress();
    updateStreak();
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
        updateProgress();
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
        updateProgress();
        updateStreak();
    }
}

// Function to delete a todo
function deleteTodo(id) {
    const todos = getTodos();
    const newTodos = todos.filter(todo => todo.id !== parseInt(id));
    saveTodos(newTodos);
    loadTodos();
    updateProgress();
    updateStreak();
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
document.querySelector('.search-input').addEventListener('input', filterTodos);
document.querySelector('.filter-priority').addEventListener('change', filterTodos);
document.querySelector('.filter-category').addEventListener('change', filterTodos);

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

// Function to update progress
function updateProgress() {
    const todos = getTodos();
    const todayTodos = todos.filter(todo => {
        const todoDate = todo.dueDate ? new Date(todo.dueDate).toDateString() : new Date().toDateString();
        return todoDate === new Date().toDateString();
    });

    if (todayTodos.length === 0) {
        document.getElementById('todayProgress').style.width = '0%';
        document.getElementById('todayProgressText').textContent = 'No tasks for today';
        return;
    }

    const completedCount = todayTodos.filter(todo => todo.completed).length;
    const percentage = Math.round((completedCount / todayTodos.length) * 100);
    
    document.getElementById('todayProgress').style.width = percentage + '%';
    document.getElementById('todayProgressText').textContent = `${percentage}% Complete`;
}

// Function to update streak
function updateStreak() {
    let streak = parseInt(localStorage.getItem('streak') || '0');
    const lastComplete = localStorage.getItem('lastComplete');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const todos = getTodos();
    const todayTodos = todos.filter(todo => {
        const todoDate = todo.dueDate ? new Date(todo.dueDate).toDateString() : today;
        return todoDate === today;
    });

    const allTodayComplete = todayTodos.length > 0 && todayTodos.every(todo => todo.completed);

    if (allTodayComplete) {
        if (lastComplete === yesterday) {
            streak++;
        } else if (lastComplete !== today) {
            streak = 1;
        }
        localStorage.setItem('lastComplete', today);
    } else if (lastComplete !== today && lastComplete !== yesterday) {
        streak = 0;
    }

    localStorage.setItem('streak', streak.toString());
    document.getElementById('currentStreak').textContent = streak;
}

// Update the original functions to include progress tracking
const originalAddTodo = addTodo;
window.addTodo = function() {
    originalAddTodo.apply(this, arguments);
    updateProgress();
};

const originalToggleTodo = toggleTodo;
window.toggleTodo = function() {
    originalToggleTodo.apply(this, arguments);
    updateProgress();
    updateStreak();
};

const originalDeleteTodo = deleteTodo;
window.deleteTodo = function() {
    originalDeleteTodo.apply(this, arguments);
    updateProgress();
    updateStreak();
}; 