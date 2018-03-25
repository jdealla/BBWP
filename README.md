# Brooks Bell - American Express - Webpack Buildtool
This is a AMEX specific build tool that utilizes WebPack for module bundling.

### Version 0.9.42 (Beta)
* Currently, installation is manual after cloning the repo. Better integration with the existing BB Build Tool is being considered.
#### Known Issues
* There may be problems with dev-mode in USDA tests. Dev Mode support for USDA tests is on its way!
#### New Features this Version
* Added Sass support in both production and developer modes. To manually update previous tests, change your variant.css file extention to .scss.
#### New Features (0.9.41)
* Better integration with eApply tests.
* Added two new scripts for production and development compiling without minification.
* Added support for new Adobe Omniture Integrations script. Toggle can be found in the main configuration file (see below).
* Added an update script for in-test updates to the build tool.
* Added functions to the test_utilities module (getRootScope, getScopes, getScopeWithProperty, getPageName, verifyPageName).
* Qualification and Variant offer scripts optimized to use getRootScope and to catch thrown exceptions.
* Removed exclusions from the qualification script and added them to the main configuration file.
* HTML will be left in the build folders until further notice.
#### New Features (0.9.40)
* Resolved issue in variantOffer.js and variantTemplate.js that could throw an exception when running offers through Maxymiser.
* Developer build mode - bundles JavaScript and CSS files into a single JavaScript file for console use (see docs below). As of version 0.9.33 bundled code in the dev. build mode can be copied into the console and the offer code will be executed. The qualification script has no effect on the offer executed in the console.

## Installation
1. Clone this repo (somewhere NOT in a test directory) with the following command: ``git clone https://github.com/BrooksBellInc/amex_webpack_buildtool.git``
2. Set up a repo on our AWS CodeCommit server using the normal build tool steps.
3. Clear ALL contents of the newly created test directory.
4. Copy all contents from the 'amex_webpack_buildtool' directory into the test directory.

## Initialization
1. While in the test directory with the contents copied from 'amex_webpack_buildtool', run the following command in your terminal: ``npm install``.
2. Next, run the following command: ``npm run-script init`` and input the number of variants for your test.
3. In the top level directory, open the 'BB.AMEX.test.config.js' file, and modify the values of the following variables to match your Maxymiser campaign and your test specs:
    * BB.testName
    * BB.qualifyingPages (These are used for the qualification script. Variant modules allow for variant level page selection.)
    * BB.campaignElement
    * BB.exclusions ( _cardmember_: boolean, _prospect_: boolean, _eeps_: []:eepString)
    * BB.omnitureScript (:String with a value of either 'new' or 'old'. Default is 'old')
4. To begin compilation, run the following command: ``npm start``.

## Usage
### Qualification
Since our qualification scripts are almost always identical, the current qualification module, **_qualification/qualification.js_**, does not need to be edited unless one needs to run a custom function at the top of the qualification script, which can be done by adding code to the following functions:
* _fixFlicker_
* _runAtTop_

If a test calls for a more drastic change, the **_executeQualificationOffer_** function in **_bb_modules/offers/qualification_offer.js_** can be modified.
### Variant Code
Like the qualification script, the variant template is designed to account for the majority of our tests. It has a few editable options, a fail safe, and a main wrapper function.
* _variantName_ - type: String
* _qualifyingPages_ - type: [] of BB.PatternsKeys; removable.
* _selectorsToPollForOffer_ - type: [] of Css Selector Strings; removable.
* _variantSpecificFunctions_ - should be used to execute all variant specific functions.
* _failSafe_ - executed during each code offer and after each location change; removable.

If a test calls for a more drastic change, the **_executeVariantOffer_** function in **_bb_modules/offers/variant_offer.js_** can be modified.


## Commands
* ``npm start`` - starts Webpack and Gulp watchers to bundle JavaScript, compile CSS, and create HTML build files. Only directories with names including 'variant', 'challenger', 'control', and 'qualification' are watched (JavaScript and CSS files must match directory naming). Compile will occur on the initial execution, and then after only when files have changed (i.e. no compilation will happen when files are saved without changes).
* ``npm run verbose-prod`` - starts Webpack and Gulp watchers to bundle JavaScript, compile CSS, and create HTML build files, as above, but without minification.
* ``npm run dev`` - starts Webpack and Gulp watchers to bundle JavaScript and CSS files into a single JavaScript file for console use while in the build process. The bundled JavaScript can be found in **_dev/[variantName].bundle.js_**. The **_dev/temp_** folder contains an updated copy of the variant JS files, and is needed for CSS bundling.
* ``npm run verbose-dev`` - starts Webpack and Gulp watchers to bundle JavaScript and CSS files into a single JavaScript file for console use while in the build process, as above, but without minification.
* ``npm run init`` - prompts user for the desired number of variants, and creates variant directories with JS and CSS templates. Letters are used for naming. Directories and files can be renamed after initialization and will be watched if 'variant', 'challenger', 'control', or 'qualification' are used, and if JavaScript and CSS files match directory name.
* ``npm run add`` - prompts user for the letter of a new variant directory to be added. Webpack will need to be restarted if a variant is added while the compiler is running.
* ``npm run update`` - updates the following directories and their contents with the latest changes to the build tool: **_templates, scripts, bb_modules, gulpFile.js, package.json, README.md, webpack.config.js, webpack.dev.js_**.

## Utility Modules
One of the benefits of transitioning over to webpack is being able to create centralized modules containing reusable objects and functions. There are a few utility modules already included in the **_bb_modules_** directory. To use them in variants, just import them in your variant code using the following format: ``import { objectToImport } from '../bb_modules/moduleContainingObjectToImport.js';``. Please keep adding to these modules when you see the need to do so.
