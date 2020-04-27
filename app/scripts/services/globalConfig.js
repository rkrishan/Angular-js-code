// 'use strict';

/**
 * @ngdoc service
 * @name spectaApp.GlobalConfig
 * @description
 * # GlobalConfig
 * Service in the spectaApp. // var options = { port: 9000, hostname: '10.0.0.14' };
    var options = { port: 9000, hostname: '10.0.0.14' };
    
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
     var options = { port: 9000, hostname: '10.0.0.14' };
  
    
    // enter host
    var host = location.host.split(':')[0];
    //  var host = location.hostname;
    // var host = "Address of the IP for socket cluster removig error"
    //  var host = '10.0.0.54'   // Testing server
    // var host = '192.168.210.5' // Mumbai
    // var host = '10.49.28.18'    // shylet
    // var host ='10.49.28.26'        // CTG
    // var host = '192.168.82.11' // Banglore
    // var host = '10.49.28.254'     // Dhaka


    // $scope.circles= [{circle: 'Bangluru'},{circle: 'Mumbai'}];

    // $scope.circles= [{circle: 'Dhaka'},{circle: 'Chittagong'},{circle: 'Sylhet'},{circle: 'Khulna'},{circle: 'Rajshahi'}];
  
    
    // console.log('location.host', host);
    // host= '122.160.40.168' //pinnacleGloba // var options = { port: 9000, hostname: '10.0.0.14' };
    var options = { port: 9000, hostname: '10.0.0.14' };
    
    // host = '10.0.0.11'; //e1
    // host = '10.0.0.12'; //e1
    // host = '10.0.0.16'; //e1 demo
    // host = '10.49.28.250'; //link3 central // var options = { port: 9000, hostname: '10.0.0.14' };
    var options = { port: 9000, hostname: '10.0.0.14' };
    
    // host = '10.49.28.254'; //Dhaka
    // host = '10.49.28.18';  //shylet
    // host = '10.49.28.26';  //chGaon
    // host = '10.49.28.130';  //Rajshahi
    // host = '125.63.91.187'; //SNet
    // host = '172.18.200.15'; //Airtel
    // host = '110.34.24.18'; //Nepal
    // host = '192.168.210.5' ; // Mumbai
     host = '192.168.82.11' ; // Banglore 
    //   host = '182.71.197.195' // EWAY
    // host = '10.49.28.250';  //link3 -central
    // host= '202 // var options = { port: 9000, hostname: '10.0.0.14' };
    // host = '10.0.0.54'; //14
    var options = { port: 9000, hostname: '10.0.0.14' };
    
    // host= '192 // var options = { port: 9000, hostname: '10.0.0.14' };
    var options = { port: 9000, hostname: '10.0.0.14' };
    
    // host = '20 // var options = { port: 9000, hostname: '10.0.0.14' };
    var options = { port: 9000, hostname: '10.0.0.14' };
    
    var port= ''; // var options = { port: 9000, hostname: '10.0.0.14' };
    var options = { port: 9000, hostname: '10.0.0.14' };
    
    if(host=='122.160.40.168')
    	port= '9090'
    else
    	port= '8080' 
    

    
    // This hostURL Name should changed according to local server or server 
    //All Site URL
    //Bangluru.url=http://192.168.82.11:8080;

     var hostURL= 'http://'+ host +':'+port+'/DataAPI';


    // colorpalette
    var colorPalette = ['#f15c80', '#f7a35c','#1F9EA3', '#64DDBB', '#7C4DFF', '#C25396','#f1c40f', '#92F22A',   '#97CE68', '#897FBA','#e74c3c', '#2C82C9', '#83D6DE',   '#14967C'];

    var colorPaletteFlotChart = ["blue", "grey", "red", "purple","rgba(253,180,92,1)", "green", "rgba(77,83,96,1)", "#B6B6B6" ,"#212121", "#FFC107", "#D32F2F", "#7C4DFF"];
    
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
            UIVersion              : '1.0.1',
            ShowAAA                :  true, // true(TATA),false(LINK3)
            zoneSize               :  10,
            citySize               :  20,
            citySize_Pot           :  30,
            areaSize               :  20,
            areaSize_Pot           :  30,
            planSize               :  20,
            planSize_Pot           :  30,
            nodeSize               :  20,
            adjustTime             :  330*60*1000, 
            alertColorPalette      :  alertColorPalette,
            host                   : 'http://'+host,
            mapIcon                : 'http://' + host + ':8080',
            NListener              :  hostURL+'/NListener',
            CepListener            :  hostURL+'/CepListener?',
            // dataapiurl             :  'http://10.0.0.11:8080/DataAPI'+'/UIListener?',
            dataapiurl             :  hostURL+'/UIListener?',
            dataapitrackurl        :  hostURL+'/UAListener?',
            datatablesapiurl       :  hostURL+'/MListener?action=collections',
            tableApiurl            :  hostURL+'/UIListener?collection=',
            downloadListener       :  hostURL+'/DownloadListener?trxid=',
            eventServerHost        :  host,
            eventServerPort        :  8000,
            snapshoturl            : 'http://'+host+':4000/snapshots/',
            snapshoturlNew         :  hostURL+'/UISnapshot?',
            pullIListener          :  hostURL+'/IListener?action=filterquery&id=',
            pullDataUrl            :  hostURL,
            pullgetcolumn          :  hostURL+'/MListener?action=getcolumn&id=',
            pullvalidateqry        :  hostURL+'/MListener?action=validate&qry=',
            pullsaveqry            :  hostURL+'/MListener?action=savequery&id=',
            pulldataurl            :  hostURL+'/MListener?action=query&id=',
            pulldataurlbyname      :  hostURL+'/MListener?action=query&name=',
            pulldatabyRlistener    :  hostURL+'/RListener?action=',
            pulldatabyMlistener    :  hostURL+'/MListener?action=',
            clistener              :  hostURL+'/CListener?action=query&cid=',
            clistenerAAA           :  hostURL+'/CListenerAAA?action=query&cid=',
            downloadCSR            :  hostURL+'/DownloadCSR?customerid=',
            clistenervps           :  hostURL+"/CListener?action=querysession&key=",
            clistenerMobility      :  hostURL+'/CListenerMobility?action=query&cid=',
            clistenervpsMobility   :  hostURL+"/CListenerMobility?action=querysession&key=",
            pullfilterdataurl      :  hostURL+'/MListener?action=filterquery&id=',
            pullfilterdataurlbyname:  hostURL+'/MListener?action=filterquery&name=',
            dataurl                :  hostURL+'/listener?action=query&id=',
            forecastHistoricDataURL:  hostURL+'/CommonListener?action=olt&file=',
            forecastDataURL        :  hostURL+'/CommonListener?action=demo&file=',
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
            // depType                : 'F',
            defaultDecimal         : 3,
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
    $http.get(hostURL+'/UIListener?'+'collection=system_config&op=select&db=datadb').success(function(res){
        // console.log(res);
        if(res.length>0)
            {
                res = angular.copy(res[0]);
                // console.log("inside response",res);
                config[currentEnvironment].circle         = res.circle;
                config[currentEnvironment].circleid       = res.circleid;
                config[currentEnvironment].country        = res.country;
                config[currentEnvironment].defaultDecimal = res.defdecimal;
                config[currentEnvironment].operator       = res.operator;
                config[currentEnvironment].csrDuration    = res.csrDuration;
                tzSite= res.tzoffset.tzval;
                config[currentEnvironment].getLocalTime    = utcMillisec;
                config[currentEnvironment].updateTime    = utcMillisec;
                config[currentEnvironment].tzoffset    = (res.tzoffset) ? res.tzoffset.tzval*3600*1000 : tzoffset;
                config[currentEnvironment].tzAdjustment   = (res.tzoffset) ? res.tzoffset.tzval*3600*1000 : tzoffset;
                config[currentEnvironment].OLTorDSLAM     = res.nodedesc.trim();
                config[currentEnvironment].depType     = (res.deploymenttype) ? res.deploymenttype : 'F';
                config[currentEnvironment].lat     = (res.latitude) ? res.latitude : "28.6139";
                config[currentEnvironment].lng    = (res.longitude) ? res.longitude : "77.2090";
                config[currentEnvironment]['isOnline']  = res.isOnline ? res.isOnline: true;
                config[currentEnvironment]['site']  = (res.site) ? res.site: null;
                config[currentEnvironment]['fromDate']     = (res.fromDate) ? res.fromDate : 'F';
                config[currentEnvironment]['toDate']     = (res.toDate) ? res.toDate : 'F';
            }
    })
    
    // return current enviorment object
    return config[currentEnvironment];
});

