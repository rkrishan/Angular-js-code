'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});'use strict';

angular.module('specta')
  .controller('StaticFilterCtrl', function ($scope, $timeout, $stateParams, $filter, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dataval) {

    $scope.selectedRate = '';
    $scope.selectedSegment = '';
    //af81a436a4337a900b320189f
    $http.get(globalConfig.pulldataurl + 'aa1138f3447ab9ab639515df4').then(function (response) {
        //console.log('testr',response.data[0].children);
        var children = response.data[0].children;
        console.log('children', children);
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: children,
            onSelect: function(select, node) {

                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                var selKeysSegment;
                selKeysSegment = $.map(selNodes, function(node){
                    //console.log("node: ",node)
                    return node;
                })
                var keyArrayParent= [];
                var keyArrayResult= [];

                // Get a list of all selected nodes, and convert to a key array:
                angular.forEach(selKeysSegment,function(node){
                var thisNode= node.data;
                var nodeKey= node.data.key;
                var thisParent = node.parent;
                var parentKey =thisParent.data.key;
                if(thisNode.isFolder){
                    //First check if parent exists
                    if(!chkEntry(keyArrayParent,parentKey)){
                        //Parent key does not exist, so add this entry in parent & result
                        keyArrayParent.push(nodeKey);
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
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
                        keyArrayResult.push(getParents(node)+"/"+nodeKey+"/");
                    }
                }
            })
            console.log("keyArrayResult: ",keyArrayResult)
            var test = '';
            angular.forEach(selKeysSegment, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
        });
    });
    
    function chkEntry(values,name){
        //console.log("keyParents :", values);
        //console.log("parent :", name);
        
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    function getParents(node){
        var parent="";
        //console.log("-- node :",node)
        while(node.parent){
            //console.log("-- while node :",node)
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = "/" + parent;
            else
                parent = node.parent.data.key + "/" + parent;
            //console.log("-- while parent :",parent)
            node = node.parent;
        }
        
        if(parent=="_1")
            parent = "";
         //console.log("-- parent :",parent)
        return parent;
    }

    function checkIsParent(node){
        if((node.parent && node.parent.data.key != '_1') ){
            //console.log(node.parent.data.key);
            $scope.temp.push(node.parent.data.key);
            checkIsParent(node.parent);
        }
        else{
            //$scope.temp2.push($scope.temp);
            //console.log($scope.temp2);
        }
    }

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
    //console.log('btnArray', btnArray);
    $scope.btnArrayView= btnArray;

    $scope.timeValue = btnArray[btnArray.length-1].id;
    $scope.fetchData= function(data,index){
        // console.log('data', data);
        // console.log('index',index);
        // console.log('timeValue', $scope.timeValue);
        $scope.timeValue= data;
    }

    $scope.searchData = function(){ 
        //a7f5326b744d984e1ed849d95
        $http.get(globalConfig.pulldataurl + 'ac7b1435440059fe071dd65bd'+ $scope.selectedRate + $scope.selectedSegment +'&time=' + $scope.timeValue).then(function (response) {
            //console.log(response.data);
            //return false;
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

    var rate = [
        {title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }
    ];
    $("#rat").dynatree({
        checkbox: true,
        selectMode: 3,
        children: rate,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
            return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedRate = test;
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
    });

    var segmentData = [
        {title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" }
    ];

    $("#segment").dynatree({
        checkbox: true,
        selectMode: 3,
        children: segmentData,
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            var test = '';
            _.forEach(selKeys, function(value, key){
                test += '&'+value + '=' + value;
            });
            $scope.selectedSegment = test;
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
    });

    $("#device").dynatree({
        checkbox: true,
        selectMode: 3,
        children: '',
        onSelect: function(select, node) {
            // Get a list of all selected nodes, and convert to a key array:
            var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                return node.data.key;
            });
            $scope.selectedNode = selKeys;
            console.log(selKeys);
            //$("#displayText").val(selKeys.join(", "));
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
    });

    $scope.location = function() {
        if ($scope.locationTree)
            $scope.locationTree = false;
        else{
            $scope.locationTree = true;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.rat = function() {
        if ($scope.ratTree)
            $scope.ratTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = true;
            $scope.segmentTree = false;
            $scope.deviceTree = false;
        }
    }

    $scope.segment = function() {
        if ($scope.segmentTree)
            $scope.segmentTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = true;
            $scope.deviceTree = false;
        }
    }

    $scope.device = function() {
        if ($scope.deviceTree)
            $scope.deviceTree = false;
        else{
            $scope.locationTree = false;
            $scope.ratTree = false;
            $scope.segmentTree = false;
            $scope.deviceTree = true;
        }
    }

    $scope.datepickerOptions = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-01-01",
        endDate: "0d"
    };

    // var newdate= $filter('date')( new Date().getTime() , "yyyy-MM-dd");
    // $scope.date= {"start":"","end":""};
});