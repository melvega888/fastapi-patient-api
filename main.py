import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Patient Management API",
    summary="A beginner backend API for managing patient records",
    description="""
A FastAPI + SQLite project that supports creating, reading, updating, and deleting patient records.

Built as a healthcare-focused backend project while transitioning into software engineering.
""",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Connect to SQLite database
conn = sqlite3.connect("patients.db", check_same_thread=False)
cursor = conn.cursor()

# Create patients table if it doesn't exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL
)
""")
conn.commit()

# Pydantic model for request validation
class Patient(BaseModel):
    name: str
    age: int

# Helper function to convert a database row into a dictionary
def row_to_dict(row):
    return {"id": row[0], "name": row[1], "age": row[2]}

# Helper function to get a patient or raise 404
def get_patient_or_404(patient_id: int):
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    return row

# Create a new patient
@app.post("/patients")
def add_patient(patient: Patient):
    cursor.execute(
        "INSERT INTO patients (name, age) VALUES (?, ?)",
        (patient.name, patient.age)
    )
    conn.commit()
    patient_id = cursor.lastrowid

    return {
        "message": "Patient added",
        "patient": {
            "id": patient_id,
            "name": patient.name,
            "age": patient.age
        }
    }

# Read all patients
@app.get("/patients")
def get_patients():
    cursor.execute("SELECT * FROM patients")
    rows = cursor.fetchall()
    return [row_to_dict(row) for row in rows]

# Read one patient by ID
@app.get("/patients/{patient_id}")
def get_patient(patient_id: int):
    row = get_patient_or_404(patient_id)
    return row_to_dict(row)

# Update a patient by ID
@app.put("/patients/{patient_id}")
def update_patient(patient_id: int, patient: Patient):
    get_patient_or_404(patient_id)

    cursor.execute(
        "UPDATE patients SET name = ?, age = ? WHERE id = ?",
        (patient.name, patient.age, patient_id)
    )
    conn.commit()

    return {
        "message": "Patient updated",
        "patient": {
            "id": patient_id,
            "name": patient.name,
            "age": patient.age
        }
    }

# Delete a patient by ID
@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int):
    get_patient_or_404(patient_id)

    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    conn.commit()

    return {"message": f"Patient with id {patient_id} deleted"}