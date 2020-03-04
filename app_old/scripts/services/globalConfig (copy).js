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
    var currentEnvironment = 'dev_BB';
    var tzOffsetms = new Date().getTimezoneOffset()*60*1000;
    var tzOffset = 5.5*3600*1000;
    var prodtzOffset = 6*3600*1000;
    var dataelement = 2000;
    var host = location.host.split(':')[0];
    //var host = location.host;
    
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
                        
    var config = {
        'prod': {
            dataapiurl: 'http://27.147.153.186:3001/spectaUI',
            datatablesapiurl: 'http://27.147.153.186:8080/JRServer/MListener?action=collections',
            eventServerHost: '27.147.153.186',
            eventServerPort: 8000,
            eventServerPath: "/",
            snapshoturl:'http://27.147.153.186:4000/snapshots/',
            pullDataUrl : 'http://27.147.153.186:8080/JRServer',
            tzAdjustment : 5.5 * 3600 * 1000,
            pullgetcolumn : 'http://27.147.153.186:8080/JRServer/MListener?action=getcolumn&id=',
            pullvalidateqry : 'http://27.147.153.186:8080/JRServer/MListener?action=validate&qry=',
            pullsaveqry : 'http://27.147.153.186:8080/JRServer/MListener?action=savequery&id=',
            pulldataurl : 'http://27.147.153.186:8080/JRServer/MListener?action=query&id=',
            pulldataurlbyname : 'http://27.147.153.186:8080/JRServer/MListener?action=query&name=',

            pullfilterdataurl : 'http://27.147.153.186:8080/JRServer/MListener?action=filterquery&id=',
            pullfilterdataurlbyname : 'http://27.147.153.186:8080/JRServer/MListener?action=filterquery&name=',
            dataurl: 'http://27.147.153.186:8080/JRServer/listener?action=query&id=',
            dataelement : dataelement,
            clistener : "http://27.147.153.186:8080/JRServer/CListener?action=query&dev=true&cid=",
            clistenervps : "http://27.147.153.186:8080/JRServer/CListener?action=querysession&key=",
            googleMapsUrl: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4',
            tzoffset: prodtzOffset,
            colorpalette: colorPalette,
            colorpaletteFlotChart: colorPaletteFlotChart,
            colorpaletteBarChart: colorPaletteBarChart,
            userSelector: 'Circle',
            jsonParse: function(data){
                var tmp = JSON.parse(data);
                return jQuery.parseJSON(tmp);
            }
        },
        'staging': {
            dataapiurl: 'http://27.147.153.186:3001/spectaUI',
            datatablesapiurl: 'http://27.147.153.186:8080/JRServer/MListener?action=collections',
            eventServerHost: '27.147.153.186',
            eventServerPort: 8000,
            eventServerPath: "/",
            snapshoturl:'http://27.147.153.186:4000/snapshots/',
            pullDataUrl : 'http://27.147.153.186:8080/JRServer',
            tzAdjustment : 5.5 * 3600 * 1000,
            pullgetcolumn : 'http://27.147.153.186:8080/JRServer/MListener?action=getcolumn&id=',
            pullvalidateqry : 'http://27.147.153.186:8080/JRServer/MListener?action=validate&qry=',
            pullsaveqry : 'http://27.147.153.186:8080/JRServer/MListener?action=savequery&id=',
            pulldataurl : 'http://27.147.153.186:8080/JRServer/MListener?action=query&id=',
            pulldataurlbyname : 'http://27.147.153.186:8080/JRServer/MListener?action=query&name=',

            pullfilterdataurl : 'http://27.147.153.186:8080/JRServer/MListener?action=filterquery&id=',
            pullfilterdataurlbyname : 'http://27.147.153.186:8080/JRServer/MListener?action=filterquery&name=',
            dataurl: 'http://27.147.153.186:8080/JRServer/listener?action=query&id=',
            dataelement : dataelement,

            googleMapsUrl: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4',
            tzoffset: prodtzOffset,
            colorpalette: colorPalette,
            colorpaletteFlotChart: colorPaletteFlotChart,
            colorpaletteBarChart: colorPaletteBarChart,
            jsonParse: function(data){
                var tmp = JSON.parse(data);
                return jQuery.parseJSON(tmp);
            }
        },
        'dev_BB': {
            host: 'http://'+host,
            dataapiurl: 'http://'+host+':8080/JRServer/UIListener?',
            datatablesapiurl: 'http://'+host+':8080/JRServer/MListener?action=collections',
            eventServerHost: host,
            eventServerPort: 8000,
            eventServerPath: "/",
            
            snapshoturl: 'http://'+host+':4000/snapshots/',
            snapshoturlNew: 'http://'+host+':8080/JRServer/UISnapshot?',
            
            pullDataUrl: 'http://'+host+':8080/JRServer',
            pullgetcolumn : 'http://'+host+':8080/JRServer/MListener?action=getcolumn&id=',
            pullvalidateqry : 'http://'+host+':8080/JRServer/MListener?action=validate&qry=',
            pullsaveqry : 'http://'+host+':8080/JRServer/MListener?action=savequery&id=',
            pulldataurl : 'http://'+host+':8080/JRServer/MListener?action=query&id=',
            pulldataurlbyname : 'http://'+host+':8080/JRServer/MListener?action=query&name=',
            pulldatabyRlistener: 'http://'+host+':8080/JRServer/RListener?action=',
            pulldatabyMlistener: 'http://'+host+':8080/JRServer/MListener?action=',

            pullfilterdataurl : 'http://'+host+':8080/JRServer/MListener?action=filterquery&id=',
            pullfilterdataurlbyname : 'http://'+host+':8080/JRServer/MListener?action=filterquery&name=',
            dataurl: 'http://'+host+':8080/JRServer/listener?action=query&id=',
            tzAdjustment : tzOffset,
            dataelement : dataelement,
            googleMapsUrl: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4',
            tzoffset: tzOffset,
            colorpalette: colorPalette,
            colorpaletteFlotChart: colorPaletteFlotChart,
            colorpaletteBarChart: colorPaletteBarChart
        },
        'dev_mobility': {
            dataapiurl: 'http://122.160.40.168:3001/spectaUI',
            datatablesapiurl: 'http://122.160.40.168:8080/JRServer/MListener?action=collections',
            eventServerHost: '122.160.40.168',
            eventServerPort: 8000,
            eventServerPath: "/",
            snapshoturl:'http://122.160.40.168:4000/snapshots/',
            pullDataUrl : 'http://122.160.40.168:8080/JRServer',
            tzAdjustment : 5.5 * 3600 * 1000,
            pullgetcolumn : 'http://122.160.40.168:8080/JRServer/MListener?action=getcolumn&id=',
            pullvalidateqry : 'http://122.160.40.168:8080/JRServer/MListener?action=validate&qry=',
            pullsaveqry : 'http://122.160.40.168:8080/JRServer/MListener?action=savequery&id=',
            pulldataurl : 'http://122.160.40.168:8080/JRServer/MListener?action=query&id=',
            pulldataurlbyname : 'http://122.160.40.168:8080/JRServer/MListener?action=query&name=',

            pullfilterdataurl : 'http://122.160.40.168:8080/JRServer/MListener?action=filterquery&id=',
            pullfilterdataurlbyname : 'http://122.160.40.168:8080/JRServer/MListener?action=filterquery&name=',
            dataurl: 'http://122.160.40.168:8080/JRServer/listener?action=query&id=',
            clistener : "http://122.160.40.168:8080/JRServer/CListenerMobility?action=query&cid=",
            clistenervps : "http://122.160.40.168:8080/JRServer/CListenerMobility?action=querysession&key=",
            dataelement : dataelement,
            googleMapsUrl: 'https://maps.google122.160.40.168s.com/maps/122.160.40.168/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4',
            tzoffset: tzOffset,
            colorpalette: colorPalette,
            colorpaletteFlotChart: colorPaletteFlotChart,
            colorpaletteBarChart: colorPaletteBarChart,
            userSelector: 'Circle',
            jsonParse: function(data){
                var tmp = JSON.parse(data);
                return jQuery.parseJSON(tmp);
            }
        },
        'aws_mobility': {
            dataapiurl: 'http://52.8.81.188:3001/spectaUI',
            datatablesapiurl: 'http://52.8.81.188:8080/JRServer/MListener?action=collections',
            eventServerHost: '52.8.81.188',
            eventServerPort: 8000,
            eventServerPath: "/",
            snapshoturl:'http://52.8.81.188:4000/snapshots/',
            pullDataUrl : 'http://52.8.81.188:8080/JRServer',
            tzAdjustment : 5.5 * 3600 * 1000,
            pullgetcolumn : 'http://52.8.81.188:8080/JRServer/MListener?action=getcolumn&id=',
            pullvalidateqry : 'http://52.8.81.188:8080/JRServer/MListener?action=validate&qry=',
            pullsaveqry : 'http://52.8.81.188:8080/JRServer/MListener?action=savequery&id=',
            pulldataurl : 'http://52.8.81.188:8080/JRServer/MListener?action=query&id=',
            pulldataurlbyname : 'http://52.8.81.188:8080/JRServer/MListener?action=query&name=',
            clistener : "http://52.8.81.188:8080/JRServer/CListenerMobility?action=query&cid=",
            clistenervps : "http://52.8.81.188:8080/JRServer/CListenerMobility?action=querysession&key=",
            pullfilterdataurl : 'http://52.8.81.188:8080/JRServer/MListener?action=filterquery&id=',
            pullfilterdataurlbyname : 'http://52.8.81.188:8080/JRServer/MListener?action=filterquery&name=',
            dataurl: 'http://52.8.81.188:8080/JRServer/listener?action=query&id=',
            dataelement : dataelement,
            googleMapsUrl: 'https://maps.google122.160.40.168s.com/maps/122.160.40.168/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4',
            tzoffset: tzOffset,
            colorpalette: colorPalette,
            colorpaletteFlotChart: colorPaletteFlotChart,
            colorpaletteBarChart: colorPaletteBarChart,
            userSelector: 'Circle'
        }
    };
    //console.log(config[currentEnvironment]);
    return config[currentEnvironment];

});