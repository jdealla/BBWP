let babelMinifyPlugin = require("babel-minify-webpack-plugin");
let HtmlWebpackPlugin = require("html-webpack-plugin");
let HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
let StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let EventHooksPlugin = require('event-hooks-webpack-plugin');
let gulp = require('./gulpfile');
const webpack = require('webpack');

console.log(__dirname);


let verbose = process.argv[process.argv.length - 1] === '--verbose' ? true : false;

let pluginsArray = verbose ? [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
        'when': function (cb) {
            return new Promise((res, rej) => {
                setInterval(() => {
                    try {
                        let bool = cb();
                        if (bool === !0) {
                            res(!0)
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }, 200)
            })
        },
        'actions': {
            send: function (name, value = 'no value', attr = 'no attribute') {
                console.log(`Action Fired: ${name}, ${value}, ${attr}`)
            },
            set: function (name, value = 'no value', attr = 'no attribute') {
                console.log(`Action Set: ${name}, ${value}, ${attr}`)
            }
        },
        'dom': {
            addCss: function (msg) {
                console.log('Added ', msg)
            }
        },
        'css': "'css'",
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new EventHooksPlugin({
        'entry-option': function () {
            gulp.runDevGulp();
        }
    }),
] : [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
        'when': function (cb) {
            return new Promise((res, rej) => {
                setInterval(() => {
                    try {
                        let bool = cb();
                        if (bool === !0) {
                            res(!0)
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }, 200)
            })
        },
        'actions': {
            send: function (name, value = 'no value', attr = 'no attribute') {
                console.log(`Action Fired: ${name}, ${value}, ${attr}`)
            },
            set: function (name, value = 'no value', attr = 'no attribute') {
                console.log(`Action Set: ${name}, ${value}, ${attr}`)
            }
        },
        'dom': {
            addCss: function (msg) {
                console.log('Added ', msg)
            }
        },
        'css': "'css'"
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new babelMinifyPlugin(),
    new EventHooksPlugin({
        'entry-option': function () {
            gulp.runDevGulp();
        }
    }),
];

const fs = require('fs');
const path = require('path');
const getDirectoriesArray = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());

function getEntryPoints() {
    let obj = {};
    let directories = getDirectoriesArray('.');
    directories.forEach(directory => {
        if (directory.toLowerCase().indexOf('challenger') > -1 || directory.toLowerCase().indexOf('variant') > -1 || directory.toLowerCase().indexOf('control') > -1) {
            obj[directory] = `./dev/temp/${directory}.js`
        }
    });
    return obj;
}
let entryPoints = getEntryPoints();

module.exports = {
    entry: entryPoints,
    output: {
        path: __dirname,
        filename: 'dev/[name].bundle.js'
    },
    plugins: pluginsArray,
    module: {
        rules: [
            // JavaScript
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['replacebabelpresetenv'],
                        plugins: []
                    }
                }
            },
            // JSX
            {
                test: /\.jsx$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['replacebabelpresetenv', 'replacebabelpresetreact'],
                        plugins: []
                    }
                }
            },
            // SCSS
            {
                test: /\.scss$/,
                use: [{
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader",
                        options: {
                            minimize: true
                        }
                    },
                    {
                        loader: "sass-loader"
                    }
                ],
            },
            // CSS
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    },
    resolveLoader: {
        modules: [
            "replacenodepath"
        ]
    },
    resolve: {
        modules: [
            'replacenodepath'
        ],
        alias: {
            bbmodules: 'replacebbmodules',
            amexmodules: 'replacemodules',
            qualification_offer: 'replacequalificationoffer',
            variant_offer: 'replacevariantnoffer',
            test_utilities: 'replacetestutilities',
            config: path.join(__dirname, 'BB.AMEX.test.config.js'),
          }
    }
};