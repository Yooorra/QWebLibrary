/* ==========================================================
   LIBRARY MANAGEMENT SYSTEM - script.js
   Sections:
     1. Backend data functions (replace these with API calls)
     2. Constants and helpers
     3. Navigation
     4. Dashboard
     5. Book inventory
     6. Monthly statistics entry
     7. Reports and export
     8. Start-up
   ========================================================== */


/* ==========================================================
   1. BACKEND DATA FUNCTIONS
   Everything that reads or writes data lives here.
   Right now it uses localStorage. Replace the marked lines
   with fetch() calls when the backend is ready.
   ========================================================== */

var BOOKS_KEY = 'library_books';
var MONTHLY_KEY = 'library_monthly';
// TODO BACKEND: base URL of the Flask server
var API_URL = 'http://127.0.0.1:5000/api';

// Small helpers that read/write localStorage (remove once the backend is used)
function readList(key) {
    var text = localStorage.getItem(key);
    if (text === null) {
        return [];
    }
    return JSON.parse(text);
}

function writeList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

// Returns { books: [...], monthly: [...] }
function fetchDashboardData() {
    // TODO BACKEND: replace the two lines below with:
    //   const response = await fetch(API_URL + '/dashboard');
    //   return await response.json();   // expected: { books: [], monthly: [] }
    // (the function must then become "async" and the callers must "await" it)
    var books = readList(BOOKS_KEY);
    var monthly = readList(MONTHLY_KEY);
    return { books: books, monthly: monthly };
}

// Adds a new book, or updates it if bookData.id already exists
function saveBookToBackend(bookData) {
    var books = readList(BOOKS_KEY);
    bookData.updatedAt = Date.now();

    // TODO BACKEND: replace everything below with something like:
    //   const method = bookData.id ? 'PUT' : 'POST';
    //   const url = bookData.id ? API_URL + '/books/' + bookData.id : API_URL + '/books';
    //   await fetch(url, {
    //       method: method,
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(bookData)
    //   });
    if (bookData.id) {
        for (var i = 0; i < books.length; i++) {
            if (books[i].id === bookData.id) {
                books[i] = bookData;
            }
        }
    } else {
        bookData.id = 'book-' + Date.now();
        books.push(bookData);
    }
    writeList(BOOKS_KEY, books);
}

// Adds a new monthly record, or updates it if statsData.id already exists
function saveMonthlyRecordToBackend(statsData) {
    var records = readList(MONTHLY_KEY);
    statsData.updatedAt = Date.now();

    // TODO BACKEND: replace everything below with something like:
    //   const method = statsData.id ? 'PUT' : 'POST';
    //   const url = statsData.id ? API_URL + '/monthly/' + statsData.id : API_URL + '/monthly';
    //   await fetch(url, {
    //       method: method,
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(statsData)
    //   });
    if (statsData.id) {
        for (var i = 0; i < records.length; i++) {
            if (records[i].id === statsData.id) {
                records[i] = statsData;
            }
        }
    } else {
        statsData.id = 'monthly-' + Date.now();
        records.push(statsData);
    }
    writeList(MONTHLY_KEY, records);
}

// Deletes a book or a monthly record. The id starts with "book-" or "monthly-"
function deleteRecordFromBackend(id) {
    // TODO BACKEND: replace everything below with:
    //   await fetch(API_URL + '/records/' + id, { method: 'DELETE' });
    var key = MONTHLY_KEY;
    if (id.indexOf('book-') === 0) {
        key = BOOKS_KEY;
    }
    var list = readList(key);
    var remaining = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i].id !== id) {
            remaining.push(list[i]);
        }
    }
    writeList(key, remaining);
}


/* ==========================================================
   2. CONSTANTS AND HELPERS
   ========================================================== */

var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
var YEARS = [2024, 2025, 2026];

var OPTIONAL_FIELD_IDS = ['book-date', 'book-call', 'book-edition',
    'book-volume', 'book-issue', 'book-isbn', 'book-remarks'];

function $(id) {
    return document.getElementById(id);
}

// Fills a <select> with year options
function fillYearSelect(selectId, selectedYear) {
    var select = $(selectId);
    select.innerHTML = '';
    for (var i = 0; i < YEARS.length; i++) {
        var option = document.createElement('option');
        option.value = YEARS[i];
        option.textContent = YEARS[i];
        select.appendChild(option);
    }
    select.value = selectedYear;
}

