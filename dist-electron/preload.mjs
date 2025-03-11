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
   * getNames()
   * This method invokes an event handler, "get-names", defined in the main.ts file at the bottom.
   * From the front end, this event handler can be used by calling window.ipcRenderer.getNames().
   */
  createCourse(courseName) {
    return electron.ipcRenderer.invoke("create-course", courseName);
  },
  readCourses() {
    return electron.ipcRenderer.invoke("read-courses");
  },
  readCourse(courseId) {
    return electron.ipcRenderer.invoke("read-course", courseId);
  },
  updateCourse(courseId, courseName) {
    return electron.ipcRenderer.invoke("update-course", courseId, courseName);
  },
  deleteCourse(courseId) {
    return electron.ipcRenderer.invoke("delete-course", courseId);
  },
  readSpreadsheetFile(filePath) {
    return electron.ipcRenderer.invoke("read-spreadsheet-file", filePath);
  }
});
