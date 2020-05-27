'use strict';

angular
    .module('specta')
    .controller('LantencyBucketCTRL',LantencyBucketCTRL)
    .controller('FirstByteLatencyDistributionBBCtrl',FirstByteLatencyDistributionBBCtrl)
    .controller('ConnectionLatencyCTRL',ConnectionLatencyCTRL)
    .controller('ConnectionLatencyBucketCTRL',ConnectionLatencyBucketCTRL)
    .controller('DataLatencyCTRL',DataLatencyCTRL)
    .controller('DataLatencyBucketCTRL',DataLatencyBucketCTRL)
    .controller('UserLatencyCTRL',UserLatencyCTRL)
    .controller('UserLatencyBucketCTRL',UserLatencyBucketCTRL)


function LantencyBucketCTRL($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal){
        // $scope, $rootScope, httpService, $filter, $state,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal

    $scope.names = ["Hour","Day","Week", "Month"];

    $scope.name = "Day";

    $scope.granularityValue = "Day";

    $scope.sDate= $scope.date.start;
    $scope.edate= $scope.date.end;



     $("#monthpicker1").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })

    $("#monthpicker2").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })


    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });

        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker1").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });

        //Get the value of Start and End of Week
        $('#weeklyDatePicker1').on('dp.change', function (e){
            var value = $("#weeklyDatePicker1").val();
            $scope.secondWeekdate = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            var lastDate =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker1").val($scope.secondWeekdate + " - " + lastDate);
        });
    });


    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });

        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker2").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });

        //Get the value of Start and End of Week
        $('#weeklyDatePicker2').on('dp.change', function (e){
            var value = $("#weeklyDatePicker2").val();
            $scope.firstDateofWeek = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            $scope.lastDateofWeek =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker2").val($scope.firstDateofWeek + " - " + $scope.lastDateofWeek);
        });

    });

function defaultLoad(){

    $scope.sDate= $scope.date.start;
    $scope.edate = $scope.date.end;


    // console.log("start date ", $scope.sDate)
    // console.log("end date ",$scope.edate )

    // $scope.sDate= '2020-04-02';
    // $scope.edate = '2020-04-05';

    function convert(str) {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }

    var date = new Date();
    var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var previousMonthDate = new Date(date.getFullYear(), date.getMonth()-1, 1);

    $scope.startDate =  convert(firstDayofMonth)

    // $("#datepicker").datepicker({
    //     clearBtn : true,
    //     autoclose: true,
    //     format: "mm-yyyy",
    //     viewMode: "months",
    //     minViewMode: "months",
    // }).datepicker('setDate', firstDayofMonth);


    // console.log($scope.firstDateofWeek)

    var TpBktDistributionUsersChartOptions= {};
    $scope.loadingTpBktDistributionDiv= true;
    $scope.DataTpBktDistributionDiv= false;
    $scope.noDataTpBktDistributionDiv= false;
    $scope.TpBktDistributionChartOptions= null;


    // This is for multilien display on same page

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


    var userLatencyURL      = globalConfig.pullfilterdataurl+"a6ceff7kkjhdatala3erutyte3&fromDate="+$scope.sDate+"T00:00:00.000Z&toDate="+$scope.edate+"T23:59:59.999Z&granularity="+$scope.granularityValue;
    var firstbyteLatencyURL = globalConfig.pullfilterdataurl+"a6ceff7kkjhdatala3erutyte3&fromDate="+$scope.sDate+"T00:00:00.000Z&toDate="+$scope.edate+"T23:59:59.999Z&granularity="+$scope.granularityValue;
    var dataLatencyURL      = globalConfig.pullfilterdataurl+"a6ceff7kkjhdatala3erutyte2&fromDate="+$scope.sDate+"T00:00:00.000Z&toDate="+$scope.edate+"T23:59:59.999Z&granularity="+$scope.granularityValue;
    var connectionLatecnyURL = globalConfig.pullfilterdataurl+"a6ceff7kkjhdatala3erutyte0&fromDate="+$scope.sDate+"T00:00:00.000Z&toDate="+$scope.edate+"T23:59:59.999Z&granularity="+$scope.granularityValue;

    if($scope.granularityValue=='Hour'){

    //    var dateInMillesecond = moment($scope.date.start, "YYYY-MM-DD").toDate().getTime()
    

       var timeArray = [];
       var hourinMillesecond;

        // //  this is for first byte latency
        httpService.get(firstbyteLatencyURL).then(function(response){


            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);

                // for(var i=0;i<objArray.length; i++){
                //     timeArray = objArray[i]['data'];
                //     for(var j= 0;j<timeArray.length;j++){
                //         hourinMillesecond  = timeArray[j].Hour*60*60*1000+dateInMillesecond;
                //         timeArray[j].Hour = hourinMillesecond;
                //         console.log("Hour millisecond ",hourinMillesecond)
                //     }
                //     objArray[i]['data'] = timeArray;
                    
                // }

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Hour";
                paramObject.data= "Count";
                paramObject.seriesName= "Bucket";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var label_name =  this.series.name;
                            var hourNumber  = this.category;
                            var granularity = $scope.granularityValue;
                            var params = {
                                fromDate: $scope.date.start,
                                hourNumber : hourNumber,
                                bucket_name: label_name,
                                pageId: $stateParams.id,
                                granularity : granularity
                            }
                             $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'FirstByteLatencyDetail.html', id: null});
                            // displaySubList(key,point_click_date,label_name)
                        }
                    }
                };

                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

                console.log("Export Subdist array ", $scope.exportUsgDistArray)

                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= true;
                $scope.noDataTpBktDistributionDiv= false;
            }else{
                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= false;
                $scope.noDataTpBktDistributionDiv= true;
            }
        })

              // this is for user latency
        httpService.get(userLatencyURL).then(function(response){

            // var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);

                // for(var i=0;i<objArray.length; i++){
                //     timeArray = objArray[i]['data'];
                //     for(var j= 0;j<timeArray.length;j++){
                //         hourinMillesecond  = timeArray[j].Hour*60*60*1000+dateInMillesecond;
                //         timeArray[j].Hour = hourinMillesecond;
                //     }
                //     objArray[i]['data'] = timeArray;
                    
                // }

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Hour";
                paramObject.data= "Count";
                paramObject.seriesName= "Bucket";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var UserLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                UserLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);

                console.log("UserLatencyChartOptions.xAxis.categories",UserLatencyChartOptions.xAxis.categories)
                UserLatencyChartOptions.yAxis.labels= {enabled: true};
                UserLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                UserLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                UserLatencyChartOptions.plotOptions.column.stacking= 'normal';
                UserLatencyChartOptions.tooltip.shared= true;
                UserLatencyChartOptions.chart.height= 400;
                UserLatencyChartOptions.yAxis.title= {"text":"Count"};
                UserLatencyChartOptions.xAxis.title= {"text":"Hours"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                console.log("Param object array ",objArray)

                UserLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var label_name = this.series.name;
                            var categories  = this.category;
                            console.log("categories",categories)
                            var point_click_date = $filter('date')( this.category , "yyyy-MM-dd");
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', point_click_date)
                            console.log("labelname ",label_name)
                            // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'PotentialupgradeDeatil.html', id: null});
                            // displaySubList(key,point_click_date,label_name)
                        }
                    }
                };

                $scope.UserLatencyChartOptions= {
                    options:UserLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= true;
                $scope.noDataTpBktDistributionDiv= false;
            }else{
                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= false;
                $scope.noDataTpBktDistributionDiv= true;
            }
        })

        // This is for data latency bucket distribution
        httpService.get(dataLatencyURL).then(function(response){

            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                

                // for(var i=0;i<objArray.length; i++){
                //     timeArray = objArray[i]['data'];
                //     for(var j= 0;j<timeArray.length;j++){
                //         hourinMillesecond  = timeArray[j].Hour*60*60*1000+dateInMillesecond;
                //         timeArray[j].Hour = hourinMillesecond;
                //     }
                //     objArray[i]['data'] = timeArray;
                    
                // }

                // console.log("objArray ",objArray)

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Hour";
                paramObject.data= "Count";
                paramObject.seriesName= "Bucket";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var DataLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                DataLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                DataLatencyChartOptions.yAxis.labels= {enabled: true};
                DataLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                DataLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                DataLatencyChartOptions.plotOptions.column.stacking= 'normal';
                DataLatencyChartOptions.tooltip.shared= true;
                DataLatencyChartOptions.chart.height= 400;
                DataLatencyChartOptions.yAxis.title= {"text":"Count"};
                DataLatencyChartOptions.xAxis.title= {"text":"Hours"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                DataLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var label_name = this.series.name;
                            var point_click_date = $filter('date')( this.category , "yyyy-MM-dd");
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', point_click_date)
                            console.log("labelname ",label_name)
                            // displaySubList(key,point_click_date,label_name)
                        }
                    }
                };

                $scope.DataLatencyChartOptions= {
                    options:DataLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= true;
                $scope.noDataTpBktDistributionDiv= false;
            }else{
                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= false;
                $scope.noDataTpBktDistributionDiv= true;
            }
        })

        // // THis is for connection latency buclet distribution
        httpService.get(connectionLatecnyURL).then(function(response){


            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData

                // for(var i=0;i<objArray.length; i++){
                //     timeArray = objArray[i]['data'];
                //     for(var j= 0;j<timeArray.length;j++){
                //         hourinMillesecond  = timeArray[j].Hour*60*60*1000+dateInMillesecond;
                //         timeArray[j].Hour = hourinMillesecond;
                //     }
                //     objArray[i]['data'] = timeArray;
                    
                // }

                var exportSubDistArray= angular.copy(objArray);
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Hour";
                paramObject.data= "Count";
                paramObject.seriesName= "Bucket";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var ConnectionLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                ConnectionLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                ConnectionLatencyChartOptions.yAxis.labels= {enabled: true};
                ConnectionLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                ConnectionLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                ConnectionLatencyChartOptions.plotOptions.column.stacking= 'normal';
                ConnectionLatencyChartOptions.tooltip.shared= true;
                ConnectionLatencyChartOptions.chart.height= 400;
                ConnectionLatencyChartOptions.yAxis.title= {"text":"Count"};
                ConnectionLatencyChartOptions.xAxis.title= {"text":"Hours"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                ConnectionLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var bucket_name = this.series.name;
                            var bucket_date =  $scope.date.start;
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                endDate : bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }

                            console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'connectionLatency.html', id: null});
                        }
                    }
                };

                $scope.ConnectionLatencyChartOptions= {
                    options:ConnectionLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

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
    else{
         // //  this is for first byte latency
         httpService.get(firstbyteLatencyURL).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var bucket_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }

                            console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'FirstByteLatencyDetail.html', id: null});
                        }
                    }
                };

                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= true;
                $scope.noDataTpBktDistributionDiv= false;
            }else{
                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= false;
                $scope.noDataTpBktDistributionDiv= true;
            }
        })



         // this is for user latency
        httpService.get(userLatencyURL).then(function(response){

            console.log("Response data",response)

            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                console.log("exportSubDistArray",exportSubDistArray)
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var UserLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                UserLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                UserLatencyChartOptions.yAxis.labels= {enabled: true};
                UserLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                UserLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                UserLatencyChartOptions.plotOptions.column.stacking= 'normal';
                UserLatencyChartOptions.tooltip.shared= true;
                UserLatencyChartOptions.chart.height= 400;
                UserLatencyChartOptions.yAxis.title= {"text":"Count"};
                UserLatencyChartOptions.xAxis.title= {"text":"Time"};

                paramObject.flag= "series";
                paramObject.objArray= objArray;

                UserLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            var bucket_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;

                            var params = {
                                fromDate: bucket_date,
                                endDate : bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }

                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'userLatency.html', id: null});
                        }
                    }
                };

                $scope.UserLatencyChartOptions= {
                    options:UserLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= true;
                $scope.noDataTpBktDistributionDiv= false;
            }else{
                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= false;
                $scope.noDataTpBktDistributionDiv= true;
            }
        })

        // This is for data latency bucket distribution
        httpService.get(dataLatencyURL).then(function(response){

            console.log("Response data",response)

            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);

                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var DataLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                DataLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                DataLatencyChartOptions.yAxis.labels= {enabled: true};
                DataLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                DataLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                DataLatencyChartOptions.plotOptions.column.stacking= 'normal';
                DataLatencyChartOptions.tooltip.shared= true;
                DataLatencyChartOptions.chart.height= 400;
                DataLatencyChartOptions.yAxis.title= {"text":"Count"};
                DataLatencyChartOptions.xAxis.title= {"text":"Time"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                //  dataLatency.html
                
                DataLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            var bucket_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;

                            var params = {
                                fromDate: bucket_date,
                                endDate : bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }

                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatency.html', id: null});
                        }
                    }
                };

                $scope.DataLatencyChartOptions= {
                    options:DataLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= true;
                $scope.noDataTpBktDistributionDiv= false;
            }else{
                $scope.loadingTpBktDistributionDiv= false;
                $scope.DataTpBktDistributionDiv= false;
                $scope.noDataTpBktDistributionDiv= true;
            }
        })

       
        // // THis is for connection latency buclet distribution
        httpService.get(connectionLatecnyURL).then(function(response){

            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);

                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var ConnectionLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                ConnectionLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                ConnectionLatencyChartOptions.yAxis.labels= {enabled: true};
                ConnectionLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                ConnectionLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                ConnectionLatencyChartOptions.plotOptions.column.stacking= 'normal';
                ConnectionLatencyChartOptions.tooltip.shared= true;
                ConnectionLatencyChartOptions.chart.height= 400;
                ConnectionLatencyChartOptions.yAxis.title= {"text":"Count"};
                ConnectionLatencyChartOptions.xAxis.title= {"text":"Time"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                ConnectionLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var bucket_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                endDate : bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }

                            console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'connectionLatency.html', id: null});
                        }
                    }
                };

                $scope.ConnectionLatencyChartOptions= {
                    options:ConnectionLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

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



    defaultLoad()

    $scope.changeDate=function (modelName, newDate) {
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
        console.log("$scope.dateSelect",$scope.dateSelect)
     }

    $scope.click = function(){

        var name = $scope.name;
        function convert(str) {
            var date = new Date(str),
                mnth = ("0" + (date.getMonth() + 1)).slice(-2),
                day = ("0" + date.getDate()).slice(-2);
            return [date.getFullYear(), mnth, day].join("-");
        }

        if(name=="Month"){

            $scope.granularityValue = "Month"
            $scope.date.start =  convert($("#monthpicker1").datepicker('getDate'));
            $scope.date.end =  convert($("#monthpicker2").datepicker('getDate'));




        }
        else if(name=="Hour"){

            $scope.granularityValue = "Hour";
            $scope.date.start =  $scope.dateSelect;
            $scope.date.end =  $scope.dateSelect;

            console.log("$scope.date.start", $scope.dateSelect)

        }
        else if(name=="Week"){
            $scope.granularityValue = "Week";
            $scope.date.start = $scope.firstDateofWeek;
            $scope.date.end = $scope.secondWeekdate

        }

        else{
            $scope.granularityValue = "Day";
            $scope.date.start = $scope.date.start;
            $scope.date.end  = $scope.date.end;
        }
        defaultLoad();
    }


}

