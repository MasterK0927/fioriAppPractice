# Module 4: Controllers & Event Handling Fundamentals

**Duration**: 2-2.5 hours | **Level**: Beginner | **Prerequisites**: Modules 1-3 completed

## Learning Objectives

By the end of this module, you will:
- Master controller lifecycle methods and their proper usage
- Implement efficient event handling and delegation patterns
- Establish communication between controllers and components
- Prevent memory leaks and performance issues
- Handle complex user interactions and business logic

## 1. Conceptual Foundation (25 minutes)

### Controller Lifecycle in UI5

**Lifecycle Methods and Their Purpose:**
```javascript
return Controller.extend("com.productapp.controller.Master", {
    
    // 1. Constructor (rarely overridden)
    constructor: function() {
        // Called when controller instance is created
        // Use for: Early initialization, dependency injection setup
    },
    
    // 2. onInit - Primary initialization
    onInit: function() {
        // Called after view is instantiated but before rendering
        // Use for: Model setup, router registration, service initialization
    },
    
    // 3. onBeforeRendering - Pre-render setup
    onBeforeRendering: function() {
        // Called before each rendering cycle
        // Use for: Dynamic UI adjustments, data preparation
    },
    
    // 4. onAfterRendering - Post-render operations
    onAfterRendering: function() {
        // Called after view is rendered to DOM
        // Use for: DOM manipulation, focus management, third-party integrations
    },
    
    // 5. onExit - Cleanup
    onExit: function() {
        // Called when controller is destroyed
        // Use for: Event cleanup, resource disposal, memory leak prevention
    }
});
```

**How Controller Lifecycle Affects Application Behavior:**
- **Performance**: Proper initialization prevents redundant operations
- **Memory Management**: Cleanup prevents memory leaks
- **User Experience**: Lifecycle timing affects UI responsiveness
- **Debugging**: Understanding lifecycle helps troubleshoot issues

### Event Handling Patterns in UI5

**Direct Event Binding (XML Views):**
```xml
<!-- Declarative event binding -->
<Button text="Save" press=".onSave"/>
<List selectionChange=".onSelectionChange"/>
<SearchField search=".onSearch"/>
```

**Programmatic Event Binding:**
```javascript
// In controller
onInit: function() {
    var oButton = this.byId("saveButton");
    oButton.attachPress(this.onSave, this);
}
```

**Event Delegation for Performance:**
```javascript
// Efficient for many similar elements
onInit: function() {
    var oList = this.byId("productList");
    oList.attachEvent("press", this.onItemPress, this);
}
```

### Your Project's Controller Analysis

<augment_code_snippet path="webapp/controller/Master.controller.js" mode="EXCERPT">
````javascript
return Controller.extend("com.productapp.controller.Master", {
    onInit: function() {
        this.oRouter = this.getOwnerComponent().getRouter();
        this._bDescendingSort = false;
        var oProductsModel = this.getOwnerComponent().getModel("products");
        this.getView().setModel(oProductsModel, "products");
    },
    
    onSelectionChange: function(oEvent) {
        var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
        var oContext = oItem.getBindingContext("products");
        var sProductId = oContext.getProperty("ProductID");
        this.oRouter.navTo("detail", { productId: sProductId });
    }
});
````
</augment_code_snippet>

**Current Implementation Strengths:**
- Clean initialization in onInit
- Proper event parameter handling
- Router integration for navigation
- Context-based data access

**Enhancement Opportunities:**
- Add onExit cleanup
- Implement error handling
- Add loading states
- Optimize event handling

### Common Controller Mistakes

**❌ Mistake 1: Memory Leaks from Unregistered Events**
```javascript
// Wrong: Event handler not cleaned up
onInit: function() {
    jQuery(window).on("resize", this.onResize.bind(this));
    // Missing: cleanup in onExit
},

onExit: function() {
    // Missing: jQuery(window).off("resize", this.onResize);
}
```
**Impact**: Memory leaks, performance degradation over time

**❌ Mistake 2: Improper this-Context Binding**
```javascript
// Wrong: Lost context in callback
onInit: function() {
    setTimeout(function() {
        this.getView(); // 'this' is undefined!
    }, 1000);
}

// Correct: Proper context binding
onInit: function() {
    setTimeout(function() {
        this.getView(); // 'this' refers to controller
    }.bind(this), 1000);
}
```
**Impact**: Runtime errors, broken functionality

