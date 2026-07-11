import { API_URL } from "../config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import RadarChart from "../components/RadarChart";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function FacultyDashboard({ user, token, onLogout }) {
  const [students, setStudents] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard & Modal filters
  const [selectedSemester, setSelectedSemester] = useState("Sem 4");
  const [activeInspectorStudent, setActiveInspectorStudent] = useState(null);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello Prof. Sunita Deshmukh! I am your AI Faculty Assistant. Ask me to preview class growth, list struggling students, or draft recommendations!" }
  ]);
  const [userInput, setUserInput] = useState("");

  const fetchStudentsData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/portfolio/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);

      // Parse pending items across all portfolios
      const pending = [];
      res.data.forEach((student) => {
        const types = ["projects", "hackathons", "research", "internships", "certificates", "achievements"];
        types.forEach((type) => {
          if (student[type]) {
            student[type].forEach((item) => {
              if (item.verificationStatus === "Pending") {
                pending.push({
                  studentId: student.studentId,
                  studentName: student.fullName,
                  itemType: type,
                  itemId: item._id,
                  title: item.title || item.name || "Achievement Item",
                  detail: item.techStack || item.issuer || item.company || item.description || "",
                  pdfUrl: item.pdfUrl || "",
                  semester: item.semester || "Sem 4"
                });
              }
            });
          }
        });
      });
      setPendingItems(pending);
    } catch (err) {
      console.error("Error loading students list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, [token]);

  const handleVerify = async (studentId, itemType, itemId, status) => {
    try {
      await axios.post(
        `${API_URL}/api/portfolio/verify-item`,
        { studentId, itemType, itemId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Item successfully ${status === "Approved" ? "approved" : "rejected"}!`);
      fetchStudentsData();
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Verification update failed.");
    }
  };

  // Mock Report Export Handlers
  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,PRN,Student Name,Innovation Index,Projects,Publications,Certificates\n";
    students.forEach((s, idx) => {
      csvContent += `${idx+1},${s.prn},${s.fullName},${s.innovationScore}%,${s.projects?.length || 0},${s.research?.length || 0},${s.certificates?.length || 0}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SIGA_Student_Metrics_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = () => {
    alert("NAAC Innovation Index & Student Growth Report generated! Print window opening...");
    window.print();
  };

  // AI Chatbot Logic
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const userMsg = userInput.trim();
    const newMsgs = [...chatMessages, { sender: "user", text: userMsg }];
    setChatMessages(newMsgs);
    setUserInput("");

    setTimeout(() => {
      let aiResponse = "";
      const lower = userMsg.toLowerCase();
      if (lower.includes("growth") || lower.includes("preview")) {
        aiResponse = "Class Growth Preview: Class Innovation index averages 87%, showing a 15% increase since Sem 3. Web Dev projects dominate. 1 student (Amit Desai) needs mentoring in research papers.";
      } else if (lower.includes("rahul") || lower.includes("patil")) {
        aiResponse = "Rahul Patil is your top performer with 92% score. His startup 'Smart AgriTech' (MVP stage) is highly viable. Recommend early incubation seeding.";
      } else if (lower.includes("struggling") || lower.includes("low")) {
        aiResponse = "Amit Desai is currently lowest in AI & ML with 78% due to empty Research & Internship records. Nudging him is recommended.";
      } else {
        aiResponse = "I have noted your request. I recommend generating the NAAC growth report or sending nudges to students with low research scores.";
      }
      setChatMessages([...newMsgs, { sender: "ai", text: aiResponse }]);
    }, 800);
  };

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f172a" }}>Loading faculty database...</div>;
  }

  // Summary Metrics
  const totalCount = students.length;
  const pendingCount = pendingItems.length;
  const avgScore = totalCount > 0 ? Math.round(students.reduce((acc, curr) => acc + curr.innovationScore, 0) / totalCount) : 0;

  // Chart data calculations
  const approvedCount = students.reduce((acc, s) => {
    const types = ["projects", "hackathons", "research", "internships", "certificates", "achievements"];
    let count = 0;
    types.forEach(t => { if (s[t]) s[t].forEach(item => { if (item.verificationStatus === "Approved") count++; }); });
    return acc + count;
  }, 0);

  const rejectedCount = students.reduce((acc, s) => {
    const types = ["projects", "hackathons", "research", "internships", "certificates", "achievements"];
    let count = 0;
    types.forEach(t => { if (s[t]) s[t].forEach(item => { if (item.verificationStatus === "Rejected") count++; }); });
    return acc + count;
  }, 0);

  // Innovation trend mock coordinates
  const innovationTrendData = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    datasets: [
      {
        label: "Class Average Score",
        data: [42, 59, 72, avgScore],
        borderColor: "#a78bfa",
        backgroundColor: "rgba(167, 139, 250, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "#a78bfa",
      }
    ]
  };

  // Project categories counts
  const categoriesData = {
    labels: ["Web Dev", "AI & ML", "IoT & Embedded", "Cloud Systems"],
    datasets: [
      {
        data: [5, 4, 3, 2],
        backgroundColor: ["#818cf8", "#f43f5e", "#fbbf24", "#10b981"],
        borderWidth: 0
      }
    ]
  };

  // Approval statistics counts
  const approvalStatsData = {
    labels: ["Approved", "Pending", "Refused"],
    datasets: [
      {
        data: [approvedCount || 12, pendingCount || 2, rejectedCount || 1],
        backgroundColor: ["#10b981", "#fbbf24", "#f43f5e"],
        borderWidth: 0
      }
    ]
  };

  // Department Comparison
  const deptData = {
    labels: ["CSE", "AI & ML", "Data Science", "Cybersecurity"],
    datasets: [
      {
        label: "Average Innovation %",
        data: [82, avgScore, 79, 75],
        backgroundColor: ["rgba(96, 165, 250, 0.6)", "rgba(167, 139, 250, 0.6)", "rgba(16, 185, 129, 0.6)", "rgba(244, 63, 94, 0.6)"],
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)"
      }
    ]
  };

  // Inspector student scores
  const getInspectorGrowthData = (scores) => {
    const s = scores || { s1: 30, s2: 45, s3: 60, s4: 75, s5: 85, s6: 90 };
    return {
      labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
      datasets: [
        {
          label: "Growth Index",
          data: [s.s1, s.s2, s.s3, s.s4],
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          tension: 0.3,
          fill: true,
          pointBackgroundColor: "#818cf8"
        }
      ]
    };
  };

  return (
    <div className="faculty-dashboard-scope">
      <div className="container" style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1" }}>
          
          {/* HEADER */}
          <div className="page-header">
            <div>
              <h1>Faculty Advisory Console</h1>
              <p className="subtitle">Division A · Computer Science · Semester 4</p>
            </div>
            <div className="filter-bar" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "#fff", padding: "8px", borderRadius: "6px" }}
              >
                <option value="Sem 4">Assigned Semesters: Sem 4</option>
                <option value="Sem 3">Assigned Semesters: Sem 3</option>
                <option value="Sem 2">Assigned Semesters: Sem 2</option>
              </select>
            </div>
          </div>

          {/* FACULTY PROFILE CARD & QUICK ACTIONS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
            {/* PROFILE CARD */}
            <div className="chart-card" style={{ display: "flex", gap: "16px", padding: "20px", alignItems: "center" }}>
              <div style={{ background: "rgba(167, 139, 250, 0.15)", width: "64px", height: "64px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>
                <i className="fas fa-chalkboard-user" style={{ fontSize: "28px" }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "16px", color: "white" }}>{user.fullName || "Prof. Sunita Deshmukh"}</strong>
                <div style={{ display: "flex", gap: "14px", marginTop: "6px", fontSize: "13px", color: "#94a3b8" }}>
                  <span>ID: <strong>FAC-2410-CS</strong></span>
                  <span>Dept: <strong>{user.department || "AI & ML"}</strong></span>
                  <span>Login: <strong>Today, 02:45 PM</strong></span>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS CARD */}
            <div className="chart-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px", padding: "20px" }}>
              <h4 style={{ fontSize: "13px", color: "#94a3b8", textTransform: "uppercase" }}>Quick Actions Section</h4>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={handleGenerateReport} style={{ flex: 1, padding: "10px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                  <i className="fas fa-file-pdf" style={{ marginRight: "6px" }}></i> Generate Report
                </button>
                <button onClick={handleExportExcel} style={{ flex: 1, padding: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                  <i className="fas fa-file-excel" style={{ marginRight: "6px" }}></i> Export Excel
                </button>
              </div>
            </div>
          </div>

          {/* AI CLASS GROWTH PREVIEW PANEL */}
          <div style={{ background: "rgba(167, 139, 250, 0.08)", border: "1px solid rgba(167, 139, 250, 0.2)", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "#a78bfa", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
              <i className="fas fa-brain"></i>
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: "#a78bfa" }}>AI Advisor Growth Preview</strong>
              <p style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "2px" }}>
                Class performance is outstanding with an average Innovation Score of <strong>{avgScore}%</strong>. High innovators are strong in Cloud and AI, while Amit Desai requires mentoring on Research Paper publication criteria.
              </p>
            </div>
          </div>

          {/* KPI METRICS ROW */}
          <div className="kpi-row" style={{ marginBottom: "28px" }}>
            <div className="kpi-card">
              <div className="kpi-val">{totalCount}</div>
              <div className="kpi-label">Total Students</div>
            </div>
            <div className="kpi-card accent">
              <div className="kpi-val">{avgScore}%</div>
              <div className="kpi-label">Avg Innovation Index</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val">{students.filter(s => s.innovationScore >= 80).length}</div>
              <div className="kpi-label">High Innovators</div>
            </div>
            <div className="kpi-card danger">
              <div className="kpi-val">{students.filter(s => s.innovationScore < 80).length}</div>
              <div className="kpi-label">Need Mentoring</div>
            </div>
          </div>

          {/* ANALYTICS CHARTS SECTION */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            
            {/* i) Innovation Trend */}
            <div className="chart-card" style={{ height: "280px" }}>
              <div className="card-header"><h4>i) Innovation Trend</h4></div>
              <div style={{ height: "200px" }}><Line data={innovationTrendData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>

            {/* ii) Project Categories */}
            <div className="chart-card" style={{ height: "280px" }}>
              <div className="card-header"><h4>ii) Project Categories</h4></div>
              <div style={{ height: "200px", display: "flex", justifyContent: "center" }}><Doughnut data={categoriesData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>

            {/* iii) Approval Statistics */}
            <div className="chart-card" style={{ height: "280px" }}>
              <div className="card-header"><h4>iii) Approval Statistics</h4></div>
              <div style={{ height: "200px", display: "flex", justifyContent: "center" }}><Doughnut data={approvalStatsData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>

            {/* v) Department Comparison */}
            <div className="chart-card" style={{ height: "280px" }}>
              <div className="card-header"><h4>v) Department Comparison</h4></div>
              <div style={{ height: "200px" }}><Bar data={deptData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
          </div>

          {/* iv) Notification Panel & vi) Verification Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: "24px", marginBottom: "32px" }}>
            
            {/* Notification Panel */}
            <div className="chart-card">
              <div className="card-header">
                <h3><i className="fas fa-bell" style={{ color: "#fb923c", marginRight: "8px" }}></i> iv) Notification Panel</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <strong style={{ color: "#38bdf8" }}>Rahul Patil</strong> uploaded <span style={{ color: "#a78bfa" }}>Internship PDF</span> (TCS Research) · Sem 3
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <strong style={{ color: "#38bdf8" }}>Priya Nair</strong> submitted <span style={{ color: "#fb923c" }}>Research Paper PDF</span> (Springer MRI) · Sem 4
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <strong style={{ color: "#38bdf8" }}>Amit Desai</strong> updated <span style={{ color: "#10b981" }}>Project Card</span> (ROS Autonomous Nav) · Sem 3
                </div>
              </div>
            </div>

            {/* Verification cards / Queue */}
            <div className="chart-card">
              <div className="card-header">
                <h3><i className="fas fa-check-double" style={{ color: "#10b981", marginRight: "8px" }}></i> vi) Verification Queue</h3>
                <span className="badge">{pendingCount} Pending</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                {pendingItems.length > 0 ? (
                  pendingItems.map((item, idx) => (
                    <div key={idx} style={{ padding: "14px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <strong style={{ color: "white" }}>{item.studentName}</strong>
                        <span style={{ fontSize: "11px", color: "#a78bfa", textTransform: "capitalize" }}>{item.itemType}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "10px" }}>"{item.title}" ({item.detail})</p>
                      
                      {item.pdfUrl && (
                        <div style={{ marginBottom: "10px" }}>
                          <a href={item.pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#38bdf8", textDecoration: "none" }}>
                            <i className="far fa-file-pdf" style={{ marginRight: "4px" }}></i> View Attached PDF
                          </a>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => handleVerify(item.studentId, item.itemType, item.itemId, "Approved")} style={{ background: "#10b981", border: "none", color: "#fff", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Approve</button>
                        <button onClick={() => handleVerify(item.studentId, item.itemType, item.itemId, "Rejected")} style={{ background: "transparent", border: "1px solid #f43f5e", color: "#f43f5e", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Reject</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "20px" }}>Verification queue is empty.</p>
                )}
              </div>
            </div>
          </div>

          {/* RANKINGS & INSPECT STUDENT TRIGGER */}
          <div className="chart-card full" style={{ marginBottom: "32px" }}>
            <div className="card-header">
              <h3>
                <i className="fas fa-list-ol" style={{ color: "#fbbf24", marginRight: "8px" }}></i>
                Student Cohort (Click Student Name to preview Dashboard)
              </h3>
            </div>
            <table className="rank-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>PRN</th>
                  <th>Student Name</th>
                  <th>Innovation score</th>
                  <th>Projects</th>
                  <th>Papers</th>
                  <th>Startup Registered</th>
                  <th>Nudge Notification</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.prn}</td>
                    <td>
                      <span 
                        onClick={() => { setActiveInspectorStudent(s); setShowInspectorModal(true); }}
                        style={{ color: "#38bdf8", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
                      >
                        {s.fullName}
                      </span>
                    </td>
                    <td style={{ color: "#38bdf8", fontWeight: "700" }}>{s.innovationScore}%</td>
                    <td>{s.projects?.length || 0}</td>
                    <td>{s.research?.length || 0}</td>
                    <td>{s.startupInfo?.hasStartup ? "Yes (MVP)" : "No"}</td>
                    <td>
                      <button onClick={() => alert(`Nudge successfully sent to ${s.fullName}!`)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#fff", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                        Nudge Student
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {/* DETAILED STUDENT DASHBOARD INSPECTOR MODAL */}
      {showInspectorModal && activeInspectorStudent && (
        <div className="modal-overlay" onClick={() => setShowInspectorModal(false)} style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.9)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", width: "90%", maxWidth: "980px", padding: "28px", color: "white", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#a78bfa", fontWeight: "700", textTransform: "uppercase" }}>Student Dashboard Inspector</span>
                <h2 style={{ fontSize: "22px", fontWeight: "700", marginTop: "4px" }}>{activeInspectorStudent.fullName} ({activeInspectorStudent.prn})</h2>
              </div>
              <button onClick={() => setShowInspectorModal(false)} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "28px", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              {/* Innovation Wheel */}
              <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", height: "300px" }}>
                <h3 style={{ fontSize: "14px", marginBottom: "12px" }}>Innovation Wheel (Radar)</h3>
                <div style={{ height: "230px" }}>
                  <RadarChart metrics={activeInspectorStudent.radarMetrics || { research: 50, technical: 50, entrepreneurship: 50, collaboration: 50, creativity: 50, leadership: 50 }} />
                </div>
              </div>
              
              {/* Semester Growth Graph */}
              <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", height: "300px" }}>
                <h3 style={{ fontSize: "14px", marginBottom: "12px" }}>Semester Growth Graph</h3>
                <div style={{ height: "230px" }}>
                  <Line data={getInspectorGrowthData(activeInspectorStudent.semesterScores)} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Achievements details listing */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Projects */}
              <div style={{ background: "rgba(30,41,59,0.5)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ color: "#38bdf8", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px", marginBottom: "12px" }}>Projects</h4>
                {activeInspectorStudent.projects && activeInspectorStudent.projects.length > 0 ? (
                  activeInspectorStudent.projects.map((p, idx) => (
                    <div key={idx} style={{ marginBottom: "10px", fontSize: "13px" }}>
                      <strong>{p.title}</strong> ({p.semester})
                      <p style={{ color: "#94a3b8", fontSize: "12px" }}>{p.description}</p>
                      {p.pdfUrl && <a href={p.pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#38bdf8" }}>View PDF</a>}
                    </div>
                  ))
                ) : <p style={{ color: "#94a3b8", fontSize: "12px" }}>No projects uploaded.</p>}
              </div>

              {/* Startup details if any */}
              <div style={{ background: "rgba(30,41,59,0.5)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ color: "#fb923c", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px", marginBottom: "12px" }}>Startup Info</h4>
                {activeInspectorStudent.startupInfo?.hasStartup ? (
                  <div style={{ fontSize: "13px" }}>
                    <p style={{ marginBottom: "6px" }}>Name: <strong>{activeInspectorStudent.startupInfo.startupName}</strong></p>
                    <p style={{ marginBottom: "6px" }}>Stage: <strong>{activeInspectorStudent.startupInfo.startupStage}</strong></p>
                    <p style={{ marginBottom: "6px" }}>Category: <strong>{activeInspectorStudent.startupInfo.startupCategory}</strong></p>
                    <p style={{ color: "#cbd5e1" }}>Pitch: {activeInspectorStudent.startupInfo.startupIdea}</p>
                  </div>
                ) : <p style={{ color: "#94a3b8", fontSize: "12px" }}>No startup registered.</p>}
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button onClick={() => setShowInspectorModal(false)} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer" }}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* vii) Floating AI Assistant */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 999 }}>
        <button 
          onClick={() => setShowChatbot(!showChatbot)}
          style={{ background: "#a78bfa", border: "none", width: "56px", height: "56px", borderRadius: "50%", color: "#0f172a", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 15px -3px rgba(167,139,250,0.4)" }}
        >
          <i className="fas fa-robot"></i>
        </button>

        {showChatbot && (
          <div style={{ position: "absolute", bottom: "72px", right: 0, width: "340px", height: "420px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)", overflow: "hidden" }}>
            <div style={{ background: "#a78bfa", padding: "14px 18px", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontWeight: "700" }}>AI Faculty Assistant</strong>
              <span onClick={() => setShowChatbot(false)} style={{ cursor: "pointer", fontSize: "20px" }}>&times;</span>
            </div>
            <div style={{ flex: 1, padding: "14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {chatMessages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", background: m.sender === "user" ? "#a78bfa" : "rgba(255,255,255,0.05)", color: m.sender === "user" ? "#0f172a" : "white", padding: "10px 14px", borderRadius: "12px", maxWidth: "80%", fontSize: "13px" }}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#0f172a", padding: "8px" }}>
              <input 
                type="text" 
                placeholder="Ask about class growth or Rahul..." 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", color: "white", padding: "8px", outline: "none", fontSize: "13px" }}
              />
              <button type="submit" style={{ background: "#a78bfa", border: "none", color: "#0f172a", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Send</button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