// This module for update the potentail upgrade base 
function FirstByteLatencyDistributionBBCtrl($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal
    ){
        
    var _url = globalConfig.pullfilterdataurl+"a6ceif7k7jhdatala6a5a3l34l5l6";
    // a6ceif7k7jhdatala6a5a3l34l5l10
    var granularityValue = $stateParams.params.granularity;

    if($stateParams.params.granularity=='Hour') {
        var startDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularity=$stateParams.params.granularity;
        var hour = $stateParams.params.hourNumber;
        $scope.startDate = startDate;
        _url += "&fromDate="+startDate+"T00:00:00.000Z";
        var bucket_name = $stateParams.params.bucket_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Bucket='+encodeURIComponent(bucket_name);
        _url += '&granularity='+granularity;
        _url += '&Hour='+hour;

    }
    else{
        var startDate = $filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd");
        var granularity=$stateParams.params.granularity;
        var hour = $stateParams.params.categorie;
        $scope.startDate = startDate;
        _url += "&fromDate="+startDate+"T00:00:00.000Z";
        var bucket_name = $stateParams.params.bucket_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Bucket='+encodeURIComponent(bucket_name);
        _url += '&granularity='+granularity;

    }


    console.log("URL ",_url)
    $scope.loadingDiv= true; 
    $scope.noDataDiv= false;
    $scope.sdate = $scope.startDate;

    var plotOptions = {
        series: {
            point: {
                events: {
                    click: function(e){
                    // var seriesName = e.point.series.name;
                    var latency_type= e.point.name;
                    console.log(e.point.name)
                    // // console.log("point name ",e.point.name[0])
                    // console.log('e', new Date(e.point.category), e, seriesName);
                    // var params = {
                    //     fromDate: $scope.sdate,
                    //     clickableTooltip: e.point.name,
                    //     Priority : e.point.name,
                    //     seriesName: seriesName,
                    //     pageId: $stateParams.id
                    // }
                    // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'connectionLatency.html', id: null});
                   
                            var bucket_name = $stateParams.params.bucket_name;
                            var bucket_date =  $scope.startDate;;
                            var granularity = granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            var params = {
                                fromDate: bucket_date,
                                endDate : bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }
                            // console.log("param value first byte distribution ",params)
                            // displaySubList(key,point_click_date,label_name)
                            if(latency_type=='Connection Latency'){
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'connectionLatency.html', id: null});
                            }
                            else{
                                // console.log("this is for user latency ");
                                $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'userLatency.html', id: null});
                            }
                }
             }
          }
        }
    };
    
    httpService.get(_url).then(function(response){
        var objArray= response.data;
        // console.log("objArray", objArray);
        $scope.UserLatency = 0;
        $scope.ConnectionLatency= 0;
        $scope.DataLatency= 0;
        
        for(var i in objArray){
            if(objArray[i].Latency == "User Latency")
            $scope.UserLatency= objArray[i].Count;
            else if(objArray[i].Latency == "Connection Latency")
            $scope.ConnectionLatency= objArray[i].Count;
            else if(objArray[i].Latency == "Data Latency")
            $scope.DataLatency= objArray[i].Count;
        }


        if(objArray.length>0){

            var pieChartArray= [];
            
            //for pie chart data
            for(var i=0; i<objArray.length; i++){

                if(objArray[i].Latency == "User Latency"){

                    pieChartArray[i]= {
                        name: objArray[i].Latency, 
                        y: parseFloat(objArray[i].Count),
                        color: "#F13C59"
                    };
                }
                else if(objArray[i].Latency == "Connection Latency"){
                    // $scope.HL= objArray[i].Users;

                    pieChartArray[i]= {
                        name: objArray[i].Latency, 
                        y: parseFloat(objArray[i].Count),
                        color: '#52D726'
                    };
                }
                else if(objArray[i].Latency == "Data Latency"){
                    // $scope.LH= objArray[i].Users;

                    pieChartArray[i]= {
                        name: objArray[i].Latency, 
                        y: parseFloat(objArray[i].Count),
                        color: "#007ED6"
                    };
                }
                
            }

            var pieChartOpt= angular.copy(highchartOptions.highchartPieLegendOptionsWithClickable);
            // pieChartOpt.plotOptions.pie.dataLabels.style.color= globalConfig.colorpalette;
            // pieChartOpt.plotOptions.pie.dataLabels.format= '<b>{point.name}</b>: {point.y:.0f}';
            // pieChartOpt.tooltip.pointFormat='{series.name}: <b>{point.y:.0f}</b>';

            // pieChartOpt.pie.point.events = plotOptions;

            pieChartOpt.plotOptions = plotOptions;

            $scope.pieChartConfig= {
                "options" : pieChartOpt,
                series: [{
                    name: "Latency",
                    colorByPoint: true,
                    showInLegend:true,
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

    $scope.goBackPage = function(){
        $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
    }


}

//  Connection Latency 

function ConnectionLatencyCTRL($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal){

$scope.names = ["Hour","Day","Week", "Month"];
$scope.rowCount = '10';
$scope.name = "Day";
$scope.group = "Count"

$scope.granularity = "Day";

$scope.granularityValue;

$scope.bucketName;

// $scope.sDate= $scope.date.start;
// $scope.edate= $scope.date.end;


 $("#monthpicker1").datepicker({
    clearBtn : true,
    autoclose: true,
    format: "mm-yyyy",
    viewMode: "months",
    minViewMode: "months",
})

$("#monthpicker2").datepicker({
    clearBtn : true,
    autoclose: true,
    format: "mm-yyyy",
    viewMode: "months",
    minViewMode: "months",
})


$(document).ready(function(){
    moment.locale('en', {
        week: { dow: 1 } // Monday is the first day of the week
    });

    //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
    $("#weeklyDatePicker1").datetimepicker({
        format: 'YYYY-MM-DD',
        calendarWeeks: true,
    });

    //Get the value of Start and End of Week
    $('#weeklyDatePicker1').on('dp.change', function (e){
        var value = $("#weeklyDatePicker1").val();
        $scope.secondWeekdate = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
        var lastDate =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
        $("#weeklyDatePicker1").val($scope.secondWeekdate + " - " + lastDate);
    });
});


$(document).ready(function(){
    moment.locale('en', {
        week: { dow: 1 } // Monday is the first day of the week
    });

    //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
    $("#weeklyDatePicker2").datetimepicker({
        format: 'YYYY-MM-DD',
        calendarWeeks: true,
    });

    //Get the value of Start and End of Week
    $('#weeklyDatePicker2').on('dp.change', function (e){
        var value = $("#weeklyDatePicker2").val();
        $scope.firstDateofWeek = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
        $scope.lastDateofWeek =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
        $("#weeklyDatePicker2").val($scope.firstDateofWeek + " - " + $scope.lastDateofWeek);
    });

});


// console.log("start date ", $scope.sDate)
// console.log("end date ",$scope.edate )

// $scope.sDate= '2020-04-02';
// $scope.edate = '2020-04-05';

function convert(str){
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
}

function fromDateMaker(date,days){
    var date1 = new Date(date);
    date1.setDate(date1.getDate()-days);

    var d = new Date(date1),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');

}

var date = new Date();
var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
var previousMonthDate = new Date(date.getFullYear(), date.getMonth()-1, 1);

$scope.startDate =  convert(firstDayofMonth)

// $("#datepicker").datepicker({
//     clearBtn : true,
//     autoclose: true,
//     format: "mm-yyyy",
//     viewMode: "months",
//     minViewMode: "months",
// }).datepicker('setDate', firstDayofMonth);


// console.log($scope.firstDateofWeek)

var TpBktDistributionUsersChartOptions= {};
$scope.loadingTpBktDistributionDiv= true;
$scope.DataTpBktDistributionDiv= false;
$scope.noDataTpBktDistributionDiv= false;
$scope.TpBktDistributionChartOptions= null;


// This is for multilien display on same page

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

var _url = globalConfig.pullfilterdataurl+"a6ceif7esdfgv789987760";


if($stateParams.params.bucket_name){

    if($stateParams.params.granularity=='Hour'){

    var startDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
    var granularityValue=$stateParams.params.granularity;
    granularityValue = $stateParams.params.granularity;
    $scope.granularityValue = $stateParams.params.granularity;
    var hour = $stateParams.params.hourNumber;
    _url += "&fromDate="+startDate+"T00:00:00.000Z";
    var bucket_name = $stateParams.params.bucket_name;
    // var bucket_name="['"+$stateParams.params.bucket_name +"']"
    _url += '&Bucket='+encodeURIComponent(bucket_name);
    _url += '&granularity='+granularityValue;
    _url += '&rowCount='+$scope.rowCount;

    }else{

        var startDate
        if($stateParams.params.granularity=='Day'){
            granularityValue=$stateParams.params.granularity;
            startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),7);
        }
        else if($stateParams.params.granularity=='Week'){
            granularityValue=$stateParams.params.granularity;
            startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),50);
        }
        else{
            granularityValue='Month';
            startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),185);
        }

    var endDate = $filter('date')($stateParams.params.endDate, "yyyy-MM-dd");
    var granularityValue=$stateParams.params.granularity;
    _url += "&fromDate="+startDate+"T00:00:00.000Z"+"&toDate="+endDate+"T23:59:59.999Z";
    var bucket_name = $stateParams.params.bucket_name;
    $scope.bucketName = bucket_name
    // var bucket_name="['"+$stateParams.params.bucket_name +"']"
    _url += '&Bucket='+encodeURIComponent(bucket_name);
    _url += '&granularity='+granularityValue;
    _url += '&rowCount='+$scope.rowCount;

}

}


