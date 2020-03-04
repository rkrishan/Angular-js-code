'use strict';

angular.module('specta')
  .controller('MainCtrl', function ($scope, $state, $timeout, UserProfile, dbService, httpService, currentUser, globalConfig){

    $scope.currentUser = currentUser;
    var categoryIcon   = globalConfig.categoryIcon;
    var analyticsList, reportList, dashdashboardList;


  	function reports(list){
  		if( angular.isUndefined(list) ){
  			$timeout(function(){
  				reportList = UserProfile.getSession('reportList');
  				reports(reportList);
  			}, 1000);
  		}
  		else checkIsData();
  	}

  	function analytics(list){
  		if( angular.isUndefined(list) ){
  			$timeout(function(){
  				analyticsList = UserProfile.getSession('reportList');
  				analytics(analyticsList);
  			}, 1000);
  		}
  		else checkIsData();
  	}

    function dashboard(list){
        if( angular.isUndefined(list) ){
            $timeout(function(){
                dashdashboardList = UserProfile.getSession('dashboardList');
                dashboard(dashdashboardList);
            }, 1000);
        }
        else checkIsData();
    }


  	function dashboard(list){
  		if( angular.isUndefined(list) ){
  			$timeout(function(){
  				dashdashboardList = UserProfile.getSession('dashboardList');
  				dashboard(dashdashboardList);
  			}, 1000);
  		}
  		else favoriteMap();
  	}

  	var useCaseList = []
    var query = JSON.stringify({visibility: true});
    var sort = JSON.stringify({"rank": -1});
    var params = 'query=' + encodeURIComponent(query) +'&sort='+ encodeURIComponent(sort);
  	function loadCategory(){
        var url = dbService.makeUrl({collection: 'category', op:'select'});
        //var url = dbService.makeUrl({collection: 'category', op:'select', params:params});
        httpService.get(url).success(function(res){
            if(res.length > 0){
                useCaseList = res;
                checkIsData();
            }
        });
    }
    loadCategory();

    
    function checkIsData(){
    	reportList = UserProfile.getSession('reportList');
  		analyticsList = UserProfile.getSession('analyticsList');
      dashdashboardList = UserProfile.getSession('dashboardList');
      
  		if(!reportList) reports(reportList);
  		else if(!analyticsList) analytics(analyticsList);
        else if(!dashdashboardList) dashboard(dashdashboardList);
    	else if(useCaseList.length > 0) useCaseMap();

    }

    var catId = -1;
  	function useCaseMap(){
  		var categoryList = {1: [], 2: [], 3: [], 4: []};
  		
		for(var i in useCaseList){
			var obj = useCaseList[i];
			obj.list = [];

            //for dashaboard 
    
            var dashboardArr = _.filter(dashdashboardList, function(item){
                  return item.useCase == obj._id
            });
          
            if( dashboardArr.length > 0){
                  for(var k in dashboardArr){
                    dashboardArr[k].pageType = 'dashboard';
                    obj.list.push(dashboardArr[k]);
                  }
            }

			//for Report
			var reportArr = _.filter(reportList, function(item){
				return item.useCase == obj._id
			});

			if( reportArr.length > 0){
				for(var k in reportArr){
					reportArr[k].pageType = 'report';
					obj.list.push(reportArr[k]);
				}
			}

			//for analytics
			var itemArr = _.filter(analyticsList, function(item){
				return item.useCase == obj._id
			});


			if( itemArr.length > 0){
				for(var k in itemArr){
					itemArr[k].pageType = 'analytics';
					obj.list.push(itemArr[k]);
				}
			}

     

			if(obj.list.length > 0){
                catId++;
                if(!categoryIcon[catId]) catId = 0;
                obj.icon = categoryIcon[catId];

				if(categoryList[1].length < 4) categoryList[1].push(obj);
				else if(categoryList[2].length < 4) categoryList[2].push(obj);
				else if(categoryList[3].length < 4) categoryList[3].push(obj);
				else if(categoryList[4].length < 4) categoryList[4].push(obj);
			}

			if(i == useCaseList.length -1){
				console.log(categoryList);
				$scope.categoryList = categoryList;
        console.log("$scope.categoryList",$scope.categoryList);

			}
		}
  	}

  	//Favorite Page
  	var favoriteList = [];
  	function favoritePage(){
  		var query = JSON.stringify({"userId": currentUser.userId});
  		var params = 'query='+encodeURIComponent(query)
  		var url = dbService.makeUrl({collection: 'favorite', op:'select', params: params});
        httpService.get(url).success(function(res){
        	favoriteList = res;
        	favoriteMap();
        });
    }
    favoritePage();

    $scope.favoriteList = [];
    function favoriteMap(){
    	dashdashboardList = UserProfile.getSession('dashboardList');
    	if(!dashdashboardList) dashboard(dashdashboardList);
    	else{
	    	for(var i in favoriteList){
	    		var res = favoriteList[i];
	    		if(res.page == 'dashboards'){
	    			filterPage(dashdashboardList, res.pageId, 'dashboards', function(item){
	    				if(item) {
	    					item.pageType = 'dashboards';
	    					$scope.favoriteList.push(item);
	    				}
	    			});
	    		}

	    		if(res.page == 'report'){
	    			filterPage(reportList, res.pageId, 'report', function(item){
	    				if(item) {
	    					item.pageType = 'report';
	    					$scope.favoriteList.push(item);
	    				}
	    			});
	    		}
	    	}
	    }
    }

    function filterPage(list, pageId, page, cb){
    	var dash = _.filter(list, function(item){
			return item._id == pageId
		})[0];
		cb(dash);
    }
});
