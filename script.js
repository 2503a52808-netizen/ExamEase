
const app = document.getElementById("app");

async function api(url, options = {}) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showMessage(message, error = false) {
    const box = document.getElementById("message");
    if (!box) return;

    box.className = error ? "message error-message" : "message";
    box.textContent = message;
}

function showPage(page, button) {
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) button.classList.add("active");

    const titles = {
        dashboard: "Dashboard",
        students: "Students",
        examinations: "Examinations",
        subjects: "Subjects",
        marks: "Marks Entry",
        results: "Results"
    };

    document.getElementById("page-title").textContent = titles[page];

    if (page === "dashboard") loadDashboard();
    if (page === "students") loadStudents();
    if (page === "examinations") loadExams();
    if (page === "subjects") loadSubjects();
    if (page === "marks") loadMarks();
    if (page === "results") loadResults();
}

/* DASHBOARD */

async function loadDashboard() {
    app.innerHTML = `<div class="loading">Loading dashboard...</div>`;

    try {
        const [stats, students, exams, marks] = await Promise.all([
            api("/api/dashboard"),
            api("/api/students"),
            api("/api/exams"),
            api("/api/marks")
        ]);

        app.innerHTML = `
            <div class="welcome">
                <h2>Welcome to ExamEase! 🎓</h2>
                <p>Manage students, examinations, subjects and results in one place.</p>
            </div>

            <div class="cards">
                <div class="card">
                    <h3>👨‍🎓 Total Students</h3>
                    <h2>${stats.students}</h2>
                </div>
                <div class="card">
                    <h3>📝 Examinations</h3>
                    <h2>${stats.exams}</h2>
                </div>
                <div class="card">
                    <h3>📚 Total Subjects</h3>
                    <h2>${stats.subjects}</h2>
                </div>
                <div class="card">
                    <h3>📊 Marks Records</h3>
                    <h2>${stats.marks}</h2>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="panel">
                    <h2>👨‍🎓 Recent Students</h2>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Student ID</th><th>Name</th><th>Department</th></tr>
                            </thead>
                            <tbody>
                                ${students.length ? students.slice(0, 5).map(s => `
                                    <tr>
                                        <td>${safe(s.studentId)}</td>
                                        <td>${safe(s.name)}</td>
                                        <td>${safe(s.department)}</td>
                                    </tr>
                                `).join("") : `
                                    <tr><td colspan="3" class="empty">No students added yet.</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="panel">
                    <h2>📝 Recent Examinations</h2>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr><th>Examination</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                ${exams.length ? exams.slice(0, 5).map(e => `
                                    <tr>
                                        <td>${safe(e.name)}</td>
                                        <td>${safe(e.date)}</td>
                                    </tr>
                                `).join("") : `
                                    <tr><td colspan="2" class="empty">No examinations added yet.</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="panel">
                <h2>📊 Latest Marks Records</h2>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Student</th><th>Subject</th><th>Examination</th><th>Score</th></tr>
                        </thead>
                        <tbody>
                            ${marks.length ? marks.slice(0, 5).map(m => `
                                <tr>
                                    <td>${safe(m.studentName)}</td>
                                    <td>${safe(m.subjectName)}</td>
                                    <td>${safe(m.examName)}</td>
                                    <td>${safe(m.score)} / 100</td>
                                </tr>
                            `).join("") : `
                                <tr><td colspan="4" class="empty">No marks entered yet.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="panel error-message">${safe(error.message)}</div>`;
    }
}

/* STUDENTS */

async function loadStudents() {
    app.innerHTML = `<div class="loading">Loading students...</div>`;

    try {
        const students = await api("/api/students");

        app.innerHTML = `
            <div class="section-heading">
                <h2>Student Management</h2>
                <p>Add and manage student information.</p>
            </div>

            <div class="panel">
                <h2>➕ Add New Student</h2>
                <form id="studentForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Student ID</label>
                            <input name="studentId" placeholder="Example: S001" required>
                        </div>
                        <div class="form-group">
                            <label>Student Name</label>
                            <input name="name" placeholder="Enter student name" required>
                        </div>
                        <div class="form-group">
                            <label>Age</label>
                            <input name="age" type="number" min="1" max="100" required>
                        </div>
                        <div class="form-group">
                            <label>Department</label>
                            <input name="department" placeholder="Example: CSE" required>
                        </div>
                    </div>
                    <button class="primary-btn" type="submit">Add Student</button>
                    <div id="message"></div>
                </form>
            </div>

            <div class="panel">
                <h2>📋 Student Records (${students.length})</h2>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Student ID</th><th>Name</th><th>Age</th><th>Department</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            ${students.length ? students.map(s => `
                                <tr>
                                    <td>${safe(s.studentId)}</td>
                                    <td>${safe(s.name)}</td>
                                    <td>${safe(s.age)}</td>
                                    <td>${safe(s.department)}</td>
                                    <td><button class="delete-btn" onclick="deleteItem('students','${s._id}')">Delete</button></td>
                                </tr>
                            `).join("") : `
                                <tr><td colspan="5" class="empty">No students found.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById("studentForm").onsubmit = async event => {
            event.preventDefault();

            const data = Object.fromEntries(new FormData(event.target).entries());
            data.age = Number(data.age);

            try {
                await api("/api/students", {
                    method: "POST",
                    body: JSON.stringify(data)
                });
                loadStudents();
            } catch (error) {
                showMessage(error.message, true);
            }
        };
    } catch (error) {
        app.innerHTML = `<div class="panel error-message">${safe(error.message)}</div>`;
    }
}

/* EXAMINATIONS */

async function loadExams() {
    app.innerHTML = `<div class="loading">Loading examinations...</div>`;

    try {
        const exams = await api("/api/exams");

        app.innerHTML = `
            <div class="section-heading">
                <h2>Examination Management</h2>
                <p>Create and manage examination schedules.</p>
            </div>

            <div class="panel">
                <h2>➕ Add Examination</h2>
                <form id="examForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Examination Name</label>
                            <input name="name" placeholder="Example: Mid Examination" required>
                        </div>
                        <div class="form-group">
                            <label>Examination Date</label>
                            <input name="date" type="date" required>
                        </div>
                    </div>
                    <button class="primary-btn" type="submit">Add Examination</button>
                    <div id="message"></div>
                </form>
            </div>

            <div class="panel">
                <h2>📋 Examination Records (${exams.length})</h2>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Examination Name</th><th>Date</th><th>Action</th></tr></thead>
                        <tbody>
                            ${exams.length ? exams.map(e => `
                                <tr>
                                    <td>${safe(e.name)}</td>
                                    <td>${safe(e.date)}</td>
                                    <td><button class="delete-btn" onclick="deleteItem('exams','${e._id}')">Delete</button></td>
                                </tr>
                            `).join("") : `
                                <tr><td colspan="3" class="empty">No examinations found.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById("examForm").onsubmit = async event => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(event.target).entries());

            try {
                await api("/api/exams", {
                    method: "POST",
                    body: JSON.stringify(data)
                });
                loadExams();
            } catch (error) {
                showMessage(error.message, true);
            }
        };
    } catch (error) {
        app.innerHTML = `<div class="panel error-message">${safe(error.message)}</div>`;
    }
}

/* SUBJECTS */

async function loadSubjects() {
    app.innerHTML = `<div class="loading">Loading subjects...</div>`;

    try {
        const subjects = await api("/api/subjects");

        app.innerHTML = `
            <div class="section-heading">
                <h2>Subject Management</h2>
                <p>Add and manage academic subjects.</p>
            </div>

            <div class="panel">
                <h2>➕ Add Subject</h2>
                <form id="subjectForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Subject Code</label>
                            <input name="code" placeholder="Example: CS101" required>
                        </div>
                        <div class="form-group">
                            <label>Subject Name</label>
                            <input name="name" placeholder="Example: Computer Networks" required>
                        </div>
                    </div>
                    <button class="primary-btn" type="submit">Add Subject</button>
                    <div id="message"></div>
                </form>
            </div>

            <div class="panel">
                <h2>📚 Subject Records (${subjects.length})</h2>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Subject Code</th><th>Subject Name</th><th>Action</th></tr></thead>
                        <tbody>
                            ${subjects.length ? subjects.map(s => `
                                <tr>
                                    <td>${safe(s.code)}</td>
                                    <td>${safe(s.name)}</td>
                                    <td><button class="delete-btn" onclick="deleteItem('subjects','${s._id}')">Delete</button></td>
                                </tr>
                            `).join("") : `
                                <tr><td colspan="3" class="empty">No subjects found.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById("subjectForm").onsubmit = async event => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(event.target).entries());

            try {
                await api("/api/subjects", {
                    method: "POST",
                    body: JSON.stringify(data)
                });
                loadSubjects();
            } catch (error) {
                showMessage(error.message, true);
            }
        };
    } catch (error) {
        app.innerHTML = `<div class="panel error-message">${safe(error.message)}</div>`;
    }
}

/* MARKS ENTRY */

async function loadMarks() {
    app.innerHTML = `<div class="loading">Loading marks form...</div>`;

    try {
        const [students, subjects, exams, marks] = await Promise.all([
            api("/api/students"),
            api("/api/subjects"),
            api("/api/exams"),
            api("/api/marks")
        ]);

        app.innerHTML = `
            <div class="section-heading">
                <h2>Marks Entry</h2>
                <p>Enter examination marks for registered students.</p>
            </div>

            <div class="panel">
                <h2>✏️ Enter Student Marks</h2>
                <form id="marksForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Select Student</label>
                            <select name="studentId" required>
                                <option value="">Choose Student</option>
                                ${students.map(s => `<option value="${s._id}">${safe(s.studentId)} - ${safe(s.name)}</option>`).join("")}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Select Subject</label>
                            <select name="subjectId" required>
                                <option value="">Choose Subject</option>
                                ${subjects.map(s => `<option value="${s._id}">${safe(s.code)} - ${safe(s.name)}</option>`).join("")}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Select Examination</label>
                            <select name="examId" required>
                                <option value="">Choose Examination</option>
                                ${exams.map(e => `<option value="${e._id}">${safe(e.name)}</option>`).join("")}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Marks (Out of 100)</label>
                            <input name="score" type="number" min="0" max="100" placeholder="Enter marks" required>
                        </div>
                    </div>
                    <button class="primary-btn" type="submit">Save Marks</button>
                    <div id="message"></div>
                </form>
            </div>

            <div class="panel">
                <h2>📋 Marks Records (${marks.length})</h2>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Student</th><th>Subject</th><th>Examination</th><th>Marks</th><th>Action</th></tr></thead>
                        <tbody>
                            ${marks.length ? marks.map(m => `
                                <tr>
                                    <td>${safe(m.studentName)}</td>
                                    <td>${safe(m.subjectName)}</td>
                                    <td>${safe(m.examName)}</td>
                                    <td>${safe(m.score)}</td>
                                    <td><button class="delete-btn" onclick="deleteItem('marks','${m._id}')">Delete</button></td>
                                </tr>
                            `).join("") : `
                                <tr><td colspan="5" class="empty">No marks entered yet.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById("marksForm").onsubmit = async event => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(event.target).entries());
            data.score = Number(data.score);

            try {
                await api("/api/marks", {
                    method: "POST",
                    body: JSON.stringify(data)
                });
                loadMarks();
            } catch (error) {
                showMessage(error.message, true);
            }
        };
    } catch (error) {
        app.innerHTML = `<div class="panel error-message">${safe(error.message)}</div>`;
    }
}

/* RESULTS */

async function loadResults() {
    app.innerHTML = `<div class="loading">Loading results...</div>`;

    try {
        const results = await api("/api/results");

        app.innerHTML = `
            <div class="section-heading">
                <h2>Student Results</h2>
                <p>View examination marks and pass/fail status.</p>
            </div>

            <div class="panel">
                <h2>📊 Results Overview (${results.length})</h2>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Student</th><th>Subject</th><th>Examination</th><th>Marks</th><th>Result</th></tr></thead>
                        <tbody>
                            ${results.length ? results.map(r => `
                                <tr>
                                    <td>${safe(r.studentName)}</td>
                                    <td>${safe(r.subjectName)}</td>
                                    <td>${safe(r.examName)}</td>
                                    <td>${safe(r.score)} / 100</td>
                                    <td>${r.score >= 35 ? "Pass" : "Fail"}</td>
                                </tr>
                            `).join("") : `
                                <tr><td colspan="5" class="empty">No results available yet.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="panel error-message">${safe(error.message)}</div>`;
    }
}

/* DELETE */

async function deleteItem(type, id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        await api(`/api/${type}/${id}`, { method: "DELETE" });

        if (type === "students") loadStudents();
        if (type === "exams") loadExams();
        if (type === "subjects") loadSubjects();
        if (type === "marks") loadMarks();
    } catch (error) {
        alert(error.message);
    }
}

/* START */

loadDashboard();
