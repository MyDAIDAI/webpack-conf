# `webpack`配置之多文件入口多文件出口

在项目的开发中，有时候会遇到在一个项目中，需要将一个入口文件打包称为多个出口文件的情况，在查找了需要资料之后完成了这个需求，总结如下

- 安装`cross-env`
  - `cross-env`可以在运行脚本的时候传入环境变量
  - `npm install --save-dev cross-env`

- 在`package.json`文件中添加需要编译的页面的脚本
  
  ```javascript
  "dev:page1": "cross-env page=page1 webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
  "dev:page2": "cross-env page=page2 webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
  "build:page1": "cross-env NODE_ENV=production env_config=prod page=page1 node build/build.js",
  "build:page2": "cross-env NODE_ENV=production env_config=prod page=page2 node build/build.js",
  "build:all": "npm run build:page1 && npm run build:page2 && npm run build"
  ```
  
- 在根目录下分别新建每一个页面所需要加载的静态文件夹 `page1-static` 与 `page2-static`
  
- 为项目配置不同页面所需要的`router`文件
  - `router`文件夹中新建`page1.js`与`page2.js`
  - 分别在上述文件中引用对应的组件
  
- 新建不同页面的入口文件`page1.js`与`page2.js`，并且分别引用`router`中的`page1`与`page2`

- 向`config`中的`index.js`文件中添加不同入口文件打包时的配置
  
  ```javascript
  const merge = require('webpack-merge')
  const ENV_PAGE = process.env.page // 打包脚本中暴露的环境变量

  const buildList = {
    index: path.resolve(__dirname, `../dist/${ENV_PAGE}/index.html`),
    assetsRoot: path.resolve(__dirname, `../dist/${ENV_PAGE}`),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: false,
    devtool: '#source-map',
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  }
  const buildConfig = {}
  if (ENV_PAGE) {
    buildConfig[ENV_PAGE] = buildList
  }

  module.exports = merge(buildConfig, {
    dev: {},
    build: { // 默认 index.js 入口文件的打包到 default 文件夹中
      index: path.resolve(__dirname, '../dist/default/index.html'),
      assetsRoot: path.resolve(__dirname, '../dist/default'),
      assetsSubDirectory: 'static',
      assetsPublicPath: '/'
      // 其他没变
    }
  })
  ```

- 向`build`文件夹的`utils`文件中添加对打包路径的统一引用
  
  ```javascript
  const ENV_PAGE = process.env.page
  // edit：根据不同的打包页面对目录以及文件设置不同的值
  // 默认路径配置
  let pageAssetsRoot = config.build.assetsRoot
  let pageAssetsSubDirectory = config.build.assetsSubDirectory
  let pageAssetsPublicPath = config.build.assetsPublicPath
  let pageEntryFile = './src/main.js' // 入口文件
  let pageFileName = config.build.index // HtmlWebpackPlugin 输出文件名称
  let staticPath = '../static'

  // 根据环境变量修改路径的配置
  if (ENV_PAGE) {
    pageAssetsRoot = config[ENV_PAGE].assetsRoot
    pageAssetsSubDirectory = config[ENV_PAGE].assetsSubDirectory
    pageAssetsPublicPath = config[ENV_PAGE].assetsPublicPath
    pageEntryFile = `./src/${ENV_PAGE}.js`
    pageFileName = config[ENV_PAGE].index
    staticPath = `../${ENV_PAGE}-static`
  }

  // edit：导出编译所需变量，以便在打包文件中引用
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
  ```

- 修改`webpack.base.conf.js`中入口与出口路径
  
  ```javascript
  module.exports = {
    entry: {
      app: utils.pageEntryFile
    },
    output: {
      path: utils.pageAssetsRoot, // edit
      filename: '[name].js',
      publicPath: process.env.NODE_ENV === 'production'
        ? utils.pageAssetsPublicPath // edit
        : config.dev.assetsPublicPath
    }
  }
  ```

- 修改`webpack.prod.conf.js`中的配置
  
  ```javascript
  output: {
    path: utils.pageAssetsRoot, // edit
  },
  new HtmlWebpackPlugin({
    filename: utils.pageFileName, // edit
  }),
  new CopyWebpackPlugin([
    {
      from: path.resolve(__dirname, utils.staticPath),
      to: utils.pageAssetsSubDirectory, // edit
      ignore: ['.*']
    }
  ])
  ```

- 运行`npm run dev`、`npm run dev:page1`或者其他，打开浏览器，会分别显示每个页面的内容
- 运行`npm run build`会在`dist`中生成`default`文件夹，静态文件都包含其中
- 运行`npm run build:page1`，会在`dist`中生成`page1`文件夹...
- 运行`npm run build:all`，会同时生成所有的...
