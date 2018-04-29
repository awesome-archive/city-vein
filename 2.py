from urllib import parse
import hashlib
import requests

ak = '08eUG0hbUTzFrCFyF2Bn6tSQ7UD0cCaH'
sk = '4Gzbk6HSzMHkWjjXliEOGM7ZAVvpqg0U'
province = '浙江省'
city = '杭州市'

def get_position(address):
    queryStr = '/geocoder/v2/?address=%s&output=json&ak=%s' % (province + city + address, ak)
    encodedStr = parse.quote(queryStr, safe="/:=&?#+!$,;'@()*[]")
    rawStr = encodedStr + sk
    sn = (hashlib.md5(parse.quote_plus(rawStr).encode("utf8")).hexdigest())
    url = parse.quote("http://api.map.baidu.com"+queryStr+"&sn="+sn, safe="/:=&?#+!$,;'@()*[]")
    response = requests.get(url)
    lng, lat = response.json()['result']['location']['lng'], response.json()['result']['location']['lat']
    return lng, lat

geometry = {}
count = {}


with open('./lines.json', "r") as f:
    lines = dict(eval(f.read()))
    for name, stations in lines.items():
        for station in stations:
            if station not in count.keys():
                count[station] = 1
                try:
                    geometry[station] = get_position(station)
                except Exception as e:
                    print("[INFO] some error occur")
                    continue
            else:
                count[station] += 1
        break

count = sorted(count.items(),key = lambda x:x[1], reverse=True)
print(count)



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