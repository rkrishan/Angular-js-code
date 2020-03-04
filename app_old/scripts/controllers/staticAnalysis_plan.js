    /*'use strict';

angular.module('specta') 
    .controller('StaticAnalysisCtrl',function($scope, $stateParams, $http,globalConfig,$filter,$timeout,$rootScope,$interval,dataval,flotChrtOptions) {
    
    console.log('file', $stateParams.file);
    if(angular.isDefined($stateParams.file)){
        $scope.file = 'views/static/analysis/' + $stateParams.file;
    }
    
});*/

'use strict';

angular
    .module('specta')
    .controller('staticAnalysisCtrl', staticAnalysisCtrl)
    .controller('deviceAnalyticsCtrl',deviceAnalyticsCtrl)
    .controller('deviceGeoDistributionCtrl',deviceGeoDistributionCtrl)
    .controller('deviceInsightsCtrl',deviceInsightsCtrl)
    .controller('appAnalyticsCtrl',appAnalyticsCtrl)
    .controller('browsingAnalyticsCtrl',browsingAnalyticsCtrl)
    .controller('userSegmentAnalyticsCtrl',userSegmentAnalyticsCtrl)
    .controller('PlanAnalyticsCtrl',PlanAnalyticsCtrl)
    .controller('CustomerAnalyticEnterIMSICtrl',CustomerAnalyticEnterIMSICtrl)
    .controller('CustomerAnalyticsCtrl',CustomerAnalyticsCtrl);
    
//    ----------------------------------------------------------------------------

// Static Analytics Controller
function staticAnalysisCtrl($scope, $stateParams, globalConfig, $http, ChartService, filterService){
    $scope.apiURL = globalConfig.dataapiurl;
    ChartService.setCurrentPage(null);
    console.log('if', $stateParams);
    if( $stateParams.id && $stateParams.id != '' ){
        $http.get($scope.apiURL +'/analysis/'+ $stateParams.id).then(function (response) {
            //console.log(response.data);
            $scope.headerName = response.data.name;
            $scope.file = 'views/static/' + response.data.file;
            
        });
    }
    else if($stateParams.file){
        if($stateParams.name)
            $scope.headerName = $stateParams.name;
        else
            $scope.headerName = 'BBPlanDetailReport';
        
        $scope.file = 'views/static/' + $stateParams.file;
    }
    
    /*$scope.getDeviceData= function(){
        $http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
            console.log("response.data[0].children", response.data[0].children);
            filterService.getDevices(response.data[0].children);
        })
    }
    var i= angular.copy($scope.getDeviceData())
    console.log('file', i);*/
    /*if(angular.isDefined($stateParams.file)){
        $scope.file = 'views/static/analysis/' + $stateParams.file;
    }*/
}
// End Static Analytics Controller
//    ----------------------------------------------------------------------------

// Device Analytics Controller
function deviceAnalyticsCtrl($scope, $state, $http, globalConfig, $filter, $timeout, $rootScope, dataFormatter, flotChartOptions, locationFilterService, filterService) {
    
    var tzoffset= globalConfig.tzoffset;
    var filterParameters = "";
    var selKeysLocation= [], selKeysDevice= [], selKeysRAT= [], selKeysSegment= [], queryParam;
    //--------------------------------------------------------------
    //Filter Section
    
     
    
    function filterGetParams(){
        /*var locationFilterData= null, ratFilterData= null, segmentFilterData= null;
        locationFilterData= filterService.getLocations();
        ratFilterData= filterService.getRATs();
        segmentFilterData= filterService.getSegments();
        $scope.deviceFilterData= filterService.getDevices();*/
        
        $scope.locationinfo= filterService.getLocationInfo(selKeysLocation);
        $scope.ratinfo= filterService.getRATInfo(selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo(selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo(selKeysDevice);
        
        return filterService.getParameter(selKeysLocation, selKeysRAT, selKeysSegment, selKeysDevice);
    }
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    $('.input-daterange').datepicker({
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-6-3",
        endDate: "0d"
    });
    
    var fromDate= $filter('date')( new Date().getTime()- 24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime()- 24*3600*1000 , "yyyy-MM-dd");
    fromDate= fromDate.substring(0,8);
    fromDate= fromDate+"01"
    console.log("fromDate", fromDate);
    $scope.date= {"start": "2016-09-18", "end": toDate};
    
    
    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    var getParents= function(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
	//if(parent=="_1")
	//parent = "";
        return parent;
    }
    
    function getFilterData(selectedKey){
        var keyArrayParent= [];
        var keyArrayResult= [];
        var parentsParent= {};
        
        angular.forEach(selectedKey,function(node){
            var thisNode= node.data;
            var nodeKey= node.data.key;
            var thisParent = node.parent;
            var parentKey =thisParent.data.key;
            if(thisNode.isFolder){
                //First check if parent exists
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Parent key does not exist, so add this entry in parent & result
                    keyArrayParent.push(nodeKey);
                    var getParentRes = getParents(node);
                     if(getParentRes != '_1')
                         //keyArrayResult.push(parentKey+"."+nodeKey);
                         keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");

                    else
                        keyArrayResult.push("/^." + nodeKey + "/");

                }else{
                    //My parents is selected, means I am already selected, 
                    //so add self into parent list
                    keyArrayParent.push(nodeKey);
                }
            }else{
                //This is child case
                //Check if this child's parent exists in result
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Since parent does not exist, add this in result
                    //keyArrayResult.push(parentKey+"."+nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1')
                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                    else
                        keyArrayResult.push("/^." + nodeKey + "/");
                }
            }
        })
        console.log("keyArrayResult: ",keyArrayResult)
        return keyArrayResult;
    }

    /*
    *   Location Filter data
    */
    var locationData;
    //$http.get(globalConfig.pulldataurlbyname +'Location Lookup').then(function (response) {
        //locationData= response.data[0].children;
        
         var filterData= locationFilterService.locationFilterData();
         //console.log(filterData);
        locationData= filterData.children;
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: locationData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                
                // Get a list of all selected nodes, and convert to a key array:
                selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysLocation= getFilterData(selKeysLocation);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        })
    //})
    
    /*
    *   Device Filter data
    */
    function getDevices(){
        var deviceData= [];
        $http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
            deviceData= response.data[0].children;
            //console.log("data: ", deviceData)
            $("#device").dynatree({
                checkbox: true,
                selectMode: 3,
                children: deviceData,
                onSelect: function(select, node) {
                    // Display list of selected nodes
                    var selNodes = node.tree.getSelectedNodes();
                    // Get a list of all selected nodes, and convert to a key array:
                    selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                        return node;
                    });
                    selKeysDevice= getFilterData(selKeysDevice);
                },
                onDblClick: function(node, event) {
                    node.toggleSelect();
                },
                onKeydown: function(node, event) {
                    if( event.which == 32 ) {
                        node.toggleSelect();
                        return false;
                    }
                }
            });
            return selKeysDevice;
       })
    }
    /*
    *   RAT Filter data
    */
    var ratData = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: ratData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            console.log("rat: ",selKeysRAT);
            //selKeysRAT= getFilterData(selKeysRAT);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });

    /*
    *   Segment Filter data
    */
    var segmentData =filterService.getSegments();
    //var indx= -1,temp= [];
    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            })
            console.log("segment: ",selKeysSegment)
            //selKeysSegment= getFilterData(selKeysSegment);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });
        
    $scope.location = function() {
        if ($scope.treeLocation)
            $scope.treeLocation = false;
        else{
            $scope.treeLocation = true;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }

    $scope.rat = function() {
        if ($scope.treeRAT)
            $scope.treeRAT = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = true;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }
    
    $scope.segment = function() {
        if ($scope.treeSegment)
            $scope.treeSegment = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = true;
            $scope.treeDevice = false;
        }
    }

    $scope.device = function() {
        if ($scope.treeDevice)
            $scope.treeDevice = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = true;
        }
    }
    
    //Submit button Click event
    $scope.click= function(){
        
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;
        
        filterParameters= filterGetParams();
        filterParameters=filterParameters+ "&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+queryParam;
        
        
        topHandsetby_count_usage();
        topHandsetby_avg_usage();
    }
    
    //End of Filter Section
    //--------------------------------------------------------------
    
    
    
    function makeStatementUrl(statement){
       var newstatement=  statement+filterGetParams()+ "&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";
        return newstatement;
    }

    function formatModel(model){
        if(model.length > 15)
            model= model.substring(0,15) + "..."
        return model;
    }
    
    function flotPieDataElement (a,b,c) {
        this.label = a;
        this.data = b;
        this.color = c;
    }
    
    var params= {};
    var filterParams;
    function buildParams(key,item){
        params.Key= key;
        params.Device= item.series.label;
        filterParameters= filterGetParams();
        filterParameters=filterParameters+ "&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+queryParam;
    }
    
    $("#interactiveCountData").bind("plotclick",function (event, pos, item) {
        $scope.$apply(function(){
            if(item){
                buildParams("Count",item);
            }
        });
        //$state.go('index.deviceUsageGeoDistribution',{'params': params, 'filterParams': filterParams});
    });
    $("#interactiveTrafficData").bind("plotclick",function (event, pos, item) {
        $scope.$apply(function(){
            if(item){
                buildParams("Traffic",item);     
            }
        });
        //$state.go('index.deviceUsageGeoDistribution',{'params': params, 'filterParams': filterParams});
    });
    $("#interactiveAvgTrafficData").bind("plotclick",function (event, pos, item) {
        $scope.$apply(function(){
            if(item){
                buildParams("AvgTraffic",item);     
            }
        });
        //$state.go('index.deviceUsageGeoDistribution',{'params': params, 'filterParams': filterParams});
    });
    
    function top10HandsetsDiv(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingTop10HandsetsDiv= loadingDivStatus;
        $scope.dataTop10HandsetsDiv= dataDivStatus;
        $scope.noDataTop10HandsetsDiv= noDataDivStatus;
    }
    
    function topHandsetby_count_usage(){    //for flotPieChart 
        
        top10HandsetsDiv(true, false, false);
        /**
        *  Top Handsets Flot Pie Chart Data
        */
        var flotPieOptions= flotChartOptions.flotDoughnutChartOptions;
        //Customize the options as needed
        flotPieOptions.series.pie.innerRadius= 30;
        var colorpaletteCount = ["#FF6600", "#FF7600", "#FF8600", "#FF9600", 
                        "#FFA600", "#FFB600", "#FFC600", "#FFD600" , 
                        "#FFE600", "#FFF600", "#FF7F7F", "#FF8F7F","#FF9F7F"];
        var colorpaletteUsage = ["#0094FF", "#00A4FF", "#00B4FF", "#00C4FF", 
                        "#00D4FF", "#00E4FF", "#00F4FF", "#0104FF" , 
                        "#0124FF", "#0144FF", "#0164FF", "#0184FF","#01A4FF"];
        
        $scope.flotPieOptions = flotPieOptions;
        
        var statementName= 'Handset wise Count and Traffic for table and Pie chart';
        var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(statementName);
        $http.get(url).then(function (response) {
            //console.log(response.data)
            var objArray = response.data;
            var chartDataCount = [];
            var chartDataTraffic = [];
            var legendDataCount= [];
            var legendDataTraffic= [];
            if(objArray.length>0){
                for (var i = 0; i < 10; i++) {
                    chartDataCount[i] = new flotPieDataElement(objArray[i].Device,objArray[i].countDevice,colorpaletteCount[i]);

                    chartDataTraffic[i] = new flotPieDataElement(objArray[i].Device,objArray[i].Traffic,colorpaletteUsage[i]);

                    legendDataCount[i] = new flotPieDataElement(objArray[i].Device,dataFormatter.formatCountData(objArray[i].countDevice, 3),colorpaletteUsage[i]);

                    legendDataTraffic[i] = new flotPieDataElement(objArray[i].Device,dataFormatter.formatUsageData(objArray[i].Traffic,2),colorpaletteUsage[i]);
                }
                $scope.flotHandsetCountData= chartDataCount;
                $scope.flotHandsetUsageData= chartDataTraffic;
                $scope.legendDataCount= legendDataCount;
                $scope.legendDataTraffic= legendDataTraffic;
                
                top10HandsetsDiv(false, true, false);
                
            }else{
                top10HandsetsDiv(false, false, true);
            }
        }) 
    }
    
    function topHangsetsAvgTrafficDiv(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingTopHangsetsAvgTrafficDiv= loadingDivStatus;
        $scope.dataTopHangsetsAvgTrafficDiv= dataDivStatus;
        $scope.noDataTopHangsetsAvgTrafficDiv= noDataDivStatus;
    }
    
    function topHandsetby_avg_usage(){
        topHangsetsAvgTrafficDiv(true, false, false);
        
        /**
        *  Top Handsets Doughnut Chart Data
        */
        var flotPieOptions= flotChartOptions.flotDoughnutChartOptions;
        //Customize the options as needed
        var colorpaletteAvgUsage = ["#336600", "#339933", "#66CC00", "#33FF00", 
                        "#99FF00", "#99FF66", "#CCFF00", "#CCFF66" , 
                        "#CCFF99", "#0FD4FF", "#0FE4FF", "#0FF4FF","#01A4FF"];
        
        $scope.flotPieOptions = flotPieOptions;

        var statementName= 'Top Handsets by avgTraffic';
        var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(statementName);
        $http.get(url).then(function (response) {
            //console.log(response.data)
            var objArray = response.data;
            var chartDataAvgTraffic = [];
            var legendDataAvgTraffic= [];
            
            if(objArray.length>0){
                for (var i = 0; i < 10; i++) {
                    chartDataAvgTraffic[i] = new flotPieDataElement(objArray[i].Device,objArray[i].Traffic,colorpaletteAvgUsage[i]);
                    legendDataAvgTraffic[i] = new flotPieDataElement(objArray[i].Device,dataFormatter.formatUsageData(objArray[i].Traffic,3),colorpaletteAvgUsage[i]);
                }
                $scope.flotHandsetAvgTrafficData= chartDataAvgTraffic;
                $scope.legendDataAvgTraffic= legendDataAvgTraffic;
                topHangsetsAvgTrafficDiv(false, true, false);
            }else{
                topHangsetsAvgTrafficDiv(false, false, true);
            }
        }) 
    
    }

    
    topHandsetby_count_usage();
    topHandsetby_avg_usage();
}
// End Device Analytics Controller
//    ----------------------------------------------------------------------------



