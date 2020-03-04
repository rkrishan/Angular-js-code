'use strict';

angular.module('specta')
    .controller('reportBuilderViewCtrl', function ($scope, $http, $state, $timeout, $stateParams, globalConfig, UserProfile, httpService, dbService){
    
    if (!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null)
        $state.go('login');

    var query = '{_id: ObjectId("'+$stateParams.id+'")}';
    var params = 'query=' + encodeURIComponent(query);
    var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
    httpService.get(url).then(function(response){
    	console.log(response.data);
        $scope.headerName = response.data[0].name;
        $state.current.data.currentPage = response.data[0].name;
        $scope.report = response.data[0];
    });

    function getData(){
    	httpService.get(globalConfig.pulldatabyRlistener + 'getdata&query='+cuqery).then(function(response){
			if(response.data != 'null' && response.data.length > 0){
				$scope.display = 'table';
				$scope.loader = false;
				var options = {
				    weekday: "long", year: "numeric", month: "short",
				    day: "numeric", hour: "2-digit", minute: "2-digit"
				};
				_.forEach($scope.tableList, function(item, key){
					if(item.type == 'Date'){
						$scope.recordList = _.filter(response.data, function(single){
							if(single[item.key] != undefined){
								if( $scope.recorddate == 'week' )
									single[item.key] = 'Week ' + single[item.key];
								else if( $scope.recorddate == 'month' ){
									var month = {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'};
									single[item.key] = month[single[item.key]];
								}
								else if( $scope.recorddate == undefined || $scope.recorddate != 'year'){
									var tmp = single[item.key];
									var myDate = new Date(tmp.$date);
									single[item.key] = myDate.toLocaleDateString("en-us", options);
								}
							}
							return single;
						});
					}
				});
				$scope.heading = response.data[0];
			}
		});
    }
});