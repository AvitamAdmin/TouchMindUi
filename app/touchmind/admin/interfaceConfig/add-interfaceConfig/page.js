"use client";
import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { SkipConfigureListingPages } from "@/app/src/components/SkipComponent/SkipConfigureListingPages";

const AddInterfaceConfig = () => {
  const [token, setToken] = useState("");
  const [selectedNode, setSelectedNode] = useState(null); // Store selected node
  const [email, setEmail] = useState("");
  const [ButtonActive, setButtonActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [nodeList, setNodeList] = useState([]);
  const [selectedPath, setSelectedPath] = useState("");
const dispatch = useDispatch()
  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
    
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
    }
  }, []);
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

    if (!formValues.identifier) {
      newErrors.identifier = "Identifier is required.";
    }
    if (!formValues.shortDescription) {
      newErrors.shortDescription = "Description is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Ensure `selectedNode` is used properly
  const handleSaveClick = async () => {
    if (!validateForm()) return;
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
        interfaces: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            status: ButtonActive,
            node:selectedPath,
            attributes:selectedContent

          },
        ],
      };

      const response = await axios.post(`${api}/admin/interfaceConfig/edit`, body, {
        headers,
      });
      if (response.data.success === true) {
        toast.success(`${response.data}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/interfaceConfig");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      console.error(err, "Error occurred while saving");
      setError("Error saving interfaceConfig data");
    } finally {
      setLoading(false);
    }
  };

  const [selectedContent, setSelectedContent] = useState([]); 
  console.log(selectedContent,"selectedContent selectedContent selectedContent");

  const [getAdvancedSearchData, setGetAdvancedSearchData] = useState([])

  const fetchFilterInputs = useSelector(
    (state) => state.tasks.configureListingPageModal
  );
  console.log("fetchFilterInputs content:", fetchFilterInputs); // Log the updated state

  const handleSelect = (event, value) => {
    if (value) {
      setSelectedPath(value.path); // Update selected path
      console.log(selectedPath,"selectedPath selectedPathselectedPath");
      
    }
  };


  useEffect(() => {
    if(selectedPath){
      getAdvancedSearch()
    }
  }, [selectedPath])
  

  

  const getAdvancedSearch = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${api}${selectedPath}/getAdvancedSearch`,
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
  
      console.log("Updated selected content:", updatedSelected); // Log local state
      return updatedSelected; // Update local state only
    });
  };
  
  // const handleclick = () => {
  //   if (selectedContent.length < 3) {
  //     toast.error("Select atleast 3 items");
  //     return;
  //   }
  
  //   if (selectedContent.length > 5) {
  //     toast.error("You can select a maximum of 5 items.");
  //     return;
  //   }
  
  //   // Dispatch the selected content to Redux
  //   dispatch(setConfigureListingPageModal(selectedContent));
  //   console.log("Selected content applied:", selectedContent); // Confirm what is dispatched
  //   setIsconfigureModalOpen(false);

  // };
  const reset = () => {
    const selectedContent = [];
    setSelectedContent([]);
    // Dispatch the selected content to Redux
    // dispatch(setConfigureListingPageModal(selectedContent));

  };

 
  
  const getNodesData = async (token) => {
    if (!token) {
      console.error("Token is missing");
      toast.error("Authorization token is missing. Please log in again.");
      return;
    }
  
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${api}/admin/interface/getMenu/Admin`, { headers });
  console.log(response,"response from node");
  
      if (response.status === 200 && Array.isArray(response.data)) {
        setNodeList(response.data);
      } else {
        console.error("Unexpected response format:", response);
        toast.error("Failed to fetch nodes. Unexpected response format.");
      }
    } catch (error) {
      console.error("Error fetching nodes:", error);
      toast.error("Failed to fetch nodes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (token) {
      getNodesData(token);
    }
  }, [token]);
  

  
  const breadscrums = "Admin > interfaceConfig";
  const pagename = "Add New";
  const [addnewpagebtn, setaddnewpagebtn] = useState(true);

  return (
    <AddNewPageButtons
      pagename={pagename}
      setshow={addnewpagebtn}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
    >
      <div className="flex flex-col w-full p-4 min-h-screen gap-5">
        <Toaster />
        <div className="flex flex-col bg-gray-200  rounded-md ">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <TextField
                required
                label="Enter Identifier"
                variant="standard"
                className="text-xs mt-1"
                name="identifier"
                error={!!errors.identifier}
                helperText={errors.identifier}
                value={formValues.identifier}
                onChange={handleInputChange}
              />
              <TextField
                required
                label="Enter Description"
                variant="standard"
                className="text-xs mt-1"
                name="shortDescription"
                error={!!errors.shortDescription}
                helperText={errors.shortDescription}
                value={formValues.shortDescription}
                onChange={handleInputChange}
              />
             

              <div className="mt-1">
              <Autocomplete
        options={nodeList}
        getOptionLabel={(option) => option.identifier} // Show the identifier
        onChange={handleSelect} // Handle selection
        renderInput={(params) => (
          <TextField {...params} label="Select Interface" variant="standard" />
        )}
      />
              </div>

          
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-row gap-3 items-center w-full justify-end">
                {ButtonActive ? (
                  <div
                    onClick={() => setButtonActive(!ButtonActive)}
                    className="bg-[#1581ed]  border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-white text-xs px-2 py-0.5 w-[80px]"
                  >
                    Active
                  </div>
                ) : (
                  <div
                    onClick={() => setButtonActive(!ButtonActive)}
                    className="bg-[#fff] border-2 border-solid text-center cursor-pointer  border-[#1581ed] rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px]"
                  >
                    Inactive
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
        {selectedPath && <div className="flex flex-col w-[100%] bg-transparent justify-center items-center">
     
        <div className="bg-gray-300 w-[100%] pb-4 flex flex-col rounded-xl gap-4">
          {/* Modal Header */}
          <div className="w-full flex flex-row justify-between items-center p-3 rounded-t-lg bg-black">
            <div className="text-white text-md">Configure</div>
           
          </div>

          {/* Content Section */}
          <div className="p-2">
            <div className="mt-4 w-full grid grid-cols-5 gap-5">
              {getAdvancedSearchData.filter((item) => !SkipConfigureListingPages.includes(item.attribute)).map((item,id) => (
                <div
                key={id}
                onClick={() => handleSelectContent(item.attribute, item.label)}
                className={` w-full gap-2 justify-start items-center transition-all hover:bg-[#cc0000bb] hover:text-white text-left flex flex-row text-sm px-4 py-2 rounded-lg cursor-pointer ${
                  selectedContent.find((obj) => obj.attribute === item.attribute)
                    ? "bg-[#CC0001] text-white"
                    : "bg-gray-200 hover:bg-[#CC0001]"
                }`}
              >
                {/* Checkbox */}
                {/* <div className="flex flex-row justify-center items-center">
                  <input
                    type="checkbox"
                    checked={!!selectedContent.find((obj) => obj.value === item.attribute)} // Check if the object exists
                    onChange={() => handleSelectContent(item.attribute, item.label)} // Handle checkbox change
                  />
                </div> */}
                <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[200px]">
                  {item.label}
                </div>
              </div>
              
              ))}
            </div>
          </div>
          <div className="w-full flex flex-row gap-10 justify-end px-10">
          <div onClick={reset} className="bg-[#4d4d4d] text-white text-sm  px-5 py-1 rounded-md cursor-pointer">Reset</div>
          </div>
        </div>
      </div>}
      </div>
    </AddNewPageButtons>
  );
};

export default AddInterfaceConfig;
