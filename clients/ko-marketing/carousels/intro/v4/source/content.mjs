// Copy for v4 (option B structure mixed with v3 visuals), based on the options copy. Every service name, tagline and description is taken from
// komarketingagency.com (home, /services and the six /services/* pages, /plans, checked 3 October 2026).
// Em dashes from the site are rewritten as commas or colons (carousel-maker rule 1).
// The word in <em> takes the KO dusty blue accent.

// /services: the six service categories, each with the five items listed under "What we do" on its page.
export const CATEGORIES = [
  {
    name: 'UGC & Creator', short: 'UGC & <em>Creator</em>', page: '/services/ugc-and-creator',
    tagline: 'The content people actually trust.',
    body: 'Real faces, real trust. Creator content that connects without feeling like an ad.',
    items: ['Creator sourcing & matching', 'Briefs & scripting', 'Production & delivery', 'Ad-ready & whitelisted', 'Performance tracking'],
    photo: 'creator-filming', pos: '60% 50%',
  },
  {
    name: 'Social Media Manager', short: 'Social Media <em>Manager</em>', page: '/services/social-media-manager',
    tagline: 'Build an audience that actually shows up.',
    body: 'Your channels, run end to end. Strategy, posting and community that build a real audience.',
    items: ['Channel strategy', 'Content calendar', 'Creation & posting', 'Community management', 'Reporting & optimisation'],
    photo: 'feed-phone', pos: '50% 45%',
  },
  {
    name: 'Website & SEO', short: 'Website & <em>SEO</em>', page: '/services/website-and-seo',
    tagline: 'A site that works while you sleep.',
    body: 'Fast, beautiful sites that convert and rank, so the right people keep arriving.',
    items: ['Web design & build', 'Conversion-focused UX', 'SEO strategy', 'On-page optimisation', 'Speed & analytics'],
    photo: 'laptop-coffee', pos: '55% 50%',
  },
  {
    name: 'Strategy & Advertising', short: 'Strategy & <em>Advertising</em>', page: '/services/strategy-and-advertising',
    tagline: 'Put your budget where it wins.',
    body: 'Meta, Google, TikTok. The right message to the right people, optimised for return.',
    items: ['Marketing strategy', 'Audience & targeting', 'Paid social', 'Google & search', 'Creative & testing'],
    photo: 'strategy-notes', pos: '40% 50%',
  },
  {
    name: 'Email Marketing', short: 'Email <em>Marketing</em>', page: '/services/email-marketing',
    tagline: 'The channel you actually own.',
    body: 'Flows and campaigns that turn first-time buyers into loyal regulars.',
    items: ['Email strategy', 'Automated flows', 'Campaign design & copy', 'List growth & segments', 'Testing & optimisation'],
    photo: 'planning-desk', pos: '50% 50%',
  },
  {
    name: 'Branding & Audits', short: 'Branding & <em>Audits</em>', page: '/services/branding-and-audits',
    tagline: 'Know exactly where the wins are hiding.',
    body: 'A look and a voice that command attention and earn trust in seconds.',
    items: ['Brand & channel audits', 'Brand strategy', 'Logo & visual identity', 'Brand guidelines', 'Art direction & templates'],
    photo: 'team-moodboard', pos: '50% 40%',
  },
];

// Home page "Services" section: the twelve services, in site order.
export const HOME_SERVICES = [
  'Branding & Creatives', 'Audits', 'Social Media Management', 'Marketing', 'Shoots', 'UGC & Creators',
  'Content Manager', 'Paid Ads', 'Website & SEO', 'Email & Retention', 'Monthly Reporting', 'Consulting & Coaching',
];

