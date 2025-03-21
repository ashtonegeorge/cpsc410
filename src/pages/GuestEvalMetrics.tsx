import { useState } from 'react';
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function GuestEvalMetrics() {
    const [gradeMetric, setGradeMetric] = useState('');

    const saveGradeMetric = () => {
        console.log('Saved Grade Metric:', gradeMetric);
        return Promise.resolve();
    };

    return (
        <>
            <h2 className="text-lg mb-4">Guest Evaluations Metrics</h2>
            <div className="flex items-center justify-center min-h-80"> {/* Changed min-h-80 to min-h-screen for full height */}
                <div className="flex flex-col items-center"> 
                    <div className="flex flex-col w-full max-w-xs">
                        <div className="mb-6"> {/* Increased margin-bottom to push the button lower */}
                            <TextField 
                                label="Enter Grade Metric" 
                                setValue={setGradeMetric} 
                            />
                        </div>
                        
                        <div className="mb-2"> 
                            <Button 
                                label="Save"
                                action={saveGradeMetric} icon={null}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}