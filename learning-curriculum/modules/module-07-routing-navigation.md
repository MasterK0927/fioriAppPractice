# Module 7: Routing, Navigation & Deep Linking

**Duration**: 2.5-3 hours | **Level**: Intermediate | **Prerequisites**: Modules 1-6 completed

## Learning Objectives

By the end of this module, you will:
- Master advanced routing patterns and configurations
- Implement URL parameter handling and validation
- Create navigation guards and route protection
- Build SEO-friendly URLs and bookmarking support
- Handle complex navigation scenarios and error cases

## 1. Conceptual Foundation (25 minutes)

### UI5 Routing Architecture

**How UI5 Routing Works:**
1. **Hash-based Navigation**: Uses URL fragments for client-side routing
2. **Route Matching**: Pattern matching against URL hash
3. **Target Resolution**: Maps routes to views and controllers
4. **Parameter Extraction**: Extracts dynamic values from URLs
5. **History Management**: Browser back/forward button support

**Your Project's Current Routing Analysis:**

<augment_code_snippet path="webapp/manifest.json" mode="EXCERPT">
````json
"routing": {
  "config": {
    "routerClass": "sap.m.routing.Router",
    "viewType": "XML",
    "viewPath": "com.productapp.view",
    "controlId": "app",
    "controlAggregation": "pages"
  },
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
      "target": "create"
    },
    {
      "pattern": "edit/{productId}",
      "name": "edit",
      "target": "edit"
    }
  ]
}
````
</augment_code_snippet>

**Current Routing Strengths:**
- Clean URL patterns with parameters
- Split-screen navigation support
- Proper target configuration
- Async routing enabled

**Enhancement Opportunities:**
- Add route validation and guards
- Implement nested routing
- Add query parameter support
- Create breadcrumb navigation

### Advanced Routing Patterns

**Route Parameters and Query Strings:**
```javascript
// URL: #/product/123?tab=specifications&view=detailed
{
    "pattern": "product/{productId}",
    "name": "detail",
    "target": "detail"
}

// Access parameters in controller
var sProductId = oEvent.getParameter("arguments").productId;
var mQuery = oEvent.getParameter("arguments")["?query"];
var sTab = mQuery.tab; // "specifications"
var sView = mQuery.view; // "detailed"
```

**How Routing Affects SEO and User Experience:**
- **Bookmarkable URLs**: Users can bookmark specific application states
- **Browser History**: Back/forward buttons work naturally
- **Deep Linking**: Direct access to specific content
- **Search Engine Optimization**: Crawlable URLs for public content

### Common Routing Mistakes

**❌ Mistake 1: Route Conflicts**
```json
// Wrong: Conflicting route patterns
{
  "pattern": "product/{id}",
  "name": "detail"
},
{
  "pattern": "product/new",
  "name": "create"
}
// "new" will be interpreted as an ID!
```
**Impact**: Incorrect route matching, broken navigation

**❌ Mistake 2: Improper Parameter Passing**
```javascript
// Wrong: Parameter name mismatch
this.oRouter.navTo("detail", {
    productId: sId  // Route expects "id"
});
```
**Impact**: Navigation failures, undefined parameters

**❌ Mistake 3: Navigation Loops**
```javascript
// Wrong: Circular navigation
onRouteMatched: function(oEvent) {
    this.oRouter.navTo("detail", {id: "123"}); // Creates infinite loop!
}
```
**Impact**: Browser crashes, poor user experience

## 2. Hands-On Implementation (90 minutes)

### Exercise 1: Enhanced Routing Configuration (30 minutes)

**Task: Implement Advanced Routing Patterns**

