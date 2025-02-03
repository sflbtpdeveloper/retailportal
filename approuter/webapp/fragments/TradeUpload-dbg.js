sap.ui.define([
    'zretail_sfl/controller/BaseController',
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Table",  // Add this line for Table control
    "sap/m/Column", // Add this if you are using Columns in the table
    "sap/m/ColumnListItem", // Add this if you are using ColumnListItem in the table
    "sap/m/Text", // Add this if you're displaying text in the table cells 
    "sap/ui/model/json/JSONModel"
],
    function (BaseController, ODataModel, MessageToast, MessageBox, Filter, FilterOperator, Table, Column, ColumnListItem, Text, JSONModel) {
        "use strict";

        return BaseController.extend("zretail_sfl.fragments.TradeUpload", {
            onInit: function () {
                debugger;
                this._localModel = this.getOwnerComponent().getModel("local");
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("operations").attachPatternMatched(this._onObjectMatched, this);
            },
            formatDateToISO: function (dateStr) {
                var date = new Date(dateStr);
                var year = date.getFullYear();
                var month = String(date.getMonth() + 1).padStart(2, '0');
                var day = String(date.getDate()).padStart(2, '0');
                var hours = String(date.getHours()).padStart(2, '0');
                var minutes = String(date.getMinutes()).padStart(2, '0');
                var seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
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
            onFileChange: function (oEvent) {

                var aFiles = oEvent.getParameter("files"); // Get the files from the event
                var oButton = this.byId("btnRemove");

                // Check if any files were selected
                if (aFiles && aFiles.length > 0) {
                    // oButton.setVisible(true);
                    this._file = aFiles[0]; // Store the selected file for later use
                } else {
                    // No file selected, show a message to the user
                    // oButton.setVisible(false);  // Hide if no file is selected
                    MessageToast.show("No file selected.");
                }
            },

            // onRemoveFile: function () {
            //     var oFileUploader = this.byId("ordfileUploader");
            //     oFileUploader.clear();  // Clear the selected file
            //     this.byId("btnRemove").setVisible(false);  // Hide the remove button
            //     MessageToast.show("File removed.");
            // },

            onUploadPress: function () {
                debugger;
                // Get the container and add the table dynamically
                var sFragmentIdC = this._sFragmentUniqueId;
                var oClearTableContainer = this.getView().byId(sFragmentIdC + "--errorTableContainer");
                oClearTableContainer.destroyItems();
                var oClearLinkContainer = this.getView().byId(sFragmentIdC + "--errorDownloadContainer");
                oClearLinkContainer.destroyItems();

                if (!this._file) {
                    MessageToast.show("Please select a file first.");
                    return;
                }


                var reader = new FileReader();
                var fileExt = this._file.name.split('.').pop().toLowerCase();
                var that = this;

                //29012025
                var sFileType = this._file.type;
                //29012025

                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook;

                    try {
                        if (fileExt === "xls") {
                            // Convert ArrayBuffer to Binary String for .xls files
                            var binary = "";
                            var bytes = new Uint8Array(data);
                            for (var i = 0; i < bytes.byteLength; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            workbook = XLSX.read(binary, { type: 'binary' });
                        } else if (fileExt === "xlsx") {
                            // Use Uint8Array directly for .xlsx files
                            workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
                        } else {
                            sap.m.MessageToast.show("Invalid file format.");
                            return;
                        }

                        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                        console.log(jsonData); // Process the data
                        var uploadType = that._validateHeaders(jsonData[0]);
                        debugger;
                        if (uploadType !== "TradeUpload") {
                            MessageBox.error("Invalid file format. Please upload a correct file.");
                            return;
                        }
                        // Now send jsonData to the OData service
                        that._sendDataToOData(jsonData);
                        // Reset the file input after processing
                        that._resetFileUploader();

                    } catch (error) {
                        console.error("Error reading file:", error);
                        sap.m.MessageToast.show("Error reading file: " + error.message);
                    }
                };
               
                reader.readAsArrayBuffer(this._file);
            },
            _validateHeaders: function (headers) {
                // Define expected headers for each upload type
                var orderUploadHeaders = [
                    "DOCTYPE", "SALES ORG", "DIST CH", "DIVN", "SOLD TO",
                    "SHIP TO", "PO REF", "PO DATE(DD.MM.YYYY)", "PARTNO", "DELY QTY"
                ];
                var grnUploadHeaders = [
                    "Customer Code", "Invoice No", "GRN No", "GRN Date"
                ];
                var stockUploadHeaders = [
                    "Plant", "Material", "Quantity", "Remarks"
                ];
                var TradeUploadHeaders = [
                    "Distributor", "Distributor invoice", "Distributor Branch", "Dealer name", "Dealer GST",
                    "Dealer city", "Invoice date", "Material", "Ordered qty", "List value by distributor"                    
                ];               
                debugger;
                // Check if uploaded file headers match any of the predefined formats
                if (this._compareHeaders(headers, orderUploadHeaders)) {
                    return "OrderUpload";
                } else if (this._compareHeaders(headers, grnUploadHeaders)) {
                    return "GRNUpload";
                } else if (this._compareHeaders(headers, stockUploadHeaders)) {
                    return "StockUpload";
                } else if (this._compareHeaders(headers, TradeUploadHeaders)) {
                    return "TradeUpload";                    
                }
            },
            _resetFileUploader: function () {
                // Reset the internal file reference and FileUploader value
                this._file = null;

                // Reset the FileUploader value
                var oFileUploader = this.getView().byId(this._sFragmentUniqueId + "--myFileUploadORD");
                if (oFileUploader) {
                    oFileUploader.setValue(""); // Clear the FileUploader
                }
            },

            _compareHeaders: function (uploadedHeaders, expectedHeaders) {

                // Convert both arrays to lowercase for case-insensitive comparison
                var uploadedSet = new Set(uploadedHeaders.map(header => header.trim().toLowerCase()));
                return expectedHeaders.every(expected => uploadedSet.has(expected.trim().toLowerCase()));

            },
            _sendDataToOData: async function (data) {
                console.log("data:", data);
                debugger;
                var oModel = new ODataModel("/sap/opu/odata/sap/YSD_RETAIL_SO_SRV/", {
                    json: true, // Use JSON format
                    useBatch: false, // Enable batch processing
                });

                // Define the field names based on your entity
                var fieldNames = [
                    "Distributor",
                    "DistributorInvoice",
                    "DistributorBranch",
                    "DealerName",
                    "DealerGST",
                    "DealerCity",
                    "InvoiceDate",
                    "Material",
                    "OrderedQty",
                    "ListValueByDistributor",
                    "CreatedOn",
                    "CreatedBy"
                ];
                // Prepare the data to be sent to OData service
                var aPayload = data.map(function (row) {
                    var oRowData = {};
                    // Map row values to field names
                    fieldNames.forEach(function (fieldName, index) {
                        if (row[index] !== undefined && row[index] !== null && row[index] !== "") {
                            // Handle date formatting for Podate
                            // oRowData[fieldName] = String(row[index]);

                            if (fieldName === "OrderedQty") {
                                // Remove commas from Delyqty and convert to a number
                                oRowData[fieldName] = parseInt(row[index].replace(/,/g, ""), 10);
                            } else if (fieldName === "InvoiceDate") {
                                // Handle date formatting for Podate if necessary
                                oRowData[fieldName] = row[index]; // Add additional formatting logic if needed
                            }
                            else if (fieldName === "CreatedOn") {
                                // Handle date formatting for Podate if necessary
                                oRowData[fieldName] = row[index]; // Add additional formatting logic if needed
                            } 
                            else {
                                // Default string conversion for other fields
                                oRowData[fieldName] = String(row[index]);
                            }
                        }
                    }); // Bind the context
                    return oRowData;
                }); // Bind the context

                // Remove the first row (header)
                aPayload = aPayload.slice(1);

                // Convert to JSON string
                var jsonString = JSON.stringify(aPayload, null, 2); // `null` for replacer, `2` for pretty printing
                var encoded = btoa(encodeURIComponent(jsonString));

                let oEntry = {};
                let vEntry = {};

                // let oModel = this.getOwnerComponent().getModel("orderUploadModel");
                // this.getView().setModel(oModel);
                var oPayload = this._localModel.getProperty("/UploadData");


                // // Retrieve selected division and tile selection from local storage
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

                // Get user data to localStorage
                var sUserInfo = localStorage.getItem("userInfo");

                // Parse the data back into a JavaScript object
                var oUserInfo = JSON.parse(sUserInfo);

                // Retrieve email ID from the model
                const sEmail = oUserInfo.email;


                oEntry.Key = "X";
                oEntry.Value = encoded;
                oEntry.Bukrs = bukrs;
                oEntry.Spart = spart;
                oEntry.Upload = 'TRADE';
                oEntry.Email = sEmail;

                oPayload.Key = "X";
                oPayload.Value = encoded;
                oPayload.Bukrs = bukrs;
                oPayload.Spart = spart;
                oPayload.Upload = 'TRADE';
                oPayload.Email = sEmail;


                vEntry.Value = encoded;
                vEntry.Bukrs = bukrs;
                vEntry.Spart = spart;
                vEntry.Email = sEmail;
                vEntry.Upload = 'TRADE';
                vEntry.Key = "X";
                debugger;

                //Changes done on 02.01.2025   
                try {
                    await this.validateUploadedData(data, bukrs, spart, vEntry)
                    // console.log("Validation successful. Proceeding with further processing...");
                    MessageToast.show("Validation successful. Proceeding with further processing...");
                } catch (error) {
                    debugger;
                    // Stop further processing and display error
                    console.error("Validation failed:", error);
                    sap.m.MessageBox.error("Validation failed. Please check the uploaded data.");
                    return; // Stop further execution
                }

                debugger;

                //Changes done on 02.01.2025                
                // oModel.create("/ysd_retail_sojSet", oEntry, {
                //     method: "POST",
                //     success: function () {
                //         // MessageToast.show("Entry uploaded successfully.");
                //         sap.m.MessageBox.success("Uploaded successfully.");
                //     },
                //     error: function (oError) {
                //         console.error("Error uploading entry:", oError);
                //         // MessageToast.show("Upload Failed");
                //         sap.m.MessageBox.error("Upload Failed");
                //     }
                // });

                this._saveOrderUpload(oPayload);
            },
            _saveOrderUpload: async function (oPayload) {
                debugger;
                sap.ui.core.BusyIndicator.show();
                // POST request to create ASN            
                $.ajax({
                    url: "/nodeapp/S2TUpload",
                    type: "POST",
                    contentType: "application/json; charset=UTF-8",
                    data: JSON.stringify(oPayload),
                    headers: {
                        // "X-CSRF-Token": csrfToken,
                        "Content-Type": "application/json",
                    },
                    success: async function (oData) {
                        debugger;
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.success("Uploaded successfully.");
                    }.bind(this),
                    error: function (oErr) {
                        debugger;
                        sap.ui.core.BusyIndicator.hide();
                        var statusCode = oErr.status;
                        var statusText = oErr.statusText;
                        var responseText = oErr.responseText;
                        MessageBox.error(
                            "Upload Failed" +
                            "Status: " + statusCode + " (" + statusText + ")\n" +
                            "Details: " + responseText
                        );
                    }.bind(this)
                });
            },
            onDownloadTemplate: async function () {
                sap.ui.core.BusyIndicator.show();
                try {
                    // Make a request to your custom Node.js backend to get the CSRF token and DA list
                    const templateUrl = await $.ajax({
                        url: "/nodeapp/TR_downloadTemplate",     // Your custom backend route
                        method: "GET",              // Use GET since you're retrieving data         
                        contentType: "application/json",
                        xhrFields: {
                            responseType: 'blob'  // Handle response as binary data (blob)
                        },
                    });
                    // Success handling
                    sap.ui.core.BusyIndicator.hide();  // Hide the busy indicator on success
                    debugger;
                    // sap.m.URLHelper.redirect(templateUrl, true);
                    // Create a Blob from the response
                    const blob = new Blob([templateUrl], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

                    // Create a link element and set it to trigger the download
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = "Sales_To_TradeTemplate.xlsx"; // File name to save as
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Revoke the URL to free memory
                    window.URL.revokeObjectURL(downloadUrl);

                } catch (oErr) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Error downloading Template:", oErr);
                    // If the error response contains a message, display it in the MessageBox
                    const errorMessage = oErr.responseJSON?.error?.innererror?.errordetails?.[0]?.message || "Unknown error occurred";
                }
            },
            validateUploadedData: async function (data, bukrs, spart, vEntry) {
                // var oPayload = this._localModel.getProperty("/ordUplVal");                               
                debugger;
                var vModel = new ODataModel("/sap/opu/odata/sap/YSD_RETAIL_SO_SRV/", {
                    json: true, // Use JSON format
                    useBatch: false, // Enable batch processing
                });

                //Changes done on 02.01.2025 
                return new Promise((resolve, reject) => {
                    vModel.create("/ValidationSet", vEntry, {
                        method: "POST",
                        success: (oData, response) => {
                            debugger;
                            const errorRecords = response.data.Value;
                            let errors = [];
                            if (errorRecords) {
                                const decodedString = decodeURIComponent(atob(errorRecords)); // Decode the encoded data                            
                                const parsedErrors = JSON.parse(decodedString);   // Parse the decoded string into a JavaScript object (or array)
                                reject(response);
                                errors = parsedErrors;
                                var sFragmentId = this._sFragmentUniqueId;
                                var oLink = this.getView().byId(sFragmentId + "--errorDownloadContainer");
                                oLink.destroyItems();
                            }
                            // Generate error file if there are errors
                            debugger;
                            if (errors.length > 0) {    //errors
                                var oFragment = this.getView();
                                var oController = oFragment.getController();
                                // Create a Link control
                                const oErrorLink = new sap.m.Link({
                                    text: "Download Errors",
                                    // press: oController.onErrorDownload.bind(oController,errors),
                                    press: function () {
                                        this.onErrorDownload(errors); // This will call onErrorDownload with the correct 'this' context
                                    }.bind(this),

                                });

                                // Optionally, you can add a tooltip or other properties to the link
                                oErrorLink.setTooltip("Click to download the error details");
                                oErrorLink.addStyleClass("redLink");

                                // Add the link to the container
                                oLink.addItem(oErrorLink);
                                // Create the table dynamically
                                const oTable = new sap.m.Table({
                                    columns: Object.keys(errors[0]).map((key) => {
                                        return new sap.m.Column({
                                            header: new sap.m.Text({ text: key }),
                                        });
                                    }),
                                });
                                // Create a model for the errors and set it to the table
                                var oErrorModel = new sap.ui.model.json.JSONModel(errors);

                                // Define the template for the rows
                                const oTemplate = new sap.m.ColumnListItem({
                                    cells: Object.keys(errors[0]).map((key) => {
                                        return new sap.m.Text({ text: `{${key}}` });
                                    }),
                                });

                                oTable.setModel(oErrorModel);
                                oTable.bindItems("/", oTemplate);

                                // Get the container and add the table dynamically
                                var oErrorTableContainer = this.getView().byId(sFragmentId + "--errorTableContainer");
                                oErrorTableContainer.destroyItems();
                                oErrorTableContainer.addItem(oTable);

                            } else {
                                // alert("All data is valid.");
                                resolve(response);
                                MessageToast.show("Entry Validated successfully-No Errors");
                            }
                        },
                        error: function (oError) {
                            debugger;
                            reject(oError);
                            console.error("Error uploading entry:", oError);
                            MessageToast.show("Error uploading entry");
                        }
                    });
                });
            },
            onErrorDownload: function (errors) {
                debugger;
                // Handle the download logic when the link is clicked
                sap.ui.core.BusyIndicator.show();
                try {
                    // Make an AJAX call to your Node.js backend to fetch the error file
                    $.ajax({
                        url: "/nodeapp/TR_downloadError", // Node.js backend route
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({ errors: errors }),
                        xhrFields: {
                            responseType: "blob" // Expect binary data
                        },
                        success: (response) => {
                            debugger;
                            // Create a Blob from the response
                            const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

                            // Create a link element and set it to trigger the download
                            const downloadUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = downloadUrl;
                            link.download = "TradeToSalesUploadErrors.xlsx"; // File name to save as
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            // Revoke the URL to free memory
                            window.URL.revokeObjectURL(downloadUrl);
                        },
                        error: (err) => {
                            debugger;
                            console.error("Error downloading the file:", err);
                            sap.m.MessageBox.error("Failed to download error file. Please try again.");
                        },
                        complete: () => {
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                } catch (oErr) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Error downloading errors:", oErr);
                    sap.m.MessageBox.error("Failed to download error file. Please try again.");
                }
            },
        });
    });