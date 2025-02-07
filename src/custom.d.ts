import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    ipcRenderer: IpcRenderer & {
      getNames: () => Promise<string[]>;
    };
  }
}