# Module 12: Performance Optimization & Resource Management

**Duration**: 3-3.5 hours | **Level**: Advanced | **Prerequisites**: Modules 1-11 completed

## Learning Objectives

By the end of this module, you will:
- Master bundle optimization and lazy loading techniques
- Implement memory management and leak prevention
- Create caching strategies and CDN integration
- Build performance monitoring and profiling systems
- Optimize application startup and runtime performance

## 1. Conceptual Foundation (30 minutes)

### Performance Bottlenecks in UI5 Applications

**Common Performance Issues:**
- Large bundle sizes causing slow initial load
- Memory leaks from improper cleanup
- Inefficient data binding and rendering
- Excessive network requests
- Unoptimized images and assets

**Performance Metrics:**
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Memory Usage**: Stable over time
- **Bundle Size**: < 1MB initial load

### Impact on User Experience and Business

**User Experience Impact:**
- Slow loading reduces user engagement
- Poor performance increases bounce rates
- Memory issues cause browser crashes
- Network failures affect productivity

**Business Impact:**
- Performance affects conversion rates
- Slow apps reduce user adoption
- High resource usage increases costs
- Poor performance damages brand reputation

## 2. Hands-On Implementation (120 minutes)

### Exercise 1: Bundle Optimization and Lazy Loading (40 minutes)

**Enhanced UI5 Build Configuration:**
```yaml
# Enhanced ui5.yaml
specVersion: "4.0"
metadata:
  name: fioriapppracticejob
type: application
builder:
  settings:
    generateSourceMaps: true
    minify: true
    generateManifestBundle: true
    generateFlexChangesBundle: true
    generateComponentPreload: true
    generateStandaloneAppBundle: true
    generateCachebusterInfo: true
  customTasks:
    - name: ui5-task-zipper
      afterTask: generateCachebusterInfo
    - name: ui5-task-minify-xml
      afterTask: replaceVersion
```

**Lazy Loading Service:**
```javascript
// webapp/service/LazyLoader.js
sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.LazyLoader", {
        
        constructor: function() {
            this._mLoadedModules = new Map();
            this._mLoadingPromises = new Map();
            this._setupIntersectionObserver();
        },
        
        loadModule: function(sModuleName) {
            if (this._mLoadedModules.has(sModuleName)) {
                return Promise.resolve(this._mLoadedModules.get(sModuleName));
            }
            
            if (this._mLoadingPromises.has(sModuleName)) {
                return this._mLoadingPromises.get(sModuleName);
            }
            
            var oPromise = new Promise(function(resolve, reject) {
                sap.ui.require([sModuleName], function(Module) {
                    this._mLoadedModules.set(sModuleName, Module);
                    this._mLoadingPromises.delete(sModuleName);
                    resolve(Module);
                }.bind(this), function(oError) {
                    this._mLoadingPromises.delete(sModuleName);
                    reject(oError);
                }.bind(this));
            }.bind(this));
            
            this._mLoadingPromises.set(sModuleName, oPromise);
            return oPromise;
        },
        
        loadView: function(sViewName, sControllerName) {
            return Promise.all([
                this.loadModule("com/productapp/view/" + sViewName),
                sControllerName ? this.loadModule("com/productapp/controller/" + sControllerName) : Promise.resolve()
            ]).then(function(aResults) {
                return aResults[0];
            });
        },
        
        loadFragment: function(sFragmentName) {
            return sap.ui.core.Fragment.load({
                name: "com.productapp.fragment." + sFragmentName,
                type: "XML"
            });
        },
        
        preloadCriticalModules: function() {
            var aCriticalModules = [
                "com/productapp/controller/Master",
                "com/productapp/controller/Detail",
                "com/productapp/model/formatter"
            ];
            
            return Promise.all(aCriticalModules.map(function(sModule) {
                return this.loadModule(sModule);
            }.bind(this)));
        },
        
        _setupIntersectionObserver: function() {
            if (!window.IntersectionObserver) return;
            
            this._oObserver = new IntersectionObserver(function(aEntries) {
                aEntries.forEach(function(oEntry) {
                    if (oEntry.isIntersecting) {
                        var sModule = oEntry.target.dataset.lazyModule;
                        if (sModule) {
                            this.loadModule(sModule);
                            this._oObserver.unobserve(oEntry.target);
                        }
                    }
                }.bind(this));
            }.bind(this), {
                rootMargin: "50px"
            });
        },
        
        observeElement: function(oElement, sModuleName) {
            if (this._oObserver && oElement.getDomRef) {
                var oDomRef = oElement.getDomRef();
                if (oDomRef) {
                    oDomRef.dataset.lazyModule = sModuleName;
                    this._oObserver.observe(oDomRef);
                }
            }
        }
    });
});
```

