module.exports = {
  nav: [
    {
      text: 'Home',
      link: '/',
      icon: 'reco-home',
    },
    {
      text: 'TimeLine',
      link: '/timeline/',
      icon: 'reco-date',
    },
    {
      text: '📝 个人笔记本',
      link: 'http://shooterblog.site/Notebook/',
      // icon: 'reco-suggestion'
    },
    {
      text: 'GitHub',
      link: 'https://github.com/shooterRao',
      icon: 'reco-github',
    },
  ],
  type: 'blog',
  blogConfig: {
    category: {
      location: 2,
      text: 'Category',
    },
    tag: {
      location: 3,
      text: 'Tag',
    },
  },
  friendLink: [],
  // logo: '/logo.png',
  search: true,
  searchMaxSuggestions: 10,
  lastUpdated: 'Last Updated',
  author: 'RJW',
  authorAvatar:
    'https://avatars1.githubusercontent.com/u/23609695?s=400&u=d2db8f6efdee5add420addf7f89b916f7ef47ca7&v=4',
  startYear: '2017',
}