import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";

function App() {
  const [value, setValue] = useState('print("Hello World")');

  return (
    <div className="App">
      <Editor
        height="100vh"
        defaultLanguage="python"
        value={value}
        onChange={(v) => setValue(v || "")}
      />
      <div>
        <button
          onClick={() => {
            const container = document.getElementById("code_container");
            if (!container) return;
            container.innerText = value;
            brython();
          }}
        >
          Suorita
        </button>
      </div>
    </div>
  );
}

export default App;
