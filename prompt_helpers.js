// Prompt Color Functions
const colors = require('colors');

function green(msg) {
    return colors.bold(colors.green(msg));
}

function cyan(msg) {
    return colors.bold(colors.cyan(msg));
}

function magenta(msg) {
    return colors.bold(colors.magenta(msg));
}

function blue(msg) {
    return colors.bold(colors.blue(msg));
}

function red(msg) {
    return colors.bold(colors.red(msg));
}

function yellow(msg) {
    return colors.bold(colors.yellow(msg));
}

// Prompt Messages
const messages = {
    btname: colors.underline(cyan('Brooks Bell Webpack Build Tool')),
    error: red("\n\n" + 'Cancelling Initialization' + '\n'),
    stringVal: red('Invalid input. Please enter a string' + '\n'),
    intVal: red('Invalid input. Please enter an integer' + '\n'),
    initWelcome: cyan("\n" + 'Repo Initialization'),
    moduleUpdateWelcome: cyan("\n" + 'Update Client Modules'),
    addVariantWelcome: cyan("\n" + 'Add New Variant'),
    searchWelcome: cyan("\n" + 'Repo Search'),
    updateWelcome: cyan("\n" + 'BBWP Update'),
    relinkWelcome: cyan("\n" + 'Relink Node Modules'),
    searchNoMatch: cyan('No repos found for the following search:'),
    searchNotCloned: red("\n\n" + "Cancelling cloning of the following repository:\n"),
    client: green("\n\n" + 'Enter the client name'),
    testName: green("Enter your test's name"),
    numberOfVariants: green('Enter the number of challengers for your test. You can always add more later.'),
    correct: "\n" + cyan('Is the following information correct?'),
    confirm: green("\n\n" + `Please confirm with "y" or "n"`),
    notconfirmed: red('\n' + "You didn't confirm with a 'y'. Cancelling operation. Goodbye." + '\n'),
    clone: cyan("\n" + 'Do you want to clone the following repository?'),
    updateStarting: cyan("\n" + 'Starting update of ') + magenta('BBWP ') + '\n',
    installPackages: cyan("\n" + 'Installing node modules'),
    updateComplete: cyan("\n" + 'Update of ') + magenta('BBWP ') + cyan("has been") + colors.bold(colors.rainbow(' completed :)')) + '\n',
    alreadyExists: '\n' + 'Sorry, that test directory already exists. Please try again.' + '\n',
    changeBranchUpdateMsg: yellow('Please checkout ') + magenta('master') + yellow(' in order to check for updates.\n'),
    missingPackage: red('\nError: This directory is either not a BBWP initialized directory, or is missing a "package.json" file. Please check these issues and try again.\n'),
    missingConfig:  red('\nError: This directory is either not a BBWP initialized directory, or is missing a "BBConfig" object in the "package.json" file. Please check these issues and try again.\n'),
    clientDoesntExist: (clientName) => {
        return red('\nClient ') + magenta(clientName) + red(' does not exist. Please try again.\n');
    },
    updateNudge: (status) => {
        return red(`\n=======================================================\n\nIMPORTANT UPDATE AVAILABLE \nUpdate to version ${status.pushed} by running the following command: `) 
        + colors.bold((colors.blue('\n\n\tbbwp update\n\n'))) 
        + red(`=======================================================\n`)
    },
    initComplete: (testInfo) => {
        return  cyan('\n' + `Initialization of `) + 
                magenta(`${testInfo.client}_${testInfo.testName} `) + 
                cyan(`has been `) + 
                colors.bold(colors.rainbow('completed :-)' + '\n'))
    },
    relinkComplete: (testInfo) => {
        return  cyan('\n' + `Relinking of `) + 
                magenta(`${testInfo.client}_${testInfo.testName} `) +
                cyan(`has been`) + 
                colors.bold(colors.rainbow(' completed :)\n'));
    },
    logError: (err) =>  red(`Error: ${err}`),
    logBranch: (branch, dir) => {
        return  yellow(`\nWarning: You are currently on the `) + 
                magenta(branch) +  yellow(' branch of ') + 
                magenta(dir) + 
                yellow('.');
    },
    notRepo: (client) => {
        return  red(`\nThe directory `) + 
                magenta('clients/' + client) + 
                red(' is not a git repo. Update for this module cancelled.');
    },
}

const errorHandler = (err) => err.message.toLowerCase().indexOf('canceled') > -1 ? 'Operation canceled. Goodbye' : 'There has been an error with the following message: ' + err.message; 

const promptHelpers = {
    green,
    cyan,
    magenta,
    blue,
    red,
    messages,
    errorHandler
}



module.exports = promptHelpers;