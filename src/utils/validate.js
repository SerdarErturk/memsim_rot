let status = {};
function validateRequired(name, current, message) {
    const r = { hasError: false };
    if (current == null ||
        ((typeof current === 'string' || current instanceof String) && current == '' || (current == null || current.length == 0)) // Burayı Serdar'a göster
    ) {
        r.updateState |= status.validateStatus !== 'error';
        r.hasError = true;
    }
    else {
        r.updateState |= status.validateStatus !== 'success';
        r.hasError = false;
    }
    return r;
}
function validateMaxLength(name, current, message, length) {
    const r = { hasError: false };
    if (current == null || current.length > length) {
        r.updateState |= status.validateStatus !== 'error';
        r.hasError = true;
    }
    else {
        r.updateState |= status.validateStatus !== 'success';
        r.hasError = false;
    }
    return r;
}
function validateMinLength(name, current, message, length) {
    const r = { hasError: false };
    if (current == null || current.length < length) {
        r.updateState |= status.validateStatus !== 'error';
        r.hasError = true;
    }
    else {
        r.updateState |= status.validateStatus !== 'success';
        r.hasError = false;
    }
    return r;
}
function validateEmail(name, current, message) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const r = { hasError: false };
    if (current && !re.test(String(current).toLowerCase())) {
        r.updateState |= status.validateStatus !== 'error';
        r.hasError = true;
    }
    else {
        r.updateState |= status.validateStatus !== 'success';
        r.hasError = false;
    }
    return r;
}
function validatePhone(name, current, message) {
    const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    const r = { hasError: false };
    if (current && !re.test(String(current).toLowerCase())) {
        r.updateState |= status.validateStatus !== 'error';
        r.hasError = true;
    }
    else {
        r.updateState |= status.validateStatus !== 'success';
        r.hasError = false;
    }
    return r;
}
function validateURL(name, current, message) {
    const r = { hasError: false };
    const urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");

    if (!urlregex.test(current)) {
        r.updateState |= status.validateStatus !== 'error';
        r.hasError = true;

    }
    else {
        r.updateState |= status.validateStatus !== 'success';
        r.hasError = false;
    }

    return r;
}

function validateTCId(name, current, message) {
    const r = { hasError: false };
    // if (process.env.NODE_ENV !== 'production') {
    //     return r;
    // }
    if (current && current != '') {
        const isEleven = /^[0-9]{11}$/.test(current);
        let totalX = 0;
        for (var i = 0; i < 10; i++) {
            totalX += Number(current.substr(i, 1));
        }
        const isRuleX = totalX % 10 == current.substr(10, 1);
        let totalY1 = 0;
        let totalY2 = 0;
        for (var i = 0; i < 10; i += 2) {
            totalY1 += Number(current.substr(i, 1));
        }
        for (var i = 1; i < 10; i += 2) {
            totalY2 += Number(current.substr(i, 1));
        }
        const isRuleY = ((totalY1 * 7) - totalY2) % 10 == current.substr(9, 0);
        if (!isEleven || !isRuleX || !isRuleY) {
            r.updateState |= status.validateStatus !== 'error';
            r.hasError = true;
        }
    }
    else if (current == '') {
        r.updateState |= status.validateStatus !== 'error';
        r.hasError = true;
    }
    else {
        r.updateState |= status.validateStatus !== 'success';
        r.hasError = false;
    }
    return r;
}

export function validating(name, current, validation) {
    let r = {
        hasError: false,
        updateState: false,
        focusOn: null,
        message: ""
    };
    if (validation) {
        for (const range of validation) {
            const rule = range.type;
            const { message } = range;
            if (rule && rule != "") {
                if (rule == "required") {
                    r = validateRequired(name, current, message);
                }
                else if (rule == "emailAddress") {
                    r = validateEmail(name, current, message);
                }
                else if (rule == "identificationNumber") {
                    r = validateTCId(name, current, message);
                }
                else if (rule == "maxLength") {
                    const length = parseInt(range.parameters.Length)
                    r = validateMaxLength(name, current, message, length);
                }
                else if (rule == "minLength") {
                    const length = parseInt(range.parameters.Length)
                    r = validateMinLength(name, current, message, length);
                }
                else if (rule == "url") {
                    r = validateURL(name, current, message);
                }
                else if (rule == "phoneNumber") {
                    r = validatePhone(name, current, message);
                }
                if (r && r.hasError) {
                    r.field = name;
                    r.message = message;

                    break;
                }
            }
        }
    }
    return r;
}
export function validate(name, current, rules, message) {
    const rls = rules.split("|");
    let r = {};
    for (let i = 0; i < rls.length; i++) {
        const rule = rls[i];
        if (rule && rule != "") {
            if (rule == "required") {
                r = validateRequired(name, current, message);
            }
            else if (rule == "email") {
                r = validateEmail(name, current, message);
            }
            else if (rule == "identificationNumber") {
                r = validateTCId(name, current, message);
            }
            if (r && r.hasError) { return r; }
        }
    }
    return {};
}
