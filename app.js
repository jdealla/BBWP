#!/usr/bin/env node
const path = require('path');
const colors = require('colors');
const build = require(path.join(__dirname, 'script_init'));
const bbaws = require(path.join(__dirname, 'script_codeCommit'));
const help = require(path.join(__dirname, 'script_help_log'));
const updateModules = require(path.join(__dirname, 'script_update_clientModules'));
const update = require(path.join(__dirname, 'script_update_BBWP'));

const bbwp = (args, updateObj) => {

    const mainCommand = args[0];
    const updateAvailable = false;

    switch (mainCommand) {
        case 'init':
            if (updateAvailable) {
                // force update
                break;
            }
            build.init(args);
            break;
        case 'update':
            console.log(updateObj);
            break;
        case 'searchrepos':
            bbaws.search(args[1], build.relink)
            break;
        case 'updatemodules':
            updateModules();
            break;
        case 'relink':
            build.relink();
            break;
        case 'add':
            build.addNewVariantDir(args[1]);
            break;
        default:
            help();
            break;
    }
}

const mainIndex = process.argv.reduce((acc, arg, i) => {
    if (arg.indexOf('app.js') > -1 || arg.indexOf('bbwp') > -1) {
        acc = i + 1;
    }
    return acc;
}, 0);

async function app(){
    let updateObj = false;
    bbwp(process.argv.slice(mainIndex), updateObj);
}

app();