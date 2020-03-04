'use strict';

angular.module('specta')
  .controller('StagingNewCtrl', function ($scope, $timeout, $stateParams, $state, SweetAlert, UserProfile, httpService, dbService, currentUser, ChartService){

    if (currentUser.userType == 'user' || currentUser.userId == null){
        $state.go('login');
        return;
    }

    $scope.userProfile = currentUser;
    $scope.data        = { 'name': '', 'description': '', 'type': '', filterType : {}, filter : {} };
    $scope.filter      = ['location', 'rat', 'segment', 'device', 'plan'];


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
    
    if(angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'staging', op:'select', params: params});
        httpService.get(url).then(function(response){
            // $scope.data = response.data[0];
             if(response.data.length > 0){
                $scope.data = response.data[0];

                if(angular.isArray($scope.data.filter))
                    $scope.data.filter = {}

                if(!$scope.data.filterType)
                    $scope.data.filterType = {}
            }
        })
    }
    
    $scope.cancel = function (){
        $state.go('index.staginglist');
    }

    /*$scope.save = function(){
        if(angular.isDefined($stateParams.id) && $stateParams.id != ''){
            var req = {
                'userId': $scope.userProfile.userId,
                'name': $scope.data.name,
                'description': $scope.data.description,
                'type': $scope.data.type
            };
            if(req.type == 'static')
                req.file = $scope.data.file;
            
            //console.log('update', req);
            var url = dbService.makeUrl({collection: 'staging', op:'upsert', id: $stateParams.id});
            httpService.post(url, req).then(function (result){
                ChartService.refreshStaging();
                $state.go('index.staginglist');
            });
        }
        else{
            var req = $scope.data;
            req.userId = $scope.userProfile.userId;
            var url = dbService.makeUrl({collection: 'staging', op:'create', id: $stateParams.id});
            httpService.post(url, req).then(function (result){
                ChartService.refreshStaging();
                $state.go('index.staginglist');
            });
        }
    }*/

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

    $scope.save = function(req){
        if(angular.isDefined($stateParams.id) && $stateParams.id != ''){
            /*var req = {
                'userId': $scope.userProfile.userId,
                'name': $scope.data.name,
                'description': $scope.data.description,
                'type': $scope.data.type,
                'serialno': parseInt($scope.data.serialno)
            };*/
            req.serialno = parseInt(req.serialno)

            if(req.type == 'static')
                req.file = $scope.data.file;

            if( $.inArray('date', $scope.filterArr) > -1 || $.inArray('singleDatepicker', $scope.filterArr) > -1)
                req.day = parseInt($scope.data.day);
            else
                delete req.day;

            if( $.inArray('text', $scope.filterArr) > -1)
                req.txt = $scope.data.txt;
            else
                delete req.text;

            delete req._id
            var url = dbService.makeUrl({collection: 'staging', op:'upsert', id: $stateParams.id});
            httpService.post(url, req).then(function (result){
                if(result.data == 'Success')
                    ChartService.refreshStaging();

                $state.go('index.staginglist');
            });
        }
        else{
            var req = $scope.data;
            req.userId = $scope.userProfile.userId;
            var url = dbService.makeUrl({collection: 'staging', op:'create', id: $stateParams.id});
            httpService.post(url, req).then(function (result){
                ChartService.refreshStaging();
                $state.go('index.staginglist');
            });
        }
    }

    /*$scope.checkFilter = function (item, list){
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
        console.log($scope.filterArr);
    }*/

    $scope.checkType = function(item, flag){
        console.log(item, flag, $scope.data);
        if(!flag)
            delete $scope.data.filterType[item];
        else
            $scope.data.filterType[item] = 'single';
    }
})