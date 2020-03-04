'use strict';

angular.module('specta')
  .controller('groupassignCtrl', function ($scope, $state, $stateParams, SweetAlert, UserProfile, dbService, httpService){

    $scope.userProfile = UserProfile.profileData;
    var alreadyGroupArr = [];
    var deleteArr = [];

    $scope.dtOPtions= {
        "aaSorting": [],
        "columnDefs": [
            { "orderable": false, "targets": [0,1] }
        ]
    };

    $scope.loadList = function(){
        $scope.dashboardList = [];
        if($scope.userProfile.userType == 'user' || $scope.userProfile.userType == 'corporate user' || $scope.userProfile.userType == 'circle user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var sort = JSON.stringify({"serialno": 1});
            var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.allDashboardList = response.data;
                _.forEach(response.data, function (item, key) {
                    $scope.dashboardList.push(item);
                });
            });

            //get assigned group dashboard list
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'groupUsers', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function(item, key){
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
                                    if(tmp.length == 0){
                                        item.isMember = true;
                                        $scope.dashboardList.push(item);
                                    }
                                });

                                $scope.allDashboardList = $scope.dashboardList.sort(function(a, b) {
                                    return parseInt( a.serialno ) - parseInt( b.serialno );
                                });
                            });
                        });
                    });
                });
            });

            //get assigned to users dashboard list
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'userDashboard', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (val, index) {
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

                        $scope.allDashboardList = $scope.dashboardList.sort(function(a, b) {
                            return parseInt( a.serialno ) - parseInt( b.serialno );
                        });
                    });
                });
            });
        }
        else{
            var fields = JSON.stringify(["name", "type", "description", "userId", "serialno"]);
            var sort = JSON.stringify({"name": 1});
            var params = 'fields='+encodeURIComponent(fields) +'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.allDashboardList = response.data;
                checkIsMember();
            });
        }
    }
    $scope.loadList();

    function checkIsMember(){
        $scope.confirmGroupArr = [];
        alreadyGroupArr = [];
        deleteArr = [];

        var subQuery = JSON.stringify({ 'groupId': $stateParams.id});
        var params = 'query=' + encodeURIComponent(subQuery);
        var url = dbService.makeUrl({collection: 'groupDashboard', op:'select', params: params});
        httpService.get(url).then(function(res){
            alreadyGroupArr = res.data;
            
            console.log($scope.allDashboardList.length);
            if(res.data.length > 0){
                _.forEach($scope.allDashboardList, function (value, key){
                    var testArr = _.filter(alreadyGroupArr, function (item) {
                        return item.dashId == value._id;
                    });

                    if(testArr.length > 0){
                        $scope.allDashboardList[key].isMember = true;
                        $scope.confirmGroupArr.push(value._id);
                        deleteArr.push(testArr[0]._id);
                    }
                    else
                        $scope.allDashboardList[key].isMember = false;
                });
            }
        });
    }

    //Report listing
    $scope.loadReports = function(){
        $scope.reportsList = [];
        if($scope.userProfile.userType == 'user' || $scope.userProfile.userType == 'corporate user' || $scope.userProfile.userType == 'circle user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var sort = JSON.stringify({"serialno": 1});
            
            var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.reportsList = response.data;
                
            });

            //get assigned group Report list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'groupUsers', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function(item, key){
                    var subQuery = JSON.stringify({ 'groupId': item.groupId});
                    var params = 'query=' + encodeURIComponent(subQuery);
                    var url = dbService.makeUrl({collection: 'groupReport', op:'select', params: params});
                    httpService.get(url).then(function(res){
                        _.forEach(res.data, function(val, index){
                            var where = '{_id: ObjectId("'+val.reportId+'")}';
                            var params = 'query=' + encodeURIComponent(where);
                            var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
                            httpService.get(url).then(function(record){
                                _.forEach(record.data, function(item, index){
                                    var tmp = _.filter($scope.reportsList, function(menu){
                                        return menu._id == item._id;
                                    });
                                    if(tmp.length == 0) $scope.reportsList.push(item);
                                });
                            });
                        });
                    });
                });
            });

            //get assigned to users report list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'userReport', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (val, index) {
                    var where = '{_id: ObjectId("'+val.reportId+'")}';
                    var params = 'query=' + encodeURIComponent(where);
                    var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
                    httpService.get(url).then(function(record){
                        _.forEach(record.data, function(item, index){
                            var tmp = _.filter($scope.reportsList, function(menu){
                                return menu._id == item._id;
                            });
                            if(tmp.length == 0) $scope.reportsList.push(item);
                        });
                        
                    });
                });
            });
        }
        else{
            var sort = JSON.stringify({"serialno": 1});
            var params = 'sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.reportsList = response.data;
                checkIsMemberReport();
            });
        }
    }
    // $scope.loadReports();

    function checkIsMemberReport(){
        $scope.confirmGroupArr = [];
        alreadyGroupArr = [];
        deleteArr = [];

        var subQuery = JSON.stringify({ 'groupId': $stateParams.id});
        var params = 'query=' + encodeURIComponent(subQuery);
        var url = dbService.makeUrl({collection: 'groupReport', op:'select', params: params});
        httpService.get(url).then(function(res){
            alreadyGroupArr = res.data;
            
            if(res.data.length > 0){
                _.forEach($scope.reportsList, function (value, key){
                    var testArr = _.filter(alreadyGroupArr, function (item) {
                        return item.reportId == value._id;
                    });

                    if(testArr.length > 0){
                        $scope.reportsList[key].isMember = true;
                        $scope.confirmGroupArr.push(value._id);
                        deleteArr.push(testArr[0]._id);
                    }
                    else
                        $scope.reportsList[key].isMember = false;
                });
            }
        });
    }

    //Analysis listing
    $scope.loadAnalysis = function(){
        $scope.analysisList = [];
        if($scope.userProfile.userType == 'user' || $scope.userProfile.userType == 'corporate user' || $scope.userProfile.userType == 'circle user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var sort = JSON.stringify({"serialno": 1});
            var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.analysisList.push(item);
            });
        
            //get assigned group dashboard list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'groupUsers', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (item, key) {
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
                            });
                        });
                    });
                });
            });

            //get assigned to users Analysis list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
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
                    });
                });
            });
        }
        else{
            var sort = JSON.stringify({"serialno": 1});
            var params = 'sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.analysisList = response.data;
                checkIsMemberAnalysis();
            });
        }
    }

    function checkIsMemberAnalysis(){
        $scope.confirmGroupArr = [];
        alreadyGroupArr = [];
        deleteArr = [];

        var subQuery = JSON.stringify({ 'groupId': $stateParams.id});
        var params = 'query=' + encodeURIComponent(subQuery);
        var url = dbService.makeUrl({collection: 'groupAnalysis', op:'select', params: params});
        httpService.get(url).then(function(res){
            alreadyGroupArr = res.data;
            
            if(res.data.length > 0){
                _.forEach($scope.analysisList, function (value, key){
                    var testArr = _.filter(alreadyGroupArr, function (item) {
                        return item.analysisId == value._id;
                    });

                    if(testArr.length > 0){
                        $scope.analysisList[key].isMember = true;
                        $scope.confirmGroupArr.push(value._id);
                        deleteArr.push(testArr[0]._id);
                    }
                    else
                        $scope.analysisList[key].isMember = false;
                });
            }
        });
    }

    $scope.multiCheck = function(id){
        var idx = $scope.confirmGroupArr.indexOf(id);
        console.log("$scope.confirmGroupArr", $scope.confirmGroupArr);
        if(idx > -1)
            $scope.confirmGroupArr.splice(idx, 1);
        else
            $scope.confirmGroupArr.push(id);

        console.log($scope.confirmGroupArr);
    }
    
    $scope.CheckedAll= function(arr){
        console.log("checkedAll Array", arr);
        if($scope.allDashboardList.length != $scope.confirmGroupArr.length){
            _.forEach(arr, function(item){
                var idx = $scope.confirmGroupArr.indexOf(item._id);
                console.log("$scope.confirmGroupArr", $scope.confirmGroupArr);
                if(idx <0)
                    $scope.confirmGroupArr.push(item._id);
                
                console.log($scope.confirmGroupArr);
            })
        }else{
            $scope.confirmGroupArr= [];
             console.log($scope.confirmGroupArr);
        }
    }

    $scope.saveDashboard = function(){
        _.forEach(deleteArr, function (id, key){
            var url = dbService.makeUrl({collection: 'groupDashboard', op:'delete', id: id});
            httpService.get(url).then(function(response){});
        });
        
        if($scope.confirmGroupArr.length > 0){
            _.forEach($scope.confirmGroupArr, function (value, key) {
                var request = {'groupId' : $stateParams.id, 'dashId' : value};
                var url = dbService.makeUrl({collection: 'groupDashboard', op:'create'});
                httpService.post(url, request).then(function(response){});
            });
        }
        $state.go('index.grouplist');
    }


    $scope.saveReport = function(){
        _.forEach(deleteArr, function (id, key){
            var url = dbService.makeUrl({collection: 'groupReport', op:'delete', id: id});
            httpService.get(url).then(function(response){});
        });
        
        if($scope.confirmGroupArr.length > 0){
            _.forEach($scope.confirmGroupArr, function (value, key) {
                var request = {'groupId' : $stateParams.id, 'reportId' : value};
                var url = dbService.makeUrl({collection: 'groupReport', op:'create'});
                httpService.post(url, request).then(function(response){});
            });
        }
        $state.go('index.grouplist');
    }
        
    $scope.saveAnalytics = function(){
        _.forEach(deleteArr, function (id, key){
            var url = dbService.makeUrl({collection: 'groupAnalysis', op:'delete', id: id});
            httpService.get(url).then(function(response){});
        });
        
        if($scope.confirmGroupArr.length > 0){
            _.forEach($scope.confirmGroupArr, function (value, key) {
                var request = {'groupId' : $stateParams.id, 'analysisId' : value};
                var url = dbService.makeUrl({collection: 'groupAnalysis', op:'create'});
                httpService.post(url, request).then(function(response){});
            });
        }
        $state.go('index.grouplist');
    }
});