import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ExcelJS from 'exceljs';
import fs from 'fs';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { getStemmedFreqMap, cosineSimilarity } from '../src/utils/frequency.ts';

dotenv.config();

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devMode = process.env.NODE_ENV === 'development';
const dbPath = devMode ? './dev.db' : path.join(process.resourcesPath, "./dev.db") 
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
      icon: path.join(process.env.VITE_PUBLIC, 'redflash.png'),
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
//   win.webContents.openDevTools();
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
    const result = db.prepare('UPDATE "guest-lecturer" SET fname = ?, lname = ? WHERE id = ?').run(guestFName, guestLName, guestId);
    return result;
});

ipcMain.handle('delete-guest-lecturer', async (_event, guestId) => {
    const result = db.prepare('DELETE FROM "guest-lecturer" WHERE id = ?').run(guestId);
    return result;
});

ipcMain.handle('import-guest-evaluation', async (_event, guestId: string, courseId: string, semesterId: string, academicYearId: string, evalQuestions: {questionText: string; likertAnswers: number[]; likertAverage: number; openResponses: string[];}[]) => {
    const existingGuestEvaluation = db.prepare('SELECT * FROM "guest-evaluation" WHERE guest_id = ? AND course_id = ? AND semester_id = ? AND academic_year_id = ?').all(guestId, courseId, semesterId, academicYearId);

    if(existingGuestEvaluation !== null && existingGuestEvaluation !== undefined && existingGuestEvaluation.length > 0) {
        return { success: false, message:"Already imported guest evaluation with selected fields. If necessary, please delete it and try again." };
    }

    const guestResult = db.prepare('INSERT INTO "guest-evaluation" (guest_id, course_id, semester_id, academic_year_id) VALUES (?, ?, ?, ?)').run(guestId, courseId, semesterId, academicYearId);
    const guestEvalId = guestResult.lastInsertRowid;
    const existingQuestions = await db.prepare('SELECT * FROM question WHERE category = ?').all('guest');

    evalQuestions.forEach(async (q) => {
        const type = q.likertAnswers.length > 0 ? "likert" : "open";
        const formattedQuestion = q.questionText.replace(new RegExp("^.*?: \s*|\s+$"), "");
        const freq_map = getStemmedFreqMap(q.questionText);

        let questionId = null;
        if(existingQuestions !== undefined && existingQuestions !== null && existingQuestions.length !== 0) { // if there are questions in the db
            let targetQuestion: [number, number] | undefined;
            for(const existingQuestion of existingQuestions) {
                let existingFreqMap: Map<string, number>;
                let hasFreqMap = existingQuestion.freq_map !== null && existingQuestion.freq_map !== undefined && existingQuestion.freq_map !== ''; // if the map in the db isn't set
                if( hasFreqMap ) { // if the map exists convert it
                    const rawMap = JSON.parse(existingQuestion.freq_map);
                    existingFreqMap = new Map(Object.entries(rawMap));
                    if (existingFreqMap.size === 0) { // if the map we generated still doesn't have any entries then we should generate a new one
                        hasFreqMap = false;
                    }
                }

                if( hasFreqMap === false ) { // create a new frequency map and set it in the db
                    existingFreqMap = getStemmedFreqMap(existingQuestion.question_text);
                    await db.prepare('UPDATE "question" SET freq_map = ? WHERE id = ?').run(JSON.stringify(Object.fromEntries(existingFreqMap)), existingQuestion.id);
                }

                // if for some reason we still can't get it we just skip this question candidate
                if(existingFreqMap! === null || freq_map === null || existingFreqMap!.keys() === null || freq_map.keys() === null) continue;
                
                
                const similarity = cosineSimilarity(freq_map, existingFreqMap!); // 0.0 >= similarity >= 1.0
                if(targetQuestion === undefined || targetQuestion[1] < similarity) {
                    targetQuestion = [existingQuestion.id, similarity]; 
                }
            }

            if(targetQuestion !== undefined && targetQuestion[1] > 0.8 && targetQuestion[0] !== null) { // if we found a match, use that question
                questionId = targetQuestion[0];
            } else if(questionId === null || questionId === undefined) { // only will be true if a match is not found
                const questionResult = await db.prepare('INSERT INTO question (question_text, type, category, manual, freq_map) VALUES (?, ?, ?, ?, ?)').run(formattedQuestion, type, "guest", "0", JSON.stringify(Object.fromEntries(freq_map)));
                questionId = questionResult.lastInsertRowid;
            }
        } else { // if there are no questions in the db
            const questionResult = await db.prepare('INSERT INTO question (question_text, type, category, manual) VALUES (?, ?, ?, ?)').run(formattedQuestion, type, "guest", "0");
            questionId = questionResult.lastInsertRowid;
        }
        
        if(type === "likert") {
            q.likertAnswers.forEach((a) => {
                db.prepare('INSERT INTO answer (guest_evaluation_id, question_id, answer_text) VALUES (?, ?, ?)').run(guestEvalId, questionId, a.toString());
            });
        } else {
            q.openResponses.forEach((o) => {
                db.prepare('INSERT INTO answer (guest_evaluation_id, question_id, answer_text) VALUES (?, ?, ?)').run(guestEvalId, questionId, o);
            });
        }
    });
    return { success: true, message: "" };
});

