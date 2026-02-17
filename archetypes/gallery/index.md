---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
description: ""
tags: []
image: ""

# Optional: specify a cover image for the post card on the home/posts page.
# This should be the filename of one of the images in this bundle.
# e.g.  image: "01-cover.jpg"
# If left blank, no thumbnail shows on the post list (same as a text post with no image).
---

Write a description of this gallery here. This text appears below the photo slider.

<!-- 
  HOW TO ADD PHOTOS:
  Drop image files alongside this index.md file in the same folder.
  Supported: jpg, jpeg, png, gif, webp

  Naming controls order — use numeric prefixes:
    01-first-photo.jpg
    02-second-photo.jpg
    03-third-photo.jpg

  To add a caption to a photo, add a resources block to the front matter above:

  resources:
    - src: "01-first-photo.jpg"
      title: "A caption for this photo"
    - src: "02-second-photo.jpg"
      title: "Another caption"

  Captions appear in the slider on hover and in the lightbox.
-->
