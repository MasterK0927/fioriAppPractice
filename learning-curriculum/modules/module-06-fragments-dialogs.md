# Module 6: Fragments, Dialogs & Component Reusability

**Duration**: 2.5-3 hours | **Level**: Intermediate | **Prerequisites**: Modules 1-5 completed

## Learning Objectives

By the end of this module, you will:
- Master fragment lifecycle and memory management
- Implement various dialog patterns and best practices
- Create reusable UI components and fragments
- Handle complex user interactions with dialogs
- Optimize fragment performance and prevent memory leaks

## 1. Conceptual Foundation (25 minutes)

### Fragment Concepts in UI5

**What are Fragments:**
- Reusable UI building blocks without their own controller
- Lightweight alternative to views for modular UI components
- Can be XML, HTML, or JavaScript-based
- Inherit controller context from parent view

**Fragment Types and Use Cases:**
```xml
<!-- XML Fragment (Most Common) -->
<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">
    <Dialog title="Confirm Action">
        <content>
            <Text text="Are you sure you want to proceed?"/>
        </content>
        <buttons>
            <Button text="OK" press="onConfirm"/>
            <Button text="Cancel" press="onCancel"/>
        </buttons>
    </Dialog>
</core:FragmentDefinition>
```

**How Fragments Enable UI Code Reuse:**
- **Modularity**: Break complex views into manageable pieces
- **Reusability**: Same fragment used across multiple views
- **Maintainability**: Single source of truth for common UI patterns
- **Performance**: Load fragments on-demand

### Dialog Patterns in Your Project

**Current Implementation Analysis:**
Your project currently uses simple MessageBox dialogs, but lacks custom dialogs and fragments. This module will enhance your application with:

<augment_code_snippet path="webapp/controller/Detail.controller.js" mode="EXCERPT">
````javascript
onDeletePress: function() {
    var sProductName = this.getView().getModel("products").getProperty("/Name");
    MessageBox.confirm("Are you sure you want to delete product '" + sProductName + "'?", {
        title: "Confirm Delete",
        onClose: function(oAction) {
            if (oAction === MessageBox.Action.OK) {
                // Delete logic
            }
        }
    });
}
````
</augment_code_snippet>

**Enhancement Opportunities:**
- Custom confirmation dialogs with rich content
- Product details popup dialogs
- Settings and preferences dialogs
- Multi-step wizard dialogs

### Common Fragment and Dialog Mistakes

**❌ Mistake 1: Fragment Memory Leaks**
```javascript
// Wrong: Creating fragment without proper cleanup
onOpenDialog: function() {
    var oDialog = sap.ui.xmlfragment("com.productapp.fragment.ProductDialog", this);
    oDialog.open();
    // Missing: this._oDialog = oDialog; for cleanup reference
}
```
**Impact**: Memory leaks, performance degradation

**❌ Mistake 2: Improper Dependency Injection**
```javascript
// Wrong: Fragment doesn't have access to controller methods
var oDialog = sap.ui.xmlfragment("com.productapp.fragment.ProductDialog");
// Missing: controller context binding
```
**Impact**: Runtime errors, broken functionality

**❌ Mistake 3: Synchronous Fragment Loading**
```javascript
// Wrong: Blocking UI thread
var oFragment = sap.ui.xmlfragment("com.productapp.fragment.LargeFragment", this);
```
**Impact**: Poor user experience, UI freezing

## 2. Hands-On Implementation (90 minutes)

### Exercise 1: Creating Reusable Fragments (30 minutes)

**Task: Create Product Details Fragment**

