'use strict';

angular.module('specta')
  .controller('emailCtrl', function ($scope, $state, $stateParams, globalConfig, SweetAlert, httpService, dbService) {
    $scope.submitted = false;
    $scope.email = function(user, $valid){
        if($valid){
            var fields = JSON.stringify(['email']);
            var query = JSON.stringify({'username': user.mail});
            var params = 'query=' + encodeURIComponent(query) + '&fields='+encodeURIComponent(fields)
            var url = dbService.makeUrl({collection: 'users', op:'select', params: params});

            // GET PERAMETER OF URL  AND GENERATE RANDOM STRING AND SEND MAIL .
            httpService.get(url).then(function(response){
                if(response.data.length>0){
                    httpService.get(globalConfig.pullDataUrl + '/ForgetPassword?action=sendmail&emailid='+ user.mail).then(function(res,err){
                        if(res) $scope.serverMessage = 'Email sent successfully';
                        else $scope.serverMessageErr = "Email Not send Try again...!";
                    });
                    /*var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
                    var string_length = 15;
                    var randomstring = '';
                    for (var i=0; i<string_length; i++) {
                        var rnum = Math.floor(Math.random() * chars.length);
                        randomstring += chars.substring(rnum,rnum+1);
                    }

                    var tmp = {};
                    tmp.token = randomstring;
                    tmp.mailfomat = "The password for the Specta account You have requested to recover password for" + user.mail + "To set a new password, please go to "+globalConfig.appPath+"/#/forgot/"+user.mail+"/"+randomstring;                      
                    console.log(tmp);
            		var tokenup = {'token':randomstring, forgotReqTime: new Date()};
            		var url = dbService.makeUrl({collection: 'users', op:'upsert', id:response.data[0]._id});
                    httpService.post(url,tokenup).then(function (response){
                        console.log("Renadom Record update",response);
            			if(response.data = "Suceess"){
                            	
            			}
            			else{
            				console.log("else");
            			}
                    });*/                 
                }else{
                    swal("Sorry...! Email not Found in our record")
                }
            });
        }else{
            $scope.submitted = true;
        }
    }
    $scope.hasError = function (field, validation) {
        if (validation && angular.isDefined($scope.emailform)) {
            var tmp = ($scope.emailform[field].$dirty && $scope.emailform[field].$error[validation]) || ($scope.submitted && $scope.emailform[field].$error[validation]);
            return tmp;
        }
        return ($scope.emailform[field].$dirty && $scope.emailform[field].$invalid) || ($scope.submitted && $scope.emailform[field].$invalid);
    };
});
