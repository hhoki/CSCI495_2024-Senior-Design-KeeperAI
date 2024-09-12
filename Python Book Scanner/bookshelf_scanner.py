import google.generativeai as genai
import os
from PIL import Image, ImageFilter
import requests
from mysql.connector import connect, Error

api_key='AIzaSyDRoC5Fw5I3UJZ-R6m_iqCZojng6LqiLSo'







class Book:
    def __init__(self, title, authors, published_date, isbn, rating, description, cover):
        self.title = title
        self.authors = authors
        self.published_date = published_date
        self.isbn = isbn
        self.rating = rating
        self.description = description
        self.cover = cover
        
    def to_tuple(self, id):
        return (id, self.title,  self.authors, self.published_date, self.isbn, self.rating, self.description, self.cover)
        
    def __str__(self):
        return f"Title: {self.title}\nAuthors: {self.authors}\nPublished Date: {self.published_date}\nISBN: {self.isbn}\nRating: {self.rating}"
        
book_shelf = []

def search_book_by_title(book_title, id, api_key = None):

    base_url = "https://www.googleapis.com/books/v1/volumes"
    params = {
        'q': f'intitle:{book_title}',  #Search by book title
        'maxResults': 1  #Return up to 1 results
    }

    if api_key:
        params['key'] = api_key
    
    response = requests.get(base_url, params=params)
    
    if response.status_code == 200:
        books = response.json().get('items', [])
        
        if not books:
            return "No books found."
        
        # Extract and print book details
        for i, book in enumerate(books, 1):
            title = book['volumeInfo'].get('title', 'No title available')
            authors = ", ".join(book['volumeInfo'].get('authors', 'No authors available'))
            published_date = book['volumeInfo'].get('publishedDate', 'No published date')
            #Lookup for ISBN
            industry_identifiers = book['volumeInfo'].get('industryIdentifiers', [])
            isbn_list = [id['identifier'] for id in industry_identifiers if 'ISBN' in id['type']]
            isbn = next((id['identifier'] for id in industry_identifiers if id['type'] == 'ISBN_13'), "No ISBN-13 available")
            rating = book['volumeInfo'].get('averageRating', 'No rating avaliable')
            description = book['volumeInfo'].get('description', 'No description available')
            #Cover lookup
            #Come back to this one. This cover is way too small. Need to get bigger covers
            image_links = book['volumeInfo'].get('imageLinks', {})
            large_image = image_links.get('thumbnail', 'No cover available')
            
            return Book(title, authors, published_date, isbn, rating, description, large_image).to_tuple(id)
    else:
        return f"Error: {response.status_code}"
    
    

def scan_books_by_photo(photo) :

    genai.configure(api_key="AIzaSyBH0EZO07McjhNra3IC9RsME7pfOn8ArM8")

    book_shelf1 = Image.open(photo)
    
    generation_config = genai.types.GenerationConfig(
    temperature=0.6,  # Set temperature as low as possible for deterministic results
    max_output_tokens=1024  # Adjust as necessary for the length of content you expect
)
    
    #You can switch between flash and pro models by changing 'flash' to 'pro' and 'pro' to 'flash' 
    model = genai.GenerativeModel("gemini-1.5-flash")
    # Messing with the prompt can change the results by quite abit so you can also play around with the prompt.
    response = model.generate_content([book_shelf1, "What are the titles of the books? Seperate the results by a newline and only display the title of the books."], generation_config=generation_config)

    output = response.text

    titles_list =  output.split('\n')

    print(output)
    return titles_list
 
 
 
if __name__=="__main__":
    try:
        with connect(
        host="127.0.0.1",
        user="root",
        password="password",
        database="librarymanagement"
        ) as connection:
            print(connection)
    except Error as e:
        print(e)
    

    #replace with location of whatever picture you want to use.
    photo = "bookshelf.jpg"

    id=0
    
    #Scans the books in the photo
    for book in scan_books_by_photo(photo): 
        id = id + 1
        book_shelf.append(search_book_by_title(book, id))
        
    
     
    insert_books_query = """
        INSERT INTO books
        (books_id, title, author, published_date, isbn, rating, description, cover)
        VALUES ( %s, %s, %s, %s, %s, %s, %s, %s)
        """
    
    connection.reconnect()
    
    #with connection.cursor() as cursor:
        #cursor.executemany(insert_books_query, book_shelf)
        #connection.commit()
    
    
    #For if you want the book's info to print.
    for book in book_shelf:
        print(book)