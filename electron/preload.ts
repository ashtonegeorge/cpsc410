import { ipcRenderer, contextBridge } from 'electron';

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
  createCourse(courseName: string): Promise<void> {
    return ipcRenderer.invoke('create-course', courseName);
  },

  /**
   * readCourses() is a function that reads all courses from the sqlite database.
   * @returns course sqlite objects
   */
  readCourses(): Promise<{ Name: string }[]> {
    return ipcRenderer.invoke('read-courses');
  },

  /**
   * readCourse() is a function that reads a course from the sqlite database.
   * @param courseId 
   * @returns a single course sqlite object
   */
  readCourse(courseId: string): Promise<{ id: number, name: string }[]> {
    return ipcRenderer.invoke('read-course', courseId);
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

  /**
   * readSpreadsheetFile() is a function that reads a spreadsheet file from the file system.
   * @param filePath 
   * @returns rows from the spreadsheet
  */
  readSpreadsheetFile(filePath: string): Promise<void> {
    return ipcRenderer.invoke('read-spreadsheet-file', filePath)
  } 
})
