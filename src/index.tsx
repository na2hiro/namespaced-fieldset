import React, {createContext, FieldsetHTMLAttributes, Fragment, InputHTMLAttributes, useContext} from "react";
import qs from "qs";

const NamespaceContext = createContext("");

function useNamespace(name: string): string;
function useNamespace(name?: string): string | undefined;
function useNamespace(name?: string) {
    if (name === undefined) return undefined;

    const namespace = useContext(NamespaceContext);
    return namespace ? `${namespace}.${name}` : name;
}

type Props = {
    namespace: string;
}

const namespace = <T extends Props>(Component: React.ComponentType<Omit<T, "namespace">>): React.FC<T> => {
    return ({namespace, ...props}) => {
        const fullyQualifiedNamespace = useNamespace(namespace);

        return (
            <NamespaceContext.Provider value={fullyQualifiedNamespace}>
                <Component {...props} />
            </NamespaceContext.Provider>
        )
    };
}

const IntrinsicFieldset: React.VFC<FieldsetHTMLAttributes<HTMLFieldSetElement>> = (props) => {
    return <fieldset {...props} />
}

/**
 * A fieldset element, which provides descendant input elements with a namespace.
 */
export const Fieldset = namespace(IntrinsicFieldset) as (React.FC<Props & FieldsetHTMLAttributes<HTMLFieldSetElement>> & { Headless: React.FC<Props> });

/**
 * Headless version of Fieldset component: it doesn't render a fieldset.
 */
Fieldset.Headless = namespace(Fragment);

/**
 * A utility function to turn custom input-like components into namespaced input components.
 *
 * e.g. `const NamespaceAwareDatePicker = namespaceAware(DatePicker);` and then `<NamespaceAwareDatePicker name="date" />`
 * @param InputLikeComponent
 */
export const namespaceAware = <T, >(InputLikeComponent: React.ComponentType<T & { name?: string }>) => {
    return (props: T & { name?: string }) => {
        const nestedName = useNamespace(props.name);
        return <InputLikeComponent {...props} name={nestedName}/>
    };
}

const IntrinsicInput: React.VFC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
    return <input {...props} />
}

/**
 * An input element which is aware of namespace.
 *
 * e.g. `<Input name="age" value="31" />` surrounded by <Fieldset namespace="person"> ... </Fieldset>` renders `<input name="person.age" value="31" />`
 */
export const Input: React.VFC<InputHTMLAttributes<HTMLInputElement>> = namespaceAware(IntrinsicInput);

/**
 * Constructs an object from a query string serialized from a form with namespaced inputs. This is often useful on server side.
 * @param queryString
 */
export const constructFromQueryString = (queryString: string) => {
    return qs.parse(queryString, {allowDots: true, depth: 1000});
}

/**
 * Constructs an object from a FormData made by a form with namespaced inputs. This is often useful on client side.
 * @param formData
 */
export const constructFromFormData = (formData: FormData) => {
    const urlSearchParams = new URLSearchParams(formData as any);
    return constructFromQueryString(urlSearchParams.toString());
}
