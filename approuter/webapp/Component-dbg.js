/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "zretail_sfl/model/models"
],
function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("zretail_sfl.Component", {
        metadata: {
            manifest: "json"
        },        

        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // enable routing
            this.getRouter().initialize();

            // set the device model
            this.setModel(models.createDeviceModel(), "device"); 
            
            var jQueryScript = document.createElement('script');
            jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/jszip.js');
            document.head.appendChild(jQueryScript);
        
        
            var jQueryScript = document.createElement('script');
            jQueryScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.0/xlsx.js');
            document.head.appendChild(jQueryScript);             
        }
    });
}
);