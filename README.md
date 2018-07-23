# Brooks Bell Webpack Buildtool (BBWP)
A new build tool that utilizes WebPack for module bundling.

### Version 1.0.0
* The AMEX team at Brooks Bell has been running a slightly modified version of the current installation for over three months, so most of the major issues have been resolved. As more teams use it, there will likely be more issues found and more use cases that present feature requests.

### Known Issues
* All known issues for the current version will be listed here.

## Installation

### Notes
* Since we've migrated to Cloud9, all installations of BBWP will be handled by tech leads or managers, so, for most users, there's no need to read this section! In any case, here is how to install BBWP on a new Cloud9 environment.
* In order to install BBWP, you will need access to the Brooks Bell GitHub account. Please see a tech lead or a manager if you need to link your personal GitHub account to the Brooks Bell account.

### Node Version
* BBWP requires a Node version of 8.11.1 or later. Cloud9 environments come with Node Version Manager "nvm" installed already. You can check which version of Node is currently being utilized by running ``node -v``.
* In case you need to, updating Node using nvm is simple by executing these three commands:
1. ``nvm install 8.11.1``
2. ``nvm use 8.11.1``
3. ``nvm alias default 8.11.1``

### Installation Steps
1. In the home directory of a Cloud9 environment, run ``git clone https://github.com/BrooksBellInc/bbwp.git``.
2. Navigate into the newly created ``BBWP`` directory and run ``npm link``.
3. (Optional) If the installation is for a particular client, open the ``package.json`` and add a ``config`` to the top level object. This object should have a ``client`` property, whose value should be the name of the client for that particular installation:  
```javascript 
// package.json in the BBWP directory

{
    "name": "bbwp_brooks_bell_webpack_buildtool",
     "version": "1.0.0",
    // rest of the normal package.json contents
    "config": {
        "client": "happybooks"
    }
}
```

### BBWP Commands

* ``init [client] [testName] [numberOfVariants]`` - initializes a new test build in the current directory. Each new test build includes a control directory in addition to the number of variants specified.

* ``add [newVariantLetter]`` - adds a new variant to an existing test. The new variant letter can be passed in or created dynamically.

* ``update`` - updates main BBWP directory and reinstalls node modules on version updates.

* ``updatemodules`` - updates client modules (located in the clients directory within the build tool parent directory).

* ``relink`` - builds new Webpack and package.js configuration files in the current working directory to reestablish links to the modules directories. (Note: this is not likely needed due to the static configuration of the Cloud9 environments)

### Commands within Test Builds

* ``npm start`` - starts Webpack and Gulp watchers to bundle JavaScript, compile CSS, and create HTML build files. Only directories with names including 'variant', 'challenger', 'control', and 'qualification' are watched (JavaScript and SCSS files must match directory naming). Compile will occur on the initial execution, and then after only when files have changed (i.e. no compilation will happen when files are saved without changes).

* ``npm run verbose-prod`` - starts Webpack and Gulp watchers to bundle JavaScript, compile CSS, and create HTML build files, as above, but without minification.

* ``npm run dev`` - starts Webpack and Gulp watchers to bundle JavaScipt and CSS files into one JavaScript file for console use. Only directories with names including 'variant', 'challenger', 'control', and 'qualification' are watched (JavaScript and SCSS files must match directory naming).

* ``npm run verbose-dev`` - starts Webpack and Gulp watchers to bundle JavaScipt and CSS files into one JavaScript file for console use, as above, but without minification.

## Usage

One of the benefits of transitioning to Webpack is being able to create centralized modules containing reusable code. Test builds should utilize both the existing modules and test specific modules (see below) .

### Existing Modules

There are a utility modules already included in the **_bbmodules_** and the client modules directories. The paths to these directories are already aliased for Webpack use. The top level alias for the **_bbmodules_** directory in any build is ``bbmodules``, and the top level directory for any client modules is ``[client]modules``. ES6 exporting and importing is supported.

Here is an example of how to use existing modules. Assume the test is for Happy Books and that the BBWP directory contains the following directories:

_`bbmodules`_
* `utilities.js`
* `strings.js`
* `objects.js`

_`happybooks modules`_
* `utilities.js`
* `api.js`

Here is how the contents of these files would be used for a test build:

```javascript
// bbmodules -> utilities.js

export let pollingFunction = (selector) => {
    console.log(`I'm polling for ${selector}!`);
    return new Promise( (res, rej) => {
        // code to poll for the selector
    });
};

// happybooks modules -> api.js

export let getAllHappyBooks = () => {
    return fetch('http://happybooks.com/api/v1/allBooks')
            .then( res => res.json())
            .then( books => {
                console.log('Got all the books!');
                return books;
            });
};

// 2018-07-03-happybooks-search_results_test_3 -> variantA -> variantA.js

import { pollingFunction } from 'bbmodules/utilities';
import { getAllHappyBooks } from 'happybooksmodules/api';

let variantLogic = () => {
    pollingFunction('.itemToPollFor')
    .then( () => {
        getAllHappyBooks().then( books => {
            // handle the response
        });
    });
}

variantLogic();

```

### Test Specific Modules

Some tests call for variants with shared functionality or templates that are only useful for that particular test. This scenario is a use case for test specific modules, i.e. a directory in the test directory that contains these files.

Here's how our Happy Books test directory looks after initialization:

_`2018-07-03-happybooks-search_results_test_3`_

* `control`
* `variantA`
* `variantB`
* `BB.happybooks.test.config`
* `gulpFile.js`
* `package.json`
* `webpack.config.js`
* `webpack.dev.js`

Let's assume that each variant of this test is going to call for the same hero banner to be appended to the DOM. Since it makes more since to have only one copy of the template as a single source of truth, let's create a `testmodules` directory for this specific test and a `heroBanner.js` file for our code.

_`2018-07-03-happybooks-search_results_test_3`_

* `control`
* `variantA`
* `variantB`
* `BB.happybooks.test.config`
* `gulpFile.js`
* `package.json`
* `webpack.config.js`
* `webpack.dev.js`
* `testmodules`
    * `heroBanner.js`

After we create our template and logic, we can then export the function that appends the template to the DOM, and import it into our variants for use in our test build. We'll use the response from the API call we imported from the client modules to populate the title of the book we'll be featuring.

```javascript
// testmodules -> heroBanner.js

let heroTemplate = (book) => `
<div class="happyBooksHero">
    <h1>Featured Book: ${book.title} by ${book.author}</h1>
</div>
`;

export let appendHeroTemplate = (book) => {
    jQuery('.section.heroContainer').append(heroTemplate(book));
};

// 2018-07-03-happybooks-search_results_test_3 -> variantA -> variantA.js

import { pollingFunction } from 'bbmodules/utilities';
import { getAllHappyBooks } from 'happybooksmodules/api';
import { appendHeroTemplate } from './testmodules/heroBanner.js';

let variantLogic = () => {
    pollingFunction('.itemToPollFor')
    .then( () => {
        getAllHappyBooks().then( books => {
            let featuredBook = books[0];
            appendHeroTemplate(featuredBook);
        });
    });
}

variantLogic();

```
Note that while the top level directory for _bbmodules_ and the client modules (i.e. _happybooksmodules_) are aliased, any shared modules that you create will require a relative path in the import statement.



