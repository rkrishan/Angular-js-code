'use strict';

angular.module('specta')
  .controller('DNSConfigCtrl', function ($scope, $state, $stateParams, globalConfig, SweetAlert, dbService, httpService, currentUser){
    
    $scope.currentUser = currentUser;
    $scope.data = {};
    function loadList(){
        var url = dbService.makeUrl({collection: 'lku_dns_ip_list', op:'select'});
        httpService.get(url+'&db=datadb').then(function (res){
            $scope.list = res.data;
        });
    }
    loadList();

    $scope.isUnique = function(name){
        name = name.trim();
        $scope.errMsg = null;
        var tmpObj = dbService.unique($scope.list, 'ipv4', name);
        console.log(tmpObj);
        if(tmpObj.length > 0) $scope.errMsg = 'IPv4 already exits.';
    }

    $scope.isUniqueipv6 = function(name){
        $scope.errMsgipv6 = null;
        var tmpObj = _.filter($scope.list, function(item){
            return item.ipv6 == name
        });
        console.log(tmpObj);
        if(tmpObj.length > 0) $scope.errMsgipv6 = 'Ipv6 already exits.';
    }


    /*$scope.save = function(tmpdata){
        $scope.error = null;
        var data = angular.copy(tmpdata);
        if( (!data.ipv4 || data.ipv4 == '') && (!data.ipv6 || data.ipv6 == '') ){
            $scope.error = 'Please enter value of IPv4 or IPv6'
            return;
        }
        if($scope.errMsg == null && $scope.errMsgipv6 == null){
            console.log('data', data);
            if( $stateParams.id && $stateParams.id != '' ){
                data.updateDate = new Date().getTime();
                var url = dbService.makeUrl({collection: 'lku_dns_ip_list', op:'upsert', id: $stateParams.id});
                httpService.post(url, data).then(function (response){
                    // $state.go('index.dnsconfiglist');
                    $scope.cancle();
                });
            }
            else{
                // data.createDate = new Date().getTime();
                // data.userId = currentUser.userId;
                // return;
                var url = dbService.makeUrl({collection: 'lku_dns_ip_list', op:'create'});
                httpService.post(url+'&db=datadb', data).then(function (response){
                    // $state.go('index.dnsconfiglist');
                    $scope.cancle();
                });
            }
        }
    }*/

    $scope.save = function(tmpdata){
        console.log(tmpdata);
        var i = 0;
        var tmp = [];
        var data = angular.copy(tmpdata);
        data.type = data.type.toLowerCase()
        var total = (data.type == 'ipv4') ? 4 : 8
        for(var i = 0; i<total; i++){
            if(total == 8){
                if(data.value[i]){
                    if(data.value[i].length == 1) data.value[i] = '000'+data.value[i];
                    else if(data.value[i].length == 2) data.value[i] = '00'+data.value[i];
                    else if(data.value[i].length == 3) data.value[i] = '0'+data.value[i];
                }
                else
                    data.value[i] = '0000';
            }
            tmp.push( data.value[i] ? data.value[i].toLowerCase() : '000')
        }

        var obj = {
            ip: (data.type == 'ipv4') ? tmp.join('.') : tmp.join(':')
        }
        
        var tmpObj = dbService.unique($scope.list, 'ip', obj.ip)[0];
        console.log('tmpObj', tmpObj);
        if(tmpObj){
            swal('DNS already exists', obj.ip, 'error');
            return;
        }
        if( $stateParams.id && $stateParams.id != '' ){
            data.updateDate = new Date().getTime();
            var url = dbService.makeUrl({collection: 'lku_dns_ip_list', op:'upsert', id: $stateParams.id});
            httpService.post(url, obj).then(function (response){
                $scope.cancle();
            });
        }
        else{
            var url = dbService.makeUrl({collection: 'lku_dns_ip_list', op:'create'});
            httpService.post(url+'&db=datadb', obj).then(function (response){
                $scope.cancle();
            });
        }
    }

    $scope.cancle = function(){
        $state.go('index.systemconfig', {tab: 'dns'});
    }
});