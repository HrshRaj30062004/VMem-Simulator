# VMem+ — Virtual Memory Page Replacement Simulator

**VMem+** is a web-based simulator built to demonstrate **page replacement algorithms** including:

- FIFO (First-In-First-Out)  
- LRU (Least Recently Used)  
- Optimal

It supports **step-by-step simulation**, **frame visualization**, and exports results to **CSV/PDF**, with **live chart tracking** of page faults.

---

## 🚀 How to Run the Project

### Backend (Node.js + Express)

```bash
cd backend
npm install
npm run dev
Frontend (React)
bash
Copy
Edit
cd frontend
npm install
npm start
⚠️ Make sure the backend is running on http://localhost:5000 before starting the frontend.

📦 Project Features
Simulates FIFO, LRU, and Optimal page replacement algorithms

Step-by-step and full simulation modes

Frame-wise visualization of memory

Real-time page fault tracking graph

Export results as CSV and PDF

Clean, responsive UI built with React.js

👥 Team & Role Distribution
🔧 Harsh Raj (Lead Developer)
Designed full-stack architecture

Implemented all backend algorithms (FIFO, LRU, Optimal)

Built complete frontend using React

Added visualization, PDF/CSV export, and fault tracking

Integrated Chart.js for real-time graph display

👤 Aryan Singh
Contributed to algorithm research & test cases

Helped test and debug simulation correctness

👤 Swastik Sharma
Participated in frontend design brainstorming

Worked on UI/UX flow and layout suggestions

👤 Manas Gupta
Worked on documentation and feature proposals

Responsible for validating output logic and preparing sample datasets
