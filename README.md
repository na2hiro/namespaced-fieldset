# `namespaced-fieldset`

A tiny React utils which gives uncontrolled `<input>` elements a power of namespaces, and allows constructing complex objects

## Motivation

When you create a form in React, you'd have to choose either of following strategies:

* Controlled `<input>`s: Manage user's inputs in React states by yourself, calling `setState()` for every `onChange` events and setting `value`. On submit, refer to the states.
* Uncontrolled `<input>`s: Pass `defaultValue` prop initially and let browser manage user's inputs for the rest. On submit, you construct user's inputs *somehow*.

This library comes in to **help construct object of user's inputs from uncontrolled `<input>`s**, while native `<input>`s only gives you flat key-value.

## Demo

Try out [live demo](https://namespaced-fieldset-example.na2hiro.workers.dev/) (source code is [here](https://github.com/na2hiro/namespaced-fieldset-example))

## How it works

You can define namespace with `<Fieldset>`, which respects [native `<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset) for grouping inputs, then `<Input>`s are aware of namespaces defined in ancestor nodes. 

```typescript jsx
<form>
    <Fieldset namespace="person[0]">
        <legend>first person</legend>
        <Input name="name" value="Jane" />
        <Input name="age" value="31" />
    </Fieldset>
    {/* You can also choose not to render <fieldset> with the headless component */}
    <Fieldset.Headless namespace="person[1]">
        <Input name="name" value="Jack" />
        <Input name="age" value="30" />
    </Fieldset.Headless>
</form>
```

Then you'll get `input`s with namespaced names like this:

```html
<form>
    <fieldset>
        <legend>first person</legend>
        <input name="person[0].name" value="Jane">
        <input name="person[0].age" value="31">
    </fieldset>
    <input name="person[1].name" value="Jack">
    <input name="person[1].age" value="30">
</form>
```

Finally, you can construct an object from `form` element using `constructFromFormData()`:
```typescript
constructFromFormData(new FormData(formElement));
// ...gives you:
({
    person: [
        { name: "Jane", age: "31" },
        { name: "Jack", age: "30" }
    ]
})
```
Refer to [`qs` doc](https://github.com/ljharb/qs#readme) for how names are mapped to object keys.

## Use with custom input-like components
You can turn your input-line components into ones which is aware of namespaces.

```typescript jsx
import {namespaceAware} from "namespaced-fieldset";

const DatePicker = ({name}) => (
    <div>
        {/* gorgeous UI here */}
        <input type="date" name={name} />
    </div>
);
// Turn into namespace-aware component
const NamespaceAwareDatePicker = namespaceAware(DatePicker);

const Page = () => {
    return (
        <Fieldset namespace="person[0]">
            <legend>first person</legend>
            <NamespaceAwareDatePicker name="birthday"/>
        </Fieldset>
    )
};
```

## Use with Remix

This library greatly works with [Remix](https://remix.run/), which embraces `<form>`s and Web standards. You can not only construct objects from `<form>`s on client side, but also on server side:

```typescript jsx
export const action = async ({request}) => {
    const text = await request.text();
    constructFromQueryString(text) // Benefit!
}
export default function () {
    return (
        <Form method="post">
            <Fieldset namespace="person">
                <legend>person</legend>
                <Input name="name" value="Jane"/>
                <Input name="age" value="31"/>
            </Fieldset>
        </Form>
    )
}
```

1. User submits `<Form>`, then remix (or browser) serializes inputs to query string and sends it to server
2. In `action()` or `loader()`, you can construct an object from the query string given by `request.text()`
