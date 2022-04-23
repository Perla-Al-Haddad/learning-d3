class D3BarChart {
    constructor(DOM_ID, chartRatio, margins, data_file_path) {
        this.id = DOM_ID;
        this.chartRatio = chartRatio;
        this.margins = margins;
        this.data_file_path = data_file_path;
        
        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.chartRatio;

        this.bars_container_height = this.height - this.margins[2];

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

        this.bar_group = this.svg.append("g")
            .attr("class", "barGroup")
            .attr("transform", "translate(" + this.margins[0] + ", " + this.margins[3] + ")");

        d3.json(this.data_file_path).then((data => {
            let filteredData = this.filterData(data);
            
            this.bar_container_width = this.bars_container_height / filteredData.length;
            this.gap = this.bar_container_width/4;
            this.bar_width = this.bar_container_width - this.gap * 2;
            
            let widthScale = this.getWidthScale(filteredData);
            let yScale = this.getYScale(filteredData, "country");

            this.renderData(filteredData, widthScale, yScale);
        }));
    }

    renderData(data, widthScale, yScale) {
        var that = this;
        
        var xAxis = d3.axisBottom()
            .scale(widthScale)
            .tickSize(-this.bars_container_height)
            .tickPadding(15)
            .ticks(4);

        var yAxis = d3.axisLeft()
            .scale(yScale);

        this.xAxis = this.bar_group.append("g")
            .attr("class", "axis xAxis")
            .attr("transform", "translate(0, " + this.bars_container_height + ")")
            .call(xAxis)
            .call(g => g.select(".domain").remove());

        this.yAxis = this.bar_group.append("g")
            .attr("class", "axis yAxis")
            .call(yAxis);

        this.xAxis.selectAll(".tick text").style("font-size", "14px").style("opacity", "0.7").attr("transform", "translate(0, -10)");
        this.xAxis.selectAll(".tick line").style("opacity", "0.3");

        this.yAxis.selectAll(".tick text").style("font-size", "16px").style("opacity", "0.7");
        this.yAxis.selectAll(".tick line").attr("stroke", "transparent");
        
        this.bars = this.bar_group.selectAll("rect")
            .data(data)
            .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("fill", "#6772E5")
                .attr("width", function(d) { return widthScale(d.value); })
                .attr("orgWidth", function() { return d3.select(this).attr("width") })
                .attr("height", this.bar_width)
                .attr("id", function (d) { return "rect_" + d.iso; })
                .attr("y", function (d, i) { return i * that.bar_container_width + that.gap });
    }

    getYScale(data, key) {
        let y_categories = [];
        for (let i = 0; i < data.length; i++)
            y_categories.push(data[i][key]);

        let yScale = d3.scalePoint()
            .range([this.bar_container_width / 2, this.bars_container_height - this.bar_container_width / 2])
            .domain(y_categories);
        return yScale;
    }

    getWidthScale(data) {
        let max = Math.max.apply(Math, data.map(function (o) { return o.value; }));

        let widthScale = d3.scaleLinear()
            .domain([0, max])
            .range([0, this.width - (this.margins[0] + this.margins[1])]);
        return widthScale;
    }

    filterData(data) {
        let filteredData = $.grep(data.data, function (n) { return (n.year == 2020 && n.value != '-'); });
        filteredData.sort(GetSortOrder("value"));
        return filteredData;
    }

    transitionToStartPosition() {
        d3.select("#" + this.id).select("svg").selectAll("rect")
            .transition()
            .duration(0)
            .attr("width", 0);
        d3.select("#" + this.id).select("svg").selectAll(".axis")
            .transition()
            .duration(0)
            .style("opacity", 0);
    }

    resize() {
        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.chartRatio;
        d3.select("#" + this.id).select("svg").attr("width", this.width);
        d3.select("#" + this.id).select("svg").attr("height", this.height);
    }
}