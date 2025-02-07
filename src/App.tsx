import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/electron-vite.animate.svg'
import './App.css'

function App() {
  // these two state variables are displayed in the UI.
  const [count, setCount] = useState(0)
  const [names, setNames] = useState<string[]>([])

  /**
   * useEffect()
   * This is a test to see if I can call the main process from the renderer process.
   * An event handler, "get-names", is defined in the main.ts file.
   * This event handler is exposed to the renderer process via the preload.ts file. The event is called in the getNames() function.
   */
  useEffect(() => {
    window.ipcRenderer.getNames().then((data: { Name: string }[]) => {
      const n = data.map((e) => e.Name);
      setNames(n);
      console.log(n);
    });
  }, []); // notice the empty array I pass as the second parameter to the useEffect hook. This is called the dependency array. The fact it is empty tells the hook to only run once, when the component is mounted (when it is rendered on the screen).

  return (
    <>
      <div>
        <a href="https://electron-vite.github.io" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div>
        <h2>A special thanks to the following team members:</h2>
        {names.map((n) => {
          return <p>{n}</p>
        })}
      </div>
    </>
  )
}

export default App
