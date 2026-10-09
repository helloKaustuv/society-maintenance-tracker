const app = require('./app');
const { initDb } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🚀 Initializing Society Maintenance Tracker Database...');
    await initDb();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🏢 Society Maintenance Tracker API is running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏱️  Overdue Threshold: ${process.env.OVERDUE_DAYS || '3'} days`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('❌ Fatal server startup error:', error);
    process.exit(1);
  }
};

startServer();
