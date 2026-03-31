import React from 'react';
import './Overview.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', income: 4000 }, { name: 'Tue', income: 3000 },
    { name: 'Wed', income: 5000 }, { name: 'Thu', income: 2780 },
    { name: 'Fri', income: 1890 }, { name: 'Sat', income: 2390 },
    { name: 'Sun', income: 3490 },
];

function Overview() {
    const downloadReport = () => {
        const csvContent = "data:text/csv;charset=utf-8,Day,Income\n" 
            + data.map(row => `${row.name},${row.income}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "parkify_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="ov-wrap">
            <div className="ov-welcome">
                <h1>System Overview</h1>
                <button className="ov-btn" onClick={downloadReport}>
                    <span className="material-symbols-outlined" style={{fontSize: '18px'}}>download</span>
                    Download Report
                </button>
            </div>

            <div className="ov-stats">
                <div className="stat-card hover-card">
                    <span className="material-symbols-outlined icon-bg">payments</span>
                    <h3>$14,200</h3><p>Revenue</p>
                </div>
                <div className="stat-card hover-card">
                    <span className="material-symbols-outlined icon-bg">local_parking</span>
                    <h3>85%</h3><p>Occupancy</p>
                </div>
                <div className="stat-card hover-card">
                    <span className="material-symbols-outlined icon-bg">group</span>
                    <h3>1,284</h3><p>Daily Users</p>
                </div>
            </div>

            <div className="chart-section glass-card">
                <h3>Revenue Trends (Weekly)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="income" stroke="#AE8E82" fill="#AE8E8233" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
export default Overview;