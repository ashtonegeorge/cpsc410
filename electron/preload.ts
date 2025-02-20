import { ipcRenderer, contextBridge } from 'electron'

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
   * getNames()
   * This method invokes an event handler, "get-names", defined in the main.ts file at the bottom.
   * From the front end, this event handler can be used by calling window.ipcRenderer.getNames().
   * @returns {Promise<{Name: string}[]>}
   */
  // getNames(): Promise<{ Name: string }[]> {
  //   return ipcRenderer.invoke('get-names');
  // }, 

  createCourse(courseName: string): Promise<void> {
    return ipcRenderer.invoke('create-course', courseName);
  },

  readCourses(): Promise<{ Name: string }[]> {
    return ipcRenderer.invoke('read-courses');
  },

  readCourse(courseId: string): Promise<{ id: number, course_name: string }[]> {
    return ipcRenderer.invoke('read-course', courseId);
  },

  updateCourse(courseId: string, courseName: string): Promise<void> {
    return ipcRenderer.invoke('update-course', courseId, courseName);
  },

  deleteCourse(courseId: string): Promise<void> {
    return ipcRenderer.invoke('delete-course', courseId);
  }
})
