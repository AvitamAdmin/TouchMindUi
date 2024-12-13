"use client";
import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import axios from "axios";
import { api } from "@/envfile/api";
import toast, { Toaster } from "react-hot-toast";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import MultiSelectRole from "@/app/src/components/multiSelectDropdown/MultiSelectRole";

const Adduser = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [selectedRole, setSelectedRole] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [email, setEmail] = useState("");
  const [initialload, setInitialLoad] = useState(true);

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const [formValues, setFormValues] = useState({
    email: "",
    username: "",
    password: "",
    confirmpassword: "",
  });

  const [errors, setErrors] = useState({});

  // Handle change for form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const validateForm = () => {
    let newErrors = {};

    if (!formValues.username) {
      newErrors.username = "Identifier is required.";
    }
    if (!formValues.password) {
      newErrors.password = "Description is required.";
    }
    if (selectedSubsidiary.length === 0) {
      toast.error("Please select at least one subsidiary!");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = async () => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!validateForm()) return;

    // Check if username (which is an email) matches the regex pattern
    if (!emailRegex.test(formValues.username)) {
      toast.error("Invalid email format! Please enter a valid email.");
      return; // Exit the function if the email is invalid
    }

    // Check if password and confirm password match
    if (formValues.password !== formValues.confirmpassword) {
      toast.error("Password and Confirm Password does not match!");
      return; // Exit the function if the passwords don't match
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        users: [
          {
            recordId: formValues.recordId,
            username: formValues.username,
            subsidiaries: selectedSubsidiary,
            roles: selectedRole,
            password: formValues.password,
            passwordConfirm: formValues.confirmpassword,
            status: ButtonActive,
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(selectedRole, "selectedRole selectedRole");

      const response = await axios.post(`${api}/admin/user/edit`, body, {
        headers,
      });

      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/cheil/roleandusers/user");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      toast.error("Error adding user. Please try again.");
      console.error("Error fetching data:", err);
    }
  };

  const handleRunClick = () => {
    alert("Run function executed from AddDataSource!");
  };

  const breadscrums = "RoleandUser > Add User";
  const pagename = "Add New";
  const [addnewpagebtn, setaddnewpagebtn] = useState(true);
  return (
    <AddNewPageButtons
      setshow={addnewpagebtn}
      pagename={pagename}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
      handleRunClick={handleRunClick}
    >
      <Toaster />
      <div
        className="flex flex-col w-full p-4 max-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <div className="bg-white p-4 gap-3 rounded-md shadow-md">
          <div className="w-full grid grid-cols-4 justify-between items-center gap-5">
            <TextField
              label="Enter Email"
              variant="standard"
              className="text-xs mt-6"
              name="username" // Correct name for username input
              value={formValues.username}
              onChange={handleInputChange}
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              type="password"
              label="Password"
              variant="standard"
              className="text-xs mt-6"
              name="password" // Correct name for password input
              value={formValues.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              type="password"
              label="Confirm Password"
              variant="standard"
              className="text-xs mt-6"
              name="confirmpassword" // Correct name for confirm password input
              value={formValues.confirmpassword}
              onChange={handleInputChange}
            />

            <div className="mt-7">
              <MultiSelectSubsidiary
                initialload={initialload}
                selectedSubsidiary={selectedSubsidiary}
                setSelectedSubsidiary={setSelectedSubsidiary}
              />
            </div>
            <div className="mt-6">
              <MultiSelectRole
                initialload={initialload}
                selectedRoles={selectedRole}
                setSelectedRoles={setSelectedRole}
              />
            </div>
          </div>
          <div className="flex gap-4 items-center w-[100%] mt-4 justify-end">
            <div className="flex flex-row gap-3 items-center">
              {ButtonActive == false ? (
                <div
                  onClick={() => setButtonActive(!ButtonActive)}
                  className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer  rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                >
                  InActive
                </div>
              ) : (
                <div
                  onClick={() => setButtonActive(!ButtonActive)}
                  className=" bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                >
                  Active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default Adduser;
