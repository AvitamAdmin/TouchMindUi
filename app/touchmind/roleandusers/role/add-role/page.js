"use client";
import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { MultiSelect } from "primereact/multiselect";
import { getCookie } from "cookies-next";
import { api } from "@/envfile/api";
import axios from "axios";
import "primereact/resources/themes/saga-blue/theme.css"; // Theme
import "primereact/resources/primereact.min.css"; // Core CSS
import "primeicons/primeicons.css"; // Icons
import "primeflex/primeflex.css"; // Flex for styling
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const Addrole = () => {
  const router = useRouter();
  const [ButtonActive, setButtonActive] = useState(false);
  const [publishedButtonActive, setPublishedButtonActive] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [menuData, setMenuData] = useState([]);
  const dispatch = useDispatch();

  // Fetch token and then dropdown items
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

  // Call fetchMenuData only when token is set
  useEffect(() => {
    if (token) {
      fetchMenuData();
    }
  }, [token]);

  const fetchMenuData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(api + "/admin/interface/getMenu", {
        headers,
      });
      setMenuData(response.data);
    } catch (error) {
      console.error("Error fetching menu data", error);
    }
  };

  const [selectedPermissions, setSelectedPermissions] = useState({});
  const handlePermissionChange = (parentId, value) => {
    setSelectedPermissions((prevSelectedPermissions) => ({
      ...prevSelectedPermissions,
      [parentId]: value,
    }));
  };
  // Function to convert selectedPermissions into desired permissions array
  const transformPermissions = (selectedPermissions) => {
    const permissions = [];

    // Loop through each permission set for each parent node
    Object.values(selectedPermissions).forEach((permissionArray) => {
      permissionArray.forEach((permission) => {
        permissions.push({ recordId: permission.recordId }); // Add { recordId } to array
      });
    });

    return permissions; // Return just the permissions array
  };

  // Example usage
  const permissions = transformPermissions(selectedPermissions);
  console.log(permissions);

  const [formValues, setFormValues] = useState({
    username: "",
    quota: "",
    quotaused: "",
  });

  // Handle change for form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSaveClick = async () => {
    console.log("btn triggered on handleclick", formValues);
    console.log(token, "token");

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Correctly refer to the formValues state
      const body = {
        roles: [
          {
            identifier: formValues.username, // Use formValues.username
            quota: formValues.quota, // Use formValues.quota
            quotaUsed: formValues.quotaused, // Use formValues.quotaused
            status: ButtonActive,
            published: publishedButtonActive,
            permissions: permissions,
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(`${api}/admin/role/edit`, body, {
        headers,
      });
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/cheil/roleandusers/role");
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
  const [addnewpagebtn, setaddnewpagebtn] = useState(true);
  return (
    <AddNewPageButtons
      setshow={addnewpagebtn}
      pagename="Add New"
      email={email}
      breadscrums="Admin > Role"
      handleSaveClick={handleSaveClick}
      handleRunClick={handleRunClick}
    >
      <div
        className="flex flex-col w-full p-4 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />
        <div className="flex flex-col bg-gray-200 rounded-md shadow">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className=" flex flex-row gap-4 mb-4 items-center justify-center">
              <TextField
                label="Name"
                variant="standard"
                className="text-xs"
                name="username" // Correct name for email input
                value={formValues.username}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Quota"
                variant="standard"
                className="text-xs"
                name="quota" // Correct name for email input
                value={formValues.quota}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Quota Used"
                variant="standard"
                className="text-xs"
                name="quotaused" // Correct name for email input
                value={formValues.quotaused}
                onChange={handleInputChange}
                fullWidth
              />

              <div className="flex flex-row gap-4">
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

                <div className="flex flex-row gap-3 items-center w-full justify-end">
                  {publishedButtonActive == false ? (
                    <div
                      onClick={() =>
                        setPublishedButtonActive(!publishedButtonActive)
                      }
                      className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Unpublished
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        setPublishedButtonActive(!publishedButtonActive)
                      }
                      className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Published
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className=" grid grid-cols-2 p-2 justify-between gap-5 w-full ">
              {menuData.map((parentNode, parentId) => (
                <div className="flex flex-col w-[45%]" key={parentId}>
                  {parentNode.childNodes &&
                  Array.isArray(parentNode.childNodes) ? (
                    <MultiSelect
                      value={selectedPermissions[parentId] || []}
                      onChange={(e) =>
                        handlePermissionChange(parentId, e.value)
                      }
                      options={parentNode.childNodes.map((childNode) => ({
                        name: childNode.identifier,
                        recordId: childNode.recordId,
                      }))}
                      optionLabel="name"
                      filter
                      placeholder={`Select ${parentNode.identifier} permissions`}
                      display="chip"
                      maxSelectedLabels={3}
                      className="w-full p-2 text-gray-700 rounded-md"
                      panelClassName="max-h-48 overflow-auto shadow-lg rounded-lg"
                    />
                  ) : (
                    <p>No child nodes available</p> // Display a fallback message if no childNodes
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default Addrole;
