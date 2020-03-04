'use strict';

angular
    .module('specta')
    .controller('SubscriberMovementTrackerLink3Ctrl',SubscriberMovementTrackerLink3Ctrl)
    .controller('CentralSubscriberMovementTrackerLink3Ctrl',CentralSubscriberMovementTrackerLink3Ctrl)
    .controller('SubscriberMovementDetailsLink3Ctrl', SubscriberMovementDetailsLink3Ctrl);



// Start of Subscriber movement tracker of link-3

function SubscriberMovementTrackerLink3Ctrl($scope, httpService, $filter, $state, $stateParams, dataFormatter, globalConfig, flotChartOptions,  $sce, highchartProcessData, highchartOptions,globalData, $rootScope, utility){

    var todayDate= $filter('date')( new Date().getTime(), "yyyy-MM-dd");
     $scope.dateSelect= todayDate;
 
  
     //datepicker options
     $scope.minDate= moment('2016-06-03');
     $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
     
     var cities = [];
     var areas = [];
     var plans = [];
     var segement = [];
     var nodes =[];
     var bras = [];
     var bts = [];
 
     $scope.group = 'all';
 
     $scope.fromUsage='0';
     $scope.toUsage ;
     $scope.unit = 'Bytes';
 
     $scope.fromCount='0';
     $scope.toCount;
    
     
 
     $scope.exportSubscriberThroughput= [];
 
     $scope.tree = {
         zone: false,
         city: false,
         area: false,
         plan: false,
         segment:false,
         node   : false,
         bras : false,
         bts :false
     };
 
     $scope.toggleUsageFilter = function(){
         angular.element('#tglFilter').toggle();
     } 
 
     $scope.toggleCountFilter = function(){
         angular.element('#cntFilter').toggle();
     } 
    //Group By filter 
     $scope.ratData = [
         {"title":"PlanType","key":"Plantype"},
         {"title":"Zone","key":"zone"},
         {"title":"Validity","key":"validity"},
         {"title":"City","key":"city"}
     ]; 
 
     $scope.onTree = function(action){
         for (var i in $scope.tree) {
             if (i != action) {
                 $scope.tree[i] = false;
             } else {
                 $scope.tree[i] = !$scope.tree[i];
             }
         }
     }
 
      //ZONE Filter
     var selectedZones = [];
     $scope.selectedZones = selectedZones;
     $scope.zoneList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             // Display list of selected nodes
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedZones = $.map(node.tree.getSelectedNodes(), function(node){
                 return node.data.key;
             });
             $scope.selectedZones = selectedZones;
             var zoneCities = [];
             if (selectedZones.length == 0 ) {
                 zoneCities = cities;
                 console.log("all cities",cities)
             } else {
                 _.forEach(selectedZones, function(zone) {
                     var region = _.filter(cities, function(item) {
                         return item.region == zone;
                     });
                     zoneCities = zoneCities.concat(region);
                 });
             }
             var cityTree =$("#city").dynatree("getTree");
             cityTree.options.children = zoneCities;
             cityTree.reload();
             $scope.selectedCities = [];
 
             /** Plan reset */
             var planTree =$("#plan").dynatree("getTree");
             planTree.options.children = plans;
             planTree.reload();
             $scope.selectedPlans = [];
             
         }
     }
     function getZone(){
         var params = 'collection=lku_region&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             
             _.forEach(res.data, function(item){
                 item.title = item.region;
                 item.key = item.region;
             });
             $scope.zoneList.children = res.data;
             $("#zone").dynatree(angular.copy($scope.zoneList));
         })
     }
     getZone();
 
     // ---------------------------------------- Advance usage filter----------------------------------------------------
 
     
 
     //------------------------------------------------ City Filter -----------------------------------------------------
     var selectedCities = [];
     $scope.selectedCities = selectedCities;
 
     var cityList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedCities = $.map(node.tree.getSelectedNodes(), function(node){
                 return node.data.key;
             });
             $scope.selectedCities = selectedCities;
         }
     }

     function getRegionCities(){
         var params = 'collection=lku_city&op=select&db=datadb';
         console.log("city URL",globalConfig.dataapiurl + params)
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.City;
                 item.key = item.City;
                 console.log(item.title)
                 console.log(item.key)
             });
             cityList.children = res.data;
             cities = cityList.children;
             $("#city").dynatree(angular.copy(cityList));
         });
     }
     getRegionCities();
 
     
  // --------------------------------------------------- Area Filter ----------------------------------------------------------
 
     var selectedAreas = [];
     $scope.selectedAreas = selectedAreas;
     var areaList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedAreas = $.map(selNodes, function(node){
                 return node.data.key;
             });
             $scope.selectedAreas = selectedAreas;
         }
     }
 
     function getArea(){
         var params = 'collection=lku_area&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.Area;
                 item.key = item.Area;
             });
             areaList.children = res.data;
             areas = areaList.children;
             $("#area").dynatree(angular.copy(areaList));
         });
     }
     getArea();
 
// --------------------------------------------------- Plan Filter ----------------------------------------------------------
     // Plan filter 
     var selectedPlans = [];
     $scope.selectedPlans = selectedPlans;
     var planList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected segment, and convert to a key array:
             selectedPlans = $.map(selNodes, function(node){
                 return node.data.key;
             });
             $scope.selectedPlans = selectedPlans;
         }
        
     }
 
     function getPlan(){
         var params = 'collection=lku_plan&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.Plan;
                 item.key = item.Plan;
             });
             planList.children = res.data;
             $("#plan").dynatree(angular.copy(planList));
         })
     }
     getPlan();

