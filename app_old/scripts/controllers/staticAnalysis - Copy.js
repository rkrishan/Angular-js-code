    /*'use strict';

angular.module('specta') 
    .controller('StaticAnalysisCtrl',function($scope, $stateParams, httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataval,flotChrtOptions) {
    
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
    .controller('cellAnalyticsCtrl',cellAnalyticsCtrl)
    .controller('highUsagePoorCEICtrl',highUsagePoorCEICtrl)
    .controller('CEICellAnalyticsCtrl',CEICellAnalyticsCtrl)
    .controller('cellUsageDistributionAnalyticsCtrl',cellUsageDistributionAnalyticsCtrl)
    .controller('deviceInsightsCtrl',deviceInsightsCtrl)
    .controller('appAnalyticsCtrl',appAnalyticsCtrl)
    .controller('browsingAnalyticsCtrl',browsingAnalyticsCtrl)
    .controller('userSegmentAnalyticsCtrl',userSegmentAnalyticsCtrl)
    .controller('PlanAnalyticsCtrl',PlanAnalyticsCtrl)
    .controller('CustomerAnalyticEnterIMSICtrl',CustomerAnalyticEnterIMSICtrl)
    .controller('appPerformanceCtrl',appPerformanceCtrl)
    .controller('userUniqueAnalyticsCtrl',userUniqueAnalyticsCtrl)
    .controller('CEIAnalyticsCtrl',CEIAnalyticsCtrl)
    .controller('smrtNtwrkCtrl',smrtNtwrkCtrl)
    .controller('handoverDistributionCtrl',handoverDistributionCtrl)
    .controller('assetUsageAnalyticsCtrl',assetUsageAnalyticsCtrl)
    .controller('revenueUpsideMatrixCtrl',revenueUpsideMatrixCtrl)
    .controller('nonDataSubUsersCtrl',nonDataSubUsersCtrl)
    .controller('roamingInsightsCtrl',roamingInsightsCtrl)
    .controller('dualSimAnalyticsCtrl',dualSimAnalyticsCtrl)
    .controller('cellCongestionAnalyticsCtrl',cellCongestionAnalyticsCtrl)
    .controller('cellOutageAnalyticsCtrl',cellOutageAnalyticsCtrl)
    .controller('strategicPlanningAnalyticsCtrl',strategicPlanningAnalyticsCtrl)
    .controller('strategicPlanningAnalytics1Ctrl',strategicPlanningAnalytics1Ctrl)
    .controller('appCEICtrl',appCEICtrl)
    .controller('appGrowthTrendCtrl',appGrowthTrendCtrl)
    .controller('aquisitionAnalyticsCtrl',aquisitionAnalyticsCtrl)
    .controller('videoAnalyticsCtrl',videoAnalyticsCtrl)
    .controller('browsingHabitAnalyticsCtrl',browsingHabitAnalyticsCtrl)
    .controller('CustomerAnalyticsCtrl',CustomerAnalyticsCtrl);
    
//    ----------------------------------------------------------------------------

// Static Analytics Controller
function staticAnalysisCtrl($scope, $stateParams, $state,dataFormatter, globalConfig, ChartService, filterService, httpService,globalData, dbService, $filter){
    ChartService.setCurrentPage(null);
    // console.log("globalConfig.depType", globalConfig.depType);
    // console.log("stateParams", $stateParams);
    if( $stateParams.id && $stateParams.id != '' ){
        var fields = JSON.stringify(['name', 'file']);
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query) +'&fields=' + encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});

        httpService.get(url).then(function (response){
            $scope.headerName = response.data[0].name;
            console.log("___________________________" + response.data[0].name)
            // $scope.headerName = $stateParams.params.Key +' : '+ $stateParams.params.value;

            $state.current.data.currentPage = response.data[0].name;
            // $scope.file = 'views/static/' + response.data[0].file;
            // globalConfig.depType == 'M'
            if(globalConfig.depType == 'F')
                $scope.file = 'views/fixedLine/' + response.data[0].file;
            else
                $scope.file = 'views/mobility/' + response.data[0].file;
        });

    }
    else if($stateParams.file){
        if($stateParams.name)
            $scope.headerName = $stateParams.params.clickableTooltip;
            // $scope.headerName = $stateParams.name;
        else
            $scope.headerName = 'Analytics';
        
        // $scope.file = 'views/static/' + $stateParams.file;
        if( globalConfig.depType== 'F')
            $scope.file = 'views/fixedLine/' + $stateParams.file;
        else
            $scope.file = 'views/mobility/' + $stateParams.file;
    }
    
    /*
    *   All Filter Options
    */
    $scope.treeLocation = false;
    $scope.treeRAT = false;
    $scope.treeSegment = false;
    $scope.treeDevice = false;

    var selKeysLocation= [], selKeysDevice= [], selKeysRAT= [], selKeysSegment= [], selLocationTitle= [], selDeviceTitle=[];
    
    $scope.filterGetParams= function(){
        // console.log("$scope.selLocationTitle", $scope.selLocationTitle);
        $scope.locationinfo= filterService.getLocationInfo($scope.selLocationTitle);
        $scope.ratinfo= filterService.getRATInfo($scope.selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo($scope.selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo($scope.selDeviceTitle);
        // console.log("$scope.selKeysLocation", $scope.selKeysLocation);
        return filterService.getParameter($scope.selKeysLocation, $scope.selKeysRAT, $scope.selKeysSegment, $scope.selKeysDevice);
    }
    
    //Loation Filter

    $scope.getLocationData= {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-expander", nodeIcon: ''},
        children: $scope.children,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
                   
            // Get a list of all selected nodes, and convert to a key array:
            $scope.selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                $scope.selectStatus= true;
                return node;
            });
            // console.log("$scope.selKeysLocation", $scope.selKeysLocation);
            var selLocation= filterService.getFilterData($scope.selKeysLocation);
            console.log("selLocation", selLocation)
            $scope.selKeysLocation= selLocation[0];
            $scope.selLocationTitle= selLocation[1];
            console.log("$scope.selLocationTitle", selLocation[1])
        },
        onClick: function(node, event){
            $scope.selectStatus= false;
            /*if(angular.isDefined(node.data.countryid) && !angular.isDefined(node.data.circleid) && node.childList == null ){
                var query = JSON.stringify({'countryid': node.data.countryid});
                var sort = JSON.stringify({ 'circle' : 1});
                var params = 'collection=lku_circle_list&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res) {
                    _.forEach(res.data, function(item){
                        item.title = item.circle;
                        item.key = item.circleid;
                    });
                    if($scope.selectStatus==false)
                    {
                        var child = $("#location").dynatree("getTree").getNodeByKey(node.data.key);
                        child.data.isFolder = true;
                        child.select(false);
                        child.addChild(res.data);
                        node.toggleExpand();
                    }
                });
            }
            else*/ if(angular.isDefined(node.data.circleid) && !angular.isDefined(node.data.cityid) && node.childList == null ){
                var query = JSON.stringify({'circleid': node.data.circleid});
                // var query = JSON.stringify({'circleid': node.data.countryid});
                var sort = JSON.stringify({ 'city' : 1});
                var params = 'collection=lku_city_list&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res) {
                    _.forEach(res.data, function(item){
                        item.title = item.city;
                        item.key = item.cityid;
                    });
                    if($scope.selectStatus==false)
                    {
                        var child =$("#location").dynatree("getTree").getNodeByKey(node.data.key);
                        child.data.isFolder = true;
                        child.select(false);
                        child.addChild(res.data);
                        node.toggleExpand();
                    }
                });
            }
            else if(angular.isDefined(node.data.cityid) && !angular.isDefined(node.data.areaid) && node.childList == null ){
                var query = JSON.stringify({'cityid': node.data.cityid});
                var sort = JSON.stringify({ 'area' : 1});
                var params = 'collection=lku_area_list&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res) {
                     _.forEach(res.data, function(item){
                         item.title = item.area;
                         item.key = item.areaid;
                     });
                    if($scope.selectStatus==false)
                    {
                        var child = $("#location").dynatree("getTree").getNodeByKey(node.data.key);
                        child.data.isFolder = true;
                        child.select(false);
                        child.addChild(res.data);
                        node.toggleExpand();
                    }
                });
            }
            else if(angular.isDefined(node.data.areaid) && !angular.isDefined(node.data.cellid) && node.childList == null ){
                var query = JSON.stringify({'area': node.data.areaid});
                var sort = JSON.stringify({ 'cellid' : 1});
                var params = 'collection=lku_cell_list&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res) {
                    _.forEach(res.data, function(item){
                        item.title = item.cellid;
                        item.key = item.cellid;
                    });
                    if($scope.selectStatus==false)
                    {
                        var child = $("#location").dynatree("getTree").getNodeByKey(node.data.key);
                        child.data.isFolder = true;
                        child.select(false);
                        var tmp = child.addChild(res.data);
                        tmp.data.addClass = 'location';
                        node.toggleExpand();
                        var test = $('.location').closest('ul').addClass('lastChild');
                        $('.lastChild').find('.dynatree-expander').removeClass('dynatree-expander').addClass('dynatree-connector');
                    }
                });
            }
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
    }

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
    // End Location Filter
       
    //RAT Filter
    var ratData = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    
    $scope.getRATData= {
        checkbox: true,
        selectMode: 3,
        children: ratData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            $scope.selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            console.log("rat: ",$scope.selKeysRAT);
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
    };

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
    //End RAT Filter
    
    //Segment Filter
    var segmentData =filterService.getSegments();
    
    $scope.getSegmentData= {
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            $scope.selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            })
            console.log("segment: ",$scope.selKeysSegment)
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
    //End Segment Filter
    
    //Device Filter
    $scope.getDeviceData= {
        checkbox: true,
        selectMode: 3,
        children: $scope.children,
        classNames: {connector: "dynatree-expander", nodeIcon: ''},
        onSelect: function(select, node) {
            // Display list of selected nodes
            var selNodes = node.tree.getSelectedNodes();
            // Get a list of all selected nodes, and convert to a key array:
            $scope.selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                $scope.selectStatus=true;
                return node;
            });
            var selDevice= filterService.getFilterData($scope.selKeysDevice);
            $scope.selKeysDevice= selDevice[0];
            $scope.selDeviceTitle= selDevice[1];
        },
        /*onClick: function(node, event){
            $scope.selectStatus=false;
            if(angular.isDefined(node.data.companyid) && angular.isDefined(node.data.parent) && node.childList == null ){
                 var query = JSON.stringify({'companyid': node.data.companyid});
                var sort = JSON.stringify({ 'model' : 1});
                var params = 'collection=lku_phone_model&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res) {
                    _.forEach(res.data, function(item){
                        item.title = item.model;
                        item.key = item.modelid;
                    });
                    if($scope.selectStatus==false){
                        var child = $("#device").dynatree("getTree").getNodeByKey(node.data.key);
                        child.data.isFolder = false;
                        child.select(false);
                        var tmp = child.addChild(res.data);
                        tmp.data.addClass = 'device';
                        node.toggleExpand();
                        var test = $('.device').closest('ul').addClass('lastChild');
                        $('.lastChild').find('.dynatree-expander').removeClass('dynatree-expander').addClass('dynatree-connector');
                    }
                });
            }
        },*/
        onDblClick: function(node, event) {
            node.toggleSelect();
        },
        onKeydown: function(node, event) {
            if( event.which == 32 ) {
                node.toggleSelect();
                return false;
            }
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
    //End Device Filter
    
    //DateRange Options
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');

    var fromDate= $filter('date')( new Date().getTime()- 7*24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime()- 24*3600*1000 , "yyyy-MM-dd");
    // fromDate= '2017-06-01'
    // toDate= '2017-06-30'
    // fromDate= '2016-08-07'
    // toDate= '2016-08-12'
    // $scope.dateSelect= '2016-08-12';
    $scope.dateSelect= toDate;
    $scope.date= {"start": fromDate, "end": toDate};
    //End DateRange Option

    /*
    *   End All Filter Options
    */

    //Simple JSON Export
    $scope.getSimpleJSONExport= function(exportObj, type,name, header){
        // console.log("export", header);
        name= name+"_"+new Date().getTime();
        var exportArray= [];
        for(var i in exportObj){
            var keys= Object.keys(exportObj[i]);
            var temp= {};
            for(var j in keys){
                if( !Array.isArray(exportObj[i][keys[j]])){
                    if(/Date/.test(keys[j]) || /Time/.test(keys[j])|| /date/.test(keys[j])){
                        temp[keys[j]]= $filter('date')( exportObj[i][keys[j]], "yyyy-MM-dd ",'UTC');
                        /*var getDate = new Date(exportObj[i][keys[j]]);
                        temp[keys[j]]= getDate.getUTCFullYear() + '-' +(getDate.getUTCMonth() + 1) + '-' +  getDate.getUTCDate() + ' '+getDate.getUTCHours()+ ':'+getDate.getUTCMinutes();*/
                        
                    }
                    else{
                        temp[keys[j]]= exportObj[i][keys[j]]
                    }
                }
            }
            for(var j in keys){
                if(Array.isArray(exportObj[i][keys[j]])){
                    
                    for(var k in exportObj[i][keys[j]]){
                        var dataKey= Object.keys(exportObj[i][keys[j]][k]);
                        for(var l in dataKey){
                            if(/Date/.test(dataKey[l]) || /Time/.test(dataKey[l])|| /date/.test(dataKey[l])){
                                /*var getDate = new Date(exportObj[i][keys[j]][k][dataKey[l]]);
                                temp[dataKey[l]]= getDate.getUTCFullYear() + '-' +(getDate.getUTCMonth() + 1) + '-' +  getDate.getUTCDate() + ' '+getDate.getUTCHours()+ ':'+getDate.getUTCMinutes();*/
                                temp[dataKey[l]]= $filter('date')( exportObj[i][keys[j]][k][dataKey[l]], "yyyy-MM-dd",'UTC');
                            }
                            else{
                                temp[dataKey[l]]= exportObj[i][keys[j]][k][dataKey[l]];
                            }
                        }
                        exportArray.push(angular.copy(temp))
                    }
                }
            }
        }
        //Export
        if(exportArray.length> 0){
            if(type == 'excel')
            alasql('SELECT * INTO XLS("'+name+'.xls",?) FROM ?',[ {headers:true,caption: {title:[header], style: 'font-size: 100px; color:green;'}},exportArray]);
            if(type == 'csv')
            alasql('SELECT * INTO CSV("'+name+'.csv",?) FROM ?',[{headers:true, separator:","},exportArray]);
            
        }else{
            for(var i in exportObj){
                var keys= Object.keys(exportObj[i]);
                for(var j in keys){
                    if(/Date/.test(keys[j]) || /Time/.test(keys[j])|| /date/.test(keys[j])){
                            // console.log("exportObj[i][keys[j]]", exportObj[i][keys[j]]);
                            exportObj[i][keys[j]]= $filter('date')( exportObj[i][keys[j]], "yyyy-MM-dd",'UTC');
                            /*var getDate = new Date(exportObj[i][keys[j]]);
                            exportObj[i][keys[j]]= getDate.getUTCFullYear() + '-' +(getDate.getUTCMonth() + 1) + '-' +  getDate.getUTCDate() + ' '+getDate.getUTCHours()+ ':'+getDate.getUTCMinutes();*/
                        }
                        else{
                            exportObj[i][keys[j]]= exportObj[i][keys[j]]
                        }
                }
            }

            if(type == 'excel')
                alasql('SELECT * INTO XLS("'+name+'.xls",?) FROM ?',[{headers:true,caption: {title:[header], style: 'font-size: 100px; color:green;'}},exportObj]);
            if(type == 'csv')
                alasql('SELECT * INTO CSV("'+name+'.csv",?) FROM ?',[{headers:true, separator:","},exportObj]);
        }
       
    }
    // End Simple JSON Export

    //Nested JSON Export
    $scope.getNestedJSONExport= function(exportObj, type,name){
    	var exportArray= [];
        for(var i in exportObj){
            var keys= Object.keys(exportObj[i]);
            var temp= {};
            for(var j in keys){
                if( !Array.isArray(exportObj[i][keys[j]])){
                    if(/Date/.test(keys[j])|| /date/.test(keys[j])|| /Time/.test(keys[j])){
                        temp[keys[j]]= $filter('date')( exportObj[i][keys[j]], "yyyy-MM-dd");
                        /*var getDate = new Date(exportObj[i][keys[j]]);
                        temp[keys[j]]= getDate.getUTCFullYear() + '-' +(getDate.getUTCMonth() + 1) + '-' +  getDate.getUTCDate() + ' '+getDate.getUTCHours()+ ':'+getDate.getUTCMinutes();*/
                    }
                    else{
                        temp[keys[j]]= exportObj[i][keys[j]]
                    }
                }
            }
            for(var j in keys){
                if(Array.isArray(exportObj[i][keys[j]])){
                    for(var k in exportObj[i][keys[j]]){
                        var dataKey= Object.keys(exportObj[i][keys[j]][k]);
                        for(var l in dataKey){
                            if(/Date/.test(dataKey[l])|| /date/.test(dataKey[l])|| /Time/.test(dataKey[l])){
                                /*var getDate = new Date(exportObj[i][keys[j]][k][dataKey[l]]);
                                temp[dataKey[l]]= getDate.getUTCFullYear() + '-' +(getDate.getUTCMonth() + 1) + '-' +  getDate.getUTCDate() + ' '+getDate.getUTCHours()+ ':'+getDate.getUTCMinutes();*/
                                temp[dataKey[l]]= $filter('date')( exportObj[i][keys[j]][k][dataKey[l]], "yyyy-MM-dd");
                            }
                            else{
                                temp[dataKey[l]]= exportObj[i][keys[j]][k][dataKey[l]];
                            }
                        }
                        exportArray.push(angular.copy(temp))
                    }
                }
            }
        }
        //var te=  [{a:1,b:1}, {a:2,b:2}, {a:3,b:3}];
        if(type == 'excel')
            alasql('SELECT * INTO XLSX("'+name+'.xls",?) FROM ?',[{headers:true,caption: {title:[name], style: 'font-size: 100px; color:green;'}},exportArray]);
        if(type == 'csv')
            alasql('SELECT * INTO CSV("'+name+'.csv",{headers:true, separator:","}) FROM ?',[exportArray]);
    }
    //End Nested JSON Export

    // Simple Export
    $scope.dataExport = function(component, type, name,header){
        // console.log("component", component);
        // console.log("type", type);
        // console.log("name", name);
        $scope.getSimpleJSONExport(component, type, name, header);
    }

    // Nested Export
    $scope.dataNestedExport = function(component, type, name){
        $scope.getNestedJSONExport(component, type, name);
    }

    //Map
    /*$scope.initLat= "28.6139";
    $scope.initLong= "77.2090";
    
    $scope.onClickMarker = function(marker, eventName, model) {
        model.show = !model.show;
    };

    $scope.getMapOption= {
        center: {
            latitude: $scope.initLat,
            longitude: $scope.initLong
        },
        options:{
            scrollwheel: false,
            // Style for Google Maps
            styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},{"saturation":40},{"lightness":10}]}],
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        control: {
            refresh: function(){}
        },
        zoom: 10,
        events:
        { 
            mouseover: function(marker, eventName, model)
            {   
                $scope.onClickMarker(marker, eventName, model);
            },
            mouseout: function(marker, eventName, model)
            {   
                $scope.onClickMarker(marker, eventName, model);
            }
        },
    };

    $scope.getMapData= function(stmtObj, callbackReturn){

        httpService.get(stmtObj.stmtName).then(function (response) {  
            // var objArray = response.data;
            var objArray = globalData.mapTestData;
            //console.log("objArray", objArray);
            $scope.highCountIndex= [], $scope.mediumCountIndex= [], $scope.lowCountIndex= [], $scope.mapData=[], $scope.circlesCEI= [];
            if(objArray.length>0){
                $scope.rawObjArray= angular.copy(objArray);

                for (var k = 0; k < objArray.length ; k++) {
                    
                    var colour;
                    if(objArray[k][stmtObj.keys] == 'Poor')
                    {
                        //colour= '#FF0000';
                        colour= 'images/tower_red.png';
                        $scope.highCountIndex.push(k);
                    }else if(objArray[k][stmtObj.keys] == 'Good')
                    {
                        //colour= "#FFC107";
                        colour= "images/tower_yellow.png";
                        $scope.mediumCountIndex.push(k);    
                    }else if(objArray[k][stmtObj.keys] == 'Excellent')
                    {
                        //colour= "#08B21F";
                        colour= "images/tower_green.png";
                        $scope.lowCountIndex.push(k);
                    }
                    $scope.mapData[k]= {
                        id: k,
                        latitude: objArray[k].latitude,
                        longitude: objArray[k].longitude,
                        title: objArray[k].Area+ ' (' + objArray[k].cellid +') ,'+stmtObj.keys+': '+ objArray[k][stmtObj.keys],
                        cellid: objArray[k].cellid,
                        icon: colour,
                        options:{visible:true}
                        //date: $scope.date.end,
                        //area: objArray[i].Area,
                    };
                }
                
            }else{
                $scope.mapData= [];
                $scope.rawObjArray= [];
            }
            callbackReturn({rawObjArray: $scope.rawObjArray,mapData: $scope.mapData});
        });
    }
    //Map legend click event
    $scope.getMapLegendClickData= function (state, indexArray, mapObject, callback){
        if(state== false){
            for(var k=0; k<mapObject.length; k++){
                var index= indexArray.indexOf(k);
                if( index != -1){
                    mapObject[k].options.visible= false;
                }
            }
        }
        else{
            for(var k=0; k < mapObject.length; k++){
                var index= indexArray.indexOf(k);
                if( index != -1){
                    mapObject[k].options.visible= true;
                }
            }
        }
        callback({res: mapObject});
    }*/

    // Line Plus Bar---- Highchart
    function getFormattedData(unit, dataArray){ 
        var tempDataArray= angular.copy(dataArray);
        var decimalPlaces= 2;   
        if(unit== 'Usage'){
            tempDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(dataArray, decimalPlaces);
        }
        else if( unit== 'Throughput'|| unit== 'BandWidth'){
            tempDataArray= dataFormatter.convertFixUnitThroughputDataWoUnit(dataArray, decimalPlaces);
        }else{
            tempDataArray= [angular.copy(dataArray),0];
        }
        return tempDataArray
    }
    $scope.getLinePlusBarData= function(stmtObj, callbackReturn){
        
        var lineData= [], barData= [], xLabelData= [], lineDataUnit= '', barDataUnit= '', rawData= [];
        httpService.get(stmtObj.stmtName).then(function(response){
            var objArray= response.data;
            
            // console.log("stmtObj", stmtObj);
            if(objArray.length>0){
                rawData= angular.copy(objArray);
                var lineArray= [], barArray= [];
                for(var i in objArray){
                    xLabelData[i]=  parseInt(objArray[i][stmtObj.xLabelKey]);
                    if(angular.isDefined(stmtObj.lineKey))
                        lineArray[i]= parseFloat(objArray[i][stmtObj.lineKey]);
                    if(angular.isDefined(stmtObj.barKey))
                        barArray[i]= objArray[i][stmtObj.barKey];
                }
                var tempLineData= getFormattedData(stmtObj.lineKey, lineArray);
                var tempBarData= getFormattedData(stmtObj.barKey, barArray);
                lineData= angular.copy(lineArray);
                lineDataUnit= '';
                barData= angular.copy(tempBarData[0]);
                barDataUnit= angular.copy(tempBarData[1]);
            }
            callbackReturn({xLabelData: xLabelData, lineData: lineData, lineDataUnit: lineDataUnit, barData: barData, barDataUnit: barDataUnit, rawData: rawData });
        })
    }
}
// End Static Analytics Controller
//    ----------------------------------------------------------------------------

