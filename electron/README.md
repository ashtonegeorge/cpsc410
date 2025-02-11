# Electron Folder
This readme is a work in progress. It will be updated as the project progresses.

## Folder structure
```text
electron/
├── electron-env.d.ts
├── main.ts
└── preload.ts
```

### electron-env.d.ts
This file is used to declare types and interfaces for the Electron application. This file is used to provide type information for the Electron application and to help with type checking.

### main.ts
This file is the main entry point for the Electron application. It is responsible for creating the main window and loading the default index.html file. The main.ts file is where the Electron application starts and where the main application window is created. It is important to note that all IPC (inter-process communication) handlers are defined in the main process.

### preload.ts
This file is used to expose the IPC handlers to the renderer process. Here, the handlers defined in the main.ts file are invoked by the ipcRenderer module. From this file, we are able to fetch data from the main process and send it to the renderer process via using window.ipcRenderer.methodName().
