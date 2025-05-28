# Module 1 Hands-On Exercises: UI5 Architecture Fundamentals

## Exercise Set A: Component Architecture Deep Dive

### Exercise A1: Component Lifecycle Tracing (30 minutes)

**Objective**: Understand the complete component initialization flow

**Setup Instructions:**
1. Open your project in VS Code
2. Open browser developer tools
3. Navigate to Sources tab and enable breakpoints

**Implementation Steps:**

**Step 1: Add Lifecycle Logging**
```javascript
// Modify webapp/Component.js
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/productapp/model/models",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models, JSONModel) {
    "use strict";

    return UIComponent.extend("com.productapp.Component", {
        metadata: {
            manifest: "json"
        },

        constructor: function() {
            console.log("🏗️ Component constructor called");
            UIComponent.prototype.constructor.apply(this, arguments);
        },

        init: function() {
            console.log("🚀 Component init started");
            console.time("Component Initialization");
            
            // Call parent init
            console.log("📞 Calling parent init");
            UIComponent.prototype.init.apply(this, arguments);
            console.log("✅ Parent init completed");
            
            // Set device model
            console.log("📱 Setting device model");
            this.setModel(models.createDeviceModel(), "device");
            console.log("✅ Device model set");
            
            // Initialize router
            console.log("🧭 Initializing router");
            this.getRouter().initialize();
            console.log("✅ Router initialized");
            
            // Set products model
            console.log("📦 Setting products model");
            var oProductsModel = new JSONModel(this.getManifestEntry("sap.app").dataSources.productsData.uri);
            this.setModel(oProductsModel, "products");
            console.log("✅ Products model set");
            
            console.timeEnd("Component Initialization");
            console.log("🎉 Component initialization completed");
        },

        destroy: function() {
            console.log("💥 Component destroy called");
            UIComponent.prototype.destroy.apply(this, arguments);
        }
    });
});
```

**Step 2: Add Model Loading Monitoring**
```javascript
// Add to Component.js init method after products model creation
oProductsModel.attachRequestCompleted(function() {
    console.log("📊 Products data loaded successfully");
    console.log("Data:", oProductsModel.getData());
});

oProductsModel.attachRequestFailed(function(oEvent) {
    console.error("❌ Products data loading failed:", oEvent.getParameters());
});
```

**Step 3: Monitor Router Events**
```javascript
// Add to Component.js init method after router initialization
this.getRouter().attachRouteMatched(function(oEvent) {
    console.log("🎯 Route matched:", oEvent.getParameter("name"));
});

this.getRouter().attachRoutePatternMatched(function(oEvent) {
    console.log("🔍 Route pattern matched:", oEvent.getParameter("name"));
});
```

**Expected Learning Outcomes:**
- Understand the exact order of component initialization
- See how models are loaded and attached
- Observe router initialization and event flow
- Measure initialization performance

**Verification Steps:**
1. Refresh the application
2. Check browser console for the logged sequence
3. Note the timing of each step
4. Verify all models are properly loaded

### Exercise A2: Manifest Configuration Exploration (25 minutes)

**Objective**: Understand how manifest.json controls application behavior

**Task 1: Add New Data Source**
```json
// Add to webapp/manifest.json in sap.app.dataSources
"categoriesData": {
    "uri": "localService/mockdata/categories.json",
    "type": "JSON"
},
"suppliersData": {
    "uri": "localService/mockdata/suppliers.json",
    "type": "JSON"
}
```

**Task 2: Create Mock Data Files**
```json
// Create webapp/localService/mockdata/categories.json
[
    {
        "CategoryID": "1",
        "Name": "Electronics",
        "Description": "Electronic devices and gadgets",
        "Icon": "sap-icon://laptop"
    },
    {
        "CategoryID": "2", 
        "Name": "Mobile Devices",
        "Description": "Smartphones and tablets",
        "Icon": "sap-icon://iphone"
    },
    {
        "CategoryID": "3",
        "Name": "Audio",
        "Description": "Audio equipment and accessories",
        "Icon": "sap-icon://sound"
    }
]
```

```json
// Create webapp/localService/mockdata/suppliers.json
[
    {
        "SupplierID": "1",
        "Name": "Dell Technologies",
        "Country": "USA",
        "Rating": 4.5,
        "ContactEmail": "contact@dell.com"
    },
    {
        "SupplierID": "2",
        "Name": "Samsung Electronics", 
        "Country": "South Korea",
        "Rating": 4.7,
        "ContactEmail": "contact@samsung.com"
    }
]
```

**Task 3: Configure Models in Manifest**
```json
// Add to webapp/manifest.json in sap.ui5.models
"categories": {
    "dataSource": "categoriesData",
    "type": "sap.ui.model.json.JSONModel"
},
"suppliers": {
    "dataSource": "suppliersData", 
    "type": "sap.ui.model.json.JSONModel"
}
```

