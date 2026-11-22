from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import uuid
import time

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

    #TABLES
    conn.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
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
            updatedAt INTEGER
        )
    ''')

    conn.execute('''
        CREATE TABLE IF NOT EXISTS monthly_records (
            id TEXT PRIMARY KEY,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            visitors INTEGER DEFAULT 0,
            borrowed INTEGER DEFAULT 0,
            inquiries INTEGER DEFAULT 0,
            computers INTEGER DEFAULT 0,
            activities INTEGER DEFAULT 0,
            updatedAt INTEGER,
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

#----------------------------------------------
# FUNCTION 2: ADD A NEW BOOK
@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.get_json() or {}

    if not data.get('progression') or not data.get('progression').strip() or \
       not data.get('title') or not data.get('title').strip() or \
       not data.get('author') or not data.get('author').strip():
        return jsonify({"error": "Progression, title, and author are required"}), 400

    book_id = "book-" + str(uuid.uuid4())
    updated_at = int(__import__('time').time() * 1000)

    conn = get_db_connections()

    conn.execute('''
        INSERT INTO books (
            id, progression, title, author, date, callNumber,
            edition, volume, issue, isbn, copies, location,
            remarks, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        book_id,
        data['progression'],
        data['title'],
        data['author'],
        data.get('date'),
        data.get('callNumber'),
        data.get('edition'),
        data.get('volume'),
        data.get('issue'),
        data.get('isbn'),
        data.get('copies', 1),
        data.get('location'),
        data.get('remarks'),
        updated_at
    ))

    conn.commit()

    book = conn.execute(
        'SELECT * FROM books WHERE id = ?', (book_id,)
    ).fetchone()

    conn.close()

    return jsonify(dict(book))