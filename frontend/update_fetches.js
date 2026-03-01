const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace double quotes
    content = content.replace(/fetch\("(\/api\/[^"]+)"/g, 'fetch(`${import.meta.env.VITE_API_URL || ""}$1`');
    // Replace single quotes
    content = content.replace(/fetch\('(\/api\/[^']+)'/g, 'fetch(`${import.meta.env.VITE_API_URL || ""}$1`');
    // Replace template literals
    content = content.replace(/fetch\(`(\/api\/[^`]+)`/g, 'fetch(`${import.meta.env.VITE_API_URL || ""}$1`');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated: ' + path.basename(file));
        updatedCount++;
    }
});

console.log(`Finished updating ${updatedCount} files.`);