// Top Device Analytics Controller
function deviceAnalyticsCtrl($scope, $state, httpService, globalConfig, $filter,  dataFormatter, flotChartOptions, locationFilterService, filterService, dbService) {
    
    var tzoffset= globalConfig.tzoffset;
    var filterParameters = "";
    var queryParam= null;
    //--------------------------------------------------------------
    //Filter Section
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    var fromDate= $filter('date')( new Date().getTime()- 24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime()- 24*3600*1000 , "yyyy-MM-dd");
    fromDate= fromDate.substring(0,8);
    fromDate= fromDate+"01"
    console.log("fromDate", fromDate);
    //$scope.date= {"start": fromDate, "end": toDate};
    
    
    /*
    *   Location Filter data
    */
    // var sort = JSON.stringify({ 'circle' : 1});
    var sort = JSON.stringify({ 'country' : 1});
    // var params = 'collection=lku_country_list&sort=' + encodeURIComponent(sort);
    // var params = 'collection=lku_country_list';
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        /*_.forEach(response.data, function(item){
            item.title = item.country;
                item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
                item.key = item.circleid;
        });
        if(response.data.length > 0)
            $scope.getLocationData.children = response.data;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
        
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
        
        filterParameters= $scope.filterGetParams();
        console.log("filterParameters",filterParameters)
        filterParameters=filterParameters+ "&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+queryParam;
         console.log("QueryParamsfilterParameters",filterParameters)
        
        topHandsetby_count_usage();
        topHandsetby_avg_usage();
    }
    
    //End of Filter Section
    //--------------------------------------------------------------
    
    
    
    function makeStatementUrl(statement){
        var temp= $scope.filterGetParams()
        var newstatement=  statement+temp+ "&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";
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
        filterParameters= $scope.filterGetParams();
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
        /*flotPieOptions.tooltipOpts= {
            content: "%y.0, %s", // show value to 0 decimals
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        };*/
        
        var colorpaletteCount = ["#FF6600", "#FF7600", "#FF8600", "#FF9600", 
                        "#FFA600", "#FFB600", "#FFC600", "#FFD600" , 
                        "#FFE600", "#FFF600", "#FF7F7F", "#FF8F7F","#FF9F7F"];
        var colorpaletteUsage = ["#0094FF", "#00A4FF", "#00B4FF", "#00C4FF", 
                        "#00D4FF", "#00E4FF", "#00F4FF", "#0104FF" , 
                        "#0124FF", "#0144FF", "#0164FF", "#0184FF","#01A4FF"];
        
        $scope.flotPieOptions = flotPieOptions;
        
        var statementName= 'Handset wise Count and Traffic for table and Pie chart';
        var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(statementName);
        httpService.get(url).then(function (response) {
            //console.log(response.data)
            var objArray = response.data;
            var chartDataCount = [];
            var chartDataTraffic = [];
            var legendDataCount= [];
            var legendDataTraffic= [];
            if(objArray.length>0){
                $scope.exportHandsetCountData= [];
                $scope.exportHandsetUsageData= [];
                var handsetCountExportData= [], handsetUsageExportData= [];
                for (var i = 0; i < 10; i++) {
                    handsetCountExportData[i]= {Device: objArray[i].Device, Count: objArray[i].countDevice};

                    handsetUsageExportData[i]= {Device: objArray[i].Device, Usage: objArray[i].Traffic};

                    chartDataCount[i] = new flotPieDataElement(objArray[i].Device,objArray[i].countDevice,colorpaletteCount[i]);

                    chartDataTraffic[i] = new flotPieDataElement(objArray[i].Device,objArray[i].Traffic,colorpaletteUsage[i]);

                    legendDataCount[i] = new flotPieDataElement(objArray[i].Device,dataFormatter.formatCountData(objArray[i].countDevice, 3),colorpaletteCount[i]);

                    legendDataTraffic[i] = new flotPieDataElement(objArray[i].Device,dataFormatter.formatUsageData(objArray[i].Traffic,2),colorpaletteUsage[i]);
                }
                $scope.exportHandsetCountData= angular.copy(handsetCountExportData);
                $scope.exportHandsetUsageData= angular.copy(handsetUsageExportData);
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
        httpService.get(url).then(function (response) {
            //console.log(response.data)
            var objArray = response.data;
            var chartDataAvgTraffic = [];
            var legendDataAvgTraffic= [];
            $scope.exportHandsetAvgTrafficData= [];
            if(objArray.length>0){
                var handsetAvgTrafficExportData= [];
                for (var i = 0; i < 10; i++) {
                    handsetAvgTrafficExportData[i]= {Device: objArray[i].Device, "Avg.Traffic": objArray[i].Traffic}
                    chartDataAvgTraffic[i] = new flotPieDataElement(objArray[i].Device,objArray[i].Traffic,colorpaletteAvgUsage[i]);
                    legendDataAvgTraffic[i] = new flotPieDataElement(objArray[i].Device,dataFormatter.formatUsageData(objArray[i].Traffic,3),colorpaletteAvgUsage[i]);
                }
                $scope.exportHandsetAvgTrafficData= angular.copy(handsetAvgTrafficExportData);
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
// End Top Device Analytics Controller
//    ----------------------------------------------------------------------------

// Cell Analytics Controller
function cellAnalyticsCtrl($ocLazyLoad, $scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, locationFilterService, $sce, filterService,dbService, $uibModal, $state, globalData) {
    console.log("child controller");
    /*uiGmapIsReady,IsReady---IsReady.promise().then(function (maps) {
        google.maps.event.trigger(maps[0].mapUsage, 'resize');
    });*/
                
    /*$ocLazyLoad.load({
        name: 'uiGmapgoogle-maps',
        series: true,
        files: [
            {type: 'js', path: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4&v=3.exp&libraries=placeses,visualization,drawing,geometry,places'},
            'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
            'bower_components/angular-google-maps/dist/angular-google-maps.js'
        ]
    }).then(function(uiGmapGoogleMapApi){ });*/
        $scope.insideLazyLoad= true
        var initLatCount= "28.6139" ;
        var initLongCount= "77.2090";
        var initLatUsage= "28.6139";
        var initLongUsage= "77.2090";
        var initLatCEI= "28.6139";
        var initLongCEI= "77.2090";
        var filterParameters = "";
        var heatLayerObjCount;
        var heatLayerObjUsage;
        var currentTab= 'penetrationDistribution';
        var mapCountURL, mapUsageURL;
        $scope.popover= {};
        
        $scope.dynamicPopover = {
            unitUsage: 'Bytes',
            fromUsage:'0',
            toUsage:null,
            fromCount:'0',
            unitCount:'Unit',
            toCount:null
        };
        
        $scope.rowCount= '100';
        var snip= $scope.Snip;
        var load= "<span class='text-info'><b>Loading...</b></span>";
        $scope.loading= {};
        $scope.loading.snip= $sce.trustAsHtml(snip);
        $scope.loading.load= $sce.trustAsHtml(load);
        
        function getBytes(usageValue, unit){
            var usage;
            console.log("usageValue", usageValue);
            if(usageValue>=0 && usageValue!=null){
                if(unit != "Bytes"){
                    switch(unit){
                        case 'GB':
                            usage= Math.pow(2,30)*usageValue;
                            break;
                        case 'MB':
                            usage= Math.pow(2,20)*usageValue;
                            break;
                        case 'KB':
                            usage= Math.pow(2,10)*usageValue;
                            break;
                    }
                }else{
                    usage= usageValue;
                }
                return usage;
            }
		}
        
        function getCount(countValue,unit){
            var count; 
            if(countValue>=0 && countValue!=null){
                if(unit != "Unit"){
                    switch(unit){
                        case 'K':
                            count= Math.pow(10,3)*countValue;
                            break;
                        case 'M':
                            count= Math.pow(10,6)*countValue;
                            break;
                    }
                }else{
                    count= countValue;
                }
                return count;
            }
        }
        
        function getAdvanceFilterParam(fromValue, toValue,label){
            var paramAdvanceFilter= [];
            if(angular.isDefined(fromValue)){
                paramAdvanceFilter.push('{'+label+': {$gte:'+fromValue+'}}');
            }
            if(angular.isDefined(toValue)){
                paramAdvanceFilter.push('{'+label+': {$lt:'+toValue+'}}');
            }
            return paramAdvanceFilter;
        }
        
        $scope.saveFilterOption= function(filter){
            console.log("$scope.filter", filter);
            var unitUsage= filter.unitUsage;
            var unitCount= filter.unitCount;
            var fromUsage, toUsage, fromCount, toCount;
            var paramAdvanceFilterCount, paramAdvanceFilterUsage, paramAdvanceFilter;
            
            fromUsage= getBytes(filter.fromUsage, unitUsage);
            toUsage= getBytes(filter.toUsage, unitUsage);
            
            fromCount= getCount(filter.fromCount, unitCount);
            toCount= getCount(filter.toCount, unitCount);
            
            paramAdvanceFilterCount= getAdvanceFilterParam(fromCount, toCount, 'Count');
            paramAdvanceFilterUsage= getAdvanceFilterParam(fromUsage, toUsage, 'Usage');
            
            if(paramAdvanceFilterCount.length>0){
                paramAdvanceFilter= paramAdvanceFilterCount;
            }
            if(paramAdvanceFilterUsage.length>0){
                if(paramAdvanceFilterCount.length>0){
                    paramAdvanceFilter= paramAdvanceFilter+','+paramAdvanceFilterUsage;
                }else{
                    paramAdvanceFilter= paramAdvanceFilterUsage;
                }
            }
            
                
            //var mapAdvanceFilterURL= globalConfig.pullfilterdataurlbyname+"Heat map for Usage Count Advance Filter"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&advancedFilter="+paramAdvanceFilter;
            
            var mapAdvanceFilterURL= globalConfig.pullfilterdataurlbyname+"Heat map for Device Usage"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&advancedFilter="+encodeURIComponent(paramAdvanceFilter)+"&rowCount="+$scope.rowCount;
            // console.log("paramAdvanceFilter", paramAdvanceFilterCount);
            // console.log("paramAdvanceFilterUsage", paramAdvanceFilterUsage);
            
            //mapCount(mapAdvanceFilterURL);
            mapUsage(mapAdvanceFilterURL);
        }
        
       //--------------------------------------------------------------
        //Filter Section
        
        //var selKeysLocation= ["404.7"], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], selLocationTitle= [], selDeviceTitle=[];
        var queryParam; 
        
        $scope.treeLocation= false;
        $scope.treeRAT= false;
        $scope.treeSegment= false;
        $scope.treeDevice= false;
        
        
        //datatable option
        $scope.cellUserDistribution= {
            "aaSorting": [4]
        };
        $scope.cityPenTblOpt= {
            "aaSorting": [1]
        };
        
        /*
        *   Location Filter data
        */
        var sort = JSON.stringify({ 'circle' : 1});
        var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

            /*_.forEach(response.data, function(item){
                item.title = item.country;
                item.key = item.countryid;
            });*/
            _.forEach(response.data, function(item){
            	item.title = item.circle;
                item.key = item.circleid;
        	});
            $scope.getLocationData.children = response.data;
            var selectStatus= false;
            $("#location").dynatree(angular.copy($scope.getLocationData))
        })
        
        /*
        *   RAT Filter data
        */
        $("#rat").dynatree(angular.copy($scope.getRATData));
        
        /*
        *   Segment Filter data
        */
        $("#segment").dynatree(angular.copy($scope.getSegmentData))
         
        /*
        *   Device Filter data
        */
        
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
            $scope.getDeviceData.children = response.data;
            var selectStatus=false;
            _.forEach(response.data, function(item){
                item.title = item.make;
                item.key = item.makeid;
                item.parent = 1;
            });
            //console.log("data: ", deviceData)
            $("#device").dynatree(angular.copy($scope.getDeviceData))
        })
            
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
            if ($scope.treeRAT){
                $scope.treeRAT = false;
            }
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
        
        // for Count tab
        $scope.mapCount = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapCount(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv= true;
            $scope.noDataCountMapCircleDiv= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapCount.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                // var objArray = globalData.map_bsnl_Data;
                 
                if(objArray.length>0){
                    $scope.highest= objArray[0].Count;
                    $scope.medium= ($scope.highest/2).toFixed(0);
                    $scope.low= ($scope.highest/3).toFixed(0);

                    var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        var colour;
                        if(objArray[i].Count >= $scope.highest/2)
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Count < ($scope.highest/2) && objArray[i].Count >= ($scope.highest/3))
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Count < ($scope.highest/3))
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: objArray[i].Area+ ' (' + objArray[i].cellid +') , Count: '+ objArray[i].Count,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            area: objArray[i].Area,
                            icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCount= mapcount;
                    
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= false;
                }else{
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        $scope.getMapLegendClickData= function (state, indexArray, mapObject){
            if(state== false){
                for(var k=0; k<mapObject.length; k++){
                    var index= indexArray.indexOf(k);
                    if( index != -1){
                        mapObject[k].options.visible= false;
                    }
                }
            }
            else{
                for(var k=0; k<mapObject.length; k++){
                    var index= indexArray.indexOf(k);
                    if( index != -1){
                        mapObject[k].options.visible= true;
                    }
                }
            }
            return mapObject;
        }

        $scope.checkboxHighCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, highCountIndex, mapObject);
        }
        $scope.checkboxMediumCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, mediumCountIndex, mapObject);
        }
        $scope.checkboxLowCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, lowCountIndex, mapObject);
        }
        
        // City Penetration Tab
        function cityPenetrationTab(urlTable){
        	$scope.loadingCityPenetrationDiv= true;
            $scope.dataCityPenetrationDiv= false;
            $scope.noDataCityPenetrationDiv= false;

        	httpService.get(urlTable).then(function (response) {
            	var objArray= response.data; 
            	
            	if(objArray.length>0){
        			$scope.cityPenetrationTable= angular.copy(objArray); 
	            	$scope.exportCityPenetrationTable= angular.copy(objArray); 
	            	
	            	$scope.loadingCityPenetrationDiv= false;
		            $scope.dataCityPenetrationDiv= true;
		            $scope.noDataCityPenetrationDiv= false;
		        }else{
		        	$scope.loadingCityPenetrationDiv= false;
		            $scope.dataCityPenetrationDiv= false;
		            $scope.noDataCityPenetrationDiv= true;
		        }
            });
        }

        // for Usage tab
        $scope.mapUsage = {
            
            center: {
                latitude: initLatUsage,
                longitude: initLongUsage
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},   {"saturation":40},{"lightness":10}]}],
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            zoom: 10,
            control: {
                refresh: function(){}
            },
            events:{
                /*click: function(marker, eventName, model)
                {   
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            size:{
                height: 800
            }
        };

        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetUsage= {};
        $scope.circlesUsage= [];
        var highUsageIndex= [], mediumUsageIndex= [], lowUsageIndex= [];

        function mapUsage(url){
            highUsageIndex= [], mediumUsageIndex= [], lowUsageIndex= [];
            $scope.loadingUsageMapCircleDiv= true;
            $scope.noDataUsageMapCircleDiv= false;

            $scope.checkboxUsageHighStatus= true;
            $scope.checkboxUsageMediumStatus= true;
            $scope.checkboxUsageLowStatus= true;

            $scope.circlesUsage= [];
            $scope.mapUsage.control.refresh({latitude: initLatUsage, longitude: initLongUsage});
            httpService.get(url).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    $scope.datasetUsage= angular.copy(objArray);
                    
                    
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        $scope.highestUsage= dataFormatter.formatUsageData(objArray[0].Usage,0);
                        $scope.mediumUsage= dataFormatter.formatUsageData((objArray[0].Usage/2),0);
                        $scope.lowUsage= dataFormatter.formatUsageData((objArray[0].Usage/3),0);

                        var medium= (objArray[0].Usage/2).toFixed(0);
                        var low= (objArray[0].Usage/3).toFixed(0);
                        var colour;
                        if(objArray[i].Usage >= medium)
                        {
                            //colour= '#FF0000';
                            colour= 'images/tower_red.png';
                            highUsageIndex.push(i);
                        }else if(objArray[i].Usage < medium && objArray[i].Usage >= low)
                        {
                            //colour= "#FFC107";
                            colour= "images/tower_yellow.png";
                            mediumUsageIndex.push(i);    
                        }else if(objArray[i].Usage < low)
                        {
                            //colour= "#08B21F";
                            colour= "images/tower_green.png";
                            lowUsageIndex.push(i);
                        }
                        
                        mapcount[i]={

                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: objArray[i].Area+ ' (' + objArray[i].cellid +') , Usage: '+ dataFormatter.formatUsageData(objArray[i].Usage,2),
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            area: objArray[i].Area,
                            icon: colour,
                            options:{visible:true}
                        }
                    }
                    
                    $scope.circlesUsage= angular.copy(mapcount);
                    
                    for(var i=0; i<objArray.length; i++){
                        objArray[i].Usage= dataFormatter.formatUsageData(objArray[i].Usage,2);
                    }
                    var datasetUsageTable= [];
                    for(var i=0; i< value; i++ ){
                        datasetUsageTable[i]= objArray[i];
                    }
                    $scope.datasetUsageTable= datasetUsageTable;

                    $scope.loadingUsageMapCircleDiv= false;
                    $scope.noDataUsageMapCircleDiv= false;
                }else{
                    $scope.loadingUsageMapCircleDiv= false;
                    $scope.noDataUsageMapCircleDiv= true;
                    $scope.circlesUsage= [];
                }
                
                  
            }); 
        }
        
        $scope.checkboxHighUsageStateChange= function(state){
            var mapObject= angular.copy($scope.circlesUsage);
            $scope.circlesUsage= $scope.getMapLegendClickData(state, highUsageIndex, mapObject);
        }
        $scope.checkboxMediumUsageStateChange= function(state){
            var mapObject= angular.copy($scope.circlesUsage);
            $scope.circlesUsage= $scope.getMapLegendClickData(state, mediumUsageIndex, mapObject)
        }
        $scope.checkboxLowUsageStateChange= function(state){
            var mapObject= angular.copy($scope.circlesUsage);
            $scope.circlesUsage= $scope.getMapLegendClickData(state, lowUsageIndex, mapObject);
        }

        // for CEI tab

        $scope.mapCEI = {
            center: {
                latitude: initLatCEI,
                longitude: initLongCEI
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            control: {
                refresh: function(){}
            },
            zoom: 10,
            size:{
                height: '800px'
            },
            events:
            { 
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onClick(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onClick(marker, eventName, model);
                }
            },
            
        };
        
        function mapCEI(url){
            $scope.loadingCEIMapCircleDiv= true;
            $scope.noDataCEIMapCircleDiv= false;
            
            $scope.mapCEI.control.refresh({latitude: initLatCEI, longitude: initLongCEI}); 
            
            httpService.get(url).then(function (response) {  
                var objArray = response.data;
                //console.log("objArray", objArray);
                if(objArray.length>0){
                    $scope.datasetCEI= angular.copy(objArray);

                    var mapCEI= [];
                    for (var k = 0; k < 100 ; k++) {
                        
                        mapCEI[k]= {
                            id: k,
                            latitude: objArray[k].latitude,
                            longitude: objArray[k].longitude,
                            title: objArray[k].Area+ ' (' + objArray[k].cellid +') , CEI: '+ objArray[k].CEI,
                            cellid: objArray[k].cellid,
                            //date: $scope.date.end,
                            //area: objArray[i].Area,
                        }
                    }
                    
                    $scope.circlesCEI= angular.copy(mapCEI);
                    
                    $scope.loadingCEIMapCircleDiv= false;
                    $scope.noDataCEIMapCircleDiv= false;
                }else{
                    $scope.loadingCEIMapCircleDiv= false;
                    $scope.noDataCEIMapCircleDiv= true;
                    $scope.circlesCEI= [];
                }
                
                  
            }); 
        }

        $scope.selKeysLocation= ["404.7"];
        $scope.selLocationTitle= ["Delhi"];
        //console.log('$scope.selLocationTitle', $scope.selLocationTitle);
        
        function defaultLoad(){
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
            
            //console.log('inside Default', $scope.selLocationTitle);
        
            filterParameters= $scope.filterGetParams();
            
            switch(currentTab){
                case 'penetrationDistribution':
                    if(/&device=/.test(filterParameters)){
                        mapCountURL= globalConfig.pullfilterdataurlbyname+"Cell wise User Penetration with Device Filter"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&rowCount="+$scope.rowCount;

                    }else{
                        mapCountURL= globalConfig.pullfilterdataurlbyname+"Heat Map Handset wise Count"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&rowCount="+$scope.rowCount;
                    }
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapCount(mapCountURL);
                    break;
                /*case 'penetrationDistribution':
                    mapCountURL= 'http://10.0.0.15:8080/JRServer/MListener?action=filterquery&name=Heat%20map%20for%20Circle%20wise%20top%2030%20cells';
                    mapCount(mapCountURL);
                    break;*/
                case 'usageDistribution':
                    mapUsageURL= globalConfig.pullfilterdataurlbyname+"Heat map for Device Usage"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&rowCount="+$scope.rowCount+"&advancedFilter={Count: {$lt:100}},{Usage: {$lt:1073741824}}";
                    highUsageIndex= []; mediumUsageIndex= []; lowUsageIndex= [];
                    //mapUsage(mapUsageURL);
                    $scope.saveFilterOption($scope.dynamicPopover);
                    break;
                case 'cityPenetration':
                    var cityPenetrationTableURL= globalConfig.pullfilterdataurlbyname+"City wise Unique User Count"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                    cityPenetrationTab(cityPenetrationTableURL);
                    break;
                case 'ceiDistribution':
                    var mapCEIURL= globalConfig.pullfilterdataurlbyname+"CellId CEI Mapping"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&rowCount="+$scope.rowCount;
                    //mapCEI(mapCEIURL);
                    
                    break;
            }
        }
        
        defaultLoad();
        
        // Submit Click event
        $scope.click= function(){
            defaultLoad();
        }
        
        // Change Top Cell Count
        $scope.chngTopCellCount= function(cellCount){
        	$scope.rowCount= cellCount;
            defaultLoad();
        }
        
        //change Date event
        $scope.changeDate=function (modelName, newDate) {
            $scope.date.end= newDate.format("YYYY-MM-DD");
        }
        //Tab selected event
        $scope.tabSelected= function(tab){
            currentTab= tab;
            defaultLoad();
        }
        
        // Table Export Event
        $scope.dataTableExport = function(component, type, name){
            $scope.getSimpleJSONExport(component, type, name);
        }
}
// End Cell Analytics Controller
//    ----------------------------------------------------------------------------

// High Usage Poor CEI Analytics Controller
function highUsagePoorCEICtrl($ocLazyLoad, $scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, locationFilterService, $sce, filterService,dbService, $uibModal, $state, highchartOptions) {
    var initLatPoorCEI= "28.6139" ;
    var initLongPoorCEI= "77.2090";
    var filterParameters = "";
    var currentTab= 'heatZonesPoorCEI';
    var mapPoorCEIURL, deviceAffectedPoorCEIURL, segmentAffectedPoorCEIURL, usageParam= 30*1024*1024;
    $scope.popover= {} ;
    
    $scope.dynamicPopover = {
        unitUsage: 'GB',
        fromUsage:'5',
    };
    
    var snip= $scope.Snip;
    var load= "<span class='text-info'><b>Loading...</b></span>";
    $scope.loading= {};
    $scope.loading.snip= $sce.trustAsHtml(snip);
    $scope.loading.load= $sce.trustAsHtml(load);
    
    function getBytes(usageValue, unit){
        var usage;
        if(usageValue>0){
            if(unit != "Bytes"){
                switch(unit){
                    case 'GB':
                        usage= Math.pow(2,30)*usageValue;
                        break;
                    case 'MB':
                        usage= Math.pow(2,20)*usageValue;
                        break;
                    case 'KB':
                        usage= Math.pow(2,10)*usageValue;
                        break;
                }
            }else{
                usage= usageValue;
            }
            return usage;
        }
    }
    
    function getAdvanceFilterParam(fromValue, label){
        var paramAdvanceFilter= [];
        if(angular.isDefined(fromValue)){
            paramAdvanceFilter.push('&'+label+'='+fromValue);
        }
        return paramAdvanceFilter;
    }
    
    $scope.saveFilterOption= function(filter){
        var unitUsage= filter.unitUsage;
        var fromUsage;
        var paramAdvanceFilterUsage, paramAdvanceFilter;
        
        fromUsage= getBytes(filter.fromUsage, unitUsage);
        usageParam= fromUsage;

        //paramAdvanceFilterUsage= getAdvanceFilterParam(fromUsage, 'Usage');
        
        //if(paramAdvanceFilterUsage.length>0){
        //    paramAdvanceFilter= paramAdvanceFilterUsage;
        //}
        
        defaultLoad();
        //var mapAdvanceFilterPoorCEIURL= globalConfig.pullfilterdataurlbyname+"High Usage Poor CEI"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+paramAdvanceFilter;
        
        //mapHeatZonesPoorCEI(mapAdvanceFilterPoorCEIURL);
    }
    
   //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    
    //datepicker options
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    $scope.date= {"start":'2017-06-26',"end": '2017-06-30'};
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'circle' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
         _.forEach(response.data, function(item){
            item.title = item.circle;
                item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData))
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.company;
            item.key = item.companyid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
        
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
        if ($scope.treeRAT){
            $scope.treeRAT = false;
        }
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
    
    // for Map Heat Zones Poor CEI tab
    $scope.mapHeatZonesPoorCEI = {
        center: {
            latitude: initLatPoorCEI,
            longitude: initLongPoorCEI
        },
        options:{
            scrollwheel: false,
            // Style for Google Maps
            styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        },
        control: {
            refresh: function(){}
        },
        zoom: 10,
        size:{
            height: '800px'
        },
        events:
        { 
            mouseover: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            },
            mouseout: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            }
        },
        
    };
    
    $scope.onHover = function(marker, eventName, model) {
        model.show = !model.show;
    };

    $scope.datasetPoorCEITable= {};
    $scope.markersPoorCEI= []; 
    
    function bar_highchart_day_count(url){
        var appDistributionBarChartOptions= {};
        
        $scope.loadingDeviceAffectedDiv = true;
        $scope.dataDeviceAffectedDiv= false;
        $scope.noDatadeviceAffectedDiv= false;
        
        httpService.get(url).then(function(response){
            var appWiseLabelArray= [], appWiseLatencyData= [];
            var objArray= response.data;
            $scope.exportAppDistribution= [];
            if(objArray.length>0){
                //for bar chart data
                
                for(var i=0; i<objArray.length; i++){
                    appWiseLabelArray[i]= objArray[i]['Date'];
                    appWiseLatencyData[i]= objArray[i].Cells;
                }

                var appDistributionBarChartOptions= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);

                appDistributionBarChartOptions.xAxis.categories= angular.copy(appWiseLabelArray);

                // appDistributionBarChartOptions.tooltip.pointFormat= 'Latency<b> {point.y:.2f} ms';

                // appDistributionBarChartOptions.yAxis.title.text= "Latency(ms)";
                appDistributionBarChartOptions.xAxis.labels.format= "{value: %e %b}";

                $scope.deviceAffectedBarChartConfig= 
                    {
                    "options" : appDistributionBarChartOptions,
                    "series": [{
                        name: "Overall CEI Count",
                        color: "rgb(39, 174, 96)",
                        data: appWiseLatencyData
                    }]
                }
                $scope.datasetCountTable= angular.copy(objArray)
                  
                $scope.loadingDeviceAffectedDiv = false;
                $scope.dataDeviceAffectedDiv= true;
                $scope.noDatadeviceAffectedDiv= false;
            }else{
                $scope.loadingDeviceAffectedDiv = false;
                $scope.dataDeviceAffectedDiv= false;
                $scope.noDatadeviceAffectedDiv= true;
            }
        })
    }
    
    function bar_highchart_label_count(url){
            var appDistributionBarChartOptions= {};
            
            $scope.loadingSegmentAffectedDiv = true;
            $scope.dataSegmentAffectedDiv= false;
            $scope.noDataSegmentAffectedDiv= false;
            
            httpService.get(url).then(function(response){
                var appWiseLabelArray= [], appWiseLatencyData= [];
                var objArray= response.data;
                $scope.datasetCountTable1= [];
                if(objArray.length>0){
                    //for bar chart data
                    
                    for(var i=0; i<objArray.length; i++){
                        appWiseLabelArray[i]= objArray[i]['City'];
                        appWiseLatencyData[i]= objArray[i].Cells;
                    }

                    var appDistributionBarChartOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);

                    appDistributionBarChartOptions.xAxis.categories= angular.copy(appWiseLabelArray);

                    // appDistributionBarChartOptions.tooltip.pointFormat= 'Latency<b> {point.y:.2f} ms';

                    // appDistributionBarChartOptions.yAxis.title.text= "Latency(ms)";
                    // appDistributionBarChartOptions.xAxis.labels.format= "{value: %e %b}";

                    $scope.segmentAffectedBarChartConfig= 
                        {
                        "options" : appDistributionBarChartOptions,
                        "series": [{
                            name: "City wise CEI",
                            color: "rgb(39, 174, 96)",
                            data: appWiseLatencyData
                        }]
                    }
                    $scope.datasetCountTable1= angular.copy(objArray)
                      
                    $scope.loadingSegmentAffectedDiv = false;
                    $scope.dataSegmentAffectedDiv= true;
                    $scope.noDataSegmentAffectedDiv= false;
                }else{
                     $scope.loadingSegmentAffectedDiv = false;
                    $scope.dataSegmentAffectedDiv= false;
                    $scope.noDataSegmentAffectedDiv= true;
                }
            })
        }

    function mapHeatZonesPoorCEI(url){
        $scope.loadingPoorCEIMapMarkersDiv= true;
        $scope.noDataPoorCEIMapMarkersDiv= false;

        $scope.usageLabel= $scope.dynamicPopover.fromUsage+$scope.dynamicPopover.unitUsage;
        
        $scope.markersPoorCEI= [];
        $timeout(function() {
            $scope.mapHeatZonesPoorCEI.control.refresh({latitude: initLatPoorCEI, longitude: initLongPoorCEI});
        }, 500);
        
        httpService.get(url).then(function (response) {  
            var objArray = response.data;
            console.log('objArray length', objArray.length);
            if(objArray.length>0){
                
                /*httpService.get(globalConfig.pullfilterdataurlbyname+"Device affected by High Usage Poor CEI"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+'&Usage='+usageParam).then(function (response) { 
                    var deviceResArray= response.data;
                    console.log('deviceResArray length', deviceResArray.length);
                    for(var i in objArray){
                        objArray[i].Device= deviceResArray[i].Device;
                    }*/
               
                // console.log('objArray', objArray);
                var datasetPoorCEITable= [];
                for(var i=0; i< objArray.length; i++ ){
                    datasetPoorCEITable[i]= objArray[i];
                }
                $scope.datasetPoorCEITable= datasetPoorCEITable;
                var value= objArray.length;
                
                var mapPoorCEI= [];
                for (var i = 0; i < value; i++) {
                    
                    mapPoorCEI[i]= {
                        id: i,
                        latitude: objArray[i].latitude,
                        longitude: objArray[i].longitude,
                        title: objArray[i].Area+ ' (' + objArray[i].cellid +') , Usage: '+ dataFormatter.formatUsageData(objArray[i].Usage,2),
                        date: $scope.date.end,
                        area: objArray[i].Area,
                        icon: 'images/tower_red.png',
                        options:{visible:true}
                    }
                }
                
                $scope.markersPoorCEI= mapPoorCEI;
                
                $scope.loadingPoorCEIMapMarkersDiv= false;
                $scope.noDataPoorCEIMapMarkersDiv= false;
                 // })
            }else{
                $scope.loadingPoorCEIMapMarkersDiv= false;
                $scope.noDataPoorCEIMapMarkersDiv= true;
                $scope.markersPoorCEI= [];
                $scope.datasetPoorCEITable= {};
            }
        }); 
    }
    
    $scope.selKeysLocation= ["404.7"];
    $scope.selLocationTitle= ["Delhi"];
    
    function defaultLoad(){
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;
        
        //console.log('inside Default', $scope.selLocationTitle);
    
        filterParameters= $scope.filterGetParams();
        
        switch(currentTab){
            case 'heatZonesPoorCEI':
                mapPoorCEIURL= globalConfig.pullfilterdataurlbyname+"High Usage Poor CEI"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+filterParameters+'&Usage='+usageParam;
                mapHeatZonesPoorCEI(mapPoorCEIURL);
                break;
            case 'overallDayCount':
                deviceAffectedPoorCEIURL= globalConfig.pullfilterdataurlbyname+"High Usage Poor CEI Day wise count"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters+'&Usage='+usageParam;
                bar_highchart_day_count(deviceAffectedPoorCEIURL);
                break;
            case 'citywiseCount':
                segmentAffectedPoorCEIURL= globalConfig.pullfilterdataurlbyname+"High Usage Poor CEI City wise count"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters+'&Usage='+usageParam;
                bar_highchart_label_count(segmentAffectedPoorCEIURL);
                break;
            }
    }
    
    defaultLoad();
    
    // Submit Click event
    $scope.click= function(){
        defaultLoad();
    }
    
    //change Date event
    $scope.changeDate=function (modelName, newDate) {
        $scope.date.end= newDate.format("YYYY-MM-DD");
    }
    //Tab selected event
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
    
    // Table Export Event
    $scope.dataTableExport = function(component, type, name){
        $scope.getSimpleJSONExport(component, type, name);
    }
}
// End High Usage Poor CEI Analytics Controller
//    ----------------------------------------------------------------------------

// CEI Cell Analytics Controller
function CEICellAnalyticsCtrl($ocLazyLoad, $scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, locationFilterService, $sce, filterService,dbService, $uibModal, globalData, $q, $http, Oboe, uiGmapIsReady, uiGmapGoogleMapApi) {
    /*uiGmapIsReady,IsReady---IsReady.promise().then(function (maps) {
        google.maps.event.trigger(maps[0].mapUsage, 'resize');
    });*/
                
    /*$ocLazyLoad.load({
        name: 'uiGmapgoogle-maps',
        series: true,
        files: [
            {type: 'js', path: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4&v=3.exp&libraries=placeses,visualization,drawing,geometry,places'},
            'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
            'bower_components/angular-google-maps/dist/angular-google-maps.js'
        ]
    }).then(function(uiGmapGoogleMapApi){ });*/
        var initLatCEI= "28.6139";
        var initLongCEI= "77.2090";
        var filterParameters = "";
        var heatLayerObjCount;
        var heatLayerObjUsage;
        var currentTab= 'ceiDistributionMap';
        var mapCountURL, mapUsageURL;
        
        //--------------------------------------------------------------
        //Filter Section
        
        //datepicker options
        $scope.minDate= moment('2016-06-03');
        $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
        
        /*$scope.onClickCEI = function(marker, eventName, model) {
            model.show = !model.show;
        };*/

        // for CEI tab

        /*$scope.mapCEI = {
            center: {
                latitude: initLatCEI,
                longitude: initLongCEI
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            control: {
                refresh: function(){}
            },
            zoom: 10,
            size:{
                height: '800px'
            },
            events:
            { 
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onClickCEI(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onClickCEI(marker, eventName, model);
                }
            },
            
        };*/
        uiGmapGoogleMapApi
    .then(function(mapCEI) {
        $scope.mapCEI = angular.copy($scope.getMapOption);
        // var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
        })
        $scope.circlesCEI=[];
        function mapCEI(stmtObj){
            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;

            $scope.loadingCEIMapCircleDiv= true;
            $scope.noDataCEIMapCircleDiv= false;
            
            /*$timeout(function(){
                $scope.mapCEI.control.refresh({latitude: $scope.initLat, longitude: $scope.initLong});
            },500)*/
            
            /*uiGmapIsReady,IsReady---IsReady.promise().then(function (maps) {
                google.maps.event.trigger(maps[0].mapUsage, 'resize');
            });*/

            /*$scope.getMapData(stmtObj, function(res){
                if(res.rawObjArray.length>0){
                    $scope.datasetCEI= angular.copy(res.rawObjArray);
                    $scope.circlesCEI= angular.copy(res.mapData);
                    $scope.loadingCEIMapCircleDiv= false;
                    $scope.noDataCEIMapCircleDiv= false;
                }else{
                    $scope.loadingCEIMapCircleDiv= false;
                    $scope.noDataCEIMapCircleDiv= true;
                    $scope.circlesCEI= [];
                }
            });*/



            // highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            // $scope.$watch( $scope.mapDataObj);
            // var temp= $scope.getMapData(stmtObj);
            /*funtion(parameter, callback){
                 http.serice().function(res){
                  callback(res);
              }*/

            // $scope.mapDataObj= temp;
            // console.log("mapData", temp);

    //--------------------------------------------------------------------------------
    ///////////////////////////////////////////////////////////////////////////////////
    $scope.myData= []; 
    var i=0;
    uiGmapIsReady.promise().then(function(){



        Oboe({
            url: 'http://10.0.0.11:8080/JRServer1/MListener?action=filterquery&name=Test cellid usage Map Batch&stream=1',
            pattern: '{index}',
            start: function(stream) {
                // handle to the stream
                $scope.stream = stream;
                // console.log('started', stream);
            },
            done: function(parsedJSON) {
                console.log('done', parsedJSON);
                for(var j in parsedJSON){
                    $scope.circlesCEI.push({
                            id: i++,
                            latitude: parsedJSON[j].lt,
                            longitude: parsedJSON[j].lg,
                            title: parsedJSON[j].a+ ' (' + parsedJSON.ci +')' ,
                            cellid: parsedJSON[j].ci,
                            options:{visible:true}
                            //date: $scope.date.end,
                            //area: objArray[i].Area,
                        })
                }
            }
        }).then(function(node) {
            // promise is resolved
            $scope.myData.push(node);
            console.log("$scope.myData", $scope.myData);
            if($scope.myData.length === 1000) {
                $scope.stream.abort();
                console.log('The maximum of one thousand records reached');
            }
        }, function(error) {
            // handle errors
        }, function(node) {
            // node received
            $scope.myData.push(node);
            console.log("$scope.myData", $scope.myData);
            if($scope.myData.length === 1000) {
                $scope.stream.abort();
                console.log('The maximum of one thousand records reached');
            }
        });
        })
    //////////////////////////////////////////////////////////////////////////////////



            // httpService.get(stmtObj.stmtName).then(function (response) {  
            // $http.get('http://10.0.0.11:8080/JRServer1/MListener?action=filterquery&name=Test cellid usage Map Batch').then(function (response) {  
                // var objArray = response.data;
                // var objArray = globalData.mapTestData;
                //console.log("objArray", objArray);

               /* if(objArray.length>0){
                    $scope.datasetCEI= angular.copy(objArray);

                    var mapCEI= [];
                    for (var k = 0; k < 100 ; k++) {
                        
                        var colour;
                        if(objArray[k].CEI == 'Poor')
                        {
                            //colour= '#FF0000';
                            colour= 'images/tower_red.png';
                            highCountIndex.push(k);
                        }else if(objArray[k].CEI == 'Good')
                        {
                            //colour= "#FFC107";
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(k);    
                        }else if(objArray[k].CEI == 'Excellent')
                        {
                            //colour= "#08B21F";
                            colour= "images/tower_green.png";
                            lowCountIndex.push(k);
                        }

                        mapCEI[k]= {
                            id: k,
                            latitude: objArray[k].latitude,
                            longitude: objArray[k].longitude,
                            title: objArray[k].Area+ ' (' + objArray[k].cellid +') , CEI: '+ objArray[k].CEI,
                            cellid: objArray[k].cellid,
                            icon: colour,
                            options:{visible:true}
                            //date: $scope.date.end,
                            //area: objArray[i].Area,
                        }
                    }
                    
                    $q(mapCEI, function(res){
                        alert("we are done");
                        $scope.circlesCEI.push(res);
                    });
                        
                    
                    
                    $scope.loadingCEIMapCircleDiv= false;
                    $scope.noDataCEIMapCircleDiv= false;
                }else{
                    $scope.loadingCEIMapCircleDiv= false;
                    $scope.noDataCEIMapCircleDiv= true;
                    $scope.circlesCEI= [];
                }*/
            // }); 
        }

        $scope.checkboxHighCountStateChange= function(state, objData){
            var mapObject= angular.copy(objData);
            $scope.getMapLegendClickData(state, $scope.highCountIndex, mapObject, function(res){
                $scope.circlesCEI= angular.copy(res.res);
            });
        }
        $scope.checkboxMediumCountStateChange= function(state, objData){
            var mapObject= angular.copy(objData);
            $scope.getMapLegendClickData(state, $scope.mediumCountIndex, mapObject,function(res){
                $scope.circlesCEI= angular.copy(res.res);
            });
        }
        $scope.checkboxLowCountStateChange= function(state, objData){
            var mapObject= angular.copy(objData);
            $scope.getMapLegendClickData(state, $scope.lowCountIndex, mapObject, function(res){
                $scope.circlesCEI= angular.copy(res.res);
            });
        }
        
        function defaultLoad(){
            
            switch(currentTab){
                case 'ceiDistributionMap':
                    var mapCEIURL= globalConfig.pullfilterdataurlbyname+"CellId CEI Mapping"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                    var stmtObj= {};
                    stmtObj.stmtName= mapCEIURL;
                    stmtObj.keys= 'CEI';
                    mapCEI(stmtObj);
                    break;
                case 'ceiDistribution':
                    var mapCEIURL= globalConfig.pullfilterdataurlbyname+"CellId CEI Mapping"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                    mapCEI(mapCEIURL);
                    break;
            }
        }
        
        defaultLoad();
        
        // Submit Click event
        $scope.click= function(){
            defaultLoad();
        }
        
        //change Date event
        $scope.changeDate=function (modelName, newDate) {
            $scope.date.end= newDate.format("YYYY-MM-DD");
        }
        
        //Tab selected event
        $scope.tabSelected= function(tab){
            currentTab= tab;
            defaultLoad();
        }
        
        // Table Export Event
        $scope.dataTableExport = function(component, type, name){
            $scope.getSimpleJSONExport(component, type, name);
        }
 }
// End CEI Cell Analytics Controller
//    ----------------------------------------------------------------------------

