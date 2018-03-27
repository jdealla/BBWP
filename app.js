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
            search(args[3])
            break;
        default:
            break;
    }
}

bbwp(process.argv.slice(2))