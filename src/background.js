'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const path = require('path')
const fs = require('fs')
// SQLite
const sqlite3 = require('sqlite3').verbose();

const isDevelopment = process.env.NODE_ENV !== 'production'

// open the database
const db_path = path.resolve('src/database', 'shuffle.db');
// File sync path
const files_path = path.resolve('src/database', 'files.json');
// Establish connection
let db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
// 1.5
let win;
async function createWindow() {
  // Create the browser window.
   win = new BrowserWindow({
    minWidth: 1200,
    // maxWidth: 1200,
    minHeight: 800,
    // maxHeight: 800,
    frame: true,
    fullscreenable: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false, // False means we can load local system files trough file://
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.setMenuBarVisibility(false)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development 
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      db.close()
      app.quit()
    })
  }
}

ipcMain.on('onSaveSetting', (event, args) => {
  
  // Check DB to see if thee Directory already exists
  const sql = 'SELECT * FROM settings where filepath = ?';

  // Files and recursive directory reading function in case its a new directory that doesnt exist.
  let Files = [];

  function ThroughDirectory(Directory) {
    fs.readdirSync(Directory).forEach(File => {
        const Absolute = path.join(Directory, File);
        if (fs.statSync(Absolute).isDirectory()) return ThroughDirectory(Absolute);
        else return Files.push(Absolute);
    });
  }


  db.get(sql, args.path, (err, row) => {
  if (err) {
    return console.error(err.message);
  }
    
    if (!row) {
      db.run('INSERT INTO settings(directory, filepath) VALUES(?, ?)', [args.directory, args.path], function(err) {
        if(err) {
          return console.log(err.message); 
        }

        // Send the ID to the API for saving path
        win.send("lastID", this.lastID)

        // Recursively build the files from directories and subdirectories
        ThroughDirectory(args.path);

        // Bulk insert filepaths
        Files.forEach(file => {
          const split_filepath = file.split("/");
          const filename = split_filepath[split_filepath.length - 1]
          db.run('INSERT INTO ` media `(directory, filepath, filename, settings_id) VALUES(?, ?, ?, ?)', [args.directory, file, filename, this.lastID], (err) => {
            if(err) {
              return console.log(err.message); 
            }
            // record inserted correctly
          })

        })

      })
    }

});

})


ipcMain.handle("loadSavedDirectories", async () => {
  const sql = 'SELECT * FROM settings';
      return new Promise((resolve, reject) => {

        db.all(sql, [], (err, rows) => {
            if(err) {
                // case error
                reject(err);
            }
            // "return" the result when the action finish
            resolve(rows);
        })

    })
});

/**
 * ******************************************
 * UPDATE THE DROPDOWN WHEN A NEW OPTION IS ADDED
 * CURRENTLY IT IS NOT UPDATED
 * ******************************************
 */
ipcMain.on("onLoadDirectoryFiles", (event, args) => {
  let sql = 'SELECT * FROM ` media `';
  if (args[0] === "EVERYTHING") {
    db.all(sql, (err, rows) => {
      if(err) {
        // case error
        console.error(err);
      }
      // active_files = rows;
        fs.writeFile(files_path, JSON.stringify(rows), err => {
        if (err) {
          console.error(err)
          return
        }
        //file written successfully
    })
  })  
  } else {
    // Build the SQL query based on the amount of items in the args[0] argueement
    args.forEach((arg, index) => {
      (index === 0)? sql += ' where settings_id = ?': sql += ' OR settings_id = ?'
    })
    db.all(sql, [...args], (err, rows) => {
      if(err) {
        // case error
        console.error(err);
      }
        fs.writeFile(files_path, JSON.stringify(rows), err => {
        if (err) {
          console.error(err)
          return
        }
        //file written successfully
      })
    })
  }

})

ipcMain.handle('activeFilesRequest', () => {
  return JSON.parse(fs.readFileSync(files_path))
})

async function readAndWriteFile(path, m_id, favorited) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
          reject(err);
        }

        // Update item and write back to file!
        let fileArr = JSON.parse(data);
        const foundIndex = fileArr.findIndex((obj => obj.media_id === m_id));
        fileArr[foundIndex].favorited = favorited

        // Write file
        fs.writeFile(files_path, JSON.stringify(fileArr), err => {
            if (err) {
              console.error(err)
              return
            }
            //file written successfully
        })
        resolve(data);
      });
    });
  }

ipcMain.on("onUpdateFavorited", async (event, args) => {
  const sql = 'UPDATE ` media ` SET favorited = ? where media_id = ?';
  db.run(sql, [args.favorited, args.id], function(err) {
  if (err) {
    return console.error(err.message);
  }
  });
  await readAndWriteFile(files_path, args.id, args.favorited);
})

ipcMain.on('onDeleteSources', (event, args) => {
    let media_sql = 'DELETE from ` media `';
  let settings_sql = 'DELETE from settings';
  // Loop over an add more arguements if needed
  args.forEach((e, index) => {

    if (index === 0) {
    media_sql += ' WHERE settings_id = ?'
      settings_sql += ' WHERE settings_id = ?'
    } else {
          media_sql += ' OR settings_id = ?'
      settings_sql += ' OR settings_id = ?'
      }
  })

  // Delete MEDIA before SETTINGS
  db.run(media_sql, args, (err) => {
    if(err) {
      return console.log(err.message); 
    }
    // record inserted correctly
  })

  db.run(settings_sql, args, (err) => {
    if(err) {
      return console.log(err.message); 
    }
    // record inserted correctly
  })
})