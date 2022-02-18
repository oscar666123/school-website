import React, { useState, useReducer, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { getPerformanceHistoryByDepartment, getTermInfo } from 'components/DB';

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

const StaffPortal = () => {
    const [searchParams, setSearchParams] = useState({year: "current", term: "current", yearLevel: 12});
    const [dataState, setDataState] = useState();
    const [validYears, setValidYears] = useState([]);
    const validYearRange = 5; // 5 years into the past
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        const fetch = async () => {
            const data = await getTermInfo();
            let vYears = [];
            // Allowing the user to select the year as a dropdown of up to 5 years into the past
            for (let i=0; i<=validYearRange; i++) {
                vYears.push(data.termInfo.year-i);
            }
            setValidYears(vYears);
        }
        fetch()
        .catch(error => {return});
    }, []);

    useEffect(() => {
        const loadingData = JSON.parse(JSON.stringify(dataTemplate));
        loadingData.labels = [""];
        loadingData.datasets = [{label: "Loading performance..."}];
        setDataState(loadingData);
        getPerformanceHistoryByDepartment(searchParams.year, searchParams.term, searchParams.yearLevel)
        .then(performance => {
            const newData = JSON.parse(JSON.stringify(dataTemplate));
            if (!performance) {
                newData.labels = [""];
                newData.datasets = [{label: "No data available for this year level"}];
                setDataState(newData);
                forceUpdate();
                return;
            }
            Object.keys(performance).forEach(department => {
                newData.labels.push(department);
                for (let i=0; i<3; i++) {
                    if (i > 0) {
                        newData.datasets[i].data.push(Object.values(performance[department])[i+1]);
                        continue;
                    }
                    newData.datasets[i].data.push(Object.values(performance[department])[i]);
                }
            });
            setDataState(newData);
            
        })
        .catch(error => {return});
    }, [searchParams]);
    
    return (
        <>
            <div className="container rounded mt-5 p-2">
                <div className="row">
                    <div className="col">
                        <h2>Staff Dashboard</h2>
                    </div>
                </div>
            </div>
            <div className="container rounded mt-4 p-2">
                <div className="row justify-content-center">
                    <div className="col">
                        <label htmlFor="year">Year</label>
                        <select className="form-control" id="year" value={searchParams.year} onChange={e => setSearchParams(oldSearchParams => {
                            return {
                                ...oldSearchParams,
                                year: e.target.value
                            }
                        })}>
                            <option value="current">Current Year</option>
                            {validYears.map(year => {
                                return <option key={year} value={year}>{year}</option>
                            })}
                        </select>
                    </div>
                    <div className="col">
                        <label htmlFor="terms">Term</label>
                        <select className="form-control" id="terms" value={searchParams.term}  onChange={e => setSearchParams(oldSearchParams => {
                            return {
                                ...oldSearchParams,
                                term: e.target.value
                            }
                        })}>
                            <option value="current">Current Term</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                        </select>
                    </div>
                    <div className="col">
                        <label htmlFor="yearLevel">Year Level</label>
                        <select className="form-control" id="yearLevel" value={searchParams.yearLevel} onChange={e => setSearchParams(oldSearchParams => {
                            return {
                                ...oldSearchParams,
                                yearLevel: e.target.value
                            }
                        })}>
                            <option value={12}>12</option>
                            <option value={11}>11</option>
                            <option value={10}>10</option>
                            <option value={9}>9</option>
                            <option value={8}>8</option>
                            <option value={7}>7</option>
                        </select>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col">
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
            </div>
        </>
    );
}

export default StaffPortal;