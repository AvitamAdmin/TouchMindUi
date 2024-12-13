"use client";
import React, { useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { IoExitOutline } from 'react-icons/io5'
import TextField from '@mui/material/TextField';

export default function page() {

    const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleShortcutsClick = () => {
        setIsShortcutsModalOpen(true);
    };

    const handleImportClick = () => {
        setIsImportModalOpen(true);
    };

    const handleCloseShortcutsModal = () => {
        setIsShortcutsModalOpen(false);
    };

    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
    };


    return (
        <div className="p-4" style={{ fontFamily: 'SamsungOne, sans-serif' }}>



            <div className='flex flex-row gap-3 ml-4 mt-5 '>
                <span className='text-xs font-bold'>Finders</span>
                <span className='text-xs font-bold'>{'>'}</span>
                <span className='text-xs font-bold'>Promotion Finders</span>
            </div>


            <div className='flex flex-row '>
                <div
                    className="flex items-center justify-center mt-4 ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
                    onClick={handleShortcutsClick}

                >
                    Shortcuts
                </div>

                <div
                    className="flex items-center justify-center mt-4 ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
                    onClick={handleImportClick}

                >
                    Import
                </div>

                <div
                    className="flex items-center justify-center mt-4 ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
                    onClick={() => console.log('Save button clicked')}

                >
                    Save
                </div>


            </div>



            {isShortcutsModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-md p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">Shortcuts </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-1">Subsidiary</label>
                            <select className="w-full p-2 border rounded-md">
                                <option>Select Subsidiary</option>
                                <option>Subsidiary 1</option>
                                <option>Subsidiary 2</option>
                                <option>Subsidiary 3</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-1">Select Sites</label>
                            <select className="w-full p-2 border rounded-md">
                                <option>Select Site</option>
                                <option>Site 1</option>
                                <option>Site 2</option>
                                <option>Site 3</option>
                            </select>
                        </div>

                        <div className='mb-4'>
                            <TextField label="Enter Voucher code" variant="standard" fullWidth />
                        </div>

                        <div className="flex justify-end">
                            <div
                                className="bg-gray-300 p-2 rounded-md mr-2"
                                onClick={handleCloseShortcutsModal}
                            >
                                Cancel
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {isImportModalOpen && (
                
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-md p-6 w-96">
                        <h2 className="text-lg font-bold mb-4"> Import SKUs </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-1">Subsidiary</label>
                            <select className="w-full p-2 border rounded-md">
                                <option>Select Subsidiary</option>
                                <option>Subsidiary 1</option>
                                <option>Subsidiary 2</option>
                                <option>Subsidiary 3</option>
                            </select>
                        </div>


                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-1">Select Sites</label>
                            <select className="w-full p-2 border rounded-md">
                                <option>Select Site</option>
                                <option>Site 1</option>
                                <option>Site 2</option>
                                <option>Site 3</option>
                            </select>
                        </div>


                        <div className='mb-4'>
                            <TextField label="Enter Voucher code" variant="standard" fullWidth />
                        </div>


                        <div className="flex justify-end">
                            <div
                                className="bg-gray-300 p-2 rounded-md mr-2"
                                onClick={handleCloseImportModal}
                            >
                                Cancel
                            </div>

                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}
