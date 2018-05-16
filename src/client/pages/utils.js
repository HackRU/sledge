(function () {
"use strict";

function toggleClass(toggle, onClass, offClass) {
    if ( toggle && onClass ) {
        return " "+onClass;
    } else if ( !toggle && offClass ) {
        return " "+offClass;
    } else {
        return "";
    }
}
window.toggleClass = toggleClass;

})();
