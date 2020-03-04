'use strict';

angular.module('specta')
  .controller('ModuleNewCtrl', function($scope, $rootScope, $timeout, $location, $uibModal, globalConfig, $state, socket, SweetAlert, ChartService, UserProfile, dbService, httpService, currentUser, utility){
    
    if(currentUser.userType == 'user'){
        $state.go('index.main');
        return;
    }
    $scope.module = {};
    $scope.module.frequency = '0';
    $scope.module.color = '#676a6c';
    // $scope.module.clickable = true;
    $scope.loadStatementList = function(){
        var fields = JSON.stringify(["name", "type", "description", "statementId", "multiquery", 'eventPublish']);
        var sort = JSON.stringify({"name": 1});

        var where = {'dataSource': 'CEP'};
        // if(currentUser.userType != 'system administrator') where.visibility = true;
        var query = JSON.stringify(where);

        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.pushStatementList = response.data;
        });

        var where = {'dataSource': 'DB'};
        // if(currentUser.userType != 'system administrator') where.visibility = true;
        var query = JSON.stringify(where);

        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.pullStatementList = response.data;
        });

        var where = {'dataSource': 'DBPull'};
        // if(currentUser.userType != 'system administrator') where.visibility = true;
        var query = JSON.stringify(where);

        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.DBPullStatementList = _.filter(response.data, function(item){
                return item.multiquery == undefined || item.multiquery == false;
            });
        });

        var where = {'dataSource': 'DBStream'};
        // if(currentUser.userType != 'system administrator') where.visibility = true;
        var query = JSON.stringify(where);

        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.DBStreamStatementList = response.data;
        });

        var where = {'dataSource': 'Indicator'};
        // if(currentUser.userType != 'system administrator') where.visibility = true;
        var query = JSON.stringify(where);

        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.indicatorStatementList = response.data;
        });

        var fields = JSON.stringify(["name", "chartType", "libType", "nameSpace"]);
        var params = 'fields='+encodeURIComponent(fields) +'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'chartoptions', op:'select', params: params});
        httpService.get(url).then(function(response){
            // console.log("chartOptionsList", response.data);
            $scope.chartOptionsList = response.data;
        });

        //for redirect page file name
        //var query = JSON.stringify({'type': 'static'});
        var fields = JSON.stringify(["name"]);
        var params = 'fields='+encodeURIComponent(fields) +'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.dashboardPage = getFileName(response.data, 'dashboards', 'Dashboard');
        });

        var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.reportPage = getFileName(response.data, 'report', 'Report');
        });

        var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.analysisPage = getFileName(response.data, 'analysis', 'Analysis');
        });

        var url = dbService.makeUrl({collection: 'redirectionoption', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.redirectionPage = getFileName(response.data, 'redirectionoption', 'Redirection');
        });

        $timeout(function(){
            var multipleArrays = [$scope.dashboardPage, $scope.reportPage, $scope.analysisPage, $scope.redirectionPage];
            $scope.redirectionOption = [].concat.apply([], multipleArrays);

            $scope.stmntList = {
                pull : $scope.pullStatementList,
                push : $scope.pushStatementList,
                DBStream : $scope.DBStreamStatementList,
                DBPull : $scope.DBPullStatementList
            }
        }, 3000);
    }
    $scope.loadStatementList();

    $scope.checkName = function(name){
        if(name){
            name = name.trim()
            var query = JSON.stringify({'name': name});
            var fields = JSON.stringify(["name"]);
            var params = 'query=' + encodeURIComponent(query)+'&fields='+encodeURIComponent(fields);
            var url = dbService.makeUrl({collection: 'modules', op:'select', params: params});
            httpService.get(url).success(function(res){
                if(res.length){
                    swal(res[0].name, 'Name already exits', 'warning')
                    $scope.module.name = null;
                }
            })
        }
    }

    function getFileName(data, table, page){
        var tmp = [];
        _.forEach(data, function(value, key){
            tmp.push({'file': value.name, 'table': table, 'fileId': value._id, 'page': page });
        });
        return tmp;
    }
   
    $scope.moduleType = [
        /*{id: 'info_box', value: 'Info Box'},
        {id: 'simple_heading', value: 'Simple Heading'},
        {id: 'clickable', value: 'Clickable'},
        {id: 'data_ibox', value: 'Data Ibox'},*/
        {id: 'simple_ibox', value: 'Simple iBox'},
        {id: 'ibox_with_gauge', value: 'iBox with Gauge Chart'},
        {id: 'iBox_Multi_no_Header', value: 'iBox Multi no Header'},
        {id: 'simple_ibox_with_dual_data_point', value: 'Simple iBox with Dual Data'},
        {id: 'ibox_with_embeded_chart', value: 'iBox with Chart'},
        {id: 'simple_charts', value: 'Simple Chart'},
        {id: 'simple_table', value: 'Simple Table'},
        {id: 'table_with_search', value: 'Searchable Table'},
        {id: 'col_extended_table', value: 'Coulmn Extended Table'},
        {id: 'extended_table', value: 'Extended Table'},
        {id: 'gauge', value: 'Gauge'},
        {id: 'progress_bar', value: 'Progress Bar'},
        {id: 'multi_gauge', value: 'Multi Gauge'},
        {id: 'map', value: 'Map'},
        {id: 'custom', value: 'Custom'}
    ]
    
    $scope.labelArr = ['Minute', 'Hour', 'Today', 'Yesterday', 'Month']
    $scope.labelChange = function(label){
        $scope.module.labelColor = null;
        if(label){
            label = label.trim();
            if(label == 'Minute') $scope.module.labelColor = 'label label-success'
            else if(label == 'Hour') $scope.module.labelColor = 'label label-warning'
            else if(label == 'Today') $scope.module.labelColor = 'label label-info'
            else if(label == 'Yesterday') $scope.module.labelColor = 'label label-primary'
            else if(label == 'Month') $scope.module.labelColor = 'label label-danger'
        }

        console.log($scope.module)
    }
    //labelColor
    /*
        Minute:Blue
        Hour:Yellow
        Today:Cyan
        Yesterday:Green
        Month:Red
    ]*/
    $scope.dataType = [
        {id: 'push', name: 'CEP-Stream'},
        {id: 'DBStream', name: 'DB-Stream'},
        //{id: 'pull', name: 'DB-Push'},
        {id: 'DBPull', name: 'DB-Pull'}
    ];

    $scope.labelList = [
        {id: 'label label-success', name: 'Blue'},
        {id: 'label label-primary', name: 'Green'},
        {id: 'label label-info', name: 'Cyan'},
        {id: 'label label-warning', name: 'Yellow'},
        {id: 'label label-danger', name: 'Red'}
    ];

    $scope.frequencyList = [
        {id: '0', value: 'One Time'},
        {id: '1', value: '1 Min'},
        {id: '10', value: '10 Min'},
        {id: '20', value: '20 Min'}
    ];

    $scope.changeModuleType = function(type){
        // $scope.state = false;
        // For clickble
        if(type == 'custom'){
            $scope.state = false;
            $scope.module.clickable = false;
            //For Indicator
            $scope.module.indicator = false;
            $scope.isIndicatorCheck = false;
        }
    }

    $scope.changeDataType = function(dataType){
        if(dataType == 'pull')
            $scope.statementList = $scope.pullStatementList;
        else if(dataType == 'push')
            $scope.statementList = $scope.pushStatementList;
        else if(dataType == 'DBStream')
            $scope.statementList = $scope.DBStreamStatementList;
        else
            $scope.statementList = $scope.DBPullStatementList;


        console.log($scope.statementList.length);

        $scope.module.query = '';
        $scope.module.query2 = '';
        
        $scope.chartColumns = [];
        if( /ibox/.test($scope.module.type) ){
            $scope.module.kpi = '';
            $scope.module.kpi_1 = '';
            $scope.module.kpi_2 = '';
        }
    }

    // For Calling in multigauge.html
    $scope.changeDataType_2 = function(dataType){
        if(dataType == 'pull')
            $scope.statementList_1 = $scope.pullStatementList;
        else if(dataType == 'push')
            $scope.statementList = $scope.pushStatementList;
        else if(dataType == 'DBStream')
            $scope.statementList_1 = $scope.DBStreamStatementList;
        else
            $scope.statementList_1 = $scope.DBPullStatementList;


        console.log($scope.statementList.length);

        $scope.module.query = '';
        $scope.module.query2 = '';
        
        $scope.chartColumns = [];
        if( /ibox/.test($scope.module.type) ){
            $scope.module.kpi = '';
            $scope.module.kpi_1 = '';
            $scope.module.kpi_2 = '';
        }
    }


    $scope.changeiBox2DataType = function(dataType){
        if(dataType == 'pull')
            $scope.statementList2 = $scope.pullStatementList;
        else if(dataType == 'push')
            $scope.statementList2 = $scope.pushStatementList;
        else if(dataType == 'DBStream')
            $scope.statementList2 = $scope.DBStreamStatementList;
        else
            $scope.statementList2 = $scope.DBPullStatementList;

        $scope.module.query2 = '';
        $scope.columns2 = [];
        $scope.module.kpi2 = '';
    }

    $scope.changeiBoxWithChartDataType = function(dataType){
        if(dataType == 'pull')
            $scope.statementListIbox = $scope.pullStatementList;
        else if(dataType == 'push')
            $scope.statementListIbox = $scope.pushStatementList;
        else if(dataType == 'DBStream')
            $scope.statementListIbox = $scope.DBStreamStatementList;
        else
            $scope.statementListIbox = $scope.DBPullStatementList;

        $scope.module.queryKpi = '';
        $scope.columns = [];
        $scope.module.valueKpi = '';
    }

    $scope.changedStatement = function(data, statementId){
        console.log(data)
        console.log(statementId)
        if($scope.module.queryKpi)
            $scope.plotKpi = false;
        else
            $scope.plot = false;

        var filter = dbService.unique(data, 'statementId', statementId)[0];
        if(filter.eventPublish && filter.eventPublish == 'Combined'){
            if($scope.module.queryKpi)
                $scope.plotKpi = false;
            else
                $scope.plot = true;
        }
    }

    $scope.changedStatement_2 = function(data, statementId){
        console.log(data)
        console.log(statementId)
        if($scope.module.queryKpi)
            $scope.plotKpi = false;
        else
            $scope.plot = false;

        var filter = dbService.unique(data, 'statementId', statementId)[0];
        if(filter.eventPublish && filter.eventPublish == 'Combined'){
            if($scope.module.queryKpi)
                $scope.plotKpi = false;
            else
                $scope.plot = true;
        }
    }

    $scope.changedStatement2 = function(data, statementId){
        $scope.plot2 = false;
        var filter = dbService.unique(data, 'statementId', statementId)[0];
        if(filter.eventPublish && filter.eventPublish == 'Combined') $scope.plot2 = true;
    }

    $scope.cancel = function(){
        $state.go('index.modulelist');
    }

    $scope.save = function(item){
        var today = new Date();
        if( item.type == 'simple_charts' || item.type == 'ibox_with_embeded_chart' ){
            //if(item.chartType == "Line" || item.chartType == "MultiLine" || item.chartType == "Pie" || item.chartType == "Bar" || item.chartType == "Doughnut" || item.chartType == "PolarArea" || item.chartType == "Radar" || item.chartType == "StackedBar" || item.chartType == 'StackedBarHorizontal' || item.chartType == 'Scatter' || item.chartType == "Pyramid" || item.chartType == "Bubble"){
                
                var request = item;
                    /*'title' : item.title,
                    'type' : item.type,
                    'chartType' : item.chartType,
                    'name' : item.name,
                    'data' : item.data,
                    'labels' : item.labels,
                    'dataelement' : (item.dataelement) ? item.dataelement : globalConfig.dataelement,
                    'libType' : item.libType,
                    'options' : item.options,
                    'chartUnit' : item.chartUnit,
                    'chartUnitAdjustFlag' : item.chartUnitAdjustFlag,
                    'clickable' : item.clickable,
                    'clickableTooltip' : item.clickableTooltip,
                    'page' : item.page,
                    'yAxislabel' : item.yAxislabel
                };

                request.labelType = item.labelType;
                request.timeType = item.timeType;*/

                if( item.chartType == "Line" || item.chartType == "Bar" ){
                    request.series = $scope.lineChartSeriesOptionSelected;
                    request.lineColor = item.lineColor;
                }
                else if( item.chartType == "StackedBar" || item.chartType == 'StackedBarHorizontal' || item.chartType == "MultiLine" || item.chartType == "Bubble"){
                    request.series = item.series;
                    request.ySeries = item.ySeries;
                }
                else if( item.chartType == "Pie" || item.chartType == "Doughnut" || item.chartType == "PolarArea" || item.chartType == "Pyramid"){
                    request.series = item.chartData;
                    request.pieColor = item.pieColor;
                    if(item.dataFormat == 'individual'){
                        request.series = $scope.lineChartSeriesOptionSelected;
                    }
                }
                else if( item.chartType == "Radar" ){
                    request.series = $scope.radarChartSeriesOptionSelected;
                    //request.data = $scope.radarChartDataOptionSelected;
                }
                else if( item.chartType == 'Scatter' ){
                    request.series = $scope.scatterChartSeriesOptionSelected;
                    request.shape = item.shape;
                    //request.size = item.size;
                }
                else if(item.chartType == 'LinePlushBar'){
                    request.lineSeries = item.lineSeries;
                    request.lineUnit = item.lineUnit;
                    request.barSeries = item.barSeries;
                    request.barColor = item.barColor;
                    request.lineColor = item.lineColor;
                }
                else if(item.chartType == 'AreaRangeLine'){
                    request.fromSeries = item.fromSeries;
                    request.toSeries   = item.toSeries;
                    request.color      = item.color;
                }

            /*if( item.type == 'ibox_with_embeded_chart' ){
                request.label = item.label;
                request.labelColor = item.labelColor;
                request.dataKpi = item.dataKpi;
                request.queryKpi = item.queryKpi;
                request.valueKpi = item.valueKpi;
                request.remark = item.remark;
                request.dataDecimal = item.dataDecimal;
                request.unit = item.unit;
                request.unitAdjustFlag = item.unitAdjustFlag;
                request.indicator = item.indicator;
                request.indicatorTooltip = item.indicatorTooltip;
                request.indicatorQuery = item.indicatorQuery;
                request.danger = item.danger;

                if(item.dataKpi == 'DBPull')
                    request.frequencyKpi = item.frequencyKpi;
            }

            if(item.data == 'DBPull')
                request.frequency = item.frequency;

            request.query = item.query;*/

            if(item.type == 'ibox_with_embeded_chart')
                request.dataelement = request.dataelement || 2000
            
            request.createdDate = today;
            request.userId = currentUser.userId;
            var url = dbService.makeUrl({collection: 'modules', op:'create'});
            httpService.post(url, request).then(function(res){
                $state.go('index.modulelist');
            });
        }
        else if( item.type == 'simple_table' || item.type == 'table_with_search' || item.type == 'col_extended_table'){
            item.dataelement = (item.dataelement) ? item.dataelement : globalConfig.dataelement;
            if($scope.tableOtherColumnsSelected.length > 0)
                item.columns = $scope.tableOtherColumnsSelected;

            if($scope.tableTableIndicator.length > 0)
                item.indicator = $scope.tableTableIndicator;
            
            item.createdDate = today;
            delete item.color;
            item.userId = currentUser.userId;
            var url = dbService.makeUrl({collection: 'modules', op:'create'});
            httpService.post(url, item).then(function(res){
                $state.go('index.modulelist');
            });
        }
        else if(item.type == 'map'){
            var request = {
                'title' : item.title,
                'type' : item.type,
                'name' : item.name,
                'data' : item.data,
                'query': item.query,
                'mapType' : item.mapType
            };

            if(item.data == 'DBPull')
                request.frequency = item.frequency;

            if(item.mapType == 'simple'){
                request.dataValue = item.dataValue;
                request.shape = item.shape;
                request.color = item.color;
                request.infobox = item.infobox;
                
                if(item.infobox == true)
                    request.infoboxDataField = $scope.mapDataFieldSelected;

                if(item.shape == 'marker')
                    request.icon = item.icon;

                if(item.icon == 'custom'){
                    request.to = item.to;
                    request.from = item.from;
                    request.customIcon = item.customIcon;
                }
            }
            request.createdDate = today;
            request.userId = currentUser.userId;
            var url = dbService.makeUrl({collection: 'modules', op:'create'});
            httpService.post(url, request).then(function(res){
                $state.go('index.modulelist');
            });   
        }
        else if(item.type == ''){
            var request = {
                'title' : item.title,
                'type' : item.type,
                'tab' : item.tabname
            };
            request.createdDate = today;
            console.log('request', request);
            request.userId = currentUser.userId;
            return false;
            var url = dbService.makeUrl({collection: 'modules', op:'create'});
            httpService.post(url, request).then(function(res){
                $state.go('index.modulelist');
            });
        }
        else{
            //if(item.type == 'info_box') item.title = '-';

            item.createdDate = today;
            item.userId = currentUser.userId;
            var url = dbService.makeUrl({collection: 'modules', op:'create'});
            httpService.post(url, item).then(function(res){
                $state.go('index.modulelist');
            });
        }
    }

    $scope.changeDBpull = function(query){
        httpService.get(globalConfig.pullgetcolumn + query).then(function (response){
            $scope.columns = response.data;
        });
    }

    $scope.changeDBpull_2 = function(query){
        httpService.get(globalConfig.pullgetcolumn + query).then(function (response){
            $scope.columns_2 = response.data;

        });
    }

    $scope.validate = function(query){
        $scope.columns          = [];
        $scope.indicatorColumns = [];
        var _createStatement = JSON.stringify({
            requestId: 1,
            requestType: "LIST_STATEMENT",
            eplStatement: '',
            statementId: query,
        });
        socket.sendAdminRequest(_createStatement, function (response) {
            console.log('admin response: ', response);
            var res = JSON.parse(response);
            if (res.requestStatus == "0") { // success
                for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++) {
                    $scope.$apply(function(){
                        $scope.columns.push(res.statements[0].eventProperties[colCount].name);
                        $scope.indicatorColumns.push(res.statements[0].eventProperties[colCount].name);
                    })
                }
                console.log($scope.columns);
            }
            else {
                SweetAlert.swal({
                    title: "Statement not found in event server",
                    text: res.statusMessage,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {

                });
            }
        });
    }


    $scope.validate_2 = function(query){
        $scope.columns_2          = [];
        $scope.indicatorColumns = [];
        var _createStatement = JSON.stringify({
            requestId: 1,
            requestType: "LIST_STATEMENT",
            eplStatement: '',
            statementId: query,
        });
        socket.sendAdminRequest(_createStatement, function (response) {
            console.log('admin response: ', response);
            var res = JSON.parse(response);
            if (res.requestStatus == "0") { // success
                for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++) {
                    $scope.$apply(function(){
                        $scope.columns_2.push(res.statements[0].eventProperties[colCount].name);
                        $scope.indicatorColumns.push(res.statements[0].eventProperties[colCount].name);
                    })
                }
                console.log($scope.columns_2);
            }
            else {
                SweetAlert.swal({
                    title: "Statement not found in event server",
                    text: res.statusMessage,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {

                });
            }
        });
    }




    $scope.toggleIboxSeries = function () {
        $scope.indicatorColumns= _.filter($scope.columns, function (item) {
            return item != $scope.module.kpi;
        });
    };

    $scope.changeGaugeData = function(){
        $scope.module.gauge.query = '';
        $scope.module.gauge.kpi = '';
        $scope.columns2 = [];
    }

    $scope.validategauge = function(query, data){
        var obj = {
            data : $scope.module.gauge.data,
            query: query
        }
        validateStatement(obj);
    }

    $scope.validate2 = function(query){
        var obj = {
            data : $scope.module.data2,
            query: query
        }
        validateStatement(obj);
    }

    function validateStatement(data, index){
        $scope.indicatorColumns2 = [];
        $scope.columns2 = [];
        if(index) $scope.columnsMultiIbox[index] = [];
        if(data.data == 'push'){
            var _createStatement = JSON.stringify({
                requestId: 1,
                requestType: "LIST_STATEMENT",
                eplStatement: '',
                statementId: data.query,
            });
            socket.sendAdminRequest(_createStatement, function (response){
                var res = JSON.parse(response);
                if (res.requestStatus == "0") { // success
                    for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++) {
                        $scope.$apply(function() {
                            var name = res.statements[0].eventProperties[colCount].name;
                            if(index) $scope.columnsMultiIbox[index].push(name);
                            else{
                                $scope.columns2.push(name);
                                $scope.indicatorColumns2.push(res.statements[0].eventProperties[colCount].name);
                            }
                        });
                    }
                    if(index) console.log($scope.columnsMultiIbox[index]);
                    else console.log($scope.columns2);
                }
                else {
                    SweetAlert.swal({
                        title: "Statement not found in event server",
                        text: res.statusMessage,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {

                    });
                }
            });
        }
        else{
            httpService.get( globalConfig.pullgetcolumn + data.query ).then(function (res){
                console.log(res.data)
                if(res.data != 'null'){
                    if(index) $scope.columnsMultiIbox[index] = res.data;
                    else $scope.columns2 = res.data;
                }
            });
        }
    }

    $scope.toggleIboxSeries2 = function () {
        $scope.indicatorColumns2 = _.filter($scope.columns2, function (item) {
            return item != $scope.module.kpi2;
        });
    };

    $scope.changeLibType = function(libType, chartType){
        console.log(libType, chartType);
        //console.log($scope.chartOptionsList);
        $scope.chartOptions = _.filter($scope.chartOptionsList, function (item) {
            return item.chartType == chartType && item.libType == libType;
        });
        console.log($scope.chartOptions);
    }

    /* Chart options function*/
    $scope.lineChartSeriesOptionSelected = [];
    $scope.lineChartDataOptionSelected = [];

    $scope.barChartSeriesOptionSelected = [];
    $scope.barChartDataOptionSelected = [];

    $scope.radarChartSeriesOptionSelected = [];
    $scope.radarChartDataOptionSelected = [];

    $scope.scatterChartSeriesOptionSelected = [];
    $scope.scatterChartDataOptionSelected = [];

    $scope.validateChart = function(query){
        $scope.chartColumns = [];
        $scope.chartSeriesOptions = [];
        $scope.module.labels = '';
        $scope.module.labelType = '';
        if($scope.module.data == 'push'){
            var _createStatement = JSON.stringify({
                requestId : 1,
                requestType : "LIST_STATEMENT",
                statementId : query,
                eplStatement : ''
            });
            socket.sendAdminRequest(_createStatement, function (response) {
                var res = JSON.parse(response);
                console.log(response);
                if(res.requestStatus == "0"){ // success
                    for(var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++){
                        $scope.$apply(function(){
                            $scope.chartColumns.push(res.statements[0].eventProperties[colCount].name);
                        });
                    }
                    console.log($scope.chartColumns);
                }
                else{
                    SweetAlert.swal({
                        title: "Statement not found in event server",
                        text: res.statusMessage,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                        
                    });
                }
            });
        }
        else{
            httpService.get( globalConfig.pullgetcolumn + query ).then(function (res){
                $scope.chartColumns = res.data;
            });
        }
    }

    $scope.chartLabelSelected = function () {
        $scope.chartSeriesOptions = _.filter($scope.chartColumns, function (item) {
            return item != $scope.module.labels
        });
        $scope.barChartSeriesOptionSelected = [];
        $scope.lineChartSeriesOptionSelected = [];
        $scope.radarChartSeriesOptionSelected = [];
        $scope.scatterChartSeriesOptionSelected = [];
    }

    $scope.toggleLineChartSeries = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    };

    $scope.toggleBarChartSeries = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    };

    $scope.toggleRadarChartSeries = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    };

    $scope.toggleScatterSeries = function (item, list){
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    }
    /*Chart End*/

    $scope.tableOtherColumnsSelected = [];
    $scope.tableTableIndicator = [];

    $scope.validateTable = function (item) {
        $scope.tableColumns = [];
        if($scope.module.data == 'push'){
            var _createStatement = JSON.stringify({
                requestId: 1,
                requestType: "LIST_STATEMENT",
                statementId: item,
                eplStatement: ''
            });
            console.log("statement", _createStatement);
            socket.sendAdminRequest(_createStatement, function (response){
                var res = JSON.parse(response);
                if (res.requestStatus == "0") { // success
                    for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++) {
                        $scope.$apply(function() {
                            $scope.tableColumns.push({ name: res.statements[0].eventProperties[colCount].name });
                        });
                    }
                    console.log('Columns', $scope.tableColumns);
                }
                else {
                    SweetAlert.swal({
                      title: "Statement not found in event server",
                      text: res.statusMessage,
                      type: "warning",
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "Ok",
                      closeOnConfirm: true,
                      closeOnCancel: true
                    },
                    function (isConfirm) {

                    });
                }
            });
        }
        else{
            httpService.get( globalConfig.pullgetcolumn + item ).then(function (res){
                for (var colCount = 0; colCount < res.data.length; colCount++) {
                    $scope.tableColumns.push({ name: res.data[colCount] });
                }
            });
        }
    }

    $scope.tableLabelSelected = function () {
        $scope.tableOtherColumns = _.filter($scope.tableColumns, function (item) {
            return item.name != $scope.module.labels
        });
        $scope.tableOtherColumnsSelected = [];
        $scope.tableTableIndicator = [];
    }

    $scope.toggleTableColumns = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1){
            list.splice(idx, 1);
            $scope.tableTableIndicator.splice($scope.tableTableIndicator.indexOf(item.name), 1);
        }
        else list.push(item);

        $scope.module.percentage = '';
    };

    $scope.toggleTableIndicator = function (item, list) {
        console.log(item, list);
        var idx = list.indexOf(item.name);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item.name);
        console.log(item, list);
    };

    $scope.validateMap = function (item) {
        $scope.mapColumns = [];
        if($scope.module.data == 'push'){
            var _createStatement = JSON.stringify({
                requestId: 1,
                requestType: "LIST_STATEMENT",
                statementId: item,
                eplStatement: ''
            });
            socket.sendAdminRequest(_createStatement, function (response) {
                console.log('admin response: ', response);
                var res = JSON.parse(response);
                if (res.requestStatus == "0") { // success
                    for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++) {
                        $scope.$apply(function() {
                            $scope.mapColumns.push( {name : res.statements[0].eventProperties[colCount].name} );
                        });
                    }
                }
                else {
                    SweetAlert.swal({
                      title: "Statement not found in event server",
                      text: res.statusMessage,
                      type: "warning",
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "Ok",
                      closeOnConfirm: true,
                      closeOnCancel: true
                    },
                    function (isConfirm) {

                    });
                }
            });
        }
        else{
            httpService.get( globalConfig.pullgetcolumn + item ).then(function (res){
                for (var colCount = 0; colCount < res.data.length; colCount++) {
                    $scope.mapColumns.push( { name: res.data[colCount]} );
                }
            });
        }
    }

    $scope.mapDataSelected = function () {
        $scope.mapOtherColumns = _.filter($scope.mapColumns, function (item) {
            return item.name != $scope.module.latitude
        });
    }

    $scope.checkInfobox = function(item){
        $scope.dataField = item;
        if(item)
            $scope.mapDataFieldSelected = [];
    }

    $scope.isClickable = function(item){
        if(item)
            $scope.state = true;
        else
            $scope.state = false;
    }

    $scope.isIndicator = function(item){
        if(item)
            $scope.isIndicatorCheck = true;
        else
            $scope.isIndicatorCheck = false;
    }

    $scope.mapDataFieldSelected = [];
    $scope.toggleMapDataField = function (item, list) {
        var idx = list.indexOf(item.name);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item.name);
    };

    $scope.choices = [1];
    $scope.removeBtn = false;
    $scope.addItem = function(){
        var newItemNo = $scope.choices.length + 1;
        $scope.choices.push(newItemNo);
        if($scope.choices.length > 1)
            $scope.removeBtn = true;
    }

    $scope.removeItem = function(){
        $scope.choices.splice(-1);
        if($scope.choices.length == 1)
            $scope.removeBtn = false;
    }

    $scope.percentageCheck = function(item, percentage){
        console.log(percentage);
        if(percentage) $scope.module.percentage = item ;
        else $scope.module.percentage = '';

        // return true;
    }

    $scope.pietyChartColumn = function(statement, type){
        $scope.module.pietyColumn = '';
        $scope.pietyChartcolumns = [];
        if(statement != undefined && statement != ''){
            if(type == 'push'){
                var _createStatement = JSON.stringify({
                    requestId: 1,
                    requestType: "LIST_STATEMENT",
                    eplStatement: '',
                    statementId: statement
                });
                socket.sendAdminRequest(_createStatement, function (response){
                    var res = JSON.parse(response);
                    if(res.requestStatus == "0"){ // success
                        for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++){
                            $scope.$apply(function(){
                                $scope.pietyChartcolumns.push(res.statements[0].eventProperties[colCount].name);
                            });
                        }
                        console.log( $scope.pietyChartcolumns );
                    }
                    else {
                        SweetAlert.swal({
                            title: "Statement not found in event server",
                            text: res.statusMessage,
                            type: "warning",
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Ok",
                            closeOnConfirm: true,
                            closeOnCancel: true
                        },
                        function (isConfirm) {

                        });
                    }
                });
            }
            else{
                httpService.get( globalConfig.pullgetcolumn + statement ).then(function (res){
                    $scope.pietyChartcolumns = res.data;
                });
            }
        }
    }

    $scope.addModule = function (){
        var modalInstance = $uibModal.open({
            templateUrl: 'views/moduleoptions/multimodule.html',
            size: 'lg',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    };

    function ModalInstanceCtrl($scope, $uibModalInstance, globalConfig){
        $scope.cancel = function () {
            console.log('close');
            delete globalConfig.module;
            $uibModalInstance.dismiss('cancel');
        };
    }

    $scope.chartType = function(){
        var modalInstance = $uibModal.open({
            templateUrl: 'views/chartExample.html',
            size: 'md',
            controller: chartList,
            windowClass: "animated fadeIn",
            resolve: {
                type: function(){
                    return $scope.module.type
                }
            }
        });

        modalInstance.result.then(function (chart) {
            var options = _.filter($scope.chartOptionsList, function (item) {
                return item.nameSpace == chart.nameSpace;
            });
            console.log(options);
            $scope.module.chartType = null;
            $scope.module.libType   = null;
            $scope.selectedChart    = null;
            $scope.chartOptions     = null;
            $scope.module.options   = null;
            if(options.length == 0)
                SweetAlert.swal("No options!", "This chart have no options please select other chart.", "error");
            else{
                $scope.module.chartType = chart.chartType;
                $scope.module.libType = chart.libType;
                $scope.selectedChart = chart.title;
                console.log($scope.selectedChart);
                $scope.chartOptions = options;
                // console.log('$scope.chartOptions',$scope.chartOptions);
                $scope.module.options = options[0]['_id'];
                console.log($scope.module);
            }
        }, function(test){
            console.log('cancel modal');
            //cancel modal
        })
    }

    function chartList($scope, $uibModalInstance, type){
        console.log('test', type)

        var pie = [
            {title: 'Pie', chartType: 'Pie', nameSpace: 'highchart_pie', libType: 'highchart', image: 'highchart_pie.png'},
            {title: 'Pie with legend', chartType: 'Pie', nameSpace: 'highchart_pie_legend', libType: 'highchart', image: 'highchart_pie_legend.png'},
            {title: 'Donut', chartType: 'Pie', nameSpace: 'highchart_donut', libType: 'highchart', image: 'highchart_donut.png'},
            {title: 'Semi Circle', chartType: 'Pie', nameSpace: 'highchart_semi_circle', libType: 'highchart', image: 'highchart_semi_circle.png'}
        ]

        var line = [
            {title: 'Line', chartType: 'Line', nameSpace: 'highchart_line', libType: 'highchart', image: 'highchart_line.png'},
            {title: 'Multi Line', chartType: 'Line', nameSpace: 'highchart_line', libType: 'highchart', image: 'highchart_line_mulitseries.png'},
            {title: 'Line Area', chartType: 'Line', nameSpace: 'flot_line_area', libType: 'flot', image: 'flot_line_area.png'},
            {title: 'Line', chartType: 'Line', nameSpace: 'flot_line', libType: 'flot', image: 'flot_line.png'},
            {title: 'Area Range Line', chartType: 'AreaRangeLine', nameSpace: 'highchart_arearange_line', libType: 'highchart', image: 'highchart_arearange_line.png'}
        ]

        var bar = [
            {title: 'Bar', chartType: 'Bar', nameSpace: 'highchart_bar', libType: 'highchart', image: 'highchart_bar.png'},
            {title: 'Multi Bar', chartType: 'Bar', nameSpace: 'highchart_bar', libType: 'highchart', image: 'highchart_bar_multiseries.png'},
            {title: 'Line Plush Bar', chartType: 'LinePlushBar', nameSpace: 'line_plush_bar', libType: 'highchart', image: 'line_plush_bar.png'}
        ]

        var stackedbar = [
            {title: 'StackedBar', chartType: 'StackedBar', nameSpace: 'highchart_stackedbar_label', libType: 'highchart', image: 'highchart_stackedbar_label.png'},
            {title: 'StackedBar 100 Percent', chartType: 'StackedBar', nameSpace: 'highchart_stackedbar_100pct', libType: 'highchart', image: 'highchart_stackedbar_column_100pct2.png'},
            {title: 'StackedBar Day Wise', chartType: 'StackedBar', nameSpace: 'highchart_stackedbar_day', libType: 'highchart', image: 'highchart_stackedbar_day.png'},
            {title: 'StackedBar Group', chartType: 'StackedBar', nameSpace: 'highchart_stackedbar_groupby', libType: 'highchart', image: 'highchart_stackedbar_groupby.png'},
            {title: 'StackedBar Horizontal', chartType: 'StackedBarHorizontal', nameSpace: 'highchart_stackedbar_horizontal', libType: 'highchart', image: 'highchart-stackedBar_horizontal.png'}
        ]

        var bubble = [
            {title: 'Bubble', chartType: 'Bubble', nameSpace: 'highchart_bubble', libType: 'highchart', image: 'highchart_bubble.png'},
            {title: 'Scatter', chartType: 'Scatter', nameSpace: 'highchart_scatter', libType: 'highchart', image: 'highchart_scatter.png'},
            {title: 'Column Placement', chartType: 'ColumnPlacement', nameSpace: 'highchart_column_placement', libType: 'highchart', image: 'highchart_column_placement.png'}
        ]

        var clartlist = [];
        if(type == 'ibox_with_embeded_chart'){
            clartlist = {
                'pie' : pie,
                'line': _.filter(line, function(item){return ['Line', 'Line Area'].indexOf(item.title) > -1 }),
                'bar' : _.filter(bar, function(item){return 'Bar' == item.title || 'Multi Bar' == item.title})
            }
        }
        else{
            clartlist = {
                'pie'       : pie,
                'line'      : line,
                'bar'       : bar,
                'stackedbar': stackedbar,
                'bubble'    : bubble
            }
        }
        $scope.chartList = clartlist

        $scope.selectedChart = function(data){
            $uibModalInstance.close(data);
        };

        $scope.cancel = function (){
            console.log('$scope.cancel');
            $uibModalInstance.dismiss('cancel');
        }
    }

    //multi ibox setting
    $scope.multiArr = [1];
    $scope.columnsMultiIbox = {};

    $scope.multiIboxChangeDataType = function(data){
        data.query = '';
        data.kpi = '';
    }

    $scope.multiIboxValidate = function(data, index){
        data.kpi = '';
        console.log(data, index);
        validateStatement(data, index)
    }

    $scope.changePage = function(page){
        delete $scope.module.tab;
        $scope.tabList = '';
        var tbl = page.split('|');
        console.log(tbl);
        if(tbl[1] == 'analysis'){
            var pageR = dbService.unique($scope.redirectionOption, 'fileId', tbl[0])[0].file;
            pageR = pageR.split(' ');
            var str = '';
            for(var i in pageR){
                str += (i == 0) ? pageR[i].toLowerCase() : pageR[i].charAt(0).toUpperCase()+ pageR[i].slice(1);
            }
            $scope.tabList = utility.tb[str];
            console.log('tabList', $scope.tabList);
        }
    }

    $scope.changePage2 = function(page){
        delete $scope.module.tab2
        $scope.tabList2 = ''
        var tbl = page.split('|')
        console.log(tbl)
        if(tbl[1] == 'analysis'){
            var pageR = dbService.unique($scope.redirectionOption, 'fileId', tbl[0])[0].file;
            pageR = pageR.split(' ');
            var str = '';
            for(var i in pageR){
                str += (i == 0) ? pageR[i].toLowerCase() : pageR[i].charAt(0).toUpperCase()+ pageR[i].slice(1);
            }
            $scope.tabList2 = utility.tb[str]
            console.log('tabList 2', $scope.tabList2)
        }
    }

    $scope.onChangeSubscriberQuery = function(query){
        httpService.get( globalConfig.pullgetcolumn + query ).then(function (res){
            $scope.subscribersColumns = res.data;
            console.log('res', res);
        });
    }
})