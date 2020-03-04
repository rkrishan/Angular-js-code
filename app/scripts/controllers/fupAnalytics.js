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
    var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    $scope.startDate =  convert(firstDayofMonth)

$(".datepicker").datepicker({
    clearBtn : true,
    autoclose: true,
    format: "mm-yyyy",
    viewMode: "months", 
    minViewMode: "months",
}).datepicker('setDate', new Date());

      

    function getData(url){
        $scope.loadingDiv= true; 
        $scope.noDataDiv= false;
        $scope.sdate = $scope.startDate;

        var plotOptions = {
            series: {
                point: {
                    events: {
                        click: function(e){
                            console.log("value in e",e)
                        var seriesName = e.point.series.name;
                        // console.log("point name ",e.point.name[0])
                        console.log('e', new Date(e.point.category), e, seriesName);
                        var params = {
                            fromDate: $scope.sdate,
                            clickableTooltip: e.point.name,
                            priority : e.point.name,
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
                if(objArray[i].priority == "HIGH")
                    $scope.H= objArray[i].count;
                else if(objArray[i].priority == "MEDIUM")
                    $scope.HL= objArray[i].count;
                else if(objArray[i].Status == "LOW")
                    $scope.LL= objArray[i].count;
            }


            if(objArray.length>0){

                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){

                    if(objArray[i].priority == "HIGH"){

                        pieChartArray[i]= {
                            name: objArray[i].priority, 
                            y: parseFloat(objArray[i].count),
                            color: "#F13C59"
                        };
                    }
                    else if(objArray[i].priority == "MEDIUM"){
                        // $scope.HL= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].priority, 
                            y: parseFloat(objArray[i].count),
                            color: '#52D726'
                        };
                    }
                    else if(objArray[i].priority == "LOW"){
                        // $scope.LH= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].priority, 
                            y: parseFloat(objArray[i].count),
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
                        name: "priority",
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
        var potentailUpgradeURL =  globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652m4p4u4br1"+"&fromDate="+$scope.sdate+"T00:00:00.000Z";
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




    //----------------------------------------------  Getting current and previous month name--------------------


    var now = new Date();
    // var currentYear = (new Date).getFullYear();
    $scope.currentMonth = GetMonthName((new Date).getMonth());
    $scope.lastMonth = GetMonthName((now.getMonth() - 1));

    function GetMonthName(monthNumber) {
        monthNumber = monthNumber < 0 ? 11 : monthNumber;
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthNumber];
      }

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
     }
 }

 function getRegionCities(){
    var params = 'collection=lku_city&op=select&db=datadb';
     httpService.get(globalConfig.dataapiurl + params).then(function (res) {
         _.forEach(res.data, function(item){
             item.title = item.City;
             item.key = item.City;
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
    // console.log("Arae filter ",globalConfig.dataapiurl + params)
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
    var params = 'collection=lku_plan_city&op=select&db=datadb';
    // console.log("Plan filter ",globalConfig.dataapiurl + params)
     httpService.get(globalConfig.dataapiurl + params).then(function (res) {
         _.forEach(res.data, function(item){
             item.title = item.Plan;
             item.key = item.Plan;
         });
         planList.children = res.data;
         plans = planList.children;
         $("#plan").dynatree(angular.copy(planList));
     })
 }
 getPlan();



    //-----------------------------------------------------------------------------------------------

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


    function onLoad(){
        $scope.loading = true;
        $scope.dataLoaded = false;
        $scope.noData = false;
        $scope.startDate = '';
        var startDate = '';

        var _url =            globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652m4p4u4br2test";
        var total_count_url =  globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652gh876fdc0";

        if( $stateParams.params ) {

            startDate = $filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd");
            $scope.startDate = startDate;
            _url += "&fromDate="+startDate+"T00:00:00.000Z";
            total_count_url +="&fromDate="+startDate+"T00:00:00.000Z";

            var priority="['"+$stateParams.params.priority +"']"
            _url += '&Priority='+encodeURIComponent(priority);
            total_count_url += '&priority='+encodeURIComponent(priority);
        }

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
            var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
            _url += "&Area="+encodeURIComponent(Area);
            total_count_url +="&Area="+encodeURIComponent(Area);
        }

        if(selectedPlans.length > 0) {
            var Plan = JSON.stringify(selectedPlans).replace(/"/g,"'");
            _url += "&Plan="+encodeURIComponent(Plan);
            total_count_url +="&Area="+encodeURIComponent(Area);
        }

        _url = _url+"&pageNo="+$scope.currentPage+"&pageSize="+$scope.select.rowCount;

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
        
    // $scope.sortBy = function(keyName){
    //     var changedSortType = $scope.sortType === keyName;
    //     $scope.sortType = keyName;

    //     if(changedSortType){
    //             $scope.sortReverse = !$scope.sortReverse;
    //         } else {
    //             $scope.sortReverse = false;
    //         }
        
    //     };

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
}