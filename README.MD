# AppSpazzatura

A smart web application built with **Node.js** and **Express** to manage waste collection schedules and recycling reminders, backed by **MongoDB**.

---

## 📋 Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

---

## ✨ Features
- 🚀 **Fast Performance**: Powered by Express.js for quick request handling.
- 💾 **Persistent Storage**: Full integration with MongoDB to save collection days and schedules.
- 🗑️ **Waste Management**: Keep track of what goes where and on which days.
- 📱 **Responsive Design**: Accessible from both desktop and mobile browsers.

## ⚙️ Prerequisites
Before running this project, ensure you have installed:
* **Node.js** (v14.x or higher recommended)
* **npm** (comes bundled with Node.js)
* **MongoDB** (Local instance or a MongoDB Atlas URI)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https:```github.com/KumaCod3/AppSpazzatura.git
cd AppSpazzatura
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
The application requires environment variables for the server port and database connection.
1. Locate the file named `Example.env` in the root directory.
2. Rename it to `.env`:
```bash
mv Example.env .env
```
3. Open the new `.env` file and set your desired configuration:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
```

---

## 🗄️ Database Setup

### Using MongoDB Atlas (Cloud)
1. Create a cluster on [MongoDB Atlas](https:```www.mongodb.com/cloud/atlas).
2. Obtain your connection string (SRV).
3. Paste the string into your `.env` file as the `MONGO_URI`.

### Using MongoDB Local
1. Ensure your local MongoDB service is running.
2. Use your local URI in the `.env` file:
```env
MONGO_URI=mongodb:```localhost:27017/app_spazzatura
```

---

## 🛠️ Running the Application
Once the environment and database are ready, you can start the server:

**Production mode:**
```bash
npm start
```

**Development mode:**
```bash
npm run dev
```

The application will be available at: **`http:```localhost:PORT`** (where `PORT` is the value you specified in your `.env` file).

---

## 📂 Project Structure
```text
├── public/          # Static assets (CSS, Client-side JS)
├── views/           # Template files (EJS/HTML)
├── routes/          # Express route handlers
├── models/          # MongoDB/Mongoose schemas
├── app.js           # Main server entry point
├── .env             # Environment variables
└── package.json     # Project metadata and dependencies
```

## 💻 Technologies Used
* **Node.js**: JavaScript runtime environment.
* **Express.js**: Web framework.
* **MongoDB**: NoSQL Database.
* **Mongoose**: ODM (Object Data Modeling) for MongoDB.

---
*Maintained by [KumaCod3](https:```github.com/KumaCod3)*