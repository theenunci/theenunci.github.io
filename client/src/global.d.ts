export {};

interface MutationObserverMock extends MutationObserver {
  trigger(mutations: Partial<MutationRecord>[]): void;
}

declare global {
  interface Window {
    config: {
      requestURL: string;
    };
  }
}
