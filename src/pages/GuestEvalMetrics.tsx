import { Fragment, useEffect, useState } from 'react';
import Button from '../components/Button';

type TopicSummary = {
    topic: string;
    summary: string;
    keywords: string[];
    count: number;
    responses: string[];
};

export default function GuestEvalMetrics({setView}: {setView: React.Dispatch<React.SetStateAction<string>>}) {
    const [guests, setGuests] = useState<[string, string, string][]>([]);
    const [courses, setCourses] = useState<[string, string][]>([]);
    const [academicYears, setAcademicYears] = useState<[string, string][]>([]);
    const [semesters, setSemesters] = useState<[string, string][]>([]);
    const [selectedGuest, setSelectedGuest] = useState('*');
    const [selectedCourse, setSelectedCourse] = useState('*');
    const [selectedAcademicYears, setSelectedAcademicYears] = useState<string[]>([]);
    const [selectedSemester, setSelectedSemester] = useState('*');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    // const [workbook, setWorkbook] = useState<ExcelJS.Buffer>();
    const [result, setResult] = useState<[string, string | TopicSummary[]][]>([]);

    useEffect(() => {
        window.ipcRenderer.readCourses().then((result: any) => {
            // unfortunately we can't directly reference the state variable, so we have to create a new array
            const coursesArray = result.map((e: { id: string, name: string }) => [e.id, e.name] as [string, string]);
            setCourses(coursesArray);
        });
        window.ipcRenderer.readAcademicYears().then((result: { id: string, name: string }[]) => {
            const academicYearsArray = result.map((e) => [e.id, e.name] as [string, string]);
            setAcademicYears(academicYearsArray);
        });
        window.ipcRenderer.readSemesters().then((result: { id: string, name: string }[]) => {
            const semestersArray = result.map((e) => [e.id, e.name] as [string, string]);
            setSemesters(semestersArray);
        });
        window.ipcRenderer.readGuestLecturers().then((result: any) => {
            const guestsArray = result.map((e: { id: string, fname: string, lname: string }) => [e.id, e.fname, e.lname] as [string, string, string]);
            setGuests(guestsArray);
        });
    }, [])

    function handleSelectedGuestChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedGuest(event.target.value);
    }

    function handleSelectedCourseChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedCourse(event.target.value);
    }

    function handleSelectedAcademicYearChange(event: React.ChangeEvent<HTMLInputElement>, id: string): void {
        setSelectedAcademicYears((prev) =>
            event.target.checked
                ? [...prev, id]
                : prev.filter((a) => a !== id)
        );
    }
    
    function handleSelectedSemesterChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        setSelectedSemester(event.target.value);
    }

    async function handleGenerateReport(): Promise<void> {
        if(loading) return;
        setResult([]);
        setLoading(true);
        try {
            const res: [string, string | TopicSummary[]][] = await window.ipcRenderer.generateGuestReport(
                selectedGuest,
                selectedCourse,
                selectedSemester,
                selectedAcademicYears.length > 0 ? selectedAcademicYears : ['*']
            );

            if (res) { // set the response data to corresponding state to be used in the UI
                // const preprocessedResult = preprocessResult(res);
                setResult(res);
                setSuccess(true);
            } else {
                setError(true);
            }
        } catch (error) {
            setLoading(false);
            setError(true);
            console.log(error);
        }
        setLoading(false);
        setTimeout(() => {
            setSuccess(false);
            setError(false);
        }, 5000);
    }

    async function handleSaveGuestReport(): Promise<void> {
        try {
            if (!result) throw new Error("Missing data, please generate a report and try again.");
            const res = await window.ipcRenderer.saveEvalReport(result);
            if (!res.success) {
                setError(true);
                console.error('Error saving course report:', res.message);
            } else {
                setSuccess(true);
            }
        } catch (error) {
            setError(true);
            console.error('Error saving course report:', error);
        } finally {
            setTimeout(() => {
                setSuccess(false);
                setError(false);
            }, 5000);
        }
    }

    return (
        <div className="flex justify-between gap-8 h-full">
            <div className="w-1/3">
                <h2 className="text-3xl font-bold">Guest Evaluation Metrics</h2>
                <div className="w-full flex flex-col text-left">
                    <h3>Select Guest</h3>
                    <select defaultValue={"*"} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedGuestChange}>
                        <option value="*">All guest speakers</option>
                        {guests.map((guest) => <option key={guest[0]} value={guest[0]}>{guest[2]}, {guest[1]}</option>)}
                    </select>
                    <h3>Select Course</h3>
                    <select defaultValue={"*"} className="text-black bg-white p-2 rounded-lg my-2" onChange={handleSelectedCourseChange}>
                        <option value="*">All courses</option>
                        {courses.map((course) => <option key={course[0]} value={course[0]}>{course[0]}: {course[1]}</option>)}
                    </select>
                    <h3>Select Academic Year(s)</h3>
                    <label className="relative bg-white text-black p-2 pr-0 rounded-lg">
                        <input type="checkbox" className="hidden peer" />
                        <div className="flex items-center justify-between">
                            <p>{"Select all that apply"}</p>
                            <svg height="20" viewBox="0 0 48 48" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M14.83 16.42l9.17 9.17 9.17-9.17 2.83 2.83-12 12-12-12z"/><path d="M0-.75h48v48h-48z" fill="none"/></svg>
                        </div>
                        <div className="absolute left-0 text-black rounded-b-lg bg-white border border-gray-200 w-full opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto">
                            <ol className="bg-white rounded-b-md">
                            {academicYears.map(([id, name]) => {
                                return (
                                    <li key={id} className="">
                                        <label className="flex px-2 whitespace-nowrap cursor-pointer transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200">
                                        <input
                                            type="checkbox"
                                            name={name}
                                            value={id}
                                            className="cursor-pointer"
                                            onChange={(event) => handleSelectedAcademicYearChange(event, id)}
                                        />
                                        <span className="ml-1">{name}</span>
                                        </label>
                                    </li>
                                );
                            })}

                            </ol>
                        </div>
                    </label>
                    <h3>Select semester</h3>
                    <select defaultValue={"*"} onChange={handleSelectedSemesterChange} className='text-black bg-white p-2 rounded-lg my-2 w-full'>
                        <option value="*">All semesters</option>
                        {semesters.map(([id, name]) => (  
                            <option className='flex p-1 w-full' value={id} key={id}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-2/3 mx-auto py-6 flex flex-col gap-4">
                    <Button icon={null} label="Generate Report" action={handleGenerateReport} />
                    {result.length > 0 && result && <Button icon={null} label="Save Report to Excel" action={handleSaveGuestReport} />}
                    <div className="flex justify-center">
                    <div className="w-1/2 text-white rounded-xl p-2 text-sm border-none">
                            <Button icon={null} label="Back" action={() => Promise.resolve(setView('guestEval'))}/>
                        </div>
                    </div>                 
                </div>
                {success && <p className="w-full text-green-300 font-semibold">Report generated successfully!</p>}
                {error && <p className="w-full text-red-300 font-semibold">Generating report failed, please ensure the correct criteria is selected and try again.</p>}
            
            </div>

            <div className="w-full h-full">
                <div className="h-1/12 text-2xl">Output</div>
                <div className="bg-stone-300 w-full min-h-11/12 border-2 border-stone-600 rounded-xl overflow-y-auto max-h-[500px] text-stone-900 p-4 text-left">
                    {(result.length === 0 || !result) && loading === false &&
                        <div>Run a report to show metrics here.</div>
                    }
                    {loading && 
                        <div className='flex space-x-2 justify-center items-center h-min pt-8'>
                            <div className='h-6 w-6 bg-stone-800 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                            <div className='h-6 w-6 bg-stone-800 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                            <div className='h-6 w-6 bg-stone-800 rounded-full animate-bounce'></div>
                        </div>
                    }
                    {result.map((qa, i) => {
                        return (
                            <Fragment key={i}>
                                <p className="font-semibold">
                                    {qa[0]} {/* Render the question */}
                                </p>
                                {typeof qa[1] === "string" ? (
                                    <p className='pb-6'>{qa[1] as string}</p>
                                ) : (
                                    <div className="pb-6">
                                    {/* Render the object answer */}
                                    {qa[1] && Array.isArray(qa[1]) && qa[1].map((topic, index) => (
                                        <div key={index} className="pl-4">
                                            <p><strong>{topic.topic}</strong></p>
                                            <p><strong>Summary:</strong> {topic.summary}</p>
                                            <p><strong>Keywords:</strong> {topic.keywords.join(", ")}</p>
                                            <p><strong>Count:</strong> {topic.count}</p>
                                            <p><strong>Responses:</strong></p>
                                            <ul>
                                                {topic.responses.map((response, idx) => (
                                                    <li key={idx}>{response}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                    {qa[1].length === 0 && <p>Themes could not be processed, please adjust inputs and try again. </p>}
                                </div>
                                )}
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}