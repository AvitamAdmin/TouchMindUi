"use client";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { TbClockEdit, TbClockPlus } from "react-icons/tb";
import { useRouter } from "next/navigation";
import axios from "axios";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditImpactConfig = () => {
  useEffect(() => {
    console.log("initial call");

    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handlefetchData(jwtToken);
      fetchLabelsData();

      console.log("JWT Token retrieved:", jwtToken);
    } else {
      console.log("No token found");
    }
  }, []);
  const [token, setToken] = useState("");
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [selectedFormat, setSelectedFormat] = useState(""); // For the file format dropdown
  const [editInputfields, seteditInputfields] = useState([]);
  const [buttonActiveList, setButtonActiveList] = useState([]);
  const [lablesList, setLablesList] = useState([]);
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false);
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();

  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
    displayPriority: "",
    path: "",
    parentNode: "",
  });

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const handleAddParamClick = (index) => {
    const updatedFields = [...editInputfields];
    if (!updatedFields[index].params) {
      updatedFields[index].params = [];
    }

    updatedFields[index].params.push("");
    seteditInputfields(updatedFields);
  };
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const fetchLabelsData = async () => {
    const token = getCookie("jwtToken");
    try {
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${api}/admin/impactConfig/add`, {
          headers,
        });

        // Sort labels alphabetically before setting the state
        const sortedLabels = (response.data.dashboardLabels || []).sort(
          (a, b) => a.localeCompare(b)
        );

        setLablesList(sortedLabels);
      }
    } catch (error) {
      console.error("Error fetching labels:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };
  const handleRemoveParamClick = (fieldIndex, paramIndex) => {
    seteditInputfields((prevFields) => {
      const updatedFields = prevFields.map((field, i) => {
        if (i === fieldIndex) {
          return {
            ...field,
            params: field.params.filter((_, pIndex) => pIndex !== paramIndex),
          };
        }
        return field;
      });
      return updatedFields;
    });
  };

  const handleParamChange = (fieldIndex, paramIndex, key, value) => {
    const updatedFields = [...editInputfields];
    const updatedParams = [...updatedFields[fieldIndex].params];

    updatedParams[paramIndex] = {
      ...updatedParams[paramIndex],
      [key]: value,
    };

    updatedFields[fieldIndex].params = updatedParams;
    seteditInputfields(updatedFields);
  };

  // Handle change for form inputs
  const [errors, setErrors] = useState({});
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        return { ...item, [name]: value };
      }
      return item;
    });
    seteditInputfields(updatedFields);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    let hasEmptySubsidiary = false;

    // Validate each field in editInputfields
    editInputfields.forEach((item, index) => {
      if (!item.identifier) {
        newErrors[`identifier-${index}`] = "Identifier is required.";
      }
      if (!item.shortDescription) {
        newErrors[`shortDescription-${index}`] = "Description is required.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePostClick = async () => {
    if (!validateForm()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        impactConfigs: editInputfields.map((item, index) => ({
          recordId: item.recordId,
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
          status: buttonActiveList[index],
          labels: item.params.map((param) => ({
            labels: param.labels || [],
            impact: param.impact || "",
            multiplier: param.multiplier || "",
          })),
        })),
      };

      // Await the API call
      const response = await axios.post(
        `${api}/admin/impactConfig/edit`,
        body,
        { headers }
      );

      console.log("Response from API:", response.data);

      // Navigate to another page after successful response
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
      console.error("Error saving data:", err);
      setError("Error saving Datasource data");
    } finally {
      setLoading(false); // Make sure to set loading false
    }
  };

  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

  const handlefetchData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        impactConfigs: selectedID.map((id) => ({ recordId: id })),
      };

      // Ensure that the API call is awaited
      const response = await axios.post(
        `${api}/admin/impactConfig/getedits`,
        body,
        { headers }
      );
      setLoading(false);
      console.log(response.data.impactConfigs, "response from API");
      const dataWithDefaults = response.data.impactConfigs.map((item) => ({
        ...item,

        params: item.labels || [],
      }));
      setlastmodifideBy(response.data.impactConfigs[0]?.lastModified || "");
      setmodifiedBy(response.data.impactConfigs[0]?.modifiedBy || "");
      setcreationTime(response.data.impactConfigs[0]?.creationTime || "");
      setcreator(response.data.impactConfigs[0]?.creator || "");

      seteditInputfields(dataWithDefaults);
      setButtonActiveList(
        response.data.impactConfigs.map((config) => config.status || false)
      );
    } catch (err) {
      setError("Error fetching Datasource data");
    } finally {
      setLoading(false);
    }
  };

  // Handle button toggle for active/inactive status
  const handleStatusToggle = (index) => {
    const updatedButtonActiveList = [...buttonActiveList];
    updatedButtonActiveList[index] = !updatedButtonActiveList[index];
    setButtonActiveList(updatedButtonActiveList);
  };

  const handleRunClick = () => {
    alert("Run function executed from EditImpactConfig!");
  };

  const pagename = "Edit";
  const breadscrums = "Admin > ImpactConfig";
  const contentname = "ImpactConfig";

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
              <div>No data found...</div>
            </div>
          ) : (
            <>
              <div className="p-2">
                <div className="flex flex-col bg-gray-200 p-2 gap-3 rounded-md">
                  {editInputfields.map((item, index) => (
                    <div
                      key={item.recordId}
                      className="bg-white p-2 rounded-md"
                    >
                      <div className="bg-white p-4 rounded-md shadow-md ">
                        <Toaster />
                        <div className="grid grid-cols-4 gap-5 mb-4">
                          <TextField
                            label="Identifier"
                            variant="standard"
                            className="text-xs"
                            name="identifier"
                            value={item.identifier || ""}
                            onChange={(e) => handleInputChange(index, e)} // Pass index
                            error={!!errors[`identifier-${index}`]}
                            helperText={errors[`identifier-${index}`]}
                          />
                          <TextField
                            label="Short Description"
                            variant="standard"
                            fullWidth
                            name="shortDescription"
                            value={item.shortDescription || ""}
                            onChange={(e) => handleInputChange(index, e)}
                            error={!!errors[`shortDescription-${index}`]}
                            helperText={errors[`shortDescription-${index}`]}
                          />
                        </div>
                        <div className="flex gap-4 items-center justify-end">
                          <div
                            onClick={() => handleStatusToggle(index)}
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
                      <div className="p-2 gap-2 flex flex-col">
                        <div className="flex flex-col mt-4 w-[100%]">
                          <div className="grid grid-cols-1 w-full gap-4">
                            {item.params &&
                              item.params.map((param, paramIndex) => (
                                <div
                                  key={paramIndex}
                                  className="items-center gap-5 flex flex-row w-[100%] p-2"
                                >
                                  <div className="w-[30%] b">
                                    <Autocomplete
                                      multiple // Enable multiple selection
                                      options={lablesList || []}
                                      getOptionLabel={(option) => option || ""}
                                      value={param.labels || []} // Ensure value is an array
                                      onChange={(event, newValue) => {
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "labels",
                                          newValue || []
                                        );
                                      }}
                                      isOptionEqualToValue={(option, value) =>
                                        option === value
                                      }
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Select Labels"
                                          variant="standard"
                                        />
                                      )}
                                    />
                                  </div>
                                  <div className="w-[30%] mt-4 ">
                                    <TextField
                                      type="number"
                                      className=" w-full"
                                      placeholder="Enter Impact"
                                      variant="standard"
                                      size="small"
                                      value={param.impact || ""}
                                      onChange={(e) =>
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "impact",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="w-[30%] mt-4 ">
                                    {" "}
                                    <TextField
                                      type="number"
                                      className="mt-5 w-full"
                                      placeholder="Enter Multiplier"
                                      variant="standard"
                                      size="small"
                                      value={param.multiplier || ""}
                                      onChange={(e) =>
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "multiplier",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="flex flex-row w-[10%] justify-center items-center">
                                    <div
                                      className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                                      onClick={() =>
                                        handleRemoveParamClick(
                                          index,
                                          paramIndex
                                        )
                                      }
                                      style={{ width: "30px", height: "30px" }}
                                    >
                                      <FaMinus />
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div
                            className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
                            onClick={() => handleAddParamClick(index)}
                            style={{ width: "120px", height: "40px" }}
                          >
                            Add label
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

export default EditImpactConfig;
