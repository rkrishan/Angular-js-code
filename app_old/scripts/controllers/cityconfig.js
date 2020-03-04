'use strict';

angular.module('specta')
  .controller('CityConfigCtrl', function ($scope, $state, $stateParams, globalConfig, SweetAlert, dbService, httpService, currentUser){
    
    $scope.currentUser = currentUser;
    $scope.data = {};
    function loadList(){
        var url = dbService.makeUrl({collection: 'lku_country', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.countryList = res;
            if(res.length == 1)
                $scope.data.Country = res[0].Country;
        });

        var url = dbService.makeUrl({collection: 'lku_city', op:'select'});
        httpService.get(url+'&db=datadb').then(function (res){
            $scope.list = res.data;
        });
    }
    loadList();

    $scope.isUnique = function(name){
        if(!name) return;
        name = name.trim();
        $scope.errMsg = null;
        var tmpObj = dbService.unique($scope.list, 'City', name);
        console.log(tmpObj);
        if(tmpObj.length > 0) $scope.errMsg = 'City already exits.';
    }


    $scope.save = function(tmpdata){
        var data = angular.copy(tmpdata);
        if($scope.errMsg == null){
            console.log('data', data);
            if( $stateParams.id && $stateParams.id != '' ){
                data.updateDate = new Date().getTime();
                var url = dbService.makeUrl({collection: 'lku_city', op: 'upsert', id: $stateParams.id});
                httpService.post(url, data).then(function (response){
                    // $state.go('index.areaconfiglist');
                    $scope.cancle();
                });
            }
            else{
                // data.createDate = new Date().getTime();
                // data.userId = currentUser.userId;
                // return;
                var url = dbService.makeUrl({collection: 'lku_city', op:'create'});
                httpService.post(url+'&db=datadb', data).then(function (response){
                    $scope.cancle();
                });
            }
        }
    }

    $scope.cancle = function(){
        $state.go('index.systemconfig', {tab: 'city'});
    }
});