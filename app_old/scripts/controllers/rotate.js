'use strict';

angular.module('specta')
  .controller('RotateCtrl', function ($scope, $timeout, $http, globalConfig, $state, SweetAlert, UserProfile){
    
    $scope.userProfile = UserProfile.profileData;
    $scope.apiURL = globalConfig.dataapiurl;
    if (!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null) {
        $state.go('/login');
        return
    }

    $scope.loadList = function(){
        $http.get($scope.apiURL+ 'dashboards').then(function(response){
            $scope.list = response.data;
            console.log(response.data);

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
