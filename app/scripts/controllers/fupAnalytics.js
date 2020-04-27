'use strict';

angular
    .module('specta')
    .controller('FupAnalyticsBBCtrl',FupAnalyticsBBCtrl)
    .controller('PotentialUpgradeBBCtrl',PotentialUpgradeBBCtrl)
    .controller('PotentialupgradeDeatilCtrl',PotentialupgradeDeatilCtrl)


// this module is for conatin the information of  
function FupAnalyticsBBCtrl($scope, httpService, $filter, $state, dataFormatter, globalConfig, $stateParams,$window,$uibModal){
    // $scope, $rootScope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal
    $scope.currentPage = 1;
    $scope.select= {};
    $scope.select.rowCount= '50';
    $scope.total_count = 0;
    
    function cut(str, end){
        return str.substr(0,end);
      }

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day];
    }

    function formatDateRecord(date){
        var daterec = cut(date,11,23)
        var d = new Date(daterec),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');

    }

    function onLoad(currentPage){
        $scope.loading = true;
        $scope.dataLoaded = false;
        $scope.noData = false;

        var todayDate= $filter('date')( new Date().getTime(), "yyyy-MM-dd");
        $scope.dateSelect= todayDate;

 
        //datepicker options
        $scope.minDate= moment('2016-06-03');
        $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
        $scope.startDate = '';
        $scope.date_value = '';
        $scope.exportResult = [];
        $scope.records = [];
        $scope.TpmDist= {};
        
        $scope.TpmDist.fileName= 'Fup Analytics';
        $scope.TpmDist.fileHeader= 'Fup Analytics -'+ "From "+$scope.date.start+" to "+$scope.date.end;
    
            // $scope.date.start = '2020-01-01';
            // $scope.date.end = '2019-11-29';

            // alert("item per page ",$scope.pageSize)
            var _url = globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652gh876fd1"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z"+"&pageNo="+$scope.currentPage+"&pageSize="+$scope.select.rowCount;
            

            // console.log("item url ",_url)

            var total_count_url=globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652gh876fd0"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";

            httpService.get(total_count_url).then(function(res){
                $scope.loading = false;
                if(res && res.data.length >  0) {
                    $scope.total_count = res.data[0].count;
                } else {
                    $scope.noData = true;
                }
                
                               
            }).catch(function(err){
                console.log('err', err);
                $scope.loading = false;
                $scope.dataLoaded = false;
                $scope.noData = true;
            });

            httpService.get(_url).then(function(res){
                $scope.loading = false;
                if(res && res.data.length > 0) {
                    $scope.records = res.data;
                    $scope.dataLoaded = true;
                    $scope.exportSubscriberThroughput = res.data;
                    
                    for(var i=0;i<res.data.length;i++){
                       var obj = {
                            "Subscriber Id": res.data[i]['subscriberid'],
                            "Data Limit" : res.data[i]['datalimit'],
                            "Area" : res.data[i]['area'],
                            "City" :res.data[i]['city'],
                            "Plan Speed" : res.data[i]['planspeed'],
                            "Bill Plan" :  res.data[i]['billplan'],
                            "Exhaust Quota day":res.data[i]['exhaustquotaday'],
                            "Fup Start Date" : res.data[i]['fupsd'],
                           "Fup End Date" :  res.data[i]['fuped'],
                           "Still In Fup" :     res.data[i]['stillinfup'],
                           "Fup Cycle" :   res.data[i]['fupcycle'],
                            "No of days" :  res.data[i]['noofdays'],
                            "Fup Date" :  $scope.date_value
                        };
                        $scope.exportResult.push(obj)
                        $scope.date_value = " ";                      
                         
                    }
                    $scope.exportSubscriberThroughput = $scope.exportResult;	 

                } else {
                    $scope.noData = true;
                    $scope.loadingDiv= true;

                }
               
            }).catch(function(err){
                console.log('err', err);
                $scope.loading = false;
                $scope.dataLoaded = false;
                $scope.noData = true;
            });  
    }
       
   
    $scope.displaySubList = function(days){
            var events = [];
            var currentDate = new Date();
            for(var i =0;i<days.length;i++){
                var newformateddate = formatDate(cut(days[i]['$date'],10))
                events.push({'Date': new Date(newformateddate[0],newformateddate[1]-1,newformateddate[2]),'Title': 'FUP Date'})
                
            }
           var modelPath = 'views/fixedLine/eventCalander.html';
            // model window
            var modalInstance = $uibModal.open({
                templateUrl: modelPath, //'views/static/modelSubsListDownload.html',
                controller: ModalInstanceCtrl,
                size : 'lg',
                windowClass: "animated fadeIn"
            });  
            function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {

                $scope.onloadFun = function() {
                
                    var settings = {};

                  for(var i=0;i<=5;i++){
                    var element = document.getElementById('caleandar_'+i);
                    currentDate = new Date();
                    currentDate.setMonth(new Date().getMonth()-i);
                    caleandar(element, events, settings,currentDate.getMonth(),currentDate.getFullYear());
                  }
                  }            
                
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
    
                $scope.loadingDiv= true;
                $scope.noDataDiv= false;

               
    
                // redirect to subscribers details
                // $scope.stateGo= function(subID){
                //     console.log("subID", subID);
                //     var params={};
                //     params.toDate= $rootScope.edate;
                //     params.value= subID;
                //     params= JSON.stringify(params);
    
                //     $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
                //     /*$state.go('index.staticanalysis',{'params': params, 'file':'customerDetailsBB.html','id':null, 'name': 'Customer Details'});
                //     $scope.cancel();*/
                // }
            }  
    
    }

    $scope.click= function(){

     onLoad($scope.currentPage);
    }


    onLoad($scope.currentPage);

    $scope.getData = function(num){
        $scope.currentPage = num;
        onLoad(num)
    }

    $scope.sortBy = function(keyName){
        var changedSortType = $scope.sortType === keyName;
        $scope.sortType = keyName;
        if(changedSortType){
            $scope.sortReverse = !$scope.sortReverse;
        } else{
            $scope.sortReverse = false;
        }
    
    };
    
    $scope.selectValue= function(){
        onLoad();
}     
      
}


