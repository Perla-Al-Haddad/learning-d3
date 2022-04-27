class D3BarChart extends D3Chart {
    constructor(DOM_ID, chartRatio, margins, data_file_path, barColor) {
        super(DOM_ID, chartRatio, data_file_path);
        
        this.margins = margins;
        this.barColor = barColor;
        
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


        this.bars = this.bar_group.selectAll("rect")
            .data(data)
            .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("fill", this.barColor)
                .attr("width", function(d) { return widthScale(d.value); })
                .attr("orgWidth", function() { return d3.select(this).attr("width") })
                .attr("height", this.bar_width)
                .attr("id", function (d) { return "rect_" + d.iso; })
                .attr("y", function (d, i) { return i * that.bar_container_width + that.gap })

        this.yAxis = this.bar_group.append("g")
            .attr("class", "axis yAxis")
            .call(yAxis);

        this.xAxis.selectAll(".tick text").style("font-size", "14px").style("opacity", "0.7").attr("transform", "translate(0, -10)");
        this.xAxis.selectAll(".tick line").style("opacity", "0.3");

        this.yAxis.selectAll(".tick text").style("font-size", "16px").style("opacity", "0.7");
        this.yAxis.selectAll(".tick line").attr("stroke", "transparent");
        
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

    addTooltip() {
        setTimeout(() => {
            let that = this;
            this.Tooltip = d3.select("#" + this.id)
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-color", "transparent")
                .style("box-shadow", "0 0 4px #c0c2c9")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("position", "absolute")
                .style("white-space", "nowrap");
            
            console.log(d3.select("#" + this.id).selectAll(".bar"));
            d3.select("#" + this.id).selectAll(".bar").on("mousemove", function (t) {
                that.Tooltip    
                    .transition()
                    .duration(50)
                    .style("opacity", 1)
                that.Tooltip.html("<table class='mx-3 my-2'><tr><th>Country</th><td class='px-2' style='text-align: end'>" + t.target.__data__.country + 
                    "</td></tr><tr><th>" + "Richness</th><td class='px-2' style='text-align: end'>" + t.target.__data__.value + "</td></tr><table>");
                that.Tooltip
                    .style("left", (d3.pointer(t)[0] - 20 + parseInt(that.Tooltip.style("width").replace("px", ""))) + "px")
                    .style("top", (d3.pointer(t)[1]) + "px")
                    .style("z-index", 10);            
                })
                .on("mouseleave", function (t) {
                    that.Tooltip
                        .transition()
                        .duration(50)
                        .style("opacity", 0)  
                        .transition()
                        .duration(0)          
                        .style("left", "0px")
                        .style("top", "0px");
                });
        }, 500)
    }

}