// Fills a <select> with month options. includeAll adds "All Months" (value 0)
function fillMonthSelect(selectId, includeAll) {
    var select = $(selectId);
    select.innerHTML = '';
    if (includeAll) {
        var allOption = document.createElement('option');
        allOption.value = 0;
        allOption.textContent = 'All Months';
        select.appendChild(allOption);
    }
    for (var i = 0; i < MONTH_NAMES.length; i++) {
        var option = document.createElement('option');
        option.value = i + 1;
        option.textContent = MONTH_NAMES[i];
        select.appendChild(option);
    }
}

// Stops user text from being treated as HTML
function escapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatNumber(number) {
    return Number(number).toLocaleString();
}


/* ==========================================================
   3. NAVIGATION
   ========================================================== */

function showView(viewId) {
    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) {
        views[i].classList.remove('active');
    }
    $(viewId).classList.add('active');

    var links = document.querySelectorAll('.nav-link');
    for (var j = 0; j < links.length; j++) {
        if (links[j].getAttribute('data-view') === viewId) {
            links[j].classList.add('active');
        } else {
            links[j].classList.remove('active');
        }
    }

    refreshAll();
    window.scrollTo(0, 0);
}

function setupNavigation() {
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function (event) {
            event.preventDefault();
            showView(this.getAttribute('data-view'));
        });
    }

    $('btn-add-monthly').addEventListener('click', function () {
        clearMonthlyForm();
        showView('view-monthly-entry');
    });
    $('btn-go-inventory').addEventListener('click', function () {
        showView('view-inventory');
    });
}

// Re-draws everything. Called after any change so numbers stay up to date.
function refreshAll() {
    renderDashboard();
    renderInventoryTable();
    renderMonthlyTable();
    renderReport();
}


/* ==========================================================
   4. DASHBOARD
   ========================================================== */

function renderDashboard() {
    var data = fetchDashboardData();
    var year = Number($('dash-year').value);
    var month = Number($('dash-month').value);

    // Add up the monthly records for the chosen year (and month if chosen)
    var totals = { visitors: 0, borrowed: 0, inquiries: 0, computers: 0, activities: 0 };
    for (var i = 0; i < data.monthly.length; i++) {
        var record = data.monthly[i];
        if (record.year === year && (month === 0 || record.month === month)) {
            totals.visitors += record.visitors;
            totals.borrowed += record.borrowed;
            totals.inquiries += record.inquiries;
            totals.computers += record.computers;
            totals.activities += record.activities;
        }
    }

    // Total books = sum of all copies in the inventory
    var totalBooks = 0;
    for (var b = 0; b < data.books.length; b++) {
        totalBooks += Number(data.books[b].copies) || 0;
    }

    $('stat-visitors').textContent = formatNumber(totals.visitors);
    $('stat-borrowed').textContent = formatNumber(totals.borrowed);
    $('stat-inventory').textContent = formatNumber(totalBooks);
    $('stat-inquiries').textContent = formatNumber(totals.inquiries);
    $('stat-computers').textContent = formatNumber(totals.computers);
    $('stat-activities').textContent = formatNumber(totals.activities);

    // Charts always show Jan-Dec of the selected year
    var visitorsByMonth = [];
    var borrowedByMonth = [];
    for (var m = 0; m < 12; m++) {
        visitorsByMonth.push(0);
        borrowedByMonth.push(0);
    }
    for (var r = 0; r < data.monthly.length; r++) {
        if (data.monthly[r].year === year) {
            visitorsByMonth[data.monthly[r].month - 1] += data.monthly[r].visitors;
            borrowedByMonth[data.monthly[r].month - 1] += data.monthly[r].borrowed;
        }
    }
    drawBarChart('chart-visitors', visitorsByMonth);
    drawBarChart('chart-borrowed', borrowedByMonth);

    renderRecentList(data);
}

function drawBarChart(containerId, values) {
    var biggest = 1;
    for (var i = 0; i < values.length; i++) {
        if (values[i] > biggest) {
            biggest = values[i];
        }
    }

    var html = '';
    for (var m = 0; m < 12; m++) {
        var percent = (values[m] / biggest) * 100;
        html += '<div class="bar-row">' +
            '<span class="bar-label">' + MONTH_NAMES[m].substring(0, 3) + '</span>' +
            '<div class="bar-track"><div class="bar-fill" style="width:' + percent + '%"></div></div>' +
            '<span class="bar-value">' + formatNumber(values[m]) + '</span>' +
            '</div>';
    }
    $(containerId).innerHTML = html;
}

