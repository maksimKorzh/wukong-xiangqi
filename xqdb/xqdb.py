#
# Script to scrape 43877 encoded Xiangqi games from wxf.ca
#

import scrapy
from scrapy.crawler import CrawlerProcess

class Xqdb(scrapy.Spider):
    name = 'xqdb'
    
    def start_requests(self):
        for page in range(41, 43919):
            yield scrapy.Request(
                url='http://wxf.ca/xq/xqdb/jgame_Dhtml.php?lan=&id=' + str(page),
                callback=self.store_response
            )
    
    def store_response(self, response):
        filename = response.url.split('id=')[-1] + '.html'
        with open('./games_html/' + filename, 'w') as f:
            f.write(response.text)

if __name__ == '__main__':
    process = CrawlerProcess()
    process.crawl(Xqdb)
    process.start()