**❌ Mistake 3: Business Logic in Event Handlers**
```javascript
// Wrong: Complex business logic in event handler
onSave: function() {
    // 50 lines of validation, calculation, and processing
    var price = parseFloat(this.byId("priceInput").getValue());
    var discount = price > 1000 ? 0.1 : 0.05;
    var tax = price * 0.08;
    // ... more business logic
}

// Correct: Delegate to service layer
onSave: function() {
    var oData = this._collectFormData();
    this._productService.saveProduct(oData)
        .then(this._onSaveSuccess.bind(this))
        .catch(this._onSaveError.bind(this));
}
```
**Impact**: Untestable code, poor maintainability

## 2. Hands-On Implementation (75 minutes)

### Exercise 1: Enhanced Controller Lifecycle Management (25 minutes)

**Task: Implement Comprehensive Lifecycle Management**

**Enhanced Master Controller:**
```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/formatter",
    "sap/ui/model/Sorter"
], function(Controller, Filter, FilterOperator, MessageToast, MessageBox, formatter, Sorter) {
    "use strict";

    return Controller.extend("com.productapp.controller.Master", {
        formatter: formatter,

        // Enhanced initialization with comprehensive setup
        onInit: function() {
            console.log("🚀 Master controller initializing");
            
            // Initialize core properties
            this._initializeProperties();
            
            // Setup router and navigation
            this._setupRouter();
            
            // Setup models and data
            this._setupModels();
            
            // Setup event handlers
            this._setupEventHandlers();
            
            // Setup services
            this._setupServices();
            
            console.log("✅ Master controller initialized");
        },

        _initializeProperties: function() {
            this._bDescendingSort = false;
            this._sCurrentFilter = "";
            this._aEventHandlers = [];
            this._oCurrentSelection = null;
        },

        _setupRouter: function() {
            this.oRouter = this.getOwnerComponent().getRouter();
            
            // Register for route events with cleanup tracking
            this.oRouter.attachRouteMatched(this._onRouteMatched, this);
            this._aEventHandlers.push({
                object: this.oRouter,
                event: "routeMatched",
                handler: this._onRouteMatched,
                context: this
            });
        },

        _setupModels: function() {
            var oProductsModel = this.getOwnerComponent().getModel("products");
            this.getView().setModel(oProductsModel, "products");
            
            // Setup view model for UI state
            this._createViewModel();
            
            // Monitor model changes
            oProductsModel.attachPropertyChange(this._onModelPropertyChange, this);
            this._aEventHandlers.push({
                object: oProductsModel,
                event: "propertyChange", 
                handler: this._onModelPropertyChange,
                context: this
            });
        },

        _createViewModel: function() {
            var oViewModel = new sap.ui.model.json.JSONModel({
                busy: false,
                hasSelection: false,
                itemCount: 0,
                searchQuery: "",
                selectedCategory: ""
            });
            
            this.getView().setModel(oViewModel, "view");
        },

        _setupEventHandlers: function() {
            // Window resize handler for responsive behavior
            this._fnResizeHandler = this._onWindowResize.bind(this);
            jQuery(window).on("resize", this._fnResizeHandler);
            
            // Keyboard shortcuts
            this._fnKeyHandler = this._onKeyPress.bind(this);
            jQuery(document).on("keydown", this._fnKeyHandler);
        },

        _setupServices: function() {
            // Initialize business services
            this._productService = this.getOwnerComponent().getProductService();
            this._notificationService = this.getOwnerComponent().getNotificationService();
        },

        // Enhanced before rendering
        onBeforeRendering: function() {
            console.log("🔄 Master controller before rendering");
            this._updateItemCount();
        },

        // Enhanced after rendering
        onAfterRendering: function() {
            console.log("✨ Master controller after rendering");
            this._setupFocusManagement();
            this._initializeTooltips();
        },

        _setupFocusManagement: function() {
            // Set initial focus to search field
            var oSearchField = this.byId("searchField");
            if (oSearchField) {
                setTimeout(function() {
                    oSearchField.focus();
                }, 100);
            }
        },

        _initializeTooltips: function() {
            // Add dynamic tooltips based on data
            var oList = this.byId("productList");
            if (oList) {
                oList.getItems().forEach(function(oItem) {
                    var oContext = oItem.getBindingContext("products");
                    if (oContext) {
                        var sTooltip = "Product: " + oContext.getProperty("Name") + 
                                     "\nPrice: " + oContext.getProperty("Price") + 
                                     "\nCategory: " + oContext.getProperty("Category");
                        oItem.setTooltip(sTooltip);
                    }
                });
            }
        },

        // Comprehensive cleanup
        onExit: function() {
            console.log("🧹 Master controller cleanup started");
            
            // Clean up event handlers
            this._cleanupEventHandlers();
            
            // Clean up timers
            this._cleanupTimers();
            
            // Clean up services
            this._cleanupServices();
            
            console.log("✅ Master controller cleanup completed");
        },

        _cleanupEventHandlers: function() {
            // Remove registered event handlers
            this._aEventHandlers.forEach(function(oHandler) {
                if (oHandler.object && oHandler.object.detachEvent) {
                    oHandler.object.detachEvent(oHandler.event, oHandler.handler, oHandler.context);
                }
            });
            
            // Remove window event handlers
            if (this._fnResizeHandler) {
                jQuery(window).off("resize", this._fnResizeHandler);
            }
            
            if (this._fnKeyHandler) {
                jQuery(document).off("keydown", this._fnKeyHandler);
            }
        },

        _cleanupTimers: function() {
            if (this._iSearchTimer) {
                clearTimeout(this._iSearchTimer);
            }
        },

        _cleanupServices: function() {
            if (this._productService && this._productService.destroy) {
                this._productService.destroy();
            }
        },

        // Event handlers with enhanced functionality
        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            
            // Debounce search for performance
            if (this._iSearchTimer) {
                clearTimeout(this._iSearchTimer);
            }
            
            this._iSearchTimer = setTimeout(function() {
                this._performSearch(sQuery);
            }.bind(this), 300);
        },

        _performSearch: function(sQuery) {
            var oList = this.byId("productList");
            var oBinding = oList.getBinding("items");
            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty("/searchQuery", sQuery);

            if (sQuery) {
                var aFilters = [
                    new Filter("Name", FilterOperator.Contains, sQuery),
                    new Filter("Description", FilterOperator.Contains, sQuery),
                    new Filter("Category", FilterOperator.Contains, sQuery)
                ];
                
                var oFilter = new Filter({
                    filters: aFilters,
                    and: false
                });
                
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
            
            this._updateItemCount();
        },

        _updateItemCount: function() {
            var oList = this.byId("productList");
            var oViewModel = this.getView().getModel("view");
            
            if (oList && oViewModel) {
                var oBinding = oList.getBinding("items");
                var iCount = oBinding ? oBinding.getLength() : 0;
                oViewModel.setProperty("/itemCount", iCount);
            }
        },

        // Enhanced selection handling
        onSelectionChange: function(oEvent) {
            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var oContext = oItem.getBindingContext("products");
            
            if (!oContext) {
                console.warn("No binding context found for selected item");
                return;
            }
            
            var sProductId = oContext.getProperty("ProductID");
            var oViewModel = this.getView().getModel("view");
            
            // Update view model
            oViewModel.setProperty("/hasSelection", true);
            this._oCurrentSelection = oContext.getObject();
            
            // Navigate with error handling
            try {
                this.oRouter.navTo("detail", {
                    productId: sProductId
                });
                
                console.log("✅ Navigated to product:", sProductId);
            } catch (oError) {
                console.error("❌ Navigation failed:", oError);
                MessageBox.error("Navigation failed. Please try again.");
            }
        },

        // Window resize handler
        _onWindowResize: function() {
            // Debounce resize handling
            if (this._iResizeTimer) {
                clearTimeout(this._iResizeTimer);
            }
            
            this._iResizeTimer = setTimeout(function() {
                this._handleResponsiveLayout();
            }.bind(this), 100);
        },

        _handleResponsiveLayout: function() {
            var oList = this.byId("productList");
            if (oList) {
                var iWidth = jQuery(window).width();
                
                // Adjust list item layout based on screen size
                if (iWidth < 600) {
                    oList.addStyleClass("sapUiSizeCompact");
                } else {
                    oList.removeStyleClass("sapUiSizeCompact");
                }
            }
        },

        // Keyboard shortcuts
        _onKeyPress: function(oEvent) {
            // Ctrl+F for search focus
            if (oEvent.ctrlKey && oEvent.which === 70) {
                oEvent.preventDefault();
                var oSearchField = this.byId("searchField");
                if (oSearchField) {
                    oSearchField.focus();
                }
            }
            
            // Escape to clear search
            if (oEvent.which === 27) {
                var oSearchField = this.byId("searchField");
                if (oSearchField && oSearchField.getValue()) {
                    oSearchField.setValue("");
                    this._performSearch("");
                }
            }
        },

        // Model change handler
        _onModelPropertyChange: function(oEvent) {
            var sPath = oEvent.getParameter("path");
            var sValue = oEvent.getParameter("value");
            
            console.log("📊 Model property changed:", sPath, "->", sValue);
            
            // React to specific property changes
            if (sPath.endsWith("/InStock")) {
                this._handleStockChange(sPath, sValue);
            }
        },

        _handleStockChange: function(sPath, bInStock) {
            // Show notification for stock changes
            var sMessage = bInStock ? "Product is now in stock" : "Product is out of stock";
            MessageToast.show(sMessage);
        },

        // Route matched handler
        _onRouteMatched: function(oEvent) {
            var sRouteName = oEvent.getParameter("name");
            console.log("🎯 Route matched in Master:", sRouteName);
            
            // Handle route-specific logic
            if (sRouteName === "master") {
                this._clearSelection();
            }
        },

        _clearSelection: function() {
            var oList = this.byId("productList");
            var oViewModel = this.getView().getModel("view");
            
            if (oList) {
                oList.removeSelections();
            }
            
            if (oViewModel) {
                oViewModel.setProperty("/hasSelection", false);
            }
            
            this._oCurrentSelection = null;
        }
    });
});
```

