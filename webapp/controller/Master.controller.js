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

        onInit: function() {
            // Get router instance
            this.oRouter = this.getOwnerComponent().getRouter();
            this._bDescendingSort = false;
            
            // Get products model from component
            var oProductsModel = this.getOwnerComponent().getModel("products");
            
            // Set the model to the view
            this.getView().setModel(oProductsModel, "products");
            
            // Log for debugging
            console.log("Master view initialized with products model");
        },

        onSearch: function(oEvent) {
            // Get search query from event
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            
            // Get list and its binding
            var oList = this.byId("productList");
            var oBinding = oList.getBinding("items");

            if (sQuery) {
                // Create filters for Name, Description and Category
                var aFilters = [
                    new Filter("Name", FilterOperator.Contains, sQuery),
                    new Filter("Description", FilterOperator.Contains, sQuery),
                    new Filter("Category", FilterOperator.Contains, sQuery)
                ];
                
                // Combine filters with OR
                var oFilter = new Filter({
                    filters: aFilters,
                    and: false // OR operation
                });
                
                // Apply filter
                oBinding.filter([oFilter]);
            } else {
                // Clear filters
                oBinding.filter([]);
            }
        },

        onSelectionChange: function(oEvent) {
            // Get selected item
            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            
            // Get binding context and product ID
            var oContext = oItem.getBindingContext("products");
            var sProductId = oContext.getProperty("ProductID");
            
            // Navigate to detail view with product ID
            this.oRouter.navTo("detail", {
                productId: sProductId
            });
            
            console.log("Navigating to product: " + sProductId);
        },

        onAddPress: function() {
            // Navigate to create view
            this.oRouter.navTo("create");
            console.log("Navigating to create new product");
        },

        onSort: function() {
            // Toggle sort direction
            this._bDescendingSort = !this._bDescendingSort;
            
            // Get list and its binding
            var oView = this.getView();
            var oList = oView.byId("productList");
            var oBinding = oList.getBinding("items");
            
            // Create sorter and apply
            var oSorter = new Sorter("Name", this._bDescendingSort);
            oBinding.sort(oSorter);
            
            // Show message
            var sMessage = this._bDescendingSort ? "Sorted Z to A" : "Sorted A to Z";
            MessageToast.show(sMessage);
        }
    });
});
