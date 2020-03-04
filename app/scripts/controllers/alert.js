'use strict';

angular.module('specta')
  .controller('AlertNewCtrl', function ($scope,$element, $timeout, $stateParams, $state, socket, globalConfig, SweetAlert, httpService, dbService, currentUser){
    
    if(currentUser.userType == 'user' || currentUser.userType == null){
        $state.go('login');
        return;
    }

    $scope.pagetitle   = "Alert Configuration";
    $scope.userProfile = currentUser;
    $scope.data        = {repeatfreqUnit : 'Min', criteria : [], matchwith: ''};
    $scope.column      = {};
    $scope.custom      = true;
    $scope.matchwith   = true
    
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

            // $scope.data.statementId = 'a0b9486174428965b7560ced7';
            // $scope.changeStatement('a0b9486174428965b7560ced7', 'onChange')
            getRecord()
        })
    }
    $scope.loadStatement();

    function getRecord()
    {
        if(angular.isDefined($stateParams.id) && $stateParams.id != null){
            var query = '{_id: ObjectId("'+$stateParams.id+'")}';
            var params = 'query=' + encodeURIComponent(query);
            var url = dbService.makeUrl({collection: 'alertConfiguration', op:'select', params: params});

            httpService.get(url).then(function(response){
                $scope.data = response.data[0];
                $scope.changeStatement($scope.data.statementId, null);
                var tmp = []
                if( angular.isDefined( $scope.data.criteria['AND'] ) || angular.isDefined( $scope.data.criteria['OR'] ) ){
                    _.forEach($scope.data.criteria, function(item, key){
                        if(key == 'AND' || key == 'OR'){
                            tmp.push(item[0]);
                            item[1].join = key;
                            tmp.push(item[1]);
                            $scope.rows = [0, 1];
                            $scope.enabled = {0: false};
                        }
                    })
                }
                else{
                    $scope.data.criteria.field = $scope.data.criteria.field.trim();
                    tmp.push($scope.data.criteria);
                    $scope.rows = [0];
                    $scope.enabled = {0: true};
                }
                $scope.data.criteria = tmp;
                // console.log('$scope.data', $scope.data);
                /*$timeout(function(){
                    
                    console.log($scope.data)
                }, 2000);*/
            })
        }
    }
    


    $scope.daylist = [
        'Mon', 
        'Tue', 
        'Wed', 
        'Thu',
        'Fri',
        'Sat',
        'Sun'
      ];


      

      $scope.timefameList = [];

        for (var i =0;i<24;i++){
            $scope.timefameList[i] = i+":00";
        }
     $scope.timefameList


      $scope.data = {
        days: []
      };

    //   $scope.dayTimeData = []


      $scope.checkAll = function(value) {
          if (value){
            $scope.data.days = angular.copy($scope.daylist);
            
          }
          else{
            $scope.data.days = [];
          }
        
      };    
    
    
//create a blank array to store selected objects.



$scope.ApplyToAll = [
    {"Day" : "Allday",time:[]}
];


// $scope.getselectval=function(day,selectedName){
//     // alert(day + " :" + selectedName);
//     if (day=="Mon")
//     {
//         $scope.selected_Day_timeframe[0].time = selectedName
//     }
//     else if(day=="Tue"){
//         $scope.selected_Day_timeframe[1].time = selectedName

//     }

//     else if(day=="Wed"){
//         $scope.selected_Day_timeframe[2].time = selectedName
//     }

//     else if(day=="Thu") {

//         $scope.selected_Day_timeframe[3].time = selectedName
//     }

//     else if(day=="Fri") {

//         $scope.selected_Day_timeframe[4].time = selectedName
//     }
    
//     else if(day=="Sat") {

//         $scope.selected_Day_timeframe[5].time = selectedName
//     }

//     else 
//     {

//     $scope.selected_Day_timeframe[6].time = selectedName
    
//     }

//     $scope.dayTimeData = $scope.selected_Day_timeframe;
    
//     // $scope.selected_Day_timeframe.push(data)
//     // console.log($scope.selected_Day_timeframe)
//     // $scope.Day_data.add({day:selectedName})
    