// Heatmap Cell Usage Distribution Analytics Controller
function cellUsageDistributionAnalyticsCtrl($ocLazyLoad, $scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, locationFilterService, $sce, filterService,dbService, $uibModal) {
    /*uiGmapIsReady,IsReady---IsReady.promise().then(function (maps) {
        google.maps.event.trigger(maps[0].mapUsage, 'resize');
    });*/
                
    /*$ocLazyLoad.load({
        name: 'uiGmapgoogle-maps',
        series: true,
        files: [
            {type: 'js', path: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4&v=3.exp&libraries=placeses,visualization,drawing,geometry,places'},
            'bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
            'bower_components/angular-google-maps/dist/angular-google-maps.js'
        ]
    }).then(function(uiGmapGoogleMapApi){ });*/
        $scope.insideLazyLoad= true
        var initLatUsage= "28.6139";
        var initLongUsage= "77.2090";
        var filterParameters = "";
        var heatLayerObjCount;
        var heatLayerObjUsage;
        var mapCountURL, mapUsageURL;
        $scope.popover= {};
        
        $scope.dynamicPopover = {
            unitUsage: 'Bytes',
            fromUsage:'',
            toUsage:'',
            fromCount:'',
            unitCount:'Unit',
            toCount:''
        };
        
        var snip= $scope.Snip;
        var load= "<span class='text-info'><b>Loading...</b></span>";
        $scope.loading= {};
        $scope.loading.snip= $sce.trustAsHtml(snip);
        $scope.loading.load= $sce.trustAsHtml(load);
        
        function getBytes(usageValue, unit){
            var usage;
            if(usageValue>0){
                if(unit != "Bytes"){
                    switch(unit){
                        case 'GB':
                            usage= Math.pow(2,30)*usageValue;
                            break;
                        case 'MB':
                            usage= Math.pow(2,20)*usageValue;
                            break;
                        case 'KB':
                            usage= Math.pow(2,10)*usageValue;
                            break;
                    }
                }else{
                    usage= usageValue;
                }
                return usage;
            }
        }
        
        function getCount(countValue,unit){
            var count; 
            if(countValue>0){
                if(unit != "Unit"){
                    switch(unit){
                        case 'K':
                            count= Math.pow(10,3)*countValue;
                            break;
                        case 'M':
                            count= Math.pow(10,6)*countValue;
                            break;
                    }
                }else{
                    count= countValue;
                }
                return count;
            }
        }
        
        function getAdvanceFilterParam(fromValue, toValue,label){
            var paramAdvanceFilter= [];
            if(angular.isDefined(fromValue)){
                paramAdvanceFilter.push('{'+label+': {$gt:'+fromValue+'}}');
            }
            if(angular.isDefined(toValue)){
                paramAdvanceFilter.push('{'+label+': {$lt:'+toValue+'}}');
            }
            return paramAdvanceFilter;
        }
        
        $scope.saveFilterOption= function(filter){
            console.log("$scope.filter", filter);
            var unitUsage= filter.unitUsage;
            var unitCount= filter.unitCount;
            var fromUsage, toUsage, fromCount, toCount;
            var paramAdvanceFilterCount, paramAdvanceFilterUsage, paramAdvanceFilter;
            
            fromUsage= getBytes(filter.fromUsage, unitUsage);
            toUsage= getBytes(filter.toUsage, unitUsage);
            
            fromCount= getCount(filter.fromCount, unitCount);
            toCount= getCount(filter.toCount, unitCount);
            
            paramAdvanceFilterCount= getAdvanceFilterParam(fromCount, toCount, 'Count');
            paramAdvanceFilterUsage= getAdvanceFilterParam(fromUsage, toUsage, 'Usage');
            
            if(paramAdvanceFilterCount.length>0){
                paramAdvanceFilter= paramAdvanceFilterCount;
            }
            if(paramAdvanceFilterUsage.length>0){
                if(paramAdvanceFilterCount.length>0){
                    paramAdvanceFilter= paramAdvanceFilter+','+paramAdvanceFilterUsage;
                }else{
                    paramAdvanceFilter= paramAdvanceFilterUsage;
                }
            }
            
                
            var mapAdvanceFilterURL= globalConfig.pullfilterdataurlbyname+"Heat map for Usage Count Advance Filter"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&advancedFilter="+paramAdvanceFilter;
            console.log("paramAdvanceFilter", paramAdvanceFilterCount);
            console.log("paramAdvanceFilterUsage", paramAdvanceFilterUsage);
            
            mapCount(mapAdvanceFilterURL);
            mapUsage(mapAdvanceFilterURL);
        }
        
       //--------------------------------------------------------------
        //Filter Section
        
        //var selKeysLocation= ["404.7"], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], selLocationTitle= [], selDeviceTitle=[];
        var queryParam; 
        
        $scope.treeLocation= false;
        $scope.treeRAT= false;
        $scope.treeSegment= false;
        $scope.treeDevice= false;
        
        
        //datepicker options
        // $scope.minDate= moment('2016-06-03');
        // $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
        
        // var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
        //$scope.date= {"end": '2016-10-14'};
        
        /*
        *   Location Filter data
        */
        var sort = JSON.stringify({ 'circle' : 1});
        var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

            /*_.forEach(response.data, function(item){
                item.title = item.country;
                item.key = item.countryid;
            });*/
             _.forEach(response.data, function(item){
	            item.title = item.circle;
	            item.key = item.circleid;
	        });
            $scope.getLocationData.children = response.data;
            var selectStatus= false;
            $("#location").dynatree(angular.copy($scope.getLocationData))
        })
        
        /*
        *   RAT Filter data
        */
        $("#rat").dynatree(angular.copy($scope.getRATData))
        
        /*
        *   Segment Filter data
        */
        $("#segment").dynatree(angular.copy($scope.getSegmentData))
         
        /*
        *   Device Filter data
        */
        
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
            $scope.getDeviceData.children = response.data;
            var selectStatus=false;
            _.forEach(response.data, function(item){
                item.title = item.make;
                item.key = item.makeid;
                item.parent = 1;
            });
            //console.log("data: ", deviceData)
            $("#device").dynatree(angular.copy($scope.getDeviceData))
        })
            
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
        
        //------------------------------------------------------------------------------
        // Heatmap 

        function heatmapUsage(url){
            $scope.loadingUsageMapCircleDiv= true;
            $scope.noDataUsageMapCircleDiv= false;
            
            console.log("url", url);
            var pointarray;
            //Geo Distribution Usage
            var mapData= [];
            //heatLayerObj.setData(mapData);    //If want to reset the map           
            httpService.get(url).then(function (response) {  
                console.log('rersponse', response);
                var objArray = response.data;
                console.log('usage', objArray.length);
                if(objArray.length>0){
                    $scope.datasetUsage= angular.copy(objArray);
                    for (var i = 0; i < objArray.length; i++) {
                        mapData[i]= {location: new google.maps.LatLng(objArray[i].latitude, objArray[i].longitude), weight: objArray[i].Usage};
                    }
                    pointarray = new google.maps.MVCArray(mapData);
                    heatLayerObjUsage.setData(pointarray);
                    
                    heatLayerObjUsage.set('radius', heatLayerObjUsage.get('radius') ? null : 20);
                    initLatUsage= objArray[0].latitude;
                    initLongUsage= objArray[0].longitude;

                    for (var i = 0; i < objArray.length; i++) {
                        objArray[i].Usage= dataFormatter.formatUsageData(objArray[i].Usage,2);
                    }
                    
                    $scope.datasetCEI= angular.copy(objArray);

                    $scope.loadingUsageMapCircleDiv= false;
                    $scope.noDataUsageMapCircleDiv= false;
                }else{
                    $scope.loadingUsageMapCircleDiv= false;
                    $scope.noDataUsageMapCircleDiv= true;
                }
            });        
        }
    
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
                //styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},   {"saturation":40},{"lightness":10}]}],
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
            heatLayerCallback: function (layerUsage) {
                //set the heat layers backend data
                var loadHeatLayerUsage = new LoadHeatLayerUsage(layerUsage);
            },
            showHeat: true,
            size:{
                height: 400
            } 
        };

        $scope.selKeysLocation= ["404.7"];
        $scope.selLocationTitle= ["Delhi"];
        //console.log('$scope.selLocationTitle', $scope.selLocationTitle);
        
        function defaultLoad(){
            console.log("inside default")
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
            
            //console.log('inside Default', $scope.selLocationTitle);
        
            filterParameters= $scope.filterGetParams();
            
            var heatmapUsageURL= globalConfig.pullfilterdataurlbyname+"Heat map for Device Usage"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                 
            heatmapUsage(heatmapUsageURL);

        }
        
        defaultLoad();
        
        // Submit Click event
        $scope.click= function(){
            defaultLoad();
        }
        
        //change Date event
        $scope.changeDate=function (modelName, newDate) {
            $scope.date.end= newDate.format("YYYY-MM-DD");
        }
        
        // Table Export Event
        $scope.dataTableExport = function(component, type, name){
            $scope.getSimpleJSONExport(component, type, name);
        }
}
// End Cell Usage Distribution Analytics Controller
//    ----------------------------------------------------------------------------

