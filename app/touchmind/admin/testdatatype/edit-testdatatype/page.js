"use client";
import React, { useEffect, useState } from "react";
import { CircularProgress, TextField } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditTestdatatype = () => {
  const [formValuesList, setFormValuesList] = useState([]);
  const [selectedSubsidiaryList, setSelectedSubsidiaryList] = useState([]);
  const [buttonActiveList, setButtonActiveList] = useState([]);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const [initialload, setInitialLoad] = useState(true);
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const dispatch = useDispatch();

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
        testDataTypes: selectedID.map((id) => ({ recordId: id })),
      };

      const response = await axios.post(
        `${api}/admin/testdatatype/getedits`,
        body,
        { headers }
      );
      const testDataTypes = response.data.testDataTypes || [];

      setFormValuesList(
        testDataTypes.map((item) => ({
          recordId: item.recordId || "",
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
        }))
      );

      setlastmodifideBy(testDataTypes[0]?.lastModified || "");
      setmodifiedBy(testDataTypes[0]?.modifiedBy || "");
      setcreationTime(testDataTypes[0]?.creationTime || "");
      setcreator(testDataTypes[0]?.creator || "");
      setSelectedSubsidiaryList(
        testDataTypes.map((item) => item.subsidiaries || [])
      );

      setButtonActiveList(testDataTypes.map((item) => item.status === true));
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
        testDataTypes: formValuesList.map((formValues, index) => {
          return {
            recordId: formValues.recordId,
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            subsidiaries: selectedSubsidiaryList[index] || [], // Fix this line
            status: buttonActiveList[index],
          };
        }),
      };

      const response = await axios.post(
        `${api}/admin/testdatatype/edit`,
        body,
        { headers }
      );
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
      setError("Error saving data");
    }
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const breadscrums = "Admin > Testdatatype";
  const pagename = "Edit";
  const contentname = "Testdatatype";


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
              <div>No data found...</div>
            </div>
          ) : (
            <>
              <div className="flex flex-col w-full p-3 min-h-screen gap-5">
                {formValuesList.map((formValues, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-gray-200 rounded-md shadow mb-5"
                  >
                    <Toaster />
                    <div className="bg-white p-4 rounded-md shadow-md">
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
                          } border-2 border-blue-500 rounded-md text-center cursor-pointer text-xs w-[70px] px-2 py-0.5`}
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

export default EditTestdatatype;
