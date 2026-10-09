const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const {
  getAllComplaintsAdmin,
  updateComplaintStatusAdmin,
  updateComplaintPriorityAdmin,
  getComplaintHistoryAdmin
} = require('./controllers/complaintController');
const {
  createNoticeAdmin,
  updateNoticeAdmin,
  deleteNoticeAdmin
} = require('./controllers/noticeController');
const { getAdminDashboardStats } = require('./controllers/dashboardController');

const app = express();

// Security & Parsing Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local static uploaded files
const uploadDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Society Maintenance Tracker API'
  });
});

// Primary API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Dedicated Admin API Aliases (Matching exact specification)
const adminRouter = express.Router();
adminRouter.use(authenticateToken, requireAdmin);

// Admin Complaints
adminRouter.get('/complaints', getAllComplaintsAdmin);
adminRouter.patch('/complaints/:id/status', updateComplaintStatusAdmin);
adminRouter.patch('/complaints/:id/priority', updateComplaintPriorityAdmin);
adminRouter.get('/complaints/:id/history', getComplaintHistoryAdmin);

// Admin Notices
adminRouter.post('/notices', createNoticeAdmin);
adminRouter.patch('/notices/:id', updateNoticeAdmin);
adminRouter.delete('/notices/:id', deleteNoticeAdmin);

// Admin Dashboard
adminRouter.get('/dashboard', getAdminDashboardStats);

app.use('/api/admin', adminRouter);

// In production, serve the Vite build from the same origin as the API.
// This keeps browser API requests same-origin and gives React Router deep links a fallback.
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path === '/api' || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
