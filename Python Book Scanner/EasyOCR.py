import easyocr

reader = easyocr.Reader(['en'])

result = reader.readtext('books.jpg', detail = 0)

print(result)