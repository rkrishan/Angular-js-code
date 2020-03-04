/**
 * specta - Responsive Admin Theme
 *
 * specta theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written stat for all view in theme.
 *
 */

 /*
    ,
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                             name: 'uiGmapgoogle-maps',
                            files: ['../bower_components/angular-simple-logger/dist/angular-simple-logger.min.js', '../bower_components/angularjs-google-maps/dist/angularjs-google-maps.min.js', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4&v=3.exp&libraries=placeses,visualization,drawing,geometry,places']
                        },
                        {
                             name: 'ngMap',
                            files: ['../bower_components/ngmap/build/scripts/ng-map.js', '../bower_components/angularjs-google-maps/dist/angularjs-google-maps.min.js', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4&v=3.exp&libraries=placeses,visualization,drawing,geometry,places']
                        }
                    ]);
                }
            }
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {files:['../bower_components/angular-simple-logger/dist/angular-simple-logger.min.js']},
                        {name: 'uiGmapgoogle-maps', files:['../bower_components/angular-google-maps/dist/angular-google-maps.js']},
                        {name: 'ngMap', files:['../bower_components/ngmap/build/scripts/ng-map.js']},
                        {files:['https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4&v=3.exp&libraries=placeses,visualization,drawing,geometry,places']}
                    ]);
                }
            }
 */