**Enhanced Manifest Routing:**
```json
// Enhanced webapp/manifest.json routing section
{
  "routing": {
    "config": {
      "routerClass": "sap.m.routing.Router",
      "viewType": "XML",
      "viewPath": "com.productapp.view",
      "controlId": "app",
      "controlAggregation": "pages",
      "bypassed": {
        "target": ["notFound"]
      },
      "async": true
    },
    "routes": [
      {
        "pattern": "",
        "name": "home",
        "target": ["master", "welcome"]
      },
      {
        "pattern": "products",
        "name": "products",
        "target": ["master", "productList"]
      },
      {
        "pattern": "products/{productId}",
        "name": "productDetail",
        "target": ["master", "detail"]
      },
      {
        "pattern": "products/{productId}/edit",
        "name": "productEdit",
        "target": "edit"
      },
      {
        "pattern": "products/create",
        "name": "productCreate",
        "target": "create"
      },
      {
        "pattern": "categories",
        "name": "categories",
        "target": ["master", "categoryList"]
      },
      {
        "pattern": "categories/{categoryId}",
        "name": "categoryDetail",
        "target": ["master", "categoryDetail"]
      },
      {
        "pattern": "categories/{categoryId}/products",
        "name": "categoryProducts",
        "target": ["master", "categoryProducts"]
      },
      {
        "pattern": "search",
        "name": "search",
        "target": ["master", "searchResults"]
      },
      {
        "pattern": "settings",
        "name": "settings",
        "target": "settings"
      },
      {
        "pattern": "admin/{section}",
        "name": "admin",
        "target": "admin"
      }
    ],
    "targets": {
      "master": {
        "viewName": "Master",
        "viewLevel": 1,
        "viewId": "master",
        "controlAggregation": "masterPages"
      },
      "welcome": {
        "viewName": "Welcome",
        "viewLevel": 2,
        "viewId": "welcome",
        "controlAggregation": "detailPages"
      },
      "productList": {
        "viewName": "ProductList",
        "viewLevel": 2,
        "viewId": "productList",
        "controlAggregation": "detailPages"
      },
      "detail": {
        "viewName": "Detail",
        "viewLevel": 2,
        "viewId": "detail",
        "controlAggregation": "detailPages"
      },
      "edit": {
        "viewName": "Edit",
        "viewLevel": 3,
        "viewId": "edit",
        "controlAggregation": "detailPages"
      },
      "create": {
        "viewName": "Create",
        "viewLevel": 3,
        "viewId": "create",
        "controlAggregation": "detailPages"
      },
      "categoryList": {
        "viewName": "CategoryList",
        "viewLevel": 2,
        "viewId": "categoryList",
        "controlAggregation": "detailPages"
      },
      "categoryDetail": {
        "viewName": "CategoryDetail",
        "viewLevel": 2,
        "viewId": "categoryDetail",
        "controlAggregation": "detailPages"
      },
      "categoryProducts": {
        "viewName": "CategoryProducts",
        "viewLevel": 2,
        "viewId": "categoryProducts",
        "controlAggregation": "detailPages"
      },
      "searchResults": {
        "viewName": "SearchResults",
        "viewLevel": 2,
        "viewId": "searchResults",
        "controlAggregation": "detailPages"
      },
      "settings": {
        "viewName": "Settings",
        "viewLevel": 1,
        "viewId": "settings",
        "controlAggregation": "pages"
      },
      "admin": {
        "viewName": "Admin",
        "viewLevel": 1,
        "viewId": "admin",
        "controlAggregation": "pages"
      },
      "notFound": {
        "viewName": "NotFound",
        "viewId": "notFound",
        "controlAggregation": "pages"
      }
    }
  }
}
```

### Exercise 2: Navigation Service Implementation (30 minutes)

**Task: Create Centralized Navigation Management**

