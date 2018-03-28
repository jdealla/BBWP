const path = require('path');
const colors = require('colors');
const init = require(path.join(__dirname, 'script_init'));
const bbaws = require(path.join(__dirname, 'script_codeCommit'));

function bbwp(args){

    const mainCommand = args[0];

    switch (mainCommand) {
        case 'init':
            init(args);
            break;
        case 'searchrepos':
            bbaws.search(args[1])
            break;
        default:
            console.log(colors.bold(colors.cyan('\n\nBrooks Bell WebPack Build Tool')))
            console.log(colors.bold(colors.cyan('\nPlease enter one of the following commands:')))
            console.log(colors.bold(colors.magenta('\n\tinit [client] [testName] [numberOfVariants] ') + colors.grey('- initializes a new test build in the current directory.')));
            console.log(colors.bold(colors.magenta('\n\tsearchrepos [repoName]') + colors.grey(' - searches AWS for a repo and clones it locally if found.\n')));
            break;
    }
}


let mainIndex = process.argv.reduce((acc, arg, i) => {
    if (arg.indexOf('app.js') > -1) {
        acc = i + 1;
    }
    return acc;
}, 0);

bbwp(process.argv.slice(mainIndex));