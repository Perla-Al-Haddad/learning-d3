class MapPieTransition {
    constructor(chart_id, transition_duration, wait_duration, start_option, data_file_path, colorRange) {
        this.transition_duration = transition_duration;
        this.wait_duration = wait_duration;
        this.cur_option = start_option;
        this.chart_id = chart_id;
        this.data_file_path = data_file_path;

        console.log(colorRange)
        this.map_chart = new D3Map(this.chart_id, 0.6, "UN.json", this.data_file_path, colorRange);
        this.pie_chart = new D3PieChart(this.chart_id, 0.6, this.data_file_path);
    }

    map_pie_transition() {
        d3.json(this.data_file_path).then((data) => {
            let countries_ISO = this.pie_chart.getCountryNames(this.pie_chart.filterData(data), "iso");
            let that = this;
            d3.select("#" + this.chart_id).select("svg").select(".pieGroup").attr("opacity", 1);
        
            d3.select("#" + this.chart_id).select("svg").selectAll(".border")
                .transition()
                    .duration(this.transition_duration)
                    .style("opacity", "0");
                    
            d3.select("#" + this.chart_id).select("svg").selectAll(".country:not(.empty)")
                .transition()
                .duration(this.transition_duration)
                .attr("transform-origin", function () {
                    let this_x = getBoundingBoxCenter(this)[0];
                    let this_y = getBoundingBoxCenter(this)[1];
                    return this_x + " " + this_y;
                })
                .attr("transform", function () {
                    let transform_str = "";
                    let cur_arc_x = d3.select(this).attr("arc_x");
                    let cur_arc_y = d3.select(this).attr("arc_y");
                    cur_arc_x = parseFloat(cur_arc_x)
                    cur_arc_y = parseFloat(cur_arc_y)
                    cur_arc_x += that.map_chart.width/2;
                    cur_arc_y += that.map_chart.height/2;
                    let this_x = getBoundingBoxCenter(this)[0];
                    let this_y = getBoundingBoxCenter(this)[1];
                    transform_str += "translate(" + (cur_arc_x - this_x) + ", " + (cur_arc_y - this_y) + ") scale(0, 0)";
                    return transform_str;
                })
                .attr("stroke-width", 0);
            
            d3.select("#" + this.chart_id).select("svg").selectAll(".country.empty")
                .transition()
                    .duration(this.transition_duration)
                    .style("display", "none")
                    .style("pointer-events", "none");

            d3.select("#" + this.chart_id).select("svg").select(".labels").selectAll("text")
                .transition()
                .duration(this.transition_duration)
                .attr("opacity", 1);

            d3.select("#" + this.chart_id).select("svg").select(".lines").selectAll("polyline")
                .transition()
                .duration(this.transition_duration)
                .attr("opacity", 1);
                
            for (let i = 0; i < countries_ISO.length; i++) {
                let cur_arc = d3.select("#" + this.chart_id).select("svg").select("#arc_" + countries_ISO[i]);
                cur_arc
                    .transition()
                    .duration(0)
                    .attr("opacity", 1)
                    .transition()
                    .duration(this.transition_duration)
                    .style("pointer-events", "")
                    .attrTween('d', function (d) {
                        var i = d3.interpolate(d.startAngle, parseFloat(d3.select(this).attr("orgEndAngle")));
                        return function (t) {
                            d.endAngle = i(t);
                            return that.pie_chart.arc(d);
                        }
                    }); 
            }
        })
    }
    
    pie_map_transition() {
        d3.json(this.data_file_path).then((data) => {
            let that = this;
            let filteredData = this.pie_chart.filterData(data);
            let countries_ISO = this.pie_chart.getCountryNames(filteredData, "iso");
            let colorScale = this.map_chart.getColorScale(filteredData);

            d3.select("#" + this.chart_id).select("svg").selectAll(".border")
                .transition()
                    .duration(this.transition_duration)
                    .style("opacity", "1");
            
            d3.select("#" + this.chart_id).select("svg").select(".mapGroup").transition().duration(200).attr("opacity", 1);
            
            d3.select("#" + this.chart_id).select("svg").selectAll(".country.empty")
                .transition()
                    .duration(this.transition_duration)
                    .style("display", "block")
                    .style("pointer-events", "");
        
            d3.select("#" + this.chart_id).select("svg").selectAll(".country:not(.empty)")
                .transition()
                    .duration(this.transition_duration)
                    .attr("transform", "")
                    .style("fill", function (d) { return ((d.properties.value != undefined) ? colorScale(d.properties.value) : "white") })
                    .attr("stroke-width", 0.5);
        
            d3.select("#" + this.chart_id).select("svg").select(".labels").selectAll("text")
                .transition()
                .duration(this.transition_duration)
                .attr("opacity", 0);
        
            d3.select("#" + this.chart_id).select("svg").select(".lines").selectAll("polyline")
                .transition()
                .duration(this.transition_duration)
                .attr("opacity", 0);
        
            for (let i = 0; i < countries_ISO.length; i++) {
                let cur_arc = d3.select("#" + this.chart_id).select("svg").select("#arc_" + countries_ISO[i]);
                cur_arc
                    .transition()
                    .duration(this.transition_duration)
                    .attrTween('d', function (d) {
                        var i = d3.interpolate(d.endAngle, parseFloat(d3.select(this).attr("orgStartAngle")));
                        return function (t) {
                            d.endAngle = i(t);
                            return that.pie_chart.arc(d);
                        }
                    })
                    .style("pointer-events", "none")
                    .transition()
                    .duration(0)
                    .attr("opacity", 0);
            }
            
        }) 
    }

    startTransition() {
        if (this.cur_option == "pie") {
            d3.select("#" + this.chart_id).select("svg").select(".mapGroup").attr("opacity", 0);
            setTimeout(() => { this.map_chart.transitionToPiePosition(this.pie_chart); }, 500)
        } else if (this.cur_option == "map") {
            d3.select("#" + this.chart_id).select("svg").select(".pieGroup").attr("opacity", 0);
        }
        let timer = this.setTimer();
        this.bindEvents(timer);
    }

    setTimer() {
        return setInterval(() => {
            if (this.cur_option == "map") {
                this.cur_option = "pie";
                this.map_pie_transition();
            } else if (this.cur_option == "pie") {
                this.cur_option = "map";
                this.pie_map_transition();
            }
        }, this.wait_duration)
    }

    bindEvents(timer) {
        let that = this;
        $('#' + this.chart_id).hover(function () {
            clearInterval(timer);
        }, function () {
            timer = that.setTimer(); 
        });
    }

    resize() {
        this.map_chart.resize();
        this.pie_chart.resize();
    }
}