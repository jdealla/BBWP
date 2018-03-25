const fs = require('fs-extra');
const prompt = require('prompt');
const path = require('path');
const replace = require('replace-in-file');

// Dev Only
const testInfo = {
    client: 'barnes',
    testName: 'BB123',
    numberOfVariants: 4
}

// Paths for Build Tool Templates
function getPaths(testInfo) {
    // Date for New Test Directory
    const date = new Date();
    const dateFormatted = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const clientPath = path.join(__dirname, 'clients', testInfo.client);
    const newTest = path.join('.', `${dateFormatted}-${testInfo.client}_${testInfo.testName}`);
    const nodemodules = path.join(__dirname, 'node_modules');
    return {
        variantTemplates: {
            js: path.join(clientPath, 'variant_template', 'variantTemplate.js'),
            scss: path.join(clientPath, 'variant_template', 'variantTemplate.scss'),
        },
        // For absolute path replacement in files
        testTemplate: path.join(clientPath, 'test_template'),
        bbmodules: path.join(__dirname, 'bb_modules'),
        clientmodules: path.join(clientPath, 'modules'),
        newTest,
        replace: { 
            package: path.join(newTest, 'package.json'),
            webpack: path.join(newTest, 'webpack*')
        },
        nodemodules,
        babelenv:  path.join(nodemodules, '@babel', 'preset-env'),
        babelreact: path.join(nodemodules, '@babel', 'preset-react'),
    }
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

function getVariantLetters(numberOfVariants) {
    let arr = ['control'];
    for (var i = 65; i < 65 + numberOfVariants; i++) {
        const letter = String.fromCharCode(i);
        arr.push(letter);
    }
    return arr;
}

function buildWebpackReplaceArrays(client) {
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

async function replacePathsInTest(testInfo, paths){
    // This function sets absolute paths in the new test build to run scripts and import modules from the directory of the build tool.

    // Package.JSON options
    const packageOptions = {
        files: paths.replace.package,
        from: [/replacenodepath/g, 'replaceadd', 'replaceinit'],
        to: [paths.nodemodules, 'bar', 'test'],
    };

    // Webpack options
    const webpackReplaceArrays = buildWebpackReplaceArrays(testInfo.client);
    const webpackOptions = {
        files: paths.replace.webpack,
        from: webpackReplaceArrays.from,
        to: webpackReplaceArrays.to,
    };

    await replace(packageOptions)
    return replace(webpackOptions)
}

async function buildTest(testInfo, paths) {
    // Array of strings used to create variant directories
    const variantLetters = getVariantLetters(testInfo.numberOfVariants);

    // Create directory and copy templates into new test directory
    await createTestDirectory(paths)
    await Promise.all(variantLetters.map( (letter) => createNewVariantDir(paths, letter) ));
    // Replace Paths
    await replacePathsInTest(testInfo, paths);

    console.log(`Initialization of ${testInfo.client}_${testInfo.testName} completed`);
}

// Main Execution
const paths = getPaths(testInfo);

buildTest(testInfo, paths);


