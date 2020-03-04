'use strict';

/**
 * @ngdoc service
 * @name spectaApp.GlobalConfig
 * @description
 * # GlobalConfig
 * Service in the spectaApp.
 */
angular.module('specta')
  .service('globalConfig', function () {
      // AngularJS will instantiate a singleton by calling "new" on this function
    var currentEnvironment = 'dev';
    var tzOffsetms = new Date().getTimezoneOffset()*60*1000;
    var tzOffset = 5.5*3600*1000;
    var prodtzOffset = 6*3600*1000;
    var dataelement = 2000;
    var host = location.host.split(':')[0];//'10.0.0.19'//'122.160.40.168'//
    
    var colorPalette = ["blue", "grey", "red", "purple", 
                        "rgba(253,180,92,1)", "green", "rgba(77,83,96,1)", "#B6B6B6" , 
                        "#212121", "#FFC107", "#D32F2F", "#7C4DFF"];
    var colorPaletteFlotChart = ["blue", "grey", "red", "purple", 
                        "rgba(253,180,92,1)", "green", "rgba(77,83,96,1)", "#B6B6B6" , 
                        "#212121", "#FFC107", "#D32F2F", "#7C4DFF"];
    var colorPaletteBarChart = ["rgba(151,187,205,1)", "rgba(220,220,220,1)", 
                        "rgba(247,70,74,1)", "rgba(70,191,189,1)", "rgba(253,180,92,1)", 
                        "rgba(148,159,177,1)", "rgba(77,83,96,1)", "#B6B6B6" , "#212121", 
                        "#FFC107", "#D32F2F", "#7C4DFF"];
    var iboxTimeout= '500';                    
    var config = {
        'dev': {
            host: 'http://'+host,
            dataapiurl: 'http://'+host+':9090/JRServer/UIListener?',
            datatablesapiurl: 'http://'+host+':9090/JRServer/MListener?action=collections',
            eventServerHost: host,
            eventServerPort: 9800,
            //eventServerPath: "/",
            
            snapshoturl: 'http://'+host+':9040/snapshots/',
            snapshoturlNew: 'http://'+host+':9090/JRServer/UISnapshot?',
            
            pullDataUrl: 'http://'+host+':9090/JRServer',
            pullgetcolumn : 'http://'+host+':9090/JRServer/MListener?action=getcolumn&id=',
            pullvalidateqry : 'http://'+host+':9090/JRServer/MListener?action=validate&qry=',
            pullsaveqry : 'http://'+host+':9090/JRServer/MListener?action=savequery&id=',
            pulldataurl : 'http://'+host+':9090/JRServer/MListener?action=query&id=',
            pulldataurlbyname : 'http://'+host+':9090/JRServer/MListener?action=query&name=',
            pulldatabyRlistener: 'http://'+host+':9090/JRServer/RListener?action=',
            pulldatabyMlistener: 'http://'+host+':9090/JRServer/MListener?action=',

            pullfilterdataurl : 'http://'+host+':9090/JRServer/MListener?action=filterquery&id=',
            pullfilterdataurlbyname : 'http://'+host+':9090/JRServer/MListener?action=filterquery&name=',
            dataurl: 'http://'+host+':9090/JRServer/listener?action=query&id=',
            tzAdjustment : tzOffset,
            dataelement : dataelement,
            googleMapsUrl: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4',
            tzoffset: tzOffset,
            colorpalette: colorPalette,
            colorpaletteFlotChart: colorPaletteFlotChart,
            colorpaletteBarChart: colorPaletteBarChart,
            iboxTimeout: iboxTimeout
        },
    };
    //console.log(config[currentEnvironment]);
    return config[currentEnvironment];

});