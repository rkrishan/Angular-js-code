'use strict';

angular.module('specta')
  .controller('DashboardDetailCtrl', function ($scope, $stateParams, $rootScope, $timeout, $location, $http, globalConfig, $state, SweetAlert, ChartService, UserProfile, dbService, httpService){

    if(!angular.isDefined(UserProfile.profileData.userId) || UserProfile.profileData.userId == null)
        $state.go('login');

    ChartService.setCurrentPage(null);
    $scope.apiURL = globalConfig.dataapiurl;
    $scope.userProfile = UserProfile.profileData;
    $scope.dashboardList = [];

    $scope.loadList = function(){
        var query = JSON.stringify({ 'dashboardId': $stateParams.id });
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'pages', op:'select', params: params});
        var temp = [];
        httpService.get(url).then(function (response){
            $scope.dashboard = response.data[0];
            _.forEach($scope.dashboard.components, function(value, key){
                temp.push(value.component);
            });
            $scope.dashboardList = temp;
        });
    }
    $scope.loadList();

    $scope.remove = function (index, item) {
        SweetAlert.swal({
            title: "Delete " + item.title,
            text: "Are you sure you want to remove this component?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function (isConfirm){
            if(isConfirm){
                var tmpArr = angular.copy($scope.dashboardList);
                tmpArr.splice(index, 1);
                $scope.dashboardList = [];
                $scope.dashboardList = tmpArr;
                
                var selected = $scope.dashboard;
                selected.components.splice(index, 1);

                var request = JSON.stringify(selected);
                var tmp = JSON.parse(request);
                delete tmp["_id"];

                var url = dbService.makeUrl({collection: 'pages', op:'upsert', id: $scope.dashboard._id});
                httpService.post(url, tmp).then(function (result){
                    $scope.loadList();
                });

                /*$http.put($scope.apiURL + '/pages/' + $scope.dashboard._id, tmp).then(function (updateResponse) {
                    $scope.loadList();
                });*/
            }
        });
    }

    $scope.moduleType = {
        'simple_ibox': 'Simple iBox',
        'simple_ibox_with_dual_data_point' : 'Simple iBox with Dual Data',
        'simple_ibox_with_trend': 'Simple iBox with Trend',
        'ibox_with_multiple_tabs' : 'iBox with Multiple Tabs',
        'ibox_with_embeded_chart': 'iBox with Chart',
        'simple_charts': 'Simple Chart',
        'simple_table': 'Simple Table',
        'table_with_search' : 'Searchable Table'
    };

    $scope.list = function(){
        $state.go('index.dashboardlist');
    }
});