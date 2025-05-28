sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, History, MessageBox, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("com.productapp.controller.Edit", {
        onInit: function() {
            // Get router instance
            this.oRouter = this.getOwnerComponent().getRouter();
            
            // Register for the edit route matched event
            this.oRouter.getRoute("edit").attachPatternMatched(this._onEditMatched, this);
        },

        _onEditMatched: function(oEvent) {
            // Get product ID from URL parameter
            var sProductId = oEvent.getParameter("arguments").productId;
            
            // Get products model from component
            var oProductsModel = this.getOwnerComponent().getModel("products");
            var aProducts = oProductsModel.getData();
            
            // Find the selected product
            var oSelectedProduct = null;
            for (var i = 0; i < aProducts.length; i++) {
                if (aProducts[i].ProductID === sProductId) {
                    oSelectedProduct = aProducts[i];
                    this.productIndex = i; // Store index for later update
                    break;
                }
            }
            
            if (oSelectedProduct) {
                // Create a copy of the product to avoid changing the original directly
                var oEditProduct = JSON.parse(JSON.stringify(oSelectedProduct));
                
                // Create a model for the edit form
                var oModel = new JSONModel(oEditProduct);
                this.getView().setModel(oModel, "products");
                
                // Initialize specifications table
                this._initSpecificationsTable(oEditProduct.Specifications);
            } else {
                // Show error message if product not found
                MessageToast.show("Product not found");
                this.onNavBack();
            }
        },

        _initSpecificationsTable: function(oSpecifications) {
            // Convert specifications object to array for table binding
            var aSpecs = [];
            
            if (oSpecifications) {
                // Loop through each specification and add to array
                Object.keys(oSpecifications).forEach(function(key) {
                    aSpecs.push({
                        key: key,
                        value: oSpecifications[key]
                    });
                });
            }
            
            // Create model for specifications table
            var oSpecsModel = new JSONModel({
                specs: aSpecs
            });
            this.getView().setModel(oSpecsModel, "specs");
        },

        onAddSpecification: function() {
            // Get specifications model
            var oSpecsModel = this.getView().getModel("specs");
            var aSpecs = oSpecsModel.getProperty("/specs");
            
            // Add a new empty row
            aSpecs.push({
                key: "",
                value: ""
            });
            
            // Update the model
            oSpecsModel.setProperty("/specs", aSpecs);
        },

        onDeleteSpecification: function(oEvent) {
            // Get the table row to delete
            var oItem = oEvent.getSource().getParent();
            var oTable = this.byId("specificationsTable");
            var iIndex = oTable.indexOfItem(oItem);
            
            // Get specifications model
            var oSpecsModel = this.getView().getModel("specs");
            var aSpecs = oSpecsModel.getProperty("/specs");
            
            // Remove the specification at the index
            if (iIndex !== -1) {
                aSpecs.splice(iIndex, 1);
                oSpecsModel.setProperty("/specs", aSpecs);
            }
        },

        onSavePress: function() {
            // Get the product data from the form
            var oView = this.getView();
            var oProductModel = oView.getModel("products");
            var oProduct = oProductModel.getData();
            
            // Basic validation
            if (!oProduct.Name || !oProduct.Price) {
                MessageBox.error("Please fill in all required fields");
                return;
            }
            
            // Convert specifications from table format back to object format
            var oSpecsModel = oView.getModel("specs");
            var aSpecs = oSpecsModel.getProperty("/specs");
            var oSpecifications = {};
            
            // Add each valid specification to the object
            aSpecs.forEach(function(spec) {
                if (spec.key && spec.value) {
                    oSpecifications[spec.key] = spec.value;
                }
            });
            
            // Update the product with specifications
            oProduct.Specifications = oSpecifications;
            
            // Get the main products model
            var oProductsModel = this.getOwnerComponent().getModel("products");
            var aProducts = oProductsModel.getData();
            
            // Update the product in the array
            if (this.productIndex !== undefined) {
                aProducts[this.productIndex] = oProduct;
                
                // Update the model
                oProductsModel.setData(aProducts);
                oProductsModel.refresh(true);
                
                // Show success message
                MessageToast.show("Product updated successfully");
                
                // Navigate back to detail view
                this.oRouter.navTo("detail", {
                    productId: oProduct.ProductID
                });
            } else {
                MessageBox.error("Error updating product");
            }
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                // Go back in browser history
                window.history.go(-1);
            } else {
                // Navigate to detail view if no history
                this.oRouter.navTo("detail", {
                    productId: this.getView().getModel("products").getProperty("/ProductID")
                }, true);
            }
        }
    });
});
