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
import Listingpageforrelation from '@/app/src/components/ListingPageComponents/Listingpageforrelations';
import NodeDropdown from "@/app/src/components/dropdown/Node";
import RoleDropdown from "@/app/src/components/dropdown/Role";
import MultiSelectSubsidiary from '@/app/src/components/multiSelectDropdown/Subsidiary';
import SystemDropdown from '@/app/src/components/dropdown/System';
import CatalogDropdown from "@/app/src/components/dropdown/Catalog";
import ModuleDropdown from "@/app/src/components/dropdown/Modules";

const Addaction = () => {
    const [params, setParams] = useState([]);
    const [ButtonActive, setButtonActive] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");
    const router = useRouter();
    const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
    const [selectedNode, setSelectedNode] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedSystem, setSelectedSystem] = useState("");
    const [medias, setMedias] = useState([]);
    const [actions, setActions] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState("");
    const [catalogs, setCatalogs] = useState([]);
    const [selectedModule, setSelectedModule] = useState("");
    const [modules, setModules] = useState([]);

    const fetchFilterInputs = useSelector(
        (state) => state.tasks.fetchFilterInput
    );
    const [filterInput, setfilterInput] = useState({});

    const actionFields = [
        { label: 'Identifier', value: 'identifier' },
        { label: 'Short Description', value: 'shortDescription' },

    ];

    const mediaFields = [
        { label: "Identifier", value: "identifier" },

    ];

    const [formValues, setFormValues] = useState({
        identifier: '',
        shortDescription: '',
        picEmail: '',
        systemPath: '',
        longDescription: '',
    });

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

            const body = {
                page: 0,
                sizePerPage: 10,
                //medias: fetchFilterInputs,
            };
            const response = await axios.post(`${api}/admin/media`, body, {
                headers,
            });

            setMedias(response.data.medias || []);

            const responseCatalog = await axios.get(`${api}/admin/catalog/get`, {
                headers,
            });

            setCatalogs(responseCatalog.data.catalogs || []);

            const responseModule = await axios.get(`${api}/admin/module/get`, {
                headers,
            });

            setModules(responseModule.data.modules || []);

            const responseAction = await axios.post(`${api}/admin/action`, body, {
                headers,
            });
            setLoading(false);
            setActions(responseAction.data.actions);

        } catch (err) {
            setError("Error fetching dropdown data", err);
        }
    };

    // Handle change for form inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    };

    

    const handleSaveClick = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };

            const body = {
                actions: [
                    {
                        identifier: formValues.identifier,
                        shortDescription: formValues.shortDescription,
                        picEmail: formValues.picEmail,
                        toolkitId: selectedNode.recordId,
                        role: selectedRole.recordId,
                        catalog: { recordId: selectedCatalog },
                        module: { recordId: selectedModule },
                        systemPath: formValues.systemPath,
                        longDescription: formValues.longDescription,
                        system: { recordId: selectedSystem },
                        subsidiaries: selectedSubsidiary.recordId,
                        status: ButtonActive,
                    }
                ]
            };
            const response = await axios.post(`${api}/admin/action/edit`, body, { headers });
            router.push("/cheil/pg/action");
        } catch (err) {
            console.error(err, "Error occurred while saving");
            setError("Error saving action data");
        } finally {
            setLoading(false);
        }
    };

    const addnewroutepath = "/admin/media/add-media";
    const cuurentpagemodelname = "media";


    const actionaddnewroutepath = "/admin/action/add-action";
    const actioncuurentpagemodelname = "action";

    const breadscrums = "Admin > action";
    const pagename = "Add New";


    return (
        <AddNewPageButtons pagename={pagename} email={email} breadscrums={breadscrums}
            handleSaveClick={handleSaveClick}>
            <div className="flex flex-col w-full p-4 min-h-screen gap-5" style={{ fontFamily: 'SamsungOne, sans-serif' }}>


                <div className='flex flex-col bg-gray-200  rounded-md shadow'>



                    <div className="bg-white p-4 rounded-md shadow-md">
                        <div className=" grid grid-cols-4 gap-4 mb-4 items-center justify-center flex flex-col">

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

                            <TextField
                                label="PIC Email"
                                variant="standard" fullWidth
                                name="picEmail"
                                value={formValues.picEmail}
                                onChange={handleInputChange}
                            />

                            <NodeDropdown
                                setSelectedNode={setSelectedNode}
                                selectedNode={selectedNode}
                                className="w-[45%] "
                            />

                        </div>

                        <div className='flex flex-col gap-4'>

                            <MultiSelectSubsidiary
                                selectedSubsidiary={formValues.subsidiaries}
                                setSelectedSubsidiary={(newSubsidiary) => {
                                    const updatedFields = editInputfields.map((field, i) => {
                                        if (i === index) {
                                            return { ...field, subsidiaries: newSubsidiary }; // Update Sub data
                                        }
                                        return field;
                                    });
                                    setEditInputfields(updatedFields); // Update state
                                }}
                            />

                        </div>

                        <div className=' grid grid-cols-4 gap-4'>

                            <SystemDropdown
                                selectedSystem={formValues.system}
                                setSelectedSystem={(newSystem) => {



                                    const updatedFields = editInputfields.map((field, i) => {
                                        if (i === index) {
                                            return { ...field, system: newSystem }; // Update node data
                                        }
                                        return field;
                                    });
                                    setEditInputfields(updatedFields);
                                }}

                            />


                        <RoleDropdown
                                selectedRole={formValues.role}
                                setSelectedRole={(newRole) => {
                                    const updatedFields = editInputfields.map((field, i) => {
                                        if (i === index) {
                                            return { ...field, role: newRole }; // Update node data
                                        }
                                        return field;
                                    });
                                    setEditInputfields(updatedFields);
                                }}

                            />

                            <CatalogDropdown
                                selectedCatalog={formValues.catalog}
                                setSelectedCatalog={(newCatalog) => {
                                    const updatedFields = editInputfields.map((field, i) => {
                                        if (i === index) {
                                            return { ...field, catalog: newCatalog }; // Update node data
                                        }
                                        return field;
                                    });
                                    setEditInputfields(updatedFields);
                                }}

                            />

                            <ModuleDropdown
                                selectedModule={formValues.module}
                                setSelectedModule={(newModule) => {
                                    const updatedFields = editInputfields.map((field, i) => {
                                        if (i === index) {
                                            return { ...field, module: newModule }; // Update node data
                                        }
                                        return field;
                                    });
                                    setEditInputfields(updatedFields);
                                }}

                            />



                        </div>

                        <div className='flex flex-col gap-4 mt-2'>
                            <TextField
                                label="System Path"
                                variant="standard" fullWidth
                                name="systemPath"
                                value={formValues.systemPath}
                                onChange={handleInputChange}
                            />

                            <TextField
                                label="Long Description"
                                variant="standard" fullWidth
                                name="longDescription"
                                value={formValues.longDescription}
                                onChange={handleInputChange}
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

                        <h1>Pre-condition Actions </h1>

                        <div>
                            {error && <div className="text-red-500 text-sm px-2">{error}</div>}
                            <Listingpageforrelation
                                actioncuurentpagemodelname={actioncuurentpagemodelname}
                                actionaddnewroutepath={actionaddnewroutepath}
                                fields={actionFields} // Pass the field configuration
                                data={actions}
                                loading={loading}
                            />

                        </div>


                        <h1>Media</h1>
                        <div>
                            {error && <div className="text-red-500 text-sm px-2">{error}</div>}
                            <Listingpageforrelation
                                cuurentpagemodelname={cuurentpagemodelname}
                                addnewroutepath={addnewroutepath}
                                fields={mediaFields} // Pass the field configuration
                                data={medias}
                                loading={loading}
                            />

                        </div>




                    </div>
                </div>

                <div className="flex flex-col mt-4 w-[100%]">
                    <div className="grid grid-cols-2 gap-4">
                        {params.map((param, index) => (
                            <div key={index} className="flex items-center gap-5 p-4">
                                <TextField

                                    className='text-xs w-[80%]'
                                    select
                                    defaultValue="Select node "
                                    SelectProps={{
                                        native: true,
                                    }}
                                    variant="standard"
                                >
                                    {currencies.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </TextField>

                                <div
                                    className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white  w-[30px]"
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

export default Addaction;
