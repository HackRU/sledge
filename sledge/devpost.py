#, iiCredit to: https://github.com/lasamson/Devpost-Scraper.git
import csv
from urllib.request import urlopen
from bs4 import BeautifulSoup
from models import Prize, Hack

def for_each_hack_do(paginator, hack_fn):
    page = 1
    submissions = BeautifulSoup(urlopen(paginator(page)), 'html.parser').findAll('a', {'class':'block-wrapper-link fade link-to-software'})
    while len(submissions) != 0:
        try:
            submissions = BeautifulSoup(urlopen(paginator(page)), 'html.parser').findAll('a', {'class':'block-wrapper-link fade link-to-software'})
        except:
            continue
        for submission in submissions:
            hack_fn(submission)
        page += 1

def run_through_all_submissions(url):
    locations = {}
    next_location = 0
    hack_objects = []

    def each_hack_fn(submission):
        nonlocal locations, next_location
        title = getTitle(submission).get_text().strip()
        desc = getSubtitle(submission).get_text().strip()
        if title in locations:
            table = locations[title][0]
        else:
            table = next_location
            locations[title] = (table, Hack(name=title, location=table, views=0, description=desc))
            next_location += 1
        hack_objects.append(locations[title][1])

    for_each_hack_do(lambda pg: url + '?page={}'.format(pg), each_hack_fn)
    return hack_objects, locations

def run_for_prize(baseUrl, locations, id, prizes):
    def each_hack_fn(submission):
        title = getTitle(submission).get_text().strip()
        locations[title][1].prizes.append(prizes[id])

    search_str = lambda page: baseUrl + "//search?page={}&prize_filter%5Bprizes%5D%5B%5D={}".format(page, id)
    for_each_hack_do(search_str, each_hack_fn)

def get_devpost_data(baseUrl = 'https://hackru-s16.devpost.com//submissions'):
    # get prize ID numbers
    prize_finder = BeautifulSoup(urlopen(baseUrl), 'html.parser')
    prize_IDs = [(int(x.get('value')), x.parent.text.strip()) for x in prize_finder.find('form', {'class': 'filter-submissions'}).find_all('input') if x.get('value').isdigit()]
    prize_objects = {v[0] : Prize(name = v[1], description = v[1], is_best_overall = False) for v in prize_IDs}

    hack_objects, locations = run_through_all_submissions(baseUrl)

    for id, prize in prize_IDs:
        run_for_prize(baseUrl, locations, id, prize_objects)
    return prize_objects.values(), hack_objects

def getTitle(subObj):
    title = subObj.find('h5')
    return title

def getSubtitle(subObj):
    subtitle = subObj.find('p', {'class': 'small tagline'})
    return subtitle

def getImages(subObj):
    imgList = []
    try:
        images = subObj.find('div', {'id':'gallery'}).findAll('li')
        for image in images:
            try:
                imgSrc = image.find('img')['src']
                imgList.append(imgSrc)
            except:
                print('Non-Image Link Found')
    except:
        print('No Gallery Found')
    return imgList

def getBuiltWith(subObj):
    builtWithList = []
    try:
        builtWith = subObj.find('div', {'id':'built-with'}).findAll('span', {'class':'cp-tag'})
        for tool in builtWith:
            builtWithList.append(tool.get_text().strip())
    except:
        print('No Tools Found')
    return builtWithList

def writeToCSV(fieldsList):
    csvFile = open('data.csv', 'wt')
    try:
        writer = csv.writer(csvFile)
        writer.writerow(('Title', 'Subtitle', 'Index'))
        for idx, row in enumerate(fieldsList):
            writer.writerow((row[0], row[1], idx + 1))
    finally:
        csvFile.close()

def main():
    print(str(get_devpost_data()).encode('utf-8'))

if __name__ == "__main__":
    main()
