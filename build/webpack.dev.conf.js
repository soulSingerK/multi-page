'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const express = require('express')
const opn = require('opn')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)
let app = express()

const tempDevWebpackConfig = {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  // devServer: {
  //   clientLogLevel: 'warning',
  //   historyApiFallback: {
  //     rewrites: [
  //       { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
  //     ],
  //   },
  //   hot: true,
  //   contentBase: false, // since we use CopyWebpackPlugin.
  //   compress: true,
  //   host: HOST || config.dev.host,
  //   port: PORT || config.dev.port,
  //   open: config.dev.autoOpenBrowser,
  //   overlay: config.dev.errorOverlay
  //     ? { warnings: false, errors: true }
  //     : false,
  //   publicPath: config.dev.assetsPublicPath,
  //   proxy: config.dev.proxyTable,
  //   quiet: true, // necessary for FriendlyErrorsPlugin
  //   watchOptions: {
  //     poll: config.dev.poll,
  //   }
  // },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: 'index.html',
    //   inject: true
    // }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
}

getAllHTML()
console.log(baseWebpackConfig)
const devWebpackConfig = merge(baseWebpackConfig, tempDevWebpackConfig)

function getAllHTML () {
  utils.resolveEntry().forEach((item, index) => {
    tempDevWebpackConfig.plugins.push(new HtmlWebpackPlugin({
      filename: `${item}.html`,
      // template: `./src/pages/${item}/${item}.html`,
      template: path.join(__dirname, '../src/pages', item, `${item}.html`),
      inject: true,
      chunks: [item]
    }))
  })
}

let compiler = webpack(devWebpackConfig)
let devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: config.dev.assetsPublicPath,
  stats: {
    colors: true,
    chunks: false
  }
})

let hotMiddleware = require('webpack-hot-middleware')(compiler)
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

app.use(devMiddleware)
app.use(hotMiddleware)
app.get('/:viewname?', (req, res, next) => {
  console.log(req.params.viewname)
  let viewname = req.params.viewname 
      ? req.params.viewname + '.html' 
      : 'index.html';
  const filepath = path.join(compiler.outputPath, viewname)
  // 使用webpack提供的outputFileSystem
  compiler.outputFileSystem.readFile(filepath, function(err, result) {
    if (err) {
      // something error
      return next(err)
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})
module.exports = new Promise((resolve, reject) => {
  app.listen(PORT || config.dev.port, (err) => {
    if (err) {
      return
    }
    const uri = `http://localhost:${PORT || config.dev.port}`
    console.log('Listening at' + uri + '\n')
    opn(uri)
  })
})
// module.exports = new Promise((resolve, reject) => {
//   portfinder.basePort = process.env.PORT || config.dev.port
//   portfinder.getPort((err, port) => {
//     if (err) {
//       reject(err)
//     } else {
//       // publish the new Port, necessary for e2e tests
//       process.env.PORT = port
//       // add port to devServer config
//       devWebpackConfig.devServer.port = port

//       // Add FriendlyErrorsPlugin
//       devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
//         compilationSuccessInfo: {
//           messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
//         },
//         onErrors: config.dev.notifyOnErrors
//         ? utils.createNotifierCallback()
//         : undefined
//       }))

//       resolve(devWebpackConfig)
//     }
//   })
// })

