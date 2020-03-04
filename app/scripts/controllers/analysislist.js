'use strict';

angular.module('specta')
  .controller('AnalysisListCtrl', function ($scope, $rootScope, $timeout, $state, SweetAlert, ChartService, UserProfile, dbService, httpService, collection){

    ChartService.setCurrentPage(null);
    $scope.userProfile = UserProfile.profileData;
    $scope.isArray = angular.isArray;
    $scope.loadList = function(){
        ChartService.refreshAnalysis();
        $scope.heading      = 'Analysis';
        $scope.mainView     = true;
        $scope.assignList   = false;
        $scope.analysisList = [];

        if($scope.userProfile.userType == 'user' || $scope.userProfile.userType == 'circle user'|| $scope.userProfile.userType == 'corporate user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var sort = JSON.stringify({"serialno": 1});
            var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
            httpService.get(url).then(function (response){
                if(response.data != 'null'){
                    // $scope.allAnalysisList = response.data;
                    _.forEach(response.data, function(item, key){
                        dashList.push(item);
                    });
                }
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
                    /*_.forEach(response.data, function (item, key) {
                        var subQuery = JSON.stringify({ 'groupId': item.groupId});
                        var params = 'query=' + encodeURIComponent(subQuery);
                        var url = dbService.makeUrl({collection: 'groupAnalysis', op:'select', params: params});
                        httpService.get(url).then(function(res){
                            _.forEach(res.data, function (val, index) {
                                var where = '{_id: ObjectId("'+val.analysisId+'")}';
                                var params = 'query=' + encodeURIComponent(where);
                                var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
                                httpService.get(url).then(function(record){
                                    _.forEach(record.data, function(item, index){
                                        var tmp = _.filter($scope.analysisList, function(menu){
                                            return menu._id == item._id;
                                        });
                                        if(tmp.length == 0) $scope.analysisList.push(item);
                                    });
                                    $scope.allAnalysisList = [];
                                    $scope.allAnalysisList = $scope.analysisList.sort(function(a, b) {
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
            });

            //get assigned to users Analysis list
            /*var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'userAnalysis', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (val, index) {
                    var where = '{_id: ObjectId("'+val.analysisId+'")}';
                    var params = 'query=' + encodeURIComponent(where);
                    var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
                    httpService.get(url).then(function(record){
                        _.forEach(record.data, function(item, index){
                            var tmp = _.filter($scope.analysisList, function(menu){
                                return menu._id == item._id;
                            });
                            if(tmp.length == 0) $scope.analysisList.push(item);
                        });
                        $scope.allAnalysisList = [];
                        console.log('fdsf');
                        $scope.allAnalysisList = $scope.analysisList.sort(function(a, b) {
                            return parseInt( a.serialno ) - parseInt( b.serialno );
                        });
                    });
                });
            });*/
        }
        else{
            var sort = JSON.stringify({"serialno": 1});
            var params = 'sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.allAnalysisList = response.data;
            });
        }
    }
    $scope.loadList();

    function sorting(){
        $scope.allAnalysisList = dashList.sort(function(a, b){
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
            var url = dbService.makeUrl({collection: 'groupAnalysis', op:'select', params: params});
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
        var url = dbService.makeUrl({collection: 'userAnalysis', op:'select', params: params});
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
            var objId = dashIds[id].analysisId
            var tmp = _.filter(dashList, function(menu){
                return menu._id == objId;
            })
            if(tmp.length == 0){
                var where = '{_id: ObjectId("'+objId+'")}';
                var params = 'query=' + encodeURIComponent(where);
                var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
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

    $scope.addnew = function () {
        $state.go('index.analysis');
    }

    $scope.edit = function (item) {
        $state.go('index.analysis', { 'id': item._id });
    }

    $scope.remove = function (index, item) {
        SweetAlert.swal({
            title: "Delete " + item.name,
            text: "Are you sure you want to remove this Analytics page?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm) {
            if (isConfirm) {
                var url = dbService.makeUrl({collection: 'analysis', op:'delete', id:item._id});
                httpService.get(url).then(function(response){
                    ChartService.refreshAnalysis();
                    if(response.data == 'Success'){
                        var tmp = angular.copy($scope.allAnalysisList);
                        tmp.splice(index, 1);
                        $scope.allAnalysisList = [];
                        $timeout(function(){
                            $scope.allAnalysisList = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    $scope.detail = function (item) {
        if(item.type == 'static')
            $state.go('index.staticanalysis', { id : item._id});
        else
            $state.go('index.analytics', { id : item._id});
    }

    $scope.data = {'assignTo' : ''};
    $scope.selectList = ['User', 'Group'];
    var userList;
    var groupList;
    var alreadyGroupArr;
    var alreadyUsersArr;
    //Assign Dashboard to user or group
    $scope.assign = function(item){
        $scope.confirmGroupArr = [];
        $scope.confirmUserArr  = [];
        $scope.selected      = item;
        $scope.heading       = 'Analysis assign to groups / users';
        $scope.mainView      = false;
        $scope.assignList    = true;
        $scope.itemList      = '';
        $scope.data.assignTo = '';
        
        //get list of already assigned analysis to group
        var query = JSON.stringify({ 'analysisId': $scope.selected._id});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'groupAnalysis', op:'select', params:params, id:$scope.userProfile.userId});
        httpService.get(url).then(function(response){
            alreadyGroupArr = response.data;
        });

        //Get list of groups
        var url = dbService.makeUrl({collection: 'groupName', op:'select'});
        httpService.get(url).then(function(response){
            groupList = response.data;
        });

        //get list of already assigned analysis to user
        var query = JSON.stringify({ 'analysisId': $scope.selected._id});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'userAnalysis', op: 'select', params: params, id: $scope.userProfile.userId});
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
        $scope.itemList   = [];
        $scope.cnfrmBtn   = true;
        var what = what.trim();
        if(what == 'User')
            $scope.itemList = userList;
        else if(what == 'Group')
            $scope.itemList = groupList;
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
                var url = dbService.makeUrl({collection: 'groupAnalysis', op:'delete', id: value._id});
                httpService.get(url).then(function(response){});
            });

            if($scope.confirmGroupArr.length > 0){
                _.forEach($scope.confirmGroupArr, function (value, key) {
                    var request = {'groupId' : value, 'analysisId' : $scope.selected._id};
                    var url = dbService.makeUrl({collection: 'groupAnalysis', op:'create'});
                    httpService.post(url, request).then(function(response){});
                });
            }
        }
        else if(data.assignTo.trim() == 'User'){
            _.forEach(alreadyUsersArr, function (value, key){
                var url = dbService.makeUrl({collection: 'userAnalysis', op:'delete', id: value._id});
                httpService.get(url).then(function(response){});
            });

            if($scope.confirmUserArr.length > 0){
                _.forEach($scope.confirmUserArr, function(value, key){
                    var request = {'userId' : value, 'analysisId' : $scope.selected._id};
                    var url = dbService.makeUrl({collection: 'userAnalysis', op:'create'});
                    httpService.post(url, request).then(function(response){});
                });
            }
        }
        $scope.cancel();
    }

    $scope.cancel = function(){
        $scope.mainView     = true;
        $scope.assignList   = false;
    }
});