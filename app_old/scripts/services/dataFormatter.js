'use strict';

angular.module('specta')
    .service('dataFormatter', function () {
    this.fixFormatter= function(data,devideby,decimalPlaces){
        return data= (data/devideby).toFixed(decimalPlaces);
    }
    
    this.percChangeCalculator= function(prevValue, curValue,decimalPlaces){
        var change= curValue - prevValue;
        var changePerc= ((change / prevValue)*100).toFixed(decimalPlaces);
        var indicator;
        if(change > 0) indicator= 'UP';
        else if(change < 0) indicator= 'DOWN';
        else {
            indicator= 'NO CHANGE';
            changePerc= 0;
        }
        return [changePerc+"% ", indicator];
    }
    
    this.convertFixUnitUsageData= function(objArray,decimalPlaces){
        var finalArray= [];
        if(objArray.length>0){
            var maxdata= Math.max.apply(null, objArray);
            var unit = this.setUsageUnit(maxdata);
            if(unit=="KB"){
                for (var i = 0; i < objArray.length; i++){
                    finalArray[i]= (objArray[i]/Math.pow(2,10)).toFixed(decimalPlaces) + " " + unit;
                }
                return finalArray;
            }else if(unit=="MB"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(2,20)).toFixed(decimalPlaces)+ " " + unit;
                }
                return finalArray;
            }else if(unit=="GB"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(2,30)).toFixed(decimalPlaces)+ " " + unit;
                }
                return finalArray;
            }else{
                return objArray+ " " + unit;
            }
        }
    }
    
    this.convertFixUnitUsageDataWoUnit= function(objArray,decimalPlaces){
        var finalArray= [];
        if(objArray.length>0){
            var maxdata= Math.max.apply(null, objArray);
            var unit = this.setUsageUnit(maxdata);
            if(unit=="KB"){
                for (var i = 0; i < objArray.length; i++){
                    var temp= (objArray[i]/Math.pow(2,10)).toFixed(decimalPlaces);
                    finalArray[i]= parseFloat(temp);
                }
                return [finalArray,unit];
            }else if(unit=="MB"){
                for (var i = 0; i < objArray.length; i++) {
                    var temp= (objArray[i]/Math.pow(2,20)).toFixed(decimalPlaces);
                    finalArray[i]= parseFloat(temp);
                }
                return [finalArray,unit];
            }else if(unit=="GB"){
                for (var i = 0; i < objArray.length; i++) {
                    var temp= objArray[i]/Math.pow(2,30).toFixed(decimalPlaces);
                    finalArray[i]= parseFloat(temp);
                }
                return [finalArray,unit];
            }else if(unit=="TB"){
                for (var i = 0; i < objArray.length; i++) {
                    var temp= objArray[i]/Math.pow(2,40).toFixed(decimalPlaces);
                    finalArray[i]= parseFloat(temp);
                }
                return [finalArray,unit];
            }else{
                return [objArray,unit];
            }
        }
    }
    
    this.convertFixUnitThroughputDataWoUnit= function(objArray,decimalPlaces){
        var finalArray= [];
        if(objArray.length>0){
            console.log("objArray", objArray.length);
            var maxdata= Math.max.apply(null, objArray);
            console.log("maxdata", maxdata);
            var unit = this.setThroughputUnit(maxdata);
            if(unit=="Kbps"){
                for (var i = 0; i < objArray.length; i++){
                    finalArray[i]= (objArray[i]/Math.pow(10,3)).toFixed(decimalPlaces);
                }
                return [finalArray,unit];
            }else if(unit=="Mbps"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(10,6)).toFixed(decimalPlaces);
                }
                return [finalArray,unit];
            }else if(unit=="Gbps"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(10,9)).toFixed(decimalPlaces);
                }
                return [finalArray,unit];
            }else{
                return [objArray,unit];
            }
        }
    }
    
    this.convertFixUnitThroughputData= function(objArray,decimalPlaces, unit){
        var finalArray= [];
        if(objArray.length>0){
            var maxdata= Math.max.apply(null, objArray);
            //console.log("maxdata", maxdata);
            // var unit = this.setThroughputUnit(maxdata);
            //console.log("Flag :",temp[1], "Data: ",temp[0]);
            if(unit=="Kbps"){
                for (var i = 0; i < objArray.length; i++){
                    finalArray[i]= (objArray[i]/Math.pow(10,3)).toFixed(decimalPlaces) + " " + unit;
                }
                return finalArray;
            }else if(unit=="Mbps"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(10,6)).toFixed(decimalPlaces)+ " " + unit;
                }
                return finalArray;
            }else if(unit=="Gbps"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(10,9)).toFixed(decimalPlaces)+ " " + unit;
                }
                return finalArray;
            }else{
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]).toFixed(decimalPlaces)+ " " + unit;
                }
                return objArray+ " " + unit;
            }
        }
    }
    
    this.convertSingleUnitThroughputData= function(objArray,decimalPlaces,unit){
        var finalArray= [];
        if(objArray.length>0){
            if(unit=="Kbps"){
                for (var i = 0; i < objArray.length; i++){
                    finalArray[i]= (objArray[i]/Math.pow(10,3)).toFixed(decimalPlaces);
                }
                return finalArray;
            }else if(unit=="Mbps"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(10,6)).toFixed(decimalPlaces);
                }
                return finalArray;
            }else if(unit=="Gbps"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(10,9)).toFixed(decimalPlaces);
                }
                return finalArray;
            }else if(unit=="bits"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]).toFixed(decimalPlaces);
                }
                return objArray;
            }
        }
    }
    
    this.convertSingleUnitThroughputDataWoArray= function(element,decimalPlaces,unit){
        var formattedElement;
        if(unit=="Kbps"){
            formattedElement= (element/Math.pow(10,3)).toFixed(decimalPlaces);
            return formattedElement;
        }else if(unit=="Mbps"){
            formattedElement= (element/Math.pow(10,6)).toFixed(decimalPlaces);
            return formattedElement;
        }else if(unit=="Gbps"){
            formattedElement= (element/Math.pow(10,9)).toFixed(decimalPlaces);
            return formattedElement;
        }else{
            formattedElement= (element).toFixed(decimalPlaces);
            return formattedElement;
        }
    }
    
    this.convertSingleUnitUsageDataWoArray= function(element,decimalPlaces,unit){
        var formattedElement;
        if(unit=="KB"){
            formattedElement= (element/Math.pow(2,10)).toFixed(decimalPlaces);
            return formattedElement;
        }else if(unit=="MB"){
            formattedElement= (element/Math.pow(2,20)).toFixed(decimalPlaces);
            return formattedElement;
        }else if(unit=="GB"){
            formattedElement= (element/Math.pow(2,30)).toFixed(decimalPlaces);
            return formattedElement;
        }else if(unit=="TB"){
            formattedElement= (element/Math.pow(2,40)).toFixed(decimalPlaces);
            return formattedElement;
        }else{
            formattedElement= (element).toFixed(decimalPlaces);
            return formattedElement;
        }
    }

    this.convertSingleUnitUsageData= function(objArray,decimalPlaces,unit){
        var finalArray= [];
        if(objArray.length>0){
            if(unit=="KB"){
                for (var i = 0; i < objArray.length; i++){
                    finalArray[i]= (objArray[i]/Math.pow(2,10)).toFixed(decimalPlaces);
                }
                return finalArray;
            }else if(unit=="MB"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(2,20)).toFixed(decimalPlaces);
                }
                return finalArray;
            }else if(unit=="GB"){
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]/Math.pow(2,30)).toFixed(decimalPlaces);
                }
                return finalArray;
            }else{
                for (var i = 0; i < objArray.length; i++) {
                    finalArray[i]= (objArray[i]).toFixed(decimalPlaces);
                }
                return objArray;
            }
        }
    }
    
    this.setUsageUnit= function (data){
        if(data >= 1024*1024*1024*1024)
            return "TB";
        else if(data >= 1024*1024*1024)
            return "GB";
        else if (data >= 1024*1024)
            return "MB";
        else if (data >= 1024)
            return "KB";
        else
            return "Bytes";
    }
     
    this.setThroughputUnit= function (data){
        console.log("data", data);
        if(data >= 10*1000*1000*1000)
            return "Gbps";
        else if (data >= 10*1000*1000)
            return "Mbps";
        else if (data >= 1000)
            return "Kbps";
        else
            return "bits";
    }
    
    this.setCountUnit= function (data){
        if(data >= 1000*1000*1000)
            return "Bn";
        else if (data >= 1000*1000)
            return "Mn";
        else if (data >= 1000)
            return "K";
        else
            return ;
    }
    
    this.formatUsageData= function(data,decimalPlaces){
        if(data>1024){
            var datamb= (data/1024).toFixed(decimalPlaces);
            if(datamb>1024){
                var datagb= (datamb/1024).toFixed(decimalPlaces);
                if(datagb>1024){
                    var datatb= (datagb/1024).toFixed(decimalPlaces);
                    return datatb+"GB";
                }
                else{
                    return datagb+"MB";
                }
            }
            else{
                return datamb+"KB";
            }
        }
        else{
            return data+"B";
        }
    }

    this.formatCountryData= function(data,decimalPlaces){
        if(data>1024){
            var datamb= (data/1024).toFixed(decimalPlaces);
            if(datamb>1024){
                var datagb= (datamb/1024).toFixed(decimalPlaces);
                if(datagb>1024){
                    var datatb= (datagb/1024).toFixed(decimalPlaces);
                    if(datatb>1024){
                        var datapb = (datatb/1024).toFixed(decimalPlaces);
                        return datapb+"TB"
                    }
                    else{
                        return datatb+"GB";
                    }
                    
                }
                else{
                    return datagb+"MB";
                }
            }
            else{
                return datamb+"KB";
            }
        }
        else{
            return data+"B";
        }
    }
    
    this.formatBwByteData= function (data,decimalPlaces){
        if(data>1000){
            var datamb= (data/1000).toFixed(decimalPlaces);
            if(datamb>1000){
                var datagb= (datamb/1000).toFixed(decimalPlaces);
                if(datagb>1000){
                    var datatb= (datagb/1000).toFixed(decimalPlaces);
                    return datatb+" Gbps";
                }
                else{
                    return datagb+" Mbps";
                }
            }
            else{
                return datamb+" Kbps";
            }
        }
        else{
            return data+" bps";
        }
    }
    
    this.formatBwBitsData= function (data, decimalPlaces){
        if(data>1000){
            var datamb= (data/1000).toFixed(decimalPlaces);
            if(datamb>1000){
                var datagb= (datamb/1000).toFixed(decimalPlaces);
                if(datagb>1000){
                    var datatb= (datagb/1000).toFixed(decimalPlaces);
                    return datatb+"Gbps";
                }
                else{
                    return datagb+"Mbps";
                }
            }
            else{
                return datamb+"Kbps";
            }
        }
        else{
            return data+"bps";
        }
    }
    
    this.formatUsageDataForChart= function (data,decimalPlaces){
        if(data>1024){
            var datamb= (data/1024).toFixed(decimalPlaces);
            if(datamb>1024){
                var datagb= (datamb/1024).toFixed(decimalPlaces);
                if(datagb>1024){
                    var datatb= (datagb/1024).toFixed(decimalPlaces);
                    return [datatb,"GB"];
                }
                else{
                    return [datagb,"MB"];
                }
            }
            else{
                return [datamb,"KB"];
            }
        }
        else{
            return [data,"Bytes"];
        }
    }
    
    this.formatCountData= function(data,decimalPlaces){
        if(data>1000){
            var datamb= (data/1000).toFixed(decimalPlaces);
            if(datamb>1000){
                var datagb= (datamb/1000).toFixed(decimalPlaces);
                if(datagb>1000){
                    var datatb= (datagb/1000).toFixed(decimalPlaces);
                    return datatb+" Bn";
                }
                else{
                    return datagb+" Mn";
                }
            }
            else{
                return datamb+" K";
            }
        }
        else{
            return data.toFixed(decimalPlaces);
        }
    }
    
    this.formatDecimalPlaces= function(data,decimalPlaces){
        return data.toFixed(decimalPlaces);
    }

});