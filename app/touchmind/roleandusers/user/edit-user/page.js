"use client";
import React, { useEffect, useState } from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material"; // Import Autocomplete
import { useRouter } from "next/navigation";
import axios from "axios";
import { getCookie } from "cookies-next";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { api } from "@/envfile/api";
import { useDispatch, useSelector } from "react-redux";
import MultiSelectRole from "@/app/src/components/multiSelectDropdown/MultiSelectRole";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import toast, { Toaster } from "react-hot-toast";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditUser = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [subsidiary, setSubsidiary] = useState([]); // This holds all available subsidiaries
  const [initialload, setInitialLoad] = useState(true);
  const [editInputfields, setEditInputfields] = useState([]);
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("")
  // Function to fetch all subsidiaries from backend
  const getAllSubsidiaries = async () => {
    try {
      const response = await axios.get(api + "/admin/subsidiary/get");
      setSubsidiary(response.data.subsidiaries); // Store all fetched subsidiaries in state
    } catch (error) {
      console.error(error, "Error fetching subsidiaries");
    }
  };
  const [formValues, setFormValues] = useState({
    email: "",
    username: "",
    password: "welcome12345",
    confirmpassword: "",
    roles: [],
    subsidiaries: [],
    node: [],
    locale: [],
    status: "",
  });

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
      handlefetchData(jwtToken);
    }
  }, []);
  const [errors, setErrors] = useState({});

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

    // Clear errors for the current field
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    // Update state with modified fields
    setEditInputfields(updatedFields);
  };

  const dispatch = useDispatch();

  const [ButtonActive, setButtonActive] = useState(formValues.status || false);

  // Toggle button state and update formValues.status accordingly
  const handleStatusToggle = () => {
    const newStatus = !ButtonActive;
    setButtonActive(newStatus); // Toggle ButtonActive state
    setFormValues((prev) => ({ ...prev, status: newStatus })); // Update formValues.status
  };

  // UseEffect to sync ButtonActive with formValues.status on load
  useEffect(() => {
    setButtonActive(formValues.status);
  }, [formValues.status]);

  const validateForm = () => {
    let newErrors = {};
    let hasEmptySubsidiary = false;

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    // Validate each field in editInputfields
    editInputfields.forEach((field) => {
      if (!field.username) {
        newErrors.username = "Email is required.";
      } else if (!emailRegex.test(field.username)) {
        newErrors.username = "Invalid email format!";
      }

      if  (password !== confirmPassword) {
       toast.error("Password does not match to Confirm Password")
      }
      if (!field.subsidiaries || field.subsidiaries.length === 0) {
        toast.error(`Please select Subsidiary`);
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
        users: editInputfields.map((field) => ({
          recordId: Array.isArray(selectedID) ? selectedID[0] : selectedID,
          username: field.username,
          email: field.email,
          subsidiaries: field.subsidiaries,
          roles: field.roles,
          password: password,
          passwordConfirm: confirmPassword, // Ensure correct mapping
          status: field.ButtonActive, // Map the status correctly
        })),
      };
      console.log(body, "req body");
      const response = await axios.post(`${api}/admin/user/edit`, body, {
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
      console.error(err.response?.data || err.message, "Error details");
      toast.error("Error submitting data", { className: "text-sm" });
    }
  };

  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const [subsidiariesList, setSubsidiariesList] = useState([]); // To store all subsidiaries
  const handleToggleButtonActive = (index) => {
    setEditInputfields((prevFields) => {
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
  const handlefetchData = async (jwtToken) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = { users: selectedID.map((id) => ({ recordId: id })) };

      const response = await axios.post(`${api}/admin/user/getedits`, body, {
        headers,
      });
      setlastmodifideBy(response.data.users[0]?.lastModified || "");
      setmodifiedBy(response.data.users[0]?.modifiedBy || "");
      setcreationTime(response.data.users[0]?.creationTime || "");
      setcreator(response.data.users[0]?.creator || "");
      const fetchedData = response.data.users[0];
      const userfetchedData = response.data.users.map((item) => ({
        ...item,
        ButtonActive: item.status,
      }));

      setEditInputfields(userfetchedData);
      // setButtonActiveList(fetchedData.map((plan) => plan.status === true));

      // const subsidiaries = fetchedData.subsidiaries || [];
      // setSubsidiariesList(subsidiaries);

      // const mappedRecordIds = subsidiaries.map((sub) => sub.recordId);
      // setSelectedSubsidiary(mappedRecordIds);

      console.log(fetchedData, "formValues user roles fetched");
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const pagename = "Edit";
  const breadscrums = "RoleandUser > Edit User";
  const contentname = "User";


  useEffect(() => {
    getAllSubsidiaries();
  }, []);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
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
              <div className="flex flex-col gap-10">
                {editInputfields.map((item, index) => (
                  <div
                    key={item.recordId}
                    className="flex flex-col bg-gray-200 min-h-screen w-full m-2 rounded-md  mb-5"
                  >
                    <div className="bg-white p-4 rounded-md shadow-md flex flex-col">
                      <div className="grid grid-cols-4 gap-5 mb-4">
                        <TextField
                          label="Enter Email"
                          variant="standard"
                          className="text-xs"
                          name="username"
                          value={item.username}
                          onChange={(e) => handleInputChange(e, index)}
                          error={!!errors.username} // Display error if it exists
                          helperText={errors.username} // Show error message
                        />
                        <TextField
  type="password"
  label="Password"
  variant="standard"
  className="text-xs"
  name="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)} // Use e.target.value to update state
  error={!!errors.password} // Display error if it exists
  helperText={errors.password} // Show error message
/>
<TextField
  type="password"
  label="Confirm Password"
  variant="standard"
  className="text-xs"
  name="confirmPassword"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)} // Use e.target.value to update state
/>
                        <MultiSelectSubsidiary
                          initialload={initialload}
                          setSelectedSubsidiary={(newNode) => {
                            const updatedFields = editInputfields.map(
                              (field, i) => {
                                if (i === index) {
                                  return { ...field, subsidiaries: newNode }; // Update node data
                                }
                                return field;
                              }
                            );
                            setEditInputfields(updatedFields); // Update state
                          }}
                          selectedSubsidiary={item.subsidiaries}
                        />

                        <MultiSelectRole
                          initialload={initialload}
                          selectedRoles={item.roles}
                          setSelectedRoles={(roles) => {
                            const updatedFields = editInputfields.map(
                              (field, i) => {
                                if (i === index) {
                                  return { ...field, roles: roles }; // Update node data
                                }
                                return field;
                              }
                            );
                            setEditInputfields(updatedFields); // Update state
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-3 ">
                        <div className="flex flex-row gap-3 items-center w-full justify-end">
                          {item.ButtonActive ? (
                            <div
                              onClick={() => handleToggleButtonActive(index)}
                              className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                            >
                              Active
                            </div>
                          ) : (
                            <div
                              onClick={() => handleToggleButtonActive(index)}
                              className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                            >
                              InActive
                            </div>
                          )}
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

export default EditUser;
