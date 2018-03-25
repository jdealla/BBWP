import { BB } from 'config';

import {
    verifyURL,
    isQualified,
    stopWhenAfter,
    isAngularReady,
    getQueryParam,
    getRootScope,
    addAngularEventListener,
} from 'test_utilities';

function executeVariantOffer(variantFunction, options) {
    if (!window.BBtests || !window.BBtests[BB.testName]) {
        if (!window.BBtests){window.BBtests = {[BB.testName]: true};} else {window.BBtests[BB.testName] = true;}

        // Variable Assignments
        BB.qualifyingPages = Boolean(options.qualifyingPages) === true ? options.qualifyingPages: BB.qualifyingPages;
        BB.selectorsToPollFor = Boolean(options.selectorsToPollForOffer) === true ? options.selectorsToPollForOffer : ['html'];

        // Console logging defined here to include variant name
        function bbiDebug(msg) {
            if (window.location.search.indexOf('mmcore.un=qa') > -1 || document.cookie.indexOf('bbidebug=verbose') > -1 || sessionStorage.bbidebug === 'true') {
                console.log(`%c${BB.testName}-${options.variantName}: ${msg}`, `color:white;background-color:#4B9CD3;`);
            }
        }

        // Variant Specific Polling
        function areElementsReady() {
            let areSelectorsReady = BB.selectorsToPollFor.every(selector => {
                return jQuery(selector).length > 0
            });
            return areSelectorsReady;
        }

        //*************** Location Change Functions ***************//
        //*********************************************************//

        function locationChangeHandler() {
            if (verifyURL(BB.qualifyingPages)) {
                addTestNameClass();
                when(areElementsReady, stopWhenAfter(2000)).done(offerCode);
            } else {
                removeTestNameClass();
                failSafe();
            }
        }
        
        function applyLocationChangeListener() {
            when(() => {
                return isAngularReady() && Boolean(typeof jQuery !== 'undefined');
            }).done(() => {
                addAngularEventListener('$locationChangeSuccess', `${BB.testName}_${options.variantName}`, locationChangeHandler);
            });
        }

        //*************** Variant Logic Functions ***************//
        //*********************************************************//
        function addTestNameClass() {
            jQuery('body').addClass(`${BB.testName}`);
            jQuery('body').addClass(`${BB.testName}_${options.variantName}`);
        }

        function removeTestNameClass() {
            jQuery(`.${BB.testName}`).removeClass(`${BB.testName}`);
            jQuery(`.${BB.testName}_${options.variantName}`).addClass(`${BB.testName}_${options.variantName}`);
        }

        let isCssAdded = null;

        function addCSS() {
            if (!isCssAdded) {
                dom.addCss(css);
                isCssAdded = true;
            }
        }

        function failSafe(waitTime = 2500) {
            setTimeout(() => {
                if (options.failSafe) {
                    options.failSafe();
                }
            }, waitTime);
        }

        //*************** Code Offer ***************//
        //************************************************//
        function offerCode() {
            if (verifyURL(BB.qualifyingPages)) {
                // Logging
                bbiDebug(`${BB.testName} offer. VerifyURL: ` + verifyURL(BB.qualifyingPages));
                bbiDebug(`${BB.testName} Location: ` + location.href);
                // Variant Logic Execution

                when(() => {
                        return Boolean(typeof jQuery !== 'undefined') && isAngularReady() && areElementsReady();
                    })
                    .done(addTestNameClass)
                    .done(addCSS)
                    .done(variantFunction)
                    .always(failSafe);
            }
            // End Verify URL
            applyLocationChangeListener();
        }
        // End Offer

        // Call offerCode
        when(isQualified, stopWhenAfter(20000)).done(offerCode);
    }
}

export {
    executeVariantOffer
};