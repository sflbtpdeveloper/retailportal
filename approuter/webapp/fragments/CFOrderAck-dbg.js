sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageBox',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "zretail_sfl/formatter/formatter"

], function (Controller, JSONModel, MessageBox, Filter, FilterOperator, formatter) {
    "use strict";

    return Controller.extend("zretail_sfl.fragments.CForderAck", {
        formatter: formatter,
        onInit: function () {
            debugger;
            this._localModel = this.getOwnerComponent().getModel("mainService");
            this._readData();

        },
        onFragmentLoaded: function (oFragment) {
            debugger;
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("operations").attachPatternMatched(this._onObjectMatched, this);
            this._localModel = this.getOwnerComponent().getModel("mainService");
            this._readData();
        },
        onBeforeRendering: function () {
            if (this.oRouter) {
                // Detach PatternMatched before re-rendering
                this.oRouter.getRoute("operations").detachPatternMatched(this._onObjectMatched, this);
            }
        },
        onAfterRendering: function () {
            // Re-attach PatternMatched after rendering
            this.oRouter.getRoute("operations").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function () {
            debugger;
            // Detach the event handler to prevent further calls
            this.oRouter.getRoute("operations").detachPatternMatched(this._onObjectMatched, this);
            var sFragmentName = "zretail_sfl.fragments.front";
            var sControllerName = "zretail_sfl.fragments.front";
            var oFragment = this.getView();
            // var oParentView = oFragment.getParent(); 
            var oController = oFragment.getController();
            oController.loadFragment(sFragmentName, sControllerName);
        },

        _readData: async function () {
            debugger;
            this._userModel = this.getOwnerComponent().getModel("userModel");
            let storedUserInfo = localStorage.getItem("userInfo");
            if (storedUserInfo) {
                let parsedData = JSON.parse(storedUserInfo);
                this._userModel.setProperty("/",
                    {
                        email: parsedData.email,
                        user: parsedData.user, // Store user informationf 
                        scopes: parsedData.scopes, // Store user scopes
                        given_name: parsedData.user.given_name,
                        family_name: parsedData.user.family_name,
                        user_name: parsedData.user.user_name
                    });
            }

            // let sEmail = this._userModel.oData.email
            this._userModel = this.getOwnerComponent().getModel("userModel");
            // Define a filter for the OData request
            var sEmail = this._userModel.getProperty("/email");
            // let sEmail = "muthuramesh31@gmail.com"
            // let aFilters = [
            //     new sap.ui.model.Filter("Email", sap.ui.model.FilterOperator.EQ, sEmail)
            // ];

            // Retrieve selected division and tile selection from the models
            // const selectedDivision = this.getOwnerComponent().getModel("selectedDivisionModel").getProperty("/selectedDivision");
            // const selectedSflTile = this.getOwnerComponent().getModel("tileSelectedModel").getProperty("/selectedSflTile");
            // const selectedTplTile = this.getOwnerComponent().getModel("tileSelectedModel").getProperty("/selectedTplTile");

            // Retrieve selected division and tile selection from local storage
            const divisionData = JSON.parse(localStorage.getItem("divisionData")) || {};            
            // Extract the relevant data
            const selectedDivision = divisionData.selectedDivision || null;
            const selectedSflTile = divisionData.selectedSflTile || false;
            const selectedTplTile = divisionData.selectedTplTile || false;

            // Determine bukrs value based on tile selection
            let bukrs = null;
            let spart = null;
            if (selectedDivision) {
                spart = selectedDivision;
            }
            if (selectedSflTile) {
                bukrs = "5010";
            } else if (selectedTplTile) {
                bukrs = "6400";
            }

            // Create the query parameters to be passed in the AJAX request
            const params = {
                email: sEmail,
                bukrs: bukrs,
                spart: spart
            };

            var oModel = this.getOwnerComponent().getModel("mainService");
            oModel.refreshMetadata();
            oModel.refresh(true); // force a data refresh
            var sFragmentId = this._sFragmentUniqueId;
            this.getView().byId(sFragmentId + "--__OrderAckTable").setModel(oModel);
            // this.getView().byId("zretail_sfl.fragments.OrderAck--__OrderAckTable").setModel(oModel);            
            sap.ui.core.BusyIndicator.show(0);
            this.getOwnerComponent().setModel(oModel, "mainService");
            const that = this;
            sap.ui.core.BusyIndicator.show();

            try {
                // Make a request to your custom Node.js backend to get the CSRF token and DA list
                const response = await $.ajax({
                    url: "/nodeapp/acklist",     // Your custom backend route
                    method: "GET",              // Use GET since you're retrieving data         
                    contentType: "application/json",
                    // data: { email: sEmail }   // Send the email as a query parameter
                    data: params
                });
                // Success handling
                sap.ui.core.BusyIndicator.hide();  // Hide the busy indicator on success

                const AckList = response;        // Extract DA list data                               
                console.log(AckList);
                // const oJsonModel = new sap.ui.model.json.JSONModel(AckList);
                // that.getView().setModel(oJsonModel, "default");
                // console.log("Ack List fetched successfully:", AckList);

                var oJsonModel = new sap.ui.model.json.JSONModel();
                oJsonModel.setData(AckList);
                that.getView().setModel(oJsonModel, "listModel");

            } catch (oErr) {
                sap.ui.core.BusyIndicator.hide();
                console.error("Error fetching Ack List:", oErr);
                // If the error response contains a message, display it in the MessageBox
                const errorMessage = oErr.responseJSON?.error?.innererror?.errordetails?.[0]?.message || "Unknown error occurred";
            }


            // oModel.read("/YSD_RETAIL_ACKSet", {
            //     success: function (oData, response) {
            //         debugger;
            //         sap.ui.core.BusyIndicator.hide();
            //         var oJsonModel = new sap.ui.model.json.JSONModel();
            //         oJsonModel.setData(oData.results);
            //         that.getView().setModel(oJsonModel, "listModel");
            //     },
            //     error: function (oErr) {
            //         debugger;
            //         console.log(oErr);
            //         sap.ui.core.BusyIndicator.hide();
            //         MessageBox.error(JSON.parse(oErr.responseText).error.innererror.errordetails[0].message);
            //     }s
            // });

        },
        onPlant: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("Werks", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onSO: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("Vbkur", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onSG: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("Vkgrp", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onSotp: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("Kunnr", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onShtp: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("ShipParty", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onPO: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("Bstkd", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onDAT: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("Erdat", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onORD: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("Vbeln", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onPart: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            // this.getView().byId( sFragmentId + "--__OrderAckTable").setModel(oModel);

            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                // Create filters for each field you want to search on
                var oFilter1 = new Filter("Matnr", FilterOperator.Contains, sQuery);

                // Combine filters with OR
                aFilters.push(new Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filter to the binding
            oBinding.filter(aFilters);

        },
        onDownloadExcel: function () {
            // var sFragmentId = this._sFragmentUniqueId;
            // var oTable = this.getView().byId(sFragmentId + "--__OrderAckTable");
            // var aItems = oTable.getBinding("items").getContexts().map(function (oContext) {
            //     return oContext.getObject();
            // });

            var oModel = this.getView().getModel("listModel");
            var aItems = oModel.getProperty("/");
            if (!aItems || aItems.length === 0) {
                sap.m.MessageBox.error("No records found to download.");
                return;
            }
            // Prepare the data for the Excel file
            var aData = aItems.map(function (item) {
                return {
                    "Sales Office": item.Vbkur,
                    "Sales Group": item.Vkgrp,
                    "Region": item.Regio,
                    "Sold-to-Party": item.Kunnr,
                    "Ship-to-Party": item.ShipParty,
                    "PO Reference": item.Bstkd,
                    "PO Date": item.Bstdk,
                    "Sales Order No": item.Vbeln,
                    "Item": item.Posnr,
                    "Order Date": item.Erdat,
                    "Part Number": item.Matnr,
                    "Part Description": item.Arktx,
                    "Quantity": item.Kwmeng,
                    "Plant": item.Werks,
                    "Sales Value": item.Kzwi1,
                    "Sold-to-Party Name": item.Name1,
                    "Ship-to-Party Name": item.Cname1,
                    "Entered Material": item.Matwa,
                    // Add other fields as necessary
                };
            });

            // Convert the data to a CSV format
            var sCsvContent = this.convertToCsv(aData);

            // Create a Blob from the CSV content
            var blob = new Blob([sCsvContent], { type: 'text/csv;charset=utf-8;' });

            // Create a link element for downloading the file
            var link = document.createElement("a");
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "OrderAck_data.csv"); // Set the filename
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        convertToCsv: function (data) {
            var csv = '';
            // Create the headers
            var headers = Object.keys(data[0]);
            csv += headers.join(',') + '\r\n';

            // Create rows
            data.forEach(function (row) {
                csv += headers.map(function (header) {
                    return row[header] ? row[header].toString().replace(/,/g, ' ') : '';
                }).join(',') + '\r\n';
            });

            return csv;
        },
        //10.01.2025
        onOpenLayoutDialog: function () {
            var oDialog = this.byId("layoutDialog");
            if (!oDialog) {
                // create the dialog only once
                oDialog = sap.ui.xmlfragment("zretail_sfl.fragments.LayoutDialog", this);
                this.getView().addDependent(oDialog);
            }
            oDialog.open();
        },

        onCloseLayoutDialog: function () {
            this.byId("layoutDialog").close();
        },

        onColumnVisibilityChange: function (oEvent) {
            var oCheckBox = oEvent.getSource();
            var sText = oCheckBox.getText(); // Get the label text to determine which column to toggle
            var oColumn;

            // Map the text of the checkbox to column ID
            switch (sText) {
                case "Sales Office":
                    oColumn = this.byId("colSalesOffice");
                    break;
                case "Sales Group":
                    oColumn = this.byId("colSalesGroup");
                    break;
                case "Region":
                    oColumn = this.byId("colRegion");
                    break;
                case "Sold-to-Party":
                    oColumn = this.byId("colSoldToParty");
                    break;
                case "Ship-to-Party":
                    oColumn = this.byId("colShipToParty");
                    break;
                case "PO Reference / PO Date":
                    oColumn = this.byId("colPO");
                    break;
                case "Sales Order No / Item / Date":
                    oColumn = this.byId("colSalesOrder");
                    break;
                case "Part Number / Desc":
                    oColumn = this.byId("colPartNumber");
                    break;
                case "Quantity":
                    oColumn = this.byId("colQuantity");
                    break;
                case "Plant":
                    oColumn = this.byId("colPlant");
                    break;
                case "Sales Value":
                    oColumn = this.byId("colSalesValue");
                    break;
                case "Sold-to-Party Name":
                    oColumn = this.byId("colSoldToName");
                    break;
                case "Ship-to-Party Name":
                    oColumn = this.byId("colShipToName");
                    break;
                case "Entered Material":
                    oColumn = this.byId("colEnteredMaterial");
                    break;
                default:
                    return;
            }

            if (oColumn) {
                oColumn.setVisible(oCheckBox.getSelected());
            }
        }
        //10.01.2025
    })
});
