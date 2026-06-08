import fs from 'fs';

const files = [
  'src/components/shared/NotificationBell.tsx',
  'src/components/ReviewView.tsx',
  'src/components/ProfileSettingsView.tsx',
  'src/components/MessagesView.tsx',
  'src/components/FeedView.tsx',
  'src/components/EventsView.tsx',
  'src/components/BuddyProfileView.tsx',
  'src/components/BuddiesView.tsx',
  'src/components/AdminUserManagement.tsx',
  'src/components/AdminEventForm.tsx',
  'src/components/AdminDashboardView.tsx'
];

const envLine = "const API_BASE_URL = import.meta.env.VITE_API_URL || '';";

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes("fetch('/api/") || content.includes("fetch(`/api/") || content.includes("io()")) {
    if (!content.includes(envLine)) {
      const parts = content.split('export default function');
      if (parts.length > 1) {
        content = parts[0] + envLine + '\n\nexport default function' + parts[1];
      } else {
         const parts2 = content.split('export function');
         if (parts2.length > 1) {
            content = parts2[0] + envLine + '\n\nexport function' + parts2[1];
         } else {
            const importsEnd = content.lastIndexOf('import ');
            const eol = content.indexOf('\n', importsEnd);
            content = content.substring(0, eol + 1) + '\n' + envLine + '\n' + content.substring(eol + 1);
         }
      }
    }
  }

  const pattern1 = /fetch\('(\/api\/[^']+)'/g;
  if (pattern1.test(content)) {
     content = content.replace(pattern1, 'fetch(`${API_BASE_URL}$1`');
     changed = true;
  }
  
  const pattern2 = /fetch\(`\/api\//g;
  if (pattern2.test(content)) {
     content = content.replace(pattern2, 'fetch(`${API_BASE_URL}/api/');
     changed = true;
  }
  
  if (content.includes("io()")) {
    content = content.replace(/io\(\)/g, "io(API_BASE_URL)");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
