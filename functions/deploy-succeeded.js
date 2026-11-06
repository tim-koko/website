// Netlify runs this function automatically after every successful deploy.
// It notifies search engines (Bing, Yandex, Seznam, ... via IndexNow) about
// pages that changed recently, so they get re-crawled quickly. Bing also feeds
// the web search of ChatGPT and Copilot.
//
// A page counts as "changed" if its <lastmod> in the sitemap (= `lastmod` in
// the front matter) lies within the last LOOKBACK_DAYS days.
// Docs: https://www.indexnow.org/documentation

const SITE_URL = 'https://tim-koko.ch';
// Must match the key file static/<key>.txt
const INDEXNOW_KEY = 'f586ebaf7ab36783f24e93133e330ee7';
const LOOKBACK_DAYS = 7;

// Returns all <loc>/<lastmod> pairs of a sitemap, following sitemap indexes.
async function readSitemap(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Sitemap ${url} returned ${res.status}`);
  }
  const xml = await res.text();

  if (xml.includes('<sitemapindex')) {
    const children = [...xml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const nested = await Promise.all(children.map(readSitemap));
    return nested.flat();
  }

  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(m[1]);
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/.exec(m[1]);
    return { loc: loc && loc[1].trim(), lastmod: lastmod && new Date(lastmod[1].trim()) };
  });
}

exports.handler = async (event) => {
  // Only production deploys, not deploy previews or branch deploys
  let context = '';
  try {
    context = JSON.parse(event.body || '{}').payload.context;
  } catch (error) {
    console.warn('Could not read deploy context from event body', error);
  }
  if (context !== 'production') {
    return { statusCode: 200, body: `Skipped IndexNow for context "${context}"` };
  }

  try {
    const since = Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
    const entries = await readSitemap(`${SITE_URL}/sitemap.xml`);
    const urlList = [...new Set(
      entries
        .filter((e) => e.loc && e.lastmod && e.lastmod.getTime() >= since)
        .map((e) => e.loc),
    )];

    if (urlList.length === 0) {
      console.log('IndexNow: no pages changed recently, nothing to submit');
      return { statusCode: 200, body: 'Nothing to submit' };
    }

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });

    console.log(`IndexNow: submitted ${urlList.length} URLs, response ${res.status}`, urlList);
    return { statusCode: 200, body: `Submitted ${urlList.length} URLs (${res.status})` };
  } catch (error) {
    // Never fail loudly: indexing hints are nice to have
    console.error('IndexNow submission failed:', error);
    return { statusCode: 200, body: 'IndexNow submission failed' };
  }
};