// Device Insights Analytics Controller
function deviceInsightsCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, $uibModal, filterService, $sce, dbService) {
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
        currentTab= 'deviceDistribution';
    
    var snip= $scope.Snip;
    var load= "<span class='text-info'><b>Loading...</b></span>";
    
    $scope.loading= {};
    $scope.loading.snip= $sce.trustAsHtml(snip);
    $scope.loading.load= $sce.trustAsHtml(load);
    var heatmapCountURL, heatmapUsageURL, DevicePenetrationCountURL,  DevicePenetrationCountTableStartDateURL, DevicePenetrationCountTableEndDateURL, distributionMultilineURL, distributionBarFirstDayURL , distributionBarLastDayURL, deviceCapabilityURL;
    var xAxisData =[], usageData= [], penetrationData= [], penetrationVsUsageOptions=null ;
    
    //Penetration Table Options
    $scope.penetrationTableOptions= { 
        "order" :[[1,"desc"]]
    };
    //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    // $scope.treeLocation= false;
    // $scope.treeRAT= false;
    // $scope.treeSegment= false;
    // $scope.treeDevice= false;
    
    var fromDate= $filter('date')( new Date().getTime() -7*24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");

    //fromDate= fromDate.substring(0,8);
    //fromDate= fromDate+"01"
    //$scope.date= {"start": '2017-01-10', "end": '2017-01-12'};
    
    //datepicker options
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    
    var selectDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    $scope.dateSelect= {"select": selectDate};
    
     /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'circle' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/

         _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData))
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData))
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
        
    /*$scope.location = function() {
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
    }*/

    //Top 10 devices
    var topTenDevicesObj= '';
    /*httpService.get(globalConfig.pullfilterdataurlbyname+"Top 10 devices by Count"+"&toDate="+$scope.date.end+"T00:00:00.000Z").then(function (response) {
        topTenDevicesObj= response.data;
    })*/
    
    //End of Filter Section
    //--------------------------------------------------------------

    //device distribution tab
    function deviceDistribution(urlTotalUsage, urlTotalUsers ){
    	$scope.loadingDeviceTotalUsagePieDiv= true;
        $scope.DataDeviceTotalUsagePieDiv= false;
        $scope.noDataDeviceTotalUsagePieDiv= false;  
        
        $scope.loadingDeviceTotalUsersPieDiv= true;
        $scope.DataDeviceTotalUsersPieDiv= false;
        $scope.noDataDeviceTotalUsersPieDiv= false;  
        
        httpService.get(urlTotalUsers).then(function(response){
            var objArrayUsers= response.data;
            
            if(objArrayUsers.length>0){
            	$scope.exportDevicewiseUsers= angular.copy(objArrayUsers);
            	
            	var totalUsersPieOptions= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                totalUsersPieOptions.tooltip.pointFormat= '{series.name}: <b>{point.y:.0f}</b>';
                var multipleDeviceData= [],  xLabelArray= [];

                var deviceData= [];
                for(var i in objArrayUsers){
                   	deviceData[i]= {
                        name: objArrayUsers[i].Device,
                        color: highchartProcessData.colorpallete[i],
                        y: objArrayUsers[i].Users
                    }
                }
                    
                $scope.deviceTotalUsers= {
                    options: totalUsersPieOptions,
                    series: [{
                        type: 'pie',
                        name: 'Total Users',
                        data: angular.copy(deviceData)
                    }] 
                }
	            $scope.loadingDeviceTotalUsersPieDiv= false;
		        $scope.DataDeviceTotalUsersPieDiv= true;
		        $scope.noDataDeviceTotalUsersPieDiv= false;

            	httpService.get(urlTotalUsage).then(function(response){
            		var objArrayUsage= response.data;
					
					if(objArrayUsage.length>0){
                        $scope.exportDeviceTotalUsage= angular.copy(objArrayUsage);
                        
                        for(var i in objArrayUsage){
                        	objArrayUsage[i].Usage= objArrayUsage[i].Usage/(1024*1024);
                        }
                        var multipleDevicePieOptions= angular.copy(highchartOptions.highchartPieWoLegendOptions);
		                multipleDevicePieOptions.tooltip.pointFormat= '{series.name}: <b>{point.y:.0f}</b> 	MB';
		                //multipleDevicePieOptions.legend.align= 'left';
		                var multipleDeviceData= [],  xLabelArray= [];
		                
		                var deviceDataUsage= [];
	                    for(var i in objArrayUsage){
		                    deviceDataUsage[i]= {
	                            name: objArrayUsage[i].Device,
	                            color: highchartProcessData.colorpallete[i],
	                            y: objArrayUsage[i].Usage
	                        }
	                    }
		                   
	                    $scope.deviceTotalUsage= {
	                        options: multipleDevicePieOptions,
	                        series: [{
	                            type: 'pie',
	                            name: 'Total Usage',
	                            data: angular.copy(deviceDataUsage)
	                        }]
	                        
	                    }
		                var deviceAvgUsage= [];
		                var avgUsageBarOpt= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
		                
                		avgUsageBarOpt.tooltip.pointFormat= 'Usage<b> {point.y:.2f} MB';

                		avgUsageBarOpt.yAxis.title.text= "Avg Usage (MB)";

                		var avgUsageLabelArray= [], avgUsageDataSorted= [];
                		var avgObjArray=[];
                		var avgObj={};
                		var j=0;
                		for(var i in objArrayUsage){
                			j=0;
                			avgObj={};
                			for(j in objArrayUsers){
                				if(objArrayUsers[j].Device== objArrayUsage[i].Device){
                					avgObj['Avg']= parseFloat(objArrayUsage[i].Usage/objArrayUsers[j].Users);
                					avgObj['Device']= objArrayUsers[j].Device;
                					avgObjArray.push(avgObj);
                					break;
                				}
                			}
                		}


						$scope.exportAvgUsagePerDevice= angular.copy(avgObjArray)
		                var temp= [];
		                for(var i=0; i<avgObjArray.length; i++){
		                    avgUsageLabelArray[i]= avgObjArray[i].Device;
		                    temp[i]= avgObjArray[i].Avg;
		                }
		                avgUsageDataSorted= temp.sort(function(a, b){return b-a});
		                var avgUsageDataLegendSorted= [];
		                var i= 0;
		                for(var j in avgUsageDataSorted){

		                	var avgData= avgUsageDataSorted[j];
		                	i= 0;
		                	for(i in avgObjArray){
		                		if(avgData== avgObjArray[i].Avg){
		                			avgUsageDataLegendSorted.push(avgObjArray[i].Device);
		                			break;
		                			
		                		}
		                	}
		                }

						avgUsageBarOpt.xAxis.categories= angular.copy(avgUsageDataLegendSorted);
 
	                    $scope.deviceAvgUsage= {
	                        options: avgUsageBarOpt,
	                        series: [{
	                            color: "rgb(39, 174, 96)",
	                            name: 'Avg. Usage',
	                            data: angular.copy(avgUsageDataSorted)
	                        }]
	                        
	                    }
		                
		                $scope.exportMultipleDevice= angular.copy(objArrayUsage); 
		                
		                $scope.loadingDeviceTotalUsagePieDiv= false;
				        $scope.DataDeviceTotalUsagePieDiv= true;
				        $scope.noDataDeviceTotalUsagePieDiv= false;  
		            }else{
		            	$scope.loadingDeviceTotalUsagePieDiv= false;
				        $scope.DataDeviceTotalUsagePieDiv= false;
				        $scope.noDataDeviceTotalUsagePieDiv= true; 
		            }
	            }) 
            }
            else{
                $scope.loadingDeviceTotalUsersPieDiv= false;
		        $scope.DataDeviceTotalUsersPieDiv= false;
		        $scope.noDataDeviceTotalUsersPieDiv= true;  
        		
        		$scope.loadingDeviceTotalUsagePieDiv= false;
		        $scope.DataDeviceTotalUsagePieDiv= false;
		        $scope.noDataDeviceTotalUsagePieDiv= true; 
            }
        })
    
    }

    //device penetration tab
    function DevicePenetrationCount(urlMultiline,urlTable ){
        
        $scope.loadingPenetrationDiv= true;
        $scope.noDataPenetrationDiv= false;
        $scope.dataPenetrationDiv= false;

        $scope.loadingPenetrationTableDiv= true;
        $scope.noDataPenetrationTableDiv= false;
        $scope.dataPenetrationTableDiv= false; 
        
        httpService.get(urlMultiline).then(function (response) {  
            var objArray = response.data;
            $scope.exportDeviceCountMultiLineChart= [];
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
                DeviceCountMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.exportDeviceCountMultiLineChart= angular.copy(objArray);
                console.log("highchartProcessData.multilineProcessHighchartData(paramObject)", highchartProcessData.multilineProcessHighchartData(paramObject));
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

        httpService.get(urlTable).then(function(response){
            var ObjArray= response.data;
            if(ObjArray.length>0){

                var keysTopModelArray= _.keys(ObjArray[0]['data'][0]);
                $scope.colSpan= keysTopModelArray.length

                var keysModifiedArray= [], index= -1, tableData= [];
                for(var i in ObjArray)
                {
                    for(var j in keysTopModelArray)
                        keysModifiedArray[++index]= keysTopModelArray[j];
                }

                //calculating no. of rows
                var finalDeviceArray= [];
                for(var i in ObjArray){
                    var tempDeviceArray= []
                    for(var j in ObjArray[i].data){
                        tempDeviceArray[j]= ObjArray[i].data[j][keysTopModelArray[0]];
                    }
                    var temp= _.difference(tempDeviceArray, finalDeviceArray);
                    if(temp.length > 0){
                        for(j in temp){
                            finalDeviceArray.push(temp[j]);
                        }
                    }
                }
                var rowLength= finalDeviceArray.length;
                //end calculation section

                for(var i=0; i<rowLength; i++){
                    var index= -1, tabData= [];
                    for(var j in ObjArray){
                        if(ObjArray[j].data.length == rowLength){
                            for(var l in keysTopModelArray){
                                tabData[++index]= ObjArray[j].data[i][keysTopModelArray[l]];
                            } 
                        }else{
                            if(angular.isDefined(ObjArray[j].data[i])){
                                for(var l in keysTopModelArray){
                                    tabData[++index]= ObjArray[j].data[i][keysTopModelArray[l]];
                                }
                            }else{
                                for(var l in keysTopModelArray)
                                    tabData[++index]= '-';
                            }
                        }
                    }
                    tableData[i]= angular.copy(tabData);
                }
                $scope.topModelsObj= ObjArray;
                $scope.colHeader= angular.copy(keysModifiedArray);
                $scope.keysTopModel= angular.copy(tableData);
                
                $scope.loadingPenetrationTableDiv= false;
                $scope.noDataPenetrationTableDiv= false;
                $scope.dataPenetrationTableDiv= true;
            }else{
                $scope.topModelsObj= null;
                $scope.colHeader= null;
                $scope.keysTopModel= null;

                $scope.loadingPenetrationTableDiv= false;
                $scope.noDataPenetrationTableDiv= true;
                $scope.dataPenetrationTableDiv= false;
            }
        })
    }
    
    //top device by penetration(table) tab
    function penetrationTableDataElement (device,penetration,txtColorPenetration,comparePenetration,indicatorStatusPenetration,traffic,textColorTraffic,comparedTraffic,indicatorStatusTraffic,maxTraffic,textColorMaxTraffic,comparedMaxTraffic,indicatorStatusMaxTraffic,avgTraffic,textColorAvgTraffic,comparedAvgTraffic,indicatorStatusAvgTraffic,fontSize) {
        this.device = device;
        //this.model = model;
        this.penetration = penetration;
        this.textColorPenetration = txtColorPenetration;
        this.comparedPenetration = comparePenetration;
        this.indicatorStatusPenetration = indicatorStatusPenetration;
        this.traffic = traffic;
        this.textColorTraffic = textColorTraffic;
        this.comparedTraffic = comparedTraffic;
        this.indicatorStatusTraffic = indicatorStatusTraffic;
        this.maxtraffic = maxTraffic;
        this.textColorMaxTraffic = textColorMaxTraffic;
        this.comparedMaxTraffic = comparedMaxTraffic;
        this.indicatorStatusMaxTraffic = indicatorStatusMaxTraffic;
        this.avgtraffic = avgTraffic;
        this.textColorAvgTraffic = textColorAvgTraffic;
        this.comparedAvgTraffic = comparedAvgTraffic;
        this.indicatorStatusAvgTraffic = indicatorStatusAvgTraffic;
        this.fontsize = fontSize;
    }
        
    var dataArray= [];
    dataArray[0]= new penetrationTableDataElement('- No record-','','','','','');
    $scope.dataset = dataArray;
    
    function getIndicatorData(index, firsetDateData, lastDateData){
        var distributionColor= "", distributionComparedValue, percentComparedDistibution,   indicatorStatus="";
                        
        if(index != "-1"){
            distributionComparedValue= lastDateData- firsetDateData;

            if(distributionComparedValue > 0){
                distributionColor= "navy"; 
                indicatorStatus= "up";
            }else if(distributionComparedValue < 0){
                distributionColor= "danger";
                indicatorStatus= "down";
            }else{
                distributionColor= "false";
            }

            percentComparedDistibution= ((Math.abs(distributionComparedValue)/lastDateData)*100).toFixed(0);
            
            return [distributionColor, percentComparedDistibution, indicatorStatus];
        }else{
            distributionColor= "false";
            return [distributionColor];
        }
        
    }
    
    function DevicePenetrationCountTable(endDateURL, startDateURL){
        //console.log(url);
        httpService.get(endDateURL).then(function (response) {  
            //console.log(response.data)
            var objArray = response.data;
            var fontsize = 12;
            $scope.exportDevicePenetrationCountTable= [];
            console.log("objArray enddate", objArray.length)
            if(objArray.length>0){
                httpService.get(startDateURL).then(function (response) {
                    var objArrayStartDate = response.data;
                    var modelArray= [];
                    console.log("objArray fromdate", objArrayStartDate.length)
                    for (var i = 0; i < objArrayStartDate.length; i++) {
                        // modelArray[i]= objArrayStartDate[i].Model;
                        modelArray[i]= objArrayStartDate[i].Device;
                    }
                    
                    for (var i = 0; i < objArray.length; i++) {
                        
                        var index= $.inArray(objArray[i].Device, modelArray);
                        var penetrationIndicatorData, trafficIndicatorData, maxTrafficIndicatorData, avgTrafficIndicatorData;
                        if(index != -1){ 
                            penetrationIndicatorData= getIndicatorData(index, objArrayStartDate[index].Distribution, objArray[i].Distribution);

                            trafficIndicatorData= getIndicatorData(index, objArrayStartDate[index].Traffic, objArray[i].Traffic);

                            maxTrafficIndicatorData= getIndicatorData(index, objArrayStartDate[index].HighestTraffic, objArray[i].HighestTraffic);

                            avgTrafficIndicatorData= getIndicatorData(index, objArrayStartDate[index].AVGTraffic, objArray[i].AVGTraffic);
                            }else{
                                penetrationIndicatorData= ["false"];
                                trafficIndicatorData= ["false"];
                                maxTrafficIndicatorData= ["false"];
                                avgTrafficIndicatorData= ["false"];
                            }
                        
                            //fontsize= fontsize - 1;
                            //if(fontsize < 10) fontsize= 10;
                            dataArray[i] = new penetrationTableDataElement(
                                objArray[i].Device,
                                dataFormatter.formatDecimalPlaces(objArray[i].Distribution,3),
                                penetrationIndicatorData[0], penetrationIndicatorData[1],penetrationIndicatorData[2],
                                dataFormatter.formatDecimalPlaces(objArray[i].Traffic,3),
                                trafficIndicatorData[0], trafficIndicatorData[1],trafficIndicatorData[2],
                                dataFormatter.fixFormatter(objArray[i].HighestTraffic,1048576*1024,2),
                                maxTrafficIndicatorData[0], maxTrafficIndicatorData[1],maxTrafficIndicatorData[2],
                                dataFormatter.fixFormatter(objArray[i].AVGTraffic,1048576,2),
                                avgTrafficIndicatorData[0], avgTrafficIndicatorData[1],avgTrafficIndicatorData[2],
                                fontsize
                            );
                        
                    }
                    $scope.exportDevicePenetrationCountTable= angular.copy(objArray);
                    $scope.dataset = dataArray;
                });
             }
        });
       
    }
    
    //penetration Vs usage tab
    function loadingPenetrationVsUsage(loadingStatus, dataStatus, noDataStatus){
        $scope.loadingPenetrationVsUsageDiv= loadingStatus;
        $scope.dataPenetrationVsUsageDiv= dataStatus;
        $scope.noDataPenetrationVsUsageDiv= noDataStatus;
    }
    
    function penetrationVsUsage(url){
        loadingPenetrationVsUsage(true, false, false);      
        httpService.get(url).then(function (response) {  
            //console.log(response.data)
            $scope.exportPenetrationVsUsageChart= [];
            var objArray = response.data;
            var modelArray= [], xAxisData= [], usageData= [], penetrationData=[];
            if(objArray.length>0){ 
                for (var i = 0; i < 20; i++) {
                            
                    xAxisData[i]= objArray[i].Device ;
                    usageData[i]= dataFormatter.formatDecimalPlaces(objArray[i].Distribution,3)*100;
                    penetrationData[i]= dataFormatter.formatDecimalPlaces(objArray[i].Traffic,3)*100
                }
                var penetrationVsUsageOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);

                penetrationVsUsageOptions.xAxis.categories= xAxisData;
                penetrationVsUsageOptions.yAxis.labels= {enabled: false};
                penetrationVsUsageOptions.tooltip.pointFormatter= function(){
                    return this.series.name+": "+ (this.y/100).toFixed(2)+"%  "
                };
                penetrationVsUsageOptions.chart.height= 400;

                $scope.exportPenetrationVsUsageChart= angular.copy(objArray)
                $scope.PenetrationVsUsageChartConfig={
                    options: penetrationVsUsageOptions,
                    series:[
                        {name: 'Usage',
                         color:"#f15c80",
                         data: usageData
                        },
                        {name: 'Penetration',
                         color:"#f7a35c",
                         data: penetrationData
                        }
                    ]
                }
                loadingPenetrationVsUsage(false, true, false);
            }else{
                loadingPenetrationVsUsage(false, false, true);
            }
        });
    }
    
    //distribution tab
    function distributionMultiline(url){
        
        $scope.loadingDistributionMultiineDiv= true;
        $scope.DataDistributionMultiineDiv= false;
        $scope.noDataDistributionMultiineDiv= false;  
        $scope.showBar= false;
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            //console.log("multiline", objArray);
            $scope.exportDistributionMultilineChart= [];
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
                paramObject.unit= "GB";
                var DeviceUsageMultiLineOptions=   angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                DeviceUsageMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                DeviceUsageMultiLineOptions.yAxis.title.text="Usage( GB )"; 
                DeviceUsageMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.UsageDistributionMultiineChartConfig= {
                    options: DeviceUsageMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                $scope.exportDistributionMultilineChart= angular.copy(objArray);
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
        
        httpService.get(firstDayURL).then(function(response){
            var firstDayObjArray= response.data;
            console.log("firstlength", firstDayObjArray[0].data.length);
             httpService.get(lastDayURL).then(function(response){
                 var lastDayObjArray= response.data;
                 //console.log("lastlength", lastDayObjArray[0].data);
                 var deviceArray= [], dateArray= [], barDataCount= [], barDataUsage= [];
                 
                 var firstDayDeviceArray= [], DeviceIDArray= [], lastDayDeviceArray= [], lastDayDeviceIDArray= [];
                 
                 if(firstDayObjArray.length && lastDayObjArray.length>0){
                     
                     dateArray[0]= firstDayObjArray[0].Date;
                     dateArray[1]= lastDayObjArray[0].Date;
                     
                     for(var i in firstDayObjArray[0].data){
                         deviceArray[i]= firstDayObjArray[0].data[i].Device;
                         firstDayDeviceArray[i]= firstDayObjArray[0].data[i].Device;
                         DeviceIDArray[i]= firstDayObjArray[0].data[i].Deviceid;
                     }
                     
                     for(var i in lastDayObjArray[0].data){
                         lastDayDeviceArray[i]= lastDayObjArray[0].data[i].Device;
                     }
                     
                     
                     for(var i in lastDayObjArray[0].data){
                         
                         var deviceName= lastDayObjArray[0].data[i].Device;
                         var index= $.inArray(deviceName, deviceArray);
                         if(index == -1)
                             deviceArray.push(deviceName);
                             DeviceIDArray.push(lastDayObjArray[0].data[i].Deviceid);
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
                         var index= $.inArray(this.series.name, deviceArray);
                         var id= this.series.name;//DeviceIDArray[index];
                         
                         distributionStackedBarClickEvent(id,this.series.name, $scope.date.start, $scope.date.end, "Count");
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
                         var index= $.inArray(this.series.name, deviceArray);
                         var id= DeviceIDArray[index];
                         
                         distributionStackedBarClickEvent(id,this.series.name, $scope.date.start, $scope.date.end, "Usage");
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
    
    //device capability Vs plan users tab
    function deviceCapabilityMultiBar(url){
        
        $scope.loadingdeviceCapabilityStackedBarDiv= true;
        $scope.DatadeviceCapabilityStackedBarDiv= false;
        $scope.noDatadeviceCapabilityStackedBarDiv= false;  
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportDeviceCapabilityStackedBar= [];
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
                $scope.exportDeviceCapabilityStackedBar= angular.copy(objArray);

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

    //app cei tab
    $scope.datasetAppCEI= [];
    function appCEI(url){
        
        $scope.loadingdeviceAppCEIDiv= true;
        $scope.DatadeviceAppCEIDiv= false;
        $scope.noDatadeviceAppCEIDiv= false;  
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            $scope.exportAppCEI= [];
            var responseObj= objArray;

            if(objArray.length>0){
                var columnArray= [];
                for(var i in objArray){
                    var tempColumnArray= []
                    for(var j in objArray[i].data){
                        tempColumnArray[j]= objArray[i].data[j].Device;
                        responseObj[i].data[j].BadCEI= angular.copy(objArray[i].data[j].BadCEI.toFixed(2));
                    }
                    var temp= _.difference(tempColumnArray, columnArray);
                    if(temp.length > 0){
                        for(j in temp){
                            columnArray.push(temp[j]);
                        }
                    }
                }
                $scope.columns= columnArray;
                var rowDataArray= [];
                for(var j in responseObj){
                    var rowData= [];
                    rowData.push(responseObj[j].App);
                    for(var i in columnArray){
                        console.log("objArray[j]['data']", responseObj[j]['data']);
                        var index= _.findIndex(responseObj[j]['data'], function(o) { return o.Device == columnArray[i]; });
                        if(index != -1){
                            rowData.push(responseObj[j]['data'][index]['BadCEI']);
                        }
                        else{
                            rowData.push('-');
                        }
                    }
                    rowDataArray.push(rowData);
                }
                
                $scope.rowDataArray= angular.copy(rowDataArray);
                $scope.exportAppCEI= angular.copy(objArray);

                $scope.loadingdeviceAppCEIDiv= false;
                $scope.DatadeviceAppCEIDiv= true;
                $scope.noDatadeviceAppCEIDiv= false;
            }
            else{
                $scope.loadingdeviceAppCEIDiv= false;
                $scope.DatadeviceAppCEIDiv= false;
                $scope.noDatadeviceAppCEIDiv= true;
            }
        })
    }


    function defaultLoad(){
       
        
        filterParameters= $scope.filterGetParams();

        switch(currentTab){
            case 'deviceDistribution':
                var DeviceTotalUsageDistributionURL= globalConfig.pullfilterdataurlbyname+"Device wise Total Usage Distribution Pie"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                var DeviceTotalUsersDistributionURL= globalConfig.pullfilterdataurlbyname+"Device wise Total Users Distribution Pie"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                deviceDistribution(DeviceTotalUsageDistributionURL, DeviceTotalUsersDistributionURL );
                break;
           
            case 'DevicePenetration':
                DevicePenetrationCountURL= globalConfig.pullfilterdataurlbyname+"Day wise device count for multiline view"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                var DevicePenetrationCountTableURL= globalConfig.pullfilterdataurlbyname+"Day wise device count for table"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                DevicePenetrationCount(DevicePenetrationCountURL, DevicePenetrationCountTableURL );
                break;
           
            case 'DevicePenetrationTable':
                DevicePenetrationCountTableStartDateURL= globalConfig.pullfilterdataurlbyname+"Handset wise Distribution with max and avg traffic"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+filterParameters;
                
                DevicePenetrationCountTableEndDateURL= globalConfig.pullfilterdataurlbyname+"Handset wise Distribution with max and avg traffic"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                
                DevicePenetrationCountTable(DevicePenetrationCountTableEndDateURL, DevicePenetrationCountTableStartDateURL);
                break;
            
            case 'UsageVsUsers':
                DevicePenetrationCountTableEndDateURL= globalConfig.pullfilterdataurlbyname+"Handset wise Distribution with max and avg traffic"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters;
                
                penetrationVsUsage(DevicePenetrationCountTableEndDateURL);
                break;
                
            case 'Distribution':
                
                distributionMultilineURL= globalConfig.pullfilterdataurlbyname+"Device wise Usage Count Distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                distributionMultiline(distributionMultilineURL);
                break;
                
            case 'deviceCapability':
                
                deviceCapabilityURL= globalConfig.pullfilterdataurlbyname+"Device Capability count for Plan Type"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                deviceCapabilityMultiBar(deviceCapabilityURL);
                
                break;
            
            case 'appCEI':
                
                var appCEIURL= globalConfig.pullfilterdataurlbyname+"Device to app Bad CEI"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                appCEI(appCEIURL);
                
                break;
            
        }
    }
    
    
    defaultLoad();
    
    //Tab selected event
    var recentSelectedDevice= [];
    
    function selectUnselectFilterDevices(deviceObject, key, deviceStatus){
        var selectDevice= [], selectDeviceTitle= [];
        for(var i in deviceObject){
            var topDevice= deviceObject[i][key];
            selectDevice[i]= deviceObject[i][key];
            var node = $("#device").dynatree("getTree").getNodeByKey(topDevice);
            selectDeviceTitle[i]= node.data.title;
            node.select(deviceStatus);
        }
        selKeysDevice= selectDevice;
        selDeviceTitle= selectDeviceTitle;
   }
    
    function selectUnselectRecentlySelectedDevices(recentSelectedDevice, deviceStatus, tab, top10Status){
        if(recentSelectedDevice.length > 0 ){
            selectUnselectFilterDevices($scope.topTenDevicesObj, "Device", top10Status);
            for(var i in recentSelectedDevice){
                var recentDevice= recentSelectedDevice[i].data.key;
                var node = $("#device").dynatree("getTree").getNodeByKey(recentDevice);
                node.select(deviceStatus);
            }
            currentTab= tab;
            defaultLoad();
        }
        else{
            selectUnselectFilterDevices($scope.topTenDevicesObj, "Device", top10Status);
            currentTab= tab;
            defaultLoad();
        }
    }
    
    
    
    $scope.tabSelected= function(tab){
        //console.log("topTenDevicesObj", topTenDevicesObj);
       
           if(tab=="Distribution"){
               /*if(topTenDevicesObj.length > 0){
                   for(var i=0; i < topTenDevicesObj.length; i++){
                       //selDeviceTitle[i]= topTenDevicesObj[i].Device; 
                       //selKeysDevice[i]= topTenDevicesObj[i].DeviceId; 
                       //console.log("selKeysDevice[i]", selKeysDevice[i]);
                       var tree = $("#device").dynatree("getTree");
                       var node = tree.getNodeByKey(topTenDevicesObj[i].DeviceId);
                       node.select(true);
                       console.log(tree);
                       console.log("node", node)
                   }
               }*/
               currentTab= tab;
               defaultLoad();
                /*var tree = $("#device").dynatree("getTree");
                recentSelectedDevice=tree.getSelectedNodes();
                //console.log("recentSelectedDevice", recentSelectedDevice);
                selectUnselectRecentlySelectedDevices(recentSelectedDevice, false, tab, true);*/
           }
           else{
               currentTab= tab;
               defaultLoad();
               /*//console.log("recentSelectedDevice", recentSelectedDevice);
               if(recentSelectedDevice.length>0){
                   selectUnselectRecentlySelectedDevices(recentSelectedDevice, true, tab, false);
               }else{
                   currentTab= tab;
                   defaultLoad();
               }*/
           }
       /*}else{
           currentTab= tab;
           defaultLoad();
       }*/
    }
    
    // Submit Click event
    $scope.click= function(){
        defaultLoad();
    }
    
    //change Date event
    $scope.changeDate=function (modelName, newDate) {
        $scope.dateSelect.select= newDate.format("YYYY-MM-DD");
    }
    
    // Table Export Event(not in use now)
    $scope.dataTableExport = function(component, type, name){
        $('#'+component).dataTable({ destroy: true, searching: false, 'bInfo': false, paging: false, order: [[2,'desc']]});
        $('#'+component).tableExport({type: type, pdfFontSize:'10',  escape:'false', tableName: name});
        $('#'+component).dataTable({ destroy: true, searching: false,'bInfo': false, 'bLengthChange': false, paging: true, order: [[2,'desc']]});
    }
    
    
    // Distribution Stacked bar click event
    
    function distributionStackedBarClickEvent(id,deviceName, fromDate, toDate, usageCount ){
        // model window
        var modalInstance = $uibModal.open({
            templateUrl: 'views/static/modelDevceInsightDistributionBarClick.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope, $uibModalInstance, $timeout) {
            $scope.loadingSegmentWiseMultiineDiv= true;
            $scope.DataSegmentWiseMultiineDiv= false;
            $scope.noDataSegmentWiseMultiineDiv= false;
            
            $scope.usagecount= usageCount;
            $scope.Device= deviceName;
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
            /*
            * Segment wise Device Usage
            */
            
            var url= globalConfig.pullfilterdataurlbyname+"Segment wise Device usage count"+"&fromDate="+fromDate+"T00:00:00.000Z"+"&toDate="+toDate+"T23:59:59.999Z&Device="+deviceName;
            httpService.get(url).then(function (response) { 
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
// End Device Insight Analytics Controller
//    ----------------------------------------------------------------------------


// App Trend Analytics Controller
function appAnalyticsCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, dbService) {
    
    var filterParameters = "";
    var currentTab= "Usage";
    var usageAppsMultilineURL, UsageAppsStackFirstDayURL, UsageAppsStackLastDayURL, visitsAppsMultilineURL , VisitsAppsStackFirstDayURL, VisitsAppsStackLastDayURL, durationAppsMultilineURL, DurationAppsStackFirstDayURL, DurationAppsStackLastDayURL;
    
    //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    fromDate= fromDate.substring(0,8);
    fromDate= fromDate+"01"
    //fromDate= "2016-09-09";  toDate= "2016-09-11";
    // $scope.date= {"start": fromDate, "end": toDate};
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'circle' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportAppsMultiineChart= [];
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
                $scope.exportAppsMultiineChart= angular.copy(objArray);

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
        
        httpService.get(firstDayURL).then(function(response){
            var firstDayObjArray= response.data;
            //console.log("firstlength", firstDayObjArray[0].data.length);
             httpService.get(lastDayURL).then(function(response){
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
                                 color: highchartProcessData.colorpallete[j],
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
                                 color: highchartProcessData.colorpallete[j],
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

        filterParameters= $scope.filterGetParams();
        console.log("filterParameters", filterParameters);
        switch(currentTab){
                
            case 'Usage':
               
                usageAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Usage Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                AppsMultiline(usageAppsMultilineURL, currentTab);
                break;
            
            case 'Visits':
                visitsAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Visits Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                AppsMultiline(visitsAppsMultilineURL, currentTab);
                break;
            
            case 'Duration':
                
                durationAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Duration Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                AppsMultiline(durationAppsMultilineURL, currentTab);
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
function browsingAnalyticsCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,highchartOptions, locationFilterService, highchartProcessData, filterService, dbService){
    
    var filterParameters = "";
    var currentTab= "appSegment";
    var handsetStackedBarURL, appSegmentBarURL, multiIMEISegmentCountURL, listTetheringURL;
    
    //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    //fromDate= fromDate.substring(0,8);
    //fromDate= fromDate+"01"
    
    //fromDate= "2016-08-05";  toDate= "2016-08-10";
    // $scope.date= {"start": 2016-10-18, "end": 2016-10-18};
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'circle' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
        
        httpService.get(url).then(function(response){
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
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportAppsSegment= [];
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
                        color: "#64DDBB",
                        data: appSegmentBarData
                    }]
                }
                $scope.exportAppsSegment= angular.copy(objArray);
                
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
        
        httpService.get(url).then(function(response){
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
        
        httpService.get(url).then(function(response){
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

        filterParameters= $scope.filterGetParams();

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


// Browsing Habits(User Segment Analytics) Controller
function userSegmentAnalyticsCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,  highchartOptions, locationFilterService, highchartProcessData, filterService, dbService) {
    
    var filterParameters = "";
    var currentTab= "RAT";
    var handsetStackedBarURL, appSegmentBarURL, multiIMEISegmentCountURL, listTetheringURL;
    
    //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    fromDate= "2017-01-15";  //toDate= "2016-08-10";
    //$scope.date= {"start": fromDate, "end": fromDate};
    
    
   /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'circle' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            console.log("multiline", objArray);
            $scope.exportHandsetCapabilityDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Segment";
                paramObject.data= "Count";
                paramObject.seriesName= "HandsetCapability";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                var AppsMultiLineOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions)
                AppsMultiLineOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                AppsMultiLineOptions.xAxis.title= {text:"Handset Capability"};
                AppsMultiLineOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.HandsetStackedBarChartConfig= {
                    options: AppsMultiLineOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                $scope.exportHandsetCapabilityDistribution= angular.copy(objArray);
                
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

    function multipleDevice(url){
        
        $scope.loadingMultipleDevicePieDiv= true;
        $scope.DataMultipleDevicePieDiv= false;
        $scope.noDataMultipleDevicePieDiv= false;  
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportMultipleDevice= [];
            if(objArray.length>0){
                var multipleDevicePieOptions= angular.copy(highchartOptions.highChartPieLabelInsideOptions);
                multipleDevicePieOptions.tooltip.pointFormat= '{series.name}: <b>{point.y:.0f}</b>';
                multipleDevicePieOptions.plotOptions.pie.dataLabels.format= 'IMEI Count {point.name}: <b>{point.y:.0f}</b>';
                var multipleDeviceData= [],  xLabelArray= [];
                for(var i in objArray){
                    var deviceData= [];
                    for(var j in objArray[i].data){
                        deviceData[j]= {
                            name: objArray[i].data[j].imeiCount,
                            color: highchartProcessData.colorpallete[j],
                            y: objArray[i].data[j].Count
                        }
                    }
                    
                    multipleDeviceData[i]= {
                        options: multipleDevicePieOptions,
                        series: [{
                            type: 'pie',
                            name: objArray[i].Segment,
                            data: angular.copy(deviceData)
                        }] 
                        
                    }
                
                }
                
                $scope.multipleDeviceDataConfig= angular.copy(multipleDeviceData);
                $scope.exportMultipleDevice= angular.copy(objArray); 
                
                $scope.loadingMultipleDevicePieDiv= false;
                $scope.DataMultipleDevicePieDiv= true;
                $scope.noDataMultipleDevicePieDiv= false;  
            }
            else{
                $scope.loadingMultipleDevicePieDiv= false;
                $scope.DataMultipleDevicePieDiv= false;
                $scope.noDataMultipleDevicePieDiv= true;  
        
            }
        })
    }
    
    function appSegmentBar(url){
        
        $scope.loadingAppsSegmentBarDiv= true;
        $scope.DataAppsSegmentBarDiv= false;
        $scope.noDataAppsSegmentBarDiv= false;  
        
        httpService.get(url).then(function(response){
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
        
        httpService.get(url).then(function(response){
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
        
        httpService.get(url).then(function(response){
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

        filterParameters= $scope.filterGetParams();

        switch(currentTab){
                
            case 'RAT':
                handsetStackedBarURL= globalConfig.pullfilterdataurlbyname+"Handset type commonly used"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                handsetStackedBar(handsetStackedBarURL);
                break;
            
            case 'multipleDevice':
                var multipleDeviceURL= globalConfig.pullfilterdataurlbyname+"Multiple Device Swiched segment wise"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                multipleDevice(multipleDeviceURL);
                break;
            
            case 'appSegment':
                appSegmentBarURL= globalConfig.pullfilterdataurlbyname+"App Segment Count"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
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


// Plan/App/ App Segment/ Segment Analytics Controller

function PlanAnalyticsCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams, dbService) {
   
    var filterParameters = "";
    console.log(angular.isDefined($stateParams.params), $stateParams);
    console.log("response.data.name", $scope.headerName);
    var currentPage= $scope.headerName
    if(currentPage== 'Plan Analytics')
        currentPage= 'Plan';
    else if(currentPage== 'Segment Analytics')
        currentPage= 'Segment';
    else if(currentPage== 'App Segment Analytics')
        currentPage= 'AppSegment';
    else 
        currentPage= 'App';
    // -------------------------------------------------------------------------------------


    //Filter Section
      
    var queryParam; 
      
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
      
    var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    fromDate= fromDate.substring(0,8);
    fromDate= fromDate+"01"
    fromDate= "2017-01-15";  toDate= "2017-01-16";
    //$scope.date= {"start": fromDate, "end": toDate};
    
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    var keyPlan;
    if($stateParams.params != null){
        keyPlan= $stateParams.params.Key;
    }
    //console.log("keyPlan", keyPlan);
    //console.log("currentPage", currentPage);
    if(currentPage== "Plan" ){
        if(keyPlan == 'Plan'){
            $scope.select.plan= $stateParams.params.value;
        }
        // else
            // $scope.select.plan= "3G-1.5GB";
    }else if(currentPage== "Segment"){
        if(keyPlan == 'Segment'){
            $scope.select.plan= $stateParams.params.value;
        }
        // else
            // $scope.select.plan= "General";
    }else if(currentPage== "AppSegment"){
        if(keyPlan == 'AppSegment'){
            $scope.select.plan= $stateParams.params.value;
        }
        // else
            // $scope.select.plan= "Browser";
    }else{
        if(keyPlan == 'App')
            $scope.select.plan= $stateParams.params.value;
       // else
            // $scope.select.plan= "Google";
    }
    
    $scope.currentPage= currentPage;
    var planListURL= globalConfig.pulldataurlbyname+currentPage+" Filter";
    var planIDListArr= [], planNameListArr=[], planListArray= [];
    
    function getPlanList(url){
        if(currentPage== "Segment" ){
            $scope.segmentHide= false;
            planListArray= ['VIP','Platinum','Gold','Youth','General','Corporate'];
            $scope.select.plan= planListArray[0]
            $scope.planNameList= angular.copy(planListArray);
            defaultLoad();
    
        }
        else{
            $scope.segmentHide= true;
            httpService.get(url).then(function(response){
               
                var objArray= response.data;
                //console.log("plan list", objArray);
                for(var i in objArray){
                    if(currentPage== "Plan" ){
                        //planIDListArr[i]= objArray[i].PlanID
                        planIDListArr[i]= objArray[i][currentPage]
                        planNameListArr[i]= objArray[i][currentPage]
                    }else if(currentPage== "AppSegment" ){
                        //planIDListArr[i]= objArray[i].AppSegmentId
                        planIDListArr[i]= objArray[i][currentPage]
                        planNameListArr[i]= objArray[i][currentPage]
                    }

                    planListArray[i]= objArray[i][currentPage];
                }
                $scope.select.plan= planListArray[0]
                $scope.planNameList= angular.copy(planListArray);
                defaultLoad();
            })
        }
    }
    
    //End of Filter Section
    //--------------------------------------------------------------
    
    
    $scope.currentTab= 'UsageVsUsers';
    var reverse= null, tab= null, currentPlanID;

    function UsageVsUsers(url){
        
        $scope.loadingUsageVsUsersDiv= true;
        $scope.DataUsageVsUsersDiv= false;
        $scope.noDataUsageVsUsersDiv= false;
        
        httpService.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            $scope.exportUserVsUsage= [];
            //console.log("response", objArray);
            if(objArray.length>0){
                
                var usageData= [], usersData= [], timeArray= [], usageDataArray= [], sessionData= [];
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
                    /*if(currentPage=="App" || currentPage=="AppSegment")
                        usersData[i]= parseFloat(objArray[i].Sessions);
                    else
                        usersData[i]= parseFloat(objArray[i].Users);*/
                    if(angular.isDefined(objArray[i].Sessions)){
                        var duration= parseFloat(objArray[i].Sessions);
                        sessionData[i]= parseFloat(objArray[i].Sessions);
                    }
                }
                //console.log("durationData", durationData);
                //console.log("usageData", usageData);
                var usageVsUsersChartOptions;
                if(sessionData.length>0){
                    usageVsUsersChartOptions=  angular.copy(highchartOptions.highchart3YAxisLinePlusBarLabelDatetimeOptions);
                    
                    usageVsUsersChartOptions.yAxis[0].title.text= "Users";
                    if(currentPage=="App" || currentPage=="AppSegment")
                        usageVsUsersChartOptions.yAxis[2].title.text= "Sessions";
                    $scope.UsageVsUsersChartConfig= {
                        options: usageVsUsersChartOptions,
                        series: [ {
                            name: 'Sessions',
                            type: 'spline',
                            yAxis: 2,
                            color: "#f7a35c",
                            data: sessionData
                        },{
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
                    
                }else{
                    usageVsUsersChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
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
                }
                
                usageVsUsersChartOptions.xAxis.categories= timeArray;
                
                usageVsUsersChartOptions.yAxis[1].title.text= 'Usage('+FormattedusageDataArray[1]+")";
                $scope.exportUserVsUsage= angular.copy(objArray);

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
    
    function segmentUsageDistribution(url, tab){
        
        $scope.loadingsegmentDistributionPieDiv= true;
        $scope.DatasegmentDistributionPieDiv= false;
        $scope.noDatasegmentDistributionPieDiv= false;
        
        httpService.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            $scope.exportSegmentUsageDistribution= [];
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
                    var slice= false;
                    if(i == 0){
                        slice=true
                    }
                    segmenUsageData[i]= {
                        name: objArray[i][tab], 
                        sliced: slice,
                        selected: slice,
                        y: parseFloat(objArray[i].Usage)
                    };
                }

                $scope.segmentDistributionPieChartConfig= {
                    "options" : angular.copy(highchartOptions.highchartPieWoLegendOptions),
                    series: [{
                        name: 'Usage',
                        colorByPoint: true,
                        data: segmenUsageData
                    }]
                }
                $scope.exportSegmentUsageDistribution= angular.copy(objArray);
                
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
    
    function segmentUsageDistributionMultiline(url, tab){
        
        $scope.loadingsegmentUsageDistributionMultilineDiv= true;
        $scope.DatasegmentUsageDistributionMultilineDiv= false;
        $scope.noDatasegmentUsageDistributionMultilineDiv= false;
        
        httpService.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            $scope.exportsegmentUsageDistributionMultiline= [];
            //console.log("response", objArray);
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Usage";
                paramObject.seriesName= tab;
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
                $scope.exportsegmentUsageDistributionMultiline= angular.copy(objArray);
                
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
        
        httpService.get(url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportRATDistribution= [];
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
                RATDistributionBarOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                RATDistributionBarOptions.yAxis.labels= {enabled: false};
                RATDistributionBarOptions.yAxis.stackLabels.formatter= function() {
                    return dataFormatter.formatUsageData(this.total, 2);
                }
                RATDistributionBarOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                RATDistributionBarOptions.plotOptions.column.stacking= 'normal';
                RATDistributionBarOptions.tooltip.shared= true;
                RATDistributionBarOptions.chart.height= 300;
                RATDistributionBarOptions.yAxis.title= {"text":"Usage"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.RATDistributionBarChartConfig= {
                    options: RATDistributionBarOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                var RATDistributionDurationBarOptions= angular.copy(RATDistributionBarOptions);
                paramObject.data= "Duration";
                paramObject.flag= "series";
                // RATDistributionDurationBarOptions.yAxis.labels= {enabled: true};
                RATDistributionDurationBarOptions.yAxis.title=  {"text":"Duration (Min.)"};
                RATDistributionDurationBarOptions.yAxis.stackLabels.formatter= function() {
                    return dataFormatter.formatCountData(this.total, 2);
                }
                $scope.RATDistributionDurationBarChartConfig= {
                    options: RATDistributionDurationBarOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                $scope.exportRATDistribution= angular.copy(objArray);

                $scope.loadingRATDistributionBarDiv= false;
                $scope.DataRATDistributionBarDiv= true;
                $scope.noDataRATDistributionBarDiv= false;
            }else{
                $scope.loadingRATDistributionBarDiv= false;
                $scope.DataRATDistributionBarDiv= false;
                $scope.noDataRATDistributionBarDiv= true;
            }
        })
    }
    
    function AppDistributionBar(url, tab){
        var appDistributionBarChartOptions= {};
        
        $scope.loadingAppDistributionBarDiv= true;
        $scope.DataAppDistributionBarDiv= false;
        $scope.noDataAppDistributionBarDiv= false;
        
        httpService.get(url).then(function(response){
            var appWiseUsageFormatArray= [], appWiseLabelArray= [], appWiseUsageData= [];
            var objArray= response.data;
            $scope.exportAppDistribution= [];
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
                        name: tab+" wise Usage Distribution  ",
                        color: "rgb(39, 174, 96)",
                        data: appWiseUsageData
                    }]
                }
                $scope.exportAppDistribution= angular.copy(objArray);
                  
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
    
    function loadingAppDistributionDurationBar(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingAppDistributionDurationBarDiv= loadingDivStatus;
        $scope.DataAppDistributionDurationBarDiv= dataDivStatus;
        $scope.noDataAppDistributionDurationBarDiv= noDataDivStatus;
    }
    
    function AppDistributionDurationBar(url){
        var appDistributionDurationBarChartOptions= {};
        
       loadingAppDistributionDurationBar(true, false, false);
        
        httpService.get(url).then(function(response){
            var appWiseDurationFormatArray= [], appWiseDurationLabelArray= [], appWiseDurationData= [];
            $scope.exportAppDistribution= [];
            var objArray= response.data;
            if(objArray.length>0){
                //for bar chart data
                
                for(var i=0; i<objArray.length; i++){
                    appWiseDurationLabelArray[i]= objArray[i].Area;
                    appWiseDurationData[i]= parseFloat(objArray[i].Duration);
                }

                appDistributionDurationBarChartOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);

                appDistributionDurationBarChartOptions.xAxis.categories= angular.copy(appWiseDurationLabelArray);

                appDistributionDurationBarChartOptions.tooltip.pointFormat= 'Duration<b> {point.y:.2f} Minutes';

                appDistributionDurationBarChartOptions.yAxis.title.text= "Duration(Min.)";

                $scope.appDistributionDurationBarChartOptions= 
                    {
                    "options" : appDistributionDurationBarChartOptions,
                    "series": [{
                        name: "Area wise Duration Distribution  ",
                        color: "rgb(39, 174, 96)",
                        data: appWiseDurationData
                    }]
                }
                $scope.exportAppDistribution= angular.copy(objArray);
                  
                loadingAppDistributionDurationBar(false, true, false);
            }else{
                loadingAppDistributionDurationBar(false, false, true);
            }
        })
    }
    
    function AppDistributionMultiline(url, tab){
        
        $scope.loadingAppDistributionMultilineDiv= true;
        $scope.DataAppDistributionMultilineDiv= false;
        $scope.noDataAppDistributionMultilineDiv= false;
        
        httpService.get(url).then(function(response){
            var AppUsageArray= [], AppUsageData= [];
            var objArray= response.data;
            $scope.exportAppDistributionMultiline= [];
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
                $scope.exportAppDistributionMultiline= angular.copy(objArray);
                  
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
        
        httpService.get(url).then(function(response){
            var handsetWiseLabelArray= [], handsetWiseCountData= [];
            var objArray= response.data;
            $scope.exportHandsetSessionDistribution= [];
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
                        name: 'Handset Session distribution',
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
                $scope.exportHandsetSessionDistribution= angular.copy(objArray);
                
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
        
        httpService.get(url).then(function(response){
            var handsetWiseUsageFormatArray= [], handsetWiseLabelArray= [], handsetWiseUsageData= [];
            var objArray= response.data;
            $scope.exportHandsetUsageDistribution= [];
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
                $scope.exportHandsetUsageDistribution= angular.copy(objArray);
                
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
    
    function getCEIDistribution(url, key){
        var CEIDistributionChartOptions= {};
        $scope.loadingCEIDiv= true;
        $scope.DataCEIDiv= false;
        $scope.noDataCEIDiv= false;
        
        $scope.CEIChartConfig= null;
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= key;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'percent';
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.legend= {maxHeight: 60};
                CEIDistributionUsersChartOptions.chart.height= 400;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                console.log("highchartProcessData.barColumnProcessHighchartData(paramObject)", highchartProcessData.barColumnProcessHighchartData(paramObject));
                $scope.CEIDistributionChartOptions= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope['export'+key+'Dist']= angular.copy(objArray);

                $scope.loadingCEIDiv= false;
                $scope.DataCEIDiv= true;
                $scope.noDataCEIDiv= false;
            }else{
                $scope.loadingCEIDiv= false;
                $scope.DataCEIDiv= false;
                $scope.noDataCEIDiv= true;
            }
        })
    }

    function defaultLoad(){
        
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();
        
        if(currentPage=="App"){
            reverse= "Plan";
            tab= "Plan";
            $scope.SegOrApp= "Segment"
            $scope.appPageActive= true;
            $scope.UsersOrVisits= 'Visits';
            currentPlanID= $scope.select.plan;
        }else if(currentPage=="Segment"){
            reverse= "App";
            tab= "App";
            $scope.appPageActive= false;
            $scope.SegOrApp= "Plan";
            $scope.UsersOrVisits= 'Users';
            currentPlanID= $scope.select.plan;
        }else if(currentPage=="AppSegment"){
            reverse= "Plan";
            tab= "Plan";
            $scope.appPageActive= false;
            $scope.SegOrApp= "Segment";
            $scope.UsersOrVisits= 'Visits';
            var index= $.inArray($scope.select.plan, planNameListArr);
            currentPlanID= planIDListArr[index];
        }else{
            //console.log("planNameListArr",planNameListArr);
            var index= $.inArray($scope.select.plan, planNameListArr);
            //console.log("planIDListArr", planIDListArr);
            currentPlanID= planIDListArr[index];
            $scope.appPageActive= false;
            $scope.SegOrApp= "Segment"
            $scope.UsersOrVisits= 'Users';
            reverse= "Apps";
            tab= "App";
        }
        $scope.PlanOrApp= tab;
        
        switch($scope.currentTab){
            case 'UsageVsUsers':
                var UsageVsUsersURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Usage vs Users&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                
                UsageVsUsers(UsageVsUsersURL);
                break;
            
            case 'RatDistribution':
                var RATDistributionBarURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise RAT distribution vs total usage&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
               
                RATDistributionBar(RATDistributionBarURL);
                break;
            
            case 'Top20Areas':
                var AppDistributionBarURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise top 20 Areas usage&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                
                var AppDistributionDurationBarURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise top 20 Areas duration&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                
                AppDistributionBar(AppDistributionBarURL, "Area");
                if($scope.appPageActive)
                    AppDistributionDurationBar(AppDistributionDurationBarURL);
                break;
            
            case 'SegmentApps':
                var segmentUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+$scope.SegOrApp+" Usage Distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
        
                var segmentUsageDistributionMultilineURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+$scope.SegOrApp+" Usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
        
                segmentUsageDistribution(segmentUsageDistributionURL, $scope.SegOrApp);
                segmentUsageDistributionMultiline(segmentUsageDistributionMultilineURL, $scope.SegOrApp);
                break;
            
            case 'AppDistribution':
                
                
                var AppDistributionBarURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise top 20 "+reverse+" usage&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                
                var AppDistributionMultilineURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+reverse+" usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
        
                AppDistributionBar(AppDistributionBarURL, tab);
                AppDistributionMultiline(AppDistributionMultilineURL, tab);
                
                break;
            
            case 'HandsetwiseDistribution':
                var handsetWiseCountDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" wise Handset Count Distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
        
                var handsetWiseUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Handset Usage Distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
        
                handsetWiseCountDistribution(handsetWiseCountDistributionURL);
                handsetWiseUsageDistribution(handsetWiseUsageDistributionURL);
                break;

            case 'CEI':
                $scope.CEIDist= {};
                $scope.CEIDist.fileName= $scope.currentPage+' Analytics'+"_CEI"
                $scope.CEIDist.fileHeader= $scope.currentPage+' Analytics'+"_CEI Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between date "+$scope.sDate+" - "+$scope.edate;

                var CEIDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise CEI for date range"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;//+filterParameters;
        
                getCEIDistribution(CEIDistributionURL, 'CEI');
                break;

            case 'Latency':
                $scope.LatDist= {};
                $scope.LatDist.fileName= $scope.currentPage+' Analytics'+"_Latency Distribution"
                $scope.LatDist.fileHeader= $scope.currentPage+' Analytics'+"_Latency Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between date "+$scope.sDate+" - "+$scope.edate;
                var latencyDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" wise Latency for date range"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
        
                getCEIDistribution(latencyDistributionURL, 'Latency');
                break;
        }
  
    }
    
    getPlanList(planListURL);
    
    //plan select event 
    $scope.planSelected= function(){
        defaultLoad();
    }
    
    //dateRange select event
    $scope.click= function(){
        defaultLoad();
    }
    
    //-------------------------------------------------------------------------
    
    /*Advance Export*/

    $scope.export= {};
    $scope.export.format= "Excel";

    function exportData(component, type, name){
        $('#'+component).tableExport({type: type, pdfFontSize:'10',  escape:'false', tableName: name});
        }
    
    $scope.exportTableData =[{IMSI: "Loading..."}];
    function getExportData(url, format) {
        httpService.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0 && objArray != 'null'){
                $scope.exportTableData= objArray;
            }else{
               $scope.exportTableData =[{IMSI: "No Record Found"}];
            }
            exportData('exportTable', $scope.export.format, currentTab);
             
        })
    }

    $scope.exportEvent= function(){
        console.log("format", $scope.export.format);
        
        var exportURL;

        switch(currentTab){
            case 'UsageVsUsers':
                exportURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise export for Filter&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                break;
            
            case 'RatDistribution':
                exportURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise export for Filter&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                break;
            
            case 'Top20Areas':
                exportURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise export for Filter&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                break;
            
            case 'SegmentApps':
                exportURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise export for"+$scope.SegOrApp+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                break;
            
            case 'AppDistribution':
                
                exportURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise export for "+reverse+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
                
                break;
            
            case 'HandsetwiseDistribution':
                exportURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise export for Filter"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID+filterParameters;
        
                break;
        }
        getExportData(exportURL, $scope.export.format);
    }

    /*Advance Export End*/
    //------------------------------------------------------------------------------------
    

    //tab Selected event 
    $scope.tabSelected= function(tab){
        $scope.currentTab= tab;
        defaultLoad();
    }
}

//End Plan/App/ App Segment/ Segment Analytics Controller
//-----------------------------------------------------------------------------------------------------

// Customer Analytics Enter IMSI page Controller
function CustomerAnalyticEnterIMSICtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $stateParams){
    // $scope.customer= {imsi:"919464033444"};
    $scope.customer= {imsi:""};
    //console.log($scope.customer.ip)
    var params= {}
    var selectedDate;
    $scope.dateSelect= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    //$scope.dateSelect= '2016-10-10';
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
function CustomerAnalyticsCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $uibModal , $stateParams, flotChartOptions,  $sce, highchartProcessData, highchartOptions,globalData, $rootScope){
    $scope.customer= {};
    console.log("$stateParams",$stateParams);
    $scope.showUserDetails= false;
    if($stateParams.hasOwnProperty('params') && $stateParams.params != null){
        // $scope.customer= {ip: $stateParams.params.value};
        console.log("$stateParams.params.returnPath", $stateParams.params.returnPath);
        if($stateParams.params.returnPath == undefined){
            $stateParams.params= JSON.parse($stateParams.params); 
            console.log("$stateParams.params", $stateParams.params);
        }   
        $scope.customer= {imsi: $stateParams.params.value};    
        $scope.dateSelect= $stateParams.params.toDate;    
    }else{
        // $scope.customer= {ip: ''};
        $scope.customer= {imsi: '97517122671'};

    }
    
    var colopallette= ['rgb(31, 119, 180)','rgb(255, 127, 14)','rgb(214, 39, 40)','rgb(44, 160, 44)','rgb(148, 103, 189)','rgb(227, 119, 194)','#3E4651','#E7F76D', '#72F274', '#39B4FF'];
    
    var appwiseUsageDetailsURL, usageDetailsURL, headerdetailURL, transactionDetailURL, throughputDetailsURL, hour, usagelast30DaysURL, appDistributionlast30DaysURL, usageValue, hourlyAppwiseUsageURL;
    
    var todayDate= $filter('date')( new Date().getTime(), "yyyy-MM-dd");
    /*if(angular.isDefined($stateParams) && $stateParams.params.hasOwnProperty('date')){
        var getDate= $stateParams.params.date;
        $scope.dateSelect= getDate.substring(0,10);
    }else{
        $scope.dateSelect= todayDate;
    }*/
    
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
    
    var snip= $scope.Snip;
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
                height: 500,
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
    
    //Last 5 location Usage
    // $scope.last5LocationUsage= globalData.custAnalyticsLast5LocationUsage;
    function getLocationUsage(url){
    	httpService.get(url).then(function (response) {
    		var objArray= angular.copy(response.data);
    		if(objArray.length>0)
    			for(var i in objArray){
    				objArray[i].Usage= (objArray[i].Usage/(1024*1024)).toFixed(2);
    			}
    			$scope.last5LocationUsage= angular.copy(objArray);
    	})
    }
    
    //Top Protocol Usage
    $scope.topProtocolUsage= globalData.custAnalyticsTopProlocalsUsage;
    function getProtocolUsage(url){
    	httpService.get(url).then(function (response) {
    		var objArray= angular.copy(response.data);
    		if(objArray.length>0)
    			$scope.topProtocolUsage= angular.copy(objArray);
    	})
    }

    //RAT Distribution
    function getRATDistribution(url){
    	httpService.get(url).then(function (response) {
    		var objArray= angular.copy(response.data);
    		if(objArray.length>0){
    			for(var i in objArray)
    				objArray[i].Usage= (objArray[i].Usage/(1024*1024)).toFixed(2);

    			$scope.ratDistribution= angular.copy(objArray);
    		}
    	})
    }

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
        /*var validatedArray= [],lineArray= [];
        for(var i=0;i<24;i++){
            validatedArray[i]= 0;
            lineArray[i]= 0;
        }*/
        
        httpService.get(url).then(function (response) {
            var objArray = response.data;//globalData.custAnalyticsUsageToday//
            //var ab= dataFormatter.convertSingleUnitThroughputData(objArray[0].PeakThroughput,1,"Kbps");
            console.log("response:",objArray);
            //console.log("length",Object.keys(objArray[0]).length)
            if(objArray.length>0){
                
                valData= angular.copy(objArray);
                //console.log("valData", valData);
                // var obj= {"CEI":"0", "AvgLatency":"-", "Usage":"-", "Throughput":"-", "PeakLatency": "-"}, Arr= [], index=-1;
                var obj= {"CEI":"0", "AvgLatency":"-", "Usage":"-", "PeakLatency": "-"}, Arr= [], index=-1;
                
                for(var i=0; i<24; i++){
                    Arr[i]= angular.copy(obj); 
                }
                
               /* angular.forEach(valData, function(value, key){
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
                }*/

                for(var i=0;i<24;i++){
                    
                    if(valData[i].hasOwnProperty("Usage")){
                        
                        if(valData[i].Usage != null|| valData[i].Usage>0){
                            
                            Arr[i].Usage = valData[i].Usage;
                            if(valData[i].hasOwnProperty("Latency")){
                                
                                if(valData[i].Latency == null || valData[i].Latency <= 0){
                                    Arr[i].AvgLatency = "0";
                                }else{
                                    if(valData[i].Sessions== null || valData[i].Sessions== 0)
                                        Arr[i].AvgLatency = '0';
                                    else
                                        Arr[i].AvgLatency = (valData[i].Latency/valData[i].Sessions).toFixed(0);
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
                            
                            /*if(valData[i].hasOwnProperty("Throughput")){
                                if(valData[i].Throughput != null)
                                    Arr[i].Throughput = valData[i].Throughput; 
                            }*/
                            
                        }
                        
                    }
                    
                }
                // console.log("validatedArray", validatedArray);

                //----------------------Bar Chart Data---------------------------
                for(var i=0; i<objArray.length;i++){
                    if(objArray[i].hasOwnProperty("Usage") && objArray[i].Usage!="null"){
                        barArray[i]= objArray[i].Usage; 
                    }
                    else{
                        barArray[i]= "0";
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
                    
                    /*if(typeof(Arr[i].Throughput)=="number"){
                        Throughput[i]= dataFormatter.formatBwBitsData(Arr[i].Throughput,1); 
                    }
                    else{
                        Throughput[i]=  Arr[i].Throughput
                    }*/ 
                    
                }

                var AvgLatency1=[];
                var PeakLatency1=[];

                var Throughput1 = [];
                var tableUsageData1= [];

                for (var i = 0; i < 24; i++) {
                    tableUsageData1[i]= setIndicator(tableUsageData[i],avgThroughputTrasholdKbps,false,false);
                    AvgLatency1[i]= setIndicator(AvgLatency[i],avgLatencyTrasholdms,false,true);
                    PeakLatency1[i]= setIndicator(PeakLatency[i],avgLatencyTrasholdms,false,true);
                    /*Throughput1[i]= setIndicator(Throughput[i],avgThroughputTrasholdKbps,false,false);*/
                }

                rowDataArray[0]= ['Usage', tableUsageData1];
                rowDataArray[1]= ['Avg.Latency(ms)', AvgLatency1];
                rowDataArray[2]= ['PeakLatency(ms)', PeakLatency1];
                // rowDataArray[3]= ['Throughput', Throughput1];
                //console.log("rowDataArray", rowDataArray);

                $scope. colArray = colArray;
                //$scope.rowArray = rowArray;
                $scope.dataTableOptionsDetails= dataTableOptionsDetails;
                $scope.rowDataArray = rowDataArray;

                //------------------------Header Data------------------------------------
                $scope.usage= dataFormatter.formatUsageData(objArray[0].TotalUsage,2);
                $scope.peakThroughput= dataFormatter.formatBwBitsData(objArray[0].PeakThroughput,2)
                
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
            
        // if(angular.isDefined($scope.dataHorizontalBar)){
            //console.log("$scope.dataHorizontalBar", $scope.dataHorizontalBar)
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
        // }
        
        httpService.get(url).then(function (response) {
            //console.log("response:", response.data);
            var objArray = response.data;//globalData.custAnalyticsAppToday//
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
            
        httpService.get(hourlyURL).then(function (response) {
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
        
        httpService.get( url).then(function (response) {
            var objArray= response.data;
            console.log("objArray",objArray);
            if(objArray.length>0 ){
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
        
        httpService.get(url).then(function (response) {
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
        httpService.get(url).then(function(response){
            var objArray= response.data;//globalData.custAnalyticsUsage30days//
            //console.log("objArray", objArray);
            if(objArray.length>0){
                var usageFormatArray= [], usagelast30DaysArray= [];
                for(var i=0; i<objArray.length; i++){
                	if(objArray[i].hasOwnProperty('Usage'))
                    	usageFormatArray[i]= objArray[i].Usage;
                    else
                    	usageFormatArray[i]= '0';    
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
                                    xDateFormat: "%e. %b",
                                    //headerFormat: '<b>{series.name}</b><br>',
                                    pointFormat: 'Usage<b> {point.y:.2f} '+ usageFormattedArray[1],
                                    "shared": true
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
        httpService.get(appURL).then(function(response){
            var objArray= response.data;//globalData.custAnalyticsApp30days;//
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
        httpService.get(url).then(function (response) {
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
    
    function transactionDetailsMakeURL(imsi){
        $scope.transactionDetailsTab= {active: true};
        console.log("$scope.imsi", imsi);
        transactionDetailURL= globalConfig.clistenerMobility+imsi+"&fordate="+$scope.dateSelect+" "+$scope.hour;
        transactionDetails(transactionDetailURL);
    }
    
    function filteredTransactionDetails(filterParam){
        
        if(angular.isDefined(filterParam)){
            
            $scope.infoLine= true;
            $scope.protocol= null;
            $scope.usageFilter= null;
            
            transactionDetailURL= globalConfig.clistener+$scope.imsi+"&fordate="+$scope.dateSelect+" "+$scope.hour;
            
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
    $scope.imsi= null;
    function getCustDetails(url){
    	httpService.get(url).then(function (response) {
            var objArrayUserDetails= response.data;//globalData.custAnalyticsUserDetails//
            $scope.imsi= objArrayUserDetails[0].IMSI;
            $scope.billPlan= objArrayUserDetails[0].BillPlan;
            $scope.segment= objArrayUserDetails[0].Segment;
            $scope.lastKnownCell= objArrayUserDetails[0].LastKnownCell;
            $scope.brand= objArrayUserDetails[0].Brand;
            $scope.simSlot= objArrayUserDetails[0].SimSlots;
            $scope.pdpCreate= objArrayUserDetails[0].PDPCreate;
            $scope.pdpUpdate= objArrayUserDetails[0].PDPUpdate;
            $scope.pdpDelete= objArrayUserDetails[0].PDPDelete;
            $scope.lastAPN= objArrayUserDetails[0].APN;
            $scope.model= "("+objArrayUserDetails[0].Model+")";
            $scope.Capability= objArrayUserDetails[0].ModelCapability;
            $scope.updateTime= objArrayUserDetails[0].LastUpdated;
            
        });
    
    }

    function getGTPctransactionDetails(url){
        $scope.loadingGTPctransactionDetailsDiv= true;
        $scope.noDataGTPctransactionDetailsDiv= false;

        $scope.colObj= {};
        $scope.transactionDetailGTPc= [];
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            
            if(objArray.length>0){
                $scope.colObj= angular.copy(objArray[0]);
                $scope.transactionDetailGTPc= angular.copy(objArray);
                $scope.loadingGTPctransactionDetailsDiv= false;
                $scope.noDataGTPctransactionDetailsDiv= false;
            }else{
                $scope.loadingGTPctransactionDetailsDiv= false;
                $scope.noDataGTPctransactionDetailsDiv= true;

            }
        })
    }

    function defaultLoad(currentTab){
        $rootScope.filter= {};
        console.log("$scope.customer.imsi", $scope.customer.imsi.length);
        if($scope.customer.imsi.length > 0){
            $scope.showUserDetails=true
            }else{
            $scope.showUserDetails= false;
        }
            // console.log("inside if");
        	var custDetailsURL= globalConfig.pulldataurlbyname+"Customer Details for userid&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
        	   (custDetailsURL);

            switch(currentTab){
                case 'usage':
                    $scope.datepickerShow= true;
                    usageDetailsURL= globalConfig.pulldataurlbyname+"Usage for selected userid&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
                    var locationUsageURL= globalConfig.pulldataurlbyname+"Customer Analytics Location wise Usage for selectec userid&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
                    var RATDistributionURL= globalConfig.pulldataurlbyname+"RAT wise usage for selected userid&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
                    //var usageDetailsURL= globalConfig.pulldataurlbyname+"Usage for selected userid&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
                    
                    usageDetails(usageDetailsURL);
                    getLocationUsage(locationUsageURL);
                    getRATDistribution(RATDistributionURL);
                    //getProtocolUsage(url);
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
                
                case 'GTPctransactionDetails':
                    $scope.datepickerShow= true;
                    var GTPctransactionDetailsURL= globalConfig.pulldataurlbyname+"Customer GTPc Trancastions&userid="+$scope.customer.imsi+"&fromDate="+$scope.dateSelect;
                    
                    getGTPctransactionDetails(GTPctransactionDetailsURL);
                    break;
                
                case 'transactionDetails':
                    
                    $scope.datepickerShow= true;
                    $scope.selectMin.min= "00-09";
                    $scope.select.hour= "00:00";
                    $scope.hour= "00:00";
                    transactionDetailsMakeURL($scope.imsi);
                    break;
                
                case 'usage30Days':
                    $scope.datepickerShow= false;
                    
                    appDistributionlast30DaysURL= globalConfig.pullfilterdataurlbyname+'Customer App distribution for last 30 days&userid='+$scope.imsi;
                    
                    usagelast30DaysURL= globalConfig.pullfilterdataurlbyname+'User usage last 30 days&userid='+$scope.imsi;
                    
                    usagelast30Days(usagelast30DaysURL, appDistributionlast30DaysURL);
                    break;
            }
        
    }
    
    // console.log("param ", $stateParams.params.value);
    // $scope.customer= {imsi: $stateParams.params.value};
    
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
    
    defaultLoad(currentTab);
    $scope.showUserDetails=true;
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
    $scope.minSelected= function(imsi){
        console.log("select.Min", $scope.selectMin.min);
        var min= $scope.selectMin.min.split( '-');
        console.log("min", min[0]);
        hour= $scope.select.hour.substring(0,3);
        console.log("hour", hour);
        $scope.hour= hour+min[0];
        transactionDetailsMakeURL(imsi)
    }
    
    // Filter Click event
    $scope.filterClicked= function(){
        
        // model window
        var modalInstance = $uibModal.open({
            templateUrl: 'views/static/modelFilterTransactionDetails.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope, $uibModalInstance, $timeout) {
            
            //Usage Dropdown
            $scope.filter= {};
            $scope.filter.operator= '>';
            $scope.filter.unit= 'Bytes';
            $scope.operator= [{'operator': '>'}, {'operator': '<'}, {'operator': '='}]
            $scope.unit= [{'unit': 'Bytes'}, {'unit': 'KB'}, {'unit': 'MB'}, {'unit': 'GB'}]
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
            
            //save filter options
            $scope.saveFilterOption= function(filter){
                var operator, unit;
                $uibModalInstance.close();
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
        var modalInstance = $uibModal.open({
            templateUrl: 'views/static/modelVPSTransactionDetails.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope, $uibModalInstance, $timeout) {
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
                $$uibModalInstance.dismiss('cancel');
            };
            /*
            * volume per session
            */
            
            var vpsURL= globalConfig.clistenervpsMobility+key;/*"http://27.147.153.186:8080/JRServer/CListener?action=querysession&key="*/
            // console.log(scURL);
            httpService.get(vpsURL).then(function (response) { 
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

//App Performance Controller
function appPerformanceCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams, dbService){
    
    var currentTab= 'DevicesHighLatency';
    var filterParameters = "";
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    //datepicker options
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    //$scope.date= {"end": '2017-01-15'};
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    
    
    // App filter
    $scope.select= { };
    // $scope.select.App= "Youtube";
    
    var appListURL= globalConfig.pulldataurlbyname+"App Filter";
    
    function getAppList(url){
        httpService.get(url).then(function(response){
            var appListArray= [];
            var objArray= response.data;
            //console.log("plan list", objArray);
            for(var i in objArray){
                appListArray[i]= objArray[i].App;
            }
            $scope.select.App= appListArray[0];
            $scope.appNameList= angular.copy(appListArray);
        })
    }
    
    getAppList(appListURL);
    
    //End of Filter Section
    //--------------------------------------------------------------
    function loadingAppDistributionBar(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingLatencyBarDiv= loadingDivStatus;
        $scope.DataLatencyBarDiv= dataDivStatus;
        $scope.noDataLatencyBarDiv= noDataDivStatus;
    }
    
    function AppDistributionBar(url, tab){
        var appDistributionBarChartOptions= {};
        
        loadingAppDistributionBar(true, false, false)
        
        httpService.get(url).then(function(response){
            var appWiseLabelArray= [], appWiseLatencyData= [];
            var objArray= response.data;
            $scope.exportAppDistribution= [];
            if(objArray.length>0){
                //for bar chart data
                
                for(var i=0; i<objArray.length; i++){
                    appWiseLabelArray[i]= objArray[i][tab];
                    appWiseLatencyData[i]= parseFloat(objArray[i].PeakLatency);
                }

                appDistributionBarChartOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);

                appDistributionBarChartOptions.xAxis.categories= angular.copy(appWiseLabelArray);

                appDistributionBarChartOptions.tooltip.pointFormat= 'Latency<b> {point.y:.2f} ms';

                appDistributionBarChartOptions.yAxis.title.text= "Latency(ms)";

                $scope.HighLatencyBarChartConfig= 
                    {
                    "options" : appDistributionBarChartOptions,
                    "series": [{
                        name: tab+" wise Latency",
                        color: "rgb(39, 174, 96)",
                        data: appWiseLatencyData
                    }]
                }
                $scope.exportAppDistribution= angular.copy(objArray)
                  
                loadingAppDistributionBar(false, true, false);
            }else{
                loadingAppDistributionBar(false, false, true);
            }
        })
    }
    
    function loadinglatencyCEIPie(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingsLatencyDistributionCEIPieDiv= loadingDivStatus;
        $scope.DataLatencyDistributionCEIPieDiv= dataDivStatus;
        $scope.noDataLatencyDistributionCEIPieDiv= noDataDivStatus;
    }
    
    function latencyCEI(url){
        
        loadinglatencyCEIPie(true, false, false)
        
        httpService.get(url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= 'Latency';
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                // console.log("paramObject", paramObject);
                
                var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                OLTDistributionUsersChartOptions.xAxis.labels.format= "{value:%I:%M %p}";
                OLTDistributionUsersChartOptions.yAxis.stackLabels.enabled= false;
                OLTDistributionUsersChartOptions.legend= {maxHeight: 60};
                /*OLTDistributionUsersChartOptions.yAxis.stackLabels.formatter= function() {
                    return dataFormatter.formatUsageData(this.total, 2);
                }*/
                OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                // OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                OLTDistributionUsersChartOptions.tooltip.shared= false;
                OLTDistributionUsersChartOptions.chart.height= 400;
                // OLTDisssssstributionUsersChartOptions.yAxis.title= {"text":"Subscribers"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.LatencyDistributionPieChartConfig= {
                    options: OLTDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportLatencyCEI= angular.copy(objArray);

                loadinglatencyCEIPie(false, true, false);
            }else{
                loadinglatencyCEIPie(false, false, true);
            }
        })

        /*httpService.get(url).then(function(response){
            var segmenUsageData= [];
            var objArray= response.data[0].LatencyCEI;
            $scope.exportLatencyCEI= [];
            console.log("response", objArray);
            if(objArray.length>0){
                var pieColor= highchartProcessData.colorpallete;
                //for pie chart data
                for(var i=0; i<objArray.length; i++){
                    segmenUsageData[i]= {
                        name: objArray[i].LatencyCEI, 
                        color: pieColor[i],
                        y: parseFloat(objArray[i].Count)
                    };
                }

                $scope.LatencyDistributionPieChartConfig= {
                    "options" : angular.copy(highchartOptions.highchartPieWoLegendOptions),
                    series: [{
                        name: 'CEI',
                        colorByPoint: true,
                        data: segmenUsageData
                    }]
                }
                $scope.exportLatencyCEI= angular.copy(objArray);
                
                loadinglatencyCEIPie(false, true, false)
            }else{
                loadinglatencyCEIPie(false, false, true)
            }
        })*/
    }
    
    function defaultLoad(){
        
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();
        
        switch(currentTab){
            case 'DevicesHighLatency':
                var DevicesHighLatencyBarURL= globalConfig.pullfilterdataurlbyname+"App wise top devices with high latency&fromDate="+$scope.date.end+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&App="+$scope.select.App+filterParameters;
                
                AppDistributionBar(DevicesHighLatencyBarURL, "Device");
                break;
            
            case 'AreasHighLatency':
                var AreasHighLatencyBarURL= globalConfig.pullfilterdataurlbyname+"App wise top Area with high latency&fromDate="+$scope.date.end+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&App="+$scope.select.App+filterParameters;
               
                AppDistributionBar(AreasHighLatencyBarURL, "Area");
                break;
            
            case 'LatencyDistributionCEI':
                var LatencyDistributionPieURL= globalConfig.pullfilterdataurlbyname+"App wise latency distribution&fromDate="+$scope.date.end+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&App="+$scope.select.App+filterParameters;
                
                latencyCEI(LatencyDistributionPieURL);
                break;
            
            case 'latencyPerDay':
               break;
               
        }
  
    }
    
    defaultLoad();
    
    //app select event 
    $scope.appSelected= function(){
        defaultLoad();
    }
    
    //dateRange select event
    $scope.click= function(){
        defaultLoad();
    }
    
    //change Date event
    $scope.changeDate=function (modelName, newDate) {
        $scope.date.end= newDate.format("YYYY-MM-DD");
    }
    
    //tab Selected event 
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
}
// End App Performance Controller
//    ----------------------------------------------------------------------------

// User Analytics Controller
function userUniqueAnalyticsCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,highchartOptions, locationFilterService, highchartProcessData, filterService, dbService) {
    
    var filterParameters = "";
    var currentTab= "usersDaywise";
    var usersHourlyURL, usersPlanwiseURL, usersDaywiseURL, usersSegmentwiseURL;
    $scope.dateTab= false;
    //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    var fromDate= $filter('date')( new Date().getTime() -7*24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    fromDate= "2017-01-17";  toDate= "2017-01-19";
    //$scope.date= {"start": fromDate, "end": toDate};
    
    var selectedDate;
    $scope.dateSelect= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");;
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    $scope.changeDate=function (modelName, newDate) {
        selectedDate= newDate.format();
        console.log("selected Date", selectedDate);
        selectedDate= selectedDate.substring(0,10);
        $scope.date.start= selectedDate
    }
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    
    function usersHourly(url){
        
        $scope.loadingUsersHourlyDiv= true;
        $scope.DataUsersHourlyDiv= false;
        $scope.noDataUsersHourlyDiv= false;  
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportUsersHourly= [];
            if(objArray.length>0){
                var totalUsersData= [], activeUsersData= [], offlineUsersData= [], xLabelArray= [];
                for(var i in objArray){
                    totalUsersData[i]= objArray[i].Total;
                    activeUsersData[i]= objArray[i].Active;
                    offlineUsersData[i]= objArray[i].Offline;
                    xLabelArray[i]= objArray[i].Hour;
                    if(currentTab=='usersHourly' ){
                        xLabelArray[i]= objArray[i].Hour;
                    }else{
                        xLabelArray[i]= objArray[i].Date;
                    }
                   
                }
                
                var usersHourlyOptions= angular.copy(highchartOptions.highchartAreaLabelDatetimeOptions);
                usersHourlyOptions.xAxis.categories= xLabelArray;
                
                if(currentTab=='usersHourly' ){
                    usersHourlyOptions.xAxis.labels= {
                        "format": "{value:%I:%M %p}",
                        "align": "left"
                    };
                }else{
                    usersHourlyOptions.xAxis.labels= {
                        "format": "{value:%e %b}",
                        "align": "left"
                    };
                }
                var hourlyUsersColor= highchartProcessData.colorpallete;
                
                $scope.UsersHourlyChartConfig= {
                    options: usersHourlyOptions,
                    series: [{
                        color: hourlyUsersColor[0],
                        name:"Total Users", 
                        data: totalUsersData
                    },{
                        type: 'area',
                        name:"Active Users", 
                        color: hourlyUsersColor[1],
                        data: activeUsersData
                    },{
                        type: 'area',
                        name:"Offline Users", 
                        color: hourlyUsersColor[2],
                        data: offlineUsersData
                    }]
                }
                $scope.exportUsersHourly= angular.copy(objArray);

                $scope.loadingUsersHourlyDiv= false;
                $scope.DataUsersHourlyDiv= true;
                $scope.noDataUsersHourlyDiv= false; 
            }
            else{
                $scope.loadingUsersHourlyDiv= false;
                $scope.DataUsersHourlyDiv= false;
                $scope.noDataUsersHourlyDiv= true;  
        
            }
        })
    }
    
    function usersPlanSegmentwise(url, tab){

        $scope.loadingUsersPlanwiseDiv= true;
        $scope.DataUsersPlanwiseDiv= false;
        $scope.noDataUsersPlanwiseDiv= false;  
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportPlanSegment= [];
            if(objArray.length>0){
                var hourlyUsersColor= highchartProcessData.colorpallete;
                
                var totalUsersData= [], activeUsersData= [], offlineUsersData= [], xLabelArray= [];
                for(var i in objArray){
                    totalUsersData[i]= objArray[i].Total;
                    activeUsersData[i]= objArray[i].Active;
                    offlineUsersData[i]= objArray[i].Offline;
                    xLabelArray[i]= objArray[i][tab];
                }
                   
                var usersPlanwiseOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                usersPlanwiseOptions.xAxis.categories= xLabelArray;
                
                
                $scope.UsersPlanwiseChartConfig= {
                    options: usersPlanwiseOptions,
                    series: [{
                        name:"Active Users", 
                        color: hourlyUsersColor[1],
                        data: activeUsersData
                    },{
                        name:"Offline Users", 
                        color: hourlyUsersColor[2],
                        data: offlineUsersData
                    }]
                }
                $scope.exportPlanSegment= angular.copy(objArray);

                $scope.loadingUsersPlanwiseDiv= false;
                $scope.DataUsersPlanwiseDiv= true;
                $scope.noDataUsersPlanwiseDiv= false;  
        
            }
            else{
                $scope.loadingUsersPlanwiseDiv= false;
                $scope.DataUsersPlanwiseDiv= false;
                $scope.noDataUsersPlanwiseDiv= true;  
          

            }
        })
    }
    
    function defaultLoad(){
       
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();

        switch(currentTab){
                
            case 'usersDaywise':
                $scope.dateTab= true;
                var dateArray= [];
                var fDateMilli= new Date($scope.date.start).getTime();
                var tDateMilli= new Date($scope.date.end).getTime();
                console.log("fDateMilli", fDateMilli);
                console.log("tDateMilli", tDateMilli);
                for(var i=fDateMilli; i <= tDateMilli; i=i+24*3600*1000){
                    console.log("i",i);
                    var temp= $filter('date')( i , "yyyy-MM-dd");
                    console.log("temp", temp);
                    dateArray.push("ISODate('"+temp+"T23:00:00.000Z')");
                }
                console.log("dateArray", dateArray);
                
                usersDaywiseURL= globalConfig.pullfilterdataurlbyname+"Unique Users Day wise"+"&fromDate="+dateArray+filterParameters;
                
                usersHourly(usersDaywiseURL);
                break;
            
            case 'usersHourly':
                $scope.dateTab= false;
                usersHourlyURL= globalConfig.pullfilterdataurlbyname+"Unique Users Hourly"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                usersHourly(usersHourlyURL);
                break;
            
            case 'usersPlanwise':
                $scope.dateTab= false;
                usersPlanwiseURL= globalConfig.pullfilterdataurlbyname+"Unique Users Plan wise"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                usersPlanSegmentwise(usersPlanwiseURL, 'Plan');
                break;
            
            case 'usersSegmentwise':
                $scope.dateTab= false;
                usersSegmentwiseURL= globalConfig.pullfilterdataurlbyname+"Unique Users Segment wise"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                usersPlanSegmentwise(usersSegmentwiseURL, 'Segment');
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
// End User Analytics Controller
//    ----------------------------------------------------------------------------

// CEI Analytics Controller
function CEIAnalyticsCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, dbService) {
    
    var filterParameters = "";
    var currentTab= "Segment";
    
    //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    var selectedDate;
    //$scope.date= '2016-10-07';//$filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");;
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    $scope.changeDate=function (modelName, newDate) {
        selectedDate= newDate.format();
        console.log("selected Date", selectedDate);
        selectedDate= selectedDate.substring(0,10);
        $scope.dateSelect= selectedDate
    }
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    
    function loadingCEI(loadingCEIStatus, DataCEIStatus, noDataCEIStatus){
        $scope.loadingCEIDiv= loadingCEIStatus;
        $scope.DataCEIDiv= DataCEIStatus;
        $scope.noDataCEIDiv= noDataCEIStatus; 
    }
    
    function CEIDataProcess(url, tab){
        
        loadingCEI(true, false, false);
        
        httpService.get(url).then(function(response){
            
            var objArray= response.data;
            //console.log("multiline", objArray);
            if(objArray.length>0){
                
                var paramObject= {}, processedCEIData= [];
                paramObject.objArray= objArray;
                paramObject.label= tab;
                paramObject.data= 'Count';
                paramObject.seriesName= "CEI";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                var CEIChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelCategoriesOptions);
                CEIChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                CEIChartOptions.yAxis.title.text="Count";
                CEIChartOptions.yAxis.stackLabels.formatter= function() {
                    return dataFormatter.formatCountData(this.total, 2);
                }
                CEIChartOptions.chart.height= 400;
                
                for(var i in objArray){
                    var CEICount= [];
                    for(var j in objArray[i].data){
                        CEICount[j]= objArray[i].data[j].Count;
                    }
                    //console.log("dataCount", dataCount);
                    
                    processedCEIData[i]= {
                        name: objArray[i].CEI,
                        data: CEICount
                    }
                    //console.log("dataFinal", dataFinal);
                }
                
                $scope.CEIChartConfig={
                    options: CEIChartOptions,
                    series: processedCEIData
                } 
                
                loadingCEI(false, true, false);
            }
            else{
                loadingCEI(false, false, true); 
            }
        })
    }
    loadingCEI(true, false, false);
    function CEISegmentDataProcess(url, tab){
        
        var objArray= [{"data":[{"Count":66000,"Segment":"Youth"},{"Count":1725000,"Segment":"General"},{"Count":4000,"Segment":"VIP"},{"Count":6000,"Segment":"Platinum"},{"Count":11000,"Segment":"Gold"},{"Count":7000,"Segment":"Corporate"}],"CEI":"Excellent"},{"data":[{"Count":49000,"Segment":"Youth"},{"Count":263000,"Segment":"General"},{"Count":29000,"Segment":"VIP"},{"Count":98000,"Segment":"Platinum"},{"Count":153000,"Segment":"Gold"},{"Count":8000,"Segment":"Corporate"}],"CEI":"Very Good"},{"data":[{"Count":424000,"Segment":"Youth"},{"Count":612000,"Segment":"General"},{"Count":17000,"Segment":"VIP"},{"Count":202000,"Segment":"Platinum"},{"Count":402000,"Segment":"Gold"},{"Count":23000,"Segment":"Corporate"}],"CEI":"Good"},{"data":[{"Count":151000,"Segment":"Youth"},{"Count":637000,"Segment":"General"},{"Count":5000,"Segment":"VIP"},{"Count":201000,"Segment":"Platinum"},{"Count":272000,"Segment":"Gold"},{"Count":14000,"Segment":"Corporate"}],"CEI":"Average"},{"data":[{"Count":116000,"Segment":"Youth"},{"Count":55000,"Segment":"General"},{"Count":98000,"Segment":"VIP"},{"Count":26000,"Segment":"Platinum"},{"Count":79000,"Segment":"Gold"},{"Count":3000,"Segment":"Corporate"}],"CEI":"Poor"},{"data":[{"Count":104000,"Segment":"Youth"},{"Count":192000,"Segment":"General"},{"Count":1000,"Segment":"VIP"},{"Count":89000,"Segment":"Platinum"},{"Count":28000,"Segment":"Gold"},{"Count":39000,"Segment":"Corporate"}],"CEI":"Pathetic"}];
            //console.log("multiline", objArray);
        if(objArray.length>0){
                
            var paramObject= {}, processedCEIData= [];
                paramObject.objArray= objArray;
                paramObject.label= tab;
                paramObject.data= 'Count';
                paramObject.seriesName= "CEI";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                var CEIChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelCategoriesOptions);
                CEIChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                CEIChartOptions.yAxis.title.text="Count";
                CEIChartOptions.chart.height= 400;
                
                for(var i in objArray){
                    var CEICount= [];
                    for(var j in objArray[i].data){
                        CEICount[j]= objArray[i].data[j].Count;
                    }
                    //console.log("dataCount", dataCount);
                    
                    processedCEIData[i]= {
                        name: objArray[i].CEI,
                        data: CEICount
                    }
                    //console.log("dataFinal", dataFinal);
                }
                
                $scope.CEIChartConfig={
                    options: CEIChartOptions,
                    series: processedCEIData
                } 
                
                loadingCEI(false, true, false);
            }
            else{
                loadingCEI(false, false, true); 
            }
      
    }
    function defaultLoad(){
       
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();

        switch(currentTab){
                
            case 'Segment':
                var segmentwiseCEIURL= globalConfig.pullfilterdataurlbyname+"CEI Segment wise"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z"+filterParameters;
                
                CEIDataProcess(segmentwiseCEIURL, currentTab);
                break;
            
            case 'Device':
                var devicewiseCEIURL= globalConfig.pullfilterdataurlbyname+"CEI Device wise"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z"+filterParameters;
                
                CEIDataProcess(devicewiseCEIURL, currentTab);
                break;
            
            case 'City':
                var citywiseCEIURL= globalConfig.pullfilterdataurlbyname+"CEI City wise"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z"+filterParameters;
                
                CEIDataProcess(citywiseCEIURL, currentTab);
                break;
            
        }
    }
    
    defaultLoad();
    
    //Tab selected event
    
    $scope.tabSelected= function(tab){
        if(tab=='City'){
            $scope.selKeysLocation= ['404.7.3233','404.7.3251','404.7.3278','404.7.3280','404.7.3285','404.7.3306','404.7.3307','404.7.3319'];
            //var node = $("#location").dynatree("getTree").getNodeByKey(topDevice);
            //node.select(deviceStatus);    
        }
        
        currentTab= tab;
        defaultLoad();
    }
    
    // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
}
// End CEI Analytics Controller
//    ----------------------------------------------------------------------------

//Smart Network Controller
function smrtNtwrkCtrl($scope,httpService,globalConfig,$filter,$timeout,dataFormatter, highchartOptions,  highchartProcessData, filterService, dbService){
    
    var currentTab= 'IUPS';
    var filterParameters = "";
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    var fromDate= $filter('date')( new Date().getTime() -5*24*3600*1000, "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    //$scope.date= {"start": '2016-10-02' ,"end": '2016-10-07'};
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    function loadingBWUtilization(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingBWUtilizationDiv= loadingDivStatus;
        $scope.dataBWUtilizationDiv= dataDivStatus;
        $scope.noDataBWUtilizationDiv= noDataDivStatus;
    }
    
    function BWUtilization(url, tab){
        var BWUtilizationChartOptions= {};
        
        loadingBWUtilization(true, false, false)
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            var selectedInterface = [], ProvisionedBWArr = [],IUPSData=[], labelArray= [];

            if(objArray.length>0){
                for(var i=0;i<objArray.length;i++)
                 {
                     var Provisioned;
                     for(var k =0;k<objArray[i].data.length;k++)
                     {
                         var BW = objArray[i].data[k].BW;
                         selectedInterface[k]=BW;
                     }
                     
                     Provisioned  = Math.max.apply(null,selectedInterface) 
                     for(var k =0;k<objArray[i].data.length;k++)
                     {
                         labelArray[k]= objArray[i].data[k].Date;
                         var BW = objArray[i].data[k].BW;
                         selectedInterface[k]=BW;
                         ProvisionedBWArr[k] = parseFloat(Provisioned) + 1;
                        //console.log(selectedInterface);
                     }


                     BWUtilizationChartOptions= angular.copy(highchartOptions.highchartAreaLabelDatetimeOptions);
                     BWUtilizationChartOptions.xAxis.categories= labelArray;
                     BWUtilizationChartOptions.chart.zoomType= 'x';
                     BWUtilizationChartOptions.xAxis.labels= {
                         "format": "{value:%e %b %I:%M %p}",
                         "align": "left"
                     };
                     if(tab=='GN'){
                         BWUtilizationChartOptions.yAxis.title.text= 'Gbps';
                     }else{
                         BWUtilizationChartOptions.yAxis.title.text= 'Mbps';
                     }
                     IUPSData[i] = {
                         "options" : BWUtilizationChartOptions,
                         "series": [{
                             type:'area',
                             zoomType:'x',
                             name: objArray[i].Interface,
                             color: highchartProcessData.colorpallete[i+1],
                             data: angular.copy(selectedInterface)
                         },{
                             name: "Provisioned BW",
                             zoomType:'x',
                             color: "#f15c80",
                             data: angular.copy(ProvisionedBWArr)
                         }]
                    }                      
                 }
               
                $scope.HighLatencyBarChartConfig= IUPSData;
                  
                loadingBWUtilization(false, true, false);
            }else{
                loadingBWUtilization(false, false, true);
            }
        })
    }
    
    function defaultLoad(){
        
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();
        switch(currentTab){

            case 'IUPS':
                var IUPSBWUtilizationURL = globalConfig.pullfilterdataurlbyname+"IUPS BW Utilization&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
                
                BWUtilization(IUPSBWUtilizationURL, currentTab);
                break;
            
            case 'GN':
                var GNBWUtilizationURL = globalConfig.pullfilterdataurlbyname+"GN BW Utilization&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;
               
                BWUtilization(GNBWUtilizationURL, currentTab);
                break;
        }
  
    }
    
    defaultLoad();
    
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
// End Smart Network Controller
//    ----------------------------------------------------------------------------

// Handover Distribution Controller
function handoverDistributionCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,uiGmapGoogleMapApi, locationFilterService, $sce, filterService ) {
    
    var initLatCount= "28.6139" ;
    var initLongCount= "77.2090";
    var initLatUsage= "28.6139";
    var initLongUsage= "77.2090";
    var filterParameters = "";
    var heatLayerObjCount;
    var heatLayerObjUsage; 
    var mapCountURL, mapUsageURL;
    
    var snip= $scope.Snip;
    var load= "<span class='text-info'><b>Loading...</b></span>";
    $scope.loading= {};
    $scope.loading.snip= $sce.trustAsHtml(snip);
    $scope.loading.load= $sce.trustAsHtml(load);
    
    //--------------------------------------------------------------
    
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
        zoom: 6,
        size:{
            height: '800px'
        } 
    };
    
    $scope.datasetCount= {};
    function mapCount(url){
        $scope.loadingCountMapCircleDiv= true;
        $scope.noDataCountMapCircleDiv= false;
        
        httpService.get(url).then(function (response) {  
            var objArray = response.data;
            if(objArray.length>0){
                
                $scope.datasetCount= objArray;
                
                var value= objArray.length;
                if(objArray.length>1000){
                    value= 1000;
                }
                
                var mapcount= [];
                for (var i = 0; i < value; i++) {
                    
                    var colour;
                    if(objArray[i].Count >= 20000)
                    {
                        colour= '#FF0000'
                    }else if(objArray[i].Count < 20000 && objArray[i].Count >= 5000)
                    {
                        colour= "#FFC107"    
                    }else if(objArray[i].Count < 5000)
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
            }else{
                $scope.loadingCountMapCircleDiv= false;
                $scope.noDataCountMapCircleDiv= true;
                $scope.circlesCount= [];
            }
              
        }); 
       
    }
    
    $scope.highHandoverDist = {
        
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
        zoom: 6,
        size:{
            height: 800
        } 
    };
    
    function highHandoverDist(url){
        $scope.loadingUsageMapCircleDiv= true;
        $scope.noDataUsageMapCircleDiv= false;
        
        httpService.get(url).then(function (response) {  
            var objArray = response.data;
             
            if(objArray.length>0){
                $scope.datasetUsage= objArray;
                
                var value= objArray.length;
                
                var mapcount= [];
                for (var i = 0; i < value; i++) {
                    
                    var colour;
                    if(objArray[i].Count >= 20000)
                    {
                        colour= '#FF0000'
                    }else if(objArray[i].Count < 20000 && objArray[i].Usage >= 5000)
                    {
                        colour= "#FFC107"    
                    }else if(objArray[i].Count < 5000)
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
                $scope.circlesUsage= [];
            }
            
              
        }); 
       
    }
    
    $scope.locationinfo= "All Locations";
    $scope.ratinfo= "All RATs";
    $scope.segmentinfo= "All Segments";
    $scope.deviceinfo= "All Devices";
    
    function defaultLoad(){
       
        mapCountURL= globalConfig.pullfilterdataurlbyname+"3G Cells Reportng highest rau towrds 2G";
                
        mapUsageURL= globalConfig.pullfilterdataurlbyname+"Handover Distribution over map";
                 
        mapCount(mapCountURL);
        highHandoverDist(mapUsageURL);
    }
    defaultLoad();
    // Table Export Event
    $scope.dataTableExport = function(component, type, name){
        $('#'+component).dataTable({ destroy: true, searching: false, 'bInfo': false, paging: false});
        $('#'+component).tableExport({type: type, pdfFontSize:'10',  escape:'false', tableName: name});
        $('#'+component).dataTable({ destroy: true, searching: true,'bInfo': true, 'bLengthChange': true, paging: true});
    }
}
// End Handover Distribution Controller
//    ----------------------------------------------------------------------------

// Asset Usage Analytics Controller
function assetUsageAnalyticsCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,uiGmapGoogleMapApi,globalData,highchartOptions, locationFilterService, $sce, filterService ) {
    
    var initLatCount= "28.6139" ;
    var initLongCount= "77.2090";
    var initLatHandsetCapability= "28.6139" ;
    var initLongHandsetCapability= "77.2090";
    $scope.currentTab= 'cellWithZeroTraffic';
    $scope.rowCount="100";
    var snip= $scope.Snip;
    var load= "<span class='text-info'><b>Loading...</b></span>";
    $scope.loading= {};
    $scope.loading.snip= $sce.trustAsHtml(snip);
    $scope.loading.load= $sce.trustAsHtml(load);
    var filterParameters = "";
     //Date filter
    //------------------------------------
    var selectedDate;
    $scope.date= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");;
    //$scope.dateSelect= '2016-11-25';
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    $scope.changeDate=function (modelName, newDate) {
        selectedDate= newDate.format();
        console.log("selected Date", selectedDate);
        selectedDate= selectedDate.substring(0,10);
        $scope.dateSelect= selectedDate
    }

    $scope.cells2GWithZeroTrafficOpt= {
    	"aaSorting": [3]
    }

    $scope.cells3GWithZeroTrafficOpt= {
    	"aaSorting": [3]
    }

    $scope.cites2GWith3G4GCapableDevicesOpt= {
    	"aaSorting": [3]
    }
    //--------------------------------------------------------------
    //filter
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })

    $scope.location = function() {
        if ($scope.treeLocation)
            $scope.treeLocation = false;
        else{
            $scope.treeLocation = true;
            // $scope.treeRAT = false;
            // $scope.treeSegment = false;
            // $scope.treeDevice = false;
        }
    }
    
    // cell with zero Traffic tab
    function getMap(objArray){
        var mapcount= [];
        var colour= "images/tower_red.png";
            
        for (var i = 0; i < objArray.length; i++) {
            mapcount[i]= {
                id: i,
                latitude: objArray[i].latitude,
                longitude: objArray[i].longitude,
                title: objArray[i].Area+ ' (' + objArray[i].cellid +') , Count: '+ objArray[i].Count,
                cellid: objArray[i].cellid,
                area: objArray[i].Area,
                icon: colour,
                options:{visible:true}
            }
        }
        return mapcount;
	}

	$scope.cellWithZeroTraffic = {
        center: {
            latitude: initLatCount,
            longitude: initLongCount
        },
        options:{
            scrollwheel: false,
            // Style for Google Maps
            styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},{"saturation":40},{"lightness":10}]}],
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        },
        control: {
            refresh: function(){}
        },
        zoom: 12,
        size:{
            height: '800px'
        },
        events:
        { 
            mouseover: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            },
            mouseout: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            }
        },
    };
        
    $scope.cell3GWithZeroTraffic = {
        center: {
            latitude: initLatCount,
            longitude: initLongCount
        },
        options:{
            scrollwheel: false,
            // Style for Google Maps
            styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},{"saturation":40},{"lightness":10}]}],
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        },
        control: {
            refresh: function(){}
        },
        zoom: 12,
        size:{
            height: '800px'
        },
        events:
        { 
            mouseover: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            },
            mouseout: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            }
        },
    };
        
    $scope.onHover = function(marker, eventName, model) {
        model.show = !model.show;
    };

    $scope.datasetCount= {};
    $scope.circlesCount= []; 
        
    function getCellWithZeroTraffic(url2GCells, url3GCells){
        $scope.loading2GCellDiv= true;
        $scope.noData2GCellDiv= false;
		$scope.exportCell2GwithZeroTraffic= [];
		$scope.datasetCountTable= [];
		$scope.cell2GCount= [];

		$scope.loading3GCellDiv= true;
        $scope.noData3GCellDiv= false;
        $scope.exportCell3GwithZeroTraffic= [];
		$scope.dataset3GCountTable= [];
        $scope.cell3GCount= [];
		
		$timeout(function() {
            $scope.cellWithZeroTraffic.control.refresh({latitude: initLatCount, longitude: initLongCount});
        }, 500);
        
        httpService.get(url2GCells).then(function (response) {  
            var objArray = response.data;
             
            if(objArray.length>0){
               	$scope.exportCell2GwithZeroTraffic= angular.copy(objArray);
                $scope.datasetCountTable= angular.copy(objArray);
                
                $scope.cell2GCount= getMap(objArray);
                
                $scope.loading2GCellDiv= false;
        		$scope.noData2GCellDiv= false;
            }else{
                $scope.loading2GCellDiv= false;
        		$scope.noData2GCellDiv= true;
            }
        }); 
        
        $timeout(function() {
            $scope.cell3GWithZeroTraffic.control.refresh({latitude: initLatCount, longitude: initLongCount});
        }, 500);
        httpService.get(url3GCells).then(function (response) {  
            var objArray = response.data;
           	 
            if(objArray.length>0){
                
                $scope.dataset3GCountTable= angular.copy(objArray);
                $scope.exportCell3GwithZeroTraffic= angular.copy(objArray);
                
                $scope.cell3GCount= getMap(objArray);
                
                $scope.loading3GCellDiv= false;
        		$scope.noData3GCellDiv= false;
            }else{
                $scope.loading3GCellDiv= false;
        		$scope.noData3GCellDiv= true;
            }
        }); 
    }

    
	// City Wise Cell with Zero Traffic tab
	function getCityWiseCellData(objArray, ratType){
		var cityDistDataArray= [];
		var cityDistLabelArray= [];

	    var cityDistBarOpt= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
        
		cityDistBarOpt.tooltip.pointFormat= 'Count<b> {point.y:.0f}';

		cityDistBarOpt.yAxis.title.text= "Count";

		for(var i=0; i<objArray.length; i++){
            cityDistLabelArray[i]= objArray[i].City;
            cityDistDataArray[i]= objArray[i].Count;
        }
        
		cityDistBarOpt.xAxis.categories= angular.copy(cityDistLabelArray);

        return {
            options: cityDistBarOpt,
            series: [{
                color: "rgb(39, 174, 96)",
                name: 'City wise Distrubution'+'('+ratType+')',
                data: angular.copy(cityDistDataArray)
            }]
            
        }
	}

	function getCityWise2GCellwithZeroTraffic(url2GCells, url3GCells){
		$scope.loadingCitywise2GCellDiv= true;
        $scope.DataCitywise2GCellDiv= false;
        $scope.noDataCitywise2GCellDiv= false;

        $scope.loadingCitywise3GCellDiv= true;
        $scope.DataCitywise3GCellDiv= false;
        $scope.noDataCitywise3GCellDiv= false;

		httpService.get(url2GCells).then(function(response){
    		var objArray= response.data;
    		
    		if(objArray.length>0){
	            
	            $scope.citywise2GDistributionChartConfig= getCityWiseCellData(objArray, '2G')
	            
	            $scope.exportCitywise2GCells= angular.copy(objArray);

	            $scope.loadingCitywise2GCellDiv= false;
		        $scope.DataCitywise2GCellDiv= true;
		        $scope.noDataCitywise2GCellDiv= false;
	        }else{
	        	$scope.loadingCitywise2GCellDiv= false;
		        $scope.DataCitywise2GCellDiv= false;
		        $scope.noDataCitywise2GCellDiv= true;
	        }
    	})
		
		httpService.get(url3GCells).then(function(response){
    		var objArray= response.data;
    		
    		if(objArray.length>0){
	            

	            $scope.citywise3GDistributionChartConfig= getCityWiseCellData(objArray, '3G')
	            
	            $scope.exportCitywise3GCells= angular.copy(objArray);

	            $scope.loadingCitywise3GCellDiv= false;
		        $scope.DataCitywise3GCellDiv= true;
		        $scope.noDataCitywise3GCellDiv= false;
	        }else{
	        	$scope.loadingCitywise3GCellDiv= false;
		        $scope.DataCitywise3GCellDiv= false;
		        $scope.noDataCitywise3GCellDiv= true;
	        }
    	})
	}

	// Handset capability tab
	
	$scope.handsetCapability = {
        center: {
            latitude: initLatHandsetCapability,
            longitude: initLongHandsetCapability
        },
        options:{
            scrollwheel: false,
            // Style for Google Maps
            styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},{"saturation":40},{"lightness":10}]}],
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        },
        control: {
            refresh: function(){}
        },
        zoom: 12,
        size:{
            height: '800px'
        },
        events:
        { 
            mouseover: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            },
            mouseout: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            }
        },
    };
        
    $scope.onHover = function(marker, eventName, model) {
        model.show = !model.show;
    };

    var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
	
	function getHandsetCapablity(urlMap){
        $scope.loadingHandsetCapabilityDiv= true;
        $scope.noDataHandsetCapabilityDiv= false;
        highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
        $scope.handsetCapabilityCount= []; 
        $scope.datasetCountTable= [];
        $scope.exportHandsetCapability= [];
        $scope.checkboxCountHighStatus= true;
        $scope.checkboxCountMediumStatus= true;
        $scope.checkboxCountLowStatus= true;
		
		$timeout(function() {
            $scope.handsetCapability.control.refresh({latitude: initLatHandsetCapability, longitude: initLongHandsetCapability});
        }, 500);
        
        httpService.get(urlMap).then(function (response) {  
            var objArray = response.data;
             
            if(objArray.length>0){
                
               	$scope.datasetCountTable= angular.copy(objArray);
                $scope.exportHandsetCapability= angular.copy(objArray);
                
                $scope.highest= objArray[0].Count;
                $scope.medium= ($scope.highest/2).toFixed(0);
                $scope.low= ($scope.highest/3).toFixed(0);
                var mapcount= [];
		        for (var i = 0; i < objArray.length; i++) {
		        	var colour;
                    if(objArray[i].Count >= $scope.highest/2)
                    {
                        //colour= "#FF0000";
                        colour= 'images/tower_red.png';
                        highCountIndex.push(i);
                    }else if(objArray[i].Count < ($scope.highest/2) && objArray[i].Count >= ($scope.highest/3))
                    {
                        //colour= "#FFC107"    
                        colour= "images/tower_yellow.png";
                        mediumCountIndex.push(i); 
                    }else if(objArray[i].Count < ($scope.highest/3))
                    {
                        //colour= "#08B21F"
                        colour= "images/tower_green.png";
                        lowCountIndex.push(i);
                    }
		            mapcount[i]= {
		                id: i,
		                latitude: objArray[i].latitude,
		                longitude: objArray[i].longitude,
		                title: objArray[i].Area+ ' (' + objArray[i].cellid +') , Count: '+ objArray[i].Count,
		                cellid: objArray[i].cellid,
		                area: objArray[i].Area,
		                icon: colour,
		                options:{visible:true}
		            }
		        }
		        $scope.handsetCapabilityCount= angular.copy(mapcount);
                
                $scope.loadingHandsetCapabilityDiv= false;
        		$scope.noDataHandsetCapabilityDiv= false;
            }else{
                $scope.loadingHandsetCapabilityDiv= false;
        		$scope.noDataHandsetCapabilityDiv= true;
                $scope.handsetCapabilityCount= [];
            }
        }); 
    }

    $scope.getMapLegendClickData= function (state, indexArray, mapObject){
	    if(state== false){
	        for(var k=0; k<mapObject.length; k++){
	            var index= indexArray.indexOf(k);
	            if( index != -1){
	                mapObject[k].options.visible= false;
	            }
	        }
	    }
	    else{
	        for(var k=0; k<mapObject.length; k++){
	            var index= indexArray.indexOf(k);
	            if( index != -1){
	                mapObject[k].options.visible= true;
	            }
	        }
	    }
	    return mapObject;
	}

	$scope.checkboxHighCountStateChange= function(state){
	    var mapObject= angular.copy($scope.handsetCapabilityCount);
	    $scope.handsetCapabilityCount= $scope.getMapLegendClickData(state, highCountIndex, mapObject);
	}
	$scope.checkboxMediumCountStateChange= function(state){
	    var mapObject= angular.copy($scope.handsetCapabilityCount);
	    $scope.handsetCapabilityCount= $scope.getMapLegendClickData(state, mediumCountIndex, mapObject);
	}
	$scope.checkboxLowCountStateChange= function(state){
	    var mapObject= angular.copy($scope.handsetCapabilityCount);
	    $scope.handsetCapabilityCount= $scope.getMapLegendClickData(state, lowCountIndex, mapObject);
	}

	function defaultLoad(){
		$scope.treeLocation = false;
		filterParameters= $scope.filterGetParams();

       	switch($scope.currentTab){
            case 'cellWithZeroTraffic':
                var cell2GWithZeroTrafficURL= globalConfig.pullfilterdataurlbyname+"2G Cells with Zero traffic Map"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z"+filterParameters;
                var cell3GWithZeroTrafficURL= globalConfig.pullfilterdataurlbyname+"3G Cells with Zero traffic Map"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z"+filterParameters;
                getCellWithZeroTraffic(cell2GWithZeroTrafficURL, cell3GWithZeroTrafficURL);
                break;
            case 'cityWiseCellwithZeroTraffic':
                var cityWise2GCellwithZeroTrafficURL= globalConfig.pullfilterdataurlbyname+"City wise count for 2G Cells with Zero traffic"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z";
                var cityWise3GCellwithZeroTrafficURL= globalConfig.pullfilterdataurlbyname+"City wise count for 3G Cells with Zero traffic"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z";
                getCityWise2GCellwithZeroTraffic(cityWise2GCellwithZeroTrafficURL, cityWise3GCellwithZeroTrafficURL);
                break;
        	case '3G-4GCapableDevices':
        		var handsetCapabilityURL= globalConfig.pullfilterdataurlbyname+"2G sites with 3G 4G capable devices"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z"+"&rowCount="+$scope.rowCount+filterParameters;
                getHandsetCapablity(handsetCapabilityURL);
                break;
        	}
	}
    defaultLoad();
    
    //Date Submit Event
    $scope.click= function(){
        defaultLoad();
    }

    //Tab selected event
    $scope.tabSelected= function(tab){
        $scope.currentTab= tab;
        defaultLoad();
    }
}
// End Asset Usage Analytics Controller
//    ----------------------------------------------------------------------------

// Revenue Upside Matrix Controller
function revenueUpsideMatrixCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,  highchartOptions, locationFilterService, highchartProcessData, filterService, globalData) {
    
    var filterParameters = "";
    var currentTab= "RAT";
    var handsetStackedBarURL, appSegmentBarURL, multiIMEISegmentCountURL, listTetheringURL;
    
    //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    // var fromDate= $filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");
    // var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    //fromDate= "2016-08-05";  toDate= "2016-08-10";
    // $scope.date= {"start": fromDate, "end": toDate};
    
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    
    function getRevenueUpsideMatrix(daywiseURL, segmentwiseURL, devicewiseURL, devicewisePieURL, citywisePieURL){
        
        //Day wise Revenue Loss
        $scope.loadingDaywiseRevLossDiv= true;
        $scope.DataDaywiseRevLossDiv= false;
        $scope.noDataDaywiseRevLossDiv= false;  
        
    	httpService.get(daywiseURL).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                var lineData= [], dateData= [];
                
                var linechartOption= angular.copy(highchartOptions.highchartAreaLabelDatetimeOptions)
                
                for(var i in objArray){
                    dateData[i]= objArray[i].Date;
                    lineData[i]= objArray[i].TotalRevenueLoss;
                }
                
                linechartOption.xAxis.categories= dateData;
                linechartOption.yAxis.title.text="Revenue";
                linechartOption.chart.height= 400;
                $scope.daywiseRevLossConfig= 
                {
                    "options" : linechartOption,
                    "series": [{
                        type: 'spline',
                        name: "Total Revenue Loss",
                        zoomType:'x',
                        color: "#f15c80",
                        data: angular.copy(lineData)
                    }]
                }
                $scope.exportTotalRevLoss= angular.copy(objArray);

                $scope.loadingDaywiseRevLossDiv= false;
		        $scope.DataDaywiseRevLossDiv= true;
		        $scope.noDataDaywiseRevLossDiv= false;
            }
            else{
                $scope.loadingDaywiseRevLossDiv= false;
		        $scope.DataDaywiseRevLossDiv= false;
		        $scope.noDataDaywiseRevLossDiv= true;  
          
            }
    	 })

    	//Segment wise Revenue loss
    	$scope.loadingSegRevLossDiv= true;
        $scope.DataSegRevLossDiv= false;
        $scope.noDataSegRevLossDiv= false;  
        
    	httpService.get(segmentwiseURL).then(function(response){
            var objArray= response.data;
            
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "TotalRevenueLoss";
                paramObject.seriesName= "Segment";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                var segRevLossOptions= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                segRevLossOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                segRevLossOptions.xAxis.labels= {
                        "format": "{value:%e %b}",
                        "align": "left"
                };
                segRevLossOptions.yAxis.title.text="Revenue";
                segRevLossOptions.plotOptions.column.events.legendItemClick=function () {
                        return true; 
                    };
                segRevLossOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.segRevLossConfig= {
                    options: segRevLossOptions,
                    series:  highchartProcessData.barColumnProcessHighchartData(paramObject)
                }   

                $scope.exportSegRevLoss= angular.copy(objArray);
                $scope.loadingSegRevLossDiv= false;
		        $scope.DataSegRevLossDiv= true;
		        $scope.noDataSegRevLossDiv= false;  
          	}
            else{
                $scope.loadingSegRevLossDiv= false;
		        $scope.DataSegRevLossDiv= false;
		        $scope.noDataSegRevLossDiv= true;  
          	}
    	})

    	//Device wise Revenue loss
    	$scope.loadingDeviceRevLossDiv= true;
        $scope.DataDeviceRevLossDiv= false;
        $scope.noDataDeviceRevLossDiv= false;  
        
    	httpService.get(devicewiseURL).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "TotalRevenueLoss";
                paramObject.seriesName= "Device";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                var deviceRevLossOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                deviceRevLossOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                deviceRevLossOptions.xAxis.labels= {
                    "format": "{value:%e %b}",
                    "align": "left"
                };
                deviceRevLossOptions.yAxis.title.text="Revenue";
                deviceRevLossOptions.chart.height= 400;
                
                paramObject.flag= "series";
                $scope.deviceRevLossConfig= {
                    options: deviceRevLossOptions,
                    series:  highchartProcessData.multilineProcessHighchartData(paramObject)
                }   
                
                $scope.exportDeviceRevLoss= angular.copy(objArray);
                $scope.loadingDeviceRevLossDiv= false;
		        $scope.DataDeviceRevLossDiv= true;
		        $scope.noDataDeviceRevLossDiv= false;  
          
            }
            else{
                $scope.loadingDeviceRevLossDiv= false;
		        $scope.DataDeviceRevLossDiv= false;
		        $scope.noDataDeviceRevLossDiv= true;
          
            }
    	})

    	//Device wise Revenue loss for Single date
    	$scope.loadingDevicewiseRevLossPieDiv= true;
        $scope.DataDevicewiseRevLossPieDiv= false;
        $scope.noDataDevicewiseRevLossPieDiv= false; 
        
    	httpService.get(devicewisePieURL).then(function(response){
            var objArray= response.data;
            
            if(objArray.length>0){
            	$scope.exportDevicewiseRevenueLossPie= angular.copy(objArray);
            	
            	var devicewiseRevenueLossPieOptions= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                devicewiseRevenueLossPieOptions.tooltip.pointFormat= '{series.name}: <b>{point.y:.0f}</b>';
                var multipleDeviceData= [],  xLabelArray= [];

                var deviceData= [];
                for(var i in objArray){
                   	deviceData[i]= {
                        name: objArray[i].Device,
                        color: highchartProcessData.colorpallete[i],
                        y: objArray[i].TotalRevenueLoss
                    }
                }
                    
                $scope.devicewiseRevLossPie= {
                    options: devicewiseRevenueLossPieOptions,
                    series: [{
                        type: 'pie',
                        name: 'Revenue Loss',
                        data: angular.copy(deviceData)
                    }] 
                }
	            $scope.loadingDevicewiseRevLossPieDiv= false;
		        $scope.DataDevicewiseRevLossPieDiv= true;
		        $scope.noDataDevicewiseRevLossPieDiv= false;

            }
            else{
                $scope.loadingDevicewiseRevLossPieDiv= false;
		        $scope.DataDevicewiseRevLossPieDiv= false;
		        $scope.noDataDevicewiseRevLossPieDiv= true;
          
            }
    	})

    	//City wise Revenue loss for Single date
    	$scope.loadingCitywiseRevLossPieDiv= true;
        $scope.DataCitywiseRevLossPieDiv= false;
        $scope.noDataCitywiseRevLossPieDiv= false;  
        
    	httpService.get(citywisePieURL).then(function(response){
            var objArray= response.data;
            
            if(objArray.length>0){
            	$scope.exportCitywiseRevenueLoss= angular.copy(objArray);
            	
            	var citywiseRevenueLossPieOptions= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                citywiseRevenueLossPieOptions.tooltip.pointFormat= "{series.name}: <b>{point.y:.0f}</b>";
                var multipleDeviceData= [],  xLabelArray= [];

                var deviceData= [];
                for(var i in objArray){
                   	deviceData[i]= {
                        name: objArray[i].City,
                        color: highchartProcessData.colorpallete[i],
                        y: objArray[i].TotalRevenueLoss
                    }
                }
                    
                $scope.citywiseRevLoss= {
                    options: citywiseRevenueLossPieOptions,
                    series: [{
                        type: 'pie',
                        name: 'City wise Revenue Loss',
                        data: angular.copy(deviceData)
                    }] 
                }
	           	$scope.loadingCitywiseRevLossPieDiv= false;
        		$scope.DataCitywiseRevLossPieDiv= true;
        		$scope.noDataCitywiseRevLossPieDiv= false; 

            }
            else{
            	$scope.loadingCitywiseRevLossPieDiv= false;
		       	$scope.DataCitywiseRevLossPieDiv= false;
		       	$scope.noDataCitywiseRevLossPieDiv= true; 
          	}
    	})
    }

    function defaultLoad(){
       
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();

        var revenueLossDaywiseURL= globalConfig.pullfilterdataurlbyname+"Revenue Loss Day wise"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;

        var revenueLossSegmentwiseURL= globalConfig.pullfilterdataurlbyname+"Revenue Loss Segment wise"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;

        var revenueLossDevicewiseURL= globalConfig.pullfilterdataurlbyname+"Revenue Loss Device wise"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z"+filterParameters;

        var revenueLossDevicewisePieURL= globalConfig.pullfilterdataurlbyname+"Revenue Loss Device wise SingleDay"+"&fromDate="+$scope.date.end+"T00:00:00.000Z";

        var revenueLossCitywisePieURL= globalConfig.pullfilterdataurlbyname+"Revenue Loss City wise SingleDay"+"&fromDate="+$scope.date.end+"T00:00:00.000Z";

        getRevenueUpsideMatrix(revenueLossDaywiseURL, revenueLossSegmentwiseURL, revenueLossDevicewiseURL, revenueLossDevicewisePieURL, revenueLossCitywisePieURL);
        
    }
    
    defaultLoad();
    
   // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
}
// End Revenue Upside Matrix Controller
//    ----------------------------------------------------------------------------

//Non-Data sub users controller
function nonDataSubUsersCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,  highchartOptions, locationFilterService, highchartProcessData, filterService, globalData) {

    var filterParameters = "";
    var currentTab= "areawiseDistribution";
    var handsetWiseCountDistributionURL, mapCountURL;
    var initLatCount= 31.3674,
        initLongCount= 76.0392;
    $scope.rowCount='100';
    //--------------------------------------------------------------
    //Filter Section
    
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    var selectedDate;
    //$scope.date= '2016-10-07';//$filter('date')( new Date().getTime() -24*3600*1000 , "yyyy-MM-dd");;
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    $scope.changeDate=function (modelName, newDate) {
        selectedDate= newDate.format();
        console.log("selected Date", selectedDate);
        selectedDate= selectedDate.substring(0,10);
        $scope.dateSelect= selectedDate
    }
    
    $scope.areaDistribution= {
    	"aaSorting": [4]
    }

    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.make;
            item.key = item.makeid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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

    //Total and SmartPhone Users
    function getUsers(urlTotal, urlSmartPhone){
    	httpService.get(urlTotal).then(function(response){
    		var objArray= response.data;
    		$scope.totalUsers= objArray[0].NonDataSubs;
    	})
   		httpService.get(urlSmartPhone).then(function(response){
    		var objArray= response.data;
    		$scope.smartPhoneUsers= objArray[0].NonDataSubs;
    	})
    }

    var totalUsersURL= globalConfig.pullfilterdataurlbyname+"Non Data Sub Users Total"+"&fromDate="+$scope.dateSelect+"T23:59:59.999Z";
	
	var smartPhoneUsersURL= globalConfig.pullfilterdataurlbyname+"Non Data Sub SmartPhone Users Total"+"&fromDate="+$scope.dateSelect+"T23:59:59.999Z";
	getUsers(totalUsersURL, smartPhoneUsersURL);


    // for Area Distribution tab
    $scope.mapCount = {
        center: {
            latitude: initLatCount,
            longitude: initLongCount
        },
        options:{
            scrollwheel: false,
            // Style for Google Maps
            styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},{"saturation":40},{"lightness":10}]}],
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        },
        control: {
            refresh: function(){}
        },
        zoom: 8,
        size:{
            height: '800px'
        },
        events:
        { 
            /*click: function(marker, eventName, model)
            { 
                var params= {cellID: model.cellid};
                $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
            },*/
            mouseover: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            },
            mouseout: function(marker, eventName, model)
            {   
                $scope.onHover(marker, eventName, model);
            }
        },
        
    };
    
    $scope.onHover = function(marker, eventName, model) {
        model.show = !model.show;
    };

    $scope.datasetCount= {};
    $scope.circlesCount= []; 
    
    var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

    function mapCount(url){
        highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
        $scope.loadingCountMapCircleDiv= true;
        $scope.noDataCountMapCircleDiv= false;

        $scope.checkboxCountHighStatus= true;
        $scope.checkboxCountMediumStatus= true;
        $scope.checkboxCountLowStatus= true;
    
        

        $scope.circlesCount= [];
        $timeout(function() {
            $scope.mapCount.control.refresh({latitude: initLatCount, longitude: initLongCount});
        }, 500);
        
        httpService.get(url).then(function (response) {  
            var objArray = response.data;
            
            if(objArray.length>0){
                $scope.highest= objArray[0].Count;
                $scope.medium= ($scope.highest/2).toFixed(0);
                $scope.low= ($scope.highest/3).toFixed(0);

                var datasetCountTable= [];
                for(var i=0; i< objArray.length; i++ ){
                    datasetCountTable[i]= objArray[i];
                }
                $scope.datasetCountTable= datasetCountTable;
                $scope.datasetCount= angular.copy(objArray);
                var value= objArray.length;
                /*if(objArray.length>100){
                    value= 100;
                }*/
                
                var mapcount= [];
                for (var i = 0; i < value; i++) {
                    
                    /*var colour;
                    if(objArray[i].Count >= $scope.highest/2)
                    {
                        //colour= "#FF0000";
                        colour= 'images/tower_red.png';
                        highCountIndex.push(i);
                    }else if(objArray[i].Count < ($scope.highest/2) && objArray[i].Count >= ($scope.highest/3))
                    {
                        //colour= "#FFC107"    
                        colour= "images/tower_yellow.png";
                        mediumCountIndex.push(i); 
                    }else if(objArray[i].Count < ($scope.highest/3))
                    {
                        //colour= "#08B21F"
                        colour= "images/tower_green.png";
                        lowCountIndex.push(i);
                    }*/
                    
                    mapcount[i]= {
                        id: i,
                        latitude: objArray[i].latitude,
                        longitude: objArray[i].longitude,
                        title: objArray[i].Area+"("+objArray[i].cellid+")"+', Count: '+ objArray[i].Count,
                        date: $scope.date.end,
                        area: objArray[i].Area,
                        icon: 'images/tower_red.png',//colour,
                        options:{visible:true}
                    }
                }
                
                $scope.circlesCount= mapcount;
                
                $scope.loadingCountMapCircleDiv= false;
                $scope.noDataCountMapCircleDiv= false;
            }else{
                $scope.loadingCountMapCircleDiv= false;
                $scope.noDataCountMapCircleDiv= true;
                $scope.circlesCount= [];
            }
        }); 
    }

    //for device distribution tab
    function handsetWiseCountDistribution(url){
        var handsetDistributionBubbleChartOptions= {};
        
        $scope.loadinghandsetDistributionBubbleDiv= true;
        $scope.DatahandsetDistributionBubbleDiv= false;
        $scope.noDatahandsetDistributionBubbleDiv= false;
        
        httpService.get(url).then(function(response){
            var handsetWiseLabelArray= [], handsetWiseCountData= [];
            var objArray= response.data;
                        
            $scope.exportHandsetSessionDistribution= [];
            if(objArray.length>0){
                for(var i=0; i<objArray.length; i++){
                    handsetWiseLabelArray[i]= objArray[i].Device;
                    handsetWiseCountData[i]= [objArray[i].Device, parseFloat(objArray[i].Count), parseFloat(objArray[i].Count)]
                }

                handsetDistributionBubbleChartOptions= angular.copy(highchartOptions.highchartBubbleLabelCategoriesOptions);

                handsetDistributionBubbleChartOptions.xAxis.categories= angular.copy(handsetWiseLabelArray);
				
				handsetDistributionBubbleChartOptions.plotOptions.series.dataLabels.format= "{point.y}";

                $scope.handsetDistributionBubbleChartConfig= 
                    {
                    "options" : handsetDistributionBubbleChartOptions,
                    "series":[{
                        name: 'Device wise Distribution',
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
                $scope.exportHandsetSessionDistribution= angular.copy(objArray);
                
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

    //for city wise distribution tab
    function citywiseDistribution(url){
    	$scope.loadingCitywiseDistributionDiv= true;
        $scope.DataCitywiseDistributionDiv= false;
        $scope.noDataCitywiseDistributionDiv= false;

    	httpService.get(url).then(function(response){
    		var objArray= response.data;
    		
    		var cityDistDataArray= [];
    		var cityDistLabelArray= [];

    		if(objArray.length>0){
	            var cityDistBarOpt= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
	            
	    		cityDistBarOpt.tooltip.pointFormat= 'Count<b> {point.y:.0f}';

	    		cityDistBarOpt.yAxis.title.text= "Count";

	    		for(var i=0; i<objArray.length; i++){
	                cityDistLabelArray[i]= objArray[i].City;
	                cityDistDataArray[i]= objArray[i].Count;
	            }
	            
				cityDistBarOpt.xAxis.categories= angular.copy(cityDistLabelArray);

	            $scope.citywiseDistributionChartConfig= {
	                options: cityDistBarOpt,
	                series: [{
	                    color: "rgb(39, 174, 96)",
	                    name: 'City wise Distrubution',
	                    data: angular.copy(cityDistDataArray)
	                }]
	                
	            }
	            
	            $scope.exportCitywiseDistribution= angular.copy(objArray);

	            $scope.loadingCitywiseDistributionDiv= false;
		        $scope.DataCitywiseDistributionDiv= true;
		        $scope.noDataCitywiseDistributionDiv= false;
	        }else{
	        	$scope.loadingCitywiseDistributionDiv= false;
		        $scope.DataCitywiseDistributionDiv= false;
		        $scope.noDataCitywiseDistributionDiv= true;
	        }
    	})
    }

    //default load
    function defaultLoad(){
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;
        
        filterParameters= $scope.filterGetParams();
        
        switch(currentTab){
            case 'areawiseDistribution':
                mapCountURL= globalConfig.pullfilterdataurlbyname+"Non Data Users For 1 Day Location wise"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+filterParameters+"&rowCount="+$scope.rowCount;
                highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                mapCount(mapCountURL);
                break;
            case 'deviceDistribution':
                handsetWiseCountDistributionURL= globalConfig.pullfilterdataurlbyname+"Non Data Users For 1 Day device wise"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+filterParameters;
                handsetWiseCountDistribution(handsetWiseCountDistributionURL);
                break;
        	case 'cityDistribution':
                var citywiseDistributionURL= globalConfig.pullfilterdataurlbyname+"Non Data Sub Users City Wise"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+filterParameters;
                citywiseDistribution(citywiseDistributionURL);
                break;
        }
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

    // Change Top Cell Count
    $scope.chngTopCellCount= function(cellCount){
    	$scope.rowCount= cellCount;
        defaultLoad();
    }

    //export low data sub users IMSI
    $scope.exportIMSI= function(format){

    	$scope.loading = true;
    	// low data IMSI 
        var lowDataIMSIURL= globalConfig.pullfilterdataurlbyname+"Non Data IMSI Export date"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+filterParameters;
        httpService.get(lowDataIMSIURL).then(function (response) { 
            var objArray= response.data;
            $scope.loading = false;
            var lowDataIMSI= angular.copy(objArray);

            $scope.dataExport(lowDataIMSI,format, 'Non Data Sub Users Low Usage IMSI')
        })
    }
}
//    ----------------------------------------------------------------------------

//Dual Sim Analytics controller
function dualSimAnalyticsCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,  highchartOptions, locationFilterService, highchartProcessData, filterService, globalData) {
    var currentTab= 'usageVsUsers';

    function getUsersVsUsage(stmtObj){
        $scope.loadingUsageVsUsersDiv= true;
        
        $scope.getLinePlusBarData(stmtObj, function(res){
            
            if(res.rawData.length>0){
                $scope.exportUsageVsUsers= angular.copy(res.rawData);
                var getuserVsUsagesChartOptions=  angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
                getuserVsUsagesChartOptions.yAxis[0].title.text= 'Users';
                getuserVsUsagesChartOptions.yAxis[0].labels.style= {color:"#f7a35c" };
                getuserVsUsagesChartOptions.yAxis[0].title.style= {color:"#f7a35c" };
                getuserVsUsagesChartOptions.yAxis[1].title.text= stmtObj.barKey;
                getuserVsUsagesChartOptions.xAxis.categories= res.xLabelData;

                $scope.userVsUsagesChartConfig= {
                    options: getuserVsUsagesChartOptions,
                    series: [ {
                        name: 'Users',
                        type: 'spline',
                        yAxis: 0,
                        color: "#f7a35c",
                        data: res.lineData,
                        tooltip: {
                            valueSuffix: ' '+res.lineDataUnit
                        }
                    },{
                        name: 'Usage',
                        type: 'column',
                        yAxis: 1,
                        "color": "#1abc9c",
                        data: res.barData,
                        tooltip: {
                            valueSuffix: ' '+res.barDataUnit
                        }

                    }]
                };

                $scope.loadingUsageVsUsersDiv= false;
            }else{
                $scope.exportUsageVsUsers= [];
                $scope.loadingUsageVsUsersDiv= false;
            }
        })
    }

    function defaultLoad(){
            
        switch(currentTab){
            case 'usageVsUsers':
                var usageVsUsersURL= globalConfig.pullfilterdataurlbyname+"DualSim wise Usage Users"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z";
                var stmtObj= {};
                stmtObj.stmtName= usageVsUsersURL;
                stmtObj.lineKey= 'Users';
                stmtObj.barKey= 'Usage';
                stmtObj.xLabelKey= 'Date';
                getUsersVsUsage(stmtObj);
                break;
            case 'locationWiseUsageUsers':
                var plmnUsageVsUsersURL= globalConfig.pullfilterdataurlbyname+"PLMN wise Usage Users"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z";
                var stmtObj= {};
                stmtObj.stmtName= plmnUsageVsUsersURL;
                stmtObj.lineKey= 'Users';
                stmtObj.barKey= 'Usage';
                stmtObj.xLabelKey= 'PLMN';
                getPLMNUsageUser(stmtObj);
                break;
            case 'deviceWiseUsageUsers':
                    var plmnUsageVsUsersURL= globalConfig.pullfilterdataurlbyname+"PLMN wise Usage Users"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z";
                    var stmtObj= {};
                    stmtObj.stmtName= plmnUsageVsUsersURL;
                    stmtObj.lineKey= 'Users';
                    stmtObj.barKey= 'Usage';
                    stmtObj.xLabelKey= 'PLMN';
                    getPLMNUsageUser(stmtObj);
                    break;
        }
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
//    ----------------------------------------------------------------------------

//Roaming Insights controller
function roamingInsightsCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,  highchartOptions, locationFilterService, highchartProcessData, filterService, globalData) {
    var currentTab= 'Top10N/W';
    
    function getPLMNUsageUser(stmtObj){
        $scope.loadingPLMNUsageUsersDiv= true;
        
        $scope.getLinePlusBarData(stmtObj, function(res){
            
            if(res.rawData.length>0){
                $scope.exportPLMNUsageVsUsers= angular.copy(res.rawData);
                var getPLMNChartOptions=  angular.copy(highchartOptions.highchartLinePlusBarLabelCategoriesOptions);
                getPLMNChartOptions.yAxis[0].title.text= 'Users';
                getPLMNChartOptions.yAxis[0].labels.style= {color:"#f7a35c" };
                getPLMNChartOptions.yAxis[0].title.style= {color:"#f7a35c" };
                getPLMNChartOptions.yAxis[1].title.text= stmtObj.barKey;
                getPLMNChartOptions.xAxis.categories= res.xLabelData;

                $scope.plmnUsageUsersChartConfig= {
                    options: getPLMNChartOptions,
                    series: [ {
                        name: 'Users',
                        type: 'spline',
                        yAxis: 0,
                        color: "#f7a35c",
                        data: res.lineData,
                        tooltip: {
                            valueSuffix: ' '+res.lineDataUnit
                        }
                    },{
                        name: 'Usage',
                        type: 'column',
                        yAxis: 1,
                        "color": "#1abc9c",
                        data: res.barData,
                        tooltip: {
                            valueSuffix: ' '+res.barDataUnit
                        }

                    }]
                };

                $scope.loadingPLMNUsageUsersDiv= false;
            }else{
                $scope.exportPLMNUsageVsUsers= [];
                $scope.loadingPLMNUsageUsersDiv= false;
            }
        })
    } 

    function getTOPNewRoamers(stmtObj){
        $scope.loadingTOPNewRoamersDiv= true;
        
        $scope.getLinePlusBarData(stmtObj, function(res){
            console.log("res",res);
            if(res.rawData.length>0){
                var xLabelData= [], barData= [];
                for(var i in res){
                    xLabelData[i]= res[i].City;
                    barData[i]= res[i].Users;
                }
                $scope.exportTopNewRoamers= angular.copy(res.rawData);
                var getPLMNChartOptions=  angular.copy(highchartOptions.highchartBarHorizontalLabelCategoriesOptions);
                getPLMNChartOptions.xAxis.title= {text: 'PLMN'};
                getPLMNChartOptions.xAxis.title= {text: 'City'};
                getPLMNChartOptions.xAxis.categories= res.xLabelData;

                $scope.topNewRoamersChartConfig= {
                    options: getPLMNChartOptions,
                    series: [ {
                        name: 'SmartPhone Users',
                        "color": "#00C853",
                        data: res.barData,
                        tooltip: {
                            valueSuffix: ' '+res.barDataUnit
                        }

                    }]
                };

                $scope.loadingTOPNewRoamersDiv= false;
            }else{
                $scope.exportTopNewRoamers= [];
                $scope.loadingTOPNewRoamersDiv= false;
            }
        })
    }
    
    function getCountUsage(){
        var url= globalConfig.pullfilterdataurlbyname+"Roaming Users and Usage"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.totalUsers= objArray[0].Users;
            var totaUsage= dataFormatter.formatUsageData(objArray[0].Usage, 3);
            $scope.totalUsage= totaUsage;
        })
    }

    function defaultLoad(){
            
        getCountUsage();
        switch(currentTab){
            case 'Top10N/W':
                var topNewRoamersURL= globalConfig.pullfilterdataurlbyname+"PLMN wise Top Nw"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z";
                var stmtObj= {};
                stmtObj.stmtName= topNewRoamersURL;
                stmtObj.barKey= 'Users';
                stmtObj.xLabelKey= 'PLMN';
                getTOPNewRoamers(stmtObj);
                break;
            case 'plmnUsageVsUsers':
                var plmnUsageVsUsersURL= globalConfig.pullfilterdataurlbyname+"PLMN wise Usage Users"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z";
                var stmtObj= {};
                stmtObj.stmtName= plmnUsageVsUsersURL;
                stmtObj.lineKey= 'Users';
                stmtObj.barKey= 'Usage';
                stmtObj.xLabelKey= 'PLMN';
                getPLMNUsageUser(stmtObj);
                break;
        }
    }
        
    defaultLoad();
    
    // Submit Click event
    $scope.click= function(){
        defaultLoad();
    }
    
    //change Date event
    $scope.changeDate=function (modelName, newDate) {
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    
    //Tab selected event
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
}
//    ----------------------------------------------------------------------------

// Cell Congestion Analytics Controller
function cellCongestionAnalyticsCtrl($ocLazyLoad, $scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, locationFilterService, $sce, filterService,dbService, $uibModal, $state, globalData) {
        // console.log("inside controller");
        $scope.insideLazyLoad= true
        var initLatCount= "28.6139" ;
        var initLongCount= "77.2090";
        var filterParameters = "";
        var heatLayerObjCount;
        var heatLayerObjUsage;
        var currentTab= 'congestionAnalytics';
        var mapCountURL, mapUsageURL;
        $scope.popover= {};
        $scope.date.end= '2017-06-26'
        $scope.rowCount= '100';
        var snip= $scope.Snip;
        var load= "<span class='text-info'><b>Loading...</b></span>";
        $scope.loading= {};
        $scope.loading.snip= $sce.trustAsHtml(snip);
        $scope.loading.load= $sce.trustAsHtml(load);
        
       //--------------------------------------------------------------
        //Filter Section
        
        //var selKeysLocation= ["404.7"], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], selLocationTitle= [], selDeviceTitle=[];
        var queryParam; 
        
        $scope.treeLocation= false;
        $scope.treeRAT= false;
        $scope.treeSegment= false;
        $scope.treeDevice= false;
        
        
        //datatable option
        $scope.cellUserDistribution= {
            "aaSorting": [4]
        };
        $scope.cityPenTblOpt= {
            "aaSorting": [1]
        };
        
        /*
        *   Location Filter data
        */
        var sort = JSON.stringify({ 'circle' : 1});
        var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

            /*_.forEach(response.data, function(item){
                item.title = item.country;
                item.key = item.countryid;
            });*/
            _.forEach(response.data, function(item){
                item.title = item.circle;
                item.key = item.circleid;
            });
            $scope.getLocationData.children = response.data;
            var selectStatus= false;
            $("#location").dynatree(angular.copy($scope.getLocationData))
        })
        
        /*
        *   RAT Filter data
        */
        $("#rat").dynatree(angular.copy($scope.getRATData));
        
        /*
        *   Segment Filter data
        */
        $("#segment").dynatree(angular.copy($scope.getSegmentData))
         
        /*
        *   Device Filter data
        */
        
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
            $scope.getDeviceData.children = response.data;
            var selectStatus=false;
            _.forEach(response.data, function(item){
                item.title = item.company;
                item.key = item.companyid;
                item.parent = 1;
            });
            //console.log("data: ", deviceData)
            $("#device").dynatree(angular.copy($scope.getDeviceData))
        })
            
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
            if ($scope.treeRAT){
                $scope.treeRAT = false;
            }
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
        
        // for Count tab
        $scope.mapCount = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        $scope.highest= 'Congested';
        $scope.medium= 'Almost Congested';
        $scope.low= 'No Congestion';
        function mapCount(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv= true;
            $scope.noDataCountMapCircleDiv= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapCount.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        var colour;
                        if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: "Area : "+objArray[i].Area+' (' + objArray[i].cellid +')',//+ objArray[i].Count,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCount= mapcount;
                    
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= false;
                }else{
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        $scope.getMapLegendClickData= function (state, indexArray, mapObject){
            if(state== false){
                for(var k=0; k<mapObject.length; k++){
                    var index= indexArray.indexOf(k);
                    if( index != -1){
                        mapObject[k].options.visible= false;
                    }
                }
            }
            else{
                for(var k=0; k<mapObject.length; k++){
                    var index= indexArray.indexOf(k);
                    if( index != -1){
                        mapObject[k].options.visible= true;
                    }
                }
            }
            return mapObject;
        }

        $scope.checkboxHighCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, highCountIndex, mapObject);
        }
        $scope.checkboxMediumCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, mediumCountIndex, mapObject);
        }
        $scope.checkboxLowCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, lowCountIndex, mapObject);
        }
        
        // City Penetration Tab
        function cityPenetrationTab(urlTable){
            $scope.loadingCityPenetrationDiv= true;
            $scope.dataCityPenetrationDiv= false;
            $scope.noDataCityPenetrationDiv= false;

            httpService.get(urlTable).then(function (response) {
                var objArray= response.data; 
                
                if(objArray.length>0){
                    $scope.cityPenetrationTable= angular.copy(objArray); 
                    $scope.exportCityPenetrationTable= angular.copy(objArray); 
                    
                    $scope.loadingCityPenetrationDiv= false;
                    $scope.dataCityPenetrationDiv= true;
                    $scope.noDataCityPenetrationDiv= false;
                }else{
                    $scope.loadingCityPenetrationDiv= false;
                    $scope.dataCityPenetrationDiv= false;
                    $scope.noDataCityPenetrationDiv= true;
                }
            });
        }

        $scope.selKeysLocation= ["404.7"];
        $scope.selLocationTitle= ["Delhi"];
        //console.log('$scope.selLocationTitle', $scope.selLocationTitle);
        
        function defaultLoad(){
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
            
            // console.log('inside Default');
        
            filterParameters= $scope.filterGetParams();
            console.log("currentTab", currentTab);
            switch(currentTab){
                case 'congestionAnalytics':
                    /*if(/&device=/.test(filterParameters)){
                        mapCountURL= globalConfig.pullfilterdataurlbyname+"Dummy Cell wise congestion"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&rowCount="+$scope.rowCount;

                    }else{
                    */    mapCountURL= globalConfig.pullfilterdataurlbyname+"Dummy Cell wise congestion"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+'&toDate='+$scope.date.end+'T23:59:59.999Z'+filterParameters;//+"&rowCount="+$scope.rowCount;
                    // }
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapCount(mapCountURL);
                    break;
            }
        }
        
        defaultLoad();
        
        // Submit Click event
        $scope.click= function(){
            defaultLoad();
        }
        
        // Change Top Cell Count
        $scope.chngTopCellCount= function(cellCount){
            $scope.rowCount= cellCount;
            defaultLoad();
        }
        
        //change Date event
        $scope.changeDate=function (modelName, newDate) {
            $scope.date.end= newDate.format("YYYY-MM-DD");
        }
        //Tab selected event
        $scope.tabSelected= function(tab){
            currentTab= tab;
            defaultLoad();
        }
        
        // Table Export Event
        $scope.dataTableExport = function(component, type, name){
            $scope.getSimpleJSONExport(component, type, name);
        }
}
// End Cell Congestion Analytics Controller
//    ----------------------------------------------------------------------------

// Cell Outage Analytics Controller
function cellOutageAnalyticsCtrl($ocLazyLoad, $scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, locationFilterService, $sce, filterService,dbService, $uibModal, $state, globalData) {
    console.log("child controller");
    
        $scope.insideLazyLoad= true
        var initLatCount= "28.6139" ;
        var initLongCount= "77.2090";
        var filterParameters = "";
        var heatLayerObjCount;
        var heatLayerObjUsage;
        var currentTab= 'congestionAnalytics';
        var mapCountURL, mapUsageURL;
        $scope.popover= {};
        
        $scope.rowCount= '100';
        var snip= $scope.Snip;
        var load= "<span class='text-info'><b>Loading...</b></span>";
        $scope.loading= {};
        $scope.loading.snip= $sce.trustAsHtml(snip);
        $scope.loading.load= $sce.trustAsHtml(load);
        
       //--------------------------------------------------------------
        //Filter Section
        
        //var selKeysLocation= ["404.7"], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], selLocationTitle= [], selDeviceTitle=[];
        var queryParam; 
        
        $scope.treeLocation= false;
        $scope.treeRAT= false;
        $scope.treeSegment= false;
        $scope.treeDevice= false;
        
        
        //datatable option
        $scope.cellUserDistribution= {
            "aaSorting": [4]
        };
        $scope.cityPenTblOpt= {
            "aaSorting": [1]
        };
        
        /*
        *   Location Filter data
        */
        var sort = JSON.stringify({ 'circle' : 1});
        var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

            /*_.forEach(response.data, function(item){
                item.title = item.country;
                item.key = item.countryid;
            });*/
            _.forEach(response.data, function(item){
                item.title = item.circle;
                item.key = item.circleid;
            });
            $scope.getLocationData.children = response.data;
            var selectStatus= false;
            $("#location").dynatree(angular.copy($scope.getLocationData))
        })
        
        /*
        *   RAT Filter data
        */
        $("#rat").dynatree(angular.copy($scope.getRATData));
        
        /*
        *   Segment Filter data
        */
        $("#segment").dynatree(angular.copy($scope.getSegmentData))
         
        /*
        *   Device Filter data
        */
        
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
            $scope.getDeviceData.children = response.data;
            var selectStatus=false;
            _.forEach(response.data, function(item){
                item.title = item.company;
                item.key = item.companyid;
                item.parent = 1;
            });
            //console.log("data: ", deviceData)
            $("#device").dynatree(angular.copy($scope.getDeviceData))
        })
            
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
            if ($scope.treeRAT){
                $scope.treeRAT = false;
            }
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
        
        // for Count tab
        $scope.mapCount = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        $scope.highest= 'greater than 4 Hours';
        $scope.medium= 'greater than 2';
        $scope.low= 'greater than 1 Hour';
        function mapCount(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv= true;
            $scope.noDataCountMapCircleDiv= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapCount.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        var colour;
                        if(objArray[i].Outage == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Outage == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Outage == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: "Area : "+objArray[i].Area+' (' + objArray[i].cellid +')',//+ objArray[i].Count,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCount= mapcount;
                    
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= false;
                }else{
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        $scope.getMapLegendClickData= function (state, indexArray, mapObject){
            if(state== false){
                for(var k=0; k<mapObject.length; k++){
                    var index= indexArray.indexOf(k);
                    if( index != -1){
                        mapObject[k].options.visible= false;
                    }
                }
            }
            else{
                for(var k=0; k<mapObject.length; k++){
                    var index= indexArray.indexOf(k);
                    if( index != -1){
                        mapObject[k].options.visible= true;
                    }
                }
            }
            return mapObject;
        }

        $scope.checkboxHighCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, highCountIndex, mapObject);
        }
        $scope.checkboxMediumCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, mediumCountIndex, mapObject);
        }
        $scope.checkboxLowCountStateChange= function(state){
            var mapObject= angular.copy($scope.circlesCount);
            $scope.circlesCount= $scope.getMapLegendClickData(state, lowCountIndex, mapObject);
        }
        
        // City Penetration Tab
        function cityPenetrationTab(urlTable){
            $scope.loadingCityPenetrationDiv= true;
            $scope.dataCityPenetrationDiv= false;
            $scope.noDataCityPenetrationDiv= false;

            httpService.get(urlTable).then(function (response) {
                var objArray= response.data; 
                
                if(objArray.length>0){
                    $scope.cityPenetrationTable= angular.copy(objArray); 
                    $scope.exportCityPenetrationTable= angular.copy(objArray); 
                    
                    $scope.loadingCityPenetrationDiv= false;
                    $scope.dataCityPenetrationDiv= true;
                    $scope.noDataCityPenetrationDiv= false;
                }else{
                    $scope.loadingCityPenetrationDiv= false;
                    $scope.dataCityPenetrationDiv= false;
                    $scope.noDataCityPenetrationDiv= true;
                }
            });
        }

        $scope.selKeysLocation= ["404.7"];
        $scope.selLocationTitle= ["Delhi"];
        //console.log('$scope.selLocationTitle', $scope.selLocationTitle);
        
        function defaultLoad(){
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
            
            //console.log('inside Default', $scope.selLocationTitle);
        
            filterParameters= $scope.filterGetParams();
            
            switch(currentTab){
                case 'congestionAnalytics':
                   /* if(/&device=/.test(filterParameters)){
                        mapCountURL= globalConfig.pullfilterdataurlbyname+"Cell wise User Penetration with Device Filter"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+filterParameters+"&rowCount="+$scope.rowCount;

                    }else{*/
                        mapCountURL= globalConfig.pullfilterdataurlbyname+"Dummy Cell wise Outage"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+'&toDate='+$scope.date.end+'T23:59:59.999Z'+filterParameters;
                    // }
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapCount(mapCountURL);
                    break;
            }
        }
        
        defaultLoad();
        
        // Submit Click event
        $scope.click= function(){
            defaultLoad();
        }
        
        // Change Top Cell Count
        $scope.chngTopCellCount= function(cellCount){
            $scope.rowCount= cellCount;
            defaultLoad();
        }
        
        //change Date event
        $scope.changeDate=function (modelName, newDate) {
            $scope.date.end= newDate.format("YYYY-MM-DD");
        }
        //Tab selected event
        $scope.tabSelected= function(tab){
            currentTab= tab;
            defaultLoad();
        }
        
        // Table Export Event
        $scope.dataTableExport = function(component, type, name){
            $scope.getSimpleJSONExport(component, type, name);
        }
}
// End Cell Outage Analytics Controller
//    ----------------------------------------------------------------------------

// Strategic Planning Analytics Controller
function strategicPlanningAnalyticsCtrl($ocLazyLoad, $scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, locationFilterService, $sce, filterService,dbService, $uibModal, $state, globalData) {
        // console.log("inside controller");
        $scope.insideLazyLoad= false;
        var initLatCount= "28.6139" ;
        var initLongCount= "77.2090";
        var filterParameters = "";
        var heatLayerObjCount;
        var heatLayerObjUsage;
        var currentTab= 'highUsersLowCEI';
        var mapCountURL, mapUsageURL;
        $scope.popover= {};
        $scope.date.end= '2017-06-26'
        $scope.rowCount= '100';
        var snip= $scope.Snip;
        var load= "<span class='text-info'><b>Loading...</b></span>";
        $scope.loading= {};
        $scope.loading.snip= $sce.trustAsHtml(snip);
        $scope.loading.load= $sce.trustAsHtml(load);
        
       //--------------------------------------------------------------
        //Filter Section
        
        //var selKeysLocation= ["404.7"], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], selLocationTitle= [], selDeviceTitle=[];
        var queryParam; 
        
        $scope.treeLocation= false;
        $scope.treeRAT= false;
        $scope.treeSegment= false;
        $scope.treeDevice= false;
        
        
        //datatable option
        $scope.cellUserDistribution= {
            "aaSorting": [4]
        };
        $scope.cityPenTblOpt= {
            "aaSorting": [1]
        };
        
        /*
        *   Location Filter data
        */
        var sort = JSON.stringify({ 'circle' : 1});
        var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

            /*_.forEach(response.data, function(item){
                item.title = item.country;
                item.key = item.countryid;
            });*/
            _.forEach(response.data, function(item){
                item.title = item.circle;
                item.key = item.circleid;
            });
            $scope.getLocationData.children = response.data;
            var selectStatus= false;
            $("#location").dynatree(angular.copy($scope.getLocationData))
        })
        
        /*
        *   RAT Filter data
        */
        $("#rat").dynatree(angular.copy($scope.getRATData));
        
        /*
        *   Segment Filter data
        */
        $("#segment").dynatree(angular.copy($scope.getSegmentData))
         
        /*
        *   Device Filter data
        */
        
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
            $scope.getDeviceData.children = response.data;
            var selectStatus=false;
            _.forEach(response.data, function(item){
                item.title = item.company;
                item.key = item.companyid;
                item.parent = 1;
            });
            //console.log("data: ", deviceData)
            $("#device").dynatree(angular.copy($scope.getDeviceData))
        })
            
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
            if ($scope.treeRAT){
                $scope.treeRAT = false;
            }
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
        
        // for Count tab
        $scope.mapCount = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            // display:false,
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapCount(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv= true;
            $scope.noDataCountMapCircleDiv= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapCount.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        /*var colour;
                        if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }*/
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: "Area : "+objArray[i].Area+' (' + objArray[i].cellid +')',
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            // icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCount= mapcount;
                    
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= false;
                }else{
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        // for map Terminals Connected tab
        $scope.mapTerminalsConnected = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            // display:false,
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapTerminalsConnected(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv1= true;
            $scope.noDataCountMapCircleDiv1= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapTerminalsConnected.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        var colour;
                        /*if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }*/
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: "Area : "+objArray[i].Area+' (' + objArray[i].cellid +')',//+',Users: '+ objArray[i].Users,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCountTerminal= mapcount;
                    
                    $scope.loadingCountMapCircleDiv1= false;
                    $scope.noDataCountMapCircleDiv1= false;
                }else{
                    $scope.loadingCountMapCircleDiv1= false;
                    $scope.noDataCountMapCircleDiv1= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        
        // for Count tab
        $scope.mapCount1 = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            display:false,
            size:{
                height: '800px'
            },
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapCount1(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv2= true;
            $scope.noDataCountMapCircleDiv2= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapCount1.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        /*var colour;
                        if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }*/
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: ' (' + objArray[i].cellid +')'+',Users: '+ objArray[i].Users,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            // icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCount1= mapcount;
                    
                    $scope.loadingCountMapCircleDiv2= false;
                    $scope.noDataCountMapCircleDiv2= false;
                }else{
                    $scope.loadingCountMapCircleDiv2= false;
                    $scope.noDataCountMapCircleDiv2= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        // for map Terminals Connected tab
        $scope.mapTerminalsConnected1 = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":false},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            display:true,
            zoom: 12,
            size:{
                height: '800px'
            },
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapTerminalsConnected1(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv12= true;
            $scope.noDataCountMapCircleDiv12= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapTerminalsConnected.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        var colour;
                        /*if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }*/
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: ' (' + objArray[i].cellid +')'+',Users: '+ objArray[i].Users,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCountTerminal1= mapcount;
                    
                    $scope.loadingCountMapCircleDiv12= false;
                    $scope.noDataCountMapCircleDiv12= false;
                }else{
                    $scope.loadingCountMapCircleDiv12= false;
                    $scope.noDataCountMapCircleDiv12= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        
        
        

        $scope.selKeysLocation= ["404.7"];
        $scope.selLocationTitle= ["Delhi"];
        //console.log('$scope.selLocationTitle', $scope.selLocationTitle);
        
        function defaultLoad(){
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
            
            // console.log('inside Default');
        
            filterParameters= $scope.filterGetParams();
            console.log("currentTab", currentTab);
            switch(currentTab){
                case 'highUsersLowCEI':
                    mapCountURL= globalConfig.pullfilterdataurlbyname+"Dummy Cell wise High Users Low CEI"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+'&toDate='+$scope.date.end+'T23:59:59.999Z'+filterParameters;
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapCount(mapCountURL);
                    break;
                case 'cellsWhichAre2GBut3G4GTerminalsConnected':
                    var mapTerminalsConnectedURL= globalConfig.pullfilterdataurlbyname+"Dummy 3G 4G cells with low users"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+'&toDate='+$scope.date.end+'T23:59:59.999Z'+filterParameters;
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapTerminalsConnected(mapTerminalsConnectedURL);
                    break;
                case 'CellsWhichAre3GBut4GTerminalsConnected':
                    var mapCountURL1= globalConfig.pullfilterdataurlbyname+"Dummy 3G cells with 4G devices"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+'&toDate='+$scope.date.end+'T23:59:59.999Z'+filterParameters;
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapCount1(mapCountURL1);
                    break;
                case '3G4GCellsButNumberOfUsersVeryLowzero':
                    var mapTerminalsConnectedURL1= globalConfig.pullfilterdataurlbyname+"Dummy 3G 4G cells with low users"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+'&toDate='+$scope.date.end+'T23:59:59.999Z'+filterParameters;
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapTerminalsConnected1(mapTerminalsConnectedURL1);
                    break;
            }
        }
        
        defaultLoad();
        
        // Submit Click event
        $scope.click= function(){
            defaultLoad();
        }
        
        // Change Top Cell Count
        $scope.chngTopCellCount= function(cellCount){
            $scope.rowCount= cellCount;
            defaultLoad();
        }
        
        //change Date event
        $scope.changeDate=function (modelName, newDate) {
            $scope.date.end= newDate.format("YYYY-MM-DD");
        }
        //Tab selected event
        $scope.tabSelected= function(tab){
            currentTab= tab;
            defaultLoad();
        }
        
        // Table Export Event
        $scope.dataTableExport = function(component, type, name){
            $scope.getSimpleJSONExport(component, type, name);
        }

}
// End Strategic Planning Analytics Controller
//    ----------------------------------------------------------------------------
// Strategic Planning Analytics Controller
function strategicPlanningAnalytics1Ctrl($ocLazyLoad, $scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, locationFilterService, $sce, filterService,dbService, $uibModal, $state, globalData) {
        // console.log("inside controller");
        $scope.insideLazyLoad= false;
        var initLatCount= "28.6139" ;
        var initLongCount= "77.2090";
        var filterParameters = "";
        var heatLayerObjCount;
        var heatLayerObjUsage;
        var currentTab= 'CellsWhichAre3GBut4GTerminalsConnected';
        var mapCountURL, mapUsageURL;
        $scope.popover= {};
        $scope.date.end= '2017-06-26'
        $scope.rowCount= '100';
        var snip= $scope.Snip;
        var load= "<span class='text-info'><b>Loading...</b></span>";
        $scope.loading= {};
        $scope.loading.snip= $sce.trustAsHtml(snip);
        $scope.loading.load= $sce.trustAsHtml(load);
        
       //--------------------------------------------------------------
        //Filter Section
        
        //var selKeysLocation= ["404.7"], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], selLocationTitle= [], selDeviceTitle=[];
        var queryParam; 
        
        $scope.treeLocation= false;
        $scope.treeRAT= false;
        $scope.treeSegment= false;
        $scope.treeDevice= false;
        
        
        //datatable option
        $scope.cellUserDistribution= {
            "aaSorting": [4]
        };
        $scope.cityPenTblOpt= {
            "aaSorting": [1]
        };
        
        /*
        *   Location Filter data
        */
        var sort = JSON.stringify({ 'circle' : 1});
        var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

            /*_.forEach(response.data, function(item){
                item.title = item.country;
                item.key = item.countryid;
            });*/
            _.forEach(response.data, function(item){
                item.title = item.circle;
                item.key = item.circleid;
            });
            $scope.getLocationData.children = response.data;
            var selectStatus= false;
            $("#location").dynatree(angular.copy($scope.getLocationData))
        })
        
        /*
        *   RAT Filter data
        */
        $("#rat").dynatree(angular.copy($scope.getRATData));
        
        /*
        *   Segment Filter data
        */
        $("#segment").dynatree(angular.copy($scope.getSegmentData))
         
        /*
        *   Device Filter data
        */
        
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
            $scope.getDeviceData.children = response.data;
            var selectStatus=false;
            _.forEach(response.data, function(item){
                item.title = item.company;
                item.key = item.companyid;
                item.parent = 1;
            });
            //console.log("data: ", deviceData)
            $("#device").dynatree(angular.copy($scope.getDeviceData))
        })
            
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
            if ($scope.treeRAT){
                $scope.treeRAT = false;
            }
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
        
        // for Count tab
        $scope.mapCount = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapCount(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv= true;
            $scope.noDataCountMapCircleDiv= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapCount.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        /*var colour;
                        if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }*/
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: "Area : "+objArray[i].Area+' (' + objArray[i].cellid +')'+',Users: '+ objArray[i].Users,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            // icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCount= mapcount;
                    
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= false;
                }else{
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        // for map Terminals Connected tab
        $scope.mapTerminalsConnected = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapTerminalsConnected(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv1= true;
            $scope.noDataCountMapCircleDiv1= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapTerminalsConnected.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        var colour;
                        /*if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }*/
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: "Area : "+objArray[i].Area+' (' + objArray[i].cellid +')'+',Users: '+ objArray[i].Users,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCountTerminal= mapcount;
                    
                    $scope.loadingCountMapCircleDiv1= false;
                    $scope.noDataCountMapCircleDiv1= false;
                }else{
                    $scope.loadingCountMapCircleDiv1= false;
                    $scope.noDataCountMapCircleDiv1= true;
                    $scope.circlesCount= [];
                }
            }); 
        }
        
        
        
        

        $scope.selKeysLocation= ["404.7"];
        $scope.selLocationTitle= ["Delhi"];
        //console.log('$scope.selLocationTitle', $scope.selLocationTitle);
        
        function defaultLoad(){
            $scope.treeLocation = false;
            $scope.treeRAT = false;
            $scope.treeSegment = false;
            $scope.treeDevice = false;
            
            // console.log('inside Default');
        
            filterParameters= $scope.filterGetParams();
            console.log("currentTab", currentTab);
            switch(currentTab){
                case 'CellsWhichAre3GBut4GTerminalsConnected':
                    mapCountURL= globalConfig.pullfilterdataurlbyname+"Dummy 3G cells with 4G devices"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+'&toDate='+$scope.date.end+'T23:59:59.999Z'+filterParameters;
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapCount(mapCountURL);
                    break;
                case '3G4GCellsButNumberOfUsersVeryLowzero':
                    var mapTerminalsConnectedURL= globalConfig.pullfilterdataurlbyname+"Dummy 2G cells with 3G 4G devices"+"&fromDate="+$scope.date.end+"T00:00:00.000Z"+'&toDate='+$scope.date.end+'T23:59:59.999Z'+filterParameters;
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapTerminalsConnected(mapTerminalsConnectedURL);
                    break;
            }
        }
        
        defaultLoad();
        
        // Submit Click event
        $scope.click= function(){
            defaultLoad();
        }
        
        // Change Top Cell Count
        $scope.chngTopCellCount= function(cellCount){
            $scope.rowCount= cellCount;
            defaultLoad();
        }
        
        //change Date event
        $scope.changeDate=function (modelName, newDate) {
            $scope.date.end= newDate.format("YYYY-MM-DD");
        }
        //Tab selected event
        $scope.tabSelected= function(tab){
            currentTab= tab;
            defaultLoad();
        }
        
        // Table Export Event
        $scope.dataTableExport = function(component, type, name){
            $scope.getSimpleJSONExport(component, type, name);
        }

}
// End Strategic Planning Analytics Controller
//    ----------------------------------------------------------------------------

//Browsing Habit Analytics Ctrl
function browsingHabitAnalyticsCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,  highchartProcessData, highchartOptions, $stateParams){
    $scope.insideLazyLoad= true;
    $scope.select= {};
    $scope.timeList= ['Whole','Morning', 'Evening', 'Day', 'Night'];
    $scope.select.timeSeg= 'Morning';
    var filterParameters= '';
    //--------------------------------------------------------------
        //Filter Section
        
        //var selKeysLocation= ["404.7"], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], selLocationTitle= [], selDeviceTitle=[];
        var queryParam; 
        
        $scope.treeLocation= false;
        $scope.treeRAT= false;
        $scope.treeSegment= false;
        $scope.treeDevice= false;
        
        
        //datatable option
        $scope.cellUserDistribution= {
            "aaSorting": [4]
        };
        $scope.cityPenTblOpt= {
            "aaSorting": [1]
        };
        
        /*
        *   Location Filter data
        */
        var sort = JSON.stringify({ 'circle' : 1});
        var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

            /*_.forEach(response.data, function(item){
                item.title = item.country;
                item.key = item.countryid;
            });*/
            _.forEach(response.data, function(item){
                item.title = item.circle;
                item.key = item.circleid;
            });
            $scope.getLocationData.children = response.data;
            var selectStatus= false;
            $("#location").dynatree(angular.copy($scope.getLocationData))
        })
        
        /*
        *   RAT Filter data
        */
        $("#rat").dynatree(angular.copy($scope.getRATData));
        
        /*
        *   Segment Filter data
        */
        $("#segment").dynatree(angular.copy($scope.getSegmentData))
         
        /*
        *   Device Filter data
        */
        
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
            $scope.getDeviceData.children = response.data;
            var selectStatus=false;
            _.forEach(response.data, function(item){
                item.title = item.company;
                item.key = item.companyid;
                item.parent = 1;
            });
            //console.log("data: ", deviceData)
            $("#device").dynatree(angular.copy($scope.getDeviceData))
        })
            
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
            if ($scope.treeRAT){
                $scope.treeRAT = false;
            }
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

    
    $scope.loadingCEIDistributionDiv= true;
    $scope.noDataCEIDistributionDiv= false;
    function getCEIData(url, key){
        var CEIDistributionChartOptions= {};
        $scope.loadingCEIDistributionDiv= true;
        $scope.noDataCEIDistributionDiv= false;
        
        $scope.CEIChartConfig= null;
        $scope.CEIDistributionChartOptions= {};
        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "BrowsingSegment";
                paramObject.data= "Count";
                paramObject.seriesName= 'Cluster';
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelCategoriesOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.2f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.enabled= false;
                CEIDistributionUsersChartOptions.legend.reversed= true;
                /*CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.formatter= function() {
                        return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    };*/
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.chart.height= 300;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                CEIDistributionUsersChartOptions.yAxis.stackLabels.enabled= false;
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.CEIDistributionChartOptions= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportCEIDistribution= angular.copy(objArray);

                $scope.loadingCEIDistributionDiv= false;
                $scope.noDataCEIDistributionDiv= false;
            }else{
                $scope.loadingCEIDistributionDiv= false;
                $scope.noDataCEIDistributionDiv= true;
            }
        })
    }
    
    function defaultLoad(){
        /*$scope.appSelected= $scope.select.app;
        $scope.OLTSelected= $scope.select.tabDrpdwn;
        $scope.AreaSelected= $scope.select.tabDrpdwn;
        $scope.PlanSelected= $scope.select.tabDrpdwn;
        $scope.CitySelected= $scope.select.tabDrpdwn;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;*/
        filterParameters= $scope.filterGetParams();
                
        $scope.eportObjCEI= {};
        $scope.eportObjCEI.fileName= 'App Performance'+"_"+$scope.currentTab+"_CEI Distribution";
        $scope.eportObjCEI.fileHeader= 'App Performance'+"_"+$scope.currentTab+"_CEI Distribution for App "+$scope.appSelected+" & "+$scope.currentTab+" "+$scope[$scope.currentTab+'Selected']+" between date "+$scope.sDate+" - "+$scope.edate;

        var areaCEIURL= globalConfig.pullfilterdataurlbyname+"Dummy Browsing Habits for "+$scope.select.timeSeg+" Overall Network count"+filterParameters;
                
       getCEIData(areaCEIURL, "CEI");
        
    }    
    defaultLoad();
    //tab Selected event 
    $scope.tabSelected= function(tab){
        $scope.currentTab= tab;
        getTabDrpDwn();
    }

    //tab drodown select value event
    $scope.selectValue= function(){
        defaultLoad();
    }
    
    // daterange submit event
    $scope.click= function(){
        defaultLoad();
    }
}
// End Browsing Habit Analytics Ctrl
//--------------------------------------------------------------------------------