**Step 1: Create Product Details Fragment**
```xml
<!-- webapp/fragment/ProductDetails.fragment.xml -->
<core:FragmentDefinition
    xmlns="sap.m"
    xmlns:core="sap.ui.core"
    xmlns:f="sap.ui.layout.form">
    
    <Dialog
        id="productDetailsDialog"
        title="Product Details"
        contentWidth="600px"
        contentHeight="500px"
        resizable="true"
        draggable="true">
        
        <content>
            <IconTabBar expanded="true" class="sapUiResponsiveContentPadding">
                <items>
                    <IconTabFilter icon="sap-icon://product" key="basic" text="Basic Info">
                        <f:SimpleForm
                            editable="false"
                            layout="ResponsiveGridLayout"
                            labelSpanXL="4" labelSpanL="4" labelSpanM="4" labelSpanS="12"
                            adjustLabelSpan="false"
                            emptySpanXL="0" emptySpanL="0" emptySpanM="0" emptySpanS="0"
                            columnsXL="2" columnsL="2" columnsM="2"
                            singleContainerFullSize="false">
                            <f:content>
                                <Label text="Product ID:"/>
                                <Text text="{ProductID}"/>
                                
                                <Label text="Name:"/>
                                <Text text="{Name}"/>
                                
                                <Label text="Description:"/>
                                <Text text="{Description}"/>
                                
                                <Label text="Category:"/>
                                <Text text="{Category}"/>
                                
                                <Label text="Price:"/>
                                <Text text="{
                                    parts: [
                                        {path: 'Price'},
                                        {path: 'Currency'}
                                    ],
                                    formatter: '.formatter.formatPrice'
                                }"/>
                                
                                <Label text="Supplier:"/>
                                <Text text="{SupplierName}"/>
                            </f:content>
                        </f:SimpleForm>
                    </IconTabFilter>
                    
                    <IconTabFilter icon="sap-icon://inventory" key="inventory" text="Inventory">
                        <f:SimpleForm
                            editable="false"
                            layout="ResponsiveGridLayout">
                            <f:content>
                                <Label text="In Stock:"/>
                                <ObjectStatus
                                    text="{= ${InStock} ? 'Yes' : 'No'}"
                                    state="{= ${InStock} ? 'Success' : 'Error'}"/>
                                
                                <Label text="Quantity:"/>
                                <Text text="{Quantity}"/>
                                
                                <Label text="Rating:"/>
                                <RatingIndicator value="{Rating}" maxValue="5" enabled="false"/>
                                
                                <Label text="Release Date:"/>
                                <Text text="{
                                    path: 'ReleaseDate',
                                    type: 'sap.ui.model.type.Date',
                                    formatOptions: {
                                        style: 'medium'
                                    }
                                }"/>
                            </f:content>
                        </f:SimpleForm>
                    </IconTabFilter>
                    
                    <IconTabFilter icon="sap-icon://technical-object" key="specs" text="Specifications">
                        <VBox class="sapUiMediumMargin">
                            <Text text="Technical Specifications" class="sapUiMediumMarginBottom"/>
                            <!-- Specifications will be added dynamically -->
                            <VBox id="specificationsContainer"/>
                        </VBox>
                    </IconTabFilter>
                </items>
            </IconTabBar>
        </content>
        
        <buttons>
            <Button text="Edit" type="Emphasized" press="onEditFromDialog"/>
            <Button text="Close" press="onCloseProductDetails"/>
        </buttons>
    </Dialog>
</core:FragmentDefinition>
```

**Step 2: Create Confirmation Dialog Fragment**
```xml
<!-- webapp/fragment/ConfirmationDialog.fragment.xml -->
<core:FragmentDefinition
    xmlns="sap.m"
    xmlns:core="sap.ui.core">
    
    <Dialog
        id="confirmationDialog"
        title="{dialog>/title}"
        type="Message"
        state="{dialog>/state}">
        
        <content>
            <VBox class="sapUiMediumMargin">
                <Icon 
                    src="{dialog>/icon}" 
                    size="3rem" 
                    color="{dialog>/iconColor}"
                    class="sapUiMediumMarginBottom"/>
                <Text 
                    text="{dialog>/message}" 
                    textAlign="Center"
                    class="sapUiMediumMarginBottom"/>
                <Text 
                    text="{dialog>/details}" 
                    textAlign="Center"
                    visible="{= ${dialog>/details} !== ''}"
                    class="sapUiSmallText"/>
            </VBox>
        </content>
        
        <buttons>
            <Button 
                text="{dialog>/confirmText}" 
                type="{dialog>/confirmType}"
                press="onConfirmAction"/>
            <Button 
                text="{dialog>/cancelText}" 
                press="onCancelAction"/>
        </buttons>
    </Dialog>
</core:FragmentDefinition>
```

