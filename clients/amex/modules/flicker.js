import { BB } from 'config';
import { setTimeout } from 'timers';

let count = 0;

export function FlickerFix(parentElementSelector, timeUntilRemoved) {
    if (!(this instanceof FlickerFix)) {
        return new FlickerFix(parentElementSelector, timeUntilRemoved);
    }

    this.time = timeUntilRemoved;

    let styleElementId = `${BB.testName}-flicker-fix-${count}`;

    let css = `
        <style id="${styleElementId}">
        ${parentElementSelector} {
                visibility: hidden!important;
                height: 100vh;
                width: 100vw;
            }
            ${parentElementSelector} > * {
                display: none;
            }
        </style>`;

    let remove = (time = this.time) => {
        setTimeout(function () {
            jQuery('body').remove()
        },
        time
    )
    }

    let append = (time = this.time) => {
        jQuery('body').append(css);
        setTimeout(remove, time);
    }

    count++;

    this.append = append;
    this.remove = remove;
}
