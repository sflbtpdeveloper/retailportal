sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Popup",
  "sap/m/Popover",
  "sap/m/VBox",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/GenericTile",
  'sap/m/MessageBox',
  "sap/ui/core/Fragment",
  "jquery.sap.global"
], function (Controller, Popup, Popover, VBox, Label, Button, GenericTile, MessageBox, Fragment, jQuery) {
  'use strict';
  return Controller.extend("zretail_sfl.controller.divisions", {

    onInit: function () {
      debugger;
      // this.startSessionTimeout();
      this._userModel = this.getOwnerComponent().getModel("userModel");
      let me = this;
      fetch("/getUserInformation")
        .then(res => res.json())
        .then(data => {
          me._userModel.setProperty("/",
            {
              email: data.email,
              user: data.user, // Store user informationf 
              scopes: data.scopes, // Store user scopes
              given_name: data.user.given_name,
              family_name: data.user.family_name,
              user_name: data.user.user_name
            });
          // Save data to localStorage
          localStorage.setItem("userInfo", JSON.stringify(data));
          console.log(me._userModel.getProperty("/"));
        })
        .catch(err => console.log(err));



      //commented on 02.01.2025
      // var sFragmentName;
      // var sControllerName;

      // sFragmentName = "zretail_sfl.fragments.front";
      // sControllerName = "zretail_sfl.fragments.front";
      // debugger;
      // this.loadFragment(sFragmentName, sControllerName);
      //commented on 02.01.2025

      // Controller.prototype.onInit.apply(this);

      // this._setImageSource();
      // this.loadFragment("zretail_sfl.fragments.upload");


      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("operations").attachPatternMatched(this._onObjectMatched, this);
      var oPopover = this.getView().byId("popover");
      this._bInsidePopover = true;
      this._uploadModel = this.getOwnerComponent().getModel("upload");
      this._reportModel = this.getOwnerComponent().getModel("reports");
      this._claimModel = this.getOwnerComponent().getModel("claims");
      this._proprcingModel = this.getOwnerComponent().getModel("propricing");
      this._infoModel = this.getOwnerComponent().getModel("info");
      this._dashModel = this.getOwnerComponent().getModel("dashboard");




      var oIconTabBar = this.getView().byId("_IDGenIconTabHeader");
      var that = this;
      oIconTabBar.getItems().forEach(function (oItem) {
        oItem.addEventDelegate({
          onmouseover: function (oEvent) {
            that.onIconTabFilterHover(oEvent, oItem);
          },
          onmouseout: function (oEvent) {
            that.onIconTabFilterOut(oEvent, oItem);
          }
        });
      });

      oPopover.attachAfterOpen(function () {
        var oPopoverDomRef = oPopover.getDomRef();
        if (oPopoverDomRef) {
          oPopoverDomRef.addEventListener('mouseover', this.onPopoverMouseOver.bind(this));
          oPopoverDomRef.addEventListener('mouseout', this.onPopoverMouseOut.bind(this));
        }
      }.bind(this));


      //for email link hovering 
      var oProfile = this.byId("_IDGenAvatar1");
      // Add event delegate for mouse hover events
      oProfile.addEventDelegate({
        onmouseover: this.onProfileHover.bind(this), // Call hover function
        onmouseout: this.onProfileMouseOut.bind(this) // Handle mouse out
      });
    },

    dynamicHeader: function () {
      //10.01.2025
      // let response;
      // let availableFields = [];
      // // Step 1: Get the userInfo from localStorage
      // var userInfoString = localStorage.getItem('userInfo');

      // // Step 2: Parse the JSON string into an object
      // var userInfo = JSON.parse(userInfoString);

      // // Step 3: Access the email from the parsed object
      // const sEmail = userInfo.email;

      // try {
      //   // Make AJAX call to fetch AccCont data
      //   response = $.ajax({
      //     url: "/nodeapp/accCont", // Your custom backend route
      //     method: "GET",          // Use GET since you're retrieving data
      //     contentType: "application/json",
      //     data: { email: sEmail } // Send the email as a query parameter
      //   });
      // } catch (error) {
      //   console.error("Error fetching AccCont data:", error.message);
      // }

      // Handle case where response is an array
      const response = localStorage.getItem("accessInfo");

      var responseData = JSON.parse(response);

      // Define the mapping of field names to display values
      const fieldUpload = {
        "Upload": "Upload",
        "Reports": "Reports"
      };

      // Extract relevant upload options marked as 'X'
      const uploadFields = ["Upload", "Reports"];

      var oView = this.getView();
      var oIconTabFilterUpload = oView.byId("_IDGenIconTabFilter");
      var oIconTabFilterReports = oView.byId("_IDGenIconTabFilter1");

      uploadFields.forEach(field => {
        // if (responseData[field] === "X" || responseData[field] === true) {
        // availableFields.push(fieldUpload[field]); // Collect fields marked as 'X'
        if (responseData["Upload"] === "X") {
          oIconTabFilterUpload.setVisible(true);
        } else {
          oIconTabFilterUpload.setVisible(false);
        }

        if (responseData["Reports"] === "X") {
          oIconTabFilterReports.setVisible(true);
        } else {
          oIconTabFilterReports.setVisible(false);
        }
        // }
      });
      //10.01.2025
    },

    onProfileHover: function (oEvent) {
      debugger;
      var oView = this.getView();
      // var oProfile = oEvent.getSource();
      var oProfile = oEvent.srcControl; // Get the link control

      // Retrieve selected division and tile selection from local storage
      const divisionData = JSON.parse(localStorage.getItem("divisionData")) || {};            
      // Extract the relevant data
      const selectedDivision = divisionData.selectedDivision || null;
      const selectedSflTile = divisionData.selectedSflTile || false;
      const selectedTplTile = divisionData.selectedTplTile || false;

       // Determine bukrs value based on tile selection
       let company = null;
       let divi = null;
       if (selectedDivision) {
        divi = selectedDivision;
       }
       if (selectedSflTile) {
        company = "Sundram Fasteners Limited";
       } else if (selectedTplTile) {
        company = "TVS - Sundram Fasteners Limited";
       }

      var userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
      userInfo.company = company;
      userInfo.division = divi;
            
      var oJsonModel = new sap.ui.model.json.JSONModel(userInfo);


      if (!this._userdetails) {
        Fragment.load({
          id: oView.getId(),
          name: "zretail_sfl.fragments.userdetails", // Path to the fragment
          controller: this
        }).then(function (oPopover) {
          oView.addDependent(oPopover);
          this._userdetails = oPopover;
          this._userdetails.setModel(oJsonModel, "userModel");
          this._userdetails.openBy(oProfile);  // Open the popover next to the link
        }.bind(this));
      } else {
        debugger;
        this._userdetails.setModel(oJsonModel, "userModel");
        this._userdetails.openBy(oProfile);  // If already loaded, just open it
      }

    },
    _loadUserDetails: function (oProfile) {
      this._userModel = this.getOwnerComponent().getModel("userModel");
      var sEmail = this._userModel.getProperty("/email");

    },
    // Function to close the popup when mouse leaves
    onProfileMouseOut: function () {
      if (this._userdetails) {
        this._userdetails.close();
      }
    },
    onAfterRendering: function () {
      // Re-attach PatternMatched after rendering
      this.oRouter.getRoute("operations").attachPatternMatched(this._onObjectMatched, this);
    },
    onBeforeRendering: function () {
      if (this.oRouter) {
        // Detach PatternMatched before re-rendering
        this.oRouter.getRoute("operations").detachPatternMatched(this._onObjectMatched, this);
      }
    },
    _onObjectMatched: function () {
      debugger;
      // Detach the event handler to prevent further calls
      this.oRouter.getRoute("operations").detachPatternMatched(this._onObjectMatched, this);
      var sFragmentName = "zretail_sfl.fragments.front";
      var sControllerName = "zretail_sfl.fragments.front";
      this.loadFragment(sFragmentName, sControllerName);

      this.dynamicHeader();
    },
    onTabSelect: function (oEvent, oItem) {
      var sFragmentName;
      var sControllerName;

      var sKey = oEvent.getParameter("key");
      if (sKey === "Home") {
        sFragmentName = "zretail_sfl.fragments.front";
        sControllerName = "zretail_sfl.fragments.front";
        this.loadFragment(sFragmentName, sControllerName);

      }

      if (sap.ui.Device.system.phone || sap.ui.Device.system.tablet) {
        var oIconTabBar = this.getView().byId("_IDGenIconTabHeader");

        var oUploadModel = this._uploadModel;
        var oReportModel = this._reportModel;
        var oClaimModel = this._claimModel;
        var oProPricingModel = this._proprcingModel;
        var oInfoModel = this._infoModel;
        var oDashModel = this._dashModel;


        var oPopover = this.getView().byId("popover");
        var that = this;
        switch (oItem.mProperties.key) {
          case "Upload":
            that.getView().byId("idList").setModel(oUploadModel, "localData");
            // var oPopover = this.getView().byId("popover");                  
            break;
          case "Reports":
            that.getView().byId("idList").setModel(oReportModel, "localData");
            break;
          case "Claims":
            that.getView().byId("idList").setModel(oClaimModel, "localData");
            break;
          case "Products":
            that.getView().byId("idList").setModel(oProPricingModel, "localData");
            break;
          case "Info":
            that.getView().byId("idList").setModel(oInfoModel, "localData");
            break;
          case "Dash":
            that.getView().byId("idList").setModel(oDashModel, "localData");
            break;
          default:
            oList.setModel(null);
        }

        var aVisibleItems = [];
        oIconTabBar.getItems().forEach(function (oItem) {

          var $itemDomRef = oItem.getDomRef();

          // Check if the tab has a DOM reference, meaning it's visible on the screen
          if ($itemDomRef && $itemDomRef.offsetParent !== null) {
            aVisibleItems.push(oItem);
          }
        });

        var selectedtab = oIconTabBar.mProperties.selectedKey;

        var oSelectedItem = aVisibleItems.find(function (oItem) {
          return oItem.getKey() === selectedtab;
        });

        if (oSelectedItem) {
          oIconTabBar.setSelectedKey(selectedtab);
          this._bInsidePopover = true;
          oPopover.openBy(oSelectedItem);
        }
      }
    },
    onIconTabFilterHover: async function (oEvent, oItem) {
      var oIconTabBar = this.getView().byId("_IDGenIconTabHeader");


      var oUploadModel = this._uploadModel;
      var oReportModel = this._reportModel;
      var oClaimModel = this._claimModel;
      var oProPricingModel = this._proprcingModel;
      var oInfoModel = this._infoModel;
      var oDashModel = this._dashModel;

      //07.01.2025
      // let response;
      let availableFields = [];
      // // Step 1: Get the userInfo from localStorage
      // var userInfoString = localStorage.getItem('userInfo');

      // // Step 2: Parse the JSON string into an object
      // var userInfo = JSON.parse(userInfoString);

      // // Step 3: Access the email from the parsed object
      // const sEmail = userInfo.email;

      // try {
      //   // Make AJAX call to fetch AccCont data
      //   response = await $.ajax({
      //     url: "/nodeapp/accCont", // Your custom backend route
      //     method: "GET",          // Use GET since you're retrieving data
      //     contentType: "application/json",
      //     data: { email: sEmail } // Send the email as a query parameter
      //   });
      // } catch (error) {
      //   console.error("Error fetching AccCont data:", error.message);
      // }

      // Handle case where response is an array
      const response = localStorage.getItem("accessInfo");

      var responseData = JSON.parse(response);
      //07.01.2025

      var oPopover = this.getView().byId("popover");
      var that = this;
      switch (oItem.mProperties.key) {
        case "Upload":
          //07.01.2025
          // Define the mapping of field names to display values
          const fieldUpload = {
            "OrderUpl": "Order Upload",
            "GRNUpl": "GRN Upload",
            "StradeUpl": "Sales to Trade Upload",
            "StockUpl": "Stock Upload"
          };

          // Extract relevant upload options marked as 'X'
          const uploadFields = ["OrderUpl", "GRNUpl", "StradeUpl", "StockUpl"];

          uploadFields.forEach(field => {
            if (responseData[field] === "X" || responseData[field] === true) {
              availableFields.push(fieldUpload[field]); // Collect fields marked as 'X'
            }
          });

          const filteredUpload = availableFields.map(field => ({
            key: field,   // You can change 'key' if you want a different identifier
            text: field   // Display text can be adjusted as well
          }));

          // Create a JSONModel from the filtered data
          const oFilteredUpload = new sap.ui.model.json.JSONModel({
            items: filteredUpload
          });
          //07.01.2025

          that.getView().byId("idList").setModel(oFilteredUpload, "localData");
          // var oPopover = this.getView().byId("popover");                  
          break;
        case "Reports":
          //07.01.2025
          // Define the mapping of field names to display values
          const fieldReport = {
            "OrderAck": "Order Acknowledgement",
            "Pending": "Pending Order Status",
            "Dispatch": "Dispatch Status",
            "Grn": "GRN Status",
            "TestCert": "Test Certificate",
            "StockInfo": "SFL Stock Information",
            "PriceUpl": "Price List",
            "PayOutst": "Payment Outstanding"
          };

          // Extract relevant upload options marked as 'X'
          const uploadReport = ["OrderAck", "Pending", "Dispatch", "Grn", "TestCert", "StockInfo", "PriceUpl", "PayOutst"];

          uploadReport.forEach(field => {
            if (responseData[field] === "X" || responseData[field] === true) {
              availableFields.push(fieldReport[field]); // Collect fields marked as 'X'
            }
          });

          const filteredReport = availableFields.map(field => ({
            key: field,   // You can change 'key' if you want a different identifier
            text: field   // Display text can be adjusted as well
          }));

          // Create a JSONModel from the filtered data
          const oFilteredReport = new sap.ui.model.json.JSONModel({
            items: filteredReport
          });
          //07.01.2025

          that.getView().byId("idList").setModel(oFilteredReport, "localData");
          break;
        case "Claims":
          // //07.01.2025
          // // Define the mapping of field names to display values
          // const fieldClaims = {
          //   "OrderUpl": "Order Upload",
          //   "GRNUpl": "GRN Upload",
          //   "StradeUpl": "Sales to Trade Upload",
          //   "StockUpl": "Stock Upload"
          // };

          // // Extract relevant upload options marked as 'X'
          // const claimsFields = ["OrderUpl", "GRNUpl", "StradeUpl", "StockUpl"];

          // claimsFields.forEach(field => {
          //   if (responseData[field] === "X" || responseData[field] === true) {
          //     availableFields.push(fieldClaims[field]); // Collect fields marked as 'X'
          //   }
          // });

          // const filteredClaims = availableFields.map(field => ({
          //   key: field,   // You can change 'key' if you want a different identifier
          //   text: field   // Display text can be adjusted as well
          // }));

          // // Create a JSONModel from the filtered data
          // const oFilteredClaims = new sap.ui.model.json.JSONModel({
          //   items: filteredClaims
          // });
          // //07.01.2025

          that.getView().byId("idList").setModel(oClaimModel, "localData");
          break;
        case "Products":
          // //07.01.2025
          // // Define the mapping of field names to display values
          // const fieldProducts = {
          //   "OrderUpl": "Order Upload",
          //   "GRNUpl": "GRN Upload",
          //   "StradeUpl": "Sales to Trade Upload",
          //   "StockUpl": "Stock Upload"
          // };

          // // Extract relevant upload options marked as 'X'
          // const productFields = ["OrderUpl", "GRNUpl", "StradeUpl", "StockUpl"];

          // productFields.forEach(field => {
          //   if (responseData[field] === "X" || responseData[field] === true) {
          //     availableFields.push(fieldProducts[field]); // Collect fields marked as 'X'
          //   }
          // });

          // const filteredProduct = availableFields.map(field => ({
          //   key: field,   // You can change 'key' if you want a different identifier
          //   text: field   // Display text can be adjusted as well
          // }));

          // // Create a JSONModel from the filtered data
          // const oFilteredProduct = new sap.ui.model.json.JSONModel({
          //   items: filteredProduct
          // });
          // //07.01.2025

          that.getView().byId("idList").setModel(oProPricingModel, "localData");
          break;
        case "Info":
          // //07.01.2025
          // // Define the mapping of field names to display values
          // const fieldInfo = {
          //   "OrderUpl": "Order Upload",
          //   "GRNUpl": "GRN Upload",
          //   "StradeUpl": "Sales to Trade Upload",
          //   "StockUpl": "Stock Upload"
          // };

          // // Extract relevant upload options marked as 'X'
          // const infoFields = ["OrderUpl", "GRNUpl", "StradeUpl", "StockUpl"];

          // infoFields.forEach(field => {
          //   if (responseData[field] === "X" || responseData[field] === true) {
          //     availableFields.push(fieldInfo[field]); // Collect fields marked as 'X'
          //   }
          // });

          // const filteredInfo = availableFields.map(field => ({
          //   key: field,   // You can change 'key' if you want a different identifier
          //   text: field   // Display text can be adjusted as well
          // }));

          // // Create a JSONModel from the filtered data
          // const oFilteredInfo = new sap.ui.model.json.JSONModel({
          //   items: filteredInfo
          // });
          // //07.01.2025

          that.getView().byId("idList").setModel(oInfoModel, "localData");
          break;
        case "Dash":
          // //07.01.2025
          // // Define the mapping of field names to display values
          // const fieldDash = {
          //   "OrderUpl": "Order Upload",
          //   "GRNUpl": "GRN Upload",
          //   "StradeUpl": "Sales to Trade Upload",
          //   "StockUpl": "Stock Upload"
          // };

          // // Extract relevant upload options marked as 'X'
          // const dashFields = ["OrderUpl", "GRNUpl", "StradeUpl", "StockUpl"];

          // dashFields.forEach(field => {
          //   if (responseData[field] === "X" || responseData[field] === true) {
          //     availableFields.push(fieldDash[field]); // Collect fields marked as 'X'
          //   }
          // });

          // const filteredDash = availableFields.map(field => ({
          //   key: field,   // You can change 'key' if you want a different identifier
          //   text: field   // Display text can be adjusted as well
          // }));

          // // Create a JSONModel from the filtered data
          // const oFilteredDash = new sap.ui.model.json.JSONModel({
          //   items: filteredDash
          // });
          // //07.01.2025

          that.getView().byId("idList").setModel(oDashModel, "localData");
          break;
        default:
          oList.setModel(null);
      }

      var aVisibleItems = [];
      oIconTabBar.getItems().forEach(function (oItem) {

        var $itemDomRef = oItem.getDomRef();

        // Check if the tab has a DOM reference, meaning it's visible on the screen
        if ($itemDomRef && $itemDomRef.offsetParent !== null) {
          aVisibleItems.push(oItem);
        }
      });

      var selectedtab = oItem.mProperties.key;
      var oSelectedItem = aVisibleItems.find(function (oItem) {
        return oItem.getKey() === selectedtab;
      });

      if (oSelectedItem) {
        oIconTabBar.setSelectedKey(oItem.getKey());
        this._bInsidePopover = true;
        oPopover.openBy(oSelectedItem);
      }
    },

    onIconTabFilterOut: function (oEvent, oItem) {
      var oPopover = this.getView().byId("popover");
      this._bInsidePopover = false;
      setTimeout(function () {
        if (!this._bInsidePopover) {
          oPopover.close();
        }
      }.bind(this), 1000);
    },
    onPopoverMouseOver: function (oEvent) {
      this._bInsidePopover = true;
    },
    onPopoverMouseOut: function () {
      var oPopover = this.getView().byId("popover");
      this._bInsidePopover = false;
      // Close the popover after a slight delay to allow for the mouse to move back into the tile
      setTimeout(function () {
        if (!this._bInsidePopover) {
          oPopover.close();
        }
      }.bind(this), 100);
    },
    onPress: function (oEvent) {
      var sFragmentName;
      var sControllerName;
      var sViewName;

      var oView = this.getView();
      var oContainer = oView.byId("fragmentContainer");
      oContainer.removeAllItems();

      var selectedRecord = oEvent.oSource.mProperties.title
      if (selectedRecord === 'Order Upload') {
        sFragmentName = "zretail_sfl.fragments.OrderUpload";
        sControllerName = "zretail_sfl.fragments.OrderUpload";
      }
      else if (selectedRecord === 'GRN Upload') {
        sFragmentName = "zretail_sfl.fragments.GrnUpload";
        sControllerName = "zretail_sfl.fragments.GrnUpload";
      }
      else if (selectedRecord === 'Sales to Trade Upload') {
        sFragmentName = "zretail_sfl.fragments.SalesToTrade";
        sControllerName = "zretail_sfl.fragments.SalesToTrade";
      }
      else if (selectedRecord === 'Stock Upload') {
        sFragmentName = "zretail_sfl.fragments.StkUpload";
        sControllerName = "zretail_sfl.fragments.StkUpload";
      }
      else if (selectedRecord === 'Order Acknowledgement') {
        sFragmentName = 'zretail_sfl.fragments.OrderAck';
        sControllerName = 'zretail_sfl.fragments.CFOrderAck';
      }
      else if (selectedRecord === 'Pending Order Status') {
        sFragmentName = "zretail_sfl.fragments.OrderPen";
        sControllerName = "zretail_sfl.fragments.OrderPen";
      }
      else if (selectedRecord === 'Dispatch Status') {
        sFragmentName = "zretail_sfl.fragments.OrderDes";
        sControllerName = "zretail_sfl.fragments.OrderDes";
      }
      else if (selectedRecord === 'GRN Status') {
        sFragmentName = "zretail_sfl.fragments.StkUpload";
        sControllerName = "zretail_sfl.fragments.StkUpload";
      }
      else if (selectedRecord === 'Test Certificate') {
        sFragmentName = "zretail_sfl.fragments.StkUpload";
        sControllerName = "zretail_sfl.fragments.StkUpload";
      }
      else if (selectedRecord === 'SFL Stock Information') {
        sFragmentName = "zretail_sfl.fragments.StkRep";
        sControllerName = 'zretail_sfl.fragments.StkRep';
      }
      else if (selectedRecord === 'Price List') {
        sFragmentName = "zretail_sfl.fragments.Price";
        sControllerName = "zretail_sfl.fragments.Price";
      }
      else if (selectedRecord === 'Payment Outstanding') {
        sFragmentName = "zretail_sfl.fragments.StkUpload";
        sControllerName = "zretail_sfl.fragments.StkUpload";
      }
      else {
        sFragmentName = "zretail_sfl.fragments.front";
        sControllerName = "zretail_sfl.fragments.front";
      }

      this.loadFragment(sFragmentName, sControllerName);
      // this.loadFragment("zretail_sfl.fragments.OrderAckFragment", "zretail_sfl.controller.OrderAck");                

    },
    loadView: function (sViewName) {
      var oView = this.getView();
      var oContainer = oView.byId("fragmentContainer"); // Your VBox container

      // Clear existing content
      oContainer.removeAllItems();

      // Dynamically create and add the new view
      sap.ui.core.mvc.XMLView.create({
        viewName: sViewName // Fully qualified view name
      }).then(function (oNewView) {
        oContainer.addItem(oNewView);
      }).catch(function (oError) {
        console.error("Error loading view:", oError);
      });
    },
    onAboutUsPress: function () {
      window.open("https://sundram.com/about-us.php", '_blank');

    },
    onContactsPress: function () {
      window.open("https://sundram.com/contact-us.php", '_blank');
    },
    onEventsPress: function () {
      window.open("https://www.sundram.com/awards.php", '_blank');
    },
    onNewsPress: function () {
      window.open("https://www.sundram.com/esgreport.php", '_blank');
    },
    
    loadFragment: function (sFragmentName, sControllerName) {
      var oView = this.getView();
      var oContainer = oView.byId("fragmentContainer");

      // Dynamically instantiate the controller 
      sap.ui.require([sControllerName.replace(/\./g, "/")], function (Controller) {
        console.log(Controller);
        if (typeof Controller === "function") {
          var oController = new Controller(); // Ensure proper instantiation
          oController.getView = function () {
            return oView;
          }; // Add a getView function if needed
        } else {
          console.error("Controller is not a valid function");
        }

        // Clear existing content
        oContainer.removeAllItems();
        var sUniqueId = oView.createId(sFragmentName + "_" + Date.now());
        // Load the fragment
        Fragment.load({
          id: sUniqueId,   //id: oView.createId(sFragmentName),
          name: sFragmentName,
          controller: oController
        }).then(function (oFragment) {
          // Add the fragment to the container
          oContainer.addItem(oFragment);
          // Store the unique ID in the controller for later use          
          oController._sFragmentUniqueId = sUniqueId;

          // Apply a specific style class based on the fragment name
          // var backgroundClass = "";
          // debugger;
          // switch (sFragmentName) {
          //   case "zretail_sfl.fragments.OrderUpload":
          //     backgroundClass = "OrderUploadBackground";
          //     break;            
          //   case "zretail_sfl.fragments.SalesToTrade":
          //     backgroundClass = "salesToTradeBackground";
          //     break;
          //   case "zretail_sfl.fragments.OrderAck":
          //     backgroundClass = "orderAckBackground";
          //     break;
          //   case "zretail_sfl.fragments.OrderPen":
          //     backgroundClass = "orderPenBackground";
          //     break;
          //   case "zretail_sfl.fragments.OrderDes":
          //     backgroundClass = "orderDesBackground";
          //     break;
          //   case "zretail_sfl.fragments.StkUpload":
          //     backgroundClass = "stkUploadBackground";
          //     break;
          //   case "zretail_sfl.fragments.StkRep":
          //     backgroundClass = "stkRepBackground";
          //     break;
          //   case "zretail_sfl.fragments.Price":
          //     backgroundClass = "priceBackground";
          //     break;
          //   default:
          //     backgroundClass = "defaultBackground";
          //     break;
          // }

          // // Add the style class to the container
          // if (backgroundClass) {
          //   oContainer.addStyleClass(backgroundClass);
          // }


          // Define the list of allowed fragment names
          var allowedFragments = [
            "zretail_sfl.fragments.SalesToTrade",
            "zretail_sfl.fragments.OrderAck",
            "zretail_sfl.fragments.OrderPen",
            "zretail_sfl.fragments.OrderDes",
            "zretail_sfl.fragments.StkRep",
            "zretail_sfl.fragments.Price"
          ];
          if (allowedFragments.includes(sFragmentName)) {
            // Call the onFragmentLoaded method of the controller
            if (typeof oController.onFragmentLoaded === "function") {

              oController.onFragmentLoaded(oFragment);

            }
          } else {
            oController.onInit(oFragment);
          }
        });
      });



    },
    onLogOut: async function () {
      debugger;
      const token = await this.getCsrfToken("/nodeapp/custom/logout");
      // Make the POST request to perform the logout
      $.ajax({
        type: "POST",
        url: "/nodeapp/custom/logout",  // Ensure this matches your logoutEndpoint
        headers: {
          "X-CSRF-Token": token,
          "Content-Type": "application/json"
        },
        success: function (data) {
          window.location.href = data; // Or any page you prefer
        },
        error: function (xhr, status, error) {
          console.error("Logout failed:", error);
          console.log("Response status:", xhr.status); // Log status for further debug
          console.log("Response text:", xhr.responseText); // Log response text
        }
      });
    },
    // Helper function to fetch the CSRF token
    getCsrfToken: function (url) {
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: "GET",
          url: url,  // Same URL as the logoutEndpoint
          headers: {
            "X-CSRF-Token": "fetch",  // To fetch the token
            "Content-Type": "application/json"
          },
          success: function (data, textStatus, request) {
            const token = request.getResponseHeader("X-CSRF-Token");
            debugger;
            resolve(token);
          },
          error: function (xhr, status, error) {
            console.error("Failed to fetch CSRF token:", error);
            reject(error);
          }
        });
      });
    },
    startSessionTimeout: function () {
      // Define your session timeout period in milliseconds (e.g., 15 minutes = 900000 ms)
      const sessionTimeout = 240000; // 4 min;
      let timeoutId;

      // Function to reset the session timeout
      const resetTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          this.onSessionTimeout(); // Call logout function when timeout occurs
        }, sessionTimeout);
      };

      // Add event listeners for user activity
      document.addEventListener("mousemove", resetTimeout);
      document.addEventListener("keydown", resetTimeout);

      // Start the session timeout initially
      resetTimeout();
    },

    onSessionTimeout: function () {
      // Show a message or directly log the user out
      sap.m.MessageToast.show("Session has expired due to inactivity.");

      // Call the function to refresh the session
      // this.refreshSession();

      // Call your logout function
      this.onLogOut();
    },


  })

});