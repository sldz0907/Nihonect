const fs = require('fs');
let content = fs.readFileSync('src/components/EventsView.tsx', 'utf8');
content = content.replace(/t\('([^']+)',\s*'[^']+'\)/g, `'$1'`);
content = content.replace(/t\(\`([^\`]+)\`,\s*\`[^\`]+\`\)/g, '`$1`');
fs.writeFileSync('src/components/EventsView.tsx', content);
