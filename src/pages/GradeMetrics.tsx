import { useState, useEffect } from "react";
import Button from "../components/Button";

export default function GradeMetrics() {
    const [filter, setFilter] = useState('sid');
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [studentId, setStudentId] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        window.ipcRenderer.readCourses().then((result: { id: string, name: string }[]) => {
            // unfortunately we can't directly reference the state variable, so we have to create a new array
            const coursesArray = result.map((e) => [e.id, e.name] as [string, string]);
            setCourses(coursesArray);
        });
        window.ipcRenderer.readAcademicYears().then((result: { id: string, name: string }[]) => {
            const academicYearsArray = result.map((e) => [e.id, e.name] as [string, string]);
            setAcademicYears(academicYearsArray);
        });
    }, [])

    useEffect(() => { // reset values when filter changes
        setSelectedAcademicYear("*");
        setSelectedCourse("*");
        setStudentId("");
    }, [filter])

    function handleSelectedCourseChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedCourse(event.target.value);
    }

    function handleSelectedAcademicYearChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedAcademicYear(event.target.value);
    }

    function handleStudentIdChange(event: React.ChangeEvent<HTMLInputElement>): void {
        setStudentId(event.target.value);
    }

    async function handleGenerateReport(): Promise<void> {
        if(filter === 'sid' && studentId === "") {
            setError(true);
            setTimeout(() => {
                setError(false);
            }, 7000);
            return;
        }; 

        const res = window.ipcRenderer.generateGradeReport(studentId === "" ? "*" : studentId, selectedCourse, selectedAcademicYear);
        if(await res) setSuccess(true); else (setError(true));

        setTimeout(() => {
            setSuccess(false);
            setError(false);
        }, 5000);
    }

    return (
        <div className="w-1/2 mx-auto">
            <h2>Grade Metrics</h2>
            <div className="pt-12 flex">
                <h3 className="w-full place-self-center text-left">Filter results by: </h3>
                <select className="text-black bg-white p-2 rounded-lg my-2 w-full" defaultValue={"sid"} onChange={(e) => setFilter(e.target.value)}>
                    <option value="sid">Student</option>
                    <option value="course">Course</option>
                    <option value="ayear">Academic Year</option>
                </select>
            </div>
            {filter === 'sid' && 
                <>
                    <div className="w-full flex flex-col text-left">
                        <h3>Enter Student ID</h3>
                        <input value={studentId} onChange={handleStudentIdChange} type="text" placeholder="ID" className="text-black bg-white p-2 rounded-lg my-2" />
                        <h3>Select Course</h3>
                        <select defaultValue={"*"} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedCourseChange}>
                            <option value="*">All courses</option>
                            {courses.map((course) => <option key={course[0]} value={course[0]}>{course[0]}: {course[1]}</option>)}
                        </select>
                        <h3>Select Academic Year</h3>
                        <select defaultValue={"*"} onChange={handleSelectedAcademicYearChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                            <option value="*">All courses</option>
                            {academicYears.map(([id, name]) => (  
                                <option className='flex p-1 w-full' value={id} key={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            }
            {filter === 'course' && 
                <>
                    <div className="w-full flex flex-col text-left">
                        <h3>Select Course</h3>
                        <select onChange={handleSelectedCourseChange} value={selectedCourse} className="text-black bg-white p-2 rounded-lg my-2" >
                            <option value="*">All courses</option>
                            {courses.map((course) => <option key={course[0]} value={course[0]}>{course[0]}: {course[1]}</option>)}
                        </select>
                        <h3>Select Academic Year</h3>
                        <select defaultValue={"*"} onChange={handleSelectedAcademicYearChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                            <option value="*">All academic years</option>
                            {academicYears.map(([id, name]) => (  
                                <option className='flex p-1 w-full' value={id} key={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            }
            {filter === 'ayear' && 
                <>
                    <div className="w-full flex flex-col text-left">
                        <h3>Select Academic Year</h3>
                        <select defaultValue={"*"} onChange={handleSelectedAcademicYearChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                            <option value="*">All academic years</option>
                            {academicYears.map(([id, name]) => (  
                                <option className='flex p-1 w-full' value={id} key={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        <h3>Select Course</h3>
                        <select value={selectedCourse} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedCourseChange}>
                            <option value="*">All courses</option>
                            {courses.map((course) => <option key={course[0]} value={course[0]}>{course[0]}: {course[1]}</option>)}
                        </select>
                    </div>
                </>
            }
            <div className="w-1/2 mx-auto py-6">
                <Button icon={null} label="Generate Report" action={handleGenerateReport} />
            </div>
            {success && <p className="w-full text-green-500 font-semibold">Report generated successfully!</p>}
            {error && <p className="w-full text-red-500 font-semibold">Report generation failed, please try again.</p>}
        </div>
    );
}