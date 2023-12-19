const fs = require("fs");
const path = require("path");

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

function copyHtmlFiles(srcDir, distDir) {
  fs.readdirSync(srcDir).forEach((file) => {
    const srcFile = path.join(srcDir, file);
    const distFile = path.join(distDir, file);

    if (fs.statSync(srcFile).isDirectory()) {
      if (!fs.existsSync(distFile)) {
        fs.mkdirSync(distFile);
      }
      copyHtmlFiles(srcFile, distFile);
    } else if (path.extname(srcFile) === ".html") {
      fs.copyFileSync(srcFile, distFile);
    }
  });
}

deleteDirectory("./dist");
copyHtmlFiles("./src", "./dist");