**Performance Monitoring Service:**
```javascript
// webapp/service/PerformanceMonitor.js
sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.PerformanceMonitor", {
        
        constructor: function() {
            this._aMetrics = [];
            this._mTimers = new Map();
            this._setupPerformanceObserver();
        },
        
        startTimer: function(sName) {
            this._mTimers.set(sName, performance.now());
        },
        
        endTimer: function(sName) {
            var fStartTime = this._mTimers.get(sName);
            if (fStartTime) {
                var fDuration = performance.now() - fStartTime;
                this._mTimers.delete(sName);
                
                this._recordMetric({
                    name: sName,
                    type: "timer",
                    duration: fDuration,
                    timestamp: Date.now()
                });
                
                return fDuration;
            }
            return 0;
        },
        
        measureFunction: function(fnFunction, sName) {
            return function() {
                this.startTimer(sName);
                var result = fnFunction.apply(this, arguments);
                
                if (result && typeof result.then === "function") {
                    return result.finally(function() {
                        this.endTimer(sName);
                    }.bind(this));
                } else {
                    this.endTimer(sName);
                    return result;
                }
            }.bind(this);
        },
        
        recordMemoryUsage: function() {
            if (performance.memory) {
                this._recordMetric({
                    name: "memory",
                    type: "memory",
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });
            }
        },
        
        recordNetworkMetric: function(sUrl, fDuration, iSize) {
            this._recordMetric({
                name: "network",
                type: "network",
                url: sUrl,
                duration: fDuration,
                size: iSize,
                timestamp: Date.now()
            });
        },
        
        _setupPerformanceObserver: function() {
            if (!window.PerformanceObserver) return;
            
            // Observe navigation timing
            var oNavObserver = new PerformanceObserver(function(oList) {
                oList.getEntries().forEach(function(oEntry) {
                    this._recordMetric({
                        name: "navigation",
                        type: "navigation",
                        domContentLoaded: oEntry.domContentLoadedEventEnd - oEntry.domContentLoadedEventStart,
                        loadComplete: oEntry.loadEventEnd - oEntry.loadEventStart,
                        timestamp: Date.now()
                    });
                }.bind(this));
            }.bind(this));
            
            oNavObserver.observe({ entryTypes: ["navigation"] });
            
            // Observe resource timing
            var oResourceObserver = new PerformanceObserver(function(oList) {
                oList.getEntries().forEach(function(oEntry) {
                    this.recordNetworkMetric(
                        oEntry.name,
                        oEntry.responseEnd - oEntry.requestStart,
                        oEntry.transferSize
                    );
                }.bind(this));
            }.bind(this));
            
            oResourceObserver.observe({ entryTypes: ["resource"] });
        },
        
        _recordMetric: function(oMetric) {
            this._aMetrics.push(oMetric);
            
            // Limit metrics array size
            if (this._aMetrics.length > 1000) {
                this._aMetrics.shift();
            }
            
            // Send to analytics if in production
            if (this._isProduction()) {
                this._sendToAnalytics(oMetric);
            }
        },
        
        getMetrics: function(sType) {
            if (sType) {
                return this._aMetrics.filter(function(oMetric) {
                    return oMetric.type === sType;
                });
            }
            return this._aMetrics.slice();
        },
        
        getAverageMetric: function(sName, sType) {
            var aMetrics = this._aMetrics.filter(function(oMetric) {
                return oMetric.name === sName && oMetric.type === sType;
            });
            
            if (aMetrics.length === 0) return 0;
            
            var fSum = aMetrics.reduce(function(sum, oMetric) {
                return sum + (oMetric.duration || 0);
            }, 0);
            
            return fSum / aMetrics.length;
        },
        
        generateReport: function() {
            return {
                summary: {
                    totalMetrics: this._aMetrics.length,
                    averageLoadTime: this.getAverageMetric("navigation", "navigation"),
                    memoryUsage: this._getLatestMemoryUsage(),
                    networkRequests: this.getMetrics("network").length
                },
                details: {
                    timers: this.getMetrics("timer"),
                    memory: this.getMetrics("memory"),
                    network: this.getMetrics("network")
                }
            };
        },
        
        _getLatestMemoryUsage: function() {
            var aMemoryMetrics = this.getMetrics("memory");
            return aMemoryMetrics.length > 0 ? aMemoryMetrics[aMemoryMetrics.length - 1] : null;
        },
        
        _isProduction: function() {
            return window.location.hostname !== "localhost";
        },
        
        _sendToAnalytics: function(oMetric) {
            // Send to analytics service
            if (navigator.sendBeacon) {
                navigator.sendBeacon("/api/analytics", JSON.stringify(oMetric));
            }
        }
    });
});
```