// Shows the 5 newest added/edited items (books and monthly records mixed)
function renderRecentList(data) {
    var items = [];
    for (var i = 0; i < data.books.length; i++) {
        var book = data.books[i];
        items.push({
            id: book.id,
            type: 'Book',
            name: book.title,
            meta: 'by ' + book.author,
            updatedAt: book.updatedAt || 0
        });
    }
    for (var j = 0; j < data.monthly.length; j++) {
        var record = data.monthly[j];
        items.push({
            id: record.id,
            type: 'Monthly',
            name: MONTH_NAMES[record.month - 1] + ' ' + record.year,
            meta: formatNumber(record.visitors) + ' visitors, ' + formatNumber(record.borrowed) + ' borrowed',
            updatedAt: record.updatedAt || 0
        });
    }

    items.sort(function (a, b) {
        return b.updatedAt - a.updatedAt;
    });
    items = items.slice(0, 5);

    if (items.length === 0) {
        $('recent-list').innerHTML = '<li class="empty-text">No records yet.</li>';
        return;
    }

    var html = '';
    for (var k = 0; k < items.length; k++) {
        html += '<li class="recent-item">' +
            '<div><div class="recent-name"><span class="tag">' + items[k].type + '</span>' +
            escapeHtml(items[k].name) + '</div>' +
            '<div class="recent-meta">' + escapeHtml(items[k].meta) + '</div></div>' +
            '<button class="btn btn-outline btn-small" data-edit-id="' + items[k].id + '">Edit</button>' +
            '</li>';
    }
    $('recent-list').innerHTML = html;
}

function setupDashboard() {
    var now = new Date();
    var year = now.getFullYear();
    if (YEARS.indexOf(year) === -1) {
        year = YEARS[YEARS.length - 1];
    }
    fillYearSelect('dash-year', year);
    fillMonthSelect('dash-month', true);

    $('dash-year').addEventListener('change', renderDashboard);
    $('dash-month').addEventListener('change', renderDashboard);

    // Edit buttons in the recent list
    $('recent-list').addEventListener('click', function (event) {
        var id = event.target.getAttribute('data-edit-id');
        if (id) {
            editRecord(id);
        }
    });
}

// Opens the correct form for a book or monthly record
function editRecord(id) {
    if (id.indexOf('book-') === 0) {
        startEditBook(id);
    } else {
        startEditMonthly(id);
    }
}


/* ==========================================================
   5. BOOK INVENTORY
   ========================================================== */

// Field name -> input id (used for saving, editing and clearing)
var BOOK_FIELDS = {
    progression: 'book-progression',
    title: 'book-title',
    author: 'book-author',
    date: 'book-date',
    callNumber: 'book-call',
    edition: 'book-edition',
    volume: 'book-volume',
    issue: 'book-issue',
    isbn: 'book-isbn',
    copies: 'book-copies',
    location: 'book-location',
    remarks: 'book-remarks'
};

function findBook(id) {
    var books = fetchDashboardData().books;
    for (var i = 0; i < books.length; i++) {
        if (books[i].id === id) {
            return books[i];
        }
    }
    return null;
}

// "Fill Empty Optional Fields with N/A" button
function fillEmptyOptionalFields() {
    for (var i = 0; i < OPTIONAL_FIELD_IDS.length; i++) {
        var input = $(OPTIONAL_FIELD_IDS[i]);
        if (input.value.trim() === '') {
            input.value = 'N/A';
        }
    }
}

function clearBookForm() {
    $('book-form').reset();
    $('book-id').value = '';
    $('book-copies').value = 1;
    $('book-error').textContent = '';
    $('book-form-title').textContent = 'Add a New Book';
}