//     // $scope.Day_data.push({day: selectedName})
//     // console.log($scope.Day_data)
//   };



// $scope.Apply_ToAll = function(values){

//     $scope.ApplyToAll.time = values
//     $scope.dayTimeData = $scope.ApplyToAll
    
// };


// $scope.getdayTime = function(){

//     $scope.dayTimeData = []

//     if(val){
//         $scope.dayTimeData = $scope.ApplyToAll;
//         return $scope.dayTimeData
//     }

//     else{
//         $scope.dayTimeData = $scope.selected_Day_timeframe;
//         return $scope.dayTimeData
//     }


// }
     
     
    $scope.changeStatementType = function(type, onChange){
        if(onChange){
            //$scope.data.statementid = '';
            $scope.rows = [];
            $scope.column = {};
        }
        $scope.statementList = _.filter(statements, function(item){
            return item.dataSource == type;
        });
    }




    //for now map absmin to Yesterday's Value and Weekly Average to wkavgmin
    var duration        = {absmin: 'Yesterday`s Value', wkavgmin: 'Weekly Average'};
    $scope.noColumn     = false;
    var eventProperties = [];
    var indicatorsDY    = [];
    
    $scope.changeStatement = function(id, onChange){
        console.log('id', id);
        if(onChange)
            $scope.data.criteria[0] = {};
        
        $scope.column   = {0 : []};
        eventProperties = [];
        
        $scope.duration = [];
        var query = JSON.stringify({'cepStatement': id});
        var params = 'query=' + encodeURIComponent(query);
        var url = dbService.makeUrl({collection: 'statement_indicator_mapping', op:'select', params: params});
        httpService.get(url).success(function(res){
            console.log('res', res);
            if(res.length > 0){
                indicatorsDY = res[0].indicators;
                for(var i in res[0].indicators){
                    var tmq = res[0].indicators[i];
                    console.log(tmq.compareWith, duration[tmq.compareWith]);
                    if(duration[tmq.compareWith]){
                        $scope.duration.push({id: tmq.compareWith, title: duration[tmq.compareWith]})
                    }
                    console.log($scope.duration);
                }
            }
        })

        var item = dbService.unique($scope.statementList, 'statementId', id)[0];
        console.log('item', item)
        if(!item) return
        
        if(item.eventPublish == 'Individual'){
            $scope.matchwith = false
            $scope.data.matchwith = ''
        }
        else $scope.matchwith = true
        $scope.statementIs = item.eventPublish;


        if(item.dataSource == 'DBPull' || item.dataSource == 'DBStream'){
            httpService.get(globalConfig.pullgetcolumn + item.statementId).then(function (result){
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
            console.log(tmp);
            socket.sendAdminRequest(tmp, function (result){
                var res = JSON.parse(result);
                console.log('cep response Status', res.statements[0]);
                if(res.requestStatus == "0"){
                    var column = [];
                    eventProperties = res.statements[0].eventProperties;
                    for (var colCount = 0; colCount < res.statements[0].eventProperties.length; colCount++) {
                        column.push(res.statements[0].eventProperties[colCount].name);
                    }
                    console.log('cep column list', column);
                    $scope.column = {0 : column}
                    // $scope.column = {0 : ["Time", "Usage", 'UpUsage', 'DownUsage', 'TotalUsage']}
                    $scope.$apply(function(){
                        $scope.noColumn = false;
                        // console.log($scope.data.criteria);
                        if(onChange){
                            $scope.rows = [0];
                            $scope.enabled = {0: true};
                        }
                        else{
                            $scope.changeColumn($scope.data.criteria[0].field, 0)
                            if($scope.data.criteria.length > 1){
                                $scope.column['1'] = column
                                $scope.changeColumn($scope.data.criteria[1].field, 1)
                            }
                        }
                    })
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
        console.log('filter', filter);
        if(filter){
            $scope.data.criteria[row].valueType = filter.type;
            console.log($scope.data.criteria[row])
            if(filter.type == 'String') $scope.unithideshow[row] = false;
        }
        console.log($scope.unithideshow)
    }

    $scope.changedComparedur = function(item, row){
        var tmp = dbService.unique(indicatorsDY, 'compareWith', item)[0];
        console.log('indi id', tmp)
        $scope.data.criteria[row].indicator = tmp.indStatement;
    }

    $scope.cancel = function (){
        $state.go('index.alertlist');
    }

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
        console.log(row);
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
        //for column
        columnManage(row, 'add');
    }

    function columnManage(row, flag){
        if(flag == 'add'){
            console.log(row, $scope.column[row]);
            $scope.column[row+1] = []
            for(var z in $scope.column[row]){
                if($scope.data.criteria[row].field != $scope.column[row][z])
                    $scope.column[row+1].push($scope.column[row][z])
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
        
        if(data.IsAllChecked && data.IsAllSelected){

           var time = data.selectedTime;

           var tmp = {"All":time}
           

            // console.log(tmp.day_time_data)
        }
        else if(data.IsAllChecked || data.IsAllSelected){
            
        }       
        
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


        var tmp = angular.copy(data);
        var email = [];
        var phone = [];
       

        if(!data.email || data.email.length ==0){
            swal('Email Required', 'Please enter atleast one email', 'error')
            return
        }
        else{
            for(var i=0 ; i<data.email.length; i++) {
              email.push(data.email[i].text);
            }
            tmp.email = email;
        }
        
        
        
        // if(data.dayTimeSlot[day].length>0){
        //     console.log(data.dayTimeSlot[day]})
        // }
        // for(var i=0 ; i<data.phone.length; i++) {
        //   phone.push(data.phone[i].text);
        // }
        // tmp.phone = phone ;
         // console.log("tmp",tmp);
        //tmp.statementid = JSON.parse(tmp.statementid);
        //console.log(tmp);

        var single = _.filter(tmp.criteria, function(item){
            if( angular.isUndefined(item.join) ){
                if(item.valueType == 'INTEGER' || item.valueType == 'Numbers'){
                    item.value = Number(item.value);
                    item.valueType = 'INTEGER';
                }
                return item;
            }
        });

        var and = _.filter(tmp.criteria, function(item){
            if(item.join && item.join == 'AND'){
                delete item.join;
                if(item.valueType == 'INTEGER' || item.valueType == 'Numbers'){
                    item.value = Number(item.value);
                    item.valueType = 'INTEGER';
                }
                return item;
            }
        });

        var or = _.filter(tmp.criteria, function(item){
            if(item.join && item.join == 'OR'){
                delete item.join;
                if(item.valueType == 'INTEGER' || item.valueType == 'Numbers'){
                    item.value = Number(item.value);
                    item.valueType = 'INTEGER';
                }
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

        tmp.repeatfreqValue = Number(tmp.repeatfreqValue);

        tmp.matchwith = tmp.matchwith || ''
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

            console.log(tmp)
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

    $scope.checkMessage = function(txt){
        $scope.hasText = false
        if(txt && txt.indexOf('$p_') > -1){
            // $scope.hasText = true
            var tmp = ['N', 'S', 'C', 'U']
            var checkArr = []
            var msgTxt = []
            for(var i in $scope.data.criteria){
                var item = $scope.data.criteria[i].field
                if(item != ''){
                    for(var z in tmp){
                        var str = '$p_'+item+'_'+tmp[z]
                        checkArr.push(str)
                    }
                    msgTxt.push('$p_'+item+'_N/C/U/S')
                }
            }
            checkArr.push('$p_current_time')
            console.log(checkArr);

            var flag = false
            for(var x in checkArr){
                if(txt.indexOf(checkArr[x]) > -1)
                    flag = true
            }

            console.log('flag',flag);
            if(!flag)
                swal('Did you mean', msgTxt.join(', '), 'warning')

        }

        // txt.search(/$p_/i)
        // if(txt && txt == '$p_')
        //     $scope.hasText = true
    }

    $scope.changeMsgCol = function(msgCol){
        $scope.data.message = '$p_'+msgCol +' ';

        var age = window.document.getElementById('focusMe');
        age.focus();
    }
})


