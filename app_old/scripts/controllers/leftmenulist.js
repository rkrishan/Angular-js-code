
'use strict';

angular.module('specta')
  .controller('LeftMenuListCtrl', function ($scope, $rootScope, $stateParams, $window, $location, $http, globalConfig, $interval, $timeout, $state, SweetAlert, ChartService, UserProfile, dbService, httpService, socket, notify, utility){
    $scope.userProfile = UserProfile.profileData;
    $scope.currentPage = '';

    var color = globalConfig.alertColorPalette;
    console.log("globalConfig site", globalConfig.site);
    if(globalConfig.site=='central' || globalConfig.site=='Central')
        $scope.central= true;
    else
        $scope.central= false;

    $scope.checkStatus = function(priority){    
        priority = priority.toLowerCase()
        // console.log('priority', priority);
        return {color: color[priority]}
    }
    function loadAlert(){
        $scope.alertList = [];
        var query = JSON.stringify({'status': 'NEW'});
        var sort = JSON.stringify({"createtime": -1});
        var filter = 'query='+encodeURIComponent(query) + '&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'system_alerts', op:'select', params: filter});
        httpService.get(url+'&db=datadb').success(function(res){
            $scope.alertList = res;
        });
    }
    if(['system administrator', 'circle admin'].indexOf($scope.userProfile.userType) > -1)
        loadAlert();

    /*$interval(function(){
        loadAlert()
    }, 60*1000)*/

    $rootScope.$on('refreshAlert', function(){
        // console.log('refreshAlert');
        loadAlert();
    });

    $scope.alertACK = function(index, item){
        var data = angular.copy(item);
        var url = dbService.makeUrl({collection: 'system_alerts', op:'update', id: item._id});
        /*var obj = {
            status: 'ACKNOWLEDGED',
            ackTime : new Date(),
            ackUser : $scope.userProfile.userId,
            ackBy : $scope.userProfile.firstName
        }*/
        data.status = 'ACKNOWLEDGED';
        data.ackTime = new Date()
        data.ackUser = $scope.userProfile.userId;
        data.ackBy = $scope.userProfile.firstName;
        delete data._id;
        httpService.post(url+'&db=datadb', data).success(function(res){
            if(res == 'Success'){
                var index = $scope.alertList.indexOf(item);
                var tmp = angular.copy($scope.alertList);
                tmp.splice(index, 1);
                $scope.alertList = [];
                $timeout(function(){
                    $scope.alertList = tmp;
                }, 10);
            }
        })
        .error(function(err){
            swal('', err, 'error');
        });
    }

    socket.subscribe('bcf7df7ce9fda456Eabcdef0275303796', function(res){
        var res = jQuery.parseJSON( res )['bcf7df7ce9fda456Eabcdef0275303796'];
        // console.log(res);

        if($scope.userProfile.userType == 'system administrator' || res.userId.indexOf($scope.userProfile.email) > -1){
            var item = res.content
            item.lastrunningtime = new Date()
            $scope.$apply(function(){
                $scope.alertList.push(item);
            });
        }
    });

    socket.subscribe('abc7df7ce9fda456Eabcdef0123456701', function(res){
        var res = jQuery.parseJSON( res )['abc7df7ce9fda456Eabcdef0123456701'];
        // console.log('subscribe notification', res);
        // console.log(res.user , $scope.userProfile.email, res.user == $scope.userProfile.email)
        if(res.user == $scope.userProfile.email){
            notification(res['content']);
        }
    })

    $scope.noteArr = [];
    $scope.$on('refreshNotification', function (event, res){
        console.log('refreshNotification', res)
        $scope.noteArr.push({id: $scope.noteArr.length, title: res.msg, url: res.url});
    });

    // $scope.noteArr.push({id: 0, title: 'tset test test  set', url: 'res.url', time: new Date()});
    // $scope.noteArr.push({id: 1, title: 'tset test test  set', url: 'res.url', time: new Date()});

    $scope.removeAlert = function(index, item){
        var index = $scope.noteArr.indexOf(item);
        $scope.noteArr.splice(index, 1);
    }

    function notification(res){
        // console.log('notification', res, globalConfig.downloadListener+res.trxid);
        // Receive Data :: {"abc7df7ce9fda456Eabcdef0123456701": {"type": "filedownloadcomplete", "user": "shankar.thakur@pinnacledigital.in", "content": {"msg": "your file shankar.thakur__1501847146363.csv.zip is ready for download, http://10.0.0.11:8080/DataAPI/DownloadListener?transId=TX1501847146363'>Click> to download"} }}
        // notify({ message: res.msg, classes: 'alert-success', templateUrl:'views/common/notify.html'} );
        // $scope.$broadcast('refreshNotification', {msg: res.msg});
        $scope.$apply(function(){
            var subtitle = res.filename;
            $scope.noteArr.push({id: $scope.noteArr.length, title: res.reportname, subtitle: subtitle, url: globalConfig.downloadListener+res.trxid, time: new Date()});
        });
    }

    /*$interval(function(){
        notification();
    }, 3000);*/

    $scope.change_password = function(){
        $state.go('index.user', {id: $scope.userProfile.userId});
    }

    $('.report').slimScroll({
        position: 'right',
        height: '50%',
        size: '5px',
        color: 'grey',
        railVisible: true,
        alwaysVisible: true
    });

    //Dashboard listing for menu
    $scope.loadList = function(){
        var dash = UserProfile.getSession('dashboardList');
        if( angular.isDefined(dash) ){
            // console.log('dash', dash.length);
            $scope.allDashboardList = dash;
        }
        else dashboardList();
    }
    $scope.loadList();

    function dashboardList(){
        var staticDynamicDash = [];
        $scope.dashboardList = [];
        $scope.allDashboardList = [];
        if($scope.userProfile.userType == 'user' || $scope.userProfile.userType == 'circle user'|| $scope.userProfile.userType == 'corporate user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var sort = JSON.stringify({"serialno": 1});
            var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.allDashboardList = response.data;
                _.forEach(response.data, function (item, key) {
                    if(item.type == 'dynamic')
                        $scope.dashboardList.push(item);

                    staticDynamicDash.push(item);
                });
                UserProfile.setSession('dashboardList', $scope.allDashboardList);
                UserProfile.setSession('staticDynamicDash', staticDynamicDash);
            });

            //get assigned group dashboard list
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'groupUsers', op:'select', params: params});
            httpService.get(url).then(function(response){
                checkGroup(response.data)
                _.forEach(response.data, function(item, key){
                    var subQuery = JSON.stringify({ 'groupId': item.groupId});
                    var params = 'query=' + encodeURIComponent(subQuery);
                    var url = dbService.makeUrl({collection: 'groupDashboard', op:'select', params: params});
                    httpService.get(url).then(function(res){
                        _.forEach(res.data, function (val, index) {
                            var where = '{_id: ObjectId("'+val.dashId+'")}';
                            var params = 'query=' + encodeURIComponent(where);
                            var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
                            httpService.get(url).then(function(record){
                                _.forEach(record.data, function(item, index){
                                    var tmp = _.filter($scope.dashboardList, function(menu){
                                        return menu._id == item._id;
                                    });
                                    if(tmp.length == 0){
                                        if(item.type == "dynamic") $scope.dashboardList.push(item);

                                        staticDynamicDash.push(item);
                                    }
                                });
                                $scope.allDashboardList = $scope.dashboardList.sort(function(a, b) {
                                    return parseInt( a.serialno ) - parseInt( b.serialno );
                                });
                                UserProfile.setSession('dashboardList', $scope.allDashboardList);
                                UserProfile.setSession('staticDynamicDash', staticDynamicDash);
                            });
                        });
                    });
                });
            });

            //get assigned to users dashboard list
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'userDashboard', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (val, index) {
                    var where = '{_id: ObjectId("'+val.dashId+'")}';
                    var params = 'query=' + encodeURIComponent(where);
                    var url = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
                    httpService.get(url).then(function(record){
                        _.forEach(record.data, function(item, index){
                            var tmp = _.filter($scope.dashboardList, function(menu){
                                return menu._id == item._id;
                            });
                            if(tmp.length == 0){
                                if(item.type == "dynamic") $scope.dashboardList.push(item);
                                staticDynamicDash.push(item);
                            }
                        });
                        $scope.allDashboardList = $scope.dashboardList.sort(function(a, b) {
                            return parseInt( a.serialno ) - parseInt( b.serialno );
                        });
                        UserProfile.setSession('dashboardList', $scope.allDashboardList);
                        UserProfile.setSession('staticDynamicDash', staticDynamicDash);
                    });
                });
            });
        }
        else{
            var fields = JSON.stringify(["name", "type", "description", "userId", "serialno","useCase"]);
            
            var sort   = JSON.stringify({"serialno": 1});
            var params = 'fields='+encodeURIComponent(fields) +'&sort='+ encodeURIComponent(sort);
            var url    = dbService.makeUrl({collection: 'dashboards', op:'select', params: params});
            httpService.get(url).then(function(res){
                var tmp = res.data.sort(function(a, b) {
                    return parseInt( a.serialno ) - parseInt( b.serialno );
                });
                _.forEach(tmp, function (item, key) {
                    if(item.type == 'dynamic') $scope.dashboardList.push(item);
                    staticDynamicDash.push(item);

                    if(key == tmp.length - 1){
                        $scope.allDashboardList = $scope.dashboardList;
                        UserProfile.setSession('dashboardList', $scope.allDashboardList);
                        UserProfile.setSession('staticDynamicDash', staticDynamicDash);
                    }
                });
            });

            UserProfile.profileData.export = true
            UserProfile.save(UserProfile.profileData)
        }
    }

    $scope.$on('refreshDashboard', function(){
        dashboardList();
    });

    //Report listing for menu
    $scope.loadReports = function(){
        var report = UserProfile.getSession('reportList');
        if( angular.isDefined(report) ){
            // console.log('report', report.length);
            $scope.menuReportsList = report;
        }
        else reportList();
    }
    $scope.loadReports();

    function reportList(){
        $scope.menuReportsList = [];
        $scope.reportsList = [];
        if($scope.userProfile.userType == 'user' || $scope.userProfile.userType == 'corporate user' || $scope.userProfile.userType == 'circle user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var sort = JSON.stringify({"serialno": 1});
            
            var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.menuReportsList = response.data;
                _.forEach(response.data, function (item, key) {
                    $scope.reportsList.push(item);
                });
                UserProfile.setSession('reportList', $scope.menuReportsList);
            });

            //get assigned group Report list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'groupUsers', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function(item, key){
                    var subQuery = JSON.stringify({ 'groupId': item.groupId});
                    var params = 'query=' + encodeURIComponent(subQuery);
                    var url = dbService.makeUrl({collection: 'groupReport', op:'select', params: params});
                    httpService.get(url).then(function(res){
                        _.forEach(res.data, function(val, index){
                            var where = '{_id: ObjectId("'+val.reportId+'")}';
                            var params = 'query=' + encodeURIComponent(where);
                            var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
                            httpService.get(url).then(function(record){
                                _.forEach(record.data, function(item, index){
                                    var tmp = _.filter($scope.reportsList, function(menu){
                                        return menu._id == item._id;
                                    });
                                    if(tmp.length == 0) $scope.reportsList.push(item);
                                });
                                $scope.menuReportsList = $scope.reportsList.sort(function(a, b) {
                                    return parseInt( a.serialno ) - parseInt( b.serialno );
                                });
                                UserProfile.setSession('reportList', $scope.menuReportsList);
                            });
                        });
                    });
                });
            });

            //get assigned to users report list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'userReport', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (val, index) {
                    var where = '{_id: ObjectId("'+val.reportId+'")}';
                    var params = 'query=' + encodeURIComponent(where);
                    var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
                    httpService.get(url).then(function(record){
                        _.forEach(record.data, function(item, index){
                            var tmp = _.filter($scope.reportsList, function(menu){
                                return menu._id == item._id;
                            });
                            if(tmp.length == 0) $scope.reportsList.push(item);
                        });
                        $scope.menuReportsList = $scope.reportsList.sort(function(a, b) {
                            return parseInt( a.serialno ) - parseInt( b.serialno );
                        });
                        UserProfile.setSession('reportList', $scope.menuReportsList);
                    });
                });
            });
        }
        else{
            var sort = JSON.stringify({"serialno": 1});
            var params = 'sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'report', op:'select', params: params});
            httpService.get(url).then(function(response){
                var tmp = response.data.sort(function(a, b){
                    return parseInt( a.serialno ) - parseInt( b.serialno );
                });
                $scope.menuReportsList = tmp;
                UserProfile.setSession('reportList', $scope.menuReportsList);
            });
        }
    }
    $scope.$on('refreshReport', function () {
        reportList();
    });

    //Analysis listing for menu
    $scope.loadAnalysis = function(){
        var analytics = UserProfile.getSession('analyticsList');
        // this need to be remove after calling from
        // analytics.push({
        //     _id:"574433858de908f77db570c1",
        //     userId:"57249c8802ec329a0c50958f",
        //     name:"Churn Monitoring",
        //     description:"Bill Plan Utilization........shifted to plan analytics tab",
        //     type:"static",
        //     serialno:12,
        //     file:"planAnalyticsBB.html",
        //     filter:[],
        //     useCase:"594b70dac0c73252204aabf"
        //    });

        //    console.log(analytics)



        if( angular.isDefined(analytics) ){
            // console.log('analytics', analytics.length);
            $scope.menuAnalysisList = analytics;
        }
        else analyticsList();
    }
    $scope.loadAnalysis();

    function analyticsList(){
        $scope.analysisList = [];
        if($scope.userProfile.userType == 'user' || $scope.userProfile.userType == 'corporate user' || $scope.userProfile.userType == 'circle user'){
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId });
            var sort = JSON.stringify({"serialno": 1});
            var params = 'query=' + encodeURIComponent(query)+'&sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
            httpService.get(url).then(function(response){
                $scope.menuAnalysisList = response.data;
                _.forEach(response.data, function(item, key){
                    $scope.analysisList.push(item);
                });
                UserProfile.setSession('analyticsList', $scope.menuAnalysisList);
            });
        
            //get assigned group dashboard list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'groupUsers', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (item, key) {
                    var subQuery = JSON.stringify({ 'groupId': item.groupId});
                    var params = 'query=' + encodeURIComponent(subQuery);
                    var url = dbService.makeUrl({collection: 'groupAnalysis', op:'select', params: params});
                    httpService.get(url).then(function(res){
                        _.forEach(res.data, function (val, index) {
                            var where = '{_id: ObjectId("'+val.analysisId+'")}';
                            var params = 'query=' + encodeURIComponent(where);
                            var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
                            httpService.get(url).then(function(record){
                                _.forEach(record.data, function(item, index){
                                    var tmp = _.filter($scope.analysisList, function(menu){
                                        return menu._id == item._id;
                                    });
                                    if(tmp.length == 0) $scope.analysisList.push(item);
                                });

                                $scope.menuAnalysisList = $scope.analysisList.sort(function(a, b) {
                                    return parseInt( a.serialno ) - parseInt( b.serialno );
                                });
                                UserProfile.setSession('analyticsList', $scope.menuAnalysisList);
                            });
                        });
                    });
                });
            });

            //get assigned to users Analysis list
            var query = JSON.stringify({ 'userId': $scope.userProfile.userId});
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'userAnalysis', op:'select', params: params});
            httpService.get(url).then(function(response){
                _.forEach(response.data, function (val, index) {
                    var where = '{_id: ObjectId("'+val.analysisId+'")}';
                    var params = 'query=' + encodeURIComponent(where);
                    var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
                    httpService.get(url).then(function(record){
                        _.forEach(record.data, function(item, index){
                            var tmp = _.filter($scope.analysisList, function(menu){
                                return menu._id == item._id;
                            });
                            if(tmp.length == 0) $scope.analysisList.push(item);
                        });

                        $scope.menuAnalysisList = $scope.analysisList.sort(function(a, b) {
                            return parseInt( a.serialno ) - parseInt( b.serialno );
                        });
                        UserProfile.setSession('analyticsList', $scope.menuAnalysisList);
                    });
                });
            });
        }
        else{
            var sort = JSON.stringify({"serialno": 1});
            var params = 'sort='+ encodeURIComponent(sort);
            var url = dbService.makeUrl({collection: 'analysis', op:'select', params: params});
            httpService.get(url).then(function(response){
                var tmp = response.data.sort(function(a, b) {
                    return parseInt( a.serialno ) - parseInt( b.serialno );
                });
                $scope.menuAnalysisList = tmp;
                UserProfile.setSession('analyticsList', $scope.menuAnalysisList);
            });
        }
    }

    $scope.$on('refreshAnalysis', function(){
        analyticsList();
    });

    //Staging listing for menu
    $scope.loadStaging = function(){
        var staging = UserProfile.getSession('stagingList');
        if( angular.isDefined(staging) ){
            // console.log('staging', staging.length);
            $scope.stagingList = staging;
        }
        else stagingList();
    }
    // console.log($scope.userProfile.userType)
    if($scope.userProfile.userType != 'user' || $scope.userProfile.userType == 'corporate user'){
        $scope.loadStaging();
    }

    function stagingList(){
        $scope.stagingList = [];
        if($scope.userProfile.userType != 'user' || $scope.userProfile.userType == 'corporate user' || $scope.userProfile.userType != 'circle user'){
            $scope.stagingList = [];
            var url = dbService.makeUrl({collection: 'staging', op:'select'});
            httpService.get(url).success(function(res){
                if($scope.userProfile.userType == 'system administrator')
                    $scope.stagingList = res
                else{
                    $scope.stagingList = _.filter(res, function(item){
                        return item.userId != '57249c8802ec329a0c50958f'
                    })
                }
                UserProfile.setSession('stagingList', $scope.stagingList);
            })
        }
    }

    $scope.$on('refreshStaging', function () {
        stagingList();
    });

    //Custom Report
    $scope.customReport = function(){
        var customReport = UserProfile.getSession('customReportList');
        if( angular.isDefined(customReport) ){
            // console.log('customReport', customReport.length);
            $scope.customReportList = customReport;
        }
        else customeReportList();
    }
    if($scope.userProfile.userType != 'user' || $scope.userProfile.userType == 'corporate user')
        $scope.customReport();

    function customeReportList(){
        $scope.customReportList = [];
        var field = JSON.stringify(['name']);
        var params = 'field=' + encodeURIComponent(field);
        var url = dbService.makeUrl({collection: 'customreport', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.customReportList = response.data;
            UserProfile.setSession('customReportList', $scope.customReportList);
        });
    }

    $scope.$on('refreshCustomReport', function () {
        customeReportList();
    });


    function checkGroup(grpUsers){
        if(UserProfile.userType == 'admin'){
            UserProfile.profileData.export = true
            UserProfile.save(UserProfile.profileData)
        }

        for(var i in grpUsers){
            var where = '{_id: ObjectId("'+grpUsers[i].groupId+'")}'
            var params = 'query=' + encodeURIComponent(where)
            var url = dbService.makeUrl({collection: 'groupName', op:'select', params: params})
            httpService.get(url).success(function(res){
                if(res.length > 0){
                    console.log(res[0]);
                    utility.tb.custDetails.TransactionDetails = res[0].transactionDetail;
                    if(res[0].export){
                        UserProfile.profileData.export = true
                        UserProfile.save(UserProfile.profileData)
                        return
                    }
                    else if(UserProfile.userType == 'admin'){
                        UserProfile.profileData.export = false
                        UserProfile.save(UserProfile.profileData)
                    }
                    
                }
            })
        }
    }

    /*
        $scope.loadChartList = function () {
            $http.get($scope.apiURL + '/charts').then(function (response) {
                $scope.chartList = _.filter(response.data, function (item) {
                    return angular.isDefined(item.name) && item.name != '';
                });
            });
        }
        $scope.loadChartList();
        $scope.$on('refreshChartList', function () {
            $scope.loadChartList();
        });

        $scope.loadReportList = function () {
            $http.get($scope.apiURL + '/reports').then(function (response) {
                $scope.reportList = _.filter(response.data, function (item) {
                    return angular.isDefined(item.name) && item.name != '';
                });
                //console.log('reportList', $scope.reportList);
            });
        }
        $scope.loadReportList();
        $scope.$on('refreshReportList', function () {
            $scope.loadReportList();
        });

        $scope.loadIBoxList = function (){
            $http.get($scope.apiURL + '/iboxs').then(function (response) {
                $scope.iboxList = _.filter(response.data, function (item) {
                    return angular.isDefined(item.name) && item.name != '';
                });
                //console.log('iboxList', $scope.iboxList);
            });
        }
        $scope.loadIBoxList();

        $scope.$on('refreshIboxList', function () {
            $scope.loadIBoxList();
        });
    */

    $scope.$on('DashboardPageAssigned', function(event, arg){
        if(typeof arg !== 'undefined' && angular.isDefined(arg.currentPage)){
            $scope.currentPage = arg.currentPage;
            if ($scope.currentPage != null && angular.lowercase($scope.currentPage.name) != 'new') {
                $scope.currentPageName = $scope.currentPage.name;
            }
            else{
                $scope.currentPageName = '';
            }
        }
        //console.log('current page', $scope.currentPageName);
    });

      // $scope.menuClick = function (input, type) {
      //     //console.log('$scope.currentPage', $scope.currentPage);
      //     //console.log('chart', input); //console.log('current')

      //     if ($scope.currentPage.type == 'global' && $scope.userProfile.userType == 'user') {
      //         SweetAlert.swal({
      //             title: "Error",
      //             text: "You are not authorized to modify Gloabl Dashboard Page: " + angular.uppercase(input.name),
      //             type: "warning",
      //             confirmButtonColor: "#DD6B55",
      //             confirmButtonText: "Ok",
      //             closeOnConfirm: true,
      //             closeOnCancel: true
      //         },
      //         function (isConfirm) {
      //         });
      //     }
      //     else {
      //         if ($scope.currentPageName.length > 0) {
      //             SweetAlert.swal({
      //                 title: "",
      //                 text: "Do you want to add " + type + " " + angular.uppercase(input.name) + " on current page?",
      //                 type: "info",
      //                 confirmButtonColor: "#DD6B55",
      //                 showCancelButton: true,
      //                 confirmButtonText: "Ok",
      //                 cancelButtonText: "No",
      //                 closeOnConfirm: true,
      //                 closeOnCancel: true
      //             },
      //               function (isConfirm) {
      //                   if (isConfirm) {
      //                       //ChartService.addElementToPage(input, $scope.currentPage, type);
      //                       $rootScope.$broadcast("NewPageChartAdded",{component:input, componentType:type});
      //                   }
      //                   //console.log('yes', $scope.currentPage);
      //               });
      //         }
      //     }
      // }
    $scope.goToComponent = function(item, which){
        console.log(item);        
        if(which == 'chart')
            $state.go('index.chartlist',{id:item._id});
        else if(which == 'report')
            $state.go('index.reportlist',{id:item._id});
        else if(which == 'ibox')
            $state.go('index.iboxlist',{id: item._id});

    }

    $scope.changeStaticStaging = function(id, file){
        console.log(file);
        // $rootScope.$broadcast("MovedToDifferentDashboard", $scope.currentPage);
        $state.go('index.static', {file: file});
    }

    $scope.changeStaging = function(id){
        // $rootScope.$broadcast("MovedToDifferentDashboard", $scope.currentPage);
        $state.go('index.stagings',{id:id});
    };

    $scope.changeDashboard = function(id){
        // $rootScope.$broadcast("MovedToDifferentDashboard", $scope.currentPage);
        // console.log('id',id, $stateParams.id , id == $stateParams.id);
        $state.go('index.dashboards',{id:id});
    };

    $scope.changeAnalysis = function(id){
        // $rootScope.$broadcast("MovedToDifferentDashboard", $scope.currentPage);
        $state.go('index.analytics',{id:id});
    };
    $scope.changeReport = function(id){
        // $rootScope.$broadcast("MovedToDifferentDashboard", $scope.currentPage);
        $state.go('index.reports',{id:id});
    };
    $scope.changeStaticReport = function(id, file){
        // $rootScope.$broadcast("MovedToDifferentDashboard", $scope.currentPage);
        $state.go('index.staticreport', {'id': id});
    }
    $scope.changeCustomReport = function(id){
        // $rootScope.$broadcast("MovedToDifferentDashboard", $scope.currentPage);
        $state.go('index.customreport', {'id': id});
    }
    $scope.changeStaticAnalysis = function(id, file){
        //$rootScope.$broadcast("MovedToDifferentDashboard", $scope.currentPage);
        $state.go('index.staticanalysis', {'id': id});
        
    }

    $scope.menuClick = function (input, type) {
        console.log('$scope.currentPage', $scope.currentPage);
        console.log('chart', input); //console.log('current')
        console.log('$scope.currentPageName', $scope.currentPageName);
        //return false;

        if ($scope.currentPage.type == 'global' && $scope.userProfile.userType == 'user') {
            SweetAlert.swal({
                title: "Error",
                text: "You are not authorized to modify Gloabl Dashboard Page: " + angular.uppercase(input.name),
                type: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
            });
        }
        else {
            if (!angular.isDefined($scope.currentPage._id)) {
                SweetAlert.swal("Error!", "Please save newly created page before adding component");
            }
            else {
                if(angular.isDefined($scope.currentPage._id) && $scope.currentPage._id.length > 0){
                    //$scope.currentPageName.length > 0
                    var tmpComponent = _.filter($scope.currentPage.components, function (item) {
                        console.log(' filter item: ', item);
                        return angular.isDefined(item.component) && angular.isDefined(item.component._id) && item.component._id === input._id;
                    });

                    if(angular.isDefined(tmpComponent.length) && tmpComponent.length > 0) {
                        console.log(' Component already exists in the page. You can not add same component again.');
                        SweetAlert.swal("Error!", "Component already exists in the page. You can not add same component again.");
                    }
                    else {
                        SweetAlert.swal({
                            title: "",
                            text: "Do you want to add " + type + " " + angular.uppercase(input.name) + " on current page?",
                            type: "info",
                            confirmButtonColor: "#DD6B55",
                            showCancelButton: true,
                            confirmButtonText: "Ok",
                            cancelButtonText: "No",
                            closeOnConfirm: true,
                            closeOnCancel: true
                        },
                        function (isConfirm) {
                            if (isConfirm) {
                                //ChartService.addElementToPage(input, $scope.currentPage, type);
                                $rootScope.$broadcast("NewPageChartAdded", { component: input, componentType: type });
                            }
                            //console.log('yes', $scope.currentPage);
                        });
                    }
                }
            }
        }
    }

    //navigate to other site
    $scope.autoLogin= function(siteName){
        console.log("userProfile", UserProfile.profileData);
        //var url=globalconfig.+sitename+'.url'/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid';
        //window.open(url,_blank);
        
        switch(siteName){
            case 'Bengaluru':
                window.open('http://192.168.82.11:8080/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid, '_blank');
                break;

            case 'Mumbai':
                window.open('http://192.168.210.15:8080/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid, '_blank');
                break;

            case 'Dhaka':
                window.open('http://10.49.28.254:8080/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid, '_blank');
                break;

            case 'CTG':
                window.open('http://10.49.28.26:8080/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid, '_blank');
                break;
            case 'Shylet':
                window.open('http://10.49.28.18:8080/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid, '_blank');
                break;

            case 'Khulna':
                window.open('http://10.49.28.126:8080/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid, '_blank');
                break;
            case 'Rajshahi':
                window.open('http://10.49.28.130:8080/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid, '_blank');
                break;

            case 'CRM':
                window.open('http://10.49.28.250:8080/SpectaCRM/#/CRMLogin?crm=crm', '_blank');
                break;

        }
        // $window.open('http://10.49.28.254:8080/Specta/#/autoLogin?username='+UserProfile.profileData.email+'&sessionid='+UserProfile.profileData.sessionid, '_blank');
    }

});
