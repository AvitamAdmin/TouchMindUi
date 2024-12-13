"use client";
import React, { useState, useEffect } from "react";
import { RxDragHandleDots2 } from "react-icons/rx";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { VscArrowSwap } from "react-icons/vsc";
import {
  Autocomplete,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  MenuItem,
  TextField,
} from "@mui/material";
import { FaMinus } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import toast, { Toaster } from "react-hot-toast";

const addTestcase = () => {
  const [SelectAction, setSelectAction] = useState(false);
  const [ButtonActive, setButtonActive] = useState(false);
  const [ButtonPublished, setButtonPublished] = useState(false);
  const [ButtonScreenshot, setButtonScreenshot] = useState(false);
  const [ButtonEppssocheck, setButtonEppssocheck] = useState(false);
  const [ActionGroupVisible, setActionGroupVisible] = useState(false);
  const [ActionGroupDropDown, setActionGroupDropDown] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [CreateAction, setCreateAction] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
  });

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      getNodesData(jwtToken);
      getLocators(jwtToken);
    }
  }, []);

  const [params, setParams] = useState([]);
  const handleAddParamClick = () => {
    // Fetch the data when adding a new param

    // Add a new param to the state
    setParams([
      ...params,
      {
        nodeList: "",
        selectedParameter: "",
        condition: "",
        paramValue: "",
        isOrChain: false,
      },
    ]);
  };

  const handleRemoveParamClick = (index) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };

  // Update individual param fields
  const handleParamChange = (index, field, value) => {
    console.log(value, "value value");
    const newParams = [...params];
    newParams[index][field] = value; // Ensure the value is updated in the correct index and field
    setParams(newParams);
    console.log(params, "params value");
  };
  const selectCondition = [
    { value: "Equals", label: "Equals" },
    { value: "Greater or equals", label: "Greater or equals" },
    { value: "Less than or equals", label: "Less than or equals" },
    { value: "Not null", label: "Not null" },
    { value: "Not empty", label: "Not empty" },
  ];
  const [conditions, setConditions] = useState([]);
  const [errors, setErrors] = useState({});
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Clear error when the user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const validateForm = () => {
    let newErrors = {};

    if (!formValues.identifier.trim()) {
      newErrors.identifier = "Identifier is required.";
    }
    if (!formValues.shortDescription.trim()) {
      newErrors.shortDescription = "Description is required.";
    }
    if (selectedSubsidiary.length === 0) {
      toast.error("Please select a subsidiary.");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };
  const handleSaveClick = async () => {
    if (!validateForm()) return; // Validate the form before proceeding
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const testLocators = inputs.map((input) => ({
        locatorId: input.locatorData,
        priority: input.priority,
        errorMsg: input.errMsg,
        enterKey: input.enterKey,
        waitForElementVisibleAndClickable:
          input.waitForElementVisibleAndClickable,
        checkIfElementPresentOnThePage: input.checkIfElementPresentOnThePage,
        checkIfIframe: input.checkIfIframe,
        isContextData: input.isContextData,
      }));
      const conditionGroupList = params.map((input) => ({
        toolkitId: input.nodeList,
        paramName: input.selectedParameter,
        condition: input.condition,
        paramValue: input.paramValue,
        isOrChain: input.isOrChain,
      }));
      const body = {
        testLocatorGroups: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            subsidiary: selectedSubsidiary,
            status: ButtonActive, // Use button active status (true or false)
            takeAScreenshot: ButtonScreenshot,
            checkEppSso: ButtonEppssocheck,
            published: ButtonPublished,
            testLocators: testLocators,
            conditionGroupList: conditionGroupList,
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(
        `${api}/admin/locatorGroup/edit`,
        body,
        { headers }
      );
      console.log(response.data, "response from api");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/locatorGroup");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }

      setTimeout(() => {
        router.push("/touchmind/admin/locatorGroup");
      }, 2000);
    } catch (err) {
      setError("Error fetching locatorGroup data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > locatorGroup";
  const pagename = "Add New";

  const handleE = () => {
    return setE(!E);
  };
  const handleW = () => {
    return setW(!W);
  };
  const handleP = () => {
    return setP(!P);
  };
  const handleI = () => {
    return setI(!I);
  };
  const handleR = () => {
    return setR(!R);
  };

  const handleselectAction = () => {
    setSelectAction(true);
  };

  const handleSelectActionGroup = () => {
    setActionGroupVisible(!ActionGroupVisible);
    setActionGroupDropDown(!ActionGroupDropDown);
  };

  const [inputs, setInputs] = useState([]);

  // Function to handle adding a new input field
  const handleAddInputFieldClick = () => {
    setInputs([
      ...inputs,
      {
        locatorData: "",
        priority: "",
        errMsg: "",
        enterKey: false,
        waitForElementVisibleAndClickable: false,
        checkIfElementPresentOnThePage: false,
        checkIfIframe: false,
        isContextData: false,
      },
    ]);
  };

  // Function to handle changes in the input fields
  const handleInputFieldChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  // Function to remove an input field
  const handleRemoveInputFieldClick = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  // Toggle individual button for a specific row
  const toggleButtonState = (index, buttonType) => {
    const newInputs = [...inputs];

    // Toggle only the specific button for this row
    newInputs[index][buttonType] = !newInputs[index][buttonType];

    setInputs(newInputs);
  };
  const toggleButtonStateparam = (index, buttonType) => {
    const newInputs = [...params];

    // Toggle only the specific button for this row
    newInputs[index][buttonType] = !newInputs[index][buttonType];

    setParams(newInputs);
  };
  const [locatorData, setLocatorData] = useState([]);
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

  const [nodeList, setNodeList] = useState([]);

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

  const [parameter, setParameter] = useState([]);
  const getParameterData = async (selectedRecordId) => {
    try {
      const headers = { Authorization: "Bearer " + token };

      console.log(selectedRecordId, "selectedDatasource from dataSources");

      const response = await axios.get(
        api +
          `/admin/locatorGroup/getMappingParamsForNodeId?nodeId=${selectedRecordId}`,
        { headers }
      );

      setParameter(response.data);
      console.log(response.data, "dataSources Params fetched");
    } catch (error) {
      console.log("Error fetching dataSources data", error);
    }
  };
  const handleDatasourceChange = async (index, value) => {
    const updatedParams = [...params];
    updatedParams[index].nodeList = value; // Update specific param's nodeList

    try {
      const headers = { Authorization: "Bearer " + token };

      // Fetch the parameters for the selected nodeId
      const response = await axios.get(
        api + `/admin/locatorGroup/getMappingParamsForNodeId?nodeId=${value}`,
        { headers }
      );

      // Store the fetched parameters directly into the `parameter` field for the respective index
      updatedParams[index].parameter = response.data;

      // Log the fetched parameters to ensure they are correct
      console.log(response.data, "Fetched Params");

      // Update the state with the modified params
      setParams(updatedParams);
    } catch (error) {
      console.error("Error fetching dataSources data", error);
    }
  };

  const [addnewpagebtn, setaddnewpagebtn] = useState(true);
  return (
    <AddNewPageButtons
      setshow={addnewpagebtn}
      pagename={pagename}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
    >
      <div
        className="flex flex-col w-full  min-h-screen  gap-3  bg-[#ebebeb] "
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />
        <div className="flex flex-col gap-7 w-full p-4 items-center ">
          <div className="flex flex-col w-[100%] bg-white rounded-lg p-3 gap-4 text-sm">
            <div className="flex flex-col gap-4 rounded-lg bg-white border-solid border-2 border-white w-full">
              <div className="flex-row justify-between grid grid-cols-3 gap-3">
                <TextField
                  id="standard-textarea"
                  label="Enter Identifier"
                  variant="standard"
                  className="mt-3"
                  name="identifier"
                  value={formValues.identifier}
                  onChange={handleInputChange}
                  error={!!errors.identifier} // Show error state
                  helperText={errors.identifier} // Display error message
                />
                <TextField
                  id="standard-textarea"
                  label="Enter Description"
                  className="mt-3"
                  variant="standard"
                  name="shortDescription"
                  value={formValues.shortDescription}
                  onChange={handleInputChange}
                  error={!!errors.shortDescription} // Show error state
                  helperText={errors.shortDescription} // Display error message
                />
                <div className="mt-4">
                  <SingleSelectSubsidiary
                    initialload={initialload}
                    selectedSubsidiary={selectedSubsidiary}
                    setSelectedSubsidiary={setSelectedSubsidiary}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row w-[100%] py-2 justify-end text-sm ">
              <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-row gap-3 items-center">
                  {ButtonPublished ? (
                    <div
                      onClick={() => setButtonPublished(!ButtonPublished)}
                      className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Published
                    </div>
                  ) : (
                    <div
                      onClick={() => setButtonPublished(!ButtonPublished)}
                      className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Unpublished
                    </div>
                  )}
                </div>
                <div className="flex flex-row gap-3 items-center">
                  {ButtonScreenshot ? (
                    <div
                      onClick={() => setButtonScreenshot(!ButtonScreenshot)}
                      className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Screenshot
                    </div>
                  ) : (
                    <div
                      onClick={() => setButtonScreenshot(!ButtonScreenshot)}
                      className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[100px] animate__animated  animate__pulse"
                    >
                      No Screenshot
                    </div>
                  )}
                </div>

                <div className="flex flex-row gap-3 items-center">
                  {ButtonEppssocheck ? (
                    <div
                      onClick={() => setButtonEppssocheck(!ButtonEppssocheck)}
                      className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[100px] animate__animated  animate__pulse"
                    >
                      Epp sso check
                    </div>
                  ) : (
                    <div
                      onClick={() => setButtonEppssocheck(!ButtonEppssocheck)}
                      className="bg-[#fff] border-2 border-solid border-gray-400 text-center  cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[100px] animate__animated  animate__pulse"
                    >
                      Epp sso check
                    </div>
                  )}
                </div>
                <div className="flex flex-row gap-3 items-center">
                  {ButtonActive ? (
                    <div
                      onClick={() => setButtonActive(!ButtonActive)}
                      className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Active
                    </div>
                  ) : (
                    <div
                      onClick={() => setButtonActive(!ButtonActive)}
                      className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Inactive
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 gap-2 flex flex-col w-full ">
          <div className="flex flex-col mt-4 w-[100%] ">
            <div className="flex flex-col gap-4 w-full">
              {params.map((param, index) => (
                <div
                  key={index}
                  className="flex items-center flex-col pb-3 gap-5 px-2 w-full bg-white p-1 rounded-md"
                >
                  <div className="flex flex-row w-full justify-between">
                    <div className="w-[30%] flex">
                      <Autocomplete
                        className="w-full"
                        options={nodeList || []} // Options populated from fetched data
                        getOptionLabel={(option) => option.identifier || ""} // Display 'identifier'
                        value={
                          nodeList.find(
                            (ds) => ds.recordId === param.nodeList
                          ) || null
                        } // Match value
                        onChange={(event, newValue) => {
                          handleParamChange(
                            index,
                            "nodeList",
                            newValue?.recordId || ""
                          );
                          if (newValue?.recordId) {
                            getParameterData(newValue.recordId); // Fetch data source params
                          }
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.recordId === value?.recordId
                        } // Equality check
                        loading={loading} // Display loading spinner
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Toolkits"
                            variant="standard"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loading ? (
                                    <CircularProgress size={20} />
                                  ) : null}
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
                        options={parameter || []} // Use the fetched parameters, default to an empty array if undefined
                        getOptionLabel={(option) => option} // Display the label from fetched parameters
                        value={param?.parameter?.find(
                          (item) => item.value === param.selectedParameter
                        )} // Safely check if param.parameter exists and find the selected item
                        onChange={(event, newValue) => {
                          handleParamChange(
                            index,
                            "selectedParameter",
                            newValue
                          );
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value?.value
                        } // Equality check
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
                        options={selectCondition} // List of all conditions
                        getOptionLabel={(option) => option.label} // Display 'label' for the dropdown options
                        value={
                          selectCondition.find(
                            (item) => item.value === param.condition
                          ) || null
                        } // Set the current value based on the condition
                        onChange={(event, newValue) => {
                          handleParamChange(
                            index,
                            "condition",
                            newValue?.value || ""
                          ); // Handle value change
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value?.value
                        } // Ensure proper matching of options
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            label="Select Condition"
                            error={param.condition === undefined} // Optionally show an error if the value is undefined
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
                          handleParamChange(index, "paramValue", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-row gap-5 justify-center items-center">
                      <div
                        onClick={() =>
                          toggleButtonStateparam(index, "isOrChain")
                        }
                        className={`${
                          param.isOrChain
                            ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                            : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                        } border-2 border-solid border-${
                          param.isOrChain ? "#1581ed" : "gray-400"
                        } rounded-md text-xs px-2 py-0.5 w-[80px] h-[25px]`}
                      >
                        isOrChain
                      </div>
                      <div
                        className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                        onClick={() => handleRemoveParamClick(index)}
                        style={{ width: "40px", height: "30px" }}
                      >
                        <FaMinus />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
              onClick={handleAddParamClick}
              style={{ width: "150px", height: "40px" }}
            >
              Add Condition
            </div>
          </div>
        </div>

        <div className="p-2 gap-2 flex flex-col">
          <div className="flex flex-col mt-4 w-[100%]">
            <div className="grid gap-3">
              {inputs.map((input, index) => (
                <div
                  key={index}
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
                            (ds) => ds.recordId === input.locatorData
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          handleInputFieldChange(
                            index,
                            "locatorData",
                            newValue?.recordId || ""
                          );
                        }}
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
                      <TextField
                        type="number"
                        placeholder="Enter the Priority"
                        variant="standard"
                        size="small"
                        value={input.value}
                        onChange={(e) =>
                          handleInputFieldChange(
                            index,
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
                        value={input.value}
                        onChange={(e) =>
                          handleInputFieldChange(
                            index,
                            "errMsg",
                            e.target.value
                          )
                        }
                        className="w-[30%] mt-5"
                      />
                    </div>
                    <div className="flex flex-row gap-3 w-full justify-between">
                      <div className="flex flex-row gap-5">
                        <div
                          onClick={() => toggleButtonState(index, "enterKey")}
                          className={`${
                            input.enterKey
                              ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                              : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                          } border-2 border-solid border-${
                            input.enterKey ? "#1581ed" : "gray-400"
                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                        >
                          Enter Key
                        </div>
                        <div
                          onClick={() =>
                            toggleButtonState(
                              index,
                              "waitForElementVisibleAndClickable"
                            )
                          }
                          className={`${
                            input.waitForElementVisibleAndClickable
                              ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                              : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                          } border-2 border-solid border-${
                            input.waitForElementVisibleAndClickable
                              ? "#1581ed"
                              : "gray-400"
                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                        >
                          ElementVisible
                        </div>
                        <div
                          onClick={() =>
                            toggleButtonState(
                              index,
                              "checkIfElementPresentOnThePage"
                            )
                          }
                          className={`${
                            input.checkIfElementPresentOnThePage
                              ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                              : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                          } border-2 border-solid border-${
                            input.checkIfElementPresentOnThePage
                              ? "#1581ed"
                              : "gray-400"
                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                        >
                          CheckIfElement
                        </div>

                        <div
                          onClick={() =>
                            toggleButtonState(index, "checkIfIframe")
                          }
                          className={`${
                            input.checkIfIframe
                              ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                              : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                          } border-2 border-solid border-${
                            input.checkIfIframe ? "#1581ed" : "gray-400"
                          } rounded-md text-xs px-2 py-0.5 w-[120px] h-[25px]`}
                        >
                          CheckIfIframe
                        </div>

                        <div
                          onClick={() =>
                            toggleButtonState(index, "isContextData")
                          }
                          className={`${
                            input.isContextData
                              ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                              : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                          } border-2 border-solid border-${
                            input.isContextData ? "#1581ed" : "gray-400"
                          } rounded-md text-xs  px-2 py-0.5 w-[120px] h-[25px]`}
                        >
                          Context
                        </div>
                      </div>
                      <div>
                        {" "}
                        <div
                          className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                          onClick={() => handleRemoveInputFieldClick(index)}
                          style={{ width: "50px", height: "30px" }}
                        >
                          <FaMinus />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
              onClick={handleAddInputFieldClick}
              style={{ width: "150px", height: "40px" }}
            >
              Add an input field
            </div>
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default addTestcase;
