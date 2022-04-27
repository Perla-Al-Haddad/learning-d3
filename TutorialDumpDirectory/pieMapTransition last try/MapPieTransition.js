var width = parseInt(d3.select("#EconomySize").style("width")),
    width = width;
    mapRatio = 0.7,
    height = width * mapRatio;

var projection = d3.geoMercator().translate([width / 2, height / 2]).scale(width / 1.8).center([20, 15]);
var path = d3.geoPath().projection(projection);

d3.select(window).on("resize", resize);

$(document).ready(function () {
    fillEconomySizeChart();
})

function resize() {
    width = parseInt(d3.select("#EconomySize").style("width")),
        width = width;
        projection.translate([width / 2, height / 2]);
    d3.select("#EconomySize").select("svg").style("width", width + "px").style("height", height + "px"),
        d3.select("#EconomySize").select("svg").selectAll("path").attr("d", path)
}

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

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2-x1, y2-y1);
}

function fillEconomySizeChart() {

    var svg = d3.select("#EconomySize")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin meet")

    var features = svg.append("g");
    var features1 = svg.append("g");
    var features2 = svg.append("g");

    d3.json("UN.json").then(function (e) {

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

            var radius = Math.min(width, height) / 2;

            var arc = d3.arc()
                .outerRadius(radius * 0.7)
                .innerRadius(radius * 0.35)
                .cornerRadius(5);

            topoData = topojson.feature(e, e.objects.UNMap).features;
            for (let i = 0; i < topoData.length; i++) {
                let country_value = $.grep(filteredData, function (n) { return (topoData[i].properties.ISO3CD == n.iso); });
                if (country_value.length)
                    topoData[i].properties.value = country_value[0].value;
                else
                    topoData[i].properties.value = undefined;
            }

            var pieGroup = svg.append("g")
                .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");
            
            pieGroup.append("g")
                .attr("class", "slices");
            pieGroup.append("g")
                .attr("class", "labels");
            pieGroup.append("g")
                .attr("class", "lines");
        
            var pieColorScale = d3.scaleOrdinal()
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

            var outerArc = d3.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9);
                
            var pie = d3.pie()
                .value(function (d) { return d.value; });
            
            var arcs = pieGroup.select(".slices").selectAll(".arc")
                .data(pie(filteredData))
                .enter()
                .append("g")
                .attr("class", "arc");

            arcs.append("path")
                .attr("d", arc)
                .attr("opacity", 0)
                .attr("id", function (d, i) { return "arc_" + d.data.iso; })
                .attr("fill", function (d, i) { return pieColorScale(i); })
                .on("mousemove", function (t) {
                    var coordinates = d3.pointer(t);
                    var x = coordinates[0] + 25 + width/2;
                    var y = coordinates[1] + 20 + height/2;
                    d3.select("#WealthIndicator_tooltip").style("top", y + "px").style("left", x + "px").text(t.target.__data__.name)
                    d3.select("#WealthIndicator_tooltip").select(".tooltip_country_name").text(t.target.__data__.name)
                    d3.select("#WealthIndicator_tooltip").select(".tooltip_country_value").text(function(d) { return formatter(Math.floor(t.target.__data__.value) ? Math.floor(t.target.__data__.value) : "").replace("$", "") })
                    d3.select("#WealthIndicator_tooltip").classed("hidden", !1)
                }).on("mouseout", function () {
                    d3.select("#WealthIndicator_tooltip").classed("hidden", !0)
                })
                .style("pointer-events", "none");

                arcs.selectAll("path")
                    .attr("orgStartAngle", function(d) { return d.startAngle; })
                    .attr("orgEndAngle", function(d) { return d.endAngle; })

            arcs.on('mouseover', function (e) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr('transform', function (d) { return 'scale(1.1, 1.1)'; });
                d3.select("#label_" + e.target.__data__.data.iso)
                    .transition()
                    .duration(500)
                    .attr("font-size", "18px")
                    .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "block"; })
                    .style("text-shadow", "0px 0px 5px white")
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
                    .attr("font-size", "12px")
                    .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "none"; })
                d3.select("#line_" + e.target.__data__.data.iso)
                    .transition()
                    .duration(500)
                    .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "none"; })
            });

            var text = svg.select(".labels")
                .selectAll("text")
                .data(pie(filteredData))
                .enter()
                    .append("text")
                    .attr("font-size", "12px")
                    .attr("id", function (d) { return "label_" + d.data.iso; })
                    .text(function(d) {
                        return d.data.country;
                    })
                    .attr("x", function(d) {
                        var pos = outerArc.centroid(d);
                        (pos[0] > 0) ? pos[0] += 20 : pos[0] -= 20;
                        return pos[0]
                    })
                    .attr("y", function(d) {
                        var pos = outerArc.centroid(d);
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
                            if (dist < 21) {
                                if (d3.select(previous_node).attr("opacity") != "none")
                                    return "none";
                            }
                        }
                    })
                    .attr("class", function(d) { return (d3.select(this).attr("display") == "none") ? "hidden_cluster" : "" })
                    .attr("opacity", 0);

            function midAngle(d){
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }

            text.on("mouseover", function(e) {
                d3.select(this)
                .transition()
                    .duration(500)
                    .attr("font-size", "18px")
                    .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "block"; })
                    .style("text-shadow", "0px 0px 5px white")    
                d3.select("#arc_" + e.target.__data__.data.iso)
                    .transition()
                    .duration(500)
                    .attr('transform', function (d) { return 'scale(1.1, 1.1)'; });
                d3.select("#line_" + e.target.__data__.data.iso)
                    .transition()
                    .duration(500)
                    .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "block"; })
            })
            .on('mouseout', function (e) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("font-size", "12px")
                    .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "none"; })
                d3.select("#arc_" + e.target.__data__.data.iso)
                    .transition()
                    .attr("transform", 'translate(0, 0)');
                d3.select("#line_" + e.target.__data__.data.iso)
                    .transition()
                    .duration(500)
                    .attr("display", function (d) { if (d3.select(this).attr("class") == "hidden_cluster") return "none"; })
            });

            text.transition().duration(0)
                .styleTween("text-anchor", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start":"end";
                    };
                })
                
            text.exit()
                .remove();

            var polyline = pieGroup.select(".lines").selectAll("polyline")
                .data(pie(filteredData));
            
            polyline.enter()
                .append("polyline")
                .attr("fill", "transparent")
                .attr("stroke-width", 1.5)
                .attr("id", function(d) { return "line_" + d.data.iso; })
                .attr("stroke", function(d) { return d3.select("#arc_" + d.data.iso).attr("fill") })
                .attr("points", function(d) { 
                    var pos = outerArc.centroid(d);
                    (d3.select("#label_" + d.data.iso).attr("x") > 0) ? pos[0] += 15 : pos[0] -= 15
                    return [arc.centroid(d), outerArc.centroid(d), pos];
                })
                .attr("display", function(d) { return d3.select("#label_" + d.data.iso).attr("display") })
                .attr("class", function(d) { return (d3.select(this).attr("display") == "none") ? "hidden_cluster" : "" })
                .attr("opacity", 0);
                
            polyline.exit()
                .remove();

            var colorScale = d3.scaleLinear()
                .domain([min, max])
                .range(['#d9dcff', "#6772e5"]);

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

            let currentOption = "map";
            let trans_duration = 1000;
            var timer = setInterval(function () {
                if (currentOption == "map") {
                    currentOption = "pie"
                    map_chart_transition(trans_duration, arc)
                }
                else if (currentOption == "pie") {
                    currentOption = "map"
                    pie_map_transition(trans_duration, arc, colorScale)
                }
            }, 4000);

            $('#EconomySize').hover(function (ev) {
                clearInterval(timer);
            }, function (ev) {
                timer = setInterval(function () {
                    if (currentOption == "map") {
                        currentOption = "pie"
                        map_chart_transition(trans_duration, arc)
                    }
                    else if (currentOption == "pie") {
                        currentOption = "map"
                        pie_map_transition(trans_duration, arc, colorScale)
                    }
                }, 4000);
            });
            
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

