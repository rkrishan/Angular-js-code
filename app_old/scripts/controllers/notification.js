

'use strict';

angular.module('specta')
.controller('NotificationCtrl', function ($scope, $rootScope, $timeout, $state, globalConfig, utility, SweetAlert, dbService, httpService, currentUser){
    
    // http://localhost:8080/DataAPI/UIListener?collection=system_alerts&op=create&db=datadb
    function loadList(){
        var url = dbService.makeUrl({collection: 'system_alerts', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.list = res;
        });
    }
    loadList();
    var dtOpt= angular.copy(utility.dataTableOpt);
    dtOpt.order= [ [3, "desc"] ]
    $scope.dtOptions= dtOpt;
     
    var color = globalConfig.alertColorPalette;
    $scope.checkStatus = function(priority, status){
        if(status.toLowerCase() == 'new'){
            // priority = priority.toLowerCase()
            return {color: color[priority], 'font-weight': 'bold'}
        }
    }

    $scope.alertACK = function(index, item){
        var data = angular.copy(item);
        var url = dbService.makeUrl({collection: 'system_alerts', op:'update', id: item._id});
        /*var obj = {
            status: 'ACKNOWLEDGED',
            ackTime : new Date(),
            ackUser : currentUser.userId,
            ackBy : currentUser.firstName
        }*/
        data.status = 'ACKNOWLEDGED';
        data.ackTime = new Date()
        data.ackUser = currentUser.userId;
        data.ackBy = currentUser.firstName;
        delete data._id;
        httpService.post(url+'&db=datadb', data).success(function(res){
            if(res == 'Success'){
                item.status = 'ACKNOWLEDGED';
                item.ackTime = data.ackTime;
                item.ackBy = data.ackBy;
                item.ackTime = data.ackTime;
                $rootScope.$broadcast('refreshAlert', {});
            }
        })
        .error(function(err){
            swal('Something wrong', err, 'error');
        });
    }

    $scope.delete = function(item, index){
        SweetAlert.swal({
            title: "Delete " + item.name,
            text: "Are you sure?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if (isConfirm) {
                insertRecord(item, index)
            }
        });
    }

    function insertRecord(data, index){
        var  item = angular.copy(data);
        item.delUser = currentUser.userId;
        item.delBy = currentUser.firstName;
        item.delTime = new Date();
        delete item._id;
        var url = dbService.makeUrl({collection: 'system_alerts_history', op:'create'});
        httpService.post(url+'&db=datadb', item).success(function (result){
            if(result == 'Success'){
                deleteRecord(data._id, index)
            }
        })
        .error(function(err){
            swal("", err, "error");
        });
    }

    function deleteRecord(id, index){
        var url = dbService.makeUrl({collection: 'system_alerts', op:'delete', id: id});
        httpService.get(url+'&db=datadb').then(function(response){
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