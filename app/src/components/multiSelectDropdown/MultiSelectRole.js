// import React, { useEffect, useState } from 'react';
// import { api } from '@/envfile/api';
// import { Autocomplete, TextField } from '@mui/material';
// import axios from 'axios';

// function MultiSelectRole({ selectedRoles, setSelectedRoles }) {
//   const [roles, setRoles] = useState([]);

//   useEffect(() => {
//     getAllRoles();
//   }, []);

//   const getAllRoles = async () => {
//     try {
//       const response = await axios.get(api + '/admin/role/get');
//       setRoles(response.data.roles);
//       console.log(response.data.roles, 'roles fetched');
//     } catch (error) {
//       console.log(error, 'error fetching roles');
//     }
//   };

//   // Handle role change and map to recordId
//   const handleRoleChange = (event, newValue) => {
//     const selectedRoleIds = newValue.map((role) => ({
//       recordId: role.recordId, // Ensure that recordId is mapped correctly
//     }));
    
//     setSelectedRoles(selectedRoleIds); // Update the parent state
//     console.log('Selected roles:', selectedRoleIds); // Log selected role IDs
//   };

//   return (
//     <div className='w-full'>
//       <Autocomplete
//         multiple
//         options={roles}
//         getOptionLabel={(option) => option.identifier || ''} // Use identifier for display
//         value={selectedRoles.map(role => roles.find(r => r.recordId === role.recordId) || null)} // Map the value
//         onChange={handleRoleChange}
//         className='w-full'
//         renderInput={(params) => (
//           <TextField
//             {...params}
//             label="Select Roles"
//             variant="standard"
//             className='w-full'
//           />
//         )}
//       />
//     </div>
//   );
// }

// export default MultiSelectRole;
import React, { useEffect, useState } from 'react';
import { api } from '@/envfile/api';
import { Autocomplete, TextField } from '@mui/material';
import axios from 'axios';

function MultiSelectRole({
  selectedRoles = [], // Default to an empty array
  setSelectedRoles,
  initialload = false,
  dropdownname = "Select Roles",
}) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state

  useEffect(() => {
    if (initialload) {
      getAllRoles();
    }
  }, [initialload]);

  const getAllRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(api + '/admin/role/get');
      setRoles(response.data.roles || []);
      console.log(response.data.roles, 'roles fetched');
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (event, newValue) => {
    // Extract recordId as strings directly from the selected role objects
    const selectedRoleIds = newValue.map((role) => role.recordId.toString());
    setSelectedRoles(selectedRoleIds);
    console.log('Selected roles:', selectedRoleIds);
  };

  return (
    <div className="w-full">
      <Autocomplete
        multiple
        options={roles}
        getOptionLabel={(option) => option?.identifier || ''} // Handle undefined safely
        value={selectedRoles
          .map((roleId) => roles.find((r) => r.recordId === roleId))
          .filter(Boolean)} // Filter out null values
        onChange={handleRoleChange}
        onOpen={() => {
          if (!initialload && roles.length === 0) {
            getAllRoles(); // Fetch roles if not loaded
          }
        }}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={dropdownname}
            variant="standard"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <span>Loading...</span> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            className="w-full"
          />
        )}
      />
    </div>
  );
}

export default MultiSelectRole;
