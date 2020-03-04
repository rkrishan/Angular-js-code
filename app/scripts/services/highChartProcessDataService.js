'use strict';

/**
 * @ngdoc service
 * @name spectaApp.GlobalConfig
 * @description
 * # GlobalConfig
 * Service in the spectaApp.
 */
angular.module('specta')
    .service('highchartProcessData', function (globalConfig,dataFormatter, dbService, httpService) {
    
    var colorpallete= ['#f15c80', '#f7a35c','#1F9EA3', '#64DDBB', '#7C4DFF', '#C25396','#f1c40f', '#92F22A',   '#97CE68', '#897FBA','#e74c3c', '#2C82C9', '#83D6DE',   '#14967C','#EC644B', '#D24D57',];


    
    var appColorpallete= [
      {
        "App": "Youtube",
        "color": '#f15c80'
      },
      {
        "App": "Internet",
        "color": '#f7a35c'
      },
      {
        "App": "Facebook",
        "color": '#1F9EA3'
      },
      {
        "App": "Cloud Provider",
        "color": '#64DDBB'
      },
      {
        "App": "Google",
        "color": '#7C4DFF'
      },
      {
        "App": "Social Network",
        "color": '#C25396'
      },
      {
        "App": "Apple",
        "color": '#92F22A'
      },
      {
        "App": "Games",
        "color":  '#97CE68'
      },
      {
        "App": "IP2IP",
        "color": '#897FBA'
      },
      {
        "App": "Video",
        "color": '#e74c3c'
      },
      {
        "App": "E-Commerce",
        "color": '#2C82C9'
      },
      {
        "App": "Skype",
        "color": '#83D6DE'
      },
      {
        "App": "Sports",
        "color": '#14967C'
      },
      {
        "App": "Hotmail",
        "color": '#EC644B'
      },
      {
        "App": "Whatsapp",
        "color": '#D24D57'
      },
      {
        "App": "Akamai",
        "color": '#edfb0d'
      },
      {
        "App": "News",
        "color": '#f05bd0'
      },
      {
        "App": "Microsoft",
        "color": '#f1c40f'
      },
      {
        "App": "Yahoo Mail",
        "color": '#952e8f'
      },
      {
        "App": "Music",
        "color": '#d99b82'
      },
      {
        "App": "Stock",
        "color": '#ff0789'
      },
      {
        "App": "Yahoo",
        "color": '#ff6f52'
      },
      {
        "App": "Baidu",
        "color": '#ff9a8a'
      },
      {
        "App": "NetFlix",
        "color": '#bcf5a6'
      },
      {
        "App": "Gmail",
        "color": '#ffffb6'
      },
      {
        "App": "OpenDNS",
        "color":  '#02066f'
      },
      {
        "App": "Citrix GotoMeeting",
        "color": '#8e7618'
      },
      {
        "App": "LinkedIn",
        "color": '#ff6163'
      },
      {
        "App": "Webex",
        "color": '#b2713d'
      },
      {
        "App": "Viber",
        "color": '#85a3b2'
      },
      {
        "App": "Travel",
        "color": '#fe2f4a'
      },
      {
        "App": "Food Ordering",
        "color": '#c27e79'
      },
      {
        "App": "Twitter",
        "color": '#1ef876'
      },
      {
        "App": "File Sharing",
        "color": '#87a922'
      },
      {
        "App": "ISP-Transit",
        "color": '#18d17b'
      },
      {
        "App": "DNS",
        "color": '#a2653e'
      },
      {
        "App": "Dropbox",
        "color": '#c071fe'
      },
      {
        "App": "Bank",
        "color": '#b17261'
      },
      {
        "App": "ISP",
        "color": '#02ccfe'
      },
      {
        "App": "Speed Test",
        "color": '#de9dac'
      },
    ];

    this.CEIColorPallete = ['#0dfb59', '#edfb0d', 'rgb(255,28,28)', '#64DDBB', '#7C4DFF', '#C25396', '#f1c40f', '#92F22A', '#97CE68', ];
    
    // this.CEIColorPallete = ['#1F9EA3', '#f7a35c', '#f15c80', '#64DDBB', '#7C4DFF', '#C25396', '#f1c40f', '#92F22A', '#97CE68'];
    
    /*var CEIColor= [
            {value: 'Pathetic', color: '#db0a26'}, 
            {value: 'Poor', color: '#fb250d'},
            {value: 'Bad', color: 'rgb(255,28,28)'}, 
            {value: 'Good', color: '#edfb0d'},
            {value: 'Average', color: '#f05bd0'}, 
            {value: 'VeryGood', color: '#1e63a2'}, 
            {value: 'Excellent', color: '#0dfb59'}
        ];*/

    var CEIColor= [];

        
    /*var DNSResolutionBkt= [
            {value: "UNDEFINED", color: '#7C4DFF'}, 
            {value: "No Response", color: '#C25396'}, 
            {value: "50ms above", color: 'rgb(255,28,28)'}, 
            {value: "40ms - 50ms", color: '#f1c40f'}, 
            {value: "30ms - 40ms", color: '#64DDBB'},
            {value: "20ms - 30ms", color: '#97CE68'},
            {value: "10ms - 20ms", color: '#92F22A'}, 
            {value: "0ms - 10ms", color: '#0dfb59'}
        ];*/
    var DNSResolutionBkt= [];
    var CDNBkt= [];
    
    //#FFFF66 #FFFF99 #ADFF2F #32CD32 #3CB371
    this.colorpallete= colorpallete;
    
    function getDateArray(dateList, dateObjArray, label){
        //console.log(dateObjArray);
        for(var j=0; j<dateObjArray.length; j++){
            var date= dateObjArray[j][label];
            var index= $.inArray(date, dateList);
            if(index == -1){
                dateList.push(date);
                //console.log("dateList",dateList);
            }
        }
        //dateList= angular.copy(dateList.sort());
        dateList= angular.copy(dateList.sort(function(a, b) {
            return a - b;
        }));
        //console.log("after sort",dateList);
        return dateList;
    }
      
    function getLabelCategoriesArray(xAxisArrayList, dateObjArray, label){
        //console.log(dateObjArray);
        for(var j=0; j<dateObjArray.length; j++){
            var tempLabel= dateObjArray[j][label];
            var index= $.inArray(tempLabel, xAxisArrayList);
            if(index == -1){
                xAxisArrayList.push(tempLabel);
            }
        }
        return xAxisArrayList;
        console.log("xAxisArrayList", xAxisArrayList);
    }
     
    function getAppColor(app){
        var appArray= [];
        for(var i in appColorpallete){
            appArray[i]= appColorpallete[i].App;
        }
        var index= $.inArray(app, appArray);
        // console.log("index", index);
        if(index == -1){
            return colorpallete[0];
        }
        else 
            return appColorpallete[index]['color'];    
    }

    this.getAppColor= function(app){
        var appColor= getAppColor(app);
        return appColor;
    }

    function getColor(status){
        var statArray= [];
        for(var i in CEIColor){
            statArray[i]= CEIColor[i].bktname;
        }
        var index= $.inArray(status, statArray);
        return CEIColor[index]['color'];
    }

    function getCollection(keyName, callBackRtn){
        var collection;
        if(keyName == 'Latency')
            collection = 'lku_firstbytelatency_buckets'
        else if('ResolutionBucket' == keyName)
            collection = 'lku_dns_resolution_buckets'
        else if('ResolutionBkt' == keyName)
            collection = 'lku_dns_resolution_buckets'
        else if('CEI' == keyName)
            collection = 'lku_cei_buckets'
        else if('UsageBucket' == keyName)
            collection = 'lku_usage_buckets'
        else if('ThroughputBkt' == keyName)
            collection = 'lku_throughput_buckets'
        else if('CDN' == keyName)
            collection = 'lku_cdn_filter'

        var url = dbService.makeUrl({collection: collection, op:'select'});
        console.log(url+'&db=datadb')
        httpService.get(url+'&db=datadb').success(function(res){
            // console.log('lku__bkt', res)
            res = res.sort(function(a, b){
                return a.rank - b.rank
            })
            console.log("resorder ",res)
            callBackRtn({"orderedCollection": res});
        })
    }

    function getResolutionTimeBktColor(status){
        var statArray= [];
        console.log('DNSResolutionBkt', DNSResolutionBkt);
        for(var i in DNSResolutionBkt){
            statArray[i]= DNSResolutionBkt[i].bktname;
        }
        var index= $.inArray(status, statArray);
        return DNSResolutionBkt[index]['color'];
    }

    function getCDNBktColor(status){
        var statArray= [];
        console.log('CDNBkt', CDNBkt);
        for(var i in CDNBkt){
            statArray[i]= CDNBkt[i].bktname;
        }
        var index= $.inArray(status, statArray);
        return CDNBkt[index]['color'];
    }

    this.multilineProcessHighchartData= function multilineProcessHighchartData(param){
        console.log("param", param);
        // console.log("param length",param.length)
        var yAxisDataArray= [], yAxisDataArray1= [], processedData= [], dateArray= [], dateArray1= [];

        for(var i=0; i<param.objArray.length; i++ ){
            var seriesData= angular.copy(param.objArray[i][param.seriesdata]);
            if(i != 0){
                if(/Date/.test(param.label)){
                    dateArray= angular.copy(getDateArray(dateArray, seriesData, param.label ));
                }else{
                    dateArray= angular.copy(getLabelCategoriesArray(dateArray, seriesData, param.label ));
                }
            }else{
                for(var j=0; j<seriesData.length; j++ ){
                    dateArray[j]= seriesData[j][param.label];
                }
                //console.log("dateArrayFirstTime", dateArray);
            }
            console.log("final dateArray", dateArray) 
        }
        
        
        if(param.flag=="xAxis"){
            processedData= dateArray;
        }
        
        if(param.flag=="series"){
            processedData= [];
            for(var i=0; i<param.objArray.length; i++ ){
                var seriesData= angular.copy(param.objArray[i][param.seriesdata]);
                //console.log("I>>", i);  
                for(var l in dateArray){
                    yAxisDataArray[l]= '';
                }
                    
                console.log("after zero", yAxisDataArray);
                    
                // param.data !="Usage" && param.data !="Throughput"
                if(['Usage', 'usage', 'Throughput', 'uusage','dusage'].indexOf(param.data) == -1 ){
                    
                    for(var j=0; j<seriesData.length; j++ ){
                          
                        var index= $.inArray(seriesData[j][param.label], dateArray);
                        //console.log(index, seriesData[j][data]);
                        yAxisDataArray[index]= angular.copy(parseFloat(seriesData[j][param.data]));
                        //console.log("after index", yAxisDataArray);
                    
                    }
                }
                //console.log("yAxisDataArray", yAxisDataArray);
                
                else if(param.data =="Throughput"){
                    for(var j=0; j<seriesData.length; j++ ){
                        var index= $.inArray(seriesData[j][param.label], dateArray);
                        //console.log(index, seriesData[j][data]);
                        if(angular.isDefined(param.unit)){
                            yAxisDataArray[index]= parseFloat(angular.copy(dataFormatter.convertSingleUnitThroughputDataWoArray(seriesData[j][param.data], 3, param.unit)));
                        }else{
                            yAxisDataArray[index]= parseFloat(angular.copy(dataFormatter.convertSingleUnitThroughputDataWoArray(seriesData[j][param.data], 3, 'Kbps')));
                        }
                    }
                }
                else{
                    for(var j=0; j<seriesData.length; j++ ){
                        var index= $.inArray(seriesData[j][param.label], dateArray);
                        // console.log(index, seriesData[j][param.data]);
                        if(angular.isDefined(param.unit)){
                            yAxisDataArray[index]= parseFloat(angular.copy(dataFormatter.convertSingleUnitUsageDataWoArray(seriesData[j][param.data], 3, param.unit)));
                        }else{
                            yAxisDataArray[index]= parseFloat(angular.copy(dataFormatter.convertSingleUnitUsageDataWoArray(seriesData[j][param.data], 3, 'GB')));
                        }
                    }
                }

                if(param.seriesName=='CEI' || param.seriesName=='Latency' ){
                    processedData[i]= { 
                        "type": "spline",
                        name: param.objArray[i][param.seriesName],
                        // color: getColor(param.objArray[i][param.seriesName]),
                        data: angular.copy(yAxisDataArray)
                    }
                }else if(param.seriesName=='ResolutionBkt' ){
                    processedData[i]= {
                        name: param.objArray[i][param.seriesName],
                        color: getResolutionTimeBktColor(param.objArray[i][param.seriesName]),
                        data: yAxisDataArray
                    }
                }/*else if(param.seriesName=='CDN' ){
                    processedData[i]= {
                        name: param.objArray[i][param.seriesName],
                        color: getCDNBktColor(param.objArray[i][param.seriesName]),
                        data: yAxisDataArray
                    }
                }*/else{
                    processedData[i]= { 
                        "type": "spline",
                        name: param.objArray[i][param.seriesName],
                        color: colorpallete[i],
                        data: angular.copy(yAxisDataArray)
                    }
                }
            }
        }
        
        if(param.seriesName=='CEI' && param.flag=="series"){
            
            var  arr= [];
            getCollection('CEI', function(res){
                
                for(var i in res.orderedCollection){
                    var item = res.orderedCollection[i];
                    // console.log("item", item);
                    var isVal = _.filter(processedData, function(val){
                        return val.name == item.bktname
                    })[0];
                    console.log("isVal", isVal);
                    if(isVal){
                        isVal.color = item.color;
                        arr.push(isVal);
                    }
                }
                console.log("array", arr);
            });

            return arr;

            /*var arr= [null, null, null];
            for(var i in processedData){
                if(processedData[i]['name']== 'Excellent'){
                    processedData[i]['index']= 0;
                    arr[0]= processedData[i];
                }
                else if(processedData[i]['name']== 'Good'){
                    processedData[i]['index']= 1;
                    arr[1]= processedData[i];
                }
                else if(processedData[i]['name']== 'Bad'){
                    processedData[i]['index']= 2;
                    arr[2]= processedData[i];
                }
            }
            var finalAr= [];
            for(var i in arr){
                if(arr[i] != null){
                   finalAr.push(arr[i]); 
                }
            }
            return finalAr*/
        }else if(param.seriesName=='Latency' && param.flag=="series"){

            var  arr= [];
            getCollection('Latency', function(res){
                
                for(var i in res.orderedCollection){
                    var item = res.orderedCollection[i];
                    // console.log("item", item);
                    var isVal = _.filter(processedData, function(val){
                        return val.name == item.bktname
                    })[0];
                    console.log("isVal", isVal);
                    if(isVal){
                        isVal.color = item.color;
                        arr.push(isVal);
                    }
                }
                console.log("array", arr);
                
            });

            return arr;
            
            /*var arr= [null, null, null, null, null, null];
            for(var i in processedData){
                if(processedData[i]['name']== 'Excellent'){
                    processedData[i]['index']= 0;
                    arr[0]= processedData[i];
                }
                else if(processedData[i]['name']== 'VeryGood'){
                    processedData[i]['index']= 1;
                    arr[1]= processedData[i];
                }else if(processedData[i]['name']== 'Good'){
                    processedData[i]['index']= 1;
                    arr[2]= processedData[i];
                }else if(processedData[i]['name']== 'Average'){
                    processedData[i]['index']= 1;
                    arr[3]= processedData[i];
                }else if(processedData[i]['name']== 'Poor'||processedData[i]['name']== 'Bad'){
                    processedData[i]['index']= 1;
                    arr[4]= processedData[i];
                }
                else if(processedData[i]['name']== 'Pathetic'){
                    processedData[i]['index']= 2;
                    arr[5]= processedData[i];
                }
            }
            var finalAr= [];
            for(var i in arr){
                if(arr[i] != null){
                   finalAr.push(arr[i]); 
                }
            }
            return finalAr*/
        }else if(param.seriesName=='CDN' && param.flag=="series"){

            var  arr= [];
            getCollection('CDN', function(res){
                
                for(var i in res.orderedCollection){
                    var item = res.orderedCollection[i];
                    // console.log("item", item);
                    var isVal = _.filter(processedData, function(val){
                        return val.name == item.bktname
                    })[0];
                    console.log("isVal", isVal);
                    if(isVal){
                        isVal.color = item.color;
                        arr.push(isVal);
                    }
                }
                console.log("array", arr);
                
            });

            return arr;
            
            /*var arr= [null, null, null, null, null, null];
            for(var i in processedData){
                if(processedData[i]['name']== 'Excellent'){
                    processedData[i]['index']= 0;
                    arr[0]= processedData[i];
                }
                else if(processedData[i]['name']== 'VeryGood'){
                    processedData[i]['index']= 1;
                    arr[1]= processedData[i];
                }else if(processedData[i]['name']== 'Good'){
                    processedData[i]['index']= 1;
                    arr[2]= processedData[i];
                }else if(processedData[i]['name']== 'Average'){
                    processedData[i]['index']= 1;
                    arr[3]= processedData[i];
                }else if(processedData[i]['name']== 'Poor'||processedData[i]['name']== 'Bad'){
                    processedData[i]['index']= 1;
                    arr[4]= processedData[i];
                }
                else if(processedData[i]['name']== 'Pathetic'){
                    processedData[i]['index']= 2;
                    arr[5]= processedData[i];
                }
            }
            var finalAr= [];
            for(var i in arr){
                if(arr[i] != null){
                   finalAr.push(arr[i]); 
                }
            }
            return finalAr*/
        }else
            return processedData
    }
    
    this.bubbleProcessHighchartData= function bubbleProcessHighchartData(objArray, label, data, seriesdata, seriesName){
        var processedData= [] ;

        for(var i=0; i<objArray.length; i++ ){
            var dataArray= [], unformatedYData= [], formatedYData= [];
            var seriesData= angular.copy(objArray[i][seriesdata]);
            
            for(var j=0; j<seriesData.length; j++){
                var yData;
                
                if(seriesData[j].hasOwnProperty(data)){
                    yData= parseFloat(angular.copy(dataFormatter.convertSingleUnitUsageDataWoArray(seriesData[j][data], 3, 'MB')));
                    if(yData>0.000){
                        dataArray.push([seriesData[j][label], parseFloat(yData), parseFloat(yData)]);
                    }else{
                        dataArray.push([seriesData[j][label], null,null]);
                    }
                }else{
                    dataArray.push([seriesData[j][label], null,null] );
                }  
            }
            
            processedData[i]= { 
                name: objArray[i][seriesName],
                color: getAppColor(objArray[i][seriesName]),//colorpallete[i],
                data: angular.copy(dataArray)
            }
        }
        return processedData;
    }
    
    this.barColumnProcessHighchartData= function barColumnProcessHighchartData(param){
        // console.log("param", param);
        var processedData= [], xAxisdataArray= [];
        var yAxisDataArray= [], yAxisDataArray1= [], processedData= [], dateArray= [], dateArray1= [];
        /*if(param.seriesName == 'ResolutionBkt'){

            
        }
        
        if(param.seriesName == 'CEI'){
            var url= globalConfig.dataapiurl+'collection=lku_cei_buckets&op=select&db=datadb';
            httpService.get(url).then(function (response) {
                CEIColor= angular.copy(response.data)
            })
        }*/

        for(var i=0; i<param.objArray.length; i++ ){
            // console.log("param", param);
            var seriesData= angular.copy(param.objArray[i][param.seriesdata]);
            if(i != 0){
                //console.log("inside >0");
                //console.log("param.label", angular.isDefined(param.label));
                if(/Date/.test(param.label)){
                    //console.log("inside date");
                    xAxisdataArray= angular.copy(getDateArray(xAxisdataArray, seriesData, param.label ));
                }else{
                xAxisdataArray= angular.copy(getLabelCategoriesArray(xAxisdataArray, seriesData, param.label ));
                }
                //console.log("xAxisdataArray", xAxisdataArray);
            }else{
                for(var j=0; j<seriesData.length; j++ ){
                    xAxisdataArray[j]= seriesData[j][param.label];
                }
                //console.log("xAxisdataArray", xAxisdataArray);
            }
        }
        
        if(param.flag=="xAxis"){
            processedData= xAxisdataArray;
        }
        
        if(param.flag=="series"){
            //commented code for stacked bar

            processedData= [];
            for(var i=0; i<param.objArray.length; i++ ){
                var yAxisDataArray= [];
                var seriesData= angular.copy(param.objArray[i][param.seriesdata]);
           
                
                for(var k in xAxisdataArray){
                    yAxisDataArray[k]= '';
                }
                if(param.data !="Usage" && param.data !="Throughput"){     
                    for(var j=0; j<seriesData.length; j++ ){
                        var index= $.inArray(seriesData[j][param.label], xAxisdataArray);
                        yAxisDataArray[index]= parseFloat(seriesData[j][param.data]);
                    }
                }else if(param.data =="Throughput"){  
                    for(var j=0; j<seriesData.length; j++ ){
                        var index= $.inArray(seriesData[j][param.label], xAxisdataArray);
                        // yAxisDataArray[index]= parseFloat(seriesData[j][param.data]);

                        if(angular.isDefined(param.unit)){
                            yAxisDataArray[index]= parseFloat(angular.copy(dataFormatter.convertSingleUnitThroughputDataWoArray(seriesData[j][param.data], 3, param.unit)));
                        }else{
                            yAxisDataArray[index]= parseFloat(angular.copy(dataFormatter.convertSingleUnitThroughputDataWoArray(seriesData[j][param.data], 3, 'Kbps')));
                        }
                    }
                }else{
                    for(var j=0; j<seriesData.length; j++ ){
                        var index= $.inArray(seriesData[j][param.label], xAxisdataArray);
                        // yAxisDataArray[index]= parseFloat(seriesData[j][param.data]);

                        if(angular.isDefined(param.unit)){
                            yAxisDataArray[index]= parseFloat(angular.copy(dataFormatter.convertSingleUnitUsageDataWoArray(seriesData[j][param.data], 3, param.unit)));
                        }else{
                            yAxisDataArray[index]= parseFloat(angular.copy(dataFormatter.convertSingleUnitUsageDataWoArray(seriesData[j][param.data], 3, 'GB')));
                        }
                    }
                }
                //console.log("yAxisDataArray", param.objArray[i][param.seriesName]);
                if(param.seriesName=='CEI' || param.seriesName=='Latency' ){
                    processedData[i]= {
                        name: param.objArray[i][param.seriesName],
                        // color: getColor(param.objArray[i][param.seriesName]),
                        data: yAxisDataArray
                    }
                }else if(param.seriesName=='ResolutionBkt' ){
                    var url= globalConfig.dataapiurl+'collection=lku_dns_resolution_buckets&op=select&db=datadb';
                    // httpService.get(url).then(function (response) {
                        // DNSResolutionBkt= angular.copy(response.data)
                        // console.log("DNSResolutionBkt", DNSResolutionBkt);
                        // console.log("param","i", i, param.objArray);
                        processedData[i]= {
                        name: param.objArray[i][param.seriesName],
                        // color: getResolutionTimeBktColor(param.objArray[i][param.seriesName]),
                        data: yAxisDataArray
                    }
                    // })
                    
                }else if(param.seriesName=='ThroughputBkt' ){
                    var url= globalConfig.dataapiurl+'collection=lku_dns_resolution_buckets&op=select&db=datadb';
                    // httpService.get(url).then(function (response) {
                        // DNSResolutionBkt= angular.copy(response.data)
                        // console.log("DNSResolutionBkt", DNSResolutionBkt);
                        // console.log("param","i", i, param.objArray);
                        processedData[i]= {
                        name: param.objArray[i][param.seriesName],
                        // color: getResolutionTimeBktColor(param.objArray[i][param.seriesName]),
                        data: yAxisDataArray
                    }
                    // })
                    
                }else if(param.seriesName=='CDN' ){
                    var url= globalConfig.dataapiurl+'collection=lku_cdn_filter&op=select&db=datadb';
                    // httpService.get(url).then(function (response) {
                        // DNSResolutionBkt= angular.copy(response.data)
                        // console.log("DNSResolutionBkt", DNSResolutionBkt);
                        // console.log("param","i", i, param.objArray);
                        processedData[i]= {
                            name: param.objArray[i][param.seriesName],
                            // color: getCDNBktColor(param.objArray[i][param.seriesName]),
                            data: yAxisDataArray
                        }
                    // })
                    
                }else{
                    processedData[i]= {
                        name: param.objArray[i][param.seriesName],
                        color: colorpallete[i],
                        data: yAxisDataArray
                    }
                }
            }
        }

        if(param.seriesName=='CEI' && param.flag=="series"){

            var  arr= [];
            getCollection('CEI', function(res){
                
                for(var i in res.orderedCollection){
                    var item = res.orderedCollection[i];
                    // console.log("item", item);
                    var isVal = _.filter(processedData, function(val){
                        return val.name == item.bktname
                    })[0];
                    console.log("isVal", isVal);
                    if(isVal){
                        isVal.color = item.color;
                        arr.push(isVal);
                    }
                }
                console.log("array", arr);
                
            });

            return arr;

            /*var arr= [null, null, null];
            for(var i in processedData){
                if(processedData[i]['name']== 'Excellent'){
                    processedData[i]['index']= 0;
                    arr[0]= processedData[i];
                }
                else if(processedData[i]['name']== 'Good'){
                    processedData[i]['index']= 1;
                    arr[1]= processedData[i];
                }
                else if(processedData[i]['name']== 'Bad'){
                    processedData[i]['index']= 2;
                    arr[2]= processedData[i];
                }
            }
            var finalAr= [];
            for(var i in arr){
                if(arr[i] != null){
                   finalAr.push(arr[i]); 
                }
            }
            return finalAr*/
        }else if(param.seriesName=='ResolutionBkt' && param.flag=="series"){

            var  arr= [];
            getCollection('ResolutionBkt', function(res){
                
                for(var i in res.orderedCollection){
                    var item = res.orderedCollection[i];
                    // console.log("item", item);
                    var isVal = _.filter(processedData, function(val){
                        return val.name == item.bktname
                    })[0];
                    console.log("isVal", isVal);
                    if(isVal){
                        isVal.color = item.color;
                        arr.push(isVal);
                    }
                }
                console.log("array", arr);
                
            });

            return arr;

            /*var arr= [null, null, null];
            for(var i in processedData){
                if(processedData[i]['name']== 'Excellent'){
                    processedData[i]['index']= 0;
                    arr[0]= processedData[i];
                }
                else if(processedData[i]['name']== 'Good'){
                    processedData[i]['index']= 1;
                    arr[1]= processedData[i];
                }
                else if(processedData[i]['name']== 'Bad'){
                    processedData[i]['index']= 2;
                    arr[2]= processedData[i];
                }
            }
            var finalAr= [];
            for(var i in arr){
                if(arr[i] != null){
                   finalAr.push(arr[i]); 
                }
            }
            return finalAr*/
        }else if(param.seriesName=='ThroughputBkt' && param.flag=="series"){

            var  arr= [];
            getCollection('ThroughputBkt', function(res){
                
                for(var i in res.orderedCollection){
                    var item = res.orderedCollection[i];
                    // console.log("item", item);
                    var isVal = _.filter(processedData, function(val){
                        return val.name == item.bktname
                    })[0];
                    console.log("isVal", isVal);
                    if(isVal){
                        isVal.color = item.color;
                        arr.push(isVal);
                    }
                }
                console.log("array", arr);
                
            });

            return arr;

            /*var arr= [null, null, null];
            for(var i in processedData){
                if(processedData[i]['name']== 'Excellent'){
                    processedData[i]['index']= 0;
                    arr[0]= processedData[i];
                }
                else if(processedData[i]['name']== 'Good'){
                    processedData[i]['index']= 1;
                    arr[1]= processedData[i];
                }
                else if(processedData[i]['name']== 'Bad'){
                    processedData[i]['index']= 2;
                    arr[2]= processedData[i];
                }
            }
            var finalAr= [];
            for(var i in arr){
                if(arr[i] != null){
                   finalAr.push(arr[i]); 
                }
            }
            return finalAr*/
        }else if(param.seriesName=='Latency' && param.flag=="series"){
            var  arr= [];
            getCollection('Latency', function(res){
                
                for(var i in res.orderedCollection){
                    var item = res.orderedCollection[i];
                    // console.log("item", item);
                    var isVal = _.filter(processedData, function(val){
                        return val.name == item.bktname
                    })[0];
                    console.log("isVal", isVal);
                    if(isVal){
                        isVal.color = item.color;
                        arr.push(isVal);
                    }
                }
                console.log("array", arr);
                
            });

            return arr;

            /*var arr= [null, null, null, null, null, null];
            for(var i in processedData){
                if(processedData[i]['name']== 'Excellent'){
                    processedData[i]['index']= 0;
                    arr[0]= processedData[i];
                }
                else if(processedData[i]['name']== 'VeryGood'){
                    processedData[i]['index']= 1;
                    arr[1]= processedData[i];
                }else if(processedData[i]['name']== 'Good'){
                    processedData[i]['index']= 1;
                    arr[2]= processedData[i];
                }else if(processedData[i]['name']== 'Average'){
                    processedData[i]['index']= 1;
                    arr[3]= processedData[i];
                }else if(processedData[i]['name']== 'Poor'||processedData[i]['name']== 'Bad'){
                    processedData[i]['index']= 1;
                    arr[4]= processedData[i];
                }
                else if(processedData[i]['name']== 'Pathetic'){
                    processedData[i]['index']= 2;
                    arr[5]= processedData[i];
                }
            }
            var finalAr= [];
            for(var i in arr){
                if(arr[i] != null){
                   finalAr.push(arr[i]); 
                }
            }
            return finalAr*/
        }else if(param.seriesName=='CDN' && param.flag=="series"){
            var  arr= [];
            getCollection('CDN', function(res){
                
                for(var i in res.orderedCollection){
                    var item = res.orderedCollection[i];
                    console.log("item", item);
                    var isVal = _.filter(processedData, function(val){
                        return val.name == item.bktname
                    })[0];
                    console.log("isVal", isVal);
                    if(isVal){
                        isVal.color = item.color;
                        arr.push(isVal);
                    }
                }
                console.log("array", arr);
                
            });

            return arr;

            /*var arr= [null, null, null, null, null, null];
            for(var i in processedData){
                if(processedData[i]['name']== 'Excellent'){
                    processedData[i]['index']= 0;
                    arr[0]= processedData[i];
                }
                else if(processedData[i]['name']== 'VeryGood'){
                    processedData[i]['index']= 1;
                    arr[1]= processedData[i];
                }else if(processedData[i]['name']== 'Good'){
                    processedData[i]['index']= 1;
                    arr[2]= processedData[i];
                }else if(processedData[i]['name']== 'Average'){
                    processedData[i]['index']= 1;
                    arr[3]= processedData[i];
                }else if(processedData[i]['name']== 'Poor'||processedData[i]['name']== 'Bad'){
                    processedData[i]['index']= 1;
                    arr[4]= processedData[i];
                }
                else if(processedData[i]['name']== 'Pathetic'){
                    processedData[i]['index']= 2;
                    arr[5]= processedData[i];
                }
            }
            var finalAr= [];
            for(var i in arr){
                if(arr[i] != null){
                   finalAr.push(arr[i]); 
                }
            }
            return finalAr*/
        }else
            return processedData
    }

    this.dynamicHighchartData = function(param){
        var processedData= [], xAxisdataArray= [];
        console.log("param", param);
            
        for(var i=0; i<param.objArray.length; i++ ){
            var seriesData= angular.copy(param.objArray[i][param.seriesdata]);
            if(i != 0){
                //console.log("inside >0");
                //console.log("param.label", angular.isDefined(param.label));
                if(/Date/.test(param.label) || /date/.test(param.label) || /Hour/.test(param.label)|| /hour/.test(param.label)){
                    // console.log("inside date");
                    xAxisdataArray= angular.copy(getDateArray(xAxisdataArray, seriesData, param.label ));
                }else{
                    xAxisdataArray= angular.copy(getLabelCategoriesArray(xAxisdataArray, seriesData, param.label ));
                }
                //console.log("xAxisdataArray", xAxisdataArray);
            }else{
                for(var j=0; j<seriesData.length; j++ ){
                    xAxisdataArray[j]= seriesData[j][param.label];
                }
                //console.log("xAxisdataArray", xAxisdataArray);
            }
        }
        
        if(param.flag=="xAxis"){
            processedData= xAxisdataArray;
            return processedData
        }
        
        if(param.flag=="series"){
            processedData= []
            
            for(var i=0; i<param.objArray.length; i++ ){
                var yAxisDataArray= [];
                var seriesData= angular.copy(param.objArray[i][param.seriesdata]);
           
                for(var k in xAxisdataArray){
                    yAxisDataArray[k]= '';
                }
                for(var j=0; j<seriesData.length; j++ ){
                    var index= $.inArray(seriesData[j][param.label], xAxisdataArray);
                    // yAxisDataArray[index]= parseFloat(seriesData[j][param.data]);
                    if(param.unitSelected == 'usage')
                        yAxisDataArray[index]= parseFloat(dataFormatter.convertSingleUnitUsageDataWoArray(seriesData[j][param.data], 3, param.unit));    
                    else if(param.unitSelected == 'speed')
                        yAxisDataArray[index]= parseFloat(dataFormatter.convertSingleUnitThroughputDataWoArray(seriesData[j][param.data], 3, param.unit));
                    else
                        yAxisDataArray[index]= parseFloat(seriesData[j][param.data]);
                }
                processedData[i]= {
                    name: param.objArray[i][param.seriesName],
                    color: colorpallete[i],
                    data: yAxisDataArray
                }
            }
            
        }

        if(param.fixOrder){
            var  arr= [];
            for(var i in param.fixOrder){
                var item = param.fixOrder[i];
                console.log("item", item);
                var isVal = _.filter(processedData, function(val){
                    return val.name == item.bktname
                })[0]
                if(isVal){
                    isVal.color = item.color;
                    arr.push(isVal);
                }
            }
            console.log("array", arr);
            return arr;
        }
        else
            return processedData
    }
    
});