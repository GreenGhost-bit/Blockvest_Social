// Caching utilities for performance optimization

export interface CacheItem<T> {
  value: T;
  expiry: number;
  metadata?: Record<string, any>;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  strategy?: 'lru' | 'fifo' | 'lfu'; // Eviction strategy
}

export class Cache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private accessOrder: string[] = [];
  private accessCount = new Map<string, number>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 300000, // 5 minutes default
      maxSize: options.maxSize || 100,
      strategy: options.strategy || 'lru'
    };
  }

  set(key: string, value: T, metadata?: Record<string, any>): void {
    // Remove expired items
    this.cleanup();

    // Check if we need to evict items
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    const item: CacheItem<T> = {
      value,
      expiry: Date.now() + this.options.ttl,
      metadata
    };

    this.cache.set(key, item);
    this.updateAccessOrder(key);
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return undefined;
    }

    // Update access order and count
    this.updateAccessOrder(key);
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);

    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.removeFromAccessOrder(key);
    this.accessCount.delete(key);
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.accessCount.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    this.cleanup();
    return Array.from(this.cache.values()).map(item => item.value);
  }

  entries(): Array<[string, T]> {
    this.cleanup();
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
  }

  forEach(callback: (value: T, key: string, cache: Cache<T>) => void): void {
    this.cleanup();
    this.cache.forEach((item, key) => {
      callback(item.value, key, this);
    });
  }

  map<U>(callback: (value: T, key: string) => U): U[] {
    this.cleanup();
    return Array.from(this.cache.entries()).map(([key, item]) => 
      callback(item.value, key)
    );
  }

  filter(predicate: (value: T, key: string) => boolean): Array<[string, T]> {
    this.cleanup();
    return Array.from(this.cache.entries())
      .filter(([key, item]) => predicate(item.value, key))
      .map(([key, item]) => [key, item.value]);
  }

  find(predicate: (value: T, key: string) => boolean): T | undefined {
    this.cleanup();
    for (const [key, item] of this.cache.entries()) {
      if (predicate(item.value, key)) {
        return item.value;
      }
    }
    return undefined;
  }

  some(predicate: (value: T, key: string) => boolean): boolean {
    this.cleanup();
    for (const [key, item] of this.cache.entries()) {
      if (predicate(item.value, key)) {
        return true;
      }
    }
    return false;
  }

  every(predicate: (value: T, key: string) => boolean): boolean {
    this.cleanup();
    for (const [key, item] of this.cache.entries()) {
      if (!predicate(item.value, key)) {
        return false;
      }
    }
    return true;
  }

  reduce<U>(callback: (accumulator: U, value: T, key: string) => U, initialValue: U): U {
    this.cleanup();
    let accumulator = initialValue;
    for (const [key, item] of this.cache.entries()) {
      accumulator = callback(accumulator, item.value, key);
    }
    return accumulator;
  }

  getStats(): {
    size: number;
    hitRate: number;
    missRate: number;
    averageAge: number;
    oldestItem: string | null;
    newestItem: string | null;
  } {
    this.cleanup();
    const now = Date.now();
    const items = Array.from(this.cache.entries());
    
    if (items.length === 0) {
      return {
        size: 0,
        hitRate: 0,
        missRate: 0,
        averageAge: 0,
        oldestItem: null,
        newestItem: null
      };
    }

    const ages = items.map(([_, item]) => now - (item.expiry - this.options.ttl));
    const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    
    const sortedByAge = items.sort((a, b) => a[1].expiry - b[1].expiry);
    const oldestItem = sortedByAge[0][0];
    const newestItem = sortedByAge[sortedByAge.length - 1][0];

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      missRate: 0, // Would need to track hits/misses
      averageAge,
      oldestItem,
      newestItem
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        this.accessCount.delete(key);
      }
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | undefined;

    switch (this.options.strategy) {
      case 'lru':
        keyToEvict = this.accessOrder[0];
        break;
      case 'fifo':
        keyToEvict = this.accessOrder[0];
        break;
      case 'lfu':
        keyToEvict = this.findLeastFrequentlyUsed();
        break;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
    }
  }

  private findLeastFrequentlyUsed(): string | undefined {
    let minCount = Infinity;
    let lfuKey: string | undefined;

    for (const [key, count] of this.accessCount.entries()) {
      if (count < minCount) {
        minCount = count;
        lfuKey = key;
      }
    }

    return lfuKey;
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}

