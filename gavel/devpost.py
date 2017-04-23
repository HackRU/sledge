#Credit to: https://github.com/lasamson/Devpost-Scraper.git
import csv
from urllib.request import urlopen
from bs4 import BeautifulSoup

def get_devpost_data(baseUrl = 'https://hackru-fall2016.devpost.com//submissions'): 
    # get prize ID numbers
    prize_finder = BeautifulSoup(urlopen(baseUrl), 'html.parser')
    prize_IDs = [(int(x.get('value')), x.parent.text.strip()) for x in prize_finder.find('form', {'class': 'filter-submissions'}).find_all('input') if x.get('value').isdigit()]

    page = 1
    default_search = lambda pg: baseUrl + '//page=%d' %(pg)
    submissions = BeautifulSoup(urlopen(default_search(page)), 'html.parser').findAll('a', {'class':'block-wrapper-link fade link-to-software'})
    while len(submissions) != 0:
        try:
            submissions = BeautifulSoup(urlopen(search_str(page, id)), 'html.parser').findAll('a', {'class':'block-wrapper-link fade link-to-software'})
        except:
            continue
        for submission in submissions:
            title = getTitle(submission).get_text().strip()
            desc = getSubtitle(submission).get_text().strip()
            if title in locations:
                table = locations[title]
            else:
                table = next_location
                locations[title] = table
                next_location += 1
            items.append([title, table, desc, prize])
        page += 1


    locations = {}
    next_location = 1
    search_str = lambda page, id : baseUrl + "//search?page=%d&prize_filter%%5Bprizes%%5D%%5B%%5D=%d" % (page, id)
    items = []
    for id, prize in prize_IDs:
        page = 1
        submissions = BeautifulSoup(urlopen(search_str(page, id)), 'html.parser').findAll('a', {'class':'block-wrapper-link fade link-to-software'})
        while len(submissions) != 0:
            try:
                submissions = BeautifulSoup(urlopen(search_str(page, id)), 'html.parser').findAll('a', {'class':'block-wrapper-link fade link-to-software'})
            except:
                continue
            for submission in submissions:
                title = getTitle(submission).get_text().strip()
                desc = getSubtitle(submission).get_text().strip()
                if title in locations:
                    table = locations[title]
                else:
                    table = next_location
                    locations[title] = table
                    next_location += 1
                items.append([title, table, desc, prize])
            page += 1
        
    return items

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
    print(get_devpost_data())

if __name__ == "__main__":
    main()
