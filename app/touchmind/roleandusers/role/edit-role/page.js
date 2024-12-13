"use client";
import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { MultiSelect } from "primereact/multiselect";
import { getCookie } from "cookies-next";
import { api } from "@/envfile/api";
import axios from "axios";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const Editrole = () => {
  const router = useRouter();
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const [menuData, setMenuData] = useState([]);
  const [formValues, setFormValues] = useState({
    name: "",
    quota: "",
    quotaUsed: "",
    permissions: [], // Maintain array for permissions
  });
  const [isActive, setIsActive] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [listingPageSuccess, setListingPageSuccess] = useState(false)


  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) setToken(jwtToken);

    const storedEmail = localStorage.getItem("username");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (token) {
      fetchMenuData();
      if (selectedID) fetchExistingData(selectedID);
    }
  }, [token, selectedID]);

  const fetchMenuData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${api}/admin/interface/getMenu`, {
        headers,
      });
      setMenuData(response.data);
      console.log(response, "menudata");
    } catch (error) {
      console.error("Error fetching menu data", error);
    }
  };

  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    console.log("Menu Data:", menuData);
    console.log("Selected Permissions State:", selectedPermissions);
  }, [menuData, selectedPermissions]);

  const fetchExistingData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = { roles: selectedID.map((id) => ({ recordId: id })) };
      const response = await axios.post(`${api}/admin/role/getedits`, body, {
        headers,
      });

      setlastmodifideBy(response.data.roles[0]?.lastModified || "");
      setmodifiedBy(response.data.roles[0]?.modifiedBy || "");
      setcreationTime(response.data.roles[0]?.creationTime || "");
      setcreator(response.data.roles[0]?.creator || "");
      if (response.data?.roles?.length > 0) {
        const roleData = response.data.roles[0];
        setFormValues({
          identifier: roleData.identifier || "",
          quota: roleData.quota || "",
          quotaUsed: roleData.quotaUsed || "",
          permissions: roleData.permissions || [],
        });

        const initialPermissions = {};
        roleData.permissions.forEach((permission) => {
          const { parentId, recordId } = permission;
          if (!initialPermissions[parentId]) initialPermissions[parentId] = [];
          initialPermissions[parentId].push(recordId);
        });

        setSelectedPermissions(initialPermissions);
        console.log("Initial Permissions:", initialPermissions);
      } else {
        console.error("No role data found or empty roles array");
      }
    } catch (error) {
      console.error("Error fetching role data", error);
    }
  };

  const handlePermissionChange = (parentId, selectedIds) => {
    console.log(
      `Updating Permissions for Parent ID: ${parentId}, with IDs: ${selectedIds}`
    );
    setSelectedPermissions((prev) => ({
      ...prev,
      [parentId]: selectedIds,
    }));
  };

  const transformPermissions = () => {
    const result = [];
    Object.entries(selectedPermissions).forEach(([parentId, permissionIds]) => {
      permissionIds.forEach((permissionId) => {
        result.push({ recordId: permissionId, parentId });
      });
    });
    return result;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSaveClick = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const permissions = transformPermissions();

    const body = {
      roles: [
        {
          identifier: formValues.identifier,
          quota: formValues.quota,
          quotaUsed: formValues.quotaUsed,
          status: isActive,
          published: isPublished,
          permissions: permissions,
        },
      ],
    };

    try {
      const response = await axios.post(`${api}/admin/role/edit`, body, {
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
    } catch (error) {
      toast.error("Error editing role. Please try again.");
      console.error("Error:", error);
    }
  };
  const contentname = "Role";

  return (
    <AddNewPageButtons
      lastmodifideBy={lastmodifideBy}
      modifiedBy={modifiedBy}
      creator={creator}
      creationTime={creationTime}
      pagename="Edit"
      email={email}
      breadscrums="Admin > Role"
      handleSaveClick={handleSaveClick}
      handleRunClick={() => alert("Run function executed from AddDataSource!")}
    >
      <div
        className="flex flex-col w-full p-4 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />
        <div className="flex flex-col bg-gray-200 rounded-md shadow">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="flex flex-row gap-4 mb-4 items-center justify-center">
              <TextField
                label="Name"
                variant="standard"
                className="text-xs"
                name="identifier"
                value={formValues.identifier}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Quota"
                variant="standard"
                className="text-xs"
                name="quota"
                value={formValues.quota}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Quota Used"
                variant="standard"
                className="text-xs"
                name="quotaUsed"
                value={formValues.quotaUsed}
                onChange={handleInputChange}
                fullWidth
              />
              <div className="flex flex-row gap-4">
                <div
                  onClick={() => setIsActive(!isActive)}
                  className={`${
                    isActive
                      ? "bg-[#1581ed] text-center cursor-pointer "
                      : "bg-[#fff] text-center cursor-pointer"
                  } border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated animate__pulse`}
                >
                  {isActive ? "Active" : "Inactive"}
                </div>

                <div
                  onClick={() => setIsPublished(!isPublished)}
                  className={`${
                    isPublished
                      ? "bg-[#1581ed] text-center cursor-pointer "
                      : "bg-[#fff] text-center cursor-pointer"
                  } border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated animate__pulse`}
                >
                  {isPublished ? "Published" : "Unpublished"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 p-2 justify-between gap-5 w-full">
              {menuData.map((parentNode) => {
                const parentId = parentNode.recordId;

                if (!parentId) {
                  return <p key={parentId}>Parent node missing recordId</p>;
                }

                return (
                  <div className="flex flex-col w-[45%]" key={parentId}>
                    {parentNode.childNodes &&
                    Array.isArray(parentNode.childNodes) ? (
                      <MultiSelect
                        value={selectedPermissions[parentId] || []}
                        onChange={(e) =>
                          handlePermissionChange(parentId, e.value)
                        }
                        options={parentNode.childNodes.map((childNode) => ({
                          label: childNode.identifier,
                          value: childNode.recordId,
                        }))}
                        optionLabel="label"
                        filter
                        placeholder={`Select ${parentNode.identifier} permissions`}
                        display="chip"
                        maxSelectedLabels={3}
                        className="w-full p-2 text-gray-700 rounded-md"
                        panelClassName="max-h-48 overflow-auto shadow-lg rounded-lg"
                      />
                    ) : (
                      <p>No child nodes available</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <ListingpageSuccessModal
          contentname={contentname}
          isOpen={listingPageSuccess}
          setIsModalOpen={setListingPageSuccess}
        />
    </AddNewPageButtons>
  );
};

export default Editrole;