// Device Geo Distribution Controller
function deviceGeoDistributionCtrl($scope, $http,globalConfig,$filter,$timeout,$rootScope,dataFormatter,uiGmapGoogleMapApi, locationFilterService, $sce, filterService ) {
    
    var initLatCount= "28.6139" ;
    var initLongCount= "77.2090";
    var initLatUsage= "28.6139";
    var initLongUsage= "77.2090";
    var filterParameters = "";
    var heatLayerObjCount;
    var heatLayerObjUsage; 
    var heatmapCountURL, heatmapUsageURL;
    
    var snip= "<div class='sk-spinner sk-spinner-fading-circle'>"+
                "<div class='sk-circle1 sk-circle'></div>"+
                "<div class='sk-circle2 sk-circle'></div>"+
                "<div class='sk-circle3 sk-circle'></div>"+
                "<div class='sk-circle4 sk-circle'></div>"+
                "<div class='sk-circle5 sk-circle'></div>"+
                "<div class='sk-circle6 sk-circle'></div>"+
                "<div class='sk-circle7 sk-circle'></div>"+
                "<div class='sk-circle8 sk-circle'></div>"+
                "<div class='sk-circle9 sk-circle'></div>"+
                "<div class='sk-circle10 sk-circle'></div>"+
                "<div class='sk-circle11 sk-circle'></div>"+
                "<div class='sk-circle12 sk-circle'></div>"+
            "</div>";
    var load= "<span class='text-info'><b>Loading...</b></span>";
    $scope.loading= {};
    $scope.loading.snip= $sce.trustAsHtml(snip);
    $scope.loading.load= $sce.trustAsHtml(load);
    //--------------------------------------------------------------
    //Filter Section
    
    var selKeysLocation= [], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], queryParam; //"/^.India.Delhi/"
    
    function filterGetParams(){
        $scope.locationinfo= filterService.getLocationInfo(selKeysLocation);
        $scope.ratinfo= filterService.getRATInfo(selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo(selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo(selKeysDevice);
        return filterService.getParameter(selKeysLocation,selKeysRAT,selKeysSegment,selKeysDevice);
    }
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    $scope.location="All locations";
    
    $('.input-daterange').datepicker({
        
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-6-3",
        endDate: "0d"
    }) 
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    fromDate= "2016-09-18";  //toDate= "2016-08-10";
    //fromDate= fromDate.substring(0,8);
     //fromDate= fromDate+"01"
    $scope.date= {"start": fromDate, "end": toDate};
    
    
    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    var getParents= function(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
        //        if(parent=="_1")
        //            parent = "";
        return parent;
    }
    
    function getFilterData(selectedKey){
        var keyArrayParent= [];
        var keyArrayResult= [];
        var parentsParent= {};
        
        angular.forEach(selectedKey,function(node){
            var thisNode= node.data;
            var nodeKey= node.data.key;
            var thisParent = node.parent;
            var parentKey =thisParent.data.key;
            if(thisNode.isFolder){
                //First check if parent exists
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Parent key does not exist, so add this entry in parent & result
                    keyArrayParent.push(nodeKey);
                    var getParentRes = getParents(node);
                     if(getParentRes != '_1')
                         //keyArrayResult.push(parentKey+"."+nodeKey);
                         keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");

                    else
                        keyArrayResult.push("/^." + nodeKey + "/");

                }else{
                    //My parents is selected, means I am already selected, 
                    //so add self into parent list
                    keyArrayParent.push(nodeKey);
                }
            }else{
                //This is child case
                //Check if this child's parent exists in result
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Since parent does not exist, add this in result
                    //keyArrayResult.push(parentKey+"."+nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1'){
                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                   }
                    else{
                        keyArrayResult.push("/^." + nodeKey + "/");
                    }
                }
            }
        })
        console.log("keyArrayResult: ",keyArrayResult)
        return keyArrayResult;
    }

    /*
    *   Location Filter data
    */
    var locationData;
    //$http.get(globalConfig.pulldataurlbyname +'Location Lookup').then(function (response) {
        //locationData= response.data[0].children;
        
         var filterData= locationFilterService.locationFilterData();
         //console.log(filterData);
         locationData= filterData.children;
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: locationData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysLocation= getFilterData(selKeysLocation);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        })
    //})
        
    /*
    *   Device Filter data
    */
    var deviceData= [];
    $http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
        deviceData= response.data[0].children;
        //console.log("data: ", deviceData)
        $("#device").dynatree({
            checkbox: true,
            selectMode: 3,
            children: deviceData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysDevice= getFilterData(selKeysDevice);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        });
    })
    
    /*
    *   RAT Filter data
    */
    var ratData = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: ratData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            console.log("rat: ",selKeysRAT);
        //            selKeysRAT= getFilterData(selKeysRAT);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });

    /*
    *   Segment Filter data
    */
    var segmentData = filterService.getSegments();
    //var indx= -1,temp= [];
    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            })
            console.log("segment: ",selKeysSegment)
        //            selKeysSegment= getFilterData(selKeysSegment);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });
        
    $scope.location = function() {
        if ($scope.treeLocation)
            $scope.treeLocation = false;
        else{
            $scope.treeLocation = true;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }

    $scope.rat = function() {
        if ($scope.treeRAT)
            $scope.treeRAT = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = true;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }
    
    $scope.segment = function() {
        if ($scope.treeSegment)
            $scope.treeSegment = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = true;
            $scope.treeDevice = false;
        }
    }

    $scope.device = function() {
        if ($scope.treeDevice)
            $scope.treeDevice = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = true;
        }
    }
    
    $scope.mapCount = {
        center: {
            latitude: initLatCount,
            longitude: initLongCount
        },
        options:{
            scrollwheel: false,
            // Style for Google Maps
            styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},   {"saturation":40},{"lightness":10}]}],
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        zoom: 10,
        size:{
            height: '800px'
        } 
    };

    function mapCount(url){
        $scope.loadingCountMapCircleDiv= true;
        $scope.noDataCountMapCircleDiv= false;
        
        $http.get(url).then(function (response) {  
            var objArray = response.data;
             console.log("start time:",  new Date().toLocaleString());
            console.log("Datalen:",objArray.length);
            if(objArray.length>0){
                var value= objArray.length;
                if(objArray.length>100){
                    value= 100;
                }
                
                var mapcount= [];
                for (var i = 0; i < value; i++) {
                    
                    var colour;
                    if(objArray[i].Count >= 1000)
                    {
                        colour= '#FF0000'
                    }else if(objArray[i].Count < 1000 && objArray[i].Count >= 500)
                    {
                        colour= "#FFC107"    
                    }else if(objArray[i].Count < 500)
                    {
                        colour= "#08B21F"
                    }
                    
                    mapcount[i]= {
                        id: i,
                        center: {
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude
                        },
                        radius: 1000,
                        stroke: {
                            color: colour,
                            weight: 2,
                            opacity: 1
                        },
                        title: 'm' + i,
                        fill: {
                            color: colour,
                            opacity: 0.5
                        }
                    }
                }
                
                //initLatCount= objArray[0].latitude;
                //initLongCount= objArray[0].longitude;
                $scope.circlesCount= mapcount;
                
                $scope.loadingCountMapCircleDiv= false;
                $scope.noDataCountMapCircleDiv= false;
               console.log("end time:",  new Date().toLocaleString());
            }else{
                $scope.loadingCountMapCircleDiv= false;
                $scope.noDataCountMapCircleDiv= true;
            }
              
        }); 
       
    }
    
    $scope.mapUsage = {
        
        center: {
            latitude: initLatUsage,
            longitude: initLongUsage
        },
        options:{
            scrollwheel: false,
            // Style for Google Maps
            styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},   {"saturation":40},{"lightness":10}]}],
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        zoom: 10,
        size:{
            height: 800
        } 
    };
    
    function mapUsage(url){
        $scope.loadingUsageMapCircleDiv= true;
        $scope.noDataUsageMapCircleDiv= false;
        
        $http.get(url).then(function (response) {  
            var objArray = response.data;
             
            if(objArray.length>0){
                console.log("start time:",  new Date().toLocaleString());
                var value= objArray.length;
                if(objArray.length>100){
                    value= 100;
                }
                
                var mapcount= [];
                for (var i = 0; i < value; i++) {
                    
                    var colour;
                    if(objArray[i].Usage >= 1024*1024*500)
                    {
                        colour= '#FF0000'
                    }else if(objArray[i].Usage < 1024*1024*500 && objArray[i].Usage >= 1024*1024*100)
                    {
                        colour= "#FFC107"    
                    }else if(objArray[i].Usage < 1024*1024*100)
                    {
                        colour= "#08B21F"
                    }
                    
                    mapcount[i]= 
                        {
                        //height: '600px',
                        id: i,
                        center: {
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude
                        },
                        radius: 1000,
                        stroke: {
                            color: colour,
                            weight: 2,
                            opacity: 1
                        },
                        fill: {
                            color: colour,
                            opacity: 0.5
                        }
                    }
                }
                $scope.circlesUsage= mapcount;
                
                $scope.loadingUsageMapCircleDiv= false;
                $scope.noDataUsageMapCircleDiv= false;
            }else{
                $scope.loadingUsageMapCircleDiv= false;
                $scope.noDataUsageMapCircleDiv= true;
            }
            
              
        }); 
       
    }
    
    $scope.locationinfo= "All Locations";
    $scope.ratinfo= "All RATs";
    $scope.segmentinfo= "All Segments";
    $scope.deviceinfo= "All Devices";
    
    function defaultLoad(){
       
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= filterGetParams();
        
        var mapCountURL= globalConfig.pullfilterdataurlbyname+"Heat Map Handset wise Count"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
        var mapUsageURL= globalConfig.pullfilterdataurlbyname+"Heat map for Device Usage"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                 
        mapCount(mapCountURL);
        mapUsage(mapUsageURL);
    }
    
    defaultLoad();
    
    // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
    
    //Tab selected event
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
}
// End Device Geo Distribution Controller
//    ----------------------------------------------------------------------------

