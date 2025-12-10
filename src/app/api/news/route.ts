import { NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
}

interface RSSResponse {
  items?: NewsItem[];
}

const RSS_URLS = [
  'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Fwww.ny1.com%2Fservices%2Fcontentfeed.nyc%7Call-boroughs%7Cnews.landing.rss',
  'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fgothamist.com%2Ffeed',
];

// Borough keywords for filtering - broadened for better coverage
const BOROUGH_KEYWORDS: Record<string, string[]> = {
  manhattan: ['manhattan', 'midtown', 'harlem', 'village', 'soho', 'tribeca', 'chelsea', 'upper east', 'upper west', 'lower east', 'financial district', 'times square', 'central park', 'broadway', 'wall street', 'chinatown', 'little italy', 'east village', 'west side', 'downtown', 'uptown', 'herald square', 'union square', 'gramercy', 'murray hill', 'kips bay', 'stuyvesant', 'washington heights', 'inwood', 'morningside'],
  brooklyn: ['brooklyn', 'williamsburg', 'bushwick', 'park slope', 'bed-stuy', 'dumbo', 'greenpoint', 'crown heights', 'flatbush', 'bay ridge', 'bensonhurst', 'coney island', 'brighton beach', 'sunset park', 'red hook', 'cobble hill', 'carroll gardens', 'prospect', 'fort greene', 'clinton hill', 'brownsville', 'east new york', 'canarsie', 'sheepshead', 'midwood', 'borough park', 'dyker heights'],
  queens: ['queens', 'astoria', 'flushing', 'lic', 'long island city', 'jackson heights', 'jamaica', 'forest hills', 'rego park', 'corona', 'elmhurst', 'woodside', 'sunnyside', 'bayside', 'whitestone', 'college point', 'far rockaway', 'rockaway', 'ridgewood', 'maspeth', 'middle village', 'glendale', 'ozone park', 'howard beach', 'kew gardens', 'fresh meadows', 'little neck', 'douglaston'],
  bronx: ['bronx', 'fordham', 'riverdale', 'yankee', 'pelham', 'mott haven', 'hunts point', 'south bronx', 'tremont', 'morris', 'highbridge', 'concourse', 'kingsbridge', 'wakefield', 'co-op city', 'throgs neck', 'city island', 'parkchester', 'soundview', 'castle hill', 'westchester square', 'norwood', 'bedford park', 'belmont', 'arthur avenue'],
  'staten-island': ['staten', 'ferry', 'st. george', 'tottenville', 'great kills', 'new dorp', 'south beach', 'midland beach', 'todt hill', 'stapleton', 'port richmond', 'west brighton', 'westerleigh', 'bulls head', 'travis', 'richmond', 'verrazano'],
};

// Negative keywords for vibe calculation
const NEGATIVE_KEYWORDS = [
  'dead', 'kill', 'shot', 'crash', 'delay', 'fire', 'hurt', 'attack',
  'rob', 'stole', 'arrest', 'stuck', 'train traffic', 'shooting', 'murder',
  'assault', 'stabbing', 'accident', 'emergency', 'evacuate', 'danger'
];

export async function GET() {
  try {
    // Fetch from all RSS sources
    const responses = await Promise.all(
      RSS_URLS.map((url) =>
        fetch(url, { next: { revalidate: 600 } })
          .then((res) => res.json())
          .catch(() => ({ items: [] }))
      )
    );

    // Combine and sort articles
    let articles: NewsItem[] = [];
    responses.forEach((response: RSSResponse) => {
      if (response.items) {
        articles = articles.concat(response.items);
      }
    });

    // Sort by date
    articles.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    // Get top 15 articles for main feed
    const mainArticles = articles.slice(0, 15).map((article) => ({
      title: article.title,
      link: article.link,
      date: new Date(article.pubDate).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }),
    }));

    // Calculate city vibe based on news sentiment
    let vibeScore = 0;
    articles.slice(0, 15).forEach((article) => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      if (NEGATIVE_KEYWORDS.some((keyword) => text.includes(keyword))) {
        vibeScore -= 1;
      }
    });

    let vibe: { text: string; className: string };
    if (vibeScore > 0) {
      vibe = { text: 'Positive', className: 'vibe-positive' };
    } else if (vibeScore < -2) {
      vibe = { text: 'Negative', className: 'vibe-negative' };
    } else {
      vibe = { text: 'Neutral', className: 'vibe-neutral' };
    }

    // Get borough-specific news
    const usedLinks = new Set(mainArticles.map((a) => a.link));
    const boroughNews: Record<string, { title: string; link: string } | null> = {};

    Object.keys(BOROUGH_KEYWORDS).forEach((borough) => {
      const keywords = BOROUGH_KEYWORDS[borough];
      const article = articles.find((a) => {
        if (usedLinks.has(a.link)) return false;
        const text = (a.title + ' ' + (a.description || '')).toLowerCase();
        return keywords.some((keyword) => text.includes(keyword));
      });

      if (article) {
        boroughNews[borough] = {
          title: article.title,
          link: article.link,
        };
        usedLinks.add(article.link);
      } else {
        boroughNews[borough] = null;
      }
    });

    return NextResponse.json({
      articles: mainArticles,
      boroughNews,
      vibe,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news data' },
      { status: 500 }
    );
  }
}
