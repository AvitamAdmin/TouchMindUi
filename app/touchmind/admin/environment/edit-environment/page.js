"use client";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { CircularProgress, TextField } from "@mui/material";
import { TbClockEdit, TbClockPlus } from "react-icons/tb";
import { useRouter } from "next/navigation";
import axios from "axios";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "cookies-next";
import environment from "../page";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditEnvironment = () => {
  useEffect(() => {
    console.log("initial call");

    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handlefetchData(jwtToken);

      console.log("JWT Token retrieved:", jwtToken);
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

  const dispatch = useDispatch();
  const [token, setToken] = useState("");
  const [params, setParams] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listingPageSuccess, setListingPageSuccess] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [editInputfields, seteditInputfields] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  const [errors, setErrors] = useState({});
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();

  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
  });
  const { identifier, shortDescription } = formValues;

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleAddParamClick = (e, index) => {
    const updatedFields = [...editInputfields];
    if (!updatedFields[index].params) {
      updatedFields[index].params = [];
    }

    updatedFields[index].params.push("");
    seteditInputfields(updatedFields);
  };

  const handleRemoveParamClick = (fieldIndex, paramIndex) => {
    const updatedFields = [...editInputfields];
    updatedFields[fieldIndex].params.splice(paramIndex, 1);
    seteditInputfields(updatedFields);
  };
  const handleParamChange = (fieldIndex, paramIndex, field, value) => {
    seteditInputfields((prevFields) => {
      const updatedFields = prevFields.map((item, i) =>
        i === fieldIndex
          ? {
              ...item,
              params: item.params.map((param, j) =>
                j === paramIndex ? { ...param, [field]: value } : param
              ),
            }
          : item
      );
      return updatedFields;
    });
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    const updatedFields = editInputfields.map((item, i) => {
      if (i === index) {
        if (name === "parentNode") {
          return {
            ...item,
            parentNode: { ...item.parentNode, identifier: value },
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
      if (!item.shortDescription.trim()) {
        newErrors[`shortDescription-${index}`] = "Description is required.";
      }

      if (!item.subsidiaries || item.subsidiaries.length === 0) {
        toast.error(`Please select Subsidiary for item at index ${index + 1}`);
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

      const body = {
        environments: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "-",
          shortDescription: item.shortDescription || "-",
          status: item.status,
          subsidiaries: item.subsidiaries,
          configs: item.params.map((input) => ({
            url: input.url,
            loginName: input.loginName,
            loginPassword: input.loginPassword,
            loginNameUiSelector: input.loginNameUiSelector,
            loginPasswordSelector: input.loginPasswordSelector,
            actionElement: input.actionElement,
            shortDescription: input.shortDescription,
            waitAfterUrl: input.waitAfterUrl,
            waitBeforeUrl: input.waitBeforeUrl,
            waitAfterClick: input.waitAfterClick,
            waitBeforeClick: input.waitBeforeClick,
          })),
        })),
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(`${api}/admin/environment/edit`, body, {
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
    } finally {
      setLoading(false);
    }
  };

  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const handlefetchData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = { environments: selectedID.map((id) => ({ recordId: id })) };

      const response = await axios.post(
        `${api}/admin/environment/getedits`,
        body,
        { headers }
      );
      setlastmodifideBy(response.data.environments[0]?.lastModified || "");
      setmodifiedBy(response.data.environments[0]?.modifiedBy || "");
      setcreationTime(response.data.environments[0]?.creationTime || "");
      setcreator(response.data.environments[0]?.creator || "");
      if (Array.isArray(response.data.environments)) {
        const environments = response.data.environments.map((item) => ({
          ...item,
          params: item.configs || [],
          waitAfterClick: item.waitAfterClick === "true",
          waitAfterUrl: item.waitAfterUrl === "true",
          waitBeforeClick: item.waitBeforeClick === "true",
          waitBeforeUrl: item.waitBeforeUrl === "true",
        }));
        seteditInputfields(environments);
      } else {
        seteditInputfields([]);
      }
    } catch (err) {
      setError("Error fetching Datasource data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (index, paramIndex, fieldName) => {
    seteditInputfields((prevDataSources) => {
      const updatedData = prevDataSources.map((item, i) =>
        i === index
          ? {
              ...item,
              params: item.params.map((param, j) =>
                j === paramIndex
                  ? { ...param, [fieldName]: !param[fieldName] }
                  : param
              ),
            }
          : item
      );
      return updatedData;
    });
  };

  const handleRunClick = () => {
    alert("Run function executed from EditEnvironment!");
  };

  const pagename = "Edit";
  const breadscrums = "Admin > Environment";
  const contentname = "Environment";

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
                <div className="flex flex-col bg-gray-200 p-2 gap-5 ">
                  {editInputfields.map((item, index) => (
                    <div
                      key={item.recordId}
                      className="flex flex-col bg-white rounded-md "
                    >
                      <Toaster />
                      <div className="flex flex-col gap-2  mb-4 ">
                        <div className="grid  p-3 rounded-md grid-cols-3 gap-5  items-center">
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
                            label="Short Description"
                            variant="standard"
                            className="text-xs"
                            name="shortDescription"
                            value={item.shortDescription || ""}
                            onChange={(e) => handleInputChange(e, index)}
                            error={!!errors[`shortDescription-${index}`]}
                            helperText={errors[`shortDescription-${index}`]}
                          />
                          <MultiSelectSubsidiary
                            initialload={initialload}
                            selectedSubsidiary={item.subsidiaries}
                            setSelectedSubsidiary={(newNode) => {
                              const updatedFields = editInputfields.map(
                                (field, i) =>
                                  i === index
                                    ? { ...field, subsidiaries: newNode }
                                    : field
                              );
                              seteditInputfields(updatedFields);
                            }}
                          />
                        </div>
                        <div className="w-full flex flex-row p-2 justify-end items-center">
                          <div
                            onClick={() => {
                              const updatedFields = editInputfields.map(
                                (field, i) =>
                                  i === index
                                    ? { ...field, status: !field.status }
                                    : field
                              );
                              seteditInputfields(updatedFields);
                            }}
                            className={`border-2 rounded-md text-xs px-2 py-0.5 w-[80px] animate__animated animate__pulse ${
                              item.status
                                ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                : "bg-white text-gray-500 text-center cursor-pointer border-[#1581ed]"
                            }`}
                          >
                            {item.status ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-md gap-3 flex flex-col p-1">
                        {item.params?.length > 0 &&
                          item.params.map((param, paramIndex) => (
                            <div
                              key={paramIndex}
                              className="items-center justify-between bg-gray-200 rounded-md gap-5 flex flex-row w-[100%] p-2"
                            >
                              <div className="flex flex-col w-[95%] gap-5">
                                <div className="flex flex-row w-full gap-5">
                                  <div className="flex flex-col gap-5 w-[33%] p-2 bg-gray-100 rounded-md">
                                    <TextField
                                      className="mt-2 w-full"
                                      placeholder="Enter the Environment URL"
                                      variant="standard"
                                      size="small"
                                      value={param.url}
                                      onChange={(e) =>
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "url",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <div className="w-full flex flex-row justify-between items-center">
                                      <div
                                        onClick={() =>
                                          handleToggle(
                                            index,
                                            paramIndex,
                                            "waitBeforeUrl"
                                          )
                                        }
                                        className={`border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[80px] h-[25px] ${
                                          param.waitBeforeUrl
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                            : "bg-white text-gray-700 border-gray-400 text-center cursor-pointer"
                                        }`}
                                      >
                                        Before Url
                                      </div>
                                      <div
                                        onClick={() =>
                                          handleToggle(
                                            index,
                                            paramIndex,
                                            "waitAfterUrl"
                                          )
                                        }
                                        className={`border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[70px] h-[25px] ${
                                          param.waitAfterUrl
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                            : "bg-white text-gray-700 border-gray-400 text-center cursor-pointer"
                                        }`}
                                      >
                                        After Url
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-5 w-[33%] p-2 bg-gray-100 rounded-md">
                                    <TextField
                                      className="mt-2 w-full"
                                      placeholder="Enter UI Element Selector"
                                      variant="standard"
                                      size="small"
                                      value={param.actionElement}
                                      onChange={(e) =>
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "actionElement",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <div className="w-full flex flex-row justify-between items-center">
                                      <div
                                        onClick={() =>
                                          handleToggle(
                                            index,
                                            paramIndex,
                                            "waitBeforeClick"
                                          )
                                        }
                                        className={`border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[90px] h-[25px] ${
                                          param.waitBeforeClick
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                            : "bg-white text-gray-700 border-gray-400 text-center cursor-pointer"
                                        }`}
                                      >
                                        Before Click
                                      </div>
                                      <div
                                        onClick={() =>
                                          handleToggle(
                                            index,
                                            paramIndex,
                                            "waitAfterClick"
                                          )
                                        }
                                        className={`border-2 border-solid rounded-md text-xs px-2 py-0.5 w-[80px] h-[25px] ${
                                          param.waitAfterClick
                                            ? "bg-[#1581ed] text-center cursor-pointer  text-white border-[#1581ed]"
                                            : "bg-white text-gray-700 border-gray-400 text-center cursor-pointer"
                                        }`}
                                      >
                                        After Click
                                      </div>
                                    </div>
                                  </div>

                                  <div className="w-[33%] bg-gray-100 rounded-md p-2">
                                    <TextField
                                      className="mt-2 w-full"
                                      placeholder="Short Description"
                                      variant="standard"
                                      size="small"
                                      value={param.shortDescription}
                                      onChange={(e) =>
                                        handleParamChange(
                                          index,
                                          paramIndex,
                                          "shortDescription",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-row justify-between w-full p-2">
                                  <div className="flex flex-row gap-5 w-[45%]">
                                    <div className="w-[25%] mt-2">
                                      User Login:
                                    </div>
                                    <div className="flex flex-col gap-5 w-[75%]">
                                      <TextField
                                        className="mt-2 w-full"
                                        placeholder="Enter Login Name"
                                        variant="standard"
                                        size="small"
                                        value={param.loginName}
                                        onChange={(e) =>
                                          handleParamChange(
                                            index,
                                            paramIndex,
                                            "loginName",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <TextField
                                        className="w-full"
                                        placeholder="Enter UI selector (ID/CSS/Xpath)"
                                        variant="standard"
                                        size="small"
                                        value={param.loginNameUiSelector}
                                        onChange={(e) =>
                                          handleParamChange(
                                            index,
                                            paramIndex,
                                            "loginNameUiSelector",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-row gap-5 w-[45%]">
                                    <div className="w-[25%] mt-2">
                                      Enter Password:
                                    </div>
                                    <div className="flex flex-col gap-5 w-[75%]">
                                      <TextField
                                        className="mt-2 w-full"
                                        placeholder="Enter Login Password"
                                        variant="standard"
                                        size="small"
                                        value={param.loginPassword}
                                        onChange={(e) =>
                                          handleParamChange(
                                            index,
                                            paramIndex,
                                            "loginPassword",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <TextField
                                        className="w-full"
                                        placeholder="Enter UI selector (ID/CSS/Xpath)"
                                        variant="standard"
                                        size="small"
                                        value={param.loginPasswordSelector}
                                        onChange={(e) =>
                                          handleParamChange(
                                            index,
                                            paramIndex,
                                            "loginPasswordSelector",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-row w-[5%] justify-center items-end">
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
                            </div>
                          ))}
                      </div>
                      <div
                        className="flex items-center justify-center mt-4 m-2 p-2 rounded-md text-white"
                        onClick={(e) => handleAddParamClick(e, index)}
                        style={{
                          width: "260px",
                          height: "40px",
                          backgroundColor: "black",
                          cursor: "pointer",
                        }}
                      >
                        Add environment configuration
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

export default EditEnvironment;
