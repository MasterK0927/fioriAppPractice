# SAP UI5/Fiori Troubleshooting Compendium

## Common Issues, Root Causes, Impacts, and Resolution Strategies

### Category 1: Application Loading and Bootstrap Issues

#### Issue 1.1: Application Fails to Load - Blank Screen

**Symptoms:**
- White/blank screen on application startup
- No error messages visible
- Browser shows "Loading..." indefinitely

**Root Causes:**
1. **Incorrect Bootstrap Configuration**
   ```html
   <!-- ❌ Wrong: Missing or incorrect resource roots -->
   <script data-sap-ui-resourceroots='{"com.wrongnamespace": "./"}'></script>
   
   <!-- ✅ Correct: Proper namespace mapping -->
   <script data-sap-ui-resourceroots='{"com.productapp": "./"}'></script>
   ```

2. **Component Loading Failure**
   ```javascript
   // ❌ Wrong: Incorrect component name in index.html
   <div data-name="com.wrongnamespace"></div>
   
   // ✅ Correct: Matches manifest.json app ID
   <div data-name="com.productapp"></div>
   ```

3. **Missing or Corrupted Manifest**
   ```json
   // ❌ Wrong: Malformed JSON
   {
     "sap.app": {
       "id": "com.productapp",
       "type": "application", // ❌ Missing closing quote
     }
   }
   ```

**Impact Analysis:**
- **User Experience**: Complete application failure, no functionality available
- **Business Impact**: Zero productivity, potential revenue loss
- **Development Impact**: Blocks all testing and development activities

**Resolution Strategy:**
```javascript
// Step 1: Enable debug mode for detailed error information
window["sap-ui-debug"] = true;

// Step 2: Check browser console for specific errors
// Step 3: Validate manifest.json syntax
// Step 4: Verify namespace consistency across files

// Step 5: Add component loading error handling
sap.ui.getCore().attachInit(function() {
    try {
        new sap.ui.core.ComponentContainer({
            name: "com.productapp",
            settings: {
                id: "productapp"
            }
        }).placeAt("content");
    } catch (oError) {
        console.error("Component loading failed:", oError);
        document.body.innerHTML = "<h1>Application Loading Failed</h1><p>" + oError.message + "</p>";
    }
});
```

#### Issue 1.2: Module Loading Failures (404 Errors)

**Symptoms:**
- Console shows 404 errors for .js files
- "Failed to load module" error messages
- Partial application loading

**Root Causes:**
1. **Incorrect File Paths**
   ```javascript
   // ❌ Wrong: Incorrect path in sap.ui.define
   sap.ui.define([
       "com/productapp/controller/WrongPath" // File doesn't exist
   ]);
   ```

2. **Case Sensitivity Issues**
   ```javascript
   // ❌ Wrong: Case mismatch
   sap.ui.define([
       "com/productapp/controller/master" // Should be "Master"
   ]);
   ```

3. **Missing Dependencies**
   ```javascript
   // ❌ Wrong: Using undefined dependency
   sap.ui.define([
       "sap/ui/core/mvc/Controller"
       // Missing: "sap/m/MessageToast"
   ], function(Controller) {
       // MessageToast is undefined here
   });
   ```

**Resolution Strategy:**
```javascript
// Systematic dependency checking
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/productapp/model/formatter"
], function(Controller, MessageToast, MessageBox, formatter) {
    "use strict";
    
    // Verify all dependencies are loaded
    console.assert(Controller, "Controller not loaded");
    console.assert(MessageToast, "MessageToast not loaded");
    console.assert(MessageBox, "MessageBox not loaded");
    console.assert(formatter, "formatter not loaded");
    
    return Controller.extend("com.productapp.controller.Master", {
        // Controller implementation
    });
});
```

### Category 2: Data Binding and Model Issues

#### Issue 2.1: Data Not Displaying in Views

**Symptoms:**
- Empty lists or tables
- Placeholder text showing instead of data
- Binding expressions visible as literal text

**Root Causes:**
1. **Model Not Set or Incorrectly Named**
   ```javascript
   // ❌ Wrong: Model not set on view
   var oModel = new JSONModel(data);
   // Missing: this.getView().setModel(oModel, "products");
   ```

2. **Incorrect Binding Syntax**
   ```xml
   <!-- ❌ Wrong: Missing model name -->
   <Text text="{/Name}" />
   
   <!-- ✅ Correct: With model name -->
   <Text text="{products>/Name}" />
   ```

3. **Asynchronous Loading Issues**
   ```javascript
   // ❌ Wrong: Trying to access data before it's loaded
   var oModel = new JSONModel("data.json");
   this.getView().setModel(oModel, "products");
   console.log(oModel.getData()); // May be empty if not loaded yet
   ```