// Device Insights Controller
function deviceInsightsCtrl($scope, $http,globalConfig,$filter,$timeout,$rootScope,dataFormatter,uiGmapGoogleMapApi,  highchartOptions, locationFilterService, highchartProcessData, $modal, filterService, $sce) {
    var initLatCount= "28.6139" ;
    var initLongCount= "77.2090";    
    var initLatUsage= "28.6139";
    var initLongUsage= "77.2090";
    var filterParameters = "";
    var heatLayerObjCount;
    var heatLayerObjUsage; 
    var currentTab
    var currentPage= $scope.headerName
    if(currentPage== 'Device Penetration Heatmap')
       currentTab= "GeoDistribution";
    else
        currentTab= 'DevicePenetration';
    
    var snip= "<div class='sk-spinner sk-spinner-fading-circle'>"+
                "<div class='sk-circle1 sk-circle'></div>"+
                "<div class='sk-circle2 sk-circle'></div>"+
                "<div class='sk-circle3 sk-circle'></div>"+
                "<div class='sk-circle4 sk-circle'></div>"+
                "<div class='sk-circle5 sk-circle'></div>"+
                "<div class='sk-circle6 sk-circle'></div>"+
                "<div class='sk-circle7 sk-circle'></div>"+
                "<div class='sk-circle8 sk-circle'></div>"+
                "<div class='sk-circle9 sk-circle'></div>"+
                "<div class='sk-circle10 sk-circle'></div>"+
                "<div class='sk-circle11 sk-circle'></div>"+
                "<div class='sk-circle12 sk-circle'></div>"+
            "</div>";
    var load= "<span class='text-info'><b>Loading...</b></span>";
    
    $scope.loading= {};
    $scope.loading.snip= $sce.trustAsHtml(snip);
    $scope.loading.load= $sce.trustAsHtml(load);
    
    var heatmapCountURL, heatmapUsageURL, DevicePenetrationCountURL, DevicePenetrationCountTableURL, distributionMultilineURL, distributionBarFirstDayURL , distributionBarLastDayURL, deviceCapabilityURL;
    var xAxisData =[], usageData= [], penetrationData= [], penetrationVsUsageOptions=null ;
    
    //Penetration Table Options
    $scope.penetrationTableOptions= { 
        "order" :[[2,"desc"]]
    };
    //--------------------------------------------------------------
    //Filter Section
    
    var selKeysLocation= [], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], queryParam; 
    
    function filterGetParams(){
        $scope.locationinfo= filterService.getLocationInfo(selKeysLocation);
        $scope.ratinfo= filterService.getRATInfo(selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo(selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo(selKeysDevice);
        return filterService.getParameter(selKeysLocation,selKeysRAT,selKeysSegment,selKeysDevice);
    }
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    $('.input-daterange').datepicker({
        
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-6-3",
        endDate: "0d"
    }) 
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    //fromDate= fromDate.substring(0,8);
    //fromDate= fromDate+"01"
    //fromDate= "2016-09-09";  toDate= "2016-08-10";
    $scope.date= {"start": "2016-09-19", "end": toDate};
    
    
    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    var getParents= function(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
		//        if(parent=="_1")
		//            parent = "";
        return parent;
    }
    
    function getFilterData(selectedKey){
        var keyArrayParent= [];
        var keyArrayResult= [];
        var parentsParent= {};
        
        angular.forEach(selectedKey,function(node){
            var thisNode= node.data;
            var nodeKey= node.data.key;
            var thisParent = node.parent;
            var parentKey =thisParent.data.key;
            if(thisNode.isFolder){
                //First check if parent exists
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Parent key does not exist, so add this entry in parent & result
                    keyArrayParent.push(nodeKey);
                    var getParentRes = getParents(node);
                     if(getParentRes != '_1')
                         //keyArrayResult.push(parentKey+"."+nodeKey);
                         keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");

                    else
                        keyArrayResult.push("/^." + nodeKey + "/");

                }else{
                    //My parents is selected, means I am already selected, 
                    //so add self into parent list
                    keyArrayParent.push(nodeKey);
                }
            }else{
                //This is child case
                //Check if this child's parent exists in result
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Since parent does not exist, add this in result
                    //keyArrayResult.push(parentKey+"."+nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1')
                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                    else
                        keyArrayResult.push("/^." + nodeKey + "/");
                }
            }
        })
        console.log("keyArrayResult: ",keyArrayResult)
        return keyArrayResult;
    }

    /*
    *   Location Filter data
    */
    var locationData;
    //$http.get(globalConfig.pulldataurlbyname +'Location Lookup').then(function (response) {
        //locationData= response.data[0].children;
        
         var filterData= locationFilterService.locationFilterData();
         //console.log(filterData);
         locationData= filterData.children;
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: locationData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                
                // Get a list of all selected nodes, and convert to a key array:
                selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysLocation= getFilterData(selKeysLocation);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        })
    //})
        
    /*
    *   Device Filter data
    */
    var deviceData= [];
    $http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
        deviceData= response.data[0].children;
        //console.log("data: ", deviceData)
        $("#device").dynatree({
            checkbox: true,
            selectMode: 3,
            children: deviceData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysDevice= getFilterData(selKeysDevice);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        });
    })
    
    /*
    *   RAT Filter data
    */
    var ratData = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: ratData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            console.log("rat: ",selKeysRAT);
		//            selKeysRAT= getFilterData(selKeysRAT);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });

    /*
    *   Segment Filter data
    */
    var segmentData =filterService.getSegments();
    //var indx= -1,temp= [];
    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            })
            console.log("segment: ",selKeysSegment)
		//            selKeysSegment= getFilterData(selKeysSegment);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });
        
    $scope.location = function() {
        if ($scope.treeLocation)
            $scope.treeLocation = false;
        else{
            $scope.treeLocation = true;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }

    $scope.rat = function() {
        if ($scope.treeRAT)
            $scope.treeRAT = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = true;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }
    
    $scope.segment = function() {
        if ($scope.treeSegment)
            $scope.treeSegment = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = true;
            $scope.treeDevice = false;
        }
    }

    $scope.device = function() {
        if ($scope.treeDevice)
            $scope.treeDevice = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = true;
        }
    }

    //End of Filter Section
    //--------------------------------------------------------------
    
    function heatmapCount(url){
        $scope.loadingCountMapCircleDiv= true;
        $scope.noDataCountMapCircleDiv= false;
        console.log("url", url);
        //Geo Distribution Count
        var pointarray;
        var mapData= [];
        //heatLayerObj.setData(mapData);    //If want to reset the map           
        $http.get(url).then(function (response) {  
            var objArray = response.data;
            if(objArray.length>0){
                
                for (var i = 0; i < objArray.length; i++) {
                    mapData[i]=  {location: new google.maps.LatLng(objArray[i].latitude,    objArray[i].longitude), weight: objArray[i].Count}
                }
                console.log("count", mapData.length);
                var pointArray = new google.maps.MVCArray(mapData);
                heatLayerObjCount.setData(pointArray);
                /*heatLayerObjCount.set('gradient', heatLayerObjCount.get('gradient') ? null : [ 
                    'rgba(0, 255, 255, 0)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(0, 191, 255, 1)',
                    'rgba(0, 127, 255, 1)',
                    'rgba(0, 63, 255, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 0, 223, 1)',
                    'rgba(0, 0, 191, 1)',
                    'rgba(0, 0, 159, 1)',
                    'rgba(0, 0, 127, 1)',
                    'rgba(63, 0, 91, 1)',
                    'rgba(127, 0, 63, 1)',
                    'rgba(191, 0, 31, 1)',
                    'rgba(255, 0, 0, 1)']);
                */
                heatLayerObjCount.set('radius', heatLayerObjCount.get('radius') ? null : 20);
                initLatCount= objArray[0].latitude;
                initLongCount= objArray[0].longitude;
                
                $scope.loadingCountMapCircleDiv= false;
                $scope.noDataCountMapCircleDiv= false;
            }else{
                $scope.loadingCountMapCircleDiv= false;
                $scope.noDataCountMapCircleDiv= true;
            }
        }); 
       
        function LoadHeatLayerCount(heatLayerCount) {
            heatLayerObjCount= heatLayerCount;
        };
        
        $scope.mapCount = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},   {"saturation":40},{"lightness":10}]}],
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            zoom: 10,
            heatLayerCallbackCount: function (layerCount) {
                //set the heat layers backend data
                var loadHeatLayerCount = new LoadHeatLayerCount(layerCount);
            },
            showHeat: true,
            size:{
                height: 400
            } 
        };    
        console.log('$scope.mapCount.center', $scope.mapCount.center);
    }

    function heatmapUsage(url){
        $scope.loadingUsageMapCircleDiv= true;
        $scope.noDataUsageMapCircleDiv= false;
        
        console.log("url", url);
        var pointarray;
        //Geo Distribution Usage
        var mapData= [];
        //heatLayerObj.setData(mapData);    //If want to reset the map           
        $http.get(url).then(function (response) {  
            //console.log('rersponse', response);
            var objArray = response.data;
            console.log('usage', objArray.length);
            if(objArray.length>0){
                for (var i = 0; i < objArray.length; i++) {
                    mapData[i]= {location: new google.maps.LatLng(objArray[i].latitude, objArray[i].longitude), weight: objArray[i].Usage};
                }
                pointarray = new google.maps.MVCArray(mapData);
                heatLayerObjUsage.setData(pointarray);
                
                /*heatLayerObjUsage.set('gradient', heatLayerObjUsage.get('gradient') ? null : [ 
                    'rgba(0, 255, 255, 0)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(0, 191, 255, 1)',
                    'rgba(0, 127, 255, 1)',
                    'rgba(0, 63, 255, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 0, 223, 1)',
                    'rgba(0, 0, 191, 1)',
                    'rgba(0, 0, 159, 1)',
                    'rgba(0, 0, 127, 1)',
                    'rgba(63, 0, 91, 1)',
                    'rgba(127, 0, 63, 1)',
                    'rgba(191, 0, 31, 1)',
                    'rgba(255, 0, 0, 1)']);
                */
                heatLayerObjUsage.set('radius', heatLayerObjUsage.get('radius') ? null : 20);
                initLatUsage= objArray[0].latitude;
                initLongUsage= objArray[0].longitude;
                
                $scope.loadingUsageMapCircleDiv= false;
                $scope.noDataUsageMapCircleDiv= false;
            }else{
                $scope.loadingUsageMapCircleDiv= false;
                $scope.noDataUsageMapCircleDiv= true;
            }
            //$scope.DeviceCount= objArray.length + ' devices';
        });        
   
    
        function LoadHeatLayerUsage(heatLayerUsage) {
            heatLayerObjUsage= heatLayerUsage;
        };

        $scope.mapUsage = {
            center: {
                latitude: initLatUsage, 
                longitude: initLongUsage
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},   {"saturation":40},{"lightness":10}]}],
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            zoom: 10,
            legend: {
                'font-family': ['Arial', 'sans-serif'],
                background: '#fff',
                padding: '10px',
                margin: '10px',
                border: '3px',
                solid: '#000'
              },
            heatLayerCallbackUsage: function (layerUsage) {
                //set the heat layers backend data
                var loadHeatLayerUsage = new LoadHeatLayerUsage(layerUsage);
            },
            showHeat: true,
            size:{
                height: 400
            } 
        };

    }
    
    function DevicePenetrationCount(url){
        
        $scope.loadingPenetrationDiv= true;
        $scope.noDataPenetrationDiv= false;
        $scope.dataPenetrationDiv= false; 
        
        $http.get(url).then(function (response) {  
            var objArray = response.data;
            
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "RecordDate";
                paramObject.data= "countDevice";
                paramObject.seriesName= "Device";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                //paramObject.unit= "MB";
                
                var DeviceCountMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                DeviceCountMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                
                paramObject.flag= "series";
                $scope.DeviceCountMultiLineChartConfig= {
                    options: DeviceCountMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                $scope.loadingPenetrationDiv= false;
                $scope.noDataPenetrationDiv= false;
                $scope.dataPenetrationDiv= true;  
            }
            else{
                $scope.loadingPenetrationDiv= false;
                $scope.noDataPenetrationDiv= true;
                $scope.dataPenetrationDiv= false; 
            }
        }); 
    }
    
    function penetrationTableDataElement (a,b,c,d,e,f,g) {
        this.device = a;
        this.model = b;
        this.penetration = c;
        this.traffic = d;
        this.maxtraffic = e;
        this.avgtraffic = f;
        this.fontsize = g;
    }
        
    var dataArray= [];
    dataArray[0]= new penetrationTableDataElement('- No record-','','','','','');
    $scope.dataset = dataArray;

    function DevicePenetrationCountTable(url){
       
        //console.log(url);
        $http.get(url).then(function (response) {  
            //console.log(response.data)
            var objArray = response.data;
            var fontsize = 22;
            
            
            for (var i = 0; i < objArray.length; i++) {
                fontsize= fontsize - 1;
                if(fontsize < 10) fontsize= 10;
                dataArray[i] = new penetrationTableDataElement(
                    objArray[i].Device,
                    objArray[i].Model,
                    dataFormatter.formatDecimalPlaces(objArray[i].Distribution,3),
                    dataFormatter.formatDecimalPlaces(objArray[i].Traffic,3),
                    dataFormatter.fixFormatter(objArray[i].HighestTraffic,1024,2),
                    dataFormatter.fixFormatter(objArray[i].AVGTraffic,1024,2),
                    fontsize
                );
                
            }
            
            for (var i = 0; i < 20; i++) {
                
                xAxisData[i]= objArray[i].Device + " (" + objArray[i].Model + ")";
                usageData[i]= dataFormatter.formatDecimalPlaces(objArray[i].Distribution,3)*100,
                penetrationData[i]= dataFormatter.formatDecimalPlaces(objArray[i].Traffic,3)*100
            }
            $scope.dataset = dataArray;
            
            penetrationVsUsageOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
            
            penetrationVsUsageOptions.xAxis.categories= xAxisData;
            penetrationVsUsageOptions.yAxis.labels= {enabled: false};
            penetrationVsUsageOptions.tooltip.pointFormatter= function(){
                return this.series.name+": "+ (this.y/100).toFixed(2)+"%  "
            };
             
        });
       
    }
    
    function distributionMultiline(url){
        
        $scope.loadingDistributionMultiineDiv= true;
        $scope.DataDistributionMultiineDiv= false;
        $scope.noDataDistributionMultiineDiv= false;  
        $scope.showBar= false;
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            //console.log("multiline", objArray);
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= "Device";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                
                var DeviceCountMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                DeviceCountMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                DeviceCountMultiLineOptions.chart.height= 400;
                
                // stacked bar first and last day
                var firstDay= $filter('date')( DeviceCountMultiLineOptions.xAxis.categories[0] , "yyyy-MM-dd");
                var lastDay= $filter('date')( DeviceCountMultiLineOptions.xAxis.categories[DeviceCountMultiLineOptions.xAxis.categories.length-1], "yyyy-MM-dd");
                
                distributionBarFirstDayURL= globalConfig.pullfilterdataurlbyname+"Device wise stacked usage count distribution"+"&fromDate="+firstDay+"T00:00:00.000Z"+filterParameters;
                
                distributionBarLastDayURL= globalConfig.pullfilterdataurlbyname+"Device wise stacked usage count distribution"+"&fromDate="+lastDay+"T00:00:00.000Z"+filterParameters;
                distributionBar(distributionBarFirstDayURL, distributionBarLastDayURL);
                // end stacked bar first and last day
                
                
                paramObject.flag= "series";
                $scope.CountDistributionMultiineChartConfig= {
                    options: DeviceCountMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                
                paramObject.flag= "xAxis";
                paramObject.data= "Usage";
                paramObject.unit= "MB";
                var DeviceUsageMultiLineOptions=   angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                DeviceUsageMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                DeviceUsageMultiLineOptions.yAxis.title.text="Usage( MB )"; 
                DeviceUsageMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.UsageDistributionMultiineChartConfig= {
                    options: DeviceUsageMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                $scope.loadingDistributionMultiineDiv= false;
                $scope.DataDistributionMultiineDiv= true;
                $scope.noDataDistributionMultiineDiv= false;
                $scope.showBar= true;
            }
            else{
                $scope.loadingDistributionMultiineDiv= false;
                $scope.DataDistributionMultiineDiv= false;
                $scope.noDataDistributionMultiineDiv= true;
            }
        })
    }

    function distributionBar(firstDayURL, lastDayURL){
        
        $scope.loadingDistributionBarDiv= true;
        $scope.DataDistributionBarDiv= false;
        $scope.noDataDistributionBarDiv= false;
        
        $http.get(firstDayURL).then(function(response){
            var firstDayObjArray= response.data;
            console.log("firstlength", firstDayObjArray[0].data.length);
             $http.get(lastDayURL).then(function(response){
                 var lastDayObjArray= response.data;
                 //console.log("lastlength", lastDayObjArray[0].data);
                 var deviceArray= [], dateArray= [], barDataCount= [], barDataUsage= [];
                 
                 var firstDayDeviceArray= [], lastDayDeviceArray= [];
                 
                 if(firstDayObjArray.length && lastDayObjArray.length>0){
                     
                     dateArray[0]= firstDayObjArray[0].Date;
                     dateArray[1]= lastDayObjArray[0].Date;
                     
                     for(var i in firstDayObjArray[0].data){
                         deviceArray[i]= firstDayObjArray[0].data[i].Device;
                         firstDayDeviceArray[i]= firstDayObjArray[0].data[i].Device;
                     }
                     
                     for(var i in lastDayObjArray[0].data){
                         lastDayDeviceArray[i]= lastDayObjArray[0].data[i].Device;
                     }
                     
                     
                     for(var i in lastDayObjArray[0].data){
                         
                         var deviceName= lastDayObjArray[0].data[i].Device;
                         var index= $.inArray(deviceName, deviceArray);
                         if(index == -1)
                             deviceArray.push(deviceName);
                     }
                     
                     for(var i in deviceArray){
                         if(deviceArray[i]==angular.isDefined(firstDayObjArray[0].data[i]) && deviceArray[i]==angular.isDefined(lastDayObjArray[0].data[i])){
                             
                             barDataCount[i]=  {
                                 name: deviceArray[i],
                                 data: [firstDayObjArray[0].data[i].Count, lastDayObjArray[0].data[i].Count ]
                             }
                             
                             barDataUsage[i]=  {
                                 name: deviceArray[i],
                                 data: [firstDayObjArray[0].data[i].Usage, lastDayObjArray[0].data[i].Usage ]
                             }
                             
                             
                         }
                         else{
                             var deviceName= deviceArray[i];
                             var firstDayCount,lastDayCount;
                             var firstDayUsage,lastDayUsage;
                             
                             var indexFirstDay= $.inArray(deviceName, firstDayDeviceArray);
                             if(indexFirstDay != -1){
                                 firstDayCount= firstDayObjArray[0].data[indexFirstDay].Count
                                 firstDayUsage= firstDayObjArray[0].data[indexFirstDay].Usage
                             }else{ 
                                 firstDayCount= 0;
                                 firstDayUsage= 0;
                             }
                             
                             var indexLastDay= $.inArray(deviceName, lastDayDeviceArray);
                             if(indexLastDay != -1){
                                 lastDayCount= lastDayObjArray[0].data[indexLastDay].Count
                                 lastDayUsage= lastDayObjArray[0].data[indexLastDay].Usage
                             }else{ 
                                 lastDayCount= 0;
                                 lastDayUsage= 0;
                             }
                             
                             barDataCount[i]=  {
                                 name: deviceArray[i],
                                 data: [firstDayCount, lastDayCount ]
                             }
                             
                             barDataUsage[i]=  {
                                 name: deviceArray[i],
                                 data: [firstDayUsage, lastDayUsage ]
                             }
                         }
                     }
                     
                     
                     var countStackedBarOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                     countStackedBarOptions.xAxis.categories= dateArray;
                     countStackedBarOptions.chart.height= 400;
                     countStackedBarOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>';
                     countStackedBarOptions.plotOptions.column.dataLabels.formatter= function() {
                         return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                     };
                     countStackedBarOptions.plotOptions.column.point.events.click= function () {
                         console.log('series: ' +this.series.name+ ', value: ' + this.y);
                         distributionStackedBarClickEvent(this.series.name, $scope.date.start, $scope.date.end, "Count");
                     };
                 
                     $scope.CountDistributionBarChartConfig= {
                         options: countStackedBarOptions,
                         series:barDataCount
                     }
                     
                     var usageStackedBarOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                     usageStackedBarOptions.xAxis.categories= dateArray;
                     usageStackedBarOptions.chart.height= 400;
                     usageStackedBarOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: {point.percentage:.0f}%<br/>';
                     usageStackedBarOptions.plotOptions.column.dataLabels.formatter= function() {
                         return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                     };
                     usageStackedBarOptions.plotOptions.column.point.events.click= function () {
                         console.log('series: ' +this.series.name+ ', value: ' + this.y);
                         distributionStackedBarClickEvent(this.series.name, $scope.date.start, $scope.date.end, "Usage");
                     };
                     
                     
                     $scope.UsageDistributionBarChartConfig= {
                         options: usageStackedBarOptions,
                         series: barDataUsage
                     }
                     
                     $scope.loadingDistributionBarDiv= false;
                     $scope.DataDistributionBarDiv= true;
                     $scope.noDataDistributionBarDiv= false;
                 }
                 else{
                     $scope.loadingDistributionBarDiv= false;
                     $scope.DataDistributionBarDiv= false;
                     $scope.noDataDistributionBarDiv= true;
                 }
             })
        })
    }
    
    function deviceCapabilityMultiBar(url){
        
        $scope.loadingdeviceCapabilityStackedBarDiv= true;
        $scope.DatadeviceCapabilityStackedBarDiv= false;
        $scope.noDatadeviceCapabilityStackedBarDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "PlanType";
                paramObject.data= "Count";
                paramObject.seriesName= "DeviceCapabiity";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                var AppsMultiLineOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                console.log("inside");
                var xAxisData= highchartProcessData.barColumnProcessHighchartData(paramObject);
                for(var i in xAxisData){
                    xAxisData[i]= xAxisData[i]+' Plan';
                }
                AppsMultiLineOptions.xAxis.categories= xAxisData;
                console.log("outsides", AppsMultiLineOptions);
                AppsMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                var dataStackedBar= highchartProcessData.barColumnProcessHighchartData(paramObject);
                for(var i in dataStackedBar){
                    dataStackedBar[i].name= dataStackedBar[i].name+" Capable";
                }
                $scope.deviceCapabilityStackedBarChartConfig= {
                    options: AppsMultiLineOptions,
                    series: dataStackedBar
                }
                
                $scope.loadingdeviceCapabilityStackedBarDiv= false;
                $scope.DatadeviceCapabilityStackedBarDiv= true;
                $scope.noDatadeviceCapabilityStackedBarDiv= false;
          
            }
            else{
                 $scope.loadingdeviceCapabilityStackedBarDiv= false;
                $scope.DatadeviceCapabilityStackedBarDiv= false;
                $scope.noDatadeviceCapabilityStackedBarDiv= true;
            }
        })
    }


    function defaultLoad(){
       
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= filterGetParams();

        switch(currentTab){
            case 'GeoDistribution':
               
                heatmapCountURL= globalConfig.pullfilterdataurlbyname+"Heat Map Handset wise Count"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                heatmapUsageURL= globalConfig.pullfilterdataurlbyname+"Heat map for Device Usage"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                 
                heatmapCount(heatmapCountURL);
                heatmapUsage(heatmapUsageURL);
                break;
            
            case 'DevicePenetration':
                DevicePenetrationCountURL= globalConfig.pullfilterdataurlbyname+"Day wise device count for multiline view"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                DevicePenetrationCountTableURL= globalConfig.pullfilterdataurlbyname+"Handset wise Distribution with max and avg traffic"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                DevicePenetrationCount(DevicePenetrationCountURL );
                DevicePenetrationCountTable(DevicePenetrationCountTableURL );
                break;
            
            case 'Distribution':
                
                distributionMultilineURL= globalConfig.pullfilterdataurlbyname+"Device wise Usage Count Distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                distributionMultiline(distributionMultilineURL);
                break;
                
            case 'deviceCapability':
                
                deviceCapabilityURL= globalConfig.pullfilterdataurlbyname+"Device Capability count for Plan Type"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                
                
                deviceCapabilityMultiBar(deviceCapabilityURL);
                
                break;
            
        }
    }
    
    defaultLoad();
    
    //PenetrationVsUsageSelected
    $scope.PenetrationVsUsageSelected= function(){
       $scope.PenetrationVsUsageChartConfig={
           options: penetrationVsUsageOptions,
           series:[
               {name: 'Usage',
                data: usageData
               },
               {name: 'Penetration',
                data: penetrationData
               }
           ]
       }   
    }
    
    //Tab selected event
    
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
    
    // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
    
    // Distribution Stacked bar click event
    
     function distributionStackedBarClickEvent(deviceName, fromDate, toDate, usageCount ){
        // model window
        var modalInstance = $modal.open({
            templateUrl: 'views/static/modelDevceInsightDistributionBarClick.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope, $modalInstance, $timeout) {
            $scope.loadingSegmentWiseMultiineDiv= true;
            $scope.DataSegmentWiseMultiineDiv= false;
            $scope.noDataSegmentWiseMultiineDiv= false;
            
            $scope.usagecount= usageCount;
            $scope.Device= deviceName;
            
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            /*
            * Segment wise Device Usage
            */
            
            var url= globalConfig.pullfilterdataurlbyname+"Segment wise Device usage count"+"&fromDate="+fromDate+"T00:00:00.000Z"+"&toDate="+toDate+"T23:59:59.999Z&Device="+deviceName;
            $http.get(url).then(function (response) { 
                var objArray = response.data;
                console.log("objArray", objArray);
                if(angular.isDefined(objArray)){
                    
                    if(usageCount=="Count"){
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Date";
                        paramObject.data= "Count";
                        paramObject.seriesName= "Segment";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
                        
                        var DeviceSegmentCountMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                        DeviceSegmentCountMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                        DeviceSegmentCountMultiLineOptions.chart.height= 400;

                        paramObject.flag= "series";
                        $scope.segmentWiseDeviceChartConfig= {
                            options: DeviceSegmentCountMultiLineOptions,
                            series: highchartProcessData.multilineProcessHighchartData(paramObject)
                        }
                    }
                    
                    if(usageCount=="Usage"){
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Date";
                        paramObject.data= "Usage";
                        paramObject.seriesName= "Segment";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
                        paramObject.unit= "MB";
                        
                        
                        var DeviceSegmentUsageMultiLineOptions=   angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                        DeviceSegmentUsageMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                        DeviceSegmentUsageMultiLineOptions.yAxis.title.text="Usage( MB )"; 
                        DeviceSegmentUsageMultiLineOptions.chart.height= 400;

                        paramObject.flag= "series";
                        $scope.segmentWiseDeviceChartConfig= {
                            options: DeviceSegmentUsageMultiLineOptions,
                            series: highchartProcessData.multilineProcessHighchartData(paramObject)
                        }
                    }
                    $scope.loadingSegmentWiseMultiineDiv= false;
                    $scope.DataSegmentWiseMultiineDiv= true;
                    $scope.noDataSegmentWiseMultiineDiv= false;
                }
                else{
                    $scope.loadingSegmentWiseMultiineDiv= false;
                    $scope.DataSegmentWiseMultiineDiv= false;
                    $scope.noDataSegmentWiseMultiineDiv= true;
                }
            });
        }
    }  
    
}
// End Device Insight Controller
//    ----------------------------------------------------------------------------


