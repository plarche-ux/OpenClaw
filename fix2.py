import os
import re

directory = 'projects/mission-control/app/'

replacements = [
    (r"shadow-\[0_0_10px_rgba\(0,255,65,0\.3\)\]", 'shadow-sm'),
    (r"shadow-\[0_0_15px_rgba\(0,255,65,0\.1\)\]", 'shadow-md'),
    (r"border-\[\#00ff41\]/30", 'border-blue-300'),
    (r"border-\[\#00ff41\]", 'border-blue-500'),
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
                print(f"Fixed shadows in {path}")
