import os
import re

directory = 'projects/mission-control/app/'

replacements = [
    (r'bg-blue-600 text-white text-\[\#0a0a0a\]', 'bg-blue-600 text-white'),
    (r'text-\[\#0a0a0a\]', 'text-white'),
    (r'border-\[\#00ff41\]', 'border-blue-500'),
    (r'bg-\[\#6b7280\]', 'bg-slate-400'),
    (r'hover:text-blue-500/50', 'hover:text-blue-500'),
    (r'bg-blue-600 text-white hover:bg-blue-700 text-white', 'bg-blue-600 hover:bg-blue-700 text-white'),
]

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original = content
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)
                
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