### Exercise 2: Inter-Controller Communication (25 minutes)

**Task: Implement Event Bus Communication**

**Create Communication Service:**
```javascript
// webapp/service/CommunicationService.js
sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.CommunicationService", {
        
        constructor: function(oComponent) {
            this._oComponent = oComponent;
            this._oEventBus = oComponent.getEventBus();
        },
        
        // Product-related events
        publishProductSelected: function(oProduct) {
            this._oEventBus.publish("product", "selected", {
                product: oProduct,
                timestamp: new Date()
            });
        },
        
        publishProductUpdated: function(oProduct) {
            this._oEventBus.publish("product", "updated", {
                product: oProduct,
                timestamp: new Date()
            });
        },
        
        publishProductDeleted: function(sProductId) {
            this._oEventBus.publish("product", "deleted", {
                productId: sProductId,
                timestamp: new Date()
            });
        },
        
        // Search-related events
        publishSearchPerformed: function(sQuery, iResults) {
            this._oEventBus.publish("search", "performed", {
                query: sQuery,
                resultCount: iResults,
                timestamp: new Date()
            });
        },
        
        // Subscription helpers
        subscribeToProductEvents: function(fnCallback, oListener) {
            this._oEventBus.subscribe("product", "selected", fnCallback, oListener);
            this._oEventBus.subscribe("product", "updated", fnCallback, oListener);
            this._oEventBus.subscribe("product", "deleted", fnCallback, oListener);
        },
        
        unsubscribeFromProductEvents: function(fnCallback, oListener) {
            this._oEventBus.unsubscribe("product", "selected", fnCallback, oListener);
            this._oEventBus.unsubscribe("product", "updated", fnCallback, oListener);
            this._oEventBus.unsubscribe("product", "deleted", fnCallback, oListener);
        }
    });
});
```

