Chart.types.Line.extend({
    name: "LineAlt",
    initialize: function (data) {
        //console.log(this.options);
        if (this.options.yAxisLabel) this.options.scaleLabel = '              ' + this.options.scaleLabel;

        Chart.types.Line.prototype.initialize.apply(this, arguments);

        if (this.options.yAxisLabel) this.scale.yAxisLabel = this.options.yAxisLabel;

        //console.log(this.options.yAxisLabel);
    },
    draw: function () {
        Chart.types.Line.prototype.draw.apply(this, arguments);

        if (this.scale.yAxisLabel) {
            var ctx = this.chart.ctx;
            ctx.save();
            // text alignment and color
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillStyle = this.options.scaleFontColor;
            // position
            var x = this.scale.xScalePaddingLeft * 0.2;
            var y = this.chart.height / 2;
            // change origin
            ctx.translate(x, y)
            // rotate text
            ctx.rotate(-90 * Math.PI / 180);
            ctx.fillText(this.scale.yAxisLabel, 0, 0);
            ctx.restore();
        }
    }
});

Chart.types.Bar.extend({
    name: "BarAlt",
    initialize: function (data) {
        //console.log(this.options);
        if (this.options.yAxisLabel) this.options.scaleLabel = '         ' + this.options.scaleLabel;

        Chart.types.Bar.prototype.initialize.apply(this, arguments);

        if (this.options.yAxisLabel) this.scale.yAxisLabel = this.options.yAxisLabel;

        //console.log('y axis', this.options.yAxisLabel);
    },
    draw: function () {
        Chart.types.Bar.prototype.draw.apply(this, arguments);

        if (this.scale.yAxisLabel) {
            //console.log('chart', this.chart);
            var ctx = this.chart.ctx;
            ctx.save();
            // text alignment and color
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = this.options.scaleFontColor;
            // position
            var x = this.scale.xScalePaddingLeft * 0.2;
            //var y = this.chart.height / 2;
            var y = 50;
            // change origin
            ctx.translate(x, y)
            // rotate text
            ctx.rotate(-90 * Math.PI / 180);
            ctx.fillText(this.scale.yAxisLabel, 0, 0);
            ctx.restore();
        }
    }
});

angular.module('chart.js')
    .directive('chartLineAlt', ['ChartJsFactory', function (ChartJsFactory) { 
        return new ChartJsFactory('LineAlt'); 
}]);

angular.module('chart.js')
    .directive('chartBarAlt', ['ChartJsFactory', function (ChartJsFactory) { 
        return new ChartJsFactory('BarAlt'); 
}]);