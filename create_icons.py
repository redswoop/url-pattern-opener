from PIL import Image, ImageDraw, ImageFont
import os

def create_circular_icon(size, filename):
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw the main circle with gradient effect
    margin = 4
    circle_size = size - 2 * margin
    
    # Main circle
    draw.ellipse([margin, margin, size - margin, size - margin], 
                fill=(76, 175, 80, 255), outline=(46, 125, 50, 255), width=2)
    
    # Inner dashed circle effect (approximate with dots)
    inner_margin = margin + 15
    inner_size = size - 2 * inner_margin
    center_x, center_y = size // 2, size // 2
    radius = inner_size // 2
    
    # Draw dashed circle as small rectangles
    import math
    for angle in range(0, 360, 20):
        x = center_x + radius * math.cos(math.radians(angle))
        y = center_y + radius * math.sin(math.radians(angle))
        draw.rectangle([x-1, y-1, x+1, y+1], fill=(255, 255, 255, 200))
    
    # Add text
    try:
        if size >= 48:
            font_size = max(12, size // 8)
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        else:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    text = "URL"
    # Get text size
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center text
    text_x = (size - text_width) // 2
    text_y = (size - text_height) // 2
    
    # Draw text shadow
    draw.text((text_x + 1, text_y + 1), text, font=font, fill=(0, 0, 0, 100))
    # Draw text
    draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 255))
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

# Create icons directory
os.makedirs('icons', exist_ok=True)

# Create all required sizes
create_circular_icon(16, 'icons/icon16.png')
create_circular_icon(48, 'icons/icon48.png')
create_circular_icon(128, 'icons/icon128.png')

print("All icons created successfully!")
