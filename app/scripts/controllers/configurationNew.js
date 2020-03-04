'use strict';

angular.module('specta')
  .controller('configurationNewCtrl', function ($scope, $timeout, $stateParams, $state, SweetAlert, UserProfile, dbService, httpService){
    
    $scope.userProfile = UserProfile.profileData;

    $scope.updatedkey=null;
    $scope.item = {};
    $scope.key = {name: '', value: ''};
    $scope.isdelete=false;
    $scope.hasColumn=false;
    $scope.isupdate=false;
    
    $scope.cancel = function (){
        $state.go('index.configurationlist');    
    }
    
    $scope.enableedit = function(){
        if($scope.item != "")
            $scope.isupdate=true;
    }
    
    $scope.deletekey = function(key){
        SweetAlert.swal({
            title: "Delete " + key,
            text: "Are you sure you want to remove this key?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if(isConfirm){
                delete $scope.item[key];
            }
        });
    }

    $scope.addkeywithvalue = function(){
        if( angular.isDefined($scope.item[$scope.key.name]) ){
            SweetAlert.swal({
                title: "Key Already Exits",
                text: "Are you sure you want to replace this key value?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                cancelButtonText: "No, cancel",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function(isConfirm){
                if(isConfirm){
                    $scope.item[$scope.key.name] = $scope.key.value;
                }
            });
            return false;
        }
        else
            $scope.item[$scope.key.name] = $scope.key.value;

        $scope.key.name = '';
        $scope.key.value = '';
        $scope.hasColumn = true;
    }
    
    $scope.updatekeyvalue = function(keyforupdate,value){
        $scope.item[keyforupdate]=value;
    }

    if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
        $scope.pagetitle = "Edit Configuration";
        var query = '{_id: ObjectId("'+ $stateParams.id +'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'systemConfiguration', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.item = response.data[0].item;
            $scope.title = response.data[0].title;
            $scope.hasColumn=true; 
        });
    }
    else
        $scope.pagetitle="Add Configuration";

    $scope.save = function(){
        var req = {item:$scope.item, title: $scope.title};
        if( angular.isDefined($stateParams.id) && $stateParams.id.length > 0 ){
            var url = dbService.makeUrl({collection: 'systemConfiguration', op: 'upsert', id: $stateParams.id});
            httpService.post(url, req).then(function (response) {
                $state.go('index.configurationlist');
            });
        }
        else{
            req.userId = $scope.userProfile.userId;
            req.createDate = new Date();
            var url = dbService.makeUrl({collection: 'systemConfiguration', op: 'create'});
            httpService.post(url, req).then(function (response){
                $state.go('index.configurationlist');
            });
        }
    }
});