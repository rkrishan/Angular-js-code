'use strict';

angular.module('specta')
  .controller('ConfigurationListCtrl', function ($scope, $location, $timeout, $state, SweetAlert, ChartService, UserProfile, dbService, httpService){
    
    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null)
        $state.go('login');

    ChartService.setCurrentPage(null);
    $scope.userProfile = UserProfile.profileData;
    
    $scope.loadList = function() {
        $scope.list = [];
        var fields = JSON.stringify(['title', 'createDate']);
        var params = 'fields=' + encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'systemConfiguration', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.list = response.data;
        });
    }
    $scope.loadList();

    $scope.addnew = function () {
        $state.go('index.configuration');
    }

    $scope.edit = function (item) {
        $state.go('index.configuration', { 'id': item._id });
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
        function (isConfirm) {
            if (isConfirm){
                var url = dbService.makeUrl({collection: 'systemConfiguration', op:'delete', id:item._id});
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

                /*var tmp = angular.copy($scope.list);
                tmp.splice(index, 1);
                $scope.list = '';
                $timeout(function(){
                    $scope.list = tmp;
                }, 10);
                $http.delete($scope.apiURL + '/' + item._id).then(function (response) {
                });*/
            }
        });
    }

    $scope.dtOPtions = {
        "bAutoWidth": true,
        "order": [ [0, "desc"] ]
    };
});