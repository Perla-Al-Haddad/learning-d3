/**
 * @abstract @class MapChartTransition
 * 
 */
class MapChartTransition {
    constructor(chart_id, transition_duration, wait_duration, start_option, data_file_path, colorRange, topojson_file_path) {
        if (this.constructor == MapChartTransition) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.transition_duration = transition_duration;
        this.wait_duration = wait_duration;
        this.cur_option = start_option;
        this.chart_id = chart_id;
        this.data_file_path = data_file_path;

        this.secondary_chart = null;
        this.map_chart = new D3Map(this.chart_id, D3ChartSettings.getInstance().chartRatio, topojson_file_path, this.data_file_path, colorRange);
    }

    /**
     * @abstract @method
     * @required
     */
    map_chart_transition() {
        throw new Error("the map_chart_transition method must be defined");
    }

    /**
     * @abstract @method
     * @required
     */
    chart_map_transition() {
        throw new Error("the chart_map_transition method must be defined");
    }

    /**
     * @abstract @method
     * @required
     * 
     * TODO: Could be refactored to be a global method for all children classes
     */
    startTransition() {
        throw new Error("the startTransition method must be defined");
    }

    /**
     * @abstract @method
     * @required
     * 
     * TODO: Could be refactored to be a global method for all children classes
     */
    setTimer() {
        throw new Error("the setTimer method must be defined");
    }

    bindEvents(timer) {
        let that = this;
        $('#' + this.chart_id).hover(function () {
            timer.stop();
        }, function () {
            timer = that.setTimer();
        });
    }

    resize() {
        this.map_chart.resize();
        this.secondary_chart.resize();
    }
}