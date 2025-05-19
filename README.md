# VMem+ — Virtual Memory Page Replacement Simulator

**VMem+** is a web-based simulator designed to demonstrate **page replacement algorithms** such as:

- **FIFO** (First-In-First-Out)  
- **LRU** (Least Recently Used)  
- **Optimal**

It features **step-by-step simulation**, **memory frame visualization**, **real-time page fault tracking**, and **export options** for results in **CSV/PDF** formats.

---

## ✨ Features

- Simulates **FIFO**, **LRU**, and **Optimal** page replacement algorithms  
- Step-by-step **and** full-run simulation modes  
- Frame-by-frame memory visualization  
- **Live graph** tracking of page faults using Chart.js  
- Export simulation results to **CSV** and **PDF**  
- Clean, responsive **React.js** frontend  

---

## 🚀 How to Run the Project

### 🖥️ Backend (Node.js + Express)

```bash
cd backend  
npm install  
npm run dev  
```

> The backend will run on [http://localhost:5000](http://localhost:5000)

---

### 💻 Frontend (React)

```bash
cd frontend  
npm install  
npm start  
```

> ⚠️ Ensure the **backend is running** before starting the frontend.

---

## 👥 Team & Role Distribution

**Harsh Raj (Lead Developer)**  
•	Led the requirement analysis and literature review, comparing tools like OS-Sim and OSVis.
•	Defined project scope, limitations of existing systems, and formulated the feature set.
•	Supervised development milestones and coordinated integration of various modules.
•	Implemented the Optimal page replacement algorithm and reviewed others' code.
•	Collaborated with Swastik Sharma to build the core backend logic ensuring smooth simulation flow.



**Manas Srivastava**  
•	  Designed the core memory model, including page table structure, frame allocation, and access logs.
•	 Handled the FIFO and LRU algorithm implementations, ensuring modularity and reusability.
•	  Built the logic for parsing memory reference strings with read/write operations.
•	  Contributed to debugging and refining algorithm implementations to improve accuracy and efficiency.


**Swastik Sharma**  
•	 Developed the simulation engine supporting both step-by-step and auto-run modes, enabling flexible user interaction.
•	 Built the core backend logic in collaboration with Harsh Raj, ensuring seamless integration between the memory algorithms and simulation flow.
•	  Designed and implemented the input handling system, managing user commands and coordinating with the simulation engine for smooth operation.
•	  Assisted extensively with unit testing, debugging, and performance tuning of the page replacement algorithms to enhance reliability.
•	 Worked closely with the frontend team to ensure accurate real-time data updates and synchronization between the backend simulation state and the GUI visualizations.


**Aaryan Kaushal**  
•	 Created the GUI layout using React.js and Bootstrap, focusing on responsiveness, intuitive design, and user experience.
  Integrated dynamic page table and frame visualizations with real-time memory updates for clear and interactive simulation feedback.
•	 Designed and implemented the interface for algorithm selection, memory configuration, and simulation controls, ensuring smooth navigation.
•	Collaborated with the backend team to synchronize data flow and optimize frontend performance, contributing to iterative UI improvements based on user testing and feedback.



---
