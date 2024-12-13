"use client";
import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import toast, { Toaster } from "react-hot-toast";
import { FaMinus } from "react-icons/fa";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditDashboardProfile = () => {
  const [formValuesList, setFormValuesList] = useState([]);
  const [buttonActiveList, setButtonActiveList] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [editInputfields, seteditInputfields] = useState([]);
  const [lablesList, setLablesList] = useState([]);
  const [email, setEmail] = useState("");
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

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
      fetchLabelsData(jwtToken);
    }
  }, []);

  const fetchLabelsData = async (jwtToken) => {
    console.log("logged labels");
    // const token = getCookie("jwtToken");
    try {
      if (jwtToken) {
        const headers = { Authorization: `Bearer ${jwtToken}` };
        const response = await axios.get(`${api}/admin/dashboardProfile/add`, {
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
  const handleAddParamClick = (index) => {
    seteditInputfields((prevFields) => {
      const updatedFields = [...prevFields];

      // Ensure the field at the index exists with params initialized
      if (!updatedFields[index]) {
        updatedFields[index] = { params: [] };
      }

      // Add a new param to the params array
      updatedFields[index] = {
        ...updatedFields[index],
        params: [...updatedFields[index].params, { parent: "", children: [] }],
      };

      return updatedFields;
    });
  };

  const handleRemoveParamClick = (fieldIndex, paramIndex) => {
    seteditInputfields((prevFields) => {
      const updatedFields = [...prevFields];

      // Ensure the field and params exist
      const field = updatedFields[fieldIndex];
      if (field?.params) {
        // Remove the specific param immutably
        updatedFields[fieldIndex] = {
          ...field,
          params: field.params.filter((_, i) => i !== paramIndex),
        };
      }

      return updatedFields;
    });
  };

  const handleParamChange = (fieldIndex, paramIndex, key, value) => {
    seteditInputfields((prevFields) => {
      const updatedFields = [...prevFields]; // Shallow copy of fields
      const updatedParams = [...updatedFields[fieldIndex].params]; // Copy params

      updatedParams[paramIndex] = {
        ...updatedParams[paramIndex],
        [key]: value, // Update the specific key
      };

      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        params: updatedParams, // Assign updated params
      };

      return updatedFields; // Return new state
    });
  };

  const handleFetchData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        dashboardProfiles: selectedID.map((id) => ({ recordId: id })),
      };

      const response = await axios.post(
        `${api}/admin/dashboardProfile/getedits`,
        body,
        { headers }
      );

      const dashboardProfiles = response.data.dashboardProfiles || [];

      // Ensure params is always initialized as an array of objects
      seteditInputfields(
        dashboardProfiles.map((item) => ({
          recordId: item.recordId || "",
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
          params: item.labels || [], // Ensure params is always an array
        }))
      );
      setlastmodifideBy(dashboardProfiles[0]?.lastModified || "");
      setmodifiedBy(dashboardProfiles[0]?.modifiedBy || "");
      setcreationTime(dashboardProfiles[0]?.creationTime || "");
      setcreator(dashboardProfiles[0]?.creator || "");
      setButtonActiveList(
        dashboardProfiles.map((item) => item.status === true)
      );
    } catch (err) {
      setError("Error fetching dashboard profile data");
    } finally {
      setLoading(false);
    }
  };

  const [errors, setErrors] = useState({});
  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFormValues = [...editInputfields];
    updatedFormValues[index][name] = value;
    seteditInputfields(updatedFormValues);
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
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;
    try {
      console.log(token, "handleSaveClick btn trigreed");
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        dashboardProfiles: editInputfields.map((formValues, index) => ({
          recordId: formValues.recordId,
          identifier: formValues.identifier,
          shortDescription: formValues.shortDescription,
          status: buttonActiveList[index],
          labels: formValues.params.map((param) => ({
            children: param.children || [],
            parent: param.parent || "",
          })),
        })),
      };

      const response = await axios.post(
        `${api}/admin/dashboardProfile/edit`,
        body,
        { headers }
      );
      console.log(response, "response from body");
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

  const breadscrums = "Admin > Dashboard Profile";
  const pagename = "Edit";
  const contentname = "Dashboard Profile";


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
              <div>No data found...</div>
            </div>
          ) : (
            <>
              <div className="flex flex-col w-full p-3 min-h-screen gap-5">
                {editInputfields.map((formValues, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-gray-200 rounded-md shadow mb-5"
                  >
                    <Toaster />
                    <div className="bg-white flex flex-col gap-5 p-4 rounded-md shadow-md">
                      <div className="grid grid-cols-2 gap-4 mb-4">
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
                      </div>
                      <div className="flex  justify-end w-full">
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

                      <div className="p-2 gap-2 flex flex-col">
                        <div className="flex flex-col  w-[100%]">
                          <div className="grid grid-cols-1 w-full gap-4">
                            {formValues.params &&
                              formValues.params.map((param, paramIndex) => (
                                <div
                                  key={paramIndex}
                                  className="items-center gap-5 flex flex-row w-[100%] p-2"
                                >
                                  <div className="w-[45%] ">
                                    <Autocomplete
                                      options={lablesList || []}
                                      getOptionLabel={(option) => option || ""}
                                      value={param.parent || null} // Ensure value is not undefined
                                      onChange={(event, newValue) =>
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "parent",
                                          newValue || null
                                        )
                                      }
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
                                  <div className="w-[45%] ">
                                    <Autocomplete
                                      multiple
                                      options={lablesList || []}
                                      getOptionLabel={(option) => option || ""}
                                      value={param.children || []} // Ensure value is an array
                                      onChange={(event, newValue) =>
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "children",
                                          newValue || []
                                        )
                                      }
                                      isOptionEqualToValue={(option, value) =>
                                        option === value
                                      }
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Select Children Labels"
                                          variant="standard"
                                        />
                                      )}
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

export default EditDashboardProfile;
