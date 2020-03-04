'use strict';

angular.module('specta') 
    .controller('rptUsageCtrl',function($scope,$http,globalConfig,$filter,$timeout,$rootScope,$interval,dataval,flotChrtOptions) {
    
    
    var colorpalette = ["blue", "grey", "red", "purple", 
                        "rgba(253,180,92,1)", "green", "rgba(77,83,96,1)", "#B6B6B6" , 
                        "#212121", "#FFC107", "#D32F2F", "#7C4DFF"];
    
    $scope.checkbox={GERAN: false, UTRAN: false, LTE: false};
    console.log($scope.checkbox);
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
        tNow= t - i*24*3600*1000;
        btnArray[++index]= new btnData($filter('date')(tNow, 'yyyy-MM-dd'),i + 'D',index);
    }
    
    //Today
    btnArray[++index]= new btnData($filter('date')(t, 'yyyy-MM-dd'),'Today',index);
    $scope.btnArrayView= btnArray;
    
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
    /*
    *   Device type wise Usage
    */
    function deviceUsageData(){
        $http.get(globalConfig.dataurl+'MostPopularDeviceUsageDayswise&GERAN='+geran+'&UTRAN='+utran+'&LTE='+lte+"&time="+timeValue).then(function (response) {
            //console.log(response.data);
            var objArray = response.data;
            var devicewiseUsage= function  (a,b) {
                this.device = a;
                this.usage = b;
            }
            var devicewiseUsageData = [];
        
            if(objArray.length>0){
               for (var i = 0; i < objArray.length; i++) {
                   devicewiseUsageData[i] = new devicewiseUsage(objArray[i].model,dataval.getData(objArray[i].Usage.toFixed(3)));
               }
               $scope.MostPopularDevices=devicewiseUsageData;
            }
            else
                initDeviceUsage();
        });
    }
    
    
    
    //click checkbox event
    var v= [],geran,utran,lte;
    var d= function(){
        var  i=-1;
        angular.forEach($scope.checkbox,function(key,value){
            if(key==true){
                v[++i]= value;
            }else{
                v[++i]= "";
            }
        })
        geran=v[0];
        utran= v[1];
        lte= v[2];
        deviceUsageData();
        //console.log(v, timeValue);
    }
    
    //click Time event call
    var timeValue= btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        console.log(data,index);
        timeValue= data;
        d();
    } 
    
    d();
    $scope.fetchCheckboxData= d;
     
    /*
    * Device wise Distribution
    */
    var mapdata= [],colorbox=[], infoLabel=[],mapdata2G= [],mapdata3G= [];
    
    $http.get(globalConfig.dataurl+'MapDeviceDistribution2G3G').then(function (response) {
        //console.log(response.data);
        var objArray = response.data;
        for(var index=0;index<objArray.length;index++){
            if(objArray[index].rat=="GERAN"){
                objArray[index].count = objArray[index].count * .6
                colorbox[index]=colorpalette[1];
            }else{
                objArray[index].count = objArray[index].count * .4
                colorbox[index]=colorpalette[0];
            }
            mapdata[index]= {index:{Count: objArray[index].count, Position: [objArray[index].latitude,      objArray[index].longitude], Color: colorbox[index] }};
            //infoLabel[index]= [objArray[index].rat, objArray[index].count];
        }
        $scope.loc= [objArray[0].latitude, objArray[0].longitude]
        
    });
    $scope.mdata = mapdata;
    $scope.getRadius = function(num) {
        return num;
    }
    
    
    
});