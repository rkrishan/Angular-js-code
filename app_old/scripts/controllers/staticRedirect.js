/*'use strict';

angular.module('specta') 
    .controller('StaticAnalysisCtrl',function($scope, $stateParams, $http,globalConfig,$filter,$timeout,$rootScope,$interval,dataval,flotChrtOptions) {
    
    console.log('file', $stateParams.file);
    if(angular.isDefined($stateParams.file)){
        $scope.file = 'views/static/analysis/' + $stateParams.file;
    }
    
});*/

'use strict';

angular
    .module('specta')
    .controller('StaticRedirectCtrl', staticRedirectCtrl)
    .controller('BBTrafficLineCtrl',BBTrafficLineCtrl)
    .controller('deviceUsageGeoDistributionCtrl',deviceUsageGeoDistributionCtrl);
    

function staticRedirectCtrl($scope, $stateParams, ChartService){

    // console.log('params', $stateParams.params);
    // console.log('filterParams', $stateParams.filterParams);
    // console.log('file = ', $stateParams.file);
    ChartService.setCurrentPage(null);
    if(angular.isDefined($stateParams.file)){
        $scope.file = 'views/static/' + $stateParams.file;
    }
    if(angular.isDefined($stateParams.params.file)){
        $scope.file = 'views/static/' + $stateParams.params.file;
    }
}

//Device Usage GeoDistribution controller

function deviceUsageGeoDistributionCtrl($scope, $stateParams, $http, globalConfig, $filter, $timeout, $rootScope, dataFormatter,utility, uiGmapGoogleMapApi) {

    //track url starts
    utility.trackUrl();
    //end track url

    var tzoffset= globalConfig.tzoffset;
    var filterParameters = "";
    var heatLayerObj;
    var initLat= 15.65;
    var initLong= 74.0165;
    
    console.log('$stateParams.params',$stateParams.params);
    console.log('$stateParams.filterParams',$stateParams.filterParams);
    
    var key= $stateParams.params.Key;
    var DeviceName= $stateParams.params.Device;
    filterParameters= $stateParams.filterParams;
    filterParameters= filterParameters + "&device=[/^." + $stateParams.params.Device + "./]";
    
    function makeStatementUrl(statement){
        var newstatement=  statement+filterParameters;
        console.log('newstatement',newstatement);
        return newstatement;
    }

    $scope.DisplayKey= key;
    $scope.DeviceName= DeviceName;
    
    //Geo Distribution
    function loadGeoDitribution(){
        //var pointarray;
        var statementName= 'Test Heat Map with Filters';
        var mapData= [];
        console.log('statement name  === ', statementName);
        //heatLayerObj.setData(mapData);    //If want to reset the map           
        var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(statementName);
        $http.get(url).then(function (response) {  
            var objArray = response.data;
            if(objArray.length>0){
                for (var i = 0; i < objArray.length; i++) {
                    mapData[i]= new google.maps.LatLng(objArray[i].latitude, objArray[i].longitude);
                }
                initLat= objArray[0].latitude;
                initLong= objArray[0].longitude;
            }
            //var pointArray = new google.maps.MVCArray(mapData);
            //console.log('heatLayerObj',heatLayerObj);
            //if(firsttime)
            heatLayerObj.setData(mapData);
            
        });        
    }

    
    function LoadHeatLayer(heatLayer) {
        heatLayerObj= heatLayer;
        loadGeoDitribution();
    };

    $scope.map = {
        center: {
            latitude: initLat,
            longitude: initLong
        },
        options:{
            scrollwheel: false
        },
        zoom: 9,
        heatLayerCallback: function (layer) {
            //set the heat layers backend data
            var loadHeatLayer = new LoadHeatLayer(layer);
        },
        showHeat: true,
        size:{
            height: 400
        } 
    };
    
    
        //Tab Penetration
    //Datatable Options
    $scope.tableOptions= { 
        "order" :[[4,"desc"]]
        //"aaSorting": [],
        //paging: true,
        //"bLengthChange": false, 
        //searching: false,
        //"bSort": false, 
        //"bInfo": true,
        //"bAutoWidth": false 
    };
    function tableDataElement (a,b,c,d,e,f,g) {
        this.country= a;
        this.circle= b;
        this.city= c;
        this.area= d;
        this.cell= e;
        this.value= f;
        this.valueperc= g;
    }
    var dataArray= [];
    dataArray[0]= new tableDataElement('- No record-','','');
    $scope.dataset = dataArray;
    
    var statementName;
    var totalstatementName;
    if(key == 'Count'){
        statementName= 'Location wise count for Handset';
        totalstatementName= 'Location wise total count for Handset';
    }else if(key == 'Traffic'){
        statementName= 'Location wise traffic for Handset';
        totalstatementName= 'Location wise total traffic for Handset';
    }
    else if(key == 'speed'){
        // statementName= 'Location wise traffic for Handset';
        // totalstatementName= 'Location wise total traffic for Handset';
    }
    
    function loadDeviceTable(){        
        //First get the total for % calculation
        var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(totalstatementName);
        console.log(url);
        $http.get(url).then(function (response) {  
            console.log(response.data)
            var objArray = response.data;
            var total= objArray[0].Total;
            
            //Now get details
            var url= globalConfig.pullfilterdataurlbyname+makeStatementUrl(statementName);
            $http.get(url).then(function (response) {  
                console.log(response.data)
                var objArray = response.data;
                for (var i = 0; i < objArray.length; i++) {
                    dataArray[i] = new tableDataElement(
                        objArray[i].Country,
                        objArray[i].Circle,
                        objArray[i].City,
                        objArray[i].Area,
                        objArray[i].Cell,
                        objArray[i].value,
                        (objArray[i].value / total)*100
                    );
                }
                $scope.dataset = dataArray;        
            });
        });
    }
    
    loadDeviceTable();
}