### Exercise 2: Memory Management and Optimization (40 minutes)

**Memory Manager Service:**
```javascript
// webapp/service/MemoryManager.js
sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.MemoryManager", {
        
        constructor: function() {
            this._aCleanupTasks = [];
            this._mObjectRegistry = new Map();
            this._setupMemoryMonitoring();
        },
        
        registerObject: function(oObject, sType) {
            var sId = this._generateId();
            this._mObjectRegistry.set(sId, {
                object: oObject,
                type: sType,
                created: Date.now()
            });
            return sId;
        },
        
        unregisterObject: function(sId) {
            this._mObjectRegistry.delete(sId);
        },
        
        addCleanupTask: function(fnCleanup) {
            this._aCleanupTasks.push(fnCleanup);
        },
        
        executeCleanup: function() {
            this._aCleanupTasks.forEach(function(fnCleanup) {
                try {
                    fnCleanup();
                } catch (e) {
                    console.error("Cleanup task failed:", e);
                }
            });
            this._aCleanupTasks = [];
        },
        
        _setupMemoryMonitoring: function() {
            // Monitor memory usage every 30 seconds
            setInterval(function() {
                this._checkMemoryUsage();
            }.bind(this), 30000);
            
            // Monitor for memory leaks
            setInterval(function() {
                this._detectMemoryLeaks();
            }.bind(this), 60000);
        },
        
        _checkMemoryUsage: function() {
            if (!performance.memory) return;
            
            var fUsedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
            var fLimitMB = performance.memory.jsHeapSizeLimit / 1024 / 1024;
            var fUsagePercent = (fUsedMB / fLimitMB) * 100;
            
            if (fUsagePercent > 80) {
                console.warn("High memory usage detected:", fUsedMB.toFixed(2), "MB");
                this._triggerGarbageCollection();
            }
        },
        
        _detectMemoryLeaks: function() {
            var iCurrentObjects = this._mObjectRegistry.size;
            var iOldObjects = 0;
            var iThreshold = Date.now() - (5 * 60 * 1000); // 5 minutes ago
            
            this._mObjectRegistry.forEach(function(oEntry) {
                if (oEntry.created < iThreshold) {
                    iOldObjects++;
                }
            });
            
            if (iOldObjects > 100) {
                console.warn("Potential memory leak detected:", iOldObjects, "old objects");
                this._reportMemoryLeak(iOldObjects);
            }
        },
        
        _triggerGarbageCollection: function() {
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            // Execute cleanup tasks
            this.executeCleanup();
        },
        
        _reportMemoryLeak: function(iObjectCount) {
            // Report memory leak to monitoring service
            var oReport = {
                type: "memory_leak",
                objectCount: iObjectCount,
                memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
                timestamp: Date.now()
            };
            
            // Send to monitoring
            this._sendToMonitoring(oReport);
        },
        
        _generateId: function() {
            return "obj_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        },
        
        _sendToMonitoring: function(oData) {
            // Implementation for sending to monitoring service
            console.log("Memory monitoring data:", oData);
        },
        
        getMemoryReport: function() {
            return {
                registeredObjects: this._mObjectRegistry.size,
                cleanupTasks: this._aCleanupTasks.length,
                memoryUsage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null
            };
        }
    });
});
```

### Exercise 3: Caching and Resource Optimization (40 minutes)

