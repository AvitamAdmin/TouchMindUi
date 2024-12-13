"use client";
import React, { useState, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useSelector } from "react-redux";
import AddNewPageButtons from '@/app/src/components/AddNewPageButtons/AddNewPageButtons';

const Addcatalog = () => {
    const [params, setParams] = useState([]);
    const [ButtonActive, setButtonActive] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");
    const router = useRouter();
    const [selectedSystem, setSelectedSystem] = useState([]);
    const [systems, setSystems] = useState([]);
    const fetchFilterInputs = useSelector(
        (state) => state.tasks.fetchFilterInput
    );
    const [filterInput, setfilterInput] = useState({});

    const [formValues, setFormValues] = useState({
        identifier: '',
        shortDescription: '',
        systemLink: '',
        systemPath: '',

    });

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
            const response = await axios.post(`${api}/admin/system`, body, {
                headers,
            });

            setSystems(response.data.systems || []);
        }catch (err) {
            setError("Error fetching dropdown data", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    };

    const handleSystemChange = (e) => {
        const value = e.target.value;
        setSelectedSystem(value);
    };


    const handleSaveClick = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const body = {
                catalogs: [{
                    identifier: formValues.identifier,
                    shortDescription: formValues.shortDescription,
                    systemLink: formValues.systemLink,
                    systemPath: formValues.systemPath,
                    system:{recordId: selectedSystem},
                    status: ButtonActive, // Use button active status (true or false)
                }]
            };

            console.log(body, "req body from user");
            console.log(token, "token");

            const response = await axios.post(`${api}/admin/catalog/edit`, body, { headers });
            console.log(response.data, "response from api");
            router.push("/cheil/pg/catalog");
        } catch (err) {
            setError("Error fetching catalog data");
        } finally {
            setLoading(false);
        }
    };



    const breadscrums = "Admin > catalog"
    const pagename = "Add New"






    return (
        <AddNewPageButtons pagename={pagename} email={email} breadscrums={breadscrums}
            handleSaveClick={handleSaveClick}>
            <div className="flex flex-col w-full p-4 min-h-screen gap-5" style={{ fontFamily: 'SamsungOne, sans-serif' }}>


                <div className='flex flex-col bg-gray-200  rounded-md shadow'>



                    <div className="bg-white p-4 rounded-md shadow-md">
                        <div className="grid grid-cols-3 gap-4 mb-4 items-center justify-between w-full flex-col">

                            <TextField
                                label="Identifier"
                                variant="standard" fullWidth
                                name="identifier"
                                value={formValues.identifier}
                                onChange={handleInputChange}
                            />

                            <TextField
                                label="Short Description"
                                variant="standard" fullWidth
                                name="shortDescription"
                                value={formValues.shortDescription}
                                onChange={handleInputChange}
                            />

                            <TextField style={{ marginTop: '2.5vh' }}

                                className='text-xs w-full'
                                select
                                defaultValue="Select System "
                                SelectProps={{
                                    native: true,
                                }}
                                variant="standard"
                                name="system"
                                value={selectedSystem}
                                onChange={handleSystemChange}
                            >
                                {systems.map((option) => (
                                    <option key={option.recordId} value={option.recordId}>
                                        {option.identifier}
                                    </option>
                                ))}
                            </TextField>


                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-4 items-center justify-center flex flex-col">

                            <TextField
                                label="Enter system link"
                                variant="standard" fullWidth
                                name="systemLink"
                                value={formValues.systemLink}
                                onChange={handleInputChange}
                            />

                            <TextField
                                label="System Path"
                                variant="standard" fullWidth
                                name="systemPath"
                                value={formValues.systemPath}
                                onChange={handleInputChange}
                            />



                        </div>


                        <div className='flex flex-col gap-4'>


                            <div className="flex flex-row gap-3 items-center w-full justify-end">
                                {ButtonActive ? (
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
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-4 w-[100%]">
                    <div className="grid grid-cols-2 gap-4">
                        {params.map((param, index) => (
                            <div key={index} className="flex items-center gap-5 p-4">

                                <div
                                    className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white w-[30px] w-[30px]"
                                    onClick={() => handleRemoveParamClick(index)}

                                >
                                    <FaMinus />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AddNewPageButtons>
    );
        };

export default Addcatalog;
