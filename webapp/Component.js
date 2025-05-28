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

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function() {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(models.createDeviceModel(), "device");
            this.getRouter().initialize();
            var oProductsModel = new JSONModel(this.getManifestEntry("sap.app").dataSources.productsData.uri);
            this.setModel(oProductsModel, "products");
        },

        /**
         * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
         * design mode class should be set, which influences the size appearance of some controls.
         * @public
         * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy'
         */
        getContentDensityClass: function() {
            if (!this._sContentDensityClass) {
                // check whether FLP has already set the content density class
                if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                    this._sContentDensityClass = "";
                } else if (!Device.support.touch) {
                    // apply "compact" mode if touch is not supported
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    // "cozy" in case of touch support; default for most sap.m controls
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        }
    });
});
