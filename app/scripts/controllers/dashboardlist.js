'use strict';

angular.module('specta')
  .controller('DashboardListCtrl', function ($scope, $rootScope, $timeout, $state, SweetAlert, ChartService, UserProfile, dbService, httpService, collection, currentUser){

    $scope.userProfile = currentUser;
    $scope.isArray = angular.isArray;
    $scope.loadList = function(){
        ChartService.refreshDashboard();
        $scope.heading    = 'Dashboard';
        $scope.mainView   = true;
        $scope.assignList = false;

        $scope.dashboardList = [];
        if($scope.userProfile.userType == 'user' || $scope.userProfile.userType == 'circle user'|| $scope.userProfile.userType == 'corporate user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var sort = JSON.stringify({"serialno": 1});
            var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
            httpService.get(url).then(function(response){
                // $scope.allDashboardList = response.data;
                _.forEach(response.data, function (item, key) {
                    dashList.push(item);
                });
            });

            //get assigned group dashboard list
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'groupUsers', op:'select', params: params});
            httpService.get(url).success(function(res1){
                if(res1.length > 0){
                    group(res1, function(cb1){
                        console.log('cb1', cb1.length)
                        user(query, function(cb2){
                            console.log('cb2', cb2.length)
                            sorting()
                        })
                    })
                    return
                    /*_.forEach(res1, function(item, key){
                        var subQuery = JSON.stringify({ 'groupId': item.groupId});
                        var params = 'query=' + encodeURIComponent(subQuery);
                        var url = dbService.makeUrl({collection: 'groupDashboard', op:'select', params: params});
                        httpService.get(url).then(function(res){
                            _.forEach(res.data, function (val, index) {
                                var where = '{_id: ObjectId("'+val.dashId+'")}';
                                var params = 'query=' + encodeURIComponent(where);
                                var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
                                httpService.get(url).then(function(record){
                                    _.forEach(record.data, function(item, index){
                                        var tmp = _.filter($scope.dashboardList, function(menu){
                                            return menu._id == item._id;
                                        });
                                        if(tmp.length == 0) $scope.dashboardList.push(item);
                                    });

                                    $scope.dashboardList = $scope.dashboardList.sort(function(a, b) {
                                        return parseInt( a.serialno ) - parseInt( b.serialno );
                                    });
                                });
                            });
                        });
                    });*/
                }
                else{
                    user(query, function(cb2){
                        console.log('cb2', cb2.length)
                        sorting()
                    })
                }
            })
            return
            //get assigned to users dashboard list
            /*var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'userDashboard', op:'select', params: params});
            httpService.get(url).success(function(res2){
                if(res2.length > 0){
                    _.forEach(res2, function (val, index2) {
                        var where = '{_id: ObjectId("'+val.dashId+'")}';
                        var params = 'query=' + encodeURIComponent(where);
                        var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
                        httpService.get(url).then(function(record){
                            _.forEach(record.data, function(item, index){
                                var tmp = _.filter($scope.dashboardList, function(menu){
                                    return menu._id == item._id;
                                })
                                if(tmp.length == 0) $scope.dashboardList.push(item);
                            })

                            $scope.dashboardList = $scope.dashboardList.sort(function(a, b) {
                                return parseInt( a.serialno ) - parseInt( b.serialno );
                            })
                        })

                        if(index2 == res2.length - 1){
                            $scope.allDashboardList = $scope.dashboardList
                        }
                    })
                }
                else{
                    $scope.allDashboardList = $scope.dashboardList
                }
            })*/
        }
        else{
            var fields = JSON.stringify(["name", "type", "description", "userId", "serialno","useCase"]);
            var sort = JSON.stringify({"serialno": 1});
            var params = 'fields='+encodeURIComponent(fields) +'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
            httpService.get(url).then(function(response){
                /*var tmp = response.data.sort(function(a, b) {
                    return parseInt( a.serialno ) - parseInt( b.serialno );
                });*/
                $scope.allDashboardList = response.data;
            });
        }
    }
    $scope.loadList();

    function sorting(){
        $scope.allDashboardList = dashList.sort(function(a, b){
            return parseInt( a.serialno ) - parseInt( b.serialno );
        })
    }

    var gd = 0
    var dashList = []
    function group(res, cb){
        if(gd == 0){
            dashList = []
        }
        if(res[gd]){
            var item = res[gd]
            var subQuery = JSON.stringify({ 'groupId': item.groupId});
            var params = 'query=' + encodeURIComponent(subQuery);
            var url = dbService.makeUrl({collection: 'groupDashboard', op:'select', params: params});
            httpService.get(url).success(function(rec){
                if(rec.length > 0){
                    dashboard(rec, function(dash){
                        gd++
                        group(res, cb)
                    })
                }
                else{
                    gd++
                    group(res, cb)
                }
            })
        }
        else{
            gd = 0
            cb(dashList)
        }
    }

    function user(query, cb){
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'userDashboard', op:'select', params: params});
        httpService.get(url).success(function(rec){
            if(rec.length > 0){
                dashboard(rec, function(dash){
                    cb(dash)
                })
            }
            else
                cb(dashList)
        })
    }

    var id = 0
    function dashboard(dashIds, callback){
        if(dashIds[id]){
            var objId = dashIds[id].dashId
            var tmp = _.filter(dashList, function(menu){
                return menu._id == objId;
            })
            if(tmp.length == 0){
                var where = '{_id: ObjectId("'+objId+'")}';
                var params = 'query=' + encodeURIComponent(where);
                var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
                httpService.get(url).success(function(record){
                    if(record.length > 0){
                        dashList.push(record[0]);
                    }
                    id++
                    dashboard(dashIds, callback)
                })
            }
            else{
                id++
                dashboard(dashIds, callback)
            }
        }
        else{
            id = 0
            callback(dashList)
        }
    }

    $scope.addnew = function(){
        $state.go('index.dashboard');
    }

    $scope.edit = function(index){
        $state.go('index.dashboard', { 'id': $scope.allDashboardList[index]._id });
    }

    $scope.remove = function (index, item) {
        SweetAlert.swal({
            title: "Delete " + item.name,
            text: "Are you sure you want to remove this dashboard?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if(isConfirm){
                var url = dbService.makeUrl({collection: 'dashboards', op:'delete', id:item._id});
                httpService.get(url).then(function(response){
                    ChartService.refreshDashboard();
                    if(response.data == 'Success'){
                        var tmp = angular.copy($scope.allDashboardList);
                        tmp.splice(index, 1);
                        $scope.allDashboardList = [];
                        $timeout(function(){
                            $scope.allDashboardList = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    $scope.detail = function (item) {
        $state.go('index.dashboarddetail', { 'id': item._id });
    }

    $scope.viewPage = function (item) {
        $state.go('index.dashboards', {'id': item._id});
    }

    $scope.default = function(item){
        swal({
            title: "Set as default page",
            text: "Are you sure you want to set "+item.name+" dashboard as default page?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, set it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if(isConfirm){
                var tmp = {defaultDashId : item._id};
                var url = dbService.makeUrl({collection: 'users', op:'upsert', id: $scope.userProfile.userId});
                httpService.post(url, tmp).then(function(response){
                    if(response.data == 'Success'){
                        $scope.userProfile.defaultDashId = item._id;
                        UserProfile.profileData = $scope.userProfile;
                        UserProfile.save($scope.userProfile);
                    }
                    //not showing this alert :(
                    swal("", "Dashboard set as default page", "success");
                });
            }
        });
    }

    function favoritePageList(){
        $scope.favoriteList = [];
        var query = JSON.stringify({ page: 'dashboards', userId: currentUser.userId });
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'favorite', op:'select', params: params});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                $scope.favoritePages = res.data;
                $scope.favoriteList = res.data.map(function(a) {return a.pageId;});
            }
        });
    }
    favoritePageList();

    $scope.addFavorite = function(item, favorite){
        if(favorite == true){
            var tmp = {pageId : item._id, userId : $scope.userProfile.userId, page: 'dashboards'};
            var url = dbService.makeUrl({collection: 'favorite', op:'create'});
            httpService.post(url, tmp).then(function(res){
                if(res.data == 'Success'){
                    favoritePageList();
                    swal(item.name, "Dashboard added to favorite page", "success");
                }
            });
        }
        else{
            var id = _.filter($scope.favoritePages, function(obj){
                return obj.pageId == item._id;
            })[0]._id;
            var url = dbService.makeUrl({collection: 'favorite', op:'delete', id: id});
            httpService.get(url).then(function(res){
                console.log(res);
                if(res.data == 'Success'){
                    var index = $scope.favoriteList.indexOf(item._id);
                    $scope.favoriteList.splice(index, 1);
                    swal(item.name, "Removed from favorite list", "success");
                }
            });
        }
    }

    $scope.data = {'assignTo' : ''};
    $scope.selectList = ['User', 'Group'];
    var userList;
    var groupList;
    var selectedDash;
    var alreadyGroupArr;
    var alreadyUsersArr;
    //Assign Dashboard to user or group
    $scope.assign = function(item){
        $scope.confirmGroupArr = [];
        $scope.confirmUserArr  = [];
        selectedDash         = item;
        $scope.selected      = item;
        $scope.heading       = 'Dashboard assign to groups / users';
        $scope.mainView      = false;
        $scope.assignList    = true;
        $scope.data.assignTo = '';
        
        //get list of already assigned dashboard to group
        var query = JSON.stringify({ 'dashId': selectedDash._id});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'groupDashboard', op:'select', params:params, id:$scope.userProfile.userId});
        httpService.get(url).then(function(response){
            alreadyGroupArr = response.data;
        });

        //Get list of groups
        var url = dbService.makeUrl({collection: 'groupName', op:'select'});
        httpService.get(url).then(function(response){
            groupList = response.data;
        });

        //get list of already assigned dashboard to user
        var query = JSON.stringify({ 'dashId': selectedDash._id});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'userDashboard', op: 'select', params: params, id: $scope.userProfile.userId});
        httpService.get(url).then(function(response){
            alreadyUsersArr = response.data;
        });

        //Get list for users
        collection.users(function(res){
            userList = res;
            userMemberSet();
        });
    }

    $scope.confirmGroupArr = [];
    $scope.confirmUserArr  = [];
    function userMemberSet(){
        //For group listing
        _.forEach(groupList, function (value, key){
            var testArr = _.filter(alreadyGroupArr, function (res) {
                return res.groupId == value._id;
            });

            if(testArr.length > 0){
                value.isMember = true;
                $scope.confirmGroupArr.push(value._id);
            }
            else
                value.isMember = false;
        });

        //for user listing
        _.forEach(userList, function (val, key){

            var testArr = _.filter(alreadyUsersArr, function (res) {
                return res.userId == val._id;
            });

            if(testArr.length > 0){
                val.isMember = true;
                $scope.confirmUserArr.push(val._id);
            }
            else
                val.isMember = false;
        });
    }

    $scope.changeAssign = function(what){
        $scope.cnfrmBtn   = true;
        var what = what.trim();
        if(what == 'User')
            $scope.itemList = angular.copy(userList);
        else if(what == 'Group')
            $scope.itemList = angular.copy(groupList);
    }

    $scope.cnfrmBtn = true;
    $scope.multiCheck = function(id){
        if($scope.data.assignTo.trim() == 'Group'){
            var idx = $scope.confirmGroupArr.indexOf(id);
            if(idx > -1)
                $scope.confirmGroupArr.splice(idx, 1);
            else
                $scope.confirmGroupArr.push(id);

            console.log($scope.confirmGroupArr);
        }
        else if($scope.data.assignTo.trim() == 'User'){
            var idx = $scope.confirmUserArr.indexOf(id);
            if(idx > -1)
                $scope.confirmUserArr.splice(idx, 1);
            else
                $scope.confirmUserArr.push(id);

            console.log($scope.confirmUserArr);
        }
    }

    function loadCategory(){
        var url = dbService.makeUrl({collection: 'category', op:'select'});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                $scope.useCaseArr = {}
                for(var i in res.data){
                    $scope.useCaseArr[res.data[i]._id] = res.data[i].name 
                }
            }
        });
    }
    loadCategory();

    $scope.save = function(data){
        if(data.assignTo.trim() == 'Group'){
            _.forEach(alreadyGroupArr, function (value, key){
                var url = dbService.makeUrl({collection: 'groupDashboard', op:'delete', id: value._id});
                httpService.get(url).then(function(response){});
            });
            
            if($scope.confirmGroupArr.length > 0){
                _.forEach($scope.confirmGroupArr, function (value, key) {
                    var request = {'groupId' : value, 'dashId' : $scope.selected._id};
                    var url = dbService.makeUrl({collection: 'groupDashboard', op:'create'});
                    httpService.post(url, request).then(function(response){});
                });
            }
        }
        else if(data.assignTo.trim() == 'User'){
            _.forEach(alreadyUsersArr, function (value, key){
                var url = dbService.makeUrl({collection: 'userDashboard', op:'delete', id: value._id});
                httpService.get(url).then(function(response){});
            });

            if($scope.confirmUserArr.length > 0){
                _.forEach($scope.confirmUserArr, function(value, key){
                    var request = {'userId' : value, 'dashId' : selectedDash._id};
                    var url = dbService.makeUrl({collection: 'userDashboard', op:'create'});
                    httpService.post(url, request).then(function(response){});
                });
            }
        }
        $scope.cancel();
    }

    $scope.cancel = function(){
        $scope.mainView   = true;
        $scope.assignList = false;
    }
});