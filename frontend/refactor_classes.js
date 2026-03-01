const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
    // Backgrounds
    'bg-ivory': 'bg-background',
    'bg-[#05060a]': 'bg-text-main',
    'bg-[#05060a]/95': 'bg-text-main/95',
    'bg-ink': 'bg-primary',
    'bg-ink3': 'bg-text-muted',
    'bg-gold': 'bg-primary',
    // Text
    'text-ink': 'text-text-main',
    'text-ink3': 'text-text-muted',
    'text-muted': 'text-text-muted',
    'text-gold': 'text-primary',
    // Borders
    'border-border': 'border-border-color',
    'border-gold': 'border-primary',
    'border-gold/50': 'border-primary/50',
    // Fonts
    'font-heading': 'font-sans font-bold',
    'font-body': 'font-sans',
    'font-mono': 'font-mono'
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Use word boundaries for safe replacement, except for arbitrary values like bg-[#05060a]
    for (const [oldClass, newClass] of Object.entries(replacements)) {
        // Escape special characters in oldClass for regex
        const escapedOldClass = oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<=[\\s"'\\\`])` + escapedOldClass + `(?=[\\s"'\\\`])`, 'g');
        content = content.replace(regex, newClass);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            processFile(fullPath);
        }
    }
}

walkDir(srcDir);
console.log('Done refactoring classes.');
