module.exports = {
  endOfLine: 'auto',
  arrowParens: 'avoid',
  printWidth: 80,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  trailingComma: 'all',

  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    '^vue$',
    '^nuxt',
    '<THIRD_PARTY_MODULES>',
    '^@(lib|store)',
    '^@components',
    '^@pages',
    '^@styles',
    '.(css|scss)$',
    'html',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
