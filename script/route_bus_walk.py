import urllib
import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
}


def get_walk_info(start_lng, start_lat, end_lng, end_lat):
    baseUrl = "http://restapi.amap.com/v3/direction/walking?"
    params = {
        'key': 'fa6e09fde4518c9b6416542611a5da42',
        'origin': '%f,%f' % (start_lng, start_lat),
        'destination': '%f,%f' % (end_lng, end_lat),
    }
    paramMerge = urllib.parse.urlencode(params).replace("%2C", ',')
    # print(paramMerge)
    targetUrl = baseUrl + paramMerge
    try:
        req = requests.get(targetUrl, headers=headers)
        res = req.content
        content = dict(eval(res))
        steps = content['route']['paths'][0]['steps']
        route = []
        for step in steps:
            polylines = step['polyline'].split(';')
            for polyline in polylines:
                lng = float(polyline.split(',')[0])
                lat = float(polyline.split(',')[1])
                route.append(lng)
                route.append(lat)
        for i in range(-2, -len(route), -2):
            route[i] = int(1e4 * (route[i] - route[i - 2]))
            route[i + 1] = int(1e4 * (route[i + 1] - route[i - 1]))
        route[0] = int(1e4 * route[0])
        route[1] = int(1e4 * route[1])
        filter_route = []
        for i in range(0, len(route), 2):
            if route[i] != 0 or route[i + 1] != 0:
                filter_route.append(route[i])
                filter_route.append(route[i + 1])
    except Exception as e:
        return None
    return filter_route


def get_bus_info(start_lng, start_lat, end_lng, end_lat):
    baseUrl = "http://restapi.amap.com/v3/direction/transit/integrated?"
    params = {
        'key': 'fa6e09fde4518c9b6416542611a5da42',
        'origin': '%f,%f' % (start_lng, start_lat),
        'destination': '%f,%f' % (end_lng, end_lat),
        'city': '北京市'
    }
    paramMerge = urllib.parse.urlencode(params).replace("%2C", ',')
    # print(paramMerge)
    targetUrl = baseUrl + paramMerge
    try:
        req = requests.get(targetUrl, headers=headers)
        res = req.content
        content = dict(eval(res))
        steps = content['route']['transits'][0]['segments'][0]['bus']
        route = []
        buslines = steps['buslines'][0]['polyline']
        polylines = buslines.split(';')
        for polyline in polylines:
            lng = float(polyline.split(',')[0])
            lat = float(polyline.split(',')[1])
            route.append(lng)
            route.append(lat)
        for i in range(-2, -len(route), -2):
            route[i] = int(1e4 * (route[i] - route[i - 2]))
            route[i + 1] = int(1e4 * (route[i + 1] - route[i - 1]))
        route[0] = int(1e4 * route[0])
        route[1] = int(1e4 * route[1])
        filter_route = []
        for i in range(0, len(route), 2):
            if route[i] != 0 or route[i + 1] != 0:
                filter_route.append(route[i])
                filter_route.append(route[i + 1])
    except Exception as e:
        return None
    return filter_route


with open('../data/all_lines_beijing.json') as f:
    lines = list(eval(f.read()))
all_route = []
for line in lines:
    start_lng, start_lat = line[0], line[1]
    end_lng, end_lat = start_lng, start_lat
    for i in range(2, len(line), 2):
        end_lng += line[i]
        end_lat += line[i + 1]
    route = get_walk_info(start_lng / 1e4, start_lat / 1e4, end_lng / 1e4, end_lat / 1e4)
    print(len(all_route))
    print(route)
    if route != None and len(route) > 2:
        all_route.append(route)

with open('../data/all_lines_beijing_walk.json', 'w') as f:
    f.write(str(all_route))
