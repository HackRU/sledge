# Based on https://github.com/lasamson/Devpost-Scraper.git

import csv
from urllib.request import urlopen
from bs4 import BeautifulSoup

def scrape_to_database(sql, url):
    print("Scraping to database", url)
    c = sql.cursor()

    hacks = get_hack_data(url)
    print("Got %d hacks" % len(hacks))
    for hack in hacks:
        c.execute(
            'INSERT INTO hacks ('
                'name, description, location)'
            'VALUES (?,?,?);',
            [hack.get('hack_name'), hack.get('hack_description'), 0])

    sql.commit()

def get_prize_data(url):
    # get prize ID numbers
    prize_finder = BeautifulSoup(urlopen(url), 'html.parser')
    prize_html = prize_finder \
        .find('form', {'class': 'filter-submissions'}) \
        .find_all('input')

    prizes = []
    for prize_scraped in prize_html:
        if prize_scraped.get('value').isdigit():
            prize_id = int(prize_scraped.get('value'))
            prize_name = prize_scraped.parent.text.strip()
            prize = {
                'prize_id': prize_id,
                'prize_name': prize_name,
            }
            prizes.append(prize)
    return prizes

def get_hack_data(url):
    page = 1
    hacks = []
    hacks_scrape = None

    while hacks_scrape == None or len(hacks_scrape)>0:
        page_url = "%s?page=%d" % (url, page)
        hacks_finder = BeautifulSoup(urlopen(page_url), 'html.parser')
        hacks_scrape = hacks_finder \
            .findAll('a', {'class': 'block-wrapper-link fade link-to-software'})

        for hack_scrape in hacks_scrape:
            hack_title = hack_scrape.find('h5').get_text().strip()
            hack_desc = hack_scrape.find('p', {'class': 'small tagline'}).get_text().strip()
            hack = {
                'hack_name': hack_title,
                'hack_description': hack_desc
            }
            hacks.append(hack)

        page += 1

    return hacks