**Enhanced Detail Controller with Communication:**
```javascript
// Enhanced webapp/controller/Detail.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
], function(Controller, History, MessageBox, MessageToast, JSONModel, formatter) {
    "use strict";

    return Controller.extend("com.productapp.controller.Detail", {
        formatter: formatter,

        onInit: function() {
            this._setupRouter();
            this._setupCommunication();
            this._setupViewModel();
        },

        _setupRouter: function() {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
        },

        _setupCommunication: function() {
            this._oCommunicationService = this.getOwnerComponent().getCommunicationService();
            
            // Subscribe to product events from other controllers
            this._oCommunicationService.subscribeToProductEvents(this._onProductEvent, this);
        },

        _setupViewModel: function() {
            var oViewModel = new JSONModel({
                busy: false,
                editMode: false,
                hasChanges: false
            });
            this.getView().setModel(oViewModel, "view");
        },

        _onProductEvent: function(sChannelId, sEventId, oData) {
            console.log("📡 Product event received:", sChannelId, sEventId, oData);
            
            switch (sEventId) {
                case "updated":
                    this._handleProductUpdated(oData.product);
                    break;
                case "deleted":
                    this._handleProductDeleted(oData.productId);
                    break;
            }
        },

        _handleProductUpdated: function(oUpdatedProduct) {
            var oCurrentProduct = this.getView().getModel("products").getData();
            
            if (oCurrentProduct && oCurrentProduct.ProductID === oUpdatedProduct.ProductID) {
                // Refresh current view with updated data
                this.getView().getModel("products").setData(oUpdatedProduct);
                MessageToast.show("Product information updated");
            }
        },

        _handleProductDeleted: function(sProductId) {
            var oCurrentProduct = this.getView().getModel("products").getData();
            
            if (oCurrentProduct && oCurrentProduct.ProductID === sProductId) {
                MessageBox.information("This product has been deleted", {
                    onClose: function() {
                        this.onNavBack();
                    }.bind(this)
                });
            }
        },

        onEditPress: function() {
            var oProduct = this.getView().getModel("products").getData();
            
            // Publish selection event for other controllers
            this._oCommunicationService.publishProductSelected(oProduct);
            
            // Navigate to edit
            this.oRouter.navTo("edit", {
                productId: oProduct.ProductID
            });
        },

        onDeletePress: function() {
            var oProduct = this.getView().getModel("products").getData();
            var that = this;
            
            MessageBox.confirm("Are you sure you want to delete '" + oProduct.Name + "'?", {
                title: "Confirm Delete",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        that._deleteProduct(oProduct);
                    }
                }
            });
        },

        _deleteProduct: function(oProduct) {
            // Delete from main model
            var oProductsModel = this.getOwnerComponent().getModel("products");
            var aProducts = oProductsModel.getData();
            
            var iIndex = aProducts.findIndex(function(product) {
                return product.ProductID === oProduct.ProductID;
            });
            
            if (iIndex >= 0) {
                aProducts.splice(iIndex, 1);
                oProductsModel.setData(aProducts);
                oProductsModel.refresh(true);
                
                // Publish deletion event
                this._oCommunicationService.publishProductDeleted(oProduct.ProductID);
                
                MessageToast.show("Product deleted successfully");
                this.onNavBack();
            }
        },

        onExit: function() {
            // Clean up communication subscriptions
            if (this._oCommunicationService) {
                this._oCommunicationService.unsubscribeFromProductEvents(this._onProductEvent, this);
            }
        }
    });
});
```