// App Growth Trend Analytics Controller
function appGrowthTrendCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, dbService) {

    var filterParameters= '';
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    $scope.date= {"start":'2017-06-01',"end": '2017-06-21'};
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.company;
            item.key = item.companyid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    
    
    // App filter
    $scope.select= { };
    // $scope.select.App= "Youtube";
    
    var appListURL= globalConfig.pulldataurlbyname+"Dummy App Filter for grwth";
    
    function getAppList(url){
        httpService.get(url).then(function(response){
            var appListArray= [];
            var objArray= response.data;
            //console.log("plan list", objArray);
            for(var i in objArray){
                appListArray[i]= objArray[i].App;
            }
            $scope.appNameList= angular.copy(appListArray);
            $scope.select.App= appListArray[0];
            defaultLoad();
        })
    }
    
    getAppList(appListURL);
    
    //End of Filter Section
    //--------------------------------------------------------------


    function multilineIndividualData(url){
        $scope.loadingLatencyBarDiv= true;
        $scope.DataLatencyBarDiv= false;
        $scope.noDataLatencyBarDiv= false;

        httpService.get(url).then(function(response){
            var objArray= angular.copy(response.data);
            if(objArray.length>0){
                var line1Data= [], line2Data= [], dateData= [];
                
                var linechartOption= angular.copy(highchartOptions.highchartAreaLabelDatetimeOptions)
                
                for(var i in objArray){
                    dateData[i]= objArray[i].Date;
                    line1Data[i]= objArray[i].PercentChangeApp;
                    line2Data[i]= objArray[i].TotalTrafficChng;
                }
                
                linechartOption.xAxis.categories= dateData;
                // linechartOption.yAxis.title.text="Revenue";
                linechartOption.chart.height= 400;
                $scope.HighLatencyBarChartConfig= 
                {
                    "options" : linechartOption,
                    "series": [{
                        type: 'spline',
                        name: "Percentage Change App",
                        // zoomType:'x',
                        color: "#7C4DFF",
                        data: angular.copy(line1Data)
                    },{
                        type: 'spline',
                        name: "Total Traffic Change",
                        zoomType:'x',
                        color: "#97CE68",
                        data: angular.copy(line2Data)
                    }]
                }
                $scope.exportAppDistribution= angular.copy(objArray);

                $scope.loadingLatencyBarDiv= false;
                $scope.DataLatencyBarDiv= true;
                $scope.noDataLatencyBarDiv= false;
            }
            else{
                $scope.loadingLatencyBarDiv= false;
                $scope.DataLatencyBarDiv= false;
                $scope.noDataLatencyBarDiv= true;
            }
            
        })
    }

    function defaultLoad(){
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();
        var growthAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Dummy App percent change&App="+$scope.select.App+filterParameters;
                
        multilineIndividualData(growthAppsMultilineURL);

    }
    
    
    
    // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
}
// End App Growth Trend Analytics Controller
//    ----------------------------------------------------------------------------

