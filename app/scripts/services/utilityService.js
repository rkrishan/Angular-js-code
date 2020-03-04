'use strict';

angular.module('specta')
    .service('utility', function ($filter, $http,$state,globalConfig, dbService, httpService, UserProfile) {

    	//tab indexing
    	var tabDetails= {};
    	this.tb= {
	    	appAnalytics:{
				UsageVsUsers: true,
				OLTorPlanwiseDistribution: true,
				SegmentwiseDistribution: true,
				ApporPlanwiseDistribution: true,
				LatencyDistribution: true,
				CEI: true,
				Throughput: true,
				CountryDistribution: true,
				CityDistribution:true,
				AreaDistribution:true,
				'Cached/Uncached': true
			},
			oltAnalytics:{
				UsageVsUsers: true,
				OLTorPlanwiseDistribution: true,
				SegmentwiseDistribution: true,
				ApporPlanwiseDistribution: true,
				LatencyDistribution: true,
				CEI: true,
				Throughput: true,
				OLTUtilization: true,
				CityDistribution:true,
				AreaDistribution:true
			},
			planAnalytics:{
				UsageVsUsers: true,
				OLTorPlanwiseDistribution: true,
				SegmentwiseDistribution: true,
				CEI: true,
				LatencyDistribution: true,
				ApporPlanwiseDistribution: true,
				Throughput: true,
				CityDistribution:true,
				AreaDistribution:true,
				'Cached/Uncached': true
			},
			dnsAnalytics:{
				Requests: true,
				SuccessFailure: true,
				FailureTrend: true,
				ResolutionTime: true,
				FailureReasons: true
			},
			cdnAnalytics:{
				Usage: true,
				Throughput: true,
				TpBkt: true,
				Area: true,
				Plan: true
			},
			churnAnalytics:{
				Trend: true,
				OLT: true,
				Plan: true,
				City: true,
				Area: true
			},
			appPerformance:{
				OLT: true,
				Area: true,
				Plan: true,
				City: true,
			},
			appTrend:{
				Usage: true,
				visits: true,
				Duration: true,
			},
			nodeReport:{
				UsageDistribution: true,
				SubscriberDistribution: true,
				ThroughputDistribution: true,
			},
			custDetails:{
				Usage: true,
				App: true,
				Throughput: true,
				appThroughput: true,
				CDNThroughput: true,
				TransactionDetails: true,
				TransactionAAADetails: false,
				profile: false,
				'UsageLast30Days': true,
				'usageMonthwise': false
			},
	    }

	    this.tb_central= {
	    	appAnalytics:{
				UsageVsUsers: true,
				OLTorPlanwiseDistribution: false,
				SegmentwiseDistribution: true,
				ApporPlanwiseDistribution: false,
				LatencyDistribution: true,
				CEI: false,
				Throughput: false,
				CountryDistribution: true,
				CityDistribution:true,
				AreaDistribution:true,
				'Cached/Uncached': true
			},
			oltAnalytics:{
				UsageVsUsers: true,
				OLTorPlanwiseDistribution: true,
				SegmentwiseDistribution: true,
				ApporPlanwiseDistribution: true,
				LatencyDistribution: true,
				CEI: true,
				Throughput: true,
				OLTUtilization: true,
				CityDistribution:true,
				AreaDistribution:true
			},
			planAnalytics:{
				UsageVsUsers: true,
				OLTorPlanwiseDistribution: false,
				SegmentwiseDistribution: true,
				CEI: false,
				LatencyDistribution: true,
				ApporPlanwiseDistribution: false,
				Throughput: true,
				CityDistribution:true,
				AreaDistribution:true,
				'Cached/Uncached': true
			},
			dnsAnalytics:{
				Requests: true,
				SuccessFailure: true,
				FailureTrend: true,
				ResolutionTime: false,
				FailureReasons: false
			},
			cdnAnalytics:{
				Usage: true,
				Throughput: true,
				TpBkt: true,
				Area: true,
				Plan: true
			},
			appPerformance:{
				OLT: true,
				Area: true,
				Plan: true,
				City: true,
			},
			appTrend:{
				Usage: true,
				visits: true,
				Duration: true,
			},
			nodeReport:{
				UsageDistribution: true,
				SubscriberDistribution: true,
				ThroughputDistribution: true,
			},
			custDetails:{
				Usage: true,
				App: true,
				Throughput: true,
				appThroughput: true,
				CDNThroughput: true,
				TransactionDetails: true,
				TransactionAAADetails: false,
				profile: false,
				'UsageLast30Days': true,
				'usageMonthwise': false
			},
	    }

	    /*function callback(tabDetails){
		    var url = dbService.makeUrl({collection: 'tab', op:'select'});
	        httpService.get(url).then(function(response){
	            tabDetails= response.data[0];
	        });
	        return tabDetails;
	    }*/
        /*callback(tabDetails, {
		    console.log("tabDetails", tabDetails);
	        if(tabDetails != 'undefined'){
	        	this.tb= tabDetails;
	        	console.log("collection found", tabDetails);
	        }else{
	        	console.log("collection not found");
	        }
	    })*/

	    //Export Data to Excel, CSV
	    this.getSimpleJSONExport= function(exportObj, type,name){
	    	// console.log("component", component);
	    	var header= angular.copy(name);
	    	name= name+"_"+new Date().getTime();
		    var exportArray= [];
	        for(var i in exportObj){
	            var keys= Object.keys(exportObj[i]);
	            var temp= {};
	            for(var j in keys){
	                if( !Array.isArray(exportObj[i][keys[j]])){
	                    if(/Date/.test(keys[j]) || /Time/.test(keys[j])){
	                    	// console.log("exportObj[i][keys[j]]", exportObj[i][keys[j]]);
	                    	temp[keys[j]]= $filter('date')( exportObj[i][keys[j]], 'yyyy-MM-dd', 'UTC');
	                    }
	                    else{
	                        temp[keys[j]]= exportObj[i][keys[j]]
	                    }
	                }
	            }
	            for(var j in keys){
	            	if(Array.isArray(exportObj[i][keys[j]])){
	            		
	                    for(var k in exportObj[i][keys[j]]){
	                        var dataKey= Object.keys(exportObj[i][keys[j]][k]);
	                        for(var l in dataKey){
	                            if(/Date/.test(keys[j]) || /Time/.test(keys[j])|| /date/.test(keys[j])){
	                                temp[dataKey[l]]= $filter('date')( exportObj[i][keys[j]][k][dataKey[l]], "yyyy-MM-dd",'UTC');
	                            }
	                            else{
	                                temp[dataKey[l]]= exportObj[i][keys[j]][k][dataKey[l]];
	                            }
	                        }
	                        exportArray.push(angular.copy(temp))
	                    }
	                }
	            }
	        }
	        if(exportArray.length> 0){
	        	if(type == 'excel')
		            alasql('SELECT * INTO XLS("'+name+'.xls",?) FROM ?',[ {headers:true,caption: {title:[header], style: 'font-size: 100px; color:green;'}},exportArray]);
		            if(type == 'csv')
		            alasql('SELECT * INTO CSV("'+name+'.csv",?) FROM ?',[{headers:true, separator:","},exportArray]);
		    	
	        }else{
	        	for(var i in exportObj){
		            var keys= Object.keys(exportObj[i]);
		            for(var j in keys){
		                if(/Date/.test(keys[j]) || /Time/.test(keys[j])){
		                		exportObj[i][keys[j]]= $filter('date')( exportObj[i][keys[j]], "yyyy-MM-dd",'UTC' );
		                    }
		                    else{
		                        exportObj[i][keys[j]]= exportObj[i][keys[j]]
		                    }
		            }
		        }

		    	if(type == 'excel')
                	alasql('SELECT * INTO XLS("'+name+'.xls",?) FROM ?',[{headers:true,caption: {title:[header], style: 'font-size: 100px; color:green;'}},exportObj]);
            	if(type == 'csv')
                	alasql('SELECT * INTO CSV("'+name+'.csv",?) FROM ?',[{headers:true, separator:","},exportObj]);
	        }
	        
	        //var te=  [{a:1,b:1}, {a:2,b:2}, {a:3,b:3}];
	    }
	    // End JSON Export
	
	    //Get Export Title
		this.getExportTitle= function(pageName, tabName, filter){
	    	var title= pageName +' '+ tabName +' for Date: ' +filter;

	    	return title;
		}

		// DataTable option
		this.dataTableOpt = {
	        "destroy": true,
	        // "aaSorting": [],
	        "paging": true, 
	        "searching": true,
	        "bSort": true,
	        "bLengthChange": true,
	        "bInfo": true,
	        "autoWidth": true,
	        // "scrollX": true,
	        //"columnDefs": [{ width: '10%', targets: [0]}]
	    }

	    // get lku_buckets for ordering and coloring
	    this.get_lku= function(lku_name, callback){
	    	
            var collection;
            switch(lku_name){
            	case 'LatencyBkt':
            		collection = 'lku_firstbytelatency_buckets';
            		break;
            	case 'ResolutionBkt':
            		collection = 'lku_dns_resolution_buckets';
            		break;
            	case 'CEIBkt':
            		collection = 'lku_cei_buckets';
            		break;
            	case 'UsageBkt':
            		collection = 'lku_usage_buckets';
            		break;
            	case 'ThroughputBkt':
            		collection = 'lku_throughput_buckets';
            		break;
            	case 'LastSeenBkt':
            		collection = 'lku_lastseen_buckets';
            		break;
            }

            var url = dbService.makeUrl({collection: collection, op:'select'});
            httpService.get(url+'&db=datadb').success(function(res){
                res = res.sort(function(a, b){
                    return a.rank - b.rank
                })
                console.log("res", res)
                callback(res);
            })
        }

        //map init object
        var onHover = function(marker, eventName, model) {
        	// console.log("utility called");
	        model.show = !model.show;
	    };

        this.get_init_mapObj= function(){
        	
        	var mapObj= {
            	center: {
	                latitude: globalConfig.lat,
	                longitude: globalConfig.lng
	            },
	            options:{
	                scrollwheel: false,
	                // Style for Google Maps
	                styles: [{"stylers":[{"hue":"#18a689"},{"visibility":"on"},{"invert_lightness":true},{"saturation":40},{"lightness":10}]}],
	                // mapTypeId: google.maps.MapTypeId.ROADMAP,
	            },
	            control: {
	                refresh: function(){}
	            },
	            zoom: 12,
	            size:{
	                height: '800px'
	            },
	            events:
	            { 
	                /*click: function(marker, eventName, model)
	                { 
	                    var params= {cellID: model.cellid};
	                    $state.go('index.staticreport',{'params': params, 'file':'cellStatisticsReport.html','id':null, 'name': 'Cell Statistics Report'});
	                },*/
	                mouseover: function(marker, eventName, model)
	                {   
	                    onHover(marker, eventName, model);
	                },
	                mouseout: function(marker, eventName, model)
	                {   
	                    onHover(marker, eventName, model);
	                }
	            },
           	}
           	return mapObj;
        };
        
        //map legend click event
        this.getMapLegendClickData= function (state, indexArray, mapObject){
            if(state== false){
                for(var k=0; k<mapObject.length; k++){
                    var index= indexArray.indexOf(k);
                    if( index != -1){
                        mapObject[k].options.visible= false;
                    }
                }
            }
            else{
                for(var k=0; k<mapObject.length; k++){
                    var index= indexArray.indexOf(k);
                    if( index != -1){
                        mapObject[k].options.visible= true;
                    }
                }
            }
            return mapObject;
        }

        // pass usage with selected unit and retun usage in bytes
        this.getBytes= function(usageValue, unit){
	        var usage;
	        if(usageValue>0){
	            if(unit != "Bytes"){
	                switch(unit){
	                    case 'GB':
	                        usage= Math.pow(2,30)*usageValue;
	                        break;
	                    case 'MB':
	                        usage= Math.pow(2,20)*usageValue;
	                        break;
	                    case 'KB':
	                        usage= Math.pow(2,10)*usageValue;
	                        break;
	                }
	            }else{
	                usage= usageValue;
	            }
	            return usage;
	        }
	    }

	    //track url starts
	    this.trackUrl= function (){
	        // console.log("UserProfile", UserProfile.profileData.firstName +" "+ UserProfile.profileData.lastName);
	        var category= $state.current.data.pageTitle;
	        // var subCategory= $state.current.data.currentPage;
	        // var subCategory= null;
	        var subCategory= UserProfile.profileData.email;
	        // var subCategory= null;
	        var pageID= $state.params.id;
	        // console.log(category,subCategory, pageID);
	        
	        if(pageID != null ){
	        	var trackingURL= globalConfig.dataapitrackurl+"category="+category+"&subcategory="+subCategory+"&requestId="+pageID;
	        	        
    	        httpService.get(trackingURL).success(function (response, status, headers, config){
    	            console.log("navigation post", response);
    	            return response;
    	        })
    	    }
	    }
	    //end track url
	});