'use strict';

angular.module('specta')
    .service('highchartOptions', function () {
    this.highchartLineOptions = {
                
    }
    
    this.highchartPieOptions = {
        "chart": {
            "type":"pie",
            center: ['50%'],
            "height": 250
        },
        "credits": {"enabled": false},
        "title":{"text":""},
        "tooltip": {
            "pointFormat": "<b>{point.percentage:.1f}%</b>"
        },
        "plotOptions": { 
            "pie": {
                "allowPointSelect": true,
                "cursor": "pointer",
                "dataLabels": {"enabled": false},
                "showInLegend": true,
                //innerSize: 100, // for doughnut chart
                "events":{}
            }
        },
        "legend": {
            "verticalAlign": "top",
            "layout": "vertical",
            "align": "right"
        }
    }

    this.highchartBarLabelCategoriesOptions = {
        "chart": {"type":"column"},
        "title":{"text":""},
        "credits": {"enabled": false},
        "tooltip": {
            //customize pointFormat
            //pointFormat: 'Usage<b> {point.y:.2f} '+ appUsageFormattedArray[1] ,
            "shared": true
        },
        "plotOptions": { 
            column:{ 
                events: {
                    legendItemClick: function () {
                        return false; 
                    }
                }
            }
        },
        "xAxis" :{
            type: "categories",
            //categories: appArray
        },
        "yAxis":{
            "title": {"text":""}
        }
    }     

    this.highchartBubbleLabelCategoriesOptions = {
        "chart": {"type": "bubble", "zoomType": "xy"},
        "title": {"text":""},
        "credits": {"enabled": false},
        "xAxis" :{
            "title": {"text":""}
            //categories: 
        },
        "yAxis": {
            "title": {"text":""},
            "startOnTick": false,
            "endOnTick": false
        },
        "tooltip": {
            "headerFormat": "<b>{series.name}</b><br/>",
            "pointFormat": "<b>{point.name}</b>: {point.y}"
        },
        "plotOptions": {
            "series": {
                "dataLabels": {
                    "enabled": true,
                    "format": "{point.name}"
                }
            },
            bubble:{ 
                events: {
                    legendItemClick: function () {
                        return false; 
                    }
                }
            }
        }
    }
        
});