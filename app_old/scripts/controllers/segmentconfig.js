'use strict';

angular.module('specta')
  .controller('SegmentConfigCtrl', function ($scope, $state, $stateParams, globalConfig, SweetAlert, dbService, httpService, currentUser){
    
    $scope.currentUser = currentUser;
    $scope.data = {};
    function loadList(){
        var url = dbService.makeUrl({collection: 'lku_segment', op:'select'});
        httpService.get(url+'&db=datadb').then(function (res){
            $scope.list = res.data;
            if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) $scope.getRecord($stateParams.id);
        });
    }
    loadList();

    $scope.isUnique = function(name){
        name = name.trim()
        $scope.errMsg = null;
        var tmpObj = dbService.unique($scope.list, 'Segment', name);
        console.log(tmpObj);
        if(tmpObj.length > 0) $scope.errMsg = 'Segment already exits.';
    }


    $scope.save = function(tmpdata){
        var data = angular.copy(tmpdata);
        if($scope.errMsg == null){
            console.log('data', data);
            if( $stateParams.id && $stateParams.id != '' ){
                data.updateDate = new Date().getTime();
                var url = dbService.makeUrl({collection: 'lku_segment', op:'upsert', id: $stateParams.id});
                httpService.post(url, data).then(function (response){
                    // $state.go('index.segmentconfiglist');
                    $scope.cancle();
                });
            }
            else{
                // data.createDate = new Date().getTime();
                // data.userId = currentUser.userId;
                // return;
                var url = dbService.makeUrl({collection: 'lku_segment', op:'create'});
                httpService.post(url+'&db=datadb', data).then(function (response){
                    // $state.go('index.segmentconfiglist');
                    $scope.cancle();
                });
            }
        }
    }

    $scope.cancle = function(){
        $state.go('index.systemconfig', {tab: 'segment'});
    }
});