// This module for update the potentail upgrade base 
function PotentialUpgradeBBCtrl($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal
    ){

    var date = new Date();
    // var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var previousMonthDate = new Date(date.getFullYear(), date.getMonth()-1, 1);
    $scope.startDate =  convert(previousMonthDate)

$(".datepicker").datepicker({
    clearBtn : true,
    autoclose: true,
    format: "mm-yyyy",
    viewMode: "months", 
    minViewMode: "months",
}).datepicker('setDate', previousMonthDate);

      

    function getData(url){
        $scope.loadingDiv= true; 
        $scope.noDataDiv= false;
        $scope.sdate = $scope.startDate;

        var plotOptions = {
            series: {
                point: {
                    events: {
                        click: function(e){
                            // console.log("value in e",e)
                        var seriesName = e.point.series.name;
                        // console.log("point name ",e.point.name[0])
                        console.log('e', new Date(e.point.category), e, seriesName);
                        var params = {
                            fromDate: $scope.sdate,
                            clickableTooltip: e.point.name,
                            Priority : e.point.name,
                            seriesName: seriesName,
                            pageId: $stateParams.id
                        }
                        $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'PotentialupgradeDeatil.html', id: null});
                    }
                }
            }
          }
        };
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            // console.log("objArray", objArray);
            $scope.HIGH= 0;
            $scope.MEDIUM= 0;
            $scope.LOW= 0;
            
            for(var i in objArray){
                if(objArray[i].Priority == "HIGH")
                $scope.HIGH= objArray[i].Count;
                else if(objArray[i].Priority == "MEDIUM")
                $scope.MEDIUM= objArray[i].Count;
                else if(objArray[i].Priority == "LOW")
                $scope.LOW= objArray[i].Count;
            }


            if(objArray.length>0){

                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){

                    if(objArray[i].Priority == "HIGH"){

                        pieChartArray[i]= {
                            name: objArray[i].Priority, 
                            y: parseFloat(objArray[i].Count),
                            color: "#F13C59"
                        };
                    }
                    else if(objArray[i].Priority == "MEDIUM"){
                        // $scope.HL= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Priority, 
                            y: parseFloat(objArray[i].Count),
                            color: '#52D726'
                        };
                    }
                    else if(objArray[i].Priority == "LOW"){
                        // $scope.LH= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Priority, 
                            y: parseFloat(objArray[i].Count),
                            color: "#007ED6"
                        };
                    }
                    
                }

                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptionsWithClickable);
                // pieChartOpt.plotOptions.pie.dataLabels.style.color= globalConfig.colorpalette;
                pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.y:.0f}';
                pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.y:.0f}</b>';

                // pieChartOpt.pie.point.events = plotOptions;

                pieChartOpt.plotOptions = plotOptions;

                $scope.pieChartConfig= {
                    "options" : pieChartOpt,
                    series: [{
                        name: "Priority",
                        colorByPoint: true,
                        showInLegend:true,
                        data: pieChartArray
                    }]
                }
                $scope.loadingDiv= false; 
                $scope.noDataDiv= false;
            }
            else{
                $scope.loadingDiv= false; 
                $scope.noDataDiv= true;
            }
        })


    }

    function convert(str) {
        var date = new Date(str),
          mnth = ("0" + (date.getMonth() + 1)).slice(-2),
          day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }

    function defaultLoad(){

        $scope.sdate = $scope.startDate;
        var potentailUpgradeURL =  globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652m4p4u4br0"+"&fromDate="+$scope.sdate+"T00:00:00.000Z";
        console.log(potentailUpgradeURL)
        getData(potentailUpgradeURL);

    }

    defaultLoad();
    

    $scope.click= function(){
        $scope.startDate =  convert($(".datepicker[name=datepicker1]").datepicker('getDate'));
        defaultLoad();
    }
    
      
}


