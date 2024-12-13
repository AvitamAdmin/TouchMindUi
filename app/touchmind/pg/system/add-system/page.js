"use client";
import React, { useState, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { TextField } from '@mui/material';
import AddNewPageButtons from '@/app/src/components/AddNewPageButtons/AddNewPageButtons';
import { useRouter } from 'next/navigation';
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useSelector } from "react-redux";
import SingleSelectSubsidiary from '@/app/src/components/dropdown/Subsidiary';
import CatalogDropdown from "@/app/src/components/dropdown/Catalog";
import ModuleDropdown from "@/app/src/components/dropdown/Modules";

const Addsystem = () => {
    const [params, setParams] = useState([]);
    const [ButtonActive, setButtonActive] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");
    const router = useRouter();
    const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [catalogs, setCatalogs] = useState([]);
    const [modules, setModules] = useState([]);
    

    const fetchFilterInputs = useSelector(
        (state) => state.tasks.fetchFilterInput
    );
    const [filterInput, setfilterInput] = useState({});

    const [formValues, setFormValues] = useState({
        identifier: '',
        shortDescription: '',
        systemLink: '',
        systemPath: '',
        catalogs: '',
        modules: '',
    });

    useEffect(() => {
        const jwtToken = getCookie("jwtToken");
        if (jwtToken) {
            setToken(jwtToken);

        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    };


    const handleAddParamClick = () => {
        setParams([...params, '']);
    };

    const handleRemoveParamClick = (index) => {
        const newParams = params.filter((_, i) => i !== index);
        setParams(newParams);
    };

    const handleParamChange = (index, value) => {
        const newParams = [...params];
        newParams[index] = value;
        setParams(newParams);
    };



    const handleSaveClick = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const body = {
                systems: [{
                    identifier: formValues.identifier,
                    shortDescription: formValues.shortDescription,
                    systemLink: formValues.systemLink,
                    systemPath: formValues.systemPath,
                    catalogs: selectedCatalog,
                    modules: selectedModule,
                    subsidiaries: selectedSubsidiary.map((id) => (id.recordId)),
                    status: ButtonActive, // Use button active status (true or false)
                }]
            };

            console.log(body, "req body from user");
            console.log(token, "token");

            const response = await axios.post(`${api}/admin/system/edit`, body, { headers });
            console.log(response.data, "response from api");
            router.push("/cheil/pg/system");
        } catch (err) {
            setError("Error fetching system data");
        } finally {
            setLoading(false);
        }
    };



    const breadscrums = "Admin > system"
    const pagename = "Add New"


    return (
        <AddNewPageButtons pagename={pagename} email={email} breadscrums={breadscrums}
            handleSaveClick={handleSaveClick}>
            <div className="flex flex-col w-full p-4 min-h-screen gap-5" style={{ fontFamily: 'SamsungOne, sans-serif' }}>


                <div className='flex flex-col bg-gray-200  rounded-md shadow'>



                    <div className="bg-white p-4 rounded-md shadow-md">
                        <div className=" grid grid-cols-2 gap-4 mb-4 items-center justify-center flex flex-col">

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

                        </div>

                        <div className='gap-4 mb-4 items-center'>
                            <TextField
                                label="System Link"
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


                        <div className=" grid grid-cols-3 gap-4 mb-4 items-center justify-center flex flex-col">

                            <SingleSelectSubsidiary selectedSubsidiary={selectedSubsidiary} setSelectedSubsidiary={setSelectedSubsidiary} />

                            <CatalogDropdown
                                selectedCatalog={selectedCatalog}
                                setSelectedCatalog={setSelectedCatalog}

                            />


                            <ModuleDropdown
                                selectedModule={selectedModule}
                                setSelectedModule={setSelectedModule}
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

export default Addsystem;
