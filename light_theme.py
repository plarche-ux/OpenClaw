import os
import re

directory = 'projects/mission-control/app/'

replacements = {
    r'bg-\[\#0a0a0a\]': 'bg-white',
    r'bg-\[\#111827\]': 'bg-slate-50',
    r'border-\[\#1f2937\]': 'border-slate-200',
    r'text-\[\#e2e8f0\]': 'text-slate-800',
    r'text-white': 'text-slate-900',
    r'text-\[\#6b7280\]': 'text-slate-500',
    r'bg-\[\#1f2937\]': 'bg-slate-100',
    r'bg-black/70': 'bg-slate-900/50',
    r'text-\[\#00ff41\]': 'text-blue-600',
    r'text-\[\#00cc33\]': 'text-blue-700',
    r'bg-\[\#00ff41\]': 'bg-blue-600 text-white',
    r'hover:bg-\[\#00cc33\]': 'hover:bg-blue-700',
    r'hover:border-\[\#00ff41\]/30': 'hover:border-blue-400',
    r'hover:border-\[\#00ff41\]': 'hover:border-blue-500',
    r'focus:border-\[\#00ff41\]': 'focus:border-blue-500',
    r'focus:ring-\[\#00ff41\]/30': 'focus:ring-blue-500/30',
    r'hover:text-\[\#00ff41\]/50': 'hover:text-blue-500/50',
    r'hover:text-\[\#00ff41\]': 'hover:text-blue-600',
    r'bg-\[\#00ff41\]/10': 'bg-blue-50',
    r'bg-\[\#00ff41\]/20': 'bg-blue-100',
    r'text-\[\#00ff41\]/50': 'text-blue-500/50',
    r'text-\[\#00ff41\]/70': 'text-blue-500/70',
    r'shadow-\[0_0_10px_rgba\(0,255,65,0\.1\)\]': 'shadow-sm',
    r'shadow-\[0_0_15px_rgba\(0,255,65,0\.1\)\]': 'shadow-md',
}

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original = content
            for pattern, replacement in replacements.items():
                content = re.sub(pattern, replacement, content)
                
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {path}")
