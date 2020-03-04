'use strict';

angular.module('specta')
    .controller('StagingViewCtrl', function ($scope, 
        $rootScope,
        $location,
        $state, 
        $interval,
        filterService,
        $timeout,
        $sce,
        $stateParams, 
        $filter, 
        $uibModal, 
        NgMap, 
        globalData, 
        globalConfig, 
        ChartService, 
        SweetAlert, 
        UserProfile, 
        socket, 
        NgTableParams, 
        httpService, 
        dbService, 
        highchartProcessData, 
        currentUser, 
        utility, 
        dataFormatter)
        {

    //track url starts
    utility.trackUrl();
    //end track url

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
    $scope.fromUsage='0';
    $scope.toUsage ;
    $scope.unit = 'Bytes';
    var pageName = null;

    $scope.parameter = " ";
    $scope.paramsArray= [];

    $scope.toggleFilter = function(){
        angular.element('#tglFilter').toggle();
    }

    // console.log('$stateParams', $stateParams);
    if($stateParams.params){
        if($stateParams.paramsArray && $stateParams.paramsArray.length>0){
            $scope.params = $stateParams.paramsArray[$stateParams.paramsArray.length-1];
        }
        else{
            $scope.params = {};
        }
    }
    //console.log(" before redirection click", $stateParams);
    $scope.backPage = function(){
        var url="";
        $stateParams.params.fromDate = null
        $stateParams.params.toDate = null
        //console.log("redirection", $stateParams);
        
        if($stateParams.paramsArray[$stateParams.paramsArray.length-1].returnPath )
            url = $stateParams.paramsArray[$stateParams.paramsArray.length-1].returnPath.split('/');

        //console.log("redirection url", url);                        
        $stateParams.paramsArray.pop();
        
        if(url[2] == 'dashboards')
        console.log("data api url callling ")
        $state.go('index.dashboards', {id: url[3], params: $stateParams.params, filterParams: null, 'paramsArray':$stateParams.paramsArray, name: null});
        if(url[2] == 'reports')
            $state.go('index.reports', {id: url[3], params: $stateParams.params, filterParams: null, 'paramsArray':$scope.paramsArray, name: null});
        if(url[2] == 'analytics')
            $state.go('index.analytics', {id: url[3], params: $stateParams.params, filterParams: null, 'paramsArray':$scope.paramsArray, name: null});
            //$state.go('index.analytics', {id: url[3], params: $stateParams.params, filterParams: null, 'paramsArray':$scope.paramsArray, name: null});
    }

    $scope.col_extended_table_Opt= {
        "destroy": true,
        "aaSorting": [],
        "paging": true, 
        "searching": false,
        "bSort": true,
        "bLengthChange": false,
        "bInfo": false,
        "autoWidth": true,
        
    }

    $scope.exportModule = function(component, type){
        // console.log(component);
        //$('#{{component.component._id}}').tableExport({type:'pdf',escape:'false',tableName:'Handset wise Traffic'});
        $('#'+component._id).tableExport({type: type, pdfFontSize:'10', escape:'false', tableName: component.title}, function(res){
            //console.log('cb', res)
            var blob = new Blob([res], {type: 'image/png'});
            var file = new File([blob], 'imageFileName.png');
            console.log(file)
        });
    }
    
    $scope.exportChartToExcel = function(component, type){
        console.log(component);
        utility.getSimpleJSONExport(component.origionalData, type, component.component.title);
        /*if(component.component.ySeries){
            utility.getNestedJSONExport(component.tempData, type, component.component.title);
            return;
        }
        var tableArr = [];
        var label = component.component.labels;
        var series = component.options.series;
        for(var item in component.labeldata){
            var obj = {};
            obj[label] = component.labeldata[item];
            if(/line/.test(component.component.chartType) || /Line/.test(component.component.chartType)){
                for(var index in component.tempData){
                    var name = series[index].name;
                    obj[name] = component.tempData.list[item];
                }
            }
            else if(component.component.chartType == 'Pie') obj[component.component.series] = component.tempData[item];
            tableArr.push(obj);
        }
        
        if(type == 'excel')
            alasql('SELECT * INTO XLSX("'+component.component.title+'.xlsx",{headers:true}) FROM ?',[tableArr]);
        if(type == 'csv')
            alasql('SELECT * INTO CSV("'+component.component.title+'.csv",{headers:true}) FROM ?',[tableArr]);*/
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
        console.log('table', table);
        console.log('table row', row);
        var labelName = row[table.label]['value'];
        console.log('labelName-------------', labelName);
        var params = {'Key': table.label, 'value': labelName, title: component.title};
        console.log('params-------------', params);
        redirectToOtherPage(params, component);
    }

    $scope.sortableOptions = {
        connectWith: ".connectPanels",
        handler: ".ibox-title"
    };
    
    if(angular.isDefined($stateParams.id)){
        $scope.dashboardId = $stateParams.id;
        pageName           = $state.current.data.table;
        var query          = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params         = 'query=' + encodeURIComponent(query);
        var url            = dbService.makeUrl({collection: pageName, op:'select', params: params});
        httpService.get(url).then(function(response){
            if(response.data.length == 0){
                swal('', 'No Found Page ', 'warning');
                return;
            }
            $scope.oldHeaderName = "";
            $scope.headerName = response.data[0].name;
            // if($scope.headerName==$scope.headerName){
            //     $scope.oldHeaderName = response.data[0].name
            // }
            // $state.current.data.currentPage = response.data[0].name;
            $scope.report = response.data[0];
            var day = 1;
            var from = $filter('date')( new Date().getTime(), "yyyy-MM-dd");
            var to  = $filter('date')( new Date().getTime(), "yyyy-MM-dd");
            // console.log('singleDatepicker', $scope.report.filter);
            if($scope.report.filter){
                if( $scope.report.filter.date){
                    if($scope.report.dateMode == 'week') var day = 7;
                    else if($scope.report.dateMode == 'month'){
                        from = $filter('date')( new Date().getTime(), "yyyy-MM");
                        to  = $filter('date')( new Date().getTime(), "yyyy-MM");
                    }
                    else if($scope.report.view == 'Month'){
                        var year =  $filter('date')( new Date().getTime(), "yyyy");
                        var month  =  $filter('date')( new Date().getTime(), "MM")
                        var getMonth = Number(month) - (Number($scope.report.filter.Month)-1)
                        var enterMonth = getMonth.toString()
                        var endDate = new Date(year, enterMonth, 0)
                        from = $filter('date')(endDate, "yyyy-MM")
                        to = $filter('date')( new Date().getTime(), "yyyy-MM");
                    }
                    else{
                        console.log("$scope.report.filter.day",$scope.report.filter.day)
                        day =  ($scope.report.filter.day) ?  parseInt($scope.report.filter.day) + 1 : parseInt($scope.report.day)+1;
                        day = day*24*60*60*1000;
                        from = $filter('date')( new Date().getTime()- day, "yyyy-MM-dd");
                        to  = $filter('date')( new Date().getTime() - 1*24*60*60*1000, "yyyy-MM-dd");
                    }
                }
                else if( $scope.report.filter.singleDatepicker){
                    if($scope.report.view == 'Month'){
                        var year =  $filter('date')( new Date().getTime(), "yyyy");
                        var month  =  $filter('date')( new Date().getTime(), "MM");
                        if($scope.report.filter.hasOwnProperty('Month')){
                            console.log("Month entered");
                            var getMonth = Number(month) - (Number($scope.report.filter.Month)-1)
                            var enterMonth = getMonth.toString()
                            var endDate = new Date(year, enterMonth, 0);
                            //from = $filter('date')(new Date().getTime(), "yyyy-MM")
                            from = $filter('date')(endDate.getTime(), "yyyy-MM");
                            to = $filter('date')(endDate.getTime(), "yyyy-MM");
                            console.log("from", from);
                            console.log("to", to);
                        }
                        else{
                            //var currTime= new Date().getTime();
                            //from = moment().format("YYYY-MM");
                            from = $filter('date')(new Date().getTime(), "yyyy-MM")
                            to = $filter('date')(new Date().getTime(), "yyyy-MM");
                            //to = moment().format("YYYY-MM");
                            console.log("to", from);
                        }
                        
                        
                        /*var getMonth = Number(month) - (Number($scope.report.filter.Month)-1)
                        var enterMonth = getMonth.toString()
                        var endDate = new Date(year, enterMonth, 0)
                        from = $filter('date')(endDate, "yyyy-MM")
                        to = $filter('date')(new Date().getTime(), "yyyy-MM");
                        console.log("to", to);*/

                    }
                    else{
                        day =  ($scope.report.filter.day) ?  parseInt($scope.report.filter.day) + 1 : parseInt($scope.report.day)+1;
                        day  = day ? day*24*60*60*1000 : 1*24*60*60*1000;
                        from = $filter('date')( new Date().getTime()- day, "yyyy-MM-dd");
                        to   = $filter('date')( new Date().getTime()- day, "yyyy-MM-dd");
                    }
                }

                if( $scope.report.filter.location || $scope.report.filter.Location ) $scope.loadLocation();

                if( $scope.report.filter.device || $scope.report.filter.Device ) $scope.loadDevice();
                
                if( $scope.report.filter.segment || $scope.report.filter.Segment) $scope.loadSegment();

                if( $scope.report.filter.plan || $scope.report.filter.Plan ) $scope.loadPlan();

                if( $scope.report.filter.OLT || $scope.report.filter.olt ) $scope.loadOLT();
                if( $scope.report.filter.App || $scope.report.filter.app ) $scope.loadApp();
                if( $scope.report.filter.Node || $scope.report.filter.node ) $scope.loadNode();
                if( $scope.report.filter.Area || $scope.report.filter.area ) $scope.loadArea();
                if( $scope.report.filter.Protocol || $scope.report.filter.protocol ) $scope.loadProtocol();
                if( $scope.report.filter.RAT || $scope.report.filter.Rat ) $scope.loadRat();

                // console.log($scope.report.filter);
                $('.input-daterange').datepicker({
                    calendarWeeks: true,
                    inputs: $('.range-start, .range-end'),
                    clearBtn:true,
                    autoclose: true,
                    minViewMode: 'days',
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
            }

            $scope.date = {"start":from,"end":to};
            checkPageIsFavorite(pageName, $stateParams.id);
            $scope.loadPages()
            if($scope.report.GranularityDefault)
                $scope.dateChange($scope.date)
        })
    }

    $scope.granularityArr = []
    $scope.dateChange = function(date){
        var date1 = new Date(date.start);
        var date2 = new Date(date.end);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var difference = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        if(difference) difference++
        console.log('difference', difference)

        if(difference <= 3) $scope.granularityArr = ['Minute', 'Hour', 'Day']
        else if(difference > 3 && difference <= 7) $scope.granularityArr = ['Hour', 'Day']
        else if(difference > 7 && difference <= 30) $scope.granularityArr = ['Hour', 'Day', 'Week']
        else if(difference > 30 && difference <= 90) $scope.granularityArr = ['Hour', 'Day', 'Week', 'Month']
        else if(difference > 90 && difference <= 730) $scope.granularityArr = ['Day', 'Week', 'Month']
        else if(difference > 730) $scope.granularityArr = ['Week', 'Month']

        var tmp = []
        for(var i in $scope.report.granularity){
            if($scope.report.granularity[i] == true && $scope.granularityArr.indexOf(i) > -1)
                tmp.push(i)
        }
        $scope.granularityArr = tmp

        console.log('granularityArr', tmp)

        if($scope.report.GranularityDefault && $scope.granularityArr.indexOf($scope.report.GranularityDefault) > -1)
            $scope.date.granularity = $scope.report.GranularityDefault
        else
            $scope.date.granularity = $scope.granularityArr[0]
    }
    
    var favoritePage;
    function checkPageIsFavorite(page, pageId){
        $scope.isFavorite = false;
        var query = JSON.stringify({ page: page, pageId: pageId, userId: currentUser.userId  });
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'favorite', op:'select', params: params});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                $scope.isFavorite = true;
                favoritePage = res.data[0];
            }
        });
    }

    $scope.addFavorite = function(favorite){
        if(favorite == true){
            var tmp = {pageId : $stateParams.id, userId : currentUser.userId, page: pageName};
            var url = dbService.makeUrl({collection: 'favorite', op:'create'});
            httpService.post(url, tmp).then(function(res){
                if(res.data == 'Success'){
                    checkPageIsFavorite(pageName, $stateParams.id);
                    swal($scope.headerName, "Added to favorite", "success");
                }
            });
        }
        else{
            var url = dbService.makeUrl({collection: 'favorite', op:'delete', id: favoritePage._id});
            httpService.get(url).then(function(res){
                if(res.data == 'Success'){
                    $scope.isFavorite = false;
                    swal($scope.headerName, "Removed from favorite", "success");
                }
            });
        }
    }

    if($scope.fromUsage|| $scope.toUsage){
        // alert($scope.fromUsage)
        // console.log("from usage ",typeof($scope.fromUsage))
        
        var fromUsage, toUsage, paramUsage;
        fromUsage = getBytes($scope.fromUsage, $scope.unit) || '';
        toUsage = getBytes($scope.toUsage, $scope.unit) || '';
        // console.log("from usage vlaue ",fromUsage, toUsage);
        var tmp = getAdvanceFilterParam(fromUsage, toUsage, 'Usage');
        console.log('tmp', tmp);
        
         $scope.parameter = "&UsageFilter="+ encodeURI(tmp) ;
    }

    $scope.loadPages = function (){
        var query = JSON.stringify({ 'dashboardId': $stateParams.id });
        var params = 'query=' + encodeURIComponent(query);
        // console.log("load page");
        var url = dbService.makeUrl({collection: 'pages', op:'select', params: params});
        // console.log("urlLoadPage", url);
        httpService.get(url).then(function(response){
            if(angular.isDefined(response.data) && response.data.constructor === Array){
                $scope.tabLists = response.data;
            }

            if(response.data.length > 0)
                $scope.setCurrentPage(response.data[0]);
        });
    };

    $scope.setCurrentPage = function (itemData){
        // console.log('itemData', itemData)
        var item = angular.copy(itemData);
        var newArr = arrangeComponentWidthWise(item);
        item.components = newArr;
        $scope.previousPage = $scope.currentPage;
        $scope.currentPage = item;
        $scope.previousPage.active=false;
        item.active = true;
        
        /*$timeout(function(){
            $rootScope.$broadcast("DashboardPageAssigned", {currentPage:$scope.currentPage} );
        },100);*/
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

    $rootScope.$on('MovedToDifferentDashboard', function(event, arg){
        // console.log('called-----------------------------', 'MovedToDifferentDashboard', arg, $scope.currentPage);
        if(arg)
            unsubscribeData(arg);
        else{
            unsubscribeData(angular.copy($scope.currentPage) );
            $scope.currentPage = {components : []};

            //$scope.$on('$destroy',function(){
                // console.log('intervalsArr', intervalsArr.length);
                if(intervalsArr.length > 0){
                    for(var i in intervalsArr){
                        $interval.cancel(intervalsArr[i]);
                    }
                }
            // });
        }
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

    $scope.removeComponent = function (component1){
        var component = angular.copy(component1);
        SweetAlert.swal({
            title: "Remove "+component.component.title,
            text: "Would you like to remove module",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: true,
            html: true
        },
        function (isConfirm) {
            if(isConfirm){
                var tempArr = [];
                _.forEach($scope.currentPage.components, function(item, k){
                    _.forEach(item, function(value, key){
                        if(value.component._id != component.component._id){
                            delete value.chartOptions;
                            delete value.statement;
                            tempArr.push(value);
                        }
                    });
                });

                $scope.currentPage.components = tempArr;
                backgroundUpdatePage($scope.currentPage);
                $scope.currentPage.components = arrangeComponentWidthWise($scope.currentPage);
            }
        })
    }

    function unsubscribeData(item){
        angular.forEach(item.components, function(test, key){
            angular.forEach(test, function(value, key){
               unsubscribeForComponent(value.component);
            });
        });
    }

    function unsubscribeForComponent(component){
        // console.log('unsubscribeData', component.title);
        if(angular.isDefined(component.query)) socket.unsubscribe(component.query);
    }

    function subscribeData(page1){
        var page = angular.copy(page1);
        var n=0;
        angular.forEach(page.components, function(test, key){
            angular.forEach(test, function(value, key){
                value.type = value.componentType;
                
                if(value.componentType == 'custom'){
                    $scope.displaydata[value.component.id] = {file : 'views/static/'+ value.component.file};
                }

                if(angular.isDefined(value.component)){
                    n++;
                    $timeout(function(){
                        subscribeForAllComponent(value);
                    }, n*globalConfig.iboxTimeout);

                }
            })
        })
    }

    function isStatement(component, cb){
        if(!component.query){
            swal('', 'Statement not found for '+ component.title, 'error')
            cb(null)
            return
        }
        var fields = JSON.stringify(["type", "statementId", "eventPublish", "dataSource", 'dbPullType', 'name']);
            var query = JSON.stringify({'statementId': component.query});
            var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
            var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
            httpService.get(url).then(function(res){
                // console.log('statement', component.title, res.data);
                if(res.data.length == 0){
                    swal('Statement not found', component.title, 'error');
                    cb(false)
                    return false;
                }
                cb(res.data[0]);
            });
    }
    function text_truncate(str, length, ending) {
        if (length == null) {
          length = 100;
        }
        if (ending == null) {
          ending = '...';
        }
        if (str.length > length) {
          return str.substring(0, length - ending.length) + ending;
        } else {
          return str;
        }
      };  

    function subscribeForAllComponent(component1){
        var component = angular.copy(component1.component);
        var type = component1.type;
        if(type == 'iBox_Multi_no_Header'){
            $scope.displaydata[component._id] = {
                // list : component.list,
                component : component,
                updateTime : null,
                data : {},
                width: 100/ Object.keys(component.list).length,
                totalObj: Object.keys(component.list).length
            }
            subscribeIBoxMulti(component, 1); //Object.keys(component.list).length
        }
        else{
            isStatement(component, function(res){
                if(res){
                    component.statement = res;

                    
                    if( type == 'simple_ibox' || type == 'ibox_with_gauge' || type == 'simple_ibox_with_dual_data_point') subscribeIBox(component);
                    else if(type == 'info_box')                 subscribeInfoBox(component);
                    else if(type == 'simple_charts')            subscribeChart(component);
                    else if(type == 'map')                      subscribeMap(component);
                    else if(type == 'col_extended_table' || type == 'extended_table') subscribeComplexTable(component);
                    else if(['gauge', 'multi_gauge', 'progress_bar'].indexOf(type) > -1) subscribeGauge(component);

                    else if(type == 'simple_table' || type == 'table_with_search') subscribeTable(component);
                    else if(type == 'ibox_with_embeded_chart') {
                        var fields = JSON.stringify(["options"]);
                        var query = '{_id: ObjectId("'+component.options+'")}';
                        var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
                        var url = dbService.makeUrl({collection: 'chartoptions', op:'select', params: params});
                        httpService.get(url).then(function(res){
                            if(res.data.length > 0) component.chartOptions = getOption( res.data[0].options );
                            else{
                                swal('Chart options not found', component.title, 'error');
                                return;
                            }
                            subscribeIboxWithChart(component);
                        });
                    }
                }
            })
        }
    }

    function subscribeChart(component){
        var fields = JSON.stringify(["options", 'nameSpace']);
        var query = '{_id: ObjectId("'+component.options+'")}';
        var params = 'query=' + encodeURIComponent(query)+'&fields='+encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'chartoptions', op:'select', params: params});
        httpService.get(url).then(function(res){
            if(res.data.length > 0){
                component.nameSpace = res.data[0].nameSpace
                component.chartOptions = getOption( res.data[0].options );
            }
            else {
                swal('Chart options not found', component.title, 'error');
                return;
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
                    case "AreaRangeLine":
                        subscribeAreaRangeLineHighchart(component);
                        break;
                    default:
                        subscribeHighchart( component );
                        break;
                }
            }
        });
    }

    /*IBoxMulti*/
        function subscribeIBoxMulti(component, item){
            if(component.list[item]){
                $scope.displaydata[component._id].data[item] = {data: '', unit: ''};

                var box = component.list[item];
                box.title = component.title;
                box.index = item;
                isStatement(box, function(statement){
                    if(statement){
                        box.statement = statement;

                        var iboxData = $scope.displaydata[component._id].data[item];
                        iboxData.loader = true;

                        var newItem = item + 1;
                        if( box.data != 'DBPull' ){
                            var url = dbService.snapshotUrl({op:'select', id: box.query, limit: 1});
                            httpService.get(url).then(function(res){
                                iboxData.loader = false;
                                if(res.data != 'error' || res.data.length > 0){
                                    // console.log(res.data);
                                    processMultiIboxData(component, box, res.data[0]);
                                }
                                subscribeIBoxMulti(component, newItem);

                                socket.subscribe(box.query, function(res){
                                    var tmp = JSON.parse(res);
                                    var data = tmp[box.query];
                                    if(box.statement.type == 'replace')
                                        processMultiIboxData(component, box, data.event[0]);
                                    else
                                        processMultiIboxData(component, box, data.event);
                                    
                                    $scope.$apply();
                                })
                            })
                        }
                        else{
                            if($stateParams.params && $stateParams.params.fromDate)
                                var from = $stateParams.params.fromDate+'T00:00:00.000Z'
                            else
                                var from = ($scope.date.start == undefined) ? $scope.date.end+'T00:00:00.000Z' : $scope.date.start+'T00:00:00.000Z';

                            if($stateParams.params && $stateParams.params.toDate)
                                var to = $stateParams.params.toDate+'T23:59:59.999Z'
                            else
                                var to = $scope.date.end+'T23:59:59.999Z';

                            var parameter = '';
                            if($scope.filter.planSelected)
                                parameter += '&plan='+$scope.filter.planSelected;

                            parameter += '&fromDate='+ from +'&toDate='+to;
                            if(box.statement.dataSource == 'DBPull' && box.statement.dbPullType != undefined)
                                parameter += '&dbPullType='+ box.statement.dbPullType;
                            if(box.statement.dbPullType == 'redis')
                                parameter += '&name='+box.statement.name;

                            var granularity = ($scope.report.GranularityDefault != undefined) ? $scope.report.GranularityDefault : 0;
                            parameter += '&granularity='+ granularity;
                            httpService.get(globalConfig.pullfilterdataurl + box.query+ parameter).success(function(res){
                                console.log('res', res)
                                iboxData.loader = false;
                                if(res.length > 0)
                                    processMultiIboxData(component, box, res[0])
                                subscribeIBoxMulti(component, newItem);
                            })
                        }
                    }
                })
            }
        }

        function processMultiIboxData(component, box, data){
            var iboxData = $scope.displaydata[component._id].data[box.index];
            if(box.unit == 'percent'){
                iboxData.data = (box.dataDecimal) ? (data[box.kpi]).toFixed(box.dataDecimal) : data[box.kpi];
                iboxData.unit = '%';
            }
            else{
                var newValue = countIBoxUnit( box, data[box.kpi] );
                iboxData.data = newValue.value;
                iboxData.unit = newValue.unit;
            }
            
            $scope.displaydata[component._id].updateTime = globalConfig.updateTime();

            if(box.indicator){
                var kpi = box.kpi;
                var dataMinofDay = timemsToMinofDay(data.Time);
                var todayDate = $filter('date')( data.Time,'MM-dd-yyyy' );

                var url = dbService.snapshotUrl({collection: 'getmoduleindicatordata', op:'select', id: box.indicatorQuery, todayDate:todayDate, dataMinofDay: dataMinofDay});
                httpService.get(url).then(function(res){
                    var indicatorData = res.data;
                    if(indicatorData !='null' && angular.isDefined(indicatorData[kpi]) ){
                        var oldValue = indicatorData[kpi];
                        setIndicatorMultiIbox(component, box, oldValue, data[kpi]);
                    }
                    else{
                        httpService.get(globalConfig.pullfilterdataurl + box.indicatorQuery).then(function(response){
                            var temp = [];
                            temp[0] = '';
                            var flag = false;
                            var oldValue;
                            for(var i = 0; i<response.data.length; i++ ){
                                var value = response.data[i];
                                var tmpKey = timemsToMinofDay(value.timems);
                                console.log("tmpKey", tmpKey);
                                if( temp[tmpKey] && angular.isObject(temp[tmpKey]) ){
                                    temp[tmpKey] = angular.extend(temp[tmpKey], value)
                                }
                                else
                                    temp[tmpKey] = value;

                                if(dataMinofDay == tmpKey){
                                    if(kpi){
                                        oldValue = temp[tmpKey][kpi];
                                        flag = true;
                                    }
                                }
                            }
                            if(flag){
                                var indicatorData = temp;
                                var tmpdata = {};
                                tmpdata[todayDate] = indicatorData;
                                var req = {'id': box.indicatorQuery, 'data': tmpdata};
                                var url = dbService.snapshotUrl({collection: 'setmoduleindicatordata', op:'setmoduleindicatordata'});
                                httpService.post(url, req).then(function(res){});
                                setIndicatorMultiIbox(component, box, oldValue, data[kpi]);
                            }
                        });
                    }
                });
            }
        }

        function setIndicatorMultiIbox(component, box, oldValue, newValue){
            var iboxData = $scope.displaydata[component._id].data[box.index];
            var percent;
            var substr =  newValue - oldValue;
            var oldValue = (oldValue) ? oldValue : 1;
            if(substr > 0){
                percent = ((substr/oldValue) * 100).toFixed(box.dataDecimal) + '%';
                iboxData.indicatorClass = 'fa fa-level-up';
                iboxData.indicatorValue = percent;

                if(box.danger && box.danger == 'up')
                    iboxData.spanclass = 'text-danger';
                else
                    iboxData.spanclass = 'text-navy';
            }
            else if( substr < 0){
                percent = Math.abs( ((substr/oldValue) * 100).toFixed(box.dataDecimal) )+ '%';
                iboxData.spanclass = 'text-danger';
                iboxData.indicatorClass = 'fa fa-level-down';
                iboxData.indicatorValue = percent;

                if(box.danger && box.danger == 'up')
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

    /*Map*/
        function subscribeMap(component){
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {
                    component : component,
                    loader:true,
                    data: [],
                    labeldata:[],
                    statement: component.statement,
                    updateTime: ''
                }

                if(component.mapType == 'simple'){
                    $scope.displaydata[component._id].mapOptions = {
                        center: {latitude: null, longitude: null},
                       options: {
                           scrollwheel: false,
                           // Style for Google Maps
                           styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
                           mapTypeId: google.maps.MapTypeId.ROADMAP
                       },
                       control: {
                           refresh: function(){}
                       },
                       zoom: 10,
                       size: {
                           height: '800px'
                       },
                       events: {
                            mouseover: function(marker, eventName, model){
                                $scope.onHover(marker, eventName, model);
                            },
                            mouseout: function(marker, eventName, model){
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
                    if(res.data == 'error' && res.data.length == 0) $scope.displaydata[component._id].loader = false;
                    else processSnapshotMap(component, res.data);

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
                // console.log(globalData.countryLookUpObj.length);
                // var data = globalData.countryLookUpObj.splice(0, 50);
                // mapReplaceData(component, data);
            }
        }

        function processSnapshotMap(component, data){
            var type = component.statement.type;
            console.log('map', component.title, '-------->', type);
            if(type == 'replace') mapReplaceData(component, data);
            else{
                _.forEach(data, function(value, key){
                    if( $scope.displaydata[component._id].statement.type == 'update' ){
                        mapUpdateData(component, value);
                    }
                });
            }
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
            $scope.displaydata[component._id].origionalData = angular.copy(data1);
            // component.dataValue = 'Traffic';
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
                // data1 = data1.splice(0, 5);
                console.log(data1.length, data1[0], component);
                // var data = data1[0];
                _.forEach(data1, function(data, key){
                    if(!data.latitude && !data.Latitude && !data.longitude && !data.Longitude){
                        if(data.Country){
                            var tmp = dbService.unique(globalData.countryLookUpObj, 'Country', data.Country)[0];
                            if(!tmp) return;
                            data.latitude = tmp.Latitude;
                            data.longitude = tmp.Longitude;
                        }
                        else if(data.countrycode){
                            var tmp = dbService.unique(globalData.countryLookUpObj, 'countrycode', data.countrycode)[0];
                            if(!tmp) return;
                            data.latitude = tmp.Latitude;
                            data.longitude = tmp.Longitude;
                        }
                    }

                    var lat = data.latitude || data.Latitude;
                    var lang = data.longitude || data.Longitude;
                    var info = [];
                    // component.infoboxDataField = ['Country', 'countrycode'];
                    for(var i in component.infoboxDataField){
                        var unitData = data[component.infoboxDataField[i]];
                        if(component.infoboxDataField[i] == 'Traffic' ){
                            unitData = countIBoxUnit({unitAdjustFlag: 'yes', unit: 'usage'}, unitData);
                            // console.log('unitData', unitData);
                            unitData = unitData.value.toFixed(3) + ' '+ unitData.unit;
                        }
                        info.push(component.infoboxDataField[i]+": "+unitData);
                        // info.push("lang: "+lang);
                        // info.push("lat: "+lat);
                    }
                    info = info.join(', <br />');

                    var val = data[component.dataValue];
                    var icon = '';
                    if(component.shape == 'marker' && component.icon != 'standard'){
                        if(component.icon == 'custom'){
                            _.forEach(component.to, function(v, k){
                                if( val >= component.from[k] && val < component.to[k]){
                                    icon = globalConfig.mapIcon+'/images/'+component.customIcon[k]+'.png';
                                    return false;
                                }
                            });
                        }
                        else{
                            // icon = globalConfig.mapIcon+'/images/tower_blue.png';
                            icon = globalConfig.mapIcon+'/images/'+component.icon+'.png';
                        }
                    }
                    else val = Math.sqrt(val) * 100;

                    // console.log(icon);
                    /*if(icon != ''){
                        var tmp = {'value': val,
                            'position': [lat, lang],
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
                    }*/

                    var tmp = {
                        id: key,
                        latitude: lat,
                        longitude: lang,
                        title: info,
                        //cellid: data[component.dataValue],
                        //date: $scope.date.end,
                        //area: data.Area,
                        icon: icon,
                        options:{visible:true}
                    }
                    mapcount.push(tmp);
                    map.data.push( tmp );

                    if(key == data1.length - 1){
                        map.mapOptions.center = {latitude: mapcount[0]['latitude'], longitude: mapcount[0]['longitude']};
                        // console.log('map.mapOptions', map.mapOptions);
                        map.mapOptions.marker = mapcount;
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
        
        /*NgMap.getMap().then(function(map) {
            $scope.map = map;
        });*/

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
                xAxisFormate(component);
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
                    else{
                        $scope.displaydata[component._id].options.series.push({'name': component.series[i], color:highchartProcessData.colorpallete[i], "data":[]});
                    }
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
                if(data == 'null') return;
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart -> ' + component.title +' == '+ type);

                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

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
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
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
                chartData.updateTime = globalConfig.updateTime();

                if(converted.unit)
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel + '(' + converted.unit + ')' : converted.unit;
                else
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel : null;

                chartData.options.options.xAxis.categories = chartData.labeldata;

                _.forEach(component.series, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                        var val = chartData.tempData[seriesCount][i];
                        val = getConvertedVal(component, val, converted.unit);
                        chartData.options.series[seriesCount].data[i] = val;
                    }
                });
            }

        //Pie Chart
            function subscribeSingleSeriesHighchart( component ){
                if(angular.isDefined(component.height) ){
                    component.chartOptions.options.chart.height = component.height;
                }

                component.chartOptions.options.colors = highchartProcessData.colorpallete;//['#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263','#6AF9C4'];
                if(component.labels == 'CEI')
                    component.chartOptions.options.colors = highchartProcessData.CEIColorPallete;

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
                                    var params = {Key: component.labels, unit: component.chartUnit, value: label, label: label};
                                    redirectToOtherPage(params, component);
                                }
                            }
                        };
                    }
                }

                // console.log('component.data', component.data)
                if( component.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get(url).then(function(res){
                        if( res.data == 'error' || res.data.length == 0)
                            $scope.displaydata[component._id].loader = false;
                        
                        var data = res.data;
                        data = sortAcsending(component, data);
                        snapshotSingleSeriesHighchart(component, data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if(!angular.isArray(data.event))
                                data.event = [data.event]

                            data = sortAcsending(component, data.event);
                            if( component.statement.type === 'refresh' || component.statement.type === 'moving' ){
                                highchartSingleSeriesRefreshMoving(component, data);
                            }
                            else if( component.statement.type === 'replace' ){
                                
                                highchartSingleSeriesReplace(component, data);
                            }
                        })
                    })
                }
                else
                    setTimeInterval(component)
            }

            function sortAcsending(component, data){
                return data;
                var newArr = [];
                console.log('component', component.title, data);
                if (data.length > 0) {
                    if( ! data[0][component.labels] ||  data[0][component.labels].indexOf('-') == -1) {
                        return data;
                    } else {
                        var sort = data.sort( function(a, b){
                            var aName = a[component.labels].toLowerCase();
                            var bName = b[component.labels].toLowerCase();
                            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
                        });
                        console.log('sort', sort, component);
                        var first = sort[0];
                        newArr.push(first);
                        data.forEach(function(item) {
                            console.log("Data valuea are ",item)
                            var find = first[component.labels].split('-')[1];
                            var found = data.find(function(rec) { 
                                console.log(rec[component.labels], rec[component.labels].split('-')[0]);
                                return rec[component.labels].split('-')[0].trim() == find});
                            if(!found){
                                found = data.find( function(rec){ return rec[component.labels].split(' ')[0].trim() == find});
                            }
                            console.log('***************find ', find, found);
                            if(found){
                                newArr.push(found);
                                first = found;
                            }
                        })
                    }
                }
                console.log('return newArr;', newArr);
                return newArr;
            }

            function snapshotSingleSeriesHighchart(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Single Series-> ' + component.title +' == '+ type);
                if(data == 'error') return
                else if(!angular.isArray(data))
                    data = [data]

                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

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
                // console.log('pie replace', component.title, data1.length)
                $scope.displaydata[component._id].origionalData = angular.copy(data1);

                var chartData = $scope.displaydata[component._id];
                
                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];       
                    chartData.options.series[0].data = [];
                    chartData.tempData = [];
                }
                if(typeof(component.series) == 'object' && data1.length > 0){
                    chartData.labeldata = component.series;
                    var total = 0
                    for(var item in component.series){
                        total += data1[data1.length-1][component.series[item]]
                        if(angular.isDefined(component.pieColor) && angular.isDefined(component.pieColor[component.serieslist.list[item]]) )
                            chartData.options.series[0].data[item]= {name: component.series[item], y: data1[data1.length-1][component.series[item]], color: component.pieColor[component.series[item]]};
                        else
                            chartData.options.series[0].data[item]= {name: component.series[item], y: data1[data1.length-1][component.series[item]]};
                    }
                    if(component.chartUnitAdjustFlag == 'yes'){
                        var converted = countUnit( component, total);
                        chartData.total = converted.value + " "+ converted.unit;
                    }
                    chartData.updateTime = globalConfig.updateTime();
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
                    chartData.options.series[0].data[keyindex].y = data[component.series];
                }
                else{
                    chartData.labeldata.push(label);
                    chartData.tempData.push( data[component.series] );
                    if(data.plotcolor)
                        chartData.options.series[0].data.push({name: label, y: data[component.series], color: data.plotcolor} );
                    else
                        chartData.options.series[0].data.push({name: label, y: data[component.series]} );
                }
            }

            function changeSingleSeriesHighchartData(component, converted){
                var chartData = $scope.displaydata[component._id];

                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                chartData.updateTime = globalConfig.updateTime();
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
                var total = 0;
                chartData.options.series[0].name = converted.unit;
                for(var i=0; i<chartData.tempData.length; i++){
                    var val = chartData.tempData[i];
                    total +=  val || 0;
                    val = getConvertedVal(component, val, converted.unit);
                    chartData.options.series[0].data[i].y = val;
                }
                if(component.chartUnitAdjustFlag == 'yes'){
                    var converted = countUnit( component, total);
                    chartData.total = converted.value + " "+ converted.unit;
                }
                else
                    chartData.total = total

                console.log("chartData",chartData)

//                chartData.options.options.colors = highchartProcessData.colorpallete.splice(0, chartData.options.series[0].data.length)
//                console.log(component.title,chartData.options.options.colors)
            }

        //MultiLine
            function subscribeMultiLineHighchart(component){
                xAxisFormate(component);
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
                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

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
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
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
                            if(component.timeType = 'time' && component.data != 'DBPull')
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

                chartData.updateTime = globalConfig.updateTime();
                if(converted.unit && component.yAxislabel)
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel + '('+ converted.unit + ')' : converted.unit;
                else
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel : converted.unit;

                _.forEach(chartData.tempData, function(value, seriesCount){
                    for(var i=0; i<value.length; i++){
                        var val = value[i];
                        val = getConvertedVal(component, val, converted.unit);
                        chartData.options.series[seriesCount].data[i][1] = val;
                        if(component.chartType == 'Bubble')
                            chartData.options.series[seriesCount].data[i][2] = val;
                        
                    }
                });
            }

        //stacked Bar
            function subscribeStackedBarHighchart( component ){
                xAxisFormate(component);
                //Clickble
                if( component.page != '' && component.clickable == true ){
                    component.chartOptions.options.plotOptions.column.cursor = 'pointer';    
                    component.chartOptions.options.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(event, this);
                                console.log(this.options);
                                var label = this.series.name;
                                var from = $filter('date')( this.category , "yyyy-MM-dd");
                                var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                                console.log('from', from)
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
                if(component.fixOrder){
                    var collection;
                    if(component.ySeries.trim() == 'Latency')
                        collection = 'lku_firstbytelatency_buckets'
                    else if('ResolutionBucket' == component.ySeries.trim() || 'Resolution' == component.ySeries)
                        collection = 'lku_dns_resolution_buckets'
                    else if('CEI' == component.ySeries.trim())
                        collection = 'lku_cei_buckets'
                    else if('Usage' == component.ySeries.trim())
                        collection = 'lku_usage_buckets'
                    else if(component.ySeries.trim() == 'Throughput')
                        collection = 'lku_throughput_buckets'
                    else if(component.ySeries.trim() == 'LastSeen')
                        collection = 'lku_lastseen_buckets'

                    var url = dbService.makeUrl({collection: collection, op:'select'});
                    httpService.get(url+'&db=datadb').success(function(res){
                        console.log("res", res);
                        res = res.sort(function(a, b){
                            return a.rank - b.rank
                        })
                        $scope.displaydata[component._id].fixSeries = res
                    })
                }
                
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
                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

                if( type === 'replace')
                    highchartStackedBarReplace(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                    }
                }
            }

            function highchartStackedBarReplace(component, data1){
                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);
                
                if(!data1[0][component.ySeries]){
                    // console.log('data1', component, data1);
                    swal('Wrong Series Selected X & Y', 'You selected opposite series for chart '+ component.title, 'error');
                    return;
                }

                $scope.displaydata[component._id].origionalData = angular.copy(data1);
                var chartData = $scope.displaydata[component._id];

                // console.log("componentcomponent", component);
                if(/data/.test(component.labels))
                    component.labels = component.labels.split('.')[1];

                if(/data/.test(component.series))
                    component.series = component.series.split('.')[1];

                //calculate max value
                var max= [];
                function getUnit(data, unitType){
                    if(unitType == "count")
                        return dataFormatter.setCountUnit(data);
                    else if(unitType == "usage")
                        return dataFormatter.setUsageUnit(data);
                    else if(unitType == "speed")
                        return dataFormatter.setThroughputUnit(data);
                }

                for(var i=0; i<data1.length; i++ ){
                    var seriesData= angular.copy(data1[i]['data']);

                    for(var j=0; j<seriesData.length; j++ ){
                        max.push(seriesData[j][component.series]);
                    }
                }
                var chartUnit= getUnit(Math.max.apply( null, max ), component.chartUnit)
                //end max cal logic

                var paramObject        = {};
                paramObject.objArray   = data1;
                paramObject.label      = component.labels
                paramObject.data       = component.series
                paramObject.seriesName = component.ySeries;
                paramObject.seriesdata = 'data';
                paramObject.flag       = "xAxis";
                
                if(chartData.fixSeries)
                    paramObject.fixOrder = chartData.fixSeries;
                
               
                chartData.labeldata = highchartProcessData.dynamicHighchartData(paramObject);
               
                paramObject.flag= "series";
                paramObject.unit= chartUnit;
                paramObject.unitSelected= component.chartUnit;
                // console.log('paramObject', paramObject)
                var tmp = highchartProcessData.dynamicHighchartData(paramObject)
                // console.log('tmp', tmp)
                chartData.options.series = tmp;
                chartData.options.options.xAxis.categories = chartData.labeldata
                console.log('chartUnit', chartUnit)

                if(chartUnit && component.yAxislabel)
                    chartData.options.options.yAxis.title.text = component.yAxislabel + ' ('+ chartUnit + ')';
                else
                    chartData.options.options.yAxis.title.text = component.yAxislabel || converted.unit;
                
                // component.isSubscribers = true;
                // component.subscribersQuery = 'ac58e20384a16833de35ecb71';
                // component.subscribers = 'TotalSubscribers';
                if(component.isSubscribers) {
                    getTotalSubscriberDayWise(component, function(res) {
                        console.log('************************------------------------****', res);
                        var qTotals = [];
                        chartData.labeldata.forEach( function(date) {
                            var rec = res.find( function(item) { return item[component.labels] == date});
                            if (rec) {
                                qTotals.push(rec[component.subscribers]);
                            }
                        })
                        chartData.options.options.yAxis.stackLabels = {
                            qTotals: qTotals,
                            enabled: true,
                            style: {
                                fontWeight: 'bold'
                            },
                            formatter: function() {          
                                return this.options.qTotals[this.x];
                            }
                        };
                    });
                }
                return

                /*$scope.CEIDistributionChartOptions= {
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                    options: CEIDistributionUsersChartOptions,
                }*/

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata      = [];
                    chartData.options.series = [];
                    chartData.tempData       = [];

                    if(component.ySeries == 'CEI')
                        var colorSeries = highchartProcessData.CEIColorPallete;
                    else
                        var colorSeries = highchartProcessData.colorpallete;

                    recurIndex(component, data1, function(keyIndex){
                        if(component.fixOrder){
                            for(var z in chartData.fixSeries){
                                var CEI = chartData.fixSeries[z];
                                var isVal = _.filter(data1[keyIndex][component.ySeries], function(item){
                                    return item[component.ySeries] == CEI.bktname
                                })[0]
                                if(isVal){
                                    chartData.options.series.push({name: isVal[component.ySeries].toString(), color: CEI.color, data: []});
                                    chartData.tempData.push([]);    
                                }
                            }
                        }
                        else{
                            for(var seriesCount = 0; seriesCount < data1[keyIndex][component.ySeries].length; seriesCount++){
                                
                                chartData.options.series.push({name: data1[keyIndex][component.ySeries][seriesCount][component.ySeries].toString(), color:colorSeries[seriesCount], data: []});
                                chartData.tempData[seriesCount] = [];
                            }
                        }
                    })
                }
                
                _.forEach(data1, function(data, key){
                    var label = data[component.labels];
                    var keyindex = $.inArray( label, chartData.labeldata);
                    if( keyindex > -1 ){
                        for(var seriesCount = 0; seriesCount < chartData.options.series.length; seriesCount++) {
                            var test = dbService.unique(data[component.ySeries], component.ySeries, chartData.options.series[seriesCount]['name'] )[0];
                            if(test){
                                chartData.options.series[seriesCount].data[keyindex] = test[component.series];
                                chartData.tempData[seriesCount][keyindex] = test[component.series];
                            }
                            else{
                                chartData.options.series[seriesCount].data[keyindex] = '';
                                chartData.tempData[seriesCount][keyindex] = '';
                            }
                        }
                    }
                    else{
                        chartData.labeldata.push( label );
                        for(var seriesCount = 0; seriesCount < chartData.options.series.length; seriesCount++) {
                            var test = dbService.unique(data[component.ySeries], component.ySeries, chartData.options.series[seriesCount]['name'])[0];
                            if(test){
                                chartData.options.series[seriesCount].data.push(test[component.series]);
                                chartData.tempData[seriesCount].push( test[component.series] );
                            }
                            else{
                                chartData.options.series[seriesCount].data.push(0);
                                chartData.tempData[seriesCount].push(0);
                            }
                        }
                    }

                    if(data1.length == key + 1){
                        var tmp = [];
                        for(var seriesCount = 0; seriesCount < chartData.tempData.length; seriesCount++){
                            var maxVal = Math.max.apply(null, chartData.tempData[seriesCount]);
                            tmp.push(maxVal);
                        }
                        var maxVal = Math.max.apply(null, tmp);
                        var converted = countChartValue(component, maxVal);
                        if(component.chartUnit == 'percent')
                            converted.unit = '%';

                        changeStackedBarValue(component, converted);
                    }
                })
                
            }

            function recurIndex(component, data1, cb){
                var highest = 0;
                var keyIndex = 0;
                var tmp = [];
                _.forEach(data1, function(item, key){
                    for(var i in item){
                        i = i.toLowerCase()
                        if(i != 'date' && tmp.indexOf(i) == -1){
                            tmp.push(i)
                            if (item[component.ySeries].length > highest){
                                highest = item[component.ySeries].length;
                                keyIndex = key;
                            }       
                        }
                    }
                    if(item[component.ySeries].length > highest){
                        highest = item[component.ySeries].length;
                        keyIndex = key;
                    }
                    if(key == data1.length-1) cb(keyIndex);
                })
            }

            function changeStackedBarValue(component, converted){
                var chartData = $scope.displaydata[component._id];
                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                chartData.updateTime = globalConfig.updateTime();
                if(converted.unit && component.yAxislabel)
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel + '('+ converted.unit + ')' : converted.unit;
                else
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel : converted.unit;

                chartData.options.options.xAxis.categories = chartData.labeldata;

                _.forEach(chartData.tempData, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].length; i++){
                        var val = chartData.tempData[seriesCount][i];
                        val = getConvertedVal(component, val, converted.unit );
                        chartData.options.series[seriesCount].data[i] = val;
                    }
                })
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
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
                
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

                chartData.updateTime = globalConfig.updateTime();
                if( chartData.labeldata.length > component.dataelement ){
                    chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                    chartData.tempData = chartData.tempData.splice(0, component.dataelement);
                    chartData.options.series[0].data = chartData.options.series[0].data.splice(0, component.dataelement);
                }

                chartData.options.options.title.text = converted.unit;
                for(var i = 0; i < chartData.tempData.length; i++) {
                    var val = chartData.tempData[i];
                    val = getConvertedVal(component, val, converted.unit);
                    chartData.options.series[0].data[i][1] = val;
                }
            }
    
        //Scatter
            function subscribeScatterHighchart(component){
                xAxisFormate(component);
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
                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

                if( type === 'replace')
                    highchartScatterReplace(component, data);
            }

            function highchartScatterReplace(component, data1){
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
                var chartData = $scope.displaydata[component._id];

                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.tempData = [];
                    chartData.options.series = [];
                    for(var seriesCount = 0; seriesCount<component.series.length; seriesCount++){
                        chartData.options.series.push({name: component.series[seriesCount], color:highchartProcessData.colorpallete[seriesCount], data: []});
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

                chartData.updateTime = globalConfig.updateTime();
                if(converted.unit && component.yAxislabel)
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel + '('+ converted.unit + ')' : converted.unit;
                else
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel : converted.unit;

                _.forEach(chartData.tempData, function(value, seriesCount){
                    for(var i=0; i<value.length; i++){
                        var val = getConvertedVal(component, value[i], converted.unit);
                        chartData.options.series[seriesCount].data[i][1] = val;
                    }
                });
            }

        //LinePlushBar
            function subscribeLinePlushBarHighchart(component){
                xAxisFormate(component);
                component.chartOptions.series[0].name = component.barSeries;
                component.chartOptions.series[1].name = component.lineSeries;

                component.chartOptions.series[0].color = component.barColor;
                component.chartOptions.series[1].color = component.lineColor;
                

                $scope.displaydata[component._id] = {
                    component:component,
                    labeldata: [],
                    loader:true,
                    tempData:[],
                    statement: component.statement,
                    options: component.chartOptions,
                    updateTime: ''
                };
                console.log("$scope.displaydata[component._id]", $scope.displaydata[component._id]);
                if( component.data != 'DBPull' ){
                    //'http://10.0.0.11:8080/JRServer/UISnapshot?op=select&id=aad79a81a46f99cd1bf13b456&limit=15'
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: component.dataelement});
                    httpService.get('http://10.0.0.11:8080/JRServer/UISnapshot?op=select&id=aad79a81a46f99cd1bf13b456&limit=15').then(function(res){
                        if(res.data.length == 0)
                             $scope.displaydata[component._id].loader = false;

                        snapshotLinePlushBar(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'replace' )
                                highchartLinePlushBarReplace(component, data.event);
                        });
                    });
                }
                else
                    setTimeInterval(component);
            }

            function snapshotLinePlushBar(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Line Plush Bar-> ' + component.title +' == '+ type);
                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

                if( type === 'replace')
                    highchartLinePlushBarReplace(component, data);
            }

            function highchartLinePlushBarReplace(component, data1){
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
                var chartData = $scope.displaydata[component._id];

                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata              = [];
                    chartData.options.series[0].data = [];
                    chartData.options.series[1].data = [];
                    chartData.tempData[0]            = [];
                    chartData.tempData[1]            = [];
                }
                // console.log(chartData.options);

                _.forEach(data1, function(data, key){
                    var label = data[component.labels];
                    console.log("chartData.labeldata", chartData.labeldata);
                    var keyindex = $.inArray( label, chartData.labeldata );
                    if( keyindex > -1 ){
                        chartData.options.series[0].data[keyindex] = data[component.barSeries];
                        chartData.options.series[1].data[keyindex] = data[component.lineSeries];
                        chartData.tempData[0][keyindex]            = data[component.barSeries];
                        chartData.tempData[1][keyindex]            = data[component.lineSeries];
                    }
                    else{
                        chartData.labeldata.push( label );
                        chartData.options.series[0].data.push(data[component.barSeries]);
                        chartData.options.series[1].data.push(data[component.lineSeries]);
                        chartData.tempData[0].push(data[component.barSeries]);
                        chartData.tempData[1].push(data[component.lineSeries]);
                    }

                    if(data1.length == key + 1){
                        chartData.options.options.xAxis.categories = chartData.labeldata;
                        chartData.options.options.xAxis['0']['categories'] = chartData.labeldata;
                        var tmp = [];
                        for(var seriesCount = 0; seriesCount < chartData.tempData.length; seriesCount++) {
                            if(component.chartType == "LinePlushBar" && seriesCount== 1)
                                component.plotFor= "line"
                                // console.log("component.log", component)
                            var maxVal = Math.max.apply(null, chartData.tempData[seriesCount]);
                            var converted = countChartValue( component, maxVal );
                            changeLinePlushBarValue(component, converted, seriesCount);
                        }
                    }
                });
                chartData.updateTime = globalConfig.updateTime();
            }

            function changeLinePlushBarValue(component, converted, seriesCount){
                var chartData = $scope.displaydata[component._id];
                if(component.chartUnit == 'percent')
                    converted.unit = '%';

                if(seriesCount == 0)
                    chartData.options.options.yAxis[seriesCount].title.text = (converted.unit) ? component.barSeries+' - '+converted.unit : component.barSeries;
                else
                    chartData.options.options.yAxis[seriesCount].title.text = (converted.unit) ? component.lineSeries+' - '+converted.unit : component.lineSeries;

                    chartData.options.series[seriesCount].tooltip.valueSuffix = ' '+converted.unit;

                for(var i = 0; i<chartData.tempData[seriesCount].length; i++){
                    var val = chartData.tempData[seriesCount][i];
                    val = getConvertedVal(component, val, converted.unit);
                    chartData.options.series[seriesCount].data[i] = val;
                }
            }
        
        //AreaRangeLine
            function subscribeAreaRangeLineHighchart(component){
                component.timeType = 'minute';
                xAxisFormate(component);
                component.chartOptions.series[0].marker.lineColor = Highcharts.getOptions().colors[0];
                component.chartOptions.series[1].color = component.color;
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

                        snapshotAreaRangeLine(component, res.data);
                        socket.subscribe(component.query,function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.query];
                            if( component.statement.type === 'replace' )
                                highchartScatterReplace(component, data.event);
                        });
                    });
                }
                else
                    areaRangeLineReplace(component);
                    // setTimeInterval(component);
            }

            function snapshotAreaRangeLine(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('Highchart Area Range Line -> ' + component.title +' == '+ type);
                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

                if( type === 'replace')
                    areaRangeLineReplace(component, data);
            }

            function areaRangeLineReplace(component, data){
                $scope.displaydata[component._id].origionalData = angular.copy(data);
                var chartData = $scope.displaydata[component._id];
                component.labels = 'Time';
                //var data1 = [{"Time":1491761401314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761461314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761521314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761581314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761641314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761701314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761761314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761821314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761881314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491761941314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762001314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762061314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762121314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762181314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762241314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762301314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762361314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762421314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762481314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852},{"Time":1491762541314,"TotalTraffic":3121275,"UpTraffic":622423,"DownTraffic":2498852}];
                
                if(component.dataelement)
                    data1 = data1.splice(0, component.dataelement);

                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    chartData.tempData = [];
                    chartData.options.series[0].data = [];
                    chartData.options.series[1].data = [];
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
                        chartData.options.series[0].data.push([ label, data['TotalTraffic'] - data['UpTraffic'] ]);
                        chartData.options.series[1].data.push([ label, data['UpTraffic'], data['TotalTraffic'] ]);
                    }
                })
            }

        //Set xAxis label formate
            function xAxisFormate(component, granularity){
                if(!granularity) granularity = $scope.date.granularity
                // console.log('xAxisFormate -->',granularity, $scope.date)
                if(component.labelType == 'time'){
                    component.chartOptions.options.xAxis.title.text = 'Time'; //component.labelType;
                    component.chartOptions.options.xAxis.type = 'datetime';
                    var formate = '';
                    var tooltip = '';

                    if(granularity){
                        // var d1 = $scope.date.start.split('-')[2]
                        // var d2 = $scope.date.end.split('-')[2]
                        var d1 = new Date($scope.date.start).getTime()
                        var d2 = new Date($scope.date.end).getTime()
                        console.log(d1, d2)
                        if(granularity == 'Minute'){
                            if(d2 > d1){
                                formate = "{value:%e %b %H:%M}";
                                tooltip = "%e %b %H:%M";
                            }
                            else{
                                formate = "{value:%H:%M}";
                                tooltip = "%H:%M";
                            }
                        }
                        else if(granularity == 'Hour'){
                            if(d2 > d1){
                                formate = "{value:%e %b %H}";
                                tooltip = "%e %b %H";
                            }
                            else{
                                formate = "{value:%H}";
                                tooltip = "%H";
                            }
                        }
                        else if(granularity == 'Day'){
                            formate = "{value:%e %b}";
                            tooltip = "%e %b";
                        }
                    }
                    else{
                        if(component.timeType == 'sec'){
                            formate = "{value:%H:%M:%S}";
                            tooltip = "%H:%M:%S";
                        }
                        else if( component.timeType == 'minute'){
                            formate = "{value: %M:%S}";
                            tooltip = "%M:%S";
                        }
                        else if( component.timeType == 'hour'){
                            formate = "{value: %H:%M %p}";
                            tooltip = "%H:%M %p";
                        }
                        else if( component.timeType == 'day'){
                            formate = "{value:%e %b}";
                            tooltip = "%e %b";
                        }
                    }
                    console.log('formate -->',formate, tooltip)

                    component.chartOptions.options.xAxis.labels = {"format": formate};
                    component.chartOptions.options.tooltip.xDateFormat = tooltip;
                    component.chartOptions.options.tooltip.shared = true;
                    var tooltip = {
                        "headerFormat": "<span style='font-size:10px'>{point.key}</span><table>",
                        "pointFormat": "<tr><td style='color:{series.color};padding:0'>{series.name}: </td><td style='padding:0'><b>{point.y}</b></td></tr>",
                        "footerFormat": "</table>",
                        "shared": true,
                        "useHTML": true
                    }
                }
                else if(component.chartOptions.options.xAxis.title)
                    component.chartOptions.options.xAxis.title.text = component.labels;

                // component.chartOptions.options.tooltip = tooltip;
                var pointFormat;
                if( !component.unitAdjustFlag && (component.chartType == 'StackedBar' || component.chartType == 'StackedBarHorizontal') ){
                    if(component.chartUnit == 'count' || component.chartUnit == 'percent'){
                        pointFormat = "<tr><td style='color:{series.color};padding:0'>{series.name}: </td><td style='padding:0'><b>{point.y}</b></td></tr>";
                    }
                    else{
                        var decimal = (component.dataDecimal || component.dataDecimal == 0) ? component.dataDecimal : globalConfig.defaultDecimal;
                        if(['highchart_stackedbar_100pct', 'highchart_stackedbar_label'].indexOf(component.nameSpace) > -1 )
                            pointFormat = "<tr><td style='color:{series.color};padding:0'>{series.name}: </td><td style='padding:0'><b>{point.percentage:."+decimal+"f}%</b></td></tr>";
                        else
                            pointFormat = "<tr><td style='color:{series.color};padding:0'>{series.name}: </td><td style='padding:0'><b>{point.percentage:."+decimal+"f}</b></td></tr>";
                    }
                }
                else{
                    pointFormat = "<tr><td style='color:{series.color};padding:0'>{series.name}: </td><td style='padding:0'><b>{point.y}</b></td></tr>";
                }
                component.chartOptions.options.tooltip.pointFormat = pointFormat
            }
    /*End Highchart*/
    
    /*Embeded Chart*/
        function getFlotTooltip(label, x, y){
            var date = new Date(x*1000 +globalConfig.tzAdjustment)
            //x = date.getHours() + ':'+ date.getMinutes();
            return "%x, "+y;
        }

        function subscribeIboxWithChart(component){
            $scope.displaydata[component._id] = {
                component : component,
                kpi       :'',
                labeldata : [],
                loader    :true,
                dataset   :[],
                tempData  :[],
                dataIndex :[],
                statement : component.statement,
                options   : component.chartOptions,
                updateTime: ''
            }
            if(component.libType == 'flot'){
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );
                    $scope.displaydata[component._id].tempData.push( [] );
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
                        $scope.displaydata[component._id].updateTime2= globalConfig.updateTime();
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
                            else if(component.libType == 'highchart'){
                                var type = component.statement.type;
                                var data = data.event;
                                if(component.chartType == 'Line'){
                                    if( type === 'replace')
                                        highchartSingleSeriesReplace(component, data)
                                    else
                                        highchartSingleSeriesRefreshMoving(component, data)
                                }
                                else{
                                    if( type === 'replace')
                                        highchartReplaceData(component, data)
                                    else
                                        highchartRefreshMoving(component, data)
                                }
                            }
                        }
                        if(!$scope.$$phase)
                            $scope.$apply();
                    })
                })
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
                    })
                })
            }
            else
                setTimeInterval(component);
        }

        function processIBoxWithChartSnapshotData(component, data){
            for(var index = 0; index < data.length; index++){
                processIBoxWithChartData(component, data[index]);
            }
        }

        function processIBoxWithChartData(component, data){
            if($scope.displaydata[component._id]){
                var iboxData = $scope.displaydata[component._id];
                if(component.unit == 'percent'){
                    iboxData.kpi = toFixedValue(component, data[component.valueKpi]);
                    iboxData.unit = '%';
                }
                else{
                    var newValue = countIBoxUnit( component, data[component.valueKpi] );
                    iboxData.kpi = newValue.value;
                    iboxData.unit = newValue.unit;
                }
                iboxData.updateTime = globalConfig.updateTime();
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
                            chartData.updateTime = globalConfig.updateTime();
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
                            chartData.updateTime = globalConfig.updateTime();
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
                            chartData.updateTime = globalConfig.updateTime();
                        }
                    }
                }
                else
                    pushDataForChartJs(component, data, label);
            }

            function processChartMultiSeriesReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
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
                                chartData.updateTime = globalConfig.updateTime();
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
                        chartData.updateTime = globalConfig.updateTime();
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
                    chartData.updateTime = globalConfig.updateTime();
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
                    chartData.updateTime = globalConfig.updateTime();
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
                    chartData.updateTime = globalConfig.updateTime();
                }
            }

            function processChartSingleSeriesReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
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
                chartData.updateTime = globalConfig.updateTime();
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
                $scope.displaydata[component._id].options.chart.tooltip = {};
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
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
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
                        val = getConvertedVal(component, val, converted.unit);
                        chartData.data[seriesCount].values[i].y = val;
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
                        else if( type === 'update' )report.filter.Segment
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
                    val = getConvertedVal(component, val, converted.unit);
                    chartData.data[seriesCount].values[i].y = val;
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
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
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
                            val = getConvertedVal(component, val, converted.unit);
                            chartData.data[seriesCount].values[i].y = val;
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
                chartData.updateTime = globalConfig.updateTime();
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
                chartData.updateTime = globalConfig.updateTime();
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
                chartData.updateTime = globalConfig.updateTime();
            }

            function pieD3ReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
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
                chartData.updateTime = globalConfig.updateTime();
            }

            function changeD3PieSeries( component, converted ){
                var chartData = $scope.displaydata[component._id];

                for(var i = 0; i < chartData.tempData.length; i++) {
                    var val = chartData.tempData[i];
                    val = getConvertedVal(component, val, converted.unit);
                    chartData.data[i].value = val ;
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
                // console.log('extended', component);
                if(component.fixOrder){
                    var collection;
                    if(component.colName.trim() == 'Latency')
                        collection = 'lku_firstbytelatency_buckets'
                    else if('ResolutionBucket' == component.colName.trim())
                        collection = 'lku_dns_resolution_buckets'
                    else if('CEI' == component.colName.trim())
                        collection = 'lku_cei_buckets'
                    else if('UsageBucket' == component.colName.trim())
                        collection = 'lku_usage_buckets'

                    var url = dbService.makeUrl({collection: collection, op:'select'});
                    httpService.get(url+'&db=datadb').success(function(res){
                        // console.log('lku__bkt', res)
                        res = res.sort(function(a, b){
                            return a.rank - b.rank
                        })
                        // console.log(res)
                        $scope.displaydata[component._id].fixOrder = res
                    })
                }

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
                        }))
                    }
                }
            }

            //Pagination
            $scope.currPage = 1;
            $scope.maxSize = 3;
            $scope.itemsPerPage= 10;
            function complexTableReplaceData(component, data){
                if(component.type == 'extended_table'){
                    extendedReplaceData(component, data)
                    return;
                }
                // return
                var table = {
                    fixOrder : $scope.displaydata[component._id].fixOrder,
                    component:component,
                    indicatorData: [],
                    label:component.labels,
                    columns:[],
                    tempData:[],
                    origionalData:data,
                    data:[],
                    updateTime:''
                };

                if(data.length > 0){
                    $scope.totalItems = data.length;
                    var label = [];
                    var tmpLen = null;
                    var tmpkey = null;
                    if(/data/.test(component.colName)){
                        component.colName= component.colName.substring(5);
                    }
                    if(/data/.test(component.rowData))
                        component.rowData= component.rowData.substring(5);

                    var colDataArray= [], processedExtdTableData= [];
                    // data = [data[0]]

                    buildColDataArray(component, data, function(res){
                        colDataArray = res;
                        for(var i=0; i<data.length; i++){
                            var processedData= [], tempData= {};
                            for(var j in colDataArray){
                                var temp={};
                                if(/Date/.test(component.colName)){
                                    temp[component.colName]= $filter('date')( colDataArray[j], "yyyy-MM-dd");   
                                }
                                else{
                                    temp[component.colName]= colDataArray[j];
                                }
                                temp[component.rowData] = '-';
                                processedData[j]= temp;
                            }

                            var total = 0;
                            for(j in data[i].data){
                                var item= data[i].data[j][component.colName];
                                var index= $.inArray(item, colDataArray);
                                if (component.isTotal) {
                                    total += data[i].data[j][component.rowData];
                                }
                                var converted = countTableValue(data[i].data[j][component.rowData], component.unit);
                                
                                if(component.unit == 'count' || component.unit == 'percent')
                                    processedData[index][component.rowData]= converted.value+' '+ converted.unit;
                                else if(converted.value){
                                    processedData[index][component.rowData]= (converted.value).toFixed(globalConfig.defaultDecimal)+converted.unit;
                                }
                            }
                            if (component.isTotal) {
                                var isTotal = countTableValue(total, component.unit);
                                tempData['total'] = isTotal.value+' '+isTotal.unit;
                            }

                            tempData[component.rowName]= data[i][component.rowName];
                            tempData['data']= angular.copy(processedData);
                            processedExtdTableData.push(tempData);

                            if(i == data.length-1){
                                table.data = angular.copy(processedExtdTableData);
                                table['rawData']= data;
                                $scope.displaydata[component._id] = angular.copy(table);
                            }
                        }
                    })
                }
            }

            function buildColDataArray(component, data, cb){
                var colDataArray = []
                if(component.fixOrder){
                    var fixOrder = $scope.displaydata[component._id].fixOrder;
                    for(var i=0; i<data.length; i++){
                        for(var j in fixOrder){
                            var tmp = dbService.unique(data[i].data, component.colName, fixOrder[j].bktname)[0]
                            if(tmp){
                                if(i==($scope.currPage-1)*$scope.itemsPerPage)
                                    colDataArray[j]= tmp[component.colName]
                                else
                                    getColData(colDataArray, tmp[component.colName], component.colName);
                            }
                            else{
                                colDataArray[j] = fixOrder[j].bktname
                            }
                        }
                    }
                }
                else{
                    for(var i=0; i<data.length; i++){
                        for(var j in data[i].data){
                            if(i==($scope.currPage-1)*$scope.itemsPerPage){
                                colDataArray[j]= data[i].data[j][component.colName]; 
                            }
                            else{
                                getColData(colDataArray, data[i].data[j][component.colName], component.colName);
                            }        
                        }
                    }
                }
                cb(colDataArray)
            }

            function extendedReplaceData(component, data){
                var table = {
                    component:component,
                    indicatorData: [],
                    label:component.labels,
                    columns:[],
                    tempData:[],
                    origionalData:data,
                    data:{date: []},
                    updateTime:''
                }
                if(data.length > 0){
                    $scope.totalItems = data.length;
                    var label = [];
                    var tmpLen = null;
                    var tmpkey = null;
                    if(/data/.test(component.colName)){
                        component.colName= component.colName.substring(5);
                    }
                    if(/data/.test(component.rowData))
                        component.rowData= component.rowData.substring(5);

                    if(/data/.test(component.rowName))
                        component.rowName = component.rowName.substring(5);

                    var colDataArray = [], processedExtdTableData = [];
                    // console.log(component.rowName, component.rowData, data[0])
                    var rowLength = (data[0].data) ?  data[0].data.length : 0;
                    // var keysTopModelArray = _.keys(data[0].data[0]);
                    var ObjArray = data
                    var keysTopModelArray = [];
                    if ( data[0].data && data[0].data.length > 0){
                        for(z in data[0].data[0]){
                            if(z == component.rowName || z == component.rowData)
                                keysTopModelArray.push(z)
                        }
                    }
                    table.colSpan = keysTopModelArray.length

                    // console.log(keysTopModelArray)

                    var keysModifiedArray= [], index= -1, tableData= [];
                    for(var i in data){
                        for(var j in keysTopModelArray)
                            keysModifiedArray[++index]= keysTopModelArray[j];
                    }
                    table.colHeader= angular.copy(keysModifiedArray);

                    for(var i=0; i<rowLength; i++){
                        var index= -1, tabData= [];
                        for(var j in data){
                            if(data[j].data.length == rowLength){
                                for(var l in keysTopModelArray){
                                    if(keysTopModelArray[l] == component.rowData){
                                        var extendedTabData= countUnit(component, data[j].data[i][keysTopModelArray[l]]);
                                        tabData[++index]= extendedTabData.value+extendedTabData.unit;//dataFormatter.formatUsageData(data[j].data[i][keysTopModelArray[l]],2);
                                    }
                                    else
                                        tabData[++index]= data[j].data[i][keysTopModelArray[l]];
                                }
                            }
                            else{
                                if(angular.isDefined(ObjArray[j].data[i])){
                                    for(var l in keysTopModelArray){
                                        if(keysTopModelArray[l] == component.rowData){
                                        var extendedTabData= countUnit(component, data[j].data[i][keysTopModelArray[l]]);
                                        tabData[++index]= extendedTabData.value+extendedTabData.unit;//dataFormatter.formatUsageData(data[j].data[i][keysTopModelArray[l]],2);
                                    }
                                        else
                                            tabData[++index]= data[j].data[i][keysTopModelArray[l]];
                                    }
                                }
                                else{
                                    for(var l in keysTopModelArray)
                                        tabData[++index]= '-';
                                }
                            }
                        }
                        tableData[i]= angular.copy(tabData);
                    }
                    table.keysTopModel= angular.copy(tableData);
                    table.topModelsObj= angular.copy(data);

                    $scope.displaydata[component._id] = angular.copy(table)
                    // console.log('table', table)
                }
            }

        //table
            function subscribeTable(component){
                var options = {
                    paging: (component.paging) ? true : false,
                    searching: (component.searching) ? true: false,
                    bSort: (component.sort) ? true : false,
                    bInfo: (component.info) ? true : false,
                    bLengthChange: (component.length) ? true : false
                }
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
                }

                if(component.fixOrder){
                    var collection;
                    if(component.labels.trim() == 'Latency')
                        collection = 'lku_firstbytelatency_buckets'
                    else if('ResolutionBucket' == component.labels.trim())
                        collection = 'lku_dns_resolution_buckets'
                    else if('CEI' == component.labels.trim())
                        collection = 'lku_cei_buckets'
                    else if('UsageBucket' == component.labels.trim())
                        collection = 'lku_usage_buckets'
                    else if(component.labels.trim() == 'LastSeen')
                        collection = 'lku_lastseen_buckets'

                    var url = dbService.makeUrl({collection: collection, op:'select'});
                    httpService.get(url+'&db=datadb').success(function(res){
                        // console.log('lku__bkt', res)
                        res = res.sort(function(a, b){
                            return a.rank - b.rank
                        })
                        // console.log(res)
                        $scope.displaydata[component._id].fixOrder = res
                    })
                }

                angular.forEach(component.columns, function(value, key){
                    var tmpobj = {field: value.name, title:value.name, show:true};
                    if(angular.isDefined(value.updownreference))
                        tmpobj.updownreference = value.updownreference;
                    $scope.displaydata[component._id].columns.push(tmpobj);
                })

                if( component.data != 'DBPull'){
                    // console.log(component.title, component)
                    var url = dbService.snapshotUrl({op:'select', id: component.query, limit: 1});
                    httpService.get(url).then(function(res){
                        if(res.data == 'null' || res.data == 'error' || res.data.length == 0)
                            $scope.displaydata[component._id].loader = false;
                        else
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
                    tableData.updateTime = globalConfig.updateTime();
                }
                tableSpliceRow(component);
            }

            function processTableReplaceData(component, data1){
                var tbl = $scope.displaydata[component._id]
                //console.log("component", component);
                var data = []
                if(data1.length > 0){
                    if(component.fixOrder){
                        for(var z in tbl.fixOrder){
                            var col = tbl.fixOrder[z]
                            var isVal = dbService.unique(data1, component.labels, col.bktname)[0]
                            if(isVal)
                                data.push(isVal)


                            if(z == tbl.fixOrder.length-1)
                                arrangeCol(component, data)
                        }
                    }
                    else
                        arrangeCol(component, data1)
                }
            }

            function arrangeCol(component, data){
                var tableData = {
                    component:component,
                    indicatorData: [],
                    label:component.labels,
                    columns:[],
                    tempData:[],
                    data:[],
                    dataIndex:[],
                    updateTime:'',
                    origionalData:data,
                    rowData: data
                }
                $scope.tblDataTimestemp = data[0]['Time'];
                    
                for (var i = 0; i<data.length; i++){
                    var dataobj={};
                    if(data[i][component.labels] != ''){
                        dataobj[component.labels] = {value: data[i][component.labels]};
                        angular.forEach(component.columns, function(val, key){
                            var tmpdata = {};
                            if(angular.isArray(data[i][val.name]))
                                data[i][val.name]= data[i][val.name].join(' , ');
                            tmpdata.value = (data[i][val.name]) ? data[i][val.name] : 0;
                            dataobj[val.name] = tmpdata;
                        });

                        //Check if key is exits in table
                        // console.log("tableData", tableData);
                        var keyindex = $.inArray( data[i][component.labels], tableData.dataIndex );
                        if(keyindex > -1)
                            tableData.tempData[keyindex] = angular.copy(dataobj);
                        else{
                            // tableData.dataIndex.push( data[i][component.labels] );
                            tableData.tempData.push(dataobj);
                        }
                    }

                    if(i == data.length-1)
                        tblIndicatorData(tableData, component);
                }
            }

            function tblIndicatorData(tableData, component){
                //console.log("indicator data component", component);
                if(angular.isDefined(component.indicator) && component.indicator.length > 0){
                    var dataMinofDay = timemsToMinofDay($scope.tblDataTimestemp);
                    var todayDate = $filter('date')( $scope.tblDataTimestemp,'MM-dd-yyyy' );
                    var url = dbService.snapshotUrl({collection: 'getmoduleindicatordata', op:'select', id: component.indicatorQuery, todayDate: todayDate, dataMinofDay: dataMinofDay});
                    httpService.get(url).then(function(res){
                        var indicatorData = res.data;
                        if( typeof indicatorData != 'string' && indicatorData.length > 0 ){
                            tableData.indicatorData = indicatorData.data;
                            tableSpliceRow(tableData, component);
                        }
                        else{
                            var u = globalConfig.pullfilterdataurl + component.indicatorQuery
                            // var u = globalConfig.pullIListener + component.query + '&day=1&offsethour=2&granularity=min'
                            // console.log('***********', u)
                            httpService.get(u).then(function(response){
                                var temp = [];
                                temp[0] = '';
                                var flag = false;
                                for(var i = 0; i<response.data.length; i++ ){
                                    var value = response.data[i];
                                    var tmpKey = timemsToMinofDay(value.Time);
                                    // console.log("tmpKey", tmpKey, value );
                                    
                                    if(temp[tmpKey] && angular.isArray(temp[tmpKey].data)){
                                        temp[tmpKey].data = temp[tmpKey].data.concat(value.data)
                                        // console.log("temp[tmpKey]", temp[tmpKey]);
                                    }
                                    else
                                        temp[tmpKey] = value;

                                    if(dataMinofDay == tmpKey  ){
                                        tableData.indicatorData = temp[tmpKey].data;
                                        flag = true;
                                    }
                                }
                                
                                // console.log('flag', flag);
                                if(flag){
                                    var tmpdata = {};
                                    tmpdata[todayDate] = temp;
                                    var req = {'id': component.indicatorQuery, 'data': tmpdata};
                                    var url = dbService.snapshotUrl({collection: 'setmoduleindicatordata', op:'setmoduleindicatordata'});
                                    httpService.post(url, req).then(function(res){
                                    //$http.post(globalConfig.snapshoturl +'setmoduleindicatordata', req).then(function(res){
                                        
                                    })
                                }
                                tableSpliceRow(tableData, component);
                            })
                        }
                    })
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
                                    val[v.name]['diffPCT'] = indicatorClass.diffPCT;
                                }
                                else{
                                    val[v.name]['indicator'] = '';
                                    val[v.name]['spanclass'] = '';
                                    val[v.name]['diffPCT'] = '';
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
                            else if(converted.value){
                                converted.value = parseFloat(converted.value).toFixed(component.dataDecimal[v.name]);
                            }

                            
                            val[v.name].value = (converted.unit) ? converted.value +' '+ converted.unit : converted.value;
                            // val[v.name].value = parseFloat(converted.value);
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
                $scope.displaydata[component._id].origionalData = angular.copy(tableData.origionalData);
                $timeout(function(){
                    console.log('table.data', tableData.data);
                    $scope.displaydata[component._id].data = tableData.data;
                }, 0.1);
                $scope.displaydata[component._id].updateTime = globalConfig.updateTime();
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
                var diffPCT = Math.abs( ((substr/oldValue)*100 ).toFixed(0)) + '%'
                substr = ((substr/oldValue) * 100).toFixed(2)
                percent = substr + '%';
                // console.log('substr', percent, substr)
                if(substr >= -0.50){
                    // percent = ((substr/oldValue) * 100).toFixed(2) + '%';
                    // percent = substr + '%';
                    indicator = 'fa fa-level-up';

                    spanclass = (danger == 'up') ? 'text-danger' : 'text-navy';
                }
                else if( substr < 0){
                    // percent = Math.abs( ((substr/oldValue) * 100).toFixed(2) )+ '%';
                    // percent = Math.abs( substr )+ '%';
                    indicator = 'fa fa-level-down';

                    spanclass = (danger == 'up') ? 'text-navy' : 'text-danger';
                }
                return ({percent: percent, indicator:indicator, spanclass:spanclass, diffPCT: diffPCT});
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
                    unit = 'bps';
                    if(newValue >= 1000 && newValue < 1000 * 1000){
                        newValue = (newValue / 1000);
                        unit = 'Kbps';
                    }
                    else if(newValue >= 1000*1000 && newValue < 1000 * 1000 * 1000){
                        newValue = (newValue / (1000*1000));
                        unit = 'Mbps';
                    }
                    else if(newValue > 1000*1000*1000){
                        newValue = (newValue / (1000*1000*1000));
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
        $scope.redirectToOtherPage = function(params, tmpcomponent){
            var component = angular.copy(tmpcomponent);
            if(component.type == 'ibox_with_embeded_chart'){
                component.clickable = component.clickableIbox
                component.page == component.pageIbox;
            }
            redirectToOtherPage(params, component);
        }

        function subscribeIBox(component){
            if(typeof $scope.displaydata[component._id] === 'undefined'){
                $scope.displaydata[component._id] = {
                    component:component,
                    loader:true,
                    kpi: null,
                    kpiIndicator:'',
                    kpiindicatordatahistory:[],
                    spanclass:'',
                    updateTime: ''
                };
            }
            if(component.indicatortype == 'bolt') $scope.displaydata[component._id].spanclass='fa fa-bolt';

            if( component.data != 'DBPull' ){
                var url = dbService.snapshotUrl({op:'select', id: component.query, limit:1});
                httpService.get(url).then(function(res){
                    $scope.displaydata[component._id].loader = false
                    processIBoxSnapshotData(component,res.data)
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        if( angular.isArray(data.event) )
                            processIBoxSnapshotData(component, data.event)
                        else
                            processIBoxData(component, data.event)
                        $scope.$apply()
                    })
                })
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
                            $scope.displaydata[component._id].updateTime2 = globalConfig.updateTime();

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
                                $scope.displaydata[component._id].updateTime2 = globalConfig.updateTime();

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
                        // console.log('>>>>>>>>>> ibox 2',res.data);
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
                                    $scope.displaydata[component._id].updateTime2 = globalConfig.updateTime();

                                    if(component.indicator2)
                                        getAndSetIndicatorIboxData2(component, res.data[index], component.kpi2);
                                }
                            }
                        })
                    })
                }
            }

            if(component.gauge){
                var options = {
                    readOnly: true,
                    max: component.gauge.max
                }
                component.gauge._id = component._id;
                component.gauge.type = 'ibox_gauge';
                $scope.displaydata[component._id].gauge = {data : 0, loader: true, options: options};

                if( component.gauge.data != 'DBPull' ){
                    var url = dbService.snapshotUrl({op:'select', id: component.gauge.query, limit:1});
                    httpService.get(url).success(function(res){
                        if(res.length > 0) {
                            $scope.displaydata[component._id].gauge.loader = false;

                            if(component.gauge.plotKey && component.gauge.plotKey != ''){
                                var obj = dbService.unique(res, component.gauge.plotKey, component.gauge.plotValue)[0];
                                if(obj) processGauge(component.gauge, obj);
                            }
                            else
                                processGauge(component.gauge, res[0])
                        }
                        socket.subscribe(component.gauge.query, function(res){
                            var tmp = JSON.parse(res);
                            var data = tmp[component.gauge.query];
                            if(angular.isArray(data.event) && component.gauge.plotKey && component.gauge.plotKey != ''){
                                var obj = dbService.unique(data.event, component.gauge.plotKey, component.gauge.plotValue)[0];
                                if(obj) processGauge(component.gauge, obj);
                            }
                            else{
                                if(angular.isArray(data.event))
                                    processGauge(component.gauge, data.event[data.event.length-1]);
                                else
                                    processGauge(component.gauge, data.event);
                            }
                            $scope.$apply()
                        })
                    })
                }
                else{
                    var fields = JSON.stringify(["type", "statementId", "eventPublish", "dataSource", 'dbPullType', 'name']);
                    var query = JSON.stringify({'statementId': component.gauge.query});
                    var params = 'query=' + encodeURIComponent(query) +'&fields='+encodeURIComponent(fields);
                    var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
                    httpService.get(url).then(function(res){
                        component.gauge.statement = res.data[0]
                        setTimeInterval(component.gauge)
                    })
                }
            }
        }

        function processIBoxSnapshotData(component, data){
            if(data != 'error'){
                if(component.plotKey && component.plotKey != ''){
                    var obj = dbService.unique(data, component.plotKey, component.plotValue)[0];
                    if(obj) processIBoxData(component, obj);
                }
                else
                    processIBoxData(component, data[data.length-1]);
            }
        }

        function processIBoxData(component, data){
            console.log("data", data);
            if(data[component.kpi] == undefined) return
            var iboxData = $scope.displaydata[component._id];
            if(component.unit == 'percent'){
                iboxData.kpi = (component.dataDecimal) ? (data[component.kpi]).toFixed(component.dataDecimal) : data[component.kpi];
                iboxData.unit = '%';
            }
            else{
                console.log("data[component.kpi]", data[component.kpi]);
                var newValue = countIBoxUnit( component, data[component.kpi] );
                 console.log(newValue, data[component.kpi])
                iboxData.kpi = newValue.value;
                iboxData.unit = newValue.unit;
            }
            iboxData.updateTime = globalConfig.updateTime();

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
                    unit = 'bps';
                    if(newValue >= 1000 && newValue < 1000 * 1000){
                        newValue = newValue / 1000;
                        unit = 'Kbps';
                    }
                    else if(newValue >= 1000*1000 && newValue < 1000 * 1000 * 1000){
                        newValue = newValue / (1000*1000);
                        unit = 'Mbps';
                    }
                    else if(newValue > 1000*1000*1000){
                        newValue = newValue / (1000*1000*1000);
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
            /*else{
                if(component.unit == 'usage'){
                    newValue = newValue / Math.pow(2, 20);
                    unit = 'MB';
                }
                else if( component.unit == 'speed'){
                    newValue = newValue / Math.pow(2, 10);
                    unit = 'Kbps';   
                }
            }*/

            return( {'value': toFixedValue(component, newValue), 'unit': unit} );
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
                    unit = 'bps';
                    if(newValue >= 1000 && newValue < 1000 * 1000){
                        newValue = newValue / 1000;
                        unit = 'Kbps';
                    }
                    else if(newValue >= 1000*1000 && newValue < 1000 * 1000 * 1000){
                        newValue = newValue / (1000*1000);
                        unit = 'Mbps';
                    }
                    else if(newValue > 1000*1000*1000){
                        newValue = newValue / (1000*1000*1000);
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
            /*}
            else{
                if(component.unit2 == 'usage'){
                    newValue = newValue / Math.pow(2, 20);
                    unit = 'MB';
                }
                else if( component.unit2 == 'speed'){
                    newValue = newValue / Math.pow(2, 10);
                    unit = 'Kbps';   
                }
            }*/
            return( {'value': toFixedValue(component, newValue), 'unit': unit} );
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
            
            console.log(component.title, component)
            var options = {
                readOnly: true,
                max: component.max,
                min:0,
                font: 'bold 13px Arial'
            }

            $scope.displaydata[component._id] = {
                component  :component,
                loader     :true,
                options    : options,
                multiData : [],
                data       : 0,
                width      : (component.width == 3) ? 100 : 200,
                // options    :{max: Number(component.max), min:0, fontWeight: 'normal'},
                updateTime : '',
            }

            if(component.type == 'multi_gauge' || component.type == 'progress_bar'){
                var url = dbService.makeUrl({collection: 'lku_node', op:'select'})
                
                httpService.get(url+'&db=datadb').success(function(res){
                    console.log("multiGuage response  ", res)

                    $scope.displaydata[component._id].plotData = dbService.unique(res, 'AutoPlot', 1)
                });
            }

            if( component.data != 'DBPull' ){
                var url = dbService.snapshotUrl({op:'select', id: component.query, limit: 1});

                httpService.get(url).then(function(res){
                    // if(res.data.length == 0)
                         $scope.displaydata[component._id].loader = false;

                    gaugeSnapshotData(component, res.data);
                    socket.subscribe(component.query, function(res){
                        var tmp = JSON.parse(res);
                        var data = tmp[component.query];
                        data = data.event
                        if(component.type == 'progress_bar' && component.plotKey && component.plotKey != ''){
                            if(component.plotValue && component.plotValue != ''){
                                var obj = dbService.unique(data, component.plotKey, component.plotValue)[0];
                                if(obj) processGauge(component, obj)
                            }
                            else
                                multiGaugeProcess(component, data)
                        }
                        else if(component.type == 'multi_gauge'){
                            delete $scope.displaydata[component._id].options.max
                            multiGaugeProcess(component, data)
                        }
                        else{
                            if(angular.isArray(data) && component.plot == 'Combined'){
                                var obj = dbService.unique(data, component.plotKey, component.plotValue)[0];
                                if(obj) processGauge(component, obj)
                            }
                            else{
                                if(angular.isArray(data))
                                    processGauge(component, data[data.length-1])
                                else
                                    processGauge(component, data)
                            }
                        }
                        $scope.$apply();
                    });
                });


                // httpService.get(url2).then(function(res){

                //     console.log("secondQUeryData " , res.data)

                // });
            }
            else
                setTimeInterval(component);
        }

        function gaugeSnapshotData(component, data){
            console.log(component.title, ' -->', data)
            // console.log('plotKey', component.plotKey, component.plotValue)
            if(component.type == 'progress_bar' && component.plotKey && component.plotKey != ''){
                // console.log('plotKey', component.plotKey, component.plotValue)
                if(component.plotValue && component.plotValue != ''){
                    var obj = dbService.unique(data, component.plotKey, component.plotValue)[0];
                    if(obj) processGauge(component, obj);
                }
                else
                    multiGaugeProcess(component, data);
            }
            else if(component.type == 'multi_gauge'){
                delete $scope.displaydata[component._id].options.max;
                multiGaugeProcess(component, data);
            }
            else{
                if(data != 'error'){
                    if(component.plot == 'Combined'){
                        var obj = dbService.unique(data, component.plotKey, component.plotValue)[0];
                        // console.log(obj)
                        if(obj) processGauge(component, obj);
                    }
                    else
                        processGauge(component, data[data.length-1]);
                    /*for(var index = 0; index < data.length; index++){
                        processGauge(component, data[index]);
                    }*/
                }
            }
            /*processGauge(component, {Visits: 48});

            $interval(function(){
                var min = Math.ceil(15);
                var max = Math.floor(60);
                var rand =  Math.floor(Math.random() * (max - min)) + min;
                // rand = rand/1000;
                processGauge(component, {Visits: rand});
            }, 2000);*/
        }

        function processGauge(component, data){
            if(component.type == 'ibox_gauge')
                var gauge = $scope.displaydata[component._id].gauge;
            else
                var gauge = $scope.displaydata[component._id];

            var tmp = gaugeData(component, data);
            gauge.data = tmp.gaugedata || 0;
            gauge.unit = tmp.gaugeunit;

            // console.log('gauge --->>>>',  gauge);
            gauge.updateTime = globalConfig.updateTime();
            
            if(component.type == 'ibox_gauge')
                return gauge;
            else{
                gauge.multiData.push({
                    value     : Number(gauge.data),
                    unit      : gauge.unit,
                    title     : null,
                    max       : gauge.options.max,
                    threshold1: component.threshold1,
                    threshold2: component.threshold2
                })
            }
        }

        function gaugeData(component, data){
            var gaugedata = 0;
            var gaugeunit = '';
            if( component.unit == 'speed' ){
                if( component.unit2 == 'Kbps' ){
                    gaugedata = Number( data[component.kpi] / Math.pow(10,3) );
                    gaugeunit = 'Kbps';
                }
                else if( component.unit2 == 'Mbps' ){
                    gaugedata = Number((data[component.kpi] / Math.pow(10,6)) );
                    gaugeunit = 'Mbps';
                }
                else if( component.unit2 == 'Gbps' ){
                    gaugedata = Number((data[component.kpi] / Math.pow(10,9))  );
                    gaugeunit = 'Gbps';
                }
            }
            else if( component.unit == 'usage' ){
                if( component.unit2 == 'KB' ){
                    gaugedata = Number((data[component.kpi] / Math.pow(2, 10))  );
                    gaugeunit = 'KB';
                }
                else if( component.unit2 == 'MB' ){
                    gaugedata = Number((data[component.kpi] / Math.pow(2, 20)) );
                    gaugeunit = 'MB';
                }
                else if( component.unit2 == 'GB' ){
                    gaugedata = Number( (data[component.kpi] / Math.pow(2, 30)) );
                    gaugeunit = 'GB';
                }
                if(gaugedata % 1 != 0 )
                    gaugedata = (component.dataDecimal || component.dataDecimal == 0) ? gaugedata.toFixed(component.dataDecimal) : value.toFixed(globalConfig.defaultDecimal);
            }
            else{
                var newValue = countUnit(component, data[component.kpi]);
                if(newValue.value){
                    gaugedata = newValue.value;
                    gaugeunit = newValue.unit;
                }
            }

            return({gaugedata: gaugedata, gaugeunit: gaugeunit});
        }

        function multiGaugeProcess(component, data){
            $scope.ArrayList ;
            if (component.query2!=null){
                var url2 = globalConfig.pullfilterdataurl+component.query2
                
                httpService.get(url2).then(function(res){
                        // Second Query Response

                        var listObj  = res.data

                        console.log("seconds Query Response ",res.data)

                            var gauge = $scope.displaydata[component._id]
                            var columnName = component.kpi_2
                            gauge.multiData = []
                            // component.kpi = 'TotalUsage'
                            var plotData = gauge.plotData

                        for(var i in plotData){
                             var test = dbService.unique(data, component.plotKey, plotData[i].Node)[0];
                                if(test){
                                     var tmp = gaugeData(component, test);
                                     gauge.options.max = convertToKBMBGB(component, plotData[i].capacity, tmp.gaugeunit);
                                     var pct = (100* Number(tmp.gaugedata)) / gauge.options.max
                                     pct = pct.toFixed(1)
                                     gauge.multiData.push({
                                     options   : gauge.options,
                                     value     : Number(tmp.gaugedata),
                                     unit      : tmp.gaugeunit,
                                     title     : plotData[i].Node ,
                                     area      : res.data[i][columnName],
                                     pct       : pct,
                                     max       : convertToKBMBGB(component, plotData[i].capacity, tmp.gaugeunit),
                                     threshold1: convertToKBMBGB(component, plotData[i].threshold1, tmp.gaugeunit),
                                     threshold2: convertToKBMBGB(component, plotData[i].threshold2, tmp.gaugeunit)
                                })
                        }
                    }
                        console.log(gauge)
                        gauge.updateTime = globalConfig.updateTime()
                    
                    
                    
                 });
          }
          else{

            var gauge = $scope.displaydata[component._id]
            gauge.multiData = []
            // component.kpi = 'TotalUsage'
            var plotData = gauge.plotData

            for(var i in plotData){
                var test = dbService.unique(data, component.plotKey, plotData[i].Node)[0];
                if(test){
                    var tmp = gaugeData(component, test);
                    gauge.options.max = convertToKBMBGB(component, plotData[i].capacity, tmp.gaugeunit);
                    var pct = (100* Number(tmp.gaugedata)) / gauge.options.max
                    var area = text_truncate(plotData[i].Area)
                    var completename = plotData[i].Area
                    pct = pct.toFixed(1)
                    gauge.multiData.push({
                        options   : gauge.options,
                        value     : Number(tmp.gaugedata),
                        unit      : tmp.gaugeunit,
                        title     : plotData[i].Node , //+ " ---------" + plotData[i].Area,
                        area      : area,
                        pct       : pct,
                        completename :completename, 
                        max       : convertToKBMBGB(component, plotData[i].capacity, tmp.gaugeunit),
                        threshold1: convertToKBMBGB(component, plotData[i].threshold1, tmp.gaugeunit),
                        threshold2: convertToKBMBGB(component, plotData[i].threshold2, tmp.gaugeunit)
                    })
                }
            }
            console.log(gauge)
            gauge.updateTime = globalConfig.updateTime()

          }
            
        }

        function convertToKBMBGB(component, value, unit){
            if(unit == 'KB')
                value = value / Math.pow(2, 10)
            else if(unit == 'MB')
                value = value / Math.pow(2, 20)
            else if(unit == 'GB')
                value = value / Math.pow(2, 30)

            return toFixedValue(component, value)
        }
    /*End Gauge*/

    /*Flot Chart*/
        //For Pie Chart
            function subscribeFlotPieChart(component){
                console.log(component.chartOptions);
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
                        console.log('params',params);
                        redirectToOtherPage(params, component);
                    });
                }, 1000);
            }

            function snapshotPieFlot(component, data){
                var type = $scope.displaydata[component._id].statement.type;
                console.log('flot pie-> ' + component.title +' == '+ type);
                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

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
                chartData.updateTime = globalConfig.updateTime();
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
                chartData.updateTime = globalConfig.updateTime();
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
                chartData.updateTime = globalConfig.updateTime();
            }

            function pieFlotReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.dataset = [];
                    chartData.tempData = [];
                    chartData.labeldata = [];
                }
                
                _.forEach(data1, function(data, key){
                    if( angular.isDefined(component.labelType) && component.labelType == 'time' && component.data != 'DBPull')
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
                chartData.updateTime = globalConfig.updateTime();
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
                        val = getConvertedVal(component, val, converted.unit);
                        chartData.dataset[i].data = val;
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

                if(component.plotKey && component.plotKey != '')
                    data = dbService.unique(data, component.plotKey, component.plotValue);

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
                chartData.updateTime = globalConfig.updateTime();
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
                        val = getConvertedVal(component, val, converted.unit);
                        chartData.dataset[seriesCount].data[i][1] = val;
                    }
                }
            }

            function barFlotReplaceData(component, data1){
                var chartData = $scope.displaydata[component._id];
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
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
                    if( angular.isDefined(component.labelType) && component.labelType == 'time' && component.data != 'DBPull')
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
                                
                                chartData.updateTime = globalConfig.updateTime();
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
                if(converted.unit && component.yAxislabel)
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel + '('+ converted.unit + ')' : converted.unit;
                else
                    chartData.options.options.yAxis.title.text = (component.yAxislabel) ? component.yAxislabel : converted.unit;
                chartData.options.xaxis.ticks = chartData.ticks;

                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    for(var i = 0; i < chartData.tempData[seriesCount].data.length; i++) {
                        var val = chartData.tempData[seriesCount].data[i][1];
                        val = getConvertedVal(component, val, converted.unit);
                        chartData.dataset[seriesCount].data[i][1] = val;
                    }
                }
            }

        //For Line chart
            function subscribeFlotChart(component){
                var deci = globalConfig.defaultDecimal;
                if(component.chartUnitAdjustFlag == 'yes')
                    component.chartOptions.tooltipOpts.content = "x: %x - y: %y."+deci;
                else
                    component.chartOptions.tooltipOpts.content = "x: %x - y: %y";

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

                // $scope.displaydata[component._id].options.tooltipOpts = {content : getFlotTooltip};
                for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                    var color = (component.lineColor) ? component.lineColor[component.series[seriesCount]] : null;
                    if(color) $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[], color: color } );
                    else  $scope.displaydata[component._id].dataset.push( {'label': component.series[seriesCount], data:[]} );

                    $scope.displaydata[component._id].tempData.push( [] );
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
                // processFlotChartMultiSeriesMovingData(component, data);
                // return;
                console.log('flot -> ' + component.title +' == '+ type);
                if( type === 'replace') processFlotChartMultiSeriesReplaceData(component, data);
                else if(type === 'moving') processFlotChartMultiSeriesMovingData(component, data);
                else{
                    for(var index = 0; index < data.length; index++){
                        if( type === 'refresh' )
                            processFlotChartMultiSeriesUpsertData(component, data[index]);
                        else if( type === 'update' )
                            processFlotChartMultiSeriesUpdateData(component, data[index]);
                    }
                }
            }

            function processFlotChartMultiSeriesReplaceData(component, data1){
                $scope.displaydata[component._id].origionalData = angular.copy(data1);
                if(component.statement.type == 'replace')
                    data1 = data1.splice(0, component.dataelement);
                var chartData = $scope.displaydata[component._id];
                if( (angular.isDefined(chartData.statement) && chartData.statement.eventPublish == 'Combined') || component.data == 'DBPull' ){
                    chartData.labeldata = [];
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++){
                        chartData.dataset[seriesCount].data = [];
                        chartData.tempData[seriesCount] = [];
                    }
                }

                if(Array.isArray(data1)){
                    for(var index = 0; index < data1.length; index++){
                        processFlotData(component, data1[index]);

                        if(index == data1.length-1)
                            checkCondition(component, data1[index]);
                    }
                }
                else{
                    // console.log(data1);
                    processFlotData(component, data1);
                    checkCondition(component, data1);
                }
            }

            function processFlotData(component, data){
                var chartData = $scope.displaydata[component._id];
                if( angular.isDefined(component.labelType) && component.labelType == 'time' && component.data != 'DBPull')
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1){
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.dataset[seriesCount].data[keyindex] = ( [ label, data[component.series[seriesCount]] ] );
                        chartData.tempData[seriesCount][keyindex] = ( data[component.series[seriesCount]] );
                    }
                }
                else{
                    chartData.labeldata.push( label );
                    for(var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        chartData.dataset[seriesCount].data.push( [ label, data[component.series[seriesCount]] ] );
                        chartData.tempData[seriesCount].push( data[component.series[seriesCount]] );
                    }
                }
            }

            function checkCondition(component, data){
                var chartData = $scope.displaydata[component._id];
                if(chartData.labeldata.length > component.dataelement){
                    if(component.statement.type == 'moving'){
                        chartData.labeldata.shift();
                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            chartData.dataset[seriesCount].data.shift();
                            chartData.tempData[seriesCount].shift();
                        }
                        var converted = countChartValue( component, data[component.series[0]] );
                        //change value to KB/MB/GB
                        changeValueFlowChart( component, 0, converted );
                    }
                    else if(component.statement.type == 'replace'){
                        chartData.labeldata = chartData.labeldata.splice(0, component.dataelement);
                        for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                            chartData.dataset[seriesCount].data = chartData.dataset[seriesCount].data.splice(0, component.dataelement);
                            chartData.tempData[seriesCount] = chartData.tempData[seriesCount].splice(0, component.dataelement);
                        }
                    }
                }
                chnageTickLen(component, chartData.labeldata);

                /*if( component.series.length == 1 ){
                    var converted = countChartValue( component, data[component.series[0]] );
                    //change value to KB/MB/GB
                    changeValueFlowChart( component, 0, converted );
                }
                else{*/
                    var maxArr = [];
                    for (var i = 0; i < component.series.length; i++) {
                        var maxVal = Math.max.apply(null, chartData.tempData[i]);
                        maxArr.push(maxVal);

                        if(i == component.series.length-1){
                            var maxVal = Math.max.apply(null, maxArr);
                            var converted = countChartValue( component, maxVal );
                            changeMultiValueFlowChart( component, converted );
                        }
                    }
                //}
                chartData.updateTime = globalConfig.updateTime();
                // console.log('Flot chart ', chartData.updateTime, component)
            }

            function processFlotChartMultiSeriesMovingData(component, data1){
                // console.log(typeof data1,  data1.constructor, Array.isArray(data1));
                
                var chartData = $scope.displaydata[component._id];
                if(Array.isArray(data1)){
                    for(var index = 0; index < data1.length; index++){
                        processFlotData(component, data1[index]);

                        if(index == data1.length-1)
                            checkCondition(component, data1[index]);
                    }
                }
                else{
                    processFlotData(component, data1);
                    checkCondition(component, data1);
                }
                return;
                /*if( angular.isDefined(component.labelType) && component.labelType == 'time' )
                    var label = data[component.labels] + globalConfig.tzAdjustment;
                else
                    var label = data[component.labels];

                var keyindex = $.inArray( label, chartData.labeldata );
                if( keyindex > -1){
                    chartData.labeldata[keyindex] = label;
                    for (var seriesCount = 0; seriesCount < component.series.length; seriesCount++) {
                        if( data[component.series[seriesCount]] ){
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
                }*/
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
                            chartData.updateTime = globalConfig.updateTime();
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
                chartData.updateTime = globalConfig.updateTime();
            }

            function chnageTickLen(component, labelData){
                var dataLen= labelData.length;
                var chartData = $scope.displaydata[component._id];
                var maxTick= (component.width*1.2).toFixed(0);
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
                var chrtUnit= component.chartUnit;
                
                if(angular.isDefined(component.plotFor))
                    if(component.plotFor == 'line')
                        chrtUnit= component.lineUnit;
                
                // console.log("chrtUnit", chrtUnit);

                var unit = '';
                /*if(component.chartUnitAdjustFlag == 'yes'){
                    if(component.chartUnit == 'usage'){
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
                    else if(component.chartUnit == 'speed'){
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
                    else if(component.chartUnit == 'count'){
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
                    if(component.chartUnit == 'usage'){
                        newValue = newValue / Math.pow(2, 20);
                        unit = 'MB';
                    }
                    else if( component.chartUnit == 'speed'){
                        newValue = newValue / Math.pow(2, 10);
                        unit = 'Kbps';   
                    }
                }
                return( {'value': newValue, 'unit': unit} );*/

                if( component.chartUnitAdjustFlag == 'yes' ){
                    // console.log("component Chart Unit", component);
                    // if(component.chartUnit == 'usage' ){
                    if(chrtUnit == 'usage' ){
                        unit = 'Bytes';
                        if(newValue >= 10*1024*1024*1024*1024){
                            newValue = ( newValue/(1024*1024*1024*1024) );
                            unit = 'TB';
                        }
                        else if(newValue >= 10*1024*1024*1024){
                            newValue = ( newValue/(1024*1024*1024) );
                            unit = 'GB';
                        }
                        else if (newValue >= 10*1024*1024){
                            newValue = ( newValue/(1024*1024) );
                            unit = 'MB';
                        }
                        else if (newValue >= 10*1024){
                            newValue = ( newValue/1024 );
                            unit = 'KB';
                        }
                    }
                    // else if(component.chartUnit == 'speed' ){
                    else if(chrtUnit == 'speed' ){
                        unit = 'bps';
                        if( newValue > 1000){
                            var datamb = ( newValue/1000 );
                            if( datamb > 1000 ){
                                var datagb = ( datamb/1000 );
                                if( datagb > 1000 ){
                                    var datatb = ( datagb/1000 );
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
                    // else if(component.chartUnit == 'count' ){
                    else if(chrtUnit == 'count' ){
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
                if(angular.isDefined(component.plotFor))
                    delete component.plotFor;
                return( {'value' : toFixedValue(component, newValue), 'unit': unit} );
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
                
                for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                    var val = chartData.tempData[seriesCount][i];
                    val = getConvertedVal(component, val, unitFinal);
                    chartData.dataset[seriesCount].data[i][1] = val;
                }
            }

            function changeMultiValueFlowChart( component, converted ){
                var chartData = $scope.displaydata[component._id];
                chartData.options.yaxis.axisLabel = converted.unit;
                _.forEach(component.series, function(value, seriesCount){
                    for(var i = 0; i < chartData.tempData[seriesCount].length; i++) {
                        // var val = chartData.tempData[seriesCount].data[i][1];
                        var val = chartData.tempData[seriesCount][i];
                        val = getConvertedVal(component, val, converted.unit);
                        chartData.dataset[seriesCount].data[i][1] = val;
                    }
                });
            }
    /*End Flot Chart*/

    function countUnit(component, value){
        var newValue = value;
        var unit = '';
        
        if( component.unit == 'usage' || component.chartUnit == 'Usage' || component.chartUnit == 'usage'){
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
        else if( component.unit == 'speed' || component.chartUnit == 'speed'){
            unit = 'bps';
            if( newValue > 1000){
                var datamb = ( newValue/1000 );
                if( datamb > 1000 ){
                    var datagb = ( datamb/1000 );
                    if( datagb > 1000 ){
                        var datatb = ( datagb/1000 );
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
        else if( component.unit == 'count' || component.chartUnit == 'count'){
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
        return({value: toFixedValue(component, newValue), unit: unit});
    }

    function getOption(options){
        var test = options;
        var test1 = test.replace(/(\r\n|\n|\r)/gm,"");
        var test2 = test1.replace(/\s+/g," ");
        //console.log(test2);
        var options = jQuery.parseJSON( test2 );
        return options;
    }

    function getConvertedVal(component, val, unit){
        if( unit == "KB" )
            val = val / Math.pow(2, 10);
        else if( unit == "MB" )
            val = val / Math.pow(2, 20);
        else if( unit == "GB" )
            val = val / Math.pow(2, 30);
        else if( unit == "TB" )
            val = val / Math.pow(2, 40);
        else if( unit == "Kbps" )
            val = val / 1000;
        else if( unit == "Mbps" )
            val = (val / 1000) / 1000;
        else if( unit == "Gbps" )
            val = ( (val / 1000) / 1000 ) /1000;
        else if( unit == 'K' )
            val = val / 1000;
        else if( unit == 'MN' )
            val = (val / 1000) / 1000;

        if(val % 1 === 0){
            // int
        } else{
            // val = (val) ? parseFloat(val).toFixed(1) : '';
        }
        return Number( toFixedValue(component, val) );
    }

    function redirectToOtherPage(params, component){
        console.log("params",params);
        console.log("component",component);
        params.returnPath= $location.path();

        var from = $scope.date.start+'T00:00:00.000Z';
        var to = $scope.date.end+'T23:59:59.999Z';
        params.fromDate= params.fromDate || $scope.date.start;
        params.toDate = params.toDate || $scope.date.end;

        if($scope.filter.planSelected){
            params["planName"] = $scope.filter.planSelected;
        }

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
            console.log(component.page);
            var page = component.page.split("|");
            var id = page[0];
            var table = page[1];
            
            var query = '{_id: ObjectId("'+ id +'")}';
            var test = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: table, op:'select', params: test});

            httpService.get(url).then(function(res){
                var res = res.data;
                if(res.length > 0) res = res[0];
                else{
                    swal('Error', 'Page not found', 'error');
                    return;
                }

                params.clickableTooltip = component.clickableTooltip;
                params.pageHeading = component.title;
                console.log('test ', table, params);

                if($stateParams.paramsArray)
                        for(var i in $stateParams.paramsArray)
                            $scope.paramsArray.push($stateParams.paramsArray[i]);  
                    $scope.paramsArray.push(params);

                if(angular.isDefined(res.file) && res.type == 'static' ){
                    
                    if(table == 'analysis')
                        $state.go('index.staticanalysis',{'id': id , 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                    else if(table == 'report')
                        $state.go('index.staticreport',{'id': id, 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                    else if(table == 'dashboards'){
                        console.log("param array value ",$scope.paramsArray)
                        $state.go('index.dashboards',{'id': id, 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                    }
                        
                }
                else{
                    var name = res.name.split('.');
                    var name = name[0];
                    
                    if(table == 'analysis')
                        $state.go('index.analysis',{'id': id, 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                    else if(table == 'report')
                        $state.go('index.reports',{'id': id, 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                    else if(table == 'dashboards')
                        $state.go('index.dashboards',{'id': id, 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                    else if( table == 'redirectionoption'){
                        if(res.page == 'dashboard')
                            $state.go('index.dashboards',{'name': name, 'file': res.name, 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                        else if(res.page == 'report')
                            $state.go('index.staticreport',{'name': name, 'file': res.name, 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                        else{
                            $state.go('index.staticanalysis',{'name':name, 'file': res.name, 'params': params, 'filterParams': filterParams, 'paramsArray':$scope.paramsArray});
                        }
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
                        
                        if( temp[tmpKey] && angular.isObject(temp[tmpKey]) ){
                            temp[tmpKey] = angular.extend(temp[tmpKey], value)
                        }
                        else
                            temp[tmpKey] = value;

                        if(dataMinofDay == tmpKey){
                            if(kpi){
                                oldValue = temp[tmpKey][kpi];
                                flag = true;
                            }
                        }
                    }
                    if(flag){
                        var indicatorData = temp;
                        var tmpdata = {};
                        tmpdata[todayDate] = indicatorData;
                        var req = {'id': component.indicatorQuery, 'data': tmpdata};
                        var url = dbService.snapshotUrl({collection: 'setmoduleindicatordata', op:'setmoduleindicatordata'});
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
                        
                        if( temp[tmpKey] && angular.isObject(temp[tmpKey]) ){
                            temp[tmpKey] = angular.extend(temp[tmpKey], value)
                        }
                        else
                            temp[tmpKey] = value;

                        if(dataMinofDay == tmpKey){
                            if(kpi2){
                                oldValue = temp[tmpKey][kpi2];
                                flag = true;
                            }
                        }
                    }
                    if(flag){
                        var indicatorData = temp;
                        var tmpdata = {};
                        tmpdata[todayDate] = indicatorData;
                        var req = {'id': component.indicatorQuery2, 'data': tmpdata};
                        var url = dbService.snapshotUrl({collection: 'setmoduleindicatordata', op:'setmoduleindicatordata'});
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
        if(substr >= 0){
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
        var oldValue = (oldValue) ? oldValue : 1;
        var substr =  newValue - oldValue;
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

    function toFixedValue(component, value){
        // console.log(value && value % 1 != 0, component)
        if(value && value % 1 != 0){
            // if( (component.unitAdjustFlag == 'yes' || component.chartUnitAdjustFlag ) )
            //     value = (component.dataDecimal) ? value.toFixed(component.dataDecimal) : value.toFixed(globalConfig.defaultDecimal)
            if(component.unitAdjustFlag2 == 'yes')
                value = (component.dataDecimal2 || component.dataDecimal2 == 0) ? value.toFixed(component.dataDecimal2) : value.toFixed(globalConfig.defaultDecimal)
            else if( component.unitAdjustFlag == 'yes' || component.chartUnitAdjustFlag == 'yes' )
                value = (component.dataDecimal || component.dataDecimal == 0) ? value.toFixed(component.dataDecimal) : value.toFixed(globalConfig.defaultDecimal)
        }
        // console.log("value", value);
        if(value != 0)
            return Number( value );
        else
            return value;
    }

    var intervalsArr = [];
    function setTimeInterval(component){
        // console.log("data title ",component.title, component.frequency)
            timeInterval(component);
        if( angular.isDefined(component.frequency)){
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
        // console.log('timeInterval >>>>', component.title );
        if($scope.report.view == 'Month'){
            var newDate = $scope.date.start;
            var endDate = $scope.date.end
            var monthDate = dateConvert(newDate,endDate)
        }

        if($stateParams.params && $stateParams.params.fromDate && !$scope.report.GranularityDefault)
            var from = $stateParams.params.fromDate+'T00:00:00.000Z'
        else{
            if($scope.report.view == 'Month'){
                from = monthDate.from
            }else{
                var from = ($scope.date.start == undefined) ? $scope.date.end+'T00:00:00.000Z' : $scope.date.start+'T00:00:00.000Z';
            }
        }
        // var to = $filter('date')( new Date().getTime() , "yyyy-MM-dd");
        if($stateParams.params && $stateParams.params.toDate && !$scope.report.GranularityDefault)
            var to = $stateParams.params.toDate+'T23:59:59.999Z'
        else{
            if($scope.report.view == 'Month'){
                to = monthDate.to
            }else{
                var to = $scope.date.end+'T23:59:59.999Z';
            }
        }

        var parameter = '';
        if($scope.filter.planSelected)
            parameter += '&plan='+$scope.filter.planSelected;

        if($stateParams.params){
            if($stateParams.params.hasOwnProperty('planName'))
            parameter +='&Plan='+$stateParams.params.planName
        }
        
        if($stateParams.paramsArray){
            if($stateParams.paramsArray[0].Key=="CDN"){
                var from = $stateParams.paramsArray[0].fromDate
            }
        }

        parameter += '&fromDate='+ from +'&toDate='+to;
        if(component.statement.dataSource == 'DBPull' && component.statement.dbPullType != undefined)
            parameter += '&dbPullType='+ component.statement.dbPullType;
        if(component.statement.dbPullType == 'redis')
            parameter += '&name='+component.statement.name;

        // console.log($scope.report)
        var granularity = ($scope.report.GranularityDefault != undefined) ? $scope.date.granularity : 0;
        granularity = granularity || 0
        parameter += '&granularity='+ granularity ;
        // console.log("$stateParams.params", $stateParams.params);
        // console.log("paramter data ",parameter)
        if($stateParams.paramsArray){
            console.log("stateparam array object value ",$stateParams.paramsArray[0].Key,$stateParams.paramsArray[0].value )
        }
        if($stateParams.paramsArray){
            if($stateParams.paramsArray.length>0){
            parameter += '&'+$stateParams.paramsArray[$stateParams.paramsArray.length-1].Key + '='+ $stateParams.paramsArray[$stateParams.paramsArray.length-1].value;
            }
        }

        if($stateParams.paramsArray){
            if($stateParams.paramsArray[0].Key=="CDN"){
                parameter += '&'+$stateParams.paramsArray[0].Key + '='+$stateParams.paramsArray[0].value;
            }
        }

        console.log("parametrs value ",parameter)
        // Mlistner URL calling for Data table 
        httpService.get(globalConfig.pullfilterdataurl + component.query + parameter).success(function(res){
            //console.log("response ibox", res);
            if(res == 'null' || res.length == 0) $scope.displaydata[component._id].loader = false;
            else if( res.length > 0) processReplaceData(component, res);
        });
    }

    function getTotalSubscriberDayWise(component, cb){
        //console.log('timeInterval >>>>', component.title );
        if($scope.report.view == 'Month'){
            var newDate = $scope.date.start;
            var endDate = $scope.date.end
            var monthDate = dateConvert(newDate,endDate)
        }

        if($stateParams.params && $stateParams.params.fromDate && !$scope.report.GranularityDefault)
            var from = $stateParams.params.fromDate+'T00:00:00.000Z'
        else{
            if($scope.report.view == 'Month'){
                from = monthDate.from
            }else{
                var from = ($scope.date.start == undefined) ? $scope.date.end+'T00:00:00.000Z' : $scope.date.start+'T00:00:00.000Z';
            }
        }
        if($stateParams.params && $stateParams.params.toDate && !$scope.report.GranularityDefault)
            var to = $stateParams.params.toDate+'T23:59:59.999Z'
        else{
            if($scope.report.view == 'Month'){
                to = monthDate.to
            }else{
               var to = $scope.date.end+'T23:59:59.999Z';
            }
        }

        var parameter = '';
        parameter += '&fromDate='+ from +'&toDate='+to;
        httpService.get(globalConfig.pullfilterdataurl + component.subscribersQuery + parameter).success( function(res) {
            if (!res) {
                cb([]);
            } else {
                cb(res);
            }
        });
    }
    

    function dateConvert(newDate,endDate){
        if(typeof(newDate) == 'string'){
            var date =  new Date(newDate)
            var year = $filter('date')(date, "yyyy")
            var month = $filter('date')(date, "MM")
            var startDate = new Date(year, Number(month)-1, 1);
            var from =  $filter('date')(startDate, "yyyy-MM-dd")
        }
       
        if(typeof(endDate) == 'string'){
            var date =  new Date(endDate)
            var year = $filter('date')(date, "yyyy")
            var endMonth =  $filter('date')(new Date(endDate), "MM")
            var endDate = new Date(year, endMonth, 0)
            var to= $filter('date')(endDate, "yyyy-MM-dd")
        }

        var from = from +'T00:00:00.000Z'

        var to = to+'T23:59:59.999Z';
        return {from:from,to:to}
    }

    $scope.dtOptions = {
        paging : true,
        searching : true,
        bLengthChange : true,
        bSort : true,
        bInfo : true,
        bAutoWidth : true
    };
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
        var country;
        // var sort = JSON.stringify({ 'country' : 1});
        var params = 'collection=lku_country_list' //+ encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).success(function (response){
             _.forEach(response, function(item){
                country = item.country;
                item.key = item.circleid;
            });
        })

        var sort = JSON.stringify({ 'country' : 1});
        var params = 'collection=lku_circle&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).success(function (response){
            _.forEach(response, function(item){
                item.title = item.circle;
                item.key = item.circleid;
            });
            var children = null;
            if(response.length > 0)
                children = response;
            else
                swal('', 'Location data not found', 'warning');
            // console.log('Location', children)
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
                                    keyArrayResult.push(response[0].circleid+"."+ getParents(node)+"."+nodeKey);
                                    ttlArrayResult.push(getParentsTitle(node) + nodeTitle );
                                    //keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                                    // country+"."+
                                }else{
                                    keyArrayResult.push(response[0].circleid+"." +nodeKey);
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
                                // child.addChild(res.data);
                                // node.toggleExpand();
                                var tmp = child.addChild(res.data);
                                tmp.data.addClass = 'location';
                                node.toggleExpand();
                                var test = $('.location').closest('ul').addClass('lastChild');
                                $('.lastChild').find('.dynatree-expander').removeClass('dynatree-expander').addClass('dynatree-connector');
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
                            if($scope.selectStatus==false && res.data.length > 0)
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
        // var rat = globalData.filterRat;
        var params = 'collection=lku_rat'
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).success(function(res){
            var rat = []
            _.forEach(res, function(item, key){
                rat.push({title: item.rat, key: item.rat})
            })
            if(rat.length == 0)
                swal('', 'Rat data not found', 'warning')
            console.log('rat', rat)
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
            })
        })
    }
    
    $scope.segmentSelected = [];
    $scope.loadSegment = function(){
        //var segmentData = globalData.filterSegment;
        var params = 'collection=lku_segment'
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).success(function(res){
            var segmentData = []
            _.forEach(res, function(item, key){
                segmentData.push({title: item.Segment, key: item.Segment})
            })
            console.log('segmentData', segmentData);

            
            $("#segment").dynatree({
                checkbox: true,
                selectMode: 4,
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
            })
        })
    }

    $scope.deviceSelected = [];
    $scope.loadDevice = function(){
        //httpService.get(globalConfig.pulldataurlbyname + 'Device Filter till Company').then(function (response){
        var sort = JSON.stringify({ 'company' : 1});
        var params = 'collection=lku_phone_make&sort=' + encodeURIComponent(sort);
        httpService.get(globalConfig.pulldatabyMlistener +'getdata&'+ params).then(function (response){
            _.forEach(response.data, function(item){
                item.title = item.make;
                item.key = item.makeid;
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

    $scope.planSelected = '';
    $scope.plan = [];
    $scope.loadPlan = function(){
        httpService.get(globalConfig.pulldataurlbyname + 'Plan Filter').then(function (response) {
            if(response.data == '' || response.data.length == 0) swal('Plan not found', '', 'warning');
            var children = response.data;
            if($scope.report.filterType && $scope.report.filterType.Plan == 'multiple'){
                children.splice(0, 0, {Plan: 'All'})
            }
            $scope.plan = children;
        });
    }

    $scope.oltSelected = '';
    $scope.olt = [];
    $scope.loadOLT = function()
    {
        httpService.get(globalConfig.pulldataurlbyname + 'OLT Filter').then(function (response) {
            if(response.data == '' || response.data.length == 0) swal('OLT not found', '', 'warning');
            if($scope.report.filterType && $scope.report.filterType.OLT == 'multiple'){
                response.data.splice(0, 0, {OLT: 'All'})
            }
            $scope.olt = response.data
        })
    }

    $scope.appSelected = '';
    $scope.app = [];
    $scope.loadApp = function(){
        httpService.get(globalConfig.pulldataurlbyname + 'App Filter').then(function (response) {
            if(response.data == '' || response.data.length == 0) swal('App not found', '', 'warning');
            if($scope.report.filterType && $scope.report.filterType.App == 'multiple'){
                response.data.splice(0, 0, {App: 'All'})
            }
            $scope.app = response.data;
        });
    }

    $scope.areaSelected = '';
    $scope.area = [];
    $scope.loadArea = function(){
        httpService.get(globalConfig.pulldataurlbyname + 'Area Filter').then(function (response) {
            if(response.data == '' || response.data.length == 0) swal('Area not found', '', 'warning');
            if($scope.report.filterType && $scope.report.filterType.Area == 'multiple'){
                response.data.splice(0, 0, {area: 'All'})
            }
            $scope.area = response.data;
        });
    }

    $scope.nodeSelected = '';
    $scope.node = [];
    $scope.loadNode = function(){
        httpService.get(globalConfig.pulldataurlbyname + 'Node Filter').then(function (response) {
            if(response.data == '' || response.data.length == 0) swal('Node not found', '', 'warning');
            if($scope.report.filterType && $scope.report.filterType.Node == 'multiple'){
                response.data.splice(0, 0, {node: 'All'})
            }
            $scope.node = response.data;
        });
    }
    
    $scope.protocolSelected = '';
    $scope.protocol = [];
    $scope.loadProtocol = function(){
        httpService.get(globalConfig.pulldataurlbyname + 'Protocol Filter').then(function (response) {
            if(response.data == '' || response.data.length == 0) swal('Node not found', '', 'warning');
            if($scope.report.filterType && $scope.report.filterType.Protocol == 'multiple'){
                response.data.splice(0, 0, {Protocol: 'All'})
            }
            $scope.protocol = response.data;
        });
    }
    
    $scope.cdnSelected = '';
    $scope.cdn = [];
    $scope.loadcdn = function(){
        httpService.get(globalConfig.pulldataurlbyname + 'CDN Filter').then(function (response) {
            if(response.data == '' || response.data.length == 0) swal('CDN not found', '', 'warning');
            if($scope.report.filterType && $scope.report.filterType.cdn == 'multiple'){
                response.data.splice(0, 0, {cdn: 'All'})
            }
            $scope.cdn = response.data;
        });
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

    $scope.locationinfo = "All Locations";
    $scope.ratinfo      = "All RATs";
    $scope.segmentinfo  = "All Segments";
    $scope.deviceinfo   = "All Devices";

    $scope.filterGetParams= function(){
        $scope.locationinfo = filterService.getLocationInfo($scope.selLocationTitle);
        $scope.ratinfo      = filterService.getRATInfo($scope.selKeysRAT);
        $scope.segmentinfo  = filterService.getSegmentInfo($scope.selKeysSegment);
        $scope.deviceinfo   = filterService.getDeviceInfo($scope.selDeviceTitle);
    }

    
    $scope.search = function (date){
        $scope.locationTree = false;
        $scope.ratTree      = false;
        $scope.segmentTree  = false;
        $scope.deviceTree   = false;
        $scope.planTree     = false;

        $scope.filterGetParams();
        var parameter = '';
        if($scope.locationSelected.length > 0)
            parameter += '&location='+buildFilterParams($scope.locationSelected, false);

        if($scope.ratSelected.length > 0)
            parameter += '&rat='+buildFilterParams($scope.ratSelected, true);

        if($scope.segmentSelected.length > 0)
            parameter += '&Segment='+buildFilterParams($scope.segmentSelected, true);

        if($scope.deviceSelected.length > 0)
            parameter += '&device='+buildFilterParams($scope.deviceSelected, false);

        if($scope.filter.planSelected){
            if(typeof $scope.filter.planSelected == 'object'){
                if($scope.filter.planSelected.length > 0 && $scope.filter.planSelected[0] != 'All')
                    parameter += '&Plan='+buildFilterParams($scope.filter.planSelected, true);
            }
            else
                parameter += '&Plan='+$scope.filter.planSelected;
        }

        if($scope.filter.oltSelected){
            if(typeof $scope.filter.oltSelected == 'object'){
                if($scope.filter.oltSelected.length > 0 && $scope.filter.oltSelected[0] != 'All')
                    parameter += '&OLT='+encodeURIComponent(buildFilterParams($scope.filter.oltSelected, true));
            }
            else
                 parameter += '&OLT='+encodeURIComponent($scope.filter.oltSelected);
        }

        if($scope.filter.appSelected){
            if(typeof $scope.filter.appSelected == 'object'){
                if($scope.filter.appSelected.length > 0)
                    parameter += '&App='+buildFilterParams($scope.filter.appSelected, true);
            }
            else
                parameter += '&App='+$scope.filter.appSelected;
        }   

        if($scope.filter.areaSelected){
            if(typeof $scope.filter.areaSelected == 'object'){
                if($scope.filter.areaSelected.length > 0)
                    parameter += '&Area='+buildFilterParams($scope.filter.areaSelected, true);
            }
            else
                parameter += '&Area='+$scope.filter.areaSelected;
        }

        if($scope.filter.nodeSelected){
            if(typeof $scope.filter.nodeSelected == 'object'){
                if($scope.filter.nodeSelected.length > 0)
                    parameter += '&Node='+buildFilterParams($scope.filter.nodeSelected, true);
            }
            else
                parameter += '&Node='+$scope.filter.nodeSelected;
        }
        
        if($scope.filter.protocolSelected){
            if(typeof $scope.filter.protocolSelected == 'object'){
                if($scope.filter.protocolSelected.length > 0)
                    parameter += '&Protocol='+buildFilterParams($scope.filter.protocolSelected, true);
            }
            else
                parameter += '&Protocol='+$scope.filter.protocolSelected;
        }
        
        if($scope.filter.cdnSelected){
            if(typeof $scope.filter.cdnSelected == 'object'){
                if($scope.filter.cdnSelected.length > 0)
                    parameter += '&CDN='+buildFilterParams($scope.filter.cdnSelected, true);
            }
            else
                parameter += '&CDN='+$scope.filter.cdnSelected;
        }
        
        if($scope.text != '')
            parameter += '&'+$scope.report.txt+'='+$scope.text;

        if($scope.report.filter.date){
            var mode = $scope.report.view;
             if(mode== 'Month'){
                var newDate = $scope.date.start;
                var endDate  =  $scope.date.end
                console.log("endDate",endDate)
                if(typeof(newDate) == 'string' && typeof(endDate) == 'string'){
                    var monthDate = dateConvert(newDate,endDate)
                    from = monthDate.from
                    to  = monthDate.to
                }
                else if(typeof(newDate) == 'object' &&  typeof(endDate) == 'string'){
                    var startD = new Date(newDate.format("YYYY"), newDate.format("MM")-1, 1);
                    var from =   $filter('date')(startD, "yyyy-MM-dd");
                    var year =  $filter('date')( new Date(from), "yyyy");
                    var month  =  $filter('date')( new Date(from), "MM")
                    var endDate = new Date(year, month, 0)
                    var to= $filter('date')(endDate, "yyyy-MM-dd")
                    var from = from+'T00:00:00.000Z';
                    var to = to+'T23:59:59.999Z';
                }
                else{
                    var startD = new Date(newDate.format("YYYY"), newDate.format("MM") - 1, 1);
                    var endD = new Date(newDate.format("YYYY"), newDate.format("MM"), 0);
                    var from = $filter('date')(startD, "yyyy-MM-dd");
                    var to = $filter('date')(endD, "yyyy-MM-dd");
                    var from = from+'T00:00:00.000Z';
                    var to = to+'T23:59:59.999Z';
                }

                from = from 
                to = to 

            }else{
                var from = $scope.date.start+'T00:00:00.000Z';
                var to = $scope.date.end+'T23:59:59.999Z';
            }

            parameter += '&fromDate='+ from +'&toDate='+to;
        }

        if($scope.report.filter.singleDatepicker){
            var mode = $scope.report.view;
            if(mode== 'Month'){
                var newDate = $scope.date.start;
                var endDate  =  $scope.date.end
                console.log("endDate",endDate)
                console.log(typeof(newDate),typeof(endDate))
                if(typeof(newDate) == 'string' && typeof(endDate) == 'string'){
                   var monthDate =  dateConvert(newDate,endDate)
                   console.log("monthDate",monthDate)
                   from = monthDate.from
                   to = monthDate.to
                }
                else if(typeof(newDate) == 'object'  &&  typeof(endDate) == 'string'){
                    var startD = new Date(newDate.format("YYYY"), newDate.format("MM")-1, 1);
                    var from =   $filter('date')(startD, "yyyy-MM-dd");
                    var year =  $filter('date')( new Date(from), "yyyy");
                    var month  =  $filter('date')( new Date(from), "MM")
                    var endDate = new Date(year, month, 0)
                    var to= $filter('date')(endDate, "yyyy-MM-dd")
                    var from = from+'T00:00:00.000Z';
                    var to = to+'T23:59:59.999Z';
                }
                else{
                    var startD = new Date(newDate.format("YYYY"), newDate.format("MM") - 1, 1);
                    var endD = new Date(newDate.format("YYYY"), newDate.format("MM"), 0);
                    var from =   $filter('date')(startD, "yyyy-MM-dd");
                    var to = $filter('date')(endD, "yyyy-MM-dd");
                    var from = from+'T00:00:00.000Z';
                    var to = to+'T23:59:59.999Z';
                }

            }else{
                var from = $scope.date.start+'T00:00:00.000Z';
                var to = $scope.date.start+'T23:59:59.999Z';
            }

            parameter += '&fromDate='+ from +'&toDate='+to;
        }

        // $scope.fromUsage='0';
        // $scope.toUsage ;
        // $scope.unit = 'Bytes';

       
        if($scope.fromUsage|| $scope.toUsage){
            // alert($scope.fromUsage)
            // console.log("from usage ",typeof($scope.fromUsage))
            
            var fromUsage, toUsage, paramUsage;
            fromUsage = getBytes($scope.fromUsage, $scope.unit) || '';
            toUsage = getBytes($scope.toUsage, $scope.unit) || '';
            // console.log("from usage vlaue ",fromUsage, toUsage);
            var tmp = getAdvanceFilterParam(fromUsage, toUsage, 'Usage');
            console.log('tmp', tmp);
            
            parameter += "&UsageFilter="+ encodeURI(tmp) ;
        }

        var granularity = date.granularity
        if(!granularity)
            granularity = ($scope.report.GranularityDefault != undefined) ? $scope.report.GranularityDefault : 0;
        parameter += '&granularity='+ granularity;
        // console.log($scope.date, parameter);

        var componentArr = $scope.displaydata;
        // console.log("componentArr", componentArr);
        _.forEach(componentArr, function(value, key){
            var component = value.component;
            console.log("value",value);
            if(component.type == 'iBox_Multi_no_Header'){
                subscribeIBoxMulti(component, 1);
            }
            else{
                $scope.displaydata[component._id].loader = true;
                $scope.displaydata[component._id].data = [];
                if($scope.displaydata[component._id].labeldata)
                    $scope.displaydata[component._id].labeldata = [];

                    // alert(parameter)
                // console.log("component", component);
                // console.log("parameter",parameter)
                httpService.get(globalConfig.pullfilterdataurl + component.query + parameter + '&queryname='+ component.statement.name).success(function(res){
                    // delete component.plotFor;
                    console.log("res", res);
                    if(res == 'null' || res.length == 0) {
                        $scope.displaydata[component._id].loader = false;
                        $scope.displaydata[component._id].kpi = '';
                    }
                    else if( res.length > 0) processReplaceData(component, res);
                });
            }
        });
    }


    function getAdvanceFilterParam(fromValue, toValue,label){
        var paramAdvanceFilter= null;
        if(angular.isDefined(fromValue) && fromValue != ''){
            paramAdvanceFilter = "'$gte':"+fromValue;
            if(toValue != ''){
                paramAdvanceFilter += ",'$lte':"+toValue;
                    return '{'+paramAdvanceFilter+'}';
            }
            else{
                return '{'+paramAdvanceFilter+'}';
            }
        }else if(angular.isDefined(toValue)){
            paramAdvanceFilter = "'$lte':"+toValue;
            return '{'+paramAdvanceFilter+'}';
        }
        else{
            swal('', 'Usage filter not selected!!', 'error')
        }
    }

    function getBytes(usageValue, unit){
        var usage;
        if(usageValue>=0 && usageValue!=null){
            if(unit != "Bytes"){
                switch(unit){
                    case 'GB':
                        usage = Math.pow(2,30)*usageValue;
                        break;
                    case 'MB':
                        usage = Math.pow(2,20)*usageValue;
                        break;
                    case 'KB':
                        usage = Math.pow(2,10)*usageValue;
                        break;
                }
            }
            else
                usage = usageValue;
        }
        console.log("value after return ",usage)
        return usage;
        
    }

    // function getAdvanceFilterParam(fromValue, toValue,label){
    //     var paramAdvanceFilter= null;
    //     if(angular.isDefined(fromValue) && fromValue != ''){
    //         paramAdvanceFilter = "'$gte':"+fromValue;
    //         if(toValue != ''){
    //             paramAdvanceFilter += ",'$lte':"+toValue;
    //                 return '{'+paramAdvanceFilter+'}';
    //         }
    //         else{
    //             return '{'+paramAdvanceFilter+'}';
    //         }
    //     }else if(angular.isDefined(toValue)){
    //         paramAdvanceFilter = "'$lte':"+toValue;
    //         return '{'+paramAdvanceFilter+'}';
    //     }
    //     else{
    //         swal('', 'Usage filter not selected!!', 'error')
    //     }
    // }

    // function getBytes(usageValue, unit){
    //     var usage;
    //     if(usageValue>=0 && usageValue!=null){
    //         if(unit != "Bytes"){
    //             switch(unit){
    //                 case 'GB':
    //                     usage = Math.pow(2,30)*usageValue;
    //                     break;
    //                 case 'MB':
    //                     usage = Math.pow(2,20)*usageValue;
    //                     break;
    //                 case 'KB':
    //                     usage = Math.pow(2,10)*usageValue;
    //                     break;
    //             }
    //         }
    //         else
    //             usage = usageValue;
    //     }
    //     return usage;
    // }

    //datepicker- date change event
    $scope.changeDate = function (modelName, newDate){
        var mode = $scope.report.view;
        var dateSelect;
        if(mode== 'Month'){
            // var startD = new Date(newDate.format("YYYY"), newDate.format("MM") - 1, 1);
            // var endD = new Date(newDate.format("YYYY"), newDate.format("MM"), 0);
            // //var date = startD.toString("YYYY-MM-DD")
            // var startD =   $filter('date')(startD, "yyyy-MM-dd");
            // var endD = $filter('date')(endD, "yyyy-MM-dd");
            // $scope.date.start= startD;
            // $scope.date.end= endD;
            // console.log("startD",startD)
            // console.log("endD",endD)
        }
        else{
            dateSelect= newDate.format("YYYY-MM-DD");
            console.log('dateSelect',dateSelect)
            $scope.date.start = dateSelect;
        }
        //$scope.search($scope.date.start);
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
        $scope.displaydata[component._id].loader = false;
        var data1 = res;
        if(component.plotKey && component.plotKey != '')
            data1 = dbService.unique(data1, component.plotKey, component.plotValue);

        if( component.type == 'simple_ibox' || component.type == 'simple_ibox_with_dual_data_point' || component.type == 'ibox_with_gauge')
            processIBoxSnapshotData(component, data1);
        else if( component.type == 'simple_table' || component.type == 'table_with_search' )
            processTableReplaceData(component, data1);
         else if( component.type == 'col_extended_table' || component.type == 'extended_table')
            complexTableReplaceData(component, data1);
        else if( component.type == 'simple_charts')
            processReplaceChartData(component, data1);
        else if( component.type == 'ibox_with_embeded_chart' ){
            if( component.dataKpi == 'DBPull' )
                processIBoxWithChartData(component, data1[0]);
            if( component.data == 'DBPull' ){
                processReplaceChartData(component, data1);
            }
        }
        else if( component.type == 'map')
            mapReplaceData(component, data1);
        else if( component.type == 'gauge' || component.type == 'ibox_gauge')
            processGauge(component, data1[0]);
    }

    function processReplaceChartData(component, res){
        if( component.libType == 'flot'){
            if( component.chartType == 'Line')
                processFlotChartMultiSeriesReplaceData(component, res);
            else if( component.chartType == 'Pie' )
                pieFlotReplaceData(component, res);
        }
        else if( component.libType == 'ChartJS' ){
            if( component.chartType == 'Bar' || component.chartType == 'Line' )
                processChartMultiSeriesReplaceData(component, res);
            else
                processChartSingleSeriesReplaceData(component, res);
        }
        else if( component.libType == 'D3'){
            if(component.chartType == 'Pie')
                pieD3ReplaceData(component, res);
            else if( component.chartType == 'Line' || component.chartType == 'Bar' )
                multiSeriesD3ReplaceData(component, res);
            else if( component.chartType == 'Scatter')
                scatterD3ReplaceData(component, res);
        }
        else if( component.libType === 'highchart' ){
            if($scope.date.granularity)
                xAxisFormate(component, $scope.date.granularity)
            
            if( component.chartType == 'StackedBar'|| component.chartType == 'StackedBarHorizontal')
                highchartStackedBarReplace( component, res );
            else if( component.chartType == 'Pyramid' )
                pyramidReplaceData( component, res );
            else if( component.chartType == 'Pie' )
                highchartSingleSeriesReplace( component, res);
            else if( component.chartType == 'MultiLine' || component.chartType == 'Bubble')
                highchartMultiLineReplace( component, res );
            else if( component.chartType == 'Scatter' )
                highchartScatterReplace( component, res);
            else if( component.chartType == 'LinePlushBar')
                highchartLinePlushBarReplace( component, res);
            else if( component.chartType == 'AreaRangeLine')
                areaRangeLineReplace(component, res);
            else
                highchartReplaceData( component, res );
        }
    }

    //pagination change page event
    $scope.changePage= function(currPage, componentData, component){
        $scope.currPage= currPage;
        console.log("componentData", componentData);
        console.log("component", component);
        complexTableReplaceData(component, componentData);
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
        })
    }

    $scope.filter = {};
    $scope.filterChange = function(item, selected){
        if(!item) return;
        console.log(selected, item, item.indexOf('All') > -1)

        if(item.indexOf('All') > -1){
            // item = ['All']
            $scope.filter[selected] = ['All']
        }
    }
})