// App Trend Analytics Controller
function appAnalyticsCtrl($scope, $http,globalConfig,$filter,$timeout,$rootScope,dataFormatter,uiGmapGoogleMapApi,  highchartOptions, locationFilterService, highchartProcessData, $modal, filterService) {
    
    var filterParameters = "";
    var currentTab= "Usage";
    var usageAppsMultilineURL, UsageAppsStackFirstDayURL, UsageAppsStackLastDayURL, visitsAppsMultilineURL , VisitsAppsStackFirstDayURL, VisitsAppsStackLastDayURL, durationAppsMultilineURL, DurationAppsStackFirstDayURL, DurationAppsStackLastDayURL;
    
    //--------------------------------------------------------------
    //Filter Section
    
    var selKeysLocation= [], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], queryParam; 
    
    function filterGetParams(){
        
       /* var locationFilterData= null, ratFilterData= null, segmentFilterData= null, deviceFilterData= null;
        locationFilterData= filterService.getLocations();
        ratFilterData= filterService.getRATs();
        segmentFilterData= filterService.getSegments();
        deviceFilterData= $scope.getDeviceData();*/
        
        //console.log("locationFilterData,ratFilterData,segmentFilterData,deviceFilterData", locationFilterData,ratFilterData,segmentFilterData,$scope.getDeviceData());
        $scope.locationinfo= filterService.getLocationInfo(selKeysLocation);
        $scope.ratinfo= filterService.getRATInfo(selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo(selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo(selKeysDevice);
        
        return filterService.getParameter(selKeysLocation,selKeysRAT,selKeysSegment,selKeysDevice);
    }
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    $('.input-daterange').datepicker({
        
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-6-3",
        endDate: "0d"
    }) 
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    //fromDate= fromDate.substring(0,8);
    //fromDate= fromDate+"01"
    fromDate= "2016-09-18";  //toDate= "2016-09-11";
    $scope.date= {"start": fromDate, "end": toDate};
    
    
    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    var getParents= function(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
		//        if(parent=="_1")
		//            parent = "";
        return parent;
    }
    
    function getFilterData(selectedKey){
        var keyArrayParent= [];
        var keyArrayResult= [];
        var parentsParent= {};
        
        angular.forEach(selectedKey,function(node){
            var thisNode= node.data;
            var nodeKey= node.data.key;
            var thisParent = node.parent;
            var parentKey =thisParent.data.key;
            if(thisNode.isFolder){
                //First check if parent exists
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Parent key does not exist, so add this entry in parent & result
                    keyArrayParent.push(nodeKey);
                    var getParentRes = getParents(node);
                     if(getParentRes != '_1')
                         //keyArrayResult.push(parentKey+"."+nodeKey);
                         keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");

                    else
                        keyArrayResult.push("/^." + nodeKey + "/");

                }else{
                    //My parents is selected, means I am already selected, 
                    //so add self into parent list
                    keyArrayParent.push(nodeKey);
                }
            }else{
                //This is child case
                //Check if this child's parent exists in result
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Since parent does not exist, add this in result
                    //keyArrayResult.push(parentKey+"."+nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1')
                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                    else
                        keyArrayResult.push("/^." + nodeKey + "/");
                }
            }
        })
        console.log("keyArrayResult: ",keyArrayResult)
        return keyArrayResult;
    }

    /*
    *   Location Filter data
    */
    var locationData;
    //$http.get(globalConfig.pulldataurlbyname +'Location Lookup').then(function (response) {
        //locationData= response.data[0].children;
        
         var filterData= locationFilterService.locationFilterData();
         //console.log(filterData);
         locationData= filterData.children;
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: locationData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                
                // Get a list of all selected nodes, and convert to a key array:
                selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysLocation= getFilterData(selKeysLocation);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        })
    //})
        
    /*
    *   Device Filter data
    */
    var deviceData= [];
     $http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
        deviceData= response.data[0].children;
        //console.log("data: ", deviceData)
        $("#device").dynatree({
            checkbox: true,
            selectMode: 3,
            children: deviceData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysDevice= getFilterData(selKeysDevice);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        });
    })
    
    /*
    *   RAT Filter data
    */
    var ratData = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: ratData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            console.log("rat: ",selKeysRAT);
		//            selKeysRAT= getFilterData(selKeysRAT);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });

    /*
    *   Segment Filter data
    */
    var segmentData = filterService.getSegments();
    //var indx= -1,temp= [];
    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            })
            console.log("segment: ",selKeysSegment)
		//            selKeysSegment= getFilterData(selKeysSegment);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });
        
    $scope.location = function() {
        if ($scope.treeLocation)
            $scope.treeLocation = false;
        else{
            $scope.treeLocation = true;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }

    $scope.rat = function() {
        if ($scope.treeRAT)
            $scope.treeRAT = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = true;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }
    
    $scope.segment = function() {
        if ($scope.treeSegment)
            $scope.treeSegment = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = true;
            $scope.treeDevice = false;
        }
    }

    $scope.device = function() {
        if ($scope.treeDevice)
            $scope.treeDevice = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = true;
        }
    }

    function AppsMultiline(url, tab){
        
        $scope.loadingAppsMultiineDiv= true;
        $scope.DataAppsMultiineDiv= false;
        $scope.noDataAppsMultiineDiv= false;  
        $scope.showBar= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            //console.log("multiline", objArray);
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= tab;
                paramObject.seriesName= "App";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                paramObject.unit= "MB";
                
                var AppsMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                AppsMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                switch(tab){
                    case "Usage":
                        AppsMultiLineOptions.yAxis.title.text="Usage( MB )";
                        break;
                    case "Visits":
                        AppsMultiLineOptions.yAxis.title.text="Count";
                        break;
                    case "Duration":
                        AppsMultiLineOptions.yAxis.title.text="Duration( m )";
                        break;
                }
                AppsMultiLineOptions.chart.height= 400;
                
                // stacked bar first and last day
                var firstDay= $filter('date')( AppsMultiLineOptions.xAxis.categories[0] , "yyyy-MM-dd");
                var lastDay= $filter('date')( AppsMultiLineOptions.xAxis.categories[AppsMultiLineOptions.xAxis.categories.length-1], "yyyy-MM-dd");
                var firstDayURL, lastDayURL;
                
                firstDayURL= globalConfig.pullfilterdataurlbyname+"Top apps "+tab+ " Stacked"+"&fromDate="+firstDay+"T00:00:00.000Z"+filterParameters;
                
                lastDayURL= globalConfig.pullfilterdataurlbyname+"Top apps "+tab+ " Stacked"+"&fromDate="+lastDay+"T00:00:00.000Z"+filterParameters;
                AppsStackedBar(firstDayURL, lastDayURL, tab);
                // end stacked bar first and last day
                
                paramObject.flag= "series";
                $scope.AppsMultiineChartConfig= {
                    options: AppsMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                
                $scope.loadingAppsMultiineDiv= false;
                $scope.DataAppsMultiineDiv= true;
                $scope.noDataAppsMultiineDiv= false;  
                $scope.showBar= true;  
            }
            else{
                $scope.loadingAppsMultiineDiv= false;
                $scope.DataAppsMultiineDiv= false;
                $scope.noDataAppsMultiineDiv= true;  
            }
        })
    }

    function AppsStackedBar(firstDayURL, lastDayURL, tab){
        
        $scope.loadingAppsBarDiv= true;
        $scope.DataAppsBarDiv= false;
        $scope.noDataAppsBarDiv= false;
        
        $http.get(firstDayURL).then(function(response){
            var firstDayObjArray= response.data;
            //console.log("firstlength", firstDayObjArray[0].data.length);
             $http.get(lastDayURL).then(function(response){
                 var lastDayObjArray= response.data;
                 //console.log("lastlength", lastDayObjArray[0].data);
                 var deviceArray= [], dateArray= [], barDataUsage= [];
                 
                 var firstDayDeviceArray= [], lastDayDeviceArray= [];
                 
                 if(firstDayObjArray.length && lastDayObjArray.length>0){
                     
                     dateArray[0]= firstDayObjArray[0].Date;
                     dateArray[1]= lastDayObjArray[0].Date;
                     
                     for(var i in firstDayObjArray[0].data){
                         deviceArray[i]= firstDayObjArray[0].data[i].App;
                         firstDayDeviceArray[i]= firstDayObjArray[0].data[i].App;
                     }
                     
                     for(var i in lastDayObjArray[0].data){
                         lastDayDeviceArray[i]= lastDayObjArray[0].data[i].App;
                     }
                     
                     
                     for(var i in lastDayObjArray[0].data){
                         
                         var deviceName= lastDayObjArray[0].data[i].App;
                         var index= $.inArray(deviceName, deviceArray);
                         if(index == -1)
                             deviceArray.push(deviceName);
                     }
                     //console.log("deviceArray", deviceArray)
                     for(var j= 0; j< deviceArray.length ; j++){
                         
                         if(deviceArray[j]==angular.isDefined(firstDayObjArray[0].data[j]) && deviceArray[j]==angular.isDefined(lastDayObjArray[0].data[j])){
                             
                             barDataUsage[j]=  {
                                 name: deviceArray[j],
                                 data: [firstDayObjArray[0].data[j][tab], lastDayObjArray[0].data[j][tab] ]
                             }
                             
                         }
                         else{
                             var deviceName= deviceArray[j];
                             var firstDayUsage,lastDayUsage;
                             
                             var indexFirstDay= $.inArray(deviceName, firstDayDeviceArray);
                             if(indexFirstDay != -1){
                                 //console.log("indexFirstDay", indexFirstDay);
                                 firstDayUsage= firstDayObjArray[0].data[indexFirstDay][tab]
                             }else{ 
                                 firstDayUsage= 0;
                             }
                             
                             var indexLastDay= $.inArray(deviceName, lastDayDeviceArray);
                             if(indexLastDay != -1){
                                 //console.log("indexLastDay", indexLastDay);
                                 lastDayUsage= lastDayObjArray[0].data[indexLastDay][tab]
                             }else{ 
                                 lastDayUsage= 0;
                             }
                             
                             barDataUsage[j]=  {
                                 name: deviceArray[j],
                                 data: [firstDayUsage, lastDayUsage ]
                             }
                         }
                     }
                     
                     var AppsBarChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                     AppsBarChartOptions.xAxis.categories= dateArray;
                     AppsBarChartOptions.chart.height= 400;
                     AppsBarChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: {point.percentage:.0f}%<br/>';
                     AppsBarChartOptions.plotOptions.column.dataLabels.formatter= function() {
                         return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                     };
                    
                     $scope.AppsBarChartConfig= {
                         options: AppsBarChartOptions,
                         series: angular.copy(barDataUsage)
                     }
                     
                     $scope.loadingAppsBarDiv= false;
                     $scope.DataAppsBarDiv= true;
                     $scope.noDataAppsBarDiv= false;
        
                 }
                 else{
                     $scope.loadingAppsBarDiv= false;
                     $scope.DataAppsBarDiv= false;
                     $scope.noDataAppsBarDiv= true;
        
                 }
             })
        })
    }

    function defaultLoad(){
       
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= filterGetParams();
        console.log("filterParameters", filterParameters);
        switch(currentTab){
                
            case 'Usage':
               
                usageAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Usage Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                //usageAppsStackFirstDayURL= globalConfig.pullfilterdataurlbyname+"Top apps Usage Stacked"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+filterParameters;
                
                //usageAppsStackLastDayURL= globalConfig.pullfilterdataurlbyname+"Top apps Usage Stacked"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                 
                AppsMultiline(usageAppsMultilineURL, currentTab);
                //AppsStackedBar(usageAppsStackFirstDayURL, usageAppsStackLastDayURL, currentTab);
                break;
            
            case 'Visits':
                visitsAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Visits Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                //visitsAppsStackFirstDayURL= globalConfig.pullfilterdataurlbyname+"Top apps Visits Stacked"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+filterParameters;
                
                //visitsAppsStackLastDayURL= globalConfig.pullfilterdataurlbyname+"Top apps Visits Stacked"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                
                AppsMultiline(visitsAppsMultilineURL, currentTab);
                //AppsStackedBar(visitsAppsStackFirstDayURL, visitsAppsStackLastDayURL, currentTab);
                break;
            
            case 'Duration':
                
                durationAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Duration Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                //durationAppsStackFirstDayURL= globalConfig.pullfilterdataurlbyname+"Top apps Duration Stacked"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+filterParameters;
                
                //durationAppsStackLastDayURL= globalConfig.pullfilterdataurlbyname+"Top apps Duration Stacked"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                
                AppsMultiline(durationAppsMultilineURL, currentTab);
                //AppsStackedBar(durationAppsStackFirstDayURL, durationAppsStackLastDayURL, currentTab);
                break;
            
        }
    }
    
    defaultLoad();
    
    //Tab selected event
    
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
    
    // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
    
    
}
// End App Trend Analytics Controller
//    ----------------------------------------------------------------------------


// Browsing Analytics Controller
function browsingAnalyticsCtrl($scope, $http,globalConfig,$filter,$timeout,$rootScope,dataFormatter,uiGmapGoogleMapApi,  highchartOptions, locationFilterService, highchartProcessData, $modal, filterService) {
    
    var filterParameters = "";
    var currentTab= "appSegment";
    var handsetStackedBarURL, appSegmentBarURL, multiIMEISegmentCountURL, listTetheringURL;
    
    //--------------------------------------------------------------
    //Filter Section
    
    var selKeysLocation= [], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], queryParam; 
    
    function filterGetParams(){
        $scope.locationinfo= filterService.getLocationInfo(selKeysLocation);
        $scope.ratinfo= filterService.getRATInfo(selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo(selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo(selKeysDevice);
        return filterService.getParameter(selKeysLocation,selKeysRAT,selKeysSegment,selKeysDevice);
    }
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    $('.input-daterange').datepicker({
        
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-6-3",
        endDate: "0d"
    }) 
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    //fromDate= fromDate.substring(0,8);
    //fromDate= fromDate+"01"
    
    fromDate= "2016-09-18";  //toDate= "2016-08-10";
    $scope.date= {"start": fromDate, "end": toDate};
    
    
    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    var getParents= function(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
		//        if(parent=="_1")
		//            parent = "";
        return parent;
    }
    
    function getFilterData(selectedKey){
        var keyArrayParent= [];
        var keyArrayResult= [];
        var parentsParent= {};
        
        angular.forEach(selectedKey,function(node){
            var thisNode= node.data;
            var nodeKey= node.data.key;
            var thisParent = node.parent;
            var parentKey =thisParent.data.key;
            if(thisNode.isFolder){
                //First check if parent exists
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Parent key does not exist, so add this entry in parent & result
                    keyArrayParent.push(nodeKey);
                    var getParentRes = getParents(node);
                     if(getParentRes != '_1')
                         //keyArrayResult.push(parentKey+"."+nodeKey);
                         keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");

                    else
                        keyArrayResult.push("/^." + nodeKey + "/");

                }else{
                    //My parents is selected, means I am already selected, 
                    //so add self into parent list
                    keyArrayParent.push(nodeKey);
                }
            }else{
                //This is child case
                //Check if this child's parent exists in result
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Since parent does not exist, add this in result
                    //keyArrayResult.push(parentKey+"."+nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1')
                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                    else
                        keyArrayResult.push("/^." + nodeKey + "/");
                }
            }
        })
        console.log("keyArrayResult: ",keyArrayResult)
        return keyArrayResult;
    }

    /*
    *   Location Filter data
    */
    var locationData;
    //$http.get(globalConfig.pulldataurlbyname +'Location Lookup').then(function (response) {
        //locationData= response.data[0].children;
        
         var filterData= locationFilterService.locationFilterData();
         //console.log(filterData);
         locationData= filterData.children;
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: locationData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                
                // Get a list of all selected nodes, and convert to a key array:
                selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysLocation= getFilterData(selKeysLocation);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        })
    //})
        
    /*
    *   Device Filter data
    */
    var deviceData= [];
    $http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
        deviceData= response.data[0].children;
        //console.log("data: ", deviceData)
        $("#device").dynatree({
            checkbox: true,
            selectMode: 3,
            children: deviceData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysDevice= getFilterData(selKeysDevice);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        });
    })
    
    /*
    *   RAT Filter data
    */
    var ratData = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: ratData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            console.log("rat: ",selKeysRAT);
		//            selKeysRAT= getFilterData(selKeysRAT);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });

    /*
    *   Segment Filter data
    */
    var segmentData = filterService.getSegments();
    
    //var indx= -1,temp= [];
    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            })
            console.log("segment: ",selKeysSegment)
		//            selKeysSegment= getFilterData(selKeysSegment);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });
        
    $scope.location = function() {
        if ($scope.treeLocation)
            $scope.treeLocation = false;
        else{
            $scope.treeLocation = true;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }

    $scope.rat = function() {
        if ($scope.treeRAT)
            $scope.treeRAT = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = true;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }
    
    $scope.segment = function() {
        if ($scope.treeSegment)
            $scope.treeSegment = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = true;
            $scope.treeDevice = false;
        }
    }

    $scope.device = function() {
        if ($scope.treeDevice)
            $scope.treeDevice = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = true;
        }
    }
    
    
    function handsetStackedBar(url, tab){
        
        $scope.loadingHandsetStackedBarDiv= true;
        $scope.DataHandsetStackedBarDiv= false;
        $scope.noDataHandsetStackedBarDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            console.log("multiline", objArray);
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Segment";
                paramObject.data= "Count";
                paramObject.seriesName= "HandsetType";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                var AppsMultiLineOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                console.log("inside");
                AppsMultiLineOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                console.log("outsides", AppsMultiLineOptions);
                AppsMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.HandsetStackedBarChartConfig= {
                    options: AppsMultiLineOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                $scope.loadingHandsetStackedBarDiv= false;
                $scope.DataHandsetStackedBarDiv= true;
                $scope.noDataHandsetStackedBarDiv= false;  
          
            }
            else{
                $scope.loadingHandsetStackedBarDiv= false;
                $scope.DataHandsetStackedBarDiv= false;
                $scope.noDataHandsetStackedBarDiv= true;  
          
            }
        })
    }

    function appSegmentBar(url){
        
        $scope.loadingAppsSegmentBarDiv= true;
        $scope.DataAppsSegmentBarDiv= false;
        $scope.noDataAppsSegmentBarDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                var appSegmentBarData= [], xLabelArray= [];
                for(var i in objArray){
                    appSegmentBarData[i]= [objArray[i].AppSegment, objArray[i].Count];
                    xLabelArray[i]= objArray[i].AppSegment;
                }
                
                var AppsSegmentBarOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                AppsSegmentBarOptions.xAxis.categories= xLabelArray
                    
                $scope.AppsSegmentBarChartConfig= {
                    options: AppsSegmentBarOptions,
                    series: [{
                        name:"App Segment", 
                        data: appSegmentBarData
                    }]
                }
                
                $scope.loadingAppsSegmentBarDiv= false;
                $scope.DataAppsSegmentBarDiv= true;
                $scope.noDataAppsSegmentBarDiv= false;  
            }
            else{
                $scope.loadingAppsSegmentBarDiv= false;
                $scope.DataAppsSegmentBarDiv= false;
                $scope.noDataAppsSegmentBarDiv= true;  
        
            }
        })
    }

    function multiIMEISegmentCount(url, tab){
        
        $scope.loadingMultiIMEISegmentCountDiv= true;
        $scope.DataMultiIMEISegmentCountDiv= false;
        $scope.noDataMultiIMEISegmentCountDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                
            }
            else{
                $scope.loadingMultiIMEISegmentCountDiv= false;
                $scope.DataMultiIMEISegmentCountDiv= false;
                $scope.noDataMultiIMEISegmentCountDiv= true;  
         
            }
        })
    }

    function listTethering(url, tab){
        
        $scope.loadingMultiIMEISegmentCountDiv= true;
        $scope.DataMultiIMEISegmentCountDiv= false;
        $scope.noDataMultiIMEISegmentCountDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                
            }
            else{
                $scope.loadingMultiIMEISegmentCountDiv= false;
                $scope.DataMultiIMEISegmentCountDiv= false;
                $scope.noDataMultiIMEISegmentCountDiv= true;  
         
            }
        })
    }

    function defaultLoad(){
       
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= filterGetParams();

        switch(currentTab){
                
            case 'Handset':
                handsetStackedBarURL= globalConfig.pullfilterdataurlbyname+"Handset type commonly used"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                handsetStackedBar(handsetStackedBarURL);
                break;
            
            case 'appSegment':
                appSegmentBarURL= globalConfig.pullfilterdataurlbyname+"AppSegment Count"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                appSegmentBar(appSegmentBarURL);
                break;
            
            case 'multiIMEI':
                multiIMEISegmentCountURL= globalConfig.pullfilterdataurlbyname+"Segment count of multi device users"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                multiIMEISegmentCount(multiIMEISegmentCountURL, currentTab);
                break;
            
            case 'List':
                listTetheringURL= globalConfig.pullfilterdataurlbyname+"Tethering users distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                listTethering(listTetheringURL, currentTab);
                break;
            
        }
    }
    
    defaultLoad();
    
    //Tab selected event
    
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
    
    // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
    
    
}
// End Browsing Analytics Controller
//    ----------------------------------------------------------------------------


