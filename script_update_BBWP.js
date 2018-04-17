const path = require('path');
const git = require('simple-git');
const currentPackage = require(path.resolve(__dirname,'package.json'));


function getLatest(){
    console.log(currentPackage.version);
}

function getNewestPushedVersion(res){
    let index = res.indexOf('version');
    let newStr = res.substr(index);
    let newVersionSubStr = newStr.substr(newStr.indexOf('version": "') + 11);
    let lastIndex = newVersionSubStr.indexOf('"');
    return newVersionSubStr.substr(0, lastIndex);
}


function isAvailable(){
    return new Promise(function(resolve,reject){
        git(__dirname).diff(function(err, res){
            let downloadedVersion = currentPackage.version;
            let latestPushedVersion = getNewestPushedVersion(res);
            console.log(latestPushedVersion)
            if(err !== null){
                return reject(err);
            }
            let obj = {
                'newVersion': Boolean(latestPushedVersion) ? latestPushedVersion: downloadedVersion, 
                downloadedVersion, 
                'updateAvailable': downloadedVersion !== latestPushedVersion && Boolean(latestPushedVersion)
            }
            resolve(obj);
        });
    });
}


module.exports = { getLatest, isAvailable };