// app CEI Controller
function appCEICtrl($scope, $state, httpService, globalConfig, $filter,  dataFormatter, highchartOptions, highchartProcessData, globalData, $sce) {
    $scope.QoS= '21000';
    $scope.QoSCountTblOpt= {
        "order" :[]
    }

    function getQoS( QoSCountDevicewise){
        
        //QoS Device Wise
        $scope.loadingQoSDeviceWiseDiv= true;
        $scope.DataQoSDeviceWiseDiv= false;
        $scope.noDataQoSDeviceWiseDiv= false;

        httpService.get(QoSCountDevicewise).then(function(response){
            var objArrayDeviceWise= response.data;
            for(var i in objArrayDeviceWise){
                objArrayDeviceWise[i].App= $sce.trustAsHtml(objArrayDeviceWise[i].App);
                for(j in objArrayDeviceWise[i].data)
                    objArrayDeviceWise[i].data[j].Date= $filter('date')( objArrayDeviceWise[i].data[j].Date, "dd");
            }
            $scope.exportQoSDeviceWise= [];
            $scope.rowDataArray= [];
            $scope.columns= [];
            var responseObj= objArrayDeviceWise;

            if(objArrayDeviceWise.length>0){
                var columnArray= [];
                for(var i in objArrayDeviceWise){
                    var tempColumnArray= []
                    for(var j in objArrayDeviceWise[i].data){
                        tempColumnArray[j]= objArrayDeviceWise[i].data[j].Date;
                        responseObj[i].data[j].CEI= angular.copy(objArrayDeviceWise[i].data[j].CEI);
                    }
                    var temp= _.difference(tempColumnArray, columnArray);
                    if(temp.length > 0){
                        for(j in temp){
                            columnArray.push(temp[j]);
                        }
                    }
                }
                $scope.columns= columnArray;
                var rowDataArray= [];
                for(var j in responseObj){
                    var rowData= [];
                    rowData.push(responseObj[j].App);
                    for(var i in columnArray){
                        var index= _.findIndex(responseObj[j]['data'], function(o) { return o.Date == columnArray[i]; });
                        if(index != -1){
                            if(responseObj[j]['data'][index]['CEI'] == 'Excellent')
                                rowData.push($sce.trustAsHtml(
        "<a><i class='fa fa-square fa-x' style='color: rgb(26, 179, 148);'></i></a>"));
                            else if(responseObj[j]['data'][index]['CEI'] == 'Good')
                                rowData.push($sce.trustAsHtml(
        "<a><i class='fa fa-square fa-x' style='color: #f7a35c;'></i></a>"));
                            else
                                rowData.push($sce.trustAsHtml(
        "<a><i class='fa fa-square fa-x' style='color: rgb(237, 85, 101);'></i></a>"));
                            
                        }
                        else{
                            rowData.push('-');
                        }
                    }
                    rowDataArray.push(rowData);
                }
                
                $scope.rowDataArray= angular.copy(rowDataArray);
                $scope.exportQoSDeviceWise= angular.copy(objArrayDeviceWise);

                $scope.loadingQoSDeviceWiseDiv= false;
                $scope.DataQoSDeviceWiseDiv= true;
                $scope.noDataQoSDeviceWiseDiv= false;
            }else{
                $scope.loadingQoSDeviceWiseDiv= false;
                $scope.DataQoSDeviceWiseDiv= false;
                $scope.noDataQoSDeviceWiseDiv= true;
            }
        })

    }

    function getQoSCountDateRange(){
        var QoSCountDateRangeURL= globalConfig.pullfilterdataurlbyname+"QoS Day wise Count for selected QoSType"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z"+"&QoS=["+$scope.QoS+"]";

        //QoS Date Range Count(Bar chart)
        $scope.loadingQoSCountDateRangeDiv= true;
        $scope.dataQoSCountDateRangeDiv= false;
        $scope.noDataQoSCountDateRangeDiv= false;

        httpService.get(QoSCountDateRangeURL).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= "QoSType";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";

                var QoSCountDateRangeOptions= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                var xAxisData= highchartProcessData.barColumnProcessHighchartData(paramObject);
                QoSCountDateRangeOptions.xAxis.categories= xAxisData;
                QoSCountDateRangeOptions.xAxis.labels.format= "{value:%e %b}";
                QoSCountDateRangeOptions.chart.height= 400;
                
                paramObject.flag= "series";
                
                var dataStackedBar= highchartProcessData.barColumnProcessHighchartData(paramObject);
                
                $scope.QoSCountBarChartConfig= {
                    options: QoSCountDateRangeOptions,
                    series: dataStackedBar
                }

                $scope.loadingQoSCountDateRangeDiv= false;
                $scope.dataQoSCountDateRangeDiv= true;
                $scope.noDataQoSCountDateRangeDiv= false;
            }else{
                $scope.loadingQoSCountDateRangeDiv= false;
                $scope.dataQoSCountDateRangeDiv= false;
                $scope.noDataQoSCountDateRangeDiv= true;
            }
        })
    
    }

    function defaultLoad(){
        var QoSCountDevicewiseURL= globalConfig.pullfilterdataurlbyname+"Dummy App wise date wise cei for col ext";
        
        getQoS( QoSCountDevicewiseURL);
        //getQoSCountDateRange();
    }
    
    defaultLoad();

    // DateRange Submit event
    $scope.click= function(){
        defaultLoad();
    }

    //export QoS Type IMSI List
    $scope.exportQoSType= function(QoSType, format){
        console.log("QoSType", QoSType);
        // console.log("Format", format);
        // $scope.loading = true;
        var QoSIMSIExportURL= globalConfig.pullfilterdataurlbyname+"QoS Export IMSIs"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z&toDate="+$scope.dateSelect+"T23:59:59.999Z"+"&QoS="+QoSType;
        httpService.get(QoSIMSIExportURL).then(function(response){
            var objArray= response.data;
            // $scope.loading = false;
            $scope.getSimpleJSONExport(objArray, format, QoSType+" IMSIs Detail")
        })
    }

    //Export Nested Object
    $scope.expotNestedjsonObj= function(displayData, type) {
        
        $scope.getNestedExport(displayData, type);
    }

    //Select QoS
    $scope.selectQoS= function(QoS){
        $scope.QoS= QoS;
        getQoSCountDateRange();
    }

    //QoS Device wise, Table Click event
    $scope.tableClick= function(element, index, rowDataArray, columns){
        $scope.rowClick= function(indexRow){
            
            var getIMSIListURL= globalConfig.pullfilterdataurlbyname+"QoS Export IMSIs for selected Device QoS"+"&QoS="+columns[index-1]+"&Device="+rowDataArray[indexRow][0]+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z&toDate="+$scope.dateSelect+"T23:59:59.999Z";

            httpService.get(getIMSIListURL).then(function(response){
                var objArray= response.data;
                console.log("objArray", objArray);
                $scope.getSimpleJSONExport(objArray, 'csv', " IMSIs Detail for QoS "+columns[index-1]+" & Device "+rowDataArray[indexRow][0]);
            })
            
        }
    }
 
}
 // app CEI Controller   
