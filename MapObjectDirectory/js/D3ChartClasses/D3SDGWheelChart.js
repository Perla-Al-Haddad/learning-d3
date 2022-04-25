class D3SDGWheelChart extends D3Chart {
    constructor(DOM_ID, chartRatio, data_file_path, tickColors) {
        super(DOM_ID, chartRatio, data_file_path);

        this.padding = 80;
        this.radius = (Math.min(this.height, this.width) - this.padding) / 2;

        this.wheelColorScale = d3.scaleOrdinal()
            .range(D3ChartSettings.getInstance().SDGColors);

        this.arc = d3.arc()
            .outerRadius(this.radius - this.radius * 0.32)
            .innerRadius(this.radius);

        this.pie = d3.pie()
            .value(function (d) { return d; });

        this.logoOffset = 0.32 * 0.75;

        this.neutralColor = tickColors[0];
        this.lowColor = tickColors[1];
        this.mediumColor = tickColors[2];
        this.highColor = tickColors[3];

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

        this.wheelGroup = this.svg.append("g")
            .attr("class", "wheelGroup")
            .attr("transform", "translate(" + this.width / 2 + ", " + this.height / 2 + ")");
        this.gaugeGroup = this.svg.append("g")
            .attr("class", "gaugeGroup")
            .attr("orgDim", Math.min(this.width, this.height))
            .attr("transform", "translate(" + this.width / 2 + ", " + this.height / 2 + ")");

        this.renderWheel();
        this.renderGaugeChart();

        this.getDataAndUpdateNeedlePosition(true);
    }

    getDataAndUpdateNeedlePosition(default_data = false, e = null) {
        let that = this;
        let goal_index = null;
        if (default_data) 
            goal_index = 0;
        $.get(this.data_file_path + country.toUpperCase(), function (data) {
            if (goal_index !== 0)
                goal_index = parseInt(e.target.getAttribute("name"));
            let finalcoloravg = data["response"][goal_index]["finalcoloravg"];
            let goalName = data["response"][goal_index].name.split(": ")[1];
            d3.select("#Goal_Name").text(goalName)
            that.updateNeedleWrapper(finalcoloravg);
        })
    }

    renderWheel() {
        let that = this;

        this.arcs = this.wheelGroup.selectAll(".arc")
            .data(this.pie(new Array(D3ChartSettings.getInstance().numberOfSDGs).fill(1)))
            .enter()
            .append("g")
            .attr("class", "arc");

        this.arcs.append("path")
            .attr("d", this.arc)
            .attr("name", function (d, i) { return i; })
            .attr("stroke", "white")
            .attr("stroke-width", this.radius / 100)
            .attr("fill", function (d, i) { return that.wheelColorScale(i); })
            .transition()
            .attrTween('d', function (d) {
                var i = d3.interpolate(d.startAngle, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return that.arc(d);
                }
            })

        this.arcs.on("click", function (e) {
            d3.selectAll(".arc")
                .transition()
                .attr("transform", 'translate(0, 0)');
            d3.select(this)
                .transition()
                .duration(100)
                .attr('transform', function (d) { return 'translate(' + that.arc.centroid(d)[0] / 20 + ',' + that.arc.centroid(d)[1] / 20 + ')'; });
            that.getDataAndUpdateNeedlePosition(false, e);
        });

        this.arcs.on('mouseover', function (e) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', '.7');
        })
            .on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', '1')
            });

        this.arcs.append("svg:image")
            .attr("name", function (d, i) { return i; })
            .attr("xlink:href", function (d, i) {
                return "SDGTransparentSVGs/sdg-" + (i + 1) + ".svg";
            });

        this.arcs.select("image")
            .attr("width", this.radius * this.logoOffset)
            .attr("height", this.radius * this.logoOffset)
            .attr("transform-origin", function (d) {
                return (-that.radius * that.logoOffset) / 2 + " " + (-that.radius * that.logoOffset) / 2;
            })
            .attr("transform", function (d) {
                return "translate(" + (that.arc.centroid(d)[0] - (that.radius * that.logoOffset) / 2)
                    + "," + (that.arc.centroid(d)[1] - (that.radius * that.logoOffset) / 2) + ")";
            });
    }

    renderGaugeChart() {
        const startAngle = 68;
        const tickSpacing = 17.5;
        const small_tickSpacing = 3.5;
        const neutral_lastTickAngle = 123;
        const low_lastTickAngle = neutral_lastTickAngle + (neutral_lastTickAngle - startAngle);
        const medium_lastTickAngle = low_lastTickAngle + (neutral_lastTickAngle - startAngle) + 4;
        const high_lastTickAngle = medium_lastTickAngle + (neutral_lastTickAngle - startAngle) + 4;
        const tickWidth = 4;
        const small_tickWidth = 1;

        let small_angle = this.draw_section_ticks(this.gaugeGroup, startAngle, neutral_lastTickAngle, this.neutralColor, small_tickSpacing, small_tickWidth);
        small_angle = this.draw_section_ticks(this.gaugeGroup, small_angle, low_lastTickAngle, this.lowColor, small_tickSpacing, small_tickWidth);
        small_angle = this.draw_section_ticks(this.gaugeGroup, small_angle, medium_lastTickAngle, this.mediumColor, small_tickSpacing, small_tickWidth);
        small_angle = this.draw_section_ticks(this.gaugeGroup, small_angle, high_lastTickAngle, this.highColor, small_tickSpacing, small_tickWidth);

        this.gaugeGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", Math.min(this.width, this.height) / 5.1)
            .attr("fill", "white");

        let angle = this.draw_section_ticks(this.gaugeGroup, startAngle, neutral_lastTickAngle, this.neutralColor, tickSpacing, tickWidth);
        angle = this.draw_section_ticks(this.gaugeGroup, angle, low_lastTickAngle, this.lowColor, tickSpacing, tickWidth);
        angle = this.draw_section_ticks(this.gaugeGroup, angle, medium_lastTickAngle, this.mediumColor, tickSpacing, tickWidth);
        angle = this.draw_section_ticks(this.gaugeGroup, angle, high_lastTickAngle, this.highColor, tickSpacing, tickWidth);

        this.gaugeGroup.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", Math.min(this.width, this.height) / 5.4)
            .attr("fill", "white");

        let neutral_gauge_arc = d3.arc().startAngle(-2).endAngle(-1).outerRadius(this.radius * 0.46).innerRadius(this.radius * 0.49);
        let low_gauge_arc = d3.arc().startAngle(-1).endAngle(0).outerRadius(this.radius * 0.46).innerRadius(this.radius * 0.49);
        let medium_gauge_arc = d3.arc().startAngle(0).endAngle(1).outerRadius(this.radius * 0.46).innerRadius(this.radius * 0.49);
        let high_gauge_arc = d3.arc().startAngle(1).endAngle(2).outerRadius(this.radius * 0.46).innerRadius(this.radius * 0.49);

        this.gaugeGroup.append("text")
            .text("")
            .attr('id', "Goal_Name")
            .attr("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", Math.min(this.width, this.height) / 7)
            .style("font-weight", 700)
            .style("font-size", "30px")
            .attr("fill", "#32325D");

        this.gaugeGroup.append("path").attr("d", neutral_gauge_arc).attr("fill", this.neutralColor).attr("stroke", "white").attr("stroke-width", 5)
        this.gaugeGroup.append("path").attr("d", low_gauge_arc).attr("fill", this.lowColor).attr("stroke", "white").attr("stroke-width", 5)
        this.gaugeGroup.append("path").attr("d", medium_gauge_arc).attr("fill", this.mediumColor).attr("stroke", "white").attr("stroke-width", 5)
        this.gaugeGroup.append("path").attr("d", high_gauge_arc).attr("fill", this.highColor).attr("stroke", "white").attr("stroke-width", 5)

        this.needle = new Needle(this.gaugeGroup);
        this.needle.render();
    }

    draw_section_ticks(chart, start_angle, last_TickAngle, strokeColor, tickSpacing, tickWidth) {
        let angle = start_angle;
        while (angle <= last_TickAngle) {
            chart.append("line")
                .attr("stroke", strokeColor)
                .attr('x1', 0)
                .attr('y1', this.radius * 0.48)
                .attr('x2', 0)
                .attr('y2', 0)
                .attr('stroke-width', tickWidth)
                .attr('transform', `rotate(${angle} ,0 ,0)`);
            angle += tickSpacing;
        }
        angle -= tickSpacing - 5;
        return angle;
    }

    updateNeedle(perc, needleColor) {
        this.needle.moveTo(perc);
        this.gaugeGroup.select("#client-needle")
            .attr("fill", needleColor);
        this.gaugeGroup.select(".needle-center")
            .attr("fill", needleColor);
    }

    updateNeedleWrapper(finalcoloravg) {
        switch (finalcoloravg) {
            case '0':
                this.updateNeedle(0.15, this.neutralColor);
                break;
            case '1':
                this.updateNeedle(0.48, this.lowColor);
                break;
            case '2':
                this.updateNeedle(0.8, this.mediumColor);
                break;
            case '3':
                this.updateNeedle(1.1, this.highColor);
                break;
        }
    }

} 