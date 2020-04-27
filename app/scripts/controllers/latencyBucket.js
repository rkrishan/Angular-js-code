'use strict';

angular
    .module('specta')
    .controller('LantencyBucketCTRL',LantencyBucketCTRL)
    .controller('FirstByteLatencyDistributionBBCtrl',FirstByteLatencyDistributionBBCtrl)


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
                            var categorie  = this.category;
                            var params = {
                                fromDate: $scope.date.start,
                                categories : categorie,
                                bucket_name: label_name,
                                pageId: $stateParams.id
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
                            var label_name = this.series.name;
                            var point_click_date = $filter('date')( this.category , "yyyy-MM-dd");
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', point_click_date)
                            console.log("labelname ",label_name)
                            // displaySubList(key,point_click_date,label_name)
                        }
                    }
                };

                $scope.ConnectionLatencyChartOptions= {
                    options:ConnectionLatencyChartOptions,
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
                            console.log(event, this);
                            console.log(this.options);
                            var label_name = this.series.name;
                            var point_click_date = $filter('date')( this.category , "yyyy-MM-dd");
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', point_click_date)
                            console.log("labelname ",label_name)
                            $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'PotentialupgradeDeatil.html', id: null});
                            // displaySubList(key,point_click_date,label_name)
                           
                        }
                    }
                };

                $scope.UserLatencyChartOptions= {
                    options:UserLatencyChartOptions,
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

       
        // // THis is for connection latency buclet distribution
        httpService.get(connectionLatecnyURL).then(function(response){

            console.log("connectionLatecnyURL",response)

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
                            var label_name = this.series.name;
                            var point_click_date = $filter('date')( this.category , "yyyy-MM-dd");
                            // var params = {Key: component.ySeries, value: label, fromDate: from, toDate: from};
                            console.log('from', point_click_date)
                            console.log("labelname ",label_name)
                            // displaySubList(key,point_click_date,label_name)

                            
                        }
                    }
                };

                $scope.ConnectionLatencyChartOptions= {
                    options:ConnectionLatencyChartOptions,
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
    if( $stateParams.params ) {
        var startDate = $filter('date')( $stateParams.params.fromDate, "yyyy-MM-dd");
        var granularity=$stateParams.params.granularity;
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
                    var seriesName = e.point.series.name;
                    // console.log("point name ",e.point.name[0])
                    console.log('e', new Date(e.point.category), e, seriesName);
                    var params = {
                        fromDate: $scope.sdate,
                        clickableTooltip: e.point.name,
                        Priority : e.point.name,
                        seriesName: seriesName,
                        pageId: $stateParams.id
                    }
                    $state.go('index.staticanalysis', {'params': params, name: true, 'file': 'PotentialupgradeDeatil.html', id: null});
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