'use strict';

angular
    .module('specta')
    .controller('FupAnalyticsBBCtrl',FupAnalyticsBBCtrl)


// this module is for conatin the information of  
function FupAnalyticsBBCtrl($scope, httpService, $filter, $state, dataFormatter, globalConfig, $stateParams,$window,$uibModal){
    // $scope, $rootScope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal
    $scope.currentPage = 1;
    $scope.pageSize = '10';
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
        var todayDate= $filter('date')( new Date().getTime(), "yyyy-MM-dd");
        $scope.dateSelect= todayDate;

 
        //datepicker options
        $scope.minDate= moment('2016-06-03');
        $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
        $scope.loading = true;
        $scope.dataLoaded = false;
        $scope.noData = false;
        // $scope.startDate = '';
        $scope.records = [];

        $scope.TpmDist= {};
        // $scope.TpmDist.fileName   = "Fup Details";
        // $scope.TpmDist.fileHeader = 'Fup Details';

        $scope.TpmDist.fileName= 'Fup Analytics';
        $scope.TpmDist.fileHeader= 'Fup Analytics -'+ "From "+$scope.date.start+" to "+$scope.date.end;
    
            // $scope.date.start = '2019-11-28';
            // $scope.date.end = '2019-11-29';

            var _url = globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652gh876fd1"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"&pageNo="+currentPage+"&pageSize="+ $scope.pageSize ;
            "T23:59:59.999Z";

            console.log("item url ",_url)

            var total_count_url=globalConfig.pullfilterdataurl+"af01dcb6249d89f4a652gh876fd0"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end;
            "T23:59:59.999Z";

            httpService.get(total_count_url).then(function(res){
                $scope.loading = false;
                $scope.total_count = res.data[0].count;

                               
            }).catch(function(err){
                console.log('err', err);
                $scope.loading = false;
                $scope.dataLoaded = false;
                $scope.noData = true;
            });


            // console.log('url', _url);
            httpService.get(_url).then(function(res){
                $scope.loading = false;
                // $scope.exportSubscriberThroughput= res.data
                // console.log("response data",res.data)
                if(res && res.data.length > 0) {
                    $scope.dataLoaded = true;
                    $scope.records = res.data;
                    $scope.exportSubscriberThroughput = $scope.records;
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
       
   
    $scope.displaySubList = function(days){
            var events = [];

            var currentDate = new Date();
            var currentMonth = currentDate.getMonth();
            var currentYear = currentDate.getFullYear();
            var previousMonth;


           var m = (new Date(currentYear, currentDate.getMonth() - 6, 1).getMonth());
           var yr = (new Date(currentYear, currentDate.getMonth() - 6, 1).getFullYear()); 
                

            if(m==6){
                previousMonth = 11;
            }
            else{
                previousMonth = currentMonth;
            }


            // console.log(currentMonth,currentYear)

            for(var i =0;i<days.length;i++){
                // console.log(days[i]['$date'])

                var newformateddate = formatDate(cut(days[i]['$date'],10))
                // console.log(newformateddate)
                events.push({'Date': new Date(newformateddate[0],newformateddate[1]-1,newformateddate[2]),'Title': 'Date'})
                
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
                    var element = document.getElementById('caleandar');
                    caleandar(element, events, settings,currentMonth,currentYear);

                    var element = document.getElementById('caleandar_1');
                    caleandar(element, events, settings,previousMonth,currentYear-1);

                    var element = document.getElementById('caleandar_2');
                    caleandar(element, events, settings,previousMonth-1,currentYear-1);

                    
                    var element = document.getElementById('caleandar_3');
                    caleandar(element, events, settings,previousMonth-2,currentYear-1);

                    var element = document.getElementById('caleandar_4');
                    caleandar(element, events, settings,previousMonth-3,currentYear-1);

                    var element = document.getElementById('caleandar_5');
                    caleandar(element, events, settings,previousMonth-4,currentYear-1);

                    
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

    $scope.sort = function(keyname){
        $scope.sortKey = keyname; //the sort column name
        $scope.isASC = !$scope.isASC; // ASC/DESC sorting
        }

    
      
}
