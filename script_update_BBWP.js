const path = require('path');
const git = require('simple-git');
const spawn = require('cross-spawn');
const currentPackage = require(path.resolve(__dirname, 'package.json'));

const colors = require('colors');
const promptHelpers = require(path.join(__dirname, 'prompt_helpers'));
const messages = promptHelpers.messages;


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

// Pulls latest BBWP git repo
function getLatestBBWPRepo() {
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

function getNewestPushedVersion(res) {
    let index = res.indexOf('version');
    let newStr = res.substr(index);
    let newVersionSubStr = newStr.substr(newStr.indexOf('version": "') + 11);
    let lastIndex = newVersionSubStr.indexOf('"');
    return newVersionSubStr.substr(0, lastIndex);
}

function isAvailable() {
    return new Promise(function (resolve, reject) {
        git(__dirname).diff(['package.json'],function (err, res) {
            if (err !== null) {
                return reject(err);
            }
            let downloadedVersion = currentPackage.version;
            let latestPushedVersion = getNewestPushedVersion(res);
            let obj = {
                'newVersion': Boolean(latestPushedVersion) ? latestPushedVersion : downloadedVersion,
                downloadedVersion,
                'updateAvailable': downloadedVersion !== latestPushedVersion && Boolean(latestPushedVersion)
            }
            resolve(obj);
        });
    });
}

async function updateBBWP(){
    console.log('\n' + messages.btname + messages.updateWelcome);
    let updateObj = await isAvailable();
    if (!updateObj.updateAvailable) {
        console.log(colors.bold(colors.red('\nThere is not an update available at this time. Goodbye.\n')));
        return null;
    } else {
        let latestRepo = await getLatestBBWPRepo();
    }
}

updateBBWP();

module.exports = {
    updateBBWP,
    isAvailable
};