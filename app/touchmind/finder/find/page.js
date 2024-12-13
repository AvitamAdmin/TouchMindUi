"use client";
import React, { useState,useEffect } from 'react'
import TextField from '@mui/material/TextField';
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import Listingpageforfind from '@/app/src/components/ListingPageComponents/Listingpageforfind';

export default function page() {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");
    const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
    const [selectedErrorType, setSelectedErrorType] = useState("");
    const [selectedErrorMsg, setSelectedErrorMsg] = useState("");
    const [sites, setSites] = useState([]);
    const [findData, setFindData] = useState([]);
    const [show, setShow] = useState(false);


    const Fields = [
        { label: "identifier", value: "identifier" },
        { label: "shortDescription", value: "shortDescription" },
        { label: "type", value: "type" },
        { label: "systemPath", value: "systemPath" },
        { label: "subsidiaries", value: "subsidiaries" },

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

            };
            const response = await axios.post(`${api}/admin/find`, body, {
                headers,
            });
            setFindData(response.data.finds || []);
        } catch (err) {
            setError("Error fetching dropdown data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFind = async () => {
        setLoading(true);
        setError(null); // Reset error before fetching
        try {
            const headers = { Authorization: `Bearer ${token}` };

            console.log("Selected Subsidiary:", selectedSubsidiary);

            const body = {
                subsidiary: selectedSubsidiary,
                errorType: selectedErrorType,
                errorMsg: selectedErrorMsg,
            };
            const response = await axios.post(`${api}/find/finder`, body, { headers });

            setFindData(response.data.finds || []);
        } catch (err) {
            setError("Error fetching find data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleErrorTypeChange = (e) => {
        const value = e.target.value;
        setSelectedErrorType(value);
    };

    const handleErrorMsgChange = (e) => {
        const value = e.target.value;
        setSelectedErrorMsg(value);
    };

    const handleSubmit = async () => {
        await fetchFind();
        handleCloseModal();
        setShow(true); // Set show to true
    };

    const handleAddParamClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const errorType = [
        {
            value: 'Select Type',
            label: 'Select Type'
        },
        {
            value: 'Error debug',
            label: 'Error debug',
        },
        {
            value: 'System guideline',
            label: 'System guideline',
        },
        {
            value: 'Approval Process',
            label: 'Approval Process',
        },
    ];


    return (
        <div className="p-4" style={{ fontFamily: 'SamsungOne, sans-serif' }}>


            <div className='flex flex-row gap-3 ml-4 mt-5 '>
                <span className='text-xs font-bold'>Finder</span>
                <span className='text-xs font-bold'>{'>'}</span>
                <span className='text-xs font-bold'>Find solution</span>
            </div>


            <div className='flex flex-row '>


                <div
                    className="flex items-center justify-center mt-4 ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
                    onClick={handleAddParamClick}

                >
                    Find
                </div>


            </div>

            {show && (
                    <div>
                        {error && <div className="text-red-500 text-sm px-2">{error}</div>}
                        <Listingpageforfind
                            fields={Fields} // Pass the field configuration
                            data={findData}
                            loading={loading}
                        />
                    </div>
                )}



            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-md p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Find </h2>

                        <div className="mb-4">
                            <SingleSelectSubsidiary selectedSubsidiary={selectedSubsidiary} setSelectedSubsidiary={setSelectedSubsidiary} />
                        </div>

                        <div className="mb-4">
                            <TextField style={{ marginTop: '2.5vh' }}

                                className='text-xs w-full'
                                select
                                defaultValue="Select Type "
                                SelectProps={{
                                    native: true,
                                }}
                                variant="standard"
                                name="errorType"
                                value={selectedErrorType}
                                onChange={handleErrorTypeChange}
                            >
                                {errorType.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </TextField>
                        </div>

                        <div className='mb-4'>
                            <TextField label="Enter Search Text " variant="standard" fullWidth
                             onChange={handleErrorMsgChange} />
                        </div>

                        <div className="flex justify-end">
                        <div
                                className="bg-gray-300 p-2 rounded-md mr-2"
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </div>

                            <div
                                className="bg-gray-300 p-2 rounded-md mr-2"
                                onClick={handleSubmit}
                            >
                                Submit
                            </div>

                        </div>
                    </div>
                </div>
            )}




        </div>
    )
}