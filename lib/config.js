var dom = document.getElementById("container");
var myChart = echarts.init(dom);
var app = {};
option = null;
app.title = 'city-vein';

var path = '';
try {
    if (root) path = '.';
} catch (e) {
    path = '..';
}

myChart.setOption(option = {
    bmap: {
        center: position,
        zoom: scale,
        roam: true,
        mapStyle: {
            'styleJson': [
                {
                    'featureType': 'water',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#031628'
                    }
                },
                {
                    'featureType': 'land',
                    'elementType': 'geometry',
                    'stylers': {
                        'color': '#000102'
                    }
                },
                {
                    'featureType': 'highway',
                    'elementType': 'all',
                    'stylers': {
                        'visibility': 'off'
                    }
                },
                {
                    'featureType': 'arterial',
                    'elementType': 'geometry.fill',
                    'stylers': {
                        'color': '#000000'
                    }
                },
                {
                    'featureType': 'arterial',
                    'elementType': 'geometry.stroke',
                    'stylers': {
                        'color': '#0b3d51'
                    }
                },
                {
                    'featureType': 'local',
                    'elementType': 'geometry',
                    'stylers': {
                        'color': '#000000'
                    }
                },
                {
                    'featureType': 'railway',
                    'elementType': 'geometry.fill',
                    'stylers': {
                        'color': '#000000'
                    }
                },
                {
                    'featureType': 'railway',
                    'elementType': 'geometry.stroke',
                    'stylers': {
                        'color': '#08304b'
                    }
                },
                {
                    'featureType': 'subway',
                    'elementType': 'geometry',
                    'stylers': {
                        'lightness': -70
                    }
                },
                {
                    'featureType': 'building',
                    'elementType': 'geometry.fill',
                    'stylers': {
                        'color': '#000000'
                    }
                },
                {
                    'featureType': 'all',
                    'elementType': 'labels.text.fill',
                    'stylers': {
                        'color': '#857f7f'
                    }
                },
                {
                    'featureType': 'all',
                    'elementType': 'labels.text.stroke',
                    'stylers': {
                        'color': '#000000'
                    }
                },
                {
                    'featureType': 'building',
                    'elementType': 'geometry',
                    'stylers': {
                        'color': '#022338'
                    }
                },
                {
                    'featureType': 'green',
                    'elementType': 'geometry',
                    'stylers': {
                        'color': '#062032'
                    }
                },
                {
                    'featureType': 'boundary',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#465b6c'
                    }
                },
                {
                    'featureType': 'manmade',
                    'elementType': 'all',
                    'stylers': {
                        'color': '#022338'
                    }
                },
                {
                    'featureType': 'label',
                    'elementType': 'all',
                    'stylers': {
                        'visibility': 'off'
                    }
                }
            ]
        }
    }
});


document.getElementById("loading").style.display = "inline";


$.getJSON(path + '/data/' + city + '.data', function (data) {
    var hStep = 300 / (data.length - 1);
    var busLines = [].concat.apply([], data.map(function (busLine, idx) {
        var prevPt;
        var points = [];
        for (var i = 0; i < busLine.length; i += 2) {
            var pt = [busLine[i], busLine[i + 1]];
            if (i > 0) {
                pt = [
                    prevPt[0] + pt[0],
                    prevPt[1] + pt[1]
                ];
            }
            prevPt = pt;

            points.push([pt[0], pt[1]]);
        }
        return {
            coords: points,
            lineStyle: {
                normal: {
                    color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * idx))
                }
            }
        };
    }));
    myChart.setOption(option = {
        series: [{
            type: 'lines',
            coordinateSystem: 'bmap',
            polyline: true,
            data: busLines,
            silent: true,
            lineStyle: {
                normal: {
                    // color: '#c23531',
                    // color: 'rgb(200, 35, 45)',
                    opacity: 0.2,
                    width: 1
                }
            },
            progressiveThreshold: 500,
            progressive: 200
        }, {
            type: 'lines',
            coordinateSystem: 'bmap',
            polyline: true,
            data: busLines,
            lineStyle: {
                normal: {
                    width: 0
                }
            },
            effect: {
                constantSpeed: 20,
                show: true,
                trailLength: 0.0,
                symbolSize: 1.5
            },
            zlevel: 1
        }]
    });
    document.getElementById("loading").style.display = "none";
});
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
