/**
 * @abstract @class D3Chart
 * 
 */
class D3Chart {
    constructor(DOM_ID, chartRatio, data_file_path) {
        if (this.constructor == D3Chart) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.id = DOM_ID;
        this.chartRatio = chartRatio;
        this.data_file_path = data_file_path;
        
        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.chartRatio;
    }

    /**
     * @abstract @method
     * @required
     */
    render() {
        throw new Error("The render method must be defined");
    }

    resize() {
        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.chartRatio;
        d3.select("#" + this.id).select("svg").attr("width", this.width);
        d3.select("#" + this.id).select("svg").attr("height", this.height);
    }
}