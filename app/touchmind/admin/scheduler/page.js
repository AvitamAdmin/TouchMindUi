"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import Listingpage5cols from "@/app/src/components/ListingPageComponents/Listingpage5cols";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAllEditRecordIds,
  resetDeleteStatus,
  setPageNumber,
} from "@/app/src/Redux/Slice/slice";

const scheduler = () => {
  const [token, setToken] = useState("");
  const [schedulers, setSchedulers] = useState([]);
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
  console.log(currentpageNumber,"currentpageNumber currentpageNumber currentpageNumber");
  const fields = [
    { label: "CronId", value: "cronId" },
    { label: "Identifier", value: "identifier" },
    { label: "CronExpression", value: "cronExpression" },
    { label: "Mapping", value: "mapping" },
    { label: "Subsidiary", value: "subsidiary" },
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
      fetchSchedulers();
    }

    if (deleteStatus === "deleted") {
      fetchSchedulers();
      dispatch(resetDeleteStatus()); // Reset deleteStatus after the data is fetched
    }
  }, [token, currentpageNumber, sizePerPage, fetchFilterInputs, deleteStatus]);

  const fetchSchedulers = async () => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        page: currentpageNumber,
        sizePerPage: sizePerPage === totalRecord ? totalRecord : sizePerPage,
        // ...(fetchFilterInputs.length === 0 && { page: currentpageNumber }),
        schedulerJobs: fetchFilterInputs,
      };
      const response = await axios.post(`${api}/admin/scheduler`, body, {
        headers,
      });

      setSchedulers(response.data.schedulerJobs || []);
      setTotalRecord(response.data.totalRecords);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Error fetching Scheduler data");
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
  const addnewroutepath = "/admin/scheduler/add-toolkitCronjobs";
  const breadscrums = "Admin > Scheduler";
  const cuurentpagemodelname = "Scheduler";
  const editnewroutepath = "/admin/scheduler/edit-scheduler";
  const aresuremodal = "delete this items?";
  const exportDownloadContent = [
    { value: "status", label: "Status" },
    { value: "node", label: "Node" },
    { value: "sourceTargetParamMappings", label: "SourceTargetParamMappings" },
    { value: "dataRelation", label: "DataRelation" },
    { value: "subsidiaries", label: "Subsidiaries" },
    { value: "shortDescription", label: "ShortDescription" },
    { value: "identifier", label: "Identifier" },
  ];
  const aresuremodaltype = "Delete";
  const apiroutepath = "scheduler";
  const deleteKeyField = "schedulerJobs";

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      <Listingpage5cols
        addnewroutepath={addnewroutepath}
        breadscrums={breadscrums}
        cuurentpagemodelname={cuurentpagemodelname}
        fields={fields} // Pass the field configuration
        data={schedulers}
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

export default scheduler;
