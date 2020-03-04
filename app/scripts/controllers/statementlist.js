'use strict';

angular.module('specta')
  .controller('StatementListCtrl', function ($scope, $timeout, $state, $stateParams, $uibModal, globalConfig, socket, SweetAlert, ChartService, UserProfile, httpService, dbService, utility){
    
    var mappingList = []

    $scope.dataTableOpt = utility.dataTableOpt;
    $scope.dataTableOpt.order = [ [0, "desc"] ];
    
    ChartService.setCurrentPage(null);
    $scope.userProfile = UserProfile.profileData;
    $scope.apiURL = globalConfig.dataapiurl + '/statements';
    $scope.statementLists = $scope.pullStatementLists = $scope.DBPullStatementLists = $scope.statementDBStream = [];
    var tab = '';
    
    $scope.loadList = function(dataSource, mode){
        $scope.statementSpectaLists = [];
        $scope.statementLists = [];
        $scope.pullStatementLists = [];
        $scope.DBPullStatementLists = [];
        $scope.statementDBStream = [];
        $scope.indicatorStatementLists = [];
        tab = dataSource;
        var tmpQ = {'dataSource': dataSource};
        if(mode)
            tmpQ.mode = mode;

        if(UserProfile.profileData.userType != 'system administrator') tmpQ.visibility = true;

        //var tmpQ = {$or: [{'dataSource': dataSource}, {'mode': mode}]};
        var query = JSON.stringify(tmpQ);
        var sort = JSON.stringify({"createdDate": -1});
        var params = 'query=' + encodeURIComponent(query) +'&sort='+ encodeURIComponent(sort);
        var url = dbService.makeUrl({collection: 'statements', op:'select', params: params});
        httpService.get(url).then(function (response){
            if(dataSource == 'CEP'){
                if(mode == 'CEP-Specta')
                    $scope.statementSpectaLists = response.data;
                else    
                    $scope.statementLists = response.data;
            }
            else if( dataSource == 'DBStream' )
                $scope.statementDBStream = response.data;
            else if( dataSource == 'DB' )
                $scope.pullStatementLists = response.data;
            else if( dataSource == 'Indicator' ){
                var url = dbService.makeUrl({collection: 'statement_indicator_mapping', op:'select'});
                httpService.get(url).success(function(res){
                    mappingList = res;
                })
                $scope.indicatorStatementLists = response.data; 
            }
            else
                $scope.DBPullStatementLists = response.data;
        })
    }

    $scope.cep       = false;
    $scope.specta    = false;
    $scope.dbstream  = false;
    $scope.db        = false;
    $scope.dbpull    = false;
    $scope.indicator = false;
    if (angular.isDefined($stateParams.type) && $stateParams.type.length > 0){
        var tabActive = $stateParams.type;
        if( tabActive == 'cep'){
            if($stateParams.mode && $stateParams.mode == 'CEP-Specta')
                $scope.specta = true;
            else
                $scope.cep = true;
            $scope.loadList('CEP', $stateParams.mode);
        }
        else if( tabActive == 'dbstream'){
            $scope.dbstream = true;
            $scope.loadList('DBStream');
        }
        else if( tabActive == 'db'){
            $scope.db = true;
            $scope.loadList('DB');
        }
        else if( tabActive == 'dbpull'){
            $scope.dbpull = true;
            $scope.loadList('DBPull');
        }
        else if( tabActive == 'indicator'){
            $scope.indicator = true;
            $scope.loadList('Indicator');
        }
    }
    else{
        // $scope.cep = true;
        // $scope.loadList('CEP', 'CEP-Esper');
        $scope.specta = true;
        $scope.loadList('CEP', 'CEP-Specta');
    }

    $scope.addStatement = function(statement, mode){
        if(statement == 'cep')
            $state.go('index.statementcepstream', {'mode': mode});
        else if(statement == 'dbstream')
            $state.go('index.statementdbstream');
        else if(statement == 'dbpull')
            $state.go('index.statementdbpull');
        else if(statement == 'indicator')
            $state.go('index.statementindicator');
    }

    $scope.detail = function (item, type){
        $state.go('index.statement', { 'type': type, 'id': item._id });;
    }

    $scope.remove = function(index, item, mode){
        // deleteFromMapping(item);
        SweetAlert.swal({
            title: "Delete " + item.name,
            text: "Are you sure you want to remove this statement?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function(isConfirm){
            if(isConfirm){
                var url = dbService.makeUrl({collection: 'statements', op:'delete', id: item._id});
                httpService.get(url).then(function(response){
                    console.log('response.data',response.data);
                    if(response.data == 'Success'){
                        if( tab == 'CEP'){
                            if(mode == 'Esper'){
                                var tmp = angular.copy($scope.statementLists);
                                tmp.splice(index, 1);
                                $scope.statementLists = [];
                                $timeout(function(){
                                    $scope.statementLists = tmp;
                                    $scope.loadOption();
                                }, 10);
                            }
                            else{
                                var tmp = angular.copy($scope.statementSpectaLists);
                                tmp.splice(index, 1);
                                $scope.statementSpectaLists = [];
                                $timeout(function(){
                                    $scope.statementSpectaLists = tmp;
                                    $scope.loadOption();
                                }, 10);
                            }
                        }
                        else if( tab == 'DB' ){
                            var tmp = angular.copy($scope.pullStatementLists);
                            tmp.splice(index, 1);
                            $scope.pullStatementLists = [];
                            $timeout(function(){
                                $scope.pullStatementLists = tmp;
                                $scope.loadOption();
                            }, 10);
                        }
                        else if( tab == 'DBStream'){
                            var tmp = angular.copy($scope.statementDBStream);
                            tmp.splice(index, 1);
                            $scope.statementDBStream = [];
                            $timeout(function(){
                                $scope.statementDBStream = tmp;
                                $scope.loadOption();
                            }, 10);
                        }
                        else if( tab == 'Indicator'){
                            var tmp = angular.copy($scope.indicatorStatementLists);
                            tmp.splice(index, 1);
                            $scope.indicatorStatementLists = [];
                            $timeout(function(){
                                $scope.indicatorStatementLists = tmp;
                                $scope.loadOption();
                            }, 10);
                            deleteFromMapping(item);
                        }
                        else{
                            var tmp = angular.copy($scope.DBPullStatementLists);
                            tmp.splice(index, 1);
                            $scope.DBPullStatementLists = [];
                            $timeout(function(){
                                $scope.DBPullStatementLists = tmp;
                                $scope.loadOption();
                            }, 10);
                        }
                    }
                    else
                        swal("", "Error in deleting!", "error");

                })

                // remove statement from snapshot
                if( tab == 'CEP' || tab == 'DBStream' ){
                    var url = dbService.snapshotUrl( {op:'delete', id:item.statementId} );
                    httpService.get(url).then(function(res){
                        //$http.post( globalConfig.snapshoturl +'deletestatement/'+ item.statementId ).then(function(res){

                    });
                }

                // remove statement from CEP
                if( tab == 'CEP' ){
                    var _deleteStatement = JSON.stringify({
                        requestId: 1,
                        requestType: "DELETE_STATEMENT",
                        statementId: item.statementId
                    })
                    socket.sendAdminRequest(_deleteStatement, function (response){})
                }
            }
        })
    }

    function deleteFromMapping(item){
        var mappingRec = '';
        for(var i in mappingList){
            var test = mappingList[i]
            if(test.indicators){
                var tmp = dbService.unique(test.indicators, 'indStatement', item.statementId)[0]
                if(tmp)
                    mappingRec = test
            }
        }
        if(mappingRec){
            var index;
            _.filter(mappingRec.indicators, function(test, key){
                if(test.indStatement == item.statementId){
                    index = key
                }
            })
            console.log('index',index)
            mappingRec.indicators.splice(index, 1);
            
            var url = dbService.makeUrl({collection: 'statement_indicator_mapping', op:'upsert', id: mappingRec._id});
            delete mappingRec._id
            console.log('mappingRec', mappingRec)
            httpService.post(url, mappingRec).then(function(res){});
        }
    }
    $scope.loadOption = function(){
        $scope.dtOPtions = {
            "bAutoWidth": true,
            "order": [ [0, "desc"] ]
        };
    }
    $scope.loadOption();

    $scope.detail = function(item){
        var modalInstance = $uibModal.open({
            templateUrl: 'views/statementDetail.html',
            size       : 'lg',
            controller : ModalCtrl,
            windowClass: "animated fadeIn",
            resolve: {
                statement : item
            }
        });
        modalInstance.result.then(function (selectedItem) {
            // $ctrl.selected = selectedItem;
        }, function(){
            // console.info('Modal dismissed at: ' + new Date());
        });
    }

    function ModalCtrl($scope, $uibModalInstance, statement){
        $scope.statement = statement;
        // var test1 = statement.query.replace(/(\r\n|\n|\r)/gm,"");
        // var test2 = test1.replace(/\s+/g," ");
        // $scope.statement.query = jQuery.parseJSON(test2 );
        console.log(statement);

        $scope.cancel = function (){
            $uibModalInstance.dismiss('cancel');
        };
    }
});
