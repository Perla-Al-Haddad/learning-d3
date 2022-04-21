function round(x,k) {
	return Math.round(x * Math.pow(10,k)) / Math.pow(10,k);
}

function Transformation () { return {
	string: "",
	rotate: function(angle,x,y) {
		if (arguments.length < 3) {
			x = 0;
			y = 0;
		}
		this.string = "rotate("+round(angle,1)+","+round(x,1)+","+round(y,1)+") " + this.string;
		return this;
	},
	translate: function(x,y) {
		if (arguments.length < 2) {
			y = 0;
		}
		this.string = "translate("+round(x,1)+","+round(y,1)+") " + this.string;
		return this;
	},
	scale: function(x,y) {
		if (arguments.length < 2) {
			y = 0;
		}
		this.string = "scale("+round(x,1)+","+round(y,1)+") " + this.string;
		return this;
	},
	toString: function() { return this.string }
}; }

