sap.ui.define([
    'zretail_sfl/controller/BaseController',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "zretail_sfl/formatter/formatter"

], function (BaseController, Filter, FilterOperator, formatter) {
    "use strict";

    return BaseController.extend("zretail_sfl.controller.Price", {
        formatter: formatter,
        onInit: function () {
            debugger;
            this._localModel = this.getOwnerComponent().getModel("mainService");
            this._readData();
        },
        onFragmentLoaded: function (oFragment) {
            debugger;
            //04022025
            const divisionData = JSON.parse(localStorage.getItem("divisionData")) || {};
            let spart = divisionData.selectedDivision || null;

            let oViewModel = new sap.ui.model.json.JSONModel({ spart: spart });
            this.getView().setModel(oViewModel, "viewModel");
            //04022025
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("operations").attachPatternMatched(this._onObjectMatched, this);
            this._localModel = this.getOwnerComponent().getModel("mainService");
            this._readData();
        },
        onBeforeRendering: function () {
            debugger;
            if (this.oRouter) {
                // Detach PatternMatched before re-rendering
                this.oRouter.getRoute("operations").detachPatternMatched(this._onObjectMatched, this);
            }
        },
        onAfterRendering: function () {
            debugger;
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
                // spart = selectedDivision.oSource.mProperties.header;
            }
            if (selectedSflTile) {
                bukrs = "5010";
            } else if (selectedTplTile) {
                bukrs = "6400";
            }

            //04022025
            // Set spart in a view model
            let oViewModel = new sap.ui.model.json.JSONModel({
                spart: spart
            });

            this.getView().setModel(oViewModel, "viewModel");
            //04022025

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
            this.getView().byId(sFragmentId + "--__PriceTable").setModel(oModel);
            // this.getView().byId("zretail_sfl.fragments.OrderAck--__PriceTable").setModel(oModel);            
            sap.ui.core.BusyIndicator.show(0);
            this.getOwnerComponent().setModel(oModel, "mainService");
            const that = this;
            sap.ui.core.BusyIndicator.show();

            try {
                // Make a request to your custom Node.js backend to get the CSRF token and DA list
                const response = await $.ajax({
                    url: "/nodeapp/Pricelist",     // Your custom backend route
                    method: "GET",              // Use GET since you're retrieving data         
                    contentType: "application/json",
                    // data: { email: sEmail }   // Send the email as a query parameter
                    data: params
                });
                // Success handling
                sap.ui.core.BusyIndicator.hide();  // Hide the busy indicator on success

                const PriceList = response;        // Extract DA list data                               
                console.log(PriceList);
                // const oJsonModel = new sap.ui.model.json.JSONModel(AckList);
                // that.getView().setModel(oJsonModel, "default");
                // console.log("Ack List fetched successfully:", AckList);

                var oJsonModel = new sap.ui.model.json.JSONModel();
                oJsonModel.setData(PriceList);
                that.getView().setModel(oJsonModel, "listModel");

            } catch (oErr) {
                sap.ui.core.BusyIndicator.hide();
                // Refresh the listModel with an empty dataset
                var oJsonModel = new sap.ui.model.json.JSONModel();
                oJsonModel.setData([]); // Set an empty array to indicate no data
                that.getView().setModel(oJsonModel, "listModel");

                console.error("Error fetching Price List:", oErr);
                // If the error response contains a message, display it in the MessageBox
                const errorMessage = oErr.responseJSON?.error?.innererror?.errordetails?.[0]?.message || "Unknown error occurred";
            }


            // oModel.read("/YSD_RETAIL_PRICESet", {
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
            //         MessageBox.error(JSON.parse(oErr.responseText).error.innererror.errordetails[0].message);
            //     }
            // });
        },
        // onMatnr: function (oEvent) {
        //     debugger;
        //     this._applyFilters();
        // },
        onMatnr: function (oEvent) {
            // Get the search query
            debugger;
            var sFragmentId = this._sFragmentUniqueId;
            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.getView().byId(sFragmentId + "--__PriceTable");
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
        _applyFilters: function () {
            var aFilters = [];
            // Get values from the search fields
            var sMatnr = this.byId("searchFieldMatnr").getValue();

            if (sMatnr) {
                aFilters.push(new Filter("Matnr", FilterOperator.Contains, sMatnr));
            }

            var oTable = this.byId("priceTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                if (aFilters.length > 0) {
                    // Ensure filters is an array
                    if (!Array.isArray(aFilters)) {
                        console.error("Filters is not an array:", aFilters);
                        return; // Exit early if filters is not valid
                    }
                    var oCombinedFilter = new Filter({
                        filters: aFilters,
                        and: true
                    });
                    oBinding.filter(oCombinedFilter);
                } else {
                    oBinding.filter([]); // Clear filters
                }
            }
        },
        onDownloadExcel: function () {
            // var oTable = this.getView().byId(sFragmentId + "--__PriceTable");
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
                    "Material Number": item.Matnr,
                    "Price": item.Kbetr,
                    "Pricing Unit": item.Kpein,
                    "UoM": item.Kmein,
                    "Currency": item.Konwa
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
            link.setAttribute("download", "PriceList_data.csv"); // Set the filename
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
    });
});
