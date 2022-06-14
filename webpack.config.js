const { resolve } = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  //指定loader查找目录
  resolveLoader: {
    modules: ['node_modules', resolve(__dirname, './modules')]
  },
  //配置模块的相关解析策略,对js vue文件解析
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /.vue$/i,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'public/index.html')
    })
  ]
}