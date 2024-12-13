"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import Listingpage3cols from "@/app/src/components/ListingPageComponents/Listingpage3cols";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAllEditRecordIds,
  resetDeleteStatus,
  setPageNumber,
} from "@/app/src/Redux/Slice/slice";

const mapping = () => {
  const [token, setToken] = useState("");
  const [mappings, setMappings] = useState([]);
  const [sizePerPage, setSizePerPage] = useState(50);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchFilterInputs = useSelector(
    (state) => state.tasks.fetchFilterInput
  );
  const dispatch = useDispatch();
  const deleteStatus = useSelector((state) => state.tasks.deleteStatus);
  const currentpageNumber = useSelector((state) => state.tasks.pageNumber);
  const fields = [
    { label: "Identifier", value: "identifier" },
    { label: "Short Description", value: "shortDescription" },
    { label: "Mapping", value: "node" },
  ];
  const exportDownloadContent = [
    { value: "status", label: "Status" },
    { value: "node", label: "Node" },
    { value: "sourceTargetParamMappings", label: "SourceTargetParamMappings" },
    { value: "dataRelation", label: "DataRelation" },
    { value: "subsidiaries", label: "Subsidiaries" },
    { value: "shortDescription", label: "ShortDescription" },
    { value: "identifier", label: "Identifier" },
  ];

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      dispatch(clearAllEditRecordIds());
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchMappings();
    }

    if (deleteStatus === "deleted") {
      fetchMappings();
      dispatch(resetDeleteStatus()); // Reset deleteStatus after the data is fetched
    }
  }, [token, currentpageNumber, sizePerPage, fetchFilterInputs, deleteStatus]);

  const fetchMappings = async () => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        page: currentpageNumber,
        sizePerPage: sizePerPage === totalRecord ? totalRecord : sizePerPage,
        sourceTargetMappings: fetchFilterInputs,
        // ...(fetchFilterInputs.length === 0 && { page: currentpageNumber }),
      };
      const response = await axios.post(`${api}/admin/mapping`, body, {
        headers,
      });

      setMappings(response.data.sourceTargetMappings || []);
      setTotalRecord(response.data.totalRecords);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Error fetching dropdown data");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setPageNumber(newPage));
  };

  const handleSizeChange = (event) => {
    const selectedSize = event.target.value;
    if (selectedSize === "all") {
      setSizePerPage("all"); // Example: set a high number to show all items
    } else {
      setSizePerPage(parseInt(selectedSize)); // Convert string to number
    }
  };

  const startRecord = currentpageNumber * sizePerPage + 1;
  const endRecord = Math.min(startRecord + sizePerPage - 1, totalRecord);

  const addnewroutepath = "/admin/mapping/add-mapping";
  const breadscrums = "Admin > Mapping";
  const cuurentpagemodelname = "Mapping";
  const editnewroutepath = "/admin/mapping/edit-mapping";
  const aresuremodal = "delete this items?";
  const aresuremodaltype = "Delete";
  const apiroutepath = "mapping";
  const deleteKeyField = "sourceTargetMappings";

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      <Listingpage3cols
        addnewroutepath={addnewroutepath}
        cuurentpagemodelname={cuurentpagemodelname}
        breadscrums={breadscrums}
        fields={fields} // Pass the field configuration
        data={mappings}
        currentPage={currentpageNumber}
        sizePerPage={sizePerPage}
        totalPages={totalPages}
        totalRecord={totalRecord}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        loading={loading}
        startRecord={startRecord} // Pass calculated startRecord
        endRecord={endRecord} // Pass calculated endRecord
        aresuremodal={aresuremodal}
        aresuremodaltype={aresuremodaltype}
        editnewroutepath={editnewroutepath}
        deleteKeyField={deleteKeyField}
        apiroutepath={apiroutepath}
        exportDownloadContent={exportDownloadContent}
      />
    </div>
  );
};

export default mapping;
