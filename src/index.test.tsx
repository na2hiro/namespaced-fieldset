import React from "react";
import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";

import {constructFromFormData, constructFromQueryString, Fieldset, Input, namespaceAware} from ".";

describe("<Fieldset />", () => {
    it("renders fieldset", () => {
        const {container} = render(<Fieldset namespace="topLevel">
            <Input name="attribute" value="value"/>
            <Input name="others" value="foobar"/>
        </Fieldset>);
        expect(container).toMatchSnapshot();
    });
    it("adds namespaces with nesting", () => {
        const {container} = render(<Fieldset namespace="topLevel">
            <Input name="attribute" value="outer value"/>
            <Fieldset namespace={"secondLevel"}>
                <Input name="attribute" value="inner value"/>
            </Fieldset>
        </Fieldset>);
        expect(container).toMatchSnapshot();
    });
    it("accepts deeper namespaces with array and dot notations", () => {
        const {container} = render(<form>
            <Fieldset namespace="person[0]">
                <Input name="name" value="Jane"/>
                <Fieldset namespace={"hobby.pet"}>
                    <Input name="kind" value="koala"/>
                </Fieldset>
            </Fieldset>
            <Fieldset namespace="person[1]">
                <Input name="name" value="Jack"/>
                <Fieldset namespace={"hobby"}>
                    <Input name="favorite.cities[0]" value="Kyoto"/>
                </Fieldset>
            </Fieldset>
        </form>);
        expect(container).toMatchSnapshot();
    });
});

describe("<Fieldset.Headless />", () => {
    it("doesn't render fieldset", () => {
        const {container} = render(<Fieldset.Headless namespace="topLevel">
            <Input name="attribute" value="value"/>
            <Input name="others" value="foobar"/>
        </Fieldset.Headless>);
        expect(container).toMatchSnapshot();
    });
    it("adds namespaces with nesting, mixed with head-ful ones", () => {
        const {container} = render(<Fieldset.Headless namespace="topLevel">
            <Input name="foo" value="top-level value"/>
            <Fieldset.Headless namespace={"secondLevelHeadless"}>
                <Input name="bar" value="headless second level"/>
            </Fieldset.Headless>
            <Fieldset namespace={"secondLevelHeadful"}>
                <Input name="baz" value="headful second level"/>
            </Fieldset>
        </Fieldset.Headless>);
        expect(container).toMatchSnapshot();
    });
});

describe("<Input>", () => {
    it("works without wrapping with Fieldset", () => {
        const {container} = render(<form>
            <Input name="name" value="value"/>
            <Input type="submit" value="Proceed"/>
        </form>);
        expect(container).toMatchSnapshot();
    });
});

describe("namespaceAware()", () => {
    it("turns a component which takes name into a namespace aware one", () => {
        const Component = (props: { name: string }) => <div>gorgeous UI here! <input name={props.name}/></div>;
        const NamespacedComponent = namespaceAware(Component);
        const {container} = render(<Fieldset namespace="topLevel"><NamespacedComponent name="value"/></Fieldset>);
        expect(container).toMatchSnapshot();
    });
})

describe("constructFromFormData", () => {
    it("works with a simple query string", () => {
        const {container} = render(<form>
            <Fieldset namespace="person[0]">
                <Input name="name" value="Jane"/>
                <Fieldset namespace={"hobby.pets[0]"}>
                    <Input name="kind" value="koala"/>
                </Fieldset>
                <Fieldset namespace={"hobby.pets[1]"}>
                    <Input name="kind" value="cat"/>
                </Fieldset>
            </Fieldset>
            <Fieldset namespace="person[1]">
                <Input name="name" value="Jack"/>
                <Fieldset namespace={"hobby"}>
                    <Input name="favorite.cities" value="Kyoto"/>
                    <Input name="favorite.cities" value="Tokyo"/>
                </Fieldset>
            </Fieldset>
        </form>);
        const formElement = container.getElementsByTagName("form")[0] as HTMLFormElement;
        console.log(formElement.tagName)
        const formData = new FormData(formElement);
        expect(constructFromFormData(formData)).toMatchInlineSnapshot(`
          {
            "person": [
              {
                "hobby": {
                  "pets": [
                    {
                      "kind": "koala",
                    },
                    {
                      "kind": "cat",
                    },
                  ],
                },
                "name": "Jane",
              },
              {
                "hobby": {
                  "favorite": {
                    "cities": [
                      "Kyoto",
                      "Tokyo",
                    ],
                  },
                },
                "name": "Jack",
              },
            ],
          }
        `);
    });
})

describe("constructFromQueryString", () => {
    it("works with a simple query string", () => {
        expect(constructFromQueryString("person[0].name=bar&person[1].name=qux")).toMatchInlineSnapshot(`
          {
            "person": [
              {
                "name": "bar",
              },
              {
                "name": "qux",
              },
            ],
          }
        `);
    });
})