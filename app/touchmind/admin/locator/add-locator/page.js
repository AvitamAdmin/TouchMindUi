"use client";
import React, { useState, useEffect } from "react";
import { Chip, TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import TestDataSubTypeDropDown from "@/app/src/components/dropdown/TestDataSubtype";
import TestDataTypesDropDown from "@/app/src/components/dropdown/TestDataTypes";
import MethodsDropdown from "@/app/src/components/dropdown/MethodsDropdown";
import { Close as CloseIcon } from "@mui/icons-material";
import toast, { Toaster } from "react-hot-toast";

const AddLocator = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ButtonActive, setButtonActive] = useState(false);
  const [testDataTypes, setTestDataTypes] = useState([]);
  const [testDataSubtypes, setTestDataSubtypes] = useState([]);
  const [methods, setMethods] = useState([]);
  const [editInputFields, setEditInputFields] = useState([]);
  const [updateLabel, setUpdateLabel] = useState("");
  const [sitesList, setSitesList] = useState([]);
  const [siteInputs, setSiteInputs] = useState([]);
  const [activeSection, setActiveSection] = useState(null); // Track the active section
  const [initialload, setInitialLoad] = useState(true);

  const toggleSection = (section) => {
    setActiveSection((prev) => (prev === section ? null : section)); // Toggle between sections
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
    label: [],
    errorMsg: "",
  });
  const { identifier, shortDescription, label, errorMsg } = formValues;
  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      getSitesData(jwtToken);
    }
  }, []);
  const [errors, setErrors] = useState({}); // Track field errors

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
      // ...(name === "errorMsg" && { errorMsg: "" }), // Clear only errorMsg if it changes
    });

    // Clear the specific error when the user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // Handle adding a new label on blur
  const handleAddLabelBlur = () => {
    if (updateLabel.trim()) {
      setFormValues((prevState) => ({
        ...prevState,
        label: [...prevState.label, updateLabel.trim()], // Add label to the array
      }));
      setUpdateLabel(""); // Clear the input field
    }
  };

  const handleRemoveLabel = (labelIndex) => {
    setFormValues((prevState) => ({
      ...prevState,
      label: prevState.label.filter((_, index) => index !== labelIndex), // Remove by index
    }));
  };
  const getSitesData = async (token) => {
    try {
      const headers = { Authorization: "Bearer " + token };
      const response = await axios.get(api + "/admin/site/get", { headers });
      setSitesList(response.data.sites);

      // Initialize input states for each site with empty strings or default values
      const initialInputs = response.data.sites.map(() => ({
        xpath: "",
        css: "",
        id: "",
        other: "",
        inputData: "",
      }));
      setSiteInputs(initialInputs);
    } catch (error) {
      console.log(error, "Error fetching sites");
    }
  };

  // Handle input change for a specific site
  const handleFieldInputChange = (index, field, value) => {
    const updatedInputs = [...siteInputs];
    updatedInputs[index][field] = value; // Update the specific field for the given site
    setSiteInputs(updatedInputs);
  };

  const handleSaveClick = async () => {
    let newErrors = {}; // Initialize an object to hold new errors

    // Validation checks
    if (!identifier.trim()) {
      newErrors.identifier = "Identifier is required.";
    }
    if (!shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required."; // Concatenate if there's already an error message
    }

    // If there are errors, update the errors state and return early
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const uiLocatorSelector = sitesList.reduce((acc, item, index) => {
        acc[item.identifier] = {
          xpathSelector: siteInputs[index]?.xpath || "",
          cssSelector: siteInputs[index]?.css || "",
          idSelector: siteInputs[index]?.id || "",
          othersSelector: siteInputs[index]?.other || "",
          inputData: siteInputs[index]?.inputData || "",
        };
        return acc;
      }, {});

      const body = {
        testLocators: [
          {
            identifier: identifier,
            shortDescription: shortDescription,
            methodName: methods,
            errorMsg: errorMsg,
            testDataType: testDataTypes,
            testDataSubtype: testDataSubtypes,
            labels: label,
            status: ButtonActive,
            uiLocatorSelector: uiLocatorSelector,
          },
        ],
      };

      console.log(body, "Request body");

      const response = await axios.post(`${api}/admin/locator/edit`, body, {
        headers,
      });
      console.log(response.data, "API response");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/locator");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      console.error("Error submitting locator data:", err);
      setError("Error fetching locator data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > locator";
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
      <div>
        <div className="  w-[100%] flex items-center flex-row justify-center ">
          <Toaster />
          <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
            <div className=" w-full grid grid-cols-3 justify-between gap-10 p-2 items-center">
              <div className="flex flex-col w-full">
                <TextField
                  required
                  label="Enter Identifier"
                  variant="standard"
                  className="text-xs"
                  fullWidth
                  name="identifier"
                  value={identifier}
                  onChange={handleInputChange}
                  error={!!errors.identifier} // Set error state
                  helperText={errors.identifier} // Show error message
                />
              </div>

              <div className="flex flex-col w-full">
                <TextField
                  required
                  label="Enter Description"
                  variant="standard"
                  className="text-xs"
                  fullWidth
                  name="shortDescription"
                  value={shortDescription}
                  onChange={handleInputChange}
                  error={!!errors.shortDescription} // Set error state
                  helperText={errors.shortDescription} // Show error message
                />
              </div>

              <div className=" w-full flex flex-row justify-between  p-2 items-center">
                <MethodsDropdown
                  initialload={initialload}
                  methods={methods}
                  setMethods={setMethods}
                />
              </div>
            </div>

            <div className=" w-full grid grid-cols-3 justify-between gap-10 p-2">
              <div className="mt-4">
                <TestDataTypesDropDown
                  initialload={initialload}
                  setSelectedTestDataTypes={setTestDataTypes}
                  selectedTestDataTypes={testDataTypes}
                />
              </div>

              <TestDataSubTypeDropDown
                initialload={initialload}
                testDataSubtypes={testDataSubtypes}
                setTestDataSubtypes={setTestDataSubtypes}
              />

              <TextField
                label="Error Msg"
                variant="standard"
                className="text-xs mt-5"
                fullWidth
                name="errorMsg"
                value={formValues.errorMsg}
                onChange={handleInputChange}
              />
            </div>

            <div className="w-full p-2 flex flex-row gap-10">
              <TextField
                label="Enter to add label"
                variant="standard"
                className="text-xs w-[32%]"
                fullWidth
                name="addLabel"
                value={updateLabel}
                onChange={(e) => setUpdateLabel(e.target.value)}
                onBlur={handleAddLabelBlur} // Trigger label addition on blur
              />

              {/* Display comma-separated labels */}
              {/* <TextField
                label="Labels"
                variant="standard"
                className="text-xs"
                fullWidth
                value={formValues.label.join(", ")} // Join the label array
                InputProps={{
                  readOnly: true, // Make this field read-only
                }}
              /> */}
              <div
                className="flex flex-wrap w-[67%] bg-[#F8F8F8] p-2 items-center justify-start pb-2 gap-2 mt-2"
                style={{ whiteSpace: "nowrap", minHeight: "45px" }} // Ensure horizontal scrolling
              >
                {formValues.label.map((label, index) => (
                  <Chip
                    key={`${label}-${index}`} // Ensure unique key
                    label={label}
                    onDelete={() => handleRemoveLabel(index)} // Remove label by index
                    deleteIcon={<CloseIcon />}
                    className="text-xs"
                  />
                ))}
              </div>
            </div>

            <div className="w-full flex flex-row justify-end pr-2">
              {ButtonActive ? (
                <div
                  onClick={() => setButtonActive(!ButtonActive)}
                  className="bg-[#1581ed]   border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated animate__pulse"
                >
                  Active
                </div>
              ) : (
                <div
                  onClick={() => setButtonActive(!ButtonActive)}
                  className="bg-[#fff] border-2 border-solid border-[#1581ed] rounded-md text-gray-500 text-center cursor-pointer text-xs px-2 py-0.5 w-[80px] animate__animated animate__pulse"
                >
                  Inactive
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-5 p-4">
          <div
            className={`p-2 rounded-md w-[170px] ${
              activeSection === "selectors"
                ? "bg-black text-white text-center cursor-pointer border-2 border-black"
                : "bg-gray-200 text-black border-2 border-gray-400 text-center cursor-pointer"
            }`}
            onClick={() => toggleSection("selectors")}
          >
            Configure Selectors
          </div>

          <div
            className={`p-2 rounded-md w-[170px] ${
              activeSection === "groups"
                ? "bg-black text-white text-center cursor-pointer border-2 border-black"
                : "bg-gray-200 text-black border-2 border-gray-400 text-center cursor-pointer"
            }`}
            onClick={() => toggleSection("groups")}
          >
            Selector Groups
          </div>
        </div>

        <div>
          {activeSection === "selectors" && (
            <div className="p-3">
              <div className="bg-white w-full h-72 rounded-md shadow-md flex flex-col justify-start gap-2 pb-4">
                {sitesList.map((item, index) => (
                  <div
                    key={index}
                    className="w-[100%] flex flex-row justify-between gap-5 p-2 items-center"
                  >
                    <div className="w-[15%] text-md">{item.identifier}</div>

                    <div className="w-[17%]">
                      <TextField
                        placeholder="Enter UI element xpath selector"
                        variant="standard"
                        className="text-xs w-[100%]"
                        fullWidth
                        value={siteInputs[index]?.xpath || ""}
                        onChange={(e) =>
                          handleFieldInputChange(index, "xpath", e.target.value)
                        }
                      />
                    </div>

                    <div className="w-[17%]">
                      <TextField
                        placeholder="Enter UI element css selector"
                        variant="standard"
                        className="text-xs w-[100%]"
                        fullWidth
                        value={siteInputs[index]?.css || ""}
                        onChange={(e) =>
                          handleFieldInputChange(index, "css", e.target.value)
                        }
                      />
                    </div>

                    <div className="w-[17%]">
                      <TextField
                        placeholder="Enter UI element ID selector"
                        variant="standard"
                        className="text-xs w-[100%]"
                        fullWidth
                        value={siteInputs[index]?.id || ""}
                        onChange={(e) =>
                          handleFieldInputChange(index, "id", e.target.value)
                        }
                      />
                    </div>

                    <div className="w-[17%]">
                      <TextField
                        placeholder="Enter UI element Other selector"
                        variant="standard"
                        className="text-xs w-[100%]"
                        fullWidth
                        value={siteInputs[index]?.other || ""}
                        onChange={(e) =>
                          handleFieldInputChange(index, "other", e.target.value)
                        }
                      />
                    </div>

                    <div className="w-[17%]">
                      <TextField
                        placeholder="Enter Input Data"
                        variant="standard"
                        className="text-xs w-[100%]"
                        fullWidth
                        value={siteInputs[index]?.inputData || ""}
                        onChange={(e) =>
                          handleFieldInputChange(
                            index,
                            "inputData",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "groups" && (
            <div className="p-3">
              <textarea className="w-full h-72 border-solid border-2 gap-2 pb-4 border-gray-300 rounded-md" />
            </div>
          )}
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default AddLocator;
