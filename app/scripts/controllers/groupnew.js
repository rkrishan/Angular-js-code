'use strict';

angular.module('specta')
  .controller('GroupNewCtrl', function ($scope, $state, $stateParams, SweetAlert, UserProfile, dbService, httpService, currentUser){

    $scope.submitted = false;
    var isgroup=false;
    if(!currentUser.userId || currentUser.userId == null){
        $state.go('login');
        return false;
    }
    $scope.group  = { 'title': '', export: null};

    var grpNameArr;
    var url = dbService.makeUrl({collection: 'groupName', op:'select'});
    httpService.get(url).then(function(response){
        console.log(response);
        grpNameArr = response.data;
    });
    
    if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0){
        var query = '{_id: ObjectId("'+ $stateParams.id +'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'groupName', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.group = response.data[0];
        });
    }

    $scope.checkuser = function(title){
        $scope.error = null
        if(!title) return
        var tmp = grpNameArr.filter(function(item){
            if($stateParams.id.length > 0 ){
                return item.title == $scope.group.title && item._id != $stateParams.id;
            }
            return item.title == $scope.group.title;
        })
        console.log("tmp",tmp);
        if(tmp.length > 0){
            $scope.error = 'Group Title Already Exits'
            isgroup=true;
        }else
          isgroup=false;
    }

    $scope.cancel = function () {
        $state.go('index.grouplist');
    }

    $scope.save = function($valid) {
        if($valid && isgroup == false){
            if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
                var request = { 'title' : $scope.group.title, export: $scope.group.export };
                var url = dbService.makeUrl({collection: 'groupName', op:'upsert', id: $stateParams.id});
                httpService.post(url, request).then(function (response){
                    $state.go('index.grouplist');
                });
            }
            else{
                $scope.group.userId = currentUser.userId;
                var url = dbService.makeUrl({collection: 'groupName', op:'create'});
                httpService.post(url, $scope.group).then(function (response){
                    $state.go('index.grouplist');
                });
            }
        }
        else{
            $scope.submitted = true;
        }
    }
    $scope.hasError = function (field, validation) {
        if (validation && angular.isDefined($scope.myForm)) {
            var tmp = ($scope.myForm[field].$dirty && $scope.myForm[field].$error[validation]) || ($scope.submitted && $scope.myForm[field].$error[validation]);
            return tmp;
        }
        return ($scope.myForm[field].$dirty && $scope.myForm[field].$invalid) || ($scope.submitted && $scope.myForm[field].$invalid);
    };
});
