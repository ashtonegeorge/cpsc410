import { ipcRenderer, contextBridge } from 'electron';
import ExcelJS from 'exceljs';

interface EvalQuestion {
  questionText: string;
  likertAnswers: number[];
  likertAverage: number;
  openResponses: string[];
}

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // NOTE: in order to suppress the type error for ipcRenderer, you must navigate to electron.d.ts
  // and specify the type definition of the function as defined below. 

  /**
   * createCourse() is a function that creates a course in the sqlite database.
   * @param courseName 
   * @returns course sqlite objects
   */
  createCourse(courseCode: string, courseName: string): Promise<void> {
    return ipcRenderer.invoke('create-course', courseCode, courseName);
  },

  /**
   * readCourses() is a function that reads all courses from the sqlite database.
   * @returns course sqlite objects
   */
  readCourses(): Promise<{ Name: string }[]> {
    return ipcRenderer.invoke('read-courses');
  },

  /**
   * updateCourse() is a function that updates a course in the sqlite database.
   * @param courseId 
   * @param courseName 
   * @returns course sqlite objects
   */
  updateCourse(courseId: string, courseName: string): Promise<void> {
    return ipcRenderer.invoke('update-course', courseId, courseName);
  },

  /**
   * deleteCourse() is a function that deletes a course from the sqlite database.
   * @param courseId 
   * @returns course sqlite objects
   */
  deleteCourse(courseId: string): Promise<void> {
    return ipcRenderer.invoke('delete-course', courseId);
  },

  createGuestLecturer(guestFName: string, guestLName: string): Promise<void> {
    return ipcRenderer.invoke('create-guest-lecturer', guestFName, guestLName);
  },

  readGuestLecturers(): Promise<void> {
    return ipcRenderer.invoke('read-guest-lecturers');
  },

  updateGuestLecturer(guestId: string, guestFName: string, guestLName: string): Promise<void> {
    return ipcRenderer.invoke('update-guest-lecturer', guestId, guestFName, guestLName);
  },
  
  deleteGuestLecturer(guestId: string): Promise<void> {
    return ipcRenderer.invoke('delete-guest-lecturer', guestId);
  },
  
  /**
   * importGrades() is a function that imports grades into the database.
   * @param studentId
   * @param courseId
   * @param semesterId
   * @param academicYearId
   * @param retake
   * @param grade
   * @returns void
   */ 
  importGuestEvaluation(guestId: string, courseId: string, semesterId: string, academicYearId: string, evalQuestions: EvalQuestion[]): Promise<void> {
    return ipcRenderer.invoke('import-guest-evaluation', guestId, courseId, semesterId, academicYearId, evalQuestions); 
  },

  /**
   * readGradeFile() is a function that reads a grade file from the file system.
   * @param filePath 
   * @returns void
  */
  readGradeFile(filePath: string): Promise<void> {
    return ipcRenderer.invoke('read-grade-file', filePath)
  },
  
  /**
   * readCourseEvalFile() is a function that reads a course evaluation file from the file system.
   * @param filePath 
   * @returns void
  */
  readCourseEvalFile(filePath: string): Promise<[string, string]> {
    return ipcRenderer.invoke('read-course-eval-file', filePath)
  },

  /**
   * readCourseEvalFile() is a function that reads a course evaluation file from the file system.
   * @param filePath 
   * @returns void
  */
  readGuestEvalFile(filePath: string): Promise<[string, string]> {
    return ipcRenderer.invoke('read-guest-eval-file', filePath)
  },

  /**
   * importGrades() is a function that imports grades into the database.
   * @param studentId
   * @param courseId
   * @param semesterId
   * @param academicYearId
   * @param retake
   * @param grade
   * @returns void
   */ 
  importGrades(studentId: string, courseId: string, semesterId: string, academicYearId: string, retake: number, grade: string): Promise<void> {
    return ipcRenderer.invoke('import-grades', studentId, courseId, semesterId, academicYearId, retake, grade); 
  },

  /**
   * readSemesters() is a function that reads all semesters from the sqlite database.
   * @returns semester sqlite objects
   */
  readSemesters(): Promise<{ id: string, name: string }[]> {
    return ipcRenderer.invoke('read-semesters');
  },

  /**
   * readAcademicYears() is a function that reads all academic years from the sqlite database.
   * @returns academic year sqlite objects
   */
  readAcademicYears(): Promise<{ id: string, name: string }[]> {
    return ipcRenderer.invoke('read-academic-years');
  },

  createAcademicYear(ayearName: string): Promise<void> {
    return ipcRenderer.invoke('create-academic-year', ayearName);
  },

  updateAcademicYear(ayearName: string, ayearId: string): Promise<void> {
    return ipcRenderer.invoke('update-academic-year', ayearName, ayearId);
  },

  deleteAcademicYear(ayearId: string): Promise<void> {
    return ipcRenderer.invoke('delete-academic-year', ayearId);
  },

  generateGradeReport(studentId: string, courseId: string, academicYearId: string): Promise<void> {
    return ipcRenderer.invoke('generate-grade-report', studentId, courseId, academicYearId);
  },

  async saveGradeReport(buffer: ExcelJS.Buffer): Promise<void> {
    const result = ipcRenderer.invoke('save-grade-report', buffer);
    if (!result) {
        console.error('Error saving grade report:', result);
        throw new Error(result);
    }
    return result;
  }
})
