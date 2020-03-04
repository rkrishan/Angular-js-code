angular.module('specta')
  .controller('ProbeConfigCtrl', function ($scope, $state, $stateParams, SweetAlert, UserProfile, dbService, httpService){
  	
  	$scope.ProbeConfigObj= {};
  	
  	$scope.ProbeConfigObj.IP_PROBE= false;
  	$scope.ProbeConfigObj.RADIUS_PROBE= false;
  	$scope.ProbeConfigObj.GN_PROBE= false;
  	$scope.ProbeConfigObj.OPERATOR_ID= null;
  	$scope.ProbeConfigObj.OPERATOR_NAME= '';
  	$scope.ProbeConfigObj.PROBE_ID= null;
  	$scope.ProbeConfigObj.LOG_LEVEL= null;
  	$scope.ProbeConfigObj.PRINT_STATS= false;
  	$scope.ProbeConfigObj.PRINT_STATS_FREQ_SEC= null;
  	$scope.ProbeConfigObj.LOG_STATS_FREQ_SEC= null;
  	$scope.ProbeConfigObj.DUMP_MAC= false;
  	$scope.ProbeConfigObj.XDR_DIR= '';
  	$scope.ProbeConfigObj.LOG_DIR= '';
  	$scope.ProbeConfigObj.DATA_DIR= '';
  	$scope.ProbeConfigObj.ADMIN_FLAG= false;
  	$scope.ProbeConfigObj.ADMIN_PORT= '';
  	//$scope.ProbeConfigObj.ActiveInterface= null;
  	$scope.ProbeConfigObj.ETHERNET_INTERFACE= null;
  	$scope.ProbeConfigObj.SOLAR_INTERFACE= null;
  	$scope.ProbeConfigObj.SOLARFLARE_HW_TIMESTAMP= false;
  	$scope.ProbeConfigObj.MAX_PKT_LEN_PER_INTERFACE= '';
  	//$scope.ProbeConfigObj.PACKET_DISTRIBUTION= 0;
  	$scope.ProbeConfigObj.PPS_PER_INTERFACE= '';
  	$scope.ProbeConfigObj.PPS_CAP_PERCENTAGE= '';
  	$scope.ProbeConfigObj.ROUTER_PER_INTERFACE= '';
  	$scope.ProbeConfigObj.PKT_LISTENER_CPU_CORE= '';
  	$scope.ProbeConfigObj.PKT_ROUTER_CPU_CORE= '';
  	$scope.ProbeConfigObj.DIRECTION_ON_MAC= false;
  	$scope.ProbeConfigObj.SOURCE_MAC= '';
  	$scope.ProbeConfigObj.DESTINATION_MAC= '';
  	$scope.ProbeConfigObj.IPV4_RANGE= '';
  	$scope.ProbeConfigObj.IPV6_RANGE= '';
  	$scope.ProbeConfigObj.SESSION_MANAGER_TIMEINDEX= 10;
  	$scope.ProbeConfigObj.SESSION_MANAGER_WRITE_INDEX_ADV= 2;
  	$scope.ProbeConfigObj.IP_SESSION_TIME_INDEX_PKT_LIMIT= 80000;
  	$scope.ProbeConfigObj.IP_SESSION_FLUSH_TIME_INDEX_REPO_SIZE= 200000;
  	$scope.ProbeConfigObj.IP_SESSION_PKT_LIMIT= 5000;
  	$scope.ProbeConfigObj.IP_SESSION_TIME_LIMIT= 300;
  	$scope.ProbeConfigObj.IP_SESSION_CLEAN_UP_SCAN_FREQ_SEC= 15;
  	$scope.ProbeConfigObj.IP_SESSION_CLEAN_UP_BATCH_LIMIT= 50000;
  	$scope.ProbeConfigObj.IP_SESSION_CLEAN_UP_TIMEOUT_SEC= 120;
  	$scope.ProbeConfigObj.DNS_LOOKUPDB_CLEAN_UP_TIMEOUT_SEC= 900;
  	$scope.ProbeConfigObj.DNS_KEY_WORDS= null;
  	$scope.ProbeConfigObj.DNS_KEY_TIME_LIMIT_SEC= null;
  	$scope.ProbeConfigObj.SESSION_MANAGER_INSTANCES= null;
  	$scope.ProbeConfigObj.SESSION_MANAGER_CPU_CORE= '';
  	$scope.ProbeConfigObj.FLUSHER_NO= 2;
  	$scope.ProbeConfigObj.FLUSHER_CPU_CORE= '';
  	$scope.ProbeConfigObj.ZMQ_FLUSHER_CPU_CORE= null;
  	$scope.ProbeConfigObj.XDR_FLUSHER_CPU_CORE= null;
  	$scope.ProbeConfigObj.ZMQ_FLUSER_TPS= 50000;
  	$scope.ProbeConfigObj.IP_WRITE_XDR= true;
  	$scope.ProbeConfigObj.IP_FILE_PREFIX= '';
  	$scope.ProbeConfigObj.IP_FLUSH_FLAG= false;
  	$scope.ProbeConfigObj.IP_FLUSH_PORT= '';
  	$scope.ProbeConfigObj.DNS_WRITE_XDR= false;
  	$scope.ProbeConfigObj.DNS_FILE_PREFIX= false
  	$scope.ProbeConfigObj.DNS_FLUSH_FLAG= false;
  	$scope.ProbeConfigObj.DNS_FLUSH_PORT= '';
  	$scope.ProbeConfigObj.RADIUS_WRITE_XDR= false;
  	$scope.ProbeConfigObj.RADIUS_FILE_PREFIX= '';
  	$scope.ProbeConfigObj.RADIUS_FLUSH_FLAG= false;
  	$scope.ProbeConfigObj.RADIUS_FLUSH_PORT= '';
  	$scope.ProbeConfigObj.RADIUS_IDLE_SESSION_TIMEOUT_IN_SEC= null;
  	$scope.ProbeConfigObj.RADIUS_SESSION_PACKET_LIMIT= null;
  	$scope.ProbeConfigObj.RADIUS_SESSION_FLUSH_TIME_INDEX_REPO_SIZE= null;
  	

  	$scope.saveProbeConfig= function(probeConfig){
  		console.log("probeConfig", probeConfig);
  		var url = dbService.makeUrl({collection: 'probe_config', op:'create'});
        httpService.post(url, probeConfig).then(function(res){
          console.log("success", res);
        });
  		
  	}
})