### Exercise 3: Advanced Event Handling Patterns (25 minutes)

**Task: Implement Complex Event Scenarios**

**Event Delegation for Performance:**
```javascript
// Enhanced event handling for large lists
onInit: function() {
    this._setupEventDelegation();
},

_setupEventDelegation: function() {
    var oList = this.byId("productList");
    
    // Single event handler for all list items
    oList.attachEvent("press", function(oEvent) {
        var oSource = oEvent.getSource();
        var sAction = oSource.data("action");
        
        switch (sAction) {
            case "edit":
                this._handleEditAction(oSource);
                break;
            case "delete":
                this._handleDeleteAction(oSource);
                break;
            case "favorite":
                this._handleFavoriteAction(oSource);
                break;
            default:
                this._handleDefaultAction(oSource);
        }
    }, this);
}
```

**Custom Event Implementation:**
```javascript
// Custom events for business logic
_fireProductChanged: function(oProduct, sChangeType) {
    this.fireEvent("productChanged", {
        product: oProduct,
        changeType: sChangeType,
        timestamp: new Date()
    });
},

// In consuming controller
onInit: function() {
    var oMasterController = this.getOwnerComponent().getMasterController();
    oMasterController.attachEvent("productChanged", this._onProductChanged, this);
}
```

## 3. Practical Exercises & Problem-Solving (60 minutes)

