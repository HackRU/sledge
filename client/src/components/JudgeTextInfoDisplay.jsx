import React from "react";
import { TextField, Box } from "@mui/material";

export default function JudgeTextInfoDisplay(){
    /*
    We need 3 input fields which will display the labels:
    1. Team Name
    2. Member Names
    3. description 
    4. devpost link

    */
    return(
        <div>
                <Box
                        component="form"
                        sx={{
                            display: 'flex',
                        }}
                        noValidate
                        autoComplete="off"
                    />
                <div>
                    <TextField 
                    id="filled-basic" 
                    label="Team Name" 
                    InputProps={{
                        readOnly: true,
                    }}
                    defaultValue="DeezNuts"
                    />
                    <TextField 
                        id="filled-basic" 
                        label="Member Names" 
                        variant="filled" 
                        InputProps={{
                            readOnly: true,
                        }}
                        />
                </div>
                <div>
                <TextField
                        id="outlined-multiline-flexible"
                        label="Submission Description"
                        multiline
                        maxRows={4}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                <TextField
                    id="filled-basic" 
                    label="DevPost Link" 
                    variant="filled" 
                    InputProps={{
                        readOnly: true,
                    }}
                    />
                </div>
        </div>
    );
}