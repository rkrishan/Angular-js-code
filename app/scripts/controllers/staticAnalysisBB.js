'use strict';

angular
    .module('specta')
    .controller('planUsageAnalyticsBBCtrl',planUsageAnalyticsBBCtrl)
    .controller('dateBBCtrl',dateBBCtrl)
    .controller('planAppAnalyticsBBCtrl',planAppAnalyticsBBCtrl)
    .controller('videoAnalyticsBBCtrl',videoAnalyticsBBCtrl)
    .controller('oltAnalyticsBBCtrl',oltAnalyticsBBCtrl)
    .controller('appOLTUsageBBCtrl',appOLTUsageBBCtrl)
    .controller('BBbillPlanUtilizationCtrl',BBbillPlanUtilizationCtrl)
    .controller('countryWiseTrafficBBCtrl',countryWiseTrafficBBCtrl)
    .controller('topUsersTrendBBCtrl',topUsersTrendBBCtrl)
    .controller('cxoAnalyticsBBCtrl',cxoAnalyticsBBCtrl)
    .controller('customerDetailsBBCtrl',customerDetailsBBCtrl)
    .controller('protocolThroughputBBCtrl',protocolThroughputBBCtrl)
    .controller('appTrendBBCtrl',appTrendBBCtrl)
    .controller('appPerformanceBBCtrl',appPerformanceBBCtrl)
    .controller('planProfitabilityRealisationBBCtrl',planProfitabilityRealisationBBCtrl)
    .controller('churnRedirectionBBCtrl',churnRedirectionBBCtrl)
    .controller('planAnalyticsRedirectBBCtrl',planAnalyticsRedirectBBCtrl)
    .controller('topCountryUsageBBCtrl',topCountryUsageBBCtrl)
    .controller('planAnalyticsBBCtrl',planAnalyticsBBCtrl)
    .controller('OLTUtilizationBBCtrl',OLTUtilizationBBCtrl)
    .controller('topSubscribersBBCtrl',topSubscribersBBCtrl)
    .controller('UsageCEIMappingBBCtrl',UsageCEIMappingBBCtrl)
    .controller('PowerLevelReportBBCtrl', PowerLevelReportBBCtrl)
    .controller('customerAnalyticsDistributionBBCtrl',customerAnalyticsDistributionBBCtrl)
    .controller('dnsAnalyticsBBCtrl',dnsAnalyticsBBCtrl)
    .controller('cdnAnalyticsBBCtrl',cdnAnalyticsBBCtrl)
    .controller('churnAnalyticsBBCtrl',churnAnalyticsBBCtrl)
    .controller('radiusAccountingTerminationBBCtrl',radiusAccountingTerminationBBCtrl)
    .controller('radiusAuthenticationBBCtrl',radiusAuthenticationBBCtrl)
    .controller('forecastingTpCtrl',forecastingTpCtrl)
    .controller('forecastingOutageCtrl',forecastingOutageCtrl)
    .controller('forecastingEquipCtrl',forecastingEquipCtrl)
    .controller('oltOutageCtrl',oltOutageCtrl)
    .controller('nodeAnalyticsBBCtrl',nodeAnalyticsBBCtrl);

// ========================================================

// Node Analytics control
function nodeAnalyticsBBCtrl($scope,$http,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, utility){
    //track url starts
    utility.trackUrl();
    //end track url
    //    --------------------------------------------------------------
   $scope.nodeSelect= {};
    
    $http.get(globalConfig.pulldataurlbyname +'Node Filter').then(function (response) {
        var nodeData= response.data;
        var node= [];
        for(var i=0; i<nodeData.length;i++){
            node[i]= nodeData[i].Node;
        }
        $scope.node= node;
        $scope.nodeSelect={node: node[0]};
        defaultLoad();

    })


        //    ---------------------------------------------------------

    function latencyCount(url){
        $scope.loadingLatencyCountDiv= true;
        $scope.noDataLatencyCountDiv= false;
        
        $http.get(url).then(function (response) { 

            var objArray = response.data;
            //console.log("length:",objArray.length);
            if(objArray.length>0){
                
                $scope.exportLatencyCount= angular.copy(objArray);
                var latencyData= [];
                for (var i = 0; i < objArray.length; i++) {
                    latencyData[i]= [objArray[i].Latency,objArray[i].Count];
                }
                var latencyCountChartOption= angular.copy(highchartOptions.highchartScatterLabelCategoriesOptions);
                latencyCountChartOption.xAxis.title.text= 'Latency(ms)'
                latencyCountChartOption.yAxis.title.text= 'Count'
                $scope.latencyCountData = {
                    "options": latencyCountChartOption,
                    series:[{
                        name: 'Latency Count',
                        data: latencyData
                    }]
                };  
                $scope.loadingLatencyCountDiv= false;
                $scope.noDataLatencyCountDiv= false;
            }else{
                $scope.loadingLatencyCountDiv= false;
                $scope.noDataLatencyCountDiv= true;
            }
            
        });
    }

    function throughputCount(url){
        $scope.loadingThroughputCountDiv= true;
        $scope.noDataThroughputCountDiv= false;

        $http.get(url).then(function (response) { 

            // console.log("response:", response.data);
            var objArray = response.data;
            
            if(objArray.length>0){
                $scope.exportThroughputCount= angular.copy(objArray);
                var throughputData= [];
                for (var i = 0; i < objArray.length; i++) {
                    throughputData[i]= [(objArray[i].Throughput/1024).toFixed(3),objArray[i].Count];
                }
                var throughputCountChartOption= angular.copy(highchartOptions.highchartScatterLabelCategoriesOptions);
                throughputCountChartOption.xAxis.title.text= 'Throughput(Kbps)'
                throughputCountChartOption.yAxis.title.text= 'Count'
                $scope.throughputCountData = {
                    "options": throughputCountChartOption,
                    series:[{
                        name: 'Throughput Count',
                        data: throughputData
                    }]
                };
                $scope.loadingThroughputCountDiv= false;
                $scope.noDataThroughputCountDiv= false;
            }else{
                $scope.loadingThroughputCountDiv= false;
                $scope.noDataThroughputCountDiv= true;
            }
        });
    }

    function defaultLoad(){

        var node= $scope.nodeSelect.node;
        console.log("node: ", node);
        var latencyCountURL = globalConfig.pulldataurlbyname+'Node wise Latency for Scatter'+"&fromdate="+$scope.date.start+"T00:00:00.000Z&todate="+$scope.date.end+"T00:00:00.000Z&node="+node;

        var throughputCountURL = globalConfig.pulldataurlbyname+'Node wise Throughput for Scatter'+"&fromdate="+$scope.date.start+"T00:00:00.000Z&todate="+$scope.date.end+"T00:00:00.000Z&node="+node;

        latencyCount(latencyCountURL);
        throughputCount(throughputCountURL);
    }

    //    Submit button Click event
    $scope.click= defaultLoad;
}
// End Node Analytics Controller
//-------------------------------------------------------------------------------

//Plan Usage Analytics controller
function planUsageAnalyticsBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions){
    
    //track url starts
    utility.trackUrl();
    //end track url

    var planListURL= globalConfig.pulldataurlbyname+"Plan Filter";
    getPlanList(planListURL);
    var planListArray= [];
    $scope.select= {};
    $scope.select.usage= "$gte:";
    $scope.select.usageValue= 50;
    $scope.select.unit= 'GB';
    $scope.unit= [{'unit': 'Bytes'}, {'unit': 'KB'}, {'unit': 'MB'}, {'unit': 'GB'}]

    $scope.exportObj= {};
    
    $scope.dataTableOptions= {
        "paging": true, 
        "searching": true,
        "bSort": true,
        "bLengthChange": true,
        "bInfo": true,
    };

    $scope.exportModule = function(id, type){
        
        // sample data
        /*var columns = ["ID", "Name", "Country"];
        var data = [
            [1, "Shaw", "Tanzania"],
            [2, "Nelson", "Kazakhstan"],
            [3, "Garcia", "Madagascar"],
        ];*/
        var header= "Subscriber Usage for Plan "+$scope.planName+"  between Date "+$scope.sDate+" - "+$scope.edate+", Usage "+$scope.ltorgt+$scope.val;
        var title= 'Plan Usage Analytics_Subscriber Usage';
        
        // Only pt supported
        var doc = new jsPDF('p', 'pt');
        var res = doc.autoTableHtmlToJson(document.getElementById(id));
        console.log("res", res);
        doc.autoTable(res.columns, res.data,{
            
            theme:'grid',
            showHeader: 'everyPage',
            beforePageContent:function(data){
                // console.log("data", data);
                doc.setFontSize(9);
                doc.setTextColor('#1ab394');
                doc.setFontStyle('normal');
                doc.text(header,data.settings.margin.left + 0, 40);
            },
            margin: {top: 50},
        });
        doc.save(title+'.pdf');
    }

    function getPlanList(url){
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            
            for(var i in objArray){
                planListArray[i]= objArray[i].Plan;
            }
            $scope.planNameList= angular.copy(planListArray);
            $scope.select.plan= planListArray[0];
            defaultLoad();
        })
    }
    $scope.planUsageData= [];
    $scope.planUsageHeaderData= [];
    $scope.loadingPlanUsageDiv= true; 
    $scope.noDataPlanUsageDiv= false;

    function getPlanUsageData(url){
        $scope.planUsageData= [];
        $scope.planUsageHeaderData= [];
        $scope.loadingPlanUsageDiv= true; 
        $scope.noDataPlanUsageDiv= false;
        httpService.get(url).then(function(response){
            var ObjArray = response.data;
            var exptObjArray= angular.copy(ObjArray);
            
            if(ObjArray.length>0){
                for(var i in ObjArray){
                    ObjArray[i].Usage= angular.copy(dataFormatter.formatUsageData(ObjArray[i].Usage,3));
                    exptObjArray[i]['Usage(Bytes)']= exptObjArray[i].Usage;
                    delete exptObjArray[i]['Usage'];
                }
                $scope.planUsageData= angular.copy(ObjArray);
                
                $scope.exportPlanUsage= angular.copy(exptObjArray);

                $scope.planUsageHeaderData= Object.keys(ObjArray[0])
                $scope.loadingPlanUsageDiv= false; 
                $scope.noDataPlanUsageDiv= false;
            }else{
                $scope.loadingPlanUsageDiv= false; 
                $scope.noDataPlanUsageDiv= true;
            }
        })
    }

    function defaultLoad(){

        var usageValue= $scope.select.usageValue;
        if(angular.isDefined($scope.select.usageValue)){
            
            switch($scope.select.unit){
                case 'Bytes':
                    break;
                
                case 'KB':
                    usageValue= 1024*usageValue;
                    break;
                  
                case 'MB':
                    usageValue= 1024*1024*usageValue;
                    break;
                case 'GB':
                    usageValue= 1024*1024*1024*usageValue;
                    break;
                }
        }

        $scope.planName= $scope.select.plan;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;
        if($scope.select.usage=='$gte:')
            $scope.ltorgt= '>=';
        else
            $scope.ltorgt= '=<';
        $scope.val= $scope.select.usageValue+$scope.select.unit; 

        //export fileName and fieHeader
        $scope.exportObj.fileName= 'PlanUsageAnalytics_SubscriberUsage';
        $scope.exportObj.fileHeader= "Subscriber Usage for Plan-"+$scope.planName+" between Date "+$scope.sDate+" - "+$scope.edate+", Usage"+$scope.ltorgt+$scope.val;
        
        var tempUsage= "{"+$scope.select.usage+usageValue+"}";
        tempUsage= encodeURIComponent(tempUsage);
        var planUsageURL = globalConfig.pullfilterdataurlbyname+'User for Selected Plan and Usage'+"&fromDate="+$scope.date.start+'T00:00:00.000Z&toDate='+$scope.date.end+'T00:00:00.000Z&Plan='+$scope.select.plan+"&UsageFilter="+tempUsage;
       
        getPlanUsageData(planUsageURL);
    }

    //dateRange select event
    $scope.click= function(){
        defaultLoad();
    }
}
// End Plan Usage Analytics controller
//------------------------------------------------------------------------

//Plan App Analytics controller
function planAppAnalyticsBBCtrl($scope, $http, $filter,dataFormatter,globalConfig,utility, flotChartOptions, $timeout){

    //track url starts
    utility.trackUrl();
    //end track url

    var chartOptions= {};
    chartOptions.appDistPlansOptions= angular.copy(flotChartOptions.flotDoughnutChartOptions);
    chartOptions.appDistPlansOptions.legend.show= true;
    $scope.optionsFlotPie= chartOptions.appDistPlansOptions;
    function appDistAcrossPlans(url, plan){
        var appDistPlansData= [];
        $http.get(url).then(function(response){
            var ObjArray = response.data;
            for(var i=0; i<ObjArray.length; i++){
                appDistPlansData[i]= {'label': ObjArray[i].App, 'data': ObjArray[i].Usage};
            }
            
            //chartOptions.appTrafficFlotLineOptions.legend.position= "nw";
            console.log("appDistPlansData", appDistPlansData, plan);
         })
        return [appDistPlansData, plan];    
    }
    
    function appDistPlansGetData(){
        var appDistAcrossPlansObject= [];
        var appDistAcrossPlan= globalConfig.pulldataurlbyname+"Plan wise App usage for last week&Plan=";
        var appDistAcrossSapphireURL= appDistAcrossPlan+'Sapphire';
        var appDistAcrossPearlURL= appDistAcrossPlan+'Pearl';
        var appDistAcrossGamersURL= appDistAcrossPlan+'Gamers';
        var appDistAcrossSmallOfficeURL= appDistAcrossPlan+'Small Office';
        var appDistAcrossSurferLiteURL= appDistAcrossPlan+'Surfer Lite';
        var appDistAcrossUltimateComboURL= appDistAcrossPlan+'Ultimate Combo';
        var appDistAcrossDiamondURL= appDistAcrossPlan+'Diamond';
        var appDistAcrossSurferHeavyURL= appDistAcrossPlan+'Surfer Heavy';
        var appDistAcrossMovieStreamerURL= appDistAcrossPlan+'Movie Streamer';
        var appDistAcrossL3NotProvURL= appDistAcrossPlan+'L3-NotProv';
        var appDistAcrossELITEURL= appDistAcrossPlan+'ELITE';
        var plansArray= ['Sapphire', 'Pearl', 'Gamers', 'Small Office', 'Surfer Lite', 'Movie Streamer', 'L3-NotProv', 'ELITE', 'Ultimate Combo', 'Diamond', 'Surfer Heavy']
        var appDistPlansURLArray= [appDistAcrossSapphireURL, appDistAcrossPearlURL, appDistAcrossGamersURL, appDistAcrossSmallOfficeURL, appDistAcrossSurferLiteURL, appDistAcrossMovieStreamerURL, appDistAcrossL3NotProvURL, appDistAcrossELITEURL, appDistAcrossUltimateComboURL, appDistAcrossDiamondURL, appDistAcrossSurferHeavyURL]
        
        for(var i=0; i<appDistPlansURLArray.length; i++){
            appDistAcrossPlansObject[i]= appDistAcrossPlans(appDistPlansURLArray[i], plansArray[i]);
        }
        $timeout(function(){
            console.log("appDistAcrossPlansObject",appDistAcrossPlansObject);
            $scope.appDistAcrossPlansObject= appDistAcrossPlansObject;
        }, 500)
        
    }
   function defaultLoad(){
       
       appDistPlansGetData();
    
    }
    defaultLoad();
}
// End BB Bill Plan Analytics Ctrl controller

//BB Video Analytics Controller
function videoAnalyticsBBCtrl($scope, highchartOptions,httpService, $filter,dataFormatter,globalConfig, flotChartOptions,utility, highchartProcessData){

    //track url starts
    utility.trackUrl();
    //end track url

    var colorpallete= ['#f1c40f', '#7C4DFF','#92F22A','#e74c3c', '#0C555C',  '#C25396',   '#7f8c8d' ,'#64DDBB',  '#97CE68', '#897FBA', '#2C82C9', '#83D6DE', '#008891', '#1F9EA3',  '#14967C'];
    var currentTab= "UsageAndUsers";

    function getMultilineData(){
        var OLTDistributionUsageChartOptions= {};
        
        $scope.loadingUsersDistributionDiv= true;
        $scope.DataUsersDistributionDiv= false;
        $scope.noDataUsersDistributionDiv= false;

        $scope.usageDistributionChartConfig= null;
        
        httpService.get(urlUsage).then(function(response){
            
            var OLTWiseUsageFormatArray= [], OLTWiseLabelArray= [], OLTWiseUsageData= [];
            var objArray= response.data;
            $scope.exportUsageDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Usage";
                paramObject.seriesName= tab;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var OLTDistributionUsageChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                OLTDistributionUsageChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                OLTDistributionUsageChartOptions.chart.height= 300;
                OLTDistributionUsageChartOptions.yAxis.title= {"text":"Usage (GB)"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.usageDistributionChartConfig= {
                    options: OLTDistributionUsageChartOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                
                $scope.exportUsageDistribution= angular.copy(objArray);

                $scope.loadingUsageDistributionDiv= false;
                $scope.DataUsageDistributionDiv= true;
                $scope.noDataUsageDistributionDiv= false;
            }else{
                $scope.loadingUsageDistributionDiv= false;
                $scope.DataUsageDistributionDiv= false;
                $scope.noDataUsageDistributionDiv= true;
            }
        })
    }

    function getStackedBarData(){
        var OLTDistributionUsersChartOptions= {};
        
        $scope.loadingUsersDistributionDiv= true;
        $scope.DataUsersDistributionDiv= false;
        $scope.noDataUsersDistributionDiv= false;

        $scope.usersDistributionChartOptions= null;

        httpService.get(urlUsers).then(function(response){
            
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportUsersDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Users";
                paramObject.seriesName= tab;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                OLTDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                /*OLTDistributionUsersChartOptions.yAxis.stackLabels.formatter= function() {
                    return dataFormatter.formatUsageData(this.total, 2);
                }*/
                OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                OLTDistributionUsersChartOptions.tooltip.shared= false;
                OLTDistributionUsersChartOptions.chart.height= 300;
                OLTDistributionUsersChartOptions.yAxis.title= {"text":"Users"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.usersDistributionChartOptions= {
                    options: OLTDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportUsersDistribution= angular.copy(objArray);

                $scope.loadingUsersDistributionDiv= false;
                $scope.DataUsersDistributionDiv= true;
                $scope.noDataUsersDistributionDiv= false;
            }else{
                $scope.loadingUsersDistributionDiv= false;
                $scope.DataUsersDistributionDiv= false;
                $scope.noDataUsersDistributionDiv= true;
            }
        })
    }

    function defaultLoad(){
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;

        switch(currentTab){
                
            case 'Usage':
               
                usageAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Usage Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";
                
                AppsMultiline(usageAppsMultilineURL, currentTab);
                break;
            
            case 'Visits':
                visitsAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Visits Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";
                
                AppsMultiline(visitsAppsMultilineURL, currentTab);
                break;
            
            case 'Duration':
                
                durationAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Duration Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";
                
                AppsMultiline(durationAppsMultilineURL, currentTab);
                break;
            
        }
    }
    
    defaultLoad(); 
    
    $scope.click= function(){
        defaultLoad();
    }
}
// End Video Analytics controller
//---------------------------------------------------------------------

// OLT Analytics trend(Added to node report) Controller
function oltAnalyticsBBCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,flotChartOptions,  highchartOptions,  highchartProcessData, utility) {
    
    //track url starts
    utility.trackUrl();
    //end track url

    $scope.showTabObj= angular.copy(utility.tb.nodeReport)
    // console.log("pageName ", $scope.headerName);
    var pageName= $scope.headerName;
    var tabName= 'Usage Distribution'; 
    
    console.log($scope.exportFileTitle);

    function getCurrentTab(){
        if($scope.showTabObj.UsageDistribution){
            $scope.currentTab= 'Usage';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.SubscriberDistribution){
            $scope.currentTab= 'Users';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.ThroughputDistribution){
            $scope.currentTab= 'Throughput';
            return $scope.currentTab;
        }
    }
    $scope.currentTab= getCurrentTab();
    function getOLTData(objArray, tab){

        var OLTDistributionUsageChartOptions= {};
        var OLTDistributionUsersChartOptions= {};
        
        $scope.loadingOLTDiv= true;
        $scope.DataOLTDiv= false;
        $scope.noDataOLTDiv= false;
        
        $scope.loadingOLTUsersDiv= true;
        $scope.DataOLTUsersDiv= false;
        $scope.noDataOLTUsersDiv= false;

        $scope.OLTwiseDistributionMultiLineChartConfig= null;
        $scope.OLTwiseUsersDistributionChartConfig= null;

        if(tab == 'Users'){
            if(objArray.length>0){
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Hour";
                paramObject.data= 'Subscribers';
                paramObject.seriesName= 'OLT';
                paramObject.seriesdata= "Data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelCategoriesOptions);
                OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                OLTDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                /*OLTDistributionUsersChartOptions.yAxis.stackLabels.formatter= function() {
                    return dataFormatter.formatUsageData(this.total, 2);
                }*/
                OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                OLTDistributionUsageChartOptions.xAxis= {title:{text:"Hours"}};
                OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                OLTDistributionUsersChartOptions.tooltip.shared= false;
                OLTDistributionUsersChartOptions.chart.height= 400;
                OLTDistributionUsersChartOptions.legend= {maxHeight: 60};
                OLTDistributionUsersChartOptions.yAxis.title= {"text":"Subscribers"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.OLTwiseUsersDistributionChartConfig= {
                    options: OLTDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                $scope.loadingOLTUsersDiv= false;
                $scope.DataOLTUsersDiv= true;
                $scope.noDataOLTUsersDiv= false;
            }else{
                $scope.loadingOLTUsersDiv= false;
                $scope.DataOLTUsersDiv= false;
                $scope.noDataOLTUsersDiv= true;
            }
        }else{
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Hour";
                paramObject.data= tab;
                paramObject.seriesName= "OLT";
                paramObject.seriesdata= "Data";
                paramObject.flag= "xAxis";
                if(tab=='Throughput')
                    paramObject.unit= "Mbps"

                console.log("paramObject", paramObject);
                
                var OLTDistributionUsageChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                OLTDistributionUsageChartOptions.xAxis.type= 'categories';
                OLTDistributionUsageChartOptions.xAxis.labels= {};
                OLTDistributionUsageChartOptions.xAxis.title= {text:"Hours"};
                OLTDistributionUsageChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                OLTDistributionUsageChartOptions.chart.height= 400;
                OLTDistributionUsageChartOptions.yAxis.title= {"text":"Usage (GB)"};

                if(tab=='Throughput')
                    OLTDistributionUsageChartOptions.yAxis.title= {"text":"Throughput (Mbps)"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.OLTwiseDistributionMultiLineChartConfig= {
                    options: OLTDistributionUsageChartOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                
                $scope.loadingOLTDiv= false;
                $scope.DataOLTDiv= true;
                $scope.noDataOLTDiv= false;
            }else{
                $scope.loadingOLTDiv= false;
                $scope.DataOLTDiv= false;
                $scope.noDataOLTDiv= true;
            }
        }
    }

    // $scope.currentTab= "Usage";
    //default Load
    function defaultLoad(){
        $scope.edate= $scope.dateSelect;

        $scope.exportOLTUsg= {};
        $scope.exportOLTUsg.fileName= "OLT Report_Usage Distribution";
        $scope.exportOLTUsg.fileHeader= "OLT wise Usage Distribution for Date "+$scope.edate;
                
        $scope.exportOLTSub= {};
        $scope.exportOLTSub.fileName= "OLT Report_Subscribers Distribution";
        $scope.exportOLTSub.fileHeader= "OLT wise Subscriber Distribution for Date "+$scope.edate;
                
        $scope.exportOLTTph= {};
        $scope.exportOLTTph.fileName= "OLT Report_Throughput Distribution";
        $scope.exportOLTTph.fileHeader= "OLT wise Throughput Distribution for Date "+$scope.edate;

        $scope.exportFileTitle= utility.getExportTitle(pageName, tabName, $scope.edate);
        var OLTwiseHourlyStatementURL= globalConfig.pulldataurlbyname+"OLT wise hourly Values&fromDate="+$scope.dateSelect+"T00:00:00.000Z&toDate="+$scope.dateSelect+"T23:59:59.999Z&Node=";

        $scope.objArray= [];
        
        $scope.loadingOLTDiv= true;
        $scope.DataOLTDiv= false;
        $scope.noDataOLTDiv= false;

        httpService.get(OLTwiseHourlyStatementURL).then(function(response){
            $scope.objArray= response.data;
            if($scope.objArray.length>0){
                var exportOLTData= angular.copy($scope.objArray);
                for(var i in exportOLTData){
                    for(var j in exportOLTData[i]['Data']){
                        exportOLTData[i]['Data'][j]['Usage(Bytes)']=  exportOLTData[i]['Data'][j]['Usage']; 
                        exportOLTData[i]['Data'][j]['Throughput(bps)']=  exportOLTData[i]['Data'][j]['Throughput']; 
                        delete exportOLTData[i]['Data'][j]['Usage'];
                        delete exportOLTData[i]['Data'][j]['Throughput'];
                    }
                }
                $scope.exportOLTData= angular.copy(exportOLTData);
                getOLTData($scope.objArray, $scope.currentTab);

                $scope.loadingOLTDiv= false;
                $scope.DataOLTDiv= true;
                $scope.noDataOLTDiv= false;
            }else{
                $scope.loadingOLTDiv= false;
                $scope.DataOLTDiv= false;
                $scope.noDataOLTDiv= true;
            }
        })
        
    }
    defaultLoad();

    $scope.tabClicked= function(tab){
        $scope.currentTab= tab;
        getOLTData($scope.objArray, $scope.currentTab);
    }

    $scope.changeDate=function (modelName, newDate) {
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    
    $scope.click= function(){
        defaultLoad();
    }
}
// End OLT Analytics Controller
// ----------------------------------------------------------------------------

// App-OLT Usage  Controller
function appOLTUsageBBCtrl($scope, $http,globalConfig,$filter,$timeout,$rootScope,dataFormatter,flotChartOptions, utility,highchartOptions,  highchartProcessData) {
    
    //track url starts
    utility.trackUrl();
    //end track url

    $scope.selectApp= {};
    $scope.selectOLT= {};
    //--------------------------------------------------------------
    //Filter Section
    var selectedDate;
    // $scope.dateSelect= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    $scope.minDate= moment('2016-06-03');
    $scope.maxDate= moment.tz('UTC').add(0, 'd').hour(12).startOf('h');
    
    var todayDate= {"fromDate": $scope.dateSelect, "toDate":""}
    
    var yesterdayDate= {"fromDate": $filter('date')( new Date($scope.dateSelect).getTime()- 24*3600*1000 , "yyyy-MM-dd"), "toDate": ""};
    
    var currentHour= new Date().getHours();
    todayDate.toDate= $scope.dateSelect+"T"+currentHour;
    yesterdayDate.toDate= yesterdayDate.fromDate+"T"+currentHour;
    //End of Filter Section
    //--------------------------------------------------------------
    
    // OLT wise Usage Distribution MultiLine Chart 
    
    function OLTwiseUsageDistribution(url){
        $scope.loadingOLTDiv= true;
        $scope.noDataOLTDiv= false;
        $scope.DataOLTDiv= false;
        $http.get(url).then(function (response) {  
            var objArray = response.data;
            
            if(objArray.length>0){
                
                var OLTMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                OLTMultiLineOptions.yAxis.title.text= "Usage (GB)";
                OLTMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(objArray, "Date", "Usage", "data", "App", "xAxis");
                
                $scope.OLTwiseUsageDistributionMultiLineChartConfig= {
                    options: OLTMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(objArray, "Date", "Usage", "data", "App", "series")
                }
                $scope.loadingOLTDiv= false;
                $scope.noDataOLTDiv= false;
                $scope.DataOLTDiv= true;  
            }
            else{
                $scope.loadingOLTDiv= false;
                $scope.noDataOLTDiv= true;
                $scope.DataOLTDiv= false; 
            }
        });        
    }
    
    // App wise Usage Distribution MultiLine Chart 
    
    function overallOLTAppUsage(todayURL, yesterdayURL){
        $scope.loadingAppDiv= true;
        $scope.noDataAppDiv= false;
        $scope.DataAppDiv= false; 
       
        function getDateArray(dateList, dateObjArray, label){
            //console.log(dateObjArray);
            for(var j=0; j<dateObjArray.length; j++){
                var date= dateObjArray[j][label];
                var index= $.inArray(date, dateList);
                if(index == -1){
                    dateList.push(date);
                }
            }
            return dateList;
        }
        
        $http.get(todayURL).then(function (response) { 
            
            var todayObjArray = response.data;
            console.log("todayObjArray", todayObjArray.length);
            var dateArray= [], seriesData= [];
            
            for(var i=0; i<todayObjArray.length; i++){
                dateArray[i]= todayObjArray[i].Date;
            }
            console.log("dateArray", dateArray);
            $http.get(yesterdayURL).then(function (response) {  
            var yesterdayObjArray = response.data;
                console.log("yesterdayObjArray", yesterdayObjArray.length);
                dateArray= angular.copy(getDateArray(dateArray, yesterdayObjArray, Date ));
                var diff= todayObjArray.length- yesterdayObjArray.length;
                if(diff > 0){
                    for(var i= 0; i<diff; i++){
                        yesterdayObjArray.push({ "Date" : 0 , "Usage" : 0})
                    }
                }else{
                    Math.abs(-7.25)
                    for(var i= 0; i<Math.abs(diff); i++){
                        todayObjArray.push({ "Date" : 0 , "Usage" : 0})
                    }
                }
                for(var i in todayObjArray){
                    var todayData, yesterdayData;
                    var date= todayObjArray[i].Date;
                    if($.inArray(date, dateArray) != '-1'){
                        todayData= parseFloat(todayObjArray[i].Usage);
                    }else{
                        todayData= 0;
                    }
                    console.log("yesterdayObjArray[i].Date", yesterdayObjArray[i].Date, i)
                    var temp= yesterdayObjArray[i].Date
                    if($.inArray(temp, dateArray) != '-1'){
                        yesterdayData= parseFloat(yesterdayObjArray[i].Usage);
                    }else{
                        yesterdayData= 0;
                    }
                    
                  seriesData[i]= [todayData, yesterdayData];  
                }
                console.log("seriesData", seriesData);
            })
            
        });        
    }
    
    //App DropDown
    function appListDropdown(){
        var appListURL= globalConfig.pulldataurlbyname+"App dropdown filter";

        $http.get(appListURL).then(function (response) {
            var appNameList= [];
            var appObject= response.data;
            //console.log("plans", appObject);
            for(var i=0; i<appObject.length; i++){
                appNameList[i]= {"App": appObject[i].app};
            }
            $scope.selectApp.app= appNameList[0].App
            $scope.appNameList= appNameList;
        })
    }
    
    //OLT DropDown
    function oltListDropdown(){
        var oltListURL= globalConfig.pulldataurlbyname+"OLT dropdown FIlter";

        $http.get(oltListURL).then(function (response) {
            var oltNameList= [];
            var oltObject= response.data;
            //console.log("plans", appObject);
            for(var i=0; i<oltObject.length; i++){
                oltNameList[i]= {"OLT": oltObject[i].OLT};
            }
            $scope.selectOLT.OLT= oltNameList[0].OLT
            $scope.oltNameList= oltNameList;
        });
        
        appListDropdown();
        
        $timeout(function(){
            defaultLoad();
        },500);
        
    }
    
    //default Load
    function defaultLoad(){
            
        var overallOLTAppUsageTodayURL= globalConfig.pulldataurlbyname+"Minute wise Overall Usage&fromDate="+todayDate.fromDate+"T00:00:00.000Z&toDate="+todayDate.toDate+":00:00.000Z";
        
        var overallOLTAppUsageYesterdayURL= globalConfig.pulldataurlbyname+"Minute wise Overall Usage&fromDate="+ yesterdayDate.fromDate+"T00:00:00.000Z&toDate="+ yesterdayDate.toDate+":00:00.000Z";
        
        overallOLTAppUsage(overallOLTAppUsageTodayURL, overallOLTAppUsageYesterdayURL);
             
    }
    oltListDropdown();
    
    $scope.dropDownSelect= function(){
        defaultLoad();
    }
    
    $scope.changeDate=function (modelName, newDate) {
        selectedDate= newDate.format();
        console.log("selected Date", selectedDate);
        $scope.dateSelect= selectedDate.substring(0,10);
        console.log("selected Date", $scope.dateSelect);
        $scope.toDateSelect= $scope.dateSelect+"T"+currentHour;
        defaultLoad();
    }
}
// End App-OLT Usage Controller
// ----------------------------------------------------------------------------


// BB Bill Plan Utilzation Controller
function BBbillPlanUtilizationCtrl($scope, $state, httpService,globalConfig,$filter,$timeout,dataFormatter, flotChartOptions, utility){
    
    //track url starts
    utility.trackUrl();
    //end track url

    var maxValue, maxLineValue;
    var linePlusBarOptions = {
        chart:{
            type: 'linePlusBarChart',
            height: 350,
            margin: {
                top: 20,
                right: 75,
                bottom: 50,
                left: 75
            },
            bars: {
                forceY: [0, maxValue],
            },
            lines: {
                forceY: [0, maxLineValue]
            },
            tooltip: {
                contentGenerator: function(d) { 
                    //console.log(d)
                    if(d.color=="rgb(31, 119, 180)"){
                        return "Plan: "+d.data.x+", Usage: "+(d.data.y).toFixed(2);
                    }
                    
                    if(d.point.color=="rgb(44, 160, 44)"){
                        return "Subscriber: "+d.point.y;
                    }
                }
            },
            color: ['#1f77b4', 'rgb(44, 160, 44)'],
            x: function(d,i) { return i },
            focusEnable: false,
            xAxis: {
                axisLabel: 'Plans',
                tickFormat: function(d) {
                    //console.log("d", d);
                    var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                    //console.log("dx", dx)
                    return dx//d3.format(',f')(dx)
                },
                showMaxMin: false
            },
            x2Axis: {
                tickFormat: function(d) {
                    //var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                    return d//d3.format(',f')(dx)
                }
            },
            y1Axis: {
               tickFormat: function(d){
                    return d//d3.format(',f')(d)
                }
            },
            y2Axis: {
                tickFormat: function(d) {
                    return  d//d3.format(',f')(d)
                }
            },
            y3Axis: {
                tickFormat: function(d){
                    return d//d3.format(',f')(d);
                }   
            },
            y4Axis: {
                tickFormat: function(d) {
                    return d//d3.format(',f')(d)
                }
            }
        }
     };
    
    function UsageVsUsers(url){
        
        $scope.loadingUsageVsUsersDiv= true;
        $scope.DataUsageVsUsersDiv= false;
        $scope.noDataUsageVsUsersDiv= false;
        
        httpService.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            $scope.exportUserVsUsage= [];
            //console.log("response", objArray);
            if(objArray.length>0){
                
                var usageData= [], usersData= [], timeArray= [], usageDataArray= [], sessionData= [];
                for(var i=0; i<objArray.length;i++){
                    usageDataArray[i]=  objArray[i].Usage;
                }
                var FormattedusageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 1)
                //console.log("ksnsk", vpsFormattedUsageArray );
                var xaxisArray= [], tickArray= [];
                
                
                
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Date;
                    usageData[i]= parseFloat(FormattedusageDataArray[0][i]);
                    usersData[i]= parseFloat(objArray[i].Users);
                    /*if(currentPage=="App" || currentPage=="AppSegment")
                        usersData[i]= parseFloat(objArray[i].Sessions);
                    else
                        usersData[i]= parseFloat(objArray[i].Users);*/
                    if(angular.isDefined(objArray[i].Sessions)){
                        var duration= parseFloat(objArray[i].Sessions);
                        sessionData[i]= parseFloat(objArray[i].Sessions);
                    }
                }
                //console.log("durationData", durationData);
                //console.log("usageData", usageData);
                var usageVsUsersChartOptions;
                if(durationData.length>0){
                    usageVsUsersChartOptions=  angular.copy(highchartOptions.highchart3YAxisLinePlusBarLabelDatetimeOptions);
                    
                    usageVsUsersChartOptions.yAxis[0].title.text= "Users";
                    if(currentPage=="App" || currentPage=="AppSegment")
                        usageVsUsersChartOptions.yAxis[2].title.text= "Sessions";
                    $scope.UsageVsUsersChartConfig= {
                        options: usageVsUsersChartOptions,
                        series: [ {
                            name: 'Sessions',
                            type: 'spline',
                            yAxis: 2,
                            color: "#f7a35c",
                            data: sessionData
                        },{
                            name: 'Usage',
                            type: 'column',
                            yAxis: 1,
                            "color": "#1abc9c",
                            data: usageData,
                            tooltip: {
                                valueSuffix: ' '+FormattedusageDataArray[1]
                            }

                        }, {
                            name: 'Users',
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  usersData
                        }]
                    };
                    
                }else{
                    usageVsUsersChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
                    $scope.UsageVsUsersChartConfig= {
                        options: usageVsUsersChartOptions,
                        series: [{
                            name: 'Usage',
                            type: 'column',
                            yAxis: 1,
                            "color": "#1abc9c",
                            data: usageData,
                            tooltip: {
                                valueSuffix: ' '+FormattedusageDataArray[1]
                            }

                        }, {
                            name: 'Users',
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  usersData
                        }]
                    };
                }
                
                usageVsUsersChartOptions.xAxis.categories= timeArray;
                
                usageVsUsersChartOptions.yAxis[1].title.text= 'Usage('+FormattedusageDataArray[1]+")";
                $scope.exportUserVsUsage= angular.copy(objArray);

                $scope.loadingUsageVsUsersDiv= false;
                $scope.DataUsageVsUsersDiv= true;
                $scope.noDataUsageVsUsersDiv= false;
            }else{
                $scope.loadingUsageVsUsersDiv= false;
                $scope.DataUsageVsUsersDiv= false;
                $scope.noDataUsageVsUsersDiv= true;
            }
        })
    }

    function getbillPlanTrafficCount(TrafficURL, countURL, pCustURL){
        
        var barArray= [], lineArray= [], orderedTrafficArray= [], orderedCountArray= [], orderedPCustArray= [];
        var usageArray= [], countArray= [], tableArray= [];
        var plan= [], trafficPlan= [], custPlan= [], pCustPlan= [];
        var totalUsage=0, totalUsers=0;    
        
        httpService.get(TrafficURL).then(function (response) {
            //console.log("response:", response.data);
            var objTrafficArray = response.data;
            var date= objTrafficArray[0].date.$date;
            date= date.substring(0, 16);
            date= date.replace('T'," ");
            //console.log(Object.keys(objUsageArray).length);
            $scope.tillNow= date;
            
            httpService.get(countURL).then(function (response) {
                var objCountArray = response.data;
                //console.log("lengthCount", objCountArray.length )
                
                httpService.get(pCustURL).then(function (response) {
                    var objPCustArray = response.data;
                    //console.log("objPCustArray",objPCustArray )
                    
                    for(var i=0; i<objTrafficArray.length; i++){
                        trafficPlan[i]= objTrafficArray[i].Plan;
                    }
                    plan= angular.copy(trafficPlan);
                    
                    for(var j=0; j<objCountArray.length; j++){
                        var planName= objCountArray[j].Plan;
                        custPlan[j]= planName;
                        var index= $.inArray(planName, plan);
                        if(index == -1)
                            plan.push(planName);
                    }
                    
                    for(var j=0; j<objPCustArray.length; j++){
                        var planName= objPCustArray[j].Plan;
                        pCustPlan[j]= planName;
                        var index= $.inArray(planName, plan);
                        if(index == -1)
                            plan.push(planName);
                    }
                    
                    var custPlanDiff= _.difference(plan, custPlan);
                    for(var i=0; i<custPlanDiff.length; i++){
                        objCountArray.push({Plan: custPlanDiff[i], ActiveCustomers: 0 });
                    }
                    
                    var pCustDiff= _.difference(plan, pCustPlan);
                    for(var i=0; i<pCustDiff.length;i++){
                        objPCustArray.push({Plan: pCustDiff[i], ProvisionedCustomers: 0 });
                    }
                    
                    var trafficPlanDiff= _.difference(plan, trafficPlan);
                    for(var i=0; i<trafficPlanDiff.length;i++){
                        objTrafficArray.push({Plan: trafficPlanDiff[i], TotalUsage: 0 });
                    }
                    /*console.log("Traffic Array",objTrafficArray);
                    console.log("Count Array",objCountArray);
                    console.log("Prov. Cust. Array",objPCustArray);*/
                    
                    for(var i=0; i<plan.length; i++){
                        objTrafficArray.filter(function(item){
                            if(item.Plan==plan[i]){
                                orderedTrafficArray.push(item);
                            }
                        })
                        objCountArray.filter(function(item){
                            if(item.Plan==plan[i]){
                                orderedCountArray.push(item);
                            }
                        })
                        objPCustArray.filter(function(item){
                            if(item.Plan==plan[i]){
                                orderedPCustArray.push(item);
                            }
                        })
                    }
                    /*console.log("Ordered Traffic Array",orderedTrafficArray);
                    console.log("Ordered Count Array",orderedCountArray);
                    console.log("Ordered Prov. Cust. Array",orderedPCustArray);*/
                    
                    for(var i=0; i<plan.length; i++){
                        usageArray[i]= orderedTrafficArray[i].TotalUsage;
                    
                        totalUsers += orderedCountArray[i].ActiveCustomers;
                        countArray[i]= orderedCountArray[i].ActiveCustomers
                        lineArray[i]= [orderedCountArray[i].Plan, orderedCountArray[i].ActiveCustomers]
                    }
                    var usageArray1= dataFormatter.convertFixUnitUsageDataWoUnit(usageArray,2);
                    
                    // Calculation for total usage
                    for(var i=0; i<orderedTrafficArray.length; i++){
                        //console.log("usage", usageArray1[0][i]);
                        totalUsage += parseFloat(usageArray1[0][i]);
                        barArray[i]= [orderedTrafficArray[i].Plan, usageArray1[0][i]]
                    }
                    
                    for(var i=0; i<plan.length; i++){
                        var trafficPerCust=0;
                        if(countArray[i] != 0){
                            trafficPerCust= (usageArray1[0][i]/countArray[i]).toFixed(2)+' '+usageArray1[1];
                        }
                        else{
                            trafficPerCust= "-"
                        }
                        
                        tableArray[i]= [plan[i]
                                        ,orderedPCustArray[i].ProvisionedCustomers
                                        ,countArray[i]
                                        ,((countArray[i]/totalUsers)*100).toFixed(2)
                                        ,(usageArray1[0][i]).toFixed(2)+' '+usageArray1[1] 
                                        ,((usageArray1[0][i]/totalUsage)*100).toFixed(2)
                                        , trafficPerCust]
                    }

                    $scope.tableData= tableArray
                    maxValue= Math.max.apply(null, usageArray1[0]);
                    maxLineValue = Math.max.apply(null, countArray);
                    var unit= usageArray1[1];
                    linePlusBarOptions.chart.y1Axis.axisLabel= "Usage("+ unit +")" ;
                    linePlusBarOptions.chart.y2Axis.axisLabel= "Subscriber";
                    linePlusBarOptions.chart.bars.forceY= [0,maxValue];
                    linePlusBarOptions.chart.lines.forceY= [0,maxLineValue];
                    $scope.data = [
                        {
                            "bar": true,
                            "key": "Usage",
                            "values" : barArray 
                        },
                        {
                            "key": "Subscriber",
                            "values" : lineArray 
                        }
                    ].map(function(series) {
                        series.values = series.values.map(function(d) { return {x: d[0], y: d[1] } });
                        return series;
                    });
                    $scope.options = linePlusBarOptions;
                })
            })
        });
    }
     
    function defaultLoad(){
        var billPlanTrafficURL= globalConfig.pulldataurlbyname+"Plan wise Traffic till now REPORT";
        var billPlanCountURL= globalConfig.pulldataurlbyname+"Active Users for BillPlan REPORT";
        var billPlanProvisionCust= globalConfig.pulldataurlbyname+"Provisioned Customers per BillPlan";
       
        getbillPlanTrafficCount(billPlanTrafficURL, billPlanCountURL, billPlanProvisionCust);
        
    }   
    defaultLoad();
    
    /*{
            label: "Sales 1",
            data: 21,
            color: "#d3d3d3"
        }*/
}
// End BB Bill Plan Utilization Controller
//    ----------------------------------------------------------------------------

// BB Countrywise Traffic Controller
function countryWiseTrafficBBCtrl($scope, $state, httpService,globalConfig,$filter,$timeout,dataFormatter, globalData, utility){

    //track url starts
    utility.trackUrl();
    //end track url

    var lat, lng;
    $scope.select= {"country": "Indonesia"};
    var countryList= [];
    var countryLookupObject=  globalData.countryLookUpObj;
    //console.log("countryLookupObject", countryLookupObject);
    for(var i=0; i<countryLookupObject.length; i++){
        countryList[i]= countryLookupObject[i].Country;
    }
    $scope.countryList= countryList;
    $scope.mapCntryTraffic= angular.copy($scope.getMapOption)
    function getCountryWiseTraffic(url){
        var traffic, totalTraffic=0; 
        var marker= [];
        $scope.loadingCountryWiseTrafficDiv= true;
        $scope.noDataCountryWiseTrafficDiv= false;
             
        $scope.marker= [];
        /*$timeout(function() {
            $scope.mapCntryTraffic.control.refresh({latitude: $scope.initLatCount, longitude: $scope.initLongCount});
        }, 500);*/
        $scope.exportCountryWiseTrafficObj= [];
        httpService.get(url).then(function(response) {
            var objArray= response.data;

            $scope.exportCountryWiseTrafficObj= angular.copy(objArray);
            if(objArray.length>0){
                for(var i=0;i<objArray.length;i++){
                    traffic= objArray[i].Traffic;
                    totalTraffic += traffic
                    var index= $.inArray(objArray[i].Country,countryList);
                    //console.log(countryLookupObject[index])
                    if(index >= 0){
                        lat= countryLookupObject[index].Latitude;
                        lng= countryLookupObject[index].Longitude;

                        traffic= objArray[i].Traffic;
                        totalTraffic += traffic
                        //console.log("traffic", traffic)
                        var countryTraffic= dataFormatter.formatUsageData(traffic,2);
                        //console.log("countryTraffic", countryTraffic);
                        
                        var markerInfo= {
                            id: i,
                            latitude: lat,
                            longitude:  lng,
                            options:{visible:true},
                            title: objArray[i].Country+ ", Traffic: "+countryTraffic
                        }
                        marker.push(markerInfo);

                    }
                }
                  
                $scope.marker = marker;
                //------------------Table Data-------------------------------------
                console.log("totalTraffic", totalTraffic);
                var percTraffic, Traffic, countryArray, tableArray= [];
                for(var i=0; i<objArray.length; i++){
                    percTraffic= ((objArray[i].Traffic/totalTraffic)*100).toFixed(2);
                    Traffic= dataFormatter.formatCountryData(objArray[i].Traffic,2);
                    countryArray= objArray[i].Country;
                    tableArray[i]= [countryArray,Traffic, percTraffic];
                }
                $scope.tableData= tableArray;

                $scope.loadingCountryWiseTrafficDiv= false;
                $scope.noDataCountryWiseTrafficDiv= false;
            }else{
                $scope.loadingCountryWiseTrafficDiv= false;
                $scope.noDataCountryWiseTrafficDiv= true;
            }
        })
    }
    
    //default load
    function defaultLoad(){
        var CountryWiseTrafficURL= globalConfig.pulldataurlbyname+"Country wise Traffic distribution REPORT&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.000Z&Country="+$scope.select.country;
        getCountryWiseTraffic(CountryWiseTrafficURL);
    }
    defaultLoad();

    // filter Submit event
    $scope.click= function(){
        defaultLoad()
    }
}
// End BB Countrywise Traffic Controller
//    ----------------------------------------------------------------------------
// Top User Trend Controller
function topUsersTrendBBCtrl($scope, $state, httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, utility){
    
    //track url starts
    utility.trackUrl();
    //end track url

    var fromDate= $filter('date')( new Date().getTime()- 2*24*3600*1000 , "yyyy-MM-dd");
    var toDate= $filter('date')( new Date().getTime()- 24*3600*1000 , "yyyy-MM-dd");
    $scope.date= {"start": fromDate, "end": toDate};
    //get top user trend Data
    function getTopUsersTrend(fromDateTopUsersUsageURL, fromDateTotalUsageURL){

        $scope.loadingTopUsersTrendDiv= true;
        $scope.noDataTopUsersTrendDiv= false;
        var CustomerId= [], fromDateUsageObjArray= [], toDateUsageObjArray= [], fromDateCustomers= [], diffArray= [];
        var fromDateTotalUsage, toDateTotalUsage;
        var percFromDateUsage= [], percToDateUsage= [];
        
        //fromDate top users usage
        httpService.get(fromDateTopUsersUsageURL).then(function (response) {
            var fromDateTopUsersUsageObjArray= response.data;
            console.log("length1", fromDateTopUsersUsageObjArray.length);
            if(fromDateTopUsersUsageObjArray.length>0){
            
            // fromDate total usage
                httpService.get(fromDateTotalUsageURL).then(function (response) {
                    var fromDateTotalUsageObjArray= response.data;
                    fromDateTotalUsage= fromDateTotalUsageObjArray[0].FromDateTotalUsage
                    
                    // fromDate usage percent
                    for(var i=0; i<fromDateTopUsersUsageObjArray.length; i++){
                        percFromDateUsage[i]= (fromDateTopUsersUsageObjArray[i].fromDateUsage/(1024*1024)).toFixed(0);//fromDateTotalUsage)*100000).toFixed(0);
                        percFromDateUsage[i]= Math.abs(percFromDateUsage[i]);
                        CustomerId[i]= "'"+fromDateTopUsersUsageObjArray[i].customerid+"'";
                        fromDateCustomers[i]= fromDateTopUsersUsageObjArray[i].customerid;
                    }
                   
                    //toDate users usage
                    var toDateUsersUsageURL = globalConfig.pullfilterdataurlbyname+"Top Twenty Users Usage for toDate Analytics&toDate="+$scope.date.end+"T00:00:00.000Z&CustomerId=["+CustomerId+"]";
                    httpService.get(toDateUsersUsageURL).then(function (response) {
                        var toDateUsersUsageObjArray= response.data;
                        console.log("length2", toDateUsersUsageObjArray.length);
                        var toDateCustomers= [];
                        for(var i=0; i<toDateUsersUsageObjArray.length; i++){
                            toDateCustomers[i]= toDateUsersUsageObjArray[i].customerid;
                        }
                        //toDate total usage
                        var toDateTotalUsageURL = globalConfig.pullfilterdataurlbyname+"Total Usage for toDate Analytics&toDate="+$scope.date.end+"T00:00:00.000Z";
                        httpService.get(toDateTotalUsageURL).then(function (response) {
                            var toDateTotalUsageObjArray= response.data;
                            if(toDateTotalUsageObjArray.length>0){
                                toDateTotalUsage= toDateTotalUsageObjArray[0].ToDateTotalUsage;

                                // toDate usage percent
                                for(var i=0; i<fromDateCustomers.length; i++){
                                    var cust= fromDateCustomers[i];
                                    var index= $.inArray(cust,toDateCustomers);
                                    console.log("index", index)
                                    if(index== '-1')
                                        console.log("cust", cust)
                                    if(index >= 0){
                                        percToDateUsage[i]= (((toDateUsersUsageObjArray[index].ToDateUsage- fromDateTopUsersUsageObjArray[i].fromDateUsage)/fromDateTopUsersUsageObjArray[i].fromDateUsage)*100).toFixed(0);
                                        //if(percToDateUsage[i] < 0)
                                        //percToDateUsage[i]= Math.abs(percToDateUsage[i])*10; 
                                        console.log("percToDateUsage[i]", percToDateUsage[i])
                                        if(percToDateUsage[i] >= 0){
                                            //var color="green";
                                            var diff= Math.abs(percToDateUsage[i])*10
                                             diffArray[i]=  {
                                                 y: diff,
                                                 color: '#92F22A'
                                             }
                                        }
                                        else{
                                            //var color= "red";
                                            var diff= Math.abs(percToDateUsage[i])*10;
                                            console.log("diff", diff)
                                            diffArray[i]= {
                                                y: diff,
                                                color: 'rgb(192, 57, 43)'
                                            }
                                            //percToDateUsage[i]= -percToDateUsage[i];
                                        }
                                    }else{
                                        diffArray[i]= {
                                                y: 1000,
                                                color: 'rgb(192, 57, 43)'
                                            }
                                    }
                                }   
                                //console.log("percFromDateUsage",percFromDateUsage);
                                console.log("percToDateUsage",diffArray);
                                $scope.chartConfig= {
                                    options: {
                                        //This is the Main Highcharts chart config. Any Highchart options are valid here.
                                        //will be overriden by values specified below.
                                        chart: {
                                            type: 'bar'
                                        },
                                        plotOptions: {
                                            series: {
                                                stacking: 'normal'
                                            }
                                        },
                                        tooltip: {
                                            formatter: function() {
                                                //console.log("this", this);
                                                if(this.color=="#3D8EB9"){
                                                   return ' <b>' + this.x + '</b>, Usage <b>' + (this.y/Math.pow(2,10)).toFixed(2) + '</b> GB, Date '+ this.series.name;
                                                }
                                                else if(this.color=="#92F22A"){
                                                    return ' <b>' + this.x + '</b>, Usage <b>' + (this.y/10).toFixed(2) + '</b> % Up, Date '+ this.series.name;    
                                                }
                                                else{
                                                    return ' <b>' + this.x + '</b>, Usage <b>' + (this.y/10).toFixed(2) + '</b> % Down, Date '+ this.series.name;    
                                                }
                                            },
                                            style: {
                                                padding: 10,
                                                fontWeight: 'bold'
                                            }
                                        }
                                    },
                                    title: {
                                                text: ''
                                            },
                                    xAxis: {
                                        categories: fromDateCustomers
                                    },
                                    yAxis:{
                                        title:{
                                            text: ""
                                        },
                                        labels: {
                                            enabled: false
                                        },
                                        min: 0
                                    },
                                    credits: {
                                        enabled: false
                                    },
                                    series: [{
                                        //type: 'coloredarea',
                                        showInLegend: false,
                                        name: $scope.date.end,
                                        //color: "#7cb5ec",
                                        data: diffArray
                                    },{
                                        name: $scope.date.start,
                                        showInLegend: false,
                                        color: "#3D8EB9",//"rgb(26, 188, 156)",
                                        data: percFromDateUsage
                                    }]
                                };
                                $scope.loadingTopUsersTrendDiv= false;
                                $scope.noDataTopUsersTrendDiv= false;
                            }else{
                                $scope.loadingTopUsersTrendDiv= false;
                                $scope.noDataTopUsersTrendDiv= true;
                            }
                            
                        })
                    })
                })
            }else{
                $scope.loadingTopUsersTrendDiv= false;
                $scope.noDataTopUsersTrendDiv= true;
            }   
        })
    }
    
    // Default load
    function defaultLoad(){
        
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;
        var fromDateTopUsersUsageURL = globalConfig.pullfilterdataurlbyname+'Top Twenty customers fromDate Analytics'+"&fromDate="+$scope.date.start+"T00:00:00.000Z";
        
        var fromDateTotalUsageURL = globalConfig.pullfilterdataurlbyname+"Total Usage for fromDate Analytics&fromDate="+$scope.date.start+"T00:00:00.000Z";
        
        getTopUsersTrend(fromDateTopUsersUsageURL, fromDateTotalUsageURL)
    }
    defaultLoad();
    
    //Submit button Click event
    $scope.submitClick= function(){
        defaultLoad();
    }
}
// End Top User Trend Controller
//    ----------------------------------------------------------------------------
//BB Plan Profitability Realisation Ctrl controller
function planProfitabilityRealisationBBCtrl($scope, $http, $filter,dataFormatter,globalConfig, flotChartOptions, $timeout, utility){
    
    //track url starts
    utility.trackUrl();
    //end track url

    // Default load
    //function defaultLoad(){
        var nodeArray= ["BNS","Dhanmondi","Uttara Office","Bashundhara","SMC Central","SMC CISCO ASR FUP","Banani 28","Gulshan 1","Bulu","Sylhet 1","Sylhet 2","CTG CNF","CTG CNF FUP","CTG Mehidi","CTG SOHO","Dhaka SOHO" ];
        var nodeCapacityArray= [1, 2, 1, 3, 2, 5, 1, 2, 2, 3, 2, 5, 1, 2, 2, 3];
        var nodeUtilisationArray= [0.7, 0.9, 0.7, 2.6, 1.3, 3.8, 0.9, 1.6, 1.1, 1.7, 1.3, 3.3, 0.9, 1.6, 1.8, 2.7];
        
        $scope.NodechartConfig= {
            options: {
                chart: {
                     type: 'column'
                },
                plotOptions: {
                    column: {
                        grouping: false,
                        shadow: false,
                        borderWidth: 0
                    }
                },
                tooltip: {
                },
                style: {
                    padding: 10,
                    fontWeight: 'bold'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: nodeArray,
                    title:{
                        text: "Nodes"
                    }
                },
                yAxis:{
                    title:{
                        text: "Bandwidth(Gbps)"
                    },
                    min: 0
                },
                credits: {
                    enabled: false
                }
            },
            series:[
                {
                    name: 'Node BW Capacity',
                    color: '#9A12B3',
                    data: nodeCapacityArray,
                    pointPadding: 0.3,
                    pointPlacement: -0.2
                }, 
                {
                    name: 'Node BW Utilization',
                    color: '#BE90D4',
                    data: nodeUtilisationArray,
                    pointPadding: 0.4,
                    pointPlacement: -0.2
                }
            ]
        }
        console.log($scope.NodechartConfig);
    //defaultLoad();
    
 }
// End Plan Profitability Realisation Ctrl controller
//-----------------------------------------------------------------------------

//BB Customer Details controller
function customerDetailsBBCtrl($scope, $rootScope,SweetAlert, httpService, $filter, $state,dataFormatter,globalConfig,  $stateParams,$uibModal, flotChartOptions,  $sce, highchartProcessData, highchartOptions,UserProfile, utility){

    //track url starts
    utility.trackUrl();
    //end track url


    $scope.TransactionOperator = globalConfig.ShowAAA

    // console.log("UserProfile", UserProfile);
    var userProfile= UserProfile;
    if(userProfile.profileData.userType == 'system administrator' )
        $scope.deviceShow= true;
    else
        $scope.deviceShow= false; 

    $scope.monthBtn= {
        '3m': true,
        '6m': false,
        '9m': false
    }


    var colopallette=['rgb(31, 119, 180)','rgb(255, 127, 14)','rgb(214, 39, 40)','rgb(44, 160, 44)','rgb(148, 103, 189)','rgb(227, 119, 194)','#3E4651','#E7F76D', '#72F274', '#39B4FF'];//['#f15c80', '#f7a35c','#1F9EA3', '#64DDBB', '#7C4DFF', '#C25396','#f1c40f', '#92F22A',   '#97CE68', '#897FBA','#e74c3c', '#2C82C9', '#83D6DE',   '#14967C','#EC644B', '#D24D57'];//
    // console.log("utility.tb.custDetails.TransactionDetails", utility.tb.custDetails.TransactionDetails);
    $scope.showTabObj= angular.copy(utility.tb.custDetails)
    $scope.OLTorDSLAM= globalConfig.OLTorDSLAM;

    function getCurrentTab(){
        
        if($scope.showTabObj.Usage){
            $scope.currentTab= 'usage';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.App){
            $scope.currentTab= 'app';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.Throughput){
            $scope.currentTab= 'throughput';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.TransactionDetails){
            $scope.currentTab= 'transactionDetails';
            return $scope.currentTab;
        }
        else if($scope.showTabObj.transactionAAADetails){
            $scope.currentTab= 'transactionAAADetails';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.UsageLast30Days){
            $scope.currentTab= 'usage30Days';
            return $scope.currentTab;
        }
       
        else if($scope.showTabObj.usageMonthwise){
            $scope.currentTab= 'usageMonthwise';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.appThroughput){
            $scope.currentTab= 'appThroughput';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.CDNThroughput){
            $scope.currentTab= 'CDNThroughput';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.profile){
            $scope.currentTab= 'profile';
            return $scope.currentTab;
        }
    }

    $scope.currentTab= getCurrentTab();

    var appwiseUsageDetailsURL, usageDetailsURL, headerdetailURL, transactionDetailURL, throughputDetailsURL, hour, usagelast30DaysURL, appDistributionlast30DaysURL, usageValue, tpValue, hourlyAppwiseUsageURL;
    
    var todayDate= $filter('date')( new Date().getTime(), "yyyy-MM-dd");
    $scope.tdDate= $filter('date')( new Date().getTime(), "yyyy-MM-dd");
    $scope.dateSelect= todayDate;
    $scope.date.start= $filter('date')( new Date().getTime()-30*24*60*60*1000, "yyyy-MM-dd")
    $scope.date.end= $filter('date')( new Date().getTime()-24*60*60*1000, "yyyy-MM-dd")
    
    // hour & min drpdown
    var hourList= [], minList= [];
    $scope.selectMin= {};
    $scope.minList= ["00-09", "10-19", "20-29", "30-39", "40-49", "50-59"]
    $scope.select= {};
    for(var i=0; i<24; i++){
        if(i<10){
            hourList[i]= "0"+i+":00";
        }
        else{
            hourList[i]= i+":00";
        }
    }
    $scope.hourList= hourList;
    
    var snip= "<div class='sk-spinner sk-spinner-fading-circle'>"+
                "<div class='sk-circle1 sk-circle'></div>"+
                "<div class='sk-circle2 sk-circle'></div>"+
                "<div class='sk-circle3 sk-circle'></div>"+
                "<div class='sk-circle4 sk-circle'></div>"+
                "<div class='sk-circle5 sk-circle'></div>"+
                "<div class='sk-circle6 sk-circle'></div>"+
                "<div class='sk-circle7 sk-circle'></div>"+
                "<div class='sk-circle8 sk-circle'></div>"+
                "<div class='sk-circle9 sk-circle'></div>"+
                "<div class='sk-circle10 sk-circle'></div>"+
                "<div class='sk-circle11 sk-circle'></div>"+
                "<div class='sk-circle12 sk-circle'></div>"+
            "</div>";
    var load= "<span class='text-info'><b>Loading...</b></span>";
    var loading, snipper;
    
    //App filter 
    var appListURL= globalConfig.pulldataurlbyname+"App Filter";
    
    httpService.get(appListURL).then(function(response){
        var objArray= response.data;
        var appListArray= [];
        if(objArray.length>0){
            for(var i in objArray){
                appListArray[i]= objArray[i]['App'];
            }
            $scope.subAppArrayList= angular.copy(appListArray);
            $scope.subsApp= angular.copy(appListArray[0]);
            $scope.select.subApp= angular.copy(appListArray[0]);
        }
    })
    //End App filter

    //CDN Filter 
    var appListURL= globalConfig.pulldataurlbyname+"CDN Filter";
    
    httpService.get(appListURL).then(function(response){
        var objArray= response.data;
        var appListArray= [];
        if(objArray.length>0){
            for(var i in objArray){
                appListArray[i]= objArray[i]['CDN'];
            }
            $scope.subCDNArrayList= angular.copy(appListArray);
            $scope.subsCDN= angular.copy(appListArray[0]);
            $scope.select.subCDN= angular.copy(appListArray[0]);
        }
    })
    //End CDN Filter

    $scope.showUserDetails= false;
    // var currentTab= 'usage';
    var unit, maxValue, maxLineValue;   
   
    var multiBarHorizontalChartOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                margin: {
                    top: 20,
                    right: 75,
                    bottom: 50,
                    left: 150
                },
                rect:{
                  width:10  
                },
                forceY: [0, maxValue],
                height: 300,
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: false,
                duration: 500,
                stacked: false,
                tooltip: {
                    contentGenerator: function(d) { 
                       //console.log(d)
                      return "App: "+d.data.label+", Usage: "+d.data.value 
                    }
                },
                xAxis: {
                    showMaxMin: true
                },
                yAxis: {
                    axisLabel: 'Usage',
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                }
            }
        };

    var transactionDetailsOptions= {
        "destroy": true,
        "aaSorting": [],
        "paging": true, 
        "searching": false,
        "bSort": true,
        "bLengthChange": false,
        "bInfo": false,
        "autoWidth": true,
         "order": [[ 0, "desc" ]],
         "pageLength": 50,
        //"scrollX": true,
        "columnDefs": [
            { "orderable": false, "targets": [2,3,4,5,6,7,9,11] }
        ]
    };
    
    var dataTableOptionsDetails= {
        "destroy": true,
        "aaSorting": [],
        "paging": false, 
        "searching": false,
        "bSort": false,
        "bLengthChange": false,
        "bInfo": false,
        "autoWidth": true,
        "scrollX": true,
        "columnDefs": [
            { width: '10%', targets: [0]}
        ]
    };
    
    function usageDetails(url){
        
        var avgLatencyTrasholdms= 300;
        var avgThroughputTrasholdKbps= 50; 
        var colArray= []
        var barDataUsage=[]; 
        var lineDataCEI=[]; 
        var barArray= [];
        var tempArray= [];
        var rowDataArray= [];
        var Usage= [];
        var AvgLatency= [];
        var PeakLatency= [];
        var Throughput= [];
        var  TPCached= [];
        var  TPUnCached= [];
        var tableUsageData= [];

        for (var i = 0; i < 24; i++) {
            tempArray[i]= '-';
            barArray[i]= '0';
            barDataUsage[i]=[i,];
            lineDataCEI[i]=[i,];
            colArray[i]= i;
        }
        
        Usage= angular.copy(tempArray);
        tableUsageData= angular.copy(tempArray);
        Throughput= angular.copy(tempArray);
        TPCached= angular.copy(tempArray);
        TPUnCached= angular.copy(tempArray);
        AvgLatency= angular.copy(tempArray);
        PeakLatency= angular.copy(tempArray);
        $scope.dataTableOptionsDetails= dataTableOptionsDetails;
        
        function setIndicator(val, threshold, reverse, check){
            if(val == 0){
                return {val: val, indicator: '', spanClass: ''};
            }
            if(check){
                if(!reverse){
                    if(val > threshold){
                        var indicator = '';
                        var spanClass = 'badge badge-danger';
                    }
                    else{
                        var indicator = '';
                        var spanClass = '';
                    }
                }
                var obj = {val: val, indicator: indicator, spanClass: spanClass};
            }else{
                var obj = {val: val, indicator: '', spanClass: ''};
            }
            return obj;
        }

        $scope.loadingUsageDiv= true;
        $scope.noDataUsageDiv= false;
        
        var valData= [];
        var validatedArray= [],lineArray= [];
        for(var i=0;i<24;i++){
            validatedArray[i]= 0;
        }
        
        httpService.get(url).then(function (response) {
            //console.log("response:", response.data);
            var objArray = response.data;
            $scope.exportSubsciberDetail= [];
            $scope. colArray = [];
            $scope.rowDataArray = [];
            if(objArray.length>0){
                $scope.exportSubsciberDetail= angular.copy(objArray);
                var planSpeed= (objArray[0].PlanSpeed/1000).toFixed(2);
                // var planSpeed= objArray[0].PlanSpeed;
                for(var i=0;i<=23;i++){
                    valData[i]= objArray[0][i];
                    
                }
                var obj= {"CEI":"-", "AvgLatency":"-", "TPCached":"-","TPUnCached":"-", "Usage":"-", "Throughput":"-", "PeakLatency": "-", "CEIVideo":"-", "CEICached":"-", "CEIUnCached":"-", "CEIUnCached":"-"};
                var Arr= [], index=-1;
                
                for(var i=0; i<24; i++){
                    Arr[i]= angular.copy(obj); 
                }
                
                
                for(var i=0;i<24;i++){
                    if(Object.keys(valData[i]).length==5){
                        validatedArray[i]= valData[i]
                        // console.log("datat ",validatedArray[i])
                    }
                }


                for(var i=0;i<24;i++){
                    
                    if(valData[i].hasOwnProperty("Usage")){
                        
                        if(valData[i].Usage != null){
                            
                            Arr[i].Usage = valData[i].Usage;
                            if(valData[i].hasOwnProperty("AvgLatency")){
                                
                                if(valData[i].AvgLatency == null){
                                    Arr[i].AvgLatency = "0";
                                }else{
                                    if(valData[i].AvgLatency>0)
                                        Arr[i].AvgLatency = (valData[i].AvgLatency).toFixed(0);
                                    else
                                        Arr[i].AvgLatency = valData[i].AvgLatency.toFixed(0);
                                }
                            }
                            
                            if(valData[i].hasOwnProperty("TPUnCached")){
                                if(valData[i].TPUnCached != null)
                                    Arr[i].TPUnCached = valData[i].TPUnCached; 
                            }

                            if(valData[i].hasOwnProperty("TPCached")){
                                if(valData[i].TPCached != null)
                                Arr[i].TPCached = valData[i].TPCached; 
                            }

                            if(valData[i].hasOwnProperty("PeakLatency")){
                                if(valData[i].PeakLatency == null){
                                    Arr[i].PeakLatency = "0";
                                }else{
                                    if(valData[i].PeakLatency>0)
                                        Arr[i].PeakLatency = (valData[i].PeakLatency).toFixed(0);
                                    else
                                        Arr[i].PeakLatency = valData[i].PeakLatency.toFixed(0);
                                }   
                            }
                            
                            if(valData[i].hasOwnProperty("Throughput")){
                                if(valData[i].Throughput != null)
                                    Arr[i].Throughput = valData[i].Throughput; 
                            }

                            if(valData[i].hasOwnProperty("CEI")){
                                if(valData[i].CEI != null)
                                    Arr[i].CEI = valData[i].CEI; 
                            }

                            if(valData[i].hasOwnProperty("CEIVideo")){
                                if(valData[i].CEIVideo != null || valData[i].CEIVideo != 'NA')
                                    Arr[i].CEIVideo = valData[i].CEIVideo; 
                            }

                            if(valData[i].hasOwnProperty("CEICached")){
                                if(valData[i].CEICached != null || valData[i].CEICached != 'NA')
                                    Arr[i].CEICached = valData[i].CEICached; 
                            }
                            
                            if(valData[i].hasOwnProperty("CEIUnCached")){
                                if(valData[i].CEIUnCached != null || valData[i].CEIUnCached != 'NA')
                                    Arr[i].CEIUnCached = valData[i].CEIUnCached; 
                            }

                        }
                        
                    }
                    
                }
                // console.log("validatedArray", validatedArray);

                //----------------------Bar Chart Data---------------------------

                for(var i=0; i<Arr.length;i++){
                    if(Arr[i].Usage=="-"){
                        barArray[i]= "0"; 
                    }
                    else{
                        barArray[i]= Arr[i].Usage;
                    }
                }
                
                var barArray1= dataFormatter.convertFixUnitUsageDataWoUnit(barArray,3);
                
                var hourArray= [];
                for (var i = 0; i < 24; i++) {
                    hourArray[i]= i;
                    barDataUsage[i]= parseFloat(barArray1[0][i]);
                }
                var optionsUsageBar= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                optionsUsageBar.xAxis.categories= hourArray;
                optionsUsageBar.yAxis.title.text= "Usage("+barArray1[1]+")";
                optionsUsageBar.tooltip.pointFormat= 'Usage<b> {point.y:.2f} '+ barArray1[1];
                
                $scope.usageBarChartConfig= {
                    "options" : optionsUsageBar,
                    "series": [{
                        name: "Hourly Usage",
                        color: "rgb(39, 174, 96)",
                        data: barDataUsage
                    }]
                }
                
                //----------------------User Details Table Data------------------------------


                for (var i = 0; i < Arr.length; i++) {

                    console.log("Usage type",typeof(Arr[i].Usage))
                    console.log("TPcahed Type",typeof(Arr[i].TPCached))
                    console.log("Throughput",typeof(Arr[i].Throughput))
                    
                    if(typeof(Arr[i].Usage)=="number"){
                        tableUsageData[i]= dataFormatter.formatUsageData(Arr[i].Usage,1);
                    }
                    else{
                        tableUsageData[i]=  Arr[i].Usage
                    }
                    AvgLatency[i]= Arr[i].AvgLatency;
                    PeakLatency[i]= Arr[i].PeakLatency;
                    
                    if(typeof(Arr[i].Throughput)=="number"){
                        Throughput[i]= dataFormatter.formatBwBitsData(Arr[i].Throughput,1); 
                    }
                    else{
                        Throughput[i]=  Arr[i].Throughput
                    } 


                    if(typeof(Arr[i].TPCached)=="number"){
                        TPCached[i]= dataFormatter.formatBwBitsData(Arr[i].TPCached,1); 
                    }
                    else{
                        TPCached[i]=  Arr[i].TPCached
                    } 

                    if(typeof(Arr[i].TPUnCached)=="number"){
                        TPUnCached[i]= dataFormatter.formatBwBitsData(Arr[i].TPUnCached,1); 
                    }
                    else{
                        TPUnCached[i]=  Arr[i].TPUnCached
                    }
                    
                }

                var AvgLatency1=[];
                var PeakLatency1=[];
                var CEIData= [];
                var CEIVideoData= [];
                var CEICachedData= [];
                var CEIUnCachedData= [];
                var Throughput1 = [];
                var tableUsageData1= [];
                var TPCached1 = [];
                var TPUnCached1 = [];

                for (var i = 0; i < 24; i++) {
                    tableUsageData1[i]= setIndicator(tableUsageData[i],avgThroughputTrasholdKbps,false,false);
                    AvgLatency1[i]= setIndicator(AvgLatency[i],avgLatencyTrasholdms,false,true);
                    PeakLatency1[i]= setIndicator(PeakLatency[i],avgLatencyTrasholdms,false,true);
                    Throughput1[i]= setIndicator(Throughput[i],avgThroughputTrasholdKbps,false,false);
                    CEIData[i]= setIndicator(Arr[i].CEI,false,false);
                    CEIVideoData[i]= setIndicator(Arr[i].CEIVideo,false,false);
                    CEICachedData[i]= setIndicator(Arr[i].CEICached,false,false);
                    CEIUnCachedData[i]= setIndicator(Arr[i].CEIUnCached,false,false);
                    TPCached1[i] = setIndicator(TPCached[i],avgThroughputTrasholdKbps,false,false)
                    TPUnCached1[i] = setIndicator(TPUnCached[i],avgThroughputTrasholdKbps,false,false)
                }
                // console.log("CEIData", CEIData);
                rowDataArray[0]= ['Usage', tableUsageData1];
                rowDataArray[1]= ['Avg.Latency(ms)', AvgLatency1];
                // rowDataArray[2]= ['PeakLatency(ms)', PeakLatency1];
                rowDataArray[2]= ['Throughput', Throughput1];
                rowDataArray[3]= ['TPCached',TPCached1];
                rowDataArray[4]= ['TPUnCached',TPUnCached1];
                rowDataArray[5]= ['CEI', CEIData];
                rowDataArray[6]= ['CEICached', CEICachedData];
                rowDataArray[7]= ['CEIUnCached', CEIUnCachedData];
                rowDataArray[8]= ['CEIVideo', CEIVideoData]; // field for checking customer video experience index            
                

                console.log("rowDataArray", rowDataArray);

                $scope. colArray = colArray;
                $scope.dataTableOptionsDetails= dataTableOptionsDetails;
                $scope.rowDataArray = rowDataArray;

                //------------------------Header Data------------------------------------
                // $scope.usageTotal= dataFormatter.formatUsageData(objArray[0].TodaysUsage,2);
                // $scope.peakThroughput= dataFormatter.formatBwBitsData(objArray[0].PeakThroughput,2)
                // $scope.updateTime= $filter('date')( new Date(objArray[0].LastUpdated.$date) , "h:mm a");
                //console.log("tzoffset", globalConfig.tzoffset);
                $scope.loadingUsageDiv= false;
                $scope.noDataUsageDiv= false;
            }
            else{
                $scope.loadingUsageDiv= false;
                $scope.noDataUsageDiv= true;
            }
        });
    }
    
    function profileDetails(url){
        $scope.loadingProfileDiv= true;
        $scope.dataProfileDiv= false;
        $scope.noDataProfileDiv= false;
        httpService.get(url).then(function (response) {
            //console.log("response:", response.data);
            var objArray = response.data;
            if(objArray.length>0){
                $scope.profile = objArray[0];

                $scope.loadingProfileDiv= false;
                $scope.dataProfileDiv= true;
                $scope.noDataProfileDiv= false;
            }else{
                $scope.loadingProfileDiv= false;
                $scope.dataProfileDiv= false;
                $scope.noDataProfileDiv= true;
            }

        });
    }
    
    function appwiseUsageDetails(url){
        $scope.loadingAppUsageDiv= true;
        $scope.noDataAppUsageDiv= false;
        $scope.exportAppUsageDetail =[];    
        if(angular.isDefined($scope.dataHorizontalBar)){
            // console.log("$scope.dataHorizontalBar", $scope.dataHorizontalBar)
            $scope.optionsHorizontalBar= {
                chart: {
                    type: 'multiBarHorizontalChart',
                    margin: {
                        top: 20,
                        right: 75,
                        bottom: 50,
                        left: 150
                    },
                    rect:{
                        width:10  
                    },
                }
            };
        }
        
        httpService.get(url).then(function (response) {
            // console.log("response:", response.data);
            var objArray = response.data;
            //console.log("length:",objArray.length);
            if(objArray.length>0){
                var exportAppUsageDetail =angular.copy(objArray);
                var appData= [], usageArray= [];
                $scope.dataHorizontalBar = appData;
                for(var i=0; i<objArray.length;i++){
                    usageArray[i]= objArray[i].Usage;
                    exportAppUsageDetail[i]['Usage(Bytes)']= exportAppUsageDetail[i].Usage;
                    delete exportAppUsageDetail[i].Usage
                }
                var UsageData= dataFormatter.convertFixUnitUsageDataWoUnit(usageArray,2);
                //console.log("UsageData", UsageData);
                for (var i = 0; i < objArray.length; i++) {
                    appData[i]= {
                        "key": objArray[i].App,
                        "color": highchartProcessData.getAppColor(objArray[i].App),//colopallette[i],//"#1f77b4",
                        "values": [
                            {
                                "label": objArray[i].App , "value": parseFloat((UsageData[0][i]).toFixed(3)) 
                            }
                        ] 
                    }
                }
                var maxValue;
                maxValue= Math.max.apply(null, UsageData[0]);
                //console.log("appData: ", appData);
                multiBarHorizontalChartOptions.chart.yAxis.axisLabel= "Usage( "+UsageData[1]+")";
                $scope.dataHorizontalBar = appData
                $scope.optionsHorizontalBar= multiBarHorizontalChartOptions;
                $scope.exportAppUsageDetail =angular.copy(exportAppUsageDetail);

                $scope.loadingAppUsageDiv= false;
                $scope.noDataAppUsageDiv= false;
            }
            else{
                $scope.loadingAppUsageDiv= false;
                $scope.noDataAppUsageDiv= true;
            }
        });
    }
    
    function hourlyAppwiseUsageDetails( hourlyURL){
        $scope.loadingHourlyAppUsageDiv= true;
        $scope.noDataHourlyAppUsageDiv= false;
        $scope.exportAppUsageHourlyDetail =[];  
        httpService.get(hourlyURL).then(function (response) {
            //console.log("response:", response.data);
            var objArray = response.data;
            //console.log("length:",objArray.length);
            if(objArray.length>0){
                /*var exportAppUsageHourlyDetail =angular.copy(objArray);
                for(var i in exportAppUsageHourlyDetail){
                    for(var j in exportAppUsageHourlyDetail[i]['data']){
                        if(exportAppUsageHourlyDetail[i]['data'][j].hasOwnProperty("Usage")){
                            exportAppUsageHourlyDetail[i]['data'][j]['Usage(Bytes)']= exportAppUsageHourlyDetail[i]['data'][j]['Usage'];
                            delete exportAppUsageHourlyDetail[i]['data'][j]['Usage'];
                        }
                    }
                }*/

                var hourlyAppUsageChartOptions= angular.copy(highchartOptions.highchartBubbleLabelCategoriesOptions);
                hourlyAppUsageChartOptions.yAxis.title.text= "Usage (MB)";
                hourlyAppUsageChartOptions.xAxis.title.text= "Hours";
                hourlyAppUsageChartOptions.plotOptions.bubble= {};
                
                $scope.hourlyAppUsageChartConfig= {
                    options: hourlyAppUsageChartOptions,
                    series: highchartProcessData.bubbleProcessHighchartData(objArray, "Hour", "Usage", "data", "App")
                }
                
                // $scope.exportAppUsageHourlyDetail =angular.copy(exportAppUsageHourlyDetail);
                
                $scope.loadingHourlyAppUsageDiv= false;
                $scope.noDataHourlyAppUsageDiv= false;
            }
            else{
                $scope.loadingHourlyAppUsageDiv= false;
                $scope.noDataHourlyAppUsageDiv= true;
            }
        });
    }
    
    function transactionTable(a,b,c,d,e,f,g,h,i,m,n,j,k){
        this.Date= a;
        this.Duration= b;
        this.AppProtocol= c;
        this.DestinationIP= d;
        this.App= e;
        this.SourcePort= f;
        this.DestinationPort= g;
        this.URL= h;
        this.Usage= i;
        this.UpUsage= m;
        this.DownUsage= n;
        this.Throughput= j;
        this.DataLatency= k;
        // this.key= l;
    }
    var tableData= [];
                   
    //$scope.snipper= $sce.trustAsHtml(snipper);
    loading= load, snipper= snip;
    tableData[0]= new transactionTable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper), '','','','','','','','','','');
    $scope.transactionDetailsOptions= transactionDetailsOptions;
    $scope.transactionDetail= tableData;
    
    function transactionDetails(url){
        $scope.transactionDetail.splice(0,$scope.transactionDetail.length);
        loading= load, snipper= snip;
        tableData[0]= new transactionTable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper),     '','','','','','','','','','');
        $scope.transactionDetail= tableData;
        
        httpService.get( url).then(function (response) {
            var objArray= response.data;
            console.log("objArray.length",objArray.length);
            if(objArray.length>0){
                var recordData, usageData= [], transactionData= [], transactionExportData= [], usageData1= [];
                for(var i=0; i<objArray.length;i++){
                    recordData= (objArray[i].record).split(",");
                    

                        /*0.starttime
                        1.durValue
                        2.appprotocol
                        3.sourceip
                        4.sourceport
                        5.destip
                        6.destport
                        7.sourcemac
                        8.destmac
                        9.url
                        10.app
                        11.totalpacketvolume
                        12.uppacketvolume
                        13.downpacketvolume
                        14.uppeaksessionthroughput
                        15.dwpeaksessionthroughput
                        16.firstbytelatency*/

                    var selDate= new Date($scope.dateSelect);
                    var tempSelDate= new Date(selDate.getUTCFullYear(), selDate.getUTCMonth(), selDate.getUTCDate(),  selDate.getUTCHours(), selDate.getUTCMinutes(), selDate.getUTCSeconds(), selDate.getUTCMilliseconds())
                    console.log("tempSelDate",tempSelDate.getTime());
                    
                    var fixDate= new Date('2017-07-03');
                    var tempFixDate= new Date(fixDate.getUTCFullYear(), fixDate.getUTCMonth(), fixDate.getUTCDate(),  fixDate.getUTCHours(), fixDate.getUTCMinutes(), fixDate.getUTCSeconds(), fixDate.getUTCMilliseconds())
                    console.log("tempFixDate",tempFixDate.getTime() );
                    
                    // if(selDate >= fixDate){
                        transactionExportData[i]= {"Date":recordData[0], "Duration":recordData[1], "App Protocol":recordData[2], "Source IP":recordData[3],"Source Port":recordData[4],"Destination IP":recordData[5], "Destination Port":recordData[6], "Source Mac":recordData[7], "Destination Mac":recordData[8], "App":recordData[10], "URL":recordData[9], "Total Volume":recordData[11], "Up Volume": recordData[12], "Down Volume": recordData[13], "Up Peak Throughput":recordData[14],"Down Peak Throughput":recordData[15], "Latency":recordData[16] }
                        
                        transactionData[i]= { "datatime":recordData[0].substring(11,23), "duration":recordData[1], "appprotocol":recordData[2], "ipz":recordData[5], "app":recordData[10], "sport":recordData[4], "dport": recordData[6], "url":recordData[9], "volume":recordData[11], "upVolume": recordData[12], "downVolume": recordData[13], "throughput":recordData[15], "latency":recordData[16] }
                    // }
                    /*else{
                        transactionData[i]= {"datatime":recordData[0].substring(11,23), "duration":recordData[1], "appprotocol":recordData[2], "":recordData[3], "ipz":recordData[4], "app":recordData[5], "sport":recordData[6], "dport": recordData[7], "url":recordData[8], "volume":recordData[9], "upVolume": recordData[10], "downVolume": recordData[11], "throughput":recordData[12], "latency":recordData[13] };

                        transactionExportData[i]= {"Date":recordData[1], "Session Duration":recordData[2], "App Protocol":recordData[3], "Destination IP":recordData[4], "App":recordData[5], "Source Port":recordData[6], "Destination Port": recordData[7], "URL":recordData[8], "Total Usage":recordData[9], "Up Usage": recordData[10], "Down Usage": recordData[11], "Throughput":recordData[12], "Latency":recordData[13] };
                    }*/
                }
                console.log("transactionData",transactionData.length);
                $scope.exportTransactionDetails= angular.copy(transactionExportData);
                for(var i=0;i<transactionData.length;i++){
                    var app
                    if(transactionData[i].app=='NOT CLASSIFIED'){
                        app= 'NA';
                    }
                    else{
                        app= transactionData[i].app;
                    }
                    
                    loading= "<span>"+transactionData[i].datatime+"</span>";
                    snipper=  "<span>"+transactionData[i].duration+"</span>";
                    tableData[i]= new transactionTable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper), transactionData[i].appprotocol, transactionData[i].ipz,app, transactionData[i].sport, transactionData[i].dport, transactionData[i].url, dataFormatter.formatUsageData(transactionData[i].volume,1), dataFormatter.formatUsageData(transactionData[i].upVolume,1), dataFormatter.formatUsageData(transactionData[i].downVolume,1), dataFormatter.formatBwBitsData(transactionData[i].throughput,1), transactionData[i].latency);
                }
                // console.log('tableReasopnse',$scope.transactionDetail);
                //$scope.dataTableOptions= dataTableOptions;
                //$scope.transactionDetail= objArray;
            }
            else{
                //$scope.transactionDetailsOptions= transactionDetailsOptions;
                $scope.transactionDetail.splice(0,$scope.transactionDetail.length);
                tableData[0]= new transactionTable('No','Record!','','','','','','','','','','')
                $scope.transactionDetail= tableData;
                //console.log('tableData',$scope.transactionDetail);
            }
        });
    }
    
    // AAA Transaction Table Details
    function transactionAAATable(a,b,c,d,e,f,g){
        this.Date= a;
        this.Duration= b;
        this.OpType= c;
        this.Request= d;
        this.IP= e;
        this.AccountStatus= f;
        this.Response= g;
        
    }
    var tableAAAData= [];
                   
    loading= load, snipper= snip;
    tableAAAData[0]= new transactionTable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper), '','','','','');
    $scope.transactionDetailsOptions= transactionDetailsOptions;
    $scope.transactionAAADetail= tableAAAData;
    
    function transactionAAADetails(url){
        $scope.transactionAAADetail.splice(0,$scope.transactionAAADetail.length);
        loading= load, snipper= snip;
        tableAAAData[0]= new transactionAAATable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper),'','','','','');
        $scope.transactionAAADetail= tableAAAData;
        
        httpService.get( url).then(function (response) {
            var objArray= response.data;
            
            if(objArray.length>0){
                var recordData, usageData= [], transactionData= [], transactionExportData= [], usageData1= [];
                for(var i=0; i<objArray.length;i++){
                    recordData= (objArray[i].record).split(",");
                    transactionData[i]= { "Date":recordData[0].substring(11,23), "Duration":recordData[1], "OpType":recordData[2], "Request":recordData[3], "IP":recordData[4], "AccountStatus":recordData[5], "Response": recordData[6]}
                    
                }
                for(var i=0;i<transactionData.length;i++){
                                        
                    loading= "<span>"+transactionData[i].Date+"</span>";
                    snipper=  "<span>"+transactionData[i].Duration+"</span>";
                    tableAAAData[i]= new transactionAAATable($sce.trustAsHtml(loading),$sce.trustAsHtml(snipper), transactionData[i].OpType, transactionData[i].Request, transactionData[i].IP, transactionData[i]['AccountStatus'], transactionData[i].Response);
                }
                $scope.transactionAAADetail= tableAAAData;
            }
            else{
                // $scope.transactionAAADetail.splice(0,$scope.transactionDetail.length);
                tableAAAData[0]= new transactionAAATable('No','Record!','','','','','','')
                $scope.transactionAAADetail= tableAAAData;
            }
        });
    }
    
    function throughputDetails(url, tpParamObj){
        // console.log("tpParamObj", tpParamObj);
        $scope[tpParamObj.loadingDiv]= true;
        $scope[tpParamObj.noDataDiv]= false;
        $scope[tpParamObj.exportDetail]= [];
        var throughputData= [], unformatedThroughputArray= [], formatedThroughputArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            if(objArray.length>0){
                var exportTpmDetail= angular.copy(objArray);
                // $scope.loadingThroughputDiv= true;
                // $scope.dataThroughputDiv= false;
                // $scope.noDataThroughputDiv= false;
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                        exportTpmDetail[i]['Throughput(bps)']= exportTpmDetail[i]['Throughput'];
                        delete exportTpmDetail[i]['Throughput']
                    }
                } 
                // console.log("unformatedThroughputArray", unformatedThroughputArray);
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                
                var index= -1;
                for(var i=0;i<objArray.length; i++){
                    if(objArray[i].hasOwnProperty('Throughput')){
                        throughputData.push([objArray[i].Time,parseFloat(formatedThroughputArray[0][++index])]);
                    }
                }
                //console.log('throughputData', throughputData);
                var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                
                $scope[tpParamObj.chartConfig]= {
                     "options" : optionsThroughputBar,
                    "series": [{name: "Throughput",
                                color:"rgb(39, 174, 96)",
                               data: throughputData
                               },
                              ]
                }
                
                $scope[tpParamObj.exportDetail]= angular.copy(exportTpmDetail);
                $scope[tpParamObj.loadingDiv]= false;
                $scope[tpParamObj.noDataDiv]= false;
                
            }else{
                $scope[tpParamObj.loadingDiv]= false;
                $scope[tpParamObj.noDataDiv]= true;
            }
        })
    }
    
    function throughputDetailsAppCDN(url){
        // console.log("tpParamObj", tpParamObj);
        $scope.loadingThroughputDiv= true;
        $scope.noDataThroughputDiv= false;
        $scope.exportTpmDetail= [];
        var throughputData= [], unformatedThroughputArray= [], formatedThroughputArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            if(objArray.length>0){
                var exportTpmDetail= angular.copy(objArray);
                $scope.loadingThroughputDiv= true;
                $scope.dataThroughputDiv= false;
                $scope.noDataThroughputDiv= false;
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                        exportTpmDetail[i]['Throughput(bps)']= exportTpmDetail[i]['Throughput'];
                        delete exportTpmDetail[i]['Throughput']
                    }
                } 
                // console.log("unformatedThroughputArray", unformatedThroughputArray);
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                
                var index= -1;
                for(var i=0;i<objArray.length; i++){
                    if(objArray[i].hasOwnProperty('Throughput')){
                        throughputData.push([objArray[i].Time,parseFloat(formatedThroughputArray[0][++index])]);
                    }
                }
                //console.log('throughputData', throughputData);
                var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                
                $scope.throughputChartConfig= {
                     "options" : optionsThroughputBar,
                    "series": [{name: "Throughput",
                                color:"rgb(39, 174, 96)",
                               data: throughputData
                               },
                              ]
                }
                
                $scope.exportTpmDetail= angular.copy(exportTpmDetail);
                $scope.loadingThroughputDiv= false;
                $scope.noDataThroughputDiv= false;
                
            }else{
                $scope.loadingThroughputDiv= false;
                $scope.noDataThroughputDiv= true;
            }
        })
    }

    
    function usagelast30Days(url, appURL,appWiseUsageURL){
        $scope.loadingUsageDiv= true;
        $scope.noDataUsageDiv= false;
        //---------------------------------------------------
        // console.log("Submit fromDate", new Date($scope.date.start).getTime());
        var fromDateMillis= new Date($scope.date.start).getTime()
        var oneDayMillis= 86400000;
        // console.log("Submit startDate", new Date($scope.date.start).getTime());
        // console.log("Submit endDate", new Date($scope.date.end).getTime());
        var toDateMillis= new Date($scope.date.end).getTime()
        var millisArray =[];

        for(var i= fromDateMillis; i<=toDateMillis; i=i+oneDayMillis){
            millisArray.push(i);
            // console.log("1")
        }
        // console.log("millisArray",millisArray );


        //---------------------------------------------------
        $scope.loadingAppDistributionDiv= true;
        $scope.noDataAppDistributionDiv= false;
        //usage last 30 days
        $scope.exportSubscriberUsage= [];
        httpService.get(url).then(function(response){
            var objArray= response.data;
            //console.log("objArray", objArray);
            if(objArray.length>0){
                var exportUsgDist30DaysDetail= angular.copy(objArray);
                var usageFormatArray= [], usagelast30DaysArray= [], woUsagelast30DaysArray= [], dateArray= [];
                for(var i=0; i<objArray.length; i++){
                    usageFormatArray[i]= objArray[i].Usage;
                    dateArray[i]= objArray[i].Date;
                    exportUsgDist30DaysDetail[i]['Usage(Bytes)'] =  objArray[i].Usage;
                    delete exportUsgDist30DaysDetail[i]['Usage'];
                }

                var usageFormattedArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageFormatArray, 3);
                // console.log("usageFormattedArray", usageFormattedArray[0].length);

                for(var i in millisArray){
                    var index= $.inArray(millisArray[i], dateArray);
                    // console.log("index", index);
                    if(index != '-1'){
                        usagelast30DaysArray[i]= [objArray[index].Date, parseFloat(usageFormattedArray[0][index])];
                        woUsagelast30DaysArray[i]= [objArray[index].Date,null];
                    }else{
                        console.log("millisArray[i]", millisArray[i]);
                        usagelast30DaysArray[i]= [millisArray[i], null];
                        woUsagelast30DaysArray[i]= [millisArray[i], 0];
                    }
                }
                
                
               /* for(var i=0; i<objArray.length; i++){
                    usagelast30DaysArray[i]= [objArray[i].Date, parseFloat(usageFormattedArray[0][i])];    
                }*/
                //console.log("usagelast30DaysArray", usagelast30DaysArray);
                var barChartOpt= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions)
                barChartOpt.xAxis.labels= {
                                "format": "{value:%e. %b }",
                                "align": "left"
                            }
                barChartOpt.yAxis.title= {"text":"Usage("+ usageFormattedArray[1] +")"}
                barChartOpt.colors= ["#7cb5ec","rgb(39, 174, 96)"];
                barChartOpt.tooltip.xDateFormat="%e. %b";
                barChartOpt.tooltip.pointFormat='Usage<b> {point.y:.2f} '+ usageFormattedArray[1];
                /*$scope.barChartConfig={
                    "options" : barChartOpt,
                    series:[{
                        name: 'Usage Last 30 Days',
                        data: usagelast30DaysArray
                    }]
                }*/
                
                var scatterChartOpt= angular.copy(highchartOptions.highchartScatterLabelDatetimeOptions);

                scatterChartOpt.yAxis.title= {
                                text: 'Usage('+usageFormattedArray[1]+")"
                            };
                // scatterChartOpt.plotOptions.scatter.tooltip.pointFormat= 'Usage<b> {point.y:.2f} '+  usageFormattedArray[1];
                // $scope.scatterChartConfig
                $scope.barChartConfig={
                    // "options" : scatterChartOpt,
                    "options" : barChartOpt,
                    series:[{
                        type: 'scatter',
                        name: 'No Usage',
                        color: "#ed5565",
                        data: woUsagelast30DaysArray,
                        /*"xAxis" :{
                            "type": "datetime",
                            "labels": {
                                "format": "{value:%e%b}",
                                "align": "left"
                            }
                        },*/
                        showInLegend: false,
                        /*tooltip:
                        {
                            formatter: function() {
                                console.log("series", this);
                                var tltp= $filter('date')( new Date(this.point.x).getTime(), 'yyyy-MM-dd')
                                return tltp
                            }
                        }*/
                    },{
                        type: 'column',
                        name: 'Usage Last 30 Days',
                        color: "#7cb5ec",
                        data: usagelast30DaysArray
                    }]
                }
                $scope.loadingUsageDiv= false;
                $scope.noDataUsageDiv= false;

                $scope.exportUsgDist30DaysDetail= angular.copy(exportUsgDist30DaysDetail);
            }
            else{
                $scope.loadingUsageDiv= false;
                $scope.noDataUsageDiv= true;
            }
        })


        
        //app Distribution
        $scope.exportSubscriberAppDistribution= [];
        httpService.get(appURL).then(function(response){
            var objArray= response.data;
            // console.log("objArray", objArray);
            if(objArray.length>0){
                var exportAppDist30DaysDetail= angular.copy(objArray);
                var appUsageFormatArray= [], appUsagelast30DaysArray= [], appBarDataArray= [], appArray= [];
                
                //for bar chart data
                for(var i=0; i<objArray.length; i++){
                    appUsageFormatArray[i]= objArray[i].Usage;    
                    exportAppDist30DaysDetail[i]['Usage(Bytes)']= exportAppDist30DaysDetail[i].Usage;   
                    delete  exportAppDist30DaysDetail[i]['Usage'];
                }
                
                var appUsageFormattedArray= dataFormatter.convertFixUnitUsageDataWoUnit(appUsageFormatArray, 3);
                //console.log("appUsageFormattedArray", appUsageFormattedArray);
                for(var i=0; i<objArray.length; i++){
                    appArray[i]= objArray[i].App;
                   appBarDataArray[i]= parseFloat(appUsageFormattedArray[0][i]);
                }
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){
                    appUsagelast30DaysArray[i]= {
                        name: objArray[i].App, 
                        y: parseFloat(objArray[i].Usage)
                    };
                }
                // console.log("appUsagelast30DaysArray", appUsagelast30DaysArray);
                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                pieChartOpt.plotOptions.pie.dataLabels.style.color= colopallette;
                $scope.appPieChartConfig= {
                    "options" : pieChartOpt,
                    series: [{
                        name: 'Brands',
                        colorByPoint: true,
                        data: appUsagelast30DaysArray
                    }]
                }
                
                var appBarChartOpt= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                appBarChartOpt.tooltip= {
                            pointFormat: 'Usage<b> {point.y:.2f} '+ appUsageFormattedArray[1] ,
                            "shared": true
                        }
                appBarChartOpt.xAxis.categories= appArray;
                appBarChartOpt.yAxis= {
                            "title": {"text":"Usage("+appUsageFormattedArray[1]+")"}
                        };

                $scope.appBarChartConfig= {
                    "options" : appBarChartOpt,
                    "series": [{
                        name: "Apps",
                        color: "rgb(39, 174, 96)",
                        data: appBarDataArray
                    }]
                }
                
                $scope.loadingAppDistributionDiv= false;
                $scope.noDataAppDistributionDiv= false;

                $scope.exportAppDist30DaysDetail= angular.copy(exportAppDist30DaysDetail);
            }
            else{
                $scope.loadingAppDistributionDiv= false;
                $scope.noDataAppDistributionDiv= true;
            }
        })

        // Multipline App usage chart information 
        $scope.loadingAppsMultiineDiv= true;
        $scope.DataAppsMultiineDiv= false;
        $scope.noDataAppsMultiineDiv= false;  
        $scope.showBar= false;  
        
        httpService.get(appWiseUsageURL).then(function(response){
            var objArray= response.data;
            $scope.exportObjData= [];
            //console.log("multiline", objArray);
            if(objArray.length>0){
                
                var exportObjData= angular.copy(objArray);

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= 'Usage';
                paramObject.seriesName= "App";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                paramObject.unit= "MB";
                
                var AppsMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                AppsMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                AppsMultiLineOptions.yAxis.title.text="Usage( MB )";

                AppsMultiLineOptions.tooltip={pointFormat: '{series.name} : <b>{point.y:,.0f}</b>', "xDateFormat": "%e %b"};

                // AppsMultiLineOptions.tooltip.pointFormat='Usage<b> {point.y:.2f} '+ "GB";

                for(var i in exportObjData){
                    for(var j in exportObjData[i]['data']){
                        exportObjData[i]['data'][j]['Usage(Bytes)']= exportObjData[i]['data'][j]['Usage'];
                        delete exportObjData[i]['data'][j]['Usage'];
                    }
                }

                AppsMultiLineOptions.chart.height= 400;
                
                // stacked bar first and last day
               
                // end stacked bar first and last day
                
                // console.log("CUstomer deatail page ",highchartProcessData.multilineProcessHighchartData(paramObject))
                paramObject.flag= "series";
                $scope.AppsMultiineChartConfig= {
                    options: AppsMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                $scope.exportObjData= angular.copy(exportObjData);

                $scope.loadingAppsMultiineDiv= false;
                $scope.DataAppsMultiineDiv= true;
                $scope.noDataAppsMultiineDiv= false;  
                $scope.showBar= true;  
            }
            else{
                $scope.loadingAppsMultiineDiv= false;
                $scope.DataAppsMultiineDiv= false;
                $scope.noDataAppsMultiineDiv= true;  
            }
        })



    }
    
    function getUsageMonthwise(url){
        
        $scope.loadingUsageMonthwiseDiv= true;
        $scope.DataUsageMonthwiseDiv= false;
        $scope.noDataUsageMonthwiseDiv= false;
        
        httpService.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            
            $scope.exportUsgSubData= [];
            var exportUsageMonthwiseData= angular.copy(objArray);
            //console.log("response", objArray);
            if(objArray.length>0){
                
                var usageData= [], avgUsageData= [], timeArray= [], usageDataArray= [], avgUsageDataArray= [];
                for(var i=0; i<objArray.length;i++){
                    usageDataArray[i]=  objArray[i].Usage;
                    avgUsageDataArray[i]=  objArray[i].AvgUsage;
                    
                    exportUsageMonthwiseData[i]['Usage(Bytes)']= exportUsageMonthwiseData[i].Usage;
                    exportUsageMonthwiseData[i]['AvgUsage(Bytes)']= exportUsageMonthwiseData[i].AvgUsage;
                    delete exportUsageMonthwiseData[i]['Usage'];
                    delete exportUsageMonthwiseData[i]['AvgUsage'];
                }

                var FormattedAvgUsageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(avgUsageDataArray, 1);
                var FormattedusageDataArray= dataFormatter.convertSingleUnitUsageData(usageDataArray, 1, FormattedAvgUsageDataArray[1])
                
                var xaxisArray= [], tickArray= [];
                
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Date;
                    usageData[i]= parseFloat(FormattedusageDataArray[i]);
                    avgUsageData[i]= parseFloat(FormattedAvgUsageDataArray[0][i]);
                }

                var usageVsAvgUsageChartOptions;
                
                    usageVsAvgUsageChartOptions= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                    usageVsAvgUsageChartOptions.xAxis.labels= {
                                "format": "{value: %b }",
                                "align": "left"
                            }
                    usageVsAvgUsageChartOptions.tooltip.xDateFormat=" %b";
                    $scope.UsageMonthwiseChartConfig= {
                        options: usageVsAvgUsageChartOptions,
                        series: [{
                            type: 'bar',
                            name: 'Usage',
                            "color": "#1abc9c",
                            data: usageData,
                            tooltip: {
                                pointFormat: '{series.name} : <b>{point.y:,.3f}</b><br>',"xDateFormat": " %b", 
                            }
                        }, {
                            type: 'line',
                            name: 'Avg. Usage',
                            color: "rgb(44, 130, 201)",
                            data: avgUsageData,
                            tooltip: {
                                pointFormat: '{series.name} : <b>{point.y:,.3f}</b><br>',"xDateFormat": " %b", 
                            }
                        }]
                    };
                
                
                usageVsAvgUsageChartOptions.xAxis.categories= timeArray;
                usageVsAvgUsageChartOptions.xAxis.labels.format= "{value: %b}";
                
                /*usageVsAvgUsageChartOptions.yAxis[0].title.text= 'Avg. Usage('+FormattedAvgUsageDataArray[1]+")";
                usageVsAvgUsageChartOptions.yAxis[0].min= 0;*/
                usageVsAvgUsageChartOptions.yAxis.title.text= 'Usage('+FormattedAvgUsageDataArray[1]+")";
                $scope.exportUsageMonthwiseData= angular.copy(exportUsageMonthwiseData);

                $scope.loadingUsageMonthwiseDiv= false;
                $scope.DataUsageMonthwiseDiv= true;
                $scope.noDataUsageMonthwiseDiv= false;
            }else{
                $scope.loadingUsageMonthwiseDiv= false;
                $scope.DataUsageMonthwiseDiv= false;
                $scope.noDataUsageMonthwiseDiv= true;
            }
        })
    }
    
    function headerDetails(url){
        httpService.get(url).then(function (response) {
            var obj= response.data;
            
            //churn threat url and data
            /*var churnThreatURL= globalConfig.pulldataurlbyname+"Churn Threat Customer Tagging&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect;
            httpService.get(churnThreatURL).then(function (response) {
                var churnObj= response.data;
                if(churnObj[0].ChurnThreat=='Yes')
                    $scope.churnT= churnObj[0].ChurnThreat;
                else
                    $scope.churnT= 'false';
            });*/

            //usage Quota used and left
            var usageQuotaURL= globalConfig.pulldataurlbyname+"Customer Usage Quota used left&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z&toDate="+$scope.dateSelect+"T23:59:59.999Z";
            httpService.get(usageQuotaURL).then(function (response) {
                var usageQuotaObj= response.data;
                if(usageQuotaObj.length>0){
                    $scope.quota= usageQuotaObj[0]['Quota(GB)'];
                    $scope.quotaLeft= usageQuotaObj[0]['QuotaLeft'];
                }else{
                   $scope.quota= ''; 
                   $scope.quotaLeft= ''; 
                }
            });

            //upgrade/degrade subscriber
            var upgradeDegradeSubURL= globalConfig.pulldataurlbyname+"Subscriber Upgraded or degraded&userid="+$scope.customer.ip;
            httpService.get(upgradeDegradeSubURL).then(function (response) {
                var upgradeDegradeSubObj= response.data;
                if(upgradeDegradeSubObj.length>0 && usageQuotaObj[0]['Status'] != 'UnChanged'){
                    $scope.upgradeDegradeSub= usageQuotaObj[0]['LastPlan'];
                }else{
                   $scope.upgradeDegradeSub= ''; 
                }
            });

            if(obj.length>0){
                var userID= obj[0].customerid
                $scope.ip = obj[0].ip;
                $scope.name = obj[0].name;
                $scope.billPlan= obj[0].billplan;
                $scope.speed= (obj[0].planspeed/1000).toFixed(0); // getting in Kbps
                $scope.sourceip= obj[0].sourceip;
                $scope.segment= obj[0].segment;
                $scope.node= obj[0].dslam;
                $scope.splitter= obj[0].splitterl2;
                $scope.city= obj[0].city;
                $scope.updatedolt= obj[0].updatedolt;
                $scope.emailid= obj[0].emailid;
                $scope.subscriberid= obj[0].subscriberid;
                $scope.lookupid= obj[0].lookupid;
                $scope.phone1 = obj[0].phone1;
                $scope.splitterl1 = obj[0].splitterl1;
                $scope.status = obj[0].status;
                $scope.pon = obj[0].pon;


                // $scope.quota= obj[0].usagequota;
                $scope.area= obj[0].area;
                $scope.cpe= obj[0].cpemake;
                $scope.cpeType= obj[0].cpetypename;
                $scope.clas
                
                $scope.classification= obj[0].classification;
                if($scope.IPorId =='IP')
                    $scope.IPId= obj[0].ip;
                else
                    $scope.IPId= $scope.customer.ip;
            }
            else{
                SweetAlert.swal({
                    title: "Subscriber does not exist!!",
                    text: "Please check Subscriber ID/IP",
                    type: "error",
                })
                $scope.showUserDetails=false
                $scope.billPlan= "";
                $scope.speed= '';
                $scope.sourceip= $scope.customer.ip;
                $scope.segment= "";
                $scope.node= "";
                // $scope.splitter= obj[0].splitterl2;
                $scope.city= '';
                // $scope.quota= '';
                $scope.area= '';
                $scope.accountid= '';
                $scope.subscriberid= '';
                $scope.lookupid= '';
                $scope.phone1='';
                $scope.cpe= '';
                $scope.emailid = '';
                $scope.updatepon = '';
                $scope.pon = '';
                $scope.cpeType= '';
                $scope.classification= '';
                if($scope.IPorId =='IP')
                    $scope.IPId= '';
                else
                    $scope.IPId= $scope.customer.ip;
            }
        });
    }
    
    $rootScope.filter= {};
    function transactionDetailsMakeURL(){
        $scope.transactionDetailsTab= {active: true};
            
        var selDate= new Date($scope.dateSelect);
        var tempSelDate= new Date(selDate.getUTCFullYear(), selDate.getUTCMonth(), selDate.getUTCDate(),  selDate.getUTCHours(), selDate.getUTCMinutes(), selDate.getUTCSeconds(), selDate.getUTCMilliseconds())
        // console.log("tempSelDate",tempSelDate.getTime());

        var fixDate= new Date();
        var tempFixDate= new Date(fixDate.getUTCFullYear(), fixDate.getUTCMonth(), fixDate.getUTCDate())
                    
        var csrDuration= fixDate.getTime()- globalConfig.csrDuration*24*60*60*1000;
        // console.log("globalConfig.csrDuration", globalConfig.csrDuration);
        if(tempSelDate > csrDuration || globalConfig.csrDuration < 0){
            var param= new String($scope.dateSelect+" "+$scope.hour);
            $scope.getHour= angular.copy($scope.hour);
            transactionDetailURL= globalConfig.clistener+$scope.customer.ip+"&fordate="+encodeURIComponent(param);
            console.log("transactionDetailURL", transactionDetailURL);
            // transactionDetails(transactionDetailURL);
            filteredTransactionDetails();
        }else{
            SweetAlert.swal({
                title: "Not Available",
                text: "Subscribers session information only available last 7 days. Please contact Admin for older records",
                type: "error",
            })
            $scope.transactionDetail.splice(0,$scope.transactionDetail.length);
            tableData[0]= new transactionTable('No','Record!','','','','','','','','','','')
            $scope.transactionDetail= tableData
        }
    }
    
    function filteredTransactionDetails(){
        console.log("$rootScope.filter", $rootScope.filter);
        if($rootScope.filter != null || $rootScope.filter != 'undefined'){
            
            $scope.infoLine= true;
            $scope.protocol= null;
            $scope.usage= null;
            $scope.tp= null;
            $scope.appInfo= null;
            $scope.urlInfo= null;
            
            transactionDetailURL= globalConfig.clistener+$scope.customer.ip+"&fordate="+$scope.dateSelect+" "+$scope.hour;
            
            if(angular.isDefined($rootScope.filter.protocol)){
                if(angular.isDefined($rootScope.filter.usage ||$rootScope.filter.app ||$rootScope.filter.url )){
                    $scope.protocol= 'App Protocal- '+$rootScope.filter.protocol+', ';
                }else{
                    $scope.protocol= 'App Protocal- '+ $rootScope.filter.protocol;
                }
                transactionDetailURL= transactionDetailURL+ "&protocol="+ $rootScope.filter.protocol;
            }

            if(angular.isDefined($rootScope.filter.app)){
                if(angular.isDefined($rootScope.filter.usage ||$rootScope.filter.url )){
                    $scope.appInfo= 'App- '+$rootScope.filter.app+', ';
                }else{
                    $scope.appInfo= 'App- '+ $rootScope.filter.app;
                }
                transactionDetailURL= transactionDetailURL+ "&app="+ $rootScope.filter.app;
            }
            if(angular.isDefined($rootScope.filter.url)){
                if(angular.isDefined($rootScope.filter.usage) || angular.isDefined($rootScope.filter.tp)){
                    $scope.urlInfo= 'URL- '+$rootScope.filter.url+', ';
                }else{
                    $scope.urlInfo= 'URL- '+ $rootScope.filter.url;
                }
                transactionDetailURL= transactionDetailURL+ "&url="+ $rootScope.filter.url;
            }

            if(angular.isDefined($rootScope.filter.usage)){
                if( angular.isDefined($rootScope.filter.tp)){
                    $scope.usage= 'Usage '+$rootScope.filter.usageOperator+" "+$rootScope.filter.usage+" "+$rootScope.filter.usageUnit +', ';
                }else{
                    $scope.usage= 'Usage '+$rootScope.filter.usageOperator+" "+$rootScope.filter.usage+" "+$rootScope.filter.usageUnit ;
                }
                
                transactionDetailURL= transactionDetailURL+ "&usage="+ usageValue;
            }
            
            if(angular.isDefined($rootScope.filter.tp)){
                $scope.tp= 'Throughput '+$rootScope.filter.tpOperator+" "+$rootScope.filter.tp+" "+$rootScope.filter.tpUnit 
                transactionDetailURL= transactionDetailURL+ "&tp="+ tpValue;
            }
            
            transactionDetails(transactionDetailURL);
        }
    }
    
    function defaultLoad(){
        
        $rootScope.filter= {};
        if($scope.customer.enterIPorId.length>0){
            $scope.showUserDetails=true
        
            var userDataQueryName;

            checkIPorID($scope.customer.enterIPorId,function(res){
                // console.log("$scope.customer.enterIPorId", $scope.customer.enterIPorId);
                /*if(checkIPorID($scope.customer.enterIPorId)=='IP'){
                    // console.log( 'IP');
                    var getIdQueryName = "User IP to customerid&userip=";
                    getIdQueryName= encodeURIComponent(getIdQueryName);
                    var getIdURL= globalConfig.pulldataurlbyname+getIdQueryName+$scope.customer.ip;
                    httpService.get(getIdURL).then(function (response) {
                        var objArray= response.data;
                        if(objArray.length>0){
                            $scope.subId= objArray[0].userid;
                            $scope.customer.ip= $scope.subId;
                        }
                    })
                }else{
                    userDataQueryName= "User Account Details BB&userid=";
                        $scope.customer.ip= $scope.enterIPorId
                        
                }*/
                // console.log("res", res);
                $scope.IPorId= res;
                userDataQueryName= "User Account Details BB&userid=";
                // $scope.customer.ip= $scope.enterIPorId
                headerdetailURL= globalConfig.pulldataurlbyname+userDataQueryName+$scope.customer.ip;
                headerDetails(headerdetailURL);

                var usagePeakThroughputURL= globalConfig.pulldataurlbyname+"Customer Usage PeakThroughput&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect;
                console.log("$scope.customer.ip", $scope.customer.ip);
                
                httpService.get(usagePeakThroughputURL).then(function (response) {
                    var obj= response.data;
                    if(obj.length>0)
                    {
                        $scope.usageTotal= dataFormatter.formatUsageData(obj[0].TotalUsage,2);
                            
                        if(obj[0].hasOwnProperty("PeakThroughput"))
                                $scope.PeakThroughputOverall= dataFormatter.formatBwBitsData(obj[0].PeakThroughput,2)
                        if(obj[0].hasOwnProperty("PeakThroughputUncached"))
                                $scope.PeakThroughputUncached = dataFormatter.formatBwBitsData(obj[0].PeakThroughputUncached,2)
                        var temp= (new Date(obj[0].LastUpdated)).getTime()+globalConfig.tzoffset;
                        // console.log("update Time", $filter('date')(temp,' yyyy-MM-dd H:mm'));
                        $scope.updateTime= $filter('date')(temp,' yyyy-MM-dd H:mm');
                        if(obj[0].hasOwnProperty("Device")){
                            $scope.devicesConnected= obj[0].Device;
                            var arr= obj[0].Device;
                            console.log("arr", arr);
                            for(var i=0; i< arr.length; i++){
                                if(arr[i]=="UNKNOWN" || arr[i]=="Unknown" )
                                {
                                    var dump= $scope.devicesConnected.splice(i, 1);
                                    // console.log(i);
                                }
                            }
                            $scope.devicesConnected= $scope.devicesConnected.join(' , ');
                        }
                        
                        // var userID= obj[0].customerid
                        // $scope.billPlan= obj[0].billplan;
                        // $scope.speed= (obj[0].planspeed/1000).toFixed(0); // getting in Kbps
                        // $scope.sourceip= obj[0].sourceip;
                        // $scope.segment= obj[0].segment;
                        // $scope.node= obj[0].dslam;
                        // $scope.city= obj[0].city;
                        // $scope.area= obj[0].area;
                        // $scope.cpe= obj[0].cpemake;
                        // $scope.cpeType= obj[0].cpetypename;
                        // $scope.classification= obj[0].classification;
                        // if($scope.IPorId =='IP')
                        //     $scope.IPId= obj[0].ip;
                        // else
                        //     $scope.IPId= $scope.customer.ip;
                    }else{
                        $scope.usageTotal= '';
                        $scope.PeakThroughputOverall= '';    
                        $scope.PeakThroughputUncached= '';    
                        $scope.updateTime= ''; 
                        $scope.devicesConnected= '';
                        // $scope.billPlan= "";
                        // $scope.speed= '';
                        // $scope.sourceip= $scope.customer.ip;
                        // $scope.segment= "";
                        // $scope.node= "";
                        // $scope.city= '';
                        // $scope.area= '';
                        // $scope.cpe= '';
                        // $scope.cpeType= '';
                        // $scope.classification= '';
                        // if($scope.IPorId =='IP')
                        //     $scope.IPId= '';
                        // else
                        //     $scope.IPId= $scope.customer.ip;  
                    }
                })
                
                $scope.sID= $scope.customer.ip;
                $scope.edate= $scope.dateSelect;

                switch($scope.currentTab){
                    case 'profile':
                        $scope.customerId= $scope.customer.ip;
                        $scope.datepickerShow= true;
                        var profileDetailsURL= globalConfig.pulldataurlbyname+"Customer Profile information&userid="+$scope.customer.ip;
                        
                        profileDetails(profileDetailsURL);
                        break;
                    
                    case 'usage':

                        $scope.datepickerShow= true;
                        usageDetailsURL= globalConfig.pulldataurlbyname+"Usage for selected userid&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect;
                        
                        usageDetails(usageDetailsURL);
                        break;
                    
                    case 'app':

                        /*$scope.exportAppHrlyObj= {};
                        $scope.exportAppHrlyObj.fileName= 'Subscriber Details_App Distribution Hourly';
                        $scope.exportAppHrlyObj.fileHeader= "Hourly Apps Distribution for Subscriber: "+$scope.sID+" for date "+$scope.edate;*/

                        $scope.exportAppDistObj= {};
                        $scope.exportAppDistObj.fileName= 'Subscriber Details_App Distribution';
                        $scope.exportAppDistObj.fileHeader= "Apps Distribution for Subscriber: "+$scope.sID+" for date "+$scope.edate;

                        $scope.datepickerShow= true;
                        appwiseUsageDetailsURL= globalConfig.pulldataurlbyname+"App wise usage for selected userid&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect;
                        
                        hourlyAppwiseUsageURL= globalConfig.pulldataurlbyname+"Hourly App Usage for Customer&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect;
                
                        appwiseUsageDetails(appwiseUsageDetailsURL );
                        hourlyAppwiseUsageDetails(hourlyAppwiseUsageURL);
                        break;
                    
                    case 'throughput':

                        $scope.exportTpmObj= {};
                        $scope.exportTpmObj.fileName= 'Subscriber Details_Minute wise Throughput';
                        $scope.exportTpmObj.fileHeader= "Minute wise Throughput for Subscriber: "+$scope.sID+" for date "+$scope.edate;

                        $scope.datepickerShow= true;
                        throughputDetailsURL= globalConfig.pulldataurlbyname+"Customer Min wise Throughput&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect;
                        
                        var upThroughputDetailsURL= globalConfig.pulldataurlbyname+"Customer Min wise up Throughput&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect;
                        
                        var downTpParamObj= {};
                        downTpParamObj.loadingDiv= 'loadingDownThroughputDiv'; 
                        downTpParamObj.noDataDiv= 'noDataDownThroughputDiv';
                        downTpParamObj.chartConfig= 'downthroughputChartConfig';
                        downTpParamObj.exportDetail= 'exportDownTpmDetail';

                        var upTpParamObj= {};
                        upTpParamObj.loadingDiv= 'loadingUpThroughputDiv'; 
                        upTpParamObj.noDataDiv= 'noDataUpThroughputDiv';
                        upTpParamObj.chartConfig= 'upthroughputChartConfig';
                        upTpParamObj.exportDetail= 'exportUpTpmDetail';

                        throughputDetails( throughputDetailsURL, downTpParamObj);
                        throughputDetails(upThroughputDetailsURL, upTpParamObj);
                        break;
                    
                    case 'appThroughput':

                        $scope.exportAppTpmObj= {};
                        $scope.exportAppTpmObj.fileName= 'Subscriber Details_Minute wise App Throughput';
                        $scope.exportAppTpmObj.fileHeader= "Minute wise Throughput for Subscriber: "+$scope.sID+" for date "+$scope.edate+" for App:"+$scope.select.subApp;

                        $scope.datepickerShow= true;
                        var appThroughputDetailsURL;
                        appThroughputDetailsURL= globalConfig.pulldataurlbyname+"Customer App minute wise TP for a day&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect+"&App="+$scope.select.subApp;
                        
                        throughputDetailsAppCDN(appThroughputDetailsURL);
                        break;
                    
                    case 'CDNThroughput':

                        $scope.exportAppTpmObj= {};
                        $scope.exportAppTpmObj.fileName= 'Subscriber Details_Minute wise CDN Throughput';
                        $scope.exportAppTpmObj.fileHeader= "Minute wise Throughput for Subscriber: "+$scope.sID+" for date "+$scope.edate+" for CDN:"+$scope.select.subCDN;

                        $scope.datepickerShow= true;
                        var CDNThroughputDetailsURL, todayCDNThroughputDetailsURL;
                        CDNThroughputDetailsURL= globalConfig.pulldataurlbyname+"Customer CDN minute wise TP for a day&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect+"&CDN="+$scope.select.subCDN;
                        
                        todayCDNThroughputDetailsURL= globalConfig.pulldataurlbyname+"Customer CDN minute wise TP for a today&userid="+$scope.customer.ip+"&fromDate="+$scope.dateSelect+"&CDN="+$scope.select.subCDN;
                        if($scope.dateSelect == $filter('date')(new Date(), 'yyyy-MM-dd'))
                            throughputDetailsAppCDN(todayCDNThroughputDetailsURL);
                        else
                            throughputDetailsAppCDN(CDNThroughputDetailsURL);
                        break;
                    
                    case 'transactionDetails':
                        
                        $scope.datepickerShow= true;
                        $scope.selectMin.min= "Select Min"//"00-09";
                        $scope.select.hour= "Select Hour"//"00:00";
                        // $scope.hour= "00:00";
                        $scope.transactionDetail= [new transactionTable('No','Record!','','','','','','','','','','')];
                        // transactionDetailsMakeURL();
                        break;
                    
                    case 'transactionAAADetails':
                        
                        var transactionAAADetailsURL= globalConfig.clistenerAAA+$scope.customer.ip+"&fordate="+$scope.dateSelect;
                        
                        transactionAAADetails(transactionAAADetailsURL);
                        break;
                    
                    case 'usage30Days':
                        $scope.startDate= $scope.date.start;
                        $scope.endDate= $scope.date.end;
                        $scope.exportUsgDist30DaysObj= {};
                        $scope.exportUsgDist30DaysObj.fileName= 'Subscriber Details_Usage';
                        $scope.exportUsgDist30DaysObj.fileHeader= "Usage last 30 days for Subscriber: "+$scope.sID+" between "+$scope.date.start+"-"+$scope.date.end;

                        $scope.exportAppDist30DaysObj= {};
                        $scope.exportAppDist30DaysObj.fileName= 'Subscriber Details_App';
                        $scope.exportAppDist30DaysObj.fileHeader= "App Distribution last 30 days for Subscriber: "+$scope.sID+" between "+$scope.date.start+"-"+$scope.date.end;

                        $scope.datepickerShow= false;
                        
                        appDistributionlast30DaysURL= globalConfig.pullfilterdataurlbyname+'Customer App distribution for last 30 days&userid='+$scope.customer.ip+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z";
                        
                        usagelast30DaysURL= globalConfig.pullfilterdataurlbyname+'User usage last 30 days&userid='+$scope.customer.ip+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z";

                      var  appWiseUsageURL = globalConfig.pullfilterdataurlbyname+'User App usage last 30 days&userid='+$scope.customer.ip+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z";
                        
                        usagelast30Days(usagelast30DaysURL, appDistributionlast30DaysURL,appWiseUsageURL);
                        break;
                    
                    case 'usageMonthwise':
                        $scope.exportUsageMonthwiseObj= {};
                        $scope.exportUsageMonthwiseObj.fileName= 'Month_wise_usage';
                        $scope.exportUsageMonthwiseObj.fileHeader= "Month wise Usage between for Subscriber: "+$scope.sID+" between date "+$scope.edate+" - "+$scope.edate;

                        $scope.datepickerShow= false;
                        var yesterday= $filter('date')( new Date().getTime()- 24*3600*1000 , "yyyy-MM-dd");
                        $scope.sMonth= '2017-10-01';
                        $scope.eMonth= yesterday;
                        
                        var usageMonthwiseURL= globalConfig.pullfilterdataurlbyname+'Customer Monthly usage and avg usage&userid='+$scope.customer.ip+"&fromDate="+'2017-10-01'+"T00:00:00.000Z&toDate="+yesterday+"T23:59:59.999Z";
                        
                        getUsageMonthwise(usageMonthwiseURL);
                        break;
                }
            })

        }else{
            $scope.showUserDetails=false
            $scope.datepickerShow= true;
        }
    }
    
    $scope.showDwnldBtn= true;
    
    if(UserProfile.profileData.userType== 'circle user' || UserProfile.profileData.userType== 'user')
        $scope.showDwnldBtn= false;
    //Download transaction detail day wise
    $scope.getTransactionDaywise= function(){
        var today= new Date();
        var tempDate= new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),  today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), today.getUTCMilliseconds());
        var temp= tempDate.getTime()+globalConfig.tzoffset;
        var todayDate= $filter('date')( temp, "yyyy-MM-dd");
        
        if($scope.dateSelect == todayDate){
            SweetAlert.swal({
                title: "Not Available",
                text: "Subscribers session details download option is available for yesterday or before",
                type: "error",
            })
        }
        else{
            var downloadURL= globalConfig.downloadCSR+$scope.customer.ip+'&date='+$scope.dateSelect;
            window.open(downloadURL, '_blank'); // in new tab
        }
    }
    
    $scope.customer= {};
    
    console.log("$stateParams value from redirect page ",$stateParams);
    if($stateParams.hasOwnProperty('params') && $stateParams.params != null){
        // $scope.customer= {ip: $stateParams.params.value};
        // console.log("$stateParams.params.returnPath", $stateParams.params.returnPath);
        if($stateParams.params.returnPath == undefined){
            $stateParams.params= JSON.parse($stateParams.params); 
            // console.log("$stateParams.params", $stateParams.params);
        }   
        $scope.customer= {enterIPorId: $stateParams.params.value};    
        $scope.dateSelect= $stateParams.params.toDate;    
    }else{
        // $scope.customer= {ip: ''};
        $scope.customer= {enterIPorId: ''};
    }
    
    function checkIPorID(IPorID, res){
        var checkIP= [], index= -1, header;
        for(var i=0; i<IPorID.length; i++){
            if(IPorID.charAt(i)== "."){
                    checkIP[++index]= $scope.customer.enterIPorId.charAt(i);
                }
        }
        if(checkIP.length== "3"){
            header= "Id";
            var getIdQueryName = "User IP to customerid&userip=";
            // getIdQueryName= encodeURIComponent(getIdQueryName);
            var getIdURL= globalConfig.pulldataurlbyname+getIdQueryName+$scope.customer.enterIPorId;
            httpService.get(getIdURL).then(function (response) {
                var objArray= response.data;
                if(objArray.length>0){
                    $scope.subId= objArray[0].userid;
                    $scope.customer.ip= $scope.subId;
                    res(header);
                }else{
                    SweetAlert.swal({
                        title: "Invalid IP!!",
                        text: "Please check IP",
                        type: "error",
                    })
                    $scope.showUserDetails=false
                }
                
            })
        }
        else{
            header= "IP";
            $scope.customer.ip= $scope.customer.enterIPorId;
            res(header);
        }
    }

    defaultLoad();
    
    // Customer analytics date change event
    $scope.changeDate=function (modelName, newDate) {
        $scope.infoLine= false;
        console.log("newDate", newDate);
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
        defaultLoad();
        // getHeaderInfo();
     }
    
    // Customer analytics reset filter event
    $scope.resetFilter=function () {
        $scope.infoLine= false;
        defaultLoad();
     }
    
    //Customer analytics hour change event
    $scope.hourSelected= function(hour){
        
        $scope.infoLine= false;
        $scope.selectMin.min= "00-09";
        if(hour != null ){
            if(hour < 10){
                $scope.hour= "0"+hour+":00";
            }
            else{
                $scope.hour= hour+":00";
            }
            $scope.select.hour= $scope.hour;
            transactionDetailsMakeURL();
            
        }else{
            console.log("select.hour", $scope.select.hour);
            $scope.hour= $scope.select.hour;
        }
        // $scope.transactionDetailsTab= true;
        // $scope.tabSelected('transactionDetails')
        transactionDetailsMakeURL();
    }
    
    // Subscriber app change event
    $scope.selectedSubAppValue= function(app){
        $scope.select.subApp= app;
        defaultLoad();
    } 
    
    // Subscriber CDN change event
    $scope.selectedSubCDNValue= function(CDN){
        $scope.select.subCDN= CDN;
        defaultLoad();
    } 

    //customer analytics min change event
    $scope.minSelected= function(){
        $scope.infoLine= false;
        // console.log("select.Min", $scope.selectMin.min);
        var min= _.split($scope.selectMin.min, '-', 1);
        // console.log("min", min);
        hour= $scope.select.hour.substring(0,3);
        // console.log("hour", hour);
        $scope.hour= hour+min;
        transactionDetailsMakeURL()
    }

    //month button click event
    $scope.statusMnthBtn= function(threeMnth,sixMnth,nineMnth){
        $scope.monthBtn['3m']= threeMnth;
        $scope.monthBtn['6m']= sixMnth;
        $scope.monthBtn['9m']= nineMnth;
        defaultLoad();
    }

    // Filter Click event
    $scope.filterClicked= function(){
        
        // model window
        var modalInstance = $uibModal.open({
            templateUrl: 'views/fixedLine/modelFilterTransactionDetails.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            
            //Usage Dropdown
            $scope.filter= {};

            $scope.filter.usageOperator= '>';
            $scope.filter.usageUnit= 'Bytes';
            $scope.usageOperator= [{'operator': '>'}, {'operator': '<'}, {'operator': '='}]
            $scope.usageUnit= [{'unit': 'Bytes'}, {'unit': 'KB'}, {'unit': 'MB'}, {'unit': 'GB'}]
            
            $scope.filter.tpOperator= '<';
            $scope.filter.tpUnit= 'bps';
            $scope.tpOperator= [{'operator': '>'}, {'operator': '<'}]
            $scope.tpUnit= [{'unit': 'bps'}, {'unit': 'Kbps'}, {'unit': 'Mbps'}, {'unit': 'Gbps'}]
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
            
            //save filter options
            $scope.saveFilterOption= function(filter){
                var usageOperator, usageUnit, tpOperator, tpUnit;
                $uibModalInstance.close();
                console.log("filter", filter);
                
                usageUnit= filter.usageUnit;
                usageOperator= filter.usageOperator;
                
                tpUnit= filter.tpUnit;
                tpOperator= filter.tpOperator;
                
                function getOperator(operator){
                    switch(operator){
                        case '<':
                            usageValue= usageValue+"&usageop=LT";
                            break;
                        
                        case '>':
                            usageValue= usageValue+"&usageop=GT";
                            break;
                        
                        case '=':
                            usageValue= usageValue+"&usageop=EQ";
                            break;
                    }
                }
                
                function getTpOperator(operator){
                    switch(operator){
                        case '<':
                            tpValue= tpValue+"&tpop=LT";
                            break;
                        
                        case '>':
                            tpValue= tpValue+"&tpop=GT";
                            break;
                        
                    }
                }
                
                
                if(angular.isDefined(filter.usage)){
                    
                    usageValue= filter.usage;
                    
                    switch(usageUnit){
                        case 'Bytes':
                            break;
                        
                        case 'KB':
                            usageValue= 1024*usageValue;
                            break;
                          
                        case 'MB':
                            usageValue= 1024*1024*usageValue;
                            break;
                        
                        case 'GB':
                            usageValue= 1024*1024*1024*usageValue;
                            break;
                        }
                    
                    getOperator(usageOperator);
                }

                if(angular.isDefined(filter.tp)){
                    
                    tpValue= filter.tp;
                    
                    switch(tpUnit){
                        case 'bps':
                            break;
                        
                        case 'Kbps':
                            tpValue= 1000*tpValue;
                            break;
                          
                        case 'Mbps':
                            tpValue= 1000*1000*tpValue;
                            break;
                        
                        case 'Gbps':
                            tpValue= 1000*1000*1000*tpValue;
                            break;
                        }
                    
                    getTpOperator(tpOperator);
                }
              
                
                
                if(angular.isDefined(filter.protocol) || angular.isDefined(filter.usage)|| angular.isDefined(filter.tp)|| angular.isDefined(filter.app)|| angular.isDefined(filter.url)){
                    
                    $rootScope.filter.protocol= filter.protocol;
                    $rootScope.filter.usage= filter.usage;
                    $rootScope.filter.tp= filter.tp;
                    $rootScope.filter.app= filter.app;
                    $rootScope.filter.url= filter.url;
                    $rootScope.filter.usageUnit= filter.usageUnit;
                    $rootScope.filter.usageOperator= filter.usageOperator;
                    $rootScope.filter.tpUnit= filter.tpUnit;
                    $rootScope.filter.tpOperator= filter.tpOperator;

                    transactionDetailsMakeURL();
                }
            }
        }
    }
    
    // CEI Click event
    $scope.ceiClicked= function(hour, status, customerIP,splitter, date, olt){
        // model window
        var modalInstance = $uibModal.open({
            templateUrl: 'views/fixedLine/modelSubsCEIDetails.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            $scope.showindicatorDiv= false;
            // $scope.ceiDetailsBtn= {
            //     'SubsTp': true,
            //     'SubsApp': false,
            //     'OLTTp': false
            // }
            $scope.ceiDetailsBtn= {
                'SpltrUsage': true,
                'OLTTp': false,
                'OLTAppTp': false
            }
            var activeBtn= 'SpltrUsage';

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            //CEI Details click event
            $scope.ceiDetails= function(SpltrUsage,OLTTp, OLTAppTp){
                // $scope.ceiDetailsBtn['SubsTp']= SubsTp;
                // $scope.ceiDetailsBtn['SubsApp']= SubsApp;
                $scope.ceiDetailsBtn['SpltrUsage']= SpltrUsage;
                $scope.ceiDetailsBtn['OLTTp']= OLTTp;
                $scope.ceiDetailsBtn['OLTAppTp']= OLTAppTp;

                if(OLTAppTp){
                    activeBtn= 'OLTAppTp';
                    onLoad(); 
                }/*
                else if(SubsApp){
                    activeBtn= 'SubsApp';
                    onLoad(); 
                }*/
                else if(SpltrUsage){
                    activeBtn= 'SpltrUsage';
                    onLoad(); 
                }
                else{
                    activeBtn= 'OLTTp';
                    onLoad(); 
                }
            }
            
            function throughputDetails(url){
                $scope.showindicatorDiv= false;
                $scope.loadingThroughputDiv= true;
                $scope.noDataThroughputDiv= false;
                $scope.exportSubscriberThroughput= [];
                var throughputData= [],throughputDataOLT= [], unformatedThroughputArray= [], formatedThroughputArray= [];
                
                /*httpService.get(url).then(function (response) {
                    var objArray= response.data;
                    if(objArray.length>0){
                        var exportTpmDetail= angular.copy(objArray);
                        $scope.loadingThroughputDiv= true;
                        $scope.dataThroughputDiv= false;
                        $scope.noDataThroughputDiv= false;
                        //console.log("objArray", objArray);
                        for(var i=0;i<objArray.length; i++){
                            if(objArray[i].hasOwnProperty('Throughput')){
                                unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                                exportTpmDetail[i]['Throughput(bps)']= exportTpmDetail[i]['Throughput'];
                                delete exportTpmDetail[i]['Throughput']
                            }
                        } 
                        // console.log("unformatedThroughputArray", unformatedThroughputArray);
                        
                        formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                        
                        var index= -1;
                        for(var i=0;i<objArray.length; i++){
                            if(objArray[i].hasOwnProperty('Throughput')){
                                throughputData.push([objArray[i].Time,parseFloat(formatedThroughputArray[0][++index])]);
                            }
                        }
                        //console.log('throughputData', throughputData);
                        var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                        optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                        optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                        
                        $scope.throughputChartConfig= {
                             "options" : optionsThroughputBar,
                            "series": [{name: "Throughput",
                                        color:"rgb(39, 174, 96)",
                                       data: throughputData
                                       },
                                      ]
                        }
                        
                        $scope.exportTpmDetail= angular.copy(exportTpmDetail);
                        $scope.loadingThroughputDiv= false;
                        $scope.noDataThroughputDiv= false;
                        
                    }else{
                        $scope.loadingThroughputDiv= false;
                        $scope.noDataThroughputDiv= true;
                    }
                })*/
                if($scope.ceiDetailsBtn.SpltrUsage){
                    httpService.get(url).then(function(response){
                        var segmenUsageArray= [], segmenUsageData= [];
                        var objArray= response.data;
                        
                        $scope.exportUsgSubData= [];
                        var exportUserVsUsage= angular.copy(objArray);
                        //console.log("response", objArray);
                        if(objArray.length>0){
                            
                            var usageData= [], usersData= [], timeArray= [], usageDataArray= [], sessionData= [];
                            for(var i=0; i<objArray.length;i++){
                                usageDataArray[i]=  objArray[i].Usage;
                                exportUserVsUsage[i]['Usage(Bytes)']= exportUserVsUsage[i].Usage;
                                delete exportUserVsUsage[i]['Usage'];
                            }
                            var FormattedusageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 1)
                            //console.log("ksnsk", vpsFormattedUsageArray );
                            var xaxisArray= [], tickArray= [];
                            
                            
                            
                            for(var i=0; i<objArray.length;i++){
                                timeArray[i]= objArray[i].Time;
                                usageData[i]= parseFloat(FormattedusageDataArray[0][i]);
                                usersData[i]= parseFloat(objArray[i].Subscribers);
                                
                            }

                            var maxSubVal= Math.max.apply(null, usersData); 
                            var minSubVal= Math.min.apply(null, usersData);
                            
                            //console.log("durationData", durationData);
                            //console.log("usageData", usageData);
                            var usageVsUsersChartOptions;
                            
                                usageVsUsersChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
                                $scope.throughputChartConfig= {
                                    options: usageVsUsersChartOptions,
                                    series: [{
                                        name: 'Usage',
                                        type: 'column',
                                        yAxis: 1,
                                        "color": "#1abc9c",
                                        data: usageData,
                                        tooltip: {
                                            pointFormat: '{series.name} : <b>{point.y:,.2f}</b>',"xDateFormat": "%I:%M %p", 
                                            // valueSuffix: ' '+FormattedusageDataArray[1]
                                        }

                                    }, {
                                        name: 'Subscribers',
                                        type: 'spline',
                                        color: "#3D8EB9",
                                        data:  usersData,
                                        tooltip: {
                                            pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%I:%M %p", 
                                            // valueSuffix: ' '+FormattedusageDataArray[1]
                                        }
                                    }]
                                };
                            
                            
                            usageVsUsersChartOptions.xAxis.categories= timeArray;
                            usageVsUsersChartOptions.xAxis.labels.format= "{value:%I:%M %p}";
                            
                            var d= maxSubVal- minSubVal;
                            if(d<5){
                                usageVsUsersChartOptions.yAxis[0].max= minSubVal+5;
                                usageVsUsersChartOptions.yAxis[0].min= minSubVal;
                            }
                            usageVsUsersChartOptions.yAxis[0].title.text= 'Subscribers';
                            usageVsUsersChartOptions.yAxis[1].title.text= 'Usage('+FormattedusageDataArray[1]+")";
                            $scope.exportUsgSubData= angular.copy(exportUserVsUsage);

                            $scope.loadingThroughputDiv= false;
                            $scope.noDataThroughputDiv= false;
                        }else{
                            $scope.loadingThroughputDiv= false;
                            $scope.noDataThroughputDiv= true;
                        }
                    })
                }
                else if($scope.ceiDetailsBtn.OLTAppTp){
                    httpService.get(url).then(function(response){
            
                        var OLTWiseTpFormatArray= [], OLTWiseLabelArray= [], OLTWiseTpData= [];
                        var objArray= response.data;
                        if(objArray.length>0){
                           
                            var paramObject= {};
                            paramObject.objArray= objArray;
                            paramObject.label= "Date";
                            paramObject.data= "Throughput";
                            paramObject.seriesName= 'App';
                            paramObject.seriesdata= "data";
                            paramObject.flag= "xAxis";
                            paramObject.unit= "Mbps";

                            // console.log("paramObject", paramObject);
                            
                            var OLTDistributionUsageChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                            OLTDistributionUsageChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                            OLTDistributionUsageChartOptions.xAxis.labels.format= "{value:%I:%M %p}";
                            OLTDistributionUsageChartOptions.chart.height= 400;
                            OLTDistributionUsageChartOptions.yAxis.title= {"text":"Throughput (Mbps)"};
                            
                            paramObject.flag= "series";
                            paramObject.objArray= objArray;
                            $scope.throughputChartConfig= {
                                options: OLTDistributionUsageChartOptions,
                                series: highchartProcessData.multilineProcessHighchartData(paramObject)
                            }

                            $scope.loadingThroughputDiv= false;
                            $scope.noDataThroughputDiv= false;
                        }else{
                            $scope.loadingThroughputDiv= false;
                            $scope.noDataThroughputDiv= true;
                        }

                    })
                }
                else{
                    httpService.get(url).then(function (response) {
                        var objArray= response.data;
                        if(objArray.length>0){
                            var exportTpmDetail= angular.copy(objArray);
                            $scope.loadingThroughputDiv= true;
                            $scope.dataThroughputDiv= false;
                            $scope.noDataThroughputDiv= false;
                            //console.log("objArray", objArray);
                            for(var i=0;i<objArray.length; i++){
                                if(objArray[i].hasOwnProperty('Throughput')){
                                    unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                                    exportTpmDetail[i]['Throughput(bps)']= exportTpmDetail[i]['Throughput'];
                                    delete exportTpmDetail[i]['Throughput']
                                }
                            } 
                            // console.log("unformatedThroughputArray", unformatedThroughputArray);
                            
                            formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                            
                            var index= -1;
                            for(var i=0;i<objArray.length; i++){
                                if(objArray[i].hasOwnProperty('Throughput')){
                                    throughputDataOLT.push([objArray[i].Time,parseFloat(formatedThroughputArray[0][++index])]);
                                }
                            }
                            //console.log('throughputData', throughputData);
                            var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                            optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                            optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                            
                            $scope.throughputChartConfig= {
                                "options" : optionsThroughputBar,
                                "series": [{name: "Throughput",
                                            color:"rgb(39, 174, 96)",
                                           data: throughputDataOLT
                                           }
                                          ]
                            }
                            
                            //throughput indicator
                            httpService.get(globalConfig.pulldataurlbyname+"PeakThroughput for selected OLT and Hour&OLT="+olt+"&fromDate="+date+"&Hour="+hour).then(function (response) {
                                var todayData= response.data[0].PeakThroughput;

                                var datems= $filter('date')(date);
                                var yesterdayTime= $filter('date')( new Date(date).getTime()- 7*24*3600*1000 , "yyyy-MM-dd");
                                httpService.get(globalConfig.pulldataurlbyname+"PeakThroughput for selected OLT and Hour&OLT="+olt+"&fromDate="+yesterdayTime+"&Hour="+hour).then(function (response) {
                                    var yesterdayData= response.data[0].PeakThroughput
                                    $scope.showindicatorDiv= true;
                                    var tpdiff= todayData- yesterdayData;

                                    if(tpdiff > 0){
                                        $scope.textColor= "primary"; 
                                        $scope.indicatorStatus= "up";
                                    }else if(tpdiff < 0){
                                        $scope.textColor= "danger";
                                        $scope.indicatorStatus= "down";
                                    }else{
                                        showIndicatorDiv= false;
                                    }

                                    $scope.comparedVal= ((Math.abs(tpdiff)/todayData)*100).toFixed(0);
                                    
                                })
                            })

                            // $scope.exportTpmDetail= angular.copy(exportTpmDetail);
                            $scope.loadingThroughputDiv= false;
                            $scope.noDataThroughputDiv= false;
                            
                        }else{
                            $scope.loadingThroughputDiv= false;
                            $scope.noDataThroughputDiv= true;
                        }
                    })
                }
            }

            function onLoad(){

                switch(activeBtn){
                    case 'SubsTp':
                        var SubsTpURL= globalConfig.pulldataurlbyname+"Customer selected hour tpm&userid="+customerIP+"&fromDate="+date+"&Hour="+hour;
                        var OLTTpURL= globalConfig.pulldataurlbyname+"Minute wise throughput and hourly usage cei for selected OLT and hour&OLT="+olt+"&Hour="+hour+"&fromDate="+date;
                        throughputDetails(SubsTpURL, OLTTpURL);
                        break;

                    case 'SpltrUsage':
                        if(hour < 10)
                            var SpltrUsageURL= globalConfig.pulldataurlbyname+"Splitter wise usage and subscribers for selected&Splitter="+splitter+"&fromDate="+date+"&Hour=0"+hour;
                        else
                            var SpltrUsageURL= globalConfig.pulldataurlbyname+"Splitter wise usage and subscribers for selected&Splitter="+splitter+"&fromDate="+date+"&Hour="+hour;
                        //var OLTTpURL= globalConfig.pulldataurlbyname+"Minute wise throughput and hourly usage cei for selected OLT and hour&OLT="+olt+"&Hour="+hour+"&fromDate="+date;
                        throughputDetails(SpltrUsageURL);
                        break;

                    case 'SubsApp':
                        var SubsAppURL= globalConfig.pulldataurlbyname+"Customer app wise throughput with hourly usage cei for selected hour&userid="+customerIP+"&fromDate="+date+"&Hour="+hour;
                        throughputDetails(SubsAppURL);
                        break;

                    case 'OLTTp':
                        var OLTTpURL= globalConfig.pulldataurlbyname+"Minute wise throughput and hourly usage cei for selected OLT and hour&OLT="+olt+"&Hour="+hour+"&fromDate="+date;
                        throughputDetails( OLTTpURL);
                        break;

                    case 'OLTAppTp':
                        var OLTAppTpURL= globalConfig.pulldataurlbyname+"OLT app wise throughput with hourly usage cei for selected hour&OLT="+olt+"&Hour="+hour+"&fromDate="+date;
                        throughputDetails( OLTAppTpURL);
                        break;

                }
            }

            onLoad(); 
        }
    }
    
    // Tab Selected click event
    $scope.tabSelected= function(tab){
        $scope.infoLine= false;
        $scope.currentTab= tab;
        defaultLoad();
    }
    
    //Submit Users Daterange
    $scope.submitUsersDateRange= function(){

        defaultLoad();
    }

    //Submit.customer.ip click event
    $scope.submit= function(){
        $scope.infoLine= false;
        $scope.showUserDetails=true;
        defaultLoad();
    }
}


// End BB Customer Details Controller
//--------------------------------------------------------------------------

//BB Plan/App/Segment/Protocal/OLT Analytics (rdirect from dashboard) Ctrl
function planAnalyticsRedirectBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,  highchartProcessData, highchartOptions, $stateParams, utility){

    //track url starts
    utility.trackUrl();
    //end track url

    // console.log(" $stateParams",  $stateParams);
    var page= $stateParams.params.Key;
    var value= $stateParams.params.value;
    $scope.select= {};
    $scope.select.app= $stateParams.params.value;
    $scope.pageTitle= $stateParams.params.title;
    $scope.page= page;

    var dropdownListURL= globalConfig.pulldataurlbyname+page+" Filter";
    httpService.get(dropdownListURL).then(function(response){
        var objArray= response.data;
        var appListArray= [];
        if(objArray.length>0){
            for(var i in objArray){
                appListArray[i]= objArray[i][page];
            }
            $scope.appList= angular.copy(appListArray);
        }else{
            $scope.appList= [];
        }
    })

    function getDetails(url, key){
        $scope.loadingDiv= true;
        $scope.noDataDiv= false;
        $scope.UsageVsUsersChartConfig= {};
        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            if(objArray.length>0){
                var usageData= [], usersData= [], timeArray= [], usageDataArray= [], sessionData= [];
                for(var i=0; i<objArray.length;i++){
                    if(objArray[i].hasOwnProperty("Usage"))
                        usageDataArray[i]=  objArray[i].Usage;
                    else
                        usageDataArray[i]= 0;
                }
                console.log("Usage", usageDataArray);
                var FormattedusageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 3)
                var xaxisArray= [], tickArray= [];
                
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Hour;
                    usageData[i]= parseFloat(FormattedusageDataArray[0][i]);
                    if(page=='App')
                        if(objArray[i].hasOwnProperty("Sessions")){
                            usersData[i]= parseFloat(objArray[i].Sessions);
                        }else{
                            usersData[i]= 0;
                        }
                    if(page=='Plan' || page=='Node' || page=='Segment'|| page=='Area')
                        if(objArray[i].hasOwnProperty("Subscribers")){
                            usersData[i]= parseFloat(objArray[i].Subscribers);
                        }else{
                            usersData[i]= 0;
                        }
                }
                var maxSubVal= Math.max.apply(null, usersData); 
                var minSubVal= Math.min.apply(null, usersData);

                var usageVsUsersChartOptions;

                usageVsUsersChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelCategoriesOptions);
                if(page=='Protocol'){
                    $scope.UsageVsUsersChartConfig= {
                        options: usageVsUsersChartOptions,
                        series: [{
                            name: 'Usage',
                            type: 'column',
                            yAxis: 1,
                            "color": "#1abc9c",
                            data: usageData,
                            tooltip: {
                                pointFormat: '{series.name} : <b>{point.y:,.2f}</b>',"xDateFormat": "%e %b", 
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }
                        }]
                    };
                    usageVsUsersChartOptions.yAxis[0].title.text= [];
                }
                else{
                    $scope.UsageVsUsersChartConfig= {
                        options: usageVsUsersChartOptions,
                        series: [{
                            name: 'Usage',
                            type: 'column',
                            yAxis: 1,
                            "color": "#1abc9c",
                            data: usageData,
                            tooltip: {
                                pointFormat: '{series.name} : <b>{point.y:,.2f}</b>',"xDateFormat": "%e %b", 
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }

                        }, {
                            name: key,
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  usersData,
                            tooltip: {
                                pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%e %b", 
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }
                        }]
                    };
                    usageVsUsersChartOptions.yAxis[0].title.text= key;
                }
                
                usageVsUsersChartOptions.xAxis.categories= timeArray;
                var d= maxSubVal- minSubVal;
                if(d<5){
                    usageVsUsersChartOptions.yAxis[0].max= minSubVal+5;
                    usageVsUsersChartOptions.yAxis[0].min= minSubVal;
                }

                usageVsUsersChartOptions.yAxis[1].title.text= 'Usage('+FormattedusageDataArray[1]+")";
                
                $scope.loadingDiv= false;
                $scope.noDataDiv= false;
                    
            }else{
                $scope.loadingDiv= false;
                $scope.noDataDiv= true;
            }
        });
    }

    function defaultLoad(){
        $scope.appSelected= $scope.select.app;
        switch(page){
            case 'App':
                var appDetailsURL= globalConfig.pullfilterdataurlbyname+page+' wise hourly Sessions Usage&'+page+"="+$scope.select.app;
                getDetails(appDetailsURL, "Sessions");
            break;

            case 'Plan':
                var planDetailsURL= globalConfig.pullfilterdataurlbyname+page+' wise hourly Users Usage&'+page+"="+$scope.select.app;
                getDetails(planDetailsURL, "Subscribers");
            break;

            case 'Segment':
                var segmentDetailsURL= globalConfig.pullfilterdataurlbyname+page+' wise hourly Users Usage&'+page+"="+$scope.select.app;
                getDetails(segmentDetailsURL, "Subscribers");
            break;

            case 'Node':
                var OLTDetailsURL= globalConfig.pullfilterdataurlbyname+page+' wise hourly Users Usage&'+page+"="+$scope.select.app;
                getDetails(OLTDetailsURL, "Subscribers");
            break;

            case 'Protocol':
                var protocolDetailsURL= globalConfig.pullfilterdataurlbyname+page+' wise hourly Usage&'+page+"="+$scope.select.app;
                getDetails(protocolDetailsURL, "");
            break;
            case 'Area':
                var areaDetailsURL= globalConfig.pullfilterdataurlbyname+page+' wise hourly Usage&'+page+"="+$scope.select.app;
                getDetails(areaDetailsURL, "Subscribers");
            break;
        }

        
    }
    defaultLoad();

    //drodown select value event
    $scope.selectValue= function(){
        defaultLoad();
    }
    
    // return to current location
    $scope.stateGo= function(){
        $location.path($stateParams.params.returnPath);
    }
}

//BB Speed Test/ ISP Analytics (rdirect from report speed test user and competation threat) Ctrl
function churnRedirectionBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,  highchartProcessData, highchartOptions, $stateParams, utility){

    //track url starts
    utility.trackUrl();
    //end track url

    console.log(" $stateParams",  $stateParams);
    var page= $stateParams.params.Key;
    var value= $stateParams.params.value;
    $scope.user= $stateParams.params.value;
    $scope.pageTitle= $stateParams.params.title;
    $scope.accessedDate= $stateParams.params.fromDate;
    var fromDate= new Date($stateParams.params.fromDate)- 15*24*3600*1000;
    $scope.fromDate= $filter('date')(fromDate, 'yyyy-MM-dd');
    console.log("$scope.fromDate", $scope.fromDate);
    $scope.page= page;
    $scope.status= ''
    if(/Speed Test/.test($stateParams.params.title)){
        $scope.status= 'Speed Test';
        $scope.stmtName= "Speed Test";
    }
    else{
        $scope.stmtName= "Competition Threat";
        $scope.status= 'ISP';
    }
    
    function getDetails(url){
        $scope.loadingDiv= true;
        $scope.noDataDiv= false;
        $scope.UsageVsUsersChartConfig= {};

        httpService.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){
                var usersData= [], timeArray= [];
                
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Hour;
                   
                    usersData[i]= parseFloat(objArray[i].Accessed);
                    
                }
                var usageVsUsersChartOptions;

                usageVsUsersChartOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                
                $scope.UsageVsUsersChartConfig= {
                    options: usageVsUsersChartOptions,
                    series: [{
                        name: 'Hourly Accessed',
                        type: 'column',
                        "color": "#1abc9c",
                        data: usersData
                        
                    }]
                };
                
                usageVsUsersChartOptions.xAxis.categories= timeArray;
                usageVsUsersChartOptions.chart.height= 300;
                $scope.loadingDiv= false;
                $scope.noDataDiv= false;
                    
            }else{
                $scope.loadingDiv= false;
                $scope.noDataDiv= true;
            }
        });
    }

    function getUsageWeeklyDetails(url){
        $scope.loadingUsageWeeklyDiv= true;
        $scope.noDataUsageWeeklyDiv= false;
        $scope.usageWeeklyChartConfig= {};

        httpService.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){

                var usageData= [], timeArray= [];
                
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Date;
                   
                    usageData[i]= objArray[i].Usage;
                    
                }
                var formattedUsageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageData, 3);

                var regressionData= [[0, formattedUsageDataArray[0][0]],[(timeArray.length-1), formattedUsageDataArray[0][formattedUsageDataArray[0].length-1]]];
                
                var usageWeeklyChartOptions;
                usageWeeklyChartOptions= angular.copy(highchartOptions.highchartAreaLabelDatetimeOptions);
                
                $scope.usageWeeklyChartConfig= {
                    options: usageWeeklyChartOptions,
                    series: [{
                        type: 'line',
                        name: 'Trend',
                        dashStyle: 'Dash',
                        data: regressionData,
                        marker: {
                            enabled: false
                        },
                        states: {
                            hover: {
                                lineWidth: 0
                            }
                        },
                        enableMouseTracking: false
                    },{
                        type: 'spline',
                        name: 'Usage Lsat 15 Days',
                        "color": "#1abc9c",
                        data: formattedUsageDataArray[0],
                        tooltip: {
                                valueSuffix: ' '+formattedUsageDataArray[1]
                            }
                        
                    }]
                };
                
                usageWeeklyChartOptions.xAxis.categories= timeArray;
                usageWeeklyChartOptions.yAxis.title= {'text': formattedUsageDataArray[1]};
                usageWeeklyChartOptions.chart.height= 300;
                $scope.loadingUsageWeeklyDiv= false;
                $scope.noDataUsageWeeklyDiv= false;
                    
            }else{
                $scope.loadingUsageWeeklyDiv= false;
                $scope.noDataUsageWeeklyDiv= true;
            }
        });
    }

    function defaultLoad(){
        var appDetailsURL= globalConfig.pullfilterdataurlbyname+'Customer Hourly '+$scope.status+' Access&'+page+"="+$scope.user+"&fromDate="+$stateParams.params.fromDate+"T00:00:00.000Z";
        getDetails(appDetailsURL);

        var usageWeeklyDetailsURL= globalConfig.pullfilterdataurlbyname+$scope.stmtName+' User Usage&'+"userid="+$scope.user+"&fromDate="+$scope.fromDate+"T00:00:00.000Z"+"&toDate="+$stateParams.params.fromDate+"T23:59:59.999Z";
        getUsageWeeklyDetails(usageWeeklyDetailsURL);

    }
    defaultLoad();

    // return to current location
    $scope.stateGo= function(){
        $location.path($stateParams.params.returnPath);
    }
}

//BB Protocol Throughput Minute wise (added to report) Ctrl
function protocolThroughputBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,  highchartProcessData, highchartOptions, $stateParams, utility){
    
    //track url starts
    utility.trackUrl();
    //end track url

    $scope.select= {};
    
    var dropdownListURL= globalConfig.pulldataurlbyname+"Protocol Filter";
    httpService.get(dropdownListURL).then(function(response){
        var objArray= response.data;
        var appListArray= [];
        if(objArray.length>0){
            for(var i in objArray){
                appListArray[i]= objArray[i]['Protocol'];
            }
            $scope.protocolList= angular.copy(appListArray);
            $scope.select.protocol= angular.copy(appListArray[0]);
            defaultLoad();
        }else{
            $scope.appList= [];
            defaultLoad();
        }
    })

    function getThroughputDistribution(url){
        $scope.loadingDiv= true;
        $scope.noDataDiv= false;
        $scope.exportProtocolThroughput= [];
        var throughputData= [], unformatedThroughputArray= [], formatedThroughputArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            if(objArray.length>0){
                $scope.exportProtocolThroughput= angular.copy(objArray);
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                    }
                } 
                // console.log("unformatedThroughputArray", unformatedThroughputArray);
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                
                var index= -1;
                for(var i=0;i<objArray.length; i++){
                     if(objArray[i].hasOwnProperty('Throughput')){
                         throughputData.push([objArray[i].Time,parseFloat(formatedThroughputArray[0][++index])]);
                     }
                }
                //console.log('throughputData', throughputData);
                var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                
                $scope.protocolThroughputChartConfig= {
                     "options" : optionsThroughputBar,
                    "series": [{name: "Throughput",
                                color:"rgb(39, 174, 96)",
                               data: throughputData
                               },
                              ]
                }
                
                $scope.loadingDiv= false;
                $scope.noDataDiv= false;
                
            }else{
                $scope.loadingDiv= false;
                $scope.noDataDiv= true;
            }
        })
    }

    function defaultLoad(){
        $scope.sDate= $scope.dateSelect;
        var protocolThroughputURL= globalConfig.pullfilterdataurlbyname+'Protocol minute wise Throughput for 1 Day&toDate='+$scope.dateSelect+"T00:00:00.000Z&Protocol="+$scope.select.protocol;
        getThroughputDistribution(protocolThroughputURL);
    }
    

    //drodown select value event
    $scope.selectValue= function(){
        defaultLoad();
    }
    
    // return to current location
    $scope.submit= function(){
        defaultLoad();
    }
}


//--------------------------------------------------------------------------------
// Plan/App/ App Segment/ Segment Analytics Controller

function planAnalyticsBBCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams,utility, dbService,$state,$http) {

    //track url starts
    utility.trackUrl();
    //end track url 

    // console.log('angular.isDefined($stateParams.params)', $stateParams);
    if(angular.isDefined($stateParams.params)){

    }
    // console.log("response.data.name", $scope.headerName);
    $scope.OLTorDSLAM= globalConfig.OLTorDSLAM;
    
    $scope.showTabObj= {};
    var currentPage= $scope.headerName
    if(currentPage== 'Plan Analytics'){
        currentPage= 'Plan';
        $scope.showTabObj= angular.copy(utility.tb.planAnalytics)
        
    }
    else if(currentPage== 'App Analytics'){
        currentPage= 'App';
        $scope.showTabObj= angular.copy(utility.tb.appAnalytics)
        
    }
    else{ 
        currentPage= 'OLT';
        $scope.showTabObj= angular.copy(utility.tb.oltAnalytics)
        
    }

    function getCurrentTab(){
        if($scope.showTabObj.UsageVsUsers){
            $scope.currentTab= 'UsageVsUsers';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.OLTorPlanwiseDistribution){
            $scope.currentTab= 'OLTDistribution';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.SegmentwiseDistribution){
            $scope.currentTab= 'segmentWiseDistribution';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.ApporPlanwiseDistribution){
            $scope.currentTab= 'AppDistribution';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.LatencyDistribution){
            $scope.currentTab= 'Latency';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.CEI){
            $scope.currentTab= 'CEI';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.Throughput){
            $scope.currentTab= 'Throughput';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.OLTUtilization){
            $scope.currentTab= 'OLTUtilization';
            return $scope.currentTab;
        }
        
        else if($scope.showTabObj.CityDistribution){
            $scope.currentTab= 'CityDistribution';
            return $scope.currentTab;
        }
        
        else if($scope.showTabObj.AreaDistribution){
            $scope.currentTab= 'AreaDistribution';
            return $scope.currentTab;
        }
        
        else if($scope.showTabObj.CountryDistribution){
            $scope.currentTab= 'CountryDistribution';
            return $scope.currentTab;
        } 
        else if($scope.showTabObj['Cached/Uncached']){
            $scope.currentTab= 'Cached/Uncached';
            return $scope.currentTab;
        }
    }
    // -------------------------------------------------------------------------------------

    //Filter Section
     
    // plan filter
    $scope.select= { };
    var keyPlan;
    if($stateParams.params != null){
        keyPlan= $stateParams.params.Key;
    }
    //console.log("keyPlan", keyPlan);
    //console.log("currentPage", currentPage);

    //for redirection option
    if(currentPage== "Plan" ){
        if(keyPlan == 'Plan'){
            // $scope.date.start= $stateParams.params.fromDate;;
            // $scope.date.end= $stateParams.params.toDate;
            $scope.select.plan= $stateParams.params.value;
        }
        
    }else if(currentPage== "OLT"){
        if(keyPlan == 'OLT'){
            // $scope.date.start= $stateParams.params.fromDate;;
            // $scope.date.end= $stateParams.params.toDate;
            $scope.select.plan= $stateParams.params.value;
        }
        
    }else{
        if(keyPlan == 'App')
            // $scope.date.start= $stateParams.params.fromDate;;
            // $scope.date.end= $stateParams.params.toDate;
            $scope.select.plan= $stateParams.params.value;
       
    }
    //end redirection option
    
    $scope.currentPage= currentPage;
    var planListURL= null;
    if (currentPage=='OLT') 
        planListURL= globalConfig.pulldataurlbyname+"Node Filter";
    else
        planListURL= globalConfig.pulldataurlbyname+currentPage+" Filter";
    var planIDListArr= [], planNameListArr=[], planListArray= [],maxSubscriberNodeListArr=[],capacityNodeListArr= [];
    $scope.loadOLTDeatils = {};

    function getPlanList(url){
        $scope.segmentHide= true;
        httpService.get(url).then(function(response){
           
            var objArray= response.data;
            //console.log("plan list", objArray);
            for(var i in objArray){
                /*if(currentPage== "Plan" ){
                    //planIDListArr[i]= objArray[i].PlanID
                    planIDListArr[i]= objArray[i][currentPage]
                    planNameListArr[i]= objArray[i][currentPage]
                }else */
                if(currentPage== "OLT" ){
                    //planIDListArr[i]= objArray[i].AppSegmentId
                    // planIDListArr[i]= objArray[i][currentPage]
                    // planNameListArr[i]= objArray[i][currentPage]

                    planListArray[i]= objArray[i]['Node'];

                    $scope.loadOLTDeatils[objArray[i]['Node']] = { 'capacity': objArray[i]['Capacity'], 'subscriber':objArray[i]['Maxsubscriber'] };

                  
                }else
                     planListArray[i]= objArray[i][currentPage];
                    //  console.log("page name ",objArray[i][currentPage])
                    //  console.log("Plan name on PLan page ", planListArray[i])
            }
           // $scope.select.plan= planListArray[0]
           var nodeCapacity,nodeMaxSubscriber;
            $scope.planNameList= angular.copy(planListArray);
            if(!angular.isDefined($scope.select.plan))
                $scope.select.plan= planListArray[0];
            else
                $scope.select.plan= $scope.select.plan;
            $scope.currentTab= getCurrentTab();
            defaultLoad();
            
        })
        
    }
    
    //End of Filter Section
    //--------------------------------------------------------------
    
    
    // $scope.currentTab= 'UsageVsUsers';
    var reverse= null, tab= null, currentPlanID;

    function UsageVsUsers(url){
        
        $scope.loadingUsageVsUsersDiv= true;
        $scope.DataUsageVsUsersDiv= false;
        $scope.noDataUsageVsUsersDiv= false;
        
        httpService.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            
            $scope.exportUsgSubData= [];
            var exportUserVsUsage= angular.copy(objArray);
            //console.log("response", objArray);
            if(objArray.length>0){
                var maxSubscriber,capacity;

                if(currentPage=="OLT"){
                    $scope.loadOLTDeatils
                    maxSubscriber=$scope.loadOLTDeatils[$scope.drdwnSelect].subscriber;
                    capacity = $scope.loadOLTDeatils[$scope.drdwnSelect].capacity;
                }

                var usageData= [], usersData= [], maxsubscriberDataArray= [], timeArray= [], usageDataArray= [], sessionData= [];
                for(var i=0; i<objArray.length;i++){
                    usageDataArray[i]=  objArray[i].Usage;
                    if(currentPage=="OLT"){
                        maxsubscriberDataArray[i]=maxSubscriber ;
                        }
                    
                    exportUserVsUsage[i]['Usage(Bytes)']= exportUserVsUsage[i].Usage;
                    delete exportUserVsUsage[i]['Usage'];
                }
                
                var FormattedusageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 1)
                // var FormattedcapacityDataArray= dataFormatter.convertFixUnitThroughputData(capacityDataArray, "Gbps")
                
                var xaxisArray= [], tickArray= [];
                
                
                
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Date;
                    usageData[i]= parseFloat(FormattedusageDataArray[0][i]);
                    usersData[i]= parseFloat(objArray[i].Subscribers);
                    /*if(currentPage=="App" || currentPage=="AppSegment")
                        usersData[i]= parseFloat(objArray[i].Sessions);
                    else
                        usersData[i]= parseFloat(objArray[i].Users);*/
                    if(angular.isDefined(objArray[i].Sessions)){
                        var duration= parseFloat(objArray[i].Sessions);
                        sessionData[i]= parseFloat(objArray[i].Sessions);
                    }
                }

                var maxSubVal= Math.max.apply(null, usersData); 
                var minSubVal= Math.min.apply(null, usersData);
                
                //console.log("durationData", durationData);
                //console.log("usageData", usageData);
                var usageVsUsersChartOptions;
                if(sessionData.length>0){
                    usageVsUsersChartOptions=  angular.copy(highchartOptions.highchart3YAxisLinePlusBarLabelDatetimeOptions);
                    
                    usageVsUsersChartOptions.yAxis[0].title.text= "Subscribers";

                    if(currentPage=="App" || currentPage=="OLT"){
                        usageVsUsersChartOptions.yAxis[2].title.text= "Sessions";
                    }
                    if(currentPage=="OLT"){
                        $scope.UsageVsUsersChartConfig= {
                            options: usageVsUsersChartOptions,
                            series: [ {
                                name: 'Usage',
                                type: 'column',
                                yAxis: 1,
                                "color": "#1abc9c",
                                // "color": "rgb(31, 158, 163)",
                                data: usageData,
                                tooltip: {
                                    pointFormat: '{series.name} : <b>{point.y:,.3f}</b>',"xDateFormat": "%e %b", 
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
    
                            },{
                                name: 'Sessions',
                                type: 'spline',
                                yAxis: 2,
                                color: "#f37a13",
                                // color: "rgb(124, 77, 255)",
                                data: sessionData,
                                tooltip: {
                                    pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%e %b", 
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            }, {
                                name: 'Subscribers',
                                type: 'spline',
                                color: "#0040ff",
                                // color: "#0000ff",
                                data:  usersData,
                                tooltip: {
                                    pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%e %b", 
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            },
                            {
                                name: 'MaxSubscriber',
                                type: 'spline',
                                yAxis: 3,
                                color: "#FA020D",
                                // color: "#0000ff",
                                data:   maxsubscriberDataArray,
                                tooltip: {
                                    pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%e %b", 
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            }                     
                          ]
                        };
                    }
                    else{
                        $scope.UsageVsUsersChartConfig= {
                            options: usageVsUsersChartOptions,
                            series: [ {
                                name: 'Usage',
                                type: 'column',
                                yAxis: 1,
                                "color": "#1abc9c",
                                // "color": "rgb(31, 158, 163)",
                                data: usageData,
                                tooltip: {
                                    pointFormat: '{series.name} : <b>{point.y:,.3f}</b>',"xDateFormat": "%e %b", 
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
    
                            },{
                                name: 'Sessions',
                                type: 'spline',
                                yAxis: 2,
                                color: "#f37a13",
                                // color: "rgb(124, 77, 255)",
                                data: sessionData,
                                tooltip: {
                                    pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%e %b", 
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            }, {
                                name: 'Subscribers',
                                type: 'spline',
                                color: "#0040ff",
                                // color: "#0000ff",
                                data:  usersData,
                                tooltip: {
                                    pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%e %b", 
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            }             
                          ]
                        };

                    }
                   
                    
                }else{
                    usageVsUsersChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
                    $scope.UsageVsUsersChartConfig= {
                        options: usageVsUsersChartOptions,
                        series: [{
                            name: 'Usage',
                            type: 'column',
                            yAxis: 1,
                            "color": "#1abc9c",
                            data: usageData,
                            tooltip: {
                                pointFormat: '{series.name} : <b>{point.y:,.3f}</b>',"xDateFormat": "%e %b", 
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }

                        }, {
                            name: 'Subscribers',
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  usersData,
                            tooltip: {
                                pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%e %b", 
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }
                        }]
                    };
                }
                
                usageVsUsersChartOptions.xAxis.categories= timeArray;
                
                var d= maxSubVal- minSubVal;
                if(d<5){
                   usageVsUsersChartOptions.yAxis[0].max= minSubVal+5;
                    usageVsUsersChartOptions.yAxis[0].min= minSubVal;
                    //  usageVsUsersChartOptions.yAxis[3].min= minSubVal;
                    
                    
                }
                usageVsUsersChartOptions.yAxis[0].title.text= 'Subscribers';
                usageVsUsersChartOptions.yAxis[1].title.text= 'Usage('+FormattedusageDataArray[1]+")";
                if(currentPage=="OLT"){
                    usageVsUsersChartOptions.yAxis[3].title.text= 'MaxSubscriber';
                }
                
                $scope.exportUsgSubData= angular.copy(exportUserVsUsage);

                $scope.loadingUsageVsUsersDiv= false;
                $scope.DataUsageVsUsersDiv= true;
                $scope.noDataUsageVsUsersDiv= false;
            }else{
                $scope.loadingUsageVsUsersDiv= false;
                $scope.DataUsageVsUsersDiv= false;
                $scope.noDataUsageVsUsersDiv= true;
            }
        })
    }
    
    function OLTSegmentDistribution(urlUsage, urlUsers, tab){
        var OLTDistributionUsageChartOptions= {};
        var OLTDistributionUsersChartOptions= {};
        $scope.loadingUsageDistributionDiv= true;
        $scope.DataUsageDistributionDiv= false;
        $scope.noDataUsageDistributionDiv= false;
        
        $scope.loadingUsersDistributionDiv= true;
        $scope.DataUsersDistributionDiv= false;
        $scope.noDataUsersDistributionDiv= false;

        $scope.usageDistributionChartConfig= null;
        $scope.usersDistributionChartOptions= null;

        if(urlUsage != null){
            httpService.get(urlUsage).then(function(response){
                    
                var OLTWiseUsageFormatArray= [], OLTWiseLabelArray= [], OLTWiseUsageData= [];
                var objArray= response.data;
                $scope.exportUsgDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportUsgDistArray= angular.copy(objArray);
                    for(var i=0; i<exportUsgDistArray.length;i++){
                        for(var j in exportUsgDistArray[i]['data']){
                            exportUsgDistArray[i]['data'][j]['Usage(Bytes)']= exportUsgDistArray[i]['data'][j]['Usage'];
                            delete exportUsgDistArray[i]['data'][j]['Usage'];
                        }
                    }
    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Usage";
                    paramObject.seriesName= tab;
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
                    
                    // console.log("paramObject", paramObject);
                    
                    var OLTDistributionUsageChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                    OLTDistributionUsageChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                    OLTDistributionUsageChartOptions.chart.height= 400;
                    OLTDistributionUsageChartOptions.yAxis.title= {"text":"Usage (GB)"};
                    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
                    $scope.usageDistributionChartConfig= {
                        options: OLTDistributionUsageChartOptions,
                        series: highchartProcessData.multilineProcessHighchartData(paramObject)
                    }
                    
                    $scope.exportUsgDistArray= angular.copy(exportUsgDistArray);
    
                    $scope.loadingUsageDistributionDiv= false;
                    $scope.DataUsageDistributionDiv= true;
                    $scope.noDataUsageDistributionDiv= false;
                }else{
                    $scope.loadingUsageDistributionDiv= false;
                    $scope.DataUsageDistributionDiv= false;
                    $scope.noDataUsageDistributionDiv= true;
                }
            })
        }
        
        if(urlUsers != null){
            httpService.get(urlUsers).then(function(response){
                    
                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
                    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Subscribers";
                    paramObject.seriesName= tab;
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
                    
                    // console.log("paramObject", paramObject);
                    
                    var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                    OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    OLTDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                    OLTDistributionUsersChartOptions.legend= {maxHeight: 60};
                    /*OLTDistributionUsersChartOptions.yAxis.stackLabels.formatter= function() {
                        return dataFormatter.formatUsageData(this.total, 2);
                    }*/
                    OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                    OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                    OLTDistributionUsersChartOptions.tooltip.shared= false;
                    OLTDistributionUsersChartOptions.chart.height= 400;
                    OLTDistributionUsersChartOptions.yAxis.title= {"text":"Subscribers"};
                    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
                    $scope.usersDistributionChartOptions= {
                        options: OLTDistributionUsersChartOptions,
                        series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                    }
                    
                    
                    $scope.exportSubDistArray= angular.copy(exportSubDistArray);
    
                    $scope.loadingUsersDistributionDiv= false;
                    $scope.DataUsersDistributionDiv= true;
                    $scope.noDataUsersDistributionDiv= false;
                }else{
                    $scope.loadingUsersDistributionDiv= false;
                    $scope.DataUsersDistributionDiv= false;
                    $scope.noDataUsersDistributionDiv= true;
                }
            })
        }
    }
    
    function CDNDistribution(url, tab, usageOrTp){
        if(usageOrTp =="Usage"){
            var OLTDistributionUsersChartOptions= {};
            $scope.loadingUsersDistributionDiv= true;
            $scope.DataUsersDistributionDiv= false;
            $scope.noDataUsersDistributionDiv= false;

            $scope.usersDistributionChartOptions= null;

            if( url != null){
                httpService.get(url).then(function(response){
                        
                    var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                    var objArray= response.data;
                    $scope.exportUsgDistArray= [];
                    var formatData = {};
                    var usageArray = [];
                    if(objArray.length>0){

                        var exportUsgDistArray= angular.copy(objArray);

                        
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Date";
                        paramObject.data= usageOrTp;//"Usage";
                        paramObject.seriesName= tab;
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
                        
                        var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                        OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                        OLTDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                        OLTDistributionUsersChartOptions.legend= {maxHeight: 60};
                        /*OLTDistributionUsersChartOptions.yAxis.stackLabels.formatter= function() {
                            return dataFormatter.formatUsageData(this.total, 2);
                        }*/
                        OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                        OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                        OLTDistributionUsersChartOptions.tooltip.shared= true;
                        OLTDistributionUsersChartOptions.chart.height= 400;
                        OLTDistributionUsersChartOptions.yAxis.title= {"text":"Usage( GB ) "};
                        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
                        $scope.usersDistributionChartOptions= {
                            options: OLTDistributionUsersChartOptions,
                            series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                        }
                        
                        $scope.exportUsgDistArray= angular.copy(exportUsgDistArray);
        
                        $scope.loadingUsersDistributionDiv= false;
                        $scope.DataUsersDistributionDiv= true;
                        $scope.noDataUsersDistributionDiv= false;
                    }else{
                        $scope.loadingUsersDistributionDiv= false;
                        $scope.DataUsersDistributionDiv= false;
                        $scope.noDataUsersDistributionDiv= true;
                    }
                })
            }
        }else if(usageOrTp =="Throughput"){
            var tpDistributionChartOptions= {};
            $scope.loadingTpDistributionDiv= true;
            $scope.DataTpDistributionDiv= false;
            $scope.noDataTpDistributionDiv= false;

            $scope.tpDistributionChartOptions= null;

            if( url != null){
                httpService.get(url).then(function(response){
                        
                    var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                    var objArray= response.data;
                    $scope.exportTpDistArray= [];
                    if(objArray.length>0){
                        //exportObjData
                        var exportTpDistArray= angular.copy(objArray);
                        
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Date";
                        paramObject.data= usageOrTp;//"Usage";
                        paramObject.seriesName= tab;
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
                        paramObject.unit= "Mbps";
                        
                        // console.log("paramObject", paramObject);
                        
                        var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                        OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                        OLTDistributionUsersChartOptions.xAxis.labels.format= "{value:%I:%M %p}";
                        OLTDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                        OLTDistributionUsersChartOptions.legend= {maxHeight: 60};
                        // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                        OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.2f} </b><br>';
                        // OLTDistributionUsersChartOptions.plotOptions.column.stacking= false;
                        OLTDistributionUsersChartOptions.tooltip.shared= true;
                        OLTDistributionUsersChartOptions.chart.height= 400;
                        OLTDistributionUsersChartOptions.yAxis.title= {"text":"Throughput( Mbps ) "};
                        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
                        $scope.tpDistributionChartOptions= {
                            options: OLTDistributionUsersChartOptions,
                            series: highchartProcessData.multilineProcessHighchartData(paramObject)
                        }
                        
                        
                        $scope.exportTpDistArray= angular.copy(exportTpDistArray);
        
                        $scope.loadingTpDistributionDiv= false;
                        $scope.DataTpDistributionDiv= true;
                        $scope.noDataTpDistributionDiv= false;
                    }else{
                        $scope.loadingTpDistributionDiv= false;
                        $scope.DataTpDistributionDiv= false;
                        $scope.noDataTpDistributionDiv= true;
                    }
                })
            }
        }else{
            var subsDistributionChartOptions= {};
            $scope.loadingsubsDistributionDiv= true;
            $scope.DatasubsDistributionDiv= false;
            $scope.noDatasubsDistributionDiv= false;

            $scope.subsDistributionChartOptions= null;

            if( url != null){
                httpService.get(url).then(function(response){
                        
                    var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                    var objArray= response.data;
                    $scope.exportsubsDistArray= [];
                    if(objArray.length>0){
                        //exportObjData
                        var exportsubsDistArray= angular.copy(objArray);
                        
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Date";
                        paramObject.data= usageOrTp;//"Usage";
                        paramObject.seriesName= tab;
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
                        // paramObject.unit= "Mbps";
                        
                        //  console.log("paramObject MMMMMMMMMMMMMMMMLLLLLLLLLLLL>>>>>>>>>>>>>  ", paramObject);
                        
                        var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                        OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                        OLTDistributionUsersChartOptions.xAxis.labels.format= "{value:%I:%M %p}";
                        OLTDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                        OLTDistributionUsersChartOptions.legend= {maxHeight: 60};
                        // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                        OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.y:.0f} </b><br>';
                        // OLTDistributionUsersChartOptions.plotOptions.column.stacking= false;
                        OLTDistributionUsersChartOptions.tooltip.shared= true;
                        OLTDistributionUsersChartOptions.chart.height= 400;
                        OLTDistributionUsersChartOptions.yAxis.title= {"text":"Subscribers"};
                        OLTDistributionUsersChartOptions.plotOptions= {
                                                    "line": {
                                                        "marker": {
                                                            "enabled": true
                                                        }
                                                    }
                                                };
                        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
                        $scope.subsDistributionChartOptions= {
                            options: OLTDistributionUsersChartOptions,
                            series: highchartProcessData.multilineProcessHighchartData(paramObject)
                        }
                        
                        $scope.exportsubsDistArray= angular.copy(exportsubsDistArray);
        
                        $scope.loadingsubsDistributionDiv= false;
                        $scope.DatasubsDistributionDiv= true;
                        $scope.noDatasubsDistributionDiv= false;
                    }else{
                        $scope.loadingsubsDistributionDiv= false;
                        $scope.DatasubsDistributionDiv= false;
                        $scope.noDatasubsDistributionDiv= true;
                    }
                })
            }
        }
    }
    
    function durationDistributionMultiline(urlDuration, tab){
        var OLTDistributionUsageChartOptions= {};
        $scope.loadingDurDistributionDiv= true;
        $scope.DataDurDistributionDiv= false;
        $scope.noDataDurDistributionDiv= false;
        
        $scope.durDistributionChartOptions= null;
        
        httpService.get(urlDuration).then(function(response){
            
            var OLTWiseUsageFormatArray= [], OLTWiseLabelArray= [], OLTWiseUsageData= [];
            var objArray= response.data;
            $scope.exportDurDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportUsgDistArray= angular.copy(objArray);
                for(var i=0; i<exportUsgDistArray.length;i++){
                    for(var j in exportUsgDistArray[i]['data']){
                        exportUsgDistArray[i]['data'][j]['Duration(Min)']= exportUsgDistArray[i]['data'][j]['Duration'];
                        delete exportUsgDistArray[i]['data'][j]['Duration'];
                    }
                }

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Duration";
                paramObject.seriesName= tab;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                // console.log("paramObject", paramObject);
                
                var OLTDistributionUsageChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                OLTDistributionUsageChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                OLTDistributionUsageChartOptions.chart.height= 400;
                OLTDistributionUsageChartOptions.yAxis.title= {"text":"Duration (Min)"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.durDistributionChartOptions= {
                    options: OLTDistributionUsageChartOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                
                $scope.exportDurDistArray= angular.copy(exportUsgDistArray);

                $scope.loadingDurDistributionDiv= false;
                $scope.DataDurDistributionDiv= true;
                $scope.noDataDurDistributionDiv= false;
            }else{
                $scope.loadingDurDistributionDiv= false;
                $scope.DataDurDistributionDiv= false;
                $scope.noDataDurDistributionDiv= true;
            }
        })
    }
    
    function appPlanUsageDistribution(url, tab){
        
        $scope.loadingAppPlanUsageDistributionDiv= true;
        $scope.DataAppPlanUsageDistributionDiv= false;
        $scope.noDataAppPlanUsageDistributionDiv= false;
        
        httpService.get(url).then(function(response){
            var AppUsageArray= [], AppUsageData= [];
            var objArray= response.data;
            $scope.exportUsgDistArray= [];
            console.log("response", objArray);
            if(objArray.length>0){
                //exportObjData
                var exportUsgDistArray= angular.copy(objArray);
                for(var i=0; i<exportUsgDistArray.length;i++){
                    exportUsgDistArray[i]['Usage(Bytes)']= exportUsgDistArray[i]['Usage'];
                    delete exportUsgDistArray[i]['Usage'];
                }

                var appWiseUsageFormatArray= [], appWiseLabelArray= [], appWiseUsageData= [];
            
                for(var i=0; i<objArray.length; i++){
                    appWiseUsageFormatArray[i]= objArray[i].Usage;    
                }

                var appWiseUsageFormattedArray= dataFormatter.convertFixUnitUsageDataWoUnit(appWiseUsageFormatArray, 3);
                //console.log("appUsageFormattedArray", appUsageFormattedArray);
                for(var i=0; i<objArray.length; i++){
                    appWiseLabelArray[i]= objArray[i][tab];
                    appWiseUsageData[i]= parseFloat(appWiseUsageFormattedArray[0][i]);
                }

                var appDistributionBarChartOptions= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);

                appDistributionBarChartOptions.xAxis.categories= angular.copy(appWiseLabelArray);

                appDistributionBarChartOptions.tooltip.pointFormat= 'Usage<b> {point.y:.2f} '+ appWiseUsageFormattedArray[1];

                appDistributionBarChartOptions.yAxis.title.text= "Usage("+appWiseUsageFormattedArray[1]+")";

                $scope.appPlanUsageDistributionChartConfig= 
                    {
                    "options" : appDistributionBarChartOptions,
                    "series": [{
                        name: tab+" wise Usage Distribution  ",
                        color: "rgb(39, 174, 96)",
                        data: appWiseUsageData
                    }]
                }

                $scope.exportUsgDistArray= angular.copy(exportUsgDistArray);
                  
                $scope.loadingAppPlanUsageDistributionDiv= false;
                $scope.DataAppPlanUsageDistributionDiv= true;
                $scope.noDataAppPlanUsageDistributionDiv= false;
            }else{
                $scope.loadingAppPlanUsageDistributionDiv= false;
                $scope.DataAppPlanUsageDistributionDiv= false;
                $scope.noDataAppPlanUsageDistributionDiv= true;
            }
        })
    }
    
    function getCEIDistribution(url, key){
        var CEIDistributionChartOptions= {};
        $scope.loadingCEIDiv= true;
        $scope.DataCEIDiv= false;
        $scope.noDataCEIDiv= false;
        
        $scope.CEIChartConfig= null;
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= key;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                // console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'percent';
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.legend= {maxHeight: 60};
                CEIDistributionUsersChartOptions.chart.height= 400;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.CEIDistributionChartOptions= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope['export'+key+'Dist']= angular.copy(objArray);

                $scope.loadingCEIDiv= false;
                $scope.DataCEIDiv= true;
                $scope.noDataCEIDiv= false;
            }else{
                $scope.loadingCEIDiv= false;
                $scope.DataCEIDiv= false;
                $scope.noDataCEIDiv= true;
            }
        })
    }

    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];
      
    var Days = [
        "Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"
      ];
    
    var  pad = function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      }
      
    var formatDate = function(milisec,format){
        var dt=new Date(milisec-globalConfig.adjustTime);
        format = format.replace('ss', pad(dt.getSeconds(),2));
        format = format.replace('s', dt.getSeconds());
        format = format.replace('dd', pad(dt.getDate(),2));
        format = format.replace('d', dt.getDate());
        format = format.replace('mm', pad(dt.getMinutes(),2));
        format = format.replace('m', dt.getMinutes());
        format = format.replace('MMMM', monthNames[dt.getMonth()]);
        format = format.replace('MMM', monthNames[dt.getMonth()].substring(0,3));
        format = format.replace('MM', pad(dt.getMonth()+1,2));
        format = format.replace(/M(?![ao])/, dt.getMonth()+1);
        format = format.replace('DD', Days[dt.getDay()]);
        format = format.replace(/D(?!e)/, Days[dt.getDay()].substring(0,3));
        format = format.replace('yyyy', dt.getFullYear());
        format = format.replace('YYYY', dt.getFullYear());
        format = format.replace('yy', (dt.getFullYear()+"").substring(2));
        format = format.replace('YY', (dt.getFullYear()+"").substring(2));
        
        if(format.includes("###")){
            var ampm = dt.getHours() >= 12 ? 'PM' : 'AM';
            var hours = dt.getHours() % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            format = format.replace('HH', pad(hours,2));
            format = format.replace('H', hours);
            format = format.replace('###', ampm);
        }
        else{
        format = format.replace('HH', pad(dt.getHours(),2));
        format = format.replace('H', dt.getHours());
        }
        
        return format;
      }

    function getThroughputDistribution(url, chartConfig, loadingDiv, noDataDiv){
        $scope[loadingDiv]= true;
        $scope[noDataDiv]= false;
        $scope.exportSubscriberDayThroughput= [];
        var throughputData= [], unformatedThroughputArray= [], maxsubscriberDataArray= [], capacityDataArray= [],formatedThroughputArray= [], usersArray= [], timeArray= [];
        var  maxSubscriber,capacity,unformatedCapacityArray= [],formatedCapacityArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            
            if(objArray.length>0){
                var exportTpVsSub= angular.copy(objArray);  
                if(currentPage=="OLT"){
                    maxSubscriber=$scope.loadOLTDeatils[$scope.drdwnSelect].subscriber;
                    capacity = $scope.loadOLTDeatils[$scope.drdwnSelect].capacity;
                }
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    console.log("Format Date output",objArray[i].Time)
                    timeArray[i] = formatDate(objArray[i].Time,'HH mm ###');


                    if(currentPage=="OLT"){
                        maxsubscriberDataArray[i]=maxSubscriber ;
                        capacityDataArray[i] = capacity;
                        }
                        
                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                        exportTpVsSub[i]['Throughput(bps)']=  exportTpVsSub[i]['Throughput'];
                        delete exportTpVsSub[i]['Throughput'];
                    }else
                        unformatedThroughputArray.push(parseInt(0));

                    if(objArray[i].hasOwnProperty('Subscribers')){
                        usersArray.push(parseInt(objArray[i].Subscribers));
                    }
                } 

                // console.log("Date Time ",timeArray)
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                formatedCapacityArray = angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(capacityDataArray, 3));

                for(var i in formatedThroughputArray[0]){
                    formatedThroughputArray[0][i]= parseFloat(formatedThroughputArray[0][i]);
                    if(currentPage=="OLT"){
                        formatedCapacityArray[0][i] = parseFloat(formatedCapacityArray[0][i]);
                    }
                    
                }
                
                if(usersArray.length>0){
                    var index= -1;
                    for(var i=0;i<objArray.length; i++){
                        if(objArray[i].hasOwnProperty('Throughput')){
                            throughputData.push([objArray[i].Hour,formatedThroughputArray[0][++index]]);
                        }
                    }
                    // console.log('throughputData', throughputData);
                    var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                    optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                    optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                    
                    $scope[chartConfig]= {
                        "options" : optionsThroughputBar,
                        "series": [{name: "Throughput",
                                    color:"rgb(39, 174, 96)",
                                   data: throughputData
                                   },
                                  ]
                    }
                    $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                }
                else{
                    if(currentPage=="OLT"){
                        var usageVsThroughputChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelCategoriesOptionsOLTMinutes);
                        $scope[chartConfig]= {
                            options: usageVsThroughputChartOptions,
                            series: [{
                                name: 'Throughput',
                                type: 'column',
                                "color": "#1abc9c",
                                data: formatedThroughputArray[0],
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.2f}</b>'
                                    // valueSuffix: ' '+formatedThroughputArray[1],
                                }
    
                            },{
                                name: 'Max Throughput ',
                                type: 'spline',
                                yAxis: 1,
                                color: "#FA020D",
                                data:  formatedCapacityArray[0],
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            }]
                        };
    
                        usageVsThroughputChartOptions.xAxis.categories= timeArray;
                        // usageVsThroughputChartOptions.xAxis.title= {text:"Hours"};
                    
                        usageVsThroughputChartOptions.yAxis[0].title.text= 'Throughput('+formatedThroughputArray[1]+")";

                        usageVsThroughputChartOptions.yAxis[1].title.text= 'Max Throughput('+formatedCapacityArray[1]+")";    
                    }
                    else{
                        var index= -1;
                        for(var i=0;i<objArray.length; i++){
                              if(objArray[i].hasOwnProperty('Throughput')){
                                 throughputData.push([objArray[i].Time,parseFloat(formatedThroughputArray[0][++index])]);
                                }
                            }
                //console.log('throughputData', throughputData);
                 var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                
                $scope[chartConfig]= {
                    "options" : optionsThroughputBar,
                    "series": [{name: "Throughput",
                                color:"#27AE60",
                               data: throughputData
                               },]
                            }
                  }
                }
                $scope[loadingDiv]= false;
                $scope[noDataDiv]= false;
                $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                
            }else{
                $scope[loadingDiv]= false;
                $scope[noDataDiv]= true;
            }
        })
    }


    function getThroughputDistributionHourly(url, chartConfig, loadingDiv, noDataDiv){
        $scope[loadingDiv]= true;
        $scope[noDataDiv]= false;
        $scope.exportSubscriberHourlyThroughput= [];
        var throughputData= [], unformatedThroughputArray= [], maxsubscriberDataArray= [], capacityDataArray= [],formatedThroughputArray= [], usersArray= [], timeArray= [];
        var  maxSubscriber,capacity,unformatedCapacityArray= [],formatedCapacityArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;

            console.log("objArray hourly response ",response.data)
            
            if(objArray.length>0){
                var exportTpVsSub= angular.copy(objArray);  
                if(currentPage=="OLT"){
                    maxSubscriber=$scope.loadOLTDeatils[$scope.drdwnSelect].subscriber;
                    capacity = $scope.loadOLTDeatils[$scope.drdwnSelect].capacity;
                }

                
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    timeArray= objArray[i].Hour;
                    if(currentPage=="OLT"){
                        maxsubscriberDataArray[i]=maxSubscriber ;
                        capacityDataArray[i] = capacity;
                        }
                        

                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                        exportTpVsSub[i]['Throughput(bps)']=  exportTpVsSub[i]['Throughput'];
                        delete exportTpVsSub[i]['Throughput'];
                    }else
                        unformatedThroughputArray.push(parseInt(0));

                    if(objArray[i].hasOwnProperty('Subscribers')){
                        usersArray.push(parseInt(objArray[i].Subscribers));
                    }
                } 
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                formatedCapacityArray = angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(capacityDataArray, 3));

                for(var i in formatedThroughputArray[0]){
                    formatedThroughputArray[0][i]= parseFloat(formatedThroughputArray[0][i]);
                    if(currentPage=="OLT"){
                        formatedCapacityArray[0][i] = parseFloat(formatedCapacityArray[0][i]);
                    }
                    
                }
                

                if(usersArray.length==0){
                    var index= -1;
                    for(var i=0;i<objArray.length; i++){
                        if(objArray[i].hasOwnProperty('Throughput')){
                            throughputData.push([objArray[i].Hour,formatedThroughputArray[0][++index]]);
                        }
                    }
                    console.log('throughputData', throughputData);
                    var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                    optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                    optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                    
                    $scope[chartConfig]= {
                        "options" : optionsThroughputBar,
                        "series": [{name: "Throughput",
                                    color:"rgb(39, 174, 96)",
                                   data: throughputData
                                   },
                                  ]
                    }
                    $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                }
                else{
                    if(currentPage=="OLT"){
                        var usageVsThroughputChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelCategoriesOptionsOLT);
                        $scope[chartConfig]= {
                            options: usageVsThroughputChartOptions,
                            series: [{
                                name: 'Throughput',
                                type: 'column',
                                yAxis: 1,
                                "color": "#1abc9c",
                                data: formatedThroughputArray[0],
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.2f}</b>'
                                    // valueSuffix: ' '+formatedThroughputArray[1],
                                }
    
                            },{
                                name: 'Max Subscriber ',
                                type: 'spline',
                                yAxis: 3,
                                color: "#FA020D",
                                data:  maxsubscriberDataArray,
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                      }
                            },{
                                name: 'Max Throughput ',
                                type: 'spline',
                                yAxis: 2,
                                color: "#b35900",
                                data:  formatedCapacityArray[0],
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            },{
                                name: 'Subscribers',
                                type: 'spline',
                                color: "#3D8EB9",
                                data:  usersArray,
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            },]
                        };
    
                        usageVsThroughputChartOptions.xAxis.categories= timeArray;
                        usageVsThroughputChartOptions.xAxis.title= {text:"Hours"};
                        // usageVsThroughputChartOptions.yAxis[3].min= 400;
                    
                        usageVsThroughputChartOptions.yAxis[1].title.text= 'Throughput('+formatedThroughputArray[1]+")";
                        usageVsThroughputChartOptions.yAxis[3].title.text= 'Max Subscriber';
                        usageVsThroughputChartOptions.yAxis[2].title.text= 'Max Throughput('+formatedCapacityArray[1]+")";    
                    }
                    else{
                    var usageVsThroughputChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelCategoriesOptions);
                    console.log("usageVsThroughputChartOptions",usageVsThroughputChartOptions)
                    $scope[chartConfig]= {
                        options: usageVsThroughputChartOptions,
                        series: [{
                            name: 'Throughput',
                            type: 'column',
                            yAxis: 1,
                            "color": "#1abc9c",
                            data: formatedThroughputArray[0],
                            tooltip: {
                                pointFormat: '{series.name}  : <b>{point.y:,.2f}</b>'
                                // valueSuffix: ' '+formatedThroughputArray[1],
                            }

                        },{
                            name: 'Subscribers',
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  usersArray,
                            tooltip: {
                                pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }
                        },]
                    };

                    usageVsThroughputChartOptions.xAxis.categories= timeArray;
                    usageVsThroughputChartOptions.xAxis.title= {text:"Hours"};
                    usageVsThroughputChartOptions.yAxis[1].title.text= 'Throughput('+formatedThroughputArray[1]+")";
                  }
                }
                $scope[loadingDiv]= false;
                $scope[noDataDiv]= false;
                $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                
            }else{
                $scope[loadingDiv]= false;
                $scope[noDataDiv]= true;
            }
        })
    }


    function getThroughputDistributionDay(url, chartConfig, loadingDiv, noDataDiv){
        $scope[loadingDiv]= true;
        $scope[noDataDiv]= false;
        $scope.exportSubscriberDayThroughput= [];
        var throughputData= [], unformatedThroughputArray= [], maxsubscriberDataArray= [], capacityDataArray= [],formatedThroughputArray= [], usersArray= [], timeArray= [];
        var  maxSubscriber,capacity,unformatedCapacityArray= [],formatedCapacityArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            
            if(objArray.length>0){
                var exportTpVsSub= angular.copy(objArray);  
                if(currentPage=="OLT"){
                    maxSubscriber=$scope.loadOLTDeatils[$scope.drdwnSelect].subscriber;
                    capacity = $scope.loadOLTDeatils[$scope.drdwnSelect].capacity;
                }
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    timeArray[i]=formatDate(objArray[i].Date,'d MMM');

                    if(currentPage=="OLT"){
                        maxsubscriberDataArray[i]=maxSubscriber ;
                        capacityDataArray[i] = capacity;
                        }
                        

                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                        exportTpVsSub[i]['Throughput(bps)']=  exportTpVsSub[i]['Throughput'];
                        delete exportTpVsSub[i]['Throughput'];
                    }else
                        unformatedThroughputArray.push(parseInt(0));

                    if(objArray[i].hasOwnProperty('Subscribers')){
                        usersArray.push(parseInt(objArray[i].Subscribers));
                    }
                } 

                // console.log("Date Time ",timeArray)
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                formatedCapacityArray = angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(capacityDataArray, 3));

                for(var i in formatedThroughputArray[0]){
                    formatedThroughputArray[0][i]= parseFloat(formatedThroughputArray[0][i]);
                    if(currentPage=="OLT"){
                        formatedCapacityArray[0][i] = parseFloat(formatedCapacityArray[0][i]);
                    }
                    
                }
                
                if(usersArray.length==0){
                    var index= -1;
                    for(var i=0;i<objArray.length; i++){
                        if(objArray[i].hasOwnProperty('Throughput')){
                            throughputData.push([objArray[i].Hour,formatedThroughputArray[0][++index]]);
                        }
                    }
                    // console.log('throughputData', throughputData);
                    var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelCategoriesOptions);
                    optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                    optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                    
                    $scope[chartConfig]= {
                        "options" : optionsThroughputBar,
                        "series": [{name: "Throughput",
                                    color:"rgb(39, 174, 96)",
                                   data: throughputData
                                   },
                                  ]
                    }
                    $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                }
                else{
                    if(currentPage=="OLT"){
                        var usageVsThroughputChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelCategoriesOptionsOLT);
                        $scope[chartConfig]= {
                            options: usageVsThroughputChartOptions,
                            series: [{
                                name: 'Throughput',
                                type: 'column',
                                yAxis: 1,
                                "color": "#1abc9c",
                                data: formatedThroughputArray[0],
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.2f}</b>'
                                    // valueSuffix: ' '+formatedThroughputArray[1],
                                }
    
                            },{
                                name: 'Max Subscriber ',
                                type: 'spline',
                                yAxis: 3,
                                color: "#FA020D",
                                data:  maxsubscriberDataArray,
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                      }
                            },{
                                name: 'Max Throughput ',
                                type: 'spline',
                                yAxis: 2,
                                color: "#b35900",
                                data:  formatedCapacityArray[0],
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            },{
                                name: 'Subscribers',
                                type: 'spline',
                                color: "#3D8EB9",
                                data:  usersArray,
                                tooltip: {
                                    pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                    // valueSuffix: ' '+FormattedusageDataArray[1]
                                }
                            },]
                        };
    
                        usageVsThroughputChartOptions.xAxis.categories= timeArray;
                        usageVsThroughputChartOptions.xAxis.title= {text:"Day"};
                    
                        usageVsThroughputChartOptions.yAxis[1].title.text= 'Throughput('+formatedThroughputArray[1]+")";
                        usageVsThroughputChartOptions.yAxis[3].title.text= 'Max Subscriber';
                        usageVsThroughputChartOptions.yAxis[2].title.text= 'Max Throughput('+formatedCapacityArray[1]+")";    
                    }
                    else{
                    var usageVsThroughputChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelCategoriesOptions);
                    $scope[chartConfig]= {
                        options: usageVsThroughputChartOptions,
                        series: [{
                            name: 'Throughput',
                            type: 'column',
                            yAxis: 1,
                            "color": "#1abc9c",
                            data: formatedThroughputArray[0],
                            tooltip: {
                                pointFormat: '{series.name}  : <b>{point.y:,.2f}</b>'
                                // valueSuffix: ' '+formatedThroughputArray[1],
                            }

                        },{
                            name: 'Subscribers',
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  usersArray,
                            tooltip: {
                                pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }
                        },]
                    };

                    usageVsThroughputChartOptions.xAxis.categories= timeArray;
                    usageVsThroughputChartOptions.xAxis.title= {text:"Hours"};
                    usageVsThroughputChartOptions.yAxis[1].title.text= 'Throughput('+formatedThroughputArray[1]+")";
                  }
                }
                $scope[loadingDiv]= false;
                $scope[noDataDiv]= false;
                $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                
            }else{
                $scope[loadingDiv]= false;
                $scope[noDataDiv]= true;
            }
        })
    }

    function getPleatueThroughput(url){
        $scope.loadingPlateauThroughputDiv= true;
        $scope.noDataPlateauThroughputDiv= false;

        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportPlateauThroughput= [];
            //console.log("response", objArray);
            if(objArray.length>0){
                var exportPlateauThroughput= angular.copy(objArray);
                var tptData= [], avgTptData= [], pleatuData= [], xAxisLabelData= [];
                for(var i in objArray){
                    tptData[i]= objArray[i].Throughput;
                    avgTptData[i]= objArray[i].Avgtime;
                    pleatuData[i]= objArray[i].Pleatue;
                    exportPlateauThroughput[i]['Throughput(bps)']= exportPlateauThroughput[i]['Throughput'];
                    exportPlateauThroughput[i]['Avgtime(bps)']= exportPlateauThroughput[i]['Avgtime'];
                    xAxisLabelData[i]= Number(objArray[i].Time);
                    delete exportPlateauThroughput[i]['Throughput'];
                    delete exportPlateauThroughput[i]['Avgtime'];
                }  
                
                var formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(tptData, 3));

                // var formatedAvgThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(avgTptData, 3));
                // var formatedAvgThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputData(avgTptData, 3, formatedThroughputArray[1]));

                // var formatedPleatuThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(pleatuData, 3));
                // var formatedPleatuThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputData(pleatuData, 3, formatedThroughputArray[1]));
                
                var dataTpt= [], dataAvgTpt= [], dataPleatueTpt= [];
                for(var i in formatedThroughputArray[0]){
                    dataTpt.push(parseFloat(formatedThroughputArray[0][i]));
                    // dataAvgTpt.push(parseFloat(formatedAvgThroughputArray[0][i]));
                    dataAvgTpt.push(parseFloat(dataFormatter.convertSingleUnitThroughputDataWoArray(avgTptData[i], 3, formatedThroughputArray[1])));
                    // dataPleatueTpt.push(parseFloat(formatedPleatuThroughputArray[0][i]));
                    dataPleatueTpt.push(parseFloat(dataFormatter.convertSingleUnitThroughputDataWoArray(pleatuData[i], 3, formatedThroughputArray[1])));
                }
                
                var tptChartOptions;
                tptChartOptions=  angular.copy(highchartOptions.highchart3YAxisLinePlusBarLabelDatetimeOptions);

                $scope.throughputPlateauChartConfig= {
                    options: tptChartOptions,
                    series: [ {
                        name: 'Throughput',
                        type: 'spline',
                        color: "#f7a35c",
                        yAxis: 2,
                        data: dataTpt,
                        tooltip: {
                            valueSuffix: ' '+formatedThroughputArray[1]
                        }
                    },{
                        name: 'Avg. Throughput',
                        type: 'spline',
                        "color": "#1abc9c",
                        yAxis: 2,
                        data: dataAvgTpt,
                        tooltip: {
                            valueSuffix: ' '+formatedThroughputArray[1]
                        }

                    }, {
                        name: 'Plateau',
                        type: 'areaspline',
                        color: "rgba(61,142,185, 0.20)",
                        fillOpacity: '0.15',
                        yAxis: 2,
                        data:  dataPleatueTpt,
                        tooltip: {
                            valueSuffix: ' '+formatedThroughputArray[1]
                        }
                    }]
                };
               
                tptChartOptions.xAxis.categories= xAxisLabelData;
                tptChartOptions.xAxis.labels.format= "{value:%H:%M}";
                
                // tptChartOptions.yAxis[1].title.text= 'Throughput ('+formatedThroughputArray[1]+')';
                // tptChartOptions.yAxis[2].title.text= 'Avg. Throughput ('+formatedAvgThroughputArray[1]+')';
                tptChartOptions.yAxis[2].title.text= 'Throughput ('+formatedThroughputArray[1]+')';
                $scope.exportPlateauThroughput= angular.copy(exportPlateauThroughput);
                $scope.loadingPlateauThroughputDiv= false;
                $scope.noDataPlateauThroughputDiv= false;

            }else{
                $scope.loadingPlateauThroughputDiv= false;
                $scope.noDataPlateauThroughputDiv= true;
            }
        })
    }
    
    function getCountryDistribution(url){
        
        $scope.loadingCountryDistributionDiv= true; 
        $scope.noDataCountryDistributionDiv= false;
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            // console.log("objArray", objArray);
            
            if(objArray.length>0){
                var exportCountryDistribution= angular.copy(objArray);
                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){

                    exportCountryDistribution[i]['Traffic(Bytes)']= exportCountryDistribution[i]['Traffic'];
                    delete exportCountryDistribution[i]['Traffic'];
                    pieChartArray[i]= {
                        name: objArray[i].Country, 
                        y: parseFloat(objArray[i].Traffic),
                        color: highchartProcessData.colorpallete[i]
                    };
                }

                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.percentage:.1f}%';
                // pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.y:.0f}</b>';
                pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.percentage:.1f}%</b>';

                $scope.countryDistributionChartConfig= {
                    "options" : pieChartOpt,
                    series: [{
                        name: "Country wise Distribution",
                        colorByPoint: true,
                        data: pieChartArray
                    }]
                }
                $scope.exportCountryDistribution= angular.copy(exportCountryDistribution);
                $scope.loadingCountryDistributionDiv= false; 
                $scope.noDataCountryDistributionDiv= false;
            }
            else{
                $scope.loadingCountryDistributionDiv= false; 
                $scope.noDataCountryDistributionDiv= true;
            }
        })
    }

    function defaultLoad(){
        
        $scope.drdwnSelect= $scope.select.plan;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;

        if(currentPage=="App"){
            reverse= "Plan";
            tab= "Plan";
            // $scope.PlanOrOLT= "DSLAM"
            $scope.PlanOrOLT= globalConfig.OLTorDSLAM;
            $scope.appPageActive= true;
            $scope.UsersOrVisits= 'Subscribers';
            currentPlanID= $scope.select.plan;
        }else if(currentPage=="OLT"){
            reverse= "App";
            tab= "App";
            $scope.appPageActive= false;
            $scope.PlanOrOLT= "Plan";
            $scope.UsersOrVisits= 'Subscribers';
            var index= $.inArray($scope.select.plan, planNameListArr);
            currentPlanID= $scope.select.plan;
        }else{
            //console.log("planNameListArr",planNameListArr);
            var index= $.inArray($scope.select.plan, planNameListArr);
            //console.log("planIDListArr", planIDListArr);
            currentPlanID= $scope.select.plan//planIDListArr[index];
            $scope.appPageActive= false;
            // $scope.PlanOrOLT= "DSLAM"
            $scope.PlanOrOLT= globalConfig.OLTorDSLAM;
            $scope.UsersOrVisits= 'Subscribers';
            reverse= "Apps";
            tab= "App";
        }
        $scope.PlanOrApp= tab;
        
        switch($scope.currentTab){
            case 'UsageVsUsers':
                $scope.exportUsgSubObj= {};
                $scope.exportUsgSubObj.fileName= $scope.currentPage+' Analytics'+"_Usage Vs "+$scope.UsersOrVisits;
                $scope.exportUsgSubObj.fileHeader= "Usage Vs "+$scope.UsersOrVisits+" Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var UsageVsUsersURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Usage vs Users&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                UsageVsUsers(UsageVsUsersURL);
                break;
            
            case 'OLTDistribution':
                if($scope.PlanOrOLT=='DSLAM'){
                    var OLTDistributionUsageURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+'OLT'+" usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                   
                    var OLTDistributionUsersURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+'OLT'+" Users Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                    OLTSegmentDistribution(OLTDistributionUsageURL, OLTDistributionUsersURL,  'OLT');
                }else{
                    $scope.oltUsgDist= {};
                    $scope.oltUsgDist.fileName= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrOLT+" wise Usage Distribution";
                    $scope.oltUsgDist.fileHeader= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrOLT+" wise Usage Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                    $scope.oltSubDist= {};
                    $scope.oltSubDist.fileName= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrOLT+" wise Subscribers Distribution";
                    $scope.oltSubDist.fileHeader= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrOLT+" wise Subscribers Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                    $scope.oltDurDist= {};
                    $scope.oltDurDist.fileName= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrOLT+" wise Duration Distribution";
                    $scope.oltDurDist.fileHeader= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrOLT+" wise Duration Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                    var OLTDistributionUsageURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+$scope.PlanOrOLT+" usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                   
                    var OLTDistributionUsersURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+$scope.PlanOrOLT+" Users Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                    
                    var OLTDistributionDurationURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+$scope.PlanOrOLT+" Duration Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                    
                    OLTSegmentDistribution(OLTDistributionUsageURL, OLTDistributionUsersURL,  $scope.PlanOrOLT);
                    durationDistributionMultiline(OLTDistributionDurationURL,  $scope.PlanOrOLT)
                }
                break;
            
            case 'segmentWiseDistribution':

                $scope.segUsgDist= {};
                $scope.segUsgDist.fileName= $scope.currentPage+' Analytics'+"_"+"Segment Usage Distribution";
                $scope.segUsgDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"Segment Usage Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                $scope.segSubDist= {};
                $scope.segSubDist.fileName= $scope.currentPage+' Analytics'+"_"+"Segment Subscribers Distribution";
                $scope.segSubDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"Segment Subscribers Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                $scope.segDurDist= {};
                $scope.segDurDist.fileName= $scope.currentPage+' Analytics'+"_"+"Segment Duration Distribution";
                $scope.segDurDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"Segment Duration Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var segmentWiseUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Segment Usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var segmentWiseUsersDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Segment Users Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var segmentWiseDurationDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Segment Duration Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                OLTSegmentDistribution(segmentWiseUsageDistributionURL, segmentWiseUsersDistributionURL, 'Segment');
                durationDistributionMultiline(segmentWiseDurationDistributionURL, 'Segment');
                break;
            
            case 'CEI':
                $scope.CEIDist= {};
                $scope.CEIDist.fileName= $scope.currentPage+' Analytics'+"_CEI"
                $scope.CEIDist.fileHeader= $scope.currentPage+' Analytics'+"_CEI Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between date "+$scope.sDate+" - "+$scope.edate;

                var CEIDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise CEI for date range"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;//+filterParameters;
        
                getCEIDistribution(CEIDistributionURL, 'CEI');
                break;
            
            case 'AppDistribution':
                
                var AppPlanUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise top 20 "+reverse+" usage&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var AppPlanUsersDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+reverse+" users&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
        
                 var AppPlanDurationDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise "+reverse+" Duration Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
        
                if( $scope.PlanOrApp=="App"){
                    $scope.PlanOrAppUsgDist= {};
                    $scope.PlanOrAppUsgDist.fileName= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrApp+" Usage Distribution";
                    $scope.PlanOrAppUsgDist.fileHeader= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrApp+" Usage Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                    $scope.PlanOrAppSubDist= {};
                    $scope.PlanOrAppSubDist.fileName= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrApp+" Subscribers Distribution";
                    $scope.PlanOrAppSubDist.fileHeader= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrApp+" Subscribers Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                    OLTSegmentDistribution(AppPlanUsageDistributionURL, AppPlanUsersDistributionURL, $scope.PlanOrApp);
                }else{
                    $scope.PlanOrAppUsgDist= {};
                    $scope.PlanOrAppUsgDist.fileName= $scope.currentPage+' Analytics'+"_Top 20 "+$scope.PlanOrApp+" Usage Distribution";
                    $scope.PlanOrAppUsgDist.fileHeader= $scope.currentPage+' Analytics'+"_Top 20 "+$scope.PlanOrApp+" Usage Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                    
                    $scope.PlanOrAppDurDist= {};
                    $scope.PlanOrAppDurDist.fileName= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrApp+" Duration Distribution";
                    $scope.PlanOrAppDurDist.fileHeader= $scope.currentPage+' Analytics'+"_"+$scope.PlanOrApp+" Duration Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                    appPlanUsageDistribution(AppPlanUsageDistributionURL, $scope.PlanOrApp);
                }
                durationDistributionMultiline(AppPlanDurationDistributionURL, $scope.PlanOrApp);
                break;
            
            case 'Latency':
                $scope.LatDist= {};
                $scope.LatDist.fileName= $scope.currentPage+' Analytics'+"_Latency Distribution"
                $scope.LatDist.fileHeader= $scope.currentPage+' Analytics'+"_Latency Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between date "+$scope.sDate+" - "+$scope.edate;

                var latencyDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" wise Latency for date range"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
        
                getCEIDistribution(latencyDistributionURL, 'Latency');
                break;
        
            case 'Throughput':

                $scope.TpmDist= {};
                $scope.TpmDist.fileName= $scope.currentPage+' Analytics'+"_Throughput Distribution(Minute wise)"
                $scope.TpmDist.fileHeader= $scope.currentPage+' Analytics'+"_Throughput Distribution(Minute wise) for "+$scope.currentPage+" "+$scope.drdwnSelect+" date "+$scope.edate;
                
                $scope.TphDist= {};
                $scope.TphDist.fileName= $scope.currentPage+' Analytics'+"_Peak Throughput Vs Subscribers (Hourly)"
                $scope.TphDist.fileHeader= $scope.currentPage+' Analytics'+"_Peak Throughput Vs Subscribers (Hourly) for "+$scope.currentPage+" "+$scope.drdwnSelect+" date "+$scope.edate;

                var throughputDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" minute wise Throughput for 1 Day&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                var throughputHourlyDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" Hourly Throughput for 1 Day&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                var throughputDayDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" Wise Unique Subscriber and throughput&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                var upThroughputDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" minute wise Up Throughput for 1 Day&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                var upThroughputHourlyDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" Hourly Up Throughput for 1 Day&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                
                getThroughputDistribution(throughputDistributionURL, 'throughputChartConfig', 'loadingThroughputDiv', 'noDataThroughputDiv');
                getThroughputDistributionHourly(throughputHourlyDistributionURL, 'throughputHourlyChartConfig', 'loadingHourlyThroughputDiv', 'noDataHourlyThroughputDiv');
                getThroughputDistributionDay(throughputDayDistributionURL,'throughputDayChartConfig', 'loadingDayThroughputDiv', 'noDataDayThroughputDiv');
                getThroughputDistribution(upThroughputDistributionURL, 'upThroughputChartConfig', 'loadingupThroughputDiv', 'noDataupThroughputDiv');
                getThroughputDistributionHourly(upThroughputHourlyDistributionURL, 'upThroughputHourlyChartConfig', 'loadingHourlyupThroughputDiv', 'noDataHourlyupThroughputDiv');
                break;

            case 'OLTUtilization':
                $scope.OLTUtlzion= {};
                $scope.OLTUtlzion.fileName= $scope.currentPage+' Analytics'+"_OLT Utilization"
                $scope.OLTUtlzion.fileHeader= $scope.currentPage+' Analytics'+"_OLT Utilization for "+$scope.currentPage+" "+$scope.drdwnSelect+" date "+$scope.edate;

                var pleatueThroughput= globalConfig.pullfilterdataurlbyname+ currentPage+" Minute wise tp plateau avg&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                getPleatueThroughput(pleatueThroughput);
                break;

            case 'countryDistribution':

                $scope.cntryDist= {};
                $scope.cntryDist.fileName= $scope.currentPage+' Analytics'+"_Country Distribution"
                $scope.cntryDist.fileHeader= $scope.currentPage+' Analytics'+"_Country Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between date "+$scope.sDate+" - "+$scope.edate;

                var countryDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" wise Country Traffic"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                getCountryDistribution(countryDistributionURL);
                break;

            case 'CityDistribution':

                $scope.cityUsgDist= {};
                $scope.cityUsgDist.fileName= $scope.currentPage+' Analytics'+"_"+"City Usage Distribution";
                $scope.cityUsgDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"City Usage Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                $scope.citySubDist= {};
                $scope.citySubDist.fileName= $scope.currentPage+' Analytics'+"_"+"City Subscribers Distribution";
                $scope.citySubDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"City Subscribers Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var cityWiseUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise City usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var cityWiseUsersDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise City Users Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                OLTSegmentDistribution(cityWiseUsageDistributionURL, cityWiseUsersDistributionURL, 'City');
                break;
            
            case 'AreaDistribution':

                $scope.areaUsgDist= {};
                $scope.areaUsgDist.fileName= $scope.currentPage+' Analytics'+"_"+"Area Usage Distribution";
                $scope.areaUsgDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"Area Usage Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                $scope.areaSubDist= {};
                $scope.areaSubDist.fileName= $scope.currentPage+' Analytics'+"_"+"Area Subscribers Distribution";
                $scope.areaSubDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"Area Subscribers Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var areaWiseUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Area usage Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var areaWiseUsersDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Area Users Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                OLTSegmentDistribution(areaWiseUsageDistributionURL, areaWiseUsersDistributionURL, 'Area');
                break;
            
            case 'Cached/Uncached':

                $scope.cachedUncachedUsgDist= {};
                $scope.cachedUncachedUsgDist.fileName= $scope.currentPage+' Analytics'+"_"+"Cached/Uncached Usage Distribution";
                $scope.cachedUncachedUsgDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"Cached/Uncached Usage Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;
                
                $scope.cachedUncachedTpDist= {};
                $scope.cachedUncachedTpDist.fileName= $scope.currentPage+' Analytics'+"_"+"Cached/Uncached Throughput Distribution";
                $scope.cachedUncachedTpDist.fileHeader= $scope.currentPage+' Analytics'+"_"+"Cached/Uncached Throughput Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" for Date "+$scope.edate;
                
                var CDNUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise CDN traffic distribution&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;

                console.log("cahced/uncacde traffic distribution",CDNUsageDistributionURL)
                
                var CDNTpDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" cdn minute wise Throughput for 1 Day&fromDate="+$scope.date.end+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                // var CDNOverallTpDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" minute wise Throughput for 1 Day&fromDate="+$scope.date.end+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var CDNSubsDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" cdn minute wise Subscribers for 1 Day&fromDate="+$scope.date.end+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;

                
                CDNDistribution(CDNUsageDistributionURL, 'CDN','Usage');
                CDNDistribution(CDNTpDistributionURL, 'CDN', 'Throughput');
                CDNDistribution(CDNSubsDistributionURL, 'CDN', 'Subscribers');
                break;
        }
  
    }
    
    getPlanList(planListURL);
    
    //plan select event 
    $scope.planSelected= function(){
        defaultLoad();
    }
    
    //dateRange select event
    $scope.click= function(){
        
        if($scope.select.plan=='NetFlix' || $scope.select.plan=='Video' || $scope.select.plan=='Youtube')
            $scope.activeCEI= true;
        else
            $scope.activeCEI= false;
        defaultLoad();
    }
    
    //-------------------------------------------------------------------------
    
    
    //tab Selected event 
    $scope.tabSelected= function(tab){
        $scope.currentTab= tab;
        defaultLoad();
    }
}


//End Plan/App/ App Segment/ Segment Analytics Controller


function OLTUtilizationBBCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams,utility, dbService) {

    //track url starts
    utility.trackUrl();
    //end track url

    $scope.dateSelect= "2017-12-01";
    function getPleatueThroughput(url){
        $scope.loadingPlateauThroughputDiv= true;
        $scope.noDataPlateauThroughputDiv= false;

        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportPlateauThroughput= [];
            //console.log("response", objArray);
            if(objArray.length>0){
                var exportPlateauThroughput= angular.copy(objArray);
                var tptData= [], avgTptData= [], pleatuData= [], xAxisLabelData= [];
                for(var i in objArray){
                    tptData[i]= objArray[i].Throughput;
                    avgTptData[i]= objArray[i].Avgtime;
                    pleatuData[i]= objArray[i].Pleatue;
                    exportPlateauThroughput[i]['Throughput(bps)']= exportPlateauThroughput[i]['Throughput'];
                    exportPlateauThroughput[i]['Avgtime(bps)']= exportPlateauThroughput[i]['Avgtime'];
                    xAxisLabelData[i]= Number(objArray[i].Time);
                    delete exportPlateauThroughput[i]['Throughput'];
                    delete exportPlateauThroughput[i]['Avgtime'];
                }  
                
                var formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(tptData, 3));

                var formatedAvgThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(avgTptData, 3));

                var formatedPleatuThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(pleatuData, 3));
                
                var dataTpt= [], dataAvgTpt= [], dataPleatueTpt= [];
                for(var i in formatedThroughputArray[0]){
                    dataTpt.push(parseFloat(formatedThroughputArray[0][i]));
                    dataAvgTpt.push(parseFloat(formatedAvgThroughputArray[0][i]));
                    dataPleatueTpt.push(parseFloat(formatedPleatuThroughputArray[0][i]));
                }
                
                var tptChartOptions;
                tptChartOptions=  angular.copy(highchartOptions.highchart3YAxisLinePlusBarLabelDatetimeOptions);

                $scope.throughputPlateauChartConfig= {
                    options: tptChartOptions,
                    series: [ {
                        name: 'Throughput',
                        type: 'spline',
                        color: "#f7a35c",
                        yAxis: 2,
                        data: dataTpt,
                        tooltip: {
                            valueSuffix: ' '+formatedThroughputArray[1]
                        }
                    },{
                        name: 'Avg. Throughput',
                        type: 'spline',
                        "color": "#1abc9c",
                        yAxis: 2,
                        data: dataAvgTpt,
                        tooltip: {
                            valueSuffix: ' '+formatedAvgThroughputArray[1]
                        }

                    }, {
                        name: 'Plateau',
                        type: 'areaspline',
                        color: "rgba(61,142,185, 0.20)",
                        fillOpacity: '0.15',
                        yAxis: 2,
                        data:  dataPleatueTpt,
                        tooltip: {
                            valueSuffix: ' '+formatedPleatuThroughputArray[1]
                        }
                    }]
                };
               
                tptChartOptions.xAxis.categories= xAxisLabelData;
                tptChartOptions.xAxis.labels.format= "{value:%H:%M}";
                
                // tptChartOptions.yAxis[1].title.text= 'Throughput ('+formatedThroughputArray[1]+')';
                // tptChartOptions.yAxis[2].title.text= 'Avg. Throughput ('+formatedAvgThroughputArray[1]+')';
                tptChartOptions.yAxis[2].title.text= 'Throughput ('+formatedThroughputArray[1]+')';
                $scope.exportPlateauThroughput= angular.copy(exportPlateauThroughput);
                $scope.loadingPlateauThroughputDiv= false;
                $scope.noDataPlateauThroughputDiv= false;

            }else{
                $scope.loadingPlateauThroughputDiv= false;
                $scope.noDataPlateauThroughputDiv= true;
            }
        })
    }
    
    function defaultLoad(){
        $scope.edate= $scope.dateSelect;
        $scope.OLTUtlzion= {};
        // $scope.OLTUtlzion.fileName= 'OLT Utilization Analytics'
        // $scope.OLTUtlzion.fileHeader= "OLT Utilization Analytics for Date "+$scope.edate;
        $scope.OLTUtlzion.fileName= 'Interface Congestion Monitoring'
        $scope.OLTUtlzion.fileHeader= "Interface Congestion Monitoring for Date "+$scope.edate;
        // var pleatueThroughput= globalConfig.pullfilterdataurlbyname+"Overall Minute wise tp plateau avg&toDate="+$scope.dateSelect+"T00:00:00.000Z";
        var pleatueThroughput= globalConfig.pullfilterdataurlbyname+"OLT Minute wise tp plateau avg&toDate="+$scope.dateSelect+"T00:00:00.000Z";
        getPleatueThroughput(pleatueThroughput);
    }
    
    defaultLoad();
    
    //date change event
    $scope.changeDate=function (modelName, newDate) {
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
        defaultLoad();
     }
}
//End OLT Utilization Analytics Controller
//-----------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------
// DNS Analytics Controller

function dnsAnalyticsBBCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams,utility, dbService) {

    //track url starts
    utility.trackUrl();
    //end track url

    $scope.showTabObj= angular.copy(utility.tb.dnsAnalytics)
    
    function getCurrentTab(){
        if($scope.showTabObj.Requests){
            $scope.currentTab= 'Requests';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.SuccessFailure){
            $scope.currentTab= 'SuccessFailure';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.FailureTrend){
            $scope.currentTab= 'FailureTrend';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.ResolutionTime){
            $scope.currentTab= 'ResolutionTime';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.FailureReasons){
            $scope.currentTab= 'FailureReasons';
            return $scope.currentTab;
        }
    }
    // -------------------------------------------------------------------------------------

    //Filter Section
    $scope.select= {};
    function getPlanList(){
        var dnsListURL= globalConfig.pulldataurlbyname+"DNS Filter";
        var dnsIDListArr= [], dnsNameListArr=[], dnsListArray= [];
        
        httpService.get(dnsListURL).then(function(response){
           
            var objArray= response.data;
            for(var i in objArray){
                dnsListArray[i]= objArray[i]['DNS'];
            }
            $scope.dnsNameList= angular.copy(dnsListArray);
            $scope.select.dns= dnsListArray[0];

            $scope.currentTab= getCurrentTab();
            defaultLoad();
            
        })
        
    }
    
    //End of Filter Section
    //--------------------------------------------------------------
    function dnsStackedBar(url, key){
        var name;
        if(key== 'ResolutionBkt')
            name= 'ResolutionTime';
        else
            name= key;
        var CEIDistributionChartOptions= {};
        $scope['loading'+name+'Div']= true;
        $scope['Data'+name+'Div']= false;
        $scope['noData'+name+'Div']= false;
        
        $scope[name+'ChartConfig']= null;
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope['export'+name]= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= key;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                // console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'percent';
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.legend= {maxHeight: 60};
                CEIDistributionUsersChartOptions.chart.height= 400;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope[name+'ChartConfig']= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                $scope['export'+name]= angular.copy(objArray);

                // console.log("Ram export data ",$scope['export'+name])

                $scope['loading'+name+'Div']= false;
                $scope['Data'+name+'Div']= true;
                $scope['noData'+name+'Div']= false;
            }else{
                $scope['loading'+name+'Div']= false;
                $scope['Data'+name+'Div']= false;
                $scope['noData'+name+'Div']= true;
            }
        })
    }

    function dnsSuccessFailure(url){
        $scope.loadingSuccessFailureDiv= true;
        $scope.DataSuccessFailureDiv= false;
        $scope.noDataSuccessFailureDiv= false;
        $scope.exportSuccessFailureArray= [];
        var sucFailData= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            
            if(objArray.length>0){
                var sucDataArray= [], failDataArray= [], timeArray= [];
                var exportSuccessFailureArray= angular.copy(objArray);
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    sucDataArray[i]= objArray[i].Success;
                    failDataArray[i]= objArray[i].Failure;
                    timeArray[i]= objArray[i].Date;
                } 
                
                var optionsSucFail= angular.copy(highchartOptions.highchartBarNgtValLabelDatetimeOptions);
                optionsSucFail.yAxis.title.text="Success-Failure";
                optionsSucFail.xAxis.categories= angular.copy(timeArray);
                console.log(optionsSucFail);
                $scope.SuccessFailureChartConfig={ 
                    options: optionsSucFail,
                    series: [{
                        name: 'Success',
                        color: 'rgb(28,255,34)',
                        data: sucDataArray
                    }, {
                        name: 'Failure',
                        color: 'rgb(255,28,28)',
                        data: failDataArray
                    }]
                }

                $scope.exportSuccessFailureArray= angular.copy(exportSuccessFailureArray);
                $scope.loadingSuccessFailureDiv= false;
                $scope.DataSuccessFailureDiv= true;
                $scope.noDataSuccessFailureDiv= false;
                
            }else{
                $scope.loadingSuccessFailureDiv= false;
                $scope.DataSuccessFailureDiv= false;
                $scope.noDataSuccessFailureDiv= true;
            }
        })
    }
    
    function dnsLine(url, key){
        var name;
        if(key=="Requests")
            name= 'Req';
        else
            name= key;
        $scope['loadingDNS'+name+'Div']= true;
        $scope['dataDNS'+name+'Div']= false;
        $scope['noDataDNS'+name+'Div']= false;
        $scope['exportDNS'+name+'Data']= [];
        var dataArray= [], timeArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            
            if(objArray.length>0){
                var exportArray= angular.copy(objArray);
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    timeArray[i]= objArray[i].Date;
                    dataArray[i]= [objArray[i].Date,objArray[i][key]];
                } 
                
                var optionsLine= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsLine.chart.type= 'spline';
                optionsLine.xAxis.labels.format= "{value:%e %b}";
                optionsLine.tooltip.pointFormat= 'Requests <b> {point.y:.0f} </b>';
                optionsLine.yAxis.title.text=key;
                // optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                console.log("['DNS'+key+'ChartConfig']", 'DNS'+name+'ChartConfig');
                console.log("dataArray", dataArray);
                $scope['DNS'+name+'ChartConfig']= {
                    "options" : optionsLine,
                    "series": [{name: "DNS "+key+" Daywise",
                                color:"rgb(39, 174, 96)",
                                data: dataArray
                               },
                              ]
                }
                $scope['loadingDNS'+name+'Div']= false;
                $scope['dataDNS'+name+'Div']= true;
                $scope['noDataDNS'+name+'Div']= false;
                $scope['exportDNS'+name+'Data']= angular.copy(exportArray);
            }else{
                $scope['loadingDNS'+name+'Div']= false;
                $scope['dataDNS'+name+'Div']= false;
                $scope['noDataDNS'+name+'Div']= true;
            }
        })
    }
    
    function defaultLoad(){
        
        $scope.dnsSelect= $scope.select.dns;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;

        switch($scope.currentTab){
            case 'Requests':
                
                $scope.exportDNSReqObj= {};
                $scope.exportDNSReqObj.fileName= "DNS Analytics_Requests";
                $scope.exportDNSReqObj.fileHeader= "Requests Distribution for DNS "+$scope.dnsSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var dnsRequestsURL= globalConfig.pullfilterdataurlbyname+"DNS IP wise Requests&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&DNS="+$scope.select.dns;
                
                dnsLine(dnsRequestsURL, 'Requests');
                break;
            
            case 'SuccessFailure':
                
                $scope.SuccessFailure= {};
                $scope.SuccessFailure.fileName= "DNS Analytics_SuccessFailure";
                $scope.SuccessFailure.fileHeader=  "Success-Failure Distribution for DNS "+$scope.dnsSelect+" between "+$scope.sDate+" - "+$scope.edate;
                
                var dnsSuccessFailureURL= globalConfig.pullfilterdataurlbyname+"DNS IP wise Success Failure Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&DNS="+$scope.select.dns;
                
                dnsSuccessFailure(dnsSuccessFailureURL);
                break;
            
            case 'FailureTrend':
                
                $scope.FailureTrend= {};
                $scope.FailureTrend.fileName= "DNS Analytics_FailureTrend";
                $scope.FailureTrend.fileHeader=  "Failure Trend Distribution for DNS "+$scope.dnsSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var dnsFailureTrendURL= globalConfig.pullfilterdataurlbyname+"DNS IP wise Failure Percent&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&DNS="+$scope.select.dns;
        
                dnsLine(dnsFailureTrendURL, 'Failure');
                break;
            
            case 'ResolutionTime':
                
                $scope.ResolutionTime= {};
                $scope.ResolutionTime.fileName= "DNS Analytics_ResolutionTime";
                $scope.ResolutionTime.fileHeader=  "Resolution Time Distribution for DNS "+$scope.dnsSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var dnsResolutionTimeURL= globalConfig.pullfilterdataurlbyname+"DNS ResolutionTime for IP&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&DNS="+$scope.select.dns;
        
                dnsStackedBar(dnsResolutionTimeURL, 'ResolutionBkt');
                break;
        
            case 'FailureReasons':

                $scope.FailureReasons= {};
                $scope.FailureReasons.fileName= "DNS Analytics_FailureReasons";
                $scope.FailureReasons.fileHeader= "Failure Reasons Distribution for DNS "+$scope.dnsSelect+" between "+$scope.sDate+" - "+$scope.edate;
                
                var dnsFailureReasonsURL= globalConfig.pullfilterdataurlbyname+"DNS IP wise Failure Reasons&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T00:00:00.000Z&DNS="+$scope.select.dns;
                
                dnsStackedBar(dnsFailureReasonsURL, 'FailureReason');
                break;
        }
  
    }
    
    getPlanList();
    
    //dateRange select event
    $scope.click= function(){
       defaultLoad();
    }
    
    //-------------------------------------------------------------------------
    
    
    //tab Selected event 
    $scope.tabSelected= function(tab){
        $scope.currentTab= tab;
        defaultLoad();
    }
}

//End DNS Analytics Controller




//-----------------------------------------------------------------------------------------------------
// CDN Analytics Controller
function cdnAnalyticsBBCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams,utility, dbService) {

    //track url starts
    utility.trackUrl();
    //end track url
    console.log(utility)
    $scope.showTabObj= angular.copy(utility.tb.cdnAnalytics)

    
    function getCurrentTab(){
        if($scope.showTabObj.Usage){
            $scope.currentTab= 'Usage';
            return $scope.currentTab;
        }
        else if($scope.showTabObj.Throughput){
            $scope.currentTab= 'Throughput';
            return $scope.currentTab;
        }
        else if($scope.showTabObj.TpBkt){
            $scope.currentTab= 'TpBkt';
            return $scope.currentTab;
        } 
        else if($scope.showTabObj.Area){
            $scope.currentTab= 'Area';
            return $scope.currentTab;
        } 
        else if($scope.showTabObj.Plan){
            $scope.currentTab= 'Plan';
            return $scope.currentTab;
        }
    }
    // -------------------------------------------------------------------------------------

    //Filter Section
    $scope.select= {};
    function getCDNList(){
        var cdnListURL= globalConfig.pulldataurlbyname+"CDN Filter";
        var cdnIDListArr= [], cdnNameListArr=[], cdnListArray= [];
        
        httpService.get(cdnListURL).then(function(response){
           
            var objArray= response.data;
            for(var i in objArray){
                cdnListArray[i]= objArray[i]['CDN'];
            }
            $scope.cdnNameList= angular.copy(cdnListArray);
            $scope.select.cdn= cdnListArray[0];

            $scope.currentTab= getCurrentTab();
            defaultLoad();
            
        })
        
    }
    
    //End of Filter Section
    //--------------------------------------------------------------
    
    function cdnLine(url, key){

        console.log("cdnLINE URL " + url)
        var name;
        // if(key=="Requests")
            // name= 'Req';
        // else
            name= key;
        $scope['loadingCDN'+name+'Div']= true;
        $scope['dataCDN'+name+'Div']= false;
        $scope['noDataCDN'+name+'Div']= false;
        $scope['exportCDN'+name+'Data']= [];
        var dataArray= [], timeArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;

            
            if(objArray.length>0){
                var usageDataArray= [];
                var exportArray= angular.copy(objArray);
                for(var i=0; i<objArray.length;i++){
                    usageDataArray[i]=  objArray[i].Usage;
                    exportArray[i]['Usage(Bytes)']= exportArray[i].Usage;
                    delete exportArray[i]['Usage'];
                }
                //console.log("objArray", objArray);

                var FormattedusageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 1)
                for(var i=0;i<objArray.length; i++){
                    timeArray[i]= objArray[i].Date;
                    dataArray[i]= [objArray[i].Date,FormattedusageDataArray[0][i]];
                } 
                var optionsLine= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsLine.chart.type= 'spline';
                optionsLine.xAxis.labels.format= "{value:%e %b}";
                optionsLine.tooltip.pointFormat= 'Usage <b> {point.y:.2f} '+FormattedusageDataArray[1]+' </b>';
                optionsLine.yAxis.title.text=key+'( '+FormattedusageDataArray[1]+' )';
                // optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                // console.log("['DNS'+key+'ChartConfig']", 'DNS'+name+'ChartConfig');
                // console.log("dataArray", dataArray);
                $scope['CDN'+name+'ChartConfig']= {
                    "options" : optionsLine,
                    "series": [{name: "CDN "+key+" Daywise",
                                color:"rgb(39, 174, 96)",
                                data: dataArray
                               },
                              ]
                }

                $scope['loadingCDN'+name+'Div']= false;
                $scope['dataCDN'+name+'Div']= true;
                $scope['noDataCDN'+name+'Div']= false;
                $scope['exportCDN'+name+'Data']= angular.copy(exportArray);
            }else{
                $scope['loadingCDN'+name+'Div']= false;
                $scope['dataCDN'+name+'Div']= false;
                $scope['noDataCDN'+name+'Div']= true;
            }
        })
    }
    
    function getThroughputDistribution(url){
        $scope.loadingThroughputDiv= true;
        $scope.noDataThroughputDiv= false;
        $scope.exportSubscriberThroughput= [];
        var throughputData= [], unformatedThroughputArray= [], formatedThroughputArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            if(objArray.length>0){
                
                var exportSubscriberThroughput=angular.copy(objArray);
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                        exportSubscriberThroughput[i]['Throughput(bps)']= exportSubscriberThroughput[i]['Throughput'];
                        delete exportSubscriberThroughput[i]['Throughput'];
                    }
                } 
                // console.log("unformatedThroughputArray", unformatedThroughputArray);
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                
                var index= -1;
                for(var i=0;i<objArray.length; i++){
                     if(objArray[i].hasOwnProperty('Throughput')){
                         throughputData.push([objArray[i].Time,parseFloat(formatedThroughputArray[0][++index])]);
                     }
                }
                //console.log('throughputData', throughputData);
                var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                
                $scope.throughputChartConfig= {
                    "options" : optionsThroughputBar,
                    "series": [{name: "Throughput",
                                color:"rgb(39, 174, 96)",
                               data: throughputData
                               },
                              ]
                }
                $scope.exportSubscriberThroughput= angular.copy(exportSubscriberThroughput);

                $scope.loadingThroughputDiv= false;
                $scope.noDataThroughputDiv= false;
                
            }else{
                $scope.loadingThroughputDiv= false;
                $scope.noDataThroughputDiv= true;
            }
        })
    }

    function getTpBktUsgDist(url){
        var TpBktDistributionUsersChartOptions= {};
        $scope.loadingTpBktDistributionDiv= true;
        $scope.DataTpBktDistributionDiv= false;
        $scope.noDataTpBktDistributionDiv= false;

        $scope.TpBktDistributionChartOptions= null;

        if( url != null){
            httpService.get(url).then(function(response){
                    
                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
                    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Subscribers";
                    paramObject.seriesName= 'ThroughputBkt';
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
                    
                    // console.log("paramObject", paramObject);
                    
                    var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                    OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    OLTDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                    OLTDistributionUsersChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                    OLTDistributionUsersChartOptions.tooltip.shared= true;
                    OLTDistributionUsersChartOptions.chart.height= 400;
                    OLTDistributionUsersChartOptions.yAxis.title= {"text":"Subscribers "};
                    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;

                    $scope.TpBktDistributionChartOptions= {
                        options: OLTDistributionUsersChartOptions,
                        series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                    }
                    
                    
                    $scope.exportUsgDistArray= angular.copy(exportSubDistArray);
    
                    $scope.loadingTpBktDistributionDiv= false;
                    $scope.DataTpBktDistributionDiv= true;
                    $scope.noDataTpBktDistributionDiv= false;
                }else{
                    $scope.loadingTpBktDistributionDiv= false;
                    $scope.DataTpBktDistributionDiv= false;
                    $scope.noDataTpBktDistributionDiv= true;
                }
            })
        }
    }

    function getTabDrpDwn(){
        var tabDropdownListURL= null;
        tabDropdownListURL= globalConfig.pulldataurlbyname+$scope.currentTab+" Filter";
        $scope.drpdwnArrayList= [];
        $scope.select.tabDrpdwn= null;        
        httpService.get(tabDropdownListURL).then(function(response){
            var objArray= response.data;
            var appListArray= [];
            if(objArray.length>0){
                for(var i in objArray){
                    appListArray[i]= objArray[i][$scope.currentTab];
                }
                $scope.drpdwnArrayList= angular.copy(appListArray);
                $scope.select.tabDrpdwn= angular.copy($scope.drpdwnArrayList[0]);
                
                defaultLoad();
            }else{
                defaultLoad();
            }
        })   
    }

    function defaultLoad(){
        
        $scope.cdnSelect= $scope.select.cdn;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;

        switch($scope.currentTab){
            case 'Usage':
                
                $scope.exportCDNUsageObj= {};
                $scope.exportCDNUsageObj.fileName= "CDN Analytics_Usage";
                $scope.exportCDNUsageObj.fileHeader= "Usage Distribution for CDN "+$scope.cdnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var cdnRequestsURL= globalConfig.pullfilterdataurlbyname+"CDN Traffic for Date range&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&CDN="+$scope.select.cdn;
                cdnLine(cdnRequestsURL, 'Usage');
                break;
            
            case 'Throughput':
                
                $scope.TpmDist= {};
                $scope.TpmDist.fileName= 'CDN Analytics'+"_Throughput Distribution(Minute wise)"
                $scope.TpmDist.fileHeader= 'CDN Analytics'+"_Throughput Distribution(Minute wise) for "+$scope.cdnSelect+" date "+$scope.edate;

                var throughputDistributionURL= globalConfig.pullfilterdataurlbyname+"CDN Throughput per minute&fromDate="+$scope.date.end+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&CDN="+$scope.select.cdn;

                getThroughputDistribution(throughputDistributionURL);
                break;
            
            case 'TpBkt':
                
                $scope.TpBktUsgDist= {};
                $scope.TpBktUsgDist.fileName= 'CDN Analytics'+"_Throughput Bucket Subscribers Distribution"
                $scope.TpBktUsgDist.fileHeader= 'CDN Analytics'+"_Throughput Bucket Subscribers Distribution for "+$scope.cdnSelect+" date "+$scope.edate;

                var TpBktUsgDistURL= globalConfig.pullfilterdataurlbyname+"CDN wise Throughput Bucket distribution&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&CDN="+$scope.select.cdn;

                getTpBktUsgDist(TpBktUsgDistURL);
                break;
            
            case 'Area':
                
                $scope.exportAreaLatency= {};
                $scope.exportAreaLatency.fileName= 'CDN Analytics'+"_Area wise Throughput Bucket Distribution"
                $scope.exportAreaLatency.fileHeader= 'CDN Analytics'+"_Area wise Throughput Bucket Distribution for "+$scope.cdnSelect+" for "+$scope.currentTab+": "+$scope.select.tabDrpdwn+" between date "+$scope.sDate+" - "+$scope.edate;

                var areaLatencyURL= globalConfig.pullfilterdataurlbyname+"CDN-"+$scope.currentTab+" wise Throughput Bucket distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z&CDN="+$scope.select.cdn+"&"+$scope.currentTab+"="+encodeURIComponent($scope.select.tabDrpdwn);

                getTpBktUsgDist(areaLatencyURL);
                break;
            
            case 'Plan':
                
                $scope.exportPlanTp= {};
                $scope.exportPlanTp.fileName= 'CDN Analytics'+"_Area wise Throughput Bucket Distribution"
                $scope.exportPlanTp.fileHeader= 'CDN Analytics'+"_Area wise Throughput Bucket Distribution for "+$scope.cdnSelect+" for "+$scope.currentTab+": "+$scope.select.tabDrpdwn+" between date "+$scope.sDate+" - "+$scope.edate;

                var planLatencyURL= globalConfig.pullfilterdataurlbyname+"CDN-"+$scope.currentTab+" wise Throughput Bucket distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z&CDN="+$scope.select.cdn+"&"+$scope.currentTab+"="+$scope.select.tabDrpdwn;

                getTpBktUsgDist(planLatencyURL);
                break;
        }
  
    }
    
    getCDNList();
    
    //dateRange select event
    $scope.click= function(){
       defaultLoad();
    }
    
    //-------------------------------------------------------------------------
    
    
    //tab Selected event 
    $scope.tabSelected= function(tab){
        $scope.currentTab= tab;
        if(tab == 'Area' || tab== 'Plan'){
            getTabDrpDwn();
        }else
            defaultLoad();
    }

    //tab drodown select value event
    $scope.selectValue= function(){
        defaultLoad();
    }
}



// This function for Churn Data Analysis

function churnAnalyticsBBCtrl($scope, $rootScope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal){
    $scope.select= {};
    $scope.select.rowCount= '10';
    
    //track url starts
    utility.trackUrl();

    //end track url
    $scope.showTabObj= angular.copy(utility.tb.churnAnalytics)


    function getCurrentTab(){
        if($scope.showTabObj.Trend){
            $scope.currentTab= 'Trend';
            return $scope.currentTab;
        }
        else if($scope.showTabObj.OLT){
            $scope.currentTab= 'OLT';
            return $scope.currentTab;
        }
        else if($scope.showTabObj.Plan){
            $scope.currentTab= 'Plan';
            return $scope.currentTab;
        } 
        else if($scope.showTabObj.City){
            $scope.currentTab= 'City';
            return $scope.currentTab;
        } 
        else if($scope.showTabObj.Area){
            $scope.currentTab= 'Area';
            return $scope.currentTab;
        }
    }

    $scope.currentTab= getCurrentTab();

    function churnLine(url, key){
        var name;
        // if(key=="Requests")
            // name= 'Req';
        // else
        name= key;
        $scope['loadingChurn'+name+'Div']= true;
        $scope['dataChurn'+name+'Div']= false;
        $scope['noDataChurn'+name+'Div']= false;
        $scope['exportChurn'+name+'Data']= [];
        var dataArray= [], timeArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;

            
            if(objArray.length>0){
                var subscriberDataArray= [];
                
                // var exportArray= angular.copy(objArray);

                for(var i=0; i<objArray.length;i++){
                    subscriberDataArray[i]=  objArray[i].Subscriber;
                    // exportArray[i]['Usage(Bytes)']= exportArray[i].Usage;
                    // delete exportArray[i]['Usage'];
                }

                //console.log("objArray", objArray);

                // var FormattedusageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(usageDataArray, 1)
                for(var i=0;i<objArray.length; i++){
                    timeArray[i]= objArray[i].Date;
                   //var time_p = new Date(objArray[i].Date);
                   //var z = time_p.toISOString().substr(0,10)
                    dataArray[i]= [objArray[i].Date,subscriberDataArray[i]];
                } 

                
                var optionsLine= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                optionsLine.chart.type= 'spline';
                optionsLine.xAxis.labels.format= "{value:%e %b}";
                optionsLine.tooltip.pointFormat= 'Subscriber <b> {point.y}  </b>';
                optionsLine.yAxis.title.text=key+'(Subscribers)';
                // optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                // console.log("['DNS'+key+'ChartConfig']", 'DNS'+name+'ChartConfig');
                // console.log("dataArray", dataArray);

                $scope['Churn'+name+'ChartConfig']= {
                    "options" : optionsLine,
                    "series"  : [{
                                name: "Churn "+key,
                                color:"rgb(39, 174, 96)",
                                data: dataArray,
                                events:{
                                    click: function (event){
                                        $scope.exportSubList(event.point.options, event.point.series.name);
                                    }
                                }
                                
                               },
                              ] 
                }
                $scope['loadingChurn'+name+'Div']= false;
                $scope['dataChurn'+name+'Div']= true;
                $scope['noDataChurn'+name+'Div']= false;
                // $scope['exportChurn'+name+'Data']= angular.copy(exportArray);
            }else{
                $scope['loadingChurn'+name+'Div']= false;
                $scope['dataChurn'+name+'Div']= false;
                $scope['noDataChurn'+name+'Div']= true;
            }
        })
    }

    function getTpBktUsgDist(url,key){
        var TpBktDistributionUsersChartOptions= {};
        $scope.loadingTpBktDistributionDiv= true;
        $scope.DataTpBktDistributionDiv= false;
        $scope.noDataTpBktDistributionDiv= false;

        $scope.TpBktDistributionChartOptions= null;


        // THis is for multilien display on same page 

        var OLTDistributionUsageChartOptions= {};
        var OLTDistributionUsersChartOptions= {};
        $scope.loadingUsageDistributionDiv= true;
        $scope.DataUsageDistributionDiv= false;
        $scope.noDataUsageDistributionDiv= false;
        
        $scope.loadingUsersDistributionDiv= true;
        $scope.DataUsersDistributionDiv= false;
        $scope.noDataUsersDistributionDiv= false;

        $scope.usageDistributionChartConfig= null;
        $scope.usersDistributionChartOptions= null;


        // end of multiline varibale 

        if( url != null){
            httpService.get(url).then(function(response){
                    
                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
                    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Subscribers";
                    paramObject.seriesName= key;
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
                    
                    // console.log("paramObject", paramObject);
                    
                    var OLTDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                    OLTDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    OLTDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                    OLTDistributionUsersChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';                    
                    OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                    OLTDistributionUsersChartOptions.tooltip.shared= true;
                    OLTDistributionUsersChartOptions.chart.height= 400;
                    OLTDistributionUsersChartOptions.yAxis.title= {"text":"Subscribers "};

                    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;

                    OLTDistributionUsersChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(event, this);
                                console.log(this.options);
                                // var label = this.series.name;
                                var label_name = this.series.name;
                                // alert("data from selected OLT " + label)
                                var point_click_date = $filter('date')( this.category , "yyyy-MM-dd");
                                // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                                console.log('from', point_click_date)
                                displaySubList(point_click_date,label_name) 
                            }
                        }
                    };

                    $scope.TpBktDistributionChartOptions= {
                        options:OLTDistributionUsersChartOptions,
                        series:highchartProcessData.barColumnProcessHighchartData(paramObject),
                        
                    }                    
                    
                    
                    $scope.exportUsgDistArray= angular.copy(exportSubDistArray);
    
                    $scope.loadingTpBktDistributionDiv= false;
                    $scope.DataTpBktDistributionDiv= true;
                    $scope.noDataTpBktDistributionDiv= false;
                }else{
                    $scope.loadingTpBktDistributionDiv= false;
                    $scope.DataTpBktDistributionDiv= false;
                    $scope.noDataTpBktDistributionDiv= true;
                }
            })
        }

        // This is start of multipline diplay on page 

        if(url != null){
            httpService.get(url).then(function(response){
                    
                var OLTWiseUsageFormatArray= [], OLTWiseLabelArray= [], OLTWiseUsageData= [];
                var objArray= response.data;
                $scope.exportUsgDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportUsgDistArray= angular.copy(objArray);
                    // for(var i=0; i<exportUsgDistArray.length;i++){
                    //     for(var j in exportUsgDistArray[i]['data']){
                    //         exportUsgDistArray[i]['data'][j]['Usage(Bytes)']= exportUsgDistArray[i]['data'][j]['Usage'];
                    //         delete exportUsgDistArray[i]['data'][j]['Usage'];
                    //     }
                    // }
    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Subscribers";
                    paramObject.seriesName= key;
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
                    
                    // console.log("paramObject", paramObject);
                    
                    var OLTDistributionUsageChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                    OLTDistributionUsageChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                    OLTDistributionUsageChartOptions.chart.height= 400;
                    OLTDistributionUsageChartOptions.yAxis.title= {"text":"Subscribers"};
                    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
                    
                    $scope.usageDistributionChartConfig= {
                        options: OLTDistributionUsageChartOptions,
                        series: highchartProcessData.multilineProcessHighchartData(paramObject)
                    }
                    
                    $scope.exportUsgDistArray= angular.copy(exportUsgDistArray);
    
                    $scope.loadingUsageDistributionDiv= false;
                    $scope.DataUsageDistributionDiv= true;
                    $scope.noDataUsageDistributionDiv= false;
                }else{
                    $scope.loadingUsageDistributionDiv= false;
                    $scope.DataUsageDistributionDiv= false;
                    $scope.noDataUsageDistributionDiv= true;
                }
            })
        }


        // End of multipline diplay on page 




    }
    

    // This method is for display pop up when stack chart is clicked 

    function displaySubList(keyName,point_date,label_name){
        
        $rootScope.sDate= point_date;
        $rootScope.seriesName= keyName;

        var modelPath= null
        if(globalConfig.depType == 'F')
            modelPath = 'views/fixedLine/modelSubsListDownloadcopy.html' ;
        else
            modelPath = 'views/mobility/modelSubsListDownload.html' ;

        // model window
        var modalInstance = $uibModal.open({
            templateUrl: modelPath, //'views/static/modelSubsListDownload.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });  
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.loadingDiv= true;
            $scope.noDataDiv= false;

            var exportSubsListURL;

            switch(keyName){
                case'OLT' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+"Churn day wise OLT wise trend user list&fromDate="+$rootScope.sDate+"T00:00:00.000Z&dbPullType=query&granularity=0&OLT="+label_name;
                $scope.header= "Subscribers list for "+label_name+" OLT of "+ $rootScope.sDate
                break;

                case'Plan' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+"Churn day wise Plan wise trend user list&fromDate="+$rootScope.sDate+"T00:00:00.000Z&dbPullType=query&granularity=0&Plan="+label_name;
                $scope.header= "Subscribers list of "+label_name+" Plan for "+ $rootScope.sDate
                break;

                case'City' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+"Churn day wise City wise trend user list&fromDate="+$rootScope.sDate+"T00:00:00.000Z&dbPullType=query&granularity=0&City="+label_name;
                $scope.header= "Subscribers list of "+label_name+" City for "+ $rootScope.sDate
                break;

                case'Area' :
                exportSubsListURL =  globalConfig.pullfilterdataurlbyname+"Churn day wise Area wise trend user list&fromDate="+$rootScope.sDate+"T00:00:00.000Z&dbPullType=query&granularity=0&Area="+label_name;
                $scope.header= "Subscribers list of "+label_name+" Area for "+ $rootScope.sDate
                break;
            }

            var fileName=  "Subscribers list for "+$rootScope.seriesName;
            httpService.get(exportSubsListURL).then(function(response){
                var objArray= response.data;
                if(objArray.length>0){
                    $scope.SubListData= angular.copy(objArray);
                    console.log($scope.SubListData[0]['Date'])
                    $scope.exportSubList= angular.copy(objArray);
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= false;
                }
                else{
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= true;
                }

                for (var i=0;i<$scope.SubListData.length;i++){

                    var date = $scope.SubListData[i].Date;
                    var time_p = new Date(date);
                    var z = time_p.toISOString().substr(0,10);
                    $scope.SubListData[i].Date = z;
                    
                }
            })

            // redirect to subscribers details
            // $scope.stateGo= function(subID){
            //     console.log("subID", subID);
            //     var params={};
            //     params.toDate= $rootScope.edate;
            //     params.value= subID;
            //     params= JSON.stringify(params);

            //     $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
            //     /*$state.go('index.staticanalysis',{'params': params, 'file':'customerDetailsBB.html','id':null, 'name': 'Customer Details'});
            //     $scope.cancel();*/
            // }
        }  

    }


    // This method is for display a Pop when user clcik on line chart   
    $scope.exportSubList= function(options, seriesName){
        var time_p = new Date(options.x);
        var click_date = time_p.toISOString().substr(0,10);
        // console.log("seriesName", seriesName);

        $rootScope.pageName= $scope.pageName;
        $rootScope.label= $scope.label;
        $rootScope.sDate= click_date;
        console.log("claickabel date " + click_date)
        $rootScope.edate= $scope.edate;
        $rootScope.options= options;
        
        $rootScope.seriesName= seriesName;
        var modelPath= null
        if(globalConfig.depType == 'F')
            modelPath = 'views/fixedLine/modelSubsListDownloadcopy.html' ;
        else
            modelPath = 'views/mobility/modelSubsListDownload.html' ;
        

        // model window
        var modalInstance = $uibModal.open({
            templateUrl: modelPath, //'views/static/modelSubsListDownload.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.header= "Subscribers list for "+$rootScope.seriesName+" of "+ $rootScope.sDate

            $scope.loadingDiv= true;
            $scope.noDataDiv= false;

            var exportSubsListURL;

            switch(seriesName){
                case'Churn Trend' :
                // exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Users Plan Distribution for Selected '+ $rootScope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $rootScope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                exportSubsListURL =  globalConfig.pullfilterdataurlbyname+"Churn day wise trend user list&fromDate="+$rootScope.sDate+"T00:00:00.000Z&dbPullType=query&granularity=0"; 
                break;

                case'App' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Users App Distribution for Selected '+ $scope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $scope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;

                case'UsageBucket' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Users Usage Bucket Distribution for Selected '+ $scope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $scope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;

                case'Throughput' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Users Throughput Bucket Distribution for Selected '+ $scope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $scope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;

                case'PlanSpeed' :
                exportSubsListURL =  globalConfig.pullfilterdataurlbyname+'Users PlanSpeed Distribution for Selected '+ $scope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $scope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;
            }

            // var fileName=  "Subscribers list of "+seriesName+" "+options.name;
            httpService.get(exportSubsListURL).then(function(response){
                var objArray= response.data;
                if(objArray.length>0){
                    $scope.SubListData= angular.copy(objArray);
                    $scope.exportSubList= angular.copy(objArray);
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= false;
                }
                else{
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= true;
                }

                for (var i=0;i<$scope.SubListData.length;i++){

                    var date = $scope.SubListData[i].Date;
                    var time_p = new Date(date);
                    var z = time_p.toISOString().substr(0,10);
                    $scope.SubListData[i].Date = z;
                    
                }
            })

            // redirect to subscribers details
            // $scope.stateGo= function(subID){
            //     console.log("subID", subID);
            //     var params={};
            //     params.toDate= $rootScope.edate;
            //     params.value= subID;
            //     params= JSON.stringify(params);

            //     $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
            //     /*$state.go('index.staticanalysis',{'params': params, 'file':'customerDetailsBB.html','id':null, 'name': 'Customer Details'});
            //     $scope.cancel();*/
            // }
        }
    } 

    function defaultLoad(){
        $scope.sDate= $scope.date.start;
        $scope.edate = $scope.date.end;


        switch($scope.currentTab){ 
            case 'Trend':
                $scope.exportChurnObj= {};
                $scope.exportChurnObj.fileName= "Churn Analytics_Usage";
                var churnRequestsURL= globalConfig.pullfilterdataurlbyname+"Churn day wise user trend&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&granularity=0";                    
                churnLine(churnRequestsURL, 'Trend');
                break;
            
            case 'OLT':
                $scope.key = "OLT"
                $scope.TpmDist= {};
                $scope.TpmDist.fileName= 'OLT Analytics'+"_Throughput Distribution(Minute wise)"
                $scope.TpmDist.fileHeader= 'Churn Analytics'+"_Throughput Distribution(Minute wise) for "+$scope.cdnSelect+" date "+$scope.edate;

                var TpBktUsgDistURL= globalConfig.pullfilterdataurlbyname+"Churn day wise OLT wise user trend for top X&fromDate="+$scope.sDate+"T00:00:00.000Z&toDate="+$scope.edate+"T23:59:59.999Z&granularity=0&rowCount="+$scope.select.rowCount;

                getTpBktUsgDist(TpBktUsgDistURL,$scope.key);
                break;
            
            case 'Plan':
                $scope.key = "Plan"
                $scope.TpmDist= {};
                $scope.TpBktUsgDist= {};
                $scope.TpBktUsgDist.fileName= 'CDN Analytics'+"_Throughput Bucket Subscribers Distribution"
                $scope.TpBktUsgDist.fileHeader= 'CDN Analytics'+"_Throughput Bucket Subscribers Distribution for "+$scope.cdnSelect+" date "+$scope.edate;

                var TpBktUsgDistURL= globalConfig.pullfilterdataurlbyname+"Churn day wise Plan wise user trend for top X&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&granularity=0&rowCount="+$scope.select.rowCount;

                getTpBktUsgDist(TpBktUsgDistURL,$scope.key);
                break;
            
            case 'Area':
                $scope.key = "Area"
                $scope.TpmDist= {};
                $scope.exportAreaLatency= {};
                $scope.exportAreaLatency.fileName= 'CDN Analytics'+"_Area wise Throughput Bucket Distribution"
                $scope.exportAreaLatency.fileHeader= 'CDN Analytics'+"_Area wise Throughput Bucket Distribution for "+$scope.cdnSelect+" for "+$scope.currentTab+": "+$scope.select.tabDrpdwn+" between date "+$scope.sDate+" - "+$scope.edate;

                var areaLatencyURL= globalConfig.pullfilterdataurlbyname+"Churn day wise Area wise user trend for top X&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&granularity=0&rowCount="+$scope.select.rowCount;

                getTpBktUsgDist(areaLatencyURL,$scope.key);
                break;
            
            case 'City':
                $scope.key = "City"
                $scope.TpmDist= {};
                $scope.exportPlanTp= {};
                $scope.exportPlanTp.fileName= 'CDN Analytics'+"_Area wise Throughput Bucket Distribution"
                $scope.exportPlanTp.fileHeader= 'CDN Analytics'+"_Area wise Throughput Bucket Distribution for "+$scope.cdnSelect+" for "+$scope.currentTab+": "+$scope.select.tabDrpdwn+" between date "+$scope.sDate+" - "+$scope.edate;

                var planLatencyURL= globalConfig.pullfilterdataurlbyname+"Churn day wise City wise user trend for top X&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&granularity=0&rowCount="+$scope.select.rowCount;

                getTpBktUsgDist(planLatencyURL,$scope.key);
                break;
        }
  
    }   

    function getTabDrpDwn(){
    }

    defaultLoad();


  //dateRange select event
    $scope.click= function(){
       defaultLoad();
    }
    //-------------------------------------------------------------------------

 //tab Selected event 
 $scope.tabSelected= function(tab){
    $scope.currentTab= tab;
    if(tab == 'Area' || tab== 'City'){
        defaultLoad();
    }else
        defaultLoad();
}

//tab drodown select value event
$scope.selectValue= function(){
    defaultLoad();
}


}

//-----------------------------------------------------------------------------------------------------
// App Trend Analytics Controller
function appTrendBBCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, dbService, utility) {

    //track url starts
    utility.trackUrl();
    //end track url

    $scope.showTabObj= angular.copy(utility.tb.appTrend)

    function getCurrentTab(){
        if($scope.showTabObj.Usage){
            $scope.currentTab= 'Usage';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.visits){
            $scope.currentTab= 'Visits';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.Duration){
            $scope.currentTab= 'Duration';
            return $scope.currentTab;
        }
    }
    $scope.currentTab= getCurrentTab();

    // var currentTab= "Usage";
    var usageAppsMultilineURL, UsageAppsStackFirstDayURL, UsageAppsStackLastDayURL, visitsAppsMultilineURL , VisitsAppsStackFirstDayURL, VisitsAppsStackLastDayURL, durationAppsMultilineURL, DurationAppsStackFirstDayURL, DurationAppsStackLastDayURL;
    
    //--------------------------------------------------------------
    
    function AppsMultiline(url, tab){
        
        $scope.loadingAppsMultiineDiv= true;
        $scope.DataAppsMultiineDiv= false;
        $scope.noDataAppsMultiineDiv= false;  
        $scope.showBar= false;  
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            $scope.exportObjData= [];
            //console.log("multiline", objArray);
            if(objArray.length>0){
                
                var exportObjData= angular.copy(objArray);

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= tab;
                paramObject.seriesName= "App";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                paramObject.unit= "TB";
                
                var AppsMultiLineOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                AppsMultiLineOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);

                switch(tab){
                    case "Usage":
                        AppsMultiLineOptions.yAxis.title.text="Usage( TB )";
                        for(var i in exportObjData){
                            for(var j in exportObjData[i]['data']){
                                exportObjData[i]['data'][j]['Usage(Bytes)']= exportObjData[i]['data'][j]['Usage'];
                                delete exportObjData[i]['data'][j]['Usage'];
                            }
                        }
                        break;
                    case "Visits":
                        AppsMultiLineOptions.tooltip={pointFormat: '{series.name} : <b>{point.y:,.0f}</b>',"xDateFormat": "%e %b"};
                        AppsMultiLineOptions.yAxis.title.text="Count";
                        
                        break;
                    case "Duration":
                        for(var i in exportObjData){
                            for(var j in exportObjData[i]['data']){
                                exportObjData[i]['data'][j]['Duration(Hour)']= exportObjData[i]['data'][j]['Duration'];
                                delete exportObjData[i]['data'][j]['Duration'];
                            }
                        }

                        AppsMultiLineOptions.tooltip={pointFormat: '{series.name} : <b>{point.y:,.0f}</b>', "xDateFormat": "%e %b"};
                        AppsMultiLineOptions.yAxis.title.text="Duration( Hour )";
                        break;
                }
                AppsMultiLineOptions.chart.height= 400;
                
                // stacked bar first and last day
                var firstDay= $filter('date')( AppsMultiLineOptions.xAxis.categories[0] , "yyyy-MM-dd");
                var lastDay= $filter('date')( AppsMultiLineOptions.xAxis.categories[AppsMultiLineOptions.xAxis.categories.length-1], "yyyy-MM-dd");
                var firstDayURL, lastDayURL;
                
                firstDayURL= globalConfig.pullfilterdataurlbyname+"Top apps "+tab+ " Stacked"+"&fromDate="+firstDay+"T00:00:00.000Z";
                
                lastDayURL= globalConfig.pullfilterdataurlbyname+"Top apps "+tab+ " Stacked"+"&fromDate="+lastDay+"T00:00:00.000Z";
                AppsStackedBar(firstDayURL, lastDayURL, tab);
                // end stacked bar first and last day
                

                paramObject.flag= "series";
                $scope.AppsMultiineChartConfig= {
                    options: AppsMultiLineOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                $scope.exportObjData= angular.copy(exportObjData);

                $scope.loadingAppsMultiineDiv= false;
                $scope.DataAppsMultiineDiv= true;
                $scope.noDataAppsMultiineDiv= false;  
                $scope.showBar= true;  
            }
            else{
                $scope.loadingAppsMultiineDiv= false;
                $scope.DataAppsMultiineDiv= false;
                $scope.noDataAppsMultiineDiv= true;  
            }
        })
    }

    function AppsStackedBar(firstDayURL, lastDayURL, tab){
        
        $scope.loadingAppsBarDiv= true;
        $scope.DataAppsBarDiv= false;
        $scope.noDataAppsBarDiv= false;
        
        httpService.get(firstDayURL).then(function(response){
            var firstDayObjArray= response.data;
            //console.log("firstlength", firstDayObjArray[0].data.length);
             httpService.get(lastDayURL).then(function(response){
                 var lastDayObjArray= response.data;
                 //console.log("lastlength", lastDayObjArray[0].data);
                 var deviceArray= [], dateArray= [], barDataUsage= [];
                 
                 var firstDayDeviceArray= [], lastDayDeviceArray= [];
                 
                 if(firstDayObjArray.length && lastDayObjArray.length>0){
                     
                     dateArray[0]= firstDayObjArray[0].Date;
                     dateArray[1]= lastDayObjArray[0].Date;
                     
                     for(var i in firstDayObjArray[0].data){
                         deviceArray[i]= firstDayObjArray[0].data[i].App;
                         firstDayDeviceArray[i]= firstDayObjArray[0].data[i].App;
                     }
                     
                     for(var i in lastDayObjArray[0].data){
                         lastDayDeviceArray[i]= lastDayObjArray[0].data[i].App;
                     }
                     
                     
                     for(var i in lastDayObjArray[0].data){
                         
                         var deviceName= lastDayObjArray[0].data[i].App;
                         var index= $.inArray(deviceName, deviceArray);
                         if(index == -1)
                             deviceArray.push(deviceName);
                     }
                     //console.log("deviceArray", deviceArray)
                     for(var j= 0; j< deviceArray.length ; j++){
                         
                         if(deviceArray[j]==angular.isDefined(firstDayObjArray[0].data[j]) && deviceArray[j]==angular.isDefined(lastDayObjArray[0].data[j])){
                             
                             barDataUsage[j]=  {
                                 name: deviceArray[j],
                                 color: highchartProcessData.colorpallete[j],
                                 data: [firstDayObjArray[0].data[j][tab], lastDayObjArray[0].data[j][tab] ]
                             }
                             
                         }
                         else{
                             var deviceName= deviceArray[j];
                             var firstDayUsage,lastDayUsage;
                             
                             var indexFirstDay= $.inArray(deviceName, firstDayDeviceArray);
                             if(indexFirstDay != -1){
                                 //console.log("indexFirstDay", indexFirstDay);
                                 firstDayUsage= firstDayObjArray[0].data[indexFirstDay][tab]
                             }else{ 
                                 firstDayUsage= 0;
                             }
                             
                             var indexLastDay= $.inArray(deviceName, lastDayDeviceArray);
                             if(indexLastDay != -1){
                                 //console.log("indexLastDay", indexLastDay);
                                 lastDayUsage= lastDayObjArray[0].data[indexLastDay][tab]
                             }else{ 
                                 lastDayUsage= 0;
                             }
                             
                             barDataUsage[j]=  {
                                 name: deviceArray[j],
                                 color: highchartProcessData.colorpallete[j],
                                 data: [firstDayUsage, lastDayUsage ]
                             }
                         }
                     }
                     
                     var AppsBarChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                     AppsBarChartOptions.xAxis.categories= dateArray;
                     AppsBarChartOptions.chart.height= 400;
                     AppsBarChartOptions.legend={maxHeight: 60};
                     AppsBarChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: {point.percentage:.0f}%<br/>';
                     AppsBarChartOptions.plotOptions.column.dataLabels.formatter= function() {
                         return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                     };
                    
                     $scope.AppsBarChartConfig= {
                         options: AppsBarChartOptions,
                         series: angular.copy(barDataUsage)
                     }
                     
                     $scope.loadingAppsBarDiv= false;
                     $scope.DataAppsBarDiv= true;
                     $scope.noDataAppsBarDiv= false;
        
                 }
                 else{
                     $scope.loadingAppsBarDiv= false;
                     $scope.DataAppsBarDiv= false;
                     $scope.noDataAppsBarDiv= true;
        
                 }
             })
        })
    }

    function defaultLoad(){
        
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;
        
        switch($scope.currentTab){
                
            case 'Usage':
               
                $scope.exportAppUsgObj= {};
                $scope.exportAppUsgObj.fileName= 'App Trend_Apps Usage Distribution';
                $scope.exportAppUsgObj.fileHeader= "Apps Usage Distribution between "+$scope.sDate+" - "+$scope.edate;

                usageAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Usage Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";
                
                AppsMultiline(usageAppsMultilineURL, $scope.currentTab);
                break;
            
            case 'Visits':

                $scope.exportAppVisitsObj= {};
                $scope.exportAppVisitsObj.fileName= 'App Trend_Apps Visits Distribution';
                $scope.exportAppVisitsObj.fileHeader= "Apps Visits Distribution between "+$scope.sDate+" - "+$scope.edate;

                visitsAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Visits Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";
                
                AppsMultiline(visitsAppsMultilineURL, $scope.currentTab);
                break;
            
            case 'Duration':
                
                $scope.exportAppDurObj= {};
                $scope.exportAppDurObj.fileName= 'App Trend_Apps Duration Distribution';
                $scope.exportAppDurObj.fileHeader= "Apps Duration Distribution between "+$scope.sDate+" - "+$scope.edate;

                durationAppsMultilineURL= globalConfig.pullfilterdataurlbyname+"Top Apps Duration Multiline"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z";
                
                AppsMultiline(durationAppsMultilineURL, $scope.currentTab);
                break;
            
        }
    }
    
    defaultLoad();
    
    //Tab selected event
    
    $scope.tabSelected= function(tab){
        $scope.currentTab= tab;
        defaultLoad();
    }
    
    // Submit Click event
    $scope.click= function(){
       
        defaultLoad();
    }
}



// End App Trend Analytics Controller
//    ----------------------------------------------------------------------------

//BB App Performance (added to analytics) Ctrl
function appPerformanceBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,  highchartProcessData, highchartOptions, $stateParams, utility){
    
    //track url starts
    utility.trackUrl();
    //end track url

    $scope.showTabObj= angular.copy(utility.tb.appPerformance)

    function getCurrentTab(){
        if($scope.showTabObj.OLT){
            $scope.currentTab= 'OLT';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.Area){
            $scope.currentTab= 'Area';
            return $scope.currentTab;
        }

        else if($scope.showTabObj.Plan){
            $scope.currentTab= 'Plan';
            return $scope.currentTab;
        }
        else if($scope.showTabObj.Plan){
            $scope.currentTab= 'City';
            return $scope.currentTab;
        }
    }
    $scope.currentTab= getCurrentTab();

    $scope.select= {};
    // $scope.currentTab= 'OLT'
    var appListURL= globalConfig.pulldataurlbyname+"App Filter";
    
    httpService.get(appListURL).then(function(response){
        var objArray= response.data;
        var appListArray= [];
        if(objArray.length>0){
            for(var i in objArray){
                appListArray[i]= objArray[i]['App'];
            }
            $scope.appNameList= angular.copy(appListArray);
            $scope.select.app= angular.copy(appListArray[0]);
            getTabDrpDwn();
        }
    })

    $scope.loadingLatencyDistributionDiv= true;
    $scope.noDataLatencyDistributionDiv= false;
    
    function getLatencyData(url, series){
        $scope.loadingLatencyDistributionDiv= true;
        $scope.noDataLatencyDistributionDiv= false;

        $scope.latencyDistributionChartConfig= {};
        httpService.get(url).then(function(response){
            
            var OLTWiseUsageFormatArray= [], OLTWiseLabelArray= [], OLTWiseUsageData= [];
            var objArray= response.data;
            $scope.exportLatencyDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= series;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var OLTDistributionUsageChartOptions= angular.copy(highchartOptions.highchartMultilineLabelDatetimeOptions);
                OLTDistributionUsageChartOptions.xAxis.categories= highchartProcessData.multilineProcessHighchartData(paramObject);
                OLTDistributionUsageChartOptions.chart.height= 300;
                OLTDistributionUsageChartOptions.yAxis.title= {"text":"Sessions"};
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.latencyDistributionChartConfig= {
                    options: OLTDistributionUsageChartOptions,
                    series: highchartProcessData.multilineProcessHighchartData(paramObject)
                }
                
                $scope.exportLatencyDistribution= angular.copy(objArray);

                $scope.loadingLatencyDistributionDiv= false;
                $scope.noDataLatencyDistributionDiv= false;
            }else{
                $scope.loadingLatencyDistributionDiv= false;
                $scope.noDataLatencyDistributionDiv= true;
            }
        })
    }

    $scope.loadingCEIDistributionDiv= true;
    $scope.noDataCEIDistributionDiv= false;

    function getCEIData(url, key){
        var CEIDistributionChartOptions= {};
        $scope.loadingCEIDistributionDiv= true;
        $scope.noDataCEIDistributionDiv= false;
        
        $scope.CEIChartConfig= null;
        $scope.CEIDistributionChartOptions= {};
        httpService.get(url).then(function(response){
            var objArray= response.data;
            
            $scope.exportCEIDistribution= [];
            if(objArray.length>0){
                
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= key;
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";
                
                console.log("paramObject", paramObject);
                
                var CEIDistributionUsersChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                CEIDistributionUsersChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                CEIDistributionUsersChartOptions.yAxis.labels= {enabled: true};
                CEIDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.2f}% </b>';
                CEIDistributionUsersChartOptions.plotOptions.column.stacking= 'percent';
                CEIDistributionUsersChartOptions.legend.reversed= false;
                /*CEIDistributionUsersChartOptions.plotOptions.column.dataLabels.formatter= function() {
                        return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    };*/
                CEIDistributionUsersChartOptions.tooltip.shared= false;
                CEIDistributionUsersChartOptions.chart.height= 300;
                CEIDistributionUsersChartOptions.yAxis.title= {"text":""};
                CEIDistributionUsersChartOptions.yAxis.stackLabels.enabled= false;
                
                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.CEIDistributionChartOptions= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope.exportCEIDistribution= angular.copy(objArray);

                $scope.loadingCEIDistributionDiv= false;
                $scope.noDataCEIDistributionDiv= false;
            }else{
                $scope.loadingCEIDistributionDiv= false;
                $scope.noDataCEIDistributionDiv= true;
            }
        })
    }
    
    function getTabDrpDwn(){
        $scope.loadingCEIDistributionDiv= true;
        $scope.noDataCEIDistributionDiv= false;
        $scope.loadingLatencyDistributionDiv= true;
        $scope.noDataLatencyDistributionDiv= false;
        var tabDropdownListURL= null;
        if($scope.currentTab=='OLT')
            tabDropdownListURL= globalConfig.pulldataurlbyname+"Node Filter";
        else
            tabDropdownListURL= globalConfig.pulldataurlbyname+$scope.currentTab+" Filter";
        $scope.drpdwnArrayList= [];
        $scope.select.tabDrpdwn= null;        
        httpService.get(tabDropdownListURL).then(function(response){
            var objArray= response.data;
            var appListArray= [];
            if(objArray.length>0){
                for(var i in objArray){
                    if($scope.currentTab=='OLT')
                        appListArray[i]= objArray[i]['Node'];
                    else
                        appListArray[i]= objArray[i][$scope.currentTab];
                }
                $scope.drpdwnArrayList= angular.copy(appListArray);
                $scope.select.tabDrpdwn= angular.copy(appListArray[0]);
                defaultLoad();
            }else{
                defaultLoad();
            }
        })   
    }
    

    function defaultLoad(){
        $scope.appSelected= $scope.select.app;
        $scope.OLTSelected= $scope.select.tabDrpdwn;
        $scope.AreaSelected= $scope.select.tabDrpdwn;
        $scope.PlanSelected= $scope.select.tabDrpdwn;
        $scope.CitySelected= $scope.select.tabDrpdwn;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;
        
        $scope.eportObjLatency= {};
        $scope.eportObjLatency.fileName= 'App Performance'+"_"+$scope.currentTab+"_Latency Distribution";
        $scope.eportObjLatency.fileHeader= 'App Performance'+"_"+$scope.currentTab+"_Latency Distribution for App "+$scope.appSelected+" & "+$scope.currentTab+" "+$scope[$scope.currentTab+'Selected']+" between date "+$scope.sDate+" - "+$scope.edate;
                
        $scope.eportObjCEI= {};
        $scope.eportObjCEI.fileName= 'App Performance'+"_"+$scope.currentTab+"_CEI Distribution";
        $scope.eportObjCEI.fileHeader= 'App Performance'+"_"+$scope.currentTab+"_CEI Distribution for App "+$scope.appSelected+" & "+$scope.currentTab+" "+$scope[$scope.currentTab+'Selected']+" between date "+$scope.sDate+" - "+$scope.edate;

        var areaLatencyURL= globalConfig.pullfilterdataurlbyname+"App-"+$scope.currentTab+" wise Latency for date range"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z&App="+$scope.select.app+"&"+$scope.currentTab+"="+encodeURIComponent($scope.select.tabDrpdwn);
        var areaCEIURL= globalConfig.pullfilterdataurlbyname+"App-"+$scope.currentTab+" wise CEI for date range"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z&App="+$scope.select.app+"&"+$scope.currentTab+"="+encodeURIComponent($scope.select.tabDrpdwn);
                
        // if($scope.currentTab != 'Plan')
        getLatencyData(areaLatencyURL, "Latency");
        getCEIData(areaCEIURL, "CEI");
        
    }    
    //tab Selected event 
    $scope.tabSelected= function(tab){
        $scope.currentTab= tab;
        getTabDrpDwn();
    }

    //tab drodown select value event
    $scope.selectValue= function(){
        defaultLoad();
    }
    
    // daterange submit event
    $scope.click= function(){
        defaultLoad();
    }
}
//--------------------------------------------------------------------------------

// Top Country wise Usage added to report
function topCountryUsageBBCtrl($scope, $state, httpService, globalConfig, $filter,utility,  dataFormatter) {
    
    //track url starts
    utility.trackUrl();
    //end track url

    if(/Plan Usage/.test($scope.headerName)){
        $scope.models= "Plan Usage";
        $scope.title= "Plan Usage";
    }
    else if(/Plan Users/.test($scope.headerName) || /Plan Subscribers/.test($scope.headerName)){
        $scope.models= "Plan Users";
        $scope.title= "Plan Subscribers";
    }
    // else if(/Device Usage/.test($scope.headerName))
        // $scope.models= "Device Usage";
    // else if(/Device Users/.test($scope.headerName))
        // $scope.models= "Device Users";
    else if(/Area Usage/.test($scope.headerName)){
        $scope.models= "Area Usage";
        $scope.title= "Area Usage";
    }
    else if(/Area Users/.test($scope.headerName) || /Area Subscribers/.test($scope.headerName)){
        $scope.models= "Area Users";
        $scope.title= "Area Subscribers";
    }
    // else if(/City Usage/.test($scope.headerName))
        // $scope.models= "City Usage";
    // else if(/City Users/.test($scope.headerName))
        // $scope.models= "City Users";
    else if(/OLT Usage/.test($scope.headerName) || /DSLAM Usage/.test($scope.headerName)){
        $scope.models= "OLT Usage";
        $scope.title= "OLT Usage";
    }
    else if(/OLT Users/.test($scope.headerName) || /OLT Subscribers/.test($scope.headerName)|| /DSLAM Users/.test($scope.headerName) || /DSLAM Subscribers/.test($scope.headerName)){
        $scope.models= "OLT Users";
        $scope.title= "OLT Subscribers";
    }
    else if(/App Usage/.test($scope.headerName)){
        $scope.models= "App Usage";
        $scope.title= "App Usage";
    }
    else if(/App Users/.test($scope.headerName) || /App Subscribers/.test($scope.headerName)){
        $scope.models= "App Users";
        $scope.title= "App Subscribers";
    }
    // else if(/App Duration/.test($scope.headerName))
        // $scope.models= "App Duration";
    else if(/Country/.test($scope.headerName)){
        $scope.models= "Country Usage";
        $scope.title= "Country Usage";
    }
    else if(/Auth Failure/.test($scope.headerName) || /Authentication Failure/.test($scope.headerName)){
        $scope.models= "Authentication Failure";
        $scope.title= "Authentication Failure";
    }
    // else if(/App Sessions/.test($scope.headerName))
        // $scope.models= "App Sessions";
    
    // var fromDate= $filter('date')( new Date().getTime() -3*24*3600*1000 , "yyyy-MM-dd");
    // var toDate= $filter('date')( new Date().getTime() -24*3600*1000, "yyyy-MM-dd");
    // $scope.date= {"start": fromDate, "end": toDate};  

    var topModelsTableURL;
    $scope.select= {};
    $scope.select.rowCount= '10';
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
                var rowLength= ObjArray[0]['data'].length//$scope.rowCount;
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
                                    case 'Failure':{
                                        tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],0);
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
                                        case 'Failure':{
                                            tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],0);
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
                    console.log("tableData", tableData);
                }
                $scope.keysTopModel= angular.copy(tableData);
                console.log("keysTopModel", $scope.keysTopModel);
                $scope.topModelsObj= angular.copy(ObjArray);
                loadingDiv(false, true, false);
            }else{
                loadingDiv(false, false, true);
            }
        })
    }

    function defaultLoad(){
        
        var page= $scope.models;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;

        $scope.exportObj= {};
        $scope.exportObj.fileName= 'Top '+page;
        $scope.exportObj.fileHeader= 'Top '+page+'  between Date '+$scope.sDate+' - '+$scope.edate;

        switch(page){
            case 'Country Usage':
                // topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z";
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                    topModelsTable(topModelsTableURL);
                break;
            case 'Authentication Failure':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top Subscriber "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                    topModelsTable(topModelsTableURL);
                break;
            case 'App Usage':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                topModelsTable(topModelsTableURL);
                break;
            case 'App Users':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                topModelsTable(topModelsTableURL);
                break;
            case 'OLT Usage':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                topModelsTable(topModelsTableURL);
                break;
            case 'OLT Users':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                topModelsTable(topModelsTableURL);
                break;
            case 'Area Usage':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                topModelsTable(topModelsTableURL);
                break;
            case 'Area Users':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                topModelsTable(topModelsTableURL);
                break;
            case 'Plan Usage':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                topModelsTable(topModelsTableURL);
                break;
            case 'Plan Users':
                topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
                topModelsTable(topModelsTableURL);
                break;
        }
    }
    
    defaultLoad();

    // DateRange Submit event
    $scope.click= function(){
        defaultLoad();
    }
    
    $scope.selectValue= function(){
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

// End of Top countery Usage 

// This module for authentication failure radius

function radiusAccountingTerminationBBCtrl($scope, $state, httpService, globalConfig, $filter,utility,  dataFormatter) {
    
    //track url starts
    utility.trackUrl();  

    var topModelsTableURL;
    $scope.select= {};
    $scope.select.rowCount= '10';
    function loadingDiv(loadingDivStatus,dataDivStatus, noDataDivStatus){
        $scope.loadingDiv= loadingDivStatus;
        $scope.dataDiv= dataDivStatus;
        $scope.noDataDiv= noDataDivStatus;
    }

    function topModelsTable(url){
        loadingDiv(true, false, false);

        httpService.get(url).then(function(response){
            // var ObjArray= response.data;
            
            var ObjArray = JSON.parse(' { "Failures" : 5278 , "Account is not active" : 5252 , "Policy Failed" : 12 , "Max Login Limit Reached" : 11 , "Authentication Failed due to Invalid Password" : 3 , "Subscriber" : "C2100129494" , "Status" : "DEACTIVATED"} ')
            if(ObjArray.length>0){
                var rowLength= ObjArray[0]['data'].length//$scope.rowCount;
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
                                    case 'Failure':{
                                        tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],0);
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
                                        case 'Failure':{
                                            tabData[++index]= dataFormatter.formatCountData(ObjArray[j].data[i][keysTopModelArray[l]],0);
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
                    console.log("tableData", tableData);
                }
                $scope.keysTopModel= angular.copy(tableData);
                console.log("keysTopModel", $scope.keysTopModel);
                $scope.topModelsObj= angular.copy(ObjArray);
                loadingDiv(false, true, false);
            }else{
                loadingDiv(false, false, true);
            }
        })
    }

    function defaultLoad(){
        
        var page= $scope.models;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;

        $scope.exportObj= {};
        $scope.exportObj.fileName= 'Top '+page;
        $scope.exportObj.fileHeader= 'Top '+page+'  between Date '+$scope.sDate+' - '+$scope.edate;

        // switch(page){
        //     case 'Country Usage':
        //         // topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z";
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //             topModelsTable(topModelsTableURL);
        //         break;
        //     case 'Authentication Failure':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top Subscriber "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //             topModelsTable(topModelsTableURL);
        //         break;
        //     case 'App Usage':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //         topModelsTable(topModelsTableURL);
        //         break;
        //     case 'App Users':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //         topModelsTable(topModelsTableURL);
        //         break;
        //     case 'OLT Usage':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //         topModelsTable(topModelsTableURL);
        //         break;
        //     case 'OLT Users':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //         topModelsTable(topModelsTableURL);
        //         break;
        //     case 'Area Usage':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //         topModelsTable(topModelsTableURL);
        //         break;
        //     case 'Area Users':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //         topModelsTable(topModelsTableURL);
        //         break;
        //     case 'Plan Usage':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //         topModelsTable(topModelsTableURL);
        //         break;
        //     case 'Plan Users':
        //         topModelsTableURL= globalConfig.pullfilterdataurlbyname+"Report Top "+$scope.models+" Daily&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&rowCount="+$scope.select.rowCount;
        //         topModelsTable(topModelsTableURL);
        //         break;
        // }
    }
    
    defaultLoad();

    // DateRange Submit event
    $scope.click= function(){
        defaultLoad();
    }
    
    $scope.selectValue= function(){
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
// End module for authentication failure radius


function radiusAuthenticationBBCtrl($scope, $state, httpService, globalConfig, $filter,utility, dataFormatter) {
    
    //track url starts
    utility.trackUrl();
    //end track url

    var topModelsTableURL;
    $scope.select= {};
    $scope.select.rowCount= '50';
    function loadingDiv(loadingDivStatus,dataDivStatus, noDataDivStatus){
        $scope.loadingDiv= loadingDivStatus;
        $scope.dataDiv= dataDivStatus;
        $scope.noDataDiv= noDataDivStatus;
    }

    function topModelsTable(url){
        loadingDiv(true, false, false);

        httpService.get(url).then(function(response){
            var ObjArray= response.data;
            var keysTopModelArray = ["Subscriber", "Status", "Failures","Account is not active","Max Login Limit Reached","Policy Failed","Authentication Failed due to Invalid Password"];        

            $scope.colHeader= angular.copy(keysTopModelArray);

            if(ObjArray.length>0){
                var rowLength= ObjArray.length//$scope.rowCount;
                $scope.colSpan= keysTopModelArray.length

                for(var i=0; i<rowLength; i++)
                {
                    var key_value = {};
                    
                    for (var j=0;j<keysTopModelArray.length;j++){
                        if ((keysTopModelArray[j] in ObjArray[i])){ 
                            key_value[keysTopModelArray[j]] = ObjArray[i][keysTopModelArray[j]]                    
                        }
                        else{
                            key_value[keysTopModelArray[j]] = "-"
                        }
                    }

                    ObjArray[i] = key_value

                }
                $scope.keysTopModel= angular.copy(ObjArray);
                $scope.topModelsObj= angular.copy($scope.keysTopModel);
                loadingDiv(false, true, false);
            }else{
                loadingDiv(false, false, true);
            }
        })
    }

    function defaultLoad(){
        
        var page= $scope.models;
        $scope.sDate= $scope.dateSelect;

        $scope.exportObj= {};
        $scope.exportObj.fileName= 'Top '+page;
        $scope.exportObj.fileHeader= 'Top '+page+'  between Date '+$scope.sDate

        topModelsTableURL= globalConfig.pullfilterdataurlbyname+"User wise Authentication failure reason count&fromDate="+$scope.sDate+"T00:00:00.000Z&granularity=0&rowCount="+$scope.select.rowCount;
        topModelsTable(topModelsTableURL);
    }
    
    defaultLoad();

    $scope.click= function(){
        
        defaultLoad();
    }

    //  date change event
    $scope.changeDate=function (modelName, newDate) {
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
        // defaultLoad();
     }

    //Export Nested Object
    $scope.expotNestedjsonObj= function(displayData, type, name) {
        
        $scope.getNestedExport(displayData, type, name);
    }


    //Download transaction detail day wise
    $scope.getTransactionDaywise= function($http, toaster, $timeout){
        var today= new Date();
        $scope.select.rowCount = 5000;
        $scope.sDate= $scope.date.start;

        var downloadURL= globalConfig.pullfilterdataurlbyname+"User wise Authentication failure reason count&fromDate="+$scope.date.start+"T00:00:00.000Z&granularity=0&rowCount="+$scope.select.rowCount+"&mode=download";
        
        httpService.get(downloadURL).then(function(response){
            alert(response.data + " and please cheack your alert box ")
        })

    }
}



 //Top Models Ctrl ends   
//-----------------------------------------------------------------------------------------------------

//Top Subscribers Analytics controller
function topSubscribersBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window,$rootScope,$uibModal, $location,  highchartProcessData, highchartOptions, utility){
    
    //track url starts
    utility.trackUrl();
    //end track url

    $scope.select= {};
    $scope.select.cust_Count= '50';
    
    $scope.planUsageData= [];
    $scope.planUsageHeaderData= [];
    $scope.loadingPlanUsageDiv= true; 
    $scope.noDataPlanUsageDiv= false;

    function getData(url, divObj){
        
        $scope[divObj.loadingDiv]= true; 
        $scope[divObj.noDataDiv]= false;
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            // console.log("objArray", objArray);
            if(objArray.length>0){

                $scope[divObj.exportData]= angular.copy(objArray);

                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){
                    pieChartArray[i]= {
                        name: objArray[i][divObj.Label], 
                        y: parseFloat(objArray[i].Subscribers),
                        color: globalConfig.colorpaletteBarChart[i]
                    };
                }

                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                pieChartOpt.plotOptions.pie.dataLabels.style.color= globalConfig.colorpalette;
                pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.y:.0f}';
                pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.y:.0f}</b>';
                // pieChartOpt.plotOptions.title = "Plan Information";

                $scope[divObj.chartConfig]= {
                    "options" : pieChartOpt,
                    series: [{
                        name: divObj.Label,
                        colorByPoint: true,
                        data: pieChartArray,
                        events:{
                            click: function (event){
                                $scope.exportSubList(event.point.options, event.point.series.name);
                            }
                        }
                    }]
                }
                $scope[divObj.loadingDiv]= false; 
                $scope[divObj.noDataDiv]= false;
            }
            else{
                $scope[divObj.loadingDiv]= false; 
                $scope[divObj.noDataDiv]= true;
            }
        })
    }

    function defaultLoad(){

        
        $scope.cust_Count= $scope.select.cust_Count;
        $scope.sDate= $scope.date.start;
        $scope.edate= $scope.date.end;
        
        //plan distribution
        var planDistributionURL = globalConfig.pullfilterdataurlbyname+'Top X Users Plan Distribution'+"&fromDate="+$scope.date.start+'T00:00:00.000Z&toDate='+$scope.date.end+'T23:59:59.999Z'+"&rowCount="+$scope.select.cust_Count;

        $scope.exportPlanDist= {};
        $scope.exportPlanDist.fileName= 'Top Subscribers_Plan Distribution';
        $scope.exportPlanDist.fileHeader= "Plan Distribution for Top "+$scope.cust_Count+" Subscribers  between Date "+$scope.sDate+" - "+$scope.edate;

        var planObj= {};
        planObj.loadingDiv= 'loadingPlanDistributionDiv';
        planObj.noDataDiv= 'noDataPlanDistributionDiv';
        planObj.chartConfig= 'PlanDistributionChartConfig';
        planObj.exportData= 'exportPlanDistData';
        planObj.Label= "Plan";
        getData(planDistributionURL, planObj)

        //app distribution
        var appDistributionURL = globalConfig.pullfilterdataurlbyname+'Top X Users App Distribution'+"&fromDate="+$scope.date.start+'T00:00:00.000Z&toDate='+$scope.date.end+'T23:59:59.999Z'+"&rowCount="+$scope.select.cust_Count;

        $scope.exportAppDist= {};
        $scope.exportAppDist.fileName= 'Top Subscribers_App Distribution';
        $scope.exportAppDist.fileHeader= "App Distribution for Top "+$scope.cust_Count+" Subscribers  between Date "+$scope.sDate+" - "+$scope.edate;

        var appObj= {};
        appObj.loadingDiv= 'loadingAppDistributionDiv';
        appObj.noDataDiv= 'noDataAppDistributionDiv';
        appObj.chartConfig= 'appDistributionChartConfig';
        appObj.exportData= 'exportAppDistData';
        appObj.Label= "App";
        // getData(appDistributionURL, appObj)

        //usage bucket distribution
        var usageDistributionURL = globalConfig.pullfilterdataurlbyname+'Top X Users Usage Bucket Distribution'+"&fromDate="+$scope.date.start+'T00:00:00.000Z&toDate='+$scope.date.end+'T23:59:59.999Z'+"&rowCount="+$scope.select.cust_Count;

        $scope.exportUsgBktDist= {};
        $scope.exportUsgBktDist.fileName= 'Top Subscribers_Usage Bucket Distribution';
        $scope.exportUsgBktDist.fileHeader= "Usage Bucket Distribution for Top "+$scope.cust_Count+" Subscribers  between Date "+$scope.sDate+" - "+$scope.edate;

        var usageDistributionObj= {};
        usageDistributionObj.loadingDiv= 'loadingUsageBucketDiv';
        usageDistributionObj.noDataDiv= 'noDataUsageBucketDiv';
        usageDistributionObj.chartConfig= 'usageBucketChartConfig';
        usageDistributionObj.exportData= 'exportUsgBktData';
        usageDistributionObj.Label= "UsageBucket";
        getData(usageDistributionURL, usageDistributionObj)

        //throughput bucket distribution
        var throughputDistributionURL = globalConfig.pullfilterdataurlbyname+'Top X Users Throughput Bucket Distribution'+"&fromDate="+$scope.date.start+'T00:00:00.000Z&toDate='+$scope.date.end+'T23:59:59.999Z'+"&rowCount="+$scope.select.cust_Count;

        $scope.exportTpBktDist= {};
        $scope.exportTpBktDist.fileName= 'Top Subscribers_Throughput Bucket Distribution';
        $scope.exportTpBktDist.fileHeader= "Throughput Bucket Distribution for Top "+$scope.cust_Count+" Subscribers  between Date "+$scope.sDate+" - "+$scope.edate;

        var throughputDistributionObj= {};
        throughputDistributionObj.loadingDiv= 'loadingThroughputDistributionDiv';
        throughputDistributionObj.noDataDiv= 'noDataThroughputDistributionDiv';
        throughputDistributionObj.chartConfig= 'ThroughputDistributionChartConfig';
        throughputDistributionObj.exportData= 'exportTpBktData';
        throughputDistributionObj.Label= "Throughput";
        getData(throughputDistributionURL, throughputDistributionObj)

        //CEI distribution
        var CEIDistributionURL = globalConfig.pullfilterdataurlbyname+'Top X Users CEI Distribution'+"&fromDate="+$scope.date.start+'T00:00:00.000Z&toDate='+$scope.date.end+'T23:59:59.999Z'+"&rowCount="+$scope.select.cust_Count;

        $scope.exportAppUsgObj= {};
        $scope.exportAppUsgObj.fileName= 'Top Subscribers_Plan Distribution';
        $scope.exportAppUsgObj.fileHeader= "Plan Distribution for Top "+$scope.cust_Count+" Subscribers  between Date "+$scope.sDate+" - "+$scope.edate;

        var CEIDistributionObj= {};
        CEIDistributionObj.loadingDiv= 'loadingCEIDistributionDiv';
        CEIDistributionObj.noDataDiv= 'noDataCEIDistributionDiv';
        CEIDistributionObj.chartConfig= 'CEIDistributionChartConfig';
        CEIDistributionObj.exportData= 'exportCEIDistribution';
        CEIDistributionObj.Label= "CEI";
        // getData(CEIDistributionURL, CEIDistributionObj)

        //plan speed distribution
        var planSpeedDistributionURL = globalConfig.pullfilterdataurlbyname+'Top X Users PlanSpeed Distribution'+"&fromDate="+$scope.date.start+'T00:00:00.000Z&toDate='+$scope.date.end+'T23:59:59.999Z&Plan='+$scope.select.plan+"&rowCount="+$scope.select.cust_Count;

        $scope.exportPlanSpdDist= {};
        $scope.exportPlanSpdDist.fileName= 'Top Subscribers_Plan Speed Distribution';
        $scope.exportPlanSpdDist.fileHeader= "Plan Speed Distribution for Top "+$scope.cust_Count+" Subscribers  between Date "+$scope.sDate+" - "+$scope.edate;

        var planSpeedDistributionObj= {};
        planSpeedDistributionObj.loadingDiv= 'loadingPlanSpeedDiv';
        planSpeedDistributionObj.noDataDiv= 'noDataPlanSpeedDiv';
        planSpeedDistributionObj.chartConfig= 'planSpeedChartConfig';
        planSpeedDistributionObj.exportData= 'exportPlanSpdData';
        planSpeedDistributionObj.Label= "PlanSpeed";
        getData(planSpeedDistributionURL, planSpeedDistributionObj)
       
    }
    defaultLoad();

    //export pie segment
    $scope.exportSubList= function(options, seriesName){
        console.log("options", options);
        console.log("seriesName", seriesName);

        $rootScope.topCount= $scope.cust_Count;
        $rootScope.sDate= $scope.sDate;
        $rootScope.edate= $scope.edate;
        var modelPath= null
        if(globalConfig.depType == 'F')
            modelPath = 'views/fixedLine/modelSubsListDownload.html' ;
        else
            modelPath = 'views/mobility/modelSubsListDownload.html' ;

        // model window
        var modalInstance = $uibModal.open({
            templateUrl: modelPath,//'views/static/modelSubsListDownload.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.title= "Top "+$rootScope.topCount+" Subscribers list for "+seriesName+" "+options.name;
            $scope.header= "Top "+$rootScope.topCount+" Subscribers list for "+seriesName+" '"+options.name+"' between Date "+$rootScope.sDate+" - "+$rootScope.edate;
            $scope.loadingDiv= true;
            $scope.noDataDiv= false;

            var exportSubsListURL;

            switch(seriesName){
                case'Plan' :
                    exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Top X Users Plan Distribution Export'+"&fromDate="+$rootScope.sDate+'T00:00:00.000Z&toDate='+$rootScope.edate+'T23:59:59.999Z'+"&rowCount="+$rootScope.topCount+"&"+seriesName+"="+encodeURIComponent(options.name);
                    break;

                    case'App' :
                    exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Top X Users App Distribution Export'+"&fromDate="+$rootScope.sDate+'T00:00:00.000Z&toDate='+$rootScope.edate+'T23:59:59.999Z'+"&rowCount="+$rootScope.topCount+"&"+seriesName+"="+encodeURIComponent(options.name);
                    break;

                    case'UsageBucket' :
                    exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Top X Users Usage Bucket Distribution Export'+"&fromDate="+$rootScope.sDate+'T00:00:00.000Z&toDate='+$rootScope.edate+'T23:59:59.999Z'+"&rowCount="+$rootScope.topCount+"&"+seriesName+"="+encodeURIComponent(options.name);
                    break;

                    case'Throughput' :
                    exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Top X Users Throughput Bucket Distribution Export'+"&fromDate="+$rootScope.sDate+'T00:00:00.000Z&toDate='+$rootScope.edate+'T23:59:59.999Z'+"&rowCount="+$rootScope.topCount+"&"+seriesName+"="+encodeURIComponent(options.name);
                    break;

                    case'PlanSpeed' :
                    exportSubsListURL =  globalConfig.pullfilterdataurlbyname+'Top X Users PlanSpeed Distribution Export'+"&fromDate="+$rootScope.sDate+'T00:00:00.000Z&toDate='+$rootScope.edate+'T23:59:59.999Z'+"&rowCount="+$rootScope.topCount+"&"+seriesName+"="+encodeURIComponent(options.name);
                    break;
                }

            httpService.get(exportSubsListURL).then(function(response){
                var objArray= response.data;
                if(objArray.length>0){
                    $scope.SubListData= angular.copy(objArray);
                    $scope.exportSubList= angular.copy(objArray);
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= false;
                }
                else{
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= true;
                }
            })

            // redirect to subscribers details
            $scope.stateGo= function(subID){
                console.log("subID", subID);
                var params={};
                params.toDate= $rootScope.edate;
                params.value= subID;
                params= JSON.stringify(params);
                $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
                /*$state.go('index.staticanalysis',{'params': params, 'file':'customerDetailsBB.html','id':null, 'name': 'Subscriber Details'})
                $scope.cancel();*/

               
            }
        }
    }

    //dateRange select event
    $scope.click= function(){
        
        defaultLoad();
    }
}

// End Top Subscribers Analytics controller
//------------------------------------------------------------------------




//Customer Analytics Distribution controller(Redirect from customer analytics)
function customerAnalyticsDistributionBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions, $stateParams,$rootScope, $uibModal){
    
    //track url starts
    utility.trackUrl();
    //end track url

    if($stateParams.hasOwnProperty('params') && $stateParams.params != null)
        if($stateParams.params.Key== 'UsageBucket')
            $scope.pageName=  'Usage';
        else    
            $scope.pageName=  $stateParams.params.Key;

    $scope.select= {};
    $scope.select.cust_Count= '10';
    $scope.backTitle= $stateParams.params.pageHeading;

    $scope.planUsageData= [];
    $scope.planUsageHeaderData= [];
    $scope.loadingPlanUsageDiv= true; 
    $scope.noDataPlanUsageDiv= false;

    function getData(url, divObj){
        
        $scope[divObj.loadingDiv]= true; 
        $scope[divObj.noDataDiv]= false;
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            // console.log("objArray", objArray);
            if(objArray.length>0){

                $scope[divObj.exportData]= angular.copy(objArray);

                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){
                    pieChartArray[i]= {
                        name: objArray[i][divObj.Label], 
                        y: parseFloat(objArray[i].Subscribers),
                        color: globalConfig.colorpaletteBarChart[i]
                    };
                }
                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                pieChartOpt.plotOptions.pie.dataLabels.style.color= globalConfig.colorpalette;
                pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.y:.0f}';
                pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.y:.0f}</b>';

                $scope[divObj.chartConfig]= {
                    "options" : pieChartOpt,
                    series: [{
                        name: divObj.Label,
                        colorByPoint: true,
                        data: pieChartArray,
                        events:{
                            click: function (event){
                                $scope.exportSubList(event.point.options, event.point.series.name);
                            }
                        }
                    }]
                }

                $scope[divObj.loadingDiv]= false; 
                $scope[divObj.noDataDiv]= false;
            }
            else{
                $scope[divObj.loadingDiv]= false; 
                $scope[divObj.noDataDiv]= true;
            }
        })
    }

    function getURL(pageName){

        if(pageName != 'Plan'){
            var planDistributionURL = globalConfig.pullfilterdataurlbyname+'Users Plan Distribution for Selected '+pageName+' Bucket'+$stateParams.filterParams+'&'+pageName+'Bucket='+encodeURIComponent($stateParams.params.label);
            var planObj= {};
            planObj.loadingDiv= 'loadingPlanDistributionDiv';
            planObj.noDataDiv= 'noDataPlanDistributionDiv';
            planObj.chartConfig= 'PlanDistributionChartConfig';
            planObj.exportData= 'exportPlanDistribution';
            planObj.Label= "Plan";
            getData(planDistributionURL, planObj)
        }

        /*if(pageName != 'App'){
            var appDistributionURL = globalConfig.pullfilterdataurlbyname+'Users App Distribution for Selected '+pageName+' Bucket'+$stateParams.filterParams+'&'+pageName+'Bucket='+encodeURIComponent($stateParams.params.label);
            var appObj= {};
            appObj.loadingDiv= 'loadingAppDistributionDiv';
            appObj.noDataDiv= 'noDataAppDistributionDiv';
            appObj.chartConfig= 'appDistributionChartConfig';
            appObj.exportData= 'exportAppDistribution';
            appObj.Label= "App";
            getData(appDistributionURL, appObj)
        }*/

        if(pageName != 'Usage'){
            var usageDistributionURL = globalConfig.pullfilterdataurlbyname+'Users Usage Bucket Distribution for Selected '+pageName+' Bucket'+$stateParams.filterParams+'&'+pageName+'Bucket='+encodeURIComponent($stateParams.params.label);
            var usageDistributionObj= {};
            usageDistributionObj.loadingDiv= 'loadingUsageBucketDiv';
            usageDistributionObj.noDataDiv= 'noDataUsageBucketDiv';
            usageDistributionObj.chartConfig= 'usageBucketChartConfig';
            usageDistributionObj.exportData= 'exportUsageBucketDistribution';
            usageDistributionObj.Label= "UsageBucket";
            getData(usageDistributionURL, usageDistributionObj)
            }

        if(pageName != 'Throughput'){
            var throughputDistributionURL = globalConfig.pullfilterdataurlbyname+'Users Throughput Bucket Distribution for Selected '+pageName+' Bucket'+$stateParams.filterParams+'&'+pageName+'Bucket='+encodeURIComponent($stateParams.params.label);
            var throughputDistributionObj= {};
            throughputDistributionObj.loadingDiv= 'loadingThroughputDistributionDiv';
            throughputDistributionObj.noDataDiv= 'noDataThroughputDistributionDiv';
            throughputDistributionObj.chartConfig= 'ThroughputDistributionChartConfig';
            throughputDistributionObj.exportData= 'exportThroughputDistribution';
            throughputDistributionObj.Label= "Throughput";
            getData(throughputDistributionURL, throughputDistributionObj)
        }

        if(pageName != 'CEI'){
            var CEIDistributionURL = globalConfig.pullfilterdataurlbyname+'Users CEI Distribution for Selected '+pageName+' Bucket'+$stateParams.filterParams+'&'+pageName+'Bucket='+encodeURIComponent($stateParams.params.label);
            var CEIDistributionObj= {};
            CEIDistributionObj.loadingDiv= 'loadingCEIDistributionDiv';
            CEIDistributionObj.noDataDiv= 'noDataCEIDistributionDiv';
            CEIDistributionObj.chartConfig= 'CEIDistributionChartConfig';
            CEIDistributionObj.exportData= 'exportCEIDistribution';
            CEIDistributionObj.Label= "CEI";
            getData(CEIDistributionURL, CEIDistributionObj)
        }

        if(pageName != 'planSpeed'){
            var planSpeedDistributionURL = globalConfig.pullfilterdataurlbyname+'Users PlanSpeed Distribution for Selected '+pageName+' Bucket'+$stateParams.filterParams+'&'+pageName+'Bucket='+encodeURIComponent($stateParams.params.label);
            var planSpeedDistributionObj= {};
            planSpeedDistributionObj.loadingDiv= 'loadingPlanSpeedDiv';
            planSpeedDistributionObj.noDataDiv= 'noDataPlanSpeedDiv';
            planSpeedDistributionObj.chartConfig= 'planSpeedChartConfig';
            planSpeedDistributionObj.exportData= 'exportPlanSpeedDistribution';
            planSpeedDistributionObj.Label= "PlanSpeed";
            getData(planSpeedDistributionURL, planSpeedDistributionObj)
        }
    }

    $scope.exportSubList= function(options, seriesName){
        // console.log("options", options);
        // console.log("seriesName", seriesName);
        $rootScope.pageName= $scope.pageName;
        $rootScope.label= $scope.label;
        $rootScope.sDate= $scope.sDate;
        $rootScope.edate= $scope.edate;
        $rootScope.options= options;
        $rootScope.seriesName= seriesName;
        var modelPath= null
        if(globalConfig.depType == 'F')
            modelPath = 'views/fixedLine/modelSubsListDownload.html' ;
        else
            modelPath = 'views/mobility/modelSubsListDownload.html' ;

        // model window
        var modalInstance = $uibModal.open({
            templateUrl: modelPath, //'views/static/modelSubsListDownload.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.title= "Subscribers list for "+$rootScope.seriesName+" "+$rootScope.options.name;
            $scope.header= "Subscribers list for "+$rootScope.seriesName+" '"+$rootScope.options.name+"' for "+$rootScope.pageName+" '"+$rootScope.label+"'  between Date "+$rootScope.sDate+" - "+$rootScope.edate;
            $scope.loadingDiv= true;
            $scope.noDataDiv= false;

            var exportSubsListURL;

            switch(seriesName){
                case'Plan' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Users Plan Distribution for Selected '+ $rootScope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $rootScope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;

                case'App' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Users App Distribution for Selected '+ $scope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $scope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;

                case'UsageBucket' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Users Usage Bucket Distribution for Selected '+ $scope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $scope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;

                case'Throughput' :
                exportSubsListURL = globalConfig.pullfilterdataurlbyname+'Users Throughput Bucket Distribution for Selected '+ $scope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $scope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;

                case'PlanSpeed' :
                exportSubsListURL =  globalConfig.pullfilterdataurlbyname+'Users PlanSpeed Distribution for Selected '+ $scope.pageName+' Bucket Export'+$stateParams.filterParams+'&'+ $scope.pageName+'Bucket='+encodeURIComponent($stateParams.params.label)+"&"+seriesName+"="+encodeURIComponent(options.name);
                break;
            }

            var fileName=  "Subscribers list for "+seriesName+" "+options.name;
            httpService.get(exportSubsListURL).then(function(response){
                var objArray= response.data;
                if(objArray.length>0){
                    $scope.SubListData= angular.copy(objArray);
                    $scope.exportSubList= angular.copy(objArray);
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= false;
                }
                else{
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= true;
                }
            })

            // redirect to subscribers details
            $scope.stateGo= function(subID){
                console.log("subID", subID);
                var params={};
                params.toDate= $rootScope.edate;
                params.value= subID;
                params= JSON.stringify(params);

                $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
                /*$state.go('index.staticanalysis',{'params': params, 'file':'customerDetailsBB.html','id':null, 'name': 'Customer Details'});
                $scope.cancel();*/
            }
        }
    } 

    function defaultLoad(){

        $scope.label= $stateParams.params.label;
        $scope.sDate= $stateParams.params.fromDate;
        $scope.edate= $stateParams.params.toDate;

        getURL($scope.pageName);

    }

    defaultLoad();
    // return to current location
    $scope.stateGo= function(){
        console.log("$stateParams.params.returnPath", $stateParams.params.returnPath);
        $location.path($stateParams.params.returnPath);
    }
}

// End Customer Analytics Distribution controller
//------------------------------------------------------------------------




//Usage CEI Mapping Ctrl
function UsageCEIMappingBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,  highchartProcessData, highchartOptions,$rootScope,$uibModal,utility, $stateParams){
    
    //track url starts
    utility.trackUrl();
    //end track url

    
    function getData(url){
        
        $scope.loadingDiv= true; 
        $scope.noDataDiv= false;
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            // console.log("objArray", objArray);
            $scope.HH= 0;
             $scope.HL= 0;
             $scope.LL= 0;
              $scope.LH= 0;

            for(var i in objArray){
                if(objArray[i].Status == "HH")
                    $scope.HH= objArray[i].Users;
                else if(objArray[i].Status == "HL")
                    $scope.HL= objArray[i].Users;
                else if(objArray[i].Status == "LH")
                    $scope.LH= objArray[i].Users;
                else if(objArray[i].Status == "LL")
                    $scope.LL= objArray[i].Users;
            }


            if(objArray.length>0){

                // $scope[divObj.exportData]= angular.copy(objArray);

                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){

                    if(objArray[i].Status == "HH"){
                        // $scope.HH= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Status, 
                            y: parseFloat(objArray[i].Users),
                            color: "#1ab394"
                        };
                    }
                    else if(objArray[i].Status == "HL"){
                        // $scope.HL= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Status, 
                            y: parseFloat(objArray[i].Users),
                            color: '#f8ac59'
                        };
                    }
                    else if(objArray[i].Status == "LH"){
                        // $scope.LH= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Status, 
                            y: parseFloat(objArray[i].Users),
                            color: "#1c84c6"
                        };
                    }
                    else if(objArray[i].Status == "LL"){
                        // $scope.LL= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Status, 
                            y: parseFloat(objArray[i].Users),
                            color: "#ed5565"
                        };
                    }

                    
                }

                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                // pieChartOpt.plotOptions.pie.dataLabels.style.color= globalConfig.colorpalette;
                pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.y:.0f}';
                pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.y:.0f}</b>';

                $scope.pieChartConfig= {
                    "options" : pieChartOpt,
                    series: [{
                        name: "Usage CEI Mapping",
                        colorByPoint: true,
                        data: pieChartArray
                    }]
                }
                $scope.loadingDiv= false; 
                $scope.noDataDiv= false;
            }
            else{
                $scope.loadingDiv= false; 
                $scope.noDataDiv= true;
            }
        })
    }

    function defaultLoad(){

        $scope.sDate= $scope.dateSelect;
        $scope.edate= $scope.dateSelect;

        var usageCEIMappingURL = globalConfig.pullfilterdataurlbyname+'CEI-Usage Segmented Users'+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z";
        getData(usageCEIMappingURL);

    }

    defaultLoad();

    $scope.click= function(){
        
        defaultLoad();
    }

    //  date change event
    $scope.changeDate=function (modelName, newDate) {
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
        // defaultLoad();
     }
    
    // return to current location
    $scope.exportData= function(status, loadingIcon){
        $rootScope.sDate= $scope.sDate;
        $rootScope.edate= $scope.edate;

        var modelPath= null
        if(globalConfig.depType == 'F')
            modelPath = 'views/fixedLine/modelSubsListDownload.html' ;
        else
            modelPath = 'views/mobility/modelSubsListDownload.html' ;

        // model window
        var modalInstance = $uibModal.open({
            templateUrl: modelPath,//'views/static/modelSubsListDownload.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.title= "Subscriber Usage Vs Experience Matrix";
            $scope.header= "Subscriber Usage Vs Experience Matrix between date "+$rootScope.sDate+" - "+$rootScope.edate;
            $scope.loadingDiv= true;
            $scope.noDataDiv= false;

            var exportSubsListURL= globalConfig.pullfilterdataurlbyname+'CEI-Usage Segmented User Export'+"&fromDate="+$rootScope.sDate+"T00:00:00.000Z&toDate="+$rootScope.edate+"T23:59:59.999Z&Status="+status;

            var fileName=  "Subscriber Usage Vs Experience Matrix between date "+$rootScope.sDate+" - "+$rootScope.edate;
            httpService.get(exportSubsListURL).then(function(response){
                var objArray= response.data;
                if(objArray.length>0){
                    $scope.SubListData= angular.copy(objArray);
                    $scope.exportSubList= angular.copy(objArray);
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= false;
                }
                else{
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= true;
                }
            })

            // redirect to subscribers details
            $scope.stateGo= function(subID){
                console.log("subID", subID);
                var params={};
                params.toDate= $rootScope.edate;
                params.value= subID;
                params= JSON.stringify(params);
                $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
                /*$state.go('index.staticanalysis',{'params': params, 'file':'customerDetailsBB.html','id':null, 'name': 'Customer Details'});
                $scope.cancel();*/
            }
        }


        /*var exportURL= globalConfig.pullfilterdataurlbyname+'CEI-Usage Segmented User Export'+"&fromDate="+$scope.date.start+"&toDate="+$scope.date.end+"&Status="+status;
        $scope[loadingIcon] = true;

        httpService.get(exportURL).then(function(response){
            var objArray= response.data;
            // console.log("export");
            $scope.getSimpleJSONExport(objArray, 'csv', "CEI_Usage_"+status, "CEI_Usage_"+status);
            $scope[loadingIcon] = false;
        })*/
    }
}



// End Customer Analytics Distribution controller
//------------------------------------------------------------------------



// Power Level Report Ctrl
function PowerLevelReportBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,  highchartProcessData, highchartOptions,$rootScope,$uibModal,utility, $stateParams){
    
    //track url starts
    utility.trackUrl();
    //end track url

    
    function getData(url){
        
        $scope.loadingDiv= true; 
        $scope.noDataDiv= false;
        
        httpService.get(url).then(function(response){
            var objArray= response.data;

            if(objArray.length>0){

                // $scope[divObj.exportData]= angular.copy(objArray);

                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){

                    if(objArray[i].Status == "Saturation"){
                        // $scope.HH= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Status, 
                            y: parseFloat(objArray[i].Users),
                            color: "#1ab394"
                        };
                    }
                    else if(objArray[i].Status == "Bad"){
                        // $scope.HL= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Status, 
                            y: parseFloat(objArray[i].Users),
                            color: '#f8ac59'
                        };
                    }
                    else if(objArray[i].Status == "Good"){
                        // $scope.LH= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Status, 
                            y: parseFloat(objArray[i].Users),
                            color: "#1c84c6"
                        };
                    }
                    else if(objArray[i].Status == "Excellent"){
                        // $scope.LL= objArray[i].Users;

                        pieChartArray[i]= {
                            name: objArray[i].Status, 
                            y: parseFloat(objArray[i].Users),
                            color: "#ed5565"
                        };
                    }

                    
                }

                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                // pieChartOpt.plotOptions.pie.dataLabels.style.color= globalConfig.colorpalette;
                pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.y:.0f}';
                pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.y:.0f}</b>';
                pieChartOpt.plotOptions.pie.showInLegend = 'True'

                $scope.pieChartConfig= {
                    "options" : pieChartOpt,
                    series: [{
                        name: "Users",
                        colorByPoint: true,
                        data: pieChartArray,

                        events:{
                            click: function (event){
                                $scope.exportSubList(event.point.options);
                            }
                        }

                    }]
                }
                $scope.loadingDiv= false; 
                $scope.noDataDiv= false;
            }
            else{
                $scope.loadingDiv= false; 
                $scope.noDataDiv= true;
            }
        })
    }

    function defaultLoad(){

        $scope.sDate= $scope.dateSelect;

        alert("Date is " +  $scope.sDate)

        var powerLevelStatusURL = globalConfig.pullfilterdataurlbyname+'RX Status Date Wise'+"&fromDate="+$scope.sDate+"T00:00:00.000Z";
        getData(powerLevelStatusURL);

    }

    defaultLoad();

    //export pie segment
    $scope.exportSubList= function(options){
        $rootScope.sDate= $scope.sDate;

        var modelPath= 'views/fixedLine/modelSubsListDownloadCopy.html' ;

        // model window
        var modalInstance = $uibModal.open({
            templateUrl: modelPath,//'views/static/modelSubsListDownload.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.title= "Customers with Signal Status "+options.name;
            $scope.header= "Power Level ["+options.name+"] for  "+$rootScope.sDate ;
            $scope.loadingDiv= true;
            $scope.noDataDiv= false;

            var exportSubsListURL=globalConfig.pullfilterdataurlbyname+'Power Level report date status wise&fromDate='+$rootScope.sDate+'T00:00:00.000Z'+'&status='+options.name;


            httpService.get(exportSubsListURL).then(function(response){
                var objArray= response.data;
                if(objArray.length>0){
                    $scope.SubListData= angular.copy(objArray);
                    $scope.exportSubList= angular.copy(objArray);
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= false;
                }
                else{
                    $scope.loadingDiv= false;
                    // exportSubsListURL=globalConfig.pullfilterdataurlbyname+'Power Level report date status wise'+$rootScope.sDate+'T00:00:00.000Z'+'&status='+options.name;

                    $scope.noDataDiv= true;
                }
            })

        }
    }

    $scope.click= function(){
        
        defaultLoad();
    }

    //  date change event
    $scope.changeDate=function (modelName, newDate) {
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
        // defaultLoad();
     }
    
    // return to current location
    $scope.exportData= function(status, loadingIcon){
        $rootScope.sDate= $scope.sDate;
        $rootScope.edate= $scope.edate;

        var modelPath= null
        if(globalConfig.depType == 'F')
            modelPath = 'views/fixedLine/modelSubsListDownload.html' ;
        else
            modelPath = 'views/mobility/modelSubsListDownload.html' ;

        // model window
        var modalInstance = $uibModal.open({
            templateUrl: modelPath,//'views/static/modelSubsListDownload.html',
            controller: ModalInstanceCtrl,
            size: 'lg',
            windowClass: "animated fadeIn"
        });
        
        function ModalInstanceCtrl ($scope,$rootScope, $uibModalInstance, $timeout) {
            
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.title= "Subscriber Usage Vs Experience Matrix";
            $scope.header= "Subscriber Usage Vs Experience Matrix between date "+$rootScope.sDate+" - "+$rootScope.edate;
            $scope.loadingDiv= true;
            $scope.noDataDiv= false;

            var exportSubsListURL= globalConfig.pullfilterdataurlbyname+'CEI-Usage Segmented User Export'+"&fromDate="+$rootScope.sDate+"T00:00:00.000Z&toDate="+$rootScope.edate+"T23:59:59.999Z&Status="+status;

            var fileName=  "Subscriber Usage Vs Experience Matrix between date "+$rootScope.sDate+" - "+$rootScope.edate;
            httpService.get(exportSubsListURL).then(function(response){
                var objArray= response.data;
                if(objArray.length>0){
                    $scope.SubListData= angular.copy(objArray);
                    $scope.exportSubList= angular.copy(objArray);
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= false;
                }
                else{
                    $scope.loadingDiv= false;
                    $scope.noDataDiv= true;
                }
            })

            // redirect to subscribers details
            $scope.stateGo= function(subID){
                console.log("subID", subID);
                var params={};
                params.toDate= $rootScope.edate;
                params.value= subID;
                params= JSON.stringify(params);
                $window.open('#/index/subsListExport?params='+ params+ '&file=customerDetailsBB.html&id=576e82132b50fc696567d876'+'&name=Subscriber Details', '_blank');
                /*$state.go('index.staticanalysis',{'params': params, 'file':'customerDetailsBB.html','id':null, 'name': 'Customer Details'});
                $scope.cancel();*/
            }
        }


        /*var exportURL= globalConfig.pullfilterdataurlbyname+'CEI-Usage Segmented User Export'+"&fromDate="+$scope.date.start+"&toDate="+$scope.date.end+"&Status="+status;
        $scope[loadingIcon] = true;

        httpService.get(exportURL).then(function(response){
            var objArray= response.data;
            // console.log("export");
            $scope.getSimpleJSONExport(objArray, 'csv', "CEI_Usage_"+status, "CEI_Usage_"+status);
            $scope[loadingIcon] = false;
        })*/
    }
}

// End Customer Analytics Distribution controller
//------------------------------------------------------------------------



// CXO Analytics Controller
function cxoAnalyticsBBCtrl($scope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,  highchartProcessData,utility, highchartOptions, $stateParams){
    
    //track url starts
    utility.trackUrl();
    //end track url

    function getClass(val){
        var cls="";
        if(val>0)
            return cls= 'fa fa-level-up';
        else if(val<0)
            return cls= 'fa fa-level-down';
        else
            return cls= 'fa fa-bolt';
    }

    var getTopPlanUsageperUsers= function(url){
        $scope.loadingTopPlanUsagePerUsersDiv= true
        $scope.noDataTopPlanUsagePerUsersDiv= false

        httpService.get(url).then(function (response) {
            var objArray= response.data;
            var tableDataArray= [];
            if(objArray.length>0){
                var topPlanArray= [], usageData= [], userData= [], tempPlanArray= [];

                for(var i in objArray){
                    topPlanArray.push(objArray[i].Plan);
                    tempPlanArray.push("'"+objArray[i].Plan+"'");
                    usageData.push(objArray[i].Usage);
                    userData.push(objArray[i].Subscribers);
                }
                
                var planUsageperUserURL = globalConfig.pullfilterdataurlbyname+"Plan wise Usage per User for selected Plans&fromDate="+fourteenDays+"T00:00:00.000Z&toDate="+eightDays+"T23:59:59.999Z"+"&Plan="+encodeURIComponent(tempPlanArray);
                httpService.get(planUsageperUserURL).then(function (response) {
                    var objArrayLstWeek= response.data;
                    if(objArrayLstWeek.length> 0){
                        var percUsage= [], percUsers= [];
                        for(var i in objArrayLstWeek){
                            var tableDataObj= {};
                            var plan= objArrayLstWeek[i].Plan;
                            var index= $.inArray(plan,topPlanArray);
                            
                            percUsage[i]= (((usageData[index]- objArrayLstWeek[i].Usage)/objArrayLstWeek[i].Usage)*100).toFixed(2);
                            
                            percUsers[i]= (((userData[index]- objArrayLstWeek[i].Subscribers)/objArrayLstWeek[i].Subscribers)*100).toFixed(2);
                            tableDataObj.Plan= plan;
                            tableDataObj.ClsUsage= getClass(percUsage[i]);
                            tableDataObj.ClsUsers= getClass(percUsers[i]);
                            tableDataObj.UsagePrecent= Math.abs(percUsage[i])+'%';
                            tableDataObj.UsersPrecent= Math.abs(percUsers[i])+'%';
                            tableDataArray.push(tableDataObj);
                        }
                        // console.log("tableDataArray", tableDataArray);
                        $scope.topPlanUsagePerUsarData= angular.copy(tableDataArray);
                        // console.log("tableData", $scope.topPlanUsagePerUsarData);
                        $scope.loadingTopPlanUsagePerUsersDiv= false
                        $scope.noDataTopPlanUsagePerUsersDiv= false
                    }else{
                        $scope.loadingTopPlanUsagePerUsersDiv= false
                        $scope.noDataTopPlanUsagePerUsersDiv= true
                    }
                    
                })
            }else{
                $scope.loadingTopPlanUsagePerUsersDiv= false
                $scope.noDataTopPlanUsagePerUsersDiv= true
                var tableDataObj= {};
                tableDataObj.Plan= "No Data Found";
                tableDataObj.ClsUsage= "";
                tableDataObj.ClsUsers= "";
                tableDataObj.UsagePrecent= "No Data Found";
                tableDataObj.UsersPrecent= "No Data Found";
                tableDataArray.push(tableDataObj);
                return tableDataArray;
            } 
        })
    }

    var getBottomPlanUsageperUsers= function(url){
        $scope.loadingBottomPlanUsagePerUsersDiv= true
        $scope.noDataBottomPlanUsagePerUsersDiv= false

        httpService.get(url).then(function (response) {
            var objArray= response.data;
            var tableDataArray= [];
            if(objArray.length>0){
                var topPlanArray= [], usageData= [], userData= [], tempPlanArray= [];

                for(var i in objArray){
                    topPlanArray.push(objArray[i].Plan);
                    tempPlanArray.push("'"+objArray[i].Plan+"'");
                    usageData.push(objArray[i].Usage);
                    userData.push(objArray[i].Subscribers);
                }
                
                var planUsageperUserURL = globalConfig.pullfilterdataurlbyname+"Plan wise Usage per User for selected Plans&fromDate="+fourteenDays+"T00:00:00.000Z&toDate="+eightDays+"T23:59:59.999Z"+"&Plan="+encodeURIComponent(tempPlanArray);
                httpService.get(planUsageperUserURL).then(function (response) {
                    var objArrayLstWeek= response.data;
                    var percUsage= [], percUsers= [];
                    if(objArrayLstWeek.length>0){
                        for(var i in objArrayLstWeek){
                            var tableDataObj= {};
                            var plan= objArrayLstWeek[i].Plan;
                            var index= $.inArray(plan,topPlanArray);
                            
                            percUsage[i]= (((usageData[index]- objArrayLstWeek[i].Usage)/objArrayLstWeek[i].Usage)*100).toFixed(2);
                            
                            percUsers[i]= (((userData[index]- objArrayLstWeek[i].Subscribers)/objArrayLstWeek[i].Subscribers)*100).toFixed(2);
                            tableDataObj.Plan= plan;
                            tableDataObj.ClsUsage= getClass(percUsage[i]);
                            tableDataObj.ClsUsers= getClass(percUsers[i]);
                            tableDataObj.UsagePrecent= Math.abs(percUsage[i])+'%';
                            tableDataObj.UsersPrecent= Math.abs(percUsers[i])+'%';
                            tableDataArray.push(tableDataObj);
                        }
                        // console.log("tableDataArray", tableDataArray);
                        $scope.bottomPlanUsagePerUsarData= angular.copy(tableDataArray);
                        // console.log("tableData", $scope.topPlanUsagePerUsarData);
                        $scope.loadingBottomPlanUsagePerUsersDiv= false
                        $scope.noDataBottomPlanUsagePerUsersDiv= false
                    }else{
                        $scope.loadingBottomPlanUsagePerUsersDiv= false
                        $scope.noDataBottomPlanUsagePerUsersDiv= true
                    }
                })
            }else{

                $scope.loadingBottomPlanUsagePerUsersDiv= false
                $scope.noDataBottomPlanUsagePerUsersDiv= true
                var tableDataObj= {};
                tableDataObj.Plan= "No Data Found";
                tableDataObj.ClsUsage= "";
                tableDataObj.ClsUsers= "";
                tableDataObj.UsagePrecent= "No Data Found";
                tableDataObj.UsersPrecent= "No Data Found";
                tableDataArray.push(tableDataObj);
                return tableDataArray;
            } 
        })
    }

    function getOverallCEIData(url){
        
        $scope.loadingCEIDiv= true; 
        $scope.noDataCEIDiv= false;
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            // console.log("objArray", objArray);
            
            if(objArray.length>0){

                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){

                    if(objArray[i].CEI == "Excellent"){
                        pieChartArray[i]= {
                            name: objArray[i].CEI, 
                            y: parseFloat(objArray[i].Count),
                            color: "#1ab394"
                        };
                    }
                    else if(objArray[i].CEI == "Good"){
                        pieChartArray[i]= {
                            name: objArray[i].CEI, 
                            y: parseFloat(objArray[i].Count),
                            color: "#f8ac59"
                        };
                    }
                    else if(objArray[i].CEI == "Poor"){
                       pieChartArray[i]= {
                            name: objArray[i].CEI, 
                            y: parseFloat(objArray[i].Count),
                            color: "#ed5565"
                        };
                    }

                    
                }

                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.percentage:.1f}%';
                pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.percentage:.1f}%</b>';

                $scope.pieCEIChartConfig= {
                    "options" : pieChartOpt,
                    series: [{
                        name: "Overall CEI",
                        colorByPoint: true,
                        data: pieChartArray
                    }]
                }
                $scope.exportOvralCEIData= angular.copy(objArray);
                $scope.loadingCEIDiv= false; 
                $scope.noDataCEIDiv= false;
            }
            else{
                $scope.loadingCEIDiv= false; 
                $scope.noDataCEIDiv= true;
            }
        })
    }

    function getZeroTrafficSubsData(url){
        
        $scope.loadingZeroTrafficSubsDiv= true; 
        $scope.noDataZeroTrafficSubsDiv= false;
        
        httpService.get(url).then(function(response){
            var objArray= response.data;
            // console.log("objArray", objArray);
            
            if(objArray.length>0){

                var pieChartArray= [];
                
                //for pie chart data
                for(var i=0; i<objArray.length; i++){

                       pieChartArray[i]= {
                            name: objArray[i].LastSeen, 
                            y: parseFloat(objArray[i].Subscribers),
                            color: highchartProcessData.colorpallete[i]
                        };
                }

                var pieChartOpt= angular.copy(highchartOptions.highchartPieWoLegendOptions);
                pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.percentage:.1f}%';
                pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.y:.0f}</b>';

                $scope.pieZeroTrafficSubsChartConfig= {
                    "options" : pieChartOpt,
                    series: [{
                        name: "Zero Traffic Subs",
                        colorByPoint: true,
                        data: pieChartArray
                    }]
                }
                $scope.exportZeroTrficSubData= angular.copy(objArray);
                $scope.loadingZeroTrafficSubsDiv= false; 
                $scope.noDataZeroTrafficSubsDiv= false;
            }
            else{
                $scope.loadingZeroTrafficSubsDiv= false; 
                $scope.noDataZeroTrafficSubsDiv= true;
            }
        })
    }

    function getCustUsageSharedData(url){
        $scope.loadingTopUserShareDiv= true;
        $scope.noDataTopUserShareDiv= false;
        $scope.topUserShareChartConfig= {};

        httpService.get(url).then(function(response){
            var objArray= response.data;
            if(objArray.length>0){

                var usageData= [], timeArray= [];
                
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Date;
                   
                    usageData[i]= objArray[i].Top100SubscriberUsageShare;
                    
                }
                
                var regressionData= [[0, usageData[0]],[(timeArray.length-1), usageData[usageData.length-1]]];
                
                var topUserShareChartOpt;
                topUserShareChartOpt= angular.copy(highchartOptions.highchartAreaLabelDatetimeOptions);
                
                $scope.topUserShareChartConfig= {
                    options: topUserShareChartOpt,
                    series: [{
                        type: 'line',
                        name: 'Trend',
                        dashStyle: 'Dash',
                        data: regressionData,
                        marker: {
                            enabled: false
                        },
                        states: {
                            hover: {
                                lineWidth: 0
                            }
                        },
                        enableMouseTracking: false
                    },{
                        type: 'spline',
                        name: '% Share Last 7 Days',
                        "color": "#1abc9c",
                        data: usageData,
                        tooltip: {
                                pointFormat: '{series.name} : <b>{point.y:,.2f}</b>',
                                "xDateFormat": "%e %b"
                            }
                        
                    }]
                };
                
                topUserShareChartOpt.xAxis.categories= timeArray;
                topUserShareChartOpt.yAxis.title= {'text': '%'};
                topUserShareChartOpt.chart.height= 300;
                $scope.exportTop100SubShrData= angular.copy(objArray);
                $scope.loadingTopUserShareDiv= false;
                $scope.noDataTopUserShareDiv= false;
                    
            }else{
                $scope.loadingTopUserShareDiv= false;
                $scope.noDataTopUserShareDiv= true;
            }
        });
    }

    function getCDNAnalyticsTrendData(url){
        
        $scope.loadingCDNTrendDiv= true;
        $scope.noDataCDNTrendDiv= false;
        
        httpService.get(url).then(function(response){
            var segmenUsageArray= [], segmenUsageData= [];
            var objArray= response.data;
            $scope.exportCDNTrend= [];
            //console.log("response", objArray);
            if(objArray.length>0){
                
                var exportCDNTrndData= angular.copy(objArray);

                var cachedUsageData= [], uncachedUsageData= [], timeArray= [], cachedUsageDataArray= [], uncachedUsageDataArray= [];
                for(var i=0; i<objArray.length;i++){
                    cachedUsageDataArray[i]=  objArray[i].CachedTraffic;
                    uncachedUsageDataArray[i]= objArray[i].UnCachedTraffic;
                    exportCDNTrndData[i]['CachedTraffic(Bytes)']= exportCDNTrndData[i].CachedTraffic;
                    exportCDNTrndData[i]['UnCachedTraffic(Bytes)']= exportCDNTrndData[i].UnCachedTraffic;
                    delete exportCDNTrndData[i].UnCachedTraffic;
                    delete exportCDNTrndData[i].CachedTraffic;
                }
                var formattedCachedUsageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(cachedUsageDataArray, 1)
                
                var formattedUncachedUsageDataArray= dataFormatter.convertFixUnitUsageDataWoUnit(uncachedUsageDataArray, 1)
                
                var xaxisArray= [], tickArray= [];
                
                for(var i=0; i<objArray.length;i++){
                    timeArray[i]= objArray[i].Date;
                    cachedUsageData[i]= parseFloat(formattedCachedUsageDataArray[0][i]);
                    uncachedUsageData[i]= parseFloat(formattedUncachedUsageDataArray[0][i]);
                }
                //console.log("durationData", durationData);
                //console.log("usageData", usageData);
                var CDNTrendChartOptions;
                CDNTrendChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
                $scope.CDNTrendChartConfig= {
                    options: CDNTrendChartOptions,
                    series: [{
                        name: 'Cached Traffic',
                        type: 'column',
                        yAxis: 1,
                        "color": "#1abc9c",
                        data: cachedUsageData,
                        tooltip: {
                            pointFormat: '{series.name}  : <b>{point.y:,.3f}</b>',"xDateFormat": "%e %b", 
                            // valueSuffix: ' '+formatedThroughputArray[1],
                        }

                    }, {
                        name: 'UnCached Traffic',
                        type: 'spline',
                        color: "#3D8EB9",
                        data:  uncachedUsageData,
                        tooltip: {
                            pointFormat: '{series.name}  : <b>{point.y:,.3f}</b>',"xDateFormat": "%e %b", 
                            // valueSuffix: ' '+formatedThroughputArray[1],
                        }
                    }]
                };
                
                CDNTrendChartOptions.xAxis.categories= timeArray;
                
                CDNTrendChartOptions.yAxis[1].title.text= 'Usage('+formattedCachedUsageDataArray[1]+")";
                CDNTrendChartOptions.yAxis[0].title.text= 'Usage('+formattedUncachedUsageDataArray[1]+")";

                $scope.exportCDNTrndData= angular.copy(exportCDNTrndData);

                $scope.loadingCDNTrendDiv= false;
                $scope.noDataCDNTrendDiv= false;
            }else{
                $scope.loadingCDNTrendDiv= false;
                $scope.noDataCDNTrendDiv= true;
            }
        })
    }

    var getDateMS= function(d){
        var today= new Date();
        var utcMS= new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), today.getUTCMilliseconds())- d*24*60*60*1000;
        // console.log("utcMS",utcMS);
        var dateMS= utcMS+ globalConfig.tzoffset;
        
        var date= $filter('date')(dateMS,' yyyy-MM-dd');
        return date;
    }

    var yDate= getDateMS(1);
    // console.log("yDate",yDate);
    var sevenDays= getDateMS(7);
    // console.log("sevenDaysMS",sevenDaysMS);
    var eightDays= getDateMS(8);
    // console.log("eightDaysMS",eightDaysMS);
    var fourteenDays= getDateMS(14);
    //console.log("fourteenDaysMS",fourteenDaysMS);
    var fiveDays= getDateMS(5);
    //console.log("tenDaysMS",tenDaysMS);

    // Default load
    function defaultLoad(){
        
        var topPlanUsagePerUsersURL = globalConfig.pullfilterdataurlbyname+'Top X Plan wise Usage per User'+"&fromDate="+sevenDays+"T00:00:00.000Z"+"&toDate="+yDate+"T23:59:59.999Z";
        getTopPlanUsageperUsers(topPlanUsagePerUsersURL);
        
        var bottomPlanUsagePerUsersURL = globalConfig.pullfilterdataurlbyname+'Bottom X Plan wise Usage per User'+"&fromDate="+sevenDays+"T00:00:00.000Z"+"&toDate="+yDate+"T23:59:59.999Z";
         getBottomPlanUsageperUsers(bottomPlanUsagePerUsersURL);
        

        //top 100 subscribers share to total usage
        $scope.exportTop100SubShrObj= {};
        $scope.exportTop100SubShrObj.fileName= "CXO Analytics_Top 100 Subscribers Share";
        $scope.exportTop100SubShrObj.fileHeader= "Top 100 Subscribers Share"
        var topHundredCustUsageSharedURL = globalConfig.pullfilterdataurlbyname+"Top 100 Customer Usage share date range";
        getCustUsageSharedData(topHundredCustUsageSharedURL);
        
        //overall CEI yesterday
        $scope.exportOvralCEIObj={};
        $scope.exportOvralCEIObj.fileName= "CXO Analytics_Over all CEI for Yesterday";
        $scope.exportOvralCEIObj.fileHeader= "Over all CEI for Yesterday";
        var overallCEIURL = globalConfig.pullfilterdataurlbyname+"Overall CEI Yesterday";
        getOverallCEIData(overallCEIURL);

        // zero traffic subs
        $scope.exportZeroTrficSubObj={};
        $scope.exportZeroTrficSubObj.fileName= "CXO Analytics_Zero Traffic Subs (last 5 days)";
        $scope.exportZeroTrficSubObj.fileHeader= "Zero Traffic Subs (last 5 days)";
        var zeroTrafficSubsURL= globalConfig.pullfilterdataurlbyname+'Inactive Users since last week Report'+"&fromDate="+fiveDays+"T00:00:00.000Z"+"&toDate="+yDate+"T23:59:59.999Z";
        getZeroTrafficSubsData(zeroTrafficSubsURL);

        //cdn Analytics Trend
        $scope.exportCDNTrndObj= {};
        $scope.exportCDNTrndObj.fileName= "CXO Analytics_CDN Analytics Trend (last 7 days)";
        $scope.exportCDNTrndObj.fileHeader= "CDN Analytics Trend (last 7 days)";
        var cdnAnalyticsTrendURL = globalConfig.pullfilterdataurlbyname+"Daily Cached Traffic Report&fromDate="+sevenDays+"T00:00:00.000Z"+"&toDate="+yDate+"T23:59:59.999Z";
        getCDNAnalyticsTrendData(cdnAnalyticsTrendURL);
        
        // getTopUsersTrend(fromDateTopUsersUsageURL, fromDateTotalUsageURL)
    }
    defaultLoad();
}
// End CXO Analytics Controller
//    ----------------------------------------------------------------------------

// forecasting Throughput/Usage Controller
function forecastingTpCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,  highchartOptions,utility, locationFilterService, highchartProcessData, filterService, globalData, SweetAlert) {
    
    //track url starts
    utility.trackUrl();
    //end track url

    var forecastPeriod= '1M1-',temp='';
    /*var bp_GIG_HSI_30_Mbps='GIG HSI 30 Mbps_0.05--',
        bp_GIG_HSI_5_Mbps='GIG HSI 5 Mbps_0.05--',
        bp_GIG_Plus_Upto_100_Mbps='GIG Plus Upto 100 Mbps_0.05--',
        bp_BOD_Upto_100_Mbps='BOD Upto 100 Mbps_0.05--',
        bp_GIG_HSI_10_Mbps='GIG HSI 10 Mbps_0.05--',
        bp_GIG_HSI_15_Mbps='GIG HSI 15 Mbps_0.05--',
        bp_GIG_Plus_Upto_15_Mbps='GIG Plus Upto 15 Mbps_0.05--',
        bp_GIG_ECO_Upto_15_Mbps='GIG ECO Upto 15 Mbps_0.05--',
        bp_GIG_Plus_Upto_30_Mbps='GIG Plus Upto 30 Mbps_0.05--',
        bp_BOD_Upto_30_Mbps='BOD Upto 30 Mbps_0.05--',
        bp_GIG_HSI_1_Gbps='GIG HSI 1 Gbps_0.05--',
        bp_GIG_HSI_100_Mbps='GIG HSI 100 Mbps_0.05--';*/ 
    var i='BP30_0.1-',j='BP05_0.1-', k='BP15_0.1-', l='BP100_0.1';
    
    temp= i+j+k+l;
    // temp= bp_GIG_HSI_30_Mbps+bp_GIG_HSI_5_Mbps+bp_GIG_Plus_Upto_100_Mbps+bp_BOD_Upto_100_Mbps+bp_GIG_HSI_10_Mbps+bp_GIG_HSI_15_Mbps+bp_GIG_Plus_Upto_15_Mbps+bp_GIG_ECO_Upto_15_Mbps+bp_GIG_Plus_Upto_30_Mbps+bp_BOD_Upto_30_Mbps+bp_GIG_HSI_1_Gbps+bp_GIG_HSI_100_Mbps;
    
    //--------------------------------------------------------------
    function reset(){
        forecastPeriod= '1M-';
        $scope.selectOLT= 'JKT-GMRB1-OLT1-HW5600';
        i='BP30_0.05-';
        j='BP05_0.05-'; 
        k='BP15_0.05-'; 
        l='BP100_0.05';
        temp= i+j+k+l;

        /*bp_GIG_HSI_30_Mbps='GIG HSI 30 Mbps_0.05--';
        bp_GIG_HSI_5_Mbps='GIG HSI 5 Mbps_0.05--';
        bp_GIG_Plus_Upto_100_Mbps='GIG Plus Upto 100 Mbps_0.05--';
        bp_BOD_Upto_100_Mbps='BOD Upto 100 Mbps_0.05--';
        bp_GIG_HSI_10_Mbps='GIG HSI 10 Mbps_0.05--';
        bp_GIG_HSI_15_Mbps='GIG HSI 15 Mbps_0.05--';
        bp_GIG_Plus_Upto_15_Mbps='GIG Plus Upto 15 Mbps_0.05--';
        bp_GIG_ECO_Upto_15_Mbps='GIG ECO Upto 15 Mbps_0.05--';
        bp_GIG_Plus_Upto_30_Mbps='GIG Plus Upto 30 Mbps_0.05--';
        bp_BOD_Upto_30_Mbps='BOD Upto 30 Mbps_0.05--';
        bp_GIG_HSI_1_Gbps='GIG HSI 1 Gbps_0.05--';
        bp_GIG_HSI_100_Mbps='GIG HSI 100 Mbps_0.05--';
        temp= bp_GIG_HSI_30_Mbps+bp_GIG_HSI_5_Mbps+bp_GIG_Plus_Upto_100_Mbps+bp_BOD_Upto_100_Mbps+bp_GIG_HSI_10_Mbps+bp_GIG_HSI_15_Mbps+bp_GIG_Plus_Upto_15_Mbps+bp_GIG_ECO_Upto_15_Mbps+bp_GIG_Plus_Upto_30_Mbps+bp_BOD_Upto_30_Mbps+bp_GIG_HSI_1_Gbps+bp_GIG_HSI_100_Mbps;*/

        $scope.monthBtn= {
            '1M-': true,
            '3M-': false,
            '6M-': false
        }

        $scope.selectPerc= {};
        $scope.selectPerc['0']= '0.05'
        $scope.selectPerc['1']= "0.05"
        $scope.selectPerc['2']= '0.05'
        $scope.selectPerc['3']= '0.05'
        /*$scope.selectPerc['4']= '0.05'
        $scope.selectPerc['5']= '0.05'
        $scope.selectPerc['6']= '0.05'
        $scope.selectPerc['7']= '0.05'
        $scope.selectPerc['8']= '0.05'
        $scope.selectPerc['9']= '0.05'
        $scope.selectPerc['10']= '0.05'
        $scope.selectPerc['11']= '0.05'*/
        
        $scope.selectGShape= {};
        $scope.selectGShape['0']= 'Linear'
        $scope.selectGShape['1']= "Linear"
        $scope.selectGShape['2']= 'Linear'
        $scope.selectGShape['3']= "Linear"
        /*$scope.selectGShape['4']= "Linear"
        $scope.selectGShape['5']= "Linear"
        $scope.selectGShape['6']= "Linear"
        $scope.selectGShape['7']= "Linear"
        $scope.selectGShape['8']= "Linear"
        $scope.selectGShape['9']= "Linear"
        $scope.selectGShape['10']= "Linear"
        $scope.selectGShape['11']= "Linear"*/
    }
    reset();

    //month button click event
    $scope.statusMnthBtn= function(oneMnth,threeMnth,sixMnth){
        $scope.monthBtn['1M-']= oneMnth;
        $scope.monthBtn['3M-']= threeMnth;
        $scope.monthBtn['6M-']= sixMnth;
        if(oneMnth)
            forecastPeriod= '1M-';
        else if(threeMnth)
            forecastPeriod= '3M-';
        else if(sixMnth)
            forecastPeriod= '6M-';
        // defaultLoad();
    }
    
    //reset button event
    $scope.resetClick= function(){
        reset();
        defaultLoad();
    }

    //Forecast button click event
    $scope.forecastClick= function(){
        
        if($scope.monthBtn['1m']== false &&  $scope.monthBtn['3m']== false && $scope.monthBtn['6m']== false){
            SweetAlert.swal({
                title: "Period Not Selected !!",
                text: "Please Select Forecasting Period",
                type: "error",
            })
        }
        else{
            if($scope.selectPerc['0']== 'null' && $scope.selectPerc['1']== "null" && $scope.selectPerc['2']== 'null'&& $scope.selectPerc['3']== 'null' && $scope.selectGShape['0']== 'null' && $scope.selectGShape['1']== "null" && $scope.selectGShape['2']== 'null'){
                SweetAlert.swal({
                    title: "Options Not Selected",
                    text: "Please select Options!!",
                    type: "error",
                })
            }
            else
                defaultLoad();
        }
    }

    var optionForecastingTp= {
        chart:{
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        credits :{
            enabled: false
        }, 
        xAxis: {
            type: 'datetime'
        },

        yAxis: {
            title: {
                text: 'Usage(GB)'
            },
            // min:0
        },

        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: ' GB'
        },

        legend: {
        }
    }
    
    var optionPlanMultiline= {
        chart:{
            zoomType: 'xy',
            height: 300
        },
        title: {
            text: ''
        },

        xAxis: {
            type: 'datetime'
        },
        credits :{
            enabled: false
        },
        yAxis: {
            title: {
                text: 'Subscribers'
            },
            // min:0
        },

        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: ''
        },

        legend: {
        }
    }
        
    function getForecastingTpData(){
        
        $scope.loadingDiv= true;
        $scope.noDataDiv= false;  
        
        // throughput/usage prediction code
        var objArrayTp= [];
        httpService.get(globalConfig.forecastHistoricDataURL+$scope.selectOLT).then(function(response){
               objArrayTp= angular.copy(response.data); 

        
        /*switch($scope.selectOLT){
            case 'JKT-GMRB1-OLT1-HW5600':
                objArrayTp= angular.copy(globalData.forecastingTpData);
                break;
            case 'BGR-GND-OLT1-ZTEC300':
                objArrayTp= angular.copy(globalData.forecastingTpData_BGR);
                break;
            case 'TNG-TLB-OLT1-ZTEC300':
                objArrayTp= angular.copy(globalData.forecastingTpData_TNG);
                break;
        }*/
        
        var valArray= [],rangeArray= [],ExpectedArray= [], predictiveArray=[], bp100Data= [],bp50Data= [],bp30Data= [],bp10Data= [];

        /*var bp_GIG_HSI_30_MbpsData= [],bp_GIG_HSI_5_MbpsData= [],bp_GIG_Plus_Upto_100_MbpsData= [],bp_BOD_Upto_100_MbpsData= [],bp_GIG_HSI_10_MbpsData= [],bp_GIG_HSI_15_MbpsData= [],bp_GIG_Plus_Upto_15_MbpsData= [],bp_GIG_ECO_Upto_15_MbpsData= [],bp_GIG_Plus_Upto_30_MbpsData= [],bp_BOD_Upto_30_MbpsData= [],bp_GIG_HSI_1_GbpsData= [],bp_GIG_HSI_100_MbpsData= [];*/

        // http call for filtered data
            
            var getFileName= $scope.selectOLT+'/'+forecastPeriod+temp+".csv";
            // console.log("getFileName", getFileName);
             httpService.get(globalConfig.forecastDataURL+getFileName).then(function(response){
            //httpService.get(globalConfig.pullDataUrl+"http://10.0.0.14:8080/DataAPI/CommonListener?action=csv&file="+getFileName).then(function(response){
                var filterObj= response.data;
                
                for(var i in objArrayTp){
                    bp100Data.push([parseInt(objArrayTp[i].recorddate),parseInt(objArrayTp[i]['GIG HSI 30 Mbps_subscribers'])]);
                    bp50Data.push([parseInt(objArrayTp[i].recorddate),parseInt(objArrayTp[i]['GIG HSI 5 Mbps_subscribers'])]);
                    bp30Data.push([parseInt(objArrayTp[i].recorddate),parseInt(objArrayTp[i]['GIG HSI 15 Mbps_subscribers'])]);
                    bp10Data.push([parseInt(objArrayTp[i].recorddate),parseInt(objArrayTp[i]['GIG HSI 100 Mbps_subscribers'])]);

                    /*bp_GIG_HSI_30_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG HSI 30 Mbps_subscribers'])]);
                    bp_GIG_HSI_5_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG HSI 5 Mbps_subscribers'])]);
                    bp_GIG_Plus_Upto_100_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG Plus Upto 100 Mbps_subscribers'])]);
                    bp_BOD_Upto_100_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['BOD Upto 100 Mbps_subscribers'])]);
                    bp_GIG_HSI_10_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG HSI 10 Mbps_subscribers'])]);
                    bp_GIG_HSI_15_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG HSI 15 Mbps_subscribers'])]);
                    bp_GIG_Plus_Upto_15_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG Plus Upto 15 Mbps_subscribers'])]);
                    bp_GIG_ECO_Upto_15_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG ECO Upto 15 Mbps_subscribers'])]);
                    bp_GIG_Plus_Upto_30_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG Plus Upto 30 Mbps_subscribers'])]);
                    bp_BOD_Upto_30_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['BOD Upto 30 Mbps_subscribers'])]);
                    bp_GIG_HSI_1_GbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG HSI 1 Gbps_subscribers'])]);
                    bp_GIG_HSI_100_MbpsData.push([objArrayTp[i].recorddate,parseInt(objArrayTp[i]['GIG HSI 100 Mbps_subscribers'])]);*/

                    valArray.push([parseInt(objArrayTp[i].recorddate), (parseFloat((objArrayTp[i].usage))/(1024*1024*1024))])
                    predictiveArray.push([parseInt(objArrayTp[i].recorddate),null]);
                    rangeArray.push([parseInt(objArrayTp[i].recorddate),null, null])
                    ExpectedArray.push([parseInt(objArrayTp[i].recorddate), 4000])
                    
                }

                for(var j in filterObj){
                    bp100Data.push([parseInt(filterObj[j].dates),parseInt(filterObj[j].BP30_future)]);
                    bp50Data.push([parseInt(filterObj[j].dates),parseInt(filterObj[j].BP05_future)]);
                    bp30Data.push([parseInt(filterObj[j].dates),parseInt(filterObj[j].BP15_future)]);
                    bp10Data.push([parseInt(filterObj[j].dates),parseInt(filterObj[j].BP100_future)]);

                    /*bp_GIG_HSI_30_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP100_future)]);
                    bp_GIG_HSI_5_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP50_future)]);
                    bp_GIG_Plus_Upto_100_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP30_future)]);
                    bp_BOD_Upto_100_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP10_future)]);
                    bp_GIG_HSI_10_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP100_future)]);
                    bp_GIG_HSI_15_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP50_future)]);
                    bp_GIG_Plus_Upto_15_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP30_future)]);
                    bp_GIG_ECO_Upto_15_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP10_future)]);
                    bp_GIG_Plus_Upto_30_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP100_future)]);
                    bp_BOD_Upto_30_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP50_future)]);
                    bp_GIG_HSI_1_GbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP30_future)]);
                    bp_GIG_HSI_100_MbpsData.push([parseInt(filterObj[j].future_time_index),parseInt(filterObj[j].BP10_future)]);*/

                    valArray.push([parseInt(filterObj[j].dates),null]);
                    predictiveArray.push([parseInt(filterObj[j].dates),parseFloat(filterObj[j].forecastUsage)]);
                    rangeArray.push([parseInt(filterObj[j].dates), parseFloat(filterObj[j].forecast_low), parseFloat(filterObj[j].forecast_high)]);
                    ExpectedArray.push([parseInt(filterObj[j].dates), 4000]);
                }
                console.log("valArray", valArray);
                console.log("predictiveArray", predictiveArray);
                console.log("rangeArray", rangeArray);
                $scope.forecastingConfig={
                    options: optionForecastingTp,
                    series: [{
                        name: 'Historical',
                        data: valArray,
                        zIndex: 1,
                        color:'rgb(124, 181, 236)',
                        marker: {
                            fillColor: 'white',
                            lineWidth: 2,
                            lineColor: Highcharts.getOptions().colors[0]
                        }
                    },/*{
                        name: 'Max. Capacity',
                        // dashstyle: "Dot",
                        data: ExpectedArray,
                        zIndex: 2,
                        color: "#1ab394",
                        marker: {
                            fillColor: '#1ab394',
                            lineWidth: 0.5,
                            lineColor: Highcharts.getOptions().colors[0]
                        }
                    },*/ {
                        name: '95% Confidence Interval',
                        data: rangeArray,
                        type: 'arearange',
                        lineWidth: 0,
                        linkedTo: ':previous',
                        color: "#003399",//Highcharts.getOptions().colors[0],
                        fillOpacity: 0.6,
                        zIndex: 0,
                        marker: {
                            enabled: false
                        }
                    },{
                        name: 'Predictive',
                        data: predictiveArray,
                        // type: 'arearange',
                        lineWidth:2,
                        linkedTo: ':previous',
                        color: "#ffbf00",//Highcharts.getOptions().colors[0],
                        fillOpacity: 0.05,
                        zIndex: 4,
                        marker: {
                            enabled: false
                        }
                    }]
                }

                $scope.forecastingPlanMultiline={
            options: optionPlanMultiline,
            series: [{
                name: 'GIG HSI 30 Mbps',
                data: bp100Data,
                zIndex: 1,
                color:'rgb(124, 181, 236)',
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: 'GIG HSI 5 Mbps',
                // dashstyle: "Dot",
                data: bp50Data,
                zIndex: 2,
                lineWidth: 2,
                color: "#ffbf00",
                marker: {
                    fillColor: '#ffbf00',
                    lineWidth: 2,
                    lineColor: '#ffbf00'
                }
            }, 
            {
                name: 'GIG HSI 15 Mbps',
                data: bp30Data,
                // type: 'arearange',
                lineWidth: 2,
                // zIndex: 3,
                // linkedTo: ':previous',
                color: '#1F9EA3',//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                zIndex: 0,
                marker: {
                    fillColor: 'white',
                     lineWidth: 2,
                    lineColor: "#1F9EA3",
                    enabled: false
                }
            },
            {
                name: 'GIG HSI 100 Mbps',
                data: bp10Data,
                // type: 'arearange',
                lineWidth: 2,
                zIndex: 4,
                // linkedTo: ':previous',
                color: '#f7a35c',//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                // zIndex: 0,
                marker: {
                    fillColor: 'white',
                     lineWidth: 2,
                    lineColor: "#f7a35c",
                    enabled: false
                }
            }/*{
                name: 'GIG HSI 30 Mbps',
                data: bp_GIG_HSI_30_MbpsData,
                zIndex: 1,
                color:'rgb(124, 181, 236)',
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: 'GIG HSI 5 Mbps',
                // dashstyle: "Dot",
                data: bp_GIG_HSI_5_MbpsData,
                zIndex: 2,
                lineWidth: 2,
                color: "#ffbf00",
                marker: {
                    fillColor: '#ffbf00',
                    lineWidth: 2,
                    lineColor: '#ffbf00'
                }
            }, 
            {
                name: 'GIG Plus Upto 100 Mbps',
                data: bp_GIG_Plus_Upto_100_MbpsData,
                // type: 'arearange',
                lineWidth: 2,
                // zIndex: 3,
                // linkedTo: ':previous',
                color: '#1F9EA3',//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                zIndex: 0,
                marker: {
                    fillColor: 'white',
                     lineWidth: 2,
                    lineColor: "#1F9EA3",
                    enabled: false
                }
            },
            {
                name: 'BOD Upto 100 Mbps',
                data: bp_BOD_Upto_100_MbpsData,
                // type: 'arearange',
                lineWidth: 2,
                zIndex: 4,
                // linkedTo: ':previous',
                color: '#f7a35c',//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                // zIndex: 0,
                marker: {
                    fillColor: 'white',
                     lineWidth: 2,
                    lineColor: "#f7a35c",
                    enabled: false
                }
            },{
                name: 'GIG HSI 10 Mbps',
                data: bp_GIG_HSI_10_MbpsData,
                zIndex: 1,
                color:'#7C4DFF',
                marker: {
                    fillColor: '#7C4DFF',
                    lineWidth: 2,
                    lineColor: '#7C4DFF'
                }
            },{
                name: 'GIG HSI 15 Mbps',
                // dashstyle: "Dot",
                data: bp_GIG_HSI_15_MbpsData,
                zIndex: 2,
                lineWidth: 2,
                color: "#C25396",
                marker: {
                    fillColor: '#C25396',
                    lineWidth: 2,
                    lineColor: '#C25396'
                }
            }, 
            {
                name: 'GIG Plus Upto 15 Mbps',
                data: bp_GIG_Plus_Upto_15_MbpsData,
                // type: 'arearange',
                lineWidth: 2,
                // zIndex: 3,
                // linkedTo: ':previous',
                color: '#92F22A',//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                zIndex: 0,
                marker: {
                    fillColor: '#92F22A',
                     lineWidth: 2,
                    lineColor: "#92F22A",
                    enabled: false
                }
            },
            {
                name: 'GIG ECO Upto 15 Mbps',
                data: bp_GIG_ECO_Upto_15_MbpsData,
                // type: 'arearange',
                lineWidth: 2,
                zIndex: 4,
                // linkedTo: ':previous',
                color: '#97CE68',//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                // zIndex: 0,
                marker: {
                    fillColor: '#97CE68',
                     lineWidth: 2,
                    lineColor: "#97CE68",
                    enabled: false
                }
            },{
                name: 'GIG Plus Upto 30 Mbps',
                data: bp_GIG_Plus_Upto_30_MbpsData,
                zIndex: 1,
                color:'#897FBA',
                marker: {
                    fillColor: '#897FBA',
                    lineWidth: 2,
                    lineColor: '#897FBA'
                }
            },{
                name: 'BOD Upto 30 Mbps',
                // dashstyle: "Dot",
                data: bp_BOD_Upto_30_MbpsData,
                zIndex: 2,
                lineWidth: 2,
                color: "#e74c3c",
                marker: {
                    fillColor: '#e74c3c',
                    lineWidth: 2,
                    lineColor: '#e74c3c'
                }
            }, 
            {
                name: 'GIG HSI 1 Gbps',
                data: bp_GIG_HSI_1_GbpsData,
                // type: 'arearange',
                lineWidth: 2,
                // zIndex: 3,
                // linkedTo: ':previous',
                color: '#2C82C9',//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                zIndex: 0,
                marker: {
                    fillColor: '#2C82C9',
                     lineWidth: 2,
                    lineColor: "#2C82C9",
                    enabled: false
                }
            },
            {
                name: 'GIG HSI 100 Mbps',
                data: bp_GIG_HSI_100_MbpsData,
                // type: 'arearange',
                lineWidth: 2,
                zIndex: 4,
                // linkedTo: ':previous',
                color: '#83D6DE',//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                // zIndex: 0,
                marker: {
                    fillColor: '#83D6DE',
                     lineWidth: 2,
                    lineColor: "#83D6DE",
                    enabled: false
                }
            }*/]
        }
            })
        
        })
        $scope.loadingDiv= false;
        $scope.noDataDiv= false; 
        $scope.forecastingTableObj= [
            {
                Plan: 'GIG HSI 30 Mbps',
            },{
                Plan: 'GIG HSI 5 Mbps',
            }/*,{
                Plan: 'GIG Plus Upto 100 Mbps',
            },{
                Plan: 'BOD Upto 100 Mbps',
            },{
                Plan: 'GIG HSI 10 Mbps',
            }*/,{
                Plan: 'GIG HSI 15 Mbps',
            }/*,{
                Plan: 'GIG Plus Upto 15 Mbps',
            },{
                Plan: 'GIG ECO Upto 15 Mbps',
            },{
                Plan: 'GIG Plus Upto 30 Mbps',
            },{
                Plan: 'BOD Upto 30 Mbps',
            },{
                Plan: 'GIG HSI 1 Gbps',
            }*/,{
                Plan: 'GIG HSI 100 Mbps',
            }
        ]

    }

    function defaultLoad(){
       getForecastingTpData();
    }
    
    defaultLoad();
    
    //dropdown change event
    $scope.selectGMode= function(index,plan, value){
        //console.log(index, plan, value)
    }
    
    $scope.selectPrecG= function(index,plan, value){
        
        switch(plan){
            case 'GIG HSI 30 Mbps':
                i='';
                i= 'BP30_'+value+"-"
                temp=i+j+k+l;
                break;
            case 'GIG HSI 5 Mbps':
                j='';
                j= 'BP05_'+value+"-"
                temp=i+j+k+l;
                break;
            case 'GIG HSI 15 Mbps':
                k='';
                k= 'BP15_'+value+"-"
                temp=i+j+k+l;
                break;
            case 'GIG HSI 100 Mbps':
                l='';
                l= 'BP100_'+value
                temp=i+j+k+l;
                break;
        }
        defaultLoad();
    }
}
// End forecasting Throughput/Usage Controller
//    ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// forecasting Outage Controller
function forecastingOutageCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,  highchartOptions,locationFilterService, utility,highchartProcessData, filterService, globalData, SweetAlert) {
    
    //track url starts
    utility.trackUrl();
    //end track url

    $scope.outage= {};
    $scope.outage.selectOLT= "BDG-CRF-OLT1-HW5600";
        
    function getOutagePrediction(){
        
        $scope.loadingDiv= true;
        $scope.noDataDiv= false;  
        
        // Outage Prediction code

        var option= {
            chart:{
                zoomType: 'xy'
            },
            title: {
                text: null
            },

            xAxis: {
                type: 'datetime'
            },

            yAxis: {
                title: {
                    text: 'Fault'
                },
                min:0
            },

            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: null
            },

            legend: {
            }
        }
        
        var optionFault= {
            chart:{
                zoomType: 'xy'
            },
            title: {
                text: null
            },

            xAxis: {
                type: 'datetime'
            },

            yAxis: {
                title: {
                    text: 'Fault'
                },
                min:0
            },

            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: null
            },

            legend: {
            }
        }
        
        var objArrayOutage= [];
        
        switch($scope.outage.selectOLT){
            case 'BDG-CRF-OLT1-HW5600':
                objArrayOutage= angular.copy(globalData.forecastingOutageData);
                break;
            case 'BGR-GND-OLT1-ZTEC300':
                objArrayOutage= angular.copy(globalData.forecastingOutageData_OLT1);
                break;
            case 'BKS-GDHB2-OLT1-ZTEC300':
                objArrayOutage= angular.copy(globalData.forecastingOutageData_OLT2);
                break;
        }
        
        var startTime= null;

        var valArray= [], rangeArray= [], ExpectedArray= [], fiber_error_Data= [],high_utilization_Data= [],olt_lineCard_Data= [], power_connection_Data= [];

        for(var i in objArrayOutage){
            startTime=objArrayOutage[i].DT;
            
            fiber_error_Data.push([startTime,objArrayOutage[i].cause_fibre_error]);
            high_utilization_Data.push([startTime,objArrayOutage[i].cause_high_utilization])
            olt_lineCard_Data.push([startTime,objArrayOutage[i].cause_OLT_Line_card_error])
            power_connection_Data.push([startTime,objArrayOutage[i].cause_power_connection_error])
            
            if(i < (objArrayOutage.length-504)){
                valArray.push([startTime,objArrayOutage[i].OLT_faults]);
                rangeArray.push([startTime,null,null]);
                ExpectedArray.push([startTime,null]);
            }else{
                valArray.push([startTime,null]);
                rangeArray.push([startTime,parseInt(objArrayOutage[i].OLT_faults_low),parseInt(objArrayOutage[i].OLT_faults_high)]);
                ExpectedArray.push([startTime,parseInt(objArrayOutage[i].OLT_faults)]);
            }
        }

        $scope.forecastingOutageConfig={
            options: option,
            series: [{
                name: 'Historical',
                data: valArray,
                zIndex: 1,
                color:'rgb(124, 181, 236)',
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: 'Predictive',
                data: ExpectedArray,
                zIndex: 2,
                color: "#ffbf00",
                marker: {
                    fillColor: '#ffbf00',
                    lineWidth: 0.5,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            }, {
                name: '80% Confidence Interval',
                data: rangeArray,
                type: 'arearange',
                lineWidth: 2,
                linkedTo: ':previous',
                color: "#003399",//Highcharts.getOptions().colors[0],
                fillOpacity: 0.6,
                zIndex: 0,
                marker: {
                    enabled: false
                }
            }]
        }
        
        $scope.forecastingOutageMLConfig={
            options: optionFault,
            series: [{
                name: 'Fiber Error',
                type:'column',
                data: fiber_error_Data,
                zIndex: 1,
                color:'rgb(124, 181, 236)',
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: 'High Utilization',
                type:'column',
                data: high_utilization_Data,
                zIndex: 2,
                color: "#ffbf00",
                marker: {
                    fillColor: '#ffbf00',
                    lineWidth: 0.5,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: 'OLT Line Card Error',
                type:'column',
                data: olt_lineCard_Data,
                zIndex: 2,
                color: "#1F9EA3",
                marker: {
                    fillColor: '#1F9EA3',
                    lineWidth: 0.5,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                name: 'Power Connection Error',
                data: power_connection_Data,
                type:'column',
                zIndex: 2,
                color: "#f7a35c",
                marker: {
                    fillColor: '#f7a35c',
                    lineWidth: 0.5,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            }]
        }
        
        $scope.loadingDiv= false;
        $scope.noDataDiv= false;
            
        $scope.forecastingOutageTableObj= angular.copy(globalData.outageTabObj)
       
    }

    function defaultLoad(){
       
       getOutagePrediction();
        
    }
    
    defaultLoad();
    
    //change outage OLT
    $scope.changOutageOLT= function(){
        defaultLoad();
    }

}
// End forecasting Outage Controller
//    ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// forecasting Equipment Controller
function forecastingEquipCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter,  highchartOptions,utility, locationFilterService, highchartProcessData, filterService, globalData, SweetAlert) {
    
    //track url starts
    utility.trackUrl();
    //end track url

    $scope.monthBtn= {
        'M1': true,
        'M3': false,
        'M6': false
    }
    
    function getEquipFailurePrediction(){
        
        if ($scope.monthBtn['M1']){
            $scope.equipTableObj= angular.copy(globalData.equipTabObj1M);
            $scope.max= 340
            $scope.stacked = [
                {
                    value:145,
                    type: 'danger'
                },{
                    value: 62,
                    type: 'info'
                },{
                    value: 133,
                    type: 'success'
                }
            ];
        }
        if ($scope.monthBtn['M3']){
            $scope.equipTableObj= angular.copy(globalData.equipTabObj3M);
            $scope.max= 340
            $scope.stacked = [
                {
                    value:155,
                    type: 'danger'
                },{
                    value: 80,
                    type: 'info'
                },{
                    value: 105,
                    type: 'success'
                }
            ];
        }
        if ($scope.monthBtn['M6']){
            $scope.equipTableObj= angular.copy(globalData.equipTabObj6M);
            $scope.max= 340;
            $scope.stacked = [
                {
                    value:163,
                    type: 'danger'
                },{
                    value: 89,
                    type: 'info'
                },{
                    value: 88,
                    type: 'success'
                }
            ];
        }

   }

    function defaultLoad(){
       
       getEquipFailurePrediction();
        
    }
    
    defaultLoad();
    
    //month button click event
    $scope.statusMnthBtn= function(oneMnth,threeMnth,sixMnth){
        $scope.monthBtn['M1']= oneMnth;
        $scope.monthBtn['M3']= threeMnth;
        $scope.monthBtn['M6']= sixMnth;
         defaultLoad();
    }
    

}
// End forecasting Equipment Controller
//    ----------------------------------------------------------------------------
//OLT Outage Controller
function oltOutageCtrl($scope,httpService,globalConfig,$filter,$timeout,dataFormatter, highchartOptions,utility,  highchartProcessData, filterService, dbService){
    
    //track url starts
    utility.trackUrl();
    //end track url

    //Date filter
    //------------------------------------
    var selectedDate;
    $scope.changeDate=function (modelName, newDate) {
        selectedDate= newDate.format();
        selectedDate= selectedDate.substring(0,10);
        $scope.dateSelect= selectedDate
    }

    //--------------------------------------------
    var finalArray= [], tempLevel=0, counter= 0, levelArray= [], counterArray= [];
    function getNestedObj(objArray, parent, chartLevel){
        // console.log("parent, chartLevel", parent, chartLevel);
        var index= $.inArray(chartLevel,levelArray);

        if(index= -1){
            levelArray.push(chartLevel);
            counterArray.push(counter);
        }
        else
            counter= counterArray[index];

        if(tempLevel != chartLevel){
            // counter = 0;
        }else{
            tempLevel= chartLevel;
        }

        for(var count= 0; count< objArray.length; count++){
            counter= counter+count;
            objArray[count]['id']= chartLevel+"."+(counter);
            objArray[count]['parent']= parent;
            objArray[count]['value']= 20;

            switch(objArray[count]['UsageBucket']){
                case '0-500MB':
                    objArray[count]['color']= '#660000';
                    break;
                case '500MB-2GB':
                    objArray[count]['color']= '#ff0000';
                    break;
                case '2-5GB':
                    objArray[count]['color']= '#ff4000';
                    break;
                case '5-10GB':
                    objArray[count]['color']= '#b35900';
                    break;
                case '10-20GB':
                    objArray[count]['color']= '#ff8000';
                    break;
                case '20-40GB':
                    objArray[count]['color']= '#ffc61a';
                    break;
                case '40-70GB':
                    objArray[count]['color']= '#e6e600';
                    break;
                case '70-100GB':
                    objArray[count]['color']= '#b3b300';
                    break;
                case '100-200GB':
                    objArray[count]['color']= '#739900';
                    break;
                case '200-500GB':
                    objArray[count]['color']= '#408000';
                    break;
                case '50-1000GB':
                    objArray[count]['color']= '#1a6600';
                    break;
                case '1000-2000GB':
                    objArray[count]['color']= '#008040';
                    break;
                case '2000GB-Above':
                    objArray[count]['color']= '#00664d';
                    break;
                
            }

            var tempObj= {};
            angular.forEach(objArray[count], function(value, key){
                if(angular.isArray(objArray[count][key])){
                    var temp= chartLevel+1;
                    getNestedObj(objArray[count][key], objArray[count]['id'], temp);
                }else{
                    tempObj[key]= objArray[count][key];
                }
            })
            finalArray.push(tempObj);
        }
        return objArray;
    }
    
    $scope.sunbrustConfig= {
        'options':{
            chart: {
                height: 600,
                events:{
                    click: function(e){
                        console.log("e", e);
                    }
                }
            },
            credits:{
                enabled: false
            },
            title: {
                text: ''
            },
            tooltip: {
                headerFormat: "",
                pointFormat: 'Usage Bucket of {point.type} <b>{point.name}</b> is <b>{point.UsageBucket}</b>'
            }
        },
        'series': [{
            type: "sunburst",
            data: [],
            allowDrillToNode: true,
            allowPointSelect: true,
            turboThreshold: finalArray.length,
            cursor: 'pointer',
            dataLabels: {
                format: '{point.name}',
                filter: {
                    property: 'innerArcLength',
                    operator: '>',
                    value: 16
                }
            },
            events:{
                click: function(e){
                    console.log("e", e);
                }
            }
        }]
    }

    function getCEI(urlMap){
        finalArray= [];
        httpService.get(urlMap).then(function (response) {  
            var objArray = response.data;
            getNestedObj(objArray,'',0);
            // console.log("finalArray", finalArray);
            
            $scope.sunbrustConfig.series[0]["data"]= finalArray; 
           
        })
    }
    
    function defaultLoad(){
        
        $scope.edate= $scope.dateSelect;
        var CEIURL= globalConfig.pullfilterdataurlbyname+"OLT wise Splitter wise clustered data daterange"+"&fromDate="+$scope.dateSelect+"T00:00:00.000Z"+"&toDate="+$scope.dateSelect+"T23:59:59.999Z";
        getCEI(CEIURL);
        
    }
    defaultLoad();
    
    //Date Submit Event
    $scope.click= function(){
        defaultLoad();
    }

  }



  // Thsi function is defined for current date to web site 

  function dateBBCtrl($scope)
  {   
      /*
      Creat a function which take system date to updat the on web site
      */

      $scope.date = new Date();
  }
// End OLT Outage Controller
//    ----------------------------------------------------------------------------


  
  



