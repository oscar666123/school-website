import React, { useEffect, useState } from 'react';
import { getClassesForTeacher } from 'components/DB';
import { Bar } from 'react-chartjs-2';

const dynamicFields = [
    {label: 'Lowest', backgroundColor: 'rgba(214,47,47)'},
    //{label: 'Median', backgroundColor: 'rgba(255,153,51,1)'},
    {label: 'Average', backgroundColor: 'rgba(255,255,51,1)'},
    {label: 'Highest', backgroundColor: 'rgba(51,204,51,1)'}
];
const dataTemplate = {
    labels: [],
    datasets: dynamicFields.map(dataType => {
        return {
            label: dataType.label,
            backgroundColor: dataType.backgroundColor,
            type: 'bar',
            data: [],
            name: 'Position: right',
            maxBarThickness: 200,
            handler(chart) {
                chart.options.plugins.legend.position = 'right';
                chart.update();
            }
        }
    })
};

const calculatePerformance = (Class) => {
    let classGrades = [], classGradesSum = 0;
    let classLowest, classMedian, classAverage, classHighest;
    if (Class.performance.length === 0) {
        // Continue onto the next class if there is no performance recorded
        return;
    }
    Class.performance.forEach(grade => {
        classGradesSum += Number(grade);
        classGrades.push(grade);
        if (!classLowest || grade < classLowest) {
        classLowest = grade;
        }
        if (!classHighest || grade > classHighest) {
        classHighest = grade;
        }
    });
    if (classGradesSum.length === 0) {
        return null;
    }
    classGrades.sort();
    const middleInd = Math.floor(classGrades.length/2);
    classMedian = classGrades[middleInd];
    classAverage = classGradesSum/classGrades.length;

    return {
        lowest: classLowest,
        median: classMedian,
        average: classAverage,
        highest: classHighest
    }
}

const TeacherPortal = (user) => {
    const [classes, setClasses] = useState([{name: "Loading classes...", classId: "loading"}]);
    const [classId, setClassId] = useState();
    const [dataState, setDataState] = useState();

    const classTable = () => {
        let students = [];
        classes.forEach(classObj => {
            if (classObj.classId === classId) {
                if (classObj.students) {
                    students = classObj.students.sort((a,b) => {
                        if (a.displayName < b.displayName) {
                            return -1;
                        } else {
                            return 1;
                        }
                    });
                    for (let i=0; i<students.length; i++) {
                        if (!classObj.performanceObj) {
                            students[i].grade = "None";
                            continue;
                        }
                        students[i].grade = classObj.performanceObj[students[i].uid] || "None";
                    }
                }
            }
        });
        return (
            <>
                <table className="table table-sm table-bordered table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Student Name</th>
                            <th scope="col">Student ID</th>
                            <th scope="col">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => {
                            return (
                            <tr key={student.uid}>
                                <td>{student.displayName}</td>
                                <td>{student.studentId}</td>
                                <td>{student.grade}</td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </>
        )
    };

    useEffect(() => {
        const fetch = async () => {
            const response = await getClassesForTeacher();
            setClasses(response);
            if (response[0]) {
                setClassId(response[0].classId);
            } else {
                setClasses([{name: "No active classes", classId: "none"}]);
            }
        }
        fetch()
        .catch(error => {return;});
    }, []);

    useEffect(() => {
        const newData = JSON.parse(JSON.stringify(dataTemplate));
        if (!performance) {
            setDataState();
            return;
        }
        classes.forEach(classObj => {
            if (classObj.classId === classId) {
                newData.labels.push(classObj.name);
                let performance = calculatePerformance(classObj);
                if (!performance) {
                    
                    newData.labels = [""];
                    newData.datasets = [{label: "No data available for this class"}];
                    setDataState(newData);
                    return;
                }
                performance = Object.values(performance);
                for (let i=0; i<3; i++) {
                    if (i > 0) {
                        newData.datasets[i].data.push(performance[i+1]);
                        continue;
                    }
                    newData.datasets[i].data.push(performance[i]);
                }
                setDataState(newData);
            }
        });
    }, [classes, classId]);

    return (
        <>
            <div className="container rounded mt-5 p-2">
                <div className="row">
                    <div className="col">
                        <h2>Teacher Dashboard</h2>
                    </div>
                </div>
            </div>
            <div className="container rounded my-4 p-2">
                <div className="row mb-4">
                    <div className="col">
                        <h5 className="capitalise">Hello{user.displayName ? " " + user.displayName : ""},</h5>
                        <span>Your active classes can be found below.</span>
                    </div>
                </div>
                <div className="row mb-2 justify-content-center text-left">
                    <div className="col-4">
                        <select disabled={classes.length === 0 || classes[0].classId === "none" || classes[0].classId === "loading" ? true : false} 
                            className="form-control" id="class" value={classId} onChange={e => setClassId(e.target.value)}>
                            {classes.map(Class => {
                                return <option key={Class.classId} value={Class.classId}>{Class.name}</option>
                            })}
                        </select>
                    </div>
                </div>
                {classes.length > 0 && classes[0].classId !== "none" && classes[0].classId !== "loading" ? 
                    <>
                        <div className="row justify-content-center mb-4">
                            <div className="col-8">
                                <Bar
                                    data={dataState}
                                    height={300}
                                    width={600}
                                    options={{
                                        scales: {
                                            x: {
                                                stacked: true
                                            },
                                            y: {                
                                                stacked: false,
                                                beginAtZero: true,
                                                max: 100
                                            }
                                        },
                                        plugins: {
                                            tooltip: {
                                            reverse: true
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-8 table-responsive">
                                {classTable()}
                            </div>
                        </div>
                    </>
                    :
                    <></>
                }
            </div>
        </>
    );
}

export default TeacherPortal;