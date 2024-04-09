document.addEventListener('DOMContentLoaded', () => {
    const uploadCsvBtn = document.getElementById('uploadCsvBtn');
    uploadCsvBtn.addEventListener('click', handleUploadCsv);
    fetchData();

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.getElementById('editForm').style.display = 'none';
    });
});


async function fetchData() {
    try {
        const response = await fetch('http://localhost:5147/data');
        if (response.ok) {
            const data = await response.json();
            populateTable(data);
        } else {
            console.error('Failed to fetch data:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function handleUploadCsv() {
    const fileInput = document.getElementById('csvInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
        const response = await fetch('http://localhost:5147/csv', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('CSV file uploaded successfully.');
            fetchData();
        } else {
            const errorMessage = await response.text();
            alert(`Failed to upload CSV file: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Error uploading CSV file:', error);
        alert('An error occurred while uploading the CSV file.');
    }
}

async function populateTable(data) {
    const table = document.getElementById('dataTable');
    table.innerHTML = '';

    if (data.length === 0) {
        table.innerHTML = '<tr><td colspan="6">No data available</td></tr>';
        return;
    }

    const headerRow = document.createElement('tr');
    for (const key in data[0]) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    }
    headerRow.innerHTML += '<th>Edit</th><th>Delete</th>';
    table.appendChild(headerRow);

    data.forEach((item, index) => {
        const row = table.insertRow();
        row.dataset.rowIndex = index;
        for (const key in item) {
            const cell = row.insertCell();
            if (key === 'dateOfBirth') {
                const date = new Date(item[key]);
                const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
                cell.textContent = formattedDate;
            } else {
                cell.textContent = item[key];
            }
        }

        const editCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editRow({id: item.id, rowIndex: index, data: item});
        editCell.appendChild(editButton);

        const deleteCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteRow({id: item.id, rowIndex: index});
        deleteCell.appendChild(deleteButton);
    });
}

async function editRow(rowData) {
    const data = rowData.data;
    const date = new Date(data.dateOfBirth);
    const formattedDate = date.toISOString().split('T')[0];
    document.getElementById('editId').value = data.id;
    document.getElementById('editName').value = data.name;
    document.getElementById('editDateOfBirth').value = formattedDate;
    document.getElementById('editMarried').checked = data.married;
    document.getElementById('editPhone').value = data.phone;
    document.getElementById('editSalary').value = data.salary;
    document.getElementById('editForm').style.display = 'block';
}

document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const id = document.getElementById('editId').value;
    const newData = {
        id: parseInt(id),
        name: document.getElementById('editName').value,
        dateOfBirth: document.getElementById('editDateOfBirth').value,
        married: document.getElementById('editMarried').checked,
        phone: document.getElementById('editPhone').value,
        salary: parseFloat(document.getElementById('editSalary').value)
    };

    try {
        const response = await fetch(`http://localhost:5147/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });

        if (response.ok) {
            fetchData();
            document.getElementById('editForm').style.display = 'none';
        } else {
            console.error('Failed to update record:', response.statusText);
            alert('Failed to update record. Please try again.');
        }
    } catch (error) {
        console.error('Error updating record:', error);
        alert('An error occurred while updating the record.');
    }
});

async function deleteRow(rowData) {
    const confirmed = confirm('Are you sure you want to delete this record?');
    if (confirmed) {
        const id = rowData.id;
        if (!id) {
            console.error('Invalid id:', id);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5147/data/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchData();
            } else {
                console.error('Failed to delete record:', response.statusText);
                alert('Failed to delete record. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('An error occurred while deleting the record.');
        }
    }
}

document.getElementById('filterBtn').addEventListener('click', () => {
    const filterValue = document.getElementById('filterInput').value.trim().toLowerCase();
    const table = document.getElementById('dataTable');
    const rows = table.getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        let found = false;
        for (let j = 0; j < row.cells.length; j++) {
            const cell = row.cells[j];
            if (cell.textContent.toLowerCase().includes(filterValue)) {
                found = true;
                break;
            }
        }
        row.style.display = found ? '' : 'none';
    }
});

document.getElementById('clearFilterBtn').addEventListener('click', () => {
    document.getElementById('filterInput').value = '';
    const table = document.getElementById('dataTable');
    const rows = table.getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = '';
    }
});

document.getElementById('sortByNameBtn').addEventListener('click', () => {
    sortTable(1);
});

document.getElementById('sortByDateOfBirthBtn').addEventListener('click', () => {
    sortTable(2);
});

document.getElementById('sortBySalaryBtn').addEventListener('click', () => {
    sortTable(5);
});

function sortTable(columnIndex) {
    const table = document.getElementById('dataTable');
    const rows = Array.from(table.rows).slice(1);
    rows.sort((a, b) => {
        const aValue = getColumnValue(a.cells[columnIndex], columnIndex);
        const bValue = getColumnValue(b.cells[columnIndex], columnIndex);

        if (columnIndex === 2) {
            return aValue.getTime() - bValue.getTime();
        } else {
            return aValue.localeCompare(bValue);
        }
    });
    rows.forEach(row => {
        table.appendChild(row);
    });
}

function getColumnValue(cell, columnIndex) {
    if (columnIndex === 1) {
        return cell.textContent.trim();
    } else if (columnIndex === 2) {
        const dateString = cell.textContent.trim();
        const [day, month, year] = dateString.split('.');
        return new Date(year, month - 1, day);
    } else {
        return cell.textContent.toLowerCase();
    }
}