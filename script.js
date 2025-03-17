// Get DOM elements
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

// Load todos from localStorage or use sample todos if none exist
let todos = JSON.parse(localStorage.getItem('todos')) || [
    { text: "Learn HTML", completed: false },
    { text: "Master CSS", completed: false },
    { text: "Practice JavaScript", completed: false }
];

// Function to save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Function to render todos
function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.onclick = () => toggleTodo(index);
        
        const span = document.createElement('span');
        span.textContent = todo.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTodo(index);
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}

// Function to add a new todo
function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        todos.push({
            text,
            completed: false
        });
        saveTodos();
        renderTodos();
        todoInput.value = '';
    }
}

// Function to toggle todo completion
function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

// Function to delete a todo
function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

// Add event listener for Enter key
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initial render
renderTodos(); 