"use client";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { TbClockEdit, TbClockPlus } from "react-icons/tb";
import { useRouter } from "next/navigation";
import axios from "axios";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import DataRelation from "@/app/src/components/dropdown/DataRelation";
import NodeDropdown from "@/app/src/components/dropdown/Node";
import MultiSelectNode from "@/app/src/components/multiSelectDropdown/MultiSelectNode";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditReportCompiler = () => {
  useEffect(() => {
    console.log("initial call");

    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handlefetchData(jwtToken);
      getDataSources(jwtToken);

      console.log("JWT Token retrieved:", jwtToken);
    } else {
      console.log("No token found");
    }
  }, []);
  const [token, setToken] = useState("");
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [editInputfields, seteditInputfields] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  // const [dataRelation, setDataRelation] = useState([]);

  const [datasourceData, setDatasourceData] = useState([]); // For storing dataSources
  const [datasourceDataParams, setDatasourceDataParams] = useState([]); // For storing datasource params
  const [selectedDataRelation, setSelectedDataRelation] = useState(null); // For selected DataRelation

  const dispatch = useDispatch();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const handleParamChange = (fieldIndex, paramIndex, key, value) => {
    const updatedFields = [...editInputfields];
    const updatedParams = [...updatedFields[fieldIndex].params];
    updatedParams[paramIndex] = {
      ...updatedParams[paramIndex],
      [key]: value,
    };

    updatedFields[fieldIndex].params = updatedParams;
    seteditInputfields(updatedFields);
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        if (name === "parentNode") {
          return {
            ...item,
            parentNode: { ...item.parentNode, identifier: value }, // Only update the identifier field of parentNode
          };
        }
        return { ...item, [name]: value }; // Update other fields normally
      }
      return item;
    });

    seteditInputfields(updatedFields); // Update the state with modified fields
  };
  const handlePostClick = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Construct the request body by using data from each item in editInputfields
      const body = {
        reportCompilers: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "-", // Use identifier value
          shortDescription: item.shortDescription || "-", // Use shortDescription value
          reportInterfaces: item.reportInterfaces || [], // Use item's reportInterfaces
          dataRelation: item.dataRelation || "-", // Use item's dataRelation
          node: item.node || [], // Use item's reportInterfaces
          status: item.ButtonActive,
          reportCompilerMappings: item.params.map((param) => ({
            header: param.header || "",
            dataSource: param.dataSource || "",
            param: param.param || "",
            isPivot: param.isPivot || false,
          })),
        })),
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      // Send the POST request
      const response = await axios.post(
        `${api}/admin/reportCompiler/edit`,
        body,
        {
          headers,
        }
      );
      console.log(response.data, "response from API");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setListingPageSuccess(true);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error saving Datasource data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const [dataRelationId, setDataRelationId] = useState("");
  const [dataRelationParamsId, setDataRelationParamsId] = useState("");

  const handlefetchData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        reportCompilers: selectedID.map((id) => ({ recordId: id })),
      };

      const response = await axios.post(
        `${api}/admin/reportCompiler/getedits`,
        body,
        { headers }
      );
      setlastmodifideBy(response.data.reportCompilers[0]?.lastModified || "");
      setmodifiedBy(response.data.reportCompilers[0]?.modifiedBy || "");
      setcreationTime(response.data.reportCompilers[0]?.creationTime || "");
      setcreator(response.data.reportCompilers[0]?.creator || "");

      if (response?.data?.reportCompilers) {
        const reportCompilers = response.data.reportCompilers.map((item) => ({
          ...item,
          ButtonActive: item.status || false,
          params: item.reportCompilerMappings || [],
        }));

        const dataRelationValue =
          response.data.reportCompilers[0]?.dataRelation || "";
        const dataRelationParamValue =
          response.data.reportCompilers[0]?.reportCompilerMappings[0]
            ?.dataSource || "";

        setDataRelationParamsId(dataRelationParamValue);
        setDataRelationId(dataRelationValue);
        seteditInputfields(reportCompilers);
        setLoading(false);

        // Fetch data sources immediately after fetching report compilers
        getDataSources(jwtToken, dataRelationValue);
      } else {
        setError("Error: Unexpected response structure");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching Datasource data");
    }
  };

  const getDataSources = async (jwtToken, dataRelation) => {
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        recordId: dataRelation,
      };

      const response = await axios.post(
        `${api}/admin/mapping/getDataSourcesByRelationId`,
        body,
        { headers }
      );

      setDatasourceData(response.data);
    } catch (error) {
      console.log("Error fetching dataSources data", error);
    }
  };

  const getDataSourcesParams = async (recordId) => {
    if (!recordId) return; // Exit if no recordId is provided

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = { recordId };

      const response = await axios.post(
        `${api}/admin/mapping/getDataSourceParamsById`,
        body,
        { headers }
      );

      setDatasourceDataParams(response.data); // Set the fetched parameters data
    } catch (error) {
      console.log("Error fetching dataSources params", error);
    }
  };

  const handleRunClick = () => {
    alert("Run function executed from EditReportCompiler!");
  };

  const pagename = "Edit";
  const breadscrums = "Admin > Compiler";
  const contentname = "Report Compiler";


  const handleAddParamClick = (index) => {
    const updatedFields = [...editInputfields];
    if (!updatedFields[index].params) {
      updatedFields[index].params = [];
    }

    updatedFields[index].params.push("");
    seteditInputfields(updatedFields);
  };

  const handleRemoveParamClick = (fieldIndex, paramIndex) => {
    const updatedFields = [...editInputfields];
    updatedFields[fieldIndex].params.splice(paramIndex, 1);
    seteditInputfields(updatedFields);
  };
  const toggleActiveButton = (index, buttonName) => {
    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        return { ...item, [buttonName]: !item[buttonName] }; // Toggle button state
      }
      return item;
    });

    seteditInputfields(updatedFields);
  };
  const toggleButtonState = (index, paramIndex, fieldName) => {
    seteditInputfields((prevFields) => {
      return prevFields.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            params: item.params.map((param, j) => {
              if (j === paramIndex) {
                return {
                  ...param,
                  [fieldName]: !param[fieldName], // Toggle the isPivot state
                };
              }
              return param;
            }),
          };
        }
        return item;
      });
    });
  };

  return (
    <AddNewPageButtons
      lastmodifideBy={lastmodifideBy}
      modifiedBy={modifiedBy}
      creator={creator}
      creationTime={creationTime}
      pagename={pagename}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handlePostClick}
      handleRunClick={handleRunClick}
    >
      {loading ? (
        <>
          <div className="flex flex-row justify-center items-center w-full h-40">
            <div className="gap-5 flex flex-col items-center justify-center">
              <CircularProgress size={36} color="inherit" />
              <div>Loading...</div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-2">
          {editInputfields.length < 1 ? (
            <div className="w-full flex flex-col  h-40 justify-center items-center">
              <div className="opacity-10 ">
                <Lottie options={defaultOptions} height={100} width={100} />
              </div>
              <div>No data data found...</div>
            </div>
          ) : (
            <div className="flex flex-col bg-gray-200 px-2 gap-3 rounded-md">
              {editInputfields.map((item, index) => (
                <div className="">
                  <Toaster />
                  <div
                    key={item.recordId}
                    className="bg-white flex flex-col p-4 rounded-md shadow-md"
                  >
                    <div className="grid grid-cols-3 gap-5 mb-4">
                      <TextField
                        label="Identifier"
                        variant="standard"
                        className="text-xs"
                        name="identifier"
                        value={item.identifier || ""}
                        onChange={(e) => handleInputChange(e, index)} // Pass index
                      />
                      <TextField
                        label="Short Description"
                        variant="standard"
                        className="text-xs"
                        name="shortDescription"
                        value={item.shortDescription || ""}
                        onChange={(e) => handleInputChange(e, index)} // Pass index
                      />
                      <NodeDropdown
                        initialload={initialload}
                        selectedNode={item.node || []} // Pass selected node
                        setSelectedNode={(newNode) => {
                          const updatedFields = editInputfields.map(
                            (field, i) => {
                              if (i === index) {
                                return { ...field, node: newNode }; // Update node data
                              }
                              return field;
                            }
                          );
                          seteditInputfields(updatedFields); // Update state
                        }}
                      />
                    </div>
                    <div className="flex flex-row gap-5 w-full justify-between">
                      <div className="w-full">
                        <DataRelation
                          initialload={initialload}
                          selectedDataRelation={item.dataRelation}
                          setSelectedDataRelation={(newNodes) => {
                            const updatedFields = editInputfields.map(
                              (field, i) => {
                                if (i === index) {
                                  return { ...field, dataRelation: newNodes }; // Update dataRelation
                                }
                                return field;
                              }
                            );
                            setSelectedDataRelation(newNodes?.recordId || null);
                            if (newNodes?.recordId) {
                              getDataSources(newNodes.recordId); // Fetch dataSources on dataRelation change
                            }
                            seteditInputfields(updatedFields); // Update state
                          }}
                        />
                      </div>
                      <div className="w-full mt-5">
                        <MultiSelectNode
                          initialload={initialload}
                          selectedNodes={item.reportInterfaces || []} // Pass the reportInterfaces array
                          setSelectedNodes={(newNodes) => {
                            const updatedFields = editInputfields.map(
                              (field, i) => {
                                if (i === index) {
                                  return {
                                    ...field,
                                    reportInterfaces: newNodes,
                                  }; // Update reportInterfaces
                                }
                                return field;
                              }
                            );
                            seteditInputfields(updatedFields); // Update state
                          }}
                        />
                      </div>
                      <div className="flex flex-row w-full items-end justify-end">
                        <div
                          onClick={() =>
                            toggleActiveButton(index, "ButtonActive")
                          }
                          className={`${
                            item.ButtonActive
                              ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                              : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                          } border-2 border-solid  rounded-md  text-xs px-2 h-6 py-0.5 w-[80px]`}
                        >
                          {item.ButtonActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-row gap-4 w-[100%] grid grid-cols-1">
                    {item.params &&
                      item.params.map((param, paramIndex) => (
                        <div
                          key={paramIndex}
                          className="items-center justify-between gap-5 grid grid-cols-5 w-[100%] p-2"
                        >
                          <TextField
                            className="mt-5"
                            placeholder="*Input the Report Header"
                            variant="standard"
                            size="small"
                            value={param.header || ""}
                            onChange={(e) =>
                              handleParamChange(
                                index,
                                paramIndex,
                                "header",
                                e.target.value
                              )
                            }
                          />
                          <Autocomplete
                            options={datasourceData || []}
                            getOptionLabel={(option) => option.identifier || ""}
                            value={
                              datasourceData.find(
                                (ds) => ds.recordId === param?.dataSource
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              handleParamChange(
                                index,
                                paramIndex,
                                "dataSource",
                                newValue?.recordId || ""
                              );
                              if (newValue?.recordId) {
                                getDataSourcesParams(newValue.recordId); // Fetch parameters immediately upon selecting a data source
                              } else {
                                setDatasourceDataParams([]); // Clear parameters if no data source is selected
                              }
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option?.recordId === value?.recordId
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Data Source"
                                variant="standard"
                              />
                            )}
                          />

                          <Autocomplete
                            options={datasourceDataParams || []}
                            getOptionLabel={(option) =>
                              typeof option === "string"
                                ? option
                                : option.label || option
                            }
                            value={
                              datasourceDataParams.find(
                                (opt) => String(opt) === String(param.param)
                              ) ||
                              param.param ||
                              null
                            }
                            onChange={(event, newValue) => {
                              handleParamChange(
                                index,
                                paramIndex,
                                "param",
                                newValue || ""
                              );
                            }}
                            isOptionEqualToValue={(option, value) =>
                              String(option) === String(value)
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Params"
                                variant="standard"
                              />
                            )}
                          />

                          <div className="flex flex-row gap-5 justify-center items-end">
                            <div
                              onClick={() =>
                                toggleButtonState(index, paramIndex, "isPivot")
                              }
                              className={`${
                                param.isPivot
                                  ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                                  : "bg-[#fff] text-center cursor-pointer text-gray-700"
                              } border-2 border-solid border-${
                                param.isPivot ? "#1581ed" : "gray-400"
                              } rounded-md text-xs px-2 py-0.5 w-[70px] h-[25px]`}
                            >
                              Pivot
                            </div>
                            <div
                              className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                              onClick={() =>
                                handleRemoveParamClick(index, paramIndex)
                              }
                              style={{ width: "30px", height: "30px" }}
                            >
                              <FaMinus />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div
                    className="flex items-center justify-center  p-2 rounded-md bg-black text-white text-center cursor-pointer"
                    onClick={() => handleAddParamClick(index)}
                    style={{ width: "100px", height: "40px" }}
                  >
                    Add Param
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <ListingpageSuccessModal
          contentname={contentname}
          isOpen={listingPageSuccess}
          setIsModalOpen={setListingPageSuccess}
        />
    </AddNewPageButtons>
  );
};

export default EditReportCompiler;
