'use strict';

angular.module('specta')
  .controller('StagingListCtrl', function ($scope, $rootScope, $timeout, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, httpService, dbService){

    ChartService.setCurrentPage(null);
    $scope.apiURL = globalConfig.dataapiurl;
    $scope.userProfile = UserProfile.profileData;

    $scope.loadList = function(){
        ChartService.refreshStaging();
        $scope.heading      = 'Staging';
        $scope.mainView     = true;
        $scope.assignList   = false;
        $scope.analysisList = [];

        if($scope.userProfile.userType == 'user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'staging', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (item, key) {
                    $scope.analysisList.push(item);
                });
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
                                $scope.analysisList.push(record.data);
                            })
                        })
                    })
                })
            })

            //get assigned to users dashboard list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'userAnalysis', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (val, index){
                    var where = '{_id: ObjectId("'+val.analysisId+'")}';
                    var params = 'query=' + encodeURIComponent(where);
                    var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
                    httpService.get(url).then(function(record){
                        $scope.analysisList.push(record.data);
                    })
                })
            })
        }
        else{
            var fields = JSON.stringify(["name", "type", "description", "userId", "serialno"]);
            var params = 'fields='+encodeURIComponent(fields);
            var url = dbService.makeUrl({collection: 'staging', op:'select', params: params});
            httpService.get(url).success(function(res){
                if($scope.userProfile.userType == 'system administrator')
                    $scope.analysisList = res
                else{
                    $scope.analysisList = _.filter(res, function(item){
                        return item.userId != '57249c8802ec329a0c50958f'
                    })
                }
                //57249c8802ec329a0c50958f
            })
        }
    }
    $scope.loadList();

    $scope.addnew = function () {
        $state.go('index.staging');
    }

    $scope.edit = function (item) {
        $state.go('index.staging', { 'id': item._id });
    }

    $scope.remove = function(index, item){
        SweetAlert.swal({
            title: "Delete " + item.name,
            text: "Are you sure you want to remove this staging?",
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
                var url = dbService.makeUrl({collection: 'staging', op:'delete', id:item._id});
                httpService.get(url).then(function(response){
                    if(response.data == 'Success'){
                        ChartService.refreshStaging();
                        var tmp = angular.copy($scope.analysisList);
                        tmp.splice(index, 1);
                        $scope.analysisList = [];
                        $timeout(function(){
                            $scope.analysisList = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    $scope.detail = function (item) {
        $state.go('index.stagings', { id : item._id});
    }

    $scope.data = {'assignTo' : ''};
    $scope.selectList = ['User', 'Group'];
    var userList;
    var groupList;
    var alreadyGroupArr;
    var alreadyUsersArr;
    //Assign Dashboard to user or group
    $scope.assign = function(item){
        $scope.selected      = item;
        $scope.heading       = 'Analysis assign to groups / users';
        $scope.mainView      = false;
        $scope.assignList    = true;
        $scope.itemList      = '';
        $scope.data.assignTo = '';
        
        //get list of already assigned staging to group
        var query = JSON.stringify({ 'analysisId': $scope.selected._id});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'groupAnalysis', op:'select', params: params});
        httpService.get(url).then(function(response){
            alreadyGroupArr = response.data;
            console.log('already assigned to groups array');
            console.log(alreadyGroupArr);
        });

        //Get list of groups
        var url = dbService.makeUrl({collection: 'groupName', op:'select'});
        httpService.get(url).then(function(response){
            groupList = response.data;
        });

        //get list of already assigned this staging to user
        var query = JSON.stringify({ 'analysisId': $scope.selected._id});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({ collection: 'userAnalysis', op: 'select', params: params });
        httpService.get(url).then(function(response){
            alreadyUsersArr = response.data;
            console.log('already assigned to users array');
            console.log(alreadyUsersArr);
        });

        //Get list for users
        var fields = JSON.stringify(["firstName", "lastName"]);
        var query = JSON.stringify({ 'userType': 'user'});
        var params = 'query='+encodeURIComponent(query)+'&fields='+encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'users', op:'select', params: params});
        httpService.get(url).then(function(response){
            userList = response.data;
        });

        $scope.confirmGroupArr = [];
        $scope.confirmUserArr  = [];
        $timeout(function(){
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
        }, 1000);
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
        if($scope.data.assignTo == 'Group'){
            var idx = $scope.confirmGroupArr.indexOf(id);
            if(idx > -1)
                $scope.confirmGroupArr.splice(idx, 1);
            else
                $scope.confirmGroupArr.push(id);

            console.log($scope.confirmGroupArr);
        }
        else{
            var idx = $scope.confirmUserArr.indexOf(id);
            if(idx > -1)
                $scope.confirmUserArr.splice(idx, 1);
            else
                $scope.confirmUserArr.push(id);

            console.log($scope.confirmUserArr);
        }
    }

    $scope.save = function(data){
        if(data.assignTo == 'Group'){
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
        else if(data.assignTo == 'User'){
            _.forEach(alreadyUsersArr, function (value, key){
                var url = dbService.makeUrl({collection: 'userAnalysis', op:'delete', id: value._id});
                httpService.get(url).then(function(response){});
            });

            if($scope.confirmUserArr.length > 0){
                _.forEach($scope.confirmUserArr, function(value, key){
                    var request = {'userId' : value, 'analysisId' : selectedDash._id};
                    var url = dbService.makeUrl({collection: 'userAnalysis', op:'create'});
                    httpService.post(url, request).then(function(response){});
                });
            }
        }
        $scope.loadList();
    }

    $scope.cancel = function(){
        $scope.loadList();
    }
});