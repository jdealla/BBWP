const fs = require('fs-extra');
const prompt = require('prompt');
const path = require('path');
const replace = require('replace-in-file');
const colors = require('colors');
const bbaws = require(path.join(__dirname, 'script_codeCommit'));
const Git = require('simple-git');


const promptHelpers = require(path.join(__dirname, 'prompt_helpers'));
const messages = promptHelpers.messages;
const red = promptHelpers.red;
const cyan = promptHelpers.cyan;
const magenta = promptHelpers.magenta;

// Paths for Build Tool Templates
function getPaths(testInfo) {
    // Date for New Test Directory
    const date = new Date();
    const dateFormatted = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const clientPath = path.join(__dirname, 'clients', testInfo.client);
    const newTest = path.join('.', `${dateFormatted}-${testInfo.client}_${testInfo.testName}`);
    const repoName = `${dateFormatted}-${testInfo.client}_${testInfo.testName}`;
    const nodemodules = path.join(__dirname, 'node_modules');
    return {
        repoName,
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
            webpack: path.join(newTest, 'webpack*')
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
    const newVariantPathSCSS = path.join(paths.newTest, variantName, `${variantName}.scss`);

    // Copy JS and SCSS templates to new test directory
    await fs.copy(paths.variantTemplates.js, newVariantPathJS);
    return fs.copy(paths.variantTemplates.scss, newVariantPathSCSS);
}

// Gets Letters for Variant naming
function getVariantLetters(numberOfVariants) {
    let arr = ['control'];
    for (var i = 65; i < 65 + numberOfVariants; i++) {
        const letter = String.fromCharCode(i);
        arr.push(letter);
    }
    return arr;
}

// Sets Aliases for Client Modules in Test Build Configs
function buildWebpackReplaceArrays(paths, client) {
    // For All Clients
    const standardFrom = [/replacebabelpresetenv/g, /replacebabelpresetreact/g, /replacenodepath/g, 'replacebbmodules', 'replacemodules'];
    const standardTo = [paths.babelenv, paths.babelreact, paths.nodemodules, paths.bbmodules, paths.clientmodules];
    let obj = {};

    switch (client) {
        case 'amex':
            // Amex Specific
            const amexFrom = [
                'replacetestutilities',
                'replacequalificationoffer',
                'replacevariantnoffer',
            ];
            const amexTo = [
                path.join(paths.clientmodules, 'test_utilities.js'),
                path.join(paths.clientmodules, 'offers', 'qualification_offer.js'),
                path.join(paths.clientmodules, 'offers', 'variant_offer.js'),
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

    // Package.JSON options
    const packageOptions = {
        files: paths.replace.package,
        from: [/replacenodepath/g, 'replaceadd', 'replacetestname', 'replacedatecreated', 'replaceclient'],
        to: [paths.nodemodules, 'bar', testInfo.testName, testInfo.dateCreated, testInfo.client],
    };

    // Webpack options
    const webpackReplaceArrays = buildWebpackReplaceArrays(paths, testInfo.client);
    const webpackOptions = {
        files: paths.replace.webpack,
        from: webpackReplaceArrays.from,
        to: webpackReplaceArrays.to,
    };

    await replace(packageOptions)
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

// Relinking of Webpack Files
async function relink(package, newTest) {
    package = Boolean(package) ? package : require(path.resolve('.','package.json'));
    testInfo = {
        testName: package.BBConfig.testName,
        client: package.BBConfig.client,
        dateCreated: package.BBConfig.dateCreated
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
        cyan(`has been completed`)
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

module.exports = {init, relink};
