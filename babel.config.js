module.exports = {
  env: {
    cjs: {
      presets: [
        ['env', {
          targets: {
            node: '6.10',
          },
          modules: 'commonjs',
        }],
      ],
    },
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
  },
};