### Challenge 1: Memory Leak Detection and Prevention (20 minutes)

**Scenario**: Identify and fix memory leaks in controller

**Problem Code with Memory Leaks:**
```javascript
// Problematic controller with multiple memory leaks
return Controller.extend("com.productapp.controller.Problematic", {
    
    onInit: function() {
        // ❌ Leak 1: Unregistered window event
        jQuery(window).on("resize", this.onResize.bind(this));
        
        // ❌ Leak 2: Timer not cleared
        this._timer = setInterval(this.updateData.bind(this), 5000);
        
        // ❌ Leak 3: Circular reference
        this._dialog = new Dialog();
        this._dialog.controller = this;
        
        // ❌ Leak 4: Model event not detached
        var oModel = this.getView().getModel();
        oModel.attachPropertyChange(this.onModelChange, this);
    }
    
    // Missing onExit method!
});
```

**Fixed Version:**
```javascript
return Controller.extend("com.productapp.controller.Fixed", {
    
    onInit: function() {
        this._aCleanupTasks = [];
        
        // ✅ Registered event with cleanup tracking
        this._fnResize = this.onResize.bind(this);
        jQuery(window).on("resize", this._fnResize);
        this._aCleanupTasks.push(() => jQuery(window).off("resize", this._fnResize));
        
        // ✅ Timer with cleanup tracking
        this._timer = setInterval(this.updateData.bind(this), 5000);
        this._aCleanupTasks.push(() => clearInterval(this._timer));
        
        // ✅ Dialog without circular reference
        this._dialog = new Dialog();
        this._aCleanupTasks.push(() => {
            if (this._dialog) {
                this._dialog.destroy();
                this._dialog = null;
            }
        });
        
        // ✅ Model event with cleanup tracking
        var oModel = this.getView().getModel();
        oModel.attachPropertyChange(this.onModelChange, this);
        this._aCleanupTasks.push(() => oModel.detachPropertyChange(this.onModelChange, this));
    },
    
    onExit: function() {
        // ✅ Execute all cleanup tasks
        this._aCleanupTasks.forEach(fnCleanup => fnCleanup());
        this._aCleanupTasks = [];
    }
});
```

### Challenge 2: Complex Event Coordination (20 minutes)

**Task**: Coordinate events across multiple controllers

**Requirements:**
- Master-detail synchronization
- Cross-controller validation
- Undo/redo functionality
- Conflict resolution

### Challenge 3: Performance Optimization (20 minutes)

**Task**: Optimize event handling for large datasets

**Requirements:**
- Event delegation
- Debounced event handling
- Virtual scrolling integration
- Memory-efficient patterns

## 4. Integration with Official Resources

### UI5 SDK References
- **Controller**: https://ui5.sap.com/api/sap.ui.core.mvc.Controller
- **Event Handling**: https://ui5.sap.com/topic/91f0c3ee6f4d1014b6dd926db0e91070
- **Memory Management**: https://ui5.sap.com/topic/91f0c3ee6f4d1014b6dd926db0e91070

### Best Practices
- **Controller Patterns**: https://ui5.sap.com/topic/91f233476f4d1014b6dd926db0e91070
- **Performance**: https://ui5.sap.com/topic/408b40efed3c416681e1bd8cdd8910d4

## Module Assessment

**Knowledge Check:**
1. Explain controller lifecycle methods and their purposes
2. Demonstrate proper event handler cleanup
3. Implement inter-controller communication
4. Identify and fix memory leaks

**Practical Assessment:**
1. Create controller with comprehensive lifecycle management
2. Implement event delegation for performance
3. Build communication system between controllers
4. Debug and fix memory leak scenarios

## Next Module Preview

**Module 5: Advanced Data Binding, Formatters & Expression Binding**
- Complex binding expressions and calculations
- Custom formatter functions and performance
- Expression binding for dynamic UI behavior
- Binding optimization techniques