**Resolution Strategy:**
```javascript
// Proper model setup with loading verification
_setupProductsModel: function() {
    var oModel = new JSONModel();
    
    // Set model first
    this.getView().setModel(oModel, "products");
    
    // Load data with proper error handling
    oModel.loadData("localService/mockdata/products.json")
        .then(() => {
            console.log("✅ Products data loaded:", oModel.getData());
            this._onDataLoaded();
        })
        .catch((oError) => {
            console.error("❌ Failed to load products:", oError);
            this._showErrorMessage("Failed to load product data");
        });
},

_onDataLoaded: function() {
    // Verify data is available for binding
    var oList = this.byId("productList");
    var oBinding = oList.getBinding("items");
    
    if (oBinding) {
        console.log("📊 Binding has", oBinding.getLength(), "items");
    }
}
```

#### Issue 2.2: Two-Way Binding Not Working

**Symptoms:**
- Changes in input fields don't update model
- Model changes don't reflect in UI
- Form validation not triggering

**Root Causes:**
1. **Missing Two-Way Binding Configuration**
   ```xml
   <!-- ❌ Wrong: One-way binding (default) -->
   <Input value="{products>/Name}" />
   
   <!-- ✅ Correct: Two-way binding -->
   <Input value="{mode: 'TwoWay', path: 'products>/Name'}" />
   ```

2. **Model Type Limitations**
   ```javascript
   // ❌ Wrong: Resource model doesn't support two-way binding
   var oI18nModel = new ResourceModel({bundleName: "i18n.i18n"});
   // Two-way binding won't work with i18n model
   ```

**Resolution Strategy:**
```xml
<!-- Proper two-way binding setup -->
<SimpleForm>
    <Label text="Product Name:" />
    <Input value="{
        path: 'products>/Name',
        mode: 'TwoWay'
    }" />
    
    <Label text="Price:" />
    <Input value="{
        path: 'products>/Price',
        mode: 'TwoWay',
        type: 'sap.ui.model.type.Float'
    }" />
</SimpleForm>
```

### Category 3: Routing and Navigation Issues

#### Issue 3.1: Navigation Not Working

**Symptoms:**
- URL changes but view doesn't update
- Browser back button not working
- Deep links not loading correct view

**Root Causes:**
1. **Router Not Initialized**
   ```javascript
   // ❌ Wrong: Forgot to initialize router
   onInit: function() {
       this.oRouter = this.getOwnerComponent().getRouter();
       // Missing: this.oRouter.initialize();
   }
   ```

2. **Incorrect Route Configuration**
   ```json
   // ❌ Wrong: Route pattern doesn't match navigation
   "routes": [{
       "pattern": "product/{id}", // Pattern expects "id"
       "name": "detail"
   }]
   ```
   
   ```javascript
   // ❌ Wrong: Navigation uses different parameter name
   this.oRouter.navTo("detail", {
       productId: sId // Should be "id" to match pattern
   });
   ```

**Resolution Strategy:**
```javascript
// Comprehensive routing setup with debugging
onInit: function() {
    this.oRouter = this.getOwnerComponent().getRouter();
    
    // Add route debugging
    this.oRouter.attachRouteMatched(this._onRouteMatched, this);
    this.oRouter.attachRoutePatternMatched(this._onRoutePatternMatched, this);
    this.oRouter.attachBypassed(this._onBypassed, this);
    
    // Initialize router
    this.oRouter.initialize();
},

_onRouteMatched: function(oEvent) {
    console.log("🎯 Route matched:", oEvent.getParameter("name"));
},

_onRoutePatternMatched: function(oEvent) {
    console.log("🔍 Route pattern matched:", {
        name: oEvent.getParameter("name"),
        arguments: oEvent.getParameter("arguments")
    });
},

_onBypassed: function(oEvent) {
    console.warn("⚠️ Route bypassed:", oEvent.getParameter("hash"));
}
```

### Category 4: Performance Issues

#### Issue 4.1: Slow Application Loading

**Symptoms:**
- Long initial loading times
- Unresponsive UI during startup
- High memory usage

**Root Causes:**
1. **Synchronous Loading**
   ```html
   <!-- ❌ Wrong: Synchronous loading blocks UI -->
   <script data-sap-ui-async="false"></script>
   ```

2. **Large Data Sets Without Pagination**
   ```javascript
   // ❌ Wrong: Loading all data at once
   var oModel = new JSONModel("largeDataSet.json"); // 10MB file
   ```

3. **Inefficient Binding**
   ```xml
   <!-- ❌ Wrong: Complex expressions in binding -->
   <Text text="{= ${products>/items}.filter(item => item.price > 1000).length}" />
   ```

**Resolution Strategy:**
```javascript
// Performance optimization implementation
_optimizeDataLoading: function() {
    // Implement pagination
    var oModel = new JSONModel();
    this.getView().setModel(oModel, "products");
    
    // Load data in chunks
    this._loadDataChunk(0, 50); // Load first 50 items
},

_loadDataChunk: function(iStart, iLength) {
    var sUrl = `api/products?$skip=${iStart}&$top=${iLength}`;
    
    jQuery.ajax({
        url: sUrl,
        success: (data) => {
            var oModel = this.getView().getModel("products");
            var aExistingData = oModel.getData() || [];
            oModel.setData(aExistingData.concat(data));
        }
    });
},

// Implement virtual scrolling for large lists
_setupVirtualScrolling: function() {
    var oList = this.byId("productList");
    oList.setGrowingThreshold(50);
    oList.setGrowing(true);
}
```

