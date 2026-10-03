// Every line below is taken from komarketingagency.com (home, services, plans, contact).
// Accent words are wrapped in <em> and rendered in Playfair Display Italic.
// tones: one per slide, 'b' = KO burgundy ground, 'c' = cream paper sheet.

export const carousels = [
  {
    id: '01-we-are-open',
    tones: ['b', 'c', 'b', 'c', 'b', 'c'],
    cover: {
      chip: 'Now open in Bangkok',
      title: 'We are<br><em>open.</em>',
      sub: 'Your new marketing team, from the heart of Bangkok.',
    },
    s2: {
      label: 'The problem',
      title: 'Seen once.<br>Then <em>forgotten.</em>',
      body: 'Posting is easy. Being the brand people remember is the hard part.',
      hero: { type: 'fade', items: ['Seen', 'Scrolled past', 'Forgotten'] },
    },
    s3: {
      label: 'Who we are',
      title: 'A bold agency in the<br>heart of <em>Bangkok.</em>',
      body: 'Built for brands that refuse to blend in.',
      hero: { type: 'monogram', chips: ['In house team', 'Bangkok, Thailand'] },
    },
    s4: {
      label: 'What we bring',
      title: 'Three things,<br><em>one</em> team.',
      body: 'Strategy, content and ads, all under one roof.',
    },
    bars: [
      { n: '01', label: 'Strategy', desc: 'Clear goals, the right channels and a plan that actually delivers.' },
      { n: '02', label: 'Content', desc: 'Posts, copy, shoots and creator content made to perform.' },
      { n: '03', label: 'Ads', desc: 'The right message to the right people, optimised for return.' },
    ],
    s5: {
      label: 'What changes',
      title: 'Seen. Followed.<br><em>Remembered.</em>',
      body: 'Every piece pulls in the same direction: growth.',
    },
    s6: {
      title: 'Let\u2019s make your brand<br>the one people <em>remember.</em>',
      body: 'Strategy, content and ads, all under one roof, all in.',
    },
    caption:
      'KO Marketing is officially open in Bangkok. We build brands people remember, with strategy, content and ads all under one roof. Say hello at komarketingagency.com and save this post for later.\n\n#KOMarketing #BangkokMarketing #MarketingAgency #BangkokBusiness',
  },
  {
    id: '02-who-we-are',
    tones: ['c', 'b', 'c', 'b', 'c', 'b'],
    cover: {
      chip: 'Small team. All in.',
      title: 'Who we<br><em>are.</em>',
      sub: 'A marketing agency for brands that refuse to blend in.',
    },
    s2: {
      label: 'The problem',
      title: 'Too many teams.<br>No <em>direction.</em>',
      body: 'When strategy, content and ads sit in different places, they stop pulling the same way.',
      hero: { type: 'scatter', items: ['Strategy', 'Content', 'Ads'] },
    },
    s3: {
      label: 'Who we are',
      title: 'Everything under<br><em>one</em> roof.',
      body: 'From strategy to content to ads, we do it all in house.',
      hero: { type: 'converge', items: ['Strategy', 'Content', 'Ads'], target: 'Growth' },
    },
    s4: {
      label: 'How we work',
      title: 'From hello<br>to <em>growth.</em>',
      body: 'Simple, fast, transparent.',
    },
    bars: [
      { n: '01', label: 'Discover', desc: 'We dig into your brand, market and goals to find the real opportunity.' },
      { n: '02', label: 'Strategy', desc: 'We map the plan: channels, message, targets, timeline.' },
      { n: '03', label: 'Create', desc: 'Our team builds the content, campaigns and assets that bring it to life.' },
    ],
    s5: {
      label: 'What changes',
      title: 'Then we launch<br>and <em>scale.</em>',
      body: 'We watch the data daily, double down on what works and keep raising the bar.',
    },
    s6: {
      title: 'Tell us about<br>your <em>brand.</em>',
      body: 'We get back to you within one business day.',
    },
    caption:
      'We are KO, a small marketing team in the heart of Bangkok, built for brands that refuse to blend in. Strategy, content and ads all happen in house, so every piece pulls toward growth. Tell us about your brand at komarketingagency.com.\n\n#KOMarketing #BangkokMarketing #MarketingAgency #BrandStrategy',
  },
  {
    id: '03-what-we-do',
    tones: ['b', 'c', 'b', 'c', 'b', 'c'],
    cover: {
      chip: 'Strategy, content, ads',
      title: 'What we<br><em>do.</em>',
      sub: 'Everything your brand needs, all under one roof.',
    },
    s2: {
      label: 'The problem',
      title: 'Good brands still<br><em>blend</em> in.',
      body: 'Without a clear look, active channels and the right message, people scroll past.',
      hero: { type: 'checklist', items: ['A clear look', 'Active channels', 'The right message'] },
    },
    s3: {
      label: 'Our services',
      title: 'One team for<br>every <em>channel.</em>',
      body: 'Pick one service, or hand us the whole thing.',
      hero: {
        type: 'wall',
        items: [
          'Branding & Creatives', 'Social Media Management', 'Marketing Strategy', 'Shoots',
          'UGC & Creators', 'Content Manager', 'Paid Ads', 'Website & SEO',
          'Email & Retention', 'Monthly Reporting', 'Audits', 'Consulting & Coaching',
        ],
      },
    },
    s4: {
      label: 'What we bring',
      title: 'Look, voice<br>and <em>reach.</em>',
      body: 'Branding, social and paid ads, built to work together.',
    },
    bars: [
      { n: '01', label: 'Branding & Creatives', desc: 'A look and a voice that command attention and earn trust in seconds.' },
      { n: '02', label: 'Social Media Management', desc: 'Your channels, run end to end: strategy, posting and community.' },
      { n: '03', label: 'Paid Ads', desc: 'The right message to the right people, optimised for return.' },
    ],
    s5: {
      label: 'What changes',
      title: 'Growth you<br>can <em>measure.</em>',
      body: 'Clear, honest numbers every month. What we did, what it earned, what\u2019s next.',
    },
    s6: {
      title: 'Pick a service.<br>Or take them <em>all.</em>',
      body: 'Starter, Growth and Premium plans, built around your brand.',
    },
    caption:
      'From branding and shoots to social, paid ads, websites, email and monthly reporting, KO runs it all under one roof in Bangkok. Pick one service or hand us the whole thing. See every service at komarketingagency.com.\n\n#KOMarketing #BangkokMarketing #SocialMediaMarketing #DigitalMarketing #MarketingAgency',
  },
];
