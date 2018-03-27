const path = require('path');
const init = require(path.join(__dirname, 'script_init'));
const search = require(path.join(__dirname, 'script_codeCommit'));

function bbwp(args){

    const mainCommand = args[0];

    switch (mainCommand) {
        case 'init':
            init(args);
            break;
        case 'searchrepos':
            search(args[1])
            break;
        default:
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