// _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z";

// _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";

if(granularityValue=='Hour'){
        
    httpService.get(_url).then(function(response){

            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);

                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Hour";
                paramObject.data= "Count";
                paramObject.seriesName= "Appname";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            // console.log(event, this);
                            // console.log(this.options);
                            var app_name =  this.series.name;
                            var hourNumber  = this.category;
                            var granularity = granularityValue;
                            var params = {
                                fromDate: $scope.date.start,
                                bucket_name: app_name,
                                pageId: $stateParams.id,
                                granularity : granularity
                            }

                            console.log(" paramas ",params)
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'connectionLatencyBucket.html', id: null});
                            // displaySubList(key,point_click_date,label_name)
                        }
                    }
                };

                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

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
else{
        
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Appname";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var app_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            // console.log('from', bucket_date)
                            // console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                app_name: app_name,
                                pageId: $stateParams.id
                            }
                            console.log(" paramas ",params)
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'connectionLatencyBucket.html', id: null});
                            // displaySubList(key,point_click_date,label_name)
                            
                        }
                    }
                };

                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
                    series:highchartProcessData.barColumnProcessHighchartData(paramObject),

                }


                $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);

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

var areas = [];
var plans = [];



$scope.tree = {
    area: false,
    plan: false,
    // segment:false,
    // node   : false,
    // bras : false,
    // bts :false
};

$scope.toggleUsageFilter = function(){
    angular.element('#tglFilter').toggle();
} 

$scope.toggleCountFilter = function(){
    angular.element('#cntFilter').toggle();
} 
//Group By filter 
$scope.ratData = [
    {"title":"PlanType","key":"Plantype"},
    {"title":"Zone","key":"zone"},
    {"title":"Validity","key":"validity"},
    {"title":"City","key":"city"}
]; 

$scope.onTree = function(action){
    for (var i in $scope.tree) {
        if (i != action) {
            $scope.tree[i] = false;
        } else {
            $scope.tree[i] = !$scope.tree[i];
        }
    }
}

// --------------------------------------------------- App Filter ----------------------------------------------------------
 
var selectedAreas = [];
$scope.selectedAreas = selectedAreas;

var areaList = {
    checkbox: true,
    selectMode: 3,
    classNames: {connector: "dynatree-connector", nodeIcon: ''},
    // children: [],
    onSelect: function(select, node) {
        var selNodes = node.tree.getSelectedNodes();
               
        // Get a list of all selected nodes, and convert to a key array:
        selectedAreas = $.map(selNodes, function(node){
            return node.data.key;
        });
        $scope.selectedAreas = selectedAreas;
    }
}

function getArea(){
    var params = 'collection=lku_app&op=select&db=datadb';

    httpService.get(globalConfig.dataapiurl + params).then(function (res) {
        _.forEach(res.data, function(item){
            item.title = item.App;
            item.key = item.App;
        });
        areaList.children = res.data;
        areas = areaList.children;
        $("#area").dynatree(angular.copy(areaList));
    });

    console.log("areaList  ",areaList)
}
getArea();

// ----------------------------------------------- Bucket Filter ------------------------------------------

var selectedPlans = [];
$scope.selectedPlans = selectedPlans;
    var planList = {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},
        // children: [],
        onSelect: function(select, node) {
            var selNodes = node.tree.getSelectedNodes();
                
            // Get a list of all selected segment, and convert to a key array:
            selectedPlans = $.map(selNodes, function(node){
                return node.data.key;
            });
            $scope.selectedPlans = selectedPlans;
        }

    }
 
    function getPlan(){
         var params = 'collection=lku_datalatency_buckets&op=select&db=datadb';
         httpService.get(globalConfig.dataapiurl + params).then(function (res) {
             _.forEach(res.data, function(item){
                 item.title = item.bktname;
                 item.key = item.bktname;
             });
             planList.children = res.data;
             $("#plan").dynatree(angular.copy(planList));
         })
     }
    getPlan();

function filterLoad(){


    $scope.sDate=  $scope.date.start;
    $scope.edate = $scope.date.end;

    var _url = globalConfig.pullfilterdataurl+"a6ceif7esdfgv789987760";

    
    _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";

    //  Adding a App name to URL
    // if(selectedAreas.length > 0) {
    //     var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
    //     _url += "&Area="+encodeURIComponent(Area);
    // }

    //  Adding Bucket name to URL

    if(selectedPlans.length > 0) {
        // var bucket = JSON.stringify(selectedPlans).replace(/"/g,"'");
        _url += "&Bucket="+selectedPlans;
        // $scope.bucketName = selectedPlans;
    }


    if($scope.granularity=='Hour'){

        var granularityValue=$scope.granularity;
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;


        httpService.get(_url).then(function(response){
    
                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Hour";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Appname";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                    // console.log("paramObject", paramObject);
    
                    var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                    FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                    FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                    FirstByteLatencyChartOptions.tooltip.shared= true;
                    FirstByteLatencyChartOptions.chart.height= 400;
                    FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                    FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
    
    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
    
                    FirstByteLatencyChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(event, this);
                                console.log(this.options);
                                var label_name =  this.series.name;
                                var hourNumber  = this.category;
                                var granularity = granularityValue;
                                var params = {
                                    fromDate: $scope.date.start,
                                    hourNumber : hourNumber,
                                    app_name: label_name,
                                    pageId: $stateParams.id,
                                    granularity : granularity
                                }
                                // console.log("PARAM",params)
                                $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'connectionLatencyBucket.html', id: null});
                                // displaySubList(key,point_click_date,label_name)
                            }
                        }
                    };
    

                    $scope.FirstByteLatencyChartOptions= {
                        options:FirstByteLatencyChartOptions,
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
    else{

    var granularityValue=$scope.granularity;
    _url += '&granularity='+granularityValue;
    _url += '&rowCount='+$scope.rowCount;
    
    httpService.get(_url).then(function(response){
        var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
        var objArray= response.data;
        $scope.exportSubDistArray= [];
        if(objArray.length>0){
            //exportObjData
            var exportSubDistArray= angular.copy(objArray);
                var paramObject= {};
                paramObject.objArray= objArray;
                paramObject.label= "Date";
                paramObject.data= "Count";
                paramObject.seriesName= "Appname";
                paramObject.seriesdata= "data";
                paramObject.flag= "xAxis";

            // console.log("paramObject", paramObject);

            var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
            FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
            FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
            FirstByteLatencyChartOptions.legend= {maxHeight: 60};
            // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
            FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
            FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
            FirstByteLatencyChartOptions.tooltip.shared= true;
            FirstByteLatencyChartOptions.chart.height= 400;
            FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
            FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};


            paramObject.flag= "series";
            paramObject.objArray= objArray;

            FirstByteLatencyChartOptions.plotOptions.column.point = {
                events:{
                    click: function (event) {
                        console.log(event, this);
                        console.log(this.options);
                        var app_name = this.series.name;
                        var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                        var granularity = granularityValue;
                        // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                        var params = {
                            fromDate: bucket_date,
                            granularity : granularity,
                            app_name: app_name,
                            pageId: $stateParams.id
                        }

                        console.log("param value ",params)
                        // displaySubList(key,point_click_date,label_name)
                        $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'connectionLatencyBucket.html', id: null});
                    }
                }
            };

            $scope.FirstByteLatencyChartOptions= {
                options:FirstByteLatencyChartOptions,
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


}    

$scope.changeDate=function (modelName, newDate){
    $scope.infoLine= false;
    $scope.dateSelect= newDate.format("YYYY-MM-DD");
}

$scope.click = function(){
    
    var name = $scope.name;
    function convert(str) {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }


    if(name=="Month"){

        $scope.granularity = "Month"
        $scope.date.start =  convert($("#monthpicker1").datepicker('getDate'));
        $scope.date.end =  convert($("#monthpicker2").datepicker('getDate'));

    }

    else if(name=="Hour"){

        $scope.granularity = "Hour";
        $scope.date.start =  $scope.dateSelect;
        $scope.date.end =  $scope.dateSelect;

    }
    else if(name=="Week"){
        $scope.granularity = "Week";
        $scope.date.start = $scope.firstDateofWeek;
        $scope.date.end = $scope.secondWeekdate

    }

    else{

        $scope.granularity = "Day";
        $scope.date.start = $scope.date.start;
        $scope.date.end  = $scope.date.end;
    }

    filterLoad()
}

$scope.goBackPage = function(){
    $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
}

}


