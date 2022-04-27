
$(document).ready(function () {
    const margin = { top: 30, right: 30, bottom: 30, left: 60 },
        width = parseInt(d3.select("#LineChartDIV").style("width")) - margin.left - margin.right,
        height = width * 0.6;

    const svg = d3.select("#LineChartDIV")
        .append("svg")
        .style("background-color", "white")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",

        function (d) {
            return { date: d3.timeParse("%Y-%m-%d")(d.date), value: d.value }
        }).then(

            function (data) {

                const x = d3.scaleTime()
                    .domain(d3.extent(data, function (d) { return d.date; }))
                    .range([0, width]);
                svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x));

                const y = d3.scaleLinear()
                    .domain([0, d3.max(data, function (d) { return +d.value; })])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3.axisLeft(y));
                    
                let path = svg.append("path");
                
                path.datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.date) })
                    .y(function (d) { return y(d.value) })
                );
                    
                var totalLength = path.node().getTotalLength();

                path
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                  .delay(2000)
                  .duration(15000)
                  .ease(d3.easeLinear)
                  .attr("stroke-dashoffset", 0);
        });
});