function PotentialupgradeDeatilCtrl($scope,$rootScope, httpService, $filter, $state, dataFormatter, globalConfig, $stateParams,$window,$uibModal){

    $scope.currentPage = 1;
    $scope.select= {};
    $scope.select.rowCount= '50';
    $scope.total_count = 0;

    var downLoadUrl;
    
    //--------------------------------------------------------------------------------------------------------------

    $scope.customerID;

    var cities = [];
    var areas = [];
    var plans = [];


    $scope.tree = {
        city: false,
        area: false,
        plan: false
    };


    $scope.onTree = function(action){
        for (var i in $scope.tree) {
            if (i != action) {
                $scope.tree[i] = false;
            } else {
                $scope.tree[i] = !$scope.tree[i];
            }
        }
        console.log("$scope.tree[i]",$scope.tree[i])
    }

    

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
         /** Cities */
         var citiesArea = [];
         var nodeNames = [];
         if (selectedCities.length == 0 ) {
             citiesArea = areas;
         } else {
             _.forEach(selectedCities, function(city) {
                 var area = _.filter(areas, function(item) {
                     return item.City == city;
                 });
                 citiesArea = citiesArea.concat(area);
             });

         }
         var areaTree =$("#area").dynatree("getTree");
         areaTree.options.children = citiesArea;
         areaTree.reload();
         $scope.selectedAreas = [];



         /** Plans */
         var citiesPlans = [];
         if (selectedCities.length == 0 ) {
             citiesPlans = plans;
         } else {
             _.forEach(plans, function(plan) {
                 var objType = {
                     title: plan.title,
                     key: plan.key,
                     children: []
                 };
                 _.forEach(plan.children, function(validity) {
                     var objValidity = {
                         title: validity.title,
                         key: validity.key
                     };
                     var items = _.filter(validity.children, function(item) {
                         return selectedCities.indexOf(item.City) > -1;
                     });
                     if (items.length > 0) {
                         objValidity.children = items;
                         objType.children.push(objValidity);
                     }
                 });
                 if (objType.children.length > 0) {
                     citiesPlans.push(objType);
                 }
             });
         }
         var planTree =$("#plan").dynatree("getTree");
         planTree.options.children = citiesPlans;
         planTree.reload();
         $scope.selectedPlans = [];
     }
 }
 function getRegionCities(){
     var params = 'collection=lku_region_city&op=select&db=datadb';
     httpService.get(globalConfig.dataapiurl + params).then(function (res) {
         _.forEach(res.data, function(item){
             item.title = item.city;
             item.key = item.city;
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

 var selectedPlans = [];
    $scope.selectedPlans = selectedPlans;
    var planList = {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},
        // children: [],
        onSelect: function(select, node) {
            var selNodes = node.tree.getSelectedNodes();
                   
            // Get a list of all selected nodes, and convert to a key array:
            selectedPlans = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            /** Plans */
            var citiesPlans = [];
            if (selectedPlans.length > 0 ) {
                _.forEach(plans, function(plan) {
                    _.forEach(plan.children, function(validity) {
                        _.forEach(validity.children, function(item) {
                            if( selectedPlans.indexOf(item.title) > -1 && citiesPlans.indexOf(item.title) == -1) {
                                citiesPlans.push(item.title);
                            }
                        });
                    });
                });
            }
            $scope.selectedPlans = selectedPlans = citiesPlans;
        }
    }

    function removeDuplicates(array, key) {
        var lookup_t = {};
        var result = [];
        for(var i=0; i<array.length; i++) {
            if(!lookup_t[array[i][key]]){
                lookup_t[array[i][key]] = true;
                result.push(array[i]);
            }
        }
        return result;
    }

    function getPlan(){
        var params = 'collection=lku_plan_city&op=select&db=datadb';
        httpService.get(globalConfig.dataapiurl + params).then(function (res) {
            var types = _.map(res.data, function(item) {
                return item.PlanType;
            });
            types = _.uniq(types);

            var validities = _.map(res.data, function(item) {
                return item.Validity;
            });
            validities = _.uniq(validities);
            var pList = [];
            _.forEach(types, function(type) {
                var objType = {
                    title: type,
                    key: type,
                    children: []
                };
                _.forEach(validities, function(validity) {
                    var objValidity = {
                        title: validity,
                        key: validity
                    };
                    var items = _.filter(res.data, function(item) {
                        item.title = item.key = item.Plan;
                        return item.PlanType == type && item.Validity == validity;
                    });
                    if (items.length > 0) {
                        objValidity.children = removeDuplicates(items, 'Plan');
                        objType.children.push(objValidity);
                    }
                });
                pList.push(objType);
            });
            planList.children = pList;
            plans = planList.children;
            $("#plan").dynatree(angular.copy(planList));
        });
    }
    getPlan();



    //-----------------------------------------------------------------------------------------------

    function cut(str, end){
        return str.substr(0,end);
    }

    function formatDate(date){
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day];
    }

    function onLoad(){

        $scope.loading = true;
        $scope.dataLoaded = false;
        $scope.noData = false;
        $scope.startDate = '';
        var startDate = '';

        var _url =            globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652m4p4u4br2";
        var total_count_url =  globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652m4p4u4br1";
        downLoadUrl =      globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652m4p4u4br3";

        if( $stateParams.params ) {
            startDate = $filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd");
            $scope.startDate = startDate;
            _url += "&fromDate="+startDate+"T00:00:00.000Z";
            total_count_url +="&fromDate="+startDate+"T00:00:00.000Z";
            downLoadUrl +="&fromDate="+startDate+"T00:00:00.000Z";

            var priority="['"+$stateParams.params.Priority +"']"
            _url += '&Priority='+encodeURIComponent(priority);
            total_count_url += '&Priority='+encodeURIComponent(priority);
            downLoadUrl += '&Priority='+encodeURIComponent(priority);
        }


        var monthsName = [];
        function converterToMonthName(s) {
            var months_update = [];
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            // s = "2020-01-01";
            s =  s.replace(/-/g, '/');

            // currentDate = new Date();
            // currentDate.setMonth(new Date().getMonth()-i);
            var d = new Date(s); 

            // console.log(d)

            months_update.push(months[d.getMonth()])

            d.setMonth(d.getMonth()-1);


            // console.log("months number ",d.getMonth())
            
           
            months_update.push(months[d.getMonth()])  
            return  months_update

        }

        monthsName = converterToMonthName($scope.startDate)
        $scope.currentMonth = monthsName[0];
        $scope.lastMonth = monthsName[1];


        if($scope.customerID){

            _url += '&Subscriberid='+$scope.customerID;
            total_count_url +='&Subscriberid='+$scope.customerID;

        }

        if(selectedCities.length > 0) {
            var City = JSON.stringify(selectedCities).replace(/"/g,"'");
            _url += "&City="+encodeURIComponent(City);
            total_count_url +="&City="+encodeURIComponent(City);
        }

        if(selectedAreas.length > 0) {
            console.log("Selcted ARea NAme ",selectedAreas)
            var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
            _url += "&Area="+encodeURIComponent(Area);
            total_count_url +="&Area="+encodeURIComponent(Area);
        }

        if(selectedPlans.length > 0) {
            var Plan = JSON.stringify(selectedPlans).replace(/"/g,"'");
            _url += "&Plan="+encodeURIComponent(Plan);
            total_count_url +="&Plan="+encodeURIComponent(Plan);
        }

        _url = _url+"&pageNo="+$scope.currentPage+"&pageSize="+$scope.select.rowCount;

        if ( selectedCities.length > globalConfig.citySize_Pot  ) {
            $scope.noData = true;
            $scope.loading = false;
            swal("Cities should be maximum "+globalConfig.citySize_Pot);
        } else if( selectedAreas.length > globalConfig.areaSize_Pot ) {
            $scope.noData = true;
            $scope.loading = false;
            swal("Area should be maximum "+globalConfig.areaSize_Pot);
        } else if ( selectedPlans.length > globalConfig.planSize_Pot) {
            $scope.noData = true;
            $scope.loading = false;
            swal("Plan should be maximum "+globalConfig.planSize_Pot);
        }
        else{


        httpService.get(_url).then(function(res){
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
    
        httpService.get(total_count_url).then(function(res){
            $scope.loading = false;
            if(res && res.data.length >  0) {
                $scope.total_count = res.data[0].count;
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
    onLoad();

    $scope.displaySubList = function(days){
        var events = [];
        var currentDate = new Date();
        for(var i =0;i<days.length;i++){
            var newformateddate = formatDate(cut(days[i]['$date'],10))
            events.push({'Date': new Date(newformateddate[0],newformateddate[1]-1,newformateddate[2]),'Title': 'FUP Date'})
            
        }
       var modelPath = 'views/fixedLine/eventCalander.html';
        // model window
        var modalInstance = $uibModal.open({
            templateUrl: modelPath, //'views/static/modelSubsListDownload.html',
            controller: ModalInstanceCtrl,
            size : 'lg',
            windowClass: "animated fadeIn"
        });  
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {

            $scope.onloadFun = function() {
            
                var settings = {};

              for(var i=0;i<=5;i++){
                var element = document.getElementById('caleandar_'+i);
                currentDate = new Date();
                currentDate.setMonth(new Date().getMonth()-i);
                caleandar(element, events, settings,currentDate.getMonth(),currentDate.getFullYear());
              }
              }            
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.loadingDiv= true;
            $scope.noDataDiv= false;

           

            // redirect to subscribers details
            // $scope.stateGo= function(subID){
            //     console.log("subID", subID);
            //     var params={};
            //     params.toDate= $rootScope.edate;
            //     params.value= subID;
            //     params= JSON.stringify(params);

            //     $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
            //     /*$state.go('index.staticanalysis',{'params': params, 'file':'customerDetailsBB.html','id':null, 'name': 'Customer Details'});
            //     $scope.cancel();*/
            // }
        }  

    }

    $scope.goBackPage = function(){
        $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
    }

    // redirect to subscribers details
    $scope.stateGo= function(subID){
        var params={};
        params.toDate= $scope.startDate;
        params.value= subID;
        params= JSON.stringify(params);

        // $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
        $state.go('index.staticanalysis',{'params': params, name: true,'file':'customerDetailsBB.html','id':null, 'name': 'Customer Details'});
    }

    $scope.getData = function(num){
        $scope.currentPage = num;
        onLoad(num)
            
    }

    $scope.sortBy = function(keyName){
        var changedSortType = $scope.sortType === keyName;
        $scope.sortType = keyName;
        if(changedSortType){
            $scope.sortReverse = !$scope.sortReverse;
        } else{
            $scope.sortReverse = false;
        }
    
    };
      
    $scope.selectValue= function(){
        onLoad();
    }
    
    $scope.submit= function(){
        onLoad();
    }  
    
    $scope.downloadData= function(){
        downLoadUrl=downLoadUrl+"&mode=Download&reportname=MonthlyPotentialUpgrade&format=csv"
        httpService.get(downLoadUrl).then(function(res){
                //    swal("Click on bell icon to download the file");
                const wrapper = document.createElement('div');
               wrapper.innerHTML = wrapper.innerHTML = "<i class='fa fa-bell'><i>";

                swal({
                title: 'Your request under process',
                text: 'Click on bell icon to download the file',
                icon: "success",
                });
        }).catch(function(err){
            console.log('err', err);
           
        });

    }
}
    