// User Segment Analytics Controller
function userSegmentAnalyticsCtrl($scope, $http,globalConfig,$filter,$timeout,$rootScope,dataFormatter,uiGmapGoogleMapApi,  highchartOptions, locationFilterService, highchartProcessData, $modal, filterService) {
    
    var filterParameters = "";
    var currentTab= "RAT";
    var handsetStackedBarURL, appSegmentBarURL, multiIMEISegmentCountURL, listTetheringURL;
    
    //--------------------------------------------------------------
    //Filter Section
    
    var selKeysLocation= [], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], queryParam; 
    
    function filterGetParams(){
        $scope.locationinfo= filterService.getLocationInfo(selKeysLocation);
        $scope.ratinfo= filterService.getRATInfo(selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo(selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo(selKeysDevice);
        return filterService.getParameter(selKeysLocation,selKeysRAT,selKeysSegment,selKeysDevice);
    }
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    $('.input-daterange').datepicker({
        
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-6-3",
        endDate: "0d"
    }) 
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    fromDate= "2016-09-18";  //toDate= "2016-08-10";
    $scope.date= {"start": fromDate, "end": toDate};
    
    
    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    var getParents= function(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
		//        if(parent=="_1")
		//            parent = "";
        return parent;
    }
    
    function getFilterData(selectedKey){
        var keyArrayParent= [];
        var keyArrayResult= [];
        var parentsParent= {};
        
        angular.forEach(selectedKey,function(node){
            var thisNode= node.data;
            var nodeKey= node.data.key;
            var thisParent = node.parent;
            var parentKey =thisParent.data.key;
            if(thisNode.isFolder){
                //First check if parent exists
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Parent key does not exist, so add this entry in parent & result
                    keyArrayParent.push(nodeKey);
                    var getParentRes = getParents(node);
                     if(getParentRes != '_1')
                         //keyArrayResult.push(parentKey+"."+nodeKey);
                         keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");

                    else
                        keyArrayResult.push("/^." + nodeKey + "/");

                }else{
                    //My parents is selected, means I am already selected, 
                    //so add self into parent list
                    keyArrayParent.push(nodeKey);
                }
            }else{
                //This is child case
                //Check if this child's parent exists in result
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Since parent does not exist, add this in result
                    //keyArrayResult.push(parentKey+"."+nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1')
                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                    else
                        keyArrayResult.push("/^." + nodeKey + "/");
                }
            }
        })
        console.log("keyArrayResult: ",keyArrayResult)
        return keyArrayResult;
    }

    /*
    *   Location Filter data
    */
    var locationData;
    //$http.get(globalConfig.pulldataurlbyname +'Location Lookup').then(function (response) {
        //locationData= response.data[0].children;
        
         var filterData= locationFilterService.locationFilterData();
         //console.log(filterData);
         locationData= filterData.children;
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: locationData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                
                // Get a list of all selected nodes, and convert to a key array:
                selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysLocation= getFilterData(selKeysLocation);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        })
    //})
        
    /*
    *   Device Filter data
    */
    var deviceData= [];
    $http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
        deviceData= response.data[0].children;
        //console.log("data: ", deviceData)
        $("#device").dynatree({
            checkbox: true,
            selectMode: 3,
            children: deviceData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysDevice= getFilterData(selKeysDevice);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        });
    })
    
    /*
    *   RAT Filter data
    */
    var ratData = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: ratData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            console.log("rat: ",selKeysRAT);
		//            selKeysRAT= getFilterData(selKeysRAT);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });

    /*
    *   Segment Filter data
    */
    var segmentData = filterService.getSegments();
    
    //var indx= -1,temp= [];
    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            })
            console.log("segment: ",selKeysSegment)
		//            selKeysSegment= getFilterData(selKeysSegment);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });
        
    $scope.location = function() {
        if ($scope.treeLocation)
            $scope.treeLocation = false;
        else{
            $scope.treeLocation = true;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }

    $scope.rat = function() {
        if ($scope.treeRAT)
            $scope.treeRAT = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = true;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }
    
    $scope.segment = function() {
        if ($scope.treeSegment)
            $scope.treeSegment = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = true;
            $scope.treeDevice = false;
        }
    }

    $scope.device = function() {
        if ($scope.treeDevice)
            $scope.treeDevice = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = true;
        }
    }
    
    function handsetStackedBar(url, tab){
        
        $scope.loadingHandsetStackedBarDiv= true;
        $scope.DataHandsetStackedBarDiv= false;
        $scope.noDataHandsetStackedBarDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            console.log("multiline", objArray);
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Segment";
                paramObject.data= "Count";
                paramObject.seriesName= "HandsetType";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                var AppsMultiLineOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                console.log("inside");
                AppsMultiLineOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                console.log("outsides", AppsMultiLineOptions);
                AppsMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.HandsetStackedBarChartConfig= {
                    options: AppsMultiLineOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                $scope.loadingHandsetStackedBarDiv= false;
                $scope.DataHandsetStackedBarDiv= true;
                $scope.noDataHandsetStackedBarDiv= false;  
          
            }
            else{
                $scope.loadingHandsetStackedBarDiv= false;
                $scope.DataHandsetStackedBarDiv= false;
                $scope.noDataHandsetStackedBarDiv= true;  
          
            }
        })
    }

    function appSegmentBar(url){
        
        $scope.loadingAppsSegmentBarDiv= true;
        $scope.DataAppsSegmentBarDiv= false;
        $scope.noDataAppsSegmentBarDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                var appSegmentBarData= [], xLabelArray= [];
                for(var i in objArray){
                    appSegmentBarData[i]= [objArray[i].AppSegment, objArray[i].Count];
                    xLabelArray[i]= objArray[i].AppSegment;
                }
                
                var AppsSegmentBarOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                AppsSegmentBarOptions.xAxis.categories= xLabelArray
                    
                $scope.AppsSegmentBarChartConfig= {
                    options: AppsSegmentBarOptions,
                    series: [{
                        name:"App Segment", 
                        data: appSegmentBarData
                    }]
                }
                
                $scope.loadingAppsSegmentBarDiv= false;
                $scope.DataAppsSegmentBarDiv= true;
                $scope.noDataAppsSegmentBarDiv= false;  
            }
            else{
                $scope.loadingAppsSegmentBarDiv= false;
                $scope.DataAppsSegmentBarDiv= false;
                $scope.noDataAppsSegmentBarDiv= true;  
        
            }
        })
    }

    function multiIMEISegmentCount(url, tab){
        
        $scope.loadingMultiIMEISegmentCountDiv= true;
        $scope.DataMultiIMEISegmentCountDiv= false;
        $scope.noDataMultiIMEISegmentCountDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                
            }
            else{
                $scope.loadingMultiIMEISegmentCountDiv= false;
                $scope.DataMultiIMEISegmentCountDiv= false;
                $scope.noDataMultiIMEISegmentCountDiv= true;  
         
            }
        })
    }

    function listTethering(url, tab){
        
        $scope.loadingMultiIMEISegmentCountDiv= true;
        $scope.DataMultiIMEISegmentCountDiv= false;
        $scope.noDataMultiIMEISegmentCountDiv= false;  
        
        $http.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                
            }
            else{
                $scope.loadingMultiIMEISegmentCountDiv= false;
                $scope.DataMultiIMEISegmentCountDiv= false;
                $scope.noDataMultiIMEISegmentCountDiv= true;  
         
            }
        })
    }

    function defaultLoad(){
       
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= filterGetParams();

        switch(currentTab){
                
            case 'RAT':
                handsetStackedBarURL= globalConfig.pullfilterdataurlbyname+"Handset type commonly used"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                handsetStackedBar(handsetStackedBarURL);
                break;
            
            case 'appSegment':
                appSegmentBarURL= globalConfig.pullfilterdataurlbyname+"AppSegment Count"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                appSegmentBar(appSegmentBarURL);
                break;
            
            case 'multiIMEI':
                multiIMEISegmentCountURL= globalConfig.pullfilterdataurlbyname+"Segment count of multi device users"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                multiIMEISegmentCount(multiIMEISegmentCountURL, currentTab);
                break;
            
            case 'List':
                listTetheringURL= globalConfig.pullfilterdataurlbyname+"Tethering users distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                listTethering(listTetheringURL, currentTab);
                break;
            
        }
    }
    
    defaultLoad();
    
    //Tab selected event
    
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
    
    // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
    
    
}
// End User Segment Analytics Controller
//    ----------------------------------------------------------------------------


// Plan Analytics Controller

