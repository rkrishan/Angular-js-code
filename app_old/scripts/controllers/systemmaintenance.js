'use strict';

angular.module('specta')
.controller('SystemStatusCtrl', function ($scope, $state, $interval, globalConfig, SweetAlert, dbService, httpService, socket){
    
    $scope.isArray = angular.isArray;

    function systemmaintenance(){
        var url = dbService.makeUrl({collection: 'systemmaintenance', op:'select'});
        httpService.get(url).success(function (res){
            $scope.systemmaintenance = res[0];
            console.log('systemmaintenance', res[0]);
        });
    }
    systemmaintenance()

    var i = 0;
    function loadList(){
        //systemstatus
        
        // var query = JSON.stringify({'updatetime': 'New'});
        // var filter = 'sort='+encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'systemmodules', op:'select'});
        httpService.get(url).success(function (res){
            i = 0;
            // $scope.list = [];
            getDetail(res);
            // $scope.webserver     = dbService.unique(res, 'component', 'Web Server')[0];
            // console.log($scope.webserver)
            // $scope.eventInjector = dbService.unique(res, 'component', 'Event Injector')[0];
        });
    }
    loadList();

    $scope.$on('$destroy',function(){
        console.log('destroy');
        $interval.cancel(interval);
    });
    var interval = $interval(function(){
        loadList();
    }, 60*1000)

    $scope.list = [];
    function getDetail(res){
        if(!res[i]) return;
        var query = JSON.stringify({ 'component': res[i]['component'] });
        var sort = JSON.stringify({"_id": -1});
        var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'system_statistics', op:'select', params: params});
        httpService.get(url+'&limit=1&db=datadb').success(function (component){
            // console.log(component);
            if(component.length >0){
                component = component[0]
                component.action = res[i].action
                // var curnttt = new Date().getTime() + globalConfig.tzAdjustment;
                var curnttt = globalConfig.getLocalTime();
                console.log("curnttt", curnttt);
                var dataTime =  component.timems
                if( (curnttt - dataTime) > 60000){
                    component.status = 'notrunning';
                    component.style= {color: '#ed5565'};
                }
                else{
                    component.status = 'running';
                    component.style= {color: '#1ab394'};
                }
                var test = dbService.unique($scope.list, 'component', component.component)[0];
                if(test){
                    $scope.list[i] = component
                }
                else{
                    $scope.list.push(component)
                }
            }
            else{
                res[i].status = 'notrunning'
                res[i].style= {color: '#ed5565'}
                var test = dbService.unique($scope.list, 'component', res[i].component)[0];
                if(test) $scope.list[i] = res[i]
                else $scope.list.push(res[i])
            }
            i++;
            if(res[i]) getDetail(res)
            else{
                console.log('*************************', $scope.list);
            }
        });
    }

    $scope.loadStatus = function(url, action, component){
        SweetAlert.swal({
            title: component || '',
            text: "you want to "+action.toLowerCase()+"?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if(isConfirm){
                httpService.get(globalConfig.NListener +'?'+ url).success(function(res){
                    console.log(res);
                    if(res.status)
                        swal('', res.message, 'success');
                    else
                        swal('', res.message, 'error');

                        // swal('Something wrong', res.msg, 'error');
                })
            }
        })
    }

    /*socket.subscribe('bbc7df7cf9fda456Eabcdef0982645242127', function(res){
        var res = jQuery.parseJSON( res )['bbc7df7cf9fda456Eabcdef0982645242127']['content'];
        console.log(res);
        if(res.component == 'Event Injector'){
            console.log(res.data);
            for(var i in res.data){
                var data = res.data[i];
                _.filter($scope.eventInjector.data, function(item, key){
                    if(item.col == data.col){
                        console.log(item, data);
                        $scope.$apply(function(){
                            item.value = data.value;
                        });
                    }
                });
            }
        }
    });*/
});