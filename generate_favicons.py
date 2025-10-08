#!/usr/bin/env python3
"""
Generate Cortex-branded favicon files in multiple sizes
"""

from PIL import Image, ImageDraw
import os

def create_cortex_icon(size):
    """Create a Cortex-branded neural network icon"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors
    bg_color = (26, 26, 26, 255)  # #1a1a1a
    orange_primary = (233, 116, 68, 255)  # #e97444
    orange_light = (255, 107, 53, 255)  # #ff6b35
    blue_primary = (74, 144, 226, 255)  # #4a90e2
    white = (255, 255, 255, 255)
    
    # Scale factors for different sizes
    scale = size / 32
    
    # Background rectangle with rounded corners
    margin = int(2 * scale)
    bg_rect = [(margin, margin), (size - margin, size - margin)]
    
    # For rounded rectangles, we'll create a simple rounded rectangle
    corner_radius = int(6 * scale)
    
    # Draw background
    # Create a rounded rectangle by drawing a rectangle and then circles at corners
    draw.rectangle(bg_rect, fill=bg_color)
    
    # Center the neural network
    center_x, center_y = size // 2, size // 2
    
    # Central core (multiple circles)
    core_radius = int(4 * scale)
    core_radius_med = int(2.5 * scale)
    core_radius_small = int(1 * scale)
    
    if core_radius > 0:
        draw.ellipse([center_x - core_radius, center_y - core_radius, 
                     center_x + core_radius, center_y + core_radius], 
                     fill=orange_primary)
    
    if core_radius_med > 0:
        draw.ellipse([center_x - core_radius_med, center_y - core_radius_med, 
                     center_x + core_radius_med, center_y + core_radius_med], 
                     fill=orange_light)
    
    if core_radius_small > 0:
        draw.ellipse([center_x - core_radius_small, center_y - core_radius_small, 
                     center_x + core_radius_small, center_y + core_radius_small], 
                     fill=white)
    
    # Neural network nodes
    node_radius = max(1, int(1.5 * scale))
    offset = int(4 * scale)
    
    # Main nodes
    nodes = [
        (center_x - offset, center_y - offset),  # top-left
        (center_x + offset, center_y - offset),  # top-right
        (center_x - offset, center_y + offset),  # bottom-left
        (center_x + offset, center_y + offset),  # bottom-right
    ]
    
    for node_x, node_y in nodes:
        if node_radius > 0:
            draw.ellipse([node_x - node_radius, node_y - node_radius,
                         node_x + node_radius, node_y + node_radius],
                         fill=blue_primary)
    
    # Side nodes
    side_offset = int(8 * scale)
    small_node_radius = max(1, int(1 * scale))
    
    side_nodes = [
        (center_x - side_offset, center_y),  # left
        (center_x + side_offset, center_y),  # right
    ]
    
    for node_x, node_y in side_nodes:
        if small_node_radius > 0:
            draw.ellipse([node_x - small_node_radius, node_y - small_node_radius,
                         node_x + small_node_radius, node_y + small_node_radius],
                         fill=blue_primary)
    
    # Corner accent nodes
    corner_node_radius = max(1, int(0.8 * scale))
    corner_offset = int(2 * scale)
    
    corner_nodes = [
        (center_x - offset - corner_offset, center_y - offset - corner_offset),
        (center_x + offset + corner_offset, center_y - offset - corner_offset),
        (center_x - offset - corner_offset, center_y + offset + corner_offset),
        (center_x + offset + corner_offset, center_y + offset + corner_offset),
    ]
    
    for node_x, node_y in corner_nodes:
        if corner_node_radius > 0:
            draw.ellipse([node_x - corner_node_radius, node_y - corner_node_radius,
                         node_x + corner_node_radius, node_y + corner_node_radius],
                         fill=orange_primary)
    
    # Add subtle corner accents
    accent_radius = max(1, int(1.5 * scale))
    if accent_radius > 0:
        # Top-right accent
        acc_x, acc_y = size - int(6 * scale), int(6 * scale)
        draw.ellipse([acc_x - accent_radius, acc_y - accent_radius,
                     acc_x + accent_radius, acc_y + accent_radius],
                     fill=blue_primary)
        
        # Bottom-left accent
        acc_x, acc_y = int(6 * scale), size - int(6 * scale)
        draw.ellipse([acc_x - accent_radius, acc_y - accent_radius,
                     acc_x + accent_radius, acc_y + accent_radius],
                     fill=orange_primary)
    
    return img

def main():
    # Create the icons directory
    icons_dir = "hosting/public/assets/branding/icons"
    os.makedirs(icons_dir, exist_ok=True)
    
    # Generate different sizes
    sizes = [
        (16, "cortex-16x16.png"),
        (32, "cortex-32x32.png"),
        (48, "cortex-48x48.png"),
        (64, "cortex-64x64.png"),
        (128, "cortex-128x128.png"),
        (192, "cortex-192x192.png"),
    ]
    
    for size, filename in sizes:
        print(f"Generating {filename} ({size}x{size})")
        icon = create_cortex_icon(size)
        icon.save(os.path.join(icons_dir, filename))
    
    # Also create the main favicon.ico (32x32)
    print("Generating favicon.ico")
    favicon = create_cortex_icon(32)
    favicon.save("hosting/public/favicon.ico")
    
    # Create Apple touch icons
    print("Generating apple-touch-icon.png (180x180)")
    apple_icon = create_cortex_icon(180)
    apple_icon.save("hosting/public/apple-touch-icon.png")
    apple_icon.save("hosting/public/apple-touch-icon-180x180.png")
    
    print("✅ All Cortex favicon files generated successfully!")

if __name__ == "__main__":
    main()