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
    var tzSite ;
    var tzOffset = tzSite*3600*1000;
    var dataelement = 2000;
    var iboxTimeout= '500';

    var currentUser = UserProfile.profileData;
    // console.log("currentUser",currentUser);
    var dev= false;
    if(currentUser.userId == "5695dac33500388c0b2f37ff")
        dev= true;

    // returns millisecods with current timezone offset
    var utcMillisec= function(){
        tzOffset = tzSite*3600*1000;
        var today = new Date();
        var test = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),  today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), today.getUTCMilliseconds());
        // console.log('config', $filter('date')(test.getTime()+tzOffset, 'H:m:s') );
        return test.getTime()+tzOffset;
    }

    // enter host
    var host = location.host.split(':')[0];
    // host= '122.160.40.168' //pinnacleGlobal
    // host = '10.0.0.14'; //e1
    // host = '10.49.28.254'; //Dhaka
    // host = '10.49.28.18';  //shylet
    // host = '10.49.28.26';  //chGaon
    // host = '125.63.91.187'; //SNet
    // host = '172.18.200.15'; //Airtel
    // host = '202.155.152.213'; //IM2
    

    // colorpalette
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
                            }; //['#897FBA','#1F9EA3', '#97CE68', '#92F22A',  '#64DDBB', ,, '#D24D57'];

    var alertColorPalette = {high:'#e74c3c', medium: '#f5882b', low: '#e8a0a0'}

    // Config Object
    var config = {
        'dev': {
            alertColorPalette      : alertColorPalette,
            host                   : 'https://'+host,
            mapIcon                : 'https://' + host + ':8080',
            dataapiurl             : 'https://'+host+':8080/DataAPITest/UIListener?',
            datatablesapiurl       : 'https://'+host+':8080/DataAPITest/MListener?action=collections',
            downloadListener       : 'https://'+host+':8080/DataAPITest/DownloadListener?trxid=',
            eventServerHost        : host,
            eventServerPort        : 8000,
            snapshoturl            : 'https://'+host+':4000/snapshots/',
            snapshoturlNew         : 'https://'+host+':8080/DataAPITest/UISnapshot?',
            pullDataUrl            : 'https://'+host+':8080/DataAPITest',
            pullgetcolumn          : 'https://'+host+':8080/DataAPITest/MListener?action=getcolumn&id=',
            pullvalidateqry        : 'https://'+host+':8080/DataAPITest/MListener?action=validate&qry=',
            pullsaveqry            : 'https://'+host+':8080/DataAPITest/MListener?action=savequery&id=',
            pulldataurl            : 'https://'+host+':8080/DataAPITest/MListener?action=query&id=',
            pulldataurlbyname      : 'https://'+host+':8080/DataAPITest/MListener?action=query&name=',
            pulldatabyRlistener    : 'https://'+host+':8080/DataAPITest/RListener?action=',
            pulldatabyMlistener    : 'https://'+host+':8080/DataAPITest/MListener?action=',
            clistener              : 'https://'+host+':8080/DataAPITest/CListener?action=query&cid=',
            downloadCSR: 'https://'+host+':8080/DataAPITest/DownloadCSR?customerid=',
            clistenervps           : "https://"+host+":8080/DataAPITest/CListener?action=querysession&key=",
            clistenerMobility      : 'https://'+host+':8080/DataAPITest/CListenerMobility?action=query&cid=',
            clistenervpsMobility   : "https://"+host+":8080/DataAPITest/CListenerMobility?action=querysession&key=",
            pullfilterdataurl      : 'https://'+host+':8080/DataAPITest/MListener?action=filterquery&id=',
            pullfilterdataurlbyname: 'https://'+host+':8080/DataAPITest/MListener?action=filterquery&name=',
            dataurl                : 'https://'+host+':8080/DataAPITest/listener?action=query&id=',
            tzAdjustment           : tzOffset,
            dataelement            : dataelement,
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
            // defaultDecimal         : 3,
            // csrDuration            : 7,
            lookup                 : {
                                        CEI: [
                                            {value: 'Pathetic', color: '#db0a26'}, 
                                            {value: 'Poor', color: '#fb250d'},
                                            {value: 'Bad', color: 'rgb(255,28,28)'}, 
                                            {value: 'Good', color: '#edfb0d'},
                                            {value: 'Average', color: '#f05bd0'}, 
                                            {value: 'VeryGood', color: '#1e63a2'}, 
                                            {value: 'Excellent', color: '#0dfb59'}
                                        ]
                                     }
        }
    };
    //console.log(config[currentEnvironment]);

    // getting config from db
    // var url = dbService.makeUrl({collection: ' system_config', op:'select'});
    $http.get('https://'+host+':8080/DataAPITest/UIListener?'+'collection=system_config&op=select&db=datadb').success(function(res){
        console.log(res);
        if(res.length>0)
            {
                res = angular.copy(res[0]);
                config[currentEnvironment].circle         = res.circle;
                config[currentEnvironment].circleid       = res.circleid;
                config[currentEnvironment].country        = res.country;
                config[currentEnvironment].defaultDecimal = res.defdecimal;
                config[currentEnvironment].operator       = res.operator;
                config[currentEnvironment].csrDuration    = res.csrDuration;
                tzSite= res.tzoffset.tzval;
                config[currentEnvironment].getLocalTime    = utcMillisec();
                config[currentEnvironment].updateTime    = utcMillisec;
                config[currentEnvironment].tzoffset    = (res.tzoffset) ? res.tzoffset.tzval*3600*1000 : tzoffset;
                config[currentEnvironment].tzAdjustment   = (res.tzoffset) ? res.tzoffset.tzval*3600*1000 : tzoffset;
                config[currentEnvironment].OLTorDSLAM     = res.nodedesc.trim();
            }
    })
    
    // return current enviorment object
    return config[currentEnvironment];
});

