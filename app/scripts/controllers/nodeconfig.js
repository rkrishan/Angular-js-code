'use strict';

angular.module('specta')
  .controller('NodeConfigCtrl', function ($scope, $state, $stateParams, globalConfig, SweetAlert, dbService, httpService, currentUser){
    
    $scope.currentUser = currentUser;
    $scope.data = {AutoPlot: 0};
    function loadList(){
        var url = dbService.makeUrl({collection: 'lku_country', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.countryList = res;
            if(res.length == 1)
                $scope.data.Country = res[0].Country;
        });

        var url = dbService.makeUrl({collection: 'lku_city', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.cityList = res;
            if(res.length == 1){
                $scope.data.City = res[0].City;
                $scope.data.Circle = res[0].Circle.toString();
            }
        });

        var url = dbService.makeUrl({collection: 'lku_area', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.areaList = res;
            if(res.length == 1){
                $scope.data.Area = res[0].Area;
            }
        });

        var url = dbService.makeUrl({collection: 'lku_bras', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.brasList = res;
            if(res.length == 1){
                $scope.data.Bras = res[0].Bras;
            }
        });

        var url = dbService.makeUrl({collection: 'lku_node', op:'select'});
        httpService.get(url+'&db=datadb').then(function (res){
            $scope.list = res.data;
            if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) getRecord($stateParams.id);
        });
    }
    loadList();

    function getRecord(id){
        $scope.data = dbService.unique($scope.list, '_id', id)[0]
        $scope.data.AutoPlot = $scope.data.AutoPlot == 1 ? true : false
    }

    $scope.isUnique = function(name){
        name = name.trim();
        $scope.errMsg = null;
        var tmpObj = dbService.unique($scope.list, 'Node', name);
        console.log(tmpObj);
        if(tmpObj.length > 0) $scope.errMsg = 'Node already exits.';
    }

    $scope.changedCity = function(city){
        console.log(city)
        if(city){
            var test = dbService.unique($scope.cityList, 'City', city)[0];
            if(test){
                $scope.data.Circle = test.Circle;
            }
            
        }
    }

    $scope.save = function(tmpdata){
        var data = angular.copy(tmpdata);
        data.AutoPlot = (data.AutoPlot) ? 1 : 0
        if($scope.errMsg == null){
            console.log('data', data);
            if( $stateParams.id && $stateParams.id != '' ){
                data.updateDate = new Date().getTime();
                delete data._id
                var url = dbService.makeUrl({collection: 'lku_node', op:'upsert', id: $stateParams.id});
                httpService.post(url+'&db=datadb', data).then(function (response){
                    // $state.go('index.nodeconfiglist');
                    $scope.cancle();
                });
            }
            else{
                // data.createDate = new Date().getTime();
                // data.userId = currentUser.userId;
                // return;
                var url = dbService.makeUrl({collection: 'lku_node', op:'create'});
                httpService.post(url+'&db=datadb', data).then(function (response){
                    // $state.go('index.nodeconfiglist');
                    $scope.cancle();
                });
            }
        }
    }

    $scope.cancle = function(){
        $state.go('index.systemconfig', {tab: 'node'});
    }
});