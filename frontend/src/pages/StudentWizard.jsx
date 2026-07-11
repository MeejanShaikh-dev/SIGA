import { API_URL } from "../config";
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function StudentWizard({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedStep = searchParams.get("step");

  const stepMap = {
    personal: 0,
    academic: 1,
    projects: 2,
    hackathons: 3,
    research: 4,
    internship: 5,
    certificates: 6,
    achievements: 7,
    review: 8,
  };

  const stepsList = [
    { title: "Personal Info", key: "personal", icon: "fas fa-user" },
    { title: "Academics", key: "academic", icon: "fas fa-graduation-cap" },
    { title: "Projects", key: "projects", icon: "fas fa-folder-open" },
    { title: "Hackathons", key: "hackathons", icon: "fas fa-laptop-code" },
    { title: "Research", key: "research", icon: "fas fa-file-alt" },
    { title: "Internships", key: "internship", icon: "fas fa-building" },
    { title: "Certificates", key: "certificates", icon: "fas fa-award" },
    { title: "Achievements", key: "achievements", icon: "fas fa-medal" },
    { title: "Review & Submit", key: "review", icon: "fas fa-check-circle" },
  ];

  const [currentStep, setCurrentStep] = useState(
    requestedStep && stepMap[requestedStep] !== undefined ? stepMap[requestedStep] : 0
  );

  const [personalInfo, setPersonalInfo] = useState({
    email: "", phone: "", division: "", dob: "", gender: "Male",
    linkedIn: "", gitHub: "", portfolioWebsite: ""
  });
  
  const [academics, setAcademics] = useState({
    sgpa: 0, cgpa: 0, attendance: 0, backlogs: 0, creditsEarned: 0, creditsRemaining: 0,
    year: "First Year", semester: "Sem 1"
  });

  // Startup State
  const [startupInfo, setStartupInfo] = useState({
    hasStartup: false,
    startupName: "",
    startupIdea: "",
    startupStage: "Ideation",
    startupCategory: ""
  });

  const [projects, setProjects] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [research, setResearch] = useState([]);
  const [internships, setInternships] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/portfolio/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          const p = res.data;
          if (p.personalInfo) setPersonalInfo({ ...personalInfo, ...p.personalInfo });
          if (p.academics) setAcademics({ ...academics, ...p.academics });
          if (p.projects) setProjects(p.projects);
          if (p.hackathons) setHackathons(p.hackathons);
          if (p.research) setResearch(p.research);
          if (p.internships) setInternships(p.internships);
          if (p.certificates) setCertificates(p.certificates);
          if (p.achievements) setAchievements(p.achievements);
          if (p.startupInfo) setStartupInfo({ ...startupInfo, ...p.startupInfo });
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, [token]);

  // Handle direct step parameter update
  useEffect(() => {
    if (requestedStep && stepMap[requestedStep] !== undefined) {
      setCurrentStep(stepMap[requestedStep]);
    }
  }, [requestedStep]);

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        personalInfo,
        academics,
        projects,
        hackathons,
        research,
        internships,
        certificates,
        achievements,
        startupInfo,
      };

      await axios.post(`${API_URL}/api/portfolio/save`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Portfolio successfully saved and submitted for faculty review!");
      navigate("/student-dashboard");
    } catch (err) {
      console.error("Error saving portfolio:", err);
      alert("Failed to save portfolio.");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (list, setList, defaultObj) => {
    setList([...list, defaultObj]);
  };

  const removeItem = (list, setList, index) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleItemChange = (list, setList, index, field, value) => {
    const updated = list.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setList(updated);
  };

  const isStepComplete = (key) => {
    switch (key) {
      case "personal": return personalInfo.email !== "";
      case "academic": return academics.cgpa > 0;
      case "projects": return projects.length > 0;
      case "hackathons": return hackathons.length > 0;
      case "research": return research.length > 0;
      case "internship": return internships.length > 0;
      case "certificates": return certificates.length > 0;
      case "achievements": return achievements.length > 0;
      default: return false;
    }
  };

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading profile...</div>;
  }

  const completionPercent = ((currentStep + 1) / 9) * 100;

  return (
    <div className="student-wizard-scope">
      <div className="wizard-container" style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1", display: "flex", flexDirection: "column" }}>
          {/* PROGRESS HEADER */}
          <header className="topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#38bdf8" }}>
                <i className={stepsList[currentStep].icon} style={{ marginRight: "12px", color: "var(--purple)" }}></i>
                {stepsList[currentStep].title}
              </h1>
              <p style={{ color: "var(--text2)", fontSize: "14px" }}>Step {currentStep + 1} of 9 Sections</p>
            </div>
          </header>

          {/* PROGRESS BAR */}
          <div className="progress-container" style={{ background: "rgba(255,255,255,0.06)", height: "6px", borderRadius: "3px", marginBottom: "32px", overflow: "hidden" }}>
            <div className="progress-fill" style={{ background: "linear-gradient(90deg, #818cf8, #38bdf8)", width: `${completionPercent}%`, height: "100%", transition: "width 0.3s ease" }} />
          </div>

          {/* STEP VIEWS */}
          <div className="wizard-body" style={{ flex: "1", display: "flex", gap: "24px", minHeight: "0" }}>
            
            {/* LEFT AREA: active step form card */}
            <div className="wizard-form-container" style={{ flex: "1", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="form-card">
                <div className="form-card-body">
                  
                  {/* STEP 1: Personal Info & Startup Details */}
                  {currentStep === 0 && (
                    <div className="form-step">
                      <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                        <div className="form-row">
                          <label>Email ID</label>
                          <input type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
                        </div>
                        <div className="form-row">
                          <label>Phone Number</label>
                          <input type="text" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                        <div className="form-row">
                          <label>Division</label>
                          <input type="text" value={personalInfo.division} onChange={(e) => setPersonalInfo({ ...personalInfo, division: e.target.value })} placeholder="e.g. Div A" />
                        </div>
                        <div className="form-row">
                          <label>Gender</label>
                          <select value={personalInfo.gender} onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                        <div className="form-row">
                          <label>LinkedIn URL</label>
                          <input type="text" value={personalInfo.linkedIn} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedIn: e.target.value })} />
                        </div>
                        <div className="form-row">
                          <label>GitHub Profile</label>
                          <input type="text" value={personalInfo.gitHub} onChange={(e) => setPersonalInfo({ ...personalInfo, gitHub: e.target.value })} />
                        </div>
                      </div>

                      {/* STARTUP DETAILS SECTION */}
                      <div style={{ marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#38bdf8", marginBottom: "16px" }}>Startup & Incubation Profile</h3>
                        <div className="form-row" style={{ marginBottom: "16px" }}>
                          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "8px" }}>
                            <input type="checkbox" checked={startupInfo.hasStartup} onChange={(e) => setStartupInfo({ ...startupInfo, hasStartup: e.target.checked })} style={{ width: "18px", height: "18px" }} />
                            <span>I have a startup / entrepreneurship prototype</span>
                          </label>
                        </div>
                        {startupInfo.hasStartup && (
                          <>
                            <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                              <div className="form-row">
                                <label>Startup / Idea Name</label>
                                <input type="text" value={startupInfo.startupName} onChange={(e) => setStartupInfo({ ...startupInfo, startupName: e.target.value })} placeholder="E.g. AgriTech AI" />
                              </div>
                              <div className="form-row">
                                <label>Startup Category</label>
                                <input type="text" value={startupInfo.startupCategory} onChange={(e) => setStartupInfo({ ...startupInfo, startupCategory: e.target.value })} placeholder="E.g. Agriculture, Fintech" />
                              </div>
                            </div>
                            <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                              <div className="form-row">
                                <label>Current Stage</label>
                                <select value={startupInfo.startupStage} onChange={(e) => setStartupInfo({ ...startupInfo, startupStage: e.target.value })}>
                                  <option value="Ideation">Ideation / Research</option>
                                  <option value="MVP">Prototype / MVP</option>
                                  <option value="Incubation">Incubation / Acceleration</option>
                                  <option value="Scaling">Market Entry / Scaling</option>
                                </select>
                              </div>
                            </div>
                            <div className="form-row" style={{ marginBottom: "16px" }}>
                              <label>Startup Pitch / Brief Idea</label>
                              <textarea rows="3" value={startupInfo.startupIdea} onChange={(e) => setStartupInfo({ ...startupInfo, startupIdea: e.target.value })} placeholder="Describe your product idea, target audience, and progress..." />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Academics */}
                  {currentStep === 1 && (
                    <div className="form-step">
                      <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                        <div className="form-row">
                          <label>Current SGPA</label>
                          <input type="number" step="0.01" value={academics.sgpa} onChange={(e) => setAcademics({ ...academics, sgpa: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="form-row">
                          <label>Current CGPA</label>
                          <input type="number" step="0.01" value={academics.cgpa} onChange={(e) => setAcademics({ ...academics, cgpa: parseFloat(e.target.value) || 0 })} />
                        </div>
                      </div>
                      <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                        <div className="form-row">
                          <label>Attendance (%)</label>
                          <input type="number" value={academics.attendance} onChange={(e) => setAcademics({ ...academics, attendance: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="form-row">
                          <label>Active Backlogs</label>
                          <input type="number" value={academics.backlogs} onChange={(e) => setAcademics({ ...academics, backlogs: parseInt(e.target.value) || 0 })} />
                        </div>
                      </div>
                      <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                        <div className="form-row">
                          <label>Current Year</label>
                          <select value={academics.year} onChange={(e) => setAcademics({ ...academics, year: e.target.value })}>
                            <option>First Year</option>
                            <option>Second Year</option>
                            <option>Third Year</option>
                            <option>Final Year</option>
                          </select>
                        </div>
                        <div className="form-row">
                          <label>Current Semester</label>
                          <select value={academics.semester} onChange={(e) => setAcademics({ ...academics, semester: e.target.value })}>
                            <option>Sem 1</option>
                            <option>Sem 2</option>
                            <option>Sem 3</option>
                            <option>Sem 4</option>
                            <option>Sem 5</option>
                            <option>Sem 6</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Projects */}
                  {currentStep === 2 && (
                    <div className="form-step">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "14px", color: "var(--purple)" }}>My Added Projects</h3>
                        <button className="btn-primary" onClick={() => addItem(projects, setProjects, { title: "", techStack: "", description: "", githubLink: "", pdfUrl: "", semester: "Sem 4" })} style={{ padding: "8px 12px", fontSize: "12px" }}>
                          <i className="fas fa-plus" style={{ marginRight: "6px" }}></i> Add Project Card
                        </button>
                      </div>
                      {projects.map((p, idx) => (
                        <div key={idx} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Project Title</label>
                              <input type="text" value={p.title} onChange={(e) => handleItemChange(projects, setProjects, idx, "title", e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label>Tech Stack</label>
                              <input type="text" value={p.techStack} onChange={(e) => handleItemChange(projects, setProjects, idx, "techStack", e.target.value)} placeholder="e.g. React, Node.js" />
                            </div>
                          </div>
                          <div className="form-row" style={{ marginBottom: "12px" }}>
                            <label>Description</label>
                            <textarea rows="2" value={p.description} onChange={(e) => handleItemChange(projects, setProjects, idx, "description", e.target.value)} />
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Semester</label>
                              <select value={p.semester || "Sem 4"} onChange={(e) => handleItemChange(projects, setProjects, idx, "semester", e.target.value)}>
                                <option value="Sem 1">Semester 1</option>
                                <option value="Sem 2">Semester 2</option>
                                <option value="Sem 3">Semester 3</option>
                                <option value="Sem 4">Semester 4</option>
                                <option value="Sem 5">Semester 5</option>
                                <option value="Sem 6">Semester 6</option>
                                <option value="Sem 7">Semester 7</option>
                                <option value="Sem 8">Semester 8</option>
                              </select>
                            </div>
                            <div className="form-row">
                              <label>PDF Attachment Link (URL)</label>
                              <input type="text" value={p.pdfUrl || ""} onChange={(e) => handleItemChange(projects, setProjects, idx, "pdfUrl", e.target.value)} placeholder="https://example.com/project-report.pdf" />
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="form-row" style={{ width: "80%" }}>
                              <label>GitHub Link</label>
                              <input type="text" value={p.githubLink} onChange={(e) => handleItemChange(projects, setProjects, idx, "githubLink", e.target.value)} />
                            </div>
                            <button onClick={() => removeItem(projects, setProjects, idx)} style={{ background: "rgba(255,107,107,0.15)", border: "none", color: "var(--red)", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "18px" }}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 4: Hackathons */}
                  {currentStep === 3 && (
                    <div className="form-step">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "14px", color: "var(--purple)" }}>My Hackathons</h3>
                        <button className="btn-primary" onClick={() => addItem(hackathons, setHackathons, { name: "", role: "", achievement: "", projectTitle: "", pdfUrl: "", semester: "Sem 4" })} style={{ padding: "8px 12px", fontSize: "12px" }}>
                          <i className="fas fa-plus" style={{ marginRight: "6px" }}></i> Add Hackathon Card
                        </button>
                      </div>
                      {hackathons.map((h, idx) => (
                        <div key={idx} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Hackathon Name</label>
                              <input type="text" value={h.name} onChange={(e) => handleItemChange(hackathons, setHackathons, idx, "name", e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label>Role</label>
                              <input type="text" value={h.role} onChange={(e) => handleItemChange(hackathons, setHackathons, idx, "role", e.target.value)} placeholder="e.g. Team Leader" />
                            </div>
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Achievement</label>
                              <input type="text" value={h.achievement} onChange={(e) => handleItemChange(hackathons, setHackathons, idx, "achievement", e.target.value)} placeholder="e.g. Winner, Participant" />
                            </div>
                            <div className="form-row">
                              <label>Project Title built</label>
                              <input type="text" value={h.projectTitle} onChange={(e) => handleItemChange(hackathons, setHackathons, idx, "projectTitle", e.target.value)} />
                            </div>
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "16px" }}>
                            <div className="form-row">
                              <label>Semester</label>
                              <select value={h.semester || "Sem 4"} onChange={(e) => handleItemChange(hackathons, setHackathons, idx, "semester", e.target.value)}>
                                <option value="Sem 1">Semester 1</option>
                                <option value="Sem 2">Semester 2</option>
                                <option value="Sem 3">Semester 3</option>
                                <option value="Sem 4">Semester 4</option>
                                <option value="Sem 5">Semester 5</option>
                                <option value="Sem 6">Semester 6</option>
                                <option value="Sem 7">Semester 7</option>
                                <option value="Sem 8">Semester 8</option>
                              </select>
                            </div>
                            <div className="form-row">
                              <label>PDF Attachment Link (URL)</label>
                              <input type="text" value={h.pdfUrl || ""} onChange={(e) => handleItemChange(hackathons, setHackathons, idx, "pdfUrl", e.target.value)} placeholder="https://example.com/certificate.pdf" />
                            </div>
                          </div>
                          <button onClick={() => removeItem(hackathons, setHackathons, idx)} className="btn-secondary" style={{ color: "var(--red)", borderColor: "rgba(255,107,107,0.2)", background: "rgba(255,107,107,0.05)", cursor: "pointer", width: "100%", padding: "10px" }}>
                            <i className="fas fa-trash" style={{ marginRight: "6px" }}></i> Remove Hackathon Card
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 5: Research */}
                  {currentStep === 4 && (
                    <div className="form-step">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "14px", color: "var(--purple)" }}>Research Papers</h3>
                        <button className="btn-primary" onClick={() => addItem(research, setResearch, { title: "", journal: "", status: "Published", link: "", pdfUrl: "", semester: "Sem 4" })} style={{ padding: "8px 12px", fontSize: "12px" }}>
                          <i className="fas fa-plus" style={{ marginRight: "6px" }}></i> Add Paper
                        </button>
                      </div>
                      {research.map((r, idx) => (
                        <div key={idx} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                          <div className="form-row" style={{ marginBottom: "12px" }}>
                            <label>Paper Title</label>
                            <input type="text" value={r.title} onChange={(e) => handleItemChange(research, setResearch, idx, "title", e.target.value)} />
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Journal/Conference</label>
                              <input type="text" value={r.journal} onChange={(e) => handleItemChange(research, setResearch, idx, "journal", e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label>Status</label>
                              <select value={r.status} onChange={(e) => handleItemChange(research, setResearch, idx, "status", e.target.value)}>
                                <option>Published</option>
                                <option>Accepted</option>
                                <option>Under Review</option>
                              </select>
                            </div>
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Semester</label>
                              <select value={r.semester || "Sem 4"} onChange={(e) => handleItemChange(research, setResearch, idx, "semester", e.target.value)}>
                                <option value="Sem 1">Semester 1</option>
                                <option value="Sem 2">Semester 2</option>
                                <option value="Sem 3">Semester 3</option>
                                <option value="Sem 4">Semester 4</option>
                                <option value="Sem 5">Semester 5</option>
                                <option value="Sem 6">Semester 6</option>
                                <option value="Sem 7">Semester 7</option>
                                <option value="Sem 8">Semester 8</option>
                              </select>
                            </div>
                            <div className="form-row">
                              <label>PDF Attachment Link (URL)</label>
                              <input type="text" value={r.pdfUrl || ""} onChange={(e) => handleItemChange(research, setResearch, idx, "pdfUrl", e.target.value)} placeholder="https://example.com/paper.pdf" />
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="form-row" style={{ width: "80%" }}>
                              <label>DOI Link / Website URL</label>
                              <input type="text" value={r.link} onChange={(e) => handleItemChange(research, setResearch, idx, "link", e.target.value)} />
                            </div>
                            <button onClick={() => removeItem(research, setResearch, idx)} style={{ background: "rgba(255,107,107,0.15)", border: "none", color: "var(--red)", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "18px" }}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 6: Internships */}
                  {currentStep === 5 && (
                    <div className="form-step">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "14px", color: "var(--purple)" }}>Internships</h3>
                        <button className="btn-primary" onClick={() => addItem(internships, setInternships, { company: "", role: "", duration: "", description: "", pdfUrl: "", semester: "Sem 4" })} style={{ padding: "8px 12px", fontSize: "12px" }}>
                          <i className="fas fa-plus" style={{ marginRight: "6px" }}></i> Add Internship
                        </button>
                      </div>
                      {internships.map((i, idx) => (
                        <div key={idx} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Company Name</label>
                              <input type="text" value={i.company} onChange={(e) => handleItemChange(internships, setInternships, idx, "company", e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label>Role</label>
                              <input type="text" value={i.role} onChange={(e) => handleItemChange(internships, setInternships, idx, "role", e.target.value)} />
                            </div>
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Duration / Dates</label>
                              <input type="text" value={i.duration} onChange={(e) => handleItemChange(internships, setInternships, idx, "duration", e.target.value)} placeholder="e.g. 2 Months (May - Jul 2025)" />
                            </div>
                            <div className="form-row">
                              <label>Semester</label>
                              <select value={i.semester || "Sem 4"} onChange={(e) => handleItemChange(internships, setInternships, idx, "semester", e.target.value)}>
                                <option value="Sem 1">Semester 1</option>
                                <option value="Sem 2">Semester 2</option>
                                <option value="Sem 3">Semester 3</option>
                                <option value="Sem 4">Semester 4</option>
                                <option value="Sem 5">Semester 5</option>
                                <option value="Sem 6">Semester 6</option>
                                <option value="Sem 7">Semester 7</option>
                                <option value="Sem 8">Semester 8</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="form-row" style={{ width: "80%" }}>
                              <label>Job Description / PDF Link</label>
                              <input type="text" value={i.description} onChange={(e) => handleItemChange(internships, setInternships, idx, "description", e.target.value)} placeholder="Description..." />
                            </div>
                            <button onClick={() => removeItem(internships, setInternships, idx)} style={{ background: "rgba(255,107,107,0.15)", border: "none", color: "var(--red)", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "18px" }}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          <div className="form-row" style={{ marginTop: "12px" }}>
                            <label>PDF Certificate URL</label>
                            <input type="text" value={i.pdfUrl || ""} onChange={(e) => handleItemChange(internships, setInternships, idx, "pdfUrl", e.target.value)} placeholder="https://example.com/internship-cert.pdf" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 7: Certificates */}
                  {currentStep === 6 && (
                    <div className="form-step">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "14px", color: "var(--purple)" }}>Certificates</h3>
                        <button className="btn-primary" onClick={() => addItem(certificates, setCertificates, { title: "", issuer: "", credentialId: "", credentialUrl: "", pdfUrl: "", semester: "Sem 4" })} style={{ padding: "8px 12px", fontSize: "12px" }}>
                          <i className="fas fa-plus" style={{ marginRight: "6px" }}></i> Add Certificate
                        </button>
                      </div>
                      {certificates.map((c, idx) => (
                        <div key={idx} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                          <div className="form-row" style={{ marginBottom: "12px" }}>
                            <label>Certificate Name</label>
                            <input type="text" value={c.title} onChange={(e) => handleItemChange(certificates, setCertificates, idx, "title", e.target.value)} />
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Issuer / Platform</label>
                              <input type="text" value={c.issuer} onChange={(e) => handleItemChange(certificates, setCertificates, idx, "issuer", e.target.value)} placeholder="e.g. Coursera, AWS" />
                            </div>
                            <div className="form-row">
                              <label>Credential ID</label>
                              <input type="text" value={c.credentialId} onChange={(e) => handleItemChange(certificates, setCertificates, idx, "credentialId", e.target.value)} placeholder="ID number" />
                            </div>
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Semester</label>
                              <select value={c.semester || "Sem 4"} onChange={(e) => handleItemChange(certificates, setCertificates, idx, "semester", e.target.value)}>
                                <option value="Sem 1">Semester 1</option>
                                <option value="Sem 2">Semester 2</option>
                                <option value="Sem 3">Semester 3</option>
                                <option value="Sem 4">Semester 4</option>
                                <option value="Sem 5">Semester 5</option>
                                <option value="Sem 6">Semester 6</option>
                                <option value="Sem 7">Semester 7</option>
                                <option value="Sem 8">Semester 8</option>
                              </select>
                            </div>
                            <div className="form-row">
                              <label>PDF Document Link (URL)</label>
                              <input type="text" value={c.pdfUrl || ""} onChange={(e) => handleItemChange(certificates, setCertificates, idx, "pdfUrl", e.target.value)} placeholder="https://example.com/certificate.pdf" />
                            </div>
                          </div>
                          <div className="form-row" style={{ marginBottom: "12px" }}>
                            <label>Verification/Credential URL</label>
                            <input type="text" value={c.credentialUrl} onChange={(e) => handleItemChange(certificates, setCertificates, idx, "credentialUrl", e.target.value)} placeholder="https://..." />
                          </div>
                          <button onClick={() => removeItem(certificates, setCertificates, idx)} className="btn-secondary" style={{ color: "var(--red)", borderColor: "rgba(255,107,107,0.2)", background: "rgba(255,107,107,0.05)", cursor: "pointer", width: "100%", padding: "10px" }}>
                            <i className="fas fa-trash" style={{ marginRight: "6px" }}></i> Remove Certificate Card
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 8: Achievements */}
                  {currentStep === 7 && (
                    <div className="form-step">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "14px", color: "var(--purple)" }}>Extracurricular Achievements</h3>
                        <button className="btn-primary" onClick={() => addItem(achievements, setAchievements, { title: "", description: "", date: "", pdfUrl: "", semester: "Sem 4" })} style={{ padding: "8px 12px", fontSize: "12px" }}>
                          <i className="fas fa-plus" style={{ marginRight: "6px" }}></i> Add Achievement
                        </button>
                      </div>
                      {achievements.map((a, idx) => (
                        <div key={idx} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Achievement Title</label>
                              <input type="text" value={a.title} onChange={(e) => handleItemChange(achievements, setAchievements, idx, "title", e.target.value)} />
                            </div>
                            <div className="form-row">
                              <label>Date Achieved</label>
                              <input type="text" value={a.date} onChange={(e) => handleItemChange(achievements, setAchievements, idx, "date", e.target.value)} placeholder="YYYY-MM-DD" />
                            </div>
                          </div>
                          <div className="form-row two-col" style={{ marginBottom: "12px" }}>
                            <div className="form-row">
                              <label>Semester</label>
                              <select value={a.semester || "Sem 4"} onChange={(e) => handleItemChange(achievements, setAchievements, idx, "semester", e.target.value)}>
                                <option value="Sem 1">Semester 1</option>
                                <option value="Sem 2">Semester 2</option>
                                <option value="Sem 3">Semester 3</option>
                                <option value="Sem 4">Semester 4</option>
                                <option value="Sem 5">Semester 5</option>
                                <option value="Sem 6">Semester 6</option>
                                <option value="Sem 7">Semester 7</option>
                                <option value="Sem 8">Semester 8</option>
                              </select>
                            </div>
                            <div className="form-row">
                              <label>PDF Document Link (URL)</label>
                              <input type="text" value={a.pdfUrl || ""} onChange={(e) => handleItemChange(achievements, setAchievements, idx, "pdfUrl", e.target.value)} placeholder="https://example.com/certificate.pdf" />
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="form-row" style={{ width: "80%" }}>
                              <label>Description / Details</label>
                              <input type="text" value={a.description} onChange={(e) => handleItemChange(achievements, setAchievements, idx, "description", e.target.value)} />
                            </div>
                            <button onClick={() => removeItem(achievements, setAchievements, idx)} style={{ background: "rgba(255,107,107,0.15)", border: "none", color: "var(--red)", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "18px" }}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 9: Review & Submit */}
                  {currentStep === 8 && (
                    <div className="form-step">
                      <h2 style={{ fontSize: "18px", marginBottom: "20px", color: "var(--green)" }}>
                        <i className="fas fa-check-double" style={{ marginRight: "12px" }}></i>
                        Review Your Portfolio Summary
                      </h2>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
                          <strong>Personal Info:</strong> {personalInfo.email ? "Complete" : "Incomplete"}
                        </div>
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
                          <strong>Academics:</strong> {academics.cgpa > 0 ? "Complete" : "Incomplete"}
                        </div>
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
                          <strong>Startup Profile:</strong> {startupInfo.hasStartup ? `Active (${startupInfo.startupName})` : "None"}
                        </div>
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
                          <strong>Projects Count:</strong> {projects.length}
                        </div>
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
                          <strong>Hackathons Count:</strong> {hackathons.length}
                        </div>
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
                          <strong>Publications Count:</strong> {research.length}
                        </div>
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "14px" }}>
                          <strong>Certificates Count:</strong> {certificates.length}
                        </div>
                      </div>
                      <p style={{ color: "var(--text2)", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
                        By submitting this portfolio, you verify that all details provided are correct and align with official college criteria. Your achievements will be sent to the Faculty Review Queue for verification.
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="wizard-buttons" style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
                <button className="btn-secondary" onClick={handlePrev} disabled={currentStep === 0} style={{ padding: "12px 24px", cursor: "pointer", background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  ← Previous
                </button>
                <button className="btn-primary" onClick={handleNext} disabled={saving} style={{ padding: "12px 24px", cursor: "pointer" }}>
                  {currentStep === 8 ? (saving ? "Submitting..." : "Submit Portfolio") : "Next →"}
                </button>
              </div>
            </div>

            {/* RIGHT CHECKLIST SIDEBAR */}
            <div className="wizard-sidebar" style={{ width: "260px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", height: "fit-content" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text2)" }}>Sections</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {stepsList.map((step, idx) => {
                  const isActive = currentStep === idx;
                  const isComplete = isStepComplete(step.key);
                  return (
                    <div
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        background: isActive ? "rgba(56,189,248,0.15)" : "transparent",
                        color: isActive ? "#38bdf8" : "var(--text)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "14px",
                        border: isActive ? "1px solid rgba(56,189,248,0.3)" : "1px solid transparent",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <i className={step.icon} style={{ width: "16px", textAlign: "center" }}></i>
                        <span>{step.title}</span>
                      </div>
                      {isComplete && <i className="fas fa-check-circle" style={{ color: "var(--green)", fontSize: "12px" }}></i>}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