function ConnectionLatencyBucketCTRL($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal){
    

    $scope.names = ["Hour","Day","Week", "Month"];
    // $scope.rowCount = '10';
    $scope.name = "Day";
    $scope.group = "Count"
    
    $scope.granularity = "Day";

    
    // $scope.sDate= $scope.date.start;
    // $scope.edate= $scope.date.end;
    
    
     $("#monthpicker1").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    $("#monthpicker2").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker1").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker1').on('dp.change', function (e){
            var value = $("#weeklyDatePicker1").val();
            $scope.secondWeekdate = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            var lastDate =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker1").val($scope.secondWeekdate + " - " + lastDate);
        });
    });
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker2").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker2').on('dp.change', function (e){
            var value = $("#weeklyDatePicker2").val();
            $scope.firstDateofWeek = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            $scope.lastDateofWeek =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker2").val($scope.firstDateofWeek + " - " + $scope.lastDateofWeek);
        });
    
    });
    
    
    // console.log("start date ", $scope.sDate)
    // console.log("end date ",$scope.edate )
    
    // $scope.sDate= '2020-04-02';
    // $scope.edate = '2020-04-05';
    
    function convert(str){
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }
    
    function fromDateMaker(date,days){
        var date1 = new Date(date);
        date1.setDate(date1.getDate()-days);
    
        var d = new Date(date1),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    
    }
    
    var date = new Date();
    var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var previousMonthDate = new Date(date.getFullYear(), date.getMonth()-1, 1);
    
    $scope.startDate =  convert(firstDayofMonth)
    
    // $("#datepicker").datepicker({
    //     clearBtn : true,
    //     autoclose: true,
    //     format: "mm-yyyy",
    //     viewMode: "months",
    //     minViewMode: "months",
    // }).datepicker('setDate', firstDayofMonth);
    
    
    // console.log($scope.firstDateofWeek)
    
    var TpBktDistributionUsersChartOptions= {};
    $scope.loadingTpBktDistributionDiv= true;
    $scope.DataTpBktDistributionDiv= false;
    $scope.noDataTpBktDistributionDiv= false;
    $scope.TpBktDistributionChartOptions= null;
    
    
    // This is for multilien display on same page
    
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
    
    var _url = globalConfig.pullfilterdataurl+"a1p2p3n4a5m6e7c80";
    
    
    if($stateParams.params){
    
        if($stateParams.params.granularity=='Hour'){
    
        var startDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        granularityValue = $stateParams.params.granularity;
        // var hour = $stateParams.params.hourNumber;
        _url += "&fromDate="+startDate+"T00:00:00.000Z";
        var app_name = $stateParams.params.app_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Appname='+encodeURIComponent(app_name);
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
    
        }else{
    
            var startDate
            if($stateParams.params.granularity=='Day'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),7);
            }
            else if($stateParams.params.granularity=='Week'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),50);
            }
            else{
                granularityValue='Month';
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),185);
            }
    
        var endDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        _url += "&fromDate="+startDate+"T00:00:00.000Z"+"&toDate="+endDate+"T23:59:59.999Z";
        var app_name = $stateParams.params.app_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Appname='+encodeURIComponent(app_name);
        _url += '&granularity='+granularityValue;
        // _url += '&rowCount='+$scope.rowCount;
    
    }
    
    }
    
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z";
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
    
    if(granularityValue=='Hour'){

        httpService.get(_url).then(function(response){

                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Hour";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                    // console.log("paramObject", paramObject);
    
                    var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                    FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                    FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                    FirstByteLatencyChartOptions.tooltip.shared= true;
                    FirstByteLatencyChartOptions.chart.height= 400;
                    FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                    FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
    
    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
    
                    FirstByteLatencyChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(event, this);
                                console.log(this.options);
                                var label_name =  this.series.name;
                                var hourNumber  = this.category;
                                var granularity = $scope.granularityValue;
                                var params = {
                                    fromDate: $scope.date.start,
                                    hourNumber : hourNumber,
                                    bucket_name: label_name,
                                    pageId: $stateParams.id,
                                    granularity : granularity
                                }
                                $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'FirstByteLatencyDetail.html', id: null});
                                // displaySubList(key,point_click_date,label_name)
                            }
                        }
                    };
    
                    $scope.FirstByteLatencyChartOptions= {
                        options:FirstByteLatencyChartOptions,
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
    else{ 
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var bucket_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }

                            console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'FirstByteLatencyDetail.html', id: null});
                        }
                    }
                };

                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
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
    
    var areas = [];
    var plans = [];
    
    
    
    $scope.tree = {
        area: false,
        plan: false,
        // segment:false,
        // node   : false,
        // bras : false,
        // bts :false
    };
    
    $scope.toggleUsageFilter = function(){
        angular.element('#tglFilter').toggle();
    } 
    
    $scope.toggleCountFilter = function(){
        angular.element('#cntFilter').toggle();
    } 
    //Group By filter 
    $scope.ratData = [
        {"title":"PlanType","key":"Plantype"},
        {"title":"Zone","key":"zone"},
        {"title":"Validity","key":"validity"},
        {"title":"City","key":"city"}
    ]; 
    
    $scope.onTree = function(action){
        for (var i in $scope.tree) {
            if (i != action) {
                $scope.tree[i] = false;
            } else {
                $scope.tree[i] = !$scope.tree[i];
            }
        }
    }
    
    // --------------------------------------------------- App Filter ----------------------------------------------------------
     
    var selectedAreas = [];
    $scope.selectedAreas = selectedAreas;
    
    var areaList = {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},
        // children: [],
        onSelect: function(select, node) {
            var selNodes = node.tree.getSelectedNodes();
                   
            // Get a list of all selected nodes, and convert to a key array:
            selectedAreas = $.map(selNodes, function(node){
                return node.data.key;
            });
            $scope.selectedAreas = selectedAreas;
        }
    }
    
    function getArea(){
        var params = 'collection=lku_app&op=select&db=datadb';
    
        httpService.get(globalConfig.dataapiurl + params).then(function (res) {
            _.forEach(res.data, function(item){
                item.title = item.App;
                item.key = item.App;
            });
            areaList.children = res.data;
            areas = areaList.children;
            $("#area").dynatree(angular.copy(areaList));
        });
    
    }
    getArea();
    
    // ----------------------------------------------- Bucket Filter ------------------------------------------
    
    var selectedPlans = [];
    $scope.selectedPlans = selectedPlans;
        var planList = {
            checkbox: true,
            selectMode: 3,
            classNames: {connector: "dynatree-connector", nodeIcon: ''},
            // children: [],
            onSelect: function(select, node) {
                var selNodes = node.tree.getSelectedNodes();
                    
                // Get a list of all selected segment, and convert to a key array:
                selectedPlans = $.map(selNodes, function(node){
                    return node.data.key;
                });
                $scope.selectedPlans = selectedPlans;
            }
    
        }
     
        function getPlan(){
             var params = 'collection=lku_datalatency_buckets&op=select&db=datadb';
             httpService.get(globalConfig.dataapiurl + params).then(function (res) {
                 _.forEach(res.data, function(item){
                     item.title = item.bktname;
                     item.key = item.bktname;
                 });
                 planList.children = res.data;
                 $("#plan").dynatree(angular.copy(planList));
             })
         }
        getPlan();
    
    function filterLoad(){
    
    
        $scope.sDate=  $scope.date.start;
        $scope.edate = $scope.date.end;
    
        var _url = globalConfig.pullfilterdataurl+"a1p2p3n4a5m6e7c80";
    
        
        _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
        //  Adding a App name to URL
        // if(selectedAreas.length > 0) {
        //     var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
        //     _url += "&Area="+encodeURIComponent(Area);
        // }
    
        //  Adding Bucket name to URL
    
        if(selectedAreas.length > 0) {
            // var bucket = JSON.stringify(selectedPlans).replace(/"/g,"'");
            _url += "&Appname="+selectedAreas;
            
        }
        else{
            swal("Please select the app")
        }
    
    
        if($scope.granularity=='Hour'){
    
            var granularityValue=$scope.granularity;
            _url += '&granularity='+granularityValue;
    
            httpService.get(_url).then(function(response){
        
                    var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                    var objArray= response.data;
                    $scope.exportSubDistArray= [];
                    if(objArray.length>0){
                        //exportObjData
                        var exportSubDistArray= angular.copy(objArray);
        
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Hour";
                        paramObject.data= "Count";
                        paramObject.seriesName= "Bucket";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
        
                        // console.log("paramObject", paramObject);
        
                        var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                        FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                        FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                        FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                        // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                        FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                        FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                        FirstByteLatencyChartOptions.tooltip.shared= true;
                        FirstByteLatencyChartOptions.chart.height= 400;
                        FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                        FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
        
        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
        
                        FirstByteLatencyChartOptions.plotOptions.column.point = {
                            events:{
                                click: function (event) {
                                    console.log(event, this);
                                    console.log(this.options);
                                    var label_name =  this.series.name;
                                    var hourNumber  = this.category;
                                    var granularity = $scope.granularityValue;
                                    var params = {
                                        fromDate: $scope.date.start,
                                        hourNumber : hourNumber,
                                        bucket_name: label_name,
                                        pageId: $stateParams.id,
                                        granularity : granularity
                                    }
                                    $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'bucketWiseTrend.html', id: null});
                                    // displaySubList(key,point_click_date,label_name)
                                }
                            }
                        };
        
    
                        $scope.FirstByteLatencyChartOptions= {
                            options:FirstByteLatencyChartOptions,
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
        else{
    
        var granularityValue=$scope.granularity;
        _url += '&granularity='+granularityValue;
        // _url += '&Appname='+$scope.rowCount;
        
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                // console.log("paramObject", paramObject);
    
                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};
    
    
                paramObject.flag= "series";
                paramObject.objArray= objArray;
    
                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var app_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                app_name: app_name,
                                pageId: $stateParams.id
                            }
    
                            // console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'bucketWiseTrend.html', id: null});
                        }
                    }
                };
    
                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
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
    
    
    }    
    
    $scope.changeDate=function (modelName, newDate){
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    
    $scope.click = function(){
        
        var name = $scope.name;
        function convert(str) {
            var date = new Date(str),
                mnth = ("0" + (date.getMonth() + 1)).slice(-2),
                day = ("0" + date.getDate()).slice(-2);
            return [date.getFullYear(), mnth, day].join("-");
        }
    
    
        if(name=="Month"){
    
            $scope.granularity = "Month"
            $scope.date.start =  convert($("#monthpicker1").datepicker('getDate'));
            $scope.date.end =  convert($("#monthpicker2").datepicker('getDate'));
    
        }
    
        else if(name=="Hour"){
    
            $scope.granularity = "Hour";
            $scope.date.start =  $scope.dateSelect;
            $scope.date.end =  $scope.dateSelect;
    
        }
        else if(name=="Week"){
            $scope.granularity = "Week";
            $scope.date.start = $scope.firstDateofWeek;
            $scope.date.end = $scope.secondWeekdate
    
        }
    
        else{
    
            $scope.granularity = "Day";
            $scope.date.start = $scope.date.start;
            $scope.date.end  = $scope.date.end;
        }
    
        filterLoad()
    }
    
    $scope.goBackPage = function(){
        $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
    }
    
}



//  Data latency 

