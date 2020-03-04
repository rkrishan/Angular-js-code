'use strict';

angular
    .module('specta')
    .controller('deviceTrendReportCtrl',deviceTrendReportCtrl);
    //.controller('appTrendReportCtrl',appTrendReportCtrl);

    function deviceTrendReportCtrl($scope, $stateParams, $http, globalConfig, $filter, $timeout, $rootScope, $interval, dataval, flotChrtOptions){
        var tzoffset= 5.5*3600*1000;
        //$scope.isActive= {data: true};

        if(angular.isDefined($stateParams.file)){
            $scope.file = 'views/static/' + $stateParams.file;
        }

        if(angular.isDefined($rootScope.intervals)){
            angular.forEach($rootScope.intervals, function(interval) {
                $interval.cancel(interval);
            });
        }else{
            $rootScope.intervals = [];
        }
        
        $('.input-daterange').datepicker({
            clearBtn:true,
            autoclose: true,
            assumeNearbyYear: true,
            format: "yyyy-mm-dd",
            startDate: "2015-12-23",
            endDate: "0d"
        });
        var chrt={};
            
        var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
        $scope.date= {"start": newdate, "end": newdate};
        
        var colorpalette = ["blue", "grey", "red", "purple", 
                            "rgba(253,180,92,1)", "green", "rgba(77,83,96,1)", "#B6B6B6" , 
                            "#212121", "#FFC107", "#D32F2F", "#7C4DFF"];
        
        // function lineAreaDataElement(l,d){
        //     this.label = l,
        //     this.data = d
        // }

        /**
        *      Device Trend Usage Line Chart Data
        **/
        $http.get(globalConfig.pullfilterdataurl+'ade4ab8c8466f909402fc49f6').then(function (response) {
            //console.log("response :",response.data)
            //var temp= ["",""];
            var objArray = response.data;
            //console.log("response :",objArray[0].Data.length);
            if(objArray.length>0){
                /*
                * multiline Chart data
                */
                var mchartDataLine = [];
                //var highest=[objArray[objArray.length-1].Google,objArray[objArray.length-1].Dropbox,objArray[objArray.length-1].Whatsapp,objArray[objArray.length-1].Skype,objArray[objArray.length-1].Youtube,objArray[objArray.length-1].Facebook,objArray[objArray.length-1].NOTCLASSIFIED];
                //var highestVal= Math.max.apply(null, highest);
                //temp = dataval.getDataChrt(highestVal);
                //console.log("highest flag :", temp[1])
                var oldlabel="";
                var datavalues = [];
                var j = -1;
                var k = 0;
                for (var i = 0; i < objArray.length; i++) {
                    var label = objArray[i].Device;
                    var count = objArray[i].countDevice;
                    var datatime = objArray[i].RecordDate;
                    //console.log("label: ",label);
                    //console.log("oldlabel: ",oldlabel);
                    if(oldlabel == label){
                        j++;
                        datavalues[j] = [datatime+tzoffset,count];
                        //console.log("oldlabel == label: ",datavalues);
                        //console.log('datavalues[j]',j);
                    }else{
                        //console.log("oldlabel != label: ",oldlabel);
                        if(oldlabel != ""){
                        //console.log("oldlabel != ''",oldlabel);
                            mchartDataLine[k] =  {
                                label: oldlabel,
                                data: datavalues
                            }
                            //console.log("labels: ",label);
                            //console.log("data: ",datavalues);
                            k=k+1;
                            j=-1;
                            oldlabel = label;
                            datavalues = [];
                        }else{
                            j++;
                            datavalues[j] = [datatime+tzoffset,count];
                            oldlabel = label;
                            //console.log("oldlabel == label: ",datavalues);
                        }
                    }

                }                    

                    // var datavalues = [];
                    // for (var j = 0; j < data.length; j++) {
                    //     datavalues[j] = [data[j].Date+tzoffset,data[j].Count];
                    // }
                     //console.log("labels: ",label);
                     //console.log("data: ",datavalues);
                    // mchartDataLine[i] =  {
                    //     label: label,
                    //     data: datavalues
                    // }
                    //new lineAreaDataElement(label,datavalues);
                //}
                chrt.multiLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
                chrt.multiLineOptions.yaxis.axisLabel= "Count";
                chrt.multiLineOptions.colors=['green',colorpalette[0],colorpalette[1],colorpalette[2],colorpalette[3],colorpalette[4],colorpalette[5],colorpalette[6]];
                chrt.multiLineOptions.legend.position="ne"
                $scope.DeviceTrendMultiLineOptions = chrt.multiLineOptions;
                /*
                *   Multiline App Trend Chart Data
                */
                $scope.DeviceTrendMultiLineData = mchartDataLine;
            }
        });
    }

    // function dfltLoad(){
    //     appTrendReport();
    //     $scope.time= $filter('date')( new Date().getTime() , "hh:mm a");
    //     $rootScope.intervals.push(
    //         $interval(function(){
    //             console.log("push");
    //             appTrendReport();
    //             $scope.time= $filter('date')( new Date().getTime() , "hh:mm a");
    //             if(!$scope.$$phase) {
    //                     $scope.$apply();
    //                 }
    //         },60000));
    // }

    // function appTrendReportCtrl($scope, $stateParams, $http, globalConfig, $filter, $timeout, $rootScope, $interval, dataval, flotChrtOptions){
    //     var tzoffset= 5.5*3600*1000;
    //     //$scope.isActive= {data: true};

    //     if(angular.isDefined($stateParams.file)){
    //         $scope.file = 'views/static/' + $stateParams.file;
    //     }

    //     if(angular.isDefined($rootScope.intervals)){
    //         angular.forEach($rootScope.intervals, function(interval) {
    //             $interval.cancel(interval);
    //         });
    //     }else{
    //         $rootScope.intervals = [];
    //     }
        
    //     $('.input-daterange').datepicker({
    //         clearBtn:true,
    //         autoclose: true,
    //         assumeNearbyYear: true,
    //         format: "yyyy-mm-dd",
    //         startDate: "2015-12-23",
    //         endDate: "0d"
    //     });
    //     var chrt={};
            
    //     var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    //     $scope.date= {"start": newdate, "end": newdate};
        
    //     var colorpalette = ["blue", "grey", "red", "purple", 
    //                         "rgba(253,180,92,1)", "green", "rgba(77,83,96,1)", "#B6B6B6" , 
    //                         "#212121", "#FFC107", "#D32F2F", "#7C4DFF"];
        
    //     function lineAreaDataElement(l,d){
    //         this.label = l,
    //         this.data = d
    //     }

    //     /**
    //     *      App Trend Usage Line Chart Data
    //     **/
    //     $http.get(globalConfig.dataurl+'AppTrendTotalUsagefor1day').then(function (response) {
    //         //console.log(response.data)
    //         var temp= ["",""];
    //         var objArray = response.data;

    //         function lineAreaDataElementG(d){
    //             this.label = "Google",
    //                 this.data = d
    //         }
    //         function lineAreaDataElementD(d){
    //             this.label = "Dropbox",
    //                 this.data = d
    //         }
    //         function lineAreaDataElementW(d){
    //             this.label = "Whatsapp",
    //                 this.data = d
    //         }
    //         function lineAreaDataElementS(d){
    //             this.label = "Skype",
    //                 this.data = d
    //         }
    //         function lineAreaDataElementY(d){
    //             this.label = "Youtube",
    //                 this.data = d
    //         }
    //         function lineAreaDataElementF(d){
    //             this.label = "Facebook",
    //                 this.data = d
    //         }
    //         function lineAreaDataElementI(d){
    //             this.label = "Not Classified",
    //                 this.data = d
    //         }

    //         if(objArray.length>0){

    //             /*
    //             * multiline Chart data
    //             */
    //             var mchartDataLineGoogle = [];
    //             var mchartDataLineYoutube= [];
    //             var mchartDataLineSkype = [];
    //             var mchartDataLineInternet = [];
    //             var mchartDataLineFacebook = [];
    //             var mchartDataLineDropbox = [];
    //             var mchartDataLineWhatsapp = [];
    //             var mchartDataLineNOTCLASSIFIED= [];
    //             var highest=[objArray[objArray.length-1].Google,objArray[objArray.length-1].Dropbox,objArray[objArray.length-1].Whatsapp,objArray[objArray.length-1].Skype,objArray[objArray.length-1].Youtube,objArray[objArray.length-1].Facebook,objArray[objArray.length-1].NOTCLASSIFIED];
    //             var highestVal= Math.max.apply(null, highest);
    //             temp = dataval.getDataChrt(highestVal);
    //             //console.log("highest flag :", temp[1])
    //             if(temp[1]=="KB"){
    //                 for (var i = 0; i < objArray.length; i++){
    //                     mchartDataLineGoogle[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Google)/Math.pow(2,10)];
    //                     mchartDataLineDropbox[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Dropbox)/Math.pow(2,10)];
    //                     mchartDataLineWhatsapp[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Whatsapp)/Math.pow(2,10)];
    //                     mchartDataLineSkype[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Skype)/Math.pow(2,10)];
    //                     mchartDataLineYoutube[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Youtube)/Math.pow(2,10)];
    //                     mchartDataLineFacebook[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Facebook)/Math.pow(2,10)];
    //                     mchartDataLineNOTCLASSIFIED[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].NOTCLASSIFIED)/Math.pow(2,10)];
    //                 }
    //             }else if(temp[1]=="MB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     mchartDataLineGoogle[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Google)/Math.pow(2,20)];
    //                     mchartDataLineDropbox[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Dropbox)/Math.pow(2,20)];
    //                     mchartDataLineWhatsapp[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Whatsapp)/Math.pow(2,20)];
    //                     mchartDataLineSkype[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Skype)/Math.pow(2,20)];
    //                     mchartDataLineYoutube[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Youtube)/Math.pow(2,20)];
    //                     mchartDataLineFacebook[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Facebook)/Math.pow(2,20)];
    //                     mchartDataLineNOTCLASSIFIED[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].NOTCLASSIFIED)/Math.pow(2,20)];
    //                 }
    //             }else if(temp[1]=="GB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     mchartDataLineGoogle[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Google)/Math.pow(2,30)];
    //                     mchartDataLineDropbox[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Dropbox)/Math.pow(2,30)];
    //                     mchartDataLineWhatsapp[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Whatsapp)/Math.pow(2,30)];
    //                     mchartDataLineSkype[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Skype)/Math.pow(2,30)];
    //                     mchartDataLineYoutube[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Youtube)/Math.pow(2,30)];
    //                     mchartDataLineFacebook[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Facebook)/Math.pow(2,30)];
    //                     mchartDataLineNOTCLASSIFIED[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].NOTCLASSIFIED)/Math.pow(2,30)];
    //                 }
    //             }else{
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     mchartDataLineGoogle[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Google)];
    //                     mchartDataLineDropbox[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Dropbox)];
    //                     mchartDataLineWhatsapp[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Whatsapp)];
    //                     mchartDataLineSkype[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Skype)];
    //                     mchartDataLineYoutube[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Youtube)];
    //                     mchartDataLineFacebook[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Facebook)];
    //                     mchartDataLineNOTCLASSIFIED[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].NOTCLASSIFIED)];
    //                 }
    //             }
    //             chrt.multiLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
    //             chrt.multiLineOptions.yaxis.axisLabel= temp[1];
    //             chrt.multiLineOptions.colors=['green',colorpalette[0],colorpalette[1],colorpalette[2],colorpalette[3],colorpalette[4],colorpalette[5],colorpalette[6]];
    //             chrt.multiLineOptions.legend.position="nw"
    //             $scope.appTrendMlineOptions = chrt.multiLineOptions;
    //             /*
    //             *   Multiline App Trend Chart Data
    //             */
    //             $scope.appTrendMlineData = [
    //                 {
    //                     label: "Google",
    //                     data: mchartDataLineGoogle
    //                 },
    //                 {
    //                     label: "Dropbox",
    //                     data: mchartDataLineDropbox
    //                 },
    //                 {
    //                     label: "Whatsapp",
    //                     data: mchartDataLineWhatsapp
    //                 },
    //                 {
    //                     label: "Skype",
    //                     data: mchartDataLineSkype
    //                 },
    //                 {
    //                     label: "Youtube",
    //                     data: mchartDataLineYoutube
    //                 },
    //                 {
    //                     label: "Facebook",
    //                     data: mchartDataLineFacebook
    //                 },
    //                 {
    //                     label: "Not Classified",
    //                     data: mchartDataLineNOTCLASSIFIED
    //                 }
    //             ];

    //             var chartDataLineGoogle = [];
    //             var chartDataLineYoutube= [];
    //             var chartDataLineSkype = [];
    //             var chartDataLineInternet = [];
    //             var chartDataLineFacebook = [];
    //             var chartDataLineDropbox = [];
    //             var chartDataLineWhatsapp = [];
    //             var chartDataLineNOTCLASSIFIED= []

    //             /* 
    //             * Google Trend Usage
    //             */
    //             temp = dataval.getDataChrt(objArray[objArray.length-1].Google)
    //             //console.log("Flag :",temp[1], "Data: ",temp[0]);
    //             if(temp[1]=="KB"){
    //                 for (var i = 0; i < objArray.length; i++){
    //                     chartDataLineGoogle[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Google)/Math.pow(2,10)];
    //                 }
    //             }else if(temp[1]=="MB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineGoogle[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Google)/Math.pow(2,20)];
    //                 }
    //             }else if(temp[1]=="GB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineGoogle[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Google)/Math.pow(2,30)];
    //                 }
    //             }else{
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineGoogle[i] = [objArray[i].timems1*1000+tzoffset,objArray[i].Google];
    //                 }
    //             }
    //             //console.log("google",chartDataLineGoogle)
    //             chrt.googleUsageTrendLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
    //             //chrt.googleUsageTrendLineOptions.yaxis.axisLabel= temp[1];
    //             chrt.googleUsageTrendLineOptions.colors=['green'] ;
    //             chrt.googleUsageTrendLineOptions.legend.position="nw"
    //             $scope.flotLineTrendOptionsG= chrt.googleUsageTrendLineOptions;
    //             $scope.flotChartGoogleUsageData = [new lineAreaDataElementG(mchartDataLineGoogle)];
    //             /* 
    //             * Dropbox Trend Usage
    //             */
    //             temp = dataval.getDataChrt(objArray[objArray.length-1].Dropbox)
    //             //console.log("Flag :",temp[1], "Data: ",temp[0]);
    //             if(temp[1]=="KB"){
    //                 for (var i = 0; i < objArray.length; i++){
    //                     chartDataLineDropbox[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Dropbox)/Math.pow(2,10)];
    //                 }
    //             }else if(temp[1]=="MB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineDropbox[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Dropbox)/Math.pow(2,20)];
    //                 }
    //             }else if(temp[1]=="GB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineDropbox[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Dropbox)/Math.pow(2,30)];
    //                 }
    //             }else{
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineDropbox[i] = [objArray[i].timems1*1000+tzoffset,objArray[i].Dropbox];
    //                 }
    //             }
    //             chrt.drpboxUsageTrendLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
    //             //chrt.drpboxUsageTrendLineOptions.yaxis.axisLabel= temp[1];
    //             chrt.drpboxUsageTrendLineOptions.colors= [colorpalette[0]];
    //             chrt.drpboxUsageTrendLineOptions.legend.position="nw"
    //             $scope.flotLineTrendOptionsD= chrt.drpboxUsageTrendLineOptions;
    //             $scope.flotChartDropboxUsageData = [new lineAreaDataElementD(mchartDataLineDropbox)];
    //             /* 
    //             * Whatsapp Trend Usage
    //             */
    //             temp = dataval.getDataChrt(objArray[objArray.length-1].Whatsapp)
    //             //console.log("Flag :",temp[1], "Data: ",temp[0]);
    //             if(temp[1]=="KB"){
    //                 for (var i = 0; i < objArray.length; i++){
    //                     chartDataLineWhatsapp[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Whatsapp)/Math.pow(2,10)];
    //                 }
    //             }else if(temp[1]=="MB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineWhatsapp[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Whatsapp)/Math.pow(2,20)];
    //                 }
    //             }else if(temp[1]=="GB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineWhatsapp[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Whatsapp)/Math.pow(2,30)];
    //                 }
    //             }else{
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineWhatsapp[i] = [objArray[i].timems1*1000+tzoffset,objArray[i].Whatsapp];
    //                 }
    //             }
    //             chrt.wtsappUsageTrendLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
    //             //chrt.wtsappUsageTrendLineOptions.yaxis.axisLabel= temp[1];
    //             chrt.wtsappUsageTrendLineOptions.colors= [colorpalette[1]];
    //             chrt.wtsappUsageTrendLineOptions.legend.position="nw"
    //             $scope.flotLineTrendOptionsW= chrt.wtsappUsageTrendLineOptions;
    //             $scope.flotChartWhatsappUsageData = [new lineAreaDataElementW(mchartDataLineWhatsapp)];
    //             /* 
    //             * Skype Trend Usage
    //             */
    //             temp = dataval.getDataChrt(objArray[objArray.length-1].Skype)
    //             //console.log("Flag :",temp[1], "Data: ",temp[0]);
    //             if(temp[1]=="KB"){
    //                 for (var i = 0; i < objArray.length; i++){
    //                     chartDataLineSkype[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Skype)/Math.pow(2,10)];
    //                 }
    //             }else if(temp[1]=="MB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineSkype[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Skype)/Math.pow(2,20)];
    //                 }
    //             }else if(temp[1]=="GB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineSkype[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Skype)/Math.pow(2,30)];
    //                 }
    //             }else{
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineSkype[i] = [objArray[i].timems1*1000+tzoffset,objArray[i].Skype];
    //                 }
    //             }
    //             chrt.skypeUsageTrendLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
    //             //chrt.skypeUsageTrendLineOptions.yaxis.axisLabel= temp[1];
    //             chrt.skypeUsageTrendLineOptions.colors= [colorpalette[2]];
    //             chrt.skypeUsageTrendLineOptions.legend.position="nw"
    //             $scope.flotLineTrendOptionsS= chrt.skypeUsageTrendLineOptions;
    //             $scope.flotChartSkypeUsageData = [new lineAreaDataElementS(mchartDataLineSkype)];
    //             /* 
    //             * Youtube Trend Usage
    //             */
    //             temp = dataval.getDataChrt(objArray[objArray.length-1].Youtube)
    //             //console.log("Flag :",temp[1], "Data: ",temp[0]);
    //             if(temp[1]=="KB"){
    //                 for (var i = 0; i < objArray.length; i++){
    //                     chartDataLineYoutube[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Youtube)/Math.pow(2,10)];
    //                 }
    //             }else if(temp[1]=="MB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineYoutube[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Youtube)/Math.pow(2,20)];
    //                 }
    //             }else if(temp[1]=="GB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineYoutube[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Youtube)/Math.pow(2,30)];
    //                 }
    //             }else{
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineYoutube[i] = [objArray[i].timems1*1000+tzoffset,objArray[i].Youtube];
    //                 }
    //             }
    //             chrt.youtubeUsageTrendLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
    //             //chrt.youtubeUsageTrendLineOptions.yaxis.axisLabel= temp[1];
    //             chrt.youtubeUsageTrendLineOptions.colors= [colorpalette[3]];
    //             chrt.youtubeUsageTrendLineOptions.legend.position="nw"
    //             $scope.flotLineTrendOptionsY= chrt.youtubeUsageTrendLineOptions;
    //             $scope.flotChartYoutubeUsageData = [new lineAreaDataElementY(mchartDataLineYoutube)];
    //             /* 
    //             * Facebook Trend Usage
    //             */
    //             temp = dataval.getDataChrt(objArray[objArray.length-1].Facebook)
    //             //console.log("Flag :",temp[1], "Data: ",temp[0]);
    //             if(temp[1]=="KB"){
    //                 for (var i = 0; i < objArray.length; i++){
    //                     chartDataLineFacebook[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Facebook)/Math.pow(2,10)];
    //                 }
    //             }else if(temp[1]=="MB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineFacebook[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Facebook)/Math.pow(2,20)];
    //                 }
    //             }else if(temp[1]=="GB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineFacebook[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].Facebook)/Math.pow(2,30)];
    //                 }
    //             }else{
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineFacebook[i] = [objArray[i].timems1*1000+tzoffset,objArray[i].Facebook];
    //                 }
    //             }
    //             chrt.facebookUsageTrendLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
    //             //chrt.facebookUsageTrendLineOptions.yaxis.axisLabel= temp[1];
    //             chrt.facebookUsageTrendLineOptions.colors =[colorpalette[4]];
    //             chrt.facebookUsageTrendLineOptions.legend.position="nw"
    //             $scope.flotLineTrendOptionsF= chrt.facebookUsageTrendLineOptions;
    //             $scope.flotChartFacebookUsageData = [new lineAreaDataElementF(mchartDataLineFacebook)];
    //             /* 
    //             * Not Classified Trend Usage
    //             */
    //             temp = dataval.getDataChrt(objArray[objArray.length-1].NOTCLASSIFIED)
    //             //console.log("Flag :",temp[1], "Data: ",temp[0]);
    //             if(temp[1]=="KB"){
    //                 for (var i = 0; i < objArray.length; i++){
    //                     chartDataLineInternet[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].NOTCLASSIFIED)/Math.pow(2,10)];
    //                 }
    //             }else if(temp[1]=="MB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineInternet[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].NOTCLASSIFIED)/Math.pow(2,20)];
    //                 }
    //             }else if(temp[1]=="GB"){
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineInternet[i] = [objArray[i].timems1*1000+tzoffset,(objArray[i].NOTCLASSIFIED)/Math.pow(2,30)];
    //                 }
    //             }else{
    //                 for (var i = 0; i < objArray.length; i++) {
    //                     chartDataLineInternet[i] = [objArray[i].timems1*1000+tzoffset,objArray[i].NOTCLASSIFIED];
    //                 }
    //             }
    //             chrt.notclasifiedUsageTrendLineOptions= angular.copy(flotChrtOptions.flotLineChrtOptions);
    //             //chrt.notclasifiedUsageTrendLineOptions.yaxis.axisLabel= temp[1];
    //             chrt.notclasifiedUsageTrendLineOptions.colors= [colorpalette[5]];
    //             chrt.notclasifiedUsageTrendLineOptions.legend.position="nw"
    //             $scope.flotLineTrendOptionsI= chrt.notclasifiedUsageTrendLineOptions;
    //             $scope.flotChartInternetUsageData = [new lineAreaDataElementI(mchartDataLineNOTCLASSIFIED)];
    //         }
    //         else{
    //             $scope.appTrendMlineOptions = flotChrtOptions.flotLineChrtDefultOptions;
    //             $scope.flotLineTrendOptionsG = flotChrtOptions.flotLineChrtDefultOptions;        
    //             $scope.flotLineTrendOptionsD = flotChrtOptions.flotLineChrtDefultOptions;        
    //             $scope.flotLineTrendOptionsW = flotChrtOptions.flotLineChrtDefultOptions;        
    //             $scope.flotLineTrendOptionsS = flotChrtOptions.flotLineChrtDefultOptions;        
    //             $scope.flotLineTrendOptionsY = flotChrtOptions.flotLineChrtDefultOptions;        
    //             $scope.flotLineTrendOptionsF = flotChrtOptions.flotLineChrtDefultOptions;        
    //             $scope.flotLineTrendOptionsI = flotChrtOptions.flotLineChrtDefultOptions;        
    //         }
    //     });

    
    
    // dfltLoad();

    // }
    
