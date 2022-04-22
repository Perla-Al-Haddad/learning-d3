class ChartTransition {
    constructor(map_chart, bar_chart, transition_duration) {
        this.map_chart = map_chart;
        this.bar_chart = bar_chart;
        this.transition_duration = transition_duration;

        if (this.map_chart.id != this.bar_chart.id) 
            console.error("Charts do not belong to the same div");
    }

    map_bar_transition() {
        let that = this;
        d3.select("#" + this.map_chart.id).select("svg").selectAll("path.border")
            .transition()
            .duration(this.transition_duration)
            .style("opacity", "0")
            
        d3.select("#" + this.map_chart.id).select("svg").selectAll("path.empty")
            .transition()
            .duration(this.transition_duration)
            .style("display", "none")
            
        d3.select("#" + this.map_chart.id).select("svg").selectAll("path.country:not(.empty)")
            .transition() 
            .duration(this.transition_duration)
            .on("end", function() {
                d3.select("#" + that.map_chart.id).select("svg").selectAll(".axis")
                    .transition()
                    .duration(100)
                    .style("opacity", 1);
            })
            .attr("transform-origin", function (d) {
                let this_x = getBoundingBoxCenter(this)[0];
                let this_y = getBoundingBoxCenter(this)[1];
                return this_x + " " + this_y;
            })
            .attr("transform", function (d) {
                let transform_str = "";
                let cur_bar = d3.select("#" + that.map_chart.id).select("svg").select("#rect_" + d.properties.ISO3CD);
                let cur_bar_y = cur_bar.attr("y")
                cur_bar_y = Math.floor(cur_bar_y);
                let this_x = getBoundingBoxCenter(this)[0];
                let this_y = getBoundingBoxCenter(this)[1];
                transform_str += "translate(" + (that.bar_chart.margins[0] - this_x) + ", " + (cur_bar_y - this_y) + ") scale(0,0)";
                return transform_str;
            })
            .attr("stroke-width", 0)
    
        d3.select("#" + this.map_chart.id).select("svg").selectAll("rect")
            .transition() // wait until country shape gets to the beginning of the chart to expand bar
            .delay(this.transition_duration)
            .duration(this.transition_duration)
            .attr("width", function() { return d3.select(this).attr("orgWidth") } ) // 5000 + 700 = 5700
    }

    bar_map_transition() {
        let that = this;
        d3.select("#" + this.map_chart.id).select("svg").selectAll("path.border")
            .transition()
            .duration(this.trans_duration)
            .style("opacity", "1")
            
        d3.select("#" + this.map_chart.id).select("svg").selectAll("path.empty")
            .transition()
            .duration(this.transition_duration)
            .style("display", "block")
            
        d3.select("#" + this.map_chart.id).select("svg").selectAll("path.country:not(.empty)")
            .transition() 
            .delay(this.transition_duration)
            .duration(this.transition_duration)
            .attr("transform", "")
            .attr("stroke-width", 0)
            
        d3.select("#" + that.map_chart.id).select("svg").selectAll(".axis")
            .transition()
            .duration(this.transition_duration)
            .style("opacity", 0);
    
        d3.select("#" + this.map_chart.id).select("svg").selectAll("rect")
            .transition() // wait until country shape gets to the beginning of the chart to expand bar
            .duration(this.transition_duration)
            .attr("width", 0 ) // 5000 + 700 = 5700
    }

    init() {

    }

    bindEvents() {

    }
}