**Navigation Service:**
```javascript
// webapp/service/NavigationService.js
sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(BaseObject, MessageBox, MessageToast) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.NavigationService", {
        
        constructor: function(oComponent) {
            this._oComponent = oComponent;
            this._oRouter = oComponent.getRouter();
            this._mNavigationGuards = new Map();
            this._aNavigationHistory = [];
            this._iMaxHistorySize = 50;
            
            this._setupRouteInterception();
        },
        
        /**
         * Navigate to a route with validation and guards
         * @param {string} sRouteName - Route name
         * @param {object} mParameters - Route parameters
         * @param {object} mOptions - Navigation options
         * @returns {Promise} Promise that resolves when navigation completes
         */
        navigateTo: function(sRouteName, mParameters, mOptions) {
            var that = this;
            mParameters = mParameters || {};
            mOptions = mOptions || {};
            
            return new Promise(function(resolve, reject) {
                // Validate route exists
                if (!that._routeExists(sRouteName)) {
                    console.error("Route does not exist:", sRouteName);
                    reject(new Error("Route not found: " + sRouteName));
                    return;
                }
                
                // Check navigation guards
                that._checkNavigationGuards(sRouteName, mParameters)
                    .then(function(bAllowed) {
                        if (bAllowed) {
                            // Add to navigation history
                            that._addToHistory(sRouteName, mParameters);
                            
                            // Perform navigation
                            that._oRouter.navTo(sRouteName, mParameters, mOptions.replace);
                            resolve();
                        } else {
                            reject(new Error("Navigation blocked by guard"));
                        }
                    })
                    .catch(function(oError) {
                        console.error("Navigation guard error:", oError);
                        reject(oError);
                    });
            });
        },
        
        /**
         * Navigate back in history
         * @param {number} iSteps - Number of steps to go back (default: 1)
         */
        navigateBack: function(iSteps) {
            iSteps = iSteps || 1;
            
            if (this._aNavigationHistory.length > iSteps) {
                var oHistoryEntry = this._aNavigationHistory[this._aNavigationHistory.length - iSteps - 1];
                this.navigateTo(oHistoryEntry.route, oHistoryEntry.parameters, {replace: true});
            } else {
                // Fallback to browser history
                window.history.go(-iSteps);
            }
        },
        
        /**
         * Get current route information
         * @returns {object} Current route info
         */
        getCurrentRoute: function() {
            var oHashChanger = this._oRouter.getHashChanger();
            var sHash = oHashChanger.getHash();
            
            return {
                hash: sHash,
                route: this._parseRoute(sHash),
                parameters: this._parseParameters(sHash)
            };
        },
        
        /**
         * Register a navigation guard
         * @param {string} sRouteName - Route name to guard
         * @param {function} fnGuard - Guard function
         */
        addNavigationGuard: function(sRouteName, fnGuard) {
            if (!this._mNavigationGuards.has(sRouteName)) {
                this._mNavigationGuards.set(sRouteName, []);
            }
            this._mNavigationGuards.get(sRouteName).push(fnGuard);
        },
        
        /**
         * Remove a navigation guard
         * @param {string} sRouteName - Route name
         * @param {function} fnGuard - Guard function to remove
         */
        removeNavigationGuard: function(sRouteName, fnGuard) {
            if (this._mNavigationGuards.has(sRouteName)) {
                var aGuards = this._mNavigationGuards.get(sRouteName);
                var iIndex = aGuards.indexOf(fnGuard);
                if (iIndex >= 0) {
                    aGuards.splice(iIndex, 1);
                }
            }
        },
        
        /**
         * Generate URL for a route
         * @param {string} sRouteName - Route name
         * @param {object} mParameters - Route parameters
         * @returns {string} Generated URL
         */
        getUrlForRoute: function(sRouteName, mParameters) {
            return this._oRouter.getURL(sRouteName, mParameters);
        },
        
        /**
         * Parse URL parameters including query string
         * @param {string} sHash - URL hash
         * @returns {object} Parsed parameters
         */
        parseUrlParameters: function(sHash) {
            var mParameters = {};
            var aHashParts = sHash.split("?");
            
            // Parse route parameters
            if (aHashParts[0]) {
                var aRouteParts = aHashParts[0].split("/");
                // Route-specific parameter parsing logic here
            }
            
            // Parse query parameters
            if (aHashParts[1]) {
                var aQueryParts = aHashParts[1].split("&");
                aQueryParts.forEach(function(sPart) {
                    var aKeyValue = sPart.split("=");
                    if (aKeyValue.length === 2) {
                        mParameters[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
                    }
                });
            }
            
            return mParameters;
        },
        
        /**
         * Build URL with query parameters
         * @param {string} sRouteName - Route name
         * @param {object} mRouteParams - Route parameters
         * @param {object} mQueryParams - Query parameters
         * @returns {string} Complete URL
         */
        buildUrlWithQuery: function(sRouteName, mRouteParams, mQueryParams) {
            var sBaseUrl = this.getUrlForRoute(sRouteName, mRouteParams);
            
            if (mQueryParams && Object.keys(mQueryParams).length > 0) {
                var aQueryParts = [];
                Object.keys(mQueryParams).forEach(function(sKey) {
                    if (mQueryParams[sKey] !== null && mQueryParams[sKey] !== undefined) {
                        aQueryParts.push(
                            encodeURIComponent(sKey) + "=" + encodeURIComponent(mQueryParams[sKey])
                        );
                    }
                });
                
                if (aQueryParts.length > 0) {
                    sBaseUrl += "?" + aQueryParts.join("&");
                }
            }
            
            return sBaseUrl;
        },
        
        // Private methods
        _setupRouteInterception: function() {
            var that = this;
            
            this._oRouter.attachRouteMatched(function(oEvent) {
                var sRouteName = oEvent.getParameter("name");
                var mArguments = oEvent.getParameter("arguments");
                
                console.log("🎯 Route matched:", sRouteName, mArguments);
                
                // Track route analytics
                that._trackRouteAnalytics(sRouteName, mArguments);
            });
            
            this._oRouter.attachBypassed(function(oEvent) {
                var sHash = oEvent.getParameter("hash");
                console.warn("⚠️ Route bypassed:", sHash);
                
                // Handle 404 scenarios
                that._handleRouteNotFound(sHash);
            });
        },
        
        _routeExists: function(sRouteName) {
            var oManifest = this._oComponent.getManifestEntry("sap.ui5");
            var aRoutes = oManifest.routing.routes;
            
            return aRoutes.some(function(oRoute) {
                return oRoute.name === sRouteName;
            });
        },
        
        _checkNavigationGuards: function(sRouteName, mParameters) {
            var that = this;
            
            return new Promise(function(resolve) {
                if (!that._mNavigationGuards.has(sRouteName)) {
                    resolve(true);
                    return;
                }
                
                var aGuards = that._mNavigationGuards.get(sRouteName);
                var aPromises = aGuards.map(function(fnGuard) {
                    return Promise.resolve(fnGuard(sRouteName, mParameters));
                });
                
                Promise.all(aPromises).then(function(aResults) {
                    var bAllowed = aResults.every(function(bResult) {
                        return bResult === true;
                    });
                    resolve(bAllowed);
                }).catch(function() {
                    resolve(false);
                });
            });
        },
        
        _addToHistory: function(sRouteName, mParameters) {
            this._aNavigationHistory.push({
                route: sRouteName,
                parameters: mParameters,
                timestamp: new Date()
            });
            
            // Limit history size
            if (this._aNavigationHistory.length > this._iMaxHistorySize) {
                this._aNavigationHistory.shift();
            }
        },
        
        _trackRouteAnalytics: function(sRouteName, mArguments) {
            // In a real application, send analytics data
            console.log("📊 Route analytics:", {
                route: sRouteName,
                parameters: mArguments,
                timestamp: new Date(),
                userAgent: navigator.userAgent
            });
        },
        
        _handleRouteNotFound: function(sHash) {
            MessageToast.show("Page not found: " + sHash);
            
            // Navigate to home or show 404 page
            setTimeout(function() {
                this.navigateTo("home");
            }.bind(this), 2000);
        },
        
        _parseRoute: function(sHash) {
            // Extract route name from hash
            var sRoute = sHash.split("/")[0];
            return sRoute || "home";
        },
        
        _parseParameters: function(sHash) {
            // Extract parameters from hash
            return this.parseUrlParameters(sHash);
        },
        
        destroy: function() {
            this._mNavigationGuards.clear();
            this._aNavigationHistory = [];
            this._oComponent = null;
            this._oRouter = null;
        }
    });
});
```

