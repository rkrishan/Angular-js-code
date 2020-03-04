'use strict';

/**
 * @ngdoc service
 * @name spectaApp.GlobalConfig
 * @description
 * # GlobalConfig
 * Service in the spectaApp.
 */
angular.module('specta')
  .service('globalConfig', function ( UserProfile, $filter , $http) {
      // AngularJS will instantiate a singleton by calling "new" on this function
    var currentEnvironment = 'dev';
    // var tzOffsetms = new Date().getTimezoneOffset()*60*1000;
    var tzSite = 6;
    var tzOffset = tzSite*3600*1000;

    var dataelement = 2000;
    var currentUser = UserProfile.profileData;
    // console.log("currentUser",currentUser);
    var dev= false;
    if(currentUser.userId == "5695dac33500388c0b2f37ff")
        dev= true;

    var utcMillisec= function(){
        var today = new Date();
        var test = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),  today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), today.getUTCMilliseconds());
        // console.log('config', $filter('date')(test.getTime()+tzOffset, 'H:m:s') );
        return test.getTime()+tzOffset;
    }
    var host = location.host.split(':')[0]//'172.18.200.13'//'125.63.91.187'//'122.160.40.168'//;
    // host = '10.49.28.254'; //Dhaka
    // host = '10.49.28.18';  //shylet
    // host = '10.49.28.26';  //chGaon
    // host = '125.63.91.187'; //SNet
    // host = '172.18.200.15'; //Airtel
    // host = '202.155.152.213'; //IM2
    // host = '10.0.0.11'; //e1




    var colorPalette = ['#f15c80', '#f7a35c','#1F9EA3', '#64DDBB', '#7C4DFF', '#C25396','#f1c40f', '#92F22A',   '#97CE68', '#897FBA','#e74c3c', '#2C82C9', '#83D6DE',   '#14967C'];
    var colorPaletteFlotChart = ["blue", "grey", "red", "purple", 
                        "rgba(253,180,92,1)", "green", "rgba(77,83,96,1)", "#B6B6B6" , 
                        "#212121", "#FFC107", "#D32F2F", "#7C4DFF"];
    var colorPaletteBarChart =['#f15c80', '#f7a35c','#1F9EA3', '#64DDBB', '#7C4DFF', '#C25396','#f1c40f', '#92F22A',   '#97CE68', '#897FBA','#e74c3c', '#2C82C9', '#83D6DE',   '#14967C'];
    var colorPaletteSegment= {  Platinum:'#7C4DFF',
                                Gold: '#f1c40f',
                                Silver: '#83D6DE',
                                Youth: '#14967C',
                                Business: '#e74c3c',
                                Enterprice: '#C25396',
                                Genetal: '#EC644B',
                                Prepaid: '#2C82C9',
                                Postpaid: '#f15c80'
                            };
    //['#897FBA','#1F9EA3', '#97CE68', '#92F22A',  '#64DDBB', ,, '#D24D57'];

    var iboxTimeout= '500'; 

    var alertColorPalette = {high:'#e74c3c', medium: '#f5882b', low: '#e8a0a0'}

    var config = {
        'dev': {
            alertColorPalette      : alertColorPalette,
            host                   : 'http://'+host,
            mapIcon                : 'http://' + host + ':8080',
            dataapiurl             : 'http://'+host+':8080/DataAPITest/UIListener?',
            datatablesapiurl       : 'http://'+host+':8080/DataAPITest/MListener?action=collections',
            downloadListener       : 'http://'+host+':8080/DataAPITest/DownloadListener?trxid=',
            eventServerHost        : host,
            eventServerPort        : 8000,
            //eventServerPath      : "/",
            
            snapshoturl            : 'http://'+host+':4000/snapshots/',
            snapshoturlNew         : 'http://'+host+':8080/DataAPITest/UISnapshot?',
            
            pullDataUrl            : 'http://'+host+':8080/DataAPITest',
            pullgetcolumn          : 'http://'+host+':8080/DataAPITest/MListener?action=getcolumn&id=',
            pullvalidateqry        : 'http://'+host+':8080/DataAPITest/MListener?action=validate&qry=',
            pullsaveqry            : 'http://'+host+':8080/DataAPITest/MListener?action=savequery&id=',
            pulldataurl            : 'http://'+host+':8080/DataAPITest/MListener?action=query&id=',
            pulldataurlbyname      : 'http://'+host+':8080/DataAPITest/MListener?action=query&name=',
            pulldatabyRlistener    : 'http://'+host+':8080/DataAPITest/RListener?action=',
            pulldatabyMlistener    : 'http://'+host+':8080/DataAPITest/MListener?action=',
            clistener              : 'http://'+host+':8080/DataAPITest/CListener?action=query&cid=',
            downloadCSR: 'http://'+host+':8080/DataAPITest/DownloadCSR?customerid=',
            clistenervps           : "http://"+host+":8080/DataAPITest/CListener?action=querysession&key=",
            clistenerMobility      : 'http://'+host+':8080/DataAPITest/CListenerMobility?action=query&cid=',
            clistenervpsMobility   : "http://"+host+":8080/DataAPITest/CListenerMobility?action=querysession&key=",
            pullfilterdataurl      : 'http://'+host+':8080/DataAPITest/MListener?action=filterquery&id=',
            pullfilterdataurlbyname: 'http://'+host+':8080/DataAPITest/MListener?action=filterquery&name=',
            dataurl                : 'http://'+host+':8080/DataAPITest/listener?action=query&id=',
            tzAdjustment           : tzOffset,
            dataelement            : dataelement,
            // googleMapsUrl       : 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCskD_h5opa50mYt350B4mrRzYrrrrSls4',
            tzoffset               : tzOffset,
            colorpalette           : colorPalette,
            colorpaletteFlotChart  : colorPaletteFlotChart,
            colorpaletteBarChart   : colorPaletteBarChart,
            iboxTimeout            : iboxTimeout,
            updateTime             : utcMillisec,
            getLocalTime           : utcMillisec,
            isOnline               : true,
            md5Password            : true,
            categoryIcon           : ['fa-line-chart', 'fa-pie-chart', 'fa-area-chart', 'fa-bar-chart', 'fa-crosshairs', 'fa-calendar', 'fa-bars', 'fa-external-link-square'],
            dev                    : dev,
            OLTorDSLAM             : 'OLT',
            defaultDecimal         : 3,
            csrDuration            : 7,
            lookup                 : {
                                        CEI: [{value: 'Pathetic', color: '#000'}, {value: 'Poor', color: '#f15c80'}, {value: 'Good', color: '#f7a35c'}, {value: 'Very Good', color: '#333'}, {value: 'Excellent', color: '#1F9EA3'}]
                                     }
        }
    };
    //console.log(config[currentEnvironment]);

    // var url = dbService.makeUrl({collection: ' system_config', op:'select'});
    $http.get('http://'+host+':8080/DataAPITest/UIListener?'+'collection=system_config&op=select&db=datadb').success(function(res){
        console.log(res);
        res = res[0]
        if(res.length>0)
            {
                config[currentEnvironment].circle         = res.circle;
                config[currentEnvironment].circleid       = res.circleid;
                config[currentEnvironment].country        = res.country;
                config[currentEnvironment].defaultDecimal = res.defdecimal;
                config[currentEnvironment].operator       = res.operator;
                config[currentEnvironment].tzAdjustment   = (res.tzoffset) ? res.tzoffset.tzval*3600*1000 : tzoffset;
                config[currentEnvironment].OLTorDSLAM     = res.nodedesc;
            }
        // console.log(config);
    })
    // console.log('url', url);
    return config[currentEnvironment];

});

