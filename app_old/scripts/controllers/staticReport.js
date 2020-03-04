'use strict';
//New Angular module
angular.module('specta') 
    .controller('StaticReportCtrl',StaticReportCtrl)
    .controller('cellStatisticsReportCtrl',cellStatisticsReportCtrl)
    .controller('rncStatisticsReportCtrl',rncStatisticsReportCtrl)
    .controller('QoSReportCtrl',QoSReportCtrl)
    .controller('usageTrendRptCtrl',usageTrendRptCtrl)
    .controller('topModelsCtrl',topModelsCtrl);

// Static Report Ctrl
function StaticReportCtrl($scope, $stateParams, $state, globalConfig, ChartService, filterService, httpService, dbService,  $filter, utility) {
    
    //
    ChartService.setCurrentPage(null);
    $scope.apiURL = globalConfig.dataapiurl;
    if( $stateParams.id && $stateParams.id != '' ){
        var fields = JSON.stringify(['name', 'file']);
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query) +'&fields=' + encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
        httpService.get(url).then(function (response){
            
            $scope.headerName = response.data[0].name;
            console.log("$scope.headerName", response.data[0].name);
            $state.current.data.currentPage = response.data[0].name;
            // $scope.file = 'views/static/' + response.data[0].file+'.html';
            if(globalConfig.depType == 'F')
                $scope.file = 'views/fixedLine/' + response.data[0].file+'.html';
            else
                $scope.file = 'views/mobility/' + response.data[0].file+'.html';
        });
    }
   /* if($stateParams.id && $stateParams.id != '' ){
        
        $http.get($scope.apiURL +'/report/'+ $stateParams.id).then(function (response) {
            //
            $scope.headerName = response.data.name;
            $scope.file = 'views/static/' + response.data.file;

        });
    }*/
    else if($stateParams.file){
        if($stateParams.name)
            $scope.headerName = $stateParams.params.clickableTooltip;
            // $scope.headerName = $stateParams.name;
            // $scope.headerName = $stateParams.params.Key +' : '+ $stateParams.params.value;

        else
            $scope.headerName = 'BBPlanDetailReport';
        
        // $scope.file = 'views/static/' + $stateParams.file;
        if(globalConfig.depType == 'F')
            $scope.file = 'views/fixedLine/' +$stateParams.file;
        else
            $scope.file = 'views/mobility/' +$stateParams.file;
    }

    $scope.getNestedExport= function (exportObj, type,name){
        var exportArray= [];
        for(var i in exportObj){
            var keys= Object.keys(exportObj[i]);
            var temp= {};
            for(var j in keys){
                if( !Array.isArray(exportObj[i][keys[j]])){
                    if(/Date/.test(keys[j])){
                        temp[keys[j]]= $filter('date')( exportObj[i][keys[j]], "yyyy-MM-dd");
                    }
                    else{
                        temp[keys[j]]= exportObj[i][keys[j]]
                    }
                }
            }
            for(var j in keys){
                if(Array.isArray(exportObj[i][keys[j]])){
                    for(var k in exportObj[i][keys[j]]){
                        var dataKey= Object.keys(exportObj[i][keys[j]][k]);
                        for(var l in dataKey){
                            if(/Date/.test(dataKey[l])){
                                temp[dataKey[l]]= $filter('date')( exportObj[i][keys[j]][k][dataKey[l]], "yyyy-MM-dd");
                            }
                            else{
                                temp[dataKey[l]]= exportObj[i][keys[j]][k][dataKey[l]];
                            }
                        }
                        exportArray.push(angular.copy(temp))
                    }
                }
            }
        }
        //var te=  [{a:1,b:1}, {a:2,b:2}, {a:3,b:3}];
        if(type == 'excel')
            alasql('SELECT * INTO XLSX("'+name+'.xlsx",{headers:true}) FROM ?',[exportArray]);
        if(type == 'csv')
            alasql('SELECT * INTO CSV("'+name+'.csv",{headers:true}) FROM ?',[exportArray]);
    }

    //Simple JSON Export
    $scope.getSimpleJSONExport= function(exportObj, type,name){
        for(var i in exportObj){
            var keys= Object.keys(exportObj[i]);
            for(var j in keys){
                if(/Date/.test(keys[j])){
                        exportObj[i][keys[j]]= $filter('date')( exportObj[i][keys[j]], "yyyy-MM-dd");
                    }
                    else{
                        exportObj[i][keys[j]]= exportObj[i][keys[j]]
                    }
            }
        }

        if(type == 'excel')
            alasql('SELECT * INTO XLSX("'+name+'.xlsx",{headers:true}) FROM ?',[exportObj]);
        if(type == 'csv')
            alasql('SELECT * INTO CSV("'+name+'.csv",{headers:true}) FROM ?',[exportObj]);
    }
    // End Simple JSON Export

     //DateRange Options
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');

    var fromDate= null;
    var toDate= null;
    if(globalConfig.fromDate != 'F')
        fromDate= globalConfig.fromDate;
    else
        fromDate= $filter('date')( new Date().getTime()- 7*24*3600*1000 , "yyyy-MM-dd");
    if(globalConfig.toDate != 'F')
        toDate= globalConfig.toDate;
    else
        toDate= $filter('date')( new Date().getTime()- 24*3600*1000 , "yyyy-MM-dd");

    // fromDate= '2017-03-29'
    // toDate= '2017-03-31'
    
    $scope.dateSelect= toDate;
    $scope.date= {"start": fromDate, "end": toDate};

    //change Date event
    $scope.changeDate=function (modelName, newDate) {
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    //End DateRange Option
}
 //Static Report Ctrl ends   
//-----------------------------------------------------------------------------------------------------

