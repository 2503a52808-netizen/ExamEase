
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

mongoose.connect("mongodb://127.0.0.1:27017/examination_management")
.then(() => console.log("MongoDB Connected Successfully"))
.catch(error => console.log("MongoDB Connection Error:", error.message));

const Student = mongoose.model("Student", new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    department: { type: String, required: true }
}));

const Exam = mongoose.model("Exam", new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: String, required: true }
}));

const Subject = mongoose.model("Subject", new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true }
}));

const Mark = mongoose.model("Mark", new mongoose.Schema({
    studentId: String,
    subjectId: String,
    examId: String,
    studentName: String,
    subjectName: String,
    examName: String,
    score: { type: Number, min: 0, max: 100, required: true }
}));

app.get("/api/status", (req, res) => {
    res.json({ message: "Examination Management System Backend Running" });
});

app.get("/api/dashboard", async (req, res) => {
    try {
        res.json({
            students: await Student.countDocuments(),
            exams: await Exam.countDocuments(),
            subjects: await Subject.countDocuments(),
            marks: await Mark.countDocuments()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/students", async (req, res) => {
    res.json(await Student.find().sort({ _id: -1 }));
});

app.post("/api/students", async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.code === 11000 ? "Student ID already exists." : error.message });
    }
});

app.delete("/api/students/:id", async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
});

app.get("/api/exams", async (req, res) => {
    res.json(await Exam.find().sort({ _id: -1 }));
});

app.post("/api/exams", async (req, res) => {
    try {
        res.status(201).json(await Exam.create(req.body));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete("/api/exams/:id", async (req, res) => {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Examination deleted" });
});

app.get("/api/subjects", async (req, res) => {
    res.json(await Subject.find().sort({ _id: -1 }));
});

app.post("/api/subjects", async (req, res) => {
    try {
        res.status(201).json(await Subject.create(req.body));
    } catch (error) {
        res.status(400).json({ message: error.code === 11000 ? "Subject code already exists." : error.message });
    }
});

app.delete("/api/subjects/:id", async (req, res) => {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: "Subject deleted" });
});

app.get("/api/marks", async (req, res) => {
    res.json(await Mark.find().sort({ _id: -1 }));
});

app.post("/api/marks", async (req, res) => {
    try {
        const student = await Student.findById(req.body.studentId);
        const subject = await Subject.findById(req.body.subjectId);
        const exam = await Exam.findById(req.body.examId);

        if (!student || !subject || !exam) {
            return res.status(400).json({ message: "Select valid student, subject and examination." });
        }

        const mark = await Mark.create({
            studentId: student._id.toString(),
            subjectId: subject._id.toString(),
            examId: exam._id.toString(),
            studentName: student.name,
            subjectName: subject.name,
            examName: exam.name,
            score: req.body.score
        });

        res.status(201).json(mark);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete("/api/marks/:id", async (req, res) => {
    await Mark.findByIdAndDelete(req.params.id);
    res.json({ message: "Marks record deleted" });
});

app.get("/api/results", async (req, res) => {
    res.json(await Mark.find().sort({ studentName: 1 }));
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