function PlanAnalyticsCtrl($scope,$http,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams) {
   
    $scope.multipleDemo= {};
    $scope.multipleDemo.plan= ["2G-2GB","3G-1.5GB"];
    
    var filterParameters = "";
    console.log(angular.isDefined($stateParams.params), $stateParams.params);
    
    
    console.log("response.data.name", $scope.headerName);
    var currentPage= $scope.headerName
    if(currentPage== 'Plan Analytics')
        currentPage= 'Plan';
    else 
        currentPage= 'App';
    
    //--------------------------------------------------------------
    //Filter Section
    
    var selKeysLocation= [], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], queryParam; 
    
    function filterGetParams(){
        $scope.locationinfo= filterService.getLocationInfo(selKeysLocation);
        $scope.ratinfo= filterService.getRATInfo(selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo(selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo(selKeysDevice);
        return filterService.getParameter(selKeysLocation,selKeysRAT,selKeysSegment,selKeysDevice);
    }
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    $('.input-daterange').datepicker({
        
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-6-3",
        endDate: "0d"
    }) 
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    //fromDate= fromDate.substring(0,8);
    //fromDate= fromDate+"01"
    fromDate= "2016-09-18";  //toDate= "2016-08-15";
    $scope.date= {"start": fromDate, "end": toDate};
    
    
    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    var getParents= function(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
		//        if(parent=="_1")
		//            parent = "";
        return parent;
    }
    
    function getFilterData(selectedKey){
        var keyArrayParent= [];
        var keyArrayResult= [];
        var parentsParent= {};
        
        angular.forEach(selectedKey,function(node){
            var thisNode= node.data;
            var nodeKey= node.data.key;
            var thisParent = node.parent;
            var parentKey =thisParent.data.key;
            if(thisNode.isFolder){
                //First check if parent exists
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Parent key does not exist, so add this entry in parent & result
                    keyArrayParent.push(nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1')
                        //keyArrayResult.push(parentKey+"."+nodeKey);
                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                    
                    else
                        keyArrayResult.push("/^." + nodeKey + "/");

                }else{
                    //My parents is selected, means I am already selected, 
                    //so add self into parent list
                    keyArrayParent.push(nodeKey);
                }
            }else{
                //This is child case
                //Check if this child's parent exists in result
                if(!chkEntry(keyArrayParent,parentKey)){
                    //Since parent does not exist, add this in result
                    //keyArrayResult.push(parentKey+"."+nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1')
                        keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                    else
                        keyArrayResult.push("/^." + nodeKey + "/");
                }
            }
        })
        console.log("keyArrayResult: ",keyArrayResult)
        return keyArrayResult;
    }

    /*
    *   Location Filter data
    */
    var locationData;
    //$http.get(globalConfig.pulldataurlbyname +'Location Lookup').then(function (response) {
        //locationData= response.data[0].children;
        
    var filterData= locationFilterService.locationFilterData();
    //console.log(filterData);
    locationData= filterData.children;
    $("#location").dynatree({
        checkbox: true,
        selectMode: 3,
        children: locationData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
                 
            // Get a list of all selected nodes, and convert to a key array:
            selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                return node;
            });
            selKeysLocation= getFilterData(selKeysLocation);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    })
    //})
        
    /*
    *   Device Filter data
    */
    var deviceData= [];
    $http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
        deviceData= response.data[0].children;
        //console.log("data: ", deviceData)
        $("#device").dynatree({
            checkbox: true,
            selectMode: 3,
            children: deviceData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysDevice= getFilterData(selKeysDevice);
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        });
    })
    
    /*
    *   RAT Filter data
    */
    var ratData = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: ratData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            console.log("rat: ",selKeysRAT);
		//            selKeysRAT= getFilterData(selKeysRAT);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });

    /*
    *   Segment Filter data
    */
    var segmentData = filterService.getSegments()/*[
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];*/
    //var indx= -1,temp= [];
    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            })
            console.log("segment: ",selKeysSegment)
		//            selKeysSegment= getFilterData(selKeysSegment);
        },
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
        }
    });
        
    $scope.location = function() {
        if ($scope.treeLocation)
            $scope.treeLocation = false;
        else{
            $scope.treeLocation = true;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }

    $scope.rat = function() {
        if ($scope.treeRAT)
            $scope.treeRAT = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = true;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
        }
    }
    
    $scope.segment = function() {
        if ($scope.treeSegment)
            $scope.treeSegment = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = true;
            $scope.treeDevice = false;
        }
    }

    $scope.device = function() {
        if ($scope.treeDevice)
            $scope.treeDevice = false;
        else{
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = true;
        }
    }
    
    
    // plan filter
    $scope.select= { };
    
    
    $scope.currentPage= currentPage;
    var planListURL= globalConfig.pulldataurlbyname+currentPage+" Filter";
   
    function getPlanList(url){
        $http.get(url).then(function(response){
            var planListArray= [];
            var objArray= response.data;
            console.log("plan list", objArray);
            for(var i in objArray){
                if(currentPage=="App")
                    planListArray.push({name: objArray[i][currentPage], id:objArray[i][currentPage]}) ;
                else{
                    
                    planListArray.push({name: objArray[i][currentPage], id: objArray[i].PlanID});
                }

            }

            var keyPlan;
            if($stateParams.params != null){
                keyPlan= $stateParams.params.Key;
            }
            console.log("keyPlan", keyPlan);
            console.log("currentPage", currentPage);
            if(currentPage== "Plan" ){
                if(keyPlan == 'Plan'){
                    $scope.select.plan= $stateParams.params.value;
                }
                else
                    $scope.select.plan= "8";
            }else{
                if(keyPlan == 'App')
                    $scope.select.plan= $stateParams.params.value;
               else
                    $scope.select.plan= "Google";
            }
            console.log("planListArray", planListArray);
           // $scope.select.plan= planListArray[0]
            $scope.planNameList= angular.copy(planListArray);
         })
    }
    
    getPlanList(planListURL);
    
    //End of Filter Section
    //--------------------------------------------------------------
    
    
    var currentTab= 'UsageVsUsers';
    
    function UsageVsUsers(url){
        
        $scope.loadingUsageVsUsersDiv= true;
        $scope.DataUsageVsUsersDiv= false;
        $scope.noDataUsageVsUsersDiv= false;
        
        $http.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            console.log("response", objArray);
            if(objArray.length>0){
                
                var usageData= [], usersData= [], timeArray= [], usageDataArray= [];
                for(var i=0; i<objArray.length;i++){
                    usageDataArray[i]=  objArray[i].Usage;
                }
                var FormattedusageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 1)
                //console.log("ksnsk", vpsFormattedUsageArray );
                var xaxisArray= [], tickArray= [];
                    
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Date;
                    usageData[i]= parseFloat(FormattedusageDataArray[0][i]);
                    usersData[i]= parseFloat(objArray[i].Users);
                }
                
                var usageVsUsersChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
                console.log("usageVsUsersChartOptions", usageVsUsersChartOptions);
                usageVsUsersChartOptions.xAxis.categories= timeArray;
                
                usageVsUsersChartOptions.yAxis[1].title.text= 'Usage('+FormattedusageDataArray[1]+")";
                
                $scope.UsageVsUsersChartConfig= {
                    options: usageVsUsersChartOptions,
                    series: [{
                        name: 'Usage',
                        type: 'column',
                        yAxis: 1,
                        "color": "#1abc9c",
                        data: usageData,
                        tooltip: {
                            valueSuffix: ' '+FormattedusageDataArray[1]
                        }

                    }, {
                        name: 'Users',
                        type: 'spline',
                        color: "#3D8EB9",
                        data:  usersData
                    }]
                };

                $scope.loadingUsageVsUsersDiv= false;
                $scope.DataUsageVsUsersDiv= true;
                $scope.noDataUsageVsUsersDiv= false;
            }else{
                $scope.loadingUsageVsUsersDiv= false;
                $scope.DataUsageVsUsersDiv= false;
                $scope.noDataUsageVsUsersDiv= true;
            }
        })
    }
    
    function segmentUsageDistribution(url){
        
        $scope.loadingsegmentDistributionPieDiv= true;
        $scope.DatasegmentDistributionPieDiv= false;
        $scope.noDatasegmentDistributionPieDiv= false;
        
        $http.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            console.log("response", objArray);
            if(objArray.length>0){
                _.forEach(objArray, function(val, key){
                    _.forEach(val, function(v,k){
                        if(k== 'Usage'){
                            segmenUsageArray.push(v);
                        }
                    })
                })
                console.log("segmenUsageArray", segmenUsageArray);
                var usageFormattedArray= dataFormatter.convertFixUnitUsageDataWoUnit(segmenUsageArray, 3);
                console.log("usageFormattedArray", usageFormattedArray);

                //for pie chart data
                for(var i=0; i<objArray.length; i++){
                    segmenUsageData[i]= {
                        name: objArray[i].Segment, 
                        y: parseFloat(objArray[i].Usage)
                    };
                }

                $scope.segmentDistributionPieChartConfig= {
                    "options" : angular.copy(highchartOptions.highchartPieOptions),
                    series: [{
                        name: 'Segment',
                        colorByPoint: true,
                        data: segmenUsageData
                    }]
                }
                
                 $scope.loadingsegmentDistributionPieDiv= false;
                $scope.DatasegmentDistributionPieDiv= true;
                $scope.noDatasegmentDistributionPieDiv= false;
            }else{
                $scope.loadingsegmentDistributionPieDiv= false;
                $scope.DatasegmentDistributionPieDiv= false;
                $scope.noDatasegmentDistributionPieDiv= true;
            }
        })
    }
    
    function segmentUsageDistributionMultiline(url){
        
        $scope.loadingsegmentUsageDistributionMultilineDiv= true;
        $scope.DatasegmentUsageDistributionMultilineDiv= false;
        $scope.noDatasegmentUsageDistributionMultilineDiv= false;
        
        $http.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            //console.log("response", objArray);
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Usage";
                paramObject.seriesName= "Segment";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                paramObject.unit= "MB";
                
                var segmenUsageMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                segmenUsageMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                segmenUsageMultiLineOptions.yAxis.title.text="Usage( MB )";
                segmenUsageMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.segmentUsageDistributionMultilineChartConfig= {
                    options: segmenUsageMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                
                $scope.loadingsegmentUsageDistributionMultilineDiv= false;
                $scope.DatasegmentUsageDistributionMultilineDiv= true;
                $scope.noDatasegmentUsageDistributionMultilineDiv= false;
            }else{
                $scope.loadingsegmentUsageDistributionMultilineDiv= false;
                $scope.DatasegmentUsageDistributionMultilineDiv= false;
                $scope.noDatasegmentUsageDistributionMultilineDiv= true;
            }
        },function errorCallback(response) {
            console.log("response", response);
        })
    }
    
    function RATDistributionBar(url){
        var RATDistributionBarChartOptions= {};
        
        $scope.loadingRATDistributionBarDiv= true;
        $scope.DataRATDistributionBarDiv= false;
        $scope.noDataRATDistributionBarDiv= false;
        
        $http.get(url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Usage";
                paramObject.seriesName= "RAT";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var RATDistributionBarOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                console.log("inside");
                RATDistributionBarOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                RATDistributionBarOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}%</b>';
                RATDistributionBarOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.RATDistributionBarChartConfig= {
                    options: RATDistributionBarOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                  
                $scope.loadingRATDistributionBarDiv= false;
                $scope.DataRATDistributionBarDiv= true;
                $scope.noDataRATDistributionBarDiv= false;
            }else{
                $scope.loadingRATDistributionBarDiv= false;
                $scope.DataRATDistributionBarDiv= false;
                $scope.noDatRATDistributionBarDiv= true;
            }
        })
    }
    
    function AppDistributionBar(url, tab){
        var appDistributionBarChartOptions= {};
        
        $scope.loadingAppDistributionBarDiv= true;
        $scope.DataAppDistributionBarDiv= false;
        $scope.noDataAppDistributionBarDiv= false;
        
        $http.get(url).then(function(response){
            var appWiseUsageFormatArray= [], appWiseLabelArray= [], appWiseUsageData= [];
            var objArray= response.data;
            if(objArray.length>0){
                //for bar chart data
                
                for(var i=0; i<objArray.length; i++){
                    appWiseUsageFormatArray[i]= objArray[i].Usage;    
                }

                var appWiseUsageFormattedArray= dataFormatter.convertFixUnitUsageDataWoUnit(appWiseUsageFormatArray, 3);
                //console.log("appUsageFormattedArray", appUsageFormattedArray);
                for(var i=0; i<objArray.length; i++){
                    appWiseLabelArray[i]= objArray[i][tab];
                    appWiseUsageData[i]= parseFloat(appWiseUsageFormattedArray[0][i]);
                }

                appDistributionBarChartOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);

                appDistributionBarChartOptions.xAxis.categories= angular.copy(appWiseLabelArray);

                appDistributionBarChartOptions.tooltip.pointFormat= 'Usage<b> {point.y:.2f} '+ appWiseUsageFormattedArray[1];

                appDistributionBarChartOptions.yAxis.title.text= "Usage("+appWiseUsageFormattedArray[1]+")";

                $scope.AppDistributionBarChartConfig= 
                    {
                    "options" : appDistributionBarChartOptions,
                    "series": [{
                        name: tab+" Usage Distribution  ",
                        color: "rgb(39, 174, 96)",
                        data: appWiseUsageData
                    }]
                }
                  
                $scope.loadingAppDistributionBarDiv= false;
                $scope.DataAppDistributionBarDiv= true;
                $scope.noDataAppDistributionBarDiv= false;
            }else{
                $scope.loadingAppDistributionBarDiv= false;
                $scope.DataAppDistributionBarDiv= false;
                $scope.noDataAppDistributionBarDiv= true;
            }
        })
    }
    
    function AppDistributionMultiline(url, tab){
        
        $scope.loadingAppDistributionMultilineDiv= true;
        $scope.DataAppDistributionMultilineDiv= false;
        $scope.noDataAppDistributionMultilineDiv= false;
        
        $http.get(url).then(function(response){
            var AppUsageArray= [], AppUsageData= [];
            var objArray= response.data;
            console.log("response", objArray);
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Usage";
                paramObject.seriesName= tab;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                paramObject.unit= "MB";
                
                var AppUsageMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                AppUsageMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                AppUsageMultiLineOptions.yAxis.title.text="Usage( MB )";
                AppUsageMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.AppDistributionMultilineChartConfig= {
                    options: AppUsageMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                  
                $scope.loadingAppDistributionMultilineDiv= false;
                $scope.DataAppDistributionMultilineDiv= true;
                $scope.noDataAppDistributionMultilineDiv= false;
            }else{
                $scope.loadingAppDistributionMultilineDiv= false;
                $scope.DataAppDistributionMultilineDiv= false;
                $scope.noDataAppDistributionMultilineDiv= true;
            }
        })
    }
    
    function handsetWiseCountDistribution(url){
        var handsetDistributionBubbleChartOptions= {};
        
        $scope.loadinghandsetDistributionBubbleDiv= true;
        $scope.DatahandsetDistributionBubbleDiv= false;
        $scope.noDatahandsetDistributionBubbleDiv= false;
        
        $http.get(url).then(function(response){
            var handsetWiseLabelArray= [], handsetWiseCountData= [];
            var objArray= response.data;
            if(objArray.length>0){
                for(var i=0; i<objArray.length; i++){
                    handsetWiseLabelArray[i]= objArray[i].Handset;
                    handsetWiseCountData[i]= [objArray[i].Handset, parseFloat(objArray[i].Count), parseFloat(objArray[i].Count)]
                }

                handsetDistributionBubbleChartOptions= angular.copy(highchartOptions.highchartBubbleLabelCategoriesOptions);

                handsetDistributionBubbleChartOptions.xAxis.categories= angular.copy(handsetWiseLabelArray);

                $scope.handsetDistributionBubbleChartConfig= 
                    {
                    "options" : handsetDistributionBubbleChartOptions,
                    "series":[{
                        name: 'Handset Count distribution',
                        data: handsetWiseCountData,
                        marker: {
                            fillColor: {
                                radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                                stops: [
                                    [0, 'rgba(255,255,255,0.5)'],
                                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.5).get('rgba')]
                                ]
                            }
                        }
                    }]
                }
                
                $scope.loadinghandsetDistributionBubbleDiv= false;
                $scope.DatahandsetDistributionBubbleDiv= true;
                $scope.noDatahandsetDistributionBubbleDiv= false;
            }else{
                
                $scope.loadinghandsetDistributionBubbleDiv= false;
                $scope.DatahandsetDistributionBubbleDiv= false;
                $scope.noDatahandsetDistributionBubbleDiv= true;
            }
        })
    }
    
    function handsetWiseUsageDistribution(url){
        var handsetDistributionBarChartOptions= {};
        
        $scope.loadinghandsetDistributionBarDiv= true;
        $scope.DatahandsetDistributionBarDiv= false;
        $scope.noDatahandsetDistributionBarDiv= false;
        
        $http.get(url).then(function(response){
            var handsetWiseUsageFormatArray= [], handsetWiseLabelArray= [], handsetWiseUsageData= [];
            var objArray= response.data;
            if(objArray.length>0){
                //for bar chart data
                for(var i=0; i<objArray.length; i++){
                    handsetWiseUsageFormatArray[i]= objArray[i].Usage;    
                }

                var handsetWiseUsageFormattedArray= dataFormatter.convertFixUnitUsageDataWoUnit(handsetWiseUsageFormatArray, 3);
                //console.log("appUsageFormattedArray", appUsageFormattedArray);
                for(var i=0; i<objArray.length; i++){
                    handsetWiseLabelArray[i]= objArray[i].Handset;
                    handsetWiseUsageData[i]= parseFloat(handsetWiseUsageFormattedArray[0][i]);
                }

                handsetDistributionBarChartOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);

                handsetDistributionBarChartOptions.xAxis.categories= angular.copy(handsetWiseLabelArray);

                handsetDistributionBarChartOptions.tooltip.pointFormat= 'Usage<b> {point.y:.2f} '+ handsetWiseUsageFormattedArray[1];

                handsetDistributionBarChartOptions.yAxis.title.text= "Usage("+handsetWiseUsageFormattedArray[1]+")";

                $scope.handsetDistributionBarChartConfig= 
                    {
                    "options" : handsetDistributionBarChartOptions,
                    "series": [{
                        name: "Handset Usage Distribution  ",
                        color: "rgb(39, 174, 96)",
                        data: handsetWiseUsageData
                    }]
                }
                
                $scope.loadinghandsetDistributionBarDiv= false;
                $scope.DatahandsetDistributionBarDiv= true;
                $scope.noDatahandsetDistributionBarDiv= false;
            }else{
                $scope.loadinghandsetDistributionBarDiv= false;
                $scope.DatahandsetDistributionBarDiv= false;
                $scope.noDatahandsetDistributionBarDiv= true;
            }
        })
    }
    
    function defaultLoad(){
        
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= filterGetParams();
        var reverse= null, tab= null;
        if(currentPage=="App"){
            reverse= "Plan";
            tab= "Plan";
        }else{
            reverse= "Apps";
            tab= "App";
        }
        $scope.PlanOrApp= tab;
        
        switch(currentTab){
            case 'UsageVsUsers':
                var UsageVsUsersURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Usage vs Users&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
                
                UsageVsUsers(UsageVsUsersURL);
                break;
            
            case 'RatDistribution':
                var RATDistributionBarURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise RAT distribution vs total usage&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
                
                RATDistributionBar(RATDistributionBarURL);
                break;
            
            case 'Top20Areas':
                var AppDistributionBarURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise top 20 Areas usage&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
                
                AppDistributionBar(AppDistributionBarURL, "Area");
                break;
            
            case 'SegmentApps':
                var segmentUsageDistributionURL= globalConfig.pullfilterdataurlbyname+"Segment wise Usage Distribution for selected "+currentPage+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
        
                var segmentUsageDistributionMultilineURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Segment Usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
        
                segmentUsageDistribution(segmentUsageDistributionURL);
                segmentUsageDistributionMultiline(segmentUsageDistributionMultilineURL);
                break;
            
            case 'AppDistribution':
                
                
                var AppDistributionBarURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise top 20 "+reverse+" usage&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
                
                var AppDistributionMultilineURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+reverse+" usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
        
                AppDistributionBar(AppDistributionBarURL, tab);
                AppDistributionMultiline(AppDistributionMultilineURL, tab);
                
                break;
            
            case 'HandsetwiseDistribution':
                var handsetWiseCountDistributionURL= globalConfig.pullfilterdataurlbyname+"Handset wise Count Distribution for selected "+ currentPage+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
        
                var handsetWiseUsageDistributionURL= globalConfig.pullfilterdataurlbyname+"Handset wise Usage Distribution for selected "+currentPage+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+$scope.select.plan+filterParameters;
        
                handsetWiseCountDistribution(handsetWiseCountDistributionURL);
                handsetWiseUsageDistribution(handsetWiseUsageDistributionURL);
                break;
        }
  
    }
    
    defaultLoad();
    
    //plan select event 
    $scope.planSelected= function(){

        defaultLoad();
    }
    
    //dateRange select event
    $scope.click= function(){
        defaultLoad();
    }
    
    //tab Selected event 
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
}

//End Plan Analytics Controller
//-----------------------------------------------------------------------------------------------------

// Customer Analytics Enter IMSI page Controller
function CustomerAnalyticEnterIMSICtrl($scope, $http, $filter, $state,dataFormatter,globalConfig, $modal, $stateParams){
    $scope.customer= {imsi:""};
    //console.log($scope.customer.ip)
    var params= {}
    var selectedDate;
    $scope.dateSelect= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    $scope.changeDate=function (modelName, newDate) {
        selectedDate= newDate.format();
        console.log("selected Date", selectedDate);
        $scope.dateSelect= selectedDate
    }
    
    //Submit Button click event
    $scope.submit= function(){
        params.date= $scope.dateSelect;
        console.log("param.date", params.date);
        params.value= $scope.customer.imsi;
        console.log("stateparam", $stateParams)
        $state.go('index.staticanalysis',{'params': params, 'file':'Customer Analytics.html','id':null, 'name': 'Customer Analytics'})
    }
}
// End Customer Analytics Enter IMSI page Controller
//    ----------------------------------------------------------------------------

