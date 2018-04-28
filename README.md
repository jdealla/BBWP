# Brooks Bell  Webpack Buildtool
A new build tool that utilizes WebPack for module bundling.

### Version 0.1.1 (Alpha)
* Currently, installation is manual after cloning the repo. Better integration with the existing BB Build Tool is being considered.
#### Known Issues
* There may be problems with dev-mode in USDA tests. Dev Mode support for USDA tests is on its way!
#### New Features this Version
* Added Sass support in both production and developer modes. To manually update previous tests, change your variant.css file extention to .scss.
#### New Features (0.1.1)
* Better integration with eApply tests.


## Installation
1. Clone this repo (somewhere NOT in a test directory) with the following command: ``git clone 

## Initialization
1. While in the test directory with the contents copied from 'amex_webpack_buildtool', run the following command in your terminal: ``npm install``.


## Commands within Test Builds
* ``npm start`` - starts Webpack and Gulp watchers to bundle JavaScript, compile CSS, and create HTML build files. Only directories with names including 'variant', 'challenger', 'control', and 'qualification' are watched (JavaScript and CSS files must match directory naming). Compile will occur on the initial execution, and then after only when files have changed (i.e. no compilation will happen when files are saved without changes).
* ``npm run verbose-prod`` - starts Webpack and Gulp watchers to bundle JavaScript, compile CSS, and create HTML build files, as above, but without minification.

## Utility Modules
One of the benefits of transitioning over to webpack is being able to create centralized modules containing reusable objects and functions. There are a few utility modules already included in the **_bb_modules_** directory. To use them in variants, just import them in your variant code using the following format: ``import { objectToImport } from '../bb_modules/moduleContainingObjectToImport.js';``. Please keep adding to these modules when you see the need to do so.