function DataLatencyCTRL($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal){

    $scope.names = ["Hour","Day","Week", "Month"];
    $scope.rowCount = '10';
    $scope.name = "Day";
    $scope.group = "Count"
    
    $scope.granularity = "Day";
    
    $scope.granularityValue;
    
    // $scope.sDate= $scope.date.start;
    // $scope.edate= $scope.date.end;
    
    
     $("#monthpicker1").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    $("#monthpicker2").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker1").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker1').on('dp.change', function (e){
            var value = $("#weeklyDatePicker1").val();
            $scope.secondWeekdate = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            var lastDate =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker1").val($scope.secondWeekdate + " - " + lastDate);
        });
    });
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker2").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker2').on('dp.change', function (e){
            var value = $("#weeklyDatePicker2").val();
            $scope.firstDateofWeek = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            $scope.lastDateofWeek =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker2").val($scope.firstDateofWeek + " - " + $scope.lastDateofWeek);
        });
    
    });
    
    
    // console.log("start date ", $scope.sDate)
    // console.log("end date ",$scope.edate )
    
    // $scope.sDate= '2020-04-02';
    // $scope.edate = '2020-04-05';
    
    function convert(str){
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }
    
    function fromDateMaker(date,days){
        var date1 = new Date(date);
        date1.setDate(date1.getDate()-days);
    
        var d = new Date(date1),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    
    }
    
    var date = new Date();
    var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var previousMonthDate = new Date(date.getFullYear(), date.getMonth()-1, 1);
    
    $scope.startDate =  convert(firstDayofMonth)
    
    // $("#datepicker").datepicker({
    //     clearBtn : true,
    //     autoclose: true,
    //     format: "mm-yyyy",
    //     viewMode: "months",
    //     minViewMode: "months",
    // }).datepicker('setDate', firstDayofMonth);
    
    
    // console.log($scope.firstDateofWeek)
    
    var TpBktDistributionUsersChartOptions= {};
    $scope.loadingTpBktDistributionDiv= true;
    $scope.DataTpBktDistributionDiv= false;
    $scope.noDataTpBktDistributionDiv= false;
    $scope.TpBktDistributionChartOptions= null;
    
    
    // This is for multilien display on same page
    
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
    
    var _url = globalConfig.pullfilterdataurl+"a6ceif7esdfgv789987760";
    
    
    if($stateParams.params.bucket_name){
    
        if($stateParams.params.granularity=='Hour'){
    
        var startDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        granularityValue = $stateParams.params.granularity;
        $scope.granularityValue = $stateParams.params.granularity;
        var hour = $stateParams.params.hourNumber;
        _url += "&fromDate="+startDate+"T00:00:00.000Z";
        var bucket_name = $stateParams.params.bucket_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Bucket='+encodeURIComponent(bucket_name);
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
    
        }else{
    
            var startDate
            if($stateParams.params.granularity=='Day'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),7);
            }
            else if($stateParams.params.granularity=='Week'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),50);
            }
            else{
                granularityValue='Month';
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),185);
            }
    
        var endDate = $filter('date')($stateParams.params.endDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        _url += "&fromDate="+startDate+"T00:00:00.000Z"+"&toDate="+endDate+"T23:59:59.999Z";
        var bucket_name = $stateParams.params.bucket_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Bucket='+encodeURIComponent(bucket_name);
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
    
    }
    
    }
    
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z";
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
    if(granularityValue=='Hour'){
            
        httpService.get(_url).then(function(response){
    
                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Hour";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Appname";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                    // console.log("paramObject", paramObject);
    
                    var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                    FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                    FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                    FirstByteLatencyChartOptions.tooltip.shared= true;
                    FirstByteLatencyChartOptions.chart.height= 400;
                    FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                    FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
    
    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
    
                    FirstByteLatencyChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                // console.log(event, this);
                                // console.log(this.options);
                                var app_name =  this.series.name;
                                var hourNumber  = this.category;
                                var granularity = granularityValue;
                                var params = {
                                    fromDate: $scope.date.start,
                                    bucket_name: app_name,
                                    pageId: $stateParams.id,
                                    granularity : granularity
                                }
    
                                console.log(" paramas ",params)
                                $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatencyBucket.html', id: null});
                                // displaySubList(key,point_click_date,label_name)
                            }
                        }
                    };
    
                    $scope.FirstByteLatencyChartOptions= {
                        options:FirstByteLatencyChartOptions,
                        series:highchartProcessData.barColumnProcessHighchartData(paramObject),
    
                    }
    
    
                    $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);
    
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
    else{
            
            httpService.get(_url).then(function(response){
                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Date";
                        paramObject.data= "Count";
                        paramObject.seriesName= "Appname";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
    
                    // console.log("paramObject", paramObject);
    
                    var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                    FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                    FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                    FirstByteLatencyChartOptions.tooltip.shared= true;
                    FirstByteLatencyChartOptions.chart.height= 400;
                    FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                    FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};
    
    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
    
                    FirstByteLatencyChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(event, this);
                                console.log(this.options);
                                var app_name = this.series.name;
                                var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                                var granularity = granularityValue;
                                // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                                // console.log('from', bucket_date)
                                // console.log("labelname ",bucket_date)
                                var params = {
                                    fromDate: bucket_date,
                                    granularity : granularity,
                                    app_name: app_name,
                                    pageId: $stateParams.id
                                }
                                console.log(" paramas ",params)
                                $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatencyBucket.html', id: null});
                                // displaySubList(key,point_click_date,label_name)
                                
                            }
                        }
                    };
    
                    $scope.FirstByteLatencyChartOptions= {
                        options:FirstByteLatencyChartOptions,
                        series:highchartProcessData.barColumnProcessHighchartData(paramObject),
    
                    }
    
    
                    $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);
    
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
    
    var areas = [];
    var plans = [];
    
    
    
    $scope.tree = {
        area: false,
        plan: false,
        // segment:false,
        // node   : false,
        // bras : false,
        // bts :false
    };
    
    $scope.toggleUsageFilter = function(){
        angular.element('#tglFilter').toggle();
    } 
    
    $scope.toggleCountFilter = function(){
        angular.element('#cntFilter').toggle();
    } 
    //Group By filter 
    $scope.ratData = [
        {"title":"PlanType","key":"Plantype"},
        {"title":"Zone","key":"zone"},
        {"title":"Validity","key":"validity"},
        {"title":"City","key":"city"}
    ]; 
    
    $scope.onTree = function(action){
        for (var i in $scope.tree) {
            if (i != action) {
                $scope.tree[i] = false;
            } else {
                $scope.tree[i] = !$scope.tree[i];
            }
        }
    }
    
    // --------------------------------------------------- App Filter ----------------------------------------------------------
     
    var selectedAreas = [];
    $scope.selectedAreas = selectedAreas;
    
    var areaList = {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},
        // children: [],
        onSelect: function(select, node) {
            var selNodes = node.tree.getSelectedNodes();
                   
            // Get a list of all selected nodes, and convert to a key array:
            selectedAreas = $.map(selNodes, function(node){
                return node.data.key;
            });
            $scope.selectedAreas = selectedAreas;
        }
    }
    
    function getArea(){
        var params = 'collection=lku_app&op=select&db=datadb';
    
        httpService.get(globalConfig.dataapiurl + params).then(function (res) {
            _.forEach(res.data, function(item){
                item.title = item.App;
                item.key = item.App;
            });
            areaList.children = res.data;
            areas = areaList.children;
            $("#area").dynatree(angular.copy(areaList));
        });
    
        // console.log("areaList  ",areaList)
    }
    getArea();
    
    // ----------------------------------------------- Bucket Filter ------------------------------------------
    
    var selectedPlans = [];
    $scope.selectedPlans = selectedPlans;
        var planList = {
            checkbox: true,
            selectMode: 3,
            classNames: {connector: "dynatree-connector", nodeIcon: ''},
            // children: [],
            onSelect: function(select, node) {
                var selNodes = node.tree.getSelectedNodes();
                    
                // Get a list of all selected segment, and convert to a key array:
                selectedPlans = $.map(selNodes, function(node){
                    return node.data.key;
                });
                $scope.selectedPlans = selectedPlans;
            }
    
        }
     
        function getPlan(){
             var params = 'collection=lku_datalatency_buckets&op=select&db=datadb';
             httpService.get(globalConfig.dataapiurl + params).then(function (res) {
                 _.forEach(res.data, function(item){
                     item.title = item.bktname;
                     item.key = item.bktname;
                 });
                 planList.children = res.data;
                 $("#plan").dynatree(angular.copy(planList));
             })
         }
        getPlan();
    
    function filterLoad(){
    
    
        $scope.sDate=  $scope.date.start;
        $scope.edate = $scope.date.end;
    
        var _url = globalConfig.pullfilterdataurl+"a6ceif7esdfgv789987760";
    
        
        _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
        //  Adding a App name to URL
        // if(selectedAreas.length > 0) {
        //     var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
        //     _url += "&Area="+encodeURIComponent(Area);
        // }
    
        //  Adding Bucket name to URL
    
        if(selectedPlans.length > 0) {
            // var bucket = JSON.stringify(selectedPlans).replace(/"/g,"'");
            _url += "&Bucket="+selectedPlans;
        }
        else{
            swal("Please select one bucket")
        }
    
    
        if($scope.granularity=='Hour'){
    
            var granularityValue=$scope.granularity;
            _url += '&granularity='+granularityValue;
            _url += '&rowCount='+$scope.rowCount;
    
    
            httpService.get(_url).then(function(response){
        
                    var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                    var objArray= response.data;
                    $scope.exportSubDistArray= [];
                    if(objArray.length>0){
                        //exportObjData
                        var exportSubDistArray= angular.copy(objArray);
        
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Hour";
                        paramObject.data= "Count";
                        paramObject.seriesName= "Appname";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
        
                        // console.log("paramObject", paramObject);
        
                        var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                        FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                        FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                        FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                        // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                        FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                        FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                        FirstByteLatencyChartOptions.tooltip.shared= true;
                        FirstByteLatencyChartOptions.chart.height= 400;
                        FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                        FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
        
        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
        
                        FirstByteLatencyChartOptions.plotOptions.column.point = {
                            events:{
                                click: function (event) {
                                    console.log(event, this);
                                    console.log(this.options);
                                    var label_name =  this.series.name;
                                    var hourNumber  = this.category;
                                    var granularity = granularityValue;
                                    var params = {
                                        fromDate: $scope.date.start,
                                        hourNumber : hourNumber,
                                        app_name: label_name,
                                        pageId: $stateParams.id,
                                        granularity : granularity
                                    }
                                    // console.log("PARAM",params)
                                    $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatencyBucket.html', id: null});
                                    // displaySubList(key,point_click_date,label_name)
                                }
                            }
                        };
        
    
                        $scope.FirstByteLatencyChartOptions= {
                            options:FirstByteLatencyChartOptions,
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
        else{
    
        var granularityValue=$scope.granularity;
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
        
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Appname";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                // console.log("paramObject", paramObject);
    
                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};
    
    
                paramObject.flag= "series";
                paramObject.objArray= objArray;
    
                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var app_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                app_name: app_name,
                                pageId: $stateParams.id
                            }
    
                            console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatencyBucket.html', id: null});
                        }
                    }
                };
    
                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
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
    
    
    }    
    
    $scope.changeDate=function (modelName, newDate){
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    
    $scope.click = function(){
        
        var name = $scope.name;
        function convert(str) {
            var date = new Date(str),
                mnth = ("0" + (date.getMonth() + 1)).slice(-2),
                day = ("0" + date.getDate()).slice(-2);
            return [date.getFullYear(), mnth, day].join("-");
        }
    
    
        if(name=="Month"){
    
            $scope.granularity = "Month"
            $scope.date.start =  convert($("#monthpicker1").datepicker('getDate'));
            $scope.date.end =  convert($("#monthpicker2").datepicker('getDate'));
    
        }
    
        else if(name=="Hour"){
    
            $scope.granularity = "Hour";
            $scope.date.start =  $scope.dateSelect;
            $scope.date.end =  $scope.dateSelect;
    
        }
        else if(name=="Week"){
            $scope.granularity = "Week";
            $scope.date.start = $scope.firstDateofWeek;
            $scope.date.end = $scope.secondWeekdate
    
        }
    
        else{
    
            $scope.granularity = "Day";
            $scope.date.start = $scope.date.start;
            $scope.date.end  = $scope.date.end;
        }
    
        filterLoad()
    }
    
    $scope.goBackPage = function(){
        $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
    }
    
}
    
    
function DataLatencyBucketCTRL($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal){

    $scope.names = ["Hour","Day","Week", "Month"];
    // $scope.rowCount = '10';
    $scope.name = "Day";
    $scope.group = "Count"
    
    $scope.granularity = "Day";

    
    // $scope.sDate= $scope.date.start;
    // $scope.edate= $scope.date.end;
    
    
        $("#monthpicker1").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    $("#monthpicker2").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker1").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker1').on('dp.change', function (e){
            var value = $("#weeklyDatePicker1").val();
            $scope.secondWeekdate = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            var lastDate =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker1").val($scope.secondWeekdate + " - " + lastDate);
        });
    });
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker2").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker2').on('dp.change', function (e){
            var value = $("#weeklyDatePicker2").val();
            $scope.firstDateofWeek = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            $scope.lastDateofWeek =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker2").val($scope.firstDateofWeek + " - " + $scope.lastDateofWeek);
        });
    
    });
    
    
    // console.log("start date ", $scope.sDate)
    // console.log("end date ",$scope.edate )
    
    // $scope.sDate= '2020-04-02';
    // $scope.edate = '2020-04-05';
    
    function convert(str){
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }
    
    function fromDateMaker(date,days){
        var date1 = new Date(date);
        date1.setDate(date1.getDate()-days);
    
        var d = new Date(date1),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    
    }
    
    var date = new Date();
    var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var previousMonthDate = new Date(date.getFullYear(), date.getMonth()-1, 1);
    
    $scope.startDate =  convert(firstDayofMonth)
    
    // $("#datepicker").datepicker({
    //     clearBtn : true,
    //     autoclose: true,
    //     format: "mm-yyyy",
    //     viewMode: "months",
    //     minViewMode: "months",
    // }).datepicker('setDate', firstDayofMonth);
    
    
    // console.log($scope.firstDateofWeek)
    
    var TpBktDistributionUsersChartOptions= {};
    $scope.loadingTpBktDistributionDiv= true;
    $scope.DataTpBktDistributionDiv= false;
    $scope.noDataTpBktDistributionDiv= false;
    $scope.TpBktDistributionChartOptions= null;
    
    
    // This is for multilien display on same page
    
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
    
    var _url = globalConfig.pullfilterdataurl+"a1p2p3n4a5m6e7c80";
    
    
    if($stateParams.params){
    
        if($stateParams.params.granularity=='Hour'){
    
        var startDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        granularityValue = $stateParams.params.granularity;
        // var hour = $stateParams.params.hourNumber;
        _url += "&fromDate="+startDate+"T00:00:00.000Z";
        var app_name = $stateParams.params.app_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Appname='+encodeURIComponent(app_name);
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
    
        }else{
    
            var startDate
            if($stateParams.params.granularity=='Day'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),7);
            }
            else if($stateParams.params.granularity=='Week'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),50);
            }
            else{
                granularityValue='Month';
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),185);
            }
    
        var endDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        _url += "&fromDate="+startDate+"T00:00:00.000Z"+"&toDate="+endDate+"T23:59:59.999Z";
        var app_name = $stateParams.params.app_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Appname='+encodeURIComponent(app_name);
        _url += '&granularity='+granularityValue;
        // _url += '&rowCount='+$scope.rowCount;
    
    }
    
    }
    
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z";
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
    
    if(granularityValue=='Hour'){

        httpService.get(_url).then(function(response){

                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Hour";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                    // console.log("paramObject", paramObject);
    
                    var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                    FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                    FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                    FirstByteLatencyChartOptions.tooltip.shared= true;
                    FirstByteLatencyChartOptions.chart.height= 400;
                    FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                    FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
    
    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
    
                    FirstByteLatencyChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(event, this);
                                console.log(this.options);
                                var label_name =  this.series.name;
                                var hourNumber  = this.category;
                                var granularity = $scope.granularityValue;
                                var params = {
                                    fromDate: $scope.date.start,
                                    hourNumber : hourNumber,
                                    bucket_name: label_name,
                                    pageId: $stateParams.id,
                                    granularity : granularity
                                }
                                // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'FirstByteLatencyDetail.html', id: null});
                                // displaySubList(key,point_click_date,label_name)
                            }
                        }
                    };
    
                    $scope.FirstByteLatencyChartOptions= {
                        options:FirstByteLatencyChartOptions,
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
    else{ 
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var bucket_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }

                            // console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'FirstByteLatencyDetail.html', id: null});
                        }
                    }
                };

                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
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
    
    var areas = [];
    var plans = [];
    
    
    
    $scope.tree = {
        area: false,
        plan: false,
        // segment:false,
        // node   : false,
        // bras : false,
        // bts :false
    };
    
    $scope.toggleUsageFilter = function(){
        angular.element('#tglFilter').toggle();
    } 
    
    $scope.toggleCountFilter = function(){
        angular.element('#cntFilter').toggle();
    } 
    //Group By filter 
    $scope.ratData = [
        {"title":"PlanType","key":"Plantype"},
        {"title":"Zone","key":"zone"},
        {"title":"Validity","key":"validity"},
        {"title":"City","key":"city"}
    ]; 
    
    $scope.onTree = function(action){
        for (var i in $scope.tree) {
            if (i != action) {
                $scope.tree[i] = false;
            } else {
                $scope.tree[i] = !$scope.tree[i];
            }
        }
    }
    
    // --------------------------------------------------- App Filter ----------------------------------------------------------
        
    var selectedAreas = [];
    $scope.selectedAreas = selectedAreas;
    
    var areaList = {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},
        // children: [],
        onSelect: function(select, node) {
            var selNodes = node.tree.getSelectedNodes();
                    
            // Get a list of all selected nodes, and convert to a key array:
            selectedAreas = $.map(selNodes, function(node){
                return node.data.key;
            });
            $scope.selectedAreas = selectedAreas;
        }
    }
    
    function getArea(){
        var params = 'collection=lku_app&op=select&db=datadb';
    
        httpService.get(globalConfig.dataapiurl + params).then(function (res) {
            _.forEach(res.data, function(item){
                item.title = item.App;
                item.key = item.App;
            });
            areaList.children = res.data;
            areas = areaList.children;
            $("#area").dynatree(angular.copy(areaList));
        });
    
    }
    getArea();
    
    // ----------------------------------------------- Bucket Filter ------------------------------------------
    
    var selectedPlans = [];
    $scope.selectedPlans = selectedPlans;
        var planList = {
            checkbox: true,
            selectMode: 3,
            classNames: {connector: "dynatree-connector", nodeIcon: ''},
            // children: [],
            onSelect: function(select, node) {
                var selNodes = node.tree.getSelectedNodes();
                    
                // Get a list of all selected segment, and convert to a key array:
                selectedPlans = $.map(selNodes, function(node){
                    return node.data.key;
                });
                $scope.selectedPlans = selectedPlans;
            }
    
        }
        
        function getPlan(){
                var params = 'collection=lku_datalatency_buckets&op=select&db=datadb';
                httpService.get(globalConfig.dataapiurl + params).then(function (res) {
                    _.forEach(res.data, function(item){
                        item.title = item.bktname;
                        item.key = item.bktname;
                    });
                    planList.children = res.data;
                    $("#plan").dynatree(angular.copy(planList));
                })
            }
        getPlan();
    
    function filterLoad(){
    
    
        $scope.sDate=  $scope.date.start;
        $scope.edate = $scope.date.end;
    
        var _url = globalConfig.pullfilterdataurl+"a1p2p3n4a5m6e7c80";
    
        
        _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
        //  Adding a App name to URL
        // if(selectedAreas.length > 0) {
        //     var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
        //     _url += "&Area="+encodeURIComponent(Area);
        // }
    
        //  Adding Bucket name to URL
    
        if(selectedAreas.length > 0) {
            // var bucket = JSON.stringify(selectedPlans).replace(/"/g,"'");
            _url += "&Appname="+selectedAreas;
            
        }
        else{
            swal("Please select the app")
        }
    
    
        if($scope.granularity=='Hour'){
    
            var granularityValue=$scope.granularity;
            _url += '&granularity='+granularityValue;
    
            httpService.get(_url).then(function(response){
        
                    var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                    var objArray= response.data;
                    $scope.exportSubDistArray= [];
                    if(objArray.length>0){
                        //exportObjData
                        var exportSubDistArray= angular.copy(objArray);
        
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Hour";
                        paramObject.data= "Count";
                        paramObject.seriesName= "Bucket";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
        
                        // console.log("paramObject", paramObject);
        
                        var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                        FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                        FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                        FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                        // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                        FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                        FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                        FirstByteLatencyChartOptions.tooltip.shared= true;
                        FirstByteLatencyChartOptions.chart.height= 400;
                        FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                        FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
        
        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
        
                        FirstByteLatencyChartOptions.plotOptions.column.point = {
                            events:{
                                click: function (event) {
                                    console.log(event, this);
                                    console.log(this.options);
                                    var label_name =  this.series.name;
                                    var hourNumber  = this.category;
                                    var granularity = $scope.granularityValue;
                                    var params = {
                                        fromDate: $scope.date.start,
                                        hourNumber : hourNumber,
                                        bucket_name: label_name,
                                        pageId: $stateParams.id,
                                        granularity : granularity
                                    }
                                    $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'bucketWiseTrend.html', id: null});
                                    // displaySubList(key,point_click_date,label_name)
                                }
                            }
                        };
        
    
                        $scope.FirstByteLatencyChartOptions= {
                            options:FirstByteLatencyChartOptions,
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
        else{
    
        var granularityValue=$scope.granularity;
        _url += '&granularity='+granularityValue;
        // _url += '&Appname='+$scope.rowCount;
        
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                // console.log("paramObject", paramObject);
    
                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};
    
    
                paramObject.flag= "series";
                paramObject.objArray= objArray;
    
                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var app_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                app_name: app_name,
                                pageId: $stateParams.id
                            }
    
                            // console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'bucketWiseTrend.html', id: null});
                        }
                    }
                };
    
                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
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
    
    
    }    
    
    $scope.changeDate=function (modelName, newDate){
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    
    $scope.click = function(){
        
        var name = $scope.name;
        function convert(str) {
            var date = new Date(str),
                mnth = ("0" + (date.getMonth() + 1)).slice(-2),
                day = ("0" + date.getDate()).slice(-2);
            return [date.getFullYear(), mnth, day].join("-");
        }
    
    
        if(name=="Month"){
    
            $scope.granularity = "Month"
            $scope.date.start =  convert($("#monthpicker1").datepicker('getDate'));
            $scope.date.end =  convert($("#monthpicker2").datepicker('getDate'));
    
        }
    
        else if(name=="Hour"){
    
            $scope.granularity = "Hour";
            $scope.date.start =  $scope.dateSelect;
            $scope.date.end =  $scope.dateSelect;
    
        }
        else if(name=="Week"){
            $scope.granularity = "Week";
            $scope.date.start = $scope.firstDateofWeek;
            $scope.date.end = $scope.secondWeekdate
    
        }
    
        else{
    
            $scope.granularity = "Day";
            $scope.date.start = $scope.date.start;
            $scope.date.end  = $scope.date.end;
        }
    
        filterLoad()
    }
    
    $scope.goBackPage = function(){
        $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
    }
    
}



