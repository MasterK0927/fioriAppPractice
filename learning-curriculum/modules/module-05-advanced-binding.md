# Module 5: Advanced Data Binding, Formatters & Expression Binding

**Duration**: 2.5-3 hours | **Level**: Intermediate | **Prerequisites**: Modules 1-4 completed

## Learning Objectives

By the end of this module, you will:
- Master complex binding expressions and calculated fields
- Create efficient custom formatter functions
- Implement expression binding for dynamic UI behavior
- Optimize binding performance for large datasets
- Handle complex data transformations and validations

## 1. Conceptual Foundation (25 minutes)

### Advanced Binding Patterns in UI5

**Expression Binding - Dynamic UI Logic:**
```xml
<!-- Simple expression binding -->
<Text text="{= ${products>Price} > 1000 ? 'Premium' : 'Standard'}" />

<!-- Complex expression with multiple conditions -->
<ObjectStatus 
    text="{= ${products>InStock} ? (${products>Quantity} > 10 ? 'In Stock' : 'Low Stock') : 'Out of Stock'}"
    state="{= ${products>InStock} ? (${products>Quantity} > 10 ? 'Success' : 'Warning') : 'Error'}" />

<!-- Mathematical calculations -->
<Text text="{= 'Total: $' + (${products>Price} * ${products>Quantity}).toFixed(2)}" />
```

**Multi-Part Binding with Formatters:**
```xml
<!-- Combining multiple model properties -->
<Text text="{
    parts: [
        {path: 'products>Name'},
        {path: 'products>Category'},
        {path: 'products>Price'},
        {path: 'products>Currency'}
    ],
    formatter: '.formatter.formatProductSummary'
}" />
```

**How Advanced Binding Improves User Experience:**
- **Real-time Updates**: UI reflects data changes immediately
- **Reduced Code**: Less JavaScript needed for UI logic
- **Performance**: Framework optimizes binding updates
- **Maintainability**: Declarative approach is easier to understand

### Your Project's Current Binding Analysis

<augment_code_snippet path="webapp/view/Master.view.xml" mode="EXCERPT">
````xml
<ObjectListItem
    title="{products>Name}"
    number="{
        parts: [
            {path: 'products>Price'},
            {path: 'products>Currency'}
        ],
        formatter: '.formatter.formatPrice'
    }"
    intro="{products>Category}">
    <firstStatus>
        <ObjectStatus
            text="{= ${products>InStock} ? 'In Stock' : 'Out of Stock'}"
            state="{= ${products>InStock} ? 'Success' : 'Error'}"/>
    </firstStatus>
</ObjectListItem>
````
</augment_code_snippet>

**Current Implementation Strengths:**
- Multi-part binding for price formatting
- Expression binding for stock status
- Clean separation of data and presentation

**Enhancement Opportunities:**
- Add more complex calculations
- Implement conditional formatting
- Add data validation binding
- Optimize for performance

### Common Advanced Binding Mistakes

**❌ Mistake 1: Complex Formatters Causing Performance Issues**
```javascript
// Wrong: Heavy computation in formatter called frequently
formatComplexCalculation: function(aData) {
    // 100+ lines of complex calculations
    return aData.map(item => {
        // Heavy processing for each item
        return this.performComplexCalculation(item);
    }).reduce((sum, val) => sum + val, 0);
}
```
**Impact**: UI freezes, poor user experience

**❌ Mistake 2: Binding Loops in Expression Binding**
```xml
<!-- Wrong: Circular dependency -->
<Input value="{= ${model>/value} + ${model>/calculatedValue}}" 
       change="onValueChange"/>
```
```javascript
onValueChange: function(oEvent) {
    // This creates a binding loop!
    this.getModel().setProperty("/calculatedValue", oEvent.getParameter("value") * 2);
}
```
**Impact**: Infinite loops, browser crashes

