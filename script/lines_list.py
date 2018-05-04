from urllib import parse
import hashlib
import requests

ak = '08eUG0hbUTzFrCFyF2Bn6tSQ7UD0cCaH'
# ak = 'Ad319bztEzGnTeK6UTG70ODKEUEsoeAd'
sk = '4Gzbk6HSzMHkWjjXliEOGM7ZAVvpqg0U'
# sk = 'w3icqUMiU3tUF2C4RmpMS5i4OkHbsIl3'
province = ''
city = '广州市'
level = '公交站'


def get_position(address):
    queryStr = '/geocoder/v2/?address=%s&output=json&ak=%s' % (province + city + address + level, ak)
    encodedStr = parse.quote(queryStr, safe="/:=&?#+!$,;'@()*[]")
    rawStr = encodedStr + sk
    sn = (hashlib.md5(parse.quote_plus(rawStr).encode("utf8")).hexdigest())
    url = parse.quote("http://api.map.baidu.com" + queryStr + "&sn=" + sn, safe="/:=&?#+!$,;'@()*[]")
    response = requests.get(url)
    lng, lat = response.json()['result']['location']['lng'], response.json()['result']['location']['lat']
    precise, confidence = response.json()['result']['precise'], response.json()['result']['confidence']
    return lng, lat, precise, confidence


# df = pd.DataFrame(columns=['source', 'target'])
# source = []
# target = []

# for line_name, line_stations in all_lines.items():
#     print(line_name, line_stations)
#     for i in range(len(line_stations)-1):
#         source.append(get_position(line_stations[i]))
#         target.append(get_position(line_stations[i+1]))
#     break

# df['source'] = source
# df['target'] = target
# df.to_csv('./data.csv', index=False)

# print(get_position('古荡'))


data = []

with open('../data/lines_guangzhou.json', "r", encoding='utf-8') as f:
    lines = dict(eval(f.read()))
    for name, stations in lines.items():
        line = []
        try:
            lng_1, lat_1, precise_1, confidence_1 = get_position(stations[0])
            line.append(lng_1)
            line.append(lat_1)
            lng_2, lat_2, precise_2, confidence_2 = get_position(stations[-1])
            line.append(lng_2)
            line.append(lat_2)

        except Exception as e:
            continue
        data.append(line)
        print(len(data))

with open('../data/all_lines_guangzhou.json', 'w', encoding='utf-8') as f:
    f.write(str(data))
