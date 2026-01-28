// ============================================
// TODO/TASK MANAGER - EXPRESS SERVER
// ============================================
// Main server file for the Todo/Task Manager application
// Handles API routes and serves static frontend files

const express = require('express');
const path = require('path');
const taskRoutes = require('./src/routes/taskRoutes');

// ============================================
// SERVER CONFIGURATION
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'src/public')));

// Log all requests (helpful for debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ============================================
// API ROUTES
// ============================================

// Mount task routes under /api/tasks
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// SERVE FRONTEND
// ============================================

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public/index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('');
    console.log('============================================');
    console.log('   TODO/TASK MANAGER SERVER');
    console.log('============================================');
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api/tasks`);
    console.log('✓ Press Ctrl+C to stop the server');
    console.log('============================================');
    console.log('');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\nShutting down server gracefully...');
    process.exit(0);
});