// Top Models Ctrl
function topModelsCtrl($scope, $state, httpService, globalConfig, $filter,  dataFormatter, utility) {

    //track url starts
    utility.trackUrl();
    //end track url

    if(/Model Usage/.test($scope.headerName))
        $scope.models= "Model Usage";
    if(/Model Users/.test($scope.headerName))
        $scope.models= "Model Users";
    else if(/Device Usage/.test($scope.headerName))
        $scope.models= "Device Usage";
    else if(/Device Users/.test($scope.headerName))
        $scope.models= "Device Users";
    else if(/Area Usage/.test($scope.headerName))
        $scope.models= "Area Usage";
    else if(/Area Users/.test($scope.headerName))
        $scope.models= "Area Users";
    else if(/City Usage/.test($scope.headerName))
        $scope.models= "City Usage";
    else if(/City Users/.test($scope.headerName))
        $scope.models= "City Users";
    else if(/Cell ID Usage/.test($scope.headerName))
        $scope.models= "cellid Usage";
    else if(/Cell ID Users/.test($scope.headerName))
        $scope.models= "cellid Users";
    else if(/App Usage/.test($scope.headerName))
        $scope.models= "App Usage";
    else if(/App Users/.test($scope.headerName))
        $scope.models= "App Users";
    else if(/App Duration/.test($scope.headerName))
        $scope.models= "App Duration";
    else if(/App Sessions/.test($scope.headerName))
        $scope.models= "App Sessions";
    
    // var fromDate= $filter('date')( new Date().getTime() -3*24*3600*1000 , "yyyy-MM-dd");
    // var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    // $scope.date= {"start": fromDate, "end": toDate};    
    $scope.rowCount= '10';
    var topModelsTableURL;

    function loadingDiv(loadingDivStatus,dataDivStatus, noDataDivStatus){
        $scope.loadingDiv= loadingDivStatus;
        $scope.dataDiv= dataDivStatus;
        $scope.noDataDiv= noDataDivStatus;
    }

    function topModelsTable(url){
        loadingDiv(true, false, false);
        httpService.get(url).then(function(response){
            var ObjArray= response.data;
            if(ObjArray.length>0){
                var rowLength= $scope.rowCount;
                var keysTopModelArray= _.keys(ObjArray[0]['data'][0]);
                $scope.colSpan= keysTopModelArray.length
                var keysModifiedArray= [], index= -1, tableData= [];
                for(var i in ObjArray)
                {
                    for(var j in keysTopModelArray)
                        keysModifiedArray[++index]= keysTopModelArray[j];
                }
                $scope.colHeader= angular.copy(keysModifiedArray);

                for(var i=0; i<rowLength; i++){
                    var index= -1, tabData= [];
                    for(var j in ObjArray){
                        if(ObjArray[j].data.length == rowLength){
                            for(var l in keysTopModelArray){
                                switch(keysTopModelArray[l]){
                                    case 'Usage':{
                                        tabData[++index]= dataFormatter.formatUsageData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                        break;
                                    }
                                    case 'Count':{
                                        tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                        break;
                                    }
                                    case 'Sessions':{
                                        tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                        break;
                                    }
                                    case 'Duration':{
                                        tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                        break;
                                    }
                                    default:{
                                        tabData[++index]= ObjArray[j].data[i][keysTopModelArray[l]];
                                        break;
                                    }
                                }
                            } 
                        }else{
                            if(angular.isDefined(ObjArray[j].data[i])){
                                for(var l in keysTopModelArray){
                                    switch(keysTopModelArray[l]){
                                        case 'Usage':{
                                            tabData[++index]= dataFormatter.formatUsageData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                            break;
                                        }
                                        case 'Count':{
                                            tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                            break;
                                        }
                                        case 'Sessions':{
                                            tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                            break;
                                        }
                                        case 'Duration':{
                                            tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                            break;
                                        }
                                        default:{
                                            tabData[++index]= ObjArray[j].data[i][keysTopModelArray[l]];
                                            break;
                                        }
                                    }
                                }
                            }else{
                                for(var l in keysTopModelArray)
                                    tabData[++index]= '-';
                            }
                        }
                    }
                    tableData[i]= angular.copy(tabData);
                }
                $scope.keysTopModel= angular.copy(tableData);
                $scope.topModelsObj= ObjArray;
                loadingDiv(false, true, false);
            }else{
                loadingDiv(false, false, true);
            }
        })
    }

    function defaultLoad(){
        
        topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z"+"&rowCount="+$scope.rowCount;
                
        topModelsTable(topModelsTableURL);
    }
    
    defaultLoad();

    // DateRange Submit event
    $scope.click= function(){
        defaultLoad();
    }

    //Export Nested Object
    $scope.expotNestedjsonObj= function(displayData, type, name) {
        
        $scope.getNestedExport(displayData, type, name);
    }

    //pagination change page event
    $scope.changePage= function(currPage, componentData, component){
        //console.log("currentPage", currPage);
        $scope.currPage= currPage;
        // console.log("componentData", componentData);
        // console.log("component", component);
        topModelsTable(topModelsTableURL);

    }
}
 //Top Models Ctrl ends   
