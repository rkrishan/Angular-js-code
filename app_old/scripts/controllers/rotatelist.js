'use strict';

angular.module('specta')
  .controller('RotateListCtrl', function ($scope, $rootScope, $timeout, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile) {
    
    $scope.userProfile = UserProfile.profileData;
    $scope.apiURL = globalConfig.dataapiurl;
    if (!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null) {
        $location.path('/login');
    }

    $scope.loadList = function(){
        $http.get($scope.apiURL+ '/dashboards').then(function(response){
            $scope.list = response.data;
            console.log(response);

        });
    }
    $scope.loadList();
    $scope.goto = function(item){
    	$state.go('index.'+item);
    }

    $scope.multiCheck = function(id){
        var idx = $scope.confirmArr.indexOf(id);
        if(idx > -1)
            $scope.confirmArr.splice(idx, 1);
        else
            $scope.confirmArr.push(id);
        
        //console.log($scope.confirmArr);
        if($scope.confirmArr.length > 0)
            $scope.cnfrmBtn = false;
        // else
        //     $scope.cnfrmBtn = true;
    }
});