function config($stateProvider, $urlRouterProvider,ChartJsProvider, $httpProvider, $ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            // Set to true if you want to see what and when is dynamically loaded
            //debug: true,
            events: true
        });

        $urlRouterProvider.otherwise("/index/main");

    $stateProvider
        .state('##', {
            abstract: true,
            url: "/share",
            templateUrl: "views/common/content_top_navigation.html",
        })
        .state('##.share', {
            url: "/share?/:id?/:width",
            controller: "ShareCtrl",
            templateUrl: "views/dynamic.html",
            data: { pageTitle: 'Module' },
            resolve: {
                currentUser : authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "views/common/content_top_navigation.html",
        })
        .state('index.main', {
            url: "/main",
            templateUrl: "views/main.html",
            controller: 'MainCtrl',
            data: {pageTitle: 'Home'},
            resolve: { currentUser: authenticate }
        })
        .state('index.dashboard', {
            url: "/dashboard/:id",
            templateUrl: "views/dashboard.html",
            controller: 'DashboardNewCtrl',
            data: { pageTitle: 'Dashboard' },
            resolve: { currentUser: authenticate }
        })
        .state('index.dashboardlist', {
            url: "/dashboardlist",
            templateUrl: "views/dashboardlist.html",
            controller: 'DashboardListCtrl',
            data: { pageTitle: 'Dashboard' },
            resolve: { currentUser: authenticate }
        })
        .state('index.dashboarddetail', {
            url: "/dashboarddetail/:id",
            templateUrl: "views/dashboardDetail.html",
            controller: 'DashboardDetailCtrl',
            data: { pageTitle: 'Dashboard Detail' },
            resolve: { currentUser: authenticate }
        })
        .state('index.report', {
            url: "/report/:id",
            templateUrl: "views/report.html",
            controller: 'ReportsnewNewCtrl',
            data: { pageTitle: 'Report' },
            resolve: { currentUser: authenticate }
        })
        .state('index.reportslist', {
            url: "/reportslist",
            templateUrl: "views/reportslist.html",
            controller: 'ReportsListCtrl',
            data: { pageTitle: 'Report' },
            resolve: { currentUser: authenticate }
        })
        .state('index.analysis', {
            url: "/analysis/:id",
            templateUrl: "views/analysis.html",
            controller: 'AnalysisNewCtrl',
            data: { pageTitle: 'Analysis' },
            resolve: { currentUser: authenticate }
        })
        .state('index.analysislist', {
            url: "/analysislist",
            templateUrl: "views/analysislist.html",
            controller: 'AnalysisListCtrl',
            data: { pageTitle: 'Analysis' },
            resolve: { currentUser: authenticate }
        })
        .state('index.dashboards', {
            url: "/dashboards/:id",
            controller: "DynamicCtrl",
            templateUrl: "views/dynamic.html",
            data: { pageTitle: 'Dashboard', table: 'dashboards'},
            params: {'params':null, 'filterParams': null, id: null, 'file':null, 'name':null, 'paramsArray':null},
            resolve: {
                currentUser: authenticate,
                loadPlugin: googlePluginLoad
                //getUrl : getUrl
            }
        })
        .state('index.reports', {
            url: "/reports/:id",
            controller: "DynamicCtrl",
            templateUrl: "views/dynamic.html",
            data: { pageTitle: 'Report', table: 'report' },
            params: {'params':null, 'filterParams': null, id: null, 'file':null, 'name':null},
            resolve: {
                currentUser: authenticate,
                loadPlugin: googlePluginLoad
                //getUrl : getUrl
            }
        })
        .state('index.staticreport', {
            url: "/staticreport/:id",
            controller: "StaticReportCtrl",
            templateUrl: "views/static.html",
            data: { pageTitle: 'Report' },
            params: {'params':null, 'filterParams': null, id: null, 'file':null, 'name':null},
            resolve: { currentUser: authenticate
                //getUrl : getUrl 
            }
        })
        .state('index.analytics', {
            url: "/analytics/:id",
            controller: "DynamicCtrl",
            templateUrl: "views/dynamic.html",
            data: { pageTitle: 'Analytics', table: 'analysis'},
            params: {'params':null, 'filterParams': null, id: null, 'file':null, 'name':null},
            resolve: { currentUser: authenticate
                //getUrl : getUrl
            } 
        })
        .state('index.staticanalysis', {
            url: "/staticanalysis/:id",
            // url: "/staticanalysis?/:id?/:params?/:name?/:file",
            controller: "staticAnalysisCtrl",
            templateUrl: "views/static.html",
            data: { pageTitle: 'Analytics' },
            params: {'params':null, 'filterParams': null, 'id': null, 'file':null, 'name':null},
            resolve: {
                currentUser: authenticate,
                loadPlugin: googlePluginLoad
                //getUrl : getUrl
            }
        })
        .state('index.staticanalysiscrm', {
            url: "/staticanalysiscrm",
            // url: "/staticanalysis?/:id?/:params?/:name?/:file",
            controller: "customerDetailsBBCtrl",
            templateUrl: "views/fixedLine/customerDetailsBB.html",
            data: { pageTitle: 'Analytics' },
            params: {'params':null, 'filterParams': null, 'id': null, 'file':null, 'name':null},
            resolve: {
                currentUser: authenticate,
                loadPlugin: googlePluginLoad
                //getUrl : getUrl
            }
        })
        .state('index.subsListExport', {
            // url: "/staticanalysis/:id",
            url: "/subsListExport?/:id?/:params?/:name?/:file",
            controller: "staticAnalysisCtrl",
            templateUrl: "views/static.html",                             
            data: { pageTitle: 'Analytics' },
            params: {'params':null, 'filterParams': null, 'id': null, 'file':null, 'name':null},
            resolve: {
                currentUser: authenticate,
                loadPlugin: googlePluginLoad
            }
        })
        /*.state('index.stagings', {
            url: "/stagings/:id",
            controller: "DynamicCtrl",
            templateUrl: "views/dynamic.html",
            data: { pageTitle: 'Staging',table: 'staging' },
            resolve: { currentUser: authenticate }
        })*/
        .state('index.stagings', {
            url: "/stagings/:id",
            controller: "StagingViewCtrl",
            templateUrl: "views/stagingView.html",
            data: { pageTitle: 'Staging',table: 'staging' },
            resolve: {
                currentUser: authenticate,
                loadPlugin: googlePluginLoad
            }
        })
        .state('index.staging', {
            url: "/staging/:id",
            templateUrl: "views/staging.html",
            controller: 'StagingNewCtrl',
            data: { pageTitle: 'Staging' },
            resolve: { currentUser: authenticate }
        })
        .state('index.staginglist', {
            url: "/staginglist",
            templateUrl: "views/stagingList.html",
            controller: 'StagingListCtrl',
            data: { pageTitle: 'Staging' },
            resolve: { currentUser: authenticate }
        })
        .state('index.schedule', {
            url: "/schedule?/:id?/:reportId?/:statementId?/:name?/:day",
            controller: "ScheduleCtrl",
            templateUrl: "views/schedule.html",
            data: { pageTitle: 'Schedule' },
            resolve: { currentUser: authenticate }
        })
        .state('index.schedulelist', {
            url: "/schedulelist",
            controller: "SchedulelistCtrl",
            templateUrl: "views/schedulelist.html",
            data: { pageTitle: 'Schedule' },
            resolve: { currentUser: authenticate }
        })
        .state('index.module', {
            url: "/module/:id",
            controller: "ModuleNewCtrl",
            templateUrl: "views/module.html",
            data: { pageTitle: 'Module' },
            resolve: { currentUser: authenticate }
        })
        .state('index.modulelist', {
            url: "/modulelist",
            controller: "ModuleListCtrl",
            templateUrl: "views/modulelist.html",
            data: { pageTitle: 'Module' },
            resolve: { currentUser : authenticate}
        })
        .state('index.moduledetail', {
            url: "/moduledetail/:id",
            controller: "ModuleDetailCtrl",
            templateUrl: "views/moduleDetail.html",
            data: { pageTitle: 'Module Detail' },
            resolve: { currentUser: authenticate }
        })
        .state('index.statementlist', {
            url: "/statementlist?/:type?/:mode",
            controller: "StatementListCtrl",
            templateUrl: "views/statementlists.html",
            data: { pageTitle: 'Statement' },
            resolve: { currentUser: authenticate }
        })
        .state('index.statementcepstream', {
            url: "/statementcepstream/:mode?/:id",
            controller: "StatementNewCtrl",
            templateUrl: "views/statementCEPStream.html",
            data: { pageTitle: 'Statement' },
            resolve: { currentUser: authenticate }
        })
        .state('index.statementdbstream', {
            url: "/statementdbstream/:id",
            controller: "StatementNewCtrl",
            templateUrl: "views/statementDBStream.html",
            data: { pageTitle: 'Statement' },
            resolve: { currentUser: authenticate }
        })
        .state('index.statementdbpush', {
            url: "/statementdbpush/:id",
            controller: "StatementNewCtrl",
            templateUrl: "views/statementDBPush.html",
            data: { pageTitle: 'Statement' },
            resolve: { currentUser: authenticate }
        })
        .state('index.statementdbpull', {
            url: "/statementdbpull/:id",
            controller: "StatementNewCtrl",
            templateUrl: "views/statementDBPull.html",
            data: { pageTitle: 'Statement' },
            resolve: { currentUser: authenticate }
        })
        .state('index.statementindicator', {
            url: "/statementindicator/:id",
            controller: "StatementNewCtrl",
            templateUrl: "views/statementIndicator.html",
            data: { pageTitle: 'Statement' },
            resolve: { currentUser: authenticate }
        })
        .state('index.chartoption', {
            url: "/chartoption/:id",
            controller: "ChartOptionNewCtrl",
            templateUrl: "views/chartoption.html",
            data: { pageTitle: 'Chart Option' },
            resolve: { currentUser: authenticate }
        })
        .state('index.chartoptionslist', {
            url: "/chartoptionslist",
            controller: "ChartOptionsListCtrl",
            templateUrl: "views/chartoptionslist.html",
            data: { pageTitle: 'Chart Option' },
            resolve: { currentUser: authenticate }
        })
        .state('index.redirection', {
            url: "/redirection/:id",
            controller: "RedirectionNewCtrl",
            templateUrl: "views/redirection.html",
            data: { pageTitle: 'Redirection Option' },
            resolve: { currentUser: authenticate }
        })
        .state('index.redirectionlist', {
            url: "/redirectionlist",
            controller: "RedirectionCtrl",
            templateUrl: "views/redirectionlist.html",
            data: { pageTitle: 'Redirection Option' },
            resolve: { currentUser: authenticate }
        })
        .state('index.configuration', {
            url: "/configuration/:id",
            controller: "configurationNewCtrl",
            templateUrl: "views/configuration.html",
            data: { pageTitle: 'Configuration' },
            resolve: { currentUser: authenticate }
        })
        .state('index.configurationlist', {
            url: "/configurationlist",
            controller: "ConfigurationListCtrl",
            templateUrl: "views/configurationlist.html",
            data: { pageTitle: 'Configuration' },
            resolve: { currentUser: authenticate }
        })
        .state('index.alert', {
            url: "/alert/:id",
            controller: "AlertNewCtrl",
            templateUrl: "views/alert.html",
            data: { pageTitle: 'Alert' },
            params: {'id': null},
            resolve: { currentUser: authenticate }
        })
        .state('index.alertlist', {
            url: "/alertlist",
            controller: "AlertlistCtrl",
            templateUrl: "views/alertlist.html",
            data: { pageTitle: 'Alert' },
            resolve: { currentUser: authenticate }
        })
        .state('index.ceiconfig', {
            url: "/ceiconfig/:id",
            controller: "CEIConfigCtrl",
            templateUrl: "views/ceiConfig.html",
            data: { pageTitle: 'CEI Config' },
            params: {'id': null},
            resolve: { currentUser: authenticate }
        })
        .state('index.ceiconfiglist', {
            url: "/ceiconfiglist",
            controller: "CEIConfiglistCtrl",
            templateUrl: "views/ceiConfiglist.html",
            data: { pageTitle: 'CEI Config' },
            resolve: { currentUser: authenticate }
        })
        .state('index.group', {
            url: "/group/:id",
            controller: "GroupNewCtrl",
            templateUrl: "views/group.html",
            data: { pageTitle: 'Group' },
            resolve: { currentUser: authenticate }
        })
        .state('index.grouplist', {
            url: "/grouplist",
            controller: "GroupListCtrl",
            templateUrl: "views/grouplists.html",
            data: { pageTitle: 'Group' },
            resolve: { authenticate: authenticate }
        })
        .state('index.groupassign', {
            url: "/groupassign/:id",
            controller: "groupassignCtrl",
            templateUrl: "views/groupAssign.html",
            data: { pageTitle: 'Group' },
            resolve: { currentUser: authenticate }
        })
        .state('index.profile', {
            url: "/profile",
            controller: "ProfileCtrl",
            templateUrl: "views/profile.html",
            data: { pageTitle: 'Profile' },
            resolve: { currentUser: authenticate }
        })
        .state('index.user', {
            url: "/user/:id",
            controller: "UserNewCtrl",
            templateUrl: "views/user.html",
            data: { pageTitle: 'User' },
            resolve: { currentUser: authenticate }
        })
        .state('index.userlist', {
            url: "/userlist",
            controller: "UserListCtrl",
            templateUrl: "views/userlists.html",
            data: { pageTitle: 'User' },
            resolve: { currentUser: authenticate }
        })
        .state('index.customreportlist', {
            url: "/customreportlist",
            controller: "customreportlistCtrl",
            templateUrl: "views/customreportlist.html",
            data: { pageTitle: 'Custom Report' },
            resolve: { currentUser: authenticate }
        })
        .state('index.customreport', {
            url: "/customreport/:id",
            controller: "customReportCtrl",
            templateUrl: "views/customreport.html",
            data: { pageTitle: 'Custom Report' },
            resolve: { currentUser: authenticate }
        })
        .state('index.rotatelist', {
            url: "/rotatelist",
            controller: "RotateListCtrl",
            templateUrl: "views/rotationList.html",
            data: { pageTitle: 'Rotate' },
            resolve: { currentUser: authenticate }
        })
        .state('index.rotate', {
            url: "/rotate",
            controller: "RotateCtrl",
            templateUrl: "views/rotate.html",
            data: { pageTitle: 'Rotate' },
            resolve: { currentUser: authenticate }
        })
        .state('index.staticfilter', {
            url: "/staticfilter",
            templateUrl: "views/staticFilter.html",
            controller: 'StaticFilterCtrl',
            data: { pageTitle: 'Static Filter' },
            resolve: { currentUser: authenticate }
        })
        .state('index.deviceUsageGeoDistribution', {
            url: "/DeviceGeoDist",
            controller: "deviceUsageGeoDistributionCtrl",
            templateUrl: "views/mobility/deviceUsageGeoDistribution.html",
            params: {'params':null, 'filterParams': null, 'file': null},
            resolve: { currentUser: authenticate }
        })
        .state('index.static', {
            url: "/static?/:name?/:file",
            templateUrl: "views/static.html",
            data: { pageTitle: 'Static' },
            params: {'params':null, 'filterParams': null, 'id': null, 'file':null, 'name':null},
            resolve: { currentUser: authenticate }
        })
        .state('index.offlineschedule', {
            url: "/offlineschedule?/:id",
            controller: "OfflinescheduleCtrl",
            templateUrl: "views/offlineschedule.html",
            data: { pageTitle: 'Offline Schedule' },
            resolve: { currentUser: authenticate }
        })
        .state('index.offlineschedulelist', {
            url: "/offlineschedulelist",
            controller: "OfflineschedulelistCtrl",
            templateUrl: "views/offlineschedulelist.html",
            data: { pageTitle: 'Offline Schedule' },
            resolve: { currentUser: authenticate }
        })
        .state('index.appconfig', {
            url: "/appconfig?/:id",
            controller: "AppConfigCtrl",
            templateUrl: "views/appconfig.html",
            data: { pageTitle: 'App Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.appconfiglist', {
            url: "/appconfiglist",
            controller: "AppConfiglistCtrl",
            templateUrl: "views/appconfiglist.html",
            data: { pageTitle: 'App Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.planconfig', {
            url: "/planconfig?/:id",
            controller: "PlanConfigCtrl",
            templateUrl: "views/planconfig.html",
            data: { pageTitle: 'Plan Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.planconfiglist', {
            url: "/planconfiglist",
            controller: "PlanConfiglistCtrl",
            templateUrl: "views/planconfiglist.html",
            data: { pageTitle: 'Plan Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.nodeconfig', {
            url: "/nodeconfig?/:id",
            controller: "NodeConfigCtrl",
            templateUrl: "views/nodeconfig.html",
            data: { pageTitle: 'Node Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.nodeconfiglist', {
            url: "/nodeconfiglist",
            controller: "NodeConfiglistCtrl",
            templateUrl: "views/nodeconfiglist.html",
            data: { pageTitle: 'Node Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.segmentconfig', {
            url: "/segmentconfig?/:id",
            controller: "SegmentConfigCtrl",
            templateUrl: "views/segmentconfig.html",
            data: { pageTitle: 'Segment Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.segmentconfiglist', {
            url: "/segmentconfiglist",
            controller: "SegmentConfiglistCtrl",
            templateUrl: "views/segmentconfiglist.html",
            data: { pageTitle: 'Segment Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.dnsconfig', {
            url: "/dnsconfig?/:id",
            controller: "DNSConfigCtrl",
            templateUrl: "views/dnsconfig.html",
            data: { pageTitle: 'DNS Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.dnsconfiglist', {
            url: "/dnsconfiglist",
            controller: "DNSConfiglistCtrl",
            templateUrl: "views/dnsconfiglist.html",
            data: { pageTitle: 'DNS Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.areaconfig', {
            url: "/areaconfig?/:id",
            controller: "AreaConfigCtrl",
            templateUrl: "views/areaconfig.html",
            data: { pageTitle: 'Area Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.areaconfiglist', {
            url: "/areaconfiglist",
            controller: "AreaConfiglistCtrl",
            templateUrl: "views/areaconfiglist.html",
            data: { pageTitle: 'Area Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.cityconfig', {
            url: "/cityconfig?/:id",
            controller: "CityConfigCtrl",
            templateUrl: "views/cityconfig.html",
            data: { pageTitle: 'City Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.brasconfig', {
            url: "/brasconfig?/:id",
            controller: "BrasConfigCtrl",
            templateUrl: "views/brasconfig.html",
            data: { pageTitle: 'Bras Config' },
            resolve: {
                currentUser: authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.systemmaintenance', {
            url: "/systemmaintenance",
            controller: "SystemStatusCtrl",
            templateUrl: "views/systemmaintenance.html",
            data: { pageTitle: 'System Maintenance' },
            resolve: {
                currentUser : authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.systemconfig', {
            url: "/systemconfig?/:tab",
            controller: "SystemConfigCtrl",
            templateUrl: "views/system_config.html",
            data: { pageTitle: 'System Config' },
            resolve: {
                currentUser : authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.probeconfig', {
            url: "/probeconfig?/:tab",
            controller: "ProbeConfigCtrl",
            templateUrl: "views/probe_config.html",
            data: { pageTitle: 'Probe Config' },
            resolve: {
                currentUser : authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.notification', {
            url: "/notification",
            controller: "NotificationCtrl",
            templateUrl: "views/notification.html",
            data: { pageTitle: 'Notification' },
            resolve: {
                currentUser : authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.campaignslist', {
            url: "/campaignslist",
            controller: "CampaignsListCtrl",
            templateUrl: "views/campaignsList.html",
            data: { pageTitle: 'Campaigns' },
            resolve: {
                currentUser : authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('index.campaigns', {
            url: "/campaigns?/:id",
            controller: "CampaignsCtrl",
            templateUrl: "views/campaigns.html",
            data: { pageTitle: 'Campaigns' },
            resolve: {
                currentUser : authenticate,
                notAccessUser : notAccessUser
            }
        })
        .state('forgot', {
            url: "/forgot/:token",
            templateUrl: "views/forgotpass.html",
            controller: 'forgotpassCtrl'
        })
        .state('email', {
            url: "/email",
            templateUrl: "views/email.html",
            controller: 'emailCtrl'
        })
        .state('help', {
            url: "/help",
            templateUrl: "help.html",
            controller: 'infoCtrl'
        })
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            controller: 'LoginCtrl',
            data: { pageTitle: 'Login', specialClass: 'gray-bg' }
        })
        .state('autoLogin', {
            url: "/autoLogin?/:username?/:sessionid?/:crm",
            templateUrl: "views/autoLogin.html",
            controller: 'autoLoginCtrl',
            params: {'username':null, 'sessionid': null,'crm':null },
            data: { pageTitle: 'AutoLogin', specialClass: 'gray-bg' },
            /*resolve: {
                category: ['$stateParams', function( $stateParams) {
                    console.log("$stateParams autoLogin config", $stateParams)
                }]
            }*/
        })
        .state('CRMLogin', {
            url: "/CRMLogin?/:crm",
            templateUrl: "views/crmLogin.html",
            controller: 'crmLoginCtrl',
            params: {'crm':null },
            data: { pageTitle: 'CRM Login', specialClass: 'gray-bg' },
            /*resolve: {
                category: ['$stateParams', function( $stateParams) {
                    console.log("$stateParams autoLogin config", $stateParams)
                }]
            }*/
        })
        .state('logout', {
            url: "/logout",
            controller: 'LogoutCtrl'
        });

        ChartJsProvider.setOptions({
          responsive: true
        });
}
angular
    .module('specta')
    .config(config)
    .run(function ($rootScope, $state){
        $rootScope.$state = $state;
    });

function authenticate($state, $location, $timeout, $rootScope, $q, UserProfile){
    var userProfile = UserProfile.profileData;
    // console.log('userProfile', userProfile.userId, userProfile, $location.path());
    if( userProfile.userId == null ){
        $timeout(function(){
            $state.go('login');
        }, 0);
        return;
        // return $q.reject();
    }
    else{
        $rootScope.$broadcast('MovedToDifferentDashboard', null);
        return userProfile;
    }
}

function getUrl($state,$http,httpService){
    console.log("state", $state);

    var category= 'home';//$state.current.data.pageTitle;
    var subCategory= 'Analytics';//$state.current.data.currentPage;
    var pageID= '12345';//$state.params.id;
    console.log(category,subCategory, pageID);
    
   /* $http.get(trackingURL).success(function (response, status, headers, config){
                return response;
    })
    .error(function (error, status, headers, config){
        if(status == 401) $state.go('logout');
        return error;
    });*/
}

function notAccessUser($state, $timeout, $q, UserProfile){
    var userProfile = UserProfile.profileData;
    if( userProfile.userType == 'user' ){
        $timeout(function(){
            $state.go('index.main');
        }, 0);
        return;
        // return $q.reject();
    }
}


function googlePluginLoad($ocLazyLoad, globalConfig){
    console.log('navigator.onLine***************', navigator.onLine);
    var tmp = [];
    console.log("globalConfig.isOnline",globalConfig.isOnline)
    if(globalConfig.isOnline){
        tmp.push({type: 'js', path: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4&v=3.exp&libraries=placeses,visualization,drawing,geometry,places'})

        tmp.push('../bower_components/angular-google-maps/dist/angular-google-maps.js');
        tmp.push('../bower_components/angular-simple-logger/dist/angular-simple-logger.min.js');
        
        return $ocLazyLoad.load({
            name: 'uiGmapgoogle-maps',
            serie: true,
            files: tmp
        });
    }
}
