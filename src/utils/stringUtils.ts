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
