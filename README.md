# 🕵 Mr. Holmes (`Sherlock Holmes`)

Execute a fetch using a group of strategies
and an attempt to solve the `MatchRule` to find one or more elements matching in a node tree,
for example `HTMLDocument`.

Each match rule will be learned, generating experiences to find other data faster in future executions.

To build an instance of this class use the Builder Pattern by `Builder` class to mount an fetch approach appropriated.

An analogy is to Sherlock Holmes tales.
Where Holmes has a mystery to solve and will requests support to his `dog Toby` and your friend `Watson` taking notes about everything.

Each requests of method `elementary` in an `MrHolmes` instanced class (non limited execution to one time only) will create an isolated instance of `Toby` to use all `strategies` merged in all possible ways to matching and find the object.

`Watson` log will register every fetch progress.

![Sherlock Holmes Image](https://i.pinimg.com/originals/e6/2d/be/e62dbe4421f617e5598f5fae713de56a.jpg)

## Usage Example

### For HTML Document

The below example will looking for in a **HTML DOCUMENT**
a limit of **2** results that is matching with rule `HTML DIV Element contains id = "TARGET_ID"`

```
return new SherlockHolmes.Builder()
    .useLimitResult(2)
    .useWhatToFind(
        MatchRule.tagName("div").and(
          MatchRule.containsPropertySomeValueString("id", "TARGET_ID")
        )
      )
      .elementaryAsync()
```

### For Figma

The below example will looking for in a **FIGMA** project a limit of **10** results that is matching with rule `Element Page contains in attribute name the value "TARGET_NAME"`.

```
return new SherlockHolmes.Builder()
    .useFigma({
        closePlugin: true,//close figma plugin after search
        messageTimeout: 2000,//figma message timeout
        notify: true})//enable figma message
    .useLimitResult(10)//max result
    .useWhatToFind(
        MatchRule.constructorName("PageNode").and(
          MatchRule.containsPropertySomeValueString("name", "TARGET_NAME")
        )
      )
      .elementaryAsync()
```
