#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

// Basic sitemap generator using known routes
const baseUrl = process.env.SITE_URL || 'https://www.coachwilltumbles.com';
const now = new Date().toISOString();

const routes: string[] = [
  '/',
  '/about',
  '/booking',
  '/blog',
  '/tips',
  '/contact',
  '/parent/login',
  '/parent-register'
];

function escapeXml(str: string) {
  return str.replace(/[<>&"']/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
}

const urlset = routes.map((route) => `  <url>
    <loc>${escapeXml(baseUrl + route)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.7'}</priority>
  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

const outDir = path.resolve(process.cwd(), 'client', 'public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
console.log('Sitemap generated at client/public/sitemap.xml');
