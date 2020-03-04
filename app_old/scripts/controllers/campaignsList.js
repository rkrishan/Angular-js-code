'use strict';

angular.module('specta')
.controller('CampaignsListCtrl', function ($scope, $state, $timeout, globalConfig, SweetAlert, dbService, httpService){

    $scope.campaignrules = {}
    function segmentList(){
        var url = dbService.makeUrl({collection: 'campaignrules', op:'select'})
        httpService.get(url).success(function (res){
            for(var i in res){
                $scope.campaignrules[res[i]._id] = res[i].name
            }
            loadList()
        })
    }
    segmentList()

    function loadList(){
        var url = dbService.makeUrl({collection: 'campaigns', op:'select'})
        httpService.get(url).success(function (res){
            $scope.list = res
        })
    }

    $scope.delete = function(item, index){
        SweetAlert.swal({
            title: "Delete " + item.name,
            text: "You want to delete this record?",
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
                var url = dbService.makeUrl({collection: 'campaigns', op:'delete', id:item._id})
                httpService.get(url).then(function(response){
                    if(response.data == 'Success'){
                        var tmp = angular.copy($scope.list)
                        tmp.splice(index, 1)
                        $scope.list = []
                        $timeout(function(){
                            $scope.list = tmp
                        }, 10)
                    }
                    else
                        swal("", "Error in deleting!", "error")
                })
            }
        })
    }
})