**Step 3: Create Settings Dialog Fragment**
```xml
<!-- webapp/fragment/SettingsDialog.fragment.xml -->
<core:FragmentDefinition
    xmlns="sap.m"
    xmlns:core="sap.ui.core"
    xmlns:f="sap.ui.layout.form">
    
    <Dialog
        id="settingsDialog"
        title="Application Settings"
        contentWidth="500px"
        resizable="true">
        
        <content>
            <f:SimpleForm
                editable="true"
                layout="ResponsiveGridLayout"
                labelSpanXL="4" labelSpanL="4" labelSpanM="4" labelSpanS="12"
                adjustLabelSpan="false"
                emptySpanXL="0" emptySpanL="0" emptySpanM="0" emptySpanS="0"
                columnsXL="1" columnsL="1" columnsM="1"
                singleContainerFullSize="false">
                <f:content>
                    <core:Title text="Display Settings"/>
                    
                    <Label text="Theme:"/>
                    <ComboBox selectedKey="{settings>/theme}">
                        <core:Item key="sap_fiori_3" text="Fiori 3.0"/>
                        <core:Item key="sap_fiori_3_dark" text="Fiori 3.0 Dark"/>
                        <core:Item key="sap_belize" text="Belize"/>
                    </ComboBox>
                    
                    <Label text="Items per Page:"/>
                    <StepInput 
                        value="{settings>/itemsPerPage}" 
                        min="10" 
                        max="100" 
                        step="10"/>
                    
                    <Label text="Show Product Images:"/>
                    <Switch state="{settings>/showImages}"/>
                    
                    <Label text="Auto-save Changes:"/>
                    <Switch state="{settings>/autoSave}"/>
                    
                    <core:Title text="Notification Settings"/>
                    
                    <Label text="Email Notifications:"/>
                    <Switch state="{settings>/emailNotifications}"/>
                    
                    <Label text="Sound Alerts:"/>
                    <Switch state="{settings>/soundAlerts}"/>
                    
                    <Label text="Notification Frequency:"/>
                    <ComboBox selectedKey="{settings>/notificationFrequency}">
                        <core:Item key="immediate" text="Immediate"/>
                        <core:Item key="hourly" text="Hourly"/>
                        <core:Item key="daily" text="Daily"/>
                        <core:Item key="weekly" text="Weekly"/>
                    </ComboBox>
                </f:content>
            </f:SimpleForm>
        </content>
        
        <buttons>
            <Button text="Save" type="Emphasized" press="onSaveSettings"/>
            <Button text="Reset" press="onResetSettings"/>
            <Button text="Cancel" press="onCancelSettings"/>
        </buttons>
    </Dialog>
</core:FragmentDefinition>
```

### Exercise 2: Fragment Management Service (30 minutes)

**Task: Create Centralized Fragment Management**

