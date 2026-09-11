function initSimpleTable(tableId, options) {
    var settings = options || {};
    var table = document.getElementById(tableId);
    var sortableColumns = settings.sortableColumns || [];
    var pageSize = settings.pageSize || 0;
    var defaultSortColumn = typeof settings.defaultSortColumn === 'number' ? settings.defaultSortColumn : null;
    var defaultSortDirection = settings.defaultSortDirection === 'desc' ? 'desc' : 'asc';
    var currentPage = 1;
    var currentSortColumn = null;
    var currentSortDirection = 'asc';
    var pager = null;
    var pageInfo = null;
    var previousButton = null;
    var nextButton = null;

    if (!table || !table.tBodies.length || !table.tHead || !table.tHead.rows.length) {
        return;
    }

    var tbody = table.tBodies[0];
    var rows = Array.prototype.slice.call(tbody.rows);
    var headers = Array.prototype.slice.call(table.tHead.rows[0].cells);

    function parseSortValue(value) {
        if (value === null || value === undefined) {
            return '';
        }

        var normalized = String(value).trim();
        if (normalized === '') {
            return '';
        }

        if (/^-?\d+(\.\d+)?$/.test(normalized)) {
            return Number(normalized);
        }

        return normalized.toLowerCase();
    }

    function getCellSortValue(row, index) {
        var cell = row.cells[index];
        if (!cell) {
            return '';
        }

        return parseSortValue(cell.getAttribute('data-sort-value') || cell.textContent || '');
    }

    function compareRows(leftRow, rightRow) {
        var leftValue = getCellSortValue(leftRow, currentSortColumn);
        var rightValue = getCellSortValue(rightRow, currentSortColumn);
        var result;

        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
            result = leftValue - rightValue;
        } else {
            result = String(leftValue).localeCompare(String(rightValue));
        }

        if (result === 0) {
            return 0;
        }

        return currentSortDirection === 'asc' ? result : -result;
    }

    function updateHeaderState() {
        headers.forEach(function(header, index) {
            if (sortableColumns.indexOf(index) === -1) {
                header.removeAttribute('aria-sort');
                return;
            }

            if (currentSortColumn === index) {
                header.setAttribute('aria-sort', currentSortDirection === 'asc' ? 'ascending' : 'descending');
                header.setAttribute('data-ud-sort-direction', currentSortDirection);
            } else {
                header.setAttribute('aria-sort', 'none');
                header.removeAttribute('data-ud-sort-direction');
            }
        });
    }

    function updatePager(totalPages) {
        if (!pager || !pageInfo || !previousButton || !nextButton) {
            return;
        }

        if (totalPages <= 1) {
            pager.hidden = true;
            return;
        }

        pager.hidden = false;
        pageInfo.textContent = currentPage + ' / ' + totalPages;
        previousButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
    }

    function renderRows() {
        var visibleRows = rows;
        var startIndex;
        var endIndex;
        var totalPages;

        if (currentSortColumn !== null) {
            rows.sort(compareRows);
        }

        if (pageSize > 0) {
            totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            startIndex = (currentPage - 1) * pageSize;
            endIndex = startIndex + pageSize;
            visibleRows = rows.slice(startIndex, endIndex);
            updatePager(totalPages);
        } else {
            updatePager(1);
        }

        tbody.innerHTML = '';
        visibleRows.forEach(function(row) {
            tbody.appendChild(row);
        });
    }

    function sortByColumn(index) {
        if (sortableColumns.indexOf(index) === -1) {
            return;
        }

        if (currentSortColumn === index) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = index;
            currentSortDirection = 'asc';
        }

        currentPage = 1;
        updateHeaderState();
        renderRows();
    }

    if (pageSize > 0) {
        pager = document.createElement('div');
        pager.className = 'ud-list-pagination';
        pager.hidden = true;

        previousButton = document.createElement('button');
        previousButton.type = 'button';
        previousButton.className = 'ud-list-pagination__button';
        previousButton.textContent = '<';
        previousButton.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderRows();
            }
        });

        pageInfo = document.createElement('span');
        pageInfo.className = 'ud-list-pagination__info';

        nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'ud-list-pagination__button';
        nextButton.textContent = '>';
        nextButton.addEventListener('click', function() {
            var totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
            if (currentPage < totalPages) {
                currentPage++;
                renderRows();
            }
        });

        pager.appendChild(previousButton);
        pager.appendChild(pageInfo);
        pager.appendChild(nextButton);
        table.parentNode.appendChild(pager);
    }

    headers.forEach(function(header, index) {
        if (sortableColumns.indexOf(index) === -1) {
            return;
        }

        header.classList.add('ud-list-table__sortable');
        header.tabIndex = 0;
        header.setAttribute('role', 'button');
        header.setAttribute('aria-sort', 'none');

        header.addEventListener('click', function() {
            sortByColumn(index);
        });

        header.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                sortByColumn(index);
            }
        });
    });

    if (defaultSortColumn !== null && sortableColumns.indexOf(defaultSortColumn) !== -1) {
        currentSortColumn = defaultSortColumn;
        currentSortDirection = defaultSortDirection;
        updateHeaderState();
    }

    renderRows();
}