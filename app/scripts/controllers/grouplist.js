
'use strict';

angular.module('specta')
  .controller('GroupListCtrl', function ($scope, $timeout, $state, SweetAlert, ChartService, UserProfile, dbService, httpService, collection){
    
    $scope.userProfile = UserProfile.profileData;
    $scope.isNewUser   = false;
    $scope.groupList   = [];
    
    if($scope.userProfile.userType == 'user'){
        $state.go('index.main');
        return;
    }

    $scope.loadList = function () {
        $scope.groupTable = true;
        $scope.groupUser  = false;
        var url = dbService.makeUrl({collection: 'groupName', op:'select'});
        httpService.get(url).then(function(response){
            $scope.groupList = response.data;
        });
    }
    $scope.loadList();

    $scope.addnew = function () {
        $state.go('index.group');
    }

    $scope.detail = function (item) {
        $state.go('index.group', { id: item._id });
    }

    $scope.delete = function(item, index){
        SweetAlert.swal({
            title: "Delete " + item.title,
            text: "Are you sure you want to remove this group?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if (isConfirm){
                var url = dbService.makeUrl({collection: 'groupName', op:'delete', id:item._id});
                httpService.get(url).then(function(response){
                    if(response.data == 'Success'){
                        var tmp = angular.copy($scope.groupList);
                        tmp.splice(index, 1);
                        $scope.groupList = [];
                        $timeout(function(){
                            $scope.groupList = tmp;
                        }, 10);
                    }
                    else
                        swal("", "Error in deleting!", "error");
                });
            }
        });
    }

    $scope.cancel = function(){
        $scope.loadList();
    }

    var selectedGroup;
    var alreadyArr;
    $scope.assign = function(item){
        selectedGroup     = item;
        $scope.groupTable = false;
        $timeout(function () { $scope.groupUser = true; }, 900);
        $scope.selectedGroup = item;

        //get list of already assigned group to user
        var query = JSON.stringify({ 'groupId': selectedGroup._id});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'groupUsers', op:'select', params:params});
        httpService.get(url).then(function(response){
            alreadyArr = response.data;
        });

        var userList;
        /*var fields = JSON.stringify(['username', 'firstName', 'lastName']);
        var userq = JSON.stringify({ 'userType': 'user'});*/
        var fields = JSON.stringify(['username', 'firstName', 'lastName', 'userType']);
        /*var userq = JSON.stringify({'circle': $scope.userProfile.circle, 'userType': 'user'});
        var params = 'query=' + encodeURIComponent(userq)+'&fields='+ encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'users', op:'select', params:params});
        httpService.get(url).then(function(response){
            if(response.data == 'null') return;
            response.data.sort(SortByFirstName);
            userList = response.data;

            $scope.confirmArr = [];
            //get list of pending user
            var tempArr = [];
            _.forEach(userList, function (value, key){
                var testArr = _.filter(alreadyArr, function (res) {
                    return res.userId == value._id;
                });

                if(testArr.length > 0){
                    value.isMember = true;
                    $scope.confirmArr.push(value._id);
                }
                else
                    value.isMember = false;
            });
            $scope.userList = userList;
        });*/

        //Get list for users
        collection.users(function(response){
            if(response == null){
                swal('', 'User not found', 'warning');
                return
            }
            response.sort(SortByFirstName);
            userList = response;

            $scope.confirmArr = [];
            //get list of pending user
            var tempArr = [];
            _.forEach(userList, function (value, key){
                var testArr = _.filter(alreadyArr, function (res) {
                    return res.userId == value._id;
                });

                if(testArr.length > 0){
                    value.isMember = true;
                    $scope.confirmArr.push(value._id);
                }
                else
                    value.isMember = false;
            });
            $scope.userList = userList;
        });
    }

    function SortByFirstName(a, b){
        var aName = a.username.toLowerCase();
        var bName = b.username.toLowerCase(); 
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

    $scope.multiCheck = function(id){
        var idx = $scope.confirmArr.indexOf(id);
        if(idx > -1)
            $scope.confirmArr.splice(idx, 1);
        else
            $scope.confirmArr.push(id);
        
        if($scope.confirmArr.length > 0)
            $scope.cnfrmBtn = false;
    }

    $scope.saveGroup = function(){
        SweetAlert.swal({
            title: "Group Assign",
            text: "Are you sure you want to assign this group to selected user?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, assign it!",
            cancelButtonText: "No, cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if(isConfirm){
                _.forEach(alreadyArr, function (value, key){
                    var url = dbService.makeUrl({collection: 'groupUsers', op:'delete', id: value._id});
                    httpService.get(url).then(function(response){});
                });

                _.forEach($scope.confirmArr, function (value, key) {
                    var request = {'groupId' : selectedGroup._id, 'userId' : value};
                    var url = dbService.makeUrl({collection: 'groupUsers', op:'create'});
                    httpService.post(url, request).then(function(response){});
                });
                $scope.loadList();
            }
        });
    }

    $scope.assignGroup = function(item){
        $state.go('index.groupassign', {id : item._id});
    }
});