**Create Fragment Manager Service:**
```javascript
// webapp/service/FragmentManager.js
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function(BaseObject, Fragment, JSONModel) {
    "use strict";
    
    return BaseObject.extend("com.productapp.service.FragmentManager", {
        
        constructor: function(oController) {
            this._oController = oController;
            this._mFragments = new Map();
            this._mDialogModels = new Map();
        },
        
        /**
         * Opens a fragment dialog with proper lifecycle management
         * @param {string} sFragmentName - Name of the fragment
         * @param {object} oData - Data to bind to the fragment
         * @param {object} mSettings - Additional settings
         * @returns {Promise} Promise that resolves when fragment is loaded
         */
        openFragment: function(sFragmentName, oData, mSettings) {
            var that = this;
            mSettings = mSettings || {};
            
            return new Promise(function(resolve, reject) {
                // Check if fragment already exists
                if (that._mFragments.has(sFragmentName)) {
                    var oFragment = that._mFragments.get(sFragmentName);
                    that._bindFragmentData(oFragment, oData);
                    oFragment.open();
                    resolve(oFragment);
                    return;
                }
                
                // Load fragment asynchronously
                Fragment.load({
                    name: "com.productapp.fragment." + sFragmentName,
                    controller: that._oController
                }).then(function(oFragment) {
                    // Store fragment reference
                    that._mFragments.set(sFragmentName, oFragment);
                    
                    // Add to view's dependent aggregation for cleanup
                    that._oController.getView().addDependent(oFragment);
                    
                    // Bind data if provided
                    if (oData) {
                        that._bindFragmentData(oFragment, oData);
                    }
                    
                    // Apply settings
                    that._applyFragmentSettings(oFragment, mSettings);
                    
                    // Open fragment
                    oFragment.open();
                    
                    resolve(oFragment);
                }).catch(function(oError) {
                    console.error("Failed to load fragment:", sFragmentName, oError);
                    reject(oError);
                });
            });
        },
        
        /**
         * Closes a fragment dialog
         * @param {string} sFragmentName - Name of the fragment to close
         */
        closeFragment: function(sFragmentName) {
            if (this._mFragments.has(sFragmentName)) {
                var oFragment = this._mFragments.get(sFragmentName);
                oFragment.close();
            }
        },
        
        /**
         * Destroys a fragment and cleans up resources
         * @param {string} sFragmentName - Name of the fragment to destroy
         */
        destroyFragment: function(sFragmentName) {
            if (this._mFragments.has(sFragmentName)) {
                var oFragment = this._mFragments.get(sFragmentName);
                oFragment.destroy();
                this._mFragments.delete(sFragmentName);
                
                // Clean up associated model
                if (this._mDialogModels.has(sFragmentName)) {
                    this._mDialogModels.delete(sFragmentName);
                }
            }
        },
        
        /**
         * Binds data to fragment
         * @param {object} oFragment - Fragment instance
         * @param {object} oData - Data to bind
         */
        _bindFragmentData: function(oFragment, oData) {
            var oModel = new JSONModel(oData);
            oFragment.setModel(oModel);
        },
        
        /**
         * Applies settings to fragment
         * @param {object} oFragment - Fragment instance
         * @param {object} mSettings - Settings to apply
         */
        _applyFragmentSettings: function(oFragment, mSettings) {
            if (mSettings.title) {
                oFragment.setTitle(mSettings.title);
            }
            
            if (mSettings.resizable !== undefined) {
                oFragment.setResizable(mSettings.resizable);
            }
            
            if (mSettings.draggable !== undefined) {
                oFragment.setDraggable(mSettings.draggable);
            }
            
            if (mSettings.contentWidth) {
                oFragment.setContentWidth(mSettings.contentWidth);
            }
            
            if (mSettings.contentHeight) {
                oFragment.setContentHeight(mSettings.contentHeight);
            }
        },
        
        /**
         * Creates a confirmation dialog with custom settings
         * @param {object} mConfig - Dialog configuration
         * @returns {Promise} Promise that resolves with user action
         */
        showConfirmationDialog: function(mConfig) {
            var that = this;
            
            return new Promise(function(resolve) {
                var oDialogData = {
                    title: mConfig.title || "Confirm",
                    message: mConfig.message || "Are you sure?",
                    details: mConfig.details || "",
                    icon: mConfig.icon || "sap-icon://question-mark",
                    iconColor: mConfig.iconColor || "#0070f2",
                    state: mConfig.state || "None",
                    confirmText: mConfig.confirmText || "OK",
                    cancelText: mConfig.cancelText || "Cancel",
                    confirmType: mConfig.confirmType || "Emphasized"
                };
                
                // Store resolve function for callback
                that._fnConfirmResolve = resolve;
                
                that.openFragment("ConfirmationDialog", {dialog: oDialogData});
            });
        },
        
        /**
         * Handles confirmation dialog actions
         * @param {boolean} bConfirmed - Whether user confirmed
         */
        handleConfirmationResult: function(bConfirmed) {
            if (this._fnConfirmResolve) {
                this._fnConfirmResolve(bConfirmed);
                this._fnConfirmResolve = null;
            }
            this.closeFragment("ConfirmationDialog");
        },
        
        /**
         * Destroys all fragments and cleans up resources
         */
        destroy: function() {
            // Destroy all fragments
            this._mFragments.forEach(function(oFragment, sName) {
                oFragment.destroy();
            });
            
            // Clear maps
            this._mFragments.clear();
            this._mDialogModels.clear();
            
            // Clear references
            this._oController = null;
            this._fnConfirmResolve = null;
        }
    });
});
```

