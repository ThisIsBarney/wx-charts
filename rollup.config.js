import babel from 'rollup-plugin-babel';

let banner = `/*
 * charts for WeChat small app v1.0
 *
 * Origin source:
 * https://github.com/xiaolin3303/wx-charts
 * 2016-11-28
 *
 * Modified by Tang Shujun
 */
`;

export default {
  entry: 'src/app.js',
  format: 'cjs',
  dest: '../btrcwechatapp/utils/wxcharts-modified.js',
  plugins: [
      babel({
          exclude: 'node_modules/**',
      })
  ],
  banner: banner
};
