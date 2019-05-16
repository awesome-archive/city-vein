var dom = document.getElementById("container");
var myChart = echarts.init(dom);

let load_city_vein = (city) => {
    document.getElementById("loading").style.display = "inline";
    myChart.clear();
    $.getJSON('data/' + city + '.json', function (data) {
        myChart.setOption(option = {
            bmap: {
                center: data['position'],
                zoom: data['scale'],
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
    });

    $.getJSON('data/' + city + '.data', function (data) {
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
                slient: true,
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
}

var zh2en = {
    '杭州': 'hangzhou', '上海': 'shanghai', "北京": "beijing", "广州": "guangzhou",
    "深圳": "shenzhen", "成都": "chengdu", "重庆": "chongqing", "香港": "hongkong",
    "西安": "xian", "郑州": "zhengzhou", "澳门": "aomen", "长沙": "changsha", "大连": "dalian",
    "济南": "jinan", "开封": "kaifeng", "南京": "nanjing", "天津": "tianjin", "武汉": "wuhan",
    "银川": "yinchuan", "洛阳": "luoyang", "南昌": "nanchang", "厦门": "xiamen", '苏州': 'suzhou',
    '沈阳': 'shenyang', "青岛": "qingdao"
}

var zh = Object.keys(zh2en);

gui = new dat.GUI();
var options = {
    城市: "杭州",
    轨迹宽度: 1,
    动点速度: 20,
    动点尾长: 0.0,
    动点大小: 1.5
};
load_city_vein(zh2en["杭州"]);
gui.add(options, '城市', zh).onChange(function (val) {
    document.getElementById("loading").style.display = "inline";
    load_city_vein(zh2en[val]);
});
gui.add(options, '轨迹宽度', 0, 2).onChange(function (val) {
    options = myChart.getOption()
    options.series[0].lineStyle.normal.width = val;
    myChart.setOption(options);
});
gui.add(options, '动点速度', 0, 40).onChange(function (val) {
    options = myChart.getOption();
    options.series[1].effect.constantSpeed = val;
    myChart.setOption(options);
});
gui.add(options, '动点尾长', 0.0, 2.0).onChange(function (val) {
    options = myChart.getOption();
    options.series[1].effect.trailLength = val;
    myChart.setOption(options);
});
gui.add(options, '动点大小', 0.0, 3.0).onChange(function (val) {
    options = myChart.getOption();
    options.series[1].effect.symbolSize = val;
    myChart.setOption(options);
});

gui.autoPlace = false;