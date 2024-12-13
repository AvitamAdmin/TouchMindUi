"use client";
import React, { useState, useEffect } from "react";
import { FaMinus } from "react-icons/fa";
import { Autocomplete, MenuItem, TextField } from "@mui/material";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import Dashboard from "@/app/src/components/dropdown/Dashboard";
import CronJobProfile from "@/app/src/components/dropdown/CronJobProfile";
import { useRouter } from "next/navigation";
import cronjobProfile from "../../cronjobProfile/page";
import toast, { Toaster } from "react-hot-toast";
import CronCalculator from "@/app/src/components/modal/CronjobExpressionCalculator";
import { useSelector } from "react-redux";
// import "animate.css";

const addQacronjob = () => {
  const router = useRouter();
  const [ButtonActive, setButtonActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialload, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCronJobProfile, setSelectedCronJobProfile] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState([]);
  const [subsidiary, setSubsidiary] = useState([]);
  const [errors, setErrors] = useState({});
  const cronExpression = useSelector((state) => state.tasks.cronExpression);
  const [cronJobProfile, setCronJobProfile] = useState([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const [formValues, setFormValues] = useState({
    identifier: "",
    emailSubject: "",
    cronExpression: "",
    skus: "",
    campaign: "",
  });

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      getAllSubsidiaries();
      getcronJobProfiles(jwtToken);
    }
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // Function to handle removing a params set
  const handleRemoveParamClick = (index) => {
    setParams((prevParams) => prevParams.filter((_, i) => i !== index));
  };
  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    setParams(newParams);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const validateForm = () => {
    let newErrors = {};

    if (!formValues.identifier.trim()) {
      newErrors.identifier = "Identifier is required.";
    }

    if (selectedDashboard.length === 0) {
      toast.error("Please select Dashboard."); // Show toast error for node selection
    }
    if (selectedCronJobProfile.length === 0) {
      toast.error("Please select Cronjob profile."); // Show toast error for node selection
    }
    if (selectEnviroment.length === 0) {
      toast.error("Please select Environment."); // Show toast error for node selection
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSaveClick = async () => {
    setLoading(true); // Start loading state
    if (!validateForm()) return;
    try {
      console.log(token, "Token"); // Log the token for debugging
      const headers = { Authorization: `Bearer ${token}` };

      // Map through params to format input data
      const formattedInputs = params.map((input) => ({
        subsidiary: input.subsidiariedata,
        siteIsoCode: input.sitesdata,
        testProfile: input.testprofiledata,
        environment: input.environmentdata,
        testPlan: input.testplandata,
        categoryId: input.categorydata,
        cronProfileId: input.cronjobprofiledata,
      }));

      // Construct the request body
      const body = {
        cronJobs: [
          {
            cronTestPlanDtoList: formattedInputs,
            identifier: formValues.identifier,
            emailSubject: formValues.emailSubject,
            cronExpression: cronExpression,
            skus: formValues.skus,
            campaign: formValues.campaign,
            dashboard: selectedDashboard,
            cronProfileId: selectedCronJobProfile,
            envProfiles: selectEnviroment,
            status: ButtonActive, // Use button active status (true or false)
          },
        ],
      };

      console.log(body, "Request body from user"); // Log the request body

      // Send the POST request
      const response = await axios.post(`${api}/admin/qaCronJob/edit`, body, {
        headers,
      });

      console.log(response.data, "Response from API"); // Log the response data
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/qaCronJob");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      // Improved error handling
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data); // Log the response error from Axios
        setError(err.response?.data.message || "Error fetching qaCronJob data");
      } else {
        console.error(err); // Log non-Axios errors
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  const breadscrums = "Admin > qaCronJob";
  const pagename = "Add New";

  const enviromentFields = [
    {
      value: "stag",
      label: "Stag",
    },

    {
      value: "prod-two",
      label: "Prod-two ",
    },
    {
      value: "prod",
      label: "Prod ",
    },
    {
      value: "dashboard",
      label: "Dashboard",
    },
  ];

  const [selectEnviroment, setSelectEnviroment] = useState([]); // Local state to manage node data

  const handleCronJobProfileChange = (value) => {
    setSelectEnviroment(value); // Capture selected node
  };

  const getAllSubsidiaries = async () => {
    try {
      const response = await axios.get(api + "/admin/subsidiary/get");
      setSubsidiary(response.data.subsidiaries);
      // console.log(response.data.subsidiaries, "subsidiaries fetched");
    } catch (error) {
      console.log(error, "error fetching subsidiaries");
    }
  };
  const getcronJobProfiles = async (token) => {
    try {
      const headers = { Authorization: "Bearer " + token };
      console.log(token, "token from testProfile");
      const response = await axios.get(api + "/admin/cronjobProfile/get", {
        headers,
      });
      setCronJobProfile(response.data.cronJobProfiles);
      // console.log(response.data.categories, "categories fetched");
    } catch (error) {
      console.log("Error fetching environments", error);
    }
  };

  const [params, setParams] = useState([]);
  const handleAddParamClick = () => {
    setParams((prevParams) => [
      ...prevParams,
      {
        subsidiariedata: null,
        sitesdata: null,
        testprofiledata: null,
        environmentdata: null,
        testplandata: null,
        categorydata: null,
        cronjobprofiledata: null,
        environments: [],
        sitesList: [],
        testProfile: [],
        testPlanList: [],
        categoryList: [],
      },
    ]);
  };

  // Function to handle input field changes
  const handleInputFieldChange = (index, fieldName, value) => {
    setParams((prevParams) => {
      const updatedParams = [...prevParams];
      updatedParams[index] = {
        ...updatedParams[index],
        [fieldName]: value,
      };
      return updatedParams;
    });
  };

  const handlesubsidiaryChange = async (newValue, index) => {
    if (!newValue || !newValue.recordId) {
      console.log("Invalid subsidiary selected");
      return;
    }

    const recordId = newValue.recordId;
    const headers = { Authorization: "Bearer " + token };
    const body = { recordId };

    try {
      const [
        enviromentresponse,
        sitesresponse,
        testplanresponse,
        testprofileresponse,
        categoryresponse,
      ] = await Promise.all([
        axios.post(`${api}/qa/getEnvironmentsForSubsidiary`, body, { headers }),
        axios.post(`${api}/qa/getSitesForSubsidiary`, body, { headers }),
        axios.post(`${api}/qa/getTestPlanForSubsidiary`, body, { headers }),
        axios.post(`${api}/qa/getTestProfileForSubsidiary`, body, { headers }),
        axios.post(`${api}/qa/getCategoryForSubsidiary`, body, { headers }),
      ]);

      setParams((prevParams) =>
        prevParams.map((param, i) =>
          i === index
            ? {
                ...param,
                subsidiariedata: recordId,
                environments: enviromentresponse.data,
                sitesList: sitesresponse.data,
                testPlanList: testplanresponse.data,
                testProfile: testprofileresponse.data,
                categoryList: categoryresponse.data,
              }
            : param
        )
      );
    } catch (error) {
      console.error("Error fetching environments for subsidiary", error);
    }
  };

  const [addnewpagebtn, setaddnewpagebtn] = useState(true);

  return (
    <AddNewPageButtons
      setshow={addnewpagebtn}
      pagename={pagename}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
    >
      <div
        className="flex flex-col w-full  min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />
        <div className="bg-gray-200 flex flex-col pb-5 rounded-md">
          <div className="  w-[100%] flex items-center flex-row justify-center ">
            <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-3 pb-4 p-2">
              <div className="flex flex-col rounded-lg bg-white border-solid border-2 border-white w-full">
                <div className=" flex-row justify-between grid grid-cols-3 gap-3">
                  <TextField
                    required
                    id="standard-textarea"
                    label="Identifier"
                    variant="standard"
                    name="identifier"
                    value={formValues.identifier}
                    onChange={handleInputChange}
                    error={!!errors.identifier}
                    helperText={errors.identifier}
                  />
                  <TextField
                    id="standard-textarea"
                    label="Email Subject"
                    variant="standard"
                    name="emailSubject"
                    value={formValues.emailSubject}
                    onChange={handleInputChange}
                  />

                  <Dashboard
                    initialLoad={initialload}
                    selectedDashboard={selectedDashboard}
                    setSelectedDashboard={setSelectedDashboard}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 items-center justify-center  flex-col">
                <TextField
                  id="standard-textarea"
                  label="Cronjob Expression"
                  placeholder="* * * * * *"
                  variant="standard"
                  onClick={openModal}
                  name="cronExpression"
                  value={cronExpression}
                  onChange={handleInputChange}
                />

                <CronCalculator
                  isOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                />

                <CronJobProfile
                  initialLoad={initialload}
                  selectedCronJobProfile={selectedCronJobProfile}
                  setSelectedCronJobProfile={setSelectedCronJobProfile}
                />

                <Autocomplete
                  multiple
                  size="small"
                  options={enviromentFields} // List of all environment types
                  getOptionLabel={(option) => option.label} // Display 'label' for the dropdown options
                  value={selectEnviroment.map(
                    (env) =>
                      enviromentFields.find((item) => item.value === env) ||
                      null
                  )} // Map back to full option objects based on stored values
                  onChange={(event, newValue) => {
                    // Set only the values of the selected items
                    const selectedValues = newValue.map(
                      (option) => option.value
                    );
                    handleCronJobProfileChange(selectedValues); // Update the state with the array of values
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Select Environment Type"
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 ">
                <div className="flex flex-row gap-3 items-center w-full justify-end">
                  {ButtonActive == false ? (
                    <div
                      onClick={() => setButtonActive(!ButtonActive)}
                      className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Inactive
                    </div>
                  ) : (
                    <div
                      onClick={() => setButtonActive(!ButtonActive)}
                      className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Active
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row w-full p-3 justify-between gap-5">
            <div className="flex flex-row w-[50%]">
              <textarea
                placeholder="Enter SKU's "
                className="w-full h-44 border-solid border-2 border-gray-300 rounded-md p-2"
                name="skus"
                value={formValues.skus}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-row w-[50%]">
              <textarea
                placeholder="Enter campaign"
                className="w-full h-44 border-solid border-2 border-gray-300 rounded-md p-2"
                name="campaign"
                value={formValues.campaign}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4 p-4 w-[100%]">
          <div className="flex-row gap-4 w-[100%] grid grid-cols-1">
            {params.map((param, index) => (
              <div
                key={index}
                className="grid grid-cols-4 flex-row items-center bg-white pb-2 rounded-md gap-5 justify-between p-2"
              >
                {/* Subsidiary Dropdown */}
                <Autocomplete
                  options={subsidiary || []}
                  getOptionLabel={(option) => option.identifier || ""}
                  value={
                    subsidiary.find(
                      (subs) => subs.recordId === param.subsidiariedata
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "subsidiariedata",
                      newValue?.recordId || ""
                    );
                    handlesubsidiaryChange(newValue, index);
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.recordId === value?.recordId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Subsidiary"
                      variant="standard"
                    />
                  )}
                />

                {/* Sites Dropdown */}
                <Autocomplete
                  options={param.sitesList || []}
                  getOptionLabel={(option) => option.identifier || ""}
                  value={
                    param.sitesList.find(
                      (site) => site.recordId === param.sitesdata
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "sitesdata",
                      newValue?.recordId || ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.recordId === value?.recordId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Sites"
                      variant="standard"
                    />
                  )}
                />

                {/* Test Profile Dropdown */}
                <Autocomplete
                  options={param.testProfile || []}
                  getOptionLabel={(option) => option.identifier || ""}
                  value={
                    param.testProfile.find(
                      (profile) => profile.recordId === param.testprofiledata
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "testprofiledata",
                      newValue?.recordId || ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.recordId === value?.recordId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Test Profile"
                      variant="standard"
                    />
                  )}
                />

                {/* Environment Dropdown */}
                <Autocomplete
                  options={param.environments || []}
                  getOptionLabel={(option) => option.identifier || ""}
                  value={
                    param.environments.find(
                      (env) => env.recordId === param.environmentdata
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "environmentdata",
                      newValue?.recordId || ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.recordId === value?.recordId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Environment"
                      variant="standard"
                    />
                  )}
                />

                {/* Test Plan Dropdown */}
                <Autocomplete
                  options={param.testPlanList || []}
                  getOptionLabel={(option) => option.identifier || ""}
                  value={
                    param.testPlanList.find(
                      (plan) => plan.recordId === param.testplandata
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "testplandata",
                      newValue?.recordId || ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.recordId === value?.recordId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Test Plan"
                      variant="standard"
                    />
                  )}
                />

                {/* Category Dropdown */}
                <Autocomplete
                  options={param.categoryList || []}
                  getOptionLabel={(option) => option.identifier || ""}
                  value={
                    param.categoryList.find(
                      (category) => category.recordId === param.categorydata
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "categorydata",
                      newValue?.recordId || ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.recordId === value?.recordId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Category"
                      variant="standard"
                    />
                  )}
                />

                {/* Cronjob Profile Dropdown */}
                <Autocomplete
                  options={cronJobProfile || []} // Ensures cronjobProfile is an array
                  getOptionLabel={(option) => option.identifier || ""}
                  value={
                    (cronJobProfile || []).find(
                      (cronjob) => cronjob.recordId === param.cronjobprofiledata
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "cronjobprofiledata",
                      newValue?.recordId || ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.recordId === value?.recordId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Cronjob Profile"
                      variant="standard"
                    />
                  )}
                />

                {/* Remove Button */}
                <div
                  className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                  onClick={() => handleRemoveParamClick(index)}
                  style={{ width: "30px", height: "30px" }}
                >
                  <FaMinus />
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <div
            className="flex items-center justify-center w-36 mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
            onClick={handleAddParamClick}
          >
            Add Test Plan
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default addQacronjob;
