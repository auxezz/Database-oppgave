// ============================================
// TODO MANAGER - MAIN APPLICATION
// ============================================
// This file handles all frontend logic including:
// - API communication
// - DOM manipulation
// - Event handling
// - UI updates

// ============================================
// GLOBAL STATE
// ============================================
let currentFilter = 'all'; // Current filter: all, active, completed
let currentSort = 'default'; // Current sort: default, priority, dueDate, created
let allTasks = []; // Store all tasks
let taskToDelete = null; // Track task to be deleted

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch all tasks from the API
 * @param {string} filter - Filter parameter (optional)
 * @returns {Promise<Array>} Array of tasks
 */
async function fetchTasks(filter = '') {
    try {
        let url = '/api/tasks';

        // Add filter query parameter if specified
        if (filter === 'active') {
            url += '?completed=0';
        } else if (filter === 'completed') {
            url += '?completed=1';
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch tasks');
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showToast('Feil ved lasting av oppgaver', 'error');
        return [];
    }
}

/**
 * Create a new task
 * @param {Object} taskData - Task data object
 * @returns {Promise<Object>} Created task
 */
async function createTask(taskData) {
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to create task');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}

/**
 * Update an existing task
 * @param {number} id - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task
 */
async function updateTask(id, taskData) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });

        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to update task');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

/**
 * Toggle task completion status
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Updated task
 */
async function toggleTaskCompletion(id) {
    try {
        const response = await fetch(`/api/tasks/${id}/toggle`, {
            method: 'PATCH'
        });

        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to toggle task');
        }
    } catch (error) {
        console.error('Error toggling task:', error);
        throw error;
    }
}

/**
 * Delete a task
 * @param {number} id - Task ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            return true;
        } else {
            throw new Error(data.message || 'Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

/**
 * Fetch task statistics
 * @returns {Promise<Object>} Statistics object
 */