function handleBookSubmit(event) {
    event.preventDefault();

    var progression = $('book-progression').value.trim();
    var title = $('book-title').value.trim();
    var author = $('book-author').value.trim();

    if (progression === '' || title === '' || author === '') {
        $('book-error').textContent = 'Progression No., Title and Author / Editor are required.';
        return;
    }

    var copies = parseInt($('book-copies').value, 10);
    if (isNaN(copies) || copies < 1) {
        copies = 1;
    }

    var bookData = {
        id: $('book-id').value,
        progression: progression,
        title: title,
        author: author,
        date: $('book-date').value.trim(),
        callNumber: $('book-call').value.trim(),
        edition: $('book-edition').value.trim(),
        volume: $('book-volume').value.trim(),
        issue: $('book-issue').value.trim(),
        isbn: $('book-isbn').value.trim(),
        copies: copies,
        location: $('book-location').value.trim(),
        remarks: $('book-remarks').value.trim()
    };

    saveBookToBackend(bookData);
    clearBookForm();
    refreshAll();
}

function startEditBook(id) {
    var book = findBook(id);
    if (book === null) {
        return;
    }
    showView('view-inventory');
    $('book-id').value = book.id;
    for (var field in BOOK_FIELDS) {
        $(BOOK_FIELDS[field]).value = book[field];
    }
    $('book-error').textContent = '';
    $('book-form-title').textContent = 'Edit Book';
}

function renderInventoryTable() {
    var books = fetchDashboardData().books;
    var keyword = $('inventory-search').value.trim().toLowerCase();
    var html = '';

    for (var i = 0; i < books.length; i++) {
        var b = books[i];
        if (keyword !== '' && JSON.stringify(b).toLowerCase().indexOf(keyword) === -1) {
            continue;
        }
        html += '<tr>' +
            '<td>' + escapeHtml(b.progression) + '</td>' +
            '<td>' + escapeHtml(b.title) + '</td>' +
            '<td>' + escapeHtml(b.author) + '</td>' +
            '<td>' + escapeHtml(b.date) + '</td>' +
            '<td>' + escapeHtml(b.callNumber) + '</td>' +
            '<td>' + escapeHtml(b.edition) + '</td>' +
            '<td>' + escapeHtml(b.volume) + '</td>' +
            '<td>' + escapeHtml(b.issue) + '</td>' +
            '<td>' + escapeHtml(b.isbn) + '</td>' +
            '<td>' + escapeHtml(b.copies) + '</td>' +
            '<td>' + escapeHtml(b.location) + '</td>' +
            '<td>' + escapeHtml(b.remarks) + '</td>' +
            '<td class="action-cell">' +
            '<button class="btn btn-outline btn-small" data-edit-id="' + b.id + '">Edit</button>' +
            '<button class="btn btn-outline btn-small btn-danger" data-delete-id="' + b.id + '">Delete</button>' +
            '</td></tr>';
    }

    if (html === '') {
        html = '<tr><td colspan="13" class="empty-text">No books found.</td></tr>';
    }
    $('inventory-body').innerHTML = html;
}

function setupInventory() {
    $('book-form').addEventListener('submit', handleBookSubmit);
    $('btn-fill-na').addEventListener('click', fillEmptyOptionalFields);
    $('btn-clear-book').addEventListener('click', clearBookForm);
    $('inventory-search').addEventListener('input', renderInventoryTable);

    $('inventory-body').addEventListener('click', function (event) {
        var editId = event.target.getAttribute('data-edit-id');
        var deleteId = event.target.getAttribute('data-delete-id');
        if (editId) {
            startEditBook(editId);
        }
        if (deleteId && confirm('Delete this book from the inventory?')) {
            deleteRecordFromBackend(deleteId);
            refreshAll();
        }
    });
}


/* ==========================================================
   6. MONTHLY STATISTICS ENTRY
   ========================================================== */

function findMonthly(id) {
    var records = fetchDashboardData().monthly;
    for (var i = 0; i < records.length; i++) {
        if (records[i].id === id) {
            return records[i];
        }
    }
    return null;
}

function clearMonthlyForm() {
    $('monthly-form').reset();
    $('monthly-id').value = '';
    $('monthly-error').textContent = '';
    $('monthly-form-title').textContent = 'Add Monthly Record';
    $('monthly-visitors').value = 0;
    $('monthly-borrowed').value = 0;
    $('monthly-inquiries').value = 0;
    $('monthly-computers').value = 0;
    $('monthly-activities').value = 0;
}

function numberFromInput(inputId) {
    var value = parseInt($(inputId).value, 10);
    if (isNaN(value) || value < 0) {
        return 0;
    }
    return value;
}

