'use strict';

angular.module('specta')
  .controller('forgotpassCtrl', function ($stateParams, $scope, $filter, $state, dbService, globalConfig,SweetAlert, httpService) {

    if(!$stateParams.token){
        $state.go('login');
        return;
    }

    /*var date1 = new Date('2017-06-11T17:53:46.372');
    console.log('date1',date1);
    date1 = date1.getTime() / 1000;
    var timeStamp = Math.round(new Date().getTime() / 1000);
    var timeStampYesterday = timeStamp - (24 * 3600);
    var is24 = date1 >= new Date(timeStampYesterday).getTime();
    console.log('is24',is24);*/
    
    var matchpassword = true;

    $scope.forgotPass = function(user){
        $scope.errorMsg = null
	    if($scope.user.password != $scope.user.repeatPassword)
	       matchpassword=false;
   		else
        	matchpassword=true;

        console.log(matchpassword);

        if(!matchpassword)
            $scope.errorMsg = 'Password do not match';
        else{
            var query = JSON.stringify({'transactionId': $stateParams.token});
            var params = 'query=' + encodeURIComponent(query); /*+'&fields='+encodeURIComponent(fields)*/
            var url = dbService.makeUrl({collection: 'forgetpassword', op:'select', params: params});
            httpService.get(url).then(function(res){
                if(res.data.length == 0)
                    $scope.errorMsg = 'Token is not valid';
                else{
                    var token = res.data[0];
                    var datetime = token.reqTime.slice(0, -1);
                    var date1 = new Date(datetime);
                    
                    date1 = date1.getTime() / 1000;
                    var timeStamp = Math.round(new Date().getTime() / 1000);
                    var timeStampYesterday = timeStamp - (24 * 3600);
                    var is24 = date1 >= new Date(timeStampYesterday).getTime();
                    console.log('is24', is24);
                    if(is24) changePassword(user, token);
                    else $scope.errorMsg = 'Your reset password link expire.';
                }
            });
        }
    }

    function changePassword(user, token){
        var fields = JSON.stringify(['username']);
        var query = JSON.stringify({'username': token.emailId});
        var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'users', op:'select', params: params});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                var password = {'password': btoa(user.password)};
                var url = dbService.makeUrl({collection: 'users', op:'upsert', id:res.data[0]._id});
                httpService.post(url, password).then(function (response){
                    $scope.successMsg = 'Password successfully reset.';
                });
            }
        });
    }

    $scope.submitted = false;
  	$scope.hasError = function (field, validation) {
  		if (validation && angular.isDefined($scope.forgotform)) {
        	var tmp = ($scope.forgotform[field].$dirty && $scope.forgotform[field].$error[validation]) || ($scope.submitted && $scope.forgotform[field].$error[validation]);
        	return tmp;
    	}
    	return ($scope.forgotform[field].$dirty && $scope.forgotform[field].$invalid) || ($scope.submitted && $scope.forgotform[field].$invalid);
	};
});
