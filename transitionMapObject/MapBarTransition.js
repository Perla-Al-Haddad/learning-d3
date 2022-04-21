var bar_group_x = 150;
var hover_pause_disabled = false;

var margin = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
},
    width = parseInt(d3.select("#WealthIndicatorMap").style("width")),
    width = width - margin.left - margin.right,
    mapRatio = 0.7,
    height = width * mapRatio;

var projection = d3.geoMercator().translate([width / 2, height / 2]).scale(width / 1.8).center([20, 15]);
var path = d3.geoPath().projection(projection);

function resize() {
    width = parseInt(d3.select("#WealthIndicatorMap").style("width")),
        width = width - margin.left - margin.right,
        // height = width * mapRatio,
        projection.translate([width / 2, height / 2]);
    d3.select("#WealthIndicatorMap").select("svg").style("width", width + "px").style("height", height + "px"),
        d3.select("#WealthIndicatorMap").select("svg").selectAll("path").attr("d", path)
    bars_container_height = height;
}

d3.select(window).on("resize", resize);

$(document).ready(function () {
    console.log("Charting")
    loadRichnessGraph();
})

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return -1;
        } else if (a[prop] < b[prop]) {
            return 1;
        }
        return 0;
    }
}
function formatter(param) {
    var result = param / 1000000000000;
    if (result > 1) {
        return result.toFixed(1) + ' T';
    }
    else {
        result = param / 1000000000;
        if (result > 1) {
            return result.toFixed(1) + ' Bn';
        }
        else {
            result = param / 1000000;
            if (result > 1) {
                return result.toFixed(1) + ' M';
            }
            else {
                return addCommas(param);
            }
        }
    }
}
function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function loadRichnessGraph() {
    var bar_group_x = 150;
    var bar_group_right_margin = 50
    var gap = 7;
    var bars_container_height = height - 50;

    let countries_ISO = ["ARE", "BHR", "EGY", "IRQ", "JOR", "KWT", "MAR", "OMN", "PSE", "QAT", "SAU", "SDN"];

    var svg = d3.select("#WealthIndicatorMap")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .on("mouseover", () => {
            d3.selectAll(".border").transition().duration(0).delay(0)
            d3.select("#WealthIndicatorMap").select("svg").selectAll("path.empty").transition().duration(0).delay(0)
            // console.log(hover_pause_disabled)
            if (hover_pause_disabled)
                return;
            for (let i = 0; i < countries_ISO.length; i++) {
                let path = svg.select("#id_" + countries_ISO[i]);
                let bar = svg.select("#rect_" + countries_ISO[i]);
                path.transition().delay(0).duration(0);
                bar.transition().delay(0).duration(0);
            }
        })

    var features = svg.append("g");
    var features1 = svg.append("g");
    var features2 = svg.append("g");
    console.log("TEST")

    // $.get("UN.json", function(t, e) {
    //     console.log("test");
    // })

    d3.json("UN.json").then(function (e) {
        console.log(e)
        // if (t) return console.error(t);

        topojson.feature(e, e.objects.UNMap);
        topojson.feature(e, e.objects.UNBorders);
        topojson.feature(e, e.objects.UNBordersDashed);

        d3.json("Ranking_for_GIS_Richness.json").then(function (data) {
            let filteredData = $.grep(data.data, function (n) { return (n.year == 2020 && n.value != '-'); });

            filteredData.sort(GetSortOrder("value"));

            let max = Math.max.apply(Math, filteredData.map(function (o) { return o.value; }))
            let min = Math.min.apply(Math, filteredData.map(function (o) { return o.value; }))

            let country_names = [];
            for (let i = 0; i < filteredData.length; i++)
                country_names.push(filteredData[i].country)

            var bar_container_width = bars_container_height / filteredData.length;
            var bar_width = bar_container_width - gap * 2;

            var widthScale = d3.scaleLinear()
                .domain([0, max])
                .range([0, width - (bar_group_x + bar_group_right_margin)]);

            var countryScale = d3.scalePoint()
                .range([bar_container_width / 2, bars_container_height - bar_container_width / 2])
                .domain(country_names)

            svg.on("mouseout", () => {
                for (let i = 0; i < countries_ISO.length; i++) {
                    let path = svg.select("#id_" + countries_ISO[i]);
                    let bar = svg.select("#rect_" + countries_ISO[i]);
                    loop(path, bar, widthScale, colorScale);
                }
            })

            topoData = topojson.feature(e, e.objects.UNMap).features;
            for (let i = 0; i < topoData.length; i++) {
                let country_value = $.grep(filteredData, function (n) { return (topoData[i].properties.ISO3CD == n.iso); });
                if (country_value.length)
                    topoData[i].properties.value = country_value[0].value;
                else
                    topoData[i].properties.value = undefined;
            }

            var colorScale = d3.scaleLinear()
                .domain([min, max])
                .range(['#d9dcff', "#6772e5"]);

            var bar_group = svg.append("g").attr("name", "barGroup").attr("transform", "translate(" + bar_group_x + ", 10)");

            var xAxis = d3.axisBottom()
                .scale(widthScale)
                .tickSize(-height)
                .tickPadding(15)
                .ticks(4)

            var yAxis = d3.axisLeft()
                .scale(countryScale)

            bar_group.append("g")
                .attr("class", "axis xAxis")
                .attr("transform", "translate(0, " + (height - 50) + ")")
                .call(xAxis)
                .call(g => g.select(".domain").remove());

            bar_group.append("g")
                .attr("class", "axis yAxis")
                .call(yAxis);

            d3.selectAll(".axis").style("opacity", 0)

            d3.select(".xAxis").selectAll(".tick text").style("font-size", "14px").style("opacity", "0.7")
            d3.select(".xAxis").selectAll(".tick line").style("opacity", "0.3")

            d3.select(".domain").attr("stroke", "transparent")

            d3.select(".yAxis").selectAll(".tick text").style("font-size", "14px").style("opacity", "0.7").attr("transform", "rotate(-30)")
            d3.select(".yAxis").selectAll(".tick line").attr("stroke", "transparent")

            var bars = bar_group.selectAll("rect")
                .data(filteredData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("fill", "#6772E5")
                .attr("width", 0)
                .attr("height", bar_width)
                .attr("id", function (d) { return "rect_" + d.iso; })
                .attr("y", function (d, i) { return i * bar_container_width + gap })
                .on("mousemove", function (t) {
                    var coordinates = d3.pointer(this);
                    var x = coordinates[0] + 25;
                    var y = coordinates[1] + 20;
                    d3.select("#WealthIndicator_tooltip").style("top", y + "px").style("left", x + "px").select("#governorate").text(t.country),
                        d3.select("#WealthIndicator_tooltip").select(".tooltip_country_name").text(t.country),
                        d3.select("#WealthIndicator_tooltip").select(".tooltip_country_value").text(formatter(Math.floor(t.value) ? Math.floor(t.value) : "").replace("$", "")),
                        d3.select("#WealthIndicator_tooltip").classed("hidden", !1)
                })
                .on("mouseout", function () {
                    d3.select("#WealthIndicator_tooltip").classed("hidden", !0)
                });

            features.selectAll("path.country")
                .data(topojson.feature(e, e.objects.UNMap).features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", function (d) { return d.properties.ISO3CD + " country " + (((d.properties.value != undefined) ? "" : "empty")); })
                .style("fill", function (d) { return ((d.properties.value != undefined) ? colorScale(d.properties.value) : "white") })
                .attr("name", function (d) { return d.properties.ISO3CD })
                .attr("id", function (d) { return "id_" + d.properties.ISO3CD })
                .attr("stroke-width", 0)
                .on("mousemove", function (t) {
                    var coordinates = d3.pointer(t);
                    var x = coordinates[0] + 25;
                    var y = coordinates[1] + 20;
                    d3.select("#WealthIndicator_tooltip").style("top", y + "px").style("left", x + "px").text(t.target.__data__.properties.name)
                    d3.select("#WealthIndicator_tooltip").select(".tooltip_country_name").text(t.target.__data__.properties.name)
                    d3.select("#WealthIndicator_tooltip").select(".tooltip_country_value").text(function(d) { return formatter(Math.floor(t.target.__data__.properties.value) ? Math.floor(t.target.__data__.properties.value) : "").replace("$", "") })
                    d3.select("#WealthIndicator_tooltip").classed("hidden", !1)
                }).on("mouseout", function () {
                    d3.select("#WealthIndicator_tooltip").classed("hidden", !0)
                });

            for (let i = 0; i < countries_ISO.length; i++) {
                let path = svg.select("#id_" + countries_ISO[i]);
                let bar = svg.select("#rect_" + countries_ISO[i]);
                loop(path, bar, widthScale, colorScale);
            }
        })

        features1.selectAll("path")
            .data(topojson.feature(e, e.objects.UNBorders).features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke-width", .15)
            .attr("fill", "none")
            .attr("stroke", "#404040")
            .attr("class", "border")

        features2.selectAll("path")
            .data(topojson.feature(e, e.objects.UNBordersDashed).features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke-width", .15)
            .attr("fill", "none")
            .attr("stroke", "#404040")
            .attr("stroke-dasharray", "3,3")
            .attr("class", "border")
    });
}

function loop(path, bar, widthScale, colorScale) {
    const wait_time = 2000;
    const shape_transition_time = 700;
    const bar_small_delay = 700;

    d3.selectAll(".border")
        .transition()
        .delay(wait_time + shape_transition_time)
        .style("opacity", "0")
        .transition()
        .delay(wait_time * 2 + shape_transition_time * 2 + bar_small_delay * 2)
        .style("opacity", "1")

    d3.select("#WealthIndicatorMap").select("svg").selectAll("path.empty")
        .transition()
        .delay(wait_time + shape_transition_time)
        .duration(shape_transition_time)
        .style("display", "none")
        .transition()
        .duration(shape_transition_time)
        .delay(wait_time * 2 + shape_transition_time * 2 + bar_small_delay * 2) // 5000 + 700*4 = 7800 msec
        .style("display", "block")

    path
        .transition() // transition to beginning
        .on("start", () => {
            hover_pause_disabled = true;
            // console.log("country shrink start")
        })
        .delay(wait_time + shape_transition_time)
        .duration(shape_transition_time)
        .on("end", function () {
            hover_pause_disabled = false;
            d3.selectAll(".axis")
                .transition()
                .duration(100)
                .style("opacity", 1);
            // console.log("country shrink end")
        })
        .attr("transform-origin", function (d) {
            let this_x = getBoundingBoxCenter(this)[0];
            let this_y = getBoundingBoxCenter(this)[1];
            return this_x + " " + this_y;
        })
        .attr("transform", function (d) {
            let transform_str = "";
            let cur_bar = d3.select("#WealthIndicatorMap").select("svg").select("#rect_" + d.properties.ISO3CD);
            let cur_bar_y = cur_bar["_groups"][0][0].getAttribute("y")
            cur_bar_y = Math.floor(cur_bar_y);
            let this_x = getBoundingBoxCenter(this)[0];
            let this_y = getBoundingBoxCenter(this)[1];
            transform_str += "translate(" + (bar_group_x - this_x) + ", " + (cur_bar_y - this_y) + ") scale(0,0)";
            return transform_str;
        })
        .attr("stroke-width", 0)
        .style("fill", "#6772e5") // 5000 + 700 = 5700 msec
        // .on("end", function() { svg.on('.zoom', null); })
        .transition() // transition to country
        .on("start", () => {
            hover_pause_disabled = true;
            // console.log("country expand start")
        })
        .duration(shape_transition_time)
        .delay(wait_time * 2 + shape_transition_time * 4) // 5000 + 700*4 = 7800 msec
        .attr("transform", "")
        .style("fill", function (d) { return ((d.properties.value != undefined) ? colorScale(d.properties.value) : "white") })
        .attr("stroke-width", 0.5)
        .on("end", function (d) {
            loop(path, bar, widthScale, colorScale);
            hover_pause_disabled = false;
            // console.log("country expand end")
            // svg.call(zoom);
        });

    bar
        .transition() // wait until country shape gets to the beginning of the chart to expand bar
        .delay(wait_time + shape_transition_time + bar_small_delay)
        .duration(shape_transition_time)
        .attr("width", function (d) { return widthScale(d.value) }) // 5000 + 700 = 5700
        .on("start", () => {
            hover_pause_disabled = true;
        })
        .on("end", () => {
            hover_pause_disabled = false;
        })
        .transition() // shrink 
        .on("start", () => {
            hover_pause_disabled = true;
        })
        .delay(wait_time * 2 + shape_transition_time * 2)
        .attr("width", 0) // 5000 + 700 * 4 = 7800
        .on("end", function () {
            hover_pause_disabled = true;
            d3.selectAll(".axis")
                .transition()
                .duration(100)
                .style("opacity", 0)
        })
}
function getBoundingBoxCenter(selection) {
    // get the DOM element from a D3 selection
    // use the native SVG interface to get the bounding box
    var bbox = selection.getBBox();
    // return the center of the bounding box
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}
