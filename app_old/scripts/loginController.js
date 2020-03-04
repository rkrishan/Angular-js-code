'use strict';

angular.module('specta')
  .controller('LoginCtrl', function($scope, $state, $window, globalConfig, UserProfile, SweetAlert, httpService, md5) {
    
    $window.localStorage.clear();
    var currentUser = UserProfile.profileData;
    if(currentUser && currentUser.userId){
        $state.go('index.main');
        return;
    }

    $scope.login = { 'username': '', 'password': '' };
    $scope.validateLogin = function(){
        var tmp = angular.copy($scope.login);
        // console.log(btoa(tmp.password), md5.createHash(tmp.password));
        
        // tmp.password = md5.createHash(tmp.password).trim();
        if(globalConfig.md5Password)
            tmp.password = md5.createHash(tmp.password).trim();
        else
            tmp.password = btoa(tmp.password);
        
        var request = JSON.stringify(tmp);
        // console.log('tempUsername', tmp.username);
        // console.log('tempPassword', tmp.password);
        httpService.post(globalConfig.pullDataUrl + '/Login?username='+ tmp.username.trim() +'&password='+ tmp.password)
        .success(function (result, status, headers, config){
            // var user = result.headers('X-USER-DATA'); its working in then function
            var user = headers('X-USER-DATA');
            user = JSON.parse(user);
            // console.log(user);
            if( result.trim() == 'Success'){
                $window.localStorage.setItem('spectausertoekn', user._id);
                var tmp = {
                    firstName    : user.firstName,
                    lastName     : user.lastName,
                    userType     : (user.userType == 'circle user' || user.userType == 'corporate user') ? 'user' : user.userType,
                    userId       : user._id,
                    circle       : user.circle,
                    email        : user.userid,
                    sessionid    : user.sessionid,
                    defaultDashId: (user.defaultDashId) ? user.defaultDashId : null
                };
                UserProfile.profileData = tmp;
                UserProfile.save(tmp);

                if(user.defaultDashId)
                    $state.go('index.dashboards', { 'id': user.defaultDashId});
                else
                    $state.go('index.main');
            }
            else if( result.trim() == 'Failed'){
                $window.localStorage.removeItem('spectausertoekn');
                $window.localStorage.removeItem('spectauser');
                swal("Error", "Username or Password Invalid", "error");
            }
            else swal("Error", result, "error");
        })
        .error(function (data, status, headers, config) {
            if(status == 500) swal("Server error", "Try again later.", "error");
        });
    }
});