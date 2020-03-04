'use strict';

angular
    .module('specta')
    .controller('deviceUsageGeoDistributionCtrl',deviceUsageGeoDistributionCtrl);

function deviceUsageGeoDistributionCtrl($scope, $stateParams, $http, globalConfig, $filter, $timeout, $rootScope, dataFormatter, uiGmapGoogleMapApi) {
    
    if(angular.isDefined($stateParams.params.file)){
        $scope.file = 'views/static/chart/' + $stateParams.params.file;
    }

    var tzoffset= globalConfig.tzoffset;
    var filterParameters = "";
    var heatLayerObj;
    var initLat= 15.65;
    var initLong= 74.0165;
    
    //--------------------------------------------------------------
    //Filter Section
    
//    var selKeysLocation= [], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], queryParam; 
//    
//    $scope.treeLocation= false;
//    $scope.treeRAT= false;
//    $scope.treeSegment= false;
//    $scope.treeDevice= false;
//    
//    $('.input-daterange').datepicker({
//        clearBtn:true,
//        autoclose: true,
//        assumeNearbyYear: true,
//        format: "yyyy-mm-dd",
//        startDate: "2015-12-23",
//        endDate: "0d"
//    });
//    var fromDate= $filter('date')( new Date().getTime() -30*24*3600*1000 , "yyyy-MM-dd");
//    var toDate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
//    $scope.date= {"start": fromDate, "end": toDate};
//    
//    
//    function chkEntry(values,name){
//        for(var i=0;i<values.length;i++){
//            if(values[i]==name) return true;
//        }
//        return false;
//    }
//    
//    var getParents= function(node){
//        var parent="";
//        while(node.parent){
//            if(parent=="")
//                parent = node.parent.data.key;
//            else if(node.parent.data.key=="_1")
//                parent = parent;
//            else
//                parent = node.parent.data.key + "." + parent;
//            node = node.parent;
//        }
////        if(parent=="_1")
////            parent = "";
//        return parent;
//    }
//    
//    function getFilterData(selectedKey){
//        var keyArrayParent= [];
//        var keyArrayResult= [];
//        var parentsParent= {};
//        
//        angular.forEach(selectedKey,function(node){
//            var thisNode= node.data;
//            var nodeKey= node.data.key;
//            var thisParent = node.parent;
//            var parentKey =thisParent.data.key;
//            if(thisNode.isFolder){
//                //First check if parent exists
//                if(!chkEntry(keyArrayParent,parentKey)){
//                    //Parent key does not exist, so add this entry in parent & result
//                    keyArrayParent.push(nodeKey);
//                    var getParentRes = getParents(node);
//                     if(getParentRes != '_1')
//                         //keyArrayResult.push(parentKey+"."+nodeKey);
//                         keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
//
//                    else
//                        keyArrayResult.push("/^." + nodeKey + "/");
//
//                }else{
//                    //My parents is selected, means I am already selected, 
//                    //so add self into parent list
//                    keyArrayParent.push(nodeKey);
//                }
//            }else{
//                //This is child case
//                //Check if this child's parent exists in result
//                if(!chkEntry(keyArrayParent,parentKey)){
//                    //Since parent does not exist, add this in result
//                    //keyArrayResult.push(parentKey+"."+nodeKey);
//                    var getParentRes = getParents(node);
//                    if(getParentRes != '_1')
//                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
//                    else
//                        keyArrayResult.push("/^." + nodeKey + "/");
//                }
//            }
//        })
//        console.log("keyArrayResult: ",keyArrayResult)
//        return keyArrayResult;
//    }
//
//    /*
//    *   Location Filter data
//    */
//    var locationData;
//    $http.get(globalConfig.mdataapiurl +'Location Lookup').then(function (response) {
//        locationData= response.data[0].children;
//        
//        $("#location").dynatree({
//            checkbox: true,
//            selectMode: 3,
//            children: locationData,
//            onSelect: function(select, node) {
//                // Display list of selected nodes
//                var selNodes = node.tree.getSelectedNodes();
//                
//                // Get a list of all selected nodes, and convert to a key array:
//                selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
//                    return node;
//                });
//                selKeysLocation= getFilterData(selKeysLocation);
//            },
//            onDblClick: function(node, event) {
//                node.toggleSelect();
//            },
//            onKeydown: function(node, event) {
//                if( event.which == 32 ) {
//                    node.toggleSelect();
//                    return false;
//                }
//            }
//        })
//    })
//    
//    /*
//    *   Device Filter data
//    */
//    var deviceData= [];
//    $http.get(globalConfig.dataapiurl+'aee30438a43d985bf296018ab').then(function (response) {
//        deviceData= response.data[0].children;
//        //console.log("data: ", deviceData)
//        $("#device").dynatree({
//            checkbox: true,
//            selectMode: 3,
//            children: deviceData,
//            onSelect: function(select, node) {
//                // Display list of selected nodes
//                var selNodes = node.tree.getSelectedNodes();
//                // Get a list of all selected nodes, and convert to a key array:
//                selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
//                    return node;
//                });
//                selKeysDevice= getFilterData    (selKeysDevice);
//            },
//            onDblClick: function(node, event) {
//                node.toggleSelect();
//            },
//            onKeydown: function(node, event) {
//                if( event.which == 32 ) {
//                    node.toggleSelect();
//                    return false;
//                }
//            }
//        });
//    })
//    
//    /*
//    *   RAT Filter data
//    */
//    var ratData = [
//        {title: "2G", key: "GERAN" },
//        {title: "3G", key: "UTRAN" },
//        {title: "4G", key: "LTE" }
//    ];
//    $("#rat").dynatree({
//        checkbox: true,
//        selectMode: 3,
//        children: ratData,
//        onSelect: function(select, node) {
//            // Display list of selected nodes
//            var selNodes = node.tree.getSelectedNodes();
//            // Get a list of all selected nodes, and convert to a key array:
//            selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
//                return node.data.key;
//            });
//            console.log("rat: ",selKeysRAT);
////            selKeysRAT= getFilterData(selKeysRAT);
//        },
//        onDblClick: function(node, event) {
//            node.toggleSelect();
//        },
//        onKeydown: function(node, event) {
//            if( event.which == 32 ) {
//                node.toggleSelect();
//                return false;
//            }
//        }
//    });
//
//    /*
//    *   Segment Filter data
//    */
//    var segmentData = [
//        {title: "VIP", key: "VIP" },
//        {title: "Platinum", key: "Platinum" },
//        {title: "Gold", key: "Gold" },
//        {title: "Youth", key: "Youth" }
//    ];
//    //var indx= -1,temp= [];
//    $("#segment").dynatree({
//        checkbox: true,
//        selectMode: 3,
//        children: segmentData,
//        onSelect: function(select, node) {
//            // Display list of selected nodes
//            var selNodes = node.tree.getSelectedNodes();
//            // Get a list of all selected nodes, and convert to a key array:
//            selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
//                return node.data.key;
//            })
//            console.log("segment: ",selKeysSegment)
////            selKeysSegment= getFilterData(selKeysSegment);
//        },
//        onDblClick: function(node, event) {
//            node.toggleSelect();
//        },
//        onKeydown: function(node, event) {
//            if( event.which == 32 ) {
//                node.toggleSelect();
//                return false;
//            }
//        }
//    });
//        
//    $scope.location = function() {
//        if ($scope.treeLocation)
//            $scope.treeLocation = false;
//        else{
//            $scope.treeLocation = true;
//            $scope.treeRAT = false;
//            $scope.treeSegment = false;
//            $scope.treeDevice = false;
//        }
//    }
//
//    $scope.rat = function() {
//        if ($scope.treeRAT)
//            $scope.treeRAT = false;
//        else{
//            $scope.treeLocation = false;
//            $scope.treeRAT = true;
//            $scope.treeSegment = false;
//            $scope.treeDevice = false;
//        }
//    }
//    
//    $scope.segment = function() {
//        if ($scope.treeSegment)
//            $scope.treeSegment = false;
//        else{
//            $scope.treeLocation = false;
//            $scope.treeRAT = false;
//            $scope.treeSegment = true;
//            $scope.treeDevice = false;
//        }
//    }
//
//    $scope.device = function() {
//        if ($scope.treeDevice)
//            $scope.treeDevice = false;
//        else{
//            $scope.treeLocation = false;
//            $scope.treeRAT = false;
//            $scope.treeSegment = false;
//            $scope.treeDevice = true;
//        }
//    }
//    
//    function getParameter(){
//        queryParam= ''
//        if(selKeysLocation!=''){
//            queryParam= "&location=["+selKeysLocation+"]";
//        }
//        if(selKeysRAT!= ''){
//            for(var i=0;i<selKeysRAT.length;i++){
//                selKeysRAT[i]= "'"+selKeysRAT[i]+"'"
//            }
//            queryParam= queryParam+"&rat=["+selKeysRAT+"]";
//        }
//        if(selKeysSegment!= ''){
//            for(var i=0;i<selKeysSegment.length;i++){
//                selKeysSegment[i]= "'"+selKeysSegment[i]+"'"
//            }
//            queryParam= queryParam+"&segment=["+selKeysSegment+"]";
//        }
//        if(selKeysDevice!= ''){
//            queryParam= queryParam+"&device=["+selKeysDevice+"]";
//        }
//        filterParameters = queryParam;
//        console.log('filterParameters',filterParameters);
//        return queryParam
//    }
//
//    //Submit button Click event
//    $scope.click= function(){
//        
//        $scope.treeLocation = false;
//        $scope.treeRAT = false;
//        $scope.treeSegment = false;
//        $scope.treeDevice = false;
//        
//        filterParameters= getParameter();
//        loadGeoDitribution();
//        deviceUsageTable();
//    }
    
    //End of Filter Section
    //--------------------------------------------------------------
    
    console.log('$stateParams.params',$stateParams.params);
    console.log('$stateParams.filterParams',$stateParams.filterParams);
    
    var key= $stateParams.params.Key;
    var DeviceName= $stateParams.params.Device;
    filterParameters= $stateParams.filterParams;
    filterParameters= filterParameters + "&device=[/^." + $stateParams.params.Device + "./]";
    
    function makeStatementUrl(statement){
        var newstatement=  statement+filterParameters;
        console.log('newstatement',newstatement);
        return newstatement;
    }

    $scope.DisplayKey= key;
    $scope.DeviceName= DeviceName;
    
    //Geo Distribution
    function loadGeoDitribution(){
        //var pointarray;
        var statementName= 'Test Heat Map with Filters';
        var mapData= [];
        console.log('statement name  === ', statementName);
        //heatLayerObj.setData(mapData);    //If want to reset the map           
        var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(statementName);
        $http.get(url).then(function (response) {  
            var objArray = response.data;
            if(objArray.length>0){
                for (var i = 0; i < objArray.length; i++) {
                    mapData[i]= new google.maps.LatLng(objArray[i].latitude, objArray[i].longitude);
                }
                initLat= objArray[0].latitude;
                initLong= objArray[0].longitude;
            }
            //var pointArray = new google.maps.MVCArray(mapData);
            //console.log('heatLayerObj',heatLayerObj);
            //if(firsttime)
            heatLayerObj.setData(mapData);
            
        });        
    }

    
    function LoadHeatLayer(heatLayer) {
        heatLayerObj= heatLayer;
        loadGeoDitribution();
    };

    $scope.map = {
        center: {
            latitude: initLat,
            longitude: initLong
        },
        options:{
            scrollwheel: false
        },
        zoom: 9,
        heatLayerCallback: function (layer) {
            //set the heat layers backend data
            var loadHeatLayer = new LoadHeatLayer(layer);
        },
        showHeat: true,
        size:{
            height: 400
        } 
    };
    
    
        //Tab Penetration
    //Datatable Options
    $scope.tableOptions= { 
        "order" :[[4,"desc"]]
        //"aaSorting": [],
        //paging: true,
        //"bLengthChange": false, 
        //searching: false,
        //"bSort": false, 
        //"bInfo": true,
        //"bAutoWidth": false 
    };
    function tableDataElement (a,b,c,d,e,f,g) {
        this.country= a;
        this.circle= b;
        this.city= c;
        this.area= d;
        this.cell= e;
        this.value= f;
        this.valueperc= g;
    }
    var dataArray= [];
    dataArray[0]= new tableDataElement('- No record-','','');
    $scope.dataset = dataArray;
    
    var statementName;
    var totalstatementName;
    if(key == 'Count'){
        statementName= 'Location wise count for Handset';
        totalstatementName= 'Location wise total count for Handset';
    }else if(key == 'Traffic'){
        statementName= 'Location wise traffic for Handset';
        totalstatementName= 'Location wise total traffic for Handset';
    }
    
    function loadDeviceTable(){        
        //First get the total for % calculation
        var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(totalstatementName);
        console.log(url);
        $http.get(url).then(function (response) {  
            console.log(response.data)
            var objArray = response.data;
            var total= objArray[0].Total;
            
            //Now get details
            var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(statementName);
            $http.get(url).then(function (response) {  
                console.log(response.data)
                var objArray = response.data;
                for (var i = 0; i < objArray.length; i++) {
                    dataArray[i] = new tableDataElement(
                        objArray[i].Country,
                        objArray[i].Circle,
                        objArray[i].City,
                        objArray[i].Area,
                        objArray[i].Cell,
                        objArray[i].value,
                        (objArray[i].value / total)*100
                    );
                }
                $scope.dataset = dataArray;        
            });
        });
    }
    
    loadDeviceTable();
}