const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file, index) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDirectory(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

function copyFiles(extensions, srcDir, distDir) {
  fs.readdirSync(srcDir).forEach((file) => {
    const srcFile = path.join(srcDir, file);
    const distFile = path.join(distDir, file);

    if (fs.statSync(srcFile).isDirectory()) {
      if (!fs.existsSync(distFile)) {
        fs.mkdirSync(distFile, { recursive: true });
      }
      copyFiles(extensions, srcFile, distFile);
    } else if (extensions.includes(path.extname(srcFile))) {
      fs.copyFileSync(srcFile, distFile);
    }
  });
}

console.log("Deleting dist directory...");
deleteDirectory("./dist");

console.log("Copying files...");
copyFiles([".html", ".json", ".png"], "./src", "./dist");

console.log("Compiling TypeScript...");
const result = execSync("tsc", { stdio: "inherit" });

console.log("Done!");
