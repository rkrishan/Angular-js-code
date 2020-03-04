'use strict';

angular.module('specta')
  .controller('ChartOptionsListCtrl', function ($scope, $location, $timeout, $state, SweetAlert, ChartService, UserProfile, httpService, dbService){
    
    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null)
        $state.go('login');

    ChartService.setCurrentPage(null);
    $scope.userProfile = UserProfile.profileData;
    $scope.list = $scope.pullStatementLists = [];
    
    $scope.loadList = function() {
        var fields = JSON.stringify(['name', 'libType', 'chartType', 'createDate', 'nameSpace']);
        var params = 'fields='+ encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'chartoptions', op:'select', params:params});
        httpService.get(url).then(function(response){
            $scope.list = response.data;
        });
    }
    $scope.loadList();

    $scope.addnew = function () {
        $state.go('index.chartoption');
    }

    $scope.edit = function (item) {
        $state.go('index.chartoption', { 'id': item._id });;
    }

    $scope.delete = function (item, index) {
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
                var url = dbService.makeUrl({collection: 'chartoptions', op:'delete', id:item._id});
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