"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  },
  // NOTE: in order to suppress the type error for ipcRenderer, you must navigate to electron.d.ts
  // and specify the type definition of the function as defined below. 
  /**
   * createCourse() is a function that creates a course in the sqlite database.
   * @param courseName 
   * @returns course sqlite objects
   */
  createCourse(courseName) {
    return electron.ipcRenderer.invoke("create-course", courseName);
  },
  /**
   * readCourses() is a function that reads all courses from the sqlite database.
   * @returns course sqlite objects
   */
  readCourses() {
    return electron.ipcRenderer.invoke("read-courses");
  },
  /**
   * readCourse() is a function that reads a course from the sqlite database.
   * @param courseId 
   * @returns a single course sqlite object
   */
  readCourse(courseId) {
    return electron.ipcRenderer.invoke("read-course", courseId);
  },
  /**
   * updateCourse() is a function that updates a course in the sqlite database.
   * @param courseId 
   * @param courseName 
   * @returns course sqlite objects
   */
  updateCourse(courseId, courseName) {
    return electron.ipcRenderer.invoke("update-course", courseId, courseName);
  },
  /**
   * deleteCourse() is a function that deletes a course from the sqlite database.
   * @param courseId 
   * @returns course sqlite objects
   */
  deleteCourse(courseId) {
    return electron.ipcRenderer.invoke("delete-course", courseId);
  },
  /**
   * readGradeFile() is a function that reads a grade file from the file system.
   * @param filePath 
   * @returns void
  */
  readGradeFile(filePath) {
    return electron.ipcRenderer.invoke("read-grade-file", filePath);
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
  importGrades(studentId, courseId, semesterId, academicYearId, retake, grade) {
    return electron.ipcRenderer.invoke("import-grades", studentId, courseId, semesterId, academicYearId, retake, grade);
  },
  /**
   * readSemesters() is a function that reads all semesters from the sqlite database.
   * @returns semester sqlite objects
   */
  readSemesters() {
    return electron.ipcRenderer.invoke("read-semesters");
  },
  /**
   * readAcademicYears() is a function that reads all academic years from the sqlite database.
   * @returns academic year sqlite objects
   */
  readAcademicYears() {
    return electron.ipcRenderer.invoke("read-academic-years");
  }
});