**❌ Mistake 3: Inefficient Expression Binding**
```xml
<!-- Wrong: Complex operations in expression binding -->
<Text text="{= ${products>/}.filter(p => p.Category === 'Electronics').length + ' Electronics'}" />
```
**Impact**: Performance degradation, unnecessary recalculations

## 2. Hands-On Implementation (90 minutes)

### Exercise 1: Enhanced Formatter Functions (30 minutes)

**Task: Create Comprehensive Formatter Library**

**Enhanced Formatter Implementation:**
```javascript
// webapp/model/formatter.js
sap.ui.define([], function() {
    "use strict";
    
    return {
        
        // Price formatting with currency and locale support
        formatPrice: function(fPrice, sCurrency) {
            if (!fPrice && fPrice !== 0) return "";
            
            var oLocale = sap.ui.getCore().getConfiguration().getLocale();
            var oNumberFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
                currencyCode: sCurrency || "USD"
            }, oLocale);
            
            return oNumberFormat.format(fPrice, sCurrency);
        },
        
        // Advanced product summary with multiple data points
        formatProductSummary: function(sName, sCategory, fPrice, sCurrency) {
            if (!sName) return "";
            
            var sPriceText = this.formatPrice(fPrice, sCurrency);
            var sCategoryText = sCategory ? ` (${sCategory})` : "";
            
            return `${sName}${sCategoryText} - ${sPriceText}`;
        },
        
        // Stock status with quantity awareness
        formatStockStatus: function(bInStock, iQuantity) {
            if (!bInStock) return "Out of Stock";
            
            if (iQuantity > 50) return "In Stock";
            if (iQuantity > 10) return "Limited Stock";
            if (iQuantity > 0) return "Low Stock";
            
            return "Out of Stock";
        },
        
        // Stock status state for ObjectStatus
        formatStockStatusState: function(bInStock, iQuantity) {
            if (!bInStock) return "Error";
            
            if (iQuantity > 50) return "Success";
            if (iQuantity > 10) return "Information";
            if (iQuantity > 0) return "Warning";
            
            return "Error";
        },
        
        // Rating display with stars
        formatRating: function(fRating) {
            if (!fRating) return "";
            
            var iFullStars = Math.floor(fRating);
            var bHalfStar = (fRating - iFullStars) >= 0.5;
            var iEmptyStars = 5 - iFullStars - (bHalfStar ? 1 : 0);
            
            var sStars = "★".repeat(iFullStars);
            if (bHalfStar) sStars += "☆";
            sStars += "☆".repeat(iEmptyStars);
            
            return `${sStars} (${fRating.toFixed(1)})`;
        },
        
        // Date formatting with relative time
        formatDate: function(sDate) {
            if (!sDate) return "";
            
            var oDate = new Date(sDate);
            var oNow = new Date();
            var iDiffDays = Math.floor((oNow - oDate) / (1000 * 60 * 60 * 24));
            
            if (iDiffDays === 0) return "Today";
            if (iDiffDays === 1) return "Yesterday";
            if (iDiffDays < 7) return `${iDiffDays} days ago`;
            if (iDiffDays < 30) return `${Math.floor(iDiffDays / 7)} weeks ago`;
            
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                style: "medium"
            });
            return oDateFormat.format(oDate);
        },
        
        // Category icon mapping
        formatCategoryIcon: function(sCategory) {
            var mCategoryIcons = {
                "Electronics": "sap-icon://laptop",
                "Mobile Devices": "sap-icon://iphone",
                "Audio": "sap-icon://sound",
                "Wearables": "sap-icon://watch",
                "Home Entertainment": "sap-icon://tv"
            };
            
            return mCategoryIcons[sCategory] || "sap-icon://product";
        },
        
        // Discount calculation
        formatDiscount: function(fPrice, fOriginalPrice) {
            if (!fPrice || !fOriginalPrice || fPrice >= fOriginalPrice) {
                return "";
            }
            
            var fDiscount = ((fOriginalPrice - fPrice) / fOriginalPrice) * 100;
            return `-${Math.round(fDiscount)}%`;
        },
        
        // Performance-optimized formatter with caching
        formatProductTitle: function(sName, sCategory, bInStock) {
            // Cache key for memoization
            var sCacheKey = `${sName}_${sCategory}_${bInStock}`;
            
            if (!this._titleCache) {
                this._titleCache = new Map();
            }
            
            if (this._titleCache.has(sCacheKey)) {
                return this._titleCache.get(sCacheKey);
            }
            
            var sResult = sName;
            if (sCategory) {
                sResult += ` [${sCategory}]`;
            }
            if (!bInStock) {
                sResult += " (Out of Stock)";
            }
            
            // Cache result for future use
            this._titleCache.set(sCacheKey, sResult);
            
            // Limit cache size to prevent memory leaks
            if (this._titleCache.size > 1000) {
                var aKeys = Array.from(this._titleCache.keys());
                for (var i = 0; i < 100; i++) {
                    this._titleCache.delete(aKeys[i]);
                }
            }
            
            return sResult;
        }
    };
});
```

