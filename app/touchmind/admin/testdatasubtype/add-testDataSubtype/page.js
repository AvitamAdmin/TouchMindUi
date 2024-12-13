"use client";
import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import "animate.css";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import TestDataTypes from "@/app/src/components/dropdown/TestDataTypes";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import toast, { Toaster } from "react-hot-toast";

const addTestDataSubtype = () => {
  const [ButtonActive, setButtonActive] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [selectedTestDataTypes, setSelectedTestDataTypes] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        testDataSubtypes: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            subsidiaries: selectedSubsidiary ? [selectedSubsidiary] : [],
            testDataType: selectedTestDataTypes,
            status: ButtonActive, // Use button active status (true or false)
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(
        `${api}/admin/testdatasubtype/edit`,
        body,
        { headers }
      );
      console.log(response.data, "response from api");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/testdatasubtype");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error fetching testdatasubtype data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > testdatasubtype";
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
        className="flex flex-col w-full p-1 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />
        <div className="bg-gray-200 flex flex-col pb-5 rounded-md">
          <div className="  w-[100%] flex items-center flex-row justify-center ">
            <div className="bg-white gap-5 w-[98%] rounded-md shadow-md flex flex-col justify-center  pb-4 p-2">
              <div className="flex flex-col gap-4 rounded-lg bg-white border-solid border-2 border-white w-full">
                <div className=" flex-row justify-between grid grid-cols-3 gap-3">
                  <TextField
                    id="standard-textarea"
                    label="Enter Identifier"
                    multiline
                    variant="standard"
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
                    multiline
                    variant="standard"
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
              </div>

              <div className="flex flex-row w-[100%] text-sm ">
                <div className="flex flex-col gap-5 w-full">
                  <div className="flex flex-row gap-5 ">
                    <div className="w-[35%]">
                      <TestDataTypes
                        initialload={initialload}
                        selectedTestDataTypes={selectedTestDataTypes}
                        setSelectedTestDataTypes={setSelectedTestDataTypes}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-row gap-3 items-center">
                    {ButtonActive ? (
                      <div
                        onClick={() => setButtonActive(!ButtonActive)}
                        className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-gray-400 rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Active
                      </div>
                    ) : (
                      <div
                        onClick={() => setButtonActive(!ButtonActive)}
                        className="bg-[#fff] border-2 border-solid border-[#1581ed] rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] text-center cursor-pointer animate__animated  animate__pulse"
                      >
                        Inactive
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default addTestDataSubtype;
