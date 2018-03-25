import { bbiDebug, getEEP, amexServer } from 'test_utilities';

export function getCardsDataPromise (type, specialOffers) {
    if (typeof type === 'undefined'){
        type = 'dev';
    }
    if (typeof specialOffers === 'undefined'){
        specialOffers = false;
    }

    let eep = getEEP();    
    let serverDomain = amexServer() === 'E3' ? 'online' : 'e2qonline';
    let url = 
        type !== 'prod' ? 
            !Boolean(specialOffers) ? 
                `https://jdealla.github.io/hosted_json/cards_data/cardsData_02052018.json` :
                `https://jdealla.github.io/hosted_json/cards_data/cardsData_specialOffers_02052018.json` 
        : `https://${serverDomain}.americanexpress.com/us/cardshop-api/api/v1/cps/content/vac/${eep}?v=1&origin=maximyzer`;

    return jQuery.when(
            jQuery.ajax({
                url: url,
                headers: {},
                method: 'GET',
                xhrFields: {
                    withCredentials: type !== 'prod' ? false : true 
                },
                dataType: 'json',
            })
        )
        .then(
            (res) => {
                    res.requestUrl = url;
                    return res;
                }
        );
}