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

# ==========================================================    
# FUNCTION 1 
# ==========================================================
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


# ==========================================================
# FUNCTION 2: ADD A NEW BOOK
# ==========================================================
@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.get_json() or {}

    if not data.get('progression') or not data.get('progression').strip() or \
       not data.get('title') or not data.get('title').strip() or \
       not data.get('author') or not data.get('author').strip():
        return jsonify({"error": "Progression, title, and author are required"}), 400

    book_id = "book-" + str(uuid.uuid4())
    updated_at = int(time.time() * 1000)
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

# ==========================================================
# FUNCTION 3: EDIT AN EXISTING BOOK
# ==========================================================

@app.route('/api/books/<id>', methods=['PUT']) #Instructions said to use PUT
def edit_book(id):
    data = request.get_json() or {}
    conn = get_db_connections()
    book = conn.execute(
        'SELECT * FROM books WHERE id = ?', (id,)
    ).fetchone()

    if not book:
        conn.close()
        return jsonify({"error": "Book not found"}), 404

    updated_at = int(time.time() * 1000)

    conn.execute('''
        UPDATE books SET
            progression = ?,
            title = ?,
            author = ?,
            date = ?,
            callNumber = ?,
            edition = ?,
            volume = ?,
            issue = ?,
            isbn = ?,
            copies = ?,
            location = ?,
            remarks = ?,
            updatedAt = ?
        WHERE id = ?
    ''', (
        data.get('progression'),
        data.get('title'),
        data.get('author'),
        data.get('date'),
        data.get('callNumber'),
        data.get('edition'),
        data.get('volume'),
        data.get('issue'),
        data.get('isbn'),
        data.get('copies', 1),
        data.get('location'),
        data.get('remarks'),
        updated_at,
        id
    ))

    conn.commit()

    updated_book = conn.execute(
        'SELECT * FROM books WHERE id = ?', (id,)
    ).fetchone()

    conn.close()

    return jsonify(dict(updated_book))

# ==========================================================
# FUNCTION 4: ADD A NEW MONTHLY RECORD
# ==========================================================
@app.route('/api/monthly', methods=['POST'])
def add_monthly_record():

    data = request.get_json() or {}
    month = data.get('month')
    year = data.get('year')

    if month is None or year is None:
        return jsonify({"error": "month and year are required"}), 400

    try:
        month = int(month)
        year = int(year)
    except (TypeError, ValueError):
        return jsonify({"error": "month and year must be numbers"}), 400

    if month < 1 or month > 12:
        return jsonify({"error": "month must be from 1 to 12"}), 400
    if year < 0:
        return jsonify({"error": "year cannot be negative"}), 400

    
    counts = {}
    for field in ('visitors', 'borrowed', 'inquiries', 'computers', 'activities'):
        try:
            counts[field] = int(data.get(field, 0) or 0)
        except (TypeError, ValueError):
            return jsonify({"error": field + " must be a number"}), 400
        if counts[field] < 0:
            return jsonify({"error": field + " cannot be negative"}), 400

    conn = get_db_connections()

    #CHecks if year/month exists
    existing = conn.execute(
        'SELECT * FROM monthly_records WHERE year = ? AND month = ?',
        (year, month)
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({"error": "A record for that month and year already exists"}), 400

    record_id = "monthly-" + str(uuid.uuid4())
    updated_at = int(time.time() * 1000)

    conn.execute('''
        INSERT INTO monthly_records (
            id, year, month, visitors, borrowed, inquiries, computers, activities, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        record_id,
        year,
        month,
        counts['visitors'],
        counts['borrowed'],
        counts['inquiries'],
        counts['computers'],
        counts['activities'],
        updated_at
    ))
    conn.commit()

    new_record = conn.execute(
        'SELECT * FROM monthly_records WHERE id = ?', (record_id,)
    ).fetchone()

    conn.close()

    return jsonify(dict(new_record)), 201

# ==========================================================
# FUNCTION 5: EDIT AN EXISTING MONTHLY RECORD - Earl
# ==========================================================
@app.route('/api/monthly/<id>', methods=['PUT'])
def edit_monthly_record(id):
    data = request.get_json() or {}

    conn = get_db_connections()

    #find the record with that id
    record = conn.execute(
        'SELECT * FROM monthly_records WHERE id = ?', (id,)
    ).fetchone()

    if not record:
        conn.close()
        return jsonify({"error": "Monthly record not found"}), 404

    month = data.get('month')
    year = data.get('year')

    if month is None or year is None:
        conn.close()
        return jsonify({"error": "month and year are required"}), 400

    try:
        month = int(month)
        year = int(year)
    except (TypeError, ValueError):
        conn.close()
        return jsonify({"error": "month and year must be numbers"}), 400

    if month < 1 or month > 12:
        conn.close()
        return jsonify({"error": "month must be from 1 to 12"}), 400
    if year < 0:
        conn.close()
        return jsonify({"error": "year cannot be negative"}), 400

    counts = {}
    for field in ('visitors', 'borrowed', 'inquiries', 'computers', 'activities'):
        try:
            counts[field] = int(data.get(field, 0) or 0)
        except (TypeError, ValueError):
            conn.close()
            return jsonify({"error": field + " must be a number"}), 400
        if counts[field] < 0:
            conn.close()
            return jsonify({"error": field + " cannot be negative"}), 400

    #make sure the new yer and month is not used by another record
    duplicate = conn.execute(
        'SELECT id FROM monthly_records WHERE year = ? AND month = ? AND id != ?',
        (year, month, id)
    ).fetchone()

    if duplicate:
        conn.close()
        return jsonify({"error": "A record for that month and year already exists"}), 400

    updated_at = int(time.time() * 1000)

    conn.execute('''
        UPDATE monthly_records SET
            year = ?,
            month = ?,
            visitors = ?,
            borrowed = ?,
            inquiries = ?,
            computers = ?,
            activities = ?,
            updatedAt = ?
        WHERE id = ?
    ''', (
        year,
        month,
        counts['visitors'],
        counts['borrowed'],
        counts['inquiries'],
        counts['computers'],
        counts['activities'],
        updated_at,
        id
    ))
    conn.commit()

    updated_record = conn.execute(
        'SELECT * FROM monthly_records WHERE id = ?', (id,)
    ).fetchone()

    conn.close()

    return jsonify(dict(updated_record))

# ==========================================================
# FUNCTION 6: DELETE A RECORD -EARL
# ==========================================================
@app.route('/api/records/<id>', methods=['DELETE'])
def delete_record(id):
    #the id tells you which table to look at
    if id.startswith('book-'):
        table = 'books'
    elif id.startswith('monthly-'):
        table = 'monthly_records'
    else:
        return jsonify({"error": "Record not found"}), 404

    conn = get_db_connections()

    record = conn.execute(
        f'SELECT id FROM {table} WHERE id = ?', (id,)
    ).fetchone()

    if not record:
        conn.close()
        return jsonify({"error": "Record not found"}), 404

    conn.execute(f'DELETE FROM {table} WHERE id = ?', (id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Record deleted successfully"})

# ==========================================================
#NOTE: IF YOUR GOING TO CODE DONT SURPASS THESE 3 LINES OF CODE! 
# ==========================================================
init_db()
if __name__ == '__main__':
    app.run(debug=True, port=5000) 
