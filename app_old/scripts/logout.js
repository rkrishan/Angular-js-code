'use strict';

angular.module('specta')
  .controller('LogoutCtrl', function($state, $timeout, $window, UserProfile, globalConfig, httpService) {
    
    $window.localStorage.removeItem('spectausertoekn');
    $window.localStorage.removeItem('spectauser');
    // console.log(UserProfile.profileData);
    //tracking url
    var subCategory= UserProfile.profileData.email;
    var pageID= '1234';

    // console.log(category,subCategory, pageID);
        
    var trackingURL= globalConfig.dataapitrackurl+"category=LOGOUT"+"&subcategory="+subCategory+"&requestId="+pageID;
            
    httpService.get(trackingURL).success(function (response, status, headers, config){
        console.log("navigation post", response);
        return response;
    })
    
    httpService.get(globalConfig.pullDataUrl+'/Logout').then(function(res){});

    var tmp = {
        firstName     : null,
        lastName      : null,
        userType      : null,
        userId        : null,
        defaultDashId : null
    };
    UserProfile.profileData = tmp;
    UserProfile.save(tmp);
    
    $timeout(function(){
        $state.go('login');
    }, 0);
});
