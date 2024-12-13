"use client";
import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useSelector } from "react-redux";
import AddNewPageButtons from '@/app/src/components/AddNewPageButtons/AddNewPageButtons';
import SystemDropdown from "@/app/src/components/dropdown/System";

const Addsystemrole = () => {

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
        } catch (err) {
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
                systemRoles: [{
                    identifier: formValues.identifier,
                    shortDescription: formValues.shortDescription,
                    system:formValues.system,
                    status: ButtonActive, // Use button active status (true or false)
                }]
            };

            console.log(body, "req body from user");
            console.log(token, "token");

            const response = await axios.post(`${api}/admin/systemrole/edit`, body, { headers });
            console.log(response.data, "response from api");
            router.push("/cheil/pg/systemrole");
        } catch (err) {
            setError("Error fetching systemrole data");
        } finally {
            setLoading(false);
        }
    };



    const breadscrums = "Admin > systemrole"
    const pagename = "Add New"



    return (
        <AddNewPageButtons pagename={pagename} email={email} breadscrums={breadscrums}
            handleSaveClick={handleSaveClick}>
            <div className="flex flex-col w-full p-4 min-h-screen gap-5" style={{ fontFamily: 'SamsungOne, sans-serif' }}>


                <div className='flex flex-col bg-gray-200  rounded-md shadow'>



                    <div className="bg-white p-4 rounded-md shadow-md">
                        <div className="grid grid-cols-3 gap-4 mb-4 items-center justify-center flex flex-col">

                            <TextField
                                label="Identifer"
                                variant="standard" fullWidth
                                name="identifier"
                                value={formValues.identifier}
                                onChange={handleInputChange}
                            />

                            <TextField
                                label="Description"
                                variant="standard" fullWidth
                                name="shortDescription"
                                value={formValues.shortDescription}
                                onChange={handleInputChange}
                            />

                            <SystemDropdown
                                selectedSystem={selectedSystem}
                                setSelectedSystem={setSelectedSystem}

                            />

                        </div>

                        
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
        </AddNewPageButtons>
    );
};

export default Addsystemrole;