// ---------------------------------------------------- Bras Filter ------------------------------------------------------------
   var selectedBras  = [];
   $scope.selectedBras = selectedBras;

   var brasList= {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},

        onSelect:function(Select,node){
            var selectedNodes = node.tree.getSelectedNodes();
            selectedBras = $.map(selectedNodes,function(node){
                return node.data.key;
            });
            $scope.selectedBras = selectedBras;
        }

   }

   function getBras(){
       var params = 'collection=lku_bras&op=select&db=datadb';
       console.log("bras URL ",globalConfig.dataapiurl+params)
       httpService.get(globalConfig.dataapiurl+params).then(function(res){
           _.forEach(res.data,function(item){
               item.title = item.Bras
               item.key = item.Bras
           });
           brasList.children = res.data;
           $("#bras").dynatree(angular.copy(brasList));
       })


   }
 
   getBras()


// --------------------------------------------------- BTS filter ---------------------------------------------------------------

var selectedBts  = [];
   $scope.selectedBts = selectedBts;

   var btsList= {
        checkbox : true,
        selectMode : 3,
        classNames:{connector:"dynatree-connector",nodeIcon:''},

        onSelect:function(Select,node){
            var selectedNodes = node.tree.getSelectedNodes();
            selectedBts = $.map(selectedNodes,function(node){
                return node.data.key;
            });
            $scope.selectedBts = selectedBts;
        }

   }

   function getBts(){
       var params = 'collection=lku_bts&op=select&db=datadb';
       console.log("bTS URL ",globalConfig.dataapiurl+params)
       httpService.get(globalConfig.dataapiurl+params).then(function(res){
           _.forEach(res.data,function(item){
               item.title = item.Bts
               item.key = item.Bts
           });
           btsList.children = res.data;
           $("#bts").dynatree(angular.copy(btsList));
       })


   }
 
   getBts()

 
