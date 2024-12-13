"use client";
import React, { useEffect, useState } from "react";
import { FaMinus } from "react-icons/fa";
import { CircularProgress, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import NodeDropdown from "@/app/src/components/dropdown/Node";
import MappingDropdown from "@/app/src/components/dropdown/Mapping";
import SitesDropdown from "@/app/src/components/dropdown/Sites";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import Models from "@/app/src/components/dropdown/Models";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import toast, { Toaster } from "react-hot-toast";
import CronCalculator from "@/app/src/components/modal/CronjobExpressionCalculator";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditScheduler = () => {
  useEffect(() => {
    console.log("initial call");

    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handlefetchData(jwtToken);

      // console.log("JWT Token retrieved:", jwtToken);
    } else {
      console.log("No token found");
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
  const [token, setToken] = useState("");
  const [params, setParams] = useState([]);

  const [initialload, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [editInputfields, seteditInputfields] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reset, setReset] = useState(false);
  const [buttonActiveList, setButtonActiveList] = useState([]);
  const [historyActiveList, setHistoryActiveList] = useState([]);
  const [errors, setErrors] = useState({});
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();

  const dispatch = useDispatch();
  const cronExpression = useSelector((state) => state.tasks.cronExpression);
  console.log(cronExpression, "cronExpression cronExpression");

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleRemoveParamClick = (index) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };

  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    setParams(newParams);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  // Handle change for form inputs
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        // Update the specific field based on the name
        return { ...item, [name]: value }; // Update other fields normally
      }
      return item; // Return the unchanged item for other indexes
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    seteditInputfields(updatedFields); // Update the state with modified fields
  };

  const validateForm = () => {
    let newErrors = {};
    let hasEmptySubsidiary = false;

    // Validate each field in editInputfields
    editInputfields.forEach((item, index) => {
      if (!item.identifier.trim()) {
        newErrors[`identifier-${index}`] = "Identifier is required.";
      }
      if (!item.cronId || item.cronId.length === 0) {
        toast.error(`Please select Interface for item at index ${index + 1}`);
      }
      if (!item.shortcuts || item.shortcuts.length === 0) {
        toast.error(`Please select Model for item at index ${index + 1}`);
      }

      if (!item.subsidiary || item.subsidiary.length === 0) {
        toast.error(`Please select Subsidiary for item at index ${index + 1}`);
        hasEmptySubsidiary = true;
      }
      if (!item.mapping || item.mapping.length === 0) {
        toast.error(`Please select Mapping for item at index ${index + 1}`);
      }
      if (!item.sites || item.sites.length === 0) {
        toast.error(`Please select Sites for item at index ${index + 1}`);
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !hasEmptySubsidiary;
  };

  const handlePostClick = async () => {
    if (!validateForm()) return;

    console.log("Save button clicked"); // Debugging

    // Validation: Check if subsidiary is selected
    const hasEmptySubsidiary = editInputfields.some(
      (item) => !item.subsidiary || item.subsidiary.length === 0
    );

    if (hasEmptySubsidiary) {
      toast.error("Please select Subsidiary");
      return;
      d; // Stop the function execution if subsidiary is empty
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        schedulerJobs: editInputfields.map((item, index) => ({
          recordId: item.recordId,
          identifier: item.identifier || "-",
          cronId: item.cronId || "",
          cronExpression: cronExpression || "",
          sites: item.sites || [],
          shortcuts: item.shortcuts || "",
          subsidiary: item.subsidiary || [], // Subsidiary should now be validated
          mapping: item.mapping || [],
          skus: item.skus || "",
          enableHistory: historyActiveList[index],
          status: buttonActiveList[index],
        })),
      };

      console.log("Sending request with body:", body); // Debugging
      const response = await axios.post(`${api}/admin/scheduler/edit`, body, {
        headers,
      });
      console.log("Response from API:", response.data); // Debugging
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

      // Clear edit record ids and redirect after successful API call
    } catch (err) {
      setError("Error saving Scheduler data");
      console.error("Error:", err);
    }
  };

  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

  const handlefetchData = async (jwtToken) => {
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      console.log(selectedID, "selectedID:");
      // Convert selectedID array to a comma-separated string
      const body = {
        schedulerJobs: selectedID.map((id) => ({ recordId: id })),
      };

      // // Use the correct method and pass params in the config for GET request
      const response = await axios.post(
        `${api}/admin/scheduler/getedits`,
        body,
        {
          headers,
        }
      );
      setlastmodifideBy(response.data.schedulerJobs[0]?.lastModified || "");
      setmodifiedBy(response.data.schedulerJobs[0]?.modifiedBy || "");
      setcreationTime(response.data.schedulerJobs[0]?.creationTime || "");
      setcreator(response.data.schedulerJobs[0]?.creator || "");
      const schedulerJobs = response.data.schedulerJobs || [];
      setButtonActiveList(schedulerJobs.map((item) => item.status === true));
      setHistoryActiveList(
        schedulerJobs.map((item) => item.enableHistory === true)
      );

      console.log(schedulerJobs, "response from API");
      seteditInputfields(schedulerJobs);
    } catch (err) {
      setError("Error fetching Datasource data");
    } finally {
      setLoading(false);
    }
  };

  const handleRunClick = () => {
    alert("Run function executed from EditScheduler!");
  };

  const pagename = "Edit";
  const breadscrums = "Admin > Scheduler";
  const contentname = "Scheduler";


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
            <>
              <div className="p-2">
                <Toaster />
                <div className="flex flex-col bg-gray-200 p-2 gap-3 rounded-md">
                  {editInputfields.map((item, index) => (
                    <div className="bg-gray-200 flex flex-col pb-5 rounded-md">
                      <div className="  w-[100%] flex items-center flex-row justify-center ">
                        <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
                          <div className=" w-full grid grid-cols-4  gap-10 p-2 ">
                            <div className="mt-6">
                              <NodeDropdown
                                dropdownName="Select Interface"
                                initialload={initialload}
                                selectedNode={item.cronId}
                                setSelectedNode={(newNode) => {
                                  // Update the specific item's subsidiary value in editInputfields
                                  const updatedFields = [...editInputfields];
                                  updatedFields[index] = {
                                    ...item,
                                    cronId: newNode, // Update this to reflect the new value
                                  };
                                  seteditInputfields(updatedFields);
                                }}
                              />
                            </div>
                            <div className="mt-6">
                              <TextField
                                required
                                label="Short Identifier"
                                variant="standard"
                                className="text-xs"
                                name="identifier"
                                value={item.identifier || ""}
                                onChange={(e) => handleInputChange(e, index)}
                                error={!!errors[`identifier-${index}`]}
                                helperText={errors[`identifier-${index}`]}
                                fullWidth
                              />
                            </div>

                            <div className="mt-6">
                              <MappingDropdown
                                initialload={initialload}
                                mapping={item.mapping} // Use item.mapping to set the value for the specific item
                                setMapping={(newMapping) => {
                                  // Update the specific item's mapping value in editInputfields
                                  const updatedFields = [...editInputfields];
                                  updatedFields[index] = {
                                    ...item,
                                    mapping: newMapping,
                                  };
                                  seteditInputfields(updatedFields);
                                }}
                              />
                            </div>

                            <div className="mt-6">
                              <SingleSelectSubsidiary
                                initialload={initialload}
                                selectedSubsidiary={item.subsidiary}
                                setSelectedSubsidiary={(newSubsidiary) => {
                                  // Update the specific item's subsidiary value in editInputfields
                                  const updatedFields = [...editInputfields];
                                  updatedFields[index] = {
                                    ...item,
                                    subsidiary: newSubsidiary, // Update this to reflect the new value
                                  };
                                  seteditInputfields(updatedFields);
                                }}
                              />
                            </div>
                          </div>

                          <div className=" w-full grid grid-cols-4  gap-10 p-2 ">
                            <div className="w-full items-center flex-row flex">
                              <TextField
                                id="standard-textarea"
                                label="Cronjob Expression"
                                placeholder="Placeholder"
                                multiline
                                variant="standard"
                                onClick={openModal}
                                name="cronExpression"
                                value={cronExpression || item.cronExpression}
                                onChange={handleInputChange}
                                fullWidth
                              />

                              <CronCalculator
                                isOpen={isModalOpen}
                                setIsModalOpen={setIsModalOpen}
                              />
                            </div>
                            <div>
                              <SitesDropdown
                                initialload={initialload}
                                sites={item.sites} // Ensure the correct sites value is passed
                                setSites={(newSites) => {
                                  // Update the specific item's sites value in editInputfields
                                  const updatedFields = [...editInputfields];
                                  updatedFields[index] = {
                                    ...item,
                                    sites: newSites,
                                  };
                                  seteditInputfields(updatedFields);
                                }}
                              />
                            </div>
                          </div>

                          <div className=" gap-4 mb-4 items-center w-full justify-end flex-row flex p-2">
                            <div className=" flex flex-row items-center justify-center gap-7">
                              <div>
                                <div
                                  onClick={() => {
                                    const updatedButtonActive = [
                                      ...buttonActiveList,
                                    ];
                                    updatedButtonActive[index] =
                                      !updatedButtonActive[index];
                                    setButtonActiveList(updatedButtonActive);
                                  }}
                                  className={`${
                                    buttonActiveList[index]
                                      ? "bg-blue-500 text-white"
                                      : "bg-white text-blue-500"
                                  } border-2 border-blue-500 rounded-md text-center cursor-pointer text-xs w-[80px] px-2 py-0.5`}
                                >
                                  {buttonActiveList[index]
                                    ? "Active"
                                    : "Inactive"}
                                </div>
                              </div>
                              <div>
                                <div
                                  onClick={() => {
                                    const updatedHistoryActive = [
                                      ...historyActiveList,
                                    ];
                                    updatedHistoryActive[index] =
                                      !updatedHistoryActive[index];
                                    setHistoryActiveList(updatedHistoryActive);
                                  }}
                                  className={`${
                                    historyActiveList[index]
                                      ? "bg-blue-500 text-white"
                                      : "bg-white text-blue-500"
                                  } border-2 border-blue-500 rounded-md text-center cursor-pointer text-xs px-2 py-0.5 w-[100px]`}
                                >
                                  {historyActiveList[index]
                                    ? "Save History"
                                    : "Unsave"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex flex-col gap-3">
                          <div className="font-bold">Please enter SKU's</div>
                          <div className="flex flex-row gap-7 items-center">
                            <textarea
                              name="skus"
                              value={item.skus || ""}
                              onChange={(e) => handleInputChange(e, index)}
                              className="w-[100%] h-52 border-solid border-2 border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="p-2">
                          <Models
                            initialload={initialload}
                            Model={item.shortcuts} // Pass the existing data
                            setModel={(newModel) => {
                              // Update the specific item's shortcuts value in editInputfields
                              const updatedFields = [...editInputfields];
                              updatedFields[index] = {
                                ...item,
                                shortcuts: newModel,
                              };
                              seteditInputfields(updatedFields);
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-3 w-full">
                        {reset && (
                          <div className="flex flex-col w-full justify-center items-center">
                            <div
                              className="bg-[#cc0001]  py-1 w-[100px] text-center cursor-pointer rounded-md text-white justify-center items-center"
                              onClick={() => setReset(!reset)}
                            >
                              Reset all
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 gap-2 flex flex-col">
                  <div className="flex flex-col mt-4 w-[100%]">
                    <div className="grid grid-cols-3 gap-4">
                      {params.map((param, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <TextField
                            placeholder="Enter Param Here"
                            variant="outlined"
                            size="small"
                            value={param}
                            onChange={(e) =>
                              handleParamChange(index, e.target.value)
                            }
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
                    {/* <div
              className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
              onClick={handleAddParamClick}
              style={{ width: "100px", height: "40px" }}
            >
              Add Param
            </div> */}
                  </div>
                </div>
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

export default EditScheduler;
