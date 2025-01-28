sap.ui.define([
  'zretail_sfl/controller/BaseController',
  "sap/ui/core/Fragment",
  'sap/m/MessageBox',
], function (BaseController, Fragment, MessageBox) {
  'use strict';
  return BaseController.extend("zretail_sfl.controller.welcome", {

    selectedSflTile: false,
    selectedTplTile: false,

    onInit: async function () {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);

      const oDate = new Date();
      const oModel = new sap.ui.model.json.JSONModel({
        currentDate: oDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      });
      this.getView().setModel(oModel, "dateModel");

      this._userModel = this.getOwnerComponent().getModel("userModel");
      let me = this;
      const that = this;

      // Declare availableDivisions outside the try block
      let availableDivisions = [];  // Initialize it as an empty array
      let response;
      try {
        // Fetch user information
        const userResponse = await fetch("/getUserInformation");
        const userData = await userResponse.json();

        // Set data to userModel
        this._userModel.setProperty("/", {
          email: userData.email,
          user: userData.user,
          scopes: userData.scopes,
          given_name: userData.user.given_name,
          family_name: userData.user.family_name,
          user_name: userData.user.user_name,
        });

        // Save user data to localStorage
        localStorage.setItem("userInfo", JSON.stringify(userData));

        // Retrieve email ID from the model
        const sEmail = userData.email;

        // Make AJAX call to fetch AccCont data
       response = await $.ajax({
          url: "/nodeapp/accCont", // Your custom backend route
          method: "GET",          // Use GET since you're retrieving data
          contentType: "application/json",
          data: { email: sEmail } // Send the email as a query parameter
        });

        // Handle case where response is an array
        const responseData = Array.isArray(response) ? response[0] : response;
        // Ensure you have a valid object
        if (!responseData || typeof responseData !== "object") {
          throw new Error("Invalid response structure");
        }

        // Save access data to localStorage
        localStorage.setItem("accessInfo", JSON.stringify(responseData));

        // Determine visibility based on Sfl and Tpl values set to true or false
        const showSflTile = responseData.Sfl === "X";
        const showTplTile = responseData.Tpl === "X";

        // Check if both Sfl and Tpl are not true (i.e., not "X")
        if (!showSflTile && !showTplTile) {
          // Display an error message if neither condition is true
          sap.m.MessageBox.error("No Company Code Maintained");
        }

        // Update the model with visibility data
        const tileVisibilityModel = this.getOwnerComponent().getModel("tileVisibilityModel");
        tileVisibilityModel.setProperty("/showSflTile", showSflTile);
        tileVisibilityModel.setProperty("/showTplTile", showTplTile);

        this.getView().setModel(tileVisibilityModel, "tileVisibilityModel");

        // Extract relevant divisions marked as 'X'
        const divisionFields = ["Autolec", "Fd", "Rca"];
        divisionFields.forEach(field => {
          if (responseData[field] === "X") {
            availableDivisions.push(field); // Collect fields marked as 'X'
          }
        });

      } catch (error) {
        console.error("Error fetching AccCont data:", error.message);
      }

      // Ensure that availableDivisions is accessible here
      console.log("Available Divisions:", availableDivisions);

      const iconMap = {
        "Autolec": "sap-icon://eam-work-order",
        "Fd": "sap-icon://factory",
        "Mfd": "sap-icon://shipping-status",
        "Rca": "sap-icon://add-product",
        "Ukd": "sap-icon://physical-activity",
        "Ad": "sap-icon://action",
        "Asd": "sap-icon://subway-train",
        "Hwf": "sap-icon://technical-object",
        "Sez": "sap-icon://sales-order"
      };

      const imageMap = {
        "Autolec": "images/AUTOLEC.jpg",
        "Fd": "images/hightensil.png",
        "Rca": "images/hot_forged.jpg", 
      };
      const oHBox = this.byId("tileContainer");
      oHBox.removeAllItems();

      const spanMapping = {
        1: "L12 M12 S12",
        2: "L6 M6 S12",
        3: "L4 M6 S12",
      };
      const defaultSpan = spanMapping[availableDivisions.length] || "L4 M6 S12";      
      // Dynamically create GenericTiles for each available division
      const oGrid = new sap.ui.layout.Grid({
        defaultSpan: defaultSpan, // Set grid responsiveness
        hSpacing: 1, // Add horizontal spacing between tiles
        vSpacing: 1, // Add vertical spacing between tiles        
        content: availableDivisions.map(division => {
          const divisionUpperCase = division.toUpperCase();
          const imageSrc = imageMap[division] || "images/default-image.png"; // Fallback image

          // Create GenericTile
          const oTile = new sap.m.GenericTile({
            // Text for the tile       ariaLabel: divisionUpperCase,   
            header: divisionUpperCase,
            systemInfo: divisionUpperCase,
            frameType: "OneByHalf",
            press: this.onDivisionSelect.bind(this), // Tile press event
          });
          // Add a custom CSS class for styling
          oTile.addStyleClass("transparentTile");

          // Apply background image dynamically
          oTile.addDelegate({
            onAfterRendering: function () {
              const tileDomRef = oTile.getDomRef();             
            },
          });

          return oTile;
        
        }),
      });

      // Add the Grid to your container
      oHBox.addItem(oGrid);
     
      // Set HBox layout properties to make the tiles display neatly
      oHBox.setLayoutData(new sap.ui.layout.GridData({
        span: "L4 M6 S12"  // Adjust column span for different screen sizes
      }));

      // Additional alignment properties for HBox (if needed)
      oHBox.setJustifyContent(sap.m.FlexJustifyContent.Center);
      oHBox.setAlignItems(sap.m.FlexAlignItems.Center);

      // Hide the busy indicator on success
      sap.ui.core.BusyIndicator.hide();

      // Process and bind response data
      const oJsonModel = new sap.ui.model.json.JSONModel();
      oJsonModel.setData(response);
      that.getView().setModel(oJsonModel, "AccContModel");

      // For email link hovering
      var oProfile = this.byId("_IDGenAvatar");
      // Add event delegate for mouse hover events
      oProfile.addEventDelegate({
        onmouseover: this.onProfileHover.bind(this), // Call hover function
        onmouseout: this.onProfileMouseOut.bind(this), // Handle mouse out
      });
    },

    onBeforeRendering: function () {
      if (this.oRouter) {
        // Detach PatternMatched before re-rendering
        this.oRouter.getRoute("RouteView1").detachPatternMatched(this._onObjectMatched, this);
      }
    },
    onAfterRendering: function () {
      // Re-attach PatternMatched after rendering
      this.oRouter.getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);
    },
    _onObjectMatched: function () {
      debugger;
      const tileSelectedModel = this.getOwnerComponent().getModel("tileSelectedModel");
      tileSelectedModel.setProperty("/selectedTplTile", false);
      tileSelectedModel.setProperty("/selectedSflTile", false);
      // Detach the event handler to prevent further calls
      this.oRouter.getRoute("RouteView1").detachPatternMatched(this._onObjectMatched, this);
    },

    onDivisionSelect: function (selectedDivision) {
      debugger;
      // Get the tile selection model
      const tileSelectedModel = this.getOwnerComponent().getModel("tileSelectedModel");
      const selectedSflTile = tileSelectedModel.getProperty("/selectedSflTile");
      const selectedTplTile = tileSelectedModel.getProperty("/selectedTplTile");

      // Check if neither SFL nor TPL is selected
      if (!selectedSflTile && !selectedTplTile) {
        // Show error message if neither button is pressed
        sap.m.MessageBox.error("Please select company first and choose division.");
        return; // Exit the function without navigating
      }
      const selectedDivisionModel = this.getView().getModel("selectedDivisionModel");
      selectedDivisionModel.setProperty("/selectedDivision", selectedDivision);

      // Store the selected division in local storage
      const divisionData = {
        selectedDivision: selectedDivision.oSource.mProperties.header,
        selectedSflTile: selectedSflTile,
        selectedTplTile: selectedTplTile
      };
      localStorage.setItem("divisionData", JSON.stringify(divisionData));

      this.oRouter.navTo("operations");
    },
    onSFLPress: function () {
      // Update the model with visibility data
      const tileSelectedModel = this.getOwnerComponent().getModel("tileSelectedModel");
      this.selectedSflTile = true;
      this.selectedTplTile = false;
      tileSelectedModel.setProperty("/selectedSflTile", this.selectedSflTile);
      tileSelectedModel.setProperty("/selectedTplTile", this.selectedTplTile);

      // Store SFL selection in local storage
      const divisionData = JSON.parse(localStorage.getItem("divisionData")) || {};
      divisionData.selectedSflTile = this.selectedSflTile;
      divisionData.selectedTplTile = this.selectedTplTile;
      localStorage.setItem("divisionData", JSON.stringify(divisionData));

    },
    onTPLPress: function () {
      // Update the model with visibility data
      const tileSelectedModel = this.getOwnerComponent().getModel("tileSelectedModel");
      this.selectedTplTile = true;
      this.selectedSflTile = false;
      tileSelectedModel.setProperty("/selectedTplTile", this.selectedTplTile);
      tileSelectedModel.setProperty("/selectedSflTile", this.selectedSflTile);

      // Store TPL selection in local storage
      const divisionData = JSON.parse(localStorage.getItem("divisionData")) || {};
      divisionData.selectedTplTile = this.selectedTplTile;
      divisionData.selectedSflTile = this.selectedSflTile;
      localStorage.setItem("divisionData", JSON.stringify(divisionData));

    },

    onProfileHover: function (oEvent) {
      debugger;
      var oView = this.getView();
      // var oProfile = oEvent.getSource();
      var oProfile = oEvent.srcControl; // Get the link control

      var userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
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
      const sessionTimeout = 480000; // 2 min;
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
      this.onLogOut();
    },
  });
});