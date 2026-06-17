import os
import re

blog_dir = "blog"
files = os.listdir(blog_dir)

print(f"Checking {len(files)} files in '{blog_dir}'...")

line_num_pattern = re.compile(r'\b\d+:\s')

for file in sorted(files):
    if not file.endswith('.html'):
        continue
    filepath = os.path.join(blog_dir, file)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Calculate word count (strip HTML tags first)
    text = re.sub(r'<[^>]+>', ' ', content)
    words = text.split()
    word_count = len(words)
    
    # Find line number patterns
    matches = line_num_pattern.findall(content)
    
    # Print status
    print(f"{file:<80} | Words: {word_count:<6} | Line-num occurrences: {len(matches)}")
