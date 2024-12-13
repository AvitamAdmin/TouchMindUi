"use client";
import React, { useState, useEffect } from "react";
import { FaMinus } from "react-icons/fa";
import { TextField } from "@mui/material";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import toast, { Toaster } from "react-hot-toast";
import MultiSelectTestLocatorGroup from "@/app/src/components/multiSelectDropdown/MultiSelectTestLocatorGroup";

const AddQagroup = () => {
  const [params, setParams] = useState([]);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTestLocatorGroup, setSelectedTestLocatorGroup] = useState([]);
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
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleAddParamClick = () => {
    setParams([...params, ""]);
  };

  const handleRemoveParamClick = (index) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };

  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    setParams(newParams);
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
      toast.error("Please select Subsidiary."); // Show toast error for node selection
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length === 0 && selectedSubsidiary?.length > 0
    );
  };
  const handleSaveClick = async () => {
    if (!validateForm()) return; // Stop execution if form is invalid
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        testPlans: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            subsidiary: selectedSubsidiary,
            testLocatorGroups: selectedTestLocatorGroup,
            status: ButtonActive, // Use button active status (true or false)
          },
        ],
      };

      console.log(body, "req body from user");
      // console.log(token, "token");

      const response = await axios.post(`${api}/admin/qa/edit`, body, {
        headers,
      });
      console.log(response.data.testPlans, "response from api");
     if (response.data.success === true) {
  toast.success(`${response.data.message}`, { className: "text-sm" });
  setTimeout(() => {
    router.push("/touchmind/admin/qa");
  }, 2000);
} else if (response.data.success === false) { // Corrected "else" to "else if"
  toast.error(`${response.data.message}`, { className: "text-sm" });
} else { // Fallback case
  toast.error(`${response.data.message}`, { className: "text-sm" });
}

   
    } catch (err) {
      setError("Error fetching qa data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > qa";
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
        className="flex flex-col w-full p-3 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />

        <div className="flex flex-col bg-gray-200 rounded-md shadow">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <TextField
                id="standard-textarea"
                label="Enter Identifier"
                variant="standard"
                fullWidth
                className="mt-3"
                name="identifier"
                value={formValues.identifier}
                onChange={handleInputChange}
                error={!!errors.identifier}
                helperText={errors.identifier}
              />
              <TextField
                id="standard-textarea"
                label="Description"
                variant="standard"
                fullWidth
                className="mt-3"
                name="shortDescription"
                value={formValues.shortDescription}
                onChange={handleInputChange}
                error={!!errors.shortDescription}
                helperText={errors.shortDescription}
              />

              <div className="mt-4">
                <SingleSelectSubsidiary
                  initialload={initialload}
                  selectedSubsidiary={selectedSubsidiary}
                  setSelectedSubsidiary={setSelectedSubsidiary}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-45%">
                <MultiSelectTestLocatorGroup
                  initialload={initialload}
                  setSelectedTestLocatorGroup={setSelectedTestLocatorGroup}
                  selectedTestLocatorGroup={selectedTestLocatorGroup}
                />
              </div>

              <div className="flex gap-4 items-center w-[100%] justify-end">
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
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default AddQagroup;
