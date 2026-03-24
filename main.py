import sqlite3
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Connect to SQLite database (creates file if not exists)
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

# Use Pydantic model for request validation
class Patient(BaseModel):
    name: str
    age: int

@app.post("/patients")
def add_patient(patient: Patient):
    cursor.execute(
        "INSERT INTO patients (name, age) VALUES (?, ?)",
        (patient.name, patient.age)
    )
    conn.commit()
    return {"message": "Patient added", "patient": {"name": patient.name, "age": patient.age}}

@app.get("/patients")
def get_patients():
    cursor.execute("SELECT * FROM patients")
    rows = cursor.fetchall()
    return [{"id": row[0], "name": row[1], "age": row[2]} for row in rows]