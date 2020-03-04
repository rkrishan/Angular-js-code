
'use strict';

angular.module('specta')
  .controller('StatementNewCtrl', function ($scope, $state, $stateParams, socket, SweetAlert, ChartService, UserProfile, globalConfig, httpService, dbService){
    
    $scope.statement   = { 'query': '', 'name': '', 'type': '', 'key': [], 'description': '', 'resetTime' : 'min', visibility : true };
    $scope.query       = {'type': '', visibility : true};
    $scope.userProfile = UserProfile.profileData;
    
    if($scope.userProfile.userType == 'system administrator'){
        $scope.query.visibility     = false;
        $scope.statement.visibility = false;
    }

    $scope.isReadOnly = false;
    $scope.validated  = false;
    $scope.columns    =[];
    if($stateParams.mode)
        $scope.mode = $stateParams.mode;

    $scope.showAnimation = false;
    $scope.animation = function(){
        if(!$scope.showAnimation){
            $('#animation').attr('class', 'alert-success');
            var animation = 'rotateInDownRight';

            $('#animation').addClass('animated');
            $('#animation').addClass(animation);
            $scope.showAnimation = true;
        }
        else
            $scope.showAnimation = false;
    }

    /*$scope.inspiniaTemplate = 'views/common/notify.html';
    $scope.inspiniaDemo1 = function(){
        notify({ message: 'Info - This is a Inspinia info notification', classes: 'alert-info', templateUrl: $scope.inspiniaTemplate});
    }*/

    $scope.custome_query_columns = [];
    $scope.isColumnadded         = false;
    $scope.isProcedure           = false;
    $scope.changeDbPullType = function(type){
        if(type == 'procedure' || type == 'redis')
            $scope.isProcedure = true;
        else
            $scope.isProcedure = false;
    }

    $scope.find_match           =[];
    $scope.find_sort            =[];
    $scope.find_single_key      =[];
    $scope.find_limit           ="";
    $scope.find_skip            =0;
    $scope.find_project         =[];
    $scope.aggregate_list       =[];
    $scope.aggregate_single_key =[];
    
    $scope.find_list       =[];
    $scope.find_single_key =[];

    var find_string ="";
    
    $scope.query_columns ="";
    var aggregate_string ="";
    var project_string   ="";
    var match_string     ="";
    var limit_string     ="";
    var sort_string      ="";
    var singl_key_string ="";
    var cuqery           ="";  
    
    httpService.get(globalConfig.datatablesapiurl).then(function (response){
        $scope.collectionlist = response.data;
        $scope.collectionlist.sort();
    });

    if ($stateParams.type == 'view'){
        $scope.isReadOnly = true;
    }

    /*if (angular.isDefined($stateParams.id) && $stateParams.id.length > 0){
        var query = '{_id: ObjectId("'+ $stateParams.id +'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.statement = response.data;
        });
    }*/

    var fields = JSON.stringify(["name", "dataSource", 'statementId', 'mode']);
    var params = 'fields='+encodeURIComponent(fields);
    var url    = dbService.makeUrl({collection: 'statements', op:'select', params: params});
    httpService.get(url).success(function (res){
        $scope.statementLists = res;
        $scope.cepList = _.filter(res, function(item){
            return item.dataSource == 'push' || item.dataSource == 'CEP' 
        })
    })
    if($state.current.name = 'index.statementindicator'){
        var indiMapping = [];
        var url = dbService.makeUrl({collection: 'statement_indicator_mapping', op:'select'});
        httpService.get(url).success(function(res){
            indiMapping = res;
        });

        var selectedCepStatement = null;
        var mappingDy            = []
        $scope.autoselected      = true;
        var mappingFreq          = [{id: 'absmin', title:'Same minute yesterday'}, {id: 'wkavgmin', title: 'Weekly average same minute'}];
    }
    $scope.changedCepStatement = function(statementId){
        $scope.mappingFreq       = []
        $scope.errCompareWith    = null
        $scope.query.compareWith = '';
        $scope.autoselected      = false;
        var tmp = dbService.unique($scope.cepList, 'statementId', statementId)[0];
        if(tmp){
            selectedCepStatement = tmp.name;
            $scope.autoselected  = true;
            var name             = tmp.name.toLowerCase().replace(/ /g,"_");
            $scope.query.table   = 'cep_'+name;
        }

        mappingDy = dbService.unique(indiMapping, 'cepStatement', statementId)[0];
        // console.log(mappingDy);
        if(mappingDy && mappingDy.indicators){
            var already = mappingDy.indicators.map(function(item){ return item.compareWith});
            var tmpArr  = [];
            for(var z in mappingFreq){
                if(already.indexOf(mappingFreq[z].id) == -1)
                    tmpArr.push(mappingFreq[z]);
            }
            if(!tmpArr.length){
                $scope.errCompareWith = 'Query already created for all options';
                swal('Queries already created', 'To create new query first delete old query', 'error');
            }
            else
                $scope.mappingFreq = tmpArr;
        }
        else{
            $scope.mappingFreq = mappingFreq;
        }
    }

    $scope.toggleKey = function (item, list){
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    }

    $scope.validate = function(){
        var req = $scope.statement;
        $scope.columns = [];
        var _createStatement = JSON.stringify({ 
            requestId: 1,
            requestType: "VALIDATE_STATEMENT",
            statementName: req.name,
            eplStatement: req.query
        });
        console.log('VALIDATE_STATEMENT test', _createStatement);
        try{
            socket.sendAdminRequest(_createStatement, function (response) {

                var res = JSON.parse(response);
                console.log('VALIDATE_STATEMENT', res);
                if(res.requestStatus == "0"){
                    for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++) {
                        $scope.columns.push( res.statements[0].eventProperties[colCount].name );
                    }
                    $scope.validated = true;
                    $scope.$apply();
                }
                else{
                    SweetAlert.swal({
                        title: "Error validating statement",
                        text: res.statusMessage,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {
                    });
                }
            });
        }
        catch (err) {
            console.log("Error in VALIDATE_STATEMENT " + err.message);
        }
    }

    $scope.cancelStatement = function(type){

        $state.go('index.statementlist', {'type' : type, 'mode': $scope.mode});
    }
    
    $scope.addCoumns=function(){
        $scope.query_columns    =$scope.query.columns;
        $scope.isColumnadded    =true;
        $scope.query.optionName ="";
        this.addOption();
    }

    $scope.addOption=function(){
        var querytype=$scope.query.type;
        if(querytype=='find'){
            if($scope.query.optionName=="sort")
                $scope.find_sort.push($scope.query.optionText);
            else if($scope.query.optionName=="limit")
                $scope.find_single_key.push("\"limit\":"+$scope.query.optionText);
            else if($scope.query.optionName == "skip")
                $scope.find_single_key.push("\"skip\":"+$scope.query.optionText);
            else if($scope.query.optionName=="match")
                $scope.find_match.push($scope.query.optionText);
            else if($scope.query.optionName=="project")
                $scope.find_project.push($scope.query.optionText);

            angular.forEach($scope.find_sort, function(value, key) {
                if(key==0)
                    sort_string=sort_string+value;
                else
                    sort_string=sort_string+","+value;
            });

            angular.forEach($scope.find_single_key, function(value, key){
                if(key==0)
                    singl_key_string=","+singl_key_string+value;
                else
                    singl_key_string=singl_key_string+","+value;
            });
            
            angular.forEach($scope.find_project, function(value, key){
                if(key==0)
                    project_string=project_string+value;
                else
                    project_string=project_string+","+value;
            });
            
            angular.forEach($scope.find_match, function(value, key){
                if(key==0)
                    match_string=match_string+value;
                else
                    match_string=match_string+","+value;
            });
            
            //cuqery ="{"+"\"collection\":\""+$scope.query.table+"\", \"method\":\"find\", \"findquery\":{ \"match\":\"{"+match_string+"}\",\"project\":\"{"+project_string+"}\",\"sort\":\"{"+sort_string+"}\""+singl_key_string+"},\"columns\":"+$scope.query_columns+"}";
            
            if($scope.query.optionText != ""){
                if($scope.query.optionName == 'limit' || $scope.query.optionName == 'skip')
                    $scope.find_list.push("f_"+$scope.query.optionName+":"+$scope.query.optionText+"</F_TAGEND>")
                else
                    $scope.find_list.push("f_"+$scope.query.optionName+":{"+$scope.query.optionText+"}</F_TAGEND>")
            }
            angular.forEach($scope.find_list, function(value, key){
                find_string = find_string + value;
            });

            singl_key_string = '';
            angular.forEach($scope.find_single_key, function(value, key){          
            if(key==0)
                singl_key_string = "," + singl_key_string + value;
            else
                singl_key_string = singl_key_string +","+ value;
            });

            cuqery ="{"+"\"collection\":\""+$scope.query.table+"\", \"method\":\"find\", \"findquery\":\"{"+find_string+"}\""+",\"columns\":["+$scope.query_columns+"]}";
        }
        else if(querytype=='aggregate'){
            if($scope.query.optionText!=""){
                if($scope.query.optionName == 'limit' || $scope.query.optionName == 'skip' || $scope.query.optionName == 'unwind')
                    $scope.aggregate_list.push("f_"+$scope.query.optionName+":"+$scope.query.optionText+"</F_TAGEND>")
                else
                    $scope.aggregate_list.push("f_"+$scope.query.optionName+":{"+$scope.query.optionText+"}</F_TAGEND>")
            }
            angular.forEach($scope.aggregate_list, function(value, key){
                //console.log("match value"+value);      
                aggregate_string= aggregate_string + value;
            });
            angular.forEach($scope.aggregate_single_key, function(value, key){          
            if(key==0)
                singl_key_string=","+singl_key_string+value;
            else
                singl_key_string=singl_key_string+","+value;
            });
            cuqery ="{"+"\"collection\":\""+$scope.query.table+"\", \"method\":\"aggregate\", \"aggregatequery\":\"{"+aggregate_string+"}\""+",\"columns\":["+$scope.query_columns+"]}";
        }
        $scope.statement.query  =cuqery;
        clarValue();
    }

    function clarValue(){
        project_string          ="";
        match_string            ="";
        sort_string             ="";
        aggregate_string        ="";
        singl_key_string        ="";

        find_string        = "";
        
        $scope.query.optionText = '';
        $scope.query.columns    = '';
    }

    $scope.changedQType = function(){
        $scope.statement.query = null;
        clarValue();
    }
    
    $scope.saveStatement = function(){
        var today = new Date();
        if(angular.isDefined($scope.statement._id)){
            var req = {
                'userId'     : $scope.userProfile.userId,
                'name'       : $scope.statement.name,
                'query'      : $scope.statement.query,
                'description': $scope.statement.description,
                'key'        : $scope.statement.key,
                'type'       : $scope.statement.type,
                'resetTime'  : $scope.statement.resetTime,
                'dataSource' : 'push',
                'createdDate': today
            };
            var url = dbService.makeUrl({collection: 'statements', op: 'upsert', id: $scope.statement._id});
            httpService.post(url, req).then(function(response){
                $state.go('index.statementlist', {'type' : 'cep'});
            });
        }
        else{
            var req = $scope.statement;
            req.userId = $scope.userProfile.userId;
            req.createdDate = today;
            req.dataSource = 'CEP';
            req.statementId = generateUUID();

            if(req.type == 'reset')
                req.eventPublish = 'Combined';
            else if( req.type == 'moving' || req.type == 'refresh' )
                req.eventPublish = 'Individual';

            //build Query
            req.mode = $scope.mode;
            console.log(req);
            if($scope.mode == 'Specta' || $scope.mode == 'CEP-Specta'){
                // delete req.query;
                //for reset frequency
                var resetFrequency;
                if(req.resetTime == '')
                    resetFrequency = $scope.data.flushText + req.flushTime;
                else if(req.resetTime == '*, *, *, *, *')
                    resetFrequency = '1m';
                else if(req.resetTime == '*/5, *, *, *, *')
                    resetFrequency = '5m';
                else if(req.resetTime == '*/10, *, *, *, *')
                    resetFrequency = '10m';
                else if(req.resetTime == '*/30, *, *, *, *')
                    resetFrequency = '30m';
                else if(req.resetTime == '0, *, *, *, *')
                    resetFrequency = '1H';
                else if(req.resetTime == '0, */4, *, *, *')
                    resetFrequency = '4H';
                else if(req.resetTime == '0, */12, *, *, *')
                    resetFrequency = '12H';
                else if(req.resetTime == '00, 00, *, *, *')
                    resetFrequency = '1D';
                if(angular.isDefined(req.queryType) && req.queryType == 'selection'){
                    var metrics = $.map($scope.aggregationSumArray, function(item, index) {
                        return item.value;
                    });

                    var where = $.map($scope.filterList, function(item, index) {
                        return item.column + item.filter + item.value;
                    });

                    var key = 'current_timestamp as Time';
                    var inKey, outKey;
                    if($scope.grouplist && $scope.grouplist.length > 0){
                        //key = $scope.grouplist[0].key +' as '+ $scope.grouplist[0].alias;
                        inKey = $scope.grouplist[0].key;
                        outKey = $scope.grouplist[0].alias;
                    }
                    else{
                        inKey = 'current_timestamp',
                        outKey = 'Time';
                    }

                    var fields = '';
                    for(var key in $scope.fieldArr){
                        var tt = $scope.fieldArr[key] ? $scope.fieldArr[key].value : key;
                        fields += fields ? ', '+ tt : tt;
                    }
                    //$scope.data.flushText +
                    var tt = {
                        // "Key" : key,
                        // "fields" : fields,
                        "metrics" : (metrics.length > 0) ? metrics : '',
                        "stream" : ($scope.data.stream) ? $scope.data.stream.trim() : '',
                        // "where" : (where.find_limitength > 0) ? where.join(' and ') : '',
                        "where" : $scope.filterTxt.trim(),
                        "resetFrequency" : req.resetTime.trim(),//(resetFrequency)? resetFrequency : '',
                        "flushFrequency" : req.flushTime.trim(),
                        "sortKey" : ($scope.data.sort) ? $scope.data.sort.trim() : '',
                        "sortOrder" : ($scope.sortingList.length > 0) ? $scope.sortingList[0].sort.trim() : '',
                        "limit" : ($scope.data.limit) ? parseInt($scope.data.limit) : '',
                        'inKey' : inKey.trim(),
                        'outKey' : outKey.trim()
                    };

                    req.counter = {};

                    for(var i in tt){
                        if(tt[i] != '') req.counter[i] = tt[i];
                    }
                }
                else if(req.queryType == 'input'){
                    var obj     = angular.copy(req.query);
                    var test1   = obj.replace(/(\r\n|\n|\r)/gm,"");
                    var test2   = test1.replace(/\s+/g," ");
                    req.counter = jQuery.parseJSON(test2);
                    req.counter.resetFrequency = req.resetTime;
                    req.counter.flushFrequency = req.flushTime;
                    
                }
                console.log('request', req);
            }
            
            var name = _.filter($scope.statementLists, function(item){
                if(item.dataSource == 'CEP' && item.mode == $scope.mode)
                    return item.name.toLowerCase() == req.name.toLowerCase()
            });
            // console.log('name', name);
            // return;
            if( name.length > 0){
                SweetAlert.swal({
                    title: "Statement Name Already Exits.",
                    text: req.name,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {    
                });
            }
            else{
                var url = dbService.snapshotUrl( {op:'create'} );
                httpService.post(url, req).then(function (result){
                    var url = dbService.makeUrl({collection: 'statements', op:'create'})
                    // var url = globalConfig.CepListener+'collection=statements&op=create'
                    httpService.post(url, req).then(function (response){
                        var test = req;
                            test.requestId = 1;
                            test.requestType = "CREATE_STATEMENT";
                            test.statementName = req.name;
                            test.eplStatement = req.query;

                        var _createStatement = JSON.stringify({
                            requestId: 1,
                            requestType: "CREATE_STATEMENT",
                            statementName: req.name,
                            eplStatement: req.query,
                            statementId: req.statementId,
                            eventPublish: req.eventPublish
                        });
                        socket.sendAdminRequest(_createStatement, function (response) {
                            console.log('_createStatement response', response);
                            var res = JSON.parse(response);
                            if (res.requestStatus == "0") { // success
                            }
                            else{
                                SweetAlert.swal({
                                    title: "Error initializing statement in CEP",
                                    text: res.statusMessage,
                                    type: "warning",
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Ok",
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                },
                                function (isConfirm) {
                                });
                            }
                        });
                        $state.go('index.statementlist',{'type': 'cep', 'mode': $scope.mode});
                    });
                });
            }
        }
    }

    function generateUUID( ) {
        var d = new Date().getTime();
        var uuid = 'axxxxxxxx4xxxyxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        //console.log(uuid);
        return uuid;
    };

    $scope.validatePull = function(){
        if($scope.statement.query != ''){
            var req = {'statement': $scope.statement.query};
            httpService.post(globalConfig.pullDataUrl+'/validate', req).then(function(res){
                if (res == "yes") { // success
                    $scope.validated = true;
                }
                else {
                    SweetAlert.swal({
                        title: "Error validating statement",
                        text: res,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {

                    });
                }
            });
            $scope.validated = true;
        }
    }

    $scope.saveStatementPull = function(){
        var today = new Date();
        if(angular.isDefined($scope.statement._id)){
            var req = {
                'userId': $scope.userProfile.userId,
                'name': $scope.statement.name,
                'query': $scope.statement.query,
                'description': $scope.statement.description,
                'type': $scope.statement.type,
                'resetTime': $scope.statement.resetTime,
                'dataSource' : 'DB',
                'createdDate':today
            };

            var url = dbService.makeUrl({collection: 'statements', op: 'upsert', id: $scope.statement._id});
            httpService.post(url, req).then(function(response){
                $state.go('index.statementlist', {'type' : 'db'});
            });
        }
        else{
            var req = $scope.statement;
            req.userId = $scope.userProfile.userId;
            req.createdDate = today;
            req.dataSource = 'DB';
            req.statementId = generateUUID();
            //console.log('request', req);
            var name = _.filter($scope.statementLists, function(item){
                return item.name == req.name && item.dataSource == 'DB';
            });
            if( name.length > 0){
                SweetAlert.swal({
                    title: "Statement Name Already Exits.",
                    text: req.name,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm) {    
                });
            }
            else{
                var url = dbService.snapshotUrl( {op:'create'} );
                httpService.post(url, req).then(function (res){
                    //$http.post(globalConfig.snapshoturl+'addstatement', req).then(function(res){
                    //console.log('init statement response: ', res);

                    var test = req;
                        test.requestId = 1;
                        test.requestType = "CREATE_STATEMENT";
                        test.statementName = req.name;
                        test.eplStatement = req.query;
                    var _createStatement = JSON.stringify({
                        requestId: 1,
                        requestType: "CREATE_STATEMENT",
                        statementName: req.name,
                        eplStatement: req.query,
                        statementId: req.statementId,
                        eventPublish: req.eventPublish
                    });
                    //console.log(_createStatement);
                    socket.sendAdminRequest(_createStatement, function (response) {
                        // console.log('_createStatement response', response);
                        var res = JSON.parse(response);
                        if (res.requestStatus == "0") { // success
                            var url = dbService.makeUrl({collection: 'statements', op:'create'});
                            httpService.post(url, req).then(function (res){
                                $state.go('index.statementlist', {'type' : 'db'});
                            });
                        }
                        else{
                            SweetAlert.swal({
                                title: "Error creating statement",
                                text: res.statusMessage,
                                type: "warning",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Ok",
                                closeOnConfirm: true,
                                closeOnCancel: true
                            },
                            function (isConfirm) {
                              
                            });
                        }
                    });
                });
            }
        }
    };

    $scope.validateDBPull = function(){
        if($scope.isColumnadded == false){
            SweetAlert.swal({
                title: "Columns Missing in query",
                text: '',
                type: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
            });
        }
        else if($scope.statement.query != ''){
            var req = {'statement': $scope.statement.query};
            httpService.post(globalConfig.pullvalidateqry+ encodeURIComponent($scope.statement.query) ).then(function(res){
                //console.log(res.data);
                if (res.data.requestStatus == 0) { // success
                    $scope.validated = true;

                     SweetAlert.swal({
                        title: "validated ",
                        text: res.statusMessage,
                        type: "success",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                        closeOnCancel: false
                    },
                    function (isConfirm) {
                    });
                }
                else {
                    $scope.validated = false;
                    SweetAlert.swal({
                        title: "Error creating statement",
                        text: res.data.statusMessage,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                        closeOnCancel: false
                    },
                    function (isConfirm) {

                    });
                }
            });
        }
    }

    $scope.changeop = function(){
        if( angular.isDefined($scope.query.optionText) ){
            $scope.query.optionText = '';
            /*if($scope.query.optionName =='limit' || $scope.query.optionName=='skip' || )
                $scope.query.optionText='';
            else
                $scope.query.optionText='{}';*/
        }
    }

    $scope.saveStatementDBPull = function(){
        var today = new Date();
        // console.log('dbpull');
          //console.log($scope.statement);
        if (angular.isDefined($scope.statement._id)) {
            var req = {
                'userId': $scope.userProfile.userId,
                'name': $scope.statement.name,
                'query': $scope.statement.query,
                'type': $scope.statement.type,
                'description': $scope.statement.description,
                'dataSource' : 'dbpull',
                'createdDate': today
            };

            var url = dbService.makeUrl({collection: 'statements', op:'upsert', id: $scope.statement._id});
            httpService.post(url, req).then(function (res){
                $state.go('index.statementlist', {'type' : 'dbpull'});
            });
        }
        else{
            var req = $scope.statement;
            req.userId = $scope.userProfile.userId;
            req.createdDate = today;
            req.dataSource = 'DBPull';
            req.statementId = generateUUID();
            var name = _.filter($scope.statementLists, function(item){
                return item.name == req.name && item.dataSource == 'dbpull';
            });
            if( name.length > 0){
                SweetAlert.swal({
                    title: "Statement Name Already Exits.",
                    text: req.name,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm){
                });
            }
            else{
                var url = dbService.makeUrl({collection: 'statements', op:'create'});
                httpService.post(url, req).then(function (response){
                    $state.go('index.statementlist', {'type' : 'dbpull'});
                });
            }
        }
    }

    $scope.saveStatementIndicator = function(){
        var today = new Date();
        if (angular.isDefined($scope.statement._id)){
            var req = {
                'userId': $scope.userProfile.userId,
                'name': $scope.statement.name,
                'query': $scope.statement.query,
                'type': $scope.statement.type,
                'description': $scope.statement.description,
                'dataSource' : 'Indicator',
                'createdDate': today
            };
            var url = dbService.makeUrl({collection: 'statements', op:'upsert', id: $scope.statement._id});
            httpService.post(url, req).then(function (res){
                $state.go('index.statementlist', {'type' : 'indicator'});
            });
        }
        else {
            var req         = $scope.statement;
            req.userId      = $scope.userProfile.userId;
            req.createdDate = today;
            req.dataSource  = 'Indicator';
            req.statementId = generateUUID();
            // console.log(req);
            var name = _.filter($scope.statementLists, function(item){
                return item.name == req.name && item.dataSource == 'Indicator';
            });
            if( name.length > 0){
                SweetAlert.swal({
                    title: "Statement Name Already Exits.",
                    text: req.name,
                    type: "warning",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true,
                    closeOnCancel: true
                },
                function (isConfirm){
                });
            }
            else{
                var url = dbService.makeUrl({collection: 'statements', op:'create'});
                httpService.post(url, req).then(function (response){
                    $state.go('index.statementlist', {'type' : 'indicator'});
                });
                if($scope.query.compareWith) saveIndicatiorMapping(req);
            }
        }
    }

    function saveIndicatiorMapping(req){
        var indocators = [];
        if(mappingDy && mappingDy.indicators && mappingDy.indicators.length > 0){
            indocators = mappingDy.indicators;
            indocators.push({indStatement: req.statementId, compareWith: $scope.query.compareWith})
        }
        else{
            indocators = [{indStatement: req.statementId, compareWith: $scope.query.compareWith}];
        }
        // console.log('indocators', indocators)
        var obj = {
            cepStatementName: selectedCepStatement,
            cepStatement    : req.cepStatement,
            indicators      : indocators
        }

        if(mappingDy){
            var url = dbService.makeUrl({collection: 'statement_indicator_mapping', op:'upsert', id: mappingDy._id});
            httpService.post(url, obj).then(function(res){});    
        }
        else{
            var url = dbService.makeUrl({collection: 'statement_indicator_mapping', op:'create'});
            httpService.post(url, obj).then(function(res){});
        }
    }

    $scope.validateDBStream = function(){
        if($scope.statement.query != '' || $scope.statement.query != null){
            var req = {'statement': $scope.statement.query};
            httpService.post(globalConfig.pullvalidateqry+ $scope.statement.query).then(function(res){
                // console.log(res.data);
                if (res.data.requestStatus == 0) { // success
                    $scope.validated = true;
                }
                else {
                    $scope.validated = false;
                    SweetAlert.swal({
                        title: "Error creating statement",
                        text: res.data.statusMessage,
                        type: "warning",
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function (isConfirm) {

                    });
                }
            });
        }
    }

    $scope.saveDBStreamStatement = function(){
        var today = new Date();
        var req = $scope.statement;
        req.userId = $scope.userProfile.userId;
        req.createdDate = today;
        req.statementId = generateUUID();
        req.dataSource = 'DBStream';
        var name = _.filter($scope.statementLists, function(item){
            return item.name == req.name && item.dataSource == 'DBStream';
        });
        if( name.length > 0){
            SweetAlert.swal({
                title: "Statement Name Already Exits.",
                text: req.name,
                type: "warning",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {    
            });
        }
        else{
            var url = dbService.makeUrl({collection: 'statements', op:'create'});
            httpService.post(url, req).then(function (response){
                var url = dbService.snapshotUrl({op:'create'});
                httpService.post(url, req).then(function(res){});
                $state.go('index.statementlist', {'type' : 'dbstream'});
            });
        }
    }

    $scope.validateName = function(e){
        var key = e.charCode || e.keyCode || 0;
        if( (key == 8 || 
             key == 9 ||
             key == 13 ||
             key == 190 ||
             key == 32 ||
             key == 46 ||
             key == 95 ||
             (key >= 97 && key <= 122) ||
             (key >= 65 && key <= 90) ||
            (key >= 35 && key <= 40) ||
            (key >= 48 && key <= 57)
            )
        ){
        }
        else{
            e.preventDefault();
        }
    }

    $scope.validateNumber = function(e){
        var key = e.charCode || e.keyCode || 0;
        if( (key == 8 || 
             key == 9 ||
             key == 13 ||
             key == 190 ||
             key == 32 ||
             key == 46 ||
            (key >= 36 && key <= 40) ||
            (key >= 48 && key <= 57))
        ){
        }
        else{
            e.preventDefault();
        }
    }
    // statement check
        $scope.list = {
            //spectaCepStream
            // stream:["GTPcStream","GTPuStream","IUPSStream","IPDNSStream"],
            aggregation:["sum","avg","count","count distinct","max","min"]
        }
        var url = dbService.makeUrl({collection: 'streams', op:'select'});
        httpService.get(url).then(function (res){
            $scope.list.stream = res.data.map(function(item){return item.streamName});
        });

        $scope.data = {flushTime : 'min'};
        $scope.data.aggregation = '';
        $scope.data.groupby = '';
        
        $scope.rowLimit = function(){
            $("#rowLimit").toggle();
        } 

        $scope.selectedListData = function(item){
            console.log("dd",item);
            $scope.list.filter = [];
            var tmp = JSON.stringify({
               requestId: 1,
               requestType: "GET_COLUMNS",
               eplStatement: '',
               dataStream: item.trim()
            });
            console.log('socket calling', tmp);
            socket.sendAdminRequest(tmp, function (result){
                // console.log(result);
                var result= JSON.parse(result);
                $scope.list.filter = result.streamfields;
                // console.log("result",$scope.list.filter);
                //console.log("result1",$scope.viewData);
                
                $scope.$apply();
            });
        }

        $scope.selectedFilterChange = function(filter){
            // console.log("called filter",filter);
            var item = JSON.parse(filter);
            $scope.data.filter = item.name;
            if(filter){
                angular.element('#filterPopup').show();
                $scope.filterType = item.type;
            }
        }

        $scope.filterList = [];
        $scope.filterTxt = '';
        $scope.addFilter = function(filter,filterType){
            //console.log($scope.selFilter, filter);
            if(filter.txtFilter == undefined || filter.rdFilter == undefined || filter.txtFilter == '' || filter.rdFilter == ''){
                $scope.validationMessage  = "Please select Filter And Enter Filter Value";
                return false;
            }
            else if(filter.rdFilter=='Between' && (filter.txtFilter2 == undefined || filter.txtFilter2 == '' )){
                $scope.validationMessage  = "Please select Filter And Enter Filter Value";
                return false;
            }
            else if( (filter.operator == undefined || filter.operator == '') && $scope.filterList.length > 0){
                $scope.validationMessage  = "Please select any one operator";
                return false;
            }
            
            if( filter.rdFilter != null){
                angular.element('#filterPopup').toggle();
                var obj = {
                    'filter': filter.rdFilter,
                    'value': filter.txtFilter,
                    'column': $scope.data.filter,
                    'type': $scope.filterType,
                    'operator' : filter.operator || '',
                    'filterType' : filterType
                };
                if(filter.rdFilter == 'Between')
                    obj.value2 = filter.txtFilter2;

                var itemKey;
                var tmp = _.filter($scope.filterList, function(item, key){
                    if(item.column == $scope.data.filter){
                        itemKey = key;
                    }
                });

                // if(itemKey > -1)
                //     $scope.filterList[itemKey] = obj;
                // else
                    $scope.filterList.push(obj);

                if(filterType == 'STRING')
                    $scope.filterTxt += " " +obj.operator +" " + obj.column +""+ obj.filter +"'"+ obj.value+"'";
                else
                    $scope.filterTxt += ' ' +obj.operator +' ' + obj.column +''+ obj.filter +''+ obj.value;

                console.log($scope.filterTxt, obj);
                
                $scope.filterItem        = "";
                $scope.data.rdFilter     = "";
                $scope.data.txtFilter    = "";
                $scope.data.txtFilter2   = "";
                $scope.data.operator     = '';
                $scope.validationMessage = "";

                // console.log($scope.filterList);
            }
        }

        $scope.closeFilterPopUp = function(){
            angular.element('#filterPopup').hide();
            $scope.filterItem = null;
        }   

        // remove Filter From List 
        $scope.removeFilter = function(selectedFilter){
            // console.log("called remove");
            var index = $scope.filterList.indexOf(selectedFilter);
            $scope.filterList.splice(index,1);

            $scope.filterTxt = '';
            _.filter($scope.filterList, function(obj, key){
                if(obj.filterType == 'STRING')
                    $scope.filterTxt += " " +obj.operator +" " + obj.column +""+ obj.filter +"'"+ obj.value+"'";
                else
                    $scope.filterTxt += ' ' +obj.operator +' ' + obj.column +''+ obj.filter +''+ obj.value;
            });
        }


        //Field 
        $scope.sortList = [];
        $scope.fieldArr = {};
        $scope.changeField = function(item){
            $scope.fieldArr[item] = null;
            $scope.data.fieldsAlias = null;

            $scope.fieldLen = Object.keys($scope.fieldArr).length;
            console.log($scope.fieldLen);

            
            if($scope.fieldLen > 0){
                for(var i in $scope.fieldArr){
                    // console.log(i);
                    var tmp = $scope.fieldArr[i];
                    var sort = tmp ? tmp.as : i;
                    $scope.sortList.push(sort);
                }
            }
            console.log($scope.sortList);
        }

        //Field Alias
        $scope.changefieldAlias = function(item, key){
            if(item && key)
            $scope.fieldArr[item] = {field: item, as:key, value: item+ ' As '+ key};
            // console.log($scope.fieldArr);

            $scope.sortList = [];
            if($scope.fieldLen > 0){
                for(var i in $scope.fieldArr){
                    var tmp = $scope.fieldArr[i];
                    var sort = tmp ? tmp.as : i;
                    $scope.sortList.push(sort);
                }
            }
            console.log($scope.sortList);
        }

        //Add agg
        $scope.aggregationSumArray = [];
        $scope.grpSortList = [];
        $scope.sortList = [];
        $scope.selectedAggregationData = function(data, aggregation, tabindex){
            // console.log(data, aggregation, $scope.data.aggAlias);
            data = data.trim();
            aggregation = aggregation.trim();
            if( data != '' && aggregation != '' && $scope.data.aggAlias != undefined && $scope.data.aggAlias != ''){// event.keyCode == 13 &&
                if(aggregation == 'count distinct'){
                    var obj = {
                        'value': 'uniquecount(' + data + ') as ' + $scope.data.aggAlias,
                        'key' : data,
                        'alias' : $scope.data.aggAlias
                    }
                }
                else{
                    var obj = {
                        'value': aggregation +'(' + data + ') as ' + $scope.data.aggAlias,
                        'key' : data,
                        'alias' : $scope.data.aggAlias,
                        aggregation : aggregation

                    }
                }
                $scope.aggregationSumArray.push(obj);
                
                // console.log($scope.aggregationSumArray, obj);

                // $scope.data.aggregation = '';
                $scope.data.sum         = '';
                $scope.data.aggAlias    = '';

                $scope.aggSortList = [];
                $.each($scope.aggregationSumArray, function (index, value) {
                    $scope.aggSortList.push(value.alias);
                });

                $scope.sortList = $scope.aggSortList.concat($scope.grpSortList);
                if($scope.fieldLen > 0){
                    for(var i in $scope.fieldArr){
                        var tmp = $scope.fieldArr[i];
                        var sort = tmp ? tmp.as : i;
                        $scope.sortList.push(sort);
                    }
                }
                // console.log($scope.sortList);
                // Goto next field
                var next = angular.element(document.body).find('[tabindex=' + tabindex+ ']');
                // event.preventdefault();
                // console.log('test');
            }
            else{
                // $scope.data.aggregation = '';
                $scope.data.sum         = '';
                $scope.data.aggAlias    = '';
            }
            var next = angular.element(document.body).find('[tabindex=6]');
            next.focus();
        }

        $scope.filter = {};
        $scope.changedAggFilter = function(filter){
            var item = JSON.parse(filter);
            console.log("called filter", item);
            $scope.filter.filter = item.name;
            $scope.filter.type = item.type;
            if(filter){
                angular.element('#aggFilter').show();
                $scope.aggFilterType = item.type;
            }
        }

        $scope.closeAggFilterPopUp = function(){
            angular.element('#aggFilter').toggle();
        }

        $scope.addAggFilter = function(filter, type){
            if(filter.txtAggFilter == undefined || filter.rdAggFilter == undefined|| filter.txtAggFilter == '' || filter.rdAggFilter == ''){
                $scope.validationMessage  = "Please select Filter And Enter Filter Value";
                return false;
            }
            else if(filter.rdAggFilter=='Between' && (filter.txtAggFilter2 == undefined || filter.txtAggFilter2 == '' )){
                $scope.validationMessage  = "Please select Filter And Enter Filter Value";
                return false;
            }

            if( filter.rdAggFilter != null){
                angular.element('#aggFilter').toggle();
                // $scope.selectedAggregationData($scope.data.sum, $scope.data.aggregation, 6)
                // console.log($scope.aggregationSumArray);

                var tmp = $scope.aggregationSumArray[$scope.aggregationSumArray.length-1];
                console.log(tmp);
                
                var type = $scope.filter.type;
                var str;
                if(type == 'STRING')
                    str = $scope.filter.filter+$scope.filter.rdAggFilter+'"'+$scope.filter.txtAggFilter+'"';
                else
                    str = $scope.filter.filter+$scope.filter.rdAggFilter+$scope.filter.txtAggFilter

                tmp.value = tmp.aggregation +'(' + tmp.key + ','+ str +') as ' + tmp.alias

                $scope.filter = {};
                $scope.data.aggregation = '';
            }
            // console.log(filter, type);
        }

        //Remove Agg
        $scope.removeAggregation = function(item){
            //remove from aggegation list
            var index = $scope.aggregationSumArray.indexOf(item);
            $scope.aggregationSumArray.splice(index,1);

            //remove from sort list
            var index = $scope.aggSortList.indexOf(item.alias);
            $scope.aggSortList.splice(index,1);
            $scope.sortList = $scope.aggSortList.concat($scope.grpSortList);
        }

        //Add group
        $scope.selectGroupChange = function(data, tabindex, event){
            //event.keyCode == 13 &&
            if($scope.data.groupAlias != undefined){
                $scope.grouplist = [];

                var obj = {
                    'value': 'group by '+ data + ' as ' + $scope.data.groupAlias,
                    'key' : data,
                    'alias' : $scope.data.groupAlias
                };
                $scope.grouplist.push(obj);
                $scope.data.groupby = '';

                $scope.grpSortList = [];
                $.each($scope.grouplist, function (index, value) {
                    $scope.grpSortList.push(value.alias);
                });
                $scope.sortList = $scope.aggSortList.concat($scope.grpSortList);
                
                $scope.data.groupAlias = '';

                // Goto next field
                var next = angular.element(document.body).find('[tabindex=' + tabindex+ ']');
                next.focus();
            }
        }

        //Remove group
        $scope.removeGroup = function(item){
            //remove from aggegation list
            var index = $scope.grouplist.indexOf(item);
            $scope.grouplist.splice(index,1);

            //remove from sort list
            var index = $scope.grpSortList.indexOf(item.alias);
            $scope.grpSortList.splice(index,1);
            $scope.sortList = $scope.aggSortList.concat($scope.grpSortList);
        }

        //Sorting change
        $scope.sortingToggle = function(item){
            angular.element('#sorting').toggle();
        }

        //selected sort
        $scope.sortingList = [];
        $scope.selectedOrder = function(key, order){
            if(key == '') return;
            $scope.sortingList = [];
            console.log(key, order);
            var itemKey = -1;
            var obj = {key: key, sort: order};
            var tmp = _.filter($scope.sortingList, function(item, key1){
                if(item.key == key)
                    itemKey = key1;
            });
            if(itemKey == -1)
                $scope.sortingList.push(obj);
            else
                $scope.sortingList[itemKey] = obj;

            angular.element('#sorting').toggle();
        }

        //Remove sorting
        $scope.removeSorting = function(item){
            var index = $scope.sortingList.indexOf(item);
            $scope.sortingList.splice(index, 1);
        }
});
