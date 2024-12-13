"use client";
import React, { useEffect, useState } from "react";
import { FaMinus } from "react-icons/fa";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditDataRelation = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editInputfields, setEditInputfields] = useState([]);
  const [datasourceID, setDatasourceID] = useState("");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [params, setParams] = useState([
    { fetchInputFields: [], selectedNode: "" },
  ]);
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const dispatch = useDispatch();
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handleFetchData(jwtToken);
      // getfetchInputFields();
    }
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const handleAddParamClick = (index) => {
    const newFields = [...editInputfields];

    // Add a new param object to dataRelationParams
    newFields[index].dataRelationParams = [
      ...(newFields[index].dataRelationParams || []),
      { fetchInputFields: [], sourceKeyOne: "", dataSource: "" }, // New param
    ];

    setEditInputfields(newFields);
    console.log(newFields, "After Adding Param");
  };

  const [key, setKey] = useState(0);

  const forceRerender = () => setKey((prevKey) => prevKey + 1);

  const handleRemoveParamClick = (index, paramIndex) => {
    const newFields = [...editInputfields];
    newFields[index].dataRelationParams = newFields[
      index
    ].dataRelationParams.filter((_, i) => i !== paramIndex);

    setEditInputfields(newFields);
    forceRerender(); // Force a re-render to reflect changes
  };

  const handleParamChange = (index, paramIndex, selectedValue) => {
    const updatedFields = [...editInputfields];
    updatedFields[index].dataRelationParams[paramIndex].sourceKeyOne =
      selectedValue;

    setEditInputfields(updatedFields);
  };

  const getfetchInputFields = async (dataSourceId) => {
    console.log("getfetchInputFields triggered");

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = { recordId: dataSourceId };
      const response = await axios.post(
        `${api}/admin/dataRelation/getDatasourceParamsForId`,
        body,
        {
          headers,
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching params", error);
    }
  };

  // Handle input field change
  const handleInputChange = async (e, index, paramIndex = null) => {
    const { name, value } = e.target;
    const updatedFields = [...editInputfields];

    if (paramIndex !== null) {
      updatedFields[index].dataRelationParams[paramIndex] = {
        ...updatedFields[index].dataRelationParams[paramIndex],
        [name]: value,
      };

      // If the 'dataSource' is changed, fetch new params and update state
      if (name === "dataSource") {
        const fetchParamsResponse = await getfetchInputFields(value);

        updatedFields[index].dataRelationParams[paramIndex] = {
          ...updatedFields[index].dataRelationParams[paramIndex],
          dataSource: value,
          fetchInputFields: fetchParamsResponse.data.params || [],
          sourceKeyOne: "", // Clear sourceKeyOne on new dataSource change
        };
      }
    } else {
      updatedFields[index] = { ...updatedFields[index], [name]: value };
    }

    setEditInputfields(updatedFields);
  };

  const handleButtonClick = (index) => {
    const updatedFields = [...editInputfields];
    updatedFields[index].ButtonActive = !updatedFields[index].ButtonActive;
    setEditInputfields(updatedFields);
  };

  // Handle generator button toggle for each item
  const handleToggleGenerator = (index) => {
    const updatedFields = [...editInputfields];
    updatedFields[index] = {
      ...updatedFields[index],
      enableGenerator: !updatedFields[index].enableGenerator,
    };
    setEditInputfields(updatedFields);
  };

  const [errors, setErrors] = useState([]);

  const validateFields = () => {
    const newErrors = editInputfields.map((field) => ({
      identifier: !field.identifier ? "Identifier is required" : "",
      shortDescription: !field.shortDescription
        ? "Short description is required"
        : "",
    }));

    setErrors(newErrors);

    // If any field has an error, return false to stop submission
    return newErrors.every((err) => !err.identifier && !err.shortDescription);
  };

  const handlePostClick = async () => {
    if (!validateFields()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const body = {
        dataRelations: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
          enableGenerator: item.enableGenerator,
          status: item.ButtonActive,
          dataRelationParams: item.dataRelationParams
            .filter((param) => param.sourceKeyOne && param.dataSource) // Only valid params
            .map((param) => ({
              sourceKeyOne: param.sourceKeyOne,
              dataSource: param.dataSource,
            })),
        })),
      };

      console.log(body, "Filtered Request Body");

      const response = await axios.post(
        `${api}/admin/dataRelation/edit`,
        body,
        { headers }
      );
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

      console.log(response.data, "API Response");
    } catch (err) {
      setError("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  const [dataSourceList, setDataSourceList] = useState([]);

  const handleFetchData = async (jwtToken) => {
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        dataRelations: selectedID.map((id) => ({ recordId: id })),
      };

      // Fetching the data relations
      const response = await axios.post(
        `${api}/admin/dataRelation/getedits`,
        body,
        { headers }
      );
      setlastmodifideBy(response.data.dataRelations[0]?.lastModified || "");
      setmodifiedBy(response.data.dataRelations[0]?.modifiedBy || "");
      setcreationTime(response.data.dataRelations[0]?.creationTime || "");
      setcreator(response.data.dataRelations[0]?.creator || "");
      console.log(response.data.dataRelations, "API Response");

      // Fetching data sources
      const response2 = await axios.get(api + "/admin/datasource/get", {
        headers,
      });
      setDataSourceList(response2.data.dataSources); // Update the local node list state
      console.log(response2.data.dataSources);

      // Initialize buttonActive and enableGenerator for each item
      const dataWithDefaults = response.data.dataRelations.map((item) => ({
        ...item,
        ButtonActive: item.status || false,
        enableGenerator: item.enableGenerator || false,
        params: item.dataRelationParams || [],
      }));

      // getfetchInputFields(1729600311);

      setEditInputfields(dataWithDefaults);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const contentname = "DataRelation";


  return (
    <AddNewPageButtons
      lastmodifideBy={lastmodifideBy}
      modifiedBy={modifiedBy}
      creator={creator}
      creationTime={creationTime}
      email={email}
      pagename="Edit"
      breadscrums="Admin > DataRelation"
      handleSaveClick={handlePostClick}
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
              <Toaster />
              <div className="p-2">
                <div className="flex flex-col bg-gray-200 p-2 gap-3 rounded-md">
                  {editInputfields.map((item, index) => (
                    <div
                      key={item.recordId}
                      className="bg-white p-4 rounded-md shadow-md"
                    >
                      <div className="grid grid-cols-3 gap-5 mb-4">
                        <TextField
                          label="Identifier"
                          variant="standard"
                          name="identifier"
                          value={item.identifier || ""}
                          onChange={(e) => handleInputChange(e, index)}
                          error={!!errors[index]?.identifier} // Check if there's an error
                          helperText={errors[index]?.identifier} // Display error message
                        />

                        <TextField
                          label="Short Description"
                          variant="standard"
                          name="shortDescription"
                          value={item.shortDescription || ""}
                          onChange={(e) => handleInputChange(e, index)}
                          error={!!errors[index]?.shortDescription} // Check if there's an error
                          helperText={errors[index]?.shortDescription} // Display error message
                        />

                        <div className="flex flex-row gap-6 justify-end items-end">
                          {item.ButtonActive ? (
                            <div
                              onClick={() => handleButtonClick(index)}
                              className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px]"
                            >
                              Active
                            </div>
                          ) : (
                            <div
                              onClick={() => handleButtonClick(index)}
                              className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px]"
                            >
                              Inactive
                            </div>
                          )}

                          <div
                            onClick={() => handleToggleGenerator(index)}
                            className={`${
                              item.enableGenerator
                                ? "bg-blue-500 text-white"
                                : "bg-white text-blue-500"
                            } border-2 border-blue-500 rounded-md text-center cursor-pointer text-xs px-2 py-0.5 w-[80px]`}
                          >
                            Generator
                          </div>
                        </div>
                      </div>

                      {/* Render dataRelationParams */}
                      {item.dataRelationParams.map((param, paramIndex) => (
                        <div
                          key={paramIndex}
                          className="flex items-center gap-5 p-4 w-full"
                        >
                          <div className="flex flex-row w-[45%]">
                            <Autocomplete
                              className="text-xs w-full"
                              options={dataSourceList}
                              getOptionLabel={(option) =>
                                option.identifier || ""
                              }
                              value={
                                dataSourceList.find(
                                  (opt) => opt.recordId === param.dataSource
                                ) || null
                              }
                              onChange={(event, newValue) => {
                                const syntheticEvent = {
                                  target: {
                                    name: "dataSource",
                                    value: newValue ? newValue.recordId : "",
                                  },
                                };
                                handleInputChange(
                                  syntheticEvent,
                                  index,
                                  paramIndex
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select DataSource"
                                  variant="standard"
                                />
                              )}
                              isOptionEqualToValue={(option, value) =>
                                option.recordId === value.recordId
                              }
                            />
                          </div>
                          <div className="flex flex-row w-[45%]">
                            <Autocomplete
                              className="text-xs w-full"
                              options={param.fetchInputFields || []}
                              getOptionLabel={(option) => option || ""}
                              value={param.sourceKeyOne || null}
                              onChange={(event, newValue) =>
                                handleParamChange(
                                  index,
                                  paramIndex,
                                  newValue || ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Params"
                                  variant="standard"
                                />
                              )}
                            />
                          </div>
                          <div
                            className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white w-[30px]"
                            onClick={() =>
                              handleRemoveParamClick(index, paramIndex)
                            }
                          >
                            <FaMinus />
                          </div>
                        </div>
                      ))}

                      <div
                        className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[150px] h-[40px]"
                        onClick={() => handleAddParamClick(index)}
                      >
                        Add an input field
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

export default EditDataRelation;
