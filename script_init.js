const fs = require('fs-extra');
const prompt = require('prompt');
const path = require('path');
const replace = require('replace-in-file');
const colors = require('colors');
const bbaws = require(path.join(__dirname, 'script_codeCommit'));
const Git = require('simple-git');
const getDirectoriesArray = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
const getPosition = function(a,b,c,d){for(c=c||0,d=d||0;0<c;){if(d=a.indexOf(b,d),0>d)return-1;--c,++d}return d-1};

const promptHelpers = require(path.join(__dirname, 'prompt_helpers'));
const messages = promptHelpers.messages;
const red = promptHelpers.red;
const cyan = promptHelpers.cyan;
const magenta = promptHelpers.magenta;

// Paths for Build Tool Templates
function getPaths(testInfo) {
    // Date for New Test Directory
    const date = new Date();
    // Padding for single digits
    const month = (date.getMonth() + 1).toString().length < 2 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    const day = (date.getDate() ).toString().length < 2 ? `0${date.getDate()}` : `${date.getDate()}`;
    //Formatted for repo name
    const dateFormatted = `${date.getFullYear()}-${month}-${day}`;
    const clientPath = path.join(__dirname, 'clients', testInfo.client);
    const newTest = path.join('.', `${dateFormatted}-${testInfo.client}_${testInfo.testName}`);
    const repoName = `${dateFormatted}-${testInfo.client}_${testInfo.testName}`;
    const nodemodules = path.join(__dirname, 'node_modules');
    return {
        repoName,
        dateCreated: dateFormatted,
        variantTemplates: {
            js: path.join(clientPath, 'variant_template', 'variantTemplate.js'),
            scss: path.join(clientPath, 'variant_template', 'variantTemplate.scss'),
        },
        // For absolute path replacement in files
        testTemplate: path.join(clientPath, 'test_template'),
        template: {
            webpack: path.join(clientPath, 'test_template', 'webpack.config.js'),
            webpackDev: path.join(clientPath, 'test_template', 'webpack.dev.js'),
            package: path.join(clientPath, 'test_template', 'package.json'),
        },
        bbmodules: path.join(__dirname, 'bb_modules'),
        clientmodules: path.join(clientPath, 'modules'),
        newTest,
        replace: {
            package: path.join(newTest, 'package.json'),
            webpack: path.join(newTest, 'webpack*'),
            scss: path.join(newTest, '*', '*.scss')
        },
        nodemodules,
        babelenv: path.join(nodemodules, '@babel', 'preset-env'),
        babelreact: path.join(nodemodules, '@babel', 'preset-react'),
    }
}

function doesNewTestExist(paths) {
    return fs.existsSync(paths.newTest);
}

function createTestDirectory(paths) {
    // Copy test template to new test directory
    return fs.copy(paths.testTemplate, paths.newTest);
}

async function createNewVariantDir(paths, letter) {
    // Create Paths
    const variantName = letter.toLowerCase() === 'control' ? 'control' : `variant${letter.toUpperCase()}`;
    const newVariantPathJS = path.join(paths.newTest, variantName, `${variantName}.js`);
    const newVariantPathSCSS = path.join(paths.newTest, variantName, variantName + '.scss');

    // Copy JS and SCSS templates to new test directory
    await fs.copy(paths.variantTemplates.js, newVariantPathJS);
    return fs.copy(paths.variantTemplates.scss, newVariantPathSCSS);
}

function isExistingTest(package){
    if (!package && !fs.existsSync(path.join('.', 'package.json'))){
        console.log(
            red('\nError: This directory is either not a BBWP initialized directory, or is missing a "package.json" file. Please check these issues and try again.\n')
            );
        return false;
    }
    package = Boolean(package) ? package : require(path.resolve('.','package.json'));
    if (!package.hasOwnProperty('BBConfig')) {
        console.log(
            red('\nError: This directory is either not a BBWP initialized directory, or is missing a "BBConfig" object in the "package.json" file. Please check these issues and try again.\n')
            );
        return false;
    } else {
        return true;
    }
}