function map_chart_transition(trans_duration, arc_func) {
    let countries_ISO = ["ARE", "BHR", "EGY", "IRQ", "JOR", "KWT", "MAR", "OMN", "PSE", "QAT", "SAU", "SDN"];

    d3.selectAll(".border")
        .transition()
            .duration(trans_duration)
            .style("opacity", "0")
            
    d3.selectAll(".country:not(.empty)")
        .transition()
        .duration(trans_duration)
        .attr("transform-origin", function (d) {
            let this_x = getBoundingBoxCenter(this)[0];
            let this_y = getBoundingBoxCenter(this)[1];
            return this_x + " " + this_y;
        })
        .attr("transform", function (d) {
            let transform_str = "";
            let cur_arc = d3.select("#EconomySize").select("svg").select("#arc_" + d.properties.ISO3CD);
            let cur_arc_x = getBoundingBoxCenter(cur_arc.node())[0];
            let cur_arc_y = getBoundingBoxCenter(cur_arc.node())[1];
            cur_arc_x += width/2;
            cur_arc_y += height/2;
            let this_x = getBoundingBoxCenter(this)[0];
            let this_y = getBoundingBoxCenter(this)[1];
            transform_str += "translate(" + (cur_arc_x - this_x) + ", " + (cur_arc_y - this_y) + ") scale(0, 0)";
            return transform_str;
        })
        .attr("stroke-width", 0)
    
    d3.select("#EconomySize").select("svg").selectAll(".country.empty")
        .transition()
            .duration(trans_duration)
            .style("display", "none")
            .style("pointer-events", "none");

    d3.select(".labels").selectAll("text")
        .transition()
        .duration(trans_duration)
        .attr("opacity", 1)

    d3.select(".lines").selectAll("polyline")
        .transition()
        .duration(trans_duration)
        .attr("opacity", 1)
        
    for (let i = 0; i < countries_ISO.length; i++) {
        let cur_arc = d3.select("#arc_" + countries_ISO[i]);
        cur_arc
            .transition()
            .duration(trans_duration)
            .attr("display", "block")
            .attr("opacity", 1)
            .style("pointer-events", "")
            .attrTween('d', function (d) {
                var i = d3.interpolate(d.startAngle, parseFloat(d3.select(this).attr("orgEndAngle")));
                return function (t) {
                    d.endAngle = i(t);
                    return arc_func(d);
                }
            }); 
    }
}

