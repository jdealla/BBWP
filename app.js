#!/usr/bin/env node
const path = require('path');
const colors = require('colors');
const build = require(path.join(__dirname, 'script_init'));
const bbaws = require(path.join(__dirname, 'script_codeCommit'));
const help = require(path.join(__dirname, 'script_help_log'));
const updateModules = require(path.join(__dirname, 'script_update_clientModules'));

function bbwp(args){

    const mainCommand = args[0];

    switch (mainCommand) {
        case 'init':
            build.init(args);
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


let mainIndex = process.argv.reduce((acc, arg, i) => {
    if (arg.indexOf('bbwp') > -1) {
        acc = i + 1;
    }
    return acc;
}, 0);

bbwp(process.argv.slice(mainIndex));