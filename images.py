import os

import re

import shutil

from urllib.parse import unquote

  

# Paths (using raw strings to handle Windows backslashes correctly)

posts_dir = r"C:\Users\livou\Documents\Programming\Personal\manablog\content\posts"

attachments_dir = r"G:\My Drive\Obsidian\Rioru\attachments"

static_images_dir = r"C:\Users\livou\Documents\Programming\Personal\manablog\static\images"

  

# Ensure static/images directory exists

os.makedirs(static_images_dir, exist_ok=True)

  

# Track all referenced images across all posts

referenced_images = set()

  

def slugify(text):

  """Convert text to URL-friendly slug (similar to Hugo's urlize)"""

  # Convert to lowercase

  text = text.lower()

  # Replace spaces and special chars with hyphens

  text = re.sub(r'[^\w\s-]', '', text)

  text = re.sub(r'[-\s]+', '-', text)

  # Remove leading/trailing hyphens

  text = text.strip('-')

  return text

  

def extract_title_from_frontmatter(content):

  """Extract title from YAML frontmatter"""

  # Try YAML frontmatter (--- or +++ delimiters)

  frontmatter_pattern = r'^(?:---|\+\+\+)\s*\n(.*?)\n(?:---|\+\+\+)\s*\n'

  match = re.match(frontmatter_pattern, content, re.DOTALL)

  if match:

    frontmatter = match.group(1)

    # Look for title field

    title_match = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', frontmatter, re.MULTILINE)

    if title_match:

      return title_match.group(1).strip()

  return None

  

def find_title_based_image(title_slug, attachments_dir):

  """Find image in attachments folder that matches the title slug"""

  if not os.path.exists(attachments_dir):

    return None

  image_extensions = ['.png', '.jpg', '.jpeg', '.webp']

  # Check for exact match with slug

  for ext in image_extensions:

    potential_image = f"{title_slug}{ext}"

    image_path = os.path.join(attachments_dir, potential_image)

    if os.path.exists(image_path):

      return potential_image

  # Check for case-insensitive match

  for filename in os.listdir(attachments_dir):

    if not any(filename.lower().endswith(ext) for ext in image_extensions):

      continue

    # Get filename without extension

    name_without_ext = os.path.splitext(filename)[0]

    name_slug = slugify(name_without_ext)

    if name_slug == title_slug:

      return filename

  return None

  

# Step 1: Process each markdown file in the posts directory

for filename in os.listdir(posts_dir):

  if filename.endswith(".md"):

    filepath = os.path.join(posts_dir, filename)

    with open(filepath, "r", encoding="utf-8") as file:

      content = file.read()

    # Extract title and find title-based image

    post_title = extract_title_from_frontmatter(content)

    title_image_dest = None

    if post_title:

      title_slug = slugify(post_title)

      title_image = find_title_based_image(title_slug, attachments_dir)

      if title_image:

        # Copy title-based image to static/images with slugged name

        source_path = os.path.join(attachments_dir, title_image)

        # Use the extension from the found image

        _, ext = os.path.splitext(title_image)

        dest_filename = f"{title_slug}{ext}"

        dest_path = os.path.join(static_images_dir, dest_filename)

        if os.path.exists(source_path):

          shutil.copy(source_path, dest_path)

          title_image_dest = dest_filename

          referenced_images.add(dest_filename)

          print(f"Copied title-based image: {title_image} -> {dest_filename}")

    # Step 2: Find all image links in Obsidian format: ![Image Description](/images/image.png) or ![Image Description](/images/image.png)

    # Match the entire pattern including optional ! prefix

    # Support multiple image formats

    image_pattern = r'!?\[\[([^]]*\.(?:png|jpg|jpeg|webp))\]\]'

    images = re.findall(image_pattern, content)

    # Also check for already-processed images in Hugo format: ![...](/images/...)

    processed_image_pattern = r'!\[[^\]]*\]\(/images/([^)]+)\)'

    processed_images = re.findall(processed_image_pattern, content)

    # Add all referenced images to the set

    for image in images:

      referenced_images.add(image)

    for processed_image in processed_images:

      # Decode URL-encoded image names (e.g., %20 -> space)

      decoded_image = unquote(processed_image)

      referenced_images.add(decoded_image)

    # Step 3: Replace image links and ensure URLs are correctly formatted

    for image in images:

      # Prepare the Markdown-compatible link with %20 replacing spaces

      markdown_image = f"![Image Description](/images/{image.replace(' ', '%20')})"

      # Replace both ![[image]] and [[image]] formats

      content = re.sub(rf'!?\[\[{re.escape(image)}\]\]', markdown_image, content)

      # Step 4: Copy the image to the Hugo static/images directory if it exists

      image_source = os.path.join(attachments_dir, image)

      if os.path.exists(image_source):

        shutil.copy(image_source, static_images_dir)

  

    # Step 5: Write the updated content back to the markdown file

    with open(filepath, "w", encoding="utf-8") as file:

      file.write(content)

  

# Step 6: Remove images from static/images that are no longer referenced

if os.path.exists(static_images_dir):

  static_images = set(os.listdir(static_images_dir))

  images_to_remove = static_images - referenced_images

  for image_to_remove in images_to_remove:

    image_path = os.path.join(static_images_dir, image_to_remove)

    try:

      if os.path.isfile(image_path):

        os.remove(image_path)

        print(f"Removed unused image: {image_to_remove}")

    except Exception as e:

      print(f"Error removing {image_to_remove}: {e}")

  

print("Markdown files processed and images synced successfully.")
