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
import NodeDropdown from "@/app/src/components/dropdown/Node";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import toast, { Toaster } from "react-hot-toast";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";
import { SkipConfigureListingPages } from "@/app/src/components/SkipComponent/SkipConfigureListingPages";

const EditInterfaceConfig = () => {
  const [token, setToken] = useState("");
  const [params, setParams] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialload, setInitialLoad] = useState(true);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [listingPageSuccess, setListingPageSuccess] = useState(false)
  const [editInputfields, setEditInputfields] = useState([]);
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [nodeList, setNodeList] = useState([]);
  const [selectedPath, setSelectedPath] = useState("");
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      handleFetchData(jwtToken);
      fetchNodeList(jwtToken)
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
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


  const [errors, setErrors] = useState([]);
  const validateFields = () => {
    const newErrors = editInputfields.map((field) => ({
      identifier: !field.identifier ? "Identifier is required" : "",
      shortDescription: !field.shortDescription
        ? "Short description is required"
        : "",
    }));

    setErrors(newErrors);

    // If any error exists, return false to prevent form submission.
    return newErrors.every((err) => !err.identifier && !err.shortDescription);
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedFields = [...editInputfields];
    updatedFields[index] = { ...updatedFields[index], [name]: value };
    setEditInputfields(updatedFields);
  };
  const dispatch = useDispatch();
  const handlePostClick = async () => {
    if (!validateFields()) return;

    if (selectedContent.length < 3) {
      toast.error("Select atleast 3 items");
      return;
    }
  
    if (selectedContent.length > 5) {
      toast.error("You can select a maximum of 5 items.");
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        interfaces: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier,
            shortDescription: item.shortDescription,
            status: item.ButtonActive,
            node: `/admin/${selectedPath}`,
            attributes: selectedContent
          })),
        }
      // };
      // const body = {
      //   interfaces: [
      //     {
      //       identifier: formValues.identifier,
      //       shortDescription: formValues.shortDescription,
      //       status: ButtonActive,
      //       node: `/admin/${selectedPath}`,
      //       attributes: selectedContent

      //     },
      //   ],
      // };

      console.log(body, "req body from user");

      const response = await axios.post(`${api}/admin/interfaceConfig/edit`, body, {
        headers,
      });
      console.log(response.data, "response from API");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setListingPageSuccess(true);
      } else if (response.data.success === false) {

        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {

        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error saving Datasource data");
      console.error(err);
    }
  };

  const handleFetchData = async (jwtToken) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = {
        interfaces: selectedID.map((id) => ({ recordId: id })),
      };
  
      const response = await axios.post(
        `${api}/admin/interfaceConfig/getedits`,
        body,
        { headers }
      );
  
      // Extract top-level interface details
      setlastmodifideBy(response.data.interfaces[0]?.lastModified || "");
      setmodifiedBy(response.data.interfaces[0]?.modifiedBy || "");
      setcreationTime(response.data.interfaces[0]?.creationTime || "");
      setcreator(response.data.interfaces[0]?.creator || "");
  
      // Map the interface data and include `ButtonActive` property
      const interfaces = response.data.interfaces.map((item) => ({
        ...item,
        ButtonActive: item.status || false,
      }));
      setEditInputfields(interfaces);
  
      // Extract attributes as objects in the desired format
      const allAttributes = response.data.interfaces.flatMap((item) =>
        item.attributes.map((attr) => ({
          label: attr.label,
          attribute: attr.attribute,
        }))
      );
      setSelectedContent(allAttributes);
  
      console.log(response.data.interfaces, "response from API");
      console.log(allAttributes, "Formatted attributes");
    } catch (err) {
      setError("Error fetching interfaceConfig data");
    } finally {
      setLoading(false);
    }
  };
  

  const fetchNodeList = async (jwtToken) => {
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const response = await axios.get(`${api}/admin/interface/getMenu/Admin`, {
        headers,
      });
      if (response.status === 200 && Array.isArray(response.data)) {
        setNodeList(response.data);
      } else {
        toast.error("Failed to fetch nodes.");
      }
    } catch (error) {
      console.error("Error fetching node list:", error);
    }
  };

  const handleNodeSelect = (event, value) => {
    if (value) {
      const pathParts = value.path.split('/');
      const selectedSegment = pathParts[2];
      setSelectedPath(selectedSegment);
      console.log(selectedSegment, "Selected Path");
    }
  };


  const [selectedContent, setSelectedContent] = useState([]);
  console.log(selectedContent, "selectedContent selectedContent selectedContent");

  const [getAdvancedSearchData, setGetAdvancedSearchData] = useState([])

  const fetchFilterInputs = useSelector(
    (state) => state.tasks.configureListingPageModal
  );
  console.log("fetchFilterInputs content:", fetchFilterInputs); // Log the updated state

  useEffect(() => {
    if (selectedPath) {
      getAdvancedSearch();
    }
  }, [selectedPath]);

  useEffect(() => {
    if (nodeList.length > 0) {
      const initialNode = nodeList.find((node) => node.path.includes(selectedPath));
      if (initialNode) {
        setSelectedPath(initialNode.path.split('/')[2]); // Extract the selected segment
        getAdvancedSearch();
      }
    }
  }, [nodeList]);

  const getAdvancedSearch = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${api}/admin/${selectedPath}/getAdvancedSearch`,
        { headers }
      );
      setGetAdvancedSearchData(response.data || []);
    } catch (error) {
      console.error("Error fetching getAdvancedSearch:", error);
    }
  };



  const handleSelectContent = (attribute, label) => {
    setSelectedContent((prevSelected) => {
      const exists = prevSelected.find((item) => item.attribute === attribute);
      const updatedSelected = exists
        ? prevSelected.filter((item) => item.attribute !== attribute) // Remove if already exists
        : [...prevSelected, { label, attribute }]; // Add if not exists

      console.log("Updated selected content:", updatedSelected); // Debug state
      return updatedSelected;
    });
  };

  const reset = () => {
    const selectedContent = [];
    setSelectedContent([]);

  };

  const handleRunClick = () => {
    alert("Run function executed from EditInterface!");
  };

  const pagename = "Edit";
  const breadscrums = "Admin > interfaceConfig";
  const contentname = "interfaceConfig";

  // Toggle ButtonActive for a specific field
  const handleButtonClick = (index) => {
    const updatedFields = [...editInputfields];
    updatedFields[index].ButtonActive = !updatedFields[index].ButtonActive;
    setEditInputfields(updatedFields);
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
                <Toaster />
                <div className="flex flex-col bg-gray-200 mb-10 p-2 gap-3 rounded-md">
                  {editInputfields.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-md shadow-md"
                    >
                      <div className="grid grid-cols-3 gap-5 mb-4">
                      <TextField
  label="Identifier"
  variant="standard"
  className="text-xs"
  name="identifier"
  value={item.identifier || ""}
  onChange={(e) => handleInputChange(e, index)}
  error={!!errors[index]?.identifier} // Check if error exists for identifier
  helperText={errors[index]?.identifier} // Show error message for identifier
/>

<TextField
  label="Short Description"
  variant="standard"
  className="text-xs"
  name="shortDescription"
  value={item.shortDescription || ""}
  onChange={(e) => handleInputChange(e, index)}
  error={!!errors[index]?.shortDescription} // Check if error exists for shortDescription
  helperText={errors[index]?.shortDescription} // Show error message for shortDescription
/>



                        <Autocomplete
                          options={nodeList}
                          getOptionLabel={(option) => option.identifier}
                          value={nodeList.find((node) => node.path.includes(selectedPath)) || null}
                          onChange={handleNodeSelect}
                          renderInput={(params) => (
                            <TextField {...params} label="Select Node" variant="standard" />
                          )}
                        />


                      </div>
                      <div className="flex gap-4 items-center w-[100%] justify-end">
                        <div className="flex flex-row gap-3 items-center">
                          {item.ButtonActive ? (
                            <div
                              onClick={() => handleButtonClick(index)}
                              className="bg-[#1581ed]  border-2 border-solid  border-[#1581ed] text-center cursor-pointer rounded-md text-white text-xs px-2 py-0.5 w-[80px]"
                            >
                              Active
                            </div>
                          ) : (
                            <div
                              onClick={() => handleButtonClick(index)}
                              className="bg-[#fff] border-2 border-solid  border-gray-400  text-center cursor-pointer rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px]"
                            >
                              Inactive
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                  ))}
                </div>
                {selectedPath && (
                  <div className="flex flex-col w-[100%] p-2 bg-transparent justify-center items-center">
                    <div className="bg-gray-300 w-[100%] pb-4 flex flex-col rounded-xl gap-4">

                      <div className="w-full flex flex-row justify-between items-center p-3 rounded-t-lg bg-black">
                        <div className="text-white text-md">Configure</div>
                      </div>


                      <div className="">
                        <div className="mt-4 w-full grid grid-cols-5 gap-5">
                          {getAdvancedSearchData
                            .filter((item) => !SkipConfigureListingPages.includes(item.attribute))
                            .map((item, id) => {
                              const isSelected = selectedContent.find(
                                (selected) => selected.attribute === item.attribute
                              );

                              return (
                                <div
                                  key={id}
                                  onClick={() => handleSelectContent(item.attribute, item.label)}
                                  className={`w-full gap-2 justify-start items-center transition-all hover:text-white text-left flex flex-row text-sm px-4 py-2 rounded-lg cursor-pointer ${isSelected
                                      ? "bg-[#CC0001] text-white"
                                      : "bg-gray-200 hover:bg-[#CC0001]"
                                    }`}
                                >
                                  <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[200px]">
                                    {item.label}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      <div className="w-full flex flex-row gap-10 justify-end px-10">
                        <div
                          onClick={reset}
                          className="bg-[#4d4d4d] text-white text-sm px-5 py-1 rounded-md cursor-pointer"
                        >
                          Reset
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

export default EditInterfaceConfig;