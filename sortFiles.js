var program = require('commander');
var os = require('os');
var path = require('path');
var fs = require("fs")

program
  .version('1.0.0', '-v, --version')
  .option('-c, --chdir <path>', 'change the working directory', os.homedir())
  .option('-o, --output <path>', 'change the output directory', path.join(__dirname,"output"))
  .option('-f, --fileType [type]', 'type of sorting files',".png")
  .option('-r, --remove','remove inital folder after sorting')
  .parse(process.argv);


//Создаём папку вывода:
fs.existsSync(program.output) || fs.mkdirSync(program.output)


const readDir = (base, level) => {
  const files = fs.readdirSync(base)

  files.forEach((item) => {
    let localBase = path.join(base, item)
    let state = fs.statSync(localBase)

    if (!state.isDirectory()){
      saveItem(item, localBase)
    }

    else{
      readDir(localBase, level + 1)

    }

  })

  removeFileOrDirectory(base)

}

function removeFileOrDirectory(fileOrDir){

  if (!program.remove){return}

  if (fs.statSync(fileOrDir).isDirectory()){
    fs.rmdirSync(fileOrDir)
  }

  else{
    fs.unlinkSync(fileOrDir)
  }
}

function saveItem(item, localBase){

  //Сравниваем по типу файла.

  if (path.extname(item).toUpperCase() !== program.fileType.toUpperCase()) {
    removeFileOrDirectory(localBase)
    return
  }

  let outputFile = getFolderOutPath(item)

  if (fs.existsSync(outputFile)){
    console.log("Файл уже скопирован: "+outputFile);
  }

  else {
    console.log(localBase);
    fs.createReadStream(localBase).pipe(fs.createWriteStream(outputFile));

  }

  removeFileOrDirectory(localBase)


}


function getFolderOutPath(item) {
  let firstCharName = item.charAt(0).toUpperCase()
  let folderPath = path.join(program.output,  firstCharName)

  //Create if no folder:
  fs.existsSync(folderPath) || fs.mkdirSync(folderPath)
  return path.join(folderPath, item)
}


readDir(program.chdir, 0)
removeFileOrDirectory(program.chdir)
