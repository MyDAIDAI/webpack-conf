'use strict'
const path = require('path')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')

const ENV_PAGE = process.env.page
// edit：根据不同的打包页面对目录以及文件设置不同的值
let pageAssetsRoot = config.build.assetsRoot
let pageAssetsSubDirectory = config.build.assetsSubDirectory
let pageAssetsPublicPath = config.build.assetsPublicPath
let pageEntryFile = './src/main.js' // 入口文件
let pageFileName = config.build.index // HtmlWebpackPlugin 输出文件名称
let staticPath = '../static'

if (ENV_PAGE) {
  pageAssetsRoot = config[ENV_PAGE].assetsRoot
  pageAssetsSubDirectory = config[ENV_PAGE].assetsSubDirectory
  pageAssetsPublicPath = config[ENV_PAGE].assetsPublicPath
  pageEntryFile = `./src/${ENV_PAGE}.js`
  pageFileName = config[ENV_PAGE].index
  staticPath = `../${ENV_PAGE}-static`
}

// edit：导出编译所需变量
exports.pageAssetsRoot = pageAssetsRoot
exports.pageAssetsSubDirectory = pageAssetsSubDirectory
exports.pageAssetsPublicPath = pageAssetsPublicPath
exports.pageEntryFile = pageEntryFile
exports.pageFileName = pageFileName
exports.staticPath = staticPath

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? pageAssetsSubDirectory // edit
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}
