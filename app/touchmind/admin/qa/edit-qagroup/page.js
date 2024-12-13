"use client";
import React, { useState, useEffect } from "react";
import { CircularProgress, TextField } from "@mui/material";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import SelectTestLocatorGroup from "@/app/src/components/dropdown/TestLocatorGroup";
import { useDispatch, useSelector } from "react-redux";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import toast, { Toaster } from "react-hot-toast";
import MultiSelectTestLocatorGroup from "@/app/src/components/multiSelectDropdown/MultiSelectTestLocatorGroup";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditQagroup = () => {
  const [editInputfields, seteditInputfields] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)


  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const router = useRouter();
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const dispatch = useDispatch();
  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handleFetchData(jwtToken);
    }
  }, []);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const handleFetchData = async (jwtToken) => {
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = { testPlans: selectedID.map((id) => ({ recordId: id })) };
      const response = await axios.post(`${api}/admin/qa/getedits`, body, {
        headers,
      });

      const testPlans = response.data.testPlans.map((item) => ({
        ...item,
        ButtonActive: item.status || false,
        ButtonEppssocheck: item.checkEppSso || false,
        ButtonScreenshot: item.takeAScreenshot || false,
        ButtonPublished: item.published || false,
      }));
      setlastmodifideBy(response.data.testPlans[0]?.lastModified || "");
      setmodifiedBy(response.data.testPlans[0]?.modifiedBy || "");
      setcreationTime(response.data.testPlans[0]?.creationTime || "");
      setcreator(response.data.testPlans[0]?.creator || "");
      console.log(testPlans, "testPlans response from API");
      seteditInputfields(testPlans);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
    }
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFields = [...editInputfields];

    updatedFields[index][name] = value;
    seteditInputfields(updatedFields);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    let hasEmptySubsidiary = false;

    // Validate each field in editInputfields
    editInputfields.forEach((item, index) => {
      if (!item.identifier.trim()) {
        newErrors[`identifier-${index}`] = "Identifier is required.";
      }
      if (!item.shortDescription.trim()) {
        newErrors[`shortDescription-${index}`] = "Description is required.";
      }

      if (!item.subsidiary || item.subsidiary.length === 0) {
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
        testPlans: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
          subsidiary: item.subsidiary || "",
          testLocatorGroups: item.testLocatorGroups || "",

          status: item.ButtonActive, // Use button active status (true or false)
        })),
      };

      console.log(body, "Request body");

      const response = await axios.post(`${api}/admin/qa/edit`, body, {
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

      console.log(response.data, "API Response");
     
    } catch (err) {
      setError("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > QA Group";
  const pagename = "Edit";
  const contentname = "QA Group";

  const toggleButtonState = (index, buttonName) => {
    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        return { ...item, [buttonName]: !item[buttonName] }; // Toggle button state
      }
      return item;
    });

    seteditInputfields(updatedFields);
  };
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
          {editInputfields.length < 1 ? (
            <div className="w-full flex flex-col  h-40 justify-center items-center">
              <div className="opacity-35 ">
                <Lottie options={defaultOptions} height={100} width={100} />
              </div>
              <div>No data data found...</div>
            </div>
          ) : (
            <div className="flex flex-col w-full p-3  gap-5">
              {editInputfields.map((item, index) => (
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
                        value={item.identifier}
                        onChange={(e) => handleInputChange(index, e)}
                        error={!!errors[`identifier-${index}`]}
                        helperText={errors[`identifier-${index}`]}
                      />
                      <TextField
                        label="Short Description"
                        variant="standard"
                        fullWidth
                        name="shortDescription"
                        value={item.shortDescription}
                        onChange={(e) => handleInputChange(index, e)}
                        error={!!errors[`shortDescription-${index}`]}
                        helperText={errors[`shortDescription-${index}`]}
                      />
                      <SingleSelectSubsidiary
                        initialload={initialload}
                        selectedSubsidiary={item.subsidiary}
                        // setSelectedSubsidiary={(newSubsidiary) => {
                        //   const updatedSubsidiary = [...selectedSubsidiaryList];
                        //   updatedSubsidiary[index] = newSubsidiary;
                        //   setSelectedSubsidiaryList(updatedSubsidiary);
                        // }}
                        setSelectedSubsidiary={(newNode) => {
                          const updatedFields = editInputfields.map(
                            (field, i) => {
                              if (i === index) {
                                return { ...field, subsidiary: newNode };
                              }
                              return field;
                            }
                          );
                          seteditInputfields(updatedFields);
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="w-[95%]">
                        <MultiSelectTestLocatorGroup
                          initialload={initialload}
                          selectedTestLocatorGroup={item.testLocatorGroups}
                          setSelectedTestLocatorGroup={(newNode) => {
                            const updatedFields = editInputfields.map(
                              (field, i) => {
                                if (i === index) {
                                  return {
                                    ...field,
                                    testLocatorGroups: newNode,
                                  };
                                }
                                return field;
                              }
                            );
                            seteditInputfields(updatedFields);
                          }}
                        />
                      </div>

                      <div className="flex gap-4 items-center justify-end">
                        <div
                          onClick={() =>
                            toggleButtonState(index, "ButtonActive")
                          }
                          className={`${
                            item.ButtonActive
                              ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                              : "bg-[#fff] text-gray-500 border-gray-400 text-center cursor-pointer"
                          } border-2 border-solid  rounded-md  text-xs px-2 py-0.5 w-[80px]`}
                        >
                          {item.ButtonActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

export default EditQagroup;
