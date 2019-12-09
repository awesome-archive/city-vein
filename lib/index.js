let dom = document.getElementById("container");
let myChart = echarts.init(dom);

// progress bar setting
NProgress.configure({
    parent: '#loading',
    showSpinner: false
});

// call back function for get basic json
let setJson = (data) => {
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
}

// call back function for get data
let setData = (data) => {
    let hStep = 300 / (data.length - 1);
    let busLines = [].concat.apply([], data.map(function (busLine, idx) {
        let prevPt;
        let points = [];
        for (let i = 0; i < busLine.length; i += 2) {
            let pt = [busLine[i], busLine[i + 1]];
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
}

// load city data
let loadCityData = (city) => {
    document.getElementById("loading").style.display = "inline";
    myChart.clear();
    $.getJSON('data/' + city + '.json', function (data) {
        setJson(data)
        $.ajax({
            xhr: function () {
                let xhr = new window.XMLHttpRequest();

                xhr.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        let percentComplete = evt.loaded / evt.total;
                        // console.log(percentComplete);
                        NProgress.set(percentComplete);
                    }
                }, false);

                return xhr;
            },
            type: 'GET',
            url: 'data/' + city + '.data',
            success: function (data) {
                let jsonData = JSON.parse(data);
                setData(jsonData);
                document.getElementById("loading").style.display = "none";
            }
        });
    });
}


let zh2en = {
    "北京地铁": "beijing_subway",
    "上海地铁": "shanghai_subway",
    "广州地铁": "guangzhou_subway",
    "深圳地铁": "shenzhen_subway",
    "杭州地铁": "hangzhou_subway",
    "南京地铁": "nanjing_subway",
    "天津地铁": "tianjin_subway",
    "武汉地铁": "wuhan_subway",
    "重庆地铁": "chongqing_subway",
    "成都地铁": "chengdu_subway",
    "香港地铁": "hongkong_subway",
    "北京": "beijing",
    '上海': 'shanghai',
    "广州": "guangzhou",
    '杭州': 'hangzhou',
    "南京": "nanjing",
    "台北": "taipei",
    "武汉": "wuhan",
    "天津": "tianjin",
    "深圳": "shenzhen",
    "成都": "chengdu",
    "重庆": "chongqing",
    "香港": "hongkong",
    "澳门": "aomen",
    "西安": "xian",
    "拉萨": "lasa",
    "郑州": "zhengzhou",
    "长沙": "changsha",
    "贵阳": "guiyang",
    "西宁": "xining",
    "南宁": "nanning",
    "海口": "haikou",
    "呼和浩特": "huhehaote",
    "乌鲁木齐": "wulumuqi",
    "太原": "taiyuan",
    "石家庄": "shijiazhuang",
    "长春": "changchun",
    "合肥": "hefei",
    "哈尔滨": "haerbin",
    "兰州": "lanzhou",
    "昆明": "kunming",
    "大连": "dalian",
    "济南": "jinan",
    "开封": "kaifeng",
    "银川": "yinchuan",
    "洛阳": "luoyang",
    "南昌": "nanchang",
    "厦门": "xiamen",
    '苏州': 'suzhou',
    '沈阳': 'shenyang',
    "青岛": "qingdao",
    // "亳州": "bozhou",
    "台州": "taizhou"
}

let zh = Object.keys(zh2en);

// new gui console
gui = new dat.GUI();

let initOptions = {
    城市: "杭州",
    轨迹宽度: 1,
    动点速度: 20,
    动点尾长: 0.0,
    动点大小: 1.5
};

gui.add(initOptions, '城市', zh).onChange(function (val) {
    document.getElementById("loading").style.display = "inline";
    loadCityData(zh2en[val]);
});

gui.add(initOptions, '轨迹宽度', 0, 2).onChange(function (val) {
    options = myChart.getOption()
    options.series[0].lineStyle.normal.width = val;
    myChart.setOption(options);
});

gui.add(initOptions, '动点速度', 0, 40).onChange(function (val) {
    options = myChart.getOption();
    options.series[1].effect.constantSpeed = val;
    myChart.setOption(options);
});

gui.add(initOptions, '动点尾长', 0.0, 2.0).onChange(function (val) {
    options = myChart.getOption();
    options.series[1].effect.trailLength = val;
    myChart.setOption(options);
});

gui.add(initOptions, '动点大小', 0.0, 3.0).onChange(function (val) {
    options = myChart.getOption();
    options.series[1].effect.symbolSize = val;
    myChart.setOption(options);
});

gui.autoPlace = true;

loadCityData(zh2en["杭州"]);

