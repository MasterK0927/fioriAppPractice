sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function() {
    "use strict";
    return Controller.extend("com.productapp.controller.Categories", {
        onInit: function() {
            console.log("Categories controller initialized");
        },
        onCategorySelect: function(oEvent) {
            var oItem = oEvent.getParameter("listItem");
            // getParameter("parameterName") returns the value of the parameter
            // listItem is the name of the parameter, that is defined like this in the view
            // <List id="categoryList" mode="SingleSelectMaster" selectionChange=".onCategorySelect">
            //     <items>
            //         <StandardListItem title="Electronics" description="Tech products" type="Active"/>
            //     </items>
            // </List>
            var sCategory = oItem.getTitle();
            // getTitle() returns the title of the list item
            // <StandardListItem title="Electronics" description="Tech products" type="Active"/>
            MessageToast.show("Selected category: " + sCategory);
            // firing custom event to parent
            this.getOwnerComponent().getEventBus().publish(
                "categories", "selected", { category: sCategory }
            );
            // getOwnerComponent() returns the component that owns this controller
            // getEventBus() returns the event bus of the component
            // publish() publishes an event
            // "categories" is the name of the channel
            // "selected" is the name of the event
            // { category: sCategory } is the data that is passed to the event

        }
    })
})