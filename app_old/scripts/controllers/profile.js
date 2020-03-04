'use strict';

angular.module('specta')
.controller('ProfileCtrl', function ($scope, globalConfig, $state, $stateParams, ChartService, UserProfile, SweetAlert, dbService, httpService, md5, currentUser){
    
    
    if ( currentUser.userId == null){
        $state.go('login');
        return;
    }
    console.log("currentUser", currentUser);
    $scope.isArray       = angular.isArray;
    $scope.currentUser   = currentUser;
    $scope.userSelector  = globalConfig.userSelector;
    $scope.matchpassword = null;
    $scope.submitted     = false;
    var isuser           = false;
    $scope.password      = {};

    var query  = '{_id: ObjectId("'+ currentUser.userId +'")}';
    var params = 'query=' + encodeURIComponent(query);
    var url    = dbService.makeUrl({collection: 'users', op:'select', params: params});
    console.log("url",url)
    httpService.get(url).then(function(response){
        console.log("response ",response.data)
        $scope.user = response.data[0];
    });

    $scope.changePass = function (valid, obj){
        console.log("passord argumnet ",valid,obj)
        console.log(valid && obj.password == obj.repeatpassword);
        if(valid && obj.password == obj.repeatpassword){
            var flag = false;
            var request = {passwordText : obj.password};

            if( globalConfig.md5Password){
                console.log("user current password",$scope.user.password)
                console.log("user current password p ",md5.createHash(obj.CurrentPassword))
                if( $scope.user.password == md5.createHash(obj.CurrentPassword) ){
                    flag = true;
                    request.password = md5.createHash(obj.password);
                }
            }
            else if( $scope.user.password == btoa(obj.CurrentPassword) ){
                flag = true;
                request.password = btoa(obj.password);
            }
            console.log('md5 = '+ globalConfig.md5Password, flag, request);
            if(flag){
                var url = dbService.makeUrl({collection: 'users', op:'upsert', id: currentUser.userId});
                httpService.post(url, request).success(function (res){
                    if(res == 'Success'){
                        $scope.password = {};
                        swal("", "Password changed successfully", "success");
                        $state.go('logout')
                    }
                });
            }
            else{
                swal("", "Your current password mismatch", "error");
                /*swal({
                    title: "Your current password mismatch",
                    type: "error",
                    text: "",
                    timer: 2000,
                    showConfirmButton: false
                });*/
            }
        }
        else{
            swal("", "Password do not match", "error");
        }
    }

    $scope.save = function($valid){
        if($valid){
            console.log('$scope.user', $scope.user);
            var profile       =  UserProfile.profileData;
            profile.firstName = $scope.user.firstName;
            profile.lastName  = $scope.user.lastName;
            // UserProfile.profileData.userType = ($scope.user.userType == 'circle user') ? 'user' : $scope.user.userType;
            // UserProfile.profileData.userId = $scope.userProfile.userId;
            UserProfile.save(profile);

            var obj = {firstName: $scope.user.firstName, lastName: $scope.user.lastName}
            var url = dbService.makeUrl({collection: 'users', op:'upsert', id: currentUser.userId});
            httpService.post(url, obj).success(function(res){
                if(res == 'Success')
                    swal("", "Profile update successfully", "success");
                else
                    swal("", "Error while updating profile", "error");
            });
        }
        else $scope.submitted = true;
    }

    $scope.hasError = function (field, validation) {
        if($scope.userform && $scope.userform[field]){
            if (validation) {
                var tmp = ($scope.userform[field].$dirty && $scope.userform[field].$error[validation]) || ($scope.submitted && $scope.userform[field].$error[validation]);
                return tmp;
            }
            return ($scope.userform[field].$dirty && $scope.userform[field].$invalid) || ($scope.submitted && $scope.userform[field].$invalid);
        }
    };
});