// ----------------------------------------------segemnt filter -----------------------------------------------------------------------------------
     // Segmenet FIlter
     var selectedSegement = [];
     $scope.selectedsegement = selectedSegement;
     var segmentList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected segment, and convert to a key array:
             selectedSegement = $.map(selNodes, function(node){
                 return node.data.key;
             });
             $scope.selectedSegement = selectedSegement;
         }
        
     }
 
     function getSegment(){
         var params = 'collection=lku_segment&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.Segment;
                 item.key = item.Segment;
             });
             segmentList.children = res.data;
             $("#segment").dynatree(angular.copy(segmentList));
         })
     }
     getSegment();
 
 
     var groupList = [];
     var groupList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedAreas = $.map(node.tree.getSelectedNodes(), function(node){
                 // if(selectedAreas){
                 //     var groupName = {"title":"Area","key":"Area"}
                 //     $scope.ratData.push(groupName)
                 // }
                 return node.data.key;
                 
             });
         },
 
         // if(selectedAreas.length>10){
 
         // },
         onClick: function(node, event){
             $scope.selectStatus= false;
             
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
     function getGroup(){
         groupList.children = res.data;
         // areas = groupList.children;
         $("#group").dynatree(angular.copy(groupList));
     }
 
 
 
 // ----------------------------------------------- Node wise filter --------------------------------------------------------
     //getGroup();
 
 
     var selectedNodes = [];
     $scope.selectedNodes = selectedNodes;
     var nodeList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedNodes = $.map(selNodes, function(node){
                 return node.data.key;
             });
             $scope.selectedNodes = selectedNodes;
 
             // console.log("ALl node valuea rea ", $scope.selectedNodes)
         }
     }
 
     function getNode(){
         var params = 'collection=lku_node&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.Node;
                 item.key = item.Node;
             });
             nodeList.children = res.data;
             nodes = nodeList.children;
             $("#node").dynatree(angular.copy(nodeList));
         });
     }
     getNode();       
 
 
 
 
 // ------------------------------------------ NOdefilter END ---------------------------------------------
     
 function buidUrl() {
 
         var _url = '';
        //  if(selectedZones.length > 0) {
        //      var Zone = JSON.stringify(selectedZones).replace(/"/g,"'");
        //      _url += "&Zone="+Zone;
        //  }

         if(selectedCities.length > 0) {
             var City = JSON.stringify(selectedCities).replace(/"/g,"'");
             _url += "&City="+encodeURIComponent(City);
         }
         if(selectedAreas.length > 0) {
             var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
             _url += "&Area="+encodeURIComponent(Area);
         }
 
         if(selectedPlans.length > 0) {
             var Plan = JSON.stringify(selectedPlans).replace(/"/g,"'");
             _url += "&Plan="+encodeURIComponent(Plan);
         }
         if(selectedSegement.length > 0) {
             var segement = JSON.stringify(selectedSegement).replace(/"/g,"'");
             _url += "&segment="+encodeURIComponent(segement);
         }
         if(selectedNodes.length > 0) {
             var node = JSON.stringify(selectedNodes).replace(/"/g,"'");
             _url += "&OLT="+encodeURIComponent(node);
         }

         if(selectedBras.length > 0) {
            var bras = JSON.stringify(selectedBras).replace(/"/g,"'");
            _url += "&Bras="+encodeURIComponent(bras);
        }

        if(selectedBts.length > 0) {
            var bts = JSON.stringify(selectedBts).replace(/"/g,"'");
            _url += "&Bts="+encodeURIComponent(bts);
        }
 
         if($scope.fromUsage || $scope.toUsage){
             // console.log("from usage ",typeof($scope.fromUsage))
             var fromUsage, toUsage, paramUsage;
             fromUsage = getBytes($scope.fromUsage, $scope.unit) || '';
             toUsage = getBytes($scope.toUsage, $scope.unit) || '';
             // console.log("from usage vlaue ",fromUsage, toUsage);
             var tmp = getAdvanceFilterParam(fromUsage, toUsage, 'Usage');
             // console.log('tmp', tmp);
             
             _url+= "&UsageFilter="+ encodeURI(tmp) ;
         }
 
         if($scope.fromCount || $scope.toCount){
             var fromCount, toCount;
             fromCount = getBytes($scope.fromCount,'Bytes') || '';
             toCount = getBytes($scope.toCount, 'Bytes') || '';
             var tmp = getAdvanceFilterParam(fromCount,toCount, 'Count');
             _url+= "&CountFilter="+ encodeURI(tmp) ;
         }
         return _url;
     }
 
     function getAdvanceFilterParam(fromValue, toValue,label){
         var paramAdvanceFilter= null;
         if(angular.isDefined(fromValue) && fromValue != ''){
             paramAdvanceFilter = "'$gte':"+fromValue;
             if(toValue != ''){
                 paramAdvanceFilter += ",'$lte':"+toValue;
                     return '{'+paramAdvanceFilter+'}';
             }
             else{
                 return '{'+paramAdvanceFilter+'}';
             }
         }else if(angular.isDefined(toValue)){
             paramAdvanceFilter = "'$lte':"+toValue;
             return '{'+paramAdvanceFilter+'}';
         }
         else{
             swal('', 'Usage filter not selected!!', 'error')
         }
     }
 
     function getBytes(usageValue, unit){
         var usage;
         if(usageValue>=0 && usageValue!=null){
             if(unit != "Bytes"){
                 switch(unit){
                     case 'TB':
                         usage = Math.pow(2,40)*usageValue;
                         break;
                     case 'GB':
                         usage = Math.pow(2,30)*usageValue;
                         break;
                     case 'MB':
                         usage = Math.pow(2,20)*usageValue;
                         break;
                     case 'KB':
                         usage = Math.pow(2,10)*usageValue;
                         break;
                 }
             }
             else
                 usage = usageValue;
         }
         console.log("value after return ",usage)
         return usage;
         
     }
 
 
     // $scope.date.start = '2019-08-01';
     function defaultLoad(){
         if ( selectedZones.length > globalConfig.zoneSize ) {
             swal("Zone should be maximum "+globalConfig.zoneSize);
         } else if ( selectedCities.length > globalConfig.citySize ) {
             swal("Cities should be maximum "+globalConfig.citySize);
         } else if( selectedAreas.length > globalConfig.areaSize ) {
             swal("Area should be maximum "+globalConfig.areaSize);
         } else if ( selectedPlans.length > globalConfig.planSize) {
             swal("Plan should be maximum "+globalConfig.planSize);
         }else if ( selectedNodes.length > globalConfig.nodeSize) {
             swal("Node should be maximum "+globalConfig.nodeSize);
         } 
         else{
             for (var i in $scope.tree) {
                 $scope.tree[i] = false;
             }
             
             $scope.loading = true;
             $scope.dataLoaded = false;
             $scope.noData = false;
             var _url = globalConfig.pullfilterdataurl+"a42d984klfgnxp02g89ghlzc2765"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+
             "T23:59:59.999Z";
             _url += buidUrl();
             _url +=  "&groupby="+ $scope.group;
             console.log(_url);
             httpService.get(_url).then(function(res){
                 $scope.loading = false;
                 $scope.exportSubscriberThroughput= res.data
                 if(res && res.data.length >  0) {
                     $scope.dataLoaded = true;
                     plotData(res.data);
                 } else {
                     $scope.noData = true;
                 }
             }).catch(function(err){
                 console.log('err', err);
                 $scope.loading = false;
                 $scope.dataLoaded = false;
                 $scope.noData = true;
             });
         }  
         
     }
     defaultLoad();
 
     // Submit Click event
     $scope.click= function(){
        
         defaultLoad();
     }
 
     var plotOptions = {
        series: {
            point: {
                events: {
                    click: function(e){
                    var seriesName = e.point.series.name;
                    console.log('e', new Date(e.point.category), e, seriesName);
                    var filters = buidUrl();
                    var params = {
                        filters: filters,
                        fromDate: e.point.category,
                        clickableTooltip: 'Subscriber Movement Details',
                        seriesName: seriesName,
                        group: $scope.group,
                        pageId: $stateParams.id
                    }
                    $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'SubscriberMovementDetailsLink3.html', id: null});
                }
            }
        }
      }
    };
    function plotData(data) {
        var usageDataArray = [];
        for(var i=0; i<data.length;i++){
            _.reverse(data[i].data);
            usageDataArray = usageDataArray.concat(_.map(data[i].data, function(item){
                // console.log("item data usage",item.usage)
                return item.usage;
            }));
    }
//-------------------------------------------------------------------------------------------------------------    
//------------------------------------- This is for count chart ------------------------------------------------
        var paramObject= {};
        paramObject.objArray= data;
        paramObject.label= "date";
        paramObject.data= "count";
        paramObject.seriesName= "Plantype";
        paramObject.seriesdata= "data";
        paramObject.flag= "xAxis";

        
        var category = highchartProcessData.multilineProcessHighchartData(paramObject);
        // _.reverse(category);
        var options = angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptionsLink3);
        options.xAxis.categories= category;
        options.chart.height= 400;
        options.yAxis.title.text= 'Count';
        // options.tooltip.shared = true;
        
        paramObject.flag= "series";
        options.plotOptions = plotOptions;
        console.log("options data ",options)
        console.log("param object",paramObject)
        $scope.countChartConfigLink3= {
            options: options,
            series: highchartProcessData.multilineProcessHighchartData(paramObject)
        }
        
        var dataUnit = dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 1);
        console.log("dataunit array",dataUnit)


    // ---------------------------------------------------------------------------------------------------------------   
    // -------------------------------------- This is for the Data usage chart----------------------------------------

        var paramObjectUsage = {};
        paramObjectUsage.objArray= data;
        paramObjectUsage.label= "date";
        paramObjectUsage.seriesName= "Plantype";
        paramObjectUsage.seriesdata= "data";
        paramObjectUsage.data = 'usage';
        paramObjectUsage.flag= "xAxis";
        paramObjectUsage.unit= dataUnit[1];
        var usageOptions = angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
        usageOptions.xAxis.categories = category;
        usageOptions.chart.height= 400;
        usageOptions.yAxis.title.text= 'Usage ('+ dataUnit[1] +')';
        // options.tooltip.shared = true;
        
        paramObjectUsage.flag= "series";
        usageOptions.plotOptions = plotOptions;
        $scope.usageChartConfig= {
            options: usageOptions,
            series: highchartProcessData.multilineProcessHighchartData(paramObjectUsage)
        }
            

      
    
    //-----------------------------------------------------------------------------------------------------------------    
    //------------------------------------- Up Usage Trend configuration -----------------------------------------------  
    var upusageDataArray = [];
        for(var i=0; i<data.length;i++){
            // _.reverse(data[i].data);
            upusageDataArray = upusageDataArray.concat(_.map(data[i].data, function(item){
                // console.log("item data uusage",item.uusage)
                return item.uusage;
            }));
        }

    var dataUnitUP = dataFormatter.convertFixUnitUsageDataWoUnit(upusageDataArray, 1);

        var paramObject= {};
        paramObject.objArray= data;
        paramObject.label= "date";
        paramObject.data= "uusage";
        paramObject.seriesName= "Plantype";
        paramObject.seriesdata= "data";
        paramObject.flag= "xAxis";
        paramObject.unit= dataUnitUP[1];
        var category = highchartProcessData.multilineProcessHighchartData(paramObject);
        // _.reverse(category);
        var upusageoptions = angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
        upusageoptions.xAxis.categories= category;
        upusageoptions.chart.height= 400;
        upusageoptions.yAxis.title.text= 'Usage ('+dataUnitUP[1] + ')';
        // options.tooltip.shared = true;
        
        paramObject.flag= "series";
        upusageoptions.plotOptions = plotOptions;
        $scope.upusageoptionsChartConfig= {
            options: upusageoptions,
            series: highchartProcessData.multilineProcessHighchartData(paramObject)
        }


    // --------------------------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------- DownUsage Trend ----------------------------------------------------

    var downusageDataArray = [];
    for(var i=0; i<data.length;i++){
        // _.reverse(data[i].data);
        downusageDataArray = downusageDataArray.concat(_.map(data[i].data, function(item){
            return item.dusage;
        }));
    }

   var dataUnitDN = dataFormatter.convertFixUnitUsageDataWoUnit(downusageDataArray, 1);
    
        var paramObject= {};
        paramObject.objArray= data;
        paramObject.label= "date";
        paramObject.data= "dusage";
        paramObject.seriesName= "Plantype";
        paramObject.seriesdata= "data";
        paramObject.flag= "xAxis";
        paramObject.unit= dataUnitDN[1];
        var category = highchartProcessData.multilineProcessHighchartData(paramObject);
        // _.reverse(category);
        var dusageoptions = angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
        dusageoptions.xAxis.categories= category;
        dusageoptions.chart.height= 400;
        dusageoptions.yAxis.title.text= 'Usage ('+dataUnit[1] + ')';
        // options.tooltip.shared = true;
        
        paramObject.flag= "series";
        dusageoptions.plotOptions = plotOptions;
        $scope.dusageoptionsChartConfig= {
            options: dusageoptions,
            series: highchartProcessData.multilineProcessHighchartData(paramObject)
        }
        
    }

     
 }

// end of SUbscriber movement Tracker of link-3   


//Subscriber Movement Details Ctrl
function SubscriberMovementDetailsLink3Ctrl($scope, httpService, $filter, $state, dataFormatter, globalConfig, $stateParams){

    function onLoad(){
        $scope.loading = true;
        $scope.dataLoaded = false;
        $scope.noData = false;
        $scope.startDate = '';

        var startDate = '';
        var _url = globalConfig.pullfilterdataurl+"a42d984klfgnxp02g89ghlzc2766";
        if( $stateParams.params ) {
            startDate = $filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd");
            $scope.startDate = startDate;
            _url += "&fromDate="+startDate+"T00:00:00.000Z";
            _url += $stateParams.params.filters;
            _url += '&column='+$stateParams.params.group;
            _url += '&value='+ $stateParams.params.seriesName;
        }
        console.log('url', _url);
        httpService.get(_url).then(function(res){
            // res.data = res.data.splice(0, 10);
            // console.log('res', res.data[0]);
            $scope.loading = false;
            $scope.exportSubscriberThroughput= res.data
            if(res && res.data.length >  0) {
                $scope.dataLoaded = true;
                $scope.records = res.data;
            } else {
                $scope.noData = true;
            }
        }).catch(function(err){
            console.log('err', err);
            $scope.loading = false;
            $scope.dataLoaded = false;
            $scope.noData = true;
        });
    }
    onLoad();

    $scope.formatUsage = function(usage){
        var data = dataFormatter.formatUsageDataForChart(usage, 3);
        return data[0] +' '+data[1];
    }

    $scope.formatThroughput = function(tp){
        var data = dataFormatter.formatBwByteData(tp, 3);
        return data;
    }

    $scope.goBackPage = function(){
        console.log('stateParams', $stateParams.pageId);
        $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
    }
}
// End Subscriber Movement Details controller


// Start of Subscriber movement tracker of link-3

function CentralSubscriberMovementTrackerLink3Ctrl($scope, httpService, $filter, $state, $stateParams, dataFormatter, globalConfig, flotChartOptions,  $sce, highchartProcessData, highchartOptions,globalData, $rootScope, utility){

    var todayDate= $filter('date')( new Date().getTime(), "yyyy-MM-dd");
     $scope.dateSelect= todayDate;
 
  
     //datepicker options
     $scope.minDate= moment('2016-06-03');
     $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
     
     var cities = [];
     var areas = [];
     var plans = [];
     var segement = [];
     var nodes =[];
     var bras = [];
     var bts = [];
 
     $scope.group = 'all';
 
     $scope.fromUsage='0';
     $scope.toUsage ;
     $scope.unit = 'Bytes';
 
     $scope.fromCount='0';
     $scope.toCount;
    
     
 
     $scope.exportSubscriberThroughput= [];
 
     $scope.tree = {
         zone: false,
         city: false,
         area: false,
         plan: false,
         segment:false,
         node   : false,
         bras : false,
         bts :false
     };
 
     $scope.toggleUsageFilter = function(){
         angular.element('#tglFilter').toggle();
     } 
 
     $scope.toggleCountFilter = function(){
         angular.element('#cntFilter').toggle();
     } 
    //Group By filter 
     $scope.ratData = [
         {"title":"PlanType","key":"Plantype"},
         {"title":"Zone","key":"zone"},
         {"title":"Validity","key":"validity"},
         {"title":"City","key":"city"}
     ]; 
 
     $scope.onTree = function(action){
         for (var i in $scope.tree) {
             if (i != action) {
                 $scope.tree[i] = false;
             } else {
                 $scope.tree[i] = !$scope.tree[i];
             }
         }
     }
 
      //ZONE Filter
     var selectedZones = [];
     $scope.selectedZones = selectedZones;
     $scope.zoneList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             // Display list of selected nodes
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedZones = $.map(node.tree.getSelectedNodes(), function(node){
                 return node.data.key;
             });
             $scope.selectedZones = selectedZones;
             var zoneCities = [];
             var zoneAreas  = [];
             var zonePlans  = [];
             var zoneNodes = [];
             var zoneBts = [];
             var zoneBras = [];
             var zoneSegment = [];
             if (selectedZones.length == 0 ) {
                 zoneCities = cities;
                 zoneAreas  = areas;
                 zonePlans  =  plans;
                 zoneNodes = nodes;
                 zoneBras = bras;
                 zoneBts = bts;
                 zoneSegment =segement;
                 console.log("for Zone Nodes Value ",zoneNodes)
             } else {
                 _.forEach(selectedZones, function(zone) {
                     var site = _.filter(cities, function(item) {
                         return item.site == zone;
                     });
                     zoneCities = zoneCities.concat(site);
                 });

                 _.forEach(selectedZones, function(zone) {
                    var site = _.filter(areas, function(item) {
                        return item.site == zone;
                    });
                    zoneAreas = zoneAreas.concat(site);
                });
                _.forEach(selectedZones, function(zone) {
                    var site = _.filter(plans, function(item) {
                        return item.site == zone;
                    });
                    zonePlans = zonePlans.concat(site);
                });

                _.forEach(selectedZones, function(zone) {
                    var site = _.filter(nodes, function(item) {
                        return item.site == zone;
                    });
                    zoneNodes = zoneNodes.concat(site);
                });


                _.forEach(selectedZones, function(zone) {
                    var site = _.filter(bras, function(item) {
                        return item.site == zone;
                    });
                    zoneBras = zoneBras.concat(site);
                });

                _.forEach(selectedZones, function(zone) {
                    var site = _.filter(bts, function(item) {
                        return item.site == zone;
                    });
                    zoneBts = zoneBts.concat(site);
                });
                _.forEach(selectedZones, function(zone) {
                    var site = _.filter(segement, function(item) {
                        return item.site == zone;
                    });
                    zoneSegment = zoneSegment.concat(site);
                });

             }

             /** for city filter reload */
             var cityTree =$("#city").dynatree("getTree");
             cityTree.options.children = zoneCities;
             cityTree.reload();
             $scope.selectedCities = [];


             /** Area List */
             var areaTree =$("#area").dynatree("getTree");
             areaTree.options.children = zoneAreas;
             areaTree.reload();
             $scope.selectedAreas = [];
 
            /** Plan reset */
             var planTree =$("#plan").dynatree("getTree");
             planTree.options.children = zonePlans;
             planTree.reload();
             $scope.selectedPlans = [];

            /** Node reset */
             var nodeTree =$("#node").dynatree("getTree");
             nodeTree.options.children = zoneNodes;
             nodeTree.reload();
             $scope.selectedNodes = [];


             /** BTS reset */
             var btsTree =$("#bts").dynatree("getTree");
             btsTree.options.children = zoneBts;
             btsTree.reload();
             $scope.selectedBts = []; 


            /** Segment reset */
             var segmentTree =$("#segment").dynatree("getTree");
             segmentTree.options.children = zoneSegment;
             segmentTree.reload();
             $scope.selectedSegement = [];
             
         }
     }
     function getZone(){
         var params = 'collection=lku_circle&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             
             _.forEach(res.data, function(item){
                 item.title = item.Circle;
                 item.key = item.Circle;
             });
             $scope.zoneList.children = res.data;
             $("#zone").dynatree(angular.copy($scope.zoneList));
         })
     }
     getZone();
 
     // ---------------------------------------- Advance usage filter----------------------------------------------------
 
     
 
     //------------------------------------------------ City Filter -----------------------------------------------------
     var selectedCities = [];
     $scope.selectedCities = selectedCities;
 
     var cityList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedCities = $.map(node.tree.getSelectedNodes(), function(node){
                 return node.data.key;
             });
             $scope.selectedCities = selectedCities;
         }
     }

     function getRegionCities(){
         var params = 'collection=lku_city&op=select&db=datadb';
        //  console.log("city URL",globalConfig.dataapiurl + params)
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.City+'['+item.site+']';
                 item.key = item.City;
                //  console.log(item.title)
                //  console.log(item.key)
             });
             cityList.children = res.data;
             cities = cityList.children;
             $("#city").dynatree(angular.copy(cityList));
         });
     }
     getRegionCities();
 
     
  // --------------------------------------------------- Area Filter ----------------------------------------------------------
 
     var selectedAreas = [];
     $scope.selectedAreas = selectedAreas;
     var areaList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedAreas = $.map(selNodes, function(node){
                 return node.data.key;
             });
             $scope.selectedAreas = selectedAreas;
         }
     }
 
     function getArea(){
         var params = 'collection=lku_area&op=select&db=datadb';
         console.log("Area URL",globalConfig.dataapiurl + params)
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.Area+'['+item.site+']';;
                 item.key = item.Area;
             });
             areaList.children = res.data;
             areas = areaList.children;
             $("#area").dynatree(angular.copy(areaList));
         });
     }
     getArea();
 
