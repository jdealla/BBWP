let babelMinifyPlugin = require("babel-minify-webpack-plugin");
let EventHooksPlugin = require('event-hooks-webpack-plugin');
const webpack = require('webpack');
let gulp = require('./gulpfile');

let verbose = process.argv[process.argv.length - 1] === '--verbose' ? true : false;

let pluginsArray = verbose ? [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
        'process.env.NODE_PATH': path.join(__dirname, 'node_modules'),
    }),
    new EventHooksPlugin({
        'compile': function () {
            gulp.runGulp(true);
        }
    })
] : [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"',
    }),
    new babelMinifyPlugin(),
    new EventHooksPlugin({
        'compile': function () {
            gulp.runGulp(true);
        }
    })
];

const fs = require('fs');
const path = require('path');
const getDirectoriesArray = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

function getEntryPoints() {
    let obj = {};
    let directories = getDirectoriesArray('.');
    directories.forEach(directory => {
        if (directory.toLowerCase().indexOf('challenger') > -1 || directory.toLowerCase().indexOf('variant') > -1 || directory.toLowerCase().indexOf('control') > -1) {
            obj[directory] = path.join(__dirname, directory, `${directory}.js`) // `./${directory}/${directory}.js`
        }
    });
    obj.qualification = path.join(__dirname, 'qualification', 'qualification.js'); //'./qualification/qualification.js';
    return obj;
}
let entryPoints = getEntryPoints();

module.exports = {
    entry: entryPoints,
    output: {
        path: __dirname,
        filename: path.join('.', '[name]', 'build', '[name].bundle.js'), //'[name]/build/[name].bundle.js'
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
                        presets: [
                            ['replacebabelpresetenv', {
                                targets: {
                                    "browsers": ['> 2% in US', 'Explorer >= 11']
                                }
                            }]
                        ],
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