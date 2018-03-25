

import {
    BB
} from 'config';
import {
    getQueryParam,
    getEEP,
    isQualified,
    isAngularReady,
    stopWhenAfter,
    verifyURL,
    getRootScope,
    bbiDebug,
    addAngularEventListener,
} from 'test_utilities';

function executeQualificationOffer(options) {
    options.exclusions = BB.exclusions;
    BB.variantName = 'Qualification Script';

    if (verifyURL()) {
        if (options.hasOwnProperty('runAtTop')) {
            options.runAtTop();
        }
        if (options.hasOwnProperty('fixFlicker')) {
            options.fixFlicker();
        }
    }


    // Label all visitors
    visitorLabeling();

    // Test logic
    function deliverVariantCode() {
        // Wait to deliver offer until ready
        when(verifyURL, stopWhenAfter(20000)).done(function () {
            if (isQualified(options.exclusions)) {
                renderer
                    .getContent(BB.vp)
                    .done(function () {
                        bbiDebug(`${BB.testName}: ** Delivering variant **`);
                        fireDefaultActions();
                        renderer.runVariantJs(`${BB.testName}_${BB.campaignElement}`);
                        fireIntegration();
                    }).fail(function () {
                        renderer.showAll();
                        bbDebug(`${BB.testName} getContent() failed`);
                    });
            }
        }).fail(function () {
            var status = isQualified(options.exclusions) ? 'timeout' : 'failure';
            bbiDebug(`${BB.testName}: ** Qualification ${status} **`);
        }).always(() => {
            when(isAngularReady).done(listenForRouteChange);
        });
    }


    // Visitor labeling code
    function visitorLabeling() {
        bbiDebug('** Firing visitor labeling');
        // Is Card Member or Prospect?
        let userType = cookies.get('blueboxpublic') ? 'CardMember' : 'Prospect';
        visitor.setAttr('User_Type', userType);

        // Set visitor EEP
        let traffic_source = '';
        let urlEEP = getEEP();

        if (/(\d+)/.test(parseInt(urlEEP))) {
            if (urlEEP === '25330') {
                traffic_source = 'passiveSite';
            } else if (urlEEP === '26129') {
                traffic_source = 'affiliate';
            } else if (urlEEP === '28000') {
                traffic_source = 'paidSearch';
            } else if (/(405\d{2})/.test(parseInt(urlEEP)) && urlEEP.length === 5) {
                traffic_source = 'display';
            } else {
                traffic_source = 'noEEP';
            }
        }
        if (/d+/.test(parseInt(urlEEP))) {
            visitor.setAttr('EEP', urlEEP);
        }
        visitor.setAttr('Traffic_Source', traffic_source);
    }

    // Omniture & ClickTale Integration
    function fireIntegration() {

        bbiDebug(`${BB.testName}: ** Firing integrations **`);

    
        if (BB.hasOwnProperty('omnitureScript') && BB.omnitureScript.toLowerCase() !== 'new') {
            // OLD Adobe Omniture
            bbiDebug(`${BB.testName}: OLD Adobe Omniture Integration Firing`);
            let integrations = modules.require('integrations');
            integrations.trackOmniture(campaign);
        } else if (BB.hasOwnProperty('omnitureScript') && BB.omnitureScript.toLowerCase() === 'new') {
            // NEW Adobe Omniture
            bbiDebug(`${BB.testName}: NEW Adobe Omniture Integration Firing`);
            Integrations.run('Adobe Analytics', {
                campaign: campaign, //do not change this line
                redirect: false // for redirect pages
            });
        } else {
            // OLD Adobe Omniture
            bbiDebug(`${BB.testName}: OLD Adobe Omniture Integration Firing`);
            let integrations = modules.require('integrations');
            integrations.trackOmniture(campaign);
        }

        // ClickTale
        if (BB.hasOwnProperty('clicktale')) {
            bbiDebug(`${BB.testName}: Clicktale Integration Firing`);
            Boolean(BB.clicktale) ? Integrations.run('ClickTale', {
                    campaign: campaign, // do not change this
                    redirect: false, // set to true for redirect campaigns, you must also map this script to the alternative pages' URLs
                    persist: true // change to false if you want to pass individual experience data for a campaign instead of concatenating all the campaigns' experiences
                }) :
                null;
        }
    }

    // Default action code
    function fireDefaultActions() {
        let urlEEP = getEEP();
        if (verifyURL() && isQualified(options.exclusions)) {
            events.domReady(function () {
                bbiDebug(`${BB.testName}: ** Firing default actions **`);
                let wl = window.location;

                function setCoreVisitorId(){
                    bbiDebug('Core Visitor ID properties being set')
                    // Ominture_ID
                    if (cookies.get('s_vi')) {
                        visitor.setId(3, cookies.get('s_vi'));
                    }
                    // GCT_ID
                    if (cookies.get('gctracus')) {
                        visitor.setId(4, cookies.get('gctracus'));
                    }
                    // Generation_URL
                    visitor.setId(5, urlEEP);
                }

                function setUsdaVisitorId(){
                    bbiDebug('USDA Visitor ID properties being set')
                    // Ominture_ID
                    if (cookies.get('s_vi')) {
                        visitor.setId(3, cookies.get('s_vi'));
                    }
                    // GCT_ID
                    if (cookies.get('gctracus')) {
                        visitor.setId(5, cookies.get('gctracus'));
                    }
                }
                
                if (BB.hasOwnProperty('amexGroup')){
                    if (BB.amexGroup.toLowerCase() === 'usda'){
                        setUsdaVisitorId();
                    } else {
                        setCoreVisitorId();
                    }
                } else {
                    setCoreVisitorId();
                }
                actions.send(`${BB.testName}_Ext_ID`, 1);
            });
        }
    }

    function listenForRouteChange() {
            when(() => {
                return Boolean(getRootScope())
            }).done(() => {
                bbiDebug(`${BB.testName}: ** Listening for route change **`);

                addAngularEventListener('$locationChangeStart', `${BB.testName}_locationChangeStart`, function (event) {
                    bbiDebug(`${BB.testName}: ** Location change start **`);
                });

                addAngularEventListener('$locationChangeSuccess', `${BB.testName}_locationChangeSuccess`, function (event) {
                    bbiDebug(`${BB.testName}: ** Location change success **`);
                    deliverVariantCode();
                });

            });
    }

    // Initialize test logic
    deliverVariantCode();
}

export {
    executeQualificationOffer
};