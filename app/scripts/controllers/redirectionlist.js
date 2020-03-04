'use strict';

angular.module('specta')
  .controller('RedirectionCtrl', function ($scope, $location, $state, $timeout, SweetAlert, ChartService, UserProfile, dbService, httpService){
    
    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null)
        $state.go('login');

    ChartService.setCurrentPage(null);
    $scope.userProfile = UserProfile.profileData;
    $scope.list = [];
    
    $scope.loadList = function() {
        var url = dbService.makeUrl({collection: 'redirectionoption', op:'select'});
        httpService.get(url).then(function(response){
            $scope.list = response.data;
        });
    }
    $scope.loadList();

    $scope.addnew = function(){
        $state.go('index.redirection');
    }

    $scope.edit = function(item){
        $state.go('index.redirection', { 'id': item._id });;
    }

    $scope.delete = function(index, item){
        SweetAlert.swal({
            title: "Delete " + item.name,
            text: "Are you sure you want to remove this option?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if (isConfirm) {
                var url = dbService.makeUrl({collection: 'redirectionoption', op:'delete', id:item._id});
                httpService.get(url).then(function(response){
                    if(response.data == 'Success'){
                        var tmp = angular.copy($scope.list);
                        tmp.splice(index, 1);
                        $scope.list = [];
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