**Cache Manager Service:**
```javascript
// webapp/service/CacheManager.js
sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.CacheManager", {
        
        constructor: function() {
            this._mMemoryCache = new Map();
            this._mCacheConfig = new Map();
            this._setupServiceWorker();
        },
        
        set: function(sKey, oData, mOptions) {
            mOptions = mOptions || {};
            
            var oCacheEntry = {
                data: oData,
                timestamp: Date.now(),
                ttl: mOptions.ttl || 300000, // 5 minutes default
                size: this._calculateSize(oData)
            };
            
            this._mMemoryCache.set(sKey, oCacheEntry);
            this._mCacheConfig.set(sKey, mOptions);
            
            // Store in localStorage if persistent
            if (mOptions.persistent) {
                try {
                    localStorage.setItem("cache_" + sKey, JSON.stringify(oCacheEntry));
                } catch (e) {
                    console.warn("Failed to store in localStorage:", e);
                }
            }
            
            // Cleanup expired entries
            this._cleanupExpired();
        },
        
        get: function(sKey) {
            var oCacheEntry = this._mMemoryCache.get(sKey);
            
            if (!oCacheEntry) {
                // Try localStorage
                oCacheEntry = this._getFromLocalStorage(sKey);
                if (oCacheEntry) {
                    this._mMemoryCache.set(sKey, oCacheEntry);
                }
            }
            
            if (oCacheEntry && this._isValid(oCacheEntry)) {
                return oCacheEntry.data;
            }
            
            // Remove expired entry
            this.remove(sKey);
            return null;
        },
        
        remove: function(sKey) {
            this._mMemoryCache.delete(sKey);
            this._mCacheConfig.delete(sKey);
            localStorage.removeItem("cache_" + sKey);
        },
        
        clear: function() {
            this._mMemoryCache.clear();
            this._mCacheConfig.clear();
            
            // Clear localStorage cache entries
            Object.keys(localStorage).forEach(function(sKey) {
                if (sKey.startsWith("cache_")) {
                    localStorage.removeItem(sKey);
                }
            });
        },
        
        _getFromLocalStorage: function(sKey) {
            try {
                var sData = localStorage.getItem("cache_" + sKey);
                return sData ? JSON.parse(sData) : null;
            } catch (e) {
                return null;
            }
        },
        
        _isValid: function(oCacheEntry) {
            return (Date.now() - oCacheEntry.timestamp) < oCacheEntry.ttl;
        },
        
        _calculateSize: function(oData) {
            return JSON.stringify(oData).length;
        },
        
        _cleanupExpired: function() {
            var that = this;
            this._mMemoryCache.forEach(function(oCacheEntry, sKey) {
                if (!that._isValid(oCacheEntry)) {
                    that.remove(sKey);
                }
            });
        },
        
        _setupServiceWorker: function() {
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.register("/sw.js").then(function(registration) {
                    console.log("Service Worker registered:", registration);
                }).catch(function(error) {
                    console.log("Service Worker registration failed:", error);
                });
            }
        },
        
        getCacheStats: function() {
            var iTotalSize = 0;
            var iValidEntries = 0;
            var iExpiredEntries = 0;
            
            this._mMemoryCache.forEach(function(oCacheEntry) {
                iTotalSize += oCacheEntry.size;
                if (this._isValid(oCacheEntry)) {
                    iValidEntries++;
                } else {
                    iExpiredEntries++;
                }
            }.bind(this));
            
            return {
                totalEntries: this._mMemoryCache.size,
                validEntries: iValidEntries,
                expiredEntries: iExpiredEntries,
                totalSize: iTotalSize
            };
        }
    });
});
```

## 3. Practical Exercises (60 minutes)

### Challenge 1: Bundle Size Optimization (20 minutes)
Reduce initial bundle size by 50% using code splitting

### Challenge 2: Runtime Performance Optimization (20 minutes)
Optimize list rendering for 10,000+ items

### Challenge 3: Memory Leak Detection (20 minutes)
Build automated memory leak detection system

## 4. Integration with Official Resources

### UI5 SDK References
- **Performance**: https://ui5.sap.com/topic/408b40efed3c416681e1bd8cdd8910d4
- **Bundle Optimization**: https://ui5.sap.com/topic/91f0c3ee6f4d1014b6dd926db0e91070

## Module Assessment

**Knowledge Check:**
1. Optimize bundle size and loading performance
2. Implement memory management strategies
3. Create caching and resource optimization
4. Build performance monitoring systems

**Practical Assessment:**
1. Reduce application load time by 50%
2. Implement comprehensive caching strategy
3. Build memory leak detection system
4. Create performance monitoring dashboard

## Next Module Preview

**Module 13: Testing Strategies (Unit, Integration & E2E Testing)**
- QUnit unit testing framework and best practices
- OPA5 integration testing for user workflows
- End-to-end testing with modern tools
- Test automation and CI/CD integration
