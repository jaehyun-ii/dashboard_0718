import { StateCreator } from "zustand";

export interface PersistedState {
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const createPersistMiddleware = <T extends object>(
  name: string,
  partialize?: (state: T) => Partial<T>
) => {
  return (stateCreator: StateCreator<T>) => {
    if (typeof window === "undefined") {
      return stateCreator;
    }

    return (set: any, get: any, api: any) => {
      const store = stateCreator(set, get, api);

      try {
        const persistedData = localStorage.getItem(name);
        if (persistedData) {
          const parsed = JSON.parse(persistedData);
          const toRestore = partialize ? partialize(parsed) : parsed;
          set(toRestore);
        }
      } catch (error) {
        console.warn(`Failed to restore persisted state for ${name}:`, error);
      }

      const originalSet = set;
      api.setState = (partial: any, replace?: boolean) => {
        originalSet(partial, replace);

        try {
          const currentState = get();
          const toPersist = partialize
            ? partialize(currentState)
            : currentState;
          localStorage.setItem(name, JSON.stringify(toPersist));
        } catch (error) {
          console.warn(`Failed to persist state for ${name}:`, error);
        }
      };

      return store;
    };
  };
};

export interface DevtoolsOptions {
  name?: string;
  enabled?: boolean;
}

export const createDevtoolsMiddleware = <T extends object>(
  options: DevtoolsOptions = {}
) => {
  const { name = "store", enabled = process.env.NODE_ENV === "development" } =
    options;

  return (stateCreator: StateCreator<T>) => {
    if (
      !enabled ||
      typeof window === "undefined" ||
      !window.__REDUX_DEVTOOLS_EXTENSION__
    ) {
      return stateCreator;
    }

    return (set: any, get: any, api: any) => {
      const devtools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name });
      const store = stateCreator(set, get, api);

      devtools.init(get());

      const originalSet = set;
      api.setState = (partial: any, replace?: boolean, action?: string) => {
        originalSet(partial, replace);
        devtools.send(action || "setState", get());
      };

      devtools.subscribe((message: any) => {
        if (message.type === "DISPATCH" && message.state) {
          try {
            const newState = JSON.parse(message.state);
            set(newState, true);
          } catch (error) {
            console.warn("Failed to parse devtools state:", error);
          }
        }
      });

      return store;
    };
  };
};

export const createComposedMiddleware = <T extends object>(
  middlewares: Array<(stateCreator: StateCreator<T>) => StateCreator<T>>
) => {
  return (stateCreator: StateCreator<T>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      stateCreator
    );
  };
};

export interface LoggerOptions {
  enabled?: boolean;
  collapsed?: boolean;
  filter?: (action: string, state: any) => boolean;
}

export const createLoggerMiddleware = <T extends object>(
  options: LoggerOptions = {}
) => {
  const {
    enabled = process.env.NODE_ENV === "development",
    collapsed = true,
    filter = () => true,
  } = options;

  return (stateCreator: StateCreator<T>) => {
    if (!enabled) return stateCreator;

    return (set: any, get: any, api: any) => {
      const store = stateCreator(set, get, api);

      const originalSet = set;
      api.setState = (partial: any, replace?: boolean, action = "setState") => {
        const prevState = get();
        originalSet(partial, replace);
        const nextState = get();

        if (filter(action, nextState)) {
          const groupName = `🏪 ${action} @ ${new Date().toLocaleTimeString()}`;

          if (collapsed) {
            console.groupCollapsed(groupName);
          } else {
            console.group(groupName);
          }

          console.groupEnd();
        }
      };

      return store;
    };
  };
};

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}
