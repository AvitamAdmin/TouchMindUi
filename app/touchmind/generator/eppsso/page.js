"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import SitesDropdown from "@/app/src/components/dropdown/Sites";
import EnviromentDropdown from "@/app/src/components/dropdown/Enviroment";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import Listingpageforeppsso from "@/app/src/components/ListingPageComponents/Listingpageforeppsso";

const eppsso = () => {

  const [params, setParams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [selectedEnvironments, setSelectedEnviroment] = useState([]);
  const [sites, setSites] = useState([]);
  const [eppssoData, setEppsso] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');


  const Fields = [
    { label: "ssoLink", value: "ssoLink" },
    { label: "affiliateId", value: "affiliateId" },
    { label: "hash", value: "hash" },
    { label: "timestamp", value: "timestamp" },
    { label: "disabledLink", value: "disabledLink" },

  ];

  useEffect(() => {
    const storedEmail = localStorage.getItem('username');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      fetchDropdownItems(jwtToken);
    }
  }, []);

  const fetchDropdownItems = async (jwtToken) => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const headers = { Authorization: `Bearer ${jwtToken}` };
      console.log("token" + token);
      const body = {
        page: 0,
        sizePerPage: 10,
        //medias: fetchFilterInputs,
      };
      const response = await axios.post(`${api}/admin/eppsso`, body, {
        headers,
      });
      setEppsso(response.data.eppSsos || []);
    } catch (err) {
      setError("Error fetching dropdown data", err);
    } finally {
      setLoading(false);
    }
  };


  const handleAddParamClick = () => {
    setParams([...params, '']);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchEppsso = async () => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const headers = { Authorization: `Bearer ${token}` };

      console.log("Selected Subsidiary:", selectedSubsidiary);

      const body = {
        subsidiary: selectedSubsidiary,
        environment: selectedEnvironments[0].recordId,
        ssoDate: selectedDate,
        sites: [sites],
      };
      const response = await axios.post(`${api}/eppsso/generate`, body, { headers });

      setEppsso(response.data.eppSsos || []);
    } catch (err) {
      setError("Error fetching eppsso data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    await fetchEppsso();
    handleCloseModal();
    setShow(true); // Set show to true
  };

  const handlessoDate = (event) => {
    const dateTime = event.target.value;
    setSelectedDate(dateTime); // Update selected date and time
  };

  return (
    <div className="flex flex-col w-full p-4 gap-5" style={{ fontFamily: "SamsungOne, sans-serif" }}>
      <div className="bg-gray-200 flex flex-col pb-5 rounded-md gap-3 min-h-screen ">
        <div className="flx flex-col ">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-1 text-xs">
              <span>Generator</span>
              <span>{">"}</span>
              <span>eppsso</span>
            </div>
          </div>

          <div
            className="flex items-center justify-center ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
            onClick={handleAddParamClick}
          >
            Import
          </div>

        </div>
        {show && (
          <div>
            {error && <div className="text-red-500 text-sm px-2">{error}</div>}
            <Listingpageforeppsso
              fields={Fields} // Pass the field configuration
              data={eppssoData}
              loading={loading}
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-md p-6 w-96">
            <h2 className="text-lg font-bold mb-4">EPP SSO-Link Generator</h2>

            <SingleSelectSubsidiary selectedSubsidiary={selectedSubsidiary} setSelectedSubsidiary={setSelectedSubsidiary} />

            <EnviromentDropdown setSelectedEnviroment={setSelectedEnviroment} selectedEnvironments={selectedEnvironments} className="w-[45%]" />

            <SitesDropdown setSites={setSites} sites={sites} />

            <div className="mb-4 mt-4">
              <label className="block text-sm font-bold mb-1">Select Date</label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded-md"
                onChange={handlessoDate}
                value={selectedDate}
              />
            </div>

            <div className="flex justify-end">

              <div className="bg-gray-300 p-2 rounded-md mr-2" onClick={handleCloseModal}>
                Cancel
              </div>

              <div className="bg-gray-300 p-2 rounded-md mr-2" onClick={handleSubmit}>
                Submit
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show content conditionally based on `show` state */}

    </div>
  );

};

export default eppsso;
