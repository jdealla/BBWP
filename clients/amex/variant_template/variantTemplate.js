import { BB } from 'config';
import { executeVariantOffer } from 'variant_offer';
import { bbiDebug } from 'test_utilities'


// Variables to change for specific variants
let variantName = 'variant_name_here';
// Variant level qualification pages. Can be deleted.
let qualifyingPages = ['VAC', 'BCE'];
// Selectors to poll for for offer delivery. Can be deleted.
let selectorsToPollForOffer = ['body'];

// Call all variant specific functions in this main function wrapper.
function variantSpecificFunctions() {

    // do work here;

}

// Call all fail safe functions in this wrapper function. 
// It will execute during each code offer and after each location change.
function failSafe() {

    // do work here;

}

// Do not edit below this line.
// Main Offer Function Execution.
executeVariantOffer(variantSpecificFunctions, 
    {
        variantName: typeof variantName !== 'undefined' ? variantName : false, 
        qualifyingPages: typeof qualifyingPages !== 'undefined' ? qualifyingPages : BB.qualifyingPages, 
        selectorsToPollForOffer: typeof selectorsToPollForOffer !== 'undefined' ? selectorsToPollForOffer : false, 
        failSafe: typeof failSafe !== 'undefined' ? failSafe : false, 
        devPolyFills: typeof devPolyFills !== 'undefined' ? devPolyFills : false,
    }
);