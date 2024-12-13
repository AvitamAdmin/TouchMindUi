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


const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const editsystemrole = () => {

    const [ButtonActive, setButtonActive] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");
    const router = useRouter();
    const [editInputfields, setEditInputfields] = useState([]);
    const [selectedSystem, setSelectedSystem] = useState([]);


    const fetchFilterInputs = useSelector(
        (state) => state.tasks.fetchFilterInput
    );


    const [formValues, setFormValues] = useState({
        identifier: '',
        shortDescription: '',

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
                { systemRoles: selectedID.map((id) => ({ recordId: id })) };

            // // Use the correct method and pass params in the config for GET request
            const response = await axios.post(
                `${api}/admin/systemrole/getedits`,
                body,
                {
                    headers,
                }
            );
            setLoading(false)
            console.log(response.data.systemRoles, "response from API");
            setEditInputfields(response.data.systemRoles);
        } catch (err) {
            setError("Error fetching systemRole data");
        } finally {
            setLoading(false);
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
                systemRoles: editInputfields.map((item) => ({
                    recordId : item.recordId,
                    identifier: item.identifier || "",
                    shortDescription: item.shortDescription || "",
                    system: item.system,
                    status: ButtonActive,
                })),
            };
            const response = await axios.post(`${api}/admin/systemrole/edit`, body, { headers });
            router.push("/cheil/pg/systemrole");
        } catch (err) {
            console.error(err, "Error occurred while saving");
            setError("Error saving systemrole data");
        } finally {
            setLoading(false);
        }
    };


    const breadscrums = "Admin > systemrole";
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
                                            ))}
                                        </div>

                                    </div>
                                </>
                            )
                        }
                    </>)
            }


        </AddNewPageButtons>
    );
};

export default editsystemrole;
