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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const fixQuotes = /fetch\(`\$\{API_BASE_URL\}\/api\/([^']*)'/g;
  if (fixQuotes.test(content)) {
    content = content.replace(fixQuotes, "fetch(`${API_BASE_URL}/api/$1`");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed syntax in', file);
  }
});
