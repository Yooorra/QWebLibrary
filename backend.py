# ==========================================================
# BACKEND GUIDE FOR THE LIBRARY SYSTEM (READ THIS FIRST!)
# ==========================================================
# this file is only a to-do list written as comments.
# there is no code here on purpose, you guys write it all.
# the front-end (index.html, style.css, script.js) is already done.
# right now the front-end saves data in the browser (localstorage).
# your job: make a flask server so the data is saved for real.
#
# the server must run at (or kung saan madedeploy sa pc nyo keneme): http://127.0.0.1:5000
# every url below starts with: /api
# the front-end talks to the server using json (like a python dictionary).

# THIS STEP IS DONE, required imports and setups, I'll just leave the comments here for reference.
# ==========================================================
# STEP 0: SETUP
# ==========================================================
# - make a flask app
# - turn on CORS (the front-end is a different "address" than the server,
#   so the browser will block it if you forget this!)
# - pick a database (sqlite is the easiest for beginners)

# - these tables are in the next step 
# - make 2 tables: one for books, one for monthly records
#   (check the fields listed below)

from flask import Flask
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), "library.db")


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection

#THIS STEP IS ALSO DONE, the database is already created and initialized, but I'll leave the comments here for reference.
# ==========================================================
# THE 2 KINDS OF DATA
# ==========================================================
# 1) BOOK (from the book inventory page)
#    fields:
#      id            -> unique id, like "book-123". the server can make it
#      progression   -> text, REQUIRED
#      title         -> text, REQUIRED
#      author        -> text, REQUIRED
#      date          -> text (date of publication)
#      callNumber    -> text
#      edition       -> text
#      volume        -> text
#      issue         -> text
#      isbn          -> text
#      copies        -> number, default 1
#      location      -> text
#      remarks       -> text
#      updatedAt     -> number (time when last added/edited)
#
# 2) MONTHLY RECORD (from the monthly statistics page)
#    fields:
#      id            -> unique id, like "monthly-123"
#      year          -> number, like 2026
#      month         -> number, 1 to 12 (1 = january)
#      visitors      -> number
#      borrowed      -> number
#      inquiries     -> number
#      computers     -> number
#      activities    -> number
#      updatedAt     -> number (time when last added/edited)
#    IMPORTANT: only ONE record is allowed for each year + month combo.
#
# NOTE: keep the field names EXACTLY like above (same spelling and caps)
# or the front-end will break!

def initialize_database():
    connection = get_db_connection()

    connection.execute("""
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
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS monthly (
            id TEXT PRIMARY KEY,
            year INTEGER,
            month INTEGER,
            visitors INTEGER,
            borrowed INTEGER,
            inquiries INTEGER,
            computers INTEGER,
            activities INTEGER,
            updatedAt INTEGER,
            UNIQUE(year, month)
        )
    """)

    connection.commit()
    connection.close()


initialize_database()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)


# ==========================================================
# FUNCTION 1: GET DASHBOARD DATA
# ==========================================================
# url:     GET /api/dashboard
# front-end function that calls it: fetchDashboardData() in script.js
# what it does:
#   - gets ALL books from the database
#   - gets ALL monthly records from the database
#   - sends them back together as json
# what to send back (the shape must be like this):
#   an object with 2 lists: "books" and "monthly"
#   (if there is nothing yet, send empty lists, NOT an error)


# ==========================================================
# FUNCTION 2: ADD A NEW BOOK
# ==========================================================
# url:     POST /api/books
# front-end function that calls it: saveBookToBackend() in script.js
# what it does:
#   - receives the book json from the front-end (no id yet)
#   - checks that progression, title, and author are not empty
#   - makes a new id for the book
#   - saves it in the database
#   - sends back the saved book (with its id)
# if something is wrong (like missing title), send back an error message
# and a 400 status code


# ==========================================================
# FUNCTION 3: EDIT AN EXISTING BOOK
# ==========================================================
# url:     PUT /api/books/<id>
# front-end function that calls it: saveBookToBackend() in script.js
# what it does:
#   - finds the book with that id
#   - replaces its info with the new json from the front-end
#   - updates the updatedAt time
#   - sends back the updated book
# if the id does not exist, send back an error and a 404 status code


# ==========================================================
# FUNCTION 4: ADD A NEW MONTHLY RECORD
# ==========================================================
# url:     POST /api/monthly
# front-end function that calls it: saveMonthlyRecordToBackend() in script.js
# what it does:
#   - receives the monthly json (no id yet)
#   - checks if that year + month already exists
#     -> if yes, send back an error and a 400 status code
#   - makes a new id
#   - saves it in the database
#   - sends back the saved record
# tip: numbers can't be negative, check that too


# ==========================================================
# FUNCTION 5: EDIT AN EXISTING MONTHLY RECORD
# ==========================================================
# url:     PUT /api/monthly/<id>
# front-end function that calls it: saveMonthlyRecordToBackend() in script.js
# what it does:
#   - finds the record with that id
#   - makes sure the new year + month is not used by ANOTHER record
#   - replaces its info with the new json
#   - updates the updatedAt time
#   - sends back the updated record
# if the id does not exist, send back an error and a 404 status code


# ==========================================================
# FUNCTION 6: DELETE A RECORD
# ==========================================================
# url:     DELETE /api/records/<id>
# front-end function that calls it: deleteRecordFromBackend() in script.js
# what it does:
#   - the id tells you which table to look at:
#       starts with "book-"    -> it is a book
#       starts with "monthly-" -> it is a monthly record
#   - deletes that row from the database
#   - sends back a simple success message
# if the id does not exist, send back an error and a 404 status code


# ==========================================================
# AFTER YOU FINISH
# ==========================================================
# 1) open script.js and find every line that says: TODO BACKEND
# 2) replace the localstorage lines with the fetch() calls
#    (examples are already written in those comments)
# 3) remember: functions that use fetch must become "async"
#    and the functions that call them must use "await"
# 4) test every function using the website:
#    add, edit, delete a book. add, edit, delete a monthly record.
#    refresh the page and check the data is still there!
# 5) test the error cases too (empty title, same month twice)

