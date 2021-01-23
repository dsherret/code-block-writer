// Very quick hack to port this code to Deno

let indent = 0;

export function describe(desc: string, action: () => void) {
    logDesc(desc);
    indent++;
    action();
    indent--;
}

export function it(desc: string, action: () => void) {
    logDesc(desc);
    indent++;
    action();
    indent--;
}

function logDesc(desc: string) {
    console.log(desc.split("\n").map(l => "  ".repeat(indent) + desc).join("\n"));
}

export function expect<T>(value: T) {
    return {
        to: {
            equal(otherValue: T, message?: string) {
                if (value !== otherValue)
                    throw new Error(`FAIL. ${value} did not equal ${otherValue}. Message: ${message}`);
            },
            deepEqual(otherValue: T) {
                if (JSON.stringify(value) !== JSON.stringify(otherValue))
                    throw new Error(`FAIL. ${JSON.stringify(value)} did not equal ${JSON.stringify(otherValue)}`);
            },
            throw(message?: string) {
                const func = value as any as () => void;
                let caughtErr: any;
                try {
                    func();
                } catch (err) {
                    caughtErr = err;
                }
                if (caughtErr == null)
                    throw new Error("FAIL");
            },
            notThrow() {
                const func = value as any as () => void;
                let caughtErr: any;
                try {
                    func();
                } catch (err) {
                    caughtErr = err;
                }
                if (caughtErr != null)
                    throw new Error("FAIL");
            },
        },
    };
}
