var fs = require('fs');
var startDate = new Date('2014-1-1');
var endDate = new Date('2015-1-1');
var csv = 'date,value\n';

for (var i = startDate; i < endDate; startDate.setDate(startDate.getDate() + 10)) {
    csv += '' + startDate.toString() + ',' + Math.random() + '\n';
}

fs.writeFileSync('data.csv', csv);