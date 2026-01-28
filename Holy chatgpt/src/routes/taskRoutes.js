// ============================================
// TASK ROUTES
// ============================================
// This module defines all API endpoints for task management
// All routes are prefixed with /api/tasks

const express = require('express');
const router = express.Router();
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    getTaskStats,
    searchTasks
} = require('../database/db');

// ============================================
// ROUTE HANDLERS
// ============================================

/**
 * GET /api/tasks
 * Get all tasks with optional filters
 * Query params: completed (0/1), category, priority, search
 */
router.get('/', async (req, res) => {
    try {
        const { completed, category, priority, search } = req.query;

        // If search term provided, use search function
        if (search) {
            const tasks = await searchTasks(search);
            return res.json({
                success: true,
                count: tasks.length,
                data: tasks
            });
        }

        // Build filters object
        const filters = {};
        if (completed !== undefined) {
            filters.completed = parseInt(completed);
        }
        if (category) {
            filters.category = category;
        }
        if (priority) {
            filters.priority = priority;
        }

        const tasks = await getAllTasks(filters);

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error('Error in GET /api/tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve tasks',
            message: error.message
        });
    }
});

/**
 * GET /api/tasks/stats
 * Get task statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await getTaskStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error in GET /api/tasks/stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve statistics',
            message: error.message
        });
    }
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const task = await getTaskById(parseInt(id));

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: `No task exists with ID ${id}`
            });
        }

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('Error in GET /api/tasks/:id:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve task',
            message: error.message
        });
    }
});

/**
 * POST /api/tasks
 * Create a new task
 * Body: { title, description, category, priority, due_date }
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, category, priority, due_date } = req.body;

        // Validate required fields
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Task title is required'
            });
        }

        // Create task
        const newTask = await createTask({
            title,
            description,
            category,
            priority,
            due_date
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: newTask
        });
    } catch (error) {
        console.error('Error in POST /api/tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
            message: error.message
        });
    }
});

/**
 * PUT /api/tasks/:id
 * Update a task completely
 * Body: { title, description, category, priority, due_date, completed }
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const taskData = req.body;

        // Check if task exists
        const existingTask = await getTaskById(parseInt(id));
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: `No task exists with ID ${id}`
            });
        }

        // Update task
        const updatedTask = await updateTask(parseInt(id), taskData);

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        });
    } catch (error) {
        console.error('Error in PUT /api/tasks/:id:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task',
            message: error.message
        });
    }
});

/**
 * PATCH /api/tasks/:id/toggle
 * Toggle task completion status
 */
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if task exists
        const existingTask = await getTaskById(parseInt(id));
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: `No task exists with ID ${id}`
            });
        }

        // Toggle completion
        const updatedTask = await toggleTaskComplete(parseInt(id));

        res.json({
            success: true,
            message: `Task marked as ${updatedTask.completed ? 'completed' : 'incomplete'}`,
            data: updatedTask
        });
    } catch (error) {
        console.error('Error in PATCH /api/tasks/:id/toggle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle task completion',
            message: error.message
        });
    }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if task exists
        const existingTask = await getTaskById(parseInt(id));
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: `No task exists with ID ${id}`
            });
        }

        // Delete task
        const deleted = await deleteTask(parseInt(id));

        if (deleted) {
            res.json({
                success: true,
                message: 'Task deleted successfully'
            });
        } else {
            throw new Error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error in DELETE /api/tasks/:id:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task',
            message: error.message
        });
    }
});

// ============================================
// EXPORTS
// ============================================

module.exports = router;
