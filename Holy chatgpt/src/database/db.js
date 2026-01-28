// ============================================
// DATABASE MODULE
// ============================================
// This module handles all database operations using SQLite
// It provides CRUD functions for managing tasks

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// ============================================
// DATABASE INITIALIZATION
// ============================================

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
const dbPath = path.join(dataDir, 'tasks.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✓ Database connected at:', dbPath);
    }
});

// Read and execute schema SQL file to create tables
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Execute schema
db.exec(schema, (err) => {
    if (err) {
        console.error('Error creating tables:', err);
    } else {
        console.log('✓ Database schema initialized');
    }
});

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get all tasks from database
 * @param {Object} filters - Optional filters (completed, category, priority)
 * @returns {Promise<Array>} Array of task objects
 */
function getAllTasks(filters = {}) {
    return new Promise((resolve, reject) => {
        try {
            let query = 'SELECT * FROM tasks WHERE 1=1';
            const params = [];

            // Apply completed filter if provided
            if (filters.completed !== undefined) {
                query += ' AND completed = ?';
                params.push(filters.completed);
            }

            // Apply category filter if provided
            if (filters.category) {
                query += ' AND category = ?';
                params.push(filters.category);
            }

            // Apply priority filter if provided
            if (filters.priority) {
                query += ' AND priority = ?';
                params.push(filters.priority);
            }

            // Default ordering: incomplete tasks first, then by due date
            query += ' ORDER BY completed ASC, due_date ASC, created_at DESC';

            db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('Error getting all tasks:', err);
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        } catch (error) {
            console.error('Error in getAllTasks:', error);
            reject(error);
        }
    });
}

/**
 * Get a single task by ID
 * @param {number} id - Task ID
 * @returns {Promise<Object|undefined>} Task object or undefined if not found
 */
function getTaskById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error getting task by ID:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Create a new task
 * @param {Object} taskData - Task data (title, description, category, priority, due_date)
 * @returns {Promise<Object>} Created task object with ID
 */
function createTask(taskData) {
    return new Promise((resolve, reject) => {
        try {
            const { title, description, category, priority, due_date } = taskData;

            // Validate required fields
            if (!title || title.trim() === '') {
                reject(new Error('Task title is required'));
                return;
            }

            // Validate priority if provided
            const validPriorities = ['Low', 'Medium', 'High'];
            if (priority && !validPriorities.includes(priority)) {
                reject(new Error('Invalid priority value. Must be Low, Medium, or High'));
                return;
            }

            // Prepare insert statement
            const query = `
                INSERT INTO tasks (title, description, category, priority, due_date)
                VALUES (?, ?, ?, ?, ?)
            `;

            const params = [
                title.trim(),
                description || null,
                category || 'General',
                priority || 'Medium',
                due_date || null
            ];

            db.run(query, params, function(err) {
                if (err) {
                    console.error('Error creating task:', err);
                    reject(err);
                } else {
                    // Get the newly created task
                    getTaskById(this.lastID)
                        .then(task => resolve(task))
                        .catch(err => reject(err));
                }
            });
        } catch (error) {
            console.error('Error in createTask:', error);
            reject(error);
        }
    });
}

/**
 * Update an existing task
 * @param {number} id - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task object
 */
