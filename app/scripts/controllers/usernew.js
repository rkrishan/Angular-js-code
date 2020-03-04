'use strict';

angular.module('specta')
.controller('UserNewCtrl', function ($scope, globalConfig, $state, $stateParams, ChartService, UserProfile, SweetAlert, dbService, httpService, md5, currentUser){
    
    $scope.submitted = false;
    // if (currentUser.userType == 'user' || currentUser.userId == null){
    if ( currentUser.userId == null){
        console.log("entered user user");
        $state.go('login');
        return;
    }
    console.log("currentUser", currentUser);
    $scope.currentUser = angular.copy(currentUser);
    

    $scope.userProfile = angular.copy(currentUser);
    $scope.userSelector = globalConfig.userSelector;
    var isuser=false;       
    $scope.matchpassword=null;
    $scope.isReadOnly = false;

    $scope.user = { 'firstName': '', 'lastName': '', 'username': '','userType': '', 'defaultDashId': '', circle: null, changePassword: null};

    if($scope.userProfile.userType == 'system administrator' || $scope.userProfile.userType == 'corporate admin'){
        //globalConfig.pulldataurlbyname+ 'Circle%20Dropdown%20list'
        var fields = JSON.stringify(["circle"]);
        var params = 'fields='+ encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'circles', op:'select', params: params });
	    httpService.get(url).then(function (res) {
	    	res.data.sort(SortBYCircle);
	    	$scope.circleList = res.data;
	    });
	}
	else{
        console.log("entered user else");
		$scope.circleList = [{circle: $scope.userProfile.circle}];
    }

    function SortBYCircle(a, b){
        var aName = a.circle.toLowerCase();
        var bName = b.circle.toLowerCase(); 
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

    if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0){
        $scope.isReadOnly = true;
        var query = '{_id: ObjectId("'+ $stateParams.id +'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'users', op:'select', params: params});
        httpService.get(url).then(function(response){
            var User = response.data;
            $scope.user = User[0];
            // $scope.user.password = atob($scope.user.password);
        });
    }

    $scope.cancel = function () {
        $state.go('index.userlist');
    }

    //new added
    $scope.checkuser = function(){
        if($scope.user.username != undefined){
            var query = JSON.stringify({'username': $scope.user.username});
            var fields = JSON.stringify(["username"]);
            var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
            var url = dbService.makeUrl({collection: 'users', op:'select', params: params});
            console.log(url);
            httpService.get(url).then(function(response){
                if(response.data != 'null' && response.data.length>0 && !$stateParams.id.length){
                    isuser=true;
                    SweetAlert.swal({
                        title: "User Name Already Exits",
                        text: "",
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm){
                        $scope.user.username = null;                    
                    });
                }
                else
                    isuser=false;
            });
        }
    }

    $scope.changePass = function (valid, obj){
        if(valid && obj.password == obj.repeatpassword){
            var flag = true;
            // var request = {passwordText : obj.password};
            var request = {};
            if( globalConfig.md5Password){
                // if( $scope.user.password == md5.createHash(obj.CurrentPassword) ){
                    flag = true;
                    request.password = md5.createHash(obj.password);
                // }
            }
            else if( $scope.user.password == btoa(obj.CurrentPassword) ){
                flag = true;
                request.password = btoa(obj.password);
            }
            console.log('md5 = '+ globalConfig.md5Password, flag, request);
            if(flag){
                if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
                    var url = dbService.makeUrl({collection: 'users', op:'upsert', id: $stateParams.id});
                    httpService.post(url, request).then(function (response){
                        console.log("response",response);
                        swal({
                            title: "Password successfully changed",
                            text: "",
                            type: "success",
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Ok",
                            closeOnConfirm: true,
                            closeOnCancel: true
                        },
                        function (isConfirm){
                            if(isConfirm)
                                $state.go('index.userlist');

                        })
                    })
                }
            }
            else{
                swal({
                    title: "Your current password mismatch",
                    type: "error",
                    text: "",
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        }
    }

    $scope.save = function ($valid) {
        if($valid){
            if( isuser==false){
                if($scope.userProfile.userType == 'circle admin'){
                    $scope.user.circle = $scope.userProfile.circle;
                }
                if( !angular.isArray($scope.user.circle) )
                   $scope.user.circle = [$scope.user.circle]

                if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
                    console.log('$scope.user', $scope.user);
                    delete $scope.user._id;
                    delete $scope.user.password;
                    if( $stateParams.id == $scope.userProfile.userId ){
                        UserProfile.profileData = angular.copy($scope.user);
                        UserProfile.profileData.userType = ($scope.user.userType == 'circle user') ? 'user' : $scope.user.userType;
                        UserProfile.profileData.userId = $scope.userProfile.userId;
                        UserProfile.save(UserProfile.profileData);
                    }
                    
                    var url = dbService.makeUrl({collection: 'users', op:'upsert', id: $stateParams.id});
                    httpService.post(url, $scope.user).then(function (response){
                        console.log(currentUser, UserProfile.profileData);
                        $state.go('index.userlist');
                        /*if(currentUser.userType != 'user'){
                            console.log('if');
                            
                            $state.go('index.userlist');
                        }
                        else{
                            $state.go('index.main');
                        }*/
                    });
                }
                else {
                    if( $scope.userProfile.userType == 'admin' ) $scope.user.userType = 'user';
                    delete $scope.user.repeatpassword;
                    // $scope.user.passwordText = $scope.user.password;
                    if(globalConfig.md5Password)
                        $scope.user.password = md5.createHash($scope.user.password);
                    else
                        $scope.user.password = btoa($scope.user.password);

                    $scope.user.createDate = new Date();
                    $scope.user.userId = currentUser.userId;
                    var url = dbService.makeUrl({collection: 'users', op:'create'});
                    httpService.post(url, $scope.user).then(function (response){
                        console.log(currentUser);
                            
                            $state.go('index.userlist');
                    });
                }
            }
            else{
                SweetAlert.swal({
                    title: "User Name Already Exits",
                    text: "",
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {
                });
            }
        }else $scope.submitted = true;
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

