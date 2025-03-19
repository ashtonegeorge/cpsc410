# Pages Folder
This readme is a work in progress. It will be updated as the project progresses.

## Folder structure
```text
pages/
├── About.tsx
├── AcademicYear.tsx
├── CourseEval.tsx
├── Courses.tsx
├── Grades.tsx
├── GuestEval.tsx
└── Home.tsx
```

### About.tsx
This file contains the about page. The intention behind this file is that it gives some basic information about the application and perhaps us as the development team.

### AcademicYear.tsx
This file contains the academic year page. The intention behind this file is that it allows the user to maintain the available academic year selections for evaluations and grades.  

### CourseEval.tsx
This file contains the course evaluation homepage. The intention behind this file is that it will serve as intermediate navigation between the homepage and whatever course-related actions the user wants to do.

### Courses.tsx
This file contains the courses page. The intention behind this file is that it allows the user to maintain the available course selections for evaluations and grades.

### GradeMetrics.tsx
This file contains the grade metrics page. The intention behind this file is that it will serve as the place where the user can generate Excel reports based on various criteria that they might need for accreditation.

### Grades.tsx
This file contains the module grades page. The intention behind this file is that it will serve as intermediate navigation between the homepage and whatever grade-related actions the user wants to do.

### GuestEval.tsx
This file contains the guest evaulation homepage. This intention behind this file is that it will serve as intermediate navigation between the homepage and whatever guest-evaluation-related actions the user wants to do.

### Home.tsx
This file contains the homepage. The intention behind this file is that the user can navigate to different areas of the application from a user-friendly page.

### index.tsx
This file serves as a way to import the pages inline. The components can be imported together within a set of brackets rather than imported with a dedicated import statement for each one. Note, to import more pages in the same way, they must be added to this file.