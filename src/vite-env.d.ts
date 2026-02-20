/// <reference types="vite/client" />

declare namespace chrome {
  export namespace sidePanel {
    export interface OpenOptions {
      windowId?: number;
      tabId?: number;
    }
    
    export function open(options: OpenOptions, callback?: () => void): Promise<void>;
    export function setOptions(options: any, callback?: () => void): Promise<void>;
    export function getOptions(options: any, callback?: (options: any) => void): Promise<void>;
    export function setPanelBehavior(behavior: any, callback?: () => void): Promise<void>;
    export function getPanelBehavior(callback: (behavior: any) => void): Promise<void>;
  }
}
