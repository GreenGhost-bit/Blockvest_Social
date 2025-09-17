// Performance monitoring and optimization utilities

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  private constructor() {
    this.setupPerformanceObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObservers(): void {
    // Observe navigation timing
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.recordMetric('navigation', entry.duration, {
                type: 'navigation',
                loadTime: entry.loadEventEnd - entry.loadEventStart,
                domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart
              });
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (error) {
        console.warn('Failed to setup navigation observer:', error);
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.recordMetric('resource', entry.duration, {
                type: 'resource',
                name: entry.name,
                size: (entry as any).transferSize || 0,
                initiatorType: (entry as any).initiatorType
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Failed to setup resource observer:', error);
      }

      // Observe paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
              this.recordMetric(`paint_${entry.name}`, entry.startTime, {
                type: 'paint',
                name: entry.name
              });
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        console.warn('Failed to setup paint observer:', error);
      }
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };
    this.metrics.push(metric);
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length;
  }

  getLatestMetric(name: string): PerformanceMetric | undefined {
    const metrics = this.getMetrics(name);
    return metrics[metrics.length - 1];
  }

  getMetricsByTimeRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.timestamp >= startTime && metric.timestamp <= endTime
    );
  }

  getMetricsByMetadata(key: string, value: any): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.metadata && metric.metadata[key] === value
    );
  }

  getSlowestMetrics(count: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, count);
  }

  getFastestMetrics(count: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => a.value - b.value)
      .slice(0, count);
  }

  getMetricStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    median: number;
  } {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, median: 0 };
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const min = values[0];
    const max = values[values.length - 1];
    const median = values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];

    return { count: values.length, average, min, max, median };
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memoize function results
  memoize: <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Lazy load images
  lazyLoadImage: (img: HTMLImageElement, src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Preload resources
  preloadResource: (href: string, as: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  },

  // Measure function execution time
  measureTime: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      PerformanceMonitor.getInstance().recordMetric(name, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      PerformanceMonitor.getInstance().recordMetric(`${name}_error`, end - start);
      throw error;
    }
  },

  // Batch DOM updates
  batchDOMUpdates: (updates: (() => void)[]): void => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },

  // Virtual scrolling helper
  calculateVisibleRange: (
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    buffer: number = 5
  ) => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(
      Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer,
      Infinity
    );
    return { startIndex, endIndex };
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver: (
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }
    return new IntersectionObserver(callback, options);
  },

  // Resize Observer for responsive updates
  createResizeObserver: (
    callback: (entries: ResizeObserverEntry[]) => void
  ) => {
    if (typeof window === 'undefined' || !('ResizeObserver' in window)) {
      return null;
    }
    return new ResizeObserver(callback);
  },

  // Web Workers for heavy computations
  createWorker: (workerFunction: Function): Worker | null => {
    if (typeof window === 'undefined' || !('Worker' in window)) {
      return null;
    }
    
    const blob = new Blob([`(${workerFunction.toString()})()`], {
      type: 'application/javascript'
    });
    return new Worker(URL.createObjectURL(blob));
  },

  // Image optimization
  optimizeImage: (src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string => {
    // In a real app, you would use a service like Cloudinary or ImageKit
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    return `${src}?${params.toString()}`;
  },

  // Bundle size analysis
  analyzeBundleSize: (): void => {
    if (typeof window === 'undefined') return;
    
    const scripts = Array.from(document.scripts);
    const stylesheets = Array.from(document.styleSheets);
    
    console.log('Bundle Analysis:', {
      scripts: scripts.length,
      stylesheets: stylesheets.length,
      totalScriptSize: scripts.reduce((total, script) => {
        return total + (script.src ? new URL(script.src).pathname.length : 0);
      }, 0)
    });
  },

  // Memory usage monitoring
  getMemoryUsage: (): any => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }
    
    return (performance as any).memory;
  },

  // Network information
  getNetworkInfo: (): any => {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
      return null;
    }
    
    return (navigator as any).connection;
  }
};

// React performance hooks
export const usePerformance = () => {
  const monitor = PerformanceMonitor.getInstance();

  const startTimer = (name: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      monitor.recordMetric(name, end - start);
    };
  };

  const recordMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    monitor.recordMetric(name, value, metadata);
  };

  const getMetrics = (name?: string) => {
    return monitor.getMetrics(name);
  };

  return {
    startTimer,
    recordMetric,
    getMetrics
  };
};

// Performance budget monitoring
export const performanceBudgets = {
  navigation: 2000, // 2 seconds
  paint: 100, // 100ms
  resource: 1000, // 1 second
  interaction: 100 // 100ms
};

export const checkPerformanceBudget = (): Record<string, boolean> => {
  const monitor = PerformanceMonitor.getInstance();
  const results: Record<string, boolean> = {};

  Object.entries(performanceBudgets).forEach(([metric, budget]) => {
    const latest = monitor.getLatestMetric(metric);
    results[metric] = latest ? latest.value <= budget : true;
  });

  return results;
};

// Performance reporting
export const reportPerformance = async (): Promise<void> => {
  const monitor = PerformanceMonitor.getInstance();
  const metrics = monitor.getMetrics();
  
  // In a real application, you would send this to an analytics service
  console.log('Performance metrics:', metrics);
  
  // Check performance budgets
  const budgetResults = checkPerformanceBudget();
  const failedBudgets = Object.entries(budgetResults)
    .filter(([_, passed]) => !passed)
    .map(([metric, _]) => metric);
  
  if (failedBudgets.length > 0) {
    console.warn('Performance budgets exceeded:', failedBudgets);
  }
};

export default PerformanceMonitor;
