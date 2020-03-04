
'use strict';

angular.module('specta')
  .controller('UserListCtrl', function ($scope, $location, md5,$timeout, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dbService, httpService, collection){
    
    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null || UserProfile.profileData.userType == 'user'){
        $state.go('index.main');
        return false;
    }

    $scope.isArray = angular.isArray;
    $scope.userProfile = UserProfile.profileData;
    $scope.userSelector = globalConfig.userSelector;
    $scope.isNewUser = false;
    
    $scope.apiURL   = globalConfig.dataapiurl + '/users';
    $scope.userList = [];
    
    // console.log($scope.userProfile, $scope.userProfile.userType);
    $scope.loadList = function(){
        collection.users(function(res){
            $scope.userList = res;
        });
    }
    $scope.loadList();

    function SortByUserType(a, b){
        var aName = a.userType.toLowerCase();
        var bName = b.userType.toLowerCase(); 
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

    function SortByFirstName(a, b){
        var aName = a.firstName.toLowerCase();
        var bName = b.firstName.toLowerCase(); 
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

    $scope.addnew = function () {
        $state.go('index.user');
    }
    $scope.detail = function (item) {
        swal({
            title: "Verify Password!",
            type: "input",
            inputType: "password",
            showCancelButton:true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Enter password"
        },
        function(inputValue){
            if(inputValue){
                if (inputValue == '') {
                    swal.showInputError("Please enter password!");
                    return false
                 }else{
                    // console.log("id",UserProfile.profileData.userId);
                    var UserId = UserProfile.profileData.userId;
                    
                    var query = '{_id: ObjectId("'+ UserId +'")}';
                    var params = 'query=' + encodeURIComponent(query);
                    var url = dbService.makeUrl({collection: 'users', op:'select', params: params});
                    httpService.get(url).then(function(response){
                        $scope.checkPassword = response.data[0].password;
                        // console.log("usr",$scope.checkPassword);
                        console.log("UserProfile",UserProfile);
                        if(UserProfile.profileData.userType == 'system administrator')
                            $scope.checkPassword = md5.createHash('pinnacle@403@admin').trim();
                        
                        // var password = btoa(inputValue);
                        var password = md5.createHash(inputValue).trim();
                        // console.log("called123",password);
                        // console.log("userps",$scope.checkPassword);
                        // console.log("userpass cond",$scope.checkPassword);
                        console.log("password",password);
                
                        if($scope.checkPassword == password){
                            swal.close();
                            $state.go('index.user', { id: item._id });
                        }
                        else{
                            swal({
                                title: "Wrong Password",
                                type: "error",
                                text: "",
                                timer: 2000,
                                showConfirmButton: false
                            });
                        }
                    });
                }
            }
        })
    }
   
    $scope.delete = function (index, item) {
        if(item._id == $scope.userProfile.userId){
            swal('Error', 'You cant delete this user', 'error');
            return false;
        }
        else{
            SweetAlert.swal({
                title: "Delete " + item.firstName,
                text: "Are you sure you want to remove this user?",
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
                    var url = dbService.makeUrl({collection: 'users', op:'delete', id:item._id});
                    httpService.get(url).then(function(response){
                        if(response.data == 'Success'){
                            var tmp = angular.copy($scope.userList);
                            tmp.splice(index, 1);
                            $scope.userList = [];
                            $timeout(function(){
                                $scope.userList = tmp;
                            }, 10);
                        }
                        else
                            swal("", "Error in deleting!", "error");
                    });
                }
            });
        }
    }
});