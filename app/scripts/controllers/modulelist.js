'use strict';
angular.module('specta')
  .controller('ModuleListCtrl', function ($scope, $rootScope, $uibModal, $timeout, $location, $state, $http, globalConfig, SweetAlert, ChartService, UserProfile, dbService, httpService, currentUser, collection, DTColumnDefBuilder){

    if(currentUser.userType == 'user'){
        $state.go('index.main');
        return;
    }
    $scope.currentUser = currentUser;

    $scope.dtColumnDefs = [
        // DTColumnDefBuilder.newColumnDef(0),
        // DTColumnDefBuilder.newColumnDef(1).notVisible(),
        DTColumnDefBuilder.newColumnDef(-1).notSortable()
    ];

    $scope.moduleList = [];
    $scope.data         = {};
    $scope.dash         = {};
    var selectedTabData = [];

    $scope.loadList = function(){
        $scope.listView   = true;
        $scope.addToView  = false;
        
        //var sort = JSON.stringify([["createdDate", "-1"]]);
        var sort = JSON.stringify({"createdDate": -1});
        var params = 'sort='+ encodeURIComponent(sort);
        
        var url = dbService.makeUrl({collection: 'modules', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.moduleList = response.data;/* _.filter(response.data, function (item) {
                return angular.isDefined(item.title) && item.title != '';
            });*/
            // $scope.loadOption();
        });
    }
    $scope.loadList();

    $scope.addnew = function(){
        $state.go('index.module');
    }

    $scope.cancel = function(){
        $scope.listView   = true;
        $scope.addToView  = false;
    }

    function callPages(collection, params, cb){
        var url = dbService.makeUrl({collection: collection, op:'select', params: params});
        httpService.get(url).then(function(response){
            cb(response.data);
        });
    }

    var key = 0;
    var tmpArr = [];
    function chekcIfmoduleAssignTodashboard(ids, collection, callback){
        if(key == 0) tmpArr = [];

        var fields = JSON.stringify(["name"]);
        var query = '{_id: ObjectId("'+ids[key]+'")}';
        var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);

        callPages(collection, params, function(data){
            console.log(collection, data.length);
            if(data.length == 0){
                if(collection == 'dashboards') chekcIfmoduleAssignTodashboard(ids, 'report', callback);
                else if(collection == 'report') chekcIfmoduleAssignTodashboard(ids, 'staging', callback);
                //else if(collection == 'staging') chekcIfmoduleAssignTodashboard(ids, 'analysis', callback);
                callback([]);
            }
            else{
                if(collection == 'dashboards') var coll = 'Dashboard';
                else if(collection == 'report') var coll = 'Report';
                else if(collection == 'staging') var coll = 'Staging';
                else if(collection == 'analysis') var coll = 'Analysis';

                tmpArr.push({page: coll, name:data[0].name});

                if(key == ids.length-1)
                    callback(tmpArr);
                else{
                    key++;
                    chekcIfmoduleAssignTodashboard(ids, 'dashboards', callback);
                }
            }
        });
    }

    $scope.delete = function(index, item){
        console.log('item', item);
        var txt = '';
        var query = JSON.stringify({ 'components.component._id': item._id });
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'pages', op:'select', params: params});
        httpService.get(url).then(function(res){
            var ids = $.map(res.data, function(value){
                return value.dashboardId;
            });
            console.log(ids);
            collection.createdUser(item.userId, function(user){
                var createdBy = 'Created by: '+user.name;

                if(ids.length > 0){
                    chekcIfmoduleAssignTodashboard(ids, 'dashboards', function(response){
                        var title = response.join(',');
                        if(response.length > 0) txt += 'Also deleted from <br>';
                        for(var key in response){
                            txt += '<h4>'+response[key]['page']+ ':' + response[key]['name'] +'</h4>';
                        }
                        
                        SweetAlert.swal({
                            title: "Would you like to delete Module : " + item.title,
                            text: txt != '' ? txt +''+ createdBy : '',
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, delete it!",
                            cancelButtonText: "No, cancel!",
                            closeOnConfirm: true,
                            closeOnCancel: true,
                            html: true
                        },
                        function (isConfirm) {
                            if(isConfirm){
                                _.forEach(res.data, function(val){
                                    var spliceKey = '';
                                    _.forEach(val.components, function(value, k){
                                        if(value.component._id == item._id){
                                            spliceKey = k;
                                            return false;
                                        }
                                    });
                                    val.components.splice(spliceKey, 1);
                                    var tmpMain = angular.copy(val);
                                    delete tmpMain._id;
                                    console.log('tmpMain', tmpMain);

                                    var url = dbService.makeUrl({collection: 'pages', op:'upsert', id: val._id});
                                    httpService.post(url, tmpMain).then(function(response){});
                                });
                                deleteModule(item, index);
                            }
                        });
                    });
                }
                else{
                    SweetAlert.swal({
                        title: "Would you like to delete Module : " + item.title,
                        text: createdBy,
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        if(isConfirm){
                            deleteModule(item, index);
                        }
                    });
                }
            });
        });
    }

    function deleteModule(item, index){
        var url = dbService.makeUrl({collection: 'modules', op:'delete', id:item._id});
        httpService.get(url).then(function(response){
            if(response.data == 'Success'){
                var tmp = angular.copy($scope.moduleList);
                tmp.splice(index, 1);
                $scope.moduleList = [];
                $timeout(function(){
                    $scope.moduleList = tmp;
                }, 10);
            }
            else
                swal("", "Error in deleting!", "error");
        });
    }

    $scope.addto = function(item){
        $scope.addToView      = true;
        $scope.listView       = false;
        $scope.selectedModule = item;
        $scope.dashboardList  = [];
        $scope.tabList        = '';
        $scope.boxList        = '';
        $scope.data.type      = '';
        $scope.positionShow   = false;
    }

    $scope.changeAssigningType = function(tableName){
        $scope.dashboardList    = [];
        $scope.data.dashboardId = '';
        $scope.boxList          = '';
        $scope.positionShow = false;

        if(tableName == 'dashboards')
            $scope.dashboardList = UserProfile.getSession('staticDynamicDash');
        else if(tableName == 'report')
            $scope.dashboardList = UserProfile.getSession('reportList');
        else if(tableName == 'analysis')
            $scope.dashboardList = UserProfile.getSession('analyticsList');
        else
            $scope.dashboardList = UserProfile.getSession('stagingList');

        /*var query = JSON.stringify({ 'type':'dynamic' });
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: tableName, op:'select', params: params});
        httpService.get(url).then(function(response){
            _.forEach(response.data, function(item, key){
                $scope.dashboardList.push(item);
            });
        });*/
    }

    $scope.changedashboard = function(dashboardId){
        $scope.boxList = '';
        $scope.positionShow = true;
        if( dashboardId ){
            var query = JSON.stringify({ 'dashboardId': dashboardId });
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'pages', op:'select', params: params});
            httpService.get(url).then(function(res){
                selectedTabData = res.data;
                if(res.data.length > 0){
                    selectedTabData = res.data[0];
                    var alreadyExitsChart;
                    _.forEach(selectedTabData.components, function (item, key){
                        console.log(item)
                        if(item.component._id == $scope.selectedModule._id){
                            alreadyExitsChart = true;
                        }
                        else{
                            var title = dbService.unique($scope.moduleList, '_id', item.component._id)[0]
                            if(title)
                                item.component.title = title.title
                            /*var query = '{_id: ObjectId("'+item.component._id+'")}';
                            var params = 'query=' + encodeURIComponent(query);
                            var url = dbService.makeUrl({collection: 'modules', op:'select', params: params});
                            httpService.get(url).success(function (res){
                                
                            })*/
                        }
                    })

                    if(alreadyExitsChart){
                        SweetAlert.swal("Error!", "Component already exists in the page. You can not add same component again.", 'error');
                        $scope.data.dashboardId = '';
                        $scope.positionShow = false;
                    }
                    else{
                        $scope.boxList = selectedTabData.components;
                    }
                }
            })
        }
        else
            $scope.positionShow = false;
    }

    $scope.tab = function(tabId){
        $scope.boxList         = '';
        $scope.data.positionId = '';
        $scope.data.size       = '';

        if(tabId){
            var alreadyExitsChart;
            _.forEach($scope.tabList, function (item, key){
                if(item._id == tabId){
                    _.forEach(item.components, function (value, k){
                        if($scope.selectedModule._id == value.component._id)
                            alreadyExitsChart = true;
                    })

                    if(alreadyExitsChart){
                        SweetAlert.swal("Error!", "Component already exists in the page. You can not add same component again.");
                        $scope.data.tabId = '';
                    }else{
                        selectedTabData = item;
                        $scope.boxList = selectedTabData.components;
                    }
                }
            })
        }
    }

    //Save chart to dashboard
    $scope.save = function (data){
        SweetAlert.swal({
            title: "",
            text: "Do you want to add module " + angular.uppercase($scope.selectedModule.title) + " on current page?",
            type: "info",
            confirmButtonColor: "#DD6B55",
            showCancelButton: true,
            confirmButtonText: "Ok",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if (isConfirm){
                var arg       = { component:  $scope.selectedModule, componentType: $scope.selectedModule.type };
                arg.component.width = $scope.data.size;
                var component = []
                var setTop    = true
                if($scope.boxList.length > 0){
                    _.forEach($scope.boxList, function (value, key){
                        var tmpCom = angular.copy(value);
                        // tmpCom.component = {_id:value.component._id, width: value.component.width}
                        if( (!$scope.data.positionId) && (setTop == true)){
                            component.push(arg)
                            component.push(tmpCom)
                            setTop = false
                        }
                        else if($scope.data.positionId == value.component._id){
                            component.push(tmpCom)
                            component.push(arg)
                        }
                        else
                            component.push(tmpCom)
                    })
                }
                else
                    component.push(arg)

                console.log(selectedTabData);
                if( angular.isDefined(selectedTabData.components) ){
                    selectedTabData.components = component;
                    var request = JSON.stringify(selectedTabData);
                    var tmp = JSON.parse(request);
                    delete tmp["_id"];
                    delete tmp["active"];

                    var url = dbService.makeUrl({collection: 'pages', op:'upsert', id: selectedTabData._id});
                    httpService.post(url, tmp).then(function(response){
                        console.log('already', response);
                        if(response.statusText == 'OK')
                            showSuccess();
                        else
                            SweetAlert.swal("Error!", "Error in adding component. Please try again.");
                    })
                }
                else{
                    //selectedTabData.push({'components' : component, 'dashboardId': data.dashboardId});
                    var tmp = {'components' : component, 'dashboardId': data.dashboardId};
                    var url = dbService.makeUrl({collection: 'pages', op:'create'});
                    httpService.post(url, tmp).then(function(response){
                    //$http.post($scope.apiURL + '/pages', selectedTabData).then(function (response) {
                        console.log(response, response.statusText);
                        if(response.statusText == 'OK')
                            showSuccess();
                        else
                            SweetAlert.swal("Error!", "Error in adding component. Please try again.");
                    })
                }
            }
        });
    }

    function showSuccess(){
        //console.log('showSuccess');
        /*SweetAlert.swal({
            title: "Component added",
            text: 'Component added successfuly.',
            type: "success",
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Ok",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if(isConfirm)
                $scope.loadList();
        });*/

        $scope.cancel();
        // SweetAlert.swal("Success!", "Component added successfuly.", "success");
        //$scope.loadList();
    }

    $scope.loadOption = function(){
        $scope.dtOPtions = {
            paging : true,
            searching : true,
            "bLengthChange" : true,
            "bSort" : true,
            "bInfo" : true,
            "bAutoWidth" : true,
            "order": [ [0, "desc"],  [0, "desc"]]
        }
    }
    $scope.loadOption()

    $scope.detail = function (item){
        globalConfig.module = item;
        $scope.module = item;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/moduleDetail.html',
            size: 'lg',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        })
    }
})