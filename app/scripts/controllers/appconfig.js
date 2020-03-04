'use strict';

angular.module('specta')
  .controller('AppConfigCtrl', function ($scope, $state, $stateParams, globalConfig, SweetAlert, dbService, httpService, currentUser){
    
    $scope.currentUser = currentUser;
    $scope.data = {};
    function loadList(){
        // var url = dbService.makeUrl({collection: 'lku_app_signatures', op:'select'});
        var url = dbService.makeUrl({collection: 'lku_url_app', op:'select'});
        httpService.get(url).then(function (res){
            $scope.list = res.data;
            if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0){
                //$scope.getRecord($stateParams.id);
                $scope.data = dbService.unique($scope.list, '_id', $stateParams.id)[0];
                $scope.appsiteList = dbService.unique($scope.list, 'app', $scope.data.app);
                $scope.data.id = $scope.data._id;
                console.log($scope.data)
            }
        });
    }
    loadList();

    function segmentList(){
        var url = dbService.makeUrl({collection: 'lku_appsegment', op:'select'});
        httpService.get(url).then(function (res){
            $scope.segmentList = res.data;
        });
    }
    segmentList();

    $scope.getRecord = function(id){
        console.log(id);
        id= id.trim();
        if( id == undefined) $scope.data = {};
        else if(id == 'Create App') $scope.data = {id : 'Create App'};
        else{
            var tmpObj = dbService.unique($scope.list, '_id', id)[0];
            $scope.appsiteList = dbService.unique($scope.list, 'app', tmpObj.app);
            return;
            var data = dbService.unique($scope.list, '_id', id)[0];
            console.log('data', data);
            var sign = jQuery.parseJSON( atob(data.signature) )
            data.ip = sign.ip;
            data.url = sign.url;
            data.id = data._id;
            $scope.data = data;
        }
    }

    $scope.changeApplist = function(appsite, id){
        id = id.trim()
        appsite = appsite.trim();
        //$scope.data = dbService.unique($scope.list, 'appsite', appsite);
        $scope.data = _.filter($scope.list, function(item){
            return item.appsite == appsite;
        })[0]
        $scope.data.id = $scope.data._id;
        console.log($scope.data);
    }

    $scope.isUnique = function(name, form){
        name = name.trim();
        if(form == 'segment'){
            $scope.errMsgSegment = null;
            var test = dbService.unique($scope.segmentList, 'appsegment', name);
            if(test.length >0) $scope.errMsgSegment = 'Name already exits.';
        }
        else{
            $scope.errMsg = null;
            var test = dbService.unique($scope.list, 'app', name);
            if(test.length >0) $scope.errMsg = 'Name already exits.';
        }
    }

    $scope.changeAppsegment = function(appsegment){
        $scope.data.appsegmentid = dbService.unique($scope.segmentList, 'appsegment', appsegment)[0].appsegmentid;
    }

    $scope.save = function(tmpdata){
        var data = angular.copy(tmpdata);
        data.trackable = data.trackable ? 1 : 0;
        data.rank = Number(data.rank);
        
        var signature = JSON.stringify({ip : data.ip, url: data.url});
        var encryptedInfo = sjcl.encrypt("password", signature);
        // console.log('encryptedInfo', encryptedInfo)
        
        // var decryptedInfo = sjcl.decrypt("password", encryptedInfo);
        // console.log('decryptedInfo', decryptedInfo)
        // return;
        data.signature = encryptedInfo;
        // delete data.ip;
        // delete data.url;
        
        if($scope.errMsg == null){
            if( data.id != '' && data.id != 'Create App' ){
                var id = angular.copy(data.id);
                delete data.id;
                delete data._id;
                data.updateDate = new Date().getTime();
                var url = dbService.makeUrl({collection: 'lku_url_app', op:'upsert', id: id});
                httpService.post(url, data).then(function (response){
                    $state.go('index.appconfiglist');
                });
            }
            else{
                data.app = angular.copy(data.name);
                delete data.name;
                delete data.id;
                // data.createDate = new Date().getTime();
                // return;
                var url = dbService.makeUrl({collection: 'lku_url_app', op:'create'});
                httpService.post(url, data).then(function (response){
                });
                // data.App = data.app;
                // delete data.app;
                var obj = {App: data.app};
                var url = dbService.makeUrl({collection: 'lku_app', op:'create'});
                httpService.post(url+'&db=datadb', obj).then(function (response){
                    $state.go('index.appconfiglist');
                });
            }
        }
    }

    $scope.saveSegment = function(appSegment){
        if($scope.errMsgSegment == null){
            var url = dbService.makeUrl({collection: 'lku_appsegment', op:'create'});
            httpService.post(url, appSegment).then(function (response){
                $scope.appSegment = {};
                segmentList();
            });
        }
    }
});