'use strict';

angular.module('specta')
  .controller('CampaignsCtrl', function ($scope, $state, $stateParams, globalConfig, SweetAlert, dbService, httpService, currentUser){
    
    $scope.data = {message: ''}
    $scope.optionsArr = []

    function loadList(){
        var url = dbService.makeUrl({collection: 'campaignrules', op:'select'});
        httpService.get(url).success(function (res){
            console.log('campaignrules', res)
            $scope.campaignrulesArr = res;
        })
    }
    loadList()

    function loadRecord(){
        var query = '{_id: ObjectId("'+$stateParams.id+'")}'
        var params = 'query=' + encodeURIComponent(query)
        var url = dbService.makeUrl({collection: 'campaigns', op:'select', params: params})
        httpService.get(url).success(function (res){
            $scope.data = res[0]
            $scope.changeGroup($scope.data.targetRule)
        })
    }
    if($stateParams.id && $stateParams.id.length > 0)
        loadRecord()

    $scope.changeGroup = function(targetGroup){
        $scope.realtime = false
        $scope.optionsArr = []
        if(targetGroup){
            var record = dbService.unique($scope.campaignrulesArr, '_id', targetGroup)[0]
            console.log('record', record)
            if(record){
                $scope.fields = record.fields
                console.log($scope.fields)
                if(record.realtime !== 1)
                    $scope.optionsArr = ['Everyday morning', 'Everyday evening', 'Everyday night', 'First day of week', 'First day of month']
                else
                    $scope.realtime = true
            }
        }
    }

    $scope.appedToMsg = function(field){
        $scope.data.message += ' '+ field
    }

    $scope.save = function(tmpdata){
        var data = angular.copy(tmpdata)
        
        if($stateParams.id && $stateParams.id.length > 0){
            delete data._id
            var url = dbService.makeUrl({collection: 'campaigns', op:'upsert', id: $stateParams.id})
            httpService.post(url, data).then(function (response){
                $state.go('index.campaignslist')
            })
        }
        else{
            var url = dbService.makeUrl({collection: 'campaigns', op:'create'})
            httpService.post(url, data).then(function (response){
                $state.go('index.campaignslist')
            })
        }
    }
})