from PIL import Image

# Open the image you uploaded
img = Image.open('C:/users/pc/dare-fashions/rp-apparels/scripts/logo.png')

# Save it as an icon file with standard favicon sizes
img.save('C:/users/pc/dare-fashions/rp-apparels/scripts/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("Favicon created successfully!")