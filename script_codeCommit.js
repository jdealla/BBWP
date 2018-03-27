const aws = require('aws-sdk');
const prompt = require('prompt');
const colors = require('colors');
const path = require('path');
const git = require('simple-git')();
const fs = require('fs-extra');


const promptHelpers = require(path.join(__dirname, 'prompt_helpers'));
const messages = promptHelpers.messages;
const red = promptHelpers.red;
const cyan = promptHelpers.cyan;
const magenta = promptHelpers.magenta;
const errorHandler = promptHelpers.errorHandler;

const awsConfig = new aws.Config({
    region: 'us-east-1'
});

const codecommit = new aws.CodeCommit(awsConfig);

function doesNewTestExist(name) {
    let pathToTest = path.join('.', name);
    return fs.existsSync(pathToTest);
}

// Prompt Options
prompt.message = '';
prompt.delimiter = '';

let clone = (name) => {
    const params = {
        repositoryName: name
    };

    let cloneNewRepo = (err, data) => {
        if (err) {
            console.log(err, err.stack); // an error occurred
        } else {
            var metadata = data.repositoryMetadata;
            console.log(cyan('\nBeginning cloning of ') + magenta(name));
            git.clone(metadata.cloneUrlHttp, metadata.repositoryName).exec( () => {
                console.log(cyan('\nCloning of ') + magenta(name) + cyan(' has been ') + colors.bold(colors.rainbow('completed :-)\n')))
            })
            
            
        }
    };

    codecommit.getRepository(params, cloneNewRepo);
};

let search = (searchTerm) => {
    console.log(messages.btname + messages.searchWelcome);

    const repoFinder = (err, data) => {
        if (err) {
            console.log(err, err.stack); // an error occurred
        } else {
            const repoNames = [];
            let repoName;
            for (let i = 0; i < data.repositories.length; i++) {
                repoName = data.repositories[i].repositoryName;
                if (searchTerm) {
                    if (repoName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
                        repoNames.push(repoName);
                    }
                } else {
                    repoNames.push(repoName);
                }
            }
            if (repoNames.length === 0) {
                console.log("\n" + messages.searchNoMatch + "\n\n" + magenta("\t" + searchTerm) + "\n\n" + red("Cancelling search. Please try again.") + "\n");
            } else if (repoNames.length === 1) {
                const promptSchema = {
                    properties: {
                        clone: {
                            name: 'clone',
                            description: messages.clone +"\n\n\t"+ colors.underline(magenta(repoNames[0])) + messages.confirm,
                            pattern: /^[yn]$/,
                            type: 'string',
                            message: red('Invalid input. Please confirm with "y" or "n".'),
                            required: true
                        }
                    }
                };

                prompt.start();
                prompt.get(promptSchema, (err, result) => {
                    if (err) {
                        let errMessage = errorHandler(err);
                        console.log("\n\n" + red(errMessage) + "\n");
                    } else {
                        if (result.clone === 'y') {
                            let name = repoNames[0];
                            if (doesNewTestExist(name)){
                                console.log(red('\nCanceling operation. Repo ') + magenta(colors.underline(name)) + red(' already exists locally\n'));
                            } else {
                                clone(name);
                            }
                            
                        } else {
                            console.log(messages.searchNotCloned + "\n\t" + colors.underline(magenta(repoNames[0])) + red('\n\nGoodbye.\n'));
                        }
                    }
                });
            } else {
                console.log(repoNames);
            }
        }
    };

    codecommit.listRepositories({}, repoFinder);
};

module.exports = search;