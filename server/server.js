import app from './app.js';
import { testDatabaseConnection } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`WolloShare server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error.');
    process.exit(1);
  }
};

startServer();
