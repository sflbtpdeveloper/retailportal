sap.ui.define([
    'zretail_sfl/controller/BaseController', 
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    function (BaseController, ODataModel, MessageToast,MessageBox) {
        "use strict";

        return BaseController.extend("zretail_sfl.fragments.front", {
            onInit: function (oFragment) {                
                // this._startCarouselTimer(oFragment);
                // this.startCarouselAutoSlide();

                // const welcomeText = this.getView().byId( sFragmentId + "--welcomeText");                
                // setTimeout(() => {
                //     welcomeText.setText("Welcome to the Best Portal Experience!");
                // }, 500);
                
                // this.typewriterEffect("Welcome to Sundram Fasteners Limited!");

                this.startFadeInOut();
            },
            typewriterEffect: function (textId, message) {
              // const oText = this.byId(textId); // Reference to Text control
              var sFragmentId = this._sFragmentUniqueId;
              const oText = this.getView().byId( sFragmentId + "--welcomeText"); 
              let index = 0;
          
              const type = () => {
                  if (index < message.length) {
                      oText.setText(oText.getText() + message.charAt(index));
                      index++;
                      setTimeout(type, 100); // Typing speed (100ms)
                  } else {
                      setTimeout(() => {
                          oText.setText(""); // Clear text
                          index = 0;
                          type(); // Restart typing
                      }, 2000); // Pause before restarting (2000ms)
                  }
              };
          
              type();
          },            
            _startCarouselTimer: function (oFragment) {                
                var sFragmentId = this._sFragmentUniqueId;
                var oCarousel = this.getView().byId( sFragmentId + "--__productCarousel");
                // var oCarousel = this.byId("productCarousel");
                this._carouselIndex = 0;
                var aPages = oCarousel.getPages();
                var iTotalPages = aPages.length;
            
                if (iTotalPages > 1) {
                    setInterval(function () {
                        // aPages[this._carouselIndex].removeStyleClass("customCarosalfade");
                        this._carouselIndex = (this._carouselIndex + 1) % iTotalPages;
                        const oNextPage = aPages[this._carouselIndex];
                        if (oNextPage) {           
                            // oNextPage.addStyleClass("customCarosalfade");                                                                     
                            oCarousel.setActivePage(oNextPage);                                                        
                        }
                    }.bind(this), 5000); // Change every 5 seconds
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
                const sessionTimeout = 480000; // ;
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

            //   startCarouselAutoSlide: function (oFragment) {
            //     var sFragmentId = this._sFragmentUniqueId;
            //     var oCarousel =  this.getView().byId( sFragmentId + "--idPortal");
            //     this._carouselIndex = 0;
            
            //     // Get total number of pages in the carousel
            //     var aPages = oCarousel.getPages();
            //     var iTotalPages = aPages.length;
            
            //     // Set interval for auto-slide
            //     if (iTotalPages > 1) {
            //     setInterval(function () {
            //       this._carouselIndex = (this._carouselIndex + 1) % iTotalPages; // Loop back to first
            //         const oNextPage = aPages[this._carouselIndex];
            //         if (oNextPage) { 
            //         oCarousel.setActivePage(oNextPage);
            //         }
            //     }.bind(this), 3000); // 8 seconds delay
            //   }
            // },
            startFadeInOut: function (oFragment) {
              var aImagePaths = [
                  // "/images/IMG_5041.jpg",
                  // "/images/IMG_5634.jpg",
                  // "/images/IMG_4933.jpg",
                  // "/images/IMG_4954.jpg",
                  // "/images/IMG_3718.jpg",
                  // "/images/IMG_4784.jpg",
                  "/images/Black-Nut.jpg",
                  "/images/Bolt.jpg",                  
                  "/images/DSC03285.jpg",
                  "/images/IMG_0398.jpg",
                  "/images/IMG_3883.jpg",
                  // "/images/DSC03347.jpg", 
                  // "/images/DSC03300.jpg", 
                  // "/images/DSC03280.jpg", 
                  // "/images/DSC03371.jpg",                  
              ];

              // var aWelcomeMessages = [
              //   "Welcome to Sundram Fasteners Limited!",
              //   "Discover our Products!",
              //   "Explore the highlights of our Products!",
              //   "See our premium products!",
              //   "Experience excellence with us!",
              // ];              
          
              var sFragmentId = this._sFragmentUniqueId;
              var oImage =  this.getView().byId( sFragmentId + "--fadeImage");    
              // var oWelcomeText = this.getView().byId(sFragmentId + "--welcomeText");                         
              this._carouselIndex = 0;
              var iTotalPages = aImagePaths.length;
              // Set the initial image
              oImage.setSrc(aImagePaths[this._carouselIndex]);
              // oWelcomeText.setText(aWelcomeMessages[this._carouselIndex]);
              if (iTotalPages > 1) {
              // Cycle through images
              setInterval(function () {
                this._carouselIndex = (this._carouselIndex + 1) % iTotalPages;  
                const oNextPage = aImagePaths[this._carouselIndex];                 
                if (oNextPage) {              
                  oImage.setSrc(oNextPage);
                }
              }.bind(this), 3000); // 8 seconds per image
            }
          }                          
              
              
       
        });
    });