function handleMonthlySubmit(event) {
    event.preventDefault();

    var year = Number($('monthly-year').value);
    var month = Number($('monthly-month').value);
    var id = $('monthly-id').value;

    // Only one record is allowed for each year + month
    var records = fetchDashboardData().monthly;
    for (var i = 0; i < records.length; i++) {
        if (records[i].year === year && records[i].month === month && records[i].id !== id) {
            $('monthly-error').textContent = 'A record for ' + MONTH_NAMES[month - 1] + ' ' + year +
                ' already exists. Edit it from the table below.';
            return;
        }
    }

    var statsData = {
        id: id,
        year: year,
        month: month,
        visitors: numberFromInput('monthly-visitors'),
        borrowed: numberFromInput('monthly-borrowed'),
        inquiries: numberFromInput('monthly-inquiries'),
        computers: numberFromInput('monthly-computers'),
        activities: numberFromInput('monthly-activities')
    };

    saveMonthlyRecordToBackend(statsData);
    clearMonthlyForm();
    refreshAll();
}

function startEditMonthly(id) {
    var record = findMonthly(id);
    if (record === null) {
        return;
    }
    showView('view-monthly-entry');
    $('monthly-id').value = record.id;
    $('monthly-year').value = record.year;
    $('monthly-month').value = record.month;
    $('monthly-visitors').value = record.visitors;
    $('monthly-borrowed').value = record.borrowed;
    $('monthly-inquiries').value = record.inquiries;
    $('monthly-computers').value = record.computers;
    $('monthly-activities').value = record.activities;
    $('monthly-error').textContent = '';
    $('monthly-form-title').textContent = 'Edit Monthly Record';
}

function renderMonthlyTable() {
    var records = fetchDashboardData().monthly.slice();
    records.sort(function (a, b) {
        return (b.year * 100 + b.month) - (a.year * 100 + a.month);
    });

    var html = '';
    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        html += '<tr>' +
            '<td>' + r.year + '</td>' +
            '<td>' + MONTH_NAMES[r.month - 1] + '</td>' +
            '<td>' + formatNumber(r.visitors) + '</td>' +
            '<td>' + formatNumber(r.borrowed) + '</td>' +
            '<td>' + formatNumber(r.inquiries) + '</td>' +
            '<td>' + formatNumber(r.computers) + '</td>' +
            '<td>' + formatNumber(r.activities) + '</td>' +
            '<td class="action-cell">' +
            '<button class="btn btn-outline btn-small" data-edit-id="' + r.id + '">Edit</button>' +
            '<button class="btn btn-outline btn-small btn-danger" data-delete-id="' + r.id + '">Delete</button>' +
            '</td></tr>';
    }
    if (html === '') {
        html = '<tr><td colspan="8" class="empty-text">No monthly records yet.</td></tr>';
    }
    $('monthly-body').innerHTML = html;
}

function setupMonthlyEntry() {
    fillYearSelect('monthly-year', $('dash-year').value);
    fillMonthSelect('monthly-month', false);
    $('monthly-month').value = new Date().getMonth() + 1;

    $('monthly-form').addEventListener('submit', handleMonthlySubmit);
    $('btn-clear-monthly').addEventListener('click', clearMonthlyForm);

    $('monthly-body').addEventListener('click', function (event) {
        var editId = event.target.getAttribute('data-edit-id');
        var deleteId = event.target.getAttribute('data-delete-id');
        if (editId) {
            startEditMonthly(editId);
        }
        if (deleteId && confirm('Delete this monthly record?')) {
            deleteRecordFromBackend(deleteId);
            refreshAll();
        }
    });
}


/* ==========================================================
   7. REPORTS AND EXPORT
   ========================================================== */

// Table headings for each report type
var MONTHLY_HEADINGS = ['Year', 'Month', 'Total Library Visitors', 'Books Borrowed / Circulation',
    'Reference Inquiries', 'Internet / Computer Users', 'Library Activities Conducted'];
var INVENTORY_HEADINGS = ['Progression No.', 'Title', 'Author / Editor', 'Date of Publication',
    'Call Number', 'Edition', 'Volume', 'Issue No.', 'ISBN / ISSN', 'No. of Copies',
    'Location', 'Remarks'];

// Holds what is currently shown, so the CSV export matches the screen
var currentReport = { headings: [], rows: [] };

