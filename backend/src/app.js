const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Vercel's serverless bundler can wrap CommonJS modules in a default export.
// Normalize both the native CommonJS and wrapped forms before mounting routers.
const loadRouter = (loadedModule) => {
  return typeof loadedModule === 'function' ? loadedModule : loadedModule.default;
};

const authRoutes = loadRouter(require('./routes/authRoutes'));
const complaintRoutes = loadRouter(require('./routes/complaintRoutes'));
const noticeRoutes = loadRouter(require('./routes/noticeRoutes'));
const dashboardRoutes = loadRouter(require('./routes/dashboardRoutes'));

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
const { initDb } = require('./config/db');

const app = express();

// Vercel runs this app as a serverless function, so initialize the persistent
// schema lazily on the first request handled by each warm instance.
if (process.env.VERCEL) {
  let databaseReady;
  app.use((req, res, next) => {
    if (!databaseReady) {
      databaseReady = initDb().catch((error) => {
        databaseReady = null;
        throw error;
      });
    }
    databaseReady.then(() => next()).catch(next);
  });
}

// Security & Parsing Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local static uploaded files
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'society-maintenance-uploads')
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));
app.get('/uploads/:filename', (req, res, next) => {
  const filename = path.basename(req.params.filename);
  res.sendFile(path.join(uploadDir, filename), (error) => {
    if (error) next(error);
  });
});

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
