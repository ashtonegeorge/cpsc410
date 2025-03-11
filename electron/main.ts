/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ExcelJS from 'exceljs';
import fs from 'fs';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// const db = require('better-sqlite3')('test.db');
const db = require('better-sqlite3')('dev.db');

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
      width: 1200,
      height: 900,
      autoHideMenuBar: true,
      icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
      webPreferences: {
          preload: path.join(__dirname, 'preload.mjs'),
      },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
      win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL)
  } else {
      // win.loadFile('dist/index.html')
      win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
  win.webContents.openDevTools();
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
})

app.whenReady().then(createWindow)

/**
 * ipcMain.handle('get-names'...)
 * This event handler is used in the preload.ts file to call the sqlite db. 
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.getNames() in the App.tsx file.
 */
// ipcMain.handle('get-names', async () => {
//   const result = db.prepare('SELECT * FROM test').all();
//   return result;
// });

/**
 * ipcMain.handle('create-course'...)
 * This event handler is used in the preload.ts file to call the sqlite db.
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.createCourse() in the Courses.tsx file.
 * @param courseName
 * @returns course sqlite objects
 */
ipcMain.handle('create-course', async (_event, courseName) => {
    const result = db.prepare('INSERT INTO course (name) VALUES (?)').run(courseName);
    return result;
});

/**
 * ipcMain.handle('read-courses'...)
 * This event handler is used in the preload.ts file to call the sqlite db.
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.readCourses() in the Courses.tsx file.
 * @returns course sqlite objects
 */
ipcMain.handle('read-courses', async () => {
    const result = db.prepare("SELECT * FROM course WHERE id IS NOT NULL AND name IS NOT NULL AND name is not ''").all();
    return result;
});

/**
 * ipcMain.handle('read-course'...)
 * This event handler is used in the preload.ts file to call the sqlite db.
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.readCourse() in the Courses.tsx file.
 * @param courseId
 * @returns a single course sqlite object
 */
ipcMain.handle('read-course', async (_event, courseId) => {
    const result = db.prepare('SELECT * FROM course WHERE id = ?').all(courseId);
    return result;
});

/**
 * ipcMain.handle('update-course'...)
 * This event handler is used in the preload.ts file to call the sqlite db.
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.updateCourse() in the Courses.tsx file.
 * @param courseId
 * @param courseName
 * @returns course sqlite objects
 */
ipcMain.handle('update-course', async (_event, courseId, courseName) => {
    const result = db.prepare('UPDATE course SET name = ? WHERE id = ?').run(courseName, courseId);
    return result;
});

/**
 * ipcMain.handle('delete-course'...)
 * This event handler is used in the preload.ts file to call the sqlite db.
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.deleteCourse() in the Courses.tsx file.
 * @param courseId
 * @returns course sqlite objects
 */
ipcMain.handle('delete-course', async (_event, courseId) => {
    const result = db.prepare('DELETE FROM course WHERE id = ?').run(courseId);
    return result;
});

/**
 * ipcMain.handle('read-grade-file'...)
 * This event handler is used in the preload.ts file to read a canvas grade file.
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.readSpreadsheetFile() in the ImportGrades.tsx file.
 * @param filePath
 * @returns rows
 */
ipcMain.handle('read-grade-file', async (_event, filePath) => {
    // create an excel instance, retrieve the file extension, and specify desired columns
    const workbook = new ExcelJS.Workbook(); 
    const ext = path.extname(filePath).toLowerCase();
    const idCol = 2;
    const gradeCol = 60;


    if (ext === '.xlsx') { // if the file is an xlsx file, read the file
        await workbook.xlsx.readFile(filePath);
    } else if (ext === '.csv') { // if the file is a csv file, convert it to a filestream first
        const fileStream = fs.createReadStream(filePath);
        await workbook.csv.read(fileStream);
    } else { // throw if invalid file format
        throw new Error('Unsupported file format');
    }

    const worksheet = workbook.worksheets[0]; // grab the first worksheet, as the grade workbooks only have one

    let pairs = [];
    // for each row in the worksheet, extract the student's id and grade
    for(let i = 0; i<worksheet.getSheetValues().length; i++) {
        const row = worksheet.getRow(i);
        const id = row.getCell(idCol).value;
        const grade = row.getCell(gradeCol).value;
        if(id && grade && grade.toString().length == 2 && Number.parseInt(id.toString())) { // if the id and grade are valid, push them to the pairs array
            pairs.push([id, grade]);
        }
    }
    return pairs;
});

ipcMain.handle('import-grades', async (_event, studentId, courseId, semesterId, academicYearId, isRetake, grade) => {
    const result = db.prepare('INSERT INTO grade (student_id, course_id, semester_id, academic_year_id, retake, final_grade) VALUES (?, ?, ?, ?, ?, ?)').run(studentId, courseId, semesterId, academicYearId, isRetake, grade);
    return result;
})

ipcMain.handle('read-semesters', async () => {
    const result = db.prepare('SELECT * FROM semester').all();
    return result;
});

ipcMain.handle('read-academic-years', async () => {
    const result = db.prepare('SELECT * FROM "academic-year"').all();
    return result;
});