function pie_map_transition(trans_duration, arc_func, colorScale) {
    let countries_ISO = ["ARE", "BHR", "EGY", "IRQ", "JOR", "KWT", "MAR", "OMN", "PSE", "QAT", "SAU", "SDN"];

    d3.selectAll(".border")
        .transition()
            .duration(trans_duration)
            .style("opacity", "1")
    
    d3.select("#EconomySize").select("svg").selectAll(".country.empty")
        .transition()
            .duration(trans_duration)
            .style("display", "block")
            .style("pointer-events", "");

    d3.selectAll(".country:not(.empty)")
        .transition()
            .duration(trans_duration)
            .attr("transform", "")
            .style("fill", function (d) { return ((d.properties.value != undefined) ? colorScale(d.properties.value) : "white") })
            .attr("stroke-width", 0.5)

    d3.select(".labels").selectAll("text")
        .transition()
        .duration(trans_duration)
        .attr("opacity", 0)

    d3.select(".lines").selectAll("polyline")
        .transition()
        .duration(trans_duration)
        .attr("opacity", 0)

    for (let i = 0; i < countries_ISO.length; i++) {
        let cur_arc = d3.select("#arc_" + countries_ISO[i]);
        cur_arc
            .transition()
            .duration(trans_duration)
            .attr("opacity", 0)
            .attrTween('d', function (d) {
                var i = d3.interpolate(d.endAngle, parseFloat(d3.select(this).attr("orgStartAngle")));
                return function (t) {
                    d.endAngle = i(t);
                    return arc_func(d);
                }
            })
            .style("pointer-events", "none")
            .transition()
            .delay(trans_duration)
            .duration(0)
            .attr("display", "none")
    }
}

function getBoundingBoxCenter(selection) {
    // get the DOM element from a D3 selection
    // use the native SVG interface to get the bounding box
    var bbox = selection.getBBox();
    // return the center of the bounding box
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}

// function pie_loop(path, pie_arc, colorScale, arc_func) {

//     const pie_transition_duration = 1000;
//     const pie_delay_time = 3000;
//     const pie_small = 250;

//     d3.selectAll(".border")
//         .transition()
//             .on("start", function() {
//                 hover_pause_disabled = true;
//             })
//             .delay(pie_delay_time*2)
//             .duration(pie_transition_duration)
//             .style("opacity", "0")
//             .on("end", function() {
//                 hover_pause_disabled = false;
//             })
//         .transition()
//             .on("start", function() {
//                 hover_pause_disabled = true;
//             })    
//             .delay(pie_delay_time + pie_transition_duration)
//             .duration(pie_transition_duration)
//             .style("opacity", "1")
//             .on("end", function() {
//                 hover_pause_disabled = false;
//             })

//     d3.select("#EconomySize").select("svg").selectAll("path.empty")
//         .transition()
//             .on("start", function() {
//                 hover_pause_disabled = true;
//             })
//             .delay(pie_delay_time*2)
//             .duration(pie_transition_duration)
//             .style("display", "none")
//             .on("end", function() {
//                 hover_pause_disabled = false;
//             })
//         .transition()
//             .on("start", function() {
//                 hover_pause_disabled = true;
//             })
//             .delay(pie_delay_time + pie_transition_duration)
//             .duration(pie_transition_duration)
//             .style("display", "block")
//             .on("end", function() {
//                 hover_pause_disabled = false;
//             })

