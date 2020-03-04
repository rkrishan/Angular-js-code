/**
 * specta - Responsive Admin Theme
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl($scope) {
    $scope.$on("$stateChangeSuccess", function updatePage() {
        $scope.currentPageName = '';
    });

    $scope.$on('DashboardPageAssigned', function (event, arg) {
        if (typeof arg !== 'undefined' && angular.isDefined(arg.currentPage)) {
            $scope.currentPage = arg.currentPage;
            if ($scope.currentPage != null && angular.lowercase($scope.currentPage.name) != 'new') {
                $scope.currentPageName = $scope.currentPage.name;
            }
            else {
                $scope.currentPageName = '';
            }
        }
        //console.log('main current page', $scope.currentPageName);
    });

}

angular
    .module('specta')
    .controller('MainCtrl', MainCtrl)
    