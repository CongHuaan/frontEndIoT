import React, { useEffect, useState } from "react";
import {
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTable,
  CTableRow,
  CTableDataCell,
  CCard,
  CButton,
} from "@coreui/react";

const DataLed = () => {
  const [leds, setLeds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  const fetchLeds = async (page, limit) => {
    try {
      const response = await fetch(
        `http://localhost:3001/led/paginated?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setLeds(data.data);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (err) {
      console.log("Fetch Error:", err); // Log errors
    }
  };

  useEffect(() => {
    fetchLeds(page, limit);
  }, [page, limit]);

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <>
      <CCard>
        <CTable>
          <CTableHead>
            <CTableRow color="dark">
              <CTableHeaderCell scope="col">ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Time update</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {leds.map((led) => (
              <CTableRow key={led.id}>
                <CTableDataCell>{led.id}</CTableDataCell>
                <CTableDataCell>{led.name}</CTableDataCell>
                <CTableDataCell>{led.status}</CTableDataCell>
                <CTableDataCell>
                  {formatDate(led.time_updated)}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <div className="d-flex justify-content-between mt-3">
          <CButton
            color="primary"
            onClick={handlePreviousPage}
            disabled={page === 1}
          >
            Previous
          </CButton>
          <span>
            Page {page} of {totalPages}
          </span>
          <CButton
            color="primary"
            onClick={handleNextPage}
            disabled={page === totalPages}
          >
            Next
          </CButton>
        </div>
      </CCard>
    </>
  );
};

export default DataLed;