### Exercise 3: Enhanced Controller Integration (30 minutes)

**Task: Integrate Fragment Manager into Controllers**

**Enhanced Master Controller with Fragment Support:**
```javascript
// Enhanced webapp/controller/Master.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "../model/formatter",
    "../service/FragmentManager"
], function(Controller, Filter, FilterOperator, MessageToast, formatter, FragmentManager) {
    "use strict";

    return Controller.extend("com.productapp.controller.Master", {
        formatter: formatter,

        onInit: function() {
            this._setupModels();
            this._setupRouter();
            this._setupFragmentManager();
        },

        _setupFragmentManager: function() {
            this._oFragmentManager = new FragmentManager(this);
        },

        // Enhanced product selection with quick view dialog
        onSelectionChange: function(oEvent) {
            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var oContext = oItem.getBindingContext("products");
            
            if (!oContext) return;
            
            var sProductId = oContext.getProperty("ProductID");
            var oProduct = oContext.getObject();
            
            // Show quick view dialog
            this._showProductQuickView(oProduct);
            
            // Navigate to detail view
            this.getRouter().navTo("detail", {
                productId: sProductId
            });
        },

        _showProductQuickView: function(oProduct) {
            this._oFragmentManager.openFragment("ProductDetails", oProduct, {
                title: "Product: " + oProduct.Name,
                contentWidth: "600px",
                contentHeight: "500px"
            });
        },

        // Settings dialog
        onOpenSettings: function() {
            var oSettingsData = {
                theme: "sap_fiori_3",
                itemsPerPage: 20,
                showImages: true,
                autoSave: true,
                emailNotifications: false,
                soundAlerts: true,
                notificationFrequency: "daily"
            };
            
            this._oFragmentManager.openFragment("SettingsDialog", {settings: oSettingsData});
        },

        // Enhanced delete with custom confirmation
        onDeleteProduct: function(oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("products");
            var oProduct = oContext.getObject();
            
            this._oFragmentManager.showConfirmationDialog({
                title: "Delete Product",
                message: `Are you sure you want to delete "${oProduct.Name}"?`,
                details: "This action cannot be undone.",
                icon: "sap-icon://delete",
                iconColor: "#bb0000",
                state: "Error",
                confirmText: "Delete",
                confirmType: "Reject"
            }).then(function(bConfirmed) {
                if (bConfirmed) {
                    this._deleteProduct(oProduct);
                }
            }.bind(this));
        },

        _deleteProduct: function(oProduct) {
            var oProductsModel = this.getOwnerComponent().getModel("products");
            var aProducts = oProductsModel.getData();
            
            var iIndex = aProducts.findIndex(function(product) {
                return product.ProductID === oProduct.ProductID;
            });
            
            if (iIndex >= 0) {
                aProducts.splice(iIndex, 1);
                oProductsModel.setData(aProducts);
                oProductsModel.refresh(true);
                
                MessageToast.show("Product deleted successfully");
            }
        },

        // Fragment event handlers
        onEditFromDialog: function() {
            var oDialog = this._oFragmentManager._mFragments.get("ProductDetails");
            var oProduct = oDialog.getModel().getData();
            
            this._oFragmentManager.closeFragment("ProductDetails");
            this.getRouter().navTo("edit", {
                productId: oProduct.ProductID
            });
        },

        onCloseProductDetails: function() {
            this._oFragmentManager.closeFragment("ProductDetails");
        },

        onConfirmAction: function() {
            this._oFragmentManager.handleConfirmationResult(true);
        },

        onCancelAction: function() {
            this._oFragmentManager.handleConfirmationResult(false);
        },

        onSaveSettings: function() {
            var oDialog = this._oFragmentManager._mFragments.get("SettingsDialog");
            var oSettings = oDialog.getModel().getData().settings;
            
            // Save settings to user preferences
            this._saveUserSettings(oSettings);
            
            this._oFragmentManager.closeFragment("SettingsDialog");
            MessageToast.show("Settings saved successfully");
        },

        onResetSettings: function() {
            var oDialog = this._oFragmentManager._mFragments.get("SettingsDialog");
            var oDefaultSettings = {
                theme: "sap_fiori_3",
                itemsPerPage: 20,
                showImages: true,
                autoSave: true,
                emailNotifications: false,
                soundAlerts: true,
                notificationFrequency: "daily"
            };
            
            oDialog.getModel().setData({settings: oDefaultSettings});
        },

        onCancelSettings: function() {
            this._oFragmentManager.closeFragment("SettingsDialog");
        },

        _saveUserSettings: function(oSettings) {
            // In a real application, this would save to backend
            localStorage.setItem("userSettings", JSON.stringify(oSettings));
            
            // Apply theme change immediately
            if (oSettings.theme) {
                sap.ui.getCore().applyTheme(oSettings.theme);
            }
        },

        onExit: function() {
            // Clean up fragment manager
            if (this._oFragmentManager) {
                this._oFragmentManager.destroy();
            }
        }
    });
});
```