### Exercise 2: Complex Expression Binding Implementation (30 minutes)

**Task: Enhance Views with Advanced Expression Binding**

**Enhanced Master View with Expression Binding:**
```xml
<!-- webapp/view/Master.view.xml -->
<mvc:View
    controllerName="com.productapp.controller.Master"
    xmlns="sap.m"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:core="sap.ui.core">

    <Page id="masterPage" title="{i18n>masterTitle}">
        <subHeader>
            <Toolbar>
                <SearchField id="searchField" width="60%" search=".onSearch"/>
                <ComboBox id="categoryFilter" 
                         width="35%"
                         placeholder="All Categories"
                         items="{categories>/}"
                         selectionChange=".onCategoryFilter">
                    <core:Item key="" text="All Categories"/>
                    <core:Item key="{categories>Name}" text="{categories>Name}"/>
                </ComboBox>
            </Toolbar>
        </subHeader>
        
        <content>
            <!-- Summary Panel with Expression Binding -->
            <Panel headerText="Summary" class="sapUiMediumMargin">
                <content>
                    <HBox class="sapUiSmallMargin">
                        <VBox class="sapUiMediumMarginEnd">
                            <Text text="Total Products"/>
                            <Text text="{= ${products>/}.length}" 
                                  class="sapUiLargeText sapThemeHighlight-asColor"/>
                        </VBox>
                        <VBox class="sapUiMediumMarginEnd">
                            <Text text="In Stock"/>
                            <Text text="{= ${products>/}.filter(function(p) { return p.InStock; }).length}" 
                                  class="sapUiLargeText sapThemePositiveText"/>
                        </VBox>
                        <VBox class="sapUiMediumMarginEnd">
                            <Text text="Out of Stock"/>
                            <Text text="{= ${products>/}.filter(function(p) { return !p.InStock; }).length}" 
                                  class="sapUiLargeText sapThemeNegativeText"/>
                        </VBox>
                        <VBox>
                            <Text text="Average Price"/>
                            <Text text="{= '$' + (${products>/}.reduce(function(sum, p) { return sum + p.Price; }, 0) / ${products>/}.length).toFixed(2)}" 
                                  class="sapUiLargeText sapThemeHighlight-asColor"/>
                        </VBox>
                    </HBox>
                </content>
            </Panel>
            
            <List id="productList"
                  items="{
                      path: 'products>/',
                      sorter: {
                          path: 'Name',
                          descending: false
                      }
                  }"
                  mode="SingleSelectMaster"
                  selectionChange=".onSelectionChange">
                <items>
                    <ObjectListItem
                        title="{
                            parts: [
                                {path: 'products>Name'},
                                {path: 'products>Category'},
                                {path: 'products>InStock'}
                            ],
                            formatter: '.formatter.formatProductTitle'
                        }"
                        type="Active"
                        press=".onSelectionChange"
                        number="{
                            parts: [
                                {path: 'products>Price'},
                                {path: 'products>Currency'}
                            ],
                            formatter: '.formatter.formatPrice'
                        }"
                        numberUnit="{products>Currency}"
                        intro="{products>Category}"
                        icon="{
                            path: 'products>Category',
                            formatter: '.formatter.formatCategoryIcon'
                        }"
                        iconDensityAware="false">
                        
                        <!-- Dynamic highlighting based on stock and price -->
                        <customData>
                            <core:CustomData 
                                key="highlight" 
                                value="{= ${products>Price} > 1000 ? 'Information' : 'None'}" />
                        </customData>
                        
                        <firstStatus>
                            <ObjectStatus
                                text="{
                                    parts: [
                                        {path: 'products>InStock'},
                                        {path: 'products>Quantity'}
                                    ],
                                    formatter: '.formatter.formatStockStatus'
                                }"
                                state="{
                                    parts: [
                                        {path: 'products>InStock'},
                                        {path: 'products>Quantity'}
                                    ],
                                    formatter: '.formatter.formatStockStatusState'
                                }"/>
                        </firstStatus>
                        
                        <secondStatus>
                            <!-- Conditional status display -->
                            <ObjectStatus
                                text="{
                                    path: 'products>Rating',
                                    formatter: '.formatter.formatRating'
                                }"
                                state="Information"
                                visible="{= ${products>Rating} > 0}"/>
                        </secondStatus>
                        
                        <attributes>
                            <ObjectAttribute text="{products>Description}"/>
                            <ObjectAttribute text="Supplier: {products>SupplierName}"/>
                            
                            <!-- Conditional attributes based on data -->
                            <ObjectAttribute 
                                text="Quantity: {products>Quantity}"
                                visible="{= ${products>InStock} && ${products>Quantity} > 0}"/>
                            
                            <!-- Price comparison attribute -->
                            <ObjectAttribute 
                                text="{= ${products>Price} > 1000 ? 'Premium Product' : 'Standard Product'}"
                                visible="{= ${products>Price} > 0}"/>
                        </attributes>
                        
                        <!-- Markers for special conditions -->
                        <markers>
                            <ObjectMarker 
                                type="Flagged"
                                visible="{= ${products>Price} > 1500}"
                                press=".onPremiumMarkerPress"/>
                            <ObjectMarker 
                                type="Favorite"
                                visible="{= ${products>Rating} >= 4.5}"
                                press=".onHighRatingMarkerPress"/>
                        </markers>
                    </ObjectListItem>
                </items>
            </List>
        </content>
        
        <footer>
            <Toolbar>
                <content>
                    <!-- Dynamic footer content based on selection -->
                    <Text text="{= ${view>/itemCount} + ' products'}" />
                    <ToolbarSpacer/>
                    <Button 
                        icon="sap-icon://add" 
                        text="Add Product" 
                        type="Emphasized" 
                        press=".onAddPress"/>
                    <Button 
                        icon="sap-icon://filter" 
                        text="{= ${view>/hasFilters} ? 'Clear Filters' : 'Filter'}" 
                        press=".onFilterPress"/>
                </content>
            </Toolbar>
        </footer>
    </Page>
</mvc:View>
```

