class D3Map {
    constructor(DOM_ID, mapRatio, topojson_file_path, data_file_path, resize_func) {
        
        this.id = DOM_ID;
        this.mapRatio = mapRatio;
        this.topojson_file_path = topojson_file_path;
        this.data_file_path = data_file_path;

        this.resize_func = resize_func;

        this.width = parseInt(d3.select("#" + this.id).style("width"));
        this.height = this.width * this.mapRatio;

        this.projection = d3.geoMercator()
            .translate([this.width / 2, this.height / 2])
            .scale(this.width / 1.8)
            .center([20, 15]);
        this.path = d3.geoPath().projection(this.projection);

        this.bindEvents();
    }

    init() {
        if (d3.select("#" + this.id).select("svg")._groups[0][0]) {
            this.svg = d3.select("#" + this.id).select("svg")
        } else {
            this.svg = d3.select("#" + this.id)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("viewBox", "0 0 " + this.width + " " + this.height)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .style("background-color", "white")
                .attr("map-ratio", this.mapRatio);
        }

        this.chart_group = this.svg.append("g")
            .attr("class", "chartGroup");

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

                this.renderData(topojson_content, this.getColorScale(filteredData))
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
                .attr("class", "border")

        this.dashedBorderLayer.selectAll("path")
            .data(topojson.feature(topojson_content, topojson_content.objects.UNBordersDashed).features)
            .enter()
            .append("path")
                .attr("d", this.path)
                .attr("stroke-width", .15)
                .attr("fill", "none")
                .attr("stroke", "#404040")
                .attr("stroke-dasharray", "3,3")
                .attr("class", "border")
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
            .attr("stroke-width", 0)
    }

    filterData(data) {
        let filteredData = $.grep(data.data, function (n) { return (n.year == 2020 && n.value != '-'); });
        filteredData.sort(GetSortOrder("value"));
        return filteredData;
    }

    getColorScale(data) {
        let max = Math.max.apply(Math, data.map(function (o) { return o.value; }))
        let min = Math.min.apply(Math, data.map(function (o) { return o.value; }))

        let colorScale = d3.scaleLinear()
            .domain([min, max])
            .range(['#d9dcff', "#6772e5"]);
        
        return colorScale;
    }

    bindEvents() {
        d3.select(window).on("resize", this.resize_func)
    }
}

