from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"message": "Flask backend is up and running"})

def get_db_connections():
    conn = sqlite3.connect('library.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connections()

    conn.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            progression TEXT NOT NULL,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            date TEXT,
            callNumber TEXT,
            edition TEXT,
            volume TEXT,
            issue TEXT,
            isbn TEXT,
            copies INTEGER DEFAULT 1,
            location TEXT,
            remarks TEXT,
            updatedAt REAL
        )
    ''')

    conn.execute('''
        CREATE TABLE IF NOT EXISTS monthly_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            visitors INTEGER DEFAULT 0,
            borrowed INTEGER DEFAULT 0,
            inquiries INTEGER DEFAULT 0,
            computers INTEGER DEFAULT 0,
            activities INTEGER DEFAULT 0,
            updatedAt REAL,
            UNIQUE(year, month)
        )
    ''')
    conn.commit()
    conn.close()


 
#----------------------------------------------    
# FUNCTION 1 
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    conn = get_db_connections()
    books = conn.execute('SELECT * FROM books').fetchall()
    monthly = conn.execute('SELECT * FROM monthly_records').fetchall()
    conn.close()

    return jsonify({
        "books": [dict(b) for b in books],
        "monthly": [dict(m) for m in monthly]
    })






#----------------------------------------------  

init_db()
if __name__ == '__main__':
    app.run(debug=True, port=5000) 