### Exercise 3: Performance-Optimized Binding (30 minutes)

**Task: Implement Efficient Binding for Large Datasets**

**Optimized Binding Controller:**
```javascript
// Enhanced Master Controller with Performance Optimizations
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "../model/formatter"
], function(Controller, Filter, FilterOperator, Sorter, MessageToast, formatter) {
    "use strict";

    return Controller.extend("com.productapp.controller.Master", {
        formatter: formatter,

        onInit: function() {
            this._setupModels();
            this._setupRouter();
            this._setupPerformanceOptimizations();
        },

        _setupModels: function() {
            var oProductsModel = this.getOwnerComponent().getModel("products");
            this.getView().setModel(oProductsModel, "products");
            
            // Create view model for UI state
            this._createViewModel();
        },

        _createViewModel: function() {
            var oViewModel = new sap.ui.model.json.JSONModel({
                itemCount: 0,
                hasFilters: false,
                hasSelection: false,
                busy: false,
                searchQuery: "",
                selectedCategory: ""
            });
            
            this.getView().setModel(oViewModel, "view");
        },

        _setupPerformanceOptimizations: function() {
            // Debounced search for better performance
            this._iSearchDelay = 300;
            
            // Virtual scrolling for large lists
            var oList = this.byId("productList");
            if (oList) {
                oList.setGrowingThreshold(50);
                oList.setGrowing(true);
                oList.setGrowingScrollToLoad(true);
            }
            
            // Optimize binding updates
            this._setupBindingOptimizations();
        },

        _setupBindingOptimizations: function() {
            var oProductsModel = this.getView().getModel("products");
            
            // Batch model updates for better performance
            oProductsModel.setDefaultBindingMode("OneWay");
            
            // Monitor binding performance
            this._monitorBindingPerformance();
        },

        _monitorBindingPerformance: function() {
            var oList = this.byId("productList");
            var oBinding = oList.getBinding("items");
            
            if (oBinding) {
                oBinding.attachChange(function() {
                    console.time("List Update");
                    setTimeout(function() {
                        console.timeEnd("List Update");
                    }, 0);
                });
            }
        },

        // Optimized search with debouncing
        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            
            // Clear previous timer
            if (this._iSearchTimer) {
                clearTimeout(this._iSearchTimer);
            }
            
            // Set busy state
            this.getView().getModel("view").setProperty("/busy", true);
            
            // Debounced search execution
            this._iSearchTimer = setTimeout(function() {
                this._performSearch(sQuery);
                this.getView().getModel("view").setProperty("/busy", false);
            }.bind(this), this._iSearchDelay);
        },

        _performSearch: function(sQuery) {
            var oList = this.byId("productList");
            var oBinding = oList.getBinding("items");
            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty("/searchQuery", sQuery);

            if (sQuery && sQuery.length > 0) {
                // Optimized filters - only create when needed
                var aFilters = this._createSearchFilters(sQuery);
                var oFilter = new Filter({
                    filters: aFilters,
                    and: false
                });
                
                oBinding.filter([oFilter]);
                oViewModel.setProperty("/hasFilters", true);
            } else {
                oBinding.filter([]);
                oViewModel.setProperty("/hasFilters", false);
            }
            
            // Update item count efficiently
            this._updateItemCount();
        },

        _createSearchFilters: function(sQuery) {
            // Cache filters for repeated searches
            if (!this._mFilterCache) {
                this._mFilterCache = new Map();
            }
            
            if (this._mFilterCache.has(sQuery)) {
                return this._mFilterCache.get(sQuery);
            }
            
            var aFilters = [
                new Filter("Name", FilterOperator.Contains, sQuery),
                new Filter("Description", FilterOperator.Contains, sQuery),
                new Filter("Category", FilterOperator.Contains, sQuery),
                new Filter("SupplierName", FilterOperator.Contains, sQuery)
            ];
            
            // Cache for future use (limit cache size)
            if (this._mFilterCache.size > 100) {
                this._mFilterCache.clear();
            }
            this._mFilterCache.set(sQuery, aFilters);
            
            return aFilters;
        },

        // Optimized category filtering
        onCategoryFilter: function(oEvent) {
            var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
            var oList = this.byId("productList");
            var oBinding = oList.getBinding("items");
            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty("/selectedCategory", sSelectedKey);

            if (sSelectedKey) {
                var oFilter = new Filter("Category", FilterOperator.EQ, sSelectedKey);
                oBinding.filter([oFilter]);
                oViewModel.setProperty("/hasFilters", true);
            } else {
                oBinding.filter([]);
                oViewModel.setProperty("/hasFilters", false);
            }
            
            this._updateItemCount();
        },

        _updateItemCount: function() {
            // Efficient item count update
            var oList = this.byId("productList");
            var oViewModel = this.getView().getModel("view");
            
            if (oList && oViewModel) {
                var oBinding = oList.getBinding("items");
                var iCount = oBinding ? oBinding.getLength() : 0;
                oViewModel.setProperty("/itemCount", iCount);
            }
        },

        // Optimized selection handling
        onSelectionChange: function(oEvent) {
            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var oContext = oItem.getBindingContext("products");
            
            if (!oContext) return;
            
            var sProductId = oContext.getProperty("ProductID");
            var oViewModel = this.getView().getModel("view");
            
            // Update selection state
            oViewModel.setProperty("/hasSelection", true);
            
            // Navigate with error handling
            try {
                this.getRouter().navTo("detail", {
                    productId: sProductId
                });
            } catch (oError) {
                console.error("Navigation failed:", oError);
                MessageToast.show("Navigation failed. Please try again.");
            }
        },

        // Performance monitoring
        onAfterRendering: function() {
            this._measureRenderingPerformance();
        },

        _measureRenderingPerformance: function() {
            var oList = this.byId("productList");
            if (oList) {
                var iItemCount = oList.getItems().length;
                console.log(`📊 Rendered ${iItemCount} list items`);
                
                // Monitor memory usage
                if (performance.memory) {
                    console.log(`💾 Memory usage: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`);
                }
            }
        },

        onExit: function() {
            // Clean up timers and caches
            if (this._iSearchTimer) {
                clearTimeout(this._iSearchTimer);
            }
            
            if (this._mFilterCache) {
                this._mFilterCache.clear();
            }
        }
    });
});
```

