"use client";
import React, { useEffect, useState } from "react";
import { CircularProgress, TextField } from "@mui/material";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { useDispatch, useSelector } from "react-redux";
import TestPlan from "@/app/src/components/dropdown/TestPlan";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";


const EditMessages = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const [editInputfields, setEditInputfields] = useState([]);
  const [buttonActiveList, setButtonActiveList] = useState([]);
  const [testPlan, setTestPlan] = useState([]);
  const [email, setEmail] = useState("");
  const [initialload, setInitialLoad] = useState(true);
  const [lastmodifideBy, setlastmodifideBy] = useState(); 
  const [modifiedBy, setmodifiedBy] = useState();
const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)




  const dispatch = useDispatch();

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);


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
      const body = { messageResources: selectedID.map((id) => ({ recordId: id })) };

      const response = await axios.post(`${api}/admin/messages/getedits`, body, { headers });
      const messageResources = response.data.messageResources || [];
      console.log(response, "messages");
      setlastmodifideBy(messageResources[0]?.lastModified || "");
      setmodifiedBy(messageResources[0]?.modifiedBy || "");
      setcreationTime(messageResources[0]?.creationTime || "");
      setcreator(messageResources[0]?.creator || "");
      setButtonActiveList(messageResources.map((plan) => plan.status === true));
      setEditInputfields(response.data.messageResources || []);
    } catch (err) {
      setError("Error fetching Datasource data");
    } finally {
      setLoading(false);
    }
  };
  const [errors, setErrors] = useState({});
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        return { ...item, [name]: value };
      }
      return item;
    });
    setEditInputfields(updatedFields);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

  };

  const handleTestPlanChange = (index, selectedTestPlanId) => {
    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        return { ...item, testPlanId: selectedTestPlanId }; // Update the testPlanId
      }
      return item;
    });
    setEditInputfields(updatedFields); // Update the state with the selected test plan
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
  
    });
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSaveClick = async () => {
    if (!validateForm()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        messageResources: editInputfields.map((item, index) => ({
          recordId: item.recordId,
          identifier: item.identifier || "-",
          shortDescription: item.shortDescription || "-",
          testPlanId: Number(item.testPlanId || "-"), 
          type: item.type || "-",
          percentFailure: item.percentFailure || "-",
          recipients: item.recipients || "-",
          status: buttonActiveList[index], 
        })),
      };
  
      // Await the axios response and store it in a variable
      const response = await axios.post(`${api}/admin/messages/edit`, body, { headers });
  
      // Show the success message and route to the new screen
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
      setError("Error saving Datasource data");
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
  

  const breadscrums = "Admin > Messages";
  const pagename = "Edit";
  const contentname = "Messages";


  return (
    <AddNewPageButtons
    lastmodifideBy={lastmodifideBy}
    modifiedBy={modifiedBy}
creator={creator}
    creationTime={creationTime}
      pagename={pagename}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
    >
  
      {
        loading ? (<>
          <div className="flex flex-row justify-center items-center w-full h-40">
          <div className="gap-5 flex flex-col items-center justify-center">
          <CircularProgress size={36} color="inherit" />
          <div>Loading...</div>
          </div>
            </div></>) :(<>
            {
              editInputfields.length < 1 ? (
                <div className="w-full flex flex-col  h-40 justify-center items-center">
                <div className="opacity-35 ">
                  <Lottie options={defaultOptions} height={100} width={100} />
                </div>
                <div>No data found...</div>
              </div>
              ) : (
                <>
                  <div
        className="flex flex-col w-full p-3 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        {editInputfields.map((item, index) => (
          <div key={item.recordId} className="flex flex-col bg-gray-200 rounded-md shadow mb-5">
            <div className="bg-white p-4 rounded-md shadow-md flex flex-col">
              <div className="grid grid-cols-3 gap-5 mb-4">
                <Toaster />
                <TextField
                                className="mt-5"
                  label="Enter Identifier"
                  variant="standard"
                  fullWidth
                  name="identifier"
                  value={item.identifier}
                  onChange={(e) => handleInputChange(index, e)}
                  error={!!errors[`identifier-${index}`]}
                              helperText={errors[`identifier-${index}`]}
                />
                <TextField
                className="mt-5"
                  label="Enter Description"
                  variant="standard"
                  fullWidth
                  name="shortDescription"
                  value={item.shortDescription}
                  onChange={(e) => handleInputChange(index, e)}
                  error={!!errors[`shortDescription-${index}`]}
                  helperText={errors[`shortDescription-${index}`]}
                />
               <div className="bt-4">
               <TestPlan initialLoad={initialload}
                  setTestPlan={(selectedTestPlanId) => handleTestPlanChange(index, selectedTestPlanId)} // Pass index to TestPlan
                  testPlan={testPlan}
                  existingTestPlan={item.testPlanId} // Pass the current testPlanId to the component
                />
               </div>
                <TextField
                 label="Enter the channel type"
                  variant="standard"
                  fullWidth
                  name="type"
                  value={item.type}
                  onChange={(e) => handleInputChange(index, e)}
                />
                <TextField
                 label="Enter failure condition value"
                 type="number"
                  variant="standard"
                  fullWidth
                  name="percentFailure"
                  value={item.percentFailure}
                  onChange={(e) => handleInputChange(index, e)}
                />
                <TextField
                  label="Enter the recipients"
                  variant="standard"
                  fullWidth
                  name="recipients"
                  value={item.recipients}
                  onChange={(e) => handleInputChange(index, e)}
                />
              </div>

              <div className="flex gap-4 items-center justify-end">
                <div
                  onClick={() => {
                    const updatedButtonActive = [...buttonActiveList];
                    updatedButtonActive[index] = !updatedButtonActive[index];
                    setButtonActiveList(updatedButtonActive);
                  }}
                  className={`${
                    buttonActiveList[index]
                      ? "bg-blue-500 text-white"
                      : "bg-white text-blue-500"
                  } border-2 border-blue-500 text-center cursor-pointer rounded-md text-xs px-2 py-0.5 w-[80px]`}
                >
                  {buttonActiveList[index] ? "Active" : "Inactive"}

                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
                </>
              )
            }
            </>)
      }



<ListingpageSuccessModal
          contentname={contentname}
          isOpen={listingPageSuccess}
          setIsModalOpen={setListingPageSuccess}
        />
    </AddNewPageButtons>
  );
};

export default EditMessages;
