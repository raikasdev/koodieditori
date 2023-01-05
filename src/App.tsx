import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { CodeRunner } from './python/code-runner';
import { BackendManager } from './python/backend-manager';
import { BackendEventType } from './python/backend-event';

function App() {
  const [count, setCount] = useState(0)
  const [codeRunner, setCodeRunner] = useState<CodeRunner | null>(null);
  useEffect(() => {
    if (codeRunner != null) return;
    (async () => {
      const codeRunner = new CodeRunner({});
      await codeRunner.init();
      await codeRunner.start();
      setCodeRunner(codeRunner);
      (window as any).backend = codeRunner.backend; 
      BackendManager.subscribe(BackendEventType.Output, (e) => console.log(e));
      BackendManager.subscribe(BackendEventType.Input, (e) => console.log(e));
      BackendManager.subscribe(BackendEventType.Sleep, (e) => console.log(e));
      BackendManager.subscribe(BackendEventType.Loading, (e) => console.log(e));  
      BackendManager.subscribe(BackendEventType.End, (e) => console.log(e));    
      BackendManager.subscribe(BackendEventType.Interrupt, (e) => console.log(e));
      BackendManager.subscribe(BackendEventType.Start, (e) => console.log(e));
    })();
  }, []);
  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
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
    </div>
  )
}

export default App
