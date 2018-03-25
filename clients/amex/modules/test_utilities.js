import { BB } from 'config';

function bbiDebug(msg) {
    if (window.location.search.indexOf('mmcore.un=qa') > -1 || document.cookie.indexOf('bbidebug=verbose') > -1 || sessionStorage.bbidebug === 'true') {
        let variantName = BB.hasOwnProperty('variantName') ? BB.variantName : null;
        console.log(`%c${BB.testName}${ Boolean(variantName) ? '_' + variantName : ''}: ${msg}`, `color:white;background-color:#4B9CD3;`);
    }
}

// Array of keys on BB.patterns. Pages can be excluded if the key is preceeded with '!'. i.e. parameter of ['allCardShop', '!CL'] will qualify on all card shop pages except for 'CL' (cards landing).
function verifyURL(array = BB.qualifyingPages) {

    // Variables
    let qualifies = false;
    let exclusion = false;

    // Checks for exclusions
    array.forEach((key) => {
        if (key[0] === '!') {
            let newKey = key.substring(1);
            if (typeof BB.patterns[newKey] === 'string') {
                if (location.pathname.indexOf(BB.patterns[newKey]) > -1) {
                    exclusion = true;
                }
            } else if (typeof BB.patterns[newKey].test === 'function') {
                if (BB.patterns[newKey].test(location.pathname)) {
                    exclusion = true;
                }
            }
        }
    });

    // Returns false if exclusion exists
    if (exclusion === true) {
        return false;
    }

    // Check if qualifies
    qualifies = array.some(key => {
        if (key[0] !== '!') {
            if (typeof BB.patterns[key] === 'string') {
                return location.pathname.indexOf(BB.patterns[key]) > -1;
            } else if (typeof BB.patterns[key].test === 'function') {
                return BB.patterns[key].test(location.pathname);
            }
        }
    });
    if (qualifies) {
        bbiDebug(`** ${BB.testName} URL qualify success **`);
    }
    return qualifies;
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

// Qualification logic
function isQualified(exclusions = BB.exclusions) {
    let userType = getCookie('blueboxpublic') ? 'CardMember' : 'Prospect';
    let currentEEP = getEEP();
    let cardmemberExclusion = (userType === 'CardMember' && exclusions.cardmember) ? true : false;
    let propspectExclusions = (userType === 'Prospect' && exclusions.prospect) ? true : false;
    let eepExclusions = Boolean(exclusions.eeps) ? exclusions.eeps.some((eep) => currentEEP === eep) : false;
    return !cardmemberExclusion && !propspectExclusions && !eepExclusions;
}

function doesListenerExist(listenerName, eventType, scope, listenerProperty = 'bbname') {
    return scope.$$listeners[eventType].some((fn) => {
        if (!Boolean(fn) || typeof fn === 'undefined') {
            return false;
        } else {
            if (fn.hasOwnProperty(listenerProperty)){
                return  fn[listenerProperty] === listenerName ? true : false
            } else {
                return false;
            }
        }
    });
}

function addAngularEventListener(eventType, listenerName, callback){

    if (typeof callback === 'undefined' || typeof listenerName === 'undefined') {
        throw `Error in ${BB.testName} function 'addAngularEventListener': all parameters must be defined`;
    }

    let scope = getRootScope();
    if ( !doesListenerExist(listenerName, eventType, scope) ) {
        callback.bbname = listenerName;
        scope.$on(eventType, callback);
    }

}

function stopWhenAfter(timeout) {
    let stop = false;
    window.setTimeout(function () {
        stop = true;
    }, timeout);
    return function () {
        return stop;
    };
}

function isAngularReady() {
    return Boolean(window.angular) && typeof window.angular.element === 'function' &&
        Boolean(window.angular.element(document.body).scope) &&
        Boolean(getRootScope());
}

function getRootScope() {
    try {
        return angular.element('[ng-app]').data().$injector.get('$rootScope');
    }
    catch(e){
        let msg = `Caught Exception: ${e}`
        bbiDebug(msg);
    };
}


function getQueryParam(paramName) {
    return location.search.replace(/^\?/, '').split('&')
        .map(decodeURIComponent)
        .filter(function (value) {
            return value.indexOf(paramName) === 0;
        })
        .map(function (value) {
            return value.substring(paramName.length + 1);
        })
        .shift();
}

function getEEP() {
    let urlEEP = '25530';
    if (getQueryParam('eep'))
        urlEEP = getQueryParam('eep');
    if (getQueryParam('EEP'))
        urlEEP = getQueryParam('EEP');
    return urlEEP;
}

function areElementsReady(array = BB.selectorsToPollFor) {
    let areSelectorsReady = array.every(selector => {
        return document.querySelectorAll(selector).length > 0
    });
    return areSelectorsReady;
}


function getPage() {
    var page = false;
    let patterns = BB.patterns;
    for (var key in patterns) {
        var regex = patterns[key];
        if (Boolean(regex.test(location.pathname))) {
            page = key;
            break;
        }
    }
    return page;
}

function getScopes(root = getRootScope()) {
    var scopes = [];

    function visit(scope) {
        scopes.push(scope);
    }

    function traverse(scope) {
        visit(scope);
        if (scope.$$nextSibling)
            traverse(scope.$$nextSibling);
        if (scope.$$childHead)
            traverse(scope.$$childHead);
    }
    traverse(root);
    return scopes;
}

function getScopeWithProperty(property, root = getRootScope()) {
    return getScopes(root).filter((scope) => {
        return scope.hasOwnProperty(property);
    });
}

// Passed an element, returns true when top of el scrolls Npx onto page
function isScrolledIntoView(selector, px = 30) {
    let docViewTop = window.scrollY;
    let docViewBottom = docViewTop + window.innerHeight;
	let elemTop = document.querySelector(selector).getBoundingClientRect().top + document.body.scrollTop;
    return (elemTop <= (docViewBottom - px));
}

// USDA Specific Utility Functions
function getPageName(){
    return window.hasOwnProperty('digitalData') ? window.digitalData.page.pageInfo.pageName : false;    
}

function verifyPageName(name){
    return window.hasOwnProperty('digitalData') ? getPageName().toLowerCase() === name.toLowerCase() : false;    
}

function amexServer() {
    return location.href.indexOf('qwww.americanexpress.com/us/credit-cards/') > -1 ? 'E2' : 'E3';
}

export {
    verifyURL,
    isQualified,
    stopWhenAfter,
    isAngularReady,
    bbiDebug,
    getQueryParam,
    getEEP,
    getPage,
    areElementsReady,
    isScrolledIntoView,
    getRootScope,
    getScopes,
    getScopeWithProperty,
    getCookie,
    getPageName,
    verifyPageName,
    amexServer,
    doesListenerExist,
    addAngularEventListener
};