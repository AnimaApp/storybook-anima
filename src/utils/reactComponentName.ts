import type {ReactElement} from "react";
import {
  ForwardRef,
  isContextConsumer,
  isContextProvider,
  isForwardRef,
  isLazy,
  isMemo,
  isProfiler,
  isStrictMode,
  isSuspense,
  Memo,
} from 'react-is';

// heavily inspired by 
// https://github.com/algolia/react-element-to-jsx-string/blob/bf7f4cf8d31494997b9d5f36f238286d67cd6ae1/src/parser/parseReactElement.js#L3-L76
// which is heavily inspired by:
// https://github.com/facebook/react/blob/3746eaf985dd92f8aa5f5658941d07b6b855e9d9/packages/react-devtools-shared/src/backend/renderer.js#L399-L496


const getFunctionTypeName = (functionType): string => {
  if (!functionType.name || functionType.name === "_default") {
    return "No Display Name";
  }

  return functionType.name;
};

const getWrappedComponentDisplayName = (Component: any): string => {
  switch (true) {
    case Boolean(Component.displayName):
      return Component.displayName;

    case Component.$$typeof === Memo:
      return getWrappedComponentDisplayName(Component.type);

    case Component.$$typeof === ForwardRef:
      return getWrappedComponentDisplayName(Component.render);

    default:
      return getFunctionTypeName(Component);
  }
};

export const getReactElementDisplayName = (element: ReactElement<any>): string => {
  switch (true) {
    case typeof element.type === "string":
      // @ts-ignore
      return element.type;

    case typeof element.type === "function":
      // @ts-ignore
      if (element.type.displayName) {
        // @ts-ignore
        return element.type.displayName;
      }

      return getFunctionTypeName(element.type);

    case isForwardRef(element):
    case isMemo(element):
      return getWrappedComponentDisplayName(element.type);

    case isContextConsumer(element):
      // @ts-ignore
      return `${element.type._context.displayName || "Context"}.Consumer`;

    case isContextProvider(element):
      // @ts-ignore
      return `${element.type._context.displayName || "Context"}.Provider`;

    case isLazy(element):
      return "Lazy";

    case isProfiler(element):
      return "Profiler";

    case isStrictMode(element):
      return "StrictMode";

    case isSuspense(element):
      return "Suspense";

    default:
      return "UnknownElementType";
  }
};
