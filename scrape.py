import requests
from bs4 import BeautifulSoup
import csv, os



base_url = 'https://amazon.in/'
HEADERS = ({'User-Agent':
           'Mozilla/5.0 (X11; Linux x86_64)AppleWebKit/537.36 (KHTML, like Gecko)Chrome/44.0.2403.157 Safari/537.36',
                           'Accept-Language': 'en-US, en;q=0.5'})


def extract_amazon_data(start_url, file_name, base_url, append):
    if not append:
        with open(file_name, 'w', newline='', encoding='utf-8') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(['ProductName', 'DiscountPrice', 'OriginalPrice', 'MerchantName', 'Description', 'ImgLink'])
    web_page = requests.get(start_url, headers=HEADERS)
    soup = BeautifulSoup(web_page.content, 'html.parser')
    product_links = []
    for link in soup.find_all('a', class_="a-link-normal s-no-outline"):
        if link['href'] not in product_links:
            product_links.append(base_url + link['href'])
    print("Total products: ", len(product_links))
    
    i = 0
    with open(file_name, 'a', newline='', encoding='utf-8') as csv_file:
        writer = csv.writer(csv_file)
        for product_url in product_links:
            i += 1
            j = 5
            while (j):
                try:
                    product_page = requests.get(product_url, headers=HEADERS)
                    product_soup = BeautifulSoup(product_page.content, 'html.parser')
                    product_name = product_soup.find('span', class_="a-size-large product-title-word-break").get_text().strip()
                    print("Product name: ", product_name)
                    discount_price = product_soup.find('span', class_="a-price-whole").get_text().strip()
                    original_price = product_soup.find('span', class_="a-offscreen").get_text().strip()
                    description = product_soup.find('div', class_="a-section a-spacing-medium a-spacing-top-small").find('ul', class_="a-unordered-list a-vertical a-spacing-mini").get_text().strip()
                    merchant_name = product_soup.find('div',id='merchant-info').find('a').find('span').get_text().strip()
                    product_img = product_soup.find('div', id="imgTagWrapperId").find('img')['src']

                    writer.writerow([product_name, discount_price, original_price, merchant_name, description, product_img])
                    print("Scraped product: ", i)
                    j=0
                except AttributeError:
                    j -= 1
                    print("Retrying scraping product: ", i, " ", j, " times left")
                except:
                    j = 0
                    print("Error in scraping product: ", i)

# start_url = "https://www.amazon.in/s?k=jeans&ref=nb_sb_noss_2"
# start_url = "https://www.amazon.in/s?k=laptops&ref=nb_sb_noss_1"
# start_url = "https://www.amazon.in/s?k=accessories+for+men&ref=nb_sb_ss_ts-doa-p_2_5"
start_url = "https://www.amazon.in/s?k=car+accessories&ref=nb_sb_ss_ts-doa-p_3_4"
base_url = 'https://amazon.in/'
file_name = 'data_amazon.csv'
append = True

extract_amazon_data(start_url, file_name, base_url, append)

# write row without adding new line 
