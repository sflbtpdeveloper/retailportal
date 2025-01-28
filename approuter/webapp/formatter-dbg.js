sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function () {
    "use strict";
    return {
        formatDate: function(date) {
            debugger;
            if (!date) {
                return "";
            }
            var oDateFormat = DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd'T'HH:mm:ss"
            });
            return oDateFormat.format(new Date(date));
        },
        removeLeadingZeros: function(value) {
            if (value) {
                return parseInt(value, 10); // Converts to an integer, removing leading zeros
            }
            return value;
        },        
        formatInteger: function(value)
        {
            if (value) {
                return Math.floor(value); // Converts to an integer by removing decimals
            }
            return value;                   
        }, 
        formatDateStat: function (sValue) {
            if (sValue) {
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "dd-MM-yyyy" });
                return oDateFormat.format(new Date(sValue));
            }
            return sValue;
        }               
    };
});