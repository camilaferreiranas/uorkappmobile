const t = require('@babel/core').types;

const dynamicImportToRequire = () => ({
  name: 'transform-dynamic-import-to-require',
  visitor: {
    CallExpression(path) {
      if (path.node.callee.type !== 'Import') return;
      path.replaceWith(
        t.callExpression(
          t.memberExpression(
            t.callExpression(
              t.memberExpression(t.identifier('Promise'), t.identifier('resolve')),
              []
            ),
            t.identifier('then')
          ),
          [
            t.arrowFunctionExpression(
              [],
              t.callExpression(t.identifier('require'), path.node.arguments)
            ),
          ]
        )
      );
    },
  },
});

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      test: {
        plugins: [dynamicImportToRequire],
      },
    },
  };
};