// --------------------------------------------------- Plan Filter ----------------------------------------------------------
     // Plan filter 
     var selectedPlans = [];
     $scope.selectedPlans = selectedPlans;
     var planList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected segment, and convert to a key array:
             selectedPlans = $.map(selNodes, function(node){
                 return node.data.key;
             });
             $scope.selectedPlans = selectedPlans;
         }
        
     }
 
     function getPlan(){
         var params = 'collection=lku_plan&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.Plan+'['+item.site+']';;
                 item.key = item.Plan;
             });
             planList.children = res.data;
             plans = planList.children;
             $("#plan").dynatree(angular.copy(planList));
         })
     }
     getPlan();

// ---------------------------------------------------- Bras Filter ------------------------------------------------------------
   var selectedBras  = [];
   $scope.selectedBras = selectedBras;

   var brasList= {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},

        onSelect:function(Select,node){
            var selectedNodes = node.tree.getSelectedNodes();
            selectedBras = $.map(selectedNodes,function(node){
                return node.data.key;
            });
            $scope.selectedBras = selectedBras;
        }

   }

   function getBras(){
       var params = 'collection=lku_bras&op=select&db=datadb';
       console.log("bras URL ",globalConfig.dataapiurl+params)
       httpService.get(globalConfig.dataapiurl+params).then(function(res){
           _.forEach(res.data,function(item){
               item.title = item.Bras+'['+item.site+']';
               item.key = item.Bras
           });
           brasList.children = res.data;
           bras =  brasList.children;
           $("#bras").dynatree(angular.copy(brasList));
       })


   }
 
   getBras()


