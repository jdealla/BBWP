const fs = require('fs-extra');
const path = require('path');
const getDirectoriesArray = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
const git = require('simple-git');
const colors = require('colors');

const promptHelpers = require(path.join(__dirname, 'prompt_helpers'));
const messages = promptHelpers.messages;

function printComplete(clientDirsLength){
        console.log('\n' + colors.bold(
            colors.cyan('Update of ') +
            colors.magenta('client modules ') +
            colors.cyan('has been ') +
            colors.rainbow('completed :)')
        )  + '\n')
}

function doesClientsExist() {
    return fs.existsSync(path.join(__dirname, 'clients'));
}

function pullLatest(repo, clientDirName, index, clientDirsLength){
    return new Promise( (res, rej) => {
        repo.silent(true).pull( (err, msg) => {
            if (err){
                console.log(colors.bold(colors.red(`\nError in `) + colors.magenta(`${clientDirName}`) + colors.red(' modules:\n')));
                err = err.replace('Aborting', '').trim();
                console.log(colors.bold(colors.red(err.substr(err.toLowerCase().indexOf('error') + 7))));
                res(null);
            }
            console.log(colors.bold(
                colors.cyan('\nGit change summary for ') +
                colors.magenta(clientDirName) +
                colors.cyan(' modules:\n\n') +
                colors.green('\t' + 'Changes: ' + msg.summary.changes + '\n') +
                colors.green('\t' + 'Insertions: ' + msg.summary.insertions + '\n') +
                colors.green('\t' + 'Deletions: ' + msg.summary.deletions)
            ));
            res(true);
        });
    })
}

async function updateModules() {
    try {
        console.log(messages.btname + messages.moduleUpdateWelcome);

        if (!doesClientsExist()) {
            console.log(
                colors.bold(colors.red('\nError: Top level directory for client modules must exist and be named "clients". Please add or rename this directory and try again\n'))
            );
            return null;
        }

        const clientsPath = path.join(__dirname, 'clients');
        const clientDirs = getDirectoriesArray(clientsPath);

        if (clientDirs.length < 1) {
            console.log(
                colors.bold(colors.red('\nError: Top level directory for client modules must have at least one subdirectory and be named properly. Please add or rename one or more of these directories and try again\n'))
            );
        } else {

            let promiseArr = clientDirs.map((clientDirName, i) => {
                let pathToClientModule = path.join(clientsPath, clientDirName);
                let repo = git(pathToClientModule);
                return pullLatest(repo, clientDirName, i, clientDirs.length);
            });
            await Promise.all(promiseArr);
            printComplete(clientDirs.length);
        }
    } catch (e) {
        console.log(messages.logError(e));
    }
}

module.exports = updateModules;