//BB Traffic controller

function BBTrafficLineCtrl($scope,$http,globalConfig,$filter,$timeout,$rootScope,$interval,utility,dataFormatter, $stateParams){

    //track url starts
    utility.trackUrl();
    //end track url

    //console.log("stateParams", $stateParams);
    var key= $stateParams.params.Key;
    var value= $stateParams.params.value;
    console.log("hshshsh",$stateParams);
    console.log("key:",key);
    console.log("value: ", value);

    var lineURL= globalConfig.pulldataurlbyname+"Hourly traffic today for Plan&"+key+"="+value;
    var barURL=  globalConfig.pulldataurlbyname+"Plan wise hourly avg for last week&"+key+"="+value;

        $scope.OSoptions = {
            chart: {
                type: 'linePlusBarChart',
                height: 500,
                margin: {
                    top: 30,
                    right: 75,
                    bottom: 50,
                    left: 75
                },
                bars: {
                    forceY: [0]
                },
                bars2: {
                    forceY: [0]
                },
                color: ['#2ca02c', 'darkred'],
                x: function(d,i) { return i },
                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d) {
                      var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                        return d3.format(',f')(dx)
                    }
                },
                x2Axis: {
                    tickFormat: function(d) {
                        var dx = $scope.data[0].values[d] && $scope.data[0].values[d].x || 0;
                        return d3.format(',f')(dx)
                    },
                    showMaxMin: false
                },
                y1Axis: {
                    axisLabel: 'Traffic(MB)',
                    tickFormat: function(d){
                        return d3.format(',f')(d/(1024*1024))
                    },
                    axisLabelDistance: 12
                },
                y2Axis: {
                    axisLabel: 'Traffic(MB)',
                    tickFormat: function(d) {
                        return  d3.format(',f')(d/(1024*1024))
                    }
                },
                y3Axis: {
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    }   
                },
                y4Axis: {
                    tickFormat: function(d) {
                        return d3.format(',f')(d)
                    }
                }
            }
    }
    
    $scope.config= {
        refreshDataOnly: false
    }

    var lineData= []; 
    $http.get(lineURL).then(function(response) {

        var objArray = response.data;
        console.log("Line: ",objArray)
        for(var i=0;i<objArray.length;i++){
            lineData[i]= [objArray[i].hour, objArray[i].Traffic];
        }
    });
    
    var bardata= [];         
    $http.get(barURL).then(function(response) {

        var objArray = response.data;
        console.log("Bar: ",objArray)
        for(var i=0;i<objArray.length;i++){
            bardata[i]= [objArray[i].hour, objArray[i].avgUsage];
        }
    });
    
    $timeout(function(){
        console.log("bardata: ",bardata );
        console.log("lineData:",lineData);
                 
        $scope.data = [
            {
                "key" : "Avg. weekly Traffic" ,
                "bar": true,
                "values" : bardata
            },
            {
                "key" : "Hourly Traffic" ,
                "values" : lineData
            }
        ].map(function(series) {
            series.values = series.values.map(function(d) { return {x: d[0], y: d[1] } });
            return series;
        });
    },1000);
}