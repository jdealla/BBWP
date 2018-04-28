const colors = require('colors');

function help(){
    // Main Prompt
    console.log(colors.bold(colors.cyan('\n\nBrooks Bell WebPack Build Tool')));
    console.log(colors.bold(colors.cyan('\nPlease enter one of the following commands:')));

    // init
    console.log(
        colors.bold(
            colors.magenta('\n\tinit [client] [testName] [numberOfVariants] ') + 
            colors.grey('- initializes a new test build in the current directory.')
        )
    );

    // searchrepos
    console.log(
        colors.bold(
            colors.magenta('\n\tsearchrepos [repoName]') + 
            colors.grey(' \t- searches AWS for a repo and clones it locally if found.\n')
        )
    );

    // relink
    console.log(
        colors.bold(
            colors.magenta('\trelink') + 
            colors.grey('\t- builds new Webpack and package.js configuration files in the\n\t\tcurrent working directory to reestablish links to the modules directories.\n')
        )
    );

    // add
    console.log(
        colors.bold(
            colors.magenta('\tadd [newVariantLetter]') + 
            colors.grey(' \t- adds a new variant to an existing test.\n\t\tThe new variant letter can be passed in or created dynamically.\n')
        )
    );

    // update
    console.log(
        colors.bold(
            colors.magenta('\tupdate ') + 
            colors.grey('- updates main BBWP directory\n\t\tand reinstalls node modules on version updates.\n')
        )
    );

    // updatemodules
    console.log(
        colors.bold(
            colors.magenta('\tupdatemodules ') + 
            colors.grey('- updates client modules (located in the clients\n\t\tdirectory within the build tool parent directory).\n')
        )
    );
}

module.exports = help;