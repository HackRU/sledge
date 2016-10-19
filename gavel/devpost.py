#Credit to: https://github.com/lasamson/Devpost-Scraper.git
import csv
from urllib.request import urlopen
from bs4 import BeautifulSoup

def get_devpost_data(baseUrl = 'http://hackumass-ii.devpost.com'):
    subsUrl = baseUrl + '//submissions?page='
    count = 1
    while True:
        subsObj = BeautifulSoup(urlopen(subsUrl + str(count)), 'html.parser')
        submissions = subsObj.findAll('a', {'class':'block-wrapper-link fade link-to-software'})
        if len(submissions) != 0:
            for submission in submissions:
                # subUrl = submission.attrs['href']
                # subObj = BeautifulSoup(urlopen(subUrl), 'html.parser')

                title = getTitle(submission)
                subtitle = getSubtitle(submission)
                # images = getImages(subObj)
                # builtWith = getBuiltWith(subObj)
                # fieldsList.append([title.get_text().strip(), subtitle.get_text().strip(), images, builtWith])
                yield ([title.get_text().strip(), subtitle.get_text().strip()])
            count = count + 1
        else:
            break


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
    writeTOCSV(get_devpost_data())

if __name__ == "__main__":
    main()
