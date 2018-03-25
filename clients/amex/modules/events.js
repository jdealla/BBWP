import { BB } from 'config';
import { isScrolledIntoView, bbiDebug } from 'test_utilities';


function whenScrolled(elementToWatch, eventName, cb) {
    let scrollActionFired = false;
    let scrollListenerAdded = false;
    let locationChangeListenerAdded = false;

    function listenForScroll() {
        if (!scrollListenerAdded) {
            scrollListenerAdded = true;
            jQuery(window).off(`scroll.${eventName}`);
            jQuery(window).on(`scroll.${eventName}`, fireCallback);
        }
    }

    function fireCallback() {
        if (!scrollActionFired && isScrolledIntoView(`.${BB.testName} ${elementToWatch}`, 0)) {
            cb();
            scrollActionFired = true;
            jQuery(window).off(`scroll.${eventName}`);
        }
    }

    function destroyListenerOnLocationChange() {
        if (!window.BBtests.hasOwnProperty(`${BB.testName}_${eventName}_locationChangeListener`)) {
            window.BBtests[`${BB.testName}_${eventName}_locationChangeListener`] = true;
            let scope = window.angular.element(document.documentElement).scope();
            scope.$on('$locationChangeStart', function (event) {
                bbiDebug('Location change - removing scroll listener');
                scrollListenerAdded = false;
                jQuery(window).off(`scroll.${eventName}`);
            });
        }
    }

    listenForScroll();
    destroyListenerOnLocationChange();
}

export {
    whenScrolled
}
