'use strict';

angular.module('specta')
.controller('AppConfiglistCtrl', function ($scope, $state, $timeout, globalConfig, SweetAlert, dbService, httpService){

    
    function loadList(){
        var url = dbService.makeUrl({collection: 'lku_url_app', op:'select'});
        httpService.get(url).then(function (res){
            $scope.list = res.data;
        });
    }
    loadList();

    function segmentList(){
        var url = dbService.makeUrl({collection: 'lku_appsegment', op:'select'});
        httpService.get(url).then(function (res){
            $scope.segmentList = {};
            for(var i in res.data){
                $scope.segmentList[res.data[i].appsegmentid] = res.data[i].appsegment;
            }
        });
    }
    segmentList();

    $scope.delete = function(item, index){
        SweetAlert.swal({
            title: "Delete " + item.app,
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
                //var url = dbService.makeUrl({collection: 'lku_app', op:'create'});
                var url = dbService.makeUrl({collection: 'lku_url_app', op:'delete', id:item._id});
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
    }
});