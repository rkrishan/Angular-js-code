'use strict';

angular.module('specta')
    .controller('DynamicCtrl', function ($scope, $rootScope, $location, $http, $state, $interval,filterService, $timeout,$sce, $stateParams, $filter, $uibModal, NgMap, globalData, globalConfig, ChartService, SweetAlert, UserProfile, socket, NgTableParams, httpService, dataFormatter, dbService, highchartProcessData){
    
    if (!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null)
        $state.go('login');

    $scope.userProfile  = UserProfile.profileData;
    $scope.apiURL       = globalConfig.dataapiurl;
    $scope.snapshoturl  = globalConfig.snapshoturl;
    $scope.tabLists     = [];
    $scope.newPage      = { name:'',components:[]};
    $scope.currentPage  = {name:'New Tab',components:[],active:false};
    $scope.dashboardId  = 0;
    $scope.previousPage = {};
    $scope.displaydata  = {};
    $scope.statements   = [];
    $scope.text = '';

    $scope.exportModule = function(component, type){
        console.log(component);
        //$('#{{component.component._id}}').tableExport({type:'pdf',escape:'false',tableName:'Handset wise Traffic'});
        $('#'+component._id).tableExport({type: type, pdfFontSize:'10', escape:'false', tableName: component.title});
    }

    $scope.exportChartToExcel = function(component, type){
        console.log(component);
        var tableArr = [];
        var label = component.component.labels;
        var series = component.options.series;
        for(var item in component.labeldata){
            var obj = {};
            obj[label] = component.labeldata[item];
            if(/line/.test(component.component.chartType) || /Line/.test(component.component.chartType)|| /Bar/.test(component.component.chartType)){
                for(var index in component.tempData){
                    var name = series[index].name;
                    obj[name] = component.tempData[index][item];
                }
            }
            else if(component.component.chartType == 'Pie'){
                obj[component.component.series] = component.tempData[item];
            }
            tableArr.push(obj);
        }
        
        if(type == 'excel')
            alasql('SELECT * INTO XLSX("'+component.component.title+'.xlsx",{headers:true}) FROM ?',[tableArr]);
        if(type == 'csv')
            alasql('SELECT * INTO CSV("'+component.component.title+'.csv",{headers:true}) FROM ?',[tableArr]);
    }

    $scope.expotNestedjsonObj= function(displayData, type) {
        console.log('displaydata expotNestedjsonObj');

        var component= displayData.component;
        var dataObj= displayData.rawData;
        var colNameDataArray= [], expData= [];

        if(/data/.test(component.colName)){
            component.colName= component.colName.substring(5);
        }
        if(/data/.test(component.rowData)){
            component.rowData= component.rowData.substring(5);
        }

        for(var i in dataObj){
            for(var j in dataObj[i].data){
                if(i==0){
                    colNameDataArray[j]= dataObj[i].data[j][component.colName]; 
                }
                else{
                    getColData(colNameDataArray, dataObj[i].data[j][component.colName], component.colName);
                }        
            }
        }

        for(var i in dataObj){
            var processedData= [], expObj= {};
            for(var j in colNameDataArray){
                var temp={};
                if(/Date/.test(component.colName)){
                    temp[component.colName]= $filter('date')( colNameDataArray[j], "yyyy-MM-dd");   
                }
                else{
                    temp[component.colName]= colNameDataArray[j];
                }
                temp[component.rowData] = '-';
                processedData[j]= temp;
            }
            for(j in dataObj[i].data){
                var item= dataObj[i].data[j][component.colName];
                var index= $.inArray(item, colNameDataArray);
                processedData[index][component.rowData]= parseFloat(dataObj[i].data[j][component.rowData]);
            }
            //console.log("processedData",processedData);
            expObj[component.rowName]= dataObj[i][component.rowName];
            for(i in processedData){
               expObj[processedData[i][component.colName]] = processedData[i][component.rowData]
            }
            expData.push(expObj);
        }
        //console.log("expData", expData);
        //var te=  [{a:1,b:1}, {a:2,b:2}, {a:3,b:3}];
        if(type == 'excel')
            alasql('SELECT * INTO XLSX("'+component.title+'.xlsx",{headers:true}) FROM ?',[expData]);
        if(type == 'csv')
            alasql('SELECT * INTO CSV("'+component.title+'.csv",{headers:true}) FROM ?',[expData]);
        //console.log(res);
    }
    
    $scope.exportSimplejsonObj= function(displayData, type) {
        console.log('displaydata exportSimplejsonObj');

        var component= displayData.component;
        var dataObj= displayData.rawData;
        if(type == 'excel')
            alasql('SELECT * INTO XLSX("'+component.title+'.xlsx",{headers:true}) FROM ?',[dataObj]);
        if(type == 'csv')
            alasql('SELECT * INTO CSV("'+component.title+'.csv",{headers:true}) FROM ?',[dataObj]);
        //console.log(res);
    }

    $scope.dataTableExport = function(component, type){
        $('#'+component._id).dataTable({ destroy: true, searching: false, 'bInfo': false, paging: false, order: [[2,'desc']]});
        $('#'+component._id).tableExport({type: type, pdfFontSize:'10',  escape:'false', tableName: component.title});
        $('#'+component._id).dataTable({ destroy: true, searching: false,'bInfo': false, 'bLengthChange': false, paging: true, order: [[2,'desc']]});
    }

    $scope.dataTableSelectedRow = function(component, row){
        //its working, data table selected row
        /*var test;
        var table = $('#'+component._id).DataTable();
        $('#'+component._id+' tbody').on( 'click', 'tr', function () {
            test = table.row(this).data();
        } );
        $timeout(function(){
            console.log('row', test);
        }, 100);*/

        var table = $scope.displaydata[component._id];
        var labelName = row[table.label]['value'];
        var params = {'Key': table.label, 'value': labelName};
        redirectToOtherPage(params, component);
    }

    $scope.sortableOptions = {
        connectWith: ".connectPanels",
        handler: ".ibox-title"
    };
    
    if(angular.isDefined($stateParams.id)){
        $scope.dashboardId = $stateParams.id;
        var pageName = $state.current.data.table;
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: pageName, op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.headerName = response.data[0].name;
            $state.current.data.currentPage = response.data[0].name;
            $scope.report = response.data[0];

            if( $scope.report.filter && $scope.report.filter.indexOf('date') > -1 ){
                var day = 24*parseInt($scope.report.day);
                var day = day*60*60*1000;
                var from = $filter('date')( new Date().getTime()- day, "yyyy-MM-dd");
                var to= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
                $scope.date= {"start":from, "end":to};
            }
            else if( $scope.report.filter && $scope.report.filter.indexOf('singleDatepicker') > -1 ){
                var day = 24*parseInt($scope.report.day);
                day = day*60*60*1000;
                var from = $filter('date')( new Date().getTime()- day, "yyyy-MM-dd");
                var to= $filter('date')( new Date().getTime()- day, "yyyy-MM-dd");
                $scope.date= {"start":from, "end":to};
            }
            else{
                // var from = $filter('date')( new Date().getTime()-24*60*60*1000 , "yyyy-MM-dd");
                var from = $filter('date')( new Date().getTime(), "yyyy-MM-dd");
                var to = $filter('date')( new Date().getTime() , "yyyy-MM-dd");
                $scope.date= {"start":from,"end":to};
            }

            if($scope.report.filter && $scope.report.filter.indexOf('location') > -1 )
                $scope.loadLocation();

            if( $scope.report.filter && $scope.report.filter.indexOf('device') > -1 )
                $scope.loadDevice();

            $('.input-daterange').datepicker({
                clearBtn:true,
                autoclose: true,
                assumeNearbyYear: true,
                format: "yyyy-mm-dd",
                startDate: '2016-06-03',
                endDate: "0d"
            });
            $('.input-daterange input').each(function (){
                $(this).datepicker('clearDates');
            });

            $scope.minDate= moment('2016-06-03');
            $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
        });
    }

    $scope.loadPages = function (){
        var query = JSON.stringify({ 'dashboardId': $stateParams.id });
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'pages', op:'select', params: params});
        httpService.get(url).then(function(response){
            if(angular.isDefined(response.data) && response.data.constructor === Array){
                $scope.tabLists = response.data;
            }

            if(response.data.length > 0)
                $scope.setCurrentPage(response.data[0]);
        });
    };
    $scope.loadPages();

    $scope.setCurrentPage = function (itemData){
        var item = angular.copy(itemData);
        var newArr = arrangeComponentWidthWise(item);
        item.components = newArr;
        $scope.previousPage = $scope.currentPage;
        $scope.currentPage = item;
        $scope.previousPage.active=false;
        item.active = true;
        
        unsubscribeData($scope.previousPage);
        $timeout(function(){
            $rootScope.$broadcast("DashboardPageAssigned", {currentPage:$scope.currentPage} );
        },100);
        $scope.displaydata = {};
        subscribeData($scope.currentPage);
    };

    function arrangeComponentWidthWise(item){
        var total = 0;
        var newArr = [];
        var newArray = [];
        var i = newArray.length;
        var totalComponenLen = item.components.length;
        _.forEach(item.components, function(value, key){
            total = total + parseInt(value.component.width);
            if(total <= 12){
                newArray.push( value );
                if(key == totalComponenLen - 1){
                    var test = jQuery.extend(true, [], newArray);
                    newArr.push(test);
                }
            }
            else{
                var test = jQuery.extend(true, [], newArray);
                newArr.push(test);
                total = parseInt(value.component.width);
                newArray = [];
                newArray.push(value);

                if(key == totalComponenLen - 1){
                    var test = jQuery.extend(true, [], newArray);
                    newArr.push(test);
                }
            }
        });
        return newArr;
    }

    $scope.$on('MovedToDifferentDashboard', function(event,arg){
        unsubscribeData(arg);
    });

    function backgroundUpdatePage(page){
        var request = JSON.stringify(page);
        var tmp = JSON.parse(request);
        delete tmp["_id"];
        delete tmp["active"];

        var url = dbService.makeUrl({collection: 'pages', op:'upsert', id: page._id});
        httpService.post(url, tmp).then(function(response){});
        /*$http.put(globalConfig.dataapiurl + '/pages/' + page._id, tmp).then(function (updateResponse) {
            console.log('update page response: ', updateResponse);
        });*/
    }

    $scope.removeComponent = function (component){
        var tempArr = [];
        _.forEach($scope.currentPage.components, function(item, k){
            _.forEach(item, function(value, key){
                if(value.component._id != component.component._id){
                    tempArr.push(value);
                }
            });
        });

        $scope.currentPage.components = tempArr;
        backgroundUpdatePage($scope.currentPage);
        $scope.currentPage.components = arrangeComponentWidthWise($scope.currentPage);
    };

    function unsubscribeData(item){
        angular.forEach(item.components, function(test, key){
            angular.forEach(test, function(value, key){
               unsubscribeForComponent(value);
            });
        });
    }

    function unsubscribeForComponent(component){
        if(angular.isDefined(component.component.query)){
            socket.unsubscribe(component.component.query);
        }
    }

    function subscribeData(page){
        var n=0;
        angular.forEach(page.components, function(test, key){
            angular.forEach(test, function(value, key){
                if( /ibox_with_embeded_chart/.test(value.componentType) ){
                    value.type = 'ibox_with_embeded_chart';
                }
                else if( /ibox/.test(value.componentType) ){
                    value.type = 'ibox';
                }
                else if( /chart/.test(value.componentType)){
                    value.type = 'chart';
                }
                else if( /table/.test(value.componentType)){
                    value.type = 'table';
                }
                else if( /map/.test(value.componentType)){
                    value.type = 'map';
                }
                else if( /gauge/.test(value.componentType)){
                    value.type = 'gauge';
                }
                else if( /info_box/.test(value.componentType)){
                    value.type = 'info_box';
                }
                else if(value.componentType == 'custom'){
                    $scope.displaydata[value.component.id] = {file : 'views/static/'+ value.component.file};
                }

                if(angular.isDefined(value.component.query)){
                   
                    var query = JSON.stringify({'statementId': value.component.query});
                    n++;
                    //console.log(n+"-query",query);
                    $timeout(function(){
                        //console.log(n+"timeout", new Date())
                        subscribeForAllComponent(value);
                    }, n*globalConfig.iboxTimeout);

                }
                else if(angular.isDefined(value.component.url) && value.component.url != ''){
                    var query = JSON.stringify({'statementId': value.component.query});
                    console.log("2-query",query);
                    subscribeForAllComponent(value);
                }
            });
        });
    }

    function subscribeForAllComponent(component){
        var fields = JSON.stringify(["type", "statementId", "eventPublish", "dataSource", 'dbPullType', 'name']);
        var query = JSON.stringify({'statementId': component.component.query});
        var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(res){
            //console.log('statement', component.component.title, res.data);
            component.component.statement = res.data[0];
            switch( component.type ){
                case "ibox":
                    subscribeIBox(component.component);
                    break;
                case "chart":
                    subscribeChart(component.component);
                    break;
                case "table":
                    if(component.component.type == 'col_extended_table')
                        subscribeComplexTable(component.component);
                    else
                        subscribeTable(component.component);
                    break;
                case "ibox_with_embeded_chart":
                    var fields = JSON.stringify(["options"]);
                    var query = '{_id: ObjectId("'+component.component.options+'")}';
                    var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
                    var url = dbService.makeUrl({collection: 'chartoptions', op:'select', params: params});
                    httpService.get(url).then(function(res){
                        component.component.chartOptions = getOption( res.data[0].options );
                        subscribeIboxWithChart(component.component);
                    });
                    break;
                case "map":
                    subscribeMap(component.component);
                    break;
                case "gauge":
                    subscribeGauge(component.component);
                    break;
                case "info_box":
                    subscribeInfoBox(component.component);
                    break;
            }
        });
    }

    function subscribeChart(component){
        var fields = JSON.stringify(["options"]);
        // console.log('fields', fields)
        var query = '{_id: ObjectId("'+component.options+'")}';
        // console.log('query', query);
        var params = 'query=' + encodeURIComponent(query)+'&fields='+encodeURIComponent(fields);
        // console.log('params', params);
        var url = dbService.makeUrl({collection: 'chartoptions', op:'select', params: params});
        httpService.get(url).then(function(res){
            component.chartOptions = getOption( res.data[0].options );
            if(component.libType === 'ChartJS'){
                switch(component.chartType){
                    case "Line":
                        subscribeChartBar(component);
                        break;
                    case "Bar":
                        subscribeChartBar(component);
                        break;
                    case "Radar":
                        subscribeChartBar(component);
                        break;
                    case "Pie":
                        subscribeChartPie(component);
                        break;
                    case "Doughnut":
                        subscribeChartPie(component);
                        break;
                    case "PolarArea":
                        subscribeChartPie(component);
                        break;
                    case "Map":
                        subscribeChartMap(component);
                        break;
                }
            }
            else if (component.libType === 'D3'){
                switch(component.chartType){
                    case "Pie":
                        subscribeD3PieChart(component); //Done
                        break;
                    case "Doughnut":
                        subscribeChartSingleSeriesD3(component); //Done
                        break;
                    case "Bullet":
                        subscribeChartSingleSeriesD3(component); //Done
                        break;
                    case "DiscreteBar":
                        subscribeChartSingleSeriesD3(component); //Done
                        break;
                    case "HorizontalBar":
                        subscribeChartSingleSeriesD3(component); //Done
                        break;
                    case "SparkLine":
                        subscribeChartSingleSeriesD3(component); //Done
                        break;
                    case "Scatter":
                        subscribeD3Scatter(component); //Done
                        break;
                    default:
                        subscribeChartMultiSeriesD3(component); //Line, CumulativeLine, StackedArea, LinePlusBar, Scatter, ScatterPlusLine
                        break;
                }
            }
            else if( component.libType === 'flot'){
                switch(component.chartType){
                    case "Line":
                        subscribeFlotChart(component);
                        break;
                    case "Bar":
                        subscribeFlotBarChart(component);
                        break;
                    case "Pie":
                        subscribeFlotPieChart(component);
                        break;
                }
            }
            else if( component.libType === 'highchart'){
                switch( component.chartType){
                    case "StackedBar":
                        subscribeStackedBarHighchart(component);
                        break;
                    case "StackedBarHorizontal":
                        subscribeStackedBarHighchart(component);
                        break;
                    case "Pyramid":
                        subscribePyramid(component);
                        break;
                    case "Pie":
                        subscribeSingleSeriesHighchart(component);
                        break;
                    case "MultiLine":
                        subscribeMultiLineHighchart(component);
                        break;
                    case "Bubble":
                        subscribeMultiLineHighchart(component);
                        break;
                    case "Scatter":
                        subscribeScatterHighchart(component);
                        break;
                    case "LinePlushBar":
                        subscribeLinePlushBarHighchart(component);
                        break;
                    default:
                        subscribeHighchart( component );
                        break;
                }
            }
        });
    }

    /*Map*/
        function subscribeMap(component){
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {
                    component : component,
                    loader:true,
                    data: [],
                    labeldata:[],
                    statement: $scope.statements[component.query],
                    updateTime: ''
                }

                if(component.mapType == 'simple'){
                    $scope.displaydata[component._id].mapOptions = {
                        center: {
                            latitude: null,
                            longitude: null
                       },
                       options:{
                           scrollwheel: false,
                           // Style for Google Maps
                           styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                           mapTypeId: google.maps.MapTypeId.ROADMAP
                       },
                       control: {
                           refresh: function(){}
                       },
                       zoom: 10,
                       size:{
                           height: '800px'
                       },
                       events:
                       { 
                           mouseover: function(marker, eventName, model)
                           {   
                               $scope.onHover(marker, eventName, model);
                           },
                           mouseout: function(marker, eventName, model)
                           {   
                               $scope.onHover(marker, eventName, model);
                           }
                       }
                   }
                }
                else if(component.mapType == 'heat'){
                    $scope.displaydata[component._id].mapOptions = {
                        center: {},
                        zoom: 6,
                        heatLayerCallback: function (layer) {
                            //set the heat layers backend data
                            var mockHeatLayer = new $scope.displaydata[component._id].mapOptions.MockHeatLayer(layer);
                        },
                        MockHeatLayer: function(heatLayer){},
                        showHeat: true
                    };
                }
            }

            $scope.onHover = function(marker, eventName, model) {
                model.show = !model.show;
            };

            if(component.data != 'DBPull'){
                var url = dbService.snapshotUrl({op:'select', limit: 10, id: component.query});
                httpService.get(url).then(function(res){
                    if(res.data.length == 0)
                        $scope.displaydata[component._id].loader = false;
                //$http.get(globalConfig.snapshoturl + component.query + '/10').then(function(res){
                    processSnapshotMap(component, res.data);
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        if( $scope.displaydata[component._id].statement.type == 'update' ){
                            mapUpdateData(component, data.event);
                        }
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function processSnapshotMap(component, data){
            _.forEach(data, function(value, key){
                if( $scope.displaydata[component._id].statement.type == 'update' ){
                    mapUpdateData(component, value);
                }
            });
        }

        function mapUpdateData(component, data){
            var map = $scope.displaydata[component._id];

            var tmp = {'population': Math.sqrt(data.Usage) * 100, 'position': [data.Latitude, data.Longitude]};
            var keyIndex = -1;
            _.forEach(map.data, function(val, key){
                if( val.position[0] == tmp.position[0] && val.position[1] == tmp.position[1] ){
                    keyIndex = key;
                    return false;
                }
            });
            console.log(keyIndex);
            if(  keyIndex > -1 ){
                var oldValue = map.data[keyIndex]['population'];
                var newValue = tmp.population;
                //map.data[keyIndex]['population'] = oldValue + newValue;
            }
            else{
                map.data.push( tmp );
            }
            console.log('map data', map.data);
        }
        
        function mapReplaceData(component, data1){
            //data1 = [ { "Count" : 843 , "CellId" : "404-53-3005-32201" , "latitude" : 30.7341 , "longitude" : 76.7784 , "Area" : "SCO-1048-49 SECT-22 B Chandigarh"} , { "Count" : 812 , "CellId" : "404-53-3006-32351" , "latitude" : 30.715 , "longitude" : 76.7379 , "Area" : "R.K Sales Corporation Shiv Mandir RoadVillage Kajheri Chandigarh"} , { "Count" : 792 , "CellId" : "404-53-3004-30623" , "latitude" : 30.7108 , "longitude" : 76.8313 , "Area" : "T.E. MANIMAJRA UT  CHD(3062)"} , { "Count" : 744 , "CellId" : "404-53-3004-30801" , "latitude" : 30.7469 , "longitude" : 76.7759 , "Area" : "SCF-10 Sec 16 Chandigarh"} , { "Count" : 626 , "CellId" : "404-53-3006-32251" , "latitude" : 30.7201 , "longitude" : 76.7693 , "Area" : "SCO-201-203 SECT-34 A Chandigarh"} , { "Count" : 624 , "CellId" : "404-53-3005-32482" , "latitude" : 30.7295 , "longitude" : 76.7709 , "Area" : "Bharat Coal Depot SCO-1048 Sec 22C Chandigarh"} , { "Count" : 622 , "CellId" : "404-53-3005-32211" , "latitude" : 30.7148 , "longitude" : 76.7891 , "Area" : "IETE SEC-30B Chandigarh"} , { "Count" : 604 , "CellId" : "404-53-3002-30471" , "latitude" : 30.749 , "longitude" : 76.6422 , "Area" : "T.E. KHARAR"} , { "Count" : 598 , "CellId" : "404-53-3006-32242" , "latitude" : 30.7228 , "longitude" : 76.7448 , "Area" : "SCF-49 SECT-42 C Chandigarh"} , { "Count" : 588 , "CellId" : "404-53-3004-32462" , "latitude" : 30.7573 , "longitude" : 76.7661 , "Area" : "Near Admn. Block Panjab University Chandigarh"}];
            var map = $scope.displaydata[component._id];
            if(component.mapType == 'heat'){
                var mapData = [];
                var center = data1.length/2;
                map.mapOptions.center = {latitude: data1[center]['latitude'] ,longitude: data1[center]['longitude']};
                $scope.heatMapData = []; //for ng-map
                //console.log("cnetre",map.mapOptions.center);
            }

            var mapcount = [];
            if( (angular.isDefined(map.statement) && map.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                map.data = [];
            }

            if(component.mapType == 'simple'){
                _.forEach(data1, function(data, key){
                    var info= "";
                    for(var i in component.infoboxDataField){
                        info= info+ component.infoboxDataField[i]+": "+data[component.infoboxDataField[i]]+", "+"<br />";
                    }

                    mapcount.push({
                        id: key,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        title: info,
                        //cellid: data[component.dataValue],
                        //date: $scope.date.end,
                        //area: data.Area,
                        // icon: colour,
                        options:{visible:true}
                    });
                });
                map.mapOptions.center = {latitude: mapcount[0]['latitude'], longitude: mapcount[0]['longitude']};
                map.mapOptions.marker = mapcount;

                _.forEach(data1, function(data, key){
                    var val = data[component.dataValue];
                    var icon = '';
                    if(component.shape == 'marker'){
                        if(component.icon == 'custom'){
                            _.forEach(component.to, function(v, k){
                                if( val >= component.from[k] && val < component.to[k]){
                                    icon = globalConfig.mapIcon+'/images/'+component.customIcon[k]+'.png';
                                    return false;
                                }
                            });
                        }
                        else{
                            icon = globalConfig.mapIcon+'/images/'+component.icon+'.png';
                            // console.log("icon called",icon);
                        }
                    }
                    else
                        val = Math.sqrt(val) * 100;

                    if(icon != ''){
                        var tmp = {'value': val,
                            'position': [data.latitude, data.longitude],
                            'infoBoxData': {},
                            'icon': icon};
                        _.forEach(component.infoboxDataField, function(v, k){
                            tmp.infoBoxData[v] = data[v];
                        });
                        var keyIndex = -1;
                        _.forEach(map.data, function(val, key){
                            if( val.position[0] == tmp.position[0] && val.position[1] == tmp.position[1] ){
                                keyIndex = key;
                                return false;
                            }
                        });
                        
                        if(  keyIndex > -1 ){
                            map.data[keyIndex]['value'] = tmp.value;
                        }
                        else{
                            map.data.push( tmp );
                        }
                    }
                });
            }
            else{
                _.forEach(data1, function(data, key){
                    $scope.heatMapData.push( new google.maps.LatLng(data.latitude, data.longitude) );
                    map.data.push( [data.latitude, data.longitude] );
                });
                map.mapOptions.MockHeatLayer = function(heatLayer){

                    for (var i = 0; i < data1.length; i++) {
                        mapData[i]= {location: new google.maps.LatLng(data1[i].latitude, data1[i].longitude), weight: i+1*10};
                    }

                    /*var taxiData = [
                        new google.maps.LatLng(37.782551, -122.445368),
                        new google.maps.LatLng(37.782745, -122.444586),
                        new google.maps.LatLng(37.782842, -122.443688),
                        new google.maps.LatLng(37.782919, -122.442815),
                        new google.maps.LatLng(37.782992, -122.442112),
                        new google.maps.LatLng(37.783100, -122.441461),
                        new google.maps.LatLng(37.783206, -122.440829),
                        new google.maps.LatLng(37.783273, -122.440324),
                        new google.maps.LatLng(37.783316, -122.440023),
                        new google.maps.LatLng(37.783357, -122.439794),
                        new google.maps.LatLng(37.783371, -122.439687)
                    ];*/

                    var pointArray = new google.maps.MVCArray(mapData);
                    heatLayer.setData(pointArray);
                }
            }
        }
        
        NgMap.getMap().then(function(map) {
            $scope.map = map;
        });

        $scope.$on('mapInitialized', function (event, map) {
            $scope.objMapa = map;
         });

        $scope.showDetail = function(evt, component, id){
            console.log("evt",evt);
            console.log("component",component);
            console.log("id",id);

            if(component.infobox){
                var map = $scope.displaydata[component._id];
                var latlng = map.data[id].position;
                $scope.infoBox = map.data[id].infoBoxData;

                var test = '';
                _.forEach($scope.infoBox, function(val, key){
                    test += '<label>'+key+' :</label>'+val+'<br>';
                });
                var infowindow = new google.maps.InfoWindow();
                var center = new google.maps.LatLng(latlng[0], latlng[1]);

                infowindow.setContent(test);

                infowindow.setPosition(center);
                infowindow.open($scope.objMapa);
            }
        }
    /*End Map*/

    /*Highchart*/
        //highchart bar
            function subscribeHighchart( component ){
                console.log("title",component.title);
                component.chartOptions.options.xAxis.title.text = component.labels;
                if(component.labelType == 'time'){
                    component.chartOptions.options.xAxis.type = 'datetime';
                    var formate = '';
                    var tooltip = '';
                    if(component.timeType == 'sec'){
                        formate = "{value:%H:%M:%S}";
                        tooltip = "%H:%M:%S";
                    }
                    else if( component.timeType == 'minute' ){
                        formate = "{value:%H:%M}";
                        tooltip = "%H:%M";
                    }
                    else if( component.timeType == 'hour' ){
                        formate = "{value:%H %p}";
                        tooltip = "%H %p";
                    }
                    else if( component.timeType == 'day' ){
                        formate = "{value:%e %b}";
                        tooltip = "%e %b";
                    }
                    component.chartOptions.options.xAxis.labels = {"format": formate};
                    component.chartOptions.options.tooltip = {'xDateFormat': tooltip, 'shared': true};
                }
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    loader: true,
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                if($scope.displaydata[component._id].options.options.yAxis.labels)
                    $scope.displaydata[component._id].options.options.yAxis.labels.formatter = function() {return Math.abs(this.value);}

                //Clickble
                if( component.page != '' && component.clickable == true ){
                    if( angular.isDefined( component.chartOptions.options.plotOptions.area ) ){
                        component.chartOptions.options.plotOptions.area.point = {
                            events:{
                                click: function (event) {
                                    var label = this.category;
                                    var params = {Key: component.chartUnit, Device: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                    else if( angular.isDefined( component.chartOptions.options.plotOptions.series ) ){
                        component.chartOptions.options.plotOptions.series.point = {
                            events:{
                                click: function (event) {
                                    var label = this.category;
                                    var params = {Key: component.chartUnit, Device: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                }

                for(var i = 0; i< component.series.length; i++){
                    if(component.lineColor)
                        $scope.displaydata[component._id].options.series.push({'name': component.series[i], color:component.lineColor[component.series[i]], "data":[]});
                    else
                        $scope.displaydata[component._id].options.series.push({'name': component.series[i], "data":[]});
                    $scope.displaydata[component._id].tempData.push([]);
                }
                
                if( component.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                            $scope.displaydata[component._id].loader = false;

                        processSnapshotHighchart(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'refresh' || component.statement.type === 'moving' )
                                highchartRefreshMoving(component, data.event);
                            else if( component.statement.type === 'update' )
                                highchartUpdateData(component, data.event);
                            else if( component.statement.type === 'replace' )
                                highchartReplaceData(component, data.event);
                            $scope.$apply();
                        });
                    });
                }
                else{
                    setTimeInterval(component);
                }
            }

            function processSnapshotHighchart(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart -> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    highchartReplaceData(component, data);
                }
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' || type === 'moving' )
                            highchartRefreshMoving(component, data[index]);
                        else if( type === 'update' )
                            highchartUpdateData(component, data[index]);
                    }
                }
            }

            function highchartRefreshMoving(component, data){
                var chartData = $scope.displaydata[component._id];

                if(component.labelType == 'time')
                    data[component.labels] += globalConfig.tzAdjustment;
                
                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                var tmp = [];
                if( keyindex > -1 ){
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];
                        chartData.options.series[seriesCount].data[keyindex] = data[component.series[seriesCount]];
                        tmp.push( data[component.series[seriesCount]] );
                    }
                }
                else{
                    chartData.labeldata.push( label );
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );
                        chartData.options.series[seriesCount].data.push( data[component.series[seriesCount]] );tmp.push( data[component.series[seriesCount]] );
                    }
                }
                var maxVal = Math.max.apply(null, tmp);
                var converted = countChartValue( component, maxVal );
                changeHighChartData(component, converted);
            }

            function highchartUpdateData(component, data){
                var chartData = $scope.displaydata[component._id];

                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        var oldValue = chartData.tempData[seriesCount][keyindex];
                        var newValue = data[component.series[seriesCount]];

                        var total = parseInt(oldValue) + parseInt(newValue);
                        chartData.tempData[seriesCount][keyindex] = total;
                        chartData.options.series[seriesCount].data[keyindex] = total;

                        var converted = countChartValue(component, total);
                        changeHighChartData(component, converted);   
                    }
                }
                else{
                    chartData.labeldata.push( label );
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );
                        chartData.options.series[seriesCount].data.push( data[component.series[seriesCount]] );

                        var converted = countChartValue(component, data[component.series[seriesCount]]);
                        changeHighChartData(component, converted);
                    }
                }
            }

            function highchartReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        chartData.options.series[seriesCount].data = [];
                        chartData.tempData[seriesCount] = [];
                    }
                }
                _.forEach(data1, function(data, key){
                    var label = data[component.labels];
                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];
                            chartData.options.series[seriesCount].data[keyindex] = data[component.series[seriesCount]];
                        }
                    }
                    else{
                        chartData.labeldata.push( label );
                        for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );
                            chartData.options.series[seriesCount].data.push( data[component.series[seriesCount]] );
                        }
                    }

                    if(data1.length == key + 1){
                        var tmp = [];
                        for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            var maxVal = Math.max.apply(null, chartData.tempData[seriesCount]);
                            tmp.push(maxVal);
                        }
                        var maxVal = Math.max.apply(null, tmp);
                        var converted = countChartValue( component, maxVal );
                        changeHighChartData(component, converted);
                    }
                });
            }

            function changeHighChartData(component, converted){
                var chartData = $scope.displaydata[component._id];
                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                if(chartData.labeldata.length > component.dataelement){
                    if(chartData.statement.type == 'moving'){
                        chartData.labeldata.shift();
                        for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                            chartData.options.series[seriesCount].data.shift();
                            chartData.tempData[seriesCount].shift();
                        }
                    }
                    else{
                        chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                            chartData.tempData[seriesCount] = chartData.tempData[seriesCount].splice(0, component.dataelement);
                            chartData.options.series[seriesCount].data = chartData.options.series[seriesCount].data.splice(0, component.dataelement);
                        }
                    }
                }
                chartData.updateTime = new Date();
                chartData.options.options.yAxis.title.text = converted.unit;
                chartData.options.options.xAxis.categories = chartData.labeldata;

                _.forEach(component.series, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                        var val = chartData.tempData[seriesCount][i];
                        val = getConvertedVal(val, converted.unit);
                        chartData.options.series[seriesCount].data[i] = Number(parseFloat(val).toFixed(1) );
                    }
                });
            }

        //Pie Chart
            function subscribeSingleSeriesHighchart( component ){
                if(angular.isDefined(component.height) ){
                    component.chartOptions.options.chart.height = component.height;
                }

                component.chartOptions.options.colors = highchartProcessData.colorpallete;//['#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263','#6AF9C4'];

                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    tempData:[],
                    loader:true,
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                
                //Clickble
                if( component.page != '' && component.clickable == true ){
                    if( component.chartType == "Pie" ){
                        component.chartOptions.series[0].point = {
                            events:{
                                click: function (event){
                                    var label = this.name;
                                    var params = {Key: component.chartUnit, value: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                }

                if( component.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if( res.data.length == 0)
                            $scope.displaydata[component._id].loader = false;
                        snapshotSingleSeriesHighchart(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'refresh' || component.statement.type === 'moving' ){
                                highchartSingleSeriesRefreshMoving(component, data.event);
                            }
                            else if( component.statement.type === 'replace' ){
                                highchartSingleSeriesReplace(component, data.event);
                            }
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotSingleSeriesHighchart(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Single Series-> ' + component.title +' == '+ type, component);
                if( type === 'replace'){
                    highchartSingleSeriesReplace(component, data);
                }
                else{
                    for(var index = 0; index < data.length; index++){
                        highchartSingleSeriesRefreshMoving(component, data[index]);
                    }
                }
            }

            function highchartSingleSeriesRefreshMoving(component, data){
                pushSingleSeriesHighchart(component, data);
                var converted = countChartValue( component, data[component.series] );
                changeSingleSeriesHighchartData(component, converted);
            }

            function highchartSingleSeriesReplace(component, data1){
                var chartData = $scope.displaydata[component._id];
                console.log('chartData', chartData)
                // console.log("data1", data1);
                //console.log("component.series",component.series);
                /*if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);*/

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];       
                    chartData.options.series[0].data = [];
                    chartData.tempData = [];
                }
                if(typeof(component.series) == 'object' && data1.length > 0){
                    chartData.labeldata = component.series;
                    for(var item in component.series){
                        if(angular.isDefined(component.pieColor) && angular.isDefined(component.pieColor[component.series[item]]) )
                            chartData.options.series[0].data[item]= {name: component.series[item], y: data1[data1.length-1][component.series[item]], color: component.pieColor[component.series[item]]};
                        else
                            chartData.options.series[0].data[item]= {name: component.series[item], y: data1[data1.length-1][component.series[item]]};
                    }
                    chartData.updateTime = new Date();
                }
                else{
                    _.forEach(data1, function(data, key){
                        pushSingleSeriesHighchart(component, data);
                        if(data1.length == key + 1){
                            var maxVal = Math.max.apply(null, chartData.tempData);
                            var converted = countChartValue( component, maxVal );
                            changeSingleSeriesHighchartData(component, converted);
                        }
                    });
                }
            }

            function pushSingleSeriesHighchart(component, data){
                var chartData = $scope.displaydata[component._id];
                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    chartData.tempData[keyindex] = data[component.series];
                    chartData.options.series[0].data[keyindex] = {name: label, y: data[component.series]};
                }
                else{
                    chartData.labeldata.push(label);
                    chartData.tempData.push( data[component.series] );
                    chartData.options.series[0].data.push({name: label, y: data[component.series]} );
                }
            }

            function changeSingleSeriesHighchartData(component, converted){
                var chartData = $scope.displaydata[component._id];

                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                chartData.updateTime = new Date();
                if(chartData.labeldata.length > component.dataelement){
                    if(chartData.statement.type == 'moving'){
                        chartData.labeldata.shift();
                        chartData.tempData.shift();
                        chartData.options.series[0].data.shift();
                    }
                    else{
                        chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                        chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                        chartData.options.series[0].data = chartData.options.series[0].data.splice(0, component.dataelement);
                    }
                }

                chartData.options.series[0].name = converted.unit;
                for(var i=0; i<chartData.tempData.length; i++){
                    var val = chartData.tempData[i];
                    val = getConvertedVal(val, converted.unit);
                    chartData.options.series[0].data[i].y = Number( parseFloat(val).toFixed(1));
                }
            }

        //MultiLine
            function subscribeMultiLineHighchart(component){
                //Clickble
                if( component.page != '' && component.clickable == true ){
                    if( component.chartType == 'MultiLine'){
                        component.chartOptions.options.plotOptions.spline.point = {
                            events:{
                                click: function (event) {
                                    console.log(this);
                                    console.log(this.options);
                                    var label = this.series.name;
                                    var params = {Key: component.chartUnit, value: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                }
                if(component.timeType == 'sec'){
                    component.chartOptions.options.xAxis.labels.format = "{value:%H:%M:%S}";
                    component.chartOptions.options.tooltip.xDateFormat = "%H:%M:%S";
                }
                else if( component.timeType == 'minute' ){
                    component.chartOptions.options.xAxis.labels.format = "{value:%H:%M}";
                    component.chartOptions.options.tooltip.xDateFormat = "%H:%M";
                }
                else if( component.timeType == 'hour' ){
                    component.chartOptions.options.xAxis.labels.format = "{value:%H %p}";
                    component.chartOptions.options.tooltip.xDateFormat = "%H %p";
                }
                else if( component.timeType == 'day' ){
                    component.chartOptions.options.xAxis.labels.format = "{value:%e %b}";
                    component.chartOptions.options.tooltip.xDateFormat = "%e %b";
                }
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    tempData:[],
                    loader:true,
                    series: [],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                if( component.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;
                        snapshotMultiLine(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'replace' )
                                highchartMultiLineReplace(component, data.event);
                            else
                                highchartMultilineMovingRefresh(component, data.event);
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotMultiLine(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Multi Line-> ' + component.title +' == '+ type);
                if( type === 'replace')
                    highchartMultiLineReplace(component, data);
                else{
                    for(var i=0; i<data.length; i++){
                        highchartMultilineMovingRefresh(component, data[i]);
                    }
                }
            }

            function highchartMultilineMovingRefresh(component, data){
                var chartData = $scope.displaydata[component._id];
                if(component.timeType = 'time')
                    data[component.labels] += globalConfig.tzAdjustment;

                var label = data[component.series];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    chartData.options.series[keyindex].data.push([ data[component.labels], data[component.ySeries] ]);
                    chartData.tempData[keyindex].push( data[component.ySeries] );
                }
                else{
                    chartData.labeldata.push(label);
                    var tmpData = [ [data[component.labels], data[component.ySeries]] ];
                    var len = chartData.options.series.length;
                    chartData.tempData[len] = [];
                    chartData.options.series.push({name: label.toString(), data: tmpData, marker: {enabled: false} });
                    chartData.tempData[len].push( data[component.ySeries] );
                }
                changeMultiLineValue(component);
            }

            function highchartMultiLineReplace(component, data1){
                var chartData = $scope.displaydata[component._id];

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.options.series = [];
                    chartData.tempData = [];
                    for(var seriesCount = 0; seriesCount < data1.length; seriesCount++){
                        if(component.dataelement)
                            data1[seriesCount].data = data1[seriesCount].data.splice(0, component.dataelement);

                        var data = [];
                        chartData.tempData[seriesCount] = [];
                        for(var i=0; i<data1[seriesCount].data.length; i++){
                            if(component.timeType = 'time')
                                data1[seriesCount].data[i][component.labels] += globalConfig.tzAdjustment;
                            
                            data.push([ data1[seriesCount].data[i][component.labels], data1[seriesCount].data[i][component.ySeries]]);
                            chartData.tempData[seriesCount].push( data1[seriesCount].data[i][component.ySeries] );
                        }
                        chartData.options.series.push({name: data1[seriesCount][component.series], data: data});
                        
                        if(data1.length == seriesCount + 1){
                            changeMultiLineValue(component);
                        }
                    }
                }
            }

            function changeMultiLineValue(component){
                var chartData = $scope.displaydata[component._id];

                if(chartData.tempData[0].length > parseInt(component.dataelement)){
                    for(var seriesCount = 0; seriesCount < chartData.tempData.length; seriesCount++) {
                        if(component.statement.type == 'moving'){
                            chartData.options.series[seriesCount].data.shift();
                            chartData.tempData[seriesCount].shift();
                        }
                        else{
                            chartData.options.series[seriesCount].data = chartData.options.series[seriesCount].data.splice(0, component.dataelement);
                            chartData.tempData[seriesCount] = chartData.tempData[seriesCount].splice(0, component.dataelement);
                        }
                    }
                }

                var tmp = [];
                for(var seriesCount = 0; seriesCount < chartData.tempData.length; seriesCount++) {
                    var maxVal = Math.max.apply(null, chartData.tempData[seriesCount]);
                    tmp.push(maxVal);
                }
                var maxVal = Math.max.apply(null, tmp);
                var converted = countChartValue( component, maxVal );

                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                chartData.updateTime = new Date();
                chartData.options.options.yAxis.title.text = converted.unit;
                
                _.forEach(chartData.tempData, function(value, seriesCount){
                    for(var i=0; i<value.length; i++){
                        var val = value[i];
                        val = getConvertedVal(value[i], converted.unit);
                        chartData.options.series[seriesCount].data[i][1] = Number(parseFloat(val).toFixed(1) );
                        if(component.chartType == 'Bubble')
                            chartData.options.series[seriesCount].data[i][2] = Number(parseFloat(val).toFixed(1) );
                        
                    }
                });
            }

        //stacked Bar
            function subscribeStackedBarHighchart( component ){
                if(component.labelType == 'time'){
                    component.chartOptions.options.xAxis.title.text = component.timeType;
                    component.chartOptions.options.xAxis.type = 'datetime';
                    var formate = '';
                    var tooltip = '';
                    if(component.timeType == 'sec'){
                        formate = "{value:%H:%M:%S}";
                        tooltip = "%H:%M:%S";
                    }
                    else if( component.timeType == 'minute' ){
                        formate = "{value:%H:%M}";
                        tooltip = "%H:%M";
                    }
                    else if( component.timeType == 'hour' ){
                        formate = "{value:%H %p}";
                        tooltip = "%H %p";
                    }
                    else if( component.timeType == 'day' ){
                        formate = "{value:%e %b}";
                        tooltip = "%e %b";
                    }
                    component.chartOptions.options.xAxis.labels = {"format": formate};
                    component.chartOptions.options.tooltip = {'xDateFormat': tooltip, 'shared': true};
                }
                else
                    component.chartOptions.options.xAxis.title.text = component.labels;

                //Clickble
                if( component.page != '' && component.clickable == true ){
                    component.chartOptions.options.plotOptions.column.cursor = 'pointer';    
                    component.chartOptions.options.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(this);
                                console.log(this.options);
                                var label = this.series.name;
                                var params = {Key: component.chartUnit, value: label};
                                redirectToOtherPage(params, component);
                            }
                        }
                    };
                }
                
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata: [],
                    loader:true,
                    tempData: [],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                
                if($scope.displaydata[component._id].options.options.yAxis.labels)
                    $scope.displaydata[component._id].options.options.yAxis.labels.formatter = function() {return Math.abs(this.value);}
                
                if( component.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if (res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;
                        snapshotStackedBarHighchart(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'replace' )
                                highchartStackedBarReplace(component, data.event);
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotStackedBarHighchart(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Stacked Bar -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    highchartStackedBarReplace(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                    }
                }
            }

            function highchartStackedBarReplace(component, data1){
                var chartData = $scope.displaydata[component._id];
                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.options.series = [];

                    var highest = 0;
                    var keyIndex;
                    $.each(data1, function(key, item) {
                        if (item[component.ySeries].length > highest){
                            highest = item[component.ySeries].length;
                            keyIndex = key;
                        }
                    });

                    for(var seriesCount = 0; seriesCount < data1[keyIndex][component.ySeries].length; seriesCount++){
                        chartData.options.series.push({name: data1[keyIndex][component.ySeries][seriesCount][component.ySeries].toString(), data: []});
                        chartData.tempData[seriesCount] = [];
                    }
                }
                
                _.forEach(data1, function(data, key){
                    var label = data[component.labels];
                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        for(var seriesCount = 0; seriesCount < chartData.options.series.length; seriesCount++) {
                            var test = _.filter(data[component.ySeries], function(item){
                                return item[component.ySeries] == chartData.options.series[seriesCount]['name'];
                            });
                            if(test.length > 0){
                                chartData.options.series[seriesCount].data[keyindex] = test[0][component.series];
                                chartData.tempData[seriesCount][keyindex] = test[0][component.series];
                            }
                        }
                    }
                    else{
                        chartData.labeldata.push( label );
                        for(var seriesCount = 0; seriesCount < chartData.options.series.length; seriesCount++) {
                            var test = _.filter(data[component.ySeries], function(item){
                                return item[component.ySeries] == chartData.options.series[seriesCount]['name'];
                            });
                            if(test.length > 0){
                                chartData.options.series[seriesCount].data.push(test[0][component.series]);
                                chartData.tempData[seriesCount].push( test[0][component.series] );
                            }
                        }
                    }

                    if(data1.length == key + 1){
                        var tmp = [];
                        for(var seriesCount = 0; seriesCount < chartData.tempData.length; seriesCount++) {
                            var maxVal = Math.max.apply(null, chartData.tempData[seriesCount]);
                            tmp.push(maxVal);
                        }
                        var maxVal = Math.max.apply(null, tmp);
                        var converted = countChartValue( component, maxVal );
                        if(component.chartUnit == 'percent')
                            converted.unit = '%';

                        changeStackedBarValue(component, converted);
                    }
                });
            }

            function changeStackedBarValue(component, converted){
                var chartData = $scope.displaydata[component._id];
                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                chartData.updateTime = new Date();
                chartData.options.options.yAxis.title.text = converted.unit;
                chartData.options.options.xAxis.categories = chartData.labeldata;

                _.forEach(chartData.tempData, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                        var val = chartData.tempData[seriesCount][i];
                        val = getConvertedVal( val, converted.unit );
                        chartData.options.series[seriesCount].data[i] = Number(parseFloat(val).toFixed(3) );
                    }
                });
            }

        //Pyramid
            function subscribePyramid( component ){
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    loader:true,
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                $scope.displaydata[component._id].options.series = [{name: component.labels, data:[]}];
                
                //Clickble
                if( component.page != '' && component.clickable == true ){
                    if( angular.isDefined( component.chartOptions.options.plotOptions.series ) ){
                        component.chartOptions.options.plotOptions.series.point = {
                            events:{
                                click: function (event) {
                                    var label = this.name;
                                    var params = {Key: component.chartUnit, Device: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                }

                if( component.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;
                        processSnapshotPyramid(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'replace' )
                                pyramidReplaceData(component, data.event);
                            else if( component.statement.type === 'refresh' )
                                pyramidRefreshData(component, data.event);
                            $scope.$apply();
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function processSnapshotPyramid( component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Pyramid -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    pyramidReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        pyramidRefreshData(component, data[index]);
                    }
                }
            }

            function pyramidRefreshData(component, data){
                pushPyramidData(component, data);
                var converted = countChartValue( component, data[component.series] );
                changePyramidValue(component, converted);
            }

            function pyramidReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                
                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.options.series[0].data = [];
                    chartData.tempData = [];
                }

                _.forEach(data1, function(data, key){
                    pushPyramidData(component, data);
                    if(data1.length == key + 1){
                        var maxVal = Math.max.apply(null, chartData.tempData);
                        var converted = countChartValue( component, maxVal );
                        changePyramidValue(component, converted);
                    }
                });
            }

            function pushPyramidData(component, data){
                var chartData = $scope.displaydata[component._id];
                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    chartData.tempData[keyindex] = data[component.series];
                    chartData.options.series[0].data[keyindex] = [ label, data[component.series] ];
                }
                else{
                    chartData.labeldata.push(label);
                    chartData.tempData.push(data[component.series]);
                    chartData.options.series[0].data.push([ label, data[component.series] ]);
                }
            }

            function changePyramidValue(component, converted){
                var chartData = $scope.displaydata[component._id];
                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                chartData.updateTime = new Date();
                if( chartData.labeldata.length > component.dataelement ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                    chartData.options.series[0].data = chartData.options.series[0].data.splice(0, component.dataelement);
                }

                chartData.options.options.title.text = converted.unit;
                for(var i = 0; i < chartData.tempData.length; i++) {
                    var val = chartData.tempData[i];
                    val = getConvertedVal(val, converted.unit);
                    chartData.options.series[0].data[i][1] = Number(parseFloat(val).toFixed(1) );
                }
            }
    
        //Scatter
            function subscribeScatterHighchart(component){
                if(component.labelType == 'time'){
                    component.chartOptions.options.xAxis.title.text = component.timeType;
                    component.chartOptions.options.xAxis.type = 'datetime';
                    var formate = '';
                    var tooltip = '';
                    if(component.timeType == 'sec'){
                        formate = "{value:%H:%M:%S}";
                        tooltip = "%H:%M:%S";
                    }
                    else if( component.timeType == 'minute' ){
                        formate = "{value:%H:%M}";
                        tooltip = "%H:%M";
                    }
                    else if( component.timeType == 'hour' ){
                        formate = "{value:%H %p}";
                        tooltip = "%H %p";
                    }
                    else if( component.timeType == 'day' ){
                        formate = "{value:%e %b}";
                        tooltip = "%e %b";
                    }
                    component.chartOptions.options.xAxis.labels = {"format": formate};
                    component.chartOptions.options.tooltip = {'xDateFormat': tooltip, 'shared': true};
                }
                else
                    component.chartOptions.options.xAxis.title.text = component.labels;
                
                //Clickble
                if( component.page != '' && component.clickable == true ){
                    component.chartOptions.options.plotOptions.scatter.point = {
                        events:{
                            click: function (event) {
                                console.log(this);
                                console.log(this.options);
                                var label = this.series.name;
                                var params = {Key: component.chartUnit, value: label};
                                redirectToOtherPage(params, component);
                            }
                        }
                    };
                }
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    loader:true,
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                if( component.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;
                        snapshotScatterHighchart(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'replace' )
                                highchartScatterReplace(component, data.event);
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotScatterHighchart(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Scatter-> ' + component.title +' == '+ type);
                if( type === 'replace')
                    highchartScatterReplace(component, data);
            }

            function highchartScatterReplace(component, data1){
                var chartData = $scope.displaydata[component._id];

                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.tempData = [];
                    chartData.options.series = [];
                    for(var seriesCount = 0; seriesCount<component.series.length; seriesCount++){
                        chartData.options.series.push({name: component.series[seriesCount], data: []});
                        chartData.tempData.push([]);
                    }
                }

                _.forEach(data1, function(data, key){
                    var label = data[component.labels];

                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        for(var seriesCount = 0; seriesCount<component.series.length; seriesCount++) {
                            chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];
                            chartData.options.series[seriesCount].data[keyindex] = [ label, data[component.series[seriesCount]] ];
                        }
                    }
                    else{
                        chartData.labeldata.push( label );
                        for(var seriesCount = 0; seriesCount<component.series.length; seriesCount++) {
                            chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );
                            chartData.options.series[seriesCount].data.push([ label, data[component.series[seriesCount]] ]);
                        }
                    }

                    if(data1.length == key + 1){
                        var tmp = [];
                        for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            var maxVal = Math.max.apply(null, chartData.tempData[seriesCount]);
                            tmp.push(maxVal);
                        }
                        var maxVal = Math.max.apply(null, tmp);
                        var converted = countChartValue( component, maxVal );
                        changeScatterHighChartData(component, converted);
                    }
                });
            }

            function changeScatterHighChartData(component, converted){
                var chartData = $scope.displaydata[component._id];
                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                chartData.updateTime = new Date();
                chartData.options.options.yAxis.title.text = converted.unit;

                _.forEach(chartData.tempData, function(value, seriesCount){
                    for(var i=0; i<value.length; i++){
                        var val = value[i];
                        val = getConvertedVal(value[i], converted.unit);
                        chartData.options.series[seriesCount].data[i][1] = Number(parseFloat(val).toFixed(1) );
                    }
                });
            }

        //LinePlushBar
            function subscribeLinePlushBarHighchart(component){
                component.barSeries = 'UpTraffic';
                component.chartUnit = 'usage';
                component.labels = 'Time';
                component.lineSeries = 'DownTraffic';
                component.labelType = 'time';
                component.timeType = 'minute';
                console.log(component);
                // console.log(component.chartOptions.options);
                component.chartOptions.options.xAxis[0].title.text = component.labels;
                component.chartOptions.series[0].name = component.barSeries;
                component.chartOptions.series[1].name = component.lineSeries;

                component.chartOptions.series[0].color = component.barColor;
                component.chartOptions.series[1].color = component.lineColor;
                if(component.labelType == 'time'){
                    component.chartOptions.options.xAxis[0].type = 'datetime';
                    var formate = '';
                    var tooltip = '';
                    if(component.timeType == 'sec'){
                        formate = "{value:%H:%M:%S}";
                        tooltip = "%H:%M:%S";
                    }
                    else if( component.timeType == 'minute' ){
                        formate = "{value:%H:%M}";
                        tooltip = "%H:%M";
                    }
                    else if( component.timeType == 'hour' ){
                        formate = "{value:%H %p}";
                        tooltip = "%H %p";
                    }
                    else if( component.timeType == 'day' ){
                        formate = "{value:%e %b}";
                        tooltip = "%e %b";
                    }
                    component.chartOptions.options.xAxis[0].labels = {"format": formate};
                    component.chartOptions.options.tooltip.xDateFormat = tooltip;
                }

                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    loader:true,
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                if( component.data != 'DBPull' ){
                    //'http://10.0.0.11:8080/JRServer/UISnapshot?op=select&id=aad79a81a46f99cd1bf13b456&limit=15'
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get('http://10.0.0.11:8080/JRServer/UISnapshot?op=select&id=aad79a81a46f99cd1bf13b456&limit=15').then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;

                        snapshotLinePlushBar(component, res.data);
                        /*socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'replace' )
                                highchartLinePlushBarReplace(component, data.event);
                        });*/
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotLinePlushBar(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Line Plush Bar-> ' + component.title +' == '+ type);
                if( type === 'replace')
                    highchartLinePlushBarReplace(component, data);
            }

            function highchartLinePlushBarReplace(component, data1){
                var chartData = $scope.displaydata[component._id];

                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.options.series[0].data = [];
                    chartData.options.series[1].data = [];
                    chartData.tempData[0] = [];
                    chartData.tempData[1] = [];
                }
                // console.log(chartData.options);

                _.forEach(data1, function(data, key){
                    var label = data[component.labels];

                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        chartData.options.series[0].data[keyindex] = data[component.barSeries];
                        chartData.options.series[1].data[keyindex] = data[component.lineSeries];
                        chartData.tempData[0][keyindex] = data[component.barSeries];
                        chartData.tempData[1][keyindex] = data[component.lineSeries];
                    }
                    else{
                        chartData.labeldata.push( label );
                        chartData.options.series[0].data.push(data[component.barSeries]);
                        chartData.options.series[1].data.push(data[component.lineSeries]);
                        chartData.tempData[0].push(data[component.barSeries]);
                        chartData.tempData[1].push(data[component.lineSeries]);
                    }

                    if(data1.length == key + 1){
                        chartData.options.options.xAxis[0].categories = chartData.labeldata;
                        var tmp = [];
                        for(var seriesCount = 0; seriesCount < chartData.tempData.length; seriesCount++) {
                            var maxVal = Math.max.apply(null, chartData.tempData[seriesCount]);
                            var converted = countChartValue( component, maxVal );
                            changeLinePlushBarValue(component, converted, seriesCount);
                        }
                    }
                });
                chartData.updateTime = new Date();
            }

            function changeLinePlushBarValue(component, converted, seriesCount){
                var chartData = $scope.displaydata[component._id];
                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                if(seriesCount == 0)
                    chartData.options.options.yAxis[seriesCount].title.text = component.barSeries+' - '+converted.unit;
                else
                    chartData.options.options.yAxis[seriesCount].title.text = component.lineSeries+' - '+converted.unit;

                    chartData.options.series[seriesCount].tooltip.valueSuffix = ' '+converted.unit;

                for(var i = 0; i<chartData.tempData[seriesCount].length; i++){
                    var val = chartData.tempData[seriesCount][i];
                    val = getConvertedVal(val, converted.unit);
                    chartData.options.series[seriesCount].data[i] = Number( parseFloat(val).toFixed(2) );
                }
            }
    /*End Highchart*/
    
    /*Embeded Chart*/
        function subscribeIboxWithChart(component){
            $scope.displaydata[component._id] = {
                component: component,
                kpi:'',
                labeldata: [],
                loader:true,
                dataset:[],
                tempData:[],
                dataIndex:[],
                statement: component.statement,
                options: component.chartOptions,
                updateTime: ''
            };
            if(component.libType == 'flot'){
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                    $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
                }
            }
            
            if(component.data != 'DBPull'){
                var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                httpService.get(url).then(function(res){
                    if(res.data.length == 0)
                        $scope.displaydata[component._id].loader = false;

                    if(component.libType == 'flot')
                        processSnapshotMultiSeriesFlot(component, res.data);

                    socket.subscribe(component.query, function(res){
                        var ibox = component;
                        var tmp = JSON.parse(res);
                        var data = tmp[ibox.query];
                        if($scope.displaydata[component._id]){
                            if( component.libType == 'flot' ){
                                if( component.statement.type === 'refresh' )
                                    processFlotChartMultiSeriesUpsertData(component, data.event);
                                else if( component.statement.type === 'moving' )
                                   processFlotChartMultiSeriesMovingData(component, data.event);
                                else if( component.statement.type === 'update' )
                                    processFlotChartMultiSeriesUpdateData(component, data.event);
                                else if( component.statement.type === 'replace' )
                                    processFlotChartMultiSeriesReplaceData(component, data.event);
                            }
                            else if( component.libType == 'ChartJs' ){
                                if( component.statement.type === 'refresh' )
                                    processChartMultiSeriesUpsertData(component,data.event);
                                else if( component.statement.type === 'moving' )
                                   processChartMultiSeriesMovingData(component, data.event);
                                else if( component.statement.type === 'update' )
                                    processChartMultiSeriesUpdateData(component, data.event);
                                else if( component.statement.type === 'replace' ){
                                    if( component.statement.eventPublish == 'Combined' ){
                                        $scope.displaydata[component._id].chartData.labeldata = [];
                                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                                            $scope.displaydata[component._id].data[seriesCount] = [];
                                        }
                                        _.forEach(data.event, function(value, key){
                                            processChartMultiSeriesReplaceData(component, value);
                                        });
                                    }
                                    else
                                        processChartMultiSeriesReplaceData(component, data.event);
                                }
                            }
                        }
                        if(!$scope.$$phase)
                            $scope.$apply();
                    });
                });
            }
            else
                setTimeInterval(component);

            if(component.dataKpi != 'DBPull'){
                var url = dbService.snapshotUrl({op:'select', id: component.queryKpi, limit: 1});
                httpService.get(url).then(function(res){
                    processIBoxWithChartSnapshotData(component, res.data);

                    socket.subscribe(component.queryKpi, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.queryKpi];
                        processIBoxWithChartData(component, data.event);
                        $scope.$apply();
                    });
                });
            }
            else
                setTimeInterval(component);
        }

        function processIBoxWithChartSnapshotData( component, data ){
            for(var index = 0; index < data.length; index++){
                processIBoxWithChartData(component, data[index]);
            }
        }

        function processIBoxWithChartData(component, data){
            if($scope.displaydata[component._id]){
                var iboxData = $scope.displaydata[component._id];
                if(component.unit == 'percent'){
                    iboxData.kpi = (data[component.valueKpi]).toFixed(component.dataDecimal);
                    iboxData.unit = '%';
                }
                else{
                    var newValue = countIBoxUnit( component, data[component.valueKpi] );
                    iboxData.kpi = (newValue.value) ? newValue.value.toFixed(component.dataDecimal) : newValue.value;
                    iboxData.unit = newValue.unit;
                }
                iboxData.updateTime = new Date();
                if(component.indicator)
                    getAndSetIndicatorIboxData(component, data, component.valueKpi);
            }
        }
    /*End Embeded Chart*/

    /*ChartJs*/
        //Bar
            function subscribeChartBar(component){
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata:[],
                    data:[],
                    loader:true,
                    tempData: [],
                    dataIndex:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime:''
                };
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].data.push([]);
                    $scope.displaydata[component._id].tempData.push([]);
                }
                if( component.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;

                        processSnapshotMultiSeries(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if($scope.displaydata[component._id]){
                                if( component.statement.type === 'refresh' )
                                    processChartMultiSeriesUpsertData(component,data.event);
                                else if( component.statement.type === 'moving' )
                                   processChartMultiSeriesMovingData(component, data.event);
                                else if( component.statement.type === 'update' )
                                    processChartMultiSeriesUpdateData(component, data.event);
                                else if( component.statement.type === 'replace' )
                                    processChartMultiSeriesReplaceData(component, data.event);
                                if(!$scope.$$phase)
                                    $scope.$apply();
                            }
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function processSnapshotMultiSeries(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Bar Chart Multi -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    processChartMultiSeriesReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            processChartMultiSeriesUpsertData(component, data[index]);
                        else if( type === 'moving' )
                            processChartMultiSeriesMovingData(component, data[index]);
                        else if( type === 'update' )
                            processChartMultiSeriesUpdateData(component, data[index]);
                    }
                }
            }

            function convertTimeStampToLabel( component, timestamp ){
                if( !component.timeType )
                    component.timeType = 'minute';

                var dt = new Date( timestamp );
                var seconds = dt.getSeconds();
                var minutes = dt.getMinutes();
                var hours = dt.getHours();
                var date = dt.getDate();
                var month = dt.getMonth() + 1;
                var year = dt.getFullYear();

                if( seconds < 10 ) seconds = '0' + seconds;
                if( minutes < 10 ) minutes = '0' + minutes;
                if( hours < 10 ) hours = '0' + hours;
                if( date < 10 ) date = '0' + date;
                if( month < 10 ) month = '0' + month;
                

                if( component.timeType == 'minute' ){
                    var label = hours + ':' + minutes;
                }
                else if( component.timeType == 'hour' ){
                    var label = date +'/' + month +'/'+ year + ' : ' + hours;
                }
                else if( component.timeType == 'day' ){
                    var label = date +'/' + month +'/'+ year;
                }
                return label;
            }

            function processChartMultiSeriesUpsertData(component, data){
                var chartData = $scope.displaydata[component._id];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var label = convertTimeStampToLabel( component, data[component.labels] );
                }
                else if( component.labelType == 'value' ){
                    var label = data[component.labels];
                }

                var keyindex = $.inArray( label, chartData.labeldata );
                if(keyindex > -1){
                    chartData.labeldata[keyindex] = label;
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        if( data[component.series[seriesCount]] ){
                            chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];

                            var converted = countChartValue( component, data[component.series[seriesCount]] );
                            //change value to KB/MB/GB
                            changeValueChartJs( component, seriesCount, converted );
                            chartData.updateTime = new Date();
                        }
                    }
                }
                else
                    pushDataForChartJs(component, data, label);
            }

            function processChartMultiSeriesMovingData(component, data){
                var chartData = $scope.displaydata[component._id];

                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = convertTimeStampToLabel( component, data[component.labels] );
                else if( component.labelType == 'value' )
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    chartData.labeldata[keyindex] = label;
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        if(data[component.series[seriesCount]]){
                            chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];

                            var converted = countChartValue( component, data[component.series[seriesCount]] );
                            //change value to KB/MB/GB
                            changeValueChartJs( component, seriesCount, converted );
                            chartData.updateTime = new Date();
                        }
                    }
                }
                else
                    pushDataForChartJs(component, data, label);
                
                if( chartData.labeldata.length > parseInt(component.dataelement) ){
                    chartData.labeldata.shift();
                    for( var seriesCount = 0; seriesCount < component.series.length; seriesCount++ ){
                        chartData.data[seriesCount].shift();
                        chartData.tempData[seriesCount].shift();
                    }
                }
            }

            function processChartMultiSeriesUpdateData(component, data){
                var chartData = $scope.displaydata[component._id];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = convertTimeStampToLabel( component, data[component.labels] );
                else if( component.labelType == 'value' )
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if(keyindex > -1){
                    chartData.labeldata[keyindex] = label;
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        if( data[component.series[seriesCount]] ){
                            var oldValue = parseInt( chartData.tempData[seriesCount][keyindex] );
                            var newValue = data[component.series[seriesCount]];
                            var converted = countChartValue( component, oldValue + newValue );
                            chartData.tempData[seriesCount][keyindex] =  parseInt(oldValue + newValue);
                            //change value to KB/MB/GB
                            changeValueChartJs( component, seriesCount, converted );
                            chartData.updateTime = new Date();
                        }
                    }
                }
                else
                    pushDataForChartJs(component, data, label);
            }

            function processChartMultiSeriesReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.data = [[]];
                    chartData.tempData = [[]];
                }

                _.forEach(data1, function(data, key){
                    if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                        var label = convertTimeStampToLabel( component, data[component.labels] );
                    else if( component.labelType == 'value' )
                        var label = data[component.labels];
                    var label = data[component.labels];
                    var keyindex = $.inArray( label, chartData.labeldata );
                    if(keyindex > -1){
                        chartData.labeldata[keyindex] = label;
                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            if( data[component.series[seriesCount]] ){
                                var converted = countChartValue( component, data[component.series[seriesCount]] );

                                chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];
                                //change value to KB/MB/GB
                                if( component.chartType != 'Bar' )
                                    changeValueChartJs( component, seriesCount, converted );
                                chartData.updateTime = new Date();
                            }
                        }
                    }
                    else
                        pushDataForChartJs(component, data, label);
                });

                if( component.chartType == 'Bar'){
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        var test = Math.max.apply(null, chartData.tempData[seriesCount]);
                        var converted = countChartValue( component, test );
                        changeValueChartJs(component, seriesCount, converted);
                    }
                }

                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.tempData[seriesCount] = chartData.tempData[seriesCount].splice(0, component.dataelement);
                        chartData.data[seriesCount] = chartData.data[seriesCount].splice(0, component.dataelement);
                    }
                }
            }

            function pushDataForChartJs(component, data, label){
                var chartData = $scope.displaydata[component._id];

                chartData.labeldata.push( label );
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    if( data[component.series[seriesCount]] ){
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );

                        if( component.chartType != 'Bar' ){
                            //change value to KB/MB/GB
                            changeValueChartJs( component, seriesCount, converted );
                        }
                        chartData.updateTime = new Date();
                    }
                    else{
                        var index = chartData.labeldata.indexOf( label );
                        if (index > -1)
                            chartData.labeldata.splice(index, 1);
                    }
                }
            }

            function changeValueChartJs(component, seriesCount, converted){
                var chartData = $scope.displaydata[component._id];
                chartData.options.yAxisLabel = converted.unit;

                for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                    var val = chartData.tempData[seriesCount][i];
                    if( converted.unit == "KB" )
                        val = val / Math.pow(2, 10);
                    else if( converted.unit == "MB" )
                        val = val / Math.pow(2, 20);
                    else if( converted.unit == "GB" )
                        val = val / Math.pow(2, 30);
                    else if( converted.unit == "TB" )
                        val = val / Math.pow(2, 40);
                    else if(converted.unit == "Kbps")
                        val = val / 1024;
                    else if(converted.unit == "Mbps")
                        val = (val / 1024) / 1024;
                    else if(converted.unit == "Mbps")
                        val = ( (val / 1024) / 1024 ) /1024;
                    chartData.data[seriesCount][i] = val;
                }
            }

            $scope.onClick= function(points, evt){
                console.log('test', points);
                console.log('activePoints', activePoints);
            }

        /*Pie Chart*/
            function subscribeChartPie(component){
                var colour = [{ // default
                    "fillColor": "#000",
                    "strokeColor": "rgba(207,100,103,1)",
                    "pointColor": "rgba(220,220,220,1)",
                    "pointStrokeColor": "#fff",
                    "pointHighlightFill": "#fff",
                    "pointHighlightStroke": "rgba(151,187,205,0.8)"
                }];
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata:[],
                    data:[],
                    loader:true,
                    tempData:[],
                    dataIndex:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    colour : colour
                };
                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;

                        processSnapshotSingleSeries(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if($scope.displaydata[component._id]){
                                if( component.statement.type === 'refresh' )
                                    processChartSingleSeriesUpsertData(component, data.event);
                                else if( component.statement.type === 'moving' )
                                    processChartSingleSeriesMovingData(component, data.event);
                                if( component.statement.type === 'update' )
                                    processChartSingleSeriesUpdateData(component, data.event);
                                else if( component.statement.type === 'replace' )
                                    processChartSingleSeriesReplaceData(component, data.event);
                            }
                            if(!$scope.$$phase)
                                $scope.$apply();
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function processSnapshotSingleSeries(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Bar Chart Single -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    processChartSingleSeriesReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            processChartSingleSeriesUpsertData(component, data[index]);
                        else if( type === 'moving' )
                            processChartSingleSeriesMovingData(component, data[index]);
                        else if( type === 'update' )
                            processChartSingleSeriesUpdateData(component, data[index]);
                    }
                }
            }

            function processChartSingleSeriesUpsertData(component, data){
                var chartData = $scope.displaydata[component._id];
                
                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if(keyindex > -1){
                    if( data[component.series] )
                        chartData.tempData[keyindex] = data[component.series];
                }
                else{
                    if( data[component.series] ){
                        chartData.labeldata.push( label );
                        chartData.data.push( data[component.series] );
                        chartData.tempData.push( data[component.series] );
                    }
                }
                
                if( chartData.labeldata.length > component.dataelement ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                    chartData.data = chartData.data.splice(0, component.dataelement);
                }
                if( data[component.series] ){
                    changeSingleSeriesData(component);
                    chartData.updateTime = new Date();
                }
            }

            function processChartSingleSeriesMovingData(component, data){
                var chartData = $scope.displaydata[component._id];
                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                
                if(keyindex > -1){
                    if( data[component.series] )
                        chartData.tempData[keyindex] = data[component.series];
                }
                else if( data[component.series] ){
                    chartData.labeldata.push( label );
                    chartData.data.push( data[component.series] );
                    chartData.tempData.push( data[component.series] );
                }
                
                if( chartData.labeldata.length > component.dataelement ){
                    chartData.labeldata.shift();
                    chartData.tempData.shift();
                    chartData.data.shift();
                }
                if( data[component.series] ){
                    changeSingleSeriesData(component);
                    chartData.updateTime = new Date();
                }
            }

            function processChartSingleSeriesUpdateData(component, data){
                var chartData = $scope.displaydata[component._id];
                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if(keyindex > -1){
                    if( data[component.series] ){
                        var oldValue = parseFloat( chartData.tempData[keyindex] );
                        var newValue = parseFloat( data[component.series] );
                        chartData.tempData[keyindex] = oldValue + newValue;
                    }
                }
                else if( data[component.series] ){
                    chartData.labeldata.push( label );
                    chartData.data.push( data[component.series] );
                    chartData.tempData.push( data[component.series] );
                }
                
                if( chartData.labeldata.length > component.dataelement ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                    chartData.data = chartData.data.splice(0, component.dataelement);
                }
                if( data[component.series] ){
                    changeSingleSeriesData(component);
                    chartData.updateTime = new Date();
                }
            }

            function processChartSingleSeriesReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.data = [];
                    chartData.tempData = [];
                }

                _.forEach(data1, function(data, key){
                    var label = data[component.labels];
                    var keyindex = $.inArray( label, chartData.labeldata );
                    if(keyindex > -1)
                        chartData.tempData[keyindex] = data[component.series];
                    else if( data[component.series] ){
                        chartData.labeldata.push( label );
                        chartData.data.push( data[component.series] );
                        chartData.tempData.push( data[component.series] );
                    }

                    if(key == data1.length-1){
                        if( chartData.labeldata.length > component.dataelement ){
                            chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                            chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                            chartData.data = chartData.data.splice(0, component.dataelement);
                        }
                        changeSingleSeriesData(component);
                    }
                });
                chartData.updateTime = new Date();
            }

            $scope.chartDataNew = [];
            function doughnutDataElement (t,c,h,l) {
                this.value = t;
                this.color = c;
                this.highlight = h;
                this.label = l;
            }

            function changeSingleSeriesData(component){
                var chartData = $scope.displaydata[component._id];
                var test = Math.max.apply(null, chartData.tempData);
                var converted = countChartValue( component, test );
                var colors = [ "rgba(151,187,205,1)", "rgba(220,220,220,1)", "rgba(247,70,74,1)", "rgba(70,191,189,1)", 
                                "rgba(253,180,92,1)", "rgba(148,159,177,1)", "rgba(77,83,96,1)", "#B6B6B6" , 
                                "#212121", "#FFC107", "#D32F2F", "#7C4DFF"];
                for(var i = 0; i < chartData.tempData.length; i++) {
                    var val = chartData.tempData[i];
                    if( converted.unit == "KB" )
                        val = val / Math.pow(2, 10);
                    else if( converted.unit == "MB" )
                        val = val / Math.pow(2, 20);
                    else if( converted.unit == "GB" )
                        val = val / Math.pow(2, 30);
                    else if( converted.unit == "TB" )
                        val = val / Math.pow(2, 40);

                    //$scope.chartDataNew[i] = new doughnutDataElement(toFixeValue( val ), colors[i], '#dedede', "Label"+i);
                    //chartData.data[i] = toFixeValue(val);
                    chartData.data[i] = val;
                }
            }
        /*End Pie Chart*/
    /*END ChartJs*/

    /*D3 Chart*/
        //D3 Scatter
            function subscribeD3Scatter(component){
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    loader:true,
                    tick:[],
                    tempData:[],
                    data: [],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                $scope.displaydata[component._id].options.chart.tooltip.contentGenerator = function(d){ console.log(d)};
                $scope.displaydata[component._id].options.chart.xAxis.axisLabel = component.labels;
                $scope.displaydata[component._id].options.chart.xAxis.tickFormat = function(d){return d3.format('.02f')(d);};
                $scope.displaydata[component._id].options.chart.yAxis.tickFormat = function(d){return d3.format('.02f')(d);};

                for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                    $scope.displaydata[component._id].data.push( {key: component.series[seriesCount], values: []} );
                    $scope.displaydata[component._id].tempData.push( {key: component.series[seriesCount], values: []} );
                }

                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;
                        snapshotD3Scatter(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            var statementType = $scope.displaydata[component._id].statement.type;
                            if( statementType === 'refresh')
                                multiSeriesD3UpsertData(component, data.event);
                            else if( statementType === 'moving' )
                               multiSeriesD3MovingData(component, data.event);
                            else if( statementType === 'update' )
                                multiSeriesD3UpdateData(component, data.event);
                            else if( statementType === 'replace' )
                                scatterD3ReplaceData(component, data.event);
                            $scope.$apply();
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotD3Scatter(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('D3 Scatter -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    scatterD3ReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            scatterD3UpsertData(component, data[index]);
                        else if( type === 'moving' )
                            scatterD3MovingData(component, data[index]);
                        else if( type === 'update' )
                            scatterD3UpdateData(component, data[index]);
                    }
                }
            }

            function scatterD3ReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        chartData.data[seriesCount].values = [];
                        chartData.tempData[seriesCount].values = [];
                    }
                }
                if(data1.length > 0){
                    for(var i = 0; i<data1.length; i++){
                        var data = data1[i];
                        if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                            var xLabel = data[component.labels];
                        else if( component.labelType == 'value' )
                            var xLabel = data[component.labels];
                        
                        var label = data[component.labels];
                        var keyindex = $.inArray( label, chartData.labeldata );
                        if( keyindex > -1 ){
                            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                                chartData.data[seriesCount].values[keyindex].y = data[component.series[seriesCount]];
                                chartData.tempData[seriesCount].values[keyindex].y = data[component.series[seriesCount]];
                            }
                        }
                        else{
                            chartData.labeldata.push(label);
                            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                                var shape = component.shape[component.series[seriesCount]];
                                chartData.data[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]], shape: shape, size:Math.random()} );
                                chartData.tempData[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );
                            }
                        }
                    }

                    if(chartData.labeldata.length > component.dataelement){
                        chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                        for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                            chartData.data[seriesCount].values = chartData.data[seriesCount].values.splice(0, component.dataelement);
                            chartData.tempData[seriesCount].values = chartData.tempData[seriesCount].values.splice(0, component.dataelement);
                        }
                    }
                    changeD3ScatterValue( component );
                }
            }

            function changeD3ScatterValue(component){
                var chartData = $scope.displaydata[component._id];
                var tmp = [];
                for (var seriesCount = 0; seriesCount<component.series.length; seriesCount++){
                    _.forEach(chartData.tempData[seriesCount].values, function(val, key){
                        tmp.push(val.y);
                    });
                }
                var maxVal = Math.max.apply(null, tmp);
                var converted = countChartValue( component, maxVal );
                chartData.options.chart.yAxis.axisLabel = converted.unit;
                
                _.forEach(component.series, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].values.length; i++) {
                        var val = chartData.tempData[seriesCount].values[i].y;
                        val = getConvertedVal(val, converted.unit);
                        chartData.data[seriesCount].values[i].y = parseFloat(toFixeValue( val ) );
                    }
                });
                chartData.api.refresh();
            }

        //D3 multi series
            function subscribeChartMultiSeriesD3(component){
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    tick:[],
                    loader:true,
                    tempData:[],
                    data: [],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                $scope.displaydata[component._id].options.chart.xAxis.axisLabel = component.labels;
                $scope.displaydata[component._id].options.chart.x = function(d) { return d.x; };
                $scope.displaydata[component._id].options.chart.y = function(d) { return d.y; };
                
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    if( component.timeType == 'sec' )
                        var timeFormate = '%H:%M:%S';
                    else if( component.timeType == 'minute' )
                        var timeFormate = '%H:%M';
                    else if( component.timeType == 'hour' )
                        var timeFormate = '%I';
                    else if( component.timeType == 'day' )
                        var timeFormate = '%x';

                    $scope.displaydata[component._id].options.chart.xAxis.tickFormat = function(d){ return d3.time.format(timeFormate)(new Date(d) ) };
                }
                else{
                    $scope.displaydata[component._id].options.chart.xAxis.tickValues = $scope.displaydata[component._id].tick;
                    $scope.displaydata[component._id].options.chart.xAxis.tickFormat = function(d){return $scope.displaydata[component._id].labeldata[d]};
                }
                //For click on chart and get value
                var chart = $scope.displaydata[component._id];
                var dispatch = {
                    elementClick: function(event){
                        console.log(event);
                        var label;
                        _.forEach(event, function(value, key){
                            var val = value.point.y;
                            var x = value.point.x;
                            label = chart.labeldata[x];
                        });
                        var params = {'Key': component.chartUnit, 'Device': label};
                        redirectToOtherPage(params, component);
                    }
                };
                if(component.chartType == 'Line')
                    chart.options.chart.lines = {dispatch: dispatch};
                else if(component.chartType == 'Bar')
                    chart.options.chart.bars = {dispatch: dispatch};

                for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                    $scope.displaydata[component._id].data.push( {key: component.series[seriesCount], values: []} );
                    $scope.displaydata[component._id].tempData.push( {key: component.series[seriesCount], values: []} );
                }
                
                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function (res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;

                        snapshotMultiSeriesD3(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            var statementType = $scope.displaydata[component._id].statement.type;
                            if( statementType === 'refresh')
                                multiSeriesD3UpsertData(component, data.event);
                            else if( statementType === 'moving' )
                               multiSeriesD3MovingData(component, data.event);
                            else if( statementType === 'update' )
                                multiSeriesD3UpdateData(component, data.event);
                            else if( statementType === 'replace' )
                                multiSeriesD3ReplaceData(component, data.event);
                            $scope.$apply();
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotMultiSeriesD3(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Bar Chart Single -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    multiSeriesD3ReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            multiSeriesD3UpsertData(component, data[index]);
                        else if( type === 'moving' )
                            multiSeriesD3MovingData(component, data[index]);
                        else if( type === 'update' )
                            multiSeriesD3UpdateData(component, data[index]);
                    }
                }
            }

            function multiSeriesD3UpsertData(component, data){
                var chartData = $scope.displaydata[component._id];

                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var xLabel = data[component.labels];
                else if( component.labelType == 'value' )
                    var xLabel = chartData.labeldata.length;

                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                
                if( keyindex > -1 ){
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        chartData.data[seriesCount].values[keyindex].y = data[component.series[seriesCount]];
                        chartData.tempData[seriesCount].values[keyindex].y = data[component.series[seriesCount]];
                    }
                }
                else{
                    chartData.tick.push(xLabel);
                    chartData.labeldata.push(label);
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        chartData.data[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );
                        chartData.tempData[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );
                    }
                }

                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.tick = chartData.tick.splice(0, component.dataelement);
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        chartData.data[seriesCount].values = chartData.data[seriesCount].values.splice(0, component.dataelement);
                        chartData.tempData[seriesCount].values = chartData.tempData[seriesCount].values.splice(0, component.dataelement);
                    }
                }
                changeMultiSeriesValueD3Chart( component );
            }

            function multiSeriesD3MovingData(component, data){
                var chartData = $scope.displaydata[component._id];

                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var xLabel = data[component.labels];
                else if( component.labelType == 'value' )
                    var xLabel = chartData.labeldata.length;
                
                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        chartData.data[seriesCount].values[keyindex].y = data[component.series[seriesCount]];
                        chartData.tempData[seriesCount].values[keyindex].y = data[component.series[seriesCount]];

                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        changeValueD3Chart(component, seriesCount, converted);
                    }
                }
                else{
                    chartData.tick.push(xLabel);
                    chartData.labeldata.push(label);
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        chartData.data[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );
                        chartData.tempData[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );

                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        changeValueD3Chart(component, seriesCount, converted)
                    }
                }

                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata.shift();
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        chartData.data[seriesCount].values.shift();
                        chartData.tempData[seriesCount].values.shift();
                    }
                    if( component.labelType == 'value' ){
                        chartData.tick = [];
                        for (var i = 0; i < chartData.labeldata.length; i++) {
                            chartData.tick.push(i);
                            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                                chartData.data[seriesCount].values[i].x = i;
                                chartData.tempData[seriesCount].values[i].x = i;
                            }
                        }
                    }
                }
            }

            function changeValueD3Chart(component, seriesCount, converted){
                var chartData = $scope.displaydata[component._id];
                chartData.options.chart.yAxis.axisLabel = converted.unit;
                
                for(var i = 0; i < chartData.tempData[seriesCount].values.length; i++) {
                    var val = chartData.tempData[seriesCount].values[i].y;
                    val = getConvertedVal(val, converted.unit);
                    chartData.data[seriesCount].values[i].y = parseFloat(toFixeValue( val ) );
                }
                chartData.api.refresh();
            }

            function multiSeriesD3UpdateData(component, data){
                var chartData = $scope.displaydata[component._id];

                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var xLabel = data[component.labels];
                else if( component.labelType == 'value' )
                    var xLabel = chartData.labeldata.length;

                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        var oldValue = chartData.tempData[seriesCount].values[keyindex].y;
                        var newValue = data[component.series[seriesCount]];

                        chartData.data[seriesCount].values[keyindex].y = parseFloat(oldValue) + parseFloat(newValue);
                        chartData.tempData[seriesCount].values[keyindex].y = parseFloat(oldValue) + parseFloat(newValue);
                    }
                }
                else{
                    chartData.tick.push(xLabel);
                    chartData.labeldata.push(label);
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        chartData.data[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );
                        chartData.tempData[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );
                    }
                }

                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.tick = chartData.tick.splice(0, component.dataelement);
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        chartData.data[seriesCount].values = chartData.data[seriesCount].values.splice(0, component.dataelement);
                        chartData.tempData[seriesCount].values = chartData.tempData[seriesCount].values.splice(0, component.dataelement);
                    }
                }
                changeMultiSeriesValueD3Chart( component );
            }

            function multiSeriesD3ReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.tick = [];
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        chartData.data[seriesCount].values = [];
                        chartData.tempData[seriesCount].values = [];
                    }
                }

                if(data1.length > 0){
                    for(var i = 0; i<data1.length; i++){
                        var data = data1[i];
                        if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                            var xLabel = data[component.labels];
                        else if( component.labelType == 'value' )
                            var xLabel = chartData.labeldata.length;

                        var label = data[component.labels];
                        var keyindex = $.inArray( label, chartData.labeldata );
                        if( keyindex > -1 ){
                            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                                chartData.data[seriesCount].values[keyindex].y = data[component.series[seriesCount]];
                                chartData.tempData[seriesCount].values[keyindex].y = data[component.series[seriesCount]];
                            }
                        }
                        else{
                            chartData.tick.push(xLabel);
                            chartData.labeldata.push(label);
                            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                                chartData.data[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );
                                chartData.tempData[seriesCount].values.push( {x: xLabel, y: data[component.series[seriesCount]]} );
                            }
                        }
                    }
                    if(chartData.labeldata.length > component.dataelement){
                        chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                        chartData.tick = chartData.tick.splice(0, component.dataelement);
                        for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                            chartData.data[seriesCount].values = chartData.data[seriesCount].values.splice(0, component.dataelement);
                            chartData.tempData[seriesCount].values = chartData.tempData[seriesCount].values.splice(0, component.dataelement);
                        }
                    }
                    changeMultiSeriesValueD3Chart( component );
                }
            }

            function changeMultiSeriesValueD3Chart(component){
                var chartData = $scope.displaydata[component._id];
                var tmp = [];
                for (var seriesCount = 0; seriesCount<component.series.length; seriesCount++){
                    _.forEach(chartData.tempData[seriesCount].values, function(val, key){
                        tmp.push(val.y);
                    });
                }
                var maxVal = Math.max.apply(null, tmp);
                var converted = countChartValue( component, maxVal );
                chartData.options.chart.yAxis.axisLabel = converted.unit;
                chartData.options.chart.xAxis.tickValues = chartData.tick;

                if(converted.unit == "KB" || converted.unit == "MB" || converted.unit == "GB" || converted.unit == "TB"){
                    _.forEach(component.series, function(value, seriesCount){
                        for(var i = 0; i < chartData.tempData[seriesCount].values.length; i++) {
                            var val = chartData.tempData[seriesCount].values[i].y;
                            val = getConvertedVal(val, converted.unit);
                            chartData.data[seriesCount].values[i].y = parseFloat(toFixeValue( val ) );
                        }
                    });
                }
                chartData.api.refresh();
            }

        //D3 Pie Chart
            function subscribeD3PieChart(component){
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    tempData:[],
                    loader:true,
                    data: [],
                    dataIndex:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                $scope.displaydata[component._id].options.chart.x = function(d){return d.key;};
                $scope.displaydata[component._id].options.chart.y = function(d){return d.value;};

                if(component.isclickable){
                    $scope.displaydata[component._id].options.chart.pie = {
                        dispatch:{
                            elementClick: function(e){
                                console.log(e);
                            }
                        }
                    };
                }

                //For click on chart and get value
                var chart = $scope.displaydata[component._id];
                var dispatch = {
                    elementClick: function(event){
                        console.log(event);
                        var label;
                        _.forEach(event, function(value, key){
                            var val = value.point.y;
                            var x = value.point.x;
                            label = chart.labeldata[x];
                        });
                        var params = {'Key': component.chartUnit, 'Device': label};
                        redirectToOtherPage(params, component);
                    }
                };
                if(component.chartType == 'Pie')
                    chart.options.chart.pie = {dispatch: dispatch};
                else if(component.chartType == 'Bar')
                    chart.options.chart.bars = {dispatch: dispatch};
                
                if(component.chartType == 'Bullet'){
                    $scope.displaydata[component._id].data = {};
                    $scope.displaydata[component._id].data.title = component.bulletTitle;
                    $scope.displaydata[component._id].data.subtitle = component.bulletSubTitle;
                    $scope.displaydata[component._id].data.ranges = [];
                    $scope.displaydata[component._id].data.measures = [component.measures];
                    $scope.displaydata[component._id].data.markers = [component.markers];
                }
                else if( component.chartType == 'DiscreteBar' )
                    $scope.displaydata[component._id].data = [ {key:'Cumulative Return', values:[]} ];
                else if( component.chartType == 'HorizontalBar')
                    $scope.displaydata[component._id].data = [ {key: component.series, bar: true, values: []} ];
                else if( component.chartType == 'SparkLine' ){
                    $scope.displaydata[component._id].options = {
                        chart: {
                            type: 'sparklinePlus',
                            height: 450,
                            x: function(d, i){return i;},
                            xTickFormat: function(d) {
                                return d3.time.format('%x')(new Date($scope.displaydata[component._id].data[d].x))
                            },
                            duration: 250
                        }
                    };
                }

                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length)
                             $scope.displaydata[component._id].loader = false;
                        snapshotPieD3(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            var statementType = $scope.displaydata[component._id].statement.type;
                            if( statementType === 'refresh')
                                pieD3UpsertData(component, data.event);
                            else if( statementType === 'moving' )
                               pieD3MovingData(component, data.event);
                            else if( statementType === 'update' )
                                pieD3UpdateData(component, data.event);
                            else if( statementType === 'replace' )
                                pieD3ReplaceData(component, data.event);
                            $scope.$apply();
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotPieD3(component,data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Pie D3 Chart -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    pieD3ReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            pieD3UpsertData(component, data[index]);
                        else if( type === 'moving' )
                            pieD3MovingData(component, data[index]);
                        else if( type === 'update' )
                            pieD3UpdateData(component, data[index]);
                    }
                }
            }

            function pieD3UpsertData(component, data){
                var chartData = $scope.displaydata[component._id];

                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    if( data[component.series] ){
                        chartData.data[keyindex].value = data[component.series];
                        chartData.tempData[keyindex] = data[component.series];
                    }
                }
                else{
                    chartData.labeldata.push(label);
                    chartData.data.push( {key:label , value:data[component.series]} );
                    chartData.tempData.push(data[component.series]);
                }
                
                if( chartData.labeldata.length > parseInt(component.dataelement) ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.data = chartData.data.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                }
                
                var maxVal = Math.max.apply(null, chartData.tempData);
                var converted = countChartValue( component, maxVal );
                changeD3PieSeries( component, converted );
                chartData.updateTime = new Date();
            }

            function pieD3MovingData(component, data){
                var chartData = $scope.displaydata[component._id];

                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    if( data[component.series] ){
                        chartData.data[keyindex].value = data[component.series];
                        chartData.tempData[keyindex] = data[component.series];
                    }
                }
                else{
                    chartData.labeldata.push(label);
                    chartData.data.push( {key:label , value:data[component.series]} );
                    chartData.tempData.push(data[component.series]);
                }
                
                if( chartData.labeldata.length > parseInt(component.dataelement) ){
                    chartData.labeldata.shift();
                    chartData.data.shift();
                    chartData.tempData.shift();
                }
                
                var maxVal = Math.max.apply(null, chartData.tempData);
                var converted = countChartValue( component, maxVal );
                changeD3PieSeries( component, converted );
                chartData.updateTime = new Date();
            }

            function pieD3UpdateData(component, data){
                var chartData = $scope.displaydata[component._id];

                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    if( data[component.series] ){
                        var oldValue = chartData.tempData[keyindex];
                        var newValue = data[component.series];
                        chartData.tempData[keyindex] = parseFloat(oldValue) + parseFloat(newValue);
                        chartData.data[keyindex] = parseFloat(oldValue) + parseFloat(newValue);
                    }
                }
                else{
                    chartData.labeldata.push(label);
                    chartData.data.push( {key:label , value:data[component.series]} );
                    chartData.tempData.push(data[component.series]);
                }
                
                if( chartData.labeldata.length > parseInt(component.dataelement) ){
                    chartData.labeldata.shift();
                    chartData.data.shift();
                    chartData.tempData.shift();
                }
                
                var maxVal = Math.max.apply(null, chartData.tempData);
                var converted = countChartValue( component, maxVal );
                changeD3PieSeries( component, converted );
                chartData.updateTime = new Date();
            }

            function pieD3ReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                
                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.data = [];
                    chartData.tempData = [];
                    chartData.labeldata = [];
                }
                
                _.forEach(data1, function(data, key){
                    var label = data[component.labels];
                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        if( data[component.series] ){
                            chartData.data[keyindex].value = data[component.series];
                            chartData.tempData[keyindex] = data[component.series];
                        }
                    }
                    else{
                        chartData.labeldata.push(label);
                        chartData.data.push({key:label , value:data[component.series] });
                        chartData.tempData.push(data[component.series]);
                    }

                    if(key == data1.length-1){
                        var maxVal = Math.max.apply(null, chartData.tempData);
                        var converted = countChartValue( component, maxVal );
                        changeD3PieSeries( component, converted );
                    }
                });
                
                if( chartData.labeldata.length > parseInt(component.dataelement) ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.data = chartData.data.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                }
                chartData.updateTime = new Date();
            }

            function changeD3PieSeries( component, converted ){
                var chartData = $scope.displaydata[component._id];

                for(var i = 0; i < chartData.tempData.length; i++) {
                    var val = chartData.tempData[i];
                    val = getConvertedVal(val, converted.unit);
                    chartData.data[i].value =  val ;
                }
            }
    /*End D3*/

    /*Table*/
        //Column Extended Table(Complex Table)
            function subscribeComplexTable(component){
                $scope.displaydata[component._id] = {
                    component:component,
                    indicatorData: [],
                    loader:true,
                    label:component.labels,
                    columns:[],
                    tempData:[],
                    data:[],
                    statement: component.statement,
                    updateTime:''
                };
                
                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: 1});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;

                        complexTableSnapshotData(component,res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'replace' )
                                complexTableReplaceData(component, data.event);
                            
                            if(!$scope.$$phase)
                                $scope.$apply();
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function complexTableSnapshotData(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('complex table -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    complexTableReplaceData(component, data);
            }

            function getColData(colDataArray, currElement, colName){
                var index= $.inArray(currElement, colDataArray);
                if(index == -1){
                    var colData;
                    colDataArray.push(currElement);
                    //console.log("colName", colName);
                    //console.log('/date/.test(colName)', /Date/.test(colName));
                    if(/Date/.test(colName)){
                        //console.log("date true");
                        colDataArray= angular.copy(colDataArray.sort(function(a, b) {
                                return a - b;
                        }));
                    }
                }
            }

            function complexTableReplaceData(component, data){
                // console.log("component", component);
                // console.log("component data", data);
                var table = {
                    component:component,
                    indicatorData: [],
                    label:component.labels,
                    columns:[],
                    tempData:[],
                    data:[],
                    updateTime:''
                };
                if(data.length > 0){
                    $scope.objArrayforPaging= angular.copy(data)
                    
                    var label = [];
                    var tmpLen = null;
                    var tmpkey = null;
                    if(/data/.test(component.colName)){
                        component.colName= component.colName.substring(5);
                    }
                    if(/data/.test(component.rowData))
                        component.rowData= component.rowData.substring(5);

                    //console.log("component.colName", component.colName);
                    var colDataArray= [], processedExtdTableData= [];
                    
                    var dataLength= data.length;
                    for(var i=0; i<dataLength; i++){
                        for(var j in data[i].data){
                            getColData(colDataArray, data[i].data[j][component.colName], component.colName);
                        }
                    }
                    //console.log('colDataArray', colDataArray);
                    for(var i=0; i<dataLength; i++){
                        var processedData= [], tempData= {};
                        for(var j in colDataArray){
                            var temp={};
                            if(/Date/.test(component.colName)){
                                temp[component.colName]= $filter('date')( colDataArray[j], "yyyy-MM-dd");   
                            }
                            else{
                                temp[component.colName]= colDataArray[j];
                            }
                            //console.log("date true colDataArray", colDataArray);
                            temp[component.rowData] = '-';
                            processedData[j]= temp;
                        }
                        // console.log("processedData", processedData);
                        for(j in data[i].data){
                            var item= data[i].data[j][component.colName];
                            var index= $.inArray(item, colDataArray);
                            var converted= {};
                            if($scope.getUnitUsage=='Auto'){
                                converted= countTableValue(data[i].data[j][component.rowData], component.unit);
                                converted.value= (converted.value).toFixed(2);
                            }else{
                                converted.value= dataFormatter.convertSingleUnitUsageDataWoArray(data[i].data[j][component.rowData],2,$scope.getUnitUsage);
                                converted.unit= $scope.getUnitUsage;
                            }
                            //console.log("converted", converted);
                            //var temp= {};
                            //temp[component.rowData]= (converted.value).toFixed(3)+converted.unit;
                            //temp[component.colName]= data[i].data[j][component.colName];
                            processedData[index][component.rowData]= converted.value+converted.unit;
                        }
                        //console.log("processedData",processedData);
                        tempData[component.rowName]= data[i][component.rowName];
                        tempData['data']= angular.copy(processedData);
                        processedExtdTableData.push(tempData);
                    }
                    table.data = processedExtdTableData;
                    table['rawData']= data;
                }
                //console.log("processedExtdTableData", processedExtdTableData);
                table.data = angular.copy(processedExtdTableData);
                // console.log("table", table);
                $scope.displaydata[component._id] = {};
                $scope.displaydata[component._id] = angular.copy(table);
                console.log("$scope.displaydata[component._id]", $scope.displaydata);
            }

        //table
            function subscribeTable(component){
                if(typeof $scope.displaydata[component._id] === 'undefined'){
                    var options = {
                        paging: (component.paging) ? true : false,
                        searching: (component.searching) ? true: false,
                        bSort: (component.sort) ? true : false,
                        bInfo: (component.info) ? true : false,
                        bLengthChange: (component.length) ? true : false
                    };
                    $scope.displaydata[component._id] = {
                        component:component,
                        indicatorData: [],
                        data1: [],
                        label:component.labels,
                        columns:[],
                        tempData:[],
                        data:[],
                        dataIndex:[],
                        statement: component.statement,
                        options: options,
                        loader: true,
                        pieOption: {fill: ["#1ab394", "#d7d7d7"]},
                        updateTime:''
                    };
                }
                angular.forEach(component.columns, function(value, key){
                    var tmpobj = {field: value.name, title:value.name, show:true};
                    if(angular.isDefined(value.updownreference))
                        tmpobj.updownreference = value.updownreference;
                    $scope.displaydata[component._id].columns.push(tmpobj);
                });

                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: 1});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                            $scope.displaydata[component._id].loader = false;

                        processTableSnapshotData(component,res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'refresh' )
                                processTableUpsertData(component, data.event);
                            else if( component.statement.type === 'moving' )
                                processTableMovingData(component, data.event);
                            else if( component.statement.type === 'update' )
                                processTableUpdateData(component, data.event);
                            else if( component.statement.type === 'replace' )
                                processTableReplaceData(component, data.event);
                            
                            if(!$scope.$$phase)
                                $scope.$apply();
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function processTableSnapshotData(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('table -> ' + component.title +' == '+ type);
                var test = [];
                if( type === 'replace')
                    processTableReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            processTableUpsertData(component, data[index]);
                        else if( type === 'moving' )
                            processTableMovingData(component, data[index]);
                        else if( type === 'update' )
                            processTableUpdateData(component, data[index]);
                    }
                }
            }

            function processTableUpsertData(component, data){
                var tableData = $scope.displaydata[component._id];
                var dataobj={};
                angular.forEach(component.columns, function(val, key){
                    var tmpdata = {};
                    tmpdata.value = (data[val.name]).toFixed(1);
                    dataobj[val.name] = tmpdata;
                });
                dataobj[component.labels] = {value: data[component.labels]};

                //Check if key is exits in table
                var keyindex = $.inArray( data[component.labels], tableData.dataIndex );
                if(keyindex > -1)
                    tableData.tempData[keyindex] = dataobj;
                else{
                    tableData.dataIndex.push( data[component.labels] );
                    tableData.tempData.push(dataobj);
                }
                tableSpliceRow(component);
            }

            function processTableMovingData(component, data){
                var tableData = $scope.displaydata[component._id];
                
                var dataobj={};
                angular.forEach(component.columns, function(val, key){
                    var tmpdata = {};
                    tmpdata.value = (data[val.name]) ? data[val.name] : 0;
                    dataobj[val.name] = tmpdata;
                });
                dataobj[component.labels] = {value: data[component.labels]};

                //Check if key is exits in table
                var keyindex = $.inArray( data[component.labels], tableData.dataIndex );
                if(keyindex > -1)
                    tableData.tempData[keyindex] = dataobj;
                else{
                    tableData.dataIndex.push( data[component.labels] );
                    tableData.tempData.push(dataobj);
                }
                tableSpliceRow(component);
            }

            function processTableUpdateData(component, data){
                var tableData = $scope.displaydata[component._id];
                
                var dataobj={};
                angular.forEach(component.columns, function(value, key){
                    var tmpdata = {};
                    tmpdata.value = (data[value.name]) ? data[value.name] : 0;
                    dataobj[value.name] = tmpdata;
                });
                dataobj[component.labels] = {value: data[component.labels]};

                //Check if key is exits in table
                var keyindex = $.inArray( data[component.labels], tableData.dataIndex );
                if(keyindex > -1){
                    _.forEach(component.columns, function(val, key){
                        if( dataobj[val.name]['value'] ){
                            var oldValue = tableData.tempData[keyindex][val.name]['value'];
                            var newValue = dataobj[val.name]['value'];
                            tableData.tempData[keyindex][val.name]['value'] = parseFloat(oldValue) + parseFloat(newValue);
                        }
                    });
                }
                else{
                    tableData.dataIndex.push( data[component.labels] );
                    tableData.tempData.push(dataobj);
                    tableData.updateTime = new Date();
                }
                tableSpliceRow(component);
            }

            function processTableReplaceData(component, data1){
               var tableData = {
                    component:component,
                    indicatorData: [],
                    label:component.labels,
                    columns:[],
                    tempData:[],
                    data:[],
                    dataIndex:[],
                    updateTime:'',
                    rowData: data1
                };
                if(data1.length > 0){
                    $scope.tblDataTimestemp = data1[0]['Time'];
                    var data = data1;
                    for (var i = 0; i<data.length; i++){
                        var dataobj={};
                        if(data[i][component.labels] != ''){
                            dataobj[component.labels] = {value: data[i][component.labels]};
                            angular.forEach(component.columns, function(val, key){
                                var tmpdata = {};
                                tmpdata.value = (data[i][val.name]) ? data[i][val.name] : 0;
                                dataobj[val.name] = tmpdata;
                            });

                            //Check if key is exits in table
                            var keyindex = $.inArray( data[i][component.labels], tableData.dataIndex );
                            if(keyindex > -1)
                                tableData.tempData[keyindex] = dataobj;
                            else{
                                tableData.dataIndex.push( data[i][component.labels] );
                                tableData.tempData.push(dataobj);
                            }
                        }

                        if(i == data.length-1)
                            tblIndicatorData(tableData, component);
                    }
                }
            }

            function tblIndicatorData(tableData, component){
                if(angular.isDefined(component.indicator) && component.indicator.length > 0){
                    var dataMinofDay = timemsToMinofDay($scope.tblDataTimestemp);
                    var todayDate = $filter('date')( $scope.tblDataTimestemp,'MM-dd-yyyy' );
                    var url = dbService.snapshotUrl({collection: 'getmoduleindicatordata', op:'select', id: component.indicatorQuery, todayDate: todayDate, dataMinofDay: dataMinofDay});
                    httpService.get(url).then(function(res){
                        var indicatorData = res.data;
                        if( indicatorData != 'null' && indicatorData != ''){
                            tableData.indicatorData = indicatorData.data;
                            tableSpliceRow(tableData, component);
                        }
                        else{
                            httpService.get(globalConfig.pullfilterdataurl + component.indicatorQuery).then(function(response){
                                var temp = [];
                                temp[0] = '';
                                var flag = false;
                                for(var i = 0; i<response.data.length; i++ ){
                                    var value = response.data[i];
                                    var tmpKey = timemsToMinofDay(value.Time);
                                    temp[tmpKey] = value;

                                    if(dataMinofDay == tmpKey){
                                        tableData.indicatorData = value.data;
                                        flag = true;
                                    }
                                }
                                // console.log('flag', flag);
                                if(flag){
                                    var tmpdata = {};
                                    tmpdata[todayDate] = temp;
                                    var req = {'id': component.indicatorQuery, 'data': tmpdata};
                                    var url = dbService.snapshotUrl({collection: 'setmoduleindicatordata', op:'create'});
                                    httpService.post(url, req).then(function(res){
                                    //$http.post(globalConfig.snapshoturl +'setmoduleindicatordata', req).then(function(res){
                                        
                                    });
                                }
                                tableSpliceRow(tableData, component);
                            });
                        }
                    });
                }
                else
                    tableSpliceRow(tableData, component);
            }

            function tableSpliceRow(tableData, component){
                //var tableData = $scope.displaydata[component._id];

                /*var tableTmp = tableData.tempData.sort(function(a, b) {
                    return parseFloat( b[component.columns[0].name].value ) - parseFloat( a[component.columns[0].name].value );
                });*/
                if(component.type == 'simple_table' && (angular.isDefined(component.dataelement) && component.dataelement != '') ){
                    tableData.tempData = tableData.tempData.splice(0, parseInt(component.dataelement) );
                    tableData.dataIndex = tableData.dataIndex.splice(0, parseInt(component.dataelement) );    
                }

                var tableSort = angular.copy(tableData.tempData);
                //Count Total For Piety Chart
                var total = 0;
                if( component.percentage != '' && component.calculate != undefined){
                    if( component.calculate == 'existing' ){
                        angular.forEach(tableSort, function(val, key){
                            _.forEach(component.columns, function(v, k){
                                //if(key == 0 || key == 1)
                                total += val[v.name].value;
                            });
                        });
                        bindTableData(tableData, component, total);
                    }
                    else{
                        var url = dbService.snapshotUrl({op:'select', id: component.calculateQuery, limit: 1});
                        httpService.get(url).then(function(res){
                            if(res.data != 'null')
                                total = res.data[0][component.pietyColumn];

                            bindTableData(tableData, component, total);
                        });
                    }
                }
                else
                    bindTableData(tableData, component, total);
            }

            function bindTableData(tableData, component, total){
                var tableSort = angular.copy(tableData.tempData);
                var labelArr = [];
                angular.forEach(tableSort, function(val, key){
                    labelArr.push(val[component.labels].value);
                    _.forEach(component.columns, function(v, k){
                        //For indicator
                        if(component.indicator && component.indicator.indexOf(v.name) > -1 ){
                            for (var i = 0; i< component.indicator.length; i++ ){
                                var indicator =  component.indicator[i];

                                var tmpArr = [];
                                var tmpArr = _.filter(tableData.indicatorData, function(res){
                                    return val[component.labels].value == res[component.labels];
                                });
                                
                                if( tmpArr.length > 0){
                                    var newValue = val[v.name].value;
                                    var oldValue = tmpArr[0][indicator];
                                    
                                    var danger = (component.danger) ? component.danger[indicator] : null;
                                    var indicatorClass = setIndicatorTable(oldValue, newValue, danger);
                                    val[v.name]['indicator'] = indicatorClass.indicator;
                                    val[v.name]['spanclass'] = indicatorClass.spanclass;
                                }
                                else{
                                    val[v.name]['indicator'] = '';
                                    val[v.name]['spanclass'] = '';
                                }
                            }
                        }

                        //Piety Chart data
                        if( component.percentage != '' && component.calculate != undefined && total != 0 )
                            val[component.labels].pieData = pietyChartVal(total, val[v.name].value);

                        if(angular.isDefined(component.unit) && component.unit[v.name] && component.unit[v.name] != 'percent'){
                            var converted = countTableValue( val[v.name].value, component.unit[v.name] );
                            if(converted.value % 1 === 0){
                                // int
                            }
                            else
                                converted.value = parseFloat(converted.value).toFixed(component.dataDecimal[v.name]);

                            val[v.name].value = converted.value +' '+ converted.unit;
                        }
                        else if(angular.isDefined(component.unit) && component.unit[v.name] == 'percent')
                            val[v.name].value = parseFloat(val[v.name].value).toFixed(component.dataDecimal[v.name]) + ' %';
                        else
                            val[v.name].value = val[v.name].value;
                    });
                });
                
                tableData.dataIndex = labelArr;
                tableData.data = tableSort;

                $scope.displaydata[component._id].data.length = 0;
                $timeout(function(){
                    $scope.displaydata[component._id].data = tableData.data;
                }, 0.1);

                $scope.displaydata[component._id].updateTime = new Date();
            }

            function pietyChartVal(total, value){
                var val = (value / total ) * 100;
                if(val < 1)
                    val = parseFloat(val.toFixed(2));
                else if(val < 10)
                    val = parseFloat(val.toFixed(1));
                else
                    val = parseInt(val);

                return([val, 100 - val]);
            }

            function setIndicatorTable(oldValue, newValue, danger){
                var percent = '0%';
                var indicator = 'fa fa-bolt';
                var spanclass = 'text-success';
                var substr =  newValue - oldValue;
                if(substr > 0){
                    percent = ((substr/oldValue) * 100).toFixed(2) + '%';
                    indicator = 'fa fa-level-up';

                    spanclass = (danger == 'up') ? 'text-danger' : 'text-navy';
                }
                else if( substr < 0){
                    percent = Math.abs( ((substr/oldValue) * 100).toFixed(2) )+ '%';
                    indicator = 'fa fa-level-down';

                    spanclass = (danger == 'up') ? 'text-navy' : 'text-danger';
                }
                return ({percent: percent, indicator:indicator, spanclass:spanclass});
            }

            function countTableValue(value, unitName){
                var newValue = angular.copy(value);
                var unit = '';
                if( unitName == 'usage' ){
                    unit = 'Bytes';
                    if( newValue > 1024){
                        var datakb = ( newValue/1024 );
                        if( datakb > 1024 ){
                            var datamb = ( datakb/1024 );
                            if( datamb > 1024 ){
                                var datagb = ( datamb/1024 );
                                if(datagb > 1024){
                                    var datatb = ( datagb/1024 );
                                    newValue = datatb;
                                    unit = 'TB';
                                }
                                else{
                                    newValue = datagb;
                                    unit = 'GB';
                                }
                            }
                            else{
                                newValue = datamb;
                                unit = 'MB';
                            }
                        }
                        else{
                            newValue = datakb;
                            unit = 'KB';
                        }
                    }
                }
                else if( unitName == 'speed'){
                    unit = 'Bps';
                    if(newValue >= 1024 && newValue < 1024 * 1024){
                        newValue = (newValue / 1024);
                        unit = 'Kbps';
                    }
                    else if(newValue >= 1024*1024 && newValue < 1024 * 1024 * 1024){
                        newValue = (newValue / (1024*1024));
                        unit = 'Mbps';
                    }
                    else if(newValue > 1024*1024*1024){
                        newValue = (newValue / (1024*1024*1024));
                        unit = 'Gbps';
                    }
                }
                else if( unitName == 'count'){
                    unit = '';
                    if(newValue >= 1000 && newValue < 1000 * 1000){
                        newValue = (newValue / 1000);
                        unit = 'K';
                    }
                    else if(newValue >= 1000*1000 ){
                        newValue = (newValue / (1000*1000));
                        unit = 'Mn';
                    }
                }

                return({'value': newValue, 'unit': unit});
            }

            function decorateReportColumn(column, coldata){
                if(column.indicator == 'bolt' ){
                    coldata.indicatorClass = 'text-success';
                    coldata.spanclass='fa fa-bolt';
                    return;
                }

                if(column.indicator == 'updown' ){
                    if(coldata.value >= column.updownreference){
                        coldata.indicatorClass = 'text-success';
                        coldata.spanclass = 'fa fa-level-up';
                    }else{
                        coldata.indicatorClass = 'text-danger';
                        coldata.spanclass = 'fa fa-level-down';
                    }
                    return ;
                }

                if(column.indicator == 'piegraph' || column.indicator == 'linegraph' || column.indicator == 'bargraph'){
                    var maxelement = 10;
                    if(column.indicator == 'piegraph')
                        maxelement  =2;

                    if(!angular.isDefined(coldata.kpiindicatordatahistory))
                        coldata.kpiindicatordatahistory = [];

                    if(coldata.kpiindicatordatahistory.length + 1 > maxelement)
                        coldata.kpiindicatordatahistory.shift();
                    coldata.kpiindicatordatahistory.push(coldata.value);
                }
            }
    /*End Table*/

    /*IBox*/
        function subscribeIBox(component){
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {
                    component:component,
                    loader:true,
                    kpi:'',
                    kpiIndicator:'',
                    kpiindicatordatahistory:[],
                    spanclass:'',
                    updateTime: ''
                };
            }
            if(component.indicatortype == 'bolt')
                $scope.displaydata[component._id].spanclass='fa fa-bolt';

            if( component.data != 'DBPull' ){
                var url = dbService.snapshotUrl({op:'select', id: component.query, limit:1});
                httpService.get(url).then(function(res){

                    processIBoxSnapshotData(component,res.data);
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        if(component.statement.type == 'replace')
                            processIBoxData(component, data.event[0]);
                        else
                            processIBoxData(component, data.event);
                        
                        $scope.$apply();
                    });
                });
            }
            else
                setTimeInterval(component);

            if( component.data2 ){
                if( component.data2 != 'DBPull' ){
                    $scope.displaydata[component._id].loader2 = true;
                    var url = dbService.snapshotUrl({op:'select', id: component.query2, limit:1});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0) $scope.displaydata[component._id].loader2 = false;

                        for(var index = 0; index < res.data.length; index++){
                            var newValue2 = countIBoxUnit( component, res.data[index][component.kpi2] );
                            $scope.displaydata[component._id].kpi2 = newValue2.value.toFixed(component.dataDecimal2);
                            $scope.displaydata[component._id].unit2 = newValue2.unit;
                            $scope.displaydata[component._id].updateTime2 = new Date();

                            if(component.indicator2)
                                getAndSetIndicatorIboxData2(component, res.data[index], component.kpi2);
                        }

                        socket.subscribe(component.query2, function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query2];
                            if($scope.displaydata[component._id]){
                                var newValue = countIBoxUnit( component, data.event[component.kpi2] );
                                $scope.displaydata[component._id].kpi2 = newValue.value.toFixed(component.dataDecimal2);
                                $scope.displaydata[component._id].unit2 = newValue.unit;
                                $scope.displaydata[component._id].updateTime2 = new Date();

                                if(component.indicator2)
                                    getAndSetIndicatorIboxData2(component, data, component.kpi2);
                            }
                        });
                    });
                }
                else{
                    var fields = JSON.stringify(["type", "statementId", "eventPublish", "dataSource", 'dbPullType', 'name']);
                    var query = JSON.stringify({'statementId': component.query2});
                    var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
                    var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
                    httpService.get(url).then(function(res){
                        console.log('>>>>>>>>>> ibox 2',res.data);
                        var parameter = '';
                        if( angular.isDefined(res.data[0]['dbPullType']) )
                            parameter += '&dbPullType='+ res.data[0]['dbPullType'];

                        if( res.data[0]['dbPullType'] == 'redis' )
                            parameter += '&name='+res.data[0]['name'];

                        var from = $scope.date.start+'T00:00:00.000Z';
                        var to = $scope.date.end+'T23:59:59.999Z';

                        parameter += '&fromDate='+ from +'&toDate='+to;
                        //pulldataurl
                        httpService.get(globalConfig.pullfilterdataurl + component.query2 + parameter).then(function(res){
                            if(res.data.length == 0) $scope.displaydata[component._id].loader2 = false;
                            for(var index = 0; index < res.data.length; index++){
                                if( res.data[index][component.kpi2] ){
                                    var newValue2 = countIBoxUnit( component, res.data[index][component.kpi2] );
                                    $scope.displaydata[component._id].kpi2 = newValue2.value.toFixed(component.dataDecimal2);
                                    $scope.displaydata[component._id].unit2 = newValue2.unit;
                                    $scope.displaydata[component._id].updateTime2 = new Date();

                                    if(component.indicator2)
                                        getAndSetIndicatorIboxData2(component, res.data[index], component.kpi2);
                                }
                            }
                        });
                    });
                }
            }
        }

        function processIBoxSnapshotData(component, data){
            if(data != 'error' && data.length == 0)
                $scope.displaydata[component._id].loader = false;
            else if(data != 'error'){
                for(var index = 0; index < data.length; index++){
                    processIBoxData(component, data[index]);
                }
            }
        }

        function processIBoxData(component, data){
            var iboxData = $scope.displaydata[component._id];
            if(component.unit == 'percent'){
                iboxData.kpi = (component.dataDecimal) ? (data[component.kpi]).toFixed(component.dataDecimal) : data[component.kpi];
                iboxData.unit = '%';
            }
            else{
                var newValue = countIBoxUnit( component, data[component.kpi] );
                iboxData.kpi = (component.dataDecimal) ? newValue.value.toFixed(component.dataDecimal) : newValue.value;
                iboxData.unit = newValue.unit;
            }
            iboxData.updateTime = new Date();

            if(component.indicator)
                getAndSetIndicatorIboxData(component, data, component.kpi);
        }

        function countIBoxUnit(component, value){
            var unit = '';
            var newValue = value;
            if(component.unitAdjustFlag == 'yes'){
                if(component.unit == 'usage'){
                    unit = 'B';
                    if(newValue >= 1024 && newValue < 1024 * 1024){
                        newValue = newValue / 1024;
                        unit = 'KB';
                    }
                    else if(newValue >= 1024*1024 && newValue < 1024 * 1024 * 1024){
                        newValue = newValue / (1024*1024);
                        unit = 'MB';
                    }
                    else if(newValue > 1024*1024*1024 && newValue < 1024 * 1024 * 1024 * 1024){
                        newValue = newValue / (1024*1024*1024);
                        unit = 'GB';
                    }
                    else if(newValue > 1024*1024*1024*1024){
                        newValue = newValue / (1024*1024*1024*1024);
                        unit = 'TB';
                    }
                }
                else if(component.unit == 'speed'){
                    unit = 'Bps';
                    if(newValue >= 1024 && newValue < 1024 * 1024){
                        newValue = newValue / 1024;
                        unit = 'Kbps';
                    }
                    else if(newValue >= 1024*1024 && newValue < 1024 * 1024 * 1024){
                        newValue = newValue / (1024*1024);
                        unit = 'Mbps';
                    }
                    else if(newValue > 1024*1024*1024){
                        newValue = newValue / (1024*1024*1024);
                        unit = 'Gbps';
                    }
                }
                else if(component.unit == 'count'){
                    unit = '';
                    if(newValue >= 1000 && newValue < 1000 * 1000){
                        newValue = newValue / 1000;
                        unit = 'K';
                    }
                    else if(newValue >= 1000*1000 ){
                        newValue = newValue / (1000*1000);
                        unit = 'Mn';
                    }
                }
            }
            else{
                if(component.unit == 'usage'){
                    newValue = newValue / Math.pow(2, 20);
                    unit = 'MB';
                }
                else if( component.unit == 'speed'){
                    newValue = newValue / Math.pow(2, 10);
                    unit = 'Kbps';   
                }
            }
            return( {'value': newValue, 'unit': unit} );
        }

        function countIBoxUnit2(component, value){
            var unit = '';
            var newValue = value;
            if(component.unitAdjustFlag2 == 'yes'){
                if(component.unit2 == 'usage'){
                    unit = 'B';
                    if(newValue >= 1024 && newValue < 1024 * 1024){
                        newValue = newValue / 1024;
                        unit = 'KB';
                    }
                    else if(newValue >= 1024*1024 && newValue < 1024 * 1024 * 1024){
                        newValue = newValue / (1024*1024);
                        unit = 'MB';
                    }
                    else if(newValue > 1024*1024*1024 && newValue < 1024 * 1024 * 1024 * 1024){
                        newValue = newValue / (1024*1024*1024);
                        unit = 'GB';
                    }
                    else if(newValue > 1024*1024*1024*1024){
                        newValue = newValue / (1024*1024*1024*1024);
                        unit = 'TB';
                    }
                }
                else if(component.unit2 == 'speed'){
                    unit = 'Bps';
                    if(newValue >= 1024 && newValue < 1024 * 1024){
                        newValue = newValue / 1024;
                        unit = 'Kbps';
                    }
                    else if(newValue >= 1024*1024 && newValue < 1024 * 1024 * 1024){
                        newValue = newValue / (1024*1024);
                        unit = 'Mbps';
                    }
                    else if(newValue > 1024*1024*1024){
                        newValue = newValue / (1024*1024*1024);
                        unit = 'Gbps';
                    }
                }
                else if(component.unit2 == 'count'){
                    unit = '';
                    if(newValue >= 1000 && newValue < 1000 * 1000){
                        newValue = newValue / 1000;
                        unit = 'K';
                    }
                    else if(newValue >= 1000*1000 ){
                        newValue = newValue / (1000*1000);
                        unit = 'Mn';
                    }
                }
            }
            else{
                if(component.unit2 == 'usage'){
                    newValue = newValue / Math.pow(2, 20);
                    unit = 'MB';
                }
                else if( component.unit2 == 'speed'){
                    newValue = newValue / Math.pow(2, 10);
                    unit = 'Kbps';   
                }
            }
            return( {'value': newValue, 'unit': unit} );
        }

        function getKeyValue(key, data){
            var keyvalue = "";
            for(var index = 0; index < key.length; index++){
                keyvalue = keyvalue + data[key[index]];
            }
            return keyvalue;
        }
    /*End IBox*/

    /*Info Box*/
        function subscribeInfoBox(component){
            $scope.displaydata[component._id] = {'description': null, loader:true};
            if(component.textType == 'dynamic'){
                httpService.get(globalConfig.pulldataurl + component.query).then(function(res){
                    if (res.data.length == 0)
                         $scope.displaydata[component._id].loader = false;
                    $scope.displaydata[component._id].description = res.data;
                });
            }
        }
    /*End Info Box*/
    
    /*Gauge*/
        function subscribeGauge(component){
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {
                    component:component,
                    loader:true,
                    data:'',
                    width: (component.width == 3) ? 100 : 200,
                    options:{max: Number(component.max), min:0, fontWeight: 'normal'},
                    updateTime: ''
                };
            }
            if( component.data != 'DBPull' ){
                var url = dbService.snapshotUrl({op:'select', id: component.query, limit: 1});
                httpService.get(url).then(function(res){
                    if(res.data.length == 0)
                         $scope.displaydata[component._id].loader = false;

                    gaugeSnapshotData(component, res.data);
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        processGauge(component, data.event);
                        $scope.$apply();
                    });
                });
            }
            else
                setTimeInterval(component);
        }

        function gaugeSnapshotData(component, data){
            if(data != 'error'){
                for(var index = 0; index < data.length; index++){
                    processGauge(component, data[index]);
                }
            }
        }

        function processGauge(component, data){
            var gauge = $scope.displaydata[component._id];
            console.log(gauge);
            if( component.unit == 'speed' ){
                if( component.unit2 == 'Kbps' ){
                    gauge.data = Number((data[component.kpi] / Math.pow(2, 10)).toFixed(parseInt(component.dataDecimal)) );
                    gauge.unit = 'Kbps';
                }
                else if( component.unit2 == 'Mbps' ){
                    gauge.data = Number((data[component.kpi] / Math.pow(2, 20)).toFixed(parseInt(component.dataDecimal)) );
                    gauge.unit = 'Mbps';
                }
                else if( component.unit2 == 'Gbps' ){
                    gauge.data = Number((data[component.kpi] / Math.pow(2, 30)).toFixed(parseInt(component.dataDecimal)) );
                    gauge.unit = 'Gbps';
                }
            }
            else if( component.unit == 'usage' ){
                if( component.unit2 == 'KB' ){
                    gauge.data = Number((data[component.kpi] / Math.pow(2, 10)).toFixed(parseInt(component.dataDecimal)) );
                    gauge.unit = 'KB';
                }
                else if( component.unit2 == 'MB' ){
                    gauge.data = Number((data[component.kpi] / Math.pow(2, 20)).toFixed(parseInt(component.dataDecimal)) );
                    gauge.unit = 'MB';
                }
                else if( component.unit2 == 'GB' ){
                    gauge.data = Number((data[component.kpi] / Math.pow(2, 30)).toFixed(parseInt(component.dataDecimal)) );
                    gauge.unit = 'GB';
                }
            }
            else{
                var newValue = countGaugeUnit(component, data[component.kpi]);
                if(newValue.value){
                    gauge.data = newValue.value.toFixed(component.dataDecimal);
                    gauge.unit = newValue.unit;
                }
            }

            gauge.updateTime = new Date();
            if(!$scope.$$phase)
                $scope.$apply();
        }

        function countGaugeUnit(component, value) {
            var newValue = value;
            var unit = '';
            if( component.unit == 'usage' ){
                unit = 'Bytes';
                if( newValue > 1024){
                    var datamb = ( newValue/1024 );
                    if( datamb > 1024 ){
                        var datagb = ( datamb/1024 );
                        if( datagb > 1024 ){
                            var datatb = ( datagb/1024 );
                            if(datatb > 1024){
                                var datapb = ( datatb/1024 );
                                newValue = datapb;
                                unit = 'TB';
                            }
                            else{
                                newValue = datatb;
                                unit = 'GB';
                            }
                        }
                        else{
                            newValue = datagb;
                            unit = 'MB';
                        }
                    }
                    else{
                        newValue = datamb;
                        unit = 'KB';
                    }
                }
            }
            else if( component.unit == 'speed' ){
                unit = 'Bps';
                if( newValue > 1024){
                    var datamb = ( newValue/1024 );
                    if( datamb > 1024 ){
                        var datagb = ( datamb/1024 );
                        if( datagb > 1024 ){
                            var datatb = ( datagb/1024 );
                            newValue = datatb;
                            unit = 'Gbps';
                        }
                        else{
                            newValue = datagb;
                            unit = 'Mbps';
                        }
                    }
                    else{
                        newValue = datamb;
                        unit = 'Kbps';
                    }
                }
            }
            else if( component.unit == 'count' ){
                unit = '';
                if( newValue >= 1000 && newValue < 1000000){
                    unit = 'K';
                }
                else if( newValue >= 1000000 ){
                    unit = 'MN';
                }
            }
            return({value: newValue, unit: unit});
        }
    /*End Gauge*/

    /*Flot Chart*/
        //For Pie Chart
            function subscribeFlotPieChart(component){
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    loader:true,
                    dataset:[],
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;

                        snapshotPieFlot(component, res.data);
                        socket.subscribe(component.query, function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if($scope.displaydata[component._id]){
                                if( component.statement.type === 'refresh' )
                                    pieFlotUpsertData(component, data.event);
                                else if( component.statement.type === 'moving' )
                                   pieFlotMovingData(component, data.event);
                                else if( component.statement.type === 'update' )
                                    pieFlotUpdateData(component, data.event);
                                else if( component.statement.type === 'replace' )
                                    pieFlotReplaceData(component, data.event);
                            }
                        });
                        if(!$scope.$$phase)
                            $scope.$apply();
                    });
                }
                else
                    setTimeInterval(component);

                $timeout(function(){
                    $("#"+component._id).bind("plotclick",function (event, pos, item) {
                        var params = {Key: component.chartUnit, Device: item.series.label};
                        redirectToOtherPage(params, component);
                    });
                }, 1000);
            }

            function snapshotPieFlot(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('flot pie-> ' + component.title +' == '+ type);
                if( type === 'replace')
                    pieFlotReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            pieFlotUpsertData(component, data[index]);
                        else if( type === 'moving' )
                            pieFlotMovingData(component, data[index]);
                        else if( type === 'update' )
                            pieFlotUpdateData(component, data[index]);
                    }
                }
            }

            function pieFlotUpsertData(component, data){
                var chartData = $scope.displaydata[component._id];
                
                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    if( data[component.series] ){
                        var converted = countChartValue( component, data[component.series] );
                        chartData.dataset[keyindex].data = converted.value;
                        chartData.tempData[keyindex] = data[component.series];
                    }
                }
                else
                    pushDataFlotPieChart(component, data, label);
                
                if( chartData.labeldata.length > parseInt(component.dataelement) ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.dataset = chartData.dataset.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                }

                var maxVal = Math.max.apply(null, chartData.tempData);
                var converted = countChartValue( component, maxVal );
                changeFlotPieChart( component, converted );
                chartData.updateTime = new Date();
            }

            function pieFlotMovingData(component, data){
                var chartData = $scope.displaydata[component._id];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    if( data[component.series] ){
                        var converted = countChartValue( component, data[component.series] );
                        chartData.dataset[keyindex].data = converted.value;
                        chartData.tempData[keyindex] = data[component.series];
                    }
                }
                else
                    pushDataFlotPieChart(component, data, label);
                
                if(chartData.labeldata.length > parseInt(component.dataelement)){
                    chartData.labeldata.shift();
                    chartData.dataset.shift();
                    chartData.tempData.shift();
                }
                
                var maxVal = Math.max.apply(null, chartData.tempData);
                var converted = countChartValue( component, maxVal );
                changeFlotPieChart( component, converted );
                chartData.updateTime = new Date();
            }

            function pieFlotUpdateData(component, data){
                var chartData = $scope.displaydata[component._id];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else
                    var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    if( data[component.series] ){
                        var converted = countChartValue( component, data[component.series] );
                        var oldValue = chartData.tempData[keyindex];
                        var newValue = data[component.series];
                        chartData.tempData[keyindex] = parseFloat(oldValue) + parseFloat(newValue);
                    }
                }
                else
                    pushDataFlotPieChart(component, data, label);
                
                if( chartData.labeldata.length > parseInt(component.dataelement) ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.dataset = chartData.dataset.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                }

                var maxVal = Math.max.apply(null, chartData.tempData);
                var converted = countChartValue( component, maxVal );
                changeFlotPieChart( component, converted );
                chartData.updateTime = new Date();
            }

            function pieFlotReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.dataset = [];
                    chartData.tempData = [];
                    chartData.labeldata = [];
                }
                
                _.forEach(data1, function(data, key){
                    if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                        var label = data[component.labels] + globalConfig.tzAdjustment;
                    else
                        var label = data[component.labels];
                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        var converted = countChartValue( component, data[component.series] );
                        chartData.dataset[keyindex].data = converted.value;
                        chartData.tempData[keyindex] = data[component.series];
                    }
                    else
                        pushDataFlotPieChart(component, data, label);

                    if(data1.length == key + 1){
                        var maxVal = Math.max.apply(null, chartData.tempData);
                        var converted = countChartValue( component, maxVal );
                        changeFlotPieChart( component, converted );
                    }
                });
                chartData.updateTime = new Date();
            }

            function pushDataFlotPieChart(component, data, label){
                var chartData = $scope.displaydata[component._id];
                chartData.labeldata.push( label );
                var converted = countChartValue( component, data[component.series] );
                chartData.dataset.push( {'label': label, 'data': converted.value} );
                chartData.tempData.push( data[component.series] );
            }

            function changeFlotPieChart(component, converted){
                var chartData = $scope.displaydata[component._id];
                if(converted.unit != ''){
                    for(var i = 0; i < chartData.tempData.length; i++) {
                        var val = chartData.tempData[i];
                        val = getConvertedVal(val, converted.unit);
                        chartData.dataset[i].data = parseFloat(val).toFixed(1);
                    }
                }
            }

        //For Bar chart
            function subscribeFlotBarChart(component){
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata: [],
                    loader:true,
                    dataset:[],
                    tempData:[],
                    temp:[],
                    ticks:[],
                    dataIndex:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                var options = {
                    series: {
                        bars: {
                            show: true
                        }
                    },
                    bars: {
                        align: "center",
                        barWidth: 0.5
                    },
                    xaxis: {
                        axisLabelUseCanvas: true,
                        axisLabelFontSizePixels: 12,
                        axisLabelFontFamily: 'Verdana, Arial',
                        axisLabelPadding: 10,
                        ticks: $scope.displaydata[component._id].ticks
                    },
                    yaxis: {
                        axisLabel: "",
                        axisLabelUseCanvas: true,
                        axisLabelFontSizePixels: 12,
                        axisLabelFontFamily: 'Verdana, Arial',
                        axisLabelPadding: 3,
                        tickFormatter: function (v, axis) {
                            return v;
                        }
                    },
                    legend: {
                        noColumns: 0,
                        //labelBoxBorderColor: "#000000",
                        position: "nw"
                    },
                    grid: {
                        hoverable: true,
                        //borderWidth: 2,
                        backgroundColor: { colors: ["#ffffff", "#EDF5FF"] }
                    },
                    tooltip: true,
                    tooltipOpts: {
                        content: "x: %x, y: %y"
                    }
                };

                $scope.displaydata[component._id].options.yaxis.tickFormatter = function (v, axis) {return v;};
                $scope.displaydata[component._id].options = options;

                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                    $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
                }
                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;
                        snapshotBarFlot(component, res.data);
                        socket.subscribe(component.query, function(res){
                        });
                        if(!$scope.$$phase)
                            $scope.$apply();
                    });
                }
            }

            function snapshotBarFlot(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('flot bar-> ' + component.title +' == '+ type);
                if( type === 'replace')
                    barFlotReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            barFlotUpsertData(component, data[index]);
                        else if( type === 'moving' )
                            barFlotMovingData(component, data[index]);
                        else if( type === 'update' )
                            barFlotUpdateData(component, data[index]);
                    }
                }
            }

            function barFlotMovingData(component, data){
                var chartData = $scope.displaydata[component._id];
                
                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else
                    var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    chartData.labeldata[keyindex] = label;
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {    
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        chartData.dataset[seriesCount].data[keyindex][1] = converted.value;
                        chartData.tempData[seriesCount].data[keyindex][1] = data[component.series[seriesCount]];
                        
                        changeBarFlotValueMoving(component, converted);
                    }
                }
                else
                    pushDataBarFlowChartMoving(component, data, label);

                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata.shift();
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.dataset[seriesCount].data.shift();
                        chartData.tempData[seriesCount].data.shift();
                    }
                }
                chartData.updateTime = new Date();
            }

            function pushDataBarFlowChartMoving(component, data, label){
                var chartData = $scope.displaydata[component._id];
                chartData.labeldata.push( label );
                var ticksLength = chartData.ticks.length;
                chartData.ticks.push([ticksLength, label]);
                //For multiple line
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    var converted = countChartValue( component, data[component.series[seriesCount]] );
                    chartData.dataset[seriesCount].data.push( [ ticksLength, converted.value ] );
                    chartData.tempData[seriesCount].data.push( [ ticksLength, data[component.series[seriesCount]] ] );

                    changeBarFlotValueMoving(component, converted);
                }
            }

            function changeBarFlotValueMoving(component, converted){
                var chartData = $scope.displaydata[component._id];
                chartData.options.yaxis.axisLabel = converted.unit;

                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                    for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++){
                        var val = chartData.tempData[seriesCount].data[i][1];
                        val = getConvertedVal(val, converted.unit);
                        chartData.dataset[seriesCount].data[i][1] = toFixeValue( val );
                    }
                }
            }

            function barFlotReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.temp = [];
                    chartData.ticks = [];
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        chartData.dataset[seriesCount].data = [];
                        chartData.tempData[seriesCount].data = [];
                    }
                }

                _.forEach(data1, function(data, key){
                    if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                        var label = data[component.labels] + globalConfig.tzAdjustment;
                    else
                        var label = data[component.labels];

                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        chartData.labeldata[keyindex] = label;
                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            if( data[component.series[seriesCount]] ){
                                var converted = countChartValue( component, data[component.series[seriesCount]] );
                                chartData.temp[keyindex] = data[component.series[seriesCount]];
                                chartData.dataset[seriesCount].data[keyindex][1] = converted.value;
                                chartData.tempData[seriesCount].data[keyindex][1] = data[component.series[seriesCount]];
                                
                                chartData.updateTime = new Date();
                            }
                        }
                    }
                    else
                        pushDataBarFlowChart(component, data, label);

                    if(key == data1.length-1){
                        var maxVal = Math.max.apply(null, chartData.temp);
                        var converted = countChartValue( component, maxVal );
                        changeValueBarFlowChart( component, converted );
                    }
                });
            }

            function pushDataBarFlowChart(component, data, label){
                var chartData = $scope.displaydata[component._id];
                chartData.labeldata.push( label );
                var ticksLength = chartData.ticks.length;
                chartData.ticks.push([ticksLength, label]);
                //For multiple line
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    if( data[component.series[seriesCount]] ){
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        chartData.temp.push( data[component.series[seriesCount]] );
                        chartData.dataset[seriesCount].data.push( [ ticksLength, converted.value ] );
                        chartData.tempData[seriesCount].data.push( [ ticksLength, data[component.series[seriesCount]] ] );
                    }
                    else{
                        var index = chartData.labeldata.indexOf( label );
                        if (index > -1)
                            chartData.labeldata.splice(index, 1);
                    }
                }
            }

            function changeValueBarFlowChart(component, converted){
                var chartData = $scope.displaydata[component._id];
                chartData.options.yaxis.axisLabel = converted.unit;
                chartData.options.xaxis.ticks = chartData.ticks;

                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                        var val = chartData.tempData[seriesCount].data[i][1];
                        val = getConvertedVal(val, converted.unit);
                        chartData.dataset[seriesCount].data[i][1] = toFixeValue( val );
                    }
                }
            }

        //For Line chart
            function subscribeFlotChart(component){
                console.log(component.title);
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata: [],
                    dataset:[],
                    tempData:[],
                    loader:true,
                    temp:[],
                    dataIndex:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                    $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
                }

                if( component.data != 'DBPull'){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if(res.data.length == 0)
                            $scope.displaydata[component._id].loader = false;

                        processSnapshotMultiSeriesFlot(component, res.data);
                        socket.subscribe(component.query, function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if($scope.displaydata[component._id]){
                                if( component.statement.type === 'refresh' )
                                    processFlotChartMultiSeriesUpsertData(component, data.event);
                                else if( component.statement.type === 'moving' )
                                   processFlotChartMultiSeriesMovingData(component, data.event);
                                else if( component.statement.type === 'update' )
                                    processFlotChartMultiSeriesUpdateData(component, data.event);
                                else if( component.statement.type === 'replace' )
                                    processFlotChartMultiSeriesReplaceData(component, data.event);
                            }
                            if(!$scope.$$phase)
                                $scope.$apply();
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function processSnapshotMultiSeriesFlot(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('flot -> ' + component.title +' == '+ type);
                if( type === 'replace')
                    processFlotChartMultiSeriesReplaceData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            processFlotChartMultiSeriesUpsertData(component, data[index]);
                        else if( type === 'moving' )
                            processFlotChartMultiSeriesMovingData(component, data[index]);
                        else if( type === 'update' )
                            processFlotChartMultiSeriesUpdateData(component, data[index]);
                    }
                }
            }

            function processFlotChartMultiSeriesReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.temp = [];
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        chartData.dataset[seriesCount].data = [];
                        chartData.tempData[seriesCount].data = [];
                    }
                }

                _.forEach(data1, function(data, key){
                    if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                        var label = data[component.labels] + globalConfig.tzAdjustment;
                    else
                        var label = data[component.labels];

                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        if(component.series.length > 1){
                            chartData.labeldata[keyindex] = label;
                            for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                                if( data[component.series[seriesCount]] ){
                                    var converted = countChartValue( component, data[component.series[seriesCount]] );
                                    chartData.temp[keyindex] = data[component.series[seriesCount]];
                                    chartData.dataset[seriesCount].data[keyindex] = ( [ label, converted.value ] );
                                    chartData.tempData[seriesCount].data[keyindex] = ( [ label, data[component.series[seriesCount]] ] );
                                }
                            }
                        }
                        else{
                            if( data[component.series[0]] ){
                                var converted = countChartValue( component, data[component.series[0]] );
                                chartData.dataset[0].data[keyindex] = ( [ label, converted.value ] );
                                chartData.tempData[0].data[keyindex] = ( [ label, data[component.series[0]] ] );
                                //change value to KB/MB/GB
                                changeValueFlowChart( component, 0, converted );
                            }
                        }
                    }
                    else
                        pushDataForFlowChart(component, data, label);
                });
            
                if(component.series.length > 1){
                    var maxVal = Math.max.apply(null, chartData.temp);
                    var converted = countChartValue( component, maxVal );
                    changeMultiValueFlowChart( component, converted );
                }

                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.temp = chartData.temp.splice(0, component.dataelement);
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.dataset[seriesCount].data = chartData.dataset[seriesCount].data.splice(0, component.dataelement);
                        chartData.tempData[seriesCount].data = chartData.tempData[seriesCount].data.splice(0, component.dataelement);
                    }
                }
                chnageTickLen(component, chartData.labeldata.length);
                chartData.updateTime = new Date();
            }

            function processFlotChartMultiSeriesMovingData(component, data){
                var chartData = $scope.displaydata[component._id];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1){
                    chartData.labeldata[keyindex] = label;
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        if( component, data[component.series[seriesCount]] ){
                            var converted = countChartValue( component, data[component.series[seriesCount]] );
                            chartData.dataset[seriesCount].data[keyindex] = ( [ label, converted.value ] );
                            chartData.tempData[seriesCount].data[keyindex] = ( [ label, data[component.series[seriesCount]] ] );
                            
                            //change value to KB/MB/GB
                            changeValueFlowChart( component, seriesCount, converted );
                        }
                    }
                }
                else{
                    pushDataForFlowChart(component, data, label);

                    if(component.series.length > 1){
                        var maxVal = Math.max.apply(null, chartData.temp);
                        var converted = countChartValue( component, maxVal );
                        changeMultiValueFlowChart( component, converted );
                    }
                }
                chnageTickLen(component, chartData.labeldata);
                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata.shift();
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.dataset[seriesCount].data.shift();
                        chartData.tempData[seriesCount].data.shift();
                    }
                }
                chartData.updateTime = new Date();
            }

            function processFlotChartMultiSeriesUpdateData(component, data){
                var chartData = $scope.displaydata[component._id];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else if( component.labelType == 'value' )
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1){
                    chartData.labeldata[keyindex] = label;
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        if( data[component.series[seriesCount]] ){
                            var oldValue = parseInt( chartData.tempData[seriesCount].data[keyindex][1] );
                            var newValue = data[component.series[seriesCount]];
                            var converted = countChartValue( component, oldValue + newValue );
                            chartData.tempData[seriesCount].data[keyindex] = ( [ label, oldValue + newValue ] );
                            //change value to KB/MB/GB
                            changeValueFlowChart( component, seriesCount, converted );
                            chartData.updateTime = new Date();
                        }
                    }
                }
                else
                    pushDataForFlowChart(component, data, label);
                
                chnageTickLen(component, chartData.labeldata.length);
            }

            function processFlotChartMultiSeriesUpsertData(component, data){
                var chartData = $scope.displaydata[component._id];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else if( component.labelType == 'value' )
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1){
                    chartData.labeldata[keyindex] = label;
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        if( data[component.series[seriesCount]] ){
                            var converted = countChartValue( component, data[component.series[seriesCount]] );
                            chartData.tempData[seriesCount].data[keyindex] = ( [ label, data[component.series[seriesCount]] ] );
                            
                            //change value to KB/MB/GB
                            changeValueFlowChart( component, seriesCount, converted );
                        }
                    }
                }
                else
                    pushDataForFlowChart(component, data, label);
                
                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.temp = chartData.temp.splice(0, component.dataelement);
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.dataset[seriesCount].data = chartData.dataset[seriesCount].data.splice(0, component.dataelement);
                        chartData.dataset[seriesCount].tempData = chartData.dataset[seriesCount].tempData.splice(0, component.dataelement);
                    }
                }
                $scope.chnageTickLen(component, chartData.labeldata.length);
                chartData.updateTime = new Date();
            }

            function chnageTickLen(component, labelData){
                var dataLen= labelData.length;
                var chartData = $scope.displaydata[component._id];
                var maxTick= (component.width*1.5).toFixed(0);
                var a= 1000;

                if(component.timeType= 'minute')
                    a= a*60;
                else if(component.timeType= 'hour')
                    a= a*3600;
                else if(component.timeType= 'day')
                    a= a*3600*24;

                var xLabelInterval= ((labelData[dataLen-1]-labelData[0])/a).toFixed(0);
                var tickDiff;

                tickDiff= Math.ceil(xLabelInterval/maxTick);
                
                if(angular.isDefined(component.timeType) && component.timeType != 'second' ){
                    var tick;
                    tick = [tickDiff, component.timeType]
                    
                    if(tick.length > 0)
                        chartData.options.xaxis.tickSize = tick;
                }
            }

            function countChartValue(component, value){
                var newValue = value;
                var unit = '';
                if( component.chartUnitAdjustFlag == 'yes' ){
                    if( component.chartUnit == 'usage' ){
                        unit = 'Bytes';

                        if(newValue >= 10*1024*1024*1024*1024){
                            newValue = ( newValue/(1024*1024*1024*1024) ).toFixed(2);
                            unit = 'TB';
                        }
                        else if(newValue >= 10*1024*1024*1024){
                            newValue = ( newValue/(1024*1024*1024) ).toFixed(2);
                            unit = 'GB';
                        }
                        else if (newValue >= 10*1024*1024){
                            newValue = ( newValue/(1024*1024) ).toFixed(2);
                            unit = 'MB';
                        }
                        else if (newValue >= 10*1024){
                            newValue = ( newValue/1024 ).toFixed(2);
                            unit = 'KB';
                        }
                    
                        /*if( newValue > 1024){
                            var datakb = ( newValue/1024 ).toFixed(1);
                            if( datakb > 1024 ){
                                var datamb = ( datakb/1024 ).toFixed(1);
                                if( datamb > 1024 ){
                                    var datagb = ( datamb/1024 ).toFixed(1);
                                    if(datagb > 1024){
                                        var datatb = ( datagb/1024 ).toFixed(1);
                                        newValue = datatb;
                                        unit = 'TB';
                                    }
                                    else{
                                        newValue = datagb;
                                        unit = 'GB';
                                    }
                                }
                                else{
                                    newValue = datamb;
                                    unit = 'MB';
                                }
                            }
                            else{
                                newValue = datakb;
                                unit = 'KB';
                            }
                        }*/
                    }
                    else if( component.chartUnit == 'speed' ){
                        unit = 'Bps';
                        if( newValue > 1024){
                            var datamb = ( newValue/1024 ).toFixed(1);
                            if( datamb > 1024 ){
                                var datagb = ( datamb/1024 ).toFixed(1);
                                if( datagb > 1024 ){
                                    var datatb = ( datagb/1024 ).toFixed(1);
                                    newValue = datatb;
                                    unit = 'Gbps';
                                }
                                else{
                                    newValue = datagb;
                                    unit = 'Mbps';
                                }
                            }
                            else{
                                newValue = datamb;
                                unit = 'Kbps';
                            }
                        }
                    }
                    else if( component.chartUnit == 'count' ){
                        unit = '';
                        if( newValue >= 1000 && newValue < 1000000)
                            unit = 'K';
                        else if( newValue >= 1000000 )
                            unit = 'MN';
                    }
                }
                return( {'value' : newValue, 'unit': unit} );
            }

            function pushDataForFlowChart(component, data, label){
                var chartData = $scope.displaydata[component._id];
                chartData.labeldata.push( label );
                if( component.series.length == 1){
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        chartData.dataset[seriesCount].data.push( [ label, converted.value ] );
                        chartData.tempData[seriesCount].data.push( [ label, data[component.series[seriesCount]] ] );
                        //change value to KB/MB/GB
                        changeValueFlowChart( component, seriesCount, converted );
                    }
                }
                else{
                    //For multiple line
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        chartData.temp.push( data[component.series[seriesCount]] );
                        chartData.dataset[seriesCount].data.push( [ label, converted.value ] );
                        chartData.tempData[seriesCount].data.push( [ label, data[component.series[seriesCount]] ] );
                    }
                }
            }

            function getUnitValue(unit,v){
                var u= unit;
                switch(u){
                    case 'Bytes':{
                        v= 0;
                        break;
                    }
                    case 'KB':{
                        v= 1;
                        break;
                    }
                    case 'MB':{
                        v= 2;
                        break;
                    }
                    case 'GB':{
                        v= 3;
                        break;
                    }
                    case 'TB':{
                        v= 4;
                        break;
                    }
                    case "Kbps":{
                        v= 5;
                        break;
                    }
                    case "Mbps":{
                        v= 6;
                        break;
                    }
                    case "Gbps":{
                        v= 7;
                        break;
                    }
                    case "K":{
                        v= 8;
                        break;
                    }
                    case "MN":{
                        v= 9;
                        break;
                    }
                }
                return v;

            }

            function changeValueFlowChart(component, seriesCount, converted){
                var chartData = $scope.displaydata[component._id];
                var v=0;
                var unitPrevValue= getUnitValue(chartData.options.yaxis.axisLabel, v);
                var unitCurrValue= getUnitValue(converted.unit, v);
                var unitFinal= '';
                if(unitPrevValue > unitCurrValue)
                    unitFinal= chartData.options.yaxis.axisLabel;
                else{
                    unitFinal= converted.unit;
                    chartData.options.yaxis.axisLabel= converted.unit;
                }

                
                for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                    var val = chartData.tempData[seriesCount].data[i][1];
                    val = getConvertedVal(val, unitFinal);
                    chartData.dataset[seriesCount].data[i][1] = val.toFixed(3);
                }
            }

            function changeMultiValueFlowChart( component, converted ){
                var chartData = $scope.displaydata[component._id];
                chartData.options.yaxis.axisLabel = converted.unit;
                _.forEach(component.series, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                        var val = chartData.tempData[seriesCount].data[i][1];
                        val = getConvertedVal(val, converted.unit);
                        chartData.dataset[seriesCount].data[i][1] = val.toFixed(3);
                    }
                });
            }
    /*End Flot Chart*/

    function getOption(options){
        var test = options;
        var test1 = test.replace(/(\r\n|\n|\r)/gm,"");
        var test2 = test1.replace(/\s+/g," ");
        //console.log(test2);
        var options = jQuery.parseJSON( test2 );
        return options;
    }

    function getConvertedVal(val, unit){
        if( unit == "KB" )
            val = val / Math.pow(2, 10);
        else if( unit == "MB" )
            val = val / Math.pow(2, 20);
        else if( unit == "GB" )
            val = val / Math.pow(2, 30);
        else if( unit == "TB" )
            val = val / Math.pow(2, 40);
        else if( unit == "Kbps" )
            val = val / 1024;
        else if( unit == "Mbps" )
            val = (val / 1024) / 1024;
        else if( unit == "Gbps" )
            val = ( (val / 1024) / 1024 ) /1024;
        else if( unit == 'K' )
            val = val / 1000;
        else if( unit == 'MN' )
            val = (val / 1000) / 1000;

        if(val % 1 === 0){
            // int
        } else{
            val = (val) ? parseFloat(val).toFixed(1) : '';
        }
        return parseFloat(val);
    }

    function redirectToOtherPage(params, component){
        var from = $scope.date.start+'T00:00:00.000Z';
        var to = $scope.date.end+'T23:59:59.999Z';
        
        var filterParams = '';
        if($scope.locationSelected.length > 0)
            filterParams += '&location='+buildFilterParams($scope.locationSelected, false);

        if($scope.ratSelected.length > 0)
            filterParams += '&rat='+buildFilterParams($scope.ratSelected, true);

        if($scope.segmentSelected.length > 0)
            filterParams += '&segment='+buildFilterParams($scope.segmentSelected, true);

        if($scope.deviceSelected.length > 0)
            filterParams += '&device='+buildFilterParams($scope.deviceSelected, false);

        filterParams += '&fromDate='+ from +'&toDate='+to;
        if(component.clickable){
            var page = component.page.split("|");
            var id = page[0];
            var table = page[1];
            httpService.get(globalConfig.dataapiurl +'/'+ table + '/' + id).then(function(res){
                var res = res.data;
                if(angular.isDefined(res.file) && res.type == 'static' ){
                    if(table == 'analysis')
                        $state.go('index.staticanalysis',{'id': id , 'params': params, 'filterParams': filterParams});
                    else if(table == 'report')
                        $state.go('index.staticreport',{'id': id, 'params': params, 'filterParams': filterParams});
                    else if(table == 'dashboards')
                        $state.go('index.staticdashboard',{'id': id, 'params': params, 'filterParams': filterParams});
                }
                else{
                    var name = res.name.split('.');
                    var name = name[0];
                    if(table == 'analysis')
                        $state.go('index.analysis',{'id': id, 'params': params, 'filterParams': filterParams});
                    else if(table == 'report')
                        $state.go('index.reports',{'id': id, 'params': params, 'filterParams': filterParams});
                    else if(table == 'dashboards')
                        $state.go('index.pages',{'id': id, 'params': params, 'filterParams': filterParams});
                    else if( table == 'redirectionoption'){
                        if(res.page == 'report')
                            $state.go('index.staticreport',{'name': name, 'file': res.name, 'params': params, 'filterParams': filterParams});
                        else
                            $state.go('index.staticanalysis',{'name':name, 'file': res.name, 'params': params, 'filterParams': filterParams});
                    }
                }
            });
        }
    }
    
    function getAndSetIndicatorIboxData(component, data, kpi){
        var dataMinofDay = timemsToMinofDay(data.Time);
        var todayDate = $filter('date')( data.Time,'MM-dd-yyyy' );

        var url = dbService.snapshotUrl({collection: 'getmoduleindicatordata', op:'select', id: component.indicatorQuery, todayDate:todayDate, dataMinofDay: dataMinofDay});
        httpService.get(url).then(function(res){
            var indicatorData = res.data;
            if(indicatorData !='null' && angular.isDefined(indicatorData[kpi]) ){
                var oldValue = indicatorData[kpi];
                setIndicatorIbox(component, oldValue, data[kpi]);
            }
            else{
                httpService.get(globalConfig.pullfilterdataurl + component.indicatorQuery).then(function(response){
                    var temp = [];
                    temp[0] = '';
                    var flag = false;
                    var oldValue;
                    for(var i = 0; i<response.data.length; i++ ){
                        var value = response.data[i];
                        var tmpKey = timemsToMinofDay(value.timems);
                        temp[tmpKey] = value;

                        if(dataMinofDay == tmpKey){
                            if(kpi){
                                oldValue = value[kpi];
                                flag = true;
                            }
                        }
                    }
                    if(flag){
                        var indicatorData = temp;
                        var tmpdata = {};
                        tmpdata[todayDate] = indicatorData;
                        var req = {'id': component.indicatorQuery, 'data': tmpdata};
                        var url = dbService.snapshotUrl({collection: 'setmoduleindicatordata', op:'create'});
                        httpService.post(url, req).then(function(res){
                        //$http.post(globalConfig.snapshoturl +'setmoduleindicatordata', req).then(function(res){
                        });
                        setIndicatorIbox(component, oldValue, data[kpi]);
                    }
                });
            }
        });
    }

    function getAndSetIndicatorIboxData2(component, data, kpi2){
        var dataMinofDay = timemsToMinofDay(data.Time);
        var todayDate = $filter('date')( data.Time,'MM-dd-yyyy' );

        var url = dbService.snapshotUrl({collection: 'getmoduleindicatordata', op:'select', id: component.indicatorQuery2, todayDate:todayDate, dataMinofDay: dataMinofDay});
        httpService.get(url).then(function(res){
            var indicatorData = res.data;
            if( indicatorData !='null' && angular.isDefined(indicatorData[kpi2]) ){
                var oldValue = indicatorData[kpi2];
                setIndicatorIbox2(component, oldValue, data[kpi2]);
            }
            else{
                httpService.get(globalConfig.pullfilterdataurl + component.indicatorQuery2).then(function(response){
                    var temp = [];
                    temp[0] = '';
                    var flag = false;
                    var oldValue;
                    for(var i = 0; i<response.data.length; i++ ){
                        var value = response.data[i];
                        var tmpKey = timemsToMinofDay(value.timems);
                        temp[tmpKey] = value;

                        if(dataMinofDay == tmpKey){
                            if(kpi2){
                                oldValue = value[kpi2];
                                flag = true;
                            }
                        }
                    }
                    if(flag){
                        var indicatorData = temp;
                        var tmpdata = {};
                        tmpdata[todayDate] = indicatorData;
                        var req = {'id': component.indicatorQuery2, 'data': tmpdata};
                        var url = dbService.snapshotUrl({collection: 'setmoduleindicatordata', op:'create'});
                        httpService.post(url, req).then(function(res){
                        //$http.post(globalConfig.snapshoturl +'setmoduleindicatordata', req).then(function(res){
                        });
                        setIndicatorIbox2(component, oldValue, data[kpi2]);
                    }
                });
            }
        });
    }

    function timemsToMinofDay(timems){
        var temp = $filter('date')( timems,'H' );
        var mm = $filter('date')( timems,'mm' );
        return( parseInt(temp*60) + parseInt(mm) );
    }

    function setIndicatorIbox(component, oldValue, newValue){
        var iboxData = $scope.displaydata[component._id];
        var percent;
        var substr =  newValue - oldValue;
        var oldValue = (oldValue) ? oldValue : 1;
        if(substr > 0){
            percent = ((substr/oldValue) * 100).toFixed(2) + '%';
            iboxData.indicatorClass = 'fa fa-level-up';
            iboxData.indicatorValue = percent;

            if(component.danger && component.danger == 'up')
                iboxData.spanclass = 'text-danger';
            else
                iboxData.spanclass = 'text-navy';
        }
        else if( substr < 0){
            percent = Math.abs( ((substr/oldValue) * 100).toFixed(2) )+ '%';
            iboxData.spanclass = 'text-danger';
            iboxData.indicatorClass = 'fa fa-level-down';
            iboxData.indicatorValue = percent;

            if(component.danger && component.danger == 'up')
                iboxData.spanclass = 'text-navy';
            else
                iboxData.spanclass = 'text-danger';
        }
        else{
            iboxData.spanclass = 'text-success';
            iboxData.indicatorClass = 'fa fa-bolt';
            iboxData.indicatorValue = '0%';
        }
    }

    function setIndicatorIbox2(component, oldValue, newValue){
        var iboxData = $scope.displaydata[component._id];
        var percent;
        var substr =  newValue - oldValue;
        var oldValue = (oldValue) ? oldValue : 1;
        if(substr > 0){
            percent = ((substr/oldValue) * 100).toFixed(2) + '%';
            iboxData.indicatorClass2 = 'fa fa-level-up';
            iboxData.indicatorValue2 = percent;

            if(component.danger2 && component.danger2 == 'up')
                iboxData.spanclass2 = 'text-danger';
            else
                iboxData.spanclass2 = 'text-navy';
        }
        else if( substr < 0){
            percent = Math.abs( ((substr/oldValue) * 100).toFixed(2) )+ '%';
            iboxData.spanclass2 = 'text-danger';
            iboxData.indicatorClass2 = 'fa fa-level-down';
            iboxData.indicatorValue2 = percent;

            if(component.danger2 && component.danger2 == 'up')
                iboxData.spanclass2 = 'text-navy';
            else
                iboxData.spanclass2 = 'text-danger';
        }
        else{
            iboxData.spanclass2 = 'text-success';
            iboxData.indicatorClass2 = 'fa fa-bolt';
            iboxData.indicatorValue2 = '0%';
        }
    }
    var intervalsArr = [];
    function setTimeInterval(component){
        if( angular.isDefined(component.frequency)){
            timeInterval(component);
            var intervalTime = parseInt(component.frequency);
            console.log('intervalTime>>>>', component.name +' = '+ intervalTime);
            if( intervalTime != 0){
                var interval = $interval(function(){
                    timeInterval(component);
                }, intervalTime * 60 * 1000);
                intervalsArr.push(interval);
            }
        }    
    }

    $scope.$on('$destroy',function(){
        if(intervalsArr.length > 0){
            for(var i in intervalsArr){
                $interval.cancel(intervalsArr[i]);
            }
        }
    });

    function timeInterval(component){
        console.log('timeInterval >>>>', component.title );
        // $scope.date.start = '2016-10-12';
        // $scope.date.end = '2016-10-26';
        // var from = $filter('date')( new Date().getTime()-24*60*60*1000 , "yyyy-MM-dd");
        var from = $scope.date.start+'T00:00:00.000Z';

        // var to = $filter('date')( new Date().getTime() , "yyyy-MM-dd");
        var to = $scope.date.end+'T23:59:59.999Z';
        var parameter = '';
        if($scope.planSelected !='')
            parameter += '&plan='+$scope.planSelected;

        parameter += '&fromDate='+ from +'&toDate='+to;
        if(component.statement.dataSource == 'DBPull')
            parameter += '&dbPullType='+ component.statement.dbPullType;
        if(component.statement.dbPullType == 'redis')
            parameter += '&name='+component.statement.name;
        
        httpService.get(globalConfig.pullfilterdataurl + component.query + parameter).then(function(res){
            
            if(res.data.length == 0)
                $scope.displaydata[component._id].loader = false;

            if( angular.isDefined(res.data) && res.data.length > 0)
                processReplaceData(component, res);
        });
    }

    $scope.dtOptions = {
        paging : true,
        searching : true,
        bLengthChange : true,
        bSort : true,
        bInfo : true,
        bAutoWidth : true
    };

    function toFixeValue( value ){
        return value.toFixed(2);
    }
    //End Module functionality

    //For Filter
    var months= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var tzoffset= 5.5*3600*1000;
    
    function btnData (a,b,c) {
        this.id = a;
        this.val = b;
        this.index= c;
    }

    var btnArray= [];
    var index= -1;
    var t= new Date().getTime();
    
    //Current year
    var curYear= $filter('date')(t, 'yyyy');
    btnArray[++index]= new btnData(curYear,curYear,index);
    
    //Last months of the year
    var mnNow= $filter('date')(t, 'M');
    for(var i=0; i< mnNow; i++){
        btnArray[++index]= new btnData(curYear + '-' + $filter('date')(t-i*30*24*3600*1000, 'MM'), months[mnNow-1-i],index); 
    }
    
    //Last 7 days
    var tNow= t;
    for(var i=7; i> 0; i--){
        if(i == 7 ||  i== 1){
            tNow= t - i*24*3600*1000;
            btnArray[++index]= new btnData($filter('date')(tNow, 'yyyy-MM-dd'),i + 'D',index);
        }
    }
    
    //Today
    btnArray[++index]= new btnData($filter('date')(t, 'yyyy-MM-dd'),'Today',index);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        httpService.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            var objArray = response.data;
            var devicewiseUsage= function  (a,b) {
                this.device = a;
                this.usage = b;
            }
            var devicewiseUsageData = [];
        
            if(objArray.length>0){
               for (var i = 0; i < objArray.length; i++) {
                   devicewiseUsageData[i] = new devicewiseUsage(objArray[i]._id.company, dataval.getData(objArray[i].total.toFixed(3)));
               }
               $scope.MostPopularDevices=devicewiseUsageData;
            }
            else
                initDeviceUsage();
        });
    }

    function initDeviceUsage(){
        /**
        *   inilializing table for Device type wise Usage 
        **/
        var devicewiseUsage= function  (a,b) {
            this.device = a;
            this.usage = b;
        }
        var devicewiseUsageData = [];
        devicewiseUsageData[0] = new devicewiseUsage('No Data','');
        $scope.MostPopularDevices= devicewiseUsageData; 
    }
    initDeviceUsage();

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    $scope.locationSelected = [];
    //af81a436a4337a900b320189f
    //aa1138f3447ab9ab639515df4
    $scope.loadLocation = function(){
        //httpService.get(globalConfig.pulldataurlbyname + 'Location Filter till City').then(function (response) {
        var sort = JSON.stringify({ 'country' : 1});
        var params = 'collection=lku_country&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response){
            _.forEach(response.data, function(item){
                item.title = item.country;
                item.key = item.countryid;
            });
            var children = null;
            if(response.data.length > 0)
                children = response.data;

            $("#location").dynatree({
                checkbox: true,
                selectMode: 3,
                children: children,
                classNames: {connector: "dynatree-expander", nodeIcon: ''},
                onSelect: function(select, node) {
                    // Display list of selected nodes
                    var selNodes = node.tree.getSelectedNodes();
                    // Get a list of all selected nodes, and convert to a key array:
                    var selKeysSegment;
                    selKeysSegment = $.map(selNodes, function(node){
                        //console.log("node: ",node)
                        $scope.selectStatus= true;
                        return node;
                    })
                    var keyArrayParent= [];
                    var keyArrayResult= [];
                    var ttlArrayResult= [];

                    // Get a list of all selected nodes, and convert to a key array:
                    angular.forEach(selKeysSegment,function(node){
                        var thisNode= node.data;
                        var nodeKey= node.data.key;
                        var thisParent = node.parent;
                        var parentKey =thisParent.data.key;
                        var nodeTitle= node.data.title;
                        if(thisNode.isFolder){
                            //First check if parent exists
                            if(!chkEntry(keyArrayParent,parentKey)){
                                //Parent key does not exist, so add this entry in parent & result
                                keyArrayParent.push(nodeKey);
                                var getParentRes = getParents(node);
                                if(getParentRes != '_1'){
                                    keyArrayResult.push(getParents(node)+"."+nodeKey );
                                    ttlArrayResult.push( getParentsTitle(node) + nodeTitle );
                                    //keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                                }else{
                                    keyArrayResult.push(nodeKey );
                                    ttlArrayResult.push( nodeTitle );
                                    //keyArrayResult.push("/^." + nodeKey + "/");
                                }
                            }else{
                                //My parents is selected, means I am already selected, 
                                //so add self into parent list
                                keyArrayParent.push(nodeKey);
                            }
                        }else{
                            //This is child case
                            //Check if this child's parent exists in result
                            if(!chkEntry(keyArrayParent,parentKey)){
                                //Since parent does not exist, add this in result
                                //keyArrayResult.push(getParents(node)+"."+nodeKey);
                                var getParentRes = getParents(node);
                                if(getParentRes != '_1'){
                                    keyArrayResult.push(getParents(node)+"."+nodeKey);
                                    ttlArrayResult.push( getParentsTitle(node) + nodeTitle );
                                    //keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                                }else{
                                    keyArrayResult.push(nodeKey);
                                    ttlArrayResult.push(nodeTitle);
                                    //keyArrayResult.push("/^." + nodeKey + "/");
                                }
                            }
                        }
                    });
                    console.log("keyArrayResult: ",keyArrayResult);

                    $scope.locationSelected = keyArrayResult;
                    $scope.selLocationTitle= ttlArrayResult;
                    var test = '';
                    angular.forEach(selKeysSegment, function(value, key){
                        test += '&'+value + '=' + value;
                    });
                    $scope.selectedSegment = test;
                    
                },
                onDblClick: function(node, event) {
                    node.toggleSelect();
                },
                onClick: function(node, event){
                    $scope.selectStatus= false;
                    if(angular.isDefined(node.data.countryid) && !angular.isDefined(node.data.circleid) && node.childList == null ){
                        var query = JSON.stringify({'countryid': node.data.countryid});
                        var sort = JSON.stringify({ 'circle' : 1});
                        var params = 'collection=lku_circle_list&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res) {
                            _.forEach(res.data, function(item){
                                item.title = item.circle;
                                item.key = item.circleid;
                            });
                            if($scope.selectStatus==false){
                                var child = $("#location").dynatree("getTree").getNodeByKey(node.data.key);
                                child.data.isFolder = true;
                                child.select(false);
                                child.addChild(res.data);
                                node.toggleExpand();
                            }
                        });
                    }
                    else if(angular.isDefined(node.data.circleid) && !angular.isDefined(node.data.cityid) && node.childList == null ){
                        var query = JSON.stringify({'circleid': node.data.circleid});
                        var sort = JSON.stringify({ 'city' : 1});
                        var params = 'collection=lku_city_list&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res){
                            _.forEach(res.data, function(item){
                                item.title = item.city;
                                item.key = item.cityid;
                            });
                            if($scope.selectStatus==false)
                            {
                                    var child = $("#location").dynatree("getTree").getNodeByKey(node.data.key);
                                    child.data.isFolder = true;
                                    child.select(false);
                                    child.addChild(res.data);
                                    node.toggleExpand();
                            }
                        });
                    }
                    else if(angular.isDefined(node.data.cityid) && !angular.isDefined(node.data.areaid) && node.childList == null ){
                        var query = JSON.stringify({'cityid': node.data.cityid});
                        var sort = JSON.stringify({ 'area' : 1});
                        var params = 'collection=lku_area_list&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res){
                            _.forEach(res.data, function(item){
                                item.title = item.area;
                                item.key = item.areaid;
                            });
                            if($scope.selectStatus==false)
                            {
                                var child = $("#location").dynatree("getTree").getNodeByKey(node.data.key);
                                child.data.isFolder = true;
                                child.select(false);
                                child.addChild(res.data);
                                node.toggleExpand();
                            }
                        });
                    }
                    else if(angular.isDefined(node.data.areaid) && !angular.isDefined(node.data.cellid) && node.childList == null ){
                        var query = JSON.stringify({'areaid': node.data.areaid});
                        var sort = JSON.stringify({ 'cellid' : 1});
                        var params = 'collection=lku_cell_list&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res){
                            _.forEach(res.data, function(item){
                                item.title = item.cellid;
                                item.key = item.cellid;
                            });
                            if($scope.selectStatus==false)
                            {
                                    var child = $("#location").dynatree("getTree").getNodeByKey(node.data.key);
                                    child.data.isFolder = true;
                                    child.select(false);
                                    var tmp = child.addChild(res.data);
                                    tmp.data.addClass = 'location';
                                    node.toggleExpand();
                                    var test = $('.location').closest('ul').addClass('lastChild');
                                    $('.lastChild').find('.dynatree-expander').removeClass('dynatree-expander').addClass('dynatree-connector');
                            }
                        });
                    }
                },
                onKeydown: function(node, event) {
                    if( event.which == 32 ) {
                        node.toggleSelect();
                        return false;
                    }
                }
            });
            
        });
    }

    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
        return parent;
    }

    function getParentsTitle(node){
        var parent="";
        while(node.parent){
            var ttl = (node.parent.data.title)? node.parent.data.title : '';
            if(parent == ""){
                if(ttl != 'India' && ttl != '')
                    parent = ttl;
            }
            else{
                if(ttl != 'India' && ttl != '')
                    parent = ttl + "." + parent;
            }
            node = node.parent;
        }
        parent = (parent) ? parent+'.' : '';
        //console.log("-- while parent :", parent);
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else
            console.log("else...");
    }

    $scope.ratSelected = [];
    $scope.loadRat = function(){
        var rat = globalData.filterRat;
        $("#rat").dynatree({
            checkbox: true,
            selectMode: 3,
            children: rat,
            onSelect: function(select, node) {
                // Get a list of all selected nodes, and convert to a key array:
                var selNodes = node.tree.getSelectedNodes();
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];
                angular.forEach(selKeysSegment,function(node){
                    var thisNode= node.data;
                    var nodeKey= node.data.key;
                    var thisParent = node.parent;
                    var parentKey =thisParent.data.key;
                    if(thisNode.isFolder){
                        if(!chkEntry(keyArrayParent,parentKey)){
                            keyArrayParent.push(nodeKey);
                            keyArrayResult.push(nodeKey);
                            //keyArrayResult.push(getParents(node)+nodeKey);
                        }else{
                            keyArrayParent.push(nodeKey);
                        }
                    }else{
                        if(!chkEntry(keyArrayParent,parentKey)){
                            keyArrayResult.push(nodeKey);
                            //keyArrayResult.push(getParents(node)+nodeKey);
                        }
                    }
                });
                console.log("rate: ",keyArrayResult)
                $scope.ratSelected = keyArrayResult;
                $scope.selKeysRAT= keyArrayResult;
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        });
    };
    $scope.loadRat();

    $scope.segmentSelected = [];
    $scope.loadSegment = function(){
        var segmentData = globalData.filterSegment;
        $("#segment").dynatree({
            checkbox: true,
            selectMode: 3,
            children: segmentData,
            onSelect: function(select, node) {
                // Get a list of all selected nodes, and convert to a key array:
                var selNodes = node.tree.getSelectedNodes();
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];
                angular.forEach(selKeysSegment,function(node){
                    var thisNode= node.data;
                    var nodeKey= node.data.key;
                    var thisParent = node.parent;
                    var parentKey =thisParent.data.key;
                    if(thisNode.isFolder){
                        if(!chkEntry(keyArrayParent,parentKey)){
                            keyArrayParent.push(nodeKey);
                            if(getParents(node) == '_1')
                                keyArrayResult.push(nodeKey);
                            else
                                keyArrayResult.push(nodeKey);
                                //keyArrayResult.push(getParents(node)+nodeKey);
                        }else{
                            keyArrayParent.push(nodeKey);
                        }
                    }else{
                        if(!chkEntry(keyArrayParent,parentKey)){
                            if(getParents(node) == '_1')
                                keyArrayResult.push(nodeKey);
                            else
                                keyArrayResult.push(nodeKey);
                                //keyArrayResult.push(getParents(node)+nodeKey);
                        }
                    }
                });
                console.log("segment: ",keyArrayResult)
                $scope.segmentSelected = keyArrayResult;
                $scope.selKeysSegment= keyArrayResult;
            },
            onDblClick: function(node, event) {
                node.toggleSelect();
            },
            onKeydown: function(node, event) {
                if( event.which == 32 ) {
                    node.toggleSelect();
                    return false;
                }
            }
        });
    };
    $scope.loadSegment();

    $scope.deviceSelected = [];
    $scope.loadDevice = function(){
        //httpService.get(globalConfig.pulldataurlbyname + 'Device Filter till Company').then(function (response){
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_company&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response){
            _.forEach(response.data, function(item){
                item.title = item.company;
                item.key = item.companyid;
                item.parent = 1;
            });
            var children = response.data;
            //var children = response.data[0].children//globalData.filterDevice[0].children;
            $("#device").dynatree({
                checkbox: true,
                selectMode: 3,
                children: children,
                classNames: {connector: "dynatree-expander", nodeIcon: ''},
                onSelect: function(select, node) {
                    // Get a list of all selected nodes, and convert to a key array:
                    var selNodes = node.tree.getSelectedNodes();
                    var selKeysSegment;
                    selKeysSegment = $.map(selNodes, function(node){
                        $scope.selectStatus=true;
                        return node;
                    })
                    var keyArrayParent= [];
                    var keyArrayResult= [];
                    var ttlArrayResult= [];

                    angular.forEach(selKeysSegment,function(node){
                        var thisNode= node.data;
                        var nodeKey= node.data.key;
                        var thisParent = node.parent;
                        var parentKey =thisParent.data.key;
                        var nodeTitle= node.data.title;
                        if(thisNode.isFolder){
                            if(!chkEntry(keyArrayParent,parentKey)){
                                keyArrayParent.push(nodeKey);
                                var getParentRes = getParents(node);
                                if(getParentRes != '_1'){
                                    keyArrayResult.push(getParents(node)+"."+nodeKey );
                                    ttlArrayResult.push( getParentsTitle(node) + nodeTitle );
                                    //keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                                }else{
                                    keyArrayResult.push(nodeKey);
                                    ttlArrayResult.push( nodeTitle );
                                    //keyArrayResult.push("/^." + nodeKey + "/");
                                }
                            }else{
                                keyArrayParent.push(nodeKey);
                            }
                        }else{
                            if(!chkEntry(keyArrayParent,parentKey)){
                                var getParentRes = getParents(node);
                                if(getParentRes != '_1'){
                                    keyArrayResult.push(getParents(node)+"."+nodeKey );
                                    ttlArrayResult.push( getParentsTitle(node) + nodeTitle );
                                    //keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                                }else{
                                    keyArrayResult.push(nodeKey );
                                    ttlArrayResult.push( getParentsTitle(node) + nodeTitle );
                                    //keyArrayResult.push("/^." + nodeKey + "/");
                                }
                            }
                        }
                    });
                    console.log("device: ",keyArrayResult)
                    $scope.deviceSelected = keyArrayResult;
                    $scope.selDeviceTitle= ttlArrayResult;
                },
                onDblClick: function(node, event) {
                    node.toggleSelect();
                },
                onClick: function(node, event){
                    $scope.selectStatus=false;
                    if(angular.isDefined(node.data.companyid) && angular.isDefined(node.data.parent) && node.childList == null ){
                        var query = JSON.stringify({'companyid': node.data.companyid});
                        var sort = JSON.stringify({ 'model' : 1});
                        var params = 'collection=lku_phone_model&query=' + encodeURIComponent(query)+'&sort=' + encodeURIComponent(sort);
                        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (res){
                            _.forEach(res.data, function(item){
                                item.title = item.model;
                                item.key = item.modelid;
                            });
                            if($scope.selectStatus==false){
                                var child = $("#device").dynatree("getTree").getNodeByKey(node.data.key);
                                child.data.isFolder = true;
                                child.select(false);
                                var tmp = child.addChild(res.data);
                                tmp.data.addClass = 'device';
                                node.toggleExpand();
                                var test = $('.device').closest('ul').addClass('lastChild');
                                $('.lastChild').find('.dynatree-expander').removeClass('dynatree-expander').addClass('dynatree-connector');
                            }
                        });
                    }
                },
                onKeydown: function(node, event) {
                    if( event.which == 32 ) {
                        node.toggleSelect();
                        return false;
                    }
                }
            });

           /* if(angular.isDefined(globalConfig.deviceArr) && globalConfig.deviceArr.length > 0){
                console.log('device if');
                setDeviceTree(globalConfig.deviceArr);
            }
            else{
                console.log('device else');
                $http.get(globalConfig.pulldataurl + 'aa3ddd5c44de4b96aebf7684c').then(function (response) {
                    //console.log('testr',response.data[0].children);
                    globalConfig.deviceArr = response.data[0].children;
                    var children = response.data[0].children;
                    //console.log('children', children);
                    setDeviceTree(children);
                });
            }*/
        })
    }
    $timeout(function(){
        if( $scope.report){
            
        }
    }, 5000);

    $scope.planSelected = '';
    $scope.plan = [];
    $scope.loadPlan = function(){
        httpService.get(globalConfig.pulldataurl + 'a3f2dab134e019bd98eb95528').then(function (response) {
            var children = response.data;
            $scope.plan = children;
        });
    }
    if( $scope.report && $scope.report.filter.indexOf('plan') > -1 ){
        $scope.loadPlan();
    }

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
            $scope.planTree = false;
        }
    }

    $scope.rat = function (){
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
            $scope.planTree = false;
        }
    }

    $scope.segment = function (){
        if($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
            $scope.planTree = false;
        }
    }

    $scope.device = function (){
        if($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
            $scope.planTree = false;
        }
    }

    $scope.plan = function (){
        if ($scope.planTree)
            $scope.planTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
            $scope.planTree = true;
        }
    }

    $scope.locationinfo= "All Locations";
    $scope.ratinfo= "All RATs";
    $scope.segmentinfo= "All Segments";
    $scope.deviceinfo= "All Devices";

    $scope.filterGetParams= function(){
        $scope.locationinfo= filterService.getLocationInfo($scope.selLocationTitle);
        $scope.ratinfo= filterService.getRATInfo($scope.selKeysRAT);
        $scope.segmentinfo= filterService.getSegmentInfo($scope.selKeysSegment);
        $scope.deviceinfo= filterService.getDeviceInfo($scope.selDeviceTitle);
        
    }

    $scope.search = function (date){
        $scope.locationTree = false;
        $scope.ratTree = false;
        $scope.segmentTree = false;
        $scope.deviceTree = false;
        $scope.planTree = false;
        
        $scope.filterGetParams();
        var parameter = '';
        if($scope.locationSelected.length > 0)
            parameter += '&location='+buildFilterParams($scope.locationSelected, false);

        if($scope.ratSelected.length > 0)
            parameter += '&rat='+buildFilterParams($scope.ratSelected, true);

        if($scope.segmentSelected.length > 0)
            parameter += '&segment='+buildFilterParams($scope.segmentSelected, true);

        if($scope.deviceSelected.length > 0)
            parameter += '&device='+buildFilterParams($scope.deviceSelected, false);

        if($scope.planSelected !='')
            parameter += '&plan='+$scope.planSelected;

        if($scope.text != '')
            parameter += '&'+$scope.report.txt+'='+$scope.text;

        if($scope.report.filter.indexOf('date')> -1){
            var from = date.start+'T00:00:00.000Z';
            var to = date.end+'T23:59:59.999Z';

            parameter += '&fromDate='+ from +'&toDate='+to;
        }

        if($scope.report.filter.indexOf('singleDatepicker')> -1){
            
            var from = $scope.date.start+'T00:00:00.000Z';
            var to = $scope.date.start+'T23:59:59.999Z';

            parameter += '&fromDate='+ from +'&toDate='+to;
        }
        var componentArr = $scope.displaydata;
        _.forEach(componentArr, function(value, key){
            var component = value.component;
            $scope.displaydata[component._id].loader = true;
            $scope.displaydata[component._id].data= [];   
            httpService.get(globalConfig.pullfilterdataurl + component.query + parameter).then(function(res){
                if(res.data.length == 0)
                    $scope.displaydata[component._id].loader = false;
                else
                    processReplaceData(component, res);
            });
        });
    }

    //datepicker- date change event
    $scope.changeDate = function (modelName, newDate){
        var dateSelect= newDate.format();
        dateSelect= dateSelect.substr(0,10);
        $scope.date.start= dateSelect;
        $scope.search($scope.date.start);
    }

    function buildFilterParams(values, inQuote){
        var result="[";
        var i;
        var l = values.length;
        for(i=0; i<l; i++){
            if(inQuote){
                result += "'"+values[i]+"'";
            }else{
                result += values[i]
            }
            if(i!=l-1) result += ',';
        }
        return result+"]";
    }
    //End Filter

    function processReplaceData(component, res){
        if( component.type == 'simple_ibox' || component.type == 'simple_ibox_with_dual_data_point' )
            processIBoxSnapshotData(component, res.data);
        else if( component.type == 'simple_table' || component.type == 'table_with_search' )
            processTableReplaceData(component, res.data);
        else if( component.type == 'col_extended_table' )
            complexTableReplaceData(component, res.data);
        else if( component.type == 'simple_charts')
            processReplaceChartData(component, res);
        else if( component.type == 'ibox_with_embeded_chart' ){
            if( component.dataKpi == 'DBPull' )
                processIBoxWithChartData(component, res.data[0]);
            if( component.data == 'DBPull' ){
                processReplaceChartData(component, res);
            }
        }
        else if( component.type == 'map')
            mapReplaceData(component, res.data);
        else if( component.type == 'gauge' )
            processGauge(component, res.data[0]);
    }

    function processReplaceChartData(component, res){
        if( component.libType == 'flot'){
            if( component.chartType == 'Line')
                processFlotChartMultiSeriesReplaceData(component, res.data);
            else if( component.chartType == 'Pie' )
                pieFlotReplaceData(component, res.data);
        }
        else if( component.libType == 'ChartJS' ){
            if( component.chartType == 'Bar' || component.chartType == 'Line' )
                processChartMultiSeriesReplaceData(component, res.data);
            else
                processChartSingleSeriesReplaceData(component, res.data);
        }
        else if( component.libType == 'D3'){
            if(component.chartType == 'Pie')
                pieD3ReplaceData(component, res.data);
            else if( component.chartType == 'Line' || component.chartType == 'Bar' )
                multiSeriesD3ReplaceData(component, res.data);
            else if( component.chartType == 'Scatter')
                scatterD3ReplaceData(component, res.data);
        }
        else if( component.libType === 'highchart' ){
            if( component.chartType == 'StackedBar'|| component.chartType == 'StackedBarHorizontal')
                highchartStackedBarReplace( component, res.data );
            else if( component.chartType == 'Pyramid' )
                pyramidReplaceData( component, res.data );
            else if( component.chartType == 'Pie' )
                highchartSingleSeriesReplace( component, res.data );
            else if( component.chartType == 'MultiLine' || component.chartType == 'Bubble')
                highchartMultiLineReplace( component, res.data );
            else if( component.chartType == 'Scatter' )
                highchartScatterReplace( component, res.data);
            else if( component.chartType == 'LinePlushBar')
                highchartLinePlushBarReplace( component, res.data);
            else
                highchartReplaceData( component, res.data );
        }
    }

    //Module Details
    $scope.detail = function (item){
        globalConfig.module = angular.copy(item);
        $scope.module = item;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/moduleDetail.html',
            size: 'lg',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    };

    //unit list dropdown col_extended table
    $scope.unitArr= {'usage':['Auto', 'TB', 'GB', 'MB', 'KB', 'Bytes'], count:['Auto', 'B', 'M', 'k'], speed: ['Auto', 'Gbps', 'Mbps', 'Kbps', 'Bps']};
    $scope.getUnitUsage= 'Auto';
    $scope.getUnitCount= 'Auto';
    $scope.getUnitSpeed= 'Auto';
    $scope.chngUnit_col_extd_tbl= function(unit,component){ //unit change event col_extended table
        // console.log("unit", unit);
        $scope.getUnitUsage= unit;
        // console.log("component.component", component.component);
        // console.log("$scope.objArrayforPaging", $scope.objArrayforPaging);
        complexTableReplaceData(component.component, $scope.objArrayforPaging);
    }

});