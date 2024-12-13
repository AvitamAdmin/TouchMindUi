"use client";
import React, { useState, useRef, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useSelector } from "react-redux";
import AddNewPageButtons from '@/app/src/components/AddNewPageButtons/AddNewPageButtons';
import Listingpageforrelation from '@/app/src/components/ListingPageComponents/Listingpageforrelations';
import MultiSelectSubsidiary from '@/app/src/components/multiSelectDropdown/Subsidiary';

const Addlibrary = () => {
    const [params, setParams] = useState([]);
    const [ButtonActive, setButtonActive] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");
    const router = useRouter();
    const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
    const [selectedErrorType, setSelectedErrorType] = useState("");
    const fileInputRef = useRef(null);
    const [medias, setMedias] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [actions, setActions] = useState([]);
    const fetchFilterInputs = useSelector(
        (state) => state.tasks.fetchFilterInput
    );
    const [filterInput, setfilterInput] = useState({});

    const [formValues, setFormValues] = useState({
        identifier: '',
        shortDescription: '',
        picEmail: '',

    });

    const mediaFields = [
        { label: "Identifier", value: "identifier" },

    ];

    const libraryFields = [
        { label: "Identifier", value: "identifier" },
        { label: "ShortDescription", value: "shortDescription" },
        { label: "PIC Email", value: "picEmail" },
    ];

    const actionFields = [
        { label: "Identifier", value: "identifier" },
        { label: "ShortDescription", value: "shortDescription" },
        
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
            const response = await axios.post(`${api}/admin/media`, body, {
                headers,
            });

            setMedias(response.data.medias || []);

            const responseLibrary = await axios.post(`${api}/admin/library`, body, {
                headers,
            });
            setLibraries(responseLibrary.data.libraries);

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

    const handleErrorTypeChange = (e) => {
        const value = e.target.value;
        setSelectedErrorType(value);
    };



    const handleFileInputClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected file:", file);

    };

    const handleSaveClick = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };

            const body = {
                libraries: [
                    {
                        identifier: formValues.identifier,
                        shortDescription: formValues.shortDescription,
                        picEmail: formValues.picEmail,
                        errorType: selectedErrorType,
                        subsidiaries: selectedSubsidiary.recordId,
                        status: ButtonActive,
                    }
                ]
            };
            const response = await axios.post(`${api}/admin/library/edit`, body, { headers });
            router.push("/cheil/pg/library");
        } catch (err) {
            console.error(err, "Error occurred while saving");
            setError("Error saving library data");
        } finally {
            setLoading(false);
        }
    };

    const addnewroutepath = "/admin/media/add-media";
    const cuurentpagemodelname = "media";

    const libraryaddnewroutepath = "/admin/library/add-library";
    const librarycuurentpagemodelname = "library";

    const actionaddnewroutepath = "/admin/action/add-action";
    const actioncuurentpagemodelname = "action";

    const breadscrums = "Admin > library";
    const pagename = "Add New";

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
        <AddNewPageButtons pagename={pagename} email={email} breadscrums={breadscrums}
            handleSaveClick={handleSaveClick}>
            <div className="flex flex-col w-full p-4 min-h-screen gap-5" style={{ fontFamily: 'SamsungOne, sans-serif' }}>


                <div className='flex flex-col bg-gray-200  rounded-md shadow'>



                    <div className="bg-white p-4 rounded-md shadow-md">
                        <div className=" gap-4 grid grid-cols-4 mb-4 items-center justify-center flex flex-col">

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





                        <div className='flex flex-col gap-4'>

                            <MultiSelectSubsidiary selectedSubsidiary={selectedSubsidiary} setSelectedSubsidiary={setSelectedSubsidiary} />

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


                            <h1>Media</h1>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            <div
                                className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[150px] h-[30px]"
                                onClick={handleFileInputClick}
                            >
                                Choose file
                            </div>

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


                            <h1>Related library</h1>

                            <div>
                                {error && <div className="text-red-500 text-sm px-2">{error}</div>}
                                <Listingpageforrelation
                                    librarycuurentpagemodelname={librarycuurentpagemodelname}
                                    libraryaddnewroutepath={libraryaddnewroutepath}
                                    fields={libraryFields} // Pass the field configuration
                                    data={libraries}
                                    loading={loading}
                                />

                            </div>

                            <h1>Action </h1>

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

                            
                        </div>
                    </div>
                </div>

               
        </AddNewPageButtons>
    );
};

export default Addlibrary;
