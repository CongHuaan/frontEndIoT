import React, { useState, useEffect, useCallback } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormSelect,
  CFormInput,
  CInputGroup,
} from "@coreui/react";
import '@coreui/coreui/dist/css/coreui.min.css';

const DataSensor = () => {
  const [sensors, setSensors] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1); // Thêm state để lưu trữ tổng số trang
  const [searchField, setSearchField] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const fetchSensors = useCallback(async (page, limit, searchField, searchValue) => {
    try {
      let url = `http://localhost:3001/sensor/paginated?page=${page}&limit=${limit}`;
      if (searchField && searchValue) {
        url += `&searchField=${searchField}&searchValue=${searchValue}`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSensors(data.data);
      setTotalPages(Math.ceil(data.total / limit)); // Cập nhật tổng số trang
    } catch (err) {
      console.log("Fetch Error:", err); // Log errors
    }  }, []);

  const fetchSortedSensors = useCallback(async (page, limit, searchField, searchValue) => {
    try {
      if (["humidity", "temperature", "light"].includes(sortField)) {
        let url = `http://localhost:3001/sensor/paginated?sortBy=${sortField}&order=${sortOrder}&page=${page}&limit=${limit}`;
        if (searchField && searchValue) {
          url += `&searchField=${searchField}&searchValue=${searchValue}`;
        }
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSensors(data.data);
        setTotalPages(Math.ceil(data.total / limit)); // Cập nhật tổng số trang
      } else {
        throw new Error("Invalid sort field");
      }
    } catch (err) {
      console.log("Fetch Error:", err); // Log errors
    }
  }, [sortField, sortOrder]);

  useEffect(() => {
    if (isSorted) {
      fetchSortedSensors(page, limit, searchField, searchValue);
    } else {
      fetchSensors(page, limit, searchField, searchValue);
    }
  }, [fetchSensors, fetchSortedSensors, isSorted, page, limit, searchField, searchValue]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sortOrder when clicking the same field
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      // Set new field and default to ascending order
      setSortField(field);
      setSortOrder("asc");
    }
    setIsSorted(true);
  };

  const handleReset = () => {
    setIsSorted(false);
    setSearchField("");
    setSearchValue("");
    fetchSensors(page, limit, "", ""); // Fetch data without sorting and searching
  };

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? "🔼" : "🔽";
    }
    return "🔼";
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages)); // Giới hạn trang tối đa
  };

  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value);
  };

  const handleSearchValueChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
    fetchSensors(1, limit, searchField, searchValue);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <CCard>
      <CCardHeader>
        <h3>Data Sensor</h3>
      </CCardHeader>
      <CCardBody>
        <CInputGroup className="mb-3">
          <CFormSelect value={searchField} onChange={handleSearchFieldChange}>
            <option value="">Select Field</option>
            <option value="humidity">Humidity</option>
            <option value="temperature">Temperature</option>
            <option value="light">Light</option>
          </CFormSelect>
          {searchField && (
            <CFormInput
              type="text"
              value={searchValue}
              onChange={handleSearchValueChange}
              placeholder={`Search ${searchField}`}
            />
          )}
          <CButton color="primary" onClick={handleSearch}>Search</CButton>
        </CInputGroup>
        <CButton color="secondary mb-3" onClick={handleReset}>Reset</CButton>
        <CTable hover responsive>
          <CTableHead color="dark">
            <CTableRow>
              <CTableHeaderCell scope="col">ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">
                Humidity
                <span onClick={() => handleSort("humidity")}>
                  {getSortIcon("humidity")}
                </span>
              </CTableHeaderCell>
              <CTableHeaderCell scope="col">
                Temperature
                <span onClick={() => handleSort("temperature")}>
                  {getSortIcon("temperature")}
                </span>
              </CTableHeaderCell>
              <CTableHeaderCell scope="col">
                Light
                <span onClick={() => handleSort("light")}>
                  {getSortIcon("light")}
                </span>
              </CTableHeaderCell>
              <CTableHeaderCell scope="col">Time update</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {sensors.map((sensor) => (
              <CTableRow key={sensor.id}>
                <CTableDataCell>{sensor.id}</CTableDataCell>
                <CTableDataCell>{sensor.humidity}</CTableDataCell>
                <CTableDataCell>{sensor.temperature}</CTableDataCell>
                <CTableDataCell>{sensor.light}</CTableDataCell>
                <CTableDataCell>{formatDate(sensor.time_updated)}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <div className="d-flex justify-content-between mt-3">
          <CButton color="primary" onClick={handlePreviousPage} disabled={page === 1}>
            Previous
          </CButton>
          <span>Page {page} of {totalPages}</span>
          <CButton color="primary" onClick={handleNextPage} disabled={page === totalPages}>
            Next
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default DataSensor;