function updateTask(id, taskData) {
    return new Promise(async (resolve, reject) => {
        try {
            const { title, description, category, priority, due_date, completed } = taskData;

            // Check if task exists
            const existingTask = await getTaskById(id);
            if (!existingTask) {
                reject(new Error('Task not found'));
                return;
            }

            // Validate priority if provided
            const validPriorities = ['Low', 'Medium', 'High'];
            if (priority && !validPriorities.includes(priority)) {
                reject(new Error('Invalid priority value. Must be Low, Medium, or High'));
                return;
            }

            // Build update query dynamically based on provided fields
            const updates = [];
            const params = [];

            if (title !== undefined) {
                updates.push('title = ?');
                params.push(title.trim());
            }
            if (description !== undefined) {
                updates.push('description = ?');
                params.push(description);
            }
            if (category !== undefined) {
                updates.push('category = ?');
                params.push(category);
            }
            if (priority !== undefined) {
                updates.push('priority = ?');
                params.push(priority);
            }
            if (due_date !== undefined) {
                updates.push('due_date = ?');
                params.push(due_date);
            }
            if (completed !== undefined) {
                updates.push('completed = ?');
                params.push(completed ? 1 : 0);
            }

            // Always update the updated_at timestamp
            updates.push('updated_at = CURRENT_TIMESTAMP');

            // Add ID to params
            params.push(id);

            // Execute update
            const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;

            db.run(query, params, (err) => {
                if (err) {
                    console.error('Error updating task:', err);
                    reject(err);
                } else {
                    // Return updated task
                    getTaskById(id)
                        .then(task => resolve(task))
                        .catch(err => reject(err));
                }
            });
        } catch (error) {
            console.error('Error in updateTask:', error);
            reject(error);
        }
    });
}

/**
 * Toggle task completion status
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Updated task object
 */
function toggleTaskComplete(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const task = await getTaskById(id);
            if (!task) {
                reject(new Error('Task not found'));
                return;
            }

            // Toggle completion status
            const newStatus = task.completed === 1 ? 0 : 1;

            const query = `
                UPDATE tasks
                SET completed = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            db.run(query, [newStatus, id], (err) => {
                if (err) {
                    console.error('Error toggling task completion:', err);
                    reject(err);
                } else {
                    getTaskById(id)
                        .then(task => resolve(task))
                        .catch(err => reject(err));
                }
            });
        } catch (error) {
            console.error('Error in toggleTaskComplete:', error);
            reject(error);
        }
    });
}

/**
 * Delete a task by ID
 * @param {number} id - Task ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
function deleteTask(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
            if (err) {
                console.error('Error deleting task:', err);
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

/**
 * Get task statistics
 * @returns {Promise<Object>} Statistics object with counts and percentages
 */
function getTaskStats() {
    return new Promise((resolve, reject) => {
        try {
            const stats = {
                total: 0,
                completed: 0,
                pending: 0,
                overdue: 0,
                completionRate: 0,
                byPriority: [],
                byCategory: []
            };

            // Get total count
            db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                stats.total = row.count;

                // Get completed count
                db.get('SELECT COUNT(*) as count FROM tasks WHERE completed = 1', (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    stats.completed = row.count;
                    stats.pending = stats.total - stats.completed;

                    // Get overdue count
                    const today = new Date().toISOString().split('T')[0];
                    db.get(
                        'SELECT COUNT(*) as count FROM tasks WHERE due_date < ? AND completed = 0',
                        [today],
                        (err, row) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            stats.overdue = row.count;

                            // Calculate completion percentage
                            stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

                            // Get counts by priority
                            db.all(
                                'SELECT priority, COUNT(*) as count FROM tasks WHERE completed = 0 GROUP BY priority',
                                (err, rows) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    stats.byPriority = rows || [];

                                    // Get counts by category
                                    db.all(
                                        'SELECT category, COUNT(*) as count FROM tasks GROUP BY category',
                                        (err, rows) => {
                                            if (err) {
                                                reject(err);
                                                return;
                                            }

                                            stats.byCategory = rows || [];
                                            resolve(stats);
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            });
        } catch (error) {
            console.error('Error in getTaskStats:', error);
            reject(error);
        }
    });
}

/**
 * Search tasks by title or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching task objects
 */
function searchTasks(searchTerm) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM tasks
            WHERE title LIKE ? OR description LIKE ?
            ORDER BY completed ASC, created_at DESC
        `;
        const term = `%${searchTerm}%`;

        db.all(query, [term, term], (err, rows) => {
            if (err) {
                console.error('Error searching tasks:', err);
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    db,
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    getTaskStats,
    searchTasks
};
