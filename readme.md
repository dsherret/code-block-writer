code-block-writer
=================

A simple text writer that assists formatting blocks of code.

## Example

```typescript
import CodeBlockWriter from "code-block-writer";

const writer = new CodeBlockWriter();
const className = "MyClass";
 
writer.write(`class ${className} extends OtherClass`).block(() => {
    writer.writeLine(`@MyDecorator("myArgument1", "myArgument2")`);
    writer.write(`myMethod(myParam: any)`).block(() => {
        writer.write(`return this.post("myArgument");`);
    });
});

console.log(writer.toString());
```

Outputs:

```text
class MyClass extends OtherClass {
   @MyDecorator("myArgument1", "myArgument2")
   myMethod(myParam: any) {
       return this.post("myArgument");
   }
}
```