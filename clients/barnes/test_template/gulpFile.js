const gulp = require('gulp');
var clean = require('gulp-clean');
const rename = require("gulp-rename");
const cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
const fs = require('fs');
const gap = require('gulp-append-prepend');
const path = require('path');
const colors = require('colors');
const htmlmin = require('gulp-htmlmin');

// Gulp Tasks
gulp.task('sassToCss', sassToCss);
gulp.task('minify-css', minifyCss);
gulp.task('create-html-css', createHTMLfromCSS);
gulp.task('create-html-js', createHTMLfromJS);
gulp.task('build-html', createHTMLBuild);
gulp.task('default', runGulp);


var running = false;

// CallBack Functions
function sassToCss(first) {
    running = true;
    return gulp.src('*/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename(function (path) {
            path.dirname += '/build/'
        }))
        .pipe(gulp.dest('./'))
        .on('end', function () {
            completeMessage(`CSS Minification completed!`);
            minifyCss(first);
        });
}

function minifyCss(first) {
    return gulp.src(['*/build/*.css', '!*/build/*.min.css'])
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(rename(function (path) {
            path.basename += ".min";
            path.extname = ".css"
        }))
        .pipe(gulp.dest('./'))
        .on('end', function () {
            completeMessage(`CSS Minification completed!`);
            createHTMLfromCSS(first);
        });
}

function createHTMLfromCSS(first) {
    return gulp.src('*/build/*.min.css')
        .pipe(gap.prependText('<style class="BB_AMEX_STYLESHEET">'))
        .pipe(gap.appendText('</style>'))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace('min', 'style');
            path.extname = ".html"
        }))
        .pipe(gulp.dest('./'))
        .on('end', function () {
            completeMessage(`CSS ===> HTML completed!`);
            createHTMLfromJS(first);
        });
}

function createHTMLfromJS(first) {
    getEntryPoints().forEach(directory => {
        if (filesExist(directory, first)) {
            gulp.src(`./${directory}/build/${directory}.bundle.js`)
                .pipe(gap.prependText('<script class="BB_AMEX_VARIANT_CODE">'))
                .pipe(gap.appendText('</script>'))
                .pipe(rename(function (path) {
                    path.basename = path.basename.replace('bundle', 'script');
                    path.extname = ".html"
                }))
                .pipe(gulp.dest(`./${directory}/build/`))
                .on('end', function () {
                    completeMessage(`JS ===> HTML for ${directory} completed!`)
                    createHTMLBuild(directory);
                });
        }
    });

}

function createHTMLBuild(directory) {
    try {
        return gulp.src(`./${directory}/build/${directory}.style.html`)
        .pipe(gap.appendFile(`${directory}/build/${directory}.script.html`))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace('style', 'build');
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(`./${directory}/build/`))
        .on('end', function () {
            completeMessage(`Completed building HTML for ${directory}`);
            if (running){
                running = false;
            }
        });
    } catch(e) {
        console.log(e);
    }
    
}

function removeHTML() {
    return gulp.src(['*/build/*.script.html', '*/build/*.style.html'], {
            read: false
        })
        .pipe(clean());
        console.log('Removed HTML');
}

// Main Export Function for Webpack Use
let watching = false;

function runGulp(first) {
    if (!watching) {
        sassToCss(first);
        gulp.watch('*/*.scss', gulp.series('sassToCss'));
        gulp.watch('*/build/*.bundle.js', gulp.series('sassToCss'));
        watching = true;
    }
}
module.exports.runGulp = runGulp;

// Utility Functions
// Gets array of all directories in the top level directory
const getDirectoriesArray = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());

// Creates an array of directory names as strings matching challenger, variant, or control
function getEntryPoints() {
    let arr = [];
    let directories = getDirectoriesArray('.');
    directories.forEach(directory => {
        if (directory.toLowerCase().indexOf('challenger') > -1 || directory.toLowerCase().indexOf('variant') > -1 || directory.toLowerCase().indexOf('control') > -1) {
            arr.push(directory);
        }
    });
    return arr;
}

function completeMessage(msg, color = 'green') {
    console.log(
        colors[color](msg)
    );
}

// Error Handling Functions

function cssExists(directory) {
    let bool = fs.existsSync(`./${directory}/build/${directory}.css`);
    if (bool) {
        return bool;
    } else {
        console.error(
            colors.red(`CSS ERROR IN ${directory}! CSS ERROR IN ${directory}!`)
        );
        console.error(
            colors.red(`Your HTML build for ${directory} will not compile because the following CSS file does not exist: `),
            colors.inverse(`${directory}/build/${directory}.css`),
        );
        return bool;
    }
}


function jsExists(directory) {
    let bool = fs.existsSync(`./${directory}/${directory}.js`);
    if (bool) {
        return bool;
    } else {
        console.error(
            colors.red.underline('JS ERROR! JS ERROR! JS ERROR! JS ERROR!')
        );
        console.error(
            colors.red(`Your HTML build for ${directory} will not compile because the following .js file does not exist: `),
            colors.inverse(`${directory}/${directory}.js`),
        );
        return bool;
    }
}

function jsBundleExists(directory, first) {
    let bool = fs.existsSync(`./${directory}/build/${directory}.bundle.js`);
    if (bool) {
        return bool;
    } else {
        if (!first) {
        console.error(
            colors.red.underline('JS ERROR! JS ERROR! JS ERROR! JS ERROR!')
        );
        console.error(
            colors.red(`Your HTML build for ${directory} will not compile because the following .js file does not exist: `),
            colors.inverse(`${directory}/build/${directory}.bundle.js`),
            colors.red(`You probably just added a challenger while Webpack and Gulp were running. If this is the case, just restart your webpack server.`),
        );
    }
        return bool;
    }
}

function filesExist(directory, first) {
    let js = jsExists(directory);
    let css = cssExists(directory);
    let bundle = jsBundleExists(directory, first);
    return js && css && bundle;
}
