/**
 * specta - Responsive Admin Theme
 *
 */


/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
    return {
        link: function (scope, element) {
            var listener = function (event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'Specta';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'Specta | ' + toState.data.pageTitle;
                $timeout(function () {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
};

function pageHeader($state, $timeout) {
    console.log('$state.current', $state.current);
    return {
        template: $state.current.data.pageTitle
    };
}

/**
 * sideNavigation - Directive for run metsiMenu on sidebar navigation
 */
function sideNavigation($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            // Call the metsiMenu plugin and plug it to sidebar navigation
            $timeout(function () {
                element.metisMenu();
            });
        }
    };
};

/**
 * iboxTools - Directive for iBox tools elements in right corner of ibox
 */
function iboxTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            },
            // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
};

/**
 * iboxTools - Directive for iBox simpleTbl tools elements in right corner of ibox
 */
function iboxSimpletblTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_simpletbl_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            },
            // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
};

/**
 * iboxTools - Directive for iBox Column Extended Table tools elements in right corner of ibox
 */
function iboxColextdtblTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_ColExtdTbl_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            },
            // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
};

/**
 * updateTimeTools - Directive for update Time Tools elements in right corner of ibox
 */
function updateTimeTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/update_time_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            },
            // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
};

/**
 * iboxExportTools - Directive for iBox Datatbl tools elements in right corner of ibox
 */
function iboxDatatblTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_datatbl_tools.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            },
            // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
};

/**
 * minimalizaSidebar - Directive for minimalize sidebar
 */
function minimalizaSidebar($timeout) {
    return {
        restrict: 'A',
        template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " style="margin-left:0px;" href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
        controller: function ($scope, $element) {
            $scope.minimalize = function () {
                $("body").toggleClass("mini-navbar");
                if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                    // Hide menu in order to smoothly turn on when maximize menu
                    $('#side-menu').hide();
                    // For smoothly turn on menu
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(500);
                        }, 100);
                } else if ($('body').hasClass('fixed-sidebar')) {
                    $('#side-menu').hide();
                    setTimeout(
                        function () {
                            $('#side-menu').fadeIn(500);
                        }, 300);
                } else {
                    // Remove all inline style from jquery fadeIn function to reset menu state
                    $('#side-menu').removeAttr('style');
                }
            }
        }
    };
};

/**
 * iboxTools with full screen - Directive for iBox tools elements in right corner of ibox with full screen option
 */
function iboxToolsFullScreen($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/ibox_tools_full_screen.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            };
            // Function for close ibox
            $scope.closebox = function () {
                var ibox = $element.closest('div.ibox');
                ibox.remove();
            };
            // Function for full screen
            $scope.fullscreen = function () {
                var ibox = $element.closest('div.ibox');
                var button = $element.find('i.fa-expand');
                $('body').toggleClass('fullscreen-ibox-mode');
                button.toggleClass('fa-expand').toggleClass('fa-compress');
                ibox.toggleClass('fullscreen');
                setTimeout(function () {
                    $(window).trigger('resize');
                }, 100);
            }
        }
    };
}

function userlistSettings($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/userlist_settings.html',
        controller: function ($scope, $element) {
            // Function for collapse ibox
            $scope.showhide = function () {
                var ibox = $element.closest('div.ibox');
                var icon = $element.find('i:first');
                var content = ibox.find('div.ibox-content');
                content.slideToggle(200);
                // Toggle icon from up to down
                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                ibox.toggleClass('').toggleClass('border-bottom');
                $timeout(function () {
                    ibox.resize();
                    ibox.find('[id^=map-]').resize();
                }, 50);
            },
            // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
        }
    };
};

var compareTo = function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
};

var tabHighlight = function ()
    {
    return {
        restrict: 'A',
        link: function (scope, element) {
            // Here is the major jQuery usage where we add the event
            // listeners mousemove and mouseout on the tabs to initalize
            // the moving highlight for the inactive tabs
            var x, y, initial_background = '#c3d5e6';

            element
              .removeAttr('style')
              .mousemove(function (e) {
                  // Add highlight effect on inactive tabs
                  if (!element.hasClass('active')) {
                      x = e.pageX - this.offsetLeft;
                      y = e.pageY - this.offsetTop;

                      // Set the background when mouse moves over inactive tabs
                      element
                        .css({ background: '-moz-radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.0) 45px), ' + initial_background })
                        .css({ background: '-webkit-radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.0) 45px), ' + initial_background })
                        .css({ background: 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.0) 45px), ' + initial_background });
                  }
              })
              .mouseout(function () {
                  // Return the inital background color of the tab
                  element.removeAttr('style');
              });
        }
    };

    }

function capitalize(){
    return function(input, scope) {
        if (input!=null)
            input = input.toLowerCase();
    
        return input.substring(0,1).toUpperCase()+input.substring(1);
    }  
}

/**
 * sparkline - Directive for Sparkline chart
 */
function sparkline() {
    return {
        restrict: 'A',
        scope: {
            sparkData: '=',
            sparkOptions: '=',
        },
        link: function (scope, element, attrs) {
            scope.$watch(scope.sparkData, function () {
                render();
            });
            scope.$watch(scope.sparkOptions, function(){
                render();
            });
            var render = function () {
                $(element).sparkline(scope.sparkData, scope.sparkOptions);
            };
        }
    }
};

/**
 * LoadingIcon - Directive for LoadingIcon
 */
function loadingIcon() {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/loading_icon.html',
    }
};

/**
 * No Data Found - Directive for No Data Found
 */
function noDataFound() {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/noDataFound.html',
    }
};

/**
 * Date Range Picker - Directive for DateRange Picker
 */
function dateRangePicker() {
    return {
        restrict: 'E',
        templateUrl: 'views/common/dateRangePicker.html',
    };
    
};

