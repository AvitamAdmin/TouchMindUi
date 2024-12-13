"use client";
import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import { FaMinus } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const AddEnvironment = () => {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [ButtonActive, setButtonActive] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  useEffect(() => {
    const storedEmail = localStorage.getItem('username');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleAddParamClick = () => {
    setParams((prevParams) => [
      ...prevParams,
      {
        url: '',
        loginName: '',
        loginPassword: '',
        loginNameUiSelector: '',
        loginPasswordSelector: '',
        actionElement: '',
        shortDescription: '',
        afterUrl: false,
        beforeUrl: false,
        afterClick: false,
        beforeClick: false,
      },
    ]);
  };
 

  const handleRemoveParamClick = (index) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };
  const handleInputFieldChange = (index, fieldName, value) => {
    setParams((prevParams) => {
      const updatedParams = [...prevParams];
      updatedParams[index] = {
        ...updatedParams[index],
        [fieldName]: value,
      };
      return updatedParams;
    });
  };
  const toggleButtonState = (index, buttonType) => {
    const newInputs = [...params];
    
    // Toggle only the specific button for this row
    newInputs[index][buttonType] = !newInputs[index][buttonType];
    
    setParams(newInputs);
  };


  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
  });
  
  const [errors, setErrors] = useState({}); // Track field errors
  const { identifier, shortDescription } = formValues;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  
    // Clear error when the input is corrected
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };
  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
    }
  }, []);





  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    setParams(newParams);
  };

  const handleSaveClick = async () => {
    const newErrors = {};
  
    // Validate fields
    if (!identifier.trim()) newErrors.identifier = "Identifier is mandatory";
    if (!shortDescription.trim()) newErrors.shortDescription = "Description is mandatory";
    if (selectedSubsidiary.length === 0) {
      toast.error("Select at least one subsidiary");
    }
  
    // Set errors if any
    setErrors(newErrors);
  
    // If there are errors, stop execution
    if (Object.keys(newErrors).length > 0) return;
  
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const configs = params.map((input) => ({
        url: input.url,
        loginName: input.loginName,
        loginPassword: input.loginPassword,
        loginNameUiSelector: input.loginNameUiSelector,
        loginPasswordSelector: input.loginPasswordSelector,
        actionElement: input.actionElement,
        shortDescription: input.shortDescription,
        waitAfterUrl: input.afterUrl,
        waitBeforeUrl: input.beforeUrl,
        waitAfterClick: input.afterClick,
        waitBeforeClick: input.beforeClick,
      }));
  
      const body = {
        environments: [
          {
            identifier: identifier,
            shortDescription: shortDescription,
            subsidiaries: selectedSubsidiary,
            status: ButtonActive,
            configs: configs,
          },
        ],
      };
  
      console.log(body, "Request body");
      const response = await axios.post(`${api}/admin/environment/edit`, body, { headers });
      console.log(response.data, "API response");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/environment");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error fetching environment data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > environment";
  const pagename = "Add New";

 
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
        className="flex flex-col w-full p-4 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />
        <div className="flex flex-col bg-gray-200  rounded-md shadow">
          <div className="bg-white p-4 rounded-md shadow-md">
          <div className="grid grid-cols-3 gap-3 mb-4 items-center justify-center flex-col">
  <TextField
    label="Enter Identifier"
    variant="standard"
    fullWidth
    className="mt-3"
    name="identifier"
    value={formValues.identifier}
    onChange={handleInputChange}
    error={!!errors.identifier} // Display error state
    helperText={errors.identifier} // Show error message
  />

  <TextField
    label="Enter Description"
    variant="standard"
    fullWidth
    className="mt-3"
    name="shortDescription"
    value={formValues.shortDescription}
    onChange={handleInputChange}
    error={!!errors.shortDescription} // Display error state
    helperText={errors.shortDescription} // Show error message
  />

<div className="mt-4">
    <MultiSelectSubsidiary
      initialload={initialload}
      selectedSubsidiary={selectedSubsidiary}
      setSelectedSubsidiary={setSelectedSubsidiary}
    />
    {errors.selectedSubsidiary && (
      <span className="text-red-500 mt-1">{errors.selectedSubsidiary}</span> // Show error message
    )}
  </div>
</div>


            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-3 items-center w-full justify-end">
              {ButtonActive ? (
                  <div
                    onClick={() => setButtonActive(!ButtonActive)}
                    className="bg-[#1581ed]   border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                  >
                   Active
                  </div>
                ) : (
                  <div
                    onClick={() => setButtonActive(!ButtonActive)}
                    className="bg-[#fff] border-2 border-solid border-[#1581ed] rounded-md text-gray-500 text-xs text-center cursor-pointer px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                  >
                      Inactive
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4  w-[100%]">
      <div className="flex-row gap-4 w-[100%] grid grid-cols-1">
        {params.map((param, index) => (
          <div
            key={index}
            className="items-center justify-between bg-white rounded-md gap-5 flex flex-row w-[100%] p-2"
          >
           <div className="flex flex-col w-[95%] gap-5">
           <div className="flex flex-row w-full gap-5">
            <div className="flex flex-col gap-5 w-[33%] p-2 bg-gray-100 rounded-md">
           <div className="w-full">
           <TextField
              className="mt-2 w-full"
              placeholder="Enter the Enviroment Url"
              variant="standard"
              size="small"
              value={param.url}
              onChange={(e) => handleInputFieldChange(index, "url", e.target.value)}
            />
           </div>
           <div className="w-full flex flex-row justify-between items-center">
           <div
                onClick={() => toggleButtonState(index, "beforeUrl")}
                className={`${
                  param.beforeUrl ? "bg-[#1581ed] text-center cursor-pointer  text-white" : "bg-[#fff] text-center cursor-pointer text-gray-700"
                } border-2 border-solid border-${param.beforeUrl ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[80px] h-[25px]`}
              >
                Before Url
              </div>
              <div
                onClick={() => toggleButtonState(index, "afterUrl")}
                className={`${
                  param.afterUrl ? "bg-[#1581ed] text-center cursor-pointer  text-white" : "bg-[#fff] text-center cursor-pointer text-gray-700"
                } border-2 border-solid border-${param.afterUrl ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[80px] h-[25px]`}
              >
                After Url
              </div>
           </div>
            </div>

            <div className="flex flex-col gap-5 w-[33%] p-2 bg-gray-100 rounded-md">
           <div className="w-full">
           <TextField
              className="mt-2 w-full"
              placeholder="Enter UI Element Selector"
              variant="standard"
              size="small"
              value={param.actionElement}
              onChange={(e) => handleInputFieldChange(index, "actionElement", e.target.value)}
            />
           </div>
           <div className="w-full flex flex-row justify-between items-center">
           <div
                onClick={() => toggleButtonState(index, "beforeClick")}
                className={`${
                  param.beforeClick ? "bg-[#1581ed] text-center cursor-pointer  text-white" : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                } border-2 border-solid border-${param.beforeClick ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[90px] h-[25px]`}
              >
                Before Click
              </div>
              <div
                onClick={() => toggleButtonState(index, "afterClick")}
                className={`${
                  param.afterClick ? "bg-[#1581ed] text-center cursor-pointer  text-white" : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                } border-2 border-solid border-${param.afterClick ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[90px] h-[25px]`}
              >
                After Click
              </div>
           </div>
            </div>
            <div className="w-[33%] bg-gray-100 rounded-md p-2">
           <TextField
              className="mt-2 w-full"
              placeholder="Short Description"
              variant="standard"
              size="small"
              value={param.shortDescription}
              onChange={(e) => handleInputFieldChange(index, "shortDescription", e.target.value)}
            />
           </div>
            </div>
            <div className="flex flex-row justify-between  w-full p-2">
            <div className="flex flex-row gap-5 w-[45%] ">
            <div className="w-[25%] mt-2">User Login :</div>
            <div className="flex flex-col gap-5 w-[75%]">
            <TextField
              className="mt-2 w-full"
              placeholder="Enter Login name"
              variant="standard"
              size="small"
              value={param.loginName}
              onChange={(e) => handleInputFieldChange(index, "loginName", e.target.value)}
            />
            <TextField
              className=" w-full"
              placeholder="Enter UI selector (ID/CSS/Xpath)"
              variant="standard"
              size="loginNameUiSelector"
              value={param.name}
              onChange={(e) => handleInputFieldChange(index, "loginNameUiSelector", e.target.value)}
            />
            </div>

            </div>
            <div className="flex flex-row gap-5 w-[45%] ">
            <div className="w-[25%] mt-2">Enter password :</div>
            <div className="flex flex-col gap-5 w-[75%]">
            <TextField
              className="mt-2 w-full"
              placeholder="Enter login password"
              variant="standard"
              size="small"
              value={param.loginPassword}
              onChange={(e) => handleInputFieldChange(index, "loginPassword", e.target.value)}
            />
            <TextField
              className=" w-full"
              placeholder="Enter UI selector (ID/CSS/Xpath)"
              variant="standard"
              size="small"
              value={param.loginPasswordSelector}
              onChange={(e) => handleInputFieldChange(index, "loginPasswordSelector", e.target.value)}
            />
            </div>

            </div>
            </div>
           </div>

           

            <div className="flex flex-row w-[5%] justify-center items-end">
             

              <div
                className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                onClick={() => handleRemoveParamClick(index)}
                style={{ width: "30px", height: "30px" }}
              >
                <FaMinus />
              </div>
            </div>
          </div>
        ))}
      </div>

        <div
          className="flex items-center justify-center mt-4 p-2 rounded-md text-white"
          onClick={handleAddParamClick}
          style={{
            width: "260px",
            height: "40px",
            backgroundColor: "black" ,
            cursor: "pointer",
          }}
        >
        Add environment configuration
        </div>
    </div>
      </div>
    </AddNewPageButtons>
  );
};

export default AddEnvironment;
