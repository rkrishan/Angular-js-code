'use strict';

angular.module('specta')
    .controller('StagingViewCtrl', function ($scope, $rootScope, $interval, $location, $http, $filter, $modal, $state, globalData, NgMap, globalConfig, $stateParams, ChartService, SweetAlert, UserProfile, socket,$timeout,NgTableParams) {
    
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
    }
    
    /*$scope.PieChart4 = {
        data: [1, 4],
        options: {
            fill: ["#1ab394", "#d7d7d7"]
        }
    };*/

    $scope.ibox={};

    $scope.ibox.linechartOptions = {
        fill: '#1ab394',
        stroke: '#169c81',
        width: 64 
    };

    if(angular.isDefined($stateParams.id)){
        $scope.dashboardId = $stateParams.id;
        var pageName = $state.current.data.pageTitle.toLowerCase();
        //console.log('pageName', pageName);
        $http.get($scope.apiURL +'/'+ pageName +'/'+ $stateParams.id).then(function (response) {
            //console.log(pageName,response.data);
            $scope.headerName = response.data.name;
            $scope.report = response.data;
            if( $scope.report.filter && $scope.report.filter.indexOf('date') > -1 ){
                var day = 24*parseInt($scope.report.day);
                var day = day*60*60*1000;
                var from = $filter('date')( new Date().getTime()- day, "yyyy-MM-dd");
                var to= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
                $scope.date= {"start":from, "end":to};
            }
            else{
                var from = $filter('date')( new Date().getTime()-0*60*60*1000 , "yyyy-MM-dd");
                var to = $filter('date')( new Date().getTime() , "yyyy-MM-dd");
                $scope.date = {"start":from,"end":to};
                //console.log('date', $scope.date);
            }
            //console.log('start date', $scope.date);
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

    $scope.cancel = function () {
        $scope.newPage.name = '';
    };

    $scope.loadPages = function () {
        var data = { 'dashboardId': $stateParams.id };
        var postUrl = $scope.apiURL + '/pages?query=' + encodeURIComponent(JSON.stringify(data));
        //console.log('psoturl', postUrl);
        $http.get(postUrl).then(function (response) {
            if(angular.isDefined(response.data) && response.data.constructor === Array){
                $scope.tabLists = angular.copy(response.data);
            }

            if($scope.tabLists.length > 0)
            {
                $scope.setCurrentPage($scope.tabLists[0]);
            }
        });
    };
    $scope.loadPages();
    //$scope.loadDashboard();
    
    /*$http.get(globalConfig.dataapiurl+'/statements').then(function(res){
        var data = res.data;
        for(var index = 0; index < data.length; index++){
            var statement = data[index];
            $scope.statements[statement.statementId] = statement;
        }
        //console.log($scope.statements);
        
    });*/

    //Load Chart Options
    /*$http.get(globalConfig.dataapiurl+'/chartoptions').then(function(res){
        $scope.chartOptionsList = res.data;
    });*/

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

    $scope.setBlankPage = function () {
        // ChartService.setCurrentPage({ 'name': 'new' });
    };

    $scope.$on('NewPageChartAdded', function (event,arg) {
        console.log('callback on page argument: ',arg);
        addComponentToPage(arg);
    });

    $scope.$on('MovedToDifferentDashboard',function(event,arg){
        //console.log('moved to different dashboard: ',arg);
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
        //console.log(' Page update request: ',request);
        var tmp = JSON.parse(request);
        delete tmp["_id"];
        delete tmp["active"];
        //console.log(' update request object',tmp);
        $http.put(globalConfig.dataapiurl + '/pages/' + page._id, tmp).then(function (updateResponse) {
            //console.log('update page response: ', updateResponse);
        });
    }

    $scope.removeComponent = function (component) {
        var tempArr = [];
        _.forEach($scope.currentPage.components, function(item, k){
            _.forEach(item, function(value, key){
                if(value.component._id != component.component._id){
                    tempArr.push(value);
                }
            });
        });
        //console.log(tempArr);
        $scope.currentPage.components = tempArr;
        backgroundUpdatePage($scope.currentPage);
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
        //console.log('unsubscribeForComponent: ',component);
        if(angular.isDefined(component.component.query)){
            socket.unsubscribe(component.component.query);
        }
    }

    function subscribeData(page) {
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
        var fields = JSON.stringify(["type", "statementId", "eventPublish"]);
        var query = JSON.stringify({'statementId': component.component.query});
        var statementParam = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);

        $http.get(globalConfig.dataapiurl +'/statements?'+ statementParam ).then(function(res){
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
                    if(component.component.type == 'complex_table')
                        subscribeComplexTable(component.component);
                    else
                        subscribeTable(component.component);
                    break;
                case "ibox_with_embeded_chart":
                    $http.get(globalConfig.dataapiurl +'/chartoptions/'+ component.component.options ).then(function(res){
                        var options = getOption( res.data.options );
                        component.component.chartOptions = options;
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
        $http.get(globalConfig.dataapiurl +'/chartoptions/'+ component.options ).then(function(res){
            var options = getOption( res.data.options );
            component.chartOptions = options;

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
                        subscribeChartMultiSeriesD3(component); //Line, CumulativeLine, StackedArea, LinePlusBar, ScatterPlusLine
                        break;
                }
            }
            else if( component.libType === 'flot' ){
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
            else if( component.libType === 'highchart' ){
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
                $http.get(globalConfig.snapshoturl + component.query + '/1').then(function(res){
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
            //console.log('map data', map);
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
        //highchart bar
            function subscribeHighchart( component ){
                if(component.timeType)
                    component.chartOptions.options.xAxis.title.text = component.timeType;
                else
                    component.chartOptions.options.xAxis.title.text = component.labels;

                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
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
                                    //console.log(this.category, this.y);
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
                                    //console.log(this.category, this.y);
                                    var label = this.category;
                                    var params = {Key: component.chartUnit, Device: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                }

                for(var i = 0; i< component.series.length; i++){
                    $scope.displaydata[component._id].options.series.push({'name': component.series[i], "data":[]});
                    $scope.displaydata[component._id].tempData.push([]);
                }
                
                if( component.data != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                        processSnapshotHighchart(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            console.log(data);
                            if( $scope.displaydata[component._id].statement.type === 'refresh' ){
                                highchartRefreshMoving(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                                highchartRefreshMoving(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'update' ){
                                highchartUpdateData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                highchartReplaceData(component, data.event);
                            }
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
                        if( type === 'refresh' )
                            highchartRefreshMoving(component, data[index]);
                        else if( type === 'moving' )
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

                        // var converted = countChartValue(component, data[component.series[seriesCount]]);
                        // changeHighChartData(component, converted);
                    }
                }
                else{
                    chartData.labeldata.push( label );
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );
                        chartData.options.series[seriesCount].data.push( data[component.series[seriesCount]] );
                        tmp.push( data[component.series[seriesCount]] );
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
                //console.log(converted);
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
                //console.log(chartData);
            }

        //Pie Chart
            function subscribeSingleSeriesHighchart( component ){
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                //Clickble
                if( component.page != '' && component.clickable == true ){
                    if( component.chartType == "Pie" ){
                        component.chartOptions.series[0].point = {
                            events:{
                                click: function (event) {
                                    //console.log(this);
                                    var label = this.name;
                                    //console.log(this.x + " " + this.y);
                                    var params = {Key: component.chartUnit, value: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                }

                if( component.data != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query +'/'+ component.dataelement).then(function(res){
                        snapshotSingleSeriesHighchart(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( $scope.displaydata[component._id].statement.type === 'refresh' ){
                                highchartUpsertData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'moving' ){
                                highchartMovingData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                highchartSingleSeriesReplace(component, data.event);
                            }
                        });
                    });
                }
                else{
                    setTimeInterval(component);
                }
            }

            function snapshotSingleSeriesHighchart(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Single Series-> ' + component.title +' == '+ type);
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

                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];       
                    chartData.options.series[0].data = [];
                    chartData.tempData = [];
                }
                _.forEach(data1, function(data, key){
                    pushSingleSeriesHighchart(component, data);
                    if(data1.length == key + 1){
                        var maxVal = Math.max.apply(null, chartData.tempData);
                        var converted = countChartValue( component, maxVal );
                        changeSingleSeriesHighchartData(component, converted);
                    }
                });
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
                else if( component.timeType == 'minute' || component.timeType == 'hour'){
                    component.chartOptions.options.xAxis.labels.format = "{value:%H:%M}";
                    component.chartOptions.options.tooltip.xDateFormat = "%H:%M";
                }
                else if( component.timeType == 'hour' ){
                    // component.chartOptions.options.xAxis.labels.format = "{value:%H %p}";
                    // component.chartOptions.options.tooltip.xDateFormat = "%H %p";
                }
                else if( component.timeType == 'day' ){
                    component.chartOptions.options.xAxis.labels.format = "{value:%e %b}";
                    component.chartOptions.options.tooltip.xDateFormat = "%e %b";
                }

                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    tempData:[],
                    series: [],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                if( component.data != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query +'/'+ component.dataelement).then(function(res){
                        snapshotMultiLine(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            console.log('multiline  data', data);
                            if( $scope.displaydata[component._id].statement.type === 'replace' )
                                highchartMultiLineReplace(component, data.event);
                            else
                                highchartMultilineMovingRefresh(component, data.event);
                            
                            $scope.$apply();
                        });
                    });
                }
                else{
                    setTimeInterval(component);
                }
            }

            function snapshotMultiLine(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Multi Line-> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    highchartMultiLineReplace(component, data);
                }
                else{
                    //highchartMultilineMovingRefresh(component, data[0]);
                    for(var i=0; i<data.length; i++){
                        highchartMultilineMovingRefresh(component, data[i]);
                    }
                }
            }

            function highchartMultilineMovingRefresh(component, data){
                var chartData = $scope.displaydata[component._id];
                //console.log(data);
                if(component.labelType == 'time'){
                    //console.log(data[component.labels]);
                    data[component.labels] += globalConfig.tzAdjustment;
                    //console.log(data[component.labels]);
                }

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
                //console.log( chartData.options.series );
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
                            if(component.timeType == 'time')
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
                //console.log(chartData.options);
            }

        //stacked Bar
            function subscribeStackedBarHighchart( component ){
                console.log(component);
                if(component.labelType == 'time')
                    component.chartOptions.options.xAxis.title.text = component.timeType;
                else
                    component.chartOptions.options.xAxis.title.text = component.labels;

                /*component.chartOptions.options.tooltip.formatter = function() {
                    return '<b>'+ this.column.name +'</b>: '+ Highcharts.numberFormat(this.percentage, 2);
                }*/
                //component.chartOptions.options.tooltip.pointFormat = '{series.name}: <b>{point.percentage}</b>';
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata: [],
                    tempData: [],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                
                if($scope.displaydata[component._id].options.options.yAxis.labels)
                    $scope.displaydata[component._id].options.options.yAxis.labels.formatter = function() {return Math.abs(this.value);}
                
                var options = { 
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: 'Browser market shares. January, 2015 to May, 2015'
                        },
                        xAxis: {
                            type: 'category'
                        },
                        yAxis: {
                            title: {
                                text: 'Total percent market share'
                            }

                        },
                        legend: {
                            enabled: false
                        },
                        plotOptions: {
                            series: {
                                borderWidth: 0,
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.y:.1f}%'
                                }
                            }
                        },

                        tooltip: {
                            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                        }
                    };
                var series  = [{
                    name: 'Brands',
                    colorByPoint: true,
                    data: [{
                        name: 'Microsoft Internet Explorer',
                        y: 56.33,
                        drilldown: 'Microsoft Internet Explorer'
                    }, {
                        name: 'Chrome',
                        y: 24.03,
                        drilldown: 'Chrome'
                    }, {
                        name: 'Firefox',
                        y: 10.38,
                        drilldown: 'Firefox'
                    }, {
                        name: 'Safari',
                        y: 4.77,
                        drilldown: 'Safari'
                    }, {
                        name: 'Opera',
                        y: 0.91,
                        drilldown: 'Opera'
                    }, {
                        name: 'Proprietary or Undetectable',
                        y: 0.2,
                        drilldown: null
                    }]
                }];

                var drilldown = {
                    series: [{
                        name: 'Microsoft Internet Explorer',
                        id: 'Microsoft Internet Explorer',
                        data: [
                            [
                                'v11.0',
                                24.13
                            ],
                            [
                                'v8.0',
                                17.2
                            ],
                            [
                                'v9.0',
                                8.11
                            ],
                            [
                                'v10.0',
                                5.33
                            ],
                            [
                                'v6.0',
                                1.06
                            ],
                            [
                                'v7.0',
                                0.5
                            ]
                        ]
                    }, {
                        name: 'Chrome',
                        id: 'Chrome',
                        data: [
                            [
                                'v40.0',
                                5
                            ],
                            [
                                'v41.0',
                                4.32
                            ],
                            [
                                'v42.0',
                                3.68
                            ],
                            [
                                'v39.0',
                                2.96
                            ],
                            [
                                'v36.0',
                                2.53
                            ],
                            [
                                'v43.0',
                                1.45
                            ],
                            [
                                'v31.0',
                                1.24
                            ],
                            [
                                'v35.0',
                                0.85
                            ],
                            [
                                'v38.0',
                                0.6
                            ],
                            [
                                'v32.0',
                                0.55
                            ],
                            [
                                'v37.0',
                                0.38
                            ],
                            [
                                'v33.0',
                                0.19
                            ],
                            [
                                'v34.0',
                                0.14
                            ],
                            [
                                'v30.0',
                                0.14
                            ]
                        ]
                    }, {
                        name: 'Firefox',
                        id: 'Firefox',
                        data: [
                            [
                                'v35',
                                2.76
                            ],
                            [
                                'v36',
                                2.32
                            ],
                            [
                                'v37',
                                2.31
                            ],
                            [
                                'v34',
                                1.27
                            ],
                            [
                                'v38',
                                1.02
                            ],
                            [
                                'v31',
                                0.33
                            ],
                            [
                                'v33',
                                0.22
                            ],
                            [
                                'v32',
                                0.15
                            ]
                        ]
                    }, {
                        name: 'Safari',
                        id: 'Safari',
                        data: [
                            [
                                'v8.0',
                                2.56
                            ],
                            [
                                'v7.1',
                                0.77
                            ],
                            [
                                'v5.1',
                                0.42
                            ],
                            [
                                'v5.0',
                                0.3
                            ],
                            [
                                'v6.1',
                                0.29
                            ],
                            [
                                'v7.0',
                                0.26
                            ],
                            [
                                'v6.2',
                                0.17
                            ]
                        ]
                    }, {
                        name: 'Opera',
                        id: 'Opera',
                        data: [
                            [
                                'v12.x',
                                0.34
                            ],
                            [
                                'v28',
                                0.24
                            ],
                            [
                                'v27',
                                0.17
                            ],
                            [
                                'v29',
                                0.16
                            ]
                        ]
                    }]
                };

                // $scope.displaydata[component._id].options.options = options;
                // $scope.displaydata[component._id].options.series = series;
                // $scope.displaydata[component._id].options.options.drilldown = drilldown;
                // console.log($scope.displaydata[component._id].options);
                // return false;

                if( component.data != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                        snapshotStackedBarHighchart(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                highchartStackedBarReplace(component, data.event);
                            }
                        });
                    });
                }
                else{
                    setTimeInterval(component);
                }
            }

            function snapshotStackedBarHighchart(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Stacked Bar -> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    highchartStackedBarReplace(component, data);
                }
                else{
                    for(var index = 0; index < data.length; index++){
                    }
                }
            }

            function highchartStackedBarReplace(component, data1){
                var chartData = $scope.displaydata[component._id];
                //console.log(component.ySeries);

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
                    //console.log(highest, keyIndex);
                    
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
                console.log(converted);
                var chartData = $scope.displaydata[component._id];
                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                chartData.updateTime = new Date();
                chartData.options.options.yAxis.title.text = converted.unit;
                chartData.options.options.xAxis.categories = chartData.labeldata;

                _.forEach(chartData.tempData, function(value, seriesCount){
                    //chartData.options.series[seriesCount].data = [];
                    for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                        var val = chartData.tempData[seriesCount][i];
                        val = getConvertedVal( val, converted.unit );
                        chartData.options.series[seriesCount].data[i] = Number(parseFloat(val).toFixed(1) );
                    }
                });
                console.log(chartData);
            }

        //Pyramid
            function subscribePyramid( component ){
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                $scope.displaydata[component._id].options.series = [{name: component.labels, data:[]}];
                //console.log(component.chartOptions);
                //Clickble
                if( component.page != '' && component.clickable == true ){
                    if( angular.isDefined( component.chartOptions.options.plotOptions.series ) ){
                        component.chartOptions.options.plotOptions.series.point = {
                            events:{
                                click: function (event) {
                                    //console.log(this.name, this.y);
                                    var label = this.name;
                                    var params = {Key: component.chartUnit, Device: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                }

                if( component.data != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                        processSnapshotPyramid(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                pyramidReplaceData(component, data.event);
                            }
                            else if( $scope.displaydata[component._id].statement.type === 'refresh' ){
                                pyramidRefreshData(component, data.event);
                            }
                            $scope.$apply();
                        });
                    });
                }
                else{
                    setTimeInterval(component);
                }
            }

            function processSnapshotPyramid( component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Pyramid -> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    pyramidReplaceData(component, data);
                }
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
                //console.log(chartData);
            }
    
        //Scatter
            function subscribeScatterHighchart(component){
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
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                if( component.data != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query +'/'+ component.dataelement).then(function(res){
                        snapshotScatterHighchart(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                highchartScatterReplace(component, data.event);
                            }
                        });
                    });
                }
                else{
                    setTimeInterval(component);
                }
            }

            function snapshotScatterHighchart(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Scatter-> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    highchartScatterReplace(component, data);
                }
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
                //console.log(chartData);
            }

        //LinePlushBar
            function subscribeLinePlushBarHighchart(component){
                component.chartOptions.options.xAxis[0].title.text = component.labels;
                component.chartOptions.series[0].name = component.barSeries;
                component.chartOptions.series[1].name = component.lineSeries;
                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };

                if( component.data != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query +'/'+ component.dataelement).then(function(res){
                        snapshotLinePlushBar(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                highchartLinePlushBarReplace(component, data.event);
                            }
                        });
                    });
                }
                else{
                    setTimeInterval(component);
                }
            }

            function snapshotLinePlushBar(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Line Plush Bar-> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    highchartLinePlushBarReplace(component, data);
                }
            }

            function highchartLinePlushBarReplace(component, data1){
                var chartData = $scope.displaydata[component._id];
                console.log(component);
                return false;
                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.options.series[0].data = [];
                    chartData.options.series[1].data = [];
                    chartData.tempData[0] = [];
                    chartData.tempData[1] = [];
                }
                console.log(chartData.options);
                //return false;

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
                
                //console.log(seriesCount, chartData.options.series[seriesCount]);
            }
    /*End Highchart*/

    /*Embeded Chart*/
        function subscribeIboxWithChart(component){
            //console.log('subscribeIboxWithChart',component);
            // if(typeof $scope.displaydata[component._id] === 'undefined'){
            //     var options = getOption(component);

                $scope.displaydata[component._id] = {
                    component: component,
                    kpi:'',
                    spanclass: '',
                    indicatorClass: '',
                    kpiindicator:'',
                    labeldata: [],
                    dataset:[],
                    tempData:[],
                    dataIndex:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
            //}

            if(component.libType == 'flot'){
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                    $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
                }
            }
            //console.log('display data after subscribing subscribeIBox tick: ' , $scope.displaydata);
            if(component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/'+ component.dataelement).then(function(res){
                    if(component.libType == 'flot' && res.data != 'error')
                        processSnapshotMultiSeriesFlot(component, res.data);

                    socket.subscribe(component.query, function(res){
                        var ibox = component;
                        var tmp = JSON.parse(res);
                        var data = tmp[ibox.query];
                        if($scope.displaydata[component._id]){
                            if( component.libType == 'flot' ){
                                if($scope.displaydata[component._id].statement.type === 'refresh'){
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
                                if($scope.displaydata[component._id].statement.type === 'refresh'){
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
                $http.get(globalConfig.snapshoturl + component.queryKpi + '/1').then(function(res){
                    if(res.data != 'error')
                        processIBoxWithChartSnapshotData(component, res.data);

                    socket.subscribe(component.queryKpi, function(res){
                        console.log('subscribeIBox with chart response: ',res);
                        var tmp = JSON.parse(res);
                        var data = tmp[component.queryKpi];
                        processIBoxWithChartData(component, data.event);
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
                var iboxData = $scope.displaydata[component._id];
                if(component.unit == 'percent'){
                    iboxData.kpi = (data[component.valueKpi]).toFixed(component.dataDecimal);
                    iboxData.unit = '%';
                }
                else{
                    var newValue = countIBoxUnit( component, data[component.valueKpi] );
                    
                    iboxData.kpi = newValue.value.toFixed(component.dataDecimal);
                    iboxData.unit = newValue.unit;
                }
                iboxData.updateTime = new Date();
                if(component.indicator){
                    getAndSetIndicatorIboxData(component, data, component.valueKpi);
                }
                //console.log( 'after new data displaydata: ', iboxData );
            }
        }
    /*End Embeded Chart*/

    /*ChartJs*/
        //Bar
        function subscribeChartBar(component){
            //console.log('subscribe Chart Bar: ',component);
            // if(typeof $scope.displaydata[component._id] === 'undefined'){
            //     var options = getOption(component);

                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata:[],
                    data:[],
                    tempData: [],
                    dataIndex:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime:''
                };
            //}
            
            for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                $scope.displaydata[component._id].data.push([]);
                $scope.displaydata[component._id].tempData.push([]);
            }
            //console.log('display data after subscribing chartbar: ' , $scope.displaydata);

            if( component.data != 'DBPull' ){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    processSnapshotMultiSeries(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('subscribeChartBar data: ',data);
                        if($scope.displaydata[component._id]){
                            if($scope.displaydata[component._id].statement.type === 'refresh'){
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
            var type = $scope.displaydata[component._id].statement.type;
            console.log('Bar Chart Multi -> ' + component.title +' == '+ type);
            if( type === 'replace'){
                processChartMultiSeriesReplaceData(component, data);
            }
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
            
            if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                chartData.labeldata = [];
                chartData.data = [];
                chartData.tempData = [];
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    chartData.data.push([]);
                    chartData.tempData.push([]);
                }
                
            }

            _.forEach(data1, function(data, key){
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var label = convertTimeStampToLabel( component, data[component.labels] );
                }
                else if( component.labelType == 'value' ){
                    var label = data[component.labels];
                }
                //var label = data[component.labels];
                //console.log(data);
                
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
                var maxTmp = [];
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    //console.log( chartData.tempData[seriesCount] );
                    var test = Math.max.apply(null, chartData.tempData[seriesCount]);
                    maxTmp.push(test);
                }
                var test = Math.max.apply(null, maxTmp);
                var converted = countChartValue( component, test );
                console.log( converted );
                changeValueChartJsBar(component, converted);
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

        function changeValueChartJsBar(component, converted){
            var chartData = $scope.displaydata[component._id];
            chartData.options.yAxisLabel = converted.unit;
            
            for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                    var val = chartData.tempData[seriesCount][i];
                    val = getConvertedVal(val, converted.unit);
                    chartData.data[seriesCount][i] = parseFloat(val).toFixed(2);
                }
            }
        }

        function changeValueChartJs(component, seriesCount, converted){
            var chartData = $scope.displaydata[component._id];
            chartData.options.yAxisLabel = converted.unit;
        
            
            for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                var val = chartData.tempData[seriesCount][i];
                val = getConvertedVal(val, converted.unit);
                chartData.data[seriesCount][i] = parseFloat(val).toFixed(1);
            }
        }
    

        $scope.onClick= function(points, evt){
            console.log('test', points);
            console.log('activePoints', activePoints);
        }

        /*Chartjs Pie Chart*/
        function subscribeChartPie(component){
            //console.log('subscribeChartPie: ',component);
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
            //console.log('display data after subscribing chart pie: ' , $scope.displaydata);

            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query +'/'+ component.dataelement).then(function(res){
                    processSnapshotSingleSeries(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        console.log('subscribeChartPie data: ',data);
                        if($scope.displaydata[component._id]){
                            if($scope.displaydata[component._id].statement.type === 'refresh'){
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
            var type = $scope.displaydata[component._id].statement.type;
            console.log('Bar Chart Single -> ' + component.title +' == '+ type);
            if( type === 'replace'){
                processChartSingleSeriesReplaceData(component, data);
            }
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
                //console.log('refresh', chartData);
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
                val = getConvertedVal(val, converted.unit);
                chartData.data[i] = parseFloat(val).toFixed(2);
            }
        }
        /*End Chartjs Pie Chart*/
    /*END ChartJs*/

    /* Random Data Generator (took from nvd3.org) */
        function generateData(groups, points) {
            var data = [],
                shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
                random = d3.random.normal();

            for (var i = 0; i < groups; i++) {
                data.push({
                    key: 'Group ' + i,
                    values: []
                });

                for (var j = 0; j < points; j++) {
                    data[i].values.push({
                        x: j
                        , y: random()
                        , size: Math.random()
                        , shape: shapes[j % 6]
                    });
                }
            }
            return data;
        }

    /*D3*/
        //D3 Scatter
        function subscribeD3Scatter(component){
            //console.log('subscribeD3Scatter: ',component);
            component.chartOptions.chart.xAxis.axisLabel = component.labels;
            if( component.labelType == 'time' ){
                if( component.timeType == 'second')
                    component.chartOptions.chart.xAxis.tickFormat = function(d) { return d3.time.format('%M:%S')(new Date(d)); };
                else if( component.timeType == 'minute')
                    component.chartOptions.chart.xAxis.tickFormat = function(d) { return d3.time.format('%H:%M')(new Date(d)); };
                else if( component.timeType == 'hour')
                    component.chartOptions.chart.xAxis.tickFormat = function(d) { return d3.time.format('%H %p')(new Date(d)); };
                else if( component.timeType == 'day')
                    component.chartOptions.chart.xAxis.tickFormat = function(d) { return d3.time.format('%b %d')(new Date(d)); };
            }
            else
                component.chartOptions.chart.xAxis.tickFormat = function(d){return d3.format('.02f')(d);};

            component.chartOptions.chart.yAxis.tickFormat = function(d){return d3.format('.02f')(d);};
            if( component.page != '' && component.clickable == true && componet.chartType == 'Scatter'){
                var callback = function(chart) {
                    chart.scatter.dispatch.on('elementClick', function(e){
                        console.log('elementClick in callback', e);
                        var params = {'Key': component.chartUnit, 'Device': e.point.x};
                        redirectToOtherPage(params, component);
                    });
                };
                component.chartOptions.chart.callback = callback;
            }
            
            $scope.displaydata[component._id] = {
                component: component,
                labeldata:[],
                tempData:[],
                data: [],
                statement: component.statement,
                options: component.chartOptions,
                updateTime: ''
            };
            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                $scope.displaydata[component._id].data.push( {key: component.series[seriesCount], values: []} );
                $scope.displaydata[component._id].tempData.push( {key: component.series[seriesCount], values: []} );
            }
            
            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    snapshotD3Scatter(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        var statementType = $scope.displaydata[component._id].statement.type;
                        if( statementType === 'refresh'){
                            //scatterD3UpsertData(component, data.event);
                        }
                        else if( statementType === 'replace' ){
                            scatterD3ReplaceData(component, data.event);
                        }
                        $scope.$apply();
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function snapshotD3Scatter(component, data){
            var type = $scope.displaydata[component._id].statement.type;
            console.log('D3 Scatter -> ' + component.title +' == '+ type);
            if( type === 'replace'){
                scatterD3ReplaceData(component, data);
            }
            else{
                for(var index = 0; index < data.length; index++){
                    // if( type === 'refresh' )
                    //     scatterD3UpsertData(component, data[index]);
                }
            }
        }

        function scatterD3ReplaceData(component, data1){
            var chartData = $scope.displaydata[component._id];
            if(component.dataelement)
                data1 = data1.splice(0, component.dataelement);

            if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                chartData.labeldata = [];
                for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                    chartData.data[seriesCount].values = [];
                    chartData.tempData[seriesCount].values = [];
                }
            }
            for(var i = 0; i<data1.length; i++){
                var data = data1[i];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' ){
                    var xLabel = data[component.labels];
                }
                else if( component.labelType == 'value' ){
                    var xLabel = data[component.labels];
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
                    chartData.labeldata.push(label);
                    for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                        //var size = parseFloat(component.size[component.series[seriesCount]]);
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
                    chartData.data[seriesCount].values[i].y = parseFloat(val).toFixed(1);
                }
            });
            chartData.api.refresh();
        }

        //D3 multi series
        function subscribeChartMultiSeriesD3(component){
            //console.log('subscribeChartMultiSeriesD3: ',component);
            //if(typeof $scope.displaydata[component._id] === 'undefined'){
                // var options = getOption(component);
                // console.log(component, options);
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    tick:[],
                    tempData:[],
                    data: [],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
            //}
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

                var timeFormate = '%H:%M:%S';
                $scope.displaydata[component._id].options.chart.xAxis.tickFormat = function(d){ return d3.time.format(timeFormate)(new Date(d) ) };
            }
            else{
                $scope.displaydata[component._id].options.chart.xAxis.tickValues = $scope.displaydata[component._id].tick;
                $scope.displaydata[component._id].options.chart.xAxis.tickFormat = function(d){return $scope.displaydata[component._id].labeldata[d]};
                                                                                                        //scope.totalLoanAmountData[0].values[d].label;
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
            if(component.chartType == 'Line'){
                chart.options.chart.lines = {dispatch: dispatch};
            }
            else if(component.chartType == 'Bar'){
                chart.options.chart.bars = {dispatch: dispatch};
            }

            for (var seriesCount = 0; seriesCount< component.series.length; seriesCount++){
                $scope.displaydata[component._id].data.push( {key: component.series[seriesCount], values: []} );
                $scope.displaydata[component._id].tempData.push( {key: component.series[seriesCount], values: []} );
            }
            //console.log('display data after subscribing multi series D3: ' , $scope.displaydata);
            //return false;
            if( component.data != 'DBPull'){
                $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                    snapshotMultiSeriesD3(component, res.data);
                    socket.subscribe(component.query,function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        var statementType = $scope.displaydata[component._id].statement.type;
                        if( statementType === 'refresh'){
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
            console.log('D3 Chart -> ' + component.title +' == '+ type);
            if( type === 'replace'){
                multiSeriesD3ReplaceData(component, data);
            }
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
            // console.log('label', label);
            // console.log('keyindex', keyindex);
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
            console.log('multi line', chartData);
        }

        function changeValueD3Chart(component, seriesCount, converted){
            //console.log(converted);
            var chartData = $scope.displaydata[component._id];
            chartData.options.chart.yAxis.axisLabel = converted.unit;
            
            for(var i = 0; i < chartData.tempData[seriesCount].values.length; i++) {
                var val = chartData.tempData[seriesCount].values[i].y;
                val = getConvertedVal(val, converted.unit);
                chartData.data[seriesCount].values[i].y = parseFloat(val).toFixed(1);
            }
            chartData.api.refresh();
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
            if(data1.length > 0){
                for(var i = 0; i<data1.length; i++){
                    var data = data1[i];
                    //_.forEach(data1, function(data, key){
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
                    //});
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
                //console.log('test', chartData.data);
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
                        chartData.data[seriesCount].values[i].y = parseFloat(val).toFixed(2);
                    }
                });
            }
            chartData.api.refresh();
            console.log('multi line', chartData);
        }

        //D3 Pie Chart
        function subscribeD3PieChart(component){
            //console.log('subscribeD3PieChart: ',component);
            // if(typeof $scope.displaydata[component._id] === 'undefined'){
            //     var options = getOption(component);
                $scope.displaydata[component._id] = {
                    component: component,
                    labeldata:[],
                    tempData:[],
                    data: [],
                    dataIndex:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
            //}
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
            if(component.chartType == 'Pie'){
                chart.options.chart.pie = {dispatch: dispatch};
            }
            else if(component.chartType == 'Bar'){
                //console.log('dispatch tttttttttt ====== ', dispatch);
                chart.options.chart.bars = {dispatch: dispatch};
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
                        if( statementType === 'refresh'){
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
            console.log('Pie D3 Chart -> ' + component.title +' == '+ type);
            if( type === 'replace'){
                pieD3ReplaceData(component, data);
            }
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
                val = getConvertedVal(val, converted.unit);
                chartData.data[i].value =  parseFloat(val).toFixed(1);
            }
        }
    /*End D3*/

    /*Table*/
        //Complex Table
            function subscribeComplexTable(component){
                $scope.displaydata[component._id] = {
                    component:component,
                    indicatorData: [],
                    label:component.labels,
                    columns:[],
                    tempData:[],
                    data:[],
                    statement: component.statement,
                    updateTime:''
                };
                
                if( component.data != 'DBPull'){
                    $http.get(globalConfig.snapshoturl+component.query +'/1').then(function(res){
                        complexTableSnapshotData(component,res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( $scope.displaydata[component._id].statement.type === 'replace' ){
                                complexTableReplaceData(component, data.event);
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

            function complexTableSnapshotData(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('complex table -> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    complexTableReplaceData(component, data);
                }
            }

            function complexTableReplaceData(component, data){
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
                    var label = [];
                    var tmpLen = null;
                    var tmpkey = null;
                    angular.forEach(data, function(value, key){
                        if( value[component.column].length > tmpLen){
                            tmpLen = value[component.column].length;
                            tmpkey = key;
                        }
                    });
                    angular.forEach(data[tmpkey][component.column], function(value, key){
                        label.push(value[component.labels]);
                    });
                    table.labeldata = label;
                    var heading = [];
                    var tmpArr = [];
                    _.forEach(data, function(val, key){
                        heading.push({title: val[component.heading]});
                        var tmp = {};
                        for(var i=0; i<label.length; i++){
                            var test = _.filter(val[component.column], function(item){
                                return item[component.labels].trim() == label[i].trim();
                            });
                            if(test.length > 0){
                                if(component.unit){
                                    if(component.unit == 'percent')
                                        tmp[label[i]] = {value: test[0]['traffic']+' '+converted.unit};
                                    else{
                                        var converted = countTableValue( test[0]['traffic'], component.unit);
                                        var tmpVal = parseFloat(converted.value).toFixed(2)+' '+converted.unit;
                                        tmp[label[i]] = {value: tmpVal};
                                    }
                                }
                                else
                                    tmp[label[i]] = {value: test[0]['traffic']};
                            }
                            else{
                                tmp[label[i]] = {value: '-'};
                            }
                        }
                        tmpArr.push(tmp);
                    });
                    table.heading = heading;
                    table.data = tmpArr;
                }
                $scope.displaydata[component._id] = table;
                console.log(table);
            }

        //table
            function subscribeTable(component){
                //console.log('subscribeTable: ',component);
                //if(typeof $scope.displaydata[component._id] === 'undefined'){
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
                        label:component.labels,
                        columns:[],
                        tempData:[],
                        data:[],
                        dataIndex:[],
                        statement: component.statement,
                        options: options,
                        pieOption: {fill: ["#1ab394", "#d7d7d7"]},
                        updateTime:''
                    };
                //}
                angular.forEach(component.columns, function(value, key){
                    //var tmpobj = {field: value.name, title:value.name, show:true, indicator:value.indicator};
                    var tmpobj = {field: value.name, title:value.name, show:true};

                    if(angular.isDefined(value.updownreference)){
                        tmpobj.updownreference = value.updownreference;
                    }
                    $scope.displaydata[component._id].columns.push(tmpobj);
                });
                //console.log('display data after subscribing table: ' , $scope.displaydata);

                if( component.data != 'DBPull'){
                    $http.get(globalConfig.snapshoturl+component.query +'/1').then(function(res){
                        processTableSnapshotData(component,res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            //console.log('subscribe Table data: ',data.event);
                            if( $scope.displaydata[component._id].statement.type === 'refresh' ){
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
                var type = $scope.displaydata[component._id].statement.type;
                console.log('table -> ' + component.title +' == '+ type);
                var test = [];
                if( type === 'replace'){
                    processTableReplaceData(component, data);
                }
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
                    //tableData.data[keyindex] = dataobj;
                    tableData.tempData[keyindex] = dataobj;
                }
                else{
                    tableData.dataIndex.push( data[component.labels] );
                    //tableData.data.push(dataobj);
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
                if(keyindex > -1){
                    //tableData.data[keyindex] = dataobj;
                    tableData.tempData[keyindex] = dataobj;
                }
                else{
                    tableData.dataIndex.push( data[component.labels] );
                    //tableData.data.push(dataobj);
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
                //console.log('update keyindex', keyindex);
                if(keyindex > -1){
                    console.log('key', tableData.data[keyindex]);
                    _.forEach(component.columns, function(val, key){
                        if( dataobj[val.name]['value'] ){
                            console.log(val);
                            var oldValue = tableData.tempData[keyindex][val.name]['value'];
                            console.log('oldValue', oldValue);
                            var newValue = dataobj[val.name]['value'];
                            console.log('newValue', newValue);
                            //tableData.data[keyindex][val.name]['value'] = parseFloat(oldValue) + parseFloat(newValue);
                            tableData.tempData[keyindex][val.name]['value'] = parseFloat(oldValue) + parseFloat(newValue);
                            console.log(tableData.data[keyindex][val.name]['value']);
                        }
                    });
                }
                else{
                    tableData.dataIndex.push( data[component.labels] );
                    //tableData.data.push(dataobj);
                    tableData.tempData.push(dataobj);
                    tableData.updateTime = new Date();
                }
                tableSpliceRow(component);
                console.log(component.name + ' === update');
            }

            function processTableReplaceData(component, data1){
                //var tableData = $scope.displaydata[component._id];
               var tableData = {
                    component:component,
                    indicatorData: [],
                    label:component.labels,
                    columns:[],
                    tempData:[],
                    data:[],
                    dataIndex:[],
                    updateTime:''
                };
                if(data1.length > 0){
                    $scope.tblDataTimestemp = data1[0]['Time'];
                    var data = data1;
                    for(var i = 0; i<data.length; i++){
                        var dataobj={};
                        angular.forEach(component.columns, function(val, key){
                            var tmpdata = {};
                            tmpdata.value = (data[i][val.name]) ? data[i][val.name] : 0;
                            dataobj[val.name] = tmpdata;
                        });
                        dataobj[component.labels] = {value: data[i][component.labels]};
                        
                        //Check if key is exits in table
                        var keyindex = $.inArray( data[i][component.labels], tableData.dataIndex );
                        //console.log('replace keyindex', keyindex);
                        if(keyindex > -1){
                            //tableData.data[keyindex] = dataobj;
                            tableData.tempData[keyindex] = dataobj;
                        }
                        else{
                            tableData.dataIndex.push( data[i][component.labels] );
                            //tableData.data.push(dataobj);
                            tableData.tempData.push(dataobj);
                        }
                    }
                    tblIndicatorData(tableData, component);
                }
            }

            function tblIndicatorData(tableData, component){
                //var tableData = $scope.displaydata[component._id];

                if(angular.isDefined(component.indicator) && component.indicator.length > 0){
                    console.log('time', $scope.tblDataTimestemp);
                    var dataMinofDay = timemsToMinofDay($scope.tblDataTimestemp);
                    var todayDate = $filter('date')( $scope.tblDataTimestemp,'MM-dd-yyyy' );

                    $http.get(globalConfig.snapshoturl +'getmoduleindicatordata/'+ component.indicatorQuery +'/'+ todayDate +'/'+ dataMinofDay).then(function(res){
                        var indicatorData = res.data;
                        if( indicatorData != 'null' && indicatorData != ''){
                            tableData.indicatorData = indicatorData.data;
                            tableSpliceRow(tableData, component);
                        }
                        else{
                            $http.get(globalConfig.pullfilterdataurl + component.indicatorQuery).then(function(response){
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
                                console.log('flag', flag);
                                if(flag){
                                    var tmpdata = {};
                                    tmpdata[todayDate] = temp;
                                    var req = {'id': component.indicatorQuery, 'data': tmpdata};
                                    $http.post(globalConfig.snapshoturl +'setmoduleindicatordata', req).then(function(res){
                                        //console.log(res);
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

                var tableTmp = tableData.tempData;
                var tableSort = angular.copy(tableTmp);
                var labelArr = [];
                angular.forEach(tableSort, function(val, key){
                    labelArr.push(val[component.labels].value);

                    _.forEach(component.columns, function(v, k){

                        if(angular.isDefined(component.indicator) && component.indicator.length > 0 && component.indicator.indexOf(v.name) > -1 ){
                            for (var i = 0; i< component.indicator.length; i++ ){
                                var indicator =  component.indicator[i];
                                
                                var tmpArr = [];
                                var tmpArr = _.filter(tableData.indicatorData, function(res){
                                    return val[component.labels].value == res[component.labels];
                                });
                                //console.log('tmpArr', tmpArr);
                                if( tmpArr.length > 0){
                                    var newValue = val[v.name].value;
                                    var oldValue = tmpArr[0][indicator];
                                    //console.log('old ', oldValue);
                                    //console.log('new ', newValue);
                                    var danger = (component.danger) ? component.danger[indicator] : null;
                                    var indicatorClass = setIndicatorTable(oldValue, newValue, danger);
                                    //console.log(test);
                                    val[v.name]['indicator'] = indicatorClass.indicator;
                                    val[v.name]['spanclass'] = indicatorClass.spanclass;
                                }
                                else{
                                    val[v.name]['indicator'] = '';
                                    val[v.name]['spanclass'] = '';
                                }
                            }
                        }
                        //console.log(component);
                        if(angular.isDefined(component.unit) && component.unit[v.name] && component.unit[v.name] != 'percent'){
                            if(component.threshold)
                                val[component.labels].pieData = pietyChartVal(component.threshold, component.subUnit, val[v.name].value);

                            var converted = countTableValue( val[v.name].value, component.unit[v.name] );
                            
                            if(converted.value % 1 === 0){
                                // int
                            } else{
                                converted.value = parseFloat(converted.value).toFixed(component.dataDecimal[v.name]);
                            }
                            val[v.name].value = converted.value +' '+ converted.unit;
                        }
                        else if(angular.isDefined(component.unit) && component.unit[v.name] == 'percent'){
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
                    tableData.data = tableData.data.splice(0, parseInt(component.dataelement) );
                    tableData.dataIndex = tableData.dataIndex.splice(0, parseInt(component.dataelement) );    
                }
                else{
                    tableData.data = tableData.data;
                    tableData.dataIndex = tableData.dataIndex;
                }

                $scope.displaydata[component._id].data.length = 0;
                $timeout(function(){
                    $scope.displaydata[component._id].data = tableData.data;
                }, 1);

                $scope.displaydata[component._id].updateTime = new Date();
                console.log('table end callback: ',$scope.displaydata[component._id]);
            }

            function pietyChartVal(threshold, unit, value){
                var val = null;
                if(unit == 'KB' || unit == 'Kbps')
                    val = (value / Math.pow(2, 10));
                else if(unit == 'MB' || unit == 'Mbps')
                    val = (value / Math.pow(2, 20));
                else if(unit == 'GB' || unit == 'Gbps')
                    val = (value / Math.pow(2, 30));

                return([val, parseInt(threshold)]);
            }

            function setIndicatorTable(oldValue, newValue, danger){
                var percent = '0%';
                var indicator = 'fa fa-bolt';
                var spanclass = 'text-success';
                var substr =  newValue - oldValue;

                console.log('tbl', substr);
                console.log('newValue', newValue);

                console.log('oldValue', oldValue);

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
                                if(datatb > 1024){
                                    var datapb = ( datatb/1024 ).toFixed(1);
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
            //console.log('component', component);
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {component:component, kpi:'', kpiIndicator:'', kpiindicatordatahistory:[], spanclass:'', updateTime: ''};
            }
            if(component.indicatortype == 'bolt'){
                $scope.displaydata[component._id].spanclass='fa fa-bolt';
            }
            //console.log('display data after subscribing subscribeIBox: ' , $scope.displaydata);
            
            if( component.data != 'DBPull' ){
                $http.get(globalConfig.snapshoturl + component.query + '/1').then(function(res){
                    processIBoxSnapshotData(component,res.data);
                    socket.subscribe(component.query, function(res){
                        var ibox = component;
                        //console.log('subscribeIBox response: ',res);
                        var tmp = JSON.parse(res);
                        var data = tmp[ibox.query];
                        console.log('subscribeIBox data: ',data.event);
                        if( $scope.displaydata[component._id].component.statement.type == 'replace')
                            processIBoxData(ibox, data.event[0]);
                        else
                            processIBoxData(ibox, data.event);

                        $rootScope.$apply();
                    });
                });
            }
            else{
                setTimeInterval(component);
            }

            if( component.data2 ){
                //console.log(component.data2);
                if( component.data2 != 'DBPull' ){
                    $http.get(globalConfig.snapshoturl + component.query2 + '/1').then(function(res){
                        //console.log('snapshoturl response 2 :', res.data, component);
                        for(var index = 0; index < res.data.length; index++){
                            if( res.data[index][component.kpi2] ){
                                var newValue2 = countIBoxUnit( component, res.data[index][component.kpi2] );
                                //console.log('newValue2', newValue2);
                                $scope.displaydata[component._id].kpi2 = newValue2.value.toFixed(component.dataDecimal2);
                                $scope.displaydata[component._id].unit2 = newValue2.unit;
                                $scope.displaydata[component._id].updateTime2 = new Date();
                            }
                        }

                        socket.subscribe(component.query2, function(res){
                            var ibox = component;
                            var tmp = JSON.parse(res);
                            var data = tmp[ibox.query2];
                            //console.log('subscribeIBox data2: ',data.event);
                            if($scope.displaydata[component._id]){
                                //console.log('data 2 ', data.event[component.kpi2]);
                                if( data.event[component.kpi2] ){
                                    var newValue = countIBoxUnit( component, data.event[component.kpi2] );
                                    //console.log('newValue', newValue);
                                    $scope.displaydata[component._id].kpi2 = newValue.value.toFixed(component.dataDecimal2);
                                    $scope.displaydata[component._id].unit2 = newValue.unit;
                                    $scope.displaydata[component._id].updateTime2 = new Date();
                                    $scope.$apply();
                                }
                            }
                            //console.log($scope.displaydata[component._id]);
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
            var iboxData = $scope.displaydata[component._id];
            if(component.unit == 'percent'){
                //console.log(data[component.kpi]);
                iboxData.kpi = (data[component.kpi]).toFixed(component.dataDecimal);
                iboxData.unit = '%';
            }
            else{
                var newValue = countIBoxUnit( component, data[component.kpi] );
                iboxData.kpi = newValue.value.toFixed(component.dataDecimal);
                iboxData.unit = newValue.unit;
            }
            iboxData.updateTime = new Date();

            if(component.indicator){
                getAndSetIndicatorIboxData(component, data, component.kpi);
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
                    else if(newValue > 1024*1024*1024 && newValue < 1024*1024*1024*1024){
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
            //console.log(component);
            $scope.displaydata[component._id] = {'description': null};
            if(component.textType == 'dynamic'){
                $http.get(globalConfig.pulldataurl + component.query).then(function(res){
                    //console.log(res.data);
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
                    data:'',
                    width: (component.width == 3) ? 100 : 200,
                    options:{max: component.max, min:0, fgColor: null, step : 0.1, fontWeight: 'normal'},
                    updateTime: ''
                };
            }
            if( component.data != 'DBPull' ){
                $http.get(globalConfig.snapshoturl + component.query + '/1').then(function(res){
                    gaugeSnapshotData(component, res.data);
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        processGauge(component, data.event);
                        $scope.$apply();
                    });
                });
            }
            else{
                setTimeInterval(component);
            }
        }

        function gaugeSnapshotData(component, data){
            if(data === 'error'){
                console.log(data);
                return false;
            }
            
            for(var index = 0; index < data.length; index++){
                processGauge(component, data[index]);
            }
        }

        function processGauge(component, data){
            var gauge = $scope.displaydata[component._id];
            var newValue = countGaugeUnit(component, data[component.kpi]);
            //console.log('newValue', newValue);
            if( component.unit == 'speed' ){
                if( component.unit2 == newValue.unit ){
                    if(newValue.value <= component.max){
                        gauge.data = newValue.value.toFixed(component.dataDecimal);
                        gauge.unit = newValue.unit;
                    }
                }
                else if( component.unit2 == 'Mbps' && newValue.unit == 'Kbps' ){
                    gauge.data = newValue.value.toFixed(component.dataDecimal);
                    gauge.unit = newValue.unit;
                }
                else if( component.unit2 == 'Gbps' ){
                    gauge.data = newValue.value.toFixed(component.dataDecimal);
                    gauge.unit = newValue.unit;
                }
            }
            else if( component.unit == 'usage' ){
                if( component.unit2 == 'KB' ){
                    gauge.data = (data[component.kpi] / Math.pow(2, 10)).toFixed(parseInt(component.dataDecimal));
                    gauge.unit = 'KB';
                }
                else if( component.unit2 == 'MB' ){
                    gauge.data = (data[component.kpi] / Math.pow(2, 20)).toFixed(parseInt(component.dataDecimal));
                    gauge.unit = 'MB';
                }
                else if( component.unit2 == 'GB' ){
                    gauge.data = (data[component.kpi] / Math.pow(2, 30)).toFixed(parseInt(component.dataDecimal));
                    gauge.unit = 'GB';
                }
                if( gauge.data < component.max )
                    gauge.options.fgColor = component.color;
                else
                    gauge.options.fgColor = component.thresholdcolor;

                console.log(gauge);
            }
            else{
                gauge.data = newValue.value.toFixed(component.dataDecimal);
                gauge.unit = newValue.unit;
            }

            gauge.updateTime = new Date();
            if(!$scope.$$phase) {
                $scope.$apply();
            }
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
                //console.log('subscribe Flot Pie Chart: ',component);
                // if(typeof $scope.displaydata[component._id] === 'undefined'){
                //     var options = getOption(component);
                    
                    $scope.displaydata[component._id] = {
                        component: component,
                        labeldata:[],
                        dataset:[],
                        tempData:[],
                        statement: component.statement,
                        options: component.chartOptions,
                        updateTime: ''
                    };
                //}

                //$scope.displaydata[component._id].options.series.pie.color = globalConfig.colorpaletteFlotChart;
                //$scope.displaydata[component._id].options.tooltipOpts.content = function(label,p){return label+" | "+p +' %';};
                //console.log('display data after subscribing chart: ' , $scope.displaydata);
                //return false;
                if( component.data != 'DBPull'){
                    $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                        snapshotPieFlot(component, res.data);
                        socket.subscribe(component.query, function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            console.log('subscribe flot Chart data: ',data);
                            if($scope.displaydata[component._id]){
                                if($scope.displaydata[component._id].statement.type === 'refresh'){
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
                        //console.log('event', event);
                        redirectToOtherPage(params, component);
                    });
                }, 1000);
            }

            function snapshotPieFlot(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('flot pie-> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    pieFlotReplaceData(component, data);
                }
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
                    //console.log('removed');
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
                    if( keyindex > -1 ){
                        var converted = countChartValue( component, data[component.series] );
                        chartData.dataset[keyindex].data = converted.value;
                        chartData.tempData[keyindex] = data[component.series];
                    }
                    else{
                        pushDataFlotPieChart(component, data, label);
                    }

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
                //console.log('subscribe Flot Bar Chart: ',component);
                // if(typeof $scope.displaydata[component._id] === 'undefined'){
                //     var options = getOption(component);
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
                //}

                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                    $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
                }
                //console.log('display data after subscribing chart: ' , $scope.displaydata);
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
                var type = $scope.displaydata[component._id].statement.type;
                console.log('flot bar-> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    barFlotReplaceData(component, data);
                }
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
                        var converted = countChartValue( component, data[component.series[seriesCount]] );
                        chartData.dataset[seriesCount].data[keyindex][1] = converted.value;
                        chartData.tempData[seriesCount].data[keyindex][1] = data[component.series[seriesCount]];
                        
                        changeBarFlotValueMoving(component, converted);
                    }
                }
                else{
                    pushDataBarFlowChartMoving(component, data, label);
                }

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

                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                        var val = chartData.tempData[seriesCount].data[i][1];
                        val = getConvertedVal(val, converted.unit);
                        chartData.dataset[seriesCount].data[i][1] = parseFloat(val).toFixed(2);
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
                        val = getConvertedVal(val, converted.unit);
                        chartData.dataset[seriesCount].data[i][1] = parseFloat(val).toFixed(2);
                    }
                }
            }

        //For Line chart
            function subscribeFlotChart(component){
                //console.log('subscribe Flot Chart: ',component);
                // if(typeof $scope.displaydata[component._id] === 'undefined'){
                //     var options = getOption(component);

                    $scope.displaydata[component._id] = {
                        component: component,
                        labeldata: [],
                        dataset:[],
                        tempData:[],
                        temp:[],
                        dataIndex:[],
                        statement: component.statement,
                        options: component.chartOptions,
                        updateTime: ''
                    };
                //}

                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                    $scope.displaydata[component._id].tempData.push( {'label': component.series[seriesCount], data:[]} );
                }
                //console.log('display data after subscribing chart: ' , $scope.displaydata);
               
                if( component.data != 'DBPull'){
                    $http.get(globalConfig.snapshoturl + component.query + '/' + component.dataelement).then(function(res){
                        console.log(res);
                        processSnapshotMultiSeriesFlot(component, res.data);
                        socket.subscribe(component.query, function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            //console.log('subscribe flot Chart data: ',data);
                            if($scope.displaydata[component._id]){
                                if($scope.displaydata[component._id].statement.type === 'refresh'){
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
                var type = $scope.displaydata[component._id].statement.type;
                console.log('flot -> ' + component.title +' == '+ type);
                if( type === 'replace'){
                    processFlotChartMultiSeriesReplaceData(component, data);
                }
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
                //console.log(data1.length, chartData);
                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.temp = [];
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        chartData.dataset[seriesCount].data = [];
                        chartData.tempData[seriesCount].data = [];
                    }
                }
                console.log(chartData.tempData);
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
                    else{
                        pushDataForFlowChart(component, data, label);
                    }
                });
            
                if(component.series.length > 1){
                    //$timeout(function(){
                        var maxVal = Math.max.apply(null, chartData.temp);
                        //console.log(maxVal);
                        var converted = countChartValue( component, maxVal );
                        //console.log(converted);
                        changeMultiValueFlowChart( component, converted );

                        //console.log( component.dataelement);
                        if(chartData.labeldata.length > component.dataelement){
                            chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                            chartData.temp = chartData.temp.splice(0, component.dataelement);
                            console.log(component.series);
                            for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                                chartData.dataset[seriesCount].data = chartData.dataset[seriesCount].data.splice(0, component.dataelement);
                                chartData.tempData[seriesCount].data = chartData.tempData[seriesCount].data.splice(0, component.dataelement);
                            }
                        }
                    //}, 100);
                }
                chnageTickLen(component, chartData.labeldata.length);
                //console.log(chartData.labeldata.length, component.title);
                chartData.updateTime = new Date();
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
                            //console.log('converted Value', converted.value);
                            chartData.dataset[seriesCount].data[keyindex] = ( [ label, converted.value ] );
                            chartData.tempData[seriesCount].data[keyindex] = ( [ label, data[component.series[seriesCount]] ] );
                            
                            changeValueFlowChart( component, seriesCount, converted );
                        }
                    }
                }
                else{
                    pushDataForFlowChart(component, data, label);
                }

                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata.shift();
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.dataset[seriesCount].data.shift();
                        chartData.tempData[seriesCount].data.shift();
                    }
                }
                chartData.updateTime = new Date();
                //console.log(chartData);
                //chnageTickLen(component, chartData.labeldata.length);
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

                            var converted = countChartValue( component, oldValue + newValue );
                            
                            chartData.tempData[seriesCount].data[keyindex] = ( [ label, oldValue + newValue ] );
                            
                            //change value to KB/MB/GB
                            changeValueFlowChart( component, seriesCount, converted );
                        }
                    }
                }
                else{
                    pushDataForFlowChart(component, data, label);
                }
                //console.log('update chartData', chartData);
                chartData.updateTime = new Date();
                chnageTickLen(component, chartData.labeldata.length);
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
                        }
                    }
                }
                else{
                    pushDataForFlowChart(component, data, label);
                }
                if(chartData.labeldata.length > component.dataelement){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.temp = chartData.temp.splice(0, component.dataelement);
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.dataset[seriesCount].data = chartData.dataset[seriesCount].data.splice(0, component.dataelement);
                        chartData.dataset[seriesCount].tempData = chartData.dataset[seriesCount].tempData.splice(0, component.dataelement);
                    }
                }
                chartData.updateTime = new Date();
                chnageTickLen(component, chartData.labeldata.length);
            }

            function chnageTickLen(component, dataLen){
                var chartData = $scope.displaydata[component._id];
                if(angular.isDefined(component.timeType) && component.timeType != 'second' ){
                    var tick;
                    if(component.timeType == 'hour'){
                        if(dataLen > 0 && dataLen <= 12)
                            tick = [1, 'hour'];
                        else if(dataLen > 12 && dataLen <= 24)
                            tick = [3, 'hour'];
                        else if(dataLen > 24 && dataLen <= 48)
                            tick = [6, 'hour'];
                        else if(dataLen > 48 && dataLen <= 96)
                            tick = [12, 'hour'];
                        else if(dataLen > 96 && dataLen <= 672)
                            tick = [1, 'day'];
                        else if(dataLen > 672 && dataLen <= 2880)
                            tick = [3, 'day'];
                        else if(dataLen > 2880 && dataLen <= 5760)
                            tick = [6, 'day'];
                    }
                    else if(component.timeType == 'minute'){
                        if(dataLen > 0 && dataLen <= 12)
                            tick = [1, 'minute'];
                        else if(dataLen > 12 && dataLen <= 24)
                            tick = [3, 'minute'];
                        else if(dataLen > 24 && dataLen <= 48)
                            tick = [6, 'minute'];
                        else if(dataLen > 48 && dataLen <= 96)
                            tick = [12, 'minute'];
                        else if(dataLen > 96 && dataLen <= 672)
                            tick = [1, 'hour'];
                        else if(dataLen > 672 && dataLen <= 2880)
                            tick = [3, 'hour'];
                        else if(dataLen > 2880 && dataLen <= 5760)
                            tick = [6, 'hour'];
                    }
                    else if(component.timeType == 'day'){
                        if(dataLen > 0 && dataLen <= 12)
                            tick = [1, 'day'];
                        else if(dataLen > 12 && dataLen <= 24)
                            tick = [3, 'day'];
                        else if(dataLen > 24 && dataLen <= 48)
                            tick = [6, 'day'];
                        else if(dataLen > 48 && dataLen <= 96)
                            tick = [12, 'day'];
                        else if(dataLen > 96 && dataLen <= 672)
                            tick = [1, 'month'];
                        else if(dataLen > 672 && dataLen <= 2880)
                            tick = [3, 'month'];
                        else if(dataLen > 2880 && dataLen <= 5760)
                            tick = [6, 'month'];
                    }
                    //console.log(tick);
                    if(tick.length > 0)
                        chartData.options.xaxis.tickSize = tick;
                }
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
                                    if(datatb > 1024){
                                        var datapb = ( datatb/1024 ).toFixed(1);
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
                for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                    var val = chartData.tempData[seriesCount].data[i][1];
                    val = getConvertedVal(val, converted.unit);
                    chartData.dataset[seriesCount].data[i][1] = Number( parseFloat(val).toFixed(3) );
                }
                //console.log(chartData);
            }

            function changeMultiValueFlowChart( component, converted ){
                console.log(converted);
                var chartData = $scope.displaydata[component._id];
                chartData.options.yaxis.axisLabel = converted.unit;

                //if(converted.unit == "KB" || converted.unit == "MB" || converted.unit == "GB" || converted.unit == "TB" ){
                    _.forEach(component.series, function(value, seriesCount){
                        for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                            var val = chartData.tempData[seriesCount].data[i][1];
                            val = getConvertedVal(val, converted.unit);
                            chartData.dataset[seriesCount].data[i][1] = parseFloat(val).toFixed(1);
                        }
                    });
                //}
            }
    /*End Flot Chart*/

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
            $http.get(globalConfig.dataapiurl +'/'+ table + '/' + id).then(function(res){
                console.log(res.data);
                var res = res.data;
                //return false;                                                                                                            return false;
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
        console.log('time', data.Time);
        var dataMinofDay = timemsToMinofDay(data.Time);
        var todayDate = $filter('date')( data.Time,'MM-dd-yyyy' );
        //console.log(dataMinofDay);

        $http.get(globalConfig.snapshoturl +'getmoduleindicatordata/'+ component.indicatorQuery +'/'+ todayDate +'/'+ dataMinofDay).then(function(res){
            var indicatorData = res.data;
            if(indicatorData != 'null' && angular.isDefined(indicatorData[kpi]) ){
                var oldValue = indicatorData[kpi];
                setIndicatorIbox(component, oldValue, data[kpi]);
            }
            else{
                $http.get(globalConfig.pullfilterdataurl + component.indicatorQuery).then(function(response){
                    var temp = [];
                    temp[0] = '';
                    var flag = false;
                    var oldValue;
                    for(var i = 0; i<response.data.length; i++ ){
                        var value = response.data[i];
                        var tmpKey = timemsToMinofDay(value.timems);
                        temp[tmpKey] = value;

                        if(dataMinofDay == tmpKey){
                            console.log('match == ',value[kpi])
                            if(kpi){
                                oldValue = value[kpi];
                                flag = true;
                            }
                        }
                    }
                    console.log('flag', flag);
                    if(flag){
                        var indicatorData = temp;
                        var tmpdata = {};
                        tmpdata[todayDate] = indicatorData;
                        var req = {'id': component.indicatorQuery, 'data': tmpdata};
                        $http.post(globalConfig.snapshoturl +'setmoduleindicatordata', req).then(function(res){
                            //console.log(res);
                        });
                    }
                    setIndicatorIbox(component, oldValue, data[kpi]);
                });
            }
        });
    }

    function timemsToMinofDay(timems){
        var temp = $filter('date')( timems,'H' );
        var mm = $filter('date')( timems,'mm' );
        return( parseInt(temp*60) + parseInt(mm) );
    }

    function getOption(options){
        /*var options = _.filter($scope.chartOptionsList, function (item) {
            return item._id == component.options;
        });*/
        var test = options;
        var test1 = test.replace(/(\r\n|\n|\r)/gm,"");
        var test2 = test1.replace(/\s+/g," ");
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

        /*if(val % 1 === 0){
            // int
        } else{
            val = (val) ? parseFloat(val).toFixed(1) : '';
        }*/
        return val;
    }

    function setIndicatorIbox(component, oldValue, newValue){
        var iboxData = $scope.displaydata[component._id];
        var percent;
        var substr =  newValue - oldValue;
        var oldValue = (oldValue) ? oldValue : 1;
        console.log('newValue', newValue);

        console.log('oldValue', oldValue);
        console.log('substr', substr);
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
            percent = Math.abs( ((substr/oldValue) * 100).toFixed(2) ) + '%';
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

        console.log(iboxData);
    }
    
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
        //pullfilterdataurl
        //pulldataurl
        //+ '&fromDate=2016-03-07T00:00:00.000Z&toDate=2016-04-06T23:59:59.999Z'

        var to= $filter('date')( new Date().getTime() , "yyyy-MM-dd");

        var from = $scope.date.start+'T00:00:00.000Z';
        var to = $scope.date.end+'T23:59:59.999Z';
        //&plan=Diamond
        $http.get(globalConfig.pullfilterdataurl + component.query + '&fromDate='+ from +'&toDate='+to).then(function(res){
            if( angular.isDefined(res.data) && res.data.length > 0){
                processReplaceData(component, res);
            }
        });
    }

    $scope.dtOptions = {
        paging : true,
        searching : false,
        bLengthChange : true,
        bSort : false,
        bInfo : false,
        bAutoWidth : false
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
    //aa1138f3447ab9ab639515df4
    $scope.loadLocation = function(){
        //var children = globalData.filterLocation[0].children;
        //console.log('location', children);
        /*$("#location").dynatree({
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
        });*/
        $http.get(globalConfig.pulldataurl + 'add6a3de542d6b4ba2a912059').then(function (response) {
            //console.log('testr',response.data[0].children);
            if(response.data.length > 0)
            var children = response.data[0].children;
            //console.log('children', children);
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
            
        });
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
                                keyArrayResult.push(getParents(node)+nodeKey);
                        }else{
                            keyArrayParent.push(nodeKey);
                        }
                    }else{
                        if(!chkEntry(keyArrayParent,parentKey)){
                            if(getParents(node) == '_1')
                                keyArrayResult.push(nodeKey);
                            else
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
        var children = globalData.filterDevice[0].children;
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

    $scope.planSelected = '';
    $scope.plan = [];
    $scope.loadPlan = function(){
        $http.get(globalConfig.pulldataurl + 'aa7429dcf46308bcd148c90d6').then(function (response) {
            var children = response.data;
            //console.log('children', children);
            $scope.plan = children;
            if(children.length >0 )
            $scope.planSelected = children[0]['Plan'];
        });
    }
    $scope.loadPlan();

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

    $scope.rat = function() {
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

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
            $scope.planTree = false;
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
            $scope.planTree = false;
        }
    }

    $scope.plan = function() {
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

    $scope.search = function(date){
        $scope.locationTree = false;
        $scope.ratTree = false;
        $scope.segmentTree = false;
        $scope.deviceTree = false;
        $scope.planTree = false;

        
        //console.log('locationSelected', $scope.locationSelected);
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

        //if($scope.report.filter.indexOf('date')> -1){
            var from = date.start+'T00:00:00.000Z';
            var to = date.end+'T23:59:59.999Z';

            parameter += '&fromDate='+ from +'&toDate='+to;
        //}

        //&rat=[\'GERAN\',\'UTRAN\']
        //&segment=[\'Gold\',\'Platinum\',\'Youth\',\'VIP\',\'Others\']
        console.log(parameter);
        //return false;
        var componentArr = $scope.displaydata;
        _.forEach(componentArr, function(value, key){
            var component = value.component;
            $http.get(globalConfig.pullfilterdataurl + component.query + parameter).then(function(res){
                processReplaceData(component, res);
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

    function processReplaceData(component, res){
        if( component.type == 'simple_ibox' )
            processIBoxData(component, res.data[0]);
        else if( component.type == 'simple_table' || component.type == 'table_with_search' )
            processTableReplaceData(component, res.data);
        else if( component.type == 'complex_table' )
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
    $scope.detail = function (item) {
        globalConfig.module = item;
        $scope.module = item;
        var modalInstance = $modal.open({
            templateUrl: 'views/moduleDetail.html',
            size: 'lg',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    };

});