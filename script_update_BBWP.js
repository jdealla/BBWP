const path = require('path');
const git = require('simple-git');
const spawn = require('cross-spawn');
const currentPackage = require(path.resolve(__dirname, 'package.json'));

const colors = require('colors');
const promptHelpers = require(path.join(__dirname, 'prompt_helpers'));
const messages = promptHelpers.messages;


// For NPM
// Child process constructor that returns a promise
function ChildPromise(command, optionsArr){
    return new Promise(function(resolve,reject){
        const child = spawn(command, optionsArr, { stdio: 'inherit' });
        child.on('error', function(err) {
            reject(err);
        });
        child.on('exit', function(code) {
            if (code === 0) {
                resolve(code);
            } else {
                reject(code);
            }
        });
        child.on('close', function(code) {
            if (code === 0) {
                resolve(code);
            } else {
                reject(code);
            }
        });
        
    });
}

// Updates NPM packages, returns a promise
function updatePackages() {
    process.chdir(__dirname);
    return ChildPromise('npm', ['install']);
}

// For Git Repo
// Fetches latest BBWP git repo
function fetchLatest() {
    return new Promise(function(resolve,reject){
        const repo = git(__dirname);
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

// Fetches latest BBWP git repo
function checkLog() {
    return new Promise(function(resolve,reject){
        const repo = git(__dirname);
        repo.silent(true).log(['origin/update'], (err, msg) => {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(msg);
            }
        });
    })
}

// Fetches latest BBWP git repo
function checkStatus() {
    return new Promise(function(resolve,reject){
        const repo = git(__dirname);
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

function stashChanges() {
    return new Promise(function(resolve,reject){
        const repo = git(__dirname);
        repo.silent(true).stash( (err, msg) => {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(msg);
            }
        });
    })
}

// Pulls latest BBWP git repo
function pullLatest() {
    return new Promise(function(resolve,reject){
        const repo = git(__dirname);
        repo.silent(true).pull( (err, msg) => {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(msg);
            }
        });
    })
}

function printPullMessage(msg) {
    console.log(colors.bold(
        colors.magenta('BBWP change summary: \n\n') +
        colors.green('\t' + 'Changes: ' + msg.summary.changes + '\n') +
        colors.green('\t' + 'Insertions: ' + msg.summary.insertions + '\n') +
        colors.green('\t' + 'Deletions: ' + msg.summary.deletions)
    ));
}

function getNewestPushedVersionNumber(res) {
    if (res.toLowerCase().indexOf('version') === -1) {
        return false;
    } else {
        let versionRegex = /[\d]+\.[\d]+.[\d]+/gi;
        return versionRegex.exec(res)[0];
    }
}

function getStatusObject(res) {
    let newestPushedVersion = getNewestPushedVersionNumber(res);
    let downloadedVersion = currentPackage.version;
    return {
        current: downloadedVersion, 
        pushed: newestPushedVersion, 
        updateAvailable: !newestPushedVersion ? false : downloadedVersion.trim() !== newestPushedVersion
    }
}

async function updateBBWP (status){
    console.log('\n' + messages.btname + messages.updateWelcome);
    if (status.updateAvailable) {
        console.log(messages.updateStarting);
        await stashChanges();

        let pullMsg = await pullLatest();
        printPullMessage(pullMsg);

        console.log(messages.installPackages);
        await updatePackages();

        console.log(messages.updateComplete);
    } else {
        let status = await checkStatus();
        if (status.behind > 0){
            console.log(messages.updateStarting);
            await stashChanges();
            let pullMsg = await pullLatest();
            printPullMessage(pullMsg);
            console.log(messages.updateComplete);
        } else {
            console.log(colors.bold(colors.magenta('\nYour BBWP is already up to date.\n')));;
        }
    }
}

async function getStatus(){
    await fetchLatest();
    let log = await checkLog();
    let status = getStatusObject(log.latest.message)
    return status;
}

module.exports = {
    getStatus,
    updateBBWP
};