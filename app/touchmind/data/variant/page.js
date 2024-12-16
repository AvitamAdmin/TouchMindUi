"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import Listingpage3cols from "@/app/src/components/ListingPageComponents/Listingpage3cols";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAllEditRecordIds,
  clearSearchValues,
  resetDeleteStatus,
  resetPageNumber,
  setaddressSearchBar,
  setAdvanceFilterValue,
  setConfigureListingPageModal,
  setFilterInputValueEmpty,
  setPageNumber,
  setsearchInputField,
} from "@/app/src/Redux/Slice/slice";
import { usePathname } from "next/navigation";

const variant = () => {
  const dispatch = useDispatch();
  const pathname = usePathname(); // Get current path
  useEffect(() => {
    dispatch(setaddressSearchBar(pathname));
  }, [dispatch, pathname]);
  const addressSearchBar = useSelector((state) => state.tasks.addressSearchBar);
  const [attributeList, setAttributeList] = useState([])

  const [token, setToken] = useState("");
  const [variants, setVariants] = useState([]);
  const [sizePerPage, setSizePerPage] = useState(50);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchFilterInputs = useSelector(
    (state) => state.tasks.fetchFilterInput
  );
  const deleteStatus = useSelector((state) => state.tasks.deleteStatus);
  const currentpageNumber = useSelector((state) => state.tasks.pageNumber);
  const fields = [
    { label: "Identifier", attribute: "identifier" },
    { label: "Short Description", attribute: "shortDescription" },
    { label: "Status", attribute: "status" },
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
      dispatch(setConfigureListingPageModal([]));
      return () => {
        // dispatch(setAdvanceFilterOperator('and'))
        dispatch(setAdvanceFilterValue([]));
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchVariant();
    }
    if (deleteStatus === "deleted") {
      fetchVariant();
      dispatch(resetDeleteStatus()); // Reset deleteStatus after the data is fetched
    }
  }, [token, currentpageNumber, sizePerPage, fetchFilterInputs, deleteStatus]);

  const advanceSearchInputs = useSelector((state) => state.tasks.advanceSearch);

  useEffect(() => {
    if(token) fetchVariant(true);
  }, [advanceSearchInputs]);

  const fetchVariant = async (isAdvance = false) => {
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
          "node":"/admin/variant"

        };
      } else {
        body = {
          page:currentpageNumber,
          sizePerPage: sizePerPage === totalRecord ? totalRecord : sizePerPage,
          variants: fetchFilterInputs,
          "node":"/admin/variant"

        };
      }
      const response = await axios.post(`${api}/admin/variant`, body, {
        headers,
      });

      setVariants(response.data.variants || []);
      setAttributeList(response.data.attributeList || []);
      setTotalRecord(response.data.totalRecords);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError("Error fetching variant data");
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

  const addnewroutepath = "/data/variant/add-variant";
  const breadscrums = "Admin > variant";
  const cuurentpagemodelname = "variant";
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
  const apiroutepath = "variant";
  const deleteKeyField = "variants";
  const editnewroutepath = "/data/variant/edit-variant";

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
        data={variants}
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
        apiroutepath={apiroutepath}
        exportDownloadContent={exportDownloadContent}
        deleteKeyField={deleteKeyField}
        editnewroutepath={editnewroutepath}
      />
    </div>
  );
};

export default variant;
