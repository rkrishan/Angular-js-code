'use strict';

angular.module('specta')
  .controller('RedirectionNewCtrl', function ($scope, $timeout, $stateParams, $location, $state, SweetAlert, ChartService, UserProfile, dbService, httpService){

    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null){
        $state.go('login');
        return;
    }

    $scope.userProfile = UserProfile.profileData;
    $scope.item = { 'name': '' ,'page': ''};
    
    if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
        var query = '{_id: ObjectId("'+ $stateParams.id +'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'redirectionoption', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.item = response.data[0];
        });
    }

    $scope.cancel = function (){
        $state.go('index.redirectionlist');
    }

    $scope.save = function(){
        var req = $scope.item;

        if(angular.isDefined($stateParams.id) && $stateParams.id.length != ''){
            delete req['_id'];
            var url = dbService.makeUrl({collection: 'redirectionoption', op:'upsert', id: $stateParams.id});
            httpService.post(url, req).then(function (response) {
                $state.go('index.redirectionlist');
            });
        }
        else{
            req.userId = $scope.userProfile.userId;
            req.createDate = new Date();
            var url = dbService.makeUrl({collection: 'redirectionoption', op:'create'});
            httpService.post(url, req).then(function (response){
                $state.go('index.redirectionlist');
            });
        }
    }
});