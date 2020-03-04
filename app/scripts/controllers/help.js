/**
 * InfoCtrl - controller
 */
function infoCtrl($scope) {
    
    console.log("content", $scope.content);

    console.log('file = ', $scope.file);
    if($scope.file == 'help/help_alert.html'){
        switch($scope.content){
            case 'alert_repeat_frequency':
                $scope.alert_repeat_frequency = true;
                break;
            case 'create_reportFilter_Plan':
                    $scope.create_reportFilter_Plan = true;
                    break;
            case 'create_reportFilter_App':
                    $scope.create_reportFilter_App = true;
                    break;
            case 'create_reportFilter_Segment':
                    $scope.create_reportFilter_Segment = true;
                    break;
            case 'create_reportFilter_Node':
                $scope.create_reportFilter_Node = true;
                break;
            case 'create_reportFilter_Area':
                $scope.create_reportFilter_Area = true;
                break;
        }
    }
    else if($scope.file == 'help/help_statement.html'){
        switch($scope.content){
            case 'statement_cep_specta_stream':
                $scope.statement_cep_specta_stream = true;
                break;

            case 'statement_cep_specta_aggregation':
                $scope.statement_cep_specta_aggregation = true;
                break;

            case 'statement_cep_specta_filter':
                $scope.statement_cep_specta_filter = true;
                break;

            case 'statement_cep_specta_groupby':
                $scope.statement_cep_specta_groupby = true;
                break;

            case 'statement_cep_specta_sortby':
                $scope.statement_cep_specta_sortby = true;
                break;

            case 'statement_cep_specta_limit':
                $scope.statement_cep_specta_limit = true;
                break;

                
                
                
                
        }
    }
    else{
        switch($scope.content){
            case 'module_InfoBox':
                $scope.module_InfoBox= true;
                break;
            case 'module_SimpleIbox':
                $scope.module_SimpleIbox= true;
                break;
            case 'module_iBox_Multi_no_Header':
                $scope.module_iBox_Multi_no_Header= true;
                break;
            case 'module_iboxWithGauge':
                $scope.module_iboxWithGauge= true;
                break;
            case 'module_iboxWithDualDataPoint':
                $scope.module_iboxWithDualDataPoint= true;
                break;
            case 'module_simpleIboxWithTrend':
                $scope.module_simpleIboxWithTrend= true;
                break;
            case 'module_iBoxEmbedWithChart':
                $scope.module_iBoxEmbedWithChart= true;
                break;
            case 'module_SimpleCharts':
                $scope.module_SimpleCharts= true;
                break;
            case 'module_simpleTableOrTableWithSearch':
                $scope.module_simpleTableOrTableWithSearch= true;
                break;
            case 'module_colExtendedTable':
                $scope.module_colExtendedTable= true;
                break;
            case 'module_gaugeChart':
                $scope.module_gaugeChart= true;
                break;
            case 'module_Map':
                $scope.module_Map= true;
                break;
            case 'module_customModule':
                $scope.module_customModule= true;
                break;
        }
    }
}


angular
    .module('specta')
    .controller('infoCtrl', infoCtrl)