ipcMain.handle('import-course-evaluation', async (_event, courseId: string, semesterId: string, academicYearId: string, evalQuestions: {questionText: string; likertAnswers: number[]; likertAverage: number; openResponses: string[];}[]) => {
    const existingCourseEvaluation = db.prepare('SELECT * FROM "course-evaluation" WHERE course_id = ? AND semester_id = ? AND academic_year_id = ?').all(courseId, semesterId, academicYearId);

    if(existingCourseEvaluation !== null && existingCourseEvaluation !== undefined && existingCourseEvaluation.length > 0) {
        return { success: false, message:"Already imported course evaluation with selected fields. If necessary, please delete it and try again." };
    }

    const courseResult = db.prepare('INSERT INTO "course-evaluation" (course_id, semester_id, academic_year_id) VALUES (?, ?, ?)').run(courseId, semesterId, academicYearId);
    const courseEvalId = courseResult.lastInsertRowid;
    const existingQuestions = await db.prepare('SELECT * FROM question WHERE category = ?').all('course');

    evalQuestions.forEach(async (q) => {
        const type = q.likertAnswers.length > 0 ? "likert" : "open";
        const formattedQuestion = q.questionText.replace(new RegExp("^.*?: \s*|\s+$"), "");
        const freq_map = getStemmedFreqMap(q.questionText);

        let questionId = null;
        if(existingQuestions !== undefined && existingQuestions !== null && existingQuestions.length !== 0) { // if there are questions in the db
            let targetQuestion: [number, number] | undefined;
            for(const existingQuestion of existingQuestions) {
                let existingFreqMap: Map<string, number>;
                let hasFreqMap = existingQuestion.freq_map !== null && existingQuestion.freq_map !== undefined && existingQuestion.freq_map !== ''; // if the map in the db isn't set
                if( hasFreqMap ) { // if the map exists convert it
                    const rawMap = JSON.parse(existingQuestion.freq_map);
                    existingFreqMap = new Map(Object.entries(rawMap));
                    if (existingFreqMap.size === 0) { // if the map we generated still doesn't have any entries then we should generate a new one
                        hasFreqMap = false;
                    }
                }

                if( hasFreqMap === false ) { // create a new frequency map and set it in the db
                    existingFreqMap = getStemmedFreqMap(existingQuestion.question_text);
                    await db.prepare('UPDATE "question" SET freq_map = ? WHERE id = ?').run(JSON.stringify(Object.fromEntries(existingFreqMap)), existingQuestion.id);
                }

                // if for some reason we still can't get it we just skip this question candidate
                if(existingFreqMap! === null || freq_map === null || existingFreqMap!.keys() === null || freq_map.keys() === null) continue;

                const similarity = cosineSimilarity(freq_map, existingFreqMap!); // 0.0 >= similarity >= 1.0
                if(targetQuestion === undefined || targetQuestion[1] < similarity) {
                    targetQuestion = [existingQuestion.id, similarity]; 
                }
            }

            if(targetQuestion !== undefined && targetQuestion[1] > 0.8 && targetQuestion[0] !== null) { // if we found a match, use that question
                questionId = targetQuestion[0];
            } else if(questionId === null || questionId === undefined) { // only will be true if a match is not found
                const questionResult = await db.prepare('INSERT INTO question (question_text, type, category, manual, freq_map) VALUES (?, ?, ?, ?, ?)').run(formattedQuestion, type, "course", "0", JSON.stringify(Object.fromEntries(freq_map)));
                questionId = questionResult.lastInsertRowid;
            }

        } else { // if there are no questions in the db
            const questionResult = await db.prepare('INSERT INTO question (question_text, type, category, manual) VALUES (?, ?, ?, ?)').run(formattedQuestion, type, "course", "0");
            questionId = questionResult.lastInsertRowid;
        }

        if(type === "likert") {
            q.likertAnswers.forEach((a) => {
                db.prepare('INSERT INTO answer (course_evaluation_id, question_id, answer_text) VALUES (?, ?, ?)').run(courseEvalId, questionId, a.toString());
            });
        } else {
            q.openResponses.forEach((o) => {
                db.prepare('INSERT INTO answer (course_evaluation_id, question_id, answer_text) VALUES (?, ?, ?)').run(courseEvalId, questionId, o);
            });
        }
    });
    return { success: true, message: "" };
});