**Task 4: Access Models in Component**
```javascript
// Modify Component.js to log all available models
init: function() {
    // ... existing code ...
    
    // Log all configured models
    console.log("📋 Available models:");
    var oManifest = this.getManifestEntry("sap.ui5");
    Object.keys(oManifest.models || {}).forEach(function(sModelName) {
        console.log(`  - ${sModelName}:`, oManifest.models[sModelName]);
    });
    
    // Access models after they're loaded
    setTimeout(() => {
        console.log("🔍 Model instances:");
        console.log("  - products:", this.getModel("products"));
        console.log("  - categories:", this.getModel("categories"));
        console.log("  - suppliers:", this.getModel("suppliers"));
        console.log("  - device:", this.getModel("device"));
        console.log("  - i18n:", this.getModel("i18n"));
    }, 1000);
}
```

**Verification:**
1. Check console for model configuration logs
2. Verify new JSON files are accessible
3. Test model data availability in views

### Exercise A3: Bootstrap Configuration Experiments (20 minutes)

**Objective**: Understand how bootstrap parameters affect application behavior

**Task 1: Theme Switching**
```html
<!-- Create multiple index files for comparison -->
<!-- index-fiori3.html -->
<script id="sap-ui-bootstrap"
    src="https://ui5.sap.com/resources/sap-ui-core.js"
    data-sap-ui-theme="sap_fiori_3"
    data-sap-ui-resourceroots='{"com.productapp": "./"}'
    data-sap-ui-oninit="module:sap/ui/core/ComponentSupport"
    data-sap-ui-async="true">
</script>

<!-- index-belize.html -->
<script id="sap-ui-bootstrap"
    src="https://ui5.sap.com/resources/sap-ui-core.js"
    data-sap-ui-theme="sap_belize"
    data-sap-ui-resourceroots='{"com.productapp": "./"}'
    data-sap-ui-oninit="module:sap/ui/core/ComponentSupport"
    data-sap-ui-async="true">
</script>

<!-- index-dark.html -->
<script id="sap-ui-bootstrap"
    src="https://ui5.sap.com/resources/sap-ui-core.js"
    data-sap-ui-theme="sap_fiori_3_dark"
    data-sap-ui-resourceroots='{"com.productapp": "./"}'
    data-sap-ui-oninit="module:sap/ui/core/ComponentSupport"
    data-sap-ui-async="true">
</script>
```

**Task 2: Performance Comparison**
```html
<!-- index-sync.html (for comparison only) -->
<script id="sap-ui-bootstrap"
    src="https://ui5.sap.com/resources/sap-ui-core.js"
    data-sap-ui-theme="sap_fiori_3"
    data-sap-ui-resourceroots='{"com.productapp": "./"}'
    data-sap-ui-oninit="module:sap/ui/core/ComponentSupport"
    data-sap-ui-async="false">
</script>
```

**Task 3: Measure Loading Performance**
```javascript
// Add to Component.js constructor
constructor: function() {
    window.componentStartTime = performance.now();
    console.log("⏱️ Component construction started at:", window.componentStartTime);
    UIComponent.prototype.constructor.apply(this, arguments);
},

init: function() {
    var initStartTime = performance.now();
    console.log("⏱️ Init started at:", initStartTime);
    
    // ... existing init code ...
    
    var initEndTime = performance.now();
    console.log("⏱️ Init completed at:", initEndTime);
    console.log("📊 Total init time:", initEndTime - initStartTime, "ms");
    console.log("📊 Total component time:", initEndTime - window.componentStartTime, "ms");
}
```

**Comparison Tasks:**
1. Load each theme variant and compare visual differences
2. Measure loading times with async vs sync
3. Use browser Performance tab to analyze loading waterfall
4. Document performance differences

## Exercise Set B: Debugging and Troubleshooting

### Exercise B1: Intentional Error Introduction and Resolution (25 minutes)

**Objective**: Learn to identify and fix common architectural issues

**Scenario 1: Missing Dependency**
```javascript
// Modify Component.js - comment out models import
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    // "com/productapp/model/models", // ❌ Comment this out
    "sap/ui/model/json/JSONModel"
], function(UIComponent, Device, /* models, */ JSONModel) {
    // This will cause an error when trying to use models.createDeviceModel()
});
```

**Expected Error:** `models is not defined`

**Resolution Steps:**
1. Check browser console for error message
2. Identify the missing dependency
3. Uncomment the models import
4. Verify the fix works

**Scenario 2: Incorrect Namespace**
```json
// Modify manifest.json - change app ID
"sap.app": {
    "id": "com.wrongnamespace", // ❌ Should be com.productapp
    "type": "application"
}
```

**Expected Error:** Module loading failures

**Resolution Steps:**
1. Observe 404 errors in Network tab
2. Check namespace consistency
3. Correct the app ID
4. Verify all resources load correctly

**Scenario 3: Malformed JSON**
```json
// Introduce syntax error in products.json
[
  {
    "ProductID": "1",
    "Name": "Laptop XPS 15",
    "Price": 1299.99, // ❌ Add extra comma
  }
]
```

**Expected Error:** JSON parsing error

**Resolution Steps:**
1. Check console for JSON syntax errors
2. Validate JSON syntax
3. Fix the malformed JSON
4. Verify data loads correctly

