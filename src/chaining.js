'use strict';

/* eslint-disable valid-jsdoc */

/**
 * Composes a chained function wrapped with API methods exposing child chainedFunctions. The
 *   composeChainLink function wires a transformer and transformArgs into a no-args result that
 *   exposes a tree of child chainedFunctions. The children are stubs that will call back into
 *   composeChainLink on a lazy basis.
 * @param inputFunction  A generator to be invoked and consumed. It has no parameters.
 * @param name           Name for returned chainedFunction.
 * @param transformer    A consumer for the inner generator that also returns a generator. It takes
 *   at least one parameter, an inputFunction. The call to transformer is curried so that the returned
 *   function does not expect the first parameter, and other parameters are passed on.
 * @param transformArgs  Parameters passed through to transformer function.
 * @param children       An array of objects with {name: <functionName>, transformer: <Function>}.
 * @returns A chainedFunction. It is an actual function taking no parameters. It also has the properties:
 * {
 *   name: <STRING>  //name passed to this function
 *   child1: {
 *     name: <STRING> //name of child function
 *     child1, child2, ..., childN  Chained offspring
 *   }
 *   child2 {...}, ..., childN {...}
 */
function composeChainLink (inputFunction, name, transformer, transformArgs, ...children) {
    const result = () => {
        const coalescedInputFunction = inputFunction || (() => {});
        return transformer(coalescedInputFunction(), ...transformArgs);
    };
    const childPairs = (children)
        .map(child => {
            const childFunc = (...args) => {
                return composeChainLink(result, child.name, child.transformer, args, ...child.children);
            };
            return {[child.name]: childFunc};
        })
        .concat([{_name: name}]);

    return Object.assign.apply(null, [result].concat(childPairs));
}

function childrenOf (linkName, linkDefinitions) {
    const definition = linkDefinitions[linkName];
    return (definition.children || [])
        .map(childName => {
            const definition = linkDefinitions[childName];
            return {
                name: childName,
                transformer: definition.transformer,
                children: childrenOf(childName, linkDefinitions)
            };
        });
}

function composeChain (startingLink, linkDefinitions) {
    const startingDefinition = linkDefinitions[startingLink];
    const children = childrenOf(startingLink, linkDefinitions);

    return (inputFunction, ...args) => composeChainLink(inputFunction,
        startingLink,
        startingDefinition.transformer,
        args,
        ...children);
}

module.exports = {
    composeChain
};