async function fetchStats() {
    try {
        const response = await fetch('/api/tasks/stats');
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.error || 'Failed to fetch stats');
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

/**
 * Search tasks by keyword
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching tasks
 */
async function searchTasks(searchTerm) {
    try {
        const response = await fetch(`/api/tasks?search=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.error || 'Failed to search tasks');
        }
    } catch (error) {
        console.error('Error searching tasks:', error);
        return [];
    }
}

// ============================================
// UI RENDERING FUNCTIONS
// ============================================

/**
 * Render all tasks to the DOM
 * @param {Array} tasks - Array of task objects
 */
function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');

    // Hide loading state
    loadingState.style.display = 'none';

    // Show empty state if no tasks
    if (tasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    // Hide empty state and render tasks
    emptyState.style.display = 'none';
    taskList.innerHTML = tasks.map(task => createTaskHTML(task)).join('');

    // Add event listeners to all task elements
    attachTaskEventListeners();
}

/**
 * Create HTML for a single task card
 * @param {Object} task - Task object
 * @returns {string} HTML string
 */
function createTaskHTML(task) {
    const isCompleted = task.completed === 1;
    const completedClass = isCompleted ? 'completed' : '';

    // Format due date
    const dueDateHTML = task.due_date
        ? `<span class="badge badge-date ${isOverdue(task.due_date, isCompleted) ? 'overdue' : ''}">
             📅 ${formatDate(task.due_date)}
           </span>`
        : '';

    // Description with max length
    const description = task.description
        ? `<p class="task-description">${escapeHTML(task.description)}</p>`
        : '';

    return `
        <div class="task-card ${completedClass}" data-task-id="${task.id}" data-priority="${task.priority}">
            <div class="task-header">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${isCompleted ? 'checked' : ''}
                    onchange="handleToggleComplete(${task.id})"
                >
                <div class="task-content">
                    <h3 class="task-title">${escapeHTML(task.title)}</h3>
                    ${description}
                    <div class="task-meta">
                        <span class="badge badge-category">📂 ${escapeHTML(task.category)}</span>
                        <span class="badge badge-priority badge-priority-${task.priority.toLowerCase()}">
                            ${getPriorityIcon(task.priority)} ${task.priority}
                        </span>
                        ${dueDateHTML}
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="handleEditTask(${task.id})">
                    ✏️ Rediger
                </button>
                <button class="btn-delete" onclick="handleDeleteTask(${task.id})">
                    🗑️ Slett
                </button>
            </div>
        </div>
    `;
}

/**
 * Update statistics display in header
 * @param {Object} stats - Statistics object
 */
function updateStats(stats) {
    if (!stats) return;

    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statCompleted').textContent = stats.completed;
    document.getElementById('statPending').textContent = stats.pending;
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle task form submission (create or update)
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const due_date = document.getElementById('taskDueDate').value;

    // Validate title
    if (!title) {
        document.getElementById('titleError').textContent = 'Tittel er påkrevd';
        return;
    }

    // Prepare task data
    const taskData = {
        title,
        description: description || null,
        category,
        priority,
        due_date: due_date || null
    };

    try {
        if (taskId) {
            // Update existing task
            await updateTask(parseInt(taskId), taskData);
            showToast('Oppgave oppdatert!', 'success');
        } else {
            // Create new task
            await createTask(taskData);
            showToast('Oppgave opprettet!', 'success');
        }

        closeModal();
        await loadTasks();
    } catch (error) {
        showToast('Feil ved lagring av oppgave', 'error');
    }
}

/**
 * Handle task completion toggle
 * @param {number} id - Task ID
 */
async function handleToggleComplete(id) {
    try {
        await toggleTaskCompletion(id);
        await loadTasks();
        showToast('Oppgave oppdatert!', 'success');
    } catch (error) {
        showToast('Feil ved oppdatering av oppgave', 'error');
    }
}

/**
 * Handle edit task button click
 * @param {number} id - Task ID
 */
function handleEditTask(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    // Populate form with task data
    document.getElementById('modalTitle').textContent = 'Rediger Oppgave';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskCategory').value = task.category;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.due_date || '';

    openModal();
}

/**
 * Handle delete task button click
 * @param {number} id - Task ID
 */
function handleDeleteTask(id) {
    taskToDelete = id;
    document.getElementById('deleteModal').classList.add('active');
}

/**
 * Confirm task deletion
 */
async function confirmDelete() {
    if (!taskToDelete) return;

    try {
        await deleteTask(taskToDelete);
        showToast('Oppgave slettet!', 'success');
        closeDeleteModal();
        await loadTasks();
    } catch (error) {
        showToast('Feil ved sletting av oppgave', 'error');
    }
}

/**
 * Handle filter tab click
 * @param {string} filter - Filter type (all, active, completed)
 */
function handleFilterChange(filter) {
    currentFilter = filter;

    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    loadTasks();
}

/**
 * Handle sort selection change
 */
function handleSortChange() {
    currentSort = document.getElementById('sortSelect').value;
    applySortAndFilter();
}

/**
 * Handle search input
 * Debounced to avoid excessive API calls
 */
let searchTimeout;
function handleSearch(event) {
    const searchTerm = event.target.value.trim();

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        if (searchTerm.length >= 2) {
            const results = await searchTasks(searchTerm);
            allTasks = results;
            applySortAndFilter();
        } else if (searchTerm.length === 0) {
            await loadTasks();
        }
    }, 300);
}

// ============================================
// MODAL FUNCTIONS
// ============================================

/**
 * Open task modal for create/edit
 */
function openModal() {
    document.getElementById('taskModal').classList.add('active');
    document.getElementById('taskTitle').focus();
}

/**
 * Close task modal
 */
function closeModal() {
    document.getElementById('taskModal').classList.remove('active');
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('modalTitle').textContent = 'Ny Oppgave';
    document.getElementById('titleError').textContent = '';
}

/**
 * Close delete confirmation modal
 */
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    taskToDelete = null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Sort and filter tasks based on current settings
 */
function applySortAndFilter() {
    let filteredTasks = [...allTasks];

    // Apply filter
    if (currentFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => task.completed === 0);
    } else if (currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed === 1);
    }

    // Apply sort
    if (currentSort === 'priority') {
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (currentSort === 'dueDate') {
        filteredTasks.sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date) - new Date(b.due_date);
        });
    } else if (currentSort === 'created') {
        filteredTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    renderTasks(filteredTasks);
}

/**
 * Load tasks from API and update UI
 */
async function loadTasks() {
    const tasks = await fetchTasks(currentFilter);
    allTasks = tasks;
    applySortAndFilter();

    // Update statistics
    const stats = await fetchStats();
    updateStats(stats);
}

/**
 * Format date to Norwegian format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
        return 'I dag';
    }

    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
        return 'I morgen';
    }

    // Return formatted date
    return date.toLocaleDateString('no-NO', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
}

/**
 * Check if task is overdue
 * @param {string} dueDate - Due date string
 * @param {boolean} isCompleted - Whether task is completed
 * @returns {boolean} True if overdue
 */
function isOverdue(dueDate, isCompleted) {
    if (!dueDate || isCompleted) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);

    return due < today;
}

/**
 * Get priority icon emoji
 * @param {string} priority - Priority level
 * @returns {string} Emoji icon
 */
function getPriorityIcon(priority) {
    const icons = {
        'High': '🔴',
        'Medium': '🟡',
        'Low': '🟢'
    };
    return icons[priority] || '⚪';
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of message (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Attach event listeners to task elements
 */
function attachTaskEventListeners() {
    // Event listeners are handled inline in HTML for simplicity
    // This function can be used for additional listeners if needed
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Todo Manager initialized');

    // Load tasks on page load
    loadTasks();

    // Add Task Button
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Ny Oppgave';
        openModal();
    });

    // Form submission
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);

    // Modal close buttons
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Close modal when clicking outside
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') {
            closeModal();
        }
    });

    // Delete modal
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            handleFilterChange(filter);
        });
    });

    // Sort select
    document.getElementById('sortSelect').addEventListener('change', handleSortChange);

    // Search input
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Set minimum date for due date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').setAttribute('min', today);
});

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================
// These functions are called from inline event handlers in HTML

window.handleToggleComplete = handleToggleComplete;
window.handleEditTask = handleEditTask;
window.handleDeleteTask = handleDeleteTask;
window.closeDeleteModal = closeDeleteModal;
