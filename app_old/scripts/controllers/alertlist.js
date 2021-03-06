'use strict';

angular.module('specta')
  .controller('AlertlistCtrl', function ($scope, $location, $timeout, $http, $state, globalConfig, SweetAlert, UserProfile, ChartService, httpService, dbService) {
    
    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null)
        $state.go('login');

    ChartService.setCurrentPage(null);
    $scope.userProfile = UserProfile.profileData;
    
    $scope.loadList = function() {
        $scope.list = [];
        var fields = JSON.stringify(['name', 'createDate', 'criteria', 'userId']);
        var params = 'fields=' + encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'alertConfiguration', op:'select', params: params});
        console.log(url);
        httpService.get(url).then(function(response){
            $scope.list = response.data;
        });
    }
    $scope.loadList();

    $scope.addnew = function () {
        $state.go('index.alert');
    }

    $scope.edit = function (item) {
        $state.go('index.alert', {'id': item._id });
    }

    $scope.delete = function (item, index) {
        SweetAlert.swal({
            title: "Delete " +  item.name,
            text: "Are you sure you want to remove this configuration?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if (isConfirm){
                var url = dbService.makeUrl({collection: 'alertConfiguration', op:'delete', id: item._id});
                httpService.post(url).then(function(response){
                    if(response.data == 'Success'){
                        var tmp = angular.copy($scope.list);
                        tmp.splice(index, 1);
                        $scope.list = '';
                        $timeout(function(){
                            $scope.list = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    $scope.dtOPtions = {
        "bAutoWidth": true,
        "order": [ [0, "desc"] ]
    };
});