// Add Variant to Existing Test
async function addNewVariantDir(args1) {
    console.log(`\n`+messages.btname + messages.addVariantWelcome);
    // Check if directory has package.json and if package.json has BBConfig
    if(!isExistingTest()){
        return null;
    };

    // Get Test Info
    let package = require(path.resolve('.','package.json'));

    let testInfo = {
        testName: package.BBConfig.testName,
        client: package.BBConfig.client,
        dateCreated: package.BBConfig.dateCreated
    };
    let paths = getPaths(testInfo);

    // Create Name for New Variant
    if (typeof args1 !== 'undefined'){
        // From Args
        let newLetter = args1.toUpperCase();
        var variantName = 'variant' + newLetter;
        if (fs.existsSync(path.join('.', variantName))) {
            console.log(
            red('\nError: The directory for ') + magenta(variantName) + red(' already exists. Please try again with another variant name or delete the existing directory for this variant\n')
            );
            return null;
        };
        
    } else {
        // Dynamically
        let dirArr = getDirectoriesArray('.');
        let variantDirLetterCharCodeArr = 
            dirArr.filter( dir => dir.indexOf('variant') > -1 && dir.indexOf('QA') === -1)
            .reduce( (acc, variantDir) => {
                let index = variantDir.indexOf('variant');
                let length = 'variant'.length;
                let letter = variantDir.substring(index + length);
                let charCode = letter.charCodeAt(0);
                acc.push(charCode);
                return acc;
            }, []);
        let newLetter = String.fromCharCode(variantDirLetterCharCodeArr[variantDirLetterCharCodeArr.length - 1] + 1);
        var variantName = 'variant' + newLetter;
    }
    // Create paths to new variant dir
    const newVariantPathJS = path.join('.', variantName, `${variantName}.js`);
    const newVariantPathSCSS = path.join('.', variantName, variantName + '.scss');

    // Copy JS and SCSS templates to new test directory
    await fs.copy(paths.variantTemplates.js, newVariantPathJS);
    await fs.copy(paths.variantTemplates.scss, newVariantPathSCSS);
    console.log(
        cyan('\nAddition of ') + magenta(variantName) + cyan(' to test ') + magenta(`${testInfo.client}_${testInfo.testName}`) + cyan(' has been') + colors.bold(colors.rainbow(' completed :)\n'))
    );
}

// Gets Letters for variant naming upon init
function getVariantLetters(numberOfVariants) {
    let arr = ['control'];
    for (var i = 65; i < 65 + numberOfVariants; i++) {
        const letter = String.fromCharCode(i);
        arr.push(letter);
    }
    return arr;
}

// Only used for Webpack and Package.json files
function pcPath(str){
    if (path.sep === "\\"){
        str = str.replace(/\\/g, '\\\\');
    }
    return str;
}

// Sets Aliases for Client Modules in test build configs
function buildWebpackReplaceArrays(paths, client) {
    // For All Clients
    const standardFrom = [/replacebabelpresetenv/g, /replacebabelpresetreact/g, /replacenodepath/g, 'replacebbmodules', 'replacemodules'];
    const standardTo = [pcPath(paths.babelenv), pcPath(paths.babelreact), pcPath(paths.nodemodules), pcPath(paths.bbmodules), pcPath(paths.clientmodules)];
    let obj = {};

    switch (client) {
        case 'amex':
            // Amex Specific
            const amexFrom = [
                'replacetestutilities',
                'replacequalificationoffer',
                'replacevariantoffer',
            ];
            const amexTo = [
                pcPath(path.join(paths.clientmodules, 'test_utilities.js')),
                pcPath(path.join(paths.clientmodules, 'offers', 'qualification_offer.js')),
                pcPath(path.join(paths.clientmodules, 'offers', 'variant_offer.js')),
            ];
            obj.from = [...standardFrom, ...amexFrom];
            obj.to = [...standardTo, ...amexTo];
            break;

        default:
            obj.from = [...standardFrom];
            obj.to = [...standardTo];
    }
    return obj;
}


// This function sets absolute paths in the new test build to run scripts and import modules from the directory of the build tool.
async function replacePathsInTest(testInfo, paths) {
    let dateCreated = testInfo.hasOwnProperty('dateCreated') ? testInfo.dateCreated : paths.dateCreated;
    // Package.JSON options
    const packageOptions = {
        files: paths.replace.package,
        from: [/replacenodepath/g, 'replacetestname', 'replacedatecreated', 'replaceclient'],
        to: [pcPath(paths.nodemodules), testInfo.testName, dateCreated, testInfo.client],
    };

    // Webpack options
    const webpackReplaceArrays = buildWebpackReplaceArrays(paths, testInfo.client);
    const webpackOptions = {
        files: paths.replace.webpack,
        from: webpackReplaceArrays.from,
        to: webpackReplaceArrays.to,
    };

    // SCSS options
    let testNameRegex = /[a-z]+[0-9]+/gi;
    // const SCSSOptions = {
    //     files: path.join(paths.newTest, '*', '*.scss'),
    //     from: ['bbtestnamereplace'],
    //     to: testNameRegex.exec(testInfo.testName)[0].toUpperCase(),
    // };

    await replace(packageOptions)
    // if (testInfo.client === 'amex') {
    //     await replace(SCSSOptions);  
    // }
    return replace(webpackOptions)
}

function argumentsAreValidToBuild(args) {
    return args.length > 3 && 
           typeof args[1] === 'string' && 
           typeof args[2] === 'string' && 
           !isNaN(parseInt(args[3]));
}

// Helper function to create the testInfo object for command line initialization with options
function getTestInfoFromArgs(args) {
    return {
        client: args[1],
        testName: args[2],
        numberOfVariants: parseInt(args[3])
    }
}

function initGit(paths) {
    return new Promise(function(resolve,reject){
        Git(paths.newTest)
        .init()
        .add('./*')
        .commit('Initial Build')
        .addRemote('origin', `https://git-codecommit.us-east-1.amazonaws.com/v1/repos/${paths.repoName}`)
        .push('origin', 'master')
        .exec(function(){
            resolve(true);
        });
    });  
}