//Customer Analytics controller
function CustomerAnalyticsCtrl($scope, $http, $filter, $state,dataFormatter,globalConfig, $modal , $stateParams, flotChartOptions,  $sce, highchartProcessData, highchartOptions){
    
    var colopallette= ['rgb(31, 119, 180)','rgb(255, 127, 14)','rgb(214, 39, 40)','rgb(44, 160, 44)','rgb(148, 103, 189)','rgb(227, 119, 194)','#3E4651','#E7F76D', '#72F274', '#39B4FF'];
    
    var appwiseUsageDetailsURL, usageDetailsURL, headerdetailURL, transactionDetailURL, throughputDetailsURL, hour, usagelast30DaysURL, appDistributionlast30DaysURL, usageValue, hourlyAppwiseUsageURL;
    
    var todayDate= $filter('date')( new Date().getTime(), "yyyy-MM-dd");
    if($stateParams.params.hasOwnProperty('date')){
        var getDate= $stateParams.params.date;
        $scope.dateSelect= getDate.substring(0,10);
    }else{
        $scope.dateSelect= todayDate;
    }
    
    //datepicker options
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    
    // hour & min drpdown
    var hourList= [], minList= [];
    $scope.selectMin= {};
    $scope.minList= ["00-09", "10-19", "20-29", "30-39", "40-49", "50-59",]
    $scope.select= {};
    for(var i=0; i<24; i++){
        if(i<10){
            hourList[i]= "0"+i+":00";
        }
        else{
            hourList[i]= i+":00";
        }
    }
    $scope.hourList= hourList;
    
    var snip= "<div class='sk-spinner sk-spinner-fading-circle'>"+
                "<div class='sk-circle1 sk-circle'></div>"+
                "<div class='sk-circle2 sk-circle'></div>"+
                "<div class='sk-circle3 sk-circle'></div>"+
                "<div class='sk-circle4 sk-circle'></div>"+
                "<div class='sk-circle5 sk-circle'></div>"+
                "<div class='sk-circle6 sk-circle'></div>"+
                "<div class='sk-circle7 sk-circle'></div>"+
                "<div class='sk-circle8 sk-circle'></div>"+
                "<div class='sk-circle9 sk-circle'></div>"+
                "<div class='sk-circle10 sk-circle'></div>"+
                "<div class='sk-circle11 sk-circle'></div>"+
                "<div class='sk-circle12 sk-circle'></div>"+
            "</div>";
    var load= "<span class='text-info'><b>Loading...</b></span>";
    var loading, snipper;
    
    $scope.showUserDetails= false;
    var currentTab= 'usage';
    var unit, maxValue, maxLineValue;   
   
    var multiBarHorizontalChartOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                margin: {
                    top: 20,
                    right: 75,
                    bottom: 50,
                    left: 150
                },
                rect:{
                  width:10  
                },
                forceY: [0, maxValue],
                height: 300,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: true,
                showValues: false,
                duration: 500,
                stacked: false,
                tooltip: {
                    contentGenerator: function(d) { 
                       //console.log(d)
                      return "App: "+d.data.label+", Usage: "+d.data.value 
                    }
                },
                xAxis: {
                    showMaxMin: true
                },
                yAxis: {
                    axisLabel: 'Usage',
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                }
            }
        };

    var transactionDetailsOptions= {
        "destroy": true,
        "aaSorting": [],
        "paging": true, 
        "searching": false,
        "bSort": true,
        "bLengthChange": false,
        "bInfo": false,
        "autoWidth": true,
         "order": [[ 0, "desc" ]],
         "pageLength": 50,
        //"scrollX": true,
        "columnDefs": [
            { "orderable": false, "targets": [2,3,4,5,6,7,9,11] }
        ]
    };
    
    var dataTableOptionsDetails= {
        "destroy": true,
        "aaSorting": [],
        "paging": false, 
        "searching": false,
        "bSort": false,
        "bLengthChange": false,
        "bInfo": false,
        "autoWidth": true,
        "scrollX": true,
        "columnDefs": [
            { width: '10%', targets: [0]}
        ]
    };
    
    function usageDetails(url){
        
        var avgLatencyTrasholdms= 300;
        var avgThroughputTrasholdKbps= 50; 
        var colArray= []
        var barDataUsage=[]; 
        var lineDataCEI=[]; 
        var barArray= [];
        var tempArray= [];
        var rowDataArray= [];
        var Usage= [];
        var AvgLatency= [];
        var PeakLatency= [];
        var Throughput= [];
        var tableUsageData= [];

        for (var i = 0; i < 24; i++) {
            tempArray[i]= '-';
            barArray[i]= '0';
            barDataUsage[i]=[i,];
            lineDataCEI[i]=[i,];
            colArray[i]= i;
        }
        
        Usage= angular.copy(tempArray);
        tableUsageData= angular.copy(tempArray);
        Throughput= angular.copy(tempArray);
        AvgLatency= angular.copy(tempArray);
        PeakLatency= angular.copy(tempArray);
        $scope.dataTableOptionsDetails= dataTableOptionsDetails;
        //rowDataArray[0]= ["No Record",Usage]
        $scope. colArray = angular.copy(colArray);
        //$scope.rowArray = rowArray;
        //$scope.rowDataArray = rowDataArray

        function setIndicator(val, threshold, reverse, check){
            if(val == 0){
                return {val: val, indicator: '', spanClass: ''};
            }
            if(check){
                if(!reverse){
                    if(val > threshold){
                        var indicator = '';//'fa fa-level-up';
                        var spanClass = 'badge badge-danger';
                    }
                    else{
                        var indicator = '';//'fa fa-level-down';
                        var spanClass = '';//'badge badge-danger';
                    }
                }
                var obj = {val: val, indicator: indicator, spanClass: spanClass};
            }else{
                var obj = {val: val, indicator: '', spanClass: ''};
            }
            return obj;
        }


        $scope.loadingUsageDiv= true;
        $scope.dataUsageDiv= false;
        $scope.noDataUsageDiv= false;
        
        var valData= [];
        var validatedArray= [],lineArray= [];
        for(var i=0;i<24;i++){
            validatedArray[i]= 0;
            lineArray[i]= 0;
        }
        
        $http.get(url).then(function (response) {
            //console.log("response:", response.data);
            var objArray = response.data;
            //var ab= dataFormatter.convertSingleUnitThroughputData(objArray[0].PeakThroughput,1,"Kbps");
            console.log("response:",objArray);
            //console.log("length",Object.keys(objArray[0]).length)
            if(objArray.length>0){
                for(var i=0;i<=23;i++){
                    valData[i]= objArray[0][i];
                }
                //console.log("valData", valData);
                var obj= {"CEI":"0", "AvgLatency":"-", "Usage":"-", "Throughput":"-", "PeakLatency": "-"}, Arr= [], index=-1;
                
                for(var i=0; i<24; i++){
                    Arr[i]= angular.copy(obj); 
                }
                
                angular.forEach(valData, function(value, key){
                    //console.log("value", key);
                    angular.forEach(value, function(val,key){
                        //console.log("val", key);

                    })
                })
                
                //console.log("Arr", Arr)
                for(var i=0;i<24;i++){
                    if(Object.keys(valData[i]).length==5){
                        validatedArray[i]= valData[i]
                    }
                }

                for(var i=0;i<24;i++){
                    
                    if(valData[i].hasOwnProperty("Usage")){
                        
                        if(valData[i].Usage != null){
                            
                            Arr[i].Usage = valData[i].Usage;
                            if(valData[i].hasOwnProperty("AvgLatency")){
                                
                                if(valData[i].AvgLatency == null){
                                    Arr[i].AvgLatency = "0";
                                }else{
                                    if(valData[i].AvgLatency>0)
                                        Arr[i].AvgLatency = (valData[i].AvgLatency).toFixed(0);
                                    else
                                        Arr[i].AvgLatency = valData[i].AvgLatency.toFixed(0);
                                }
                            }
                            
                            if(valData[i].hasOwnProperty("PeakLatency")){
                                if(valData[i].PeakLatency == null){
                                    Arr[i].PeakLatency = "0";
                                }else{
                                    if(valData[i].PeakLatency>0)
                                        Arr[i].PeakLatency = (valData[i].PeakLatency).toFixed(0);
                                    else
                                        Arr[i].PeakLatency = valData[i].PeakLatency.toFixed(0);
                                }   
                            }
                            
                            if(valData[i].hasOwnProperty("Throughput")){
                                if(valData[i].Throughput != null)
                                    Arr[i].Throughput = valData[i].Throughput; 
                            }
                            
                        }
                        
                    }
                    
                }
                console.log("validatedArray", validatedArray);

                //----------------------Bar Chart Data---------------------------
                for(var i=0; i<Arr.length;i++){
                    if(Arr[i].Usage=="-"){
                        barArray[i]= "0"; 
                    }
                    else{
                        barArray[i]= Arr[i].Usage;
                    }
                }
                console.log("barArray",barArray)
                //console.log("lineArray",lineArray);

                var barArray1= dataFormatter.convertFixUnitUsageDataWoUnit(barArray,3);
                console.log("barArray1",barArray1);
                
                var hourArray= [];
                for (var i = 0; i < 24; i++) {
                    hourArray[i]= i;
                    barDataUsage[i]= parseFloat(barArray1[0][i]);
                    //lineDataCEI[i]= [i ,lineArray[i]];
                }
                var optionsUsageBar= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                optionsUsageBar.xAxis.categories= hourArray;
                optionsUsageBar.yAxis.title.text= "Usage("+barArray1[1]+")";
                optionsUsageBar.tooltip.pointFormat= 'Usage<b> {point.y:.2f} '+ barArray1[1];
                
                $scope.usageBarChartConfig= {
                    "options" : optionsUsageBar,
                    "series": [{
                        name: "Hourly Usage",
                        color: "rgb(39, 174, 96)",
                        data: barDataUsage
                    }]
                }
                
                //----------------------User Details Table Data------------------------------

                for (var i = 0; i < Arr.length; i++) {
                    
                    if(typeof(Arr[i].Usage)=="number"){
                        tableUsageData[i]= dataFormatter.formatUsageData(Arr[i].Usage,1);
                    }
                    else{
                        tableUsageData[i]=  Arr[i].Usage
                    }
                    AvgLatency[i]= Arr[i].AvgLatency//.toFixed(0);
                    PeakLatency[i]= Arr[i].PeakLatency//.toFixed(0);
                    
                    if(typeof(Arr[i].Throughput)=="number"){
                        Throughput[i]= dataFormatter.formatBwBitsData(Arr[i].Throughput,1); 
                    }
                    else{
                        Throughput[i]=  Arr[i].Throughput
                    } 
                    
                }

                var AvgLatency1=[];
                var PeakLatency1=[];

                var Throughput1 = [];
                var tableUsageData1= [];

                for (var i = 0; i < 24; i++) {
                    tableUsageData1[i]= setIndicator(tableUsageData[i],avgThroughputTrasholdKbps,false,false);
                    AvgLatency1[i]= setIndicator(AvgLatency[i],avgLatencyTrasholdms,false,true);
                    PeakLatency1[i]= setIndicator(PeakLatency[i],avgLatencyTrasholdms,false,true);
                    Throughput1[i]= setIndicator(Throughput[i],avgThroughputTrasholdKbps,false,false);
                }

                rowDataArray[0]= ['Usage', tableUsageData1];
                rowDataArray[1]= ['Avg.Latency(ms)', AvgLatency1];
                rowDataArray[2]= ['PeakLatency(ms)', PeakLatency1];
                rowDataArray[3]= ['Throughput', Throughput1];
                //console.log("rowDataArray", rowDataArray);

                $scope. colArray = colArray;
                //$scope.rowArray = rowArray;
                $scope.dataTableOptionsDetails= dataTableOptionsDetails;
                $scope.rowDataArray = rowDataArray;

                //------------------------Header Data------------------------------------
                $scope.usage= dataFormatter.formatUsageData(objArray[0].TodaysUsage,2);
                $scope.peakThroughput= dataFormatter.formatBwBitsData(objArray[0].PeakThroughput,2)
                $scope.updateTime= $filter('date')( new Date(objArray[0].LastUpdated.$date) , "h:mm a");
                $scope.billPlan= objArray[0].BillPlan;
                $scope.segment= objArray[0].Segment;
                $scope.lastKnownCell= objArray[0].LastKnownCell;
                $scope.brand= objArray[0].Brand;
                $scope.model= objArray[0].Model;
                $scope.Capability= objArray[0].ModelCapability;
                //console.log("tzoffset", globalConfig.tzoffset);
                $scope.loadingUsageDiv= false;
                $scope.dataUsageDiv= true;
                $scope.noDataUsageDiv= false;
            }
            else{
                $scope.loadingUsageDiv= false;
                $scope.dataUsageDiv= false;
                $scope.noDataUsageDiv= true;
            }
            
        });
    }
    
    function appwiseUsageDetails(url){
        $scope.loadingAppUsageDiv= true;
        $scope.dataAppUsageDiv= false;
        $scope.noDataAppUsageDiv= false;
            
        if(angular.isDefined($scope.dataHorizontalBar)){
            console.log("$scope.dataHorizontalBar", $scope.dataHorizontalBar)
            //$scope.dataHorizontalBar.splice(0,$scope.dataHorizontalBar.length);
            $scope.optionsHorizontalBar= {
                chart: {
                    type: 'multiBarHorizontalChart',
                    margin: {
                        top: 20,
                        right: 75,
                        bottom: 50,
                        left: 150
                    },
                    rect:{
                        width:10  
                    },
                }
            };
        }
        
        $http.get(url).then(function (response) {
            //console.log("response:", response.data);
            var objArray = response.data;
            //console.log("length:",objArray.length);
            if(objArray.length>0){
                var appData= [], usageArray= [];
                $scope.dataHorizontalBar = appData;
                for(var i=0; i<objArray.length;i++){
                    usageArray[i]= objArray[i].Usage;
                }
                var UsageData= dataFormatter.convertFixUnitUsageDataWoUnit(usageArray,2);
                //console.log("UsageData", UsageData);
                for (var i = 0; i < objArray.length; i++) {
                    appData[i]= {
                        "key": objArray[i].App,
                        "color": colopallette[i],//"#1f77b4",
                        "values": [
                            {
                                "label": objArray[i].App , "value": parseFloat(UsageData[0][i]) 
                            }
                        ] 
                    }
                }
                var maxValue;
                maxValue= Math.max.apply(null, UsageData[0]);
                //console.log("appData: ", appData);
                multiBarHorizontalChartOptions.chart.yAxis.axisLabel= "Usage( "+UsageData[1]+")";
                //multiBarHorizontalChartOptions.chart.forceY= [0,maxValue];
                $scope.dataHorizontalBar = appData
                $scope.optionsHorizontalBar= multiBarHorizontalChartOptions;
                
                $scope.loadingAppUsageDiv= false;
                $scope.dataAppUsageDiv= true;
                $scope.noDataAppUsageDiv= false;
            }
            else{
                $scope.loadingAppUsageDiv= false;
                $scope.dataAppUsageDiv= false;
                $scope.noDataAppUsageDiv= true;
            }
        });
    }
    
    function hourlyAppwiseUsageDetails( hourlyURL){
        $scope.loadingHourlyAppUsageDiv= true;
        $scope.dataHourlyAppUsageDiv= false;
        $scope.noDataHourlyAppUsageDiv= false;
            
        $http.get(hourlyURL).then(function (response) {
            //console.log("response:", response.data);
            var objArray = response.data;
            //console.log("length:",objArray.length);
            if(objArray.length>0){
                var hourlyAppUsageChartOptions= angular.copy(highchartOptions.highchartBubbleLabelCategoriesOptions);
                hourlyAppUsageChartOptions.yAxis.title.text= "Usage (MB)";
                hourlyAppUsageChartOptions.xAxis.title.text= "Hours";
                hourlyAppUsageChartOptions.plotOptions.bubble= {};
                
                $scope.hourlyAppUsageChartConfig= {
                    options: hourlyAppUsageChartOptions,
                    series: highchartProcessData.bubbleProcessHighchartData(objArray, "Hour", "Usage", "data", "App")
                }
                
                
                $scope.loadingHourlyAppUsageDiv= false;
                $scope.dataHourlyAppUsageDiv= true;
                $scope.noDataHourlyAppUsageDiv= false;
            }
            else{
                $scope.loadingHourlyAppUsageDiv= false;
                $scope.dataHourlyAppUsageDiv= false;
                $scope.noDataHourlyAppUsageDiv= true;
            }
        });
    }
    
    
    function transactionTable(a,b,c,d,e,f,g,h,i,m,n,j,k,l){
        this.Date= a;
        this.Duration= b;
        this.AppProtocol= c;
        this.DestinationIP= d;
        this.App= e;
        this.SourcePort= f;
        this.DestinationPort= g;
        this.URL= h;
        this.Usage= i;
        this.UpUsage= m;
        this.DownUsage= n;
        this.Throughput= j;
        this.DataLatency= k;
        this.key= l;
        
    }
    var tableData= [];
                   
    //$scope.snipper= $sce.trustAsHtml(snipper);
    loading= load, snipper= snip;
    tableData[0]= new transactionTable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper), '','','','','','','','','','');
    $scope.transactionDetailsOptions= transactionDetailsOptions;
    $scope.transactionDetail= tableData;
    
    function transactionDetails(url){
        $scope.transactionDetail.splice(0,$scope.transactionDetail.length);
        loading= load, snipper= snip;
        tableData[0]= new transactionTable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper),     '','','','','','','','','','');
        $scope.transactionDetail= tableData;
        
        $http.get( url).then(function (response) {
            var objArray= response.data;
            console.log("objArray.length",objArray.length);
            if(objArray.length>0){
                var recordData, usageData= [], transactionData= [], usageData1= [];
                for(var i=0; i<objArray.length;i++){
                    recordData= (objArray[i].record).split(",");
                    
                    transactionData[i]= {"key":recordData[0], "datatime":recordData[1], "duration":recordData[2], "appprotocol":recordData[3], "ipz":recordData[4], "app":recordData[5], "sport":recordData[6], "dport": recordData[7], "url":recordData[8], "volume":recordData[9], "upVolume": recordData[10], "downVolume": recordData[11], "throughput":recordData[12], "latency":recordData[13] }
                }
                console.log("transactionData",transactionData.length);
                
                for(var i=0;i<transactionData.length;i++){
                    var app
                    if(transactionData[i].app=='NOT CLASSIFIED'){
                        app= 'NA';
                    }
                    else{
                        app= transactionData[i].app;
                    }
                    
                    loading= "<span>"+transactionData[i].datatime+"</span>";
                    snipper=  "<span>"+transactionData[i].duration+"</span>";
                    tableData[i]= new transactionTable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper), transactionData[i].appprotocol, transactionData[i].ipz,app, transactionData[i].sport, transactionData[i].dport, transactionData[i].url, dataFormatter.formatUsageData(transactionData[i].volume,1), dataFormatter.formatUsageData(transactionData[i].upVolume,1), dataFormatter.formatUsageData(transactionData[i].downVolume,1), dataFormatter.formatBwBitsData(transactionData[i].throughput,1), transactionData[i].latency, transactionData[i].key);
                }
                // console.log('tableReasopnse',$scope.transactionDetail);
                //$scope.dataTableOptions= dataTableOptions;
                //$scope.transactionDetail= objArray;
            }
            else{
                //$scope.transactionDetailsOptions= transactionDetailsOptions;
                $scope.transactionDetail.splice(0,$scope.transactionDetail.length);
                tableData[0]= new transactionTable($sce.trustAsHtml('No'),$sce.trustAsHtml('Record!'),'','','','','','','','','','')
                $scope.transactionDetail= tableData;
                //console.log('tableData',$scope.transactionDetail);
            }
        });
    }
    
    function throughputDetails(url){
        $scope.loadingThroughputDiv= true;
        $scope.dataThroughputDiv= false;
        $scope.noDataThroughputDiv= false;
        var throughputData= [], unformatedThroughputArray= [], formatedThroughputArray= [];
        
        $http.get(url).then(function (response) {
            var objArray= response.data;
            if(objArray.length>0){
                $scope.loadingThroughputDiv= true;
                $scope.dataThroughputDiv= false;
                $scope.noDataThroughputDiv= false;
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                    }
                } 
                console.log("unformatedThroughputArray", unformatedThroughputArray);
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                
                var index= -1;
                for(var i=0;i<objArray.length; i++){
                     if(objArray[i].hasOwnProperty('Throughput')){
                         throughputData.push([objArray[i].Time,parseFloat(formatedThroughputArray[0][++index])]);
                     }
                }
                //console.log('throughputData', throughputData);
                var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                
                $scope.throughputChartConfig= {
                     "options" : optionsThroughputBar,
                    "series": [{name: "Throughput",
                                color:"rgb(39, 174, 96)",
                               data: throughputData
                               }
                              ]
                }
                
                $scope.loadingThroughputDiv= false;
                $scope.dataThroughputDiv= true;
                $scope.noDataThroughputDiv= false;
                
            }else{
                $scope.loadingThroughputDiv= false;
                $scope.dataThroughputDiv= false;
                $scope.noDataThroughputDiv= true;
            }
        })
    }
    
    function usagelast30Days(url, appURL){
        $scope.loadingUsageDiv= true;
        $scope.dataUsageDiv= false;
        $scope.noDataUsageDiv= false;
        
        $scope.loadingAppDistributionDiv= true;
        $scope.dataAppDistributionDiv= false;
        $scope.noDataAppDistributionDiv= false;
        //usage last 30 days
        $http.get(url).then(function(response){
            var objArray= response.data;
            //console.log("objArray", objArray);
            if(objArray.length>0){
                var usageFormatArray= [], usagelast30DaysArray= [];
                for(var i=0; i<objArray.length; i++){
                    usageFormatArray[i]= objArray[i].Usage;    
                }
                
                var usageFormattedArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageFormatArray, 3);
                //console.log("usageFormattedArray", usageFormattedArray);
                for(var i=0; i<objArray.length; i++){
                    usagelast30DaysArray[i]= [objArray[i].Date, parseFloat(usageFormattedArray[0][i])];    
                }
                //console.log("usagelast30DaysArray", usagelast30DaysArray);
                
                $scope.barChartConfig={
                    "options" : {
                        "chart": {
                            height: 300,
                            "renderTo": "container",
                            "type":"column",
                            "zoomType":"xy"
                        },
                        "legend": {},
                        "title": {"text":""},
                        "tooltip": {
                            "xDateFormat": "%e. %b",
                            pointFormat: 'Usage<b> {point.y:.2f} '+ usageFormattedArray[1] ,
                            "shared": true
                        },
                        "credits": {
                            "enabled": false
                        },
                        "plotOptions": {
                            column:{ 
                                events: {
                                    legendItemClick: function () {
                                        return false; 
                                    }
                                }
                            },
                            "series": {}
                        },
                        "colors": ["#7cb5ec","rgb(39, 174, 96)"],
                        "xAxis" :{
                            "type": "datetime",
                            "labels": {
                                "format": "{value:%e. %b }",
                                "align": "left"
                            }
                        },
                        "yAxis": {"labels": {}, "title":{"text":"Usage("+ usageFormattedArray[1] +")"}}
                    },
                    series:[{
                        name: 'Usage Last 30 Days',
                        data: usagelast30DaysArray
                    }]
                }
                
                $scope.scatterChartConfig={
                    "options" : {
                        chart: {
                            height: 300,
                            type: 'scatter',
                            zoomType: 'xy'
                        },
                        title: {
                            text: ''
                        },
                        subtitle: {
                            text: ''
                        },
                        xAxis: {
                            "type": "datetime",
                            "labels": {
                                "format": "{value:%e. %b }",
                                "align": "left"
                            }
                        },
                        "credits": {
                            "enabled": false
                        },
                        yAxis: {
                            title: {
                                text: 'Usage('+usageFormattedArray[1]+")"
                            }
                        },
                        plotOptions: {
                            scatter: {
                                events: {
                                    legendItemClick: function () {
                                        return false; 
                                    }
                                },
                                marker: {
                                    symbol: 'circle',
                                    radius: 5,
                                    states: {
                                        hover: {
                                            enabled: true,
                                            lineColor: 'rgb(100,100,100)'
                                        }
                                    }
                                },
                                states: {
                                    hover: {
                                        marker: {
                                            enabled: false
                                        }
                                    }
                                },
                                tooltip: {
                                    "xDateFormat": "%e. %b",
                                    //headerFormat: '<b>{series.name}</b><br>',
                                    pointFormat: 'Usage<b> {point.y:.2f} '+ usageFormattedArray[1]
                                }
                            }
                        }
                    },
                    series:[{
                        name: 'Usage Last 30 Days',
                        color: "#7cb5ec",
                        data: usagelast30DaysArray
                    }]
                }
                $scope.loadingUsageDiv= false;
                $scope.dataUsageDiv= true;
                $scope.noDataUsageDiv= false;
            }
            else{
                $scope.loadingUsageDiv= false;
                $scope.dataUsageDiv= false;
                $scope.noDataUsageDiv= true;
            }
        })
        
        //app Distribution
        $http.get(appURL).then(function(response){
            var objArray= response.data;
            console.log("objArray", objArray);
            if(objArray.length>0){
                var appUsageFormatArray= [], appUsagelast30DaysArray= [], appBarDataArray= [], appArray= [];
                
                //for bar chart data
                for(var i=0; i<objArray.length; i++){
                    appUsageFormatArray[i]= objArray[i].Usage;    
                }
                
                var appUsageFormattedArray= dataFormatter.convertFixUnitUsageDataWoUnit(appUsageFormatArray, 3);
                //console.log("appUsageFormattedArray", appUsageFormattedArray);
                for(var i=0; i<objArray.length; i++){
                    appArray[i]= objArray[i].App;
                   appBarDataArray[i]= parseFloat(appUsageFormattedArray[0][i]);
                }
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){
                    appUsagelast30DaysArray[i]= {
                        name: objArray[i].App, 
                        y: parseFloat(objArray[i].Usage)
                    };
                }
                console.log("appUsagelast30DaysArray", appUsagelast30DaysArray);
                
                $scope.appPieChartConfig= {
                    "options" : {
                        "chart": {
                            "type":"pie",
                            "height": 250
                        },
                        "credits": {"enabled": false},
                        "title":{"text":""},
                        "tooltip": {
                            "pointFormat": "<b>{point.percentage:.1f}%</b>"
                        },
                        "plotOptions": { 
                            "pie": {
                                "allowPointSelect": true,
                                "cursor": "pointer",
                                "dataLabels": {"enabled": false},
                                "showInLegend": true,
                                "events":{}
                            }
                        },
                        "legend": {
                            "verticalAlign": "top",
                            "layout": "vertical",
                            "align": "right"
                        }
                    },
                    series: [{
                        name: 'Brands',
                        colorByPoint: true,
                        data: appUsagelast30DaysArray
                    }]
                }
                
                $scope.appBarChartConfig= {
                    "options" : {
                        "chart": {"type":"column"},
                        "title":{"text":""},
                        "credits": {"enabled": false},
                        "tooltip": {
                            pointFormat: 'Usage<b> {point.y:.2f} '+ appUsageFormattedArray[1] ,
                            "shared": true
                        },
                        "plotOptions": { 
                            column:{ 
                                events: {
                                    legendItemClick: function () {
                                        return false; 
                                    }
                                }
                            }
                        },
                        "xAxis" :{
                            type: "categories",
                            categories: appArray
                        },
                        "yAxis":{
                            "title": {"text":"Usage("+appUsageFormattedArray[1]+")"}
                        }
                    },
                    "series": [{
                        name: "Apps",
                        color: "rgb(39, 174, 96)",
                        data: appBarDataArray
                    }]
                }
                
                $scope.loadingAppDistributionDiv= false;
                $scope.dataAppDistributionDiv= true;
                $scope.noDataAppDistributionDiv= false;
            }
            else{
                $scope.loadingAppDistributionDiv= false;
                $scope.dataAppDistributionDiv= false;
                $scope.noDataAppDistributionDiv= true;
            }
        })
    }
    
    function headerDetails(url){
        $http.get(url).then(function (response) {
            var obj= response.data;
            if(obj.length>0){
                var userID= obj[0].customerid
                $scope.billPlan= obj[0].billplan;
                $scope.speed= obj[0].speed;
                $scope.sourceip= obj[0].sourceip;
                $scope.segment= obj[0].segment;
                $scope.node= obj[0].nodeid;
            }
            else{
                $scope.billPlan= "L3-NotProv";
                $scope.speed= '';
                $scope.sourceip= $scope.customer.ip;
                $scope.segment= "General";
                $scope.node= "B28";
            }
        });
    }
    
    function transactionDetailsMakeURL(){
        $scope.transactionDetailsTab= {active: true};
        
        transactionDetailURL= globalConfig.clistener+$scope.customer.imsi+"&fordate="+$scope.dateSelect+" "+$scope.hour;
        transactionDetails(transactionDetailURL);
    }
    
    function filteredTransactionDetails(filterParam){
        
        if(angular.isDefined(filterParam)){
            
            $scope.infoLine= true;
            $scope.protocol= null;
            $scope.usageFilter= null;
            
            transactionDetailURL= globalConfig.clistener+$scope.customer.imsi+"&fordate="+$scope.dateSelect+" "+$scope.hour;
            
            if(angular.isDefined(filterParam.protocol)){
                if(angular.isDefined(filterParam.usage)){
                    $scope.protocol= 'App Protocal- '+filterParam.protocol+', ';
                }else{
                    $scope.protocol= 'App Protocal- '+ filterParam.protocol;
                }
                transactionDetailURL= transactionDetailURL+ "&protocol="+ filterParam.protocol;
            }
            if(angular.isDefined(filterParam.app)){
                transactionDetailURL= transactionDetailURL+ "&app="+ filterParam.app;
            }
            if(angular.isDefined(filterParam.url)){
                transactionDetailURL= transactionDetailURL+ "&url="+ filterParam.url;
            }
            if(angular.isDefined(filterParam.usage)){
                $scope.usageFilter= 'Usage '+filterParam.operator+" "+filterParam.usage+" "+filterParam.unit 
                transactionDetailURL= transactionDetailURL+ "&usage="+ usageValue;
            }
            
            transactionDetails(transactionDetailURL);
        }
        
    }
    
    function defaultLoad(currentTab){
        /*var userDataQueryName;
        if(checkIPorID($scope.customer.imsi)=='IP'){
            console.log("flag", 'IP');
            userDataQueryName = "User Account Details with IP BB&sourceip=";
        }else{
            userDataQueryName= "User Account Details BB&userip=";
        }
        
        headerdetailURL= globalConfig.pulldataurlbyname+userDataQueryName+$scope.customer.imsi;
        headerDetails(headerdetailURL);*/
       
        switch(currentTab){
            case 'usage':
                $scope.datepickerShow= true;
                usageDetailsURL= globalConfig.pulldataurlbyname+"Usage for selected userid&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
                
                usageDetails(usageDetailsURL);
                break;
            
            case 'app':
                $scope.datepickerShow= true;
                appwiseUsageDetailsURL= globalConfig.pulldataurlbyname+"App wise usage for selected userid&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
                
                hourlyAppwiseUsageURL= globalConfig.pulldataurlbyname+"Hourly App Usage for Customer&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
        
                appwiseUsageDetails(appwiseUsageDetailsURL );
                hourlyAppwiseUsageDetails(hourlyAppwiseUsageURL);
                break;
            
            case 'throughput':
                $scope.datepickerShow= true;
                throughputDetailsURL= globalConfig.pulldataurlbyname+"Customer Min wise Throughput&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
                
                throughputDetails(throughputDetailsURL);
                break;
            
            case 'transactionDetails':
                
                $scope.datepickerShow= true;
                $scope.selectMin.min= "00-09";
                $scope.select.hour= "00:00";
                $scope.hour= "00:00";
                transactionDetailsMakeURL();
                break;
            
            case 'usage30Days':
                $scope.datepickerShow= false;
                
                appDistributionlast30DaysURL= globalConfig.pullfilterdataurlbyname+'Customer App distribution for last 30 days&userid='+$scope.customer.imsi;
                
                usagelast30DaysURL= globalConfig.pullfilterdataurlbyname+'User usage last 30 days&userid='+$scope.customer.imsi;
                
                usagelast30Days(usagelast30DaysURL, appDistributionlast30DaysURL);
                break;
        }
    }
    
    console.log("param ", $stateParams.params.value);
    $scope.customer= {imsi: $stateParams.params.value};
    
    function checkIPorID(IPorID){
        var checkIP= [], index= -1, flag;
        for(var i=0; i<IPorID.length; i++){
        if(IPorID.charAt(i)== "."){
                checkIP[++index]= $scope.customer.ip.charAt(i);
            }
        }
        if(checkIP.length== "3"){
            flag= "IP";
        }
        else{
            flag= "ID";
        }
        return flag;
    }
    
    $scope.showUserDetails=true
    defaultLoad(currentTab);
    
    // Customer analytics date change event
    $scope.changeDate=function (modelName, newDate) {
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
        defaultLoad(currentTab);
     }
    
    //Customer analytics hour change event
    $scope.hourSelected= function(hour){
        
        $scope.selectMin.min= "00-09";
        if(hour != null ){
            if(hour < 10){
                $scope.hour= "0"+hour+":00";
            }
            else{
                $scope.hour= hour+":00";
            }
            $scope.select.hour= $scope.hour;
            //transactionDetailsMakeURL();
            
        }else{
            console.log("select.hour", $scope.select.hour);
            $scope.hour= $scope.select.hour;
        }
        
        transactionDetailsMakeURL();
    }
    
    //customer analytics min change event
    $scope.minSelected= function(){
        console.log("select.Min", $scope.selectMin.min);
        var min= $scope.selectMin.min.split( '-');
        console.log("min", min[0]);
        hour= $scope.select.hour.substring(0,3);
        console.log("hour", hour);
        $scope.hour= hour+min[0];
        transactionDetailsMakeURL()
    }
    
    // Filter Click event
    $scope.filterClicked= function(){
        
        // model window
        var modalInstance = $modal.open({
            templateUrl: 'views/static/modelFilterTransactionDetails.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope, $modalInstance, $timeout) {
            
            //Usage Dropdown
            $scope.filter= {};
            $scope.filter.operator= '>';
            $scope.filter.unit= 'Bytes';
            $scope.operator= [{'operator': '>'}, {'operator': '<'}, {'operator': '='}]
            $scope.unit= [{'unit': 'Bytes'}, {'unit': 'KB'}, {'unit': 'MB'}, {'unit': 'GB'}]
            
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            
            //save filter options
            $scope.saveFilterOption= function(filter){
                var operator, unit;
                $modalInstance.close();
                console.log("filter", filter);
                
                unit= filter.unit;
                operator= filter.operator;
                
                function getOperator(operator){
                    switch(operator){
                        case '<':
                            usageValue= usageValue+"&usageop=LT";
                            break;
                        
                        case '>':
                            usageValue= usageValue+"&usageop=GT";
                            break;
                        
                        case '=':
                            usageValue= usageValue+"&usageop=EQ";
                            break;
                    }
                }
                
                
                if(angular.isDefined(filter.usage)){
                    
                    usageValue= filter.usage;
                    
                    switch(unit){
                        case 'Bytes':
                            break;
                        
                        case 'KB':
                            usageValue= 1024*usageValue;
                            break;
                          
                        case 'MB':
                            usageValue= 1024*1024*usageValue;
                            break;
                        
                        case 'GB':
                            usageValue= 1024*1024*1024*usageValue;
                            break;
                        }
                    
                    getOperator(operator);
                }
              
                
                
                if(angular.isDefined(filter.protocol) || angular.isDefined(filter.usage)){
                    filteredTransactionDetails(filter);
                }
            }
        }
        
    }
    
    // Tab Selected click event
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad(tab);
    }
    
    //Submit customer imsi click event
    $scope.submit= function(){
        $scope.showUserDetails=true;
        defaultLoad(currentTab);
    }
    
    // Transaction Table Click event 
    $scope.transactionTableSelectedRow= function(key,model){
        console.log("key", key);
        // model window
        var modalInstance = $modal.open({
            templateUrl: 'views/static/modelVPSTransactionDetails.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope, $modalInstance, $timeout) {
            if(model=="vps"){
                $scope.vps= true;
            }
            if(model=="vpsVsAvgPktsSize"){
                $scope.vpsVsAvgPktsSize= true;
            }
            $scope.loadingDiv= true;
            $scope.vpsDataDiv= false;
            $scope.noDataDiv= false;
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            /*
            * volume per session
            */
            
            var vpsURL= globalConfig.clistenervps+key;/*"http://27.147.153.186:8080/JRServer/CListener?action=querysession&key="*/
            // console.log(scURL);
            $http.get(vpsURL).then(function (response) { 
                var objArray = response.data;
                //console.log("objArray.length", objArray.length);
                if(angular.isDefined(objArray.volpersec)){
                    //console.log("length:",objArray.volpersec);
                    $scope.startSsnTime= objArray.starttime;
                    $scope.endSsnTime= objArray.endtime;
                
                    $scope.loadingDiv= false;
                    $scope.vpsDataDiv= true;
                    $scope.noDataDiv= false;
                    //console.log("inside dataDiv")
                    var vpsData= [], pktsData= [], timeArray= [], vpsDataUsage= [];
                    for(var i=0; i<objArray.volpersec.length;i++){
                        vpsDataUsage[i]=  objArray.volpersec[i].volume;
                    }
                    var vpsFormattedUsageArray= dataFormatter.convertFixUnitUsageDataWoUnit(vpsDataUsage, 1)
                    //console.log("ksnsk", vpsFormattedUsageArray );
                    var xaxisArray= [], tickArray= [];
                    for(var i=0; i<objArray.volpersec.length;i++){
                        if(model=="vps"){
                            xaxisArray[i]= objArray.volpersec[i].timemmss;
                            vpsData[i]= [objArray.volpersec[i].timemmss, vpsFormattedUsageArray[0][i]]
                        } 
                        
                        if(model=="vpsVsAvgPktsSize"){
                            timeArray[i]= objArray.volpersec[i].timemmss;
                            vpsData[i]= parseFloat(vpsFormattedUsageArray[0][i]);
                            pktsData[i]= parseFloat((objArray.volpersec[i].volume/objArray.volpersec[i].pkts).toFixed(0));
                        }
                    }
                    
                    if(model=="vpsVsAvgPktsSize"){
                        console.log("vpsData", vpsData);
                        console.log("pktsData", pktsData);
                    
                        $scope.ChartConfig= {
                        options: {
                            chart: {
                                zoomType: 'xy'
                            },
                            title: {
                                text: ''
                            },
                            xAxis: {
                                categories: timeArray
                            },
                            yAxis: [{ // Primary yAxis
                                labels: {
                                    format: '{value}',
                                    style: {
                                        color: "#3D8EB9"
                                    }
                                },
                                title: {
                                    text: 'Avg. Packets Size',
                                    style: {
                                        color: "#3D8EB9"
                                    }
                                }
                            }, { // Secondary yAxis
                                title: {
                                    text: 'VPS('+vpsFormattedUsageArray[1]+")",
                                    style: {
                                    color: "#1abc9c"
                                    }
                                },
                                labels: {
                                    format: '{value}',
                                    style: {
                                    color: "#1abc9c"
                                    }
                                },
                                opposite: true
                            }],
                            credits: {
                                enabled: false
                            }
                        },

                        series: [{
                            name: 'VPS',
                            type: 'column',
                            yAxis: 1,
                            "color": "#1abc9c",
                            data: vpsData,
                            tooltip: {
                                valueSuffix: ' '+vpsFormattedUsageArray[1]
                            }

                        }, {
                            name: 'Avg. Packets Size',
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  pktsData,
                            tooltip: {
                                valueSuffix: ' B'
                            }
                        }]
                    };
                    }
                    
                    if(model=="vps"){
                        console.log("vpsData",vpsData );
                        $scope.flotChartData= [{
                            data: vpsData
                        }]
                        var vpsOptions= angular.copy(flotChartOptions.flotBarChartOptions);
                        var len ;
                        var unit= vpsFormattedUsageArray[1];
                        if((objArray.volpersec.length)>10){
                            len= Math.round(objArray.volpersec.length/10);
                        }else{
                            len= 0;
                        }
                        var index= -1, count= 0;
                        if(len!=0){
                            for(var i=0;i<xaxisArray.length;i= i+len){
                                tickArray[++index]= [++count, xaxisArray[i]];
                                   for(var l=0; l<len-1; l++){
                                        tickArray[++index]= [++count, ""];
                                    }
                               console.log("tickArrayInside",tickArray);
                            }
                            console.log("tickArray",tickArray);
                            vpsOptions.xaxis.ticks= tickArray;
                            vpsOptions.yaxis.axisLabel= "Usage("+unit+")";
                            $scope.flotBarOptions= vpsOptions 
                        }
                        else{
                            vpsOptions.yaxis.axisLabel= "Usage("+unit+")";
                            $scope.flotBarOptions= vpsOptions; 
                        }
                    }
                       
                }
                else{
                    $scope.loadingDiv= false;
                    $scope.vpsDataDiv= false;
                    $scope.noDataDiv= true;
                }
            });
        }
    }  
    
}
// End Customer Analytics Controller
//-----------------------------------------------------------------------------------


