'use strict';

angular.module('specta') 
    .controller('chartExampleCtrl', chartExampleCtrl);

function chartExampleCtrl($scope, $rootScope, $uibModalInstance){
    $scope.cancel = function (){
        $uibModalInstance.dismiss('cancel');
    };

    $scope.chartList = {
        'pie': [
            {title: 'Pie', chartType: 'Pie', nameSpace: 'highchart_pie', libType: 'highchart', image: 'highchart_pie.png'},
            {title: 'Pie with legend', chartType: 'Pie', nameSpace: 'highchart_pie_legend', libType: 'highchart', image: 'highchart_pie_legend.png'},
            {title: 'Donut', chartType: 'Pie', nameSpace: 'highchart_donut', libType: 'highchart', image: 'highchart_donut.png'}
        ],
        'line': [
            {title: 'Line', chartType: 'Line', nameSpace: 'highchart_line', libType: 'highchart', image: 'highchart_line.png'},
            {title: 'Line Multi Series', chartType: 'Line', nameSpace: 'highchart_line', libType: 'highchart', image: 'highchart_line_mulitseries.png'},
            {title: 'Line Area', chartType: 'Line', nameSpace: 'flot_line_area', libType: 'flot', image: 'flot_line_area.png'},
            {title: 'Line', chartType: 'Line', nameSpace: 'flot_line', libType: 'flot', image: 'flot_line.png'}
        ],
        'bar':  [
            {title: 'Bar', chartType: 'Bar', nameSpace: 'highchart_bar', libType: 'highchart', image: 'highchart_bar.png'},
            {title: 'Bar Multi Series', chartType: 'Bar', nameSpace: 'highchart_bar', libType: 'highchart', image: 'highchart_bar_multiseries.png'},
            {title: 'Line Plush Bar', chartType: 'LinePlushBar', nameSpace: 'line_plush_bar', libType: 'highchart', image: 'line_plush_bar.png'}
        ],
        'stackedbar':  [
            {title: 'StackedBar', chartType: 'StackedBar', nameSpace: 'highchart_stackedbar_label', libType: 'highchart', image: 'highchart_stackedbar_label.png'},
            {title: 'StackedBar Day Wise', chartType: 'StackedBar', nameSpace: 'highchart_stackedbar_day', libType: 'highchart', image: 'highchart_stackedbar_day.png'},
            {title: 'StackedBar Group', chartType: 'StackedBar', nameSpace: 'highchart_stackedbar_groupby', libType: 'highchart', image: 'highchart_stackedbar_groupby.png'},
            {title: 'StackedBar Horizontal', chartType: 'StackedBarHorizontal', nameSpace: 'highchart_stackedbar_horizontal', libType: 'highchart', image: 'highchart-stackedBar_horizontal.png'}
        ]
    }

    $scope.selectedChart = function(data){
        $rootScope.$broadcast('selectChart', data);
        $scope.cancel();
    }

    //Highchart Options
    var options = {
        "options" : {
            "title": {"text":""},
            "credits": {"enabled": false},
            "xAxis" :{
                "categories": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                "title":{"text":"Month"}
            },
            "yAxis": {
                "title": {},
                "plotLines": [{
                    "value": 0,
                    "width": 1,
                    "color": "#808080"
                }]
            }
        },
        "series":[{
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }]
    };

    //Line Chart
    $scope.line = options;

    //Pie Chart
    $scope.pie = {
        "options" : {
            "chart": {"type":"pie","height": 250},
            "credits": {"enabled": false},
            "title":{"text":""},
            "tooltip": {"pointFormat": "<b>{point.percentage:.1f}%</b>"},
            "plotOptions": {
                "pie": {
                    "size":"100%",
                    "allowPointSelect": true,
                    "cursor": "pointer",
                    "dataLabels": {"enabled": false},
                    "showInLegend": true,
                    "events":{}
                }
            }
        },
        "series":[{
            name:"",
            colorByPoint: true,
            data: [{
                name: 'Microsoft Internet Explorer',
                y: 56.33
            }, {
                name: 'Chrome',
                y: 24.03,
                sliced: true,
                selected: true
            }, {
                name: 'Firefox',
                y: 10.38
            }, {
                name: 'Safari',
                y: 4.77
            }, {
                name: 'Opera',
                y: 0.91
            }, {
                name: 'Proprietary or Undetectable',
                y: 0.2
            }]
        }]
    };

    //Multi Series (Line Chart)
    var tmpOpt = angular.copy(options);
    var tmpSeries = tmpOpt.series;
    tmpSeries.push({
        name: 'New York',
        data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
    });
    $scope.multiSeries = tmpOpt;

    //Bar Chart
    var tmpBar = angular.copy(options);
    var barOpt = tmpBar.options;
    barOpt.chart = {
        "renderTo": "container",
        "type":"column"
    };
    $scope.bar = tmpBar;
}