// User latency 

function UserLatencyCTRL($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal){

    $scope.names = ["Hour","Day","Week", "Month"];
    $scope.rowCount = '10';
    $scope.name = "Day";
    $scope.group = "Count"
    $scope.userSelect;
    
    $scope.granularity = "Day";
    
    $scope.granularityValue;
    
    // $scope.sDate= $scope.date.start;
    // $scope.edate= $scope.date.end;
    
    
     $("#monthpicker1").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    $("#monthpicker2").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker1").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker1').on('dp.change', function (e){
            var value = $("#weeklyDatePicker1").val();
            $scope.secondWeekdate = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            var lastDate =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker1").val($scope.secondWeekdate + " - " + lastDate);
        });
    });
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker2").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker2').on('dp.change', function (e){
            var value = $("#weeklyDatePicker2").val();
            $scope.firstDateofWeek = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            $scope.lastDateofWeek =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker2").val($scope.firstDateofWeek + " - " + $scope.lastDateofWeek);
        });
    
    });
    
    
    // console.log("start date ", $scope.sDate)
    // console.log("end date ",$scope.edate )
    
    // $scope.sDate= '2020-04-02';
    // $scope.edate = '2020-04-05';
    
    function convert(str){
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }
    
    function fromDateMaker(date,days){
        var date1 = new Date(date);
        date1.setDate(date1.getDate()-days);
    
        var d = new Date(date1),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    
    }
    
    var date = new Date();
    var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var previousMonthDate = new Date(date.getFullYear(), date.getMonth()-1, 1);
    
    $scope.startDate =  convert(firstDayofMonth)
    
    // $("#datepicker").datepicker({
    //     clearBtn : true,
    //     autoclose: true,
    //     format: "mm-yyyy",
    //     viewMode: "months",
    //     minViewMode: "months",
    // }).datepicker('setDate', firstDayofMonth);
    
    
    // console.log($scope.firstDateofWeek)
    
    var TpBktDistributionUsersChartOptions= {};
    $scope.loadingTpBktDistributionDiv= true;
    $scope.DataTpBktDistributionDiv= false;
    $scope.noDataTpBktDistributionDiv= false;
    $scope.TpBktDistributionChartOptions= null;
    
    
    // This is for multilien display on same page
    
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
    
    var _url = globalConfig.pullfilterdataurl+"a6ceif7esdfgv789987760";
    
    
    if($stateParams.params.bucket_name){
    
        if($stateParams.params.granularity=='Hour'){
    
        var startDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        granularityValue = $stateParams.params.granularity;
        $scope.granularityValue = $stateParams.params.granularity;
        var hour = $stateParams.params.hourNumber;
        _url += "&fromDate="+startDate+"T00:00:00.000Z";
        var bucket_name = $stateParams.params.bucket_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Bucket='+encodeURIComponent(bucket_name);
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
    
        }else{
    
            var startDate
            if($stateParams.params.granularity=='Day'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),7);
            }
            else if($stateParams.params.granularity=='Week'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),50);
            }
            else{
                granularityValue='Month';
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),185);
            }
    
        var endDate = $filter('date')($stateParams.params.endDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        _url += "&fromDate="+startDate+"T00:00:00.000Z"+"&toDate="+endDate+"T23:59:59.999Z";
        var bucket_name = $stateParams.params.bucket_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Bucket='+encodeURIComponent(bucket_name);
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
    
    }
    
    }
    
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z";
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
    if(granularityValue=='Hour'){
            
        httpService.get(_url).then(function(response){
    
                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Hour";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Appname";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                    // console.log("paramObject", paramObject);
    
                    var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                    FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                    FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                    FirstByteLatencyChartOptions.tooltip.shared= true;
                    FirstByteLatencyChartOptions.chart.height= 400;
                    FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                    FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
    
    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
    
                    FirstByteLatencyChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                // console.log(event, this);
                                // console.log(this.options);
                                var app_name =  this.series.name;
                                var hourNumber  = this.category;
                                var granularity = granularityValue;
                                var params = {
                                    fromDate: $scope.date.start,
                                    bucket_name: app_name,
                                    pageId: $stateParams.id,
                                    granularity : granularity
                                }
    
                                console.log(" paramas ",params)
                                $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatencyBucket.html', id: null});
                                // displaySubList(key,point_click_date,label_name)
                            }
                        }
                    };
    
                    $scope.FirstByteLatencyChartOptions= {
                        options:FirstByteLatencyChartOptions,
                        series:highchartProcessData.barColumnProcessHighchartData(paramObject),
    
                    }
    
    
                    $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);
    
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
    else{
            
            httpService.get(_url).then(function(response){
                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Date";
                        paramObject.data= "Count";
                        paramObject.seriesName= "Appname";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
    
                    // console.log("paramObject", paramObject);
    
                    var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                    FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                    FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                    FirstByteLatencyChartOptions.tooltip.shared= true;
                    FirstByteLatencyChartOptions.chart.height= 400;
                    FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                    FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};
    
    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
    
                    FirstByteLatencyChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(event, this);
                                console.log(this.options);
                                var app_name = this.series.name;
                                var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                                var granularity = granularityValue;
                                // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                                // console.log('from', bucket_date)
                                // console.log("labelname ",bucket_date)
                                var params = {
                                    fromDate: bucket_date,
                                    granularity : granularity,
                                    app_name: app_name,
                                    pageId: $stateParams.id
                                }
                                console.log(" paramas ",params)
                                $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatencyBucket.html', id: null});
                                // displaySubList(key,point_click_date,label_name)
                                
                            }
                        }
                    };
    
                    $scope.FirstByteLatencyChartOptions= {
                        options:FirstByteLatencyChartOptions,
                        series:highchartProcessData.barColumnProcessHighchartData(paramObject),
    
                    }
    
    
                    $scope.exportSubscriberThroughput = angular.copy(exportSubDistArray);
    
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
    
    var areas = [];
    var plans = [];
    
    
    
    $scope.tree = {
        area: false,
        plan: false,
        // segment:false,
        // node   : false,
        // bras : false,
        // bts :false
    };
    
    $scope.toggleUsageFilter = function(){
        angular.element('#tglFilter').toggle();
    } 
    
    $scope.toggleCountFilter = function(){
        angular.element('#cntFilter').toggle();
    } 
    //Group By filter 
    $scope.ratData = [
        {"title":"PlanType","key":"Plantype"},
        {"title":"Zone","key":"zone"},
        {"title":"Validity","key":"validity"},
        {"title":"City","key":"city"}
    ]; 
    
    $scope.onTree = function(action){
        for (var i in $scope.tree) {
            if (i != action) {
                $scope.tree[i] = false;
            } else {
                $scope.tree[i] = !$scope.tree[i];
            }
        }
    }
    
    // --------------------------------------------------- App Filter ----------------------------------------------------------
     
    var selectedAreas = [];
    $scope.selectedAreas = selectedAreas;
    
    var areaList = {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},
        // children: [],
        onSelect: function(select, node) {
            var selNodes = node.tree.getSelectedNodes();
                   
            // Get a list of all selected nodes, and convert to a key array:
            selectedAreas = $.map(selNodes, function(node){
                return node.data.key;
            });
            $scope.selectedAreas = selectedAreas;
        }
    }
    
    function getArea(){
        var params = 'collection=lku_app&op=select&db=datadb';
    
        httpService.get(globalConfig.dataapiurl + params).then(function (res) {
            _.forEach(res.data, function(item){
                item.title = item.App;
                item.key = item.App;
            });
            areaList.children = res.data;
            areas = areaList.children;
            $("#area").dynatree(angular.copy(areaList));
        });
    
        console.log("areaList  ",areaList)
    }
    getArea();
    
    // ----------------------------------------------- Bucket Filter ------------------------------------------
    
    var selectedPlans = [];
    var bucketList = [];

    $scope.selectedPlans = selectedPlans;
        var planList = {
            checkbox: true,
            selectMode: 3,
            classNames: {connector: "dynatree-connector", nodeIcon: ''},
            // children: [],
            onSelect: function(select, node) {
                var selNodes = node.tree.getSelectedNodes();
                    
                // Get a list of all selected segment, and convert to a key array:
                selectedPlans = $.map(selNodes, function(node){
                    return node.data.key;
                });
                $scope.selectedPlans = selectedPlans;
            }
    
        }
     
        function getPlan(){
             var params = 'collection=lku_datalatency_buckets&op=select&db=datadb';
             httpService.get(globalConfig.dataapiurl + params).then(function (res) {
                 _.forEach(res.data, function(item){
                    //  item.title = item.bktname;
                    //  item.key = item.bktname;
                    bucketList.push(item.bktname)
                 });
                 planList.children = res.data;
                 $("#plan").dynatree(angular.copy(planList));
                 
             })
         }
         
         $scope.bucketName = bucketList;
        getPlan();

       
    
    function filterLoad(){
    
    
        $scope.sDate=  $scope.date.start;
        $scope.edate = $scope.date.end;
    
        var _url = globalConfig.pullfilterdataurl+"a6ceif7esdfgv789987760";
    
        
        _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
        //  Adding a App name to URL
        // if(selectedAreas.length > 0) {
        //     var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
        //     _url += "&Area="+encodeURIComponent(Area);
        // }
    
        //  Adding Bucket name to URL
    
        if($scope.userSelect.length > 0) {
            // var bucket = JSON.stringify(selectedPlans).replace(/"/g,"'");
            _url += "&Bucket="+$scope.userSelect;
        }
        else{
            swal("Please select one bucket")
        }
    
    
        if($scope.granularity=='Hour'){
    
            var granularityValue=$scope.granularity;
            _url += '&granularity='+granularityValue;
            _url += '&rowCount='+$scope.rowCount;
    
    
            httpService.get(_url).then(function(response){
        
                    var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                    var objArray= response.data;
                    $scope.exportSubDistArray= [];
                    if(objArray.length>0){
                        //exportObjData
                        var exportSubDistArray= angular.copy(objArray);
        
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Hour";
                        paramObject.data= "Count";
                        paramObject.seriesName= "Appname";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
        
                        // console.log("paramObject", paramObject);
        
                        var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                        FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                        FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                        FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                        // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                        FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                        FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                        FirstByteLatencyChartOptions.tooltip.shared= true;
                        FirstByteLatencyChartOptions.chart.height= 400;
                        FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                        FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
        
        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
        
                        FirstByteLatencyChartOptions.plotOptions.column.point = {
                            events:{
                                click: function (event) {
                                    console.log(event, this);
                                    console.log(this.options);
                                    var label_name =  this.series.name;
                                    var hourNumber  = this.category;
                                    var granularity = granularityValue;
                                    var params = {
                                        fromDate: $scope.date.start,
                                        hourNumber : hourNumber,
                                        app_name: label_name,
                                        pageId: $stateParams.id,
                                        granularity : granularity
                                    }
                                    // console.log("PARAM",params)
                                    $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatencyBucket.html', id: null});
                                    // displaySubList(key,point_click_date,label_name)
                                }
                            }
                        };
        
    
                        $scope.FirstByteLatencyChartOptions= {
                            options:FirstByteLatencyChartOptions,
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
        else{
    
        var granularityValue=$scope.granularity;
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
        
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Appname";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                // console.log("paramObject", paramObject);
    
                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};
    
    
                paramObject.flag= "series";
                paramObject.objArray= objArray;
    
                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var app_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                app_name: app_name,
                                pageId: $stateParams.id
                            }
    
                            console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'dataLatencyBucket.html', id: null});
                        }
                    }
                };
    
                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
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
    
    
    }    
    
    $scope.changeDate=function (modelName, newDate){
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    
    $scope.click = function(){
        
        var name = $scope.name;
        function convert(str) {
            var date = new Date(str),
                mnth = ("0" + (date.getMonth() + 1)).slice(-2),
                day = ("0" + date.getDate()).slice(-2);
            return [date.getFullYear(), mnth, day].join("-");
        }
    
    
        if(name=="Month"){
    
            $scope.granularity = "Month"
            $scope.date.start =  convert($("#monthpicker1").datepicker('getDate'));
            $scope.date.end =  convert($("#monthpicker2").datepicker('getDate'));
    
        }
    
        else if(name=="Hour"){
    
            $scope.granularity = "Hour";
            $scope.date.start =  $scope.dateSelect;
            $scope.date.end =  $scope.dateSelect;
    
        }
        else if(name=="Week"){
            $scope.granularity = "Week";
            $scope.date.start = $scope.firstDateofWeek;
            $scope.date.end = $scope.secondWeekdate
    
        }
    
        else{
    
            $scope.granularity = "Day";
            $scope.date.start = $scope.date.start;
            $scope.date.end  = $scope.date.end;
        }
    
        filterLoad()
    }
    
    $scope.goBackPage = function(){
        $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
    }
    
}
    
    
function UserLatencyBucketCTRL($scope, $rootScope, httpService, $filter, $state, $stateParams,dataFormatter,globalConfig, $window, $location,utility,  highchartProcessData, highchartOptions,$uibModal){

    $scope.names = ["Hour","Day","Week", "Month"];
    // $scope.rowCount = '10';
    $scope.name = "Day";
    $scope.group = "Count"
    
    $scope.granularity = "Day";

    
    // $scope.sDate= $scope.date.start;
    // $scope.edate= $scope.date.end;
    
    
        $("#monthpicker1").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    $("#monthpicker2").datepicker({
        clearBtn : true,
        autoclose: true,
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months",
    })
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker1").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker1').on('dp.change', function (e){
            var value = $("#weeklyDatePicker1").val();
            $scope.secondWeekdate = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            var lastDate =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker1").val($scope.secondWeekdate + " - " + lastDate);
        });
    });
    
    
    $(document).ready(function(){
        moment.locale('en', {
            week: { dow: 1 } // Monday is the first day of the week
        });
    
        //Initialize the datePicker(I have taken format as mm-dd-yyyy, you can     //have your owh)
        $("#weeklyDatePicker2").datetimepicker({
            format: 'YYYY-MM-DD',
            calendarWeeks: true,
        });
    
        //Get the value of Start and End of Week
        $('#weeklyDatePicker2').on('dp.change', function (e){
            var value = $("#weeklyDatePicker2").val();
            $scope.firstDateofWeek = moment(value, "YYYY-MM-DD").day(1).format("YYYY-MM-DD");
            $scope.lastDateofWeek =  moment(value, "YYYY-MM-DD").day(7).format("YYYY-MM-DD");
            $("#weeklyDatePicker2").val($scope.firstDateofWeek + " - " + $scope.lastDateofWeek);
        });
    
    });
    
    
    // console.log("start date ", $scope.sDate)
    // console.log("end date ",$scope.edate )
    
    // $scope.sDate= '2020-04-02';
    // $scope.edate = '2020-04-05';
    
    function convert(str){
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }
    
    function fromDateMaker(date,days){
        var date1 = new Date(date);
        date1.setDate(date1.getDate()-days);
    
        var d = new Date(date1),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    
    }
    
    var date = new Date();
    var firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var previousMonthDate = new Date(date.getFullYear(), date.getMonth()-1, 1);
    
    $scope.startDate =  convert(firstDayofMonth)
    
    // $("#datepicker").datepicker({
    //     clearBtn : true,
    //     autoclose: true,
    //     format: "mm-yyyy",
    //     viewMode: "months",
    //     minViewMode: "months",
    // }).datepicker('setDate', firstDayofMonth);
    
    
    // console.log($scope.firstDateofWeek)
    
    var TpBktDistributionUsersChartOptions= {};
    $scope.loadingTpBktDistributionDiv= true;
    $scope.DataTpBktDistributionDiv= false;
    $scope.noDataTpBktDistributionDiv= false;
    $scope.TpBktDistributionChartOptions= null;
    
    
    // This is for multilien display on same page
    
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
    
    var _url = globalConfig.pullfilterdataurl+"a1p2p3n4a5m6e7c80";
    
    
    if($stateParams.params){
    
        if($stateParams.params.granularity=='Hour'){
    
        var startDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        granularityValue = $stateParams.params.granularity;
        // var hour = $stateParams.params.hourNumber;
        _url += "&fromDate="+startDate+"T00:00:00.000Z";
        var app_name = $stateParams.params.app_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Appname='+encodeURIComponent(app_name);
        _url += '&granularity='+granularityValue;
        _url += '&rowCount='+$scope.rowCount;
    
        }else{
    
            var startDate
            if($stateParams.params.granularity=='Day'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),7);
            }
            else if($stateParams.params.granularity=='Week'){
                granularityValue=$stateParams.params.granularity;
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),50);
            }
            else{
                granularityValue='Month';
                startDate = fromDateMaker($filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd"),185);
            }
    
        var endDate = $filter('date')($stateParams.params.fromDate, "yyyy-MM-dd");
        var granularityValue=$stateParams.params.granularity;
        _url += "&fromDate="+startDate+"T00:00:00.000Z"+"&toDate="+endDate+"T23:59:59.999Z";
        var app_name = $stateParams.params.app_name;
        // var bucket_name="['"+$stateParams.params.bucket_name +"']"
        _url += '&Appname='+encodeURIComponent(app_name);
        _url += '&granularity='+granularityValue;
        // _url += '&rowCount='+$scope.rowCount;
    
    }
    
    }
    
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z";
    
    // _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
    
    if(granularityValue=='Hour'){

        httpService.get(_url).then(function(response){

                var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                var objArray= response.data;
                $scope.exportSubDistArray= [];
                if(objArray.length>0){
                    //exportObjData
                    var exportSubDistArray= angular.copy(objArray);
    
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Hour";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                    // console.log("paramObject", paramObject);
    
                    var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                    FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                    FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                    FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                    // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                    FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                    FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                    FirstByteLatencyChartOptions.tooltip.shared= true;
                    FirstByteLatencyChartOptions.chart.height= 400;
                    FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                    FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
    
    
                    paramObject.flag= "series";
                    paramObject.objArray= objArray;
    
                    FirstByteLatencyChartOptions.plotOptions.column.point = {
                        events:{
                            click: function (event) {
                                console.log(event, this);
                                console.log(this.options);
                                var label_name =  this.series.name;
                                var hourNumber  = this.category;
                                var granularity = $scope.granularityValue;
                                var params = {
                                    fromDate: $scope.date.start,
                                    hourNumber : hourNumber,
                                    bucket_name: label_name,
                                    pageId: $stateParams.id,
                                    granularity : granularity
                                }
                                // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'FirstByteLatencyDetail.html', id: null});
                                // displaySubList(key,point_click_date,label_name)
                            }
                        }
                    };
    
                    $scope.FirstByteLatencyChartOptions= {
                        options:FirstByteLatencyChartOptions,
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
    else{ 
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";

                // console.log("paramObject", paramObject);

                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};


                paramObject.flag= "series";
                paramObject.objArray= objArray;

                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var bucket_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                bucket_name: bucket_name,
                                pageId: $stateParams.id
                            }

                            // console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'FirstByteLatencyDetail.html', id: null});
                        }
                    }
                };

                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
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
    
    var areas = [];
    var plans = [];
    
    
    
    $scope.tree = {
        area: false,
        plan: false,
        // segment:false,
        // node   : false,
        // bras : false,
        // bts :false
    };
    
    $scope.toggleUsageFilter = function(){
        angular.element('#tglFilter').toggle();
    } 
    
    $scope.toggleCountFilter = function(){
        angular.element('#cntFilter').toggle();
    } 
    //Group By filter 
    $scope.ratData = [
        {"title":"PlanType","key":"Plantype"},
        {"title":"Zone","key":"zone"},
        {"title":"Validity","key":"validity"},
        {"title":"City","key":"city"}
    ]; 
    
    $scope.onTree = function(action){
        for (var i in $scope.tree) {
            if (i != action) {
                $scope.tree[i] = false;
            } else {
                $scope.tree[i] = !$scope.tree[i];
            }
        }
    }
    
    // --------------------------------------------------- App Filter ----------------------------------------------------------
        
    var selectedAreas = [];
    $scope.selectedAreas = selectedAreas;
    
    var areaList = {
        checkbox: true,
        selectMode: 3,
        classNames: {connector: "dynatree-connector", nodeIcon: ''},
        // children: [],
        onSelect: function(select, node) {
            var selNodes = node.tree.getSelectedNodes();
                    
            // Get a list of all selected nodes, and convert to a key array:
            selectedAreas = $.map(selNodes, function(node){
                return node.data.key;
            });
            $scope.selectedAreas = selectedAreas;
        }
    }
    
    function getArea(){
        var params = 'collection=lku_app&op=select&db=datadb';
    
        httpService.get(globalConfig.dataapiurl + params).then(function (res) {
            _.forEach(res.data, function(item){
                item.title = item.App;
                item.key = item.App;
            });
            areaList.children = res.data;
            areas = areaList.children;
            $("#area").dynatree(angular.copy(areaList));
        });
    
    }
    getArea();
    
    // ----------------------------------------------- Bucket Filter ------------------------------------------
    
    var selectedPlans = [];
    $scope.selectedPlans = selectedPlans;
        var planList = {
            checkbox: true,
            selectMode: 3,
            classNames: {connector: "dynatree-connector", nodeIcon: ''},
            // children: [],
            onSelect: function(select, node) {
                var selNodes = node.tree.getSelectedNodes();
                    
                // Get a list of all selected segment, and convert to a key array:
                selectedPlans = $.map(selNodes, function(node){
                    return node.data.key;
                });
                $scope.selectedPlans = selectedPlans;
            }
    
        }
        
        function getPlan(){
                var params = 'collection=lku_datalatency_buckets&op=select&db=datadb';
                httpService.get(globalConfig.dataapiurl + params).then(function (res) {
                    _.forEach(res.data, function(item){
                        item.title = item.bktname;
                        item.key = item.bktname;
                    });
                    planList.children = res.data;
                    $("#plan").dynatree(angular.copy(planList));
                })
            }
        getPlan();
    
    function filterLoad(){
    
    
        $scope.sDate=  $scope.date.start;
        $scope.edate = $scope.date.end;
    
        var _url = globalConfig.pullfilterdataurl+"a1p2p3n4a5m6e7c80";
    
        
        _url += "&fromDate="+$scope.sDate+"T00:00:00.000Z"+"&toDate="+$scope.edate+"T23:59:59.999Z";
    
        //  Adding a App name to URL
        // if(selectedAreas.length > 0) {
        //     var Area = JSON.stringify(selectedAreas).replace(/"/g,"'");
        //     _url += "&Area="+encodeURIComponent(Area);
        // }
    
        //  Adding Bucket name to URL
    
        if(selectedAreas.length > 0) {
            // var bucket = JSON.stringify(selectedPlans).replace(/"/g,"'");
            _url += "&Appname="+selectedAreas;
            
        }
        else{
            swal("Please select the app")
        }
    
    
        if($scope.granularity=='Hour'){
    
            var granularityValue=$scope.granularity;
            _url += '&granularity='+granularityValue;
    
            httpService.get(_url).then(function(response){
        
                    var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
                    var objArray= response.data;
                    $scope.exportSubDistArray= [];
                    if(objArray.length>0){
                        //exportObjData
                        var exportSubDistArray= angular.copy(objArray);
        
                        var paramObject= {};
                        paramObject.objArray= objArray;
                        paramObject.label= "Hour";
                        paramObject.data= "Count";
                        paramObject.seriesName= "Bucket";
                        paramObject.seriesdata= "data";
                        paramObject.flag= "xAxis";
        
                        // console.log("paramObject", paramObject);
        
                        var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptionsHourly);
                        FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                        FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                        FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                        // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                        FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                        FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                        FirstByteLatencyChartOptions.tooltip.shared= true;
                        FirstByteLatencyChartOptions.chart.height= 400;
                        FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                        FirstByteLatencyChartOptions.xAxis.title= {"text":"Hours"};
        
        
                        paramObject.flag= "series";
                        paramObject.objArray= objArray;
        
                        FirstByteLatencyChartOptions.plotOptions.column.point = {
                            events:{
                                click: function (event) {
                                    console.log(event, this);
                                    console.log(this.options);
                                    var label_name =  this.series.name;
                                    var hourNumber  = this.category;
                                    var granularity = $scope.granularityValue;
                                    var params = {
                                        fromDate: $scope.date.start,
                                        hourNumber : hourNumber,
                                        bucket_name: label_name,
                                        pageId: $stateParams.id,
                                        granularity : granularity
                                    }
                                    $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'bucketWiseTrend.html', id: null});
                                    // displaySubList(key,point_click_date,label_name)
                                }
                            }
                        };
        
    
                        $scope.FirstByteLatencyChartOptions= {
                            options:FirstByteLatencyChartOptions,
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
        else{
    
        var granularityValue=$scope.granularity;
        _url += '&granularity='+granularityValue;
        // _url += '&Appname='+$scope.rowCount;
        
        httpService.get(_url).then(function(response){
            var RATWiseUsageFormatArray= [], RATWiseLabelArray= [], RATWiseUsageData= [];
            var objArray= response.data;
            $scope.exportSubDistArray= [];
            if(objArray.length>0){
                //exportObjData
                var exportSubDistArray= angular.copy(objArray);
                    var paramObject= {};
                    paramObject.objArray= objArray;
                    paramObject.label= "Date";
                    paramObject.data= "Count";
                    paramObject.seriesName= "Bucket";
                    paramObject.seriesdata= "data";
                    paramObject.flag= "xAxis";
    
                // console.log("paramObject", paramObject);
    
                var FirstByteLatencyChartOptions= angular.copy(highchartOptions.highchartStackedBarLabelDatetimeOptions);
                FirstByteLatencyChartOptions.xAxis.categories= highchartProcessData.barColumnProcessHighchartData(paramObject);
                FirstByteLatencyChartOptions.yAxis.labels= {enabled: true};
                FirstByteLatencyChartOptions.legend= {maxHeight: 60};
                // OLTDistributionUsersChartOptions.yAxis.stackLabels= false;
                FirstByteLatencyChartOptions.tooltip.pointFormat= '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}% </b><br>';
                FirstByteLatencyChartOptions.plotOptions.column.stacking= 'normal';
                FirstByteLatencyChartOptions.tooltip.shared= true;
                FirstByteLatencyChartOptions.chart.height= 400;
                FirstByteLatencyChartOptions.yAxis.title= {"text":"Count"};
                FirstByteLatencyChartOptions.xAxis.title= {"text":"Time"};
    
    
                paramObject.flag= "series";
                paramObject.objArray= objArray;
    
                FirstByteLatencyChartOptions.plotOptions.column.point = {
                    events:{
                        click: function (event) {
                            console.log(event, this);
                            console.log(this.options);
                            var app_name = this.series.name;
                            var bucket_date = $filter('date')( this.category , "yyyy-MM-dd");
                            var granularity = $scope.granularityValue;
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', bucket_date)
                            console.log("labelname ",bucket_date)
                            var params = {
                                fromDate: bucket_date,
                                granularity : granularity,
                                app_name: app_name,
                                pageId: $stateParams.id
                            }
    
                            // console.log("param value ",params)
                            // displaySubList(key,point_click_date,label_name)
                            // $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'bucketWiseTrend.html', id: null});
                        }
                    }
                };
    
                $scope.FirstByteLatencyChartOptions= {
                    options:FirstByteLatencyChartOptions,
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
    
    
    }    
    
    $scope.changeDate=function (modelName, newDate){
        $scope.infoLine= false;
        $scope.dateSelect= newDate.format("YYYY-MM-DD");
    }
    
    $scope.click = function(){
        
        var name = $scope.name;
        function convert(str) {
            var date = new Date(str),
                mnth = ("0" + (date.getMonth() + 1)).slice(-2),
                day = ("0" + date.getDate()).slice(-2);
            return [date.getFullYear(), mnth, day].join("-");
        }
    
    
        if(name=="Month"){
    
            $scope.granularity = "Month"
            $scope.date.start =  convert($("#monthpicker1").datepicker('getDate'));
            $scope.date.end =  convert($("#monthpicker2").datepicker('getDate'));
    
        }
    
        else if(name=="Hour"){
    
            $scope.granularity = "Hour";
            $scope.date.start =  $scope.dateSelect;
            $scope.date.end =  $scope.dateSelect;
    
        }
        else if(name=="Week"){
            $scope.granularity = "Week";
            $scope.date.start = $scope.firstDateofWeek;
            $scope.date.end = $scope.secondWeekdate
    
        }
    
        else{
    
            $scope.granularity = "Day";
            $scope.date.start = $scope.date.start;
            $scope.date.end  = $scope.date.end;
        }
    
        filterLoad()
    }
    
    $scope.goBackPage = function(){
        $state.go('index.staticanalysis', {id: $stateParams.params.pageId});
    }
    
}

