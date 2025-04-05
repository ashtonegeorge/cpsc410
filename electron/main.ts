import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ExcelJS from 'exceljs';
import fs from 'fs';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devMode = process.env.NODE_ENV === 'development';
const dbPath = devMode ? './dev.db' : path.join(process.resourcesPath, "./dev.db") 
const db = require('better-sqlite3')(dbPath);

// const ort = require('onnxruntime-node');

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
ipcMain.handle('create-course', async (_event, courseCode: string, courseName: string) => {
    const result = db.prepare('INSERT INTO course (id, name) VALUES (?, ?)').run(courseCode, courseName);
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

ipcMain.handle('create-guest-lecturer', async (_event, guestFName, guestLName) => {
    const result = db.prepare('INSERT INTO "guest-lecturer" (fname, lname) VALUES (?, ?)').run(guestFName, guestLName);
    return result;
});

ipcMain.handle('read-guest-lecturers', async () => {
    const result = db.prepare('SELECT * FROM "guest-lecturer"').all();
    return result;
});

ipcMain.handle('update-guest-lecturer', async (_event, guestId, guestFName, guestLName) => {
    const result = db.prepare('UPDATE "guest-lecturer" SET fname = ? AND SET lname = ? WHERE id = ?').run(guestFName, guestLName, guestId);
    return result;
});

ipcMain.handle('delete-guest-lecturer', async (_event, guestId) => {
    const result = db.prepare('DELETE FROM "guest-lecturer" WHERE id = ?').run(guestId);
    return result;
});

ipcMain.handle('import-guest-evaluation', async (_event, guestId: string, courseId: string, semesterId: string, academicYearId: string, evalQuestions: {questionText: string; likertAnswers: number[]; likertAverage: number; openResponses: string[];}[]) => {
    const guestResult = db.prepare('INSERT INTO "guest-evaluation" (guest_id, course_id, semester_id, academic_year_id) VALUES (?, ?, ?, ?)').run(guestId, courseId, semesterId, academicYearId);
    const guestEvalId = guestResult.lastInsertRowid;

    evalQuestions.forEach((q) => {
        const type = q.likertAnswers.length > 0 ? "likert" : "open";

        const questionResult = db.prepare('INSERT INTO question (question_text, type) VALUES (?, ?)').run(q.questionText, type);
        const questionId = questionResult.lastInsertRowid;

        db.prepare('INSERT INTO answer (guest_evaluation_id, question_id, answer_text) VALUES (?, ?, ?)')
            .run(guestEvalId, questionId, type === "likert" ? q.likertAverage : q.openResponses.join('|'));
    });
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

/**
 * ipcMain.handle('read-guest-eval-file'...)
 * This event handler is used in the preload.ts file to read a guest speaker evaluation survey spreadsheet file.
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.readSpreadsheetFile() in the ImportGuestEval.tsx file.
 * @param filePath
 * @returns rows
 */
ipcMain.handle('read-guest-eval-file', async (_event, filePath) => {
    interface EvalQuestion {
        questionText: string;
        likertAnswers: number[];
        likertAverage: number;
        openResponses: string[];
    }

    // create an excel instance, retrieve the file extension, and specify desired columns
    const workbook = new ExcelJS.Workbook(); 
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.xlsx') { // if the file is an xlsx file, read the file
        await workbook.xlsx.readFile(filePath);
    } else if (ext === '.csv') { // if the file is a csv file, convert it to a filestream first
        const fileStream = fs.createReadStream(filePath);
        await workbook.csv.read(fileStream);
    } else { // throw if invalid file format
        throw new Error('Unsupported file format');
    }

    const sheet: ExcelJS.Worksheet = workbook.getWorksheet(1)!;

    // start and end columns for questions, initialized to 1 by default
    let start = 1;
    let end = 1;

    // find the start and end from the first row
    sheet.getRow(1).eachCell((c, i) => {
        if(c.value?.toString() === "attempt") { start = i+1; } // the column after the attempt column is the first question
        else if(c.value?.toString() === "n correct") { // the column before the n correct column is the last question
            end = i-1; 
            return;
        }
    });

    // for every column between the start and end values, collect every survey response and average them
    const questions: EvalQuestion[] = [];
    const questionCols: ExcelJS.Column[] = [];
    for(let i = start; i<=end; i++) {
        questionCols.push(sheet.getColumn(i));
    }
    questionCols.forEach((col) => {
        let qText: string;
        const likertAnswers: number[] = [];
        const openResponses: string[] = [];
        if(!(col.values[1]?.toString() === "0")) {
            qText = col.values[1]!.toString();
            col.values.map((cell) => {
                switch(cell?.toString()) {
                    case "Strongly Agree":
                        likertAnswers.push(5);
                        break;
                    case "Agree":
                        likertAnswers.push(4);
                        break;
                    case "Neutral":
                        likertAnswers.push(3);
                        break;
                    case "Disagree":
                        likertAnswers.push(2);
                        break;
                    case "Strongly Disagree":
                        likertAnswers.push(1);
                        break;
                    default:
                        if(cell!.toString() !== qText) openResponses.push(cell!.toString());
                }
            })
            const avg = (likertAnswers.reduce((p, v) => p + v, 0)) / likertAnswers.length;
            const q: EvalQuestion = {
                questionText: qText,
                likertAnswers: likertAnswers,
                likertAverage: avg,
                openResponses: openResponses
            }
            questions.push(q);
        }  
    })
    return questions;
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

ipcMain.handle('create-academic-year', async (_event, ayearName) => {
    const result = db.prepare('INSERT INTO "academic-year" (name) VALUES (?)').run(ayearName);
    return result;
});

ipcMain.handle('update-academic-year', async (_event, ayearName, ayearId) => {
    const result = db.prepare('UPDATE "academic-year" SET name = ? WHERE id = ?').run(ayearName, ayearId);
    return result;
});

ipcMain.handle('delete-academic-year', async (_event, ayearId) => {
    const result = db.prepare('DELETE FROM "academic-year" WHERE id = ?').run(ayearId);
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
        { header: 'Students w/ C+ and Below', key: 'cpAndBelow', width: 10 },
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
    
    metricsSheet!.addRows(Object.entries(gradeCounts).map(([letterGrade, studentIds]) => {
        const count = studentIds.length;
        return {
            letter_grade: letterGrade,
            count,
            percentage: (count / result.length) * 100,        
        }
    }));

    const cpAndBelowArr = Array.from(cpAndBelow); 
    metricsSheet!.getColumn(6).values = ['Students w/ C+ and Below', ...cpAndBelowArr];

    // add two additional columns for our single-field data
    const passRate = ((gradeCounts['A+'].length + gradeCounts['A'].length + gradeCounts['A-'].length + gradeCounts['B+'].length + gradeCounts['B'].length + gradeCounts['B-'].length + gradeCounts['C+'].length + gradeCounts['C'].length) / result.length) * 100 + "%";
    const totalGrades = result.length;

    metricsSheet!.getCell('D2').value = passRate;
    metricsSheet!.getCell('E2').value = totalGrades;

    // store the excel spreadsheet as a buffer to retain spreadsheet values
    const buffer = await workbook.xlsx.writeBuffer(); 
    return { result, sortedCpAndBelow, gradeCounts, buffer }; // return all of the important information for the front-end in an object
});

ipcMain.handle('generate-guest-report', async (_event, guestId, courseId, semesterId, academicYearId) => {
    // initial query, includes the verbose academic year name and semester name 
    let query = `SELECT * FROM "guest-evaluation" WHERE 1=1`;    

    // if we are filtering, dynamically append those to our SQL query and add their corresponding parameters to the params array
    const params = [];
    if (guestId !== '*') {
        query += ' AND guest_id = ?';
        params.push(guestId);
    }
    if (courseId !== '*') {
        query += ' AND course_id = ?';
        params.push(courseId);
    }
    if (academicYearId !== '*') {
        query += ' AND academic_year_id = ?';
        params.push(academicYearId);
    }
    if (academicYearId !== '*') {
        query += ' AND semester_id = ?';
        params.push(semesterId);
    }

    // const tokenizer = await transformers.AutoTokenizer.from_pretrained(env.localModelPath);
    // const model = await transformers.AutoModelForSequenceClassification.from_pretrained(env.localModelPath);
    // const session = await ort.InferenceSession.create('./src/models/')

    // get the id of the guest-evaluation
    const ge: {id: string, guest_id: string, semester_id: string, academic_year_id: string}[] = db.prepare(query).all(...params);
    const answers: {id: string, guest_evaluation_id: string, course_evaluation_id: string, question_id: string, answer_text: string}[] = db.prepare('SELECT * FROM answer WHERE guest_evaluation_id = ?').all(ge[0].id);
    const questionAndAnswer: [string, string | { count: number, keywords: string[], responses: string[], summary: string, topic: string }[]][] = []; 

    try {
        for (const a of answers) {
            const q = db.prepare('SELECT * FROM question WHERE id = ?').get(a.question_id);
    
            if (q.type === "likert") {
                questionAndAnswer.push([q.question_text, a.answer_text]);
            } else if (q.type === "open") {
                const res = await thematic_analysis(a.answer_text) as { count: number, keywords: string[], responses: string[], summary: string, topic: string }[];
                questionAndAnswer.push([q.question_text, res])
            }
        }
    } catch(e) {
        return e;
    }

    return questionAndAnswer;
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

function thematic_analysis(inputText: string) {
    return new Promise((resolve, reject) => {
        const scriptPath = devMode
            ? './src/utils/analyze_responses.py'
            : path.join(process.resourcesPath, './src/utils/analyze_responses.py');

        const pythonPath = process.env.NODE_ENV === 'development'
            ? 'python'
            : path.join(process.resourcesPath, 'venv', 'Scripts', 'python.exe');
        const pythonProcess = spawn(pythonPath, [scriptPath]);

        let data = '';
        let error = '';

        pythonProcess.stdout.on('data', (chunk) => {
            data += chunk;
        });

        pythonProcess.stderr.on('data', (chunk) => {
            error += chunk.toString();
            console.error('Python STDERR:', chunk.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const result: { count: number, keywords: string[], responses: string[], summary: string, topic: string }[] = JSON.parse(data);
                    resolve(result);
                } catch (err) {
                    reject(`Error parsing JSON output: ${(err as Error).message}`);
                }
            } else {
                reject(`Python script failed with code ${code}: ${error}`);
            }
        });

        // Send input to stdin
        pythonProcess.stdin.write(inputText);
        pythonProcess.stdin.end();
    });
}
