// Utility methods
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
    return Math.hypot(x2 - x1, y2 - y1);
}
function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

function getBoundingBoxCenter(selection) {
    var bbox = selection.getBBox();
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}

percToDeg = function (perc) {
    return perc * 360;
};
percToRad = function (perc) {
    return degToRad(percToDeg(perc));
};
degToRad = function (deg) {
    return deg * Math.PI / 180;
};

let country = "sau";

$(document).ready(function () {

    let map = new D3Map("MapDIV", D3ChartSettings.getInstance().chartRatio, D3ChartSettings.getInstance().escwaRegionMapTopoJSON_path,
        "data/Ranking_for_GIS_Richness.json", D3ChartSettings.getInstance().yellowRange);
    let bar = new D3BarChart("BarDIV", D3ChartSettings.getInstance().chartRatio, [175, 50, 50, 25], "data/Ranking_for_GIS_Richness.json", "#fac484")

    let mbt = new MapBarTransition("MapBarTransitionDIV", 850, 4000, "map", "data/Ranking_for_GIS_Richness.json", 
        D3ChartSettings.getInstance().blueRange, "#848deb", D3ChartSettings.getInstance().escwaRegionMapTopoJSON_path);
    mbt.startTransition();

    let economyMap = new D3Map("EconomySizeMapDIV", 1.25, D3ChartSettings.getInstance().escwaRegionMapTopoJSON_path,
        "data/Visualization Economy Size.json", D3ChartSettings.getInstance().purpleRange);
    let pie = new D3PieChart("PieDIV", D3ChartSettings.getInstance().chartRatio, "data/Visualization Economy Size.json");

    let mpt = new MapPieTransition("MapPieTransitionDIV", 850, 4000, "map", "data/Visualization Economy Size.json", 
        D3ChartSettings.getInstance().yellowRange, D3ChartSettings.getInstance().escwaRegionMapTopoJSON_path);
    mpt.startTransition();

    let SDGWheelChart = new D3SDGWheelChart("SDGWheelDIV", 0.75, "https://visor.unescwa.org/dbs/ArabSDG/ByCountry/", ["#ADB5BD", "#cc476f", "#f5be58", "#06b27d"]);

    const mapObjects = [map, bar, mbt, economyMap, pie, mpt, SDGWheelChart];

    d3.select(window).on("resize", () => {
        mapObjects.forEach(element => {
            element.resize();
        });
    });
})