//-----------------------------------------------------------------------------------------------------
// Cell Statistics Report Controller
function cellStatisticsReportCtrl($scope, $state, httpService, globalConfig, $filter,  dataFormatter, highchartOptions, highchartProcessData,$stateParams, globalData, utility) {
    
    //track url starts
    utility.trackUrl();
    //end track url

    if($stateParams.params != null){
        console.log('$stateParams.params',$stateParams.params);
        $scope.rowCount= $stateParams.params.cellID;
        $scope.mapClick= true;
    }else{
        $scope.rowCount= 'c00000A';
        $scope.mapClick= false;
    }
    $stateParams.params= null
    function loadingDiv(loadingDivStatus,dataDivStatus, noDataDivStatus){
        $scope.loadinglineChartDiv= loadingDivStatus;
        $scope.datalineChartDiv= dataDivStatus;
        $scope.noDatalineChartDiv= noDataDivStatus;
    }

    function lineChartUsage(){
        loadingDiv(true,false, false);
        var lineData= [], dateData= [];
        var lineDataArray= globalData.cellStatisticsHourlyUsageline
        
        var linechartOption= angular.copy(highchartOptions.highchartAreaLabelCategoriesOptions)
        
        
        
        for(var i in lineDataArray){
            dateData[i]= lineDataArray[i].hour;
            lineData[i]= parseFloat((lineDataArray[i].usage/(1024*1024)).toFixed(2));
        }
        
        linechartOption.xAxis.categories= dateData;
        linechartOption.yAxis.title= {text: 'Usage (MB)'};
        
        $scope.lineChartConfig= 
            {
                 "options" : linechartOption,
                 "series": [{
                     type: 'spline',
                     name: "Usage",
                     zoomType:'x',
                     color: "#f15c80",
                     data: angular.copy(lineData)
                 }]
        }
        loadingDiv(false,true, false);
    }

    function barChartCEI(){
        var RATDistributionBarChartOptions= {};
        
        $scope.loadingBarChartCEIDiv= true;
        $scope.DataBarChartCEIDiv= false;
        
        // httpService.get(url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray=globalData.cellStatisticsCEIBar //response.data;
            // if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "hour";
                paramObject.data= "cei";
                paramObject.seriesName= "CEI";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var RATDistributionBarOptions= angular.copy(highchartOptions.highchartStackedBarLabelCategoriesOptions);
                RATDistributionBarOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                RATDistributionBarOptions.yAxis.labels= {enabled: false};
                RATDistributionBarOptions.yAxis.stackLabels= false;
                //RATDistributionBarOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                RATDistributionBarOptions.plotOptions.column.stacking= 'normal';
                RATDistributionBarOptions.tooltip.shared= true;
                RATDistributionBarOptions.chart.height= 300;
                RATDistributionBarOptions.yAxis.title= {"text":"CEI"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.BarChartCEIConfig= {
                    options: RATDistributionBarOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                  
                $scope.loadingBarChartCEIDiv= false;
                $scope.DataBarChartCEIDiv= true;
            // }else{
            //     $scope.loadingRATDistributionBarDiv= false;
            //     $scope.DataRATDistributionBarDiv= false;
            //     $scope.noDatRATDistributionBarDiv= true;
            // }
        // })
    }

    function barChartHandover(){
        var RATDistributionBarChartOptions= {};
        
        $scope.loadingBarChartCEIDiv= true;
        $scope.DataBarChartCEIDiv= false;
        
        // httpService.get(url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray=globalData.cellStatisticsHandoverBar //response.data;
            // if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "hour";
                paramObject.data= "percent";
                paramObject.seriesName= "Handover";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var RATDistributionBarOptions= angular.copy(highchartOptions.highchartStackedBarLabelCategoriesOptions);
                RATDistributionBarOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                RATDistributionBarOptions.yAxis.labels= {enabled: false};
                RATDistributionBarOptions.yAxis.stackLabels= false;
                //RATDistributionBarOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                RATDistributionBarOptions.plotOptions.column.stacking= 'normal';
                RATDistributionBarOptions.tooltip.shared= true;
                RATDistributionBarOptions.chart.height= 300;
                RATDistributionBarOptions.yAxis.title= {"text":"%"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.BarChartHandoverConfig= {
                    options: RATDistributionBarOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                  
                $scope.loadingBarChartCEIDiv= false;
                $scope.DataBarChartCEIDiv= true;
            // }else{
            //     $scope.loadingRATDistributionBarDiv= false;
            //     $scope.DataRATDistributionBarDiv= false;
            //     $scope.noDatRATDistributionBarDiv= true;
            // }
        // })
    }

    function lineChart(){
        loadingDiv(true,false, false);
        var lineDataAttach= [], dateDataAttach= [],lineDataPDP= [], dateDataPDP= [],lineDataRAU= [], dateDataRAU= [];
        var lineDataArrayAttach= globalData.cellStatisticsHourlyAttachline
        var lineDataArrayPDP= globalData.cellStatisticsHourlyPDPline
        var lineDataArrayRAU= globalData.cellStatisticsRAUline
        
        var linechartOption= angular.copy(highchartOptions.highchartAreaLabelCategoriesOptions)
        
        
        
        for(var i in lineDataArrayAttach){
            dateDataAttach[i]= lineDataArrayAttach[i].hour;
            lineDataAttach[i]= parseFloat((lineDataArrayAttach[i].attachfailurepercent).toFixed(2));
        }
        
        for(var i in lineDataArrayPDP){
            dateDataPDP[i]= lineDataArrayPDP[i].hour;
            lineDataPDP[i]= lineDataArrayPDP[i].pdpfailurepercent;
        }
        
        for(var i in lineDataArrayRAU){
            dateDataRAU[i]= lineDataArrayRAU[i].hour;
            lineDataRAU[i]= lineDataArrayRAU[i].raufailurepercent;
        }
        
        linechartOption.xAxis.categories= angular.copy(dateDataAttach);
        linechartOption.yAxis.title= {text: 'Failure %'};
        
        $scope.attachlineChartConfig= 
            {
                 "options" : linechartOption,
                 "series": [{
                     type: 'spline',
                     name: "Attach",
                     zoomType:'x',
                     color: "rgba(253,180,92,1)",
                     data: angular.copy(lineDataAttach)
                 }]
        }

        linechartOption.xAxis.categories= angular.copy(dateDataPDP);
        $scope.pdplineChartConfig= 
            {
                 "options" : linechartOption,
                 "series": [{
                     type: 'spline',
                     name: "PDP",
                     zoomType:'x',
                     color: "#3D8EB9",
                     data: angular.copy(lineDataPDP)
                 }]
        }

        linechartOption.xAxis.categories= angular.copy(dateDataRAU);
        $scope.raulineChartConfig= 
            {
                 "options" : linechartOption,
                 "series": [{
                     type: 'spline',
                     name: "RAU",
                     zoomType:'x',
                     color: "#1abc9c",
                     data: angular.copy(lineDataRAU)
                 }]
        }
        loadingDiv(false,true, false);  
    }

    // App Usage Table
    $scope.appUsage= globalData.cellStatisticsAppUsage

    // Protocol Usage Table
        $scope.protocolUsage= globalData.cellStatisticsProtocolUsage

    // RAT Usage Table
        $scope.ratUsage= globalData.cellStatisticsRatUsage

    function defaultLoad(){
        barChartCEI();
        lineChartUsage();
        lineChart();
        barChartHandover();
    }
    
    defaultLoad();

    // DateRange Submit event
    $scope.click= function(){
        defaultLoad();
    }

    //Export Nested Object
    $scope.expotNestedjsonObj= function(displayData, type) {
        
        $scope.getNestedExport(displayData, type);
    }
 
}
 // Cell Statistics Report Controller ends   
//-----------------------------------------------------------------------------------------------------

// RNC Statistics Report Controller
function rncStatisticsReportCtrl($scope, $state, httpService, globalConfig, $filter,  dataFormatter, highchartOptions, highchartProcessData, globalData, utility) {
    
    //track url starts
    utility.trackUrl();
    //end track url


    function getColor(cei){
        var barColor= null;
        if(cei<30){
            barColor= '#43A047';
        }else if(cei>30 && cei<60){
            barColor= '#e67e22';
        }else if(cei>60){
            barColor= '#c0392b';
        }
        return barColor;
    }

    function rncFailureDrilldown(){

        httpService.get('http://10.0.0.15:8080/JRServer/MListener?action=filterquery&name=GGSN%20CEI%20DrillDown&fromDate=2017-01-05T00:00:00.000Z&toDate=2017-01-06T00:00:00.000Z').then(function(response){
            var objArray= [
                      {
                        "CEI": 77.229906785227698,
                        "SGSNData": [
                          {
                            "RNCData": [
                              {
                                "RNC": "BSC-9",
                                "CEI": 66.628973559610003
                              }
                            ],
                            "SGSN": "SGSN-2",
                            "CEI": 46.628973559610003
                          },
                          {
                            "RNCData": [
                              {
                                "RNC": "BSC-7",
                                "CEI": 38.05761469708664
                              },
                              {
                                "RNC": "BSC-4",
                                "CEI": 27.053064728786275
                              },
                              {
                                "RNC": "BSC-5",
                                "CEI": 26.40383908381971
                              },
                              {
                                "RNC": "BSC-6",
                                "CEI": 77.34244762846711
                              },
                              {
                                "RNC": "RNC-3",
                                "CEI": 28.01516034237445
                              },
                              {
                                "RNC": "BSC-2",
                                "CEI": 88.26212149040423
                              },
                              {
                                "RNC": "BSC-3",
                                "CEI": 28.667029823442576
                              },
                              {
                                "RNC": "BSC-8",
                                "CEI": 49.084278461082032
                              },
                              {
                                "RNC": "RNC-1",
                                "CEI": 27.181702034552625
                              },
                              {
                                "RNC": "BSC-1",
                                "CEI": 59.049733328217318
                              },
                              {
                                "RNC": "RNC-2",
                                "CEI": 27.457594991913112
                              },
                              {
                                "RNC": "RNC-4",
                                "CEI": 27.395493519998585
                              }
                            ],
                            "SGSN": "SGSN-1",
                            "CEI": 37.83084001084539
                          }
                        ],
                        "GGSN": "GGSN-1"
                      },
                      {
                        "CEI": 27.16182709810802,
                        "SGSNData": [
                          {
                            "RNCData": [
                              {
                                "RNC": "MME-2",
                                "CEI": 96.88956550953767
                              },
                              {
                                "RNC": "MME-3",
                                "CEI": 27.292885471904302
                              },
                              {
                                "RNC": "MME-1",
                                "CEI": 27.30303031288209
                              }
                            ],
                            "SGSN": "SWG-1",
                            "CEI": 67.16182709810802
                          }
                        ],
                        "GGSN": "PGW-1"
                      }
                    ];
            var seriesData= [], drilldownSeries= [];
            
            for(var i in objArray){

                var seriesDataObj= {};
                seriesDataObj.name= objArray[i].GGSN;
                seriesDataObj.y= parseFloat(objArray[i].CEI.toFixed(2));
                seriesDataObj.color= getColor(objArray[i].CEI);
                seriesDataObj.drilldown= objArray[i].GGSN;
                seriesData.push(seriesDataObj);

                if(objArray[i].SGSNData.length>0){
                    var drilldownSeriesObject= {}, drilldownSeriesData=[];

                    for(var j in objArray[i].SGSNData){
                        drilldownSeriesObject.id= objArray[i].GGSN;
                        drilldownSeriesObject.name= 'SGSN';
                        
                        drilldownSeriesData[j]= {name: objArray[i].SGSNData[j].SGSN,y: parseFloat(objArray[i].SGSNData[j].CEI.toFixed(2)), drilldown: objArray[i].SGSNData[j].SGSN, color: getColor(objArray[i].SGSNData[j].CEI)};
                        drilldownSeriesObject.data= drilldownSeriesData;
                        drilldownSeries.push(drilldownSeriesObject);

                        if(objArray[i].SGSNData[j].RNCData.length>0){
                            var nestedDrilldownSeriesObject= {}, nestedDrilldownSeriesData=[];

                            for(var k in objArray[i].SGSNData[j].RNCData){
                                nestedDrilldownSeriesObject.id= objArray[i].SGSNData[j].SGSN;
                                nestedDrilldownSeriesObject.name= 'RNC';
                                
                                nestedDrilldownSeriesData[k]= {name:objArray[i].SGSNData[j].RNCData[k].RNC, y:parseFloat(objArray[i].SGSNData[j].RNCData[k].CEI.toFixed(2)), color: getColor(objArray[i].SGSNData[j].RNCData[k].CEI)};
                                nestedDrilldownSeriesObject.data= nestedDrilldownSeriesData;
                                drilldownSeries.push(nestedDrilldownSeriesObject);
                            }
                        }
                    }
                }  
            }
            $scope.rncFailureDrilldownConfig= {
                options: {
                    chart: {
                        type: 'column'
                    },
                    credits: {"enabled": false},
                    drilldown: {
                        series: drilldownSeries,
                        plotOptions: {
                            series: {
                                borderWidth: 0,
                                dataLabels: {
                                    enabled: true,
                                }
                            }
                        },
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        type: 'category'
                    },
                    tooltip: {
                        pointFormat: '<br/>CEI: <b>{point.y}</b><br/>',
                    },
                    yAxis: {
                        // allowDecimals: false,
                        /*title:{
                            text: 'CEI'
                        },*/
                        // labels: {enabled:false}
                        visible: false
                    },
                    legend: {
                        enabled: false
                    }
                },
                series: [{
                    name: 'GGSN',
                    colorByPoint: false,
                    data: seriesData
                }]
            }
        });

        /*$scope.rncFailureDrilldownConfig= {
            options: {
                chart: {
                    type: 'column'
                },
                drilldown: {
                    series: [{
                        id: 'animals',
                        data: [
                            ['Cats', 4],
                            ['Dogs', 2],
                            ['Cows', 1],
                            ['Sheep', 2],
                            ['Pigs', 1]
                        ]
                    }, {
                        id: 'fruits',
                        data: [
                            ['Apples', 4],
                            ['Oranges', 2]
                        ]
                    }, {
                        id: 'cars',
                        data: [
                            ['Toyota', 4],
                            ['Opel', 2],
                            ['Volkswagen', 2]
                        ]
                    }],
                    plotOptions: {
                        series: {
                            borderWidth: 0,
                            dataLabels: {
                                enabled: true,
                            }
                        }
                    },
                },
                title: {
                    text: ''
                },
                xAxis: {
                    type: 'category'
                },

                legend: {
                    enabled: false
                }
            },
        
            series: [{
                name: 'Things',
                colorByPoint: true,
                data: [{
                    name: 'Animals',
                    y: 5,
                    drilldown: 'animals'
                }, {
                    name: 'Fruits',
                    y: 2,
                    drilldown: 'fruits'
                }, {
                    name: 'Cars',
                    y: 4,
                    drilldown: 'cars'
                }]
            }]
        }*/
    }

    function stackedDrilldown(){

        // httpService.get('http://10.0.0.15:8080/JRServer/MListener?action=filterquery&name=GGSN%20CEI%20DrillDown&fromDate=2017-01-10T00:00:00.000Z&toDate=2017-01-11T00:00:00.000Z').then(function(response){
            var objArray= 
            [
                    {
                    "Good": 15.0,
                    "Bad": 20.0,
                    "Average": 65.0,
                    "SGSNData": [
                      {
                        "Good": 0.0,
                        "Average": 100.0,
                        "Bad": 0.0,
                        "Status": "Average",
                        "SGSN": "SGSN-2",
                        "RNCData": [
                          {
                            "Good": 37.98449612403101,
                            "Average": 44.96124031007752,
                            "Bad": 17.05426356589147,
                            "Status": "Average",
                            "RNC": "BSC-9"
                          }
                        ]
                      },
                      {
                        "Good": 0.0,
                        "Average": 100.0,
                        "Bad": 0.0,
                        "Status": "Average",
                        "SGSN": "SGSN-1",
                        "RNCData": [
                          {
                            "Good": 33.71647509578544,
                            "Average": 40.61302681992337,
                            "Bad": 25.67049808429119,
                            "Status": "Average",
                            "RNC": "BSC-7"
                          },
                          {
                            "Good": 25.937500000000004,
                            "Average": 47.1875,
                            "Bad": 26.875,
                            "Status": "Average",
                            "RNC": "BSC-5"
                          },
                          {
                            "Good": 31.31241084165478,
                            "Average": 40.44222539229672,
                            "Bad": 28.245363766048502,
                            "Status": "Average",
                            "RNC": "RNC-4"
                          },
                          {
                            "Good": 31.110173068805402,
                            "Average": 41.87420852680456,
                            "Bad": 27.01561840439004,
                            "Status": "Average",
                            "RNC": "RNC-1"
                          },
                          {
                            "Good": 27.67857142857143,
                            "Average": 44.047619047619044,
                            "Bad": 28.273809523809522,
                            "Status": "Average",
                            "RNC": "BSC-6"
                          },
                          {
                            "Good": 29.045643153526974,
                            "Average": 46.88796680497925,
                            "Bad": 24.066390041493776,
                            "Status": "Average",
                            "RNC": "BSC-1"
                          },
                          {
                            "Good": 31.880733944954127,
                            "Average": 40.596330275229356,
                            "Bad": 27.522935779816514,
                            "Status": "Average",
                            "RNC": "RNC-3"
                          },
                          {
                            "Good": 30.533980582524272,
                            "Average": 41.99029126213592,
                            "Bad": 27.47572815533981,
                            "Status": "Average",
                            "RNC": "RNC-2"
                          },
                          {
                            "Good": 29.82456140350877,
                            "Average": 43.859649122807014,
                            "Bad": 26.31578947368421,
                            "Status": "Average",
                            "RNC": "BSC-4"
                          },
                          {
                            "Good": 31.463414634146343,
                            "Average": 43.170731707317074,
                            "Bad": 25.365853658536587,
                            "Status": "Average",
                            "RNC": "BSC-8"
                          },
                          {
                            "Good": 32.640949554896146,
                            "Average": 39.46587537091988,
                            "Bad": 27.89317507418398,
                            "Status": "Average",
                            "RNC": "BSC-3"
                          },
                          {
                            "Good": 32.28155339805826,
                            "Average": 39.80582524271845,
                            "Bad": 27.9126213592233,
                            "Status": "Average",
                            "RNC": "BSC-2"
                          }
                        ]
                      }
                    ],
                    "GGSN": "GGSN-1",
                    "Status": "Average"
                  },
                  {
                    "Good": 25,
                    "Bad": 15,
                    "Average": 60.0,
                    "SGSNData": [
                      {
                        "Good": 0.0,
                        "Average": 100.0,
                        "Bad": 0.0,
                        "Status": "Average",
                        "SGSN": "SWG-1",
                        "RNCData": [
                          {
                            "Good": 30.676552363299354,
                            "Average": 40.87117701575533,
                            "Bad": 28.45227062094532,
                            "Status": "Average",
                            "RNC": "MME-3"
                          },
                          {
                            "Good": 30.806142034548945,
                            "Average": 41.938579654510555,
                            "Bad": 27.2552783109405,
                            "Status": "Average",
                            "RNC": "MME-2"
                          },
                          {
                            "Good": 29.36802973977695,
                            "Average": 39.5910780669145,
                            "Bad": 31.04089219330855,
                            "Status": "Average",
                            "RNC": "MME-1"
                          }
                        ]
                      }
                    ],
                    "GGSN": "PGW-1",
                    "Status": "Average"
                  }
                ]/*[
                      {
                        "CEI": 77.229906785227698,
                        "SGSNData": [
                          {
                            "RNCData": [
                              {
                                "RNC": "BSC-9",
                                "CEI": 66.628973559610003
                              }
                            ],
                            "SGSN": "SGSN-2",
                            "CEI": 46.628973559610003
                          },
                          {
                            "RNCData": [
                              {
                                "RNC": "BSC-7",
                                "CEI": 38.05761469708664
                              },
                              {
                                "RNC": "BSC-4",
                                "CEI": 27.053064728786275
                              },
                              {
                                "RNC": "BSC-5",
                                "CEI": 26.40383908381971
                              },
                              {
                                "RNC": "BSC-6",
                                "CEI": 77.34244762846711
                              },
                              {
                                "RNC": "RNC-3",
                                "CEI": 28.01516034237445
                              },
                              {
                                "RNC": "BSC-2",
                                "CEI": 88.26212149040423
                              },
                              {
                                "RNC": "BSC-3",
                                "CEI": 28.667029823442576
                              },
                              {
                                "RNC": "BSC-8",
                                "CEI": 49.084278461082032
                              },
                              {
                                "RNC": "RNC-1",
                                "CEI": 27.181702034552625
                              },
                              {
                                "RNC": "BSC-1",
                                "CEI": 59.049733328217318
                              },
                              {
                                "RNC": "RNC-2",
                                "CEI": 27.457594991913112
                              },
                              {
                                "RNC": "RNC-4",
                                "CEI": 27.395493519998585
                              }
                            ],
                            "SGSN": "SGSN-1",
                            "CEI": 37.83084001084539
                          }
                        ],
                        "GGSN": "GGSN-1"
                      },
                      {
                        "CEI": 27.16182709810802,
                        "SGSNData": [
                          {
                            "RNCData": [
                              {
                                "RNC": "MME-2",
                                "CEI": 96.88956550953767
                              },
                              {
                                "RNC": "MME-3",
                                "CEI": 27.292885471904302
                              },
                              {
                                "RNC": "MME-1",
                                "CEI": 27.30303031288209
                              }
                            ],
                            "SGSN": "SWG-1",
                            "CEI": 67.16182709810802
                          }
                        ],
                        "GGSN": "PGW-1"
                      }
                    ]*/;
            objArray= //[
  //{"GGSNData":
     [
      {
        "GGSN": "KANGLUNG GGSN",
        "Good": 0.0,
        "Bad": 100.0,
        "Excellent": 0.0,
        "Status": "Bad",
        "SGSNData": [
          {
            "Good": 0.0,
            "Excellent": 0.0,
            "Bad": 100.0,
            "Status": "Bad",
            "SGSN": "KANGLUNG SGSN",
            "RNCData": [
              {
                "Good": 0.0,
                "Excellent": 0.0,
                "Bad": 100.0,
                "Status": "Bad",
                "RNC": "KARNC01",
                "CellData": [
                  {
                    "Status": "Bad",
                    "cellid": "402-11-14-4352"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "GGSN": "GGSN01",
        "Good": 0.0,
        "Bad": 100.0,
        "Excellent": 0.0,
        "Status": "Bad",
        "SGSNData": [
          {
            "Good": 0.0,
            "Excellent": 0.0,
            "Bad": 100.0,
            "Status": "Bad",
            "SGSN": "SGSN01",
            "RNCData": [
              {
                "Good": 0.0,
                "Excellent": 33.33333333333333,
                "Bad": 66.66666666666666,
                "Status": "Bad",
                "RNC": "RNC01",
                "CellData": [
                  {
                    "Status": "Bad",
                    "cellid": "402-11-4017-47932"
                  },
                  {
                    "Status": "Excellent",
                    "cellid": "402-11-4016-46021"
                  },
                  {
                    "Status": "Bad",
                    "cellid": "402-11-4012-42132"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]

    /*for(var i in objArray){
        var series1={
            name: objArray[i].GGSN,
            y: objArray[i].Bad,
            drilldown: 'SGSNData'
        }; series1Data.push(series1);
        var series2={
            name: objArray[i].GGSN,
            y: objArray[i].Excellent,
            // drilldown: 'SGSNData'
        }; series2Data.push(series2);
        var series3={
            name: objArray[i].GGSN,
            y: objArray[i].Good,
            // drilldown: 'SGSNData'
        }; series3Data.push(series3);

        if(SGSNData.length>0){
            
        }
    }*/
    //"Status": "Bad"
  //}
            //]
            var series1Data= [],series2Data= [],series3Data= [], drilldownSeries= [];

            for(var i in objArray){

                var seriesDataObj= {}, series2DataObj= {},series3DataObj= {} ;
                seriesDataObj.name= objArray[i].GGSN;
                seriesDataObj.y= parseFloat(objArray[i].Good);
                seriesDataObj.color= '#e67e22'//getColor(objArray[i].Average);
                seriesDataObj.drilldown= objArray[i].SGSNData;
                series1Data.push(seriesDataObj);

                series2DataObj= angular.copy(seriesDataObj);
                series2DataObj.y= parseFloat(objArray[i].Excellent);
                series2DataObj.color= '#43A047';
                series2Data.push(series2DataObj);

                series3DataObj= angular.copy(seriesDataObj);
                series3DataObj.y= parseFloat(objArray[i].Bad);
                series3DataObj.color= '#c0392b';
                series3Data.push(series3DataObj);

                if(angular.isDefined(objArray[i].SGSNData) && objArray[i].SGSNData.length>0){
                    var drilldownSeriesObject= {}, drilldownSeriesData=[];

                    drilldownSeriesObject.id= objArray[i].GGSN;
                    drilldownSeriesObject.name= 'SGSN';
                        
                    for(var j in objArray[i].SGSNData){
                        
                        drilldownSeriesData[j]= {name: objArray[i].SGSNData[j].SGSN,y: parseFloat(objArray[i].SGSNData[j].Bad), drilldown: objArray[i].SGSNData[j].RNCData, color: '#e67e22'};
                        
                        if(angular.isDefined( objArray[i].SGSNData[j].RNCData) && objArray[i].SGSNData[j].RNCData.length>0){
                            var nestedDrilldownSeriesObject= {}, nestedDrilldownSeriesData=[];
                            
                            nestedDrilldownSeriesObject.id= objArray[i].SGSNData[j].SGSN;
                            nestedDrilldownSeriesObject.name= 'RNC';
                            
                            for(var k in objArray[i].SGSNData[j].RNCData){
                                
                                nestedDrilldownSeriesData[k]= {name:objArray[i].SGSNData[j].RNCData[k].RNC, y:parseFloat(objArray[i].SGSNData[j].RNCData[k].Bad), color: '#e67e22'};
                            }
                            nestedDrilldownSeriesObject.data= nestedDrilldownSeriesData;
                            drilldownSeries.push(nestedDrilldownSeriesObject);
                        }else{
                            nestedDrilldownSeriesObject.data= '';
                            drilldownSeries.push(nestedDrilldownSeriesObject);
                        }
                    }
                    drilldownSeriesObject.data= drilldownSeriesData;
                    drilldownSeries.push(drilldownSeriesObject);
                }else{
                    drilldownSeriesObject.data= '';
                    drilldownSeries.push(drilldownSeriesObject);
                }  
            }

            var optionsDrillDown= angular.copy(highchartOptions.highchartDrilldownStackedBarLabelCategoriesOptions);
            optionsDrillDown.drilldown.series= drilldownSeries;
            optionsDrillDown.tooltip.pointFormat= '<br/>CEI: <b>{point.y}</b><br/>';
            optionsDrillDown.yAxis.title= {text:'CEI'};
            $scope.rncFailureDrilldownConfig= {
                options: optionsDrillDown,
                series: [{
                    name: 'GGSN',
                    colorByPoint: false,
                    data: series1Data
                },{
                    name: 'GGSN',
                    colorByPoint: false,
                    data: series2Data
                },{
                    name: 'GGSN',
                    colorByPoint: false,
                    data: series3Data
                }]
            }
        // });
    }

    function pieDrilldown(){
        $scope.pieDrilldownConfig= {
            options: {
                chart: {
                    type: 'pie',
                },
                drilldown: {
                    series: [
                    {
                        name: 'Microsoft Internet Explorer',
                        id: 'Microsoft Internet Explorer',
                        data: [
                            ['v11.0', parseFloat(24.13)],
                            ['v8.0', parseFloat(17.2)],
                            ['v9.0', parseFloat(8.11)],
                            ['v10.0', parseFloat(5.33)],
                            ['v6.0', parseFloat(1.06)],
                            ['v7.0', parseFloat(0.5)]
                        ]
                    }, {
                        name: 'Chrome',
                        id: 'Chrome',
                        data: [
                            ['v40.0', parseFloat(5)],
                            ['v41.0', parseFloat(4.32)],
                            ['v42.0', parseFloat(3.68)],
                            ['v39.0', parseFloat(2.96)],
                            ['v36.0', parseFloat(2.53)],
                            ['v43.0', parseFloat(1.45)],
                            ['v31.0', parseFloat(1.24)],
                            ['v35.0', parseFloat(0.85)],
                            ['v38.0', parseFloat(0.6)],
                            ['v32.0', parseFloat(0.55)],
                            ['v37.0', parseFloat(0.38)],
                            ['v33.0', parseFloat(0.19)],
                            ['v34.0', parseFloat(0.14)],
                            ['v30.0', parseFloat(0.14)]
                        ]
                    }, {
                        name: 'Firefox',
                        id: 'Firefox',
                        data: [
                            ['v40.0', parseFloat(5)],
                            ['v41.0', parseFloat(4.32)],
                            ['v42.0', parseFloat(3.68)],
                            ['v39.0', parseFloat(2.96)],
                            ['v36.0', parseFloat(2.53)],
                            ['v43.0', parseFloat(1.45)],
                            ['v31.0', parseFloat(1.24)],
                            ['v35.0', parseFloat(0.85)]
                        ]
                    }, {
                        name: 'Safari',
                        id: 'Safari',
                        data: [
                            ['v40.0', parseFloat(5)],
                            ['v41.0', parseFloat(4.32)],
                            ['v42.0', parseFloat(3.68)],
                            ['v39.0', parseFloat(2.96)],
                            ['v36.0', parseFloat(2.53)],
                            ['v43.0', parseFloat(1.45)],
                            ['v31.0', parseFloat(1.24)],
                            ['v35.0', parseFloat(0.85)]
                        ]
                    }, {
                        name: 'Opera',
                        id: 'Opera',
                        data: [
                            ['v12.x', 0.34],
                            ['v28', 0.24],
                            ['v27', 0.17],
                            ['v29', 0.16]
                        ]
                    }],
                    
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                        },
                        format: '{point.name}: {point.y:.1f}%'
                    }
                },
                xAxis: {
                    type: 'category'
                },
                title:{
                    "text":null
                }
            },
            series: [{
                name: 'Brands',
                data: [{
                    name: 'Microsoft Internet Explorer',
                    y: parseFloat(56.33),
                    drilldown: 'Microsoft Internet Explorer'
                }, {
                    name: 'Chrome',
                    y: parseFloat(24.03),
                    drilldown: 'Chrome'
                }, {
                    name: 'Firefox',
                    y: parseFloat(10.38),
                    drilldown: 'Firefox'
                }, {
                    name: 'Safari',
                    y: parseFloat(4.77),
                    drilldown: 'Safari'
                }, {
                    name: 'Opera',
                    y: parseFloat(0.91),
                    drilldown: 'Opera'
                }, {
                    name: 'Proprietary or Undetectable',
                    y: parseFloat(0.2),
                    drilldown: null
                }]
            }]
        }
    }

    function defaultLoad(){
        stackedDrilldown();
        // pieDrilldown();
    }
    
    defaultLoad();

    // DateRange Submit event
    $scope.click= function(){
        defaultLoad();
    }

    //Export Nested Object
    $scope.expotNestedjsonObj= function(displayData, type) {
        $scope.getNestedExport(displayData, type);
    }
}
 // RNC Statistics Report Controller ends   
//-----------------------------------------------------------------------------------------------------

// QoS Report Controller
function QoSReportCtrl($scope, $state, httpService, globalConfig, $filter,  dataFormatter, highchartOptions, highchartProcessData, globalData, utility) {

    //track url starts
    utility.trackUrl();
    //end track url

    $scope.QoS= '21000';
    $scope.QoSCountTblOpt= {
        "order" :[]
    }

    function getQoS(QoSCount, QoSCountDevicewise){
        //QoS Count
        $scope.loadingQoSCountDiv= true;
        $scope.DataQoSCountDiv= false;
        $scope.noDataQoSCountDiv= false;

        httpService.get(QoSCount).then(function(response){
            var objArray= response.data;
            
            if(objArray.length>0){
                $scope.QoSCountTableData= angular.copy(objArray);
                $scope.exportQoSCount= angular.copy(objArray);

                $scope.loadingQoSCountDiv= false;
                $scope.DataQoSCountDiv= true;
                $scope.noDataQoSCountDiv= false;
            }else{
                $scope.loadingQoSCountDiv= false;
                $scope.DataQoSCountDiv= false;
                $scope.noDataQoSCountDiv= true;
            }

        })
        
        //QoS Device Wise
        $scope.loadingQoSDeviceWiseDiv= true;
        $scope.DataQoSDeviceWiseDiv= false;
        $scope.noDataQoSDeviceWiseDiv= false;

        httpService.get(QoSCountDevicewise).then(function(response){
            var objArrayDeviceWise= response.data;
            $scope.exportQoSDeviceWise= [];
            $scope.rowDataArray= [];
            $scope.columns= [];
            var responseObj= objArrayDeviceWise;

            if(objArrayDeviceWise.length>0){
                var columnArray= [];
                for(var i in objArrayDeviceWise){
                    var tempColumnArray= []
                    for(var j in objArrayDeviceWise[i].data){
                        tempColumnArray[j]= objArrayDeviceWise[i].data[j].QoSType;
                        responseObj[i].data[j].Count= angular.copy(objArrayDeviceWise[i].data[j].Count);
                    }
                    var temp= _.difference(tempColumnArray, columnArray);
                    if(temp.length > 0){
                        for(j in temp){
                            columnArray.push(temp[j]);
                        }
                    }
                }
                $scope.columns= columnArray;
                var rowDataArray= [];
                for(var j in responseObj){
                    var rowData= [];
                    rowData.push(responseObj[j].Device);
                    for(var i in columnArray){
                        var index= _.findIndex(responseObj[j]['data'], function(o) { return o.QoSType == columnArray[i]; });
                        if(index != -1){
                            rowData.push(responseObj[j]['data'][index]['Count']);
                        }
                        else{
                            rowData.push('-');
                        }
                    }
                    rowDataArray.push(rowData);
                }
                
                $scope.rowDataArray= angular.copy(rowDataArray);
                $scope.exportQoSDeviceWise= angular.copy(objArrayDeviceWise);

                $scope.loadingQoSDeviceWiseDiv= false;
                $scope.DataQoSDeviceWiseDiv= true;
                $scope.noDataQoSDeviceWiseDiv= false;
            }else{
                $scope.loadingQoSDeviceWiseDiv= false;
                $scope.DataQoSDeviceWiseDiv= false;
                $scope.noDataQoSDeviceWiseDiv= true;
            }
        })

    }

    function getQoSCountDateRange(){
        var QoSCountDateRangeURL= globalConfig.pullfilterdataurlbyname+"QoS Day wise Count for selected QoSType"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z"+"&QoS=["+$scope.QoS+"]";

        //QoS Date Range Count(Bar chart)
        $scope.loadingQoSCountDateRangeDiv= true;
        $scope.dataQoSCountDateRangeDiv= false;
        $scope.noDataQoSCountDateRangeDiv= false;

        httpService.get(QoSCountDateRangeURL).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= "QoSType";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";

                var QoSCountDateRangeOptions= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                var xAxisData= highchartProcessData.barColumnProcessHighchartData(paramObject);
                QoSCountDateRangeOptions.xAxis.categories= xAxisData;
                QoSCountDateRangeOptions.xAxis.labels.format= "{value:%e %b}";
                QoSCountDateRangeOptions.chart.height= 400;
                
                paramObject.flag= "series";
                
                var dataStackedBar= highchartProcessData.barColumnProcessHighchartData(paramObject);
                
                $scope.QoSCountBarChartConfig= {
                    options: QoSCountDateRangeOptions,
                    series: dataStackedBar
                }

                $scope.loadingQoSCountDateRangeDiv= false;
                $scope.dataQoSCountDateRangeDiv= true;
                $scope.noDataQoSCountDateRangeDiv= false;
            }else{
                $scope.loadingQoSCountDateRangeDiv= false;
                $scope.dataQoSCountDateRangeDiv= false;
                $scope.noDataQoSCountDateRangeDiv= true;
            }
        })
    
    }

    function defaultLoad(){
        var QoSCountURL= globalConfig.pullfilterdataurlbyname+"QoS Count and Max DL UL"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z&toDate="+$scope.dateSelect+"T23:59:59.999Z";
        var QoSCountDevicewiseURL= globalConfig.pullfilterdataurlbyname+"QoS Device Wise Count and MaxDl-UL Report"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z&toDate="+$scope.dateSelect+"T23:59:59.999Z";
        
        getQoS(QoSCountURL, QoSCountDevicewiseURL);
        //getQoSCountDateRange();
    }
    
    defaultLoad();

    // DateRange Submit event
    $scope.click= function(){
        defaultLoad();

    }
    //change Date event
    $scope.changeDate=function (modelName, newDate) {
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    //End DateRange Option

    //export QoS Type IMSI List
    $scope.exportQoSType= function(QoSType, format){
        console.log("QoSType", QoSType);
        // console.log("Format", format);
        // $scope.loading = true;
        var QoSIMSIExportURL= globalConfig.pullfilterdataurlbyname+"QoS Export IMSIs"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z&toDate="+$scope.dateSelect+"T23:59:59.999Z"+"&QoS="+QoSType;
        httpService.get(QoSIMSIExportURL).then(function(response){
            var objArray= response.data;
            // $scope.loading = false;
            $scope.getSimpleJSONExport(objArray, format, QoSType+" IMSIs Detail")
        })
    }

    //Export Nested Object
    $scope.expotNestedjsonObj= function(displayData, type) {
        
        $scope.getNestedExport(displayData, type);
    }

    //Select QoS
    $scope.selectQoS= function(QoS){
        $scope.QoS= QoS;
        getQoSCountDateRange();
    }

    //QoS Device wise, Table Click event
    $scope.tableClick= function(element, index, rowDataArray, columns){
        $scope.rowClick= function(indexRow){
            
            var getIMSIListURL= globalConfig.pullfilterdataurlbyname+"QoS Export IMSIs for selected Device QoS"+"&QoS="+columns[index-1]+"&Device="+rowDataArray[indexRow][0]+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z&toDate="+$scope.dateSelect+"T23:59:59.999Z";

            httpService.get(getIMSIListURL).then(function(response){
                var objArray= response.data;
                console.log("objArray", objArray);
                $scope.getSimpleJSONExport(objArray, 'csv', " IMSIs Detail for QoS "+columns[index-1]+" & Device "+rowDataArray[indexRow][0]);
            })
            
        }
    }
}
 // QoS Report Controller ends   
//-----------------------------------------------------------------------------------------------------
// Usage Trend Ctrl
function usageTrendRptCtrl($scope, $state, httpService, globalConfig, $filter,  dataFormatter, utility, highchartOptions) {

    //track url starts
    utility.trackUrl();
    //end track url

    $scope.select= {}
    if(/App/.test($scope.headerName)){
        $scope.models= "App";
        // $scope.select.app= 'Youtube';
    }else if(/Plan/.test($scope.headerName)){
        $scope.models= "Plan";
        // $scope.select.app= '4141';
    }else if(/Protocol/.test($scope.headerName)){
        $scope.models= "Protocol";
        // $scope.select.app= 'https';
    }else if(/Segment/.test($scope.headerName)){
        $scope.models= "Segment";
        // $scope.select.app= 'Postpaid';
    }
    
    console.log("$scope.headerName", $scope.headerName);
    // var fromDate= $filter('date')( new Date().getTime() -7*24*3600*1000 , "yyyy-MM-dd");
    // var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    // $scope.date= {"start": fromDate, "end": toDate};    
    
    var usageTrendURL;

    function loadingDiv(loadingDivStatus,dataDivStatus, noDataDivStatus){
        $scope.loadingUsageTrendDiv= loadingDivStatus;
        $scope.dataUsageTrendDiv= dataDivStatus;
        $scope.noDataUsageTrendDiv= noDataDivStatus;
    }

    function getUsageTrend(url){
        $scope.exportUsageTrend= [];
        loadingDiv(true, false, false);
        httpService.get(url).then(function(response){
            var objArray= angular.copy(response.data);
            
            if(objArray.length>0){
                $scope.exportUsageTrend= angular.copy(objArray);
                var xLabelArray= [], dataArray= [];
                for( var i in objArray){
                    xLabelArray[i]= objArray[i].Date;
                    dataArray[i]= objArray[i].Usage;
                }
                
                var formattedData= dataFormatter.convertFixUnitUsageDataWoUnit(dataArray, 3)

                var usageTrendBarOpt= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                
                usageTrendBarOpt.tooltip.pointFormat= 'Usage<b> {point.y:.3f} '+formattedData[1];

                usageTrendBarOpt.yAxis.title.text= "Usage("+formattedData[1]+")";

                usageTrendBarOpt.xAxis.categories= angular.copy(xLabelArray);
                usageTrendBarOpt.xAxis.labels= {
                    "format": "{value:%e %b}",
                    "align": "left"
                };

                $scope.usageTrendBarChartConfig= {
                    options: usageTrendBarOpt,
                    series: [{
                        color: "rgb(39, 174, 96)",
                        name: $scope.models+'Usage Trend',
                        data: angular.copy(formattedData[0])
                    }]
                    
                }

                loadingDiv(false, true, false);
            }else{
                loadingDiv(false, false, true);
            }
        })
    }

    var drpdwnListURL= globalConfig.pulldataurlbyname+$scope.models+" Filter";
    
    getPlanList(drpdwnListURL);
    
    $scope.drpdwmListArray= [];
    function getPlanList(url){
        httpService.get(url).then(function(response){
           
            var objArray= response.data;
            //console.log("plan list", objArray);
            for(var i in objArray){
                $scope.drpdwmListArray.push(objArray[i][$scope.models]);
            }
            $scope.select.app= $scope.drpdwmListArray[0];
            defaultLoad();
        })
    }


    function topModelsTable(url){
        loadingDiv(true, false, false);
        httpService.get(url).then(function(response){
            var ObjArray= response.data;
            if(ObjArray.length>0){
                var rowLength= $scope.rowCount;
                var keysTopModelArray= _.keys(ObjArray[0]['data'][0]);
                $scope.colSpan= keysTopModelArray.length
                var keysModifiedArray= [], index= -1, tableData= [];
                for(var i in ObjArray)
                {
                    for(var j in keysTopModelArray)
                        keysModifiedArray[++index]= keysTopModelArray[j];
                }
                $scope.colHeader= angular.copy(keysModifiedArray);

                for(var i=0; i<rowLength; i++){
                    var index= -1, tabData= [];
                    for(var j in ObjArray){
                        if(ObjArray[j].data.length == rowLength){
                            for(var l in keysTopModelArray){
                                switch(keysTopModelArray[l]){
                                    case 'Usage':{
                                        tabData[++index]= dataFormatter.formatUsageData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                        break;
                                    }
                                    case 'Count':{
                                        tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                        break;
                                    }
                                    case 'Sessions':{
                                        tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                        break;
                                    }
                                    case 'Duration':{
                                        tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                        break;
                                    }
                                    default:{
                                        tabData[++index]= ObjArray[j].data[i][keysTopModelArray[l]];
                                        break;
                                    }
                                }
                            } 
                        }else{
                            if(angular.isDefined(ObjArray[j].data[i])){
                                for(var l in keysTopModelArray){
                                    switch(keysTopModelArray[l]){
                                        case 'Usage':{
                                            tabData[++index]= dataFormatter.formatUsageData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                            break;
                                        }
                                        case 'Count':{
                                            tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                            break;
                                        }
                                        case 'Sessions':{
                                            tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                            break;
                                        }
                                        case 'Duration':{
                                            tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],2);
                                            break;
                                        }
                                        default:{
                                            tabData[++index]= ObjArray[j].data[i][keysTopModelArray[l]];
                                            break;
                                        }
                                    }
                                }
                            }else{
                                for(var l in keysTopModelArray)
                                    tabData[++index]= '-';
                            }
                        }
                    }
                    tableData[i]= angular.copy(tabData);
                }
                $scope.keysTopModel= angular.copy(tableData);
                $scope.topModelsObj= ObjArray;
                loadingDiv(false, true, false);
            }else{
                loadingDiv(false, false, true);
            }
        })
    }

    function defaultLoad(){
        
        usageTrendURL= globalConfig.pullfilterdataurlbyname+"Selected "+$scope.models+" Usage Trend"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+$scope.models+"="+$scope.select.app;
                
        getUsageTrend(usageTrendURL);
    }
    
    // defaultLoad();

    // DateRange Submit event
    $scope.click= function(){
        defaultLoad();
    }

    //Export Nested Object
    $scope.expotNestedjsonObj= function(displayData, type, name) {
        
        $scope.getNestedExport(displayData, type, name);
    }
}
 //Usage Trend Ctrl ends   
//-----------------------------------------------------------------------------------------------------