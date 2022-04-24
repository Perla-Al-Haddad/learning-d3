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

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2-x1, y2-y1);
}
function midAngle(d){
    return d.startAngle + (d.endAngle - d.startAngle)/2;
}

function getBoundingBoxCenter(selection) {
    var bbox = selection.getBBox();
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}


$(document).ready(function() {
    let map = new D3Map("MapDIV", 0.6, "UN.json", "Ranking_for_GIS_Richness.json");
    let bar = new D3BarChart("BarDIV", 0.6, [175, 50, 50, 25], "Ranking_for_GIS_Richness.json")

    let mbt = new MapBarTransition("MapBarTransitionDIV", 850, 4000, "map", "Ranking_for_GIS_Richness.json");
    mbt.startTransition();

    let economyMap = new D3Map("EconomySizeMapDIV", 0.6, "UN.json", "Visualization Economy Size.json");
    let pie = new D3PieChart("PieDIV", 0.6, "Visualization Economy Size.json");

    let mpt = new MapPieTransition("MapPieTransitionDIV", 850, 4000, "map", "Visualization Economy Size.json");
    mpt.startTransition();

    const mapObjects = [map, bar, mbt, economyMap, pie, mpt];

    d3.select(window).on("resize", () => {
        mapObjects.forEach(element => {
            element.resize();
        });
    });
})

