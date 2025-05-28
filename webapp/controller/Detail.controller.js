sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/Label",
    "sap/m/Text"
], function(Controller, History, MessageBox, MessageToast, JSONModel, formatter, Label, Text) {
    "use strict";

    return Controller.extend("com.productapp.controller.Detail", {
        formatter: formatter,

        onInit: function() {
            // s1. get the router instance
            this.oRouter = this.getOwnerComponent().getRouter();
            // s2. register for the detail route matched event
            this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function(oEvent) {
            // get product id from url param
            var sProductId = oEvent.getParameter("arguments").productId;
            // get products model from component
            var oProductsModel = this.getOwnerComponent().getModel("products");
            var aProducts = oProductsModel.getData();
            // finding the selected product
            var oSelectedProduct = null;
            for (var i = 0; i < aProducts.length; i++) {
                if (aProducts[i].ProductID === sProductId) {
                    oSelectedProduct = aProducts[i];
                    break;
                }
            }
            if (oSelectedProduct) {
                // create a model for the selected product
                var oModel = new JSONModel(oSelectedProduct);
                this.getView().setModel(oModel, "products");
                // set binding context for the view
                var sPath = "/" + i;
                var oContext = oProductsModel.createBindingContext(sPath);
                this.getView().setBindingContext(oContext, "products");
                
                // create specification fields dynamically
                this._createSpecificationFields(oSelectedProduct.Specifications);
            } else {
                MessageToast.show("Product not found");
                this.onNavBack();
            }
        },

        _createSpecificationFields: function(oSpecifications) {
            // get form from the icontabbar
            var oForm = this.getView().byId("idIconTabBar").getItems()[1].getContent()[0];
            // clear existing content, if any
            oForm.removeAllContent();
            // add specs fields dynamically
            if (oSpecifications) {
                Object.keys(oSpecifications).forEach(function(sKey) {
                    oForm.addContent(new Label({text: sKey}));
                    oForm.addContent(new Text({text: oSpecifications[sKey]}));
                });
            }
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.oRouter.navTo("master", {}, true);
            }
        },

        onEditPress: function() {
            // get product id from the current model
            var sProductId = this.getView().getModel("products").getProperty("/ProductID");
            // navigate to edit page with product id
            this.oRouter.navTo("edit", {
                productId: sProductId
            });
        },

        onDeletePress: function() {
            var that = this;
            
            // get product name from current model
            var sProductName = this.getView().getModel("products").getProperty("/Name");
            var sProductId = this.getView().getModel("products").getProperty("/ProductID");
            MessageBox.confirm("Are you sure you want to delete product '" + sProductName + "'?", {
                title: "Confirm Delete",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // get products model from component
                        var oProductsModel = that.getOwnerComponent().getModel("products");
                        var aProducts = oProductsModel.getData();
                        // find and remove the product
                        for (var i = 0; i < aProducts.length; i++) {
                            if (aProducts[i].ProductID === sProductId) {
                                aProducts.splice(i, 1);
                                break;
                            }
                        }
                        // update model
                        oProductsModel.setData(aProducts);
                        oProductsModel.refresh(true);
                        
                        MessageToast.show("Product deleted successfully");
                        that.oRouter.navTo("master");
                    }
                }
            });
        }
    });
});
