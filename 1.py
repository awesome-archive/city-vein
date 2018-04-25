# -*- coding: utf-8 -*-
import requests
import bs4
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.221 Safari/537.36 SE 2.X MetaSr 1.0'}
url = 'http://hangzhou.8684.cn/'
html = requests.get(url, headers=headers)
# print (main_html.text)
soup = bs4.BeautifulSoup(html.text, 'lxml')
links_num = soup.find('div', class_='bus_kt_r1').find_all('a')
links_letter = soup.find('div', class_='bus_kt_r2').find_all('a')
links = links_num + links_letter
# print(links)
# 1, 2, 3, 4, B, D
for link in links:
    href = link['href']
    print(href)
    new_html = requests.get(url + href, headers=headers)
    new_soup = bs4.BeautifulSoup(new_html.text, 'lxml')

    lines = new_soup.find('div', class_='stie_list').find_all('a')

    for line in lines:
        break
    break
