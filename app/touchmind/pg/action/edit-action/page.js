"use client";
import React, { useState, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CircularProgress, TextField } from "@mui/material";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useSelector } from "react-redux";
import AddNewPageButtons from '@/app/src/components/AddNewPageButtons/AddNewPageButtons';
import NodeDropdown from "@/app/src/components/dropdown/Node";
import RoleDropdown from "@/app/src/components/dropdown/Role";
import SystemDropdown from "@/app/src/components/dropdown/System";
import CatalogDropdown from "@/app/src/components/dropdown/Catalog";
import ModuleDropdown from "@/app/src/components/dropdown/Modules";
import MultiSelectSubsidiary from '@/app/src/components/multiSelectDropdown/Subsidiary';
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import Listingpageforrelation from '@/app/src/components/ListingPageComponents/Listingpageforrelations';

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const editaction = () => {

    const [ButtonActive, setButtonActive] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");
    const router = useRouter();
    const [selectedNode, setSelectedNode] = useState("");
    const [medias, setMedias] = useState([]);
    const [actions, setActions] = useState([]);
    const [editInputfields, setEditInputfields] = useState([]);


    const fetchFilterInputs = useSelector(
        (state) => state.tasks.fetchFilterInput
    );


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
            handleFetchData(jwtToken);
        }
    }, []);

    const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);

    const handleFetchData = async (jwtToken) => {
        try {
            setLoading(true)
            const headers = { Authorization: `Bearer ${jwtToken}` };

            // Convert selectedID array to a comma-separated string
            const body =
                { actions: selectedID.map((id) => ({ recordId: id })) };

            // // Use the correct method and pass params in the config for GET request
            const response = await axios.post(
                `${api}/admin/action/getedits`,
                body,
                {
                    headers,
                }
            );
            setLoading(false)
            setEditInputfields(response.data.actions);
        } catch (err) {
            setError("Error fetching action data");
        } finally {
            setLoading(false);
        }
    };

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
    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        setEditInputfields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[index] = { ...updatedFields[index], [name]: value };
            return updatedFields;
        });
    };

    const handleButtonActive = (index) => {
        setEditInputfields((prevFields) => {
            const updatedFields = [...prevFields];
            updatedFields[index].ButtonActive = !updatedFields[index].ButtonActive;
            return updatedFields;
        });
    };


    const handleSaveClick = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };

            const body = {
                actions: editInputfields.map((item) => ({
                    recordId: item.recordId,
                    identifier: item.identifier || "",
                    shortDescription: item.shortDescription || "",
                    picEmail: item.picEmail || "",
                    toolkitId: item.recordId,
                    role: item.role,
                    catalog: item.catalog,
                    module: item.module,
                    systemPath: item.systemPath || "",
                    longDescription: item.longDescription || "",
                    system: item.system,
                    subsidiaries: item.subsidiaries,
                    status: ButtonActive,
                })),
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
        <AddNewPageButtons
            pagename={pagename}
            email={email}
            breadscrums={breadscrums}
            handleSaveClick={handleSaveClick}
        >
            {
                loading ? (<>
                    <div className="flex flex-row justify-center items-center w-full h-40">
                        <div className="gap-5 flex flex-col items-center justify-center">
                            <CircularProgress size={36} color="inherit" />
                            <div>Loading...</div>
                        </div>
                    </div></>) : (<>
                        {
                            editInputfields.length < 1 ? (
                                <div className="w-full flex flex-col  h-40 justify-center items-center">
                                    <div className="opacity-35 ">
                                        <Lottie options={defaultOptions} height={100} width={100} />
                                    </div>
                                    <div>No data found...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-2">
                                        <div className="flex flex-col bg-gray-200 p-2 gap-3 rounded-md">
                                            {editInputfields.map((item, index) => (
                                                <div
                                                    key={item.recordId}
                                                    className="bg-white p-4 rounded-md shadow-md"
                                                >
                                                    <div className="grid grid-cols-4 gap-5 mb-4 items-center">
                                                        <TextField
                                                            label="Identifer"
                                                            variant="standard" fullWidth
                                                            name="identifier"
                                                            value={item.identifier}
                                                            onChange={(e) => handleInputChange(e, index)}
                                                        />

                                                        <TextField
                                                            label="Description"
                                                            variant="standard" fullWidth
                                                            name="shortDescription"
                                                            value={item.shortDescription}
                                                            onChange={(e) => handleInputChange(e, index)}
                                                        />

                                                        <TextField
                                                            label="PIC Email"
                                                            variant="standard" fullWidth
                                                            name="picEmail"
                                                            value={item.picEmail}
                                                            onChange={(e) => handleInputChange(e, index)}
                                                        />

                                                        <NodeDropdown
                                                            setSelectedNode={setSelectedNode}
                                                            selectedNode={selectedNode}
                                                            className="w-[45%] "
                                                        />

                                                    </div>

                                                    <div className='flex flex-col gap-4'>

                                                        <MultiSelectSubsidiary
                                                            selectedSubsidiary={item.subsidiaries}
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
                                                            selectedSystem={item.system}
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
                                                            selectedRole={item.role}
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
                                                            selectedCatalog={item.catalog}
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
                                                            selectedModule={item.module}
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
                                                            value={item.systemPath}
                                                            onChange={(e) => handleInputChange(e, index)}
                                                        />

                                                        <TextField
                                                            label="Long Description"
                                                            variant="standard" fullWidth
                                                            name="longDescription"
                                                            value={item.longDescription}
                                                            onChange={(e) => handleInputChange(e, index)}
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
                                            ))}
                                        </div>
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


                                </>
                            )
                        }
                    </>)
            }


        </AddNewPageButtons>
    );
};

export default editaction;