### Exercise 3: Route Guards and Validation (30 minutes)

**Task: Implement Navigation Guards and Route Protection**

**Route Guard Examples:**
```javascript
// webapp/service/RouteGuards.js
sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/MessageBox"
], function(BaseObject, MessageBox) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.RouteGuards", {
        
        constructor: function(oComponent) {
            this._oComponent = oComponent;
            this._setupGuards();
        },
        
        _setupGuards: function() {
            var oNavigationService = this._oComponent.getNavigationService();
            
            // Authentication guard for admin routes
            oNavigationService.addNavigationGuard("admin", this._authenticationGuard.bind(this));
            
            // Unsaved changes guard for edit routes
            oNavigationService.addNavigationGuard("productEdit", this._unsavedChangesGuard.bind(this));
            oNavigationService.addNavigationGuard("productCreate", this._unsavedChangesGuard.bind(this));
            
            // Product existence guard
            oNavigationService.addNavigationGuard("productDetail", this._productExistsGuard.bind(this));
            oNavigationService.addNavigationGuard("productEdit", this._productExistsGuard.bind(this));
        },
        
        /**
         * Authentication guard - checks if user is authenticated
         * @param {string} sRouteName - Route name
         * @param {object} mParameters - Route parameters
         * @returns {Promise<boolean>} Whether navigation is allowed
         */
        _authenticationGuard: function(sRouteName, mParameters) {
            var that = this;
            
            return new Promise(function(resolve) {
                // Check authentication status
                var bIsAuthenticated = that._checkAuthentication();
                
                if (bIsAuthenticated) {
                    resolve(true);
                } else {
                    MessageBox.warning("You need to be authenticated to access this page.", {
                        title: "Authentication Required",
                        actions: [MessageBox.Action.OK, "Login"],
                        onClose: function(sAction) {
                            if (sAction === "Login") {
                                that._showLoginDialog().then(function(bSuccess) {
                                    resolve(bSuccess);
                                });
                            } else {
                                resolve(false);
                            }
                        }
                    });
                }
            });
        },
        
        /**
         * Unsaved changes guard - warns about unsaved changes
         * @param {string} sRouteName - Route name
         * @param {object} mParameters - Route parameters
         * @returns {Promise<boolean>} Whether navigation is allowed
         */
        _unsavedChangesGuard: function(sRouteName, mParameters) {
            return new Promise(function(resolve) {
                // Check for unsaved changes
                var bHasUnsavedChanges = this._checkUnsavedChanges();
                
                if (bHasUnsavedChanges) {
                    MessageBox.confirm("You have unsaved changes. Do you want to leave without saving?", {
                        title: "Unsaved Changes",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: function(sAction) {
                            resolve(sAction === MessageBox.Action.YES);
                        }
                    });
                } else {
                    resolve(true);
                }
            }.bind(this));
        },
        
        /**
         * Product existence guard - checks if product exists
         * @param {string} sRouteName - Route name
         * @param {object} mParameters - Route parameters
         * @returns {Promise<boolean>} Whether navigation is allowed
         */
        _productExistsGuard: function(sRouteName, mParameters) {
            var that = this;
            
            return new Promise(function(resolve) {
                var sProductId = mParameters.productId;
                
                if (!sProductId) {
                    resolve(false);
                    return;
                }
                
                // Check if product exists
                that._checkProductExists(sProductId).then(function(bExists) {
                    if (bExists) {
                        resolve(true);
                    } else {
                        MessageBox.error("Product not found: " + sProductId, {
                            title: "Product Not Found",
                            onClose: function() {
                                // Navigate to products list
                                that._oComponent.getNavigationService().navigateTo("products");
                            }
                        });
                        resolve(false);
                    }
                });
            });
        },
        
        // Helper methods
        _checkAuthentication: function() {
            // In a real application, check authentication token
            return localStorage.getItem("authToken") !== null;
        },
        
        _checkUnsavedChanges: function() {
            // Check if any forms have unsaved changes
            var aForms = document.querySelectorAll("form[data-has-changes='true']");
            return aForms.length > 0;
        },
        
        _checkProductExists: function(sProductId) {
            return new Promise(function(resolve) {
                var oProductsModel = this._oComponent.getModel("products");
                var aProducts = oProductsModel.getData();
                
                var bExists = aProducts.some(function(oProduct) {
                    return oProduct.ProductID === sProductId;
                });
                
                resolve(bExists);
            }.bind(this));
        },
        
        _showLoginDialog: function() {
            return new Promise(function(resolve) {
                // Simulate login dialog
                setTimeout(function() {
                    var bSuccess = Math.random() > 0.5; // Random success
                    if (bSuccess) {
                        localStorage.setItem("authToken", "dummy-token");
                    }
                    resolve(bSuccess);
                }, 1000);
            });
        }
    });
});
```

