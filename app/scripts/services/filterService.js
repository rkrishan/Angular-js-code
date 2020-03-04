'use strict';

angular.module('specta')
    .service('filterService',function (locationFilterService, $http, globalConfig) {
    
    var selKeysLocation= [], selKeysRAT= [],  selKeysDevice= [], selKeysSegment= [], queryParam;
    
    function chkEntry(values,name){
        for(var i=0;i<values.length;i++){
            if(values[i]==name) return true;
        }
        return false;
    }
    
    var getParents= function(node){
        var parent="";
        while(node.parent){
            if(parent=="")
                parent = node.parent.data.key;
            else if(node.parent.data.key=="_1")
                parent = parent;
            else
                parent = node.parent.data.key +"'"+ "." +"'"+ parent;
                // parent = node.parent.data.key + "." + parent;
            node = node.parent;
        }
	//if(parent=="_1")
	//parent = "";
        return parent;
    }
    
    function getParentsTitle(node){
        var parent="";
        while(node.parent){
            var ttl = (node.parent.data.title)? node.parent.data.title : '';
            if(parent == ""){
                if(ttl != 'India' && ttl != '')
                    parent = ttl;
            }
            else{
                if(ttl != 'India' && ttl != '')
                    parent = ttl + "." + parent;
            }
            node = node.parent;
        }
        parent = (parent) ? parent+'.' : '';
        //console.log("-- while parent :", parent);
        return parent;
    }

    var getFilterData= function(selectedKey){
        var keyArrayParent= [];
        var titleArrayParent= [];
        var keyArrayResult= [];
        var ttlArrayResult= [];
        var parentsParent= {};
        
        angular.forEach(selectedKey,function(node){
            var thisNode= node.data;
            var nodeKey= node.data.key;
            var nodeTitle= node.data.title;
            var thisParent = node.parent;
            var parentKey =thisParent.data.key;
            if(thisNode.isFolder){
                if(!chkEntry(keyArrayParent,parentKey)){
                    keyArrayParent.push(nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1'){
                        //keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                        keyArrayResult.push( "'"+getParents(node)+"'"+"."+"'"+nodeKey+"'" );
                        ttlArrayResult.push( getParentsTitle(node) + nodeTitle );
                    }
                    else{
                        //keyArrayResult.push("/^." + nodeKey + "/");
                        keyArrayResult.push( "'"+nodeKey+"'" );
                        ttlArrayResult.push( nodeTitle );
                    }
                }else
                    keyArrayParent.push(nodeKey);
            }else{
                if(!chkEntry(keyArrayParent,parentKey)){
                    //keyArrayResult.push(getParents(node)+"."+nodeKey);
                    var getParentRes = getParents(node);
                    if(getParentRes != '_1'){
                        //keyArrayResult.push("/^." + getParents(node)+"."+nodeKey + "/");
                        // keyArrayResult.push( "'"+getParents(node)+"'"+"."+"'"+nodeKey+"'");
                        keyArrayResult.push( "'"+'BHUTAN'+"'"+"."+"'"+getParents(node)+"'"+"."+"'"+nodeKey+"'");
                        ttlArrayResult.push( getParentsTitle(node) + nodeTitle );
                    }
                    else{
                        //keyArrayResult.push("/^." + nodeKey + "/");
                        keyArrayResult.push("'"+nodeKey+"'");
                        ttlArrayResult.push(nodeTitle);
                    }
                }
            }

        })
        console.log("keyArrayResult: ",keyArrayResult)
        return [keyArrayResult,ttlArrayResult];
    }
    
    this.getFilterData= function(selectedKey){
        return getFilterData(selectedKey);
    }

    var segmentData = [
        /*{title: "VIP", key: "VIP" },
        {title: "Platinum", key: "Platinum" },
        {title: "Gold", key: "Gold" },
        {title: "Youth", key: "Youth" },
        {title: "General", key: "General" },
        {title: "Corporate", key: "Corporate" },
        {title: "Prepaid", key: "Prepaid" },
        {title: "Postpid", key: "Postpid" },*/
        {"_id":"58d107e459d3dea303099cd5","title":"General","key":"General"},
        {"_id":"5a0a79026e0752166c21794e","title":"NA","key":"NA"}
    ];
    
    var ratData = [
        /*{title: "2G", key: "GERAN" },
        {title: "3G", key: "UTRAN" },
        {title: "4G", key: "LTE" }*/
        {"_id":"58d107c559d3dea303099cd3","title":"GERAN","key":"GERAN"},
        {"_id":"58d107c559d3dea303099cd4","title":"UTRAN","key":"UTRAN"},
        {"_id":"58d10c1afd3bd642df4c6c1d","title":"NA","key":"NA"}
    ];
    
    this.getSegments= function(){
        return segmentData;
    }
    
    /*
    *   Location Filter data
    */
    this.getLocations= function(){
   
        var locationData;
        //$http.get(globalConfig.pulldataurlbyname +'Location Lookup').then(function (response) {
        //locationData= response.data[0].children;
        
        var filterData= locationFilterService.locationFilterData();
        //console.log(filterData);
        locationData= filterData.children;
        $("#location").dynatree({
            checkbox: true,
            selectMode: 3,
            children: locationData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                
                // Get a list of all selected nodes, and convert to a key array:
                selKeysLocation = $.map(node.tree.getSelectedNodes(), function(node){
                    return node;
                });
                selKeysLocation= getFilterData(selKeysLocation);
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
        })
        return selKeysLocation;
        //})
    }

    /*
    *   RAT Filter data
    */
    this.getRATs= function(){
   
        $("#rat").dynatree({
            checkbox: true,
            selectMode: 3,
            children: ratData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysRAT = $.map(node.tree.getSelectedNodes(), function(node){
                    return node.data.key;
                });
                console.log("rat: ",selKeysRAT);
            // selKeysRAT= getFilterData(selKeysRAT);
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
        return selKeysRAT;
    }

    /*
    *   Segment Filter data
    */
    this.getSegmentsFilter= function(){
   
        //var indx= -1,temp= [];
        $("#segment").dynatree({
            checkbox: true,
            selectMode: 3,
            children: segmentData,
            onSelect: function(select, node) {
                // Display list of selected nodes
                var selNodes = node.tree.getSelectedNodes();
                // Get a list of all selected nodes, and convert to a key array:
                selKeysSegment = $.map(node.tree.getSelectedNodes(), function(node){
                    return node.data.key;
                })
                console.log("segment: ",selKeysSegment)
            //selKeysSegment= getFilterData(selKeysSegment);
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
        return selKeysSegment;
    }

    /*
    *   Device Filter data
    */
    this.getDevices= function(responseData, selKeysDevice){
   
        var deviceData= [];
        //$http.get(globalConfig.pulldataurlbyname+'Device Filter till Company').then(function (response) {
            deviceData= responseData;
            //console.log("data: ", deviceData)
            $("#device").dynatree({
                checkbox: true,
                selectMode: 3,
                children: deviceData,
                onSelect: function(select, node) {
                    // Display list of selected nodes
                    var selNodes = node.tree.getSelectedNodes();
                    // Get a list of all selected nodes, and convert to a key array:
                    selKeysDevice = $.map(node.tree.getSelectedNodes(), function(node){
                        return node;
                    });
                    selKeysDevice= getFilterData(selKeysDevice);
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
           
        //})
    }

    this.getParameter= function (selKeysLocation, selKeysRAT, selKeysSegment, selKeysDevice){
        var queryParam= ''
        if(selKeysLocation!='' && selKeysLocation!= undefined){
            //adding quotes to id(name)
            // console.log("selKeysLocation", selKeysLocation);
            /*for(var i=0;i<selKeysLocation.length;i++){
                // console.log("selKeysLocation[i][1]", selKeysLocation[i][1]);
                if(selKeysLocation[i][1] != "'BHUTAN'."){
                    // selKeysLocation[i]= "'INDIA'."+selKeysLocation[i]
                    selKeysLocation[i]= "'BHUTAN'."+selKeysLocation[i]
                }
            }*/
            queryParam= "&location=["+selKeysLocation+"]";
        }
        if(selKeysRAT!= '' && selKeysRAT!= undefined){
            for(var i=0;i<selKeysRAT.length;i++){
                if(selKeysRAT[i][0] != "'")
                    selKeysRAT[i]= "'"+selKeysRAT[i]+"'"
            }
            console.log("selKeysRAT", selKeysRAT);
            queryParam= queryParam+"&rat=["+selKeysRAT+"]";
        }
        if(selKeysSegment!= '' && selKeysSegment!= undefined){
            for(var i=0;i<selKeysSegment.length;i++){
                if(selKeysSegment[i][0] != "'")
                    selKeysSegment[i]= "'"+selKeysSegment[i]+"'"
            }
            queryParam= queryParam+"&segment=["+selKeysSegment+"]";
        }
        if(selKeysDevice!= '' && selKeysDevice!= undefined){
            //adding quotes to id(name)
            /*for(var i=0;i<selKeysDevice.length;i++){
                if(selKeysDevice[i][0] != "'"){
                    selKeysDevice[i]= "'"+selKeysDevice[i]+"'"
                }
            }*/
            queryParam= queryParam+"&device=["+selKeysDevice+"]";
        }
         
        console.log('queryParam',queryParam);
        return queryParam
    }
    
    this.getLocationInfo= function (selKeys){
        var x="";
        if(selKeys!='' && selKeys!=undefined){
            for(var i=0;i<selKeys.length;i++){
                if(selKeys[i].length>9){
                    x= x + selKeys[i]//.substr(9,selKeys[i].length-10);  
                }else{
                    x= x + selKeys[i]//.substr(3,selKeys[i].length-4);
                }
                if(i != selKeys.length - 1)
                    x= x + ", ";
            }   
            return x;
        }
        return "All Locations";
    }
    
    this.getRATInfo= function (selKeys){
        var x="";
        if(selKeys!=''&& selKeys!=undefined){
            for(var i=0;i<selKeys.length;i++){
                x= x + selKeys[i].replace(/'/g,"");
                if(i != selKeys.length - 1)
                    x= x + ", ";
            }
            return x;
        }
        return "All RATs";
    }
    
    this.getSegmentInfo= function (selKeys){
        var x="";
        if(selKeys!=''&& selKeys!=undefined){
            for(var i=0;i<selKeys.length;i++){
                x= x + selKeys[i].replace(/'/g,'');
                if(i != selKeys.length - 1)
                    x= x + ", ";
            }
            return x;
        }
        return "All Segments";
    }
    
    this.getDeviceInfo= function (selKeys){
        var x="";
        if(selKeys!='' && selKeys!=undefined){
            for(var i=0;i<selKeys.length;i++){
                x= x + selKeys[i]//.substr(3,selKeys[i].length-4);
                if(i != selKeys.length - 1)
                    x= x + ", ";
            }
            return x;
        }
        return "All Devices";
    }
       
    this.dateRangeService = {
        clearBtn:true,
        autoclose: true,
        assumeNearbyYear: true,
        format: "yyyy-mm-dd",
        startDate: "2016-6-3",
        endDate: "0d"
    }
    
    
});