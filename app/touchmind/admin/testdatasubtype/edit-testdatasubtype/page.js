"use client";
import React, { useEffect, useState } from "react";
import { CircularProgress, TextField } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import TestDataTypesDropDown from "@/app/src/components/dropdown/TestDataTypes";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditTestdatasubtype = () => {
  const [formValuesList, setFormValuesList] = useState([]);
  const [selectedSubsidiaryList, setSelectedSubsidiaryList] = useState([]);
  const [buttonActiveList, setButtonActiveList] = useState([]);
  const [selectedTestDataTypes, setSelectedTestDataTypes] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const dispatch = useDispatch();

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
    }
  }, []);

  const handleFetchData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        testDataSubtypes: selectedID.map((id) => ({ recordId: id })),
      };

      const response = await axios.post(
        `${api}/admin/testdatasubtype/getedits`,
        body,
        { headers }
      );
      const testDataSubtypes = response.data.testDataSubtypes || [];

      setFormValuesList(
        testDataSubtypes.map((item) => ({
          recordId: item.recordId || "",
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
        }))
      );
      setlastmodifideBy(testDataSubtypes[0]?.lastModified || "");
      setmodifiedBy(testDataSubtypes[0]?.modifiedBy || "");
      setcreationTime(testDataSubtypes[0]?.creationTime || "");
      setcreator(testDataSubtypes[0]?.creator || "");
      setSelectedSubsidiaryList(
        testDataSubtypes.map((item) => item.subsidiaries || [])
      );

      setSelectedTestDataTypes(
        testDataSubtypes.map((item) => item.testDataType || "") // Set initial test data type for each form
      );

      setButtonActiveList(testDataSubtypes.map((item) => item.status === true));
      setLoading(false);
    } catch (err) {
      setError("Error fetching testDataTypes data");
    } finally {
      setLoading(false);
    }
  };

  const [errors, setErrors] = useState({});
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFormValues = [...formValuesList];
    updatedFormValues[index][name] = value;
    setFormValuesList(updatedFormValues);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    let hasEmptySubsidiary = false;

    // Validate each field in formValuesList
    formValuesList.forEach((item, index) => {
      if (!item.identifier.trim()) {
        newErrors[`identifier-${index}`] = "Identifier is required.";
      }
      if (!item.shortDescription.trim()) {
        newErrors[`shortDescription-${index}`] = "Description is required.";
      }

      // Check if selectedSubsidiaryList[index] is non-empty
      if (
        !Array.isArray(selectedSubsidiaryList[index]) ||
        selectedSubsidiaryList[index].length === 0
      ) {
        toast.error(`Please select Subsidiary`);
        hasEmptySubsidiary = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !hasEmptySubsidiary;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        testDataSubtypes: formValuesList.map((formValues, index) => {
          const selectedSubsidiary = selectedSubsidiaryList[index] || [];
          const selectedTestDataType = selectedTestDataTypes[index] || "";
          return {
            recordId: formValues.recordId,
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            subsidiaries: selectedSubsidiary.map((id) => id),
            testDataType: selectedTestDataType,
            status: buttonActiveList[index],
          };
        }),
      };

      const response = await axios.post(
        `${api}/admin/testdatasubtype/edit`,
        body,
        { headers }
      );
      console.log(body, "response from body");
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
    } catch (err) {
      setError("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > Testdatasubtype";
  const pagename = "Edit";
  const contentname = "Testdatasubtype";


  return (
    <AddNewPageButtons
      lastmodifideBy={lastmodifideBy}
      modifiedBy={modifiedBy}
      creator={creator}
      creationTime={creationTime}
      email={email}
      pagename={pagename}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
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
          {formValuesList.length < 1 ? (
            <div className="w-full flex flex-col  h-40 justify-center items-center">
              <div className="opacity-35 ">
                <Lottie options={defaultOptions} height={100} width={100} />
              </div>
              <div>No data data found...</div>
            </div>
          ) : (
            <>
              <div className="flex flex-col w-full p-3 min-h-screen gap-5">
                {formValuesList.map((formValues, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-gray-200 rounded-md shadow mb-5"
                  >
                    <div className="bg-white p-4 rounded-md shadow-md">
                      <Toaster />
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <TextField
                          label="Identifier"
                          variant="standard"
                          fullWidth
                          name="identifier"
                          value={formValues.identifier}
                          onChange={(e) => handleInputChange(index, e)}
                          error={!!errors[`identifier-${index}`]}
                          helperText={errors[`identifier-${index}`]}
                        />
                        <TextField
                          label="Short Description"
                          variant="standard"
                          fullWidth
                          name="shortDescription"
                          value={formValues.shortDescription}
                          onChange={(e) => handleInputChange(index, e)}
                          error={!!errors[`shortDescription-${index}`]}
                          helperText={errors[`shortDescription-${index}`]}
                        />
                        <MultiSelectSubsidiary
                          initialload={initialload}
                          selectedSubsidiary={selectedSubsidiaryList[index]}
                          setSelectedSubsidiary={(newSubsidiary) => {
                            const updatedSubsidiaryList = [
                              ...selectedSubsidiaryList,
                            ];
                            updatedSubsidiaryList[index] = newSubsidiary;
                            setSelectedSubsidiaryList(updatedSubsidiaryList);
                          }}
                        />
                        <TestDataTypesDropDown
                          initialload={initialload}
                          selectedTestDataTypes={selectedTestDataTypes[index]}
                          setSelectedTestDataTypes={(newTestDataType) => {
                            const updatedTestDataTypes = [
                              ...selectedTestDataTypes,
                            ];
                            updatedTestDataTypes[index] = newTestDataType;
                            setSelectedTestDataTypes(updatedTestDataTypes);
                          }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <div
                          onClick={() => {
                            const updatedButtonActive = [...buttonActiveList];
                            updatedButtonActive[index] =
                              !updatedButtonActive[index];
                            setButtonActiveList(updatedButtonActive);
                          }}
                          className={`${
                            buttonActiveList[index]
                              ? "bg-blue-500 text-white"
                              : "bg-white text-blue-500"
                          } border-2 border-blue-500 rounded-md text-center cursor-pointer text-xs px-2 w-[80px] py-0.5`}
                        >
                          {buttonActiveList[index] ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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

export default EditTestdatasubtype;
