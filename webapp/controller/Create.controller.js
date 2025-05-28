sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, History, MessageBox, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("com.productapp.controller.Create", {
        onInit: function() {
            // s1. get the router instance
            this.oRouter = this.getOwnerComponent().getRouter();
            // s2. register for create route matched event
            this.oRouter.getRoute("create").attachPatternMatched(this._onCreateMatched, this);
            // s3. initialize the specs model
            this._initSpecificationsModel();
        },

        _onCreateMatched: function() {
            // s1. create a new empty product model with default values
            var oNewProduct = {
                Name: "",
                Description: "",
                Price: 0,
                Currency: "USD",
                Category: "",
                SupplierName: "",
                InStock: true,
                Quantity: 0,
                Rating: 0,
                // Today's date in YYYY-MM-DD format can be written write below
                ReleaseDate: new Date().toISOString().split("T")[0],
                Specifications: {}
            };
            
            // s2. setet the model to the view
            var oModel = new JSONModel(oNewProduct);
            this.getView().setModel(oModel, "products");
            
            // s3. initialize specs table
            this._initSpecificationsTable();
        },

        _initSpecificationsModel: function() {
            // create model for specs table
            var oSpecsModel = new JSONModel({
                specs: []
            });
            this.getView().setModel(oSpecsModel, "specs");
        },

        _initSpecificationsTable: function() {
            // convert the specs object to array for binding it to the table
            var oProduct = this.getView().getModel("products").getData();
            var aSpecs = [];
            
            // if the product has specs, add them to the array
            if (oProduct.Specifications) {
                Object.keys(oProduct.Specifications).forEach(function(key) {
                    aSpecs.push({
                        key: key,
                        value: oProduct.Specifications[key]
                    });
                });
            }
            
            // update the specs model
            var oSpecsModel = new JSONModel({
                specs: aSpecs
            });
            this.getView().setModel(oSpecsModel, "specs");
            
            // bind the table to the specs model
            var oTable = this.byId("specificationsTable");
            oTable.bindItems({
                path: "specs>/specs",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Input({value: "{specs>key}"}),
                        new sap.m.Input({value: "{specs>value}"}),
                        new sap.m.Button({
                            icon: "sap-icon://delete",
                            press: this.onDeleteSpecification.bind(this)
                        })
                    ]
                })
            });
        },

        onAddSpecification: function() {
            // get the specs model
            var oSpecsModel = this.getView().getModel("specs");
            var aSpecs = oSpecsModel.getProperty("/specs");
            // add a new empty row
            aSpecs.push({
                key: "",
                value: ""
            });
            // update the model
            oSpecsModel.setProperty("/specs", aSpecs);
        },

        onDeleteSpecification: function(oEvent) {
            // get the table row which we want to delete
            var oItem = oEvent.getSource().getParent();
            var oTable = this.byId("specificationsTable");
            var iIndex = oTable.indexOfItem(oItem);
            
            // get specs model
            var oSpecsModel = this.getView().getModel("specs");
            var aSpecs = oSpecsModel.getProperty("/specs");
            
            // remove the specs at the index
            if (iIndex !== -1) {
                aSpecs.splice(iIndex, 1);
                oSpecsModel.setProperty("/specs", aSpecs);
            }
        },

        onSavePress: function() {
            // get the product data from the form
            var oView = this.getView();
            var oProductModel = oView.getModel("products");
            var oProduct = oProductModel.getData();
            if (!oProduct.Name || !oProduct.Price) {
                MessageBox.error("Please fill in all required fields");
                return;
            }
            // converting specs from table format to object format
            var oSpecsModel = oView.getModel("specs");
            var aSpecs = oSpecsModel.getProperty("/specs");
            var oSpecifications = {};
            // add each valid specs to the object
            aSpecs.forEach(function(spec) {
                if (spec.key && spec.value) {
                    oSpecifications[spec.key] = spec.value;
                }
            });
            
            // update the product with specs
            oProduct.Specifications = oSpecifications;
            
            // generate a new product ID
            oProduct.ProductID = this._generateProductId();
            
            // get the main products model
            var oProductsModel = this.getOwnerComponent().getModel("products");
            var aProducts = oProductsModel.getData();
            
            // add the new product
            aProducts.push(oProduct);
            
            // update the model
            oProductsModel.setData(aProducts);
            oProductsModel.refresh(true);
            // show success message
            MessageToast.show("Product created successfully");
            // navigate back to master view
            this.oRouter.navTo("master");
        },

        _generateProductId: function() {
            // generating a uid
            var oProductsModel = this.getOwnerComponent().getModel("products");
            var aProducts = oProductsModel.getData();
            var iMaxId = 0;
            
            // find the highest existing ID for the product
            aProducts.forEach(function(product) {
                var iId = parseInt(product.ProductID, 10);
                if (iId > iMaxId) {
                    iMaxId = iId;
                }
            });
            // return the next ID as string
            return (iMaxId + 1).toString();
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                // go back in browser history
                window.history.go(-1);
            } else {
                // navigate to master view if no history
                this.oRouter.navTo("master", {}, true);
            }
        }
    });
});
