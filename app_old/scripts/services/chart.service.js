'use strict';

angular.module('specta')
    .factory('ChartService', function (globalConfig, $http, $rootScope) {
        var service = {};
        service.chartItems = [];
        service.currentPage = null;

        service.loadChart = function () {
            //console.log('chart api', globalConfig.dataapiurl + '/charts');
            $http.get(globalConfig.dataapiurl + '/charts').then(function (response) {
                //console.log('chart', response);
                service.chartItems = response.data;
                $rootScope.$broadcast("NewChartAdded");
            });
        }

        service.setCurrentPage = function (input) {
            service.currentPage = input;
            // $rootScope.$broadcast("DashboardPageAssigned");
        }

        service.refreshDashboard = function () {
            $rootScope.$broadcast("refreshDashboard");
        }

        service.refreshReport = function () {
            $rootScope.$broadcast("refreshReport");
        }

        service.refreshAnalysis = function () {
            $rootScope.$broadcast("refreshAnalysis");
        }

        service.refreshCustomReport = function () {
            $rootScope.$broadcast("refreshCustomReport");
        }

        service.refreshStaging = function () {
            $rootScope.$broadcast("refreshStaging");
        }

        service.refreshChartList = function () {
            $rootScope.$broadcast("refreshChartList");
        }

        service.refreshModuleList = function () {
            $rootScope.$broadcast("refreshModuleList");
        }

        service.addElementToPage = function (inputItem, currentPage, type) {
          // var postUrl = globalConfig.dataapiurl + '/pages/' + currentPage._id;
          //console.log(postUrl);
          // $http.get(postUrl).then(function (response) {
              // var charts = response.data.charts;
              // var reports = response.data.reports;
              // var iboxes = response.data.iboxes;
              // if (!angular.isDefined(charts) || charts == undefined) {
              //     response.data.charts = [];
              // }

              // if (!angular.isDefined(reports) || reports == undefined) {
              //     response.data.reports = [];
              // }

              // if (!angular.isDefined(iboxes) || iboxes == undefined) {
              //     response.data.iboxes = [];
              // }
              // var componentsData = response.data.components;
              // if(!angular.isDefined(componentsData) || componentsData == undefined){
              //   componentsData = [];
              // }
              // componentsData.push({componentType:type,component:inputItem});
              // // if (type == 'chart') {
              //     response.data.charts.push(inputItem);
              // }
              // else if (type == 'report') {
              //     response.data.reports.push(inputItem);
              // }
              // else if (type == 'ibox') {
              //     response.data.iboxes.push(inputItem);
              // }
              //////console.log('charts', charts);
              ////var reqData = { 'charts': charts };
              //console.log('update request', response.data);
              // var addChartRequest = {
              //     // 'charts': response.data.charts
              //     // , 'reports': response.data.reports
              //     // , 'iboxes': response.data.iboxes
              //     'components':componentsData
              //     , 'dashboardId': response.data.dashboardId
              //     , 'name': response.data.name
              //     , 'type': currentPage.type
              // };
              // console.log('addChartRequest ',addChartRequest);
              //console.log('final update request', addChartRequest);

          // });


              $http.put(globalConfig.dataapiurl + '/pages/' + currentPage._id, addChartRequest).then(function (updateResponse) {
                  //console.log('updateResponse', updateResponse);
                  $rootScope.$broadcast("NewPageChartAdded",{component:inputItem, componentType:type});
              });
        }
        return service;
});
