sap.ui.define([
    'sap/ui/core/mvc/Controller',
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
],
    function (Controller, ODataModel, MessageToast, MessageBox, JSONModel) {
        "use strict";
        return Controller.extend("zretail_sfl.controller.TestCert", {
            onInit: function () {
                this._localModel = this.getOwnerComponent().getModel("local");
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("operations").attachPatternMatched(this._onObjectMatched, this);
            },

            onFragmentLoaded: function (oFragment) {
                debugger;
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("operations").attachPatternMatched(this._onObjectMatched, this);
                this._localModel = this.getOwnerComponent().getModel("mainService");
            },

            onInvoiceChange: async function (oEvent) {
                // var sViewId = this._sFragmentUniqueId;

                var dropModel = this.getOwnerComponent().getModel("dropModel");
                dropModel.setProperty("/SelectedKey", "");

                // Ensure that the model exists before trying to clear it
                if (dropModel) {
                    dropModel.setProperty("/items", []);
                    dropModel.refresh(true);
                }

                var dropHeat = this.getOwnerComponent().getModel("dropHeat");
                dropHeat.setProperty("/SelectedKey", "");

                // Ensure that the model exists before trying to clear it
                if (dropHeat) {
                    dropHeat.setProperty("/items", []);
                    dropHeat.refresh(true);
                }

                var sViewId = this._sFragmentUniqueId;
                // Retrieve values using Fragment.byId with the correct ID prefix
                var sHtNo1 = sap.ui.core.Fragment.byId(sViewId, "HtNo");
                sHtNo1.setSelectedKey("");

                var sValue = oEvent.getParameter("value");

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

                this._userModel = this.getOwnerComponent().getModel("userModel");

                var sEmail = this._userModel.getProperty("/email");

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

                let sItemNo = null;
                let sQty = null;
                let sMat = null;
                let sHtNo = null;

                // Concatenate values for OData call
                var concatenatedString = sValue + "," + sItemNo + "," + sQty + ',' + sMat + ',' + sHtNo + "," + sEmail + "," + bukrs + "," + spart;

                //11022025

                //11022025
                // Check if sValue is empty or blank, skip validation
                if (sValue.trim() === "") {
                    // If sValue is blank, no need for validation
                    // console.log("sValue is blank, skipping validation.");
                    sap.m.MessageToast.show("Please enter Invoice");

                } else {
                    try {
                        await this.validateData(concatenatedString);
                        // Validation successful. Proceeding with further processing...
                    } catch (error) {
                        debugger;
                        // Stop further processing and display error
                        return; // Stop further execution
                    }
                }
                //11022025

                if (sValue) {
                    this.fetchItem(sValue);
                } else {
                    // Clear dropdown if input is empty
                    var dropModel = this.getOwnerComponent().getModel("dropModel");
                    dropModel.setProperty("/SelectedKey", "");

                    dropModel.setProperty("/items", []);
                    dropModel.refresh(true);
                }
            },

            onItemNoChange: function (oEvent) {
                var oItemNoControl = oEvent.getSource();
                var sValue = oItemNoControl.getSelectedKey();  // Get the selected value (key)

                if (sValue) {
                    this.fetchHtno(sValue);
                } else {
                    // Clear dropdown if input is empty
                    var dropHeat = this.getOwnerComponent().getModel("dropHeat");
                    dropHeat.setProperty("/SelectedKey", "");

                    dropHeat.setProperty("/items", []);
                    dropHeat.refresh(true);

                    var sViewId = this._sFragmentUniqueId;
                    // Retrieve values using Fragment.byId with the correct ID prefix
                    var sHtNo1 = sap.ui.core.Fragment.byId(sViewId, "HtNo");
                    sHtNo1.setSelectedKey("");
                }
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

                var dropModel = this.getOwnerComponent().getModel("dropModel");
                dropModel.setProperty("/SelectedKey", "");
                // Ensure that the model exists before trying to clear it
                if (dropModel) {
                    dropModel.setProperty("/items", []);
                    dropModel.refresh(true);
                }

                var dropHeat = this.getOwnerComponent().getModel("dropHeat");
                dropHeat.setProperty("/SelectedKey", "");
                // Ensure that the model exists before trying to clear it
                if (dropHeat) {
                    dropHeat.setProperty("/items", []);
                    dropHeat.refresh(true);
                }

                var sViewId = this._sFragmentUniqueId;
                // Retrieve values using Fragment.byId with the correct ID prefix
                var sHtNo1 = sap.ui.core.Fragment.byId(sViewId, "HtNo");
                sHtNo1.setSelectedKey("");
            },

            fetchItem: function (sInvoiceNo) {
                debugger;

                var oView = this.getView();
                var dModel = new ODataModel("/sap/opu/odata/sap/YSD_RETAIL_SO_SRV/");

                var aFilters = [
                    new sap.ui.model.Filter("InvoiceNo", sap.ui.model.FilterOperator.EQ, sInvoiceNo)
                ];

                // Create and set a local JSONModel for the dropdown
                var dropModel = this.getOwnerComponent().getModel("dropModel");
                dropModel.setProperty("/SelectedKey", "");

                dropModel.setProperty("/items", []);  // Clear the existing items
                dropModel.refresh(true);

                dModel.read("/YSD_RETAIL_DROPSet", {
                    filters: aFilters,
                    success: (oData) => {
                        debugger;
                        var dropRecords = oData.results.map((item) => ({
                            key: item.Item,  // Use correct field from OData response
                            text: item.Item  // Display text
                        }));

                        var dropModel = this.getView().getModel("dropModel");
                        dropModel.setProperty("/items", dropRecords);

                        sap.m.MessageToast.show("Data fetched successfully");
                    },
                    error: () => {
                        sap.m.MessageToast.show("Failed to fetch data");
                    }
                });
            },

            fetchHtno: function (sInvoiceNo) {
                debugger;

                sInvoiceNo = sInvoiceNo.replace(/\//g, ",");

                // Get the View ID (important when using fragments inside an XML view)
                var sViewId = this._sFragmentUniqueId;

                // Retrieve values using Fragment.byId with the correct ID prefix
                var sInvNo = sap.ui.core.Fragment.byId(sViewId, "InvNo")?.getValue();

                var result = sInvNo + "," + sInvoiceNo;

                var oView = this.getView();
                var dModel = new ODataModel("/sap/opu/odata/sap/YSD_RETAIL_SO_SRV/");

                var aFilters = [
                    new sap.ui.model.Filter("HtNo", sap.ui.model.FilterOperator.EQ, result)
                ];

                // Create and set a local JSONModel for the dropdown
                var dropHeat = this.getOwnerComponent().getModel("dropHeat");
                dropHeat.setProperty("/SelectedKey", "");

                dropHeat.setProperty("/items", []);  // Clear the existing items
                dropHeat.refresh(true);

                var sViewId = this._sFragmentUniqueId;
                // Retrieve values using Fragment.byId with the correct ID prefix
                var sHtNo1 = sap.ui.core.Fragment.byId(sViewId, "HtNo");
                sHtNo1.setSelectedKey("");

                dModel.read("/YSD_RETAIL_HTNOSet", {
                    filters: aFilters,
                    success: (oData) => {
                        debugger;
                        var dropRecords = oData.results.map((item) => ({
                            key: item.Item,  // Use correct field from OData response
                            text: item.Item  // Display text
                        }));

                        var dropHeat = this.getView().getModel("dropHeat");
                        dropHeat.setProperty("/items", dropRecords);

                        sap.m.MessageToast.show("Data fetched successfully");
                    },
                    error: () => {
                        sap.m.MessageToast.show("Failed to fetch data");
                    }
                });
            },

            onPushButtonPress: async function () {
                // Get the View ID (important when using fragments inside an XML view)
                var sViewId = this._sFragmentUniqueId;

                // Retrieve values using Fragment.byId with the correct ID prefix
                var sInvoiceNo = sap.ui.core.Fragment.byId(sViewId, "InvNo")?.getValue();
                var sItemNo = sap.ui.core.Fragment.byId(sViewId, "ItemNo")?.getSelectedKey();
                var sHtNo = sap.ui.core.Fragment.byId(sViewId, "HtNo")?.getValue();

                // Validate input fields
                if (!sInvoiceNo || !sItemNo || !sHtNo) {
                    sap.m.MessageToast.show("Please fill in all fields (Invoice No, Item No, and Heat No).");
                    return;
                }

                sItemNo = sItemNo.replace(/\//g, ',');

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

                this._userModel = this.getOwnerComponent().getModel("userModel");

                var sEmail = this._userModel.getProperty("/email");

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

                // Concatenate values for OData call
                var concatenatedString = sInvoiceNo + "," + sItemNo + "," + sHtNo + "," + sEmail + "," + bukrs + "," + spart;

                //11022025
                try {
                    await this.validateData(concatenatedString)
                    // console.log("Validation successful. Proceeding with further processing...");
                    // MessageToast.show("Validation successful. Proceeding with further processing...");
                } catch (error) {
                    debugger;
                    // Stop further processing and display error
                    // console.error("Validation failed:", error);
                    // sap.m.MessageBox.error("Validation failed. Please check the uploaded data.");
                    return; // Stop further execution
                }
                //11022025

                // OData request
                var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/YSD_RETAIL_SO_SRV/");
                var uniqueViewerId = "pdfViewer-" + new Date().getTime();

                var opdfViewer = new sap.m.PDFViewer({ id: uniqueViewerId });
                this.getView().addDependent(opdfViewer);

                var sSource = "/sap/opu/odata/sap/YSD_RETAIL_SO_SRV/get_pdfSet('" + concatenatedString + "')/$value";

                // Open PDF viewer with the generated URL
                opdfViewer.setSource(sSource);
                opdfViewer.setTitle("Test Certificate PDF");
                opdfViewer.open();
            },

            validateData: async function (concatenatedString) {
                // let vEntry = {};

                // vEntry.Key = "X";
                // vEntry.Value = concatenatedString;

                var filters = [
                    new sap.ui.model.Filter("Value", sap.ui.model.FilterOperator.EQ, concatenatedString),
                ];

                var vModel = new ODataModel("/sap/opu/odata/sap/YSD_RETAIL_SO_SRV/", {
                    json: true, // Use JSON format
                    useBatch: false, // Enable batch processing
                });

                return new Promise((resolve, reject) => {
                    vModel.read("/TcValidationSet", {
                        method: "GET",
                        filters: filters,
                        success: (oData, response) => {
                            debugger;
                            const errorRecords = response.data.results;

                            if (errorRecords.length > 0) {
                                // Create a formatted error message with multiple lines
                                var formattedMessage = errorRecords.map(function (record) {
                                    return record.Value; // Extract each error message from the record
                                }).join("\n"); // Join them with a line break

                                // Display the errors in MessageBox
                                sap.m.MessageBox.error(formattedMessage);

                                var sViewId = this._sFragmentUniqueId;
                                // Retrieve values using Fragment.byId with the correct ID prefix
                                var sHtNo1 = sap.ui.core.Fragment.byId(sViewId, "HtNo");
                                sHtNo1.setSelectedKey("");

                                // Clear the 'InvNo' field if there are error records
                                var sInvoiceNoField = sap.ui.core.Fragment.byId(sViewId, "InvNo");

                                if (sInvoiceNoField) {
                                    sInvoiceNoField.setValue("");  // Clear the value of the field
                                }

                                var dropModel = this.getOwnerComponent().getModel("dropModel");
                                dropModel.setProperty("/SelectedKey", "");

                                // Ensure that the model exists before trying to clear it
                                if (dropModel) {
                                    dropModel.setProperty("/items", []);
                                    dropModel.refresh(true);
                                }

                                var dropHeat = this.getOwnerComponent().getModel("dropHeat");
                                dropHeat.setProperty("/SelectedKey", "");

                                // Ensure that the model exists before trying to clear it
                                if (dropHeat) {
                                    dropHeat.setProperty("/items", []);
                                    dropHeat.refresh(true);
                                }

                                reject(response);
                            } else {
                                // alert("All data is valid.");
                                resolve(response);
                                sap.m.MessageToast.show("No Errors");
                            }
                        },
                        error: function (oError) {
                            debugger;
                            reject(oError);
                            // console.error("Error uploading entry:", oError);
                            // MessageToast.show("Error uploading entry");
                        }
                    });
                });
            }
        });
    });