var program = require('commander')
var os = require('os')
var path = require('path')
var fs = require('fs')
var del = require('del')

program
  .version('1.0.0', '-v, --version')
  .option('-c, --chdir <path>', 'change the working directory', os.homedir())
  .option('-o, --output <path>', 'change the output directory', path.join(__dirname, 'output'))
  .option('-f, --fileType [type]', 'type of sorting files', '.png')
  .option('-r, --remove', 'remove inital folder after sorting')
  .parse(process.argv)

async function makeFolder (path) {
  fs.mkdir(path, (folder) => {
    return folder
  })
}

function getFolderOutPath (item) {
  let firstCharName = item.charAt(0).toUpperCase()
  let folderPath = path.join(program.output, firstCharName)
  makeFolder(folderPath)
  return path.join(folderPath, item)
}

function saveItem (item, localBase) {
  //  Сравниваем по типу файла
  if (path.extname(item).toUpperCase() !== program.fileType.toUpperCase()) {
    return
  }

  let outputFile = getFolderOutPath(item)
  fs.access(outputFile, () => {
    fs.createReadStream(localBase).pipe(fs.createWriteStream(outputFile))
  })
}

async function readDir (base, level) {
  fs.readdir(base, function (err, files) {
    if (err) {
      console.log(err.stack)
    }

    files.forEach((item) => {
      let localBase = path.join(base, item)

      fs.stat(localBase, (err, fileOrDir) => {
        if (err) {
          console.log(err)
        }

        if (fileOrDir.isDirectory()) {
          console.log(localBase + ' is directory')
          readDir(localBase, level + 1)
        } else {
          console.log(localBase + ' is file')
          saveItem(item, localBase)
        }
      })
    })
  })
}

async function deleteIfNeedit (folder) {
  if (program.remove) {
    del(folder, {force: true})
  }
}

async function main () {
  try {
    await makeFolder(program.output)
    await readDir(program.chdir, 0)
    await deleteIfNeedit(program.chdir)
  } catch (error) {
    console.log(error)
  }
}

main()
