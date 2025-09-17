const os = require('os');
const fs = require('fs');
const path = require('path');

class MonitoringService {
  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
    this.intervalId = null;
  }

  // Start monitoring
  start() {
    // Collect metrics every 30 seconds
    this.intervalId = setInterval(() => {
      this.collectSystemMetrics();
      this.collectApplicationMetrics();
    }, 30000);

    console.log('Monitoring service started');
  }

  // Stop monitoring
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Monitoring service stopped');
  }

  // Collect system metrics
  collectSystemMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: os.uptime(),
        loadAverage: os.loadavg(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuCount: os.cpus().length,
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
      },
    };

    this.metrics.set('system', metrics);
    this.exportMetrics('system', metrics);
  }

  // Collect application metrics
  collectApplicationMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      application: {
        uptime: Date.now() - this.startTime,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        eventLoopLag: this.measureEventLoopLag(),
        activeHandles: process._getActiveHandles().length,
        activeRequests: process._getActiveRequests().length,
      },
      custom: this.getCustomMetrics(),
    };

    this.metrics.set('application', metrics);
    this.exportMetrics('application', metrics);
  }

  // Measure event loop lag
  measureEventLoopLag() {
    const start = process.hrtime();
    setImmediate(() => {
      const delta = process.hrtime(start);
      const lag = delta[0] * 1000 + delta[1] / 1e6;
      this.metrics.set('eventLoopLag', lag);
    });
    return 0; // Placeholder, actual measurement happens asynchronously
  }

  // Get custom metrics
  getCustomMetrics() {
    return {
      totalRequests: this.metrics.get('totalRequests') || 0,
      totalErrors: this.metrics.get('totalErrors') || 0,
      activeConnections: this.metrics.get('activeConnections') || 0,
      databaseConnections: this.metrics.get('databaseConnections') || 0,
      cacheHitRate: this.metrics.get('cacheHitRate') || 0,
      averageResponseTime: this.metrics.get('averageResponseTime') || 0,
    };
  }

  // Record custom metric
  recordMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: new Date().toISOString(),
    };

    this.metrics.set(name, metric);
    this.exportMetrics('custom', metric);
  }

  // Increment counter
  incrementCounter(name, increment = 1, tags = {}) {
    const current = this.metrics.get(name) || 0;
    const newValue = current + increment;
    this.metrics.set(name, newValue);
    
    this.recordMetric(name, newValue, tags);
  }

  // Record timer
  recordTimer(name, duration, tags = {}) {
    this.recordMetric(name, duration, { ...tags, type: 'timer' });
  }

  // Record gauge
  recordGauge(name, value, tags = {}) {
    this.recordMetric(name, value, { ...tags, type: 'gauge' });
  }

  // Export metrics to file
  exportMetrics(type, metrics) {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const filename = path.join(logDir, `metrics_${type}.log`);
    const logEntry = JSON.stringify(metrics) + '\n';
    
    fs.appendFileSync(filename, logEntry);
  }

  // Get all metrics
  getAllMetrics() {
    const allMetrics = {};
    for (const [key, value] of this.metrics.entries()) {
      allMetrics[key] = value;
    }
    return allMetrics;
  }

  // Get health status
  getHealthStatus() {
    const system = this.metrics.get('system');
    const application = this.metrics.get('application');
    
    if (!system || !application) {
      return { status: 'unknown', message: 'Metrics not available' };
    }

    const memoryUsage = system.system.freeMemory / system.system.totalMemory;
    const eventLoopLag = this.metrics.get('eventLoopLag') || 0;
    const errorRate = (this.metrics.get('totalErrors') || 0) / (this.metrics.get('totalRequests') || 1);

    let status = 'healthy';
    const issues = [];

    if (memoryUsage < 0.1) {
      issues.push('Low memory available');
      status = 'degraded';
    }

    if (eventLoopLag > 100) {
      issues.push('High event loop lag');
      status = 'degraded';
    }

    if (errorRate > 0.1) {
      issues.push('High error rate');
      status = 'unhealthy';
    }

    if (application.application.memoryUsage.heapUsed > 500 * 1024 * 1024) {
      issues.push('High memory usage');
      status = 'degraded';
    }

    return {
      status,
      issues,
      timestamp: new Date().toISOString(),
      uptime: application.application.uptime,
      memoryUsage: memoryUsage,
      eventLoopLag,
      errorRate,
    };
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const system = this.metrics.get('system');
    const application = this.metrics.get('application');
    
    if (!system || !application) {
      return null;
    }

    return {
      timestamp: new Date().toISOString(),
      system: {
        loadAverage: system.system.loadAverage,
        memoryUsage: {
          total: system.system.totalMemory,
          free: system.system.freeMemory,
          used: system.system.totalMemory - system.system.freeMemory,
          percentage: ((system.system.totalMemory - system.system.freeMemory) / system.system.totalMemory) * 100,
        },
        cpuCount: system.system.cpuCount,
      },
      application: {
        uptime: application.application.uptime,
        memoryUsage: application.application.memoryUsage,
        eventLoopLag: this.metrics.get('eventLoopLag') || 0,
        activeHandles: application.application.activeHandles,
        activeRequests: application.application.activeRequests,
      },
      custom: this.getCustomMetrics(),
    };
  }

  // Clean up old metrics
  cleanup() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, value] of this.metrics.entries()) {
      if (value.timestamp && new Date(value.timestamp).getTime() < cutoff) {
        this.metrics.delete(key);
      }
    }
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

module.exports = monitoringService;
