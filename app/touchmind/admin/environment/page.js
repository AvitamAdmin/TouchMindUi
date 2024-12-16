"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import Listingpage3cols from "@/app/src/components/ListingPageComponents/Listingpage3cols";
import { useDispatch, useSelector } from "react-redux";
import { clearAllEditRecordIds, clearSearchValues, resetDeleteStatus, resetPageNumber, setaddressSearchBar, setAdvanceFilterValue, setConfigureListingPageModal, setFilterInputValueEmpty, setPageNumber, setsearchInputField } from "@/app/src/Redux/Slice/slice";
import { usePathname } from "next/navigation";

const environment = () => {
  const dispatch = useDispatch();
  const pathname = usePathname(); // Get current path
  useEffect(() => {
    dispatch(setaddressSearchBar(pathname));
  }, [dispatch, pathname]);
  const addressSearchBar = useSelector((state) => state.tasks.addressSearchBar);

  const [token, setToken] = useState("");
  const [environments, setEnvironments] = useState([]);
  const [sizePerPage, setSizePerPage] = useState(50);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [attributeList, setAttributeList] = useState([])

  const [error, setError] = useState(null);
  const fetchFilterInputs = useSelector(
    (state) => state.tasks.fetchFilterInput
  );
  const fields = [
    { label: 'Identifier', attribute: 'identifier' },
    { label: 'Short Description', attribute: 'shortDescription' },
    { label: 'Status', attribute: 'status' },
    
  ];
  useEffect(() => {
    if(pathname !== addressSearchBar){
      dispatch(resetPageNumber());
      dispatch(setFilterInputValueEmpty());
      dispatch(clearSearchValues()); // Always clear Redux state
      dispatch(setsearchInputField(false));
    }
  }, [pathname, addressSearchBar,])
  
  
  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      dispatch(clearAllEditRecordIds());
      dispatch(resetPageNumber());
      dispatch(setConfigureListingPageModal([]));
      return () => {
        // dispatch(setAdvanceFilterOperator('and'))
        dispatch(setAdvanceFilterValue([]));
      }
    }
  }, []);
  const deleteStatus = useSelector((state) => state.tasks.deleteStatus);
  const currentpageNumber = useSelector((state) => state.tasks.pageNumber);

  useEffect(() => {
    if (token) {
      fetchEnvironment();
    }
    if (deleteStatus === "deleted") {
      fetchEnvironment();
      dispatch(resetDeleteStatus()); // Reset deleteStatus after the data is fetched
    }
  }, [token, currentpageNumber, sizePerPage, fetchFilterInputs,deleteStatus]);

  const advanceSearchInputs = useSelector((state) => state.tasks.advanceSearch);

  useEffect(() => {
    if(token) fetchEnvironment(true);
  }, [advanceSearchInputs]);


  const fetchEnvironment = async (isAdvance = false) => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const headers = { Authorization: `Bearer ${token}` };
      var body;
      if (isAdvance) {
        body = {
          page:currentpageNumber,
          sizePerPage: sizePerPage === totalRecord ? totalRecord : sizePerPage,
          ...advanceSearchInputs,
          "node":"/admin/environment"

        };
      } else {
        body = {
          page:currentpageNumber,
          sizePerPage: sizePerPage === totalRecord ? totalRecord : sizePerPage,
          environments: fetchFilterInputs,
          "node":"/admin/environment"

        };
      }
      const response = await axios.post(`${api}/admin/environment`, body, { headers });
      
      setEnvironments(response.data.environments || []);
      setAttributeList(response.data.attributeList || []);
      setTotalRecord(response.data.totalRecords);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError("Error fetching environment data");
    } 
  };
  

  const handlePageChange = (newPage) => {
    dispatch(setPageNumber(newPage));
  };

  const handleSizeChange = (event) => {
    const selectedSize = event.target.value;
    if (selectedSize === "all") {
      setSizePerPage(totalRecord); // Set to totalRecord to fetch all items
    } else {
      setSizePerPage(parseInt(selectedSize)); // Convert string to number
    }
  };
  

  const addnewroutepath = "/admin/environment/add-environment"
  const breadscrums = "Admin > environment"
  const cuurentpagemodelname = "Environment"
  const editnewroutepath = "/admin/environment/edit-environment";
  const aresuremodal = "delete this items?";
  const exportDownloadContent =  [
    { value: "status", label: "Status" },
    { value: "node", label: "Node" },
    { value: "sourceTargetParamMappings", label: "SourceTargetParamMappings" },
    { value: "dataRelation", label: "DataRelation" },
    { value: "subsidiaries", label: "Subsidiaries" },
    { value: "shortDescription", label: "ShortDescription" },
    { value: "identifier", label: "Identifier" }
  ];  const aresuremodaltype = "Delete";
  const apiroutepath = "environment";
  const deleteKeyField = "environments";


  // Calculate startRecord and endRecord
  const startRecord = currentpageNumber * sizePerPage + 1;
  const endRecord = Math.min(startRecord + sizePerPage - 1, totalRecord);

  return (
    <div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Listingpage3cols
      cuurentpagemodelname={cuurentpagemodelname}
      breadscrums={breadscrums}
      addnewroutepath={addnewroutepath}
      fields={attributeList.length > 3 ? attributeList : fields} // Pass the field configuration
      data={environments}
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
        apiroutepath={apiroutepath}
        exportDownloadContent={exportDownloadContent}        deleteKeyField={deleteKeyField}
      />
    </div>
  );
};


export default environment;
