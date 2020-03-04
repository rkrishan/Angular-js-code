'use strict';

angular.module('specta')
  .controller('AlertNewCtrl', function ($scope, $timeout, $stateParams, $state, socket, globalConfig, SweetAlert, httpService, dbService, currentUser){
    
    if(currentUser.userType == 'user' || currentUser.userType == null){
        $state.go('login');
        return;
    }

    $scope.pagetitle   = "Alert Configuration";
    $scope.userProfile = currentUser;
    $scope.data        = {};
    
    var statements = [];
    $scope.loadStatement = function(){
        var fields = JSON.stringify(['name', 'statementId', 'dataSource', 'eventPublish']);
        var query = JSON.stringify({'dataSource': {'$in':['CEP', 'DBStream']}});
        var sort = JSON.stringify({"dataSource": 1});
        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function (response){
            //statements = response.data;
            $scope.statementList = response.data;

            $scope.data.statementId = 'a0b9486174428965b7560ced7';
            $scope.changeStatement('a0b9486174428965b7560ced7', 'onChange')
        });
    }
    $scope.loadStatement();

    if(angular.isDefined($stateParams.id) && $stateParams.id != null){
        var query = '{_id: ObjectId("'+$stateParams.id+'")}';
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'alertConfiguration', op:'select', params: params});
        httpService.get(url).then(function(response){
            $scope.data = response.data[0];
            console.log('$scope.data', $scope.data);
            var tmp = [];
            if( angular.isDefined( $scope.data.criteria['AND'] ) || angular.isDefined( $scope.data.criteria['OR'] ) ){
                _.forEach($scope.data.criteria, function(item, key){
                    if(key == 'AND' || key == 'OR'){
                        tmp.push(item[0]);
                        item[1].join = key;
                        tmp.push(item[1]);
                        $scope.rows = [0, 1];
                        $scope.enabled = {0: false};
                    }
                });
            }
            else{
                $scope.data.criteria.field = $scope.data.criteria.field.trim();
                tmp.push($scope.data.criteria);
                $scope.rows = [0];
                $scope.enabled = {0: true};
            }
            $scope.data.criteria = tmp;
            $timeout(function(){
                $scope.changeStatement($scope.data.statementId, null);
            }, 100);
        });
    }
    
    // $scope.column = ["autodate","dwbandwidth","upbandwidth","bandwidth","datatime"];
    // $scope.rows = [0];
    // $scope.enabled = {0: true};

    $scope.changeStatementType = function(type, onChange){
        if(onChange){
            //$scope.data.statementid = '';
            $scope.rows = [];
            $scope.column = [];
        }
        $scope.statementList = _.filter(statements, function(item){
            return item.dataSource == type;
        });
    }

    $scope.noColumn     = false;
    var eventProperties = [];
    $scope.changeStatement = function(id, onChange){
        console.log(id);
        $scope.column   = [];
        eventProperties = [];
        var statementId = _.filter($scope.statementList, function(item){
            return item.statementId == id;
        });
        console.log(statementId)
        var item = statementId[0];
        if(item.dataSource == 'DBPull' || item.dataSource == 'DBStream'){
            httpService.get(globalConfig.pullgetcolumn + item.statementId).then(function (result){
                console.log(result.data);
                if(result.data != 'null'){
                    $scope.noColumn = false;
                    $scope.column = result.data;
                    if(onChange){
                        $scope.rows = [0];
                        $scope.enabled = {0: true};
                    }
                }
                else{
                    $scope.noColumn = true;
                    $scope.rows = [];
                }
            });
        }
        else if( item.dataSource == 'CEP'){
            var tmp = JSON.stringify({
                requestId: 1,
                requestType: "LIST_STATEMENT",
                eplStatement: '',
                statementId: item.statementId
            });
            // console.log(tmp);
            socket.sendAdminRequest(tmp, function (result){
                var res = JSON.parse(result);
                console.log('cep response Status', res.statements);
                if(res.requestStatus == "0"){
                    eventProperties = res.statements[0].eventProperties;
                    for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++) {
                        $scope.column.push(res.statements[0].eventProperties[colCount].name);
                    }
                    console.log('cep column list', $scope.column);
                    $scope.$apply(function(){
                        $scope.noColumn = false;
                        if(onChange){
                            $scope.rows = [0];
                            $scope.enabled = {0: true};
                        }
                    });
                }
                else{
                    $scope.noColumn = true;
                    $scope.rows = [];
                }
            });
        }
    }
    
    $scope.unithideshow = {};
    $scope.changeColumn = function(item, row){
        $scope.unithideshow[row] = true;
        var filter = dbService.unique(eventProperties, 'name', item)[0];
        console.log(filter);
        // $scope.unithideshow[row] = false;
        if(filter.type == 'String') $scope.unithideshow[row] = false;

        console.log($scope.unithideshow)
    }

    $scope.cancel = function (){
        $state.go('index.alertlist');
    }

    $scope.data = {};
    $scope.data = {criteria : []};
    $scope.column = {};
    $scope.custom = true;
    $scope.data.freqUnit= 'Min';

    $scope.otherField = function(row, type){
        row = ++row;
        var key = $scope.rows.indexOf(row);
        if(key == -1)
            $scope.rows.push(row);
        else{
            if(type == undefined || type == ''){
                $scope.rows.splice(key, $scope.rows.length);
                $scope.data.criteria.splice(key, $scope.rows.length);
            }
        }
    }

    $scope.addField = function(row){
        $scope.enabled[row] = false;
        var tmpRow = angular.copy(row);
        tmpRow = ++tmpRow;
        var key = $scope.rows.indexOf(tmpRow);
        if(key == -1){
            $scope.rows.push(tmpRow);
            $scope.enabled[tmpRow] = true;
        }
        else{
            if(type == undefined || type == ''){
                $scope.rows.splice(key, $scope.rows.length);
                $scope.data.criteria.splice(key, $scope.rows.length);
            }
        }
    }

    $scope.removeField = function(row){
        $scope.enabled[row] = true;
        if( $scope.data.criteria[row-1] )
            $scope.data.criteria[row-1].join = '';
        
        var key = $scope.rows.indexOf(row);
        if(row == 0){
            $scope.rows.splice(1, $scope.rows.length);
            //$scope.data.criteria.splice(1, $scope.rows.length);    
        }
        else{
            $scope.rows.splice(key+1, $scope.rows.length);
            //$scope.data.criteria.splice(key+1, $scope.rows.length);
        }
    }

    $scope.save = function(data){
        console.log(data);
        return;
        if(data.AlertType=='Repeated_Alert'){
            switch(data.freqUnit){
                case 'Hour':
                    data.AlertFreq= 60*data.AlertFreq;
                    break;
                case 'Day':
                    data.AlertFreq= 60*24*data.AlertFreq;
                    break;
                case 'Week':
                    data.AlertFreq= 60*24*7*data.AlertFreq;
                    break;
                case 'Month':
                    data.AlertFreq= 60*24*30*data.AlertFreq;
                    break;
            }
        }
        $scope.data.freqUnit= 'Min';
        console.log("DataObj after save", data);
        var tmp = angular.copy(data);
        var email = [];
        var phone = [];
        for(var i=0 ; i<data.email.length; i++) {
          email.push(data.email[i].text);
        }
        tmp.email = email;
        /*for(var i=0 ; i<data.phone.length; i++) {
          phone.push(data.phone[i].text);
        }
        tmp.phone = phone ;*/
         // console.log("tmp",tmp);
        //tmp.statementid = JSON.parse(tmp.statementid);
        //console.log(tmp);
        var single = _.filter(tmp.criteria, function(item){
            if( angular.isUndefined(item.join) ){
                if(item.valueType == 'INTEGER')
                    item.value = parseInt(item.value);
                return item;
            }
        });

        var and = _.filter(tmp.criteria, function(item){
            if(item.join && item.join == 'AND'){
                delete item.join;
                if(item.valueType == 'INTEGER')
                    item.value = parseInt(item.value);
                return item;
            }
        });

        var or = _.filter(tmp.criteria, function(item){
            if(item.join && item.join == 'OR'){
                delete item.join;
                if(item.valueType == 'INTEGER')
                    item.value = parseInt(item.value);
                return item;
            }
        });
        
        if(and.length > 0 || or.length > 0)
            tmp.criteria = {};
        else
            tmp.criteria = single[0];

        if(and.length > 0){
            tmp.criteria.AND = single;
            tmp.criteria.AND.push(and[0]);
        }

        if(or.length > 0){
            tmp.criteria.OR = single;
            tmp.criteria.OR.push(or[0]);
        }


        if( angular.isDefined($stateParams.id) && $stateParams.id != null ){
            delete tmp._id;
            tmp.updateDate = new Date();
            var url = dbService.makeUrl({collection: 'alertConfiguration', op:'upsert', id: $stateParams.id});
            httpService.post(url, tmp).then(function (result){
                $state.go('index.alertlist');
            });
        }
        else{
            tmp.userId = $scope.userProfile.userId;
            tmp.createDate = new Date();
            var url = dbService.makeUrl({collection: 'alertConfiguration', op:'create'});
            httpService.post(url, tmp).then(function (result){
                $state.go('index.alertlist');
            });
        }
    }

    $scope.loadIndicator = function(){
        var fields = JSON.stringify(['name', 'statementId', 'dataSource']);
        var query = JSON.stringify({'dataSource': {'$in':['Indicator']}});
        var sort = JSON.stringify({"dataSource": 1});
        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields)+'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function (response){
            $scope.indicatorList = response.data;
        });
    }
    $scope.loadIndicator();

    /*$scope.onEmailTagsAdded = function(data) {
        var emails = angular.toJson(data.tags);
        //console.log('emails', emails);
        $scope.emailTags = angular.toJson(data.tags);
    };

    $scope.onPhoneTagsAdded = function(data) {
        var emails = angular.toJson(data.tags);
        //console.log('phoneTags', emails);
        $scope.phoneTags = angular.toJson(data.tags);
    };
    
    $scope.onEmailTagsRemoved = function(data){
        $scope.emailTags = angular.toJson(data.tags);
        //console.log('data', $scope.emailTags);
    }

    $scope.onPhoneTagsRemoved = function(data){
        $scope.phoneTags = angular.toJson(data.tags);
    }*/
});