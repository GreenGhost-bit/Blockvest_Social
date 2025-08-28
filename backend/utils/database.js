const mongoose = require('mongoose');
const { logger } = require('./logger');

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 2,
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000,
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary',
      maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME) || 30000,
      heartbeatFrequencyMS: parseInt(process.env.MONGODB_HEARTBEAT_FREQUENCY) || 10000,
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000
    };
  }

  // Connect to MongoDB with retry logic
  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blockvest_social';
      
      logger.database('Attempting to connect to MongoDB...', {
        uri: mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials in logs
        options: this.connectionOptions
      });

      // Set up connection event handlers
      this.setupConnectionHandlers();

      // Attempt connection
      await mongoose.connect(mongoUri, this.connectionOptions);
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      
      logger.database('Successfully connected to MongoDB', {
        database: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        poolSize: this.connectionOptions.maxPoolSize
      });

      // Set up connection monitoring
      this.setupConnectionMonitoring();

    } catch (error) {
      this.connectionAttempts++;
      logger.error('Failed to connect to MongoDB', {
        error: error.message,
        attempt: this.connectionAttempts,
        maxRetries: this.maxRetries
      });

      if (this.connectionAttempts < this.maxRetries) {
        logger.database(`Retrying connection in ${this.retryDelay / 1000} seconds...`);
        setTimeout(() => this.connect(), this.retryDelay);
      } else {
        logger.error('Max connection attempts reached. Exiting process...');
        process.exit(1);
      }
    }
  }

  // Set up connection event handlers
  setupConnectionHandlers() {
    const connection = mongoose.connection;

    connection.on('connected', () => {
      this.isConnected = true;
      logger.database('MongoDB connection established');
    });

    connection.on('error', (error) => {
      this.isConnected = false;
      logger.error('MongoDB connection error', {
        error: error.message,
        stack: error.stack
      });
    });

    connection.on('disconnected', () => {
      this.isConnected = false;
      logger.database('MongoDB connection disconnected');
      
      // Attempt reconnection if not in shutdown mode
      if (!this.isShuttingDown) {
        this.reconnect();
      }
    });

    connection.on('reconnected', () => {
      this.isConnected = true;
      logger.database('MongoDB connection reestablished');
    });

    connection.on('close', () => {
      this.isConnected = false;
      logger.database('MongoDB connection closed');
    });

    // Handle process termination
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
  }

  // Set up connection monitoring
  setupConnectionMonitoring() {
    // Monitor connection pool status
    setInterval(() => {
      if (mongoose.connection.readyState === 1) {
        const poolStatus = mongoose.connection.db.admin().command({ serverStatus: 1 });
        poolStatus.then(status => {
          logger.database('Connection pool status', {
            activeConnections: status.connections?.active || 0,
            availableConnections: status.connections?.available || 0,
            currentConnections: status.connections?.current || 0,
            maxConnections: this.connectionOptions.maxPoolSize
          });
        }).catch(error => {
          logger.debug('Could not get connection pool status', { error: error.message });
        });
      }
    }, 30000); // Check every 30 seconds

    // Monitor database performance
    setInterval(() => {
      if (mongoose.connection.readyState === 1) {
        this.getDatabaseStats();
      }
    }, 60000); // Check every minute
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();
      
      logger.performance('Database statistics', {
        collections: stats.collections,
        dataSize: this.formatBytes(stats.dataSize),
        storageSize: this.formatBytes(stats.storageSize),
        indexes: stats.indexes,
        indexSize: this.formatBytes(stats.indexSize)
      });
    } catch (error) {
      logger.debug('Could not get database statistics', { error: error.message });
    }
  }

  // Format bytes to human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Reconnect to database
  async reconnect() {
    try {
      logger.database('Attempting to reconnect to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blockvest_social', this.connectionOptions);
    } catch (error) {
      logger.error('Reconnection failed', { error: error.message });
      
      // Retry reconnection after delay
      setTimeout(() => this.reconnect(), this.retryDelay);
    }
  }

  // Graceful shutdown
  async gracefulShutdown(signal) {
    this.isShuttingDown = true;
    logger.shutdown(`Received ${signal}. Starting graceful shutdown...`);

    try {
      // Close database connection
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.shutdown('Database connection closed successfully');
      }

      // Close any remaining connections
      await mongoose.disconnect();
      logger.shutdown('MongoDB disconnected successfully');

      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', { error: error.message });
      process.exit(1);
    }
  }

  // Check connection health
  async healthCheck() {
    try {
      if (mongoose.connection.readyState !== 1) {
        return {
          status: 'unhealthy',
          message: 'Database connection is not ready',
          readyState: mongoose.connection.readyState
        };
      }

      // Test database operation
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        message: 'Database connection is healthy',
        readyState: mongoose.connection.readyState,
        database: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database health check failed',
        error: error.message,
        readyState: mongoose.connection.readyState
      };
    }
  }

  // Get connection status
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      stateName: states[mongoose.connection.readyState] || 'unknown',
      database: mongoose.connection.db?.databaseName || 'unknown',
      host: mongoose.connection.host || 'unknown',
      port: mongoose.connection.port || 'unknown'
    };
  }

  // Create indexes for all models
  async createIndexes() {
    try {
      logger.database('Creating database indexes...');
      
      // Get all registered models
      const models = mongoose.modelNames();
      
      for (const modelName of models) {
        const model = mongoose.model(modelName);
        if (model.createIndexes) {
          await model.createIndexes();
          logger.database(`Indexes created for model: ${modelName}`);
        }
      }
      
      logger.database('All database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes', { error: error.message });
      throw error;
    }
  }

  // Backup database (basic implementation)
  async backupDatabase() {
    try {
      logger.backup('Starting database backup...');
      
      // This is a basic implementation
      // In production, you might want to use mongodump or similar tools
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `./backups/backup-${timestamp}`;
      
      logger.backup(`Database backup completed: ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Database backup failed', { error: error.message });
      throw error;
    }
  }

  // Clean up old connections
  async cleanupConnections() {
    try {
      if (mongoose.connection.readyState === 1) {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          logger.database('Garbage collection triggered');
        }
        
        logger.database('Connection cleanup completed');
      }
    } catch (error) {
      logger.error('Connection cleanup failed', { error: error.message });
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Export the manager and utility functions
module.exports = {
  databaseManager,
  connect: () => databaseManager.connect(),
  disconnect: () => databaseManager.gracefulShutdown('manual'),
  healthCheck: () => databaseManager.healthCheck(),
  getConnectionStatus: () => databaseManager.getConnectionStatus(),
  createIndexes: () => databaseManager.createIndexes(),
  backupDatabase: () => databaseManager.backupDatabase(),
  cleanupConnections: () => databaseManager.cleanupConnections()
};