// Global cache instances
export const caches = {
  api: new Cache<any>({ ttl: 300000, maxSize: 1000, strategy: 'lru' }),
  user: new Cache<any>({ ttl: 900000, maxSize: 100, strategy: 'lru' }),
  investments: new Cache<any>({ ttl: 600000, maxSize: 500, strategy: 'lru' }),
  documents: new Cache<any>({ ttl: 1800000, maxSize: 200, strategy: 'lru' })
};

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  cache: Cache<ReturnType<T>>,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: Parameters<T>) {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const cached = cache.get(key);
      
      if (cached !== undefined) {
        return cached;
      }
      
      const result = method.apply(this, args);
      cache.set(key, result);
      return result;
    };
  };
}

// Cache middleware for API calls
export const withCache = <T>(
  cache: Cache<T>,
  keyGenerator: (...args: any[]) => string,
  ttl?: number
) => {
  return async (fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const result = await fn(...args);
    cache.set(key, result, undefined, ttl);
    return result;
  };
};

// Cache invalidation strategies
export const cacheInvalidation = {
  // Invalidate by pattern
  invalidateByPattern: (cache: Cache<any>, pattern: RegExp): void => {
    const keys = cache.keys();
    keys.forEach(key => {
      if (pattern.test(key)) {
        cache.delete(key);
      }
    });
  },

  // Invalidate by metadata
  invalidateByMetadata: (cache: Cache<any>, metadataKey: string, metadataValue: any): void => {
    const keys = cache.keys();
    keys.forEach(key => {
      const item = cache.get(key);
      if (item?.metadata?.[metadataKey] === metadataValue) {
        cache.delete(key);
      }
    });
  },

  // Invalidate all
  invalidateAll: (cache: Cache<any>): void => {
    cache.clear();
  }
};

// Cache statistics
export const getCacheStats = (cache: Cache<any>) => {
  return {
    size: cache.size(),
    keys: cache.keys(),
    hitRate: 0, // Would need to track hits/misses
    memoryUsage: 0 // Would need to estimate memory usage
  };
};

// Cache warming
export const warmCache = async <T>(
  cache: Cache<T>,
  keys: string[],
  fetcher: (key: string) => Promise<T>
): Promise<void> => {
  const promises = keys.map(async (key) => {
    if (!cache.has(key)) {
      try {
        const value = await fetcher(key);
        cache.set(key, value);
      } catch (error) {
        console.warn(`Failed to warm cache for key ${key}:`, error);
      }
    }
  });
  
  await Promise.all(promises);
};

// Cache middleware for React Query
export const createCacheMiddleware = <T>(cache: Cache<T>) => {
  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: T, metadata?: Record<string, any>) => cache.set(key, value, metadata),
    has: (key: string) => cache.has(key),
    delete: (key: string) => cache.delete(key),
    clear: () => cache.clear(),
    stats: () => cache.getStats()
  };
};

// Cache persistence
export const persistCache = <T>(cache: Cache<T>, storageKey: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const data = Array.from(cache.entries()).map(([key, value]) => ({
      key,
      value,
      metadata: cache.get(key)?.metadata
    }));
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to persist cache:', error);
  }
};

export const restoreCache = <T>(cache: Cache<T>, storageKey: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const data = localStorage.getItem(storageKey);
    if (data) {
      const items = JSON.parse(data);
      items.forEach((item: any) => {
        cache.set(item.key, item.value, item.metadata);
      });
    }
  } catch (error) {
    console.warn('Failed to restore cache:', error);
  }
};

// Cache compression
export const compressCache = <T>(cache: Cache<T>): string => {
  const data = Array.from(cache.entries()).map(([key, value]) => ({
    key,
    value,
    metadata: cache.get(key)?.metadata
  }));
  return JSON.stringify(data);
};

export const decompressCache = <T>(cache: Cache<T>, compressedData: string): void => {
  try {
    const items = JSON.parse(compressedData);
    items.forEach((item: any) => {
      cache.set(item.key, item.value, item.metadata);
    });
  } catch (error) {
    console.warn('Failed to decompress cache:', error);
  }
};

// Cache synchronization
export const syncCaches = <T>(source: Cache<T>, target: Cache<T>): void => {
  source.forEach((value, key) => {
    target.set(key, value);
  });
};

// Cache health check
export const checkCacheHealth = <T>(cache: Cache<T>): {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const stats = cache.getStats();
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (stats.size === 0) {
    issues.push('Cache is empty');
    recommendations.push('Consider warming the cache with frequently accessed data');
  }

  if (stats.averageAge > 3600000) { // 1 hour
    issues.push('Cache items are old');
    recommendations.push('Consider reducing TTL or implementing cache refresh');
  }

  if (stats.size > 1000) {
    issues.push('Cache is large');
    recommendations.push('Consider reducing maxSize or implementing more aggressive eviction');
  }

  return {
    healthy: issues.length === 0,
    issues,
    recommendations
  };
};

export default Cache;
