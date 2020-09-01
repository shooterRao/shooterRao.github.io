const themeConfig = require('./theme');

module.exports = {
  title: `RJW's Blog`,
  description: '你若盛开，蝴蝶自来',
  dest: 'public',
  locales: { '/': { lang: 'zh' } },
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/sl.ico',
      },
    ],
    [
      'meta',
      {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1,user-scalable=no',
      },
    ],
  ],
  theme: 'reco',
  themeConfig,
  markdown: {
    lineNumbers: true,
  },
};
