"use client";
import React, { useEffect, useState } from "react";
import { CircularProgress, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditProfile = () => {
  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handlefetchData(jwtToken);
      console.log("huuyuu");
    }
  }, []);

  const [token, setToken] = useState("");
  const [editInputfields, setEditInputFields] = useState([]);
  const [buttonActiveList, setButtonActiveList] = useState([]); // For managing button states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialload, setInitialLoad] = useState(true);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [lastmodifideBy, setlastmodifideBy] = useState(); 
  const [modifiedBy, setmodifiedBy] = useState();
const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)

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
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const [errors, setErrors] = useState({});
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFields = [...editInputfields];
    updatedFields[index][name] = value;
    setEditInputFields(updatedFields);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

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
        toast.error("Please select Subsidiary");
        hasEmptySubsidiary = true;
      }
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !hasEmptySubsidiary;
  };
  const handlePostClick = async () => {

 if (!validateForm()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const profileLocatorPayload = editLocatorFields.map((input) => ({
        locatorId: input.locatorId,
        description: input.description,
        testDataType: input.testDataType,
        inputValue: input.inputValue,

      }));
      // Construct the request body with status
      const body = {
        testProfiles: editInputfields.map((item, index) => ({
          recordId: item.recordId,
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
          status: buttonActiveList[index] || false, // Use the corresponding button status
          subsidiary: item.subsidiary || "",
          profileLocators: profileLocatorPayload,

        })),
      };

      const response = await axios.post(`${api}/admin/profile/edit`, body, {
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

    } catch (err) {
      setError("Error saving profile data");
    } finally {
      setLoading(false);
    }
  };

  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const [editLocatorFields, setEditLocatorFields] = useState([]);

  const handlefetchData = async (jwtToken) => {
    try {
      console.log("hiiii");
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
  
      const body = { testProfiles: selectedID.map((id) => ({ recordId: id })) };
      const response = await axios.post(`${api}/admin/profile/getedits`, body, {
        headers,
      });
      setlastmodifideBy(response.data.testProfiles[0]?.lastModified || "");
      setmodifiedBy(response.data.testProfiles[0]?.modifiedBy || "");
 setcreationTime(response.data.testProfiles[0]?.creationTime || "");
      setcreator(response.data.testProfiles[0]?.creator || "");
      setLoading(false);
      setEditInputFields(response.data.testProfiles);
      setEditLocatorFields(response.data.testProfiles[0].profileLocators); // Set data here
  
      // Log response directly to confirm data availability
      console.log(response.data.testProfiles[0].profileLocators, "Fetched Data");
      
      setButtonActiveList(response.data.testProfiles.map(() => true)); 
    } catch (err) {
      setError("Error fetching profile data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputLocatorChange = (index, value) => {
    const updatedLocator = [...editLocatorFields];
    updatedLocator[index].inputValue = value;
    setEditLocatorFields(updatedLocator);
  };

  const pagename = "Edit";
  const breadscrums = "Admin > Profile";
  const contentname = "Profile";


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
    >
      {loading ? (
        <div className="flex flex-row justify-center items-center w-full h-40">
          <div className="gap-5 flex flex-col items-center justify-center">
            <CircularProgress size={36} color="inherit" />
            <div>Loading...</div>
          </div>
        </div>
      ) : (
        <>
          {editInputfields.length < 1 ? (
            <div className="w-full flex flex-col h-40 justify-center items-center">
              <div className="opacity-35">
                <Lottie options={defaultOptions} height={100} width={100} />
              </div>
              <div>No data found...</div>
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-5">
              <div className="flex flex-col bg-gray-200 p-2 gap-3 rounded-md">
                {editInputfields.map((item, index) => (
                  <div key={item.recordId}>
                    <Toaster />
                    <div className="flex flex-col bg-gray-200 rounded-md">
                      <div className="bg-white p-4 rounded-md">
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <TextField
                            label="Enter Identifier"
                            variant="standard"
                            className="text-xs"
                            name="identifier"
                            value={item.identifier}
                            onChange={(e) => handleInputChange(index, e)}
                            error={!!errors[`identifier-${index}`]}
                            helperText={errors[`identifier-${index}`]}
                          />
                          <TextField
                            label="Enter Description"
                            variant="standard"
                            className="text-xs"
                            name="shortDescription"
                            value={item.shortDescription}
                            onChange={(e) => handleInputChange(index, e)}
                            error={!!errors[`shortDescription-${index}`]}
                            helperText={errors[`shortDescription-${index}`]}
                          />
                          <SingleSelectSubsidiary
                          initialload={initialload}
                            selectedSubsidiary={item.subsidiary}
                            setSelectedSubsidiary={(newNode) => {
                              const updatedFields = editInputfields.map(
                                (field, i) => {
                                  if (i === index) {
                                    return { ...field, subsidiary: newNode };
                                  }
                                  return field;
                                }
                              );
                              setEditInputFields(updatedFields);
                            }}
                          />
                        </div>

                        <div className="flex flex-row gap-3 items-center justify-end">
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
                            } border-2 border-blue-500 rounded-md text-center cursor-pointer text-xs px-2 py-0.5 w-[80px]`}
                          >
                            {buttonActiveList[index] ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="gap-3 flex flex-col bg-gray-300 p-2 rounded-md ">
       {editLocatorFields.map((item,index) =>{
        return(
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
            onChange={(e) => handleInputLocatorChange(index, e.target.value)}
          />
        </div>

        )
       })}
       </div>
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

export default EditProfile;
