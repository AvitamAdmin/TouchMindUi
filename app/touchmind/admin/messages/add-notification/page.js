"use client";
import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import TestPlan from "@/app/src/components/dropdown/TestPlan";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const AddNotification = () => {
  const [params, setParams] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testPlan, setTestPlan] = useState([]);
  const [selectedTestPlan, setSelectedTestPlan] = useState("");
  const router = useRouter();
  const [initialload, setInitialLoad] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
    type: "",
    percentFailure: "",
    recipients: "",
  });

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
    }
  }, []);
  const [errors, setErrors] = useState({});
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSaveClick = async () => {
    const newErrors = {};
    if (!formValues.identifier) newErrors.identifier = "Identifier is required";
    if (!formValues.shortDescription)
      newErrors.shortDescription = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop the save process if there are validation errors
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        messageResources: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            testPlanId: testPlan,
            type: formValues.type,
            percentFailure: formValues.percentFailure,
            recipients: formValues.recipients,
            status: ButtonActive, // Use button active status (true or false)
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(`${api}/admin/messages/edit`, body, {
        headers,
      });
      console.log(response.data, "response from api");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/messages");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }

      
    } catch (err) {
      setError("Error fetching messages data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > messages";
  const pagename = "Add New";
  const [addnewpagebtn, setaddnewpagebtn] = useState(true);

  return (
    <AddNewPageButtons
      pagename={pagename}
      setshow={addnewpagebtn}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
    >
      <div
        className="flex flex-col w-full p-4 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <div className="flex flex-col bg-gray-200  rounded-md shadow">
          <Toaster />
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <TextField
                label="Enter Identifier"
                variant="standard"
                className="text-xs mt-5"
                name="identifier"
                value={formValues.identifier}
                onChange={handleInputChange}
                error={!!errors.identifier} // Show error state if validation fails
                helperText={errors.identifier} // Display error message
              />

              <TextField
                label="Enter Description"
                variant="standard"
                className="text-xs mt-5"
                name="shortDescription"
                value={formValues.shortDescription}
                onChange={handleInputChange}
                error={!!errors.shortDescription} // Show error state if validation fails
                helperText={errors.shortDescription} // Display error message
              />

              <div className="mb-0.5">
                <TestPlan
                  initialLoad={initialload}
                  setTestPlan={setTestPlan}
                  testPlan={testPlan}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <TextField
                  label="Enter the channel type"
                  variant="standard"
                  className="text-xs"
                  name="type" // Change this to match the state property
                  value={formValues.type}
                  onChange={handleInputChange}
                />
                <TextField
                  label="Enter failure condition value"
                  type="number"
                  variant="standard"
                  className="text-xs"
                  name="percentFailure" // Add name attribute
                  value={formValues.percentFailure} // Ensure value corresponds to state
                  onChange={handleInputChange}
                  inputProps={{
                    inputMode: "numeric", // Provides a numeric keyboard for mobile devices
                    pattern: "[0-9]*", // Ensures only digits are allowed
                  }}
                />
                <TextField
                  label="Enter the recipients"
                  variant="standard"
                  className="text-xs"
                  name="recipients" // Add name attribute
                  value={formValues.recipients} // Ensure value corresponds to state
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-4 items-center w-[100%] justify-end">
                <div className="flex flex-row gap-3 items-center">
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
                      className="bg-[#fff] border-2 border-solid border-[#1581ed] rounded-md text-gray-500 text-center cursor-pointer text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Inactive
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4 w-[100%]">
          <div className="grid grid-cols-3 gap-4">
            {params.map((param, index) => (
              <div key={index} className="flex items-center gap-2">
                <TextField
                  placeholder="Enter Param Here"
                  variant="outlined"
                  size="small"
                  value={param}
                  onChange={(e) => handleParamChange(index, e.target.value)}
                  className="w-full"
                />
                <div
                  className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                  onClick={() => handleRemoveParamClick(index)}
                  style={{ width: "40px", height: "40px" }}
                >
                  <FaMinus />
                </div>
              </div>
            ))}
          </div>
          {/* <div
       className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
       onClick={handleAddParamClick}
       style={{ width: '100px', height: '40px' }}
     >
       Add Param
     </div> */}
        </div>
        {/* <div>
   <div
   className="flex items-center justify-center p-2 rounded-md bg-black text-white text-center cursor-pointer"   
   >
   Add an input Field
   </div>
   </div> */}
      </div>
    </AddNewPageButtons>
  );
};

export default AddNotification;
