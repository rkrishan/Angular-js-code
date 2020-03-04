'use strict';

angular.module('specta')
  .controller('CEIConfigCtrl', function ($scope, $timeout, $stateParams, $location, $http, $state, globalConfig, SweetAlert, ChartService, UserProfile, httpService, dbService){
    
    if (!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null){
        $state.go('login');
        return;
    }
    $scope.userProfile = UserProfile.profileData;
    $scope.data = {};
    $scope.rows = {
        lte: {latency: [0], throughput: [0]},
        utran: {latency: [0], throughput: [0]},
        geran: {latency: [0], throughput: [0]}
    };

    $scope.enabled = {
        lte: {latency: {0: true}, throughput: {0: true}},
        utran: {latency: {0: true}, throughput: {0: true}},
        geran: {latency: {0: true}, throughput: {0: true}}
    };
    
    var appName = null;
    if (angular.isDefined($stateParams.id) && $stateParams.id != null) {
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'ceiConfiguration', op:'select', params: params});
        httpService.get(url).then(function(response){
            appName = response.data[0].app;
            reArrangeData(response.data[0]);
        });
    }

    function reArrangeData(data){
        $scope.data = data;
        _.forEach($scope.data, function(item, key){
            if( typeof(item) == 'object'){
                //For Latency
                var letLength = Object.keys(item.latency.range).length;
                if( letLength > 1 ){
                    $scope.rows[key]['latency'] = [];
                    $scope.enabled[key]['latency'] = {};
                    for (var i = 0; i < letLength; i++) {
                        $scope.rows[key]['latency'].push(i);
                        if(i == letLength-1)
                            $scope.enabled[key]['latency'][i] = true;
                        else
                            $scope.enabled[key]['latency'][i] = false;
                    }
                }

                //For Throughput
                var len = Object.keys(item.throughput.range).length;
                if( len > 1 ){
                    $scope.rows[key]['throughput'] = [];
                    $scope.enabled[key]['throughput'] = {};
                    for (var i = 0; i < len; i++) {
                        $scope.rows[key]['throughput'].push(i);
                        if(i == len-1)
                            $scope.enabled[key]['throughput'][i] = true;
                        else
                            $scope.enabled[key]['throughput'][i] = false;
                    }
                }
            }
        });
    }

    function getAppList(){
        httpService.get(globalConfig.pulldataurlbyname + 'App Filter').then(function(response){
            $scope.appList = response.data;
        });
    }
    getAppList();

    var appAlredyExits = false;
    $scope.checkApp = function(app){
        console.log(appName, app);
        /*if(appName == app){
            appAlredyExits = false;
            return false;
        }*/

        //var fields = JSON.stringify(['app']);
        var query = JSON.stringify({'app': app});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'ceiConfiguration', op:'select', params: params});
        httpService.get(url).then(function(response){
            if(response.data.length > 0){
                reArrangeData(response.data[0]);
                appAlredyExits = true;
                //swal(app, "Loaded data for "+app+' app', "warning");
            }
            else{
                $scope.data.lte = {}
                $scope.data.utran = {}
                $scope.data.geran = {}
                $scope.data.minvolume = null;
                delete $scope.data.userId;
                delete $scope.data._id;
                delete $scope.data.createDate;
                appAlredyExits = false;
            }

        });
    }

    $scope.cancel = function (){
        $state.go('index.ceiconfiglist');
    }

    $scope.addField = function(which, lat_thr, item){
        //For clicked row change sign
        $scope.enabled[which][lat_thr][item] = false;

        var tmpRow = angular.copy(item);
        tmpRow = ++tmpRow;
        var key = $scope.rows[which][lat_thr].indexOf(tmpRow);
        if(key == -1){
            $scope.rows[which][lat_thr].push(tmpRow);
            $scope.enabled[which][lat_thr][tmpRow] = true;
        }
    }

    $scope.removeField = function(which, lat_thr, item){
        $scope.enabled[which][lat_thr][item] = true;
        
        var key = $scope.rows[which][lat_thr].indexOf(item);
        if(item == 0)
            $scope.rows[which][lat_thr].splice(1, $scope.rows[which][lat_thr].length);
        else
            $scope.rows[which][lat_thr].splice(key+1, $scope.rows[which][lat_thr].length);
    }

    $scope.save = function(data){
        // if(appAlredyExits){
        //     swal('', "App already exits", "error");
        //     return false;
        // }
        var flag = false;
        _.forEach(data, function(item, key){
            if(key == 'lte' || key == 'utran' || key == 'geran'){
                _.forEach(item, function(val, k){
                    _.forEach(val, function(val1, k1){
                        if( typeof(val1) == 'object'){
                            _.forEach(val1, function(val2, k2){
                                val2.from = parseFloat(val2.from);
                                val2.to = parseFloat(val2.to);
                                val2.cei = parseFloat(val2.cei);
                                if(val2.cei > 100){
                                    flag = true;
                                    warnignMsg(key, 'cei');
                                }
                            });
                        }
                        else
                            val.wt = parseFloat(val1);
                    });
                });
            }
            else if(key == 'minvolume')
                data.minvolume = parseFloat(item);
        });
        
        var lteSum = parseInt(data.lte.latency.wt) + parseInt(data.lte.throughput.wt);
        var utranSum = parseInt(data.utran.latency.wt) + parseInt(data.utran.throughput.wt);
        var geranSum = parseInt(data.geran.latency.wt) + parseInt(data.geran.throughput.wt);
        if(  lteSum != 100 ){
            warnignMsg('4G', null);
            flag = true;
        }
        else if(  utranSum != 100 ){
            warnignMsg('3G', null);
            flag = true;
        }
        else if(  geranSum != 100 ){
            warnignMsg('2G', null);
            flag = true;
        }

        if(flag)
            return false;

        if( angular.isDefined($scope.data._id)){
            var id = $scope.data._id;
            delete data._id;
            data.updatedDate = new Date();
            var url = dbService.makeUrl({collection: 'ceiConfiguration', op:'upsert', id: id});
            httpService.post(url, data).then(function (result){
                $state.go('index.ceiconfiglist');
            });
        }
        else{
            data.userId = $scope.userProfile.userId;
            data.createDate = new Date();
            var url = dbService.makeUrl({collection: 'ceiConfiguration', op:'create'});
            httpService.post(url, data).then(function (result){
                $state.go('index.ceiconfiglist');
            });
        }
    }

    function warnignMsg(param, cei){
        if(param == 'lte')
            param = '4G';
        else if(param == 'utran')
            param = '3G';
        else if(param == 'geran')
            param = '2G';

        if(cei){
            swal(param, "Latency CEI and throughput CEI could not be more then 100", "error");
        }
        else
            swal(param, "Sum of latency weightage and throughput weightage has to be 100", "error");
    }
});