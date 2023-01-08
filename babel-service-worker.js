import fs from "fs";
import { transform } from "@babel/core";
import { minify } from "uglify-js";

fs.readdir("./dist/assets", (err, files) => {
  const file = files.find((f) => f.startsWith("PythonWorker.worker"));
  const content = fs.readFileSync(`./dist/assets/${file}`, {
    encoding: "utf8",
    flag: "r",
  });
  transform(content, (err, result) => {
    //const minifyOutput = minify(result.code).code;
    fs.writeFileSync(`./dist/assets/${file}`, result.code);
  });
});

console.log("Web worker transforemed");
