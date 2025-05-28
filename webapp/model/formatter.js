sap.ui.define([], function() {
    "use strict";
    
    return {
        formatPrice: function(price, currency) {
            if (!price) {
                return "";
            }
            
            return parseFloat(price).toFixed(2);
        },
        
        formatStockStatus: function(inStock) {
            return inStock ? "In Stock" : "Out of Stock";
        },
        
        formatStockStatusState: function(inStock) {
            return inStock ? "Success" : "Error";
        }
    };
});
