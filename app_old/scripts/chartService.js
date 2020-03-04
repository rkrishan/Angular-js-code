'use strict';

angular.module('specta')
    .service('flotChrtOptions', function () {
    this.flotLineChrtOptions = {
        series: {
            lines: {
                show: true,
                lineWidth: 2,
                fill: true,
                fillColor: {
                    colors: [
                        {
                            opacity: 0.0
                        },
                        {
                            opacity: 0.0
                        }
                    ]
                }
            }
        },
        xaxis: {
            show: true,
            mode: "time",
            tickSize: [1, "day"],
            tickLength: 0,
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Arial',
            axisLabelPadding: 10,
            color: "#d5d5d5"
        },
        yaxis:{
            position: 'left',
            show: true,
            min:0
        },
        colors: ["#1ab394"],
        grid: {
            color: "#999999",
            hoverable: true,
            clickable: true,
            tickColor: "#D4D4D4",
            borderWidth: 0
        },
        legend: {
            show: true,
            margin: 5
        },
        tooltip: true,
        tooltipOpts: {
            content: "%s, x: %x, y: %y"
        }
    }
    
    this.flotLineChrtDefultOptions = {
        series: {
            lines: {
                show: false
            }
        },
        points: {
            show: false
        },
        grid: {
            show:false
        },
        legend:{
            show: false
        }
    }
});