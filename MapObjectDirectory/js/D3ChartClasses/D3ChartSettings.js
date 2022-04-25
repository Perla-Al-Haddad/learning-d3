/**
 * @singleton @class
 */

let instance = null;
class D3ChartSettings {

    constructor() {
        this.blueRange = ["#d9dcff", "#6772e5"];
        this.secondaryBlueRange = ["#514ea1", "#6fc6f4"];
        this.purpleRange = ["#f3e0f7", "#9f82ce"];
        this.yellowRange = ["#f3e79b", "#dd6d75"];

        this.SDGColors = ["#eb1c2d", "#d3a029", "#279b48", "#c31f33", "#ef402b", "#00aed9",
            "#fdb713", "#8f1838", "#f36d25", "#e11484", "#f99d26", "#cf8d2a",
            "#48773e", "#007dbc", "#5dbb46", "#01558b", "#183668"];

        this.escwaRegionCenterCoords = [20, 15];
        this.escwaRegionMapTopoJSON_path = "data/UN.json";
        this.chartRatio = 0.6;

        this.numberOfSDGs = 17;
    }

    static getInstance() {
        if (!instance) {
            instance = new D3ChartSettings();
        }
        return instance;
    }
}