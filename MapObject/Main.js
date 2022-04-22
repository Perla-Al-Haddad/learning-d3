
function resize() {
    let width = parseInt(d3.select("#MapDIV").style("width"));
    let mapRatio = parseFloat(d3.select("#MapDIV").select("svg").attr("map-ratio"));
    let height = width * mapRatio;

    d3.select("svg").attr("width", width);
    d3.select("svg").attr("height", height);
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

function getBoundingBoxCenter(selection) {
    // get the DOM element from a D3 selection
    // use the native SVG interface to get the bounding box
    var bbox = selection.getBBox();
    // return the center of the bounding box
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}

$(document).ready(function() {
    let map = new D3Map("MapDIV", 0.6, "UN.json", "Ranking_for_GIS_Richness.json", resize, false);
    map.init();

    let bar = new D3BarChart("MapDIV", 0.6, [200, 50, 50, 25], 12, "Ranking_for_GIS_Richness.json", resize, true);
    bar.init();

    let ct = new ChartTransition(map, bar, 1000);
    let cur_option = "map";
    setInterval(() => {
        if (cur_option == "map") {
            console.log(cur_option)
            cur_option = "bar";
            ct.map_bar_transition();
        } else if (cur_option == "bar") {
            console.log(cur_option)
            cur_option = "map";
            ct.bar_map_transition();
        }

    }, 2000) 

})