/**
 * Date Picker - Directive for Date Picker
 */
function singleDatePicker() {
    return {
        restrict: 'E',
        templateUrl: 'views/common/datePicker.html',
    };
    
};

/**
 * Location Filter - Directive for Location Filter
 */
function filterLocation() {
    return {
        restrict: 'E',
        templateUrl: 'views/common/filterLocation.html',
    };
    
};

/**
 * RAT Filter - Directive for RAT Filter
 */
function filterRat() {
    return {
        restrict: 'E',
        templateUrl: 'views/common/filterRAT.html',
    };
    
};

/**
 * Segment Filter - Directive for Segment Filter
 */
function filterSegment() {
    return {
        restrict: 'E',
        templateUrl: 'views/common/filterSegment.html',
    };
    
};

/**
 * Device Filter - Directive for Device Filter
 */
function filterDevice() {
    return {
        restrict: 'E',
        templateUrl: 'views/common/filterDevice.html',
    };
    
};

/**
 * Snipper Fading Circle - Snipper Fading Circle
 */
function snipperCircle() {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/snipper_circle.html',
    }
};

function numbersOnly(){
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    }
}

function decimalOnly(){
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            if(!ngModelCtrl) {
                return; 
            }

            ngModelCtrl.$parsers.push(function(val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }
            
                var clean = val.replace(/[^0-9\.]/g, '');
                var negativeCheck = clean.split('-');
                var decimalCheck = clean.split('.');
                if(!angular.isUndefined(negativeCheck[1])) {
                    negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                    clean =negativeCheck[0] + '-' + negativeCheck[1];
                    if(negativeCheck[0].length > 0) {
                        clean =negativeCheck[0];
                    }
                }
              
                if(!angular.isUndefined(decimalCheck[1])) {
                    decimalCheck[1] = decimalCheck[1].slice(0,2);
                    clean =decimalCheck[0] + '.' + decimalCheck[1];
                }

                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });

            element.bind('keypress', function(event) {
                if(event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    }
}

function removeSpaces(){
    return function(string) {
        if (!angular.isString(string)) {
            return string;
        }
        return string.replace(/[\s]/g, '');
    };
}

/**
 * icheck - Directive for custom checkbox icheck
 */
function icheck($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function($scope, element, $attrs, ngModel) {
            return $timeout(function() {
                var value;
                value = $attrs['value'];

                $scope.$watch($attrs['ngModel'], function(newValue){
                    $(element).iCheck('update');
                })

                return $(element).iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'iradio_square-green'

                }).on('ifChanged', function(event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function() {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function() {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
            });
        }
    };
}

/**
 * fullScroll - Directive for slimScroll with 100%
 */
function fullScroll($timeout){
    return {
        restrict: 'A',
        link: function(scope, element) {
            $timeout(function(){
                element.slimscroll({
                    height: '100%',
                    railOpacity: 0.9
                });

            });
        }
    };
}
  
/**
 * slimScroll - Directive for slimScroll with custom height
 */
function slimScroll($timeout){
    return {
        restrict: 'A',
        scope: {
            boxHeight: '@'
        },
        link: function(scope, element) {
            $timeout(function(){
                element.slimscroll({
                    height: scope.boxHeight,
                    railOpacity: 0.9
                });

            });
        }
    };
}
/**
 *exportModule - Export Module Directive
 */
function exportModule(){

    return {
        restrict: 'E',
        scope: {
            fileName: '=filename',
            dataObjArray: '=dataobj',
            nested: '=nested',
            fileHeader: '=fileheader',
        },
        templateUrl: 'views/common/exportModule.html',
    };
 }

/**
 *Info - Info Icon Directive
 */
function info(){
    return {
        restrict: 'E',
        scope: {
            content: '=content',
            file: '=file',
        },
        templateUrl: 'views/common/info.html',
    }
 }

/**
 *MOdule label top-right
 */
function moduleLabel(){
    return {
        restrict: 'E',
        templateUrl: 'views/common/module_label.html',
    };
}

/**
 *
 * Pass all functions into module
 */
angular
    .module('specta')
    .directive('pageTitle', pageTitle)
    .directive('sideNavigation', sideNavigation)
    .directive('iboxTools', iboxTools)
    .directive('iboxSimpletblTools', iboxSimpletblTools)
    .directive('iboxDatatblTools', iboxDatatblTools)
    .directive('iboxColextdtblTools', iboxColextdtblTools)
    .directive('updateTimeTools', updateTimeTools)
    .directive('userlistSettings', userlistSettings)
    .directive('minimalizaSidebar', minimalizaSidebar)
    .directive("compareTo", compareTo)
    .directive("tabHighlight", tabHighlight)
    .directive('iboxToolsFullScreen', iboxToolsFullScreen)
    .directive('sparkline', sparkline)
    .directive('pageHeader', pageHeader)
    .directive('loadingIcon', loadingIcon)
    .directive('noDataFound', noDataFound)
    .directive('dateRangePicker', dateRangePicker)
    .directive('singleDatePicker', singleDatePicker)
    .directive('filterLocation', filterLocation)
    .directive('filterSegment', filterSegment)
    .directive('filterRat', filterRat)
    .directive('filterDevice', filterDevice)
    .directive('snipperCircle', snipperCircle)
    .directive('numbersOnly', numbersOnly)
    .directive('decimalOnly', decimalOnly)
    .directive('fullScroll', fullScroll)
    .directive('slimScroll', slimScroll)
    .directive('icheck', icheck)
    .directive('exportModule', exportModule)
    .directive('info', info)
    .directive('moduleLabel', moduleLabel)
    .filter('removeSpaces', removeSpaces)
    .filter("capitalize", capitalize);