## 3. Practical Exercises & Problem-Solving (60 minutes)

### Challenge 1: Complex Calculated Fields (20 minutes)

**Scenario**: Implement dynamic pricing with discounts, taxes, and currency conversion

**Requirements:**
- Base price with quantity discounts
- Tax calculation based on location
- Currency conversion with real-time rates
- Performance optimization for frequent updates

### Challenge 2: Conditional UI Rendering (20 minutes)

**Task**: Create adaptive UI based on user roles and data states

**Requirements:**
- Role-based field visibility
- Dynamic form validation
- Conditional action availability
- State-dependent styling

### Challenge 3: Performance Optimization (20 minutes)

**Task**: Optimize binding for 10,000+ items

**Requirements:**
- Virtual scrolling implementation
- Efficient filtering and sorting
- Memory usage optimization
- Smooth user interactions

## 4. Integration with Official Resources

### UI5 SDK References
- **Expression Binding**: https://ui5.sap.com/topic/daf6852a04b44d118963968a1239d2c0
- **Formatters**: https://ui5.sap.com/topic/07e4b920f5734fd78fdaa236f26236d8
- **Binding Performance**: https://ui5.sap.com/topic/408b40efed3c416681e1bd8cdd8910d4

### Performance Guidelines
- **Binding Optimization**: https://ui5.sap.com/topic/25ab54b0113c4914999c43d07d3b71fe
- **Memory Management**: https://ui5.sap.com/topic/91f0c3ee6f4d1014b6dd926db0e91070

## Module Assessment

**Knowledge Check:**
1. Create complex expression binding scenarios
2. Implement performance-optimized formatters
3. Debug binding performance issues
4. Design efficient data transformation patterns

**Practical Assessment:**
1. Build advanced binding examples
2. Optimize existing binding performance
3. Create reusable formatter library
4. Implement complex calculated fields

## Next Module Preview

**Module 6: Fragments, Dialogs & Component Reusability**
- Fragment lifecycle and management
- Dialog patterns and best practices
- Component composition and reusability
- Memory-efficient fragment handling
