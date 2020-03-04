'use strict';

angular.module('specta')
  .controller('SchedulelistCtrl', function ($scope, $location, $timeout, $http, $state, $uibModal, globalConfig, SweetAlert, UserProfile, ChartService, httpService, dbService) {
    
    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null)
        $state.go('login');

    ChartService.setCurrentPage(null);
    $scope.userProfile = UserProfile.profileData;
    
    $scope.loadList = function() {
        $scope.list = [];
        var fields = JSON.stringify(['createDate', 'name', 'frequency', 'email']);
        var params = 'fields=' + encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'reportschedule', op:'select'});
        httpService.get(url).then(function(response){
            $scope.list = response.data;
        });
    }
    $scope.loadList();

    $scope.addnew = function (){
        $state.go('index.schedule');
    }

    $scope.edit = function (item) {
        $state.go('index.schedule', {'id': item._id });
    }

    $scope.delete = function (item, index) {
        SweetAlert.swal({
            title: "Delete " +  item.name,
            text: "Are you sure you want to remove this Schedule?",
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
                var url = dbService.makeUrl({collection: 'reportschedule', op:'delete', id: item._id});
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

    $scope.detail = function (item){
        console.log(item);
        var fields = JSON.stringify(["name"]);
        var query = JSON.stringify({"statementId": item.statementId});
        var params = 'query='+encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(response){
            console.log('statements', response.data);
            if(response.data.length == 0 || response.data == 'null') swal('Error', 'Statement not found', 'error');
            else{
                item.report = response.data[0].name;
                globalConfig.reportschedule = angular.copy(item);
                var modalInstance = $uibModal.open({
                    templateUrl: 'views/moduleReportSchedule.html',
                    size: 'md',
                    controller: ModalInstanceCtrl,
                    windowClass: "animated fadeIn"
                });
            }
        });
    };

    function ModalInstanceCtrl($scope, $uibModalInstance, globalConfig){
        console.log(globalConfig.reportschedule);
        $scope.item = globalConfig.reportschedule;

        $scope.cancel = function(){
            delete globalConfig.reportschedule;
            $uibModalInstance.dismiss('cancel');
        };
    }

    $scope.dtOPtions = {
        "bAutoWidth": true,
        "order": [ [0, "desc"] ]
    };
});