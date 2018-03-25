import {
    BB
} from 'config';
import {
    bbiDebug
} from 'test_utilities'


export function AppComp() {
    if (!window.BBtests[`${BB.testName}_AppComp`]) {
        window.BBtests[`${BB.testName}_AppComp`] = true;
        when(function () {
                return Boolean(window.digitalData) && Boolean(window.digitalData.page) && Boolean(window.digitalData.page.pageInfo) && Boolean(window.digitalData.page.pageInfo.pageName.toLowerCase().indexOf('thankyou') !== -1);
            })
            .then(handleThankYou);

        function handleThankYou() {
            when(function () {
                return Boolean(window.digitalData.page.attributes) && Boolean(window.digitalData.page.attributes.appDecision);
            }).then(function () {
                var decision = window.digitalData.page.attributes.appDecision,
                    pcn = window.omn_pcnnumber || window.itm_pcn || window.itag_pcnnumber || window.VAR_PCN,
                    decisionName;
                if (decision.toLowerCase().indexOf('approve') !== -1) {
                    decisionName = 'Approved';
                } else if (decision.toLowerCase().indexOf('decline') !== -1) {
                    decisionName = 'Declined';
                } else if (decision.toLowerCase().indexOf('pend') !== -1) {
                    decisionName = 'Pending';
                } else if (decision.toLowerCase().indexOf('conditional') !== -1) {
                    decisionName = 'Conditional';
                } else if (decision.toLowerCase().indexOf('cancel') !== -1 || decision === 'NTC v7' || decision === 'NTC v8') {
                    decisionName = 'Cancel';
                }
                let msg = `${BB.testName} Decision: ${decisionName} ${decision}, PCN: ${pcn}`;
                bbiDebug(msg);
                if (decisionName == 'Approved') {
                    visitor.setId(4, pcn);
                    bbiDebug(`${BB.testName}_AppComp Firing!`);
                    bbiDebug(`${BB.testName} PCN: ${pcn}`);
                    actions.send(`${BB.testName}_AppComp`, 1, decisionName || decision);
                }
            });
        }
    }
}

export function AppSub(selector) {

    function defer(method) {
        if (typeof jQuery !== 'undefined') {
            method();
        } else {
            setTimeout(function () {
                defer(method)
            }, 50);
        }
    }

    function metricSetup() {
        jQuery(selector).off('click.bb');
        jQuery(selector).on('click.bb', function () {
            actions.send(`${BB.testName}_AppSub`, 1);
        });
    }

    defer(metricSetup);
}