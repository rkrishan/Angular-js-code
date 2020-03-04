'use strict';

angular.module('specta')
  .controller('OfflinescheduleCtrl', function ($scope, $timeout, $state, $stateParams, globalConfig, SweetAlert, dbService, httpService, currentUser){

    if(currentUser.userType == 'user'){
        $state.go('index.main');
        return;
    }
    $scope.isreadOnly = false;

    $scope.data = {group : 'Pinnacle'}
    
    function pluginSchedule(){
        var url = dbService.makeUrl({collection: 'pluginSchedule', op:'select'});
        httpService.get(url).then(function(response){
            $scope.pluginList = response.data;
        });
    }
    pluginSchedule()

    var offLineList = [];
    function offlineSchedule(){
        var fields = JSON.stringify(["name"]);
        var params = 'fields='+ encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'offlineSchedule', op:'select', params: params});
        httpService.get(url).then(function(response){
            offLineList = response.data;
        });
    }
    offlineSchedule()

    if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
        var query = '{_id: ObjectId("'+ $stateParams.id +'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'offlineSchedule', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.data = response.data[0];
            $scope.isreadOnly = true;
        });
    }

    $scope.isUnique = function(name){
        $scope.errMsg = null;
        console.log('offLineList',offLineList);
        var test= _.filter(offLineList, function(item){
            return item.name == name;
        });
        if(test.length >0) $scope.errMsg = 'Name already exits.';
    }

    $scope.save = function(data){
        if($scope.errMsg == null){
            if($stateParams.id && $stateParams.id != ''){
                delete data._id;
                data.action = 2;
                data.updateDate = new Date().getTime();
                var url = dbService.makeUrl({collection: 'offlineSchedule', op:'upsert', id: $stateParams.id});
                httpService.post(url, data).then(function (response){
                    $state.go('index.offlineschedulelist');
                });
            }
            else{
                data.action = 1;
                // data.createDate = new Date().getTime();
                data.updateDate = new Date().getTime();
                data.userId = currentUser.userId;
                var url = dbService.makeUrl({collection: 'offlineSchedule', op:'create'});
                httpService.post(url, data).then(function (response){
                    $state.go('index.offlineschedulelist');
                });
            }
        }
    }
});