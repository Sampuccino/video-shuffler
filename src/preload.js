/**
 * Refer to this link as it follows this solution for the secure-electron-template
 * https://stackoverflow.com/questions/55164360/with-contextisolation-true-is-it-possible-to-use-ipcrenderer/59675116#59675116
 * 
 */
const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["onSaveSetting", "onLoadDirectoryFiles","onUpdateFavorited"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["lastID"];
            if (validChannels.includes(channel)) {
               // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        // Get the stored directory rows from DB and pass over
        content: ipcRenderer.invoke("loadSavedDirectories"),
        files: ipcRenderer.invoke("activeFilesRequest")
    }
    
);