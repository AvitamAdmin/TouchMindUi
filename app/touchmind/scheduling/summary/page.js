"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import Listingpage5cols from "@/app/src/components/ListingPageComponents/Listingpage5cols";

function Summary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [SummaryData, setSummaryData] = useState([]);
  const [page, setPage] = useState(0);  
  const [sizePerPage, setSizePerPage] = useState(50);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fields = [
    { label: 'Last Run-Time', value: 'JobTime' },
    { label: 'Subsidiary ', value: 'subsidiary' },
    { label: 'Schedulers ', value: 'scheduler' },
    { label: 'Result ', value: 'cronStatus' },
    { label: 'Issused cases ', value: 'processedSkus' },
];

const exportDownloadContent =  [
  { value: "status", label: "Status" },
  { value: "node", label: "Node" },
  { value: "sourceTargetParamMappings", label: "SourceTargetParamMappings" },
  { value: "dataRelation", label: "DataRelation" },
  { value: "subsidiaries", label: "Subsidiaries" },
  { value: "shortDescription", label: "ShortDescription" },
  { value: "identifier", label: "Identifier" }
];

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      fetchSummary(jwtToken);
    }
  }, []);

  const fetchSummary = async (jwtToken) => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      console.log("token" + token);
      const body = {
        page: page,
        sizePerPage: sizePerPage,

      };
      const response = await axios.post(`${api}/schedule/summary`, body, {
        headers,
      });
      setSummaryData(response.data.cronHistories || []);
      setTotalRecord(response.data.totalRecords);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Error fetching dropdown data", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSizeChange = (event) => {
    const selectedSize = event.target.value;
    if (selectedSize === "all") {
      setSizePerPage("all"); // Example: set a high number to show all items
    } else {
      setSizePerPage(parseInt(selectedSize)); // Convert string to number
    }
  };

  const startRecord = page * sizePerPage + 1;
  const endRecord = Math.min(startRecord + sizePerPage - 1, totalRecord);
  const cuurentpagemodelname = "Schedule"
  const apiroutepath = "schedule";
const breadscrums = "Scheduling > Summary"
const aresuremodal = "delete this items?";
 const aresuremodaltype = "Delete";
//  const addnewroutepath = "/admin/scheduler/add-toolkitCronjobs"


  return (
    <div className="" style={{ fontFamily: "SamsungOne, sans-serif" }}>
          {error && <div className="text-red-500">{error}</div>}
          <Listingpage5cols
                breadscrums={breadscrums}
                aresuremodal={aresuremodal}
                aresuremodaltype={aresuremodaltype}
            cuurentpagemodelname={cuurentpagemodelname}
            fields={fields} // Pass the field configuration
            data={SummaryData}
            currentPage={page}
            sizePerPage={sizePerPage}
            totalPages={totalPages}
            totalRecord={totalRecord}
            onPageChange={handlePageChange}
            onSizeChange={handleSizeChange}
            loading={loading}
            startRecord={startRecord} // Pass calculated startRecord
            endRecord={endRecord} // Pass calculated endRecord
            apiroutepath={apiroutepath}
        exportDownloadContent={exportDownloadContent}          />
       </div>
  );
}

export default Summary;
