'use strict';

angular.module('specta')
    .service('flotChartOptions', function () {
        this.flotLineChartOptions = {
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
                tickSize: [2, "hour"],
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
                margin: 0
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s, x: %x, y: %y"
            }
        }
    
        this.flotLineChartDefultOptions = {
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
    
        this.flotPieChartOptions = {
            series: {
                pie: {
                    innerRadius: '00',
                    show: true
                }
            },
            grid: {
                hoverable: true
            },
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
                shifts: {
                    x: 20,
                    y: 0
                },
                defaultTheme: false
            }
        }
    
        this.flotDoughnutChartOptions = {
            series: {
                pie: {
                    innerRadius: '0',
                    show: true,
                    label:{
                        show: false
                    }
                }
            },
            grid: {
                hoverable: true,
                clickable: true
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s| %p.2 %", // show percentages, rounding to 2 decimal places
                shifts: {
                    x: 20,
                    y: 0
                },
                defaultTheme: false
            },
            legend: {
                show: false
            }
        }
        
        this.flotBarChartOptions = {
            series: {
                bars: {
                    show: true,
                    barWidth: 0.4,
                    fill: true,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0.8
                            },
                            {
                                opacity: 0.8
                            }
                        ]
                    }
                }
            },
            xaxis: {
                show: true,
                mode: 'categories',
                //timeformat: "%H:%M:%S",
                //tickSize: [1, "second"],
                //tickLength: 0,
                axisLabel: "Time",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Arial',
                axisLabelPadding: 10,
                color: "#d5d5d5",
                tickDecimals: 0
            },
            yaxis:{
                position: 'left',
                axisLabel: "Traffic",
                show: true,
                tickDecimals:1,
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
                show: true
            },
            legend: {
                show: true,
                margin: 5,
                position: "nw"
            },
            tooltip: false,
            tooltipOpts: {
                content: "x: %x.2, y: %y.2"
            },
            shifts: {
                x: 10,
                y: 0
            }
        }     
        
});