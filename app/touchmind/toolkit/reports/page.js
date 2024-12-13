"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import SitesDropdown from "@/app/src/components/dropdown/Sites";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import Listingpagefortoolkit from "@/app/src/components/ListingPageComponents/Listingpagefortoolkit";
import { useSelector } from "react-redux";
import { Autocomplete, Switch, TextField } from "@mui/material";
import Lottie from "react-lottie";
import * as animationData from "../../../../assests/LoadingAnimation.json";
import toast, { Toaster } from "react-hot-toast";

export default function page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenImport, setIsModalOpenImport] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  const [sites, setSites] = useState([]);
  const [stockReportData, setStockReportData] = useState([]);
  const [show, setShow] = useState(false);
  const [subsidiary, setSubsidiary] = useState([]);
  const [sitesList, setSitesList] = useState([]);
  const [modelList, setmodelList] = useState([]);
  const [categoryList, setcategoryList] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [skusvalue, setSkusvalue] = useState("");
  const [skuvalue, setSkuvalue] = useState("");
  const [checked, setChecked] = useState(false);
  const [enableCurrentPage, setEnableCurrentPage] = useState(false);
  const [enableSkus, setEnableSkus] = useState(false);
  const [enableToggle, setEnableToggle] = useState(false);
  const [enableVariant, setEnableVariant] = useState(false);
  const [enableVoucher, setEnableVoucher] = useState(false);
  const [enableCategory, setEnableCategory] = useState(false);
  
  const apiroutepath = useSelector((state) => state.tasks.toolkitRoutePath);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const Fields = [
    { label: "ssoLink", value: "ssoLink" },
    { label: "affiliateId", value: "affiliateId" },
    { label: "hash", value: "hash" },
    { label: "timestamp", value: "timestamp" },
    { label: "disabledLink", value: "disabledLink" },
  ];

  
  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      getAllSubsidiaries();
    }
  }, [selectedSubsidiary]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);


  const getAllSubsidiaries = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
  
      // Fetch all data simultaneously
      const [responseForCategory, responseForModel, responseForSites] = await Promise.all([
        axios.get(api + `/toolkit/import/getCategoriesForSubsidiary/${selectedSubsidiary}`, { headers }),
        axios.get(api + `/toolkit/import/getModelForSubsidiary/${selectedSubsidiary}`, { headers }),
        axios.get(api + `/toolkit/import/getSitesForSubsidiary/${selectedSubsidiary}`, { headers }),
      ]);
  
      // Set the lists by mapping the responses to extract `identifier`
      setSitesList(responseForSites.data || []);
      setcategoryList(responseForCategory.data || []);
      setmodelList(responseForModel.data || []);
  
    } catch (error) {
      console.error("Error fetching subsidiaries:", error);
    }
  };
  
  const getfileroutepath = async (modalType) => {
    try {
      if(apiroutepath == ""){
        toast.error("Please select any dropdown in Toolkits");
        return;
      }
      if (modalType === "shortcut") {
        setIsModalOpen(true);         // Open the Shortcuts modal
      } else if (modalType === "import") {
        setIsModalOpenImport(true);    // Open the Import modal
      }

      setLoading(true);
      setSelectedSubsidiary([]);
      const headers = { Authorization: `Bearer ${token}` };
      const responseData = await axios.get(api + `/toolkit/${apiroutepath}`, { headers });
  
      setEnableVoucher(responseData.data.enableVoucher);
      setEnableCategory(responseData.data.enableCategory);
      setEnableCurrentPage(responseData.data.enableCurrentPage);
      setEnableVariant(responseData.data.enableVariant);
      setEnableSkus(responseData.data.enableSkus);
      setEnableToggle(responseData.data.enableToggle);
    } catch (error) {
      console.error("Error fetching subsidiaries:", error);
    } finally {
      setLoading(false);
    }
  };
  



  const handleModelOpen = () => {
    getfileroutepath("shortcut");
  };
  
  const handleModelImportOpen = () => {
    getfileroutepath("import");
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsModalOpenImport(false);
  };


  const handleChange = (event) => {
    setChecked(event.target.checked);
    console.log(event.target.checked,"checked checkbox");
  };
  const handleSubmit = async () => {
    await fetchStockreport();
    handleCloseModal();
    setShow(true); // Set show to true
  };

  const postToolkitData = async () => {
    try {
      const headers = { Authorization: "Bearer " + token };
      const body =  {
        recordId: apiroutepath,
        skus: skuvalue,
        shortcuts: selectedModel.map((item) => item.recordId),
        subId: selectedSubsidiary,
        currentSite: selectedSites.recordId,
        voucherCode: voucherCode,
        skus2: skusvalue,
        category: selectedCategory.recordId,
        currentPage: currentPage,
        bundle: checked,

      };
      console.log(body,"res from body");

      const response = await axios.post(api + "/toolkit/reportResult", body, { headers });

      // Log the response from the backend
      console.log(response.data, "res from backend");
      
    } catch (error) {
      console.log(error, "Error fetching sites");
    }
  };
  return (
    <div className="p-4" style={{ fontFamily: "SamsungOne, sans-serif" }}>
      <Toaster />
      <div className="flex flex-row gap-2 ml-4 mt-5 ">
        <span className="text-sm font-semibold">Toolkits</span>
        <span className="text-sm font-semibold">{">"}</span>
        <span className="text-sm font-semibold">{apiroutepath ? apiroutepath : <span className="text-red-500 font-normal"> Select any dropdown in Toolkits</span>}</span>
      </div>

      <div className="flex flex-row ">
        <div
          className="flex items-center justify-center text-sm mt-4 ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
          onClick={handleModelOpen}
        >
          Shortcuts
        </div>

        <div
          className="flex items-center justify-center text-sm mt-4 ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
          onClick={handleModelImportOpen}
        >
          Import
        </div>

        <div
          className="flex items-center justify-center text-sm mt-4 ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
          onClick={() => console.log("Save button clicked")}
        >
          Save
        </div>
      </div>

      {show && (
        <div>
          {error && <div className="text-red-500 text-sm px-2">{error}</div>}
          <Listingpagefortoolkit
            fields={Fields} // Pass the field configuration
            data={stockReportData}
            loading={loading}
          />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-200 rounded-md p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Shortcuts </h2>

            <div className="mb-2">
            <SingleSelectSubsidiary initialload={initialload} selectedSubsidiary={selectedSubsidiary} setSelectedSubsidiary={setSelectedSubsidiary} />

            </div>

            <div className="mb-2">
              <Autocomplete
                options={sitesList || []}
                getOptionLabel={(option) => option.identifier || ""}
                value={selectedSites || null}
                onChange={(event, newValue) => {
                  setSelectedSites(newValue);
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
            </div>
            {
              loading ? ( <div className="w-full flex flex-col justify-center items-center">
                <div className="opacity-35 ">
                  <Lottie options={defaultOptions} height={100} width={100} />
                </div>
                <div>No data found...</div>
              </div>):(<div className="flex flex-col gap-2">
                {
              enableCategory && <div className="mb-2">
              <Autocomplete
                options={categoryList || []}
                getOptionLabel={(option) => option.identifier || ""}
                value={selectedCategory || null}
                onChange={(event, newValue) => {
                  setSelectedCategory(newValue);
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
            </div>
            }
            {enableVariant && <div className="mb-3">
              <Autocomplete
              multiple
                options={modelList || []}
                getOptionLabel={(option) => option.identifier || ""}
                value={selectedModel || null}
                onChange={(event, newValue) => {
                  setSelectedModel(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option.recordId === value?.recordId
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Model"
                    variant="standard"
                  />
                )}
              />
            </div>}

            {enableVoucher && <div className="mb-3">
            <TextField
                label="Enter Voucher Code"
                variant="standard"
                fullWidth
                className="bg-gray-100 rounded"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)} // Update the state here
              />
            </div>}
            
            {enableCurrentPage && <div className="mb-3">
            <TextField
                label="Enter Current Page"
                variant="standard"
                fullWidth
                className="bg-gray-100 rounded"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)} // Update the state here
              />
            </div>}
            
            {enableSkus && <div className="mb-3">
              <textarea
        className="w-full border border-gray-300 p-2 rounded"
        name="skus2"
        value={skusvalue}
        onChange={(e) => setSkusvalue(e.target.value)}
        placeholder="Enter SKU2"
      />
            </div>}
              </div>)
            }
           
            

            <div className="flex flex-row justify-around mt-4">
              <div
                className="bg-red-400 text-white p-1 text-center cursor-pointer  w-[100px] rounded-md "
                onClick={handleCloseModal}
              >
                Cancel
              </div>

              <div cursor-pointer
                className="bg-green-400 text-white p-1 text-center cursor-pointer w-[100px] rounded-md "
                onClick={postToolkitData}
              >
                Submit
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpenImport && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-200 rounded-md p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Import SKUs </h2>

            <div className="mb-2">
            <SingleSelectSubsidiary initialload={initialload} selectedSubsidiary={selectedSubsidiary} setSelectedSubsidiary={setSelectedSubsidiary} />

            </div>

            <div className="mb-2">
              <Autocomplete
                options={sitesList || []}
                getOptionLabel={(option) => option.identifier || ""}
                value={selectedSites || null}
                onChange={(event, newValue) => {
                  setSelectedSites(newValue);
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
            </div>
            {
              loading ? ( <div className="w-full flex flex-col justify-center items-center">
                <div className="opacity-35 ">
                  <Lottie options={defaultOptions} height={100} width={100} />
                </div>
                <div>No data found...</div>
              </div>):(<div className="flex flex-col gap-2">
                {enableToggle &&  <div className="mt-2">
           Bundle CheckBox <Switch checked={checked} onChange={handleChange} />

</div>}
                {
              enableCategory && <div className="mb-2">
              <Autocomplete
                options={categoryList || []}
                getOptionLabel={(option) => option.identifier || ""}
                value={selectedCategory || null}
                onChange={(event, newValue) => {
                  setSelectedCategory(newValue);
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
            </div>
            }
            

            {enableVoucher && <div className="mb-3">
            <TextField
                label="Enter Voucher Code"
                variant="standard"
                fullWidth
                className="bg-gray-100 rounded"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)} // Update the state here
              />
            </div>}
            
            {enableCurrentPage && <div className="mb-3">
            <TextField
                label="Enter Current Page"
                variant="standard"
                fullWidth
                className="bg-gray-100 rounded"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)} // Update the state here
              />
            </div>}
            
            {enableSkus && <div className="mb-3">
            <textarea
            className="w-full"
                  name="skus2"
                  value={skusvalue}
                  onChange={(e) => setSkusvalue(e.target.value)} // Update the state here
                  placeholder="Enter SKU2"
                />
            </div>}
            {enableVariant && <div className="mb-3">
              <div className="mb-3">
            <TextField
                label="Enter SKU"
                variant="standard"
                fullWidth
                className="bg-gray-100 rounded"
                value={skuvalue}
                onChange={(e) => setSkuvalue(e.target.value)} // Update the state here
                />
            </div>
            </div>}
            
              </div>)
            }
           
            

            <div className="flex flex-row justify-around mt-4">
              <div
                className="bg-red-400 text-white p-1 text-center cursor-pointer  w-[100px] rounded-md "
                onClick={handleCloseModal}
              >
                Cancel
              </div>

              <div cursor-pointer
                className="bg-green-400 text-white p-1 text-center cursor-pointer w-[100px] rounded-md "
                onClick={postToolkitData}
              >
                Submit
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
