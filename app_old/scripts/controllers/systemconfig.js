'use strict';

angular.module('specta')
.controller('SystemConfigCtrl', function ($scope, $state, $stateParams, $timeout, globalConfig, globalData, SweetAlert, dbService, httpService, currentUser){

    $scope.userProfile = currentUser

    console.log('currentUser', currentUser)

    if($stateParams.tab){
        $scope.active = {lenv: false, plan: false, segment: false, dns: false, city: false, area: false, bras: false, node: false}
        $scope.active[$stateParams.tab] = true;
    }
    
    /*
    *   Local Environment
    */
    $scope.timeZoneList = globalData.timeZone;
    $scope.countryList = globalData.countryLookUpObj;
    function loadDescList(){
        var url = dbService.makeUrl({collection: 'lku_node_desc_list', op:'select'});
        httpService.get(url).success(function (res){
            if(res.length > 0)
            $scope.nodedescList = res[0].nodes;
            loadList()
        })
    }
    if(currentUser.userType == 'system administrator'){
        loadDescList()
    }

    function loadList(){
        var url = dbService.makeUrl({collection: 'system_config', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            // console.log(res);
            if(res.length > 0){
                $scope.env = res[0];
                $scope.env.defdecimal = $scope.env.defdecimal.toString();
                $scope.env.tzoffset = JSON.stringify($scope.env.tzoffset);
                $scope.env.nodedesc = $scope.env.nodedesc.trim();
                $scope.env.country = $scope.env.country.trim();
                console.log($scope.env)
            }
        });
    }

    $scope.updateEnv = function(data){
        var obj = angular.copy(data);
        obj.circleid   = Number(obj.circleid);
        obj.defdecimal = Number(obj.defdecimal);
        obj.tzoffset   = JSON.parse(obj.tzoffset);
        obj.nodedesc = obj.nodedesc.trim();
        obj.country = obj.country.trim();
        delete obj._id;
        console.log(obj);
        // return;
        var url = dbService.makeUrl({collection: 'system_config', op:'upsert', id:data._id});
        httpService.post(url+'&db=datadb', obj).success(function (res){
            console.log(res);
            if(res == 'Success')
                swal('', 'Successfully update', 'success');
        });
    }

    /*
    *   Plan Config
    */
    function loadPlanList(){
        var filter = {db:'datadb'}
        var url = dbService.makeUrl({collection: 'lku_plan', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.listPlan= res;
        });
    }
    loadPlanList();

    $scope.deletePlan = function(item, index){
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
                var url = dbService.makeUrl({collection: 'lku_plan', op:'delete', id:item._id});
                httpService.get(url+'&db=datadb').success(function(response){
                    if(response == 'Success'){
                        var tmp = angular.copy($scope.listPlan);
                        tmp.splice(index, 1);
                        $scope.listPlan = [];
                        $timeout(function(){
                            $scope.listPlan = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    /*
    *   Node Config
    */
    function loadNodeList(){
        var url = dbService.makeUrl({collection: 'lku_node', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.nodelist = res;
        });
    }
    loadNodeList();

    $scope.checkAutoPlot = function(item){
        console.log(item);
        var data = angular.copy(item);
        data.AutoPlot = (data.AutoPlot) ? 1 : 0
        data.updateDate = new Date().getTime();
        delete data._id

        var url = dbService.makeUrl({collection: 'lku_node', op:'upsert', id: item._id});
        httpService.post(url+'&db=datadb', data).success(function(res){})
    }

    $scope.deleteNode = function(item, index){
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
        function (isConfirm){
            if (isConfirm){
                var url = dbService.makeUrl({collection: 'lku_node', op:'delete', id:item._id})
                httpService.get(url+'&db=datadb').success(function(response){
                    if(response == 'Success'){
                        var tmp = angular.copy($scope.nodelist);
                        tmp.splice(index, 1)
                        $scope.nodelist = []
                        $timeout(function(){
                            $scope.nodelist = tmp;
                        }, 10)
                    }
                    else
                        swal("", "Error in deleting!", "error")
                })
            }
        })
    }

    /*
    *   Segment Config
    */
    function loadSegmentList(){
        var url = dbService.makeUrl({collection: 'lku_segment', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.segmentlist = res;
        });
    }
    loadSegmentList();

    $scope.deleteSegment = function(item, index){
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
                var url = dbService.makeUrl({collection: 'lku_segment', op:'delete', id:item._id});
                httpService.get(url+'&db=datadb').success(function(response){
                    if(response == 'Success'){
                        var tmp = angular.copy($scope.segmentlist);
                        tmp.splice(index, 1);
                        $scope.segmentlist = [];
                        $timeout(function(){
                            $scope.segmentlist = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    /*
    *   DNS Config
    */
    function loadDNSList(){
        var url = dbService.makeUrl({collection: 'lku_dns_ip_list', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.dnslist = res;
        });
    }
    loadDNSList();

    $scope.deleteDNS = function(item, index){
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
                var url = dbService.makeUrl({collection: 'lku_dns_ip_list', op:'delete', id:item._id});
                httpService.get(url+'&db=datadb').success(function(response){
                    if(response == 'Success'){
                        var tmp = angular.copy($scope.dnslist);
                        tmp.splice(index, 1);
                        $scope.dnslist = [];
                        $timeout(function(){
                            $scope.dnslist = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    /*
    *   Area Config
    */
    function loadAreaList(){
        var url = dbService.makeUrl({collection: 'lku_area', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.arealist = res;
        });
    }
    loadAreaList();

    $scope.deleteArea = function(item, index){
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
                var url = dbService.makeUrl({collection: 'lku_area', op:'delete', id:item._id});
                httpService.get(url+'&db=datadb').success(function(response){
                    if(response == 'Success'){
                        var tmp = angular.copy($scope.arealist);
                        tmp.splice(index, 1);
                        $scope.arealist = [];
                        $timeout(function(){
                            $scope.arealist = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    /*
    *   Bras Config
    */
    function loadBrasList(){
        var url = dbService.makeUrl({collection: 'lku_bras', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.braslist = res;
        });
    }
    loadBrasList();

    $scope.deleteBras = function(item, index){
        SweetAlert.swal({
            title: "Delete " + item.Bras,
            text: "Are you sure?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if (isConfirm){
                var url = dbService.makeUrl({collection: 'lku_bras', op:'delete', id:item._id});
                httpService.get(url+'&db=datadb').success(function(response){
                    if(response == 'Success'){
                        var tmp = angular.copy($scope.braslist);
                        tmp.splice(index, 1);
                        $scope.braslist = [];
                        $timeout(function(){
                            $scope.braslist = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    /*
    *   City Config
    */
    function loadCityList(){
        var url = dbService.makeUrl({collection: 'lku_city', op:'select'});
        httpService.get(url+'&db=datadb').success(function (res){
            $scope.citylist = res;
        });
    }
    loadCityList();

    $scope.deleteCity = function(item, index){
        SweetAlert.swal({
            title: "Delete " + item.City,
            text: "Are you sure?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if (isConfirm){
                var url = dbService.makeUrl({collection: 'lku_city', op:'delete', id:item._id});
                httpService.get(url+'&db=datadb').success(function(response){
                    if(response == 'Success'){
                        var tmp = angular.copy($scope.citylist);
                        tmp.splice(index, 1);
                        $scope.citylist = [];
                        $timeout(function(){
                            $scope.citylist = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

});