ipcMain.handle('import-course-evaluation-manual', async (_event, courseId: string, semesterId: string, academicYearId: string, questions: [string, string, string, string, string][], answers: string[]) => {
    // determine whether the evaluation exists already, if not create a new one
    const existingEval = db.prepare('SELECT * FROM "course-evaluation" WHERE course_id = ? AND semester_id = ? AND academic_year_id = ?').all(courseId, semesterId, academicYearId);
    let courseEvalId = "0";
    if(existingEval.length > 0) {
        return { success: false, message:"Already imported course evaluation with selected fields. If necessary, please delete it and try again." };
    } else { // otherwise, create a new course evaluation and use the new id
        const courseResult = db.prepare('INSERT INTO "course-evaluation" (course_id, semester_id, academic_year_id) VALUES (?, ?, ?)').run(courseId, semesterId, academicYearId);
        courseEvalId = courseResult.lastInsertRowid;
    }
    
    answers.forEach(async (a: string, i: number) => { // insert each answer into the db
        db.prepare('INSERT INTO ANSWER (course_evaluation_id, question_id, answer_text) VALUES (?, ?, ?)')
            .run(courseEvalId, questions[i][0], a);
    });
    
    return { success: true, message:"" };
});

ipcMain.handle('import-guest-evaluation-manual', async (_event, courseId: string, guestId: string, semesterId: string, academicYearId: string, questions: [string, string, string, string, string][], answers: string[]) => {
    // determine whether the evaluation exists already, if not create a new one
    const existingEval = db.prepare('SELECT * FROM "guest-evaluation" WHERE course_id = ? AND guest_id = ? AND semester_id = ? AND academic_year_id = ?').all(courseId, guestId, semesterId, academicYearId);
    let guestEvalId = "0";
    if(existingEval.length > 0) {
        return { success: false, message:"Already imported guest evaluation with selected fields. If necessary, please delete it and try again." };
    } else { // otherwise, create a new guest evaluation and use the new id
        const guestResult = db.prepare('INSERT INTO "guest-evaluation" (guest_id, course_id, semester_id, academic_year_id) VALUES (?, ?, ?, ?)').run(guestId, courseId, semesterId, academicYearId);
        guestEvalId = guestResult.lastInsertRowid;
    }
    
    answers.forEach(async (a: string, i: number) => { // insert each answer into the db
        db.prepare('INSERT INTO ANSWER (guest_evaluation_id, question_id, answer_text) VALUES (?, ?, ?)')
        .run(guestEvalId, questions[i][0], a);
    });

    return { success: true, message:"" };
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
    let idCol = 0;
    let gradeCol = 0;

    if (ext === '.xlsx') { // if the file is an xlsx file, read the file
        await workbook.xlsx.readFile(filePath);
    } else if (ext === '.csv') { // if the file is a csv file, convert it to a filestream first
        const fileStream = fs.createReadStream(filePath);
        await workbook.csv.read(fileStream);
    } else { // throw if invalid file format
        throw new Error('Unsupported file format');
    }

    const worksheet = workbook.worksheets[0]; // grab the first worksheet, as the grade workbooks only have one
    const headerRow = worksheet.getRow(1);
    for(let i = 1, n = headerRow.cellCount; i<n; i++) { // get the grade and id columns dynamically
        const val = headerRow.getCell(i).value;
        if(val === "Final Grade") {
            gradeCol = i;
        } else if(val === "ID") {
            idCol = i;
        }
    }

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
        if(!(col.values[1]?.toString() === "0") && !(col.values[1]?.toString() === "1")) {
            qText = col.values[1]!.toString();
            col.values.map((cell) => {
                switch(cell?.toString().toLowerCase()) {
                    case "strongly agree":
                        likertAnswers.push(5);
                        break;
                    case "agree":
                        likertAnswers.push(4);
                        break;
                    case "neutral":
                        likertAnswers.push(3);
                        break;
                    case "disagree":
                        likertAnswers.push(2);
                        break;
                    case "strongly disagree":
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

/**
 * ipcMain.handle('read-course-eval-file'...)
 * This event handler is used in the preload.ts file to read a course speaker evaluation survey spreadsheet file.
 * The event is exposed to the renderer process, in preload.ts, via the contextBridge API.
 * This allows us to call window.ipcRenderer.readSpreadsheetFile() in the ImportCourseEval.tsx file.
 * @param filePath
 * @returns rows
 */
ipcMain.handle('read-course-eval-file', async (_event, filePath) => {
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
        if(!(col.values[1]?.toString() === "0") && !(col.values[1]?.toString() === "1")) {
            qText = col.values[1]!.toString();
            col.values.map((cell) => {
                switch(cell?.toString().toLowerCase()) {
                    case "strongly agree":
                        likertAnswers.push(5);
                        break;
                    case "agree":
                        likertAnswers.push(4);
                        break;
                    case "neutral":
                        likertAnswers.push(3);
                        break;
                    case "disagree":
                        likertAnswers.push(2);
                        break;
                    case "strongly disagree":
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
    const existingGrade = db.prepare('SELECT * FROM grade WHERE student_id = ? AND course_id = ? AND semester_id = ? AND academic_year_id = ? AND retake = ? AND final_grade = ?').all(studentId, courseId, semesterId, academicYearId, isRetake, grade);

    if(existingGrade !== null && existingGrade !== undefined && existingGrade.length > 0) {
        return { success: false, message:"Already imported grade with selected fields. If necessary, please delete it and try again." };
    }

    db.prepare('INSERT INTO grade (student_id, course_id, semester_id, academic_year_id, retake, final_grade) VALUES (?, ?, ?, ?, ?, ?)').run(studentId, courseId, semesterId, academicYearId, isRetake, grade);
    return { success: true, message:"" };
})

ipcMain.handle('read-grades', async (_event, studentId?, courseId?, semesterId?, academicYearId?, isRetake?, grade?) => {
    let query = `
        SELECT g.*, s.name as semester_name, ay.name as academic_year_name
        FROM grade g
        LEFT JOIN semester s ON g.semester_id = s.id
        LEFT JOIN "academic-year" ay ON g.academic_year_id = ay.id
        WHERE 1=1
    `
    const params = [];
    if(studentId != "" && studentId != null) {
        query += ' AND student_id = ?';
        params.push(studentId);
    }
    if(courseId != "" && courseId != null) {
        query += ' AND course_id = ?';
        params.push(courseId);
    }
    if(semesterId != "" && semesterId != null) {
        query += ' AND semester_id = ?';
        params.push(semesterId);
    }
    if(academicYearId != "" && academicYearId != null) {
        query += ' AND academic_year_id = ?';
        params.push(academicYearId);
    }
    if(isRetake != "" && isRetake != null) {
        query += ' AND retake = ?';
        params.push(isRetake);
    }
    if(grade != "" && grade != null) {
        query += ' AND final_grade = ?';
        params.push(grade);
    }

    query += ' ORDER BY id DESC'
    
    const result = db.prepare(query).all(...params)
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

ipcMain.handle('read-course-evaluations', async () => {
    const query = `
        SELECT c.*, s.name as semester_name, ay.name as academic_year_name
        FROM "course-evaluation" c
        LEFT JOIN semester s ON c.semester_id = s.id
        LEFT JOIN "academic-year" ay ON c.academic_year_id = ay.id
        WHERE 1=1
        ORDER BY id DESC
    `
    const result = db.prepare(query).all();
    return result;
})

ipcMain.handle('read-manual-course-questions', async () => {
    const result = await db.prepare('SELECT * FROM question WHERE category = ? AND manual = ?').all("course", "1");
    return result;
})

ipcMain.handle('read-manual-guest-questions', async () => {
    const result = await db.prepare('SELECT * FROM question WHERE category = ? AND manual = ?').all("guest", "1");
    return result;
})

ipcMain.handle('read-questions', async () => {
    const result = await db.prepare('SELECT * FROM question').all();
    return result;
})

ipcMain.handle('add-question', async (_event, question_text, type, category, manual) => {
    const existingQuestion = db.prepare('SELECT * FROM question WHERE question_text = ? AND type = ? AND category = ? AND manual = ?').all(question_text, type, category, manual);

    if(existingQuestion !== null && existingQuestion !== undefined && existingQuestion.length > 0) {
        return { success: false, message:"Already imported question with selected fields. If necessary, please delete it and try again." };
    }

    db.prepare('INSERT INTO question (question_text, type, category, manual) VALUES (?, ?, ?, ?)').run(question_text, type, category, manual);
    return { success: true, message:"" };
})

ipcMain.handle('read-guest-evaluations', async () => {
    const query = `
        SELECT ge.*, CONCAT(g.lname, ', ', g.fname) as guest_name, s.name as semester_name, ay.name as academic_year_name
        FROM "guest-evaluation" ge
        LEFT JOIN "guest-lecturer" g ON ge.guest_id = g.id
        LEFT JOIN semester s ON ge.semester_id = s.id
        LEFT JOIN "academic-year" ay ON ge.academic_year_id = ay.id
        WHERE 1=1
        ORDER BY id DESC
    `
    const result = db.prepare(query).all();
    return result;
})


ipcMain.handle('generate-grade-report', async (_event, studentId, courseId, academicYearIds) => {
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
    if (academicYearIds.length > 0 && academicYearIds[0] !== '*') {``
        query += ` AND academic_year_id IN (${academicYearIds.map(() => '?').join(', ')})`;
        params.push(...academicYearIds);
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

ipcMain.handle('generate-guest-report', async (_event, guestId, courseId, semesterId, academicYearIds) => {
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
    if (academicYearIds.length > 0 && academicYearIds[0] !== '*') {``
        query += ` AND academic_year_id IN (${academicYearIds.map(() => '?').join(', ')})`;
        params.push(...academicYearIds);
    }
    if (semesterId !== '*') {
        query += ' AND semester_id = ?';
        params.push(semesterId);
    }

    // get the id of the guest-evaluation
    const ge: {id: string, guest_id: string, semester_id: string, academic_year_id: string}[] = db.prepare(query).all(...params);
    const groupedAnswers: { [question_id: string]: { id: string; answer_text: string }[] } = {};
    // Iterate over each guest evaluation
    for (const e of ge) {
        // Query answers for the current guest evaluation
        const answers: { id: string, guest_evaluation_id: string, course_evaluation_id: string, question_id: string, answer_text: string }[] =
            db.prepare('SELECT * FROM answer WHERE guest_evaluation_id = ?').all(e.id);

        // Group answers by question_id
        answers.forEach((answer) => {
            const { question_id } = answer;
            if (!groupedAnswers[question_id]) {
                groupedAnswers[question_id] = [];
            }
            groupedAnswers[question_id].push({ id: answer.id, answer_text: answer.answer_text });
        });
    }

    const questionAndAnswer: [string, string | { count: number, keywords: string[], responses: string[], summary: string, topic: string }[]][] = []; 

    try {
        for (const [question_id, answers] of Object.entries(groupedAnswers)) {
            const q = db.prepare('SELECT * FROM question WHERE id = ?').get(question_id);
    
            if (q.type === "likert") {
                let avgTotal: number = 0
                answers.forEach(res => {
                    avgTotal += Number.parseFloat(res.answer_text)
                });
                const aggregateAverage = avgTotal / answers.length

                questionAndAnswer.push([q.question_text, aggregateAverage.toString()]);
            } else if (q.type === "open") {
                let answerTexts = answers.map((answer) => answer.answer_text);
                answerTexts = answerTexts.filter((a) => typeof(a) === "string" && a.length>=5)

                const res = await thematic_analysis(answerTexts.join('|')) as { count: number, keywords: string[], responses: string[], summary: string, topic: string }[];
                questionAndAnswer.push([q.question_text, res]);
            }
        }
    } catch(e) {
        return e;
    }

    return questionAndAnswer;
});

ipcMain.handle('delete-grade', async (_event, gradeId) => {
    const result = db.prepare('DELETE FROM grade WHERE id = ?').run(gradeId);
    return result;
})

ipcMain.handle('delete-course-evaluation', async (_event, evalId) => {
    // get all of the corresponding answers
    db.prepare('DELETE FROM answer WHERE course_evaluation_id = ?').run(evalId); 
    db.prepare('DELETE FROM "course-evaluation" WHERE id = ?').run(evalId); 
});

ipcMain.handle('delete-guest-evaluation', async (_event, evalId) => {
    // get all of the corresponding answers
    db.prepare('DELETE FROM answer WHERE guest_evaluation_id = ?').run(evalId); 
    db.prepare('DELETE FROM "guest-evaluation" WHERE id = ?').run(evalId); 
});

ipcMain.handle('delete-question', async (_event, questionId) => {
    db.prepare('DELETE FROM answer WHERE id = ?').run(questionId);
    db.prepare('DELETE FROM question WHERE id = ?').run(questionId);
});

ipcMain.handle('update-grade', async (_event, gradeId, studentId?, courseId?, semesterId?, academicYearId?, isRetake?, grade?) => {
    if(studentId) {
        await db.prepare('UPDATE grade SET student_id = ? WHERE id = ?').run(studentId, gradeId);
    } else if(courseId) {
        await db.prepare('UPDATE grade SET course_id = ? WHERE id = ?').run(courseId, gradeId);
    } else if(semesterId) {
        await db.prepare('UPDATE grade SET semester_id = ? WHERE id = ?').run(semesterId, gradeId);
    } else if(academicYearId) {
        await db.prepare('UPDATE grade SET academic_year_id = ? WHERE id = ?').run(academicYearId, gradeId);
    } else if(isRetake) {
        await db.prepare('UPDATE grade SET retake = ? WHERE id = ?').run(isRetake, gradeId);
    } else if(grade) {
        await db.prepare('UPDATE grade SET final_grade = ? WHERE id = ?').run(grade, gradeId);        
    }
})

ipcMain.handle('update-course-evaluation', async (_event, evalId, courseId?, semesterId?, academicYearId?) => {
    if(courseId) {
        await db.prepare('UPDATE "course-evaluation" SET course_id = ? WHERE id = ?').run(courseId, evalId);
    } else if(semesterId) {
        await db.prepare('UPDATE "course-evaluation" SET semester_id = ? WHERE id = ?').run(semesterId, evalId);
    } else if(academicYearId) {
        await db.prepare('UPDATE "course-evaluation" SET academic_year_id = ? WHERE id = ?').run(academicYearId, evalId);
    }
})

ipcMain.handle('update-guest-evaluation', async (_event, evalId, guestId?, courseId?, semesterId?, academicYearId?) => {
    if(guestId) {
        await db.prepare('UPDATE "guest-evaluation" SET guest_id = ? WHERE id = ?').run(guestId, evalId);
    } else if(courseId) {
        await db.prepare('UPDATE "guest-evaluation" SET course_id = ? WHERE id = ?').run(courseId, evalId);
    } else if(semesterId) {
        await db.prepare('UPDATE "guest-evaluation" SET semester_id = ? WHERE id = ?').run(semesterId, evalId);
    } else if(academicYearId) {
        await db.prepare('UPDATE "guest-evaluation" SET academic_year_id = ? WHERE id = ?').run(academicYearId, evalId);
    }
})

ipcMain.handle('update-question', async (_event, questionId, question_text?, type?, category?, manual?) => {
    if(question_text) {
        await db.prepare('UPDATE question SET question_text = ? WHERE id = ?').run(question_text, questionId);
    } else if(type) {
        await db.prepare('UPDATE question SET type = ? WHERE id = ?').run(type, questionId);
    } else if(category) {
        await db.prepare('UPDATE question SET category = ? WHERE id = ?').run(category, questionId);
    } else if(manual) {
        await db.prepare('UPDATE question SET manual = ? WHERE id = ?').run(manual, questionId);
    }
})

ipcMain.handle('generate-course-report', async (_event, courseId, semesterId, academicYearIds) => {
    // initial query, includes the verbose academic year name and semester name 
    let query = `SELECT * FROM "course-evaluation" WHERE 1=1`;    

    // if we are filtering, dynamically append those to our SQL query and add their corresponding parameters to the params array
    const params = [];
    if (courseId !== '*') {
        query += ' AND course_id = ?';
        params.push(courseId);
    }
    if (academicYearIds.length > 0 && academicYearIds[0] !== '*') {``
        query += ` AND academic_year_id IN (${academicYearIds.map(() => '?').join(', ')})`;
        params.push(...academicYearIds);
    }
    if (semesterId !== '*') {
        query += ' AND semester_id = ?';
        params.push(semesterId);
    }

    // get the ids of the course-evaluations
    const ce: {id: string, guest_id: string, semester_id: string, academic_year_id: string}[] = db.prepare(query).all(...params);
    const groupedAnswers: { [question_id: string]: { id: string; answer_text: string }[] } = {};
        // Iterate over each course evaluation
        for (const e of ce) {
            // Query answers for the current course evaluation
            const answers: { id: string, guest_evaluation_id: string, course_evaluation_id: string, question_id: string, answer_text: string }[] =
                db.prepare('SELECT * FROM answer WHERE course_evaluation_id = ?').all(e.id);
    
            // Group answers by question_id
            answers.forEach((answer) => {
                const { question_id } = answer;
                if (!groupedAnswers[question_id]) {
                    groupedAnswers[question_id] = [];
                }
                groupedAnswers[question_id].push({ id: answer.id, answer_text: answer.answer_text });
            });
        }

    const questionAndAnswer: [string, string | { count: number, keywords: string[], responses: string[], summary: string, topic: string }[]][] = []; 

    try {
        for (const [question_id, answers] of Object.entries(groupedAnswers)) {
            const q = db.prepare('SELECT * FROM question WHERE id = ?').get(question_id);
    
            if (q.type === "likert") {
                let avgTotal: number = 0
                answers.forEach(res => {
                    avgTotal += Number.parseFloat(res.answer_text)
                });
                const aggregateAverage = avgTotal / answers.length

                questionAndAnswer.push([q.question_text, aggregateAverage.toString()]);
            } else if (q.type === "open") {
                let answerTexts = answers.map((answer) => answer.answer_text);
                answerTexts = answerTexts.filter((a) => typeof(a) === "string" && a.length>=5)

                const res = await thematic_analysis(answerTexts.join('|')) as { count: number, keywords: string[], responses: string[], summary: string, topic: string }[];
                questionAndAnswer.push([q.question_text, res]);
            }
        }
    } catch(e) {
        return e;
    }

    return questionAndAnswer;
});

ipcMain.handle('save-eval-report', async (_event, data: [string, string | { topic: string; summary: string; keywords: string[]; count: number; responses: string[]; }[]][]) => {
    const { filePath } = await dialog.showSaveDialog(win!, {
        title: 'Save Evaluation Report',
        defaultPath: 'eval-report.xlsx',
        filters: [
            { name: 'Excel Files', extensions: ['xlsx'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    })

    // if(!filePath) return { success: false, message: 'User cancelled the save dialog' };
    try {
        const workbook = new ExcelJS.Workbook();
        // display likert questions and answers
        // display open response questions and answers
        const likertSheet = workbook.addWorksheet('Likert Style');
        likertSheet.columns = [
            { header: 'Question', key: 'question' },
            { header: 'Likert Avg', key: 'likertavg' },
        ]
        const openResponseSheet = workbook.addWorksheet('Open Response');
        openResponseSheet.columns = [
            { header: 'Question', key: 'question' },
            { header: 'Topic', key: 'topic' },
            { header: 'Summary', key: 'summary' },
            { header: 'Keywords', key: 'keywords' },
            { header: 'Count', key: 'count' }
        ]

        for(const qna of data) {
            if(typeof qna[1] === 'string') {
                likertSheet.addRow({
                    question: qna[0],
                    likertavg: qna[1]
                })
            } else {
                openResponseSheet.addRow({
                    question: qna[0]
                })
                qna[1].forEach((item) => {
                    openResponseSheet.addRow({
                        topic: item['topic'], 
                        summary: item['summary'],
                        keywords: item['keywords'],
                        count: item['count']
                    })
                })
            }
        }
        await workbook.xlsx.writeFile(filePath);
        return { success: true }
    } catch (error) {
        return { success: false, message: error }
    }

})

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
            ? path.join(process.env.APP_ROOT!, 'src', 'utils', 'analyze_responses.py')
            : path.join(process.resourcesPath, 'src', 'utils', 'analyze_responses.py');

        const pythonPath = devMode
            ? path.join(process.env.APP_ROOT!, 'src', 'python', 'python.exe')
            : path.join(process.resourcesPath, 'src', 'python', 'python.exe')
            
        const pythonProcess = spawn(pythonPath, [scriptPath], {
            cwd: path.dirname(pythonPath),
            env: {
                ...process.env,
            }
        });

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

ipcMain.handle('download-user-manual', async () => {
    const userManualPath =
        process.env.NODE_ENV === "development"
            ? "src/assets/Evalu8UserManual.docx" : path.join(
            process.resourcesPath, 'src/assets/Evalu8UserManual.docx'
    );

    const savePath = dialog.showSaveDialogSync({
        title: 'Save User Manual',
        defaultPath: 'Evalu8UserManual.docx',
        filters: [{ name: 'Word Document', extensions: ['docx'] }],
    });

    if (savePath) {
        fs.copyFileSync(userManualPath, savePath);
        return savePath;
    } else {
        throw new Error('Save operation was canceled.');
    }
});