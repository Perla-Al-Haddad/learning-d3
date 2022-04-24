class D3Map {
    constructor(DOM_ID, chartRatio, topojson_file_path, data_file_path, colorRange) {
        this.id = DOM_ID;
        this.chartRatio = chartRatio;
        this.topojson_file_path = topojson_file_path;
        this.data_file_path = data_file_path;
        this.colorRange = colorRange;

        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.chartRatio;

        this.projection = d3.geoMercator()
            .translate([this.width / 2, this.height / 2])
            .scale(this.width / 1.8)
            .center([20, 15]);
        this.path = d3.geoPath().projection(this.projection);

        this.render();
    }

    render() {
        if (d3.select("#" + this.id).select("svg")._groups[0][0]) {
            this.svg = d3.select("#" + this.id).select("svg")
        } else {
            this.svg = d3.select("#" + this.id)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("viewBox", "0 0 " + this.width + " " + this.height)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .style("background-color", "white");
        }

        this.chart_group = this.svg.append("g")
            .attr("class", "mapGroup");

        this.dataLayer = this.chart_group.append("g").attr("class", "data-layer");
        this.solidBorderLayer = this.chart_group.append("g").attr("class", "solid-border-layer");
        this.dashedBorderLayer = this.chart_group.append("g").attr("class", "dashed-border-layer");

        d3.json(this.topojson_file_path)
            .then((topojson_content) => { this.renderBorders(topojson_content);
            d3.json(this.data_file_path).then((data => {
                let topoData = topojson.feature(topojson_content, topojson_content.objects.UNMap).features;
                let filteredData = this.filterData(data);

                for (let i = 0; i < topoData.length; i++) {
                    let country_value = $.grep(filteredData, function (n) { return ( topoData[i].properties.ISO3CD == n.iso); });
                    if (country_value.length)
                        topoData[i].properties.value = country_value[0].value;
                    else
                        topoData[i].properties.value = undefined;
                }

                this.renderData(topojson_content, this.getColorScale(filteredData));
            })) 
        });
    }
    
    renderBorders(topojson_content) {
        topojson.feature(topojson_content, topojson_content.objects.UNMap);
        topojson.feature(topojson_content, topojson_content.objects.UNBorders);
        topojson.feature(topojson_content, topojson_content.objects.UNBordersDashed);

        this.solidBorderLayer.selectAll("path")
            .data(topojson.feature(topojson_content, topojson_content.objects.UNBorders).features)
            .enter()
                .append("path")
                .attr("d", this.path)
                .attr("stroke-width", .15)
                .attr("fill", "none")
                .attr("stroke", "#404040")
                .attr("class", "border");

        this.dashedBorderLayer.selectAll("path")
            .data(topojson.feature(topojson_content, topojson_content.objects.UNBordersDashed).features)
            .enter()
            .append("path")
                .attr("d", this.path)
                .attr("stroke-width", .15)
                .attr("fill", "none")
                .attr("stroke", "#404040")
                .attr("stroke-dasharray", "3,3")
                .attr("class", "border");
    }

    renderData(topojson_content, colorScale) {
        this.dataLayer.selectAll("path.country")
            .data(topojson.feature(topojson_content, topojson_content.objects.UNMap).features)
            .enter()
            .append("path")
            .attr("d", this.path)
            .attr("class", function (d) { return d.properties.ISO3CD + " country " + (((d.properties.value != undefined) ? "" : "empty")); })
            .style("fill", function (d) { return ((d.properties.value != undefined) ? colorScale(d.properties.value) : "white") })
            .attr("name", function (d) { return d.properties.ISO3CD })
            .attr("orgColoc", function (d) { return ((d.properties.value != undefined) ? colorScale(d.properties.value) : "white") })
            .attr("id", function (d) { return "id_" + d.properties.ISO3CD })
            .attr("stroke-width", 0);

        if (d3.select("#" + this.id).select("svg").select(".pieGroup")._groups[0][0]) {
            let that = this;
            this.dataLayer.selectAll("path.country:not(.empty)")
                .attr("arc_x", function(d) {
                    let cur_arc = d3.select("#" + that.id).select("svg").select(".pieGroup").select("#arc_" + d.properties.ISO3CD);
                    let cur_arc_x = getBoundingBoxCenter(cur_arc.node())[0];
                    return cur_arc_x;
                })
                .attr("arc_y", function(d) {
                    let cur_arc = d3.select("#" + that.id).select("svg").select(".pieGroup").select("#arc_" + d.properties.ISO3CD);
                    let cur_arc_y = getBoundingBoxCenter(cur_arc.node())[1];
                    return cur_arc_y;
                });
        }
    }

    filterData(data) {
        let filteredData = $.grep(data.data, function (n) { return (n.year == 2020 && n.value != '-'); });
        filteredData.sort(GetSortOrder("value"));
        return filteredData;
    }

    transitionToBarPosition(barChart) {
        var that = this;
        d3.select("#" + this.id).select("svg").selectAll("path.country:not(.empty)")
            .transition() 
            .duration(1000)
            .attr("transform-origin", function (d) {
                let this_x = getBoundingBoxCenter(this)[0];
                let this_y = getBoundingBoxCenter(this)[1];
                return this_x + " " + this_y;
            })
            .attr("transform", function (d) {
                let transform_str = "";
                let cur_bar = d3.select("#" + that.id).select("svg").select("#rect_" + d.properties.ISO3CD);
                let cur_bar_y = cur_bar.attr("y")
                cur_bar_y = Math.floor(cur_bar_y);
                let this_x = getBoundingBoxCenter(this)[0];
                let this_y = getBoundingBoxCenter(this)[1];
                transform_str += "translate(" + (barChart.margins[0] - this_x) + ", " + (cur_bar_y - this_y) + ") scale(0,0)";
                return transform_str;
            });
    }
    transitionToPiePosition() {
        let that = this;
        d3.select("#" + this.id).select("svg").selectAll(".country:not(.empty)")
            .transition()
            .duration(1000)
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
                cur_arc_x += that.width/2;
                cur_arc_y += that.height/2;
                let this_x = getBoundingBoxCenter(this)[0];
                let this_y = getBoundingBoxCenter(this)[1];
                transform_str += "translate(" + (cur_arc_x - this_x) + ", " + (cur_arc_y - this_y) + ") scale(0, 0)";
                return transform_str;
            })
            .attr("stroke-width", 0);
    }

    getColorScale(data) {
        let max = Math.max.apply(Math, data.map(function (o) { return o.value; }))
        let min = Math.min.apply(Math, data.map(function (o) { return o.value; }))

        let colorScale = d3.scaleLinear()
            .domain([min, max])
            .range(this.colorRange);
        return colorScale;
    }
 
    resize() {
        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.chartRatio;
        d3.select("#" + this.id).select("svg").attr("width", this.width);
        d3.select("#" + this.id).select("svg").attr("height", this.height);
    }

}

