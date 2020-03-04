'use strict';


angular.module('specta')
    .factory('UserProfile', function ($window) {
        var spectauser = {
            firstName     : null,
            lastName      : null,
            //username      : null,
            //password      : null,
            userType      : null,
            userId        : null,
            defaultDashId : null
        };

        if ($window.localStorage.spectausertoekn == undefined ||  $window.localStorage.spectausertoekn == null) {
            $window.localStorage.removeItem('spectausertoekn');
            $window.localStorage.removeItem('spectauser');
        }
        else
            spectauser = angular.fromJson($window.localStorage.spectauser);

        var save = function(data){
            spectauser = data;
            $window.localStorage.setItem('spectauser', angular.toJson(spectauser));
        };

        var get = function(){
            $window.localStorage.setItem('spectauser', angular.toJson(spectauser));
        };

        var setSession = function(name, data){
            $window.localStorage.setItem(name, angular.toJson(data));
        };

        var getSession = function(name){
            return angular.fromJson($window.localStorage[name]);
        };

        return {
            profileData: spectauser,
            setSession : setSession,
            getSession : getSession,
            save: save
        };
});