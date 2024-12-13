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
import NodeDropdown from "@/app/src/components/dropdown/Node";
import DataRelation from "@/app/src/components/dropdown/DataRelation";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditMapping = () => {
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handlefetchData(jwtToken);
      getDataSources(jwtToken);
      console.log("JWT Token retrieved:", jwtToken);
    } else {
      console.log("No token found");
    }
  }, [selectedID]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const [token, setToken] = useState("");
  const [params, setParams] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [editInputfields, setEditInputfields] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [initialload, setInitialLoad] = useState(true);
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [datasourceData, setDatasourceData] = useState([]);
  const [datasourceDataParams, setDatasourceDataParams] = useState([]);
  const [errors, setErrors] = useState({});
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
    getDataSourcesParams();
  }, []);

  const handleAddParamClick = (e, index) => {
    e.preventDefault();
    const updatedFields = editInputfields.map((field, i) => {
      if (i === index) {
        return {
          ...field,
          params: [
            ...field.params,
            { header: "", dataSource: "", param: "", isPivot: false },
          ],
        };
      }
      return field;
    });

    setEditInputfields(updatedFields);
  };

  const handleRemoveParamClick = (fieldIndex, paramIndex) => {
    setEditInputfields((prevFields) => {
      const updatedFields = prevFields.map((field, i) => {
        if (i === fieldIndex) {
          return {
            ...field,
            params: field.params.filter((_, pIndex) => pIndex !== paramIndex),
          };
        }
        return field;
      });
      return updatedFields;
    });
  };

  const handleParamChange = (fieldIndex, paramIndex, key, value) => {
    const updatedFields = [...editInputfields];
    const updatedParams = [...updatedFields[fieldIndex].params];
    updatedParams[paramIndex] = {
      ...updatedParams[paramIndex],
      [key]: value,
    };

    updatedFields[fieldIndex].params = updatedParams;
    setEditInputfields(updatedFields);
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        if (name === "parentNode") {
          return {
            ...item,
            parentNode: { ...item.parentNode, identifier: value },
          };
        }
        return { ...item, [name]: value };
      }
      return item;
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    setEditInputfields(updatedFields);
  };

  const validateForm = () => {
    let newErrors = {};
    let hasEmptySubsidiary = false;

    // Validate each field in editInputfields
    editInputfields.forEach((item, index) => {
      if (!item.identifier.trim()) {
        newErrors[`identifier-${index}`] = "Identifier is required.";
      }
      if (!item.shortDescription.trim()) {
        newErrors[`shortDescription-${index}`] = "Description is required.";
      }

      if (!item.subsidiaries || item.subsidiaries.length === 0) {
        toast.error(`Please select Subsidiary`);
        hasEmptySubsidiary = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !hasEmptySubsidiary;
  };

  const handleFormatChange = (format) => {
    setSelectedFormat(format);
  };

  const dispatch = useDispatch();
  const handlePostClick = async () => {
    if (!validateForm()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const body = {
        sourceTargetMappings: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "-",
          shortDescription: item.shortDescription || "-",
          node: item.node,
          dataRelation: item.dataRelation,
          status: item.ButtonActive,
          enableVariant: item.EnableVariant,
          enableToggle: item.EnableBundle,
          enableCurrentPage: item.EnableCurrentPage,
          enableCategory: item.EnableCategory,
          enableVoucher: item.EnableVoucher,
          subsidiaries: item.subsidiaries,
          sourceTargetParamMappings: item.params.map((param) => ({
            header: param.header || "",
            dataSource: param.dataSource || "",
            param: param.param || "",
            isPivot: param.isPivot || false,
          })),
        })),
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(`${api}/admin/mapping/edit`, body, {
        headers,
      });
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

      console.log(response.data, "response from API");
    } catch (err) {
      setError("Error saving Datasource data");
      console.error(err);
    }
  };

  useEffect(() => {
    console.log("Datasource data:", datasourceData);
  }, [datasourceData]);

  const handlefetchData = async (jwtToken) => {
    try {
      setLoading(true);
      if (!selectedID || selectedID.length === 0) {
        console.error("selectedID is empty");
        return;
      }

      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        sourceTargetMappings: selectedID.map((id) => ({ recordId: id })),
      };

      console.log("Sending request with body:", body);

      const response = await axios.post(`${api}/admin/mapping/getedits`, body, {
        headers,
      });
      console.log(response, "response from API");
      setlastmodifideBy(
        response.data.sourceTargetMappings[0]?.lastModified || ""
      );
      setmodifiedBy(response.data.sourceTargetMappings[0]?.modifiedBy || "");
      setcreationTime(
        response.data.sourceTargetMappings[0]?.creationTime || ""
      );
      setcreator(response.data.sourceTargetMappings[0]?.creator || "");
      if (response?.data?.sourceTargetMappings) {
        const sourceTargetMappings = response.data.sourceTargetMappings.map(
          (item) => ({
            ...item,
            ButtonActive: item.status || false,
            EnableVariant: item.enableVariant || false,
            EnableBundle: item.enableToggle || false,
            EnableCurrentPage: item.enableCurrentPage || false,
            EnableCategory: item.enableCategory || false,
            EnableVoucher: item.enableVoucher || false,
            params: item.sourceTargetParamMappings || [],
          })
        );

        const dataRelationValue =
          response.data.sourceTargetMappings[0]?.dataRelation || "";
        const dataRelationParamValue =
          response.data.sourceTargetMappings[0]?.sourceTargetParamMappings[0]
            ?.dataSource || "";

        console.log(dataRelationValue, "dataRelation from API");

        getDataSources(jwtToken, dataRelationValue);

        setEditInputfields(sourceTargetMappings);
        setLoading(false);
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
    alert("Run function executed from EditMapping!");
  };
  const pagename = "Edit";
  const breadscrums = "Admin > Mapping";
  const handleToggleButton = (index, fieldName) => {
    setEditInputfields((prevFields) => {
      return prevFields.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            [fieldName]: !item[fieldName],
          };
        }
        return item;
      });
    });
  };
  const handleToggleButtonActive = (index) => {
    setEditInputfields((prevFields) => {
      return prevFields.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            ButtonActive: !item.ButtonActive,
          };
        }
        return item;
      });
    });
  };
  const toggleButtonState = (index, paramIndex, fieldName) => {
    setEditInputfields((prevFields) => {
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

  const contentname = "Src & Trg Mapping";
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
        <>
          {editInputfields.length < 1 ? (
            <div className="w-full flex flex-col  h-40 justify-center items-center">
              <div className="opacity-35 ">
                <Lottie options={defaultOptions} height={100} width={100} />
              </div>
              <div>No data found...</div>
            </div>
          ) : (
            <>
              <div className="p-2">
                <div className="flex flex-col bg-gray-200 p-2 gap-3 rounded-md">
                  {editInputfields.map((item, index) => (
                    <div
                      key={item.recordId}
                      className="bg-white p-4 rounded-md shadow-md"
                    >
                      <Toaster />
                      <div className="grid grid-cols-4 gap-5 mb-4">
                        <TextField
                          label="Identifier"
                          variant="standard"
                          className="text-xs mt-1"
                          name="identifier"
                          value={item.identifier || ""}
                          onChange={(e) => handleInputChange(e, index)} // Pass index
                          error={!!errors[`identifier-${index}`]}
                          helperText={errors[`identifier-${index}`]}
                        />
                        <TextField
                          label="Short Description"
                          variant="standard"
                          className="text-xs mt-1"
                          name="shortDescription"
                          value={item.shortDescription || ""}
                          onChange={(e) => handleInputChange(e, index)} // Pass index
                          error={!!errors[`shortDescription-${index}`]}
                          helperText={errors[`shortDescription-${index}`]}
                        />
                        <MultiSelectSubsidiary
                          initialload={initialload}
                          setSelectedSubsidiary={(newNode) => {
                            const updatedFields = editInputfields.map(
                              (field, i) => {
                                if (i === index) {
                                  return { ...field, subsidiaries: newNode }; // Update node data
                                }
                                return field;
                              }
                            );
                            setEditInputfields(updatedFields); // Update state
                          }}
                          selectedSubsidiary={item.subsidiaries}
                        />

                        <NodeDropdown
                          initialload={initialload}
                          selectedNode={item.node} // Pass selected node
                          setSelectedNode={(newNode) => {
                            const updatedFields = editInputfields.map(
                              (field, i) => {
                                if (i === index) {
                                  return { ...field, node: newNode }; // Update node data
                                }
                                return field;
                              }
                            );
                            setEditInputfields(updatedFields); // Update state
                          }}
                        />
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
                            setEditInputfields(updatedFields); // Update state
                          }}
                        />
                      </div>
                      <div>
                        <div className=" gap-4 mb-4 items-center justify-center flex w-full flex-col">
                          <div className="flex flex-row gap-3 w-full justify-start">
                            <div className="flex gap-3 mt-4">
                              <div
                                onClick={() =>
                                  handleToggleButton(index, "EnableVoucher")
                                }
                                className={`${
                                  item.EnableVoucher
                                    ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                    : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                } border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[80px] animate__pulse`}
                              >
                                Voucher
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <div
                                onClick={() =>
                                  handleToggleButton(index, "EnableCategory")
                                }
                                className={`${
                                  item.EnableCategory
                                    ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                    : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                } border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[80px] animate__pulse`}
                              >
                                Category
                              </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                              <div
                                onClick={() =>
                                  handleToggleButton(index, "EnableCurrentPage")
                                }
                                className={`${
                                  item.EnableCurrentPage
                                    ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                    : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                } border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[100px] animate__pulse`}
                              >
                                Current Page
                              </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                              <div
                                onClick={() =>
                                  handleToggleButton(index, "EnableBundle")
                                }
                                className={`${
                                  item.EnableBundle
                                    ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                    : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                } border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[80px] animate__pulse`}
                              >
                                Bundle
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <div
                                onClick={() =>
                                  handleToggleButton(index, "EnableVariant")
                                }
                                className={`${
                                  item.EnableVariant
                                    ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                    : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                } border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[80px] animate__pulse`}
                              >
                                Variant
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 ">
                          <div className="flex flex-row gap-3 items-center w-full justify-end">
                            {item.ButtonActive === false ? (
                              <div
                                onClick={() => handleToggleButtonActive(index)}
                                className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                              >
                                InActive
                              </div>
                            ) : (
                              <div
                                onClick={() => handleToggleButtonActive(index)}
                                className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                              >
                                Active
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2 gap-2 flex flex-col">
                        <div className="flex flex-col mt-4 p-4 w-[100%]">
                          <div className="flex-row gap-4 w-[100%] grid grid-cols-1">
                            {item.params &&
                              item.params.map((param, paramIndex) =>
                                param ? (
                                  <div
                                    key={paramIndex}
                                    className="items-center justify-between gap-5 flex flex-row w-[100%] p-2"
                                  >
                                    <TextField
                                      className="mt-5 w-[25%]"
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
                                    <Autocomplete className="w-[25%]"
                                      options={datasourceData || []}
                                      getOptionLabel={(option) =>
                                        option.identifier || ""
                                      }
                                      value={
                                        datasourceData.find(
                                          (ds) =>
                                            ds.recordId === param?.dataSource
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
                                          getDataSourcesParams(
                                            newValue.recordId
                                          ); // Fetch parameters immediately upon selecting a data source
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

                                    <Autocomplete className="w-[25%]"
                                      options={datasourceDataParams || []}
                                      getOptionLabel={(option) =>
                                        typeof option === "string"
                                          ? option
                                          : option.label || option
                                      }
                                      value={
                                        datasourceDataParams.find(
                                          (opt) =>
                                            String(opt) === String(param.param)
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
                                          toggleButtonState(
                                            index,
                                            paramIndex,
                                            "isPivot"
                                          )
                                        }
                                        className={`${
                                          param.isPivot
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                                            : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                                        } border-2 border-solid border-${
                                          param.isPivot ? "#1581ed" : "gray-400"
                                        } rounded-md text-xs px-2 py-0.5 w-[70px] h-[25px]`}
                                      >
                                        Pivot
                                      </div>
                                      <div
                                        className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                                        onClick={() =>
                                          handleRemoveParamClick(
                                            index,
                                            paramIndex
                                          )
                                        }
                                        style={{
                                          width: "30px",
                                          height: "30px",
                                        }}
                                      >
                                        <FaMinus />
                                      </div>
                                    </div>
                                  </div>
                                ) : null
                              )}
                          </div>

                          <div
                            className="flex items-center justify-center  p-2 rounded-md bg-black text-white text-center cursor-pointer"
                            onClick={(e) => handleAddParamClick(e, index)}
                            style={{ width: "100px", height: "40px" }}
                          >
                            Add Param
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
       <ListingpageSuccessModal
          contentname={contentname}
          isOpen={listingPageSuccess}
          setIsModalOpen={setListingPageSuccess}
        />
    </AddNewPageButtons>
  );
};

export default EditMapping;