//     path
//         .transition()
//         .on("start", () => {
//             hover_pause_disabled = true;
//         })
//         .delay(pie_delay_time*2)
//         .duration(pie_transition_duration)
//         .attr("transform-origin", function (d) {
//             let this_x = getBoundingBoxCenter(this)[0];
//             let this_y = getBoundingBoxCenter(this)[1];
//             return this_x + " " + this_y;
//         })
//         .attr("transform", function (d) {
//             let transform_str = "";
//             let cur_arc = d3.select("#EconomySize").select("svg").select("#arc_" + d.properties.ISO3CD);
//             let cur_arc_x = getBoundingBoxCenter(cur_arc.node())[0];
//             let cur_arc_y = getBoundingBoxCenter(cur_arc.node())[1];
//             cur_arc_x += width/2;
//             cur_arc_y += height/2;
//             let this_x = getBoundingBoxCenter(this)[0];
//             let this_y = getBoundingBoxCenter(this)[1];
//             transform_str += "translate(" + (cur_arc_x - this_x) + ", " + (cur_arc_y - this_y) + ") scale(0, 0)";
//             return transform_str;
//         })
//         .attr("stroke-width", 0)
//         .on("end", function () {
//             hover_pause_disabled = false;
//         })
//         .transition() 
//         .on("start", function() {
//             hover_pause_disabled = true;
//         })
//         .delay((pie_delay_time + pie_transition_duration)) 
//         .duration(pie_transition_duration)
//         .attr("transform", "")
//         .style("fill", function (d) { return ((d.properties.value != undefined) ? colorScale(d.properties.value) : "white") })
//         .attr("stroke-width", 0.5)
//         .on("end", function () {
//             hover_pause_disabled = false;
//         })

//     let oldEndAngle = pie_arc.node().__data__.endAngle;
//     d3.select(".labels")
//         .selectAll("text")
//         .transition()
//         .on("start", function() {
//             hover_pause_disabled = true;
//         })
//         .delay(pie_delay_time - pie_small)
//         .duration(pie_transition_duration)
//         .attr("opacity", 0)
//         .on("end", function() {
//             hover_pause_disabled = false;
//             d3.select(".labels")
//                 .selectAll("text")
//                 .transition()
//                 .on("start", function() {
//                     hover_pause_disabled = true;
//                 })
//                 .delay(pie_delay_time - pie_small)
//                 .duration(pie_transition_duration)
//                 .attr("display", function (d) { return (d3.select(this).attr("class") != "hidden_cluster") ? "block" : "none"; }) 
//                 .attr("opacity", 1)
//                 .on("end", function() {
//                     hover_pause_disabled = false;
//                 })
//         })

//     d3.select(".lines")
//         .selectAll("polyline")
//         .transition()
//         .on("start", function() {
//             hover_pause_disabled = true;
//         })
//         .delay(pie_delay_time - pie_small)
//         .duration(pie_transition_duration)
//         .attr("opacity", 0)
//         .on("end", function() {
//             hover_pause_disabled = false;
//             d3.select(".lines")
//                 .selectAll("polyline")
//                 .transition()
//                 .on("start", function() {
//                     hover_pause_disabled = true;
//                 })
//                 .delay(pie_delay_time - pie_small)
//                 .duration(pie_transition_duration)
//                 .attr("display", function (d) { return (d3.select(this).attr("class") != "hidden_cluster") ? "block" : "none"; }) 
//                 .attr("opacity", 1)
//                 .on("end", function() {
//                     hover_pause_disabled = false;
//                 })
//         })
    
//     pie_arc
//         .transition()
//         .on("start", function() {
//             hover_pause_disabled = true;
//         })
//         .delay(pie_delay_time - pie_small)
//         .duration(pie_transition_duration)
//         .attrTween('d', function (d) {
//             var interpolateEndAngle = d3.interpolate(d.endAngle, d.startAngle);
//             return function (t) {
//                 d.endAngle = interpolateEndAngle(t);
//                 return arc_func(d);
//             }
//         })
//         .attr("opacity", 0)
//         .on("end", function(d) {
//             hover_pause_disabled = false;
//             pie_arc
//                 .transition()
//                 .on("start", function() {
//                     hover_pause_disabled = true;
//                 })
//                 .delay(pie_delay_time - pie_small)
//                 .duration(pie_transition_duration)
//                 .attrTween('d', function (d) {
//                     var i = d3.interpolate(d.startAngle, parseFloat(d3.select(this).attr("orgEndAngle")));
//                     return function (t) {
//                         d.endAngle = i(t);
//                         return arc_func(d);
//                     }
//                 })
//                 .attr("opacity", 1)
//                 .on("end", function() { 
//                     hover_pause_disabled = false;
//                     pie_loop(path, pie_arc, colorScale, arc_func) 
//                 })
//         })
// }
