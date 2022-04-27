var Needle = function () {
    //Helper function that returns the `d` value for moving the needle
    var recalcPointerPos = function (perc) {
        var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
        thetaRad = percToRad(perc / 2) - (0.4);
        centerX = 0;
        centerY = 0;
        topX = centerX - this.len * Math.cos(thetaRad);
        topY = centerY - this.len * Math.sin(thetaRad);
        leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
        leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
        rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
        rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
        return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    };
    function Needle(el) {
        this.el = el;
        this.len = el.attr("orgDim") / 5;
        this.radius = this.len / 20;
    }
    Needle.prototype.render = function () {
        this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
        return this.el.append('path').attr('class', 'needle').attr('id', 'client-needle').attr('d', recalcPointerPos.call(this, 0));
    };
    Needle.prototype.moveTo = function (perc) {
        var self,
            oldValue = this.perc || 0;
        this.perc = perc;
        self = this;
        this.el.transition().delay(100).ease(d3.easeBounce).duration(500).select('.needle').tween('progress', function () {
            return function (percentOfPercent) {
                var progress = oldValue + (percentOfPercent * (perc - oldValue));
                return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
            };
        });
    };
    return Needle;
}();
