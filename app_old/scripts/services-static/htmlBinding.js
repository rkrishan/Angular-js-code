'use strict';

angular.module('specta')
    .service('htmlBindingService',function ($sce) {
    
    var loadingSnipper= "<div class='sk-spinner sk-spinner-fading-circle'>"+
        "<div class='sk-circle1 sk-circle'></div>"+
        "<div class='sk-circle2 sk-circle'></div>"+
        "<div class='sk-circle3 sk-circle'></div>"+
        "<div class='sk-circle4 sk-circle'></div>"+
        "<div class='sk-circle5 sk-circle'></div>"+
        "<div class='sk-circle6 sk-circle'></div>"+
        "<div class='sk-circle7 sk-circle'></div>"+
        "<div class='sk-circle8 sk-circle'></div>"+
        "<div class='sk-circle9 sk-circle'></div>"+
        "<div class='sk-circle10 sk-circle'></div>"+
        "<div class='sk-circle11 sk-circle'></div>"+
        "<div class='sk-circle12 sk-circle'></div>"+
        "</div>";
    
    var loadingText= "<span class='text-info'><b>Loading...</b></span>";
    
    this.loadingSnipper= function(){
        return $sce.trustAsHtml(loadingSnipper);
    }
    
    this.loadingText= function(){
        return $sce.trustAsHtml(loadingText);
    }
    
    
});