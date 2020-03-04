'use strict';

angular.module('specta') 
    .controller('ModalInstanceCtrl', ModalInstanceCtrl);

function ModalInstanceCtrl($scope, $http, $uibModalInstance, globalConfig, httpService, dbService, collection){
    $scope.apiURL = globalConfig.dataapiurl;
    $scope.module = angular.copy(globalConfig.module);
    // console.log('$scope.module', $scope.module);
    console.log(globalConfig.module);
    if( $.isArray($scope.module.series) )
        $scope.module.series = $scope.module.series.join(',');

    if( $.isArray($scope.module.infoboxDataField) )
        $scope.module.infoboxDataField = $scope.module.infoboxDataField.join(',');

    var columns = [];
    if( $scope.module.columns ){
       _.forEach($scope.module.columns, function(value, key){
            //console.log(value);
            columns.push(value.name);
        });
        $scope.module.columns = columns.join(',');
    }
    /*
    created by
    */
    collection.createdUser($scope.module.userId, function(res){
        $scope.module.userId = res.name;
    });

    if( $scope.module.page){
        var split = $scope.module.page.split('|');
        var tmpId = split[0];
        var table = split[1];

        var query = '{_id: ObjectId("'+ tmpId +'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: table, op:'select', params: params});
        httpService.get(url).then(function(res){
            if(res.data.length == 0) $scope.redirectPage = 'Page not found';
            else{
                var res = res.data[0];
                if(angular.isDefined(res.file) && res.type == 'static' ){

                }
                else{
                    table = $scope.module.page.split('|')[1];
                    if(table != 'redirectionoption')
                        $scope.redirectPage = res.name +" | "+ table;
                    else
                        $scope.redirectPage = res.name + " | " + table+" | "+ res.page;
                }
            }

            if($scope.module.pageIbox && $scope.module.pageIbox == $scope.module.page)
                $scope.redirectPageIbox = $scope.redirectPage;
            else if($scope.module.pageIbox){
                var split = $scope.module.pageIbox.split('|');
                var tmpId = split[0];
                var table = split[1];

                var query = '{_id: ObjectId("'+ tmpId +'")}';
                var params = 'query=' + encodeURIComponent(query);
                var url = dbService.makeUrl({collection: table, op:'select', params: params});
                httpService.get(url).then(function(res){
                    if(res.data.length == 0) $scope.redirectPageIbox = 'Page not found';
                    else{
                        var res = res.data[0];
                        if(angular.isDefined(res.file) && res.type == 'static' ){

                        }
                        else{
                            table = $scope.module.pageIbox.split('|')[1];
                            if(table != 'redirectionoption')
                                $scope.redirectPageIbox = res.name +" | "+ table;
                            else
                                $scope.redirectPageIbox = res.name + " | " + table+" | "+ res.page;
                        }
                    }
                });
            }
        });
    }

    //Module Statement
    if($scope.module.query){
        statement($scope.module.query, function(statementName){
            $scope.module.statementName = statementName;
        })
    }

    if($scope.module.query2){
        statement($scope.module.query2, function(statementName){
            $scope.module.statementName2 = statementName;
        })
    }

    //For Gauge in ibox with gauge module
    if($scope.module.gauge && $scope.module.gauge.query){
        statement($scope.module.gauge.query, function(statementName){
            $scope.module.gauge.statementName = statementName;
        })
    }

    //For iBox Multi no Header
    if($scope.module.list){
        for(var i in $scope.module.list){
            var box = $scope.module.list[i];
                // console.log(box.query, 1)
            statement(box.query, function(statementName, i){
                // console.log(box.query, i)
                console.log(statementName, i)
            }, i)
        }
    }

    if($scope.module.queryKpi){
        statement($scope.module.queryKpi, function(statementName){
            $scope.module.statementNameKpi = statementName;
        })
    }

    //Chart option
    if($scope.module.options){
        var fields = JSON.stringify(["name"]);
        var query = '{_id: ObjectId("'+$scope.module.options+'")}';
        var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'chartoptions', op:'select', params: params});
        httpService.get(url).then(function(res){
            if(res.data.length > 0) $scope.module.options = res.data[0].name;
        });
    }

    //indicator option
    if($scope.module.indicatorQuery){
        statement($scope.module.indicatorQuery, function(statementName){
            $scope.module.indicatorQuery = statementName;
        })
    }

    //indicator option 2
    if($scope.module.indicatorQuery2){
        statement($scope.module.indicatorQuery2, function(statementName){
            $scope.module.indicatorQuery2 = statementName;
        })
    }

    function statement(statementId, cb, i){
        var query = JSON.stringify({'statementId': statementId});
        var fields = JSON.stringify(["name"]);
        var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                if(i){
                    $scope.module.list[i].statementName = res.data[0].name;
                    cb(res.data[0].name, i)
                }
                else cb(res.data[0].name);
            }
        });
    }

    $scope.moduleType = {
        'simple_ibox': 'Simple iBox',
        'iBox_Multi_no_Header': 'iBox Multi no Header',
        'simple_ibox_with_dual_data_point' : 'Simple iBox with Dual Data',
        'ibox_with_gauge' : 'iBox with Gauge Chart',
        'simple_ibox_with_trend': 'Simple iBox with Trend',
        'ibox_with_multiple_tabs' : 'iBox with Multiple Tabs',
        'ibox_with_embeded_chart': 'iBox with Chart',
        'simple_charts': 'Simple Chart',
        'simple_table': 'Simple Table',
        'col_extended_table': 'Coulmn Extended Table',
        'table_with_search' : 'Searchable Table',
        'gauge' : 'Gauge',
        'map' : 'Map'
    };

    $scope.colorType = {
        'label label-success': 'Blue',
        'label label-primary' : 'Green',
        'label label-info': 'Cyan',
        'label label-warning' : 'Yellow',
        'label label-danger': 'Red'
    };

    $scope.dataType = {
        'push' : 'CEP-Stream',
        'DBStream' : 'DB-Stream',
        'pull' : 'DB-Push',
        'DBPull' : 'DB-Pull'
    };

    $scope.frequencyList = {
        '0' : 'One Time',
        '1' : '1 Min',
        '10' :'10 Min',
        '20' :'20 Min'
    };

    $scope.iconList = {
        'mobile_blue' : 'Mobile - Blue',
        'mobile_cyan' : 'Mobile - Cyan',
        'mobile_green' : 'Mobile - Green',
        'mobile_orange' : 'Mobile - Orange',
        'mobile_red' : 'Mobile - Red',
        'tower_blue' : 'Tower Blue',
        'tower_red' : 'Tower Red',
        'tower_green' : 'Tower Green',
        'tower_black' : 'Tower Black',
        'tower_orange' : 'Tower Orange',
        'custom' : 'Custom'
    };

    $scope.dashboardList = [];
    var query = JSON.stringify({'components.component._id': $scope.module._id});
    var params = 'query=' + encodeURIComponent(query);
    var url = dbService.makeUrl({collection: 'pages', op:'select', params: params});

    httpService.get(url).then(function(res){
        //console.log(res.data);
        _.forEach(res.data, function(value, key){
            //console.log(value.dashboardId);
            var fields = JSON.stringify(["name"]);
            var query = '{_id: ObjectId("'+value.dashboardId+'")}';
            var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
            var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
            
            httpService.get(url).then(function(response){
                if(response.data.length > 0)
                    $scope.dashboardList.push({'dashboard': 'Analysis', 'name': response.data[0].name});
            });

            var url = dbService.makeUrl({collection: 'staging', op:'select', params: params});
            httpService.get(url).then(function(response){
                if(response.data.length > 0)
                    $scope.dashboardList.push({'dashboard': 'Staging', 'name': response.data[0].name});
            });

            var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
            httpService.get(url).then(function(response){
                if(response.data.length > 0)
                    $scope.dashboardList.push({'dashboard': 'Dashboard', 'name': response.data[0].name});
            });

            var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
            httpService.get(url).then(function(response){
                if(response.data.length > 0)
                    $scope.dashboardList.push({'dashboard': 'Report', 'name': response.data[0].name});
            });
            
            if(!$scope.$$phase) {
                $scope.$apply();
            }
        });
    });

    $scope.cancel = function () {
        //console.log('close');
        delete globalConfig.module;
        $uibModalInstance.dismiss('cancel');
    };
}