function buildMonthlyReportRows(data, year, month, keyword) {
    var rows = [];
    var records = data.monthly.slice();
    records.sort(function (a, b) {
        return a.month - b.month;
    });
    for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.year !== year) {
            continue;
        }
        if (month !== 0 && r.month !== month) {
            continue;
        }
        var row = [r.year, MONTH_NAMES[r.month - 1], r.visitors, r.borrowed,
            r.inquiries, r.computers, r.activities];
        if (keyword === '' || row.join(' ').toLowerCase().indexOf(keyword) !== -1) {
            rows.push(row);
        }
    }
    return rows;
}

function buildInventoryReportRows(data, keyword) {
    var rows = [];
    for (var i = 0; i < data.books.length; i++) {
        var b = data.books[i];
        var row = [b.progression, b.title, b.author, b.date, b.callNumber, b.edition,
            b.volume, b.issue, b.isbn, b.copies, b.location, b.remarks];
        if (keyword === '' || row.join(' ').toLowerCase().indexOf(keyword) !== -1) {
            rows.push(row);
        }
    }
    return rows;
}

function renderReport() {
    var data = fetchDashboardData();
    var type = $('report-type').value;
    var year = Number($('report-year').value);
    var month = Number($('report-month').value);
    var keyword = $('report-search').value.trim().toLowerCase();

    // Month filter only matters for the monthly report
    $('report-month').disabled = (type === 'inventory');

    if (type === 'monthly') {
        currentReport.headings = MONTHLY_HEADINGS;
        currentReport.rows = buildMonthlyReportRows(data, year, month, keyword);
        $('report-title').textContent = 'Monthly Statistical Summary';
        var monthText = (month === 0) ? 'All Months' : MONTH_NAMES[month - 1];
        $('report-subtitle').textContent = monthText + ' ' + year;
    } else {
        currentReport.headings = INVENTORY_HEADINGS;
        currentReport.rows = buildInventoryReportRows(data, keyword);
        $('report-title').textContent = 'Book Inventory Masterlist';
        $('report-subtitle').textContent = 'As of ' + new Date().toLocaleDateString();
    }

    var headHtml = '<tr>';
    for (var h = 0; h < currentReport.headings.length; h++) {
        headHtml += '<th>' + currentReport.headings[h] + '</th>';
    }
    headHtml += '</tr>';
    $('report-head').innerHTML = headHtml;

    var bodyHtml = '';
    for (var r = 0; r < currentReport.rows.length; r++) {
        bodyHtml += '<tr>';
        for (var c = 0; c < currentReport.rows[r].length; c++) {
            bodyHtml += '<td>' + escapeHtml(currentReport.rows[r][c]) + '</td>';
        }
        bodyHtml += '</tr>';
    }
    if (bodyHtml === '') {
        bodyHtml = '<tr><td colspan="' + currentReport.headings.length +
            '" class="empty-text">No data for this selection.</td></tr>';
    }
    $('report-body').innerHTML = bodyHtml;
}

// Wraps a value in quotes so commas inside text do not break the CSV
function csvCell(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
}

function exportReportToCsv() {
    var lines = [];
    var headingCells = [];
    for (var h = 0; h < currentReport.headings.length; h++) {
        headingCells.push(csvCell(currentReport.headings[h]));
    }
    lines.push(headingCells.join(','));

    for (var r = 0; r < currentReport.rows.length; r++) {
        var cells = [];
        for (var c = 0; c < currentReport.rows[r].length; c++) {
            cells.push(csvCell(currentReport.rows[r][c]));
        }
        lines.push(cells.join(','));
    }

    var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = ($('report-type').value === 'monthly' ? 'monthly-summary' : 'book-inventory') + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function setupReports() {
    fillYearSelect('report-year', $('dash-year').value);
    fillMonthSelect('report-month', true);

    var ids = ['report-type', 'report-year', 'report-month'];
    for (var i = 0; i < ids.length; i++) {
        $(ids[i]).addEventListener('change', renderReport);
    }
    $('report-search').addEventListener('input', renderReport);
    $('btn-export-csv').addEventListener('click', exportReportToCsv);
    $('btn-print').addEventListener('click', function () {
        window.print();
    });
}


/* ==========================================================
   8. START-UP
   ========================================================== */

setupDashboard();
setupNavigation();
setupInventory();
setupMonthlyEntry();
setupReports();
refreshAll();