//-----------------------------------------------------------------------------------------------------

//Aquisition analytics Controller
function aquisitionAnalyticsCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams, dbService){
    
    var currentTab= 'highUsersLowCEI';
    var filterParameters = "";
    //Filter Section
    var initLatCount= "28.6139" ;
        var initLongCount= "77.2090";
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    //datepicker options
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    $scope.date= {"start":'2017-06-25',"end": '2017-06-30'};
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.company;
            item.key = item.companyid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    
    
    // App filter
    $scope.select= { };
    $scope.select.App= "Youtube";
    
    var appListURL= globalConfig.pulldataurlbyname+"App Filter";
    
    function getAppList(url){
        httpService.get(url).then(function(response){
            var appListArray= [];
            var objArray= response.data;
            //console.log("plan list", objArray);
            for(var i in objArray){
                appListArray[i]= objArray[i].App;
            }
            $scope.appNameList= angular.copy(appListArray);
        })
    }
    
    getAppList(appListURL);
    
    //End of Filter Section
    //--------------------------------------------------------------

    // for Count tab
        $scope.mapCount = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            // display:false,
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapCount(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv= true;
            $scope.noDataCountMapCircleDiv= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapCount.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        /*var colour;
                        if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }*/
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: "Area : "+objArray[i].Area+' (' + objArray[i].cellid +')'+',Users: '+ objArray[i].Users,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            // icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCount= mapcount;
                    
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= false;
                }else{
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= true;
                    $scope.circlesCount= [];
                }
            }); 
        }

    function loadingAppDistributionBar(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingLatencyBarDiv= loadingDivStatus;
        $scope.DataLatencyBarDiv= dataDivStatus;
        $scope.noDataLatencyBarDiv= noDataDivStatus;
    }
    
    function UsagrBucketBar(url, tab){
        var appDistributionBarChartOptions= {};
        
        loadingAppDistributionBar(true, false, false)

        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Users";
                paramObject.seriesName= 'UsageBucket';
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.2f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.enabled= false;
                CEIDistributionUsersChartOptions.legend.reversed= true;
                /*CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.formatter= function() {
                        return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    };*/
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.chart.height= 300;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                CEIDistributionUsersChartOptions.yAxis.stackLabels.enabled= false;
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.HighLatencyBarChartConfig= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportAppDistribution= angular.copy(objArray);

                loadingAppDistributionBar(false, true, false);
            }else{
                loadingAppDistributionBar(false, false, true);
            }
        })
    }

    function AppDistributionBar(url){
        var appDistributionBarChartOptions= {};
        
        loadinglatencyCEIPie(true, false, false)

        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Usage";
                paramObject.seriesName= 'App';
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.2f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'percent';
                CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.enabled= false;
                CEIDistributionUsersChartOptions.legend.reversed= true;
                /*CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.formatter= function() {
                        return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    };*/
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.chart.height= 300;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                CEIDistributionUsersChartOptions.yAxis.stackLabels.enabled= false;
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.LatencyDistributionPieChartConfig= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportLatencyCEI= angular.copy(objArray);

                loadinglatencyCEIPie(false, true, false)
            }else{
                loadinglatencyCEIPie(false, false, true)
            }
        })
    }
    
    function DeviceDistributionBar(url){
        var appDistributionBarChartOptions= {};
        
        loadinglatencyCEIPie(true, false, false)


        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Usage";
                paramObject.seriesName= 'Device';
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.2f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'percent';
                CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.enabled= false;
                CEIDistributionUsersChartOptions.legend.reversed= true;
                /*CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.formatter= function() {
                        return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    };*/
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.chart.height= 300;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                CEIDistributionUsersChartOptions.yAxis.stackLabels.enabled= false;
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.LatencyDistributionPieChartConfig1= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportLatencyCEI1= angular.copy(objArray);

                loadinglatencyCEIPie(false, true, false)
            }else{
                loadinglatencyCEIPie(false, false, true)
            }
        })
    }
    
    function loadinglatencyCEIPie(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingsLatencyDistributionCEIPieDiv= loadingDivStatus;
        $scope.DataLatencyDistributionCEIPieDiv= dataDivStatus;
        $scope.noDataLatencyDistributionCEIPieDiv= noDataDivStatus;
    }
    
    
    function defaultLoad(){
        
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();
        
        switch(currentTab){
            case 'highUsersLowCEI':
                    var mapCountURL= globalConfig.pullfilterdataurlbyname+"Dummy cell wise Users"+filterParameters;
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapCount(mapCountURL);
                    break;
            case 'DevicesHighLatency':
                var DevicesHighLatencyBarURL= globalConfig.pullfilterdataurlbyname+"Dummy UsageBucket wise users"+filterParameters;
                
                AppDistributionBar(DevicesHighLatencyBarURL, "Device");
                break;
            
            case 'AreasHighLatency':
                var AreasHighLatencyBarURL= globalConfig.pullfilterdataurlbyname+"Dummy UsageBucket wise users"+filterParameters;
               
                UsagrBucketBar(AreasHighLatencyBarURL, "Area");
                break;
            
            case 'LatencyDistributionCEI':
                var LatencyDistributionPieURL= globalConfig.pullfilterdataurlbyname+"Dummy App wise Usage"+filterParameters;
                
                AppDistributionBar(LatencyDistributionPieURL);
                break;
            
            case 'latencyPerDay':
               var LatencyDistributionURL= globalConfig.pullfilterdataurlbyname+"Dummy Device wise Usage"+filterParameters;
                
                DeviceDistributionBar(LatencyDistributionURL);
                break;
               
        }
  
    }
    
    defaultLoad();
    
    //app select event 
    $scope.appSelected= function(){
        defaultLoad();
    }
    
    //dateRange select event
    $scope.click= function(){
        defaultLoad();
    }
    
    //change Date event
    $scope.changeDate=function (modelName, newDate) {
        $scope.date.end= newDate.format("YYYY-MM-DD");
    }
    
    //tab Selected event 
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
}
// End Aquisition Analytics Controller
//    ----------------------------------------------------------------------------


