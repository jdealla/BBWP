let BB = {};

// Changes qualification logic. Options are: 'core' or 'usda'. Defaults to 'core'.
BB.amexGroup = 'core';

// Qualification Script Variables
// For All Test Code
BB.testName = 'test_name_here';

// VP on Maxymiser campaign should match
BB.vp = `${BB.testName}_VP`;

// Maxymiser Element Name Here;
BB.campaignElement = 'El'

// Strings of keys on BB.patterns. 
// Qualification script level Pages. Variant Qualification can be overwritten in variant code. Certain pages can be excluded with a '!' preceding the key.
BB.qualifyingPages = ['VAC'];

// Cardmember and EEPs excluded from the test
BB.exclusions = {
    eeps: [''],
    cardmember: false,
    prospect: false,
};

// Set to 'new' to use the new Adobe Integration Script
BB.omnitureScript = 'old';

// Set to true to implement Clicktale
BB.clicktale = false;

// Key strings should be used in the BB.qualifyingPages array or in the qualifyingPages array in the variant code. Regexp and url path strings can be used.
BB.patterns = {
    allCardShop: /^\/us\/credit-cards\/.*/, // All card shop pages
    VAC: /^\/us\/credit-cards\/view-all-personal-cards\/(\d+)?$/, // features and benefits pages
    features: /^\/us\/credit-cards\/dtw-landing\/(\d+)?$/, // Features and benefits
    DTW: /^\/us\/credit-cards\/features-benefits\/(\d+)?$/, // DTW
    CL: /^\/us\/credit-cards\/(\d+)?$/, // Match credit-cards landing page/'Featured Cards'
    travel_category: /^\/us\/credit-cards\/category\/travel-rewards\/(\d+)?$/, // Travel Category
    cash_back: /^\/us\/credit-cards\/category\/cash-back\/(\d+)?$/, // Cash Back Cards category
    reward_points: /^\/us\/credit-cards\/category\/reward-points\/(\d+)?$/, // Rewards Points Cards category
    no_annual_fee: /^\/us\/credit-cards\/category\/no-annual-fee\/(\d+)?$/, // No Annual Fee Cards category
    zero_percent_intro_apr: /^\/us\/credit-cards\/category\/zero-percent-intro-apr\/(\d+)?$/,
    no_fx_fee: /^\/us\/credit-cards\/category\/no-foreign-transaction-fee\/(\d+)?$/,
    airline: /^\/us\/credit-cards\/category\/airline-miles\/(\d+)?$/,
    hotel: /^\/us\/credit-cards\/category\/hotel-rewards\/(\d+)?$/,
    low_interest: /^\/us\/credit-cards\/category\/low-interest\/(\d+)?$/,
    green: /^\/us\/credit-cards\/card\/green\/(\d+)?$/,
    BCE: /^\/us\/credit-cards\/card\/blue-cash-everyday\/(\d+)?$/, // BlueCashEveryday
    AED: /^\/us\/credit-cards\/card\/amex-everyday\/(\d+)?$/, // AmexEveryday
    SPG: /^\/us\/credit-cards\/card\/starwood-preferred-guest\/(\d+)?$/,
    PRG: /^\/us\/credit-cards\/card\/premier-rewards-gold\/(\d+)?$/,
    Platinum: /^\/us\/credit-cards\/card\/platinum\/(\d+)?$/,
    BCP: /^\/us\/credit-cards\/card\/blue-cash-preferred\/(\d+)?$/,
    PQ: /^\/us\/credit-cards\/check-for-offers\/(\d+)?$/, // Pre-qualifed form page
    VAC: /^\/us\/credit-cards\/view-all-personal-cards\/(\d+)?$/, // View All Cards page
    PQL: /^\/us\/credit-cards\/ua-offer-cards\/(\d+)?/, // prequal landing page
    CD: /^\/us\/credit-cards\/card\/.+\/(\d+)?$/, // Card Details
    card_pages: /^\/us\/credit-cards\/card\/[a-zA-Z\-]+\/(\d+)?$/,
    compare: /^\/us\/credit-cards\/compare-cards\/(\d+)?$/,
    CardMemberLogin: /^\/us\/credit-cards\/login\/(\d+)?$/,
    DG: /^\/us\/credit-cards\/card\/delta-skymiles\/(\d+)?$/,
    partialPath: 'premier-rewards-gold',
};

export {BB}

