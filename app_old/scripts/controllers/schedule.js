'use strict';

angular.module('specta')
  .controller('ScheduleCtrl', function ($scope, $stateParams, $state, globalConfig, SweetAlert, UserProfile, httpService, dbService, currentUser){
    
    if (currentUser.userType == 'user' || currentUser.userId == null){
        $state.go('login');
        return;
    }

    $scope.userProfile = UserProfile.profileData;
    
    $scope.submitted   = false;
    $scope.userProfile = currentUser;
    $scope.data        = {};
    $scope.data.visibility  = true;
    $scope.reportArr   = [];
    var scheduleData   = false;
    $scope.reportId    = $stateParams.reportId;

    if($scope.userProfile.userType == 'system administrator'){
        $scope.data.visibility  = false;
    }

    $scope.loadreport = function(){
        var fields = JSON.stringify(["name", "query","statementId"]);
        var query = JSON.stringify({"dataSource": "DBPull"});
        var sort = JSON.stringify({"createdDate": -1});
        var params = 'query='+encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(response){
            //console.log(response.data);
            var tmp = response.data.sort(function(a, b){
                return parseInt( a.serialno ) - parseInt( b.serialno );
            });
            $scope.reportsList = tmp;
            console.log($stateParams);
             if(angular.isDefined($stateParams.statementId) ){
                $scope.data.statementId = $stateParams.statementId; //Statement Id coming from report page (dynamic.html ibox-tools)
                $scope.checkReport($stateParams.statementId);
            }
        });
    }
    if($stateParams.reportId == null){
        $scope.loadreport();
    }
    else{
        var fields = JSON.stringify(["name", "description"]);
        var query = '{_id: ObjectId("'+$stateParams.reportId+'")}';
        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'customreport', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.data = response.data[0];
            $scope.data.cReportId = $stateParams.reportId;
        });
    }

    if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0) {
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'reportschedule', op:'select', params: params});
        httpService.get(url).then(function(response){
            if(response.data.length > 0){
                scheduleData = true;
                $scope.data = response.data[0];
                var period = $scope.data.period;
                if(period){
                    $scope.data.period = period.charAt(1);
                    console.log('period', period,  period.charAt(0), $scope.data.period);
                    $scope.data.duration = period.charAt(0);
                }
                $scope.reportArr = $scope.data.reportArr;
                console.log('$scope.data', $scope.data);
            }
        });
    }

    if(angular.isDefined($stateParams.name))
        $scope.data.name = $stateParams.name;

    if(angular.isDefined($stateParams.day)){
        $scope.data.period = 'd';
        $scope.data.duration = $stateParams.day;
    }

    $scope.cancel = function(){
        $state.go('index.schedulelist');
    }

    /*
    *   Check report contains string like $p_
    */
    $scope.checkReport = function(reportId){
        var tmpReport = _.filter($scope.reportsList, function(item){
            return item.statementId == reportId
        });
        // console.log('tmpReport', tmpReport);
        var q = tmpReport[0].query;

        // var position = q.indexOf("$p_");
        var strArr = q.split("$p_");
        $scope.reportArr = {};

        if(strArr.length == 1){
            // $scope.data.report = '';
        }
        else{
            for(var i=1; i < strArr.length; i++){
                var str = strArr[i].split(/'|}|]/)[0];
                var space = false;
                var tmpStr = '';
                $scope.reportArr[str] = null;
                // for(var j=0; j<str.length; j++){
                //     if(j == 0){
                //         tmpStr = str[j].toUpperCase();
                //     }
                //     else{
                //         if( !space && /[A-Z]/.test( str[j] ) ){
                //             space = true;
                //             tmpStr += ' '+str[j];
                //         }
                //         else
                //             tmpStr += str[j];
                //     }
                // }
                // $scope.reportArr[tmpStr] = null;
            }
        }
            // console.log($scope.reportArr);
            $scope.data.reportArr = $scope.reportArr;
            // console.log("object display",$scope.data.reportArr);
            if( angular.isDefined($scope.data.reportArr.fromDate) || angular.isDefined($scope.data.reportArr.toDate) ){
                $scope.data.duration = 1;
                $scope.data.period = 'd';
            }
            else{
                $scope.data.duration = '';
                $scope.data.period = '';
            }
        
        /*var str = q.substring(position, q.length);
        console.log(str);
        str = str.split("_")[1];
        console.log(str);
        str = str.split(/'|}|]/);
        console.log(str)
        $scope.tmpReport = str[0];
        console.log($scope.tmpReport);*/
    }

    $scope.save = function($valid, data){
        // console.log(data);
        if($valid){
            var tmp = angular.copy(data);
            // tmp.reportArr = $scope.reportArr;
            tmp.period = tmp.duration + tmp.period;
            var email = [];
            for(var i=0 ; i<data.email.length; i++) {
              email.push(data.email[i].text);
            }
            tmp.email = email;
            delete tmp.duration;
            console.log(tmp);
            
            if( angular.isDefined($stateParams.id) && $stateParams.id != '' ){
                delete tmp._id;
                tmp.updateDate = new Date();
                var url = dbService.makeUrl({collection: 'reportschedule', op:'upsert', id: $stateParams.id});
                httpService.post(url, tmp).then(function (result){
                    $state.go('index.schedulelist');
                });
            }
            else{
                tmp.userId = $scope.userProfile.userId;
                tmp.createDate = new Date();
                tmp.updateDate = new Date();
                var url = dbService.makeUrl({collection: 'reportschedule', op:'create'});
                httpService.post(url, tmp).then(function (result){
                    $state.go('index.schedulelist');
                });
            }
        }
        else{
            $scope.submitted = true;
        }
    }

    $scope.hasError = function (field, validation) {
      if (validation && angular.isDefined($scope.myForm)) {
            var tmp = ($scope.myForm[field].$dirty && $scope.myForm[field].$error[validation]) || ($scope.submitted && $scope.myForm[field].$error[validation]);
            return tmp;
        }
        return ($scope.myForm[field].$dirty && $scope.myForm[field].$invalid) || ($scope.submitted && $scope.myForm[field].$invalid);
    };
});