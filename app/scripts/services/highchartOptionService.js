'use strict';

angular.module('specta')
    .service('highchartOptions', function () {
    
    this.highchartPieOptions = {
        "chart": {
            //height: 300,
            "type":"pie",
            center: ['50%'],
            "height": 250
        },
        'legend':{maxHeight: 60},
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
                innerSize: 100, // for doughnut chart
                "events":{}
            }
        },
        "legend": {
            "verticalAlign": "top",
            "layout": "vertical",
            "align": "right"
        }
    }
    
    this.highchartPieWoLegendOptions = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor)
                    }
                }
            }
        }
    }

    // this is 3d pai chart for displaying in 3d view 
    
    this.highchartPieWoLegendOptionsWithClickable = {
        chart: {
            type: 'pie',
            // options3d: {
            //     enabled: true,
            //     alpha: 45,
            //     beta: 10
            //  }
        },
        title: {
            text: 'Potential upgrade Base Priority'
        },
        // accessibility: {
        //     point: {
        //         valueSuffix: '%'
        //     }
        // },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                size: 350,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor)
                    }
                },
            },

        }
    }
    
    this.highChartPieLabelInsideOptions= {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.0f}</b>'
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    distance: -50,
                    format:'{point.name} : {point.y}',
                    style: {
                        fontWeight: 'bold',
                        color: 'white'
                    }
                } 
            }
        }
    }
    
    this.highchartBarLabelCategoriesOptions = {
        "chart": {height: 400, "type":"column", zoomType:'xy'},
        "title":{"text":""},
        "credits": {"enabled": false},
        "tooltip": {
            //customize pointFormat
            //pointFormat: 'Usage<b> {point.y:.2f} '+ appUsageFormattedArray[1] ,
            //valueSuffix: ' mb',
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
            categories: [],
            title: {text: null}
        },
        "yAxis":{
            allowDecimals: false,
            "title": {"text":""}
        }
    }     
    
    this.highchartBarHorizontalLabelCategoriesOptions = {
        "chart": {height: 400, "type":"bar", zoomType:'xy'},
        "title":{"text":""},
        "credits": {"enabled": false},
        "tooltip": {
            //customize pointFormat
            //pointFormat: 'Usage<b> {point.y:.2f} '+ appUsageFormattedArray[1] ,
            //valueSuffix: ' mb',
            "shared": true
        },
        "plotOptions": { 
            bar:{ 
                events: {
                    legendItemClick: function () {
                        return false; 
                    }
                }
            }
        },
        "xAxis" :{
            type: "categories",
            categories: []
        },
        "yAxis":{
            allowDecimals: false,
            "title": {"text":""}
        }
    }     

    this.highchartBarHorizontalLabelDatetimeOptions = {
        "chart": {height: 300, "type":"bar", zoomType: 'xy'},
        "title":{"text":""},
        "credits": {"enabled": false},
        "tooltip": {
            //customize pointFormat
            pointFormat: 'Usage<b> {point.y:.2f} ',
            "shared": true
        },
        "plotOptions": { 
            bar:{ 
                events: {
                    legendItemClick: function () {
                        return false; 
                    }
                }
            }
        },
        "color":[],
        "xAxis" :{
            "type": "datetime",
            "labels": {
                "format": "{value:%e%b}",
                "align": "left"
            }
        },
        "yAxis":{
            allowDecimals: false,
            "title": {"text":""}
        }
    }     
    
    // this is for time lable high chart for mintes wise distribution 
    this.highchartBarLabelDatetimeOptions = {
        "chart": {height: 300, "type":"column", zoomType: 'xy'},
        "title":{"text":""},
        "credits": {"enabled": false},
        "tooltip": {
            //customize pointFormat
            pointFormat: null,//'Usage<b> {point.y:.2f} '+ appUsageFormattedArray[1] ,
            "shared": true
        },
        "plotOptions": { 
            column:{ 
                events: {
                    click: function () {
                        console.log('Series: '+ this.series.name +', value: '+ this.y);
                        return false; 
                    }
                }
            }
        },
        "color":[],
        "xAxis" :{
            "type": "datetime",
            "labels": {
                "format": "{value:%I:%M %p}",
                "align": "left",
                // 'autoRotation': "false"
            }
        },
        "yAxis":{
            allowDecimals: false,
            "title": {"text":""}
        }
    } 
       

    
  // New chart 
    this.highchart3YAxisLinePlusBarLabelDatetimeOptions1 = {
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: ''
    },
    'legend':{maxHeight: 60},
     "tooltip": {
            //customize pointFormat
            pointFormat: null,//'Usage<b> {point.y:.2f} '+ appUsageFormattedArray[1] ,
            "shared": true
        },
    xAxis: {
        // "type": "datetime",
        categories: [],
        crosshair: true,
        "labels": {
            "format": "{value:%I:%M %p}",
            "align": "left"
        }
    },
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value}',
            style: {
                color: "#0040ff"
                // color: "#ff4000"
            }
        },
        allowDecimals: false,
        title: {
            text: '',
            style: {
                color: "#0040ff"
                // color: "#ff4000"
            }
        },
        opposite: true
    }, { // Secondary yAxis
        title: {
            text: '',
            style: {
                color: "#1abc9c"
                // color: "rgb(31, 158, 163)"
            }
        },
        allowDecimals: false,
        labels: {
            format: '{value}',
            style: {
                color: "#1abc9c"
                // color: "rgb(31, 158, 163)"
            }
        },
        opposite: true
    },{ // Tertiary yAxis
        title: {
            text: '',
            style: {
                color: "#f37a13"
                // color: "rgb(124, 77, 255)"
            }
        },
        allowDecimals: false,
        labels: {
            format: '{value}',
            style: {
                color: "#f37a13"
                // color: "rgb(124, 77, 255)"
            }
        },
        opposite: false
    },

],
    credits: {
        enabled: false
    }
    }

   //  
    this.highchartBarNgtValLabelDatetimeOptions =  {
        chart: {
            type: 'column'
        },
        "title":{"text":""},
        "credits": {"enabled": false},
        xAxis: {
            "type": "datetime",
            // categories: null,
            "labels": {
                "format": "{value:%e %b}",
                "align": "left"
            }
        },
        yAxis: {
            title: {
                text: null
            },
            labels: {
                formatter: function () {
                    return Math.abs(this.value) + '%';
                }
            }
        },

        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },

        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name+" " + (Math.abs(this.point.y)).toFixed(0) +"%" +'</b>';
            }
        },
    }

    this.highchartBubbleLabelCategoriesOptions = {
        "chart": {height: 400, "type": "bubble", "zoomType": "xy"},
        "title": {"text":""},
        'legend':{maxHeight: 60},
        "credits": {"enabled": false},
        "xAxis" :{
            "title": {"text":""}
            //categories: 
        },
        "yAxis": {
            allowDecimals: false,
            "title": {"text":""},
            "startOnTick": false,
            reversedStacks: false,
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
    
    this.highchartMultilineLabelDatetimeOptions = { 
    
        "chart": { height: 300, "zoomType": "xy"},
        "title": {"text":""},
        "credits": {"enabled": false},
        'legend':{maxHeight: 60},
        "xAxis" :{
            "title": {"text":""},
            "type": "datetime",
            "categories": null, // for datetime array
            "labels": {
                "format": "{value:%e %b}"
            }
        },
        "yAxis": {
            allowDecimals: false,
            "title": {"text":""},            
        },
        "plotOptions": {
            "spline": {
                "marker": {
                    "enabled": true
                }
            }
        },
        "tooltip": {
            "xDateFormat": "%e %b",
                             
        }
    }

    this.highchartMultilineLabelDatetimeOptionsCentral = { 
    
        "chart": { height: 300, "zoomType": "xy"},
        "title": {"text":""},
        "credits": {"enabled": false},
        'legend':{maxHeight: 60},
        "xAxis" :{
            "title": {"text":""},
            "type": "datetime",
            "categories": null, // for datetime array
            "labels": {
                "format": "{value:%e %b}"
            }
        },
        "yAxis": {
            allowDecimals: false,
            "title": {"text":""},
            labels: {
                formatter: function() {
                  return this.value / 1000 + 'K';
                }
              },
            
        },
        "plotOptions": {
            "spline": {
                "marker": {
                    "enabled": true
                }
            }
        },
        "tooltip": {
            "xDateFormat": "%e %b",
                             
        }
    }
     // this chart for count chart of Subscriber movement Tracker 
    this.highchartMultilineLabelDatetimeOptionsLink3 = { 
    
        "chart": { height: 300, "zoomType": "xy"},
        "title": {"text":""},
        "credits": {"enabled": false},
        'legend':{maxHeight: 60},
        "xAxis" :{
            "title": {"text":""},
            "type": "datetime",
            "categories": null, // for datetime array
            "labels": {
                "format": "{value:%e %b}"
            }
        },
        "yAxis": {
            allowDecimals: false,
            "title": {"text":""},
            labels: {
                formatter: function() {
                  return this.value / 1000 + 'K';
                }
              },
            
        },
        "plotOptions": {
            "spline": {
                "marker": {
                    "enabled": true
                }
            }
        },
        "tooltip": {
            "xDateFormat": "%e %b",
                             
        }
    }
   
    this.highchartStackedBarLabelDatetimeOptions = {
        "chart": {
            "type":"column",
            height: 300
        },
        "credits": {"enabled": false},
        'legend':{maxHeight: 60},
        "exporting": {},
        "title": {"text":""},
        "xAxis" :{
            "title": {"text":""},
            "type": "datetime",
            //categories: dateArray,
            "labels": {
                "format": "{value:%e %b}",
                "align": "left"
            }
        },
        "yAxis": {
            allowDecimals: false,
            "min": 0,
            "title":{"text":""},
            "labels":{},
            reversedStacks: false,
            "stackLabels": {
                "enabled": true,
                "style": {
                    "fontWeight": "bold",
                    "color": "gray"
                }
            }
        },
        "legend": {
            "reversed": true
        },
        "tooltip": {
            "xDateFormat": "%e %b",
            "shared": false,
            pointFormat: null,//'<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        },
        "plotOptions": {

            "column": {
                stacking: 'percent',
                "pointPadding": 0.2,
                "borderWidth": 0,
                point: {
                    events:{
                        click: function () {
                         //console.log('Series: '+ this.series.name +', value: '+ this.y);
                        }
                    }
                },
                "dataLabels": {
                    "enabled": false,
                    "color": "white",
                    "style": {"textShadow": "0 0 3px black"}
                    /*formatter: function() {
                        return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    }*/
                }
            }

        }
    }
    
    this.highchartStackedBarLabelCategoriesOptions = {
        "chart": {
            "type":"column",
            height: 300
        },
        "credits": {"enabled": false},
        'legend':{maxHeight: 60},
        "exporting": {},
        "title": {"text":""},
        "xAxis" :{
            "title": {"text":""},
            //categories: dateArray,
        },
        "yAxis": {
            allowDecimals: false,
            "min": 0,
            "title":{"text":""},
            "labels":{},
            reversedStacks: false,
            "stackLabels": {
                "enabled": true,
                "style": {
                    "fontWeight": "bold",
                    "color": "gray"
                }
            }
        },
        "legend": {
            "reversed": true
        },
        "tooltip": {
            "xDateFormat": "%e %b",
            "shared": false
            //pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        },
        "plotOptions": {

            "column": {
                stacking: 'normal',
                "pointPadding": 0.2,
                "borderWidth": 0,
                point: {
                    events:{
                        click: function () {
                         //console.log('Series: '+ this.series.name +', value: '+ this.y);
                        }
                    }
                },
                "dataLabels": {
                    "enabled": false,
                    "color": "white",
                    "style": {"textShadow": "0 0 3px black"}
                    //formatter: function() {
                        //return '<b>' + this.series.name + '</b>: ' + this.percentage.toFixed(2) + ' %';
                    //}
                }
            }

        }
    }
        
    this.highchartLinePlusBarLabelDatetimeOptions = {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        xAxis: {
            "type": "datetime",
            //categories: timeArray,
            "labels": {
                "format": "{value:%e %b}",
                "align": "left"
            }
        },
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value:,.0f}',
                style: {
                    color: "#3D8EB9"
                }
            },
            allowDecimals: false,
            title: {
                text: 'Users',
                style: {
                    color: "#3D8EB9"
                }
            }
        }, { // Secondary yAxis
            title: {
                //text: 'Usage('+FormattedusageDataArray[1]+")",
                style: {
                    color: "#1abc9c"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value:,.0f}',
                style: {
                    color: "#1abc9c"
                }
            },
            opposite: true
        }],
        credits: {
            enabled: false
        }
    }
    
    this.highchartLinePlusBarLabelCategoriesOptionsOLT = {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        xAxis: {
            "type": "categories",
            'categories': [],
            
        },
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: "#3D8EB9"
                }
            },
            allowDecimals: false,
            title: {
                text: 'Subscribers',
                style: {
                    color: "#3D8EB9"
                }
            }
        }, { // Secondary yAxis
            title: {
                //text: 'Usage('+FormattedusageDataArray[1]+")",
                style: {
                    color: "#1abc9c"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#1abc9c"
                }
            },
            opposite: true
        },{ // Third yAxis
            min: 0,
            max: 50,
            tickInterval: 3,
            title: {
                //text: 'Usage('+FormattedusageDataArray[1]+")",
                style: {
                    color: "#b35900"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#b35900"
                }
            },
            opposite: true
        },{ // fourth yAxis
            title: {
                //text: 'Usage('+FormattedusageDataArray[1]+")",
                style: {
                    color: "#FA020D"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#FA020D"
                }
            },
            opposite: false
        }],
        credits: {
            enabled: false
        }
    }

    this.highchartLinePlusBarLabelCategoriesOptionsOLTMinutes = {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        xAxis: {
            "type": "categories",
            'categories': [],
            
        },
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: "#1abc9c"
                }
            },
            allowDecimals: false,
            title: {
                text: 'Subscribers',
                style: {
                    color: "#1abc9c"
                }
            }
        }, { // Secondary yAxis
            title: {
                //text: 'Usage('+FormattedusageDataArray[1]+")",
                style: {
                    color: "#FA020D"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#FA020D"
                }
            },
            opposite: true
        }],
        credits: {
            enabled: false
        }
    }
    this.highchartLinePlusBarLabelCategoriesOptions = {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        xAxis: {
            "type": "categories",
            'categories': [],
            
        },
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: "#3D8EB9"
                }
            },
            allowDecimals: false,
            title: {
                text: 'Subscribers',
                style: {
                    color: "#3D8EB9"
                }
            }
        }, { // Secondary yAxis
            title: {
                //text: 'Usage('+FormattedusageDataArray[1]+")",
                style: {
                    color: "#1abc9c"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#1abc9c"
                }
            },
            opposite: true
        }],
        credits: {
            enabled: false
        }
    }
    
    this.highchart3YAxisLinePlusBarLabelDatetimeOptions = {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        xAxis: {
            "type": "datetime",
            //categories: timeArray,
            "labels": {
                "format": "{value:%e %b}",
                "align": "left"
            }
        },
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: "#0040ff"
                    // color: "#ff4000"
                }
            },
            allowDecimals: false,
            title: {
                text: '',
                style: {
                    color: "#0040ff"
                    // color: "#ff4000"
                }
            },
            opposite: true
        }, { // Secondary yAxis
            title: {
                text: '',
                style: {
                    color: "#1abc9c"
                    // color: "rgb(31, 158, 163)"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#1abc9c"
                    // color: "rgb(31, 158, 163)"
                }
            },
            opposite: true
        },{ // Tertiary yAxis
            title: {
                text: '',
                style: {
                    color: "#f37a13"
                    // color: "rgb(124, 77, 255)"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#f37a13"
                    // color: "rgb(124, 77, 255)"
                }
            },
            opposite: false
        },

        { // fourth yAxis
            min: 600,
            // max: 50,
            tickInterval: 12,
            title: {
                text: '',
                style: {
                    color: "#FA020D"
                    // color: "rgb(124, 77, 255)"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#FA020D"
                    // color: "rgb(124, 77, 255)"
                }
            },
            opposite: true
        }

    ],
        credits: {
            enabled: false
        }
    }
    
    this.highchart3YAxisLinePlusBarLabelCategoriesOptions = {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        xAxis: {
            "type": "categories",
            categories: [],
            /*"labels": {
                "format": "{value:%e %b}",
                "align": "left"
            }*/
        },
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: "#0040ff"
                    // color: "#ff4000"
                }
            },
            allowDecimals: false,
            title: {
                text: '',
                style: {
                    color: "#0040ff"
                    // color: "#ff4000"
                }
            },
            opposite: true
        }, { // Secondary yAxis
            title: {
                text: '',
                style: {
                    color: "#1abc9c"
                    // color: "rgb(31, 158, 163)"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#1abc9c"
                    // color: "rgb(31, 158, 163)"
                }
            },
            opposite: true
        },{ // Tertiary yAxis
            title: {
                text: '',
                style: {
                    color: "#f37a13"
                    // color: "rgb(124, 77, 255)"
                }
            },
            allowDecimals: false,
            labels: {
                format: '{value}',
                style: {
                    color: "#f37a13"
                    // color: "rgb(124, 77, 255)"
                }
            },
            opposite: false
        }],
        credits: {
            enabled: false
        }
    }
    
    this.highchartAreaLabelDatetimeOptions = {
        chart:{
            height: 300
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        xAxis: {
            "title": {"text":""},
            "type": "datetime",
            "labels": {
                "format": "{value:%e %b}",
                "align": "left"
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            allowDecimals: false,
            labels: {
                formatter: function () {
                    return this.value; // 1000 + 'k';
                }
            }
        },
        tooltip: {
            pointFormat: '{series.name} : <b>{point.y:,.3f}</b>'
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },    
        credits: {
            enabled: false
        }
    }

    this.highchartAreaLabelCategoriesOptions = {
        chart:{
            height: 300
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        xAxis: {
            "title": {"text":""},
            "type": "categories",
            },
        yAxis: {
            title: {
                text: ''
            },
            allowDecimals: false,
            labels: {
                formatter: function () {
                    return this.value; // 1000 + 'k';
                }
            }
        },
        tooltip: {
            pointFormat: '{series.name} : <b>{point.y:,.3f}</b>'
        },
        plotOptions: {
            area: {
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },    
        credits: {
            enabled: false
        }
    }
    
    this.highchartDrilldownStackedBarLabelCategoriesOptions ={
        chart: {
            type: 'column'
        },
        credits: {"enabled": false},
        drilldown: {
            series: null,//drilldownSeries,
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                    }
                }
            },
        },
        plotOptions: {
            column : {
                stacking : 'normal'
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'category'
        },
        tooltip: {
            //pointFormat: '<br/>CEI: <b>{point.y}</b><br/>',
        },
        yAxis: {
            allowDecimals: false,
            title:{
                //text: 'CEI'
            }
        },
        legend: {
            enabled: false
        }
    } 
    
    this.highchartScatterLabelDatetimeOptions={
        chart: {
            height: 300,
            type: 'scatter',
            zoomType: 'xy'
        },
        'legend':{maxHeight: 60},
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            "type": "datetime",
            "labels": {
                "format": "{value:%e. %b }",
                "align": "left"
            }
        },
        "credits": {
            "enabled": false
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: ""
            }
        },
        plotOptions: {
            scatter: {
                events: {
                    legendItemClick: function () {
                        return false; 
                    }
                },
                marker: {
                    symbol: 'circle',
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    xDateFormat: "%e. %b",
                    // headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: null,
                    "shared": true
                }
            }
        }
    }  

    this.highchartScatterLabelCategoriesOptions={
        chart: {
            height: 300,
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: ''
        },
        'legend':{maxHeight: 60},
        subtitle: {
            text: ''
        },
        xAxis: {
            title: {
                enabled: true,
                text: ''
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true    
        },
        "credits": {
            "enabled": false
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: ""
            }
        },
        plotOptions: {
            scatter: {
                events: {
                    legendItemClick: function () {
                        return false; 
                    }
                },
                marker: {
                    symbol: 'circle',
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x} , {point.y}',
                    "shared": true
                }
            }
        }
    }  
});