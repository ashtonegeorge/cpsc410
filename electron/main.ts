/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ExcelJS from 'exceljs';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.NODE_ENV === 'development' ? './dev.db' : path.join(process.resourcesPath, "./dev.db") 
const db = require('better-sqlite3')(dbPath);

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

    const pairs = [];
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
    interface GradeRow { // interface for the data we are querying from the db
        student_id: string;
        course_id: string;
        semester_name: string;
        academic_year_name: string;
        retake: number;
        final_grade: string;
    }

    // initial query, includes the verbose academic year name and semester name 
    let query = `
        SELECT g.*, s.name as semester_name, ay.name as academic_year_name
        FROM grade g
        LEFT JOIN semester s ON g.semester_id = s.id
        LEFT JOIN "academic-year" ay ON g.academic_year_id = ay.id
        WHERE 1=1
    `;    

    // if we are filtering, dynamically append those to our SQL query and add their corresponding parameters to the params array
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

    const result: GradeRow[] = db.prepare(query).all(...params); // utilize our dynamically generated query and the passed-in params
    const workbook = new ExcelJS.Workbook();
    const rawGradeSheet = workbook.addWorksheet('Raw Grades'); // create a sheet with some cols for our raw data
    rawGradeSheet!.columns = [
        { header: 'Student ID', key: 'student_id', width: 10 },
        { header: 'Course ID', key: 'course_id', width: 10 },
        { header: 'Semester ID', key: 'semester_name', width: 10 },
        { header: 'Academic Year ID', key: 'academic_year_name', width: 10 },
        { header: 'Retake', key: 'retake', width: 10 },
        { header: 'Grade', key: 'final_grade', width: 10 },
    ];
    rawGradeSheet!.addRows(result);

    const metricsSheet = workbook.addWorksheet('Metrics'); // create a sheet for our calculated data
    metricsSheet!.columns = [
        { header: 'Letter Grade', key: 'letter_grade', width: 10 },
        { header: 'Count', key: 'count', width: 10 },
        { header: 'Percentage', key: 'percentage', width: 10 },
        { header: 'Pass Rate', key: 'pass_rate', width: 10 },
        { header: 'Total Grades', key: 'total_grades', width: 10 },
    ]

    // create a dictionary for each possible grade and add our queried grades
    const gradeCounts: { [key: string]: number[] } = {
        'A+': [],
        'A': [],
        'A-': [],
        'B+': [],
        'B': [],
        'B-': [],
        'C+': [],
        'C': [],
        'C-': [],
        'D+': [],
        'D': [],
        'D-': [],
        'F': [],
    };
    result.forEach((row: GradeRow) => {
        if (Object.prototype.hasOwnProperty.call(gradeCounts, row.final_grade)) {
            gradeCounts[row.final_grade].push(Number.parseInt(row.student_id));
        }
    });

    const cpAndBelow: Set<number> = new Set([ // create a set of all student ids with C+ grade or lower and sort them
        ...gradeCounts['C+'].sort((a, b) => a - b),
        ...gradeCounts['C'].sort((a, b) => a - b),
        ...gradeCounts['C-'].sort((a, b) => a - b),
        ...gradeCounts['D+'].sort((a, b) => a - b),
        ...gradeCounts['D'].sort((a, b) => a - b),
        ...gradeCounts['D-'].sort((a, b) => a - b),
        ...gradeCounts['F'].sort((a, b) => a - b),
    ]);
    const sortedCpAndBelow = Array.from(cpAndBelow).sort((a, b) => a - b);

    // add the data we've calculated to the sheet
    metricsSheet!.addRows(Object.entries(gradeCounts).map(([letterGrade, studentIds]) => {
        const count = studentIds.length;
        return {
            letter_grade: letterGrade,
            count,
            percentage: (count / result.length) * 100,        
        }
    }));

    // add two additional columns for our single-field data
    const passRate = ((gradeCounts['A+'].length + gradeCounts['A'].length + gradeCounts['A-'].length + gradeCounts['B+'].length + gradeCounts['B'].length + gradeCounts['B-'].length + gradeCounts['C+'].length + gradeCounts['C'].length) / result.length) * 100 + "%";
    const totalGrades = result.length;

    metricsSheet!.getCell('D2').value = passRate;
    metricsSheet!.getCell('E2').value = totalGrades;

    // store the excel spreadsheet as a buffer to retain spreadsheet values
    const buffer = await workbook.xlsx.writeBuffer(); 
    return { result, sortedCpAndBelow, gradeCounts, buffer }; // return all of the important information for the front-end in an object
});

ipcMain.handle('save-grade-report', async (_event, buffer: Buffer) => {
    const { filePath } = await dialog.showSaveDialog(win!, {
        title: 'Save Grade Report',
        defaultPath: 'grade-report.xlsx',
        filters: [
            { name: 'Excel Files', extensions: ['xlsx'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!filePath) return { success: false, message: 'User cancelled the save dialog' }; 

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        await workbook.xlsx.writeFile(filePath);
        return { success: true };
    } catch (error) {
        return { success: false, message: error };
    }
});