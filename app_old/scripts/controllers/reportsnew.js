
'use strict';

angular.module('specta')
  .controller('ReportsnewNewCtrl', function ($scope, $timeout, $stateParams, $state, SweetAlert, ChartService, UserProfile, dbService, httpService, currentUser){

    var granularity = [];

    $scope.userProfile = UserProfile.profileData;
    $scope.data = { 'name': '', 'description': '', 'type': '', 'serialno': '', filterType: {} };
    $scope.filter = [];
    // $scope.filter = ['location', 'rat', 'segment', 'device', 'plan'];
    
    $scope.filterArr = [];

    function loadFilter(){
        var url = dbService.makeUrl({collection: 'lku_filter', op: 'select'});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                $scope.filter = res.data[0].filters;
            }
            // else swal('', 'Couldn not load filter', 'warning');
        });
        
    }
    loadFilter();
    
    $scope.useCaseList = [];
    function loadCategory(){
        var url = dbService.makeUrl({collection: 'category', op:'select'});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                $scope.useCaseList = res.data;
            }
        });
    }
    loadCategory();


    if(angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
        httpService.get(url).then(function(response){
            // console.log(response.data);
            if(response.data.length > 0){
                if(angular.isArray(response.data[0].filter))
                    delete response.data[0].filter;
                $scope.data = response.data[0];
                // if(response.data[0].filter)
                //     $scope.filterArr = response.data[0].filter;
            }
        });
    }

    $scope.cancel = function (){
        $state.go('index.reportslist');
    }

    $scope.save = function (item){
        // console.log("$scope.data",item.filter.view)
        // console.log(item, $scope.data); 
        // return;
        item.serialno = parseInt(item.serialno);
        if(item.type != 'dynamic') delete item.filter;

        if(typeof item.filter == 'object'){
            console.log("item.filter",item.filter)
            for(var i in item.filter){
                console.log(item.filter[i])
                if(!item.filter[i])
                    delete item.filter[i]
            }
        }
        else if(typeof item.filter == 'array'){
            var tt = {};
            for(var i in item.filter){
                tt[item.filter[i]] = true;
            }
            item.filter = tt;
        }
        if( angular.isDefined($stateParams.id) && $stateParams.id.length > 0 ){
            delete item._id;

            var url = dbService.makeUrl({collection: 'report', op:'upsert', id: $stateParams.id});
            httpService.post(url, item).then(function(response){
                if(response.data == 'Success')
                    ChartService.refreshReport();

                $state.go('index.reportslist');
            });
        }
        else{
            item.userId = currentUser.userId;
            console.log("item",item)
            var url = dbService.makeUrl({collection: 'report', op:'create'});
            httpService.post(url, item).then(function(response){
                console.log("response",response)
                ChartService.refreshReport();
                $state.go('index.reportslist');
            });
        }
    }

    $scope.checkFilter = function (item, list){
        console.log(item, list);
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
        console.log($scope.filterArr);
    }

    /*$("#daysView").datepicker({
        minViewMode: 'days',
        autoclose:"true",
        format:"yyyy-mm-dd"
    }).on("changeDate", function(e) {
        //console.log(e.date);
        var date = e.date;
        var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        console.log('startDate', startDate);
        var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()+6);
        //$('#weekpicker').datepicker("setDate", startDate);
        var date = (startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' +  startDate.getFullYear() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' +  endDate.getFullYear();
        $scope.data.day = date;
        console.log(date);
        // $('#test').datepicker('update', startDate);
        // $('#test').val((startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' +  startDate.getFullYear() + ' - ' + (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' +  endDate.getFullYear());
    });*/

    $scope.daysView = function(e){
        console.log('date', $scope.data.day);
        var date = new Date($scope.data.day);
        // console.log(date.getFullYear(), date.getMonth()+1, date.getDate() - date.getDay());
        var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        // console.log('startDate', startDate);
        var endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()+6);
        // console.log('endDate', endDate);
        var week = startDate.getDate() + '/' + (startDate.getMonth() + 1) + '/' +  startDate.getFullYear() + ' - ' + endDate.getDate() + '/' + (endDate.getMonth() + 1) + '/' + endDate.getFullYear();
        console.log(week);
        $scope.data.day = week;
    }
    
    $scope.checkGranularity = function(item){
        console.log($scope.data.granularity, item, $scope.data.GranularityDefault);
        if($scope.data.GranularityDefault == item) $scope.data.GranularityDefault = $scope.data.granularity[item];
    }

    $scope.isShow = false
    $scope.ischeck = function(view){
        console.log("view",view)
        if(view == 'Day'){
            $scope.isShow = true
        }
        else{
            $scope.isShow = false
        }

    }

    $scope.checkType = function(item, flag){
        console.log(item, flag);
        if(!flag)
            delete $scope.data.filterType[item];
        else
            $scope.data.filterType[item] = 'single';
    }
});