// --------------------------------------------------- BTS filter ---------------------------------------------------------------

var selectedBts  = [];
   $scope.selectedBts = selectedBts;

   var btsList= {
        checkbox : true,
        selectMode : 3,
        classNames:{connector:"dynatree-connector",nodeIcon:''},

        onSelect:function(Select,node){
            var selectedNodes = node.tree.getSelectedNodes();
            selectedBts = $.map(selectedNodes,function(node){
                return node.data.key;
            });
            $scope.selectedBts = selectedBts;
        }

   }

   function getBts(){
       var params = 'collection=lku_bts&op=select&db=datadb';
       console.log("bTS URL ",globalConfig.dataapiurl+params)
       httpService.get(globalConfig.dataapiurl+params).then(function(res){
           _.forEach(res.data,function(item){
               item.title = item.Bts+'['+item.site+']';
               item.key = item.Bts;
           });
           btsList.children = res.data;
           bts = btsList.children;
           $("#bts").dynatree(angular.copy(btsList));
       })


   }
 
   getBts()

 
// ----------------------------------------------segemnt filter -----------------------------------------------------------------------------------
     // Segmenet FIlter
     var selectedSegement = [];
     $scope.selectedsegement = selectedSegement;
     var segmentList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected segment, and convert to a key array:
             selectedSegement = $.map(selNodes, function(node){
                 return node.data.key;
             });
             $scope.selectedSegement = selectedSegement;
         }
        
     }
 
     function getSegment(){
         var params = 'collection=lku_segment&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.Segment+'['+item.site+']';
                 item.key = item.Segment;
             });
             segmentList.children = res.data;
             segement = segmentList.children;
             $("#segment").dynatree(angular.copy(segmentList));
         })
     }
     getSegment();
 
 
     var groupList = [];
     var groupList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedAreas = $.map(node.tree.getSelectedNodes(), function(node){
                 // if(selectedAreas){
                 //     var groupName = {"title":"Area","key":"Area"}
                 //     $scope.ratData.push(groupName)
                 // }
                 return node.data.key;
                 
             });
         },
 
         // if(selectedAreas.length>10){
 
         // },
         onClick: function(node, event){
             $scope.selectStatus= false;
             
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
     function getGroup(){
         groupList.children = res.data;
         // areas = groupList.children;
         $("#group").dynatree(angular.copy(groupList));
     }
 
 
 
 // ----------------------------------------------- Node wise filter --------------------------------------------------------
     //getGroup();
 
 
     var selectedNodes = [];
     $scope.selectedNodes = selectedNodes;
     var nodeList = {
         checkbox: true,
         selectMode: 3,
         classNames: {connector: "dynatree-connector", nodeIcon: ''},
         // children: [],
         onSelect: function(select, node) {
             var selNodes = node.tree.getSelectedNodes();
                    
             // Get a list of all selected nodes, and convert to a key array:
             selectedNodes = $.map(selNodes, function(node){
                 return node.data.key;
             });
             $scope.selectedNodes = selectedNodes;
 
             // console.log("ALl node valuea rea ", $scope.selectedNodes)
         }
     }
 
     function getNode(){
         var params = 'collection=lku_node&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.Node+'['+item.site+']';
                 item.key = item.Node;
             });
             nodeList.children = res.data;
             nodes = nodeList.children;
             $("#node").dynatree(angular.copy(nodeList));
         });
     }
     getNode();       
 
 
 
 
 // ------------------------------------------ NOdefilter END ---------------------------------------------
     
 function buidUrl() {
 
         var _url = '';
         if(selectedZones.length > 0) {
             var Site = JSON.stringify(selectedZones).replace(/"/g,"'");
             _url += "&Site="+encodeURIComponent(Site);
         }

         if(selectedCities.length > 0) {
             var City = JSON.stringify(selectedCities).replace(/"/g,"'");
             _url += "&City="+encodeURIComponent(City);
         }
         if(selectedAreas.length > 0) {
             var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
             _url += "&Area="+encodeURIComponent(Area);
         }
 
         if(selectedPlans.length > 0) {
             var Plan = JSON.stringify(selectedPlans).replace(/"/g,"'");
             _url += "&Plan="+encodeURIComponent(Plan);
         }
         if(selectedSegement.length > 0) {
             var segement = JSON.stringify(selectedSegement).replace(/"/g,"'");
             _url += "&segment="+encodeURIComponent(segement);
         }
         if(selectedNodes.length > 0) {
             var node = JSON.stringify(selectedNodes).replace(/"/g,"'");
             _url += "&OLT="+encodeURIComponent(node);
         }

        //  if(selectedBras.length > 0) {
        //     var bras = JSON.stringify(selectedBras).replace(/"/g,"'");
        //     _url += "&Bras="+bras;
        // }

        if(selectedBts.length > 0) {
            var bts = JSON.stringify(selectedBts).replace(/"/g,"'");
            _url += "&Bts="+encodeURIComponent(bts);
        }
 
         if($scope.fromUsage || $scope.toUsage){
             // console.log("from usage ",typeof($scope.fromUsage))
             var fromUsage, toUsage, paramUsage;
             fromUsage = getBytes($scope.fromUsage, $scope.unit) || '';
             toUsage = getBytes($scope.toUsage, $scope.unit) || '';
             // console.log("from usage vlaue ",fromUsage, toUsage);
             var tmp = getAdvanceFilterParam(fromUsage, toUsage, 'Usage');
             // console.log('tmp', tmp);
             
             _url+= "&UsageFilter="+ encodeURI(tmp) ;
         }
 
         if($scope.fromCount || $scope.toCount){
             var fromCount, toCount;
             fromCount = getBytes($scope.fromCount,'Bytes') || '';
             toCount = getBytes($scope.toCount, 'Bytes') || '';
             var tmp = getAdvanceFilterParam(fromCount,toCount, 'Count');
             _url+= "&CountFilter="+ encodeURI(tmp) ;
         }
         return _url;
     }
 
     function getAdvanceFilterParam(fromValue, toValue,label){
         var paramAdvanceFilter= null;
         if(angular.isDefined(fromValue) && fromValue != ''){
             paramAdvanceFilter = "'$gte':"+fromValue;
             if(toValue != ''){
                 paramAdvanceFilter += ",'$lte':"+toValue;
                     return '{'+paramAdvanceFilter+'}';
             }
             else{
                 return '{'+paramAdvanceFilter+'}';
             }
         }else if(angular.isDefined(toValue)){
             paramAdvanceFilter = "'$lte':"+toValue;
             return '{'+paramAdvanceFilter+'}';
         }
         else{
             swal('', 'Usage filter not selected!!', 'error')
         }
     }
 
     function getBytes(usageValue, unit){
         var usage;
         if(usageValue>=0 && usageValue!=null){
             if(unit != "Bytes"){
                 switch(unit){
                     case 'TB':
                         usage = Math.pow(2,40)*usageValue;
                         break;
                     case 'GB':
                         usage = Math.pow(2,30)*usageValue;
                         break;
                     case 'MB':
                         usage = Math.pow(2,20)*usageValue;
                         break;
                     case 'KB':
                         usage = Math.pow(2,10)*usageValue;
                         break;
                 }
             }
             else
                 usage = usageValue;
         }
         console.log("value after return ",usage)
         return usage;
         
     }
 
 
    //  $scope.date.start = '2019-12-18';
    //  $scope.date.end   =  '2019-12-23';

     function defaultLoad(){
         if ( selectedZones.length > globalConfig.zoneSize ) {
             swal("Zone should be maximum "+globalConfig.zoneSize);
         } else if ( selectedCities.length > globalConfig.citySize ) {
             swal("Cities should be maximum "+globalConfig.citySize);
         } else if( selectedAreas.length > globalConfig.areaSize ) {
             swal("Area should be maximum "+globalConfig.areaSize);
         } else if ( selectedPlans.length > globalConfig.planSize) {
             swal("Plan should be maximum "+globalConfig.planSize);
         }else if ( selectedNodes.length > globalConfig.nodeSize) {
             swal("Node should be maximum "+globalConfig.nodeSize);
         } 
         else{
             for (var i in $scope.tree) {
                 $scope.tree[i] = false;
             }
             
             $scope.loading = true;
             $scope.dataLoaded = false;
             $scope.noData = false;
             var _url = globalConfig.pullfilterdataurl+"a42d984klfgnxp02g89ghlzc2765"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+
             "T23:59:59.999Z";
             _url += buidUrl();
             _url +=  "&groupby="+ $scope.group;
             console.log(_url);
             httpService.get(_url).then(function(res){
                 console.log(res.data)
                 $scope.loading = false;
                 $scope.exportSubscriberThroughput= res.data
                 if(res && res.data.length >  0) {
                     plotData(res.data);
                     $scope.dataLoaded = true;
                 } else {
                     $scope.noData = true;
                 }
             }).catch(function(err){
                 console.log('err', err);
                 $scope.loading = false;
                 $scope.dataLoaded = false;
                 $scope.noData = true;
             });
         }  
         
     }
     defaultLoad();
 
     // Submit Click event
     $scope.click= function(){
        
         defaultLoad();
     }
 
     var plotOptions = {
        series: {
            point: {
                events: {
                    click: function(e){
                    var seriesName = e.point.series.name;
                    console.log('e', new Date(e.point.category), e, seriesName);
                    var filters = buidUrl();
                    var params = {
                        filters: filters,
                        fromDate: e.point.category,
                        clickableTooltip: 'Subscriber Movement Details',
                        seriesName: seriesName,
                        group: $scope.group,
                        pageId: $stateParams.id
                    }
                    // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'SubscriberMovementDetailsLink3.html', id: null});
                }
            }
        }
      }
    };
    function plotData(data) {
        var usageDataArray = [];
        var countDataArray =[];
        for(var i=0; i<data.length;i++){
            _.reverse(data[i].data);
            usageDataArray = usageDataArray.concat(_.map(data[i].data, function(item){

                // console.log("item data usage",item.usage)
                return item.usage;
            }));

            countDataArray = countDataArray.concat(_.map(data[i].data, function(item){
                
                // console.log("item data usage",item.usage)
                return item.count;
            }));
    }
//-------------------------------------------------------------------------------------------------------------    
//------------------------------------- This is for count chart ------------------------------------------------
        var paramObject= {};
        paramObject.objArray= data;
        paramObject.label= "date";
        paramObject.data= "count";
        paramObject.seriesName= "Plantype";
        paramObject.seriesdata= "data";
        paramObject.flag= "xAxis";

        
        var category = highchartProcessData.multilineProcessHighchartData(paramObject);
        var countUnit = dataFormatter.setCountUnit(usageDataArray);
        // _.reverse(category);
        var options = angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptionsCentral);
        options.xAxis.categories= category;
        options.chart.height= 400;
        options.yAxis.title.text= 'Count';
        // options.yAxis.title.text= 'Count ('+ countUnit[1] +')';
        // options.tooltip.shared = true;
        
        paramObject.flag= "series";
        options.plotOptions = plotOptions;

        console.log("count chart value",options)

        $scope.countChartConfigLink3Central= {
            options: options,
            series: highchartProcessData.multilineProcessHighchartData(paramObject)
        }
        
       
        // console.log("dataunit array",dataUnit)


    // ---------------------------------------------------------------------------------------------------------------   
    // -------------------------------------- This is for the Data usage chart----------------------------------------

        var dataUnit = dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 1);
        var paramObjectUsage = {};
        paramObjectUsage.objArray= data;
        paramObjectUsage.label= "date";
        paramObjectUsage.seriesName= "Plantype";
        paramObjectUsage.seriesdata= "data";
        paramObjectUsage.data = 'usage';
        paramObjectUsage.flag= "xAxis";
        paramObjectUsage.unit= dataUnit[1];
        var usageOptions = angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
        usageOptions.xAxis.categories = category;
        usageOptions.chart.height= 400;
        usageOptions.yAxis.title.text= 'Usage ('+ dataUnit[1] +')';
        // options.tooltip.shared = true;
        
        paramObjectUsage.flag= "series";
        usageOptions.plotOptions = plotOptions;
        // console.log("options data of usage  ",usageOptions)
        $scope.usageChartConfig= {
            options: usageOptions,
            series: highchartProcessData.multilineProcessHighchartData(paramObjectUsage)
        }
            

      
    
    //-----------------------------------------------------------------------------------------------------------------    
    //------------------------------------- Up Usage Trend configuration -----------------------------------------------  
    var upusageDataArray = [];
        for(var i=0; i<data.length;i++){
            // _.reverse(data[i].data);
            upusageDataArray = upusageDataArray.concat(_.map(data[i].data, function(item){
                // console.log("item data uusage",item.uusage)
                return item.uusage;
            }));
        }

    var dataUnitUP = dataFormatter.convertFixUnitUsageDataWoUnit(upusageDataArray, 1);

        var paramObject= {};
        paramObject.objArray= data;
        paramObject.label= "date";
        paramObject.data= "uusage";
        paramObject.seriesName= "Plantype";
        paramObject.seriesdata= "data";
        paramObject.flag= "xAxis";
        paramObject.unit= dataUnitUP[1];
        var category = highchartProcessData.multilineProcessHighchartData(paramObject);
        // _.reverse(category);
        var upusageoptions = angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
        upusageoptions.xAxis.categories= category;
        upusageoptions.chart.height= 400;
        upusageoptions.yAxis.title.text= 'Usage ('+dataUnitUP[1] + ')';
        // options.tooltip.shared = true;
        
        paramObject.flag= "series";
        upusageoptions.plotOptions = plotOptions;
        $scope.upusageoptionsChartConfig= {
            options: upusageoptions,
            series: highchartProcessData.multilineProcessHighchartData(paramObject)
        }


    // --------------------------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------- DownUsage Trend ----------------------------------------------------

    var downusageDataArray = [];
    for(var i=0; i<data.length;i++){
        // _.reverse(data[i].data);
        downusageDataArray = downusageDataArray.concat(_.map(data[i].data, function(item){
            return item.dusage;
        }));
    }

   var dataUnitDN = dataFormatter.convertFixUnitUsageDataWoUnit(downusageDataArray, 1);
    
        var paramObject= {};
        paramObject.objArray= data;
        paramObject.label= "date";
        paramObject.data= "dusage";
        paramObject.seriesName= "Plantype";
        paramObject.seriesdata= "data";
        paramObject.flag= "xAxis";
        paramObject.unit= dataUnitDN[1];
        var category = highchartProcessData.multilineProcessHighchartData(paramObject);
        // _.reverse(category);
        var dusageoptions = angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
        dusageoptions.xAxis.categories= category;
        dusageoptions.chart.height= 400;
        dusageoptions.yAxis.title.text= 'Usage ('+dataUnit[1] + ')';
        // options.tooltip.shared = true;
        
        paramObject.flag= "series";
        dusageoptions.plotOptions = plotOptions;
        $scope.dusageoptionsChartConfig= {
            options: dusageoptions,
            series: highchartProcessData.multilineProcessHighchartData(paramObject)
        }
        
    }

     
 }

// end of SUbscriber movement Tracker central of link-3