"use client";
import React, { useEffect, useState } from "react";
import { FaMinus } from "react-icons/fa";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import Dashboard from "@/app/src/components/dropdown/Dashboard";
import CronJobProfile from "@/app/src/components/dropdown/CronJobProfile";
import toast, { Toaster } from "react-hot-toast";
import CronCalculator from "@/app/src/components/modal/CronjobExpressionCalculator";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditQACronJob = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [initialload, setInitialLoad] = useState(true);
  const [email, setEmail] = useState("");
  const [editInputfields, seteditInputfields] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subsidiary, setSubsidiary] = useState([]);
  const [cronJobProfile, setCronJobProfile] = useState([]);
  const [errors, setErrors] = useState({});
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)

  const openModal = () => {
    setIsModalOpen(true);
  };
  const dispatch = useDispatch();
  const cronExpression = useSelector((state) => state.tasks.cronExpression);

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
      handlefetchData(jwtToken);
      getAllSubsidiaries();
      getcronJobProfiles(jwtToken);
    } else {
      console.log("No token found");
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleInputChange = (e, index, paramIndex = null) => {
    const { name, value } = e.target;

    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        if (name === "parentNode") {
          return {
            ...item,
            parentNode: { ...item.parentNode, identifier: value },
          };
        }

        if (name === "envProfiles") {
          return {
            ...item,
            envProfiles: value,
          };
        }

        return { ...item, [name]: value };
      }
      return item;
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    seteditInputfields(updatedFields);
  };

  const validateForm = () => {
    let newErrors = {};
    let hasEmptySubsidiary = false;

    // Validate each field in editInputfields
    editInputfields.forEach((item, index) => {
      if (!item.identifier.trim()) {
        newErrors[`identifier-${index}`] = "Identifier is required.";
      }

      if (!item.dashboard || item.dashboard.length === 0) {
        toast.error(`Please select dashboard for item at index ${index + 1}`); // Show toast error for node selection
      }
      if (!item.envProfiles || item.envProfiles.length === 0) {
        toast.error(`Please select environment for item at index ${index + 1}`); // Show toast error for node selection
      }
      if (!item.cronProfileId || item.cronProfileId.length === 0) {
        toast.error(`Please select Cronprofile for item at index ${index + 1}`); // Show toast error for node selection
      }

      // if (!item.subsidiary || item.subsidiary.length === 0) {
      //   toast.error(`Please select Subsidiary for item at index ${index + 1}`);
      //   hasEmptySubsidiary = true;
      // }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !hasEmptySubsidiary;
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

  const handleAddParamClick = (index) => {
    const updatedFields = [...editInputfields];
    if (!updatedFields[index].params) {
      updatedFields[index].params = [];
    }

    updatedFields[index].params.push("");
    seteditInputfields(updatedFields);
  };

  const handleRemoveParamClick = (index, paramIndex) => {
    // Update editInputfields by removing the specified parameter at paramIndex
    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          params: item.params.filter((_, pIndex) => pIndex !== paramIndex),
        };
      }
      return item;
    });
    seteditInputfields(updatedFields);
  };

  const handleParamChange = (fieldIndex, paramIndex, key, value) => {
    console.log(
      `FieldIndex: ${fieldIndex}, ParamIndex: ${paramIndex}, Key: ${key}, Value: ${value}`
    );
    seteditInputfields((prevFields) =>
      prevFields.map((field, fIndex) =>
        fIndex === fieldIndex
          ? {
              ...field,
              params: field.params.map((param, pIndex) =>
                pIndex === paramIndex ? { ...param, [key]: value } : param
              ),
            }
          : field
      )
    );
  };

  const handleDatasourceChange = async (e, index, paramIndex = null) => {
    const { name, value } = e.target;
    const updatedFields = [...editInputfields];

    if (paramIndex !== null) {
      updatedFields[index].params[paramIndex] = {
        ...updatedFields[index].params[paramIndex],
        [name]: value,
      };

      if (name === "subsidiary") {
        const subsidiaryId = value;
        const headers = { Authorization: `Bearer ${token}` };

        // Set loading state here if you have one

        try {
          const [
            environmentResponse,
            sitesResponse,
            testPlanResponse,
            testProfileResponse,
            categoryResponse,
          ] = await Promise.all([
            axios.post(
              `${api}/qa/getEnvironmentsForSubsidiary`,
              { recordId: subsidiaryId },
              { headers }
            ),
            axios.post(
              `${api}/qa/getSitesForSubsidiary`,
              { recordId: subsidiaryId },
              { headers }
            ),
            axios.post(
              `${api}/qa/getTestPlanForSubsidiary`,
              { recordId: subsidiaryId },
              { headers }
            ),
            axios.post(
              `${api}/qa/getTestProfileForSubsidiary`,
              { recordId: subsidiaryId },
              { headers }
            ),
            axios.post(
              `${api}/qa/getCategoryForSubsidiary`,
              { recordId: subsidiaryId },
              { headers }
            ),
          ]);

          updatedFields[index].params[paramIndex] = {
            ...updatedFields[index].params[paramIndex],
            subsidiary: subsidiaryId,
            environments: environmentResponse.data || "",
            siteIsoCodes: sitesResponse.data || "",
            testProfiles: testProfileResponse.data || "",
            testPlans: testPlanResponse.data || "",
            categoryIds: categoryResponse.data || "",
          };

          console.log(updatedFields, "categoryResponse.data");
        } catch (error) {
          console.error("Error fetching data for subsidiary", error);
          toast.error("Error fetching data for subsidiary");
        } finally {
          // Turn off loading state
          setLoading(false);
        }
      }
    } else {
      updatedFields[index] = { ...updatedFields[index], [name]: value };
    }

    // Update the state once at the end of the function
    seteditInputfields(updatedFields);
  };

  const handlePostClick = async () => {
    if (!validateForm()) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const body = {
        cronJobs: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "",
          emailSubject: item.emailSubject || "",
          dashboard: item.dashboard || "",
          cronExpression: cronExpression || item.cronExpression,
          cronProfileId: item.cronProfileId || "",
          envProfiles: item.envProfiles || "",
          skus: item.skus || "",
          campaign: item.campaign || "",
          status: item.ButtonActive,
          cronTestPlanDtoList: Array.isArray(item.params)
            ? item.params.map((param) => ({
                categoryId: param.categoryId || "",
                cronProfileId: param.cronProfileId || "",
                environment: param.environment || "",
                siteIsoCode: param.siteIsoCode || "",
                subsidiary: param.subsidiary || "",
                testPlan: param.testPlan || "",
                testProfile: param.testProfile || "",
              }))
            : [],
        })),
      };

      console.log(body, "req body from user");

      const response = await axios.post(`${api}/admin/qaCronJob/edit`, body, {
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

      console.log(response.data, "response from API");
    } catch (err) {
      setError("Error saving Datasource data");
      console.error(err);
    }
  };

  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

  // Add this code after you set the editInputfields in the handlefetchData function
  const handlefetchData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = { cronJobs: selectedID.map((id) => ({ recordId: id })) };

      const response = await axios.post(
        `${api}/admin/qaCronJob/getedits`,
        body,
        { headers }
      );
      setLoading(false);

      setlastmodifideBy(response.data.cronJobs[0]?.lastModified || "");
      setmodifiedBy(response.data.cronJobs[0]?.modifiedBy || "");
      setcreationTime(response.data.cronJobs[0]?.creationTime || "");
      setcreator(response.data.cronJobs[0]?.creator || "");

      if (Array.isArray(response.data.cronJobs)) {
        const cronJobs = response.data.cronJobs.map((item) => ({
          ...item,
          ButtonActive: item.status || false,
          params: item.cronTestPlanDtoList || [],
        }));
        seteditInputfields(cronJobs);

        // Loop through each cronJob and its cronTestPlanDtoList to call handleDatasourceChange
        response.data.cronJobs.forEach((cronJob, index) => {
          cronJob.cronTestPlanDtoList.forEach((param, paramIndex) => {
            // Pass the subsidiary ID to handleDatasourceChange
            handleDatasourceChangeWithAPIFetch(
              param.subsidiary,
              index,
              paramIndex,
              headers
            );
          });
        });
      } else {
        seteditInputfields([]);
      }
    } catch (err) {
      setError("Error fetching Datasource data");
    } finally {
      setLoading(false);
    }
  };

  // New helper function to handle datasource change and API fetching
  const handleDatasourceChangeWithAPIFetch = async (
    subsidiaryId,
    index,
    paramIndex,
    headers
  ) => {
    if (!subsidiaryId) return;

    try {
      const [
        environmentResponse,
        sitesResponse,
        testPlanResponse,
        testProfileResponse,
        categoryResponse,
      ] = await Promise.all([
        axios.post(
          `${api}/qa/getEnvironmentsForSubsidiary`,
          { recordId: subsidiaryId },
          { headers }
        ),
        axios.post(
          `${api}/qa/getSitesForSubsidiary`,
          { recordId: subsidiaryId },
          { headers }
        ),
        axios.post(
          `${api}/qa/getTestPlanForSubsidiary`,
          { recordId: subsidiaryId },
          { headers }
        ),
        axios.post(
          `${api}/qa/getTestProfileForSubsidiary`,
          { recordId: subsidiaryId },
          { headers }
        ),
        axios.post(
          `${api}/qa/getCategoryForSubsidiary`,
          { recordId: subsidiaryId },
          { headers }
        ),
      ]);

      // Use functional update form of setEditInputfields to ensure safe access to state
      seteditInputfields((prevFields) => {
        const updatedFields = [...prevFields];

        if (!updatedFields[index].params) {
          updatedFields[index].params = [];
        }

        updatedFields[index].params[paramIndex] = {
          ...updatedFields[index].params[paramIndex],
          subsidiary: subsidiaryId,
          environments: environmentResponse.data || "",
          siteIsoCodes: sitesResponse.data || "",
          testProfiles: testProfileResponse.data || "",
          testPlans: testPlanResponse.data || "",
          categoryIds: categoryResponse.data || "",
        };

        return updatedFields;
      });
    } catch (err) {
      console.error("Error fetching subsidiary data:", err);
    }
  };

  const pagename = "Edit";
  const breadscrums = "Admin > QACronJob";
  const contentname = "QACronJob";


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

  const handleToggleButtonActive = (index) => {
    seteditInputfields((prevFields) => {
      return prevFields.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            ButtonActive: !item.ButtonActive,
          };
        }
        return item;
      });
    });
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
    >
      {loading ? (
        <div className="flex flex-row justify-center items-center w-full h-40">
          <div className="gap-5 flex flex-col items-center justify-center">
            <CircularProgress size={36} color="inherit" />
            <div>Loading...</div>
          </div>
        </div>
      ) : (
        <div className="p-2">
          {!editInputfields || editInputfields.length < 1 ? (
            <div className="w-full flex flex-col h-40 justify-center items-center">
              <div className="opacity-10 ">
                <Lottie options={defaultOptions} height={100} width={100} />
              </div>
              <div>No data found...</div>
            </div>
          ) : (
            <div className="p-2">
              <div className="flex flex-col bg-gray-200 p-2 gap-3 rounded-md">
                <Toaster />
                {(editInputfields || []).map((item, index) => (
                  <div
                    key={item.recordId || index}
                    className="bg-white p-4 rounded-md shadow-md"
                  >
                    <Toaster />
                    <div className="grid grid-cols-3 gap-5 mb-4">
                      <TextField
                        label="Identifier"
                        variant="standard"
                        className="text-xs"
                        name="identifier"
                        value={item.identifier || ""}
                        onChange={(e) => handleInputChange(e, index)}
                        error={!!errors[`identifier-${index}`]}
                        helperText={errors[`identifier-${index}`]}
                      />
                      <TextField
                        label="Email Subject"
                        variant="standard"
                        className="text-xs"
                        name="emailSubject"
                        value={item.emailSubject || ""}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <Dashboard
                        initialLoad={initialload}
                        selectedDashboard={item.dashboard}
                        setSelectedDashboard={(newNodes) => {
                          const updatedFields = editInputfields.map(
                            (field, i) => {
                              if (i === index) {
                                return { ...field, dashboard: newNodes };
                              }
                              return field;
                            }
                          );
                          seteditInputfields(updatedFields);
                        }}
                      />
                      <TextField
                        label="Cronjob Expression"
                        variant="standard"
                        className="text-xs"
                        name="cronExpression"
                        onClick={openModal}
                        value={cronExpression || item.cronExpression}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <CronCalculator
                        isOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                      />

                      <CronJobProfile
                        initialLoad={initialload}
                        selectedCronJobProfile={item.cronProfileId || ""}
                        setSelectedCronJobProfile={(newNodes) => {
                          const updatedFields = editInputfields.map(
                            (field, i) => {
                              if (i === index) {
                                return { ...field, cronProfileId: newNodes };
                              }
                              return field;
                            }
                          );
                          seteditInputfields(updatedFields);
                        }}
                      />

                      <Autocomplete
                        multiple
                        size="small"
                        options={enviromentFields}
                        getOptionLabel={(option) => option.label}
                        value={
                          item.envProfiles
                            ? enviromentFields.filter((option) =>
                                item.envProfiles.includes(option.value)
                              )
                            : []
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        onChange={(event, newValue) => {
                          const selectedValues = newValue.map(
                            (option) => option.value
                          );

                          const updatedFields = editInputfields.map(
                            (field, i) => {
                              if (i === index) {
                                return {
                                  ...field,
                                  envProfiles: selectedValues,
                                };
                              }
                              return field;
                            }
                          );

                          seteditInputfields(updatedFields);
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
                    <div className="flex flex-row w-full  p-3 justify-between gap-5">
                      <div className="flex flex-row w-[50%]">
                        <textarea
                          placeholder="Enter SKU's"
                          className="w-full h-44 border-solid border-2 border-gray-300 rounded-md p-2"
                          name="skus"
                          value={item.skus || ""}
                          onChange={(e) => handleInputChange(e, index)}
                        />
                      </div>
                      <div className="flex flex-row w-[50%]">
                        <textarea
                          placeholder="Enter Campaign"
                          className="w-full h-44 border-solid border-2 border-gray-300 rounded-md p-2"
                          name="campaign"
                          value={item.campaign || ""}
                          onChange={(e) => handleInputChange(e, index)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row gap-3 items-center w-full justify-end">
                      {item.ButtonActive === false ? (
                        <div
                          onClick={() => handleToggleButtonActive(index)}
                          className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                        >
                          InActive
                        </div>
                      ) : (
                        <div
                          onClick={() => handleToggleButtonActive(index)}
                          className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                        >
                          Active
                        </div>
                      )}
                    </div>

                    <div className="gap-5 flex flex-col mt-5">
                      {item.params &&
                        item.params.map((param, paramIndex) => (
                          <div
                            key={paramIndex}
                            className="grid grid-cols-4 flex-row items-center bg-gray-200 pb-2 rounded-md gap-5 justify-between p-2"
                          >
                            {/* Subsidiary Dropdown */}
                            <Autocomplete
                              options={subsidiary || []}
                              getOptionLabel={(option) =>
                                option.identifier || ""
                              }
                              value={
                                subsidiary.find(
                                  (subs) => subs.recordId === param.subsidiary
                                ) || null
                              }
                              onChange={(event, newValue) => {
                                handleParamChange(
                                  index,
                                  paramIndex,
                                  "subsidiary",
                                  newValue?.recordId || ""
                                );

                                // Check if `newValue` exists in `subsidiary` and send its `recordId` if true
                                const existingRecord = subsidiary.find(
                                  (subs) => subs.recordId === newValue?.recordId
                                );
                                if (existingRecord) {
                                  handleDatasourceChange(
                                    {
                                      target: {
                                        name: "subsidiary",
                                        value: newValue?.recordId || "",
                                      },
                                    },
                                    index,
                                    paramIndex
                                  );
                                } else {
                                  // Handle the absence of a match if necessary
                                  console.log(
                                    "Selected subsidiary does not match existing data."
                                  );
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Subsidiary"
                                  variant="standard"
                                />
                              )}
                            />

                            {/* Environment Dropdown */}
                            {/* Environment Dropdown */}
                            <Autocomplete
                              options={param.environments || []}
                              getOptionLabel={(option) =>
                                option.identifier || ""
                              }
                              value={
                                (param.environments &&
                                Array.isArray(param.environments)
                                  ? param.environments.find(
                                      (ds) => ds.recordId === param.environment
                                    )
                                  : null) || null
                              }
                              onChange={(event, newValue) =>
                                handleParamChange(
                                  index,
                                  paramIndex,
                                  "environment",
                                  newValue?.recordId || ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Environment"
                                  variant="standard"
                                />
                              )}
                            />

                            {/* Site ISO Code Dropdown */}
                            {/* Example for Site ISO Code Dropdown */}
                            <Autocomplete
                              options={param.siteIsoCodes || []}
                              getOptionLabel={(option) =>
                                option.identifier || ""
                              }
                              value={
                                (param.siteIsoCodes &&
                                Array.isArray(param.siteIsoCodes)
                                  ? param.siteIsoCodes.find(
                                      (ds) => ds.recordId === param.siteIsoCode
                                    )
                                  : null) || null
                              }
                              onChange={(event, newValue) =>
                                handleParamChange(
                                  index,
                                  paramIndex,
                                  "siteIsoCode",
                                  newValue?.recordId || ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Site"
                                  variant="standard"
                                />
                              )}
                            />

                            {/* Test Profile Dropdown */}
                            <Autocomplete
                              options={param.testProfiles || []}
                              getOptionLabel={(option) =>
                                option.identifier || ""
                              }
                              value={
                                (param.testProfiles &&
                                Array.isArray(param.testProfiles)
                                  ? param.testProfiles.find(
                                      (profile) =>
                                        profile.recordId === param.testProfile
                                    )
                                  : null) || null
                              }
                              onChange={(event, newValue) =>
                                handleParamChange(
                                  index,
                                  paramIndex,
                                  "testProfile",
                                  newValue?.recordId || ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Test Profile"
                                  variant="standard"
                                />
                              )}
                            />

                            {/* Test Plan Dropdown */}
                            <Autocomplete
                              options={param.testPlans || []}
                              getOptionLabel={(option) =>
                                option.identifier || ""
                              }
                              value={
                                (param.testPlans &&
                                Array.isArray(param.testPlans)
                                  ? param.testPlans.find(
                                      (plan) => plan.recordId === param.testPlan
                                    )
                                  : null) || null
                              }
                              onChange={(event, newValue) =>
                                handleParamChange(
                                  index,
                                  paramIndex,
                                  "testPlan",
                                  newValue?.recordId || ""
                                )
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
                              options={param.categoryIds || []}
                              getOptionLabel={(option) =>
                                option.identifier || ""
                              }
                              value={
                                (param.categoryIds &&
                                Array.isArray(param.categoryIds)
                                  ? param.categoryIds.find(
                                      (category) =>
                                        category.recordId === param.categoryId
                                    )
                                  : null) || null
                              }
                              onChange={(event, newValue) =>
                                handleParamChange(
                                  index,
                                  paramIndex,
                                  "categoryId",
                                  newValue?.recordId || ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Category"
                                  variant="standard"
                                />
                              )}
                            />

                            <Autocomplete
                              options={cronJobProfile || []}
                              getOptionLabel={(option) =>
                                option.identifier || ""
                              }
                              value={
                                cronJobProfile.find(
                                  (subs) =>
                                    subs.recordId === param.cronProfileId
                                ) || null
                              }
                              onChange={(event, newValue) =>
                                handleParamChange(
                                  index,
                                  paramIndex,
                                  "cronProfileId",
                                  newValue?.recordId || ""
                                )
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Cronjob Profile"
                                  variant="standard"
                                />
                              )}
                            />

                            {/* Remove Param Button */}
                            <div
                              className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                              onClick={() =>
                                handleRemoveParamClick(index, paramIndex)
                              }
                              style={{ width: "30px", height: "30px" }}
                            >
                              <FaMinus />
                            </div>
                          </div>
                        ))}
                    </div>
                    <div
                      className="flex items-center justify-center mt-5 p-2 rounded-md bg-black text-white text-center cursor-pointer"
                      onClick={() => handleAddParamClick(index)}
                      style={{ width: "100px", height: "40px" }}
                    >
                      Add Param
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <ListingpageSuccessModal
          contentname={contentname}
          isOpen={listingPageSuccess}
          setIsModalOpen={setListingPageSuccess}
        />
    </AddNewPageButtons>
  );
};

export default EditQACronJob;
