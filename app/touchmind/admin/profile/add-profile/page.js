"use client";
import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import toast, { Toaster } from "react-hot-toast";

const AddProfile = () => {
  const [params, setParams] = useState([]);
  const [nodes, setNode] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const router = useRouter();
  const [token, setToken] = useState("");
  const [initialload, setInitialLoad] = useState(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [errors, setErrors] = useState({});
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
      handlefetchProfileData(jwtToken);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
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
      toast.error("Please select Subsidiary."); // Show toast error for node selection
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length === 0 && selectedSubsidiary?.length > 0
    );
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Map profileLocator state to ensure the correct structure
      const profileLocatorPayload = profileLocator.map((input) => ({
        locatorId: input.locatorId,
        description: input.description,
        testDataType: input.testDataType,
        inputValue: input.inputValue,
      }));

      const body = {
        testProfiles: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            subsidiary: selectedSubsidiary,
            status: ButtonActive,
            profileLocators: profileLocatorPayload,
          },
        ],
      };

      console.log(body, "Request body");
      console.log(token, "Token");

      const response = await axios.post(`${api}/admin/profile/edit`, body, {
        headers,
      });
      console.log(response.data, "Response from API");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/profile");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      toast.error("Error saving profile data.");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > profile";
  const pagename = "Add New";
  const handleFieldInputChange = (index, field, value) => {
    const updatedInputs = [...siteInputs];
    updatedInputs[index][field] = value; // Update the specific field for the given site
    setSiteInputs(updatedInputs);
  };

  const [profileLocator, setProfileLocator] = useState([]);
  const handlefetchProfileData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };

      const response = await axios.get(`${api}/admin/profile/add`, {
        headers,
      });
      setProfileLocator(response.data.profileLocatorList);
      console.log(
        response.data.profileLocatorList,
        "response.data.profileLocators"
      );
    } catch (err) {
      setError("Error fetching profile data");
    } finally {
      setLoading(false);
    }
  };
  const handleInputLocatorChange = (index, value) => {
    const updatedLocator = [...profileLocator];
    updatedLocator[index].inputValue = value;
    setProfileLocator(updatedLocator);
  };

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
        <Toaster />
        <div className="flex flex-col bg-gray-200  rounded-md shadow">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <TextField
                label="Enter Identifier"
                variant="standard"
                className="text-xs"
                name="identifier"
                value={formValues.identifier}
                onChange={handleInputChange}
                error={!!errors.identifier} // Set error state
                helperText={errors.identifier} // Display error message
              />

              <TextField
                label="Enter Description"
                variant="standard"
                className="text-xs"
                name="shortDescription"
                value={formValues.shortDescription}
                onChange={handleInputChange}
                error={!!errors.shortDescription} // Set error state
                helperText={errors.shortDescription} // Display error message
              />

              <div className="mt-1">
                <SingleSelectSubsidiary
                  initialload={initialload}
                  selectedSubsidiary={selectedSubsidiary}
                  setSelectedSubsidiary={setSelectedSubsidiary}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
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
                    className="bg-[#fff] border-2 border-solid text-center cursor-pointer border-[#1581ed] rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                  >
                    Inactive
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="gap-3 flex flex-col bg-gray-300 p-2 rounded-md ">
          {profileLocator.map((item, index) => {
            return (
              <div
                key={index}
                className="w-full flex  rounded-md flex-row justify-between gap-5 p-2 items-center"
              >
                <TextField
                  disabled
                  placeholder="Identifier"
                  variant="standard"
                  className="text-xs w-[25%] bg-white p-2 rounded-md"
                  fullWidth
                  value={item.locatorId}
                />

                <TextField
                  disabled
                  placeholder="Short Description"
                  variant="standard"
                  className="text-xs w-[25%] bg-white p-2 rounded-md"
                  fullWidth
                  value={item.description}
                />

                <TextField
                  disabled
                  placeholder="Data Type"
                  variant="standard"
                  className="text-xs w-[25%] bg-white p-2 rounded-md"
                  fullWidth
                  value={item.testDataType}
                />

                <TextField
                  placeholder="Input Value"
                  variant="standard"
                  className="text-xs w-[25%] bg-white p-2 rounded-md"
                  fullWidth
                  value={item.inputValue}
                  onChange={(e) =>
                    handleInputLocatorChange(index, e.target.value)
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default AddProfile;