## 3. Practical Exercises & Problem-Solving (60 minutes)

### Challenge 1: Multi-Step Wizard Dialog (20 minutes)

**Scenario**: Create a product creation wizard with multiple steps

**Requirements:**
- Step-by-step product creation
- Validation at each step
- Progress indicator
- Ability to go back and forth

### Challenge 2: Dynamic Fragment Loading (20 minutes)

**Task**: Implement lazy loading of fragments based on user actions

**Requirements:**
- Load fragments only when needed
- Cache frequently used fragments
- Implement loading indicators
- Handle loading errors gracefully

### Challenge 3: Fragment Communication (20 minutes)

**Task**: Implement communication between fragments and parent views

**Requirements:**
- Event-based communication
- Data synchronization
- State management
- Error propagation

## 4. Integration with Official Resources

### UI5 SDK References
- **Fragments**: https://ui5.sap.com/topic/36a5b130076e4b4aac2c27eebf324909
- **Dialogs**: https://ui5.sap.com/topic/3cc9ae0c9c2e4353a5b2b2c7e1c5c2c8
- **Fragment Loading**: https://ui5.sap.com/api/sap.ui.core.Fragment

### Best Practices
- **Fragment Lifecycle**: https://ui5.sap.com/topic/c24ea6d4b8a24b0e9c7e8f9a1b2c3d4e
- **Memory Management**: https://ui5.sap.com/topic/91f0c3ee6f4d1014b6dd926db0e91070

## Module Assessment

**Knowledge Check:**
1. Explain fragment lifecycle and memory management
2. Demonstrate dialog patterns and best practices
3. Implement reusable UI components
4. Handle complex user interactions

**Practical Assessment:**
1. Create comprehensive fragment library
2. Implement fragment management service
3. Build multi-step wizard dialog
4. Optimize fragment performance

## Next Module Preview

**Module 7: Routing, Navigation & Deep Linking**
- Advanced routing patterns and configurations
- URL parameter handling and validation
- Navigation guards and route protection
- SEO-friendly URLs and bookmarking
