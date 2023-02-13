// index.ts
/**
 * This typescript file contains the Electron app which renders the React app.
 */

import { BrowserWindow, app, globalShortcut, ipcMain, dialog, clipboard } from "electron";
import path from "path";

import { accessSync, constants } from "fs";
import { OpenDialogOptions } from "electron/common";

/**
 * VERSION and COMMITHASH are set by the git-revision-webpack-plugin module.
 */
declare var VERSION: string;
declare var COMMITHASH: string;

const doesFileExist = (filename: string): boolean => {
  try {
    accessSync(filename, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

app.on("ready", () => {
  var iconPath = path.join("static", "icon.png");
  const bundledIconPath = path.join(process.resourcesPath, "..", "static", "icon.png");

  if (doesFileExist(bundledIconPath)) {
    iconPath = bundledIconPath;
  }

  const title = `${app.getName()} ${VERSION}-${COMMITHASH}`;

  /**
   * Create the window in which to render the React app
   */
  const window = new BrowserWindow({
    width: 950,
    height: 750,
    icon: iconPath,
    title: title,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  /**
   * Hide the default menu bar that comes with the browser window
   */
  window.setMenuBarVisibility(false);

  /**
   * Set the Permission Request Handler to deny all permissions requests
   */
  window.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    return callback(false);
  });

  /**
   * This logic closes the application when the window is closed, explicitly.
   * On MacOS this is not a default feature.
   */
  ipcMain.on('close', (evt, arg) => {
    app.quit();
  })

  /**
   * Provides the renderer a way to call the dialog.showOpenDialog function using IPC.
   */
  ipcMain.handle('showOpenDialog', async (event, options) => {
    return await dialog.showOpenDialog(<OpenDialogOptions> options);
  });

  /**
   * Load the react app
   */
  window.loadURL(`file://${__dirname}/../react/index.html`);
});

app.on('will-quit', () => {
  /**
   * Clear clipboard on quit to avoid access to any mnemonic or password that was copied during
   * application use.
   */
  clipboard.clear();
})
