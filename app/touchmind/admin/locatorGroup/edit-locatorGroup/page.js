"use client";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import RunButton from "@/app/src/components/AddNewPageButtons/RunButton";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import { TextFields } from "@mui/icons-material";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditLocatorGroup = () => {
  useEffect(() => {
    console.log("initial call");
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handlefetchData(jwtToken);
      getNodesData(jwtToken);
      getLocators(jwtToken);
      console.log("JWT Token retrieved:", jwtToken);
    } else {
      console.log("No token found");
    }
  }, []);
  
  const [token, setToken] = useState("");
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [nodeList, setNodeList] = useState([]);
  const [locatorData, setLocatorData] = useState([]);
  const [email, setEmail] = useState("");
  const [selectedFormat, setSelectedFormat] = useState(""); // For the file format dropdown
  const [editInputfields, seteditInputfields] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  const [lastmodifideBy, setlastmodifideBy] = useState(); 
  const [modifiedBy, setmodifiedBy] = useState();
const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };   

  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
    displayPriority: "",
    path: "",
    parentNode: "",
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
      
    }
  }, []);

  const handleAddParamClick = (e, index) => {
    const updatedFields = [...editInputfields];
    if (!updatedFields[index].params) {
      updatedFields[index].params = [];
    }

    updatedFields[index].params.push("");
    seteditInputfields(updatedFields);


  };
  const handleAddInputFieldClick = (index, e,) => {
    const updatedFields = [...editInputfields];

    if (!updatedFields[index].testLocators) {
      updatedFields[index].testLocators = [];
    }

    updatedFields[index].testLocators.push("");
    seteditInputfields(updatedFields);

  };

  const handleRemoveParamClick = (fieldIndex, paramIndex) => {
    const updatedFields = [...editInputfields];
    updatedFields[fieldIndex].params.splice(paramIndex, 1);
    seteditInputfields(updatedFields);
  };
  const handleRemoveInputFieldClick = (fieldIndex, inputIndex) => {
    const updatedFields = [...editInputfields];
    updatedFields[fieldIndex].testLocators.splice(inputIndex, 1);
    seteditInputfields(updatedFields);
  };
  const handleToggleButton = (index, inputIndex, field) => {
    // Update the input object within testLocators by toggling the specific field
    seteditInputfields((prevItems) =>
      prevItems.map((item, idx) =>
        idx === index
          ? {
              ...item,
              testLocators: item.testLocators.map((locator, locIdx) =>
                locIdx === inputIndex
                  ? { ...locator, [field]: !locator[field] }
                  : locator
              ),
            }
          : item
      )
    );
  };
  const toggleButtonStateparam = (index, inputIndex, field) => {
    // Update the input object within testLocators by toggling the specific field
    seteditInputfields((prevItems) =>
      prevItems.map((item, idx) =>
        idx === index
          ? {
              ...item,
              params: item.params.map((locator, locIdx) =>
                locIdx === inputIndex
                  ? { ...locator, [field]: !locator[field] }
                  : locator
              ),
            }
          : item
      )
    );
  };
  
  
  

  // Handle change for form inputs
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        if (name === "subsidiary") {
          return {
            ...item,
            subsidiary: { ...item.subsidiary, identifier: value }, // Only update the identifier field of parentNode
          };
        }
        return { ...item, [name]: value }; // Update other fields normally
      }
      return item;
    });

    seteditInputfields(updatedFields); // Update the state with modified fields
  };


  const handleFormatChange = (format) => {
    setSelectedFormat(format); // Capture the file format
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
  const handleDatasourceChange = async (e, index, paramIndex = null) => {
    const { name, value } = e.target;
    const updatedFields = [...editInputfields];
  
    if (paramIndex !== null) {
      updatedFields[index].params[paramIndex] = {
        ...updatedFields[index].params[paramIndex],
        [name]: value,
      };
  
      // If the 'dataSource' is changed, fetch new params and update state
      if (name === "toolkitId") {
        const fetchParamsResponse = await getfetchInputFields(value);
  
        updatedFields[index].params[paramIndex] = {
          ...updatedFields[index].params[paramIndex],
          toolkitId: value,
          fetchInputFields: fetchParamsResponse.data || [],
          paramName: "", // Clear sourceKeyOne on new dataSource change
        };
      }
    } else {
      updatedFields[index] = { ...updatedFields[index], [name]: value };
    }
  
    seteditInputfields(updatedFields);
  };
  const getfetchInputFields = async (selectedRecordId) => {
    console.log("getfetchInputFields triggered");

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(
        api +
          `/admin/locatorGroup/getMappingParamsForNodeId?nodeId=${selectedRecordId}`,
        {
          headers,
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching params", error);
    }
  };
  const handleInputFieldChange = (fieldIndex, paramIndex, key, value) => {
    const updatedFields = [...editInputfields];
    const updatedParams = [...updatedFields[fieldIndex].testLocators];
    updatedParams[paramIndex] = {
      ...updatedParams[paramIndex],
      [key]: value,
    };

    updatedFields[fieldIndex].testLocators = updatedParams;
    seteditInputfields(updatedFields);
  };

  const dispatch = useDispatch();
  const [errors, setErrors] = useState([]);

  const validateFields = () => {
    let hasEmptySubsidiary = false;
  
    const newErrors = editInputfields.map((field) => {
      const errors = {
        identifier: !field.identifier ? "Identifier is required" : "",
        shortDescription: !field.shortDescription ? "Short description is required" : "",
      };
  
      // Check if 'subsidiary' field is empty
      if (!field.subsidiary || field.subsidiary.length === 0) {
        toast.error("Please select subsidiary"); // Display toast error
        hasEmptySubsidiary = true; // Mark if any subsidiary field is invalid
      }
  
      return errors;
    });
  
    setErrors(newErrors);
  
    // If any field has an error or subsidiary is missing, return false
    const isValid = newErrors.every(
      (err) => !err.identifier && !err.shortDescription
    );
  
    return isValid && !hasEmptySubsidiary; // Ensure both conditions are met
  };
  
  
  const handlePostClick = async () => {
    if (!validateFields()) return; 
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Construct the request body
      
      const body = {
        testLocatorGroups: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
          subsidiary: item.subsidiary || "",
          status: item.ButtonActive,
          checkEppSso: item.ButtonEppssocheck,
          takeAScreenshot: item.ButtonScreenshot,
          published: item.ButtonPublished,
          testLocators:  item.testLocators.map((input) => ({
            locatorId: input.locatorId,
            priority: input.priority,
            errorMsg: input.errorMsg,
            enterKey: input.enterKey,
            waitForElementVisibleAndClickable:
              input.waitForElementVisibleAndClickable,
            checkIfElementPresentOnThePage: input.checkIfElementPresentOnThePage,
            checkIfIframe: input.checkIfIframe,
            isContextData: input.isContextData,
          })),
          conditionGroupList: item.params.map((input) => ({
            toolkitId: input.toolkitId,
            paramName: input.paramName,
            condition: input.condition,
            paramValue: input.paramValue,
            isOrChain: input.isOrChain,
          })),
        })),
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      // Send the POST request
      const response = await axios.post(`${api}/admin/locatorGroup/edit`, body, { headers });
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
    } finally {
      setLoading(false);
    }
  };


  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

  const handlefetchData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        testLocatorGroups: selectedID.map((id) => ({ recordId: id })),
      };

      // Make the POST request
      const response = await axios.post(
        `${api}/admin/locatorGroup/getedits`,
        body,
        {
          headers,
        }
      );
      setLoading(false);
      setlastmodifideBy(response.data.testLocatorGroups[0]?.lastModified || "");
      setmodifiedBy(response.data.testLocatorGroups[0]?.modifiedBy || "");
 setcreationTime(response.data.testLocatorGroups[0]?.creationTime || "");
      setcreator(response.data.testLocatorGroups[0]?.creator || "");
      // Process the testLocatorGroups data
      const testLocatorGroups = response.data.testLocatorGroups.map((item) => ({
        ...item,
        ButtonActive: item.status || false,
        ButtonEppssocheck: item.checkEppSso || false,
        ButtonScreenshot: item.takeAScreenshot || false,
        ButtonPublished: item.published || false,
        params: item.conditionGroupList || [],
        conditionGroupList: item.conditionGroupList.map((input) => ({
          ...input,
          isOrChain: item.isOrChain === "true",

          testLocators: item.testLocators.map((input) => ({
            ...input,
            checkIfElementPresentOnThePage: item.checkIfElementPresentOnThePage === "true",
            checkIfIframe: item.checkIfIframe === "true",
            enterKey: item.enterKey === "true",
            waitBeforeUrl: item.waitBeforeUrl === "true",
          })),
        })),
      }));

      seteditInputfields(testLocatorGroups);

      console.log(combinedData, "response from API");
    } catch (err) {
      setError("Error fetching Datasource data");
    } finally {
      setLoading(false);
    }
  };

  const getNodesData = async (jwtToken) => {
    try {
      const headers = { Authorization: "Bearer " + jwtToken };
      const response = await axios.get(api + "/admin/interface/get", {
        headers,
      });
      setNodeList(response.data.nodes || []); // Set nodeList data
      console.log(response.data.nodes, "response.data.nodes Params fetched");
    } catch (error) {
      console.log(error, "Error fetching nodes");
    }
  };
  const selectCondition = [
    { value: "Equals", label: "Equals" },
    { value: "Greater or equals", label: "Greater or equals" },
    { value: "Less than or equals", label: "Less than or equals" },
    { value: "Not null", label: "Not null" },
    { value: "Not empty", label: "Not empty" },
  ];

  const getLocators = async (jwtToken) => {
    try {
      const headers = { Authorization: "Bearer " + jwtToken };
      const response = await axios.get(api + "/admin/locator/get", {
        headers,
      });
      setLocatorData(response.data.testLocators);
      console.log(response.data.testLocators, "testLocators fetched");
    } catch (error) {
      console.log(error, "error fetching subsidiaries");
    }
  };

  const handleRunClick = () => {
    alert("Run function executed from EditLocatorGroup!");
  };

  const pagename = "Edit";
  const breadscrums = "Admin > LocatorGroup";
  const contentname = "LocatorGroup";

  const toggleButtonState = (index, buttonName) => {
    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        return { ...item, [buttonName]: !item[buttonName] }; // Toggle button state
      }
      return item;
    });

    seteditInputfields(updatedFields);
  };

  return (
    <RunButton
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
      {
        loading ? (<>
          <div className="flex flex-row justify-center items-center w-full h-40">
            <div className="gap-5 flex flex-col items-center justify-center">
              <CircularProgress size={36} color="inherit" />
              <div>Loading...</div>
            </div>
          </div></>) : (<>
            {
              editInputfields.length < 1 ? (
                <div className="w-full flex flex-col  h-40 justify-center items-center">
                  <div className="opacity-5 ">
                    <Lottie options={defaultOptions} height={100} width={100} />
                  </div>
                  <div>No data found...</div>
                </div>
              ) : (<>

                <div className="p-2">
                  <Toaster />
                  <div className="flex flex-col bg-gray-200 p-2 gap-3 rounded-md">
                    {editInputfields.map((item, index) => (
                      <div key={item.recordId} className="bg-white p-4 rounded-md shadow-md">
                        <div className="flex flex-col w-[100%] bg-white rounded-lg p-3 gap-4 text-sm">
                          <div className="flex flex-col gap-4 rounded-lg bg-white border-solid border-2 border-white w-full">
                            <div className="flex-row justify-between grid grid-cols-3 gap-3">
                              <TextField
                                id="standard-textarea"
                                label="Enter Identifier"
                                                                
                                variant="standard"
                                className="mt-3"
                                name="identifier"
                                value={item.identifier}
                                onChange={(e) => handleInputChange(e, index)}
                                error={!!errors[index]?.identifier} // Check if there's an error
                                helperText={errors[index]?.identifier}
                              />
                              <TextField
                                id="standard-textarea"
                                label="Enter Description"
                                                                
                                variant="standard"
                                className="mt-3"
                                name="shortDescription"
                                value={item.shortDescription}
                                onChange={(e) => handleInputChange(e, index)}
                                error={!!errors[index]?.shortDescription} // Check if there's an error
  helperText={errors[index]?.shortDescription} // Display error message
                              />
                              <div className="mt-3.5">
                                <SingleSelectSubsidiary
                                  initialload={initialload}
                                  selectedSubsidiary={item.subsidiary}
                                  setSelectedSubsidiary={(newSubsidiary) => {
                                    // Update the specific item's subsidiary value in editInputfields
                                    const updatedFields = [...editInputfields];
                                    updatedFields[index] = {
                                      ...item,
                                      subsidiary: newSubsidiary, // Update this to reflect the new value
                                    };
                                    seteditInputfields(updatedFields);
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row w-[100%] py-2 justify-end text-sm ">


                            <div className="grid grid-cols-4 gap-3 justify-end">
                              <div className="flex flex-row gap-3 items-center">
                                <div
                                  onClick={() => toggleButtonState(index, 'ButtonPublished')}
                                  className={`${item.ButtonPublished ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]" : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                    } border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[90px]`}
                                >
                                  {item.ButtonPublished ? "Published" : "Unpublished"}
                                </div>
                              </div>

                              <div className="flex flex-row gap-3 items-center">
                                <div
                                  onClick={() => toggleButtonState(index, 'ButtonScreenshot')}
                                  className={`${item.ButtonScreenshot ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]" : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                    } border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[100px]`}
                                >
                                  {item.ButtonScreenshot ? "Screenshot" : "No Screenshot"}
                                </div>
                              </div>

                              <div className="flex flex-row gap-3 items-center">
                                <div
                                  onClick={() => toggleButtonState(index, 'ButtonEppssocheck')}
                                  className={`${item.ButtonEppssocheck ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]" : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                    } border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[100px]`}
                                >
                                  Epp sso check
                                </div>
                              </div>

                              <div className="flex flex-row gap-3 items-center">
                                <div
                                  onClick={() => toggleButtonState(index, 'ButtonActive')}
                                  className={`${item.ButtonActive ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]" : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                                    } border-2 border-solid  rounded-md  text-xs px-2 py-0.5 w-[80px]`}
                                >
                                  {item.ButtonActive ? "Active" : "Inactive"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col mt-3 gap-5 w-full">

                          {item.params &&
                            item.params.map((param, paramIndex) => (
                              <div
                                key={paramIndex}
                                className=" items-center gap-5 w-[100%] bg-white grid grid-cols-1 p-1 rounded-md"
                              >
                                <div className="flex flex-row w-full justify-between">
                                  <div className="w-[30%] flex">
                                    <Autocomplete
                                      className="w-full"
                                      options={nodeList || []}
                                      getOptionLabel={(option) => option.identifier || ""}
                                      value={nodeList.find((ds) => ds.recordId === param.toolkitId) || null}
                                      onChange={(event, newValue) => {
                                        const syntheticEvent = {
                                          target: {
                                            name: "toolkitId",
                                            value: newValue ? newValue.recordId : "",
                                          },
                                        };
                                        handleParamChange(index,paramIndex, "toolkitId", newValue?.recordId || "");
                                        handleDatasourceChange(syntheticEvent, index, paramIndex);
                                      }}
                                      isOptionEqualToValue={(option, value) => option.recordId === value?.recordId}
                                      // onOpen={() => {
                                      //   if (nodeList.length === 0) {
                                      //     getNodesData();
                                      //   }
                                      // }}
                                      loading={loading}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Select Toolkits"
                                          variant="standard"
                                          InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                              <>
                                                {loading ? <CircularProgress size={20} /> : null} 
                                                {params.InputProps.endAdornment}
                                              </>
                                            ),
                                          }}
                                        />
                                      )}
                                    />
                                  </div>
                                  <div className="w-[30%] flex">
                                    <Autocomplete
                                      className="w-full"
                                      options={param.fetchInputFields || []} 
                                      getOptionLabel={(option) => option || ""}
                                      // value={
                                      //   param?.parameter?.find((item) => item.value === param.paramName)
                                      // } 
                                      value={param.paramName || null}
                                      onChange={(event, newValue) => {
                                        handleParamChange(index,paramIndex, "paramName", newValue); 
                                      }}
                                      // isOptionEqualToValue={(option, value) =>
                                      //   option.value === value?.value
                                      // }
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Select Parameter"
                                          variant="standard"
                                        />
                                      )}
                                    />
                                  </div>
                                  <div className="w-[30%] flex">
                                    <Autocomplete
                                      className="w-full"
                                      size="small"
                                      options={selectCondition} 
                                      getOptionLabel={(option) => option.label} 
                                      value={
                                        selectCondition.find(
                                          (item) => item.value === param.condition
                                        ) || null
                                      } 
                                      onChange={(event, newValue) => {
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "condition",
                                          newValue?.value || ""
                                        ); 
                                      }}
                                      isOptionEqualToValue={(option, value) =>
                                        option.value === value?.value
                                      } 
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          variant="standard"
                                          label="Select Condition"
                                          error={param.condition === undefined} 
                                        />
                                      )}
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-row w-full justify-between">
                                  <div className="w-[30%] flex">
                                    <TextField
                                      placeholder="Enter Param Here"
                                      variant="standard"
                                      size="small"
                                      value={param.paramValue}
                                      onChange={(e) =>
                                        handleParamChange(index,paramIndex, "paramValue", e.target.value)
                                      }
                                      className="w-full"
                                    />
                                  </div>
                                  <div className="flex flex-row gap-5 justify-center items-center">
                                    <div
                                      onClick={() => toggleButtonStateparam(index, paramIndex,"isOrChain")}
                                      className={`${param.isOrChain
                                          ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                                          : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                                        } border-2 border-solid border-${param.isOrChain ? "#1581ed" : "gray-400"
                                        } rounded-md text-xs px-2 py-0.5 w-[80px] h-[25px]`}
                                    >
                                      isOrChain
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
                              </div>
                            ))}

                          <div className="">
                            <div
                              className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
                              onClick={(e) => handleAddParamClick(e, index)}
                              style={{ width: "150px", height: "40px" }}
                            >
                              Add Condition
                            </div>
                          </div>

                        </div>

                        <div className=" gap-2 mt-4 flex flex-col rounded-md">
                          {item.testLocators &&
                            item.testLocators.length > 0 ? (
                            item.testLocators.map((input, inputIndex) => (
                              <div
                                key={inputIndex}
                                className="flex flex-row justify-between w-full bg-white p-2 rounded-md items-center"
                              >
                                <div className="flex items-start flex-col gap-5 w-[100%]">
                                  <div className="flex items-center gap-2 w-full justify-between">
                                    <Autocomplete
                                      className="w-[30%]"
                                      options={locatorData || []}
                                      getOptionLabel={(option) => option.identifier || ""}
                                      value={
                                        locatorData.find(
                                          (ds) => ds.recordId === input.locatorId
                                        ) || null
                                      }
                                      onChange={(event, newValue) => {
                                        handleInputFieldChange(
                                          index,
                                          inputIndex,
                                          "locatorId",
                                          newValue?.recordId || ""
                                        );
                                      }}
                                      // onOpen={() => {
                                      //   if (locatorData.length === 0) {
                                      //     getLocators();
                                      //   }
                                      // }}
                                      loading={loading}
                                      isOptionEqualToValue={(option, value) =>
                                        option.recordId === value?.recordId
                                      }
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Select locatorData"
                                          variant="standard"
                                          InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                              <>
                                                {loading ? <span>Loading...</span> : null}
                                                {params.InputProps.endAdornment}
                                              </>
                                            ),
                                          }}
                                        />
                                      )}
                                    />
                                    <TextField type="number"
                                      placeholder="Enter the Priority"
                                      variant="standard"
                                      size="small"
                                      value={input.priority}
                                      onChange={(e) =>
                                        handleInputFieldChange(
                                          index,
                                          inputIndex,
                                          "priority",
                                          e.target.value
                                        )
                                      }
                                      className="w-[30%] mt-5"
                                    />

                                    <TextField
                                      placeholder="Error Message"
                                      variant="standard"
                                      size="small"
                                      value={input.errorMsg}
                                      onChange={(e) =>
                                        handleInputFieldChange(
                                          index,
                                          inputIndex,
                                          "errorMsg",
                                          e.target.value
                                        )
                                      }
                                      className="w-[30%] mt-5"
                                    />
                                  </div>
                                  <div className="flex flex-row gap-3 w-full justify-between">
                                    <div className="flex flex-row gap-5">
                                      <div
                                        onClick={() => handleToggleButton(index,inputIndex, "enterKey")}
                                        className={`${input.enterKey
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                                            : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                                          } border-2 border-solid border-${input.enterKey ? "#1581ed" : "gray-400"
                                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                                      >
                                        Enter Key
                                      </div>
                                      <div
                                        onClick={() =>
                                          handleToggleButton(
                                            index,
                                            inputIndex,
                                            "waitForElementVisibleAndClickable"
                                          )
                                        }
                                        className={`${input.waitForElementVisibleAndClickable
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                                            : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                                          } border-2 border-solid border-${input.waitForElementVisibleAndClickable
                                            ? "#1581ed"
                                            : "gray-400"
                                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                                      >
                                        ElementVisible
                                      </div>
                                      <div
                                        onClick={() =>
                                          handleToggleButton(
                                            index,
                                            inputIndex,
                                            "checkIfElementPresentOnThePage"
                                          )
                                        }
                                        className={`${input.checkIfElementPresentOnThePage
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                                            : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                                          } border-2 border-solid border-${input.checkIfElementPresentOnThePage
                                            ? "#1581ed"
                                            : "gray-400"
                                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                                      >
                                        CheckIfElement
                                      </div>

                                      <div
                                        onClick={() =>
                                          handleToggleButton(index,inputIndex, "checkIfIframe")
                                        }
                                        className={`${input.checkIfIframe
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                                            : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                                          } border-2 border-solid border-${input.checkIfIframe ? "#1581ed" : "gray-400"
                                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                                      >
                                        CheckIfIframe
                                      </div>

                                      <div
                                        onClick={() =>
                                          handleToggleButton(index,inputIndex, "isContextData")
                                        }
                                        className={`${input.isContextData
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                                            : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                                          } border-2 border-solid border-${input.isContextData ? "#1581ed" : "gray-400"
                                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                                      >
                                        Context
                                      </div>
                                    </div>
                                    <div>
                                      {" "}
                                      <div
                                        className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                                        onClick={() => handleRemoveInputFieldClick(index,inputIndex)}
                                        style={{ width: "50px", height: "30px" }}
                                      >
                                        <FaMinus />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div>No Data Source Inputs Available</div>
                          )}

                          <div className="w-[100%]">
                            <div
                              className="flex items-center justify-center p-2 rounded-md bg-black text-white text-center cursor-pointer"
                              onClick={() => handleAddInputFieldClick(index)}
                              style={{ width: "150px", height: "40px" }}
                            >
                              Add Input Field
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

              </>)
            }
          </>)
      }
      <ListingpageSuccessModal
          contentname={contentname}
          isOpen={listingPageSuccess}
          setIsModalOpen={setListingPageSuccess}
        />
    </RunButton>
  );
};

export default EditLocatorGroup;
