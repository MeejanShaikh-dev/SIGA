import { API_URL } from "../config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HODDashboard({ user, token, onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for Top Student (Rahul Patil) Details Modal
  const [showRahulModal, setShowRahulModal] = useState(false);
  const [rahulCategory, setRahulCategory] = useState("");
  const [rahulItems, setRahulItems] = useState([]);

  // AI recommendations state
  const [aiRecs, setAiRecs] = useState([
    "💡 [Critical] 15 items in Computer Science Sem 4 are pending verification. Nudge faculty advisor Prof. Sunita Deshmukh.",
    "💡 [NAAC Target] Increase student internship participation rate from 45% to 60% before next semester audit.",
    "💡 [Incubation Alert] Seed prototype 'Smart AgriTech' by Rahul Patil (TY AI&ML) for college incubator funding.",
    "💡 [Placement Nudge] 22% of final year students remain unplaced. Schedule mock interview drives next week."
  ]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/hod/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error loading HOD analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f172a" }}>Loading institutional database...</div>;
  }

  // Fallbacks if backend doesn't return full structure
  const summary = analytics?.summary || { totalStudents: 650, totalFaculty: 24, averageInnovationScore: 84, researchPapers: 56 };
  const departmentStats = analytics?.departmentStats || [
    { name: "AI & ML", count: 120, avgScore: 87, status: "Excellent" },
    { name: "Data Science", count: 102, avgScore: 82, status: "Good" },
    { name: "Cyber Security", count: 90, avgScore: 79, status: "Average" },
    { name: "Computer Science", count: 338, avgScore: 84, status: "Excellent" }
  ];

  // Department Insights Percentages
  const insights = {
    innovation: 84,
    research: 56,
    internship: 45,
    patent: 28,
    placement: 78
  };

  // Color coding helper: 0-30 red, 31-60 yellow, 61-100 green
  const getInsightColor = (val) => {
    if (val <= 30) return "#ef4444"; // red
    if (val <= 60) return "#fb923c"; // orange/yellow
    return "#10b981"; // green
  };

  // Department comparison bar chart data
  const comparisonData = {
    labels: departmentStats.map(d => d.name),
    datasets: [
      {
        label: "Innovation Score Average",
        data: departmentStats.map(d => d.avgScore),
        backgroundColor: ["rgba(167, 139, 250, 0.6)", "rgba(96, 165, 250, 0.6)", "rgba(244, 63, 94, 0.6)", "rgba(16, 185, 129, 0.6)"],
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)"
      }
    ]
  };

  const comparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
      y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" }, min: 0, max: 100 }
    }
  };

  // Faculty Performance Mock Data
  const facultyPerformance = [
    { name: "Prof. Sunita Deshmukh", students: 120, avgScore: 87, research: 15, pending: 2, internships: 18, achievements: 9 },
    { name: "Dr. Amit Rawat", students: 102, avgScore: 82, research: 12, pending: 5, internships: 14, achievements: 6 },
    { name: "Prof. Sneha Patil", students: 90, avgScore: 79, research: 8, pending: 8, internships: 10, achievements: 4 }
  ];

  // Rahul Patil mock files for HOD highlight click
  const rahulPortfolioMock = {
    projects: [
      { title: "AI Face Recognition System", techStack: "Python, TensorFlow", status: "Approved", detail: "Real-time face detection with 98% accuracy." },
      { title: "IoT Smart Dustbin", techStack: "Arduino, Firebase", status: "Pending", detail: "Detects waste levels and notifies municipal nodes." }
    ],
    research: [
      { title: "Deep Learning in Smart Agriculture", journal: "IEEE Access", status: "Approved", detail: "Detection of crop diseases using computer vision." }
    ],
    certificates: [
      { title: "AWS Cloud Practitioner", issuer: "Amazon Web Services", status: "Approved" },
      { title: "TensorFlow Developer Certification", issuer: "Google", status: "Approved" }
    ],
    internship: [
      { title: "ML Intern", company: "TCS Research", status: "Approved", detail: "Time-series anomaly detection algorithms." }
    ],
    achievement: [
      { title: "Dean's List Award", detail: "Achieved highest SGPA in department during Sem 2.", status: "Approved" }
    ]
  };

  const handleRahulClick = (category) => {
    setRahulCategory(category);
    setRahulItems(rahulPortfolioMock[category] || []);
    setShowRahulModal(true);
  };

  const handleExportExcel = () => {
    alert("Exporting Institutional Academics Ledger to Excel (CSV)...");
    let csv = "Faculty Name,Assigned Students,Innovation Avg,Research Papers,Pending Reviews\n";
    facultyPerformance.forEach(f => {
      csv += `"${f.name}",${f.students},${f.avgScore}%,${f.research},${f.pending}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Institutional_Advisory_Ledger.csv";
    link.click();
  };

  const handleGenerateReport = (type) => {
    alert(`${type} generated successfully! Print utility starting...`);
    window.print();
  };

  return (
    <div className="hod-dashboard-scope">
      <div className="container" style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1" }}>
          
          {/* HEADER */}
          <div className="page-header">
            <div>
              <h1>HOD Institutional Panel</h1>
              <p className="subtitle">Department of Computer Science & AI · JSPM University</p>
            </div>
            {/* Quick Actions Panel */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleGenerateReport("Institutional NAAC accreditation report")} style={{ background: "rgba(167, 139, 250, 0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                <i className="fas fa-file-pdf" style={{ marginRight: "6px" }}></i> NAAC Report
              </button>
              <button onClick={() => handleGenerateReport("Institutional Growth Report")} style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                <i className="fas fa-chart-line" style={{ marginRight: "6px" }}></i> Growth Report
              </button>
              <button onClick={handleExportExcel} style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                <i className="fas fa-file-csv" style={{ marginRight: "6px" }}></i> Export Excel
              </button>
            </div>
          </div>

          {/* i) Department Overview (Top Metrics) */}
          <div className="kpi-row" style={{ marginBottom: "28px" }}>
            <div className="kpi-card">
              <div className="kpi-val">650+</div>
              <div className="kpi-label">Students Registered</div>
            </div>
            <div className="kpi-card accent">
              <div className="kpi-val">24+</div>
              <div className="kpi-label">Faculty Advisors</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val">78%</div>
              <div className="kpi-label">Placement Rate</div>
            </div>
            <div className="kpi-card danger">
              <div className="kpi-val">15</div>
              <div className="kpi-label">Pending Reviews</div>
            </div>
          </div>

          {/* ii) Department Insights Row (Colored Circles) */}
          <div className="chart-card full" style={{ marginBottom: "28px" }}>
            <div className="card-header">
              <h3><i className="fas fa-lightbulb" style={{ color: "#fb923c", marginRight: "8px" }}></i> ii) Department Insights</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "20px", padding: "10px 0" }}>
              {Object.entries(insights).map(([key, val]) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(30,41,59,0.3)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{
                    width: "72px", height: "72px", borderRadius: "50%", border: `4px solid ${getInsightColor(val)}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color: getInsightColor(val), marginBottom: "10px"
                  }}>
                    {val}%
                  </div>
                  <span style={{ textTransform: "capitalize", fontSize: "13px", color: "#cbd5e1" }}>{key} Score</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
            {/* iii) Department comparison barchart */}
            <div className="chart-card" style={{ height: "320px" }}>
              <div className="card-header">
                <h3><i className="fas fa-chart-bar" style={{ color: "#38bdf8", marginRight: "8px" }}></i> iii) Department Comparison</h3>
              </div>
              <div style={{ height: "230px" }}>
                <Bar data={comparisonData} options={comparisonOptions} />
              </div>
            </div>

            {/* vi) AI Console */}
            <div className="chart-card" style={{ height: "320px" }}>
              <div className="card-header">
                <h3><i className="fas fa-robot" style={{ color: "#a78bfa", marginRight: "8px" }}></i> vi) AI Recommendations Console</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "230px", overflowY: "auto" }}>
                {aiRecs.map((rec, idx) => (
                  <div key={idx} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", color: "#cbd5e1" }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* iv) Faculty Performance Table */}
          <div className="chart-card full" style={{ marginBottom: "28px" }}>
            <div className="card-header">
              <h3><i className="fas fa-users-cog" style={{ color: "#10b981", marginRight: "8px" }}></i> iv) Faculty Performance Metrics</h3>
            </div>
            <table className="rank-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Students Coordinated</th>
                  <th>Innovation Average</th>
                  <th>Research Papers</th>
                  <th>Internships Registered</th>
                  <th>Achievements</th>
                  <th>Pending Queue</th>
                </tr>
              </thead>
              <tbody>
                {facultyPerformance.map((f, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "600" }}>{f.name}</td>
                    <td>{f.students}</td>
                    <td style={{ color: "#38bdf8", fontWeight: "700" }}>{f.avgScore}%</td>
                    <td>{f.research}</td>
                    <td>{f.internships}</td>
                    <td>{f.achievements}</td>
                    <td>
                      <span className="level-pill" style={{ background: f.pending > 3 ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)", color: f.pending > 3 ? "#f43f5e" : "#34d399" }}>
                        {f.pending} items
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "24px", marginBottom: "28px" }}>
            {/* v) Top Student Highlight Card */}
            <div className="chart-card">
              <div className="card-header">
                <h3><i className="fas fa-trophy" style={{ color: "#fbbf24", marginRight: "8px" }}></i> v) Top Institutional Innovator</h3>
              </div>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ background: "rgba(251,191,36,0.1)", width: "72px", height: "72px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "#fbbf24" }}>
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "18px", color: "white" }}>Rahul Patil (TY AI&ML)</strong>
                  <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>Innovation Score: <strong style={{ color: "#38bdf8" }}>92%</strong> · Startup Stage: <strong style={{ color: "#fb923c" }}>MVP (Smart AgriTech)</strong></p>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginTop: "20px" }}>
                <button onClick={() => handleRahulClick("projects")} style={{ padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Projects</button>
                <button onClick={() => handleRahulClick("research")} style={{ padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Research</button>
                <button onClick={() => handleRahulClick("certificates")} style={{ padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Certificates</button>
                <button onClick={() => handleRahulClick("internship")} style={{ padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Internships</button>
                <button onClick={() => handleRahulClick("achievement")} style={{ padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "white", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>Achievements</button>
              </div>
            </div>

            {/* vii) Recent Department Activity feed */}
            <div className="chart-card">
              <div className="card-header">
                <h3><i className="fas fa-history" style={{ color: "#38bdf8", marginRight: "8px" }}></i> vii) Recent Department Activity</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto", fontSize: "13px" }}>
                <p style={{ color: "#cbd5e1" }}>• Rahul Patil uploaded Internship PDF (TCS Research)</p>
                <p style={{ color: "#cbd5e1" }}>• Priya Nair uploaded Research Paper (Brain MRI)</p>
                <p style={{ color: "#cbd5e1" }}>• Amit Desai updated Project (Autonomous Indoor Robot Navigation)</p>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* RAHUL PATIL PROFILE CATEGORY INSPECTOR MODAL */}
      {showRahulModal && (
        <div className="modal-overlay" onClick={() => setShowRahulModal(false)} style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", width: "90%", maxWidth: "600px", padding: "28px", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: "#fbbf24", fontWeight: "700", textTransform: "uppercase" }}>Top Student Records</span>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>Rahul Patil - {rahulCategory.charAt(0).toUpperCase() + rahulCategory.slice(1)}</h3>
              </div>
              <button onClick={() => setShowRahulModal(false)} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "24px", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "300px", overflowY: "auto" }}>
              {rahulItems.length > 0 ? (
                rahulItems.map((item, idx) => (
                  <div key={idx} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong style={{ color: "#38bdf8" }}>{item.title || item.name}</strong>
                      <span style={{ fontSize: "11px", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "2px 6px", borderRadius: "4px" }}>{item.status}</span>
                    </div>
                    {item.techStack && <p style={{ fontSize: "12px", color: "#94a3b8" }}>Stack: {item.techStack}</p>}
                    {item.issuer && <p style={{ fontSize: "12px", color: "#94a3b8" }}>Issuer: {item.issuer}</p>}
                    {item.company && <p style={{ fontSize: "12px", color: "#94a3b8" }}>Company: {item.company}</p>}
                    {item.detail && <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>{item.detail}</p>}
                  </div>
                ))
              ) : (
                <p style={{ color: "#94a3b8", textAlign: "center" }}>No records registered in this category.</p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button onClick={() => setShowRahulModal(false)} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
