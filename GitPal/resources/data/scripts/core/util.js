/**
 * 
 * @type Boolean true - not to show the log false - to show the log
 * production value - true.
 */
var logmeNot = true;

var IMAGES = {
    ARROW_UP: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAATtJREFUeNpi/P//PwMtARMDjQELuoCKgiI+9elA7AnEQUD8D5uCOw/u47cAD+AF4n4g5gRiUSB+Se0gUoAaDgJStIiDt0hsZlpYwIjEFqB1KuKmhQVCSOx/tLBAmFoZTRWI84GYjUQL7KApjaAFfUA8AYgPoolL4NEXAFW/nxgLYBFoAcSLkMQlkdgfkdhpQLweyj5DjAUTkSIxFhpcuCwoB+KZSOLTiLFgIxC7I/EnQOOFE0nsIbRM6kASu05sEIHAHiBuRuIfAGJbKPsPEFsC8WY0PVmkJtM6IL6AVPbIQNl/gXglWnExEeoIkvOBPxYxdrScvAGIC8jNaI+AuBiP/CkgDqQ0J4PyxTUs4s+A2IFaRQWoBruNxAdVNjZA/J3kKhMHuAnEwVBDTYB4KRDfJ6qMH/KtCoAAAwC1BDfhaRFBXgAAAABJRU5ErkJggg==",
    ARROW_DOWN: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAiCAYAAACjv9J3AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwOC8zMC8xM+qAsywAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzVxteM2AAACMElEQVRIicWXO2tUQRiG32SNK2pcCSFgMGQXY6GVmMpG8YI/QIuA+AO84IWAYGGlhQENBBJMFbFJlypgoYWCEgQrtRACQlJpZ6Hien8sZjYZJjPnzNmLvjDFmfnmfWbmzPnmjAAVLCVgFqMlYHNRj6JAAbdY1y/gYFGPbhXTgKSrznNJUqWgR2HoVgtyVesodKRaW5X01ave0lFoRH86Cn23utIlqcur9p/bC41oX6eh2OLK31hth5bUxHK2Ch1WE7u1VWhZ/2GmFUmb/jV0UFJPO6A7JN2QNC5pW058bwusU5IOSWapZiWdsQ1HJY1pY6praHeTwEmZSdUlTYuNWrBnZuhYmgjE38s5yq77HULv9LSkiciIhwJ19VDgSLUmSbdtcbUg4FNg9ABX3BHvGa4KeBiIuxCYXQVYDMT+Bk4KGI9AvwHHHKNuzO+Jr3MesB94HvFcAsqNGUxHgt4DQ9ZsAHgbiDnvAHcCzyJeawN0l24+EvgK8/M1CHwItF+0wB7gUQZwBehbg9pSBl5EOswAo8CPQNth2/9BBhCc1+BvgL3Ax0CHn8CTiNl+4HIO8CVmJaK/oGdzDFzVgbvAl4yYz8ABlxH7oOcSod8TBjXm+8egFWA5EZylSyH/rPR1gvDGSdW1mHfeFWCqSeBUlm8edDvwuiBwPscz6QJ1BJMSU/TUDrRlqIA7CcA3mLyb65cK7QXuY66GIS1jEkuSXyq0UY4DN4HHrCeESWBXEZ+/CU6ESYxLrCQAAAAASUVORK5CYII=",
    ON_ERROR: "data:image/png;base64,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",
    ON_LOADING: "data:image/gif;base64,R0lGODlhFAAUAJEDAMzMzLOzs39/f////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgADACwAAAAAFAAUAAACPJyPqcuNItyCUJoQBo0ANIxpXOctYHaQpYkiHfM2cUrCNT0nqr4uudsz/IC5na/2Mh4Hu+HR6YBaplRDAQAh+QQFCgADACwEAAIADAAGAAACFpwdcYupC8BwSogR46xWZHl0l8ZYQwEAIfkEBQoAAwAsCAACAAoACgAAAhccMKl2uHxGCCvO+eTNmishcCCYjWEZFgAh+QQFCgADACwMAAQABgAMAAACFxwweaebhl4K4VE6r61DiOd5SfiN5VAAACH5BAUKAAMALAgACAAKAAoAAAIYnD8AeKqcHIwwhGntEWLkO3CcB4biNEIFACH5BAUKAAMALAQADAAMAAYAAAIWnDSpAHa4GHgohCHbGdbipnBdSHphAQAh+QQFCgADACwCAAgACgAKAAACF5w0qXa4fF6KUoVQ75UaA7Bs3yeNYAkWACH5BAUKAAMALAIABAAGAAwAAAIXnCU2iMfaRghqTmMp1moAoHyfIYIkWAAAOw=="
};
/**
 * 
 * @param {type} text
 * @returns {unresolved}
 */
function isNotEmpty(text) {
    if (text !== null && (typeof text != 'undefined')) {
        if (text.length > 0) {
            return true;
        }
    }
}
/**
 * 
 * @param {type} str
 * @returns {unresolved}
 */
function cleanString(str) {
    var temp = $.trim(str.replace("&nbsp;", ""));
    temp = temp.replace("-", ' ');
    temp = temp.replace("&", ' ');
    temp = temp.replace('"', '');
    temp = temp.replace('|', ' ');
    temp = escape(temp);
    temp = temp.replace("%u2122", "");
    temp = temp.replace("%AE", "");
    temp = unescape(temp);
    temp = temp.replace(/<span.*?>.*?<\/span>/g, ' ');
    temp = temp.replace(/<([^>]+)>/g, ' ');
    temp = temp.replace(/\((.*?)\)/g, "");
    temp = temp.replace(/\[(.*?)\]/g, "");
    return temp;
}


/**
 * 
 * @param {type} str
 * @returns {Boolean}
 */
function toBool(str) {
    return ((str === true) || (str === 'true')) ? true : false;
}

/**
 * 
 * @param {type} val
 * @returns {unresolved}
 */
function isText(val) {
    return !(typeof val === 'undefined' || (val === '') || (val === null));
}


var util = {
    consoleLog: function(text) {
        if (logmeNot)
            return;
        console.log(text);
    },
    /**
     * 
     * @param {type} text
     * @returns {unresolved}
     */
    dropLog: function(text) {
        if (logmeNot)
            return;
        if ($('#textA').length === 0) {
            $("body").prepend('<div id="ebcpTxta" data-show="0" style="position: fixed;top: 0;left: 0;z-index: 100000;"><p style="display:none;"><textarea id="textA"  cols="100" rows="40">Started @ ' + new Date() + '\n\n</textarea></p><button id="btnInTogle">Show Log</button></div>');
            $('#btnInTogle').click(function() {
                if ($('#ebcpTxta').attr('data-show') == 0) {
                    $('#ebcpTxta').attr('data-show', 1);
                    $('#ebcpTxta').find('p').fadeIn();
                    $('#ebcpTxta').find('button').html('Hide Log');
                } else {
                    $('#ebcpTxta').attr('data-show', 0);
                    $('#ebcpTxta').find('p').fadeOut();
                    $('#ebcpTxta').find('button').html('Show Log');
                }
            });
        }
        var jLog = $('#textA');
        var old = jLog.text();
        jLog.text(old + '\n--------------------------------------------------\n>>> ' + text);
        jLog.scrollTop(jLog[0].scrollHeight - jLog.height());
    }
};