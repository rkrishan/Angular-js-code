'use strict';

angular.module('specta')
  .controller('DashboardNewCtrl', function ($scope, $state, $stateParams, UserProfile, dbService, httpService, ChartService){
    
    $scope.userProfile = UserProfile.profileData;
    $scope.newDashboard = { 'name': '', 'description': '', 'type': '', 'serialno': '' };

    if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
        httpService.get(url).then(function(response){
            if(response.data.length > 0)
                $scope.newDashboard = response.data[0];
        });
    }

    $scope.cancelDashboard = function(){
        $state.go('index.dashboardlist');
    }

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

    $scope.saveDashboard = function(data){
        data.serialno = parseInt(data.serialno);
        if(angular.isDefined($scope.newDashboard._id)){
            delete data._id;
            var url = dbService.makeUrl({collection: 'dashboards', op:'upsert', id: $stateParams.id});
            httpService.post(url, data).then(function(response){
                if(response.data == 'Success')
                    ChartService.refreshDashboard();

                $state.go('index.dashboardlist');
            });
        }
        else{
            data.userId = $scope.userProfile.userId;
            var url = dbService.makeUrl({collection: 'dashboards', op:'create'});
            httpService.post(url, data).then(function(response){
                ChartService.refreshDashboard();
                $state.go('index.dashboardlist');
            });
        }
    }
});