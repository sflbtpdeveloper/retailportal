sap.ui.define([
    'zretail_sfl/controller/BaseController',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function(BaseController, Filter, FilterOperator) {
    'use strict';
    return BaseController.extend("zretail_sfl.controller.master",{
        onInit: function(){
            //Step 1: obtain the router object
            this.oRouter = this.getOwnerComponent().getRouter();    
            // BaseController.prototype.onInit.apply(this);      
        },
        // onShift: function(){
        //     this.oRouter.navTo("hulk");            
        // },
        // // onLogin: function(myLoginId){
        // //     this.oRouter.navTo("superman",{
        // //         loginId: myLoginId
        // //     });            
        // // },        
        // onPart: function(){
        //     this.oRouter.navTo("ironman");            
        // },      
        // onMachine: function(){
        //     this.oRouter.navTo("batman");            
        // },  
        // onPrvw: function(){
        //     this.oRouter.navTo("thanos");            
        // },    
        // onHome: function(){
        //     this.oRouter.navTo("RouteView1");            
        // },                               

        // onNext: function(myFruitId){
        //     //Step 1 : get the mother object - container (appCon)
        //     //New: we need to get parent 2 times to get to the section
        //     // as well as get the container object of splitApp
        //     ///var oAppCon = this.getView().getParent().getParent();
        //     //Step 2: Mother can talk to another child (Navigate to second view)
        //     //New: We navigate on right side of the screen - detail section
        //     ///oAppCon.toDetail("idView2");

        //     this.oRouter.navTo("superman",{
        //         fruitId: myFruitId
        //     });
        // },
        // onItemPress: function(oEvent){
        //     //Step 1: Get to know which item did user click on
        //     var oSelectedItem = oEvent.getParameter("listItem");
        //     //Step 2: Extract the path of the selected item /fruits/index
        //     var sPath = oSelectedItem.getBindingContextPath();
        //     //Step 3: get the object of target control  (View2) - from app container obtain second view
        //     //var oView2 = this.getView().getParent().getParent().getDetailPage("idView2");
        //     //Step 4: Bind the element with the target control
        //     //oView2.bindElement(sPath);
        //     //Navigate
        //     var sIndex = sPath.split("/")[sPath.split("/").length - 1];
        //     this.onNext(sIndex);
        // },
        // onDelete: function(oEvent){
        //     //Step 1: Get the object of the item to be deleted
        //     var oListItemToBeDeleted = oEvent.getParameter("listItem");
        //     //Step 2: Get the list control object
        //     //var oList = this.getView().byId("idList");
        //     //Since the delete event originating from List class and we need the List object itself --better
        //     var oList = oEvent.getSource();
        //     //Step 3: Delete the item
        //     oList.removeItem(oListItemToBeDeleted);
        // },
        // onSearch: function(oEvent){
        //     //Step 1: What was the value searched by user
        //     var sValue = oEvent.getParameter("query");
        //     if(!sValue){
        //         //because the code has come in this function due to liveChange
        //         sValue = oEvent.getParameter("newValue");
        //     }
        //     //Step 2: Create a search object to be passed to the list - IF condition
        //     //app -- apple, pineapple
        //     var oFilter1 = new Filter("CATEGORY", FilterOperator.Contains, sValue);
        //     //Step 4: Inject the filter inside the binding of items
        //     this.getView().byId("idList").getBinding("items").filter(oFilter1);
            
        // },
        // onProductAdd: function(){
        //     this.oRouter.navTo("ironman");
        // }
    });
});