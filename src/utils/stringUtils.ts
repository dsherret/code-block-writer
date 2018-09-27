/** @internal */
export function stringRepeat(str: string, times: number) {
    /* istanbul ignore else */
    if (typeof (String.prototype as any).repeat === "function")
        return (str as any).repeat(times);
    else
        return es5StringRepeat(str, times);
}

/** @internal */
export function es5StringRepeat(str: string, times: number) {
    if (times < 0)
        throw new Error("Invalid times value.");

    let newStr = "";
    for (let i = 0; i < times; i++)
        newStr += str;
    return newStr;
}

const newlineRegex = /(\r?\n)/g;

/** @internal */
export function escapeForWithinString(str: string, quoteKind: string) {
    return escapeChar(str, quoteKind).replace(newlineRegex, "\\$1");
}

/** @internal */
export function escapeChar(str: string, char: string) {
    if (char.length !== 1)
        throw new Error(`Specified char must be one character long.`);

    let result = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] === char)
            result += "\\";
        result += str[i];
    }
    return result;
}

/** @internal */
export function getStringFromStrOrFunc(strOrFunc: string | (() => string)) {
    return strOrFunc instanceof Function ? strOrFunc() : strOrFunc;
}
