'use strict';

angular
    .module('specta')
    .controller('planAnalyticsBBCentralCtrl',planAnalyticsBBCentralCtrl)
    .controller('dnsAnalyticsBBCentralCtrl',dnsAnalyticsBBCentralCtrl)
    .controller('cdnAnalyticsBBCentralCtrl',cdnAnalyticsBBCentralCtrl)
    .controller('appTrendBBCentralCtrl',appTrendBBCtrl)
    
// ========================================================

// Plan/App/ App Segment/ Segment Analytics Controller

function planAnalyticsBBCentralCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams,utility, dbService) {
    $scope.circles= [{circle: 'Dhaka'},{circle: 'Chittagong'},{circle: 'Sylhet'},{circle: 'Khulna'},{circle: 'Rajshahi'}];
    // $scope.circles= [{circle: 'Bengaluru'},{circle: 'Mumbai'}];
    
    // console.log('angular.isDefined($stateParams.params)', $stateParams);
    if(angular.isDefined($stateParams.params)){

    }
    // console.log("response.data.name", $scope.headerName);
    $scope.OLTorDSLAM= globalConfig.OLTorDSLAM;
    
    $scope.showTabObj= {};
    var currentPage= $scope.headerName
    if(currentPage== 'Plan Analytics'){
        currentPage= 'Plan';
        $scope.showTabObj= angular.copy(utility.tb_central.planAnalytics)
        
    }
    else if(currentPage== 'App Analytics'){
        currentPage= 'App';
        $scope.showTabObj= angular.copy(utility.tb_central.appAnalytics)
        
    }
    else{ 
        currentPage= 'OLT';
        $scope.showTabObj= angular.copy(utility.tb_central.oltAnalytics)
        
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
    var planIDListArr= [], planNameListArr=[], planListArray= [];
    
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
                }else
                     planListArray[i]= objArray[i][currentPage];
            }
           // $scope.select.plan= planListArray[0]
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
                }
                usageVsUsersChartOptions.yAxis[0].title.text= 'Subscribers';
                usageVsUsersChartOptions.yAxis[1].title.text= 'Usage('+FormattedusageDataArray[1]+")";
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
    
    function UsageVsUsers1(url, circle){
        
        $scope.loadingUsageVsUsersDiv1[circle]= true;
        $scope.DataUsageVsUsersDiv1[circle]= false;
        $scope.noDataUsageVsUsersDiv1[circle]= false;
        
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
                    $scope.UsageVsUsersChartConfig1[circle]= {
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
                        }]
                    };
                    
                }else{
                    usageVsUsersChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
                    $scope.UsageVsUsersChartConfig1[circle]= {
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
                }
                usageVsUsersChartOptions.yAxis[0].title.text= 'Subscribers';
                usageVsUsersChartOptions.yAxis[1].title.text= 'Usage('+FormattedusageDataArray[1]+")";
                $scope.exportUsgSubData= angular.copy(exportUserVsUsage);

                $scope.loadingUsageVsUsersDiv1[circle]= false;
                $scope.DataUsageVsUsersDiv1[circle]= true;
                $scope.noDataUsageVsUsersDiv1[circle]= false;
            }else{
                $scope.loadingUsageVsUsersDiv1[circle]= false;
                $scope.DataUsageVsUsersDiv1[circle]= false;
                $scope.noDataUsageVsUsersDiv1[circle]= true;
            }
        })
    }
    
    function CDNDistribution1(url, tab, usageOrTp, circle){
        if(usageOrTp =="Usage"){
            var OLTDistributionUsersChartOptions= {};
            $scope.loadingUsersDistributionDiv1[circle]= true;
            $scope.DataUsersDistributionDiv1[circle]= false;
            $scope.noDataUsersDistributionDiv1[circle]= false;

            $scope.usersDistributionChartOptions1[circle]= null;

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
                        paramObject.data= usageOrTp;//"Usage";
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
                        OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                        OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                        OLTDistributionUsersChartOptions.tooltip.shared= true;
                        OLTDistributionUsersChartOptions.chart.height= 400;
                        OLTDistributionUsersChartOptions.yAxis.title= {"text":"Usage( GB ) "};
                        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
                        $scope.usersDistributionChartOptions1[circle]= {
                            options: OLTDistributionUsersChartOptions,
                            series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                        }
                        
                        
                        $scope.exportSubDistArray= angular.copy(exportSubDistArray);
        
                        $scope.loadingUsersDistributionDiv1[circle]= false;
                        $scope.DataUsersDistributionDiv1[circle]= true;
                        $scope.noDataUsersDistributionDiv1[circle]= false;
                    }else{
                        $scope.loadingUsersDistributionDiv1[circle]= false;
                        $scope.DataUsersDistributionDiv1[circle]= false;
                        $scope.noDataUsersDistributionDiv1[circle]= true;
                    }
                })
            }
        }else{
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
        }
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

    function appCircleDistribution(urlUsage, urlUsers, tab){
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
                paramObject.unit= "TB";
                
                // console.log("paramObject", paramObject);
                
                var OLTDistributionUsageChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                OLTDistributionUsageChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                OLTDistributionUsageChartOptions.chart.height= 400;
                OLTDistributionUsageChartOptions.yAxis.title= {"text":"Usage (TB)"};
               /* OLTDistributionUsageChartOptions.yAxis.stackLabels.formatter= function() {
                    return dataFormatter.formatUsageData(this.total, 2);
                }*/
                OLTDistributionUsageChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}% </b>';
                OLTDistributionUsageChartOptions.plotOptions.column.stacking= 'normal';
                OLTDistributionUsageChartOptions.tooltip.shared= true;
                OLTDistributionUsageChartOptions.chart.height= 400;

                paramObject.flag= "series";
                paramObject.objArray= objArray;
                $scope.usageDistributionChartConfig= {
                    options: OLTDistributionUsageChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
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
                OLTDistributionUsersChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}% </b>';
                OLTDistributionUsersChartOptions.plotOptions.column.stacking= 'normal';
                OLTDistributionUsersChartOptions.tooltip.shared= true;
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
                
                console.log("paramObject", paramObject);
                
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
                console.log("highchartProcessData.barColumnProcessHighchartData(paramObject)", highchartProcessData.barColumnProcessHighchartData(paramObject));
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
    
    function getCEIDistribution1(url, key, circle){
        var CEIDistributionChartOptions= {};
        $scope.loadingCEIDiv1[circle]= true;
        $scope.DataCEIDiv1[circle]= false;
        $scope.noDataCEIDiv1[circle]= false;
        
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
                
                console.log("paramObject", paramObject);
                
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
                console.log("highchartProcessData.barColumnProcessHighchartData(paramObject)", highchartProcessData.barColumnProcessHighchartData(paramObject));
                $scope.CEIDistributionChartOptions1[circle]= {
                    options: CEIDistributionUsersChartOptions,
                    series: highchartProcessData.barColumnProcessHighchartData(paramObject)
                }
                
                
                $scope['export'+key+'Dist']= angular.copy(objArray);

                $scope.loadingCEIDiv1[circle]= false;
                $scope.DataCEIDiv1[circle]= true;
                $scope.noDataCEIDiv1[circle]= false;
            }else{
                $scope.loadingCEIDiv1[circle]= false;
                $scope.DataCEIDiv1[circle]= false;
                $scope.noDataCEIDiv1[circle]= true;
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

    function getThroughputDistributionHourly(url){
        $scope.loadingHourlyThroughputDiv= true;
        $scope.noDataHourlyThroughputDiv= false;
        $scope.exportSubscriberHourlyThroughput= [];
        var throughputData= [], unformatedThroughputArray= [], formatedThroughputArray= [], usersArray= [], timeArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            
            if(objArray.length>0){
                var exportTpVsSub= angular.copy(objArray);
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    timeArray= objArray[i].Hour;
                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                        exportTpVsSub[i]['Throughput(bps)']=  exportTpVsSub[i]['Throughput'];
                        delete exportTpVsSub[i]['Throughput'];
                    }
                    if(objArray[i].hasOwnProperty('Subscribers')){
                        usersArray.push(parseInt(objArray[i].Subscribers));
                    }
                } 
                // console.log("unformatedThroughputArray", unformatedThroughputArray);
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                // console.log("unformatedThroughputArray", formatedThroughputArray)
                
                for(var i in formatedThroughputArray[0]){
                    formatedThroughputArray[0][i]= parseFloat(formatedThroughputArray[0][i]);
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
                    
                    $scope.throughputHourlyChartConfig= {
                        "options" : optionsThroughputBar,
                        "series": [{name: "Throughput",
                                    color:"rgb(39, 174, 96)",
                                   data: throughputData
                                   },
                                  ]
                    }
                    $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                }else{
                    var usageVsThroughputChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelCategoriesOptions);
                    $scope.throughputHourlyChartConfig= {
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

                        }, {
                            name: 'Subscribers',
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  usersArray,
                            tooltip: {
                                pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }
                        }]
                    };

                    usageVsThroughputChartOptions.xAxis.categories= timeArray;
                    usageVsThroughputChartOptions.xAxis.title= {text:"Hours"};
                
                    usageVsThroughputChartOptions.yAxis[1].title.text= 'Throughput('+formatedThroughputArray[1]+")";
                }
                $scope.loadingHourlyThroughputDiv= false;
                $scope.noDataHourlyThroughputDiv= false;
                $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                
            }else{
                $scope.loadingHourlyThroughputDiv= false;
                $scope.noDataHourlyThroughputDiv= true;
            }
        })
    }

    function getThroughputDistributionHourly1(url, circle){
       
        $scope.loadingHourlyThroughputDiv1[circle]= true;
        $scope.noDataHourlyThroughputDiv1[circle]= false;
        $scope.exportSubscriberHourlyThroughput= [];
        var throughputData= [], unformatedThroughputArray= [], formatedThroughputArray= [], usersArray= [], timeArray= [];
        
        httpService.get(url).then(function (response) {
            var objArray= response.data;
            
            if(objArray.length>0){
                var exportTpVsSub= angular.copy(objArray);
                //console.log("objArray", objArray);
                for(var i=0;i<objArray.length; i++){
                    timeArray[i]= objArray[i].Date;
                    if(objArray[i].hasOwnProperty('Throughput')){
                        unformatedThroughputArray.push(parseInt(objArray[i].Throughput));
                        exportTpVsSub[i]['Throughput(bps)']=  exportTpVsSub[i]['Throughput'];
                        delete exportTpVsSub[i]['Throughput'];
                    }
                    if(objArray[i].hasOwnProperty('Subscribers')){
                        usersArray.push(parseInt(objArray[i].Subscribers));
                    }
                } 
                // console.log("unformatedThroughputArray", unformatedThroughputArray);
                
                formatedThroughputArray= angular.copy(dataFormatter.convertFixUnitThroughputDataWoUnit(unformatedThroughputArray, 3));
                // console.log("unformatedThroughputArray", formatedThroughputArray)
                
                for(var i in formatedThroughputArray[0]){
                    formatedThroughputArray[0][i]= parseFloat(formatedThroughputArray[0][i]);
                }

                if(usersArray.length==0){
                    var index= -1;
                    for(var i=0;i<objArray.length; i++){
                        if(objArray[i].hasOwnProperty('Throughput')){
                            throughputData.push([objArray[i].Date,formatedThroughputArray[0][++index]]);
                        }
                    }
                    // console.log('throughputData', throughputData);
                    var optionsThroughputBar= angular.copy(highchartOptions.highchartBarLabelDatetimeOptions);
                    optionsThroughputBar.yAxis.title.text="Throughput( "+formatedThroughputArray[1]+" )";
                    optionsThroughputBar.tooltip.pointFormat= 'Throughput<b> {point.y:.3f} </b>'+ formatedThroughputArray[1]+'</b>';
                    
                    $scope.throughputHourlyChartConfig1[circle]= {
                        "options" : optionsThroughputBar,
                        "series": [{name: "Throughput",
                                    color:"rgb(39, 174, 96)",
                                   data: throughputData
                                   },
                                  ]
                    }
                    $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                }else{
                    var usageVsThroughputChartOptions= angular.copy(highchartOptions.highchartLinePlusBarLabelDatetimeOptions);
                    
                    $scope.throughputHourlyChartConfig1[circle]= {
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

                        }, {
                            name: 'Subscribers',
                            type: 'spline',
                            color: "#3D8EB9",
                            data:  usersArray,
                            tooltip: {
                                pointFormat: '{series.name}  : <b>{point.y:,.0f}</b>'
                                // valueSuffix: ' '+FormattedusageDataArray[1]
                            }
                        }]
                    };

                    usageVsThroughputChartOptions.xAxis.categories= timeArray;
                    // usageVsThroughputChartOptions.xAxis.title= {text:"Hours"};
                
                    usageVsThroughputChartOptions.yAxis[1].title.text= 'Throughput('+formatedThroughputArray[1]+")";
                }
                $scope.loadingHourlyThroughputDiv1[circle]= false;
                $scope.noDataHourlyThroughputDiv1[circle]= false;
                $scope.exportTpVsSub= angular.copy(exportTpVsSub);
                
            }else{
                $scope.loadingHourlyThroughputDiv1[circle]= false;
                $scope.noDataHourlyThroughputDiv1[circle]= true;
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
                /*$scope.exportUsgSubObj= {};
                $scope.exportUsgSubObj.fileName= $scope.currentPage+' Analytics'+"_Usage Vs "+$scope.UsersOrVisits;
                $scope.exportUsgSubObj.fileHeader= "Usage Vs "+$scope.UsersOrVisits+" Distribution for "+$scope.currentPage+" "+$scope.drdwnSelect+" between "+$scope.sDate+" - "+$scope.edate;

                var UsageVsUsersURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Usage vs Users&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                UsageVsUsers(UsageVsUsersURL);*/

                var appCircleUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" circle wise usage stackedbar daterange&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var appCircleWiseUsersDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" circle wise subscribers stackedbar daterange&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;

                appCircleDistribution(appCircleUsageDistributionURL, appCircleWiseUsersDistributionURL, 'Circle');
                /*for(let i in $scope.circles){
                    var UsageVsUsersURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Usage vs Users&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID+"&circle="+$scope.circles[i].circle;

                    $scope.loadingUsageVsUsersDiv1= {};
                    $scope.DataUsageVsUsersDiv1= {};
                    $scope.noDataUsageVsUsersDiv1= {};
                    $scope.UsageVsUsersChartConfig1= {};

                    UsageVsUsers1(UsageVsUsersURL, $scope.circles[i].circle);
                }*/
           
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

                var segmentWiseUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" segment circle wise usage stackedbar daterange&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var segmentWiseUsersDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" segment circle wise subscribers stackedbar daterange&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                var segmentWiseDurationDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" wise Segment Duration Multiline&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID;
                
                appCircleDistribution(segmentWiseUsageDistributionURL, segmentWiseUsersDistributionURL, 'Circle');
                // durationDistributionMultiline(segmentWiseDurationDistributionURL, 'Segment');
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

                // getCEIDistribution(latencyDistributionURL, 'Latency');
                $scope.loadingCEIDiv1= {};
                $scope.DataCEIDiv1= {};
                $scope.noDataCEIDiv1= {};
                $scope.CEIDistributionChartOptions1= {};
                      
                for(var i in $scope.circles){
                    var latencyDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" circle wise Latency for date range"+"&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID+"&Circle="+$scope.circles[i].circle;
                    

                    getCEIDistribution1(latencyDistributionURL, 'Latency', $scope.circles[i].circle);

                }

                break;
        
            case 'Throughput':

                $scope.TpmDist= {};
                $scope.TpmDist.fileName= $scope.currentPage+' Analytics'+"_Throughput Distribution(Minute wise)"
                $scope.TpmDist.fileHeader= $scope.currentPage+' Analytics'+"_Throughput Distribution(Minute wise) for "+$scope.currentPage+" "+$scope.drdwnSelect+" date "+$scope.edate;
                
                $scope.TphDist= {};
                $scope.TphDist.fileName= $scope.currentPage+' Analytics'+"_Peak Throughput Vs Subscribers (Hourly)"
                $scope.TphDist.fileHeader= $scope.currentPage+' Analytics'+"_Peak Throughput Vs Subscribers (Hourly) for "+$scope.currentPage+" "+$scope.drdwnSelect+" date "+$scope.edate;

                var throughputDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" minute wise Throughput for 1 Day&toDate="+$scope.date.end+"T00:00:00.000Z&"+currentPage+"="+currentPlanID;
                
                
                    getThroughputDistribution(throughputDistributionURL);
                    
                    $scope.loadingHourlyThroughputDiv1= {};
                    $scope.noDataHourlyThroughputDiv1= {};
                    $scope.throughputHourlyChartConfig1= {};
                    
                    for(var i in $scope.circles){
                        var throughputHourlyDistributionURL= globalConfig.pullfilterdataurlbyname+ currentPage+" circle throughput and subscribers for daterange&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID+"&Circle="+$scope.circles[i].circle;
                        
                        getThroughputDistributionHourly1(throughputHourlyDistributionURL, $scope.circles[i].circle);
                    }
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
                $scope.loadingUsersDistributionDiv1= {};
                $scope.DataUsersDistributionDiv1= {};
                $scope.noDataUsersDistributionDiv1= {};

                $scope.usersDistributionChartOptions1= {};

                for(var i in $scope.circles){
                    var CDNUsageDistributionURL= globalConfig.pullfilterdataurlbyname+currentPage+" circle cdn usage distribution stackedbar daterange&fromDate="+$scope.date.start+"T00:00:00.000Z&toDate="+$scope.date.end+"T23:59:59.999Z&"+currentPage+"="+currentPlanID+"&Circle="+$scope.circles[i].circle;
                    
                    CDNDistribution1(CDNUsageDistributionURL, 'CDN', 'Usage', $scope.circles[i].circle);
                }

                // CDNDistribution(CDNTpDistributionURL, 'CDN', 'Throughput');
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
//-----------------------------------------------------------------------------------------------------
// DNS Analytics Controller

function dnsAnalyticsBBCentralCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams,utility, dbService) {

    $scope.showTabObj= angular.copy(utility.tb_central.dnsAnalytics)
    
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
                
                console.log("paramObject", paramObject);
                
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
                optionsLine.tooltip.pointFormat= key+' <b> {point.y:.0f} </b>';
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

function cdnAnalyticsBBCentralCtrl($scope,httpService,globalConfig,$filter,$timeout,$rootScope,$interval,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, $stateParams,utility, dbService) {

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
                $scope.select.tabDrpdwn= angular.copy(appListArray[0]);
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

                var areaLatencyURL= globalConfig.pullfilterdataurlbyname+"CDN-"+$scope.currentTab+" wise Throughput Bucket distribution"+"&fromDate="+$scope.date.start+"T00:00:00.000Z"+"&toDate="+$scope.date.end+"T23:59:59.999Z&CDN="+$scope.select.cdn+"&"+$scope.currentTab+"="+$scope.select.tabDrpdwn;

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

//End CDN Analytics Controller
//-----------------------------------------------------------------------------------------------------
// App Trend Analytics Controller
function appTrendBBCentralCtrl($scope, httpService,globalConfig,$filter,$timeout,$rootScope,dataFormatter, highchartOptions, locationFilterService, highchartProcessData, filterService, dbService, utility) {

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
