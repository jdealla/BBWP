#!/usr/bin/env node
const path = require('path');
const colors = require('colors');
const build = require(path.join(__dirname, 'script_init'));
const bbaws = require(path.join(__dirname, 'script_codeCommit'));
const help = require(path.join(__dirname, 'script_help_log'));
const modules = require(path.join(__dirname, 'script_update_clientModules'));
const update = require(path.join(__dirname, 'script_update_BBWP'));
const promptHelpers = require(path.join(__dirname, 'prompt_helpers'));
const messages = promptHelpers.messages;

async function bbwp (args, status) {
    const mainCommand = args[0];
    const updateAvailable = status.updateAvailable;
    if (updateAvailable && mainCommand !== 'update'){
        console.log(messages.updateNudge(status));
    }
    if (!updateAvailable && mainCommand !== 'update') {
        console.log(messages.logBranch(status.branch, 'BBWP'));
        console.log(messages.changeBranchUpdateMsg);
    }
    if (mainCommand !== 'updatemodules'){
       await modules.checkForUpdateModules()
    }

    switch (mainCommand) {
        case 'init':
            if (updateAvailable) {
                colors.bold(colors.red('You must update before initializing a new test.\n'));
                break;
            }
            build.init(args);
            break;
        case 'update':
            update.updateBBWP(status);
            break;
        case 'searchrepos':
            bbaws.search(args[1], build.relink)
            break;
        case 'updatemodules':
            modules.updateModules();
            break;
        case 'relink':
            build.relink();
            break;
        case 'add':
            build.addNewVariantDir(args[1]);
            break;
        default:
            help();
            if (updateAvailable){
                console.log(messages.updateNudge(status));
            }
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
    let updateObj = await update.getStatus();;
    bbwp(process.argv.slice(mainIndex), updateObj);
}

app();