'use strict';

angular.module('specta')
  .controller('ChartOptionNewCtrl', function ($scope, $timeout, $stateParams, $location, $state, SweetAlert, ChartService, UserProfile, httpService, dbService){

    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null){
        $state.go('login');
        return;
    }

    $scope.userProfile = UserProfile.profileData;
    ChartService.setCurrentPage(null);
    $scope.item = { 'name': '', 'chartType': '', 'libType': '', 'options': '' };

    if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
        var query = '{_id: ObjectId("'+ $stateParams.id +'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'chartoptions', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.item = response.data[0];
        });
    }

    $scope.cancel = function (){
        $state.go('index.chartoptionslist');
    }
    
    $scope.save = function(){
        var req = $scope.item;
        if(angular.isDefined($stateParams.id) && $stateParams.id != ''){
            delete req['_id'];
            var url = dbService.makeUrl({collection: 'chartoptions', op:'upsert', id: $stateParams.id});
            httpService.post(url, req).then(function(response){
                $state.go('index.chartoptionslist');
            });
        }
        else{
            req.userId = $scope.userProfile.userId;
            req.createDate = new Date();
            var url = dbService.makeUrl({collection: 'chartoptions', op:'create'});
            httpService.post(url, req).then(function(response){
                $state.go('index.chartoptionslist');
            });
        }
    }
});