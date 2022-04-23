class D3PieChart {
    constructor(DOM_ID, chartRatio, data_file_path) {
        this.id = DOM_ID;
        this.chartRatio = chartRatio;
        this.data_file_path = data_file_path;
        
        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.chartRatio;

        this.radius = Math.min(this.width, this.height) / 2;

        this.arc = d3.arc()
            .outerRadius(this.radius * 0.7)
            .innerRadius(this.radius * 0.35)
            .cornerRadius(5);
        this.outerArc = d3.arc()
            .innerRadius(this.radius * 0.9)
            .outerRadius(this.radius * 0.9);

        this.pie = d3.pie()
            .value(function (d) { return d.value; });

        this.render();
    }

    render() {
        if (d3.select("#" + this.id).select("svg")._groups[0][0]) {
            this.svg = d3.select("#" + this.id).select("svg");
        } else {
            this.svg = d3.select("#" + this.id)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("viewBox", "0 0 " + this.width + " " + this.height)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .style("background-color", "white");
        }

        this.pieGroup = this.svg.append("g")
            .attr("class", "pieGroup")
            .attr("transform", "translate(" + this.width / 2 + ", " + this.height / 2 + ")");
    
        this.pieGroup.append("g").attr("class", "slices");
        this.pieGroup.append("g").attr("class", "labels");
        this.pieGroup.append("g").attr("class", "lines");

        d3.json(this.data_file_path).then((data => {
            let filteredData = this.filterData(data);
            this.renderArcs(filteredData);
            this.renderLabels(filteredData);
            this.renderLines(filteredData);
        }));
    }

    renderArcs(data) {
        let colorScale = this.getColorScale(data); 
        this.arcs = this.pieGroup.select(".slices").selectAll(".arc")
            .data(this.pie(data))
            .enter()
            .append("g")
            .attr("class", "arc")
                .append("path")
                .attr("d", this.arc)
                .attr("stroke", "white")
                .style("stroke-width", "1.5px")
                .attr("id", function (d) { return "arc_" + d.data.iso; })
                .attr("fill", function (d, i) { return colorScale(i); });

        this.arcs.on('mouseover', function (e) {
            d3.select(this)
                .transition()
                .duration(500)
                .attr('transform', function (d) { return 'scale(1.1, 1.1)'; });
            d3.select("#label_" + e.target.__data__.data.iso)
                .transition()
                .duration(500)
                .attr("font-size", "1.5em")
                .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "block"; })
            d3.select("#line_" + e.target.__data__.data.iso)
                .transition()
                .duration(500)
                .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "block"; })
        })
        .on('mouseout', function (e) {
            d3.select(this)
                .transition()
                .attr("transform", 'translate(0, 0)');
            d3.select("#label_" + e.target.__data__.data.iso)
                .transition()
                .duration(500)
                .attr("font-size", "1em")
                .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "none"; })
            d3.select("#line_" + e.target.__data__.data.iso)
                .transition()
                .duration(500)
                .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "none"; })
        });
    }

    renderLabels(data) {
        let that = this;
        this.labels = this.pieGroup.select(".labels")
            .selectAll("text")
            .data(this.pie(data))
            .enter()
                .append("text")
                .attr("font-size", "1em")
                .attr("id", function (d) { return "label_" + d.data.iso; })
                .each(function (d) {
                    var arr = d.data.country.split(" ");
                    for (let i = 0; i < arr.length; i++) {
                        d3.select(this).append("tspan")
                            .text(arr[i])
                            .attr("class", "tspan" + i)
                            .attr("dy", i ? "1.2em" : 0)
                            .attr("x", function(d) {
                                var pos = that.outerArc.centroid(d);
                                (pos[0] > 0) ? pos[0] += 20 : pos[0] -= 20;
                                return pos[0]
                            })
                    }
                })
                .attr("x", function(d) {
                    var pos = that.outerArc.centroid(d);
                    (pos[0] > 0) ? pos[0] += 20 : pos[0] -= 20;
                    return pos[0]
                })
                .attr("y", function(d) {
                    var pos = that.outerArc.centroid(d);
                    return pos[1];
                })
                .attr("display", function(d) {
                    let this_node, previous_node;
                    this_node = this;
                    previous_node = this.previousSibling;
                    if (this_node && previous_node) {
                        let this_node_coords = [d3.select(this_node).attr("x"), this_node.getAttribute("y")];
                        let previous_node_coords = [previous_node.getAttribute("x"), previous_node.getAttribute("y")];
                        let dist = distance(this_node_coords[0], this_node_coords[1], previous_node_coords[0], previous_node_coords[1])
                        if (dist < 25) {
                            if (d3.select(previous_node).attr("opacity") != "none")
                                return "none";
                        }
                    }
                })
                .attr("class", function(d) { return (d3.select(this).attr("display") == "none") ? "hidden_cluster" : "" });
        
        this.labels.transition().duration(0)
            .styleTween("text-anchor", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            });
    }

    renderLines(data) {
        let that = this;
        this.lines = this.pieGroup.select(".lines").selectAll("polyline")
            .data(this.pie(data))
            .enter()
                .append("polyline")
                .attr("fill", "transparent")
                .attr("stroke-width", 1.5)
                .attr("id", function(d) { return "line_" + d.data.iso; })
                .attr("stroke", function(d) { return d3.select("#arc_" + d.data.iso).attr("fill") })
                .attr("points", function(d) { 
                    var pos = that.outerArc.centroid(d);
                    (d3.select("#label_" + d.data.iso).attr("x") > 0) ? pos[0] += 15 : pos[0] -= 15
                    return [that.arc.centroid(d), that.outerArc.centroid(d), pos];
                })
                .attr("display", function(d) { return d3.select("#label_" + d.data.iso).attr("display") })
                .attr("class", function(d) { return (d3.select(this).attr("display") == "none") ? "hidden_cluster" : "" })
            .exit()
            .remove();
    }

    getColorScale(data) {
        let country_names = [];
        for (let i = 0; i < data.length; i++)
            country_names.push(data[i].country)

        return d3.scaleOrdinal()
            .domain(country_names)
            .range([
                "#5470c6",
                "#91cc75",
                "#fac858",
                "#ee6666",
                "#73c0de",
                "#3ba272",
                "#fc8452",
                "#9a60b4",
                "#ea7ccc"
            ]);
    }

    filterData(data) {
        let filteredData = $.grep(data.data, function (n) { return (n.year == 2020 && n.value != '-'); });
        filteredData.sort(GetSortOrder("value"));
        return filteredData;
    }

    resize() {
        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.chartRatio;
        d3.select("#" + this.id).select("svg").attr("width", this.width);
        d3.select("#" + this.id).select("svg").attr("height", this.height);
    }
}