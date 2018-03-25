export function wrapSubstring(str, textToWrap, openingTag, closingTag) {
    let firstIndex = str.indexOf(textToWrap);
    let newText = openingTag + textToWrap + closingTag;
    return str.substring(0, firstIndex) + newText + str.substring(firstIndex + textToWrap.length);
}

export function capCase(str) {
    return str.split(' ').map(word => {
        return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
}