// Prompt Options
prompt.message = '';
prompt.delimiter = '';

// Main Build Function
async function buildTest(testInfo) {
    const paths = getPaths(testInfo);
    // Array of strings used to create variant directories
    const variantLetters = getVariantLetters(testInfo.numberOfVariants);
    if (doesNewTestExist(paths)) {
        return console.log(red('\n' + 'Sorry, that test directory already exists. Please try again.' + '\n'));
    }
    // Create directory and copy templates into new test directory
    await createTestDirectory(paths)
    await Promise.all(variantLetters.map((letter) => createNewVariantDir(paths, letter)));
    // Replace Paths
    await replacePathsInTest(testInfo, paths);
    await bbaws.create(paths.repoName);
    await initGit(paths);
    // Done
    console.log(
        cyan('\n' + `Initialization of `) +
        magenta(`${testInfo.client}_${testInfo.testName} `) +
        cyan(`has been `) + colors.bold(colors.rainbow('completed :-)' + '\n'))
    );
}

// For Existing Tests
function getDateCreated(){
    let lastindex = path.resolve('.').lastIndexOf(path.sep) + 1;
    let dirname = path.resolve('.').substr(lastindex);
    let lastIndexDate = getPosition(dirname, '-', 3);
    return dirname.substr(0, lastIndexDate);
}

// Relinking of Webpack Files
async function relink(package, newTest) {
    console.log(`\n`+messages.btname + messages.relinkWelcome);
    if(!isExistingTest(package)){
        return null;
    };
    package = Boolean(package) ? package : require(path.resolve('.','package.json'));
    let testInfo = {
        testName: package.BBConfig.testName,
        client: package.BBConfig.client,
        dateCreated: getDateCreated()
    };

    const paths = getPaths(testInfo);
    paths.newTest = Boolean(newTest) ? path.join('.', newTest) : path.join('.');
    paths.replace = {
        package: path.join(paths.newTest, 'package.json'),
        webpack: path.join(paths.newTest, 'webpack*')
    },
    // Copy package.json and webpack files into cloned directory
    await fs.copy(paths.template.webpack, path.join(paths.newTest, 'webpack.config.js'), { replace: true });
    await fs.copy(paths.template.package, path.join(paths.newTest, 'package.json'), { replace: true });

    if (testInfo.client.toLowerCase() === 'amex') {
        await fs.copy(paths.template.webpackDev, path.join(paths.newTest, 'webpack.dev.js'), { replace: true });
    }

    // Replace Paths
    let finalPromise = replacePathsInTest(testInfo, paths);
    await finalPromise;
    // Done
    console.log(
        cyan('\n' + `Relinking of `) +
        magenta(`${testInfo.client}_${testInfo.testName} `) +
        cyan(`has been`) +
        colors.bold(colors.rainbow(' completed :)\n'))
    );
    return finalPromise;
}

// Last Prompt Step for Confirmation
function confirmTest(err, testInfo) {
    if (err) {
        return console.log(red("\n\n" + promptHelpers.errorHandler(err) + "\n" ));
    }
    let printedInfo = JSON.stringify(testInfo, null, 2);
    prompt.get({
        name: 'confirm',
        required: true,
        description: messages.correct + '\n' +
            cyan('\n' + `Client:        `) + magenta(testInfo.client) +
            cyan('\n' + `Test Name:     `) + magenta(testInfo.testName) +
            cyan('\n' + `Challengers:   `) + magenta(testInfo.numberOfVariants) +
            messages.confirm,
        before: (v) => v.toLowerCase()
    }, function (err, obj) {
        if (err) {
            return console.log(red("\n\n" + promptHelpers.errorHandler(err) + "\n" ));
        } else {
            obj.confirm === 'y' ? 
                buildTest(testInfo) :
                console.log(messages.notconfirmed);
        }
    });
}

// Main Execution of Repo Initialization
let init = (args) => {
    if (argumentsAreValidToBuild(args)) {
        // Build from user arguments
        let testInfo = getTestInfoFromArgs(args);
        console.log(messages.btname + messages.initWelcome);
        confirmTest(err = false, testInfo);
    } else {
        // First prompt Execution
        prompt.get([{
                name: 'client',
                required: true,
                type: 'string',
                message: messages.stringVal,
                description: messages.btname + messages.initWelcome + messages.client,
                before: (v) => v.toLowerCase()
            }, {
                name: 'testName',
                required: true,
                type: 'string',
                message: messages.stringVal,
                description: messages.testName,
                before: (v) => v.toLowerCase()
            },
            {
                name: 'numberOfVariants',
                required: true,
                type: 'integer',
                message: messages.intVal,
                description: messages.numberOfVariants
            },
        ], (err, testInfo) => {
            confirmTest(err, testInfo)
        });
    }
    prompt.start();
}

module.exports = {init, relink, addNewVariantDir};
