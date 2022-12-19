import { useEffect, useState } from "react";
import "./App.css";
import Editor from "@monaco-editor/react";
import { initPyodide } from "pyodide-worker-runner";
import { PyodideInterface, loadPyodide } from "pyodide";

function App() {
  const [value, setValue] = useState('print("Hello World")');
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);

  useEffect(() => {
    const run = async () => {
      const newPyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full',
      });
      await newPyodide.loadPackage("https://files.pythonhosted.org/packages/d6/84/f1babce57dcccf816443b729cca4fe0a834adad71ce5bcd04168d4f4ad91/friendly-0.7.20-py3-none-any.whl");
      await initPyodide(newPyodide);
      setPyodide(newPyodide);
    };
    run();
  }, []);

  const runScript = async (code: string) => {
    if (!pyodide) return console.log('Pyodide null');
    return await pyodide.runPythonAsync(code);
  }

  return (
    <div className="App">
      <Editor
        height="100vh"
        defaultLanguage="python"
        value={value}
        onChange={(v) => setValue(v || "")}
        options={{
          minimap: {
            enabled: false
          },
          scrollBeyondLastLine: true
        }}
      />
      <div>
        <button
            onClick={async () => {
              const terminal = document.querySelector('.terminal');
              if (!terminal) return;
              terminal.innerHTML = await runScript(value)
            }}
            disabled={!pyodide}
          >
          Suorita
        </button>
        <div className="console-wrapper">
          <div className="console-prompt-margin cmd"></div>
          <div className="terminal">
            Odota hetki, Python-ympäristöä käynnistetään...
          </div>
        </div>
      </div>
    </div>
  );
}

class Execution {
  constructor(code: string) {
    return (async () => {
      await initialized;
      this._inner = await new InnerExecution(code);
      this._result = this._inner.result();
      this._validate_syntax = this._inner.validate_syntax();
      this._interrupt_buffer = await this._inner.interrupt_buffer();
      this._started = false;
      return this;
    })() as any;
  }

  start() {
    this._started = true;
    this._inner.start().schedule_async();
  }

  keyboardInterrupt() {
    this._interrupt_buffer[0] = 2;
  }

  validate_syntax() {
    return this._validate_syntax;
  }

  result() {
    return this._result;
  }

  async onStdin(callback) {
    if (this._started) {
      throw new Error(
        "Cannot set standard in callback after starting the execution."
      );
    }
    await this._inner.setStdin(Synclink.proxy(callback));
  }

  async onStdout(callback) {
    if (this._started) {
      throw new Error(
        "Cannot set standard out callback after starting the execution."
      );
    }
    await this._inner.onStdout(Synclink.proxy(callback));
  }

  async onStderr(callback) {
    if (this._started) {
      throw new Error(
        "Cannot set standard error callback after starting the execution."
      );
    }
    await this._inner.onStderr(Synclink.proxy(callback));
  }
}
(window as any).Execution = Execution;

export default App;