## 3. Practical Exercises & Problem-Solving (60 minutes)

### Challenge 1: Breadcrumb Navigation (20 minutes)

**Scenario**: Implement breadcrumb navigation for complex routing

**Requirements:**
- Dynamic breadcrumb generation
- Clickable breadcrumb items
- Route hierarchy representation
- Mobile-responsive design

### Challenge 2: Deep Linking with State Restoration (20 minutes)

**Task**: Implement complete application state restoration from URLs

**Requirements:**
- Save filter states in URL
- Restore view configurations
- Handle complex nested states
- Validate state parameters

### Challenge 3: Progressive Web App Routing (20 minutes)

**Task**: Implement PWA-compatible routing

**Requirements:**
- Service worker integration
- Offline route handling
- Cache-first navigation
- Fallback strategies

## 4. Integration with Official Resources

### UI5 SDK References
- **Routing**: https://ui5.sap.com/topic/3d18f20bd2294228acb6910d8e8a5fb5
- **Navigation**: https://ui5.sap.com/topic/516e477e7e1e4f2b8b8e8f9a1b2c3d4e
- **URL Parameters**: https://ui5.sap.com/topic/2366345a94f64ec1a80f9d9ce50a59ef

### Best Practices
- **Route Design**: https://ui5.sap.com/topic/e5200ee755f344c8963c8e8f9a1b2c3d
- **Navigation Patterns**: https://ui5.sap.com/topic/516e477e7e1e4f2b8b8e8f9a1b2c3d4e

## Module Assessment

**Knowledge Check:**
1. Design complex routing architectures
2. Implement navigation guards and validation
3. Handle URL parameters and query strings
4. Create SEO-friendly navigation patterns

**Practical Assessment:**
1. Build advanced routing configuration
2. Implement navigation service with guards
3. Create breadcrumb navigation system
4. Handle complex navigation scenarios

## Next Module Preview

**Module 8: OData Services, Backend Integration & Data Management**
- OData protocol fundamentals and implementation
- Service configuration and error handling
- Real-time data synchronization patterns
- Offline capabilities and conflict resolution
