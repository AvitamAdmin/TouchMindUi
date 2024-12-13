"use client";
import React, { useEffect, useState } from "react";
import { TextField, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import NodeDropdown from "@/app/src/components/dropdown/Node";
import MethodsDropdown from "@/app/src/components/dropdown/MethodsDropdown";
import TestDataTypesDropDown from "@/app/src/components/dropdown/TestDataTypes";
import TestDataSubTypeDropDown from "@/app/src/components/dropdown/TestDataSubtype";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import { Close as CloseIcon } from "@mui/icons-material";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditLocator = () => {
  const [token, setToken] = useState("");
  const [params, setParams] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [siteInputs, setSiteInputs] = useState([]);
  const [editInputFields, setEditInputFields] = useState([]);
  const router = useRouter();
  const [sitesList, setSitesList] = useState([]);
  const [email, setEmail] = useState("");
  const [updateLabel, setUpdateLabel] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const dispatch = useDispatch();
  const [initialload, setInitialLoad] = useState(true);
  const [errors, setErrors] = useState({});
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)


  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handleFetchData(jwtToken);
      getSitesData(jwtToken);
      console.log(jwtToken, "jwtToken response");
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleAddParamClick = () => setParams([...params, ""]);

  const handleRemoveParamClick = (index) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };

  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    setParams(newParams);
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    setEditInputFields((prevFields) =>
      prevFields.map((item, i) => {
        if (i === index) {
          if (
            name === "parentNode" ||
            name === "methodName" ||
            name === "testDataSubtype" ||
            name === "testDataType"
          ) {
            return {
              ...item,
              [name]: { ...item[name], identifier: value },
            };
          }
          return { ...item, [name]: value };
        }
        return item;
      })
    );
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    let hasEmptySubsidiary = false;

    // Validate each field in editInputfields
    editInputFields.forEach((item, index) => {
      if (!item.identifier.trim()) {
        newErrors[`identifier-${index}`] = "Identifier is required.";
      }
      if (!item.shortDescription.trim()) {
        newErrors[`shortDescription-${index}`] = "Description is required.";
      }

      // if (!item.subsidiary || item.subsidiary.length === 0) {
      //   toast.error(`Please select Subsidiary for item at index ${index + 1}`);
      //   hasEmptySubsidiary = true;
      // }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !hasEmptySubsidiary;
  };

  const handlePostClick = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // console.log(testDataType,"selectedTestDataTypes selectedTestDataTypes");

      const headers = { Authorization: `Bearer ${token}` };
      const uiLocatorSelector = sitesList.reduce((acc, site, index) => {
        acc[site.identifier] = {
          xpathSelector: siteInputs[index]?.xpath || "",
          cssSelector: siteInputs[index]?.css || "",
          idSelector: siteInputs[index]?.id || "",
          othersSelector: siteInputs[index]?.other || "",
          inputData: siteInputs[index]?.inputData || "",
        };
        return acc;
      }, {});
      const body = {
        testLocators: editInputFields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
          // parentNode: { recordId: item.parentNode?.recordId || null },
          testDataType: item.testDataType || null,
          testDataSubtype: item.testDataSubtype || null,
          methodName: item.methodName || null,
          status: item.ButtonActive,
          labels: item.labels || [],
          errorMsg: item.errorMsg || "",
          uiLocatorSelector: uiLocatorSelector,
        })),
      };

      // Log the data being sent to the API
      console.log(body, "req body");

      const response = await axios.post(`${api}/admin/locator/edit`, body, {
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

      // Log the response from the API
      console.log(response.data, "Response after submitting");
    } catch (err) {
      setError("Error saving locator data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleButtonClick = (index) => {
    const updatedFields = [...editInputFields];
    updatedFields[index].ButtonActive = !updatedFields[index].ButtonActive;
    setEditInputFields(updatedFields);
  };
  const handleFetchData = async (jwtToken) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = { testLocators: selectedID.map((id) => ({ recordId: id })) };
      const response = await axios.post(`${api}/admin/locator/getedits`, body, {
        headers,
      });

      setlastmodifideBy(response.data.testLocators[0]?.lastModified || "");
      setmodifiedBy(response.data.testLocators[0]?.modifiedBy || "");
      setcreationTime(response.data.testLocators[0]?.creationTime || "");
      setcreator(response.data.testLocators[0]?.creator || "");
      const testLocators = response.data.testLocators.map((item) => ({
        ...item,
        ButtonActive: item.status || false,
        params: item.uiLocatorSelector || {}, // Default to empty object
      }));

      setEditInputFields(testLocators);
      console.log(testLocators, "response from API");
    } catch (err) {
      setError("Error fetching locator data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunClick = () => alert("Run function executed from EditLocator!");

  const handleAddLabelBlur = (index) => {
    if (updateLabel.trim()) {
      const updatedFields = [...editInputFields];
      const labelsArray = updatedFields[index].labels || [];

      // Add the new label to the labels array
      updatedFields[index].labels = [...labelsArray, updateLabel.trim()];
      setEditInputFields(updatedFields);

      // Clear the input field after adding
      setUpdateLabel("");
    }
  };

  // Handle removing a label by its index
  const handleRemoveLabel = (fieldIndex, labelIndex) => {
    const updatedFields = [...editInputFields];
    updatedFields[fieldIndex].labels = updatedFields[fieldIndex].labels.filter(
      (_, i) => i !== labelIndex
    );
    setEditInputFields(updatedFields);
  };

  const pagename = "Edit Locator";
  const breadscrums = "Admin > Locator";
  const contentname = "Locator";


  const getSitesData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch sites data
      const response = await axios.get(`${api}/admin/site/get`, { headers });
      const sites = response.data.sites || [];
      setSitesList(sites); // Ensure we set the sites

      // Prepare the body with selected IDs
      const body = { testLocators: selectedID.map((id) => ({ recordId: id })) };

      // Fetch locator data
      const locatorResponse = await axios.post(
        `${api}/admin/locator/getedits`,
        body,
        { headers }
      );

      // Extract uiLocatorSelector from testLocators array
      const testLocators = locatorResponse.data.testLocators || [];
      const locators = {};

      // Flatten uiLocatorSelector into a single object keyed by identifier
      testLocators.forEach((locator) => {
        const uiLocator = locator.uiLocatorSelector || {};
        Object.keys(uiLocator).forEach((key) => {
          locators[key] = uiLocator[key]; // Map the inner objects to the locators object
        });
      });

      // Log to confirm extraction
      console.log("Extracted Locators:", locators);

      // Map sites to their corresponding locator data
      const initialInputs = sites.map((site) => {
        const identifier = site.identifier;
        const locatorData = locators[identifier] || {}; // Get locator data for the site

        console.log(`Mapping site: ${identifier}`, locatorData); // Debug log

        return {
          xpath: locatorData.xpathSelector || "",
          css: locatorData.cssSelector || "",
          id: locatorData.idSelector || "",
          other: locatorData.othersSelector || "",
          inputData: locatorData.inputData || "",
        };
      });

      setSiteInputs(initialInputs); // Set the inputs correctly
    } catch (error) {
      console.error("Error fetching sites", error);
    }
  };

  const handleFieldInputChange = (index, field, value) => {
    setSiteInputs((prev) =>
      prev.map((input, i) =>
        i === index ? { ...input, [field]: value } : input
      )
    );
  };

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
      <div className="p-2">
        {editInputFields.length < 1 ? (
          <div className="w-full flex flex-col  h-40 justify-center items-center">
            <div className="opacity-35 ">
              <Lottie options={defaultOptions} height={100} width={100} />
            </div>
            <div>No data data found...</div>
          </div>
        ) : (
          <>
            <div className="flex flex-col bg-gray-200 min-h-96 p-2 gap-3 rounded-md">
              <Toaster />
              {editInputFields.map((item, index) => (
                <div
                  key={item.recordId}
                  className="bg-white p-4 rounded-md shadow-md"
                >
                  <div className="bg-white w-[98%] rounded-md  flex flex-col justify-center gap-2 pb-4">
                    <div className="w-full grid grid-cols-3 justify-between gap-10 p-2 items-center">
                      <TextField
                        label="Enter Identifier"
                        variant="standard"
                        className="text-xs"
                        fullWidth
                        name="identifier"
                        value={item.identifier}
                        onChange={(e) => handleInputChange(e, index)}
                        error={!!errors[`identifier-${index}`]}
                        helperText={errors[`identifier-${index}`]}
                      />
                      <TextField
                        label="Enter Description"
                        variant="standard"
                        className="text-xs"
                        fullWidth
                        name="shortDescription"
                        value={item.shortDescription}
                        onChange={(e) => handleInputChange(e, index)}
                        error={!!errors[`shortDescription-${index}`]}
                        helperText={errors[`shortDescription-${index}`]}
                      />
                      <MethodsDropdown
                        initialload={initialload}
                        setMethods={(value) => {
                          const updatedFields = [...editInputFields];
                          updatedFields[index].methodName = value; // Set the value for the current locator
                          setEditInputFields(updatedFields);
                        }}
                        methods={editInputFields[index].methodName || ""} // Fetch the current method
                      />
                    </div>

                    <div className="w-full grid grid-cols-3 justify-between gap-10 p-2">
                      <TestDataTypesDropDown
                        initialload={initialload}
                        selectedTestDataTypes={item.testDataType} // Pass the entire testDataType object
                        setSelectedTestDataTypes={(newDataType) => {
                          const updatedFields = editInputFields.map(
                            (field, i) => {
                              if (i === index) {
                                return { ...field, testDataType: newDataType }; // Store the full object
                              }
                              return field;
                            }
                          );
                          setEditInputFields(updatedFields); // Update state with the new testDataType
                        }}
                      />

                      <TestDataSubTypeDropDown
                        initialload={initialload}
                        testDataSubtypes={item.testDataSubtype || ""} // Ensure you pass the correct existing value
                        setTestDataSubtypes={(newDataType) => {
                          const updatedFields = editInputFields.map(
                            (field, i) => {
                              if (i === index) {
                                return {
                                  ...field,
                                  testDataSubtype: newDataType,
                                }; // Update the correct field
                              }
                              return field;
                            }
                          );
                          setEditInputFields(updatedFields);
                        }}
                      />

                      <TextField
                        label="Error Msg"
                        variant="standard"
                        className="text-xs mt-5"
                        fullWidth
                        name="errorMsg"
                        value={item.errorMsg}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                    </div>

                    <div className="w-full p-2 grid grid-cols-2 gap-10">
                      <TextField
                        label="Enter to add label"
                        variant="standard"
                        className="text-xs"
                        fullWidth
                        value={updateLabel}
                        onChange={(e) => setUpdateLabel(e.target.value)}
                        onBlur={() => handleAddLabelBlur(index)} // Use the correct index
                      />

                      <div
                        className="flex flex-wrap w-full bg-[#F8F8F8] p-2 items-center justify-start gap-2 mt-2"
                        style={{ whiteSpace: "nowrap", minHeight: "45px" }}
                      >
                        {item.labels?.map((label, labelIndex) => (
                          <Chip
                            key={`${label}-${labelIndex}`} // Ensure unique key
                            label={label}
                            onDelete={() =>
                              handleRemoveLabel(index, labelIndex)
                            } // Remove label by index
                            deleteIcon={<CloseIcon />}
                            className="text-xs"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="w-full flex flex-row justify-end ">
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
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-4  p-4">
                <div
                  className={`p-2 rounded-md ${
                    activeSection === "configureSelectors"
                      ? "bg-black text-white text-center cursor-pointer"
                      : "bg-gray-200 text-black border-2 border-gray-400 text-center cursor-pointer"
                  }`}
                  onClick={() => setActiveSection("configureSelectors")}
                >
                  Configure Selectors
                </div>

                <div
                  className={`p-2 rounded-md  ${
                    activeSection === "selectorGroups"
                      ? "bg-black text-white text-center cursor-pointer"
                      : "bg-gray-200 text-black border-2 border-gray-400 text-center cursor-pointer"
                  }`}
                  onClick={() => setActiveSection("selectorGroups")}
                >
                  Selector Groups
                </div>
              </div>
              {activeSection === "configureSelectors" && (
                <div className="p-4 w-[100%]">
                  <div className="bg-white w-full rounded-md h-72 shadow-md flex flex-col justify-start gap-2 pb-4">
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
                              handleFieldInputChange(
                                index,
                                "xpath",
                                e.target.value
                              )
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
                              handleFieldInputChange(
                                index,
                                "css",
                                e.target.value
                              )
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
                              handleFieldInputChange(
                                index,
                                "id",
                                e.target.value
                              )
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
                              handleFieldInputChange(
                                index,
                                "other",
                                e.target.value
                              )
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
              {activeSection === "selectorGroups" && (
                <div className="p-4">
                  <textarea className="w-full h-64 border-solid border-2 border-gray-300 rounded-md" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <ListingpageSuccessModal
          contentname={contentname}
          isOpen={listingPageSuccess}
          setIsModalOpen={setListingPageSuccess}
        />
    </AddNewPageButtons>
  );
};

export default EditLocator;
