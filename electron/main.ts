/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'os'
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

ipcMain.handle('generate-grade-report', async (_event, studentId, courseId, academicYearId) => {
    interface GradeRow {
        student_id: string;
        course_id: string;
        semester_name: string;
        academic_year_name: string;
        retake: number;
        final_grade: string;
    }

    let query = `
        SELECT g.*, s.name as semester_name, ay.name as academic_year_name
        FROM grade g
        LEFT JOIN semester s ON g.semester_id = s.id
        LEFT JOIN "academic-year" ay ON g.academic_year_id = ay.id
        WHERE 1=1
    `;    

    const params = [];

    if (studentId !== '*') {
        query += ' AND student_id = ?';
        params.push(studentId);
    }
    if (courseId !== '*') {
        query += ' AND course_id = ?';
        params.push(courseId);
    }
    if (academicYearId !== '*') {
        query += ' AND academic_year_id = ?';
        params.push(academicYearId);
    }

    const result = db.prepare(query).all(...params);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('grade-template.xlsx');
    const rawGradeSheet = workbook.getWorksheet('Raw Grades');
    rawGradeSheet!.columns = [
        { header: 'Student ID', key: 'student_id', width: 10 },
        { header: 'Course ID', key: 'course_id', width: 10 },
        { header: 'Semester ID', key: 'semester_name', width: 10 },
        { header: 'Academic Year ID', key: 'academic_year_name', width: 10 },
        { header: 'Retake', key: 'retake', width: 10 },
        { header: 'Grade', key: 'final_grade', width: 10 },
    ];
    rawGradeSheet!.addRows(result);

    const metricsSheet = workbook.getWorksheet('Metrics');
    metricsSheet!.columns = [
        { header: 'Letter Grade', key: 'letter_grade', width: 10 },
        { header: 'Count', key: 'count', width: 10 },
        { header: 'Percentage', key: 'percentage', width: 10 },
        { header: 'Pass Rate', key: 'pass_rate', width: 10 },
        { header: 'Total Grades', key: 'total_grades', width: 10 },
    ]

    const gradeCounts: { [key: string]: number } = {
        'A+': 0,
        'A': 0,
        'A-': 0,
        'B+': 0,
        'B': 0,
        'B-': 0,
        'C+': 0,
        'C': 0,
        'C-': 0,
        'D+': 0,
        'D': 0,
        'D-': 0,
        'F': 0,
    };
    result.forEach((row: GradeRow) => {
        if (gradeCounts.hasOwnProperty(row.final_grade)) {
            gradeCounts[row.final_grade]++;
        }
    });

    metricsSheet!.addRows(Object.entries(gradeCounts).map(([letterGrade, count]) => {
        return {
            letter_grade: letterGrade,
            count,
            percentage: count / result.length,
        }
    }));

    const passRate = ((gradeCounts['A+'] + gradeCounts['A'] + gradeCounts['A-'] + gradeCounts['B+'] + gradeCounts['B'] + gradeCounts['B-'] + gradeCounts['C+'] + gradeCounts['C']) / result.length) * 100 + "%";
    const totalGrades = result.length;

    metricsSheet!.getCell('D2').value = passRate;
    metricsSheet!.getCell('E2').value = totalGrades;

    const downloadsFolder = path.join(os.homedir(), 'Downloads');
    const filePath = path.join(downloadsFolder, 'grade-report.xlsx');
    const uniqueFilePath = getUniqueFilePath(filePath);
    await workbook.xlsx.writeFile(uniqueFilePath);
    return result;
});

function getUniqueFilePath(filePath: string): string {
    let uniqueFilePath = filePath;
    let counter = 1;

    while (fs.existsSync(uniqueFilePath)) {
        const parsedPath = path.parse(filePath);
        uniqueFilePath = path.join(parsedPath.dir, `${parsedPath.name} (copy${counter > 1 ? ` ${counter}` : ''})${parsedPath.ext}`);
        counter++;
    }

    return uniqueFilePath;
}