### Exercise B2: Architecture Enhancement Implementation (30 minutes)

**Objective**: Improve the existing architecture with best practices

**Enhancement 1: Environment Configuration**
```javascript
// Add to Component.js
_getEnvironmentConfig: function() {
    var sHost = window.location.hostname;
    
    if (sHost === "localhost" || sHost === "127.0.0.1") {
        return {
            environment: "development",
            serviceUrl: "localService/mockdata/",
            debug: true,
            logLevel: "DEBUG"
        };
    } else if (sHost.includes("test")) {
        return {
            environment: "test",
            serviceUrl: "/api/test/",
            debug: true,
            logLevel: "INFO"
        };
    } else {
        return {
            environment: "production",
            serviceUrl: "/api/",
            debug: false,
            logLevel: "ERROR"
        };
    }
},

init: function() {
    // Get environment configuration
    this._oConfig = this._getEnvironmentConfig();
    console.log("🌍 Environment:", this._oConfig.environment);
    
    // Set debug mode
    if (this._oConfig.debug) {
        jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG);
    }
    
    // ... rest of init code ...
}
```

**Enhancement 2: Global Error Handling**
```javascript
// Add to Component.js init method
_setupGlobalErrorHandling: function() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('🚨 Unhandled promise rejection:', event.reason);
        // In production, send to logging service
        if (this._oConfig.environment === "production") {
            // this._sendErrorToLoggingService(event.reason);
        }
    }.bind(this));
    
    // Handle general JavaScript errors
    window.addEventListener('error', function(event) {
        console.error('🚨 JavaScript error:', event.error);
        if (this._oConfig.environment === "production") {
            // this._sendErrorToLoggingService(event.error);
        }
    }.bind(this));
},

init: function() {
    // ... existing code ...
    this._setupGlobalErrorHandling();
}
```

**Enhancement 3: Performance Monitoring**
```javascript
// Add to Component.js
_setupPerformanceMonitoring: function() {
    if (this._oConfig.debug) {
        // Enable UI5 performance measurements
        window["sap-ui-measure"] = true;
        
        // Log performance after initialization
        setTimeout(() => {
            sap.ui.require(["sap/ui/performance/Measurement"], function(Measurement) {
                var aMeasurements = Measurement.getAllMeasurements();
                console.log("📊 Performance measurements:", aMeasurements);
            });
        }, 2000);
    }
},

init: function() {
    // ... existing code ...
    this._setupPerformanceMonitoring();
}
```

**Verification Tasks:**
1. Test different environment configurations
2. Trigger errors to test error handling
3. Monitor performance measurements
4. Verify logging works correctly

## Exercise Set C: Advanced Architecture Patterns

### Exercise C1: Lazy Loading Implementation (20 minutes)

**Objective**: Implement lazy loading for better performance

**Task 1: Modify Routing for Lazy Loading**
```json
// Update manifest.json routing configuration
"routes": [
    {
        "pattern": "",
        "name": "master",
        "target": ["master", "detail"]
    },
    {
        "pattern": "product/{productId}",
        "name": "detail", 
        "target": ["master", "detail"]
    },
    {
        "pattern": "create",
        "name": "create",
        "target": "create",
        "lazy": true
    },
    {
        "pattern": "edit/{productId}",
        "name": "edit",
        "target": "edit", 
        "lazy": true
    }
]
```

**Task 2: Implement Dynamic View Loading**
```javascript
// Create webapp/controller/LazyLoader.js
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";
    
    return {
        loadView: function(sViewName) {
            return new Promise(function(resolve, reject) {
                sap.ui.require([
                    "com/productapp/view/" + sViewName,
                    "com/productapp/controller/" + sViewName
                ], function(View, Controller) {
                    resolve({
                        view: View,
                        controller: Controller
                    });
                }, reject);
            });
        }
    };
});
```

**Verification:**
1. Monitor Network tab for lazy-loaded resources
2. Measure initial loading time improvement
3. Test navigation to lazy-loaded views

## Assessment and Next Steps

### Knowledge Verification Checklist
- [ ] Can explain component initialization flow
- [ ] Understands manifest.json configuration impact
- [ ] Can debug common loading issues
- [ ] Has implemented architecture enhancements
- [ ] Can measure and optimize performance

### Practical Skills Demonstrated
- [ ] Added comprehensive logging to component
- [ ] Created and configured new data sources
- [ ] Implemented error handling patterns
- [ ] Enhanced architecture with best practices
- [ ] Measured and analyzed performance

### Common Mistakes to Avoid
1. **Forgetting to call parent methods** in lifecycle hooks
2. **Hardcoding configuration** instead of using environment-based config
3. **Not handling errors** in async operations
4. **Memory leaks** from unregistered event handlers
5. **Performance issues** from synchronous loading

### Preparation for Module 2
- Review MVC pattern concepts
- Understand view technologies (XML, JS, HTML)
- Prepare for controller lifecycle deep dive
- Set up debugging tools for view/controller analysis
