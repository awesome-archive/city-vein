import urllib
import requests
import hashlib
import bs4
import logging
import random
import math


logging.basicConfig(format='%(asctime)s: %(levelname)s: %(message)s')
logging.root.setLevel(level=logging.INFO)
logger = logging.getLogger()


class city_vein():
    def __init__(self, city_en, city_zh):
        self.city_en = city_en
        self.city_zh = city_zh
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
        }

    def _get_all_lines(self):
        url = 'http://%s.8684.cn' % self.city_en
        html = requests.get(url, headers=self.headers)
        soup = bs4.BeautifulSoup(html.text, 'lxml')
        links = []
        links_number = soup.find('div', class_='bus_kt_r1')
        if links_number != None:
            links_number = links_number.find_all('a')
            links.extend(links_number)
        links_letter = soup.find('div', class_='bus_kt_r2')
        if links_letter != None:
            links_letter = links_letter.find_all('a')
            links.extend(links_letter)
        all_lines = []
        for link in links:
            link_href = link['href']
            link_html = requests.get(url + link_href, headers=self.headers)
            link_soup = bs4.BeautifulSoup(link_html.text, 'lxml')
            lines = link_soup.find('div', class_='stie_list').find_all('a')
            for line in lines:
                # line_href = line['href']
                line_name = line.get_text()
                # try:
                #     line_html = requests.get(url + line_href, headers=self.headers)
                #     line_info = {}
                #     line_soup = bs4.BeautifulSoup(line_html.text, 'lxml')
                #     bus_lines = line_soup.find_all('div', class_='bus_line_site')
                #     for bus_line in bus_lines:
                #         stations = []
                #         bus_stations = bus_line.find_all('a')
                #         for bus_station in bus_stations:
                #             stations.append(bus_station.get_text())
                #         if bus_lines.index(bus_line) == 0:
                #             line_info[line_name] = stations
                #     all_lines.update(line_info)
                # except Exception:
                #     logger.info("some error")
                #     continue
                if self.city_en == 'hongkong':
                    all_lines.append(line_name[:line_name.find('(')].strip())
                else:
                    all_lines.append(line_name)
                logger.info("get line: %s" % line_name)
        return len(all_lines), all_lines

    def _get_line_info(self, line_name):
        # https://restapi.amap.com/v3/bus/linename?
        # s=rsv3&extensions=all&key=608d75903d29ad471362f8c58c550daf&output=json&
        # pageIndex=1&city=%E5%8C%97%E4%BA%AC&offset=1&keywords=536&callback=jsonp_246759_&
        # platform=JS&logversion=2.0&appname=https%3A%2F%2Flbs.amap.com%2Fapi%2Fjavascript-api%
        # 2Fexample%2Fbus-search%2Fsearch-bus-route&csid=82FF8B4C-11F6-4370-ABA3-1A05B7108C75&sdkversion=1.4.9
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
        }
        base_url = "https://restapi.amap.com/v3/bus/linename?"
        params = {
            's': 'rsv3',
            'extensions': 'all',
            'key': '',
            'output': 'json',
            'city': self.city_zh,
            'keywords': line_name,
        }
        param_merge = urllib.parse.urlencode(params).replace("%2C", ',')
        targetUrl = base_url + param_merge
        try:
            response = requests.get(targetUrl, headers=self.headers)
            content = response.content
            content = dict(eval(content))

            status = content['status']
            buslines = content['buslines']

            positive_buslines = buslines[0]
            negative_buslines = buslines[1]

            lines = positive_buslines if random.randint(
                0, 1) == 1 else negative_buslines

            name = lines['name']
            polyline = lines['polyline']
            busstops = lines['busstops']

            return polyline
        except Exception:
            return None

    def _transfer(self, lng, lat):
        x_pi = math.pi * 3000.0 / 180.0
        x, y = lng, lat
        z = math.sqrt(x * x + y * y) + 0.00002 * math.sin(y * x_pi)
        theta = math.atan2(y, x) + 0.000003 * math.cos(x * x_pi);
        lng = z * math.cos(theta) + 0.0065
        lat = z * math.sin(theta) + 0.006
        return lng, lat


    def _get_bus_lines(self, digits=4):
        _, lines = self._get_all_lines()
        lines_info = []
        for line in lines:
            logger.info("get line info: %s" % line)
            polyline = self._get_line_info(line_name=line)
            if polyline != None:
                polypoints = polyline.split(';')
                polyX = []
                polyY = []
                diffX = []
                diffY = []
                for polypoint in polypoints:
                    x = float(polypoint.split(',')[0])
                    y = float(polypoint.split(',')[1])
                    x, y = self._transfer(x, y)
                    x, y = round(x, digits), round(y, digits)
                    polyX.append(x)
                    polyY.append(y)

                diffX.append(polyX[0])
                diffY.append(polyY[0])
                for i in range(0, len(polyX)-1):
                    diffX.append(polyX[i+1] - polyX[i])
                    diffY.append(polyY[i+1] - polyY[i])
                for i in range(0, len(diffX)):
                     diffX[i] = round(diffX[i], digits)
                     diffY[i] = round(diffY[i], digits)
                diff = []
                for i in range(0, len(diffX)):
                    diff.append(diffX[i])
                    diff.append(diffY[i])
                lines_info.append(diff)

        logger.info("recall: %f" % float(len(lines_info) / len(lines)))
        return lines_info

    def _get_city_info(self):
        api = 'http://restapi.amap.com/v3/config/district?'
        params = {
            'key': '',
            'keywords': '%s' % self.city_zh,
            'subdistrict': '0',
            'extensions': 'all'
        }
        param_merge = urllib.parse.urlencode(params)
        url = api + param_merge
        req = urllib.request.Request(url)
        res = urllib.request.urlopen(req)
        content = dict(eval(res.read()))
        adcode = content['districts'][0]['adcode']
        center = content['districts'][0]['center']
        polys = content['districts'][0]['polyline'].split(';')
        lngs = []
        lats = []
        for i in polys:
            if i.find('|') != -1:
                continue
            lng, lat = float(i.split(',')[0]), float(i.split(',')[1])
            lng, lat = self._transfer(lng, lat)
            lngs.append(lng)
            lats.append(lat)
        lngs.sort()
        lats.sort()
        return center.split(',')

    def generate(self):
        data = self._get_bus_lines()
        with open('./data/{}.data'.format(self.city_en), 'w+') as wf:
            wf.write(str(data))

        center = self._get_city_info()
        with open('./data/{}.json'.format(self.city_en), 'w+') as wf:
            wf.write(str({
                "position": center,
                "scale": 11
            }).replace("'", '"'))


if __name__ == "__main__":
    obj = city_vein('', '')
    obj.generate()
