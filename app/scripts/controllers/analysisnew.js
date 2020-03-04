'use strict';

angular.module('specta')
  .controller('AnalysisNewCtrl', function ($scope, $timeout, $stateParams, $state, SweetAlert, ChartService, UserProfile, dbService, httpService){
    
    $scope.userProfile = UserProfile.profileData;
    $scope.data = { 'name': '', 'description': '', 'type': '', 'serialno': '' };
    $scope.filter = [];
    //$scope.filter= ['location', 'rat', 'segment', 'device', 'plan'];
    // $scope.filter= ['location', 'plan'];
    $scope.filterArr = [];

    function loadFilter(){
        var url = dbService.makeUrl({collection: 'lku_filter', op:'select'});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                $scope.filter = res.data[0].filters;
            }
            // else swal('', 'Could not load filter', 'warning');
        });
        // $scope.filter = ['location', 'rat', 'segment', 'device', 'plan'];
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

    if(angular.isDefined($stateParams.id) && $stateParams.id.length > 0){
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
        httpService.get(url).then(function(response){
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
        $state.go('index.analysislist');
    }

    $scope.save = function(item){

        item.serialno = parseInt(item.serialno);
        /*if(item.type == 'dynamic')
            item.filter = $scope.filterArr;
        else
            delete item.filter;*/

        /*if( $.inArray('date', $scope.filterArr) > -1 ||  $.inArray('singleDatepicker', $scope.filterArr) > -1)
            item.day = parseInt(item.day);
        else
            delete item.day;

        if( $.inArray('text', $scope.filterArr) > -1)
            item.txt = item.txt;
        else
            delete item.txt;*/

        if( angular.isDefined($stateParams.id) && $stateParams.id.length > 0 ){
            delete item._id;
            var url = dbService.makeUrl({collection: 'analysis', op:'upsert', id: $stateParams.id});
            httpService.post(url, item).then(function(response){
                if(response.data == 'Success')
                    ChartService.refreshAnalysis();

                $state.go('index.analysislist');
            });
        }
        else{
            item.userId = $scope.userProfile.userId;
            var url = dbService.makeUrl({collection: 'analysis', op:'create'});
            httpService.post(url, item).then(function(response){
                ChartService.refreshAnalysis();
                $state.go('index.analysislist');
            });
        }
    }

    $scope.checkFilter = function(item, list){
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
        console.log($scope.filterArr);
    }
});