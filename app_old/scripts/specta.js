/**
 * INSPINIA - Responsive Admin Theme
 * 2.3
 *
 * Custom scripts
 */

$(document).ready(function () {


    // Full height
    function fix_height() {
        var heightWithoutNavbar = $("body > #wrapper").height() - 61;
        $(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");

        var navbarHeigh = $('nav.navbar-default').height();
        var wrapperHeigh = $('#page-wrapper').height();
        var tabHeight = $('#page-wrapper > div:nth-child(2) > div > div > div > div > div > div').height();
          // console.log('tab height: ',tabHeight);
          // console.log('wrapperHeigh: ',wrapperHeigh);
          // console.log('navbarHeigh: ',navbarHeigh);
        if(tabHeight > navbarHeigh || tabHeight > wrapperHeigh ){
            var newHeight = tabHeight + 150;
            $('#page-wrapper').css("min-height", newHeight + "px");
            return;
        }

        if(navbarHeigh > wrapperHeigh || navbarHeigh > tabHeight ){
            $('#page-wrapper').css("min-height", (navbarHeigh+300) + "px");
            return;
        }

        if(navbarHeigh < wrapperHeigh){
            $('#page-wrapper').css("min-height", $(window).height()  + "px");
        }

        if ($('body').hasClass('fixed-nav')) {
            $('#page-wrapper').css("min-height", $(window).height() - 60 + "px");
        }
        // $('#page-wrapper').css("min-height", 2000  + "px");
        // console.log('height');
    }

    $(window).bind("load resize scroll", function() {
        if(!$("body").hasClass('body-small')) {
            fix_height();
        }
    });

    setTimeout(function(){
        fix_height();
    })
});

// Minimalize menu when screen is less than 768px
$(function() {
    $(window).bind("load resize", function() {
        if ($(this).width() < 769) {
            $('body').addClass('body-small')
        } else {
            $('body').removeClass('body-small')
        }
    })
});