const STEPS = [
  { n: '01', label: 'Discover', desc: 'We dig into your brand, market and goals to find the real opportunity.' },
  { n: '02', label: 'Strategy', desc: 'We map the plan: channels, message, targets, timeline.' },
  { n: '03', label: 'Create', desc: 'Our team builds the content, campaigns and assets that bring it to life.' },
  { n: '04', label: 'Launch & optimise', desc: 'We go live, watch the data daily and double down on what works.' },
  { n: '05', label: 'Scale', desc: 'We grow what\u2019s winning and keep raising the bar.' },
];

export const carousels = [
  {
    id: '01-we-are-open',
    topic: 'We are open',
    slides: [
      {
        type: 'cover', kicker: 'Now open in Bangkok',
        title: 'We are <em>open.</em>',
        body: 'KO is a marketing agency in the heart of Bangkok. We build brands people remember and campaigns that actually move numbers.',
        photo: 'bangkok-skyline', pos: '50% 35%', photo2: 'studio-portrait', pos2: '50% 50%',
      },
      {
        type: 'text', label: 'The problem',
        title: 'Seen once.<br>Then <em>forgotten.</em>',
        body: 'Posting when you remember isn\u2019t a strategy. Neither is chasing likes that never turn into sales. The feed goes quiet, and your audience forgets you.',
        photo: 'feed-scroll', pos: '50% 50%',
      },
      {
        type: 'text', label: 'Who we are',
        title: 'A bold agency in<br>the heart of <em>Bangkok.</em>',
        body: 'Built for brands that refuse to blend in. From strategy to content to ads, we do it all in house, so every piece pulls the same way.',
        chips: ['In house team', 'Bangkok, Thailand'],
        photo: 'bangkok-photographer', pos: '50% 35%',
      },
      {
        type: 'list6', label: 'What we do',
        title: 'Everything your brand<br>needs, under <em>one</em> roof.',
        body: 'Pick one service, or hand us the whole thing.',
        items: CATEGORIES.map((c) => ({ name: c.name, line: c.tagline })),
        photo: 'cinema-camera', pos: '50% 50%',
      },
      {
        type: 'text', label: 'What changes',
        title: 'Seen. Followed.<br><em>Remembered.</em>',
        body: 'From the heart of Bangkok, KO helps ambitious brands get seen, get followed and get remembered. Every piece pulls in the same direction: growth.',
        photo: 'matcha-shoot', pos: '50% 40%',
      },
      {
        type: 'cta',
        title: 'Let\u2019s make your brand<br>the one people <em>remember.</em>',
        body: 'From strategy to content to ads, all under one roof, all in. Tell us about your brand.',
        photo: 'studio-shoot', pos: '72% 50%',
      },
    ],
    caption:
      'KO Marketing is officially open in Bangkok.\n\nWe build brands people remember and campaigns that actually move numbers. UGC & Creator, Social Media Manager, Website & SEO, Strategy & Advertising, Email Marketing, Branding & Audits: all under one roof, all in house.\n\nSay hello at komarketingagency.com and save this post for later.\n\n#KOMarketing #BangkokMarketing #MarketingAgency #BangkokBusiness #SocialMediaMarketing #BrandStrategy',
  },
  {
    id: '02-who-we-are',
    topic: 'Who we are',
    slides: [
      {
        type: 'cover', kicker: 'Small team. All in.',
        title: 'Who we <em>are.</em>',
        body: 'We\u2019re KO, a bold marketing agency in the heart of Bangkok, built for brands that refuse to blend in.',
        photo: 'team-meeting', pos: '50% 45%', photo2: 'team-laptops', pos2: '50% 50%',
      },
      {
        type: 'text', label: 'The problem',
        title: 'Too many teams.<br>No <em>direction.</em>',
        body: 'When strategy, content and ads sit in different places, they stop pulling the same way. Your brand ends up saying three different things.',
        chips: ['Strategy', 'Content', 'Ads'],
        photo: 'mood-wall', pos: '50% 40%',
      },
      {
        type: 'text', label: 'Who we are',
        title: 'Everything under<br><em>one</em> roof.',
        body: 'From strategy to content to ads, we do it all in house. One team and one plan, so every piece pulls in the same direction: growth.',
        photo: 'team-desk', pos: '50% 40%',
      },
      {
        type: 'steps', label: 'How we work',
        title: 'From hello<br>to <em>growth.</em>',
        body: 'Simple, fast, transparent. Here\u2019s the journey, from your first message to growth.',
        steps: STEPS,
        photo: 'planning-desk', pos: '50% 50%',
      },
      {
        type: 'steps', label: 'How we work',
        title: 'Every step,<br>in plain <em>sight.</em>',
        body: 'Clear, honest numbers every month: what we did, what it earned, what\u2019s next.',
        steps: STEPS,
        photo: 'studio-edit', pos: '70% 50%',
      },
      {
        type: 'cta',
        title: 'Tell us about<br>your <em>brand.</em>',
        body: 'Strategy that thinks. Content that performs. Write to hello@komarketingagency.com and we get back to you within one business day.',
        photo: 'street-shoot', pos: '50% 40%',
      },
    ],
    caption:
      'We are KO, a small marketing team in the heart of Bangkok, built for brands that refuse to blend in.\n\nStrategy, content and ads all happen in house, so every piece pulls toward growth. Our process is simple: discover, strategy, create, launch and optimise, scale.\n\nTell us about your brand at komarketingagency.com.\n\n#KOMarketing #BangkokMarketing #MarketingAgency #BrandStrategy #ContentCreation #BangkokBusiness',
  },
  {
    id: '03-what-we-do',
    topic: 'What we do',
    slides: [
      {
        type: 'cover', kicker: 'Everything we do',
        title: 'What we <em>do.</em>',
        body: 'Everything your brand needs, all under one roof. Swipe through every service, then pick one or hand us the whole thing.',
        photo: 'camera-tripod', pos: '50% 50%', photo2: 'cafe-shoot', pos2: '50% 40%',
      },
      {
        type: 'grid12', label: 'Our services',
        title: 'One team for<br>every <em>channel.</em>',
        body: 'Twelve services, one team, all in house.',
        items: HOME_SERVICES,
        photo: 'studio-edit', pos: '72% 50%',
      },
      ...CATEGORIES.map((c, k) => ({ type: 'service', n: String(k + 1).padStart(2, '0'), of: '06', ...c })),
      {
        type: 'four', label: 'Also in house',
        title: 'Shoots, content<br>and <em>coaching.</em>',
        items: [
          { name: 'Shoots', desc: 'Photo and video production that makes your brand look as good as it is.' },
          { name: 'Content Manager', desc: 'Scroll-stopping posts, copy and assets: consistent, on-brand, made to perform.' },
          { name: 'Monthly Reporting', desc: 'Clear, honest numbers every month: what we did, what it earned, what\u2019s next.' },
          { name: 'Consulting & Coaching', desc: 'Prefer to run it in house? We hand you the strategy, tools and know-how to do it right.' },
        ],
        photo: 'cinema-camera', pos: '50% 50%',
      },
      {
        type: 'cta',
        title: 'Pick a service.<br>Or take them <em>all.</em>',
        body: 'Starter, Growth and Premium plans. Premium includes everything: social, ads, shoots, UGC, content, web, SEO and email.',
        photo: 'matcha-shoot', pos: '50% 40%',
      },
    ],
    caption:
      'Everything KO does, in one post.\n\nUGC & Creator. Social Media Manager. Website & SEO. Strategy & Advertising. Email Marketing. Branding & Audits. Plus shoots, content management, monthly reporting and consulting & coaching.\n\nPick one service, or hand us the whole thing with a Starter, Growth or Premium plan. See every service at komarketingagency.com.\n\n#KOMarketing #BangkokMarketing #SocialMediaMarketing #DigitalMarketing #MarketingAgency #UGC #SEO #EmailMarketing',
  },
];