### Category 5: Memory Leaks and Resource Management

#### Issue 5.1: Memory Leaks from Event Handlers

**Symptoms:**
- Increasing memory usage over time
- Application becomes sluggish
- Browser tab crashes after extended use

**Root Causes:**
1. **Unregistered Event Handlers**
   ```javascript
   // ❌ Wrong: Event handler not cleaned up
   onInit: function() {
       jQuery(window).on("resize", this.onResize.bind(this));
       // Missing cleanup in onExit
   }
   ```

2. **Circular References**
   ```javascript
   // ❌ Wrong: Circular reference prevents garbage collection
   onInit: function() {
       this.oDialog = new Dialog();
       this.oDialog.oParent = this; // Circular reference
   }
   ```

**Resolution Strategy:**
```javascript
// Proper resource management
onInit: function() {
    this._aEventHandlers = [];
    this._setupEventHandlers();
},

_setupEventHandlers: function() {
    // Store references for cleanup
    var fnResize = this.onResize.bind(this);
    jQuery(window).on("resize", fnResize);
    this._aEventHandlers.push({
        element: jQuery(window),
        event: "resize",
        handler: fnResize
    });
},

onExit: function() {
    // Clean up all event handlers
    this._aEventHandlers.forEach(function(oHandler) {
        oHandler.element.off(oHandler.event, oHandler.handler);
    });
    this._aEventHandlers = [];
    
    // Destroy dialogs and fragments
    if (this._oDialog) {
        this._oDialog.destroy();
        this._oDialog = null;
    }
}
```

### Category 6: Error Handling and User Experience

#### Issue 6.1: Poor Error User Experience

**Symptoms:**
- Generic error messages
- Application crashes on errors
- No recovery options for users

**Root Causes:**
1. **No Global Error Handling**
2. **Unhandled Promise Rejections**
3. **Poor Error Message Design**

**Resolution Strategy:**
```javascript
// Comprehensive error handling system
_setupErrorHandling: function() {
    // Global error handler
    window.addEventListener('error', this._onGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this._onUnhandledRejection.bind(this));
},

_onGlobalError: function(oEvent) {
    console.error("Global error:", oEvent.error);
    this._showUserFriendlyError("An unexpected error occurred", oEvent.error);
},

_onUnhandledRejection: function(oEvent) {
    console.error("Unhandled promise rejection:", oEvent.reason);
    this._showUserFriendlyError("Operation failed", oEvent.reason);
},

_showUserFriendlyError: function(sUserMessage, oTechnicalError) {
    MessageBox.error(sUserMessage, {
        title: "Error",
        details: this._formatErrorDetails(oTechnicalError),
        actions: [MessageBox.Action.OK, "Retry"],
        onClose: (sAction) => {
            if (sAction === "Retry") {
                this._retryLastOperation();
            }
        }
    });
},

_formatErrorDetails: function(oError) {
    if (typeof oError === "string") return oError;
    if (oError.message) return oError.message;
    return JSON.stringify(oError, null, 2);
}
```

## Debugging Tools and Techniques

### Browser Developer Tools
1. **Console Tab**: Error messages and logging
2. **Network Tab**: Failed resource loading
3. **Sources Tab**: Breakpoint debugging
4. **Performance Tab**: Loading and runtime performance
5. **Memory Tab**: Memory leak detection

### UI5-Specific Debugging
```javascript
// Enable UI5 debug mode
window["sap-ui-debug"] = true;

// Access UI5 core for debugging
sap.ui.getCore().byId("componentId");

// Performance measurements
window["sap-ui-measure"] = true;
sap.ui.require(["sap/ui/performance/Measurement"], function(Measurement) {
    console.log(Measurement.getAllMeasurements());
});
```

### Systematic Debugging Approach
1. **Reproduce the Issue**: Create minimal test case
2. **Check Console**: Look for error messages and warnings
3. **Verify Configuration**: Check manifest.json and bootstrap
4. **Test Incrementally**: Comment out code sections to isolate
5. **Use Breakpoints**: Step through code execution
6. **Validate Data**: Check model data and binding paths
7. **Test in Isolation**: Create simple test cases

## Prevention Strategies

### Code Quality Measures
- Use ESLint with UI5-specific rules
- Implement code reviews
- Write unit tests for critical functions
- Use TypeScript for better type safety

### Performance Monitoring
- Regular performance audits with Lighthouse
- Memory usage monitoring
- Bundle size analysis
- Loading time measurements

### Error Prevention
- Input validation at all entry points
- Graceful degradation for missing features
- Comprehensive error boundaries
- User-friendly error messages

This troubleshooting guide should be used alongside the learning modules to understand not just how to build UI5 applications, but how to build them robustly and maintain them effectively.
