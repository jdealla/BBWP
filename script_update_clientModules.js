const fs = require('fs-extra');
const path = require('path');
const getDirectoriesArray = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
const git = require('simple-git');
const colors = require('colors');
const update = require(path.join(__dirname, 'script_update_BBWP'));


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

function isGitRepo(clientPath) {
    return fs.existsSync(path.join(__dirname, 'clients', clientPath, '.git'));
}


// Single Pull
async function pullLatest(repo, clientDirName, index, clientDirsLength){
    let isRepo = isGitRepo(clientDirName);
    if (isRepo) {
        var branch = await update.getBranch(repo);
    }
    return new Promise( (res, rej) => {
        if (!isRepo){
            console.log(messages.notRepo(clientDirName));
            res(null);
        } else if (!branch.onMaster) {
            console.log(messages.logBranch(branch.current, 'amex'));
            console.log(messages.changeBranchUpdateMsg);
            res(null);
        }
        if (branch.onMaster){
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
        }
    })
}

// Multiple Pull
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




// Single Check
function fetchLatest(repo) {
    return new Promise(function(resolve,reject){
        repo.silent(true).fetch( (err, msg) => {
            if (err) {
                resolve(err);
                return;
            } else {
                resolve(msg);
            }
        });
    })
}

function checkStatus(repo) {
    return new Promise(function(resolve,reject){
        repo.silent(true).status( (err, msg) => {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(msg);
            }
        });
    })
}

async function checkLatest(repo, clientDirName, index, clientDirsLength) {
    let isRepo = isGitRepo(clientDirName);

    if (isRepo) {
        var branch = await update.getBranch(repo);
        if (branch.onMaster) {
            await fetchLatest(repo);
            var status = await checkStatus(repo);
        }
    }

    return new Promise((res, rej) => {
        if (!isRepo) {
            res(null);
        } else if (!branch.onMaster) {
            console.log(messages.logBranch(branch.current, 'amex'));
            console.log(messages.changeBranchUpdateMsg);
            res(null);
        }
        if (branch.onMaster && isRepo) {
            if (status.behind > 0) {
                console.log(colors.bold(
                    colors.yellow('\nUpdate available for ') +
                    colors.magenta(clientDirName) +
                    colors.yellow(' modules\n')
                ));
                res(true);
            }
        } else {
            res(true)
        }
        res(true);
    })
}

// Multiple Check
async function checkForUpdateModules() {
    try {
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
                return checkLatest(repo, clientDirName, i, clientDirs.length);
            });
            let finalPromise = await Promise.all(promiseArr);
            return finalPromise
        }
    } catch (e) {
        console.log(messages.logError(e));
        return new Promise((res, rej) => {
            res(e);
        })
    }
}

module.exports = {updateModules, checkForUpdateModules};


