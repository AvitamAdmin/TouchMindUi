"use client";
import ShortcutModal from "@/app/src/components/modal/ShortcutModal";
import { api } from "@/envfile/api";
import { IconButton, MenuItem, TextField, Tooltip } from "@mui/material";
import axios from "axios";
import { getCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaPlus, FaUser } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { IoClose, IoExitOutline, IoSearch } from "react-icons/io5";
import {
  MdDelete,
  MdFileUpload,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import Lottie from "react-lottie";
import { useDispatch, useSelector } from "react-redux";
import * as animationData from "../../../../assests/LoadingAnimation.json";
import AreUSurepage from "@/app/src/components/modal/AreUSurepage";
import { setMultipleEditRecoedId } from "@/app/src/Redux/Slice/slice";
import { Toaster } from "react-hot-toast";
import { FaPlay } from "react-icons/fa";

function Page() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [showInputs, setShowInputs] = useState(false);
  const [token, setToken] = useState("");
  const [filterInput, setfilterInput] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [page, setPage] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [qaResults, setQaResults] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchFilterInputs = useSelector(
    (state) => state.tasks.fetchFilterInput
  );
  const toggleInputs = () => {
    setShowInputs(!showInputs);
  };
  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      console.log(jwtToken, "jwtToken token");
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchDatasources();
    }
  }, [token, page, sizePerPage, fetchFilterInputs]);
  useEffect(() => {
    setfilterInput(fetchFilterInputs);
  }, [fetchFilterInputs]);
  const fetchDatasources = async () => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        page,
        sizePerPage: sizePerPage === totalRecord ? totalRecord : sizePerPage,
        qaTestResults: fetchFilterInputs,
      };
      const response = await axios.post(`${api}/qa/results`, body, { headers });

      setQaResults(response.data.qaTestResults || []);
      console.log(response.data.qaTestResults, "response.data.qaTestResults ");
      setTotalRecord(response.data.totalRecords);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Error fetching Datasource data");
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
  const filter = [
    { value: "50", sizePerPage: 50 },
    { value: "100", sizePerPage: 100 },
    { value: "150", sizePerPage: 150 },
    { value: "200", sizePerPage: 200 },
    { value: "Show All", sizePerPage: "all" },
  ];
  // Calculate startRecord and endRecord
  const startRecord = page * sizePerPage + 1;
  const endRecord = Math.min(startRecord + sizePerPage - 1, totalRecord);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const fields = [
    { label: "User", value: "user" },
    { label: "Test Name", value: "testName" },
    { label: "SKU", value: "sku" },
    { label: "Passed Count", value: "testPassedCount" },
    { label: "Failed Count", value: "testFailedCount" },
  ];
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

  const getFieldValue = (item, fieldPath) => {
    const value = fieldPath
      .split(".")
      .reduce((obj, key) => (obj ? obj[key] : "-"), item);

    if (["status", "published"].some((field) => fieldPath.includes(field))) {
      // Convert boolean status or published to "active" or "inactive"
      return value === true ? "Active" : "Inactive";
    }

    return value === null || value === "" ? "-" : value;
  };
  const handleExport = () => {
    // Prepare the worksheet data
    console.log("hii");
    const worksheetData = data.map((item) => {
      const row = {};
      fields.forEach((field) => {
        row[field.label] = getFieldValue(item, field.value);
      });
      return row;
    });

    // Create a worksheet and a workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Apply bold styling to headers
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Get the header cell address
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true }, // Apply bold font style
        };
      }
    }

    // Convert the workbook to binary and create a downloadable link
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Download the file
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${breadscrums}.xlsx`;
    downloadLink.click();
    toast.success("File downloaded successfully");
  };

  const handledelete = async (deleteId) => {
    try {
      console.log("btn triggred");

      const headers = { Authorization: `Bearer ${token}` };
      console.log(elementId, "btn triggred");

      const body = {
        qaTestResults: [{ recordId: elementId }], // Template literal without quotes
      };

      const response = await axios.post(`${api}/qa/results/delete`, body, {
        headers,
      });
      // console.log(response.data);
      if (response.data.message) {
        closeModal();
        toast.success("Data deleted successfully!!");
        // router.push(`/cheil${homeroutepath}`);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting the record:", error);
      // Handle the error here (e.g., show a message to the user)
    }
  };
  const selectedMultipleID = useSelector(
    (state) => state.tasks.multipleEditRecordId
  );
  const handlemultipledelete = async () => {
    try {
      console.log("btn triggered");

      const headers = { Authorization: `Bearer ${token}` };

      // Create an array of objects, each with a single recordId
      const body = {
        qaTestResults: selectedMultipleID.map((id) => ({ recordId: id })),
      };

      const response = await axios.post(`${api}/qa/results/delete`, body, {
        headers,
      });

      if (response.data.message) {
        toast.success("Multiple Data deleted successfully!!");
        // router.push(`/cheil${homeroutepath}`);
        window.location.reload();
      }
      window.location.reload();
    } catch (error) {
      console.error("Error deleting the record:", error);
      // Handle the error here (e.g., show a message to the user)
    }
  };

  const dispatch = useDispatch();
  const handleCheckboxClick = (recordId) => {
    dispatch(setMultipleEditRecoedId(recordId));
  };
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
  return (
    <div style={{ fontFamily: "SamsungOne, sans-serif" }}>
      <Toaster />

      <div className=" bg-white ">
        <div className="p-1 rounded-md flex flex-row justify-between text-center w-[100%]">
          <div className="flex flex-row gap-2 w-[75%] items-center">
            <div className="flex-row flex gap-1  w-[10%]">
              <div>
                <span className="text-xs font-bold">QA</span>
              </div>
              <div>
                <span className="text-xs font-bold">{">"}</span>
              </div>
              <div>
                <span className="text-xs font-bold">QA Result</span>
              </div>
            </div>
            <div className="overflow-x-scroll w-[80%]">
              {totalPages > 0 && (
                <div className="flex space-x-3 bg-[#D3D3D3] w-full justify-start items-center p-2 rounded-md">
                  {pageNumbers.map((pageNum) => (
                    <div
                      key={pageNum}
                      className={`w-[25px] py-0.5 rounded ${
                        pageNum - 1 === page
                          ? "bg-[#cc0001] text-white"
                          : "bg-white text-gray-700"
                      } text-sm`}
                      onClick={() => handlePageChange(pageNum - 1)}
                    >
                      {pageNum}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-row flex gap-3 items-center justify-end w-[25%] ">
            <div onClick={handlemultipledelete}>
              <Tooltip
                arrow
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -14],
                        },
                      },
                    ],
                  },
                }}
                title="Delete"
              >
                <IconButton>
                  <MdDelete className="text-white bg-[#CC0001] p-1.5 rounded-md text-3xl " />
                </IconButton>
              </Tooltip>
            </div>

            <span className="border p-2 rounded-md text-xs w-[70px] bg-[#1581ed] text-center cursor-pointer  text-white text-center flex flex-row gap-3 items-center justify-center"
            
            >
              <FaPlay /> 
              <div>Run</div>
          </span>
          
            <div
              onClick={() => {}}
              className="flex flex-row p-2 border-solid border-2 border-gray-400 text-center cursor-pointer items-center rounded-md bg-white gap-1"
            >
             
             
              <span className="text-gray-500">
                <MdFileUpload />
              </span>
              <span className="text-gray-500 text-xs">Export</span>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex gap-4 items-center justify-end">
                <div
                  onClick={handleOpen}
                  className=" border-solid p-2 rounded-md text-xs w-[70px] text-white bg-[#2b2b2b] items-center text-center"
                >
                  Shortcuts
                </div>
                <Link
                  href=""
                  className=" border-solid p-2 rounded-md text-xs w-[70px] text-white bg-[#cc0001] items-center text-center"
                >
                  Email
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="  p-2 rounded-lg ">
          <div className=" bg-white rounded-md ">
            <div className="gap-3 flex flex-col  rounded-md   overflow-y-auto">
              <div
                style={{ backgroundColor: "#D3D3D3" }}
                className=" rounded-md shadow pl-4 pr-4"
              >
                <div className="flex items-center flex-row">
                  <div className="flex flex-row w-[100%]">
                    <div className="flex items-center gap-2 text-sm w-[5%]">
                      <input type="checkbox" />
                    </div>
                    {!showInputs ? (
                      <div className="w-full flex flex-row justify-between items-center pt-2.5 pb-2.5">
                        {fields.map((field, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-1 text-sm w-[15%] "
                          >
                            <span>{field.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-row w-full justify-between items-start pt-2.5 pb-2.5">
                        {fields.map((field, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm w-[30%]"
                          >
                            <input
                              key={index}
                              placeholder={`Search ${field.label}`}
                              value={searchValues[field.value]}
                              onChange={(e) => handleSearchChange(e, field)}
                              className="input-class text-sm flex items-start justify-start p-1"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-row items-center justify-end  gap-2 text-sm w-[10%]">
                      {showInputs ? (
                        <IoClose
                          className="cursor-pointer"
                          onClick={toggleInputs}
                        />
                      ) : (
                        <IoSearch
                          className="cursor-pointer"
                          onClick={toggleInputs}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display the filtered data */}
              <div
                style={{ backgroundColor: "#fff" }}
                className=" p-4 max-h-96 min-h-96 rounded-md overflow-y-scroll"
              >
                {loading ? (
                  <div className="w-full flex flex-col  h-80 justify-center items-center">
                    <div className="opacity-25 ">
                      <Lottie
                        options={defaultOptions}
                        height={100}
                        width={100}
                      />
                    </div>
                    <div>Loading data...</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-[100%]">
                    {qaResults.length < 1 ? (
                      <div className="text-center text-gray-500 text-sm">
                        No data found
                      </div>
                    ) : (
                      qaResults.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center text-gray-600 text-xs w-full "
                        >
                          <div className="flex items-center gap-2 text-sm w-[5%]">
                            <input
                              checked={selectedID.includes(item.recordId)}
                              type="checkbox"
                              onChange={(e) =>
                                handleCheckboxClick(item.recordId)
                              }
                            />
                          </div>
                          <div
                            className="flex w-[90%] justify-between cursor-pointer"
                            onClick={() => handleTap(item)}
                          >
                            {fields.map((field, idx) => (
                              <div
                                key={idx}
                                className="flex text-center  flex-row w-[15%] overflow-hidden text-ellipsis whitespace-nowrap"
                              >
                                <span>{getFieldValue(item, field.value)}</span>
                              </div>
                            ))}
                          </div>
                          <div
                            onClick={() => {
                              dispatch(getdeleteElementId(item.recordId));
                              openModal();
                            }}
                            className="gap-3 flex flex-row "
                          >
                            <Tooltip
                              arrow
                              placement="right-start"
                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [0, -14],
                                      },
                                    },
                                  ],
                                },
                              }}
                              title="Delete"
                            >
                              <IconButton>
                                <MdDelete className="text-black   rounded-md text-xl " />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div
                style={{ backgroundColor: "#D3D3D3" }}
                className=" p-2  w-full mt-5 flex justify-between rounded-md items-center px-2"
              >
                <div className="flex flex-row gap-3 items-center justify-center text-sm">
                  <div className="flex flex-row gap-2">
                    Showing
                    <div className=" flex flex-row gap-2">
                      <span className="  text-center flex bg-[#cc0001] rounded-sm text-white flex-row w-[30px] justify-center ">
                        {startRecord}
                      </span>
                      -
                      <span className="  flex flex-row w-[30px] bg-[#cc0001] rounded-sm text-white justify-center ">
                        {endRecord}
                      </span>
                    </div>
                    of {totalRecord} Entries
                  </div>
                  <TextField
                    className="w-28 text-sm"
                    size="small"
                    id="outlined-select-currency-native"
                    select
                    value={
                      sizePerPage === "all"
                        ? "Show All"
                        : sizePerPage.toString()
                    }
                    onChange={handleSizeChange}
                  >
                    {filter.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.sizePerPage.toString()}
                        className="text-sm"
                      >
                        {option.value}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShortcutModal open={open} handleClose={handleClose} />
      <AreUSurepage
        handleclick={handledelete}
        aresuremodaltype={aresuremodaltype}
        aresuremodal={aresuremodal}
        isOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
}

export default Page;
