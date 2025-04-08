# Source Folder
This readme is a work in progress. It will be updated as the project progresses.

## Folder structure
```text
src/
├── assets/
├── components/
├── pages/
├── App.css
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

### assets
The assets folder contains assets such as images and icons that are imported into the project as needed.

### components
The components folder contains various React components that are reused throughout the application.

### pages
The pages folder contains all of the pages (window sized components) within the application.

### utils
This folder is a container for miscellaneous scripts, however it primarily contains python scripts to accomplish thematic analysis via node child processes.

### App.css
App.css is a CSS file that contains the styles for the App component. Notice how they are imported at the top of the App.tsx file. 

### App.tsx
App.tsx is the main component of the application. It is responsible for rendering the other components and managing the state of the application. The App component is a functional component that uses hooks to manage state and side effects.

### index.css
index.css is a CSS file that contains the global styles for the application. It is imported into the main.tsx file to apply the styles to the entire application.

### main.tsx
main.tsx is the root of the application UI. It is responsible for rendering the App component and mounting it to the DOM (document object model). App.tsx is imported into the main.tsx file and rendered inside the root element of the HTML file.

### vite-env.d.ts
vite-env.d.ts is a TypeScript declaration file that is used to declare types and interfaces for the Vite development server. This file is used to provide type information for the Vite development server and to help with type checking.
