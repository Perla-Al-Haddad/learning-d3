/**
 * @singleton @class
 */

let instance = null;
class D3ChartSettings {
    
    constructor() {
        this.blueRange = ["#d9dcff", "#6772e5"];
        this.secondaryBlurRange = [ "#E3F2FD", "#2196F3"];
        this.purpleRange = ["#f3e0f7","#9f82ce"];
        this.yellowRange = ["#f3e79b", "#dd6d75"];

        this.escwaRegionCenterCoords = [20, 15];
        this.escwaRegionMapTopoJSON_path = "data/UN.json";
        this.chartRatio = 0.6
    }

    static getInstance(){
        if(!instance){
            instance = new D3ChartSettings();
        }
        return instance;
    }
}