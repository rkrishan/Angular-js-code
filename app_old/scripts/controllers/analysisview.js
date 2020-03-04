'use strict';

angular.module('specta')
    .controller('AnalysisViewCtrl', function ($scope, $interval, $location, $http, $state, $filter, NgMap, globalConfig, $stateParams, ChartService, SweetAlert, UserProfile,$rootScope,socket,$timeout,NgTableParams) {
    
    if (!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null) {
        $location.path('/login');
    }
    
    $scope.exportModule = function(component, type){
        console.log(component);
        //$('#{{component.component._id}}').tableExport({type:'pdf',escape:'false',tableName:'Handset wise Traffic'});
        $('#'+component._id).tableExport({type: type, pdfFontSize:'10', escape:'false', tableName: component.name});
    }

    $scope.dataTableExport = function(component, type){
        $('#'+component._id).dataTable({ destroy: true, searching: false, 'bInfo': false, paging: false, order: [[2,'desc']]});
        $('#'+component._id).tableExport({type: type, pdfFontSize:'10',  escape:'false', tableName: component.name});
        $('#'+component._id).dataTable({ destroy: true, searching: false,'bInfo': false, 'bLengthChange': false, paging: true, order: [[2,'desc']]});
    }

    $scope.dataTableSelectedRow = function(component){
        var table = $('#'+component._id).DataTable();
        var test;
        $('#'+component._id+' tbody').on( 'click', 'tr', function () {
            test = table.row(this).data();
        } );
        $timeout(function(){
            console.log('row', test);
        }, 100);
        /*$('#'+component._id+' tbody').on( 'click', 'tr', function () {
            $(this).toggleClass('selected');
        } );

        var ids = $.map(table.rows(this).data(), function (item) {
            return item[0]
        });
        console.log(ids);*/ 
    }

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

    $scope.sortableOptions = {
        connectWith: ".connectPanels",
        handler: ".ibox-title"
    };
     
    if(angular.isDefined($stateParams.id)){
        $scope.dashboardId = $stateParams.id;
        $http.get($scope.apiURL + '/analysis/' + $stateParams.id).then(function (response) {
            console.log('report',response.data);
            $scope.report = response.data;
            if($scope.report.filter && $scope.report.filter.indexOf('date') > -1){
                var day = 24*parseInt($scope.report.day);
                var day = day*60*60*1000;
                var from = $filter('date')( new Date().getTime()- day, "yyyy-MM-dd");
                var to= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
                $scope.date= {"start":from, "end":to};
            }
            else{
                var from = $filter('date')( new Date().getTime()-24*60*60*1000 , "yyyy-MM-dd");
                var to = $filter('date')( new Date().getTime() , "yyyy-MM-dd");
                $scope.date= {"start":from,"end":to};
            }
            console.log('start date', $scope.date);
            $('.input-daterange').datepicker({
                clearBtn:true,
                autoclose: true,
                assumeNearbyYear: true,
                format: "yyyy-mm-dd",
                startDate: "2016-01-01",
                endDate: "0d",
                setDate: new Date($scope.date.start)
            });
            //$('.input-daterange').datepicker('setDate', new Date($scope.date.start));
            $('.input-daterange').datepicker('update');
        });
    }
    $scope.ibox={};

    $scope.ibox.linechartOptions = {
        fill: '#1ab394',
        stroke: '#169c81',
        width: 64 
    };

    $scope.linechartdata=[1,2,3,4,5,6,7,8,9,0,1,2,3,0,1,2,3,4];

    $scope.ibox.piechartOptions = {
        fill: ["#1ab394", "#d7d7d7", "rgba(253, 180, 92, 1)"]
    };
    $scope.newtunnelchart = {};
    $scope.newtunnelchart.kpihistory = [45.46,100];

    $scope.ibox.barChartoptions = {
        fill: ["#1ab394", "#d7d7d7"]
    };

    $scope.cancel = function () {
        $scope.newPage.name = '';
    };

    // $scope.loadDashboard = function () {
    //     $http.get($scope.apiURL + '/dashboards/' + $stateParams.id).then(function (response) {
    //         //console.log(response.data)
    //         $scope.dashboard = response.data;
    //     });
    // }

    $scope.loadPages = function () {
        var data = { 'dashboardId': $stateParams.id };
        var postUrl = $scope.apiURL + '/pages?query=' + encodeURIComponent(JSON.stringify(data));
        //console.log('psoturl', postUrl);
        $http.get(postUrl).then(function (response) {
            console.log('tab list');
            console.log(response.data);
            if(angular.isDefined(response.data) && response.data.constructor === Array){
                $scope.tabLists = response.data;
            }

            if($scope.tabLists.length > 0)
            {
                $scope.setCurrentPage($scope.tabLists[0]);
            }
        });
    };

    //$scope.loadDashboard();
    
    $http.get(globalConfig.dataapiurl+'/statements').then(function(res){
        var data = res.data;
        for(var index = 0; index < data.length; index++){
            var statement = data[index];
            $scope.statements[statement.statementId] = statement;
        }
        console.log($scope.statements);
        $scope.loadPages();
    });

    //Load Chart Options
    $http.get(globalConfig.dataapiurl+'/chartoptions').then(function(res){
        $scope.chartOptionsList = res.data;
    });

    $scope.save = function (position) {
        var request = {
            'name'        : $scope.newPage.name,
            'type'        : 'analysis',
            'dashboardId' : $stateParams.id,
            'components'  : []
        };
        //console.log('save query request: ', request);
        $scope.tabLists[position].name = $scope.newPage.name;
        $scope.tabLists[position].fromDB = true;
        console.log('tab before saving: ',$scope.tabLists[position]);
        $http.post($scope.apiURL + '/pages', request).then(function (response) {
                console.log('save page response: ',response);
                if(angular.isDefined(response.data._id)){
                    $scope.tabLists[position]=response.data;
                    console.log('tab aftter saving: ',$scope.tabLists[position]);
                    $scope.setCurrentPage($scope.tabLists[position]);
                }
        });
    };

    $scope.setCurrentPage = function (item) {
        //console.log('item', item);

        var newArr = arrangeComponentWidthWise(item);
        //return false;
        item.components = newArr;
        console.log(item.components.length);
        $scope.previousPage = $scope.currentPage;
        $scope.currentPage = item;
        $scope.previousPage.active=false;
        item.active = true;

        //console.log('Current Page: ',$scope.currentPage);
        //console.log('Previous Page: ', $scope.previousPage);
        
        unsubscribeData($scope.previousPage);
        $timeout(function(){
            $rootScope.$broadcast("DashboardPageAssigned", {currentPage:$scope.currentPage} );
        },100);

        $scope.displaydata = {};

        subscribeData($scope.currentPage);
    };

    function arrangeComponentWidthWise(item){
        //console.log('test', item);
        var total = 0;
        var newArr = [];
        var newArray = [];
        var i = newArray.length;
        var totalComponenLen = item.components.length;
        _.forEach(item.components, function(value, key){
            //console.log(value);
            //console.log('width', parseFloat(value.component.width) );
            total = total + parseInt(value.component.width);
            //console.log(total);
            if(total <= 12){
                //console.log('total');
                newArray.push( value );

                if(key == totalComponenLen - 1){
                    console.log(key);
                    var test = jQuery.extend(true, [], newArray);
                    newArr.push(test);
                }

            }
            else{
                var test = jQuery.extend(true, [], newArray);
                newArr.push(test);
                
                // i++;
                total = parseInt(value.component.width);
                //console.log(total);
                newArray = [];
                newArray.push(value);

                if(key == totalComponenLen - 1){
                    //console.log('last key', key);
                    var test = jQuery.extend(true, [], newArray);
                    newArr.push(test);
                }
            }
        });
        //console.log('newArray', newArray);
        //console.log('newArr', newArr);
        return newArr;
    }

    $scope.setBlankPage = function () {
        // ChartService.setCurrentPage({ 'name': 'new' });
    };

    $scope.$on('NewPageChartAdded', function (event,arg) {
        console.log('callback on page argument: ',arg);
        addComponentToPage(arg);
    });

    $scope.$on('MovedToDifferentDashboard',function(event,arg){
        console.log('moved to different dashboard: ',arg);
        unsubscribeData(arg);
    });


    function addComponentToPage(arg){
        console.log('add component to page arg: ',arg);
        console.log('Current page: ',$scope.currentPage);

        var tmpComponent = _.filter($scope.currentPage.components, function (item) {
            return angular.isDefined(item.component) && angular.isDefined(item.component._id) && item.component._id === arg._id;
        });


        if(angular.isDefined($scope.currentPage._id) ){
            var tmpComponent = _.filter($scope.currentPage.components, function (item) {
                console.log( ' filter item: ',item);
                return angular.isDefined(item.component) && angular.isDefined(item.component._id) && item.component._id === arg.component._id;
            });

           if(angular.isDefined(tmpComponent.length) && tmpComponent.length>0){
               console.log(' Component already exists in the page. You can not add same component again.');
              alert('Component already exists in the page. You can not add same component again.');
               SweetAlert.swal({
                  title: "Component already exists in the page. You can not add same component again.",
                  text: "Component already exists in the page. You can not add same component again.",
                  type: "warning",
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Ok",
                  closeOnConfirm: true,
                  closeOnCancel: true
              },
              function (isConfirm) {
                });
            }else{
                console.log(' current page define ' );
                $scope.currentPage.components.push(arg);
                backgroundUpdatePage($scope.currentPage);
                subscribeForAllComponent(arg);
            }
        }else{
            console.log(' current page not saved so can not add control');
            alert(' current page not saved so can not add control');
            SweetAlert.swal({
                title: "Please save newly created page before adding component",
                text: "Please save newly created page before adding component",
                type: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
            });
        }
    }

    $scope.removeTab = function (position, tab) {
      event.preventDefault();
      event.stopPropagation();

      // console.log(tab);
      SweetAlert.swal({
          title: "",
          text: "Are you sure you want to remove this page " + tab.name + "?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel plx!",
          closeOnConfirm: true,
          closeOnCancel: true
      },
      function (isConfirm) {
        console.log('remove confirm: ', isConfirm);
        if(tab.active == true){
            var newPosition = 0;
            if(position > 0){
                newPosition = position -1;
            }
            $scope.setCurrentPage($scope.tabLists[newPosition]);
            // unsubscribeData(tab);
        }
          if (isConfirm) {
               if (angular.isDefined(tab._id)) {
                  $http.delete($scope.apiURL + '/pages/' + tab._id).then(function (response) {
                     console.log('delete page response: ',response);
                  });
               }

              $scope.tabLists.splice(position, 1);

          }
      });
    };

    function backgroundUpdatePage(page){
        var request = JSON.stringify(page);
        console.log(' Page update request: ',request);
        var tmp = JSON.parse(request);
        delete tmp["_id"];
        delete tmp["active"];
        console.log(' update request object',tmp);
        $http.put(globalConfig.dataapiurl + '/pages/' + page._id, tmp).then(function (updateResponse) {
            console.log('update page response: ', updateResponse);
        });
    }

    $scope.removeComponent = function (component) {
        console.log('component', component);

        //unsubscribeForComponent(component);
        console.log($scope.currentPage.components);
        var tempArr = [];
        _.forEach($scope.currentPage.components, function(item, k){
            _.forEach(item, function(value, key){
                if(value.component._id != component.component._id){
                    tempArr.push(value);
                }
            });
        });
        console.log(tempArr);
        $scope.currentPage.components = tempArr;
        backgroundUpdatePage($scope.currentPage);
        console.log($scope.currentPage);
        //$scope.setCurrentPage($scope.currentPage);
        $scope.currentPage.components = arrangeComponentWidthWise($scope.currentPage);
        //$scope.currentPage.components.splice(position,1);
        
    };

    function unsubscribeData(item){
        //console.log('unsubscribeData: ',item);
        angular.forEach(item.components, function(test, key){
            angular.forEach(test, function(value, key){
               //console.log('Unsubscribe: Value: ',value,' key: ', key);
               unsubscribeForComponent(value);
            });
        });
    }

    function unsubscribeForComponent(component){
        console.log('unsubscribeForComponent: ',component);
        if(angular.isDefined(component.component.query)){
            socket.unsubscribe(component.component.query);
        }
    }

    function subscribeData(page) {
        //console.log('subscribeData: ',page);
        angular.forEach(page.components, function(test, key){
            angular.forEach(test, function(value, key){
                console.log('subscribe: Value: ',value,' key: ', key);
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

                if(angular.isDefined(value.component.query)){
                    subscribeForAllComponent(value);
                }
                else if(angular.isDefined(value.component.url) && value.component.url != ''){
                    subscribeForAllComponent(value);
                }
            });
        });
    }

    function subscribeForAllComponent(component){
        //console.log('subscribeForAllComponent: ',component);
        switch( component.type ){
            case "ibox":
                subscribeIBox(component.component);
                break;
            case "chart":
                subscribeChart(component.component);
                break;
            case "table":
                subscribeTable(component.component);
                break;
            case "ibox_with_embeded_chart":
                subscribeIboxWithChart(component.component);
                break;
            case "map":
                subscribeMap(component.component);
                break;
        }
    }

    function subscribeChart(component){
        //console.log('subscribeChart: ',component);
        if( typeof component.options === 'undefined' ){
            component.options =  $scope.chartOptions[component.chartType];
        }
        if(typeof component.libType === 'undefined' ){
            component.libType = "ChartJS";
        }
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
                default:
                    subscribeChartMultiSeriesD3(component); //Line, CumulativeLine, StackedArea, LinePlusBar, Scatter, ScatterPlusLine
                    break;
            }
        }
        else if( component.libType === 'flot'){
            //subscribeFlotChart(component);
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
            subscribeHighchart( component );
        }
    }

    /*Map*/
        function subscribeMap(component){
            console.log('subscribeMap', component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {
                    component : component,
                    data: [],
                    labeldata:[],
                    statement: $scope.statements[component.query],
                    updateTime: ''
                };
            }
            console.log('display subscribe map data', $scope.displaydata);
            if(component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/10').then(function(res){
                    //console.log('Snapshot', res.data);
                    processSnapshotMap(component, res.data);
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('map', data);
                        if( $scope.displaydata[component._id].statement.type == 'update' ){
                            mapUpdateData(component, data.event);
                        }
                    });
                    //$scope.$apply();
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
            //console.log(tmp);
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
            var map = $scope.displaydata[component._id];
            $scope.heatMapData = [];
            
                /*new google.maps.LatLng(15.5569, 73.9251),
                new google.maps.LatLng(15.4419, 73.8987),
                new google.maps.LatLng(15.656, 73.9127),
                new google.maps.LatLng(15.70, 73.8580),
                new google.maps.LatLng(15.872, 73.9009),
                new google.maps.LatLng(15.1129, 73.8544),
                new google.maps.LatLng(15.2740, 73.8343),
                new google.maps.LatLng(15.1392, 73.9935),
                new google.maps.LatLng(15.2977, 73.9224),
                new google.maps.LatLng(15.1842, 73.9655)
            ];*/
            
            //return false;
            if( (angular.isDefined(map.statement) && map.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                map.data = [];
            }
            //var data1 = data1.splice(0, 10);
            if(component.mapType == 'simple'){
                _.forEach(data1, function(data, key){
                    var val = data[component.dataValue];
                    var icon = '';
                    if(component.shape == 'marker'){
                        if(component.icon == 'custom'){
                            _.forEach(component.to, function(v, k){
                                if( val >= component.from[k] && val < component.to[k]){
                                    icon = 'http://10.0.0.11:9000/images/'+component.customIcon[k]+'.png';
                                    return false;
                                }
                            });
                        }
                        else{
                            icon = 'http://10.0.0.11:9000/images/'+component.icon+'.png';
                        }
                    }
                    else
                        val = Math.sqrt(val) * 100;

                    if(icon != ''){
                        var tmp = {'value': val,
                            'position': [data.latitude, data.longitude],
                            'infoBoxData': {},
                            'icon': icon};
                        //console.log(tmp);
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
                        //console.log(keyIndex);
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
            }
            console.log('map data', map);
            //console.log($scope.heatMapData);
        }
        
        NgMap.getMap().then(function(map) {
            $scope.map = map;
        });

        $scope.$on('mapInitialized', function (event, map) {
            $scope.objMapa = map;
         });

        $scope.showDetail = function(evt, component, id){
            if(component.infobox){
                var map = $scope.displaydata[component._id];
                var latlng = map.data[id].position;
                $scope.infoBox = map.data[id].infoBoxData;
                console.log($scope.infoBox);
                //$scope.map.showInfoWindow(component._id, this);

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
        function subscribeHighchart( component ){
            console.log('subscribeHighchart',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = getOption(component);

                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    tempData:[],
                    statement:$scope.statements[component.query],
                    options: options,
                    updateTime: ''
                };
            }
            $scope.displaydata[component._id].options.options.yAxis.labels.formatter = function() {return Math.abs(this.value);}
            for(var i = 0; i< component.series.length; i++){
                $scope.displaydata[component._id].options.series.push({"grouping":false,'name': component.series[i], "data":[]});
                $scope.displaydata[component._id].tempData.push([]);
            }
            console.log('displaydata', $scope.displaydata);

            if( component.data != 'DBPull' ){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    processSnapshotHighchart(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        if( $scope.displaydata[component._id].statement.type === 'upsert' ){
                            highchartUpsertData(component, data.event);
                        }
                        else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                            highchartMovingData(component, data.event);
                        }
                        else if( $scope.displaydata[component._id].statement.type === 'update' ){
                            highchartUpdateData(component, data.event);
                        }
                        else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                            highchartReplaceData(component, data.event);
                        }
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function processSnapshotHighchart(component, data){
            var replace = [];
            console.log( 'type of', $scope.displaydata[component._id].statement.type);
            for(var index = 0; index < data.length; index++){
                if( $scope.displaydata[component._id].statement.type === 'upsert' ){
                    highchartUpsertData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                    highchartMovingData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'update' ){
                    highchartUpdateData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    _.forEach(data[index], function(value, key){
                        replace.push(value);
                    });
                }
            }

            if( $scope.displaydata[component._id].statement.type === 'replace' ){
                $timeout(function(){
                    highchartReplaceData(component, replace);
                }, 100);
            }
        }

        function highchartUpsertData(component, data){
            var chartData = $scope.displaydata[component._id];

            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = convertTimeStampToLabel( component, data[component.labels] );
            }
            else{
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            // console.log('label', label);
            // console.log('keyindex', keyindex);
            if( keyindex > -1 ){
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];
                    chartData.updateTime = new Date();
                }
            }
            else{
                pushHighchartData(component, data, label);
            }

            if(chartData.labeldata.length > component.dataelement){
                chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    chartData.tempData[seriesCount] = chartData.tempData[seriesCount].splice(0, component.dataelement);
                }
            }

            $timeout(function(){
                changeDataValue(component);
                console.log('upsert ',chartData);
            }, 10);
        }

        function highchartUpdateData(component, data){
            var chartData = $scope.displaydata[component._id];

            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = convertTimeStampToLabel( component, data[component.labels] );
            }
            else{
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            // console.log('label', label);
            // console.log('keyIndex', keyindex);
            if( keyindex > -1 ){
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    var oldValue = chartData.tempData[seriesCount][keyindex];
                    var newValue = data[component.series[seriesCount]];
                    chartData.tempData[seriesCount][keyindex] = parseFloat(oldValue) + parseFloat(newValue);
                    chartData.updateTime = new Date();
                }
            }
            else{
                pushHighchartData(component, data, label);
            }

            if(chartData.labeldata.length > component.dataelement){
                chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    chartData.tempData[seriesCount] = chartData.tempData[seriesCount].splice(0, component.dataelement);
                }
            }
            $timeout(function(){
                changeDataValue(component);
                console.log('update ',chartData);
            }, 10);
        }

        function highchartMovingData(component, data){
            var chartData = $scope.displaydata[component._id];

            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = convertTimeStampToLabel( component, data[component.labels] );
            }
            else{
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            if( keyindex > -1 ){
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];
                    chartData.updateTime = new Date();
                }
            }
            else{
                pushHighchartData(component, data, label);
            }

            if(chartData.labeldata.length > component.dataelement){
                chartData.labeldata.shift();
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    chartData.tempData[seriesCount].shift();
                }
            }

            $timeout(function(){
                changeDataValue(component);
                console.log('moving ',chartData);
            }, 10);
        }

        function highchartReplaceData(component, data1){
            var chartData = $scope.displaydata[component._id];

            if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                chartData.labeldata = [];
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                    chartData.options.series[seriesCount].data = [];
                    chartData.tempData[seriesCount] = [];
                }
            }
            _.forEach(data1, function(data, key){
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                }
                else{
                    var label = data[component.labels];
                }
                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1 ){
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];
                        chartData.updateTime = new Date();
                    }
                }
                else{
                    pushHighlightData(component, data, label);
                }
            });

            $timeout(function(){
                changeDataValue(component);
            }, 100);
        }

        function changeDataValue(component){
            var chartData = $scope.displaydata[component._id];
           
            var tmp = [];
            for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                var maxVal = Math.max.apply(null, chartData.tempData[seriesCount]);
                tmp.push(maxVal);
            }
            var maxVal = Math.max.apply(null, tmp);
            var converted = countChartValue( component, maxVal );

            chartData.options.options.yAxis.title.text = converted.unit;
            chartData.options.options.xAxis.categories = chartData.labeldata;
            _.forEach(component.series, function(value, seriesCount){
                chartData.options.series[seriesCount].data = [];
                for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                    var val = chartData.tempData[seriesCount][i];
                    if(converted.unit == "KB" || converted.unit == "MB" || converted.unit == "GB"){
                        if( converted.unit == "KB" ){
                            val = val / Math.pow(2, 10);
                        }else if( converted.unit == "MB" ){
                            val = val / Math.pow(2, 20);
                        }else if( converted.unit == "GB" ){
                            val = val / Math.pow(2, 30);
                        }
                    }
                    if(val % 1 === 0){
                        // int
                    } else{
                        val = (val).toFixed(1);
                    }
                    chartData.options.series[seriesCount].data.push( parseFloat(val) );
                }
            });
        }

        function pushHighchartData(component, data, label){
            var chartData = $scope.displaydata[component._id];
            chartData.labeldata.push( label );
            for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );
                chartData.updateTime = new Date();
            }
        }
    /*End Highchart*/

    /*Embeded Chart*/
        function subscribeIboxWithChart(component){
            console.log('subscribeIboxWithChart',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = _.filter($scope.chartOptionsList, function (item) {
                    return item._id == component.options;
                });
                if(options.length > 0){
                    var test = options[0].options;
                    var test1 = test.replace(/(\r\n|\n|\r)/gm,"");
                    var test2 = test1.replace(/\s+/g," ");
                    console.log(test2);
                    var options = jQuery.parseJSON( test2 );
                    console.log(options);
                }

                $scope.displaydata[component._id] = {
                    component: component,
                    kpi:'',
                    labeldata: [],
                    dataset:[],
                    tempData:[],
                    dataIndex:[],
                    statement:$scope.statements[component.query],
                    options: options,
                    updateTime: ''
                };
            }

            if(component.libType == 'flot'){
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                    $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
                }
            }
            console.log('display data after subscribing subscribeIBox tick: ' , $scope.displaydata);
            if(component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/'+ component.dataelement).then(function(res){
                    console.log('snapshoturl response :', res);
                    if(component.libType == 'flot')
                        processSnapshotMultiSeriesFlot(component, res.data);

                    socket.subscribe(component.query, function(res){
                        var ibox = component;
                        var tmp = JSON.parse(res);
                        var data = tmp[ibox.query];
                        console.log('ibox with chart data: ',data);
                        if($scope.displaydata[component._id]){
                            if( component.libType == 'flot' ){
                                if($scope.displaydata[component._id].statement.type === 'upsert'){
                                    processFlotChartMultiSeriesUpsertData(component, data.event);
                                }
                                else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                                   processFlotChartMultiSeriesMovingData(component, data.event);
                                }
                                else if( $scope.displaydata[component._id].statement.type === 'update' ){
                                    processFlotChartMultiSeriesUpdateData(component, data.event);
                                }
                                else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                    processFlotChartMultiSeriesReplaceData(component, data.event);
                                }
                            }
                            else if( component.libType == 'ChartJs' ){
                                if($scope.displaydata[component._id].statement.type === 'upsert'){
                                    processChartMultiSeriesUpsertData(component,data.event);
                                }
                                else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                                   processChartMultiSeriesMovingData(component, data.event);
                                }
                                else if( $scope.displaydata[component._id].statement.type === 'update' ){
                                    processChartMultiSeriesUpdateData(component, data.event);
                                }
                                else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                    if( $scope.displaydata[component._id].statement.eventPublish == 'Combined' ){
                                        
                                        $scope.displaydata[component._id].chartData.labeldata = [];
                                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                                            $scope.displaydata[component._id].data[seriesCount] = [];
                                        }
                                        
                                        _.forEach(data.event, function(value, key){
                                            processChartMultiSeriesReplaceData(component, value);
                                        });
                                    }
                                    else{
                                        processChartMultiSeriesReplaceData(component, data.event);
                                    }
                                }
                            }
                        }
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
            

            if(component.dataKpi != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.queryKpi + '/10').then(function(res){
                   //console.log('snapshoturl response :', res);
                    processIBoxWithChartSnapshotData(component, res.data);

                    socket.subscribe(component.queryKpi, function(res){
                        var ibox = component;
                        console.log(component.queryKpi);
                        //console.log('subscribeIBox response: ',res);
                        var tmp = JSON.parse(res);
                        console.log('tmp', tmp);
                        var data = tmp[ibox.queryKpi];
                        console.log('subscribeIBox data: ',data);
                        processIBoxWithChartData(ibox, data.event);
                        $scope.$apply();
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function processIBoxWithChartSnapshotData( component, data ){
            for(var index = 0; index < data.length; index++){
                processIBoxWithChartData(component, data[index]);
            }
        }

        function processIBoxWithChartData(component, data){
            if($scope.displaydata[component._id]){
                //console.log(component.valueKpi);
                var iboxData = $scope.displaydata[component._id];
                //if( data[component.valueKpi] ){
                    var newValue = countIBoxUnit( component, data[component.valueKpi] );
                    //console.log('newValue', newValue);
                    iboxData.kpi = newValue.value.toFixed(component.dataDecimal);
                    iboxData.unit = newValue.unit;
                    iboxData.updateTime = new Date();
                //}
                //console.log( 'after new data displaydata: ', iboxData );
            }
        }
    /*End Embeded Chart*/

    /*ChartJs*/
        //Bar
        function subscribeChartBar(component){
            console.log('subscribe Chart Bar: ',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = _.filter($scope.chartOptionsList, function (item) {
                    return item._id == component.options;
                });
                if(options.length > 0){
                    var test = options[0].options;
                    var test1 = test.replace(/(\r\n|\n|\r)/gm,"");
                    var test2 = test1.replace(/\s+/g," ");
                    //console.log(test2);
                    var options = jQuery.parseJSON( test2 );
                    console.log(options);
                }

                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata:[],
                    data:[],
                    tempData: [],
                    dataIndex:[],
                    statement:$scope.statements[component.query],
                    options: (options) ? options :$scope.chartOptions[component.libType][component.chartType],
                    updateTime:''
                };
            }
            for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                $scope.displaydata[component._id].data.push([]);
                $scope.displaydata[component._id].tempData.push([]);
            }
            console.log('display data after subscribing chartbar: ' , $scope.displaydata);

            if( component.data != 'DBPull' ){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    processSnapshotMultiSeries(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('subscribeChartBar data: ',data);
                        if($scope.displaydata[component._id]){
                            if($scope.displaydata[component._id].statement.type === 'upsert'){
                                processChartMultiSeriesUpsertData(component,data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                               processChartMultiSeriesMovingData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'update' ){
                                processChartMultiSeriesUpdateData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                processChartMultiSeriesReplaceData(component, data.event);
                            }
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function processSnapshotMultiSeries(component, data){
            var replace = [];
            console.log( 'type of', $scope.displaydata[component._id].statement.type);
            for(var index = 0; index < data.length; index++){
                if( $scope.displaydata[component._id].statement.type === 'upsert' ){
                    //var dataObj = {op:0,event:data[index]};
                    processChartMultiSeriesUpsertData( component, data[index] );
                }
                else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                    processChartMultiSeriesMovingData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'update' ){
                    processChartMultiSeriesUpdateData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    _.forEach(data[index], function(value, key){
                        replace.push(value);
                    });
                }
                /*else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    if( $scope.displaydata[component._id].statement.eventPublish == 'Combined' ){
                        _.forEach(data[index], function(value, key){
                            processChartMultiSeriesReplaceData(component, value);
                        });
                    }
                    else{
                        processChartMultiSeriesReplaceData(component, data[index]);
                    }
                }*/
            }

            $timeout(function(){
                if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    processChartMultiSeriesReplaceData(component, replace);
                }
            }, 100);
        }

        function convertTimeStampToLabel( component, timestamp ){
            if( !component.timeType )
                component.timeType = 'minute';

            var dt = new Date( timestamp );
            //var dt = new Date();
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
            //console.log(label);
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
            console.log('upsert keyindex', keyindex);
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
            }else{
                pushDataForChartJs(component, data, label);
            }
        }

        function processChartMultiSeriesMovingData(component, data){
            var chartData = $scope.displaydata[component._id];

            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = convertTimeStampToLabel( component, data[component.labels] );
            }
            else if( component.labelType == 'value' ){
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            console.log('moving keyindex', keyindex);
            console.log(label);
            if( keyindex > -1){
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
            else{
                pushDataForChartJs(component, data, label);
            }
            
            if( chartData.labeldata.length > parseInt(component.dataelement) ){
                chartData.labeldata.shift();
                for( var seriesCount = 0; seriesCount < component.series.length; seriesCount++ ){
                    chartData.data[seriesCount].shift();
                    chartData.tempData[seriesCount].shift();
                }
            }
            console.log('moving', chartData);
        }

        function processChartMultiSeriesUpdateData(component, data){
            var chartData = $scope.displaydata[component._id];
            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = convertTimeStampToLabel( component, data[component.labels] );
            }
            else if( component.labelType == 'value' ){
                var label = data[component.labels];
            }
            console.log('label = ', label);
            var keyindex = $.inArray( label, chartData.labeldata );
            console.log('update keyindex', keyindex);
            if(keyindex > -1){
                chartData.labeldata[keyindex] = label;
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    if( data[component.series[seriesCount]] ){
                        var oldValue = parseInt( chartData.tempData[seriesCount][keyindex] );
                        var newValue = data[component.series[seriesCount]];

                        console.log('oldValue for '+ label, oldValue);
                        console.log('newValue for '+ label, newValue );
                        var converted = countChartValue( component, oldValue + newValue );
                        
                        chartData.tempData[seriesCount][keyindex] =  parseInt(oldValue + newValue);
                        
                        //change value to KB/MB/GB
                        changeValueChartJs( component, seriesCount, converted );
                        chartData.updateTime = new Date();
                    }

                    /*if( data[component.series[seriesCount]] ){
                        var oldValue = parseInt(chartData.data[seriesCount][keyindex]);
                        var newValue = data[component.series[seriesCount]];
                        console.log('oldValue ', oldValue);
                        console.log('newValue ', newValue);
                        chartData.data[seriesCount][keyindex] =  toFixeValue(oldValue + newValue);
                        console.log(chartData.data[seriesCount][keyindex]);
                        chartData.updateTime = new Date();
                    }*/
                }
            }else{
                pushDataForChartJs(component, data, label);
            }
            console.log('update ', chartData);
        }

        function processChartMultiSeriesReplaceData(component, data1){
            var chartData = $scope.displaydata[component._id];
            console.log(data1.length);
            if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                chartData.labeldata = [];
                chartData.data = [[]];
                chartData.tempData = [[]];
            }

            _.forEach(data1, function(data, key){
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var label = convertTimeStampToLabel( component, data[component.labels] );
                }
                else if( component.labelType == 'value' ){
                    var label = data[component.labels];
                }
                var label = data[component.labels];
                //console.log(data);
                //console.log('label = ', label);
                var keyindex = $.inArray( label, chartData.labeldata );
                if(keyindex > -1){
                    chartData.labeldata[keyindex] = label;
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        if( data[component.series[seriesCount]] ){
                            var converted = countChartValue( component, data[component.series[seriesCount]] );

                            chartData.tempData[seriesCount][keyindex] = data[component.series[seriesCount]];
                            //change value to KB/MB/GB
                            if( component.chartType != 'Bar' ){
                                changeValueChartJs( component, seriesCount, converted );
                            }
                            chartData.updateTime = new Date();
                        }
                    }
                }
                else{
                    pushDataForChartJs(component, data, label);
                }
            });

            if( component.chartType == 'Bar'){
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    //console.log( chartData.tempData[seriesCount] );
                    var test = Math.max.apply(null, chartData.tempData[seriesCount]);
                    console.log(chartData.tempData[seriesCount]);
                    console.log(test);
                    var converted = countChartValue( component, test );
                    console.log( converted );
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
            console.log('replace', chartData);
        }

        function pushDataForChartJs(component, data, label){
            var chartData = $scope.displaydata[component._id];

            chartData.labeldata.push( label );
            for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                if( data[component.series[seriesCount]] ){
                    var converted = countChartValue( component, data[component.series[seriesCount]] );
                    //chartData.data[seriesCount].push( converted.value );
                    chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );

                    if( component.chartType != 'Bar' ){
                        //change value to KB/MB/GB
                        changeValueChartJs( component, seriesCount, converted );
                    }
                    chartData.updateTime = new Date();
                }
                else{
                    var index = chartData.labeldata.indexOf( label );
                    if (index > -1) {
                        chartData.labeldata.splice(index, 1);
                    }
                }
            }
        }

        function changeValueChartJs(component, seriesCount, converted){
            var chartData = $scope.displaydata[component._id];
            //$scope.$apply(function(){
                chartData.options.yAxisLabel = converted.unit;
            //});
            if(converted.unit == "KB" || converted.unit == "MB" || converted.unit == "GB"){
                for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                    var val = chartData.tempData[seriesCount][i];
                    if( converted.unit == "KB" ){
                        val = val / Math.pow(2, 10);
                    }else if( converted.unit == "MB" ){
                        val = val / Math.pow(2, 20);
                    }else if( converted.unit == "GB" ){
                        val = val / Math.pow(2, 30);
                    }
                    chartData.data[seriesCount][i] = val;
                }
            }
        }
    

        $scope.onClick= function(points, evt){
            console.log('test', points);
            console.log('activePoints', activePoints);
        }

        /*Chartjs Pie Chart*/
        function subscribeChartPie(component){
            console.log('subscribeChartPie: ',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = _.filter($scope.chartOptionsList, function (item) {
                    return item._id == component.options;
                });
                if(options.length > 0){
                    var test = options[0].options;
                    var test1 = test.replace(/(\r\n|\n|\r)/gm,"");
                    var test2 = test1.replace(/\s+/g," ");
                    //console.log(test2);
                    var options = jQuery.parseJSON( test2 );
                    console.log(options);
                }
                
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata:[],
                    data:[],
                    tempData:[],
                    dataIndex:[],
                    options : options,
                    statement:$scope.statements[component.query]
                };
            }
            console.log('display data after subscribing chart pie: ' , $scope.displaydata);

            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query +'/'+ component.dataelement).then(function(res){
                    processSnapshotSingleSeries(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('subscribeChartPie data: ',data);
                        if($scope.displaydata[component._id]){
                            if($scope.displaydata[component._id].statement.type === 'upsert'){
                                processChartSingleSeriesUpsertData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                                processChartSingleSeriesMovingData(component, data.event);
                            }
                            if($scope.displaydata[component._id].statement.type === 'update'){
                                processChartSingleSeriesUpdateData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                processChartSingleSeriesReplaceData(component, data.event);
                            }
                        }
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function processSnapshotSingleSeries(component, data){
            console.log('type ', $scope.displaydata[component._id].statement.type);
            var replace = [];
            for(var index = 0; index < data.length; index++){
                if($scope.displaydata[component._id].statement.type === 'upsert'){
                    var dataObj = {op:0,event:data[index]};
                    processChartSingleSeriesUpsertData(component,dataObj);
                }
                else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                    processChartSingleSeriesMovingData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'update' ){
                    processChartSingleSeriesUpdateData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    _.forEach(data[index], function(value, key){
                        replace.push(value);
                    });
                }
            }

            if( $scope.displaydata[component._id].statement.type === 'replace' ){
                $timeout(function(){
                    processChartSingleSeriesReplaceData(component, replace);
                }, 100);
            }
        }

        function processChartSingleSeriesUpsertData(component, data){
            var chartData = $scope.displaydata[component._id];
            
            var label = data[component.labels];
            var keyindex = $.inArray( label, chartData.labeldata );
            console.log(keyindex, label);
            if(keyindex > -1){
                if( data[component.series] ){
                    chartData.tempData[keyindex] = data[component.series];
                }
            }
            else{
                if( data[component.series] ){
                    chartData.labeldata.push( label );
                    chartData.data.push( data[component.series] );
                    chartData.tempData.push( data[component.series] );
                }
            }
            
            if( chartData.labeldata.length > component.dataelement ){
                console.log('length', chartData.labeldata.length);
                chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                chartData.data = chartData.data.splice(0, component.dataelement);
            }
            if( data[component.series] ){
                changeSingleSeriesData(component);
                console.log('upsert', chartData);
                chartData.updateTime = new Date();
            }
        }

        function processChartSingleSeriesMovingData(component, data){
            var chartData = $scope.displaydata[component._id];
            
            var label = data[component.labels];
            var keyindex = $.inArray( label, chartData.labeldata );
            //console.log(keyindex, label);
            if(keyindex > -1){
                if( data[component.series] ){
                    chartData.tempData[keyindex] = data[component.series];
                }
            }
            else{
                if( data[component.series] ){
                    chartData.labeldata.push( label );
                    chartData.data.push( data[component.series] );
                    chartData.tempData.push( data[component.series] );
                }
            }
            
            if( chartData.labeldata.length > component.dataelement ){
                console.log('length', chartData.labeldata.length);
                chartData.labeldata.shift();
                chartData.tempData.shift();
                chartData.data.shift();
            }
            if( data[component.series] ){
                changeSingleSeriesData(component);
                console.log('update', chartData);
                chartData.updateTime = new Date();
            }
        }

        function processChartSingleSeriesUpdateData(component, data){
            var chartData = $scope.displaydata[component._id];
            
            var label = data[component.labels];
            var keyindex = $.inArray( label, chartData.labeldata );
            //console.log(keyindex, label);
            if(keyindex > -1){
                if( data[component.series] ){
                    var oldValue = parseFloat( chartData.tempData[keyindex] );
                    //console.log('oldValue', oldValue);
                    var newValue = parseFloat( data[component.series] );
                    //console.log('newValue', newValue);

                    chartData.tempData[keyindex] = oldValue + newValue;
                    //console.log( chartData.tempData[keyindex] );
                }
            }
            else{
                if( data[component.series] ){
                    chartData.labeldata.push( label );
                    chartData.data.push( data[component.series] );
                    chartData.tempData.push( data[component.series] );
                }
            }
            
            if( chartData.labeldata.length > component.dataelement ){
                console.log('length', chartData.labeldata.length);
                chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                chartData.data = chartData.data.splice(0, component.dataelement);
            }
            if( data[component.series] ){
                changeSingleSeriesData(component);
                //console.log('update', chartData);
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
                //console.log(keyindex, label);
                if(keyindex > -1){
                    chartData.tempData[keyindex] = data[component.series];
                }
                else{
                    if( data[component.series] ){
                        chartData.labeldata.push( label );
                        chartData.data.push( data[component.series] );
                        chartData.tempData.push( data[component.series] );
                    }
                }
            });
            $timeout(function(){
                if( chartData.labeldata.length > component.dataelement ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                    chartData.data = chartData.data.splice(0, component.dataelement);
                }
                changeSingleSeriesData(component);
                console.log('replace', chartData);
            }, 100);
            chartData.updateTime = new Date();
        }

        function changeSingleSeriesData(component){
            var chartData = $scope.displaydata[component._id];
            //console.log('tempData', chartData.tempData);
            var test = Math.max.apply(null, chartData.tempData);
            //console.log('test', test);
            var converted = countChartValue( component, test );
            //console.log( converted );

            for(var i = 0; i < chartData.tempData.length; i++) {
                var val = chartData.tempData[i];
                //console.log(val);
                if( converted.unit == "KB" ){
                    val = val / Math.pow(2, 10);
                }else if( converted.unit == "MB" ){
                    val = val / Math.pow(2, 20);
                }else if( converted.unit == "GB" ){
                    val = val / Math.pow(2, 30);
                }
                chartData.data[i] = toFixeValue( val );
            }
        }
        /*End Chartjs Pie Chart*/
    /*END ChartJs*/

    /*D3*/
        //D3 multi series
        function subscribeChartMultiSeriesD3(component){
            console.log('subscribeChartMultiSeriesD3: ',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = getOption(component);
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    tick:[],
                    tempData:[],
                    data: [],
                    statement: $scope.statements[component.query],
                    options: options
                };
            }
            
            $scope.displaydata[component._id].options.chart.xAxis.axisLabel = component.labels;
            
            
            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                if( component.timeType == 'minute' )
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

            if(component.clickable){
                $scope.displaydata[component._id].options.chart.lines = {
                    dispatch:{
                        elementClick: function(e){
                            console.log(e);
                            console.log($scope.displaydata[component._id].data[e.seriesIndex]);
                        }
                    }
                };
            }

            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                $scope.displaydata[component._id].data.push( {key: component.series[seriesCount], values: []} );
                $scope.displaydata[component._id].tempData.push( {key: component.series[seriesCount], values: []} );
            }

            console.log('display data after subscribing multi series D3: ' , $scope.displaydata);
            //return false;
            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    snapshotMultiSeriesD3(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('socket Multi Series D3 data: ',data);
                        var statementType = $scope.displaydata[component._id].statement.type;
                        if( statementType === 'upsert'){
                            multiSeriesD3UpsertData(component, data.event);
                        }
                        else if( statementType === 'moving' ){
                           multiSeriesD3MovingData(component, data.event);
                        }
                        else if( statementType === 'update' ){
                            multiSeriesD3UpdateData(component, data.event);
                        }
                        else if( statementType === 'replace' ){
                            multiSeriesD3ReplaceData(component, data.event);
                        }
                        $scope.$apply();
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function snapshotMultiSeriesD3(component, data){
            var type = $scope.displaydata[component._id].statement.type;
            console.log(type);
            var replace = [];
            for(var index = 0; index < data.length; index++){
                if( type === 'upsert'){
                    multiSeriesD3UpsertData(component, data[index]);
                }
                else if( type === 'moving'){
                    multiSeriesD3MovingData(component, data[index]);
                }
                else if( type === 'update'){
                    multiSeriesD3UpdateData(component, data[index]);
                }
                else{
                     _.forEach(data[index], function(value, key){
                        replace.push(value);
                    });
                }
            }

            if( type === 'replace' ){
                $timeout(function(){
                    multiSeriesD3ReplaceData(component, replace);
                }, 100);
            }
        }

        function multiSeriesD3UpsertData(component, data){
            var chartData = $scope.displaydata[component._id];

            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var xLabel = data[component.labels];
            }
            else if( component.labelType == 'value' ){
                var xLabel = chartData.labeldata.length;
            }

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
                console.log('splice');
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

            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var xLabel = data[component.labels];
            }
            else if( component.labelType == 'value' ){
                var xLabel = chartData.labeldata.length;
            }

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
                console.log('Shift');
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
            //console.log('multi line', chartData);
            changeMultiSeriesValueD3Chart( component );
        }

        function multiSeriesD3UpdateData(component, data){
            var chartData = $scope.displaydata[component._id];

            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var xLabel = data[component.labels];
            }
            else if( component.labelType == 'value' ){
                var xLabel = chartData.labeldata.length;
            }

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
                console.log('splice ===');
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

            _.forEach(data1, function(data, key){

                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var xLabel = data[component.labels];
                }
                else if( component.labelType == 'value' ){
                    var xLabel = chartData.labeldata.length;
                }

                var label = data[component.labels];
                var keyindex = $.inArray( label, chartData.labeldata );
                //console.log(label+'  = ==  '+keyindex);
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
            });

            $timeout(function(){
                if(chartData.labeldata.length > component.dataelement){
                    console.log('splice ===');
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.tick = chartData.tick.splice(0, component.dataelement);
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        chartData.data[seriesCount].values = chartData.data[seriesCount].values.splice(0, component.dataelement);
                        chartData.tempData[seriesCount].values = chartData.tempData[seriesCount].values.splice(0, component.dataelement);
                    }
                }
                changeMultiSeriesValueD3Chart( component );
            }, 100);
        }

        function changeMultiSeriesValueD3Chart(component){
            var chartData = $scope.displaydata[component._id];
            var tmp = [];
            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                _.forEach(chartData.tempData[seriesCount].values, function(val, key){
                    tmp.push(val.y);
                });
            }

            //console.log('tmp', tmp);
            var maxVal = Math.max.apply(null, tmp);
            //console.log('maxVal', maxVal);
            var converted = countChartValue( component, maxVal );
            console.log(converted);
            chartData.options.chart.yAxis.axisLabel = converted.unit;
            chartData.options.chart.xAxis.tickValues = chartData.tick;

            if(converted.unit == "KB" || converted.unit == "MB" || converted.unit == "GB"){
                _.forEach(component.series, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].values.length; i++) {
                        var val = chartData.tempData[seriesCount].values[i].y;
                        if( converted.unit == "KB" ){
                            val = val / Math.pow(2, 10);
                        }else if( converted.unit == "MB" ){
                            val = val / Math.pow(2, 20);
                        }else if( converted.unit == "GB" ){
                            val = val / Math.pow(2, 30);
                        }
                        chartData.data[seriesCount].values[i].y = toFixeValue( val );
                    }
                });
            }
            chartData.api.refresh();
            console.log('multi line', chartData);
        }

        //D3 Pie Chart
        function subscribeD3PieChart(component){
            console.log('subscribeD3PieChart: ',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = getOption(component);
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    tempData:[],
                    data: [],
                    dataIndex:[],
                    statement: $scope.statements[component.query],
                    options: options
                };
            }
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
            
            if(component.chartType == 'Bullet'){
                $scope.displaydata[component._id].data = {};
                $scope.displaydata[component._id].data.title = component.bulletTitle;
                $scope.displaydata[component._id].data.subtitle = component.bulletSubTitle;
                $scope.displaydata[component._id].data.ranges = [];
                $scope.displaydata[component._id].data.measures = [component.measures];
                $scope.displaydata[component._id].data.markers = [component.markers];
            }
            else if( component.chartType == 'DiscreteBar' ){
                $scope.displaydata[component._id].data = [ {key:'Cumulative Return', values:[]} ];
            }
            else if( component.chartType == 'HorizontalBar'){
                $scope.displaydata[component._id].data = [ {key: component.series, bar: true, values: []} ];
                console.log('return false', component);
                console.log('return false', $scope.displaydata[component._id]);
            }
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
                   
            console.log('display data after subscribing pie D3: ' , $scope.displaydata);
            //return false;
            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    snapshotPieD3(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('subscribeChartSingleSeriesD3 data: ',data);
                        var statementType = $scope.displaydata[component._id].statement.type;
                        if( statementType === 'upsert'){
                            pieD3UpsertData(component, data.event);
                        }
                        else if( statementType === 'moving' ){
                           pieD3MovingData(component, data.event);
                        }
                        else if( statementType === 'update' ){
                            pieD3UpdateData(component, data.event);
                        }
                        else if( statementType === 'replace' ){
                            pieD3ReplaceData(component, data.event);
                        }
                        $scope.$apply();
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function snapshotPieD3(component,data){
            var type = $scope.displaydata[component._id].statement.type;
            var replace = [];
            for(var index = 0; index < data.length; index++){
                if( type === 'upsert'){
                    pieD3UpsertData(component, data[index]);
                }
                else if( type === 'moving'){
                    pieD3MovingData(component, data[index]);
                }
                else if( type === 'update'){
                    pieD3UpdateData(component, data[index]);
                }
                else{
                     _.forEach(data[index], function(value, key){
                        replace.push(value);
                    });
                }
            }

            if( type === 'replace' ){
                $timeout(function(){
                    pieD3ReplaceData(component, replace);
                }, 100);
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
                console.log('splice');
                chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                chartData.data = chartData.data.splice(0, component.dataelement);
                chartData.tempData = chartData.tempData.splice(0, component.dataelement);
            }
            
            
            var maxVal = Math.max.apply(null, chartData.tempData);
            var converted = countChartValue( component, maxVal );
            changeD3PieSeries( component, converted );
            chartData.updateTime = new Date();
            console.log('D3 pie refresh', chartData);
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
                console.log('shift');
                chartData.labeldata.shift();
                chartData.data.shift();
                chartData.tempData.shift();
            }
            
            var maxVal = Math.max.apply(null, chartData.tempData);
            var converted = countChartValue( component, maxVal );
            changeD3PieSeries( component, converted );
            chartData.updateTime = new Date();
            console.log('D3 pie Moving', chartData);
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
                console.log('shift');
                chartData.labeldata.shift();
                chartData.data.shift();
                chartData.tempData.shift();
            }
            
            var maxVal = Math.max.apply(null, chartData.tempData);
            var converted = countChartValue( component, maxVal );
            changeD3PieSeries( component, converted );
            chartData.updateTime = new Date();
            console.log('D3 pie Moving', chartData);
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
                // console.log('Replace keyindex', keyindex);
                // console.log('label', label);
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
            });
            
            if( chartData.labeldata.length > parseInt(component.dataelement) ){
                console.log('splice');
                chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                chartData.data = chartData.data.splice(0, component.dataelement);
                chartData.tempData = chartData.tempData.splice(0, component.dataelement);
            }
            
            $timeout(function(){
                var maxVal = Math.max.apply(null, chartData.tempData);
                console.log(maxVal);
                var converted = countChartValue( component, maxVal );
                console.log(converted);
                changeD3PieSeries( component, converted );
            }, 100);
            chartData.updateTime = new Date();
            console.log('chartData Replace', chartData);
        }

        function changeD3PieSeries( component, converted ){
            var chartData = $scope.displaydata[component._id];

            for(var i = 0; i < chartData.tempData.length; i++) {
                var val = chartData.tempData[i];
                if( converted.unit == "KB" ){
                    val = val / Math.pow(2, 10);
                }else if( converted.unit == "MB" ){
                    val = val / Math.pow(2, 20);
                }else if( converted.unit == "GB" ){
                    val = val / Math.pow(2, 30);
                }
                chartData.data[i].value =  val ;
            }
        }
    /*End D3*/

    /*Table*/
        function subscribeTable(component){
            console.log('subscribeTable: ',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {component:component, label:component.labels, columns:[], data:[], tableParams:{}, dataIndex:[], statement:$scope.statements[component.query], updateTime:''};
            }
            angular.forEach(component.columns, function(value, key){
                //var tmpobj = {field: value.name, title:value.name, show:true, indicator:value.indicator};
                var tmpobj = {field: value.name, title:value.name, show:true};

                if(angular.isDefined(value.updownreference)){
                    tmpobj.updownreference = value.updownreference;
                }
                $scope.displaydata[component._id].columns.push(tmpobj);
            });
            console.log('display data after subscribing table: ' , $scope.displaydata);

            if(component.dataelement)
                var row = component.dataelement;
            else
                var row = 10;

            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl+component.query +'/'+ row).then(function(res){
                    processTableSnapshotData(component,res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        //console.log('subscribe Table data: ',data.event);
                        if( $scope.displaydata[component._id].statement.type === 'upsert' ){
                            processTableUpsertData(component, data.event);
                        }
                        else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                            processTableMovingData(component, data.event);
                        }
                        else if( $scope.displaydata[component._id].statement.type === 'update' ){
                            processTableUpdateData(component, data.event);
                        }
                        else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                            processTableReplaceData(component, data.event);
                        }
                        
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function processTableSnapshotData(component, data){
            if(data != 'error' ){
                //console.log('data', data);
                console.log($scope.displaydata[component._id].statement.type);
                var test = [];
                for(var index = 0; index < data.length; index++){
                    if( $scope.displaydata[component._id].statement.type === 'upsert' ){
                        //var dataObj = {op:0,event:data[index]};
                        processTableUpsertData(component, data[index]);
                    }
                    else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                        processTableMovingData(component, data[index]);
                    }
                    else if( $scope.displaydata[component._id].statement.type === 'update' ){
                        processTableUpdateData(component, data[index]);
                    }
                    else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                        _.forEach(data[index], function(value, key){
                            test.push(value);
                        });
                    }
                }

                $timeout(function(){
                    //console.log('test', test);
                    if( $scope.displaydata[component._id].statement.type === 'replace' ){
                        processTableReplaceData(component, test);
                    }
                }, 100);
            }
        }

        function processTableUpsertData(component, data){
            var tableData = $scope.displaydata[component._id];
            
            var dataobj={};
            //console.log(component);
            console.log('data', data);
            angular.forEach(component.columns, function(val, key){
                var tmpdata = {};
                tmpdata.value = (data[val.name]).toFixed(1);
                dataobj[val.name] = tmpdata;
            });
            dataobj[component.labels] = {value: data[component.labels]};
            console.log('label', data[component.labels]);

            //Check if key is exits in table
            var keyindex = $.inArray( data[component.labels], tableData.dataIndex );
            console.log('Refresh keyindex', keyindex);
            if(keyindex > -1){
                tableData.data[keyindex] = dataobj;
            }
            else{
                tableData.dataIndex.push( data[component.labels] );
                tableData.data.push(dataobj);
            }

            $timeout(function() {
                tableSpliceRow(component);
            }, 100);
        }

        function processTableMovingData(component, data){
            var tableData = $scope.displaydata[component._id];
            
            var dataobj={};
            //console.log(component);
            //console.log('data', data);
            angular.forEach(component.columns, function(val, key){
                var tmpdata = {};
                tmpdata.value = (data[val.name]) ? data[val.name] : 0;
                dataobj[val.name] = tmpdata;
            });
            dataobj[component.labels] = {value: data[component.labels]};
            //console.log('label', data[component.labels]);

            //Check if key is exits in table
            var keyindex = $.inArray( data[component.labels], tableData.dataIndex );
            //console.log('moving keyindex', keyindex);
            if(keyindex > -1){
                tableData.data[keyindex] = dataobj;
            }
            else{
                tableData.dataIndex.push( data[component.labels] );
                tableData.data.push(dataobj);
            }

            $timeout(function() {
                tableSpliceRow(component);
            }, 100);
        }

        function processTableUpdateData(component, data){
            var tableData = $scope.displaydata[component._id];
            
            var dataobj={};
            angular.forEach(component.columns, function(value, key){
                var tmpdata = {};
                tmpdata.value = (data[value.name]) ? data[value.name] : 0;
                dataobj[value.name] = tmpdata;
            });
            //console.log('dataobj', dataobj);
            dataobj[component.labels] = {value: data[component.labels]};
            //console.log('label ', data[component.lebels]);

            //Check if key is exits in table
            var keyindex = $.inArray( data[component.labels], tableData.dataIndex );
            //console.log('update keyindex', keyindex);
            if(keyindex > -1){
                console.log('key', tableData.data[keyindex]);
                _.forEach(component.columns, function(val, key){
                    if( dataobj[val.name]['value'] ){
                        console.log(val);
                        var oldValue = tableData.data[keyindex][val.name]['value'];
                        console.log('oldValue', oldValue);
                        var newValue = dataobj[val.name]['value'];
                        console.log('newValue', newValue);
                        tableData.data[keyindex][val.name]['value'] = (parseFloat(oldValue) + parseFloat(newValue)).toFixed(1);
                        console.log(tableData.data[keyindex][val.name]['value']);
                        tableData.updateTime = new Date();
                    }
                });
            }
            else{
                tableData.dataIndex.push( data[component.labels] );
                tableData.data.push(dataobj);
                tableData.updateTime = new Date();
            }

            $timeout(function() {
                tableSpliceRow(component);
            }, 100);
        }

        function processTableReplaceData(component, data1){
            var tableData = $scope.displaydata[component._id];

            if( (angular.isDefined(tableData.statement) && tableData.statement.eventPublish == 'Combined') || component.data == 'DBPull'){
                tableData.dataIndex = [];
                tableData.data = [];
            }
            //console.log('data1', data1);
            _.forEach(data1, function(data, key){
                var dataobj={};
                angular.forEach(component.columns, function(val, key){
                    var tmpdata = {};
                    tmpdata.value = (data[val.name]) ? data[val.name] : 0;
                    dataobj[val.name] = tmpdata;
                });
                dataobj[component.labels] = {value: data[component.labels]};

                //Check if key is exits in table
                var keyindex = $.inArray( data[component.labels], tableData.dataIndex );
                //console.log('replace keyindex', keyindex);
                if(keyindex > -1){
                    tableData.data[keyindex] = dataobj;
                }
                else{
                    tableData.dataIndex.push( data[component.labels] );
                    tableData.data.push(dataobj);
                }
            });

            $timeout(function() {
                tableSpliceRow(component);
            }, 100);
        }

        function tableSpliceRow(component){
            var tableData = $scope.displaydata[component._id];
            
            var tableSort = tableData.data.sort(function(a, b) {
                return parseFloat( b[component.columns[0].name].value ) - parseFloat( a[component.columns[0].name].value );
            });
            var labelArr = [];
            angular.forEach(tableSort, function(val, key){
                labelArr.push(val[component.labels]['value']);

                _.forEach(component.columns, function(v, k){
                    //console.log(val[v.name].value);
                    if(component.unit[v.name] && component.unit[v.name] != 'percent'){
                        var converted = countTableValue( val[v.name].value, component.unit[v.name] );
                        
                        if(converted.value % 1 === 0){
                              // int
                        } else{
                            converted.value = parseFloat(converted.value).toFixed(component.dataDecimal[v.name]);
                        }
                        val[v.name].value = converted.value +' '+ converted.unit;
                    }
                    else if(component.unit[v.name] == 'percent'){
                        val[v.name].value = parseFloat(val[v.name].value).toFixed(component.dataDecimal[v.name]) + ' %';
                    }
                    else{
                        val[v.name].value = val[v.name].value
                    }
                });
            });
            
            tableData.dataIndex = labelArr;
            tableData.data = tableSort;

            if(component.type == 'simple_table' && (angular.isDefined(component.dataelement) && component.dataelement != '') ){
                $scope.displaydata[component._id].data = tableData.data.splice(0, parseInt(component.dataelement) );
                $scope.displaydata[component._id].dataIndex = tableData.dataIndex.splice(0, parseInt(component.dataelement) );    
            }
            else{
                $scope.displaydata[component._id].data = tableData.data;
                $scope.displaydata[component._id].dataIndex = tableData.dataIndex;
            }
            $scope.$apply();
            tableData.updateTime = new Date();
            console.log('table end callback: ',tableData);
        }

        function countTableValue(value, unitName){
            var newValue = value;
            var unit = '';
            if( unitName == 'usage' ){
                unit = 'Bytes';
                if( newValue > 1024){
                    var datamb = ( newValue/1024 );
                    if( datamb > 1024 ){
                        var datagb = ( datamb/1024 );
                        if( datagb > 1024 ){
                            var datatb = ( datagb/1024 );
                            newValue = datatb;
                            unit = 'GB';
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
                if(column.indicator == 'piegraph'){
                    maxelement  =2;
                }

                if(!angular.isDefined(coldata.kpiindicatordatahistory)){
                    coldata.kpiindicatordatahistory = [];
                }

                if(coldata.kpiindicatordatahistory.length + 1 > maxelement){
                    coldata.kpiindicatordatahistory.shift();
                }
                coldata.kpiindicatordatahistory.push(coldata.value);
            }
        }
    /*End Table*/

    /*IBox*/
        function subscribeIBox(component){
            console.log('component', component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {component:component, kpi:'', kpiIndicator:'', kpiindicatordatahistory:[], spanclass:'', updateTime: ''};
            }
            if(component.indicatortype == 'bolt'){
                $scope.displaydata[component._id].spanclass='fa fa-bolt';
            }
            console.log('display data after subscribing subscribeIBox: ' , $scope.displaydata);
            
            if( component.data != 'DBPull' ){
                $http.get(globalConfig.snapshoturl + component.query + '/10').then(function(res){
                    console.log('snapshoturl response :', res);
                    processIBoxSnapshotData(component,res.data);
                    socket.subscribe(component.query, function(res){
                        var ibox = component;
                        console.log('subscribeIBox response: ',res);
                        var tmp = JSON.parse(res);
                        var data = tmp[ibox.query];
                        console.log('subscribeIBox data: ',data);
                        processIBoxData(ibox, data.event);
                        $scope.$apply();
                    });
                });
            }
            else{
                setTimeInterval(component);
            }

            if( component.data2 ){
                console.log(component.data2);
                if( component.data2 != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query2 + '/10').then(function(res){
                        console.log('snapshoturl response 2 :', res.data);
                        for(var index = 0; index < res.data.length; index++){
                            if( res.data[index][component.kpi2] ){
                                var newValue2 = countIBoxUnit( component, res.data[index][component.kpi2] );
                                console.log('newValue2', newValue2);
                                $scope.displaydata[component._id].kpi2 = newValue2.value.toFixed(component.dataDecimal2);
                                $scope.displaydata[component._id].unit2 = newValue2.unit;
                                $scope.displaydata[component._id].updateTime2 = new Date();
                            }
                        }

                        socket.subscribe(component.query2, function(res){
                            var ibox = component;
                            var tmp = JSON.parse(res);
                            var data = tmp[ibox.query2];
                            console.log('subscribeIBox data2: ',data.event);
                            if($scope.displaydata[component._id]){
                                console.log('data 2 ', data.event[component.kpi2]);
                                if( data.event[component.kpi2] ){
                                    var newValue = countIBoxUnit( component, data.event[component.kpi2] );
                                    console.log('newValue', newValue);
                                    $scope.displaydata[component._id].kpi2 = newValue.value.toFixed(component.dataDecimal2);
                                    $scope.displaydata[component._id].unit2 = newValue.unit;
                                    $scope.displaydata[component._id].updateTime2 = new Date();
                                    $scope.$apply();
                                }
                            }
                            console.log($scope.displaydata[component._id]);
                        });
                    });
                }
                else{
                    $http.get(globalConfig.pulldataurl + component.query2).then(function(res){
                        console.log('response 2 :', res.data);
                        for(var index = 0; index < res.data.length; index++){
                            if( res.data[index][component.kpi2] ){
                                var newValue2 = countIBoxUnit( component, res.data[index][component.kpi2] );
                                console.log('newValue2', newValue2);
                                $scope.displaydata[component._id].kpi2 = newValue2.value.toFixed(component.dataDecimal2);
                                $scope.displaydata[component._id].unit2 = newValue2.unit;
                                $scope.displaydata[component._id].updateTime2 = new Date();
                            }
                        }
                    });
                }
            }
        }

        function processIBoxSnapshotData(component, data){
            for(var index = 0; index < data.length; index++){
                processIBoxData(component, data[index]);
            }
        }

        function processIBoxData(component, data){
            if($scope.displaydata[component._id]){
                var iboxData = $scope.displaydata[component._id];
                if( data[component.kpi] ){
                    var newValue = countIBoxUnit( component, data[component.kpi] );
                    console.log('newValue', newValue);
                    iboxData.kpi = newValue.value.toFixed(component.dataDecimal);
                    iboxData.unit = newValue.unit;
                    iboxData.updateTime = new Date();
                    iboxData.kpiIndicator = data[component.kpiIndicator];
                    if(component.indicatortype === 'piegraph' || component.indicatortype === 'linegraph' || component.indicatortype === 'bargraph'){
                        var maxelement = 10;
                        if(component.indicatortype === 'piegraph'){
                            maxelement = 3;
                        }
                        
                        if( iboxData.kpiindicatordatahistory.length+1 > parseInt(maxelement) ){
                            console.log(iboxData.kpiindicatordatahistory.length +1);
                            iboxData.kpiindicatordatahistory.shift();
                        }

                        // iboxData.kpiindicatordatahistory.push( (iboxData.kpiIndicator) ? iboxData.kpiIndicator : 0 );
                        // iboxData.api.refresh();
                        var test = iboxData.kpiindicatordatahistory;
                        //console.log(test);
                        iboxData.kpiindicatordatahistory = [];
                        $timeout(function(){
                            iboxData.kpiindicatordatahistory = test;
                            iboxData.kpiindicatordatahistory.push( (iboxData.kpiIndicator) ? iboxData.kpiIndicator : 0 );
                            //console.log(component.name);
                            //console.log(component.name, iboxData.kpiindicatordatahistory);
                        }, 100);
                        
                    }
                    // iboxData.kpiindicator = data.stat1;
                    if(component.indicatortype === 'updown'){
                        if(iboxData.kpiIndicator >= component.updownreference){
                            iboxData.indicatorClass = 'text-success';
                            iboxData.spanclass = 'fa fa-level-up';
                        }
                        else{
                            iboxData.indicatorClass = 'text-danger';
                            iboxData.spanclass = 'fa fa-level-down';
                        }
                    }
                    console.log( 'after new data displaydata: ', iboxData );
                }
            }
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
                    else if(newValue > 1024*1024*1024){
                        newValue = newValue / (1024*1024*1024);
                        unit = 'GB';
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
                    else if(newValue > 1024*1024*1024){
                        newValue = newValue / (1024*1024*1024);
                        unit = 'GB';
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

    /*Flot Chart*/
        //For Pie Chart
        function subscribeFlotPieChart(component){
            console.log('subscribe Flot Pie Chart: ',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = getOption(component);
                
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    dataset:[],
                    tempData:[],
                    statement:$scope.statements[component.query],
                    options:  options,
                    updateTime: ''
                };
            }
            console.log('display data after subscribing chart: ' , $scope.displaydata);
            //return false;
            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    snapshotPieFlot(component, res.data);
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('subscribe flot Chart data: ',data);
                        if($scope.displaydata[component._id]){
                            if($scope.displaydata[component._id].statement.type === 'upsert'){
                                pieFlotUpsertData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                               pieFlotMovingData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'update' ){
                                pieFlotUpdateData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                pieFlotReplaceData(component, data.event);
                            }
                        }
                    });
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            }
            else{
                setTimeInterval(component);
            }

            $timeout(function(){
                $("#"+component._id).bind("plotclick",function (event, pos, item) {
                    console.log('item', item.series.label);
                    var params = {Key: component.chartUnit, Device: item.series.label};
                    console.log('event', event);
                    /*$scope.$apply(function(){
                        if(item){
                            buildParams("Count",item);

                        }
                    });*/
                    $state.go('index.deviceUsageGeoDistribution',{'params': params, 'filterParams': null});
                });
            }, 1000);
        }

        function snapshotPieFlot(component, data){
            var replace = [];
            console.log( 'type of', $scope.displaydata[component._id].statement.type);
            for(var index = 0; index < data.length; index++){
                if( $scope.displaydata[component._id].statement.type === 'upsert' ){
                    pieFlotUpsertData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                    pieFlotMovingData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'update' ){
                    pieFlotUpdateData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    _.forEach(data[index], function(value, key){
                        replace.push(value);
                    });
                }
            }

            $timeout(function(){
                if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    pieFlotReplaceData(component, replace);
                }
            }, 100);
        }

        function pieFlotUpsertData(component, data){
            var chartData = $scope.displaydata[component._id];
            
            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = data[component.labels] + globalConfig.tzAdjustment;
            }
            else{
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            //console.log('Replace keyindex', keyindex);
            //console.log('label', label);
            if( keyindex > -1 ){
                if( data[component.series] ){
                    var converted = countChartValue( component, data[component.series] );
                    chartData.dataset[keyindex].data = converted.value;
                    chartData.tempData[keyindex] = data[component.series];
                }
            }
            else{
                pushDataFlotPieChart(component, data, label);
            }
            
            if( chartData.labeldata.length > parseInt(component.dataelement) ){
                chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                chartData.dataset = chartData.dataset.splice(0, component.dataelement);
                chartData.tempData = chartData.tempData.splice(0, component.dataelement);
            }

            var maxVal = Math.max.apply(null, chartData.tempData);
            console.log(maxVal);
            var converted = countChartValue( component, maxVal );
            console.log(converted);
            changeFlotPieChart( component, converted );
            
            chartData.updateTime = new Date();
            console.log('chartData Replace', chartData);
        }

        function pieFlotMovingData(component, data){
            var chartData = $scope.displaydata[component._id];
            
            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = data[component.labels] + globalConfig.tzAdjustment;
            }
            else{
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            //console.log('Replace keyindex', keyindex);
            //console.log('label', label);
            if( keyindex > -1 ){
                if( data[component.series] ){
                    var converted = countChartValue( component, data[component.series] );
                    chartData.dataset[keyindex].data = converted.value;
                    chartData.tempData[keyindex] = data[component.series];
                }
            }
            else{
                pushDataFlotPieChart(component, data, label);
            }
            
            if(chartData.labeldata.length > parseInt(component.dataelement)){
                chartData.labeldata.shift();   
                console.log('removed');
                chartData.dataset.shift();
                chartData.tempData.shift();
            }
            
            var maxVal = Math.max.apply(null, chartData.tempData);
            console.log(maxVal);
            var converted = countChartValue( component, maxVal );
            console.log(converted);
            changeFlotPieChart( component, converted );
            
            chartData.updateTime = new Date();
            console.log('chartData Replace', chartData);
        }

        function pieFlotUpdateData(component, data){
            var chartData = $scope.displaydata[component._id];
            
            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = data[component.labels] + globalConfig.tzAdjustment;
            }
            else{
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            //console.log('Replace keyindex', keyindex);
            //console.log('label', label);
            if( keyindex > -1 ){
                if( data[component.series] ){
                    var converted = countChartValue( component, data[component.series] );
                    var oldValue = chartData.tempData[keyindex];
                    var newValue = data[component.series];

                    chartData.tempData[keyindex] = parseFloat(oldValue) + parseFloat(newValue);
                }
            }
            else{
                pushDataFlotPieChart(component, data, label);
            }
            
            if( chartData.labeldata.length > parseInt(component.dataelement) ){
                chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                chartData.dataset = chartData.dataset.splice(0, component.dataelement);
                chartData.tempData = chartData.tempData.splice(0, component.dataelement);
            }

            var maxVal = Math.max.apply(null, chartData.tempData);
            console.log(maxVal);
            var converted = countChartValue( component, maxVal );
            console.log(converted);
            changeFlotPieChart( component, converted );
            
            chartData.updateTime = new Date();
            console.log('chartData Replace', chartData);
        }

        function pieFlotReplaceData(component, data1){
            var chartData = $scope.displaydata[component._id];

            if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                chartData.dataset = [];
                chartData.tempData = [];
                chartData.labeldata = [];
            }
            
            _.forEach(data1, function(data, key){
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                }
                else{
                    var label = data[component.labels];
                }
                var keyindex = $.inArray( label, chartData.labeldata );
                //console.log('Replace keyindex', keyindex);
                //console.log('label', label);
                if( keyindex > -1 ){
                    if( data[component.series] ){
                        var converted = countChartValue( component, data[component.series] );
                        chartData.dataset[keyindex].data = converted.value;
                        chartData.tempData[keyindex] = data[component.series];
                    }
                }
                else{
                    pushDataFlotPieChart(component, data, label);
                }
            });
        
            
            $timeout(function(){
                var maxVal = Math.max.apply(null, chartData.tempData);
                console.log(maxVal);
                var converted = countChartValue( component, maxVal );
                console.log(converted);
                changeFlotPieChart( component, converted );
            }, 100);
            chartData.updateTime = new Date();
            console.log('chartData Replace', chartData);
        }

        function pushDataFlotPieChart(component, data, label){
            var chartData = $scope.displaydata[component._id];
            chartData.labeldata.push( label );
            var converted = countChartValue( component, data['countDevice'] );
            chartData.dataset.push( {'label': label, 'data': converted.value} );
            chartData.tempData.push( data['countDevice'] );
        }

        function changeFlotPieChart(component, converted){
            var chartData = $scope.displaydata[component._id];

            for(var i = 0; i < chartData.tempData.length; i++) {
                var val = chartData.tempData[i];
                if( converted.unit == "KB" ){
                    val = val / Math.pow(2, 10);
                }else if( converted.unit == "MB" ){
                    val = val / Math.pow(2, 20);
                }else if( converted.unit == "GB" ){
                    val = val / Math.pow(2, 30);
                }
                chartData.dataset[i].data = toFixeValue( val );
            }
        }

        function getOption(component){
        var options = _.filter($scope.chartOptionsList, function (item) {
            return item._id == component.options;
        });
        if(options.length > 0){
            var test = options[0].options;
            var test1 = test.replace(/(\r\n|\n|\r)/gm,"");
            var test2 = test1.replace(/\s+/g," ");
            //console.log(test2);
            var options = jQuery.parseJSON( test2 );
            console.log(options);
            return options;
        }
        }

        //For Bar chart
        function subscribeFlotBarChart(component){
            console.log('subscribe Flot Bar Chart: ',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = getOption(component);
                // var data = [[0, 11],[1, 15],[2, 25],[3, 24],[4, 13],[5, 18]];
                // var dataset = [{ label: "2012 Average Temperature", data: data, color: "#5482FF" }];
                // var ticks = [[0, "London"], [1, "New York"], [2, "New Delhi"], [3, "Taipei"],[4, "Beijing"], [5, "Sydney"]];
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata: [],
                    dataset:[],
                    tempData:[],
                    temp:[],
                    ticks:[],
                    dataIndex:[],
                    statement:$scope.statements[component.query],
                    options: options,
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
            }

            for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
            }
            console.log('display data after subscribing chart: ' , $scope.displaydata);
            //return false;
            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    snapshotBarFlot(component, res.data);
                    socket.subscribe(component.query, function(res){
                    });
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            }
        }

        function snapshotBarFlot(component, data){
            var replace = [];
            console.log( 'type of', $scope.displaydata[component._id].statement.type);
            for(var index = 0; index < data.length; index++){
                if( $scope.displaydata[component._id].statement.type === 'upsert' ){
                    barFlotUpsertData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                    barFlotMovingData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'update' ){
                    barFlotUpdateData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    _.forEach(data[index], function(value, key){
                        replace.push(value);
                    });
                }
            }

            $timeout(function(){
                if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    barFlotReplaceData(component, replace);
                }
            }, 100);
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
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                }
                else{
                    var label = data[component.labels];
                }
                var keyindex = $.inArray( label, chartData.labeldata );
                //console.log('Replace keyindex', keyindex);
                //console.log('label', label);
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
                else{
                    pushDataBarFlowChart(component, data, label);
                }
            });
        
            
            $timeout(function(){
                var maxVal = Math.max.apply(null, chartData.temp);
                console.log(maxVal);
                var converted = countChartValue( component, maxVal );
                console.log(converted);
                changeValueBarFlowChart( component, converted );
                console.log('flot Bar Replace', chartData);
            }, 100);
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
                    if (index > -1) {
                        chartData.labeldata.splice(index, 1);
                    }
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
                    if( converted.unit == "KB" ){
                        val = val / Math.pow(2, 10);
                    }else if( converted.unit == "MB" ){
                        val = val / Math.pow(2, 20);
                    }else if( converted.unit == "GB" ){
                        val = val / Math.pow(2, 30);
                    }
                    chartData.dataset[seriesCount].data[i][1] = toFixeValue( val );
                }
            }
        }

        //For Line chart
        function subscribeFlotChart(component){
            console.log('subscribe Flot Chart: ',component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                var options = getOption(component);

                $scope.displaydata[component._id] = {
                    labeldata: [],
                    dataset:[],
                    tempData:[],
                    temp:[],
                    dataIndex:[],
                    statement:$scope.statements[component.query],
                    options: options,
                    updateTime: ''
                };
            }

            for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
            }
            console.log('display data after subscribing chart: ' , $scope.displaydata);
           
            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    processSnapshotMultiSeriesFlot(component, res.data);
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('subscribe flot Chart data: ',data);
                        if($scope.displaydata[component._id]){
                            if($scope.displaydata[component._id].statement.type === 'upsert'){
                                processFlotChartMultiSeriesUpsertData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                               processFlotChartMultiSeriesMovingData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'update' ){
                                processFlotChartMultiSeriesUpdateData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                processFlotChartMultiSeriesReplaceData(component, data.event);
                            }
                        }
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function processSnapshotMultiSeriesFlot(component, data){
            var replace = [];
            console.log( 'type of', $scope.displaydata[component._id].statement.type);
            for(var index = 0; index < data.length; index++){
                if( $scope.displaydata[component._id].statement.type === 'upsert' ){
                    processFlotChartMultiSeriesUpsertData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                    processFlotChartMultiSeriesMovingData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'update' ){
                    processFlotChartMultiSeriesUpdateData(component, data[index]);
                }
                else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    _.forEach(data[index], function(value, key){
                        replace.push(value);
                    });
                }
                /*else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    if( $scope.displaydata[component._id].statement.eventPublish == 'Combined' ){
                        _.forEach(data[index], function(value, key){
                            processFlotChartMultiSeriesReplaceData(component, value);
                        });
                    }
                    else{
                        processFlotChartMultiSeriesReplaceData(component, data[index]);
                    }
                }*/
            }

            $timeout(function(){
                if( $scope.displaydata[component._id].statement.type === 'replace' ){
                    processFlotChartMultiSeriesReplaceData(component, replace);
                }
            }, 100);
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
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                }
                else{
                    var label = data[component.labels];
                }
                var keyindex = $.inArray( label, chartData.labeldata );
                //console.log('Replace keyindex', keyindex);

                if( keyindex > -1 ){
                    if(component.series.length > 1){
                        chartData.labeldata[keyindex] = label;
                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            if( data[component.series[seriesCount]] ){
                                var converted = countChartValue( component, data[component.series[seriesCount]] );
                                chartData.temp[keyindex] = data[component.series[seriesCount]];
                                chartData.dataset[seriesCount].data[keyindex] = ( [ label, converted.value ] );
                                chartData.tempData[seriesCount].data[keyindex] = ( [ label, data[component.series[seriesCount]] ] );
                                
                                chartData.updateTime = new Date();
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
                            chartData.updateTime = new Date();
                        }
                    }
                }
                else{
                    pushDataForFlowChart(component, data, label);
                }
            });
        
            if(component.series.length > 1){
                $timeout(function(){
                    var maxVal = Math.max.apply(null, chartData.temp);
                    console.log(maxVal);
                    var converted = countChartValue( component, maxVal );
                    console.log(converted);
                    changeMultiValueFlowChart( component, converted );
                }, 100);
            }
            console.log('chartData Replace', chartData);
        }

        function processFlotChartMultiSeriesMovingData(component, data){
            var chartData = $scope.displaydata[component._id];
            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = data[component.labels] + globalConfig.tzAdjustment;
            }
            else{
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            //console.log('moving keyindex', keyindex);
            //console.log('label', label);
            if( keyindex > -1){
                chartData.labeldata[keyindex] = label;
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    if( component, data[component.series[seriesCount]] ){
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        console.log('converted Value', converted.value);
                        //chartData.dataset[seriesCount].data[keyindex] = ( [ label, converted.value ] );
                        chartData.tempData[seriesCount].data[keyindex] = ( [ label, data[component.series[seriesCount]] ] );
                        
                        //change value to KB/MB/GB
                        changeValueFlowChart( component, seriesCount, converted );
                        chartData.updateTime = new Date();
                    }
                }
            }
            else{
                pushDataForFlowChart(component, data, label);
            }

            console.log('length', chartData.labeldata.length);
            if(chartData.labeldata.length > parseInt(component.dataelement)){
                chartData.labeldata.shift();
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    console.log('removed');
                    chartData.dataset[seriesCount].data.shift();
                    chartData.tempData[seriesCount].data.shift();
                }
            }
            console.log('chartData moving', chartData);
        }

        function processFlotChartMultiSeriesUpdateData(component, data){
            var chartData = $scope.displaydata[component._id];
            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = data[component.labels] + globalConfig.tzAdjustment;
            }
            else if( component.labelType == 'value' ){
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            // console.log('update keyindex', keyindex);
            // console.log('label', label);
            if( keyindex > -1){
                chartData.labeldata[keyindex] = label;
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    if( data[component.series[seriesCount]] ){
                        var oldValue = parseInt( chartData.tempData[seriesCount].data[keyindex][1] );
                        var newValue = data[component.series[seriesCount]];

                        // console.log('oldValue for '+ label, oldValue);
                        // console.log('newValue for '+ label, newValue );
                        var converted = countChartValue( component, oldValue + newValue );
                        
                        chartData.tempData[seriesCount].data[keyindex] = ( [ label, oldValue + newValue ] );
                        
                        //change value to KB/MB/GB
                        changeValueFlowChart( component, seriesCount, converted );
                        chartData.updateTime = new Date();
                    }
                }
            }
            else{
                pushDataForFlowChart(component, data, label);
            }
            //console.log('update chartData', chartData);
        }

        function processFlotChartMultiSeriesUpsertData(component, data){
            var chartData = $scope.displaydata[component._id];
            if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                var label = data[component.labels] + globalConfig.tzAdjustment;
            }
            else if( component.labelType == 'value' ){
                var label = data[component.labels];
            }
            var keyindex = $.inArray( label, chartData.labeldata );
            //console.log('upsert keyindex', keyindex);
            //console.log('label ',label);
            if( keyindex > -1){
                chartData.labeldata[keyindex] = label;
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    if( data[component.series[seriesCount]] ){
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        console.log('converted Value', converted.value);
                        //chartData.dataset[seriesCount].data[keyindex] = ( [ label, converted.value ] );
                        chartData.tempData[seriesCount].data[keyindex] = ( [ label, data[component.series[seriesCount]] ] );
                        
                        //change value to KB/MB/GB
                        changeValueFlowChart( component, seriesCount, converted );
                        chartData.updateTime = new Date();
                    }
                }
            }
            else{
                pushDataForFlowChart(component, data, label);
            }
            console.log('upsert chartData', chartData);
        }

        function countChartValue(component, value){
            //console.log('newValue', value);
            var newValue = value;
            var unit = '';
            //console.log(component);
            if( component.chartUnitAdjustFlag == 'yes' ){
                if( component.chartUnit == 'usage' ){
                    unit = 'Bytes';
                    if( newValue > 1024){
                        var datamb = ( newValue/1024 ).toFixed(1);
                        if( datamb > 1024 ){
                            var datagb = ( datamb/1024 ).toFixed(1);
                            if( datagb > 1024 ){
                                var datatb = ( datagb/1024 ).toFixed(1);
                                newValue = datatb;
                                unit = 'GB';
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
                    if( newValue >= 1000 && newValue < 1000000){
                        unit = 'K';
                    }
                    else if( newValue >= 1000000 ){
                        unit = 'MN';
                    }
                }
            }
            return( {'value' : newValue, 'unit': unit} );
        }

        function pushDataForFlowChart(component, data, label){
            var chartData = $scope.displaydata[component._id];

            chartData.labeldata.push( label );
            if( component.series.length == 1){
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    if( data[component.series[seriesCount]] ){
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        chartData.dataset[seriesCount].data.push( [ label, converted.value ] );
                        chartData.tempData[seriesCount].data.push( [ label, data[component.series[seriesCount]] ] );
                        //console.log('converted', converted);

                        //change value to KB/MB/GB
                        changeValueFlowChart( component, seriesCount, converted );
                        chartData.updateTime = new Date();
                    }
                    else{
                        var index = chartData.labeldata.indexOf( label );
                        if (index > -1) {
                            chartData.labeldata.splice(index, 1);
                        }
                    }
                }
            }
            else{
                console.log(data);
                console.log(component.series);
                console.log(data[component.series[0]]);
                console.log(data[component.series[1]]);
                return false;
                //For multiple line
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    if( data[component.series[seriesCount]] ){
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        chartData.temp.push( data[component.series[seriesCount]] );
                        chartData.dataset[seriesCount].data.push( [ label, converted.value ] );
                        chartData.tempData[seriesCount].data.push( [ label, data[component.series[seriesCount]] ] );
                    }
                    else{
                        var index = chartData.labeldata.indexOf( label );
                        if (index > -1) {
                            chartData.labeldata.splice(index, 1);
                        }
                    }
                }
            }
        }

        function changeValueFlowChart(component, seriesCount, converted){
            var chartData = $scope.displaydata[component._id];
            chartData.options.yaxis.axisLabel = converted.unit;

            if(converted.unit == "KB" || converted.unit == "MB" || converted.unit == "GB"){
                for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                    var val = chartData.tempData[seriesCount].data[i][1];
                    if( converted.unit == "KB" ){
                        val = val / Math.pow(2, 10);
                    }else if( converted.unit == "MB" ){
                        val = val / Math.pow(2, 20);
                    }else if( converted.unit == "GB" ){
                        val = val / Math.pow(2, 30);
                    }
                    chartData.dataset[seriesCount].data[i][1] = toFixeValue( val );
                }
            }
        }

        function changeMultiValueFlowChart( component, converted ){
            var chartData = $scope.displaydata[component._id];
            chartData.options.yaxis.axisLabel = converted.unit;

            if(converted.unit == "KB" || converted.unit == "MB" || converted.unit == "GB"){
                _.forEach(component.series, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                        var val = chartData.tempData[seriesCount].data[i][1];
                        if( converted.unit == "KB" ){
                            val = val / Math.pow(2, 10);
                        }else if( converted.unit == "MB" ){
                            val = val / Math.pow(2, 20);
                        }else if( converted.unit == "GB" ){
                            val = val / Math.pow(2, 30);
                        }
                        chartData.dataset[seriesCount].data[i][1] = toFixeValue( val );
                    }
                });
            }
        }
    /*End Flot Chart*/

    function setTimeInterval(component){
        if( angular.isDefined(component.frequency)){
            timeInterval(component);
            var intervalTime = parseInt(component.frequency);
            console.log( component.name +' = '+ intervalTime);
            if( intervalTime != 0){
                $interval(function(){
                    timeInterval(component);
                }, intervalTime * 60 * 1000);
            }
        }
    }

    function timeInterval(component){
        console.log('interval function called...');
        var from = $filter('date')( new Date().getTime()-24*60*60*1000 , "yyyy-MM-dd");
        var from = $scope.date.start+'T00:00:00.000Z';

        var to = $filter('date')( new Date().getTime() , "yyyy-MM-dd");
        var to = $scope.date.end+'T23:59:59.999Z';
        //+ '&fromDate='+ from +'&toDate='+to
        $http.get(globalConfig.pullfilterdataurl + component.query + '&fromDate='+ from +'&toDate='+to).then(function(res){
            //console.log(res.data);
            if( angular.isDefined(res.data) && res.data.length > 0){
                if( component.type == 'simple_ibox' )
                    processIBoxData(component, res.data[0]);
                else if( component.type == 'simple_table' || component.type == 'table_with_search' )
                    processTableReplaceData(component, res.data);
                else if( component.type == 'simple_charts'){
                    if( component.libType == 'flot'){
                        if( component.chartType == 'Line'){
                            processFlotChartMultiSeriesReplaceData(component, res.data);
                        }
                        else if( component.chartType == 'Pie' ){
                            pieFlotReplaceData(component, res.data);
                        }
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
                        else if( component.chartType == 'Line' || component.chartType == 'Bar')
                            multiSeriesD3ReplaceData(component, res.data);

                    }
                    else if( component.libType === 'highchart' ){
                        highchartReplaceData( component, res.data );
                    }
                }
                else if( component.type == 'ibox_with_embeded_chart' && component.dataKpi == 'DBPull'){
                    processIBoxWithChartData(component, res.data[0]);
                }
                else if( component.type == 'ibox_with_embeded_chart' && component.data == 'DBPull'){
                    if(component.libType == 'flot')
                        processFlotChartMultiSeriesReplaceData(component, res.data);
                    else if( component.libType == 'ChartJs' )
                        processChartMultiSeriesReplaceData(component, res.data);
                }
                else if( component.type == 'map')
                    mapReplaceData(component, res.data);
            }
        });
    }

    $scope.dtOptions = {
        paging : true,
        searching : true,
        "bLengthChange" : true,
        "bSort" : true,
        "bInfo" : true,
        "bAutoWidth" : true
    };

    function toFixeValue( value ){
        return value.toFixed(2);
    }

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
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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
    $scope.loadLocation = function(){
        var children = globalConfig.locationData[0].children;
        console.log('location', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                    var thisNode= node.data;
                    var nodeKey= node.data.key;
                    var thisParent = node.parent;
                    var parentKey =thisParent.data.key;
                    if(thisNode.isFolder){
                        //First check if parent exists
                        if(!chkEntry(keyArrayParent,parentKey)){
                            //Parent key does not exist, so add this entry in parent & result
                            keyArrayParent.push(nodeKey);
                            var getParentRes = getParents(node);
                            if(getParentRes != '_1')
                                keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                            else
                                keyArrayResult.push("/^." + nodeKey + "/");
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
                            if(getParentRes != '_1')
                                keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                            else
                                keyArrayResult.push("/^." + nodeKey + "/");
                        }
                    }
                });
                console.log("keyArrayResult: ",keyArrayResult)
                $scope.locationSelected = keyArrayResult;
                var test = '';
                angular.forEach(selKeysSegment, function(value, key){
                    test += '&'+value + '=' + value;
                });
                $scope.selectedSegment = test;
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
        /*$http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
            //console.log('testr',response.data[0].children);
            var children = response.data[0].children;
            console.log('children', children);
            
        });*/
    }
    $scope.loadLocation();

    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1"){
                console.log("-- parent :",parent);
                parent = parent;
            }
            else
                parent = node.parent.data.key + "." + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        // if(parent=="_1"){
        //     console.log("-- parent2 :",parent);
        //     parent = "";
        // }
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            console.log("else...");
        }
    }

    $scope.ratSelected = [];
    $scope.loadRat = function(){
        var rat = globalConfig.ratData;
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
                            keyArrayResult.push(getParents(node)+nodeKey);
                        }else{
                            keyArrayParent.push(nodeKey);
                        }
                    }else{
                        if(!chkEntry(keyArrayParent,parentKey)){
                            keyArrayResult.push(getParents(node)+nodeKey);
                        }
                    }
                });
                console.log("rate: ",keyArrayResult)
                $scope.ratSelected = keyArrayResult;
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
        var segmentData = globalConfig.segmentData;
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
                            keyArrayResult.push(getParents(node)+nodeKey);
                        }else{
                            keyArrayParent.push(nodeKey);
                        }
                    }else{
                        if(!chkEntry(keyArrayParent,parentKey)){
                            keyArrayResult.push(getParents(node)+nodeKey);
                        }
                    }
                });
                console.log("segment: ",keyArrayResult)
                $scope.segmentSelected = keyArrayResult;
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
        var children = globalConfig.deviceData[0].children;
        //console.log('device', children);
        $("#device").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
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
                            var getParentRes = getParents(node);
                            if(getParentRes != '_1')
                                keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                            else
                                keyArrayResult.push("/^." + nodeKey + "/");
                        }else{
                            keyArrayParent.push(nodeKey);
                        }
                    }else{
                        if(!chkEntry(keyArrayParent,parentKey)){
                            var getParentRes = getParents(node);
                            if(getParentRes != '_1')
                                keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                            else
                                keyArrayResult.push("/^." + nodeKey + "/");
                        }
                    }
                });
                console.log("device: ",keyArrayResult)
                $scope.deviceSelected = keyArrayResult;
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
    }
    $scope.loadDevice();

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.search = function(date){
        $scope.locationTree = false;
        $scope.ratTree = false;
        $scope.segmentTree = false;
        $scope.deviceTree = false;

        var from = date.start+'T00:00:00.000Z';
        var to = date.end+'T23:59:59.999Z';
        console.log('locationSelected', $scope.locationSelected);
        var parameter = '';
        if($scope.locationSelected.length > 0)
            parameter += '&location='+buildFilterParams($scope.locationSelected, false);

        if($scope.ratSelected.length > 0)
            parameter += '&rat='+buildFilterParams($scope.ratSelected, true);

        if($scope.segmentSelected.length > 0)
            parameter += '&segment='+buildFilterParams($scope.segmentSelected, true);

        if($scope.deviceSelected.length > 0)
            parameter += '&device='+buildFilterParams($scope.deviceSelected, false);


        parameter += '&fromDate='+ from +'&toDate='+to;
        //&rat=[\'GERAN\',\'UTRAN\']
        //&segment=[\'Gold\',\'Platinum\',\'Youth\',\'VIP\',\'Others\']
        console.log(parameter);
        //return false;
        var componentArr = $scope.displaydata;
        _.forEach(componentArr, function(value, key){
            var component = value.component;
            console.log('component', component);

            $http.get(globalConfig.pullfilterdataurl + component.query + parameter).then(function(res){
                if( component.type == 'simple_ibox' )
                    processIBoxData(component, res.data[0]);
                else if( component.type == 'simple_table' || component.type == 'table_with_search' )
                    processTableReplaceData(component, res.data);
                else if( component.type == 'simple_charts'){
                    if( component.libType == 'flot'){
                        if( component.chartType == 'Line'){
                            processFlotChartMultiSeriesReplaceData(component, res.data);
                        }
                        else if( component.chartType == 'Pie' ){
                            pieFlotReplaceData(component, res.data);
                        }
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
                        else if( component.chartType == 'Line' || component.chartType == 'Bar')
                            multiSeriesD3ReplaceData(component, res.data);

                    }
                    else if( component.libType === 'highchart' ){
                        highchartReplaceData( component, res.data );
                    }
                }
                else if( component.type == 'ibox_with_embeded_chart' && component.dataKpi == 'DBPull'){
                    processIBoxWithChartData(component, res.data[0]);
                }
                else if( component.type == 'ibox_with_embeded_chart' && component.data == 'DBPull'){
                    if(component.libType == 'flot')
                        processFlotChartMultiSeriesReplaceData(component, res.data);
                    else if( component.libType == 'ChartJs' )
                        processChartMultiSeriesReplaceData(component, res.data);
                }
                else if( component.type == 'map')
                    mapReplaceData(component, res.data);
            });
        });
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
});