//Video analytics Controller
function videoAnalyticsCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams, dbService){
    
    var currentTab= 'highUsersLowCEI';
    var filterParameters = "";
    //Filter Section
    var initLatCount= "28.6139" ;
        var initLongCount= "77.2090";
    var queryParam; 
    
    $scope.treeLocation= false;
    $scope.treeRAT= false;
    $scope.treeSegment= false;
    $scope.treeDevice= false;
    
    //datepicker options
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    
    var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    $scope.date= {"start":'2017-06-25',"end": '2017-06-30'};
    
    /*
    *   Location Filter data
    */
    var sort = JSON.stringify({ 'country' : 1});
    var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {

        /*_.forEach(response.data, function(item){
            item.title = item.country;
            item.key = item.countryid;
        });*/
        _.forEach(response.data, function(item){
            item.title = item.circle;
            item.key = item.circleid;
        });
        $scope.getLocationData.children = response.data;
        var selectStatus= false;
        $("#location").dynatree(angular.copy($scope.getLocationData))
    })
    
    /*
    *   RAT Filter data
    */
    $("#rat").dynatree(angular.copy($scope.getRATData));
    
    /*
    *   Segment Filter data
    */
    $("#segment").dynatree(angular.copy($scope.getSegmentData));
     
    /*
    *   Device Filter data
    */
    
    var sort = JSON.stringify({ 'company' : 1});
    var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
    httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response) {
        $scope.getDeviceData.children = response.data;
        var selectStatus=false;
        _.forEach(response.data, function(item){
            item.title = item.company;
            item.key = item.companyid;
            item.parent = 1;
        });
        //console.log("data: ", deviceData)
        $("#device").dynatree(angular.copy($scope.getDeviceData))
    })
    
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
    
    
    // App filter
    $scope.select= { };
    $scope.select.App= "Youtube";
    
    var appListURL= globalConfig.pulldataurlbyname+"App Filter";
    
    function getAppList(url){
        httpService.get(url).then(function(response){
            var appListArray= [];
            var objArray= response.data;
            //console.log("plan list", objArray);
            for(var i in objArray){
                appListArray[i]= objArray[i].App;
            }
            $scope.appNameList= angular.copy(appListArray);
        })
    }
    
    getAppList(appListURL);
    
    //End of Filter Section
    //--------------------------------------------------------------

    // for Count tab
        $scope.mapCount = {
            center: {
                latitude: initLatCount,
                longitude: initLongCount
            },
            options:{
                scrollwheel: false,
                // Style for Google Maps
                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                // mapTypeId: google.maps.MapTypeId.ROADMAP,
            },
            control: {
                refresh: function(){}
            },
            zoom: 12,
            size:{
                height: '800px'
            },
            // display:false,
            events:
            { 
                /*click: function(marker, eventName, model)
                { 
                    var params= {cellID: model.cellid};
                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
                },*/
                mouseover: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                },
                mouseout: function(marker, eventName, model)
                {   
                    $scope.onHover(marker, eventName, model);
                }
            },
            
        };
        
        $scope.onHover = function(marker, eventName, model) {
            model.show = !model.show;
        };

        $scope.datasetCount= {};
        $scope.circlesCount= []; 
        
        var highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];

        function mapCount(urlMap){
            highCountIndex= [], mediumCountIndex= [], lowCountIndex= [];
            $scope.loadingCountMapCircleDiv= true;
            $scope.noDataCountMapCircleDiv= false;

            $scope.checkboxCountHighStatus= true;
            $scope.checkboxCountMediumStatus= true;
            $scope.checkboxCountLowStatus= true;
        
            $scope.circlesCount= [];
            $timeout(function() {
                $scope.mapCount.control.refresh({latitude: initLatCount, longitude: initLongCount});
            }, 500);
            
            httpService.get(urlMap).then(function (response) {  
                var objArray = response.data;
                 
                if(objArray.length>0){
                    //($scope.highest/3).toFixed(0);

                    /*var datasetCountTable= [];
                    for(var i=0; i< objArray.length; i++ ){
                        datasetCountTable[i]= objArray[i];
                    }
                    $scope.datasetCountTable= datasetCountTable;*/
                    var value= objArray.length;
                    /*if(objArray.length>100){
                        value= 100;
                    }*/
                    
                    var mapcount= [];
                    for (var i = 0; i < value; i++) {
                        
                        /*var colour;
                        if(objArray[i].Congested == 'No')
                        {
                            //colour= "#FF0000";
                            colour= 'images/tower_red.png';
                            highCountIndex.push(i);
                        }else if(objArray[i].Congested == 'Almost')
                        {
                            //colour= "#FFC107"    
                            colour= "images/tower_yellow.png";
                            mediumCountIndex.push(i); 
                        }else if(objArray[i].Congested == 'Yes')
                        {
                            //colour= "#08B21F"
                            colour= "images/tower_green.png";
                            lowCountIndex.push(i);
                        }*/
                        // colour= 'images/tower_red.png';
                        mapcount[i]= {
                            id: i,
                            latitude: objArray[i].latitude,
                            longitude: objArray[i].longitude,
                            title: "Area : "+objArray[i].Area+' (' + objArray[i].cellid +')',//+',Users: '+ objArray[i].Users,
                            // title: 'City: '+objArray[i].city+' <br>Area: '+objArray[i].area+ ' (' + objArray[i].cellid +') <br> Count of MSISDN: '+ objArray[i]['Count of MSISDN']+'<br>lat-lng: '+objArray[i].latitude+'-'+objArray[i].longitude,
                            cellid: objArray[i].cellid,
                            date: $scope.date.end,
                            // area: objArray[i].Area,
                            // icon: colour,
                            options:{visible:true}
                        }
                    }
                    $scope.circlesCount= mapcount;
                    
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= false;
                }else{
                    $scope.loadingCountMapCircleDiv= false;
                    $scope.noDataCountMapCircleDiv= true;
                    $scope.circlesCount= [];
                }
            }); 
        }

    function loadingAppDistributionBar(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingLatencyBarDiv= loadingDivStatus;
        $scope.DataLatencyBarDiv= dataDivStatus;
        $scope.noDataLatencyBarDiv= noDataDivStatus;
    }
    
    function AppDistributionBar(url){
        var appDistributionBarChartOptions= {};
        
        loadinglatencyCEIPie(true, false, false)

        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= 'CEI';
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.2f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.enabled= false;
                CEIDistributionUsersChartOptions.legend.reversed= true;
                /*CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.formatter= function() {
                        return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    };*/
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.chart.height= 300;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                CEIDistributionUsersChartOptions.yAxis.stackLabels.enabled= false;
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.LatencyDistributionPieChartConfig= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportLatencyCEI= angular.copy(objArray);

                loadinglatencyCEIPie(false, true, false)
            }else{
                loadinglatencyCEIPie(false, false, true)
            }
        })
    }
    
    function DeviceDistributionBar(url){
        var appDistributionBarChartOptions= {};
        
        loadinglatencyCEIPie(true, false, false)


        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Device";
                paramObject.data= "Count";
                paramObject.seriesName= 'CEI';
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelCategoriesOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.2f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.enabled= false;
                CEIDistributionUsersChartOptions.legend.reversed= true;
                /*CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.formatter= function() {
                        return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    };*/
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.chart.height= 300;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                CEIDistributionUsersChartOptions.yAxis.stackLabels.enabled= false;
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.LatencyDistributionPieChartConfig1= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportLatencyCEI1= angular.copy(objArray);

                loadinglatencyCEIPie(false, true, false)
            }else{
                loadinglatencyCEIPie(false, false, true)
            }
        })
    }
    
    function loadinglatencyCEIPie(loadingDivStatus, dataDivStatus, noDataDivStatus){
        $scope.loadingsLatencyDistributionCEIPieDiv= loadingDivStatus;
        $scope.DataLatencyDistributionCEIPieDiv= dataDivStatus;
        $scope.noDataLatencyDistributionCEIPieDiv= noDataDivStatus;
    }
    
    
    function defaultLoad(){
        
        $scope.treeLocation = false;
        $scope.treeRAT = false;
        $scope.treeSegment = false;
        $scope.treeDevice = false;

        filterParameters= $scope.filterGetParams();
        
        switch(currentTab){
            case 'highUsersLowCEI':
                    var mapCountURL= globalConfig.pullfilterdataurlbyname+"Dummy Video Analytics cells with Bad cei&fromDate=2017-06-26T00:00:00.000Z"+filterParameters;
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    
                    highCountIndex= []; mediumCountIndex= []; lowCountIndex= [];
                    mapCount(mapCountURL);
                    break;
            case 'DevicesHighLatency':
                var DevicesHighLatencyBarURL= globalConfig.pullfilterdataurlbyname+"Dummy UsageBucket wise users"+filterParameters;
                
                AppDistributionBar(DevicesHighLatencyBarURL, "Device");
                break;
            
            case 'AreasHighLatency':
                var AreasHighLatencyBarURL= globalConfig.pullfilterdataurlbyname+"Dummy UsageBucket wise users"+filterParameters;
               
                UsagrBucketBar(AreasHighLatencyBarURL, "Area");
                break;
            
            case 'LatencyDistributionCEI':
                var LatencyDistributionPieURL= globalConfig.pullfilterdataurlbyname+"Dummy Video Analytics youtube date wise cei"+filterParameters;
                
                AppDistributionBar(LatencyDistributionPieURL);
                break;
            
            case 'latencyPerDay':
               var LatencyDistributionURL= globalConfig.pullfilterdataurlbyname+"Dummy Video Analytics Device wise cei"+filterParameters;
                
                DeviceDistributionBar(LatencyDistributionURL);
                break;
               
        }
  
    }
    
    defaultLoad();
    
    //app select event 
    $scope.appSelected= function(){
        defaultLoad();
    }
    
    //dateRange select event
    $scope.click= function(){
        defaultLoad();
    }
    
    //change Date event
    $scope.changeDate=function (modelName, newDate) {
        $scope.date.end= newDate.format("YYYY-MM-DD");
    }
    
    //tab Selected event 
    $scope.tabSelected= function(tab){
        currentTab= tab;
        defaultLoad();
    }
}
// End Video Analytics Controller
//    ----------------------------------------------------------------------------

